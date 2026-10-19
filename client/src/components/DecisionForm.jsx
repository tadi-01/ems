import { useState } from "react";

// Keeps approval justification and explicit re-confirmation beside the reviewed record.
function DecisionForm({ title, onDecision, onClose }) {
  const [decision, setDecision] = useState("Approved");
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  // Retains the entered justification when the server rejects a stale decision.
  async function submit(event) {
    event.preventDefault(); if (saving) return;
    setSaving(true); setError("");
    try {       await onDecision({ decision, confirmed }); onClose(); }
    catch (err) { setError(err.response?.data?.message || "Could not record the decision."); }
    finally { setSaving(false); }
  }
  return <section><h2>{title}</h2><form className="data-form" onSubmit={submit}>
    {error && <p className="error" role="alert">{error}</p>}
    <label className="field">Decision<select value={decision} onChange={(event) => { setDecision(event.target.value); setConfirmed(false); }} disabled={saving}><option>Approved</option><option>Rejected</option></select></label>

    <label className="confirmation"><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} required disabled={saving} />I have reviewed this record and confirm this decision.</label>
    <button className="button" disabled={saving}>{saving ? "Recording..." : "Confirm decision"}</button>
    <button type="button" className="button button-secondary" onClick={onClose} disabled={saving}>Cancel</button>
  </form></section>;
}
export default DecisionForm;
