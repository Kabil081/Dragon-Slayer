# CLAUDE.md — DRAGONSLAYER: Rise of the North

Personal, non-commercial fan project. A cinematic 2D side-scrolling
dark-fantasy action game in the browser: a northern warrior fights one boss
dragon per level along the Frozen Wall.

## Status (verified against the code, Oct 2026)

| Area | State |
|---|---|
| Levels 1–7 | **Playable**: Frozen Wall (Varkhul), Broken Battlements (Emberwing), Ice Gate (Meleys + rider, scorpions), Ashen Bridge (Rhagal), **The Wallbreaker (Vhagar + Aemond, two lives)**, **The Dragonpit (Drogon + Viserion together)**, **The Three Calamities (Sunfyre, Vermithor, Balerion, then the Aegon duel; ending "The North Remembers")** |
| Weapons | 6 armory weapons + 6 battlefield weapons (Level 5 caches) + Frostbrand, all with art, styles and specials; about 30% weaker since Oct 17, then about 10% more (Oct 17, owner request; bot balance targets still met) |
| Progression | XP/levels, gold, armory, upgrades, first/repeat rewards, one-time achievements, localStorage saves |
| Online | Accounts, a cloud copy of each account's save, every battle sent to a **live leaderboard** (points, gold, speed, win probability; SSE). Server `tools/serve.py` + `tools/gameserver/`; SQLite by default, online Postgres via `DATABASE_URL`. Settings in `.env` (`.env.example`). Hosting: `HOSTING.md`. Guests play exactly as before |
| Audio | `src/core/Audio.js`: every SFX and the score are **synthesized live** (Web Audio): roars per dragon, fire, ice, steel, impacts, a theme per boss. M mutes (saved). Only the voice lines are files (`assets/audio/*.wav`, made by `tools/voice_lines.py` from Windows speech, "Microsoft David", deepened; not a recorded actor): the two ending lines (fallback: browser speech, then subtitles, reported on screen) and "Dracarys!" (`dracarys.wav` a rider's cry, `dracarys_aemond.wav` Aemond's). Every clip slot has a built-in sound (`CUES`); a player clip replaces it |
| Input | Keyboard only (no gamepad / touch) |
| Automated test | `index.html?smoke`: 203 checks (several minutes). `?smoke=7` runs only the 47 Level 7 checks, `?smoke=online` the 8 online/Dragonbane checks, `?smoke=sound` the 5 sound checks. Vhagar and Level 7 bot runs are report-only. Server: `python tools/test_server.py` (11 tests; `DS_TEST_DATABASE_URL` runs them on Postgres) |
| `README.md` | Outdated (written at Level 2). Trust this file and the code. |

## Tech stack (actual)

- **Game:** HTML5 Canvas 2D + vanilla JavaScript ES modules. No framework, no npm, no bundler, no `package.json`.
- **Font:** Cinzel via Google Fonts (falls back to Georgia offline).
- **Art pipeline:** Python 3 + Pillow + numpy draw every sprite and background procedurally (`tools/assetgen/`), including rim lighting and scale texture passes. No hand-painted or AI images ship in `assets/`.
- **Server:** `tools/serve.py` (stdlib `http.server`, `Cache-Control: no-store`). It serves only `index.html`, `src/`, `assets/`, `styles/`
  (never `.env`, `data/`, `tools/`); `assets/media/` only to this PC. Plus the API in `tools/gameserver/` (stdlib only; `psycopg` only for Postgres).

## Commands

```bash
play.bat                                  # Windows: start server + open the game
python tools/serve.py 8642                # same server, any OS -> http://localhost:8642
python tools/test_server.py               # server tests (accounts, saves, battles, boards, live, files) on a throwaway DB
python tools/generate_assets.py           # regenerate ALL art + assets/manifest.json (slow, many minutes)
python tools/generate_assets.py warrior   # one group: weapons warrior dragon backgrounds ui concept
python tools/generate_assets.py dragon:dragon_vhagar backgrounds:wallbreaker   # only some entries
```

