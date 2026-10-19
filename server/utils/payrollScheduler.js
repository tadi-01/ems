import sendPayrollReminders from "./payrollReminders.js";
import { plannedDates } from "./payrollSchedule.js";
import Settings from "../models/Settings.js";
import Employee from "../models/Employee.js";
import Payroll from "../models/Payroll.js";
import { getTodayText } from "./dateHelpers.js";
import transaction from "./transaction.js";
import { lockBudget, budgetUsage } from "./budgetHelpers.js";
import { audit, notifyManagers } from "./workflowEvents.js";
let running = false;

// Creates missing current-month drafts after the configured preparation day.
async function prepareScheduledPayroll() {
  if (running) return;
  running = true;
  try {
    const settings = await Settings.findById("company");
    const today = getTodayText(), month = today.slice(0, 7);
    if (settings) await sendPayrollReminders(settings, today);
    if (!settings?.automaticPreparation || !settings.updatedBy || today < plannedDates(settings, month).preparation) return;
    for (const employee of await Employee.find({ joiningDate: { $lte: new Date(`${today}T23:59:59Z`) } })) {
      try {
        await transaction(async (session) => {
          const department = await lockBudget(employee.department, session);
          if (await Payroll.exists({ employee: employee._id, month }).session(session)) return;
          const usage = await budgetUsage(department, month, session);
          const [slip] = await Payroll.create([{ employee: employee._id, department: employee.department, month,
            basicSalary: employee.salary, netSalary: employee.salary, createdBy: settings.updatedBy,
            employeeSnapshot: { name: employee.name, employeeId: employee.employeeId, designation: employee.designation },
            scheduled: true, requiresReview: false, budgetExceeded: usage.exceeded,
            companyName: process.env.COMPANY_NAME || "", currency: process.env.PAYROLL_CURRENCY || "" }], { session });
          await audit(session, settings.updatedBy, "payroll.scheduled.prepare", "Payroll", slip._id, null, slip.toObject(), "Automatic preparation; deductions require review before approval.");
          await notifyManagers(session, department, `${employee.name}: ${month} payroll awaits approval.${usage.exceeded ? " Budget exceeded; existing salary flagged." : ""}`, "/payroll");
        });
      } catch (error) { if (error.code !== 11000) throw error; }
    }
  } catch (error) { console.error("Scheduled payroll preparation failed:", error.message); }
  finally { running = false; }
}

// Polling is safe across restarts/instances because employee-month indexes prevent duplicates.
function startPayrollScheduler() {
  prepareScheduledPayroll();
  const timer = setInterval(prepareScheduledPayroll, 60000); timer.unref();
}
export { prepareScheduledPayroll, startPayrollScheduler };
