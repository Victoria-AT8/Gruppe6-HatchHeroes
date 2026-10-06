# HÜ1 – Änderungen

**Gruppe 6 · HatchHeroes** · Owner dieser Datei: Erol · Stand: 06.10.2026

Hier stehen alle Änderungen an der HÜ1 aus `PROJEKTPLAN.md`, Abschnitt 1, als fertige Texte. Die alte Fassung ist wörtlich aus `HUE1_HatchHeroes.pdf` übernommen. In der neuen Fassung sind geänderte Stellen **fett** markiert.

**So geht es weiter:**
- Jede Person prüft die Abschnitte, bei denen sie als Owner steht.
- Danach überträgt sie den Text in `Projekt HatchHeroes_HÜ1_Group6.odt`.
- Zum Schluss wird `HUE1_HatchHeroes.pdf` neu exportiert (siehe Checkliste am Ende).

| # | Stelle | Owner |
|---|---|---|
| 1 | FR1.1 + Evolution algorithm „Egg → Baby“, Schritt 1 | Victoria |
| 2 | FR2.1 | Erol |
| 3 | FR3.1 | Jan |
| 4 | FR3.2 | Jan |
| 5 | Kampf-Algorithmen (ersetzen „Battle damage“, „Defend action“, „Opponent-action“, „Battle termination“) | Jan |
| 6 | DH8 | Erol |
| 7 | DH9 | Erol |
| 8 | DH11 | Erol |
| 9 | DH12 | Erol |
| 10 | DH13 (neu) | Erol |

---

## 1. FR1.1 – Typ beim Benennen wählen (Owner: Victoria)

**Alt:**
> **FR1.1**
> The player shall be able to name an egg and hatch it after a displayed countdown. The interface shall show the resulting creature and its current development stage.

**Neu:**
> **FR1.1**
> The player shall be able to name an egg, **choose one of the four creature types Fire, Water, Earth, or Wind,** and hatch it after a displayed countdown. The interface shall show the resulting creature, **its type,** and its current development stage.

Dazu im Abschnitt *Evolution algorithm → Egg → Baby*, Schritt 1:

**Alt:**
> 1. The player assigns a valid name to the egg.

**Neu:**
> 1. The player assigns a valid name to the egg **and chooses one of the four creature types (Fire, Water, Earth, Wind)**.

---

## 2. FR2.1 – Typ mitspeichern, localStorage statt „database“ (Owner: Erol)

**Alt:**
> **FR2.1**
> The system shall store the creature's name, needs, development stage, and evolution progress in a database after every completed action. These values shall be restored when the game is reopened.

**Neu:**
> **FR2.1**
> The system shall store the creature's name, **type,** needs, development stage, and evolution progress in **persistent browser storage (localStorage)** after every completed action. These values shall be restored when the game is reopened.

---

## 3. FR3.1 – 4 Attacken, gleichzeitige Wahl (Owner: Jan)

**Alt:**
> **FR3.1**
> The system shall unlock battles after the second evolution. Battles shall alternate between player and opponent turns, offer attack and defend actions, display both creatures' health, and end when either creature reaches zero health.

**Neu:**
> **FR3.1**
> The system shall unlock battles after the second evolution. **In each round, the player shall choose one of the creature's four attacks while the opponent chooses one of its four attacks at the same time.** The system shall display both creatures' health **and, for each round, first the opponent's action and then the player's action.** The battle shall end when **at least one creature** reaches zero health, **with the result Win, Loss, or Draw.**

---

## 4. FR3.2 – Schaden ohne Happiness, zufälliger Gegner (Owner: Jan)

**Alt:**
> **FR3.2**
> The system shall calculate damage using the chosen action, the creature's happiness at the start of the battle, and the opponent's defence. It shall select opponent actions using predefined rules and save each battle's opponent, date, and result in the database.

**Neu:**
> **FR3.2**
> The system shall calculate damage using **the attack and defence values of both chosen attacks and the type bonuses defined in the battle round algorithm; happiness shall not influence damage.** It shall select **each opponent attack at random from the opponent's four attacks** and save each battle's opponent, date **and time**, and result in **persistent browser storage (localStorage)**.

---

## 5. Kampf-Algorithmen (Owner: Jan)

Die vier alten Abschnitte *Battle damage algorithm*, *Defend action*, *Opponent-action algorithm* und *Battle termination algorithm* werden **komplett ersetzt**. Die neuen Texte entsprechen `PROJEKTPLAN.md`, Abschnitt 2.5.

