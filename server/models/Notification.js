import mongoose from "mongoose";

// Each recipient owns a separate read state for a workflow notification.
const schema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  message: { type: String, required: true },
  path: { type: String, required: true },
  readAt: { type: Date, default: null },
}, { timestamps: true });
export default mongoose.model("Notification", schema);
