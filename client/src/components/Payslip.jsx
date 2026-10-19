import downloadPayslip from "../services/downloadPayslip";
// Shows money with 2 decimals, for example 1500 becomes 1500.00.
function formatMoney(value) {
  return Number(value).toFixed(2);
}

// Shows one payslip in a printable layout. The buttons have the "no-print"
// class, so the browser leaves them out of the printed page.
function Payslip({ payslip, onClose }) {
  const person = payslip.employeeSnapshot?.name ? payslip.employeeSnapshot : payslip.employee;
  // Prints the page using the browser's own print dialog.
  function printPayslip() {
    window.print();
  }

  return (
    <main className="content-page">
      <section className="payslip">
        {payslip.companyName && <h2>{payslip.companyName}</h2>}
        <h1>Payslip</h1>
        <p>Status: {payslip.status || "Historical"}. This document is not confirmation of payment.</p>
        <p>Issued: {payslip.createdAt ? new Date(payslip.createdAt).toLocaleDateString() : "Not recorded"}
          {payslip.currency && <> | Currency: {payslip.currency}</>}
        </p>
        <p>
          Employee: {person?.name} ({person?.employeeId})
          <br />
          Designation: {person?.designation}
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
            {[['Overtime', payslip.overtime], ['Less: NSSA / pension', payslip.pension], ['Less: loan deductions', payslip.loanDeductions]].map(([label, amount]) => <tr key={label}><td>{label}</td><td>{formatMoney(amount || 0)}</td></tr>)}
            <tr>
              <td>Less: other deductions</td>
              <td>{formatMoney(payslip.deductions)}</td>
            </tr>
            <tr>
              <td>Less: PAYE / tax</td>
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
        <button className="button button-secondary" onClick={() => downloadPayslip(payslip)}>Download payslip</button>{" "}
        <button className="button" onClick={onClose}>
          Back to list
        </button>
      </div>
    </main>
  );
}

export default Payslip;
