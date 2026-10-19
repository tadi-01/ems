import Employee from "../models/Employee.js";
import BudgetRequest from "../models/BudgetRequest.js";
import { lockBudget, budgetUsage } from "./budgetHelpers.js";
import { audit, notifyManagers } from "./workflowEvents.js";
import { getMonthText } from "./dateHelpers.js";
import transaction from "./transaction.js";

// Holds over-budget hires and salary changes without altering the active employee record.
async function saveBudgetedEmployee(details, id, actor) {
  return transaction(async (session) => {
    const old = id ? await Employee.findById(id).session(session) : null;
    if (id && !old) throw new Error("Employee not found.");
    if (old && String(old.department) !== String(details.department)) await lockBudget(old.department, session);
    const department = await lockBudget(details.department, session);
    const draft = new Employee({ ...(old?.toObject() || {}), ...details });
    await draft.validate();
    const sameDepartment = old && String(old.department) === String(details.department);
    const proposal = sameDepartment ? { changedEmployeeId: String(id), salary: draft.salary } : { hireSalary: draft.salary };
    const usage = await budgetUsage(department, getMonthText(), session, proposal);
    const costIncrease = !old || !sameDepartment || draft.salary > old.salary;
    if (costIncrease && usage.exceeded) {
      const pending = await BudgetRequest.findOne({ kind: id ? "Employee change" : "Hire", status: "Pending approval", "details.employeeId": draft.employeeId }).session(session);
      if (pending) throw new Error("This employee already has a pending budget request.");
      const [item] = await BudgetRequest.create([{ department: department._id, kind: id ? "Employee change" : "Hire", employee: id,
        month: getMonthText(), amount: draft.salary, details: { ...details, expectedUpdatedAt: old?.updatedAt.toISOString() },
        reason: "Monthly salary commitment exceeds the department budget.", createdBy: actor }], { session });
      await audit(session, actor, "employee.pending", "BudgetRequest", item._id, old?.toObject(), item.toObject());
      await notifyManagers(session, department, `${draft.name}: ${id ? "employee change" : "hire"} awaits budget approval.`, "/departments");
      return { pendingApproval: true, message: "Saved as pending budget approval. The employee record has not changed.", request: item };
    }
    const before = old?.toObject();
    let saved;
    if (old) { Object.assign(old, details); saved = await old.save({ session }); }
    else [saved] = await Employee.create([details], { session });
    await audit(session, actor, id ? "employee.update" : "employee.create", "Employee", saved._id, before, saved.toObject());
    if (usage.percent >= 80) await notifyManagers(session, department, `${department.name}: monthly budget usage ${usage.percent}%.`, "/departments");
    return saved;
  });
}
export default saveBudgetedEmployee;
