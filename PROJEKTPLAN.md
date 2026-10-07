# HatchHeroes – Projektplan

**Gruppe 6 · Einführung in Software Engineering · FH Technikum Wien**
Team: Victoria Hausegger · Erol Bilyalov · Jan Magbual
Stand: 07.10.2026

---

## 0. Kurzfassung

- **Technik:** HTML, CSS und JavaScript. Wir verwenden kein Framework, installieren nichts und haben keinen Build-Schritt. Gestartet wird per Doppelklick auf `index.html` in **Chrome oder Edge** (oder einem anderen Chromium-Browser).
- **Speichern:** in den Dateien **`data.json`** (Tier, Münzen) und **`battles.json`** (Kämpfe) im Projektordner. Man kann sie mit jedem Texteditor öffnen und lesen. Der Browser schreibt sie direkt über die *File System Access API*, ohne Server.
- **Umfang:** 15 Dateien für Code und Tests, dazu README, dieser Plan und `.gitignore`. Jede Datei hat genau einen Owner.
- **Git:** Alle arbeiten direkt auf `main`. Jede Person ändert nur ihre eigenen Dateien.

---

## 1. Entscheidungen und Abweichungen von der HÜ1

| Thema | HÜ1 | Algorithm.pdf | **Entscheidung** |
|---|---|---|---|
| Kampfablauf | Abwechselnde Züge, nur *Attack* und *Defend* | Beide wählen gleichzeitig eine von 4 Attacken | **Beide wählen gleichzeitig aus 4 Attacken.** Der Schaden wird gleichzeitig berechnet. Angezeigt wird zuerst der Gegner, dann der Spieler. |
| Schadensformel | `round(20 × (0.5 + H/200) × (1 − D/200))` | Typ-Boni +15 % und +20 %, danach Attack − Defense | **Wie in Algorithm.pdf.** Die Happiness spielt beim Schaden *keine* Rolle. |
| Gegner-Verhalten | Feste Regeln (bei > 30 HP Attack, sonst Defend) | – | **Zufällig** aus seinen 4 Attacken |
| Beide fallen gleichzeitig auf 0 HP | Nur Win oder Loss | Unentschieden möglich | **Neues Ergebnis `Draw`** |
| Typ des eigenen Tiers | – | Tiere haben Typen | **Der Spieler wählt den Typ**, wenn er das Ei benennt: Feuer, Wasser, Erde oder Wind. |
| Typen | – | Beispiel Feuer/Wasser/Pflanze | **Unsere 4 Typen: Feuer, Wasser, Erde, Wind.** Wer gegen wen stark ist, steht in Abschnitt 2.5. |
| Effektivitätsbonus | – | Text: nur wenn Tier- und Attacken-Typ gleich sind. Code: immer | **Entschieden: Der Text gilt.** Die +20 % gibt es nur, wenn auch die +15 % gelten. |
| Speicherort | „database“ | – | **Dateien `data.json` und `battles.json`** im Projektordner (siehe Abschnitt 3). Vorgabe: Die Datenbank muss eine echte Datei sein, die man öffnen und lesen kann. `localStorage` allein reicht nicht. |

### Was in der HÜ1 angepasst werden muss

| Stelle in der HÜ1 | Änderung | Zuständig |
|---|---|---|
| FR1.1 | Beim Benennen des Eis wird auch der Typ gewählt. | Victoria |
| FR3.1 | 4 Attacken statt Attack/Defend. Beide wählen gleichzeitig, Anzeige zuerst Gegner, dann Spieler. | Jan |
| FR3.2 | Schaden aus Attacke, Typ-Boni und Defense statt Happiness. Der Gegner wählt zufällig. | Jan |
| „Battle damage“, „Defend action“, „Opponent-action“, „Battle termination“ | Durch Abschnitt 2.5 dieses Plans ersetzen | Jan |
| DH8 | Ergebnis ist `Win`, `Loss` oder `Draw`. | Erol |
| **neu: DH13** | „The system shall store the creature's type as one of the following four values: Fire, Water, Earth, Wind.“ | Erol |
| FR2.1, FR3.2, DH9, DH12, „Battle termination“ | „database“ → „a local JSON file (data.json bzw. battles.json) on the player's computer“ | Erol |
| FR2.1, DH11 | Der Typ wird mitgespeichert bzw. nach dem Neustart wiederhergestellt. | Erol |

> **Fertige Texte:** Alle Änderungen stehen als englische Requirement-Texte (alte und neue Fassung) in `HUE1_Aenderungen.md`.

> Die Quelldatei der HÜ1 ist `Projekt HatchHeroes_HÜ1_Group6.odt`. Änderungen also dort machen und `HUE1_HatchHeroes.pdf` danach neu exportieren. `Data HatchHeroes.docx` ist unsere Abgabe aus Übung 2 und hat mit der HÜ1 nichts zu tun.

---

## 2. Spielregeln

Nach diesen Regeln programmieren und testen wir. Werte mit **(A)** sind *Annahmen*, weil die HÜ1 sie nicht festlegt. Sie stehen als Konstanten am Anfang der jeweiligen Datei und lassen sich dort leicht ändern.

**Spielzeit (A):** Die Zeit läuft nur, solange das Spiel offen und der Tab sichtbar ist. Das gilt für den Countdown, das Absinken der Bedürfnisse und die Evolutions-Timer. Ist der Tab im Hintergrund, bremst der Browser Timer ohnehin.

### 2.1 Ei und Schlüpfen (FR1.1)
- Der Spieler gibt einen Namen ein und wählt einen Typ.
- **(A)** Ein gültiger Name hat ohne Leerzeichen am Anfang und Ende 1 bis 20 Zeichen.
- Danach läuft ein **60-Sekunden-Countdown**. Bei 0 schlüpft das Tier und wird zum **Baby**. Die Restzeit wird gespeichert.

