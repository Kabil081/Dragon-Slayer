// Automated playtest. Open index.html?smoke to run it. It drives the real
// game at a fixed 60 fps with simulated key presses, uses its own save
// slot, and prints PASS/FAIL for each check. Run it after adding a level
// or changing combat numbers.

import { CUES, THEMES } from '../core/Audio.js';
import { Online, OnlineError } from '../core/Online.js';
import { SaveManager } from '../core/SaveManager.js';
import { bossKey, ProgressionManager } from '../game/ProgressionManager.js';
import { Bot } from './Bot.js';
import { getLevel, LEVELS } from '../data/levels.js';
import { FrostPatch } from '../game/Hazards.js';
import { timeline } from '../game/Ending.js';
import { ENEMIES } from '../data/enemies.js';
import { WEAPONS } from '../data/weapons.js';
import { Weapon } from '../game/Weapon.js';

const DT = 1 / 60;

export async function runSmokeTests(game) {
  const results = [];
  const key = (code, down) => window.dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', { code }));
  const tick = (n = 1) => { for (let i = 0; i < n; i++) game.step(DT); };
  const press = (code, frames = 2) => { key(code, true); tick(frames); key(code, false); };
  const hold = (code, frames) => { key(code, true); tick(frames); key(code, false); };
  const until = (fn, maxFrames) => { for (let i = 0; i < maxFrames; i++) { if (fn()) return true; tick(1); } return fn(); };
  const check = (name, pass, detail = '') => results.push({ name, pass: !!pass, detail });
  const lm = game.levels;
  const fresh = () => { game.input.clear(); game.startLevel(1); };
  const toArena = () => {
    fresh();
    lm.player.x = lm.cfg.arena.triggerX - 30;
    hold('KeyD', 12);
    until(() => lm.dragon.state === 'idle', 60 * 6);
  };
  const isolate = d => { for (const id in d.cooldowns) d.cooldowns[id] = 999; d.idleFor = 999; d.tricks = null; };

  game.progression.newGame();
  const T7 = { game, lm, check, tick, press, hold, key, until, isolate };

  // Plays a whole boss fight with the scripted bot. Returns the outcome.
  const botFight = (levelId, maxSeconds, botOpts = null) => {
    game.input.clear();
    game.startLevel(levelId);
    const bot = new Bot(game, botOpts || {});
    lm.player.x = botOpts && botOpts.from ? botOpts.from : lm.cfg.arena.triggerX - 30;
    let t = 0;
    const used = {};
    let last = null;
    let offscreen = 0;
    // a dragon with a second life is only beaten when that life ends too; two dragons, when both fall
    const allDown = () => lm.dragons.every(dr => !dr.alive && !dr.inCutscene && !dr.def.secondLife);
    while (t < maxSeconds && game.mode === 'playing') {
      if (lm.phase === 'explore' && !botOpts) bot.move(1);
      else bot.step(DT);
      tick(1);
      t += DT;
      const d = lm.dragon;
      if (lm.phase === 'arena' && d.active && d.alive && !lm.cutscene && d.state !== 'intro') {
        const cam = game.camera, body = d.hurtboxes()[1].rect, ph = lm.player.hurtbox;
        const out = r => r.x + r.w < cam.x || r.x > cam.x + 1920 || r.y + r.h < 0 || r.y > 1080;
        if (out(body) || out(ph)) offscreen++;
      }
      lm.dragons.forEach((dr, i) => {
        const tag = dr.state === 'telegraph' || dr.inCustom ? dr.attackId : null;
        if (tag && tag !== (last && last[i])) used[tag] = (used[tag] || 0) + 1;
        (last = last || [])[i] = tag;
      });
      if (allDown() || !lm.player.alive) break;
    }
    bot.release();
    const won = allDown() && lm.player.alive;
    if (won) until(() => game.mode === 'results', 60 * 12);
    return { won, result: won ? lm.result : null, time: t, hp: Math.round(lm.player.hp),
             maxHp: lm.player.maxHp, dragonHp: lm.dragons.map(dr => Math.round(dr.hp)).join('+'), stats: bot.stats,
             used: Object.entries(used).map(([k, v]) => `${k} x${v}`).join(', '), offscreen,
             lifeDamage: lm.dragon.lifeDamage ? lm.dragon.lifeDamage.slice() : null, lives: lm.dragon.life };
  };

  if (new URLSearchParams(location.search).get('smoke') === '7') {
    try { await level7Checks(T7); } catch (e) { console.error(e); check('Level 7 checks finished without errors', false, e.message); }
    game.saves.reset();
    return results;
  }
  if (new URLSearchParams(location.search).get('smoke') === 'sound') {
    try { await soundChecks(T7); } catch (e) { console.error(e); check('Sound checks finished without errors', false, e.message); }
    game.saves.reset();
    return results;
  }
  if (new URLSearchParams(location.search).get('smoke') === 'online') {
    try { await onlineChecks(T7); } catch (e) { console.error(e); check('Online checks finished without errors', false, e.message); }
    game.saves.reset();
    return results;
  }
  try {
    check('Level 2 is locked before Level 1 is cleared', !game.progression.isLevelUnlocked(2));
    check('Level 3 is locked before Level 2 is cleared', !game.progression.isLevelUnlocked(3));

    // ---- movement
    fresh();
    let p = lm.player;
    const x0 = p.x;
    hold('KeyD', 48);
    check('Run right moves the warrior', p.x - x0 > 300 && p.anim.name === 'run', `moved ${Math.round(p.x - x0)}px`);
    tick(30);
    check('Warrior decelerates to idle', Math.abs(p.vx) < 1 && p.anim.name === 'idle');
    key('Space', true); tick(6);
    const left = !p.onGround && p.vy < 0;
    tick(24); key('Space', false);
    const apex = p.y;
    until(() => p.onGround, 120);
    check('Jump leaves the ground and lands', left && p.onGround && apex < lm.level.floorY - 150,
          `apex ${Math.round(lm.level.floorY - apex)}px`);

    // ---- attack hitbox
    press('KeyJ');
    let sawBox = false;
    until(() => { if (p.lastSwingBox) sawBox = true; return p.state !== 'attack'; }, 90);
    check('Attack produces a weapon hitbox from blade anchors', sawBox);

    // ---- dodge
    press('ShiftLeft'); tick(8);
    check('Dodge roll grants i-frames', p.state === 'dodge' && p.invulnerable);
    until(() => p.state === 'move', 60);
    check('Dodge ends back in control', p.state === 'move' && !p.invulnerable);

    // ---- cover collision
    const crates = lm.level.solids[0];
    p.x = crates.x - 200; p.vx = 0;
    hold('KeyD', 70);
    check('Cover props block movement', p.x < crates.x, `stopped at ${Math.round(p.x)} (cover at ${Math.round(crates.x)})`);

    // ---- arena + intro
    toArena();
    let d = lm.dragon;
    check('Arena locks the camera and the dragon lands', lm.phase === 'arena' && game.camera.minX === lm.cfg.arena.start &&
          d.state === 'idle' && d.y === d.floorY);

    // ---- fire breath: telegraph, damage in the open, cover protection
    isolate(d);
    p = lm.player;
    const block = lm.level.solids.find(s => s.x > lm.cfg.arena.start);
    d.x = 5200; d.facing = -1; p.x = 4620; p.iframes = 0;
    const hp0 = p.hp;
    d.beginAttack('fire_breath');
    const teleDur = d.telegraphDur;
    let hpAtActive = null;
    until(() => { if (d.state === 'active' && hpAtActive === null) hpAtActive = p.hp; return d.state === 'recovery'; }, 60 * 5);
    check('Fire breath telegraphs for a fair window', teleDur >= 0.8 && hpAtActive === hp0, `${teleDur.toFixed(2)}s warning`);
    check('Fire breath burns a player standing in it', p.hp < hp0, `${hp0} -> ${Math.round(p.hp)} hp`);

    toArena(); d = lm.dragon; p = lm.player; isolate(d);
    d.x = 5200; d.facing = -1; p.x = block.x - 60;
    const hpCover = p.hp;
    d.beginAttack('fire_breath');
    until(() => d.state === 'recovery', 60 * 5);
    check('Stone cover blocks the fire', p.hp === hpCover, `hp ${Math.round(p.hp)}`);

    // ---- bite: hits in range, dodge avoids it
    toArena(); d = lm.dragon; p = lm.player; isolate(d);
    d.x = 5000; d.facing = -1; p.x = 4700;
    const hpBite = p.hp;
    d.beginAttack('bite');
    until(() => d.state === 'recovery', 60 * 3);
    check('Bite hits a player in front of the jaws', p.hp < hpBite, `${hpBite} -> ${Math.round(p.hp)} hp`);

    toArena(); d = lm.dragon; p = lm.player; isolate(d);
    d.x = 5000; d.facing = -1; p.x = 4700;
    const hpDodge = p.hp;
    d.beginAttack('bite');
    until(() => d.state === 'telegraph' && d.t >= d.telegraphDur - 0.1, 60 * 2);
    press('ShiftLeft');
    until(() => d.state === 'recovery', 60 * 3);
    check('Rolling at the end of the telegraph avoids the bite', p.hp === hpDodge, `hp ${Math.round(p.hp)}`);

    // ---- player damages the dragon, weak point, stagger
    toArena(); d = lm.dragon; p = lm.player; isolate(d);
    d.x = 4900; d.facing = -1; p.x = 4560; p.facing = 1;
    const dhp = d.hp;
    press('KeyJ');
    until(() => p.state === 'move', 90);
    check('Sword strike damages the dragon', d.hp < dhp, `${dhp} -> ${d.hp}`);
    d.poiseDmg = d.def.poise - 1;
    press('KeyJ');
    until(() => d.state === 'stagger' || p.state === 'move', 90);
    check('Poise damage staggers the dragon', d.state === 'stagger');
    until(() => d.state === 'idle', 60 * 4);
    check('Dragon recovers from stagger', d.state === 'idle');

    // ---- phase two: roar into flame strafe, which completes and lands
    d.hp = Math.floor(d.maxHp * 0.52);
    d.takeDamage(40, 'physical', 0);
    check('Crossing 50% hp enters phase two', d.phase === 1 && d.pendingRoar);
    d.idleFor = 0;
    const seen = new Set();
    until(() => { seen.add(d.state + (d.strafe ? ':' + d.strafe.sub : '')); return d.state === 'recovery'; }, 60 * 12);
    check('Phase two roar leads to a full flame strafe',
          ['roar', 'strafe:takeoff', 'strafe:warn', 'strafe:pass', 'strafe:land', 'recovery'].every(s => seen.has(s)),
          [...seen].join(' > '));
    check('Dragon lands back on the floor', d.y === d.floorY);

    // ---- dragon death, rewards and saving
    const goldBefore = game.progression.data.gold;
    const xpLevel = game.progression.data.level;
    d.takeDamage(d.hp + 100, 'physical', 0);
    until(() => game.mode === 'results', 60 * 12);
    check('Killing the dragon shows the victory screen', game.mode === 'results' && game.ui.screen === 'victory');
    const r = lm.result;
    check('Victory grants gold and XP', r && game.progression.data.gold > goldBefore && r.xp > 0,
          r ? `+${r.gold} gold, +${r.xp} xp, level ${xpLevel} -> ${game.progression.data.level}` : 'no result');
    const reloaded = new ProgressionManager(new SaveManager(game.saves.key));
    check('Progress is saved to localStorage', reloaded.data.gold === game.progression.data.gold &&
          reloaded.isLevelCleared(1), `saved gold ${reloaded.data.gold}`);
    // ---- shop: the longsword is a player-level milestone, not a stage reward
    game.progression.data.gold = Math.max(game.progression.data.gold, 400);
    const goldBeforeBuy = game.progression.data.gold;
    const early = game.shop.buyWeapon('northern_longsword');
    check('Northern Longsword stays locked below player level 3, and no gold is taken',
          !early.ok && game.progression.lockReason('northern_longsword') === 'Reach level 3' &&
          game.progression.data.gold === goldBeforeBuy, early.reason);
    const up = game.shop.buyUpgrade('vitality');
    check('Upgrades raise stats', up.ok || game.progression.data.gold < 150);

    // ---- restart uses the new gear, defeat flow
    game.restart();
    p = lm.player;
    check('Restart rebuilds the level with the equipped weapon', p.weapon.id === game.progression.data.equipped &&
          lm.dragon.state === 'dormant' && p.hp === p.maxHp);
    p.takeHit(p.hp + 50, p.x + 10, 300);
    until(() => game.mode === 'results', 60 * 8);
    check('Death shows the defeat screen', game.ui.screen === 'defeat');
    game.restart();
    check('Retry after defeat starts a fresh attempt', game.mode === 'playing' && lm.player.alive && lm.player.hp === lm.player.maxHp);

    // ================================================================ Level 2
    // Steel Sword, player level 2, no upgrades: the state right after Level 1.
    game.progression.data.upgrades = { vitality: 0, strength: 0, fireward: 0 };
    game.shop.equip('steel_sword');
    check('Level 2 unlocks after clearing Level 1', game.progression.isLevelUnlocked(2));
    const rw1 = getLevel(1).rewards, rw2 = getLevel(2).rewards;
    const best1 = k => Math.max(rw1.firstClear[k], rw1.repeat[k]) + (k === 'gold' ? rw1.noHitBonusGold || 0 : 0);
    check('Level 2 pays more than Level 1, first clear and repeats, even flawless',
          rw2.firstClear.gold > best1('gold') && rw2.firstClear.xp > best1('xp') &&
          rw2.repeat.gold > rw1.repeat.gold + (rw1.noHitBonusGold || 0) && rw2.repeat.xp > rw1.repeat.xp,
          `L1 ${rw1.firstClear.gold}g/${rw1.firstClear.xp}xp then ${rw1.repeat.gold}g/${rw1.repeat.xp}xp; ` +
          `L2 ${rw2.firstClear.gold}g/${rw2.firstClear.xp}xp then ${rw2.repeat.gold}g/${rw2.repeat.xp}xp`);
    check('Clearing Level 1 levels the warrior up once', game.progression.data.level === 2,
          `level ${game.progression.data.level}`);
    const toArena2 = () => {
      game.input.clear();
      game.startLevel(2);
      lm.player.x = lm.cfg.arena.triggerX - 30;
      hold('KeyD', 12);
      until(() => lm.dragon.state === 'idle', 60 * 6);
    };
    toArena2();
    d = lm.dragon; p = lm.player;
    check('Level 2 builds with Emberwing in the arena', lm.cfg.name === 'The Broken Battlements' &&
          d.def.name === 'Emberwing' && d.state === 'idle');
    const arenaW = lm.cfg.arena.end - lm.cfg.arena.start;
    const cam0 = game.camera.x;
    p.x = lm.cfg.arena.end - 300;
    tick(120);
    check('The Level 2 arena is wider than the screen and scrolls', arenaW > 1920 && game.camera.x - cam0 > 400,
          `${arenaW}px wide, camera moved ${Math.round(game.camera.x - cam0)}px`);
    const atk = Object.values(d.def.attacks);
    check('Every Emberwing attack has a readable telegraph and a recovery window',
          atk.every(a => a.telegraph >= 0.55 && a.recovery >= 0.75),
          atk.map(a => `${a.kind} ${a.telegraph}s/${a.recovery}s`).join(', '));

    // ---- fireball
    toArena2(); d = lm.dragon; p = lm.player; isolate(d);
    d.x = 7300; d.facing = -1; p.x = 6600;
    let hpF = p.hp;
    d.beginAttack('fireball');
    const fbTele = d.telegraphDur;
    let lockedBeforeRelease = false;
    until(() => {
      if (d.state === 'telegraph' && d.reticle && d.reticle.locked) lockedBeforeRelease = true;
      return d.state === 'recovery';
    }, 60 * 4);
    until(() => !game.hazards.list.length, 60 * 3);
    check('Fireball charges with a visible lock-on before release', fbTele >= 0.8 && lockedBeforeRelease,
          `${fbTele.toFixed(2)}s charge`);
    check('Fireball hits a player who stands still', p.hp < hpF, `${hpF} -> ${Math.round(p.hp)} hp`);

    toArena2(); d = lm.dragon; p = lm.player; isolate(d);
    d.x = 7300; d.facing = -1; p.x = 6600;
    hpF = p.hp;
    d.beginAttack('fireball');
    until(() => d.reticle && d.reticle.locked, 60 * 3);
    key('KeyA', true);
    until(() => d.state === 'recovery', 60 * 3);
    tick(30);
    key('KeyA', false);
    until(() => !game.hazards.list.length, 60 * 3);
    check('Moving after the lock-on dodges the fireball', p.hp === hpF, `hp ${Math.round(p.hp)}`);

    // ---- breakable cover
    toArena2(); d = lm.dragon; p = lm.player; isolate(d);
    const wall = lm.level.props.find(pr => pr.maxHp && pr.solid.x > lm.cfg.arena.start && pr.solid.x < 6000);
    d.x = 6400; d.facing = -1; p.x = wall.solid.x - 70;
    const hpC = p.hp;
    d.beginAttack('fireball');
    until(() => d.state === 'recovery', 60 * 4);
    until(() => !game.hazards.list.length, 60 * 3);
    const crackedAfterOne = wall.hp === 1 && !wall.broken;
    d.enterIdle(999);
    d.beginAttack('fireball');
    until(() => d.state === 'recovery', 60 * 4);
    until(() => !game.hazards.list.length, 60 * 3);
    check('Broken stone cover blocks fireballs, cracks, then crumbles', crackedAfterOne && wall.broken &&
          p.hp === hpC && !lm.level.solids.includes(wall.solid), `hp ${Math.round(p.hp)}, wall hp ${wall.hp}`);

    // ---- flame sweep: hits on the ground; a platform or a jump avoids it
    toArena2(); d = lm.dragon; p = lm.player; isolate(d);
    d.x = 7050; d.facing = -1; p.x = 6000;
    const hpS = p.hp;
    d.beginAttack('flame_sweep');
    const swTele = d.telegraphDur;
    until(() => d.state === 'recovery', 60 * 4);
    check('Flame sweep hits a grounded player', p.hp < hpS && swTele >= 0.8, `${hpS} -> ${Math.round(p.hp)} hp`);

    toArena2(); d = lm.dragon; p = lm.player; isolate(d);
    const plat = lm.level.platforms.find(pl => pl.slab.x > lm.cfg.arena.start);
    d.x = 7300; d.facing = -1;
    p.x = plat.slab.x + plat.slab.w / 2; p.y = plat.slab.y; p.vy = 0;
    tick(2);
    const onPlat = p.onGround && p.y === plat.slab.y;
    const hpP = p.hp;
    d.beginAttack('flame_sweep');
    until(() => d.state === 'recovery', 60 * 4);
    check('Standing on a cracked platform avoids the sweep', onPlat && p.hp === hpP, `hp ${Math.round(p.hp)}`);

    toArena2(); d = lm.dragon; p = lm.player; isolate(d);
    d.x = 7050; d.facing = -1; p.x = 6000;
    const hpJ = p.hp;
    d.beginAttack('flame_sweep');
    until(() => d.state === 'active' && d.wave && (p.x - d.wave.front) * d.wave.dir < 160, 60 * 4);
    key('Space', true); tick(18); key('Space', false);
    until(() => d.state === 'recovery', 60 * 4);
    check('Jumping the flame wave avoids it', p.hp === hpJ, `hp ${Math.round(p.hp)}`);

    // ---- charge: hits, rolling through avoids it, crashing into cover stuns
    toArena2(); d = lm.dragon; p = lm.player; isolate(d);
    d.x = 7300; d.facing = -1; p.x = 6600;
    const hpK = p.hp;
    d.beginAttack('charge');
    const chTele = d.telegraphDur;
    until(() => d.state === 'recovery', 60 * 4);
    check('Charge hits a player in its path', p.hp < hpK && chTele >= 0.7, `${hpK} -> ${Math.round(p.hp)} hp`);

    toArena2(); d = lm.dragon; p = lm.player; isolate(d);
    d.x = 7300; d.facing = -1; p.x = 6400;
    const hpR = p.hp;
    d.beginAttack('charge');
    until(() => d.state === 'active' && (p.x - d.frameToWorld(d.anim.data.head).x) * d.facing < 300, 60 * 4);
    key('KeyD', true); press('ShiftLeft'); key('KeyD', false);
    until(() => d.state === 'recovery', 60 * 4);
    check('Rolling through the charge avoids it', p.hp === hpR, `hp ${Math.round(p.hp)}`);

    toArena2(); d = lm.dragon; p = lm.player; isolate(d);
    const wall2 = lm.level.props.find(pr => pr.maxHp && pr.solid.x > lm.cfg.arena.start && pr.solid.x < 6000);
    d.x = 6600; d.facing = -1; p.x = wall2.solid.x - 200;
    d.beginAttack('charge');
    until(() => d.state === 'recovery', 60 * 4);
    const recov = d.recoveryDuration();
    check('Charging into breakable cover shatters it and stuns the dragon', d.crashed && wall2.broken &&
          recov >= 1.8, `recovery ${recov.toFixed(2)}s`);

    // ---- full encounters with the bot (Steel Sword)
    // The dragons are unpredictable now, so fight three times and report the rate.
    // with weaker blades a warrior needs what Level 1's gold buys: one tier of Strength (80 gold)
    game.progression.data.upgrades.strength = Math.max(1, game.progression.data.upgrades.strength || 0);
    const runs = [botFight(2, 400), botFight(2, 400), botFight(2, 400)];
    const f2 = runs.find(r => r.won) || runs[0];
    const wins2 = runs.filter(r => r.won).length;
    check(`Emberwing is beatable with the Steel Sword and one Strength upgrade (bot won ${wins2}/3)`, wins2 >= 1,
          `${f2.time.toFixed(0)}s, ${f2.hp}/${f2.maxHp} hp left, dragon hp ${f2.dragonHp}, ` +
          `${f2.stats.dodges} rolls, ${f2.stats.jumps} jumps; attacks seen: ${f2.used}`);
    const r2 = f2.won ? f2.result : null;
    check('First Level 2 clear grants 150 gold and 130 XP', r2 && r2.first && r2.gold === 150 && r2.xp === 130,
          r2 ? `+${r2.gold} gold, +${r2.xp} xp` : 'no win to measure');
    toArena2();                      // a guaranteed clear for the repeat payout and the screen
    lm.dragon.takeDamage(99999, 'physical', 0);
    until(() => game.mode === 'results', 60 * 12);
    const r3 = lm.result;
    check('Repeat Level 2 clears pay reduced rewards', r3 && !r3.first && r3.gold < 150 && r3.xp < 130,
          r3 ? `+${r3.gold} gold, +${r3.xp} xp` : 'no result');
    check('Victory shows the reward summary and a Continue button', game.ui.screen === 'victory' &&
          !!game.ui.root.querySelector('.rewards') &&
          [...game.ui.root.querySelectorAll('button')].some(b => b.textContent.trim() === 'Continue'));
    // ================================================================ Level 3
    check('Level 3 unlocks after clearing Level 2', game.progression.isLevelUnlocked(3));
    game.progression.data.upgrades = { vitality: 0, strength: 0, fireward: 0 };
    game.shop.equip('steel_sword');
    const toArena3 = () => {
      game.input.clear();
      game.startLevel(3);
      lm.player.x = lm.cfg.arena.triggerX - 30;
      hold('KeyD', 12);
      until(() => lm.dragon.state === 'idle', 60 * 6);
    };
    toArena3(); d = lm.dragon; p = lm.player; isolate(d);
    check('Level 3 builds: Meleys at the Ice Gate with two scorpions', lm.cfg.name === 'The Ice Gate' &&
          d.def.name.startsWith('Meleys') && lm.scorpions.length === 2);
    const kinds = Object.values(d.def.attacks).map(a => a.kind);
    check('Meleys has a ground slam, a forward charge and a short-range bite',
          ['slam', 'charge', 'melee'].every(k => kinds.includes(k)) && d.def.attacks.bite.range[1] <= 450);

    // ---- armor and vulnerable damage
    const hit = () => { const h = d.hp; d.takeDamage(100, 'physical', 0); return h - d.hp; };
    d.armorT = 0; d.vulnT = 0; const normal = hit();
    d.armorT = 5; const armored = hit(); const armoredLook = d.lastHit === 'armor';
    d.armorT = 0; d.vulnT = 2; const vuln = hit(); const vulnLook = d.lastHit === 'vulnerable';
    d.vulnT = 0;
    check('Armored state cuts incoming damage; vulnerable state raises it',
          armored < normal * 0.5 && vuln > normal * 1.3 && armoredLook && vulnLook,
          `normal ${normal}, armored ${armored}, vulnerable ${vuln}`);

    // ---- slam: telegraph, impact, shockwaves, then vulnerable with armor broken
    toArena3(); d = lm.dragon; p = lm.player; isolate(d);
    d.x = 6600; d.facing = -1; d.armorT = 6;
    const slamX = d.x + d.facing * 250 * d.scale;
    p.x = slamX + 60;
    const hpSl = p.hp;
    d.beginAttack('slam');
    const slTele = d.telegraphDur;
    until(() => d.state === 'active', 60 * 3);
    tick(2);
    check('Ground slam has a long telegraph and crushes a player under it', slTele >= 1.1 && p.hp < hpSl,
          `${slTele.toFixed(2)}s wind-up, ${hpSl} -> ${Math.round(p.hp)} hp`);
    check('After the slam Meleys is vulnerable and its armor is broken', d.vulnerable && !d.armored,
          `vulnerable ${d.vulnT.toFixed(1)}s`);

    toArena3(); d = lm.dragon; p = lm.player; isolate(d);
    lm.level.props = []; lm.level.refreshSolids();      // open ground for this check
    d.x = 6600; d.facing = -1;
    p.x = d.x + d.facing * 250 * d.scale - 640;
    const hpW = p.hp;
    d.beginAttack('slam');
    until(() => game.hazards.list.some(h => h.kind === 'shock' && (p.x - h.front) * h.dir > 0 &&
                                         (p.x - h.front) * h.dir < 150), 60 * 4);
    key('Space', true); tick(18); key('Space', false);
    until(() => d.state === 'recovery', 60 * 4);
    tick(40);
    check('Jumping the slam shockwave avoids it', p.hp === hpW, `hp ${Math.round(p.hp)}`);

    // ---- flight defense, then a scorpion bolt brings it down
    toArena3(); d = lm.dragon; p = lm.player; isolate(d);
    d.flyCd = 0; d.x = 6700;
    d.takeDamage(d.maxHp * 0.12, 'physical', 0);
    tick(70);
    const flew = d.attackId === 'sky_retreat' && d.y < d.floorY - 300 && !d.hittable;
    check('Burst damage makes Meleys take to the sky out of sword reach', flew,
          `altitude ${Math.round(d.floorY - d.y)}px`);
    const sc = lm.scorpions[0];
    p.x = sc.x; p.vx = 0; tick(2);
    const hpBefore = d.hp;
    press('KeyE');
    until(() => d.state === 'recovery' || !game.hazards.list.length && d.y >= d.floorY, 60 * 5);
    check('A scorpion bolt brings Meleys down, stunned and vulnerable', d.downed && d.vulnerable && d.hp < hpBefore,
          `hp ${hpBefore} -> ${d.hp}, vulnerable ${d.vulnT.toFixed(1)}s`);
    check('The scorpion has to reload after a shot', !sc.ready && sc.state === 'reload');

    toArena3(); d = lm.dragon; p = lm.player; isolate(d);
    d.x = 6200; d.armorT = 6;
    const sc2 = lm.scorpions[0];
    p.x = sc2.x; tick(2);
    press('KeyE');
    until(() => !d.armored || game.hazards.list.length === 0 && sc2.state === 'reload' && game.input.time > 0, 60 * 3);
    tick(30);
    check('A scorpion bolt shatters Meleys\' armor', !d.armored);

    // ---- weapon reach + purchase milestone
    const reachOf = wid => {
      game.progression.data.equipped = wid;
      toArena3(); d = lm.dragon; p = lm.player; isolate(d);
      d.x = 7300; p.x = 5600; p.facing = 1;
      press('KeyJ');
      let far = 0;
      until(() => { if (p.lastSwingBox) far = Math.max(far, p.lastSwingBox.x + p.lastSwingBox.w - p.x); return p.state !== 'attack'; }, 90);
      return far;
    };
    const steelReach = reachOf('steel_sword');
    game.progression.data.level = 3;
    game.progression.data.gold = 200;
    const poor = game.shop.buyWeapon('northern_longsword');
    const goldAfterFail = game.progression.data.gold;
    game.progression.data.gold = 300;
    const bought = game.shop.buyWeapon('northern_longsword');
    const goldAfterBuy = game.progression.data.gold;
    const saved = new ProgressionManager(new SaveManager(game.saves.key));
    check('At level 3 the longsword costs 250: refused without gold, then bought and saved at once',
          !poor.ok && goldAfterFail === 200 && bought.ok && goldAfterBuy === 50 &&
          saved.data.ownedWeapons.includes('northern_longsword') && saved.data.gold === 50,
          `${poor.reason}; gold 300 -> ${goldAfterBuy}`);
    game.shop.equip('northern_longsword');
    const gsLocked = game.shop.weapons().find(w => w.id === 'greatsword');
    const lvNow = game.progression.data.level;
    game.progression.data.level = Math.max(lvNow, 5);        // the Heavy Greatsword opens at player level 5
    const states = Object.fromEntries(game.shop.weapons().map(w => [w.id, w.status]));
    game.progression.data.level = lvNow;
    check('Armory shows locked, available, purchased and equipped states',
          states.northern_longsword === 'equipped' && states.steel_sword === 'purchased' &&
          Object.values(states).includes('locked') && states.greatsword === 'available',
          JSON.stringify(states));
    check('Heavy Greatsword: player level 5, 600 gold, 36 damage', gsLocked.lockReason === 'Reach level 5' &&
          gsLocked.price === 600 && gsLocked.def.damage === 36 && gsLocked.def.style === 'heavy');
    const longReach = reachOf('northern_longsword');
    check('Northern Longsword (19 damage) reaches farther than the Steel Sword',
          longReach > steelReach * 1.25 && game.shop.weapons().find(w => w.id === 'northern_longsword').def.damage === 19,
          `reach ${Math.round(steelReach)}px vs ${Math.round(longReach)}px`);
    p = lm.player;
    game.progression.data.equipped = 'steel_sword';
    game.progression.data.level = 2;

    // ---- full fight with the Steel Sword (the longsword is never required)
    game.progression.data.upgrades.strength = Math.max(2, game.progression.data.upgrades.strength || 0);  // Level 2's gold
    const runs3 = [botFight(3, 480), botFight(3, 480), botFight(3, 480)];
    const w3 = runs3.filter(r => r.won).length;
    const f3 = runs3.find(r => r.won) || runs3[0];
    check(`Meleys is beatable with the Steel Sword and two Strength upgrades (bot won ${w3}/3)`, w3 >= 1,
          `${f3.time.toFixed(0)}s, ${f3.hp}/${f3.maxHp} hp left, dragon hp ${f3.dragonHp}; attacks seen: ${f3.used}`);
    const r3c = f3.won ? f3.result : null;
    check('First Level 3 clear grants 200 gold and 170 XP', r3c && r3c.first && r3c.gold === 200 && r3c.xp === 170,
          r3c ? `+${r3c.gold} gold, +${r3c.xp} xp` : 'no win to measure');

    // ================================================================ Level 4
    if (!game.progression.isLevelCleared(3)) {
      toArena3(); lm.dragon.takeDamage(99999, 'physical', 0, { force: true });
      until(() => game.mode === 'results', 60 * 12);
    }
    check('Level 4 unlocks after clearing Level 3', game.progression.isLevelUnlocked(4));
    game.progression.data.equipped = 'steel_sword';
    const toArena4 = () => {
      game.input.clear();
      game.startLevel(4);
      lm.player.x = lm.cfg.arena.triggerX - 30;
      hold('KeyD', 12);
      until(() => lm.dragon.state === 'idle', 60 * 6);
    };
    toArena4(); d = lm.dragon; p = lm.player; isolate(d);
    const A4 = lm.cfg.arena, width4 = A4.end - A4.start;
    check('Level 4 arena is narrower than the screen and framed whole by the camera',
          width4 < 1920 && game.camera.x <= A4.start && game.camera.x + 1920 >= A4.end, `${width4}px wide`);
    d.takeDamage(50, 'physical', 1e9);
    check('Rhagal is fearless: no stagger and no vulnerable state', d.def.fearless && d.state !== 'stagger' && !d.vulnerable);

    // ---- edge collision: walls hold, the bridge never drops the player
    let lowest = 0;
    const watch = n => { for (let i = 0; i < n; i++) { tick(1); lowest = Math.max(lowest, p.y); } };
    p.x = A4.end - 140; key('KeyD', true); watch(50); key('Space', true); watch(30); key('Space', false); watch(30);
    key('KeyD', false);
    const rightOk = p.x <= A4.end - 50;
    p.x = A4.start + 140; key('KeyA', true); watch(50); key('Space', true); watch(30); key('Space', false); watch(30);
    key('KeyA', false);
    const leftOk = p.x >= A4.start + 50;
    check('Edge collision: the end tower and the fire barrier hold, and the player never falls through',
          rightOk && leftOk && lowest <= lm.level.floorY, `x range ok ${rightOk}/${leftOk}, lowest ${Math.round(lowest)}`);

    // ---- punishing lunge bite and dodge timing
    toArena4(); d = lm.dragon; p = lm.player; isolate(d);
    d.x = 5700; d.facing = -1; p.x = 5300;
    d.recent = [0, 0.2, 0.4].map(t => ({ t: d.clock - t, dmg: 10 }));
    tick(2);
    check('Three quick hits trigger the punishing lunge bite', d.attackId === 'lunge_bite' && d.state === 'telegraph');
    const hpL = p.hp;
    until(() => d.state === 'telegraph' && d.t >= d.telegraphDur - 0.08, 60);
    key('KeyA', true); press('ShiftLeft'); key('KeyA', false);
    until(() => d.state === 'recovery', 60 * 2);
    check('Rolling at the last moment avoids the lunge bite', p.hp === hpL, `hp ${Math.round(p.hp)}`);

    // ---- inferno: long horizontal breath; behind the dragon is safe
    toArena4(); d = lm.dragon; p = lm.player; isolate(d);
    d.x = 5800; d.facing = -1; p.x = 5150;
    const hpI = p.hp;
    d.beginAttack('inferno');
    const infTele = d.telegraphDur;
    until(() => d.state === 'recovery', 60 * 5);
    check('Inferno is a long, telegraphed horizontal breath that burns the bridge in front',
          infTele >= 1.3 && p.hp < hpI, `${infTele.toFixed(2)}s wind-up, ${hpI} -> ${Math.round(p.hp)} hp`);
    toArena4(); d = lm.dragon; p = lm.player; isolate(d);
    d.x = 5500; d.facing = -1; p.x = 5800;
    const hpB = p.hp;
    d.beginAttack('inferno');
    until(() => d.state === 'recovery', 60 * 5);
    check('Standing behind Rhagal escapes the inferno', p.hp === hpB, `hp ${Math.round(p.hp)}`);

    // ---- aerial dive with a marked landing zone
    toArena4(); d = lm.dragon; p = lm.player; isolate(d);
    p.x = 5300;
    const hpD = p.hp;
    d.beginAttack('dive');
    until(() => d.diveS && d.diveS.sub === 'lock', 60 * 3);
    const zone = d.diveS && d.diveS.zone;
    const visibleAlt = d.y > 0;
    until(() => d.state === 'recovery', 60 * 3);
    check('Aerial dive locks a landing zone on the player and lands on it', Math.abs(zone - 5300) < 40 && p.hp < hpD &&
          visibleAlt, `zone ${Math.round(zone)}, ${hpD} -> ${Math.round(p.hp)} hp`);
    toArena4(); d = lm.dragon; p = lm.player; isolate(d);
    p.x = 5300;
    const hpD2 = p.hp;
    d.beginAttack('dive');
    until(() => d.diveS && d.diveS.sub === 'lock', 60 * 3);
    key('KeyD', true); tick(40); key('KeyD', false);
    until(() => d.state === 'recovery', 60 * 3);
    check('Leaving the marked zone avoids the dive', p.hp === hpD2, `hp ${Math.round(p.hp)}`);

    // ---- jumping the tail flame
    toArena4(); d = lm.dragon; p = lm.player; isolate(d);
    d.x = 5900; d.facing = -1; p.x = 5000;
    const hpT = p.hp;
    d.beginAttack('tail_flame');
    until(() => d.state === 'active' && d.wave && (p.x - d.wave.front) * d.wave.dir < 160, 60 * 4);
    key('Space', true); tick(18); key('Space', false);
    until(() => d.state === 'recovery', 60 * 4);
    check('Jumping clears the tail flame', p.hp === hpT, `hp ${Math.round(p.hp)}`);

    // ---- grab and throw
    toArena4(); d = lm.dragon; p = lm.player; isolate(d);
    d.x = 5700; d.facing = -1; p.x = 5380;
    const hpG = p.hp;
    d.beginAttack('grab');
    let grabbed = false, thrown = false, lowestG = 0;
    until(() => {
      if (p.state === 'grabbed') grabbed = true;
      if (p.state === 'thrown') thrown = true;
      lowestG = Math.max(lowestG, p.y);
      return thrown && p.onGround && p.state !== 'thrown';
    }, 60 * 5);
    const inside = p.x >= A4.start + 50 && p.x <= A4.end - 50;
    check('Enraged grab: the player is seized, hurled, and lands safely inside the arena',
          grabbed && thrown && inside && lowestG <= lm.level.floorY && p.alive,
          `${hpG} -> ${Math.round(p.hp)} hp, landed at ${Math.round(p.x)}`);

    // ---- ash rain always leaves a gap
    toArena4(); d = lm.dragon; p = lm.player; isolate(d);
    p.x = 5400;
    d.beginAttack('ash_rain');
    until(() => d.state === 'active', 60 * 2);
    tick(2);
    const marks = game.hazards.list.filter(h => h.kind === 'debris').map(h => h.x);
    let gap = null;
    for (let x = p.x - 320; x <= p.x + 320; x += 10) {
      if (x > A4.start + 60 && x < A4.end - 60 && marks.every(m => Math.abs(x - m) > 130)) { gap = x; break; }
    }
    if (gap !== null) p.x = gap;
    const hpR4 = p.hp;
    until(() => !game.hazards.list.some(h => h.kind === 'debris'), 60 * 4);
    check('Ash rain marks every impact and leaves a safe gap next to the player', gap !== null && p.hp === hpR4,
          `${marks.length} impacts, gap at ${gap}`);

    // ---- Lightbreaker: kindled only twice per battle
    if (!game.progression.data.ownedWeapons.includes('lightbreaker')) game.progression.data.ownedWeapons.push('lightbreaker');
    game.shop.equip('lightbreaker');
    toArena4(); d = lm.dragon; p = lm.player; isolate(d);
    const startCharges = p.fireCharges;
    press('KeyK'); tick(100);
    p.beginSwing({});
    const fireSwing = p.swing.fire && p.swing.type === 'light' && p.swing.mul >= 1.59;
    p.swing = null;
    press('KeyK'); tick(100);
    const igniteLeft = p.ignited;
    press('KeyK'); tick(10);
    check('Lightbreaker takes fire only twice per battle (+60% damage that ignores fire resistance)',
          startCharges === 2 && fireSwing && p.fireCharges === 0 && Math.abs(p.ignited - (igniteLeft - 10 / 60)) < 0.05,
          `charges ${startCharges} -> ${p.fireCharges}`);
    game.restart();
    check('Restarting the battle restores both flames', lm.player.fireCharges === 2);

    // ---- complete victory flow
    toArena4();
    const goldV = game.progression.data.gold;
    lm.dragon.takeDamage(99999, 'physical', 0, { force: true });
    until(() => game.mode === 'results', 60 * 12);
    const r4 = lm.result;
    const cont = [...game.ui.root.querySelectorAll('button')].find(b => b.textContent.trim() === 'Continue');
    check('Victory: summary shows, first clear pays 250 gold and 200 XP', game.ui.screen === 'victory' &&
          r4 && r4.first && r4.gold === 250 && r4.xp === 200 && game.progression.data.gold === goldV + 250,
          r4 ? `+${r4.gold} gold, +${r4.xp} xp` : 'no result');
    if (cont) cont.click();
    check('Continue leads straight on to Level 5', game.mode === 'playing' && lm.cfg.id === 5);
    game.quitToMenu();

    // ---- full fights (the hardest dragon)
    game.progression.data.level = Math.max(game.progression.data.level, 3);
    const runs4 = [botFight(4, 420), botFight(4, 420), botFight(4, 420)];
    const w4 = runs4.filter(r => r.won).length;
    const f4 = runs4.find(r => r.won) || runs4[0];
    check(`Rhagal can be beaten with Lightbreaker (bot won ${w4}/3)`, w4 >= 1,
          `${f4.time.toFixed(0)}s, ${f4.hp}/${f4.maxHp} hp left, dragon hp ${f4.dragonHp}; attacks seen: ${f4.used}`);
    check('Both fighters stay on screen through every attack',
          runs4.every(r => r.offscreen === 0), `off-screen frames: ${runs4.map(r => r.offscreen).join('/')}`);
    game.shop.equip('steel_sword');
    const s4 = botFight(4, 420);
    check('Steel Sword vs Rhagal (reported only, not required)', true,
          `steel sword run: ${s4.won ? 'won' : 'lost'}, ${s4.time.toFixed(0)}s, dragon hp left ${s4.dragonHp}`);


    // ================================================================ Level 5
    if (!game.progression.isLevelCleared(4)) {
      toArena4(); lm.dragon.takeDamage(99999, 'physical', 0, { force: true });
      until(() => game.mode === 'results', 60 * 12);
    }
    check('Level 5 unlocks after clearing Level 4', game.progression.isLevelUnlocked(5));
    game.progression.data.level = Math.max(game.progression.data.level, 4);
    game.shop.equip('steel_sword');
    const toArena5 = () => {
      game.input.clear();
      game.startLevel(5);
      lm.player.x = lm.cfg.arena.triggerX - 30;
      hold('KeyD', 12);
      until(() => lm.dragon.state === 'idle' && !lm.cutscene, 60 * 9);
    };
    const toLife2 = () => {
      lm.dragon.takeDamage(1e7, 'physical', 0, { force: true });
      lm.dragon.skipResurrection();
      tick(2);
      isolate(lm.dragon);
    };
    const at = (dr, id5) => dr.frameToWorld(dr.anim.data[id5]);

    // ---- 1. health only through valid damage
    toArena5(); d = lm.dragon; p = lm.player; isolate(d);
    const hp5 = d.hp;
    p.x = d.x - 1500; p.facing = 1; press('KeyJ'); tick(60);
    const missed = d.hp === hp5;
    const y0 = d.y; d.y = d.floorY - 400;
    const airborne = d.takeDamage(100, 'physical', 0);
    d.y = y0;
    const fl = at(d, 'foreleg');
    p.x = fl.x + d.facing * 70; p.facing = -d.facing;
    press('KeyJ');
    until(() => d.hp < hp5, 60);
    check('Vhagar loses health only from real hits (a miss or an untouchable dragon takes nothing)',
          missed && airborne === 0 && d.hp < hp5, `${hp5} -> ${d.hp}`);

    // ---- 2. phases begin at their thresholds
    toArena5(); d = lm.dragon; p = lm.player; isolate(d);
    const setHp = f => d.takeDamage(d.hp - Math.round(d.maxHp * f), 'physical', 0, { force: true });
    setHp(0.76); const ph0 = d.phase;
    setHp(0.74); const ph1 = d.phase;
    setHp(0.49); const ph2 = d.phase;
    const sg = d.segments;
    const shattered = sg.wing.broken && sg.tail.broken && sg.head.hp <= Math.round(sg.head.max * 0.35) && !sg.chest.broken;
    setHp(0.24); const ph3 = d.phase;
    check('Phases begin at 75%, 50% and 25%; at 50% the wing and tail joints break open',
          ph0 === 0 && ph1 === 1 && ph2 === 2 && ph3 === 3 && shattered, `phases ${ph0}/${ph1}/${ph2}/${ph3}`);

    // ---- 3. every attack runs telegraph -> active -> recovery -> idle, with a cooldown
    const L1 = Object.keys(ENEMIES.vhagar.attacks);
    const L2 = Object.keys(ENEMIES.vhagar.secondLife.attacks).filter(id5 => !id5.startsWith('tc_'));
    const bad = [];
    for (const [life, ids] of [[1, L1], [2, L2]]) {
      for (const id5 of ids) {
        toArena5(); d = lm.dragon; p = lm.player; isolate(d);
        if (life === 2) { toLife2(); d = lm.dragon; }
        p.iframes = 1e9;
        p.x = d.x - d.facing * -900;
        d.beginAttack(id5, p);
        const cd = d.cooldowns[id5];
        const seen5 = new Set([d.state]);
        let minRec = Infinity;
        const ok = until(() => {
          seen5.add(d.state);
          if (d.state === 'recovery') minRec = Math.min(minRec, d.recoveryDuration());
          return d.state === 'idle' && seen5.size > 1;
        }, 60 * 16);
        const a5 = d.def.attacks[id5];
        const shaped = a5.kind === 'combo' || seen5.has('telegraph') || seen5.has(a5.kind);
        const stagger = seen5.has('stagger');
        if (!ok || !shaped || (!seen5.has('recovery') && !stagger) || !(cd > 0 || a5.weight === 0) ||
            (seen5.has('recovery') && minRec < d.def.minRecovery)) {
          bad.push(`${id5}[${[...seen5].join('>')}]`);
        }
      }
    }
    check('Every attack (both lives) follows its states, sets a cooldown and keeps the minimum recovery',
          bad.length === 0, bad.length ? bad.join(' ') : `${L1.length + L2.length} attacks`);

    // ---- 4. hitboxes hurt; a timed roll is invulnerable
    toArena5(); d = lm.dragon; p = lm.player; isolate(d);
    d.facing = -1; p.x = d.x - 420; p.facing = 1;
    let hpB5 = p.hp;
    d.beginAttack('bite', p);
    until(() => d.state === 'recovery', 60 * 3);
    const bitten = p.hp < hpB5;
    toArena5(); d = lm.dragon; p = lm.player; isolate(d);
    d.facing = -1; p.x = d.x - 420; p.facing = 1;
    hpB5 = p.hp;
    d.beginAttack('bite', p);
    until(() => d.state === 'telegraph' && d.telegraphDur - d.t < 0.08, 60 * 3);
    key('KeyD', true); press('ShiftLeft'); key('KeyD', false);
    until(() => d.state === 'recovery', 60 * 3);
    check('The bite hurts a standing warrior; a roll through it at the last moment is untouched',
          bitten && p.hp === hpB5, `rolled: ${hpB5} -> ${Math.round(p.hp)}`);
    check('A missed bite leaves the head exposed', d.isExposed('head'));

    // ---- 5. armor breaks only at its threshold
    toArena5(); d = lm.dragon; p = lm.player; isolate(d);
    const chest = d.segments.chest;
    const per = WEAPONS.steel_sword.armorBreak;
    const need = Math.ceil(chest.max / per);
    let early5 = false;
    for (let k = 1; k <= need; k++) {
      game.combat.applyToDragon(p, d, at(d, 'chest'), { segment: 'chest' });
      if (k < need && chest.broken) early5 = true;
    }
    check('A plate breaks exactly when its armor is spent', !early5 && chest.broken,
          `chest ${chest.max} armor / ${per} per sword hit = ${need} hits`);

    // ---- 6. pickups and switching
    toArena5(); d = lm.dragon; p = lm.player; isolate(d);
    const hammerCache = lm.pickups.find(q => q.weapon === 'war_hammer');
    p.x = hammerCache.x; tick(2);
    press('KeyE'); tick(20);
    const took = p.weapon.id === 'war_hammer' && p.loadout.length === 2 && hammerCache.taken;
    press('KeyQ'); tick(20);
    const backToSword = p.weapon.id === 'steel_sword';
    press('Digit2'); tick(20);
    const axeCache = lm.pickups.find(q => q.weapon === 'frostbound_axe');
    const hiddenFirst = !axeCache.visible;
    const ice = lm.level.prop('axe_ice');
    while (!ice.broken) lm.level.damageSolid(ice.solid, 1, game);
    check('Weapon caches: E takes the hammer, Q and 1-6 switch, the frozen axe appears when its ice breaks',
          took && backToSword && p.weapon.id === 'war_hammer' && hiddenFirst && axeCache.visible,
          p.loadout.map(w => w.id).join(', '));
    check('Battlefield weapons are never sold in the armory',
          game.shop.weapons().every(w => !WEAPONS[w.id].field));

    // ---- 7. weapon-specific damage and armor break
    toArena5(); d = lm.dragon; p = lm.player; isolate(d);
    const segHp = id5 => d.segments[id5].hp;
    const f0 = segHp('foreleg');
    d.armorHit('foreleg', WEAPONS.twin_daggers);
    const daggerBreak = f0 - segHp('foreleg');
    const f1h = segHp('foreleg');
    d.armorHit('foreleg', WEAPONS.war_hammer);
    const hammerBreak = f1h - segHp('foreleg');
    d.breakSegment('wing', { stagger: false });
    const dagExp = d.armorHit('wing', WEAPONS.twin_daggers).mul, swordExp = d.armorHit('wing', WEAPONS.steel_sword).mul;
    const spearChest = d.armorHit('chest', WEAPONS.long_spear).mul / WEAPONS.long_spear.armorPen;
    const daggerIntact = d.armorHit('head', WEAPONS.twin_daggers).mul;
    check('Weapons differ: the hammer breaks plate, daggers bite exposed flesh, the spear favours the chest',
          hammerBreak >= 40 * daggerBreak && dagExp > swordExp && spearChest > 1.7 && daggerIntact <= 0.12,
          `hammer ${hammerBreak} vs daggers ${daggerBreak} armor; exposed x${dagExp.toFixed(2)} vs x${swordExp.toFixed(2)}`);
    // the crossbow: finite bolts, a real bolt hits, the reload takes time
    p.addWeapon(new Weapon('hunters_crossbow'));
    const bow = p.weapon;
    p.x = d.x + d.facing * 900; p.facing = -d.facing;
    const hpX = d.hp, bolts0 = bow.bolts;
    tick(20);
    press('KeyJ');
    until(() => d.hp < hpX, 60 * 2);
    const shot = d.hp < hpX && bow.bolts === bolts0 - 1;
    until(() => p.state === 'move', 60 * 3);
    check('Hunter\'s Crossbow: a bolt strikes from range, ammunition is finite and must be reloaded',
          shot && bow.loaded && bow.def.ammo === 6, `bolts ${bolts0} -> ${bow.bolts}`);

    // ---- 8. the first death is not the end
    toArena5(); d = lm.dragon; p = lm.player; isolate(d);
    const gold5 = game.progression.data.gold;
    const hpLow = Math.round(p.maxHp * 0.3); p.hp = hpLow;
    d.takeDamage(1e7, 'physical', 0, { force: true });
    const fell = d.state === 'firstdeath' && lm.phase === 'arena' && !lm.result;
    tick(60 * 3);
    const stillArena = lm.phase === 'arena' && game.mode === 'playing' && d.inCutscene;
    until(() => d.life === 2 && d.state === 'idle', 60 * 9);
    check('The first death starts the resurrection, not the victory', fell && stillArena && d.life === 2 &&
          game.progression.data.gold === gold5, `state ${d.state}, life ${d.life}`);
    check('No second wind: the warrior enters the second life as he left the first', p.hp <= hpLow + 1);

    // ---- 9. the second life
    check('The second life has its own health pool and new attacks', d.maxHp === 1700 && d.hp === 1700 &&
          d.lifeDamage[0] === 2200 && ['inferno_pulse', 'armor_rain', 'shadow_hunt', 'triple_cataclysm', 'last_ember']
            .every(id5 => d.def.attacks[id5]) && !d.def.attacks.ember_minefield,
          `life damage ${d.lifeDamage.join(' / ')}`);
    toArena5(); d = lm.dragon; isolate(d);
    d.takeDamage(1e7, 'physical', 0, { force: true });
    tick(30);
    press('Enter'); tick(2);
    check('Enter skips the resurrection cinematic', d.life === 2 && !d.inCutscene);

    // ---- 10. the true final death pays out once
    isolate(d);
    const before5 = { gold: game.progression.data.gold, xp: game.progression.data.xp, lv: game.progression.data.level };
    d.takeDamage(1e7, 'physical', 0, { force: true });
    until(() => game.mode === 'results', 60 * 14);
    const r5 = lm.result;
    check('Final victory: 400 gold, 350 XP, first clear and the boss-clear banner', r5 && r5.first && r5.gold === 400 &&
          r5.xp === 350 && game.progression.data.gold === before5.gold + 400 && r5.achievement &&
          game.ui.screen === 'victory', r5 ? `+${r5.gold} gold, +${r5.xp} xp, ${r5.achievement && r5.achievement.name}` : '');
    check('Aemond is thrown from the saddle in the finale', !!lm.aemond && lm.aemond.landed);
    toArena5(); d = lm.dragon; isolate(d);
    toLife2(); d = lm.dragon;
    d.takeDamage(1e7, 'physical', 0, { force: true });
    until(() => game.mode === 'results', 60 * 14);
    const r5b = lm.result;
    check('A second clear pays the repeat reward and no second banner', r5b && !r5b.first && r5b.gold === 140 &&
          !r5b.achievement && game.progression.data.achievements.filter(x5 => x5 === 'wallbreaker').length === 1,
          r5b ? `+${r5b.gold} gold` : '');

    // ---- 12. losing and retrying
    toArena5(); d = lm.dragon; p = lm.player; isolate(d);
    p.addWeapon(new Weapon('war_hammer'));
    d.takeDamage(500, 'physical', 0, { force: true });
    const goldL = game.progression.data.gold;
    p.hp = 1;
    game.combat.hitPlayer(50, 'physical', d.x, 600);
    until(() => game.mode === 'results', 60 * 6);
    const lostOk = lm.phase === 'lost' && game.ui.screen === 'defeat';
    game.restart();
    tick(2);
    check('Defeat, then retry: a fresh dragon, no carried weapons, no reward', lostOk && lm.dragon.life === 1 &&
          lm.dragon.hp === lm.dragon.maxHp && lm.player.loadout.length === 1 && game.progression.data.gold === goldL &&
          lm.pickups.every(q => !q.taken));

    // ---- 13. readable telegraphs and a way out of each attack
    const allA = { ...ENEMIES.vhagar.attacks, ...ENEMIES.vhagar.secondLife.attacks };
    const fastest = Math.max(...ENEMIES.vhagar.phases.map(q => q.speedMul), ...ENEMIES.vhagar.secondLife.phases.map(q => q.speedMul));
    // (the Wing Guard is a block, not a blow: its buffet has its own 0.6 s flare)
    const quick = Object.entries(allA).filter(([, a]) => a.kind !== 'guard' && a.telegraph > 0 &&
                                              a.telegraph / Math.sqrt(fastest) < 0.55).map(([id5]) => id5);
    check('Every telegraphed attack winds up for at least 0.55 s, even at the fastest phase', quick.length === 0,
          quick.join(', '));
    const escapes = [];
    const tryIt = (name, setup, act) => {
      toArena5(); d = lm.dragon; p = lm.player; isolate(d);
      setup();
      const hp = p.hp;
      act();
      escapes.push(`${name}${p.hp === hp ? '' : ' FAILED (-' + Math.round(hp - p.hp) + ')'}`);
      return p.hp === hp;
    };
    const ex = [];
    ex.push(tryIt('scorch: behind the dragon', () => { d.facing = -1; p.x = d.x + 420; },
                  () => { d.beginAttack('scorched_breath', p); until(() => d.state === 'idle', 60 * 6); tick(60 * 3); }));
    let unbracedPush = 0;
    tryIt('wingstorm: unbraced (reference)', () => { d.x = 5300; d.facing = -1; p.x = 4950; }, () => {
      p.iframes = 1e9; const x05 = p.x; d.beginAttack('wingstorm', p);
      until(() => d.state === 'recovery', 60 * 4); unbracedPush = Math.abs(p.x - x05); p.iframes = 0;
    });
    escapes.pop();
    ex.push(tryIt('wingstorm: brace', () => { d.x = 5300; d.facing = -1; p.x = 4950; },
                  () => {
                    d.beginAttack('wingstorm', p); key('KeyS', true);
                    const x05 = p.x; until(() => d.state === 'recovery', 60 * 4); key('KeyS', false);
                    if (Math.abs(p.x - x05) > Math.max(120, unbracedPush * 0.35)) p.hp -= 1;   // braced: barely moved
                  }));
    ex.push(tryIt('tail (low): jump', () => { d.facing = 1; p.x = d.x - 400; },
                  () => {
                    d.beginAttack('tail_ruin', p); d.tailHigh = false; d.tailAnim = 'tail_low';
                    until(() => d.telegraphDur - d.t < 0.18, 60 * 2); key('Space', true); tick(20); key('Space', false);
                    until(() => d.state === 'recovery', 60 * 2);
                  }));
    ex.push(tryIt('tail (high): brace under it', () => { d.facing = 1; p.x = d.x - 400; },
                  () => {
                    d.beginAttack('tail_ruin', p); d.tailHigh = true; d.tailAnim = 'tail_high';
                    key('KeyS', true); until(() => d.state === 'recovery', 60 * 3); key('KeyS', false);
                  }));
    ex.push(tryIt('minefield: a gap is left', () => { p.x = d.x - 600; },
                  () => {
                    d.beginAttack('ember_minefield', p);
                    until(() => d.state === 'active', 60 * 3); tick(2);
                    const ms = game.hazards.list.filter(h => h.kind === 'mine').map(h => h.x);
                    let gap5 = null;
                    const clearOf = x5 => !lm.level.solids.some(s => !(s.prop && s.prop.walkThrough) && x5 > s.x - 50 && x5 < s.x + s.w + 50);
                    for (let x5 = p.x - 360; x5 <= p.x + 360 && gap5 === null; x5 += 10) {
                      if (x5 > lm.cfg.arena.start + 60 && x5 < lm.cfg.arena.end - 60 && clearOf(x5) && ms.every(m => Math.abs(x5 - m) > 130)) gap5 = x5;
                    }
                    if (gap5 === null) p.hp -= 1; else p.x = gap5;
                    until(() => !game.hazards.list.some(h => h.kind === 'mine'), 60 * 4);
                  }));
    ex.push(tryIt('hunting dive: leave the shadow', () => { d.x = 5300; p.x = 5000; },
                  () => {
                    d.beginAttack('hunting_dive', p);
                    until(() => d.diveS && d.diveS.sub === 'lock', 60 * 4);
                    const dir = p.x > d.diveS.zone ? 1 : -1;
                    key(dir > 0 ? 'KeyD' : 'KeyA', true); tick(45); key(dir > 0 ? 'KeyD' : 'KeyA', false);
                    // hop the landing shockwave
                    until(() => !d.diveS || (d.diveS.sub === 'dive' && d.diveS.t > d.attack.diveTime - 0.06), 60 * 2);
                    key('Space', true); tick(20); key('Space', false);
                    until(() => d.state === 'idle', 60 * 4);
                  }));
    ex.push(tryIt('charge: a set spear impales it', () => {
      p.addWeapon(new Weapon('long_spear')); d.x = 5850; d.facing = -1; p.x = 5150; p.facing = 1;
    }, () => {
      d.beginAttack('charge', p);
      until(() => d.state === 'active', 60 * 2);
      press('KeyK');
      until(() => d.state === 'recovery', 60 * 2);
      if (!d.crashed) p.hp -= 1;
    }));
    const lifeTwo = [];
    const tryIt2 = (name, setup, act) => {
      toArena5(); d = lm.dragon; p = lm.player; isolate(d); toLife2(); d = lm.dragon;
      setup();
      const hp = p.hp;
      act();
      lifeTwo.push(`${name}${p.hp === hp ? '' : ' FAILED (-' + Math.round(hp - p.hp) + ')'}`);
      return p.hp === hp;
    };
    ex.push(tryIt2('inferno pulse: jump the ring', () => { d.x = 5600; p.x = 5000; }, () => {
      d.beginAttack('inferno_pulse', p);
      until(() => d.state === 'active' && d.ring && Math.abs(p.x - d.x) - d.ring.r < 230, 60 * 4);
      key('Space', true); tick(20); key('Space', false);
      until(() => d.state === 'recovery', 60 * 4);
    }));
    ex.push(tryIt2('molten armor rain: a gap is left', () => { p.x = d.x - 600; }, () => {
      d.beginAttack('armor_rain', p);
      until(() => d.state === 'active', 60 * 3); tick(2);
      const xs = game.hazards.list.filter(h => h.kind === 'plate').map(h => h.tx);
      let gap5 = null;
      const clearOf = x5 => !lm.level.solids.some(s => !(s.prop && s.prop.walkThrough) && x5 > s.x - 50 && x5 < s.x + s.w + 50);
      for (let x5 = p.x - 360; x5 <= p.x + 360 && gap5 === null; x5 += 10) {
        if (x5 > lm.cfg.arena.start + 60 && x5 < lm.cfg.arena.end - 60 && clearOf(x5) && xs.every(m => Math.abs(x5 - m) > 200)) gap5 = x5;
      }
      if (gap5 === null) p.hp -= 1; else p.x = gap5;
      until(() => !game.hazards.list.some(h => h.kind === 'plate'), 60 * 4);
      tick(60 * 3);
    }));
    let falseHarmless = true;
    ex.push(tryIt2('shadow hunt: only the burning-eyed shadow dives', () => { d.x = 5300; p.x = 5000; }, () => {
      d.beginAttack('shadow_hunt', p);
      const hpS5 = p.hp;
      until(() => d.shadow && d.shadow.sub === 'hunt', 60 * 6);
      falseHarmless = p.hp === hpS5 && d.shadow.done >= 2;
      until(() => d.shadow && d.shadow.sub === 'lock', 60 * 3);
      const dir = p.x > d.shadow.zone ? 1 : -1;
      key(dir > 0 ? 'KeyD' : 'KeyA', true); tick(50); key(dir > 0 ? 'KeyD' : 'KeyA', false);
      until(() => !d.shadow || (d.shadow.sub === 'dive' && d.shadow.t > d.attack.diveTime - 0.06), 60 * 2);
      key('Space', true); tick(20); key('Space', false);
      until(() => d.state === 'idle', 60 * 4);
    }));
    ex.push(tryIt2('last ember: shelter behind stone', () => {
      const boulder = lm.level.props.find(q => q.id === 'boulder' && q.x > lm.cfg.arena.start);
      d.x = boulder.solid.x + boulder.solid.w + 500; d.facing = -1; p.x = boulder.solid.x - 60;
    }, () => {
      d.beginAttack('last_ember', p);
      until(() => d.state === 'recovery', 60 * 8);
    }));
    check('Each attack has a working escape (roll, jump, brace, cover, gap or counter)', ex.every(Boolean),
          escapes.concat(lifeTwo).join('; '));
    check('Shadow Hunt: the false shadow passes never strike', falseHarmless);
    // interrupts and counters
    toArena5(); d = lm.dragon; p = lm.player; isolate(d); toLife2(); d = lm.dragon;
    d.beginAttack('last_ember', p);
    until(() => d.state === 'telegraph' && d.t > 1, 60 * 3);
    for (let k = 0; k < 3 && d.state === 'telegraph'; k++) game.combat.applyToDragon(p, d, at(d, 'chest'), { segment: 'chest', mul: 3 });
    tick(2);
    check('The Last Ember breaks into the longest stagger when the burning chest is struck', d.state === 'stagger' &&
          d.staggerFor >= 4.5, `state ${d.state}`);
    toArena5(); d = lm.dragon; p = lm.player; isolate(d); toLife2(); d = lm.dragon;
    p.x = d.x - d.facing * -500;
    d.beginAttack('triple_cataclysm', p);
    tick(10);
    const inCombo = !!d.combo;
    d.breakSegment(Object.values(d.segments).find(q => !q.broken)?.id || 'head');
    if (Object.values(d.segments).every(q => q.broken)) d.interruptCombo('test');
    check('Triple Cataclysm runs in sequence and a broken plate (or counter) ends it in a stagger',
          inCombo && !d.combo && d.state === 'stagger');
    toArena5(); d = lm.dragon; p = lm.player; isolate(d);
    d.tricks = { feint: 1, delay: [0, 0] };
    p.x = d.x - d.facing * -500;
    d.beginAttack('bite', p);
    until(() => d.attackId !== 'bite' || d.state !== 'telegraph', 60 * 2);
    check('Execution Feint: a switch is always preceded by the flare cue', d.attackId !== 'bite' && d.feintCue > 0,
          `bite -> ${d.attackId}`);
    toArena5(); d = lm.dragon; p = lm.player; isolate(d);
    p.x = d.x - 300;
    d.beginAttack('dragonfall', p);
    until(() => d.diveS && d.diveS.sub === 'dive', 60 * 4);
    p.x = d.diveS.zone + 10;
    until(() => d.diveS && d.diveS.t >= d.attack.diveTime - 0.1, 60);
    press('ShiftLeft');
    until(() => d.state === 'recovery', 60);
    check('Dragonfall: a roll timed through the impact opens the head', d.isExposed('head'));


    // ================================================================ Level 5: the hardest rules
    const quiet5 = dr => { isolate(dr); dr.flyCd = dr.punishCd = dr.moltenCd = 1e9; };
    check('Every weapon is weaker (Steel Sword 10, Heavy Greatsword 36, Lightbreaker 16, Frostbrand 15)',
          WEAPONS.steel_sword.damage === 10 && WEAPONS.greatsword.damage === 36 && WEAPONS.lightbreaker.damage === 16 &&
          WEAPONS.frostbrand.damage === 15);
    toArena5(); d = lm.dragon; p = lm.player; quiet5(d);
    d.facing = -1; p.x = d.x - 420; p.facing = 1;
    const fullHp = p.hp === p.maxHp;
    d.beginAttack('bite', p);
    until(() => d.state === 'recovery' || !p.alive, 60 * 3);
    const afterOne = p.hp / p.maxHp;
    until(() => p.state === 'move' && !p.invulnerable, 60 * 3);
    d.enterIdle(999); tick(2);
    d.facing = Math.sign(p.x - d.x) || 1; p.x = d.x + d.facing * 420;
    d.beginAttack('bite', p);
    until(() => d.state === 'recovery' || !p.alive, 60 * 3);
    check('A blow from Vhagar takes 70% of full health; a second one kills', fullHp && Math.abs(afterOne - 0.3) < 0.02 &&
          !p.alive, `after one blow ${Math.round(afterOne * 100)}% left`);
    toArena5(); d = lm.dragon; p = lm.player; quiet5(d);
    check('Vhagar is a little slower, with new moves (gate hurl, cinder storm, seize)',
          d.def.moveSpeed <= 165 && ['gate_hurl', 'cinder_storm', 'seize'].every(id5 => d.def.attacks[id5]) &&
          d.def.phases[0].speedMul < 1);

    // ---- Sky Reign: Vhagar takes the sky and Aemond strikes from the saddle
    toArena5(); d = lm.dragon; p = lm.player; quiet5(d);
    d.x = 5300; p.x = 4900;
    let heldK = null;
    const holdK = code => { if (heldK !== code) { if (heldK) key(heldK, false); if (code) key(code, true); heldK = code; } };
    d.beginAttack('sky_reign', p);
    let spears = 0, swooped = false;
    for (let i = 0; i < 60 * 22 && p.alive; i++) {
      const sr = d.reign;
      if (!sr) { holdK(null); if (d.state === 'idle') break; tick(1); continue; }
      spears = Math.max(spears, sr.thrown);
      if (sr.sub === 'swoop') swooped = true;
      if (sr.sub === 'swoopwarn' || sr.sub === 'swoop') holdK('KeyS');
      else if (sr.reticle && Math.abs(p.x - sr.reticle.x) < 220) {
        // pick a side once per spear: whichever is not walled by stone or the arena edge
        if (!sr.reticle.escape) {
          const open = dir => (dir > 0 ? p.x < lm.cfg.arena.end - 300 : p.x > lm.cfg.arena.start + 300) &&
            !lm.level.solids.some(q => !(q.prop && q.prop.walkThrough) &&
                                  (dir > 0 ? q.x > p.x && q.x < p.x + 260 : q.x + q.w < p.x && q.x + q.w > p.x - 260));
          sr.reticle.escape = open(1) ? 1 : -1;
        }
        holdK(sr.reticle.escape > 0 ? 'KeyD' : 'KeyA');
      } else holdK(null);
      tick(1);
    }
    holdK(null);
    check('Sky Reign: Aemond hurls spears from the air, then sweeps low; stepping out and bracing escapes it all',
          p.alive && spears === d.def.attacks.sky_reign.spears && swooped, `${spears} spears, alive ${p.alive}`);
    toArena5(); d = lm.dragon; p = lm.player; quiet5(d);
    d.x = 5000; p.x = lm.scorpions[0].x;
    d.beginAttack('sky_reign', p);
    until(() => d.reign && d.reign.sub === 'hover', 60 * 2);
    tick(20); press('KeyE');
    until(() => d.state === 'stagger', 60 * 3);
    check('A scorpion bolt brings Vhagar out of the sky, stunned with wings and head open',
          d.state === 'stagger' && d.isExposed('wing') && d.isExposed('head'));

    // ---- Lightbreaker Dawnfire
    if (!game.progression.data.ownedWeapons.includes('lightbreaker')) game.progression.data.ownedWeapons.push('lightbreaker');
    game.shop.equip('lightbreaker');
    toArena5(); d = lm.dragon; p = lm.player; quiet5(d);
    d.x = 5300; p.x = 4800;
    const hpDf = d.hp, flames = p.fireCharges;
    d.beginAttack('sky_reign', p);
    until(() => d.reign && d.reign.sub === 'hover', 60 * 2);
    p.facing = Math.sign(d.x - p.x);
    press('KeyK');
    until(() => d.state === 'stagger', 60 * 3);
    const dfDown = d.state === 'stagger', dfBurning = d.burnT > 0, dfHurt = hpDf - d.hp;
    tick(100); press('KeyK'); tick(60); press('KeyK'); tick(10);
    check('Lightbreaker Dawnfire, twice per battle: burns through armor, sets Vhagar alight, brings it down from the sky',
          flames === 2 && dfDown && dfBurning && dfHurt > 100 && p.fireCharges === 0, `${Math.round(dfHurt)} damage, flames left ${p.fireCharges}`);
    game.shop.equip('steel_sword');

    // ---- Wing Guard and Molten Hide
    toArena5(); d = lm.dragon; p = lm.player; quiet5(d);
    d.punishCd = 0; d.recent = [0, 0.3, 0.6].map(t => ({ t: d.clock - t, dmg: 5 }));
    tick(2);
    const guardStarts = d.attackId === 'wing_guard';
    until(() => d.guarding, 60);
    p.x = d.x + d.facing * 300;
    const hpG0 = d.hp;
    game.combat.applyToDragon(p, d, at(d, 'chest'), { segment: 'chest' });
    const blocked = d.hp === hpG0;
    p.x = d.x - d.facing * 400;
    game.combat.applyToDragon(p, d, at(d, 'tail'), { segment: 'tail' });
    check('Wing Guard: mashing raises it; it blocks every blow from the front, but not from behind',
          guardStarts && blocked && d.hp < hpG0);
    until(() => d.state === 'recovery', 60 * 3);
    check('Backing away from the Wing Guard escapes its buffet', p.alive);
    toArena5(); d = lm.dragon; p = lm.player; quiet5(d);
    d.phase = 1; d.moltenCd = 0; d.recent = [{ t: d.clock, dmg: d.maxHp * 0.05 }];
    tick(2);
    const molten = d.moltenT > 0;
    p.x = d.x + d.facing * 300;
    const hpM = p.hp;
    game.combat.applyToDragon(p, d, at(d, 'chest'), { segment: 'chest' });
    check('Molten Hide: under heavy pressure the plates turn molten; striking them burns the warrior',
          molten && p.hp < hpM && p.alive, `hp ${hpM} -> ${Math.round(p.hp)}`);

    // ---- Earthsplitter
    toArena5(); d = lm.dragon; p = lm.player; quiet5(d);
    d.x = 5400; d.facing = -1; p.x = 4700;
    d.beginAttack('earthsplitter', p);
    const rolled = until(() => game.hazards.list.some(h => h.kind === 'rift' && (p.x - h.front) * h.dir > 0 &&
                                                         (p.x - h.front) * h.dir < 200), 60 * 4);
    key('KeyD', true); press('ShiftLeft'); key('KeyD', false);
    until(() => !game.hazards.list.some(h => h.kind === 'rift'), 60 * 4);
    check('Earthsplitter: a rift of stone spikes runs at the warrior; a roll through its front escapes',
          rolled && p.alive);

    // ---- the Gatechain Flail
    toArena5(); d = lm.dragon; p = lm.player; quiet5(d);
    const chainCache = lm.pickups.find(q => q.weapon === 'gatechain_flail');
    p.x = chainCache.x; tick(2); press('KeyE'); tick(20);
    const tookChain = p.weapon.id === 'gatechain_flail' && p.weapon.hooks === 3;
    d.x = 5600; p.x = 6100;
    d.beginAttack('sky_reign', p);
    until(() => d.reign && d.reign.sub === 'hover', 60 * 2);
    p.facing = Math.sign(d.x - p.x);
    press('KeyK');
    until(() => d.state === 'stagger', 60 * 3);
    check('Gatechain Flail: found in the arena; its hook hauls Vhagar out of the sky (3 throws a battle)',
          tookChain && d.state === 'stagger' && p.weapon.hooks === 2, `hooks left ${p.weapon.hooks}`);

    // ---- 14. leaving and coming back
    toArena5(); d = lm.dragon; p = lm.player; isolate(d);
    p.addWeapon(new Weapon('war_hammer'));
    d.takeDamage(900, 'physical', 0, { force: true });
    game.quitToMenu();
    game.startLevel(5);
    check('Leaving and re-entering the level starts the encounter fresh', lm.dragon.life === 1 &&
          lm.dragon.hp === lm.dragon.maxHp && lm.player.loadout.length === 1 && lm.phase === 'explore');

    // ---- 11. full fights through both lives, battlefield weapons
    const runs5 = [];
    game.shop.equip('lightbreaker');
    for (let k = 0; k < 4; k++) runs5.push(botFight(5, 1000, { weapons: ['twin_daggers', 'war_hammer', 'gatechain_flail'], from: 3300 }));
    game.shop.equip('steel_sword');
    const w5 = runs5.filter(r => r.won).length;
    const f5 = runs5.find(r => r.won) || runs5[0];
    // One blow kills, so a win needs a flawless ten minutes: the scripted bot rarely manages it.
    // Reported only; every attack's escape is proven by the checks above.
    check(`Full Vhagar runs, both lives, battlefield weapons + Lightbreaker (reported only: bot won ${w5}/${runs5.length})`, true,
          runs5.map(r => `${r.won ? 'won' : 'fell'} at ${r.time.toFixed(0)}s (life ${r.lives}, damage ${r.lifeDamage && r.lifeDamage.join('/')})`).join('; '));
    const s5 = botFight(5, 900, { weapons: [], from: 3300 });
    check('Steel Sword alone vs Vhagar (reported only, not required)', true,
          `${s5.won ? 'won' : 'lost'} in ${s5.time.toFixed(0)}s (life ${s5.lives}, damage ${s5.lifeDamage && s5.lifeDamage.join(' / ')})`);

    // ================================================================ Level 6: the Dragonpit
    check('The campaign map shows 7 levels; Levels 6 and 7 are playable', LEVELS.length === 7 &&
          getLevel(6).status === 'playable' && getLevel(7).status === 'playable');
    const toArena6 = () => {
      game.input.clear();
      game.startLevel(6);
      lm.player.x = lm.cfg.arena.triggerX - 30;
      hold('KeyD', 12);
      until(() => lm.dragons.every(dr => dr.state === 'idle') && !lm.cutscene, 60 * 9);
    };
    const quiet6 = () => { for (const dr of lm.dragons) { isolate(dr); dr.pairCd = dr.leapCd = dr.punishCd = dr.flyCd = 1e9; } };
    toArena6(); p = lm.player;
    let [dg, vs] = lm.dragons;
    check('Drogon and Viserion land on either side of the warrior', dg.def === ENEMIES.drogon && vs.def === ENEMIES.viserion &&
          Math.sign(dg.x - p.x) !== Math.sign(vs.x - p.x), `drogon ${Math.round(dg.x)}, warrior ${Math.round(p.x)}, viserion ${Math.round(vs.x)}`);
    // one strikes alone at a time
    quiet6();
    p.x = 4300; dg.x = 4750; vs.x = 3850;
    dg.facing = -1;
    dg.beginAttack('bite', p);
    for (const id6 in vs.cooldowns) vs.cooldowns[id6] = 0;
    vs.idleFor = 0;
    let both = false;
    until(() => { if (vs.busy && dg.busy) both = true; return dg.state === 'recovery' || dg.state === 'idle'; }, 60 * 3);
    check('Only one dragon strikes on its own at a time; the other waits its turn', !both);
    // flanking: a dragon on the same side leaps over the warrior to the other
    toArena6(); p = lm.player; [dg, vs] = lm.dragons; quiet6();
    p.x = 4300; dg.x = 5200; vs.x = 4800; vs.leapCd = 0; vs.idleFor = 0;
    const leapt = until(() => vs.state === 'leap', 60);
    until(() => vs.state !== 'leap', 60 * 2);
    check('Flanking: a dragon caught on its partner\'s side leaps over the warrior to the far side',
          leapt && vs.x < p.x, `viserion ${Math.round(vs.x)}, warrior ${Math.round(p.x)}`);
    // the joint moves: each is beaten with the right answer (the bot plays them)
    const pairRun = (id6, px, dx, vx) => {
      toArena6(); p = lm.player; [dg, vs] = lm.dragons; quiet6();
      p.x = px; dg.x = dx; vs.x = vx;
      const ok = dg.startPair(p, vs, id6);
      const bot = new Bot(game);
      let seen = false;
      until(() => {
        bot.step(DT);
        if (dg.busy || vs.busy) seen = true;
        return seen && !dg.busy && !vs.busy && !game.hazards.list.some(h => h.kind === 'fireball');
      }, 60 * 8);
      bot.release();
      return ok && seen && p.hp === p.maxHp;
    };
    check('Pincer Charge: both charge from either side, a beat apart; a roll under each escapes',
          pairRun('pincer', 4400, 5150, 3650));
    check('Twin Bite: both jaws snap together; one perfect roll beats both', pairRun('twin_bite', 4400, 4800, 4000));
    check('Dragon Dance: alternating dives; leaving each ring escapes', pairRun('dance', 4400, 5000, 3800));
    check('Fire and Ice: a low flame wave from one side, ice fire from the other; both can be escaped',
          pairRun('fire_ice', 4400, 5000, 3800));
    // Viserion's frost
    toArena6(); p = lm.player; [dg, vs] = lm.dragons; quiet6();
    p.x = 3700; vs.x = 4300; vs.facing = 1;
    vs.beginAttack('frost_breath', p);
    let frosted = false;
    until(() => { if (game.hazards.list.some(h => h.kind === 'frost')) frosted = true; return vs.state === 'recovery'; }, 60 * 4);
    const slide = onIce => {
      toArena6(); p = lm.player; quiet6();
      p.x = 4300;
      if (onIce) game.hazards.add(new FrostPatch(4500, { width: 900, life: 9 }));
      hold('KeyD', 40);
      const x6 = p.x;
      tick(30);
      return p.x - x6;
    };
    const dry = slide(false), icy = slide(true);
    check('Viserion\'s ice fire leaves frozen sand; the warrior slides on it', frosted && icy > dry * 2 + 40,
          `stops in ${Math.round(dry)}px on sand, ${Math.round(icy)}px on frost`);
    // enrage, and victory only when both have fallen
    toArena6(); p = lm.player; [dg, vs] = lm.dragons; quiet6();
    const sp0 = dg.speedMul;
    vs.takeDamage(1e7, 'physical', 0, { force: true });
    tick(5);
    check('When one dragon falls, the other enrages (faster)', dg.enraged && dg.speedMul > sp0 * 1.15);
    tick(60);
    const pitOpen = lm.phase === 'arena';
    const before6 = game.progression.data.gold;
    dg.takeDamage(1e7, 'physical', 0, { force: true });
    until(() => game.mode === 'results', 60 * 14);
    const r6 = lm.result;
    check('The pit is won only when both dragons are down: 500 gold, 450 XP, "Lord of the Dragonpit"',
          pitOpen && r6 && r6.first && r6.gold === 500 && r6.xp === 450 && game.progression.data.gold === before6 + 500 &&
          r6.achievement && r6.achievement.id === 'dragonpit', r6 ? `+${r6.gold} gold, ${r6.achievement && r6.achievement.name}` : '');
    // full fights
    game.shop.equip('lightbreaker');
    const runs6 = [botFight(6, 600), botFight(6, 600), botFight(6, 600)];
    game.shop.equip('steel_sword');
    const w6 = runs6.filter(r => r.won).length;
    check(`Full Dragonpit runs with Lightbreaker (bot won ${w6}/3; at least one)`, w6 >= 1,
          runs6.map(r => `${r.won ? 'won' : 'fell'} at ${r.time.toFixed(0)}s, ${r.hp} hp, dragons ${r.dragonHp}`).join('; ') +
          `; attacks: ${runs6[0].used}`);


    await level7Checks(T7);
    await onlineChecks(T7);
    await soundChecks(T7);

    // ================================================================ the player's own clips (assets/media)
    // A stand-in for Clips: it records what would play. Without real files nothing plays at all.
    const fakeClipsC = (types = {}) => ({
      plays: {}, stopped: {},
      get(id) { return types[id] ? { id, type: types[id], duration: 2, el: {} } : null; },
      play(id) { if (!types[id]) return false; this.plays[id] = (this.plays[id] || 0) + 1; return true; },
      stop(id) { this.stopped[id] = true; }, stopAll() {}, setMuted() {}, playing() { return false; },
    });
    const cueAtC = (level, attack) => {
      game.input.clear();
      game.startLevel(level);
      lm.player.x = lm.cfg.arena.triggerX - 30;
      hold('KeyD', 12);
      until(() => lm.dragons.every(dr => dr.state === 'idle') && !lm.cutscene, 60 * 9);
      const dr = lm.dragons.find(x => x.def.attacks[attack]) || lm.dragon;
      isolate(dr);
      const before = { ...game.clips.plays };
      dr.beginAttack(attack, lm.player);
      const after = { ...game.clips.plays };             // counted now, not when the check runs
      return k => (after[k] || 0) - (before[k] || 0);
    };
    game.clips = fakeClipsC({ dracarys: 'audio', vhagar_fire: 'audio', player_death: 'audio' });
    const rhC = cueAtC(4, 'inferno'), rhBiteC = cueAtC(4, 'claw');
    const dgC = cueAtC(6, 'inferno'), vsC = cueAtC(6, 'frost_breath');
    check('"Dracarys" (if the player adds dracarys.*) is heard as Rhagal, Drogon and Viserion begin to breathe fire, not for other blows',
          rhC('dracarys') === 1 && rhBiteC('dracarys') === 0 && dgC('dracarys') === 1 && vsC('dracarys') === 1);
    const vhC = cueAtC(5, 'scorched_breath'), vfC = cueAtC(1, 'fire_breath');
    check('Vhagar\'s own clip (vhagar_fire.*) is heard when she breathes fire; Varkhul has none',
          vhC('vhagar_fire') === 1 && vhC('dracarys') === 0 && vfC('dracarys') === 0 && vfC('vhagar_fire') === 0);
    game.input.clear();
    game.startLevel(1);
    lm.player.takeHit(1e6, lm.player.x + 10, 300);
    tick(2);
    const deathAudioC = game.clips.plays.player_death === 1 && !lm.deathClip;
    game.clips = fakeClipsC({ player_death: 'video' });
    game.input.clear();
    game.startLevel(1);
    lm.player.takeHit(1e6, lm.player.x + 10, 300);
    tick(2);
    const deathVideoC = !!lm.deathClip;
    until(() => lm.phase === 'lost', 60 * 4);
    tick(30);
    const heldBackC = game.mode === 'playing';
    until(() => game.mode === 'results', 60 * 6);
    check('The death clip (player_death.*) plays when the warrior falls; a video holds the defeat screen until it ends',
          deathAudioC && deathVideoC && heldBackC && game.ui.screen === 'defeat');
    game.clips = fakeClipsC({ aegon_theme: 'audio' });
    game.progression.sagaRecord(7).granted = true;
    game.progression.sagaRecord(7).cleared = ['sunfyre', 'vermithor', 'balerion'];
    game.input.clear();
    game.startLevel(7);
    until(() => lm.saga.state === 'travel', 60 * 20);
    lm.player.x = lm.cfg.arena.triggerX - 20;
    hold('KeyD', 20);
    until(() => lm.saga.state === 'duelIntro' || lm.saga.state === 'duel', 60 * 6);
    tick(2);
    const themedC = game.clips.plays.aegon_theme === 1;
    until(() => lm.saga.state === 'duel' && lm.dragon.hittable, 60 * 6);   // he can be struck once his salute ends
    lm.dragon.hp = 1;
    lm.dragon.takeHit(lm.player, { x: lm.dragon.x, y: lm.dragon.y - 150 }, { mul: 1 }, lm.player.weapon);
    until(() => !!lm.ending, 60 * 8);
    check('Aegon\'s theme (aegon_theme.*) starts as he steps out to fight, and stops for the ending',
          themedC && game.clips.stopped.aegon_theme === true);
    game.clips = null;
    game.progression.resetSaga(7);

    const f1 = botFight(1, 300);
    check('Level 1 is still winnable with the Steel Sword', f1.won,
          `${f1.time.toFixed(0)}s, ${f1.hp}/${f1.maxHp} hp left, dragon hp ${f1.dragonHp}; attacks seen: ${f1.used}`);
  } catch (e) {
    console.error(e);
    check('Test run finished without errors', false, e.message);
  }

  game.saves.reset();
  return results;
}

