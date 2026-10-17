import { DEBUG } from '../data/config.js';
import { clamp, lerp, rand, weightedPick } from '../core/math.js';
import { Animator } from './Animator.js';
import { ATTACK_TYPES } from './DragonAttacks.js';

// Boss dragon state machine, shared by every dragon:
//   dormant -> intro -> roar -> idle <-> walk
//   idle -> telegraph -> active -> recovery -> idle
//   any grounded state -> stagger (poise broken) -> idle
//   phase change -> roar -> (optional) phase attack
//   armor plate broken -> armorbreak (a short stagger) -> idle
//   hp <= 0 -> death, or for a dragon with a second life:
//   hp <= 0 -> firstdeath -> resurrect -> idle (new health pool and attacks)
// What each attack does lives in DragonAttacks.js, keyed by the attack's
// `kind`; timings, ranges and damage come from data/enemies.js.

const easeOut = t => 1 - (1 - t) * (1 - t);

// Attacks that pour out fire: a dragon with a `fireCue` ("Dracarys!": the
// game's own line, or the player's clip of that slot) has it heard as their
// wind-up begins.
const FIRE_KINDS = new Set(['breath', 'scorch', 'sweep', 'strafe', 'lastember', 'fireball', 'pulse']);

export class Dragon {
  constructor(game, def, { x, floorY, hpMul = 1, arena }) {
    this.game = game;
    this.def = def;
    this.useSprite(def.sprite, def.attacks);
    if (def.secondLife) {
      const L2 = def.secondLife;
      if (!game.assets.manifest[L2.sprite]) throw new Error(`Second-life sprite "${L2.sprite}" is not in the manifest`);
      this.checkAttacks(L2.attacks, game.assets.manifest[L2.sprite], L2.sprite);
    }
    this.scale = def.scale;
    this.pxScale = this.scale / (this.sprite.res || 1);   // sheets rendered at a higher resolution
    this.hpMul = hpMul;
    this.life = 1;
    this.lifeDamage = [0, 0];
    this.events = [];           // read by LevelManager: phase changes, armor breaks, deaths
    this.segments = null;
    if (def.armorSegments) {
      this.segments = {};
      for (const [id, sg] of Object.entries(def.armorSegments.parts)) {
        this.segments[id] = { id, label: sg.label, max: sg.hp, hp: sg.hp, broken: false, exposedT: 0 };
      }
    }
    this.combo = null;
    this.recoveryOverride = null;
    this.staggerFor = null;
    this.feintCue = 0;
    this.windupDamage = 0;
    this.x = x;
    this.floorY = floorY;
    this.y = floorY;
    this.facing = -1;            // sprite art faces left
    this.maxHp = Math.round(def.maxHp * hpMul);
    this.hp = this.maxHp;
    this.poiseDmg = 0;
    this.state = 'dormant';
    this.t = 0;
    this.attack = null;
    this.attackId = null;
    this.cooldowns = {};
    for (const [id, a] of Object.entries(def.attacks)) this.cooldowns[id] = a.cooldown * 0.4;
    this.phase = 0;
    this.slowTimer = 0;
    this.slowAmount = 0;
    this.flash = 0;
    this.behind = 0;
    this.arena = arena;
    this.defeated = false;
    this.idleFor = 1;
    this.tick = 0;
    this.stream = null;
    this.hasHit = false;
    this.pendingRoar = false;
    this.roarThen = null;
    this.debugBox = null;
    this.tricks = def.tricks || null;   // tests set this to null for exact timings
    // armor / vulnerable / flight-defense (all optional, from data/enemies.js)
    this.clock = 0;
    this.armorT = 0;
    this.armorUp = 0;
    this.armorCd = def.armor ? def.armor.startDelay ?? 3 : 0;
    this.vulnT = 0;
    this.recent = [];
    this.flyCd = def.flyDefense ? def.flyDefense.startDelay ?? 6 : 0;
    this.punishCd = 0;
  }

  useSprite(key, attacks) {
    this.sprite = this.game.assets.manifest[key];
    if (!this.sprite) throw new Error(`Enemy sprite "${key}" is not in the manifest`);
    this.checkAttacks(attacks, this.sprite, key);
    this.anim = new Animator(this.sprite.animations);
    this.anim.play('idle');
  }

  checkAttacks(attacks, sprite, key) {
    for (const [id, a] of Object.entries(attacks)) {
      if (!ATTACK_TYPES[a.kind]) throw new Error(`Attack "${id}" has unknown kind "${a.kind}"`);
      for (const anim of [a.anim, ...(a.anims || [])]) {
        if (anim && !sprite.animations[anim]) {
          throw new Error(`Attack "${id}" needs animation "${anim}", missing from ${key}`);
        }
      }
      for (const sub of a.sequence || []) {
        if (!attacks[sub]) throw new Error(`Combo "${id}" uses unknown attack "${sub}"`);
      }
    }
  }

  get armored() { return this.armorT > 0; }
  get vulnerable() { return this.vulnT > 0; }

  // Sound, placed in stereo at the dragon.
  sfx(name, o = {}) {
    if (this.game.audio) this.game.audio.play(name, { x: this.x, ...o });
  }

  roarSound(o = {}) {
    const v = this.def.voice || { pitch: 1 - (this.scale - 1.2) * 0.4, size: Math.min(1, this.scale - 0.5) };
    this.sfx(this.def.screech && o.short ? 'screech' : 'roar', { ...v, ...o });
  }

  // The sound of an attack being loosed.
  attackSound(a) {
    const k = a.kind;
    if (k === 'melee' || k === 'grab') this.sfx('bite');
    else if (k === 'breath' || k === 'scorch') this.sfx('fire', { dur: a.active, ice: a.blue });
    else if (k === 'sweep') { this.sfx('fire', { dur: 0.9, gain: 0.8 }); this.sfx('swing', { heavy: true, gain: 1.6 }); }
    else if (k === 'charge') { this.roarSound({ size: 0.4, gain: 0.6 }); this.sfx('shock'); }
    else if (k === 'slam') this.sfx('boom', { size: 1 });
    else if (k === 'fireball') this.sfx('fireball');
    else if (k === 'lastember') { this.sfx('fire', { dur: 1.4, gain: 1.4 }); this.sfx('boom', { size: 1 }); }
    else if (k === 'tailsweep') this.sfx('swing', { heavy: true, gain: 2 });
    else if (k === 'gust') this.sfx('wing', { gain: 2.5 });
    else if (k === 'mines' || k === 'debris') this.sfx('fire', { dur: 0.6 });
  }

  // ---------------------------------------------------------------- Level 7: ice
  // Frozen solid for a moment (a Frostpiercer spear on a weak point, a
  // marked weak point struck by Frostbrand, a broken dive). A great attack
  // already under way shrugs it off unless `force`.
  freeze(time, text = 'FROZEN!', force = false) {
    if (!this.alive || this.inCutscene || this.state === 'death') return false;
    const a = this.attack;
    if (!force && a && a.major && (this.state === 'telegraph' || this.state === 'active')) return false;
    if (this.inCustom && this.attack.kind === 'circling' && this.y < this.floorY - 60) return false;
    this.combo = null;
    this.clearAttackFx();
    this.circ = null;
    this.diveS = null;
    this.baitS = null;
    this.y = this.floorY;
    this.setState('frozen');
    this.frozenFor = time;
    this.game.particles.ice(this.x, this.floorY - 220 * this.scale, 60, 1.4);
    this.sfx('shatter');
    if (text) this.game.combat.text(this.x, this.floorY - 540, text, '#bfe4ff', 50);
    return true;
  }

  // Break off the current attack (a Frostpiercer shot in a charged wind-up).
  interruptAttack(text, stagger = 1.8) {
    if (!this.alive || this.inCutscene) return false;
    this.combo = null;
    this.clearAttackFx();
    this.circ = null;
    this.diveS = null;
    this.y = this.floorY;
    this.staggerFor = stagger;
    this.enterStagger();
    this.sfx('shatter');
    this.game.combat.text(this.x, this.floorY - 600, text, '#bfe4ff', 56);
    this.events.push({ type: 'interrupt' });
    return true;
  }

