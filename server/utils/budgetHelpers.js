import Department from "../models/Department.js";
import Employee from "../models/Employee.js";
import Payroll from "../models/Payroll.js";
import BudgetRequest from "../models/BudgetRequest.js";

// Locks the department document so competing commitments retry their transaction.
async function lockBudget(id, session) {
  const department = await Department.findByIdAndUpdate(id, { $inc: { budgetRevision: 1 } }, { new: true, session });
  if (!department) throw new Error("Department not found.");
  return department;
}

// Counts salary commitments once per month, replacing the salary with prepared gross pay.
async function budgetUsage(department, month, session, proposed = {}) {
  const months = [month];
  const employees = await Employee.find({ department: department._id }).session(session);
  const employeeIds = employees.map((item) => item._id);
  const payroll = await Payroll.find({ month: { $in: months }, $and: [{ $or: [{ status: "Approved" }, { status: { $exists: false } }] }],
    $or: [{ department: department._id }, { department: { $exists: false }, employee: { $in: employeeIds } }] }).session(session);
  const expenses = await BudgetRequest.find({ department: department._id, kind: "Expense", month: { $in: months }, status: "Approved" }).session(session);
  let committed = expenses.reduce((sum, item) => sum + item.amount, 0);
  const gross = (item) => item.basicSalary + item.allowances + item.bonuses + (item.overtime || 0);
  for (const period of months) {
    const counted = new Set();
    for (const employee of employees) {
      const key = String(employee._id); counted.add(key);
      const slip = payroll.find((item) => String(item.employee) === key && item.month === period);
      const replacement = proposed.employeeId === key && proposed.month === period ? proposed.amounts : null;
      const salary = proposed.changedEmployeeId === key ? proposed.salary : employee.salary;
      committed += replacement ? gross(replacement) : slip ? (proposed.changedEmployeeId === key ? Math.max(salary, gross(slip)) : gross(slip)) : salary;
    }
    for (const slip of payroll.filter((item) => item.month === period && !counted.has(String(item.employee)))) committed += gross(slip);
  }
  committed += (proposed.hireSalary || 0) * months.length + (proposed.expense || 0);
  committed = Math.round(committed * 100) / 100;
  const configured = !department.budgetPeriod || department.budgetPeriod === "monthly";
  return { committed, budget: department.budget, remaining: department.budget - committed,
    percent: department.budget ? Math.round(committed / department.budget * 100) : committed ? 100 : 0,
    exceeded: !configured || committed > department.budget, configured, period: "monthly" };
}
export { lockBudget, budgetUsage };
