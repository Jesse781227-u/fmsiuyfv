# Forgive Me, Sister

A confession and wellness web app for Nigerian women. Users can spill anonymously, subscribe to private confessions or matchmaking, and connect with a therapist.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, also serves /fms frontend)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Frontend: React + Vite + Wouter + TailwindCSS

## Where things live

- `lib/db/src/schema/index.ts` — DB schema (source of truth for all tables)
- `lib/api-spec/` — OpenAPI spec
- `artifacts/api-server/src/` — Express API routes + app
- `artifacts/forgive-me-sister/src/` — React frontend (built to dist/public, served via API server)

## Architecture decisions

- Frontend is served as static files by the Express API server at `/fms` — avoids Replit's workflow health-check issues with web-kind artifacts that have path-based IDs.
- API calls from the frontend use `/api/...` paths (routed by the Replit proxy to the API server on port 8080).
- Flutterwave payment integration uses a placeholder public key; replace `FLWPUBK_TEST-XXXXXXX...` in `artifacts/forgive-me-sister/src/components/PaymentModal.tsx` with a real key.
- Admin panel is password-protected; default password is `therapist2024` (env: `ADMIN_PASSWORD`).
- Sessions use JWT-like tokens stored in localStorage; no server-side session store.

## Product

- **Free plan**: Anonymous public spills, emoji reactions, community replies
- **Private Confessions** (₦15,000/month): Direct private messages to the therapist-admin
- **Matchmaking** (₦50,000/month): Submit matchmaking profile; admin curates matches manually

## User preferences

- Nigerian audience; all prices in Naira (₦)
- Deep crimson + gold colour palette
- Payments via Flutterwave (placeholder key in PaymentModal.tsx — replace before going live)

## Gotchas

- Rebuild the frontend (`PORT=5173 BASE_PATH=/fms pnpm --filter @workspace/forgive-me-sister run build`) then restart the API server workflow after any frontend changes.
- The forgive-me-sister workflow (port 5173) intentionally stays "failed" — the frontend is served by the API server. Do not attempt to restart it.
- Always run `pnpm run typecheck:libs` before typechecking or building the API server if DB schema has changed.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
