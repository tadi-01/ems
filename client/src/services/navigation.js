const allRoles = ["Admin", "HR", "Employee"];
const navigation = [
  { path: "/dashboard", label: "Overview", group: "Workspace", roles: allRoles },
  { path: "/employees", label: "Employees", group: "Workspace", roles: allRoles },
  { path: "/departments", label: "Departments", group: "Workspace", roles: allRoles },
  { path: "/attendance", label: "Attendance", group: "Time & pay", roles: allRoles },
  { path: "/leave", label: "Leave", group: "Time & pay", roles: allRoles },
  { path: "/payroll", label: "Payroll", group: "Time & pay", roles: allRoles },
  { path: "/settings", label: "Settings", group: "Administration", roles: ["Admin"] },
  { path: "/users", label: "Users & roles", group: "Administration", roles: ["Admin"] },
];
export default navigation;
