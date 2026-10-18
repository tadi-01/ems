import EmptyRow from "./EmptyRow";
import LeaveBalances from "./LeaveBalances";
import { useEffect, useState } from "react";
import {
  approveLeave,
  getAllLeaves,
  getLeaveBalances,
  rejectLeave,
} from "../services/leaveService";

// The Admin and HR part of the Leave page: review requests and see balances.
// The refreshKey changes when the page above sends or cancels a request,
// which makes this list load again.
function LeaveReview({ refreshKey, onReviewed }) {
  const [requests, setRequests] = useState([]);
  const [balances, setBalances] = useState(null);
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  // Loads the requests and balances on first show, on filter change and on refresh.
  useEffect(() => {
    loadData();
  }, [statusFilter, refreshKey]);

  // Requests the filtered leave requests and the balances from the backend.
  async function loadData() {
    setLoading(true);
    setError("");
    try {
      setRequests(await getAllLeaves(statusFilter));
      setBalances(await getLeaveBalances());
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not load requests. Change the filter to try again.");
    } finally { setLoading(false); }
  }

  // Approves or rejects one request and then reloads the tables.
  async function reviewRequest(action, id) {
    if (reviewing) return;
    setReviewing(true);
    setNotice("");
    setError("");
    try {
      await action(id);
      setNotice("Leave request updated.");
      onReviewed();
      await loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not review request.");
    } finally { setReviewing(false); }
  }

  return (
    <>
      <h2>Leave requests</h2>
      {notice && <p className="notice" role="status">{notice}</p>}
      {reviewing && <p role="status">Updating leave request...</p>}
      {error && <p className="error" role="alert">{error}</p>}
      <div className="search-form">
        <label className="field">Request status<select disabled={loading || reviewing} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="">All</option>
          <option>Pending</option>
          <option>Approved</option>
          <option>Rejected</option>
          <option>Cancelled</option>
        </select></label>
      </div>
      <div className="table-wrap" tabIndex="0" role="region" aria-label="Scrollable records">
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Type</th>
              <th>From</th>
              <th>To</th>
              <th>Days</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 && <EmptyRow columns={8}>{loading ? "Loading requests..." : "No leave requests match this status."}</EmptyRow>}
            {requests.map((request) => (
              <tr key={request._id}>
                <td>
                  {request.employee?.employeeId} {request.employee?.name}
                </td>
                <td>{request.leaveType}</td>
                <td>{request.startDate.slice(0, 10)}</td>
                <td>{request.endDate.slice(0, 10)}</td>
                <td>{request.days}</td>
                <td>{request.reason}</td>
                <td>
                  <span className={`status status-${request.status.toLowerCase()}`}>
                    {request.status}
                  </span>
                </td>
                <td>
                  {request.status === "Pending" && (
                    <>
                      <button disabled={reviewing || loading} onClick={() => reviewRequest(approveLeave, request._id)}>
                        Approve
                      </button>{" "}
                      <button disabled={reviewing || loading} onClick={() => reviewRequest(rejectLeave, request._id)}>
                        Reject
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {balances && <LeaveBalances balances={balances} />}
    </>
  );
}

export default LeaveReview;
