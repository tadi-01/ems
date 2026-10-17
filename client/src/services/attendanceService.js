import api from "./api";

// Records a check-in for the logged-in employee.
async function checkIn() {
  const response = await api.post("/attendance/check-in");
  return response.data;
}

// Records a check-out for the logged-in employee.
async function checkOut() {
  const response = await api.post("/attendance/check-out");
  return response.data;
}

// Gets the logged-in employee's own attendance history.
async function getMyAttendance() {
  const response = await api.get("/attendance/me");
  return response.data;
}

// Gets everyone's attendance for Admin or HR, with an optional date filter.
async function getAllAttendance(date = "") {
  const response = await api.get(`/attendance?date=${encodeURIComponent(date)}`);
  return response.data;
}

export { checkIn, checkOut, getMyAttendance, getAllAttendance };
