import { circleRect, clamp, dirFromAngle, lerp, overlaps, rand } from '../core/math.js';
import { AemondSpear, BurningGround, EmberMine, FallingDebris, FireZone, Fireball, FrostPatch, GroundShock,
  MoltenPlate, RiftWave, WindDebris } from './Hazards.js';

// Attack behaviours, keyed by the `kind` field of an attack in
// data/enemies.js. Dragon.js runs the shared telegraph -> active ->
// recovery cycle and calls these hooks; a new kind of attack is a new entry
// here, never a change to the state machine.
//
//   begin(d, a)                 telegraph starts (set up warnings)
//   telegraph(d, a, p, player)  every telegraph frame, p = 0..1
//   start(d, a, player)         active phase starts
//   active(d, a, dt, player)    every active frame; return true when done
//   recoveryTime(d, a)          optional override of a.recovery
//   warning(d, ctx, time, a)    floor warnings, drawn under the actors
//   overlay(d, ctx, time, a)    effects drawn over the dragon
//   custom + update(...)        attacks that run their own sub-states (strafe)

const easeOut = t => 1 - (1 - t) * (1 - t);
const easeIn = t => t * t;

// Shared floor warning: a glowing band rising from the floor.
export function floorZone(ctx, floor, x0, x1, alpha, height = 150) {
  const g = ctx.createLinearGradient(0, floor - height, 0, floor + 4);
  g.addColorStop(0, 'rgba(255,70,20,0)');
  g.addColorStop(1, `rgba(255,90,30,${alpha})`);
  ctx.fillStyle = g;
  ctx.fillRect(x0, floor - height, x1 - x0, height + 4);
  ctx.fillStyle = `rgba(255,200,120,${alpha})`;
  ctx.fillRect(x0, floor - 3, x1 - x0, 5);
}

function chevrons(ctx, floor, x0, x1, dir, time, alpha, spacing = 160) {
  ctx.fillStyle = `rgba(255,214,150,${alpha})`;
  const shift = ((time * 420) % spacing) * dir;
  for (let x = x0 - spacing; x < x1 + spacing; x += spacing) {
    const cx = x + shift;
    if (cx < x0 || cx > x1) continue;
    ctx.beginPath();
    ctx.moveTo(cx + dir * 44, floor - 64);
    ctx.lineTo(cx - dir * 16, floor - 104);
    ctx.lineTo(cx - dir * 4, floor - 64);
    ctx.lineTo(cx - dir * 16, floor - 24);
    ctx.closePath();
    ctx.fill();
  }
}

const pulseOf = time => 0.55 + 0.45 * Math.sin(time * 18);

// Hold the telegraph frames across the telegraph time.
export function defaultTelegraph(d, a, p) {
  const frames = a.telegraphFrames;
  d.anim.set(a.anim, frames[Math.min(frames.length - 1, Math.floor(p * frames.length))]);
}

function loopFrames(d, a, speed = 1) {
  const [f0, f1] = a.activeFrames;
  const fps = d.sprite.animations[a.anim].fps * speed;
  d.anim.set(a.anim, f0 + (Math.floor(d.t * fps) % (f1 - f0 + 1)));
}

function mouthEmbers(d, p) {
  const mouth = d.frameToWorld(d.anim.data.mouth);
  if (Math.random() < 0.3 + p) {
    d.game.particles.add({ kind: 'dot', sprite: 'mid', x: mouth.x + rand(-20, 20), y: mouth.y + rand(-14, 14),
                           vx: rand(-40, 40), vy: rand(-80, -20), max: 0.4, size: rand(10, 22), size1: 2,
                           layer: 'front' });
  }
}

// ------------------------------------------------------------------ melee
const melee = {
  begin(d) { d.glinted = false; },
  telegraph(d, a, p) {
    defaultTelegraph(d, a, p);
    if (p > 0.5 && !d.glinted) {
      d.glinted = true;
      const m = d.frameToWorld(d.anim.data.mouth);
      d.game.particles.sparks(m.x, m.y - 20, 8, 'spark', 0.5);
    }
  },
  active(d, a, dt, player) {
    const [f0, f1] = a.activeFrames;
    const p = clamp(d.t / a.active, 0, 0.999);
    d.anim.set(a.anim, f0 + Math.floor(p * (f1 - f0 + 1)));
    d.x += d.facing * (a.lunge ?? 520) * dt;
    const m = d.frameToWorld(d.anim.data.mouth);
    const box = { x: m.x - a.hitbox.w / 2, y: m.y - a.hitbox.h / 2, w: a.hitbox.w, h: a.hitbox.h };
    d.debugBox = box;
    if (!d.hasHit && overlaps(box, player.hurtbox)) {
      if (d.game.combat.hitPlayer(a.damage, a.type, d.x, a.knockback)) d.hasHit = true;
    }
    const done = d.t >= a.active;
    d.missedBite = done && !d.hasHit && !!a.exposeOnMiss && !!d.segments;
    if (d.missedBite) d.exposeSegment(a.exposeOnMiss.seg, a.exposeOnMiss.time);
    return done;
  },
  recoveryTime(d, a) { return d.missedBite ? a.exposeOnMiss.recovery : a.recovery; },
  warning(d, ctx, time, a) {
    if (d.state !== 'telegraph') return;
    const m = d.frameToWorld(d.sprite.animations[a.anim].per_frame[a.activeFrames[0]].mouth);
    const reach = d.facing * 90;
    floorZone(ctx, d.floorY, Math.min(m.x - 140, m.x + reach - 140), Math.max(m.x + 140, m.x + reach + 140),
              0.6 * pulseOf(time));
  },
  overlay(d, ctx) {
    if (d.state !== 'telegraph' || !d.glinted) return;
    const head = d.frameToWorld(d.anim.data.head);
    const k = clamp(1 - (d.t / d.telegraphDur - 0.5) * 2, 0, 1);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = `rgba(255,230,160,${k})`;
    ctx.lineWidth = 4;
    const r = 40 + 30 * (1 - k);
    ctx.beginPath();
    ctx.moveTo(head.x - r, head.y); ctx.lineTo(head.x + r, head.y);
    ctx.moveTo(head.x, head.y - r); ctx.lineTo(head.x, head.y + r);
    ctx.stroke();
    ctx.restore();
  },
};

// ------------------------------------------------------------------ breath
export function computeStream(d, a, frameData) {
  const level = d.game.levels.level;
  const mouth = d.frameToWorld(frameData.mouth);
  const dir = dirFromAngle(d.worldAngle(frameData.fire_angle));
  let len = a.streamLength;
  let groundHit = false;
  for (let s = 0; s <= a.streamLength; s += 16) {
    const px = mouth.x + dir.x * s, py = mouth.y + dir.y * s;
    if (py >= d.floorY - 4) { len = s; groundHit = true; break; }
    if (level.blocksAt(px, py)) { len = s; break; }
  }
  const impact = { x: mouth.x + dir.x * len, y: Math.min(d.floorY, mouth.y + dir.y * len) };
  let g1 = impact.x;
  if (groundHit) {
    const sx = Math.sign(dir.x) || 1;
    for (let s = 0; s <= a.groundSpread; s += 16) {
      const px = impact.x + sx * s;
      if (level.blocksAt(px, d.floorY - 30)) break;
      g1 = px;
    }
  }
  return { mouth, dir, len, impact, groundHit, g0: Math.min(impact.x, g1), g1: Math.max(impact.x, g1) };
}

export function streamHits(d, st, rect) {
  for (let s = 0; s <= st.len; s += 28) {
    if (circleRect(st.mouth.x + st.dir.x * s, st.mouth.y + st.dir.y * s, 22 + s * 0.07, rect)) return true;
  }
  return st.groundHit && overlaps(rect, { x: st.g0, y: d.floorY - 90, w: st.g1 - st.g0, h: 90 });
}

const breath = {
  begin(d, a) {
    d.warnStream = computeStream(d, a, d.sprite.animations[a.anim].per_frame[a.activeFrames[0]]);
  },
  telegraph(d, a, p) {
    defaultTelegraph(d, a, p);
    mouthEmbers(d, p);
  },
  active(d, a, dt, player) {
    loopFrames(d, a);
    const st = computeStream(d, a, d.anim.data);
    d.stream = st;
    d.game.particles.fire(st.mouth.x, st.mouth.y, st.dir, a.flameSpeed ?? 1500, 10,
                          { spread: 0.13, green: a.green, blue: a.blue, gold: a.gold });
    if (st.groundHit && Math.random() < 0.6) {
      d.game.particles.fire(rand(st.g0, st.g1), d.floorY - 10, { x: Math.sign(st.dir.x) * 0.9, y: -0.4 }, 260, 1,
                            { spread: 0.5, sizeMul: 0.8, blue: a.blue, gold: a.gold });
    }
    // Viserion's ice fire leaves the sand frozen and slippery
    if (a.frostPatch && st.groundHit) {
      d.frostNext = (d.frostNext ?? 0) - dt;
      if (d.frostNext <= 0) {
        d.frostNext = 0.3;
        d.game.hazards.add(new FrostPatch(rand(st.g0, st.g1), a.frostPatch));
      }
    }
    d.game.camera.shake(0.025);
    d.tick += dt;
    if (d.tick >= a.tickRate) {
      d.tick -= a.tickRate;
      if (streamHits(d, st, player.hurtbox)) d.game.combat.burnPlayer(a.tickDamage, d.x);
    }
    return d.t >= a.active;
  },
  warning(d, ctx, time) {
    if (d.state !== 'telegraph' || !d.warnStream) return;
    const st = d.warnStream;
    const x0 = Math.min(st.mouth.x, st.g0), x1 = Math.max(st.mouth.x, st.g1);
    const k = Math.min(1, d.t / d.telegraphDur);
    floorZone(ctx, d.floorY, x0, x1, (0.25 + 0.5 * k) * pulseOf(time));
    ctx.save();
    ctx.globalAlpha = 0.12 + 0.18 * k;
    ctx.strokeStyle = '#ff8a3a';
    ctx.lineWidth = 50 + 40 * k;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(st.mouth.x, st.mouth.y);
    ctx.lineTo(st.impact.x, st.impact.y);
    ctx.stroke();
    ctx.restore();
  },
};

// ------------------------------------------------------------------ strafe
const strafe = {
  custom: true,
  unclamped: true,
  begin(d) {
    d.strafe = { sub: 'takeoff', dir: d.facing, t: 0 };
    d.anim.play('flight');
    d.game.particles.dust(d.x, d.floorY, 24);
    d.game.camera.shake(0.3);
  },
  update(d, a, dt, player) {
    const s = d.strafe;
    const arena = d.arena;
    s.t += dt;
    d.anim.play('flight');
    if (s.sub === 'takeoff') {
      const p = Math.min(1, s.t / 1.0);
      d.y = lerp(d.floorY, d.floorY - 1300, easeIn(p));
      d.x += d.facing * 200 * dt;
      if (p >= 1) {
        s.sub = 'warn';
        s.t = 0;
        const center = (arena.start + arena.end) / 2;
        s.dir = player.x > center ? 1 : -1;
        d.facing = s.dir;
        d.x = s.dir === 1 ? arena.start - 500 : arena.end + 500;
        d.y = d.floorY - a.altitude;
      }
    } else if (s.sub === 'warn') {
      if (s.t < 0.1) d.game.camera.shake(0.05);
      if (s.t >= a.telegraph) { s.sub = 'pass'; s.t = 0; d.tick = 0; }
    } else if (s.sub === 'pass') {
      d.x += s.dir * a.passSpeed * dt;
      d.y = d.floorY - a.altitude + Math.sin(s.t * 6) * 18;
      const mouth = d.frameToWorld(d.anim.data.mouth);
      const bandX = mouth.x + s.dir * 90;
      s.band = { x: bandX - a.bandWidth / 2, y: d.floorY - 120, w: a.bandWidth, h: 120 };
      const dir = { x: bandX - mouth.x, y: d.floorY - mouth.y };
      const L = Math.hypot(dir.x, dir.y);
      if (bandX > arena.start && bandX < arena.end) {
        // speed chosen so the flames reach the floor before they fade
        d.game.particles.fire(mouth.x, mouth.y, { x: dir.x / L, y: dir.y / L }, L / 0.42, 8, { spread: 0.1, drag: 0.5 });
        if (Math.random() < 0.8) {
          d.game.particles.fire(bandX + rand(-a.bandWidth / 2, a.bandWidth / 2), d.floorY - 8, { x: 0, y: -1 }, 200, 1,
                                { spread: 0.6 });
        }
        d.tick += dt;
        if (d.tick >= a.tickRate) {
          d.tick -= a.tickRate;
          if (overlaps(s.band, player.hurtbox) && !(a.shelter && underSlab(d, player))) {
            d.game.combat.burnPlayer(a.tickDamage, bandX);
          }
        }
        // a heat trail with gaps: the safe spots move with the pass
        const H = a.heatTrail;
        if (H && (s.lastTrail === undefined || Math.abs(bandX - s.lastTrail) >= H.every)) {
          s.lastTrail = bandX;
          d.game.hazards.add(new BurningGround(bandX, H.width, H));
        }
      }
      const done = s.dir === 1 ? d.x > arena.end - 380 : d.x < arena.start + 380;
      if (done) { s.sub = 'land'; s.t = 0; s.band = null; s.fromY = d.y; }
    } else if (s.sub === 'land') {
      const p = Math.min(1, s.t / 1.0);
      d.x += s.dir * 260 * (1 - p) * dt;
      d.y = lerp(s.fromY, d.floorY, easeOut(p));
      if (p >= 1) {
        d.y = d.floorY;
        d.game.camera.shake(0.5);
        d.game.particles.dust(d.x, d.floorY, 24);
        d.strafe = null;
        d.facing = player.x > d.x ? 1 : -1;
        d.setState('recovery');
      }
    }
  },
  warning(d, ctx, time) {
    const s = d.strafe;
    if (!s || (s.sub !== 'warn' && s.sub !== 'pass')) return;
    const a = d.arena;
    const passing = s.sub === 'pass';
    floorZone(ctx, d.floorY, a.start, a.end, (passing ? 0.25 : 0.55) * pulseOf(time));
    chevrons(ctx, d.floorY, a.start, a.end, s.dir, time, (passing ? 0.4 : 0.9) * pulseOf(time));
  },
};

