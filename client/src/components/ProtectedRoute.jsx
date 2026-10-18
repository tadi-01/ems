import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import api from "../services/api";
import { clearLogin, hasActiveToken } from "../services/session";

// Verifies the session on navigation and refreshes roles from the server.
function ProtectedRoute() {
  const location = useLocation();
  const [checkedPath, setCheckedPath] = useState(null);
  const [error, setError] = useState("");
  const active = hasActiveToken();
  useEffect(() => {
    let cancelled = false;
    // Loads the current account before rendering pages that depend on its role.
    async function verifySession() {
      if (!active) { clearLogin(); return; }
      setError("");
      try {
        const { data } = await api.get("/auth/me");
        if (!cancelled) {
          localStorage.setItem("user", JSON.stringify(data.user));
          setCheckedPath(location.pathname);
        }
      } catch {
        if (!cancelled) setError("Could not verify your session. Refresh to try again.");
      }
    }
    verifySession();
    return () => { cancelled = true; };
  }, [location.pathname, active]);
  if (!active) return <Navigate to="/login" replace />;
  if (error) return <main className="session-state"><h1>Connection interrupted</h1>
    <p className="error" role="alert">{error}</p>
    <button className="button" onClick={() => window.location.reload()}>Try again</button>
  </main>;
  if (checkedPath !== location.pathname) return <p className="session-state" role="status">Checking session...</p>;
  return <Outlet />;
}

export default ProtectedRoute;
