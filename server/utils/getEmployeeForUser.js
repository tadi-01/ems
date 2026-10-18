import Employee from "../models/Employee.js";
import User from "../models/User.js";

// Uses a stable account reference; legacy email matches are linked once on use.
async function getEmployeeForUser(request) {
  const user = await User.findById(request.user.userId);
  if (!user) return null;
  const linked = await Employee.findOne({ user: user._id });
  if (linked) return linked;
  try {
    return await Employee.findOneAndUpdate({ email: user.email, user: null },
      { $set: { user: user._id } }, { new: true, runValidators: true });
  } catch (error) {
    if (error.code === 11000) return Employee.findOne({ user: user._id });
    throw error;
  }
}

export default getEmployeeForUser;
