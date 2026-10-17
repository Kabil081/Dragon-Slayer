import { clamp, overlaps, rand, weightedPick } from '../core/math.js';
import { Animator } from './Animator.js';

// Aegon Targaryen, the Conqueror: the Level 7 duel. A swordsman, not a
// dragon, but he fills the same slot (LevelManager.dragons) so the HUD,
// combat and hazards treat him alike.
//
//   dormant -> intro (salute) -> idle <-> walk
//   idle -> telegraph -> strike(s) -> recovery -> idle
//   guard (parry stance): struck from the front he parries and counters
//   stagger (poise broken, a perfect parry, his guard broken by ice)
//   hp 0 -> defeat (kneels) -> defeated once the animation completes
//
// Every blow shows a glint on Blackfyre first. The warrior answers with a
// roll, a block (hold S: most of the blow is stopped) or a perfect parry
// (S pressed just before the blow lands: he reels, wide open). From 30%
// Blackfyre burns: faster, fewer pauses, and the blows are fire (the ice
// ward stops one).

export class Duelist {
  constructor(game, def, { x, floorY, arena }) {
    this.game = game;
    this.def = def;
    this.duelist = true;
    this.sprite = game.assets.manifest[def.sprite];
    if (!this.sprite) throw new Error(`Duelist sprite "${def.sprite}" is not in the manifest`);
    // anchors the HUD and markers expect from a boss: a head and a chest
    this.animations = {};
    for (const [name, a] of Object.entries(this.sprite.animations)) {
      this.animations[name] = { ...a, per_frame: a.per_frame.map(f => ({ ...f, head: [f.shoulder[0] + 4, f.shoulder[1] - 24],
                                                                            chest: [f.shoulder[0], f.shoulder[1] + 22] })) };
    }
    this.anim = new Animator(this.animations);
    this.anim.play('idle');
    this.scale = def.scale;
    this.pxScale = def.scale;
    this.x = x;
    this.y = floorY;
    this.floorY = floorY;
    this.facing = -1;
    this.arena = arena;
    this.maxHp = def.maxHp;
    this.hp = def.maxHp;
    this.phase = 0;
    this.life = 1;
    this.lifeDamage = [0, 0];
    this.poiseDmg = 0;
    this.events = [];
    this.segments = null;
    this.state = 'dormant';
    this.t = 0;
    this.attack = null;
    this.attackId = null;
    this.cooldowns = { guard: 3 };
    this.slowTimer = 0;
    this.slowAmount = 0;
    this.flash = 0;
    this.defeated = false;
    this.idleFor = 0.8;
    this.glint = 0;
    this.clock = 0;
  }

  get alive() { return this.hp > 0; }
  get active() { return this.state !== 'dormant'; }
  get inCutscene() { return false; }
  get inCustom() { return false; }
  get hittable() { return this.alive && !['dormant', 'intro', 'defeat'].includes(this.state); }
  get boltable() { return false; }
  get telegraphing() { return this.state === 'telegraph'; }
  get flaming() { return !!this.def.phases[this.phase].flaming; }
  get speedMul() { return this.def.phases[this.phase].speedMul * (this.slowTimer > 0 ? 1 - this.slowAmount : 1); }
  get busy() { return this.state === 'telegraph' || this.state === 'strike'; }
  get vulnerable() { return this.state === 'stagger'; }
  get coreOpen() { return false; }

  isExposed() { return false; }
  isWeakAt() { return this.state === 'stagger'; }
  frostbrandHit() { return { weak: false }; }
  freeze() { return false; }
  knockDown() { return false; }
  interruptAttack() { return false; }
  applySlow(amount, time) { this.slowAmount = amount; this.slowTimer = time; }
  makeVulnerable() {}
  drawWarnings() {}

  sfx(name, o = {}) { if (this.game.audio) this.game.audio.play(name, { x: this.x, ...o }); }

  frameToWorld(p) {
    const piv = this.sprite.pivot;
    return { x: this.x + (p[0] - piv[0]) * this.scale * this.facing, y: this.y + (p[1] - piv[1]) * this.scale };
  }

  hurtboxes() {
    const H = this.def.hurtbox;
    const body = { x: this.x - H.w / 2, y: this.y - H.h, w: H.w, h: H.h };
    const head = { x: this.x - 30, y: this.y - H.h - 10, w: 60, h: 60 };
    return [{ id: 'head', seg: null, rect: head }, { id: 'body', seg: null, rect: body }];
  }

  setState(s) {
    this.state = s;
    this.t = 0;
  }

