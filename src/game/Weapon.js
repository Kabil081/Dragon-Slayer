import { STYLES, WEAPONS } from '../data/weapons.js';
import { damp } from '../core/math.js';
import { ChainHook, DawnfireBolt, EmberWave, FrostNova, IceWave } from './Hazards.js';

// A weapon = data from data/weapons.js + the behaviour of its K special.
// Each Weapon object also carries its per-battle state (crossbow bolts,
// the Frostbound Axe's frost meter), so switching weapons keeps it.
// To add a weapon: add data, add its sprite variant to the asset
// generator, and (if it needs a new special) add an entry to SPECIALS.

export class Weapon {
  constructor(id) {
    const def = WEAPONS[id];
    if (!def) throw new Error('Unknown weapon: ' + id);
    this.id = id;
    this.def = def;
    this.style = STYLES[def.style || 'sword'];
    if (!this.style) throw new Error(`Weapon ${id}: unknown style "${def.style}"`);
    this.special = SPECIALS[def.special.type];
    if (!this.special) throw new Error(`Weapon ${id}: no special behaviour "${def.special.type}"`);
    this.loaded = !!def.ammo;                 // a found crossbow comes loaded
    this.ammo = def.ammo ? def.ammo - 1 : 0;  // bolts left in the quiver
    this.frost = 0;                           // Frostbound Axe meter, 0..1
    this.hooks = def.special.uses ?? 0;       // Gatechain Flail throws left
  }

  get bolts() { return this.ammo + (this.loaded ? 1 : 0); }

  hitDamage(player, mul = 1) {
    return this.def.damage * (player.attackPower / 10) * mul;
  }

  startSpecial(player, game) {
    player.setState('special');
    player.specialCd = this.def.special.cooldown;
    player.specialData = {};
    this.special.start(player, this.def, game);
  }

  updateSpecial(player, dt, game) {
    return this.special.update(player, this.def, game, dt, player.specialData);
  }
}

const slash = (player, def, opts = {}) => {
  const sp = def.special;
  player.beginSwing({ mul: sp.damageMul, poise: sp.poise, frames: [2, 4], heavy: true, ...opts });
};

// Hold K to wind up (the apex frame is held), release to strike.
function charged(p, def, game, dt, d, onRelease) {
  const sp = def.special;
  const anim = p.weapon.style.anim;
  d.charge = Math.min(sp.charge, (d.charge || 0) + dt);
  p.anim.set(anim, 2);
  p.vx = damp(p.vx, 0, 12, dt);
  const k = d.charge / sp.charge;
  if (Math.random() < 0.3 + k) {
    const tip = p.toWorld(p.anim.data.tips[p.weapon.id]);
    game.particles.sparks(tip.x, tip.y, 1, k > 0.98 ? 'spark' : 'mid', 0.4);
  }
  if (!game.input.isDown('special') || d.charge >= sp.charge) {
    d.charging = false;
    d.power = 0.45 + 0.55 * k;
    p.anim.play(anim, { restart: true, speed: def.speed * 1.15, startFrame: 3 });
    onRelease(d.power);
  }
}