  // A part briefly marked as open (after a heavy slam): Frostbrand freezes it.
  markWeak(seg, time) {
    this.weakMark = { seg, t: time, max: time };
    this.game.combat.text(this.x, this.floorY - 520, 'WEAK POINT', '#9fe0ff', 44);
  }

  weakAnchor() {
    const m = this.weakMark;
    if (!m) return null;
    const a = this.anim.data[m.seg] || this.anim.data.chest;
    if (!a) return null;
    const w = this.frameToWorld(a);                 // always within a sword's reach of the floor
    return { x: w.x, y: clamp(w.y, this.floorY - 330, this.floorY - 160) };
  }

  coreAnchor() {
    const a = this.anim.data.chest;
    return a ? this.frameToWorld(a) : { x: this.x, y: this.floorY - 200 };
  }

  get coreOpen() { return (this.coreExposed || 0) > 0; }

  near(pt, at, r) { return at && Math.abs(pt.x - at.x) < r && Math.abs(pt.y - at.y) < r * 1.2; }

  // Is this point on a weak spot right now (for spear damage and ice energy)?
  isWeakAt(pt, hb) {
    if (hb && hb.id === 'head') return true;
    if (hb && hb.seg && this.isExposed(hb.seg)) return true;
    if (this.weakMark && this.near(pt, this.weakAnchor(), 150 * this.scale)) return true;
    if (this.coreOpen && this.near(pt, this.coreAnchor(), 160 * this.scale)) return true;
    return false;
  }

  // Frostbrand struck it (`wave` = the Glacial Wave). Returns what it did.
  frostbrandHit(pt, { wave = false } = {}) {
    const out = { weak: false };
    const a = this.attack;
    if (this.inCustom && a.kind === 'circling' && ATTACK_TYPES.circling.breakDive(this, a)) { out.weak = true; return out; }
    if (this.weakMark && (wave || this.near(pt, this.weakAnchor(), 150 * this.scale))) {
      this.weakMark = null;
      this.freeze(2.4, 'WEAK POINT FROZEN', true);
      this.makeVulnerable(2.6);
      out.weak = true;
      return out;
    }
    const C = this.def.core;
    if (C && (this.coreWin || 0) > 0 && (wave || this.near(pt, this.coreAnchor(), 170 * this.scale))) {
      this.coreWin = 0;
      this.coreExposed = C.exposed;
      this.game.particles.ice(pt.x, pt.y, 50, 1.4);
      this.sfx('shatter');
      this.game.camera.shake(0.6);
      this.events.push({ type: 'core' });
      out.weak = true;
      return out;
    }
    if (a && this.state === 'telegraph' && (a.frostBreak === 'any' || (a.frostBreak === 'wave' && wave))) {
      this.interruptAttack('FROZEN IN THE THROAT', 1.4);
      out.weak = true;
    }
    if (this.coreOpen && this.near(pt, this.coreAnchor(), 170 * this.scale)) out.weak = true;
    return out;
  }

  // After the attacks listed in `core.after` (from its minimum phase) the
  // chest glows: a Frostbrand strike in that window bares the core.
  openCoreWindow() {
    const C = this.def.core;
    if (!C || this.phase < C.minPhase || this.coreOpen) return;
    this.coreWin = C.window;
    this.game.combat.text(this.x, this.floorY - 580, 'THE CORE GLOWS', '#bfe4ff', 40);
  }

  makeVulnerable(time) {
    this.vulnT = time;
    this.armorT = 0;
    this.armorUp = 0;
    if (this.def.armor) this.armorCd = Math.max(this.armorCd, time + 1.5);
    this.game.combat.text(this.x, this.floorY - 520, 'VULNERABLE', '#ffb347', 50);
  }

  breakArmor() {
    this.armorT = 0;
    this.armorUp = 0;
    this.armorCd = this.def.armor ? this.def.armor.cooldown[1] : 0;
    this.game.particles.ice(this.x, this.floorY - 260, 50, 1.3);
    this.game.combat.text(this.x, this.floorY - 520, 'ARMOR SHATTERED', '#bfe4ff', 46);
  }

  // A scorpion bolt: knocks a flying dragon out of the sky, shatters armor.
  // Bring a flying dragon out of the sky (scorpion, Dawnfire, chain hook).
  knockDown(text = 'BROUGHT DOWN!') {
    if (!this.alive || !this.inCustom) return false;
    const k = this.attack.kind;
    if (k === 'skyward' && this.sky && this.sky.sub !== 'fall') {
      this.sky.sub = 'fall';
      this.sky.vy = 0;
    } else if (k === 'skyreign' && this.reign && ['hover', 'swoop'].includes(this.reign.sub)) {
      this.reign.sub = 'fall';
      this.reign.vy = 0;
      this.reign.t = 0;
    } else if (k === 'circling' && this.circ && !['rise', 'fall'].includes(this.circ.sub)) {
      this.circ.sub = 'fall';
      this.circ.vy = 0;
      this.reticle = null;
    } else {
      return false;
    }
    this.game.combat.text(this.x, this.y - 300, text, '#ffd36b', 52);
    this.events.push({ type: 'downed' });
    return true;
  }

  scorpionHit(damage, hb = null) {
    if (!this.alive || this.state === 'dormant' || this.state === 'intro' || this.inCutscene) return false;
    if (this.knockDown()) {
      this.takeDamage(damage, 'physical', 0, { force: true });
      return true;
    }
    if (this.segments) {                      // a bolt tears whatever plate it strikes
      const seg = (hb && hb.seg) || 'chest';
      const r = this.armorHit(seg, { armorBreak: 120, armorPen: 0.8, exposedMul: 1.2 });
      this.takeDamage(damage * r.mul, 'physical', 120, { force: true });
      return true;
    }
    if (this.armored) {
      this.breakArmor();
      this.takeDamage(damage * 0.5, 'physical', 60, { force: true });
      return true;
    }
    this.takeDamage(damage, 'physical', 120, { force: true });
    return true;
  }

  updateDefenses(dt, player) {
    // Molten Hide: heavy pressure turns the plates molten; melee hits burn the attacker
    const M = this.def.moltenHide;
    this.moltenT = Math.max(0, (this.moltenT || 0) - dt);
    if (M && this.alive && !this.inCutscene) {
      this.moltenCd = (this.moltenCd ?? M.startDelay) - dt;
      if (this.moltenT <= 0 && this.moltenCd <= 0 && (this.phase >= (M.minPhase ?? 0) || this.life === 2)) {
        const burst = this.recent.filter(r => this.clock - r.t < M.window).reduce((s, r) => s + r.dmg, 0);
        if (burst >= M.burst * this.maxHp) {
          this.moltenT = M.duration;
          this.moltenCd = M.cooldown;
          this.game.combat.text(this.x, this.floorY - 600, 'MOLTEN HIDE', '#ff9a3a', 46);
          this.events.push({ type: 'molten' });
        }
      }
    }
    // Dawnfire leaves it burning
    if (this.burnT > 0 && this.alive && !this.inCutscene) {
      this.burnT -= dt;
      this.burnNext -= dt;
      if (this.burnNext <= 0) {
        this.burnNext = 0.5;
        this.takeDamage(this.burnTick, 'light', 0, { force: true });
        const b = this.hurtboxes()[1].rect;
        this.game.particles.fire(b.x + rand(0, b.w), b.y + rand(0, b.h), { x: 0, y: -1 }, 300, 6, { spread: 0.8 });
      }
    }
    const A = this.def.armor;
    if (A && this.alive && this.state !== 'death') {
      if (this.armorT > 0) {
        this.armorT -= dt;
        if (this.armorT <= 0) this.armorCd = rand(A.cooldown[0], A.cooldown[1]);
      } else if (this.armorUp > 0) {
        this.armorUp -= dt;
        if (Math.random() < 0.6) this.game.particles.ice(this.x + rand(-200, 200), this.y - rand(60, 300), 1, 0.2);
        if (this.armorUp <= 0) {
          this.armorT = rand(A.duration[0], A.duration[1]);
          this.game.camera.shake(0.2);
          this.game.combat.text(this.x, this.floorY - 520, 'ARMORED', '#9fc7ff', 46);
        }
      } else if (this.vulnT <= 0 && (this.state === 'idle' || this.state === 'walk')) {
        this.armorCd -= dt;
        if (this.armorCd <= 0) this.armorUp = A.windup;
      }
    }
    if (this.vulnT > 0) this.vulnT -= dt;
    // punish button-mashing: too many hits in a short window -> lunging bite
    const PU = this.def.punish;
    if (PU && this.alive) {
      this.punishCd -= dt;
      const n = this.recent.filter(r => this.clock - r.t < PU.window).length;
      const free = this.state === 'idle' || this.state === 'walk' || this.state === 'recovery';
      if (free && this.punishCd <= 0 && n >= PU.hits && !(this.ally && this.ally.busy)) {
        this.punishCd = PU.cooldown;
        this.recent = [];
        this.beginAttack(PU.attack, player);
        return;
      }
    }
    const F = this.def.flyDefense;
    if (F && this.alive) {
      this.flyCd -= dt;
      this.recent = this.recent.filter(r => this.clock - r.t < F.window);
      const burst = this.recent.reduce((s, r) => s + r.dmg, 0);
      const free = this.state === 'idle' || this.state === 'walk' || this.state === 'recovery' || this.state === 'stagger';
      if (free && this.flyCd <= 0 && burst >= F.burst * this.maxHp && this.vulnT <= 0) {
        this.recent = [];
        this.flyCd = F.cooldown;
        this.game.combat.text(this.x, this.floorY - 520, 'TAKES TO THE SKY', '#ffd36b', 44);
        this.beginAttack(F.attack, player);
      }
    }
  }

