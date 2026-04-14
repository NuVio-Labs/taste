# NuVio Taste – AGENTS.md

## Produktkontext
NuVio Taste ist eine hochwertige Rezept App im NuVio Stil.
Ziel ist keine generische Demo App, sondern ein sauberes, modernes und wartbares Produkt mit klarer UX, schneller Bedienung und ruhiger visueller Sprache.

Die App soll Rezepte übersichtlich auffindbar, angenehm lesbar und einfach nutzbar machen.
Wichtige UX Struktur:
- linke Navigation als fester Hauptanker
- Kategorienübersicht als Einstieg
- scrollbare Rezeptübersicht
- Rezeptdetail als klarer Lesemodus
- Fokus auf Orientierung, Ruhe und einfache Bedienung

## Produktprinzipien
- Funktion vor Spielerei
- kleine, sichere Änderungen statt großer Umbauten
- bestehende Patterns respektieren
- keine unnötigen Refactors
- keine künstliche Komplexität
- keine Fake Features ohne echten Datenvertrag
- robuste, wartbare Lösungen vor cleveren Sonderwegen

## Tech Stack
Bestehenden Stack respektieren und nicht ohne klaren Grund verändern:
- React 19
- Vite
- TypeScript
- Tailwind CSS v4
- Framer Motion
- Supabase
- TanStack React Query v5
- React Router v7

Zusätzliche Architekturhinweise:
- route level code splitting mit React.lazy und Suspense beibehalten
- Error Boundary als Teil der robusten UX respektieren
- bestehende Env Struktur nicht aufbrechen

## Architekturregeln
- Bestehende Ordnerstruktur, Benennungen und Patterns beibehalten
- Keine neuen Architekturlayer einführen, wenn der vorhandene Stack die Aufgabe bereits sauber löst
- Keine große State Logik aufbauen, wenn React Query oder lokale UI States ausreichen
- Keine parallelen Datenpfade einführen
- Keine doppelten Typen, Contracts oder Mapper anlegen, wenn bereits etwas vorhanden ist
- Root Cause Fixes statt Symptombehandlung

## Daten und Supabase
- Supabase ist die führende Datenquelle
- Datenmodelle und Types immer an den echten Vertrag anlehnen
- Keine UI Felder anzeigen oder speichern, die im echten Vertrag nicht sauber unterstützt werden
- `is_public` als echte Produktlogik behandeln, nicht als rein visuelle Flag
- Keine harten Mockannahmen über Datensätze treffen
- Bei Fehlern zuerst echten Read und Write Pfad prüfen
- RLS, Permissions, Filter und Query Verhalten immer mitdenken

## React Query Regeln
- TanStack React Query ist der Standard für Server State
- Keine ad hoc fetch Logik einführen, wenn der bestehende Query Weg genutzt werden kann
- Nach Mutations nur die relevanten Queries gezielt invalidieren
- Keine unnötig globalen Invalidations
- Query Keys konsistent halten
- Loading, Error und Empty States immer sauber behandeln
- Datenkonsistenz ist wichtiger als vermeintlich clevere Optimistic Updates

## Routing Regeln
- React Router v7 respektieren
- Routen klein und klar halten
- Code Splitting auf Route Ebene beibehalten
- Keine unnötigen Deeply Nested Workarounds bauen
- Navigation muss auf Mobil und Desktop nachvollziehbar bleiben
- Rezeptdetail und Listenfluss dürfen durch Änderungen nicht unklar werden

## UI und UX Regeln
NuVio Taste soll modern, hochwertig und ruhig wirken.
Designrichtung:
- minimalistisch
- aufgeräumt
- hochwertige Abstände
- gute Lesbarkeit
- sanfte Animationen statt auffälliger Effekte
- klare visuelle Hierarchie
- mobile first denken

Wichtige Regeln:
- keine überladene UI
- keine aggressiven Farben oder verspielte Komponenten ohne Produktgrund
- Framer Motion nur subtil einsetzen
- keine Animation um der Animation willen
- jede Oberfläche muss Zustände klar kommunizieren: loading, empty, error, success
- Zutaten, Schritte, Zeiten und Kerndaten eines Rezepts müssen schnell erfassbar sein

## Copy und Inhaltsregeln
- Endnutzertexte klar, natürlich und verständlich formulieren
- keine unnötig technischen Begriffe in der UI
- unklare Begriffe wie „Meta“ nur verwenden, wenn sie für Nutzer wirklich verständlich sind
- Labels und Sektionen eher produktnah und selbsterklärend benennen
- Texte sollen wertig, ruhig und modern klingen, nicht werblich oder generisch

