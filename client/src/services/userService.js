import api from "./api";

// Loads account names for management dropdowns and the Users page.
async function getAllUsers() {
  return (await api.get("/users")).data;
}

// Changes one user's role through the Admin-only endpoint.
async function updateUserRole(id, role) {
  return (await api.put(`/users/${id}/role`, { role })).data;
}

export { getAllUsers, updateUserRole };
