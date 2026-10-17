import { FROSTPIERCER as F } from '../data/weapons.js';
import { circleRect, clamp, damp } from '../core/math.js';
import { IceSpear } from './Hazards.js';

// Frostpiercer, the Dragonbreaker: the warrior's Level 7 launcher. It rides
// on his back; F swings it onto his shoulder (the player state 'fp'). Then
// W / S aim, J held charges the ice core, releasing J fires. Every shot is
// followed by a long reload; a roll or F puts it away at once (a reload in
// progress is lost). Spears are few: each encounter starts with F.ammo.

export class Frostpiercer {
  constructor(player) {
    this.p = player;
    this.game = player.game;
    this.meta = this.game.assets.manifest.objects.frostpiercer;
    this.ammo = F.ammo;          // spears left, including the one in the rail
    this.loaded = true;
    this.angle = F.aim.start;
    this.charge = 0;
    this.sub = null;
    this.t = 0;
    this.disabled = false;       // the duel with Aegon
    this.aimPath = [];
    this.aimWeak = false;
    this.ringT = 0;
  }

  get out() { return this.p.state === 'fp'; }

  refill() {
    this.ammo = F.ammo;
    this.loaded = true;
    this.charge = 0;
  }

  deploy() {
    const p = this.p;
    if (this.disabled) {
      this.game.combat.text(p.x, p.y - 300, 'NO FROSTPIERCER IN A DUEL', '#a8b6c8', 32);
      return false;
    }
    p.setState('fp');
    p.swing = null;
    this.sub = 'deploy';
    this.t = 0;
    this.charge = 0;
    p.anim.play('deploy', { restart: true, speed: (5 / 12) / F.deploy });
    if (this.game.audio) this.game.audio.play('deploy', { x: p.x });
    return true;
  }

  stow() {
    this.sub = 'stow';
    this.t = 0;
    this.charge = 0;
    this.p.anim.play('deploy', { restart: true, speed: (5 / 12) / F.stow });
  }

  // Runs while the player is in state 'fp'. Returns true when it is put away.
  update(dt, input, want, ax) {
    const p = this.p;
    this.t += dt;
    this.ringT += dt * (1 + 6 * this.charge);
    p.vx = damp(p.vx, 0, 12, dt);
    if (ax && this.sub !== 'deploy' && this.sub !== 'stow') p.facing = ax;
    // a roll stows it instantly
    if (want('dodge') && p.onGround && p.canDodge()) {
      this.sub = null;
      this.charge = 0;
      p.setState('move');
      p.tryDodge(input, ax);
      return true;
    }
    // Q / 1-6 put it away and take up that sword at once (a reload in progress is lost)
    const slot = want('swap') ? (p.slot + 1) % p.loadout.length
      : [1, 2, 3, 4, 5, 6].map(k => (want('slot' + k) ? k - 1 : -1)).find(k => k >= 0 && p.loadout[k]) ?? -1;
    if (slot >= 0) {
      input.consume('swap');
      for (let k = 1; k <= 6; k++) input.consume('slot' + k);
      this.sub = null;
      this.charge = 0;
      p.setState('move');
      if (slot !== p.slot) p.switchTo(slot, true);
      else p.anim.play('idle', { restart: true });
      return true;
    }
    if (want('deploy') && this.sub !== 'stow' && this.sub !== 'deploy') { input.consume('deploy'); this.stow(); }
    switch (this.sub) {
      case 'deploy':
        if (this.t >= F.deploy) { this.sub = this.loaded || this.ammo <= 0 ? 'aim' : 'reload'; this.t = 0; this.startSubAnim(); }
        break;
      case 'aim': {
        p.anim.play('aim');
        if (input.isDown('jump')) this.angle = Math.max(F.aim.min, this.angle - F.aim.speed * dt);
        if (input.isDown('brace')) this.angle = Math.min(F.aim.max, this.angle + F.aim.speed * dt);
        if (want('jump')) input.consume('jump');
        if (this.loaded && input.isDown('attack')) {
          const before = this.charge;
          this.charge = Math.min(1, this.charge + dt / F.charge);
          if (Math.floor(before * 12) !== Math.floor(this.charge * 12) && this.game.audio) {
            this.game.audio.play('charge', { x: p.x, k: this.charge });
          }
          if (this.charge >= 1 && before < 1) this.game.particles.ice(this.muzzle().x, this.muzzle().y, 14, 0.6);
        } else if (this.charge > 0) {
          if (this.charge >= F.minCharge) this.fire();
          else this.charge = 0;
        } else if (!this.loaded && this.ammo > 0) {
          this.sub = 'reload'; this.t = 0; this.startSubAnim();
        } else if (!this.loaded && want('attack')) {
          input.consume('attack');
          this.game.combat.text(p.x, p.y - 300, 'NO SPEARS LEFT', '#a8b6c8', 32);
        }
        if (want('attack') && this.loaded) input.consume('attack');
        this.predict();
        break;
      }
      case 'fire':
        if (this.t >= F.recoil) { this.sub = 'aim'; this.t = 0; }
        break;
      case 'reload':
        if (this.t >= F.reload) {
          this.loaded = true;
          this.sub = 'aim';
          this.t = 0;
        }
        break;
      case 'stow':
        if (this.t >= F.stow) { this.sub = null; p.setState('move'); return true; }
        break;
    }
    return false;
  }

