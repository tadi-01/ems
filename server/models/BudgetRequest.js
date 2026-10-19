import mongoose from "mongoose";

// Holds expenditure and hiring proposals before they become committed records.
const schema = new mongoose.Schema({
  department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
  kind: { type: String, enum: ["Expense", "Hire", "Employee change"], required: true },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  month: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  details: mongoose.Schema.Types.Mixed,
  reason: { type: String, required: true },
  status: { type: String, enum: ["Pending approval", "Approved", "Rejected"], default: "Pending approval" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  decidedAt: Date,
  decisionReason: String,
}, { timestamps: true });
export default mongoose.model("BudgetRequest", schema);