## Styling Regeln
- Tailwind CSS v4 als Standard nutzen
- bestehende Utility Patterns respektieren
- keine wilden Einzellösungen mit Inline Styles, wenn es sauber mit Tailwind geht
- spacing, typography und states konsistent halten
- NuVio Stil beibehalten
- Branding der App respektieren, inklusive eigenständiger NuVio Taste Identität
- visuelle Änderungen immer auf Desktop und Mobil mitdenken

## Komponentenregeln
- Komponenten klein und fokussiert halten
- keine God Components erzeugen
- Präsentation und Datenlogik nur trennen, wenn es echten Nutzen bringt
- vorhandene gemeinsame Komponenten bevorzugt wiederverwenden
- keine neue Abstraktion einführen, wenn sie nur für einen Einzelfall dient

## Formulare und Mutations
- Defaults, Validation, Submit Flow und Success Error Handling immer vollständig prüfen
- keine stillen Fails
- UI muss bei Fehlern nachvollziehbar bleiben
- nach Create oder Update muss die Datenlage im UI konsistent sein
- Formzustände nicht unnötig kompliziert machen

## Rezepte und Inhaltsstruktur
Bei Arbeiten an Rezepten, Kategorien oder Detailseiten immer auf diese Kernpunkte achten:
- Rezepte müssen schnell scanbar sein
- wichtige Infos müssen ohne Sucharbeit sichtbar sein
- Kategorien und Filter dürfen die Orientierung verbessern, nicht verschlechtern
- Detailseiten sollen Lesefluss und Küchenpraxis unterstützen
- Beispieldaten oder CSV Imports dürfen nicht das echte Produktmodell verwässern

## Performance
- Performance ist Produktqualität
- unnötige Re Renders vermeiden
- Route Splitting beibehalten
- nur dort lazy laden, wo es wirklich sinnvoll ist
- keine unnötig schweren Libraries ergänzen
- Supabase Requests und Query Verhalten bewusst halten
- Vercel Deployment und Produktionsverhalten immer mitdenken

## Fehlerbild und Debugging Priorität
Wenn etwas kaputt ist, immer in dieser Reihenfolge prüfen:
1. Env Variablen
2. Supabase Verbindung und Antwort
3. RLS oder Berechtigungen
4. Query Key und Invalidation
5. Type Mapping und Datenvertrag
6. Routing und Ladefluss
7. Render Logik
8. Styling oder rein visuelle Symptome

Wichtige bekannte Sensibilität:
- fehlende Env Variablen können zu White Screen Verhalten führen
- relevante Variablen:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY`

## No Go Regeln
- keine neuen Dependencies ohne klaren Grund
- keine großflächigen Formatierungsänderungen ohne funktionalen Nutzen
- keine Umbenennungsorgien
- keine toten abstrahierten Helper, die niemand braucht
- keine Halblösungen, die UX technisch schlechter machen
- keine Fake Datenhaltung neben Supabase
- keine Inkonsistenz zwischen Types, Query Daten und UI

## Verifikation nach Änderungen
Nach jeder relevanten Änderung möglichst in dieser Reihenfolge prüfen:
1. Typecheck
2. Lint
3. Build
4. gezielter Smoke Test des betroffenen Flows

Zu prüfen je nach Änderung:
- App startet ohne White Screen
- Navigation funktioniert
- Kategorienansicht lädt
- Rezeptübersicht lädt
- Rezeptdetail zeigt sinnvolle Daten
- Public Sichtbarkeit verhält sich korrekt
- Mutations aktualisieren die relevanten Ansichten sauber
- Loading, Empty und Error States bleiben intakt

## Arbeitsstil für Codex
- erst relevante Dateien lesen, dann ändern
- kleine Diffs bevorzugen
- nur betroffene Dateien anfassen
- bestehende Patterns erkennen und weiterführen
- keine voreiligen Großumbauten
- bei Unsicherheit den Codevertrag aus bestehenden Dateien ableiten
- Antworten kurz, konkret und technisch sauber halten

## Abschlussformat nach Änderungen
Nach abgeschlossener Arbeit immer knapp liefern:
- Root Cause
- geänderte Dateien
- was jetzt anders ist
- was verifiziert wurde
- offener Risiko oder nächster kleinster Schritt

## Aktuelle Fokusrichtung
Bei Entscheidungen im Zweifel diese Reihenfolge priorisieren:
1. Datenkonsistenz
2. funktionierende UX
3. Wartbarkeit
4. Performance
5. visuelle Veredelung

Bestehende TODO Richtung respektieren, insbesondere:
- React Query Konsolidierung
- saubere Invalidations
- sinnvolles Code Splitting
- robuste Fehlerbehandlung