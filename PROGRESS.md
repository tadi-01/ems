# PROGRESS.md

Single source of truth for the Employee Management System. A new AI or group member must be able to continue from this file alone. Update it after every phase and after any fix. Only one person edits it at a time.

Last updated by: Claude, branch `claude1`, after Phase 7.

## 1. Project summary

We are a group of second-year undergraduate Computer Science students building an Employee Management System for our Web Development course. We must present it to our lecturer and explain every part ourselves, so all code must stay simple, clean and defensible at undergraduate level.

The GitHub repository root is `ems/` (the original plan called it `employee-management/`; the layout inside is the same).

## 2. Locked decisions (copied from the original instructions)

STACK (do not change or add anything):
- Frontend: React (Vite), React Router, Axios, plain CSS (no Tailwind, no UI libraries)
- Backend: Node.js + Express
- Database: MongoDB with Mongoose
- Auth: JWT + bcrypt
- Deployment: Vercel (frontend), Render (backend), MongoDB Atlas

FOLDER STRUCTURE:
```
ems/
  client/ (src/components, pages, services, App.jsx, main.jsx)
  server/ (routes, controllers, models, middleware, utils, server.js)
  PROGRESS.md
  README.md
```

FEATURES:
1. Auth with 3 roles (Admin, HR, Employee): register, login, protected routes
2. Employee CRUD (ID, name, department, designation, email, phone, joining date, salary) with search
3. Department CRUD (name, manager, budget, employee count)
4. Attendance: check-in/check-out, working hours, block duplicate entries per day
5. Leave: apply/cancel/history (employee); approve/reject + balances (HR/Admin)
6. Payroll: basic + allowances + bonuses - deductions - tax = net salary; printable payslip
7. Dashboard: total employees, present today, on leave, monthly payroll, count per department
8. Responsive design (mobile-friendly)

RULES:
- Use simple async/await, no advanced patterns, no TypeScript, no Redux
- Comment every function in simple English ("what it does and why")
- Use clear names (getAllEmployees, not fetchData)
- Keep each file under ~150 lines
- Never hardcode secrets; use a .env file and explain each variable
- Use Mongoose models with references (ObjectId + populate). Avoid complex aggregation pipelines; explain any you use step by step.
- Block duplicate attendance with a unique compound index on employee + date, and explain how it works.

DESIGN (important):
- Clean, professional look, like real business software (think a simple HR tool or admin dashboard). Not a flashy "AI-generated" style.
- NO emojis anywhere: not in the UI, buttons, headings, comments, console logs, or README.
- NO neon colors, glows, gradients, glassmorphism, heavy shadows, or animated effects.
- Color palette: white and light grey backgrounds, one primary color (a muted navy or blue), plus a dark grey for text. Use green/red/amber only for status labels (approved, rejected, pending).
- One system font stack (e.g. Arial, Helvetica, sans-serif). No decorative fonts.
- Layout: a fixed left sidebar with navigation, a top bar showing the logged-in user and role, and a content area. Use plain tables for lists and simple cards for dashboard totals.
- Spacing: consistent padding (8px, 16px, 24px), small border radius (4px), thin 1px grey borders.
- Forms: labels above inputs, clear validation messages, simple buttons (solid primary, outlined secondary).
- Use icons sparingly or not at all. If needed, plain text labels are fine.
- Define colors and spacing once as CSS variables in a single global stylesheet, and reuse them so the CSS is easy to explain.

HOW TO WORK: build in phases, stop after each one so it can be tested. After each phase give: complete code with file paths, a 5-sentence "How it works", 3 likely lecturer questions with answers, how to test it, and the full updated PROGRESS.md.

Decisions made after the original instructions (flagged for the group to confirm):
- Password hashing uses the `bcryptjs` package (pure JavaScript, same API as `bcrypt`, no native build step).
- Phases 4 and 5 link a logged-in User to an Employee record by matching `User.email` to `Employee.email` (no schema change). See Known issues 7.
- Leave balance is calculated, not stored: each employee has 21 Annual leave days per calendar year (a constant in `server/utils/leaveHelpers.js`); remaining days = 21 minus the days of Approved Annual leave that start in that year. Sick and Unpaid leave do not use the balance.
- Leave days are calendar days with the start and end day both counted (weekends and public holidays are not excluded). A request must start and end in the same calendar year.
- Leave statuses are Pending, Approved, Rejected and Cancelled. An employee can cancel only a Pending request; it stays in history as Cancelled.
- Payroll (Phase 6): one payslip per employee per month (unique index on employee + month). The server always calculates net salary; a net value sent by the browser is ignored. Basic salary starts from `Employee.salary` but is copied onto the payslip so later salary changes do not rewrite old payslips. Tax is a typed amount, not a percentage (simplest to explain; the group can change this, see Known issues 27). Money has no currency symbol. Only Admin and HR create, change or delete payslips; every user can read only their own.
- Dashboard (Phase 7): "present today" is the number of attendance records for today (an employee who has checked in, even if already checked out). "On leave today" is the number of employees with Approved leave that covers today. "Monthly payroll" is the sum of net salary on the current month's payslips. Employees per department are counted from the real Employee records; the hand-typed `Department.employeeCount` is not used (see Known issues 4). Only Admin and HR get company totals; other roles see a welcome message. Today and the current month use the server clock in UTC (see Known issues 18).
- Design (Phase 7): colors, spacing and sizes are CSS variables at the top of `client/src/index.css`. Red is used for status labels and also for error messages so validation errors are easy to see (the group should confirm this is acceptable under the "red only for status labels" rule).