### Alt (wird gelöscht)

> **Battle damage algorithm**
> At the beginning of a battle, the player's current happiness value is stored as the battle happiness value H.
> For an Attack action, damage is determined using: a base damage value of 20; the player's happiness at the beginning of the battle; the opponent's defence value.
> Each hostile creature has a predefined defence value D in the range 0 to 100.
> Damage is calculated as: Damage = round(20 × (0.5 + H / 200) × (1 − D / 200))
> where: H is the player's battle happiness from 0 to 100; D is the defending creature's defence value from 0 to 100.
> The calculated damage is subtracted from the target's health.
> A creature's health cannot fall below zero.
>
> **Defend action**
> When a creature selects Defend, the damage received from the next successful Attack action against that creature is reduced by 50%, rounded to the nearest whole number.
> The defence effect expires immediately after reducing one incoming Attack action.
>
> **Opponent-action algorithm**
> The opponent uses predefined deterministic rules rather than player input.
> 1. If the opponent's current health is greater than 30, the opponent selects Attack.
> 2. If the opponent's current health is 30 or lower, the opponent selects Defend.
> 3. After the opponent action has been processed, control returns to the player unless one creature has reached zero health.
>
> This algorithm ensures that opponent behaviour is reproducible and can be verified in automated tests.
>
> **Battle termination algorithm**
> After every action that can cause damage, the system evaluates both creatures' health.
> - If the opponent reaches 0 health first, the battle ends with the result Win.
> - If the player's creature reaches 0 health first, the battle ends with the result Loss.
>
> After the battle ends, the system stores the opponent, completion date and time, and battle result in the database.
> A victory increases the player's currency balance by 100 coins.
> The completed battle is then added to the battle history.

### Neu

> **Creature types**
> Every creature has exactly one of the four types Fire, Water, Earth, or Wind. The following table defines which type is strong against which:
>
> | Type | strong against | weak against | neutral to |
> |---|---|---|---|
> | Fire | Wind | Water | Earth |
> | Water | Fire | Earth | Wind |
> | Earth | Water | Wind | Fire |
> | Wind | Earth | Fire | Water |
>
> In short: Fire > Wind > Earth > Water > Fire, where ">" means "strong against".
> - Only "strong against" gives a bonus. "Weak against" has no effect of its own; it only means that the other creature is strong against this one.
> - Two creatures of the same type are neutral to each other.
> - In addition, there are attacks of the type Normal. They match no creature type and never receive a bonus.
>
> **Attacks**
> Every attack has a name, a type, an attack value, a defence value, and a flag that marks it as a counter. Each creature type and each opponent has exactly four attacks.
> At the start of a battle, both creatures have 100 health. The opponent is chosen at random from the list of opponents.
>
> **Battle round algorithm**
> 1. The player selects one of the creature's four attacks. At the same time, the opponent selects one of its four attacks (see opponent-action algorithm).
> 2. If at least one of the two attacks is a counter, the round ends without damage.
> 3. Each side calculates the values of its own attack:
>    - p1 = 115 if the creature's type is equal to the attack's type, otherwise 100.
>    - p2 = 120 if p1 = 115 **and** the creature is strong against the other creature, otherwise 100.
>    - Attack = round(attack value × p1 × p2 / 10000)
>    - Defence = round(defence value × p1 × p2 / 10000)
> 4. Damage is calculated as:
>    - Damage to the opponent = max(0, player's Attack − opponent's Defence)
>    - Damage to the player = max(0, opponent's Attack − player's Defence)
> 5. Both damage values are subtracted at the same time. A creature's health cannot fall below zero.
> 6. The system first displays the opponent's attack and the damage it caused, then the player's attack and the damage it caused.
>
> The bonuses are calculated with whole numbers (115 and 120 instead of 1.15 and 1.2), because decimal numbers lead to rounding errors in JavaScript (e.g. 25 × 1.15 × 1.2 results in 34 instead of 35).
>
> **Opponent-action algorithm**
> In every round, the opponent selects one of its four attacks at random, each with the same probability. The selection does not depend on the opponent's health.
> To keep automated tests reproducible, the round calculation receives the opponent's chosen attack as an input, so a test can specify a fixed opponent attack.
>
> **Battle termination algorithm**
> After every round, the system evaluates both creatures' health:
> - If both creatures have 0 health, the battle ends with the result Draw.
> - If only the opponent has 0 health, the battle ends with the result Win.
> - If only the player's creature has 0 health, the battle ends with the result Loss.
> - Otherwise, the next round begins.
>
> After the battle ends, the system stores the opponent, completion date and time, and battle result in persistent browser storage (localStorage).
> A victory increases the player's currency balance by 100 coins. A draw or a loss does not change the currency balance.
> The completed battle is then added to the battle history. A battle that is aborted before it ends (for example by reloading the page) is not stored.

