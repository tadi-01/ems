import { useEffect, useState } from "react";
import { getDashboardSummary } from "../services/dashboardService";

// Shows one total as a small card with a label above the number.
function SummaryCard({ label, value }) {
  return (
    <div className="card">
      <p className="card-label">{label}</p>
      <p className="card-value">{value}</p>
    </div>
  );
}

// The home page. Admin and HR see company totals; other users see a welcome.
function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  const canSeeTotals = user?.role === "Admin" || user?.role === "HR";
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  // Loads the totals when the page opens (Admin and HR only).
  useEffect(() => {
    if (canSeeTotals) loadSummary();
  }, []);

  // Requests the dashboard totals from the backend.
  async function loadSummary() {
    try {
      setSummary(await getDashboardSummary());
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not load totals.");
    }
  }

  return (
    <main className="content-page">
      <h1>Dashboard</h1>
      <p>
        Welcome, {user?.name}. You are signed in as {user?.role}.
      </p>
      {error && <p className="error">{error}</p>}
      {!canSeeTotals && (
        <p>
          Use the menu on the left to check in, apply for leave or view your
          payslips.
        </p>
      )}
      {summary && (
        <>
          <div className="card-grid">
            <SummaryCard label="Total employees" value={summary.totalEmployees} />
            <SummaryCard label={`Present today (${summary.date})`} value={summary.presentToday} />
            <SummaryCard label="On leave today" value={summary.onLeaveToday} />
            <SummaryCard
              label={`Monthly payroll (${summary.month})`}
              value={Number(summary.monthlyPayroll).toFixed(2)}
            />
          </div>
          <h2>Employees per department</h2>
          <div className="table-wrap">
            <table className="narrow-table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Employees</th>
                </tr>
              </thead>
              <tbody>
                {summary.employeesPerDepartment.map((department) => (
                  <tr key={department._id}>
                    <td>{department.name}</td>
                    <td>{department.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
}

export default Dashboard;