- Test: open `http://localhost:8642/?smoke` (several minutes; `?smoke=7` for Level 7 only). It uses its own save slot. Debug hitboxes: `?debug`.
- `?lab`: a scratch save slot and a loop you step from the console (`DS.step(1/60)`, `DS.startLevel(7)`), for checking scenes.
- Voice lines: render the raw lines with Windows System.Speech (see `tools/voice_lines.py` header), then `python tools/voice_lines.py <folder>`.
- Groups also include `frostpiercer`; `warrior:frostbrand,unarmed,aegon` re-renders only those sheets.
- Syntax check a module: `node --input-type=module --check < src/game/Dragon.js`. Plain `node --check` misses some errors.
- Asset browser: `asset_preview.html`. No lint or build step exists.

## Architecture

```
index.html          import map adds ?v=<time> to every module (defeats stale cache) -> src/main.js
                    NEW MODULE FILES MUST BE ADDED TO ITS LIST
src/main.js         boot: AssetLoader -> Game -> online.init() (who is signed in) -> title; ?smoke runs debug/SmokeTest (offline)
src/core/           engine, no game rules
  Game.js           owns systems; step(dt)/render() loop; hitstop + slowmo; modes menu|playing|paused|results; mute (M)
  Audio.js          Web Audio synth: SFX recipes, THEMES (procedural score, one per boss), voice() with fallbacks
  Clips.js          optional player-supplied clips (assets/media/, see its README.txt): CLIP_SLOTS dracarys,
                    vhagar_fire (a dragon's `fireCue`, at the start of a fire attack), player_death, aegon_theme,
                    north_remembers, king_in_the_north. Never downloaded or shipped. `tools/add_clip.py` cuts one in.
                    Game.cue(id): the player's clip if present, else Audio CUES (the "Dracarys!" lines via
                    Audio.line, the funeral bell `fallen`); aegon_theme falls back to the 'aegon' score.
  Input.js          key state + buffering (KEYS in data/config.js); ignores keys typed into form fields
  Online.js         accounts (own save slot per account; a new account adopts the guest save), cloud save push (newer wins),
                    battle queue (localStorage, retried; guests send nothing), leaderboard/feed calls. Lean by design:
                    live (EventSource) only while the leaderboard is open; save pushed at level end, armory, sign-out,
                    page hide (or 45 s after a change), never twice unchanged; full standing only on the account screen
  AssetLoader.js    loads every manifest image (16 at a time, 2 retries); refuses to start and lists missing files
  Renderer.js       1920x1080 letterboxed canvas; drawFrame(tint, flash, aura); parallax layers
  Camera.js         follow + look-ahead + bias toward boss (level `camera` config); centres narrow arenas
  Particles.js      pooled fire (orange or green), sparks, ice, embers, dust, debris; Snow
src/game/
  Player.js         states move/attack/recover/special/dodge/brace/shoot/reload/hurt/grabbed/thrown/dead/fp;
                    carried `loadout` + switching; stamina (if level rules.stamina); wind push;
                    Level 7: `ice` (Frostbrand energy, ward on S, precision dodges), `fp` (Frostpiercer)
  Frostpiercer.js   the L7 launcher: deploy/aim/charge/fire/reload, trajectory + weak-point prediction, drawing
  Saga.js           a level of sequential encounters (L7): explicit states, checkpoints, one-time boss rewards
  Duelist.js        Aegon (a swordsman in the boss slot): combos, delayed heavy, dash, guard/counter, parry rules
  Ending.js         "The North Remembers": pull-back to the fortress panorama, titles, voice, swell
  Weapon.js         weapon data + per-battle state (bolts, frost meter) + SPECIALS registry (K key)
  Dragon.js         SHARED boss state machine + tricks, armor/vulnerable, flight defense, punish,
                    armor SEGMENTS (head/chest/foreleg/wing/tail), phases (enterPhase: crack/expose/tricks),
                    combos, feint + chain cues, two lives (firstdeath -> resurrect -> second life);
                    PAIRS: `partner`, busy/free, takeFlank + leap, startPair (joint moves), queued, enrage;
                    L7: freeze, interruptAttack, weakMark (+ frostbrandHit), core (window / bared / finishOnly), stunNext
  DragonAttacks.js  ATTACK_TYPES by `kind`: melee breath strafe fireball sweep charge slam skyward dive grab debris
                    scorch gust mines tailsweep pulse platerain shadowhunt combo lastember skyreign rift guard
                    circling (Sunfyre's Sky Dance) bait (Sunfyre's lure) firestorm (Balerion's zones)
  Hazards.js        FrostNova EmberWave Fireball GroundShock ScorpionBolt FallingDebris
                    CrossbowBolt BurningGround EmberMine MoltenPlate WindDebris
                    AemondSpear RiftWave DawnfireBolt ChainHook FrostPatch (slippery sand)
                    FireZone IceSpear (Frostpiercer) IceWave (Frostbrand's Glacial Wave)
  Pickups.js        battlefield weapon / quiver caches (E to take; `hiddenBy` breakable cover)
  Level.js          layers, floor, cover (hp, playerHits, walkThrough), one-way platforms, decor
  LevelManager.js   explore -> arena -> won/lost; dialogue (Enter skips), phase banners, portcullis,
                    heat cracks, firelight, Last Ember darkness, Aemond finale.
                    `boss` or `bosses` (several): lm.dragons (lm.dragon = first), lm.bossCfg,
                    nearestDragon(x), dragonTouching(x, y, r); won when every dragon is down.
                    `stages` (L7): lm.saga, lm.cfg = the current stage's merged config, beginStage()
  Combat.js         all damage rules (segments, bolts, impale, ground strike, frost) + feedback
src/ui/             HUD.js (canvas: stamina, loadout, two-life boss bar + armor panel, twin bars), UI.js (DOM menus)
src/data/           ALL tuning: config.js levels.js enemies.js weapons.js (+ STYLES) progression.js
src/debug/          SmokeTest.js (scripted checks) + Bot.js (plays full boss fights)
tools/assetgen/     common.py warrior.py weapons.py dragon.py backgrounds.py wallbreaker.py dragonpit.py scorpion.py
                    kingswall.py (L7 Wall top + ending panorama) frostpiercer.py
tools/voice_lines.py  the game's voice lines: the two ending lines and "Dracarys!" (synthetic speech, processed)
tools/add_clip.py   cuts a moment from the owner's own file into an assets/media slot (ffmpeg)
tools/serve.py      the server: game files (allow-list) + /api/* (me signup login logout account save battle leaderboard feed live health)
tools/gameserver/   config.py (.env) db.py (SQLite | Postgres, ? placeholders; schema 2 + one-time migration) service.py (accounts, saves, battles, boards) live.py (SSE hub)
tools/test_server.py  server tests
```

