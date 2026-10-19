import mongoose from "mongoose";
import AuditEvent from "../models/AuditEvent.js";
import test from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Department from "../models/Department.js";
import { protectRoute, allowRoles } from "../middleware/authMiddleware.js";
import { updateUserRole } from "../controllers/userController.js";
import { createResponse } from "./helpers.js";

test("authorization reads the current database role, ignoring stale token roles", async (context) => {
  const secret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = "test-secret-only";
  context.after(() => { if (secret === undefined) delete process.env.JWT_SECRET; else process.env.JWT_SECRET = secret; });
  context.mock.method(User, "findById", () => ({ select: async () => ({ _id: "user1", role: "Employee" }) }));
  const token = jwt.sign({ userId: "user1", role: "Admin" }, process.env.JWT_SECRET);
  const request = { headers: { authorization: `Bearer ${token}` } };
  const response = createResponse();
  let passed = false;
  await protectRoute(request, response, () => { passed = true; });
  assert.equal(passed, true);
  assert.equal(request.user.role, "Employee");
  allowRoles("Admin")(request, response, () => assert.fail("Employee reached admin handler"));
  assert.equal(response.statusCode, 403);
});

test("missing and malformed login tokens are rejected", async () => {
  for (const authorization of [undefined, "Bearer invalid-token"]) {
    const response = createResponse();
    await protectRoute({ headers: { authorization } }, response, () => assert.fail("Accepted token"));
    assert.equal(response.statusCode, 401);
  }
});

test("an Admin cannot change their own role", async () => {
  const response = createResponse();
  await updateUserRole({ body: { role: "Employee" }, params: { id: "a" }, user: { userId: "a" } }, response);
  assert.equal(response.statusCode, 400);
});

test("a department manager cannot be demoted before reassignment", async (context) => {
  context.mock.method(Department, "exists", async () => ({ _id: "department" }));
  const response = createResponse();
  await updateUserRole({ body: { role: "Employee" }, params: { id: "b" }, user: { userId: "a" } }, response);
  assert.equal(response.statusCode, 400);
  assert.match(response.body.message, /manager/);
});

test("Admin can assign HR and invalid roles are rejected", async (context) => {
  context.mock.method(mongoose.connection, "transaction", async (work) => work(null));
  context.mock.method(AuditEvent, "create", async (rows) => rows);
  context.mock.method(User, "findById", (id) => ({ select: () => ({ session: async () => ({ _id: id, role: "Employee", toObject() { return { role: this.role }; }, async save() {} }) }) }));
  const response = createResponse();
  const request = { body: { role: "HR" }, params: { id: "b" }, user: { userId: "a" } };
  await updateUserRole(request, response);
  assert.equal(response.body.role, "HR");
  request.body.role = "Owner";
  await updateUserRole(request, response);
  assert.equal(response.statusCode, 400);
});


test("expired signed JWTs are rejected before a database query", async (context) => {
  const previous = process.env.JWT_SECRET;
  process.env.JWT_SECRET = "test-secret-only";
  context.after(() => { if (previous === undefined) delete process.env.JWT_SECRET; else process.env.JWT_SECRET = previous; });
  const token = jwt.sign({ userId: "user", exp: 1 }, process.env.JWT_SECRET);
  context.mock.method(User, "findById", () => assert.fail("Expired token queried the database"));
  const response = createResponse();
  await protectRoute({ headers: { authorization: `Bearer ${token}` } }, response, () => assert.fail("Expired token accepted"));
  assert.equal(response.statusCode, 401);
});
