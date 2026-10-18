import { useEffect, useState } from "react";
import { getAllDepartments, createDepartment, updateDepartment, deleteDepartment } from "../services/departmentService";
import { getAllUsers } from "../services/userService";
import { getSavedUser } from "../services/session";

const emptyForm = { name: "", manager: "", budget: "" };

// Lists departments for everyone, with an editor only for Admin and HR.
function Departments() {
  const canManage = ["Admin", "HR"].includes(getSavedUser()?.role);
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => { loadDepartments(); }, []);
  // Loads calculated counts and eligible managers without exposing account details to employees.
  async function loadDepartments() {
    try {
      setDepartments(await getAllDepartments());
      if (canManage) setManagers((await getAllUsers()).filter((user) => ["Admin", "HR"].includes(user.role)));
    } catch (requestError) { setError(requestError.response?.data?.message || "Could not load departments."); }
  }
  // Updates one field in the shared form state.
  function updateField(event) { setForm({ ...form, [event.target.name]: event.target.value }); }
  // Saves a new department or updates the selected department.
  async function submitForm(event) {
    event.preventDefault();
    setError("");
    try {
      if (editingId) await updateDepartment(editingId, form);
      else await createDepartment(form);
      setForm(emptyForm); setEditingId(null);
      await loadDepartments();
    } catch (requestError) { setError(requestError.response?.data?.message || "Could not save department."); }
  }
  // Copies only editable values into the department form.
  function startEditing(department) {
    setEditingId(department._id);
    setForm({ name: department.name, manager: department.manager?._id || "", budget: department.budget });
  }
  // Reports deletion errors, including departments which still have employees.
  async function removeDepartment(id) {
    if (!window.confirm("Delete this department?")) return;
    setError("");
    try { await deleteDepartment(id); await loadDepartments(); }
    catch (requestError) { setError(requestError.response?.data?.message || "Could not delete department."); }
  }
  return <main className="content-page">
    <h1>Departments</h1>
    {error && <p className="error">{error}</p>}
    {canManage && <form className="data-form" onSubmit={submitForm}>
      <label className="field">Department name
        <input name="name" value={form.name} onChange={updateField} required />
      </label>
      <label className="field">Manager
        <select name="manager" value={form.manager} onChange={updateField} required>
          <option value="">Choose an Admin or HR manager</option>
          {managers.map((user) => <option key={user._id} value={user._id}>{user.name} ({user.email})</option>)}
        </select>
      </label>
      <label className="field">Budget
        <input name="budget" type="number" min="0" step="0.01" value={form.budget} onChange={updateField} required />
      </label>
      <button className="button" type="submit">{editingId ? "Update department" : "Add department"}</button>
      {editingId && <button className="button button-secondary" type="button"
        onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancel</button>}
    </form>}
    <div className="table-wrap"><table>
      <thead><tr><th>Name</th><th>Manager</th><th>Budget</th><th>Employees</th>{canManage && <th>Actions</th>}</tr></thead>
      <tbody>{departments.map((department) => <tr key={department._id}>
        <td>{department.name}</td><td>{department.manager?.name}</td><td>{department.budget}</td><td>{department.employeeCount}</td>
        {canManage && <td><button onClick={() => startEditing(department)}>Edit</button>{" "}
          <button onClick={() => removeDepartment(department._id)}>Delete</button></td>}
      </tr>)}</tbody>
    </table></div>
  </main>;
}

export default Departments;
