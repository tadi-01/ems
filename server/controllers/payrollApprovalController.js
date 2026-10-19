import Payroll from "../models/Payroll.js";
import Notification from "../models/Notification.js";
import Employee from "../models/Employee.js";
import Settings from "../models/Settings.js";
import { plannedDates } from "../utils/payrollSchedule.js";
import transaction from "../utils/transaction.js";
import { lockBudget, budgetUsage } from "../utils/budgetHelpers.js";
import { audit, notifyManagers } from "../utils/workflowEvents.js";

// Approves or rejects the exact revision re-confirmed by an Admin.
async function decidePayroll(request, response) {
  try {
    const { decision, reason, confirmed, revision } = request.body;
    if (!["Approved", "Rejected"].includes(decision) || confirmed !== true) throw new Error("Confirm the decision before submitting.");
    const saved = await transaction(async (session) => {
      const slip = await Payroll.findById(request.params.id).session(session);
      if (!slip || slip.$isDefault("status") || slip.status !== "Pending approval") throw new Error("This payroll is no longer pending.");
      if (slip.revision !== revision) throw new Error("Payroll changed. Refresh and review it again.");
      const department = await lockBudget(slip.department, session);
      const usage = await budgetUsage(department, slip.month, session, { employeeId: String(slip.employee), month: slip.month, amounts: slip });
      if (decision === "Approved" && usage.exceeded) throw new Error("Monthly commitments exceed the budget. Admin must adjust/reallocate the budget first. Existing salaries remain pending and flagged.");
      const before = slip.toObject();
      const settings = await Settings.findById("company").session(session) || new Settings();
      if (decision === "Approved") slip.paymentDate = plannedDates(settings, slip.month).plannedPayment;
      Object.assign(slip, { status: decision, requiresReview: false, approvedBy: request.user.userId, approvedAt: new Date(), decisionReason: reason?.trim() || "", budgetExceeded: usage.exceeded });
      await slip.save({ session });
      await audit(session, request.user.userId, `payroll.${decision.toLowerCase()}`, "Payroll", slip._id, before, slip.toObject(), reason?.trim() || "");
      await notifyManagers(session, department, `Payroll for ${slip.month}: ${decision}.`, "/payroll");
      const employee = await Employee.findById(slip.employee).session(session);
      if (decision === "Approved" && employee?.user) await Notification.create([{ recipient: employee.user, message: `Your ${slip.month} payslip is available. Approval does not record payment.`, path: "/payroll" }], { session });
      return slip;
    });
    response.json(saved);
  } catch (error) { response.status(400).json({ message: error.message }); }
}
export { decidePayroll };
