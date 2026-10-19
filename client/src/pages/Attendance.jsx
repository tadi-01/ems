import AttendanceTable from "../components/AttendanceTable";
import { getSavedUser } from "../services/session";
import { useEffect, useState } from "react";
import {
  checkIn,
  checkOut,
  getAllAttendance,
  getMyAttendance,
} from "../services/attendanceService";

function Attendance() {
  const user = getSavedUser();
  const canSeeAll = user?.role === "Admin" || user?.role === "HR";
  const [myRecords, setMyRecords] = useState([]);
  const [allRecords, setAllRecords] = useState([]);
  const [dateFilter, setDateFilter] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [noEmployee, setNoEmployee] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadMyRecords();
    if (canSeeAll) loadAllRecords("");
  }, []);

  async function loadMyRecords() {
    try {
      setMyRecords(await getMyAttendance());
      setNoEmployee(false);
    } catch (requestError) {
      if (requestError.response?.status === 404) setNoEmployee(true);
      else setError(requestError.response?.data?.message || "Could not load records.");
    }
  }

  async function loadAllRecords(date) {
    try {
      setAllRecords(await getAllAttendance(date));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not load records.");
    }
  }

  async function recordTime(action, successText) {
    if (saving) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await action();
      setMessage(successText);
      await loadMyRecords();
      if (canSeeAll) await loadAllRecords(dateFilter);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Request failed.");
    } finally { setSaving(false); }
  }

  function filterByDate(event) {
    event.preventDefault();
    loadAllRecords(dateFilter);
  }

  return (
    <main className="content-page">
      <h1>Attendance</h1>
      <p className="page-description">Record your workday and review attendance history.</p>
      {error && <p className="error" role="alert">{error}</p>}
      {message && <p className="notice" role="status">{message}</p>}
      {saving && <p role="status">Saving attendance...</p>}
      {noEmployee && <p>Ask Admin or HR to link your account on the Employees page before recording attendance.</p>}
      <div className="data-form">
        <button
          className="button" disabled={noEmployee || saving}
          onClick={() => recordTime(checkIn, "Checked in.")}
        >
          Check in
        </button>
        <button
          className="button button-secondary" disabled={noEmployee || saving}
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
