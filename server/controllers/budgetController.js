import Department from "../models/Department.js";
import BudgetRequest from "../models/BudgetRequest.js";
import Employee from "../models/Employee.js";
import { audit, notifyManagers } from "../utils/workflowEvents.js";
import { lockBudget, budgetUsage } from "../utils/budgetHelpers.js";
import { getMonthText } from "../utils/dateHelpers.js";
import { readAmount, isValidMonth } from "../utils/payrollHelpers.js";
import { readEmployeeDetails } from "../utils/employeeDetails.js";
import transaction from "../utils/transaction.js";

// Shows monthly commitments beside the existing department records.
async function getBudgets(request, response) {
  try {
    const month = request.query.month || getMonthText();
    if (!isValidMonth(month)) throw new Error("Choose a valid month.");
    const rows = [];
    for (const department of await Department.find()) rows.push({ department, month, ...await budgetUsage(department, month, null) });
    response.json({ rows, requests: await BudgetRequest.find().populate("department", "name").sort({ createdAt: -1 }).limit(100) });
  } catch (error) { response.status(400).json({ message: error.message }); }
}

// Saves expenses immediately only within available monthly commitments.
async function createExpense(request, response) {
  try {
    const { department: id, month, reason } = request.body;
    const amount = readAmount(request.body.amount);
    if (!isValidMonth(month) || amount === null || amount <= 0 || !reason?.trim()) throw new Error("Enter a month, positive amount and justification.");
    const saved = await transaction(async (session) => {
      const department = await lockBudget(id, session);
      const usage = await budgetUsage(department, month, session, { expense: amount });
      const [item] = await BudgetRequest.create([{ department: id, month, amount, kind: "Expense", reason: reason.trim(),
        status: usage.exceeded ? "Pending approval" : "Approved", createdBy: request.user.userId }], { session });
      await audit(session, request.user.userId, "expense.request", "BudgetRequest", item._id, null, item.toObject(), reason);
      if (usage.exceeded || usage.percent >= 80) await notifyManagers(session, department, `${department.name}: ${usage.exceeded ? "expense pending budget approval" : `budget usage ${usage.percent}%`}.`, "/departments");
      return item;
    });
    response.status(201).json(saved);
  } catch (error) { response.status(400).json({ message: error.message }); }
}

// Admin adjustments and reallocations require justification and preserve both events.
async function adjustBudget(request, response) {
  try {
    const amount = readAmount(request.body.budget);
    const { reason, fromDepartment, month = getMonthText() } = request.body;
    if (amount === null || !isValidMonth(month) || !reason?.trim()) throw new Error("Enter a valid budget, month and justification.");
    await transaction(async (session) => {
      const target = await lockBudget(request.params.id, session);
      const before = target.toObject();
      if (fromDepartment) {
        if (String(target._id) === fromDepartment) throw new Error("Choose a different source department.");
        const delta = amount - target.budget;
        if (delta <= 0) throw new Error("A reallocation must increase the target budget.");
        const source = await lockBudget(fromDepartment, session);
        const sourceBefore = source.toObject();
        const usage = await budgetUsage(source, month, session);
        if (source.budget - delta < usage.committed) throw new Error("The source department needs its committed budget.");
        source.budget -= delta; await source.save({ session });
        await audit(session, request.user.userId, "budget.reallocate.out", "Department", source._id, sourceBefore, source.toObject(), reason);
        await notifyManagers(session, source, `${source.name}: budget reallocated by Admin.`, "/departments");
      }
      target.budget = amount; target.budgetPeriod = "monthly"; await target.save({ session });
      await audit(session, request.user.userId, "budget.adjust", "Department", target._id, before, target.toObject(), reason);
      const usage = await budgetUsage(target, month, session);
      await notifyManagers(session, target, `${target.name}: monthly budget updated.${usage.exceeded ? " Existing salaries remain flagged for finance attention." : ""}`, "/departments");
    });
    response.json({ message: "Budget updated with justification." });
  } catch (error) { response.status(400).json({ message: error.message }); }
}

// Converts approved proposals into real commitments only after a fresh locked check.
async function decideRequest(request, response) {
  try {
    const { decision, reason, confirmed } = request.body;
    if (!["Approved", "Rejected"].includes(decision) || !reason?.trim() || confirmed !== true) throw new Error("Confirm a decision and justification.");
    await transaction(async (session) => {
      const item = await BudgetRequest.findById(request.params.id).session(session);
      if (!item || item.status !== "Pending approval") throw new Error("Request is no longer pending.");
      const department = await lockBudget(item.department, session);
      if (decision === "Approved") {
        const current = item.employee ? await Employee.findById(item.employee).session(session) : null;
        if (current && String(current.department) !== String(item.department)) await lockBudget(current.department, session);
        const proposal = item.kind === "Expense" ? { expense: item.amount } : (item.kind === "Hire" || (current && String(current.department) !== String(item.department))) ? { hireSalary: item.amount } : { changedEmployeeId: String(item.employee), salary: item.amount };
        const usage = await budgetUsage(department, item.kind === "Expense" ? item.month : getMonthText(), session, proposal);
        if (usage.exceeded) throw new Error("Adjust or reallocate the budget before approving.");
        if (item.kind !== "Expense") {
          const details = await readEmployeeDetails(item.details);
          if (item.kind === "Hire") await Employee.create([details], { session });
          else {
            const employee = await Employee.findById(item.employee).session(session);
            if (!employee || employee.updatedAt.toISOString() !== item.details.expectedUpdatedAt) throw new Error("Employee changed since this request. Reject it and submit a new request.");
            Object.assign(employee, details); await employee.save({ session });
          }
        }
      }
      const before = item.toObject();
      Object.assign(item, { status: decision, decidedBy: request.user.userId, decidedAt: new Date(), decisionReason: reason.trim() });
      await item.save({ session });
      await audit(session, request.user.userId, `budget.request.${decision.toLowerCase()}`, "BudgetRequest", item._id, before, item.toObject(), reason);
      await notifyManagers(session, department, `${item.kind}: ${decision}.`, "/departments");
    });
    response.json({ message: "Decision recorded." });
  } catch (error) { response.status(400).json({ message: error.message }); }
}
export { getBudgets, createExpense, adjustBudget, decideRequest };
