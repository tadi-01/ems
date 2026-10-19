import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    budgetPeriod: { type: String, enum: ["monthly"], default: "monthly" },
    budgetRevision: { type: Number, default: 0 },
    currency: { type: String, default: "" },
    budget: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
);

export default mongoose.model("Department", departmentSchema);
