import Employee from "../models/Employee.js";
import User from "../models/User.js";

// Finds the Employee record that belongs to the logged-in user by matching email.
// The token only holds the user id, so we load the User first to get the email.
// Attendance and leave both use this so the browser never sends an employee id.
async function getEmployeeForUser(request) {
  const user = await User.findById(request.user.userId);
  if (!user) return null;
  return Employee.findOne({ email: user.email });
}

export default getEmployeeForUser;
