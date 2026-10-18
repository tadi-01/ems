import EmptyRow from "./EmptyRow";
// Shows money with two decimal places.
function formatMoney(value) { return Number(value).toFixed(2); }

// Shares the same payslip columns between personal and management views.
function PayrollTable({ loading = false, payslips, showEmployee, canEdit, onView, onEdit, onDelete }) {
  return (
      <div className="table-wrap" tabIndex="0" role="region" aria-label="Scrollable records">
        <table>
          <thead>
            <tr>
              {showEmployee && <th>Employee</th>}
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
          <tbody>{payslips.length === 0 && <EmptyRow columns={showEmployee ? 9 : 8}>{loading ? "Loading payslips..." : "No payslips to display. Try a different month or check with Admin or HR."}</EmptyRow>}
            {payslips.map((payslip) => (
              <tr key={payslip._id}>
                {showEmployee && <td>{payslip.employee?.name}</td>}
                <td className="nowrap">{payslip.month}</td>
                <td>{formatMoney(payslip.basicSalary)}</td>
                <td>{formatMoney(payslip.allowances)}</td>
                <td>{formatMoney(payslip.bonuses)}</td>
                <td>{formatMoney(payslip.deductions)}</td>
                <td>{formatMoney(payslip.tax)}</td>
                <td>{formatMoney(payslip.netSalary)}</td>
                <td>
                  <button onClick={() => onView(payslip)}>View</button>
                  {canEdit && (
                    <>
                      {" "}
                      <button onClick={() => onEdit(payslip)}>Edit</button>{" "}
                      <button onClick={() => onDelete(payslip._id)}>
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
  );
}

export default PayrollTable;
