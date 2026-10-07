// Owner: Jan
// Tests für battle.js (PROJEKTPLAN.md, Abschnitt 10.1 und 10.2)
// Beispiel: check("Feuer ist stark gegen Wind", isStrongAgainst("Fire", "Wind"), true);

// ===== Typtabelle (Abschnitt 10.1) =====
function testTypeTable() {
  // isStrongAgainst ist nur in diesen 4 Fällen true:
  check("Typtabelle: Feuer ist stark gegen Wind", isStrongAgainst("Fire", "Wind"), true);
  check("Typtabelle: Wasser ist stark gegen Feuer", isStrongAgainst("Water", "Fire"), true);
  check("Typtabelle: Erde ist stark gegen Wasser", isStrongAgainst("Earth", "Water"), true);
  check("Typtabelle: Wind ist stark gegen Erde", isStrongAgainst("Wind", "Earth"), true);

  // Alle anderen 12 Kombinationen sind false:
  const types = ["Fire", "Water", "Earth", "Wind"];
  const strongPairs = {
    Fire: "Wind",
    Water: "Fire",
    Earth: "Water",
    Wind: "Earth"
  };

  for (const t1 of types) {
    for (const t2 of types) {
      if (strongPairs[t1] !== t2) {
        check("Typtabelle: " + t1 + " gegen " + t2 + " ist nicht stark", isStrongAgainst(t1, t2), false);
      }
    }
  }
}

// ===== Stat- und Schadensberechnung (Abschnitt 10.1) =====
function testStatCalculations() {
  // Neutrale Typen: Feuer-Tier mit Feuerball (A30) gegen Erde-Tier → nur +15 % → 35
  check("Stat-Berechnung: Feuerball (A30) neutral gegen Erde → 35",
    calcStat("Fire", "Earth", 30, "Fire"), 35);

  // Gleicher Typ: Feuer-Tier mit Feuerball (A30) gegen Feuer-Tier → nur +15 % → 35
  check("Stat-Berechnung: Feuerball (A30) gegen gleicher Typ Feuer → 35",
    calcStat("Fire", "Fire", 30, "Fire"), 35);

  // Stark: Wasser-Tier mit Wasser-Attacke (A30) gegen Feuer-Tier → +15 % und +20 % → 41
  check("Stat-Berechnung: Aquaknarre (A30) stark gegen Feuer → 41",
    calcStat("Water", "Fire", 30, "Water"), 41);

  // Kein Bonus ohne passenden Attacken-Typ, auch wenn das Tier stark ist:
  // Feuer-Tier mit Biss (Normal, A20) gegen Wind → 20
  check("Stat-Berechnung: Normal-Attacke Biss (A20) von Feuer gegen Wind → 20",
    calcStat("Fire", "Wind", 20, "Normal"), 20);

  // Wind-Tier mit Feuer-Attacke (A30) gegen Erde → 30
  check("Stat-Berechnung: Nicht-Typ-Attacke (A30) von Wind gegen Erde → 30",
    calcStat("Wind", "Earth", 30, "Fire"), 30);

  // Rundungsfalle: Erde-Tier mit Erde-Attacke (A25) gegen Wasser → 25 × 115 × 120 / 10000 = 34.5 → 35, nicht 34
  check("Rundungsfalle: Erde-Attacke (A25) stark gegen Wasser → exakt 35 (nicht 34)",
    calcStat("Earth", "Water", 25, "Earth"), 35);
}

// ===== Ganze Runden und Spezialfälle (Abschnitt 10.1) =====

// Attacken für die Runden-Tests
const TEST_FEUERBALL = { name: "Feuerball", type: "Fire", attack: 30, defense: 10, isCounter: false };
const TEST_FEUERSCHILD = { name: "Feuerschild", type: "Fire", attack: 0, defense: 20, isCounter: true };
const TEST_KRATZER = { name: "Kratzer", type: "Normal", attack: 5, defense: 10, isCounter: false };
const TEST_WINDSTOSS = { name: "Windstoß", type: "Wind", attack: 20, defense: 10, isCounter: false };
const TEST_SCHATTENSPRUNG = { name: "Schattensprung", type: "Wind", attack: 0, defense: 15, isCounter: true };
const TEST_FELSMAUER = { name: "Felsmauer", type: "Normal", attack: 5, defense: 50, isCounter: false };

// Baut einen Kampf wie startBattle(), aber mit festen Werten:
// Spieler ist immer ein Feuer-Tier, jede Seite hat genau 1 Attacke (Nummer 0).
function makeTestBattle(opponentType, playerAttack, opponentAttack, playerHp, opponentHp) {
  return {
    creature: { name: "Flammi", type: "Fire" },
    opponent: { name: "Testgegner", type: opponentType, attacks: [opponentAttack] },
    playerHp: playerHp,
    opponentHp: opponentHp,
    playerAttacks: [playerAttack],
    opponentAttacks: [opponentAttack],
    result: null
  };
}