  // ---------------------------------------------------------------- info
  get alive() { return this.hp > 0; }
  get active() { return this.state !== 'dormant'; }
  get speedMul() { return this.def.phases[this.phase].speedMul * (this.enraged ? 1.25 : 1); }

  // Two dragons together: one is "busy" while winding up or striking (a
  // roost in the sky does not count: the other keeps fighting).
  get busy() {
    if (this.queued) return true;
    if (this.inCustom) return this.attack.kind !== 'skyward';
    return this.state === 'telegraph' || this.state === 'active';
  }

  get free() { return !this.queued && (this.state === 'idle' || this.state === 'walk' || this.state === 'recovery'); }

  get ally() {
    const P = this.partner;
    return P && P.alive && P.active && !P.inCutscene ? P : null;
  }

  // Walk to the side of the warrior opposite the partner.
  // Returns false when there is nothing to do (already in place, or the leap is resting).
  takeFlank(player, P) {
    const side = -(Math.sign(P.x - player.x) || 1);
    const want = clamp(player.x + side * (this.def.flank ?? 640), this.arena.start + 260, this.arena.end - 260);
    const wrongSide = Math.sign(this.x - player.x) !== side;
    if (wrongSide && Math.sign(want - player.x) === side && Math.abs(want - this.x) > 300) {
      if (this.leapCd > 0) return false;
      this.enterLeap(want);                       // over the warrior's head to the far side
      return true;
    }
    if (Math.abs(want - this.x) <= 90) return false;
    this.enterWalk(Math.sign(want - this.x), 0.8);
    return true;
  }

  enterLeap(toX) {
    this.setState('leap');
    this.leapFrom = this.x;
    this.leapTo = toX;
    this.leapCd = this.def.leapCooldown ?? 4;
    this.facing = Math.sign(toX - this.x) || this.facing;
    this.anim.play('flight');
    this.clearAttackFx();
    this.game.particles.dust(this.x, this.floorY, 18);
  }

  updateLeap(player) {
    const p = Math.min(1, this.t / 1.05);
    const e = p * p * (3 - 2 * p);
    this.x = lerp(this.leapFrom, this.leapTo, e);
    this.y = this.floorY - Math.sin(Math.PI * p) * 560;
    if (p >= 1) {
      this.y = this.floorY;
      this.facing = player.x > this.x ? 1 : -1;
      this.game.particles.dust(this.x, this.floorY, 18);
      this.game.camera.shake(0.3);
      this.enterIdle(0.45);
    }
  }

  // The leader opens a joint move when both are free.
  startPair(player, P, only = null) {
    // only with the warrior caught between them
    if (Math.sign(this.x - player.x) === Math.sign(P.x - player.x)) return false;
    const dl = this.distTo(player), dp = P.distTo(player);
    const options = this.def.pairs.filter(q => (!only || q.id === only) && (q.needs === 'close' ? dl < 540 && dp < 540
      : q.needs === 'far' ? dl > 380 && dp > 380 : true));
    if (!options.length) return false;
    const q = weightedPick(options);
    this.pairCd = this.def.pairCooldown;
    this.combo = P.combo = null;
    this.facing = player.x > this.x ? 1 : -1;
    P.facing = player.x > P.x ? 1 : -1;
    this.beginAttack(q.lead, player);
    if (q.partnerDelay) P.queued = { id: q.partner, t: q.partnerDelay };
    else P.beginAttack(q.partner, player);
    // the two wind-ups end together (one perfect roll beats both), or for a
    // charge, the blows arrive a fixed beat apart (`beat`): a roll for each
    this.willFeint = P.willFeint = false;
    if (this.state === 'telegraph' && P.state === 'telegraph') {
      P.telegraphDur = this.telegraphDur;
      if (q.beat) {
        const eta = d => d.telegraphDur + Math.max(0, d.distTo(player) - 220 * d.scale) / d.attack.speed;
        const [n, f] = eta(this) <= eta(P) ? [this, P] : [P, this];
        const shift = eta(n) + q.beat - eta(f);
        if (shift > 0) f.telegraphDur += shift; else n.telegraphDur -= shift;
      }
    }
    this.events.push({ type: 'pair', id: q.id });
    return true;
  }

  enrage() {
    if (this.enraged || !this.alive) return;
    this.enraged = true;
    this.queued = null;
    this.pendingRoar = true;
    this.game.combat.text(this.x, this.floorY - 560, `${this.def.title || 'IT'} RAGES`, '#ff7a3a', 50);
    this.events.push({ type: 'enrage' });
  }
  get behaviour() { return this.attack ? ATTACK_TYPES[this.attack.kind] : null; }
  get inCustom() { return !!(this.attack && this.state === this.attack.kind && this.behaviour.custom); }

  // True while an attack is winding up (used by the HUD's off-screen marker).
  get telegraphing() {
    return this.state === 'telegraph' || (this.inCustom && this.strafe && this.strafe.sub === 'warn');
  }

  get hittable() {
    if (!this.alive) return false;
    // Sunfyre's marked dive can be met with a blade in its last moment
    if (this.circ && this.circ.sub === 'dive' && this.circ.t >= this.attack.diveTime - this.attack.breakWindow) return true;
    if (this.state === 'dormant' || this.state === 'intro' || this.state === 'death') return false;
    if (this.state === 'hop' || this.state === 'leap' || this.state === 'firstdeath' || this.state === 'resurrect') return false;
    return this.y > this.floorY - 60;
  }

  // Crossbow bolts can reach it in the air too.
  get boltable() {
    if (!this.alive) return false;
    return !['dormant', 'intro', 'death', 'firstdeath', 'resurrect'].includes(this.state) && this.y > -200;
  }

  get inCutscene() { return this.state === 'firstdeath' || this.state === 'resurrect'; }

  frameToWorld(p) {
    const piv = this.sprite.pivot;
    const sx = this.facing === -1 ? 1 : -1;
    return { x: this.x + (p[0] - piv[0]) * this.pxScale * sx, y: this.y + (p[1] - piv[1]) * this.pxScale };
  }

  worldAngle(a) { return this.facing === -1 ? a : (360 - a) % 360; }

