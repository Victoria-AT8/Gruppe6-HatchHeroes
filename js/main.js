// Owner: Erol
// Start des Spiels: Laden, Spieluhr, Speichern, Screen-Wechsel (PROJEKTPLAN.md, Abschnitt 6).
// Diese Datei wird als letzte geladen.

// Zum Testen auf 60 setzen (1 echte Sekunde = 1 Spielminute). Vor dem Commit wieder auf 1!
const SPEED = 1;

// Der aktuelle Spielstand. Alle Dateien dürfen diese Variablen lesen und ändern.
let creature = null;
let coins = 0;

// Zeigt genau einen Screen an und versteckt die anderen.
// name ist "egg", "pet", "battle" oder "history".
function showScreen(name) {
  // TODO Erol
}

// TODO Erol:
// 1. creature und coins mit loadCreature() und loadCoins() laden
// 2. passenden Screen anzeigen (kein Tier → "egg", sonst "pet")
// 3. Spieluhr starten: jede Sekunde (nur wenn der Tab sichtbar ist)
//    updateEvolution(), alle 10 Sekunden decayNeeds(), alle 5 Sekunden saveCreature()
