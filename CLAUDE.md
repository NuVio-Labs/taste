# NuVio Taste

## Projektkontext
NuVio Taste ist eine moderne Rezept und Küchen App.
Die App soll nicht nur inspirieren, sondern im Alltag wirklich helfen.
Der Schwerpunkt liegt auf Nutzbarkeit in echten Küchensituationen, nicht auf Feature Masse.

NuVio Taste soll zur Küchen App werden.
Das bedeutet:
- schnell verständlich
- praktisch im Alltag
- ruhig und klar in der Bedienung
- zuverlässig in den Kernflows
- hilfreich bei Orientierung, Auswahl, Wiederfinden und Kochen

Die Produktidee ist nicht Content Showroom, sondern Küchenbegleiter.

---

## Produktziel
NuVio Taste soll Nutzern helfen:
- passende Rezepte schnell zu finden
- Rezepte leicht zu verstehen
- Favoriten wiederzufinden
- Entscheidungen in Alltagssituationen schneller zu treffen
- beim Kochen weniger Stress zu haben

Der wichtigste Nutzungsfall ist nicht entspanntes Stöbern, sondern die echte Situation:
Der Nutzer hat wenig Zeit, Hunger, Zutaten oder eine konkrete Idee und will schnell zum passenden Ergebnis.

---

## Produktprinzipien
- Nutzen vor Deko
- Klarheit vor Komplexität
- Alltag vor Spielerei
- stabile Kernflows vor Nebenfeatures
- Orientierung vor Überladung
- Produktlogik vor Marketinglogik

---

## Produktvision
NuVio Taste soll langfristig eine vollwertige Küchen App sein, die folgende Bereiche sinnvoll verbindet:
- Rezeptsuche
- Favoriten
- Organisationshilfen
- schnelle Alltagsentscheidungen
- persönliche Relevanz
- klare, ruhige und hochwertige UX

Nicht Ziel:
- möglichst viele Features ohne Zusammenhang
- künstliche Komplexität
- UI nur für Dribbble Optik
- gamifizierte Ablenkung ohne echten Mehrwert

---

## Zielgruppe
Hauptzielgruppe:
- Menschen, die im Alltag schnell und einfach kochen möchten
- Nutzer, die nicht lange suchen oder filtern wollen
- Nutzer, die Rezepte zuverlässig speichern und wiederfinden möchten
- Nutzer, die praktische statt verspielte Küchenunterstützung suchen

---

## Kernproblem
Klassische Rezept Apps scheitern oft im echten Nutzungsmoment:
- zu viel Auswahl
- zu viele Schritte
- zu viel visuelles Rauschen
- schlechte Orientierung
- Favoriten und Wiederfinden zu schwach
- Fokus auf Inspiration statt Ausführung

NuVio Taste soll genau dieses Problem lösen.

---

## Stack
Aktueller technischer Rahmen:
- React
- Vite
- TypeScript
- Tailwind CSS
- Supabase
- TanStack React Query
- React Router

Optional vorhandene oder zukünftige UI und Strukturprinzipien:
- komponentenbasiert
- mobile first
- route orientierte Views
- klare Trennung von Datenzugriff und UI, aber nur wenn sinnvoll
- wiederverwendbare Patterns ohne Overengineering

---

## Architekturblock

### Architekturziele
- klar
- nachvollziehbar
- wartbar
- robust
- möglichst wenig Sonderlogik
- keine unnötige Komplexität

### Grundregeln
- bestehende Projektstruktur respektieren
- keine neue Architektur einführen, wenn der aktuelle Weg tragfähig ist
- nur abstrahieren, wenn es reale Wiederholung oder Wartungsvorteile gibt
- keine Refactors ohne direkten Mehrwert
- Komponenten und Logik nur trennen, wenn es verständlicher oder stabiler wird

### Datenfluss
- Datenzugriffe sollen nachvollziehbar und lokal verständlich sein
- React Query für Server State sauber und konsistent nutzen
- keine doppelten Wahrheiten im Frontend aufbauen
- Loading, Error, Empty und Success States immer bewusst mitdenken
- invalidation gezielt und sparsam einsetzen

### Routing
- Routen nur dann einführen, wenn sie echten Navigationswert haben
- Navigation muss für den Nutzer jederzeit verständlich bleiben
- keine unnötig komplexen View Verschachtelungen
- Rückwege und Orientierung immer mitdenken

### Komponenten
- kleine bis mittelgroße, gut lesbare Komponenten bevorzugen
- zu große Komponenten schrittweise zerlegen
- kein Datei Wildwuchs
- keine voreilige Extraktion
- wiederkehrende UI Muster konsistent halten

### Formulare und Interaktionen
- fehlertolerant
- klar beschriftet
- direkte Rückmeldung
- keine unnötigen Eingaben
- mobiles Verhalten zuerst mitdenken

### Supabase
- niemals Felder, Tabellen oder Beziehungen erfinden
- bei Unsicherheit zuerst reale Struktur prüfen
- Policies und Auth Verhalten respektieren
- Fehler sauber behandeln
- keine Frontend Logik auf unbestätigten DB Annahmen aufbauen