  hurtboxes() {
    const s = this.scale;
    const b = this.def.hurtboxes.body;
    const x = this.facing === -1 ? this.x + b.x * s : this.x - (b.x + b.w) * s;
    const body = { x, y: this.y + b.y * s, w: b.w * s, h: b.h * s };
    const hc = this.frameToWorld(this.anim.data.head);
    const hs = this.def.hurtboxes.head.size * s;
    const head = { x: hc.x - hs / 2, y: hc.y - hs / 2, w: hs, h: hs };
    const out = [{ id: 'head', seg: this.segments ? 'head' : null, rect: head }, { id: 'body', seg: null, rect: body }];
    if (this.segments) {
      const H = this.def.hurtboxes, data = this.anim.data;
      for (const id of ['chest', 'foreleg', 'wing', 'tail']) {
        if (!data[id] || !H[id]) continue;
        const c = this.frameToWorld(data[id]);
        out.push({ id, seg: id, rect: { x: c.x - (H[id].w * s) / 2, y: c.y - (H[id].h * s) / 2, w: H[id].w * s, h: H[id].h * s } });
      }
    }
    return out;
  }

  // The segment nearest a point (used for hits on the generic body box).
  nearestSegment(pt) {
    let best = null, bd = Infinity;
    const data = this.anim.data;
    for (const id of ['chest', 'tail', 'foreleg']) {
      if (!data[id]) continue;
      const c = this.frameToWorld(data[id]);
      const dd = Math.abs(c.x - pt.x) + Math.abs(c.y - pt.y) * 0.5;
      if (dd < bd) { bd = dd; best = id; }
    }
    return best;
  }

  // ---------------------------------------------------------------- armor
  isExposed(id) {
    const sg = this.segments && this.segments[id];
    if (!sg) return false;
    return sg.broken || sg.exposedT > 0 || (id === 'chest' && this.attack && this.attack.kind === 'lastember' &&
                                            this.state === 'telegraph');
  }

  // A weapon strikes plate `id`. Returns the damage multiplier; intact
  // plate soaks most of it and takes armor damage instead.
  armorHit(id, wdef, opts = {}) {
    const A = this.def.armorSegments;
    const sg = this.segments[id];
    let mul;
    let broke = false;
    const wasExposed = this.isExposed(id);
    if (wasExposed) {
      mul = (A.exposedTaken ?? 1.4) * (wdef.exposedMul ?? 1);
    } else {
      mul = wdef.armorPen ?? 0.35;
      if (this.state === 'telegraph') mul *= A.braced ?? 0.6;     // plates locked tight in a wind-up
      const brk = (wdef.armorBreak ?? 6) * (opts.breakMul ?? 1) * ((wdef.breakBonus && wdef.breakBonus[id]) || 1);
      sg.hp = Math.max(0, sg.hp - brk);
      if (sg.hp <= 0) broke = this.breakSegment(id);
    }
    mul *= (wdef.bonus && wdef.bonus[id]) || 1;
    return { mul, exposed: wasExposed, broke };
  }

  breakSegment(id, { stagger = true } = {}) {
    const sg = this.segments && this.segments[id];
    if (!sg || sg.broken) return false;
    sg.broken = true;
    sg.hp = 0;
    const data = this.anim.data;
    const at = data[id] ? this.frameToWorld(data[id]) : { x: this.x, y: this.y - 220 };
    this.game.particles.sparks(at.x, at.y, 40, 'spark', 1.6);
    this.game.particles.debris(at.x, at.y, 16, 60);
    this.game.particles.embers(at.x, at.y, 30, 60);
    this.game.camera.shake(0.5);
    this.game.hitstop = Math.max(this.game.hitstop, 0.12);
    this.game.combat.text(at.x, at.y - 80, `${sg.label.toUpperCase()} ARMOR SHATTERED`, '#ffb347', 42);
    this.events.push({ type: 'armor', id });
    if (this.combo) this.interruptCombo('THE SEQUENCE BREAKS');
    else if (stagger && this.alive && !this.inCustom && !this.inCutscene && this.state !== 'death') this.enterArmorBreak();
    return true;
  }

  exposeSegment(id, time, label = true) {
    const sg = this.segments && this.segments[id];
    if (!sg || sg.broken) return;
    sg.exposedT = Math.max(sg.exposedT, time);
    if (label) this.game.combat.text(this.x, this.floorY - 560, `${sg.label.toUpperCase()} EXPOSED`, '#ffd36b', 40);
  }

  enterArmorBreak() {
    this.setState('armorbreak');
    this.clearAttackFx();
    this.poiseDmg = 0;
  }

  interruptCombo(text) {
    const spec = this.combo && this.combo.spec;
    this.combo = null;
    this.recoveryOverride = null;
    this.game.combat.text(this.x, this.floorY - 520, text, '#ffd36b', 46);
    if (this.alive && !this.inCustom) {
      this.staggerFor = spec ? spec.interruptStagger : null;
      this.enterStagger();
    }
  }

  distTo(p) { return Math.abs(p.x - this.x); }

  // ---------------------------------------------------------------- damage
  takeDamage(amount, type, poise, { force = false, core = false } = {}) {
    if (!this.hittable && !force) return 0;
    let dmg = amount * (this.def.resist[type] ?? 1);
    if (core && this.coreOpen) dmg *= this.def.core.taken;
    if (this.state === 'frozen') dmg *= 1.25;
    if (this.state === 'stagger') dmg *= this.def.staggerDamageMul;
    this.lastHit = this.armored ? 'armor' : this.vulnerable ? 'vulnerable' : 'normal';
    if (this.armored) { dmg *= this.def.armor.taken; poise *= 0.4; }
    if (this.vulnerable) dmg *= this.def.vulnerable ? this.def.vulnerable.taken : 1.5;
    dmg = Math.max(1, Math.round(dmg));
    dmg = Math.min(dmg, this.hp);
    const C = this.def.core;
    if (C && C.finishOnly && !(core && this.coreOpen) && dmg >= this.hp) {
      dmg = Math.max(0, this.hp - 1);                     // he will not die to anything but the core
      if (!this.coreHintT || this.clock - this.coreHintT > 3) {
        this.coreHintT = this.clock;
        this.openCoreWindow();
      }
    }
    this.hp -= dmg;
    this.lifeDamage[this.life - 1] += dmg;
    this.flash = 0.12;
    this.recent.push({ t: this.clock, dmg });
    if (this.state === 'telegraph') this.windupDamage += dmg;
    if (this.hp <= 0) {
      this.hp = 0;
      if (this.def.secondLife && this.life === 1) this.firstDeath();
      else this.die();
      return dmg;
    }
    let next = this.def.phases[this.phase + 1];
    while (next && this.hp / this.maxHp <= next.hpBelow) {
      this.phase++;
      if (next.roar) this.pendingRoar = true;
      this.enterPhase(next);
      next = this.def.phases[this.phase + 1];
    }
    if (this.state !== 'stagger' && this.state !== 'roar' && !this.inCustom && !this.def.fearless) {
      this.poiseDmg += poise;
      if (this.poiseDmg >= this.def.poise) this.enterStagger();
    }
    return dmg;
  }

  enterPhase(ph) {
    if (this.segments) {
      for (const id of ph.crack || []) {
        const sg = this.segments[id];
        if (!sg.broken) sg.hp = Math.min(sg.hp, Math.round(sg.max * 0.35));
      }
      for (const id of ph.expose || []) this.breakSegment(id, { stagger: false });
    }
    if (ph.tricks && this.tricks) this.tricks = ph.tricks;
    this.events.push({ type: 'phase', phase: this.phase, life: this.life, name: ph.name, line: ph.line });
  }

  // ---------------------------------------------------------------- lives
  firstDeath() {
    this.hp = 0;
    this.moltenT = 0;
    this.burnT = 0;
    this.setState('firstdeath');
    this.anim.play('death', { restart: true });
    this.clearAttackFx();
    this.combo = null;
    this.strafe = null;
    this.diveS = null;
    this.shadow = null;
    this.y = this.floorY;
    this.game.hazards.clear();
    this.game.slowmo = 1.2;
    this.game.camera.shake(0.9);
    this.events.push({ type: 'firstdeath' });
  }

