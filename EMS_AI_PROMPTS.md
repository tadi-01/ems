# Employee Management System: AI Prompt Kit

Keep this file in the repo (for example in a `docs/` folder). It has two prompts:

1. **Main prompt**: paste this into the AI at the start of the project.
2. **Resume prompt**: paste this into a new AI when the current one runs out of credits.

Rules for the group:
- Keep `PROGRESS.md` in the project root and commit it to GitHub after every phase.
- Only one person edits `PROGRESS.md` at a time, to avoid merge conflicts.
- When resuming, attach `PROGRESS.md` plus the real code files for the phase you are working on.

---

## 1. Main Prompt

```
I am a second-year undergraduate Computer Science student, working in a group, and we have been tasked with building an Employee Management System for our Web Development course. We must present it to our lecturer and explain every part ourselves. Write code at the level a capable undergraduate could have written and can confidently defend: clean, correct, simple and beginner-friendly. Avoid clever tricks, advanced patterns and "enterprise" over-engineering.

STACK (do not change or add anything):
- Frontend: React (Vite), React Router, Axios, plain CSS (no Tailwind, no UI libraries)
- Backend: Node.js + Express
- Database: MongoDB with Mongoose
- Auth: JWT + bcrypt
- Deployment: Vercel (frontend), Render (backend), MongoDB Atlas

FOLDER STRUCTURE:
employee-management/
  client/ (src/components, pages, services, App.jsx, main.jsx)
  server/ (routes, controllers, models, middleware, utils, server.js)
  PROGRESS.md
  README.md

FEATURES:
1. Auth with 3 roles (Admin, HR, Employee): register, login, protected routes
2. Employee CRUD (ID, name, department, designation, email, phone, joining date, salary) with search
3. Department CRUD (name, manager, budget, employee count)
4. Attendance: check-in/check-out, working hours, block duplicate entries per day
5. Leave: apply/cancel/history (employee); approve/reject + balances (HR/Admin)
6. Payroll: basic + allowances + bonuses - deductions - tax = net salary; printable payslip
7. Dashboard: total employees, present today, on leave, monthly payroll, count per department
8. Responsive design (mobile-friendly)

RULES:
- Use simple async/await, no advanced patterns, no TypeScript, no Redux
- Comment every function in simple English ("what it does and why")
- Use clear names (getAllEmployees, not fetchData)
- Keep each file under ~150 lines
- Never hardcode secrets; use a .env file and explain each variable
- Use Mongoose models with references (ObjectId + populate). Avoid complex aggregation pipelines; explain any you use step by step.
- Block duplicate attendance with a unique compound index on employee + date, and explain how it works.

DESIGN (important):
- Clean, professional look, like real business software (think a simple HR tool or admin dashboard). Not a flashy "AI-generated" style.
- NO emojis anywhere: not in the UI, buttons, headings, comments, console logs, or README.
- NO neon colors, glows, gradients, glassmorphism, heavy shadows, or animated effects.
- Color palette: white and light grey backgrounds, one primary color (a muted navy or blue), plus a dark grey for text. Use green/red/amber only for status labels (approved, rejected, pending).
- One system font stack (e.g. Arial, Helvetica, sans-serif). No decorative fonts.
- Layout: a fixed left sidebar with navigation, a top bar showing the logged-in user and role, and a content area. Use plain tables for lists and simple cards for dashboard totals.
- Spacing: consistent padding (8px, 16px, 24px), small border radius (4px), thin 1px grey borders.
- Forms: labels above inputs, clear validation messages, simple buttons (solid primary, outlined secondary).
- Use icons sparingly or not at all. If needed, plain text labels are fine.
- Define colors and spacing once as CSS variables in a single global stylesheet, and reuse them so the CSS is easy to explain.

HOW TO WORK:
Build in phases and STOP after each one so I can test it:
Phase 1: project setup + folder structure + DB connection
Phase 2: auth (models, routes, JWT middleware, login/register pages)
Phase 3: employees and departments
Phase 4: attendance
Phase 5: leave
Phase 6: payroll
Phase 7: dashboard and responsive CSS
Phase 8: deployment + README

After each phase, give me:
- the complete code for every file, with file paths
- a "How it works" explanation I can say out loud in 5 sentences
- 3 questions a lecturer might ask, with answers
- how to test it (steps or Postman requests)
- the full updated PROGRESS.md (see below)

If I say "explain this like I'm a beginner," break the code down line by line.

PROGRESS FILE (mandatory):
Maintain a file at the project root called PROGRESS.md. After EVERY phase, and after any fix or change, output the full updated PROGRESS.md so I can paste it into the project. It must let a different AI model, with no memory of this chat, continue the project without asking me questions.

PROGRESS.md must contain these sections:

1. Project summary: what we are building, the course, and that we must explain every part to our lecturer.
2. Locked decisions: the full stack, folder structure, DESIGN rules (no emojis, no neon, plain professional UI), and coding RULES, copied exactly from my original instructions.
3. Phase status table: Phase number, name, status (Not started / In progress / Complete / Tested), owner (group member).
4. Per phase, once done:
   - Files created or changed (with paths) and a one-line purpose for each
   - API routes (method, path, who can access, request body, response)
   - Database models and fields, including references between them
   - Environment variables used (names only, never real values)
   - How to test it, and whether the test passed
   - "How it works" (the 5-sentence spoken explanation)
   - Likely lecturer questions with answers
5. Known issues and bugs: what is broken, and the suggested fix.
6. Naming conventions and patterns used (so new code matches the old code).
7. Next step: exactly what the next phase must build and which existing files it depends on.

Keep it factual and compact. Do not paste full source code into PROGRESS.md, only file paths and descriptions.

Start with Phase 1 only.
```

---

## 2. Resume Prompt (new AI or new group member)

Paste this first, then attach `PROGRESS.md` and the code files for the phase you are working on.

```
I am a second-year undergraduate Computer Science student in a group building an Employee Management System for our Web Development course. We have been working with another AI model, which has run out of credits. You are taking over.

The attached PROGRESS.md is the single source of truth. Before writing anything:
1. Read it fully.
2. Summarize in 5 lines: what is built, what is tested, what is next.
3. List anything unclear or missing, and ask me about it. Do not guess.

Then follow every locked decision, RULE and DESIGN rule in PROGRESS.md exactly. Do not change the stack, folder structure, naming style or visual design. Match the existing code style. If you think something should change, tell me first and wait.

Continue from "Next step" in PROGRESS.md. Build only that phase, then stop. At the end, give me the complete updated PROGRESS.md.
```

---

## 3. Handover check (run before switching AI)

Ask the current AI:

```
Reread PROGRESS.md. Tell me what a new developer would still be confused about, then give me a corrected version of PROGRESS.md.
```

## 4. If the new AI drifts

- Style drifted (emojis, flashy colors): "Re-read the DESIGN section in PROGRESS.md and fix this."
- Code too complex: "Rewrite this at a beginner level. Follow the RULES section in PROGRESS.md."
- Files not matching: "Compare against the Naming conventions section in PROGRESS.md and make them consistent."
