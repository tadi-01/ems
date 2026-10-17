import { Navigate, Route, Routes, Link } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Employees from "./pages/Employees";
import Departments from "./pages/Departments";
import Attendance from "./pages/Attendance";
import Leave from "./pages/Leave";
import ProtectedRoute from "./components/ProtectedRoute";

// Shows the temporary Phase 1 home page while later features are added.
function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/departments" element={<Departments />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/leave" element={<Leave />} />
      </Route>
    </Routes>
  );
}

// Shows a simple protected page after a successful login.
function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  // Removes the saved login details from this browser.
  function logOut() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }

  return (
    <main className="page">
      <section className="welcome-box">
        <p className="eyebrow">Employee Management System</p>
        <h1>Welcome, {user?.name}</h1>
        <p>You are signed in as {user?.role}.</p>
        <nav className="dashboard-links">
          <Link className="button" to="/employees">
            Employees
          </Link>
          <Link className="button" to="/departments">
            Departments
          </Link>
          <Link className="button" to="/attendance">
            Attendance
          </Link>
          <Link className="button" to="/leave">
            Leave
          </Link>
        </nav>
        <button className="button" onClick={logOut}>
          Log out
        </button>
      </section>
    </main>
  );
}

export default App;