### 2.2 Pflege (FR1.2, NFR1.1)
- Es gibt vier Bedürfnisse: Fullness, Cleanliness, Entertainment und Rest. Jedes ist eine ganze Zahl von 0 bis 100.
- Feed, Wash, Play und Sleep erhöhen jeweils ihr Bedürfnis um **(A) 25**, höchstens auf 100.
- **(A)** Alle 10 Sekunden sinkt jedes Bedürfnis um 1, nie unter 0. Das passiert erst nach dem Schlüpfen.
- **(A)** Beim Schlüpfen starten alle Bedürfnisse bei 50.
- Die 4 Pflege-Buttons sind direkt auf dem Haustier-Screen. Jede Aktion braucht also 1 Klick, NFR1.1 erlaubt bis zu 2.

### 2.3 Happiness
```
H = round((F + C + E + R) / 4)
```

### 2.4 Evolution
| Von → Nach | Bedingung |
|---|---|
| Egg → Baby | Countdown von 60 s ist abgelaufen |
| Baby → First Evolution | H ≥ 70 für **300 s am Stück** |
| First Evolution → Second Evolution | H ≥ 80 für **600 s am Stück** |

- Jede Sekunde mit H über der Schwelle zählt den Evolutions-Timer um 1 hoch.
- Fällt H unter die Schwelle, springt der Timer auf 0.
- Nach jeder Evolution beginnt der Timer wieder bei 0.

### 2.5 Kampf
- **Voraussetzung:** Das Tier ist im Stadium Second Evolution. Vorher ist der Kampf-Button ausgeblendet.
- **Typen:** Es gibt Feuer, Wasser, Erde und Wind. Im Code heißen sie `"Fire"`, `"Water"`, `"Earth"` und `"Wind"`.

  | Typ | stark gegen | schwach gegen | neutral zu |
  |---|---|---|---|
  | Feuer | Wind | Wasser | Erde |
  | Wasser | Feuer | Erde | Wind |
  | Erde | Wasser | Wind | Feuer |
  | Wind | Erde | Feuer | Wasser |

  - **Kurz:** Feuer > Wind > Erde > Wasser > Feuer, wobei „>“ „stark gegen“ heißt.
  - **„Effektiv“** im Algorithmus bedeutet „stark gegen“. Nur das gibt einen Bonus.
  - **„Schwach“** hat keine eigene Wirkung, also keinen Abzug. Es heißt nur, dass der Gegner gegen uns stark ist und deshalb vielleicht seinen Bonus bekommt.
  - **Gleicher Typ gegen gleichen Typ** (z. B. Feuer gegen Feuer) gilt als neutral.
  - Zusätzlich gibt es Attacken vom Typ „Normal“. Sie passen zu keinem Tier und bekommen nie einen Bonus.
- **Attacke:** Jede Attacke hat Name, Typ, Angriff, Verteidigung und die Angabe, ob sie ein Konter ist. Jeder Tier-Typ und jeder Gegner hat genau 4 Attacken.
- **Start (A):** Beide Tiere haben 100 HP. Der Gegner wird zufällig aus der Gegnerliste gezogen.

**Eine Runde:**
1. Der Spieler klickt eine seiner 4 Attacken an. Der Gegner wählt zufällig eine seiner 4 Attacken.
2. Ist mindestens eine der beiden Attacken ein **Konter**, endet die Runde ohne Schaden.
3. Jede Seite berechnet die Werte für ihre eigene Attacke:
   - `p1 = 115`, wenn der Tier-Typ gleich dem Attacken-Typ ist, sonst `100`.
   - `p2 = 120`, wenn `p1 = 115` **und** das eigene Tier stark gegen das gegnerische ist, sonst `100`.
   - `Angriff = Math.round(attack × p1 × p2 / 10000)`
   - `Verteidigung = Math.round(defense × p1 × p2 / 10000)`
4. Schaden berechnen:
   - `Schaden am Gegner = max(0, Angriff Spieler − Verteidigung Gegner)`
   - `Schaden am Spieler = max(0, Angriff Gegner − Verteidigung Spieler)`
5. Beide Schäden werden gleichzeitig abgezogen. HP fallen nie unter 0.
6. Anzeige: zuerst „Gegner setzt X ein – n Schaden“, danach „Du setzt Y ein – m Schaden“.
7. Kampfende prüfen:
   - beide bei 0 → **Draw**
   - nur der Gegner bei 0 → **Win**
   - nur der Spieler bei 0 → **Loss**
   - sonst beginnt die nächste Runde.
8. Am Kampfende werden Gegner, Uhrzeit und Ergebnis gespeichert. Ein Win bringt +100 Münzen, Draw und Loss bringen **(A)** nichts.

> **Warum rechnen wir mit 115 und 120 statt mit 1.15 und 1.2?** In JavaScript ergibt `Math.round(25 * 1.15 * 1.2)` den Wert **34**, weil der Computer intern 34.4999… rechnet. Richtig wäre 34.5, also **35**. Mit ganzen Zahlen kommt korrekt 35 heraus: `Math.round(25 * 115 * 120 / 10000)`.

- **(A)** Ein abgebrochener Kampf, zum Beispiel durch Neuladen der Seite, wird nicht gespeichert.
- **(A)** Kämpfe verändern die Bedürfnisse nicht.

---

## 3. Technik

**HTML + CSS + JavaScript, ohne Framework**
- **Keine Installation:** Ein Browser reicht (Chrome, Edge oder ein anderer Chromium-Browser). Zum Spielen doppelklickt man `index.html`, zum Programmieren genügt jeder Texteditor.
- **Leicht zu erklären:** Die JS-Dateien werden mit normalen `<script>`-Tags nacheinander geladen. Jede Funktion ist global, es gibt kein `import`/`export` (das würde über Doppelklick in Chrome auch nicht funktionieren).