## 3. Phase status table

| Phase | Name | Status | Owner |
|---|---|---|---|
| 1 | Project setup, folder structure, DB connection | Complete (Not tested) | Unassigned (built before this file existed) |
| 2 | Auth: models, routes, JWT middleware, login/register pages | Complete (Not tested) | Unassigned |
| 3 | Employees and departments | Complete (Not tested) | Unassigned |
| 4 | Attendance | Complete (Not tested) | Claude, branch `claude1` |
| 5 | Leave | Complete (Not tested) | Claude, branch `claude1` |
| 6 | Payroll | Complete (Not tested) | Claude, branch `claude1` |
| 7 | Dashboard and responsive CSS | Complete (Not tested) | Claude, branch `claude1` |
| 8 | Deployment and README | Not started | |

"Complete (Not tested)" means the code exists, was read and reviewed, and passed the checks listed on its "Test status" line (syntax checks, a client build, and logic scripts that use an in-memory stand-in for the database). It has NOT been run against a real MongoDB database or clicked through in a browser. Change a phase to "Tested" only after the group has run its "How to test" steps and they pass.

## 4. Per-phase details

### Phase 1: setup

Files:
- `server/server.js`: creates Express app, enables CORS and JSON, mounts routes, starts server after DB connect
- `server/utils/connectDatabase.js`: connects Mongoose to `MONGO_URI`; if it is missing the server still starts without a database
- `server/.env.example`: example environment file
- `client/src/main.jsx`, `client/src/App.jsx`, `client/src/index.css`, `client/vite.config.js`, `client/index.html`: Vite React shell
- `.gitignore`: ignores `node_modules/`, `.env`, `client/dist/`

Route: `GET /api/health` (public) returns `{ message }`.

Environment variables (names only): `PORT`, `MONGO_URI`, `JWT_SECRET`.
- `PORT`: port the Express server listens on (default 5000)
- `MONGO_URI`: MongoDB Atlas connection string
- `JWT_SECRET`: long random text used to sign login tokens

How it works: The server is an Express app that reads settings from a `.env` file. It connects to MongoDB with Mongoose, then listens for requests. CORS lets the React app on another port call it. JSON parsing lets it read request bodies. Routes are split into files and mounted under `/api`.

Lecturer questions: Why a `.env` file? (Keeps secrets out of Git.) What does `cors()` do? (Allows the browser to call the API from a different origin.) Why `type: "module"`? (Lets us use `import` and `export`.)

### Phase 2: auth

Files:
- `server/models/User.js`: User schema, password hashing before save, `checkPassword` method
- `server/controllers/authController.js`: `registerUser`, `loginUser`, `getCurrentUser`
- `server/routes/authRoutes.js`: auth routes
- `server/middleware/authMiddleware.js`: `protectRoute` (verifies JWT), `allowRoles(...roles)` (role check)
- `server/utils/generateToken.js`: signs a JWT with `userId` and `role`, expires in 1 day
- `client/src/pages/Login.jsx`, `client/src/pages/Register.jsx`: forms
- `client/src/services/authService.js`: calls auth API and saves `token` and `user` in `localStorage`
- `client/src/services/api.js`: shared Axios instance that adds `Authorization: Bearer <token>`
- `client/src/components/ProtectedRoute.jsx`: redirects to `/login` when no token

Routes:

| Method | Path | Access | Body | Response |
|---|---|---|---|---|
| POST | /api/auth/register | Public | name, email, password, role | 201 `{ user: {id, name, email, role}, token }` |
| POST | /api/auth/login | Public | email, password | `{ user, token }` |
| GET | /api/auth/me | Logged in | none | `{ user: { userId, role, iat, exp } }` |

Model `User`: name, email (unique, lowercase), password (hashed, min 6), role (Admin, HR, Employee; default Employee), timestamps.

Environment variables: `JWT_SECRET`.

How it works: Registering saves a User and the password is hashed with bcrypt in a Mongoose `pre("save")` hook. Logging in compares the typed password with the hash and returns a signed JWT. The browser stores the token and `api.js` attaches it to every request. `protectRoute` verifies the token and puts the user on `request.user`. `allowRoles` then checks that the role may use the route.

Lecturer questions: Why hash passwords? (If the database leaks, real passwords are not exposed.) What is inside a JWT? (userId, role, expiry, signed so it cannot be changed.) Where is the token stored and what is the risk? (`localStorage`; scripts on the page could read it, so avoid XSS.)

### Phase 3: employees and departments

Files:
- `server/models/Employee.js`, `server/models/Department.js`
- `server/controllers/employeeController.js`, `server/controllers/departmentController.js`
- `server/routes/employeeRoutes.js`, `server/routes/departmentRoutes.js`
- `client/src/pages/Employees.jsx` (add, edit, delete, search), `client/src/pages/Departments.jsx` (add, delete)
- `client/src/services/employeeService.js`, `client/src/services/departmentService.js`

