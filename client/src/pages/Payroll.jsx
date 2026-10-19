import PayrollSchedule from "../components/PayrollSchedule";
import DecisionForm from "../components/DecisionForm";
import api from "../services/api";
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

// Admin and HR create and manage payslips. Other users see only their own.
function Payroll() {
  const user = getSavedUser();
  const canManage = user?.role === "Admin" || user?.role === "HR";
  const latestRequest = useRef(0);
  const [showMine, setShowMine] = useState(!canManage);
  const [payslips, setPayslips] = useState([]);
  const [monthFilter, setMonthFilter] = useState("");
  const [editing, setEditing] = useState(null);
  const [review, setReview] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  // Loads the payslip list when the page opens.
  useEffect(() => {
    loadPayslips(showMine ? "" : monthFilter);
    return () => { latestRequest.current += 1; };
  }, [showMine]);

  // Loads all payslips (Admin or HR, optionally one month) or the user's own.
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

  // Runs after the form saves: close edit mode and reload the list.
  function handleSaved() {
    setNotice("Payroll saved as pending approval.");
    setEditing(null);
    loadPayslips(monthFilter);
  }

  // Filters the list by the chosen month.
  function filterByMonth(event) {
    event.preventDefault();
    loadPayslips(monthFilter);
  }

  // Deletes a payslip after a simple confirmation.
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
      <p className="page-description">HR prepares monthly payroll; Admin reviews and approves it. Approval releases a payslip but does not record or execute payment.</p>
      {canManage && <PayrollSchedule />}
      {error && <p className="error" role="alert">{error}</p>}
      {notice && <p className="notice" role="status">{notice}</p>}
      {canManage && <div className="view-switch" aria-label="Payslip view">
        <button className={`button ${showMine ? "button-secondary" : ""}`} aria-pressed={!showMine} onClick={() => { setShowMine(false); setEditing(null); }}>All payslips</button>
        <button className={`button ${showMine ? "" : "button-secondary"}`} aria-pressed={showMine} onClick={() => { setShowMine(true); setEditing(null); }}>My payslips</button>
      </div>}
      <h2>{showMine ? "My payslips" : "All payslips"}</h2>
      {canManage && !showMine && (
        <>
          <PayrollForm
            editing={editing}
            onSaved={handleSaved}
            onCancel={() => setEditing(null)}
          />
          <form className="search-form" onSubmit={filterByMonth}>
            <MonthField value={monthFilter} onChange={(event) => setMonthFilter(event.target.value)} />
            <button className="button" type="submit">
              Filter by month
            </button>
          </form>
        </>
      )}
      {review && <DecisionForm key={review._id} title={`Review ${review.employee?.name}: ${review.month}, net ${review.netSalary}`} onClose={() => setReview(null)}
        onDecision={async (decision) => { await api.put(`/payroll/${review._id}/decision`, { ...decision, revision: review.revision }); await loadPayslips(monthFilter); }} />}
      <PayrollTable onReview={user?.role === "Admin" && !showMine ? setReview : null} loading={loading} payslips={payslips} showEmployee={canManage} canEdit={canManage && !showMine}
        onView={setViewing} onEdit={setEditing} onDelete={removePayslip} />
    </main>
  );
}

export default Payroll;
