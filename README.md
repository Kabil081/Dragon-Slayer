# DRAGONSLAYER: Rise of the North

A 2D side-scrolling dark-fantasy action game in HTML5 Canvas and vanilla
JavaScript (ES modules, no build step, no backend). Two levels are playable:

1. **The Frozen Wall**: Varkhul, the Ember Wyrm (bite, fire breath, flame strafe).
2. **The Broken Battlements**: Emberwing, a faster dragon (bite, fireball, flame
   sweep, charge), in a wider arena with breakable cover and cracked
   platforms. Unlocks after Level 1.

## Play

Double-click `play.bat`, or run this in the project folder and open
http://localhost:8642:

```bash
python -m http.server 8642
```

Opening `index.html` straight from disk does not work: browsers block ES
modules on `file://`, and the page says so.

| Key | Action |
|---|---|
| A / D or ← → | Move |
| Space | Jump (hold for higher) |
| J | Attack; press again to chain up to 3 hits |
| Shift | Dodge roll (invulnerable mid-roll) |
| K | Weapon special |
| Escape | Pause |

URL switches: `?debug` draws hitboxes, hurtboxes, fire rays and solids.
`?smoke` runs the automated playtest (see Testing).

## Project layout

```
index.html, styles/main.css   page shell and menu styling
src/
  main.js                     boot: load assets, report anything missing, start
  core/                       engine (no game rules)
    Game.js                   owns all systems; loop with step()/render()
    Input.js                  keyboard state, edges, input buffering
    AssetLoader.js            reads assets/manifest.json, loads every image
    Renderer.js               1920x1080 letterboxed canvas, sprites, parallax
    Camera.js                 follow, look-ahead, bounds, arena lock, shake
    Particles.js              pooled fire/sparks/ice/embers/dust + snowfall
    SaveManager.js            versioned localStorage save
    math.js
  game/                       gameplay
    Player.js                 movement, jump, attack chain, dodge, hurt, death
    Weapon.js                 weapon data + K special behaviours
    Combat.js                 damage rules, hitstop, numbers, burn ticks
    Dragon.js                 shared boss state machine (telegraph/active/recovery)
    DragonAttacks.js          attack behaviours: melee, breath, strafe, fireball, sweep, charge
    Hazards.js                Frost Nova, Ember Wave, dragon fireballs
    Level.js                  runtime world: layers, floor, cover (breakable), platforms
    LevelManager.js           level flow: explore, arena, intro, win/lose
    ProgressionManager.js     XP, levels, gold, unlocks, derived stats
    Shop.js                   armory: buy/equip weapons, buy upgrades
    Animator.js               plays manifest animations
  ui/  HUD.js (canvas), UI.js (DOM menus)
  data/                       all tunable numbers
    levels.js  enemies.js  weapons.js  progression.js  config.js
  debug/SmokeTest.js          automated playtest
  debug/Bot.js                scripted player that fights whole boss encounters
assets/                       generated art + manifest.json (see below)
tools/generate_assets.py      regenerates all art
asset_preview.html            browse/animate every asset
```

## How it plays

- **Combat.** Sword hitboxes are swept from the blade's hand and tip anchors
  exported with every frame, so each weapon's reach matches its art. Head hits
  deal 1.3x. Hits cause hitstop, shake, sparks and damage numbers.
- **Dragon AI** (`Dragon.js`): dormant → landing intro → roar → idle/walk →
  telegraph → active → recovery, plus stagger (poise broken) and death. Attacks
  are picked by range, cooldown and weight from `data/enemies.js`.
  - *Bite*: head glint and a floor warning, 0.6 s before the strike.
  - *Fire breath*: chest glow, embers at the mouth and a burning floor zone,
    1.1 s before the stream. Stone cover blocks the stream.
  - *Flame strafe* (below 50% health): a roar, takeoff, and moving arrows
    across the floor for 1 s, then a fiery pass. Roll through it or jump it.
- **Emberwing** (Level 2), each attack with a wind-up and a punishable recovery:
  - *Fireball*: an orb charges in its jaws (0.95 s) while a reticle tracks you.
    The reticle locks before release and the shot bursts exactly there, so
    stepping out of the ring is enough. Below 50% health it fires volleys of 3.
  - *Flame sweep*: the head drops to the floor (0.9 s) with a burning floor
    warning, then a low wall of flame runs along the ground. Jump it, roll
    through it, or stand on a platform. Cover stops it.
  - *Charge*: it braces (0.8 s) with arrows along its path, then gallops. Only
    the head hurts, so roll under it. Lure it into breakable cover and it
    shatters the stone and is stunned for 2 s.
