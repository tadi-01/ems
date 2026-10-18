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

// Lets an employee apply for leave, cancel Pending requests and see their
// history. Admin and HR also see the review section below.
function Leave() {
  const user = getSavedUser();
  const canReview = user?.role === "Admin" || user?.role === "HR";
  const [leaves, setLeaves] = useState([]);
  const [balance, setBalance] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [noEmployee, setNoEmployee] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Loads the leave history when the page opens.
  useEffect(() => {
    loadMyLeaves();
  }, []);

  // Requests the employee's history and balance from the backend.
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

  // Updates one form field when the user types or selects a value.
  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  // Sends the leave request, then refreshes the history and the review list.
  async function submitForm(event) {
    event.preventDefault();
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
    }
  }

  // Cancels a Pending request after a simple confirmation.
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
      {error && <p className="error">{error}</p>}
      {message && <p>{message}</p>}
      {noEmployee && (
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
        <LeaveForm form={form} onChange={updateField} onSubmit={submitForm} />
      )}

      <h2>My leave history</h2>
      <div className="table-wrap">
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
          <tbody>
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