  updateFirstDeath() {
    if (Math.random() < 0.5) {
      const b = this.hurtboxes()[1].rect;
      this.game.particles.embers(b.x + rand(0, b.w), b.y + rand(0, b.h), 1, 10);
    }
    if (this.t >= 3.6) this.beginResurrect();
  }

  beginResurrect() {
    const L2 = this.def.secondLife;
    this.useSprite(L2.sprite, L2.attacks);
    this.pxScale = this.scale / (this.sprite.res || 1);
    this.setState('resurrect');
    this.anim.set('rise', 0);
    this.reviveRing = null;
    this.events.push({ type: 'resurrect' });
  }

  updateResurrect(player) {
    const t = this.t;
    if (t < 1.2) {
      this.anim.set('rise', 0);
      if (Math.random() < 0.3) this.game.camera.shake(0.06 + t * 0.05);
      if (Math.random() < 0.8) {
        const b = this.hurtboxes()[1].rect;
        this.game.particles.embers(b.x + rand(0, b.w), b.y + rand(0, b.h), 2, 40);
      }
    } else if (t < 2.55) {
      const n = this.sprite.animations.rise.frames;
      this.anim.set('rise', Math.min(n - 1, Math.floor((t - 1.2) / 1.35 * n)));
    } else {
      this.anim.set('stagger', 0);
      if (!this.reviveRing) {
        // the return: a roar, a tremor and a shockwave that throws the warrior back (no damage)
        this.reviveRing = { t: 0 };
        this.game.camera.shake(1.0);
        this.game.particles.dust(this.x - 200, this.floorY, 30, -1);
        this.game.particles.dust(this.x + 200, this.floorY, 30, 1);
        const dir = Math.sign(player.x - this.x) || 1;
        player.pushVx = dir * 900;
      }
    }
    if (this.reviveRing) this.reviveRing.t += 1 / 60;
    if (t >= 3.6) this.becomeSecondLife();
  }

  skipResurrection() {
    if (!this.inCutscene) return;
    if (this.state === 'firstdeath') this.beginResurrect();
    this.becomeSecondLife();
  }

  becomeSecondLife() {
    const L2 = this.def.secondLife;
    this.def = { ...this.def, ...L2, secondLife: null, attacks: L2.attacks, phases: L2.phases,
                 hurtboxes: this.def.hurtboxes, armorSegments: this.def.armorSegments, firstLife: this.def };
    this.life = 2;
    this.maxHp = Math.round(L2.maxHp * this.hpMul);
    this.hp = this.maxHp;
    this.phase = 0;
    this.poiseDmg = 0;
    this.cooldowns = {};
    for (const [id, a] of Object.entries(this.def.attacks)) this.cooldowns[id] = a.cooldown * 0.5;
    if (this.tricks) this.tricks = L2.tricks;
    this.y = this.floorY;
    this.reviveRing = null;
    this.events.push({ type: 'secondlife' });
    this.enterIdle(0.9);
  }

  applySlow(amount, time) {
    this.slowAmount = amount;
    this.slowTimer = time;
  }

  // ---------------------------------------------------------------- states
  setState(s) {
    this.state = s;
    this.t = 0;
  }

  clearAttackFx() {
    this.guarding = false;
    this.guardCue = false;
    this.stream = null;
    this.warnStream = null;
    this.reticle = null;
    this.wave = null;
    this.sweepPath = null;
    this.chargePath = null;
  }

  startIntro() {
    this.setState('intro');
    this.anim.play('flight');
    this.y = this.floorY - 1300;
    const p = this.game.levels.player;              // lands facing the warrior
    this.facing = p && p.x > this.x ? 1 : -1;
  }

  enterIdle(time) {
    this.setState('idle');
    this.comboed = false;
    const [a, b] = this.def.idleTime;
    this.idleFor = (time ?? rand(a, b)) / this.speedMul;
    this.anim.play('idle');
    this.clearAttackFx();
  }

  enterRoar(then) {
    this.setState('roar');
    this.roarThen = then;
    this.clearAttackFx();
    this.roarSound();
    this.game.camera.shake(0.7);
    const head = this.frameToWorld(this.sprite.animations.stagger.per_frame[0].head);
    this.game.particles.embers(head.x, head.y, 40, 80);
  }

  enterStagger() {
    this.combo = null;
    this.setState('stagger');
    this.roarSound({ size: 0.25, pitch: (this.def.voice ? this.def.voice.pitch : 1) * 1.3, gain: 0.6 });
    this.poiseDmg = 0;
    this.clearAttackFx();
    this.game.camera.shake(0.35);
    this.game.combat.text(this.x, this.y - 460, 'STAGGERED', '#ffd36b', 46);
  }

  enterWalk(dir, dur) {
    this.setState('walk');
    this.walkDir = dir;
    this.walkDur = dur;
  }

  die() {
    if (this.partner && this.partner.alive) this.partner.enrage();
    this.queued = null;
    this.setState('death');
    this.anim.play('death', { restart: true });
    this.clearAttackFx();
    this.roarSound({ size: 1, gain: 1.1 });
    this.sfx('boom', { size: 1, delay: 1.1 });
    this.strafe = null;
    this.game.slowmo = 1.1;
    this.game.camera.shake(0.9);
  }

  beginAttack(id, player, { fromFeint = false } = {}) {
    if (this.stunNext) {                       // the core was speared: the next blow never comes
      this.stunNext = false;
      this.combo = null;
      this.staggerFor = 1.8;
      this.enterStagger();
      this.game.combat.text(this.x, this.floorY - 560, 'THE ICE HOLDS HIM', '#bfe4ff', 46);
      return;
    }
    const a = this.def.attacks[id];
    if (a.label && a.kind !== 'firestorm') this.game.combat.text(this.x, this.floorY - 620, a.label, '#ff9a5a', 46);
    if (this.def.fireCue && FIRE_KINDS.has(a.kind)) this.game.cue(this.def.fireCue, { x: this.x });
    if (a.kind === 'combo') {
      // a fixed sequence, each step with its own wind-up (see updateRecovery)
      this.cooldowns[id] = a.cooldown / this.speedMul;
      this.combo = { id, spec: a, i: 0 };
      this.game.combat.text(this.x, this.floorY - 560, a.label || 'TRIPLE CATACLYSM', '#ff9a5a', 44);
      return this.beginAttack(a.sequence[0], player);
    }
    const T = ATTACK_TYPES[a.kind];
    this.windupDamage = 0;
    this.frostDelayed = false;
    this.recoveryOverride = null;
    this.attackId = id;
    this.attack = a;
    this.hasHit = false;
    this.cooldowns[id] = a.cooldown / this.speedMul;
    player = player || this.game.levels.player;
    if (T.custom) {
      this.setState(a.kind);
      T.begin(this, a, player);
      return;
    }
    this.setState('telegraph');
    this.telegraphDur = a.telegraph / Math.sqrt(this.speedMul);
    const tr = this.tricks;
    // a random hold makes the release harder to time; the warning stays up
    if (tr && tr.delay) this.telegraphDur += rand(tr.delay[0], tr.delay[1]);
    // a feint swaps to a new attack: it gets a little extra wind-up to read
    if (fromFeint) this.telegraphDur += 0.3;
    this.willFeint = !!(tr && !fromFeint && !this.combo && Math.random() < (tr.feint || 0));
    if (T.begin) T.begin(this, a, player);
  }

  // Weighted pick among attacks the dragon could use right now.
  pickAttack(player, { exclude = null, ignoreCooldown = false, grounded = false, rear = false, only = null } = {}) {
    const dist = this.distTo(player);
    const options = [];
    for (const [id, a] of Object.entries(this.def.attacks)) {
      if (id === exclude || (a.phase ?? 1) > this.phase + 1) continue;
      if (rear && !a.rear) continue;
      if (only && !only.includes(id)) continue;
      if (grounded && ATTACK_TYPES[a.kind].custom) continue;
      if (!ignoreCooldown && this.cooldowns[id] > 0) continue;
      if (dist < a.range[0] || dist > a.range[1]) continue;
      options.push({ id, weight: a.weight });
    }
    return options.length ? weightedPick(options).id : null;
  }

