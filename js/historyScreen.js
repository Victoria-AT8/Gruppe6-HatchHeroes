// Owner: Erol
// Anzeige des Historie-Screens: die 20 neuesten Kämpfe (DH6–DH8, NFR2.1).
// Die IDs der HTML-Elemente stehen in index.html, das Design in css/history.css.

const HISTORY_LENGTH = 20;

// DH8: Übersetzt das gespeicherte Ergebnis ("Win", "Loss", "Draw") für die Anzeige.
// Gespeichert bleibt immer der englische Wert.
const RESULT_NAMES = { Win: "Sieg", Loss: "Niederlage", Draw: "Unentschieden" };

// DH6–DH8, NFR2.1: Zeigt die 20 neuesten Kämpfe an, den neuesten zuerst.
// Eine Zeile sieht so aus: "Grimmzahn – 6.10.2026, 18:30:00 – Sieg"
function showHistory() {
  const battles = loadRecentBattles(HISTORY_LENGTH);
  const list = document.getElementById("history-list");

  list.textContent = "";   // alte Zeilen entfernen
  for (const battle of battles) {
    const line = document.createElement("li");
    const endedAt = new Date(battle.endedAt).toLocaleString("de-AT");
    line.textContent = battle.opponent + " – " + endedAt + " – " + RESULT_NAMES[battle.result];
    line.dataset.result = battle.result;   // history.css färbt die Zeile: Win grün, Loss rot, Draw grau
    list.appendChild(line);
  }

  // Ohne Kämpfe: Hinweis statt leerer Liste
  document.getElementById("history-empty").hidden = battles.length > 0;
  showScreen("history");
}
