import Leave from "../models/Leave.js";
import getEmployeeForUser from "../utils/getEmployeeForUser.js";
import {
  ANNUAL_LEAVE_DAYS,
  countLeaveDays,
  getRemainingAnnualDays,
} from "../utils/leaveHelpers.js";

const noEmployeeMessage = "No employee record matches your account email.";

// Creates a Pending leave request for the logged-in employee after checking
// the dates, overlapping requests and the Annual leave balance.
async function applyForLeave(request, response) {
  try {
    const employee = await getEmployeeForUser(request);
    if (!employee) {
      response.status(404).json({ message: noEmployeeMessage });
      return;
    }

    const { leaveType, startDate, endDate, reason } = request.body;
    if (!leaveType || !startDate || !endDate || !reason) {
      response.status(400).json({
        message: "Leave type, start date, end date and reason are required.",
      });
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start) || isNaN(end)) {
      response.status(400).json({ message: "The dates are not valid." });
      return;
    }
    if (end < start) {
      response
        .status(400)
        .json({ message: "The end date cannot be before the start date." });
      return;
    }
    if (start.getUTCFullYear() !== end.getUTCFullYear()) {
      response
        .status(400)
        .json({ message: "Leave must start and end in the same year." });
      return;
    }

    // Two date ranges overlap when each one starts before the other one ends.
    const overlapping = await Leave.findOne({
      employee: employee._id,
      status: { $in: ["Pending", "Approved"] },
      startDate: { $lte: end },
      endDate: { $gte: start },
    });
    if (overlapping) {
      response
        .status(400)
        .json({ message: "You already have a leave request for these dates." });
      return;
    }

    const days = countLeaveDays(start, end);
    if (leaveType === "Annual") {
      const remaining = await getRemainingAnnualDays(
        employee._id,
        start.getUTCFullYear(),
      );
      if (days > remaining) {
        response.status(400).json({
          message: `You only have ${remaining} Annual leave days left this year.`,
        });
        return;
      }
    }

    const leave = await Leave.create({
      employee: employee._id,
      leaveType,
      startDate: start,
      endDate: end,
      days,
      reason,
    });
    response.status(201).json(leave);
  } catch (error) {
    if (error.name === "ValidationError") {
      response.status(400).json({ message: "Please check the leave details." });
      return;
    }
    response.status(500).json({ message: "Could not apply for leave." });
  }
}

// Cancels one of the employee's own requests, but only while it is Pending.
// The record is kept in the history with the status Cancelled.
async function cancelLeave(request, response) {
  try {
    const employee = await getEmployeeForUser(request);
    if (!employee) {
      response.status(404).json({ message: noEmployeeMessage });
      return;
    }

    const leave = await Leave.findById(request.params.id);
    if (!leave || String(leave.employee) !== String(employee._id)) {
      response.status(404).json({ message: "Leave request not found." });
      return;
    }
    if (leave.status !== "Pending") {
      response
        .status(400)
        .json({ message: "Only a Pending request can be cancelled." });
      return;
    }

    leave.status = "Cancelled";
    await leave.save();
    response.json(leave);
  } catch (error) {
    response.status(400).json({ message: "Could not cancel leave." });
  }
}

// Returns the employee's leave history (newest first) with their Annual balance.
async function getMyLeaves(request, response) {
  try {
    const employee = await getEmployeeForUser(request);
    if (!employee) {
      response.status(404).json({ message: noEmployeeMessage });
      return;
    }

    const year = new Date().getUTCFullYear();
    const leaves = await Leave.find({ employee: employee._id }).sort({
      startDate: -1,
    });
    const remainingAnnualDays = await getRemainingAnnualDays(
      employee._id,
      year,
    );
    response.json({
      leaves,
      year,
      annualAllowance: ANNUAL_LEAVE_DAYS,
      remainingAnnualDays,
    });
  } catch (error) {
    response.status(500).json({ message: "Could not load your leave." });
  }
}

export { applyForLeave, cancelLeave, getMyLeaves };
