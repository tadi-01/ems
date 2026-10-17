import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    budget: { type: Number, required: true, min: 0 },
    employeeCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

export default mongoose.model("Department", departmentSchema);
