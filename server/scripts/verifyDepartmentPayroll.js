import assert from "node:assert/strict";
import Settings from "../models/Settings.js";
import WorkflowRun from "../models/WorkflowRun.js";
import sendPayrollReminders from "../utils/payrollReminders.js";
import { getTodayText } from "../utils/dateHelpers.js";

// Exercises department review invalidation, whole-batch limits and whole-batch budget limits.
async function verifyDepartmentPayroll(request, { department, adminToken, token }) {
  const month = "2026-09", base = `/payroll/departments/${department._id}`;
  const load = async () => (await request(`/payroll/departments?month=${month}`, "GET", undefined, token)).find((row) => row.department._id === department._id);
  const decide = (batch, actor, status = 200) => request(`${base}/decision`, "PUT", { month, version: batch.version, decision: "Approved", reason: "Checked department totals", confirmed: true }, actor, status);
  await request(`${base}/prepare`, "POST", { month }, token);
  await request(`${base}/prepare`, "POST", { month }, token);
  let batch = await load();
  assert.equal(batch.slips.length, 2);
  const stale = await load();
  await request(`/payroll/${batch.slips[0]._id}`, "PUT", { bonuses: 500 }, token);
  await decide(stale, adminToken, 400);
  batch = await load();
  await decide(batch, adminToken, 400);
  await decide(batch, token, 400);
  assert.ok((await load()).slips.every((slip) => slip.status === "Pending approval"));
  await request(`/budgets/departments/${department._id}`, "PUT", { budget: 3000, month, reason: "Authorize department bonus" }, adminToken);
  await decide(batch, token);
  batch = await load();
  assert.ok(batch.slips.every((slip) => slip.paymentState === "Due for payment"));
  const settings = await Settings.findById("company");
  await sendPayrollReminders(settings, getTodayText());
  await sendPayrollReminders(settings, getTodayText());
  assert.equal(await WorkflowRun.countDocuments({ _id: `${month}-${department._id}-payment-due` }), 1);
  assert.ok((await load()).slips.every((slip) => !slip.paidAt));
  console.log("Department payroll checks passed: same-user HR approval, stale bonus protection, and atomic budget check.");
}
export default verifyDepartmentPayroll;
