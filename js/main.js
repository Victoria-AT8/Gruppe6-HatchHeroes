// Owner: Erol
// Start des Spiels: Laden, Spieluhr, Speichern, Screen-Wechsel (PROJEKTPLAN.md, Abschnitt 6).
// Diese Datei wird als letzte geladen.

// Tempo der Spieluhr: so viele Spielsekunden vergehen pro echter Sekunde.
// Wird mit dem Tempo-Button umgeschaltet und nicht gespeichert → nach dem Neuladen wieder 1.
let speed = 1;
const SPEED_STEPS = [1, 10, 60];   // 60 = 1 echte Sekunde ist 1 Spielminute

const DECAY_EVERY_SECONDS = 10;   // alle 10 Spielsekunden sinken die Bedürfnisse (Abschnitt 2.2)
const SAVE_EVERY_SECONDS = 5;     // alle 5 echten Sekunden wird gespeichert (Abschnitt 6)

// Der aktuelle Spielstand. Alle Dateien dürfen diese Variablen lesen und ändern.
let creature = null;
let coins = 0;

// Zähler für die Spieluhr (werden nicht gespeichert).
let gameSeconds = 0;   // Spielsekunden seit dem Schlüpfen → für decayNeeds()
let realSeconds = 0;   // echte Sekunden seit dem Start → für das Speichern alle 5 s

// FR1.1, FR3.1: Zeigt genau einen Screen an und versteckt die anderen.
// name ist "file", "egg", "pet", "battle" oder "history".
// "file" ist der Spielstand-Screen, der beim Start angezeigt wird, bis der Spielstand geladen ist.
function showScreen(name) {
  const allNames = ["file", "egg", "pet", "battle", "history"];
  for (const screenName of allNames) {
    const section = document.getElementById("screen-" + screenName);
    section.hidden = (screenName !== name);
  }
}

// FR1.2, FR2.2, DH10: Lässt 1 Spielsekunde vergehen.
function passGameSecond() {
  // Bedürfnisse sinken erst nach dem Schlüpfen, alle 10 Spielsekunden um 1.
  if (creature.stage !== "Egg") {
    gameSeconds = gameSeconds + 1;
    if (gameSeconds % DECAY_EVERY_SECONDS === 0) {
      decayNeeds(creature);
    }
  }

  // Countdown oder Evolutions-Timer um 1 Sekunde weiterzählen.
  const stageChanged = updateEvolution(creature);
  if (stageChanged) {
    saveCreature(creature);   // DH10: neues Stadium sofort speichern
    if (creature.stage === "Baby") {
      showScreen("pet");      // FR1.1: Das Tier ist geschlüpft → Haustier-Screen
    }
  }
}

// FR2.1, DH4: Wird jede echte Sekunde aufgerufen.
function tick() {
  // Die Zeit läuft nur, wenn es ein Tier gibt und der Tab sichtbar ist (Abschnitt 2).
  if (creature === null || document.hidden) {
    return;
  }

  // Mit speed = 60 vergehen pro echter Sekunde 60 Spielsekunden.
  for (let i = 0; i < speed; i++) {
    passGameSecond();
  }

  // Alle 5 Sekunden speichern, damit gesunkene Bedürfnisse und Timer erhalten bleiben.
  realSeconds = realSeconds + 1;
  if (realSeconds % SAVE_EVERY_SECONDS === 0) {
    saveCreature(creature);
  }

  updatePetScreen(creature, coins);
}

// Test-Hilfe: Schaltet das Tempo weiter (1× → 10× → 60× → wieder 1×).
function changeSpeed() {
  const index = SPEED_STEPS.indexOf(speed);
  const nextIndex = (index + 1) % SPEED_STEPS.length;   // nach dem letzten wieder von vorne
  speed = SPEED_STEPS[nextIndex];
  document.getElementById("button-speed").textContent = "⏩ Tempo: " + speed + "×";
}

// Neu starten: Löscht nach einer Rückfrage den Spielstand und lädt die Seite neu.
// Durch das Neuladen beginnt das Spiel ohne Tier wieder beim Ei-Screen.
// "await": Erst neu laden, wenn der leere Spielstand wirklich in data.json und battles.json steht.
async function restartGame() {
  const sure = confirm("Wirklich neu starten? Tier, Münzen und Historie werden gelöscht.");
  if (!sure) {
    return;
  }
  await deleteSaveGame();
  location.reload();
}

// DH8: Übersetzt das gespeicherte Ergebnis ("Win", "Loss", "Draw") für die Anzeige.
// Gespeichert bleibt immer der englische Wert.
function formatResult(result) {
  const resultNames = { Win: "Sieg", Loss: "Niederlage", Draw: "Unentschieden" };
  return resultNames[result];
}

