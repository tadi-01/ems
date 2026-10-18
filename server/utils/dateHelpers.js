// Returns the company calendar date independently of the server's time zone.
function getTodayText(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: process.env.COMPANY_TIME_ZONE || "Africa/Harare",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).format(date);
}

// Uses the same company date for payroll months and dashboard totals.
function getMonthText(date = new Date()) {
  return getTodayText(date).slice(0, 7);
}

// Rejects impossible dates and timestamps where a calendar date is required.
function isValidDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value);
  return !isNaN(date) && date.toISOString().slice(0, 10) === value;
}

export { getTodayText, getMonthText, isValidDate };