Sprite notes:
- Warrior frames are 336x272 with the 256-unit rig offset by `ORIGIN`; pivot (152, 252).
- Style animations (`heavy`, `thrust`, `daggers`, `shoot`, `reload`) exist only for the weapons that use them (`animations[name].variants`).
- Vhagar sheets are rendered at `res` 1.25. `Dragon.pxScale = scale / res` is used for anchors and drawing, `scale` for base-unit distances.

## Game design (keep unless the owner approves a change)

- **Hero:** the warrior, styled after Jon Snow at the owner's request (black leathers, fur cloak, dark curls, beard). House Stark direwolf on banners, HUD, title.
- **Combat:**
  - A/D move, Space jump, J attack, Shift roll (i-frames 0.03–0.38 s), K special (hold K to charge heavy specials).
  - E: scorpion or pickup. S: brace. Q / 1–6: switch weapons. Enter: skip dialogue or cinematic. Esc: pause. M: sound.
  - Level 7: F deploys/stows the Frostpiercer (W/S aim, hold J to charge, release to fire; Shift, or Q / 1–6, puts it away at once and takes up a sword). With Frostbrand, S raises the ice ward and hold K is the Glacial Wave. In the duel, S blocks; S just before a blow lands is a perfect parry.
- **Fairness:**
  - Every attack has a visible telegraph and an escape; geometry never damages. In L5 the escapes must be near-perfect (two blows kill).
  - Vhagar recoveries are at least 0.5 s. Tests check every telegraph is at least 0.55 s at the fastest phase.
  - Follow-up chains show an eye-flare cue; feints show a white flare cue.
