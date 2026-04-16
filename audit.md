# Projekt Audit – 2026-04-16T22:10:00+02:00

---

## Executive Summary

**Gesamtzustand:** Technisch solide. Das Projekt ist ein gut strukturierter, feature-vollständiger MVP auf modernem Stack. Code-Qualität und Architektur sind überdurchschnittlich gut. Es gibt keine katastrophalen Probleme, aber drei konkrete Blocker die den Lint-Check und einen Test brechen, sowie mehrere UX- und Performance-Risiken die im Alltag spürbar sein werden.

**Die 5 wichtigsten Probleme:**
1. **Lint bricht den CI-Build** — 3 ESLint-Errors, darunter ein `setState` im Effect-Body der Cascading-Renders verursacht
2. **Fehlgeschlagener Test** — `RecipeCard.test.tsx` erwartet "4 Portionen", Component rendert jetzt "4 Port." — Regression aus letzter Session
3. **Haupt-Bundle 301 kB (gzip)** — kein tree-shaking auf Supabase/Lucide-Imports, keine Lazy-Loading-Prüfung des zentralen Chunks
4. **`RecipeCreateModal` ist 295+ Zeilen, 114 kB gebaut** — größter Chunk nach dem Main-Bundle, nicht gesplittet
5. **`DashboardPage` — `recentRecipes` fehlt in `useMemo`-Dependency** — Stale-Daten können angezeigt werden

**Technische Gesamtbewertung:** Solide

---

## Audit Findings

---

## [P0] Lint-Break: `setState` synchron in `useEffect`

**Bereich:** Code Quality  
**Betroffene Dateien:** `src/components/InstallPrompt.tsx:36`  
**Problem:** `setShowIOSGuide(true)` wird direkt im Effect-Body aufgerufen, nicht in einem Callback.  
**Warum das problematisch ist:** Verursacht Cascading-Renders. ESLint-Regel `react-hooks/set-state-in-effect` wirft Error. Lint-Skript schlägt fehl, CI-Pipeline bricht.  
**Auswirkung:** Build-Pipeline kann nicht durchlaufen. Jeder PR-Check schlägt fehl.  
**Empfohlene Lösung:**
```tsx
// Ersetze useState + useEffect durch lazy initializer:
const [showIOSGuide] = useState(() => isIOS() && !isInStandalone());
```
**Aufwand:** klein  
**Impact:** hoch

---

## [P0] Lint-Break: Unused Import in CookingModePickerSheet

**Bereich:** Code Quality  
**Betroffene Dateien:** `src/components/recipes/CookingModePickerSheet.tsx:10`  
**Problem:** `RecipeListItem` wird importiert aber nie verwendet.  
**Warum das problematisch ist:** `@typescript-eslint/no-unused-vars` wirft Error, Lint bricht.  
**Auswirkung:** CI-Pipeline schlägt fehl.  
**Empfohlene Lösung:** Import entfernen.  
**Aufwand:** klein  
**Impact:** hoch

---

## [P0] Lint-Break: Unused Parameter in `shoppingListService.ts`

**Bereich:** Code Quality  
**Betroffene Dateien:** `src/features/shopping-list/shoppingListService.ts:27`  
**Problem:** Parameter `userId` wird deklariert aber nicht verwendet.  
**Warum das problematisch ist:** `@typescript-eslint/no-unused-vars` wirft Error.  
**Auswirkung:** CI-Pipeline schlägt fehl.  
**Empfohlene Lösung:** In `_userId` umbenennen oder entfernen falls wirklich nicht gebraucht.  
**Aufwand:** klein  
**Impact:** hoch

---

## [P0] Test-Regression: RecipeCard rendert "Port." statt "Portionen"

**Bereich:** Code Quality  
**Betroffene Dateien:** `src/test/integration/RecipeCard.test.tsx:108`, `src/components/recipes/RecipeCard.tsx:181`  
**Problem:** Test erwartet `/4 Portionen/`, Component rendert `${recipe.servings} Port.` — Texte wurden in letzter Session geändert ohne den Test zu aktualisieren.  
**Warum das problematisch ist:** `npm test` schlägt fehl. 1 von 11 Tests in `RecipeCard.test.tsx` bricht.  
**Auswirkung:** Falsche Regressionssignale, CI unzuverlässig.  
**Empfohlene Lösung:** Test auf `/4 Port\./` aktualisieren.  
**Aufwand:** klein  
**Impact:** hoch

---

