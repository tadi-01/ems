// Explains an empty list without removing the table's column headings.
function EmptyRow({ columns, children }) {
  return <tr><td colSpan={columns} className="empty-state">{children}</td></tr>;
}

export default EmptyRow;