- **Bosses:**

| Lv | Boss | Signature |
|---|---|---|
| 1 | Varkhul | bite, breath, phase-2 strafe |
| 2 | Emberwing | fireball, flame sweep, charge into breakable cover |
| 3 | Meleys (rider) | armored/vulnerable, slam, flight defense, scorpions |
| 4 | Rhagal | fearless; inferno, punish bite, dive, tail flame, grab/throw, ash rain |
| 5 | **Vhagar** (ridden by **Aemond**) | 5 phases, 2 lives, 5 armor segments; see below |
| 6 | **Drogon + Viserion** | two at once from both sides, joint moves, ice fire; see below |
| 7 | **Sunfyre, Vermithor, Balerion, then Aegon** | one at a time atop the Wall; Frostbrand + Frostpiercer; see below |

- **Level 5 (The Wallbreaker), the hardest fight:**
  - **Two blows kill.** Every hit from Vhagar or Aemond takes 70% of max health (level `boss.hitFrac: 0.7`; `boss.lethal` still means one-hit kills). Burning ground only burns.
  - Tempo: a little slower since Oct 17 (move 165, phase speed 0.9–1.12, idle 0.8–1.2 s).
  - **Defences:** mashing (3 hits in 1.3 s) raises the **Wing Guard**, which blocks frontal blows and then buffets the front.
    A burst of damage sends Vhagar into the sky (**Sky Reign**). From Phase II, heavy pressure triggers **Molten Hide**: melee does 35% and burns the attacker.
  - **Sky Reign:** Aemond hurls 3–4 spears, each with a ring that locks before the throw, then a low swoop with his blade at chest height (brace or roll under).
    A scorpion bolt, Lightbreaker's Dawnfire or the flail hook brings Vhagar down, stunned with wings and head exposed.
  - **Earthsplitter:** a rift of stone spikes runs at you. Roll through it, jump it, stand on a rampart, or keep stone between you.
  - Two scorpions stand in the arena (E).
  - **First life:** 2200 HP, four phases (75/50/25%).
    - Attacks: bite (a miss exposes the head), slam, charge (stopped by pillars, the wall, or a set spear), scorched breath, wingstorm, hunting dive, ember minefield, tail of ruin (high or low), infernal crossfire, dragonfall (a perfect roll exposes the head),
      gate hurl (Phase II: hurled gate stones, a ring each), cinder storm (Phase III: burning debris rain), seize (Phase III: grab and throw). The second life has all three too.
    - At 50% the wing and tail plates break and the others crack; chains and feints start.
  - **First death:** a skippable resurrection. The player earns a 35% "second wind".
  - **Second life:** a separate 1700 HP pool and new attacks.
    - Inferno pulse, molten armor rain (tears off a plate), shadow hunt (false shadows; the real one has burning eyes), triple cataclysm (a plate break ends it), Last Ember (4.5 s wind-up; break the glowing chest or shelter behind stone).
  - **Rewards:** first clear 400 gold / 350 XP plus the "The Wallbreaker Falls" achievement, recorded once; repeat 140 gold / 120 XP.
  - Rolls cost stamina in this level.