  startIntro() {
    const p = this.game.levels.player;
    this.facing = p && p.x > this.x ? 1 : -1;
    this.setState('intro');
    this.anim.play('salute', { restart: true, speed: 0.6 });
  }

  // ---------------------------------------------------------------- update
  update(dt, player) {
    if (this.state === 'dormant') return;
    this.clock += dt;
    this.flash = Math.max(0, this.flash - dt);
    this.glint = Math.max(0, this.glint - dt);
    this.slowTimer = Math.max(0, this.slowTimer - dt);
    for (const id in this.cooldowns) this.cooldowns[id] = Math.max(0, this.cooldowns[id] - dt);
    if (this.state !== 'stagger') this.poiseDmg = Math.max(0, this.poiseDmg - this.def.poiseRegen * dt);
    const k = this.speedMul;
    const ddt = dt * k;
    this.t += ddt;
    switch (this.state) {
      case 'intro':
        if (this.anim.finished && this.t > 2.2) this.enterIdle(0.6);
        break;
      case 'idle':
      case 'walk':
        this.updateFootwork(ddt, player);
        break;
      case 'telegraph': this.updateTelegraph(ddt, player); break;
      case 'strike': this.updateStrike(ddt, player); break;
      case 'guard': this.updateGuard(ddt, player); break;
      case 'counter': this.updateCounter(ddt, player); break;
      case 'recovery':
        this.anim.set(this.attack ? this.attack.anim : 'idle', Math.max(0, this.anim.def.frames - 2));
        if (this.t >= this.recoveryFor) this.enterIdle(rand(0.2, 0.45));
        break;
      case 'stagger':
        this.anim.set('hurt', this.t < 0.3 ? 0 : 1);
        this.x = clamp(this.x - this.facing * 120 * dt * Math.max(0, 1 - this.t), this.arena.start + 120, this.arena.end - 120);
        if (this.t >= this.staggerFor) this.enterIdle(0.25);
        break;
      case 'defeat':
        if (Math.random() < 0.3 && this.flamingDeath) this.bladeFire(1);
        if (this.anim.finished && this.t > 3.2) this.defeated = true;
        break;
    }
    if (this.flaming && this.alive) this.bladeFire(2);
    this.anim.update(ddt);
    this.x = clamp(this.x, this.arena.start + 100, this.arena.end - 100);
  }

  enterIdle(time) {
    this.setState('idle');
    this.attack = null;
    this.attackId = null;
    this.idleFor = time / this.def.phases[this.phase].speedMul;
    this.anim.play('idle');
  }

  facePlayer(player) { this.facing = player.x > this.x ? 1 : -1; }

  dist(player) { return Math.abs(player.x - this.x); }

  // Keep at sword's length; step in or out, then choose.
  updateFootwork(dt, player) {
    this.facePlayer(player);
    const d = this.dist(player);
    const [lo, hi] = this.def.keepAt;
    let dir = 0;
    if (d > hi) dir = this.facing;
    else if (d < lo - 60) dir = -this.facing;
    if (dir) {
      this.state = 'walk';
      this.anim.play('walk', { speed: dir === this.facing ? 1 : 0.7 });
      this.x += dir * this.def.moveSpeed * (dir === this.facing ? 1 : 0.55) * dt;
    } else {
      this.state = 'idle';
      this.anim.play('idle');
    }
    // a careless swing out of reach is punished by the dash
    const W = this.def.punishWhiff;
    if (player.state === 'attack' && player.swing && !player.swing.landed && d >= W.range[0] && d <= W.range[1] &&
        !this.whiffSeen && Math.random() < W.chance) {
      this.whiffSeen = true;
      this.begin('dash', player);
      return;
    }
    if (player.state !== 'attack') this.whiffSeen = false;
    if (this.t >= this.idleFor) this.decide(player);
  }

  decide(player) {
    if (!player.alive) { this.enterIdle(1); return; }
    const d = this.dist(player);
    const opts = [];
    for (const [id, a] of Object.entries(this.def.attacks)) {
      if (this.cooldowns[id] > 0) continue;
      if (d < a.range[0] || d > a.range[1]) continue;
      opts.push({ id, weight: a.weight });
    }
    if (!opts.length) { this.t = 0; this.idleFor = 0.2; return; }
    this.begin(weightedPick(opts).id, player);
  }