## [P1] `DashboardPage` — `recentRecipes` fehlt in useMemo-Dependencies

**Bereich:** Code Quality  
**Betroffene Dateien:** `src/pages/DashboardPage.tsx:260–269`  
**Problem:** `recentRecipes` wird außerhalb des `useMemo`-Hooks initialisiert, aber nicht in das Dependency-Array eingetragen. React-Hooks-ESLint-Regel meldet Warning.  
**Warum das problematisch ist:** Das Memo kann mit veralteten Rezeptdaten berechnet werden wenn sich `data` ändert ohne dass `recentlyViewedIds` sich ändert.  
**Auswirkung:** Nutzer sieht veraltete "Zuletzt angesehen"-Liste nach Refresh.  
**Empfohlene Lösung:** `recentRecipes` selbst mit `useMemo` wrappen oder direkt `data?.recentRecipes ?? []` ins Inner-Memo ziehen.  
**Aufwand:** klein  
**Impact:** mittel

---

## [P1] Haupt-Bundle 301 kB (gzip 91 kB) ohne erkennbares Splitting

**Bereich:** Performance  
**Betroffene Dateien:** `dist/assets/index-D6VklE27.js` (301 kB), Build-Output  
**Problem:** Der zentrale `index`-Chunk enthält 301 kB komprimierten Code. Supabase-Client, React-Router, TanStack-Query, Framer-Motion landen wahrscheinlich alle darin gemeinsam.  
**Warum das problematisch ist:** Auf mobilen Geräten mit langsamer Verbindung blockiert dieser Chunk den First Contentful Paint. Gzip auf 91 kB ist akzeptabel, aber Parse-Zeit auf Low-End-Geräten bleibt ein Risiko.  
**Auswirkung:** Verzögerter App-Start auf Mobile, schlechtere Lighthouse-Performance-Score.  
**Empfohlene Lösung:** Vite `build.rollupOptions.output.manualChunks` konfigurieren um Supabase, Framer-Motion und Query in separate Vendor-Chunks zu splitten.  
**Aufwand:** mittel  
**Impact:** mittel

---

## [P1] `RecipeCreateModal` — 114 kB Chunk, Komponente zu groß

**Bereich:** Performance / Code Quality  
**Betroffene Dateien:** `dist/assets/RecipeCreateModal-B5VMhI6D.js` (114 kB), `src/components/recipes/RecipeCreateModal.tsx`  
**Problem:** `RecipeCreateModal` ist der zweitgrößte Chunk nach dem Main-Bundle. Die Komponente enthält Formular-Logik, Zutaten-Management, Schritt-Management, Bild-Upload und Validierung in einer Datei.  
**Warum das problematisch ist:** Wird sofort mitgeladen obwohl der Nutzer meistens nur liest. Schwer zu warten und zu testen.  
**Auswirkung:** Unnötige Bundle-Größe beim initialen Load, hohe Kognitionslast beim Lesen des Codes.  
**Empfohlene Lösung:** Dynamischer Import (`React.lazy`) für das Modal — es wird selten gebraucht. Intern in Subkomponenten aufteilen (IngredientFields, StepFields).  
**Aufwand:** mittel  
**Impact:** mittel

---

## [P1] `auth-service` Chunk 185 kB — Supabase-Client nicht tree-shaked

**Bereich:** Performance  
**Betroffene Dateien:** `dist/assets/auth-service-CcjL6UUP.js` (185 kB gzip 48 kB)  
**Problem:** Der Auth-Service zieht fast den gesamten Supabase-Client rein. 185 kB für einen Service der nur bei Login/Logout aktiv ist.  
**Warum das problematisch ist:** Supabase JS v2 ist tree-shakeable wenn korrekt importiert. Der aktuelle Import könnte den ganzen Client mitziehen.  
**Auswirkung:** Unnötige Initial-Load-Größe.  
**Empfohlene Lösung:** Prüfen ob `@supabase/supabase-js` spezifische Named-Exports nutzt oder ob `createClient` bereits minimal ist. Chunk über `manualChunks` in eigenen Vendor-Chunk verschieben.  
**Aufwand:** mittel  
**Impact:** mittel

---

## [P1] Fehlende `aria-live`-Region im Kochmodus-Timer

