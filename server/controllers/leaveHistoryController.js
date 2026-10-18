import Leave from "../models/Leave.js";
import getEmployeeForUser from "../utils/getEmployeeForUser.js";
import { getTodayText } from "../utils/dateHelpers.js";
import { getLeavePolicy } from "../utils/leavePolicy.js";
import { getRemainingAnnualDays } from "../utils/leaveHelpers.js";
const noEmployeeMessage = "Ask Admin or HR to link your account on the Employees page.";

// Returns the employee's leave history (newest first) with their Annual balance.
async function getMyLeaves(request, response) {
  try {
    const employee = await getEmployeeForUser(request);
    if (!employee) {
      response.status(404).json({ message: noEmployeeMessage });
      return;
    }

    const year = Number(getTodayText().slice(0, 4));
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
      annualAllowance: getLeavePolicy().annualAllowance,
      dayMode: getLeavePolicy().dayMode,
      remainingAnnualDays,
    });
  } catch (error) {
    response.status(500).json({ message: "Could not load your leave." });
  }
}

export { getMyLeaves };
