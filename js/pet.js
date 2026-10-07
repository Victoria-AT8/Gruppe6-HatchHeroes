// Owner: Victoria
// Logik und Daten zum Tier – nur Rechnungen und Tabellen, kein HTML, kein Speichern.
// Regeln: PROJEKTPLAN.md, Abschnitt 2.1 und 2.2
// Die Tabellen (Typnamen, Bilder) verwenden petScreen.js UND battleScreen.js.

const CARE_AMOUNT = 25;       // so viel bringt eine Pflege-Aktion (A)
const NEED_MAX = 100;
const NEED_MIN = 0;
const NEED_START = 50;        // jedes Bedürfnis eines neuen Tiers
const NEED_LOW = 25;          // darunter warnt der Haustier-Screen (nur Anzeige, keine Spielregel)

// Die 4 Bedürfnisse, in dieser Reihenfolge überall angezeigt.
const NEED_NAMES = ["fullness", "cleanliness", "entertainment", "rest"];

// Welche Pflege-Aktion welches Bedürfnis erhöht (FR1.2).
const CARE_ACTIONS = {
  feed: "fullness",
  wash: "cleanliness",
  play: "entertainment",
  sleep: "rest"
};

// Gespeichert wird der englische Typ ("Fire"), angezeigt der deutsche Name.
const TYPE_NAMES = { Fire: "Feuer", Water: "Wasser", Earth: "Erde", Wind: "Wind" };

// FR1.1: Jede Tierfamilie wächst vom Baby bis zur letzten Evolution.
const CREATURE_IMAGES = {
  Fire: { Baby: "🐣", "First Evolution": "🐦", "Second Evolution": "🐦‍🔥" },
  Water: { Baby: "🐟", "First Evolution": "🐬", "Second Evolution": "🐋" },
  Earth: { Baby: "🐱", "First Evolution": "🐆", "Second Evolution": "🦁" },
  Wind: { Baby: "🐛", "First Evolution": "🦋", "Second Evolution": "🦅" }
};

// FR1.1: Gibt true zurück, wenn der Name gültig ist:
// ohne Leerzeichen am Anfang/Ende 1 bis 20 Zeichen lang.
function isValidName(text) {
  const name = text.trim();
  return name.length >= 1 && name.length <= 20;
}

// FR1.1: Gibt ein neues Tier im Stadium "Egg" zurück (Aufbau: PROJEKTPLAN.md, Abschnitt 5).
// type ist "Fire", "Water", "Earth" oder "Wind".
function createCreature(name, type) {
  const needs = {};
  for (const need of NEED_NAMES) {
    needs[need] = NEED_START;
  }
  return {
    name: name.trim(),
    type: type,
    stage: "Egg",
    needs: needs,
    eggCountdown: EGG_COUNTDOWN_SECONDS,   // aus evolution.js
    evolutionProgress: 0
  };
}

// FR1.1: Gibt das Emoji für das Tier zurück: ein Ei oder das Bild für Typ und Stadium.
function getCreatureImage(creature) {
  if (creature.stage === "Egg") {
    return "🥚";
  }
  return CREATURE_IMAGES[creature.type][creature.stage];
}

// FR1.2: action ist "feed", "wash", "play" oder "sleep".
// Erhöht das passende Bedürfnis in creature.needs um CARE_AMOUNT, höchstens auf NEED_MAX.
function careAction(creature, action) {
  if (creature.stage === "Egg") {
    return;
  }
  const need = CARE_ACTIONS[action];
  if (need === undefined) {
    return;
  }
  creature.needs[need] = Math.min(NEED_MAX, creature.needs[need] + CARE_AMOUNT);
}

// FR1.2: Senkt alle 4 Bedürfnisse in creature.needs um 1, nie unter NEED_MIN.
// Wird von main.js alle 10 Spielsekunden aufgerufen.
function decayNeeds(creature) {
  if (creature.stage === "Egg") {
    return;
  }
  for (const need of NEED_NAMES) {
    creature.needs[need] = Math.max(NEED_MIN, creature.needs[need] - 1);
  }
}