**Bereich:** Accessibility  
**Betroffene Dateien:** `src/components/recipes/CookingMode.tsx`  
**Problem:** Der laufende Timer zeigt Sekunden/Minuten an, aber kein `aria-live`-Attribut informiert Screen-Reader-Nutzer über Änderungen. Der Ablauf-Alarm ist nur visuell/auditiv.  
**Warum das problematisch ist:** Nutzer mit Seheinschränkungen können den Timer-Zustand nicht verfolgen.  
**Auswirkung:** Accessibility-Verstoß in einem Feature das explizit Küchennutzung unterstützt (Hände können belegt sein → Voice/Screen-Reader-Nutzung wahrscheinlich).  
**Empfohlene Lösung:** Timer-Anzeige mit `aria-live="polite"` und `aria-atomic="true"` wrappen. Alternativ nur beim Ablauf einen `role="alert"` setzen.  
**Aufwand:** klein  
**Impact:** mittel

---

## [P1] Touch-Gesten-Logik dupliziert in NavDrawer und useSwipeBack

**Bereich:** Code Quality / Architektur  
**Betroffene Dateien:** `src/components/layout/NavDrawer.tsx`, `src/hooks/useSwipeBack.ts`  
**Problem:** `NavDrawer.tsx` implementiert eigene Touch-Swipe-Erkennung (touchStart/touchMove/touchEnd mit EDGE_THRESHOLD, MIN_X, Richtungserkennung) parallel zu `useSwipeBack.ts` das fast die gleiche Logik enthält.  
**Warum das problematisch ist:** Zwei Stellen mit fast identischer Logik → Bugfixes müssen doppelt gemacht werden. Verhaltensunterschiede entstehen schleichend.  
**Auswirkung:** Wartungsrisiko, inkonsistentes Swipe-Verhalten.  
**Empfohlene Lösung:** `useSwipeGesture(onSwipeRight, options)` Hook extrahieren, beide Stellen nutzen ihn.  
**Aufwand:** mittel  
**Impact:** mittel

---

## [P1] `NavDrawer.tsx` — 399 Zeilen, zu viel Verantwortung

**Bereich:** Code Quality  
**Betroffene Dateien:** `src/components/layout/NavDrawer.tsx`  
**Problem:** Komponente enthält: Touch-Gesture-Erkennung, Keyboard-Handling, Route-Prefetching, komplexes Styling, Nav-Item-Rendering, Pro-Badge-Logik, gesperrte-Feature-Anzeige. Alles in einer Datei.  
**Warum das problematisch ist:** Schwer zu lesen, zu testen und zu erweitern. Einzelne Änderungen können unerwartete Seiteneffekte haben.  
**Auswirkung:** Wartungsrisiko bei Weiterentwicklung.  
**Empfohlene Lösung:** Nav-Item-Rendering in `NavItem.tsx` auslagern, Touch-Logik in Hook.  
**Aufwand:** mittel  
**Impact:** mittel

---

## [P2] `RecipeCard`-Test testet veraltetes Rendering-Verhalten

**Bereich:** Code Quality  
**Betroffene Dateien:** `src/test/integration/RecipeCard.test.tsx`  
**Problem:** Über den Portionen-Fehler hinaus: Tests wurden nicht konsequent mit UI-Änderungen mitgepflegt. Das Risiko weiterer veralteter Assertions steigt mit jeder UI-Session.  
**Warum das problematisch ist:** Tests die nicht auf dem aktuellen Verhalten basieren geben falsche Sicherheit.  
**Auswirkung:** Vertrauensverlust in die Testsuite.  
**Empfohlene Lösung:** Konvention: UI-Änderungen die Rendering-Text ändern → Test in gleicher PR aktualisieren.  
**Aufwand:** klein  
**Impact:** mittel

---

## [P2] Keine Tests für Cooking-Mode-Features

**Bereich:** Code Quality  
**Betroffene Dateien:** `src/components/recipes/CookingMode.tsx`, `src/components/recipes/CookingModePickerSheet.tsx`  
**Problem:** CookingMode und CookingModePickerSheet wurden in letzter Session hinzugefügt, haben aber keine Tests. Timer-Logik, rAF-Animation, Notification-API-Calls sind komplex und fehleranfällig.  
**Warum das problematisch ist:** Timer-Regressions (z.B. der bereits aufgetretene Arc-Jump) werden nicht automatisch erkannt.  
**Auswirkung:** Bugs in Kernfeature unentdeckt.  
**Empfohlene Lösung:** Unit-Tests für Timer-State-Logik (start/pause/resume/complete), Integrationstest für Picker-Sheet Tab-Wechsel.  
**Aufwand:** mittel  
**Impact:** mittel

---

