// Owner: Jan
// Kampf-Logik und Kampf-Daten – nur Rechnungen, kein HTML, kein localStorage.
// Regeln: PROJEKTPLAN.md, Abschnitt 2.5

const START_HEALTH = 100;
const WIN_COINS = 100;

// TODO Jan: Typtabelle (wer ist stark gegen wen), 4 Attacken je Typ,
//           mindestens 3 Gegner mit je 4 Attacken

// Gibt true zurück, wenn type laut Tabelle stark gegen enemyType ist.
function isStrongAgainst(type, enemyType) {
  // TODO Jan
}

// Gibt ein neues Kampf-Objekt zurück: zufälliger Gegner, beide mit START_HEALTH.
function startBattle(creature) {
  // TODO Jan
}

// Gibt eine zufällige Attacken-Nummer des Gegners zurück (0 bis 3).
function chooseOpponentAttack() {
  // TODO Jan
}

// Spielt eine Runde: playerAttack und opponentAttack sind Nummern von 0 bis 3.
// Ändert die HP in battle, setzt am Ende battle.result ("Win", "Loss" oder "Draw")
// und gibt die 2 Log-Zeilen zurück: zuerst Gegner, dann Spieler.
function playRound(battle, playerAttack, opponentAttack) {
  // TODO Jan
}
