# Interim report evidence: Login and Registration

A checklist for capturing the evidence for the interim report. Tick each item as you capture it.

Repository: https://github.com/akshayv132005-hub/UniEvents-

## Before you start

1. `npm install`, create `server/.env` (see `README.md`), then `npm run seed`.
2. `npm run dev`. Client: http://localhost:5173. API: http://localhost:5000.
3. Use a normal (not private) browser window at desktop width unless the item says otherwise.
4. To start logged out, click **Log out** in the header, or clear the site's storage in DevTools.

## 1. GitHub repository

- [ ] Open https://github.com/akshayv132005-hub/UniEvents- and screenshot the home page: the folder list (`client`, `server`, `docs`, `reference`), the README and the latest commit line.

## 2. Commit history

- [ ] Screenshot https://github.com/akshayv132005-hub/UniEvents-/commits/main (one commit per step, real timestamps).
- [ ] Screenshot the tag: https://github.com/akshayv132005-hub/UniEvents-/tags showing `interim-v0.1`.

## 3. Source code

Screenshot these ranges in VS Code (or on GitHub, which shows line numbers). Line numbers refer to tag `interim-v0.1`.

| # | File | Lines | What it shows |
| --- | --- | --- | --- |
| 3a | `client/src/Login.tsx` | 193-242 | Login state, validation and the submit handler calling the API |
| 3b | `client/src/Login.tsx` | 252-311 | The form: role switch, email, password show/hide, remember me |
| 3c | `client/src/Register.tsx` | 36-70 | Password rules, strength meter and form validation |
| 3d | `client/src/Register.tsx` | 109-144 | Register submit handler and server error mapping |
| 3e | `client/src/App.tsx` | 2000-2021 | Login state, redirect by role, logout, token check |
| 3f | `server/src/routes/auth.js` | 35-93 | `POST /api/auth/register` |
| 3g | `server/src/routes/auth.js` | 95-121 | `POST /api/auth/login` (password checked first, then portal and status) and `GET /me` |
| 3h | `server/src/models/User.js` | 1-35 | User model matched to the existing Atlas `users` collection |
| 3i | `server/src/utils/validation.js` | 1-44 | zod schemas (email, password rules, required fields) |
| 3j | `server/scripts/seed.js` | 1-61 | Idempotent seed (upsert by email with `$setOnInsert`) |
| 3k | `server/tests/auth.test.js` | 92-131 | Login tests (success, generic 401, pending 403, wrong portal 403) |

## 4. UI screenshots

| # | Screen | URL and steps |
| --- | --- | --- |
| 4a | Login, Student tab | http://localhost:5173/#/login |
| 4b | Login, Club Admin tab | Same page, click **Club Admin** |
| 4c | Login, Admin mode | Click **Platform admin? Sign in here** under the form |
| 4d | Login with field errors | Student tab, click **Log in** with empty fields |
| 4e | Login with a server error | Student tab, `student@unievent.lk` and a wrong password, click **Log in** ("Incorrect email or password") |
| 4f | Wrong portal | Club Admin tab, `student@unievent.lk` / `Student@123` ("This is a student account. Use the Student tab.") |
| 4g | Pending approval | Register a club admin (4j), then log in with it on the Club Admin tab ("Your account is waiting for Super Admin approval.") |
| 4h | Register, Student | http://localhost:5173/#/signup |
| 4i | Strength meter | On 4h, type a password such as `Campus2026!` so the meter and the ticks show |
| 4j | Register, Club Admin | http://localhost:5173/#/signup?role=club_admin (or the **Club Admin** tab), showing the approval note |
| 4k | Duplicate email | Register again with an email that already exists ("This email is already registered") |
| 4l | Student success screen | Submit a valid student form ("Account created") |
| 4m | Club Admin success screen | Submit a valid club admin form ("Request submitted") |
| 4n | Logged-in header | Log in as the student, then open http://localhost:5173/#/home ("Hi, Demo" and **Log out**) |
| 4o | Mobile width | DevTools, device toolbar, iPhone (375 px wide), on `#/login` and `#/signup` |

The **Demo accounts** box under the login form fills the form in one click (development only).

## 5. Database

- [ ] Open MongoDB Compass (or Atlas, Browse Collections), database `unievent_hub`, collection `users`.
- [ ] Filter: `{ email: { $in: ["student@unievent.lk", "club@unievent.lk", "admin@unievent.lk", "interim.student@sjp.ac.lk", "interim.club@sjp.ac.lk"] } }` to show the seeded and newly registered accounts. In Compass you can also set Project to `{ passwordHash: 0 }`.
- [ ] **Hide or blur the `passwordHash` field** before using the screenshot.
- [ ] Screenshot `clubs`, filter `{ name: { $in: ["Demo Society", "Interim Test Society"] } }`, to show the linked club (pending for the new organizer).
- [ ] Screenshot the `universities` collection (the dropdown source).

## 6. Test run

- [ ] Run `npm test` in a terminal and screenshot the result (`Tests 9 passed`).

## What was implemented this week (for the report)

1. Set up the GitHub repository with a `client/` (React, Vite, Tailwind) and `server/` (Express, MongoDB) structure, keeping the Figma export as a reference.
2. Built the authentication API: student and club admin registration, login with JWT, and a current-user endpoint, matched to the existing Atlas `users` and `clubs` collections.
3. Added security basics: bcrypt password hashing, zod input validation, a one-day JWT, helmet, CORS limited to the client and rate limiting on auth routes.
4. Club admin accounts are created as pending and linked to their club; they cannot log in until the Super Admin approves them.
5. Built the Login page (Student, Club Admin and Admin portals) and the Registration page with live validation, a password strength meter and clear error messages.
6. Added an idempotent demo-data seed and 9 automated API tests that run on an in-memory database.
