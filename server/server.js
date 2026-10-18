import { validateRuntimeSettings } from "./utils/runtimeSettings.js";
import mongoose from "mongoose";
import userRoutes from "./routes/userRoutes.js";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import connectDatabase from "./utils/connectDatabase.js";
import authRoutes from "./routes/authRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import payrollRoutes from "./routes/payrollRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Only the deployed React app (and the local Vite server) may call this API
// from a browser. A slash at the end of CLIENT_URL is removed so it matches.
const allowedOrigins = [
  process.env.CLIENT_URL?.replace(/\/$/, ""),
  "http://localhost:5173",
].filter(Boolean);

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/api/health", (request, response) => {
  response.status(mongoose.connection.readyState === 1 ? 200 : 503)
    .json({ message: mongoose.connection.readyState === 1
      ? "Employee Management API is running." : "Database unavailable." });
});

// Starts the server after connecting to MongoDB when a database URL is provided.
async function startServer() {
  validateRuntimeSettings();
  await connectDatabase();
  for (const model of Object.values(mongoose.models)) await model.init();
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

startServer().catch((error) => {
  console.error("Startup failed:", error.message);
  process.exit(1);
});
