import { overlaps, rand } from '../core/math.js';
import { FROSTPIERCER, WEAPONS } from '../data/weapons.js';

// Damage rules in one place: player -> dragon (weapon, weak points,
// armor segments, resistances, poise) and dragon -> player (i-frames,
// fire resistance), plus hit feedback (hitstop, shake, sparks, numbers).

export class Combat {
  constructor(game) {
    this.game = game;
    this.texts = [];
    this.burnSum = 0;
    this.burnShown = 0;
  }

  reset() {
    this.texts.length = 0;
    this.burnSum = 0;
    this.burnShown = 0;
  }

  // Melee swing from the player. `swing.hitSet` stops one swing hitting twice.
  playerStrike(player, box, swing) {
    this.strikeProps(box, swing);
    let landed = false;
    for (const dragon of this.game.levels.dragons) if (this.strikeDragon(player, dragon, box, swing)) landed = true;
    return landed;
  }

  strikeDragon(player, dragon, box, swing) {
    if (!dragon || !dragon.hittable || swing.hitSet.has(dragon)) return false;
    // the part the blade overlaps most (an exposed part wins a tie)
    let part = null, best = 0;
    for (const hb of dragon.hurtboxes()) {
      if (!overlaps(box, hb.rect)) continue;
      const r = hb.rect;
      let area = (Math.min(box.x + box.w, r.x + r.w) - Math.max(box.x, r.x)) *
                 (Math.min(box.y + box.h, r.y + r.h) - Math.max(box.y, r.y));
      if (hb.seg && dragon.isExposed(hb.seg)) area *= 1.6;
      if (!dragon.segments && part) continue;          // older dragons: first listed box (head, then body)
      if (area > best) { best = area; part = hb; }
    }
    if (!part) return false;
    swing.hitSet.add(dragon);
    const r = part.rect;
    const point = {
      x: (Math.max(box.x, r.x) + Math.min(box.x + box.w, r.x + r.w)) / 2,
      y: (Math.max(box.y, r.y) + Math.min(box.y + box.h, r.y + r.h)) / 2,
    };
    const segment = dragon.segments ? part.seg || dragon.nearestSegment(point) : null;
    this.applyToDragon(player, dragon, point, { ...swing, weakPoint: part.id === 'head', segment, part: part.id });
    return true;
  }

  // Ice and cover the warrior is allowed to break (the frozen axe's prison).
  strikeProps(box, swing) {
    const level = this.game.levels.level;
    for (const sol of level.solids.slice()) {
      const pr = sol.prop;
      if (!pr || !pr.playerHits || pr.broken || swing.hitSet.has(pr)) continue;
      if (!overlaps(box, sol)) continue;
      swing.hitSet.add(pr);
      level.damageSolid(sol, swing.heavy ? 2 : 1, this.game);
      this.game.particles.ice(box.x + box.w / 2, box.y + box.h / 2, 12, 0.8);
      this.game.camera.shake(0.12);
      this.game.hitstop = Math.max(this.game.hitstop, 0.04);
    }
  }

  // Area effects (Frost Nova, Ember Wave) resolve through the same rules.
  areaStrike(player, point, opts) {
    const dragon = opts.dragon || this.game.levels.nearestDragon(point.x, point.y);
    if (!dragon || !dragon.hittable) return;
    const segment = dragon.segments ? dragon.nearestSegment(point) : null;
    this.applyToDragon(player, dragon, point, { ...opts, segment });
  }