  // Break off a wind-up and go straight into a different attack.
  feint(player) {
    this.willFeint = false;
    const alt = this.pickAttack(player, { exclude: this.attackId, ignoreCooldown: true, grounded: true });
    if (!alt) return false;
    // the tell: Aemond's blade flashes and the eyes flare white before the switch
    this.feintCue = 0.6;
    this.events.push({ type: 'feint', from: this.attackId, to: alt });
    this.game.particles.dust(this.x, this.floorY, 10, -this.facing);
    this.game.camera.shake(0.08);
    this.beginAttack(alt, player, { fromFeint: true });
    return true;
  }

  enterHop(player) {
    this.setState('hop');
    this.hopDir = -(Math.sign(player.x - this.x) || this.facing);
    this.hopFrom = this.x;
    this.anim.play('flight');
    this.game.particles.dust(this.x, this.floorY, 18);
  }

  updateHop(player) {
    const p = Math.min(1, this.t / 0.7);
    this.x = this.hopFrom + this.hopDir * 430 * easeOut(p);
    this.y = this.floorY - Math.sin(Math.PI * p) * 170;
    if (p >= 1) {
      this.y = this.floorY;
      this.facing = player.x > this.x ? 1 : -1;
      this.game.particles.dust(this.x, this.floorY, 16);
      this.game.camera.shake(0.25);
      const next = this.pickAttack(player, { ignoreCooldown: true, grounded: true });
      if (next) this.beginAttack(next, player); else this.enterIdle(0.3);
    }
  }

  decide(player) {
    if (this.pendingRoar) {
      this.pendingRoar = false;
      this.enterRoar(this.def.phases[this.phase].roarAttack || null);
      return;
    }
    if (this.queued) { this.enterIdle(0.15); return; }
    const P = this.ally;
    if (P && player.alive) {
      if (this.def.leader && this.def.pairs && this.pairCd <= 0 && P.free && Math.random() < (this.def.pairChance ?? 0.3) &&
          this.startPair(player, P)) return;
      // alone, only one strikes at a time; the other circles to the warrior's far side
      if (P.busy) {
        // a dragon with `overlap` may add a ranged attack to its partner's blow
        const O = this.def.overlap;
        const extra = O && P.state === 'telegraph' && this.distTo(player) > O.minDist && Math.random() < O.chance
          ? this.pickAttack(player, { only: O.attacks }) : null;
        if (extra) { this.facing = player.x > this.x ? 1 : -1; this.beginAttack(extra, player); return; }
        if (!this.takeFlank(player, P)) this.enterIdle(0.35);
        return;
      }
      if (!this.def.leader && Math.sign(this.x - player.x) === Math.sign(P.x - player.x) && this.takeFlank(player, P)) return;
    }
    const front = (player.x - this.x) * this.facing > 0;
    const dist = this.distTo(player);
    const tr = this.tricks;
    if (!front) {
      // the tail answers a warrior who hides behind the body
      const rear = player.alive ? this.pickAttack(player, { rear: true }) : null;
      if (rear) { this.beginAttack(rear, player); return; }
      this.turn();
      // sudden turn-and-bite on a player who sneaks behind
      const melee = Object.entries(this.def.attacks).find(([, a]) => a.kind === 'melee');
      if (tr && melee && dist <= melee[1].range[1] && Math.random() < (tr.quickTurn || 0)) {
        this.beginAttack(melee[0], player);
        return;
      }
    }
    if (tr && dist < 300 && player.alive && Math.random() < (tr.hop || 0)) {
      this.enterHop(player);
      return;
    }
    const id = player.alive ? this.pickAttack(player) : null;
    if (id) {
      this.beginAttack(id, player);
      return;
    }
    const close = this.def.closeRange ?? 470;
    if (dist > close) this.enterWalk(Math.sign(player.x - this.x), 2.4);
    else if (dist < 200) this.enterWalk(-Math.sign(player.x - this.x), 0.9);
    else this.enterIdle(0.35);
  }

  turn() {
    this.facing = -this.facing;
    this.behind = 0;
    this.game.particles.dust(this.x, this.floorY, 10);
  }

  facePlayer(dt, player) {
    const want = player.x > this.x ? 1 : -1;
    if (want !== this.facing) {
      this.behind += dt;
      if (this.behind > this.def.turnDelay) this.turn();
    } else {
      this.behind = 0;
    }
  }

  // ---------------------------------------------------------------- update
  update(dt, player) {
    if (this.state === 'dormant') return;
    this.flash = Math.max(0, this.flash - dt);
    this.slowTimer = Math.max(0, this.slowTimer - dt);
    const k = this.slowTimer > 0 ? 1 - this.slowAmount : 1;
    const ddt = dt * k;
    this.t += ddt;
    for (const id in this.cooldowns) this.cooldowns[id] = Math.max(0, this.cooldowns[id] - ddt);
    if (this.state !== 'stagger') this.poiseDmg = Math.max(0, this.poiseDmg - this.def.poiseRegen * ddt);
    this.debugBox = null;
    this.clock += dt;
    this.feintCue = Math.max(0, this.feintCue - dt);
    this.pairCd = Math.max(0, (this.pairCd ?? 6) - ddt);   // none before the reveal fades
    this.leapCd = Math.max(0, (this.leapCd ?? 0) - ddt);
    if (this.queued && this.free) {              // a joint move's delayed second half
      this.queued.t -= ddt;
      if (this.queued.t <= 0) {
        const id = this.queued.id;
        this.queued = null;
        this.facing = player.x > this.x ? 1 : -1;
        this.beginAttack(id, player);
      }
    }
    this.chainCue = Math.max(0, (this.chainCue || 0) - dt);
    this.frostResist = Math.max(0, (this.frostResist || 0) - dt);
    if (this.segments) for (const id in this.segments) this.segments[id].exposedT = Math.max(0, this.segments[id].exposedT - ddt);
    this.updateDefenses(ddt, player);
    if (this.weakMark && (this.weakMark.t -= ddt) <= 0) this.weakMark = null;
    this.coreWin = Math.max(0, (this.coreWin || 0) - ddt);
    this.coreExposed = Math.max(0, (this.coreExposed || 0) - ddt);
    const T = this.behaviour;

    switch (this.state) {
      case 'intro': this.updateIntro(); break;
      case 'roar': this.updateRoar(player); break;
      case 'idle':
        this.anim.play('idle', { speed: k });
        this.facePlayer(ddt, player);
        if (this.t >= this.idleFor) this.decide(player);
        break;
      case 'walk': this.updateWalk(ddt, player, k); break;
      case 'telegraph': {
        const p = clamp(this.t / this.telegraphDur, 0, 0.999);
        if (this.willFeint && p >= 0.5 && this.feint(player)) break;
        T.telegraph(this, this.attack, p, player, ddt);
        if (this.t >= this.telegraphDur) {
          this.setState('active');
          this.tick = 0;
          this.attackSound(this.attack);
          if (T.start) T.start(this, this.attack, player);
        }
        break;
      }
      case 'active':
        if (T.active(this, this.attack, ddt, player)) {
          this.setState('recovery');
          this.clearAttackFx();
          if (this.attack.weakAfter) this.markWeak(this.attack.weakAfter.seg, this.attack.weakAfter.time);
          if (this.def.core && this.def.core.after.includes(this.attackId)) this.openCoreWindow();
          this.willChain = !!(this.tricks && !this.comboed && Math.random() < (this.tricks.chain || 0));
          // the tell for a follow-up: the eyes flare and embers burst from the jaws
          if (this.willChain && this.segments) this.chainCue = 0.5;
        }
        break;
      case 'recovery': this.updateRecovery(player); break;
      case 'hop': this.updateHop(player); break;
      case 'leap': this.updateLeap(player); break;
      case 'stagger': this.updateStagger(); break;
      case 'frozen':
        if (Math.random() < 0.25) this.game.particles.ice(this.x + rand(-160, 160), this.floorY - rand(40, 300), 1, 0.3);
        if (this.t >= this.frozenFor) { this.game.particles.ice(this.x, this.floorY - 200, 30, 1); this.enterIdle(0.35); }
        break;
      case 'armorbreak': this.updateArmorBreak(); break;
      case 'firstdeath': this.updateFirstDeath(); break;
      case 'resurrect': this.updateResurrect(player); break;
      case 'death': this.updateDeath(); break;
      default:
        if (this.inCustom) T.update(this, this.attack, ddt, player);
    }
    this.anim.update(ddt);
    // the switch may have started a new attack, so read the behaviour again
    const free = this.state === 'intro' || this.inCutscene || (this.inCustom && this.behaviour.unclamped);
    if (!free) this.x = clamp(this.x, this.arena.start + 260, this.arena.end - 260);
  }

