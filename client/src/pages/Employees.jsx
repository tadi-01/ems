import EmployeeTable from "../components/EmployeeTable";
import EmployeeForm from "../components/EmployeeForm";
import { getAllUsers } from "../services/userService";
import { getSavedUser } from "../services/session";
import { useEffect, useState } from "react";
import {
  createEmployee,
  deleteEmployee,
  getAllEmployees,
  updateEmployee,
} from "../services/employeeService";
import { getAllDepartments } from "../services/departmentService";

const emptyForm = {
  employeeId: "",
  name: "",
  department: "",
  designation: "",
  email: "",
  phone: "",
  joiningDate: "",
  salary: "", user: "",
};

// Displays employee records and provides simple CRUD controls.
function Employees() {
  const canManage = ["Admin", "HR"].includes(getSavedUser()?.role);
  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Loads employees and departments when the page opens.
  useEffect(() => {
    loadData();
  }, []);

  // Requests the current data from the backend.
  async function loadData() {
    setLoading(true);
    try {
      setEmployees(await getAllEmployees(search));
      setDepartments(await getAllDepartments());
      if (canManage) setUsers(await getAllUsers());
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not load data.");
    } finally { setLoading(false); }
  }

  // Updates one employee form field.
  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  // Searches employees by their name, ID, or email.
  async function searchEmployees(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try { setEmployees(await getAllEmployees(search)); }
    catch (requestError) { setError(requestError.response?.data?.message || "Search failed."); } finally { setLoading(false); }
  }

  // Saves a new employee or updates the employee being edited.
  async function submitForm(event) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      if (editingId) await updateEmployee(editingId, form);
      else await createEmployee({ ...form, salary: Number(form.salary) });
      setForm(emptyForm);
      setEditingId(null);
      await loadData();
      setNotice("Employee saved.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Could not save employee.",
      );
    } finally { setSaving(false); }
  }

  // Places an employee in the form so it can be edited.
  function startEditing(employee) {
    setEditingId(employee._id);
    setForm({
      ...employee,
      department: employee.department?._id || "",
      joiningDate: employee.joiningDate.slice(0, 10),
    });
  }

  // Deletes an employee after a simple confirmation.
  async function removeEmployee(id) {
    if (!window.confirm("Delete this employee?")) return;
    setError("");
    try { await deleteEmployee(id); await loadData(); }
    catch (requestError) { setError(requestError.response?.data?.message || "Could not delete employee."); }
  }

  return (
    <main className="content-page">
      <h1>Employees</h1>
      <p className="page-description">Your team directory. Find people and keep their employment details up to date.</p>
      {error && <p className="error" role="alert">{error}</p>}
      {notice && <p className="notice" role="status">{notice}</p>}
      {canManage && <EmployeeForm saving={saving} form={form} departments={departments} users={users}
        editingId={editingId} onChange={updateField} onSubmit={submitForm}
        onCancel={() => { setForm(emptyForm); setEditingId(null); }} />}
      <form className="search-form" onSubmit={searchEmployees}>
        <label className="field">Search name, ID or email<input
          placeholder="Search name, ID, or email"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        /></label>
        <button className="button" type="submit">
          Search
        </button>
      </form>
      <EmployeeTable employees={employees} canManage={canManage} loading={loading}
        onEdit={startEditing} onDelete={removeEmployee} />
    </main>
  );
}

export default Employees;
