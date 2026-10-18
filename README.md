# Employee Management System

A web application for managing a company's employees, departments, attendance, leave and payroll. It was built by a group of second-year Computer Science students for a Web Development course.

## Features

- Login and registration with three roles: Admin, HR and Employee
- Employees: add, edit, delete and search (ID, name, department, designation, email, phone, joining date, salary)
- Departments: add, edit and delete (name, manager, budget, employee count)
- Attendance: check in and check out, working hours, and one record per employee per day
- Leave: apply, cancel and see history; Admin and HR approve or reject; Annual leave balance
- Payroll: basic salary plus allowances plus bonuses minus deductions minus tax gives net salary; printable payslip
- Dashboard: total employees, present today, on leave today, monthly payroll and employees per department
- Responsive layout that works on a phone

## What each role can do

| Role | Access |
|---|---|
| Admin and HR | Manage employees and departments, review leave and payroll; only Admin can change roles on Users. Shared permissions: manage employees, departments and payslips, see everyone's attendance, approve or reject leave, and see the dashboard totals |
| Employee | Check in and out, see their own attendance, apply for and cancel leave, see their own payslips, and view the employee and department lists |

An Admin or HR user links an employee to an account using the Linked account dropdown on Employees. The link stays valid if the employee email changes. Existing records without a link are matched by email once on first use, then the account reference is saved. Admin and HR also need a linked employee record to use personal attendance, leave and payslips; administrative access alone does not create an employment record.

## Technology

| Part | Technology |
|---|---|
| Frontend | React (Vite), React Router, Axios, plain CSS |
| Backend | Node.js and Express |
| Database | MongoDB with Mongoose |
| Login security | JSON Web Tokens (JWT) and password hashing with bcryptjs |
| Hosting | Vercel (frontend), Render (backend), MongoDB Atlas (database) |

## Folder structure

```md
ems/
  client/                 React app
    src/
      components/         Layout, ProtectedRoute, forms and other reusable pieces
      pages/              One file per page
      services/           Functions that call the API (Axios)
      App.jsx             List of routes
      main.jsx            Starts the app
      index.css           All styles, with colors and spacing as CSS variables
    vercel.json           Makes page refreshes work on Vercel
    .env.example          Example frontend settings
  server/                 Express API
    controllers/          The logic for each route
    middleware/           Login check and role check
    models/               Mongoose models (User, Employee, Department, Attendance, Leave, Payroll)
    routes/               URL paths for each area
    utils/                Helpers and the createAdmin setup script
    server.js             Starts the API
    .env.example          Example backend settings
  PROGRESS.md             Build log, decisions, known issues and test steps
  EMS_AI_PROMPTS.md       The prompts used with the AI assistant
  README.md               This file

```

## Run it on your own computer

You need Node.js 20 or newer (Node.js 24 is used for local verification), and a MongoDB database. The easiest database is a free MongoDB Atlas cluster (see "Deploy" below for how to create one).

1. Get the code and open a terminal in the project folder.
2. Set up and start the backend:

```sh
cd server
npm install
cp .env.example .env

```

(On Windows Command Prompt, use `copy` instead of `cp`.) Open `server/.env` and fill in the values (see the table below). To make a strong `JWT_SECRET`, run this and paste the result:

```html
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

```

Then create the first Admin account and start the server:

```sh
npm run create-admin
npm run dev

```

After `create-admin` succeeds, delete the `ADMIN_PASSWORD` line from `server/.env`.

3. In a second terminal, set up and start the frontend:

```sh
cd client
npm install
cp .env.example .env
npm run dev

```

4. Open http://localhost:5173 and log in with the Admin email and password you set.

New people who use the Register page always become Employees. The Admin account is only made with `npm run create-admin`.

## Environment variables

Real values must never be committed to GitHub. The `.env` files are ignored by Git.

Backend (`server/.env`):

