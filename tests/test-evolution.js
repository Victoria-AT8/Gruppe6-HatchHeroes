// Owner: Erol
// Tests für evolution.js und storage.js (PROJEKTPLAN.md, Abschnitt 10.1 und 10.2)
// Beispiel: check("Happiness 80/70/65/90", calcHappiness({ fullness: 80, cleanliness: 70, entertainment: 65, rest: 90 }), 76);
//
// Jeder Testblock steht in einer eigenen Funktion. So gelten die Variablen nur darin
// und stören nicht die Testdateien von Victoria und Jan, die auf derselben Seite laufen.

// TODO Erol – Happiness und Evolution:
// - Happiness (80, 70, 65, 90) → 76
// - Happiness (70, 70, 71, 71) → 71
// - Ei nach 59 × updateEvolution → noch "Egg", nach 60 → "Baby"
// - Baby mit H = 70: nach 299 s noch "Baby", nach 300 s "First Evolution", Timer wieder 0
// - Baby mit H = 70 für 200 s, dann H = 69 → Timer 0
// - First Evolution mit H = 80 für 600 s → "Second Evolution"


// ===== Speichern (storage.js) =====
// tests.html hat storagePrefix schon auf "test_" gesetzt: Der echte Spielstand bleibt unberührt.

// Löscht alle Testdaten aus localStorage – vor den Tests (falls ein alter Testlauf abgebrochen ist)
// und danach (damit nichts liegen bleibt).
function deleteStorageTestData() {
  localStorage.removeItem(storagePrefix + "creature");
  localStorage.removeItem(storagePrefix + "coins");
  localStorage.removeItem(storagePrefix + "battles");
}

// Ein Beispiel-Tier für die Speicher-Tests.
function makeTestCreature() {
  return {
    name: "Flammi",
    type: "Fire",
    stage: "Baby",
    needs: { fullness: 80, cleanliness: 70, entertainment: 65, rest: 90 },
    eggCountdown: 0,
    evolutionProgress: 123
  };
}

// FR2.1, DH1–DH8: Tier, Münzen und Kämpfe speichern und wieder laden
function testStorage() {
  deleteStorageTestData();

  // Ohne gespeicherte Daten: kein Tier, 0 Münzen, 0 Kämpfe
  check("Speichern: kein Tier gespeichert → null", loadCreature(), null);
  check("Speichern: keine Münzen gespeichert → 0", loadCoins(), 0);
  check("Speichern: noch keine Kämpfe → 0", countBattles(), 0);

  // FR2.1, DH1–DH4, DH13: Tier speichern und wieder laden → gleiche Werte
  const creature = makeTestCreature();
  saveCreature(creature);
  check("Speichern: Tier speichern und laden → gleiche Werte", loadCreature(), creature);

  // DH5: Münzen speichern und wieder laden
  saveCoins(300);
  check("Speichern: 300 Münzen speichern und laden → 300", loadCoins(), 300);

  // DH6–DH8: 25 Kämpfe speichern → die 20 neuesten, den neuesten zuerst
  for (let i = 1; i <= 25; i++) {
    addBattle({ opponent: "Gegner " + i, endedAt: "2026-10-06T12:00:00.000Z", result: "Win" });
  }
  const recent = loadRecentBattles(20);
  check("Speichern: 25 Kämpfe → countBattles() ist 25", countBattles(), 25);
  check("Speichern: loadRecentBattles(20) liefert 20 Kämpfe", recent.length, 20);
  check("Speichern: neuester Kampf (Gegner 25) steht zuerst", recent[0].opponent, "Gegner 25");
  check("Speichern: Gegner 6 steht an 20. Stelle", recent[19].opponent, "Gegner 6");
  check("Speichern: Kampf hat Gegner, Zeit und Ergebnis", recent[0],
    { opponent: "Gegner 25", endedAt: "2026-10-06T12:00:00.000Z", result: "Win" });

  deleteStorageTestData();
}


// ===== NFR2.1 und DH12: 10.000 Kämpfe (PROJEKTPLAN.md, Abschnitt 10.2) =====

function testManyBattles() {
  deleteStorageTestData();

  // 10.000 Testkämpfe auf einmal in den Speicher schreiben.
  // (10.000-mal addBattle() würde mehrere Sekunden dauern – NFR2.1 misst aber nur das Laden.)
  const battles = [];
  const resultValues = ["Win", "Loss", "Draw"];
  for (let i = 1; i <= 10000; i++) {
    battles.push({ opponent: "Gegner " + i, endedAt: new Date().toISOString(), result: resultValues[i % 3] });
  }
  localStorage.setItem(storagePrefix + "battles", JSON.stringify(battles));
  saveCreature(makeTestCreature());

  // DH12: Alle 10.000 Kämpfe sind gespeichert und abrufbar
  check("DH12: countBattles() ergibt 10.000", countBattles(), 10000);

  // NFR2.1: 5-mal messen, wie lange Tier + 20 neueste Kämpfe laden dauert. Jede Messung < 2000 ms.
  for (let run = 1; run <= 5; run++) {
    const start = performance.now();
    const loadedCreature = loadCreature();
    const loadedBattles = loadRecentBattles(20);
    const duration = performance.now() - start;

    check("NFR2.1 Messung " + run + ": Tier + 20 Kämpfe in " + duration.toFixed(1) + " ms (Grenze 2000 ms)",
      duration < 2000 && loadedCreature !== null && loadedBattles.length === 20, true);
  }

  // DH12: Ein weiterer Kampf löscht keine alten Kämpfe
  addBattle({ opponent: "Gegner 10001", endedAt: new Date().toISOString(), result: "Win" });
  check("DH12: nach einem weiteren Kampf sind es 10.001", countBattles(), 10001);
  check("DH12: der neue Kampf steht zuerst", loadRecentBattles(1)[0].opponent, "Gegner 10001");

  deleteStorageTestData();
}


// ===== Alle Tests dieser Datei starten =====
testStorage();
testManyBattles();