  begin(id, player) {
    const a = this.def.attacks[id];
    this.attack = a;
    this.attackId = id;
    this.cooldowns[id] = a.cooldown ?? 0;
    this.facePlayer(player);
    if (id === 'guard') {
      this.setState('guard');
      this.anim.play('guard', { restart: true });
      this.glint = 0.4;
      this.sfx('clang', { f: 900, gain: 0.4 });
      return;
    }
    const ph = this.def.phases[this.phase];
    this.hits = id === 'combo' ? Math.round(rand(a.hits[0], a.hits[1])) + (ph.extraHit || 0) : 1;
    this.hitN = 0;
    this.setState('telegraph');
    this.telegraphFor = a.telegraph + (a.hold ? rand(a.hold[0], a.hold[1]) : 0);   // the heavy blow comes late
    this.anim.play(a.anim, { restart: true });
    this.anim.set(a.anim, 0);
    this.glint = 0.5;
    this.sfx('swing', { gain: 0.4 });
  }

  updateTelegraph(dt, player) {
    const a = this.attack;
    const frames = a.anim === 'slash' ? [0, 1] : a.anim === 'heavy' ? [0, 1, 2] : [0, 1];
    const p = clamp(this.t / this.telegraphFor, 0, 0.999);
    this.anim.set(a.anim, frames[Math.floor(p * frames.length)]);
    if (this.t >= this.telegraphFor) this.startStrike(player);
  }

  startStrike(player) {
    const a = this.attack;
    this.setState('strike');
    this.struck = false;
    this.anim.play(a.anim, { restart: true, startFrame: a.anim === 'heavy' ? 3 : 2,
                             speed: a.anim === 'heavy' ? 1.3 : 1.6 });
    this.sfx('swing', { heavy: !!a.heavy, gain: 1.3 });
    if (this.attackId === 'dash') { this.dashFrom = this.x; this.dashDir = this.facing; }
  }

  // the cutting edge in front of him
  strikeBox(reach) {
    const x0 = this.facing > 0 ? this.x + 10 : this.x - 10 - reach;
    return { x: x0, y: this.floorY - 250, w: reach, h: 220 };
  }

  updateStrike(dt, player) {
    const a = this.attack;
    if (this.attackId === 'dash') {
      const step = a.speed * dt;
      this.x += this.dashDir * step;
      const done = Math.abs(this.x - this.dashFrom) >= a.distance || this.x <= this.arena.start + 110 ||
        this.x >= this.arena.end - 110;
      this.anim.set('thrust', 3);
      if (!this.struck && overlaps(this.strikeBox(a.reach), player.hurtbox)) this.connect(a, player);
      if (done) this.endAttack(a);
      return;
    }
    const strikeT = a.strike;
    if (!this.struck && this.t >= strikeT * 0.3 && this.t <= strikeT + 0.06) {
      if (overlaps(this.strikeBox(a.reach), player.hurtbox)) this.connect(a, player);
    }
    if (this.t < strikeT + 0.12) return;
    this.hitN++;
    if (this.hitN < this.hits) {
      // the next cut of the combination: a short wind-up with its own glint
      this.setState('telegraph');
      this.telegraphFor = Math.max(0.22, a.between - a.strike);
      this.glint = 0.3;
      this.facePlayer(player);
      this.x += this.facing * 40;
      return;
    }
    this.endAttack(a);
  }

  endAttack(a) {
    this.setState('recovery');
    this.recoveryFor = a.recovery * this.def.phases[this.phase].recoveryMul;
  }

  // His blade meets the warrior: a perfect parry, a block, the ice ward, or a wound.
  connect(a, player, counter = false) {
    this.struck = true;
    const P = this.def.parry;
    const fire = this.flaming;
    const facingHim = Math.sign(this.x - player.x) === player.facing;
    if (player.invulnerable) {
      this.game.combat.hitPlayer(a.damage, 'physical', this.x, 600);    // notes a precision dodge
      return;
    }
    if (player.state === 'brace' && facingHim) {
      if (player.stateTime <= P.perfect && !counter) {
        this.game.combat.text(player.x, player.y - 320, 'PERFECT PARRY', '#ffd36b', 50);
        this.sfx('clang', { f: 620, gain: 1.4 });
        this.game.particles.sparks((this.x + player.x) / 2, player.y - 160, 30, 'spark', 1.4);
        this.game.hitstop = Math.max(this.game.hitstop, 0.14);
        this.game.camera.shake(0.35);
        player.gainIce(10);
        player.parries = (player.parries || 0) + 1;
        this.stagger(P.stun, null);
        return;
      }
      if (fire && player.warded) { this.game.combat.hitPlayer(a.damage, 'fire', this.x, 500); return; }
      const chip = a.heavy ? P.heavyChip : P.chip;
      this.sfx('clang', { f: 480, gain: 1.1 });
      this.game.particles.sparks((this.x + player.x) / 2, player.y - 160, 16, 'spark', 1);
      this.game.combat.text(player.x, player.y - 300, a.heavy ? 'GUARD BROKEN' : 'BLOCKED', '#bfe4ff', 36);
      if (a.heavy) {
        this.game.combat.hitPlayer(a.damage * chip, fire ? 'fire' : 'physical', this.x, 700);
      } else {
        player.chipHit(a.damage * chip * this.game.levels.damageMul, this.x);
      }
      return;
    }
    this.game.combat.hitPlayer(a.damage, fire ? 'fire' : 'physical', this.x, a.heavy ? 900 : 650);
  }

