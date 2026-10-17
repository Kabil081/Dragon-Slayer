import { rand } from './math.js';

// Pooled particles drawn from pre-rendered glow sprites, plus screen-space
// snow. Fire, sparks, ice and embers are all generated here in code.

function glowSprite(r, g, b, size = 64, hard = 0.0) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const x = c.getContext('2d');
  const grd = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grd.addColorStop(0, `rgba(${r},${g},${b},1)`);
  grd.addColorStop(Math.max(0.05, hard), `rgba(${r},${g},${b},0.85)`);
  grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
  x.fillStyle = grd;
  x.fillRect(0, 0, size, size);
  return c;
}

const FIRE_STAGES = [[0.14, 'core'], [0.45, 'mid'], [0.78, 'outer'], [1.01, 'smoke']];

export class Particles {
  constructor(max = 2600) {
    this.max = max;
    this.list = [];
    this.sprites = {
      core: glowSprite(255, 222, 140),
      mid: glowSprite(255, 150, 40),
      outer: glowSprite(214, 58, 12),
      smoke: glowSprite(46, 42, 44),
      spark: glowSprite(255, 226, 160, 32, 0.3),
      ice: glowSprite(190, 236, 255, 32, 0.35),
      snow: glowSprite(236, 244, 252, 32, 0.4),
      gold: glowSprite(255, 210, 100, 32, 0.3),
      blood: glowSprite(150, 20, 20, 32, 0.4),
      stone: glowSprite(116, 120, 132, 24, 0.85),
      gcore: glowSprite(220, 255, 220),
      gmid: glowSprite(70, 255, 140),
      gouter: glowSprite(20, 150, 80),
      ycore: glowSprite(255, 246, 200),
      ymid: glowSprite(255, 206, 70),
      youter: glowSprite(220, 140, 20),
      bcore: glowSprite(190, 232, 255),
      bmid: glowSprite(80, 164, 255),
      bouter: glowSprite(28, 72, 200),
    };
  }

  add(p) {
    if (this.list.length >= this.max) return null;
    p.life = 0;
    p.drag = p.drag ?? 0;
    p.gravity = p.gravity ?? 0;
    p.blend = p.blend ?? 'lighter';
    p.alpha = p.alpha ?? 1;
    p.size1 = p.size1 ?? p.size;
    this.list.push(p);
    return p;
  }

  fire(x, y, dir, speed, count, opts = {}) {
    for (let i = 0; i < count; i++) {
      const j = rand(-1, 1) * (opts.spread ?? 0.16);
      const c = Math.cos(j), s = Math.sin(j);
      const dx = dir.x * c - dir.y * s, dy = dir.x * s + dir.y * c;
      const sp = speed * rand(0.75, 1.15);
      this.add({
        kind: 'fire', x: x + rand(-6, 6), y: y + rand(-6, 6), vx: dx * sp, vy: dy * sp,
        max: rand(0.45, 0.7) * (opts.lifeMul ?? 1), size: rand(18, 30) * (opts.sizeMul ?? 1),
        size1: rand(80, 130) * (opts.sizeMul ?? 1), drag: opts.drag ?? 1.2, gravity: -260,
        collide: opts.collide ?? true, layer: 'front', green: !!opts.green, blue: !!opts.blue, gold: !!opts.gold,
      });
    }
  }

  sparks(x, y, count, color = 'spark', power = 1) {
    for (let i = 0; i < count; i++) {
      const a = rand(0, Math.PI * 2), sp = rand(240, 820) * power;
      this.add({ kind: 'dot', sprite: color, x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 200,
                 max: rand(0.25, 0.55), size: rand(6, 14), size1: 2, drag: 3, gravity: 1600, layer: 'front' });
    }
  }

  embers(x, y, count, spreadX = 30) {
    for (let i = 0; i < count; i++) {
      this.add({ kind: 'dot', sprite: 'mid', x: x + rand(-spreadX, spreadX), y: y + rand(-10, 10),
                 vx: rand(-60, 60), vy: rand(-220, -90), max: rand(0.8, 1.6), size: rand(5, 10), size1: 1,
                 drag: 0.6, gravity: -40, layer: 'front' });
    }
  }

  ice(x, y, count, power = 1) {
    for (let i = 0; i < count; i++) {
      const a = rand(0, Math.PI * 2), sp = rand(300, 1000) * power;
      this.add({ kind: 'dot', sprite: 'ice', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * 0.6 - 120,
                 max: rand(0.4, 0.8), size: rand(10, 22), size1: 2, drag: 2.4, gravity: 900, layer: 'front' });
    }
  }

