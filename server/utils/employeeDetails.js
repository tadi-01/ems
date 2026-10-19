import Department from "../models/Department.js";
import User from "../models/User.js";

// Copies editable fields and checks references instead of accepting arbitrary updates.
async function readEmployeeDetails(body) {
  const details = {};
  for (const key of ["employeeId", "name", "department", "email",
    "phone", "joiningDate", "salary"]) {
    if (body[key] !== undefined) details[key] = body[key];
  }
  if (!await Department.exists({ _id: details.department })) {
    throw new Error("Choose an existing department.");
  }
  if (body.user) {
    if (!await User.exists({ _id: body.user })) throw new Error("Account not found.");
    details.user = body.user;
  } else if (body.user === "") {
    details.user = null;
  }
  return details;
}

// Escapes regex operators so search always matches literal text.
function escapeSearch(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export { readEmployeeDetails, escapeSearch };
