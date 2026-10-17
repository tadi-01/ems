import api from "./api";

// Gets every payslip for Admin or HR, with an optional month filter.
async function getAllPayslips(month = "") {
  const response = await api.get(`/payroll?month=${encodeURIComponent(month)}`);
  return response.data;
}

// Gets only the logged-in employee's own payslips.
async function getMyPayslips() {
  const response = await api.get("/payroll/me");
  return response.data;
}

// Creates a payslip for one employee and month (Admin or HR).
async function createPayslip(payslip) {
  const response = await api.post("/payroll", payslip);
  return response.data;
}

// Changes the amounts on an existing payslip (Admin or HR).
async function updatePayslip(id, payslip) {
  const response = await api.put(`/payroll/${id}`, payslip);
  return response.data;
}

// Deletes a payslip (Admin or HR).
async function deletePayslip(id) {
  const response = await api.delete(`/payroll/${id}`);
  return response.data;
}

export {
  getAllPayslips,
  getMyPayslips,
  createPayslip,
  updatePayslip,
  deletePayslip,
};
