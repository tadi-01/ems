import EmptyRow from "./EmptyRow";

// Displays the configured annual allowance and each employee's remaining days.
function LeaveBalances({ balances }) {
  return (
    <section>
      <h2>Annual leave balances for {balances.year}</h2>
      <div className="table-wrap" tabIndex="0" role="region" aria-label="Annual leave balances">
        <table>
          <thead><tr><th>Employee</th><th>Allowance</th><th>Used</th><th>Remaining</th></tr></thead>
          <tbody>
            {balances.balances.length === 0 && <EmptyRow columns={4}>No employee balances to display.</EmptyRow>}
            {balances.balances.map((row) => (
              <tr key={row.employee._id}>
                <td>{row.employee.employeeId} {row.employee.name}</td>
                <td>{balances.annualAllowance}</td><td>{row.usedDays}</td><td>{row.remainingDays}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
export default LeaveBalances;