## [P2] Kein Bild-Optimierungs-Pipeline

**Bereich:** Performance  
**Betroffene Dateien:** `src/features/recipes/recipeService.ts`, Supabase Storage  
**Problem:** Rezept-Bilder werden direkt von Supabase Storage geladen ohne Resize, Format-Konvertierung (WebP) oder responsive `srcset`. Auf Mobile wird das gleiche große Bild geladen wie auf Desktop.  
**Warum das problematisch ist:** Langsame Bildladezeiten auf Mobile, hoher Datenverbrauch.  
**Auswirkung:** Schlechtere Performance auf mobilen Geräten — dem primären Nutzungskontext.  
**Empfohlene Lösung:** Supabase Storage Image Transformations nutzen (`?width=800&quality=80&format=webp`). Unterschiedliche Größen für Card vs. Detail-Ansicht.  
**Aufwand:** klein  
**Impact:** hoch

---

## [P2] Fehlende Virtualisierung für lange Rezeptlisten

**Bereich:** Performance  
**Betroffene Dateien:** `src/pages/RecipesPage.tsx`  
**Problem:** Pagination ist auf 24 Einträge gesetzt. Alle 24 Cards werden gleichzeitig gerendert mit Framer-Motion-Wrapping. Bei wachsendem Datenbestand und vielen Rezepten steigt die DOM-Größe.  
**Warum das problematisch ist:** Framer-Motion per Card erhöht Layout-Kosten. 24 Cards mit Bildern können auf Low-End-Geräten Scroll-Jank verursachen.  
**Auswirkung:** Performance-Degradation bei vielen Rezepten.  
**Empfohlene Lösung:** Kurzfristig: `motion.div` aus `RecipeCard` entfernen oder auf reine CSS-Transition wechseln. Langfristig: `@tanstack/react-virtual` für Scroll-Virtualisierung.  
**Aufwand:** mittel  
**Impact:** mittel

---

## [P2] Fehlende Error-Tracking-Integration

**Bereich:** Architektur  
**Betroffene Dateien:** `src/components/ui/ErrorBoundary.tsx`, `src/App.tsx`  
**Problem:** ErrorBoundary loggt Fehler nur auf `console.error`. Kein Sentry oder vergleichbares Tool. Produktionsfehler sind unsichtbar.  
**Warum das problematisch ist:** In Produktion mit echten Nutzern bemerkt man Crashes erst wenn jemand meldet.  
**Auswirkung:** Blinde Flecken in der Produktionsqualität.  
**Empfohlene Lösung:** Sentry oder Vercel Error Monitoring integrieren. `componentDidCatch` in ErrorBoundary für Sentry-Event nutzen.  
**Aufwand:** klein  
**Impact:** hoch

---

## [P2] Unlock-Flow führt auf leere Seite ohne Plan-Upgrade

**Bereich:** UX  
**Betroffene Dateien:** `src/features/plan/entitlements.ts`, `src/components/layout/ProtectedLayout.tsx`  
**Problem:** `entitlements.ts` enthält einen TODO-Kommentar für Zahlungsintegration. Der aktuelle "Upgrade"-Flow öffnet ein Modal, aber es gibt keine funktionierende Zahlungsmethode. Nutzer die auf Pro-Features stoßen landen in einer Sackgasse.  
**Warum das problematisch ist:** Conversion-Killer. Motivierter Nutzer will upgraden → kein funktionaler Weg → Frustration.  
**Auswirkung:** Verpasste Monetarisierung, schlechte UX.  
**Empfohlene Lösung:** Stripe Checkout als nächsten Schritt priorisieren. Bis dahin: klarer Hinweis "Coming soon" oder Kontakt-E-Mail im Upgrade-Modal.  
**Aufwand:** hoch  
**Impact:** hoch

---

## [P2] Kein Feedback wenn Bild-Upload fehlschlägt

**Bereich:** UX  
**Betroffene Dateien:** `src/components/recipes/RecipeCreateModal.tsx`  
**Problem:** Annahme basierend auf Komponentengröße und typischem Supabase-Upload-Muster — Bild-Upload-Fehler könnten silent fail wenn der Error nicht explizit in der UI surfaced wird. (Markiert als Annahme — Code nicht vollständig gelesen.)  
**Warum das problematisch ist:** Nutzer denkt Bild wurde gespeichert, Rezept erscheint ohne Bild.  
**Auswirkung:** Vertrauensverlust, Support-Aufwand.  
**Empfohlene Lösung:** Upload-Error explizit in Formular-UI anzeigen. Retry-Option.  
**Aufwand:** klein  
**Impact:** mittel

