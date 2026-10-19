# Final progress

Date: 18 October 2026

## Status

The local Carbon-inspired interface pass is complete. Existing in-progress changes were reviewed and extended before new work. Frontend and backend are running separately at http://127.0.0.1:5173 and http://localhost:5000. No production deployment, bulk migration, administrator reset or change to the existing employee database name was performed.

## Completed work

- Applied the uploaded Carbon reference using plain CSS: dark application header, blue actions, neutral layers, square controls, clear headings and aligned forms/tables.
- Improved Overview hierarchy, department summaries, role-specific task links, loading feedback and retry behavior.
- Checked Employees, Departments, Attendance, Leave, Payroll, Users, Login and Register. Added clearer empty/loading/error states, save feedback and duplicate-submit guards where needed; failed forms retain input.
- Added compact mobile navigation with keyboard focus handling and Escape. Forms stack, tables scroll within their regions, long content stays contained and status remains readable without color alone.
- Refined personal payroll selection, print exclusions, visible focus and reduced-motion behavior.
- Corrected local CORS for the 127.0.0.1 frontend origin.
- Preserved permissions, account links, 21 calendar leave days by default, configurable leave policy and manual payroll tax/deductions.
- Kept the React/Express/Mongoose structure and existing application dependencies. Both package.json dependency sections match their lockfiles.
- Consolidated setup, configuration, deployment settings and API routes into one README.md. Replaced the historical progress log with this final record and added Project_Documentation.docx.
- Removed superseded EMS_AI_PROMPTS.md, docs/VERIFICATION.md and the accidental tatus command-output file. QA artifacts are ignored by Git.

## Verification evidence

| Check | Result | Scope |
|---|---|---|
| Backend unit tests | 28 passed | Authorization, account links, date/policy rules, leave transitions, payroll and deletion guards |
| Frontend tests | 4 passed | Role-specific controls and invalid/expired session handling |
| Production build | Passed | Vite React bundle |
| Live API integration | 32 passed | Real HTTP requests and MongoDB indexes in an isolated QA database |
| Browser matrix | 150 passed | Admin, HR and Employee; all applicable routes at 320, 390, 768, 1024, 1280 and 1440 pixels |
| Final focused checks | 16 responsive checks passed | Login, Register, Leave and Payroll after the final mobile refinements; leave feedback and real local CORS also passed |
| Interaction checks | Passed | Menu navigation/Escape, Overview retry, edit/cancel, failed-input preservation, payroll view, print exclusions and reduced motion |
| Screenshot review | Completed | Representative desktop and phone screens, payslip print layout |
| Documentation | Completed | Five-page Word document rendered and visually inspected |

The browser matrix found no document-level overflow or uncaught browser errors. It uses deterministic API fixtures, not production records. The live API script created a unique ems_qa database on the configured MongoDB host, verified its generated name before cleanup, and removed it successfully. Existing employee data was not used for test writes.

## Verification limits

This run is a local acceptance pass, not a claim that every possible scenario is covered. Production Render/Vercel deployment, high-load behavior, concurrent approvals across different leave records, and every browser or assistive-technology combination are not certified. Conditional review/cancellation of the same request is covered by unit tests; cross-record balance serialization needs a separate concurrency assessment before relying on it at scale.

Tax and deductions remain HR-entered amounts. Payslip audit fields show the latest edit rather than a complete revision history. Database backup and hosting availability remain operational responsibilities.

## Handoff

Follow README.md for setup and repeatable verification. Project_Documentation.docx explains architecture, access, data relationships and workflows. Commit and push after reviewing the working tree, then deploy through the existing hosting configuration. Recheck health, login, registration, employee linking and nested-route refresh on the deployed version.

## Account screen refinement on 19 October 2026

Adapted the new `test design` registration reference to the shared login and registration layout: compact header, pale-blue story panel, decorative layered artwork, account-switch links and a focused form column. Mobile layouts hide the artwork and stack the content. Existing authentication services, six-character registration minimum, roles and backend behavior are unchanged; no packages were added.

Validation: production build and whitespace checks passed. Ten browser layout checks passed across both routes at 320, 390, 768, 1024 and 1440 pixels with no page overflow or uncaught errors. Verified account links and preserved input after a failed registration response, and visually reviewed desktop and phone screenshots.

## Approved workflow and navigation completion — 19 October 2026

This section supersedes the earlier payroll/audit limitations above. Step 2 was authorized with Admin responsible for financial decisions, monthly department budgets, and no bank/mobile-money/payment execution. Existing stack, styles, roles and pages were retained. Existing authentication-screen changes were preserved.

