// Owner: Erol
// Happiness, Ei-Countdown und Evolution – nur Rechnungen, kein HTML, kein localStorage.
// Regeln: PROJEKTPLAN.md, Abschnitt 2.3 und 2.4

const EGG_COUNTDOWN_SECONDS = 60;
const FIRST_EVOLUTION_HAPPINESS = 70;
const FIRST_EVOLUTION_SECONDS = 300;
const SECOND_EVOLUTION_HAPPINESS = 80;
const SECOND_EVOLUTION_SECONDS = 600;

// Gibt die Happiness zurück: round((F + C + E + R) / 4), also 0 bis 100.
function calcHappiness(needs) {
  // TODO Erol
}

// Lässt 1 Sekunde vergehen:
// im Stadium "Egg" den Countdown, sonst den Evolutions-Timer.
// Gibt true zurück, wenn sich creature.stage dabei geändert hat.
function updateEvolution(creature) {
  // TODO Erol
}