### Styling
- Tailwind klar und konsistent nutzen
- keine Styling Eskalation
- Utility Nutzung mit Struktur
- Komponenten sollen ruhig, klar und hochwertig wirken
- keine unnötige visuelle Komplexität

---

## Design Leitlinien
Der Stil von NuVio Taste soll sein:
- modern
- minimal
- ruhig
- hochwertig
- funktional
- alltagstauglich

### Designregeln
- mobile first
- starke visuelle Hierarchie
- gute Lesbarkeit
- großzügige, aber nicht verschwenderische Abstände
- klare Interaktionspunkte
- reduzierte, gezielte Akzente
- keine aggressive Marketingoptik
- keine überladenen Cards
- keine unnötigen Animationen
- Animation nur bei echtem UX Mehrwert

---

## UX Leitlinien
- der Nutzer will schnell zum Ergebnis
- jede Hauptansicht muss sofort verständlich sein
- Rezepte müssen schnell erfassbar sein
- Favoriten müssen schnell auffindbar sein
- Orientierung ist wichtiger als visuelle Show
- Such und Filterlogik müssen echte Hilfe sein
- Wiederfinden ist wichtiger als endloses Entdecken
- Stressreduktion ist ein Produktziel

### In echter Küchennutzung bedeutet das:
- wenig Reibung
- klare Buttons
- keine langen Denkpausen
- Informationen in sinnvoller Reihenfolge
- gute Scanbarkeit
- Fokus auf nächste sinnvolle Aktion

---

## Roadmap Stand
Die Produktentwicklung folgt nicht dem Prinzip möglichst viele Features zuerst, sondern:
- Kernnutzen zuerst
- Kernflows stabil machen
- dann Mehrwert ergänzen
- dann Produktseite und Vermarktung sauber ausbauen

---

## Produkt Roadmap

### Phase 1: Solides Kernprodukt
Ziel:
Ein stabiles, klares und alltagstaugliches Grundprodukt.

Fokus:
- saubere Rezeptübersicht
- gute Detailansicht
- Favoriten
- verständliche Navigation
- stabile Datenflüsse
- gute mobile Nutzbarkeit
- klare Lade und Fehlerzustände

Wichtig:
Alles, was den Kernflow stört oder unnötig aufbläht, hat hier keine Priorität.

---

### Phase 2: Alltagshilfe statt bloßes Stöbern
Ziel:
NuVio Taste soll den Nutzer im echten Alltag besser unterstützen.

Fokus:
- besseres Wiederfinden
- sinnvollere Organisationslogik
- stärkere Orientierung
- schnellere Entscheidungshilfe
- Kategorien und Labels mit echtem Nutzen

Mögliche Bausteine:
- vegane und vegetarische Labels
- hilfreiche Kennzeichnungen
- bessere Filter
- bessere Favoritenstruktur
- zuletzt genutzt oder schnell wiederfinden

---

### Phase 3: Produktidentität schärfen
Ziel:
NuVio Taste soll sich klar von klassischen Rezept Apps unterscheiden.

Fokus:
- echte Küchenrelevanz
- starke UX im Alltag
- klare Nutzenkommunikation
- Produktseite mit verständlicher Value Proposition
- saubere Abgrenzung von überladenen Rezept Apps

---

### Phase 4: Ausbau mit echten Nutzwert Features
Ziel:
Weitere Funktionen nur dann ergänzen, wenn sie den Alltag messbar verbessern.

Fokus:
- sinnvolle Organisationsfeatures
- relevante Personalisierung
- weiter verbesserte Küchenflows
- alles nur mit echtem Produktnutzen

---

## Aktueller To do Fokus

### Höchste Priorität
- Kernflows stabilisieren
- Rezeptübersicht und Detailansicht klar und stark machen
- Favoriten logisch und angenehm nutzbar machen
- mobile UX prüfen und verbessern
- Lade, Fehler und Leerzustände bewusst sauber machen
- Produktlogik im Frontend klar halten

### Mittlere Priorität
- vegane und vegetarische Labels integrieren
- Filter und Kategorisierung in echten Nutzwert übersetzen
- Wiederfinden von Rezepten verbessern
- Copy und UX Texte schärfen
- Interaktionslogik vereinheitlichen

### Danach
- Produktseite unter taste.nuviolabs.de sauber aufbauen
- eigentliche App auf eigener klarer Subdomain sauber trennen
- Nutzenkommunikation auf Produktseite schärfen
- Feature Erklärung verständlich und ruhig präsentieren

---

## Subdomain Logik
Geplantes Setup:
- taste.nuviolabs.de = Produktseite
- tasteapp.nuviolabs.de = eigentliche App

### Bedeutung
Die Produktseite erklärt:
- was NuVio Taste ist
- für wen es ist
- welchen Alltagsschmerz es löst
- warum es anders ist
- warum es nützlich ist

Die App ist dann der eigentliche Nutzungsraum.

---