Routes (all require login; write routes require Admin or HR):

| Method | Path | Access | Notes |
|---|---|---|---|
| GET | /api/employees?search= | Any logged in | search matches name, employeeId, email (case-insensitive) |
| POST | /api/employees | Admin, HR | body: employeeId, name, department (id), designation, email, phone, joiningDate, salary |
| PUT | /api/employees/:id | Admin, HR | same fields |
| DELETE | /api/employees/:id | Admin, HR | |
| GET | /api/departments | Any logged in | manager populated with name, email |
| POST | /api/departments | Admin, HR | body: name, manager (User id), budget, employeeCount |
| PUT | /api/departments/:id | Admin, HR | |
| DELETE | /api/departments/:id | Admin, HR | |

Models:
- `Employee`: employeeId (unique), name, department (ObjectId ref `Department`), designation, email (unique), phone, joiningDate, salary (>= 0), timestamps
- `Department`: name (unique), manager (ObjectId ref `User`), budget (>= 0), employeeCount (default 0), timestamps

How it works: Each model describes one MongoDB collection. Controllers hold the logic: find, create, update, delete. An employee stores the id of its department and `populate("department", "name")` swaps that id for the real name when reading. The search builds a `$or` filter with a case-insensitive regex. Routes use `protectRoute` for everyone and `allowRoles("Admin", "HR")` for changes.

Lecturer questions: What does `populate` do? (Replaces a stored id with the referenced document.) Why is the salary check on the server too? (Never trust the browser alone.) What does `runValidators: true` do on update? (Runs the schema rules on updates, which Mongoose skips by default.)

### Phase 4: attendance

Files:
- `server/models/Attendance.js`: Attendance schema with the unique compound index on employee + date
- `server/controllers/attendanceController.js`: `checkIn`, `checkOut`, `getMyAttendance`, `getAllAttendance`, plus a small helper `getTodayText` (the email-matching helper now lives in `server/utils/getEmployeeForUser.js`, moved in Phase 5)
- `server/routes/attendanceRoutes.js`: attendance routes
- `server/server.js`: now also mounts `/api/attendance`
- `client/src/services/attendanceService.js`: API calls for attendance
- `client/src/pages/Attendance.jsx`: Check in and Check out buttons, "My attendance" table, and an "All employees" table with a date filter (Admin and HR only)
- `client/src/App.jsx`: new `/attendance` protected route and an "Attendance" button on the temporary dashboard

Routes (all require login):

| Method | Path | Access | Response |
|---|---|---|---|
| POST | /api/attendance/check-in | Any logged in (needs an Employee record with the same email) | 201 the new record; 400 "You have already checked in today."; 404 if no matching employee |
| POST | /api/attendance/check-out | Same | the updated record with `workingHours`; 400 if not checked in or already checked out |
| GET | /api/attendance/me | Same | array of the user's own records, newest first |
| GET | /api/attendance?date=YYYY-MM-DD | Admin, HR | array of records with `employee` populated (name, employeeId); date filter is optional |

Model `Attendance`: employee (ObjectId ref `Employee`), date (text, `YYYY-MM-DD`), checkIn (Date), checkOut (Date, null until checkout), workingHours (Number, 2 decimals), timestamps. Unique compound index `{ employee: 1, date: 1 }`.

Environment variables: none new.

How to test:
1. Start the server (`cd server`, copy `.env.example` to `.env` and fill it, `npm install`, `npm run dev`) and the client (`cd client`, `npm install`, `npm run dev`).
2. Register a user with email `amy@example.com`. Log in as an Admin or HR user and create a department and an Employee with the SAME email `amy@example.com`.
3. Log in as `amy@example.com`, open Attendance, press Check in. A row appears with the time.
4. Press Check in again. Expect the message "You have already checked in today."
5. Press Check out. The row shows the check-out time and hours worked.
6. Press Check out again. Expect "You have already checked out today."
7. Log in as Admin or HR and use the "All employees" table and the date filter.
8. Register a user whose email matches no employee and press Check in. Expect "No employee record matches your account email."

Test status: NOT yet run against a real MongoDB. What was checked: all server files pass `node --check`; the client builds with `vite build`; the controller logic (duplicate check-in rejected, check-out before check-in rejected, hours maths 2.5 for 2h30m, no-matching-employee gives 404) passed a script that used an in-memory stand-in for the database; the unique index is present on the schema. The sandbox could not download MongoDB, so the real index behaviour is still untested. Please run the steps above.

How it works: An employee's account is matched to their Employee record by email. Check-in creates one Attendance record for today's date text. The database has a unique index on employee + date, so a second record for the same day is refused with error code 11000, and the controller turns that into a friendly message. Check-out finds today's record, saves the time, and works out hours as the difference in milliseconds divided by 3,600,000, rounded to 2 decimals. Employees see only their own history; Admin and HR can list everyone and filter by date.

Lecturer questions:
- How does the system block duplicate attendance? (A unique compound index on employee + date. The database enforces it, so it also works if two requests arrive at the same moment. The code just catches error 11000.)
- Why store the date as text like `2026-10-17`? (It makes "one record per day" simple to compare and index, and avoids confusion with times and time zones.)
- Why can the same helper be trusted to find the employee? (The token holds only the user id, so the server loads the User, then finds the Employee with the same email. It never trusts an employee id sent by the browser.)

