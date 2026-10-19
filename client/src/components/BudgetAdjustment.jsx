import { useState } from "react";
import api from "../services/api";

// Admin can increase a budget or move uncommitted funds with a recorded reason.
function BudgetAdjustment({ rows, month, onSaved }) {
  const [form, setForm] = useState({ department: "", budget: "", fromDepartment: "", reason: "" });
  const [saving, setSaving] = useState(false), [error, setError] = useState("");
  // Updates one field without discarding the rest of the proposed adjustment.
  function change(event) { setForm({ ...form, [event.target.name]: event.target.value }); }
  // Saves through the Admin-only endpoint and leaves rejected input intact.
  async function submit(event) {
    event.preventDefault(); if (saving) return; setSaving(true); setError("");
    try { await api.put(`/budgets/departments/${form.department}`, { ...form, month }); setForm({ ...form, reason: "" }); await onSaved(); }
    catch (err) { setError(err.response?.data?.message || "Could not adjust budget."); }
    finally { setSaving(false); }
  }
  return <details><summary>Adjust or reallocate monthly budget</summary><form className="data-form" onSubmit={submit}>
    {error && <p className="error" role="alert">{error}</p>}
    <label className="field">Department<select name="department" value={form.department} onChange={change} required><option value="">Choose department</option>{rows.map(({ department }) => <option key={department._id} value={department._id}>{department.name}</option>)}</select></label>
    <label className="field">New monthly budget<input name="budget" type="number" min="0" step="0.01" value={form.budget} onChange={change} required /></label>
    <label className="field">Source department<select name="fromDepartment" value={form.fromDepartment} onChange={change}><option value="">Increase budget without reallocation</option>{rows.filter(({ department }) => department._id !== form.department).map(({ department }) => <option key={department._id} value={department._id}>{department.name}</option>)}</select></label>
    <label className="field">Justification<input name="reason" value={form.reason} onChange={change} required /></label>
    <button className="button" disabled={saving}>{saving ? "Saving..." : "Save budget adjustment"}</button>
  </form></details>;
}
export default BudgetAdjustment;