**Speichern in den Dateien `data.json` und `battles.json`**
- **Vorgabe:** Die „Datenbank“ muss eine echte Datei auf dem Rechner sein, die man öffnen und lesen kann. `localStorage` allein reicht nicht.
- **Entscheidung (07.10.2026):** Der Browser schreibt die Datei selbst, über die *File System Access API*. Wir brauchen keinen Server und installieren nichts.
- **Nur Chrome und Edge** (und andere Chromium-Browser) können das. Firefox und Safari zeigen beim Start den Hinweis „Bitte Chrome oder Edge verwenden“.
- **Ordner wählen:** Der Browser darf nur in einen Ordner schreiben, den der Spieler selbst ausgewählt hat. Beim ersten Start wählt man deshalb den Projektordner. Dort legt das Spiel `data.json` und `battles.json` an. Den Ordner merkt sich der Browser in *IndexedDB*, einer kleinen Datenbank im Browser (`localStorage` kann keine Ordner speichern).
- **Laden:** Beim Start liest das Spiel beide Dateien einmal ein. Danach liegt der Spielstand im Arbeitsspeicher, und die `load…`-Funktionen antworten sofort.
- **Zwei Dateien:** `data.json` enthält Tier und Münzen, `battles.json` alle Kämpfe. Warum getrennt, steht unter der NFR2.1-Messung.
- **Speichern:** Jede Speicherung schreibt die **ganze** Datei neu, mit `JSON.stringify` und eingerückt, damit man sie gut lesen kann.
- **Windows:** Schlägt das Schreiben fehl, weil ein anderes Programm (z. B. der Virenscanner) die Datei gerade kurz offen hat, versucht `storage.js` es bis zu 3-mal mit 200 ms Pause. Erst danach kommt die Meldung.
- **Nachprüfen:** `data.json` bzw. `battles.json` im Texteditor öffnen. Das brauchen wir für die Verifikation von DH2, DH3, DH6–DH10.

**(A) Klicks beim Start (DH11):** Getestet am 07.10.2026 in Helium (Chromium) auf macOS.
- **Seite neu laden** (F5, Tab schließen und wieder öffnen): **0 Klicks**. Der Browser hat sich Ordner und Zugriff gemerkt, das Spiel startet sofort.
- **Nach einem Neustart des Browsers:** **2 Klicks**. Der Browser merkt sich zwar den Ordner, fragt aber wieder nach dem Zugriff: „📂 Spielordner wählen“ und dann „Allow“ (auf Deutsch „Zulassen“). Eine Option, den Zugriff dauerhaft zu erlauben, gab es im Test nicht.
- **DH11 bleibt erfüllt:** Der Spielstand ist vollständig geladen, bevor der Haustier-Screen erscheint. Vorher ist nur der Spielstand-Screen sichtbar.

### Erfüllen die Dateien NFR2.1? Ja.

NFR2.1 verlangt: Bei 10.000 gespeicherten Kämpfen müssen das Tier und die 20 neuesten Kämpfe in unter 2 Sekunden geladen sein.

**Messung** am 07.10.2026 mit `tests/tests.html` in Helium (Chromium) auf macOS. Gemessen wird das, was beim Start passiert: Datei lesen, `JSON.parse`, Tier und die 20 neuesten Kämpfe holen.

| Gerät | Gespeicherte Kämpfe | Datei lesen + Tier + 20 neueste (5 Messungen) | Ganze Datei mit 10.000 Kämpfen schreiben |
|---|---|---|---|
| Erol: macOS, Helium | 10.000 (ca. 1,1 MB) | **1,5–2,2 ms** | 3,4 ms |
| Jan: Windows 11, Chrome | 10.000 (ca. 1,1 MB) | **17,6–20,0 ms** | **1473 ms** |

- Bei 10.000 Kämpfen ist das Laden auch auf Windows etwa **100-mal schneller** als die erlaubten 2000 ms.
- **Warum zwei Dateien?** Auf Windows prüft der Virenscanner jede Datei, nachdem Chrome sie geschrieben hat. Bei 1,1 MB dauerte das 1,5 s. Damals standen die Kämpfe noch in `data.json`, also hätte **jede Pflege-Aktion** so lange gebraucht. Das verletzt DH9 (unter 1 s). Deshalb stehen die Kämpfe seit 07.10.2026 in `battles.json`. Die kleine `data.json` (Tier und Münzen) ist schnell geschrieben, egal wie viele Kämpfe es gibt. `battles.json` wird nur am Kampfende geschrieben.
- **Noch offen:** Messung auf Windows mit den zwei Dateien (Jan).
- **Speicherplatz:** Eine Datei hat keine 5-MB-Grenze wie `localStorage`. 10.000 Kämpfe sind etwa 1,1 MB groß (DH12).
- **Speichern schlägt fehl** (z. B. Zugriff verloren oder Festplatte voll): Die Meldung „Speichern fehlgeschlagen“ erscheint **einmal**, nicht bei jeder Speicherung. Alte Kämpfe löschen wir nie automatisch (DH12).
- **Noch offen:** Die endgültige Messung findet auf dem vereinbarten Testrechner statt (siehe Abschnitt 10).

So muss gespeichert werden, damit es schnell bleibt:
- Alle Kämpfe stehen in `battles.json` als **eine** Liste.
- Neue Kämpfe werden **hinten** angehängt.
- Die 20 neuesten sind daher einfach die letzten 20 Einträge der Liste, umgedreht.

---

## 4. Dateien

**15 Dateien für Code und Tests**, dazu README, dieser Plan und `.gitignore`. V = Victoria, E = Erol, J = Jan. **Jede Datei ändert nur ihr Owner.**

