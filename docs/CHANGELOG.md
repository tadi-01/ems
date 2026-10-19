# Change log

## 2026-10-19 — Remove external payment recording section

- Removed the “Record completed external payment” form from department payroll.
- Removed its unused payment handler and local reference/confirmation state.
- Preserved payroll preparation, approval, viewing, and editing behavior.

### Reversibility

Revert the commit containing this entry to restore the section; no backend or data changes were made.

## 2026-10-19 — Carbon icon refresh

- Added `@carbon/icons-react` and `@carbon/styles` to the client dependencies.
- Replaced text glyphs in the application shell with Carbon icons for menu controls and sidebar collapse/expand actions.
- Replaced notification, profile, logout, checklist, action-arrow, and authentication-navigation glyphs with Carbon icons.
- Added small icon alignment and motion refinements for clearer interactive affordances without changing routes or business behavior.
- Kept the existing responsive layout, keyboard behavior, and accessible labels intact.

### Reversibility

This change is isolated to the client dependency manifests, shared shell/auth/action components, global styles, and this document. Revert the corresponding commit to restore the previous UI and remove the Carbon packages; no data migrations or backend changes are included.
