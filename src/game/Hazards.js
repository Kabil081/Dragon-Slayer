import { circleRect, clamp, lerp, overlaps, rand } from '../core/math.js';
import { FROSTPIERCER } from '../data/weapons.js';

// Short-lived gameplay objects that are neither player nor dragon:
// weapon special projectiles, area effects and dragon projectiles. Each has
// update/draw and is removed when `dead` is set.

export class Hazards {
  constructor() { this.list = []; }
  add(h) { this.list.push(h); return h; }
  update(dt, game) {
    for (const h of this.list) h.update(dt, game);
    this.list = this.list.filter(h => !h.dead);
  }
  draw(ctx, game) { for (const h of this.list) h.draw(ctx, game); }
  clear() { this.list.length = 0; }
}

export class FrostNova {
  constructor(player, spec) {
    this.x = player.x + player.facing * 40;
    this.y = player.y - 110;
    this.spec = spec;
    this.t = 0;
    this.dur = 0.45;
    this.hit = false;
    this.player = player;
  }

  update(dt, game) {
    if (this.t === 0) {
      game.particles.ice(this.x, this.y, 60, 1.2);
      game.camera.shake(0.25);
    }
    this.t += dt;
    const r = this.spec.radius * Math.min(1, this.t / 0.25);
    if (!this.hit) {
      const d = game.levels.dragonTouching(this.x, this.y, r);
      if (d && d.hittable) {
        for (const box of d.hurtboxes()) {
          if (circleRect(this.x, this.y, r, box.rect)) {
            this.hit = true;
            game.combat.areaStrike(this.player, { x: this.x, y: this.y }, {
              mul: this.spec.damageMul, poise: this.spec.poise, type: 'frost', heavy: true, dragon: d });
            d.applySlow(this.spec.slow, this.spec.slowTime);
            break;
          }
        }
      }
    }
    if (this.t >= this.dur) this.dead = true;
  }

