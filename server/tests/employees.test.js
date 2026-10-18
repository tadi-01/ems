import test from "node:test";
import assert from "node:assert/strict";
import Employee from "../models/Employee.js";
import User from "../models/User.js";
import Department from "../models/Department.js";
import Attendance from "../models/Attendance.js";
import getEmployeeForUser from "../utils/getEmployeeForUser.js";
import { getAllDepartments, deleteDepartment } from "../controllers/departmentController.js";
import { deleteEmployee } from "../controllers/employeeController.js";
import { readEmployeeDetails } from "../utils/employeeDetails.js";
import { createResponse } from "./helpers.js";

test("linked employee survives an email change without falling back to email", async (context) => {
  context.mock.method(User, "findById", async () => ({ _id: "user", email: "new@example.com" }));
  context.mock.method(Employee, "findOne", async (query) => {
    assert.deepEqual(query, { user: "user" }); return { _id: "employee" };
  });
  assert.equal((await getEmployeeForUser({ user: { userId: "user" } }))._id, "employee");
});

test("legacy email matching only claims an unlinked employee", async (context) => {
  context.mock.method(User, "findById", async () => ({ _id: "user", email: "a@example.com" }));
  context.mock.method(Employee, "findOne", async () => null);
  context.mock.method(Employee, "findOneAndUpdate", async (query, update) => {
    assert.deepEqual(query, { email: "a@example.com", user: null });
    assert.equal(update.$set.user, "user");
    return { _id: "employee", user: "user" };
  });
  assert.equal((await getEmployeeForUser({ user: { userId: "user" } })).user, "user");
});

test("department listing ignores legacy manually entered employee counts", async (context) => {
  context.mock.method(Department, "find", () => ({ populate: () => ({ sort: async () => [
    { _id: "d", toObject: () => ({ _id: "d", employeeCount: 999 }) },
  ] }) }));
  context.mock.method(Employee, "countDocuments", async () => 2);
  const response = createResponse();
  await getAllDepartments({}, response);
  assert.equal(response.body[0].employeeCount, 2);
});

test("deletions preserve department references and employee history", async (context) => {
  context.mock.method(Employee, "exists", async () => ({ _id: "employee" }));
  context.mock.method(Attendance, "exists", async () => ({ _id: "attendance" }));
  const response = createResponse();
  await deleteDepartment({ params: { id: "department" } }, response);
  assert.equal(response.statusCode, 400);
  await deleteEmployee({ params: { id: "employee" } }, response);
  assert.equal(response.statusCode, 400);
});

test("employee updates accept editable fields only and validate account references", async (context) => {
  context.mock.method(Department, "exists", async () => ({ _id: "d" }));
  context.mock.method(User, "exists", async () => null);
  const details = await readEmployeeDetails({ department: "d", name: "Alice", role: "Admin", $set: { salary: 0 } });
  assert.deepEqual(details, { department: "d", name: "Alice" });
  await assert.rejects(readEmployeeDetails({ department: "d", user: "missing" }));
});
