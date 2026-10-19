import mongoose from "mongoose";

// Unique reminder keys prevent duplicate notifications across server instances.
const schema = new mongoose.Schema({ _id: String, completedAt: { type: Date, default: Date.now } });
export default mongoose.model("WorkflowRun", schema);
