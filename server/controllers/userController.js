import transaction from "../utils/transaction.js";
import { audit } from "../utils/workflowEvents.js";
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
    const user = await transaction(async (session) => {
      const saved = await User.findById(request.params.id).select("name email role").session(session);
      if (!saved) throw new Error("User not found.");
      const before = saved.toObject(); saved.role = role; await saved.save({ session });
      await audit(session, request.user.userId, "user.role.update", "User", saved._id, before, saved.toObject());
      return saved;
    });
    response.json(user);
  } catch (error) {
    response.status(400).json({ message: "Could not change the role." });
  }
}

export { getAllUsers, updateUserRole };
