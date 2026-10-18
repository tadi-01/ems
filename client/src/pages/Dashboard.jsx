import QuickActions from "../components/QuickActions";
import { getSavedUser } from "../services/session";
import { useEffect, useState } from "react";
import { getDashboardSummary } from "../services/dashboardService";

// Shows one total as a small card with a label above the number.
function SummaryCard({ label, value, detail }) {
  return (
    <div className="card">
      <p className="card-label">{label}</p>
      <p className="card-value">{value}</p>
      <p className="card-detail">{detail}</p>
    </div>
  );
}

// The home page. Admin and HR see company totals; other users see a welcome.
function Dashboard() {
  const user = getSavedUser();
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
      <div className="page-heading"><div>
        <p className="section-label">Your workspace at a glance</p>
        <h1>Welcome, {user?.name?.split(" ")[0] || "there"}.</h1>
        <p className="page-description">{canSeeTotals ? "Here is an overview of your people, time and payroll." : "Everything you need for your workday, in one place."}</p>
      </div><span className="role-label">{canSeeTotals ? "Team overview" : "Employee overview"}</span></div>
      {error && <p className="error" role="alert">{error}</p>}
      {canSeeTotals && !summary && !error && <p className="empty-state" role="status">Loading your team overview...</p>}
      {summary && (
        <>
          <div className="card-grid">
            <SummaryCard label="Total employees" value={summary.totalEmployees} detail="Across all departments" />
            <SummaryCard label="Present today" value={summary.presentToday} detail={summary.date} />
            <SummaryCard label="On leave today" value={summary.onLeaveToday} detail="Approved time off" />
            <SummaryCard
              label="Monthly payroll" detail={summary.month}
              value={Number(summary.monthlyPayroll).toFixed(2)}
            />
          </div>
          <div className="section-heading"><div><h2>Department overview</h2><p>How your team is distributed.</p></div><span className="count-label">{summary.employeesPerDepartment.length} departments</span></div>
          <div className="table-wrap">
            <table className="narrow-table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Employees</th>
                </tr>
              </thead>
              <tbody>
                {summary.employeesPerDepartment.length === 0 && <tr><td colSpan="2" className="empty-state">No departments yet. Add a department to start organising your team.</td></tr>}
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
      <div className="section-heading"><h2>{canSeeTotals ? "Manage your workspace" : "Start your day"}</h2></div>
      <QuickActions canManage={canSeeTotals} />
    </main>
  );
}

export default Dashboard;
