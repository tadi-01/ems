import api from "./api";

// Gets employees and sends an optional search term to the API.
async function getAllEmployees(search = "") {
  const response = await api.get(
    `/employees?search=${encodeURIComponent(search)}`,
  );
  return response.data;
}

// Creates an employee for an Admin or HR user.
async function createEmployee(employee) {
  const response = await api.post("/employees", employee);
  return response.data;
}

// Updates an existing employee.
async function updateEmployee(id, employee) {
  const response = await api.put(`/employees/${id}`, employee);
  return response.data;
}

// Deletes an existing employee.
async function deleteEmployee(id) {
  const response = await api.delete(`/employees/${id}`);
  return response.data;
}

export { getAllEmployees, createEmployee, updateEmployee, deleteEmployee };