---

## 6. DH8 – Ergebnis auch `Draw` (Owner: Erol)

**Alt:**
> **DH8 – Battle history result**
> For every completed battle, the system shall store exactly one result with the value Win or Loss.
> **Verification:** Complete one winning and one losing battle and verify the persisted values.

**Neu:**
> **DH8 – Battle history result**
> For every completed battle, the system shall store exactly one result with the value Win, Loss, **or Draw**.
> **Verification:** Complete one winning, one losing, **and one drawn** battle and verify the persisted values. **A draw can also be produced in an automated test with fixed attacks.**

---

## 7. DH9 – localStorage statt „database“ (Owner: Erol)

Der Requirement-Text bleibt gleich, nur die Verification ändert sich.

**Alt:**
> **DH9 – Persistence after care actions**
> The system shall persist all creature-state values affected by a completed care action no later than 1 second after the action has completed.
> **Verification:** Perform each care action individually and inspect the database within one second after completion.

**Neu:**
> **DH9 – Persistence after care actions**
> The system shall persist all creature-state values affected by a completed care action no later than 1 second after the action has completed.
> **Verification:** Perform each care action individually and inspect **the persistent browser storage (browser developer tools → Application → Local Storage)** within one second after completion.

---

## 8. DH11 – Typ wird wiederhergestellt (Owner: Erol)

**Alt:**
> **DH11 – Restoration after application restart**
> When the game is reopened, the system shall restore the most recently persisted creature name, need values, development stage, evolution progress, and player currency before the main pet screen becomes interactive.
> **Verification:** Modify the stored state, close the application, reopen it, and compare all restored values with the most recently persisted values.

**Neu:**
> **DH11 – Restoration after application restart**
> When the game is reopened, the system shall restore the most recently persisted creature name, **type,** need values, development stage, evolution progress, and player currency before the main pet screen becomes interactive.
> **Verification:** Modify the stored state, close the application, reopen it, and compare all restored values with the most recently persisted values.

---

## 9. DH12 – localStorage statt „database“ (Owner: Erol)

**Alt:**
> **DH12 – Battle-history capacity**
> The database shall support at least 10,000 completed battle-history records without deleting existing records automatically.
> **Verification:** Populate the database with 10,000 battle records and verify that all records remain accessible.

**Neu:**
> **DH12 – Battle-history capacity**
> **The persistent browser storage (localStorage)** shall support at least 10,000 completed battle-history records without deleting existing records automatically.
> **Verification:** Populate **the storage** with 10,000 battle records and verify that all records remain accessible. **This is done by the automated test in `tests/tests.html`.**

---

## 10. DH13 – neu: Typ des Tiers (Owner: Erol)

Neu, direkt nach DH12 einfügen:

> **DH13 – Creature type**
> The system shall store the creature's type as one of the following four values: Fire, Water, Earth, Wind.
> **Verification:** Create one creature of each type, inspect the persisted creature record, and confirm that the stored type is the chosen one.

---

## Geprüft und unverändert

Diese Stellen haben wir geprüft. Sie passen auch nach den Änderungen und bleiben gleich:
- **Einleitung** („turn-based battles“): Ein Kampf läuft weiterhin in Runden ab.
- **Happiness calculation algorithm** und der übrige **Evolution algorithm**: Sie entsprechen `PROJEKTPLAN.md`, Abschnitt 2.3 und 2.4.
- **NFR1.1, FR1.2, FR2.2, NFR2.1, NFR3.1**
- **DH1–DH7, DH10**

---

## Checkliste

| Schritt | Wer | Erledigt |
|---|---|---|
| Abschnitt 1 prüfen und in die `.odt` übertragen | Victoria | ☐ |
| Abschnitte 3, 4, 5 prüfen und in die `.odt` übertragen | Jan | ☐ |
| Abschnitte 2, 6–10 in die `.odt` übertragen | Erol | ☐ |
| `HUE1_HatchHeroes.pdf` aus der `.odt` neu exportieren und committen | Erol | ☐ |
