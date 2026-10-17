import { PHYSICS, PLAYER } from '../data/config.js';
import { WEAPONS } from '../data/weapons.js';
import { boundsOf, clamp, damp } from '../core/math.js';
import { Animator } from './Animator.js';
import { Frostpiercer } from './Frostpiercer.js';
import { CrossbowBolt } from './Hazards.js';

// The northern warrior. States: move (ground + air), attack, recover,
// special, dodge, brace, shoot, reload, hurt, grabbed, thrown, dead.
// Weapon hitboxes come from the per-frame hand and blade-tip anchors
// exported with the sprite sheets; each weapon style (data/weapons.js
// STYLES) picks its animation, hit windows and cancel rules.

export class Player {
  constructor(game, stats, weapon, x, floorY, rules = {}) {
    this.game = game;
    const m = game.assets.manifest.warrior;
    this.sprite = m;
    this.anim = new Animator(m.animations);
    this.anim.play('idle');
    this.scale = PLAYER.scale;
    this.x = x;
    this.y = floorY;
    this.vx = 0;
    this.vy = 0;
    this.pushVx = 0;            // external push (wingstorm), added on top of vx
    this.facing = 1;
    this.onGround = true;
    this.state = 'move';
    this.stateTime = 0;
    this.maxHp = stats.maxHp;
    this.hp = stats.maxHp;
    this.attackPower = stats.attack;
    this.fireRes = stats.fireRes;
    this.weapon = weapon;
    this.loadout = [weapon];    // weapons carried this battle (armory weapon + battlefield finds)
    this.slot = 0;
    this.rules = rules;
    this.stamina = PLAYER.stamina.max;
    this.maxStamina = PLAYER.stamina.max;
    this.staminaWait = 0;
    this.exhausted = 0;
    this.specialCd = 0;
    this.dodgeCd = 0;
    this.switchCd = 0;
    this.iframes = 0;
    this.flash = 0;
    this.coyote = 0;
    this.landTimer = 0;
    this.chain = 0;
    this.swing = null;          // current hit context { mul, poise, type, hitSet, windows }
    this.prevAnchor = null;
    this.controlsLocked = false;
    this.damageTaken = 0;
    this.bounds = { min: 40, max: 1e9 };
    this.dodgeDir = 1;
    this.fireCharges = weapon.def.special.charges ?? 0;   // Lightbreaker: flames per battle
    this.ignited = 0;
    this.grab = null;
    this.braceSpear = 0;        // Long Spear set against a charge
    this.missLock = 0;
    // Level 7: Frostbrand's ice energy and ward, the Frostpiercer launcher
    const FB = WEAPONS.frostbrand;
    this.ice = rules.frostbrand ? { energy: FB.energy.start, wardT: 0, wardCd: 0, wardUsed: false } : null;
    this.fp = rules.frostpiercer ? new Frostpiercer(this) : null;
    this.fpStats = { fired: 0, hit: 0, missed: 0 };
    this.weaponsUsed = new Set();
    this.parries = 0;
  }

  // ---------------------------------------------------------------- Frostbrand
  get hasFrostbrand() { return !!this.ice && this.weapon.def.frostbrand; }
  get warded() { return !!this.ice && this.ice.wardT > 0; }

  gainIce(n) {
    if (!this.ice) return;
    this.ice.energy = Math.min(WEAPONS.frostbrand.energy.max, this.ice.energy + n);
  }

  // A blow passed through the roll's i-frames.
  onPrecisionDodge() {
    if (!this.ice || this.dodgeRewarded) return;
    this.dodgeRewarded = true;
    this.gainIce(WEAPONS.frostbrand.energy.dodge);
    this.game.combat.text(this.x, this.y - 290, 'PRECISION DODGE', '#9fe0ff', 30);
    this.game.particles.ice(this.x, this.y - 120, 12, 0.6);
    if (this.game.audio) this.game.audio.play('ice', { x: this.x, gain: 0.5 });
  }

