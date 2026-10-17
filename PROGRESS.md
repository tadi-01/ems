# PROGRESS.md

Single source of truth for the Employee Management System. A new AI or group member must be able to continue from this file alone. Update it after every phase and after any fix. Only one person edits it at a time.

Last updated by: Claude, branch `claude1`.

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
- Phase 4 links a logged-in User to an Employee record by matching `User.email` to `Employee.email` (no schema change). See Known issues 7.

## 3. Phase status table

| Phase | Name | Status | Owner |
|---|---|---|---|
| 1 | Project setup, folder structure, DB connection | Complete (not formally tested) | Unassigned (built before this file existed) |
| 2 | Auth: models, routes, JWT middleware, login/register pages | Complete (not formally tested) | Unassigned |
| 3 | Employees and departments | Complete (not formally tested) | Unassigned |
| 4 | Attendance | Complete (not formally tested) | Claude, branch `claude1` |
| 5 | Leave | Not started | |
| 6 | Payroll | Not started | |
| 7 | Dashboard and responsive CSS | Not started | |
| 8 | Deployment and README | Not started | |

"Complete (not formally tested)" means the code exists and was read and reviewed for this file, but it has not been run against a real MongoDB database by the person writing this file.

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
- `server/controllers/attendanceController.js`: `checkIn`, `checkOut`, `getMyAttendance`, `getAllAttendance`, plus two small helpers (`getTodayText`, `getEmployeeForLoggedInUser`)
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

## 5. Known issues and bugs

1. SECURITY: `/api/auth/register` accepts `role` from the request, so anyone can register as Admin. Suggested fix: always create `Employee`; let an Admin change roles, or seed the first Admin manually.
2. `registerUser` queries the database before checking that fields exist. Suggested fix: validate first.
3. Employee search puts user text straight into a regex. Suggested fix: escape special characters before building the regex.
4. `Department.employeeCount` is typed in by hand and is never calculated. Suggested fix: count employees with `Employee.countDocuments({ department: id })` when listing.
5. The department form asks for a raw "Manager user ID". Suggested fix: a dropdown of Admin and HR users (needs a small `GET /api/users` route for Admin and HR).
6. Departments page has no Edit button (`updateDepartment` exists in the service but is unused).
7. Employee records are not linked to User accounts. Phase 4 matches by email (`User.email` equals `Employee.email`). Suggested long-term fix: add a `user` reference to `Employee`.
8. Employees and Departments pages show Add, Edit and Delete controls to the Employee role although the server correctly answers 403. Suggested fix: hide them by role.
9. API base URL `http://localhost:5000/api` is hardcoded in `client/src/services/api.js` and again in `authService.js`, which creates its own Axios instance. Suggested fix: use `import.meta.env.VITE_API_URL` and make `authService.js` import `api.js`. Needed before Phase 8.
10. The `Dashboard` component lives inside `client/src/App.jsx` as a temporary welcome page. Phase 7 replaces it.
11. DESIGN drift in `client/src/index.css`: no sidebar or top bar, bright blue `#2563eb` instead of a muted navy, a `box-shadow` on cards, 8px radius instead of 4px, an uppercase letter-spaced "eyebrow" label, no CSS variables. Suggested fix: one styling pass that adds CSS variables and the sidebar layout.
12. `client/src/pages/Employees.jsx` is about 207 lines, over the 150 line rule. Suggested fix: move the form into `components/EmployeeForm.jsx`.
13. `removeEmployee` and `removeDepartment` do not catch errors, so a failed delete shows nothing.
14. `ProtectedRoute` only checks that a token exists; an expired token is not detected until an API call returns 401, and the client does not then log the user out.
15. `server/.env.example` has `JWT_SECRET=replace_this_in_phase_2`. Each group member must set their own long random value in a real `.env`.
16. No automated tests exist, and nothing has been run against a live MongoDB yet.
17. `README.md` is empty (Phase 8).
18. Attendance dates use the server clock in UTC (`toISOString`). For Zimbabwe (UTC+2) a check-in between 00:00 and 02:00 local time is recorded against the previous date. Suggested fix: compute the date in the local time zone, or store the time zone in `.env`.
19. An Admin or HR user can only check in if an Employee record with their email exists; otherwise they get a 404 message. Create an Employee record for them if they should be tracked.
20. The helper `getEmployeeForLoggedInUser` lives inside `attendanceController.js`. Phase 5 (leave) needs the same logic. Suggested fix: move it to `server/utils/getEmployeeForUser.js` and import it in both controllers.

## 6. Naming conventions and patterns

- ES modules everywhere (`import` / `export`), double quotes, semicolons, 2-space indent.
- Server: models are PascalCase files (`Employee.js`); controllers, routes, middleware, utils are camelCase files (`employeeController.js`, `authRoutes.js`). Controller functions are verb-first (`getAllEmployees`, `createEmployee`, `updateEmployee`, `deleteEmployee`) and exported together at the bottom with `export { ... }`.
- Every function has a one-line `//` comment above it saying what it does.
- Controllers use `try/catch` and answer with `response.status(code).json({ message })` for errors. Parameters are written in full: `request`, `response`.
- Routes: `router.use(protectRoute)` first, then `allowRoles("Admin", "HR")` on write routes. Routers are mounted in `server.js` as `/api/<plural-name>`.
- Models use `{ timestamps: true }` and `ref` + `populate` for relations.
- Client: pages are PascalCase `.jsx` files in `pages/` with a default export; each API area has a `services/<name>Service.js` with named exports using the shared `api` instance; services return `response.data`.
- Forms keep values in one `form` state object and use a shared `updateField` handler based on the input `name`.
- Errors shown with `requestError.response?.data?.message`, rendered as `<p className="error">`.
- CSS lives in `client/src/index.css`; class names are kebab-case (`content-page`, `data-form`, `table-wrap`).

## 7. Next step

Before Phase 5: the group should run the Phase 4 test steps against a real MongoDB and change the Phase 4 status to "Tested" if they pass. Also decide whether to fix Known issues 1 (anyone can register as Admin) and 11 (design drift) now or in Phase 7.

Phase 5: Leave. Build only this phase, then stop.
- Server: `models/Leave.js` (employee ref `Employee`, leaveType, startDate, endDate, reason, status Pending/Approved/Rejected, reviewedBy ref `User`), plus a leave balance per employee (for example `models/LeaveBalance.js` or a `leaveBalance` number on `Employee`; ask the group which they prefer), `controllers/leaveController.js`, `routes/leaveRoutes.js`, mounted at `/api/leaves` in `server/server.js`.
- Employee routes: apply, cancel (only while Pending), own history. Admin and HR routes: list all, approve, reject (approval reduces the balance), view balances.
- Client: `services/leaveService.js` and `pages/Leave.jsx`, a route in `App.jsx`, a dashboard link. Status labels use green (Approved), red (Rejected), amber (Pending) only.
- Depends on: `models/Employee.js`, `middleware/authMiddleware.js` (`protectRoute`, `allowRoles`), the email-matching helper `getEmployeeForLoggedInUser` in `controllers/attendanceController.js` (move it to a shared util first, see Known issue 20), and `client/src/services/api.js`.
- Follow the Naming conventions above, keep each file under about 150 lines, no emojis.