export function showResults(results) {
  const pass = results.filter(r => r.pass).length;
  const el = document.createElement('div');
  el.className = 'smoke';
  el.innerHTML = `<h2>Smoke test: ${pass}/${results.length} passed</h2><ol>${results.map(r =>
    `<li class="${r.pass ? 'ok' : 'bad'}"><b>${r.pass ? 'PASS' : 'FAIL'}</b> ${r.name}${r.detail ? ` <span>— ${r.detail}</span>` : ''}</li>`
  ).join('')}</ol>`;
  document.body.appendChild(el);
  window.SMOKE_RESULTS = results;
  console.log(`Smoke test: ${pass}/${results.length} passed`, results);
}

// The game's own sound for every clip slot (no files needed), a player's clip
// winning over it, the bell when the warrior falls, and the ending's anthem.
// A stand-in records what the audio is asked to do. Also: index.html?smoke=sound
async function soundChecks(T) {
  const { game, lm, check, tick, hold, until, isolate } = T;
  const calls = [];
  const fakeAudio = {
    muted: false, ready: true, musicBus: null, ctx: null, musicLevel: 0.4, listenerX: 0, onReport: null,
    play(n) { calls.push('play:' + n); }, music(id) { calls.push('music:' + id); },
    line(id) { calls.push('line:' + id); return true; },
    async voice(id) { calls.push('voice:' + id); return 'file'; }, setMuted() {}, report() {}, loadVoices() {},
  };
  const realAudio = game.audio, realClips = game.clips;
  game.audio = fakeAudio;
  game.clips = null;
  const fireAt = (level, attack) => {
    game.input.clear();
    game.startLevel(level);
    lm.player.x = lm.cfg.arena.triggerX - 30;
    hold('KeyD', 12);
    until(() => lm.dragons.every(dr => dr.state === 'idle') && !lm.cutscene, 60 * 9);
    const dr = lm.dragons.find(x => x.def.attacks[attack]) || lm.dragon;
    isolate(dr);
    calls.length = 0;
    dr.beginAttack(attack, lm.player);
    return calls.filter(c => c.startsWith('line:'));
  };
  const rh = fireAt(4, 'inferno'), dg = fireAt(6, 'inferno'), vs = fireAt(6, 'frost_breath');
  const vh = fireAt(5, 'scorched_breath'), vf = fireAt(1, 'fire_breath'), bite = fireAt(4, 'claw');
  check('With no clips added, "Dracarys!" is the game\'s own line: a rider\'s cry for Rhagal, Drogon and Viserion, Aemond\'s for Vhagar',
        rh.join() === 'line:dracarys' && dg.join() === 'line:dracarys' && vs.join() === 'line:dracarys' &&
        vh.join() === 'line:dracarys_aemond' && vf.length === 0 && bite.length === 0, JSON.stringify({ rh, dg, vs, vh, vf, bite }));
  const clipPlays = [];
  game.clips = { get: id => (id === 'dracarys' ? { id, type: 'audio', duration: 2, el: {} } : null),
                 play: id => { clipPlays.push(id); return true; }, stop() {}, stopAll() {}, setMuted() {}, playing: () => false };
  const withClip = fireAt(4, 'inferno');
  check('A "dracarys" clip the player adds is heard instead of the built-in line', withClip.length === 0 && clipPlays.join() === 'dracarys');
  game.clips = null;
  game.input.clear();
  game.startLevel(2);
  tick(10);
  calls.length = 0;
  lm.player.takeHit(1e6, lm.player.x + 10, 300);
  tick(3);
  check('When the warrior falls the score stops and a funeral bell tolls (no clip needed)',
        calls.includes('music:null') && calls.includes('play:fallen'), calls.join());
  until(() => game.mode === 'results', 60 * 8);
  const P = game.progression;
  P.sagaRecord(7).granted = true;
  P.sagaRecord(7).cleared = ['sunfyre', 'vermithor', 'balerion'];
  game.input.clear();
  game.startLevel(7);
  until(() => lm.saga.state === 'travel', 60 * 20);
  lm.player.x = lm.cfg.arena.triggerX - 20;
  hold('KeyD', 20);
  until(() => lm.saga.state === 'duel' && lm.dragon.hittable, 60 * 12);
  const duelTheme = calls.includes('music:aegon');
  lm.dragon.hp = 1;
  lm.dragon.takeHit(lm.player, { x: lm.dragon.x, y: lm.dragon.y - 150 }, { mul: 1 }, lm.player.weapon);
  until(() => !!lm.ending, 60 * 8);
  calls.length = 0;
  const e = lm.ending;
  until(() => e.t >= e.T.kingVoice + 0.5, 60 * 30);
  const at = k => calls.indexOf(k);
  check('The ending: the anthem rises with THE NORTH REMEMBERS, the war horn sounds for THE KING IN THE NORTH, and both lines are heard',
        duelTheme && at('music:north') >= 0 && at('play:horn') > at('music:north') && at('voice:north_remembers') >= 0 &&
        at('voice:king_in_the_north') > at('play:horn'), calls.filter(c => !/hit|swing|clang|roll|ui/.test(c)).join(', '));
  e.t = 60;
  until(() => game.mode === 'results', 60 * 6);
  game.audio = realAudio;
  game.clips = realClips;
  P.newGame();
  const files = await Promise.all(['dracarys', 'dracarys_aemond', 'north_remembers', 'king_in_the_north'].map(
    f => fetch(`assets/audio/${f}.wav`, { method: 'HEAD', cache: 'no-store' }).then(r => r.ok, () => false)));
  check('The game\'s voice lines are in assets/audio, and every in-fight clip slot has a sound of its own',
        files.every(Boolean) && ['dracarys', 'vhagar_fire', 'player_death'].every(k => typeof CUES[k] === 'function') &&
        !!THEMES.north && THEMES.north.lead === 'anthem', files.join());
}

