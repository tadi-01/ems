import { Navigate, Outlet } from "react-router-dom";

// Sends unauthenticated visitors to login before showing protected pages.
function ProtectedRoute() {
  const token = localStorage.getItem("token");

  return token ? <Outlet /> : <Navigate to="/login" replace />;
}

export default ProtectedRoute;
