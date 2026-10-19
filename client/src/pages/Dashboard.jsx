import DepartmentOverview from "../components/DepartmentOverview";
import QuickActions from "../components/QuickActions";
import { getSavedUser } from "../services/session";
import { useEffect, useState } from "react";
import { getDashboardSummary } from "../services/dashboardService";

function SummaryCard({ label, value, detail }) {
  return (
    <div className="card">
      <p className="card-label">{label}</p>
      <p className="card-value">{value}</p>
      <p className="card-detail">{detail}</p>
    </div>
  );
}

function Dashboard() {
  const user = getSavedUser();
  const canSeeTotals = user?.role === "Admin" || user?.role === "HR";
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(canSeeTotals);
  const [error, setError] = useState("");

  useEffect(() => {
    if (canSeeTotals) loadSummary();
  }, []);

  async function loadSummary() {
    setLoading(true);
    setError("");
    try {
      setSummary(await getDashboardSummary());
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not load totals. Check your connection and try again.");
    } finally { setLoading(false); }
  }

  return (
    <main className="content-page">
      <div className="page-heading"><div>
        <p className="section-label">Your workspace at a glance</p>
        <h1>Overview</h1>
        <p className="overview-greeting">Welcome back, {user?.name?.split(" ")[0] || "there"}.</p>
        <p className="page-description">{canSeeTotals ? "Here is an overview of your people, time and payroll." : "Everything you need for your workday, in one place."}</p>
      </div><span className="role-label">{canSeeTotals ? "Team overview" : "Employee overview"}</span></div>
      {error && <div className="error" role="alert"><p>{error}</p><button className="button button-secondary" onClick={loadSummary} disabled={loading}>Try again</button></div>}
      {canSeeTotals && loading && <p className="empty-state" role="status">Loading your team overview...</p>}
      {summary && (
        <>
          <div className="card-grid">
            <SummaryCard label="Total employees" value={summary.totalEmployees} detail="Across all departments" />
            <SummaryCard label="Present today" value={summary.presentToday} detail={summary.date} />
            <SummaryCard label="On leave today" value={summary.onLeaveToday} detail="Approved time off" />
            <SummaryCard
              label="Monthly payroll" detail={`${summary.month} · Recorded net, not payments`}
              value={Number(summary.monthlyPayroll).toFixed(2)}
            />
          </div>
        </>
      )}
      <div className="dashboard-columns">
        {canSeeTotals ? <DepartmentOverview summary={summary} loading={loading} error={Boolean(error)} /> : <section className="employee-welcome">
          <p className="section-label">Your daily essentials</p>
          <h2>A little clarity for <em>every workday.</em></h2>
          <p>Record your attendance, plan time away and find your payslips. Your personal records are always available from the workspace menu.</p>
          <p>Choose a task to get started.</p>
        </section>}
        <aside className="dashboard-support" aria-label="Workspace tasks">
          <div className="section-heading"><div><p className="section-label">Next steps</p>
            <h2>{canSeeTotals ? "Manage your workspace" : "Start your day"}</h2>
          </div></div>
          <QuickActions canManage={canSeeTotals} />
          <div className="support-note"><p className="section-label">A useful reminder</p>
            <p>{canSeeTotals ? "Keep employee accounts linked to their records so attendance, leave and payslips stay connected." : "Missing a personal record? Ask Admin or HR to check that your account is linked to your employee profile."}</p>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default Dashboard;