  startSubAnim() {
    const p = this.p;
    if (this.sub === 'reload') {
      p.anim.play('preload', { restart: true, speed: (6 / 6) / F.reload });
      if (this.game.audio) this.game.audio.play('reload', { x: p.x, dur: F.reload });
    } else {
      p.anim.play('aim');
    }
  }

  // World angle of the rail (radians).
  get worldAngle() {
    const a = this.angle * Math.PI / 180;
    return this.p.facing > 0 ? a : Math.PI - a;
  }

  shoulder() { return this.p.toWorld(this.p.anim.data.shoulder || this.p.anim.data.hand); }

  // The rail sits on the shoulder; the muzzle is out along the aim.
  mount() {
    const s = this.shoulder();
    return { x: s.x - this.p.facing * 4, y: s.y + 10 };
  }

  muzzle() {
    const m = this.mount(), M = this.meta, scale = 1 / M.px_per_unit;
    const len = (M.muzzle[0] - M.grip[0]) * scale;
    const a = this.worldAngle;
    return { x: m.x + Math.cos(a) * len, y: m.y + Math.sin(a) * len };
  }

  fire() {
    const p = this.p;
    const from = this.muzzle();
    this.game.hazards.add(new IceSpear(p, from, this.worldAngle, this.charge));
    p.fpStats.fired++;
    p.weaponsUsed.add('frostpiercer');
    this.ammo--;
    this.loaded = false;
    this.charge = 0;
    this.sub = 'fire';
    this.t = 0;
    p.anim.play('pfire', { restart: true });
    p.vx = -p.facing * 180;
    this.game.camera.shake(0.3);
    this.game.particles.ice(from.x, from.y, 26, 0.9);
    this.game.particles.dust(p.x, p.y, 8, -p.facing);
    if (this.game.audio) this.game.audio.play('launch', { x: p.x });
  }

  // Trace the spear's flight at the current charge: the aim line, and
  // whether it would strike a weak point (the HUD and reticle turn gold).
  predict() {
    const c = Math.max(this.charge, F.minCharge);
    const speed = F.speed[0] + (F.speed[1] - F.speed[0]) * c;
    const g = F.gravity[0] + (F.gravity[1] - F.gravity[0]) * c;
    const a = this.worldAngle;
    let { x, y } = this.muzzle();
    let vx = Math.cos(a) * speed, vy = Math.sin(a) * speed;
    const pts = [{ x, y }];
    this.aimWeak = false;
    this.aimHit = null;
    const lm = this.game.levels, floor = lm.level.floorY;
    for (let i = 0; i < 40; i++) {
      const dt = 0.02;
      vy += g * dt; x += vx * dt; y += vy * dt;
      pts.push({ x, y });
      if (y >= floor) break;
      for (const d of lm.dragons) {
        if (!d.boltable || d.duelist) continue;
        const hb = d.hurtboxes().find(b => circleRect(x, y, 20, b.rect));
        if (hb) {
          this.aimHit = d;
          this.aimWeak = d.isWeakAt({ x, y }, hb);
          this.aimPath = pts;
          return;
        }
      }
    }
    this.aimPath = pts;
  }

  // ---------------------------------------------------------------- draw
  // Carried on the back while it is not out.
  drawBack(ctx) {
    const p = this.p;
    if (this.out || !p.alive) return;
    const img = this.game.assets.image(this.meta.deploy_0);
    const s = this.shoulder();
    ctx.save();
    ctx.translate(s.x - p.facing * 22, s.y + 10);
    ctx.scale(p.facing, 1);
    ctx.rotate(-1.15);
    ctx.globalAlpha = 0.95;
    const k = 0.32 / this.meta.px_per_unit * 2;
    ctx.drawImage(img, -img.width * k * 0.45, -img.height * k * 0.6, img.width * k, img.height * k);
    ctx.restore();
  }

