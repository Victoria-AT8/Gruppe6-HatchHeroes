// Owner: Erol
// Happiness, Ei-Countdown und Evolution – nur Rechnungen, kein HTML, kein localStorage.
// Regeln: PROJEKTPLAN.md, Abschnitt 2.3 und 2.4

const EGG_COUNTDOWN_SECONDS = 60;
const FIRST_EVOLUTION_HAPPINESS = 70;
const FIRST_EVOLUTION_SECONDS = 300;
const SECOND_EVOLUTION_HAPPINESS = 80;
const SECOND_EVOLUTION_SECONDS = 600;

// FR2.2: Gibt die Happiness zurück: round((F + C + E + R) / 4), also 0 bis 100.
function calcHappiness(needs) {
  const sum = needs.fullness + needs.cleanliness + needs.entertainment + needs.rest;
  return Math.round(sum / 4);
}

// FR2.2, DH3, DH4: Lässt 1 Sekunde vergehen:
// im Stadium "Egg" den Countdown, sonst den Evolutions-Timer.
// Gibt true zurück, wenn sich creature.stage dabei geändert hat.
function updateEvolution(creature) {
  // Egg → Baby: Countdown um 1 Sekunde verringern, bei 0 schlüpft das Tier.
  if (creature.stage === "Egg") {
    creature.eggCountdown = creature.eggCountdown - 1;
    if (creature.eggCountdown <= 0) {
      creature.eggCountdown = 0;
      creature.stage = "Baby";
      creature.evolutionProgress = 0;
      return true;
    }
    return false;
  }

  // Schwelle, nötige Dauer und nächstes Stadium hängen vom aktuellen Stadium ab.
  let neededHappiness;
  let neededSeconds;
  let nextStage;
  if (creature.stage === "Baby") {
    neededHappiness = FIRST_EVOLUTION_HAPPINESS;
    neededSeconds = FIRST_EVOLUTION_SECONDS;
    nextStage = "First Evolution";
  } else if (creature.stage === "First Evolution") {
    neededHappiness = SECOND_EVOLUTION_HAPPINESS;
    neededSeconds = SECOND_EVOLUTION_SECONDS;
    nextStage = "Second Evolution";
  } else {
    // "Second Evolution" ist das letzte Stadium: Es gibt keine weitere Evolution.
    return false;
  }

  // Happiness hoch genug → Timer + 1, sonst Timer zurück auf 0 (es zählt nur die Zeit am Stück).
  if (calcHappiness(creature.needs) >= neededHappiness) {
    creature.evolutionProgress = creature.evolutionProgress + 1;
  } else {
    creature.evolutionProgress = 0;
  }

  // Lange genug glücklich → nächstes Stadium, der Timer beginnt wieder bei 0.
  if (creature.evolutionProgress >= neededSeconds) {
    creature.stage = nextStage;
    creature.evolutionProgress = 0;
    return true;
  }
  return false;
}
