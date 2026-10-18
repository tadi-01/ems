import mongoose from "mongoose";
import { getDatabaseUrl } from "./databaseSettings.js";

// Connects to the named database before the API accepts requests.
async function connectDatabase() {
  const url = getDatabaseUrl();
  try { await mongoose.connect(url); }
  catch { throw new Error("Could not connect to MongoDB. Check MONGO_URI and database network access."); }
  console.log("MongoDB connected successfully");
}

export default connectDatabase;
