// Owner: Jan
// Anzeige des Kampf-Screens + Button-Klicks.
// Die IDs der HTML-Elemente stehen in index.html (PROJEKTPLAN.md, Abschnitt 5).
// Die Variablen creature und coins kommen aus main.js.
//
// Ablauf eines Kampfs:
// showBattleScreen() → pro Klick handleAttackClick() → am Ende endBattle()

const BATTLE_RESULT_MESSAGES = {
  Win: "🏆 Sieg! Du hast den Kampf gewonnen (+" + WIN_COINS + " Münzen).",
  Loss: "💀 Niederlage! Du hast den Kampf verloren.",
  Draw: "🤝 Unentschieden!"
};

// Der laufende Kampf (siehe startBattle() in battle.js). null, solange noch keiner lief.
let currentBattle = null;
let attackButtonsInitialized = false;

// FR3.1: Startet einen neuen Kampf und zeigt ihn an.
// Jeder Aufruf ist ein neuer Kampf: HP, Log und Ergebnis vom letzten Kampf werden zurückgesetzt.
function showBattleScreen(creature) {
  initBattleAttackButtons();
  currentBattle = startBattle(creature);

  showFighters();
  updateBattleHp();
  labelAttackButtons();
  setAttackButtonsEnabled(true);
  document.getElementById("battle-log").textContent = "";
  hideBattleResult();

  showScreen("battle");
}

// Klick-Handler für die 4 Attacken-Buttons nur einmal anmelden,
// sonst würde ein Klick nach mehreren Kämpfen mehrfach zählen.
function initBattleAttackButtons() {
  if (attackButtonsInitialized) {
    return;
  }
  attackButtonsInitialized = true;
  for (let i = 0; i < 4; i++) {
    getAttackButton(i).addEventListener("click", function () {
      handleAttackClick(i);
    });
  }
}

// Behandelt einen Klick auf einen der 4 Attacken-Buttons (0–3).
function handleAttackClick(playerAttackIndex) {
  if (currentBattle === null || currentBattle.result !== null) {
    return;
  }

  const opponentAttackIndex = chooseOpponentAttack();
  const logLines = playRound(currentBattle, playerAttackIndex, opponentAttackIndex);

  updateBattleHp();
  addLogLines(logLines);

  if (currentBattle.result !== null) {
    endBattle();
  }
}

// DH6–DH8: Schließt den Kampf ab: Buttons sperren, Ergebnis anzeigen, speichern.
function endBattle() {
  setAttackButtonsEnabled(false);
  showBattleResult(currentBattle.result);

  addBattle({
    opponent: currentBattle.opponent.name,
    endedAt: new Date().toISOString(),
    result: currentBattle.result
  });

  // Bei Sieg Münzen gutschreiben und speichern
  if (currentBattle.result === "Win") {
    coins = coins + WIN_COINS;
    saveCoins(coins);
    updatePetScreen(creature, coins);
  }
}


// ===== Kleine Anzeige-Helfer =====

function getAttackButton(index) {
  return document.getElementById("battle-attack-" + index);
}

// Name, Typ und Bild von Gegner und eigenem Tier anzeigen.
// data-type färbt Typ-Schild und Bild in der Typfarbe (style.css).
function showFighters() {
  const opponent = currentBattle.opponent;
  document.getElementById("battle-opponent").dataset.type = opponent.type;
  document.getElementById("battle-opponent-name").textContent = opponent.name;
  document.getElementById("battle-opponent-type").textContent = TYPE_NAMES[opponent.type];
  document.getElementById("battle-opponent-image").textContent = opponent.image;

  const player = currentBattle.creature;
  document.getElementById("battle-player").dataset.type = player.type;
  document.getElementById("battle-player-name").textContent = player.name;
  document.getElementById("battle-player-type").textContent = TYPE_NAMES[player.type];
  document.getElementById("battle-player-image").textContent = getCreatureImage(player);
}

// HP-Balken und HP-Zahlen beider Seiten aktualisieren.
function updateBattleHp() {
  showHp("opponent", currentBattle.opponentHp);
  showHp("player", currentBattle.playerHp);
}

// side ist "opponent" oder "player" (passend zu den IDs in index.html).
function showHp(side, hp) {
  const bar = document.getElementById("battle-" + side + "-hp-bar");
  bar.max = START_HEALTH;
  bar.value = hp;
  document.getElementById("battle-" + side + "-hp").textContent = hp;
}

// Beschriftet die 4 Buttons, z. B. "Feuerball (30 / 10)" oder "Feuerschild (Konter)".
function labelAttackButtons() {
  for (let i = 0; i < 4; i++) {
    const attack = currentBattle.playerAttacks[i];
    if (attack.isCounter) {
      getAttackButton(i).textContent = attack.name + " (Konter)";
    } else {
      getAttackButton(i).textContent = attack.name + " (" + attack.attack + " / " + attack.defense + ")";
    }
  }
}

function setAttackButtonsEnabled(enabled) {
  for (let i = 0; i < 4; i++) {
    getAttackButton(i).disabled = !enabled;
  }
}

// Hängt die Log-Zeilen einer Runde an (zuerst Gegner, dann Spieler) und scrollt nach unten.
function addLogLines(logLines) {
  const logList = document.getElementById("battle-log");
  for (const text of logLines) {
    const line = document.createElement("li");
    line.textContent = text;
    logList.appendChild(line);
  }
  logList.scrollTop = logList.scrollHeight;
}

// battle.css färbt das Ergebnis über data-result: Win, Loss oder Draw.
function showBattleResult(result) {
  const resultBox = document.getElementById("battle-result");
  resultBox.textContent = BATTLE_RESULT_MESSAGES[result];
  resultBox.dataset.result = result;
  resultBox.hidden = false;
}

function hideBattleResult() {
  const resultBox = document.getElementById("battle-result");
  resultBox.hidden = true;
  resultBox.textContent = "";
  resultBox.removeAttribute("data-result");
}
