# HatchHeroes – Projektplan

**Gruppe 6 · Einführung in Software Engineering · FH Technikum Wien**
Team: Victoria Hausegger · Erol Bilyalov · Jan Magbual
Stand: 06.10.2026

---

## 0. Kurzfassung

- **Technik:** Browser-Spiel in reinem HTML, CSS und JavaScript. Es gibt kein Framework, kein npm und keinen Build-Schritt. Das Spiel startet per Doppelklick auf `index.html` oder über GitHub Pages.
- **Datenbank:** IndexedDB, die eingebaute Datenbank jedes Browsers. Man muss nichts installieren.
- **Parallel arbeiten:** Jede Person besitzt eigene Ordner und Dateien. Die wenigen gemeinsamen Dateien legen wir einmal am Anfang komplett an, danach ändert sie nur noch ihr Owner.
- **Testbarkeit:** Die Spiellogik (Happiness, Evolution, Kampf) besteht aus reinen Funktionen ohne DOM und ohne Datenbank. Sie wird automatisch über `tests/test.html` im Browser getestet.

---

## 1. Entscheidungen und Abweichungen von der HÜ1

Beim Abgleich von `HUE1_HatchHeroes.pdf` und `Algorithm.pdf` gab es Widersprüche. So wurden sie entschieden:

