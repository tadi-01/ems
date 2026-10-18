// Shows labelled calendar fields while leaving policy validation to the server.
function LeaveForm({ saving = false, form, onChange, onSubmit }) {
  return <form className="data-form" onSubmit={onSubmit}>
    <label className="field">Leave type
      <select name="leaveType" value={form.leaveType} onChange={onChange} disabled={saving}>
        <option>Annual</option><option>Sick</option><option>Unpaid</option>
      </select>
    </label>
    <label className="field">Start date
      <input name="startDate" type="date" value={form.startDate} onChange={onChange} disabled={saving} required />
    </label>
    <label className="field">End date
      <input name="endDate" type="date" value={form.endDate} min={form.startDate} onChange={onChange} disabled={saving} required />
    </label>
    <label className="field">Reason
      <input name="reason" value={form.reason} onChange={onChange} disabled={saving} required />
    </label>
    <button className="button" type="submit" disabled={saving}>{saving ? "Sending..." : "Apply for leave"}</button>
  </form>;
}

export default LeaveForm;