---

## [P2] `useSwipeBack`-Hook wird nirgendwo verwendet

**Bereich:** Code Quality  
**Betroffene Dateien:** `src/hooks/useSwipeBack.ts`  
**Problem:** Der Hook existiert und enthält saubere Swipe-Logik, wird aber scheinbar nicht in einer Komponente eingesetzt — NavDrawer implementiert seine eigene Swipe-Logik statt ihn zu nutzen.  
**Warum das problematisch ist:** Toter Code erhöht Komplexität und verwirrt zukünftige Entwickler.  
**Auswirkung:** Wartungsrisiko.  
**Empfohlene Lösung:** Entweder NavDrawer auf `useSwipeBack` umstellen oder den Hook entfernen.  
**Aufwand:** klein  
**Impact:** niedrig

---

## [P2] Unused ESLint-Disable-Direktiven

**Bereich:** Code Quality  
**Betroffene Dateien:** `src/components/recipes/CookingMode.tsx:102`, `src/components/recipes/RecipeCreateModal.tsx:296`  
**Problem:** Zwei `eslint-disable`-Kommentare unterdrücken Regeln die dort gar nicht mehr gelten. ESLint warnt darüber.  
**Warum das problematisch ist:** Lint-Warnings im Output verdecken echte Probleme, Kommentare verwiesen auf Probleme die nicht mehr existieren.  
**Auswirkung:** Code-Rauschen.  
**Empfohlene Lösung:** Beide Kommentare entfernen.  
**Aufwand:** klein  
**Impact:** niedrig

---

## [P3] RecipeCard zeigt Visibility-Badge doppelt an

**Bereich:** UI  
**Betroffene Dateien:** `src/components/recipes/RecipeCard.tsx`  
**Problem:** In `RecipeCard` wird "Öffentlich"/"Privat" zweimal angezeigt: einmal als Badge oben rechts im Text-Bereich (Zeile ~107) und einmal als Pill mit Icon in den Meta-Pills (Zeile ~183). Redundante Information nimmt wertvollen Platz weg.  
**Warum das problematisch ist:** Visuelles Rauschen, Card wirkt überladen.  
**Auswirkung:** Schlechtere Scanbarkeit.  
**Empfohlene Lösung:** Den oberen Badge entfernen, die Pill mit Icon reicht.  
**Aufwand:** klein  
**Impact:** mittel

---

## [P3] iOS-Emoji-Pill-Fixes nicht committed

**Bereich:** UI / Responsiveness  
**Betroffene Dateien:** `src/components/recipes/RecipeFilters.tsx`, `src/components/recipes/RecipeCard.tsx`, `src/components/recipes/RecipeDetail.tsx`  
**Problem:** Laut Tester sind Emoji-Pills auf Apple-Geräten zu groß (Emoji überläuft die Pill-Höhe) und Abstände zu eng. Fixes wurden implementiert aber explizit nicht committed.  
**Warum das problematisch ist:** Bekannter Bug bleibt in Produktion für iOS-Nutzer.  
**Auswirkung:** Visuell defekte UI auf iOS — dem wahrscheinlich häufigsten Endgerät der Zielgruppe.  
**Empfohlene Lösung:** Nach Tester-Bestätigung der Fixes committen und deployen.  
**Aufwand:** klein  
**Impact:** hoch

---

## [P3] Kein README

**Bereich:** Code Quality  
**Betroffene Dateien:** Projektroot  
**Problem:** Kein `README.md` vorhanden. Weder Setupanleitung noch Projektbeschreibung.  
**Warum das problematisch ist:** Onboarding neuer Entwickler oder Kontributoren erfordert mündliche Übergabe.  
**Auswirkung:** Wissensrisiko bei Team-Wachstum.  
**Empfohlene Lösung:** Minimales README: Projektbeschreibung, Setup-Schritte, Env-Vars, Testbefehl.  
**Aufwand:** klein  
**Impact:** niedrig

---

## [P3] Keine Pagination-Indikatoren / Infinite-Scroll-Feedback

