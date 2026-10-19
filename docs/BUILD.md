# BUILD.md — Conventions, Architecture Decisions and Change History

This file replaces `progress.md` as the living record of how this project is built,
what conventions are enforced, and what changed in each development pass.
`docs/progress.md` is retained as an archived development diary.

---

## Conventions

### Stack rules (do not change without a recorded decision below)

| Rule | Rationale |
| --- | --- |
| JavaScript + JSX only, no TypeScript | Keeps the barrier to entry low; types can be added later without rewriting logic |
| Plain CSS (`index.css`), no Tailwind or CSS-in-JS | Single file is easy to search; no build-tool coupling |
| No Redux, no Zustand | State is local or prop-drilled; server is the authority |
| No component library (MUI, Chakra, etc.) | Carbon icons are the only third-party UI package |
| Async/await throughout, no `.then()` chains in component logic | Consistent error handling with try/catch |
| Components: ~150 lines where practical | Encourages single responsibility |

### Code style

- **Comments explain why, not what.** Obvious statements ("sets the state") are omitted.
- **Reuse before creating.** Check `client/src/services/` and `server/utils/` before writing new helpers.
- **Route guards on the server.** Never rely on UI visibility for authorization.
- **No credential exposure.** Email addresses in selection dropdowns are replaced with full name only.

### Naming

| Artifact | Convention |
| --- | --- |
| React pages | PascalCase, in `client/src/pages/` |
| React components | PascalCase, in `client/src/components/` |
| Client services | camelCase, in `client/src/services/` |
| API routes | kebab-case URL segments, e.g. `/api/payroll/departments` |
| Controllers | camelCase functions, one file per domain |
| Mongoose models | PascalCase, match collection name singular |
| Environment variables | UPPER_SNAKE_CASE in `.env`; documented in `.env.example` |

### Environment files

- `.env` files are git-ignored. Never commit credentials.
- `.env.example` is committed and kept accurate — both local origins (`localhost:5173`
  and `127.0.0.1:5173`) are documented for the `CLIENT_URL` note.
- Backend variables are validated at startup by `server/utils/runtimeSettings.js`.

### Security baseline

| Measure | Where |
| --- | --- |
| Login rate limit: 10 req / 15 min / IP | `server/routes/authRoutes.js` |
| CORS origin allowlist (callback) | `server/server.js` |
| `X-Powered-By` header removed | `server/server.js` |
| `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options` | `server/server.js` |
| 100 KB JSON body limit | `server/server.js` |
| Bearer token strict parsing | `server/middleware/authMiddleware.js` |
| Passwords hashed with bcrypt | `server/controllers/authController.js` |
| JWT expiry enforced; role re-read from DB on every request | `server/middleware/authMiddleware.js` |

### Testing

Run the full suite before every commit to `main`:

```powershell
cd server && npm test                   # 30 unit tests
node scripts/verifyIntegration.js       # live HTTP + MongoDB (creates/removes QA DB)
cd ../client && npm test                # 4 unit tests
npm run build                           # production bundle
```

Browser matrix (optional, requires Playwright + Chrome):

```powershell
node client/scripts/verifyBrowser.cjs
```

### Branch workflow

| Branch | Purpose |
| --- | --- |
| `main` | Production-ready code. Merge only after tests pass. |
| `sandbox` | Integration of improvements and experiments before merging to main |
| Feature branches | Short-lived, named `feature/<short-description>` |

Use `git revert <commit>` to undo a merged change rather than rewriting history.

---

## Change log

### sandbox branch — 19 October 2026

#### Security: login rate limiting

Added `express-rate-limit` (4 packages, no breaking changes). The `/api/auth/login`
endpoint is now capped at **10 requests per IP per 15 minutes**. RFC-standard
`RateLimit-*` headers are emitted. The limit is per-IP and applies to production
(Render) traffic; local development is unaffected in practice.

