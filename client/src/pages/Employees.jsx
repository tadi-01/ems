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
  email: "",
  phone: "",
  joiningDate: "",
  salary: "", user: "",
};

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

  useEffect(() => {
    loadData();
  }, []);

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

  function updateField(event) {
    const { name, value } = event.target;
    if (name === "user") {
      const linkedUser = users.find((user) => user._id === value);
      setForm((current) => ({
        ...current,
        user: value,
        ...(linkedUser ? {
          name: linkedUser.name,
          email: linkedUser.email,
          phone: linkedUser.phone || current.phone,
        } : {}),
      }));
      return;
    }
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function searchEmployees(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try { setEmployees(await getAllEmployees(search)); }
    catch (requestError) { setError(requestError.response?.data?.message || "Search failed."); } finally { setLoading(false); }
  }

  async function submitForm(event) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const result = editingId ? await updateEmployee(editingId, form) : await createEmployee({ ...form, salary: Number(form.salary) });
      setForm(emptyForm);
      setEditingId(null);
      await loadData();
      setNotice(result.pendingApproval ? result.message : "Employee saved.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Could not save employee.",
      );
    } finally { setSaving(false); }
  }

  function startEditing(employee) {
    setEditingId(employee._id);
    setForm({
      ...employee,
      department: employee.department?._id || "",
      joiningDate: employee.joiningDate.slice(0, 10),
    });
  }

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
