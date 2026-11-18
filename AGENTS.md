# UniEvent Hub

University event ticketing platform (Group 2, CCS|CSE 2994, USJ). This phase covers **only Login, Registration and the auth API**. The other screens in `client/src/App.tsx` are Figma mock screens with hard-coded data.

## Layout

- `client/` React 19 + Vite 8 + Tailwind v4 + TypeScript. `src/App.tsx` is the single main app file (hash routing via `navigate(route)`); `src/Login.tsx`, `src/Register.tsx`, `src/api.ts` hold the auth UI. Colour tokens live in `src/index.css`.
- `server/` Express + Mongoose API, plain JavaScript (ESM). Tests use Vitest + Supertest + mongodb-memory-server (never Atlas).
- `reference/figma-export/` read-only copy of the original Figma Make files. Do not edit.
- `.figma/` Figma Make metadata. Leave untouched.
- `docs/` project docs, including `INTERIM_EVIDENCE.md`.

## Running

Nothing is started for you. `npm install` at the root, create `server/.env` from `server/.env.example`, then `npm run dev` (client on http://localhost:5173, API on http://localhost:5000; Vite proxies `/api`).

## Rules

- Keep it simple: no React Router, no state library, no new component folders.
- Never commit `.env`, secrets or `node_modules`. Never write to Atlas from tests.
- Small commits, real timestamps, no force-push.
