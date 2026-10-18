// Presents the existing department totals without changing how they are loaded.
function DepartmentOverview({ summary, loading, error }) {
  return <section aria-labelledby="department-heading">
    <div className="section-heading"><div>
      <p className="section-label">People & organisation</p>
      <h2 id="department-heading">Department overview</h2>
    </div>{summary && <span className="count-label">{summary.employeesPerDepartment.length} {summary.employeesPerDepartment.length === 1 ? "department" : "departments"}</span>}</div>
    {!summary ? <p className="empty-state">{error ? "Department totals are unavailable. Use Try again above." : loading ? "Loading department totals..." : "No department totals available."}</p> :
      <div className="table-wrap" tabIndex="0" role="region" aria-label="Scrollable records"><table className="narrow-table">
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
