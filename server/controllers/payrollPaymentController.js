import Settings from "../models/Settings.js";
import transaction from "../utils/transaction.js";
import { lockBudget } from "../utils/budgetHelpers.js";
import { audit, notifyManagers } from "../utils/workflowEvents.js";
import { batchVersion, departmentSlips } from "../utils/departmentPayroll.js";
import { getTodayText } from "../utils/dateHelpers.js";
import { isValidMonth } from "../utils/payrollHelpers.js";
import { plannedDates } from "../utils/payrollSchedule.js";

// Records explicit confirmation of a completed external payment; never transfers funds.
async function recordDepartmentPayment(request, response) {
  try {
    const { month, version, reference, confirmed } = request.body;
    if (!isValidMonth(month) || !reference?.trim() || confirmed !== true) throw new Error("Confirm completed external payment and supply its reference.");
    await transaction(async (session) => {
      const department = await lockBudget(request.params.department, session);
      const slips = await departmentSlips(department._id, month, session);
      if (batchVersion(slips) !== version) throw new Error("Payroll changed. Refresh before recording payment.");
      const unpaid = slips.filter((slip) => slip.status === "Approved" && !slip.paidAt);
      if (!unpaid.length) throw new Error("No approved unpaid payroll to record.");
      const settings = await Settings.findById("company").session(session) || new Settings();
      for (const slip of unpaid) {
        if (getTodayText() < (slip.paymentDate || plannedDates(settings, month).plannedPayment)) throw new Error("The configured payment date has not arrived.");
        const before = slip.toObject();
        Object.assign(slip, { paidAt: new Date(), paymentReference: reference.trim(), paymentRecordedBy: request.user.userId });
        await slip.save({ session });
        await audit(session, request.user.userId, "payroll.external-payment.record", "Payroll", slip._id, before, slip.toObject(), reference.trim());
      }
      await notifyManagers(session, department, `${department.name} ${month}: completed external payment recorded.`, "/payroll");
    });
    response.json({ message: "External payment recorded for all approved unpaid records in this department." });
  } catch (error) { response.status(400).json({ message: error.message }); }
}
export { recordDepartmentPayment };
