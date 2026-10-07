// Owner: Erol
// Anzeige des Historie-Screens: die 20 neuesten Kämpfe (DH6–DH8, NFR2.1).
// Die IDs der HTML-Elemente stehen in index.html, das Design in css/history.css.

const HISTORY_LENGTH = 20;

// DH8: Übersetzt das gespeicherte Ergebnis ("Win", "Loss", "Draw") für die Anzeige.
// Gespeichert bleibt immer der englische Wert.
const RESULT_NAMES = { Win: "Sieg", Loss: "Niederlage", Draw: "Unentschieden" };

// So wird das Datum angezeigt, z. B. "06.10.26, 18:30"
const HISTORY_DATE_FORMAT = { dateStyle: "short", timeStyle: "short" };

// DH6–DH8, NFR2.1: Zeigt die 20 neuesten Kämpfe an, den neuesten zuerst.
// Eine Zeile hat 3 Teile: Gegner "Grimmzahn", Datum "06.10.26, 18:30" und Ergebnis "Sieg".
// history.css ordnet sie nebeneinander an.
function showHistory() {
  const battles = loadRecentBattles(HISTORY_LENGTH);
  const list = document.getElementById("history-list");

  list.textContent = "";   // alte Zeilen entfernen
  for (const battle of battles) {
    const line = document.createElement("li");
    line.dataset.result = battle.result;   // history.css färbt die Zeile: Win grün, Loss rot, Draw grau

    const opponent = document.createElement("strong");
    opponent.textContent = battle.opponent;

    const endedAt = document.createElement("time");
    endedAt.dateTime = battle.endedAt;
    endedAt.textContent = new Date(battle.endedAt).toLocaleString("de-AT", HISTORY_DATE_FORMAT);

    const result = document.createElement("span");
    result.textContent = RESULT_NAMES[battle.result];

    line.append(opponent, endedAt, result);
    list.appendChild(line);
  }

  // Ohne Kämpfe: Hinweis statt leerer Liste
  document.getElementById("history-empty").hidden = battles.length > 0;
  showScreen("history");
}
