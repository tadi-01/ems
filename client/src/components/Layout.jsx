import { useEffect, useRef, useState } from "react";
import { getSavedUser, clearLogin } from "../services/session";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

import navigation from "../services/navigation";
import AccountMenu from "./AccountMenu";
import { Menu, SidePanelOpen, SidePanelClose, Close } from "@carbon/icons-react";

// Keeps navigation predictable on desktop and collapses it on smaller screens.
function Layout() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const nav = useRef(null);
  const user = getSavedUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef(null);
  const location = useLocation();
  const title = navigation.find((item) => item.path === location.pathname)?.label || "Workspace";
  const items = navigation.filter((item) => item.roles.includes(user?.role));
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);
  useEffect(() => {
    if (menuOpen) nav.current?.querySelector("a")?.focus();
    const previous = document.body.style.overflow;
    if (menuOpen && window.matchMedia("(max-width: 768px)").matches) document.body.style.overflow = "hidden";
    function resize() { setMenuOpen(false); }
    window.addEventListener("resize", resize);
    return () => { document.body.style.overflow = previous; window.removeEventListener("resize", resize); };
  }, [menuOpen]);
  const initials = (user?.name || "User").split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("");

  // Ends the local session and returns to the login page.
  function logOut() { clearLogin(); navigate("/login", { replace: true }); }
  // Returns keyboard focus when the compact menu is closed with Escape.
  function closeWithEscape(event) {
    if (menuOpen && event.key === "Tab" && window.matchMedia("(max-width: 768px)").matches) {
      const links = [...nav.current.querySelectorAll("a")];
      const first = links[0], last = links[links.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    if (event.key === "Escape") { setMenuOpen(false); menuButton.current?.focus(); }
  }
  // Closes the compact navigation and focuses the destination content.
  function followLink() {
    setMenuOpen(false);
    document.getElementById("workspace-content")?.focus();
  }

  return <div className={`layout ${collapsed ? "sidebar-collapsed" : ""}`} onKeyDown={closeWithEscape}>
    <a className="skip-link" href="#workspace-content">Skip to content</a>
    <header className="topbar no-print">
      <div className="shell-identity">
        <button type="button" ref={menuButton} className="menu-toggle" aria-expanded={menuOpen}
          aria-controls="main-navigation" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <><Close size={20} aria-hidden="true" /> Close menu</> : <><Menu size={20} aria-hidden="true" /> Menu</>}
        </button>
        <button type="button" className="desktop-toggle" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} aria-expanded={!collapsed} onClick={() => setCollapsed(!collapsed)}>{collapsed ? <SidePanelOpen size={20} aria-hidden="true" /> : <SidePanelClose size={20} aria-hidden="true" />}</button>
        <NavLink to="/dashboard" className="shell-brand" onClick={followLink} aria-label="EMS Employee Management">
          <span className="shell-brand-mark" aria-hidden="true">E</span>
          <span className="shell-brand-name">EMS</span><span>Employee Management</span>
        </NavLink>
      </div>
      <p className="shell-location">{title}</p>
      <AccountMenu user={user} onLogout={logOut} />
    </header>
    {menuOpen && <button className="drawer-backdrop no-print" aria-label="Close navigation" onClick={() => { setMenuOpen(false); menuButton.current?.focus(); }} />}
    <nav ref={nav} id="main-navigation" className={`sidebar no-print ${menuOpen ? "is-open" : ""}`} aria-label="Main navigation">
      {[...new Set(items.map((item) => item.group))].map((group) => <div className="nav-group" key={group}>
        <p className="nav-label">{group}</p>
        {items.filter((item) => item.group === group).map((item) => <NavLink end key={item.path} to={item.path} onClick={followLink} className="sidebar-link">{item.label}</NavLink>)}
      </div>)}
      <div className="sidebar-footer"><span className="avatar">{initials}</span>
        <div><strong>{user?.name}</strong><span>{user?.role} workspace</span></div>
      </div>
    </nav>
    <div className="layout-main"><div id="workspace-content" tabIndex="-1"><Outlet /></div></div>
  </div>;
}

export default Layout;
