import verifyWorkflow from "./verifyWorkflow.js";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { once } from "node:events";
import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User.js";

dotenv.config();
const databaseName = `ems_qa_${Date.now()}`;
const uri = new URL(process.env.MONGO_URI);
uri.pathname = `/${databaseName}`;
const password = randomBytes(18).toString("hex");
const port = 5099;
const origin = "http://localhost:5173";
let child;
let checks = 0;

// Sends an actual HTTP request and verifies the API's expected status.
async function request(path, method = "GET", body, token, status = 200) {
  const response = await fetch(`http://127.0.0.1:${port}/api${path}`, {
    method, signal: AbortSignal.timeout(30000), headers: { "Content-Type": "application/json", Origin: origin,
      ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await response.json();
  assert.equal(response.status, status, `${method} ${path}: ${data.message || "unexpected status"}`);
  assert.equal(response.headers.get("access-control-allow-origin"), origin);
  checks += 1;
  return data;
}

// Waits until the isolated API has connected and built its indexes.
async function waitForApi() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (child.exitCode !== null) throw new Error("Isolated API stopped before startup.");
    try { if ((await fetch(`http://127.0.0.1:${port}/api/health`)).ok) return; } catch {}
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error("Isolated API startup timed out.");
}

// Exercises all business areas using disposable records, never the configured database.
async function verify() {
  await mongoose.connect(uri.toString());
  await User.init();
  const admin = await User.create({ name: "QA Admin", email: "admin@example.test", password, role: "Admin" });
  child = spawn(process.execPath, ["server.js"], { cwd: new URL("..", import.meta.url),
    env: { ...process.env, MONGO_URI: uri.toString(), PORT: String(port),
      JWT_SECRET: randomBytes(32).toString("hex"), COMPANY_TIME_ZONE: "Africa/Harare",
      ANNUAL_LEAVE_DAYS: "21", LEAVE_DAY_MODE: "calendar", PUBLIC_HOLIDAYS: "" },
    stdio: "ignore", windowsHide: true });
  await waitForApi();
  await request("/health");
  const { token: adminToken } = await request("/auth/login", "POST", { email: admin.email, password });
  const employeeLogin = await request("/auth/register", "POST", { name: "QA Employee", email: "person@example.test", password, role: "Admin" }, null, 201);
  assert.equal(employeeLogin.user.role, "Employee");
  const token = employeeLogin.token;
  await request("/users", "GET", undefined, token, 403);
  const department = await request("/departments", "POST", { name: "QA Operations", manager: admin._id, budget: 10000, reason: "Initial QA budget" }, adminToken, 201);
  const details = { employeeId: "QA001", name: "QA Employee", email: "person@example.test",
    user: employeeLogin.user.id, department: department._id, designation: "Tester", phone: "000000",
    joiningDate: "2026-01-01", salary: 1000 };
  const employee = await request("/employees", "POST", details, adminToken, 201);
  await request("/employees", "POST", details, token, 403);
  await request("/employees", "POST", details, adminToken, 400);
  assert.equal((await request("/departments", "GET", undefined, adminToken))[0].employeeCount, 1);
  assert.equal((await request("/employees?search=%5B", "GET", undefined, token)).length, 0);
  await request(`/employees/${employee._id}`, "PUT", { ...details, email: "changed@example.test" }, adminToken);
  await request("/attendance/check-in", "POST", {}, token, 201);
  await request("/attendance/check-in", "POST", {}, token, 400);
  await request("/attendance/check-out", "POST", {}, token);
  await request("/attendance/check-out", "POST", {}, token, 400);
  await request(`/users/${employeeLogin.user.id}/role`, "PUT", { role: "HR" }, adminToken);
  assert.equal((await request("/auth/me", "GET", undefined, token)).user.role, "HR");
  const leave = await request("/leaves", "POST", { leaveType: "Annual", startDate: "2027-02-01", endDate: "2027-02-03", reason: "QA" }, token, 201);
  await request(`/leaves/${leave._id}/approve`, "PUT", {}, token, 403);
  await request(`/leaves/${leave._id}/approve`, "PUT", {}, adminToken);
  await request(`/leaves/${leave._id}/cancel`, "PUT", {}, token, 400);
  const cancel = await request("/leaves", "POST", { leaveType: "Sick", startDate: "2027-03-01", endDate: "2027-03-01", reason: "QA" }, token, 201);
  await request(`/leaves/${cancel._id}/cancel`, "PUT", {}, token);
  const payroll = await request("/payroll", "POST", { employee: employee._id, month: "2027-02", allowances: 50, tax: 100 }, adminToken, 201);
  assert.equal(payroll.netSalary, 950);
  await request("/payroll", "POST", { employee: employee._id, month: "2027-02" }, adminToken, 400);
  const updated = await request(`/payroll/${payroll._id}`, "PUT", { basicSalary: 1000, tax: 150 }, adminToken);
  assert.equal(updated.netSalary, 900);
  assert.equal(updated.updatedBy, String(admin._id));
  assert.equal((await request("/payroll/me", "GET", undefined, token)).length, 0);
  const reviewer = await User.create({ name: "QA Approver", email: "approver@example.test", password, role: "Admin" });
  const { token: reviewerToken } = await request("/auth/login", "POST", { email: reviewer.email, password });
  await request(`/payroll/${payroll._id}/decision`, "PUT", { decision: "Approved", reason: "Checked", confirmed: true, revision: updated.revision }, adminToken, 400);
  await request(`/payroll/${payroll._id}/decision`, "PUT", { decision: "Approved", reason: "Checked", confirmed: true, revision: updated.revision }, reviewerToken);
  assert.equal((await request("/payroll/me", "GET", undefined, token)).length, 1);
  assert.equal((await request("/dashboard", "GET", undefined, adminToken)).totalEmployees, 1);
  await request(`/departments/${department._id}`, "DELETE", undefined, adminToken, 400);
  await request(`/employees/${employee._id}`, "DELETE", undefined, adminToken, 400);
  await request(`/users/${employeeLogin.user.id}/role`, "PUT", { role: "Employee" }, adminToken);
  await request("/dashboard", "GET", undefined, token, 403);
  await verifyWorkflow(request, { admin, adminToken, employee, details, employeeLogin, token, reviewerToken, department });
  console.log(`PASS: ${checks} live API checks with MongoDB indexes and account links.`);
}

try { await verify(); }
catch (error) { console.error("Integration check failed:", error.message); process.exitCode = 1; }
finally {
  if (child && child.exitCode === null) { const stopped = once(child, "exit"); child.kill(); await stopped; }
  // The exact generated name must match before removing this run's disposable database.
  if (mongoose.connection.readyState === 1 && mongoose.connection.name === databaseName && /^ems_qa_\d+$/.test(databaseName)) {
    await mongoose.connection.dropDatabase();
    console.log("Removed this run's disposable QA database.");
  }
  await mongoose.disconnect();
}
