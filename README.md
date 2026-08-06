# 🚚 Pathnio — Modern Fleet Management

Pathnio is a full-featured fleet-management platform for transit and logistics
companies. Track vehicles live on a map, manage drivers, plan trips, control
expenses and get beautiful analytics — all from one polished dashboard.

**Live demo:** https://pathnio-atzv.vercel.app

> Demo login → **demo@pathnio.com** / **demo1234** (or just click _“Use demo account”_ on the login page).

---

## ✨ Features

- **Live map** — real-time vehicle positions with moving / stopped / offline states (Leaflet + OpenStreetMap)
- **Vehicles** — full CRUD, fuel levels, odometer, status, per-vehicle detail pages
- **Drivers** — team management with ratings, trip history and profiles
- **Trips** — schedule, track and complete journeys with cargo & revenue
- **Expenses** — fuel, maintenance, tolls, insurance and salary tracking
- **Reports** — revenue vs. expenses, expense breakdown and top-vehicle charts (Chart.js)
- **Alerts** — prioritized notifications with unread counts and mark-as-read
- **Support, Subscription, Admin & Settings** — tickets, plans, user management and preferences
- **Auth** — company registration and sign-in
- **Design** — a cohesive design system with soft shadows, gradients, glassmorphism and smooth motion; fully responsive

## 🧱 Tech stack

| Layer | Stack |
|------|-------|
| Frontend | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, Framer Motion, Chart.js, Leaflet |
| Backend  | Django 5, Django REST Framework, SimpleJWT, Djoser |

## 🏗️ Architecture

The frontend is a **self-contained application**. All fleet data (vehicles,
drivers, trips, expenses, alerts) lives in a small reactive store
(`frontend/src/lib/store.ts`) backed by `localStorage`, and authentication is
handled client-side (`frontend/src/lib/auth.ts`). This makes the deployed demo
fully functional and persistent in the browser — every create / edit / delete
survives reloads — with no server dependency, which is ideal for a serverless
host like Vercel.

The repository also ships a complete **Django REST API** (`backend/`) with
models, serializers and company-scoped viewsets for `Company`, `Driver`,
`Vehicle`, `Trip`, `Expense`, `Alert`, support tickets and user management. It's
ready for self-hosting when you want a persistent multi-user backend — point the
frontend at it via `NEXT_PUBLIC_API_BASE_URL` and swap the local store for the
API layer.

## 🚀 Getting started

### Frontend

```bash
cd frontend
npm install
npm run dev        # http://localhost:3000
```

### Backend (optional, for self-hosting)

```bash
cd backend
python -m venv env && source env/bin/activate   # Windows: env\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver   # http://localhost:8000
```

## ☁️ Deployment

The frontend deploys to **Vercel** (root directory `frontend/`). Pushing to the
default branch triggers an automatic production deployment.

The backend can be deployed to any host that supports Django + a persistent
database (set `DATABASE_URL`, `SECRET_KEY`, `DEBUG=False`, `ALLOWED_HOSTS` and
`CORS_ALLOWED_ORIGINS`).

## 📁 Structure

```
Pathnio1/
├── frontend/            # Next.js app (the deployed product)
│   └── src/
│       ├── app/         # routes: landing, auth, dashboard/*
│       ├── components/  # UI primitives, modals, widgets
│       └── lib/         # store, auth, types, seed data
└── backend/             # Django REST API (optional self-host)
    └── accounts/        # models, serializers, views, urls
```
