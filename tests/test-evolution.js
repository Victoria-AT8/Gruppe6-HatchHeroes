// Owner: Erol
// Tests für evolution.js und storage.js (PROJEKTPLAN.md, Abschnitt 10.1 und 10.2)
// Beispiel: check("Happiness 80/70/65/90", calcHappiness({ fullness: 80, cleanliness: 70, entertainment: 65, rest: 90 }), 76);
//
// Jeder Testblock steht in einer eigenen Funktion. So gelten die Variablen nur darin
// und stören nicht die Testdateien von Victoria und Jan, die auf derselben Seite laufen.

// ===== Happiness und Evolution (evolution.js) =====

// Erstellt ein Tier mit dem angegebenen Stadium. Alle 4 Bedürfnisse bekommen den Wert need,
// dann ist die Happiness genau need.
function makeEvolutionCreature(stage, need) {
  return {
    name: "Testi",
    type: "Water",
    stage: stage,
    needs: { fullness: need, cleanliness: need, entertainment: need, rest: need },
    eggCountdown: 60,
    evolutionProgress: 0
  };
}

// Ruft updateEvolution() seconds-mal auf, also lässt seconds Sekunden vergehen.
function passSeconds(creature, seconds) {
  for (let i = 0; i < seconds; i++) {
    updateEvolution(creature);
  }
}

// FR2.2: Happiness = round((F + C + E + R) / 4)
function testHappiness() {
  check("Happiness (80, 70, 65, 90) → 76",
    calcHappiness({ fullness: 80, cleanliness: 70, entertainment: 65, rest: 90 }), 76);
  check("Happiness (70, 70, 71, 71) → 70.5 → 71",
    calcHappiness({ fullness: 70, cleanliness: 70, entertainment: 71, rest: 71 }), 71);
  check("Happiness (0, 0, 0, 0) → 0",
    calcHappiness({ fullness: 0, cleanliness: 0, entertainment: 0, rest: 0 }), 0);
  check("Happiness (100, 100, 100, 100) → 100",
    calcHappiness({ fullness: 100, cleanliness: 100, entertainment: 100, rest: 100 }), 100);
}

// FR2.2, DH3, DH4: Egg → Baby → First Evolution → Second Evolution
function testEvolution() {
  // Egg → Baby nach 60 Sekunden
  const egg = makeEvolutionCreature("Egg", 50);
  passSeconds(egg, 59);
  check("Ei nach 59 s → noch Egg", egg.stage, "Egg");
  check("Ei nach 59 s → Countdown 1", egg.eggCountdown, 1);
  check("Ei: 60. Sekunde gibt true zurück (Stadium geändert)", updateEvolution(egg), true);
  check("Ei nach 60 s → Baby", egg.stage, "Baby");

  // Baby → First Evolution nach 300 s mit H = 70
  const baby = makeEvolutionCreature("Baby", 70);
  passSeconds(baby, 299);
  check("Baby mit H = 70 nach 299 s → noch Baby", baby.stage, "Baby");
  check("Baby mit H = 70 nach 299 s → Timer 299", baby.evolutionProgress, 299);
  check("Baby: 300. Sekunde gibt true zurück", updateEvolution(baby), true);
  check("Baby mit H = 70 nach 300 s → First Evolution", baby.stage, "First Evolution");
  check("Nach der Evolution → Timer wieder 0", baby.evolutionProgress, 0);

  // Timer springt auf 0, wenn H unter die Schwelle fällt
  const sadBaby = makeEvolutionCreature("Baby", 70);
  passSeconds(sadBaby, 200);
  check("Baby mit H = 70 nach 200 s → Timer 200", sadBaby.evolutionProgress, 200);
  sadBaby.needs.rest = 66;   // (70 + 70 + 70 + 66) / 4 = 69
  updateEvolution(sadBaby);
  check("Danach H = 69 → Timer 0", sadBaby.evolutionProgress, 0);
  check("Danach H = 69 → noch Baby", sadBaby.stage, "Baby");

  // First Evolution → Second Evolution nach 600 s mit H = 80
  const first = makeEvolutionCreature("First Evolution", 80);
  passSeconds(first, 599);
  check("First Evolution mit H = 80 nach 599 s → noch First Evolution", first.stage, "First Evolution");
  passSeconds(first, 1);
  check("First Evolution mit H = 80 nach 600 s → Second Evolution", first.stage, "Second Evolution");

  // First Evolution braucht H ≥ 80: Mit H = 79 zählt der Timer nicht
  const almost = makeEvolutionCreature("First Evolution", 79);
  passSeconds(almost, 600);
  check("First Evolution mit H = 79 nach 600 s → noch First Evolution", almost.stage, "First Evolution");
  check("First Evolution mit H = 79 → Timer 0", almost.evolutionProgress, 0);

  // Second Evolution ist das letzte Stadium
  const last = makeEvolutionCreature("Second Evolution", 100);
  check("Second Evolution: updateEvolution gibt false zurück", updateEvolution(last), false);
  check("Second Evolution bleibt Second Evolution", last.stage, "Second Evolution");
}