  applyToDragon(player, dragon, point, opts, weapon = player.weapon) {
    const w = weapon;
    if (dragon.duelist) return dragon.takeHit(player, point, opts, w);       // Aegon: a man, not a dragon
    if (player.weaponsUsed) player.weaponsUsed.add(w.id);
    // Wing Guard: everything from the front glances off the raised wing
    if (dragon.guarding && (player.x - dragon.x) * dragon.facing > -80 && !opts.burnsThrough) {
      this.game.particles.sparks(point.x, point.y, 16, 'spark', 1.0);
      this.game.hitstop = Math.max(this.game.hitstop, 0.04);
      this.text(point.x, point.y - 30, 'BLOCKED', '#bfe4ff', 34);
      return 0;
    }
    let dmg = w.hitDamage(player, opts.mul ?? 1);
    // Molten Hide: a melee blow does little and burns the hand that struck it
    const M = dragon.def.moltenHide;
    if (dragon.moltenT > 0 && M && !opts.ranged) {
      dmg *= M.taken;
      this.burnPlayer(M.reflect, dragon.x);
    }
    const seg = opts.segment;
    let armor = null;
    if (seg && dragon.segments) {
      armor = dragon.armorHit(seg, w.def, opts);
      dmg *= armor.mul;
      // the frost meter fills on every hit, fastest on exposed flesh
      if (w.def.frostGain) {
        const gain = armor.exposed ? w.def.frostGain.exposed : w.def.frostGain.intact;
        w.frost = Math.min(1, w.frost + gain * (dragon.frostResist > 0 ? 0.5 : 1));
      }
    } else if (opts.weakPoint) {
      dmg *= dragon.def.weakPoint.mul;
    }
    if (seg === 'head' && armor && armor.exposed) dmg *= dragon.def.weakPoint.mul;
    dmg *= (w.def.vsDragon || 1) * (opts.vsDragon || 1) * (opts.extraMul || 1);
    const type = opts.type || w.def.type;
    const core = dragon.coreOpen && dragon.near(point, dragon.coreAnchor(), 170 * dragon.scale);
    const dealt = dragon.takeDamage(dmg, type, opts.poise ?? w.def.poise, { force: !!opts.force, core });
    if (this.game.audio) this.game.audio.play(dragon.lastHit === 'armor' ? 'clang' : 'hit', { x: point.x });
    // Frostbrand: it breaks marked attacks, freezes weak points and cracks the core
    if (w.def.frostbrand) {
      const r = dragon.frostbrandHit(point, { wave: !!opts.wave });
      const E = w.def.energy;
      player.gainIce(r.weak || dragon.isWeakAt(point, opts.hb) ? E.weak : E.hit);
    }
    if (opts.lifesteal) player.heal(dealt * opts.lifesteal);
    if (opts.frostStrike) this.frostStrike(dragon, w.def.special);
    // a spear thrust to the face stops a charge; a counter breaks a combo
    if (w.def.style === 'spear' && opts.part === 'head' && dragon.state === 'active' && dragon.attack &&
        dragon.attack.kind === 'charge') {
      dragon.chargeStopped = true;
      this.text(point.x, point.y - 80, 'CHARGE BROKEN', '#ffd36b', 44);
    }
    if (dragon.combo && armor && armor.exposed && dragon.state === 'recovery' && dragon.attack.kind === 'melee') {
      dragon.interruptCombo('COUNTERED!');
    }
    const heavy = opts.heavy || opts.weakPoint || (armor && armor.exposed);
    this.game.hitstop = Math.max(this.game.hitstop, heavy ? 0.09 : 0.055);
    this.game.camera.shake(heavy ? 0.28 : 0.14);
    const sprite = type === 'frost' ? 'ice' : type === 'fire' ? 'mid' : 'spark';
    this.game.particles.sparks(point.x, point.y, heavy ? 22 : 12, sprite);
    const resisted = (dragon.def.resist[type] ?? 1) < 1;
    let color = opts.weakPoint ? '#ffd36b' : resisted ? '#a8a29a' : type === 'frost' ? '#9fe0ff' : '#ffffff';
    let size = opts.weakPoint ? 54 : 42;
    let mark = opts.weakPoint ? '!' : '';
    if (armor) {
      if (armor.exposed) { color = '#ffb347'; size = 50; mark = '!'; }
      else {                                        // steel on plate: sparks, little damage
        color = '#8fa6c4';
        size = 32;
        mark = '';
        this.game.particles.sparks(point.x, point.y, 10, 'spark', 0.9);
      }
    } else if (dragon.lastHit === 'armor') {
      color = '#8fa6c4';
      size = 34;
      this.game.particles.sparks(point.x, point.y, 10, 'ice', 0.8);
    } else if (dragon.lastHit === 'vulnerable') {
      color = '#ffb347';
      size += 10;
    }
    if (dealt > 0) this.text(point.x, point.y - 30, Math.round(dealt) + mark, color, size);
    return dealt;
  }