// DH6–DH8, NFR2.1: Zeigt die 20 neuesten Kämpfe an, den neuesten zuerst.
// Eine Zeile sieht so aus: "Grimmzahn – 6.10.2026, 18:30:00 – Sieg"
function showHistory() {
  const battles = loadRecentBattles(20);
  const list = document.getElementById("history-list");

  list.textContent = "";   // alte Zeilen entfernen
  for (const battle of battles) {
    const line = document.createElement("li");
    const endedAt = new Date(battle.endedAt).toLocaleString("de-AT");
    line.textContent = battle.opponent + " – " + endedAt + " – " + formatResult(battle.result);
    line.dataset.result = battle.result;   // history.css färbt die Zeile: Win grün, Loss rot, Draw grau
    list.appendChild(line);
  }

  // Ohne Kämpfe: Hinweis statt leerer Liste
  document.getElementById("history-empty").hidden = battles.length > 0;
  showScreen("history");
}

// Schreibt einen Text in den Spielstand-Screen. isError = true färbt den Kasten rot (history.css).
function showFileMessage(text, isError) {
  const message = document.getElementById("file-message");
  message.textContent = text;
  message.dataset.error = isError;
}

// FR2.1, DH11: Lädt data.json und battles.json und startet danach das Spiel.
// askUser = false beim Öffnen der Seite: Es erscheint kein Dialog. Hat Chrome den Zugriff
//                  schon erlaubt, startet das Spiel sofort.
// askUser = true nach einem Klick auf "Spielordner wählen": Chrome darf nachfragen.
async function loadAndStart(askUser) {
  const button = document.getElementById("file-button");
  button.hidden = true;   // während des Ladens nicht noch einmal klickbar
  showFileMessage("Spielstand wird geladen …", false);

  let loaded = false;
  try {
    loaded = await openDataFolder(askUser);
  } catch (error) {
    // z. B. data.json oder battles.json ist kein gültiges JSON mehr → Datei bleibt unverändert
    showFileMessage("Der Spielstand (data.json / battles.json) konnte nicht geladen werden: " + error.message +
      " – Bitte die Datei reparieren oder löschen und es noch einmal versuchen.", true);
    button.hidden = false;
    return;
  }

  if (loaded) {
    startGame();
  } else {
    // Noch kein Ordner gewählt, Zugriff noch nicht erlaubt oder Dialog abgebrochen
    showFileMessage("Wähle den Projektordner aus. Dort liegt dein Spielstand (data.json und battles.json). " +
      "Wenn du ihn schon einmal gewählt hast, musst du nur den Zugriff erlauben.", false);
    button.hidden = false;
  }
}

// DH11: Wird beim Öffnen der Seite aufgerufen. Erst wenn der Spielstand geladen ist,
// startet startGame() das Spiel. Vorher ist nur der Spielstand-Screen sichtbar.
function openGame() {
  if (!canUseDataFile()) {
    showFileMessage("Dieser Browser kann keine Dateien speichern. Bitte Chrome oder Edge verwenden.", true);
    return;
  }
  document.getElementById("file-button").addEventListener("click", function () {
    loadAndStart(true);
  });
  loadAndStart(false);
}

// FR2.1, DH11: Wird erst aufgerufen, wenn der Spielstand geladen ist (siehe loadAndStart).
// Holt Tier und Münzen aus dem Spielstand und zeigt danach den passenden Screen an.
function startGame() {
  creature = loadCreature();
  coins = loadCoins();

  // Victorias Screens vorbereiten (Button-Klicks). Nur einmal aufrufen,
  // sonst würde ein Klick mehrfach zählen.
  showEggScreen();
  showPetScreen();

  // DH6–DH8: Kampf-Historie öffnen und wieder zurück zum Haustier-Screen
  document.getElementById("button-history").addEventListener("click", showHistory);
  document.getElementById("history-back-button").addEventListener("click", function () {
    showScreen("pet");
    updatePetScreen(creature, coins);
  });

  // FR3.1: Vom Kampf-Screen zurück zum Haustier-Screen.
  // Ein laufender Kampf wird dabei abgebrochen und nicht gespeichert (Abschnitt 2.5).
  document.getElementById("battle-back-button").addEventListener("click", function () {
    showScreen("pet");
    updatePetScreen(creature, coins);
  });

  // Test-Hilfe: Tempo-Button
  document.getElementById("button-speed").addEventListener("click", changeSpeed);
  document.getElementById("button-restart").addEventListener("click", restartGame);

  // Kein Tier oder noch ein Ei → Ei-Screen, sonst Haustier-Screen.
  if (creature === null || creature.stage === "Egg") {
    showScreen("egg");
  } else {
    showScreen("pet");
  }
  if (creature !== null) {
    updatePetScreen(creature, coins);
  }

  // Spieluhr starten: 1 Tick pro Sekunde
  setInterval(tick, 1000);
}

openGame();
