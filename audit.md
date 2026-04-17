# Projekt Audit – 2026-04-16T22:10:00+02:00

---

## Executive Summary

**Gesamtzustand:** Technisch solide. Das Projekt ist ein gut strukturierter, feature-vollständiger MVP auf modernem Stack. P0-Findings, Stripe-Integration und Performance-Grundoptimierungen sind erledigt. Verbleibende Findings sind P1–P3 mit Fokus auf Wartbarkeit, Test-Coverage und UX-Details.

---

## Audit Findings

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

## [P2] Keine Tests für Cooking-Mode-Features

**Bereich:** Code Quality  
**Betroffene Dateien:** `src/components/recipes/CookingMode.tsx`, `src/components/recipes/CookingModePickerSheet.tsx`  
**Problem:** CookingMode und CookingModePickerSheet wurden in letzter Session hinzugefügt, haben aber keine Tests. Timer-Logik, rAF-Animation, Notification-API-Calls sind komplex und fehleranfällig.  
**Warum das problematisch ist:** Timer-Regressions werden nicht automatisch erkannt.  
**Auswirkung:** Bugs in Kernfeature unentdeckt.  
**Empfohlene Lösung:** Unit-Tests für Timer-State-Logik (start/pause/resume/complete), Integrationstest für Picker-Sheet Tab-Wechsel.  
**Aufwand:** mittel  
**Impact:** mittel

---

## [P2] `RecipeCard`-Test testet veraltetes Rendering-Verhalten

**Bereich:** Code Quality  
**Betroffene Dateien:** `src/test/integration/RecipeCard.test.tsx`  
**Problem:** Tests wurden nicht konsequent mit UI-Änderungen mitgepflegt. Das Risiko weiterer veralteter Assertions steigt mit jeder UI-Session.  
**Warum das problematisch ist:** Tests die nicht auf dem aktuellen Verhalten basieren geben falsche Sicherheit.  
**Auswirkung:** Vertrauensverlust in die Testsuite.  
**Empfohlene Lösung:** Konvention: UI-Änderungen die Rendering-Text ändern → Test in gleicher PR aktualisieren.  
**Aufwand:** klein  
**Impact:** mittel

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

## Abschlussabschnitt

### Verbleibende Strategische Baustellen

1. **Komponenten-Splits**: `NavDrawer` aufbrechen. Touch-Logik zwischen NavDrawer und `useSwipeBack` konsolidieren.
2. **Test-Coverage für neue Features**: CookingMode hat keine Tests.
3. **RecipeCreateModal intern aufteilen**: Lazy loading ist erledigt, aber die Komponente bleibt groß — IngredientFields, StepFields als Subkomponenten wären wartbarer.

### Empfohlene Umsetzungsreihenfolge

**Kurzfristig:**
- Bild-Upload-Fehler in RecipeCreateModal sichtbar machen
- NavDrawer aufbrechen + Touch-Logik konsolidieren

**Mittelfristig:**
- CookingMode Tests
- RecipeCreateModal intern aufteilen

**Langfristig:**
- Virtualisierung für große Rezeptlisten
- README
