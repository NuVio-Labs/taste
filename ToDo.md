# NuVio Taste

_Zuletzt aktualisiert: 2026-04-03 (Session 2)_

---

## Kurzstatus

- P0 abgeschlossen
- P1 ca. 70% abgeschlossen
- Kernfluesse `Auth -> Dashboard -> Rezepte -> Rezeptdetail -> Favoriten -> Einkaufsliste -> Profil -> Feedback` vorhanden und manuell getestet
- App ist fuer die interne Testphase bereit

## Architekturstand

- Frontend: React 19, TypeScript, Vite, Tailwind CSS 4, Framer Motion
- Backend: Supabase mit PostgreSQL, Auth und RLS
- Datenlayer: TanStack React Query v5 in den Kernseiten
- Routing: React Router v7 mit `React.lazy()` und `Suspense`
- Fehlerbehandlung: app-weite `ErrorBoundary`
- Analytics: Vercel Analytics und Speed Insights

## Zuletzt abgeschlossen

- P1: Query-Invalidierungsstrategie vereinheitlicht
- P1: Rezept-Queries reduziert
- P1: Dashboard auf React Query umgestellt
- P1: Profil auf React Query umgestellt
- P1: Route-Level Code Splitting eingefuehrt
- P1: App-weite Error Boundary eingefuehrt
- P0: Inspiration aus der Navigation entfernt
- P0: RLS-Check abgeschlossen und `public_profiles`-View eingefuehrt

## Offene To-dos

### P1

- [ ] Ladezustaende als Skeletons vereinheitlichen
- [ ] React Router Data Router pruefen und ggf. migrieren
- [ ] Chunk-Warnung im Build nach Code Splitting verifizieren und beheben
- [ ] Playwright-Flows fuer Login abdecken
- [ ] Playwright-Flows fuer Rezept erstellen abdecken
- [ ] Playwright-Flows fuer Rezept bearbeiten abdecken
- [ ] Playwright-Flows fuer Rezept liken abdecken
- [ ] Playwright-Flows fuer Rezept favorisieren abdecken
- [ ] Playwright-Flows fuer Favoriten-Seite abdecken
- [ ] Playwright-Flows fuer Einkaufsliste abdecken
- [ ] Playwright-Flows fuer Profil speichern abdecken

### P2

- [ ] SQL-Dateien ins Supabase-CLI-Migrationsformat ueberfuehren
- [ ] View oder RPC fuer effizientere Rezeptlisten pruefen
- [ ] Monitoring fuer DB-Groesse und Egress definieren
- [ ] Evaluieren, ob die Einkaufsliste statt `localStorage` in Supabase persistiert werden soll
- [ ] Loading-, Empty- und Error-Designs appweit vereinheitlichen
- [ ] Mobile Navigation und Formularfluesse auf kleinen Screens gezielt pruefen
- [ ] Sprachkonsistenz auf der Login-Seite bereinigen

### P3

- [ ] Inspiration-Bereich mit echter Logik fuellen
- [ ] Bild-Upload ueber externen Storage integrieren
- [ ] Rezeptbilder optimieren
- [ ] Analytics-Events fuer Kernaktionen definieren
- [ ] Offline- und Low-Network-Strategien pruefen
- [ ] Einkaufsliste auf Supabase-Persistenz migrieren

## Aktuelle Risiken und Pruefluecken

- Uneinheitliche Loading States wirken noch unpolished
- Rezeptlisten brauchen weiter mehrere Query-Roundtrips
- Einkaufsliste ist noch nicht geraeteuebergreifend
- Es gibt noch keine belastbaren automatisierten E2E-Flows
- `npm run build` wurde nach den letzten groesseren Aenderungen noch nicht explizit verifiziert
- Error Boundary wurde noch nicht bewusst manuell getriggert

## Aenderungslog

### 2026-04-03 (Session 2)

- P1: `reload()` in den Rezept-, Detail- und Favoriten-Flows durch gezielte `invalidateQueries`-Aufrufe ersetzt
- P1: `fetchRecipes` von 3 auf 2 serielle Gruppen reduziert
- P1: `fetchFavoriteRecipes` von 4 auf 3 serielle Gruppen reduziert

### 2026-04-03

- P0: Dashboard-Roadmap auf aktuellen Stand gebracht
- P0: Inspiration aus allen Navigationen entfernt, Route aber beibehalten
- P0: RLS geprueft, `public_profiles`-View fuer Autorennamen eingefuehrt
- P0: Kernfluesse manuell im Happy Path getestet
- P1: `useProfile` auf React Query umgestellt
- P1: Dashboard-Daten in eigene Service- und Query-Optionen extrahiert
- P1: Alle Seiten in `App.tsx` auf Lazy Loading umgestellt
- P1: Error Boundary als eigene UI-Komponente eingefuehrt

## Pflege-Regel fuer diese Datei

- Kurzstatus nur dann anpassen, wenn sich Projektphase oder Reifegrad geaendert hat
- Erledigte Punkte sofort aus `Offene To-dos` nach `Zuletzt abgeschlossen` oder ins `Aenderungslog` verschieben
- Pro Arbeitssession nur die neuen, relevanten Aenderungen im `Aenderungslog` ergaenzen, keine Dateiliste pflegen
- Pruefluecken nur dann stehen lassen, wenn sie noch wirklich offen sind
