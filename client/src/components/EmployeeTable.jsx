import EmptyRow from "./EmptyRow";

// Keeps the directory readable while displaying loading and empty results accurately.
function EmployeeTable({ employees, canManage, loading, onEdit, onDelete }) {
  return (
      <div className="table-wrap" tabIndex="0" role="region" aria-label="Scrollable records">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Department</th>
              <th>Designation</th>
              <th>Email</th>
              {canManage && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>{employees.length === 0 && <EmptyRow columns={canManage ? 6 : 5}>{loading ? "Loading employees..." : "No employees found. Try another search or ask Admin or HR to add a record."}</EmptyRow>}
            {employees.map((employee) => (
              <tr key={employee._id}>
                <td>{employee.employeeId}</td>
                <td>{employee.name}</td>
                <td>{employee.department?.name}</td>
                <td>{employee.designation}</td>
                <td>{employee.email}</td>
                {canManage && <td>
                  <button onClick={() => onEdit(employee)}>Edit</button>{" "}
                  <button onClick={() => onDelete(employee._id)}>
                    Delete
                  </button>
                </td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
  );
}

export default EmployeeTable;