// Dragonbane before Level 7, and the online side: battle reports, the queue,
// the leaderboard screens. No server is needed (stand-ins answer for it).
// Also runs on its own: index.html?smoke=online
async function onlineChecks(T) {
  const { game, lm, check, tick, key, until } = T;
  const P = game.progression;
  const wait = () => new Promise(r => setTimeout(r, 0));

  // ---- Dragonbane: gold, once Level 6 is cleared
  P.newGame();
  for (let i = 1; i <= 5; i++) P.data.levels[i] = { cleared: true, clears: 1, bestTime: 300, noHit: false };
  P.data.gold = 2000;
  const early = game.shop.buyWeapon('dragonbane');
  P.data.levels[6] = { cleared: true, clears: 1, bestTime: 300, noHit: false };
  const bought = game.shop.buyWeapon('dragonbane');
  check('Dragonbane is bought for 900 gold once Level 6 is cleared, so it can be carried into Level 7',
        WEAPONS.dragonbane.unlock === 6 && WEAPONS.dragonbane.price === 900 && !early.ok && early.reason === 'Clear Level 6 first' &&
        bought.ok && P.data.gold === 1100 && !P.isLevelCleared(7) && P.isLevelUnlocked(7));
  P.data.ownedWeapons = P.data.ownedWeapons.filter(id => id !== 'dragonbane');
  P.data.gold = 50;
  game.ui.showArmory();
  const joke = game.ui.root.querySelector('[data-action=joke-pay][data-id=dragonbane]');
  if (joke) joke.click();
  const bank = game.ui.root.querySelector('.ironbank');
  check('Its "$1" button is only a joke: it asks for and takes nothing, and gives nothing',
        !!joke && game.ui.screen === 'ironbank' && !!bank && /no real money/i.test(bank.textContent) &&
        P.data.gold === 50 && !P.data.ownedWeapons.includes('dragonbane') && !bank.querySelector('input'));
  game.ui.hideAll();
  P.newGame();

  // ---- every battle is reported: wins, falls, saga bosses
  const got = [];
  const keep = P.onBattle;
  P.onBattle = b => got.push(b);
  game.input.clear();
  game.startLevel(1);
  lm.player.x = lm.cfg.arena.triggerX - 30;
  T.hold('KeyD', 12);
  until(() => lm.dragon.state === 'idle' && !lm.cutscene, 60 * 8);
  lm.dragon.takeDamage(lm.dragon.hp + 10, 'physical', 999, { force: true });
  until(() => game.mode === 'results', 60 * 12);
  const win = got[got.length - 1] || {}, winGold = lm.result ? lm.result.gold : -1;
  game.input.clear();
  game.startLevel(2);
  tick(10);
  lm.player.takeHit(1e6, lm.player.x + 10, 300);
  until(() => game.mode === 'results', 60 * 8);
  const fall = got[got.length - 1] || {};
  check('A won level is reported to the leaderboard (level, boss, time, gold, XP), and so is a fall (nothing paid)',
        win.level === 1 && win.boss === 'ember_wyrm' && win.won && win.clear && win.gold === winGold && win.gold >= 100 && win.xp > 0 && win.time > 0 &&
        fall.level === 2 && fall.boss === 'emberwing' && fall.won === false && !fall.clear && fall.gold === 0 && fall.xp === 0,
        JSON.stringify([win, fall]));
  const L7 = getLevel(7), sun = L7.stages.find(s => s.id === 'sunfyre');
  P.recordBoss(7, sun, [], 140);
  const b1 = got[got.length - 1];
  P.recordBoss(7, sun, [], 120);
  const b2 = got[got.length - 1];
  P.completeSaga(L7, { time: 900, damageTaken: 50 });
  const done = got[got.length - 1];
  check('Level 7: each boss is a battle (paid once), and the whole level is a clear with the duel and level rewards',
        b1.boss === 'sunfyre' && b1.won && !b1.clear && b1.gold === sun.reward.gold && b2.gold === 0 &&
        done.level === 7 && done.boss === 'aegon' && done.clear && done.gold === 500 + L7.rewards.firstClear.gold &&
        bossKey(getLevel(6)) === 'drogon+viserion', JSON.stringify([b1, b2, done]));
  P.onBattle = keep;
  P.newGame();

  // ---- the queue: guests send nothing; a battle waits until the server takes it
  const o = new Online(game, { enabled: true });
  const calls = [];
  let down = true;
  o.request = async (method, path, body) => {
    calls.push([method, path, body]);
    if (down) throw new OnlineError('The server cannot be reached.', 0);
    return { recorded: true, standing: { points: 120, ranks: { points: 1 } } };
  };
  o.available = true;
  o.reportBattle({ level: 1, boss: 'ember_wyrm', won: true, clear: true, time: 80, gold: 100, xp: 90 });
  const guestSent = calls.length;
  o.player = { id: 'smoke-test', name: 'Smoke' };
  try { localStorage.removeItem('dragonslayer.online.queue.smoke-test'); } catch (e) { /* */ }
  o.memoryQueue = [];
  o.reportBattle({ level: 1, boss: 'ember_wyrm', won: true, clear: true, time: 80.04, gold: 100, xp: 90 });
  await wait(); await wait();
  const held = o.queue().length;
  down = false;
  await o.flush();
  const sent = calls.filter(c => c[0] === 'POST' && c[1] === '/api/battle');
  check('Guests send no battles; a signed-in player\'s battle waits in a queue while the server is away, then goes once',
        guestSent === 0 && held === 1 && o.queue().length === 0 && sent.length === 2 && sent[0][2].id === sent[1][2].id &&
        /^[0-9a-f]{32}$/.test(sent[0][2].id) && sent[1][2].time === 80 && o.player.standing.points === 120);
  try { localStorage.removeItem('dragonslayer.online.queue.smoke-test'); } catch (e) { /* */ }

  // ---- typing a name is not playing
  const field = document.createElement('input');
  document.body.appendChild(field);
  field.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyM', bubbles: true }));
  field.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyD', bubbles: true }));
  const typed = game.input.isDown('mute') || game.input.isDown('right');
  field.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyD', bubbles: true }));
  field.remove();
  key('KeyD', true);
  const played = game.input.isDown('right');
  key('KeyD', false);
  check('Letters typed in a sign-in field are text, not moves (M does not mute, D does not walk)', !typed && played);

  // ---- the leaderboard screen, drawn from a stand-in server
  const real = game.online;
  const row = (rank, name, me = false) => ({ rank, name, me, level: 9, points: 1000 - rank * 100, gold: 600, held: 40, xp: 400,
    wins: 7, losses: rank, battles: 7 + rank, winRate: 80, winScore: 60 - rank, cleared: 7, totalTime: 2000 + rank, best: { 1: 90 } });
  game.online = {
    available: true, signupOpen: true, online: 3, player: { id: 2, name: 'Bran', standing: { points: 800, ranks: { points: 2 } } },
    on() {}, refreshMe() {}, live() {},
    leaderboard: async () => ({ board: 'points', level: 0, total: 4, players: 4, online: 3,
                                 rows: [row(1, 'Arya'), row(2, 'Bran', true), row(3, 'Sansa'), row(4, 'Rickon')], me: row(2, 'Bran', true) }),
    feed: async () => [{ name: 'Arya', level: 5, boss: 'vhagar', won: true, clear: true, time: 600, gold: 400, at: Date.now() / 1000 - 90 }],
  };
  game.ui.showLeaderboard('points', 0);
  await wait(); await wait(); await wait();
  const root = game.ui.root;
  const rows = root.querySelectorAll('table.lb tbody tr').length;
  const medals = root.querySelectorAll('.medal').length;
  const mine = root.querySelector('table.lb tr.me');
  const feedFirst = root.querySelector('[data-feed] li');
  game.ui.liveBattle({ name: 'Sansa', level: 7, boss: 'balerion', won: false, clear: false, time: 300, gold: 0, at: Date.now() / 1000 });
  const fresh = root.querySelector('[data-feed] li.fresh');
  check('The leaderboard shows the board (medals for the top three, your own row) and battles as they happen',
        game.ui.screen === 'leaderboard' && rows === 4 && medals === 3 && !!mine && /Bran/.test(mine.textContent) &&
        !!feedFirst && /Vhagar/.test(feedFirst.textContent) && !!fresh && /fell to.*Balerion/.test(fresh.textContent),
        `rows ${rows}, medals ${medals}`);
  game.online = { available: false, on() {}, live() {} };
  game.ui.showLeaderboard('points', 0);
  const offline = /play\.bat/.test(root.textContent);
  game.ui.showAccount();
  check('Without the game\'s server the leaderboard and sign-in explain how to start it; the game plays on',
        offline && game.ui.screen === 'account' && /play\.bat/.test(root.textContent));
  game.online = real;
  game.ui.hideAll();
  game.mode = 'menu';
  P.newGame();
}

