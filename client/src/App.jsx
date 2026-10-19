import RoleRoute from "./components/RoleRoute";
import Settings from "./pages/Settings";
import RouteError from "./pages/RouteError";
import { Navigate, Route, Routes } from "react-router-dom";
import Users from "./pages/Users";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Departments from "./pages/Departments";
import Attendance from "./pages/Attendance";
import Leave from "./pages/Leave";
import Payroll from "./pages/Payroll";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

// Lists every page. Login and Register are public. All other pages need a
// login and are shown inside the Layout (sidebar and top bar).
function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route element={<RoleRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/departments" element={<Departments />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/leave" element={<Leave />} />
          <Route path="/payroll" element={<Payroll />} />
          <Route path="/403" element={<RouteError forbidden />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/users" element={<Users />} />
          <Route path="*" element={<RouteError />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