  raiseWard() {
    const W = WEAPONS.frostbrand.ward, I = this.ice;
    if (!this.hasFrostbrand || I.wardCd > 0 || I.wardT > 0 || I.energy < W.cost) return;
    I.energy -= W.cost;
    I.wardT = W.hold;
    I.wardUsed = false;
    if (this.game.audio) this.game.audio.play('ward', { x: this.x });
  }

  endWard() {
    const W = WEAPONS.frostbrand.ward, I = this.ice;
    if (!I || I.wardT <= 0) return;
    I.wardT = 0;
    I.wardCd = I.wardUsed ? W.cooldown : W.rest;
  }

  // The ward takes a fire blow: blocked, and it must recover afterwards.
  wardBlock(major = false) {
    const I = this.ice;
    if (!I.wardUsed) {
      this.game.combat.text(this.x, this.y - 320, major ? 'THE WARD HOLDS' : 'WARDED', '#bfe4ff', major ? 50 : 38);
      this.game.particles.ice(this.x + this.facing * 60, this.y - 140, 40, 1.2);
      if (this.game.audio) this.game.audio.play('shatter', { x: this.x });
      this.game.camera.shake(0.3);
    }
    I.wardUsed = true;
    this.wardsHeld = (this.wardsHeld || 0) + (major ? 1 : 0);
  }

  // A blocked blow (the duel): a little damage, a little shove, no stun.
  chipHit(dmg, sourceX) {
    dmg = Math.max(1, Math.round(dmg));
    this.hp = Math.max(0, this.hp - dmg);
    this.damageTaken += dmg;
    this.flash = 0.1;
    this.pushVx = (this.x < sourceX ? -1 : 1) * 380;
    this.game.combat.text(this.x, this.y - 260, '-' + dmg, '#ffb0a0', 32);
    if (this.hp <= 0) { this.hp = 0.01; this.setState('move'); this.takeHit(1, sourceX, 300); }
  }

  // Thrown back by a parried blow: a short stun, no damage.
  recoil(time, sourceX) {
    this.swing = null;
    this.setState('hurt');
    this.anim.play('hurt', { restart: true });
    this.stateTime = Math.max(0, PLAYER.hurt.stun - time);
    this.vx = (this.x < sourceX ? -1 : 1) * 320;
  }

  get alive() { return this.state !== 'dead'; }

  get hurtbox() {
    const h = this.state === 'dodge' ? 130 : this.state === 'brace' && !this.duelBrace ? PLAYER.brace.hurtboxH : PLAYER.hurtbox.h;
    return { x: this.x - PLAYER.hurtbox.w / 2, y: this.y - h, w: PLAYER.hurtbox.w, h };
  }

  get invulnerable() {
    if (this.state === 'dead' || this.iframes > 0) return true;
    if (this.state === 'grabbed' || this.state === 'thrown') return true;
    if (this.state === 'dodge') {
      return this.stateTime >= PLAYER.dodge.iframeStart && this.stateTime <= PLAYER.dodge.iframeEnd;
    }
    return false;
  }

  get bracing() { return this.state === 'brace'; }

  setState(s) {
    this.state = s;
    this.stateTime = 0;
  }

  // frame pixel -> world point
  toWorld(p) {
    const piv = this.sprite.pivot;
    return { x: this.x + (p[0] - piv[0]) * this.scale * this.facing, y: this.y + (p[1] - piv[1]) * this.scale };
  }

  heal(n) { this.hp = Math.min(this.maxHp, this.hp + n); }

  takeHit(dmg, sourceX, knockback) {
    this.hp -= dmg;
    this.damageTaken += dmg;
    this.flash = 0.18;
    const dir = this.x < sourceX ? -1 : 1;
    if (this.hp <= 0) {
      this.hp = 0;
      this.setState('dead');
      this.anim.play('death', { restart: true });
      this.vx = dir * knockback * 0.6;
      this.vy = -420;
      this.onGround = false;
      return;
    }
    this.setState('hurt');
    this.anim.play('hurt', { restart: true });
    if (this.game.audio) this.game.audio.play('hurt', { x: this.x });
    this.iframes = PLAYER.hurt.iframes;
    this.vx = dir * knockback;
    this.vy = -380;
    this.onGround = false;
    this.swing = null;
  }

