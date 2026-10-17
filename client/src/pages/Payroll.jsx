import { useEffect, useState } from "react";
import PayrollForm from "../components/PayrollForm";
import Payslip from "../components/Payslip";
import {
  deletePayslip,
  getAllPayslips,
  getMyPayslips,
} from "../services/payrollService";

// Shows money with 2 decimals, for example 1500 becomes 1500.00.
function formatMoney(value) {
  return Number(value).toFixed(2);
}

// Admin and HR create and manage payslips. Other users see only their own.
function Payroll() {
  const user = JSON.parse(localStorage.getItem("user"));
  const canManage = user?.role === "Admin" || user?.role === "HR";
  const [payslips, setPayslips] = useState([]);
  const [monthFilter, setMonthFilter] = useState("");
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [error, setError] = useState("");

  // Loads the payslip list when the page opens.
  useEffect(() => {
    loadPayslips("");
  }, []);

  // Loads all payslips (Admin or HR, optionally one month) or the user's own.
  async function loadPayslips(month) {
    setError("");
    try {
      setPayslips(canManage ? await getAllPayslips(month) : await getMyPayslips());
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not load payslips.");
    }
  }

  // Runs after the form saves: close edit mode and reload the list.
  function handleSaved() {
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
    if (!window.confirm("Delete this payslip?")) return;
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
      {error && <p className="error">{error}</p>}
      {canManage && (
        <>
          <PayrollForm
            editing={editing}
            onSaved={handleSaved}
            onCancel={() => setEditing(null)}
          />
          <form className="search-form" onSubmit={filterByMonth}>
            <input
              type="month"
              value={monthFilter}
              onChange={(event) => setMonthFilter(event.target.value)}
            />
            <button className="button" type="submit">
              Filter by month
            </button>
          </form>
        </>
      )}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {canManage && <th>Employee</th>}
              <th>Month</th>
              <th>Basic</th>
              <th>Allowances</th>
              <th>Bonuses</th>
              <th>Deductions</th>
              <th>Tax</th>
              <th>Net salary</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payslips.map((payslip) => (
              <tr key={payslip._id}>
                {canManage && <td>{payslip.employee?.name}</td>}
                <td>{payslip.month}</td>
                <td>{formatMoney(payslip.basicSalary)}</td>
                <td>{formatMoney(payslip.allowances)}</td>
                <td>{formatMoney(payslip.bonuses)}</td>
                <td>{formatMoney(payslip.deductions)}</td>
                <td>{formatMoney(payslip.tax)}</td>
                <td>{formatMoney(payslip.netSalary)}</td>
                <td>
                  <button onClick={() => setViewing(payslip)}>View</button>
                  {canManage && (
                    <>
                      {" "}
                      <button onClick={() => setEditing(payslip)}>Edit</button>{" "}
                      <button onClick={() => removePayslip(payslip._id)}>
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

export default Payroll;