  debris(x, y, count, spreadX = 60) {
    for (let i = 0; i < count; i++) {
      this.add({ kind: 'dot', sprite: 'stone', blend: 'source-over', x: x + rand(-spreadX, spreadX), y: y + rand(-20, 20),
                 vx: rand(-420, 420), vy: rand(-760, -220), max: rand(0.6, 1.1), size: rand(12, 26),
                 size1: rand(8, 16), drag: 0.6, gravity: 2400, collide: true, layer: 'front' });
    }
  }

  dust(x, y, count, dir = 0) {
    for (let i = 0; i < count; i++) {
      this.add({ kind: 'dot', sprite: 'snow', blend: 'source-over', x: x + rand(-30, 30), y: y - rand(0, 10),
                 vx: rand(-160, 160) + dir * 200, vy: rand(-180, -40), max: rand(0.35, 0.7),
                 size: rand(10, 20), size1: rand(26, 44), drag: 3, gravity: 300, alpha: 0.55, layer: 'front' });
    }
  }

  update(dt, world) {
    const list = this.list;
    let w = 0;
    for (let i = 0; i < list.length; i++) {
      const p = list[i];
      p.life += dt;
      if (p.life >= p.max) continue;
      const k = Math.max(0, 1 - p.drag * dt);
      p.vx *= k;
      p.vy = p.vy * k + p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.collide && world) {
        if (p.y > world.floorY - 6) {
          // fire licks along the floor instead of vanishing; rubble settles
          p.y = world.floorY - 6;
          p.vy = p.kind === 'fire' ? -Math.abs(p.vy) * 0.08 : 0;
          p.vx *= p.kind === 'fire' ? 0.92 : 0.6;
          p.grounded = true;
        }
        if (world.blocksAt && world.blocksAt(p.x, p.y)) {
          p.vx *= -0.15;
          p.vy -= 120;
          p.life = Math.max(p.life, p.max * 0.75);
        }
      }
      list[w++] = p;
    }
    list.length = w;
  }

  draw(ctx, layer = 'front') {
    let blend = null;
    for (const p of this.list) {
      if ((p.layer || 'front') !== layer) continue;
      const t = p.life / p.max;
      let sprite, a = p.alpha;
      if (p.kind === 'fire') {
        let stage = 'smoke';
        for (const [lim, name] of FIRE_STAGES) if (t < lim) { stage = name; break; }
        const tint = p.green ? 'g' : p.blue ? 'b' : p.gold ? 'y' : '';
        sprite = this.sprites[tint && stage !== 'smoke' ? tint + stage : stage];
        const b = stage === 'smoke' ? 'source-over' : 'lighter';
        if (b !== blend) { ctx.globalCompositeOperation = b; blend = b; }
        a = stage === 'smoke' ? 0.35 * (1 - t) : 0.9 * (1 - t * 0.7);
      } else {
        sprite = this.sprites[p.sprite];
        if (p.blend !== blend) { ctx.globalCompositeOperation = p.blend; blend = p.blend; }
        a *= 1 - t;
      }
      const s = p.size + (p.size1 - p.size) * t;
      ctx.globalAlpha = Math.max(0, Math.min(1, a));
      ctx.drawImage(sprite, p.x - s / 2, p.y - s / 2, s, s);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  clear() { this.list.length = 0; }
}

// Screen-space snowfall with depth, drifting with camera movement.
export class Snow {
  constructor(count, viewW, viewH, wind = -120) {
    this.viewW = viewW;
    this.viewH = viewH;
    this.wind = wind;
    this.flakes = [];
    this.lastCam = null;
    for (let i = 0; i < count; i++) {
      this.flakes.push({ x: rand(0, viewW), y: rand(0, viewH), z: rand(0.3, 1.3), ph: rand(0, 6.28) });
    }
  }

  update(dt, camX) {
    const dx = this.lastCam === null ? 0 : camX - this.lastCam;
    this.lastCam = camX;
    for (const f of this.flakes) {
      f.ph += dt * 1.5;
      f.x += (this.wind * f.z + Math.sin(f.ph) * 30) * dt - dx * f.z;
      f.y += (60 + 90 * f.z) * dt;
      if (f.y > this.viewH + 10) { f.y = -10; f.x = rand(0, this.viewW); }
      if (f.x < -20) f.x += this.viewW + 40;
      if (f.x > this.viewW + 20) f.x -= this.viewW + 40;
    }
  }

  draw(ctx) {
    ctx.fillStyle = 'rgba(238,244,252,0.85)';
    for (const f of this.flakes) {
      ctx.globalAlpha = 0.35 + f.z * 0.45;
      ctx.beginPath();
      ctx.arc(f.x, f.y, 1.2 + f.z * 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}
