import Department from "../models/Department.js";

// Returns all departments with the manager's name and email.
async function getAllDepartments(request, response) {
  try {
    const departments = await Department.find()
      .populate("manager", "name email")
      .sort({ name: 1 });
    response.json(departments);
  } catch (error) {
    response.status(500).json({ message: "Could not load departments." });
  }
}

// Creates a department from the submitted form values.
async function createDepartment(request, response) {
  try {
    const department = await Department.create(request.body);
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
      request.body,
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
