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
| Admin and HR | The same permissions for both: manage employees, departments and payslips, see everyone's attendance, approve or reject leave, and see the dashboard totals |
| Employee | Check in and out, see their own attendance, apply for and cancel leave, see their own payslips, and view the employee and department lists |

An account is linked to an employee record by email. To use attendance, leave and payslips, an Admin or HR user must add an employee whose email is the same as the person's account email.

## Technology

| Part | Technology |
|---|---|
| Frontend | React (Vite), React Router, Axios, plain CSS |
| Backend | Node.js and Express |
| Database | MongoDB with Mongoose |
| Login security | JSON Web Tokens (JWT) and password hashing with bcryptjs |
| Hosting | Vercel (frontend), Render (backend), MongoDB Atlas (database) |

## Folder structure

```
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

You need Node.js 18 or newer, and a MongoDB database. The easiest database is a free MongoDB Atlas cluster (see "Deploy" below for how to create one).

1. Get the code and open a terminal in the project folder.
2. Set up and start the backend:

```
cd server
npm install
cp .env.example .env
```

(On Windows Command Prompt, use `copy` instead of `cp`.) Open `server/.env` and fill in the values (see the table below). To make a strong `JWT_SECRET`, run this and paste the result:

```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Then create the first Admin account and start the server:

```
npm run create-admin
npm run dev
```

After `create-admin` succeeds, delete the `ADMIN_PASSWORD` line from `server/.env`.

3. In a second terminal, set up and start the frontend:

```
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
| MONGO_URI | The MongoDB Atlas connection string. |
| JWT_SECRET | Long random text used to sign login tokens. The server will not start without it. |
| CLIENT_URL | The address of the deployed frontend, with no slash at the end. Only this address (and http://localhost:5173) may call the API from a browser. |
| ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD | Used only by `npm run create-admin` to make the first Admin. |

Frontend (`client/.env`):

| Name | What it is for |
|---|---|
| VITE_API_URL | The address of the API, ending in `/api`. Vite reads it when the app is built. |

## API routes

All routes start with `/api`. "Logged in" means any user with a valid login token. Admin and HR users are called "Admin or HR" below.

| Method and path | Who can use it | What it does |
|---|---|---|
| GET /health | Anyone | Checks that the API is running |
| POST /auth/register | Anyone | Creates an Employee account |
| POST /auth/login | Anyone | Logs in and returns a token |
| GET /auth/me | Logged in | Returns the token details |
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

## Known limitations

The full list is in `PROGRESS.md` under "Known issues and bugs". The main ones:

- There is no page for changing a user's role. Because Admin and HR have the same permissions, the simplest way to give someone management access is to let them register and then run `npm run create-admin` with their email, which makes them an Admin. Making someone HR needs a change in the database.
- Today's date and the current month use the server's UTC clock, so between 00:00 and 02:00 in Zimbabwe, attendance and the dashboard still refer to the previous day.
- Leave days are calendar days; weekends and public holidays are not skipped.
- Tax on a payslip is typed in as an amount, not worked out from a percentage.
- An Admin or HR user can approve their own leave request.

## Project notes

`PROGRESS.md` is the build log. It lists every file, the decisions made, how to test each phase, and what is still untested. Please read it before changing the code.