  // Frostpiercer: the spear bursts in ice. It pierces armor; on a weak point
  // it freezes; a full charge breaks a great attack's wind-up; a flyer falls.
  spearHit(player, d, hb, point, spear) {
    const F = FROSTPIERCER, c = spear.charge, full = spear.full;
    const coreHit = d.coreOpen && d.near(point, d.coreAnchor(), 170 * d.scale);
    const weak = coreHit || d.isWeakAt(point, hb);
    let dmg = F.damage * (player.attackPower / 10) * (0.4 + 0.6 * c) * (weak ? F.weakMul : 1) * (full ? F.fullMul : 1);
    if (coreHit) dmg *= d.def.core.piercerMul;
    const airborne = d.y < d.floorY - 60;
    const a = d.attack, winding = d.state === 'telegraph' || d.state === 'active';
    const dealt = d.takeDamage(dmg, 'frost', 220 * c, { force: true, core: coreHit });
    player.fpStats.hit++;
    player.weaponsUsed.add('frostpiercer');
    this.game.particles.ice(point.x, point.y, 70, 1.6);
    this.game.particles.sparks(point.x, point.y, 24, 'ice', 1.4);
    this.game.camera.shake(full ? 0.7 : 0.45);
    this.game.hitstop = Math.max(this.game.hitstop, full ? 0.14 : 0.09);
    if (this.game.audio) { this.game.audio.play('shatter', { x: point.x }); this.game.audio.play('boom', { x: point.x, size: 0.3 }); }
    this.text(point.x, point.y - 40, `${Math.round(dealt)}${weak ? '  WEAK POINT' : ''}`, weak ? '#ffd36b' : '#bfe4ff',
              weak ? 50 : 40);
    if (weak && player.ice) player.gainIce(WEAPONS.frostbrand.energy.weak);
    if (!d.alive) return;
    if (airborne && d.knockDown('SPEARED OUT OF THE SKY!')) return;
    if (full && a && winding && d.state === 'telegraph' && a.interruptible) {
      d.interruptAttack(`${a.label || 'THE ATTACK'} BROKEN`, 2.2);
    } else if (full && weak && a && winding && a.major) {
      d.interruptAttack('SHATTERED!', 2.0);
    } else if (weak) {
      d.freeze(full ? F.fullFreeze : F.freeze, 'FROZEN!');
    } else {
      d.applySlow(0.5, 1.2);
    }
    if (d.alive && !d.vulnerable) d.vulnT = F.vulnerable;               // the ice opens it to the blade
    if (coreHit && full) {
      d.stunNext = true;
      this.text(d.x, d.floorY - 660, 'THE CORE IS SPEARED', '#ffd36b', 50);
    }
  }

  // Crossbow bolt: uses the weapon that loosed it; reaches a flying dragon.
  boltHit(player, weapon, dragon, hb, point, opts) {
    const airborne = dragon.y < dragon.floorY - 60;
    const segment = dragon.segments ? hb.seg || dragon.nearestSegment(point) : null;
    this.applyToDragon(player, dragon, point, {
      mul: opts.mul ?? 1, breakMul: opts.breakMul ?? 1, heavy: opts.heavy, segment, part: hb.id, ranged: true,
      weakPoint: hb.id === 'head', force: true, extraMul: airborne ? weapon.def.airborneMul ?? 1 : 1,
    }, weapon);
    if (airborne) this.text(point.x, point.y - 70, 'ON THE WING', '#ffd36b', 30);
  }

