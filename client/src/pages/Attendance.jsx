import { useEffect, useState } from "react";
import {
  checkIn,
  checkOut,
  getAllAttendance,
  getMyAttendance,
} from "../services/attendanceService";

// Turns a saved date-time into a short clock time, or a dash when empty.
function formatTime(value) {
  return value ? new Date(value).toLocaleTimeString() : "-";
}

// Lets an employee check in and out, and lets Admin or HR see everyone's records.
function Attendance() {
  const user = JSON.parse(localStorage.getItem("user"));
  const canSeeAll = user?.role === "Admin" || user?.role === "HR";
  const [myRecords, setMyRecords] = useState([]);
  const [allRecords, setAllRecords] = useState([]);
  const [dateFilter, setDateFilter] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Loads the attendance tables when the page opens.
  useEffect(() => {
    loadMyRecords();
    if (canSeeAll) loadAllRecords("");
  }, []);

  // Loads the logged-in employee's own records.
  async function loadMyRecords() {
    try {
      setMyRecords(await getMyAttendance());
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not load records.");
    }
  }

  // Loads everyone's records, optionally for one date.
  async function loadAllRecords(date) {
    try {
      setAllRecords(await getAllAttendance(date));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not load records.");
    }
  }

  // Sends a check-in or check-out request and then refreshes the tables.
  async function recordTime(action, successText) {
    setError("");
    setMessage("");
    try {
      await action();
      setMessage(successText);
      await loadMyRecords();
      if (canSeeAll) await loadAllRecords(dateFilter);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Request failed.");
    }
  }

  // Filters the all-employees table by the chosen date.
  function filterByDate(event) {
    event.preventDefault();
    loadAllRecords(dateFilter);
  }

  return (
    <main className="content-page">
      <h1>Attendance</h1>
      {error && <p className="error">{error}</p>}
      {message && <p>{message}</p>}
      <div className="data-form">
        <button
          className="button"
          onClick={() => recordTime(checkIn, "Checked in.")}
        >
          Check in
        </button>
        <button
          className="button"
          onClick={() => recordTime(checkOut, "Checked out.")}
        >
          Check out
        </button>
      </div>

      <h2>My attendance</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Check in</th>
              <th>Check out</th>
              <th>Hours worked</th>
            </tr>
          </thead>
          <tbody>
            {myRecords.map((record) => (
              <tr key={record._id}>
                <td>{record.date}</td>
                <td>{formatTime(record.checkIn)}</td>
                <td>{formatTime(record.checkOut)}</td>
                <td>{record.checkOut ? record.workingHours : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {canSeeAll && (
        <>
          <h2>All employees</h2>
          <form className="search-form" onSubmit={filterByDate}>
            <input
              type="date"
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
            />
            <button className="button" type="submit">
              Filter by date
            </button>
          </form>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Date</th>
                  <th>Check in</th>
                  <th>Check out</th>
                  <th>Hours worked</th>
                </tr>
              </thead>
              <tbody>
                {allRecords.map((record) => (
                  <tr key={record._id}>
                    <td>
                      {record.employee?.employeeId} {record.employee?.name}
                    </td>
                    <td>{record.date}</td>
                    <td>{formatTime(record.checkIn)}</td>
                    <td>{formatTime(record.checkOut)}</td>
                    <td>{record.checkOut ? record.workingHours : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
}

export default Attendance;
