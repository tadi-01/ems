# Maintenance verification

Use Node.js 20 or newer. No new packages are required.

## Automated checks

1. In server, run `npm test`.
2. In client, run `npm test`, then `npm run build`.
3. Run `node --check` for server JavaScript files.

The server suite uses database stand-ins and does not connect to Atlas. The client suite uses Vite and React server rendering; it does not click through a browser. A passing build does not establish live index or deployment behavior.

## Live acceptance checklist

Use a deliberately named disposable database with an explicit name in MONGO_URI. Do not point test fixtures at the existing employee database. Set a random JWT_SECRET (at least 32 characters). Keep the default company time zone and leave policy for the first run.

1. Start backend and frontend in separate terminals. Confirm `/api/health` returns 200 only after MongoDB connects and indexes are ready. Missing database names and placeholder secrets must prevent startup.
2. Create the first Admin using the documented script. Register two ordinary accounts; confirm a supplied Admin role is ignored. Confirm duplicate mixed-case email registration is rejected and invalid credentials receive an error.
3. On Users, assign HR to one account. Employee and HR direct attempts to change roles must receive 403. Self-role changes must fail. An already-issued token must obey a changed database role on the next API call.
4. Create a department using a manager selected by name. Create employee records linked to the test accounts, including the administrator if they need personal features. Counts must update without manual entry. Edit employee email and confirm their attendance/leave/payslips still use the original link. Trying to link the same account twice must fail.
5. Test department editing/cancellation, literal employee searches containing punctuation, and failed delete messages. Departments with employees and employees with history must not be deleted. Employee accounts must not see editing controls.
6. Check in twice and confirm the compound index rejects duplicates. Check out and verify hours. Check dates around 22:00 UTC (midnight Harare), a month boundary and a year boundary.
7. Submit annual leave, cancel pending leave, and review another person's request. Self-approval and self-rejection must fail. Race a review against cancellation; only one may succeed. Test overlap rejection and balance exhaustion. Concurrent requests for different leave records require a real database concurrency check; the stand-in tests do not certify cross-request balance serialization.
8. In a separate test run set LEAVE_DAY_MODE=working and configure a holiday. Confirm weekends/that holiday are excluded for new requests and a range with no working days is rejected. Reset to calendar mode afterwards; old stored day totals must remain unchanged.
9. Create, edit, view and print a payslip. Verify net calculation, manual tax/deductions, metadata, and updatedBy/updatedAt after an edit. Confirm the employee/month unique index rejects duplicates. Admin and HR must be able to open My payslips without managing them from that view.
10. Check dashboard totals against the fixture records. Test laptop and narrow mobile layouts, visible field labels, and print preview with no sidebar/topbar/buttons.
11. Test an expired token, cleared/malformed local storage, API failure, and role changes while signed in. Protected API 401 responses must return to login; temporary database failures must not erase the login.
12. Follow README deployment steps separately and verify actual provider options, CORS, HTTPS and page refresh routing. No deployment was performed during maintenance.

## Policy and data notes

The defaults remain 21 calendar leave days and manual payroll tax/deductions. No automated absence deduction or tax percentage is assumed. Public holidays are configured by the project owner. Change annual allowance at a year boundary; stored leave day totals are historical values. Employee account references are added on first personal use for legacy email matches or selected explicitly by Admin/HR. No bulk migration or removal of the accidental database is part of this work.