```
Gruppe6-HatchHeroes/
├── index.html            E   Alle 5 Screens (Spielstand, Ei, Haustier, Kampf, Historie) + <script>-Tags
├── style.css             V   Allgemeines Design + Ei- und Haustier-Screen
├── battle.css            J   Kampf-Screen
├── history.css           E   Spielstand-Screen + Test-Leiste (Tempo, Neu starten) + Historie-Screen
├── js/
│   ├── pet.js            V   Logik: Name prüfen, Pflege-Aktionen, Bedürfnisse sinken
│   ├── petScreen.js      V   Ei- und Haustier-Screen anzeigen, Button-Klicks
│   ├── evolution.js      E   Logik: Happiness, Countdown, Evolution
│   ├── storage.js        E   Speichern und Laden mit data.json und battles.json
│   ├── battle.js         J   Logik + Daten: Typen, Attacken, Gegner, Runde berechnen
│   ├── battleScreen.js   J   Kampf-Screen anzeigen, Button-Klicks, Kampf-Log
│   └── main.js           E   Start (Spielstand laden), Uhr (1 Tick pro Sekunde), Screen-Wechsel, Historie
├── tests/
│   ├── tests.html        E   Öffnen → zeigt alle Testergebnisse (✔ / ✘)
│   ├── test-pet.js       V
│   ├── test-evolution.js E   inkl. Speicher-Tests und NFR2.1-Messung (mit test-data.json und test-battles.json)
│   └── test-battle.js    J   inkl. NFR3.1-Messung
├── data.json                 Spielstand: Tier und Münzen. Legt das Spiel beim ersten Start an. Nicht im Repo (.gitignore)
├── battles.json              Spielstand: alle Kämpfe. Ebenso
├── .gitignore            E   Spielstand, Testdateien und .DS_Store nicht hochladen
├── README.md             E   Wie starte ich das Spiel und die Tests
├── PROJEKTPLAN.md        E
├── HUE1_Aenderungen.md   E   Fertige Texte für die HÜ1-Änderungen (Abschnitt 1)
├── HUE1_HatchHeroes.pdf
├── Algorithm.pdf
├── Data HatchHeroes.docx           Abgabe Übung 2
└── Care Actionen HatchHeroes.docx  Ideen für Pflege-Minispiele (siehe Abschnitt 11, Punkt 7)
```

**Warum Logik und Anzeige getrennt sind** (z. B. `pet.js` und `petScreen.js`): Die Logik-Dateien enthalten nur Rechnungen. Sie greifen weder auf HTML-Elemente noch auf den Speicher zu. Deshalb lädt `tests.html` sie direkt und prüft sie, ohne dass jemand klicken muss.

**`index.html`:** Erol schreibt diese Datei in Phase 0 fertig, mit allen Screens, Buttons und IDs. Danach ändert sie nur noch Erol. Wer ein neues Element braucht, sagt ihm Bescheid.

---

## 5. Gemeinsame Namen

Im Grundgerüst (Phase 0) steht jede dieser Funktionen schon als leere Funktion mit dem richtigen Namen. So kann jede Person sofort damit arbeiten, auch wenn die Dateien der anderen noch nicht fertig sind.

### Das Tier (ein normales JS-Objekt)
```js
creature = {
  name: "Flammi",
  type: "Fire",                // "Fire" | "Water" | "Earth" | "Wind"
  stage: "Egg",                // "Egg" | "Baby" | "First Evolution" | "Second Evolution"
  needs: { fullness: 50, cleanliness: 50, entertainment: 50, rest: 50 },
  eggCountdown: 60,            // Restsekunden bis zum Schlüpfen
  evolutionProgress: 0         // Sekunden, die die Happiness-Bedingung schon erfüllt ist (DH4)
}
```

### Gemeinsamer Spielstand (in `main.js`)
- `let creature` enthält das aktuelle Tier. Der Wert ist `null`, solange es noch keines gibt.
- `let coins` enthält die aktuellen Münzen.
- Alle Dateien dürfen diese zwei Variablen lesen und ändern. Wer etwas ändert, speichert danach mit `saveCreature()` bzw. `saveCoins()`.

### Funktionen
Jede Datei verwendet nur Funktionen, die hier stehen.

| Datei | Funktion | Was sie tut |
|---|---|---|
| `pet.js` (V) | `isValidName(text)` | `true`/`false` |
| | `careAction(creature, action)` | `action` ist `"feed"`, `"wash"`, `"play"` oder `"sleep"`. Erhöht das passende Bedürfnis um 25, höchstens auf 100. |
| | `decayNeeds(creature)` | Senkt alle 4 Bedürfnisse um 1, nie unter 0 |
| `petScreen.js` (V) | `showEggScreen()`, `showPetScreen()`, `updatePetScreen(creature, coins)` | Anzeige |
| `evolution.js` (E) | `calcHappiness(needs)` | Gibt 0–100 zurück |
| | `updateEvolution(creature)` | Lässt 1 Sekunde Countdown oder Evolutions-Timer vergehen. Gibt `true` zurück, wenn sich das Stadium geändert hat. |
| `storage.js` (E) | `saveCreature(creature)`, `loadCreature()` | `loadCreature()` gibt `null` zurück, wenn noch kein Tier existiert. |
| | `saveCoins(coins)`, `loadCoins()` | |
| | `addBattle(battle)`, `loadRecentBattles(count)`, `countBattles()` | `battle = { opponent, endedAt, result }` |
| | `openDataFolder(askUser)` | Nur für `main.js` und `tests.html`: holt den Projektordner und lädt `data.json` und `battles.json`. Gibt `true` zurück, wenn der Spielstand geladen ist. |
| `battle.js` (J) | `isStrongAgainst(type, enemyType)` | `true`, wenn `type` laut Tabelle in 2.5 stark gegen `enemyType` ist |
| | `startBattle(creature)` | Gibt ein Kampf-Objekt mit zufälligem Gegner und 100/100 HP zurück. |
| | `chooseOpponentAttack()` | Zufallszahl 0–3 |
| | `playRound(battle, playerAttack, opponentAttack)` | Bekommt beide Attacken-Nummern (0–3). Ändert die HP, gibt die 2 Log-Zeilen (Gegner, Spieler) zurück und setzt `battle.result` am Ende. |
| `battleScreen.js` (J) | `showBattleScreen(creature)` | Anzeige + Ablauf. Am Ende `addBattle()` und bei Win `saveCoins()`. |
| `main.js` (E) | `showScreen(name)` | `name` ist `"egg"`, `"pet"`, `"battle"` oder `"history"`. Dazu kommt `"file"`, der Spielstand-Screen beim Start. |