  // ---------------------------------------------------------------- weapons
  addWeapon(w) {
    this.loadout.push(w);
    this.switchTo(this.loadout.length - 1, true);
  }

  switchTo(i, force = false) {
    if (i === this.slot || !this.loadout[i]) return false;
    if (!force && (this.switchCd > 0 || (this.state !== 'move' && this.state !== 'brace'))) return false;
    this.slot = i;
    this.weapon = this.loadout[i];
    this.swing = null;
    this.switchCd = PLAYER.switchTime;
    if (this.state === 'brace') this.setState('move');
    if (this.onGround) this.anim.play('idle', { restart: true });
    this.game.particles.sparks(this.x + this.facing * 30, this.y - 140, 6, 'spark', 0.4);
    return true;
  }

  canDodge() {
    return this.onGround && this.dodgeCd <= 0 && (!this.rules.stamina || this.stamina >= PLAYER.stamina.dodgeCost);
  }

  // A roll pressed during the short cooldown stays buffered; one pressed
  // without the stamina for it is spent (and the stamina bar flashes).
  tryDodge(input, ax) {
    if (this.canDodge()) { input.consume('dodge'); this.startDodge(ax || this.facing); return true; }
    if (this.rules.stamina && this.onGround && this.dodgeCd <= 0) { input.consume('dodge'); this.exhausted = 0.6; }
    return false;
  }

  startAttack(chain = 0) {
    const st = this.weapon.style;
    if (st.ranged) return this.startShot();
    this.chain = chain;
    this.setState('attack');
    if (this.game.audio) this.game.audio.play('swing', { x: this.x, heavy: !!st.heavy });
    this.anim.play(st.anim, { restart: true, speed: this.weapon.def.speed * (chain ? 1.12 : 1) });
    this.beginSwing({ mul: PLAYER.chainDamage[chain] || 1, windows: st.windows });
  }

  beginSwing(opts) {
    const sp = this.weapon.def.special;
    const fire = this.ignited > 0 && sp.type === 'ignite';
    this.swing = {
      mul: (opts.mul ?? 1) * (fire ? sp.damageMul : 1),
      poise: (opts.poise ?? this.weapon.def.poise) * (fire ? 1.3 : 1),
      type: fire ? 'light' : opts.type ?? this.weapon.def.type,
      fire,
      windows: opts.windows ?? [{ frames: opts.frames ?? [2, 4] }],
      win: -1,
      vsDragon: opts.vsDragon ?? 1,
      lifesteal: opts.lifesteal ?? 0,
      heavy: opts.heavy ?? false,
      reach: (opts.reach ?? 1) * (this.weapon.def.reach ?? 1),
      arc: opts.arc ?? false,
      breakMul: opts.breakMul ?? 1,
      frostStrike: opts.frostStrike ?? false,
      landed: false,
      hitSet: new Set(),
    };
    this.prevAnchor = null;
    this.trail = [];
  }