// ===== Speichern (storage.js) =====
// tests.html hat die Dateinamen schon auf "test-data.json" und "test-battles.json" gesetzt
// und den Projektordner geöffnet. Der echte Spielstand (data.json, battles.json) bleibt unberührt.
// Diese Tests sind "async", weil Dateien lesen und schreiben etwas dauert (siehe storage.js).

// Wartet, bis alle Speicherungen geschrieben sind, und löscht dann beide Testdateien.
// Läuft vor den Tests (falls ein alter Testlauf abgebrochen ist) und danach (damit nichts liegen bleibt).
async function deleteStorageTestData() {
  await waitForWrites();
  for (const fileName of [dataFileName, battlesFileName]) {
    try {
      await dataFolder.removeEntry(fileName);
    } catch (error) {
      if (error.name !== "NotFoundError") {   // Datei gibt es schon nicht mehr → passt
        throw error;
      }
    }
  }
  saveData = makeEmptySaveData();
  savedBattles = [];
}

// Liest eine Testdatei direkt von der Festplatte, ohne storage.js.
// So prüfen wir, was wirklich in der Datei steht, und nicht nur, was im Arbeitsspeicher liegt.
async function readTestFile(fileName) {
  const fileHandle = await dataFolder.getFileHandle(fileName);
  const file = await fileHandle.getFile();
  return JSON.parse(await file.text());
}

// Wie ein Neustart des Spiels: Arbeitsspeicher leeren, dann alles aus den Dateien neu laden.
async function reloadFromFile() {
  saveData = makeEmptySaveData();
  savedBattles = [];
  await readDataFile();
}

