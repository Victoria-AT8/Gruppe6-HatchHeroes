// Owner: Victoria
// Tests für pet.js (PROJEKTPLAN.md, Abschnitt 10.1)
// Beispiel: check("Feed bei 95 ergibt 100", creature.needs.fullness, 100);

// FR1.1: Namen nach Entfernen der äußeren Leerzeichen prüfen.
check("Leerer Name ist ungültig", isValidName(""), false);
check("Nur Leerzeichen sind ungültig", isValidName("  "), false);
check("Flammi ist gültig", isValidName("Flammi"), true);
check("Äußere Leerzeichen werden ignoriert", isValidName("  Flammi  "), true);
check("Ein Zeichen ist gültig", isValidName("F"), true);
check("20 Zeichen sind gültig", isValidName("a".repeat(20)), true);
check("21 Zeichen sind ungültig", isValidName("a".repeat(21)), false);

// FR1.2: Jede Aktion erhöht nur das passende Bedürfnis um 25.
const petTestCreature = {
  stage: "Baby",
  needs: { fullness: 50, cleanliness: 50, entertainment: 50, rest: 50 }
};
careAction(petTestCreature, "feed");
check("Feed erhöht nur Fullness", petTestCreature.needs,
  { fullness: 75, cleanliness: 50, entertainment: 50, rest: 50 });
careAction(petTestCreature, "wash");
careAction(petTestCreature, "play");
careAction(petTestCreature, "sleep");
check("Alle vier Aktionen erhöhen um 25", petTestCreature.needs,
  { fullness: 75, cleanliness: 75, entertainment: 75, rest: 75 });
for (const action of ["feed", "wash", "play", "sleep"]) {
  petTestCreature.needs = { fullness: 95, cleanliness: 95, entertainment: 95, rest: 95 };
  careAction(petTestCreature, action);
  check(action + " überschreitet 100 nicht", Math.max(...Object.values(petTestCreature.needs)), 100);
}
petTestCreature.needs = { fullness: 100, cleanliness: 0, entertainment: 1, rest: 50 };
decayNeeds(petTestCreature);
check("Bedürfnisse sinken um 1, nie unter 0", petTestCreature.needs,
  { fullness: 99, cleanliness: 0, entertainment: 0, rest: 49 });
careAction(petTestCreature, "unknown");
check("Unbekannte Aktion ändert nichts", petTestCreature.needs,
  { fullness: 99, cleanliness: 0, entertainment: 0, rest: 49 });
petTestCreature.stage = "Egg";
careAction(petTestCreature, "feed");
decayNeeds(petTestCreature);
check("Ei hat noch keine Pflege und keinen Verfall", petTestCreature.needs,
  { fullness: 99, cleanliness: 0, entertainment: 0, rest: 49 });
