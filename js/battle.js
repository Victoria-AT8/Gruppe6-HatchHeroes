// Owner: Jan
// Kampf-Logik und Kampf-Daten – nur Rechnungen, kein HTML, kein localStorage.
// Regeln: PROJEKTPLAN.md, Abschnitt 2.5

const START_HEALTH = 100;
const WIN_COINS = 100;

// Typ-Effektivität (Abschnitt 2.5):
// Feuer > Wind > Erde > Wasser > Feuer ("stark gegen")
const STRONG_AGAINST = {
  Fire: "Wind",
  Wind: "Earth",
  Earth: "Water",
  Water: "Fire"
};

// 4 Attacken je Tier-Typ (Abschnitt 2.5 und 10.1)
const ATTACKS = {
  Fire: [
    { name: "Feuerball", type: "Fire", attack: 30, defense: 10, isCounter: false },
    { name: "Flammenstoß", type: "Fire", attack: 25, defense: 5, isCounter: false },
    { name: "Biss", type: "Normal", attack: 20, defense: 10, isCounter: false },
    { name: "Feuerschild", type: "Fire", attack: 0, defense: 20, isCounter: true }
  ],
  Water: [
    { name: "Aquaknarre", type: "Water", attack: 30, defense: 10, isCounter: false },
    { name: "Surfer", type: "Water", attack: 25, defense: 10, isCounter: false },
    { name: "Tackle", type: "Normal", attack: 20, defense: 10, isCounter: false },
    { name: "Wasserwand", type: "Water", attack: 0, defense: 20, isCounter: true }
  ],
  Earth: [
    { name: "Steinwurf", type: "Earth", attack: 25, defense: 10, isCounter: false },
    { name: "Erdbeben", type: "Earth", attack: 30, defense: 5, isCounter: false },
    { name: "Rempler", type: "Normal", attack: 20, defense: 10, isCounter: false },
    { name: "Felsblock", type: "Earth", attack: 0, defense: 25, isCounter: true }
  ],
  Wind: [
    { name: "Windstoß", type: "Wind", attack: 20, defense: 10, isCounter: false },
    { name: "Orkan", type: "Wind", attack: 30, defense: 5, isCounter: false },
    { name: "Kratzer", type: "Normal", attack: 15, defense: 10, isCounter: false },
    { name: "Wirbelwind", type: "Wind", attack: 0, defense: 15, isCounter: true }
  ]
};

// Mindestens 3 Gegner mit je 4 Attacken (Abschnitt 2.5)
const OPPONENTS = [
  {
    name: "Grimmzahn",
    type: "Wind",
    image: "🐺",
    attacks: [
      { name: "Windstoß", type: "Wind", attack: 20, defense: 10, isCounter: false },
      { name: "Reißzahn", type: "Normal", attack: 25, defense: 5, isCounter: false },
      { name: "Orkan", type: "Wind", attack: 30, defense: 10, isCounter: false },
      { name: "Schattensprung", type: "Wind", attack: 0, defense: 15, isCounter: true }
    ]
  },
  {
    name: "Lavakoloss",
    type: "Fire",
    image: "🌋",
    attacks: [
      { name: "Feuerball", type: "Fire", attack: 30, defense: 10, isCounter: false },
      { name: "Flammenfaust", type: "Fire", attack: 25, defense: 10, isCounter: false },
      { name: "Wuchtbrumme", type: "Normal", attack: 20, defense: 5, isCounter: false },
      { name: "Magmapanzer", type: "Fire", attack: 0, defense: 20, isCounter: true }
    ]
  },
  {
    name: "Wassergeist",
    type: "Water",
    image: "🌊",
    attacks: [
      { name: "Aquaknarre", type: "Water", attack: 30, defense: 10, isCounter: false },
      { name: "Wasserstrudel", type: "Water", attack: 25, defense: 10, isCounter: false },
      { name: "Flossenschlag", type: "Normal", attack: 20, defense: 10, isCounter: false },
      { name: "Nebelwand", type: "Water", attack: 0, defense: 20, isCounter: true }
    ]
  },
  {
    name: "Felsengolem",
    type: "Earth",
    image: "🪨",
    attacks: [
      { name: "Steinwurf", type: "Earth", attack: 25, defense: 10, isCounter: false },
      { name: "Felssturz", type: "Earth", attack: 30, defense: 10, isCounter: false },
      { name: "Kopfnuss", type: "Normal", attack: 20, defense: 5, isCounter: false },
      { name: "Granitblock", type: "Earth", attack: 0, defense: 25, isCounter: true }
    ]
  }
];

// Gibt die 4 Attacken für einen Tier-Typ zurück (Kopie)
function getAttacksForType(type) {
  const list = ATTACKS[type] || ATTACKS.Fire;
  return list.map(function (attack) {
    return Object.assign({}, attack);
  });
}

// Gibt true zurück, wenn type laut Tabelle stark gegen enemyType ist.
function isStrongAgainst(type, enemyType) {
  return STRONG_AGAINST[type] === enemyType;
}