  updateGuard(dt, player) {
    this.facePlayer(player);
    this.anim.set('guard', 1);
    if (this.t >= this.attack.duration) this.enterIdle(0.3);
  }

  updateCounter(dt, player) {
    const C = this.def.attacks.guard.counter;
    if (this.t < C.telegraph) {
      this.anim.set('slash', 1);
      return;
    }
    if (!this.countered) {
      this.countered = true;
      this.anim.play('slash', { restart: true, startFrame: 2, speed: 1.8 });
      this.sfx('swing', { gain: 1.3 });
    }
    if (!this.struck && overlaps(this.strikeBox(C.reach), player.hurtbox)) this.connect({ ...C, anim: 'slash' }, player, true);
    if (this.t >= C.telegraph + 0.3) { this.setState('recovery'); this.recoveryFor = 0.7; }
  }

  stagger(time, text = 'STAGGERED') {
    this.setState('stagger');
    this.staggerFor = time;
    this.poiseDmg = 0;
    this.attack = null;
    if (text) this.game.combat.text(this.x, this.y - 420, text, '#ffd36b', 44);
  }

  // ---------------------------------------------------------------- damage
  takeHit(player, point, opts, weapon) {
    const w = weapon || player.weapon;
    if (!this.hittable) return 0;
    const front = Math.sign(player.x - this.x) === this.facing;
    if (this.state === 'guard' && front) {
      if (opts.wave) {                               // ice against a set guard: it shatters the stance
        this.stagger(this.def.staggerTime, 'GUARD BROKEN');
        this.sfx('shatter');
        return 0;
      }
      // parried: the warrior reels, and the counter comes
      this.sfx('clang', { f: 700, gain: 1.3 });
      this.game.particles.sparks(point.x, point.y, 24, 'spark', 1.3);
      this.game.combat.text(point.x, point.y - 40, 'PARRIED', '#ffffff', 42);
      this.game.hitstop = Math.max(this.game.hitstop, 0.1);
      player.recoil(0.35, this.x);
      this.setState('counter');
      this.countered = false;
      this.struck = false;
      this.glint = 0.45;
      return 0;
    }
    if (opts.wave && w.def.frostbrand) this.applySlow(this.def.frostbrand.slow, this.def.frostbrand.slowTime);
    const type = opts.type || w.def.type;
    let dmg = w.hitDamage(player, opts.mul ?? 1) * (this.def.resist[type] ?? 1) * (opts.extraMul || 1);
    if (this.state === 'stagger') dmg *= this.def.staggerDamageMul;
    dmg = Math.max(1, Math.round(Math.min(dmg, this.hp)));
    this.hp -= dmg;
    this.lifeDamage[0] += dmg;
    this.flash = 0.12;
    player.weaponsUsed && player.weaponsUsed.add(w.id);
    if (w.def.frostbrand) player.gainIce(this.state === 'stagger' ? 8 : 2);
    this.sfx('hit', { gain: 1.1 });
    this.game.particles.sparks(point.x, point.y, 12, type === 'frost' ? 'ice' : 'spark');
    this.game.particles.add({ kind: 'dot', sprite: 'blood', x: point.x, y: point.y, vx: rand(-60, 60), vy: -80, max: 0.4,
                              size: 16, size1: 4, layer: 'front' });
    this.game.hitstop = Math.max(this.game.hitstop, opts.heavy ? 0.08 : 0.05);
    this.game.camera.shake(opts.heavy ? 0.2 : 0.1);
    this.game.combat.text(point.x, point.y - 30, String(dmg), type === 'frost' ? '#9fe0ff' : '#ffffff', 40);
    if (this.hp <= 0) { this.hp = 0; this.die(); return dmg; }
    const next = this.def.phases[this.phase + 1];
    if (next && this.hp / this.maxHp <= next.hpBelow) {
      this.phase++;
      this.events.push({ type: 'phase', phase: this.phase, life: 1, name: next.name, line: next.line, who: 'Aegon' });
      this.sfx('fire', { dur: 1.2 });
      this.game.particles.fire(this.x, this.y - 160, { x: 0, y: -1 }, 600, 40, { spread: 1.4 });
      this.stagger(0.6, null);
      return dmg;
    }
    if (this.state !== 'stagger' && this.state !== 'strike') {
      this.poiseDmg += opts.poise ?? w.def.poise;
      if (this.poiseDmg >= this.def.poise) this.stagger(this.def.staggerTime);
    }
    return dmg;
  }