  // Lightbreaker's Dawnfire: burns through armor and the wing guard, sets
  // the dragon alight, and brings a flying dragon out of the sky.
  dawnfireHit(player, weapon, dragon, hb, point) {
    const sp = weapon.def.special;
    if (dragon.guarding) {
      dragon.guarding = false;
      this.text(point.x, point.y - 90, 'THE GUARD BURNS', '#ffd36b', 40);
    }
    dragon.knockDown('THE DAWNFIRE BRINGS IT DOWN!');
    const dmg = dragon.takeDamage(weapon.hitDamage(player, sp.boltMul), 'light', 200, { force: true });
    if (dragon.segments && hb.seg) dragon.armorHit(hb.seg, { armorBreak: 60, armorPen: 1 });
    dragon.burnT = sp.burn;
    dragon.burnNext = 0.5;
    dragon.burnTick = weapon.hitDamage(player, 0.6);
    this.game.particles.fire(point.x, point.y, { x: 0, y: -1 }, 600, 40, { spread: 1.6 });
    this.game.camera.shake(0.6);
    this.game.hitstop = Math.max(this.game.hitstop, 0.12);
    this.text(point.x, point.y - 40, `${Math.round(dmg)} DAWNFIRE`, '#fff0b0', 52);
  }

  // Gatechain Flail hook: hauls a flying dragon down, or tears a plate loose.
  hookHit(player, weapon, dragon, hb, point) {
    const sp = weapon.def.special;
    if (dragon.knockDown('HOOKED AND HAULED DOWN!')) {
      dragon.takeDamage(weapon.hitDamage(player, sp.damageMul), 'physical', 0, { force: true });
      this.game.camera.shake(0.7);
      return;
    }
    const segment = dragon.segments ? hb.seg || 'wing' : null;
    if (segment) {
      const r = dragon.armorHit(segment, { armorBreak: sp.armorBreak, armorPen: 0.4 });
      dragon.exposeSegment(segment, 1.2, false);
      const dmg = dragon.takeDamage(weapon.hitDamage(player, sp.damageMul) * r.mul, 'physical', 90, { force: true });
      this.text(point.x, point.y - 40, r.broke ? 'PLATE TORN LOOSE' : `${Math.round(dmg)}`, '#e8c46a', 38);
    } else {
      this.applyToDragon(player, dragon, point, { mul: sp.damageMul, ranged: true, force: true }, weapon);
    }
    this.game.particles.sparks(point.x, point.y, 20, 'spark', 1.1);
  }

  // Long Spear braced against a charge.
  spearImpale(player, dragon) {
    const sp = player.weapon.def.special;
    const head = dragon.hurtboxes()[0].rect;
    const point = { x: head.x + head.w / 2, y: head.y + head.h / 2 };
    this.game.camera.shake(0.9);
    this.game.hitstop = Math.max(this.game.hitstop, 0.16);
    this.game.particles.sparks(point.x, point.y, 40, 'spark', 1.6);
    this.text(point.x, point.y - 120, 'IMPALED!', '#ffd36b', 56);
    this.applyToDragon(player, dragon, point, { mul: sp.damageMul, poise: 400, heavy: true, segment: 'chest',
                                                breakMul: 3, force: true, burnsThrough: true });
    if (dragon.segments) dragon.exposeSegment('chest', 2.5, false);
    player.braceSpear = 0;
  }