  draw(ctx, time) {
    if (!this.out) return;
    const p = this.p, M = this.meta;
    let key = this.loaded ? 'deploy_4' : 'empty';
    if (this.sub === 'deploy' || this.sub === 'stow') {
      const k = clamp(this.t / (this.sub === 'deploy' ? F.deploy : F.stow), 0, 1);
      const f = Math.round((this.sub === 'deploy' ? k : 1 - k) * 4);
      key = `deploy_${f}`;
    }
    const img = this.game.assets.image(M[key]);
    const m = this.mount();
    const sc = 1 / M.px_per_unit;
    const lift = this.sub === 'deploy' ? (1 - clamp(this.t / F.deploy, 0, 1)) * 0.9
      : this.sub === 'stow' ? clamp(this.t / F.stow, 0, 1) * 0.9 : 0;
    const recoil = this.sub === 'fire' ? Math.max(0, 1 - this.t / F.recoil) * 18 : 0;
    ctx.save();
    ctx.translate(m.x, m.y);
    ctx.scale(p.facing, 1);
    ctx.rotate(this.angle * Math.PI / 180 - lift);
    ctx.translate(-recoil, 0);
    ctx.drawImage(img, -M.grip[0] * sc, -M.rail[0] * sc, img.width * sc, img.height * sc);
    // the ice core and the energy rings, brighter with charge
    ctx.globalCompositeOperation = 'lighter';
    const core = { x: (M.core[0] - M.grip[0]) * sc, y: (M.core[1] - M.rail[0]) * sc };
    const ck = 0.35 + 0.65 * this.charge + 0.1 * Math.sin(time * 6);
    const g = ctx.createRadialGradient(core.x, core.y, 1, core.x, core.y, 40);
    g.addColorStop(0, `rgba(220,245,255,${0.7 * ck})`);
    g.addColorStop(1, 'rgba(120,200,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(core.x - 40, core.y - 40, 80, 80);
    if (this.sub !== 'deploy' && this.sub !== 'stow') {
      M.rings.forEach((r, i) => {
        const rx = (r[0] - M.grip[0]) * sc, ry = (r[1] - M.rail[0]) * sc;
        const ph = this.ringT * (3 + i) + i * 1.3;
        ctx.strokeStyle = `rgba(150,220,255,${0.35 + 0.55 * this.charge})`;
        ctx.lineWidth = 2 + 2 * this.charge;
        ctx.beginPath();
        ctx.ellipse(rx, ry, 3 + 7 * Math.abs(Math.sin(ph)), 18 + 6 * this.charge, 0, 0, Math.PI * 2);
        ctx.stroke();
      });
      if (this.charge > 0) {
        const mz = { x: (M.muzzle[0] - M.grip[0]) * sc, y: (M.muzzle[1] - M.rail[0]) * sc };
        const mg = ctx.createRadialGradient(mz.x, mz.y, 1, mz.x, mz.y, 30 + 30 * this.charge);
        mg.addColorStop(0, `rgba(230,250,255,${0.8 * this.charge})`);
        mg.addColorStop(1, 'rgba(120,200,255,0)');
        ctx.fillStyle = mg;
        ctx.fillRect(mz.x - 60, mz.y - 60, 120, 120);
      }
    }
    if (this.sub === 'reload') {               // a spear slides home into the rail
      const k = clamp(this.t / F.reload, 0, 1);
      if (k > 0.45) {
        const spear = this.game.assets.image(M.spear);
        const s2 = 0.5 * sc * 2;
        const dx = -120 + 120 * Math.min(1, (k - 0.45) / 0.45);
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(spear, dx - 40, -spear.height * s2 / 2, spear.width * s2, spear.height * s2);
      }
    }
    ctx.restore();
    // the aim line, gold when it would strike a weak point
    if (this.sub === 'aim' && this.loaded && this.aimPath.length > 1) {
      ctx.save();
      ctx.setLineDash([10, 12]);
      ctx.lineWidth = 3;
      ctx.strokeStyle = this.aimWeak ? 'rgba(255,214,110,0.85)' : `rgba(170,225,255,${0.35 + 0.35 * this.charge})`;
      ctx.beginPath();
      this.aimPath.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)));
      ctx.stroke();
      const end = this.aimPath[this.aimPath.length - 1];
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(end.x, end.y, this.aimWeak ? 22 : 14, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }
}
