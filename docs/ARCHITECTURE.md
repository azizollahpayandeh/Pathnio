# Pathnio — Fleet Management SaaS · Developer & Architecture Guide

A multi-tenant fleet-management platform: a Next.js web dashboard for company
owners, a Django/DRF backend on Neon PostgreSQL, and an Expo/React-Native driver
app that streams GPS telemetry.

> No real credentials appear in this document. Replace every `<PLACEHOLDER>`.

## 1. Architecture

```
Web Dashboard (Next.js)        Driver App (Expo/React Native)
        |  HTTPS + JWT                    |  HTTPS + JWT
        +----------------+----------------+
                         v
              Django + DRF backend  (Vercel, api/index.py WSGI)
                         |
                  Neon PostgreSQL (multi-tenant)
```

- **Web**: `frontend/` — Next.js 15, React 19, Tailwind, Leaflet. Deployed as
  Vercel project (root `frontend/`). Base API URL in `src/app/api.ts`.
- **Backend**: `backend/` — Django 5.2 + DRF + SimpleJWT. Deployed as Vercel
  project (root `backend/`, native Django builder → `api/index.py`).
- **Mobile**: `mobile/` — Expo SDK 57. Background GPS via `expo-location` +
  `expo-task-manager`. Built with EAS (`eas build -p android --profile preview`).

## 2. Repository structure

```
backend/accounts/       models, serializers, views, urls (all API logic)
  tenancy.py            company_for/role_for + IsCompanyOwner/Member + scoping mixin
  invitations.py        driver invite token gen/hash/issue
  assignments.py        driver<->vehicle assign/unassign service
  fleet_status.py       vehicle/driver status engine (configurable thresholds)
  alerts_engine.py      derive fleet alerts from real data
  subscriptions.py      plan limit enforcement
  tests_*.py            55 automated tests
frontend/src/
  lib/api-data.ts       API hooks + CRUD (company-scoped) — the data layer
  lib/auth.ts           real JWT auth (login/refresh/session)
  app/dashboard/*       owner dashboard pages
mobile/src/
  auth.tsx api.ts       login/register/activate + token refresh
  location/             task (background), queue (offline), tracker, status
  screens/              Login, Activation, Home
```

## 3. Local development

```bash
# Backend
cd backend && python -m venv .venv && ./.venv/bin/pip install -r requirements.txt
DEBUG=True ALLOWED_HOSTS='*' ./.venv/bin/python manage.py migrate
DEBUG=True ALLOWED_HOSTS='*' ./.venv/bin/python manage.py runserver 0.0.0.0:8000
./.venv/bin/python manage.py test accounts        # 55 tests

# Frontend (talks to localhost:8000 when on localhost)
cd frontend && npm install && npm run dev

# Mobile (needs a dev/EAS build — background location doesn't run in Expo Go)
cd mobile && npm install && npx expo run:android
```

## 4. Environment variables (backend)

| Var | Purpose |
|---|---|
| `SECRET_KEY` | Django secret + JWT signing (**required in prod**) |
| `DEBUG` | `False` in prod (default) |
| `DATABASE_URL` / `POSTGRES_URL_NON_POOLING` | Neon (use the **non-pooling** URL for migrations) |
| `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS` | comma-separated |

Never commit secrets. `SECRET_KEY`, DB URL, and any keys come from the env.

## 5. Auth & multi-tenancy

- JWT (`POST /api/token/`, username **or** email). Refresh: `POST /api/auth/token/refresh/`.
- `Membership(user, company, role)` is the **single source of truth** for tenant +
  role. `accounts/tenancy.py::company_for(user)` resolves it server-side; the
  client's `company_id` is **never** trusted.
- Every company-owned resource is filtered by `CompanyScopedQuerysetMixin`
  (list + object-level/IDOR protection). `company` is server-set on create.
- Roles: `COMPANY_OWNER` (dashboard), `DRIVER` (mobile), `PLATFORM_ADMIN`
  (is_staff — the only role that reaches `/users/*` and the Admin page).

## 6. Driver invitation & activation

1. Owner creates a **profile-only** driver (no login yet).
2. `POST /drivers/{id}/invitation/` → returns a one-time raw token (only the
   SHA-256 hash is stored). Revoke/regenerate supported.
3. Driver registers on the app (`POST /driver/register/` → bare account), then
   `POST /driver-invitations/activate/ {token}` binds user→driver→company
   atomically (`select_for_update`, single-use, expiring). company_id/driver_id
   from the client are ignored.

## 7. Driver↔Vehicle assignment

`DriverVehicleAssignment` (history; partial-unique active per vehicle & driver).
`POST /vehicles/{id}/assign/ {driver_id}` / `/unassign/`. Same-company enforced.
Telemetry derives the vehicle from the driver's **active assignment** — the
client's `vehicle_id` is never trusted.

## 8. Telemetry & Live Map

- `POST /api/accounts/locations/` — batch of fixes; each carries a client
  `event_id` (UUID) for **idempotent** retransmit dedup. Server links the active
  trip, stores `LocationPing` (= LocationTelemetry) history, and mirrors the
  latest fix onto the vehicle (VehicleLatestState) + `last_seen_at`.
- `GET /api/accounts/vehicles/live/` — enriched feed (position, driver, active
  trip + cargo, `live_status`) in one query set. The Live Map polls it (MVP
  transport; the `useLiveVehicles` hook is the single seam to swap for
  SSE/WebSocket/Pusher later — no persistent WebSockets on Vercel serverless).

## 9. Offline sync (mobile)

Fixes buffer in AsyncStorage (SQLite-backed), preserve `recorded_at` + `event_id`,
and flush on reconnect; the backend dedups by `event_id`. The app shows honest
state: `ACTIVE / OFFLINE / GPS_DISABLED / PERMISSION_MISSING / PAUSED`.

## 10. Status engine, alerts, subscriptions

- `fleet_status.py`: vehicle (MOVING/STOPPED/OFFLINE/MAINTENANCE/INACTIVE) and
  driver (AVAILABLE/ON_TRIP/OFFLINE/INACTIVE) status; thresholds configurable via
  settings and per-company `CompanySettings`.
- `alerts_engine.py`: derives `FleetAlert`s from real conditions (maintenance,
  low fuel, offline), de-duplicated per (vehicle, type).
- `subscriptions.py`: `Plan` + `Subscription`; driver/vehicle limits enforced on
  create. **No payment provider** — internal only.

## 11. Deployment

Push to `main` → Vercel rebuilds both projects. Migrations do **not** auto-run on
Vercel; run them against Neon from a machine with the non-pooling URL:

```bash
DATABASE_URL='<NEON_NON_POOLING_URL>' ./.venv/bin/python manage.py migrate
```

Mobile: `EAS_NO_VCS=1 eas build -p android --profile preview` → APK link.

## 12. Production verification

- `python manage.py test accounts` — 55 tests (auth, tenant isolation, IDOR,
  invitations, activation, assignment, trips, cargo, telemetry + dedup, expenses,
  alerts, settings, live-map, subscription limits, cross-tenant attacks).
- End-to-end (see `docs` / the E2E script): register → activate → assign → trip →
  cargo → telemetry → live map → expense → alerts → reports, then clean up test
  data.
```
