# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Ranobe Reader — a full-stack light novel reader. Public site browses/reads ebooks; an admin panel manages content; subscribers receive new-book email notifications.

Two independent Node packages: `backend/` (Express 5, MongoDB, Redis) and `frontend/` (Next.js 16). Both use `"type": "module"` ESM. There is no monorepo tooling — install and run them separately.

## Commands

Backend (`backend/`, runs on port 3001):
```bash
npm install
npm run dev          # nodemon server.js
npm start            # NODE_ENV=production node server.js
node scripts/hash-password.js "<new-password>"   # bcrypt-hash an admin password for the .env
```

Frontend (`frontend/`, runs on port 3002 in dev):
```bash
npm install          # or: yarn (yarn.lock is committed)
npm run dev          # next dev --turbopack --port 3002
npm run build
npm start            # NODE_ENV=production next start
npm run lint         # next lint
```

There is no test suite in either package.

## Required environment

Backend hard-fails on startup if `JWT_SECRET` or `ADMIN_PASSWORD` is missing (see `backend/config/config.js`). `JWT_SECRET` should be ≥32 chars. `ADMIN_PASSWORD` is a **bcrypt hash**, not the plaintext — generate via `scripts/hash-password.js`. Other backend env vars referenced: `MONGO_URI` (default `mongodb://localhost:27017/reader`), `MONGO_USER`/`MONGO_PASSWORD`/`MONGO_SSL`/`MONGO_AUTH_SOURCE`, `REDIS_URL` (default `redis://localhost:6379`), `EMAIL_USER`/`EMAIL_PASSWORD`/`ADMIN_EMAIL` (Office 365 SMTP), `FRONTEND_URL`, `PORT`.

Frontend uses `NEXT_PUBLIC_API_URL` (production only — dev hardcodes `http://localhost:3001/api` in `lib/api.ts`) and `NEXT_PUBLIC_GA4`.

## Architecture

### Backend domain shape

Four resources, each with the same triple of `routes/ → controllers/ → models/`:
- **Ebook** — light novels with `cover` (image) + `ebook` (epub/pdf) files; belongs to a `Publisher`
- **Konorano** — yearly ranking books; same shape but with a `viURL` (Vietnamese translation link) instead of `publisher`
- **Publisher** — referenced by Ebooks
- **Subscriber** — email list with active/inactive flag

Routes follow the same pattern: `[validatePagination, cache(N)]` on list, `[validateObjectId, cache(N)]` on detail, `[adminAuth, uploadFields, validateEbook]` on write. Models declare explicit indexes on common query fields (`name`, `author`, `publisher`, `createdAt`, `releaseDate`).

### Auth model

There is **no user system** — only one admin. `POST /api/admin/login` takes a plaintext password, `bcrypt.compare`s against `config.ADMIN_PASSWORD`, returns a JWT (`{admin: true}`, 24h). The `adminAuth` middleware reads `x-admin-token` header.

The frontend stores the JWT in two cookies (`adminToken`, `adminTokenExpires`). `frontend/proxy.ts` (Next.js middleware, `matcher: "/admin/:path*"`) gates the admin UI by checking those cookies and forwards the token via `x-admin-token`. `lib/api.ts` axios instance also reads the cookie client-side and attaches the same header; on a 401 it clears cookies and bounces to `/admin/login`.

### File uploads

`utils/multerConfig.js` is a small factory: `createUploadMiddleware({ fieldMapping, allowedTypes, fields })` returns a configured `upload.fields()`. Configs (`ebookUploadConfig`, `konoranoUploadConfig`) declare which form-field name maps to which `uploads/<dir>` and which extensions are allowed. Filenames become `<uuid><ext>`.

**File lifecycle is hand-managed in controllers.** Multer writes to disk *before* the controller runs, so create/update handlers track:
- `filesToCleanupOnError` — newly-uploaded files; deleted in `finally` if the DB write threw
- `oldFilesToDelete` — pre-existing files on disk; deleted only **after** the DB update succeeds

Don't refactor this away. The pattern is deliberate: it keeps disk and Mongo in sync across failures. See `controllers/ebookController.js` for the canonical shape.

### Caching

`middleware/cache.js` wraps `redisClient.get/setEx` around GET responses keyed by `cache:${req.originalUrl}`. Only success responses (`< 400`) are cached. Mutating controllers must call `clearCache()` for both the collection key and the `?*` glob, plus the `:id` detail key. `clearCache` uses `SCAN` (not `KEYS`) so it doesn't block Redis.

### Async side effects

Email and notification work is dispatched via `setImmediate(...)` so the HTTP response isn't blocked on SMTP. Do this for any new fan-out work (subscribe confirmations, admin notifications, new-book broadcasts). The notification fan-out itself uses `Promise.allSettled` so one bad address doesn't fail the batch.

### Static-file gating

`server.js` serves the bundled **Bibi** EPUB reader (`backend/reader/`, vendored, not built from source) at `/reader`. The `/uploads/ebooks/*` route is **referer-gated**: it only serves files when the request's `Referer` host matches the server host *and* the path starts with `/reader` or `/admin`. It also auto-appends `.epub` if the request has no extension. `/uploads/covers/*` is open. The 403 page lives at `error/403.html`.

### Unsubscribe tokens

`utils/unsubscribeToken.js` signs a JWT carrying `{email, purpose: "unsubscribe"}` with `JWT_SECRET` (no expiry). Verifier checks `purpose` matches. The frontend `/unsubscribe` page calls `GET /api/subscribers/unsubscribe?token=...`.

### Frontend layout

Next.js App Router. `app/page.tsx` is the public homepage (composed of grids: `ebook-grid`, `konorano-grid`, `magazine-grid`, plus carousel/promo/subscribe-form). `app/admin/` is the gated admin panel — `proxy.ts` redirects unauthenticated visits to `/admin/login`. `app/unsubscribe/` is the email-link landing page. UI primitives in `components/ui/` are shadcn-style Radix wrappers.

### Error responses

Use `utils/errorHandler.js` helpers (`notFoundResponse`, `serverErrorResponse`, `validationErrorResponse`, `handleObjectIdError`) rather than open-coded `res.status(...).json(...)`. They keep the `{ msg: ... }` envelope consistent — the frontend assumes that shape.

### Language

User-facing strings (route comments, error messages, email templates) are in Vietnamese. Match that when adding endpoints or messages.