// ------------------------------------------------------------------ fireball
// Charge a glowing orb in the jaws while a reticle tracks the player, then
// spit it. The reticle locks before release so moving is always enough.
const fireball = {
  begin(d, a, player) {
    d.shots = a.countByPhase ? a.countByPhase[Math.min(d.phase, a.countByPhase.length - 1)] : 1;
    d.reticle = { x: player.x, y: player.y - 120, locked: false };
  },
  telegraph(d, a, p, player) {
    defaultTelegraph(d, a, p);
    mouthEmbers(d, p);
    if (p < (a.lockAt ?? 0.75)) d.reticle = { x: player.x, y: player.y - 120, locked: false };
    else d.reticle.locked = true;
  },
  start(d, a) {
    d.shotTimer = 0;
    d.shotsFired = 0;
  },
  active(d, a, dt, player) {
    d.anim.set(a.anim, a.activeFrames[0]);
    d.shotTimer -= dt;
    if (d.shotTimer <= 0 && d.shotsFired < d.shots) {
      const mouth = d.frameToWorld(d.anim.data.mouth);
      const target = d.shotsFired === 0 ? d.reticle : { x: player.x, y: player.y - 120 };
      d.game.hazards.add(new Fireball(d.game, mouth, target, a));
      d.game.particles.fire(mouth.x, mouth.y, { x: d.facing, y: 0 }, 400, 12, { spread: 0.8, gold: a.gold });
      d.game.camera.shake(0.12);
      d.shotsFired++;
      d.shotTimer = a.volleyGap ?? 0.45;
      if (d.shotsFired < d.shots) d.reticle = { x: player.x, y: player.y - 120, locked: false };
    }
    if (d.shotsFired < d.shots && d.shotTimer < (a.volleyGap ?? 0.45) * 0.4) d.reticle.locked = true;
    return d.shotsFired >= d.shots && d.shotTimer <= 0;
  },
  warning(d, ctx, time, a) {
    const r = d.reticle;
    if (!r || (d.state !== 'telegraph' && d.state !== 'active')) return;
    if (d.state === 'active' && d.shotsFired >= d.shots) return;
    const pulse = pulseOf(time);
    // the locked ring is exactly the burst radius
    const blast = a.splashRadius ?? 120;
    const radius = r.locked ? blast : blast + 60 - 60 * Math.min(1, d.t / Math.max(0.01, d.telegraphDur));
    ctx.save();
    ctx.strokeStyle = r.locked ? `rgba(255,90,40,${0.9 * pulse + 0.1})` : `rgba(255,200,120,${0.6 * pulse})`;
    ctx.lineWidth = r.locked ? 5 : 3;
    ctx.beginPath();
    ctx.arc(r.x, r.y, radius, 0, Math.PI * 2);
    ctx.stroke();
    for (let k = 0; k < 4; k++) {
      const ang = k * Math.PI / 2 + time * (r.locked ? 0 : 2);
      ctx.beginPath();
      ctx.moveTo(r.x + Math.cos(ang) * (radius - 14), r.y + Math.sin(ang) * (radius - 14));
      ctx.lineTo(r.x + Math.cos(ang) * (radius + 14), r.y + Math.sin(ang) * (radius + 14));
      ctx.stroke();
    }
    if (r.locked) {
      const m = d.frameToWorld(d.anim.data.mouth);
      ctx.setLineDash([14, 14]);
      ctx.lineWidth = 2;
      ctx.strokeStyle = `rgba(255,140,60,${0.5 * pulse})`;
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(r.x, r.y);
      ctx.stroke();
    }
    ctx.restore();
  },
  overlay(d, ctx, time, a) {
    // the orb charging in the jaws
    let k = 0;
    if (d.state === 'telegraph') k = Math.min(1, d.t / d.telegraphDur);
    else if (d.state === 'active' && d.shotsFired < d.shots) k = 1 - Math.max(0, d.shotTimer) / (a.volleyGap ?? 0.45);
    if (k <= 0) return;
    const m = d.frameToWorld(d.anim.data.mouth);
    const r = (10 + 30 * k) * (1 + 0.08 * Math.sin(time * 30));
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, r * 2.4);
    g.addColorStop(0, 'rgba(255,250,220,0.95)');
    g.addColorStop(0.35, 'rgba(255,170,60,0.85)');
    g.addColorStop(1, 'rgba(255,60,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(m.x, m.y, r * 2.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },
};

// ------------------------------------------------------------------ sweep
// The head drops to the floor and a low wall of flame runs along the
// ground. Jump it, roll through it, stand on a platform, or hide behind
// stone: the wave stops at the first solid it meets.
const sweep = {
  begin(d, a) {
    d.sweepPath = sweepPath(d, a);
  },
  telegraph(d, a, p) {
    defaultTelegraph(d, a, p);
    mouthEmbers(d, p);
  },
  start(d, a) {
    const path = sweepPath(d, a);
    d.wave = { from: path.from, front: path.from, to: path.to, dir: d.facing, hit: false, done: false };
  },
  active(d, a, dt, player) {
    loopFrames(d, a);
    const w = d.wave;
    if (!w.done) {
      w.front += w.dir * a.waveSpeed * dt;
      if ((w.to - w.front) * w.dir <= 0) { w.front = w.to; w.done = true; w.doneAt = d.t; }
    }
    // The wave's burning head, never reaching back behind the mouth: fire
    // only travels outward, so standing under the head is safe.
    let tail = w.front - w.dir * a.waveLength;
    if ((tail - w.from) * w.dir < 0) tail = w.from;
    const head = { x: Math.min(w.front, tail), w: Math.abs(w.front - tail),
                   y: d.floorY - a.waveHeight, h: a.waveHeight };
    d.debugBox = head;
    for (let i = 0; i < 5; i++) {
      d.game.particles.fire(head.x + rand(0, head.w), d.floorY - 6, { x: w.dir * 0.4, y: -1 }, rand(260, 520), 1,
                            { spread: 0.35, sizeMul: 0.9, lifeMul: 0.8, gold: a.gold });
    }
    if (Math.random() < 0.5) {
      d.game.particles.fire(rand(Math.min(w.from, w.front), Math.max(w.from, w.front)), d.floorY - 4,
                            { x: 0, y: -1 }, 150, 1, { spread: 0.5, sizeMul: 0.6 });
    }
    const m = d.frameToWorld(d.anim.data.mouth);
    d.game.particles.fire(m.x, m.y, { x: w.dir, y: 0.3 }, 600, 3, { spread: 0.3, gold: a.gold });
    if (!w.hit && overlaps(head, player.hurtbox)) {
      if (d.game.combat.hitPlayer(a.damage, 'fire', w.front - w.dir * 200, a.knockback)) w.hit = true;
    }
    return w.done && d.t - w.doneAt > 0.15;
  },
  warning(d, ctx, time, a) {
    const p = d.sweepPath;
    if (!p) return;
    if (d.state === 'telegraph') {
      const k = Math.min(1, d.t / d.telegraphDur);
      floorZone(ctx, d.floorY, Math.min(p.from, p.to), Math.max(p.from, p.to), (0.3 + 0.45 * k) * pulseOf(time),
                a.waveHeight + 20);
      chevrons(ctx, d.floorY, Math.min(p.from, p.to), Math.max(p.from, p.to), d.facing, time, 0.7 * pulseOf(time), 200);
    }
  },
};

function sweepPath(d, a) {
  const level = d.game.levels.level;
  const m = d.frameToWorld(d.sprite.animations[a.anim].per_frame[a.activeFrames[0]].mouth);
  const from = m.x;
  let to = from + d.facing * a.reach;
  for (let s = 0; s <= a.reach; s += 16) {
    const px = from + d.facing * s;
    if (level.blocksAt(px, d.floorY - 40)) { to = px - d.facing * 10; break; }
  }
  to = clamp(to, d.arena.start, d.arena.end);
  return { from, to };
}

// ------------------------------------------------------------------ charge
// A short gallop. It stops at the arena edge or the first solid in its
// path; slamming into stone shatters breakable cover and stuns the dragon.
const charge = {
  begin(d, a) {
    d.chargePath = chargePath(d, a);
    d.crashed = false;
  },
  telegraph(d, a, p) {
    defaultTelegraph(d, a, p);
    if (Math.random() < 0.5) d.game.particles.dust(d.x - d.facing * 120, d.floorY, 1, -d.facing);
  },
  start(d, a) {
    d.chargePath = chargePath(d, a);
    d.hasHit = false;
  },
  active(d, a, dt, player) {
    loopFrames(d, a, 1.4);
    const path = d.chargePath;
    d.x += d.facing * a.speed * dt;
    if (Math.random() < 0.6) d.game.particles.dust(d.x - d.facing * 100, d.floorY, 1, -d.facing);
    // Only the head and horns hurt, and only at body height: rolling under
    // them carries you past, and a platform keeps you above them.
    const head = d.hurtboxes()[0].rect;
    const tip = d.facing === 1 ? head.x + head.w : head.x;
    const x0 = Math.min(tip, d.x), x1 = Math.max(tip, d.x);
    // a dragon tall enough to have clearance under its horns (`hitLow`) can be rolled under
    const front = { x: x0, y: d.floorY - (a.hitHeight ?? 190), w: x1 - x0, h: (a.hitHeight ?? 190) - (a.hitLow ?? 0) };
    d.debugBox = front;
    // a set spear facing the charge: the dragon impales itself and stops dead
    if (!d.hasHit && player.braceSpear > 0 && player.facing === -d.facing && overlaps(front, player.hurtbox)) {
      d.hasHit = true;
      d.crashed = true;
      d.game.combat.spearImpale(player, d);
      return true;
    }
    if (d.chargeStopped) {           // a spear thrust to the face
      d.chargeStopped = false;
      d.crashed = true;
      return true;
    }
    if (!d.hasHit && overlaps(front, player.hurtbox)) {
      if (d.game.combat.hitPlayer(a.damage, 'physical', d.x, a.knockback)) d.hasHit = true;
    }
    if ((path.stopX - d.x) * d.facing <= 0) {
      d.x = path.stopX;
      d.hitWall = !path.solid && !!path.edge;
      if (d.hitWall && a.edgeRecovery) {
        d.game.camera.shake(0.6);
        d.game.particles.debris(d.x + d.facing * 300, d.floorY - 120, 18, 80);
      }
      if (path.solid) {
        d.crashed = true;
        d.game.levels.level.damageSolid(path.solid, a.crashDamage ?? 99, d.game);
        d.game.camera.shake(0.6);
        if (!d.def.fearless) d.game.combat.text(d.x + d.facing * 200, d.floorY - 380, 'STUNNED', '#ffd36b', 44);
      } else {
        d.game.particles.dust(d.x + d.facing * 200, d.floorY, 18, d.facing);
      }
      return true;
    }
    return false;
  },
  recoveryTime(d, a) { return d.crashed ? a.crashRecovery : d.hitWall && a.edgeRecovery ? a.edgeRecovery : a.recovery; },
  warning(d, ctx, time) {
    if (d.state !== 'telegraph' || !d.chargePath) return;
    const p = d.chargePath;
    const x0 = d.x, x1 = p.stopX + d.facing * 260;
    floorZone(ctx, d.floorY, Math.min(x0, x1), Math.max(x0, x1), 0.45 * pulseOf(time), 60);
    chevrons(ctx, d.floorY, Math.min(x0, x1), Math.max(x0, x1), d.facing, time, 0.85 * pulseOf(time), 140);
  },
};

function chargePath(d, a) {
  const level = d.game.levels.level;
  const reachAhead = 300 * d.scale;            // the head leads the pivot
  const edge = d.facing === 1 ? d.arena.end - 260 : d.arena.start + 260;
  let stopX = d.x + d.facing * a.distance;
  let atEdge = false;
  if ((stopX - edge) * d.facing > 0) { stopX = edge; atEdge = true; }
  let solid = null;
  for (const s of level.solids) {
    const near = d.facing === 1 ? s.x : s.x + s.w;
    const pivotStop = near - d.facing * reachAhead;
    if ((pivotStop - d.x) * d.facing > 0 && (stopX - pivotStop) * d.facing > 0) {
      stopX = pivotStop;
      solid = s;
    }
  }
  return { stopX, solid, edge: atEdge && !solid };
}

// ------------------------------------------------------------------ slam
// Rears up for a long, obvious wind-up, then hammers the ground: a heavy
// impact near the forelegs and two shockwaves racing outward (jump them).
// The blow cracks its own armor: it is vulnerable straight afterwards.
function slamPoint(d) {
  return d.x + d.facing * 250 * d.scale;
}

const slam = {
  telegraph(d, a, p) {
    defaultTelegraph(d, a, p);
    if (Math.random() < 0.4) d.game.particles.dust(slamPoint(d) + rand(-80, 80), d.floorY, 1);
  },
  start(d, a, player) {
    const x = slamPoint(d);
    d.anim.set(a.anim, a.activeFrames[0]);
    for (const dir of [-1, 1]) d.game.hazards.add(new GroundShock(d.game, x, dir, a));
    if (Math.abs(player.x - x) < a.impactRadius && player.y > d.floorY - 120) {
      d.game.combat.hitPlayer(a.damage, 'physical', x, a.knockback);
    }
    d.game.camera.shake(0.9);
    d.game.particles.debris(x, d.floorY - 10, 30, 160);
    d.game.particles.dust(x, d.floorY, 30);
    if (a.vulnerableTime) d.makeVulnerable(a.vulnerableTime);
    if (a.breakRadius) breakCoverNear(d, x, a.breakRadius, 1);
  },
  active(d, a) {
    const [f0, f1] = a.activeFrames;
    d.anim.set(a.anim, d.t < a.active / 2 ? f0 : f1);
    return d.t >= a.active;
  },
  warning(d, ctx, time, a) {
    if (d.state !== 'telegraph') return;
    const x = slamPoint(d);
    const k = Math.min(1, d.t / d.telegraphDur);
    const pulse = pulseOf(time);
    floorZone(ctx, d.floorY, x - a.impactRadius, x + a.impactRadius, (0.35 + 0.45 * k) * pulse, 120);
    ctx.save();
    ctx.strokeStyle = `rgba(255,190,110,${0.5 + 0.4 * pulse})`;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(x, d.floorY, a.impactRadius * (1.2 - 0.2 * k), 26, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    for (const dir of [-1, 1]) {
      const x0 = x + dir * a.impactRadius, x1 = x + dir * a.waveRange;
      chevrons(ctx, d.floorY, Math.min(x0, x1), Math.max(x0, x1), dir, time, 0.55 * pulse, 170);
    }
  },
};

// ------------------------------------------------------------------ skyward
// Flight defense: after a burst of damage the dragon takes to the sky out
// of sword reach and bombards with fireballs (a reticle shows each one).
// A scorpion bolt brings it crashing down, stunned and vulnerable.
const skyward = {
  custom: true,
  begin(d) {
    d.sky = { sub: 'rise', t: 0, shot: 1.4 };
    d.anim.play('flight');
    d.game.particles.dust(d.x, d.floorY, 26);
    d.game.camera.shake(0.35);
    d.downed = false;
  },
  update(d, a, dt, player) {
    const s = d.sky;
    s.t += dt;
    d.anim.play('flight');
    if (s.sub === 'rise') {
      d.y = lerp(d.floorY, d.floorY - a.altitude, easeOut(Math.min(1, s.t / 0.9)));
      if (s.t >= 0.9) { s.sub = 'hover'; s.t = 0; }
    } else if (s.sub === 'hover') {
      const want = player.x + (d.x > player.x ? 1 : -1) * 520;
      d.x += clamp(want - d.x, -260 * dt, 260 * dt);
      d.x = clamp(d.x, d.arena.start + 260, d.arena.end - 260);
      d.y = d.floorY - a.altitude + Math.sin(s.t * 3) * 22;
      d.facing = player.x > d.x ? 1 : -1;
      s.shot -= dt;
      if (s.shot <= a.fireLead && !d.reticle) d.reticle = { x: player.x, y: player.y - 120, locked: false };
      if (d.reticle && s.shot > a.fireLead * 0.3) d.reticle = { x: player.x, y: player.y - 120, locked: false };
      else if (d.reticle) d.reticle.locked = true;
      if (s.shot <= 0) {
        const mouth = d.frameToWorld(d.anim.data.mouth);
        d.game.hazards.add(new Fireball(d.game, mouth, d.reticle, a));
        d.reticle = null;
        s.shot = a.fireEvery;
      }
      if (s.t >= a.duration) { s.sub = 'land'; s.t = 0; s.fromY = d.y; d.reticle = null; }
    } else if (s.sub === 'land') {
      d.y = lerp(s.fromY, d.floorY, easeOut(Math.min(1, s.t / 1.0)));
      if (s.t >= 1.0) { d.y = d.floorY; d.game.particles.dust(d.x, d.floorY, 20); d.setState('recovery'); }
    } else if (s.sub === 'fall') {
      d.reticle = null;
      s.vy += 3200 * dt;
      d.y += s.vy * dt;
      if (d.y >= d.floorY) {
        d.y = d.floorY;
        d.downed = true;
        d.game.camera.shake(1);
        d.game.particles.debris(d.x, d.floorY - 20, 40, 260);
        d.game.particles.dust(d.x, d.floorY, 40);
        d.makeVulnerable(a.downedTime);
        d.setState('recovery');
      }
    }
  },
  recoveryTime(d, a) { return d.downed ? a.downedTime : a.recovery; },
  warning(d, ctx, time) {
    const r = d.reticle;
    if (!r) return;
    const pulse = pulseOf(time);
    ctx.save();
    ctx.strokeStyle = r.locked ? `rgba(255,90,40,${0.9 * pulse + 0.1})` : `rgba(255,200,120,${0.6 * pulse})`;
    ctx.lineWidth = r.locked ? 5 : 3;
    ctx.beginPath();
    ctx.arc(r.x, r.y, 130, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};

// ------------------------------------------------------------------ dive
// Climbs, tracks the player, LOCKS a landing zone (marked on the floor
// with a pillar of light), then dives onto it. Moving out of the ring or
// rolling as it lands avoids it.
const dive = {
  custom: true,
  begin(d) {
    d.diveS = { sub: 'rise', t: 0 };
    d.anim.play('flight');
    d.game.particles.dust(d.x, d.floorY, 22);
  },
  update(d, a, dt, player) {
    const s = d.diveS;
    const lo = d.arena.start + 260, hi = d.arena.end - 260;
    s.t += dt;
    d.anim.play('flight');
    if (s.sub === 'rise') {
      d.y = lerp(d.floorY, d.floorY - a.altitude, easeOut(Math.min(1, s.t / 0.6)));
      if (s.t >= 0.6) { s.sub = 'track'; s.t = 0; }
    } else if (s.sub === 'track') {
      const tx = clamp(player.x, lo, hi);
      d.x += clamp(tx - d.x, -760 * dt, 760 * dt);
      d.facing = player.x > d.x ? 1 : -1;
      d.y = d.floorY - a.altitude + Math.sin(s.t * 6) * 14;
      if (s.t >= a.track) {
        s.sub = 'lock';
        s.t = 0;
        s.zone = clamp(player.x, lo, hi);
        if (a.angled) {             // comes in on a slant from one side, shown by the arrow
          s.from = player.x - d.arena.start > d.arena.end - player.x ? -1 : 1;
          d.x = s.zone - s.from * 900;
        }
      }
    } else if (s.sub === 'lock') {
      if (!a.angled) d.x += clamp(s.zone - d.x, -900 * dt, 900 * dt);
      if (s.t >= a.lock + (a.hang || 0)) { s.sub = 'dive'; s.t = 0; s.fromY = d.y; s.fromX = d.x; }
    } else if (s.sub === 'dive') {
      const p = Math.min(1, s.t / a.diveTime);
      d.y = lerp(s.fromY, d.floorY, p * p);
      d.x = lerp(s.fromX, s.zone, p);
      if (p >= 1) {
        d.y = d.floorY;
        d.game.camera.shake(0.85);
        d.game.particles.debris(s.zone, d.floorY - 10, 26, 150);
        d.game.particles.dust(s.zone, d.floorY, 26);
        const near = Math.abs(player.x - s.zone) < a.impactRadius && player.y > d.floorY - 220;
        const struck = near && d.game.combat.hitPlayer(a.damage, 'physical', s.zone, a.knockback);
        d.diveRecovery = a.landRecovery ?? a.recovery;
        d.sfx('boom', { size: 0.8 });
        if (a.missVulnerable && !struck) {           // a dive into empty ice: it crashes, open
          d.makeVulnerable(a.missVulnerable);
          d.diveRecovery = Math.max(d.diveRecovery, a.missVulnerable);
          d.game.combat.text(s.zone, d.floorY - 420, 'IT CRASHES!', '#ffd36b', 44);
        }
        if (a.shockwave) for (const dir of [-1, 1]) d.game.hazards.add(new GroundShock(d.game, s.zone, dir, a.shockwave));
        if (a.perfectDodge && near && player.state === 'dodge' && player.invulnerable) {
          // rolled through the impact: the head is wide open
          d.exposeSegment(a.perfectDodge.expose, a.perfectDodge.window, false);
          d.diveRecovery += a.perfectDodge.window * 0.6;
          d.game.combat.text(player.x, player.y - 300, 'PERFECT DODGE', '#ffd36b', 44);
          d.events.push({ type: 'perfect' });
        }
        d.diveS = null;
        d.setState('recovery');
      }
    }
  },
  recoveryTime(d, a) { return d.diveRecovery ?? a.recovery; },
  warning(d, ctx, time, a) {
    const s = d.diveS;
    if (!s || s.sub === 'rise') return;
    const player = d.game.levels.player;
    const lo = d.arena.start + 260, hi = d.arena.end - 260;
    const x = s.sub === 'track' ? clamp(player.x, lo, hi) : s.zone;
    const locked = s.sub !== 'track';
    const pulse = pulseOf(time);
    if (a.shadow) {                   // the dragon's shadow on the ice marks it
      const k = s.sub === 'dive' ? 0.5 + 0.5 * Math.min(1, s.t / a.diveTime) : 0.5;
      ctx.fillStyle = `rgba(4,6,12,${0.35 + 0.3 * k})`;
      ctx.beginPath();
      ctx.ellipse(x, d.floorY + 4, a.impactRadius * (1.4 - 0.4 * k), 26, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    if (a.angled && locked && s.from) {
      chevrons(ctx, d.floorY - 120, x - s.from * 700, x - s.from * a.impactRadius, s.from, time, 0.9 * pulse, 120);
    }
    floorZone(ctx, d.floorY, x - a.impactRadius, x + a.impactRadius, (locked ? 0.7 : 0.25) * pulse, 90);
    ctx.save();
    ctx.strokeStyle = locked ? `rgba(255,90,40,${0.6 + 0.4 * pulse})` : 'rgba(255,200,120,0.5)';
    ctx.lineWidth = locked ? 6 : 3;
    ctx.beginPath();
    ctx.ellipse(x, d.floorY, a.impactRadius, 24, 0, 0, Math.PI * 2);
    ctx.stroke();
    if (locked) {
      const g = ctx.createLinearGradient(0, 0, 0, d.floorY);
      g.addColorStop(0, 'rgba(255,120,40,0)');
      g.addColorStop(1, `rgba(255,140,60,${0.25 * pulse})`);
      ctx.fillStyle = g;
      ctx.fillRect(x - 60, 0, 120, d.floorY);
    }
    ctx.restore();
  },
};

// ------------------------------------------------------------------ grab
// A lunge with the jaws open. If it connects, the player is shaken and
// hurled over the dragon's shoulder (damage on release, never from walls).
const grab = {
  begin(d) { d.holding = null; },
  telegraph(d, a, p) {
    defaultTelegraph(d, a, p);
    if (Math.random() < 0.4) {
      const head = d.frameToWorld(d.anim.data.head);
      d.game.particles.embers(head.x, head.y, 1, 30);
    }
  },
  active(d, a, dt, player) {
    const [f0, f1] = a.activeFrames;
    if (d.holding) {
      d.anim.set(a.anim, f1);
      if (player.state !== 'grabbed') d.holding = null;
      return !d.holding && d.t >= a.active;
    }
    d.anim.set(a.anim, d.t < a.active / 2 ? f0 : f1);
    d.x += d.facing * (a.lunge ?? 700) * dt;
    const m = d.frameToWorld(d.anim.data.mouth);
    const box = { x: m.x - a.hitbox.w / 2, y: m.y - a.hitbox.h / 2, w: a.hitbox.w, h: a.hitbox.h };
    d.debugBox = box;
    if (!d.hasHit && player.alive && !player.invulnerable && overlaps(box, player.hurtbox)) {
      d.hasHit = true;
      if (d.game.combat.hitPlayer(a.damage, 'physical', d.x, 0) && player.alive) {
        player.grabbedBy(d, a);
        d.holding = player;
        d.game.combat.text(d.x, d.floorY - 480, 'SEIZED!', '#ff6b5a', 46);
      }
    }
    return d.t >= a.active && !d.holding;
  },
  warning(d, ctx, time, a) {
    if (d.state !== 'telegraph') return;
    const head = d.frameToWorld(d.anim.data.head);
    const pulse = pulseOf(time);
    ctx.save();
    ctx.strokeStyle = `rgba(255,60,40,${0.5 + 0.5 * pulse})`;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(head.x, head.y, 90 + 20 * pulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    const reach = d.x + d.facing * 520;
    floorZone(ctx, d.floorY, Math.min(d.x, reach), Math.max(d.x, reach), 0.45 * pulse);
  },
};

// ------------------------------------------------------------------ debris
// A roar shakes burning wreckage loose; every impact spot is marked on the
// bridge first and at least one free spot is always next to the player.
const debris = {
  telegraph(d, a, p) {
    d.anim.set('stagger', 0);
    if (Math.random() < 0.5) d.game.camera.shake(0.04);
  },
  start(d, a, player) {
    const step = a.radius * 2 + 70;
    const slots = [];
    for (let x = d.arena.start + a.radius + 20; x <= d.arena.end - a.radius - 20; x += step) slots.push(x);
    let pi = 0;
    slots.forEach((x, i) => { if (Math.abs(x - player.x) < Math.abs(slots[pi] - player.x)) pi = i; });
    const safe = new Set([pi + (pi === 0 ? 1 : pi === slots.length - 1 ? -1 : Math.random() < 0.5 ? 1 : -1)]);
    safe.add(Math.floor(Math.random() * slots.length));
    safe.delete(pi);
    let n = 0;
    slots.forEach((x, i) => {
      if (safe.has(i) || n >= a.count) return;
      d.game.hazards.add(new FallingDebris(x, a, a.warn + n * 0.07));
      n++;
    });
  },
  active(d, a) {
    d.anim.set('stagger', 0);
    return d.t >= a.active;
  },
};


// ================================================================ Level 5
// Shared helpers for Vhagar's attacks.

function breakCoverNear(d, x, radius, dmg) {
  const level = d.game.levels.level;
  for (const sol of level.solids.slice()) {
    if (sol.prop && sol.prop.maxHp && Math.abs(sol.x + sol.w / 2 - x) < radius) level.damageSolid(sol, dmg, d.game);
  }
}

// Is there standing cover between the dragon and the warrior?
export function coverBetween(d, player) {
  const lo = Math.min(d.x, player.x), hi = Math.max(d.x, player.x);
  return d.game.levels.level.solids.some(sol => sol.x + sol.w > lo + 30 && sol.x < hi - 30 && sol.h >= 110);
}

function underSlab(d, player) {
  return (d.game.levels.level.platforms || []).some(pl => {
    const sl = pl.slab;
    return player.x > sl.x && player.x < sl.x + sl.w && sl.y < player.y - 100;
  });
}

// A straight jet of fire from the jaws to a point; stone and slabs stop it.
function lineStream(d, from, to) {
  const level = d.game.levels.level;
  const dx = to.x - from.x, dy = to.y - from.y;
  const L = Math.hypot(dx, dy) || 1;
  const dir = { x: dx / L, y: dy / L };
  let len = L, groundHit = true;
  for (let s = 40; s <= L; s += 14) {
    if (level.blocksAt(from.x + dir.x * s, from.y + dir.y * s)) { len = s; groundHit = false; break; }
  }
  return { mouth: from, dir, len, groundHit, impact: { x: from.x + dir.x * len, y: from.y + dir.y * len } };
}

function lineHits(st, rect) {
  for (let s = 0; s <= st.len; s += 26) {
    if (circleRect(st.mouth.x + st.dir.x * s, st.mouth.y + st.dir.y * s, 24 + s * 0.05, rect)) return true;
  }
  return false;
}

function throatGlow(d, ctx, time, k, big = 1) {
  if (k <= 0) return;
  const m = d.frameToWorld(d.anim.data.mouth);
  const c = d.anim.data.chest ? d.frameToWorld(d.anim.data.chest) : m;
  const r = (30 + 70 * k) * big * (1 + 0.06 * Math.sin(time * 30));
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const [p, rr] of [[m, r], [c, r * 1.6]]) {
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rr);
    g.addColorStop(0, `rgba(255,240,190,${0.8 * k})`);
    g.addColorStop(0.4, `rgba(255,150,50,${0.5 * k})`);
    g.addColorStop(1, 'rgba(255,60,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(p.x - rr, p.y - rr, rr * 2, rr * 2);
  }
  ctx.restore();
}

// Slot positions across the arena with a guaranteed gap next to the player.
// Only spots a warrior can stand on count (not inside or on top of stone).
function safeSlots(d, player, radius, count) {
  const step = radius * 2 + 80;
  const solids = d.game.levels.level.solids.filter(s => !(s.prop && s.prop.walkThrough));
  const standable = x => !solids.some(s => x > s.x - 50 && x < s.x + s.w + 50);
  const slots = [];
  for (let x = d.arena.start + radius + 30; x <= d.arena.end - radius - 30; x += step) if (standable(x)) slots.push(x);
  let pi = 0;
  slots.forEach((x, i) => { if (Math.abs(x - player.x) < Math.abs(slots[pi] - player.x)) pi = i; });
  const safe = new Set([pi + (pi === 0 ? 1 : pi === slots.length - 1 ? -1 : Math.random() < 0.5 ? 1 : -1)]);
  while (safe.size < 3) safe.add(Math.floor(Math.random() * slots.length));
  safe.delete(pi);
  const picked = [];
  const order = slots.map((x, i) => i).sort((a, b) => Math.abs(slots[a] - player.x) - Math.abs(slots[b] - player.x));
  for (const i of order) {
    if (safe.has(i) || picked.length >= count) continue;
    picked.push(slots[i]);
  }
  return picked;
}

// ------------------------------------------------------------------ scorch
// Scorched-Earth Breath: the aim follows the warrior only during the
// wind-up; then the jet sweeps a fixed path from near the jaws outward and
// leaves the ground burning. Behind the dragon, behind stone or under a
// rampart is safe; so is outrunning the end of the sweep.
function scorchPath(d, a) {
  const A = d.arena, dir = d.facing;
  const m = d.frameToWorld(d.sprite.animations[a.anim].per_frame[a.activeFrames[0]].mouth);
  const from = clamp(m.x + dir * a.sweepFrom, A.start, A.end);
  let to = clamp(d.aimX + dir * a.sweepPast, A.start, A.end);
  if ((to - from) * dir < 400) to = clamp(from + dir * 400, A.start, A.end);
  return { from, to, dir };
}

const scorch = {
  begin(d, a, player) {
    d.aimX = player.x;
    d.scorchPath = scorchPath(d, a);
    d.reversed = false;
  },
  telegraph(d, a, p, player) {
    defaultTelegraph(d, a, p);
    mouthEmbers(d, p);
    if (p < a.lockAt) {
      d.aimX = player.x;
      d.scorchPath = scorchPath(d, a);
    }
  },
  start(d, a) {
    d.scorchPath = scorchPath(d, a);
    d.lastBurn = null;
    d.tick = 0;
  },
  active(d, a, dt, player) {
    loopFrames(d, a);
    const P = d.scorchPath;
    const k = clamp(d.t / a.active, 0, 1);
    const ix = lerp(P.from, P.to, k * k * (3 - 2 * k));
    const mouth = d.frameToWorld(d.anim.data.mouth);
    const st = lineStream(d, mouth, { x: ix, y: d.floorY });
    d.stream = st;
    d.game.particles.fire(mouth.x, mouth.y, st.dir, 1700, 10, { spread: 0.12 });
    if (st.groundHit) {
      d.game.particles.fire(ix + rand(-60, 60), d.floorY - 8, { x: P.dir * 0.6, y: -0.6 }, 320, 2, { spread: 0.6 });
      // burning patches with gaps between them: a roll through the jet can land safe
      if (d.lastBurn === null || Math.abs(ix - d.lastBurn) >= a.burn.width * 2) {
        d.lastBurn = ix;
        d.game.hazards.add(new BurningGround(ix, a.burn.width, a.burn));
      }
    }
    d.game.camera.shake(0.03);
    d.tick += dt;
    if (d.tick >= a.tickRate) {
      d.tick -= a.tickRate;
      const hb = player.hurtbox;
      const atImpact = st.groundHit && overlaps(hb, { x: ix - 80, y: d.floorY - 170, w: 160, h: 170 });
      if (lineHits(st, hb) || atImpact) d.game.combat.burnPlayer(a.tickDamage, d.x);
    }
    if (d.t >= a.active && a.reverse && !d.reversed && (player.x - d.x) * d.facing < -60) {
      // the warrior rolled under: the eyes flare white and the jet whips round
      d.reversed = true;
      d.facing = -d.facing;
      d.aimX = player.x;
      d.scorchPath = scorchPath(d, a);
      d.feintCue = a.reverse;
      d.setState('telegraph');
      d.telegraphDur = a.reverse;
      d.stream = null;
      d.game.combat.text(d.x, d.floorY - 560, 'IT TURNS!', '#ffffff', 44);
      return false;
    }
    return d.t >= a.active;
  },
  warning(d, ctx, time, a) {
    const P = d.scorchPath;
    if (!P || d.state !== 'telegraph') return;
    const k = Math.min(1, d.t / d.telegraphDur);
    const x0 = Math.min(P.from, P.to), x1 = Math.max(P.from, P.to);
    floorZone(ctx, d.floorY, x0, x1, (0.25 + 0.45 * k) * pulseOf(time), 160);
    chevrons(ctx, d.floorY, x0, x1, P.dir, time, 0.75 * pulseOf(time), 180);
    const locked = d.t / d.telegraphDur >= a.lockAt;
    ctx.save();
    ctx.strokeStyle = locked ? 'rgba(255,90,40,0.95)' : 'rgba(255,200,120,0.6)';
    ctx.lineWidth = locked ? 5 : 3;
    ctx.beginPath();
    ctx.moveTo(d.aimX, d.floorY - 200);
    ctx.lineTo(d.aimX, d.floorY + 4);
    ctx.stroke();
    ctx.restore();
  },
  overlay(d, ctx, time) {
    if (d.state === 'telegraph') throatGlow(d, ctx, time, Math.min(1, d.t / d.telegraphDur));
  },
};

// ------------------------------------------------------------------ gust
// Wingstorm: beats that blow the warrior away from the front of the dragon
// and throw loose stone at head height. Brace (S), get behind stone or the
// dragon itself, or roll through each stone.
const gust = {
  begin(d) { d.gustRocks = 0; },
  telegraph(d, a, p) {
    defaultTelegraph(d, a, p);
    if (Math.random() < 0.5) d.game.particles.dust(d.x + d.facing * rand(100, 500), d.floorY, 1, d.facing);
  },
  start(d) { d.gustNext = 0.25; d.gustRocks = 0; },
  active(d, a, dt, player) {
    loopFrames(d, a);
    const inFront = (player.x - d.x) * d.facing > -120;
    const sheltered = !inFront || coverBetween(d, player);
    player.windPush(d.facing, a.force, a.maxPush, dt, sheltered);
    for (let i = 0; i < 3; i++) {
      d.game.particles.add({ kind: 'dot', sprite: 'ice', x: d.x + d.facing * rand(200, 1800), y: d.floorY - rand(20, 420),
                             vx: d.facing * rand(900, 1500), vy: rand(-40, 40), max: 0.5, size: rand(4, 10), size1: 1,
                             layer: 'front' });
    }
    if (Math.random() < 0.4) d.game.particles.dust(d.x + d.facing * rand(200, 900), d.floorY, 1, d.facing);
    d.game.camera.shake(0.04);
    d.gustNext -= dt;
    if (d.gustNext <= 0 && d.gustRocks < a.debris) {
      d.gustNext = a.active / (a.debris + 0.5);
      d.gustRocks++;
      const y = d.floorY - rand(182, 196);             // clears a braced (crouched) warrior
      d.game.hazards.add(new WindDebris(d.x + d.facing * 320 * d.scale, y, d.facing, 1150, a.debrisDamage, 2600));
    }
    return d.t >= a.active;
  },
  // drawn over the dragon so the storm reads clearly
  overlay(d, ctx, time) {
    if (d.state !== 'telegraph' && d.state !== 'active') return;
    const active = d.state === 'active';
    const x0 = d.x + d.facing * 300, x1 = d.x + d.facing * 2200;
    const lo = Math.min(x0, x1), hi = Math.max(x0, x1);
    ctx.save();
    if (active) {                      // a sheet of driven snow in front of the wings
      const g = ctx.createLinearGradient(x0, 0, x1, 0);
      g.addColorStop(0, 'rgba(220,235,255,0.32)');
      g.addColorStop(1, 'rgba(220,235,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(lo, d.floorY - 460, hi - lo, 460);
    }
    ctx.strokeStyle = `rgba(225,238,255,${(active ? 0.55 : 0.35) + 0.3 * pulseOf(time)})`;
    ctx.lineWidth = active ? 4 : 3;
    ctx.lineCap = 'round';
    for (let k = 0; k < 9; k++) {
      const y = d.floorY - 40 - k * 48;
      const off = ((time * (active ? 1400 : 700) + k * 130) % 400) * d.facing;
      ctx.beginPath();
      for (let x = lo; x < hi; x += 400) {
        ctx.moveTo(x + off, y);
        ctx.quadraticCurveTo(x + off + d.facing * 110, y - 14, x + off + d.facing * 230, y - 4);
      }
      ctx.stroke();
    }
    ctx.restore();
  },
};

// ------------------------------------------------------------------ mines
// Ember Minefield: fire spat into marked patches that crack, glow, then
// erupt one after another. A gap is always left beside the warrior.
const mines = {
  telegraph(d, a, p) {
    defaultTelegraph(d, a, p);
    mouthEmbers(d, p);
  },
  start(d, a, player) {
    const xs = safeSlots(d, player, a.radius, a.count);
    const mouth = d.frameToWorld(d.anim.data.mouth);
    xs.forEach((x, n) => {
      d.game.hazards.add(new EmberMine(x, a, a.warn + n * a.stagger));
      const dir = { x: x - mouth.x, y: d.floorY - mouth.y };
      const L = Math.hypot(dir.x, dir.y) || 1;
      d.game.particles.fire(mouth.x, mouth.y, { x: dir.x / L, y: dir.y / L }, L / 0.5, 6, { spread: 0.08, drag: 0.4 });
    });
  },
  active(d, a) {
    loopFrames(d, a);
    return d.t >= a.active;
  },
};

// ------------------------------------------------------------------ tailsweep
// Tail of Ruin: the dragon turns its back and the tail scythes behind it.
// A LOW sweep (tail along the ground) is jumped; a HIGH lash is rolled or
// braced under. The band on the floor shows which, and how far it reaches.
function tailBand(d, a, k = 1) {
  const back = -d.facing;
  const x0 = d.x + back * a.near, x1 = d.x + back * (a.near + a.reach * k);
  const [y0, y1] = d.tailHigh ? a.high : a.low;
  return { x: Math.min(x0, x1), y: d.floorY + y0, w: Math.abs(x1 - x0), h: y1 - y0 };
}

const tailsweep = {
  begin(d, a, player) {
    if ((player.x - d.x) * d.facing > 0) d.turn();       // put the tail toward the warrior
    d.tailHigh = Math.random() < 0.5;
    d.tailAnim = d.tailHigh ? 'tail_high' : 'tail_low';
    d.tailHit = false;
  },
  telegraph(d, a, p) {
    const fr = a.telegraphFrames;
    d.anim.set(d.tailAnim, fr[Math.min(fr.length - 1, Math.floor(p * fr.length))]);
    if (Math.random() < 0.3) d.game.particles.dust(d.x - d.facing * rand(200, 600), d.floorY, 1, -d.facing);
  },
  active(d, a, dt, player) {
    const [f0, f1] = a.activeFrames;
    const p = clamp(d.t / a.active, 0, 0.999);
    d.anim.set(d.tailAnim, f0 + Math.floor(p * (f1 - f0 + 1)));
    const band = tailBand(d, a, Math.min(1, 0.3 + p * 1.2));
    d.debugBox = band;
    if (!d.tailHit && overlaps(band, player.hurtbox)) {
      if (d.game.combat.hitPlayer(a.damage, a.type, d.x, a.knockback)) d.tailHit = true;
    }
    const level = d.game.levels.level;
    for (const sol of level.solids.slice()) {           // the tail smashes the cover it meets
      if (sol.prop && sol.prop.maxHp && !sol.prop.playerHits && overlaps(band, sol)) level.damageSolid(sol, 99, d.game);
    }
    if (Math.random() < 0.7) d.game.particles.dust(band.x + rand(0, band.w), d.floorY, 1, -d.facing);
    return d.t >= a.active;
  },
  warning(d, ctx, time, a) {
    if (d.state !== 'telegraph') return;
    const b = tailBand(d, a);
    const pulse = pulseOf(time);
    ctx.save();
    ctx.fillStyle = `rgba(255,80,40,${0.18 + 0.16 * pulse})`;
    ctx.fillRect(b.x, b.y, b.w, b.h);
    ctx.strokeStyle = `rgba(255,190,120,${0.6 + 0.4 * pulse})`;
    ctx.lineWidth = 4;
    ctx.strokeRect(b.x, b.y, b.w, b.h);
    // arrows: jump over the low sweep, duck under the high lash
    ctx.fillStyle = `rgba(255,236,190,${0.7 + 0.3 * pulse})`;
    for (let x = b.x + 80; x < b.x + b.w - 40; x += 180) {
      const y = d.tailHigh ? d.floorY - 60 : b.y - 40;
      const s = d.tailHigh ? 1 : -1;
      ctx.beginPath();
      ctx.moveTo(x - 22, y - s * 16); ctx.lineTo(x + 22, y - s * 16); ctx.lineTo(x, y + s * 16);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  },
  overlay(d, ctx, time, a) {
    if (d.state !== 'active') return;
    const p = clamp(d.t / a.active, 0, 1);
    const b = tailBand(d, a, Math.min(1, 0.3 + p * 1.2));
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createLinearGradient(b.x, 0, b.x + b.w, 0);
    const back = -d.facing;
    g.addColorStop(back > 0 ? 0 : 1, 'rgba(255,220,180,0.05)');
    g.addColorStop(back > 0 ? 1 : 0, 'rgba(255,230,200,0.55)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(b.x + b.w / 2, b.y + b.h / 2, b.w / 2, b.h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },
};

// ------------------------------------------------------------------ pulse
// Inferno Pulse: a ring of fire bursts from the body and runs outward along
// the ground on both sides. It is 170 px tall: jump it, roll through it,
// be farther than it reaches, or behind stone (it stops at cover).
const pulse = {
  telegraph(d, a, p) {
    d.anim.set('stagger', p < 0.3 ? 2 : 0);
    if (Math.random() < 0.6) {
      const b = d.hurtboxes()[1].rect;
      d.game.particles.embers(b.x + rand(0, b.w), b.y + rand(0, b.h), 1, 60);
    }
    d.game.camera.shake(0.03 * p);
  },
  start(d, a) {
    const level = d.game.levels.level;
    const stop = dir => {
      for (let r = 80; r <= a.maxRadius; r += 20) {
        if (level.blocksAt(d.x + dir * r, d.floorY - 40)) return r;
      }
      return null;
    };
    d.ring = { r: 60, hit: false, stopL: stop(-1), stopR: stop(1) };
    d.game.camera.shake(0.7);
    for (const sx of [-1, 1]) d.game.hazards.add(new BurningGround(d.x + sx * a.burn.radius, a.burn.width, a.burn));
  },
  active(d, a, dt, player) {
    d.anim.set('stagger', 0);
    const R = d.ring;
    R.r += a.speed * dt;
    const dx = player.x - d.x;
    const stop = dx < 0 ? R.stopL : R.stopR;
    const within = Math.abs(Math.abs(dx) - R.r) < a.ringWidth / 2 && (stop === null || Math.abs(dx) < stop);
    if (!R.hit && within && player.y > d.floorY - a.ringHeight) {
      if (d.game.combat.hitPlayer(a.damage, a.type, d.x, a.knockback)) R.hit = true;
    }
    for (const dir of [-1, 1]) {
      const st = dir < 0 ? R.stopL : R.stopR;
      if (st !== null && R.r > st) continue;
      d.game.particles.fire(d.x + dir * R.r, d.floorY - 10, { x: dir * 0.3, y: -1 }, rand(300, 520), 2,
                            { spread: 0.4, sizeMul: 1.0 });
    }
    return R.r >= a.maxRadius;
  },
  warning(d, ctx, time, a) {
    if (d.state === 'telegraph') {
      const k = Math.min(1, d.t / d.telegraphDur);
      ctx.save();
      ctx.setLineDash([16, 14]);
      ctx.strokeStyle = `rgba(255,170,80,${0.4 + 0.4 * pulseOf(time)})`;
      ctx.lineWidth = 4;
      for (const r of [a.maxRadius * 0.35 * (0.5 + k), a.maxRadius * (0.6 + 0.4 * k)]) {
        ctx.beginPath();
        ctx.ellipse(d.x, d.floorY + 2, r, 30, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }
  },
  overlay(d, ctx, time, a) {
    if (d.state === 'telegraph') { throatGlow(d, ctx, time, Math.min(1, d.t / d.telegraphDur), 1.4); return; }
    const R = d.ring;
    if (!R) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const dir of [-1, 1]) {
      const st = dir < 0 ? R.stopL : R.stopR;
      if (st !== null && R.r > st) continue;
      const x = d.x + dir * R.r;
      const g = ctx.createLinearGradient(0, d.floorY - a.ringHeight, 0, d.floorY);
      g.addColorStop(0, 'rgba(255,120,30,0)');
      g.addColorStop(1, 'rgba(255,210,120,0.85)');
      ctx.fillStyle = g;
      ctx.fillRect(x - a.ringWidth / 2, d.floorY - a.ringHeight, a.ringWidth, a.ringHeight);
    }
    ctx.strokeStyle = 'rgba(255,190,90,0.6)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.ellipse(d.x, d.floorY + 2, R.r, 34, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};

// ------------------------------------------------------------------ platerain
// Molten Armor Rain: weakened plates are torn off and thrown. Every arc and
// landing ring shows from the throw; a gap is always left by the warrior.
// The torn-off plate leaves that part of the body exposed.
const platerain = {
  telegraph(d, a, p) {
    d.anim.set('stagger', 1);
    if (Math.random() < 0.6) {
      const b = d.hurtboxes()[1].rect;
      d.game.particles.sparks(b.x + rand(0, b.w), b.y + rand(0, b.h * 0.5), 2, 'spark', 0.6);
    }
    d.game.camera.shake(0.04);
  },
  start(d, a, player) {
    const xs = safeSlots(d, player, a.radius, a.count);
    const from = d.frameToWorld(d.anim.data.wing || d.anim.data.chest);
    xs.forEach((x, n) => d.game.hazards.add(new MoltenPlate(d.game, from, x, { ...a, flight: a.flight + n * 0.12 })));
    d.game.camera.shake(0.5);
    const intact = Object.values(d.segments || {}).filter(sg => !sg.broken);
    if (intact.length) {
      intact.sort((u, v) => u.hp / u.max - v.hp / v.max);
      d.breakSegment(intact[0].id, { stagger: false });
    }
  },
  active(d, a) {
    d.anim.set('stagger', 0);
    return d.t >= a.active;
  },
};

// ------------------------------------------------------------------ shadowhunt
// Shadow Hunt: it vanishes into the storm. False shadows race across the
// ice; only the hunt itself has burning eyes in the cloud, a ring that
// locks over the warrior, then the dive.
const shadowhunt = {
  custom: true,
  unclamped: true,
  begin(d, a) {
    const [n0, n1] = a.falsePasses;
    d.shadow = { sub: 'rise', t: 0, passes: n0 + Math.floor(Math.random() * (n1 - n0 + 1)), done: 0, dir: 1, x: d.x };
    d.anim.play('flight');
    d.game.particles.dust(d.x, d.floorY, 26);
    d.game.camera.shake(0.4);
  },
  update(d, a, dt, player) {
    const s = d.shadow, A = d.arena;
    const lo = A.start + 260, hi = A.end - 260;
    s.t += dt;
    d.anim.play('flight');
    if (s.sub === 'rise') {
      d.y = lerp(d.floorY, d.floorY - 1500, easeIn(Math.min(1, s.t / 0.7)));
      if (s.t >= 0.7) { s.sub = 'pass'; s.t = 0; s.dir = player.x > (A.start + A.end) / 2 ? -1 : 1; }
    } else if (s.sub === 'pass') {
      const k = s.t / a.passTime;
      s.x = lerp(s.dir > 0 ? A.start - 300 : A.end + 300, s.dir > 0 ? A.end + 300 : A.start - 300, k);
      d.x = s.x;
      if (k >= 1) {
        s.done++;
        s.t = 0;
        s.dir = -s.dir;
        if (s.done >= s.passes) { s.sub = 'hunt'; s.x = s.dir > 0 ? A.start - 200 : A.end + 200; }
      }
    } else if (s.sub === 'hunt') {
      s.x += clamp(clamp(player.x, lo, hi) - s.x, -1600 * dt, 1600 * dt);
      d.x = s.x;
      if (s.t >= 0.8) { s.sub = 'lock'; s.t = 0; s.zone = clamp(player.x, lo, hi); }
    } else if (s.sub === 'lock') {
      s.x += clamp(s.zone - s.x, -900 * dt, 900 * dt);
      d.x = s.x;
      if (s.t >= a.lock) { s.sub = 'dive'; s.t = 0; s.fromY = d.y; d.x = s.zone; }
    } else if (s.sub === 'dive') {
      const p = Math.min(1, s.t / a.diveTime);
      d.y = lerp(s.fromY, d.floorY, p * p);
      d.facing = player.x > d.x ? 1 : -1;
      if (p >= 1) {
        d.y = d.floorY;
        d.game.camera.shake(0.9);
        d.game.particles.debris(s.zone, d.floorY - 10, 26, 150);
        d.game.particles.dust(s.zone, d.floorY, 26);
        if (Math.abs(player.x - s.zone) < a.impactRadius && player.y > d.floorY - 220) {
          d.game.combat.hitPlayer(a.damage, a.type, s.zone, a.knockback);
        }
        for (const dir of [-1, 1]) d.game.hazards.add(new GroundShock(d.game, s.zone, dir, a.shockwave));
        d.diveRecovery = a.landRecovery;
        d.shadow = null;
        d.setState('recovery');
      }
    }
  },
  recoveryTime(d, a) { return d.diveRecovery ?? a.recovery; },
  warning(d, ctx, time, a) {
    const s = d.shadow;
    if (!s || s.sub === 'rise') return;
    const hunting = s.sub !== 'pass';
    const x = s.sub === 'lock' || s.sub === 'dive' ? s.zone : s.x;
    ctx.save();
    ctx.fillStyle = hunting ? 'rgba(2,4,10,0.6)' : 'rgba(6,10,20,0.32)';
    ctx.beginPath();
    ctx.ellipse(x, d.floorY + 4, 360, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    if (hunting) {
      const pulse = pulseOf(time);
      // the tell: two burning eyes in the cloud above the real hunter
      ctx.globalCompositeOperation = 'lighter';
      const ey = 250;
      const dark = ctx.createRadialGradient(x, ey, 10, x, ey, 220);          // the bulk of it in the cloud
      dark.addColorStop(0, 'rgba(4,6,12,0.55)');
      dark.addColorStop(1, 'rgba(4,6,12,0)');
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = dark;
      ctx.fillRect(x - 220, ey - 220, 440, 440);
      ctx.globalCompositeOperation = 'lighter';
      for (const ex of [-34, 34]) {
        const g = ctx.createRadialGradient(x + ex, ey, 0, x + ex, ey, 52);
        g.addColorStop(0, `rgba(255,244,190,${0.9 * pulse + 0.1})`);
        g.addColorStop(0.35, `rgba(255,150,50,${0.6 * pulse + 0.2})`);
        g.addColorStop(1, 'rgba(255,90,20,0)');
        ctx.fillStyle = g;
        ctx.fillRect(x + ex - 52, ey - 52, 104, 104);
      }
      ctx.globalCompositeOperation = 'source-over';
      if (s.sub !== 'hunt') {
        floorZone(ctx, d.floorY, x - a.impactRadius, x + a.impactRadius, 0.7 * pulse, 90);
        ctx.strokeStyle = `rgba(255,90,40,${0.6 + 0.4 * pulse})`;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.ellipse(x, d.floorY, a.impactRadius, 24, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();
  },
};

// ------------------------------------------------------------------ combo
// Triple Cataclysm is sequenced by Dragon.beginAttack / updateRecovery;
// this entry only lets the registry validate it.
const combo = {
  telegraph() {},
  active() { return true; },
};

// ------------------------------------------------------------------ lastember
// The Last Ember: a very long wind-up, the arena darkens, the chest blazes
// (and is exposed). Enough damage during the wind-up breaks it into the
// longest stagger of the fight. Otherwise the blast fills the arena; only
// stone between you and the dragon shelters you. It is heavy but never
// kills a warrior above 40% health.
const lastember = {
  begin(d) {
    d.emberBroken = false;
    d.game.combat.text(d.x, d.floorY - 600, 'THE LAST EMBER', '#ff7a3a', 56);
    d.events.push({ type: 'lastember' });
  },
  telegraph(d, a, p, player) {
    defaultTelegraph(d, a, p);
    if (!d.emberBroken && d.windupDamage >= a.interruptDamage) {
      d.emberBroken = true;
      d.game.combat.text(d.x, d.floorY - 560, 'THE EMBER BREAKS!', '#ffd36b', 54);
      d.game.camera.shake(0.9);
      d.events.push({ type: 'emberbroken' });
      d.staggerFor = a.interruptStagger;
      d.exposeSegment('head', a.interruptStagger, false);
      d.enterStagger();
      return;
    }
    if (Math.random() < 0.3 + p) {
      const b = d.hurtboxes()[1].rect;
      d.game.particles.embers(b.x + rand(0, b.w), b.y + rand(0, b.h), 2, 80);
    }
    d.game.camera.shake(0.02 + 0.06 * p);
  },
  start(d) {
    d.blastHit = false;
    d.game.camera.shake(1.1);
  },
  active(d, a, dt, player) {
    loopFrames(d, a);
    const mouth = d.frameToWorld(d.anim.data.mouth);
    for (let i = 0; i < 4; i++) {
      d.game.particles.fire(mouth.x, mouth.y, { x: d.facing * rand(0.5, 1), y: rand(-0.3, 0.6) }, rand(1400, 2200), 3,
                            { spread: 0.4 });
      d.game.particles.fire(d.x + rand(-1400, 1400), d.floorY - rand(0, 300), { x: 0, y: -1 }, 300, 1, { spread: 0.8 });
    }
    if (!d.blastHit && d.t >= 0.15) {
      d.blastHit = true;
      if (!coverBetween(d, player)) d.game.combat.lastEmberHit(player, a, d.x);
      else d.game.combat.text(player.x, player.y - 300, 'SHELTERED', '#bfe4ff', 40);
    }
    return d.t >= a.active;
  },
  // the shelters (far side of every standing stone), lit through the darkness
  shelters(d, ctx, time) {
    if (d.state !== 'telegraph') return;
    const level = d.game.levels.level;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const sol of level.solids) {
      const side = sol.x + sol.w / 2 > d.x ? 1 : -1;
      const x0 = side > 0 ? sol.x + sol.w : sol.x - 160;
      const g = ctx.createLinearGradient(0, d.floorY - 260, 0, d.floorY);
      g.addColorStop(0, 'rgba(120,190,255,0)');
      g.addColorStop(1, `rgba(140,200,255,${0.3 + 0.15 * pulseOf(time)})`);
      ctx.fillStyle = g;
      ctx.fillRect(x0, d.floorY - 260, 160, 264);
    }
    ctx.restore();
  },
  overlay(d, ctx, time) {
    if (d.state === 'telegraph') throatGlow(d, ctx, time, Math.min(1, d.t / d.telegraphDur), 2.2);
  },
};


// ------------------------------------------------------------------ skyreign
// Sky Reign: Vhagar climbs out of sword reach. Aemond hurls spears (each
// landing ring locks before the throw), then Vhagar swoops low across the
// arena with Aemond's blade at chest height: brace (S) or roll under it.
// A scorpion bolt, Dawnfire or the chain hook brings it crashing down.
const skyreign = {
  custom: true,
  unclamped: true,
  begin(d, a) {
    d.reign = { sub: 'rise', t: 0, thrown: 0, next: a.hover + a.spearLead, reticle: null, dir: 1, strike: 0 };
    d.anim.play('flight');
    d.game.particles.dust(d.x, d.floorY, 28);
    d.game.camera.shake(0.45);
    d.events.push({ type: 'skyreign' });
  },
  update(d, a, dt, player) {
    const s = d.reign, A = d.arena;
    s.t += dt;
    s.strike = Math.max(0, s.strike - dt);
    const fly = s.strike > 0 || s.sub === 'swoop' || s.sub === 'swoopwarn' ? 'flight_strike' : 'flight';
    d.anim.play(d.sprite.animations[fly] ? fly : 'flight');
    if (s.sub === 'rise') {
      d.y = lerp(d.floorY, d.floorY - a.altitude, easeOut(Math.min(1, s.t / 0.8)));
      if (s.t >= 0.8) { s.sub = 'hover'; s.t = 0; }
    } else if (s.sub === 'hover') {
      const side = Math.sign(d.x - player.x) || 1;
      const want = clamp(player.x + side * 560, A.start + 260, A.end - 260);
      d.x += clamp(want - d.x, -320 * dt, 320 * dt);
      d.y = d.floorY - a.altitude + Math.sin(s.t * 3) * 20;
      d.facing = player.x > d.x ? 1 : -1;
      s.next -= dt;
      if (s.thrown < a.spears) {
        if (s.next <= a.spearLead && !s.reticle) s.reticle = { x: player.x, locked: false };
        if (s.reticle && !s.reticle.locked) {
          s.reticle.x = player.x;
          if (s.next <= a.spearLock) s.reticle.locked = true;
        }
        if (s.next <= 0) {
          const rider = d.anim.data.rider ? d.frameToWorld(d.anim.data.rider) : { x: d.x, y: d.y - 400 };
          d.game.hazards.add(new AemondSpear(d.game, rider, s.reticle.x, a));
          d.game.combat.text(rider.x, rider.y - 40, 'AEMOND!', '#e6e6ee', 30);
          s.thrown++;
          s.reticle = null;
          s.strike = 0.5;
          s.next = a.spearEvery;
        }
      } else if (s.next <= a.spearEvery - 0.6) {
        // the swoop comes from the side the warrior is farthest from
        s.sub = 'swoopwarn';
        s.t = 0;
        s.dir = player.x > (A.start + A.end) / 2 ? -1 : 1;
        s.fromX = s.dir > 0 ? A.start - 700 : A.end + 700;
      }
    } else if (s.sub === 'swoopwarn') {
      d.x += clamp(s.fromX - d.x, -2400 * dt, 2400 * dt);
      d.y = lerp(d.y, d.floorY - a.altitude - 260, Math.min(1, dt * 3));
      d.facing = s.dir;
      if (s.t >= a.swoopWarn) { s.sub = 'swoop'; s.t = 0; d.x = s.fromX; s.hit = false; }
    } else if (s.sub === 'swoop') {
      d.facing = s.dir;
      d.x += s.dir * a.swoopSpeed * dt;
      d.y = d.floorY + Math.sin(s.t * 9) * 6;
      const band = { x: d.x - 300, y: d.floorY + a.swoopBand[0], w: 600, h: a.swoopBand[1] - a.swoopBand[0] };
      d.debugBox = band;
      if (!s.hit && overlaps(band, player.hurtbox)) s.hit = d.game.combat.hitPlayer(a.damage, a.type, d.x, a.knockback);
      if (Math.random() < 0.8) d.game.particles.dust(d.x + rand(-200, 200), d.floorY, 2, s.dir);
      d.game.camera.shake(0.05);
      const gone = s.dir > 0 ? d.x > A.end + 600 : d.x < A.start - 600;
      if (gone) {
        s.sub = 'land';
        s.t = 0;
        d.x = s.dir > 0 ? A.end - 420 : A.start + 420;
        d.y = d.floorY - 900;
        s.fromY = d.y;
      }
    } else if (s.sub === 'land') {
      d.y = lerp(s.fromY, d.floorY, easeOut(Math.min(1, s.t / 1.0)));
      d.facing = player.x > d.x ? 1 : -1;
      if (s.t >= 1.0) {
        d.y = d.floorY;
        d.game.camera.shake(0.6);
        d.game.particles.dust(d.x, d.floorY, 30);
        d.reign = null;
        d.diveRecovery = a.landRecovery;
        d.setState('recovery');
      }
    } else if (s.sub === 'fall') {
      // brought down: it crashes, stunned, its wings and head open
      s.vy = (s.vy || 0) + 3400 * dt;
      d.y += s.vy * dt;
      d.x = clamp(d.x, A.start + 260, A.end - 260);
      if (d.y >= d.floorY) {
        d.y = d.floorY;
        d.game.camera.shake(1.0);
        d.game.particles.debris(d.x, d.floorY - 20, 40, 260);
        d.game.particles.dust(d.x, d.floorY, 40);
        d.reign = null;
        d.exposeSegment('wing', a.downedTime, false);
        d.exposeSegment('head', a.downedTime, false);
        d.staggerFor = a.downedTime;
        d.enterStagger();
      }
    }
  },
  recoveryTime(d, a) { return d.diveRecovery ?? a.recovery; },
  warning(d, ctx, time, a) {
    const s = d.reign;
    if (!s) return;
    const pulse = pulseOf(time);
    if (s.reticle) {                           // where the next spear will land
      const r = a.spearRadius;
      ctx.save();
      ctx.strokeStyle = s.reticle.locked ? `rgba(255,80,40,${0.6 + 0.4 * pulse})` : 'rgba(255,220,160,0.6)';
      ctx.lineWidth = s.reticle.locked ? 6 : 3;
      ctx.beginPath();
      ctx.ellipse(s.reticle.x, d.floorY, r, 20, 0, 0, Math.PI * 2);
      ctx.stroke();
      if (s.reticle.locked) floorZone(ctx, d.floorY, s.reticle.x - r, s.reticle.x + r, 0.6 * pulse, 120);
      ctx.restore();
    }
    if (s.sub === 'swoopwarn' || s.sub === 'swoop') {
      // the band Aemond's blade will sweep: duck under it
      const A = d.arena;
      ctx.save();
      ctx.fillStyle = `rgba(255,70,40,${s.sub === 'swoopwarn' ? 0.16 + 0.12 * pulse : 0.1})`;
      ctx.fillRect(A.start, d.floorY + a.swoopBand[0], A.end - A.start, a.swoopBand[1] - a.swoopBand[0]);
      ctx.strokeStyle = `rgba(255,200,140,${0.5 + 0.4 * pulse})`;
      ctx.lineWidth = 3;
      ctx.strokeRect(A.start, d.floorY + a.swoopBand[0], A.end - A.start, a.swoopBand[1] - a.swoopBand[0]);
      ctx.restore();
      chevrons(ctx, d.floorY + a.swoopBand[0] + 110, A.start, A.end, s.dir, time, 0.8 * pulse, 220);
    }
  },
};

// ------------------------------------------------------------------ rift
// Earthsplitter: the claws come down and a rift of stone spikes runs along
// the ground toward the warrior. Roll through its front, jump it, stand on a
// rampart, or keep stone between you (it stops at cover).
const rift = {
  telegraph(d, a, p) {
    defaultTelegraph(d, a, p);
    if (Math.random() < 0.5) d.game.particles.debris(d.x + d.facing * rand(200, 700), d.floorY - 6, 1, 20);
  },
  start(d, a, player) {
    const x = d.x + d.facing * 250 * d.scale;
    const dir = Math.sign(player.x - x) || d.facing;
    d.game.hazards.add(new RiftWave(d.game, x, dir, a));
    d.game.camera.shake(0.8);
    d.game.particles.debris(x, d.floorY - 10, 24, 120);
  },
  active(d, a) {
    const [f0, f1] = a.activeFrames;
    d.anim.set(a.anim, d.t < a.active / 2 ? f0 : f1);
    return d.t >= a.active;
  },
  warning(d, ctx, time, a) {
    if (d.state !== 'telegraph') return;
    const player = d.game.levels.player;
    const x = d.x + d.facing * 250 * d.scale;
    const dir = Math.sign(player.x - x) || d.facing;
    const x1 = x + dir * a.riftRange;
    const k = Math.min(1, d.t / d.telegraphDur);
    floorZone(ctx, d.floorY, Math.min(x, x1), Math.max(x, x1), (0.2 + 0.4 * k) * pulseOf(time), 60);
    chevrons(ctx, d.floorY, Math.min(x, x1), Math.max(x, x1), dir, time, 0.8 * pulseOf(time), 150);
  },
};

// ------------------------------------------------------------------ guard
// Wing Guard: the answer to button-mashing. A wing comes up and blocks every
// blow from the front; a white flare, then the wing buffets everything in
// front of it. Blows from behind still land.
const guard = {
  begin(d) {
    d.guardBuffet = false;
    d.game.combat.text(d.x, d.floorY - 560, 'WING GUARD', '#bfe4ff', 40);
  },
  telegraph(d, a) { d.anim.set(a.anim, 0); },
  start(d) { d.guarding = true; },
  active(d, a, dt, player) {
    d.anim.set(a.anim, d.t < a.buffetAt ? 1 : 3);
    d.guardCue = d.t > a.buffetAt - 0.6 && d.t < a.buffetAt;
    if (!d.guardBuffet && d.t >= a.buffetAt) {
      d.guardBuffet = true;
      d.guarding = false;
      // the wing beats forward: under the body and behind it are clear
      const x0 = d.x + d.facing * 90, x1 = d.x + d.facing * a.buffetRange;
      const box = { x: Math.min(x0, x1), y: d.floorY - a.buffetHeight, w: Math.abs(x1 - x0), h: a.buffetHeight };
      d.debugBox = box;
      if (overlaps(box, player.hurtbox)) d.game.combat.hitPlayer(a.damage, a.type, d.x, a.knockback);
      d.game.camera.shake(0.5);
      for (let i = 0; i < 20; i++) d.game.particles.dust(d.x + d.facing * rand(100, a.buffetRange), d.floorY, 1, d.facing);
    }
    return d.t >= a.active;
  },
  warning(d, ctx, time, a) {
    if (d.state !== 'active' || d.guardBuffet) return;
    const x0 = d.x + d.facing * 90, x1 = d.x + d.facing * a.buffetRange;
    const hot = d.guardCue ? 0.7 : 0.2;
    floorZone(ctx, d.floorY, Math.min(x0, x1), Math.max(x0, x1), hot * pulseOf(time), a.buffetHeight);
  },
  overlay(d, ctx, time) {
    if (d.state !== 'active' || d.guardBuffet) return;
    const w = d.anim.data.wing ? d.frameToWorld(d.anim.data.wing) : { x: d.x, y: d.y - 300 };
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const r = d.guardCue ? 200 : 140;
    const g = ctx.createRadialGradient(w.x, w.y, 10, w.x, w.y, r);
    g.addColorStop(0, `rgba(220,240,255,${d.guardCue ? 0.8 : 0.35})`);
    g.addColorStop(1, 'rgba(140,200,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(w.x - r, w.y - r, r * 2, r * 2);
    ctx.restore();
  },
};

// ------------------------------------------------------------------ circling
// Sunfyre's Sky Dance: climbs and circles the arena at changing heights,
// loosing curved golden arcs (each ring locks before it lands); feints one
// or two dives (the eyes flare white, it pulls up short), then commits to
// a marked dive (the ring turns red, it screams). A dive into empty ice
// crashes it, open. A Frostbrand blow in the last moment of the dive breaks
// it (frozen, open). A Frostpiercer spear knocks it out of the sky.
const circling = {
  custom: true,
  unclamped: true,
  begin(d, a) {
    const [f0, f1] = a.feints;
    d.circ = { sub: 'rise', t: 0, T: 0, shot: a.shotEvery, feints: Math.floor(rand(f0, f1 + 0.999)), passes: 0 };
    d.anim.play('flight');
    d.game.particles.dust(d.x, d.floorY, 24);
    d.sfx('wing', { gain: 1.5 });
  },
  path(d, a, T) {
    const A = d.arena, lo = A.start + 320, hi = A.end - 320;
    const mid = (lo + hi) / 2, half = (hi - lo) / 2;
    const ang = d.circ.phase0 + T * a.passSpeed * Math.PI;
    const [alt0, alt1] = a.altitude;
    return { x: mid + half * Math.sin(ang), y: d.floorY - lerp(alt0, alt1, 0.5 + 0.5 * Math.sin(ang * 2 + 1)),
             vx: Math.cos(ang) };
  },
  update(d, a, dt, player) {
    const s = d.circ, A = d.arena;
    s.t += dt;
    d.anim.play('flight');
    if (Math.random() < dt * 1.6) d.sfx('wing', { gain: 0.6 });
    const lo = A.start + 320, hi = A.end - 320;
    if (s.sub === 'rise') {
      d.y = lerp(d.floorY, d.floorY - a.altitude[1], easeOut(Math.min(1, s.t / 0.8)));
      if (s.t >= 0.8) {
        s.sub = 'circle'; s.t = 0;
        const mid = (lo + hi) / 2, half = (hi - lo) / 2;
        s.phase0 = Math.asin(clamp((d.x - mid) / half, -1, 1));
        s.T = 0;
      }
    } else if (s.sub === 'circle' || s.sub === 'return') {
      s.T += dt;
      const P = circling.path(d, a, s.T);
      const k = s.sub === 'return' ? Math.min(1, s.t / 0.7) : 1;
      d.x = lerp(d.x, P.x, s.sub === 'return' ? k * 0.2 : 1);
      d.y = lerp(d.y, P.y, s.sub === 'return' ? k * 0.15 : 1);
      if (s.sub === 'return' && s.t >= 0.7) s.sub = 'circle';
      d.facing = P.vx > 0 ? 1 : -1;
      // golden arcs: the ring follows the warrior, then locks
      s.shot -= dt;
      if (s.shot <= a.shotLead && !d.reticle) d.reticle = { x: player.x, y: player.y - 120, locked: false };
      if (d.reticle && s.shot > a.shotLead * 0.35) { d.reticle.x = player.x; d.reticle.y = player.y - 120; }
      else if (d.reticle) d.reticle.locked = true;
      if (s.shot <= 0 && d.reticle && Math.abs(P.vx) > 0.3) {     // never mid-turn
        const mouth = d.frameToWorld(d.anim.data.mouth);
        d.game.hazards.add(new Fireball(d.game, mouth, d.reticle, a.arc));
        d.reticle = null;
        s.shot = a.shotEvery;
      }
      const passTime = 1 / a.passSpeed;
      if (s.sub === 'circle' && s.T >= passTime * (s.passes + 1)) {
        s.passes++;
        if (s.passes >= a.passes) {
          d.reticle = null;
          s.zone = clamp(player.x, lo, hi);
          s.t = 0;
          s.fromX = d.x; s.fromY = d.y;
          if (s.feints > 0) { s.sub = 'feint'; s.feints--; d.feintCue = 0.7; }
          else { s.sub = 'mark'; d.sfx('screech', { pitch: 1 }); }
        }
      }
    } else if (s.sub === 'feint') {
      // swoops at a ring, but the eyes flared white: it pulls up at the last moment
      const p = Math.min(1, s.t / 0.6);
      d.x = lerp(s.fromX, s.zone, easeOut(p));
      d.y = lerp(s.fromY, d.floorY - 320, p * p);
      d.facing = s.zone > s.fromX ? 1 : -1;
      if (p >= 1) { s.sub = 'return'; s.t = 0; s.passes = a.passes - 1; }
    } else if (s.sub === 'mark') {
      // the real one: the ring is locked red; it hangs above it, then falls
      d.x += clamp(s.zone - d.x, -900 * dt, 900 * dt);
      d.y = lerp(d.y, d.floorY - a.altitude[0], Math.min(1, dt * 3));
      d.facing = player.x > d.x ? 1 : -1;
      if (s.t >= a.mark) { s.sub = 'dive'; s.t = 0; s.fromX = d.x; s.fromY = d.y; }
    } else if (s.sub === 'dive') {
      const p = Math.min(1, s.t / a.diveTime);
      d.y = lerp(s.fromY, d.floorY, p * p);
      d.x = lerp(s.fromX, s.zone, p);
      if (p >= 1) circling.land(d, a, player);
    } else if (s.sub === 'fall') {
      s.vy = (s.vy || 0) + 3200 * dt;
      d.y += s.vy * dt;
      if (d.y >= d.floorY) {
        d.y = d.floorY;
        d.game.camera.shake(1);
        d.game.particles.debris(d.x, d.floorY - 20, 40, 260);
        d.sfx('boom', { size: 0.9 });
        d.makeVulnerable(a.missVulnerable);
        d.circRecovery = a.missVulnerable;
        d.circ = null;
        d.setState('recovery');
      }
    }
  },
  land(d, a, player) {
    const s = d.circ;
    d.y = d.floorY;
    d.game.camera.shake(0.9);
    d.game.particles.debris(s.zone, d.floorY - 10, 26, 150);
    d.game.particles.dust(s.zone, d.floorY, 26);
    d.sfx('boom', { size: 0.7 });
    const near = Math.abs(player.x - s.zone) < a.impactRadius && player.y > d.floorY - 220;
    const struck = near && d.game.combat.hitPlayer(a.damage, 'physical', s.zone, a.knockback);
    d.circRecovery = a.recovery;
    if (!struck) {
      d.makeVulnerable(a.missVulnerable);
      d.circRecovery = a.missVulnerable;
      d.game.combat.text(s.zone, d.floorY - 420, 'SUNFYRE CRASHES!', '#ffd36b', 46);
    }
    d.circ = null;
    d.setState('recovery');
  },
  // Frostbrand in the dive's last moment: it hits the ice, frozen
  breakDive(d, a) {
    const s = d.circ;
    if (!s || s.sub !== 'dive' || s.t < a.diveTime - a.breakWindow) return false;
    d.y = d.floorY;
    d.circ = null;
    d.game.combat.text(d.x, d.floorY - 480, 'DIVE BROKEN!', '#bfe4ff', 54);
    d.freeze(a.breakFreeze, null);
    d.makeVulnerable(a.breakFreeze);
    return true;
  },
  recoveryTime(d, a) { return d.circRecovery ?? a.recovery; },
  warning(d, ctx, time, a) {
    const s = d.circ;
    if (!s) return;
    const pulse = pulseOf(time);
    const r = d.reticle;
    if (r) {
      ctx.save();
      ctx.strokeStyle = r.locked ? `rgba(255,90,40,${0.9 * pulse + 0.1})` : `rgba(255,214,120,${0.6 * pulse})`;
      ctx.lineWidth = r.locked ? 5 : 3;
      ctx.beginPath();
      ctx.arc(r.x, r.y, a.arc.splashRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    if (s.sub === 'circle' || s.sub === 'return') {
      // the flight path ahead, faintly: a Frostpiercer shot can lead it
      ctx.save();
      ctx.setLineDash([8, 18]);
      ctx.strokeStyle = 'rgba(255,220,140,0.22)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let k = 0; k <= 12; k++) {
        const P = circling.path(d, a, s.T + k * 0.07);
        if (k) ctx.lineTo(P.x, P.y - 120); else ctx.moveTo(P.x, P.y - 120);
      }
      ctx.stroke();
      ctx.restore();
    }
    if (s.sub === 'feint' || s.sub === 'mark' || s.sub === 'dive') {
      const real = s.sub !== 'feint';
      floorZone(ctx, d.floorY, s.zone - a.impactRadius, s.zone + a.impactRadius, (real ? 0.7 : 0.25) * pulse, 90);
      ctx.save();
      ctx.strokeStyle = real ? `rgba(255,80,40,${0.6 + 0.4 * pulse})` : `rgba(255,240,210,${0.5 * pulse})`;
      ctx.lineWidth = real ? 6 : 3;
      ctx.beginPath();
      ctx.ellipse(s.zone, d.floorY, a.impactRadius, 24, 0, 0, Math.PI * 2);
      ctx.stroke();
      if (s.sub === 'dive' && s.t >= a.diveTime - a.breakWindow) {
        // the break window: the ring flashes ice-blue (strike now with Frostbrand)
        ctx.strokeStyle = `rgba(150,220,255,${0.9 * pulse})`;
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.ellipse(s.zone, d.floorY, a.impactRadius * 0.8, 20, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }
  },
};

// ------------------------------------------------------------------ bait
// Sunfyre backs off and lowers its head as if spent. It is a lure: come
// within reach and the wings lash out (their own short wind-up, a floor
// warning). Keep your distance and it gives up the pretence.
const bait = {
  custom: true,
  begin(d, a, player) {
    d.baitS = { sub: 'retreat', t: 0, from: d.x, dir: -(Math.sign(player.x - d.x) || d.facing), countered: false };
    d.anim.play('flight');
    d.sfx('wing');
  },
  update(d, a, dt, player) {
    const s = d.baitS;
    s.t += dt;
    if (s.sub === 'retreat') {
      const p = Math.min(1, s.t / 0.6);
      d.x = s.from + s.dir * a.retreat * easeOut(p);
      d.y = d.floorY - Math.sin(Math.PI * p) * 170;
      d.anim.play('flight');
      if (p >= 1) {
        d.y = d.floorY;
        d.facing = player.x > d.x ? 1 : -1;
        d.game.particles.dust(d.x, d.floorY, 16);
        s.sub = 'hold'; s.t = 0;
      }
    } else if (s.sub === 'hold') {
      d.anim.set('stagger', 1);
      d.facing = player.x > d.x ? 1 : -1;
      if (Math.random() < dt * 3) {
        const h = d.frameToWorld(d.anim.data.head);
        d.game.particles.add({ kind: 'dot', sprite: 'gold', x: h.x, y: h.y, vx: 0, vy: -20, max: 0.3, size: 26,
                               size1: 4, layer: 'front' });
      }
      if (d.distTo(player) < a.trigger && player.alive) { s.sub = 'counter'; s.t = 0; d.sfx('screech', { pitch: 0.8 }); }
      else if (s.t >= a.hold) { d.baitS = null; d.setState('recovery'); d.baitRecovery = 0.4; }
    } else if (s.sub === 'counter') {
      const n = d.sprite.animations.wingspread.frames;
      if (s.t < a.counterTelegraph) d.anim.set('wingspread', Math.min(1, Math.floor(s.t / a.counterTelegraph * 2)));
      else {
        d.anim.set('wingspread', Math.min(n - 1, 2 + Math.floor((s.t - a.counterTelegraph) / 0.08)));
        if (!s.countered) {
          s.countered = true;
          d.sfx('wing', { gain: 2 });
          const x0 = d.facing > 0 ? d.x - 120 : d.x - a.reach, box = { x: x0, y: d.floorY - a.height, w: a.reach + 120, h: a.height };
          d.debugBox = box;
          if (overlaps(box, player.hurtbox)) d.game.combat.hitPlayer(a.damage, 'physical', d.x, a.knockback);
          d.game.particles.dust(d.x + d.facing * 200, d.floorY, 24, d.facing);
        }
        if (s.t >= a.counterTelegraph + 0.4) { d.baitS = null; d.baitRecovery = a.recovery; d.setState('recovery'); }
      }
    }
  },
  recoveryTime(d, a) { return d.baitRecovery ?? a.recovery; },
  warning(d, ctx, time, a) {
    const s = d.baitS;
    if (!s || s.sub !== 'counter' || s.t >= a.counterTelegraph) return;
    const x0 = d.facing > 0 ? d.x - 120 : d.x - a.reach;
    floorZone(ctx, d.floorY, x0, x0 + a.reach + 120, 0.6 * pulseOf(time), a.height);
  },
};

// ------------------------------------------------------------------ firestorm
// Balerion's Firestorm: zones of the walkway are marked, then erupt in
// pillars of fire that burn for seconds while he fights on. The safe
// ground moves every time; the marks show where it is.
const firestorm = {
  begin(d, a, player) {
    const A = d.arena, lo = A.start + 120, hi = A.end - 120;
    const xs = [clamp(player.x, lo + a.width / 2, hi - a.width / 2)];
    let guard = 0;
    while (xs.length < a.zones && guard++ < 60) {
      const x = rand(lo + a.width / 2, hi - a.width / 2);
      if (xs.every(o => Math.abs(o - x) > a.width * 1.7)) xs.push(x);
    }
    d.stormZones = xs;
    d.game.combat.text(d.x, d.floorY - 600, a.label || 'FIRESTORM', '#ff7a3a', 52);
  },
  telegraph(d, a, p) {
    defaultTelegraph(d, a, p);
    mouthEmbers(d, p);
  },
  start(d, a) {
    for (const x of d.stormZones) d.game.hazards.add(new FireZone(x, a));
    d.game.camera.shake(0.5);
    d.sfx('roar', { ...(d.def.voice || {}), gain: 0.7 });
  },
  active(d, a) {
    const [f0, f1] = a.activeFrames;
    d.anim.set(a.anim, Math.min(f1, f0 + Math.floor(d.t * 8)));
    return d.t >= a.active;
  },
  warning(d, ctx, time, a) {
    if (d.state !== 'telegraph' || !d.stormZones) return;
    for (const x of d.stormZones) floorZone(ctx, d.floorY, x - a.width / 2, x + a.width / 2, 0.35 * pulseOf(time), 60);
  },
};

export const ATTACK_TYPES = { melee, breath, strafe, fireball, sweep, charge, slam, skyward, dive, grab, debris,
  scorch, gust, mines, tailsweep, pulse, platerain, shadowhunt, combo, lastember, skyreign, rift, guard,
  circling, bait, firestorm };
