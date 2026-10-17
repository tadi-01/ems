import Employee from "../models/Employee.js";

// Returns employees and optionally searches their main text fields.
async function getAllEmployees(request, response) {
  try {
    const search = request.query.search || "";
    const searchFilter = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { employeeId: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};
    const employees = await Employee.find(searchFilter)
      .populate("department", "name")
      .sort({ name: 1 });
    response.json(employees);
  } catch (error) {
    response.status(500).json({ message: "Could not load employees." });
  }
}

// Creates an employee from the submitted form values.
async function createEmployee(request, response) {
  try {
    const employee = await Employee.create(request.body);
    const savedEmployee = await employee.populate("department", "name");
    response.status(201).json(savedEmployee);
  } catch (error) {
    response.status(400).json({ message: "Could not create employee." });
  }
}

// Updates one employee using its MongoDB id.
async function updateEmployee(request, response) {
  try {
    const employee = await Employee.findByIdAndUpdate(
      request.params.id,
      request.body,
      {
        new: true,
        runValidators: true,
      },
    ).populate("department", "name");
    if (!employee) {
      response.status(404).json({ message: "Employee not found." });
      return;
    }
    response.json(employee);
  } catch (error) {
    response.status(400).json({ message: "Could not update employee." });
  }
}

// Deletes one employee using its MongoDB id.
async function deleteEmployee(request, response) {
  try {
    const employee = await Employee.findByIdAndDelete(request.params.id);
    if (!employee) {
      response.status(404).json({ message: "Employee not found." });
      return;
    }
    response.json({ message: "Employee deleted." });
  } catch (error) {
    response.status(400).json({ message: "Could not delete employee." });
  }
}

export { getAllEmployees, createEmployee, updateEmployee, deleteEmployee };
