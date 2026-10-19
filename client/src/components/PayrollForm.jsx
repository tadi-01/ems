import MonthField from "./MonthField";
import { useEffect, useState } from "react";
import { getAllEmployees } from "../services/employeeService";
import { createPayslip, updatePayslip } from "../services/payrollService";

const emptyForm = {
  employee: "",
  month: "",
  basicSalary: "",
  allowances: "",
  bonuses: "",
  deductions: "",
  tax: "", overtime: "", pension: "", loanDeductions: "",
};

// Form for Admin or HR to create a payslip, or change the amounts on one.
// The net salary is not typed here; the server calculates it.
function PayrollForm({ editing, onSaved, onCancel }) {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Loads the employee list for the dropdown when the form first appears.
  useEffect(() => {
    loadEmployees();
  }, []);

  // Fills the form with a payslip when Edit is pressed, or clears it.
  useEffect(() => {
    if (editing) {
      setForm({ ...emptyForm, ...editing, employee: editing.employee?._id });
    } else {
      setForm(emptyForm);
    }
  }, [editing]);

  // Requests all employees from the backend.
  async function loadEmployees() {
    try {
      setEmployees(await getAllEmployees());
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not load employees.");
    }
  }

  // Updates one form field. Choosing an employee also fills in their salary.
  function updateField(event) {
    const { name, value } = event.target;
    const changes = { [name]: value };
    if (name === "employee") {
      const chosen = employees.find((employee) => employee._id === value);
      changes.basicSalary = chosen ? chosen.salary : "";
    }
    setForm({ ...form, ...changes });
  }

  // Sends the form to the server, then tells the page to reload its list.
  async function submitForm(event) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      if (editing) await updatePayslip(editing._id, form);
      else await createPayslip(form);
      setForm(emptyForm);
      onSaved();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not save payslip.");
    } finally { setSaving(false); }
  }

  // Builds one labelled number input so the form stays short.
  function amountField(name, label, isRequired) {
    return (
      <label className="field">
        {label}
        <input
          name={name}
          disabled={saving}
          type="number"
          min="0"
          step="0.01"
          value={form[name]}
          onChange={updateField}
          required={isRequired}
        />
      </label>
    );
  }

  return (
    <form className="data-form" onSubmit={submitForm}>
      {error && <p className="error" role="alert">{error}</p>}
      <label className="field">
        Employee
        <select
          name="employee"
          value={form.employee}
          onChange={updateField}
          disabled={Boolean(editing) || saving}
          required
        >
          <option value="">Choose an employee</option>
          {employees.map((employee) => (
            <option key={employee._id} value={employee._id}>
              {employee.employeeId} {employee.name}
            </option>
          ))}
        </select>
      </label>
      <MonthField value={form.month} onChange={updateField} disabled={Boolean(editing) || saving} required />
      {amountField("basicSalary", "Basic salary", true)}
      {amountField("allowances", "Allowances", false)}
      {amountField("bonuses", "Bonuses", false)}
      {amountField("deductions", "Deductions (including unpaid leave and absences)", false)}
      {amountField("overtime", "Overtime pay", false)}
      {amountField("tax", "PAYE / tax amount", false)}
      {amountField("pension", "NSSA / pension deduction", false)}
      {amountField("loanDeductions", "Loan deductions", false)}
      <button className="button" type="submit" disabled={saving}>
        {saving ? "Saving..." : editing ? "Update payslip" : "Prepare payroll"}
      </button>
      {editing && (
        <button className="button" type="button" disabled={saving} onClick={onCancel}>
          Cancel
        </button>
      )}
    </form>
  );
}

export default PayrollForm;
