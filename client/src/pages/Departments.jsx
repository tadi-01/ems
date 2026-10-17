import { useEffect, useState } from "react";
import {
  getAllDepartments,
  createDepartment,
  deleteDepartment,
} from "../services/departmentService";
import api from "../services/api";

// Displays departments and allows Admin or HR users to manage them.
function Departments() {
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({
    name: "",
    manager: "",
    budget: "",
    employeeCount: 0,
  });
  const [error, setError] = useState("");

  // Loads departments when the page opens.
  useEffect(() => {
    loadDepartments();
  }, []);

  // Requests all departments from the backend.
  async function loadDepartments() {
    try {
      setDepartments(await getAllDepartments());
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Could not load departments.",
      );
    }
  }

  // Updates one department form field.
  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  // Creates a department from the form.
  async function submitForm(event) {
    event.preventDefault();
    try {
      await createDepartment({
        ...form,
        budget: Number(form.budget),
        employeeCount: Number(form.employeeCount),
      });
      setForm({ name: "", manager: "", budget: "", employeeCount: 0 });
      await loadDepartments();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Could not create department.",
      );
    }
  }

  // Deletes a department after a simple confirmation.
  async function removeDepartment(id) {
    if (!window.confirm("Delete this department?")) return;
    await deleteDepartment(id);
    await loadDepartments();
  }

  return (
    <main className="content-page">
      <h1>Departments</h1>
      {error && <p className="error">{error}</p>}
      <form className="data-form" onSubmit={submitForm}>
        <input
          name="name"
          placeholder="Department name"
          value={form.name}
          onChange={updateField}
          required
        />
        <input
          name="manager"
          placeholder="Manager user ID"
          value={form.manager}
          onChange={updateField}
          required
        />
        <input
          name="budget"
          type="number"
          placeholder="Budget"
          value={form.budget}
          onChange={updateField}
          required
        />
        <input
          name="employeeCount"
          type="number"
          placeholder="Employee count"
          value={form.employeeCount}
          onChange={updateField}
          required
        />
        <button className="button" type="submit">
          Add department
        </button>
      </form>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Manager</th>
              <th>Budget</th>
              <th>Employees</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((department) => (
              <tr key={department._id}>
                <td>{department.name}</td>
                <td>{department.manager?.name}</td>
                <td>{department.budget}</td>
                <td>{department.employeeCount}</td>
                <td>
                  <button onClick={() => removeDepartment(department._id)}>
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

export default Departments;
