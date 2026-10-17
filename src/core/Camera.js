import { clamp, damp } from './math.js';

// Side-scrolling camera: smooth follow with look-ahead, world bounds,
// an optional arena lock, and trauma-based screen shake.

export class Camera {
  constructor(viewW, viewH) {
    this.viewW = viewW;
    this.viewH = viewH;
    this.x = 0;
    this.y = 0;
    this.minX = 0;
    this.maxX = viewW;
    this.lookAhead = 0;
    this.bias = 0;
    this.trauma = 0;
    this.shakeX = 0;
    this.shakeY = 0;
    this.time = 0;
  }

  setBounds(minX, maxX) {
    if (maxX - minX < this.viewW) {      // arena narrower than the screen: frame it centred
      const c = (minX + maxX) / 2;
      minX = c - this.viewW / 2;
      maxX = c + this.viewW / 2;
    }
    this.minX = minX;
    this.maxX = Math.max(minX + this.viewW, maxX);
  }

  snapTo(targetX) {
    this.x = clamp(targetX - this.viewW * 0.4, this.minX, this.maxX - this.viewW);
  }

  shake(amount) {
    this.trauma = Math.min(1, this.trauma + amount);
  }

  // `bias` shifts the framing, e.g. toward a boss in a wide arena.
  update(dt, target, bias = 0) {
    this.time += dt;
    if (target) {
      this.lookAhead = damp(this.lookAhead, target.facing * 160, 2.5, dt);
      this.bias = damp(this.bias || 0, bias, 2.2, dt);
      const desired = target.x - this.viewW * 0.42 + this.lookAhead + this.bias;
      this.x = damp(this.x, desired, 5, dt);
    }
    this.x = clamp(this.x, this.minX, this.maxX - this.viewW);
    this.trauma = Math.max(0, this.trauma - dt * 1.4);
    const s = this.trauma * this.trauma;
    const t = this.time * 38;
    this.shakeX = s * 34 * (Math.sin(t * 1.3) + Math.sin(t * 2.9) * 0.5);
    this.shakeY = s * 26 * (Math.cos(t * 1.7) + Math.sin(t * 3.7) * 0.5);
  }

  get left() { return this.x; }
  get right() { return this.x + this.viewW; }
}
