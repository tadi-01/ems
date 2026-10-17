// Shows money with 2 decimals, for example 1500 becomes 1500.00.
function formatMoney(value) {
  return Number(value).toFixed(2);
}

// Shows one payslip in a printable layout. The buttons have the "no-print"
// class, so the browser leaves them out of the printed page.
function Payslip({ payslip, onClose }) {
  // Prints the page using the browser's own print dialog.
  function printPayslip() {
    window.print();
  }

  return (
    <main className="content-page">
      <section className="payslip">
        <h1>Payslip</h1>
        <p>
          Employee: {payslip.employee?.name} ({payslip.employee?.employeeId})
          <br />
          Designation: {payslip.employee?.designation}
          <br />
          Pay month: {payslip.month}
        </p>
        <table>
          <tbody>
            <tr>
              <td>Basic salary</td>
              <td>{formatMoney(payslip.basicSalary)}</td>
            </tr>
            <tr>
              <td>Allowances</td>
              <td>{formatMoney(payslip.allowances)}</td>
            </tr>
            <tr>
              <td>Bonuses</td>
              <td>{formatMoney(payslip.bonuses)}</td>
            </tr>
            <tr>
              <td>Less: deductions</td>
              <td>{formatMoney(payslip.deductions)}</td>
            </tr>
            <tr>
              <td>Less: tax</td>
              <td>{formatMoney(payslip.tax)}</td>
            </tr>
            <tr>
              <th>Net salary</th>
              <th>{formatMoney(payslip.netSalary)}</th>
            </tr>
          </tbody>
        </table>
      </section>
      <div className="no-print">
        <button className="button" onClick={printPayslip}>
          Print payslip
        </button>{" "}
        <button className="button" onClick={onClose}>
          Back to list
        </button>
      </div>
    </main>
  );
}

export default Payslip;