// Berechnet effektiven Angriff oder Verteidigung nach Abschnitt 2.5:
// - p1 = 115, wenn Tier-Typ gleich Attacken-Typ ist, sonst 100
// - p2 = 120, wenn p1 = 115 und eigenes Tier stark gegen gegnerisches ist, sonst 100
// - Wert = Math.round(baseValue * p1 * p2 / 10000)
function calcStat(creatureType, enemyType, baseValue, attackType) {
  const p1 = (creatureType === attackType) ? 115 : 100;
  const p2 = (p1 === 115 && isStrongAgainst(creatureType, enemyType)) ? 120 : 100;
  return Math.round(baseValue * p1 * p2 / 10000);
}

// Gibt ein neues Kampf-Objekt zurück: zufälliger Gegner, beide mit START_HEALTH.
function startBattle(creature) {
  const opponentTemplate = OPPONENTS[Math.floor(Math.random() * OPPONENTS.length)];
  const opponent = {
    name: opponentTemplate.name,
    type: opponentTemplate.type,
    image: opponentTemplate.image,
    attacks: opponentTemplate.attacks.map(function (attack) {
      return Object.assign({}, attack);
    })
  };

  const playerAttacks = getAttacksForType(creature.type);

  return {
    creature: creature,
    player: creature,
    opponent: opponent,
    playerHp: START_HEALTH,
    opponentHp: START_HEALTH,
    playerAttacks: playerAttacks,
    opponentAttacks: opponent.attacks,
    result: null
  };
}

// Gibt eine zufällige Attacken-Nummer des Gegners zurück (0 bis 3).
function chooseOpponentAttack() {
  return Math.floor(Math.random() * 4);
}

// Spielt eine Runde: playerAttack und opponentAttack sind Nummern von 0 bis 3
// (oder direkte Attacken-Objekte für flexible Tests).
// Ändert die HP in battle, setzt am Ende battle.result ("Win", "Loss" oder "Draw")
// und gibt die 2 Log-Zeilen zurück: zuerst Gegner, dann Spieler.
function playRound(battle, playerAttack, opponentAttack) {
  // Attacken ermitteln
  let playerAttackObj;
  if (typeof playerAttack === "number") {
    const pList = battle.playerAttacks || (battle.creature && ATTACKS[battle.creature.type]) || ATTACKS.Fire;
    playerAttackObj = pList[playerAttack];
  } else {
    playerAttackObj = playerAttack;
  }

  let opponentAttackObj;
  if (typeof opponentAttack === "number") {
    const oList = battle.opponentAttacks || (battle.opponent && battle.opponent.attacks);
    opponentAttackObj = oList[opponentAttack];
  } else {
    opponentAttackObj = opponentAttack;
  }

  const playerType = (battle.creature && battle.creature.type) || (battle.player && battle.player.type);
  const opponentType = battle.opponent && battle.opponent.type;

  // 2. Ist mindestens eine der beiden Attacken ein Konter, endet die Runde ohne Schaden.
  const isCounter = Boolean(playerAttackObj.isCounter || opponentAttackObj.isCounter);

  let damageToOpponent = 0;
  let damageToPlayer = 0;

  if (!isCounter) {
    // 3. Jede Seite berechnet die Werte für ihre eigene Attacke
    const playerAtk = calcStat(playerType, opponentType, playerAttackObj.attack, playerAttackObj.type);
    const playerDef = calcStat(playerType, opponentType, playerAttackObj.defense, playerAttackObj.type);

    const oppAtk = calcStat(opponentType, playerType, opponentAttackObj.attack, opponentAttackObj.type);
    const oppDef = calcStat(opponentType, playerType, opponentAttackObj.defense, opponentAttackObj.type);

    // 4. Schaden berechnen:
    damageToOpponent = Math.max(0, playerAtk - oppDef);
    damageToPlayer = Math.max(0, oppAtk - playerDef);
  }

  // 5. Beide Schäden werden gleichzeitig abgezogen. HP fallen nie unter 0.
  battle.opponentHp = Math.max(0, battle.opponentHp - damageToOpponent);
  battle.playerHp = Math.max(0, battle.playerHp - damageToPlayer);

  // 6. Anzeige: zuerst „Gegner setzt X ein – n Schaden“, danach „Du setzt Y ein – m Schaden“.
  const opponentLog = "Gegner setzt " + opponentAttackObj.name + " ein – " + damageToPlayer + " Schaden";
  const playerLog = "Du setzt " + playerAttackObj.name + " ein – " + damageToOpponent + " Schaden";

  // 7. Kampfende prüfen:
  if (battle.playerHp === 0 && battle.opponentHp === 0) {
    battle.result = "Draw";
  } else if (battle.opponentHp === 0) {
    battle.result = "Win";
  } else if (battle.playerHp === 0) {
    battle.result = "Loss";
  } else {
    battle.result = null;
  }

  return [opponentLog, playerLog];
}
