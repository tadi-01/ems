import { getSavedUser } from "../services/session";
import { NavLink, Outlet } from "react-router-dom";

const menuLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/employees", label: "Employees" },
  { to: "/departments", label: "Departments" },
  { to: "/attendance", label: "Attendance" },
  { to: "/leave", label: "Leave" },
  { to: "/payroll", label: "Payroll" },
];

// The frame around every logged-in page: a left sidebar with the menu, a top
// bar showing who is logged in, and the current page in the content area.
// The sidebar and top bar have "no-print" so they are left out of printed payslips.
function Layout() {
  const user = getSavedUser();

  // Removes the saved login details from this browser.
  function logOut() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }

  return (
    <div className="layout">
      <nav className="sidebar no-print">
        <p className="sidebar-title">Employee Management</p>
        {user?.role === "Admin" && <NavLink to="/users" className="sidebar-link">Users</NavLink>}
        {menuLinks.map((link) => (
          <NavLink key={link.to} to={link.to} className="sidebar-link">
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="layout-main">
        <header className="topbar no-print">
          <span>
            {user?.name} ({user?.role})
          </span>
          <button className="button button-secondary" onClick={logOut}>
            Log out
          </button>
        </header>
        <Outlet />
      </div>
    </div>
  );
}

export default Layout;