  die() {
    this.setState('defeat');
    this.attack = null;
    this.flamingDeath = this.flaming;
    this.anim.play('kneel', { restart: true, speed: 0.55 });
    this.game.slowmo = 1.4;
    this.game.camera.shake(0.6);
    this.sfx('clang', { f: 300, gain: 1.4, delay: 1.2 });
    this.events.push({ type: 'aegonDown' });
  }

  // ---------------------------------------------------------------- draw
  bladeFire(n) {
    const f = this.anim.data;
    if (!f || !f.tip) return;
    const h = this.frameToWorld(f.hand), t = this.frameToWorld(f.tip);
    for (let i = 0; i < n; i++) {
      const k = 0.2 + Math.random() * 0.8;
      this.game.particles.fire(h.x + (t.x - h.x) * k, h.y + (t.y - h.y) * k, { x: 0, y: -1 }, 140, 1,
                               { spread: 0.8, sizeMul: 0.5, lifeMul: 0.6, collide: false });
    }
  }

  draw(renderer, time) {
    if (this.state === 'dormant') return;
    const ctx = renderer.ctx, m = this.sprite;
    ctx.fillStyle = 'rgba(8,12,20,0.35)';
    ctx.beginPath();
    ctx.ellipse(this.x, this.floorY + 2, 62, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    const img = this.game.assets.image(m.sheet_pattern.replace('{anim}', this.anim.name));
    const tint = this.slowTimer > 0 ? 'rgba(130,200,255,0.35)' : this.state === 'stagger' ? 'rgba(255,200,120,0.25)' : null;
    renderer.drawFrame(img, this.anim.frame, m.frame_size[0], m.frame_size[1], this.x, this.y, m.pivot, this.scale,
                       this.facing < 0, { flash: this.flash > 0 ? 0.7 : 0, tint,
                                          aura: this.flaming ? 'rgb(255,120,40)' : null, auraAlpha: 0.25 });
    const f = this.anim.data;
    if (this.glint > 0 && f && f.tip) {                 // the tell before every blow
      const t = this.frameToWorld(f.tip);
      const k = this.glint / 0.5;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = this.state === 'guard' ? `rgba(220,235,255,${k})` : this.attackId === 'dash' || this.attack?.heavy
        ? `rgba(255,110,80,${k})` : `rgba(255,255,240,${k})`;
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const ang = i * Math.PI / 4, r = i % 2 ? 6 : 34 * (0.6 + 0.4 * k);
        ctx.lineTo(t.x + Math.cos(ang) * r, t.y + Math.sin(ang) * r);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    if (this.state === 'guard' && f && f.tip) {          // the guard: a pale shimmer along the blade
      const h = this.frameToWorld(f.hand), t = this.frameToWorld(f.tip);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = `rgba(220,235,255,${0.45 + 0.35 * Math.sin(time * 14)})`;
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(h.x, h.y);
      ctx.lineTo(t.x, t.y);
      ctx.stroke();
      ctx.restore();
    }
    if (this.state === 'telegraph' || this.state === 'counter') {
      const a = this.state === 'counter' ? this.def.attacks.guard.counter : this.attack;
      if (a) {
        const box = this.strikeBox(this.attackId === 'dash' && this.state === 'telegraph' ? Math.min(a.distance, 700) : a.reach);
        const g = ctx.createLinearGradient(0, this.floorY - 60, 0, this.floorY + 4);
        g.addColorStop(0, 'rgba(255,70,40,0)');
        g.addColorStop(1, `rgba(255,90,60,${0.28 + 0.2 * Math.sin(time * 18)})`);
        ctx.fillStyle = g;
        ctx.fillRect(box.x, this.floorY - 60, box.w, 64);
      }
    }
  }
}
