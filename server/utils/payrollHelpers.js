// Checks that a month is written as YYYY-MM, for example 2026-10.
function isValidMonth(month) {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(month);
}

// Turns a typed value into a money number rounded to 2 decimals.
// An empty value means 0. Returns null when it is not a number or is negative.
function readAmount(value) {
  if (value === undefined || value === null || value === "") return 0;
  if (!["number", "string"].includes(typeof value)) return null;
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) return null;
  return Math.round(amount * 100) / 100;
}

// Works out net salary: basic + allowances + bonuses - deductions - tax.
// It is rounded to 2 decimals to avoid small errors such as 0.1 + 0.2.
function calculateNetSalary(amounts) {
  const net =
    amounts.basicSalary +
    amounts.allowances +
    amounts.bonuses -
    amounts.deductions -
    amounts.tax;
  return Math.round(net * 100) / 100;
}

// Reads the money fields from a request body and works out the net salary.
// Returns { amounts } when everything is valid, or { error } with a message.
// The browser never sends the net salary; the server always calculates it.
function readPayslipAmounts(body, defaultBasicSalary) {
  const basicValue =
    body.basicSalary === undefined || body.basicSalary === ""
      ? defaultBasicSalary
      : body.basicSalary;
  const amounts = {
    basicSalary: readAmount(basicValue),
    allowances: readAmount(body.allowances),
    bonuses: readAmount(body.bonuses),
    deductions: readAmount(body.deductions),
    tax: readAmount(body.tax),
  };

  if (Object.values(amounts).includes(null)) {
    return { error: "Amounts must be numbers that are zero or more." };
  }

  amounts.netSalary = calculateNetSalary(amounts);
  if (amounts.netSalary < 0) {
    return { error: "Deductions and tax cannot be more than the earnings." };
  }

  return { amounts };
}

export { isValidMonth, readAmount, calculateNetSalary, readPayslipAmounts };
