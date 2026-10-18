import { Link } from "react-router-dom";

// Offers direct routes to the common daily tasks for the current role.
function QuickActions({ canManage }) {
  const actions = canManage ? [
    ["/employees", "Employee directory", "View and manage your team."],
    ["/leave", "Review leave", "Manage requests and balances."],
    ["/payroll", "Manage payroll", "Prepare monthly payslips."],
  ] : [
    ["/attendance", "Record attendance", "Check in and out for the day."],
    ["/leave", "Plan your time off", "Request leave and check your balance."],
    ["/payroll", "Your payslips", "View and print your pay records."],
  ];
  return <section className="quick-actions" aria-label="Quick actions">
    {actions.map(([to, title, description]) => <Link to={to} className="action-card" key={to}>
      <div><strong>{title}</strong><p>{description}</p></div><span aria-hidden="true">&rarr;</span>
    </Link>)}
  </section>;
}

export default QuickActions;
