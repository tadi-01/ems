// Downloads a self-contained printable HTML payslip with escaped record values.
function downloadPayslip(payslip) {
  const escape = (value) => String(value ?? "").replace(/[&<>"']/g, (letter) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[letter]);
  const person = payslip.employeeSnapshot?.name ? payslip.employeeSnapshot : payslip.employee;
  const rows = [["Basic salary", payslip.basicSalary], ["Allowances", payslip.allowances], ["Bonuses", payslip.bonuses], ["Overtime", payslip.overtime], ["PAYE / tax", payslip.tax], ["NSSA / pension", payslip.pension], ["Loan deductions", payslip.loanDeductions], ["Other deductions", payslip.deductions], ["Net salary", payslip.netSalary]];
  const html = `<!doctype html><html lang="en"><meta charset="utf-8"><title>Payslip ${escape(payslip.month)}</title><style>body{font:16px Arial;color:#161616;max-width:650px;margin:40px auto;padding:24px}table{width:100%;border-collapse:collapse}td,th{padding:12px;text-align:left;border-bottom:1px solid #c6c6c6}</style><h1>Payslip</h1><p>${escape(payslip.companyName)}</p><p>${escape(person?.name)} · ${escape(person?.employeeId)} · ${escape(person?.designation)}</p><p>${escape(payslip.month)} · ${escape(payslip.currency)} · ${escape(payslip.status || "Historical")}</p><table><thead><tr><th>Item</th><th>Amount</th></tr></thead><tbody>${rows.map(([label, amount]) => `<tr><td>${label}</td><td>${Number(amount || 0).toFixed(2)}</td></tr>`).join("")}</tbody></table><p>${payslip.paidAt ? `External payment recorded: ${escape(payslip.paymentReference)}` : "External payment has not been recorded."}</p></html>`;
  const url = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" }));
  const link = document.createElement("a"); link.href = url; link.download = `payslip-${payslip.month}.html`; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export default downloadPayslip;
