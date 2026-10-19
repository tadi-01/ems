import { useState } from "react";
import api from "../services/api";

// Shows paged sensitive-action history within the existing Admin page.
function AuditHistory() {
  const [rows, setRows] = useState([]), [page, setPage] = useState(1), [error, setError] = useState("");
  const [loading, setLoading] = useState(false), [opened, setOpened] = useState(false);
  // Fetches append-only events without exposing an update or delete control.
  async function load(number) {
    setLoading(true); setError("");
    try { const { data } = await api.get(`/workflow/audit?page=${number}`); setRows(data); setPage(number); }
    catch { setError("Could not load audit history."); }
    finally { setLoading(false); }
  }
  return <details onToggle={(event) => { if (event.currentTarget.open && !opened) { setOpened(true); load(1); } }}><summary>Audit history</summary>
    {error && <p role="alert">{error} <button onClick={() => load(page)}>Retry</button></p>}
    {loading && <p role="status">Loading history...</p>}
    {!rows.length && !loading && <p>No events on this page.</p>}
    {rows.map((row) => <details key={row._id}><summary>{new Date(row.createdAt).toLocaleString()} · {row.actor?.name || "Recorded account"} · {row.action}</summary>
      <p>{row.entity} {row.entityId}</p><p>{row.reason || "No additional justification recorded."}</p>
      <pre className="audit-values">{JSON.stringify({ before: row.before, after: row.after }, null, 2)}</pre>
    </details>)}
    <button className="button button-secondary" disabled={page === 1 || loading} onClick={() => load(page - 1)}>Previous</button>{" "}
    <button className="button button-secondary" disabled={rows.length < 50 || loading} onClick={() => load(page + 1)}>Next</button>
  </details>;
}
export default AuditHistory;
