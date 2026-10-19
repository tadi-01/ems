import EmptyRow from "../components/EmptyRow";
import LeaveForm from "../components/LeaveForm";
import { getSavedUser } from "../services/session";
import { useEffect, useState } from "react";
import {
  applyForLeave,
  cancelLeave,
  getMyLeaves,
} from "../services/leaveService";
import LeaveReview from "../components/LeaveReview";

const emptyForm = { leaveType: "Annual", startDate: "", endDate: "", reason: "" };

function Leave() {
  const user = getSavedUser();
  const canReview = user?.role === "Admin" || user?.role === "HR";
  const [leaves, setLeaves] = useState([]);
  const [balance, setBalance] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [noEmployee, setNoEmployee] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadMyLeaves();
  }, []);

  async function loadMyLeaves() {
    try {
      const data = await getMyLeaves();
      setLeaves(data.leaves);
      setBalance(data);
      setNoEmployee(false);
    } catch (requestError) {
      if (requestError.response?.status === 404) setNoEmployee(true);
      else setError(requestError.response?.data?.message || "Could not load leave.");
    }
  }

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submitForm(event) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await applyForLeave(form);
      setForm(emptyForm);
      setMessage("Leave request sent.");
      await loadMyLeaves();
      setRefreshKey(refreshKey + 1);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not apply for leave.");
    } finally { setSaving(false); }
  }

  async function cancelRequest(id) {
    if (!window.confirm("Cancel this leave request?")) return;
    setError("");
    try {
      await cancelLeave(id);
      await loadMyLeaves();
      setRefreshKey(refreshKey + 1);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not cancel leave.");
    }
  }

  return (
    <main className="content-page">
      <h1>Leave</h1>
      <p className="page-description">Plan time away, check your balance and follow the progress of each request.</p>
      {error && <p className="error" role="alert">{error}</p>}
      {message && <p className="notice" role="status">{message}</p>}
      {!canReview && noEmployee && (
        <p>
          Ask Admin or HR to link your account on the Employees page before applying for leave.
        </p>
      )}
      {balance && (
        <p>
          Annual leave in {balance.year}: {balance.remainingAnnualDays} of{" "}
          {balance.annualAllowance} days remaining ({balance.dayMode || "calendar"} days).
        </p>
      )}
      {!noEmployee && (
        <LeaveForm saving={saving} form={form} onChange={updateField} onSubmit={submitForm} />
      )}

      <h2>My leave history</h2>
      <div className="table-wrap" tabIndex="0" role="region" aria-label="Scrollable records">
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>From</th>
              <th>To</th>
              <th>Days</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>{leaves.length === 0 && <EmptyRow columns={7}>No leave requests yet. Your requests and their status will appear here.</EmptyRow>}
            {leaves.map((leave) => (
              <tr key={leave._id}>
                <td>{leave.leaveType}</td>
                <td>{leave.startDate.slice(0, 10)}</td>
                <td>{leave.endDate.slice(0, 10)}</td>
                <td>{leave.days}</td>
                <td>{leave.reason}</td>
                <td>
                  <span className={`status status-${leave.status.toLowerCase()}`}>
                    {leave.status}
                  </span>
                </td>
                <td>
                  {leave.status === "Pending" && (
                    <button onClick={() => cancelRequest(leave._id)}>Cancel</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {canReview && <LeaveReview refreshKey={refreshKey} onReviewed={loadMyLeaves} />}
    </main>
  );
}

export default Leave;
