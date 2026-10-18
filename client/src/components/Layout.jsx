import { getSavedUser, clearLogin } from "../services/session";
import { NavLink, Outlet, useLocation } from "react-router-dom";

const menuGroups = [
  { label: "Workspace", links: [["dashboard", "Overview"], ["employees", "Employees"], ["departments", "Departments"]] },
  { label: "Time & pay", links: [["attendance", "Attendance"], ["leave", "Leave"], ["payroll", "Payroll"]] },
];

// Frames every protected page with grouped navigation and account information.
function Layout() {
  const user = getSavedUser();
  const location = useLocation();
  const page = location.pathname.split("/")[1];
  const title = page === "dashboard" ? "Overview" : page.charAt(0).toUpperCase() + page.slice(1);
  const initials = (user?.name || "User").split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("");

  // Ends the local session and returns to the login page.
  function logOut() { clearLogin(); window.location.href = "/login"; }

  return <div className="layout">
    <a className="skip-link" href="#workspace-content">Skip to content</a>
    <nav className="sidebar no-print" aria-label="Main navigation">
      <div className="brand"><span className="brand-mark">EM</span><span>Employee<br />Management</span></div>
      {menuGroups.map((group) => <div className="nav-group" key={group.label}>
        <p className="nav-label">{group.label}</p>
        {group.links.map(([path, label]) => <NavLink key={path} to={`/${path}`} className="sidebar-link">{label}</NavLink>)}
      </div>)}
      {user?.role === "Admin" && <div className="nav-group"><p className="nav-label">Administration</p>
        <NavLink to="/users" className="sidebar-link">Users & roles</NavLink>
      </div>}
      <div className="sidebar-footer"><span className="avatar">{initials}</span>
        <div><strong>{user?.name}</strong><span>{user?.role} workspace</span></div>
      </div>
    </nav>
    <div className="layout-main">
      <header className="topbar no-print">
        <p><span className="topbar-label">Workspace</span><span className="breadcrumb-divider">/</span>{title}</p>
        <div className="account-menu"><span className="role-label">{user?.role}</span>
          <button className="button button-secondary" onClick={logOut}>Log out</button>
        </div>
      </header>
      <div id="workspace-content" tabIndex="-1"><Outlet /></div>
    </div>
  </div>;
}

export default Layout;