## Fokus der Produktseite
Die Produktseite ist kein beliebiger Marketing One Pager.
Sie muss klar und verständlich zeigen:
- das Problem klassischer Rezept Apps
- den Alltagsschmerz
- den konkreten Nutzen von NuVio Taste
- die wichtigsten Kernvorteile
- einen ruhigen, hochwertigen Produktcharakter

### Nicht tun
- leere Buzzwords
- große Versprechen ohne Produktbezug
- aggressive Sales Texte
- Feature Dumping

---

## Fokus der App
Die App selbst soll:
- schnell wirken
- leicht verständlich sein
- in mobilen Nutzungssituationen stark funktionieren
- auf Kernaufgaben fokussiert bleiben
- mit jeder Erweiterung besser statt komplexer werden

---

## Bereits bekannte oder wichtige Produktideen
Diese Ideen sind relevant und sollen bei Entscheidungen mitgedacht werden:
- NuVio Taste soll die Küchen App werden
- vegane und vegetarische Labels sind sinnvoll
- der echte Nutzen ist wichtiger als Werbewirkung
- Favoriten und Wiederfinden sind ein zentraler Produktwert
- der Alltag in der Küche ist wichtiger als bloße Inspiration
- Produktseite und eigentliche App sollen klar getrennt sein

---

## Arbeitsprinzipien für Claude
- immer zuerst den kleinsten sinnvollen nächsten Schritt wählen
- keine unnötigen Refactors
- keine neue Architektur ohne klaren Grund
- robuste und wartbare Lösung bevorzugen
- keine Spekulation über Datenmodell oder Backend Verhalten
- bestehende Patterns respektieren
- Änderungen möglichst minimalinvasiv umsetzen
- bei Unsicherheit reale Struktur prüfen statt erfinden

---

## Entscheidungsreihenfolge
Wenn mehrere Wege möglich sind, priorisiere in dieser Reihenfolge:
1. Stabilität
2. Verständlichkeit
3. Wartbarkeit
4. Nutzerfreundlichkeit
5. Umsetzungsgeschwindigkeit
6. Eleganz

---

## Umgang mit Änderungen

### Vor einer Änderung
- Ziel der Änderung klar benennen
- betroffene Dateien identifizieren
- prüfen, ob bestehende Patterns bereits eine passende Lösung vorgeben
- nur so viel ändern wie nötig

### Nach einer Änderung
- Logik kurz gegen das Ziel prüfen
- Build prüfen
- Lint prüfen, falls vorhanden
- zentrale Nutzerflüsse gegenprüfen
- mögliche UI oder Datenfolgen kurz benennen

---

## Was vermieden werden soll
- große unaufgeforderte Umbauten
- blinde Refactors
- neue Libraries ohne klaren Nutzen
- erfundene Datenbankstrukturen
- unnötige Parallelstrukturen
- zu frühe Generalisierung
- visuelle Spielereien ohne Mehrwert
- Architekturwechsel aus Stilgründen
- unnötige Placeholder Logik
- Änderungen außerhalb des eigentlichen Ziels

---

## Antwortformat für Entwicklungsaufgaben
Wenn eine konkrete Entwicklungsaufgabe bearbeitet wird, antworte bevorzugt in diesem Format:

1. Ziel
2. Betroffene Dateien
3. Konkrete Änderung
4. Warum dieser Weg
5. Risiko oder Prüfpunkt
6. Nächster kleinster Schritt

---

## Antwortformat für Produktentscheidungen
Wenn es um Features, UX oder Roadmap geht, antworte bevorzugt in diesem Format:

1. Beste Empfehlung
2. Warum das wichtig ist
3. Alternative
4. Risiko
5. Nächster sinnvoller Schritt

---

## To do Arbeitsmodus
Wenn keine explizite Großaufgabe genannt wird:
- nicht großflächig umbauen
- erst den kleinsten sinnvollen Hebel identifizieren
- auf Stabilität, UX oder Wartbarkeit optimieren
- nur einen klaren nächsten Schritt priorisieren

---

## Qualitätsmaßstab
Eine gute Lösung ist:
- verständlich
- sauber
- stabil
- minimalinvasiv
- alltagstauglich
- leicht wartbar

Eine schlechte Lösung ist:
- clever, aber fragil
- unnötig komplex
- optisch nett, aber unpraktisch
- technisch aufwendig ohne klaren Produktgewinn

---

## Kurzregel
Baue NuVio Taste so, dass ein echter Nutzer in einer echten Küchensituation schnell, ruhig und stressfrei ans Ziel kommt.

---

## Session Start Verhalten
Wenn eine neue Aufgabe beginnt:
- zuerst das eigentliche Ziel herausarbeiten
- dann den kleinsten sinnvollen Schritt identifizieren
- dann nur die betroffenen Bereiche anfassen
- keine unnötige Expansion des Scopes

---

## Session Fokus
Der Fokus für NuVio Taste liegt aktuell auf:
- Kernprodukt
- echte Alltagstauglichkeit
- starke UX
- logische Produktentwicklung
- Produktseite und App sauber trennen
- klare, ruhige, hochwertige Umsetzung