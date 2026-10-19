import Payroll from "../models/Payroll.js";
import { createHash } from "node:crypto";

// Binds a department decision to the complete set of records the reviewer saw.
function batchVersion(slips) {
  const records = slips.map((slip) => `${slip._id}:${slip.revision || 0}:${slip.status || "Historical"}:${slip.hrReviewedRevision ?? ""}:${slip.paidAt || ""}`).sort().join("|");
  return createHash("sha256").update(records).digest("hex");
}

// Reads a stable department/month group while its department lock is held.
function departmentSlips(department, month, session) {
  return Payroll.find({ department, month }).session(session);
}

// Derives payment state without claiming a scheduled date proves an external payment.
function paymentState(slip, today, plannedPayment) {
  if (slip.paidAt) return "Paid externally";
  if (!slip.status) return "Historical — payment not recorded";
  if (slip.status !== "Approved") return "Awaiting approval";
  return today >= (slip.paymentDate || plannedPayment) ? "Due for payment" : "Scheduled";
}
export { batchVersion, departmentSlips, paymentState };
