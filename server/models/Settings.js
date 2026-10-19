import mongoose from "mongoose";

// One configuration document controls planning dates without initiating payments.
const schema = new mongoose.Schema({
  _id: { type: String, default: "company" },
  preparationDay: { type: Number, default: 25, min: 1, max: 28 },
  approvalDay: { type: Number, default: 28, min: 1, max: 28 },
  paymentRule: { type: String, enum: ["last-working-day", "fixed-day"], default: "last-working-day" },
  paymentDay: { type: Number, default: 28, min: 1, max: 28 },
  holidays: { type: [String], default: [] },
  automaticPreparation: { type: Boolean, default: false },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });
export default mongoose.model("Settings", schema);
