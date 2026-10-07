// Owner: Erol
// Speichern und Laden mit der Datei data.json (PROJEKTPLAN.md, Abschnitt 6).
// Chrome und Edge dürfen über die File System Access API in einen Ordner schreiben,
// den der Spieler selbst ausgewählt hat. Firefox und Safari können das nicht.
//
// Ablauf:
// 1. Beim Start liest openDataFolder() die Datei einmal in saveData ein.
// 2. Die load...-Funktionen lesen aus saveData und antworten sofort.
// 3. Die save...-Funktionen ändern saveData und schreiben danach die ganze Datei neu.
//
// Dateien lesen und schreiben dauert ein paar Millisekunden. Diese Funktionen sind "async":
// Mit "await" wartet man, bis sie fertig sind, ohne dass das Spiel hängen bleibt.

// Name der Datei im Spielordner.
// tests.html setzt ihn auf "test-data.json", damit die Tests den echten Spielstand nicht überschreiben.
let dataFileName = "data.json";

// Der Spielstand im Arbeitsspeicher, also eine Kopie des Datei-Inhalts.
let saveData = makeEmptySaveData();

// Der Ordner, den der Spieler ausgewählt hat. null, solange noch keiner gewählt ist.
let dataFolder = null;

// Warteschlange: Jeder Schreibvorgang wartet, bis der vorherige fertig ist.
// So schreiben nie zwei Speicherungen gleichzeitig in dieselbe Datei.
let lastWrite = Promise.resolve();

// true, solange die Fehlermeldung "Speichern fehlgeschlagen" schon angezeigt wurde.
// So erscheint sie nur einmal und nicht bei jedem Speichern (alle 5 s) erneut.
let saveErrorShown = false;

// Wie oft writeNow() es versucht, bevor die Fehlermeldung kommt, und wie lange es
// dazwischen wartet (siehe writeNow()).
const SAVE_ATTEMPTS = 3;
const SAVE_RETRY_DELAY_MS = 200;

// Hilfsfunktion: ein leerer Spielstand (noch kein Tier, 0 Münzen, keine Kämpfe).
function makeEmptySaveData() {
  return { creature: null, coins: 0, battles: [] };
}

// Gibt true zurück, wenn der Browser in Dateien schreiben kann (Chrome, Edge).
function canUseDataFile() {
  return typeof showDirectoryPicker === "function";
}


// ===== Ordner merken (IndexedDB) =====
// Damit man den Ordner nicht bei jedem Start neu auswählen muss, merken wir ihn uns in
// IndexedDB, einer kleinen Datenbank im Browser. localStorage kann keine Ordner speichern.

// Öffnet die Browser-Datenbank "hatchheroes" mit dem Bereich "folders".
function openFolderMemory() {
  return new Promise(function (resolve, reject) {
    const request = indexedDB.open("hatchheroes", 1);
    request.onupgradeneeded = function () {
      request.result.createObjectStore("folders");   // nur beim allerersten Öffnen
    };
    request.onsuccess = function () { resolve(request.result); };
    request.onerror = function () { reject(request.error); };
  });
}

// Merkt sich den ausgewählten Ordner.
async function rememberFolder(folder) {
  const database = await openFolderMemory();
  return new Promise(function (resolve, reject) {
    const transaction = database.transaction("folders", "readwrite");
    transaction.objectStore("folders").put(folder, "gameFolder");
    transaction.oncomplete = function () { resolve(); };
    transaction.onerror = function () { reject(transaction.error); };
  });
}

// Gibt den gemerkten Ordner zurück, oder null, wenn noch keiner gemerkt ist.
async function loadRememberedFolder() {
  const database = await openFolderMemory();
  return new Promise(function (resolve, reject) {
    const request = database.transaction("folders").objectStore("folders").get("gameFolder");
    request.onsuccess = function () {
      resolve(request.result === undefined ? null : request.result);
    };
    request.onerror = function () { reject(request.error); };
  });
}


// ===== Datei öffnen, lesen, schreiben =====

// FR2.1, DH11: Holt den Spielordner und lädt die Datei in saveData.
// askUser = false: Lädt nur, wenn Chrome den Zugriff schon erlaubt hat. Es erscheint kein Dialog.
// askUser = true:  Darf nachfragen bzw. den Ordner-Dialog öffnen. Chrome erlaubt das nur
//                  direkt nach einem Klick des Spielers.
// Gibt true zurück, wenn der Spielstand geladen ist, sonst false.
async function openDataFolder(askUser) {
  let folder = await loadRememberedFolder();

  // Gemerkter Ordner: Haben wir noch Zugriff?
  if (folder !== null) {
    let permission = await folder.queryPermission({ mode: "readwrite" });
    if (permission === "prompt" && askUser) {
      permission = await folder.requestPermission({ mode: "readwrite" });   // "Zugriff erlauben?"
    }
    if (permission !== "granted") {
      if (!askUser) {
        return false;
      }
      folder = null;   // Zugriff abgelehnt → Ordner neu auswählen lassen
    }
  }

  // Noch kein Ordner: Ordner-Dialog öffnen.
  if (folder === null) {
    if (!askUser) {
      return false;
    }
    try {
      folder = await showDirectoryPicker({ id: "hatchheroes", mode: "readwrite" });
    } catch (error) {
      if (error.name === "AbortError") {
        return false;   // Der Spieler hat den Dialog mit "Abbrechen" geschlossen.
      }
      throw error;
    }
    await rememberFolder(folder);
  }

  dataFolder = folder;
  await readDataFile();
  return true;
}