  // War Hammer ground strike: the nearest part takes the blow, every plate
  // within reach takes armor damage.
  groundStrike(player, x, radius, breakMul) {
    const dragon = this.game.levels.nearestDragon(x);
    if (!dragon || !dragon.hittable || !dragon.segments) {
      if (dragon && dragon.hittable && Math.abs(dragon.x - x) < radius + 300) {
        this.areaStrike(player, { x, y: dragon.floorY - 80 }, { mul: player.weapon.def.special.damageMul, heavy: true });
      }
      return;
    }
    const data = dragon.anim.data;
    let nearest = null, nd = Infinity;
    for (const id of Object.keys(dragon.segments)) {
      if (!data[id]) continue;
      const c = dragon.frameToWorld(data[id]);
      const dx = Math.abs(c.x - x);
      if (dx > radius || c.y < dragon.floorY - 340) continue;
      if (dx < nd) { nd = dx; nearest = { id, c }; }
      else dragon.armorHit(id, player.weapon.def, { breakMul: breakMul * 0.6 });
    }
    if (nearest) {
      this.applyToDragon(player, dragon, nearest.c, { mul: player.weapon.def.special.damageMul, poise: 200, heavy: true,
                                                      segment: nearest.id, breakMul });
    }
  }

  frostStrike(dragon, sp) {
    const resisting = dragon.frostResist > 0;
    dragon.applySlow(sp.slow * (resisting ? 0.4 : 1), sp.slowTime * (resisting ? 0.5 : 1));
    if (dragon.state === 'telegraph' && !dragon.frostDelayed && !resisting) {
      dragon.telegraphDur += sp.delay;
      dragon.frostDelayed = true;
    }
    dragon.frostResist = sp.resist;
    this.game.particles.ice(dragon.x, dragon.floorY - 250, 60, 1.4);
    this.text(dragon.x, dragon.floorY - 560, resisting ? 'IT RESISTS THE COLD' : 'FROZEN SLOW', '#9fe0ff', 44);
  }

  // Assisted aim for bolts: an exposed part first, then the wing joints,
  // then the nearest part, inside a forward cone.
  aimFor(player, from) {
    let best = null, score = -Infinity;
    for (const dragon of this.game.levels.dragons) {
      if (!dragon.boltable) continue;
      for (const hb of dragon.hurtboxes()) {
        const c = { x: hb.rect.x + hb.rect.w / 2, y: hb.rect.y + hb.rect.h / 2 };
        const dx = (c.x - from.x) * player.facing;
        if (dx < 60) continue;
        const ang = Math.atan2(c.y - from.y, dx);
        if (ang < -0.8 || ang > 0.25) continue;
        let sc = -dx * 0.001;
        if (hb.seg && dragon.isExposed(hb.seg)) sc += 3;
        if (hb.seg === 'wing') sc += 1;
        if (sc > score) { score = sc; best = ang; }
      }
    }
    const a = best ?? -0.04;
    return player.facing > 0 ? a : Math.PI - a;
  }

  // Returns true if the hit landed (false while the player is invulnerable).
  hitPlayer(amount, type, sourceX, knockback = 400) {
    const p = this.game.levels.player;
    if (!p || this.game.levels.cutscene) return false;
    if (p.invulnerable) {
      if (p.state === 'dodge' && p.alive) p.onPrecisionDodge();
      return false;
    }
    if (type === 'fire' && p.warded) { p.wardBlock(amount >= 20); return false; }
    let dmg = amount * this.game.levels.damageMul;
    if (type === 'fire') dmg *= 1 - p.fireRes;
    dmg = Math.max(1, Math.round(dmg));
    // Vhagar's level: every blow takes a fixed share of the warrior's health (`hitFrac`)
    const boss = this.game.levels.bossCfg || {};
    if (boss.lethal) dmg = Math.max(dmg, Math.ceil(p.hp));
    else if (boss.hitFrac) dmg = Math.max(dmg, Math.round(p.maxHp * boss.hitFrac));
    p.takeHit(dmg, sourceX, knockback);
    if (!p.alive && (boss.lethal || boss.hitFrac)) this.text(p.x, p.y - 330, 'SLAIN', '#ff4a3a', 56);
    this.game.camera.shake(type === 'fire' ? 0.18 : 0.38);
    this.game.hitstop = Math.max(this.game.hitstop, 0.05);
    this.text(p.x, p.y - 270, '-' + dmg, '#ff6b5a', 40);
    return true;
  }