### Phase 5: leave

Files:
- `server/models/Leave.js`: Leave schema
- `server/utils/leaveHelpers.js`: `ANNUAL_LEAVE_DAYS` (21), `countLeaveDays`, `getYearRange`, `getRemainingAnnualDays`
- `server/utils/getEmployeeForUser.js`: finds the Employee that matches the logged-in user's email (moved out of `attendanceController.js`; attendance and leave both use it)
- `server/controllers/leaveController.js`: employee actions `applyForLeave`, `cancelLeave`, `getMyLeaves`
- `server/controllers/leaveReviewController.js`: Admin and HR actions `getAllLeaves`, `approveLeave`, `rejectLeave`, `getLeaveBalances`
- `server/routes/leaveRoutes.js`: leave routes; `server/server.js` now mounts `/api/leaves`
- `server/controllers/attendanceController.js`: now imports the shared helper (no behaviour change)
- `client/src/services/leaveService.js`: API calls for leave
- `client/src/pages/Leave.jsx`: apply form, balance line, "My leave history" table with Cancel button
- `client/src/components/LeaveReview.jsx`: Admin and HR requests table (status filter, Approve, Reject) and the balances table
- `client/src/index.css`: added `.status` label classes (approved green, rejected red, pending amber, cancelled grey)
- `client/src/App.jsx`: new `/leave` protected route and a "Leave" button on the temporary dashboard

Routes (all require login):

| Method | Path | Access | Body | Response |
|---|---|---|---|---|
| POST | /api/leaves | Any logged in with a matching Employee | leaveType (Annual, Sick, Unpaid), startDate, endDate, reason | 201 the new Pending request; 400 for bad or overlapping dates, a request over the Annual balance, or missing fields; 404 if no matching employee |
| GET | /api/leaves/me | Same | none | `{ leaves, year, annualAllowance, remainingAnnualDays }`, newest first |
| PUT | /api/leaves/:id/cancel | Same, own request only | none | the request with status Cancelled; 400 if it is not Pending; 404 if not found or not theirs |
| GET | /api/leaves?status= | Admin, HR | none | all requests with `employee` populated (name, employeeId); status filter optional |
| PUT | /api/leaves/:id/approve | Admin, HR | none | the request with status Approved, `reviewedBy`, `reviewedAt`; 400 if not Pending or an Annual request exceeds the days left |
| PUT | /api/leaves/:id/reject | Admin, HR | none | the request with status Rejected; 400 if not Pending |
| GET | /api/leaves/balances | Admin, HR | none | `{ year, annualAllowance, balances: [{ employee, usedDays, remainingDays }] }` for the current year |

Model `Leave`: employee (ObjectId ref `Employee`), leaveType (Annual, Sick, Unpaid), startDate, endDate (Dates), days (Number, calculated by the server), reason, status (Pending, Approved, Rejected, Cancelled; default Pending), reviewedBy (ObjectId ref `User`, null until reviewed), reviewedAt (Date, null until reviewed), timestamps.

Environment variables: none new.

How to test (needs the same setup as Phase 4: an Admin or HR user, and an Employee user whose Employee record has the SAME email):
1. Log in as the employee and open Leave. Expect the line "Annual leave in <year>: 21 of 21 days remaining."
2. Apply for Annual leave for 3 days. A row appears with an amber Pending label.
3. Apply again for dates that overlap. Expect "You already have a leave request for these dates."
4. Apply for Annual leave longer than 21 days. Expect "You only have 21 Annual leave days left this year."
5. Press Cancel on the Pending row. The label turns grey Cancelled and the Cancel button disappears.
6. Apply for 3 days again. Log in as HR, open Leave. The request is in "Leave requests" as Pending. Press Approve. It turns green Approved and the balances table shows 3 days used.
7. Log in as the employee again. The line now says 18 of 21 days remaining.
8. Apply once more, then as HR press Reject. It turns red Rejected and the balance does not change.
9. As an Employee, call `GET /api/leaves` in Postman. Expect 403.

Test status: NOT yet run against a real MongoDB. What was checked: all server files pass `node --check`; the client builds with `vite build`; the leave controllers passed 28 checks in a script that used an in-memory stand-in for the database (validation, overlap, balance, cancel rules, approve and reject rules, balances list, 404 and role-independent cases); the attendance script still passes after the helper move. Please run the steps above.

How it works: An employee sends a request and the server counts the calendar days between the dates, including both ends. Before saving, it checks the dates are valid and in one year, that they do not overlap another Pending or Approved request, and, for Annual leave, that the days do not exceed the balance. The balance is never stored: it is 21 minus the days of Approved Annual leave that start in the current year, worked out each time it is needed. Admin or HR then approve or reject, and the server saves the new status, who reviewed it and when; approving checks the balance again. Employees can cancel only while a request is Pending, and every request stays in the history.