> **Seit dem Umstieg auf Dateien (07.10.2026) heißen alle Funktionen gleich wie vorher.** Die `save…`-Funktionen ändern den Spielstand im Arbeitsspeicher und schreiben danach die Datei. Die `load…`-Funktionen antworten weiter sofort. Victoria und Jan müssen an ihrem Code nichts ändern.

> **Warum bekommt `playRound` die Gegner-Attacke als Zahl übergeben,** statt sie selbst zufällig zu wählen? So können die Tests eine feste Gegner-Attacke vorgeben und das Ergebnis ist immer gleich. Im Spiel ruft `battleScreen.js` vorher `chooseOpponentAttack()` auf.

### IDs im Kampf-Screen (`index.html`, für `battleScreen.js` und `battle.css`)
Alle Elemente stehen in `<section id="screen-battle">`. Die Texte darin sind nur Platzhalter, die `battleScreen.js` überschreibt.

| ID | Element | Wofür |
|---|---|---|
| `battle-arena` | `<div>` | Umschließt Gegner und Spieler (für das Layout) |
| `battle-opponent` | `<div>` | Bereich des Gegners, steht oben |
| `battle-opponent-name` | `<span>` | Name des Gegners |
| `battle-opponent-type` | `<span>` | Typ des Gegners |
| `battle-opponent-image` | `<div>` | Bild/Emoji des Gegners |
| `battle-opponent-hp-bar` | `<progress>` | HP-Balken des Gegners (`max="100"`) |
| `battle-opponent-hp` | `<span>` | HP des Gegners als Zahl |
| `battle-player` | `<div>` | Bereich des eigenen Tiers |
| `battle-player-name` | `<span>` | Name des eigenen Tiers |
| `battle-player-type` | `<span>` | Typ des eigenen Tiers |
| `battle-player-image` | `<div>` | Bild/Emoji des eigenen Tiers |
| `battle-player-hp-bar` | `<progress>` | HP-Balken des eigenen Tiers (`max="100"`) |
| `battle-player-hp` | `<span>` | HP des eigenen Tiers als Zahl |
| `battle-attacks` | `<div>` | Umschließt die 4 Attacken-Buttons |
| `battle-attack-0` … `battle-attack-3` | `<button>` | Die 4 Attacken. Die Zahl ist die Attacken-Nummer für `playRound()`. |
| `battle-log` | `<ul>` | Kampf-Log: pro Runde 2 `<li>`, zuerst Gegner, dann Spieler |
| `battle-result` | `<p hidden>` | Ergebnis am Kampfende (Sieg, Niederlage, Unentschieden) |
| `battle-back-button` | `<button>` | Zurück zum Haustier-Screen. **Fertig in `main.js`:** bricht einen laufenden Kampf ab, gespeichert wird nichts. |

- **Zum Kampf-Screen wechseln:** `showBattleScreen()` ruft selbst `showScreen("battle")` auf. Der Kampf-Button im Haustier-Screen ruft `showBattleScreen(creature)` bereits auf (`petScreen.js`).
- **Jeder Aufruf von `showBattleScreen()` ist ein neuer Kampf.** HP, Log und Ergebnis müssen dort also zurückgesetzt werden, weil nach „Zurück“ noch die Werte vom letzten Kampf drinstehen.
- Wer ein weiteres Element braucht, sagt Erol Bescheid (Abschnitt 4).

---

## 6. Speichern (`storage.js`)

Der Spielstand steht in **zwei** Dateien im Projektordner. Warum zwei, steht in Abschnitt 3.

`data.json`, wird oft geschrieben (Pflege, Evolution, alle 5 s):
```json
{
  "creature": { "name": "Flammi", "type": "Fire", "stage": "Baby", "needs": { … }, "eggCountdown": 0, "evolutionProgress": 123 },
  "coins": 100
}
```

`battles.json`, wird nur am Kampfende geschrieben:
```json
[
  { "opponent": "Grimmzahn", "endedAt": "2026-10-07T16:30:00.000Z", "result": "Win" }
]
```

| Datei → Eintrag | Inhalt | Anforderungen |
|---|---|---|
| `data.json` → `creature` | Das Tier, oder `null`, solange es noch keines gibt | DH1–DH4, DH13 |
| `data.json` → `coins` | Münzen als Zahl | DH5 |
| `battles.json` | Liste aller Kämpfe, neueste hinten | DH6–DH8, DH12 |

**Wann gespeichert wird:**
- sofort nach jeder Pflege-Aktion (DH9)
- sofort nach dem Schlüpfen und nach jeder Evolution (DH10)
- sofort am Kampfende (DH5–DH8)
- zusätzlich alle 5 Sekunden, damit gesunkene Bedürfnisse und Timer-Stände erhalten bleiben (DH4, DH11)

**Wie schnell gespeichert wird:**
- Jede Speicherung schreibt die ganze Datei neu.
- Pflege und Evolution schreiben nur die kleine `data.json`. Die 1-Sekunden-Grenze aus DH9 und DH10 hält deshalb auch mit 10.000 Kämpfen. `tests.html` prüft das bei jedem Lauf.
- Am Kampfende wird `battles.json` geschrieben (DH6–DH8). Bei sehr vielen Kämpfen dauert das auf Windows länger (Abschnitt 3), passiert aber nur einmal pro Kampf.
- Die Speicherungen laufen nacheinander in einer Warteschlange, damit nie zwei gleichzeitig in die Datei schreiben.

