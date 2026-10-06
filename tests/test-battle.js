// Owner: Jan
// Tests für battle.js (PROJEKTPLAN.md, Abschnitt 10.1 und 10.2)
// Beispiel: check("Feuer ist stark gegen Wind", isStrongAgainst("Fire", "Wind"), true);

// TODO Jan – Typtabelle:
// - isStrongAgainst ist nur true für Feuer→Wind, Wasser→Feuer, Erde→Wasser, Wind→Erde, sonst false

// TODO Jan – Runden (erwartete Werte siehe PROJEKTPLAN.md, Abschnitt 10.1):
// - Feuer (Feuerball A30/V10) gegen Wind (Windstoß A20/V10): Gegner −29 → 71 HP, Spieler −9 → 91 HP
// - Neutral / gleicher Typ → 35, stark → 41, ohne passenden Attacken-Typ kein Bonus (20 bzw. 30)
// - Rundungsfalle A25 mit beiden Boni → 35, nicht 34
// - Konter → beide HP bleiben gleich
// - Verteidigung > Angriff → Schaden 0
// - 5 HP und 29 Schaden → 0 HP
// - Draw / Win / Loss
// - Log: erste Zeile Gegner, zweite Zeile Spieler

// TODO Jan – NFR3.1 (Abschnitt 10.2):
// - 100 Kämpfe mit zufälligen Attacken, jeden playRound-Aufruf messen, mind. 95 % < 200 ms
