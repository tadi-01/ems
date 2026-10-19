import BudgetRequest from "../models/BudgetRequest.js";
import Payroll from "../models/Payroll.js";
import { lockBudget } from "../utils/budgetHelpers.js";
import transaction from "../utils/transaction.js";
import { audit } from "../utils/workflowEvents.js";
import Employee from "../models/Employee.js";
import User from "../models/User.js";
import Department from "../models/Department.js";

// Returns all departments with the manager's name and email.
async function getAllDepartments(request, response) {
  try {
    const departments = await Department.find()
      .populate("manager", "name email")
      .sort({ name: 1 });
    const rows = [];
    for (const department of departments) {
      rows.push({ ...department.toObject(), employeeCount:
        await Employee.countDocuments({ department: department._id }) });
    }
    response.json(rows);
  } catch (error) {
    response.status(500).json({ message: "Could not load departments." });
  }
}

// Validates the manager and copies only editable department fields.
async function readDepartmentDetails(body) {
  const manager = await User.findOne({ _id: body.manager, role: { $in: ["Admin", "HR"] } });
  if (!manager) throw new Error("Choose an Admin or HR manager.");
  return { name: body.name, manager: manager._id, budget: body.budget };
}

// Creates a department from the submitted form values.
async function createDepartment(request, response) {
  try {
    if (request.user.role !== "Admin" && Number(request.body.budget) !== 0) throw new Error("Admin must set the department budget. Create it with a zero budget first.");
    if (Number(request.body.budget) > 0 && !request.body.reason?.trim()) throw new Error("Enter an initial budget justification.");
    const department = await transaction(async (session) => {
      const [saved] = await Department.create([await readDepartmentDetails(request.body)], { session });
      await audit(session, request.user.userId, "department.create", "Department", saved._id, null, saved.toObject(), request.body.reason);
      return saved;
    });
    const savedDepartment = await department.populate("manager", "name email");
    response.status(201).json(savedDepartment);
  } catch (error) {
    response.status(400).json({ message: error.message });
  }
}

// Updates one department using its MongoDB id.
async function updateDepartment(request, response) {
  try {
    const department = await transaction(async (session) => {
      const saved = await Department.findById(request.params.id).session(session);
      if (!saved) throw new Error("Department not found.");
      if (Number(request.body.budget) !== saved.budget) throw new Error("Use the Admin budget adjustment form with a justification.");
      const before = saved.toObject();
      Object.assign(saved, await readDepartmentDetails(request.body)); await saved.save({ session });
      await audit(session, request.user.userId, "department.update", "Department", saved._id, before, saved.toObject());
      return saved.populate("manager", "name email");
    });
    response.json(department);
  } catch (error) {
    response.status(400).json({ message: error.message });
  }
}

// Deletes one department using its MongoDB id.
async function deleteDepartment(request, response) {
  try {
    if (await Employee.exists({ department: request.params.id })) {
      response.status(400).json({ message: "Move the department's employees before deleting it." });
      return;
    }
    const department = await transaction(async (session) => {
      const saved = await lockBudget(request.params.id, session);
      if (await Employee.exists({ department: saved._id }).session(session) || await BudgetRequest.exists({ department: saved._id }).session(session) || await Payroll.exists({ department: saved._id }).session(session)) throw new Error("Department has employee or financial history and cannot be deleted.");
      await Department.deleteOne({ _id: saved._id }, { session });
      await audit(session, request.user.userId, "department.delete", "Department", saved._id, saved.toObject(), null);
      return saved;
    });
    if (!department) {
      response.status(404).json({ message: "Department not found." });
      return;
    }
    response.json({ message: "Department deleted." });
  } catch (error) {
    response.status(400).json({ message: error.message });
  }
}

export {
  getAllDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