// Level 7 (The Three Calamities). Also runs on its own: index.html?smoke=7
async function level7Checks(T) {
  const { game, lm, check, tick, press, hold, key, until, isolate } = T;
  let p, d;
    // ================================================================ Level 7: the Three Calamities
  const P7 = game.progression;
  const lvl7 = getLevel(7);
  check('Level 7, The Three Calamities, is playable: four encounters, one at a time', lvl7.status === 'playable' &&
        lvl7.stages.map(s => s.id).join() === 'sunfyre,vermithor,balerion,aegon');
  const sagaRun = (cleared, granted = true) => {
    const r = P7.sagaRecord(7);
    r.cleared = cleared.slice();
    r.granted = granted;
    P7.persist();
    game.input.clear();
    game.startLevel(7);
  };
  const toBoss7 = i => {
    sagaRun(['sunfyre', 'vermithor', 'balerion', 'aegon'].slice(0, i));
    until(() => lm.saga.state === 'travel', 60 * 20);
    lm.player.x = lm.cfg.arena.triggerX - 20;
    hold('KeyD', 20);
    until(() => lm.dragon.state === 'idle' && !lm.cutscene, 60 * 9);
    return lm.dragon;
  };
  const quiet7 = dr => { isolate(dr); dr.punishCd = 1e9; if (dr.cooldowns) for (const k in dr.cooldowns) dr.cooldowns[k] = 999; };
  // ---- 1. intro, the grant, explanations
  P7.data.ownedWeapons = P7.data.ownedWeapons.filter(w => w !== 'frostbrand');
  const gold70 = P7.data.gold;
  sagaRun([], false);
  p = lm.player;
  const introFirst = lm.saga.state === 'intro' && lm.dragons.length === 1 && lm.dragon.state === 'dormant';
  until(() => lm.saga.state === 'grant', 60 * 15);
  tick(10);
  const cards = !!lm.saga.card && lm.saga.cards.length === 1;
  press('Enter'); tick(10); press('Enter'); tick(10);
  until(() => lm.saga.state === 'travel', 60 * 15);
  check('Level 7 opens, then grants Frostbrand (no gold) and explains the Frostpiercer', introFirst && cards &&
        p.weapon.id === 'frostbrand' && P7.data.ownedWeapons.includes('frostbrand') && P7.data.gold === gold70 &&
        P7.data.unlocks.frostpiercer === true && P7.sagaRecord(7).granted && !!p.fp && p.fp.ammo === 4);
  check('Frostbrand cannot be bought; it is granted', WEAPONS.frostbrand.granted === 7 && !game.shop.buyWeapon('frostbrand').ok);
  // nothing on the Wall walls the warrior in: he walks past every pillar and barricade
  const blocked7 = [];
  const walkArena7 = lm.cfg.arena;
  lm.cfg.arena = { ...walkArena7, triggerX: 1e9 };      // no arena trigger (and its cutscene) while we walk
  for (const sol of lm.level.solids) {
    p.bounds = { min: 60, max: lm.cfg.length - 60 };
    p.x = sol.x - 160; p.vx = 0; tick(2);
    hold('KeyD', 60);
    if (p.x < sol.x + sol.w + 20) blocked7.push(`${sol.prop ? sol.prop.id : 'solid'} at ${Math.round(sol.x)}`);
  }
  lm.cfg.arena = walkArena7;
  check('Level 7: the warrior can walk past every ice pillar and barricade', lm.level.solids.length >= 8 && !blocked7.length,
        blocked7.join(', '));
  // ---- 2. the sequence: Sunfyre waits alone; the duel cannot come first
  check('Only Sunfyre exists until Sunfyre falls (one boss at a time)', lm.dragons.length === 1 &&
        lm.dragon.def === ENEMIES.sunfyre && lm.saga.index === 0);
  // ---- 3. Frostpiercer: deploy, aim, charge, fire, ammunition, reload, a miss wastes a spear
  d = toBoss7(0); p = lm.player; quiet7(d);
  p.x = d.x - 900; p.facing = 1; tick(2);
  press('KeyF'); tick(40);
  const deployed = p.state === 'fp' && p.fp.sub === 'aim';
  p.fp.angle = -50;                                   // well over the dragon
  hold('KeyW', 10);
  const aimedUp = p.fp.angle < -50;
  key('KeyJ', true); tick(30); const halfCharge = p.fp.charge; key('KeyJ', false); tick(2);
  const fired = p.fp.ammo === 3 && !p.fp.loaded && p.fpStats.fired === 1;
  until(() => p.fpStats.missed === 1, 60 * 3);
  const reloadStart = lm.time;
  until(() => p.fp.loaded, 60 * 4);
  const reloadTook = lm.time - reloadStart;
  check('Frostpiercer: F deploys, W/S aim, J charges and fires; a miss wastes the spear; the reload is long',
        deployed && aimedUp && halfCharge > 0.3 && halfCharge < 0.6 && fired && p.fpStats.missed === 1 &&
        reloadTook > 2.0, `charge ${halfCharge.toFixed(2)}, reload ${reloadTook.toFixed(2)}s`);
  // a full charge at the head: a weak point, frozen, open to the blade
  const head7 = d.frameToWorld(d.anim.data.head);
  p.fp.angle = -10;                                   // the muzzle moves with the aim
  const m7 = p.fp.muzzle();
  p.fp.angle = Math.atan2(head7.y - m7.y, head7.x - m7.x) * 180 / Math.PI - 3;
  key('KeyJ', true); tick(76); p.fp.predict();
  const sawWeak = p.fp.aimWeak;
  const hp7 = d.hp;
  key('KeyJ', false);
  until(() => d.state === 'frozen' || p.fpStats.hit > 0, 60 * 2);
  check('A full charge on a weak point: the HUD reads WEAK POINT; an icy blast freezes the dragon and opens it',
        sawWeak && d.state === 'frozen' && d.vulnerable && d.hp < hp7, `${hp7} -> ${d.hp}`);
  press('ShiftLeft'); tick(4);
  check('A roll stows the launcher at once', p.state === 'dodge' || p.state === 'move');
  until(() => p.state === 'move', 60);
  press('KeyF'); tick(40);
  const outFp7 = p.state === 'fp';
  press('Digit2'); tick(20);
  const sword2 = p.state !== 'fp' && p.slot === 1 && p.weapon.id === p.loadout[1].id;
  press('KeyF'); tick(40);
  press('KeyQ'); tick(20);
  check('Q / 1-6 put the Frostpiercer away and take up a sword at once', outFp7 && sword2 && p.state !== 'fp' &&
        p.slot === 0 && p.weapon.def.frostbrand);
  // ---- 4. Sunfyre: Sky Dance - feints, the marked dive, broken by Frostbrand; a missed dive leaves it open
  d = toBoss7(0); p = lm.player; quiet7(d);
  d.beginAttack('sky_dance', p);
  d.circ.feints = 1;
  let subs7 = [];
  until(() => { const s = d.circ ? d.circ.sub : d.state; if (subs7[subs7.length - 1] !== s) subs7.push(s); return !d.circ; }, 60 * 16);
  check('Sunfyre circles at changing heights, feints a dive (white eye flare), then commits to a marked dive',
        ['circle', 'feint', 'mark', 'dive'].every(s => subs7.includes(s)) && subs7.indexOf('feint') < subs7.indexOf('mark'),
        subs7.join(' > '));
  d = toBoss7(0); p = lm.player; quiet7(d);
  p.x = d.x - 600;
  d.beginAttack('sky_dance', p);
  d.circ.feints = 0;
  let broken7 = false;
  until(() => {
    const s = d.circ;
    if (s && s.sub === 'dive' && s.t >= d.attack.diveTime - d.attack.breakWindow + 0.02 && p.state === 'move') {
      p.x = s.zone - 150; p.facing = 1; press('KeyJ');
    }
    if (d.state === 'frozen') broken7 = true;
    return broken7 || (!d.circ && d.state !== 'circling');
  }, 60 * 16);
  check('A precisely timed Frostbrand blow breaks the marked dive: Sunfyre hits the ice frozen', broken7 && d.vulnerable);
  d = toBoss7(0); p = lm.player; quiet7(d);
  p.x = d.x - 700;
  d.beginAttack('sky_dance', p);
  d.circ.feints = 0;
  until(() => d.circ && d.circ.sub === 'dive', 60 * 14);
  p.x = d.circ.zone + (d.circ.zone > lm.cfg.arena.start + 900 ? -600 : 600);
  const hpDive = p.hp;
  until(() => !d.circ, 60 * 3);
  check('A dive into empty ice crashes Sunfyre: vulnerable for a while', d.vulnerable && p.hp === hpDive);
  // the bait: come close and the wings lash out; stay away and nothing happens
  d = toBoss7(0); p = lm.player; quiet7(d);
  p.x = d.x - 700; d.facing = -1;
  d.beginAttack('wing_bait', p);
  until(() => d.baitS && d.baitS.sub === 'hold', 60 * 2);
  const hpB_7 = p.hp;
  until(() => !d.baitS, 60 * 4);
  const safeAway = p.hp === hpB_7;
  d.beginAttack('wing_bait', p);
  until(() => d.baitS && d.baitS.sub === 'hold', 60 * 2);
  p.x = d.x - 300;
  until(() => !d.baitS, 60 * 4);
  check('Sunfyre retreats to bait: keep away and nothing comes; step in and the wings lash out (with a warning)',
        safeAway && p.hp < hpB_7);
  // Frostpiercer knocks it out of the Sky Dance
  d = toBoss7(0); p = lm.player; quiet7(d);
  d.beginAttack('sky_dance', p);
  until(() => d.circ && d.circ.sub === 'circle' && d.circ.T > 0.5, 60 * 4);
  game.combat.spearHit(p, d, d.hurtboxes()[1], { x: d.x, y: d.y - 150 }, { charge: 1, full: true });
  const fell_7 = d.circ && d.circ.sub === 'fall';
  until(() => !d.circ, 60 * 3);
  check('A Frostpiercer spear brings Sunfyre down out of its flight, open to the blade', fell_7 && d.vulnerable);
  // ---- 5. Frostbrand: precision dodges and weak points restore ice; the ward blocks one great fire attack
  d = toBoss7(0); p = lm.player; quiet7(d);
  p.ice.energy = 10;
  d.facing = -1; p.x = d.x - 300; p.facing = 1;
  d.beginAttack('bite', p);
  until(() => d.state === 'telegraph' && d.telegraphDur - d.t < 0.1, 60 * 2);
  press('ShiftLeft');
  until(() => d.state === 'recovery', 60 * 2);
  const afterDodge = p.ice.energy;
  check('A precision dodge (a blow through the roll) restores Frostbrand\'s ice energy', afterDodge >= 10 + 18 && p.hp === p.maxHp,
        `ice ${afterDodge}`);
  d = toBoss7(0); p = lm.player; quiet7(d);
  p.ice.energy = 60; p.x = d.x - 500; d.facing = -1; p.facing = 1;
  d.beginAttack('golden_breath', p);
  until(() => d.state === 'telegraph' && d.telegraphDur - d.t < 0.2, 60 * 2);
  key('KeyS', true);
  until(() => d.state === 'recovery', 60 * 3);
  key('KeyS', false); tick(2);
  const wardCd = p.ice.wardCd;
  check('The ice ward (S with Frostbrand) blocks a major fire attack, then must recover', p.hp === p.maxHp &&
        p.ice.wardUsed && wardCd > 10, `cooldown ${wardCd.toFixed(1)}s`);
  // the Glacial Wave costs ice and runs along the floor
  d = toBoss7(0); p = lm.player; quiet7(d);
  p.ice.energy = 100; p.x = d.x - 700; p.facing = 1; p.specialCd = 0; tick(1);
  const hpW_7 = d.hp;
  key('KeyK', true); tick(60); key('KeyK', false);
  until(() => d.hp < hpW_7, 60 * 2);
  check('Glacial Wave (hold K): spends ice energy; a wave of ice runs along the floor and strikes the dragon',
        p.ice.energy <= 100 - WEAPONS.frostbrand.special.cost + 15 && d.hp < hpW_7);
  // ---- 6. Vermithor: the stomp marks a foreleg; Frostbrand freezes it, the Steel Sword cannot
  d = toBoss7(1); p = lm.player; quiet7(d);
  check('After Sunfyre falls, Vermithor waits in the next arena; Sunfyre is gone', lm.dragons.length === 1 &&
        lm.dragon.def === ENEMIES.vermithor);
  p.x = d.x - 700; d.facing = -1;
  d.beginAttack('stomp', p);
  let waves7 = 0;
  until(() => { waves7 = Math.max(waves7, game.hazards.list.filter(h => h.kind === 'shock').length); return !!d.weakMark; }, 60 * 4);
  const markAt = d.weakAnchor();
  p.switchTo(1, true);                                  // the Steel Sword
  p.x = markAt.x - 120; p.facing = 1; tick(16); press('KeyJ'); tick(14);
  const steelNoFreeze = d.state !== 'frozen' && !!d.weakMark;
  until(() => p.state === 'move', 60);
  p.switchTo(0, true);                                  // Frostbrand
  p.x = markAt.x - 120; tick(16); press('KeyJ'); tick(14);
  check('Vermithor\'s stomp sends shockwaves; a foreleg is marked; only Frostbrand freezes it open', waves7 >= 2 &&
        steelNoFreeze && d.state === 'frozen' && d.vulnerable);
  // Bronze Inferno: a full spear in the wind-up breaks it
  d = toBoss7(1); p = lm.player; quiet7(d);
  p.x = d.x - 800; d.facing = -1; p.facing = 1;
  d.beginAttack('bronze_inferno', p);
  tick(10);
  game.combat.spearHit(p, d, d.hurtboxes()[1], { x: d.x, y: d.y - 150 }, { charge: 1, full: true });
  check('Bronze Inferno is a long charged attack; a full Frostpiercer hit in its wind-up breaks it',
        d.attack === null || d.state === 'stagger');
  // his charge smashes timber cover
  d = toBoss7(1); p = lm.player; quiet7(d);
  const bar7 = lm.level.props.find(pr => pr.id === 'timber_barricade' && pr.solid && pr.solid.x > 8000);
  if (bar7) {
    d.x = 7300; d.facing = 1; p.x = bar7.solid.x + 300;
    d.beginAttack('charge', p);
    until(() => d.state === 'recovery', 60 * 4);
  }
  check('Vermithor\'s charge smashes temporary timber cover', bar7 && bar7.broken);
  // ---- 7. Balerion: phases, firestorm, the reversal, the Black Dread, and the core
  d = toBoss7(2); p = lm.player; quiet7(d);
  const ph1_7 = d.phase;
  d.takeDamage(d.maxHp * 0.4, 'physical', 0, { force: true });
  const ph2_7 = d.phase;
  d.takeDamage(d.maxHp * 0.4, 'physical', 0, { force: true });
  check('Balerion: Phase II at 65%, Phase III at 30%', ph1_7 === 0 && ph2_7 === 1 && d.phase === 2);
  d = toBoss7(2); p = lm.player; quiet7(d);
  d.phase = 1;
  d.beginAttack('firestorm', p);
  until(() => game.hazards.list.some(h => h.kind === 'firezone'), 60 * 2);
  const zones7 = game.hazards.list.filter(h => h.kind === 'firezone');
  const markedFirst = zones7.every(z => !z.live);
  until(() => zones7.some(z => z.live), 60 * 3);
  check('Firestorm: zones of the walkway are marked, then erupt (the safe ground moves)', zones7.length === 3 && markedFirst);
  d = toBoss7(2); p = lm.player; quiet7(d);
  d.phase = 1; d.x = 11400; d.facing = -1; p.x = 10900;
  d.beginAttack('reversal', p);
  until(() => d.state === 'active', 60 * 3);
  p.x = 11900;                                          // slipped round behind him
  let turned = false;
  until(() => { if (d.reversed) turned = true; return d.state === 'recovery'; }, 60 * 5);
  check('Phase II: the reversal whips round to punish a warrior who rolled through', turned && d.facing === 1);
  // the Black Dread: lethal in the open, an ice pillar shelters, the ward holds
  const dread = where => {
    const dr = toBoss7(2); const pl = lm.player; quiet7(dr);
    dr.phase = 2; dr.x = 11600; dr.facing = where === 'shelter' ? -1 : 1;
    pl.x = where === 'shelter' ? 10950 : 12000; pl.facing = where === 'shelter' ? 1 : -1; pl.ice.energy = 100;
    dr.beginAttack('black_dread', pl);
    until(() => dr.state === 'telegraph' && dr.telegraphDur - dr.t < 0.3, 60 * 5);
    if (where === 'ward') key('KeyS', true);
    until(() => dr.state === 'recovery' || !pl.alive, 60 * 3);
    key('KeyS', false);
    return pl;
  };
  const open7 = dread('open'), shelter7 = dread('shelter'), ward7 = dread('ward');
  check('The Black Dread: in the open it kills; behind an ice pillar you live; the ice ward holds against it',
        !open7.alive && shelter7.alive && ward7.alive && ward7.hp === ward7.maxHp);
  d = toBoss7(2); p = lm.player; quiet7(d);
  d.phase = 2;
  d.takeDamage(1e7, 'physical', 0, { force: true });
  const floor7 = d.alive && d.hp === 1;
  d.openCoreWindow();
  const c7 = d.coreAnchor();
  p.x = c7.x - 140; p.facing = 1; tick(1); press('KeyJ'); tick(14);
  const bared = d.coreOpen;
  game.combat.spearHit(p, d, d.hurtboxes()[1], c7, { charge: 1, full: true });
  check('Balerion cannot die to anything but the core: a Frostbrand strike in its glow bares it; a blow to it ends him',
        floor7 && bared && !d.alive);
  // ---- 8. victory: reward once, saved; Aegon only after Balerion
  d = toBoss7(2); p = lm.player; quiet7(d);
  const r7 = P7.sagaRecord(7);
  r7.rewarded = r7.rewarded.filter(x => x !== 'balerion');
  const g7a = P7.data.gold;
  d.phase = 2; d.coreExposed = 5;
  d.takeDamage(1e7, 'physical', 0, { force: true, core: true });
  until(() => lm.saga.state === 'victory', 60 * 6);
  const g7b = P7.data.gold;
  const savedNow = new ProgressionManager(new SaveManager('dragonslayer.smoke-test')).sagaRecord(7);
  until(() => lm.saga.state === 'travel', 60 * 6);
  check('A boss victory pays its reward once and is saved at once; only then does Aegon wait in the last arena',
        g7b - g7a === 450 && savedNow.cleared.includes('balerion') && lm.dragon.duelist && lm.saga.index === 3,
        `+${g7b - g7a} gold`);
  sagaRun(['sunfyre', 'vermithor']);
  const replayGold = P7.data.gold;
  toBoss7(2); d = lm.dragon; quiet7(d);
  d.phase = 2; d.coreExposed = 5;
  d.takeDamage(1e7, 'physical', 0, { force: true, core: true });
  until(() => lm.saga.state === 'victory', 60 * 6);
  check('Beating a boss again never pays its reward twice', P7.data.gold === replayGold);
  // ---- 9. death restarts the current encounter
  d = toBoss7(1); p = lm.player;
  p.takeHit(1e6, d.x, 300);
  until(() => game.mode === 'results', 60 * 6);
  const defeatShown = game.ui.screen === 'defeat';
  game.restart();
  check('Death restarts the current encounter: Vermithor again, Sunfyre still fallen', defeatShown &&
        lm.saga.index === 1 && lm.dragon.def === ENEMIES.vermithor && P7.sagaRecord(7).cleared.includes('sunfyre') &&
        lm.player.x < lm.cfg.arena.start);
  // ---- 10. the duel
  d = toBoss7(3); p = lm.player;
  press('KeyF'); tick(4);
  check('Aegon: a duel - the Frostpiercer is disabled', d.duelist && p.state !== 'fp' && p.fp.disabled);
  const moves7 = {};
  for (const id of ['combo', 'heavy', 'guard']) {
    d = toBoss7(3); p = lm.player; for (const k in d.cooldowns) d.cooldowns[k] = 999;
    d.x = (lm.cfg.arena.start + lm.cfg.arena.end) / 2; p.x = d.x - 600; tick(1);
    d.begin(id, p);
    const tele = d.telegraphFor || 0;
    const seen = new Set();
    until(() => { seen.add(d.state); return d.state === 'idle' || d.state === 'walk'; }, 60 * 5);
    moves7[id] = { seen: [...seen].join('>'), tele };
  }
  check('Aegon fights with fast combinations, delayed heavy blows (a late, varying wind-up), and a parry stance',
        moves7.combo.seen.includes('strike') && moves7.heavy.tele >= ENEMIES.aegon.attacks.heavy.telegraph &&
        moves7.heavy.seen.includes('strike') && moves7.guard.seen.includes('guard'), JSON.stringify(moves7));
  // a perfect parry: S pressed as the blow lands
  d = toBoss7(3); p = lm.player; for (const k in d.cooldowns) d.cooldowns[k] = 999;
  d.x = (lm.cfg.arena.start + lm.cfg.arena.end) / 2;
  p.x = d.x - 230; p.facing = 1; d.facing = -1; p.hp = p.maxHp; tick(1);
  d.begin('heavy', p);
  until(() => d.state === 'strike', 60 * 3);
  key('KeyS', true);
  until(() => d.state !== 'strike', 60);
  key('KeyS', false);
  check('A perfect parry (S as the blow lands) leaves Aegon reeling, the warrior unhurt', d.state === 'stagger' &&
        p.hp === p.maxHp);
  // a late block: some damage
  d = toBoss7(3); p = lm.player; for (const k in d.cooldowns) d.cooldowns[k] = 999;
  d.x = (lm.cfg.arena.start + lm.cfg.arena.end) / 2;
  p.x = d.x - 230; p.facing = 1; d.facing = -1; p.hp = p.maxHp; key('KeyS', true); tick(30);
  d.begin('combo', p);
  until(() => d.state === 'recovery', 60 * 4);
  key('KeyS', false);
  check('A held block stops most of a blow', p.hp < p.maxHp && p.hp > p.maxHp * 0.6, `${Math.round(p.hp)} / ${p.maxHp}`);
  // his guard parries a careless strike and counters
  d = toBoss7(3); p = lm.player; for (const k in d.cooldowns) d.cooldowns[k] = 999;
  d.x = (lm.cfg.arena.start + lm.cfg.arena.end) / 2;
  p.x = d.x - 200; p.facing = 1; d.facing = -1; tick(1);
  d.begin('guard', p);
  press('KeyJ');
  let parried7 = false;
  until(() => { if (d.state === 'counter') parried7 = true; return parried7; }, 60 * 2);
  check('Struck while in his guard, Aegon parries and counters', parried7);
  // a whiff out of reach: the dash
  d = toBoss7(3); p = lm.player; for (const k in d.cooldowns) d.cooldowns[k] = 999;
  d.x = (lm.cfg.arena.start + lm.cfg.arena.end) / 2; d.idleFor = 999;
  p.x = d.x - 420; p.facing = 1; d.facing = -1; d.def.punishWhiff.chance = 1; tick(2);
  press('KeyJ');
  until(() => d.attackId === 'dash', 60);
  d.def.punishWhiff.chance = 0.75;
  check('A careless swing out of reach is punished by his forward dash', d.attackId === 'dash');
  // Frostbrand against a man: a slow, never a freeze
  d = toBoss7(3); p = lm.player; for (const k in d.cooldowns) d.cooldowns[k] = 999; d.idleFor = 999;
  game.combat.applyToDragon(p, d, { x: d.x, y: d.y - 150 }, { mul: 0.5, wave: true }, p.loadout[0]);
  check('Frostbrand is balanced against Aegon: its wave slows him a little and never freezes him',
        d.slowTimer > 0 && d.state !== 'frozen');
  // the burning phase, then his defeat
  d = toBoss7(3); p = lm.player; for (const k in d.cooldowns) d.cooldowns[k] = 999;
  d.hp = Math.round(d.maxHp * 0.302);
  d.takeHit(p, { x: d.x, y: d.y - 150 }, { mul: 1 }, p.weapon);
  check('At 30% Blackfyre burns: a faster final phase', d.phase === 1 && d.flaming && d.speedMul > 1.2);
  const before7 = { gold: P7.data.gold, ach: (P7.data.achievements || []).filter(a => a === 'north_remembers').length };
  d.hp = 1;
  d.takeHit(p, { x: d.x, y: d.y - 150 }, { mul: 1 }, p.weapon);
  const kneeling = d.state === 'defeat' && !d.defeated && lm.phase === 'arena' && !lm.ending;
  until(() => lm.saga.state === 'ceremony', 60 * 8);
  const notYet = !P7.isLevelCleared(7) || game.mode === 'playing';
  check('Aegon kneels; only when his defeat completes does the ceremony begin (the level is not yet complete)',
        kneeling && !!lm.ending && notYet && game.mode === 'playing');
  // ---- 11. THE NORTH REMEMBERS
  const e7 = lm.ending;
  until(() => e7.t >= 14.5, 60 * 16);
  const titled = e7.full && e7.t >= 13;
  until(() => game.mode === 'results', 60 * 20);
  const res7 = lm.result;
  check('The ending plays (snow, the pull-back, fade to black, THE NORTH REMEMBERS) and only then the level completes',
        titled && res7 && res7.saga && P7.isLevelCleared(7) && game.ui.screen === 'victory' &&
        !!game.ui.root.querySelector('.saga'));
  check('The completion screen: all four bosses, gold, XP, weapons, time and deaths', res7 &&
        res7.bosses.length === 4 && res7.runGold >= res7.gold && Array.isArray(res7.weapons) &&
        Number.isFinite(res7.runTime) && Number.isFinite(res7.deaths));
  // player-supplied film clips stretch the ending: each video gets its own slot
  const fake7 = (id, type, duration) => ({ get: k => (k === id ? { id, type, duration, el: {} } : null) });
  const base7 = timeline(null), v1 = timeline(fake7('north_remembers', 'video', 2)),
    v2 = timeline(fake7('king_in_the_north', 'video', 15)), a1 = timeline(fake7('north_remembers', 'audio', 2));
  check('Film clips the player adds (assets/media) get their own place in the ending; without them nothing changes',
        !base7.clip1 && !base7.clip2 && v1.clip1 && v1.clip1.at >= base7.black && v1.title >= v1.clip1.at + 2 &&
        v1.voice === Infinity && v2.clip2 && v2.clip2.at > v2.title && v2.king >= v2.clip2.at + 15 &&
        v2.done >= base7.done + 13 && a1.audio1 && a1.title === base7.title && a1.voice === base7.voice);
  check('The voice line is never faked: without audio the ending reports a text fallback',
        ['subtitles', 'speech', 'file', 'muted'].includes(e7.voiceMode));
  check('"The King in the North" is recorded once as an achievement', res7.achievement &&
        P7.data.achievements.filter(a => a === 'north_remembers').length === 1 && before7.ach === 0);
  // a second completion pays the repeat reward, no second banner; the run record resets
  sagaRun(['sunfyre', 'vermithor', 'balerion']);
  until(() => lm.saga.state === 'travel', 60 * 12);
  lm.player.x = lm.cfg.arena.triggerX - 20; hold('KeyD', 20);
  until(() => lm.dragon.state === 'idle' && !lm.cutscene, 60 * 9);
  lm.dragon.hp = 1;
  lm.dragon.takeHit(lm.player, { x: lm.dragon.x, y: lm.dragon.y - 150 }, { mul: 1 }, lm.player.weapon);
  until(() => lm.ending, 60 * 8);
  lm.ending.t = 40;
  until(() => game.mode === 'results', 60 * 6);
  const res7b = lm.result;
  check('Completing Level 7 again pays the repeat reward and no second achievement', res7b && !res7b.first &&
        !res7b.achievement && P7.data.achievements.filter(a => a === 'north_remembers').length === 1 &&
        P7.sagaRecord(7).cleared.length === 0);
  // ---- 12. saves: reload keeps progress; broken saves are made safe
  P7.sagaRecord(7).cleared = ['sunfyre'];
  P7.persist();
  const reloaded_7 = new ProgressionManager(new SaveManager('dragonslayer.smoke-test'));
  const rr = reloaded_7.sagaRecord(7);
  check('After a reload, Level 7 progress and the Frostbrand grant are still there', rr.cleared.join() === 'sunfyre' &&
        rr.granted && reloaded_7.data.ownedWeapons.includes('frostbrand'));
  const sm = new SaveManager('dragonslayer.smoke-bad_7');
  localStorage.setItem('dragonslayer.smoke-bad_7', JSON.stringify({ gold: -40, saga: { 7: { cleared: 'sunfyre', deaths: -3,
    rewarded: [1, 'aegon', 'aegon'], time: 'x' } }, settings: 5, levels: 3 }));
  const bad_7 = sm.load();
  localStorage.setItem('dragonslayer.smoke-bad_7', '{not json');
  const worse = sm.load();
  sm.reset();
  check('Corrupted or missing save data is made safe', bad_7.gold === 0 && Array.isArray(bad_7.saga[7].cleared) &&
        bad_7.saga[7].cleared.length === 0 && bad_7.saga[7].deaths === 0 && bad_7.saga[7].rewarded.join() === 'aegon' &&
        bad_7.settings.muted === false && typeof bad_7.levels === 'object' && worse.level === 1);
  P7.resetSaga(7);

  const botStage7 = (i, maxSeconds) => {
    sagaRun(['sunfyre', 'vermithor', 'balerion', 'aegon'].slice(0, i));
    until(() => lm.saga.state === 'travel', 60 * 20);
    const bot = new Bot(game);
    lm.player.x = lm.cfg.arena.triggerX - 30;
    let t = 0;
    while (t < maxSeconds && game.mode === 'playing') {
      bot.step(DT); tick(1); t += DT;
      if (lm.stageDone || !lm.player.alive) break;
    }
    bot.release();
    return { won: lm.stageDone && lm.player.alive, t, boss: Math.round(lm.dragon.hp), hp: Math.round(lm.player.hp) };
  };
  const lv7 = P7.data.level;
  P7.data.level = 10;                                  // a warrior of the level a campaign brings here
  const runs7 = [0, 1, 2, 3].map(i => botStage7(i, 300));
  P7.data.level = lv7;
  check('Level 7 encounters played by the bot at warrior level 10 (reported only)', true,
        runs7.map((r, i) => `${['Sunfyre', 'Vermithor', 'Balerion', 'Aegon'][i]}: ${r.won ? 'won' : 'fell'} at ${r.t.toFixed(0)}s ` +
                            `(boss hp ${r.boss}, warrior ${r.hp})`).join('; '));
  P7.resetSaga(7);
}
