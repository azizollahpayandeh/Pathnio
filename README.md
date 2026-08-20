# 🚚 Pathnio — Modern Fleet Management

Pathnio is a full-featured fleet-management platform for transit and logistics
companies. Track vehicles live on a map, manage drivers, plan trips, control
expenses and get beautiful analytics — all from one polished dashboard.

**Live demo:** https://pathnio-atzv.vercel.app

> Fleet data is real and multi-tenant now — sign up for a free company
> account from the login page to try it (there's no shared demo login).

---

## ✨ Features

- **Live map** — real-time vehicle positions with moving / stopped / offline states (Leaflet + OpenStreetMap), polled from the API
- **Vehicles** — full CRUD, fuel levels, odometer, status, per-vehicle detail pages
- **Drivers** — team management with ratings, trip history, profiles, and invite-based mobile activation
- **Trips** — schedule, track and complete journeys with cargo & revenue
- **Expenses** — fuel, maintenance, tolls, insurance and salary tracking
- **Reports** — revenue vs. expenses, expense breakdown and top-vehicle charts (Chart.js)
- **Alerts** — derived from real fleet conditions (offline vehicles, low fuel, maintenance), with unread counts and mark-as-read
- **Support, Subscription, Admin & Settings** — tickets, plan limits, user management and per-company preferences
- **Auth** — company registration and sign-in over JWT, multi-tenant with role-based access (owner / driver / platform admin)
- **i18n** — full English + Persian (RTL) localization
- **Driver mobile app** — Android/iOS app (Expo) drivers use to activate their account and stream background GPS telemetry
- **Design** — a cohesive design system with soft shadows, gradients, glassmorphism and smooth motion; fully responsive

## 🧱 Tech stack

| Layer | Stack |
|------|-------|
| Frontend | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, Framer Motion, Chart.js, Leaflet |
| Backend  | Django 5, Django REST Framework, SimpleJWT, Djoser, Neon PostgreSQL |
| Mobile   | Expo SDK 57 (React Native), expo-location + expo-task-manager for background GPS |

## 🏗️ Architecture

Three real, connected apps — a Next.js dashboard, a Django/DRF API, and an
Expo driver app — all backed by one multi-tenant Postgres database. There is
no local-storage demo mode or seed data; every environment talks to the live
API. See **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** for the full
breakdown (auth & multi-tenancy, driver invitation/activation, telemetry,
status engine, deployment).

## 🚀 Getting started

### Frontend

```bash
cd frontend
npm install
npm run dev        # http://localhost:3000, talks to localhost:8000
```

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
DEBUG=True ALLOWED_HOSTS='*' python manage.py migrate
DEBUG=True ALLOWED_HOSTS='*' python manage.py runserver   # http://localhost:8000
python manage.py test accounts   # run the test suite
```

### Mobile (driver app)

```bash
cd mobile
npm install
npx expo run:android   # background location needs a dev/EAS build, not Expo Go
```

## ☁️ Deployment

The frontend and backend each deploy to **Vercel** as separate projects (root
directories `frontend/` and `backend/`). Pushing to `main` triggers an
automatic production deployment for both — migrations do **not** auto-run on
Vercel, so run them against the database manually after a schema change (see
ARCHITECTURE.md §11).

The mobile app builds via EAS: `eas build -p android --profile preview`.

## 📁 Structure

```
Pathnio/
├── frontend/            # Next.js dashboard
│   └── src/
│       ├── app/         # routes: landing, auth, dashboard/*
│       ├── components/  # UI primitives, modals, widgets
│       └── lib/         # api-data (data layer), auth, types, i18n
├── backend/              # Django REST API
│   └── accounts/         # models, serializers, views, urls, tests
└── mobile/               # Expo driver app
    └── src/               # auth, api, location tracking, screens
```
