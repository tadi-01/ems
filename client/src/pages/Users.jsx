import AuditHistory from "../components/AuditHistory";
import EmptyRow from "../components/EmptyRow";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getSavedUser } from "../services/session";
import { getAllUsers, updateUserRole } from "../services/userService";

// Gives Admins a role editor while keeping their own account protected.
function Users() {
  const current = getSavedUser();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (current?.role === "Admin") loadUsers(); }, []);
  // Loads only safe account fields, never password hashes.
  async function loadUsers() {
    setLoading(true);
    try { setUsers(await getAllUsers()); }
    catch (requestError) { setError(requestError.response?.data?.message || "Could not load users."); } finally { setLoading(false); }
  }
  // Saves the selected role and reloads the list to show the server's result.
  async function changeRole(id, role) {
    setError("");
    setNotice("");
    setSaving(true);
    try { await updateUserRole(id, role); await loadUsers(); setNotice("Role updated."); }
    catch (requestError) { setError(requestError.response?.data?.message || "Could not change role."); }
    finally { setSaving(false); }
  }
  if (current?.role !== "Admin") return <Navigate to="/dashboard" replace />;
  return (
    <main className="content-page">
      <h1>Users</h1>
      <p className="page-description">Manage account access and assign the right role to each person.</p>
      <p>Assign Admin, HR or Employee access. You cannot change your own role.</p>
      {error && <p className="error" role="alert">{error}</p>}
      {notice && <p className="notice" role="status">{notice}</p>}
      <div className="table-wrap" tabIndex="0" role="region" aria-label="Scrollable records"><table>
        <thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead>
        <tbody>{users.length === 0 && <EmptyRow columns={3}>{loading ? "Loading accounts..." : "No accounts to display."}</EmptyRow>}{users.map((user) => <tr key={user._id}>
          <td>{user.name}</td><td>{user.email}</td><td>
            <label className="field">Role for {user.name}
              <select value={user.role} disabled={saving || user._id === current.id}
                onChange={(event) => changeRole(user._id, event.target.value)}>
                <option>Admin</option><option>HR</option><option>Employee</option>
              </select>
            </label>
          </td>
        </tr>)}</tbody>
      </table></div>
      <AuditHistory />
    </main>
  );
}

export default Users;
