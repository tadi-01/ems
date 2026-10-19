# EMS — Presenter Notes

## Purpose (30–45 seconds)

Our Employee Management System (EMS) consolidates employee records, departments,
attendance, leave and payroll into a single role-based workspace. It eliminates
duplicated paper records and spreadsheets, and ensures that every user sees only
the data and actions their role permits. The system is production-ready: it is
deployed on Render (API) and Vercel (frontend) and backed by a MongoDB Atlas
replica set.

## Technology choices worth mentioning

| Layer | Technology | Why |
| --- | --- | --- |
| Frontend | React 18 + Vite, plain CSS | Fast HMR, no heavy CSS framework overhead |
| Backend | Express 4, Node 20 | Lightweight, async-native, familiar to the team |
| Database | MongoDB + Mongoose | Flexible schema for evolving HR data; Atlas replica set enables multi-document transactions |
| Auth | JWT (jsonwebtoken) + bcrypt | Stateless tokens scale horizontally; bcrypt slows offline brute-force |
| Rate limiting | express-rate-limit | Caps login attempts at 10 / 15 min per IP |
| Deployment | Render (API) + Vercel (SPA) | Zero-config CI/CD from the main branch |

Key design principle: **all validation, calculations and permission checks run on
the server**. The browser is treated as untrusted.

## Role model (explain before the demo)

Three roles exist: **Admin**, **HR** and **Employee**.

- **Admin** — full access including budget adjustments, payroll approval and Settings.
- **HR** — manages employees, departments, leave, attendance and payroll preparation/approval; cannot change budgets or Settings.
- **Employee** — personal attendance, leave requests and approved payslips only.

A registered account must be explicitly linked to an employee record before
personal records (attendance, leave, payslips) become visible. This separation
prevents orphaned records when someone leaves.

## Suggested demo order (7–10 minutes)

### 1. Sign in as Admin (1 min)
Open the login page. Point out the email/password fields and the account-switch
link to the registration page. Log in and show the responsive navigation — collapse
the sidebar on desktop, then resize to phone width.

### 2. Departments and employees (1.5 min)
- Open **Departments**. Create a department, choose a manager (name-only dropdown —
  email addresses are intentionally hidden in selection menus).
- Open **Employees**. Show the directory, then add or edit an employee. Demonstrate
  the **Linked account** dropdown (shows name only) and explain that selecting an
  account auto-fills name, email and phone. Explain that the link enables the
  personal dashboard for that user.

### 3. Employee perspective (1.5 min)
Log in as a linked Employee in a second browser or private window.
- Show check-in/check-out on the dashboard quick-action.
- Submit a leave request. Observe that management tabs are absent from navigation.
- Open Payroll: only approved payslips for this account appear.

### 4. HR/Admin — leave and payroll (2 min)
Back in the Admin window:
- Open **Leave** and approve or reject the pending request. Point out that the
  approver cannot approve their own leave.
- Open **Payroll → Department payroll**. Select the current month and a department.
  Click **Prepare missing payroll** to create draft records. Edit one bonus in the
  collapsible form that opens automatically.
- Click **Approve department payroll**, confirm the decision, observe the budget
  check message.
- Return to the Employee window: the approved payslip now appears. Show the
  print/download action.

### 5. Notifications and settings (1 min)
- Click the bell icon; show the notification list, **Mark all read** and
  **Clear all** buttons.
- Open **Settings** (Admin only): show the payroll schedule, planned payment date
  and the automatic-preparation toggle. Explain that the backend scheduler runs
  once per minute while the server is alive.

### 6. Responsive finish (30 sec)
Drag the browser window to ~375 px wide. Show mobile navigation drawer, stacked
form fields and the scrollable payroll table.

Use prepared demonstration data. **Never expose passwords, connection strings or
real employee data during a presentation.**

## Important business rules to state clearly

- **Net pay** = basic salary + allowances + bonuses + overtime − PAYE/tax − NSSA/pension − loan deductions − other deductions. Calculated server-side.
- **Tax amounts are manually entered.** There is no automatic statutory-rate engine; HR enters the amounts.
- **EMS does not transfer money.** Payment tracking was removed in the latest release; the system records whether payroll has been approved, not whether cash moved.
- **Budget model** — recurring monthly limits count approved payroll gross and approved expenses. Over-budget changes stay pending and require Admin adjustment with a justification.
- **Transactions** guard all multi-document financial writes. The employee/month unique index prevents duplicate payslips.
- **Annual leave** defaults to 21 calendar days. Users cannot approve their own leave. HR/Admin cannot apply for leave through the system (leave tab is management-only for them).
- **Payroll schedule defaults**: prepare on the 25th, approval due by the 28th, planned payment on the last working day. All dates are configurable in Settings.

## Scope boundaries — say this proactively

- No payment gateway or bank integration.
- No automatic statutory tax rate engine or currency conversion.
- No real-time chat or email dispatch from within the app.
- The Audit history interface was removed; internal transaction records and stored history are retained in the database.
- Browser checks use deterministic fixtures, not production records.

## Likely examiner/lecturer questions

| Question | Suggested answer |
| --- | --- |
| Why validate on the backend? | Browser controls can be bypassed. The API enforces role checks and arithmetic independently of what the UI renders. |
| How are duplicate payslips prevented? | A compound unique index on (employee, month) rejects them at the database level. |
| How are concurrent budget writes handled? | A serialization field on Department is compared inside a MongoDB transaction; stale writes are rejected before the budget calculation runs. |
| How was it tested? | 30 backend unit tests, 4 frontend unit tests, a live integration suite in a disposable QA database (removed after each run), a 156-scenario responsive browser matrix and a production Vite build. |
| Who wrote the code? | Be direct: the starting code was AI-assisted, then reviewed, adapted and extended. State which sections you can explain in detail. |
| Future improvements? | Employee offboarding workflow, historical monthly budget snapshots (immutable per month), partial payment reconciliation, verified payment-provider integration, two-factor authentication. |

## File locations

| Document | Path |
| --- | --- |
| Setup guide | `README.md` (root) |
| Build conventions & history | `docs/BUILD.md` |
| Development history | `docs/progress.md` |
| Change log | `docs/CHANGELOG.md` |
| Illustrated project guide | `Project_Documentation.docx` |
