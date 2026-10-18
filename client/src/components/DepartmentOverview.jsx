// Presents the existing department totals without changing how they are loaded.
function DepartmentOverview({ summary }) {
  return <section aria-labelledby="department-heading">
    <div className="section-heading"><div>
      <p className="section-label">People & organisation</p>
      <h2 id="department-heading">Department overview</h2>
    </div>{summary && <span className="count-label">{summary.employeesPerDepartment.length} departments</span>}</div>
    {!summary ? <p className="empty-state">Department totals will appear here when the overview loads.</p> :
      <div className="table-wrap"><table className="narrow-table">
        <thead><tr><th>Department</th><th>Employees</th></tr></thead>
        <tbody>
          {summary.employeesPerDepartment.length === 0 && <tr><td colSpan="2" className="empty-state">
            No departments yet. Add a department from the Departments page to organise your team.
          </td></tr>}
          {summary.employeesPerDepartment.map((department) => <tr key={department._id}>
            <td>{department.name}</td><td className="numeric">{department.count}</td>
          </tr>)}
        </tbody>
      </table></div>}
  </section>;
}

export default DepartmentOverview;