- **Level 6 (The Dragonpit),** the ruined pit of King's Landing (art `dragonpit.py`):
  - **Drogon** (1800 HP, black/red, leader) and **Viserion** (1500 HP, cream/gold, ice-blue fire) land on either side of the warrior. Level `damageMul` 1.35.
  - One strikes alone at a time; the other circles (or **leaps over** the warrior) to the far side. Viserion may add a fireball volley to Drogon's wind-up (`overlap`).
  - **Joint moves** (Drogon's `pairs`, banner shown): Pincer Charge (from both sides, a beat apart: roll under each), Twin Bite (jaws close together: one perfect roll),
    Dragon Dance (alternating dives), Fire and Ice (low flame wave + ice fire).
  - Viserion: frost breath leaves **frozen sand** (FrostPatch: little grip for a moment); Wing Roost in the sky (scorpion bolt brings him down).
  - When one dies the other **enrages** (speed x1.25). Won only when both are down. Low rubble and the fallen column block ground fire; you walk past them.
  - Rewards: first clear 500 gold / 450 XP plus "Lord of the Dragonpit"; repeat 170 gold / 150 XP.
- **Level 7 (The Three Calamities),** the top of the Frozen Wall in a storm (art `kingswall.py`). Owner-approved design (Oct 17).
  - Sequence (Saga states): intro, grant (Frostbrand + Frostpiercer cards), then for each boss travel -> fight -> victory (reward once, saved, gate rises),
    Aegon's introduction, the duel, his defeat (kneel), the ceremony, completion. Only one boss exists at a time.
  - A death restarts the current encounter (checkpoint before its arena); cleared bosses stay cleared and never pay twice. Reload resumes there.
  - All Level 7 cover (ice pillars, timber barricades) is `walkThrough`: the warrior passes in front, but it still stops fire and charges and shelters from the Black Dread.
  - **Frostbrand** (granted, never sold; fireRes 5%): fast frost blade. Ice energy (start 50, max 100): +18 precision dodge, +14 weak point, +2 hit.
    S raises the **ice ward** (25 energy, up to 1.4 s): it blocks fire for that time; if it blocked, 15 s cooldown (else 1.5 s).
    Hold K: **Glacial Wave** (35 energy). Only Frostbrand breaks a marked dive, freezes a marked weak point, or bares a core.
  - **Frostpiercer** (`FROSTPIERCER` in weapons.js): 4 spears per encounter, reload 2.4 s, charge 1.2 s. Any hit: icy blast, a melee window.
    Weak point (head, marked point, bared core): x2 and frozen. Full charge in an `interruptible` wind-up breaks it; full + weak in a `major` attack breaks it.
    Knocks Sunfyre out of the sky. A full spear on the bared core: x3 and the next attack never comes. Disabled in the duel.
  - **Sunfyre** (1500): Sky Dance (circles at varying heights, curved golden arcs with locking rings, 1–2 feint dives with a white eye flare, then a red marked dive;
    a Frostbrand blow in its last 0.45 s breaks it; a miss crashes it vulnerable), bait (retreats; approach and the wings lash out), golden breath, sweep, dive.
  - **Vermithor** (2000): stomp (shockwaves, then a marked foreleg for 2.8 s: Frostbrand freezes it), charge (smashes timber barricades), wide fire sweep,
    Bronze Inferno (1.9 s wind-up, interruptible), rage at 50% (ember mines + stomp combo).
  - **Balerion** (2600, the hardest): slam, scorch, shadow dive; at 65% firestorm zones, the delayed dive + tail combo, the reversal breath (turns on a roll-through);
    at 30% cataclysm combo and the Black Dread (3 s wind-up, lethal in the open: ice ward or an ice pillar). From Phase III the core glows after slam, dive
    and Black Dread; a Frostbrand strike bares it for 4.5 s; HP never goes below 1 except by a blow to the bared core.
  - **Aegon** (1400, the duel): combos (2–3 cuts, glint before each), delayed heavy (breaks a block), whiff-punishing dash, guard stance (struck: parry + counter;
    the Glacial Wave breaks it). Block = 30% chip (heavy 60%); perfect parry (S within 0.22 s) staggers him. At 30% Blackfyre burns (faster, fire, the ward stops a blow).
  - Rewards: Sunfyre 250 g / 220 XP, Vermithor 300 / 260, Balerion 450 / 400, Aegon 500 / 450 (each once ever); the level 300 / 300 first, 150 / 120 repeat;
    achievement "The King in the North" once.
  - Ending: snow, the warrior with Frostbrand facing the kneeling king, pull-back to the frozen fortress (dragon silhouettes on the snow), fade,
    THE NORTH REMEMBERS (voice; the anthem `north` begins: brass + choir, war drums, music raised), THE KING IN THE NORTH (war horn, swell, the chant),
    then the completion screen (bosses, gold, XP, weapons, time, deaths; Continue / Replay).
  - Optional film clips (the owner's own copies, never downloaded or shipped by the game): `assets/media/north_remembers.mp4` plays after the fade,
    before the first title; `king_in_the_north.mp4` before the second. The timeline (`timeline()` in Ending.js) stretches to their length;
    an audio-only file replaces the voice line; no file = the synthesized voice. Mute covers them.
- **Weapons:**

| id | Where | Price | Dmg | Notes |
|---|---|---|---|---|
| steel_sword | start | 0 | 10 | rising_slash |
| northern_longsword | player Lv 3 | 250 | 19 | long_sweep |
| greatsword (Heavy Greatsword) | player **Lv 5** | **600** | **36** | heavy style, armor break 24, charged Armor-Breaking Smash |
| frostblade | clear L3 | 450 | 13.5 | frost_nova |
| lightbreaker | clear L3 | 350 | 16 | **Dawnfire**, twice per battle: the blade ignites, and a crescent of fire burns through armor, sets the dragon alight and knocks a flyer down |
| dragonbane | clear L6 | 900 | 23 | bane_strike; so it can be carried into L7. A joke "Buy · $1" button opens an Iron Bank note: no payment exists |
| frostbrand | granted in L7 | — | 15 | frost; ice ward (S), Glacial Wave (K); the Level 7 vulnerability mechanics |
| war_hammer | L5 cache (collapsed pillar) | — | 29 | huge armor break (forelegs), charged Ground Strike |
| twin_daggers | L5 fallen scout (before the gate) | — | 5.5 | fast; strong only on exposed flesh; Flurry |
| long_spear | L5 gate winch | — | 15 | reach; chest/wing bonus; head thrust breaks a charge; Set the Spear impales |
| hunters_crossbow | L5 high rampart (+6-bolt quiver on the low one) | — | 20 | 6 bolts, reload 1.15 s, hits airborne, Pinning Bolt |
| frostbound_axe | L5 hidden in breakable ice | — | 19 | frost meter -> Frost Strike (slow + delay; the dragon resists for 12 s) |
| gatechain_flail | L5 by the broken chains (x 6210) | — | 16 | long reach; Hook and Haul (3 throws): pulls a flyer down or tears a plate loose |

  Battlefield weapons (`field: true`) are never sold and last one battle.
- **Progression:** `xpToNext = 100 * level^1.25`. First clears pay L1 100 g, L2 150, L3 200, L4 250, L5 400 gold.
- **Online (owner request, Oct 17):**
  - Sign-up: name 3–16 characters (unique, any case), password at least 8 (scrypt hash). Session = HttpOnly SameSite=Strict cookie (30 days).
    Changes need a JSON body from the same origin. Rate limits on sign-up, sign-in and wrong passwords.
  - Every boss fight is a battle (`ProgressionManager.onBattle`): a level clear, a fall, and in L7 each boss plus the final clear.
    **No battle is stored** (owner request): each player row keeps totals (battles, wins, gold/XP won, points, flawless,
    win_score, cleared, total_best, last 12 battle ids for retries) plus its cloud save; `best_times` keeps one best time per level.
    The feed of recent battles lives in server memory only. Sessions are cached in memory; boards are top-50 SQL reads cached 15 s;
    a rank is one COUNT. Art: boot loads ~30 small images; the warrior's sheets load per carried weapon (`warrior:<weapon>` groups).
    Only signed-in players' battles go to the board. The server checks them (ranges, a clear lasts at least 10 s, a fall pays nothing, ids count once).
  - Boards: points (gold + XP won), gold won, speed (best clear per level; All = most levels, then lowest total), win probability
    (Wilson 95% lower bound of wins / battles, shown 0–100). Each battle is pushed live to every open game (the board and feed move; menus show a note).
  - Real credentials never live in the code: `.env` holds them (git-ignored). Scores are client-reported; fine for a fan game.
- **Balance target:**
  - The bot beats L1 with the Steel Sword, L2 and L3 with the Steel Sword plus 1 and 2 Strength upgrades, and L4 with Lightbreaker.
  - L5 is meant to be near-impossible: every attack has a tested escape, but a win needs a near-flawless run.
  - L6 is hard for a human (two dragons, 1.35x damage, joint moves); the bot reacts perfectly and wins most runs, even with the Steel Sword.
  - L7 at warrior level 10: the bot usually beats Sunfyre and Vermithor, sometimes Aegon, rarely Balerion (report-only).

## Conventions

- ES modules, `export class` per file, 2-space indent, single quotes, semicolons, camelCase; data tables UPPER_CASE.
- Keep tunables in `src/data/`. Extend through registries:
  - a new attack is an `ATTACK_TYPES` entry; a new special is a `SPECIALS` entry; a new weapon style is a `STYLES` entry plus `warrior.STYLE_ANIMS`;
  - a new level is a `LEVELS` entry plus a `BACKGROUND_SETS` entry; a new dragon is a `DRAGONS` entry plus an `enemies.js` def.
- Attack behaviour key is `kind`; damage type is `type`.
- Patch scripts: the Bash tool breaks on heredocs containing apostrophes. Write the script with the Write tool and run `python -I script.py`.

## Rules for future sessions

1. Read the relevant files before editing; reuse existing systems; no rewrites, duplicate systems or new dependencies without a reason.
2. After gameplay changes, run `?smoke` and keep it passing. Add checks for new mechanics and bot handling for new attacks.
3. Never ship placeholder art or silently substitute missing assets.
4. Keep the agreed story, characters, combat, progression, level structure and visual direction unless the owner approves a change.
5. The owner wants short replies (context is precious) and top-quality visuals.
6. IP note: Jon Snow styling, House Stark, Meleys, Rhagal, Vhagar and Aemond Targaryen are fan references, fine for personal use only.
7. The visuals are stylised 2D vector art. Photoreal 3D (like Unreal screenshots) would need a different engine and real 3D models.

## Next priorities

- Level 8+ (none planned yet).
- Optional: recorded audio (a voice actor for the ending, orchestral music) to replace the synthesized sound.
- `README.md` refresh (optional).
- Online: hosting it (owner's step, see `HOSTING.md`).

## Deploy (Oct 17)

- Git repo (branch main). `.env`, `data/`, own clips are ignored. Dockerfile + render.yaml (Render, Docker, Ohio next to Neon us-east-2).
- `.env` holds the owner's Neon DATABASE_URL (tables created). NEVER run `tools/test_server.py` with DS_TEST_DATABASE_URL pointing at Neon (it drops tables).
- Art loads per level (AssetLoader groups, `levelArt`/`deferredArt` in LevelManager.js, Game.loadLevelArt/prefetch): boot 14 MB instead of 178 MB. ?smoke/?lab load everything.
- Server: no-cache + Last-Modified, gzip text, CSP/HSTS, DS_LOG=quiet, SIGTERM, shallow /api/health (?deep=1 hits DB), Neon connect retries.
- GitHub: https://github.com/Kabil081/Dragon-Slayer (public). `assets/sprites/*/frames/` is git-ignored (build leftovers). Pushes over this PC's
  connection fail above ~30 MB: commit art in small batches. With `PORT` set the server defaults to 0.0.0.0, trusted proxy, quiet logs.
- Live: https://dragon-slayer-k4js.onrender.com (Render, Python service, start `python tools/serve.py`, DATABASE_URL = Neon).
- Not yet verified: `docker build` (Docker Desktop would not start here).
