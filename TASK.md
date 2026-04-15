# TASKS.md

## Projekt
NuVio Taste

## Zweck dieser Datei
Diese Datei hält die aktuelle Aufgabenlogik für NuVio Taste fest.
Sie dient als operative Arbeitsgrundlage für die nächsten Entwicklungsschritte.

Wichtig:
- immer den kleinsten sinnvollen nächsten Schritt priorisieren
- keine unnötigen Refactors
- keine Scope Explosion
- Stabilität, UX und Wartbarkeit vor Feature Masse

---

## JETZT

### 1. Kernflows stabilisieren
Ziel:
Die wichtigsten Nutzerwege müssen stabil, klar und alltagstauglich funktionieren.

Fokus:
- Rezeptübersicht
- Rezeptdetail
- Favoriten
- Navigation
- Ladezustände
- Fehlerzustände
- Leerzustände

Erwartung:
Diese Bereiche müssen logisch, verständlich und mobil angenehm funktionieren.

---

### 2. Rezeptübersicht verbessern
Ziel:
Die Übersicht soll schnell erfassbar und in echter Nutzung hilfreich sein.

Prüfen:
- Scanbarkeit
- Kartenaufbau
- visuelle Hierarchie
- mobile Nutzbarkeit
- Klarheit der wichtigsten Infos
- unnötige visuelle Unruhe

Frage:
Kann ein Nutzer schnell entscheiden, welches Rezept relevant ist?

---

### 3. Rezeptdetailseite stärken
Ziel:
Die Detailansicht soll in echter Küchennutzung klar, lesbar und praktisch sein.

Prüfen:
- Reihenfolge der Inhalte
- Lesbarkeit
- Informationsdichte
- mobile Darstellung
- Orientierung innerhalb der Seite
- Fokus auf die nächste sinnvolle Aktion

Frage:
Kann der Nutzer das Rezept schnell verstehen und direkt nutzen?

---

### 4. Favoriten als Kernnutzen behandeln
Ziel:
Favoriten dürfen kein Nebenfeature sein, sondern müssen ein klarer Produktwert werden.

Prüfen:
- Wie schnell kann gespeichert werden
- Wie schnell kann wiedergefunden werden
- Ist die Favoritenlogik verständlich
- Ist die Interaktion angenehm
- Fehlen sinnvolle Zustände oder Hinweise

---

### 5. Statusdarstellung sauber machen
Ziel:
Loading, Error, Empty und Success States sollen bewusst gestaltet sein.

Prüfen:
- Gibt es harte Brüche im UI
- Sind Zustände klar verständlich
- Gibt es inkonsistente Zustände
- Werden Fehler hilfreich kommuniziert
- Sind leere Ansichten sinnvoll nutzbar

---

## ALS NÄCHSTES

### 6. Veggie und Vegan Labels integrieren
Ziel:
Rezepte sollen sinnvoll gekennzeichnet werden.

Wichtig:
- Labels sollen echten Nutzwert haben
- nicht nur dekorativ
- konsistent in Übersicht und Detailansicht
- Datenmodell nicht erfinden, nur reale Struktur nutzen

---

### 7. Filter und Kategorien schärfen
Ziel:
Filter und Kategorien sollen bei echten Alltagsentscheidungen helfen.

Prüfen:
- was hilft wirklich
- was ist nur theoretisch nett
- welche Struktur reduziert Suchaufwand
- welche Kategorien sind verständlich

---

### 8. Wiederfinden verbessern
Ziel:
Der Nutzer soll wichtige Rezepte schnell erneut finden.

Mögliche Richtungen:
- Favoriten besser zugänglich machen
- zuletzt genutzt
- sinnvolle Gruppierung
- bessere Navigationspunkte

Wichtig:
Nur umsetzen, wenn der Nutzen klar ist.

---

### 9. UX Texte und Microcopy verbessern
Ziel:
Texte sollen klar, kurz und hilfreich sein.

Prüfen:
- Buttons
- leere Zustände
- Fehlertexte
- Hinweise
- Labels
- Sektionstitel

---

## DANACH

### 10. Produktseite für taste.nuviolabs.de planen
Ziel:
Die Produktseite soll klar erklären, warum NuVio Taste existiert und welchen echten Nutzen sie bietet.

Fokus:
- Problem klassischer Rezept Apps
- Nutzen im Alltag
- klare Value Proposition
- ruhige, hochwertige Präsentation
- klare Trennung zur eigentlichen App

---

### 11. Struktur App vs Produktseite sauber trennen
Ziel:
Es soll fachlich und technisch klar sein:

- taste.nuviolabs.de = Produktseite
- tasteapp.nuviolabs.de = eigentliche App

Prüfen:
- Informationsarchitektur
- Routing oder Deployment Logik
- konsistente Kommunikation

---

### 12. Produktidentität schärfen
Ziel:
NuVio Taste soll als echte Küchen App erkennbar werden.

Fokus:
- Orientierung
- Wiederfinden
- Alltagshilfe
- ruhige UX
- kein Feature Overload

---

## GEPARKT

Diese Themen sind aktuell nicht Priorität 1 und sollen nur bearbeitet werden, wenn Kernprodukt und Kernflows sauber sind.

### Geparkt
- große Design Experimente
- unnötige Animationen
- komplexe Personalisierung
- zusätzliche Features ohne klaren Alltagsnutzen
- neue Libraries ohne zwingenden Grund
- große Architekturumbauten
- aggressive Optimierungsmaßnahmen ohne Produktmehrwert

---

## ARBEITSREGELN

### Allgemein
- immer kleinster sinnvoller Schritt zuerst
- keine unnötigen Refactors
- keine neuen Patterns ohne klaren Mehrwert
- bestehende Struktur respektieren
- mobile first
- reale Nutzung wichtiger als Theorie

### Bei Code Änderungen
- nur relevante Dateien anfassen
- Änderungen minimalinvasiv halten
- Build mitdenken
- Lint mitdenken
- zentrale Nutzerflüsse gegenprüfen

### Bei Produktentscheidungen
- Nutzen vor Deko
- Klarheit vor Komplexität
- Alltag vor Spielerei
- Orientierung vor Effekten

---

## DEFINITION FÜR PRIORITÄT

### Hohe Priorität
Aufgaben, die:
- Kernflows stabiler machen
- UX direkt verbessern
- Orientierung verbessern
- Wiederfinden stärken
- Fehler oder Reibung reduzieren

### Niedrige Priorität
Aufgaben, die:
- nur optisch nett sind
- keinen klaren Produktnutzen bringen
- den Scope unnötig vergrößern
- bestehende Logik unnötig umbauen

---

## EMPFOHLENER ARBEITSMODUS FÜR CLAUDE

Wenn keine konkrete Einzelaufgabe genannt wird:
1. zuerst den Bereich mit dem größten Hebel identifizieren
2. den kleinsten sinnvollen Schritt wählen
3. nur betroffene Dateien nennen
4. keine große Umbauidee liefern
5. Risiko und Prüfpunkt mitdenken

---

## NÄCHSTER EMPFOHLENER FOKUS
Der wahrscheinlich sinnvollste nächste Arbeitsblock ist:

1. Rezeptübersicht prüfen und verbessern
2. danach Rezeptdetailseite
3. danach Favoritenlogik
4. danach Statusdarstellung
5. danach Labels und Filter

---

## KURZREGEL
NuVio Taste soll nicht einfach mehr können, sondern im echten Küchenalltag spürbar besser helfen.