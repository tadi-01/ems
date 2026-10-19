import Employee from "../models/Employee.js";
import Payroll from "../models/Payroll.js";
import getEmployeeForUser from "../utils/getEmployeeForUser.js";
import { isValidMonth, readPayslipAmounts } from "../utils/payrollHelpers.js";
import transaction from "../utils/transaction.js";
import { audit, notifyManagers } from "../utils/workflowEvents.js";
import { lockBudget, budgetUsage } from "../utils/budgetHelpers.js";
const employeeFields = "name employeeId";

// Prepares a monthly record for Admin approval; excess costs remain visible and pending.
async function createPayslip(request, response) {
  try {
    const { employee: id, month } = request.body;
    if (!isValidMonth(month)) throw new Error("Choose a valid YYYY-MM month.");
    const saved = await transaction(async (session) => {
      const employee = await Employee.findById(id).session(session);
      if (!employee) throw new Error("Employee not found.");
      const { amounts, error } = readPayslipAmounts(request.body, employee.salary);
      if (error) throw new Error(error);
      const department = await lockBudget(employee.department, session);
      const usage = await budgetUsage(department, month, session, { employeeId: String(id), month, amounts });
      const [slip] = await Payroll.create([{ employee: id, department: department._id, month, ...amounts,
        employeeSnapshot: { name: employee.name, employeeId: employee.employeeId },
        budgetExceeded: usage.exceeded, createdBy: request.user.userId,
        companyName: process.env.COMPANY_NAME || "", currency: process.env.PAYROLL_CURRENCY || "" }], { session });
      await audit(session, request.user.userId, "payroll.prepare", "Payroll", slip._id, null, slip.toObject());
      await notifyManagers(session, department, `Payroll for ${employee.name} (${month}) awaits approval.${usage.exceeded ? " Budget exceeded: existing salary requires finance attention." : usage.percent >= 80 ? ` Budget usage ${usage.percent}%.` : ""}`, "/payroll");
      return slip;
    });
    response.status(201).json(await saved.populate("employee", employeeFields));
  } catch (error) { response.status(400).json({ message: error.code === 11000 ? "A payslip for this employee and month already exists." : error.message }); }
}

// Revises only pending/rejected records and preserves omitted monetary fields.
async function updatePayslip(request, response) {
  try {
    const saved = await transaction(async (session) => {
      const slip = await Payroll.findById(request.params.id).session(session);
      if (!slip) throw new Error("Payslip not found.");
      if (slip.$isDefault("status") || !["Pending approval", "Rejected", "Voided"].includes(slip.status)) throw new Error("Approved and historical payslips cannot be edited.");
      const before = slip.toObject();
      const { amounts, error } = readPayslipAmounts({ ...before, ...request.body }, slip.basicSalary);
      if (error) throw new Error(error);
      const department = await lockBudget(slip.department, session);
      const usage = await budgetUsage(department, slip.month, session, { employeeId: String(slip.employee), month: slip.month, amounts });
      Object.assign(slip, amounts, { status: "Pending approval", requiresReview: false, hrReviewedRevision: undefined, hrReviewedBy: undefined, hrReviewedAt: undefined, budgetExceeded: usage.exceeded, updatedBy: request.user.userId });
      slip.revision += 1; await slip.save({ session });
      await audit(session, request.user.userId, "payroll.revise", "Payroll", slip._id, before, slip.toObject());
      await notifyManagers(session, department, `Revised payroll (${slip.month}) requires approval.`, "/payroll");
      return slip;
    });
    response.json(await saved.populate("employee", employeeFields));
  } catch (error) { response.status(400).json({ message: error.message }); }
}

// Voids a pending record without erasing its financial history.
async function deletePayslip(request, response) {
  try {
    await transaction(async (session) => {
      const slip = await Payroll.findById(request.params.id).session(session);
      if (!slip || slip.$isDefault("status") || !["Pending approval", "Rejected"].includes(slip.status)) throw new Error("Only pending or rejected payroll can be voided.");
      await lockBudget(slip.department, session);
      const before = slip.toObject(); slip.status = "Voided"; await slip.save({ session });
      await audit(session, request.user.userId, "payroll.void", "Payroll", slip._id, before, slip.toObject());
    });
    response.json({ message: "Payroll voided; history retained." });
  } catch (error) { response.status(400).json({ message: error.message }); }
}

// Management lists include pending records; month filtering is unchanged.
async function getAllPayslips(request, response) {
  try { response.json(await Payroll.find(request.query.month ? { month: request.query.month } : {}).populate("employee", employeeFields).sort({ month: -1, createdAt: -1 }).lean()); }
  catch { response.status(500).json({ message: "Could not load payslips." }); }
}

// Existing historical slips remain accessible; new records release only on approval.
async function getMyPayslips(request, response) {
  try {
    const employee = await getEmployeeForUser(request);
    if (!employee) return response.status(404).json({ message: "Ask Admin or HR to link your account on the Employees page." });
    response.json(await Payroll.find({ employee: employee._id, $or: [{ status: "Approved" }, { status: { $exists: false } }] }).populate("employee", employeeFields).sort({ month: -1 }).lean());
  } catch { response.status(500).json({ message: "Could not load your payslips." }); }
}
export { createPayslip, updatePayslip, deletePayslip, getAllPayslips, getMyPayslips };
