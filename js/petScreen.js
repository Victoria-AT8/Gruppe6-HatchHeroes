// Owner: Victoria
// Anzeige von Ei-Screen und Haustier-Screen + Button-Klicks.
// Die IDs der HTML-Elemente stehen in index.html.
// Die Variablen creature und coins kommen aus main.js.

// FR1.1: Bereitet den Ei-Screen vor (Typ-Vorschau, Klick auf "Ei ausbrüten").
// Wird von main.js genau einmal beim Start aufgerufen.
function showEggScreen() {
  const form = document.getElementById("egg-form");
  const countdownBox = document.getElementById("egg-countdown-box");
  form.hidden = creature !== null;
  countdownBox.hidden = creature === null;

  // FR1.1: Die Vorschau übernimmt die Farbe des gewählten Typs.
  const eggScreen = document.getElementById("screen-egg");
  eggScreen.dataset.type = creature === null ? "Fire" : creature.type;
  for (const radio of document.querySelectorAll('input[name="egg-type"]')) {
    radio.addEventListener("change", function () {
      eggScreen.dataset.type = radio.value;
    });
  }

  document.getElementById("egg-start-button").addEventListener("click", hatchEgg);
}

// FR1.1: Klick auf "Ei ausbrüten": Name prüfen, dann ein neues Tier anlegen und speichern.
function hatchEgg() {
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

  const type = document.querySelector('input[name="egg-type"]:checked').value;
  creature = createCreature(input.value, type);
  saveCreature(creature);

  document.getElementById("egg-form").hidden = true;
  document.getElementById("egg-countdown-box").hidden = false;
  updatePetScreen(creature, coins);
}

// FR1.2, NFR1.1: Bereitet die Buttons im Haustier-Screen vor (Pflege und Kampf).
// Wird von main.js genau einmal beim Start aufgerufen.
function showPetScreen() {
  // FR3.1: Kampf erst ab "Second Evolution". Den Kampf selbst übernimmt battleScreen.js.
  document.getElementById("button-battle").addEventListener("click", function () {
    if (creature !== null && creature.stage === "Second Evolution") {
      showBattleScreen(creature);
    }
  });

  // FR1.2, DH9: Pflege sofort speichern und die Balken aktualisieren.
  for (const action of Object.keys(CARE_ACTIONS)) {
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

// FR1.1, FR1.2, FR2.2: Schreibt die aktuellen Werte in den Ei- und Haustier-Screen:
// Countdown, Name, Typ, Stadium, Münzen, Bild, Happiness, Evolutions-Fortschritt, 4 Balken.
// Ein Bedürfnis unter NEED_LOW bekommt data-low="true", style.css färbt die Zeile dann als Warnung.
// Wird jede Sekunde von main.js und nach jedem Klick aufgerufen.
function updatePetScreen(creature, coins) {
  // FR1.1: CSS verwendet Typ und Stadium für die passende Farbe.
  document.getElementById("screen-egg").dataset.type = creature.type;
  const petScreen = document.getElementById("screen-pet");
  petScreen.dataset.type = creature.type;
  petScreen.dataset.stage = creature.stage;

  document.getElementById("egg-countdown").textContent = creature.eggCountdown;
  document.getElementById("pet-name").textContent = creature.name;
  document.getElementById("pet-type").textContent = TYPE_NAMES[creature.type];
  document.getElementById("pet-stage").textContent = creature.stage;
  document.getElementById("pet-coins").textContent = coins;
  document.getElementById("pet-happiness").textContent = calcHappiness(creature.needs);
  document.getElementById("pet-evolution-progress").textContent = creature.evolutionProgress;

  const image = document.getElementById("pet-creature");
  image.textContent = getCreatureImage(creature);
  image.setAttribute("role", "img");
  image.setAttribute("aria-label", TYPE_NAMES[creature.type] + "-Tier, " + creature.stage);

  for (const need of NEED_NAMES) {
    const bar = document.getElementById("bar-" + need);
    bar.value = creature.needs[need];
    bar.setAttribute("aria-label", need);
    document.getElementById("value-" + need).textContent = creature.needs[need];
    bar.parentElement.dataset.low = creature.needs[need] < NEED_LOW;
  }

  // FR3.1: Der Kampf-Button erscheint erst im letzten Stadium.
  document.getElementById("button-battle").hidden = creature.stage !== "Second Evolution";
}