**Bereich:** UX  
**Betroffene Dateien:** `src/pages/RecipesPage.tsx`  
**Problem:** Pagination lädt mehr Rezepte, aber es ist unklar wann das Ende erreicht ist oder wie viele Seiten es gibt. Kein "Ende der Liste"-Signal.  
**Warum das problematisch ist:** Nutzer wissen nicht ob es mehr gibt oder ob alles geladen wurde.  
**Auswirkung:** Orientierungsverlust bei vielen Rezepten.  
**Empfohlene Lösung:** "X von Y Rezepten angezeigt"-Counter, oder "Alle geladen" wenn am Ende.  
**Aufwand:** klein  
**Impact:** niedrig

---

## [P3] `AppShell.tsx` irreführend benannt

**Bereich:** Code Quality  
**Betroffene Dateien:** `src/components/layout/AppShell.tsx`  
**Problem:** `AppShell` klingt wie das Haupt-Layout-Wrapper, ist aber nur ein kleines Desktop-Header-Overlay mit Logout-Button. Das eigentliche Shell-Layout ist in `ProtectedLayout.tsx`.  
**Warum das problematisch ist:** Entwickler suchen die Layout-Logik an der falschen Stelle.  
**Auswirkung:** Orientierungsverlust im Code.  
**Empfohlene Lösung:** Umbenennen in `DesktopHeader` oder `DesktopNavBar`.  
**Aufwand:** klein  
**Impact:** niedrig

---

## Abschlussabschnitt

### Top 10 Quick Wins (sofort umsetzbar, hoher Hebel)

1. **P0 — Lint-Errors fixen** (`InstallPrompt.tsx`, `CookingModePickerSheet.tsx`, `shoppingListService.ts`) — 15 Minuten
2. **P0 — Test-Regression fixen** (`RecipeCard.test.tsx` Portionen-Assertion) — 5 Minuten
3. **P2 — Unused eslint-disable entfernen** (`CookingMode.tsx`, `RecipeCreateModal.tsx`) — 5 Minuten
4. **P1 — `DashboardPage` useMemo-Dependency fixen** — 5 Minuten
5. **P3 — iOS-Pill-Fixes committen** (nach Tester-Bestätigung) — 10 Minuten
6. **P2 — Supabase Image Transformations** für Rezept-Bilder aktivieren — 30 Minuten
7. **P2 — Error-Tracking integrieren** (Sentry Free Tier) — 1 Stunde
8. **P3 — RecipeCard doppelten Visibility-Badge entfernen** — 10 Minuten
9. **P2 — `useSwipeBack` Hook: entweder nutzen oder löschen** — 20 Minuten
10. **P1 — `aria-live` auf Timer-Anzeige** in CookingMode — 15 Minuten

### Top 5 Strategische Baustellen

1. **Bundle-Optimierung**: Vite `manualChunks` konfigurieren, `RecipeCreateModal` lazy laden, Supabase/Framer in Vendor-Chunks isolieren. Kann First-Load-Time deutlich verbessern.

2. **Zahlungsintegration (Stripe)**: Solange der Upgrade-Flow ins Leere führt, ist jedes Pro-Feature-Gating ein Conversion-Killer. Das ist aktuell das größte Produktrisiko.

3. **Komponenten-Splits**: `NavDrawer` und `RecipeCreateModal` aufbrechen. Touch-Logik konsolidieren. Macht die Codebasis langfristig wartbarer wenn das Produkt wächst.

4. **Test-Coverage für neue Features**: CookingMode und CookingModePickerSheet haben keine Tests. Normalisierungs-Logik hat Tests aber Timer-Logik nicht. Mit wachsender Komplexität steigt das Regressions-Risiko.

5. **Performance auf Mobile zementieren**: Bilder optimieren (WebP/Resize via Supabase), Framer-Motion-Overhead auf Cards prüfen, ggf. Virtualisierung evaluieren. Das ist der primäre Nutzungskontext.

### Empfohlene Umsetzungsreihenfolge

**Sofort (diese Woche):**
- P0-Findings fixen (Lint, Test)
- iOS-Pill-Fixes committen nach Tester-OK

**Kurzfristig (nächste 1–2 Wochen):**
- Supabase Image Transformations
- Error Tracking
- Doppelten Badge in RecipeCard entfernen
- useMemo-Dependency in DashboardPage
- aria-live im Timer

**Mittelfristig (nächster Monat):**
- Stripe / Zahlungsintegration (höchste Produkt-Priorität)
- Bundle-Optimierung mit manualChunks
- RecipeCreateModal lazy loading
- Component-Splits für NavDrawer und RecipeCreateModal

**Langfristig:**
- Virtualisierung für große Rezeptlisten
- Umfassendere Test-Coverage
- README
