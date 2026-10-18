# Employee Management System

EMS manages employees, departments, attendance, leave and payroll using React, Vite, plain CSS, Express and MongoDB. The interface follows the supplied Carbon reference with a dark header, blue actions, neutral surfaces and responsive tables.

## Requirements

- Node.js 20.19+ or a newer supported LTS version and npm (verified locally on Node.js 24).
- MongoDB locally or Atlas credentials for an explicitly named database.
- Two terminals. Install packages inside `server` and `client`; there is no root package.json.

## Local setup

Run these PowerShell commands from the repository root. Preserve existing `.env` files; copy examples only for a fresh setup.

**Terminal 1 - backend**

```powershell
cd server
npm ci
# Fresh setup only:
Copy-Item .env.example .env
```

Edit `server/.env`. Set `MONGO_URI` to your intended database, for example `mongodb://127.0.0.1:27017/employee_management`. For Atlas, keep the exact database name already in use after the hostname and before `?`. A different name creates a separate database when records are written. Never replace an existing name just to match this example.

Set a random `JWT_SECRET` of at least 32 characters. Generate one locally:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Set `CLIENT_URL=http://localhost:5173`. If you need the first Admin, set `ADMIN_NAME`, `ADMIN_EMAIL` and `ADMIN_PASSWORD`, then run `npm run create-admin`. This creates an Admin or promotes the existing account with that email; an existing account keeps its password. Remove `ADMIN_PASSWORD` afterward. Skip this step if your Admin exists.

```powershell
npm run dev
```

Wait for the database connection and port 5000 startup message. Check [API health](http://localhost:5000/api/health).

**Terminal 2 - frontend**

From the repository root:

```powershell
cd client
npm ci
# Fresh setup only:
Copy-Item .env.example .env
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

Set `VITE_API_URL=http://localhost:5000/api` in `client/.env`. Open [local EMS](http://127.0.0.1:5173). Both `localhost:5173` and `127.0.0.1:5173` are allowed API origins. Stop either service with Ctrl+C in its terminal. Restart Vite after frontend environment changes.

## First use and permissions

1. Sign in as Admin. Public registration always creates an Employee account.
2. Use Users & roles to assign HR if needed. Only Admin changes roles; users cannot change their own role.
3. Create a department, then employee records. Select a registered account in **Linked account**. Registration alone does not create an employee record.
4. Every role needs a linked employee record for personal attendance, leave and payslips. The stable link survives email changes; legacy unlinked records can match by email on first use.

| Area | Admin | HR | Employee |
|---|---|---|---|
| Overview company totals | Yes | Yes | Personal task links |
| Employee and department lists | View and manage | View and manage | View |
| Personal attendance and leave | Yes | Yes | Yes |
| All attendance and leave review | Yes | Yes | No |
| All payroll management | Yes | Yes | No |
| Own payslips | Yes | Yes | Yes |
| Users & roles page | Yes | No | No |

Reviewers cannot approve or reject their own leave. Reassign a department manager before demoting that account. Departments with employees, and employees with attendance, leave or payroll history, cannot be deleted.

## Configuration

Keep real values in ignored `.env` files or hosting environment settings.

| Backend variable | Purpose |
|---|---|
| `PORT` | API port; default 5000. Hosting may supply its own value. |
| `MONGO_URI` | Connection URL containing the intended database name; missing names are rejected. |
| `JWT_SECRET` | Random signing secret of at least 32 characters; sample values are rejected. |
| `CLIENT_URL` | Frontend origin; use the deployed URL in production. |
| `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | One-time Admin setup. |
| `COMPANY_TIME_ZONE` | IANA zone; default `Africa/Harare`. |
| `ANNUAL_LEAVE_DAYS` | Non-negative integer; default `21`. |
| `LEAVE_DAY_MODE` | `calendar` by default, or `working` to exclude weekends and configured holidays. |
| `PUBLIC_HOLIDAYS` | Comma-separated `YYYY-MM-DD` dates for working-day mode. |
| `COMPANY_NAME`, `PAYROLL_CURRENCY` | Optional metadata copied onto new payslips. |

Frontend `VITE_API_URL` must end in `/api`. It is compiled into builds, so changing it on a host requires a rebuild.

Leave remains **21 calendar days** by default. Settings apply to new requests without rewriting stored day counts. Tax, unpaid leave and absence deductions remain manually entered by HR. The server calculates net salary as basic salary + allowances + bonuses - deductions - tax. Audit fields identify the latest payslip editor, not a full revision history.

## Verification

```powershell
cd server
npm test
# Optional live run with MongoDB permissions to create and drop a QA database:
node scripts/verifyIntegration.js
cd ../client
npm test
npm run build
```

The integration script uses port 5099 and a unique `ems_qa_<timestamp>` database on the configured MongoDB host. It seeds temporary accounts, makes real API requests and drops only that generated database in cleanup. It does not write fixtures to the configured employee database. After a forced interruption, check for a leftover QA database by its exact generated name.

Optional browser checks require Chrome and Playwright installed in a separate test-tools directory. Set `PLAYWRIGHT_MODULE` to that installation's absolute `node_modules/playwright` path, then run `node client/scripts/verifyBrowser.cjs` from the repository root with Vite running. `QA_FRONTEND_URL` overrides the default `http://127.0.0.1:5173`. The suite uses API fixtures at 320, 390, 768, 1024, 1280 and 1440 pixels. Screenshots and results go to ignored `.qa/browser`; it does not write employee data.

See `progress.md` for results and verification limits. Dependency manifests and lockfiles are aligned. This interface pass adds no application dependencies.

## Deployment settings

These are repository settings; provider plan features and dashboard labels may differ.

| Service | Root | Build | Start or output | Environment |
|---|---|---|---|---|
| Render API | `server` | `npm ci` | `npm start` | `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, policy settings |
| Vercel frontend | `client` | `npm run build` | `dist` | `VITE_API_URL=https://your-api-host/api` |

Use the intended existing database name. Configure Atlas credentials and network access for the backend host. Set `CLIENT_URL` to the exact frontend origin. `client/vercel.json` supplies SPA route fallback. After deployment verify API health, login, registration, employee linking and nested-route refresh. This maintenance run does not publish to Render or Vercel.

## Troubleshooting

- **Cannot register:** read the API error; check API health, `VITE_API_URL` and `CLIENT_URL`. A duplicate email needs login instead. Admin or HR must then create and link the employee record.
- **Missing personal records:** check Linked account on Employees.
- **Unexpected database:** compare the database name in local and hosted `MONGO_URI`; do not omit or casually change it.
- **Connection interrupted:** restore API/database connectivity and use Retry. Temporary server errors do not deliberately clear your session.
- **Wrong role:** sign in again to refresh navigation. The API checks the current database role.
- **Port in use:** stop the previous service before starting another. A different frontend origin also needs API configuration.
- **Wide tables on phones:** scroll within the table; keyboard users can focus the region and use arrow keys.

## Structure and conventions

`client/src/pages` contains screens, `components` shared UI and `services` API/session helpers. `client/src/index.css` owns styling. The backend separates `routes`, `controllers`, `models`, `middleware` and `utils`. Verification scripts live in each application's `scripts` folder.

Keep plain JavaScript/JSX, simple async/await, comments explaining functions and small components (aim for roughly 150 lines). Reuse existing services and backend validation. No TypeScript, Redux or Carbon component-library migration is needed.

The retained documentation is this README, `progress.md`, and `Project_Documentation.docx` (architecture, models, workflows and maintenance).

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
