import BudgetRequest from "../models/BudgetRequest.js";
import transaction from "../utils/transaction.js";
import { audit } from "../utils/workflowEvents.js";
import { lockBudget } from "../utils/budgetHelpers.js";
import saveBudgetedEmployee from "../utils/employeeBudget.js";
import { readEmployeeDetails, escapeSearch } from "../utils/employeeDetails.js";
import Attendance from "../models/Attendance.js";
import Leave from "../models/Leave.js";
import Payroll from "../models/Payroll.js";
import Employee from "../models/Employee.js";

// Returns employees and optionally searches their main text fields.
async function getAllEmployees(request, response) {
  try {
    const search = escapeSearch(request.query.search || "");
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
      .select(request.user?.role === "Employee" ? "employeeId name department designation email" : "")
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
    const employee = await saveBudgetedEmployee(await readEmployeeDetails(request.body), null, request.user.userId);
    if (employee.pendingApproval) return response.status(202).json(employee);
    const savedEmployee = await employee.populate("department", "name");
    response.status(201).json(savedEmployee);
  } catch (error) {
    response.status(400).json({ message: error.message });
  }
}

// Updates one employee using its MongoDB id.
async function updateEmployee(request, response) {
  try {
    const employee = await saveBudgetedEmployee(await readEmployeeDetails(request.body), request.params.id, request.user.userId);
    if (employee.pendingApproval) return response.status(202).json(employee);
    await employee.populate("department", "name");
    response.json(employee);
  } catch (error) {
    response.status(400).json({ message: error.message });
  }
}

// Deletes one employee using its MongoDB id.
async function deleteEmployee(request, response) {
  try {
    for (const Model of [Attendance, Leave, Payroll]) {
      if (await Model.exists({ employee: request.params.id })) {
        response.status(400).json({ message: "This employee has attendance, leave or payroll history and cannot be deleted." });
        return;
      }
    }
    const employee = await transaction(async (session) => {
      const saved = await Employee.findById(request.params.id).session(session);
      if (!saved) return null;
      await lockBudget(saved.department, session);
      for (const Model of [Attendance, Leave, Payroll, BudgetRequest]) if (await Model.exists({ employee: saved._id }).session(session)) throw new Error("Employee has linked history and cannot be deleted.");
      await Employee.deleteOne({ _id: saved._id }, { session });
      await audit(session, request.user.userId, "employee.delete", "Employee", saved._id, saved.toObject(), null);
      return saved;
    });
    if (!employee) {
      response.status(404).json({ message: "Employee not found." });
      return;
    }
    response.json({ message: "Employee deleted." });
  } catch (error) {
    response.status(400).json({ message: error.message });
  }
}

export { getAllEmployees, createEmployee, updateEmployee, deleteEmployee };
