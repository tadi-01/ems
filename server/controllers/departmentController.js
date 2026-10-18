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
    const department = await Department.create(await readDepartmentDetails(request.body));
    const savedDepartment = await department.populate("manager", "name email");
    response.status(201).json(savedDepartment);
  } catch (error) {
    response.status(400).json({ message: "Could not create department." });
  }
}

// Updates one department using its MongoDB id.
async function updateDepartment(request, response) {
  try {
    const department = await Department.findByIdAndUpdate(
      request.params.id,
      await readDepartmentDetails(request.body),
      {
        new: true,
        runValidators: true,
      },
    ).populate("manager", "name email");
    if (!department) {
      response.status(404).json({ message: "Department not found." });
      return;
    }
    response.json(department);
  } catch (error) {
    response.status(400).json({ message: "Could not update department." });
  }
}

// Deletes one department using its MongoDB id.
async function deleteDepartment(request, response) {
  try {
    if (await Employee.exists({ department: request.params.id })) {
      response.status(400).json({ message: "Move the department's employees before deleting it." });
      return;
    }
    const department = await Department.findByIdAndDelete(request.params.id);
    if (!department) {
      response.status(404).json({ message: "Department not found." });
      return;
    }
    response.json({ message: "Department deleted." });
  } catch (error) {
    response.status(400).json({ message: "Could not delete department." });
  }
}

export {
  getAllDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