// Gibt zurück, wann data.json und battles.json (der echte Spielstand) zuletzt geändert wurden.
// Damit prüfen wir am Ende, dass die Tests sie nicht angefasst haben.
async function getGameFileTimes() {
  let times = "";
  for (const fileName of ["data.json", "battles.json"]) {
    try {
      const fileHandle = await dataFolder.getFileHandle(fileName);
      const file = await fileHandle.getFile();
      times = times + fileName + ": " + file.lastModified + "  ";
    } catch (error) {
      if (error.name !== "NotFoundError") {
        throw error;
      }
      times = times + fileName + ": fehlt  ";
    }
  }
  return times;
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

// FR2.1, DH1–DH8, DH11: Tier, Münzen und Kämpfe in die Datei speichern und wieder laden
async function testStorage() {
  await deleteStorageTestData();

  // Ohne gespeicherte Daten: kein Tier, 0 Münzen, 0 Kämpfe
  await reloadFromFile();
  check("Speichern: kein Tier gespeichert → null", loadCreature(), null);
  check("Speichern: keine Münzen gespeichert → 0", loadCoins(), 0);
  check("Speichern: noch keine Kämpfe → 0", countBattles(), 0);

  // Tier, Münzen und 25 Kämpfe speichern
  const creature = makeTestCreature();
  saveCreature(creature);
  saveCoins(300);
  for (let i = 1; i <= 25; i++) {
    addBattle({ opponent: "Gegner " + i, endedAt: "2026-10-06T12:00:00.000Z", result: "Win" });
  }
  await waitForWrites();   // warten, bis alles in den Dateien steht

  // Steht alles wirklich in den Dateien?
  const fileData = await readTestFile(dataFileName);
  check("Datei: Tier steht in test-data.json", fileData.creature, creature);
  check("Datei: 300 Münzen stehen in test-data.json", fileData.coins, 300);
  check("Datei: 25 Kämpfe stehen in test-battles.json", (await readTestFile(battlesFileName)).length, 25);

  // DH11: Wie nach einem Neustart aus der Datei laden → gleiche Werte
  await reloadFromFile();
  check("Speichern: Tier nach Neuladen aus der Datei → gleiche Werte", loadCreature(), creature);
  check("Speichern: Münzen nach Neuladen aus der Datei → 300", loadCoins(), 300);

  // DH6–DH8: die 20 neuesten, den neuesten zuerst
  const recent = loadRecentBattles(20);
  check("Speichern: 25 Kämpfe → countBattles() ist 25", countBattles(), 25);
  check("Speichern: loadRecentBattles(20) liefert 20 Kämpfe", recent.length, 20);
  check("Speichern: neuester Kampf (Gegner 25) steht zuerst", recent[0].opponent, "Gegner 25");
  check("Speichern: Gegner 6 steht an 20. Stelle", recent[19].opponent, "Gegner 6");
  check("Speichern: Kampf hat Gegner, Zeit und Ergebnis", recent[0],
    { opponent: "Gegner 25", endedAt: "2026-10-06T12:00:00.000Z", result: "Win" });

  // Neu starten: Spielstand in beiden Dateien ist danach leer
  await deleteSaveGame();
  await waitForWrites();
  check("Neu starten: test-data.json enthält danach kein Tier und 0 Münzen", await readTestFile(dataFileName),
    { creature: null, coins: 0 });
  check("Neu starten: test-battles.json enthält danach keine Kämpfe", await readTestFile(battlesFileName), []);

  await deleteStorageTestData();
}


// ===== NFR2.1 und DH12: 10.000 Kämpfe in der Datei (PROJEKTPLAN.md, Abschnitt 10.2) =====

async function testManyBattles() {
  await deleteStorageTestData();

  // 10.000 Testkämpfe auf einmal in die Datei schreiben.
  // (10.000-mal addBattle() würde 10.000-mal die ganze Datei schreiben – NFR2.1 misst aber nur das Laden.)
  const resultValues = ["Win", "Loss", "Draw"];
  for (let i = 1; i <= 10000; i++) {
    savedBattles.push({ opponent: "Gegner " + i, endedAt: new Date().toISOString(), result: resultValues[i % 3] });
  }
  writeBattlesFile();
  saveCreature(makeTestCreature());
  await waitForWrites();

  // DH12: Alle 10.000 Kämpfe stehen in der Datei und sind nach dem Neuladen abrufbar
  await reloadFromFile();
  check("DH12: countBattles() ergibt nach dem Laden aus der Datei 10.000", countBattles(), 10000);

  // NFR2.1: 5-mal messen, wie lange es dauert, beide Dateien zu lesen und daraus
  // das Tier und die 20 neuesten Kämpfe zu laden. Jede Messung < 2000 ms.
  for (let run = 1; run <= 5; run++) {
    const start = performance.now();
    await reloadFromFile();
    const loadedCreature = loadCreature();
    const loadedBattles = loadRecentBattles(20);
    const duration = performance.now() - start;

    check("NFR2.1 Messung " + run + ": Dateien lesen + Tier + 20 Kämpfe in " + duration.toFixed(1) +
      " ms (Grenze 2000 ms)", duration < 2000 && loadedCreature !== null && loadedBattles.length === 20, true);
  }

  // DH9, DH10: Auch mit 10.000 Kämpfen muss jede Pflege-Aktion bzw. Evolution in unter 1 Sekunde
  // gespeichert sein. Dabei wird nur data.json geschrieben – die Kämpfe stehen in battles.json.
  const writeStart = performance.now();
  await writeDataFile();
  const writeDuration = performance.now() - writeStart;
  check("DH9/DH10: data.json speichern (10.000 Kämpfe im Spielstand) in " + writeDuration.toFixed(1) +
    " ms (Grenze 1000 ms)", writeDuration < 1000, true);

  // DH12: Ein weiterer Kampf löscht keine alten Kämpfe.
  // Am Kampfende wird battles.json mit allen Kämpfen neu geschrieben – die Dauer steht zur Info dabei.
  const battleStart = performance.now();
  addBattle({ opponent: "Gegner 10001", endedAt: new Date().toISOString(), result: "Win" });
  await waitForWrites();
  const battleDuration = performance.now() - battleStart;
  check("DH12: battles.json enthält danach 10.001 Kämpfe (geschrieben in " + battleDuration.toFixed(1) + " ms)",
    (await readTestFile(battlesFileName)).length, 10001);
  await reloadFromFile();
  check("DH12: nach einem weiteren Kampf sind es 10.001", countBattles(), 10001);
  check("DH12: der neue Kampf steht zuerst", loadRecentBattles(1)[0].opponent, "Gegner 10001");

  await deleteStorageTestData();
}


// ===== Alle Tests dieser Datei starten =====

// Diese Tests brauchen keine Datei und laufen sofort.
testHappiness();
testEvolution();

// Die Speicher-Tests startet tests.html, sobald der Projektordner geöffnet ist.
// Am Ende prüfen wir, dass data.json und battles.json (der echte Spielstand) nicht verändert wurden.
async function runStorageTests() {
  const gameFileTimesBefore = await getGameFileTimes();
  await testStorage();
  await testManyBattles();
  check("Echter Spielstand: data.json und battles.json wurden von den Tests nicht verändert",
    await getGameFileTimes(), gameFileTimesBefore);
}
