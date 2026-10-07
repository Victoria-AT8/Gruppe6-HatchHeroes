// Owner: Jan
// Anzeige des Kampf-Screens + Button-Klicks.
// Die IDs der HTML-Elemente stehen in index.html (Abschnitt 5).
// Die Variablen creature und coins kommen aus main.js.

const BATTLE_TYPE_NAMES = {
  Fire: "Feuer",
  Water: "Wasser",
  Earth: "Erde",
  Wind: "Wind"
};

const BATTLE_CREATURE_IMAGES = {
  Fire: { Baby: "🐣", "First Evolution": "🐦", "Second Evolution": "🐦‍🔥" },
  Water: { Baby: "🐟", "First Evolution": "🐬", "Second Evolution": "🐋" },
  Earth: { Baby: "🐱", "First Evolution": "🐆", "Second Evolution": "🦁" },
  Wind: { Baby: "🐛", "First Evolution": "🦋", "Second Evolution": "🦅" }
};

let currentBattle = null;
let attackButtonsInitialized = false;

// Klick-Handler für die 4 Attacken-Buttons nur einmal anmelden (PROJEKTPLAN.md / Feedback Jan)
function initBattleAttackButtons() {
  if (attackButtonsInitialized) {
    return;
  }
  attackButtonsInitialized = true;

  for (let i = 0; i < 4; i++) {
    const btn = document.getElementById("battle-attack-" + i);
    if (btn) {
      btn.addEventListener("click", function () {
        handleAttackClick(i);
      });
    }
  }
}

// Aktualisiert die HP-Balken und Textanzeigen beider Kontrahenten
function updateBattleHp() {
  const oppHpBar = document.getElementById("battle-opponent-hp-bar");
  const oppHpText = document.getElementById("battle-opponent-hp");
  const playerHpBar = document.getElementById("battle-player-hp-bar");
  const playerHpText = document.getElementById("battle-player-hp");

  if (oppHpBar) {
    oppHpBar.value = currentBattle.opponentHp;
  }
  if (oppHpText) {
    oppHpText.textContent = currentBattle.opponentHp;
  }
  if (playerHpBar) {
    playerHpBar.value = currentBattle.playerHp;
  }
  if (playerHpText) {
    playerHpText.textContent = currentBattle.playerHp;
  }
}

// Behandelt einen Klick auf einen der 4 Attacken-Buttons (0–3)
function handleAttackClick(playerAttackIndex) {
  if (currentBattle === null || currentBattle.result !== null) {
    return;
  }

  // Gegner wählt zufällig eine seiner 4 Attacken
  const opponentAttackIndex = chooseOpponentAttack();

  // Runde berechnen
  const logLines = playRound(currentBattle, playerAttackIndex, opponentAttackIndex);

  // HP-Anzeige aktualisieren
  updateBattleHp();

  // Kampf-Log erweitern: zuerst Gegner, dann Spieler
  const logList = document.getElementById("battle-log");
  if (logList) {
    for (const lineText of logLines) {
      const li = document.createElement("li");
      li.textContent = lineText;
      logList.appendChild(li);
    }
    logList.scrollTop = logList.scrollHeight;
  }

  // Kampfende prüfen
  if (currentBattle.result !== null) {
    endBattle();
  }
}

// Schließt den Kampf ab: Buttons sperren, Resultat anzeigen, Speichern
function endBattle() {
  // 1. Attacken-Buttons deaktivieren
  for (let i = 0; i < 4; i++) {
    const btn = document.getElementById("battle-attack-" + i);
    if (btn) {
      btn.disabled = true;
    }
  }

  // 2. Ergebnis am Kampfende anzeigen
  const resultEl = document.getElementById("battle-result");
  if (resultEl) {
    const resultMessages = {
      Win: "🏆 Sieg! Du hast den Kampf gewonnen (+100 Münzen).",
      Loss: "💀 Niederlage! Du hast den Kampf verloren.",
      Draw: "🤝 Unentschieden!"
    };
    resultEl.textContent = resultMessages[currentBattle.result] || currentBattle.result;
    resultEl.dataset.result = currentBattle.result;
    resultEl.hidden = false;
  }

  // 3. Kampf zur Historie hinzufügen
  addBattle({
    opponent: currentBattle.opponent.name,
    endedAt: new Date().toISOString(),
    result: currentBattle.result
  });

  // 4. Bei Sieg Münzen gutschreiben und speichern
  if (currentBattle.result === "Win") {
    coins = coins + WIN_COINS;
    saveCoins(coins);
    if (typeof updatePetScreen === "function") {
      updatePetScreen(creature, coins);
    }
  }
}

// Startet einen neuen Kampf und zeigt ihn an:
// Attacken-Buttons, 2 HP-Balken, Log (zuerst Gegner, dann Spieler).
// Am Kampfende: addBattle() und bei "Win" coins erhöhen und saveCoins().
function showBattleScreen(creature) {
  // Buttons genau einmal registrieren
  initBattleAttackButtons();

  // Neuen Kampf mit zufälligem Gegner und 100/100 HP initialisieren
  currentBattle = startBattle(creature);

  // Screen anzeigen
  showScreen("battle");

  // Gegner-Infos setzen
  document.getElementById("battle-opponent-name").textContent = currentBattle.opponent.name;
  document.getElementById("battle-opponent-type").textContent =
    BATTLE_TYPE_NAMES[currentBattle.opponent.type] || currentBattle.opponent.type;
  document.getElementById("battle-opponent-image").textContent =
    currentBattle.opponent.image || "👾";

  // Spieler-Infos setzen
  document.getElementById("battle-player-name").textContent = creature.name;
  document.getElementById("battle-player-type").textContent =
    BATTLE_TYPE_NAMES[creature.type] || creature.type;
  const playerImages = BATTLE_CREATURE_IMAGES[creature.type];
  const playerImage = (playerImages && playerImages[creature.stage]) || "🐣";
  document.getElementById("battle-player-image").textContent = playerImage;

  // HP-Balken und -Werte initialisieren
  const oppHpBar = document.getElementById("battle-opponent-hp-bar");
  const playerHpBar = document.getElementById("battle-player-hp-bar");
  if (oppHpBar) {
    oppHpBar.max = START_HEALTH;
    oppHpBar.value = currentBattle.opponentHp;
  }
  if (playerHpBar) {
    playerHpBar.max = START_HEALTH;
    playerHpBar.value = currentBattle.playerHp;
  }
  updateBattleHp();

  // Attacken-Buttons beschriften und aktivieren
  for (let i = 0; i < 4; i++) {
    const btn = document.getElementById("battle-attack-" + i);
    if (btn) {
      btn.disabled = false;
      const atk = currentBattle.playerAttacks[i];
      if (atk) {
        if (atk.isCounter) {
          btn.textContent = atk.name + " (Konter)";
        } else {
          btn.textContent = atk.name + " (" + atk.attack + " / " + atk.defense + ")";
        }
      }
    }
  }

  // Vorheriges Log leeren
  const logList = document.getElementById("battle-log");
  if (logList) {
    logList.textContent = "";
  }

  // Vorheriges Ergebnis verstecken und leeren
  const resultEl = document.getElementById("battle-result");
  if (resultEl) {
    resultEl.hidden = true;
    resultEl.textContent = "";
    resultEl.removeAttribute("data-result");
  }
}
