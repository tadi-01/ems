import test from "node:test";
import assert from "node:assert/strict";
import { batchVersion, paymentState } from "../utils/departmentPayroll.js";

test("batch signatures detect additions, edits, HR review and payment without order sensitivity", () => {
  const rows = [{ _id: "a", revision: 0, status: "Pending approval" }, { _id: "b", revision: 1, status: "Approved" }];
  const original = batchVersion(rows);
  assert.equal(original, batchVersion([...rows].reverse()));
  assert.notEqual(original, batchVersion([...rows, { _id: "c" }]));
  for (const change of [{ revision: 1 }, { hrReviewedRevision: 0 }, { paidAt: new Date() }]) {
    assert.notEqual(original, batchVersion([{ ...rows[0], ...change }, rows[1]]));
  }
});

test("scheduled dates never imply paid and unapproved records never become due", () => {
  assert.equal(paymentState({ status: "Pending approval" }, "2026-11-01", "2026-10-30"), "Awaiting approval");
  assert.equal(paymentState({ status: "Approved" }, "2026-10-29", "2026-10-30"), "Scheduled");
  assert.equal(paymentState({ status: "Approved" }, "2026-10-30", "2026-10-30"), "Due for payment");
  assert.equal(paymentState({ status: "Approved", paymentDate: "2026-10-31" }, "2026-10-30", "2026-10-30"), "Scheduled");
  assert.equal(paymentState({ status: "Approved", paidAt: new Date() }, "2026-10-31", "2026-10-30"), "Paid externally");
});
