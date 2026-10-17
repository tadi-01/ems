import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import connectDatabase from "./utils/connectDatabase.js";
import authRoutes from "./routes/authRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/attendance", attendanceRoutes);

app.get("/api/health", (request, response) => {
  response.json({ message: "Employee Management API is running." });
});

// Starts the server after connecting to MongoDB when a database URL is provided.
async function startServer() {
  await connectDatabase();
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

startServer();
