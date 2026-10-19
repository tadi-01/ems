import { readPayslipAmounts } from "../utils/payrollHelpers.js";
import { plannedDates } from "../utils/payrollSchedule.js";
import test from "node:test";
import assert from "node:assert/strict";
import Payroll from "../models/Payroll.js";
import Employee from "../models/Employee.js";
import User from "../models/User.js";
import { createPayslip, updatePayslip, getMyPayslips } from "../controllers/payrollController.js";
import { createResponse } from "./helpers.js";

test("payroll itemises overtime, pension and loans without trusting net salary", () => {
  const { amounts } = readPayslipAmounts({ basicSalary: 1000, allowances: 50, bonuses: 20, overtime: 100, tax: 100, pension: 30, loanDeductions: 40, deductions: 10, netSalary: 99999 }, 0);
  assert.equal(amounts.netSalary, 990);
  assert.ok(readPayslipAmounts({ basicSalary: 100, pension: 101 }, 0).error);
});

test("schedule uses the last working day including explicit public holidays", () => {
  const dates = plannedDates({ preparationDay: 25, approvalDay: 28, paymentRule: "last-working-day", holidays: ["2026-10-30"] }, "2026-10");
  assert.equal(dates.preparation, "2026-10-25");
  assert.equal(dates.approvalDue, "2026-10-28");
  assert.equal(dates.plannedPayment, "2026-10-29");
});

test("personal payslips use the linked employee for every account role", async (context) => {
  context.mock.method(User, "findById", async () => ({ _id: "user" }));
  context.mock.method(Employee, "findOne", async () => ({ _id: "employee" }));
  context.mock.method(Payroll, "find", (query) => {
    assert.equal(query.employee, "employee");
    assert.deepEqual(query.$or, [{ status: "Approved" }, { status: { $exists: false } }]);
    return { populate: () => ({ sort: () => ({ lean: async () => [{ month: "2026-10" }] }) }) };
  });
  for (const role of ["Admin", "HR", "Employee"]) {
    const response = createResponse();
    await getMyPayslips({ user: { userId: "user", role } }, response);
    assert.equal(response.body.length, 1);
  }
});
