# taste

React-, TypeScript-, Vite-, Tailwind- und Supabase-Projekt mit Login, geschuetzten Routen und einem schlanken Dashboard-Fundament.

## Pakete

- react
- react-dom
- react-router-dom
- react-hook-form
- zod
- @hookform/resolvers
- @supabase/supabase-js
- tailwindcss
- @tailwindcss/vite
- lucide-react
- clsx
- tailwind-merge

## Start

```bash
npm install
cp .env.example .env
npm run dev
```

## Skripte

```bash
npm run dev
npm run build
npm run preview
```

## Env Variablen

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=
```

## Login Flow

Die App prueft beim Start die aktuelle Supabase Session.
Ohne Session wird auf `/login` geleitet.
Mit gueltiger Session wird `/dashboard` freigeschaltet.
Der Logout in der Dashboard-Topbar beendet die Session und leitet zurueck auf `/login`.

## Struktur

```text
src/
  components/
    auth/
    dashboard/
    layout/
    ui/
  features/
    auth/
  lib/
  pages/
  routes/
  types/
```

`src/features/auth` kapselt Session-Handling und Auth-Funktionen.  
`src/routes` enthaelt die Guards fuer oeffentliche und geschuetzte Bereiche.  
`src/pages` enthaelt nur die drei benoetigten Seiten: Login, Dashboard und Not Found.
