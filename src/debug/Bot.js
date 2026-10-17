// A simple scripted player used by the smoke test to fight a whole boss
// encounter with simulated keys. It reacts only to what a human can see:
// the telegraphs, reticles, floor warnings and the moving flame wave. If
// this bot can win with the Steel Sword, the fight is readable and fair.

export class Bot {
  constructor(game, { weapon = null, weapons = null } = {}) {
    this.game = game;
    this.held = new Set();
    this.cool = 0;
    this.attackTimer = 0;
    this.burst = 0;
    this.wants = weapons || (weapon ? [weapon] : []);   // battlefield weapons to fetch (Level 5)
    this.stats = { dodges: 0, jumps: 0, swings: 0, braces: 0 };
  }

  key(code, down) {
    if (down === this.held.has(code)) return;
    if (down) this.held.add(code); else this.held.delete(code);
    window.dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', { code }));
  }

  tap(code) {
    window.dispatchEvent(new KeyboardEvent('keydown', { code }));
    window.dispatchEvent(new KeyboardEvent('keyup', { code }));
  }

  move(dir, hop = true) {
    this.key('KeyD', dir > 0);
    this.key('KeyA', dir < 0);
    // hop over low cover that is in the way (never while setting up a roll)
    const lm = this.game.levels, p = lm && lm.player;
    if (hop && dir && p && p.onGround && lm.level && lm.dragon && (lm.dragon.segments || lm.dragons.length > 1)) {
      const wall = lm.level.solids.find(s => !(s.prop && s.prop.walkThrough) && s.h < 250 &&
                                        (dir > 0 ? s.x - p.x > 0 && s.x - p.x < 70 : p.x - (s.x + s.w) > 0 && p.x - (s.x + s.w) < 70));
      if (wall) this.jump();
    }
  }

  // Away from x, unless tall stone or the arena edge is that way.
  escape(from, need = 300, rolling = false) {
    const lm = this.game.levels, p = lm.player, A = lm.cfg.arena;
    let dir = Math.sign(p.x - from) || 1;
    const blocked = dd => p.x + dd * need < A.start + 60 || p.x + dd * need > A.end - 60 ||
      lm.level.solids.some(s => !(s.prop && s.prop.walkThrough) && (rolling || s.h >= 250) &&
                           (dd > 0 ? s.x > p.x && s.x < p.x + need : s.x + s.w < p.x && s.x + s.w > p.x - need));
    if (blocked(dir)) dir = -dir;
    return dir;
  }

  // The duel with Aegon: keep at sword's length, parry each blow as it lands,
  // never strike into his guard, punish his recoveries.
  duel(dt, p, d, lm) {
    const dist = Math.abs(d.x - p.x), dir = Math.sign(d.x - p.x) || 1;
    if (p.facing !== dir && p.state === 'move' && d.state !== 'telegraph') this.move(dir);
    if (d.state === 'telegraph' || d.state === 'strike') {
      const left = d.state === 'telegraph' ? d.telegraphFor - d.t : 0;
      if (d.attackId === 'dash' && d.state === 'telegraph') {
        this.move(0);
        if (left < 0.12 && dist < 900) this.roll(dir);
        return;
      }
      this.move(0);
      if (left < 0.06 || d.state === 'strike') this.braceNow = dist < 420;
      return;
    }
    if (d.state === 'counter') { this.move(0); this.braceNow = true; return; }
    if (d.state === 'guard') {
      // a set guard: break it with the Glacial Wave if there is ice, else wait out of reach
      if (p.ice && p.ice.energy >= p.weapon.def.special.cost && p.weapon.def.frostbrand && p.specialCd <= 0 && dist < 900) {
        this.move(0);
        this.key('KeyK', true);
        this.waveHold = 0.5;
        return;
      }
      this.move(dist < 330 ? -dir : 0);
      return;
    }
    if (this.waveHold !== undefined) {
      this.waveHold -= dt;
      if (this.waveHold <= 0) { this.key('KeyK', false); this.waveHold = undefined; }
      return;
    }
    const open = d.state === 'recovery' || d.state === 'stagger';
    if (open) {
      if (dist > 150) { this.move(dir); return; }
      this.move(0);
      if (this.attackTimer <= 0) { this.tap('KeyJ'); this.stats.swings++; this.attackTimer = 0.2; }
      return;
    }
    // idle / walking: hold at the edge of his reach
    if (dist > 360) this.move(dir);
    else if (dist < 200) this.move(-dir);
    else this.move(0);
  }

