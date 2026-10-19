# EMS — presenter notes

## Purpose (30 seconds)

Our Employee Management System brings employee records, departments, attendance, leave and payroll into one workspace. It reduces duplicated records and gives each user access appropriate to their role.

## Architecture worth explaining

- React + Vite frontend, plain CSS; Express API; MongoDB through Mongoose.
- The browser calls the API; validation, salary calculations and permissions run on the server.
- JWT authentication identifies users, while the API checks their current database role. Passwords are hashed with bcrypt.
- A registered account must be linked to an employee record for personal attendance, leave and payslips.

## Suggested demo order (5–7 minutes)

1. **Admin overview:** show navigation, departments and employees. Explain the Admin, HR and Employee roles.
2. **Employee account:** demonstrate check-in/out and a leave request. Show that management actions are unavailable.
3. **HR/Admin:** review leave and open department payroll. Select a month, prepare records and edit a bonus in the collapsible form.
4. **Payroll approval:** Admin or HR can approve, including their own prepared records. Show the confirmation and budget check. Approved payslips appear for the linked employee.
5. **Settings and notifications:** show configurable payroll dates and the notification dropdown. Finish by resizing the interface to a phone width.

Use prepared demonstration data. Do not expose passwords, connection strings or real employee information.

## Important business rules

- Net pay = basic + allowances + bonuses + overtime − tax − pension − loans − other deductions.
- Monthly budgets count salary/payroll commitments and approved expenses. Excess costs stay pending for a budget decision.
- Transactions protect related financial writes; the employee/month unique index prevents duplicate payroll.
- Annual leave defaults to 21 calendar days. Users cannot approve their own leave.
- Payroll defaults: prepare on the 25th, approval due by the 28th, planned payment on the last working day. Automatic preparation must be enabled and the backend must be running.

## Be clear about scope

EMS **does not transfer money**. Admin records an external payment reference after payment is completed. Approval is not proof of payment. Tax deductions are manually entered; there is no automatic tax-rate engine. Partial external payments are not supported by the full-batch confirmation. The Audit history interface has been removed.

## Likely lecturer questions

- **Why validate on the backend?** Browser controls can be bypassed; the API enforces permissions and calculations.
- **How are duplicates/concurrent changes handled?** Unique indexes, transaction locks and version checks protect payroll operations.
- **How was it tested?** Unit tests, API integration checks in a disposable database, responsive browser checks and production builds. Check the latest verification result before quoting counts.
- **Future improvements?** Historical monthly budget allocations, employee offboarding, partial payment reconciliation and a verified payment-provider integration.

See README.md for setup. progress.md preserves development history; older entries can describe workflows that have since changed.