- **Breakable cover** blocks fireballs: the first hit cracks it, the second
  crumbles it to rubble. **Cracked platforms** are one-way ledges about 200 px
  up, above the sweep and the charge.
- **Wide arenas.** The camera leans toward the dragon, and an edge marker
  shows where it is when it's off screen (red "!" while it winds up).
- **Fairness.** Dodge i-frames last 0.35 s. Fire ticks respect them but never
  stun-lock, so you can always roll out.
- **Progression.** XP and player levels raise health and attack. Gold buys
  weapons and upgrades (Vitality, Strength, Fire Ward). Each level has an
  explicit first-clear and repeat reward, and later levels pay more:

  | Level | First clear | Repeat | Flawless bonus |
  |---|---|---|---|
  | 1 | 100 gold, 120 XP (one level-up) | 40 gold, 40 XP | +15 gold |
  | 2 | 150 gold, 130 XP | 60 gold, 50 XP | none |

  Clearing Level 1 unlocks Level 2 and the Northern Longsword; clearing
  Level 2 unlocks the Heavy Greatsword. The victory screen shows the reward
  summary and a Continue button. Everything persists in localStorage.

## Adding a level (no engine changes)

A level is one entry in `src/data/levels.js`. Level 2 was added this way:

1. **Art.** Add a background set to `BACKGROUND_SETS` in
   `tools/generate_assets.py` (built from the functions in
   `tools/assetgen/backgrounds.py`). Add a dragon to `DRAGONS` there: same rig,
   its own palette, plus `EXTRA_ANIMS` if it needs the sweep or charge poses.
   Run `python tools/generate_assets.py dragon backgrounds`.
2. **Enemy.** Add an entry to `src/data/enemies.js`. Each attack picks a `kind`
   (`melee`, `breath`, `strafe`, `fireball`, `sweep`, `charge`) and sets its
   timings, ranges and damage.
3. **Level.** Change the `planned` entry to `status: 'playable'` and fill in
   `background`, `length`, `cover` (add `hp` to make it breakable),
   `platforms`, `arena`, `boss` and `rewards` (`firstClear` / `repeat`).
4. **Test.** Run `?smoke`, then play it. The campaign map, unlock chain,
   rewards and saves pick up the new level on their own.

Only a new kind of behaviour needs code: a new attack kind is one entry in
`ATTACK_TYPES` (`DragonAttacks.js`), and a new weapon special is one entry in
`SPECIALS` (`Weapon.js`). The state machine in `Dragon.js` doesn't change.

## Testing

Open `http://localhost:8642/?smoke`. It drives the real game at a fixed
60 fps with simulated keys, uses its own save slot (your progress is never
touched), and reports 48 checks.

- **Level 1:** movement, jump, hitboxes, dodge i-frames, cover, the arena lock,
  every Varkhul attack and how to avoid it, stagger, the strafe, death,
  rewards, saving, the shop, restart and retry.
- **Level 2:** the unlock, the arena width and scrolling, the telegraph and
  recovery minimums, each Emberwing attack (it hits, and each counter avoids
  it), breakable cover, platforms, the charge crash, the exact rewards, and
  the Continue button.
- **Full fights:** the bot fights both bosses start to finish with the Steel
  Sword at the player level you'd have after Level 1.

## Assets

All art is generated procedurally by `tools/generate_assets.py` (Python with
Pillow and numpy) from one rig, so proportions stay consistent. The manifest
lists frame sizes, pivots, fps and per-frame anchors. The game refuses to
start and lists the files if any referenced asset is missing; it never
substitutes another image.

| Asset | Size | Notes |
|---|---|---|
| Warrior frames | 256 x 256 | faces right, pivot (128, 236); 7 animations x 7 variants (6 weapons + unarmed) |
| Dragon frames | 768 x 512 | faces left, pivot (384, 486); idle, walk, attack, fire_breath, stagger, flight, death (Emberwing adds flame_sweep, charge) |
| Weapons | varies | blade up; `grip` and `tip` in the manifest |
| Backgrounds | 3840 x 1080 | `frozen_wall`, `broken_battlements`; 5 parallax layers each, all tile horizontally; floor at y = 900 |

Fire, ice, sword trails, snow, embers, hit flashes and screen shake are drawn
in code. The concept key art appears only on menu screens, never in gameplay.

**Not supplied yet:** audio (no music or sound effects), and backgrounds and
dragons for levels 3–10. Those levels show as "Coming soon" and reference no
files.

All designs are original. No characters, sigils or logos from existing
franchises are used.
