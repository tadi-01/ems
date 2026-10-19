import BudgetPanel from "../components/BudgetPanel";
import EmptyRow from "../components/EmptyRow";
import { useEffect, useState } from "react";
import { getAllDepartments, createDepartment, updateDepartment, deleteDepartment } from "../services/departmentService";
import { getAllUsers } from "../services/userService";
import { getSavedUser } from "../services/session";

const emptyForm = { name: "", manager: "", budget: "0", reason: "" };

function Departments() {
  const canManage = ["Admin", "HR"].includes(getSavedUser()?.role);
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { loadDepartments(); }, []);
  async function loadDepartments() {
    setLoading(true);
    try {
      setDepartments(await getAllDepartments());
      if (canManage) setManagers((await getAllUsers()).filter((user) => ["Admin", "HR"].includes(user.role)));
    } catch (requestError) { setError(requestError.response?.data?.message || "Could not load departments."); } finally { setLoading(false); }
  }
  function updateField(event) { setForm({ ...form, [event.target.name]: event.target.value }); }
  async function submitForm(event) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      if (editingId) await updateDepartment(editingId, form);
      else await createDepartment(form);
      setForm(emptyForm); setEditingId(null);
      await loadDepartments();
      setNotice("Department saved.");
    } catch (requestError) { setError(requestError.response?.data?.message || "Could not save department."); } finally { setSaving(false); }
  }
  function startEditing(department) {
    setEditingId(department._id);
    setForm({ name: department.name, manager: department.manager?._id || "", budget: department.budget });
  }
  async function removeDepartment(id) {
    if (!window.confirm("Delete this department?")) return;
    setError("");
    try { await deleteDepartment(id); await loadDepartments(); }
    catch (requestError) { setError(requestError.response?.data?.message || "Could not delete department."); }
  }
  return <main className="content-page">
    <h1>Departments</h1>
      <p className="page-description">The structure behind your team. View departments, managers and employee counts.</p>
    {error && <p className="error" role="alert">{error}</p>}
      {notice && <p className="notice" role="status">{notice}</p>}
    {canManage && <form className="data-form" onSubmit={submitForm}>
      <label className="field">Department name
        <input name="name" value={form.name} onChange={updateField} required />
      </label>
      <label className="field">Manager
        <select name="manager" value={form.manager} onChange={updateField} required>
          <option value="">Choose an Admin or HR manager</option>
          {managers.map((user) => <option key={user._id} value={user._id}>{user.name}</option>)}
        </select>
      </label>
      <label className="field">Budget
        <input name="budget" type="number" min="0" step="0.01" value={form.budget} onChange={updateField} disabled={Boolean(editingId) || getSavedUser()?.role !== "Admin"} required />
      </label>
      {!editingId && getSavedUser()?.role === "Admin" && <label className="field">Initial budget justification<input name="reason" value={form.reason || ""} onChange={updateField} required={Number(form.budget) > 0} /></label>}
      <button className="button" type="submit" disabled={saving}>{saving ? "Saving..." : editingId ? "Update department" : "Add department"}</button>
      {editingId && <button className="button button-secondary" type="button"
        onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancel</button>}
    </form>}
    <div className="table-wrap" tabIndex="0" role="region" aria-label="Scrollable records"><table>
      <thead><tr><th>Name</th><th>Manager</th><th>Budget</th><th>Employees</th>{canManage && <th>Actions</th>}</tr></thead>
      <tbody>{departments.length === 0 && <EmptyRow columns={canManage ? 5 : 4}>{loading ? "Loading departments..." : "No departments yet. Ask Admin or HR to add a department."}</EmptyRow>}{departments.map((department) => <tr key={department._id}>
        <td>{department.name}</td><td>{department.manager?.name}</td><td>{department.budget}</td><td>{department.employeeCount}</td>
        {canManage && <td><button onClick={() => startEditing(department)}>Edit</button>{" "}
          <button onClick={() => removeDepartment(department._id)}>Delete</button></td>}
      </tr>)}</tbody>
    </table></div>
    {canManage && <BudgetPanel refreshKey={departments} />}
  </main>;
}

export default Departments;
