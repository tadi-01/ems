import { getMonthText } from "./dateHelpers.js";

// Uses calendar dates to plan payroll; weekends and configured holidays are excluded.
function plannedDates(settings, month = getMonthText()) {
  const date = (day) => `${month}-${String(day).padStart(2, "0")}`;
  let day = settings.paymentDay || 28;
  if (settings.paymentRule !== "fixed-day") {
    const [year, number] = month.split("-").map(Number);
    day = new Date(Date.UTC(year, number, 0)).getUTCDate();
    while (day > 0) {
      const weekday = new Date(`${date(day)}T12:00:00Z`).getUTCDay();
      if (weekday !== 0 && weekday !== 6 && !settings.holidays.includes(date(day))) break;
      day -= 1;
    }
    if (!day) throw new Error("This month has no available working day.");
  }
  return { preparation: date(settings.paymentRule === "fixed-day" ? settings.preparationDay : Math.min(settings.preparationDay, day)), approvalDue: date(settings.paymentRule === "fixed-day" ? settings.approvalDay : Math.min(settings.approvalDay, day)), plannedPayment: date(day) };
}
export { plannedDates };
