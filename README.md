# UniEvent Hub

University event ticketing platform for Sri Lankan universities. Group 2, CCS|CSE 2994 Group Project, University of Sri Jayewardenepura.

**Current phase (interim):** Login, Registration and the auth API. The other screens (events, booking, dashboards) are still the Figma mock screens with hard-coded data.

## Stack

- `client/`: React 19, Vite 8, Tailwind CSS v4, TypeScript. `src/App.tsx` (hash routing), `src/Login.tsx`, `src/Register.tsx`, `src/api.ts`.
- `server/`: Express, Mongoose (MongoDB Atlas `unievent_hub`), JWT, bcrypt, zod, helmet, CORS, rate limiting.
- Tests: Vitest + Supertest + mongodb-memory-server (the tests never touch Atlas).

## How to run

Requires Node.js 22+.

```bash
npm install
cp server/.env.example server/.env   # then fill in MONGODB_URI and JWT_SECRET
npm run seed                         # adds the 3 demo accounts (safe to re-run)
npm run dev                          # client http://localhost:5173, API http://localhost:5000
npm test                             # server tests
```

`server/.env`:

| Key | Example |
| --- | --- |
| `MONGODB_URI` | `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/unievent_hub` |
| `JWT_SECRET` | any long random string |
| `CLIENT_URL` | `http://localhost:5173` |
| `PORT` | `5000` |

## Demo accounts

| Role | Email | Password | Sign in from |
| --- | --- | --- | --- |
| Student | `student@unievent.lk` | `Student@123` | Student tab |
| Club Admin (approved) | `club@unievent.lk` | `Club@1234` | Club Admin tab |
| Super Admin | `admin@unievent.lk` | `Admin@1234` | "Platform admin? Sign in here" |

## API

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/api/health` | `{ ok: true }` |
| GET | `/api/universities` | universities for the registration dropdown |
| POST | `/api/auth/register` | `role: student` (active) or `club_admin` (pending, club linked in `clubs`) |
| POST | `/api/auth/login` | `{ email, password, role }` returns `{ token, user }` |
| GET | `/api/auth/me` | current user from `Authorization: Bearer <jwt>` |

Roles and statuses follow the existing database: `student`, `club_admin`, `super_admin` and `approvalStatus` `pending`, `approved` (plus `rejected`, `suspended`). Errors are `{ message, code, details }`.

## Repository layout

`client/`, `server/`, `reference/figma-export/` (read-only copy of the original Figma Make files), `docs/` (`INTERIM_EVIDENCE.md`), `.figma/` (Figma Make metadata).
