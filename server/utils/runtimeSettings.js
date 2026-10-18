import { getLeavePolicy } from "./leavePolicy.js";
import { getTodayText } from "./dateHelpers.js";

// Rejects sample secrets and invalid policies before the API accepts logins.
function validateRuntimeSettings() {
  const secret = process.env.JWT_SECRET || "";
  if (secret.length < 32 || secret.startsWith("replace_")) {
    throw new Error("Set JWT_SECRET to a random secret of at least 32 characters.");
  }
  getLeavePolicy();
  getTodayText();
}

export { validateRuntimeSettings };