  updateIntro() {
    const dur = 2.0;
    const p = Math.min(1, this.t / dur);
    this.y = lerp(this.floorY - 1300, this.floorY, easeOut(p));
    if (p >= 1) {
      this.y = this.floorY;
      this.game.camera.shake(0.75);
      this.sfx('boom', { size: 0.8 });
      this.game.particles.dust(this.x - 120, this.floorY, 20, -1);
      this.game.particles.dust(this.x + 120, this.floorY, 20, 1);
      this.enterRoar(null);
      this.introRoar = true;
    }
  }

  updateRoar(player) {
    this.anim.set('stagger', 0);
    if (this.t < 0.9 && Math.random() < 0.5) {
      const head = this.frameToWorld(this.anim.data.head);
      this.game.particles.embers(head.x, head.y, 2, 50);
      this.game.camera.shake(0.03);
    }
    if (this.t >= 1.3) {
      this.introRoar = false;
      if (this.roarThen && !(this.ally && this.ally.busy)) this.beginAttack(this.roarThen, player);
      else this.enterIdle(0.6);
    }
  }

  updateWalk(dt, player, k) {
    this.anim.play('walk', { speed: this.speedMul * k });
    if (this.def.stomp && this.anim.frame !== this.lastStep && (this.anim.frame === 0 || this.anim.frame === 4)) {
      // every footfall of something this heavy shakes the ground
      this.game.camera.shake(0.12);
      this.sfx('thump', { f: 55, gain: 0.35, len: 0.4 });
      this.game.particles.dust(this.x + this.facing * 120 * this.scale, this.floorY, 6);
    }
    this.lastStep = this.anim.frame;
    this.x += this.walkDir * this.def.moveSpeed * this.speedMul * dt;
    this.facePlayer(dt, player);
    const dist = this.distTo(player);
    const toward = Math.sign(player.x - this.x) === this.walkDir;
    const atEdge = this.x <= this.arena.start + 262 || this.x >= this.arena.end - 262;
    if ((toward && dist <= 430) || this.t >= this.walkDur || atEdge) this.decide(player);
  }

  recoveryDuration() {
    const a = this.attack;
    const T = this.behaviour;
    const base = this.recoveryOverride ?? (T && T.recoveryTime ? T.recoveryTime(this, a) : a.recovery);
    return Math.max(this.def.minRecovery ?? 0, base / Math.sqrt(this.speedMul));
  }

  updateRecovery(player) {
    // a combo moves straight to its next step after a short gap
    if (this.combo) {
      const c = this.combo;
      if (this.t >= c.spec.gap) {
        c.i++;
        if (c.i < c.spec.sequence.length) {
          this.beginAttack(c.spec.sequence[c.i], player);
          this.combo = c;
          return;
        }
        this.combo = null;
        this.recoveryOverride = c.spec.recovery;
      }
    }
    // combo: cut the recovery short and follow up (with its own wind-up)
    if (this.willChain && !this.combo && !(this.ally && this.ally.busy) && this.t >= this.recoveryDuration() * 0.45) {
      this.willChain = false;
      // phase 3+: a physical blow is followed by fire or wing, as listed in `chainTo`
      const prefer = this.attack.chainTo
        ? this.pickAttack(player, { exclude: this.attackId, grounded: true, ignoreCooldown: true, only: this.attack.chainTo })
        : null;
      const next = prefer || this.pickAttack(player, { exclude: this.attackId, grounded: true });
      if (next) {
        this.comboed = true;
        this.beginAttack(next, player);
        return;
      }
    }
    const a = this.attack;
    const rf = a.recoveryFrames;
    if (rf && a.anim) {
      const fps = this.sprite.animations[a.anim].fps;
      const part = rf.length / fps;
      if (this.t < part) this.anim.set(a.anim, rf[Math.floor((this.t / part) * rf.length)]);
      else this.anim.play('idle');
    } else {
      this.anim.play('idle');
    }
    if (this.t >= this.recoveryDuration()) {
      // at 1 hp Balerion leaves the core open more often: there is always a way to end it
      if (this.def.core && this.hp <= 1) this.openCoreWindow();
      this.enterIdle(rand(0.25, 0.5));
    }
  }

  updateStagger() {
    const dur = this.staggerFor ?? this.def.staggerTime;
    const t = this.t;
    const f = t < 0.25 ? 0 : t < dur - 0.45 ? 1 : t < dur - 0.2 ? 2 : 3;
    this.anim.set('stagger', f);
    if (t >= dur) { this.staggerFor = null; this.enterIdle(0.3); }
  }

  updateArmorBreak() {
    const dur = this.def.armorSegments.breakStagger ?? 1.2;
    const t = this.t;
    this.anim.set('stagger', t < 0.2 ? 0 : t < dur - 0.3 ? 1 : 3);
    if (t >= dur) this.enterIdle(0.3);
  }

  updateDeath() {
    if (Math.random() < 0.6) {
      const b = this.hurtboxes()[1].rect;
      this.game.particles.embers(b.x + rand(0, b.w), b.y + rand(0, b.h), 1, 10);
    }
    if (this.anim.finished && this.t > 2.4 && !this.defeated) this.defeated = true;
  }

  // ---------------------------------------------------------------- draw
  drawWarnings(ctx, time) {
    const T = this.behaviour;
    if (!T || !T.warning) return;
    if (this.state === 'telegraph' || this.state === 'active' || this.inCustom) T.warning(this, ctx, time, this.attack);
  }

