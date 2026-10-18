import { validateRuntimeSettings } from "../utils/runtimeSettings.js";
import test from "node:test";
import assert from "node:assert/strict";
import { getTodayText, getMonthText, isValidDate } from "../utils/dateHelpers.js";
import { getDatabaseUrl } from "../utils/databaseSettings.js";
import { getLeavePolicy } from "../utils/leavePolicy.js";
import { countLeaveDays } from "../utils/leaveHelpers.js";
import { escapeSearch } from "../utils/employeeDetails.js";
import { readPayslipAmounts, isValidMonth } from "../utils/payrollHelpers.js";

// Runs a check with temporary environment settings and restores them afterwards.
function withSettings(settings, check) {
  const previous = {};
  for (const key of Object.keys(settings)) { previous[key] = process.env[key]; process.env[key] = settings[key]; }
  try { check(); }
  finally {
    for (const key of Object.keys(settings)) {
      if (previous[key] === undefined) delete process.env[key]; else process.env[key] = previous[key];
    }
  }
}

test("company dates cross midnight, month and year at Harare time", () => {
  withSettings({ COMPANY_TIME_ZONE: "Africa/Harare" }, () => {
    assert.equal(getTodayText(new Date("2026-12-31T21:59:59Z")), "2026-12-31");
    assert.equal(getTodayText(new Date("2026-12-31T22:00:00Z")), "2027-01-01");
    assert.equal(getMonthText(new Date("2026-12-31T22:00:00Z")), "2027-01");
  });
});

test("calendar date validation rejects normalization and timestamps", () => {
  assert.equal(isValidDate("2026-02-30"), false);
  assert.equal(isValidDate("2026-10-18T00:00:00Z"), false);
  assert.equal(isValidDate("2028-02-29"), true);
  assert.equal(isValidDate({}), false);
});

test("database selection must be explicit", () => {
  for (const uri of ["", "mongodb+srv://example.com/?retryWrites=true", "https://example.com/db"]) {
    withSettings({ MONGO_URI: uri }, () => assert.throws(getDatabaseUrl));
  }
  withSettings({ MONGO_URI: "mongodb+srv://example.com/ems?retryWrites=true" }, () => {
    assert.equal(getDatabaseUrl(), process.env.MONGO_URI);
  });
});

test("leave defaults remain 21 calendar days and include weekends", () => {
  withSettings({ ANNUAL_LEAVE_DAYS: "", LEAVE_DAY_MODE: "", PUBLIC_HOLIDAYS: "" }, () => {
    assert.equal(getLeavePolicy().annualAllowance, 21);
    assert.equal(countLeaveDays(new Date("2026-10-16"), new Date("2026-10-19")), 4);
  });
});

test("optional working-day policy excludes weekends and configured holidays", () => {
  withSettings({ ANNUAL_LEAVE_DAYS: "25", LEAVE_DAY_MODE: "working", PUBLIC_HOLIDAYS: "2026-10-19" }, () => {
    assert.equal(getLeavePolicy().annualAllowance, 25);
    assert.equal(countLeaveDays(new Date("2026-10-16"), new Date("2026-10-19")), 1);
    assert.equal(countLeaveDays(new Date("2026-10-17"), new Date("2026-10-18")), 0);
  });
});

test("invalid leave configuration fails instead of changing balances silently", () => {
  withSettings({ ANNUAL_LEAVE_DAYS: "-1" }, () => assert.throws(getLeavePolicy));
  withSettings({ LEAVE_DAY_MODE: "unknown" }, () => assert.throws(getLeavePolicy));
  withSettings({ PUBLIC_HOLIDAYS: "2026-02-30" }, () => assert.throws(getLeavePolicy));
});

test("employee search treats regex punctuation literally", () => {
  const value = "A.*+[test](x)?^$|\\";
  const regex = new RegExp(escapeSearch(value), "i");
  assert.equal(regex.test(value), true);
  assert.equal(regex.test("Alice"), false);
});

test("payroll preserves manual amounts and computes net on the server", () => {
  const result = readPayslipAmounts({ allowances: 50, bonuses: 20, deductions: 10, tax: 100, netSalary: 9999 }, 1000);
  assert.equal(result.amounts.netSalary, 960);
  assert.ok(readPayslipAmounts({ tax: 1001 }, 1000).error);
  assert.ok(readPayslipAmounts({ basicSalary: -1 }, 1000).error);
  assert.equal(isValidMonth("2026-13"), false);
  assert.equal(isValidMonth("2026-10"), true);
});


test("sample or short JWT secrets cannot start the API", () => {
  for (const secret of ["", "short", "replace_with_a_long_random_text_for_testing"]) {
    withSettings({ JWT_SECRET: secret }, () => assert.throws(validateRuntimeSettings));
  }
});
