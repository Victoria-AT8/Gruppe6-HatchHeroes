// Owner: Victoria
// Logik für Ei und Pflege – nur Rechnungen, kein HTML, kein localStorage.
// Regeln: PROJEKTPLAN.md, Abschnitt 2.1 und 2.2

const CARE_AMOUNT = 25;       // so viel bringt eine Pflege-Aktion (A)
const NEED_MAX = 100;
const NEED_MIN = 0;

// Gibt true zurück, wenn der Name gültig ist:
// ohne Leerzeichen am Anfang/Ende 1 bis 20 Zeichen lang.
function isValidName(text) {
  // TODO Victoria
}

// action ist "feed", "wash", "play" oder "sleep".
// Erhöht das passende Bedürfnis in creature.needs um CARE_AMOUNT, höchstens auf NEED_MAX.
function careAction(creature, action) {
  // TODO Victoria
}

// Senkt alle 4 Bedürfnisse in creature.needs um 1, nie unter NEED_MIN.
// Wird von main.js alle 10 Sekunden aufgerufen.
function decayNeeds(creature) {
  // TODO Victoria
}