**Laden (DH11):**
- Beim Start zeigt `main.js` zuerst nur den Spielstand-Screen.
- Ist der Ordner noch erlaubt, werden beide Dateien sofort geladen. Sonst klickt man auf „📂 Spielordner wählen“. Wie viele Klicks das sind, steht in der Annahme (A) in Abschnitt 3.
- Erst danach erscheint der Ei- oder Haustier-Screen.

**Kaputte Datei:** Wurde `data.json` oder `battles.json` von Hand falsch bearbeitet und ist kein gültiges JSON mehr, zeigt der Spielstand-Screen eine rote Fehlermeldung. Die Datei wird dann **nicht** überschrieben.

**Für Tests:**
- Die Dateinamen stehen in `dataFileName` und `battlesFileName`, normal `"data.json"` und `"battles.json"`.
- `tests.html` setzt sie auf `"test-data.json"` und `"test-battles.json"`, damit die Tests nie den echten Spielstand überschreiben.
- Ein eigener Test prüft am Ende, dass sich `data.json` und `battles.json` nicht verändert haben.
- Die Testdateien werden nach den Tests wieder gelöscht.

---

## 7. Arbeitsaufteilung (laut HÜ1)

| | Victoria | Erol | Jan |
|---|---|---|---|
| **Requirements** | FR1.1, FR1.2, NFR1.1 | FR2.1, FR2.2, NFR2.1, DH1–DH13 | FR3.1, FR3.2, NFR3.1 |
| **Dateien** | `pet.js`, `petScreen.js`, `style.css`, `test-pet.js` | `evolution.js`, `storage.js`, `main.js`, `index.html`, `history.css`, `tests.html`, `test-evolution.js`, `README.md`, `.gitignore` | `battle.js`, `battleScreen.js`, `battle.css`, `test-battle.js` |
| **Inhalt** | Name und Typ wählen, Countdown anzeigen, Tier mit CSS-Animation, Stadium, 4 Balken, 4 Pflege-Buttons, Münzen, Kampf-Button | Happiness, Evolution, Speichern/Laden, Spieluhr, Screen-Wechsel, Kampf-Historie (20 neueste) | Typen, Attacken, Gegner (mind. 3), Rundenberechnung, Kampf-Screen mit HP-Balken und Log |
| **HÜ1 anpassen** | FR1.1 | DH8, DH13, „database“ | FR3.1, FR3.2, Kampfalgorithmen |

---

## 8. Git

Wir arbeiten direkt auf `main`, ohne Branches und ohne Pull Requests.

**Einmalig auf jedem Rechner:**
```
git config --global pull.rebase true
```
Damit setzt `git pull` die eigenen neuen Commits einfach hinter die Commits der anderen. Ohne diese Einstellung bricht neueres Git ab, sobald zwei Personen gleichzeitig gepusht haben.

**Jedes Mal:**
1. `git pull` – **vor** dem Arbeiten
2. Nur **eigene** Dateien bearbeiten
3. `git add <eigene Dateien>` – Dateien einzeln angeben, **nicht** `git add .`, damit nichts Fremdes mitgeht
4. `git commit -m "Pflege: Bedürfnisse sinken alle 10 Sekunden"`
5. `git pull`
6. `git push`

**Wenn `git push` mit „rejected“ abbricht:** Jemand anderer war schneller. Einfach Schritt 5 und 6 wiederholen.

**Regeln:**
- Fremde Dateien nicht ändern. Stattdessen dem Owner Bescheid geben.
- Lieber oft kleine Commits als selten einen großen.
- Vor jedem Push `index.html` öffnen und kurz prüfen, ob das Spiel noch startet.
- `data.json` und `battles.json` sind der eigene Spielstand und kommen nie ins Repo. Das regelt `.gitignore` automatisch.

---

## 9. Reihenfolge

**Ziel: Bis morgen (07.10.2026) läuft ein Prototyp mit Ei, Pflege, Happiness, Evolution und Speichern.** Der Kampf gehört noch nicht zum Prototyp.

### Phase 0 – Grundgerüst (heute, 06.10.): Erol mit Claude
Phase 0 ist kein gemeinsames Treffen. Erol baut das Gerüst und pusht es. Erst danach fangen Victoria und Jan an.
- Alle 14 Dateien anlegen. Jede Funktion aus Abschnitt 5 steht schon als **leere Funktion** mit dem richtigen Namen und einem Kommentar darin. So lädt `index.html` von Anfang an ohne Fehler, und alle können sofort die Funktionen der anderen aufrufen.
- `index.html` fertig schreiben:
  - Ei-Screen und Haustier-Screen mit allen Buttons und IDs
  - Kampf- und Historie-Screen erst einmal als leere Platzhalter
- `tests.html` mit der Funktion `check()` anlegen
- Prüfen, ob `index.html` per Doppelklick startet und speichert (damals noch in `localStorage`, seit 07.10. in `data.json` und `battles.json`, siehe Abschnitt 3). Mindestens in Chrome, dazu in allen Browsern, die das Team benutzt.
- **Fertig, wenn:** Das Gerüst ist auf `main` gepusht, `index.html` und `tests.html` öffnen sich ohne Fehler in der Konsole (F12), und Victoria und Jan haben Bescheid bekommen.

### Phase 1 – Prototyp (heute ab Gerüst bis morgen, 07.10.)
Alle starten mit `git pull`. Victoria und Jan lesen vorher kurz die Abschnitte 2 und 5. Wer mit einer Annahme (A) nicht einverstanden ist, meldet sich sofort in der Gruppe.

