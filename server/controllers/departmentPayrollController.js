import Payroll from "../models/Payroll.js";
import Employee from "../models/Employee.js";
import Department from "../models/Department.js";
import Settings from "../models/Settings.js";
import Notification from "../models/Notification.js";
import transaction from "../utils/transaction.js";
import { lockBudget, budgetUsage } from "../utils/budgetHelpers.js";
import { audit, notifyManagers } from "../utils/workflowEvents.js";
import { batchVersion, departmentSlips, paymentState } from "../utils/departmentPayroll.js";
import { plannedDates } from "../utils/payrollSchedule.js";
import { getTodayText } from "../utils/dateHelpers.js";
import { isValidMonth } from "../utils/payrollHelpers.js";

// Lists every department for a selected pay month, including unprepared departments.
async function getDepartmentPayroll(request, response) {
  try {
    const { month } = request.query;
    if (!isValidMonth(month)) throw new Error("Choose a payroll month.");
    const settings = await Settings.findById("company") || new Settings();
    const dates = plannedDates(settings, month), today = getTodayText();
    const slips = await Payroll.find({ month }).populate("employee", "name employeeId department").lean();
    const end = new Date(`${month}-01T00:00:00Z`); end.setUTCMonth(end.getUTCMonth() + 1);
    const employees = await Employee.find({ joiningDate: { $lt: end } }).lean();
    const departments = await Department.find().lean();
    response.json(departments.map((department) => {
      const rows = slips.filter((slip) => String(slip.department || slip.employee?.department) === String(department._id));
      return { department, dates, version: batchVersion(rows.filter((slip) => slip.department)), missing: employees.filter((employee) => String(employee.department) === String(department._id) && !rows.some((slip) => String(slip.employee?._id) === String(employee._id))).length,
        slips: rows.map((slip) => ({ ...slip, paymentState: paymentState(slip, today, dates.plannedPayment) })) };
    }));
  } catch (error) { response.status(400).json({ message: error.message }); }
}

// Prepares missing payslips together without overwriting bonuses or existing payroll.
async function prepareDepartmentPayroll(request, response) {
  try {
    const { month } = request.body;
    if (!isValidMonth(month)) throw new Error("Choose a payroll month.");
    await transaction(async (session) => {
      const department = await lockBudget(request.params.department, session);
      const end = new Date(`${month}-01T00:00:00Z`); end.setUTCMonth(end.getUTCMonth() + 1);
      const employees = await Employee.find({ department: department._id, joiningDate: { $lt: end } }).session(session);
      const usage = await budgetUsage(department, month, session);
      for (const employee of employees) {
        if (await Payroll.exists({ employee: employee._id, month }).session(session)) continue;
        const [slip] = await Payroll.create([{ employee: employee._id, department: department._id, month,
          basicSalary: employee.salary, netSalary: employee.salary, requiresReview: true, budgetExceeded: usage.exceeded, createdBy: request.user.userId,
          employeeSnapshot: { name: employee.name, employeeId: employee.employeeId, designation: employee.designation },
          companyName: process.env.COMPANY_NAME || "", currency: process.env.PAYROLL_CURRENCY || "" }], { session });
        await audit(session, request.user.userId, "payroll.department.prepare", "Payroll", slip._id, null, slip.toObject());
      }
      await notifyManagers(session, department, `${department.name}: ${month} payroll prepared for bonuses, deductions and approval.`, "/payroll");
    });
    response.json({ message: "Missing department payroll prepared. Review bonuses and deductions before approval." });
  } catch (error) { response.status(400).json({ message: error.message }); }
}

// Reviews or approves an entire department atomically, checking the exact batch version.
async function decideDepartmentPayroll(request, response) {
  try {
    const { month, version, reason, confirmed, decision } = request.body;
    if (!isValidMonth(month) || !reason?.trim() || confirmed !== true || !["Approved", "Rejected"].includes(decision)) throw new Error("Confirm the month, decision and justification.");
    await transaction(async (session) => {
      const department = await lockBudget(request.params.department, session);
      const slips = await departmentSlips(department._id, month, session);
      if (batchVersion(slips) !== version) throw new Error("Department payroll changed. Refresh and review again.");
      const pending = slips.filter((slip) => !slip.$isDefault("status") && slip.status === "Pending approval");
      if (!pending.length) throw new Error("No pending payroll in this department.");
      if (decision === "Approved") {
        const end = new Date(`${month}-01T00:00:00Z`); end.setUTCMonth(end.getUTCMonth() + 1);
        const employees = await Employee.find({ department: department._id, joiningDate: { $lt: end } }).session(session);
        const records = await Payroll.find({ month, employee: { $in: employees.map((employee) => employee._id) } }).session(session);
        if (employees.some((employee) => !records.some((slip) => String(slip.employee) === String(employee._id) && !["Voided", "Rejected"].includes(slip.status)))) throw new Error("Prepare missing payroll and revise rejected or voided records before department review.");
      }
      const settings = await Settings.findById("company").session(session) || new Settings();
      for (const slip of pending) {
        const before = slip.toObject();
        Object.assign(slip, { status: decision, requiresReview: false, approvedBy: request.user.userId, approvedAt: new Date(), decisionReason: reason.trim(), paymentDate: plannedDates(settings, month).plannedPayment });
        await slip.save({ session });
        await audit(session, request.user.userId, `payroll.department.decision`, "Payroll", slip._id, before, slip.toObject(), reason);
        if (decision === "Approved") {
          const employee = await Employee.findById(slip.employee).session(session);
          if (employee?.user) await Notification.create([{ recipient: employee.user, message: `Your ${month} payslip is approved. Payment is tracked separately.`, path: "/payroll" }], { session });
        }
      }
      if (decision === "Approved" && (await budgetUsage(department, month, session)).exceeded) throw new Error("Combined department payroll exceeds its monthly budget. Adjust the budget first; salaries remain pending.");
      await notifyManagers(session, department, `${department.name} ${month}: ${request.user.role} ${decision === "Approved" ? "approved payroll" : "rejected payroll"}.`, "/payroll");
    });
    response.json({ message: "Department decision recorded." });
  } catch (error) { response.status(400).json({ message: error.message }); }
}
export { getDepartmentPayroll, prepareDepartmentPayroll, decideDepartmentPayroll };
