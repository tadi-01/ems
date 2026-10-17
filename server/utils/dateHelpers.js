// Returns today's date as text (YYYY-MM-DD), for example 2026-10-17.
// Attendance stores its date this way so each day has one record.
// This uses the server clock in UTC, which is fine for a course project.
function getTodayText() {
  return new Date().toISOString().slice(0, 10);
}

// Returns the current month as text (YYYY-MM), for example 2026-10.
// Payroll stores its month this way so each month has one payslip.
function getMonthText() {
  return getTodayText().slice(0, 7);
}

export { getTodayText, getMonthText };
