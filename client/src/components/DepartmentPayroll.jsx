import { useEffect, useState } from "react";
import api from "../services/api";
import DecisionForm from "./DecisionForm";
import PayrollTable from "./PayrollTable";

// Keeps monthly department preparation, review and external-payment tracking together.
function DepartmentPayroll({ refreshKey, onEdit, onView, onChanged }) {
  const [month, setMonth] = useState(new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Harare" }).slice(0, 7));
  const [rows, setRows] = useState([]), [selected, setSelected] = useState("");
  const [error, setError] = useState(""), [notice, setNotice] = useState(""), [busy, setBusy] = useState(false);
  const [review, setReview] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true; setBusy(true); setError(""); setRows([]); setReview(false);
    api.get(`/payroll/departments?month=${month}`).then(({ data }) => { if (active) setRows(data); })
      .catch((err) => { if (active) setError(err.response?.data?.message || "Could not load department payroll."); })
      .finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, [month, refreshKey, revision]);
  const batch = rows.find((row) => row.department._id === selected) || rows[0];
  const pending = batch?.slips.filter((slip) => slip.status === "Pending approval") || [];
  const total = (key) => (batch?.slips.filter((slip) => !["Rejected", "Voided"].includes(slip.status)).reduce((sum, slip) => sum + Number(slip[key] || 0), 0) || 0).toFixed(2);
  // Refreshes both the department and existing payslip views after a successful action.
  function changed(message) { setNotice(message); setRevision((value) => value + 1); onChanged(); }
  async function prepare() {
    setBusy(true); setError("");
    try { const { data } = await api.post(`/payroll/departments/${batch.department._id}/prepare`, { month }); changed(data.message); }
    catch (err) { setError(err.response?.data?.message || "Could not prepare payroll."); }
    finally { setBusy(false); }
  }
  return <section aria-label="Department payroll">
    <h2>Department payroll</h2>
    <div className="search-form">
      <label className="field">Pay month<input type="month" value={month} onChange={(event) => setMonth(event.target.value)} /></label>
      <label className="field">Department<select value={batch?.department._id || ""} onChange={(event) => { setSelected(event.target.value); setReview(false); setNotice(""); }}>
        {rows.map((row) => <option key={row.department._id} value={row.department._id}>{row.department.name}</option>)}
      </select></label>
    </div>
    {error && <p className="error" role="alert">{error} <button onClick={() => setRevision((value) => value + 1)}>Retry</button></p>}
    {notice && <p className="notice" role="status">{notice}</p>}
    {busy && <p role="status">Loading department payroll...</p>}
    {!busy && !batch && !error && <p>Create a department and add employees to prepare payroll.</p>}
    {batch && <>
      <p>{batch.slips.length} records · Bonuses {total("bonuses")} · Net total {total("netSalary")}</p>
      <button className="button" disabled={busy} onClick={prepare}>Prepare missing payroll</button>{" "}
      {!!pending.length && <button className="button button-secondary" disabled={busy} onClick={() => setReview(true)}>Approve department payroll</button>}
      {review && <DecisionForm key={`${batch.version}-${batch.department._id}`} title={`Approve payroll: ${batch.department.name}, ${month}`}
        onClose={() => setReview(false)} onDecision={async (decision) => {
          await api.put(`/payroll/departments/${batch.department._id}/decision`, { ...decision, month, version: batch.version });
          changed("Payroll decision recorded.");
        }} />}
      <PayrollTable payslips={batch.slips} showEmployee canEdit onView={onView} onEdit={onEdit} />
    </>}
  </section>;
}
export default DepartmentPayroll;