| Name | What it is for |
|---|---|
| PORT | The port the API listens on. Render sets it for you. Default is 5000. |
| MONGO_URI | MongoDB connection string with an explicit database name, e.g. `/employee_management` before `?`. Startup and admin setup reject a missing database name. |
| JWT_SECRET | Random secret of at least 32 characters. Missing, short and example placeholder secrets prevent startup. |
| CLIENT_URL | The address of the deployed frontend, with no slash at the end. Only this address (and http://localhost:5173) may call the API from a browser. |
| ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD | Used only by `npm run create-admin` to make the first Admin. |
| COMPANY_TIME_ZONE | IANA time zone for attendance, leave year and dashboard dates. Default `Africa/Harare`. |
| ANNUAL_LEAVE_DAYS | Non-negative integer allowance; default `21`. |
| LEAVE_DAY_MODE | `calendar` (default) or `working` (excludes Saturday, Sunday and configured holidays). |
| PUBLIC_HOLIDAYS | Comma-separated `YYYY-MM-DD` dates, used only in working mode. No holiday calendar is downloaded automatically. |
| COMPANY_NAME, PAYROLL_CURRENCY | Optional payslip company heading and currency code, copied onto new payslips. |

Frontend (`client/.env`):

| Name | What it is for |
|---|---|
| VITE_API_URL | The address of the API, ending in `/api`. Vite reads it when the app is built. |

## API routes

All routes start with `/api`. "Logged in" means any user with a valid login token. Admin and HR users are called "Admin or HR" below.

| Method and path | Who can use it | What it does |
|---|---|---|
| GET /health | Anyone | Returns 200 when the API/database are ready, 503 if the database disconnects |
| GET /users | Admin or HR | Safe account details for dropdowns and role management |
| PUT /users/:id/role | Admin | Changes another account to Admin, HR or Employee |
| POST /auth/register | Anyone | Creates an Employee account |
| POST /auth/login | Anyone | Logs in and returns a token |
| GET /auth/me | Logged in | Returns current account details and role from the database |
| GET /employees?search= | Logged in | Lists employees, with optional search |
| POST /employees | Admin or HR | Adds an employee |
| PUT /employees/:id | Admin or HR | Changes an employee |
| DELETE /employees/:id | Admin or HR | Deletes an employee |
| GET /departments | Logged in | Lists departments |
| POST /departments | Admin or HR | Adds a department |
| PUT /departments/:id | Admin or HR | Changes a department |
| DELETE /departments/:id | Admin or HR | Deletes a department |
| POST /attendance/check-in | Logged in | Records today's check-in |
| POST /attendance/check-out | Logged in | Records today's check-out and the hours worked |
| GET /attendance/me | Logged in | Lists the user's own attendance |
| GET /attendance?date= | Admin or HR | Lists everyone's attendance, with optional date |
| POST /leaves | Logged in | Applies for leave |
| GET /leaves/me | Logged in | Lists the user's own leave and Annual balance |
| PUT /leaves/:id/cancel | Logged in | Cancels the user's own Pending request |
| GET /leaves?status= | Admin or HR | Lists all leave requests |
| PUT /leaves/:id/approve | Admin or HR | Approves a Pending request |
| PUT /leaves/:id/reject | Admin or HR | Rejects a Pending request |
| GET /leaves/balances | Admin or HR | Shows every employee's Annual leave balance |
| GET /payroll/me | Logged in | Lists the user's own payslips |
| GET /payroll?month= | Admin or HR | Lists all payslips, with optional month |
| POST /payroll | Admin or HR | Creates a payslip (the server calculates net salary) |
| PUT /payroll/:id | Admin or HR | Changes the amounts on a payslip |
| DELETE /payroll/:id | Admin or HR | Deletes a payslip |
| GET /dashboard | Admin or HR | Returns the dashboard totals |

## Deploy

Do the three parts in this order: database, backend, frontend. Menu names on these websites change from time to time, so follow the idea of each step if a button has moved.

### 1. Database (MongoDB Atlas)

1. Create a free account at https://www.mongodb.com/atlas and create a free cluster.
2. Under Database Access, create a database user with a password. Write the password down.
3. Under Network Access, allow access from the internet (0.0.0.0/0). Render's free plan does not give the backend a fixed address, so Atlas cannot be limited to one address.
4. Click Connect, choose Drivers, and copy the connection string. Put your database user and password in it, and add the database name `employee_management` after the host name. This is your `MONGO_URI`.

The unique rules (one attendance record per day, one payslip per month, unique emails) are created automatically the first time the server connects.

### 2. Backend (Render)

1. Create an account at https://render.com and choose New, then Web Service. Connect the GitHub repository.
2. Set the root directory to `server`, the build command to `npm install` and the start command to `npm start`.
3. Add the environment variables `MONGO_URI` and `JWT_SECRET` (a new long random value, not the one from your computer). Leave `CLIENT_URL` empty for now.
4. Deploy. When it finishes, Render shows the address, for example `https://your-api.onrender.com`. Opening `https://your-api.onrender.com/api/health` should show "Employee Management API is running."

Notes about the free plan: Render's free web services spin down after 15 minutes without requests and take about a minute to wake up, so the first page load after a quiet period is slow. Free services also have no shell, so the first Admin account is made from your own computer (see step 4 below).

### 3. Frontend (Vercel)

1. Create an account at https://vercel.com and choose Add New, then Project. Import the GitHub repository.
2. Set the root directory to `client`. Vercel detects Vite; the build command is `npm run build` and the output folder is `dist`.
3. Add the environment variable `VITE_API_URL` with the value `https://your-api.onrender.com/api` (your Render address followed by `/api`).
4. Deploy. The file `client/vercel.json` sends every path to the app, so refreshing a page such as `/employees` works.

If you change `VITE_API_URL` later, redeploy the frontend, because the value is built into the app.

### 4. Connect the two parts and create the Admin

1. In Render, set `CLIENT_URL` to your Vercel address (for example `https://your-app.vercel.app`, with no slash at the end) and let the service redeploy. Without this the browser will block the frontend from calling the API.
2. On your own computer, put the Atlas `MONGO_URI` and the `ADMIN_NAME`, `ADMIN_EMAIL` and `ADMIN_PASSWORD` values in `server/.env`, then run `npm run create-admin` inside the `server` folder. Delete `ADMIN_PASSWORD` from the file afterwards.
3. Open your Vercel address and log in as the Admin.

## Verification and policy choices

Run `npm test` inside `server` and `client`, then `npm run build` inside `client`. The tests use Node's built-in runner and the existing Vite loader, with no new dependencies. Server tests use database stand-ins; client tests render role-dependent pages and check session handling. They do not replace the live integration and browser checklist in `docs/VERIFICATION.md`.

- Employee and Department lists remain readable by every logged-in role, as required. Only Admin and HR see editing controls. Users is Admin-only, and the server checks the current role on every protected request.
- You cannot change your own role. Assign another manager before demoting a department manager to Employee.
- Leave review cannot approve or reject the reviewer's own request. Pending review/cancellation uses a conditional update so one cannot overwrite the other.
- Leave remains 21 calendar days by default. Working-day counting and the allowance are configurable. Settings affect new requests; stored leave day totals are not rewritten. Plan allowance changes at the start of a year.
- Tax remains a manually entered amount. HR includes unpaid leave and absence adjustments in Deductions; automatic tax or absence calculations require an agreed policy and are not enabled. This preserves the project's chosen payroll rules.
- Admin and HR can switch between All payslips and My payslips. Edits record `updatedBy` and `updatedAt`; old slips retain their original amounts and creator. The audit fields record the latest editor, not a full revision history.
- A department with employees cannot be deleted. An employee with attendance, leave or payroll history cannot be deleted, to preserve those records.
- The API requires a real database and waits for model indexes before listening. No migration, live-data deletion, deployment or hosting-plan change was performed by this maintenance pass.
- Live MongoDB index/concurrency checks, full browser flows and deployment remain to be verified. Free hosting availability is an operational property, not an application defect.

## Project notes

`PROGRESS.md` is the build log. It lists every file, the decisions made, how to test each phase, and what is still untested. Please read it before changing the code.