  // Emits a swept hitbox from the previous and current blade positions.
  // Each hit window is a separate hit (twin daggers strike twice).
  updateSwing() {
    const s = this.swing;
    if (!s) return;
    const f = this.anim.frame;
    const data = this.anim.data;
    const wi = s.windows.findIndex(w => f >= w.frames[0] && f <= w.frames[1]);
    const near = s.windows.findIndex(w => f >= w.frames[0] - 1 && f <= w.frames[1] + 1);
    const win = s.windows[wi >= 0 ? wi : Math.max(0, near)];
    const off = !!(win && win.offhand);
    const tipF = off ? data.tips2 && data.tips2[this.weapon.id] : data.tips[this.weapon.id];
    const handF = off ? data.hands2 && data.hands2[this.weapon.id] : data.hand;
    if (!tipF || !handF) return;
    // longer weapons and sweeping specials reach past the drawn blade tip
    const hand = this.toWorld(handF), tip0 = this.toWorld(tipF);
    const tip = { x: hand.x + (tip0.x - hand.x) * s.reach, y: hand.y + (tip0.y - hand.y) * s.reach };
    const cur = [hand, tip];
    if (near >= 0) {
      this.trail.push({ hand, tip, t: this.stateTime });
      if (this.trail.length > 7) this.trail.shift();
    }
    if (wi >= 0) {
      if (wi !== s.win) { s.win = wi; s.hitSet = new Set(); this.prevAnchor = null; }
      const pts = this.prevAnchor ? cur.concat(this.prevAnchor) : cur;
      this.lastSwingBox = boundsOf(pts, 18);
      if (this.game.combat.playerStrike(this, this.lastSwingBox, s)) s.landed = true;
    } else {
      this.lastSwingBox = null;
    }
    this.prevAnchor = cur;
  }

  startShot() {
    const w = this.weapon;
    if (!w.loaded) {
      if (w.ammo > 0) return this.startReload();
      this.game.combat.text(this.x, this.y - 300, 'NO BOLTS', '#a8a29a', 30);
      return;
    }
    this.setState('shoot');
    this.anim.play('shoot', { restart: true });
    this.shotFired = false;
  }

  startReload() {
    this.setState('reload');
    this.anim.play('reload', { restart: true, speed: 1 / this.weapon.def.reload });
  }

  fireBolt(opts = {}) {
    const data = this.anim.data;
    const tip = this.toWorld(data.tips[this.weapon.id]);
    const angle = this.game.combat.aimFor(this, tip);
    this.game.hazards.add(new CrossbowBolt(this, tip, angle, opts));
    this.weapon.loaded = false;
    this.game.camera.shake(0.08);
    this.game.particles.sparks(tip.x, tip.y, 6, 'spark', 0.5);
  }

  startDodge(dir) {
    if (this.rules.stamina) {
      this.stamina -= PLAYER.stamina.dodgeCost;
      this.staminaWait = PLAYER.stamina.delay;
    }
    this.setState('dodge');
    this.dodgeRewarded = false;
    if (this.game.audio) this.game.audio.play('roll', { x: this.x });
    this.dodgeDir = dir;
    this.facing = dir;
    this.anim.play('dodge', { restart: true, speed: (7 / 14) / PLAYER.dodge.duration });
    this.game.particles.dust(this.x, this.y, 6, -dir);
    this.swing = null;
  }

  // Wind from a wingstorm: braced, behind stone or mid-roll it barely moves you.
  windPush(dir, force, maxPush, dt, sheltered) {
    if (!this.alive || this.state === 'grabbed' || this.state === 'thrown') return;
    const k = sheltered || (this.state === 'dodge' && this.invulnerable) ? 0 : this.bracing ? PLAYER.brace.push : 1;
    this.pushVx = approach(this.pushVx, dir * maxPush * k, force * dt);
  }