### Delivered behavior

- Shared role-aware navigation, desktop collapse, mobile drawer, route-based active state, account dropdown, notifications, 403/404 screens and return to the previous route after session expiry. Server authorization remains independent of navigation visibility.
- Recurring monthly department limits include salary commitments, approved payroll gross and approved expenses. Over-budget hires, salary increases and expenses stay pending. Admin can adjust/reallocate with a justification. Usage warnings identify 80% and 90% thresholds; existing salaries remain visible and flagged.
- Payroll is prepared pending approval, reviewed and approved by a different Admin with explicit re-confirmation and a fresh budget check. HR can prepare; existing Admin preparation access remains, but self-approval is prohibited. Scheduled drafts require review. Approved and historical records are protected; voiding preserves history.
- Net salary includes basic salary, allowances, bonuses and overtime less manually entered PAYE, pension/NSSA, loans and other deductions. Itemised payslips can be viewed, printed or downloaded as HTML. Approval is not a payment confirmation.
- Admin Settings defaults to preparation on the 25th, approval by the 28th and a planned payment date on the last working day. Dates, holidays and automatic preparation are configurable. Short-month/holiday calendars bring deadlines forward when needed. Payment dates generate reminders only.
- Sensitive payroll, budget and role changes record actor, time, before/after values and decision details. Admin can inspect paginated audit history in Users & roles.

### Per-file change record

Paths are relative to the repository root. No dependency manifests or lockfiles changed.

| File | Change |
| --- | --- |
| `client/src/App.jsx` | Shared protected route tree, role guards, Settings and error routes. |
| `client/src/components/Layout.jsx` | Role-generated sidebar, desktop collapse and accessible mobile drawer. |
| `client/src/components/AccountMenu.jsx` | Profile/logout menu and recipient-scoped notification controls. |
| `client/src/components/ProtectedRoute.jsx` | Session validation, expiry handling, retry and preserved return destination. |
| `client/src/components/RoleRoute.jsx` | Role restriction inside the shared layout. |
| `client/src/services/navigation.js` | Shared route metadata and allowed roles. |
| `client/src/services/api.js` | Dispatch session-expiry handling on unauthorized API responses. |
| `client/src/pages/Login.jsx` | Return to the requested local route after login; preserve existing auth refinements. |
| `client/src/pages/RouteError.jsx` | Actionable forbidden and missing-page screens. |
| `client/src/index.css` | Shell controls, responsive menus, focus and workflow form styles using existing tokens. |
| `client/src/pages/Settings.jsx` | Admin schedule, holiday and automatic-preparation controls. |
| `client/src/components/PayrollSchedule.jsx` | Schedule dates and preparation state beside payroll. |
| `client/src/components/DecisionForm.jsx` | Justified approval/rejection with explicit confirmation. |
| `client/src/pages/Payroll.jsx` | Preparation, review, approval and void workflows. |
| `client/src/components/PayrollForm.jsx` | Overtime, pension, loan deductions and preparation labels. |
| `client/src/components/PayrollTable.jsx` | Workflow status, review actions and immutable-record restrictions. |
| `client/src/components/Payslip.jsx` | Snapshot identity, itemised amounts, approval status and download action. |
| `client/src/services/downloadPayslip.js` | Escaped standalone HTML payslip download. |
| `client/src/components/BudgetPanel.jsx` | Monthly commitments, thresholds, expenses and request reviews. |
| `client/src/components/BudgetAdjustment.jsx` | Justified Admin budget adjustments and reallocation. |
| `client/src/pages/Departments.jsx` | Embed budgets and prevent bypass through ordinary department editing. |
| `client/src/pages/Employees.jsx` | Explain pending employee changes without claiming they were applied. |
| `client/src/pages/Dashboard.jsx` | Describe payroll totals as recorded net amounts rather than payments. |
| `client/src/components/AuditHistory.jsx` | Expandable paginated sensitive-action history. |
| `client/src/pages/Users.jsx` | Expose audit history to Admin. |
| `server/server.js` | Mount workflow routes and start scheduler after database initialization. |
| `server/models/Department.js` | Monthly budget metadata and concurrent-write serialization field. |
| `server/models/Payroll.js` | Workflow status/revision, snapshots, itemised deductions and review metadata. |
| `server/models/AuditEvent.js` | Sensitive-action audit records. |
| `server/models/BudgetRequest.js` | Pending/approved/rejected expenses and employee proposals. |
| `server/models/Notification.js` | Per-user notifications and read state. |
| `server/models/Settings.js` | Company payroll schedule and explicit automatic-preparation switch. |
| `server/models/WorkflowRun.js` | Monthly reminder deduplication. |
| `server/utils/transaction.js` | Shared MongoDB transaction wrapper. |
| `server/utils/workflowEvents.js` | Transactional auditing and Admin/HR/manager notification helpers. |
| `server/utils/budgetHelpers.js` | Serialized monthly commitment calculation and threshold detection. |
| `server/utils/employeeBudget.js` | Budget-aware hires and salary changes with pending proposals. |
| `server/utils/payrollHelpers.js` | Validated itemised payroll arithmetic. |
| `server/utils/payrollSchedule.js` | Configurable preparation, approval and working-day dates. |
| `server/utils/payrollScheduler.js` | Idempotent current-month draft preparation requiring review. |
| `server/utils/payrollReminders.js` | Once-per-month approval and planned-payment reminders. |
| `server/controllers/budgetController.js` | Expense requests, locked approvals, adjustments and reallocation. |
| `server/controllers/payrollApprovalController.js` | Admin re-confirmation, revision checks, self-approval protection and budget validation. |
| `server/controllers/payrollController.js` | Pending preparation, revision, voiding, historical protection and personal visibility. |
| `server/controllers/employeeController.js` | Budget-aware writes, directory-only Employee projection and audited deletion guards. |
| `server/controllers/departmentController.js` | Budget-edit restrictions, justified initial budgets and audited deletion guards. |
| `server/controllers/userController.js` | Transactional role-change auditing with existing safeguards. |
| `server/controllers/dashboardController.js` | Exclude rejected/voided payroll from totals. |
| `server/routes/budgetRoutes.js` | Admin/HR reads and requests; Admin-only financial decisions. |
| `server/routes/settingsRoutes.js` | Validated, justified Admin schedule configuration. |
| `server/routes/workflowRoutes.js` | Own notifications and Admin audit pagination. |
| `server/routes/payrollRoutes.js` | Schedule visibility and Admin-only approval route. |
| `server/tests/access.test.js` | Retain authorization tests with transaction/audit fixtures. |
| `server/tests/payroll.test.js` | Itemised arithmetic, schedule and approved/personal visibility tests. |
| `client/tests/access.test.js` | Updated shared-route and authentication checks. |
| `server/scripts/verifyIntegration.js` | Integrate workflow acceptance checks in disposable QA database. |
| `server/scripts/verifyWorkflow.js` | Live budget concurrency, approvals, historical records, scheduler, notifications and audit checks. |
| `client/scripts/browserFixtures.cjs` | Deterministic workflow/settings fixtures. |
| `client/scripts/verifyBrowser.cjs` | Include Settings and updated preparation controls in responsive matrix. |
| `README.md` | Current setup, replica-set requirement, permissions and payroll/budget operating instructions. |
| `progress.md` | This completion and per-file record. |