| Victoria | Erol | Jan |
|---|---|---|
| `pet.js`: Name prüfen, Pflege-Aktionen, Bedürfnisse sinken lassen | **zuerst `storage.js`** (Tier und Münzen speichern und laden) | `battle.js`: Typtabelle, Attacken für alle 4 Typen, mind. 3 Gegner, `playRound` |
| `petScreen.js`: Ei-Screen (Name, Typ, Countdown), Haustier-Screen (Tier, Stadium, 4 Balken, Happiness, 4 Buttons) | `evolution.js`: Happiness, Countdown, Evolution | `test-battle.js` mit den Testfällen aus 10.1 |
| `style.css`: einfaches Design, Tier als Emoji oder Form mit CSS-Animation | `main.js`: Laden beim Start, Spieluhr, Speichern, Screen-Wechsel | – |
| `test-pet.js` | `test-evolution.js` (inkl. Speicher-Tests) | – |

**Der Prototyp ist fertig, wenn alle diese Punkte auf `main` funktionieren:**
1. Ei benennen, Typ wählen, der Countdown läuft sichtbar, das Tier schlüpft als Baby.
2. Die 4 Pflege-Buttons erhöhen ihre Balken. Die Balken sinken mit der Zeit.
3. Die Happiness wird angezeigt und passt zu den Balken.
4. Mit dem Tempo-Button auf 60× entwickelt sich das Tier zu First Evolution und danach zu Second Evolution.
5. Seite schließen und neu öffnen → Name, Typ, Bedürfnisse, Stadium und Evolutions-Fortschritt sind wieder da.
6. `tests.html`: Alle Tests von Victoria und Erol zeigen ✔.

**Wichtig für heute:**
- Erol schreibt `storage.js` als Erstes. Die Datei ist kurz, und `main.js` braucht sie.
- Victoria kann die Screens sofort bauen: Die leeren Funktionen aus dem Gerüst geben einfach noch nichts zurück.
- Jans Kampf-Logik hängt nicht vom Prototyp ab. Er kann parallel arbeiten, ohne auf jemanden zu warten.

### Danach
| Phase | Victoria | Erol | Jan | Fertig, wenn … |
|---|---|---|---|---|
| **2 Kampf einbauen** | Kampf-Button ab Second Evolution, bessere Grafik, HÜ1 anpassen (FR1.1) | Münzen, Kampf-Historie, HÜ1 anpassen (DH8, DH13, „database“) | `battleScreen.js`, `battle.css`, HÜ1 anpassen (FR3.x, Kampfalgorithmen) | Komplett spielbar: Ei → Second Evolution → Kampf → Historie. Nach einem Neustart ist alles wieder da. |
| **3 Abnahme** | Manuelle Tests FR1.x, NFR1.1 | Manuelle Tests DH, NFR2.1 auf dem Testrechner | Manuelle Tests FR3.x, NFR3.1 auf dem Testrechner | Alle Zeilen in 10.3 sind abgehakt. |
| **4 Feinschliff + Abgabe** | Grafik, Animation | README | Balancing der Attackenwerte | Abgabe |

---

## 10. Testen

### 10.1 Automatische Tests: `tests/tests.html` öffnen
- `tests.html` lädt alle Logik-Dateien und die drei Testdateien.
- Eine kleine Funktion `check(name, actual, expected)` vergleicht jeweils zwei Werte und schreibt ✔ oder ✘ auf die Seite.
- Die erwarteten Werte rechnen wir vorher von Hand aus.

**Pflege (Victoria)**
- Feed bei 95 → 100
- `decayNeeds` bei 0 → bleibt 0
- `isValidName("  ")` → false, `isValidName("Flammi")` → true, 21 Zeichen → false

**Happiness und Evolution (Erol)**
- Happiness (80, 70, 65, 90) → **76**
- Happiness (70, 70, 71, 71) → 70.5 → **71**
- Ei nach 59 × `updateEvolution` → noch Egg, nach 60 → Baby
- Baby mit H = 70: nach 299 s noch Baby, nach 300 s First Evolution, Timer wieder 0
- Baby mit H = 70 für 200 s, dann H = 69 → Timer 0
- First Evolution mit H = 80 für 600 s → Second Evolution

**Speichern (Erol)**, mit den echten Dateien `test-data.json` und `test-battles.json`. Dafür muss man einmal den Projektordner wählen bzw. den Zugriff erlauben.
- Tier, Münzen und Kämpfe speichern → stehen wirklich in der Datei
- Arbeitsspeicher leeren und neu aus der Datei laden, wie bei einem Neustart → gleiche Werte (DH11)
- 25 Kämpfe speichern → `loadRecentBattles(20)` liefert die 20 neuesten, den neuesten zuerst
- Neu starten → in der Datei steht ein leerer Spielstand
- Am Ende: `data.json` und `battles.json` wurden nicht verändert, die Testdateien sind gelöscht

**Kampf (Jan)**
- Typtabelle prüfen:
  - `isStrongAgainst` ist **nur** in diesen 4 Fällen `true`: Feuer→Wind, Wasser→Feuer, Erde→Wasser, Wind→Erde
  - Die anderen 12 Kombinationen sind `false`, z. B. Wind→Feuer, Feuer→Erde, Feuer→Feuer
- Ganze Runde: Feuer-Tier mit *Feuerball* (Feuer, A30/V10) gegen Wind-Tier mit *Windstoß* (Wind, A20/V10)
  - Spieler: Feuer ist stark gegen Wind → +15 % und +20 % → Angriff **41**, Verteidigung **14**
  - Gegner: Wind ist schwach gegen Feuer → nur +15 % → Angriff **23**, Verteidigung **12**
  - Gegner verliert 41 − 12 = **29** (→ 71 HP), Spieler verliert 23 − 14 = **9** (→ 91 HP)