const SPECIALS = {
  // Frostbrand: hold K to gather the cold, release a wave of ice along the floor.
  ice_wave: {
    start(p, def, game) {
      const sp = def.special;
      if (!p.ice || p.ice.energy < sp.cost) {
        game.combat.text(p.x, p.y - 300, 'NOT ENOUGH ICE', '#a8b6c8', 30);
        p.specialCd = 0.4;
        p.specialData.skip = true;
        return;
      }
      p.specialData.charging = true;
      p.vx = 0;
    },
    update(p, def, game, dt, d) {
      if (d.skip) return { done: true };
      const sp = def.special;
      if (d.charging) {
        charged(p, def, game, dt, d, k => {
          p.ice.energy -= sp.cost;
          p.beginSwing({ mul: 1.2, poise: 60, frames: [3, 4], type: 'frost' });
          game.hazards.add(new IceWave(p, sp, k));
          game.camera.shake(0.3);
          game.particles.ice(p.x + p.facing * 80, game.levels.level.floorY - 40, 30, 1);
          if (game.audio) game.audio.play('ice', { x: p.x, gain: 1.4 });
        });
        if (Math.random() < 0.5) game.particles.ice(p.x + p.facing * 40, p.y - 120, 1, 0.3);
        return {};
      }
      p.vx = damp(p.vx, 0, 10, dt);
      p.updateSwing();
      return { done: p.anim.finished };
    },
  },
  // Lightbreaker's Dawnfire: the blade takes fire and hurls a crescent of
  // dawnfire at the dragon. Only `charges` times per battle.
  ignite: {
    start(p, def, game) {
      if (p.fireCharges <= 0) {
        game.combat.text(p.x, p.y - 300, 'THE FLAME IS SPENT', '#a8a29a', 30);
        p.specialCd = 0.5;
        return;
      }
      p.fireCharges--;
      p.ignited = def.special.duration;
      game.camera.shake(0.25);
      game.particles.fire(p.x, p.y - 140, { x: 0, y: -1 }, 420, 30, { spread: 1.2, collide: false });
      game.combat.text(p.x, p.y - 300, 'DAWNFIRE', '#ffb347', 40);
      const from = { x: p.x + p.facing * 60, y: p.y - 150 };
      game.hazards.add(new DawnfireBolt(p, from, game.combat.aimFor(p, from)));
    },
    update() { return { done: true }; },
  },
  // Gatechain Flail: throw the hook on its chain (a few times per battle).
  hook: {
    start(p, def, game) {
      const w = p.weapon;
      if (w.hooks <= 0) {
        game.combat.text(p.x, p.y - 300, 'THE HOOK IS LOST', '#a8a29a', 30);
        p.specialCd = 0.5;
        p.specialData.skip = true;
        return;
      }
      w.hooks--;
      p.anim.play('attack', { restart: true, speed: def.speed * 1.2, startFrame: 2 });
      const from = p.toWorld(p.anim.data.hand);
      game.hazards.add(new ChainHook(p, from, game.combat.aimFor(p, from)));
    },
    update(p, def, game, dt, d) {
      if (d.skip) return { done: true };
      p.vx = damp(p.vx, 0, 10, dt);
      return { done: p.anim.finished };
    },
  },
  long_sweep: {
    start(p, def) {
      p.anim.play('attack', { restart: true, speed: def.speed * 0.85 });
      slash(p, def, { frames: [1, 5], reach: def.special.reach, arc: true });
      p.vx = p.facing * 180;
    },
    update(p, def, game, dt) {
      p.vx = damp(p.vx, 0, 6, dt);
      p.updateSwing();
      return { done: p.anim.finished };
    },
  },
  rising_slash: {
    start(p, def) {
      p.anim.play('attack', { restart: true, speed: def.speed * 1.35, startFrame: 1 });
      slash(p, def);
      if (p.onGround) { p.vy = -820; p.onGround = false; }
      p.vx = p.facing * 260;
    },
    update(p) {
      p.updateSwing();
      return { done: p.anim.finished };
    },
  },
  lunge: {
    start(p, def, game) {
      p.anim.play('attack', { restart: true, speed: def.speed * 1.15, startFrame: 1 });
      slash(p, def);
      game.particles.dust(p.x, p.y, 8, -p.facing);
    },
    update(p, def, game, dt) {
      const t = p.stateTime;
      p.vx = t < 0.22 ? p.facing * (def.special.distance / 0.22) : damp(p.vx, 0, 12, dt);
      p.updateSwing();
      return { done: p.anim.finished };
    },
  },
  cleave: {
    start(p, def) {
      p.anim.play('attack', { restart: true, speed: def.speed * 0.8 });
      slash(p, def);
      p.vx = 0;
    },
    update(p, def, game, dt, d) {
      p.vx = damp(p.vx, 0, 10, dt);
      if (p.anim.frame >= 3 && !d.impact) {
        d.impact = true;
        game.camera.shake(0.45);
        const tip = p.toWorld(p.anim.data.tips[p.weapon.id]);
        game.particles.sparks(tip.x, game.levels.level.floorY - 10, 26, 'spark', 1.3);
        game.particles.dust(tip.x, game.levels.level.floorY, 14);
      }
      p.updateSwing();
      return { done: p.anim.finished };
    },
  },
  // Heavy Greatsword: charge, then an overhead blow with triple armor break.
  smash: {
    start(p) { p.specialData.charging = true; p.vx = 0; },
    update(p, def, game, dt, d) {
      const sp = def.special;
      if (d.charging) {
        charged(p, def, game, dt, d, k => p.beginSwing({
          mul: sp.damageMul * k, poise: sp.poise * k, heavy: true, breakMul: sp.breakMul * k, windows: [{ frames: [3, 5] }],
        }));
        return {};
      }
      p.vx = damp(p.vx, 0, 10, dt);
      if (p.anim.frame >= 4 && !d.impact) {
        d.impact = true;
        game.camera.shake(0.35 + 0.3 * d.power);
        const tip = p.toWorld(p.anim.data.tips[p.weapon.id]);
        game.particles.sparks(tip.x, game.levels.level.floorY - 10, 30, 'spark', 1.4);
        game.particles.debris(tip.x, game.levels.level.floorY - 10, 10, 60);
        game.particles.dust(tip.x, game.levels.level.floorY, 16);
      }
      p.updateSwing();
      if (!p.anim.finished) return {};
      d.rec = (d.rec ?? sp.recovery) - dt;              // the long recovery after the blow
      return { done: d.rec <= 0 };
    },
  },
  // War Hammer: charge, then slam the ground; every plate within reach cracks.
  ground_strike: {
    start(p) { p.specialData.charging = true; p.vx = 0; },
    update(p, def, game, dt, d) {
      const sp = def.special;
      if (d.charging) {
        charged(p, def, game, dt, d, k => p.beginSwing({
          mul: sp.damageMul * k, poise: sp.poise * k, heavy: true, breakMul: sp.breakMul * k, windows: [{ frames: [3, 5] }],
        }));
        return {};
      }
      p.vx = damp(p.vx, 0, 10, dt);
      if (p.anim.frame >= 4 && !d.impact) {
        d.impact = true;
        const floor = game.levels.level.floorY;
        const x = p.x + p.facing * 120;
        game.camera.shake(0.5 + 0.3 * d.power);
        game.particles.debris(x, floor - 10, 22, 120);
        game.particles.dust(x, floor, 26);
        game.combat.groundStrike(p, x, sp.radius * (0.7 + 0.3 * d.power), sp.breakMul * d.power);
      }
      p.updateSwing();
      if (!p.anim.finished) return {};
      d.rec = (d.rec ?? sp.recovery) - dt;
      return { done: d.rec <= 0 };
    },
  },
  // Twin Daggers: a burst of stabs, each its own hit.
  flurry: {
    start(p, def) {
      p.specialData.hits = 0;
      p.specialData.next = 0;
    },
    update(p, def, game, dt, d) {
      const sp = def.special;
      d.next -= dt;
      if (d.next <= 0 && d.hits < sp.hits) {
        d.hits++;
        d.next = 0.09;
        p.anim.play('daggers', { restart: true, speed: def.speed * 2.4, startFrame: d.hits % 2 ? 0 : 2 });
        p.beginSwing({ mul: sp.damageMul, poise: 4, windows: [{ frames: [1, 1] }, { frames: [3, 3], offhand: true }] });
      }
      p.vx = damp(p.vx, p.facing * 60, 8, dt);
      p.updateSwing();
      return { done: d.hits >= sp.hits && d.next <= -0.12 };
    },
  },
  // Long Spear: set the butt against the ground. A charge that meets the
  // point impales itself (resolved in DragonAttacks charge).
  brace: {
    start(p, def, game) {
      p.anim.set('thrust', 3);
      p.braceSpear = def.special.duration;
      p.vx = 0;
      game.particles.dust(p.x, p.y, 6);
    },
    update(p, def, game, dt) {
      p.anim.set('thrust', 3);
      p.vx = 0;
      p.braceSpear = Math.max(0, p.braceSpear - dt);
      return { done: p.braceSpear <= 0 };
    },
  },
  // Hunter's Crossbow: a heavy bolt that costs two from the quiver.
  pin_shot: {
    start(p, def, game) {
      const w = p.weapon, sp = def.special;
      if (!w.loaded || w.ammo < sp.ammo - 1) {
        game.combat.text(p.x, p.y - 300, 'NEED TWO BOLTS', '#a8a29a', 28);
        p.specialCd = 0.4;
        p.specialData.skip = true;
        return;
      }
      w.ammo -= sp.ammo - 1;
      w.loaded = false;
      p.anim.play('shoot', { restart: true, speed: 0.8 });
    },
    update(p, def, game, dt, d) {
      if (d.skip) return { done: true };
      const sp = def.special;
      if (p.anim.frame >= 2 && !d.fired) {
        d.fired = true;
        p.fireBolt({ mul: sp.damageMul, breakMul: sp.breakMul, heavy: true });
      }
      return { done: p.anim.finished };
    },
  },
  // Frostbound Axe: spends a full frost meter on a freezing blow.
  frost_strike: {
    start(p, def, game) {
      const w = p.weapon;
      if (w.frost < 1) {
        game.combat.text(p.x, p.y - 300, 'FROST NOT READY', '#9fc7ff', 28);
        p.specialCd = 0.4;
        p.specialData.skip = true;
        return;
      }
      w.frost = 0;
      p.anim.play('attack', { restart: true, speed: def.speed * 0.9 });
      slash(p, def, { type: 'frost', frostStrike: true });
      game.particles.ice(p.x + p.facing * 60, p.y - 120, 30, 1.0);
    },
    update(p, def, game, dt, d) {
      if (d.skip) return { done: true };
      p.vx = damp(p.vx, 0, 10, dt);
      p.updateSwing();
      return { done: p.anim.finished };
    },
  },
  frost_nova: {
    start(p, def) {
      p.anim.play('attack', { restart: true, speed: def.speed * 1.2 });
      slash(p, def, { mul: 1, poise: def.poise });
    },
    update(p, def, game, dt, d) {
      p.vx = damp(p.vx, 0, 10, dt);
      if (p.anim.frame >= 3 && !d.cast) {
        d.cast = true;
        game.hazards.add(new FrostNova(p, def.special));
      }
      p.updateSwing();
      return { done: p.anim.finished };
    },
  },
  ember_wave: {
    start(p, def) {
      p.anim.play('attack', { restart: true, speed: def.speed * 1.1 });
      slash(p, def, { mul: 1, poise: def.poise });
    },
    update(p, def, game, dt, d) {
      p.vx = damp(p.vx, 0, 10, dt);
      if (p.anim.frame >= 3 && !d.cast) {
        d.cast = true;
        game.hazards.add(new EmberWave(p, def.special));
      }
      p.updateSwing();
      return { done: p.anim.finished };
    },
  },
  bane_strike: {
    start(p, def) {
      p.anim.play('attack', { restart: true, speed: def.speed * 0.9 });
      slash(p, def, { vsDragon: 1.5, lifesteal: def.special.lifesteal });
    },
    update(p, def, game, dt) {
      p.vx = damp(p.vx, p.anim.frame >= 2 && p.anim.frame <= 3 ? p.facing * 380 : 0, 12, dt);
      const tip = p.toWorld(p.anim.data.tips[p.weapon.id]);
      game.particles.add({ kind: 'dot', sprite: 'gold', x: tip.x, y: tip.y, vx: 0, vy: -40, max: 0.35,
                           size: 26, size1: 4, layer: 'front' });
      p.updateSwing();
      return { done: p.anim.finished };
    },
  },
};

