# Taste

Persönlicher Rezept-Workspace von NuVioLabs – erstellt, verwaltet und organisiert deine Rezepte, Favoriten und Einkaufslisten.

## Stack

| Bereich | Technologie |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite 8 |
| Styling | Tailwind CSS 4 |
| Routing | React Router DOM 7 |
| Data Fetching | TanStack React Query 5 |
| Backend | Supabase (Auth, Datenbank, RLS) |
| Animationen | Framer Motion 12 |
| Icons | Lucide React |
| Formulare | React Hook Form + Zod |
| Analytics | Vercel Analytics + Speed Insights |
| Tests (Unit/Integration) | Vitest + Testing Library |
| Tests (E2E) | Playwright |

## Features

- **Auth** – Login, Sign-up (intern), Passwort vergessen, Passwort-Reset
- **Dashboard** – Rezeptstatistiken, letzte Rezepte, Rezept direkt erstellen
- **Rezepte** – Übersicht, Suche, Filter, Detail, Erstellen, Bearbeiten, Löschen
- **Favoriten** – persönliche Favoritenübersicht mit Like- und Favoritstatus
- **Einkaufsliste** – mehrere Listen, Zutaten aus Rezepten aggregieren, abhaken, Plan-Limits
- **Inspiration** – Teaser-Bereich für künftige Kochideen und Vorschlagslogik
- **Profil** – Benutzerprofil verwalten
- **Feedback** – Feedback direkt aus der App senden
- **Rechtliches** – Impressum, Datenschutz, Nutzungsbedingungen

## Erste Schritte

```bash
npm install
cp .env.example .env
# .env mit Supabase-Credentials befüllen
npm run dev
```

Die App läuft dann auf [http://localhost:5173](http://localhost:5173).

## Umgebungsvariablen

```env
VITE_SUPABASE_URL=https://<dein-projekt>.supabase.co
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=<anon-key>

# Stripe (nur Vercel / server-seitig)
STRIPE_SECRET_KEY=sk_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Für E2E-Tests optional:

```env
E2E_TEST_EMAIL=test@beispiel.de
E2E_TEST_PASSWORD=deinPasswort
```

## Skripte

```bash
# Entwicklung
npm run dev           # Dev-Server starten
npm run build         # TypeScript-Check + Production-Build
npm run preview       # Build lokal vorschauen

# Code-Qualität
npm run lint          # ESLint prüfen (0 Warnings erlaubt)
npm run lint:fix      # ESLint automatisch fixen
npm run format        # Prettier auf src/ anwenden
npm run format:check  # Prettier-Check ohne Änderungen

# Tests
npm run test          # Vitest Unit/Integration (einmalig)
npm run test:watch    # Vitest im Watch-Modus
npm run test:coverage # Vitest mit Coverage-Report

# E2E-Tests
npm run test:e2e      # Playwright Tests ausführen
npm run test:e2e:ui   # Playwright mit interaktivem UI
```

## Projektstruktur

```text
src/
  components/          # Wiederverwendbare UI-Komponenten
    auth/
    dashboard/
    feedback/
    layout/            # NavDrawer, Layout-Shells
    legal/
    recipes/           # RecipeCard, RecipeDetail, RecipeCreateModal, ...
    shopping-list/     # Dialoge für Einkaufsliste
    ui/                # Button, Card, Input, Spinner
  features/            # Domain-Logik und Hooks
    auth/              # AuthProvider, useAuth, auth-service
    feedback/
    profile/           # useProfile, profileService
    recipes/           # useRecipes, recipeService, queryOptions, types
    shopping-list/     # useShoppingLists, storage, types
  hooks/               # Globale Custom Hooks
  lib/                 # Supabase-Client
  pages/               # Seitenkomponenten (eine pro Route)
  routes/              # ProtectedRoute, PublicOnlyRoute
  styles/
  test/
    unit/              # Vitest Unit-Tests
    integration/       # Vitest + Testing Library Integrationstests
    setup.ts           # Vitest Setup (jest-dom)
  types/               # Globale TypeScript-Typen

e2e/                   # Playwright E2E-Tests
```

## Routing

| Route | Schutz | Seite |
|---|---|---|
| `/login` | Nur ohne Auth | LoginPage |
| `/signup` | Nur ohne Auth | SignupPage (intern) |
| `/forgot-password` | Nur ohne Auth | ForgotPasswordPage |
| `/reset-password` | Öffentlich | ResetPasswordPage |
| `/dashboard` | Auth required | DashboardPage |
| `/recipes` | Auth required | RecipesPage |
| `/recipes/:id` | Auth required | RecipeDetailPage |
| `/favorites` | Auth required | FavoritesPage |
| `/shopping-list` | Auth required | ShoppingListPage |
| `/inspiration` | Auth required | InspirationPage |
| `/profile` | Auth required | ProfilePage |
| `/privacy` | Öffentlich | PrivacyPage |
| `/terms` | Öffentlich | TermsPage |
| `/imprint` | Öffentlich | ImprintPage |

## Auth-Flow

1. App prüft beim Start die laufende Supabase-Session
2. Ohne Session → Weiterleitung auf `/login`
3. Mit gültiger Session → `/dashboard`
4. Logout beendet die Session und leitet auf `/login` zurück
5. Passwort-Reset: `/forgot-password` → E-Mail → Link → `/reset-password`

## Einkaufsliste

Die Einkaufsliste ist lokal (localStorage) gespeichert und plan-aware:

| Plan | Maximale Listen |
|---|---|
| Free | 2 |
| Pro | 10 |

Rezeptzutaten werden beim Hinzufügen auf die gewünschten Portionen skaliert und listenübergreifend nach Zutat aggregiert.

## Supabase

Die Datenbankänderungen liegen jetzt im Supabase-CLI-Format unter `supabase/migrations/`.
Lokale Konfiguration liegt in `supabase/config.toml`.

Wichtige Befehle:

```bash
npx supabase@latest start
npx supabase@latest db reset
npx supabase@latest migration up
```

Aktuell abgedeckte Tabellen und Objekte:

- `profiles` + `public_profiles`
- `recipes` + `recipe_likes` + `recipe_favorites`
- `feedback`

RLS ist für `profiles`, `recipes`, `recipe_likes`, `recipe_favorites` und `feedback` konfiguriert.
Zusätzlich liefern RPCs `get_recipe_feed()` und `get_favorite_recipe_feed()` die Rezeptlisten jetzt serverseitig aggregiert aus.