`AuthLayout.jsx` and `Register.jsx` already had account-screen edits before this workflow pass; those were retained. No new Finance role or payment integration was introduced.

### Validation and operational handoff

- Backend unit tests: 28 passed. Frontend unit tests: 4 passed. Production build passed.
- Live API integration: 76 checks passed, including competing expense requests, budget holds, reallocation, approval restrictions, historical payroll protection, scheduling, notification ownership and audit. The uniquely named disposable QA database was removed successfully.
- Browser matrix: 156 checks passed across Admin, HR and Employee at 320, 390, 768, 1024, 1280 and 1440 pixels, with no document overflow or uncaught errors. Focused checks covered SPA navigation, refreshed active state, collapse, 403/404, session return, mobile Escape/scroll lock and payslip download. Browser checks use deterministic API fixtures.
- Representative desktop and mobile screenshots were reviewed. These are local checks, not production deployment or exhaustive browser/accessibility certification.

Use an Atlas deployment or MongoDB replica set: financial writes use transactions. Admin must explicitly enable automatic preparation in Settings. Keep the backend running for scheduled work; missed earlier months need manual preparation. Configure holidays and company timezone. Deductions remain HR-entered amounts; no statutory rate tables, currency conversion or payment transfer is supplied. Department budgets are recurring monthly limits rather than immutable historical monthly allocations. Existing salaries are flagged for Admin attention when over budget.

Changes remain local and uncommitted. README.md is the current operating guide; Project_Documentation.docx remains the earlier 18 October architecture snapshot and was not regenerated in this workflow pass.