  // The Last Ember fills the arena (a roll cannot outlast it). Devastating,
  // but it leaves a warrior above 40% health standing.
  lastEmberHit(p, a, sourceX) {
    if (!p.alive || this.game.levels.cutscene) return;
    if (p.warded) { p.wardBlock(true); return; }                    // the ice ward holds against it
    let dmg = a.damageFrac * p.maxHp * (1 - p.fireRes);
    const boss = this.game.levels.bossCfg || {};
    if (boss.lethal || a.lethal) dmg = p.hp;                  // nothing survives it in the open
    else if (boss.hitFrac) dmg = Math.max(dmg, p.maxHp * boss.hitFrac);
    else if (!a.lethal && p.hp > p.maxHp * 0.4) dmg = Math.min(dmg, p.hp - 1);
    dmg = Math.max(1, Math.round(dmg));
    p.iframes = 0;
    if (p.state === 'dodge') p.setState('move');
    p.takeHit(dmg, sourceX, 900);
    this.game.camera.shake(0.8);
    this.text(p.x, p.y - 280, '-' + dmg, '#ff6b5a', 52);
  }

  // Damage over time from fire: fire ticks ignore the hurt-stun so the
  // player can still roll out, but still respect dodge i-frames.
  burnPlayer(amount, sourceX) {
    const p = this.game.levels.player;
    if (!p || !p.alive || this.game.levels.cutscene) return false;
    if (p.state === 'dodge' && p.invulnerable) { p.onPrecisionDodge(); return false; }
    if (p.warded) { p.wardBlock(false); return false; }
    let dmg = amount * this.game.levels.damageMul * (1 - p.fireRes);
    dmg = Math.max(1, Math.round(dmg));
    p.hp -= dmg;
    p.damageTaken += dmg;
    p.burning = 0.25;
    this.game.camera.shake(0.08);
    // burn numbers are grouped so they stay readable
    this.burnSum += dmg;
    if (this.game.levels.realTime - this.burnShown > 0.4) {
      this.text(p.x + rand(-30, 30), p.y - 260, '-' + this.burnSum, '#ff9a3a', 34);
      this.burnSum = 0;
      this.burnShown = this.game.levels.realTime;
    }
    if (p.hp <= 0) { p.hp = 0.01; p.takeHit(1, sourceX, 300); }
    return true;
  }

  // Damage from being thrown (applied at release, never from walls).
  throwDamage(amount, p) {
    const dmg = Math.max(1, Math.round(amount * this.game.levels.damageMul));
    p.hp -= dmg;
    p.damageTaken += dmg;
    p.flash = 0.18;
    this.text(p.x, p.y - 270, '-' + dmg, '#ff6b5a', 42);
    if (p.hp <= 0) { p.hp = 0.01; p.state = 'move'; p.takeHit(1, p.x + p.facing, 300); }
  }

  text(x, y, str, color, size) {
    this.texts.push({ x, y, str, color, size, t: 0, vx: rand(-40, 40) });
  }

  update(dt) {
    for (const t of this.texts) {
      t.t += dt;
      t.y -= 90 * dt;
      t.x += t.vx * dt;
    }
    this.texts = this.texts.filter(t => t.t < 0.9);
  }

  draw(ctx) {
    ctx.textAlign = 'center';
    for (const t of this.texts) {
      const a = 1 - Math.max(0, t.t - 0.5) / 0.4;
      ctx.globalAlpha = a;
      ctx.font = `700 ${t.size}px Cinzel, Georgia, serif`;
      ctx.lineWidth = 6;
      ctx.strokeStyle = 'rgba(10,8,8,0.85)';
      ctx.strokeText(t.str, t.x, t.y);
      ctx.fillStyle = t.color;
      ctx.fillText(t.str, t.x, t.y);
    }
    ctx.globalAlpha = 1;
  }
}