  // Out of a breath's zone: under the head, or past the end of the fire on the sand.
  leaveStream(p, d, st, left, arena) {
    const f = d.facing;
    const near = st.mouth.x - f * 80;
    const far = (f > 0 ? st.g1 : st.g0) + f * 110;
    const inside = (p.x - near) * f > 0 && (far - p.x) * f > 0;
    if (!inside) { this.move(0); return; }
    const farOk = far > arena.start + 80 && far < arena.end - 80;
    const target = !farOk || Math.abs(p.x - near) <= Math.abs(far - p.x) ? near : far;
    const dir = Math.sign(target - p.x) || -f;
    if (left < 0.3 && Math.abs(target - p.x) > 140 && p.canDodge()) this.roll(dir);
    else this.move(dir);
  }

  roll(dir) {
    if (this.cool > 0) return;
    this.move(dir, false);
    this.tap('ShiftLeft');
    this.stats.dodges++;
    this.cool = 0.45;
  }

  jump() {
    if (this.cool > 0) return;
    this.key('Space', true);
    this.jumpHold = 0.3;
    this.stats.jumps++;
    this.cool = 0.4;
  }

  release() {
    for (const code of [...this.held]) this.key(code, false);
  }

  step(dt) {
    this.braceNow = false;
    this.inner(dt);
    if (this.braceNow && !this.held.has('KeyS')) this.stats.braces++;
    this.key('KeyS', this.braceNow);
  }

