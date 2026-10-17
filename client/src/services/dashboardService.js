import api from "./api";

// Gets the dashboard totals for Admin or HR.
async function getDashboardSummary() {
  const response = await api.get("/dashboard");
  return response.data;
}

export { getDashboardSummary };
