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

## Spielstand ansehen oder löschen

Der Spielstand steht in zwei Dateien im Projektordner. Man kann beide mit jedem Texteditor öffnen.
- `data.json`: `creature` ist das Tier (`null`, solange es noch keines gibt), `coins` sind die Münzen.
- `battles.json`: die Liste aller Kämpfe, der neueste steht ganz unten.

**Löschen:** Im Spiel auf „🔄 Neu starten“ klicken. Oder bei geschlossenem Spiel `data.json` und `battles.json` löschen. Beim nächsten Start werden sie leer neu angelegt.

**Von Hand ändern:** Nur bei geschlossenem Spiel, denn das Spiel überschreibt `data.json` alle 5 Sekunden. Ist eine Datei danach kein gültiges JSON mehr, zeigt das Spiel beim Start eine Fehlermeldung und lässt die Datei unverändert.

`data.json` und `battles.json` kommen nie ins Repo (stehen in `.gitignore`). Jede Person hat ihren eigenen Spielstand.

## Git (jedes Mal)

1. `git pull`
2. Nur eigene Dateien bearbeiten (wem welche Datei gehört, steht in `PROJEKTPLAN.md`, Abschnitt 4)
3. `git add <eigene Dateien>`
4. `git commit -m "kurze Beschreibung"`
5. `git pull`
6. `git push`

Alles Weitere steht in [PROJEKTPLAN.md](PROJEKTPLAN.md).
