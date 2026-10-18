import User from "../models/User.js";
import Department from "../models/Department.js";

// Lists safe account details for role management and account dropdowns.
async function getAllUsers(request, response) {
  try {
    response.json(await User.find().select("name email role").sort({ name: 1 }));
  } catch (error) {
    response.status(500).json({ message: "Could not load users." });
  }
}

// Lets an Admin change another account's role without locking themselves out.
async function updateUserRole(request, response) {
  try {
    const { role } = request.body;
    if (!["Admin", "HR", "Employee"].includes(role)) {
      response.status(400).json({ message: "Choose Admin, HR or Employee." });
      return;
    }
    if (request.params.id === String(request.user.userId)) {
      response.status(400).json({ message: "You cannot change your own role." });
      return;
    }
    if (role === "Employee" && await Department.exists({ manager: request.params.id })) {
      response.status(400).json({ message: "Assign another department manager first." });
      return;
    }
    const user = await User.findByIdAndUpdate(request.params.id, { role }, {
      new: true, runValidators: true,
    }).select("name email role");
    if (!user) {
      response.status(404).json({ message: "User not found." });
      return;
    }
    response.json(user);
  } catch (error) {
    response.status(400).json({ message: "Could not change the role." });
  }
}

export { getAllUsers, updateUserRole };
