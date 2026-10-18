import test from "node:test";
import assert from "node:assert/strict";
import User from "../models/User.js";
import Employee from "../models/Employee.js";
import Leave from "../models/Leave.js";
import { approveLeave, rejectLeave } from "../controllers/leaveReviewController.js";
import { applyForLeave, cancelLeave } from "../controllers/leaveController.js";
import { createResponse } from "./helpers.js";

// Supplies an account and its linked employee without opening a database connection.
function mockEmployee(context, id = "employee") {
  context.mock.method(User, "findById", async () => ({ _id: "user" }));
  context.mock.method(Employee, "findOne", async () => ({ _id: id }));
}

test("reviewers cannot approve or reject their own leave", async (context) => {
  mockEmployee(context);
  context.mock.method(Leave, "findById", async () => ({ employee: "employee", status: "Pending" }));
  for (const action of [approveLeave, rejectLeave]) {
    const response = createResponse();
    await action({ params: { id: "leave" }, user: { userId: "user" } }, response);
    assert.equal(response.statusCode, 403);
  }
});

test("annual approvals cannot exceed the current balance", async (context) => {
  mockEmployee(context, "reviewer");
  context.mock.method(Leave, "findById", async () => ({ employee: "employee", status: "Pending",
    leaveType: "Annual", startDate: new Date("2026-10-01"), days: 5 }));
  context.mock.method(Leave, "find", async () => [{ days: 20 }]);
  const response = createResponse();
  await approveLeave({ params: { id: "leave" }, user: { userId: "user" } }, response);
  assert.equal(response.statusCode, 400);
});

test("a concurrent review cannot overwrite a cancellation", async (context) => {
  mockEmployee(context, "reviewer");
  context.mock.method(Leave, "findById", async () => ({ _id: "leave", employee: "employee", status: "Pending", leaveType: "Sick" }));
  context.mock.method(Leave, "findOneAndUpdate", (query) => {
    assert.equal(query.status, "Pending"); return { populate: async () => null };
  });
  const response = createResponse();
  await approveLeave({ params: { id: "leave" }, user: { userId: "user" } }, response);
  assert.equal(response.statusCode, 409);
});

test("cancellation cannot overwrite a completed review", async (context) => {
  mockEmployee(context);
  context.mock.method(Leave, "findById", async () => ({ _id: "leave", employee: "employee", status: "Pending" }));
  context.mock.method(Leave, "findOneAndUpdate", async (query) => { assert.equal(query.status, "Pending"); return null; });
  const response = createResponse();
  await cancelLeave({ params: { id: "leave" }, user: { userId: "user" } }, response);
  assert.equal(response.statusCode, 409);
});

test("impossible leave dates are rejected before querying overlaps", async (context) => {
  mockEmployee(context);
  const response = createResponse();
  await applyForLeave({ user: { userId: "user" }, body: { leaveType: "Annual",
    startDate: "2026-02-30", endDate: "2026-03-03", reason: "Rest" } }, response);
  assert.equal(response.statusCode, 400);
  assert.match(response.body.message, /dates/);
});
