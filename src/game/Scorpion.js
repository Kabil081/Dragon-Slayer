import { clamp, damp } from '../core/math.js';
import { ScorpionBolt } from './Hazards.js';

// A giant mounted crossbow. Stand at it and press E: it swivels toward the
// dragon, cranks for a moment and looses a bolt. Bolts tear through armor
// and knock a flying dragon out of the sky. Then it needs a long reload.

export const SCORPION = {
  scale: 0.9,
  crank: 0.35,        // seconds between pressing E and the shot
  reload: 6.5,
  boltSpeed: 2700,
  boltDamage: 85,
  useRange: 150,
};

export class Scorpion {
  constructor(game, cfg, floorY) {
    this.game = game;
    this.x = cfg.x;
    this.floorY = floorY;
    this.facing = cfg.facing ?? 1;
    this.meta = game.assets.manifest.objects.scorpion;
    const img = k => game.assets.image(this.meta[k]);
    this.img = { base: img('base'), loaded: img('arm_loaded'), empty: img('arm_empty'), bolt: img('bolt') };
    this.angle = -0.25;      // radians, negative aims upward
    this.state = 'ready';
    this.timer = 0;
  }

  get ready() { return this.state === 'ready'; }

  near(player) {
    return Math.abs(player.x - this.x) < SCORPION.useRange && player.onGround && player.alive;
  }

  mount() {
    const s = SCORPION.scale;
    const base = this.img.base;
    const by = this.floorY + 4 - (base.height - 4) * s;
    return { x: this.x + (this.meta.mount[0] - base.width / 2) * s * this.facing, y: by + this.meta.mount[1] * s };
  }

  aimAt(dragon) {
    const target = dragon.frameToWorld(dragon.anim.data.chest);
    this.facing = target.x >= this.x ? 1 : -1;
    const m = this.mount();
    const dx = Math.abs(target.x - m.x), dy = target.y - m.y;
    return clamp(Math.atan2(dy, dx), -1.25, 0.12);
  }

  update(dt, input, lm) {
    const d = lm.dragons.find(dr => dr.active && dr.alive && dr.y < dr.floorY - 200) || lm.nearestDragon(this.x);
    if (d && d.active && d.alive) this.angle = damp(this.angle, this.aimAt(d), 6, dt);
    if (this.state === 'cranking') {
      this.timer -= dt;
      if (this.timer <= 0) this.fire();
    } else if (this.state === 'reload') {
      this.timer -= dt;
      if (this.timer <= 0) this.state = 'ready';
    } else if (this.near(lm.player) && input.buffered('use', 0.15) && d && d.active && d.alive) {
      input.consume('use');
      this.state = 'cranking';
      this.timer = SCORPION.crank;
    }
  }

  fire() {
    const m = this.mount();
    const L = this.meta.muzzle[0] * SCORPION.scale;
    const a = this.angle;
    const x = m.x + Math.cos(a) * L * this.facing, y = m.y + Math.sin(a) * L;
    const worldAngle = this.facing > 0 ? a : Math.PI - a;
    this.game.hazards.add(new ScorpionBolt(x, y, worldAngle, SCORPION, this.img.bolt));
    this.game.camera.shake(0.25);
    this.game.particles.dust(this.x, this.floorY, 8);
    this.state = 'reload';
    this.timer = SCORPION.reload;
  }

  draw(ctx, player) {
    const s = SCORPION.scale;
    const base = this.img.base;
    ctx.save();
    ctx.translate(this.x, this.floorY + 4);
    ctx.scale(this.facing * s, s);
    ctx.drawImage(base, -base.width / 2, -(base.height - 4));
    ctx.restore();
    const m = this.mount();
    const arm = this.state === 'ready' || this.state === 'cranking' ? this.img.loaded : this.img.empty;
    ctx.save();
    ctx.translate(m.x, m.y);
    ctx.scale(this.facing * s, s);
    ctx.rotate(this.angle + (this.state === 'cranking' ? Math.sin(this.timer * 60) * 0.01 : 0));
    ctx.drawImage(arm, -this.meta.pivot[0], -this.meta.pivot[1]);
    ctx.restore();
    // reload ring / use prompt
    const cx = this.x, cy = this.floorY - 290;
    if (this.state === 'reload') {
      const k = 1 - this.timer / SCORPION.reload;
      ctx.strokeStyle = 'rgba(20,24,32,0.7)';
      ctx.lineWidth = 8;
      ctx.beginPath(); ctx.arc(cx, cy, 26, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = '#d6b062';
      ctx.beginPath(); ctx.arc(cx, cy, 26, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); ctx.stroke();
    } else if (this.ready && player && this.near(player)) {
      const pulse = 0.75 + 0.25 * Math.sin(performance.now() / 120);
      ctx.save();
      ctx.globalAlpha = pulse;
      ctx.fillStyle = 'rgba(10,14,22,0.8)';
      ctx.fillRect(cx - 140, cy - 26, 280, 46);
      ctx.strokeStyle = '#d6b062';
      ctx.lineWidth = 2;
      ctx.strokeRect(cx - 140, cy - 26, 280, 46);
      ctx.font = '700 22px Cinzel, Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#f2ead8';
      ctx.fillText('E  —  FIRE SCORPION', cx, cy + 6);
      ctx.restore();
    }
  }
}
