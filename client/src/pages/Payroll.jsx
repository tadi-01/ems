import PayrollSchedule from "../components/PayrollSchedule";
import DepartmentPayroll from "../components/DepartmentPayroll";
import PayrollTable from "../components/PayrollTable";
import MonthField from "../components/MonthField";
import { getSavedUser } from "../services/session";
import { useEffect, useRef, useState } from "react";
import PayrollForm from "../components/PayrollForm";
import Payslip from "../components/Payslip";
import {
  deletePayslip,
  getAllPayslips,
  getMyPayslips,
} from "../services/payrollService";

function Payroll() {
  const user = getSavedUser();
  const canManage = user?.role === "Admin" || user?.role === "HR";
  const latestRequest = useRef(0);
  const [showMine, setShowMine] = useState(!canManage);
  const [payslips, setPayslips] = useState([]);
  const [monthFilter, setMonthFilter] = useState("");
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const editor = useRef(null);
  function editPayslip(slip) {
    setEditing(slip);
    if (editor.current) editor.current.open = true;
    editor.current?.scrollIntoView({ block: "start" });
  }

  useEffect(() => {
    loadPayslips(showMine ? "" : monthFilter);
    return () => { latestRequest.current += 1; };
  }, [showMine]);

  async function loadPayslips(month) {
    const requestNumber = ++latestRequest.current;
    setError("");
    setPayslips([]);
    setLoading(true);
    try {
      const rows = showMine ? await getMyPayslips() : await getAllPayslips(month);
      if (requestNumber === latestRequest.current) setPayslips(rows);
    } catch (requestError) {
      if (requestNumber === latestRequest.current) setError(requestError.response?.data?.message || "Could not load payslips.");
    } finally { if (requestNumber === latestRequest.current) setLoading(false); }
  }

  function handleSaved() {
    setNotice("Payroll saved as pending approval.");
    setEditing(null);
    loadPayslips(monthFilter);
  }

  function filterByMonth(event) {
    event.preventDefault();
    loadPayslips(monthFilter);
  }

  async function removePayslip(id) {
    if (!window.confirm("Void this pending payroll record? Its audit history will be retained.")) return;
    try {
      await deletePayslip(id);
      await loadPayslips(monthFilter);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not delete payslip.");
    }
  }

  if (viewing) {
    return <Payslip payslip={viewing} onClose={() => setViewing(null)} />;
  }

  return (
    <main className="content-page">
      <h1>Payroll</h1>
      <p className="page-description">{canManage ? "Manage department payroll and payslips." : "View your approved payslips and recorded external payment details."}</p>
      {canManage && <PayrollSchedule />}
      {error && <p className="error" role="alert">{error}</p>}
      {notice && <p className="notice" role="status">{notice}</p>}
      {canManage && <div className="view-switch" aria-label="Payslip view">
        <button className={`button ${showMine ? "button-secondary" : ""}`} aria-pressed={!showMine} onClick={() => { setShowMine(false); setEditing(null); }}>All payslips</button>
      </div>}
      <h2>{canManage ? "All payslips" : "My payslips"}</h2>
      {canManage && !showMine && <DepartmentPayroll role={user.role} refreshKey={payslips} onEdit={editPayslip} onView={setViewing} onChanged={() => loadPayslips(monthFilter)} />}
      {canManage && !showMine && (
        <>
          <details ref={editor} style={{ scrollMarginTop: "5rem" }}>
            <summary>{editing ? "Edit payroll" : "Prepare payroll"}</summary>
            <PayrollForm
            editing={editing}
            onSaved={handleSaved}
            onCancel={() => setEditing(null)}
          /></details>
          <form className="search-form" onSubmit={filterByMonth}>
            <MonthField value={monthFilter} onChange={(event) => setMonthFilter(event.target.value)} />
            <button className="button" type="submit">
              Filter by month
            </button>
          </form>
        </>
      )}
      <PayrollTable loading={loading} payslips={payslips} showEmployee={canManage} canEdit={canManage && !showMine}
        onView={setViewing} onEdit={editPayslip} onDelete={removePayslip} />
    </main>
  );
}

export default Payroll;