Lecturer questions:
- Why calculate the balance instead of storing a number on the employee? (A stored number can go out of date if a request is edited, cancelled or approved twice. Calculating it from the Approved requests means there is only one source of truth.)
- How do you stop overlapping requests? (Two ranges overlap when each starts on or before the day the other ends, so the server looks for a Pending or Approved request with startDate <= new end date and endDate >= new start date.)
- Why check the balance again when approving? (Two Pending requests can each fit alone but not together. Only Approved days count, so the check at approval time is the one that decides.)

### Phase 6: payroll

Files:
- `server/models/Payroll.js`: Payroll schema with the unique compound index on employee + month
- `server/utils/payrollHelpers.js`: `isValidMonth`, `readAmount`, `calculateNetSalary`, `readPayslipAmounts` (checks the numbers and calculates net salary)
- `server/controllers/payrollController.js`: `createPayslip`, `updatePayslip`, `deletePayslip`, `getAllPayslips`, `getMyPayslips`
- `server/routes/payrollRoutes.js`: payroll routes
- `server/server.js`: now also mounts `/api/payroll`
- `client/src/services/payrollService.js`: API calls for payroll
- `client/src/pages/Payroll.jsx`: payslip list; Admin and HR also get the form, a month filter, Edit and Delete; every user gets View
- `client/src/components/PayrollForm.jsx`: labelled form to create a payslip or change its amounts (employee and month are locked while editing)
- `client/src/components/Payslip.jsx`: printable payslip with Print and Back buttons
- `client/src/App.jsx`: new `/payroll` protected route and a "Payroll" button on the temporary dashboard
- `client/src/index.css`: `.field` (label above input), `.payslip`, and `@media print` with `.no-print`

Routes (all require login):

| Method | Path | Access | Request body | Response |
|---|---|---|---|---|
| GET | /api/payroll/me | Any logged in (needs an Employee record with the same email) | none | array of the user's own payslips, newest month first; 404 if no matching employee |
| GET | /api/payroll?month=YYYY-MM | Admin, HR | none | array of payslips with `employee` populated (name, employeeId, designation); month filter optional |
| POST | /api/payroll | Admin, HR | employee (id), month, optional basicSalary, allowances, bonuses, deductions, tax | 201 the new payslip; 400 for a bad month, bad amounts, net below zero, or a duplicate; 404 unknown employee |
| PUT | /api/payroll/:id | Admin, HR | basicSalary, allowances, bonuses, deductions, tax | the updated payslip with net recalculated; employee and month cannot change |
| DELETE | /api/payroll/:id | Admin, HR | none | `{ message }` |

Model `Payroll`: employee (ObjectId ref `Employee`), month (text `YYYY-MM`), basicSalary, allowances, bonuses, deductions, tax (numbers, zero or more), netSalary (number, calculated by the server), createdBy (ObjectId ref `User`), timestamps. Unique compound index `{ employee: 1, month: 1 }`.

Environment variables: none new.