function testBattleRounds() {
  // 1. Ganze Runde: Feuer-Tier mit Feuerball (Feuer, A30/V10) gegen Wind-Tier mit Windstoß (Wind, A20/V10)
  // Spieler: +15 % und +20 % → Angriff 41, Verteidigung 14
  // Gegner: nur +15 % → Angriff 23, Verteidigung 12
  // Gegner verliert 41 − 12 = 29 (→ 71 HP), Spieler verliert 23 − 14 = 9 (→ 91 HP)
  const fullRoundBattle = makeTestBattle("Wind", TEST_FEUERBALL, TEST_WINDSTOSS, 100, 100);
  const log = playRound(fullRoundBattle, 0, 0);
  check("Ganze Runde: Gegner verliert 29 HP → 71 HP", fullRoundBattle.opponentHp, 71);
  check("Ganze Runde: Spieler verliert 9 HP → 91 HP", fullRoundBattle.playerHp, 91);
  check("Ganze Runde: Kampf läuft noch", fullRoundBattle.result, null);

  // Log: erste Zeile Gegner, zweite Zeile Spieler
  check("Log-Reihenfolge: Zeile 1 ist Gegner", log[0], "Gegner setzt Windstoß ein – 9 Schaden");
  check("Log-Reihenfolge: Zeile 2 ist Spieler", log[1], "Du setzt Feuerball ein – 29 Schaden");

  // 2. Konter → beide HP bleiben gleich
  const counterBattle = makeTestBattle("Wind", TEST_FEUERSCHILD, TEST_WINDSTOSS, 80, 75);
  playRound(counterBattle, 0, 0);
  check("Konter (Spieler): Spieler-HP bleiben unverändert", counterBattle.playerHp, 80);
  check("Konter (Spieler): Gegner-HP bleiben unverändert", counterBattle.opponentHp, 75);

  const oppCounterBattle = makeTestBattle("Wind", TEST_FEUERBALL, TEST_SCHATTENSPRUNG, 80, 75);
  playRound(oppCounterBattle, 0, 0);
  check("Konter (Gegner): Spieler-HP bleiben unverändert", oppCounterBattle.playerHp, 80);
  check("Konter (Gegner): Gegner-HP bleiben unverändert", oppCounterBattle.opponentHp, 75);

  // 3. Ist die Verteidigung größer als der Angriff → Schaden 0, nicht negativ
  const highDefBattle = makeTestBattle("Earth", TEST_KRATZER, TEST_FELSMAUER, 100, 100);
  playRound(highDefBattle, 0, 0);
  check("Verteidigung > Angriff: Schaden 0, Gegner-HP unverändert bei 100", highDefBattle.opponentHp, 100);

  // 4. Hat ein Tier 5 HP und bekommt 29 Schaden → 0 HP, nicht −24
  const lowHpBattle = makeTestBattle("Wind", TEST_FEUERBALL, TEST_WINDSTOSS, 100, 5);
  playRound(lowHpBattle, 0, 0);
  check("5 HP bei 29 Schaden → 0 HP (nicht negativ)", lowHpBattle.opponentHp, 0);
  check("Ergebnis: Nur Gegner bei 0 → Win", lowHpBattle.result, "Win");

  // 5. Nur der Spieler bei 0 → Loss
  const lossBattle = makeTestBattle("Wind", TEST_FEUERBALL, TEST_WINDSTOSS, 5, 100);
  playRound(lossBattle, 0, 0);
  check("Ergebnis: Nur Spieler bei 0 → Loss", lossBattle.result, "Loss");

  // 6. Beide bei 0 → Draw
  const drawBattle = makeTestBattle("Wind", TEST_FEUERBALL, TEST_WINDSTOSS, 5, 5);
  playRound(drawBattle, 0, 0);
  check("Ergebnis: Beide bei 0 → Draw", drawBattle.result, "Draw");
}

// ===== startBattle (Abschnitt 2.5) =====
function testStartBattle() {
  const battle = startBattle({ name: "Flammi", type: "Water", stage: "Second Evolution" });
  check("startBattle: beide starten mit 100 HP", [battle.playerHp, battle.opponentHp], [100, 100]);
  check("startBattle: Spieler bekommt die 4 Wasser-Attacken", battle.playerAttacks, ATTACKS.Water);
  check("startBattle: Gegner hat 4 Attacken", battle.opponentAttacks.length, 4);
  check("startBattle: Kampf läuft noch", battle.result, null);

  // Ein Kampf darf die Tabelle ATTACKS nicht verändern (es sind Kopien).
  battle.playerAttacks[0].attack = 999;
  check("startBattle: Attacken sind Kopien, ATTACKS bleibt gleich", ATTACKS.Water[0].attack, 30);
}

// ===== NFR3.1 Performance-Messung (Abschnitt 10.2) =====
function testNfr31() {
  const creature = { name: "Flammi", type: "Fire", stage: "Second Evolution" };
  let totalRounds = 0;
  let roundsUnder200 = 0;
  let maxDuration = 0;
  // Obergrenze pro Kampf gegen Endlosschleifen bei Kontern
  const MAX_ROUNDS_PER_BATTLE = 50;

  for (let i = 0; i < 100; i++) {
    const battle = startBattle(creature);
    let roundCount = 0;
    while (battle.result === null && roundCount < MAX_ROUNDS_PER_BATTLE) {
      roundCount++;
      totalRounds++;
      const playerAttack = chooseOpponentAttack();
      const opponentAttack = chooseOpponentAttack();

      const start = performance.now();
      playRound(battle, playerAttack, opponentAttack);
      const duration = performance.now() - start;

      if (duration < 200) {
        roundsUnder200++;
      }
      if (duration > maxDuration) {
        maxDuration = duration;
      }
    }
  }

  const percentage = (roundsUnder200 / totalRounds) * 100;
  check("NFR3.1: Mindestens 95 % der Runden unter 200 ms (" + percentage.toFixed(1) + " %, max " + maxDuration.toFixed(2) + " ms, " + totalRounds + " Runden)",
    percentage >= 95, true);
}

// ===== Alle Tests dieser Datei starten =====
testTypeTable();
testStatCalculations();
testBattleRounds();
testStartBattle();
testNfr31();