| Thema | HÜ1 | Algorithm.pdf | **Entscheidung** |
|---|---|---|---|
| Kampfablauf | Abwechselnd Spieler- und Gegnerzug, nur *Attack*/*Defend* | Beide wählen gleichzeitig eine von 4 Attacken | **Gleichzeitige Wahl aus 4 Attacken.** Der Schaden wird gleichzeitig berechnet. Angezeigt wird zuerst die Gegner-Aktion, dann die Spieler-Aktion. |
| Schadensformel | `round(20 × (0.5 + H/200) × (1 − D/200))` | Typ-Boni +15 %/+20 %, Attack − Defense | **Algorithm.pdf.** Die Happiness fließt *nicht* in den Schaden ein. |
| Gegner-Verhalten | Deterministisch (> 30 HP Attack, sonst Defend) | – | **Zufällig** aus seinen 4 Attacken. Der Zufallsgenerator ist austauschbar, damit Tests mit festem Seed reproduzierbar bleiben. |
| Beide fallen gleichzeitig auf 0 HP | Nur Win/Loss | Unentschieden möglich | **Neues Ergebnis `Draw`** |
| Typ des Spieler-Tiers | – | Tiere haben Typen | **Der Spieler wählt den Typ beim Benennen des Eis** (Feuer, Wasser oder Pflanze). |
| Effektivitätsbonus | – | Laut Text nur bei gleichem Tier- und Attacken-Typ, laut Code immer | **Text gilt:** Die +20 % gibt es nur, wenn auch die +15 % gelten. ⚠️ *Bitte im Team bestätigen.* |

### Daraus folgt: Diese Stellen in der HÜ1 müssen angepasst werden

| Stelle in HÜ1 | Änderung | Zuständig |
|---|---|---|
| FR1.1 | Beim Benennen des Eis wählt der Spieler auch den Typ. | Victoria |
| FR3.1 | 4 Attacken pro Tier statt Attack/Defend. Gleichzeitige Wahl, Anzeige Gegner → Spieler. | Jan |
| FR3.2 | Schaden aus Attacke, Typ-Boni und Defense statt Happiness. Gegner wählt zufällig. | Jan |
| Abschnitte „Battle damage“, „Defend action“, „Opponent-action“, „Battle termination“ | Durch Abschnitt 2.5 dieses Plans ersetzen | Jan |
| DH8 | Ergebnis `Win`, `Loss` oder `Draw` | Erol |
| **neu: DH13** | „The system shall store the creature's type (Fire, Water, Plant).“ | Erol |

> Die Quelldatei der HÜ1 (`Data HatchHeroes.docx`) wurde aus dem Repo gelöscht. Die Änderungen werden in der Quelldatei gemacht und das PDF danach neu exportiert.

---

## 2. Spielregeln (verbindliche Spezifikation)

Diesen Abschnitt programmieren und testen wir. Werte mit **(A)** sind *Annahmen*, die in der HÜ1 fehlen. Sie liegen als Konstanten in Config-Dateien und können später leicht angepasst werden.

### 2.1 Ei und Schlüpfen (FR1.1)
- Der Spieler gibt einen Namen ein und wählt einen Typ.
- **(A)** Ein gültiger Name hat nach `trim()` 1 bis 20 Zeichen. Erlaubt sind Buchstaben (auch Umlaute), Ziffern, Leerzeichen und Bindestrich.
- Danach läuft ein Countdown von **60 Sekunden**, der sichtbar angezeigt wird. Bei 0 wird das Ei zum **Baby**.
- **(A)** Der Countdown läuft nur, solange das Spiel offen ist. Die Restzeit wird gespeichert.

### 2.2 Pflege (FR1.2, NFR1.1)
- Es gibt vier Bedürfnisse: Fullness, Cleanliness, Entertainment und Rest. Jedes ist eine ganze Zahl von 0 bis 100.
- Es gibt vier Aktionen. Jede erhöht genau ein Bedürfnis: Feed → Fullness, Wash → Cleanliness, Play → Entertainment, Sleep → Rest.
- **(A)** Jede Aktion gibt +25. Der Wert ist auf 100 begrenzt.
- **(A)** Jedes Bedürfnis sinkt um 1 pro 10 Sekunden und nie unter 0. Das passiert nur, während das Spiel läuft und nicht im Stadium Egg.
- **(A)** Nach dem Schlüpfen starten alle Bedürfnisse bei 50.
- Alle vier Pflege-Buttons sind **direkt** auf dem Haustier-Screen. Jede Aktion braucht also genau 1 Klick (NFR1.1 erlaubt bis zu 2).

### 2.3 Happiness (FR2.2)
```
H = round((F + C + E + R) / 4)      // 0..100, wird bei jeder Änderung neu berechnet
```

### 2.4 Evolution (FR2.2)
| Von → Nach | Bedingung |
|---|---|
| Egg → Baby | Countdown von 60 s abgelaufen |
| Baby → First Evolution | H ≥ 70 für **5 Minuten am Stück** |
| First Evolution → Second Evolution | H ≥ 80 für **10 Minuten am Stück** |

- Der Fortschritts-Timer zählt in Sekunden hoch, solange H über der Schwelle liegt. Fällt H darunter, springt er auf 0. Nach jeder Evolution startet er wieder bei 0.
- **(A)** Der Timer läuft nur, solange das Spiel offen ist. Der Stand wird gespeichert (DH4).
- Es gibt keine Level und keine XP.

### 2.5 Kampf (FR3.1, FR3.2)

**Voraussetzung:** Das Tier ist im Stadium **Second Evolution**. Vorher ist der Kampf-Button nicht verfügbar.

**Typen:** Feuer, Wasser und Pflanze. Dazu kommt der Attacken-Typ Normal, der zu keinem Tier passt.
**Effektivität:** Feuer > Pflanze, Pflanze > Wasser, Wasser > Feuer.

**Attacke:** `{ name, type, attack, defense, counter }`. Jeder Tier-Typ und jeder Gegner hat genau 4 Attacken.

**Start:**
- **(A)** Beide Tiere starten mit 100 HP.
- **(A)** Der Gegner wird zufällig aus einer festen Gegnerliste gezogen.

**Eine Runde:**
1. Der Spieler wählt eine seiner 4 Attacken. Gleichzeitig wählt der Gegner zufällig (gleich verteilt) eine seiner 4 Attacken.
2. **Konter:** Ist mindestens eine der beiden Attacken ein Konter (`counter: true`), endet die Runde ohne Schaden.
3. **Bonuswerte** berechnet jede Seite für ihre eigene gewählte Attacke:
   - `p1 = 115`, wenn Tier-Typ = Attacken-Typ. Sonst `p1 = 100`.
   - `p2 = 120`, wenn `p1 = 115` **und** der eigene Tier-Typ effektiv gegen den Gegner-Typ ist. Sonst `p2 = 100`.
   - `Angriff = Math.round(attack × p1 × p2 / 10000)`
   - `Verteidigung = Math.round(defense × p1 × p2 / 10000)`
4. **Schaden:**
   - `SchadenAnGegner = max(0, AngriffSpieler − VerteidigungGegner)`
   - `SchadenAnSpieler = max(0, AngriffGegner − VerteidigungSpieler)`
5. Beide Schäden werden **gleichzeitig** abgezogen. HP fallen nicht unter 0.
6. **Anzeige:** Zuerst „Gegner setzt *X* ein – *n* Schaden“ und der HP-Balken des Spielers sinkt. Danach „Du setzt *Y* ein – *m* Schaden“ und der HP-Balken des Gegners sinkt.
7. **Ende:**
   - Beide bei 0 → `Draw`
   - Nur der Gegner bei 0 → `Win`
   - Nur der Spieler bei 0 → `Loss`
   - Sonst beginnt die nächste Runde.
8. **Nach Kampfende:** Gegner, Endzeitpunkt und Ergebnis werden gespeichert. Bei `Win` gibt es +100 Münzen, bei `Draw` und `Loss` nichts **(A)**.

> **Warum ganzzahlig rechnen?** `Math.round(25 * 1.15 * 1.2)` ergibt in JavaScript **34**, weil der Zwischenwert 34.4999… ist. Mathematisch richtig ist 34.5, also **35**. Mit `Math.round(25 * 115 * 120 / 10000)` kommt korrekt 35 heraus. Dafür gibt es einen eigenen Testfall.

**Weitere Annahmen:**
- **(A)** Ein abgebrochener Kampf (Seite neu geladen) gilt nicht als abgeschlossen und wird nicht gespeichert.
- **(A)** Kämpfe verändern die Bedürfnisse nicht.

---

## 3. Technik

### Vorschlag: HTML + CSS + JavaScript, ohne Framework und ohne Build

| Kriterium | Begründung |
|---|---|
| **Keine Installation** | Läuft in jedem aktuellen Browser. Spielen geht per Doppelklick auf `index.html` oder über GitHub Pages, entwickeln mit jedem Texteditor. |
| **Echte Datenbank** | IndexedDB ist eine im Browser eingebaute Datenbank mit Indizes. Sie schafft 10.000 Kampfeinträge (DH12) problemlos und lässt sich in den DevTools prüfen (*Application → IndexedDB*). Das braucht man für die Verifikation von DH2, DH3, DH9 und DH10. |
| **Moderne grafische Oberfläche** | CSS-Animationen für das Tier und `<progress>`- bzw. CSS-Balken für Bedürfnisse und HP |
| **Testbar ohne Tools** | Ein eigener Mini-Test-Runner (ca. 60 Zeilen) läuft in `tests/test.html`. |
| **Geringe Einstiegshürde** | Alle drei können sofort loslegen, ohne Tooling, Versionskonflikte oder `node_modules`. |

**Verworfen:**
- *Java + JavaFX + SQLite:* Jeder bräuchte ein JDK, und auch die Spieler müssten etwas installieren.
- *Frameworks wie React oder Vite:* Brauchen npm und einen Build-Schritt. Das ist für den Umfang unnötig.

### Technische Stolperfallen und Lösungen

| Problem | Lösung |
|---|---|
| ES-Module (`import`/`export`) funktionieren in Chrome nicht über `file://`. | Klassische `<script>`-Tags in fester Reihenfolge. Jede Datei hängt ihre Funktionen an einen gemeinsamen Namespace `window.HH` (z. B. `HH.care`, `HH.battle`). |
| Fließkomma-Rundung (siehe 2.5) | Prozentwerte ganzzahlig rechnen und erst am Ende teilen |
| Browser bremsen `setInterval` in Hintergrund-Tabs. | Pro Tick wird die echte vergangene Zeit (`Date.now()`-Differenz) verwendet, nicht „1 Tick = 1 Sekunde“. |
| IndexedDB über `file://` verhält sich je nach Browser anders. | Wird in Phase 0 in Chrome, Edge, Firefox und Safari geprüft. Wenn es Probleme gibt, ist GitHub Pages der offizielle Startweg. |
| Windows und macOS speichern Zeilenenden unterschiedlich und erzeugen dadurch Schein-Konflikte. | `.gitattributes` mit `* text=auto eol=lf` und `.editorconfig` |

---

## 4. Ordner- und Dateistruktur

Hinter jeder Datei steht ihr **Owner**: **V** = Victoria, **E** = Erol, **J** = Jan. Nur der Owner ändert die Datei. Andere fragen den Owner oder schicken einen PR, den der Owner reviewt.

```
Gruppe6-HatchHeroes/
├── index.html                    E   Einstieg: alle <script>-Tags + 4 leere Screen-Container
├── README.md                     E   Start, Spielanleitung, Testrechner, Debug-Modus
├── PROJEKTPLAN.md                E
├── .gitattributes / .editorconfig E
├── docs/
│   ├── HUE1_HatchHeroes.pdf
│   └── Algorithm.pdf
├── css/
│   ├── base.css                  V   Farben, Schrift, Layout, Buttons (für alle)
│   ├── pet.css                   V   Ei- und Haustier-Screen, Tier-Animationen
│   ├── battle.css                J   Kampf-Screen
│   └── history.css               E   Kampf-Historie
├── assets/
│   ├── pet/                      V   Grafiken je Typ × Stadium (anfangs Platzhalter-SVG/Emoji)
│   └── battle/                   J   Gegner-Grafiken, Effekte
├── js/
│   ├── core/
│   │   ├── namespace.js          E   window.HH = {} (wird als erste Datei geladen)
│   │   ├── model.js              E   Datenmodell: createNewCreature(), Konstanten für Stadien und Typen
│   │   └── clock.js              E   Zeitquelle (austauschbar) + Debug-Zeitfaktor
│   ├── care/
│   │   ├── careConfig.js         V   +25 pro Aktion, −1 pro 10 s, Startwert 50
│   │   ├── needs.js              V   applyCareAction(), decayNeeds() – reine Funktionen
│   │   └── nameValidation.js     V   isValidName()
│   ├── evolution/
│   │   ├── evolutionConfig.js    E   Schwellen 70/80, Dauern 300 s/600 s, Countdown 60 s
│   │   ├── happiness.js          E   calcHappiness() – reine Funktion
│   │   └── evolution.js          E   advanceTime() – Countdown + Evolutions-Timer, rein
│   ├── storage/
│   │   ├── storageApi.md         E   Beschreibung der Schnittstelle (Vertrag)
│   │   ├── memoryStorage.js      E   Gleiche Schnittstelle, nur im Speicher (für Tests + UI-Entwicklung)
│   │   └── indexedDbStorage.js   E   Echte Datenbank
│   ├── battle/
│   │   ├── battleConfig.js       J   Start-HP 100, Belohnung 100, Bonus-Prozente
│   │   ├── typeChart.js          J   isEffective(attackerType, defenderType)
│   │   ├── attacks.js            J   4 Attacken je Spieler-Typ
│   │   ├── opponents.js          J   Gegnerliste (Name, Typ, 4 Attacken)
│   │   ├── rng.js                J   createRng(seed) – reproduzierbarer Zufall
│   │   └── battleEngine.js       J   startBattle(), resolveRound() – rein
│   ├── ui/
│   │   ├── eggScreen.js          V   Name + Typ wählen, Countdown anzeigen
│   │   ├── petScreen.js          V   Tier, Stadium, 4 Balken, 4 Pflege-Buttons, Münzen, Kampf-Button
│   │   ├── battleScreen.js       J   Attacken-Auswahl, HP-Balken, Kampf-Log (Gegner → Spieler)
│   │   └── historyScreen.js      E   Die 20 letzten Kämpfe
│   └── main.js                   E   Start: Daten laden → Screen wählen → Spielschleife (1 s Tick) → Speichern
└── tests/
    ├── test.html                 E   Lädt alle js/-Dateien + alle *.test.js, zeigt Ergebnis
    ├── runner.js                 E   Mini-Test-Framework: test(), assertEqual(), assertThrows(); unterstützt async
    ├── needs.test.js             V
    ├── nameValidation.test.js    V
    ├── happiness.test.js         E
    ├── evolution.test.js         E
    ├── storage.test.js           E   Läuft gegen memoryStorage UND indexedDbStorage (eigene Test-DB)
    ├── typeChart.test.js         J
    ├── battleEngine.test.js      J
    ├── perf.html                 E+J Performance-Tests NFR2.1 + NFR3.1 (eigene Test-DB)
    └── MANUELLE_TESTS.md         alle  Checkliste für FR/NFR/DH, die man von Hand prüft
```

**Warum so keine Merge-Konflikte entstehen:**
1. In Phase 0 legt Erol **alle** Dateien als leere Gerüste an und trägt **alle** `<script>`-Tags in `index.html` und `tests/test.html` ein. Danach muss niemand mehr diese gemeinsamen Dateien ändern.
2. `index.html` hat vier leere Container: `#screen-egg`, `#screen-pet`, `#screen-battle`, `#screen-history`. Jede UI-Datei rendert nur in ihren eigenen Container.
3. Es gibt keine gemeinsame Konfigurationsdatei. Jeder Bereich hat seine eigene `…Config.js`.
4. Die Bereiche greifen nur über die Funktionen in Abschnitt 5 aufeinander zu.

**Lade-Reihenfolge in `index.html`:** `namespace` → `model` → `clock` → alle `*Config` → reine Logik (`care`, `evolution`, `battle`) → `storage` → `ui` → `main`.

---

## 5. Schnittstellen (Vertrag zwischen den Teilen)

Diese Schnittstellen werden in Phase 0 gemeinsam festgelegt. Danach kann jede Person gegen sie programmieren, auch wenn die Teile der anderen noch nicht fertig sind.

### Datenmodell (`js/core/model.js`, Owner E)
```js
creature = {
  name: "Flammi",
  type: "Fire",                 // "Fire" | "Water" | "Plant"
  stage: "Egg",                 // "Egg" | "Baby" | "First Evolution" | "Second Evolution"
  needs: { fullness: 50, cleanliness: 50, entertainment: 50, rest: 50 },  // ganze Zahlen 0..100
  eggCountdownSeconds: 60,      // Restzeit des Ei-Countdowns
  evolutionProgressSeconds: 0,  // DH4
  decayRemainderMs: 0           // angesparte Zeit bis zum nächsten −1
}
player  = { coins: 0 }          // ganze Zahl ≥ 0
battle  = { opponentId: "shadow-wolf", opponentName: "Schattenwolf",
            endedAt: "2026-11-02T14:03:11.000Z", result: "Win" }  // "Win" | "Loss" | "Draw"
```

### Reine Logik (ohne DOM und ohne Datenbank: Eingabe → neue Ausgabe, nichts wird verändert)
| Funktion | Owner |
|---|---|
| `HH.care.applyCareAction(needs, action) → needs` (`"feed"`, `"wash"`, `"play"`, `"sleep"`) | V |
| `HH.care.decayNeeds(needs, remainderMs, elapsedMs) → { needs, remainderMs }` | V |
| `HH.care.isValidName(text) → boolean` | V |
| `HH.evolution.calcHappiness(needs) → 0..100` | E |
| `HH.evolution.advanceTime(creature, elapsedSeconds) → { creature, evolvedTo: null \| stage }` | E |
| `HH.battle.isEffective(attackerType, defenderType) → boolean` | J |
| `HH.battle.startBattle(creature, opponent) → battleState` | J |
| `HH.battle.resolveRound(battleState, playerAttackIndex, rng) → { battleState, log: [gegnerEintrag, spielerEintrag], finished, result }` | J |
| `HH.battle.createRng(seed) → () => Zahl in [0, 1)` (ohne Seed: `Math.random`) | J |

### Speicher-Schnittstelle (`HH.storage`, Owner E). Alle Funktionen sind `async`.
```
open(dbName)                  loadCreature() → creature | null     saveCreature(creature)
loadPlayer() → player         savePlayer(player)
addBattle(battle)             loadRecentBattles(n) → battle[] (neueste zuerst)
countBattles() → Zahl         clearAll()
```
`memoryStorage.js` und `indexedDbStorage.js` haben genau diese Schnittstelle. So können Victoria und Jan ihre Screens mit `memoryStorage` bauen, bevor die echte Datenbank fertig ist.

---

## 6. Datenbank (IndexedDB)

Datenbank `hatchheroes`, Version 1:

| Object Store | Schlüssel | Inhalt | Index |
|---|---|---|---|
| `creature` | fest `"active"` | Ein Datensatz wie im Datenmodell (DH1–DH4, DH13) | – |
| `player` | fest `"player"` | `{ coins }` (DH5) | – |
| `battles` | `id` (autoIncrement) | `{ opponentId, opponentName, endedAt, result }` (DH6–DH8) | `byEndedAt` auf `endedAt` |

- Die **20 letzten Kämpfe** werden über einen Cursor auf `byEndedAt` gelesen, absteigend und nach 20 Einträgen abgebrochen. Die Ladezeit hängt dadurch kaum von der Gesamtzahl der Einträge ab (NFR2.1).
- Es wird **nie automatisch gelöscht** (DH12).

**Wann wird gespeichert?** (gesteuert in `main.js`)

| Auslöser | Was | Anforderung |
|---|---|---|
| Nach jeder Pflege-Aktion, sofort | `creature` | DH9 (≤ 1 s), FR2.1 |
| Nach jeder Evolution, sofort | `creature` | DH10 (≤ 1 s) |
| Nach dem Schlüpfen, sofort | `creature` | FR2.1 |
| Kampfende | `battles` + `player` | DH5–DH8 |
| Alle 5 s und bei `pagehide`/`visibilitychange` | `creature` (gesunkene Bedürfnisse, Timer-Stände) | DH4, DH11 |

**Laden (DH11):** Beim Start zeigt die Seite einen Ladebildschirm, und alle Buttons sind deaktiviert. Erst wenn Creature und Player geladen sind, wird der passende Screen angezeigt und bedienbar.

---

## 7. Arbeitsaufteilung

Die Aufteilung folgt den Zuständigkeiten in der HÜ1.

### Victoria Hausegger: Ei, Pflege, Haustier-Oberfläche
**Requirements:** FR1.1, FR1.2, NFR1.1
- Logik: `needs.js` (Aktionen, Absinken über Zeit, Grenzen 0–100) und `nameValidation.js`
- Oberfläche: Ei-Screen (Name, Typwahl, Countdown) und Haustier-Screen (animiertes Tier je Typ und Stadium, Anzeige des Stadiums, 4 Bedürfnis-Balken, 4 Pflege-Buttons, Münzanzeige, Kampf-Button ab Second Evolution)
- Gestaltung: `base.css` (gemeinsames Design), `pet.css`, Grafiken in `assets/pet/`
- HÜ1 anpassen: FR1.1 (Typwahl)

### Erol Bilyalov: Happiness, Evolution, Datenhaltung, Zusammenbau
**Requirements:** FR2.1, FR2.2, NFR2.1, DH1–DH13
- Logik: `happiness.js` und `evolution.js` (Ei-Countdown + beide Evolutionsstufen)
- Datenhaltung: Speicher-Schnittstelle, `memoryStorage.js`, `indexedDbStorage.js`, Speicherzeitpunkte
- Zusammenbau: `main.js` (Laden, Spielschleife, Screen-Wechsel, Speichern), `index.html`, `clock.js` + Debug-Modus
- Historie: `historyScreen.js` (20 letzte Kämpfe)
- Test-Infrastruktur: `runner.js`, `test.html`, `perf.html` (NFR2.1-Teil)
- HÜ1 anpassen: DH8 (Draw), neues DH13 (Typ)

### Jan Magbual: Kampfsystem
**Requirements:** FR3.1, FR3.2, NFR3.1
- Logik: `typeChart.js`, `rng.js`, `battleEngine.js` (Konter, Boni, gleichzeitiger Schaden, Ende Win/Loss/Draw)
- Daten: `attacks.js` (4 Attacken je Typ) und `opponents.js` (mind. 3 Gegner), inklusive Balancing
- Oberfläche: `battleScreen.js` + `battle.css` (Attacken-Buttons, 2 HP-Balken, Log in der Reihenfolge Gegner → Spieler, Ergebnis-Anzeige)
- Am Kampfende: `storage.addBattle()`, bei Win `storage.savePlayer()` mit +100 Münzen
- Performance-Test NFR3.1 in `perf.html`
- HÜ1 anpassen: FR3.1, FR3.2 und die Kampfalgorithmen (siehe Abschnitt 1)

**Gemeinsam:** Code-Reviews (jede Person reviewt die PRs mindestens einer anderen), `MANUELLE_TESTS.md` und die Endabnahme.

---

## 8. Git-Workflow

- **`main` ist immer lauffähig.** Niemand committet direkt auf `main`.
- **Ein Branch pro Aufgabe:** `<name>/<thema>`, z. B. `victoria/pflege-buttons`, `erol/indexeddb`, `jan/battle-engine`.
- **Pull Request auf GitHub** → mindestens 1 Review → Merge. Branches sind klein und leben kurz (höchstens ein paar Tage).
- **Vor jedem Arbeitsbeginn:** `git switch main && git pull`, dann einen neuen Branch erstellen oder `git merge main` in den eigenen Branch.
- **Commit-Nachrichten:** `art(bereich): was` mit `art` ∈ `feat`, `fix`, `test`, `docs`, `style`, `refactor`. Beispiele:
  - `feat(care): Bedürfnisse sinken über Zeit`
  - `test(battle): Draw bei gleichzeitigem K.o.`
- **Kleine Commits:** Ein Commit = ein logischer Schritt. Tests und Code dürfen im selben Commit sein.
- **Fremde Dateien:** Nicht ändern. Stattdessen ein Issue anlegen oder den Owner fragen (siehe Abschnitt 4).

---

## 9. Reihenfolge

Die Phasen bauen aufeinander auf. **Innerhalb** einer Phase arbeiten alle drei parallel. Termine bitte nach dem LV-Zeitplan eintragen.

| Phase | Inhalt | Victoria | Erol | Jan | Fertig, wenn … |
|---|---|---|---|---|---|
| **0 Fundament** (gemeinsamer Termin) | Entscheidungen bestätigen (inkl. ⚠️ in Abschnitt 1), HÜ1 anpassen, Testrechner festlegen, Schnittstellen beschließen | HÜ1 FR1.1 | Gerüst: alle Dateien als Stubs, `index.html`, `test.html`, `runner.js`, `.gitattributes`, PDFs → `docs/`; `file://`- und IndexedDB-Test in 4 Browsern | HÜ1 Kampfteil | Alle drei klonen das Repo, `index.html` öffnet sich, `tests/test.html` zeigt „0 Tests“ |
| **1 Spiellogik** (test-first) | Reine Funktionen | `needs.js`, `nameValidation.js` + Tests | `happiness.js`, `evolution.js`, `memoryStorage.js` + Tests | `typeChart.js`, `rng.js`, `attacks.js`, `battleEngine.js` + Tests | Alle Unit-Tests in `test.html` sind grün |
| **2 Oberfläche & Datenbank** | Screens mit `memoryStorage` bzw. Testdaten; echte DB | Ei- und Haustier-Screen, `base.css`, Animation | `indexedDbStorage.js` + Tests, `historyScreen.js` | `opponents.js`, `battleScreen.js` | Jeder Screen funktioniert für sich |
| **3 Integration** | `main.js` verbindet alles | Pflege-Buttons an Speichern angeschlossen | Spielschleife, Speicherzeitpunkte, Laden, Debug-Modus | Kampf-Button, Münzen, Historie-Eintrag | Komplett durchspielbar: Ei → Second Evolution → Kampf; nach Neustart ist alles wiederhergestellt |
| **4 Abnahme** | NFRs und DHs prüfen | NFR1.1, manuelle Tests FR1.x | `perf.html` NFR2.1, manuelle Tests DH1–DH13 | `perf.html` NFR3.1, manuelle Tests FR3.x | `MANUELLE_TESTS.md` ist komplett abgehakt, GitHub Pages ist online |
| **5 Feinschliff & Abgabe** | Balancing, Grafik, README, Prompt-Protokoll | Grafiken, Animationen | README | Kampf-Balancing | Abgabe |

**Was davon abhängt:**
- Phase 1 braucht nur die Schnittstellen aus Phase 0.
- Kampf (Jan) und Pflege (Victoria) hängen nicht voneinander ab.
- Die echte Datenbank (Erol) blockiert niemanden, weil `memoryStorage` dieselbe Schnittstelle hat.

---

## 10. Teststrategie

### 10.1 Automatische Unit-Tests (`tests/test.html` im Browser öffnen)
Jede reine Funktion bekommt Tests **vor oder gleichzeitig mit** dem Code. Die erwarteten Werte rechnen wir von Hand aus. Pflicht-Testfälle:

**Pflege (V)**
- Feed bei Fullness 95 → 100 (Obergrenze)
- 10 s Absinken bei Wert 0 → bleibt 0 (Untergrenze)
- 25 s Absinken → −2, 5 s Rest werden gemerkt
- `isValidName("  ")` → false, `isValidName("Flammi")` → true, 21 Zeichen → false

**Happiness (E)**
- (80, 70, 65, 90) → **76**
- (70, 70, 71, 71) → 70.5 → **71** (Rundung bei .5)
- (0, 0, 0, 0) → 0
- (100, 100, 100, 100) → 100

**Evolution (E)**
- Ei-Countdown 60 s → Baby, aber bei 59 s noch Egg
- Baby mit H = 70: nach 299 s noch Baby, nach 300 s First Evolution, Timer wieder 0
- Baby mit H = 70 für 200 s, dann H = 69 → Timer 0
- First Evolution mit H = 80 für 600 s → Second Evolution
- Second Evolution bleibt Second Evolution

**Kampf (J)**
- Spieler: Feuer-Tier mit *Feuerball* (Feuer, A30/D10). Gegner: Pflanzen-Tier mit *Rankenhieb* (Pflanze, A20/D10).
  - Spieler-Angriff `round(30·115·120/10000)` = **41**, Spieler-Verteidigung **14**
  - Gegner-Angriff `round(20·115/100)` = **23**, Gegner-Verteidigung **12**
  - Ergebnis: Gegner verliert **29** (→ 71 HP), Spieler verliert **9** (→ 91 HP)
- Rundungsfalle: Basiswert 25 mit beiden Boni → **35** (nicht 34)
- Feuer-Tier mit *Biss* (Normal, A20) gegen Pflanze → **20** (kein Bonus, weil der Typ nicht passt)
- Eine Seite wählt einen Konter → beide HP bleiben gleich
- Schaden kleiner als die Verteidigung → 0, nicht negativ
- HP 5 und Schaden 29 → 0, nicht −24
- Beide fallen auf 0 → `Draw`, Münzen bleiben gleich. Nur der Gegner auf 0 → `Win` und +100. Nur der Spieler auf 0 → `Loss`.
- Log-Reihenfolge: `log[0]` ist der Gegner, `log[1]` der Spieler
- Gleicher Seed → gleiche Folge von Gegner-Attacken

**Speicher (E)**, läuft gegen beide Implementierungen
- Speichern und Laden ergibt dieselben Werte für Creature und Player
- 25 Kämpfe speichern → `loadRecentBattles(20)` liefert die 20 neuesten in richtiger Reihenfolge
- `result` ist nur `Win`, `Loss` oder `Draw`

### 10.2 Performance-Tests (`tests/perf.html`, auf dem vereinbarten Testrechner)
- **NFR2.1:** 10.000 Kämpfe in eine eigene Test-Datenbank schreiben. Dann 5-mal „Creature + 20 letzte Kämpfe laden“ mit `performance.now()` messen. **Alle 5 Messungen müssen unter 2000 ms liegen.** Zusätzlich prüfen, dass `countBattles() === 10000` ist (DH12).
- **NFR3.1:** 100 Kämpfe mit zufälligen Spieler-Attacken simulieren und jeden `resolveRound`-Aufruf messen. **Mindestens 95 % der Aufrufe müssen unter 200 ms liegen.** Die Seite zeigt die Anzahl und das 95. Perzentil an.
- Die Ergebnisse und die Daten des Testrechners (Gerät, Browser-Version) kommen ins README.

### 10.3 Manuelle Tests (`tests/MANUELLE_TESTS.md`)
Hier stehen die Prüfungen, die nur am laufenden Spiel möglich sind. Grundlage sind die *Verification*-Texte der HÜ1. Jede Zeile wird mit Datum, Tester und OK/Fehler abgehakt.

| Anforderung | Prüfung |
|---|---|
| FR1.1 | Ei benennen → Countdown ist sichtbar → Tier und Stadium werden angezeigt |
| NFR1.1 | Klicks vom Haustier-Screen bis zu jeder der 4 Aktionen zählen (Soll: 1) |
| DH1, DH5, DH11 | Name vergeben und Kampf gewinnen → Tab schließen → wieder öffnen → Name und Münzen gleich |
| DH2, DH3, DH9, DH10 | Aktion bzw. Evolution auslösen → innerhalb 1 s in DevTools → Application → IndexedDB prüfen |
| DH4 | H halten → Neustart → Evolutions-Fortschritt ist wiederhergestellt |
| DH6–DH8 | Einen Win, einen Loss und einen Draw spielen → Einträge in der Historie und in der DB prüfen |
| FR3.1 | Kampf-Button ist erst ab Second Evolution da; Log zeigt Gegner vor Spieler |

### 10.4 Debug-Modus
`index.html?debug=1` macht die Zeit 60-mal schneller: Ei 1 s, erste Evolution 5 s, zweite 10 s. Außerdem zeigt er die aktuellen Werte an (H, Timer) und hat einen „Spielstand löschen“-Button. Ohne diesen Modus müsste man für jeden manuellen Test über 15 Minuten warten.

---

## 11. Offene Punkte und Risiken

| # | Punkt | Wer klärt | Bis |
|---|---|---|---|
| 1 | ⚠️ Effektivitätsbonus nur bei gleichem Typ (Text) oder immer (Code)? | Jan + Team | Phase 0 |
| 2 | Annahmen (A) in Abschnitt 2 bestätigen bzw. Werte festlegen | alle | Phase 0 |
| 3 | „Agreed project test computer“ festlegen (Gerät und Browser) | alle | Phase 0 |
| 4 | Darf das Repo öffentlich sein? GitHub Pages ist für private Repos nur mit Pro/Education-Account verfügbar. | Victoria (Repo-Owner) | Phase 0 |
| 5 | Risiko: Kampf kann lange dauern, wenn oft Konter gewählt wird oder Verteidigung ≥ Angriff ist | Jan (Balancing) | Phase 2 |
| 6 | Münzen können nicht ausgegeben werden. Das ist laut Requirements in Ordnung, ein Shop wäre ein optionales Extra. | – | – |
| 7 | KI-Nutzung im Prompt-Protokoll dokumentieren (wie in `Algorithm.pdf`) | alle | laufend |
