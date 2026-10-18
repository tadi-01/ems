// Displays one attendance list, optionally including the employee's name.
function AttendanceTable({ records, showEmployee = false }) {
  // Uses the viewer's local clock for timestamps, while dates come from the company.
  function formatTime(value) { return value ? new Date(value).toLocaleTimeString() : "-"; }
  return <div className="table-wrap"><table>
    <thead><tr>{showEmployee && <th>Employee</th>}<th>Date</th><th>Check in</th><th>Check out</th><th>Hours worked</th></tr></thead>
    <tbody>{records.map((record) => <tr key={record._id}>
      {showEmployee && <td>{record.employee?.employeeId} {record.employee?.name}</td>}
      <td>{record.date}</td><td>{formatTime(record.checkIn)}</td><td>{formatTime(record.checkOut)}</td>
      <td>{record.checkOut ? record.workingHours : "-"}</td>
    </tr>)}</tbody>
  </table></div>;
}

export default AttendanceTable;
