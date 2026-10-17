import mongoose from "mongoose";

// Connects the server to MongoDB and gives a clear error when setup is missing.
async function connectDatabase() {
  const databaseUrl = process.env.MONGO_URI;

  if (!databaseUrl) {
    console.log(
      "MONGO_URI is not set. The server will run without MongoDB for now.",
    );
    return;
  }

  try {
    await mongoose.connect(databaseUrl);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

export default connectDatabase;
