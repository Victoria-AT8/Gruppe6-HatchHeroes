// Owner: Victoria
// Anzeige von Ei-Screen und Haustier-Screen + Button-Klicks.
// Die IDs der HTML-Elemente stehen in index.html.
// Die Variablen creature und coins kommen aus main.js.

// FR1.1: Bereitet den Ei-Screen vor (z. B. Klick auf "Ei ausbrüten").
// Beim Klick: Name mit isValidName() prüfen, dann creature mit den Startwerten
// aus PROJEKTPLAN.md Abschnitt 5 anlegen und mit saveCreature() speichern.
function showEggScreen() {
  const form = document.getElementById("egg-form");
  const countdownBox = document.getElementById("egg-countdown-box");
  form.hidden = creature !== null;
  countdownBox.hidden = creature === null;

  // FR1.1: Ein gültiger Name und der gewählte Typ starten das Ei.
  document.getElementById("egg-start-button").addEventListener("click", function () {
    if (creature !== null) {
      return;
    }
    const input = document.getElementById("egg-name-input");
    const valid = isValidName(input.value);
    document.getElementById("egg-name-error").hidden = valid;
    input.setAttribute("aria-invalid", String(!valid));
    if (!valid) {
      input.focus();
      return;
    }
    creature = {
      name: input.value.trim(),
      type: document.querySelector('input[name="egg-type"]:checked').value,
      stage: "Egg",
      needs: { fullness: 50, cleanliness: 50, entertainment: 50, rest: 50 },
      eggCountdown: 60,
      evolutionProgress: 0
    };
    saveCreature(creature);
    form.hidden = true;
    countdownBox.hidden = false;
    updatePetScreen(creature, coins);
  });
}

// FR1.2, NFR1.1: Bereitet die vier Pflege-Buttons für jeweils einen Klick vor.
// Bei einem Klick: careAction(), dann saveCreature(), dann updatePetScreen().
function showPetScreen() {
  for (const action of ["feed", "wash", "play", "sleep"]) {
    // FR1.2, DH9: Pflege sofort speichern und die Balken aktualisieren.
    document.getElementById("button-" + action).addEventListener("click", function () {
      if (creature === null || creature.stage === "Egg") {
        return;
      }
      careAction(creature, action);
      saveCreature(creature);
      updatePetScreen(creature, coins);
    });
  }
}

// FR1.1, FR1.2, FR2.2: Schreibt die aktuellen Werte in den Haustier-Screen:
// Name, Typ, Stadium, Münzen, 4 Balken, Happiness, Evolutions-Fortschritt.
// Der Kampf-Button ist nur ab "Second Evolution" sichtbar.
function updatePetScreen(creature, coins) {
  document.getElementById("egg-countdown").textContent = creature.eggCountdown;
  document.getElementById("pet-name").textContent = creature.name;
  const typeNames = { Fire: "Feuer", Water: "Wasser", Earth: "Erde", Wind: "Wind" };
  document.getElementById("pet-type").textContent = typeNames[creature.type];
  document.getElementById("pet-stage").textContent = creature.stage;
  document.getElementById("pet-coins").textContent = coins;
  document.getElementById("pet-happiness").textContent = calcHappiness(creature.needs);
  document.getElementById("pet-evolution-progress").textContent = creature.evolutionProgress;

  for (const need of ["fullness", "cleanliness", "entertainment", "rest"]) {
    document.getElementById("bar-" + need).value = creature.needs[need];
    document.getElementById("bar-" + need).setAttribute("aria-label", need);
    document.getElementById("value-" + need).textContent = creature.needs[need];
  }
  const stageImages = {
    Egg: "🥚",
    Baby: "🐣",
    "First Evolution": "🐥",
    "Second Evolution": "🐓"
  };
  document.getElementById("pet-creature").textContent = stageImages[creature.stage];
  // FR3.1: Der Kampf-Button erscheint erst im letzten Stadium (Ablauf folgt in Phase 2).
  document.getElementById("button-battle").hidden = creature.stage !== "Second Evolution";
}
