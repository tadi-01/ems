import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    employeeId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, required: true, trim: true },
    joiningDate: { type: Date, required: true },
    salary: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
);

// Only linked accounts are indexed, so many employees can await registration.
employeeSchema.index({ user: 1 }, { unique: true, partialFilterExpression: {
  user: { $type: "objectId" },
} });

export default mongoose.model("Employee", employeeSchema);
