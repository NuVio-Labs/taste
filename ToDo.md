# NuVio Taste

_Zuletzt aktualisiert: 2026-04-03 (Session 4)_

---

## Kurzstatus

- P0 abgeschlossen
- P1 abgeschlossen
- Kernflüsse `Auth -> Dashboard -> Rezepte -> Rezeptdetail -> Favoriten -> Einkaufsliste -> Profil -> Feedback` vorhanden und für die interne Testphase abgesichert
- App ist für die interne Testphase bereit

## Architekturstand

- Frontend: React 19, TypeScript, Vite, Tailwind CSS 4, Framer Motion
- Backend: Supabase mit PostgreSQL, Auth und RLS
- Datenlayer: TanStack React Query v5 in den Kernseiten
- Routing: React Router v7 mit Data Router (`createBrowserRouter`, `RouterProvider`) plus `React.lazy()` und `Suspense`
- Fehlerbehandlung: app-weite `ErrorBoundary`
- Analytics: Vercel Analytics und Speed Insights

## Zuletzt abgeschlossen

- P2: Rezeptlisten auf serverseitige RPC-Feeds umgestellt, mit Fallback auf die bisherigen Mehrfach-Queries
- P2: Supabase-CLI-Migrationen mit `npx supabase@latest start` und `npx supabase@latest db reset` erfolgreich verifiziert
- P2: Supabase-CLI-Migrationssatz um Core-Schema für `profiles`, `public_profiles`, `recipes` und `recipe_likes` ergänzt
- P2: lose Supabase-SQL-Dateien in `supabase/config.toml` plus `supabase/migrations/` überführt
- Performance: Login-Initial-Render vereinfacht, externe Font-Blocker entfernt und Speed-Insights-Routen an React Router angebunden
- P1: Playwright-Profil-speichern-Flow abgedeckt
- P1: Playwright-Einkaufslisten-Flow abgedeckt
- P1: Playwright-Favoriten-Seiten-Flow abgedeckt
- P1: Playwright-Rezept-favorisieren-Flow abgedeckt
- P1: Playwright-Rezept-liken-Flow abgedeckt
- P1: Playwright-Rezept-bearbeiten-Flow abgedeckt
- UI: Rezeptkarten semantisch bereinigt, verschachtelte `<button>`-Struktur entfernt
- P1: Playwright-Rezept-erstellen-Flow abgedeckt
- P1: Playwright-Login-Flow abgedeckt
- Infrastruktur: Vercel-Deployment wieder installierbar, ESLint-Konflikt auf kompatible Versionen zurückgesetzt
- P1: React Router auf Data Router umgestellt
- P1: Ladezustände auf Skeletons umgestellt
- P1: Build nach Code Splitting geprüft, keine Chunk-Warnung mehr offen
- P1: Query-Invalidierungsstrategie vereinheitlicht
- P1: Rezept-Queries reduziert
- P1: Dashboard auf React Query umgestellt
- P1: Profil auf React Query umgestellt
- P1: Route-Level Code Splitting eingeführt
- P1: App-weite Error Boundary eingeführt
- P0: Inspiration aus der Navigation entfernt
- P0: RLS-Check abgeschlossen und `public_profiles`-View eingeführt

## Offene To-dos

### P2

- [ ] Monitoring für DB-Größe und Egress definieren
- [ ] Evaluieren, ob die Einkaufsliste statt `localStorage` in Supabase persistiert werden soll
- [ ] Loading-, Empty- und Error-Designs appweit vereinheitlichen
- [ ] Mobile Navigation und Formularflüsse auf kleinen Screens gezielt prüfen
- [ ] Sprachkonsistenz auf der Login-Seite bereinigen

### P3

- [ ] Inspiration-Bereich mit echter Logik füllen
- [ ] Bild-Upload über externen Storage integrieren
- [ ] Rezeptbilder optimieren
- [ ] Analytics-Events für Kernaktionen definieren
- [ ] Offline- und Low-Network-Strategien prüfen
- [ ] Einkaufsliste auf Supabase-Persistenz migrieren

## Aktuelle Risiken und Prüflücken

- Einkaufsliste ist noch nicht geräteübergreifend
- E2E-Abdeckung ist für P1 gut, aber noch nicht vollständig CI-orientiert für spätere P2- und P3-Flows
- Error Boundary wurde noch nicht bewusst manuell getriggert
- Deployment hängt weiter an sauber gepflegten Dependency-Versionen, weil Vercel Peer-Konflikte strikt auflöst
- Wirkung der jüngsten FCP/LCP-Optimierungen muss erst in neuen Vercel-Speed-Insights-Daten bestätigt werden
- Produktions-DB muss die neuen RPC-Migrationen erhalten; bis dahin greift im Frontend bewusst der Legacy-Fallback

## Änderungslog

### 2026-04-03 (Session 4)