  update(dt, input, level) {
    this.stateTime += dt;
    this.iframes = Math.max(0, this.iframes - dt);
    this.specialCd = Math.max(0, this.specialCd - dt);
    this.dodgeCd = Math.max(0, this.dodgeCd - dt);
    this.switchCd = Math.max(0, this.switchCd - dt);
    this.flash = Math.max(0, this.flash - dt);
    this.exhausted = Math.max(0, this.exhausted - dt);
    this.burning = Math.max(0, (this.burning || 0) - dt);
    if (this.burning > 0 && Math.random() < 0.5) this.game.particles.embers(this.x, this.y - 120, 1, 30);
    this.landTimer = Math.max(0, this.landTimer - dt);
    if (this.rules.stamina) {
      if (this.staminaWait > 0) this.staminaWait -= dt;
      else this.stamina = Math.min(this.maxStamina, this.stamina + PLAYER.stamina.regen * dt);
    }
    this.pushVx = damp(this.pushVx, 0, 3, dt);
    this.slip = Math.max(0, (this.slip || 0) - dt * 3);      // frozen sand (Viserion)
    if (this.ice) {
      this.ice.wardCd = Math.max(0, this.ice.wardCd - dt);
      if (this.ice.wardT > 0) {
        this.ice.wardT -= dt;
        if (this.ice.wardT <= 0) { this.ice.wardT = 0.0001; this.endWard(); }
      }
    }

    const locked = this.controlsLocked;
    const ax = locked ? 0 : input.axis();
    const buf = PLAYER.bufferTime;
    const want = a => !locked && input.buffered(a, buf);
    let gravity = PHYSICS.gravity;

    switch (this.state) {
      case 'move': {
        const target = ax * PLAYER.runSpeed;
        // on frozen sand there is little grip: hard to stop, slow to turn
        const grip = this.onGround ? 1 - 0.85 * this.slip : 1;
        const accel = (this.onGround ? (ax ? PLAYER.groundAccel : PLAYER.groundDecel) : PLAYER.airAccel) * grip;
        this.vx = approach(this.vx, target, accel * dt);
        if (ax) this.facing = ax;
        if (want('jump') && (this.onGround || this.coyote > 0)) {
          input.consume('jump');
          this.vy = -PLAYER.jumpVelocity;
          this.onGround = false;
          this.coyote = 0;
          this.game.particles.dust(this.x, this.y, 5);
        }
        if (!locked && input.released('jump') && this.vy < 0) this.vy *= PLAYER.jumpCut;
        if (this.loadout.length > 1 && this.switchCd <= 0) {
          if (want('swap')) { input.consume('swap'); this.switchTo((this.slot + 1) % this.loadout.length); }
          for (let k = 1; k <= 6; k++) {
            if (want('slot' + k)) { input.consume('slot' + k); this.switchTo(k - 1); }
          }
        }
        if (want('attack') && this.switchCd <= 0) { input.consume('attack'); this.startAttack(0); break; }
        if (want('dodge') && this.onGround && this.tryDodge(input, ax)) break;
        if (want('special') && this.specialCd <= 0 && this.switchCd <= 0) {
          input.consume('special');
          this.weapon.startSpecial(this, this.game);
          break;
        }
        if (this.fp && want('deploy') && this.onGround && this.switchCd <= 0) {
          input.consume('deploy');
          if (this.fp.deploy()) break;
        }
        if (!locked && this.onGround && input.isDown('brace')) {
          this.setState('brace');
          if (this.ice) this.raiseWard();
          break;
        }
        this.pickMoveAnim();
        break;
      }
      case 'brace': {
        this.vx = damp(this.vx, 0, 16, dt);
        this.anim.set('jump', 5);
        if (want('dodge') && this.tryDodge(input, ax)) { this.endWard(); break; }
        if (locked || !input.isDown('brace') || !this.onGround) { this.endWard(); this.setState('move'); }
        break;
      }
      case 'fp': {
        if (locked) { this.fp.stow(); }
        this.fp.update(dt, input, want, ax);
        break;
      }
      case 'attack': {
        const st = this.weapon.style;
        const f = this.anim.frame;
        const lunge = st.windows[0].frames;
        if (this.onGround) {
          const step = f >= lunge[0] && f <= lunge[0] + 1 ? this.facing * PLAYER.attackStep * (st.heavy ? 1.2 : 2.2) : 0;
          this.vx = damp(this.vx, step, 14, dt);
        } else {
          this.vx = approach(this.vx, ax * PLAYER.runSpeed * 0.6, PLAYER.airAccel * dt);
        }
        this.updateSwing();
        const [c0, c1] = st.chainWindow || PLAYER.attackChainWindow;
        if (f >= c0 && f <= c1 && want('attack') && this.chain < (st.chain ?? PLAYER.maxChain) - 1) {
          input.consume('attack');
          if (ax) this.facing = ax;
          this.startAttack(this.chain + 1);
          break;
        }
        if (f >= (st.dodgeFrom ?? 5) && want('dodge') && this.onGround && this.tryDodge(input, ax)) break;
        if (this.anim.finished) {
          // a heavy swing that hits nothing leaves you open
          const miss = st.heavy && this.swing && !this.swing.landed && this.weapon.def.missRecovery;
          this.swing = null;
          if (miss) { this.missLock = this.weapon.def.missRecovery; this.setState('recover'); }
          else this.setState('move');
        }
        break;
      }
      case 'recover': {
        this.vx = damp(this.vx, 0, 10, dt);
        this.anim.set(this.weapon.style.anim, this.anim.def.frames - 1);
        if (this.stateTime >= this.missLock) { this.missLock = 0; this.setState('move'); }
        break;
      }
      case 'shoot': {
        this.vx = damp(this.vx, 0, 12, dt);
        if (this.anim.frame >= this.weapon.style.fireFrame && !this.shotFired) {
          this.shotFired = true;
          this.fireBolt();
        }
        if (this.anim.finished) {
          if (this.weapon.ammo > 0) this.startReload();
          else this.setState('move');
        }
        break;
      }
      case 'reload': {
        // slow and exposed; a roll cancels it (the bolt is not lost)
        this.vx = approach(this.vx, ax * PLAYER.runSpeed * 0.3, PLAYER.groundAccel * dt);
        if (want('dodge') && this.tryDodge(input, ax)) break;
        if (this.anim.finished) {
          this.weapon.ammo--;
          this.weapon.loaded = true;
          this.setState('move');
        }
        break;
      }
      case 'special': {
        const res = this.weapon.updateSpecial(this, dt, this.game);
        if (res && res.gravity !== undefined) gravity = res.gravity;
        if (!res || res.done) { this.swing = null; this.braceSpear = 0; this.setState('move'); }
        break;
      }
      case 'dodge': {
        const t = clamp(this.stateTime / PLAYER.dodge.duration, 0, 1);
        this.vx = this.dodgeDir * PLAYER.dodge.speed * (1 - t * t);
        if (Math.random() < 0.4) this.game.particles.dust(this.x, this.y, 1, -this.dodgeDir);
        if (this.stateTime >= PLAYER.dodge.duration) {
          this.dodgeCd = PLAYER.dodge.cooldown;
          this.setState('move');
        }
        break;
      }
      case 'hurt': {
        this.vx = damp(this.vx, 0, this.onGround ? 8 : 2, dt);
        if (this.stateTime >= PLAYER.hurt.stun && this.onGround) this.setState('move');
        break;
      }
      case 'grabbed': {
        // held in the dragon's jaws, then hurled behind it
        const g = this.grab, d = g.dragon;
        g.t += dt;
        const m = d.frameToWorld(d.anim.data.mouth);
        this.x = m.x;
        this.y = Math.min(level.floorY, m.y + 150);
        this.vx = 0;
        this.vy = 0;
        gravity = 0;
        this.anim.set('hurt', 0);
        if (g.t >= g.hold || !d.alive) {
          const dir = -d.facing;
          this.setState('thrown');
          this.vx = dir * g.speed;
          this.vy = -950;
          this.facing = -dir;
          this.onGround = false;
          this.game.combat.throwDamage(g.damage, this);
          this.game.camera.shake(0.5);
        }
        break;
      }
      case 'thrown': {
        this.anim.set('hurt', 1);
        if (this.onGround && this.stateTime > 0.1) {
          this.setState('hurt');
          this.iframes = 1.0;
          this.vx *= 0.3;
          this.game.particles.dust(this.x, this.y, 14);
          this.game.camera.shake(0.3);
        }
        break;
      }
      case 'dead': {
        this.vx = damp(this.vx, 0, this.onGround ? 6 : 1, dt);
        break;
      }
    }

    if (this.ignited > 0) {
      this.ignited = Math.max(0, this.ignited - dt);
      const data = this.anim.data, tipF = data.tips[this.weapon.id];
      if (tipF && this.weapon.def.special.type === 'ignite') {
        const h = this.toWorld(data.hand), t = this.toWorld(tipF);
        for (let i = 0; i < 2; i++) {
          const k = 0.25 + Math.random() * 0.75;
          this.game.particles.fire(h.x + (t.x - h.x) * k, h.y + (t.y - h.y) * k, { x: 0, y: -1 }, 120, 1,
                                   { spread: 0.8, sizeMul: 0.45, lifeMul: 0.6, collide: false });
        }
      }
    }
    if (this.weapon.frost >= 1 && Math.random() < 0.4) {
      const data = this.anim.data, tipF = data.tips[this.weapon.id];
      if (tipF) {
        const t = this.toWorld(tipF);
        this.game.particles.ice(t.x, t.y, 1, 0.2);
      }
    }
    this.integrate(dt, gravity, level);
    this.anim.update(dt);
  }

