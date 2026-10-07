# HatchHeroes

Tamagotchi-Spiel mit Kämpfen – Gruppe 6, Einführung in Software Engineering, FH Technikum Wien.
Team: Victoria Hausegger, Erol Bilyalov, Jan Magbual

## Spiel starten

`index.html` doppelklicken. Es muss nichts installiert werden.

**Browser:** Chrome, Edge oder ein anderer Chromium-Browser. Nur diese können den Spielstand in eine Datei speichern. Firefox und Safari zeigen einen Hinweis.

**Beim ersten Start:** Auf „📂 Spielordner wählen“ klicken und den Projektordner `Gruppe6-HatchHeroes` auswählen. Danach den Zugriff erlauben. Das Spiel legt dort die Dateien `data.json` und `battles.json` an.

**Bei späteren Starts:**
- Seite neu laden: Das Spiel startet sofort.
- Nach einem Neustart des Browsers: „📂 Spielordner wählen“ klicken und „Allow“ bzw. „Zulassen“ wählen (2 Klicks).

## Tests starten

1. Das Spiel schließen. Sonst speichert es während der Tests in `data.json`, und ein Test meldet das als Fehler.
2. `tests/tests.html` doppelklicken. Falls nötig, den Projektordner wählen bzw. den Zugriff erlauben. Erst dann laufen die Speicher-Tests.
3. Oben steht, wie viele Tests bestanden sind. Darunter steht jeder Test mit ✔ (grün) oder ✘ (rot).

Die Tests schreiben nur in `test-data.json` und `test-battles.json` und löschen beide am Ende wieder. `data.json` und `battles.json` bleiben unberührt.

## Testergebnisse auf dem Testrechner

Testrechner: Erols Mac mit Helium (Chromium), 07.10.2026. `tests/tests.html`: alle Tests ✔.

| Anforderung | Soll | Ergebnis |
|---|---|---|
| NFR2.1 | Tier + 20 neueste Kämpfe bei 10.000 Kämpfen in unter 2000 ms laden | ✔ 1,5–2,2 ms (5 Messungen) |
| NFR3.1 | mind. 95 % der `playRound`-Aufrufe unter 200 ms | ✔ |

Zum Vergleich auf Windows 11 mit Chrome (Jan): Laden 24–29 ms, also ebenfalls erfüllt. Jede Speicherung dauert dort aber 1,7–3,2 s (siehe `PROJEKTPLAN.md`, Abschnitt 3).

## Spielstand ansehen oder löschen

Der Spielstand steht in zwei Dateien im Projektordner. Man kann beide mit jedem Texteditor öffnen.
- `data.json`: `creature` ist das Tier (`null`, solange es noch keines gibt), `coins` sind die Münzen.
- `battles.json`: die Liste aller Kämpfe, der neueste steht ganz unten.

**Löschen:** Im Spiel auf „🔄 Neu starten“ klicken. Oder bei geschlossenem Spiel `data.json` und `battles.json` löschen. Beim nächsten Start werden sie leer neu angelegt.

**Von Hand ändern:** Nur bei geschlossenem Spiel, denn das Spiel überschreibt `data.json` alle 5 Sekunden. Ist eine Datei danach kein gültiges JSON mehr, zeigt das Spiel beim Start eine Fehlermeldung und lässt die Datei unverändert.

`data.json` und `battles.json` kommen nie ins Repo (stehen in `.gitignore`). Jede Person hat ihren eigenen Spielstand.

## Überblick über den Code

```
index.html      alle Screens als HTML        css/      Design (ein Stylesheet pro Person)
js/             der ganze Code               tests/    tests.html + eine Testdatei pro Person
docs/           Abgaben und Unterlagen (PDF, docx), kein Code
```

Der Code in `js/` hat vier Arten von Dateien:

| Art | Dateien | Was drin ist |
|---|---|---|
| **Logik** | `pet.js`, `evolution.js`, `battle.js` | Nur Rechnungen und Tabellen. Kein HTML, kein Speichern. Deshalb kann `tests.html` sie direkt prüfen. |
| **Speichern** | `storage.js` | Liest und schreibt `data.json` und `battles.json` |
| **Anzeige** | `petScreen.js`, `battleScreen.js`, `historyScreen.js` | Eine Datei pro Screen: füllt das HTML und reagiert auf Button-Klicks |
| **Start** | `main.js` | Lädt den Spielstand, startet die Spieluhr, wechselt die Screens. Wird als letzte geladen. |

**So hängt alles zusammen:** Es gibt kein `import`. `index.html` lädt alle Dateien nacheinander mit `<script>`, danach kennt jede Datei die Funktionen der anderen. Den Spielstand halten die zwei Variablen `creature` und `coins` in `main.js`.

**Was passiert wann?**
- **Beim Öffnen:** `main.js` lädt den Spielstand (`openDataFolder()` in `storage.js`) und ruft danach `startGame()` auf. Diese Funktion meldet alle Buttons an und zeigt den Ei- oder den Haustier-Screen.
- **Jede Sekunde:** `tick()` in `main.js` → `decayNeeds()` (pet.js) und `updateEvolution()` (evolution.js) → alle 5 s `saveCreature()` → `updatePetScreen()`.
- **Klick auf Pflege:** `petScreen.js` → `careAction()` → `saveCreature()` → `updatePetScreen()`.
- **Kampf:** `showBattleScreen()` → pro Klick `playRound()` (battle.js) → am Ende `addBattle()` und bei Sieg `saveCoins()`.

**Wo finde ich …?**

| Ich suche … | Datei |
|---|---|
| Startwerte eines neuen Tiers, Typnamen, Tierbilder | `js/pet.js` |
| Schwellen und Zeiten für die Evolution | `js/evolution.js` (Konstanten oben) |
| Attacken, Gegner, Schadensformel | `js/battle.js` |
| Tempo, Speichern alle 5 s, Screen-Wechsel | `js/main.js` |
| eine ID wie `battle-log` | `index.html` |
| alle Funktionsnamen und wer sie verwendet | `PROJEKTPLAN.md`, Abschnitt 5 |
| Spielregeln (Zahlen, Formeln) | `PROJEKTPLAN.md`, Abschnitt 2 |

## Git (jedes Mal)

1. `git pull`
2. Nur eigene Dateien bearbeiten (wem welche Datei gehört, steht in `PROJEKTPLAN.md`, Abschnitt 4)
3. `git add <eigene Dateien>`
4. `git commit -m "kurze Beschreibung"`
5. `git pull`
6. `git push`

Alles Weitere steht in [PROJEKTPLAN.md](PROJEKTPLAN.md).
