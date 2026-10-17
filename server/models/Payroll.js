import mongoose from "mongoose";

const payrollSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    // The pay month as text in the form YYYY-MM, for example 2026-10.
    month: { type: String, required: true },
    // The basic salary is copied onto the payslip so that a later change to
    // Employee.salary does not rewrite old payslips.
    basicSalary: { type: Number, required: true, min: 0 },
    allowances: { type: Number, default: 0, min: 0 },
    bonuses: { type: Number, default: 0, min: 0 },
    deductions: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    // basic + allowances + bonuses - deductions - tax. The server works this out.
    netSalary: { type: Number, required: true },
    // The Admin or HR user who created the payslip.
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

// A unique compound index: MongoDB allows only one payslip for each
// employee + month pair, so a payslip cannot be created twice for the same month.
payrollSchema.index({ employee: 1, month: 1 }, { unique: true });

export default mongoose.model("Payroll", payrollSchema);
