import api from "./api";

// Sends a new leave request for the logged-in employee.
async function applyForLeave(leave) {
  const response = await api.post("/leaves", leave);
  return response.data;
}

// Gets the employee's own leave history and Annual leave balance.
async function getMyLeaves() {
  const response = await api.get("/leaves/me");
  return response.data;
}

// Cancels one of the employee's own Pending requests.
async function cancelLeave(id) {
  const response = await api.put(`/leaves/${id}/cancel`);
  return response.data;
}

// Gets every leave request for Admin or HR, with an optional status filter.
async function getAllLeaves(status = "") {
  const response = await api.get(`/leaves?status=${encodeURIComponent(status)}`);
  return response.data;
}

// Approves a Pending request (Admin or HR).
async function approveLeave(id) {
  const response = await api.put(`/leaves/${id}/approve`);
  return response.data;
}

// Rejects a Pending request (Admin or HR).
async function rejectLeave(id) {
  const response = await api.put(`/leaves/${id}/reject`);
  return response.data;
}

// Gets each employee's Annual leave used and remaining (Admin or HR).
async function getLeaveBalances() {
  const response = await api.get("/leaves/balances");
  return response.data;
}

export {
  applyForLeave,
  getMyLeaves,
  cancelLeave,
  getAllLeaves,
  approveLeave,
  rejectLeave,
  getLeaveBalances,
};
