# Pathnio — Frontend

The Pathnio fleet-management web app, built with **Next.js 15**, **React 19**,
**TypeScript** and **Tailwind CSS v4**.

## Development

```bash
npm install
npm run dev     # http://localhost:3000
```

## Build

```bash
npm run build
npm run start
```

## How data works

All fleet data (vehicles, drivers, trips, expenses, alerts) comes from the
Django REST API in `../backend` — there is no local-storage store or seed
data. `src/lib/api-data.ts` holds the API hooks + CRUD calls, and
`src/lib/auth.ts` handles real JWT login/refresh/session.

On `localhost` the app talks to `http://localhost:8000`; in production it
targets the deployed backend. See `src/app/api.ts` for the base URL.

## Structure

```
src/
├── app/          # App Router routes (landing, auth, dashboard/*)
├── components/   # UI primitives, modals, widgets
├── i18n/         # English + Persian locales
└── lib/          # api-data (data layer), auth, types
```
