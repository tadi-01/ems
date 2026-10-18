import Leave from "../models/Leave.js";
import { isValidDate } from "../utils/dateHelpers.js";
import getEmployeeForUser from "../utils/getEmployeeForUser.js";
import {
  countLeaveDays,
  getRemainingAnnualDays,
} from "../utils/leaveHelpers.js";

const noEmployeeMessage = "Ask Admin or HR to link your account on the Employees page.";

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
    if (!isValidDate(startDate) || !isValidDate(endDate)) {
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
    if (days === 0) {
      response.status(400).json({ message: "This range contains no leave days under the company policy." });
      return;
    }
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

    const cancelled = await Leave.findOneAndUpdate({ _id: leave._id, status: "Pending" },
      { status: "Cancelled" }, { new: true });
    if (!cancelled) {
      response.status(409).json({ message: "This request has already been reviewed." });
      return;
    }
    response.json(cancelled);
  } catch (error) {
    response.status(400).json({ message: "Could not cancel leave." });
  }
}

export { applyForLeave, cancelLeave };