- Neutrale Typen: Feuer-Tier mit *Feuerball* (A30) gegen Erde-Tier → nur +15 % → **35**
- Gleicher Typ: Feuer-Tier mit *Feuerball* (A30) gegen Feuer-Tier → nur +15 % → **35**
- Stark: Wasser-Tier mit Wasser-Attacke (A30) gegen Feuer-Tier → **41**
- Kein Bonus ohne passenden Attacken-Typ, auch wenn das Tier stark ist:
  - Feuer-Tier mit *Biss* (Normal, A20) gegen Wind → **20**
  - Wind-Tier mit einer Feuer-Attacke (A30) gegen Erde → **30**
- Rundungsfalle: Erde-Tier mit Erde-Attacke (A25) gegen Wasser → `25 × 115 × 120 / 10000 = 34.5` → **35**, nicht 34
- Ist eine Attacke ein Konter → die HP beider Tiere bleiben gleich
- Ist die Verteidigung größer als der Angriff → Schaden 0, nicht negativ
- Hat ein Tier 5 HP und bekommt 29 Schaden → 0 HP, nicht −24
- Ergebnis: beide bei 0 → `Draw`, nur der Gegner bei 0 → `Win`, nur der Spieler bei 0 → `Loss`
- Log-Reihenfolge: Die erste Zeile gehört zum Gegner, die zweite zum Spieler.

### 10.2 Performance (läuft ebenfalls in `tests.html`)
- **NFR2.1 (Erol):** 10.000 Test-Kämpfe in `test-battles.json` schreiben.
  - Danach 5-mal mit `performance.now()` messen, wie lange es dauert, beide Dateien zu lesen und daraus das Tier und die 20 neuesten Kämpfe zu laden. **Jede Messung muss unter 2000 ms liegen.**
  - Außerdem muss `countBattles()` nach dem Laden genau 10.000 ergeben (DH12).
  - `data.json` schreiben muss auch mit 10.000 Kämpfen unter 1000 ms dauern (DH9, DH10).
  - Am Ende werden die Testdaten gelöscht.
  - **Vorher den Spiel-Tab schließen.** Sonst speichert das Spiel währenddessen in `data.json`, und der Test „data.json und battles.json nicht verändert“ schlägt zu Recht fehl.
- **NFR3.1 (Jan):** 100 Kämpfe mit zufälligen Attacken durchspielen und jeden `playRound`-Aufruf messen. **Mindestens 95 % der Aufrufe müssen unter 200 ms liegen.**
- Die Ergebnisse vom Testrechner (Gerät und Browser) kommen ins README.

### 10.3 Manuelle Tests (Phase 3, mit Datum und Namen abhaken)
| Anforderung | Prüfung |
|---|---|
| FR1.1 | Ei benennen → Countdown ist sichtbar → Tier und Stadium werden angezeigt |
| NFR1.1 | Klicks vom Haustier-Screen bis zu jeder Aktion zählen. Soll: 1 Klick |
| DH1, DH5, DH11 | Name vergeben, Kampf gewinnen, Tab schließen und wieder öffnen → Name und Münzen sind gleich (0 Klicks). Browser ganz beenden und neu starten → nach 2 Klicks (A) ist alles wieder da |
| DH2, DH3, DH9, DH10 | Aktion bzw. Evolution auslösen → `data.json` im Texteditor öffnen und nachsehen |
| DH4 | Happiness halten → neu laden → Evolutions-Timer ist wiederhergestellt |
| DH6–DH8 | Win, Loss und Draw spielen → Historie und `battles.json` prüfen |
| FR3.1 | Kampf-Button erscheint erst ab Second Evolution, der Log zeigt den Gegner vor dem Spieler |

**Schneller testen:** Oben auf der Seite steht der Button **⏩ Tempo**. Jeder Klick schaltet weiter: 1× → 10× → 60× → 1×.
- Bei 60× vergeht pro echter Sekunde eine Spielminute: Die Evolution braucht 5 s bzw. 10 s statt 5 bzw. 10 Minuten.
- Das Tempo wird nicht gespeichert. Nach dem Neuladen steht es wieder auf 1×.

---

## 11. Offene Punkte

| # | Punkt | Wer | Bis |
|---|---|---|---|
| 1 | Annahmen (A) bestätigen | Victoria, Jan | vor ihrem Start heute |
| 2 | Prüfen, ob `index.html` per Doppelklick startet und in `data.json` und `battles.json` speichert. **Seit 07.10. geht das nur in Chrome, Edge oder einem anderen Chromium-Browser.** | Erol (Helium ✔ am 07.10.), Victoria + Jan (eigener Browser, beim ersten Start den Projektordner wählen) | sofort |
| 3 | Testrechner festlegen (Gerät + Browser). Der Browser muss Chromium-basiert sein (Abschnitt 3). | alle | vor Phase 3 |
| 4 | Vorgabe steht fest (Datenbank = lesbare Datei). Noch offen: kurz von der LV-Leitung bestätigen lassen, dass `data.json` und `battles.json` so passen (Abschnitt 3). | Erol | so bald wie möglich |
| 5 | Kämpfe könnten zu lange dauern (viele Konter, Verteidigung ≥ Angriff) → Attackenwerte anpassen | Jan | Phase 2 |
| 6 | KI-Nutzung im Prompt-Protokoll festhalten | alle | laufend |
| 7 | Victorias `Care Actionen HatchHeroes.docx` (Ballspiel, Streicheln, Waschen als Minispiel, Shop) widerspricht der HÜ1. Dort ist Happiness der Durchschnitt der 4 Bedürfnisse, es gibt keinen Shop und keine Münzen fürs Spielen, und NFR1.1 erlaubt max. 2 Klicks. **Entscheidung:** Der Prototyp verwendet 4 einfache Buttons. Die Minispiele kommen danach als Erweiterung und wirken auf die Bedürfnisse (z. B. Ball → Entertainment), nicht direkt auf die Happiness. | Victoria + Erol | nach dem Prototyp |
| 8 | Victoria und Jan über `data.json` informieren: kein Code ändern, aber Chrome/Edge verwenden und beim ersten Start den Projektordner wählen | Erol | heute |
