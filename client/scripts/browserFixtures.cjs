// Deterministic fixtures keep browser verification away from real employee data.
function fixtures(role) {
  const user = { id: "user1", _id: "user1", name: "Alex Morgan", email: "alex@example.test", role };
  const employee = { _id: "employee1", employeeId: "EMP001", name: user.name, designation: "Operations coordinator",
    email: user.email, phone: "0770000000", joiningDate: "2026-01-01", salary: 1200,
    department: { _id: "department1", name: "Operations" } };
  const department = { _id: "department1", name: "Operations", manager: user, budget: 15000, employeeCount: 1 };
  const attendance = { _id: "attendance1", employee, date: "2026-10-18", checkIn: "2026-10-18T06:00:00Z", checkOut: "2026-10-18T14:00:00Z", workingHours: 8 };
  const leave = { _id: "leave1", employee, leaveType: "Annual", startDate: "2026-11-01", endDate: "2026-11-03", days: 3, reason: "Family time", status: "Pending" };
  const payslip = { _id: "payroll1", employee, month: "2026-10", basicSalary: 1200, allowances: 50, bonuses: 0, deductions: 0, tax: 100, netSalary: 1150, createdAt: "2026-10-18", companyName: "Employee Management", currency: "USD" };
  return { user, employee, department, attendance, leave, payslip };
}

// Responds only with local fixtures; failure modes test recovery and preservation of input.
async function respond(route, data, mode) {
  const path = new URL(route.request().url()).pathname.replace("/api", "");
  if ((path === "/dashboard" && mode.dashboardError) || (path === "/employees" && route.request().method() === "POST")) {
    return route.fulfill({ status: 500, json: { message: "Verification error. Please try again." } });
  }
  if (path === "/auth/register") return route.fulfill({ status: 400, json: { message: "This email is already registered." } });
  const { user, employee, department, attendance, leave, payslip } = data;
  const body = path === "/payroll/departments" ? [{ department, dates: { plannedPayment: "2026-10-30" }, version: "fixture", missing: 0, slips: [{ ...payslip, paymentState: "Awaiting approval" }] }] : path === "/payroll/schedule" ? { preparation: "2026-10-25", approvalDue: "2026-10-28", plannedPayment: "2026-10-30", automaticPreparation: false } : path === "/workflow/notifications" ? { items: [], unread: 0 } : path === "/budgets" ? { rows: [{ department, month: "2026-10", budget: 15000, committed: 1200, remaining: 13800, percent: 8, exceeded: false }], requests: [] } : path === "/settings" ? { settings: { preparationDay: 25, approvalDay: 28, paymentRule: "last-working-day", paymentDay: 28, holidays: [], automaticPreparation: false }, dates: { preparation: "2026-10-25", approvalDue: "2026-10-28", plannedPayment: "2026-10-30" }, timeZone: "Africa/Harare" } : path === "/auth/me" ? { user } : path === "/dashboard" ? {
    date: "2026-10-18", month: "2026-10", totalEmployees: 1, presentToday: 1, onLeaveToday: 0,
    monthlyPayroll: 1150, employeesPerDepartment: [{ _id: "department1", name: "Operations", count: 1 }],
  } : path === "/users" ? [user] : path === "/employees" ? [employee] : path === "/departments" ? [department]
    : path === "/leaves/me" ? { leaves: [leave], year: 2026, annualAllowance: 21, remainingAnnualDays: 21, dayMode: "calendar" }
    : path === "/leaves/balances" ? { year: 2026, annualAllowance: 21, balances: [{ employee, usedDays: 0, remainingDays: 21 }] }
    : path.startsWith("/leaves") ? [leave] : path.startsWith("/attendance") ? [attendance]
    : path.startsWith("/payroll") ? [payslip] : {};
  return route.fulfill({ json: mode.empty && Array.isArray(body) ? [] : body });
}

module.exports = { fixtures, respond };
