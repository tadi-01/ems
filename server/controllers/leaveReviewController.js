import getEmployeeForUser from "../utils/getEmployeeForUser.js";
import Employee from "../models/Employee.js";
import Leave from "../models/Leave.js";
import { getTodayText } from "../utils/dateHelpers.js";
import { getLeavePolicy } from "../utils/leavePolicy.js";
import {
  getRemainingAnnualDays,
  getYearRange,
} from "../utils/leaveHelpers.js";

// Returns every leave request for Admin and HR. An optional ?status= value
// such as Pending shows only requests with that status.
async function getAllLeaves(request, response) {
  try {
    const filter = request.query.status ? { status: request.query.status } : {};
    const leaves = await Leave.find(filter)
      .populate("employee", "name employeeId")
      .sort({ createdAt: -1 });
    response.json(leaves);
  } catch (error) {
    response.status(500).json({ message: "Could not load leave requests." });
  }
}

// Approves or rejects a Pending request and records who reviewed it and when.
// An Annual request is only approved if the employee still has enough days.
async function reviewLeave(request, response, newStatus) {
  try {
    const leave = await Leave.findById(request.params.id);
    if (!leave) {
      response.status(404).json({ message: "Leave request not found." });
      return;
    }
    const reviewer = await getEmployeeForUser(request);
    if (reviewer && String(reviewer._id) === String(leave.employee)) {
      response.status(403).json({ message: "You cannot review your own leave request." });
      return;
    }
    if (leave.status !== "Pending") {
      response
        .status(400)
        .json({ message: "Only a Pending request can be reviewed." });
      return;
    }

    if (newStatus === "Approved" && leave.leaveType === "Annual") {
      const remaining = await getRemainingAnnualDays(
        leave.employee,
        leave.startDate.getUTCFullYear(),
      );
      if (leave.days > remaining) {
        response.status(400).json({
          message: `The employee only has ${remaining} Annual leave days left.`,
        });
        return;
      }
    }

    const savedLeave = await Leave.findOneAndUpdate({ _id: leave._id, status: "Pending" },
      { status: newStatus, reviewedBy: request.user.userId, reviewedAt: new Date() },
      { new: true, runValidators: true }).populate("employee", "name employeeId");
    if (!savedLeave) {
      response.status(409).json({ message: "This request has already changed. Refresh the list." });
      return;
    }
    response.json(savedLeave);
  } catch (error) {
    response.status(400).json({ message: "Could not review leave." });
  }
}

// Approves a Pending leave request.
function approveLeave(request, response) {
  return reviewLeave(request, response, "Approved");
}

// Rejects a Pending leave request.
function rejectLeave(request, response) {
  return reviewLeave(request, response, "Rejected");
}

// Returns each employee's Annual leave used and remaining for the current year.
// It loads all employees and all Approved Annual leave once, then adds up the
// days for each employee in plain JavaScript (no aggregation pipeline).
async function getLeaveBalances(request, response) {
  try {
    const year = Number(getTodayText().slice(0, 4));
    const range = getYearRange(year);
    const employees = await Employee.find().sort({ name: 1 });
    const approvedLeaves = await Leave.find({
      leaveType: "Annual",
      status: "Approved",
      startDate: { $gte: range.start, $lt: range.end },
    });

    const balances = employees.map((employee) => {
      let usedDays = 0;
      for (const leave of approvedLeaves) {
        if (String(leave.employee) === String(employee._id)) {
          usedDays += leave.days;
        }
      }
      return {
        employee: {
          _id: employee._id,
          employeeId: employee.employeeId,
          name: employee.name,
        },
        usedDays,
        remainingDays: getLeavePolicy().annualAllowance - usedDays,
      };
    });
    response.json({ year, annualAllowance: getLeavePolicy().annualAllowance, balances });
  } catch (error) {
    response.status(500).json({ message: "Could not load leave balances." });
  }
}

export { getAllLeaves, approveLeave, rejectLeave, getLeaveBalances };
