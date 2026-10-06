// Owner: Erol
// Speichern und Laden mit localStorage (PROJEKTPLAN.md, Abschnitt 6).

// Alle Schlüssel beginnen mit diesem Prefix.
// tests.html setzt ihn auf "test_", damit die Tests den echten Spielstand nicht überschreiben.
let storagePrefix = "hh_";

// Speichert das Tier unter storagePrefix + "creature".
function saveCreature(creature) {
  // TODO Erol
}

// Lädt das Tier. Gibt null zurück, wenn noch keines gespeichert ist.
function loadCreature() {
  // TODO Erol
}

// Speichert die Münzen unter storagePrefix + "coins".
function saveCoins(coins) {
  // TODO Erol
}

// Lädt die Münzen. Gibt 0 zurück, wenn noch nichts gespeichert ist.
function loadCoins() {
  // TODO Erol
}

// Hängt einen Kampf hinten an die Liste unter storagePrefix + "battles" an.
// battle = { opponent, endedAt, result }
function addBattle(battle) {
  // TODO Erol
}

// Gibt die count neuesten Kämpfe zurück, den neuesten zuerst.
function loadRecentBattles(count) {
  // TODO Erol
}

// Gibt die Anzahl aller gespeicherten Kämpfe zurück.
function countBattles() {
  // TODO Erol
}
