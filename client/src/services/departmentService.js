import api from "./api";

// Gets all departments with their populated manager details.
async function getAllDepartments() {
  const response = await api.get("/departments");
  return response.data;
}

// Creates a department for an Admin or HR user.
async function createDepartment(department) {
  const response = await api.post("/departments", department);
  return response.data;
}

// Updates an existing department.
async function updateDepartment(id, department) {
  const response = await api.put(`/departments/${id}`, department);
  return response.data;
}

// Deletes an existing department.
async function deleteDepartment(id) {
  const response = await api.delete(`/departments/${id}`);
  return response.data;
}

export {
  getAllDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
