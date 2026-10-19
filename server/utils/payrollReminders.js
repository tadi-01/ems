import WorkflowRun from "../models/WorkflowRun.js";
import Payroll from "../models/Payroll.js";
import { plannedDates } from "./payrollSchedule.js";
import { notifyManagers } from "./workflowEvents.js";
import transaction from "./transaction.js";

// Reminds finance and HR about deadlines without initiating or confirming a payment.
async function sendPayrollReminders(settings, today) {
  const month = today.slice(0, 7), dates = plannedDates(settings, month);
  const reminders = [
    ["approval", dates.approvalDue, `Payroll approval deadline ${dates.approvalDue}. Review pending payroll; existing salaries must be escalated if over budget.`],
    ["payment-plan", dates.plannedPayment, `Planned payroll payment date ${dates.plannedPayment}. Payment and reconciliation are handled outside EMS.`],
  ];
  for (const [kind, due, message] of reminders) {
    if (today < due) continue;
    try {
      await transaction(async (session) => {
        const id = `${month}-${kind}`;
        if (await WorkflowRun.exists({ _id: id }).session(session)) return;
        if (!await Payroll.exists({ month, status: { $in: ["Pending approval", "Approved"] } }).session(session)) return;
        await WorkflowRun.create([{ _id: id }], { session });
        await notifyManagers(session, null, message, "/payroll");
      });
    } catch (error) { if (error.code !== 11000) throw error; }
  }
}
export default sendPayrollReminders;