  grabbedBy(dragon, spec) {
    this.setState('grabbed');
    this.grab = { dragon, t: 0, hold: spec.hold, speed: spec.throwSpeed, damage: spec.throwDamage };
    this.swing = null;
  }

  pickMoveAnim() {
    if (!this.onGround) {
      const vy = this.vy;
      const f = vy < -700 ? 1 : vy < -150 ? 2 : vy < 260 ? 3 : 4;
      this.anim.set('jump', f);
    } else if (this.landTimer > 0) {
      this.anim.set('jump', 5);
    } else if (Math.abs(this.vx) > 40) {
      this.anim.play('run', { speed: clamp(Math.abs(this.vx) / PLAYER.runSpeed, 0.5, 1.2) });
    } else {
      this.anim.play('idle');
    }
  }

  integrate(dt, gravity, level) {
    const wasAir = !this.onGround;
    const fallSpeed = this.vy;
    this.vy = Math.min(PHYSICS.maxFall, this.vy + gravity * dt);

    // horizontal
    this.x += (this.vx + this.pushVx) * dt;
    const half = PLAYER.hurtbox.w / 2 - 4;
    for (const s of level.solids) {
      if (s.prop && s.prop.walkThrough) continue;            // a column the warrior passes in front of
      if (this.y > s.y + 2 && this.y - 200 < s.y + s.h && this.x + half > s.x && this.x - half < s.x + s.w) {
        if (this.x < s.x + s.w / 2) this.x = s.x - half;
        else this.x = s.x + s.w + half;
        this.vx = 0;
        this.pushVx = 0;
      }
    }
    this.x = clamp(this.x, this.bounds.min, this.bounds.max);

    // vertical
    const prevY = this.y;
    this.y += this.vy * dt;
    this.onGround = false;
    if (this.y >= level.floorY) {
      this.y = level.floorY;
      this.vy = 0;
      this.onGround = true;
    }
    const solidTops = level.solids.filter(s => !(s.prop && s.prop.walkThrough));
    const tops = level.platforms ? solidTops.concat(level.platforms.map(pl => pl.slab)) : solidTops;
    for (const s of tops) {
      if (this.vy >= 0 && prevY <= s.y + 1 && this.y >= s.y && this.x + half > s.x && this.x - half < s.x + s.w) {
        this.y = s.y;
        this.vy = 0;
        this.onGround = true;
      }
    }
    if (this.onGround) {
      this.coyote = PLAYER.coyoteTime;
      if (wasAir && fallSpeed > 600) {
        this.landTimer = 0.08;
        this.game.particles.dust(this.x, this.y, 8);
      }
    } else {
      this.coyote = Math.max(0, this.coyote - dt);
    }
  }

