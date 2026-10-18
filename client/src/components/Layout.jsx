import { useRef, useState } from "react";
import { getSavedUser, clearLogin } from "../services/session";
import { NavLink, Outlet, useLocation } from "react-router-dom";

const menuGroups = [
  { label: "Workspace", links: [["dashboard", "Overview"], ["employees", "Employees"], ["departments", "Departments"]] },
  { label: "Time & pay", links: [["attendance", "Attendance"], ["leave", "Leave"], ["payroll", "Payroll"]] },
];

// Keeps navigation predictable on desktop and collapses it on smaller screens.
function Layout() {
  const user = getSavedUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef(null);
  const location = useLocation();
  const page = location.pathname.split("/")[1];
  const title = page === "dashboard" ? "Overview" : page.charAt(0).toUpperCase() + page.slice(1);
  const initials = (user?.name || "User").split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("");

  // Ends the local session and returns to the login page.
  function logOut() { clearLogin(); window.location.href = "/login"; }
  // Returns keyboard focus when the compact menu is closed with Escape.
  function closeWithEscape(event) {
    if (event.key === "Escape") { setMenuOpen(false); menuButton.current?.focus(); }
  }
  // Closes the compact navigation and focuses the destination content.
  function followLink() {
    setMenuOpen(false);
    document.getElementById("workspace-content")?.focus();
  }

  return <div className="layout" onKeyDown={closeWithEscape}>
    <a className="skip-link" href="#workspace-content">Skip to content</a>
    <header className="topbar no-print">
      <div className="shell-identity">
        <button ref={menuButton} className="menu-toggle" aria-expanded={menuOpen}
          aria-controls="main-navigation" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? "Close menu" : "Menu"}
        </button>
        <NavLink to="/dashboard" className="shell-brand" onClick={followLink}>EMS <span>Employee Management</span></NavLink>
      </div>
      <p className="shell-location">{title}</p>
      <div className="account-menu"><span className="role-label">{user?.role}</span>
        <button className="button button-secondary" onClick={logOut}>Log out</button>
      </div>
    </header>
    <nav id="main-navigation" className={`sidebar no-print ${menuOpen ? "is-open" : ""}`} aria-label="Main navigation">
      {menuGroups.map((group) => <div className="nav-group" key={group.label}>
        <p className="nav-label">{group.label}</p>
        {group.links.map(([path, label]) => <NavLink key={path} to={`/${path}`} onClick={followLink} className="sidebar-link">{label}</NavLink>)}
      </div>)}
      {user?.role === "Admin" && <div className="nav-group"><p className="nav-label">Administration</p>
        <NavLink to="/users" className="sidebar-link" onClick={followLink}>Users & roles</NavLink>
      </div>}
      <div className="sidebar-footer"><span className="avatar">{initials}</span>
        <div><strong>{user?.name}</strong><span>{user?.role} workspace</span></div>
      </div>
    </nav>
    <div className="layout-main"><div id="workspace-content" tabIndex="-1"><Outlet /></div></div>
  </div>;
}

export default Layout;
