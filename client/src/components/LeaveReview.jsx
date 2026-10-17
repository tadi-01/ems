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
function LeaveReview({ refreshKey }) {
  const [requests, setRequests] = useState([]);
  const [balances, setBalances] = useState(null);
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [error, setError] = useState("");

  // Loads the requests and balances on first show, on filter change and on refresh.
  useEffect(() => {
    loadData();
  }, [statusFilter, refreshKey]);

  // Requests the filtered leave requests and the balances from the backend.
  async function loadData() {
    try {
      setRequests(await getAllLeaves(statusFilter));
      setBalances(await getLeaveBalances());
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not load requests.");
    }
  }

  // Approves or rejects one request and then reloads the tables.
  async function reviewRequest(action, id) {
    setError("");
    try {
      await action(id);
      await loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not review request.");
    }
  }

  return (
    <>
      <h2>Leave requests</h2>
      {error && <p className="error">{error}</p>}
      <div className="search-form">
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="">All</option>
          <option>Pending</option>
          <option>Approved</option>
          <option>Rejected</option>
          <option>Cancelled</option>
        </select>
      </div>
      <div className="table-wrap">
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
                      <button onClick={() => reviewRequest(approveLeave, request._id)}>
                        Approve
                      </button>{" "}
                      <button onClick={() => reviewRequest(rejectLeave, request._id)}>
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

      {balances && (
        <>
          <h2>Annual leave balances for {balances.year}</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Allowance</th>
                  <th>Used</th>
                  <th>Remaining</th>
                </tr>
              </thead>
              <tbody>
                {balances.balances.map((row) => (
                  <tr key={row.employee._id}>
                    <td>
                      {row.employee.employeeId} {row.employee.name}
                    </td>
                    <td>{balances.annualAllowance}</td>
                    <td>{row.usedDays}</td>
                    <td>{row.remainingDays}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}

export default LeaveReview;
