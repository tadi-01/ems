import AttendanceTable from "../components/AttendanceTable";
import { getSavedUser } from "../services/session";
import { useEffect, useState } from "react";
import {
  checkIn,
  checkOut,
  getAllAttendance,
  getMyAttendance,
} from "../services/attendanceService";

// Lets an employee check in and out, and lets Admin or HR see everyone's records.
function Attendance() {
  const user = getSavedUser();
  const canSeeAll = user?.role === "Admin" || user?.role === "HR";
  const [myRecords, setMyRecords] = useState([]);
  const [allRecords, setAllRecords] = useState([]);
  const [dateFilter, setDateFilter] = useState("");
  const [message, setMessage] = useState("");
  const [noEmployee, setNoEmployee] = useState(false);
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
      setNoEmployee(false);
    } catch (requestError) {
      if (requestError.response?.status === 404) setNoEmployee(true);
      else setError(requestError.response?.data?.message || "Could not load records.");
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
      {noEmployee && <p>Ask Admin or HR to link your account on the Employees page before recording attendance.</p>}
      <div className="data-form">
        <button
          className="button" disabled={noEmployee}
          onClick={() => recordTime(checkIn, "Checked in.")}
        >
          Check in
        </button>
        <button
          className="button" disabled={noEmployee}
          onClick={() => recordTime(checkOut, "Checked out.")}
        >
          Check out
        </button>
      </div>

      <h2>My attendance</h2>
      <AttendanceTable records={myRecords} />

      {canSeeAll && (
        <>
          <h2>All employees</h2>
          <form className="search-form" onSubmit={filterByDate}>
            <label className="field">Attendance date<input
              type="date"
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
            /></label>
            <button className="button" type="submit">
              Filter by date
            </button>
          </form>
          <AttendanceTable records={allRecords} showEmployee />
        </>
      )}
    </main>
  );
}

export default Attendance;
