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

The app is self-contained: all fleet data is kept in a reactive
`localStorage`-backed store (`src/lib/store.ts`) with seed data
(`src/lib/seed.ts`), and auth is handled client-side (`src/lib/auth.ts`). Every
create / edit / delete persists across reloads.

Demo login: **demo@pathnio.com** / **demo1234** (or click _“Use demo account”_).

To connect a real backend instead, set `NEXT_PUBLIC_API_BASE_URL` and use the
Django REST API in `../backend`.

## Structure

```
src/
├── app/          # App Router routes (landing, auth, dashboard/*)
├── components/   # UI primitives, modals, widgets
└── lib/          # store, auth, types, seed data
```
