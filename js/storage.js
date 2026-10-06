// Owner: Erol
// Speichern und Laden mit localStorage (PROJEKTPLAN.md, Abschnitt 6).
// localStorage kann nur Text speichern: Objekte werden mit JSON.stringify zu Text
// und beim Laden mit JSON.parse wieder zu Objekten.

// Alle Schlüssel beginnen mit diesem Prefix.
// tests.html setzt ihn auf "test_", damit die Tests den echten Spielstand nicht überschreiben.
let storagePrefix = "hh_";

// Hilfsfunktion (nur in dieser Datei): schreibt value als JSON-Text unter storagePrefix + name.
// Ist der Speicher voll, wirft setItem einen Fehler. Wir zeigen dann eine Meldung
// und löschen nichts automatisch (DH12, PROJEKTPLAN.md Abschnitt 3).
function writeToStorage(name, value) {
  try {
    localStorage.setItem(storagePrefix + name, JSON.stringify(value));
  } catch (error) {
    alert("Speichern fehlgeschlagen: Der Speicher ist voll.");
  }
}

// FR2.1, DH1–DH4, DH13: Speichert das Tier (Name, Typ, Bedürfnisse, Stadium, Fortschritt)
// unter storagePrefix + "creature".
function saveCreature(creature) {
  writeToStorage("creature", creature);
}

// FR2.1, DH11: Lädt das Tier. Gibt null zurück, wenn noch keines gespeichert ist.
function loadCreature() {
  const text = localStorage.getItem(storagePrefix + "creature");
  if (text === null) {
    return null;
  }
  return JSON.parse(text);
}

// DH5: Speichert die Münzen unter storagePrefix + "coins".
function saveCoins(coins) {
  writeToStorage("coins", coins);
}

// DH5, DH11: Lädt die Münzen. Gibt 0 zurück, wenn noch nichts gespeichert ist.
function loadCoins() {
  const text = localStorage.getItem(storagePrefix + "coins");
  if (text === null) {
    return 0;
  }
  return JSON.parse(text);
}

// Hilfsfunktion (nur in dieser Datei): lädt die Liste aller Kämpfe, den ältesten zuerst.
// Gibt eine leere Liste zurück, wenn noch kein Kampf gespeichert ist.
function loadBattleList() {
  const text = localStorage.getItem(storagePrefix + "battles");
  if (text === null) {
    return [];
  }
  return JSON.parse(text);
}

// DH6–DH8, DH12: Hängt einen Kampf hinten an die Liste unter storagePrefix + "battles" an.
// battle = { opponent, endedAt, result }. Alte Kämpfe werden nie gelöscht.
function addBattle(battle) {
  const battles = loadBattleList();
  battles.push(battle);
  writeToStorage("battles", battles);
}

// NFR2.1: Gibt die count neuesten Kämpfe zurück, den neuesten zuerst.
// Die neuesten stehen hinten in der Liste: slice(-count) nimmt die letzten count Einträge,
// reverse() dreht sie um.
function loadRecentBattles(count) {
  const battles = loadBattleList();
  return battles.slice(-count).reverse();
}

// DH12: Gibt die Anzahl aller gespeicherten Kämpfe zurück.
function countBattles() {
  return loadBattleList().length;
}