How to test:
1. Start the server and client as in Phase 4. Have an Admin or HR user, a department, and an Employee whose email matches a registered user with the Employee role.
2. Log in as Admin or HR, open Payroll, choose the employee (the basic salary fills in from the employee's salary), pick a month, enter allowances 100, bonuses 50, deductions 20, tax 130 and press Create payslip. A row appears; net salary equals basic + 100 + 50 - 20 - 130.
3. Create the same employee and month again. Expect "A payslip for this employee and month already exists."
4. Press Edit on the row, change the tax, press Update payslip. The net salary changes. The employee and month fields are locked.
5. Press View, then Print payslip. The print preview shows only the payslip and no buttons.
6. Use the month filter to show one month.
7. Log in as the Employee user and open Payroll. Only their own payslips appear, with no form and no Edit or Delete; View and Print work.
8. In Postman, send POST /api/payroll with an Employee token and expect 403. Send a valid create as HR with `"netSalary": 99999` added to the body and check the saved net salary is still the calculated one.
9. Delete a payslip and check it disappears.

Test status: NOT yet run against a real MongoDB or in a browser. What was checked: all server files pass `node --check`; the client builds with `vite build`; a script with an in-memory stand-in for the database passed 26 checks (net salary maths, rounding, month format, blank basic salary uses the employee salary, a net value sent by the browser is ignored, tax larger than earnings is rejected, duplicate payslip rejected, unknown employee gives 404, update recalculates net, employees see only their own payslips, delete); the unique index is present on the schema. The real index behaviour and the print preview are still untested.

How it works: Admin or HR picks an employee and a month and types the allowances, bonuses, deductions and tax. The server checks that every amount is a number of zero or more, then calculates net salary as basic + allowances + bonuses - deductions - tax, so the browser cannot choose its own net pay. The basic salary is copied from the employee onto the payslip, so changing the employee's salary later does not change old payslips. A unique index on employee + month makes the database refuse a second payslip for the same month, and the controller turns that error into a clear message. Employees can only call the "my payslips" route, which finds their Employee record by email, and the Payslip page uses the browser's print dialog with the buttons hidden by a print stylesheet.

Lecturer questions:
- Why does the server calculate net salary instead of the browser? (The browser can be changed by the user. Anything that affects money must be worked out on the server from the raw inputs.)
- Why copy the basic salary onto the payslip? (A payslip is a record of what was paid that month. If it only pointed to the employee's current salary, a raise would silently change past payslips.)
- How do you stop two payslips for the same month? (A unique compound index on employee + month. The database enforces it, and the code catches error 11000 and shows a friendly message.)

### Phase 7: dashboard and responsive CSS

Files:
- `server/utils/dateHelpers.js`: `getTodayText` (YYYY-MM-DD) and `getMonthText` (YYYY-MM); the attendance controller now imports `getTodayText` from here instead of defining its own
- `server/controllers/dashboardController.js`: `getDashboardSummary`, plus helpers that count employees per department, add up the month's net salary and count employees on leave today
- `server/routes/dashboardRoutes.js`: dashboard route
- `server/server.js`: now also mounts `/api/dashboard`
- `client/src/services/dashboardService.js`: API call for the dashboard
- `client/src/pages/Dashboard.jsx`: four total cards and an "Employees per department" table (Admin and HR); a welcome message for other roles
- `client/src/components/Layout.jsx`: the frame for every logged-in page: fixed left sidebar menu, top bar with the user's name, role and Log out, and the page in the content area
- `client/src/App.jsx`: rewritten as a plain list of routes; logged-in pages are nested inside `ProtectedRoute` and `Layout`; the temporary dashboard function is gone
- `client/src/index.css`: rewritten with CSS variables, muted navy, no shadows, 4px radius, sidebar layout, cards, solid and outlined buttons, print rules and a small-screen layout
- `client/src/pages/Payroll.jsx`: one small change (`nowrap` on the month cell)

Route (requires login):

| Method | Path | Access | Response |
|---|---|---|---|
| GET | /api/dashboard | Admin, HR | `{ date, month, totalEmployees, presentToday, onLeaveToday, monthlyPayroll, employeesPerDepartment: [{ _id, name, count }] }` |

Database models: none new. It reads `Employee`, `Department`, `Attendance` (`date`), `Leave` (`status`, `startDate`, `endDate`) and `Payroll` (`month`, `netSalary`).

Environment variables: none new.

How to test:
1. Start the server and client as in Phase 4. Have some employees, departments, an attendance check-in today, an Approved leave covering today, and a payslip for the current month.
2. Log in as Admin or HR. The Dashboard shows four cards (total employees, present today, on leave today, monthly payroll for this month) and the employees-per-department table. Check each number against the other pages.
3. Check the left sidebar links open each page and the current page is highlighted. Check the top bar shows your name and role, and Log out returns to the login page.
4. Log in as an Employee. The Dashboard shows only the welcome message. In Postman, `GET /api/dashboard` with that token returns 403.
5. Narrow the browser window to phone width (about 390px). The sidebar becomes a menu across the top, the cards stack, and the page has no sideways scrolling (wide tables scroll inside their own box).
6. Open a payslip and press Print payslip. The print preview shows only the payslip, with no sidebar, top bar or buttons.

Test status: NOT yet run against a real MongoDB or the real API. What was checked: all server files pass `node --check`; the client builds with `vite build`; a script with an in-memory stand-in for the database passed 16 checks (totals, the date and status filters used for "on leave today", the month used for payroll, rounding, a department with no employees shows 0, a database error gives a clear 500); the attendance and payroll scripts still pass after the shared date helper change; and the built client was opened in headless Chromium with a mocked API at 1280px and 390px wide for Admin and Employee roles. That showed no page errors, no horizontal page scroll at 390px, the sidebar and top bar hidden in print mode, and the screens looked consistent. The real Dashboard numbers and the print preview in a normal browser still need to be checked by the group.

How it works: The dashboard page asks `/api/dashboard`, which only Admin and HR can use. The server counts employees with `countDocuments`, counts today's attendance records by their YYYY-MM-DD date text, and finds employees whose Approved leave starts on or before today and ends on or after today. It reads the current month's payslips and adds up their net salary in plain JavaScript instead of an aggregation pipeline, and it counts the employees in each department with a simple loop. The Layout component wraps every logged-in page with a fixed sidebar and a top bar using React Router's `Outlet`. All colors and spacing are CSS variables in one stylesheet, and on small screens a media query turns the sidebar into a menu across the top.

Lecturer questions:
- Why is the payroll total added up in JavaScript and not with an aggregation pipeline? (A loop over a month's payslips is easy to read and explain, and a course project has few payslips. A pipeline would be faster for very large data.)
- How does React Router's `Outlet` work here? (`Layout` draws the sidebar and top bar once, and `Outlet` is the slot where the current page appears, so each page does not repeat the menu.)
- Why use CSS variables? (Each color and spacing value is written once, so changing the primary color or spacing is a one-line change and the whole site stays consistent.)

## 5. Known issues and bugs

1. SECURITY (left unfixed on purpose; MUST be fixed before deployment in Phase 8): `/api/auth/register` accepts `role` from the request, so anyone can register as Admin and then read and change every record, including salaries and payslips. Suggested fix: always create the user as `Employee`; let an Admin change roles, or create the first Admin by hand in the database.
2. `registerUser` queries the database before checking that fields exist. Suggested fix: validate first.
3. Employee search puts user text straight into a regex. Suggested fix: escape special characters before building the regex.
4. `Department.employeeCount` is typed in by hand and is never calculated. Suggested fix: count employees with `Employee.countDocuments({ department: id })` when listing. The Phase 7 dashboard does not use this field; it counts real Employee records instead.
5. The department form asks for a raw "Manager user ID". Suggested fix: a dropdown of Admin and HR users (needs a small `GET /api/users` route for Admin and HR).
6. Departments page has no Edit button (`updateDepartment` exists in the service but is unused).
7. Employee records are not linked to User accounts. Phases 4 and 5 match by email (`User.email` equals `Employee.email`). Suggested long-term fix: add a `user` reference to `Employee`.
8. Employees and Departments pages show Add, Edit and Delete controls to the Employee role although the server correctly answers 403. Suggested fix: hide them by role.
9. API base URL `http://localhost:5000/api` is hardcoded in `client/src/services/api.js` and again in `authService.js`, which creates its own Axios instance. Suggested fix: use `import.meta.env.VITE_API_URL` and make `authService.js` import `api.js`. Needed before Phase 8.
10. The `Dashboard` component lives inside `client/src/App.jsx` as a temporary welcome page. Phase 7 replaces it. RESOLVED in Phase 7: it is now `client/src/pages/Dashboard.jsx`.
11. DESIGN drift in `client/src/index.css`: no sidebar or top bar, bright blue `#2563eb` instead of a muted navy, a `box-shadow` on cards, 8px radius instead of 4px, an uppercase letter-spaced "eyebrow" label, no CSS variables. Suggested fix: one styling pass that adds CSS variables and the sidebar layout. MOSTLY RESOLVED in Phase 7: sidebar, top bar, CSS variables, muted navy, no shadows, 4px radius and plain eyebrow text are done. What remains is issue 32 (labels above inputs).
12. `client/src/pages/Employees.jsx` is about 207 lines, over the 150 line rule. Suggested fix: move the form into `components/EmployeeForm.jsx`.
13. `removeEmployee` and `removeDepartment` do not catch errors, so a failed delete shows nothing.
14. `ProtectedRoute` only checks that a token exists; an expired token is not detected until an API call returns 401, and the client does not then log the user out.
15. `server/.env.example` has `JWT_SECRET=replace_this_in_phase_2`. Each group member must set their own long random value in a real `.env`.
16. No automated tests exist, and nothing has been run against a live MongoDB yet.
17. `README.md` is empty (Phase 8).
18. Attendance dates use the server clock in UTC (`toISOString`). For Zimbabwe (UTC+2) a check-in between 00:00 and 02:00 local time is recorded against the previous date. Suggested fix: compute the date in the local time zone, or store the time zone in `.env`.
19. An Admin or HR user can only check in if an Employee record with their email exists; otherwise they get a 404 message. Create an Employee record for them if they should be tracked.
20. SECURITY (left unfixed on purpose; fix before the final demo if possible): an Admin or HR user can approve their own leave request. Suggested fix: in `reviewLeave`, load the reviewer's Employee with `getEmployeeForUser` and refuse when it matches `leave.employee`.
21. Leave days are calendar days, so weekends and public holidays count against the balance. The 21-day allowance is a constant in `leaveHelpers.js`, not a setting. Suggested fix if the lecturer asks: skip Saturdays and Sundays in `countLeaveDays`, and move the allowance to `.env`.
22. Leave dates use UTC, the same as attendance (see 18).
23. `client/src/pages/Leave.jsx` and `server/controllers/leaveController.js` are 152 lines each, slightly over the "about 150" rule; `LeaveReview.jsx` was split out to keep the page short.
24. An Admin or HR user without an Employee record sees the review section but cannot apply for leave (the page says so).
25. Payroll: the print layout hides only the payslip buttons. When Phase 7 adds a sidebar and top bar, they must also get the `no-print` class (or be hidden in `@media print`) or they will appear on the printed payslip. RESOLVED in Phase 7: the sidebar and top bar have the `no-print` class and `.layout-main` loses its left margin when printing.
26. Payroll: Admin and HR see only the management view, not their own payslips, even if an Employee record with their email exists. Suggested fix: add a "My payslips" table that calls `getMyPayslips` when the user has a matching Employee record.
27. Payroll: tax is a typed amount. If the lecturer expects a percentage, change `readPayslipAmounts` in `server/utils/payrollHelpers.js` to calculate tax from a rate. The payslip also has no currency symbol, company name or date issued.
28. Payroll: unpaid leave and absences do not reduce pay automatically. HR types the deductions by hand.
29. Payroll: `<input type="month">` is not a picker in every browser (for example desktop Firefox); it becomes a text box and the user types `2026-10`. The server rejects other formats with "Month must look like 2026-10."
30. Payroll: updating a payslip does not record who changed it; `createdBy` stays the original creator.
31. Dashboard: "present today", "on leave today" and the current month use the UTC date (the same as Known issues 18). For Zimbabwe (UTC+2), the totals between 00:00 and 02:00 local time still refer to the previous day.
32. DESIGN: the Employees, Departments, Attendance and Leave forms use placeholders instead of labels above the inputs (only Login, Register and the Payroll form follow that rule). Suggested fix: use the `.field` label pattern from `PayrollForm.jsx`; move the Employees form into `components/EmployeeForm.jsx` at the same time (also fixes issue 12).
33. The sidebar shows every link to every role. Employee users can open Employees and Departments (the server allows reading) and still see the Add, Edit and Delete controls (see issue 8). Suggested fix: hide links and controls by role.
34. The dashboard was only checked in a browser with a mocked API, not with the real backend and a real MongoDB.

## 6. Naming conventions and patterns

- ES modules everywhere (`import` / `export`), double quotes, semicolons, 2-space indent.
- Server: models are PascalCase files (`Employee.js`); controllers, routes, middleware, utils are camelCase files (`employeeController.js`, `authRoutes.js`). Controller functions are verb-first (`getAllEmployees`, `createEmployee`, `updateEmployee`, `deleteEmployee`) and exported together at the bottom with `export { ... }`.
- Every function has a one-line `//` comment above it saying what it does.
- Controllers use `try/catch` and answer with `response.status(code).json({ message })` for errors. Parameters are written in full: `request`, `response`.
- Routes: `router.use(protectRoute)` first, then `allowRoles("Admin", "HR")` on write routes. Routers are mounted in `server.js` as `/api/<plural-name>`.
- Models use `{ timestamps: true }` and `ref` + `populate` for relations.
- Shared server helpers live in `server/utils/` (`getEmployeeForUser.js` has a default export; `leaveHelpers.js` has named exports). Large controllers are split by audience (`leaveController.js` for employees, `leaveReviewController.js` for Admin and HR).
- Statuses are plain strings checked with `enum`, and shown in the client as `<span className="status status-<lowercase status>">`.
- Period values that must be unique are plain text: `YYYY-MM-DD` for attendance dates and `YYYY-MM` for payroll months. Money is rounded to 2 decimals by the server (`server/utils/payrollHelpers.js`) and shown with `toFixed(2)` in the client.
- Client: reusable pieces of a page go in `components/` (for example `LeaveReview.jsx`); pages are PascalCase `.jsx` files in `pages/` with a default export; each API area has a `services/<name>Service.js` with named exports using the shared `api` instance; services return `response.data`.
- Forms keep values in one `form` state object and use a shared `updateField` handler based on the input `name`.
- Errors shown with `requestError.response?.data?.message`, rendered as `<p className="error">`.
- CSS lives in `client/src/index.css`; class names are kebab-case (`content-page`, `data-form`, `table-wrap`). Colors, spacing, radius and sidebar width are CSS variables in `:root` (`--color-primary`, `--space-1`, `--radius`, and so on); use these instead of writing new values. Logged-in pages are `<main className="content-page">` placed inside `Layout`; anything that must not print gets `className="no-print"`.

## 7. Next step

Before Phase 8: the group should run the "How to test" steps for Phases 4, 5, 6 and 7 against a real MongoDB and change those statuses to "Tested" if they pass (Phases 1 to 3 as well). Known issue 1 (anyone can register as Admin) MUST be fixed before the app goes on the internet in Phase 8.

Phase 8: Deployment and README. Build only this phase, then stop.
- Fix Known issue 1 first: in `server/controllers/authController.js` always create new users as `Employee`, ignore any `role` sent by the browser, and remove the role dropdown from `client/src/pages/Register.jsx`. Add a way to create the first Admin and let an Admin change roles, for example a small script `server/utils/createAdmin.js` that reads the name, email and password from `.env` (explain every line), or a role-change route for Admin only (`PUT /api/users/:id/role`) with a simple page. Ask the group which they prefer before building.
- API address (Known issue 9): replace the hardcoded `http://localhost:5000/api` in `client/src/services/api.js` with `import.meta.env.VITE_API_URL`, make `client/src/services/authService.js` import the shared `api` instance instead of creating its own, and add `client/.env.example` with `VITE_API_URL`.
- CORS: in `server/server.js` allow only the deployed client address from a new `CLIENT_URL` variable in `server/.env.example`, instead of `cors()` for every origin (keep localhost working for development).
- Vercel (client): root directory `client`, build command `npm run build`, output `dist`, environment variable `VITE_API_URL`; add `client/vercel.json` with a rewrite of every path to `/index.html` so refreshing a page such as `/employees` does not give a 404.
- Render (server): a Web Service with root directory `server`, build command `npm install`, start command `npm start`, environment variables `MONGO_URI`, `JWT_SECRET` (a long random value, different from the example) and `CLIENT_URL`; `PORT` is set by Render.
- MongoDB Atlas: create a free cluster and a database user, allow network access from Render, and put the connection string in `MONGO_URI`. The unique indexes (attendance, payroll, employee, email) are created by Mongoose when the server first connects.
- `README.md` (it is empty now): what the system does, the three roles, the stack, the folder structure, how to run it locally (install, `.env` files, start commands), a table of environment variables (names and what each is for, never real values), a summary of the API routes, deployment steps, and known limitations. No emojis. Update this section and the phase table when done.
- Depends on: `server/server.js`, `server/.env.example`, `server/controllers/authController.js`, `client/src/pages/Register.jsx`, `client/src/services/api.js`, `client/src/services/authService.js`, and this file for the route list in the README.
- Follow the Naming conventions above, keep each file under about 150 lines, no emojis.
