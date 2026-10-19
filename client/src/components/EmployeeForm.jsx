const fields = [
  ["employeeId", "Employee ID", "text"], ["name", "Name", "text"],
  ["email", "Email", "email"],
  ["phone", "Phone", "tel"], ["joiningDate", "Joining date", "date"],
  ["salary", "Salary", "number"],
];

// Keeps the labelled employee editor separate from the listing page.
function EmployeeForm({ saving = false, form, departments, users, editingId, onChange, onSubmit, onCancel }) {
  return <form className="data-form" onSubmit={onSubmit}>
    {fields.map(([name, label, type]) => <label className="field" key={name}>
      {label}<input name={name} type={type} value={form[name]} onChange={onChange} disabled={saving}
        min={type === "number" ? "0" : undefined} step={type === "number" ? "0.01" : undefined} required />
    </label>)}
    <label className="field">Department
      <select name="department" value={form.department} onChange={onChange} disabled={saving} required>
        <option value="">Choose a department</option>
        {departments.map((department) => <option key={department._id} value={department._id}>{department.name}</option>)}
      </select>
    </label>
    <label className="field">Linked account
      <select name="user" value={form.user || ""} onChange={onChange} disabled={saving}>
        <option value="">Match by email on first use</option>
        {users.map((user) => <option key={user._id} value={user._id}>{user.name}</option>)}
      </select>
    </label>
    <button className="button" type="submit" disabled={saving}>{saving ? "Saving..." : editingId ? "Update employee" : "Add employee"}</button>
    {editingId && <button className="button button-secondary" type="button" disabled={saving} onClick={onCancel}>Cancel</button>}
  </form>;
}

export default EmployeeForm;
