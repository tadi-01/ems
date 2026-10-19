import Attendance from "../models/Attendance.js";
import Department from "../models/Department.js";
import Employee from "../models/Employee.js";
import Leave from "../models/Leave.js";
import Payroll from "../models/Payroll.js";
import { getMonthText, getTodayText } from "../utils/dateHelpers.js";

// Counts the employees in each department. It loops over the departments and
// counts the employees that point to each one, which is easy to follow and
// avoids a complex aggregation pipeline.
async function getEmployeesPerDepartment() {
  const departments = await Department.find().sort({ name: 1 });
  const counts = [];

  for (const department of departments) {
    const count = await Employee.countDocuments({ department: department._id });
    counts.push({ _id: department._id, name: department.name, count });
  }

  return counts;
}

// Adds up the net salary of every payslip in one month (YYYY-MM).
// The numbers are added in JavaScript so there is no pipeline to explain.
async function getMonthlyPayrollTotal(month) {
  const payslips = await Payroll.find({ month, status: { $nin: ["Rejected", "Voided"] } });
  let total = 0;

  for (const payslip of payslips) {
    total += payslip.netSalary;
  }

  return Math.round(total * 100) / 100;
}

// Counts the employees who are on Approved leave today. Leave dates are saved
// at midnight UTC, so today is "on leave" when the leave starts on or before
// today and ends on or after today. distinct() lists each employee once.
async function countOnLeaveToday(today) {
  const todayStart = new Date(today);
  const employeeIds = await Leave.distinct("employee", {
    status: "Approved",
    startDate: { $lte: todayStart },
    endDate: { $gte: todayStart },
  });
  return employeeIds.length;
}

// Returns the totals shown on the dashboard (Admin and HR only).
async function getDashboardSummary(request, response) {
  try {
    const today = getTodayText();
    const month = getMonthText();

    response.json({
      date: today,
      month,
      totalEmployees: await Employee.countDocuments(),
      presentToday: await Attendance.countDocuments({ date: today }),
      onLeaveToday: await countOnLeaveToday(today),
      monthlyPayroll: await getMonthlyPayrollTotal(month),
      employeesPerDepartment: await getEmployeesPerDepartment(),
    });
  } catch (error) {
    response.status(500).json({ message: "Could not load the dashboard." });
  }
}

export { getDashboardSummary };
