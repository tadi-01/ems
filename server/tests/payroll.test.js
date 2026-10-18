import test from "node:test";
import assert from "node:assert/strict";
import Payroll from "../models/Payroll.js";
import Employee from "../models/Employee.js";
import User from "../models/User.js";
import { createPayslip, updatePayslip, getMyPayslips } from "../controllers/payrollController.js";
import { createResponse } from "./helpers.js";

test("payslip edits record the editor and preserve the original creator", async (context) => {
  const payslip = { basicSalary: 1000, createdBy: "creator",
    async save() {}, async populate() { return this; } };
  context.mock.method(Payroll, "findById", async () => payslip);
  const response = createResponse();
  await updatePayslip({ params: { id: "p" }, body: { tax: 100 }, user: { userId: "editor" } }, response);
  assert.equal(response.body.createdBy, "creator");
  assert.equal(response.body.updatedBy, "editor");
  assert.equal(response.body.netSalary, 900);
});

test("creation ignores supplied net salary and copies company metadata", async (context) => {
  context.mock.method(Employee, "findById", async () => ({ _id: "employee", salary: 1000 }));
  context.mock.method(Payroll, "create", async (data) => ({ async populate() { return data; } }));
  const response = createResponse();
  await createPayslip({ body: { employee: "employee", month: "2026-10", netSalary: 1 }, user: { userId: "creator" } }, response);
  assert.equal(response.statusCode, 201);
  assert.equal(response.body.netSalary, 1000);
  assert.equal(response.body.companyName, process.env.COMPANY_NAME || "");
  assert.equal(response.body.currency, process.env.PAYROLL_CURRENCY || "");
});

test("personal payslips use the linked employee for every account role", async (context) => {
  context.mock.method(User, "findById", async () => ({ _id: "user" }));
  context.mock.method(Employee, "findOne", async () => ({ _id: "employee" }));
  context.mock.method(Payroll, "find", (query) => {
    assert.deepEqual(query, { employee: "employee" });
    return { populate: () => ({ sort: async () => [{ month: "2026-10" }] }) };
  });
  for (const role of ["Admin", "HR", "Employee"]) {
    const response = createResponse();
    await getMyPayslips({ user: { userId: "user", role } }, response);
    assert.equal(response.body.length, 1);
  }
});