  draw(renderer) {
    const m = this.sprite;
    const variant = this.state === 'fp' ? 'unarmed' : this.weapon.id;      // the sword is sheathed while it is out
    const img = this.game.assets.image(
      m.sheet_pattern.replace('{variant}', variant).replace('{anim}', this.anim.name));
    const blink = this.iframes > 0 && this.state !== 'dead' && Math.floor(this.iframes * 20) % 2 === 0;
    const ctx = renderer.ctx;
    ctx.fillStyle = 'rgba(8,12,20,0.35)';
    ctx.beginPath();
    ctx.ellipse(this.x, this.game.levels.level.floorY + 2, 58, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    this.drawTrail(ctx);
    if (this.fp) this.fp.drawBack(ctx);
    renderer.drawFrame(img, this.anim.frame, m.frame_size[0], m.frame_size[1], this.x, this.y, m.pivot,
                       this.scale, this.facing < 0, {
                         flash: this.flash > 0 ? 0.75 : 0, alpha: blink ? 0.45 : 1,
                         tint: this.burning > 0 ? 'rgba(255,110,30,0.38)' : null });
    if (this.fp) this.fp.draw(ctx, this.game.levels.realTime);
    if (this.warded) this.drawWard(ctx);
    if (this.braceSpear > 0) {                // the set spear glints
      const tip = this.toWorld(this.anim.data.tips[this.weapon.id]);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = 'rgba(255,240,200,0.7)';
      ctx.beginPath();
      ctx.arc(tip.x, tip.y, 10 + 4 * Math.sin(this.stateTime * 30), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}

// Frostbrand's ice ward: a shield of frost before the warrior.
Player.prototype.drawWard = function (ctx) {
  const t = this.game.levels.realTime;
  const used = this.ice.wardUsed;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const cx = this.x + this.facing * 70, cy = this.y - 130;
  const g = ctx.createRadialGradient(cx, cy, 10, cx, cy, 170);
  g.addColorStop(0, `rgba(200,240,255,${used ? 0.15 : 0.32})`);
  g.addColorStop(1, 'rgba(120,200,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(cx - 170, cy - 170, 340, 340);
  ctx.strokeStyle = `rgba(190,235,255,${(used ? 0.35 : 0.8) * (0.7 + 0.3 * Math.sin(t * 20))})`;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.ellipse(cx, cy, 46, 150, 0, -Math.PI / 2, Math.PI / 2, this.facing < 0);
  ctx.stroke();
  for (let k = 0; k < 5; k++) {
    const yy = cy - 120 + k * 60;
    ctx.beginPath();
    ctx.moveTo(cx, yy);
    ctx.lineTo(cx + this.facing * 24, yy + 18);
    ctx.stroke();
  }
  ctx.restore();
};

// A pale crescent following the blade (blue-white and wider for sweeps).
Player.prototype.drawTrail = function (ctx) {
  const tr = this.trail;
  if (!this.swing || !tr || tr.length < 2 || this.stateTime - tr[tr.length - 1].t > 0.12) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = this.swing.fire ? 'rgba(255,170,60,0.6)' : this.swing.arc ? 'rgba(150,205,255,0.5)'
    : this.swing.type === 'frost' ? 'rgba(150,220,255,0.45)' : 'rgba(225,235,255,0.32)';
  ctx.beginPath();
  ctx.moveTo(tr[0].tip.x, tr[0].tip.y);
  for (const p of tr) ctx.lineTo(p.tip.x, p.tip.y);
  for (let i = tr.length - 1; i >= 0; i--) {
    const p = tr[i];
    ctx.lineTo(p.hand.x * 0.35 + p.tip.x * 0.65, p.hand.y * 0.35 + p.tip.y * 0.65);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
};

function approach(v, target, step) {
  if (v < target) return Math.min(target, v + step);
  if (v > target) return Math.max(target, v - step);
  return v;
}