  // Level 5 (a dragon with armor segments): returns true if it acted.
  vhagar(dt, p, d, a, kind, head, toDragon, arena, awayDir) {
    const lm = this.game.levels;
    const floor = d.floorY;
    const ring = (x, r) => Math.abs(p.x - x) < r + 60;
    // shockwaves first: hop each front as it arrives
    for (const h of this.game.hazards.list) {
      if (h.kind !== 'shock') continue;
      const ahead = (p.x - h.front) * h.dir;
      if (ahead > 0 && ahead < 170 && p.onGround) { this.jump(); return true; }
    }
    // fetch the chosen battlefield weapons while nothing is coming
    const reach = q => q.visible && q.x > p.bounds.min && q.x < p.bounds.max && q.y >= floor - 10;
    const missing = this.wants.find(id => !p.loadout.some(w => w.id === id) &&
                                     lm.pickups.some(q => q.weapon === id && reach(q)));
    if (missing) {
      const pk = lm.pickups.find(q => q.weapon === missing && reach(q));
      const calm = d.state === 'idle' || d.state === 'walk' || d.state === 'recovery' || d.state === 'stagger' ||
                   d.state === 'armorbreak' || Math.abs(d.x - p.x) > 900;
      if (pk && calm) {
        if (Math.abs(pk.x - p.x) > 50) this.move(Math.sign(pk.x - p.x)); else { this.move(0); this.tap('KeyE'); }
        return true;
      }
    }
    // marked ground (mines, falling plates): walk to the nearest clear spot
    const marks = this.game.hazards.list.map(h => h.kind === 'mine' && !h.done ? [h.x, h.spec.radius]
      : h.kind === 'plate' && !h.landed ? [h.tx, h.spec.radius]
      : h.kind === 'spear' && h.stuck < 0 ? [h.tx, h.spec.spearRadius] : null).filter(Boolean);
    const unsafe = x => marks.some(([mx, r]) => Math.abs(x - mx) < r + 45);
    if (marks.length && unsafe(p.x)) {
      let best = null;
      for (let k = 20; k <= 900 && best === null; k += 20) {
        for (const x of [p.x - k, p.x + k]) {
          if (x > arena.start + 70 && x < arena.end - 70 && !unsafe(x)) { best = x; break; }
        }
      }
      this.move(best === null ? 0 : Math.sign(best - p.x));
      return true;
    }
    const tele = d.state === 'telegraph', act = d.state === 'active';
    const left = tele ? d.telegraphDur - d.t : 0;
    // Sky Reign: out of the spear rings, braced under the swoop; bring it down when it hovers
    if (d.inCustom && kind === 'skyreign' && d.reign) {
      const s = d.reign;
      if (s.sub === 'swoopwarn' || s.sub === 'swoop') { this.move(0); this.braceNow = p.onGround; return true; }
      if (s.reticle && Math.abs(p.x - s.reticle.x) < a.spearRadius + 90) {
        this.move(this.escape(s.reticle.x, a.spearRadius + 140));
        return true;
      }
      if (s.sub === 'hover') {
        if (p.weapon.def.special.type === 'ignite' && p.fireCharges > 0 && p.specialCd <= 0 && p.state === 'move') {
          this.move(Math.sign(d.x - p.x));
          this.tap('KeyK');
          return true;
        }
        const hook = p.loadout.findIndex(w => w.def.special.type === 'hook' && w.hooks > 0);
        if (hook >= 0 && Math.abs(d.x - p.x) < 1100) {
          if (hook !== p.slot) this.tap('Digit' + (hook + 1));
          else if (p.specialCd <= 0 && p.state === 'move') { this.move(Math.sign(d.x - p.x)); this.tap('KeyK'); }
          return true;
        }
        const sc = (lm.scorpions || []).filter(q => q.ready).sort((u, v) => Math.abs(u.x - p.x) - Math.abs(v.x - p.x))[0];
        if (sc && Math.abs(sc.x - p.x) < 1400) {
          if (sc.near(p)) { this.move(0); this.tap('KeyE'); } else this.move(Math.sign(sc.x - p.x));
          return true;
        }
      }
      this.move(0);
      return true;
    }
    // Earthsplitter: roll through the front of the rift as it arrives (or jump it, short of stamina)
    for (const h of this.game.hazards.list) {
      if (h.kind !== 'rift' || h.stopped) continue;
      const gap = (p.x - h.front) * h.dir;
      if (!p.onGround || p.y < floor - 20 || gap <= 0) continue;
      if (p.canDodge()) { if (gap < 240) { this.roll(-h.dir); return true; } }
      else if (gap < 290) { this.move(0); this.jump(); return true; }
      if (gap < 500) { this.move(0); return true; }
    }
    // Wing Guard: never strike the raised wing; get clear of the buffet
    if (kind === 'guard' && (tele || act)) {
      const front = (p.x - d.x) * d.facing;
      if (front > -80 && front < a.buffetRange + 120) {
        // room to back out of the buffet? otherwise go behind the dragon (the wing guards only its front)
        const wall = d.facing > 0 ? arena.end - 50 : arena.start + 50;
        const room = Math.abs(wall - p.x);
        if (room > a.buffetRange - front + 80) this.move(d.facing, false);
        else if (d.guardCue && front < 260) this.roll(-d.facing);
        else this.move(-d.facing);
      } else this.move(0);
      return true;
    }
    // step off burning ground when nothing else is coming
    const burn = this.game.hazards.list.find(h => h.kind === 'burn' && h.live && Math.abs(p.x - h.x) < h.w / 2 + 20);
    const busy = ((tele || act) && !['pulse', 'platerain', 'mines', 'debris'].includes(kind)) ||
      (d.inCustom && !(kind === 'strafe' && d.strafe && (!d.strafe.band || Math.abs(d.strafe.band.x - p.x) > 450)));
    if (burn && !busy) {
      let dir = Math.sign(p.x - burn.x) || 1;
      if (p.x + dir * 200 < arena.start + 80 || p.x + dir * 200 > arena.end - 80) dir = -dir;
      this.move(dir);
      return true;
    }
    if ((tele || act) && kind === 'gust') {
      const inFront = (p.x - d.x) * d.facing > -120;
      if (inFront) { this.move(0); this.braceNow = true; } else this.move(0);
      return true;
    }
    if ((tele || act) && kind === 'scorch') {
      // far away: outrun the end of the sweep; close: get behind the dragon
      const ahead = (p.x - d.x) * d.facing;
      const edge = d.facing > 0 ? arena.end - 60 : arena.start + 60;
      if (ahead > 650 && Math.abs(edge - p.x) > 120) { this.move(d.facing); return true; }
      const behind = d.x - d.facing * 380;
      if (Math.abs(p.x - behind) > 70 && (p.x - d.x) * d.facing > -300) {
        if (tele && left < 0.7 && Math.abs(head.x - p.x) < 300) this.roll(Math.sign(behind - p.x));
        else this.move(Math.sign(behind - p.x));
      } else this.move(0);
      return true;
    }
    if ((tele || act) && kind === 'tailsweep') {
      // read the band: already clear (up on a rampart), duck under it, or jump it
      this.move(0);
      const [y0, y1] = d.tailHigh ? a.high : a.low;
      const top = floor + y0, bot = floor + y1;
      const clear = h => p.y - h > bot || p.y < top;
      if (clear(236)) return true;
      if (d.tailHigh && clear(150)) { if (act || left < 0.25) this.braceNow = true; }
      else if (!d.tailHigh) { if (tele && left < 0.2 && p.onGround) this.jump(); }
      else if (tele && left < 0.3) this.roll(Math.sign(p.x - d.x) || 1);
      return true;
    }
    if (kind === 'pulse' && (tele || act)) {
      const dist = Math.abs(p.x - d.x);
      if (tele) {
        if (dist < 260 && left < 0.2) this.jump();
        else this.move(dist < 260 ? 0 : 0);
      } else if (d.ring) {
        const gap = dist - d.ring.r;
        if (gap > 0 && gap < 280 && p.onGround) this.jump();
        this.move(0);
      }
      return true;
    }
    if (kind === 'lastember' && !d.segments) return false;          // Balerion's Black Dread: handled in inner()
    if (kind === 'lastember' && tele && p.weapon.def.special.type === 'ignite' && p.fireCharges > 0 &&
        p.specialCd <= 0 && p.state === 'move') {
      this.move(Math.sign(d.x - p.x));
      this.tap('KeyK');
      return true;
    }
    if (kind === 'lastember' && tele) {
      // break the burning chest if close enough, otherwise run behind stone
      const chest = d.frameToWorld(d.anim.data.chest);
      const near = Math.abs(chest.x - p.x) < 700 && left > 1.2;
      if (near) {
        if (Math.abs(chest.x - p.x) > 110) this.move(Math.sign(chest.x - p.x));
        else {
          this.move(0);
          if (p.facing !== Math.sign(chest.x - p.x)) this.move(Math.sign(chest.x - p.x));
          if (this.attackTimer <= 0) { this.tap('KeyJ'); this.stats.swings++; this.attackTimer = 0.2; }
        }
        return true;
      }
      let best = null;
      for (const sol of lm.level.solids) {
        const side = sol.x + sol.w / 2 > d.x ? 1 : -1;
        const x = side > 0 ? sol.x + sol.w + 60 : sol.x - 60;
        if (best === null || Math.abs(x - p.x) < Math.abs(best - p.x)) best = x;
      }
      if (best !== null && Math.abs(best - p.x) > 30) this.move(Math.sign(best - p.x)); else this.move(0);
      return true;
    }
    if (d.inCustom && kind === 'shadowhunt' && d.shadow) {
      const s = d.shadow;
      if (s.sub === 'hunt' || s.sub === 'lock') {
        const x = s.sub === 'lock' ? s.zone : s.x;
        if (ring(x, d.attack.impactRadius + 40)) this.move(Math.sign(p.x - x) || awayDir); else this.move(0);
      } else if (s.sub === 'dive' && ring(s.zone, d.attack.impactRadius)) this.roll(this.escape(s.zone));
      else {
        this.move(0);
        if (s.sub === 'dive' && d.attack.diveTime - s.t < 0.08 && Math.abs(p.x - s.zone) < d.attack.shockwave.waveRange) this.jump();
      }
      return true;
    }
    return false;
  }