Files changed: `server/routes/authRoutes.js`, `server/package.json`,
`server/package-lock.json`.

#### Documentation: stale `.env.example` CORS comment

The comment on `CLIENT_URL` previously listed only `http://localhost:5173` as the
allowed local origin. The server also allows `http://127.0.0.1:5173` (documented in
`server/server.js`). The comment now mentions both.

Files changed: `server/.env.example`.

#### Removed: unused payment endpoint

`PUT /api/payroll/departments/:department/payment` (record external payment) was
documented in the README and implemented in
`server/controllers/payrollPaymentController.js`, but the "Record completed external
payment" UI form was removed from `client/src/components/DepartmentPayroll.jsx` in the
previous CHANGELOG entry. Confirmed: no client code calls this endpoint. Removed the
route and its import. The controller file itself is retained so that `git revert` of
this commit restores the full feature in one step.

Files changed: `server/routes/payrollRoutes.js`.

#### Feature: Clear all notifications

Added a **Clear all** button in the notifications panel that permanently deletes all
notifications for the signed-in user (distinct from *Mark all read*, which only sets
`readAt`). Added the corresponding `DELETE /api/workflow/notifications` endpoint.

The `notification-heading-actions` CSS wrapper allows *Mark all read* and *Clear all*
to sit side-by-side with a consistent gap.

Files changed: `server/routes/workflowRoutes.js`,
`client/src/components/AccountMenu.jsx`, `client/src/index.css`.

#### UX: hide email addresses in selection dropdowns

Employee email addresses were visible in:
- The **Linked account** dropdown in `EmployeeForm.jsx` (employee edit form)
- The **Manager** dropdown in `Departments.jsx`

Linking is still performed by email internally (the server matches on email when no
explicit link is set). Only the display label was changed: options now show full name
only.

Files changed: `client/src/components/EmployeeForm.jsx`,
`client/src/pages/Departments.jsx`.

#### Documentation: restructured markdown files

All non-README markdown files moved to `docs/`:

| Old path | New path |
| --- | --- |
| `progress.md` | `docs/progress.md` |
| `CHANGELOG.md` | `docs/CHANGELOG.md` |
| `PRESENTER_NOTES.md` | `docs/PRESENTER_NOTES.md` |

New files created:
- `docs/BUILD.md` (this file) — replaces `progress.md` as the living conventions and
  change record.
- `README.md` — rewritten with Portal-style structure: built-with table, step-by-step
  run guide, first-use checklist, permissions table, payroll workflow, deployment
  table and further-reading index.

`docs/PRESENTER_NOTES.md` was expanded with a detailed role explanation, step-by-step
demo script (7–10 min), explicit scope boundaries and a Q&A table for likely
examiner questions.

`docs/progress.md` is kept intact as the archived development diary. Its stale "local
and uncommitted" lines are historical; all work is committed and pushed.

#### Automated offboarding workflow design

The following section documents a proposed automated offboarding workflow using EMS
as the system of record (see context prompt at the bottom of this file). This is not
yet implemented; it is recorded here as a feature design for a future sprint.

---

## Proposed: Automated Employee Offboarding Workflow

*Context: replace scattered email threads and manual checklists with a
cross-departmental workflow triggered the moment an employee submits a formal
resignation via the system. Assumes a standard two-week (14-day) notice period.*

### Phase 1 — Day 0: Immediate Triage

**Trigger:** Employee submits a resignation record through EMS.

**System actions (immediate):**

1. EMS creates an `OffboardingCase` record linked to the employee, with status `Pending
   verification`.
2. A notification is pushed to the employee's direct manager and to all HR users:
   *"[Name] has submitted a resignation effective [date]. Please verify within 24 hours."*
3. The resignation and last working day are recorded but no downstream systems are
   contacted yet.

**24–48 hour pause (manager verification buffer):**

4. A scheduler job checks after 24 hours. If the manager has not marked the case
   `Verified`, a follow-up reminder notification fires.
