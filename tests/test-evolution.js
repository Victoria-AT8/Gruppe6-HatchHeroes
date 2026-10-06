// Owner: Erol
// Tests für evolution.js und storage.js (PROJEKTPLAN.md, Abschnitt 10.1 und 10.2)
// Beispiel: check("Happiness 80/70/65/90", calcHappiness({ fullness: 80, cleanliness: 70, entertainment: 65, rest: 90 }), 76);

// TODO Erol – Happiness und Evolution:
// - Happiness (80, 70, 65, 90) → 76
// - Happiness (70, 70, 71, 71) → 71
// - Ei nach 59 × updateEvolution → noch "Egg", nach 60 → "Baby"
// - Baby mit H = 70: nach 299 s noch "Baby", nach 300 s "First Evolution", Timer wieder 0
// - Baby mit H = 70 für 200 s, dann H = 69 → Timer 0
// - First Evolution mit H = 80 für 600 s → "Second Evolution"

// TODO Erol – Speichern:
// - Tier speichern und wieder laden → gleiche Werte
// - 25 Kämpfe speichern → loadRecentBattles(20) liefert die 20 neuesten, den neuesten zuerst
// - Am Ende die Testdaten ("test_...") wieder löschen

// TODO Erol – NFR2.1 (Abschnitt 10.2):
// - 10.000 Kämpfe speichern, 5-mal Tier + 20 neueste laden und mit performance.now() messen, jede Messung < 2000 ms
// - countBattles() ergibt 10.000