// DH11, NFR2.1: Liest die Datei aus dem Spielordner in saveData.
// Gibt es die Datei noch nicht, wird sie mit einem leeren Spielstand angelegt.
// Ist der Inhalt kein gültiges JSON (z. B. von Hand falsch bearbeitet), wirft JSON.parse einen
// Fehler. Die Datei wird dann NICHT überschrieben.
async function readDataFile() {
  const fileHandle = await dataFolder.getFileHandle(dataFileName, { create: true });
  const file = await fileHandle.getFile();
  const text = await file.text();

  if (text === "") {
    saveData = makeEmptySaveData();   // neue, leere Datei
    await writeDataFile();
  } else {
    saveData = JSON.parse(text);
  }
}

// DH9, DH10, DH12: Stellt das Schreiben der Datei hinten in die Warteschlange.
// Wer warten muss, bis die Datei wirklich geschrieben ist, schreibt "await writeDataFile()".
// Klappt das Schreiben nicht (Zugriff entzogen, Festplatte voll), erscheint einmal eine Meldung.
// Klappt es später wieder, wird eine neue Störung auch wieder gemeldet.
// Alte Kämpfe werden nie automatisch gelöscht (DH12).
function writeDataFile() {
  lastWrite = lastWrite.then(writeNow).catch(function (error) {
    if (!saveErrorShown) {
      saveErrorShown = true;
      alert("Speichern fehlgeschlagen: " + error.message);
    }
  });
  return lastWrite;
}

// DH9: Hilfsfunktion für writeDataFile(): schreibt saveData in die Datei, mit bis zu
// SAVE_ATTEMPTS Versuchen. Warum? Auf Windows darf Chrome die Datei nicht ersetzen,
// solange ein anderes Programm sie kurz offen hat (z. B. der Virenscanner direkt nach
// dem letzten Speichern). Dann schlägt ein Versuch fehl – kurz warten und nochmal.
// Ohne gewählten Ordner passiert nichts.
async function writeNow() {
  if (dataFolder === null) {
    return;
  }
  for (let attempt = 1; attempt <= SAVE_ATTEMPTS; attempt++) {
    try {
      await writeOnce();
      saveErrorShown = false;   // Speichern klappt (wieder) → eine neue Störung wird wieder gemeldet
      return;
    } catch (error) {
      console.warn("Speichern: Versuch " + attempt + " fehlgeschlagen (" + error.name + "): " + error.message);
      if (attempt === SAVE_ATTEMPTS) {
        throw error;   // alle Versuche fehlgeschlagen → writeDataFile() zeigt die Meldung
      }
      await new Promise(function (resolve) { setTimeout(resolve, SAVE_RETRY_DELAY_MS); });
    }
  }
}

// Hilfsfunktion für writeNow(): schreibt saveData einmal als JSON-Text in die Datei.
// Die Einrückung (2 Leerzeichen) macht die Datei im Texteditor gut lesbar.
async function writeOnce() {
  const text = JSON.stringify(saveData, null, 2);
  const fileHandle = await dataFolder.getFileHandle(dataFileName, { create: true });
  const writable = await fileHandle.createWritable();
  try {
    await writable.write(text);
    await writable.close();   // erst hier ist die Datei auf der Festplatte geändert
  } catch (error) {
    // Hilfsdatei wegräumen, damit der nächste Versuch neu anfangen kann
    await writable.abort().catch(function () {});
    throw error;
  }
}


// ===== Funktionen aus PROJEKTPLAN.md, Abschnitt 5 (Namen bleiben gleich) =====

// FR2.1, DH1–DH4, DH13: Speichert das Tier (Name, Typ, Bedürfnisse, Stadium, Fortschritt).
function saveCreature(creature) {
  saveData.creature = creature;
  writeDataFile();
}

// FR2.1, DH11: Gibt das Tier zurück, oder null, wenn noch keines gespeichert ist.
function loadCreature() {
  return saveData.creature;
}

// DH5: Speichert die Münzen.
function saveCoins(coins) {
  saveData.coins = coins;
  writeDataFile();
}

// DH5, DH11: Gibt die Münzen zurück (0, wenn noch nichts gespeichert ist).
function loadCoins() {
  return saveData.coins;
}

// DH6–DH8, DH12: Hängt einen Kampf hinten an die Liste aller Kämpfe an.
// battle = { opponent, endedAt, result }. Alte Kämpfe werden nie gelöscht.
function addBattle(battle) {
  saveData.battles.push(battle);
  writeDataFile();
}

// NFR2.1: Gibt die count neuesten Kämpfe zurück, den neuesten zuerst.
// Die neuesten stehen hinten in der Liste: slice(-count) nimmt die letzten count Einträge,
// reverse() dreht sie um.
function loadRecentBattles(count) {
  return saveData.battles.slice(-count).reverse();
}

// DH12: Gibt die Anzahl aller gespeicherten Kämpfe zurück.
function countBattles() {
  return saveData.battles.length;
}

// Neu starten: Setzt den ganzen Spielstand zurück (Tier, Münzen und Kampf-Historie)
// und schreibt das in die Datei. Mit "await deleteSaveGame()" wartet man, bis die Datei geschrieben ist.
function deleteSaveGame() {
  saveData = makeEmptySaveData();
  return writeDataFile();
}
