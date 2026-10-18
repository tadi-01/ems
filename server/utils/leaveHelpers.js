import Leave from "../models/Leave.js";

import { getLeavePolicy } from "./leavePolicy.js";

// Counts calendar days from the start date to the end date, including both days.
// For example 2026-10-20 to 2026-10-22 is 3 days.
function countLeaveDays(startDate, endDate, policy = getLeavePolicy()) {
  let days = 0;
  for (let date = new Date(startDate); date <= endDate; date.setUTCDate(date.getUTCDate() + 1)) {
    const weekend = date.getUTCDay() === 0 || date.getUTCDay() === 6;
    const holiday = policy.holidays.includes(date.toISOString().slice(0, 10));
    if (policy.dayMode === "calendar" || (!weekend && !holiday)) days += 1;
  }
  return days;
}

// Returns the first moment of a year and the first moment of the next year.
// Leave that starts between these two moments belongs to that year.
function getYearRange(year) {
  return {
    start: new Date(Date.UTC(year, 0, 1)),
    end: new Date(Date.UTC(year + 1, 0, 1)),
  };
}

// Adds up the days of Approved Annual leave an employee has used in a year.
// The balance is calculated each time, so there is no stored counter to go wrong.
async function getUsedAnnualDays(employeeId, year) {
  const range = getYearRange(year);
  const leaves = await Leave.find({
    employee: employeeId,
    leaveType: "Annual",
    status: "Approved",
    startDate: { $gte: range.start, $lt: range.end },
  });

  let usedDays = 0;
  for (const leave of leaves) {
    usedDays += leave.days;
  }
  return usedDays;
}

// Returns how many Annual leave days an employee still has in a year.
async function getRemainingAnnualDays(employeeId, year) {
  const usedDays = await getUsedAnnualDays(employeeId, year);
  return getLeavePolicy().annualAllowance - usedDays;
}

export {
  countLeaveDays,
  getYearRange,
  getRemainingAnnualDays,
};
