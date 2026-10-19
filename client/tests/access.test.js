import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "vite";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { hasActiveToken, getSavedUser, clearLogin } from "../src/services/session.js";

let vite;
const values = new Map();
globalThis.localStorage = {
  getItem(key) { return values.get(key) ?? null; },
  setItem(key, value) { values.set(key, value); },
  removeItem(key) { values.delete(key); },
};
before(async () => { vite = await createServer({ server: { middlewareMode: true }, appType: "custom" }); });
after(async () => { await vite?.close(); });

// Renders a page with a saved role; effects do not run or call a live API.
async function renderPage(path, role) {
  localStorage.setItem("user", JSON.stringify({ id: "user", role }));
  const module = await vite.ssrLoadModule(path);
  return renderToStaticMarkup(React.createElement(module.default));
}

test("Employee role cannot see employee or department mutation controls", async () => {
  for (const page of ["Employees", "Departments"]) {
    const html = await renderPage(`/src/pages/${page}.jsx`, "Employee");
    assert.doesNotMatch(html, /Add employee|Add department|>Actions</);
  }
});

test("Admin and HR retain employee and department editors", async () => {
  for (const role of ["Admin", "HR"]) {
    assert.match(await renderPage("/src/pages/Employees.jsx", role), /Add employee/);
    assert.match(await renderPage("/src/pages/Departments.jsx", role), /Add department/);
  }
});

test("payroll management and personal view choices follow the role", async () => {
  const employee = await renderPage("/src/pages/Payroll.jsx", "Employee");
  assert.match(employee, /My payslips/);
  assert.doesNotMatch(employee, /Prepare payroll|All payslips/);
  const admin = await renderPage("/src/pages/Payroll.jsx", "Admin");
  assert.match(admin, /My payslips/);
  assert.match(admin, /Prepare payroll/);
});

test("expired and damaged sessions cannot pass the route guard", () => {
  const future = Math.floor(Date.now() / 1000) + 3600;
  localStorage.setItem("token", `header.${btoa(JSON.stringify({ exp: future }))}.signature`);
  assert.equal(hasActiveToken(), true);
  localStorage.setItem("token", `header.${btoa(JSON.stringify({ exp: 1 }))}.signature`);
  assert.equal(hasActiveToken(), false);
  localStorage.setItem("token", "invalid");
  localStorage.setItem("user", "invalid");
  assert.equal(hasActiveToken(), false);
  assert.equal(getSavedUser(), null);
  clearLogin();
  assert.equal(localStorage.getItem("token"), null);
  assert.equal(localStorage.getItem("user"), null);
});
