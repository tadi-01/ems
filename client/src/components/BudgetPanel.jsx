import { useEffect, useState } from "react";
import api from "../services/api";
import { getSavedUser } from "../services/session";
import DecisionForm from "./DecisionForm";
import BudgetAdjustment from "./BudgetAdjustment";
import MonthField from "./MonthField";

// Extends Departments with commitments and approvals instead of adding another tab.
function BudgetPanel({ refreshKey }) {
  const admin = getSavedUser()?.role === "Admin";
  const [data, setData] = useState({ rows: [], requests: [] });
  const [month, setMonth] = useState("");
  const [form, setForm] = useState({ department: "", amount: "", reason: "" });
  const [review, setReview] = useState(null), [error, setError] = useState("");
  const [saving, setSaving] = useState(false), [notice, setNotice] = useState("");
  useEffect(() => { load(); }, [month, refreshKey]);
  // Refreshes the selected month using the company-date default on the server.
  async function load() {
    try { const { data: next } = await api.get(`/budgets?month=${encodeURIComponent(month)}`); setData(next); setError(""); }
    catch (err) { setError(err.response?.data?.message || "Could not load budget usage."); }
  }
  // Saves an expense or holds it pending when the monthly budget is exceeded.
  async function submit(event) {
    event.preventDefault(); if (saving) return; setSaving(true); setNotice("");
    try {
      const { data: item } = await api.post("/budgets/expenses", { ...form, month: month || data.rows[0]?.month });
      setNotice(`Expense ${item.status.toLowerCase()}.`); setForm({ ...form, amount: "", reason: "" }); await load();
    } catch (err) { setError(err.response?.data?.message || "Could not save expense."); }
    finally { setSaving(false); }
  }
  return <section><h2>Monthly budgets and commitments</h2><p>Salary commitments and gross payroll are counted once. Approved expenses add to the total. Existing salary costs over budget are flagged for Admin attention.</p>
    <MonthField value={month} onChange={(event) => setMonth(event.target.value)} />
    {error && <p className="error" role="alert">{error} <button onClick={load}>Retry</button></p>}
    {notice && <p className="notice" role="status">{notice}</p>}
    <div className="table-wrap" tabIndex="0" role="region" aria-label="Monthly budget usage"><table><thead><tr><th>Department</th><th>Budget</th><th>Committed</th><th>Remaining</th><th>Usage</th></tr></thead><tbody>
      {data.rows.map((row) => <tr key={row.department._id}><td>{row.department.name}</td><td>{row.budget.toFixed(2)}</td><td>{row.committed.toFixed(2)}</td><td>{row.remaining.toFixed(2)}</td><td>{row.percent}% {row.exceeded ? "— Over budget: Admin action needed" : row.percent >= 90 ? "— 90% warning" : row.percent >= 80 ? "— 80% warning" : ""}</td></tr>)}
    </tbody></table></div>
    {admin && <BudgetAdjustment rows={data.rows} month={month || data.rows[0]?.month} onSaved={load} />}
    <details><summary>Record an expense</summary><form className="data-form" onSubmit={submit}>
      <label className="field">Department<select required value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}><option value="">Choose department</option>{data.rows.map(({ department }) => <option key={department._id} value={department._id}>{department.name}</option>)}</select></label>
      <label className="field">Amount<input type="number" min="0.01" step="0.01" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></label>
      <label className="field">Justification<input required value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></label>
      <button className="button" disabled={saving}>{saving ? "Saving..." : "Save expense request"}</button>
    </form></details>
    <h2>Budget requests</h2>
    {!data.requests.length && <p>No budget requests yet.</p>}
    {data.requests.map((item) => <div className="notification-row" key={item._id}><strong>{item.kind} · {item.department?.name} · {item.month} · {Number(item.amount).toFixed(2)}</strong><span>{item.status} — {item.reason}</span>{item.details && <details><summary>Employee request details</summary><pre className="audit-values">{JSON.stringify(item.details, null, 2)}</pre></details>}
      {admin && item.status === "Pending approval" && <button className="button button-secondary" onClick={() => setReview(item)}>Review request</button>}</div>)}
    {review && <DecisionForm key={review._id} title={`Review ${review.kind}: ${review.amount}`} onClose={() => setReview(null)} onDecision={async (decision) => { await api.put(`/budgets/requests/${review._id}`, decision); await load(); }} />}
  </section>;
}
export default BudgetPanel;
