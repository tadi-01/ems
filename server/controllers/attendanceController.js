import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";
import User from "../models/User.js";

// Returns today's date as text (YYYY-MM-DD) so each day has one attendance record.
// This uses the server clock in UTC, which is fine for a course project.
function getTodayText() {
  return new Date().toISOString().slice(0, 10);
}

// Finds the Employee record that belongs to the logged-in user by matching email.
// The token only holds the user id, so we load the User first to get the email.
async function getEmployeeForLoggedInUser(request) {
  const user = await User.findById(request.user.userId);
  if (!user) return null;
  return Employee.findOne({ email: user.email });
}

// Records the check-in time for today. The unique index on employee + date
// stops a second check-in on the same day.
async function checkIn(request, response) {
  try {
    const employee = await getEmployeeForLoggedInUser(request);
    if (!employee) {
      response
        .status(404)
        .json({ message: "No employee record matches your account email." });
      return;
    }

    const record = await Attendance.create({
      employee: employee._id,
      date: getTodayText(),
      checkIn: new Date(),
    });
    response.status(201).json(record);
  } catch (error) {
    if (error.code === 11000) {
      response.status(400).json({ message: "You have already checked in today." });
      return;
    }
    response.status(500).json({ message: "Check-in failed." });
  }
}

// Records the check-out time for today and works out the hours worked.
async function checkOut(request, response) {
  try {
    const employee = await getEmployeeForLoggedInUser(request);
    if (!employee) {
      response
        .status(404)
        .json({ message: "No employee record matches your account email." });
      return;
    }

    const record = await Attendance.findOne({
      employee: employee._id,
      date: getTodayText(),
    });
    if (!record) {
      response.status(400).json({ message: "You have not checked in today." });
      return;
    }
    if (record.checkOut) {
      response.status(400).json({ message: "You have already checked out today." });
      return;
    }

    record.checkOut = new Date();
    const milliseconds = record.checkOut - record.checkIn;
    record.workingHours = Math.round((milliseconds / 3600000) * 100) / 100;
    await record.save();
    response.json(record);
  } catch (error) {
    response.status(500).json({ message: "Check-out failed." });
  }
}

// Returns the logged-in employee's own attendance history, newest first.
async function getMyAttendance(request, response) {
  try {
    const employee = await getEmployeeForLoggedInUser(request);
    if (!employee) {
      response
        .status(404)
        .json({ message: "No employee record matches your account email." });
      return;
    }

    const records = await Attendance.find({ employee: employee._id }).sort({
      date: -1,
    });
    response.json(records);
  } catch (error) {
    response.status(500).json({ message: "Could not load your attendance." });
  }
}

// Returns attendance for all employees (Admin and HR). An optional ?date=
// value such as 2026-10-17 shows only that day.
async function getAllAttendance(request, response) {
  try {
    const filter = request.query.date ? { date: request.query.date } : {};
    const records = await Attendance.find(filter)
      .populate("employee", "name employeeId")
      .sort({ date: -1, checkIn: -1 });
    response.json(records);
  } catch (error) {
    response.status(500).json({ message: "Could not load attendance." });
  }
}

export { checkIn, checkOut, getMyAttendance, getAllAttendance };
