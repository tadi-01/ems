import { isValidDate } from "./dateHelpers.js";

// Reads settings at request time, after dotenv has loaded the environment.
function getLeavePolicy() {
  const annualAllowance = Number(process.env.ANNUAL_LEAVE_DAYS || 21);
  if (!Number.isInteger(annualAllowance) || annualAllowance < 0) {
    throw new Error("ANNUAL_LEAVE_DAYS must be a non-negative integer.");
  }
  const dayMode = process.env.LEAVE_DAY_MODE || "calendar";
  if (!["calendar", "working"].includes(dayMode)) {
    throw new Error("LEAVE_DAY_MODE must be calendar or working.");
  }
  const holidays = (process.env.PUBLIC_HOLIDAYS || "").split(",").map((day) => day.trim()).filter(Boolean);
  if (holidays.some((day) => !isValidDate(day))) {
    throw new Error("PUBLIC_HOLIDAYS must contain YYYY-MM-DD dates separated by commas.");
  }
  return { annualAllowance, dayMode, holidays };
}

export { getLeavePolicy };