  draw(ctx) {
    const k = Math.min(1, this.t / 0.25);
    const r = this.spec.radius * k;
    const a = 1 - this.t / this.dur;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(this.x, this.y, r * 0.2, this.x, this.y, r);
    g.addColorStop(0, `rgba(120,200,255,0)`);
    g.addColorStop(0.75, `rgba(150,220,255,${0.35 * a})`);
    g.addColorStop(1, `rgba(230,250,255,${0.7 * a})`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export class EmberWave {
  constructor(player, spec) {
    this.player = player;
    this.spec = spec;
    this.dir = player.facing;
    this.x = player.x + this.dir * 80;
    this.y = player.y;
    this.travelled = 0;
    this.hit = false;
  }

  get rect() { return { x: this.x - 50, y: this.y - 190, w: 100, h: 190 }; }

  update(dt, game) {
    const step = this.spec.speed * dt;
    this.x += this.dir * step;
    this.travelled += step;
    for (let i = 0; i < 4; i++) {
      game.particles.add({ kind: 'fire', x: this.x + rand(-30, 30), y: this.y - rand(0, 170),
                           vx: this.dir * rand(100, 300), vy: rand(-200, -60), max: rand(0.3, 0.5),
                           size: rand(20, 34), size1: rand(60, 90), drag: 1.5, gravity: -200, layer: 'front' });
    }
    const level = game.levels.level;
    if (level.blocksAt(this.x, this.y - 40)) this.dead = true;
    const d = game.levels.dragonTouching(this.rect);
    if (!this.hit && d && d.hittable && d.hurtboxes().some(b => overlap(this.rect, b.rect))) {
      this.hit = true;
      game.combat.areaStrike(this.player, { x: this.x, y: this.y - 100 }, {
        mul: this.spec.damageMul, poise: this.spec.poise, type: 'fire', dragon: d });
      this.dead = true;
    }
    if (this.travelled > this.spec.range) this.dead = true;
  }

  draw() {}
}

function overlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

// Dragon fireball: a slightly arcing shot aimed at the locked reticle. It
// bursts at the reticle (so the circle shown is the danger zone), or
// earlier on stone (cracking breakable cover), the floor or the player.
// A mid-roll player passes straight through it.
export class Fireball {
  constructor(game, from, target, spec) {
    this.x = from.x;
    this.y = from.y;
    this.spec = spec;
    const dx = target.x - from.x, dy = target.y - from.y;
    const T = Math.max(0.35, Math.hypot(dx, dy) / spec.projectileSpeed);
    this.g = spec.gravity ?? 500;
    this.vx = dx / T;
    this.vy = (dy - 0.5 * this.g * T * T) / T;
    this.r = spec.radius ?? 30;
    this.t = 0;
    this.target = target;
    this.dir = Math.sign(dx) || 1;
  }

  update(dt, game) {
    this.t += dt;
    this.vy += this.g * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    const L = Math.hypot(this.vx, this.vy) || 1;
    if (this.spec.rock) { if (Math.random() < 0.5) game.particles.dust(this.x, this.y, 1, -Math.sign(this.vx)); }
    else game.particles.fire(this.x, this.y, { x: -this.vx / L, y: -this.vy / L }, 160, 2,
                             { spread: 0.5, sizeMul: 0.7, gold: this.spec.gold });
    const lm = game.levels, level = lm.level, p = lm.player;
    if (p && p.alive && circleRect(this.x, this.y, this.r, p.hurtbox) && !p.invulnerable) {
      game.combat.hitPlayer(this.spec.damage, 'fire', this.x - Math.sign(this.vx) * 60, this.spec.knockback);
      return this.burst(game, false);
    }
    const hit = level.solidAt(this.x, this.y, this.r * 0.5);
    if (hit) {
      level.damageSolid(hit, 1, game);
      return this.burst(game, false);
    }
    if (this.y >= level.floorY - 6) return this.burst(game, true);
    if ((this.x - this.target.x) * this.dir >= 0) return this.burst(game, true);
    if (this.t > 4) this.dead = true;
  }

  burst(game, onFloor) {
    this.dead = true;
    if (this.spec.rock) {
      game.particles.debris(this.x, this.y - 10, 22, 90);
      game.particles.dust(this.x, game.levels.level.floorY, 18);
    } else {
      game.particles.fire(this.x, this.y - 10, { x: 0, y: -1 }, 420, 26, { spread: 1.4, gold: this.spec.gold });
      game.particles.sparks(this.x, this.y, 14, this.spec.gold ? 'gold' : 'mid');
    }
    if (game.audio) game.audio.play(this.spec.rock ? 'boom' : 'fireball', { x: this.x, size: 0.3, gain: 0.7 });
    game.camera.shake(0.16);
    const p = game.levels.player;
    if (onFloor && p && p.alive && this.spec.splashRadius &&
        circleRect(this.x, this.y, this.spec.splashRadius, p.hurtbox)) {
      game.combat.hitPlayer(this.spec.splashDamage, 'fire', this.x, this.spec.knockback * 0.6);
    }
  }

  draw(ctx) {
    const r = this.r;
    if (this.spec.rock) {                      // a block of the gate, tumbling
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.t * 7);
      ctx.fillStyle = '#5a5e6a';
      ctx.strokeStyle = '#14161c';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-r, -r * 0.6); ctx.lineTo(-r * 0.2, -r); ctx.lineTo(r, -r * 0.5); ctx.lineTo(r * 0.8, r * 0.7);
      ctx.lineTo(-r * 0.4, r); ctx.lineTo(-r, r * 0.3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'rgba(226,234,242,0.85)';
      ctx.fillRect(-r * 0.5, -r * 0.8, r, r * 0.25);
      ctx.restore();
      return;
    }
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, r * 2.2);
    g.addColorStop(0, 'rgba(255,250,220,1)');
    g.addColorStop(0.35, this.spec.gold ? 'rgba(255,214,90,0.95)' : 'rgba(255,170,60,0.9)');
    g.addColorStop(1, this.spec.gold ? 'rgba(255,150,0,0)' : 'rgba(255,60,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(this.x, this.y, r * 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// Shockwave from a ground slam: a low wave of shattered ice running along
// the floor. It stops at cover; jumping or rolling avoids it.
export class GroundShock {
  constructor(game, x, dir, spec) {
    this.kind = 'shock';
    this.front = x;
    this.from = x;
    this.dir = dir;
    this.spec = spec;
    this.hit = false;
  }

  get rect() {
    const s = this.spec;
    return { x: this.dir > 0 ? this.front - 140 : this.front, y: 900 - s.waveHeight, w: 140, h: s.waveHeight };
  }

  update(dt, game) {
    const s = this.spec;
    const level = game.levels.level;
    this.front += this.dir * s.waveSpeed * dt;
    const r = this.rect;
    r.y = level.floorY - s.waveHeight;
    for (let i = 0; i < 3; i++) {
      game.particles.ice(this.front + Math.random() * 30 * -this.dir, level.floorY - 10, 1, 0.5);
    }
    if (Math.random() < 0.5) game.particles.dust(this.front, level.floorY, 1, this.dir);
    const p = game.levels.player;
    if (!this.hit && p && p.alive && !p.invulnerable && overlap(r, p.hurtbox)) {
      this.hit = game.combat.hitPlayer(s.waveDamage, 'physical', this.front - this.dir * 100, s.knockback * 0.6);
    }
    if (level.blocksAt(this.front, level.floorY - 30) || Math.abs(this.front - this.from) > s.waveRange) this.dead = true;
  }

  draw(ctx) {
    const r = this.rect;
    const g = ctx.createLinearGradient(0, r.y, 0, r.y + r.h);
    g.addColorStop(0, 'rgba(200,235,255,0)');
    g.addColorStop(1, 'rgba(200,235,255,0.75)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(r.x, r.y + r.h);
    ctx.lineTo(this.front, r.y);
    ctx.lineTo(this.dir > 0 ? r.x + r.w : r.x, r.y + r.h);
    ctx.fill();
  }
}

// A scorpion bolt: very fast, slight drop, big hit. Only dragons care.
export class ScorpionBolt {
  constructor(x, y, angle, spec, img) {
    this.x = x;
    this.y = y;
    this.vx = Math.cos(angle) * spec.boltSpeed;
    this.vy = Math.sin(angle) * spec.boltSpeed;
    this.spec = spec;
    this.img = img;
    this.t = 0;
  }

  update(dt, game) {
    this.t += dt;
    this.vy += 260 * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    game.particles.add({ kind: 'dot', sprite: 'spark', x: this.x, y: this.y, vx: 0, vy: 0, max: 0.25, size: 14,
                         size1: 2, layer: 'front' });
    const d = game.levels.dragonTouching(this.x, this.y, 22);
    const hb = d && d.alive && d.state !== 'dormant' ? d.hurtboxes().find(b => circleRect(this.x, this.y, 22, b.rect)) : null;
    if (hb) {
      d.scorpionHit(this.spec.boltDamage, hb);
      game.particles.sparks(this.x, this.y, 30, 'spark', 1.4);
      game.camera.shake(0.45);
      game.hitstop = Math.max(game.hitstop, 0.1);
      this.dead = true;
      return;
    }
    const level = game.levels.level;
    // heavy bolts fly over and through cover, so a scorpion always has a shot
    if (this.y > level.floorY || this.t > 2.5) this.dead = true;
  }

  draw(ctx) {
    if (!this.img) return;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(Math.atan2(this.vy, this.vx));
    ctx.drawImage(this.img, -this.img.width * 0.9, -this.img.height / 2);
    ctx.restore();
  }
}

// Burning wreckage: a marked circle on the bridge, then a flaming rock.
export class FallingDebris {
  constructor(x, spec, delay) {
    this.kind = 'debris';
    this.x = x;
    this.spec = spec;
    this.delay = delay;
    this.t = 0;
    this.done = false;
    this.burn = 0;
  }

  get falling() { return !this.done && this.t > this.delay - 0.3; }

  update(dt, game) {
    this.t += dt;
    const floor = game.levels.level.floorY;
    if (this.falling) {
      const k = (this.t - (this.delay - 0.3)) / 0.3;
      this.y = -120 + (floor + 120) * k;
      game.particles.fire(this.x, this.y, { x: 0, y: -1 }, 200, 2, { spread: 0.5, sizeMul: 0.8, collide: false });
    }
    if (!this.done && this.t >= this.delay) {
      this.done = true;
      this.burn = 0.6;
      game.particles.fire(this.x, floor - 20, { x: 0, y: -1 }, 520, 26, { spread: 1.3 });
      game.particles.debris(this.x, floor - 20, 12, 60);
      game.camera.shake(0.25);
      const p = game.levels.player;
      if (p && p.alive && Math.abs(p.x - this.x) < this.spec.radius && p.y > floor - 160) {
        game.combat.hitPlayer(this.spec.damage, 'fire', this.x, 500);
      }
    }
    if (this.done) {
      this.burn -= dt;
      if (Math.random() < 0.6) game.particles.fire(this.x + (Math.random() - 0.5) * 80, floor - 6, { x: 0, y: -1 }, 120, 1, { sizeMul: 0.6 });
      if (this.burn <= 0) this.dead = true;
    }
  }

  draw(ctx, game) {
    const floor = game.levels.level.floorY;
    if (!this.done) {
      const k = Math.min(1, this.t / this.delay);
      const pulse = 0.55 + 0.45 * Math.sin(this.t * 20);
      ctx.save();
      ctx.fillStyle = `rgba(255,90,30,${0.15 + 0.3 * k})`;
      ctx.strokeStyle = `rgba(255,170,80,${0.5 + 0.5 * pulse})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(this.x, floor, this.spec.radius, 20, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    if (this.falling) {
      ctx.save();
      ctx.fillStyle = '#2a2220';
      ctx.strokeStyle = '#ff8a3a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(this.x, this.y, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }
}

// ------------------------------------------------------------ Level 7 ---
// Balerion's Firestorm: a marked stretch of the walkway erupts into
// pillars of fire for a few seconds. The mark shows first.
export class FireZone {
  constructor(x, spec) {
    this.kind = 'firezone';
    this.x = x;
    this.w = spec.width;
    this.spec = spec;
    this.t = 0;
    this.tick = 0;
    this.light = 0;
  }

  get live() { return this.t >= this.spec.warn && this.t < this.spec.warn + this.spec.burn; }

  update(dt, game) {
    this.t += dt;
    const S = this.spec, floor = game.levels.level.floorY;
    if (this.t < S.warn) {
      if (Math.random() < 0.5) game.particles.embers(this.x + rand(-this.w / 2, this.w / 2), floor - 4, 1, 40);
    } else if (this.live) {
      if (!this.erupted) {
        this.erupted = true;
        game.camera.shake(0.35);
        if (game.audio) game.audio.play('fire', { x: this.x, dur: S.burn * 0.8, gain: 0.8 });
      }
      this.light = 360;
      for (let i = 0; i < 4; i++) {
        game.particles.fire(this.x + rand(-this.w / 2, this.w / 2), floor - 6, { x: rand(-0.15, 0.15), y: -1 },
                            rand(520, 900), 1, { spread: 0.25, sizeMul: 1.2, lifeMul: 0.9 });
      }
      const p = game.levels.player;
      this.tick -= dt;
      if (this.tick <= 0 && p && p.alive && p.y >= floor - 300 && Math.abs(p.x - this.x) < this.w / 2 + 20) {
        this.tick = S.rate;
        game.combat.burnPlayer(S.tick, this.x);
      }
    } else {
      this.light = 0;
    }
    if (this.t >= S.warn + S.burn) this.dead = true;
  }

  draw(ctx, game) {
    const S = this.spec, floor = game.levels.level.floorY;
    const pulse = 0.6 + 0.4 * Math.sin(this.t * 18);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    if (this.t < S.warn) {
      const k = this.t / S.warn;
      const g = ctx.createLinearGradient(0, floor - 120, 0, floor + 4);
      g.addColorStop(0, 'rgba(255,70,20,0)');
      g.addColorStop(1, `rgba(255,90,30,${(0.25 + 0.5 * k) * pulse})`);
      ctx.fillStyle = g;
      ctx.fillRect(this.x - this.w / 2, floor - 120, this.w, 124);
      ctx.fillStyle = `rgba(255,200,120,${0.4 + 0.5 * k})`;
      ctx.fillRect(this.x - this.w / 2, floor - 3, this.w, 6);
    } else {
      const fade = Math.min(1, (S.warn + S.burn - this.t) / 0.5);
      const g = ctx.createLinearGradient(0, floor - 420, 0, floor);
      g.addColorStop(0, 'rgba(255,120,30,0)');
      g.addColorStop(1, `rgba(255,150,50,${0.5 * fade})`);
      ctx.fillStyle = g;
      ctx.fillRect(this.x - this.w / 2, floor - 420, this.w, 424);
    }
    ctx.restore();
  }
}

// Frostpiercer's spear of ice-forged steel. Charge flattens and speeds its
// flight. It pierces armor; it bursts in an icy explosion on a dragon; a
// miss is a wasted spear.
export class IceSpear {
  constructor(player, from, angle, charge) {
    this.kind = 'icespear';
    this.player = player;
    this.x = from.x;
    this.y = from.y;
    this.charge = charge;
    this.full = charge >= 0.98;
    const F = FROSTPIERCER;
    const speed = lerp(F.speed[0], F.speed[1], charge);
    this.g = lerp(F.gravity[0], F.gravity[1], charge);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.t = 0;
    const m = player.game.assets.manifest.objects.frostpiercer;
    this.img = player.game.assets.image(m.spear);
    this.meta = m;
  }

  update(dt, game) {
    this.t += dt;
    this.vy += this.g * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    if (Math.random() < 0.8) game.particles.ice(this.x - this.vx * 0.01, this.y - this.vy * 0.01, 1, 0.15);
    const lm = game.levels;
    const d = lm.dragonTouching(this.x, this.y, 20);
    if (d && d.boltable && !d.duelist) {
      for (const hb of d.hurtboxes()) {
        if (circleRect(this.x, this.y, 20, hb.rect)) {
          game.combat.spearHit(this.player, d, hb, { x: this.x, y: this.y }, this);
          this.dead = true;
          return;
        }
      }
    }
    const level = lm.level;
    const cam = game.camera;
    const out = this.x < cam.x - 300 || this.x > cam.x + cam.viewW + 300 || this.y < -900;
    if (level.blocksAt(this.x, this.y) || this.y >= level.floorY - 4 || this.t > 2.6 || out) {
      this.dead = true;
      game.particles.ice(this.x, Math.min(this.y, level.floorY - 6), 26, 0.9);
      if (game.audio) game.audio.play('ice', { x: this.x, gain: 0.7 });
      game.combat.text(this.x, Math.min(this.y, level.floorY) - 120, 'MISSED', '#a8b6c8', 34);
      this.player.fpStats.missed++;
    }
  }

  draw(ctx) {
    const a = Math.atan2(this.vy, this.vx);
    const img = this.img, s = 0.5;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(a);
    if (this.full) {
      ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 90);
      g.addColorStop(0, 'rgba(170,230,255,0.6)');
      g.addColorStop(1, 'rgba(120,200,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(-90, -90, 180, 180);
      ctx.globalCompositeOperation = 'source-over';
    }
    const tip = this.meta.spear_tip;
    ctx.drawImage(img, -tip[0] * s, -tip[1] * s, img.width * s, img.height * s);
    ctx.restore();
  }
}

// Frostbrand's Glacial Wave: a wall of ice racing along the floor.
export class IceWave {
  constructor(player, spec, power) {
    this.kind = 'icewave';
    this.player = player;
    this.spec = spec;
    this.power = power;
    this.dir = player.facing;
    this.x = player.x + this.dir * 60;
    this.travelled = 0;
    this.hit = new Set();
  }

  update(dt, game) {
    const step = this.spec.speed * dt;
    this.x += this.dir * step;
    this.travelled += step;
    const floor = game.levels.level.floorY;
    for (let i = 0; i < 3; i++) game.particles.ice(this.x + rand(-40, 40), floor - rand(0, 120), 1, 0.4);
    const rect = { x: this.x - 60, y: floor - 170, w: 120, h: 170 };
    this.rect = rect;
    for (const d of game.levels.dragons) {
      if (this.hit.has(d) || !d.hittable) continue;
      if (d.hurtboxes().some(b => overlaps(rect, b.rect))) {
        this.hit.add(d);
        game.combat.areaStrike(this.player, { x: this.x, y: floor - 100 }, {
          mul: this.spec.damageMul * this.power, poise: this.spec.poise, type: 'frost', heavy: true, dragon: d,
          wave: true });
      }
    }
    if (game.levels.level.blocksAt(this.x, floor - 40) || this.travelled > this.spec.range) {
      this.dead = true;
      game.particles.ice(this.x, floor - 40, 20, 0.8);
    }
  }

  draw(ctx, game) {
    const floor = game.levels.level.floorY;
    const k = 1 - this.travelled / this.spec.range;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createLinearGradient(0, floor - 180, 0, floor);
    g.addColorStop(0, 'rgba(150,220,255,0)');
    g.addColorStop(1, `rgba(170,230,255,${0.65 * k + 0.2})`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(this.x - this.dir * 140, floor);
    for (let i = 0; i <= 6; i++) {
      const x = this.x - this.dir * (140 - i * 30);
      ctx.lineTo(x, floor - (i % 2 ? 170 : 90) * (0.6 + 0.4 * k));
    }
    ctx.lineTo(this.x + this.dir * 40, floor);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

// Frozen sand left by Viserion's ice fire: no damage, but the warrior slides
// on it (little grip to stop or turn) for a moment after stepping on it.
export class FrostPatch {
  constructor(x, spec) {
    this.kind = 'frost';
    this.x = x;
    this.w = spec.width;
    this.life = spec.life;
    this.t = 0;
  }

  update(dt, game) {
    this.t += dt;
    const p = game.levels.player;
    const floor = game.levels.level.floorY;
    if (p && p.onGround && p.y >= floor - 4 && Math.abs(p.x - this.x) < this.w / 2) p.slip = 1;
    if (Math.random() < 0.15) game.particles.ice(this.x + (Math.random() - 0.5) * this.w, floor - 4, 1, 0.15);
    if (this.t >= this.life) this.dead = true;
  }

  draw(ctx, game) {
    const floor = game.levels.level.floorY;
    const k = Math.min(1, this.t / 0.3) * Math.min(1, (this.life - this.t) / 0.6);
    ctx.save();
    ctx.fillStyle = `rgba(176,222,252,${0.72 * k})`;
    ctx.beginPath();
    ctx.ellipse(this.x, floor + 4, this.w / 2, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `rgba(250,254,255,${0.8 * k})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.x - this.w * 0.3, floor + 2);
    ctx.lineTo(this.x + this.w * 0.1, floor + 1);
    ctx.stroke();
    ctx.restore();
  }
}

// ------------------------------------------------------------ Level 5 ---

// A crossbow bolt: fast, slight drop. Strikes the dragon part it meets,
// airborne or not (the one weapon that reaches a flying dragon).
export class CrossbowBolt {
  constructor(player, from, angle, opts) {
    const def = player.weapon.def;
    this.player = player;
    this.weapon = player.weapon;
    this.x = from.x;
    this.y = from.y;
    this.vx = Math.cos(angle) * def.boltSpeed;
    this.vy = Math.sin(angle) * def.boltSpeed;
    this.opts = opts;
    this.t = 0;
    this.stuck = -1;
  }

  update(dt, game) {
    this.t += dt;
    if (this.stuck >= 0) { if ((this.stuck += dt) > 0.6) this.dead = true; return; }
    this.vy += 300 * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    if (Math.random() < 0.7) {
      game.particles.add({ kind: 'dot', sprite: 'spark', x: this.x, y: this.y, vx: 0, vy: 0, max: 0.18, size: 8,
                           size1: 1, layer: 'front' });
    }
    const d = game.levels.dragonTouching(this.x, this.y, 14);
    if (d && d.boltable) {
      for (const hb of d.hurtboxes()) {
        if (circleRect(this.x, this.y, 14, hb.rect)) {
          game.combat.boltHit(this.player, this.weapon, d, hb, { x: this.x, y: this.y }, this.opts);
          this.dead = true;
          return;
        }
      }
    }
    const level = game.levels.level;
    if (level.solidAt(this.x, this.y)) { this.stuck = 0; game.particles.sparks(this.x, this.y, 6, 'spark', 0.5); return; }
    if (this.y >= level.floorY) { this.y = level.floorY - 2; this.stuck = 0; return; }
    if (this.t > 2) this.dead = true;
  }

  draw(ctx) {
    const a = Math.atan2(this.vy, this.vx);
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(a);
    ctx.strokeStyle = '#6e5236';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-46, 0);
    ctx.lineTo(10, 0);
    ctx.stroke();
    ctx.fillStyle = '#d8dee6';
    ctx.beginPath();
    ctx.moveTo(22, 0); ctx.lineTo(8, -6); ctx.lineTo(8, 6);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#e6dcc8';
    ctx.fillRect(-46, -6, 12, 4);
    ctx.fillRect(-46, 2, 12, 4);
    ctx.restore();
  }
}

// Fire left on the ground (scorched breath, molten plates, heat trails):
// burns feet on the ground only, so jumping or rolling across is safe.
export class BurningGround {
  constructor(x, width, spec) {
    this.kind = 'burn';
    this.x = x;
    this.w = width;
    this.spec = spec;
    this.t = 0;
    this.tick = 0;
    this.light = 220;
  }

  get live() { return this.t > 0.15 && this.t < this.spec.life; }

  update(dt, game) {
    this.t += dt;
    const floor = game.levels.level.floorY;
    const k = 1 - Math.max(0, this.t - this.spec.life + 0.6) / 0.6;
    if (Math.random() < 0.9 * k) {
      game.particles.fire(this.x + (Math.random() - 0.5) * this.w, floor - 4, { x: 0, y: -1 }, 160 + 120 * Math.random(), 1,
                          { spread: 0.5, sizeMul: 0.7, lifeMul: 0.7 });
    }
    const p = game.levels.player;
    this.tick -= dt;
    if (this.live && this.tick <= 0 && p && p.alive && p.y >= floor - 6 && Math.abs(p.x - this.x) < this.w / 2) {
      this.tick = this.spec.rate;
      game.combat.burnPlayer(this.spec.tick, this.x);
    }
    if (this.t >= this.spec.life) this.dead = true;
  }

  draw(ctx, game) {
    const floor = game.levels.level.floorY;
    const k = Math.min(1, this.t / 0.2) * (1 - Math.max(0, this.t - this.spec.life + 0.6) / 0.6);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(this.x, floor, 4, this.x, floor, this.w * 0.6);
    g.addColorStop(0, `rgba(255,170,60,${0.55 * k})`);
    g.addColorStop(1, 'rgba(255,60,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(this.x, floor + 2, this.w * 0.6, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// Ember mine: a glowing, cracking patch that erupts after a readable delay.
export class EmberMine {
  constructor(x, spec, delay) {
    this.kind = 'mine';
    this.x = x;
    this.spec = spec;
    this.delay = delay;
    this.t = 0;
    this.done = false;
    this.light = 180;
  }

  update(dt, game) {
    this.t += dt;
    const floor = game.levels.level.floorY;
    if (!this.done && Math.random() < 0.2 + this.t / this.delay) {
      game.particles.embers(this.x + (Math.random() - 0.5) * this.spec.radius, floor - 6, 1, 20);
    }
    if (!this.done && this.t >= this.delay) {
      this.done = true;
      this.light = 420;
      game.particles.fire(this.x, floor - 20, { x: 0, y: -1 }, 900, 34, { spread: 0.35 });
      game.particles.debris(this.x, floor - 10, 10, 50);
      game.camera.shake(0.3);
      const p = game.levels.player;
      if (p && p.alive && Math.abs(p.x - this.x) < this.spec.radius && p.y > floor - 240) {
        game.combat.hitPlayer(this.spec.damage, 'fire', this.x, 650);
      }
    }
    if (this.done && this.t > this.delay + 0.45) this.dead = true;
  }

  draw(ctx, game) {
    const floor = game.levels.level.floorY;
    const r = this.spec.radius;
    ctx.save();
    if (!this.done) {
      const k = Math.min(1, this.t / this.delay);
      const pulse = 0.55 + 0.45 * Math.sin(this.t * (10 + 20 * k));
      ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(this.x, floor, 4, this.x, floor, r);
      g.addColorStop(0, `rgba(255,200,90,${0.25 + 0.5 * k})`);
      g.addColorStop(1, 'rgba(255,60,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(this.x, floor + 2, r, 26, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = `rgba(255,${150 + 80 * k},80,${0.5 + 0.5 * pulse})`;
      ctx.lineWidth = 3 + 3 * k;
      ctx.beginPath();
      ctx.ellipse(this.x, floor + 2, r, 24, 0, 0, Math.PI * 2);
      ctx.stroke();
      // the cracks spread as the charge builds
      ctx.strokeStyle = `rgba(255,220,140,${0.4 + 0.6 * k})`;
      ctx.lineWidth = 2;
      for (let i = 0; i < 6; i++) {
        const a = i * 1.047 + 0.3;
        ctx.beginPath();
        ctx.moveTo(this.x, floor + 2);
        ctx.lineTo(this.x + Math.cos(a) * r * k, floor + 2 + Math.sin(a) * 18 * k);
        ctx.stroke();
      }
    } else {
      const k = 1 - (this.t - this.delay) / 0.45;
      ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createLinearGradient(0, floor - 300, 0, floor);
      g.addColorStop(0, 'rgba(255,120,30,0)');
      g.addColorStop(1, `rgba(255,190,90,${0.8 * k})`);
      ctx.fillStyle = g;
      ctx.fillRect(this.x - r * 0.8, floor - 300, r * 1.6, 300);
    }
    ctx.restore();
  }
}

// A molten armor plate torn off and hurled: its whole arc and landing ring
// are drawn from the moment it is thrown; it leaves a burning pool.
export class MoltenPlate {
  constructor(game, from, targetX, spec) {
    this.kind = 'plate';
    this.spec = spec;
    this.floor = game.levels.level.floorY;
    this.x0 = from.x;
    this.y0 = from.y;
    this.tx = targetX;
    this.T = spec.flight;
    this.t = 0;
    this.light = 160;
    this.landed = false;
    this.spin = Math.random() * 6;
    this.x = from.x;
    this.y = from.y;
  }

  pos(t) {
    const k = Math.min(1, t / this.T);
    const x = this.x0 + (this.tx - this.x0) * k;
    const y = this.y0 + (this.floor - this.y0) * k - Math.sin(Math.PI * k) * 420;
    return { x, y };
  }

  update(dt, game) {
    this.t += dt;
    if (this.landed) { this.dead = true; return; }
    const p = this.pos(this.t);
    this.x = p.x;
    this.y = p.y;
    game.particles.fire(p.x, p.y, { x: 0, y: -1 }, 120, 1, { spread: 0.6, sizeMul: 0.6, collide: false });
    if (this.t >= this.T) {
      this.landed = true;
      game.particles.fire(this.tx, this.floor - 10, { x: 0, y: -1 }, 520, 20, { spread: 1.2 });
      game.particles.debris(this.tx, this.floor - 10, 8, 50);
      game.camera.shake(0.22);
      const pl = game.levels.player;
      if (pl && pl.alive && Math.abs(pl.x - this.tx) < this.spec.radius && pl.y > this.floor - 200) {
        game.combat.hitPlayer(this.spec.damage, 'fire', this.tx, this.spec.knockback ?? 600);
      }
      game.hazards.add(new BurningGround(this.tx, this.spec.pool.width, this.spec.pool));
    }
  }

  draw(ctx) {
    const pulse = 0.55 + 0.45 * Math.sin(this.t * 16);
    const k0 = Math.min(1, this.t / this.T);
    ctx.save();
    ctx.setLineDash([10, 12]);
    ctx.strokeStyle = `rgba(255,160,70,${0.35 + 0.25 * pulse})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    let first = true;
    for (let k = k0; k <= 1.0001; k += 0.04) {
      const q = this.pos(k * this.T);
      if (first) { ctx.moveTo(q.x, q.y); first = false; } else ctx.lineTo(q.x, q.y);
    }
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = `rgba(255,90,40,${0.6 + 0.4 * pulse})`;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(this.tx, this.floor + 2, this.spec.radius, 22, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.spin + this.t * 9);
    ctx.fillStyle = '#5a4430';
    ctx.strokeStyle = '#ffb060';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-34, -12); ctx.lineTo(26, -20); ctx.lineTo(36, 8); ctx.lineTo(-20, 18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}

// Loose stone carried by a wingstorm. Flies at head height: braced
// (crouched), rolling or behind cover it misses.
export class WindDebris {
  constructor(x, y, dir, speed, damage, range) {
    this.kind = 'gustrock';
    this.x = x;
    this.y = y;
    this.dir = dir;
    this.speed = speed;
    this.damage = damage;
    this.range = range;
    this.travel = 0;
    this.spin = Math.random() * 6;
  }

  update(dt, game) {
    const step = this.speed * dt;
    this.x += this.dir * step;
    this.travel += step;
    this.spin += dt * 10;
    const p = game.levels.player;
    if (p && p.alive && !p.invulnerable && circleRect(this.x, this.y, 24, p.hurtbox)) {
      game.combat.hitPlayer(this.damage, 'physical', this.x - this.dir * 50, 520);
      game.particles.debris(this.x, this.y, 8, 30);
      this.dead = true;
      return;
    }
    if (game.levels.level.solidAt(this.x, this.y)) {
      game.particles.debris(this.x, this.y, 8, 30);
      this.dead = true;
    }
    if (this.travel > this.range) this.dead = true;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.spin);
    ctx.fillStyle = '#4c5260';
    ctx.strokeStyle = '#1a1c22';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-24, -10); ctx.lineTo(-6, -24); ctx.lineTo(22, -12); ctx.lineTo(24, 12); ctx.lineTo(-4, 22); ctx.lineTo(-22, 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'rgba(226,234,242,0.8)';
    ctx.fillRect(-14, -16, 18, 5);
    ctx.restore();
  }
}

// A spear hurled by Aemond from the saddle. The landing ring is locked
// before the throw; it sticks in the ice where it lands.
export class AemondSpear {
  constructor(game, from, targetX, spec) {
    this.kind = 'spear';
    this.spec = spec;
    this.floor = game.levels.level.floorY;
    this.x0 = from.x;
    this.y0 = from.y;
    this.tx = targetX;
    this.T = Math.max(0.3, Math.hypot(targetX - from.x, this.floor - from.y) / spec.spearSpeed);
    this.t = 0;
    this.x = from.x;
    this.y = from.y;
    this.stuck = -1;
  }

  get angle() { return Math.atan2(this.floor - this.y0, this.tx - this.x0); }

  update(dt, game) {
    this.t += dt;
    if (this.stuck >= 0) { if ((this.stuck += dt) > 1.4) this.dead = true; return; }
    const k = Math.min(1, this.t / this.T);
    this.x = this.x0 + (this.tx - this.x0) * k;
    this.y = this.y0 + (this.floor - this.y0) * k;
    if (k >= 1) {
      this.stuck = 0;
      game.particles.sparks(this.tx, this.floor - 6, 14, 'spark', 0.8);
      game.particles.dust(this.tx, this.floor, 10);
      game.camera.shake(0.2);
      const p = game.levels.player;
      if (p && p.alive && Math.abs(p.x - this.tx) < this.spec.spearRadius && p.y > this.floor - 240) {
        game.combat.hitPlayer(this.spec.damage, 'physical', this.tx, this.spec.knockback);
      }
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.strokeStyle = '#1c1618';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-150, 0);
    ctx.lineTo(0, 0);
    ctx.stroke();
    ctx.strokeStyle = '#4a3a30';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#c8ccd6';
    ctx.strokeStyle = '#1c1618';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(26, 0); ctx.lineTo(0, -7); ctx.lineTo(-6, 0); ctx.lineTo(0, 7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#7a1418';                  // a red-black tassel
    ctx.fillRect(-14, -5, 8, 10);
    ctx.restore();
  }
}

// Earthsplitter: a rift of stone spikes racing along the ground. Too tall
// to stand in; roll through the front, jump it, or be up on a rampart.
export class RiftWave {
  constructor(game, x, dir, spec) {
    this.kind = 'rift';
    this.front = x;
    this.from = x;
    this.dir = dir;
    this.spec = spec;
    this.hit = false;
    this.spikes = [];
    this.lastSpike = x;
    this.light = 160;
    this.x = x;
  }

  get rect() {
    const s = this.spec, w = s.riftWidth;
    return { x: this.dir > 0 ? this.front - w : this.front, y: this.floorY - s.riftHeight, w, h: s.riftHeight };
  }

  update(dt, game) {
    const s = this.spec;
    const level = game.levels.level;
    this.floorY = level.floorY;
    if (!this.stopped) {
      this.front += this.dir * s.riftSpeed * dt;
      this.x = this.front;
      if (Math.abs(this.front - this.lastSpike) > 38) {
        this.lastSpike = this.front;
        this.spikes.push({ x: this.front, t: 0, h: s.riftHeight * (0.75 + Math.random() * 0.35), lean: (Math.random() - 0.5) * 0.4 });
        if (Math.random() < 0.6) game.particles.debris(this.front, level.floorY - 10, 2, 30);
      }
      if (level.blocksAt(this.front, level.floorY - 30) || Math.abs(this.front - this.from) > s.riftRange) this.stopped = true;
      const p = game.levels.player;
      if (!this.hit && p && p.alive && !p.invulnerable && overlap(this.rect, p.hurtbox)) {
        this.hit = game.combat.hitPlayer(s.damage, 'physical', this.front - this.dir * 100, s.knockback);
      }
    }
    for (const sp of this.spikes) sp.t += dt;
    this.spikes = this.spikes.filter(sp => sp.t < 0.9);
    if (this.stopped && !this.spikes.length) this.dead = true;
  }

  draw(ctx, game) {
    const floor = game.levels.level.floorY;
    ctx.save();
    for (const sp of this.spikes) {
      const up = Math.min(1, sp.t / 0.1), down = Math.max(0, (sp.t - 0.5) / 0.4);
      const h = sp.h * up * (1 - down);
      if (h < 2) continue;
      ctx.fillStyle = '#4a4f5c';
      ctx.strokeStyle = '#14161c';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(sp.x - 26, floor + 4);
      ctx.lineTo(sp.x + sp.lean * h, floor - h);
      ctx.lineTo(sp.x + 22, floor + 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'rgba(210,225,240,0.8)';
      ctx.beginPath();
      ctx.moveTo(sp.x - 6 + sp.lean * h * 0.6, floor - h * 0.6);
      ctx.lineTo(sp.x + sp.lean * h, floor - h);
      ctx.lineTo(sp.x + 4 + sp.lean * h * 0.6, floor - h * 0.6);
      ctx.closePath();
      ctx.fill();
    }
    if (!this.stopped) {                       // the glowing crack running ahead of the spikes
      ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createLinearGradient(this.front, 0, this.front + this.dir * 220, 0);
      g.addColorStop(0, 'rgba(255,150,60,0.8)');
      g.addColorStop(1, 'rgba(255,90,20,0)');
      ctx.fillStyle = g;
      ctx.fillRect(Math.min(this.front, this.front + this.dir * 220), floor - 6, 220, 12);
    }
    ctx.restore();
  }
}

// Lightbreaker's Dawnfire: a crescent of white-gold fire hurled from the
// blade. It flies through cover, burns through armor, sets the dragon
// alight and brings a flying dragon down.
export class DawnfireBolt {
  constructor(player, from, angle) {
    const sp = player.weapon.def.special;
    this.player = player;
    this.weapon = player.weapon;
    this.x = from.x;
    this.y = from.y;
    this.vx = Math.cos(angle) * sp.boltSpeed;
    this.vy = Math.sin(angle) * sp.boltSpeed;
    this.t = 0;
    this.light = 340;
  }

  update(dt, game) {
    this.t += dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    const L = Math.hypot(this.vx, this.vy) || 1;
    game.particles.fire(this.x, this.y, { x: -this.vx / L, y: -this.vy / L }, 260, 3, { spread: 0.7, sizeMul: 0.8,
                                                                                         collide: false });
    const d = game.levels.dragonTouching(this.x, this.y, 40);
    if (d && d.boltable) {
      for (const hb of d.hurtboxes()) {
        if (circleRect(this.x, this.y, 40, hb.rect)) {
          game.combat.dawnfireHit(this.player, this.weapon, d, hb, { x: this.x, y: this.y });
          this.dead = true;
          return;
        }
      }
    }
    if (this.t > 1.2 || this.y > game.levels.level.floorY) this.dead = true;
  }

  draw(ctx) {
    const a = Math.atan2(this.vy, this.vx);
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(a);
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(0, 0, 4, 0, 0, 90);
    g.addColorStop(0, 'rgba(255,252,230,0.95)');
    g.addColorStop(0.35, 'rgba(255,200,90,0.7)');
    g.addColorStop(1, 'rgba(255,110,20,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, 90, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,248,220,0.95)';
    ctx.beginPath();                             // the crescent
    ctx.arc(0, 0, 46, -1.2, 1.2);
    ctx.arc(-18, 0, 40, 1.1, -1.1, true);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

// The Gatechain Flail's hook on its chain: flies out, catches what it hits,
// and is hauled back.
export class ChainHook {
  constructor(player, from, angle) {
    const sp = player.weapon.def.special;
    this.player = player;
    this.weapon = player.weapon;
    this.x = from.x;
    this.y = from.y;
    this.vx = Math.cos(angle) * sp.speed;
    this.vy = Math.sin(angle) * sp.speed;
    this.range = sp.range;
    this.travel = 0;
    this.back = false;
  }

  hand() {
    const p = this.player;
    return p.toWorld(p.anim.data.hand);
  }

  update(dt, game) {
    if (this.back) {
      const h = this.hand();
      const dx = h.x - this.x, dy = h.y - this.y, L = Math.hypot(dx, dy) || 1;
      const step = 2600 * dt;
      if (L <= step) { this.dead = true; return; }
      this.x += dx / L * step;
      this.y += dy / L * step;
      return;
    }
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.travel += Math.hypot(this.vx, this.vy) * dt;
    const d = game.levels.dragonTouching(this.x, this.y, 22);
    if (d && d.boltable) {
      for (const hb of d.hurtboxes()) {
        if (circleRect(this.x, this.y, 22, hb.rect)) {
          game.combat.hookHit(this.player, this.weapon, d, hb, { x: this.x, y: this.y });
          this.back = true;
          return;
        }
      }
    }
    if (this.travel > this.range || this.y > game.levels.level.floorY) this.back = true;
  }

  draw(ctx) {
    const h = this.hand();
    ctx.save();
    ctx.strokeStyle = '#2a2c34';
    ctx.lineWidth = 5;
    ctx.setLineDash([10, 6]);
    ctx.beginPath();
    ctx.moveTo(h.x, h.y);
    ctx.lineTo(this.x, this.y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = '#8a8e9c';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.translate(this.x, this.y);
    ctx.rotate(Math.atan2(this.y - h.y, this.x - h.x));
    ctx.fillStyle = '#5a5e6a';
    ctx.strokeStyle = '#14161c';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(18, 0); ctx.lineTo(-4, -16); ctx.lineTo(0, -4); ctx.lineTo(-10, 0); ctx.lineTo(0, 4); ctx.lineTo(-4, 16);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}