- Performance: Rezeptlisten über neue Supabase-RPCs serverseitig aggregiert; Frontend-Fallback auf Legacy-Queries bleibt aktiv, bis alle Umgebungen migriert sind
- Infrastruktur: Supabase-CLI-Migrationen lokal erfolgreich verifiziert; `start` und `db reset` laufen nach Ergänzung des Core-Schemas sauber durch
- Infrastruktur: fehlende Basismigration für `profiles`, `public_profiles`, `recipes` und `recipe_likes` ergänzt, nachdem `supabase db reset` auf fehlende `public.recipes` gelaufen ist
- Infrastruktur: Supabase-Ordner auf CLI-Format umgestellt; `config.toml` ergänzt und lose SQL-Dateien in timestamped Migrationen überführt
- Performance: Login-Seite für den ersten Render entschärft; Google-Font-Blocker entfernt und schwere Hintergrundeffekte reduziert
- Analytics: Vercel Speed Insights an React Router gebunden, damit Seiten nicht mehr als `Unknown` aggregiert werden
- Routing: Öffentliche Auth-Seiten rendern ohne vorgelagerten Session-Loader und kommen schneller zum ersten Paint
- Dokumentation: `ToDo.md` auf aktuellen Projektstand bereinigt und auf sauberen UTF-8-Inhalt mit Umlauten umgestellt

### 2026-04-03 (Session 3)

- P1: Playwright-Profil-Flow erfolgreich geprüft; Benutzername lässt sich speichern und wird wieder geladen
- P1: Profilspeichern von `upsert` auf gezieltes `update` umgestellt; RLS-Fehler auf `profiles` behoben
- P1: Playwright-Einkaufslisten-Flow erfolgreich geprüft; Rezept wird einer Liste hinzugefügt und aggregierte Zutat lässt sich abhaken
- P1: Playwright-Favoriten-Seite erfolgreich geprüft; favorisierte Rezepte erscheinen dort und lassen sich öffnen
- P1: Playwright-Favoriten-Flow erfolgreich geprüft; Favoriten-Zustand wird in der Detailansicht korrekt umgeschaltet
- P1: Playwright-Like-Flow erfolgreich geprüft; Like-Zustand wird in der Detailansicht korrekt umgeschaltet
- P1: Playwright-Bearbeiten-Flow erfolgreich geprüft; Rezepttitel und Beschreibung lassen sich über die Detailansicht aktualisieren
- UI: Rezeptkarten auf tastaturbedienbare Container umgestellt; HTML-Warnung zu verschachtelten Buttons behoben
- P1: Playwright-Rezepte-Spec erfolgreich geprüft; darunter auch der Flow zum Erstellen eines neuen Rezepts
- P1: Playwright-Login-Spec stabilisiert und erfolgreich ausgeführt; 3 Checks grün, erfolgreicher Login weiter per Test-Credentials gesteuert
- Infrastruktur: Vercel-Installfehler behoben, `eslint` und `@eslint/js` auf kompatible 9er-Versionen zurückgesetzt
- Infrastruktur: `npm install`, `npm run build` und `npm run lint` erfolgreich geprüft

### 2026-04-03 (Session 2)

- P1: Routing von `BrowserRouter` plus `<Routes>` auf `createBrowserRouter` plus `RouterProvider` migriert
- P1: textbasierte Ladezustände in Dashboard, Rezepte, Favoriten, Profil und Rezeptdetail durch konsistente Skeletons ersetzt
- P1: `npm run build` erfolgreich geprüft, keine Chunk-Warnung mehr im aktuellen Stand
- P1: `reload()` in den Rezept-, Detail- und Favoriten-Flows durch gezielte `invalidateQueries`-Aufrufe ersetzt
- P1: `fetchRecipes` von 3 auf 2 serielle Gruppen reduziert
- P1: `fetchFavoriteRecipes` von 4 auf 3 serielle Gruppen reduziert

### 2026-04-03

- P0: Dashboard-Roadmap auf aktuellen Stand gebracht
- P0: Inspiration aus allen Navigationen entfernt, Route aber beibehalten
- P0: RLS geprüft, `public_profiles`-View für Autorennamen eingeführt
- P0: Kernflüsse manuell im Happy Path getestet
- P1: `useProfile` auf React Query umgestellt
- P1: Dashboard-Daten in eigene Service- und Query-Optionen extrahiert
- P1: alle Seiten in `App.tsx` auf Lazy Loading umgestellt
- P1: Error Boundary als eigene UI-Komponente eingeführt

## Pflege-Regel für diese Datei

- Kurzstatus nur dann anpassen, wenn sich Projektphase oder Reifegrad geändert hat
- Erledigte Punkte sofort aus `Offene To-dos` nach `Zuletzt abgeschlossen` oder ins `Änderungslog` verschieben
- Pro Arbeitssession nur die neuen, relevanten Änderungen im `Änderungslog` ergänzen, keine Dateiliste pflegen
- Prüflücken nur dann stehen lassen, wenn sie noch wirklich offen sind