5. If not verified within 48 hours, an escalation notification is sent to Admin.
6. Once the manager marks the case `Verified`, Phase 2 triggers begin.

**Rationale:** The buffer prevents a mistaken or draft resignation from
automatically locking accounts before a human confirms the departure.

---

### Phase 2 — Days 1–13: Cross-Department Coordination

**Trigger:** Manager verifies the resignation (marks case `Active`).

**Automated triggers within 24 hours of verification:**

| Department | Action |
| --- | --- |
| **IT** | Create a hardware-return ticket (laptop, access card, phone). Create a software licence revocation checklist (SaaS tools, VPN, dev environments). |
| **Payroll/HR** | Pre-calculate the final payslip: remaining salary for worked days, unused leave payout (based on current leave balance × daily rate), any outstanding loan deductions. Mark as `Pending final approval`. |
| **HR** | Auto-schedule the exit interview for a date between Day 7 and Day 10. Send a calendar invite to the employee and the HR contact. |
| **Employee** | Deploy a personal offboarding task checklist: complete knowledge transfer doc, handover open projects, return company assets by Day 13. |
| **Manager** | Deploy a manager offboarding task checklist: reassign open tasks, update org chart in EMS, confirm no pending budget requests tied to the employee. |

**Days 1–13 monitoring:**

- The scheduler sends daily digest notifications to the case owner (HR) listing
  incomplete tasks.
- Completed checklist items are acknowledged in EMS and logged in the
  `OffboardingCase` audit trail.

---

### Phase 3 — Day 14: Execution and Revocation (End of Day)

**Trigger:** Scheduled job runs at 17:00 (company timezone) on the last working day.

**Automated actions (in order):**

1. **SSO / Identity provider** — Disable the user account via API (e.g. Google
   Workspace, Azure AD, Okta). All SSO-dependent services lose access immediately.
2. **Email forwarding** — Set up an email forward from the departing employee's
   address to the line manager for 30 days, then auto-expire.
3. **Cloud drive ownership transfer** — Transfer Google Drive / OneDrive file
   ownership to the manager for department files; move personal files to a
   temporary archive folder accessible only to HR.
4. **Physical badge** — Send an automated deactivation request to the access-control
   system. Log the deactivation timestamp in the `OffboardingCase`.
5. **EMS account status** — Set the user account to `Inactive` in MongoDB. The
   account cannot log in, but all historical records (payslips, leave, attendance)
   are preserved.
6. **Notification to HR** — *"End-of-day revocations completed for [Name]. Please
   confirm badge return and equipment collection."*

---

### Phase 4 — Day 15+: Post-Departure Finalization

**Day 15 (next business day):**

1. **Payroll finalization** — HR reviews and approves the pre-calculated final
   payslip. Standard payroll approval flow applies. The approved payslip is the
   basis for the final bank transfer.
2. **Benefits termination notices** — Automated letter generated and sent (or queued
   for HR to send) to:
   - Medical aid / health insurance provider (termination of cover effective Day 14).
   - Pension/NSSA administrator (cessation of contributions, payout options).
   - COBRA equivalent (if jurisdiction requires a continuation-of-coverage notice).
3. **Software licence release** — Mark all SaaS seats previously assigned to the
   employee as `Available`. Update billing quantities where the provider supports
   API-based seat management.

**Day 30:**

4. **System record archival** — The `User` document is flagged `Archived`. The
   linked `Employee` record is marked `Departed` with a departure date. Both records
   move to a read-only cold-storage collection. The active-employee count used for
   licence calculations is decremented.
5. **Email forward expiry** — The 30-day email forward is removed.
6. **Audit close** — The `OffboardingCase` is marked `Closed` with a summary of all
   completed and manually overridden steps. The case is retained indefinitely for
   compliance.

---

*End of offboarding workflow design.*

---

## Retained for reference

Older development history is in `docs/progress.md`.