  // Two dragons: watch the one whose blow lands soonest; otherwise fight the nearest.
  focus(lm) {
    const p = lm.player;
    const live = lm.dragons.filter(dr => dr.alive || dr.inCutscene);
    if (live.length < 2) return live[0] || lm.dragon;
    const soon = dr => {
      const a = dr.attack, k = a && a.kind;
      if (dr.state === 'telegraph') return Math.max(0, dr.telegraphDur - dr.t);
      if (dr.state === 'active') {
        if (k !== 'charge') return 0;
        const head = dr.frameToWorld(dr.anim.data.head);
        const gap = (p.x - head.x) * dr.facing;
        return gap > -40 ? gap / (a.speed || 1400) : 8;
      }
      if (dr.inCustom) {
        if (k === 'dive' && dr.diveS) return dr.diveS.sub === 'lock' || dr.diveS.sub === 'dive' ? 0.05 : 1.2;
        return k === 'skyward' ? 4 : 0.5;
      }
      return dr.queued ? 1.5 : 9;
    };
    let best = null, bs = Infinity;
    for (const dr of live) {
      const s = soon(dr) + Math.abs(dr.x - p.x) / 1e5;
      if (s < bs) { bs = s; best = dr; }
    }
    return best;
  }

  inner(dt) {
    const lm = this.game.levels;
    const p = lm.player, d = this.focus(lm);
    this.cool = Math.max(0, this.cool - dt);
    if (d.inCutscene) { this.move(0); return; }
    if (lm.phase === 'explore') {
      // on the way in: pick up any wanted weapon lying on the path
      const pk = (lm.pickups || []).find(q => q.weapon && this.wants.includes(q.weapon) && q.visible &&
                                         !p.loadout.some(w => w.id === q.weapon) && Math.abs(q.x - p.x) < 60);
      if (pk) { this.move(0); this.tap('KeyE'); } else this.move(1);
      return;
    }
    this.attackTimer = Math.max(0, this.attackTimer - dt);
    if (this.jumpHold !== undefined) {
      this.jumpHold -= dt;
      if (this.jumpHold <= 0) { this.key('Space', false); this.jumpHold = undefined; }
    }
    if (!p.alive || !d.alive || lm.cutscene) { this.move(0); return; }
    if (p.state === 'dodge' || p.state === 'hurt') return;
    if (p.state === 'fp') { this.tap('KeyF'); return; }        // the bot fights with the sword
    if (d.duelist) { this.duel(dt, p, d, lm); return; }

    const a = d.attack;
    const kind = a && a.kind;
    const head = d.frameToWorld(d.anim.data.head);
    const toDragon = Math.sign(d.x - p.x) || 1;
    const headDist = Math.abs(head.x - p.x);
    const arena = lm.cfg.arena;
    const awayDir = p.x - arena.start < 400 ? 1 : arena.end - p.x < 400 ? -1 : -toDragon;
    if ((d.segments || d.def.core) && this.vhagar(dt, p, d, a, kind, head, toDragon, arena, awayDir)) return;

    // shockwaves from a slam: hop over the front as it arrives
    for (const h of this.game.hazards.list) {
      if (h.kind !== 'shock') continue;
      const ahead = (p.x - h.front) * h.dir;
      if (ahead > 0 && ahead < 170 && p.onGround) this.jump();
    }
    // Level 7: marked fire zones (Balerion's Firestorm): get out of them
    const zones = this.game.hazards.list.filter(h => h.kind === 'firezone');
    if (zones.length) {
      const inZone = x => zones.some(z => Math.abs(x - z.x) < z.w / 2 + 50);
      if (inZone(p.x)) {
        let best = null;
        for (let k = 30; k <= 1200 && best === null; k += 30) {
          for (const x of [p.x - k, p.x + k]) {
            if (x > arena.start + 80 && x < arena.end - 80 && !inZone(x)) { best = x; break; }
          }
        }
        this.move(best === null ? 0 : Math.sign(best - p.x));
        return;
      }
    }
    // Sunfyre's Sky Dance: leave a red (real) ring; the arcs are dodged by the fireball check below
    if (d.circ && (d.circ.sub === 'mark' || d.circ.sub === 'dive' || d.circ.sub === 'feint')) {
      const z = d.circ.zone, r = d.attack.impactRadius;
      if (Math.abs(p.x - z) < r + 90) {
        const dir = this.escape(z, r + 130, true);
        if (d.circ.sub === 'dive') this.roll(dir); else this.move(dir);
        return;
      }
    }
    if (d.circ && (d.circ.sub === 'circle' || d.circ.sub === 'rise' || d.circ.sub === 'return')) {
      if (d.reticle && Math.abs(p.x - d.reticle.x) < d.attack.arc.splashRadius + 120 && d.reticle.locked) {
        this.move(Math.sign(p.x - d.reticle.x) || awayDir);
        return;
      }
      if (!this.game.hazards.list.some(h => h.target)) { this.move(0); return; }
    }
    // Sunfyre's bait: never walk into it; roll back from the counter
    if (d.baitS) {
      const s = d.baitS, dist = Math.abs(d.x - p.x);
      if (s.sub === 'counter' && dist < d.attack.reach + 160) this.roll(this.escape(d.x, 400, true));
      else if (dist < d.attack.trigger + 140) this.move(this.escape(d.x, 300));
      else this.move(0);
      return;
    }
    // The Black Dread (no armor segments): the ice ward if it is ready, else stone between us
    if (kind === 'lastember' && d.state === 'telegraph') {
      const left = d.telegraphDur - d.t;
      const W = p.ice && p.weapon.def.frostbrand && p.ice.wardCd <= 0 && p.ice.energy >= p.weapon.def.ward.cost;
      if (W || p.warded) {
        this.move(0);
        if (left < 0.35 || p.warded) this.braceNow = true;
        return;
      }
      let best = null;
      for (const sol of lm.level.solids) {
        const side = sol.x + sol.w / 2 > d.x ? 1 : -1;
        const x = side > 0 ? sol.x + sol.w + 70 : sol.x - 70;
        if (best === null || Math.abs(x - p.x) < Math.abs(best - p.x)) best = x;
      }
      if (best !== null && Math.abs(best - p.x) > 30) this.move(Math.sign(best - p.x)); else this.move(0);
      return;
    }
    if (kind === 'lastember' && d.state === 'active' && p.warded) { this.braceNow = true; this.move(0); return; }
    if (d.state === 'frozen') {
      // frozen solid: hit it, at the weak point or the core if there is one
      const at = d.coreOpen ? d.coreAnchor() : head;
      if (Math.abs(at.x - p.x) > 150) this.move(Math.sign(at.x - p.x));
      else if (this.attackTimer <= 0) {
        this.move(0);
        if (p.facing !== Math.sign(at.x - p.x)) this.move(Math.sign(at.x - p.x));
        this.tap('KeyJ'); this.stats.swings++; this.attackTimer = 0.16;
      }
      return;
    }
    // a marked weak point or a glowing / bared core: strike there with Frostbrand
    const mark = d.weakMark ? d.weakAnchor() : (d.coreWin > 0 || d.coreOpen) && d.coreAnchor ? d.coreAnchor() : null;
    if (mark && (d.state === 'recovery' || d.state === 'idle' || d.state === 'stagger') && p.state === 'move') {
      const fb = p.loadout.findIndex(w => w.def.frostbrand);
      if (fb >= 0 && fb !== p.slot) { this.tap('Digit' + (fb + 1)); return; }
      if (Math.abs(mark.x - p.x) > 140) { this.move(Math.sign(mark.x - p.x)); return; }
      this.move(0);
      if (p.facing !== Math.sign(mark.x - p.x)) this.move(Math.sign(mark.x - p.x));
      if (this.attackTimer <= 0) { this.tap('KeyJ'); this.stats.swings++; this.attackTimer = 0.18; }
      return;
    }
    // the other dragon's flame wave (fire and ice): hop it too
    for (const dr of lm.dragons) {
      if (dr === d || !dr.wave || dr.state !== 'active') continue;
      const ahead = (p.x - dr.wave.front) * dr.wave.dir;
      if (ahead > 0 && ahead < 190 && p.onGround) this.jump();
    }
    // scorpions: shoot a flying dragon down, or crack its armor
    const ready = (lm.scorpions || []).filter(s => s.ready)
      .sort((u, v) => Math.abs(u.x - p.x) - Math.abs(v.x - p.x))[0];
    const flying = d.inCustom && kind === 'skyward' && d.sky && d.sky.sub === 'hover';
    const threat = d.reticle && d.reticle.locked && Math.abs(p.x - d.reticle.x) < 220;
    // keep running while a fireball is still on its way to a ring near the warrior
    {
      const fb = this.game.hazards.list.find(h => h.target && h.spec && h.spec.projectileSpeed && !h.dead &&
                                             Math.abs(p.x - h.target.x) < (h.spec.splashRadius || 120) + 100);
      if (fb) { this.move(Math.sign(p.x - fb.target.x) || awayDir); return; }
    }
    if (ready && !threat && (flying || (d.armored && Math.abs(ready.x - p.x) < 700 && d.state !== 'telegraph'))) {
      if (ready.near(p)) { this.move(0); this.tap('KeyE'); } else this.move(Math.sign(ready.x - p.x));
      return;
    }
    if (flying || (d.inCustom && kind === 'skyward')) {
      if (threat) this.move(Math.sign(p.x - d.reticle.x) || awayDir); else this.move(0);
      return;
    }
    // burning debris: step out of any marked circle, toward a clear spot
    for (const h of this.game.hazards.list) {
      if (h.kind !== 'debris' || h.done || Math.abs(p.x - h.x) > h.spec.radius + 50) continue;
      let dir = Math.sign(p.x - h.x) || 1;
      const blocked = x => this.game.hazards.list.some(o => o.kind === 'debris' && !o.done && Math.abs(x - o.x) < o.spec.radius + 40);
      if (blocked(p.x + dir * 280) || p.x + dir * 280 < arena.start + 60 || p.x + dir * 280 > arena.end - 60) dir = -dir;
      this.move(dir);
      return;
    }
    // aerial dive: get out of the locked ring (and hop the landing shockwave)
    if (d.diveS && (d.diveS.sub === 'lock' || d.diveS.sub === 'dive')) {
      const z = d.diveS.zone;
      const inside = Math.abs(p.x - z) < d.attack.impactRadius + (d.diveS.sub === 'dive' ? 30 : 90);
      if (inside) {
        const dir = this.escape(z, d.attack.impactRadius + 100, true);
        if (d.diveS.sub === 'dive') this.roll(dir); else this.move(dir);
      } else {
        this.move(0);
        const sw = d.attack.shockwave;
        const eta = d.attack.diveTime - d.diveS.t;
        if (sw && d.diveS.sub === 'dive' && Math.abs(p.x - z) < sw.waveRange && eta < 0.08) this.jump();
      }
      return;
    }
    if (d.inCustom && kind === 'dive') { this.move(0); return; }
    if (d.state === 'telegraph' && kind === 'grab') {
      // roll in under the jaws just as they snap forward
      if (headDist < 640 && d.telegraphDur - d.t < 0.1) this.roll(-d.facing); else this.move(0);
      return;
    }
    if (d.state === 'telegraph' && kind === 'charge') {
      const gap = (p.x - head.x) * d.facing;
      if (gap > -120 && gap < 420 && d.telegraphDur - d.t < 0.12) this.roll(-d.facing); else this.move(0);
      return;
    }
    // Lightbreaker: light the blade when there is an opening
    const sp = p.weapon.def.special;
    if (sp.type === 'ignite' && p.fireCharges > 0 && p.ignited <= 0 && headDist < 420 &&
        (d.state === 'recovery' || d.state === 'idle') && p.specialCd <= 0) {
      this.tap('KeyK');
      return;
    }
    if (d.state === 'telegraph' && kind === 'slam') {
      const sx = d.x + d.facing * 250 * d.scale;
      this.move(Math.abs(p.x - sx) < d.attack.impactRadius + 160 ? Math.sign(p.x - sx) || awayDir : 0);
      return;
    }
    if (d.state === 'telegraph') {
      const left = d.telegraphDur - d.t;
      if (kind === 'melee') {
        // Vhagar: roll through, under the head; smaller dragons: roll away
        const far = d.segments ? 760 : 560;
        if (headDist < far && left < (d.segments ? 0.12 : 0.14)) this.roll(d.segments ? toDragon : -toDragon);
        else this.move(0);
      } else if (kind === 'breath' && d.attack.groundSpread === 0) {
        // level breath: get behind the dragon, rolling under the head if close
        const behind = d.x - d.facing * 260;
        if (Math.abs(p.x - behind) > 60) {
          if (headDist < 220 && left < 0.6) this.roll(Math.sign(behind - p.x));
          else this.move(Math.sign(behind - p.x));
        } else this.move(0);
      } else if (kind === 'breath' && lm.dragons.length > 1 && d.warnStream) {
        this.leaveStream(p, d, d.warnStream, left, arena);
      } else if (kind === 'breath') {
        // roll through to the dragon's far side just before the breath
        if (left < 0.15 && headDist < 1300) this.roll(toDragon);
        else this.move(0);
      } else if (kind === 'fireball') {
        if (d.reticle && d.reticle.locked) this.move(Math.sign(p.x - d.reticle.x) || awayDir);
        else this.move(0);
      } else if (kind === 'charge') {
        this.move(0);
      } else if (kind === 'sweep') {
        // standing where the flame wave is born: be in the air as it starts
        const ahead = (p.x - d.x) * d.facing;
        if (ahead > 0 && ahead < 480 && left < 0.16 && p.onGround) this.jump();
        this.move(0);
      } else {
        this.move(0);
      }
      return;
    }
    if (d.state === 'active') {
      if (kind === 'sweep' && d.wave) {
        const ahead = (p.x - d.wave.front) * d.wave.dir;
        if (ahead > 0 && ahead < 190 && p.onGround) this.jump();
        this.move(0);
      } else if (kind === 'charge') {
        const gap = (p.x - head.x) * d.facing;
        if (gap > 0 && gap < 330) this.roll(-d.facing);
        else this.move(0);
      } else if (kind === 'fireball') {
        if (d.reticle && d.reticle.locked) this.move(Math.sign(p.x - d.reticle.x) || awayDir);
        else this.move(0);
      } else if (kind === 'breath' && d.attack.groundSpread === 0) {
        const behind = d.x - d.facing * 260;
        if ((p.x - d.x) * d.facing > -120) this.move(Math.sign(behind - p.x)); else this.move(0);
      } else if (kind === 'breath' && lm.dragons.length > 1 && d.stream) {
        this.leaveStream(p, d, d.stream, 0, arena);
      } else if (kind === 'melee') {
        if (headDist < 420) this.roll(-toDragon);
      } else {
        this.move(0);
      }
      return;
    }
    if (d.inCustom && d.strafe) {
      const band = d.strafe.band;
      if (band && p.onGround && Math.abs(band.x + band.w / 2 - p.x) < 260) this.jump();
      this.move(0);
      return;
    }
    // Open window (idle, walk, recovery, stagger, roar): close in and swing.
    const safe = d.state === 'recovery' || d.state === 'stagger' || d.state === 'roar' || d.state === 'armorbreak';
    if (d.segments) {
      const target = d.frameToWorld(d.anim.data.foreleg || d.anim.data.head);
      const exposedHead = d.isExposed('head');
      const aim = exposedHead ? d.frameToWorld(d.anim.data.head) : target;
      // daggers for exposed flesh, the heaviest weapon carried for intact plate
      const bare = exposedHead || d.isExposed('foreleg');
      const pick = bare ? p.loadout.findIndex(w => w.id === 'twin_daggers')
        : p.loadout.findIndex(w => w.def.style === 'heavy');
      if (pick >= 0 && pick !== p.slot && p.state === 'move') { this.tap('Digit' + (pick + 1)); return; }
      const st = p.weapon.style;
      const range = st.heavy ? 110 : 150;
      // never fight from on top of cover: the high tail lash reaches up there
      const slabUnder = (lm.level.platforms || []).some(pl => Math.abs(pl.slab.y - p.y) < 4);
      if (p.onGround && p.y < d.floorY - 20 && !slabUnder) { this.move(Math.sign(aim.x - p.x) || 1); return; }
      if (Math.abs(aim.x - p.x) > range) { this.move(Math.sign(aim.x - p.x)); return; }
      this.move(0);
      const rec = d.state === 'recovery' ? d.recoveryDuration() - d.t : 0;
      const need = st.heavy ? 0.85 : 0.4;
      const stag = d.state === 'stagger' ? (d.staggerFor ?? d.def.staggerTime) - d.t
        : d.state === 'armorbreak' ? (d.def.armorSegments.breakStagger ?? 1.2) - d.t : d.state === 'roar' ? 1.3 - d.t : 0;
      const opening = stag > need || rec > need || (!st.heavy && d.state === 'idle' && d.idleFor - d.t > 0.35);
      if (opening && !d.willChain && !(d.moltenT > 0) && this.attackTimer <= 0 && p.state === 'move') {
        if (p.facing !== Math.sign(aim.x - p.x)) this.move(Math.sign(aim.x - p.x));
        this.tap('KeyJ');
        this.stats.swings++;
        this.attackTimer = st.heavy ? 0.5 : 0.2;
      }
      return;
    }
    if (headDist > 170) {
      this.move(Math.sign(head.x - p.x));
    } else {
      this.move(0);
      if ((safe || d.state === 'idle' || d.state === 'walk') && this.attackTimer <= 0) {
        if (p.facing !== Math.sign(head.x - p.x)) this.move(Math.sign(head.x - p.x));
        this.tap('KeyJ');
        this.stats.swings++;
        this.attackTimer = 0.17;
        // a dragon that punishes mashing gets two hits, then a pause
        if (d.def.punish && ++this.burst >= 2) { this.burst = 0; this.attackTimer = 0.95; }
        if (p.specialCd <= 0 && safe) this.tap('KeyK');
      }
    }
  }
}
