import { useEffect, useState } from "react";
import api from "../services/api";

// Admin owns monthly planning dates; payment dates never initiate transfers.
function Settings() {
  const [form, setForm] = useState(null), [dates, setDates] = useState(null);
  const [zone, setZone] = useState("");
  const [reason, setReason] = useState(""), [error, setError] = useState("");
  const [notice, setNotice] = useState(""), [saving, setSaving] = useState(false);
  useEffect(() => { load(); }, []);
  // Loads defaults and the current month's company-timezone planning dates.
  async function load() {
    try { const { data } = await api.get("/settings"); setForm({ ...data.settings, holidays: data.settings.holidays.join(", ") }); setDates(data.dates); setZone(data.timeZone); setError(""); }
    catch (err) { setError(err.response?.data?.message || "Could not load settings."); }
  }
  // Validates on the server and retains input if configuration is rejected.
  async function save(event) {
    event.preventDefault(); if (saving) return; setSaving(true); setNotice(""); setError("");
    try {
      await api.put("/settings", { ...form, reason, holidays: form.holidays.split(",").map((day) => day.trim()).filter(Boolean) });
      await load(); setReason(""); setNotice("Settings saved. Automatic preparation requires the backend to remain running.");
    } catch (err) { setError(err.response?.data?.message || "Could not save settings."); }
    finally { setSaving(false); }
  }
  // Updates an individual setting without losing the rest of the form.
  function change(event) { setForm({ ...form, [event.target.name]: event.target.value }); }
  return <main className="content-page"><h1>Settings</h1><p className="page-description">Monthly payroll planning in {zone || "the company timezone"}. Admin approves payroll; no bank, mobile-money or cash payment is executed by EMS.</p>
    {error && <p className="error" role="alert">{error} {!form && <button onClick={load}>Retry</button>}</p>}
    {notice && <p className="notice" role="status">{notice}</p>}
    {!form && !error && <p role="status">Loading settings...</p>}
    {form && <form className="data-form" onSubmit={save}>
      <label className="field">Preparation day<input name="preparationDay" type="number" min="1" max="28" required value={form.preparationDay} onChange={change} /></label>
      <label className="field">Approval due day<input name="approvalDay" type="number" min="1" max="28" required value={form.approvalDay} onChange={change} /></label>
      <label className="field">Planned payment date<select name="paymentRule" value={form.paymentRule} onChange={change}><option value="last-working-day">Last working day</option><option value="fixed-day">Fixed day</option></select></label>
      {form.paymentRule === "fixed-day" && <label className="field">Planned payment day<input name="paymentDay" type="number" min="1" max="28" required value={form.paymentDay} onChange={change} /></label>}
      <label className="field">Public holidays (YYYY-MM-DD, comma-separated)<input name="holidays" value={form.holidays} onChange={change} /></label>
      <label className="confirmation"><input type="checkbox" checked={form.automaticPreparation} onChange={(event) => setForm({ ...form, automaticPreparation: event.target.checked })} />Enable automatic monthly preparation. HR must review deductions before approval.</label>
      <label className="field">Justification<input required value={reason} onChange={(event) => setReason(event.target.value)} /></label>
      <button className="button" disabled={saving}>{saving ? "Saving..." : "Save settings"}</button>
    </form>}
    {dates && <section><h2>This month's schedule</h2><p>Prepare: {dates.preparation} · Approval due: {dates.approvalDue} · Planned payment: {dates.plannedPayment}</p><p>Existing salary obligations are retained and flagged when budgets are exceeded. Automatic preparation catches up for the current month after downtime; earlier months remain a manual HR task.</p></section>}
  </main>;
}
export default Settings;
