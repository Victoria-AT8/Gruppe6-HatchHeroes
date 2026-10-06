// Owner: Victoria
// Logik für Ei und Pflege – nur Rechnungen, kein HTML, kein localStorage.
// Regeln: PROJEKTPLAN.md, Abschnitt 2.1 und 2.2

const CARE_AMOUNT = 25;       // so viel bringt eine Pflege-Aktion (A)
const NEED_MAX = 100;
const NEED_MIN = 0;

// FR1.1: Gibt true zurück, wenn der Name gültig ist:
// ohne Leerzeichen am Anfang/Ende 1 bis 20 Zeichen lang.
function isValidName(text) {
  const name = text.trim();
  return name.length >= 1 && name.length <= 20;
}

// FR1.2: action ist "feed", "wash", "play" oder "sleep".
// Erhöht das passende Bedürfnis in creature.needs um CARE_AMOUNT, höchstens auf NEED_MAX.
function careAction(creature, action) {
  if (creature.stage === "Egg") {
    return;
  }
  const actionNeeds = {
    feed: "fullness",
    wash: "cleanliness",
    play: "entertainment",
    sleep: "rest"
  };
  const need = actionNeeds[action];
  if (need === undefined) {
    return;
  }
  creature.needs[need] = Math.min(NEED_MAX, creature.needs[need] + CARE_AMOUNT);
}

// FR1.2: Senkt alle 4 Bedürfnisse in creature.needs um 1, nie unter NEED_MIN.
// Wird von main.js alle 10 Sekunden aufgerufen.
function decayNeeds(creature) {
  if (creature.stage === "Egg") {
    return;
  }
  for (const need of ["fullness", "cleanliness", "entertainment", "rest"]) {
    creature.needs[need] = Math.max(NEED_MIN, creature.needs[need] - 1);
  }
}