  draw(renderer, time) {
    if (this.state === 'dormant') return;
    const ctx = renderer.ctx;
    const m = this.sprite;
    const alt = Math.max(0, this.floorY - this.y);
    const shadowA = Math.max(0, 0.4 - alt / 2000);
    if (shadowA > 0) {
      ctx.fillStyle = `rgba(8,12,20,${shadowA})`;
      ctx.beginPath();
      ctx.ellipse(this.x, this.floorY + 2, 300 * this.scale * (1 - alt / 2600), 18, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    const img = this.game.assets.image(m.sheet_pattern.replace('{anim}', this.anim.name));
    // Armor = steel-blue sheen with a cold aura; vulnerable = pulsing red-gold.
    let tint = this.slowTimer > 0 ? 'rgba(130,200,255,0.35)' : null;
    let aura = null, auraAlpha = 0;
    const pulse = 0.5 + 0.5 * Math.sin(time * 10);
    if (this.armored) {
      tint = 'rgba(150,190,240,0.42)';
      aura = 'rgb(140,200,255)';
      auraAlpha = 0.35 + 0.15 * pulse;
    } else if (this.armorUp > 0) {
      aura = 'rgb(140,200,255)';
      auraAlpha = 0.5 * (1 - this.armorUp / this.def.armor.windup);
    } else if (this.vulnerable) {
      tint = `rgba(255,90,40,${0.18 + 0.14 * pulse})`;
      aura = 'rgb(255,150,40)';
      auraAlpha = 0.35 + 0.35 * pulse;
    }
    if (this.moltenT > 0) {                   // Molten Hide: white-hot plates
      tint = `rgba(255,150,60,${0.22 + 0.12 * pulse})`;
      aura = 'rgb(255,190,90)';
      auraAlpha = 0.45 + 0.3 * pulse;
    }
    if (this.life === 2 && !aura) {           // the second life smoulders
      aura = 'rgb(255,120,40)';
      auraAlpha = 0.16 + 0.12 * pulse;
    }
    if (this.state === 'resurrect') {
      aura = 'rgb(255,140,50)';
      auraAlpha = Math.min(0.75, this.t / 2.5);
    }
    if (this.state === 'frozen') {
      tint = 'rgba(170,220,255,0.55)';
      aura = 'rgb(170,225,255)';
      auraAlpha = 0.55 + 0.25 * pulse;
    }
    renderer.drawFrame(img, this.anim.frame, m.frame_size[0], m.frame_size[1], this.x, this.y, m.pivot, this.pxScale,
                       this.facing === 1, { flash: this.flash > 0 ? 0.7 : 0, tint, aura, auraAlpha });
    if (this.segments) this.drawSegments(ctx, time);
    if (this.weakMark || this.coreWin > 0 || this.coreOpen) this.drawMarks(ctx, time);
    if (this.feintCue > 0) this.drawFeintCue(ctx);
    if (this.chainCue > 0) this.drawChainCue(ctx);
    if (this.reviveRing) {
      const r = this.reviveRing.t * 1800;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = `rgba(255,170,80,${Math.max(0, 0.8 - this.reviveRing.t)})`;
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.ellipse(this.x, this.floorY - 20, r, r * 0.22, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    const T = this.behaviour;
    if (T && T.overlay && (this.state === 'telegraph' || this.state === 'active')) T.overlay(this, ctx, time, this.attack);
    if (DEBUG) this.drawDebug(ctx);
  }

  // Level 7: a marked weak point (ice-blue target), the core's glow and the bared core.
  drawMarks(ctx, time) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const pulse = 0.55 + 0.45 * Math.sin(time * 9);
    const at = this.weakAnchor();
    if (this.weakMark && at) {
      const r = 46 * this.scale;
      ctx.strokeStyle = `rgba(150,225,255,${0.6 + 0.4 * pulse})`;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(at.x, at.y, r * (1.1 - 0.2 * pulse), 0, Math.PI * 2);
      ctx.stroke();
      for (let k = 0; k < 4; k++) {
        const ang = k * Math.PI / 2 + time * 2;
        ctx.beginPath();
        ctx.moveTo(at.x + Math.cos(ang) * (r + 10), at.y + Math.sin(ang) * (r + 10));
        ctx.lineTo(at.x + Math.cos(ang) * (r + 30), at.y + Math.sin(ang) * (r + 30));
        ctx.stroke();
      }
    }
    const c = this.coreAnchor();
    if (this.coreWin > 0) {
      const r = 70 * this.scale * (1 + 0.15 * pulse);
      const g = ctx.createRadialGradient(c.x, c.y, 4, c.x, c.y, r);
      g.addColorStop(0, `rgba(220,245,255,${0.8 * pulse})`);
      g.addColorStop(0.5, `rgba(130,200,255,${0.4 * pulse})`);
      g.addColorStop(1, 'rgba(80,160,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(c.x - r, c.y - r, r * 2, r * 2);
    }
    if (this.coreOpen) {
      const r = 80 * this.scale * (0.9 + 0.1 * pulse);
      const g = ctx.createRadialGradient(c.x, c.y, 2, c.x, c.y, r);
      g.addColorStop(0, `rgba(255,250,220,${0.95})`);
      g.addColorStop(0.3, `rgba(255,170,60,${0.7 * pulse + 0.2})`);
      g.addColorStop(1, 'rgba(255,60,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(c.x - r, c.y - r, r * 2, r * 2);
      ctx.strokeStyle = `rgba(190,235,255,${0.7})`;
      ctx.lineWidth = 3;
      for (let k = 0; k < 6; k++) {                    // the ice that cracked it open
        const ang = k * Math.PI / 3 + 0.3;
        ctx.beginPath();
        ctx.moveTo(c.x + Math.cos(ang) * r * 0.3, c.y + Math.sin(ang) * r * 0.3);
        ctx.lineTo(c.x + Math.cos(ang) * r * 0.95, c.y + Math.sin(ang) * r * 0.95);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // Broken plates show molten flesh; a temporarily exposed part pulses gold.
  drawSegments(ctx, time) {
    const data = this.anim.data;
    if (this.state === 'dormant') return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const sg of Object.values(this.segments)) {
      const a = data[sg.id === 'head' ? 'head' : sg.id];
      if (!a) continue;
      const c = this.frameToWorld(a);
      const pulse = 0.6 + 0.4 * Math.sin(time * 6 + c.x * 0.01);
      if (sg.broken) {
        const r = 44 * this.scale;
        const g = ctx.createRadialGradient(c.x, c.y, 2, c.x, c.y, r);
        g.addColorStop(0, `rgba(255,220,140,${0.75 * pulse})`);
        g.addColorStop(0.4, `rgba(255,120,30,${0.45 * pulse})`);
        g.addColorStop(1, 'rgba(255,60,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(c.x - r, c.y - r, r * 2, r * 2);
      } else if (sg.exposedT > 0) {
        ctx.strokeStyle = `rgba(255,214,110,${0.5 + 0.5 * pulse})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(c.x, c.y, 50 * this.scale * (0.9 + 0.1 * pulse), 0, Math.PI * 2);
        ctx.stroke();
      } else if (sg.hp < sg.max * 0.5) {
        ctx.strokeStyle = `rgba(255,170,70,${0.35 * pulse})`;      // cracked plate
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(c.x - 20, c.y - 18); ctx.lineTo(c.x + 4, c.y); ctx.lineTo(c.x - 6, c.y + 22);
        ctx.moveTo(c.x + 4, c.y); ctx.lineTo(c.x + 24, c.y - 6);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  drawChainCue(ctx) {
    const head = this.frameToWorld(this.anim.data.head);
    const k = this.chainCue / 0.5;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const r = 60 + 50 * (1 - k);
    const g = ctx.createRadialGradient(head.x, head.y, 2, head.x, head.y, r);
    g.addColorStop(0, `rgba(255,190,90,${0.85 * k})`);
    g.addColorStop(1, 'rgba(255,90,20,0)');
    ctx.fillStyle = g;
    ctx.fillRect(head.x - r, head.y - r, r * 2, r * 2);
    ctx.restore();
  }

  drawFeintCue(ctx) {
    const head = this.frameToWorld(this.anim.data.head);
    const k = this.feintCue / 0.6;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const r = 70 + 60 * (1 - k);
    const g = ctx.createRadialGradient(head.x, head.y, 2, head.x, head.y, r);
    g.addColorStop(0, `rgba(220,240,255,${0.9 * k})`);
    g.addColorStop(1, 'rgba(120,180,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(head.x - r, head.y - r, r * 2, r * 2);
    const rd = this.anim.data.rider;
    if (rd) {
      const q = this.frameToWorld(rd);
      ctx.fillStyle = `rgba(255,250,230,${k})`;
      ctx.beginPath();
      ctx.arc(q.x, q.y - 40, 12, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawDebug(ctx) {
    ctx.lineWidth = 2;
    for (const hb of this.hurtboxes()) {
      ctx.strokeStyle = hb.id === 'head' ? '#ffd36b' : '#7fd1ff';
      ctx.strokeRect(hb.rect.x, hb.rect.y, hb.rect.w, hb.rect.h);
    }
    ctx.strokeStyle = '#ff4a4a';
    if (this.debugBox) ctx.strokeRect(this.debugBox.x, this.debugBox.y, this.debugBox.w, this.debugBox.h);
    if (this.stream) {
      const st = this.stream;
      ctx.beginPath();
      ctx.moveTo(st.mouth.x, st.mouth.y);
      ctx.lineTo(st.impact.x, st.impact.y);
      ctx.stroke();
      if (st.groundHit) ctx.strokeRect(st.g0, this.floorY - 90, st.g1 - st.g0, 90);
    }
    if (this.strafe && this.strafe.band) {
      const b = this.strafe.band;
      ctx.strokeRect(b.x, b.y, b.w, b.h);
    }
  }
}
