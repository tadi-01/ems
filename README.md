# Employee Management System

EMS brings employee records, departments, attendance, leave and payroll into one role-based workspace. It uses React, Vite and plain CSS on the frontend, with Express and Mongoose on the backend and MongoDB for storage.

## Requirements

- Node.js 20.19+ (or a newer supported LTS) and npm.
- MongoDB Atlas or a MongoDB replica set. Budget and payroll operations require transactions; standalone MongoDB is insufficient.
- Two terminals, one for each service. There is no root package.json.

## Local setup

Run commands from the repository root. Keep existing `.env` files; copy examples only when setting up a fresh checkout.

### 1. Backend

```powershell
cd server
npm ci
# Fresh checkout only; do not overwrite an existing .env:
Copy-Item .env.example .env
```

Edit `server/.env`:

```dotenv
PORT=5000
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/YOUR_EXISTING_DATABASE
JWT_SECRET=YOUR_RANDOM_SECRET_AT_LEAST_32_CHARACTERS
CLIENT_URL=http://localhost:5173
COMPANY_TIME_ZONE=Africa/Harare
ANNUAL_LEAVE_DAYS=21
LEAVE_DAY_MODE=calendar
```

Use your actual Atlas address and intended database name. A different database name creates a different database when records are written. Configure Atlas credentials and network access for the machine running the API. Never commit credentials.

Generate a signing secret locally:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

If the first Admin does not exist, set `ADMIN_NAME`, `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `server/.env`, then run:

```powershell
npm run create-admin
```

This creates an Admin or promotes the account with that email. An existing account keeps its password. Remove `ADMIN_PASSWORD` afterward. Skip this step when an Admin already exists.

Start the API:

```powershell
npm run dev
```

Wait for the database connection and port 5000 startup message. Check [API health](http://localhost:5000/api/health).

### 2. Frontend — separate terminal

From the repository root:

```powershell
cd client
npm ci
# Fresh checkout only:
Copy-Item .env.example .env
```

Set `VITE_API_URL=http://localhost:5000/api` in `client/.env`, then run:

