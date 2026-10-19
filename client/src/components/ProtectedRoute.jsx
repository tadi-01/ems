import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import api from "../services/api";
import { clearLogin, hasActiveToken, getSavedUser } from "../services/session";

// Verifies identity once per location while preserving the shared application shell.
function ProtectedRoute() {
  const location = useLocation();
  const [ready, setReady] = useState(false);
  const [expired, setExpired] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [error, setError] = useState("");
  const [, setRole] = useState(getSavedUser()?.role);
  const active = hasActiveToken();
  useEffect(() => {
    let cancelled = false;
    // Refreshes the role without trusting a role saved in browser storage.
    async function verify() {
      if (!active) return;
      setError("");
      try {
        const { data } = await api.get("/auth/me");
        if (!cancelled) {
          localStorage.setItem("user", JSON.stringify(data.user));
          setRole(data.user.role); setReady(true);
        }
      } catch { if (!cancelled) setError("Could not verify your session. Check your connection and retry."); }
    }
    verify();
    return () => { cancelled = true; };
  }, [location.pathname, active, attempt]);
  useEffect(() => {
    // Checks expiry even while the user is idle and handles API rejection in place.
    function check() { if (!hasActiveToken()) { clearLogin(); setExpired(true); } }
    const timer = setInterval(check, 1000);
    window.addEventListener("ems-session-expired", check);
    return () => { clearInterval(timer); window.removeEventListener("ems-session-expired", check); };
  }, []);
  if (!active || expired) return <Navigate to="/login" replace state={{ from: location.pathname + location.search + location.hash }} />;
  if (error) return <main className="session-state"><h1>Connection interrupted</h1><p role="alert">{error}</p>
    <button className="button" onClick={() => setAttempt(attempt + 1)}>Retry</button></main>;
  if (!ready) return <p className="session-state" role="status">Checking session...</p>;
  return <Outlet />;
}
export default ProtectedRoute;
