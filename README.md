# Employee Management System

A role-based workspace that brings employee records, departments, attendance, leave and
payroll into one place. Managers and HR staff administrate the company; employees see
only their own records.

**Built with**

| Tool               | What it does here                                        |
| ------------------ | -------------------------------------------------------- |
| React 18 + Vite    | Draws the pages the user sees                            |
| React Router       | Decides which page appears for which address             |
| Plain CSS          | Shared styles with no framework dependency               |
| Express 5          | REST API, role guards and business logic                 |
| Mongoose + MongoDB | Data persistence; Atlas replica set enables transactions |
| JWT + bcrypt       | Stateless auth; password hashing                         |
| express-rate-limit | Brute-force protection on the login endpoint             |

## Run it locally

You need **Node.js 20.19 or newer** and two terminals — one for the server, one for the
client. There is no root `package.json`.

### 1. Backend

```powershell
cd server
npm ci
# Fresh checkout only — do not overwrite an existing .env:
Copy-Item .env.example .env
```

Edit `server/.env` with real values:

```dotenv
PORT=5000
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/YOUR_DATABASE
JWT_SECRET=<at least 32 random characters>
CLIENT_URL=http://localhost:5173
COMPANY_TIME_ZONE=Africa/Harare
ANNUAL_LEAVE_DAYS=21
LEAVE_DAY_MODE=calendar
```

Generate a signing secret:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Create the first Admin account (first time only):

```dotenv
# Add to server/.env, then run create-admin, then remove ADMIN_PASSWORD:
ADMIN_NAME=Your Name
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=choose_a_strong_password
```

```powershell
npm run create-admin
```

Start the API:

```powershell
npm run dev
```

Wait for the database connection message. Check [API health](http://localhost:5000/api/health).

### 2. Frontend — separate terminal

```powershell
cd client
npm ci
Copy-Item .env.example .env
# Set VITE_API_URL=http://localhost:5000/api in client/.env
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

Open [http://127.0.0.1:5173](http://127.0.0.1:5173). Both `localhost:5173` and
`127.0.0.1:5173` are allowed CORS origins. Stop each service with Ctrl+C.

## First-use checklist

1. Sign in as Admin. Public registration creates an Employee account only.
2. Assign HR access through **Users & roles** if required.
3. Create departments and set their monthly budgets (with a justification).
4. Create employee records and select the registered user in **Linked account**.
   Registration alone does not create an employee record.
5. Link Admin/HR accounts that need personal leave or payslips.
6. Configure payroll dates in **Settings**. Enable automatic preparation only when ready.

## Permissions

| Feature                             | Admin  | HR     | Employee                |
| ----------------------------------- | ------ | ------ | ----------------------- |
| Company overview dashboard          | Yes    | Yes    | Personal shortcuts only |
| Employee and department directory   | Manage | Manage | View                    |
| Personal check-in/out               | No     | No     | Yes                     |
| Personal leave requests             | Yes    | Yes    | Yes                     |
| Team attendance and leave decisions | Yes    | Yes    | No                      |
| Prepare and approve payroll         | Yes    | Yes    | No                      |
| Own approved payslips               | Yes    | Yes    | Yes                     |
| Budget adjustments                  | Yes    | No     | No                      |
| Users & roles and Settings          | Yes    | No     | No                      |

The API checks the current database role on every protected request. Navigation
visibility is a convenience, not the authorization mechanism. Employee directory
responses exclude salary and account-link details for Employee users.

## Payroll workflow

1. Open **Payroll** and choose a department and month.
2. **Prepare missing payroll** creates draft records without overwriting existing amounts.
3. Use **Edit** to enter allowances, bonuses, overtime and deductions. The preparation
   form is collapsed by default and opens automatically when editing.
4. Admin or HR clicks **Approve department payroll**, reviews the batch and confirms.
5. The server runs an atomic budget check. Stale records, missing employees and
   over-budget payroll are rejected with a clear message.
6. Approved payslips are available to linked employees for viewing, printing and
   HTML download.

**Net pay = basic salary + allowances + bonuses + overtime − PAYE/tax − NSSA/pension
− loan deductions − other deductions.**

Statutory deductions are entered manually; no automatic tax-rate tables are supplied.
EMS does not transfer money. Payment tracking was removed from this release.

## Budgets and leave

Department budgets are recurring monthly limits. Commitments include employee salaries
(replaced by approved gross payroll for that month) and approved expenses. Over-budget
hires, salary changes and expenses become pending budget requests rather than taking
effect immediately. Admin can increase or reallocate budgets with a justification.
Threshold warnings appear at 80% and 90% usage.

Annual leave defaults to 21 calendar days. `ANNUAL_LEAVE_DAYS`, `LEAVE_DAY_MODE`
(`calendar` or `working`) and comma-separated `PUBLIC_HOLIDAYS` configure new leave
requests without changing stored durations. Users cannot approve their own leave.

## Configuration and project structure

```text
client/src/pages/       Screens
client/src/components/  Shared UI components
client/src/services/    API and session helpers
client/src/index.css    Shared styles
server/routes/          API routes and role gates
server/controllers/     Request handling
server/models/          Mongoose schemas
server/middleware/       Authentication and authorization middleware
server/utils/           Shared business logic and helpers
client/tests/, server/tests/        Automated tests
client/scripts/, server/scripts/    Verification scripts
```

Optional backend variables: `COMPANY_NAME`, `PAYROLL_CURRENCY`, `PUBLIC_HOLIDAYS`.
`COMPANY_TIME_ZONE` defaults to `Africa/Harare`. Keep secrets in ignored `.env` files
or hosting environment variables. `VITE_API_URL` must end in `/api` and is compiled
into the client build.

Keep JavaScript/JSX, plain CSS, simple async/await and small components (roughly 150
lines where practical). Reuse existing routes, services and validation. Add comments
for non-obvious reasoning. Do not migrate to TypeScript, Redux or a component library
for routine fixes.

## Verification

```powershell
cd server && npm test
node scripts/verifyIntegration.js   # requires Atlas or replica set; creates/removes a QA database
cd ../client && npm test && npm run build
```

Browser checks require Chrome and a separate Playwright installation. Set
`PLAYWRIGHT_MODULE` to its absolute module path, start Vite, then run:

```powershell
node client/scripts/verifyBrowser.cjs
```

Output goes to the ignored `.qa/browser` folder.

## Deployment

| Service           | Root       | Build command     | Start / output |
| ----------------- | ---------- | ----------------- | -------------- |
| Render (API)      | `server` | `npm ci`        | `npm start`  |
| Vercel (frontend) | `client` | `npm run build` | `dist`       |

Set `MONGO_URI`, `JWT_SECRET` and `CLIENT_URL` (exact frontend origin) on the Render
service. Set `VITE_API_URL=https://YOUR_API_HOST/api` before building the Vercel
deployment. `client/vercel.json` provides SPA route fallback. After deployment, check
health, login, registration, employee linking and nested-route refresh.

## Troubleshooting

- **Registration fails** — check API health, API URL, allowed frontend origin and duplicate email.
- **Personal records missing** — verify the employee's Linked account field.
- **Wrong database** — compare the database name in local and hosted `MONGO_URI`.
- **Transactions fail** — use Atlas or a replica set; standalone MongoDB is insufficient.
- **Approval fails** — refresh stale records, complete missing payroll and resolve budget excess.
- **Port occupied** — stop the previous service before starting another.
- **Wide table on mobile** — scroll inside the table; the page itself should remain within the viewport.