```powershell
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

Open [EMS locally](http://127.0.0.1:5173). Both local frontend origins (`localhost:5173` and `127.0.0.1:5173`) are supported. Stop each service with Ctrl+C. Restart Vite after changing its environment settings.

## First-use checklist

1. Sign in as Admin. Public registration creates an Employee account only.
2. Assign HR access through Users & roles if required.
3. Create departments and set their monthly budgets.
4. Create employee records and select the registered user in **Linked account**. Registration alone does not create an employee record.
5. Link Employees who need personal attendance, leave or payslips. Link Admin/HR accounts when they need personal leave or payslips.
6. Configure payroll dates in Settings. Enable automatic preparation only when ready.

## Permissions

| Feature | Admin | HR | Employee |
| --- | --- | --- | --- |
| Company overview | Yes | Yes | Personal shortcuts |
| Employee/department directory | Manage | Manage | View |
| Personal check-in/out and attendance screen | No | No | Yes |
| Personal leave | Yes | Yes | Yes |
| Team attendance and leave decisions | Yes | Yes | No |
| Prepare, edit and approve payroll | Yes | Yes | No |
| Own approved payslips | Yes | Yes | Yes |
| Budget adjustments and pending budget decisions | Yes | No | No |
| Record completed external payroll payment | Yes | No | No |
| Users & roles and Settings | Yes | No | No |

Admin or HR can approve payroll they prepared or edited. There is no separate HR-review stage and no different-person approval requirement. Budget checks and explicit confirmation still apply. Leave has its own rules: users cannot approve their own leave. Users cannot change their own role, and a department manager must be reassigned before demotion.

The API checks the current database role on protected requests. Hiding navigation is not the authorization mechanism. Employee directory responses exclude salary and account-link details for Employee users.

## Payroll

1. Open Payroll and choose the department and month.
2. **Prepare missing payroll** adds missing employee records without overwriting existing amounts.
3. Use **Edit** to enter bonuses, allowances, overtime and deductions. The individual **Prepare payroll** form is collapsed by default and opens when editing.
4. Admin or HR selects **Approve department payroll**, checks the records, and confirms the decision with a justification. The same user may prepare and approve.
5. The server checks the entire department's monthly commitments atomically. Missing or unresolved employee payroll must be corrected. Stale decisions are rejected; over-budget payroll remains pending until Admin adjusts the budget.
6. Approved payslips are available to linked employees for viewing, printing and HTML download. Use Print to PDF for a PDF copy.

**Net pay = basic salary + allowances + bonuses + overtime − PAYE/tax − NSSA/pension − loan deductions − other deductions.**

Amounts are calculated on the server. Statutory deductions are manually entered; no tax tables or automatic statutory-rate calculation are supplied. Preparation copies full monthly salary and does not prorate mid-month hires. An employee/month unique index prevents duplicate payslips. Approved and historical records cannot be edited; pending/rejected records can be voided without deleting history. A voided record can be edited and resubmitted.

### Schedule and external payment

Defaults are preparation on the 25th, approval due by the 28th, and planned payment on the last working day. Admin can configure dates, holidays and automatic preparation in Settings. Working days exclude weekends and configured holidays. Short-month/holiday calendars bring deadlines forward when necessary.

The running backend checks each minute, prepares missing current-month payroll and sends deadline reminders. Automatic preparation defaults to off. Earlier missed months require manual preparation; a stopped or sleeping backend cannot guarantee timely scheduling.

Approved records retain the payment date configured at approval. They become due on that date. **EMS does not send money.** After completing payment externally, Admin records a reference and explicitly confirms payment of all approved unpaid records in the selected department/month. This is a manual payment record, not bank verification. Partial or failed payments must remain unconfirmed. Early and duplicate confirmations are rejected.

## Budgets and leave

Department budgets are recurring monthly limits. Commitments include employee salaries, replaced by approved gross payroll for that employee/month, plus approved expenses. Over-budget hires, salary increases and expenses become pending requests instead of immediately changing active records. Admin can increase or reallocate budgets with justification. Usage warnings appear at 80% and 90%. Existing salaries remain visible and flagged when funds are insufficient.

This is not an immutable month-by-month budget ledger: changing a recurring budget changes the limit displayed for other months. No currency conversion is provided.

Annual leave defaults to 21 calendar days. `ANNUAL_LEAVE_DAYS`, `LEAVE_DAY_MODE` (`calendar` or `working`) and comma-separated `PUBLIC_HOLIDAYS` configure new requests without rewriting stored leave durations.

## Configuration and project structure

Optional backend variables include `COMPANY_NAME` and `PAYROLL_CURRENCY` for payslips. `COMPANY_TIME_ZONE` defaults to `Africa/Harare`. Keep secrets in ignored `.env` files or hosting environment variables. Frontend `VITE_API_URL` must end in `/api` and is compiled into the build.

```text
client/src/pages/         Screens
client/src/components/    Shared interface components
client/src/services/      API and session helpers
client/src/index.css      Shared styles
server/routes/           API routes and role gates
server/controllers/      Request handling
server/models/           Mongoose schemas
server/middleware/       Authentication and authorization
server/utils/            Shared business logic
client/tests/, server/tests/       Automated tests
client/scripts/, server/scripts/   Verification scripts
```

Keep JavaScript/JSX, plain CSS, simple async/await and small components (roughly 150 lines where practical). Reuse existing routes, services and validation. Add comments for non-obvious reasoning rather than narrating obvious statements. Do not migrate to TypeScript, Redux or a component library for routine fixes.

The Audit history interface and read endpoint have been removed. Internal transaction records and existing stored history are retained; there is no user-facing audit-history feature.

## Verification

```powershell
cd server
npm test
# Optional: requires permission to create/drop a temporary database on the configured host
node scripts/verifyIntegration.js
cd ../client
npm test
npm run build
```

Live integration checks use port 5099 and a unique `ems_qa_<timestamp>` database, then remove that database. They do not seed the configured employee database. After a forced interruption, inspect only the exact generated QA database before cleanup.

Optional responsive checks require Chrome and a separate Playwright installation. Set `PLAYWRIGHT_MODULE` to its absolute module path, start Vite, then run `node client/scripts/verifyBrowser.cjs` from the repository root. These checks use API fixtures at six widths (320–1440px), with output in ignored `.qa/browser`.

## Deployment

| Service | Root | Build | Start/output |
| --- | --- | --- | --- |
| Render API | `server` | `npm ci` | `npm start` |
| Vercel frontend | `client` | `npm run build` | `dist` |

Configure backend `MONGO_URI`, `JWT_SECRET` and `CLIENT_URL` (the exact frontend origin). Set frontend `VITE_API_URL=https://YOUR_API_HOST/api` before building. Keep the intended database name. `client/vercel.json` provides SPA route fallback. After deployment check health, login, registration, employee linking and nested-route refresh.

## Troubleshooting

- **Registration fails:** check API health, API URL, allowed frontend origin and duplicate email errors.
- **Personal records missing:** check the employee's Linked account.
- **Unexpected database:** compare the database name in local and hosted `MONGO_URI`.
- **Transactions fail:** use Atlas or a replica set, not standalone MongoDB.
- **Approval fails:** refresh stale records, complete missing payroll and resolve budget excess. A different approver is not required.
- **Port occupied:** stop the previous service before starting another.
- **Wide table on mobile:** scroll inside the table; the page itself should remain within the viewport.

`progress.md` preserves project history and earlier verification results; historical entries may describe superseded behavior. This README is the current operating guide. `PRESENTER_NOTES.md` provides a short demonstration guide. `Project_Documentation.docx` is the illustrated project guide updated on 19 October 2026.
