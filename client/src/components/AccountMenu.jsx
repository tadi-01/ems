import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { Notification, UserAvatar, Logout } from "@carbon/icons-react";

// Keeps identity and workflow notifications in the existing masthead.
function AccountMenu({ user, onLogout }) {
  const [panel, setPanel] = useState("");
  const [data, setData] = useState({ items: [], unread: 0 });
  const [error, setError] = useState("");
  const container = useRef(null);
  useEffect(() => {
    load(); const timer = setInterval(load, 60000);
    function close(event) { if (!container.current?.contains(event.target)) setPanel(""); }
    document.addEventListener("pointerdown", close);
    return () => { clearInterval(timer); document.removeEventListener("pointerdown", close); };
  }, []);
  // Refreshes unread state without replacing the application shell.
  async function load() {
    try { const { data: next } = await api.get("/workflow/notifications"); setData(next); setError(""); }
    catch { setError("Notifications unavailable. Try again."); }
  }
  // A failed read update leaves the notification available for retry.
  async function markRead(id) {
    try { await api.put(`/workflow/notifications/${id}/read`); await load(); }
    catch { setError("Could not mark this notification read."); }
  }
  // Clears only this account's notifications, including older unread items.
  async function markAllRead() {
    try { await api.put("/workflow/notifications/read-all"); await load(); }
    catch { setError("Could not mark notifications read."); }
  }
  // Permanently removes all of this account's notifications.
  async function clearAll() {
    try { await api.delete("/workflow/notifications"); await load(); }
    catch { setError("Could not clear notifications."); }
  }
  return <div className="account-menu" ref={container} onKeyDown={(event) => {
    if (event.key === "Escape") { setPanel(""); container.current?.querySelector("button")?.focus(); }
  }}>
    <button type="button" className="account-icon-button notification-button" aria-label={`Notifications, ${data.unread} unread`} aria-expanded={panel === "notifications"}
      onClick={() => { setPanel(panel === "notifications" ? "" : "notifications"); load(); }}>
      <Notification size={20} aria-hidden="true" />
      {data.unread > 0 && <span className="notification-count" aria-hidden="true">{data.unread > 9 ? "9+" : data.unread}</span>}
    </button>
    <button type="button" className="profile-button" aria-label={`Open profile for ${user?.name || "user"}`} aria-expanded={panel === "profile"}
      onClick={() => setPanel(panel === "profile" ? "" : "profile")}>
      <span className="profile-avatar" aria-hidden="true"><UserAvatar size={20} /></span>
      <span className="profile-summary"><span className="masthead-name">{user?.name}</span><span className="role-label">{user?.role}</span></span>
    </button>
    {panel && <section className="masthead-panel" aria-label={panel === "profile" ? "Account" : "Notifications"}>
      {panel === "profile" ? <><strong>{user?.name}</strong><p>{user?.email}</p><button className="button" onClick={onLogout}>Log out <Logout size={16} aria-hidden="true" /></button></> : <>
        <div className="notification-heading"><h2>Notifications</h2><div className="notification-heading-actions">{data.unread > 0 && <button onClick={markAllRead}>Mark all read</button>}{data.items.length > 0 && <button onClick={clearAll}>Clear all</button>}</div></div>{error && <p role="alert">{error} <button onClick={load}>Retry</button></p>}
        {!error && !data.items.length && <p>No notifications yet.</p>}
        <div className="notification-list">{data.items.map((item) => <div className="notification-row" key={item._id}>
          <Link to={item.path} onClick={() => setPanel("")}>{item.message}</Link>
          <div className="notification-meta"><small>{!item.readAt && "Unread · "}{new Date(item.createdAt).toLocaleString()}</small>
          {!item.readAt && <button onClick={() => markRead(item._id)}>Mark read</button>}
          </div>
        </div>)}</div>
      </>}
    </section>}
  </div>;
}
export default AccountMenu;
