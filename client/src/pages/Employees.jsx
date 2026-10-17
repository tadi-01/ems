import { useEffect, useState } from "react";
import {
  createEmployee,
  deleteEmployee,
  getAllEmployees,
  updateEmployee,
} from "../services/employeeService";
import { getAllDepartments } from "../services/departmentService";

const emptyForm = {
  employeeId: "",
  name: "",
  department: "",
  designation: "",
  email: "",
  phone: "",
  joiningDate: "",
  salary: "",
};

// Displays employee records and provides simple CRUD controls.
function Employees() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  // Loads employees and departments when the page opens.
  useEffect(() => {
    loadData();
  }, []);

  // Requests the current data from the backend.
  async function loadData() {
    try {
      setEmployees(await getAllEmployees());
      setDepartments(await getAllDepartments());
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not load data.");
    }
  }

  // Updates one employee form field.
  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  // Searches employees by their name, ID, or email.
  async function searchEmployees(event) {
    event.preventDefault();
    setEmployees(await getAllEmployees(search));
  }

  // Saves a new employee or updates the employee being edited.
  async function submitForm(event) {
    event.preventDefault();
    try {
      if (editingId) await updateEmployee(editingId, form);
      else await createEmployee({ ...form, salary: Number(form.salary) });
      setForm(emptyForm);
      setEditingId(null);
      await loadData();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Could not save employee.",
      );
    }
  }

  // Places an employee in the form so it can be edited.
  function startEditing(employee) {
    setEditingId(employee._id);
    setForm({
      ...employee,
      department: employee.department?._id,
      joiningDate: employee.joiningDate.slice(0, 10),
    });
  }

  // Deletes an employee after a simple confirmation.
  async function removeEmployee(id) {
    if (!window.confirm("Delete this employee?")) return;
    await deleteEmployee(id);
    await loadData();
  }

  return (
    <main className="content-page">
      <h1>Employees</h1>
      {error && <p className="error">{error}</p>}
      <form className="data-form" onSubmit={submitForm}>
        <input
          name="employeeId"
          placeholder="Employee ID"
          value={form.employeeId}
          onChange={updateField}
          required
        />
        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={updateField}
          required
        />
        <select
          name="department"
          value={form.department}
          onChange={updateField}
          required
        >
          <option value="">Department</option>
          {departments.map((department) => (
            <option key={department._id} value={department._id}>
              {department.name}
            </option>
          ))}
        </select>
        <input
          name="designation"
          placeholder="Designation"
          value={form.designation}
          onChange={updateField}
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={updateField}
          required
        />
        <input
          name="phone"
          placeholder="Phone"
          value={form.phone}
          onChange={updateField}
          required
        />
        <input
          name="joiningDate"
          type="date"
          value={form.joiningDate}
          onChange={updateField}
          required
        />
        <input
          name="salary"
          type="number"
          placeholder="Salary"
          value={form.salary}
          onChange={updateField}
          required
        />
        <button className="button" type="submit">
          {editingId ? "Update" : "Add employee"}
        </button>
      </form>
      <form className="search-form" onSubmit={searchEmployees}>
        <input
          placeholder="Search name, ID, or email"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <button className="button" type="submit">
          Search
        </button>
      </form>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Department</th>
              <th>Designation</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee._id}>
                <td>{employee.employeeId}</td>
                <td>{employee.name}</td>
                <td>{employee.department?.name}</td>
                <td>{employee.designation}</td>
                <td>{employee.email}</td>
                <td>
                  <button onClick={() => startEditing(employee)}>Edit</button>{" "}
                  <button onClick={() => removeEmployee(employee._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

export default Employees;
