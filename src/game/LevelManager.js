import { DEBUG, VIEW } from '../data/config.js';
import { ENEMIES } from '../data/enemies.js';
import { getLevel, LEVELS } from '../data/levels.js';
import { Snow } from '../core/Particles.js';
import { circleRect, damp } from '../core/math.js';
import { Dragon } from './Dragon.js';
import { Duelist } from './Duelist.js';
import { Ending } from './Ending.js';
import { Level } from './Level.js';
import { Saga } from './Saga.js';
import { Pickup } from './Pickups.js';
import { bossKey } from './ProgressionManager.js';
import { Player } from './Player.js';
import { Scorpion } from './Scorpion.js';
import { Weapon } from './Weapon.js';

// Builds a playable level from its config and runs the flow:
// explore -> arena (camera lock + boss intro) -> won / lost.
// Also runs the level-wide presentation: dialogue lines (Enter skips),
// phase banners, the arena gate, weapon caches, firelight and heat cracks.

// The art a level needs beyond the shared set (manifest group keys, see
// core/AssetLoader.js): its scenery and every sprite its enemies use (a
// second life, a duelist). It loads when the level is first played.
export function levelArt(cfg, manifest) {
  const out = new Set();
  for (const b of [cfg.background, ...(cfg.stages || []).map(st => st.background)]) if (b) out.add('bg:' + b);
  const enemies = [cfg.boss && cfg.boss.enemy, ...(cfg.bosses || []).map(b => b.enemy),
                   ...(cfg.stages || []).flatMap(st => [st.boss && st.boss.enemy, st.duel])].filter(Boolean);
  const scan = v => {
    if (typeof v === 'string') { if (manifest[v] && manifest[v].sheet_pattern) out.add(v); }
    else if (v && typeof v === 'object') for (const x of Object.values(v)) scan(x);
  };
  for (const e of enemies) scan(ENEMIES[e]);
  out.delete('warrior');                                      // always loaded
  return [...out];
}

// Every group that waits for its level (the rest loads at boot).
export function deferredArt(manifest) {
  return [...new Set(LEVELS.flatMap(cfg => levelArt(cfg, manifest)))];
}

export class LevelManager {
  constructor(game) {
    this.game = game;
    this.level = null;
  }

  get active() { return !!this.level; }

  start(id) {
    const levelCfg = getLevel(id);
    if (!levelCfg || levelCfg.status !== 'playable') throw new Error(`Level ${id} is not playable yet`);
    const g = this.game;
    this.levelCfg = levelCfg;
    // a level of several encounters (Level 7) runs through Saga, one stage at a time
    this.saga = levelCfg.stages ? new Saga(this, levelCfg) : null;
    const cfg = this.cfg = this.saga ? this.saga.stageConfig() : levelCfg;
    this.level = new Level(levelCfg, g.assets);
    const stats = g.progression.getStats();
    const spawnX = this.saga ? this.saga.spawnX() : cfg.spawnX;
    this.player = new Player(g, stats, new Weapon(g.progression.data.equipped), spawnX, this.level.floorY,
                             cfg.rules || {});
    this.player.bounds = { min: 60, max: cfg.length - 60 };
    if (this.saga) this.saga.loadout(this.player);
    this.setupBosses(cfg);
    this.scorpions = (cfg.scorpions || []).map(s => new Scorpion(g, s, this.level.floorY));
    g.camera.setBounds(0, cfg.length);
    g.camera.snapTo(this.player.x);
    g.camera.trauma = 0;
    g.camera.bias = 0;
    g.camera.lookAhead = 0;
    g.particles.clear();
    g.hazards.clear();
    g.combat.reset();
    g.hitstop = 0;
    g.slowmo = 0;
    this.snow = new Snow(cfg.weather?.snow ?? 0, VIEW.width, VIEW.height, cfg.weather?.wind ?? -100);
    this.phase = 'explore';
    this.time = 0;
    this.realTime = 0;
    this.result = null;
    this.endTimer = 0;
    this.reported = false;
    this.flyby = null;
    this.flybyDone = !cfg.flyby;
    this.cutscene = false;
    this.bossBar = 0;
    this.bossIntroTime = -1;
    this.flashT = 0;
    this.boltIn = cfg.storm ? 3 : Infinity;
    this.pickups = (cfg.pickups || []).map(pc => new Pickup(g, pc, this.level));
    this.dialogue = { queue: [], cur: null, t: 0 };
    this.banner = null;
    this.heat = 0;
    this.dark = 0;
    this.gateT = -1;
    this.aemond = null;
    this.cracks = cfg.heatCracks ? makeCracks(cfg.arena, this.level.floorY) : null;
    const bg = g.assets.manifest.backgrounds[cfg.background];
    this.gateImg = cfg.arena.gate ? g.assets.image(bg.props[cfg.arena.gate].file) : null;
    this.ending = null;
    this.deathCued = false;
    this.deathClip = null;
    this.rewardPop = null;
    this.storming = 0;
    this.stageDone = false;
    this.audioNotice = null;
    if (g.audio) {
      g.audio.onReport = msg => { this.audioNotice = { msg, t: 0 }; };
      g.audio.music((cfg.music && cfg.music.explore) || 'explore');
    }
  }

  // The boss (or bosses) of the level, or of the current stage of a saga.
  setupBosses(cfg) {
    const g = this.game;
    // one boss (`boss`) or several fighting together (`bosses`, e.g. the Dragonpit)
    const bosses = cfg.bosses || [cfg.boss];
    this.bossCfg = bosses[0];
    this.dragons = bosses.map(b => {
      const enemy = ENEMIES[b.enemy];
      if (!enemy) throw new Error(`Level ${cfg.id}: enemy "${b.enemy}" is not defined in data/enemies.js`);
      const opts = { x: b.spawnX, floorY: this.level.floorY, hpMul: b.hpMul ?? 1, arena: cfg.arena };
      return enemy.duelist ? new Duelist(g, enemy, opts) : new Dragon(g, enemy, opts);
    });
    if (this.dragons.length === 2) {
      this.dragons[0].partner = this.dragons[1];
      this.dragons[1].partner = this.dragons[0];
    }
    this.dragon = this.dragons[0];
    this.barOrder = this.dragons.slice().sort((a, b) => a.x - b.x);   // HUD bars match where they land
    this.damageMul = this.bossCfg.damageMul ?? 1;
    const p = this.player;
    const st = cfg.stage;
    if (p && p.fp) p.fp.disabled = !!(st && st.noFrostpiercer);
    if (p) p.duelBrace = !!(st && st.duel);
  }

  // A saga moves on: the next stage's boss waits in its arena; the way is open.
  beginStage(cfg) {
    const g = this.game;
    this.cfg = cfg;
    this.setupBosses(cfg);
    this.phase = 'explore';
    this.stageDone = false;
    this.bossIntroTime = -1;
    this.bossBar = 0;
    this.gateT = -1;
    this.flyby = null;
    this.flybyDone = true;
    this.storming = 0;
    g.hazards.clear();
    g.camera.setBounds(0, cfg.length);
    this.player.bounds = { min: 60, max: cfg.length - 60 };
    const bg = g.assets.manifest.backgrounds[cfg.background];
    this.gateImg = cfg.arena.gate ? g.assets.image(bg.props[cfg.arena.gate].file) : null;
  }

  startStageMusic() {
    const a = this.game.audio, clips = this.game.clips;
    const st = this.cfg.stage;
    // the duel with Aegon: the player's own theme, if there is one, instead of the score
    if (st && st.duel && clips && clips.get('aegon_theme')) {
      if (a) a.music(null);
      clips.play('aegon_theme', { loop: true });
      return;
    }
    if (!a) return;
    a.music((st && st.music) || (this.cfg.music && this.cfg.music.boss) || 'battle');
  }

  startEnding() {
    if (this.game.clips) this.game.clips.stop('aegon_theme');
    this.game.hazards.clear();
    this.ending = new Ending(this);
  }

  // Level 7 is complete only after Aegon and the ceremony.
  completeSaga() {
    const g = this.game, p = this.player;
    this.phase = 'won';
    this.endTimer = 0;
    this.result = g.progression.completeSaga(this.levelCfg, {
      time: this.time, damageTaken: p.damageTaken, weapons: [...p.weaponsUsed],
    });
  }

  // The dragon a blast is closest to (a lone boss is always it).
  nearestDragon(x, y = null) {
    let best = this.dragon, bd = Infinity;
    for (const d of this.dragons) {
      if (!d.active || (!d.alive && !d.inCutscene)) continue;
      const dd = Math.abs(d.x - x) + (y === null ? 0 : Math.abs(d.y - 200 - y) * 0.3);
      if (dd < bd) { bd = dd; best = d; }
    }
    return best;
  }

  // The dragon a projectile touches (a circle, or a rect when r is omitted), else the nearest.
  dragonTouching(x, y, r) {
    if (this.dragons.length < 2) return this.dragon;
    const rect = typeof x === 'object' ? x : null;
    for (const d of this.dragons) {
      if (!d.active || !d.alive || d.state === 'dormant') continue;
      for (const b of d.hurtboxes()) {
        const hit = rect ? rect.x < b.rect.x + b.rect.w && rect.x + rect.w > b.rect.x &&
                           rect.y < b.rect.y + b.rect.h && rect.y + rect.h > b.rect.y
          : circleRect(x, y, r, b.rect);
        if (hit) return d;
      }
    }
    return rect ? this.nearestDragon(rect.x + rect.w / 2) : this.nearestDragon(x, y);
  }

  say(lines) {
    for (const l of lines) this.dialogue.queue.push(l);
  }

  // Phase changes, armor breaks and the deaths drive banners and dialogue.
  handleEvents(d) {
    for (const e of d.events) {
      if (e.type === 'phase') {
        const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
        const first = d.def.firstLife ? d.def.firstLife.phases.length : 0;
        const n = e.life === 2 ? first + e.phase + 1 : e.phase + 1;
        this.banner = { title: `PHASE ${roman[n - 1] || n}`, sub: e.name || '', t: 0 };
        if (e.line) this.say([{ who: e.who || 'Aemond', text: e.line }]);
      } else if (e.type === 'firstdeath') {
        this.banner = { title: 'VHAGAR FALLS', sub: 'the ground shakes as the old dragon collapses', t: 0, long: true };
        const wind = this.cfg.rules && this.cfg.rules.secondWind;
        const p = this.player;
        if (wind && p.alive) {                // earned: the warrior catches his breath
          const before = p.hp;
          p.heal(p.maxHp * wind);
          p.stamina = p.maxStamina;
          this.game.combat.text(p.x, p.y - 300, `SECOND WIND  +${Math.round(p.hp - before)}`, '#e8f4ff', 36);
        }
        this.say([{ who: 'Aemond', text: 'No... no! Up, Vhagar. RISE!' }]);
      } else if (e.type === 'secondlife') {
        const n = (d.def.firstLife ? d.def.firstLife.phases.length : 0) + 1;
        this.banner = { title: 'THE DREAD AWAKENS', sub: `Second life  ·  Phase ${['I', 'II', 'III', 'IV', 'V'][n - 1] || n}`, t: 0, long: true };
      } else if (e.type === 'pair') {
        const names = { pincer: 'PINCER CHARGE', twin_bite: 'TWIN BITE', dance: 'DRAGON DANCE', fire_ice: 'FIRE AND ICE' };
        this.banner = { title: names[e.id] || '', sub: '', t: 0, dur: 1.4 };
      } else if (e.type === 'enrage') {
        this.banner = { title: `${d.def.title} RAGES`, sub: 'for its fallen kin', t: 0 };
      } else if (e.type === 'skyreign') {
        this.say([{ who: 'Aemond', text: 'Up here, northman. Come and reach me.' }]);
      } else if (e.type === 'downed') {
        this.say([{ who: 'Aemond', text: 'Get up! Get UP!' }]);
      } else if (e.type === 'core') {
        this.banner = { title: 'THE CORE IS BARED', sub: 'strike it: only this blow can end him', t: 0 };
      } else if (e.type === 'aegonDown') {
        this.banner = { title: 'AEGON FALLS', sub: 'the Conqueror kneels', t: 0, long: true };
        if (this.cfg.victory) this.say(this.cfg.victory);
      } else if (e.type === 'lastember') {
        this.banner = { title: 'THE LAST EMBER', sub: 'break the burning chest, or get behind stone', t: 0 };
      }
    }
    d.events.length = 0;
  }

  update(dt, realDt) {
    const g = this.game, p = this.player;
    this.time += dt;
    this.realTime += realDt;
    if (this.saga) this.saga.update(dt, realDt);
    if (this.ending) this.ending.update(realDt);
    if (this.rewardPop && (this.rewardPop.t += realDt) > 4.5) this.rewardPop = null;
    if (this.audioNotice && (this.audioNotice.t += realDt) > 8) this.audioNotice = null;
    const cfg = this.cfg, d = this.dragon;

    if (!this.flybyDone && p.x > cfg.flyby.triggerX) {
      this.flybyDone = true;
      this.flyby = { t: 0 };
    }
    if (this.flyby && (this.flyby.t += dt) > 7) this.flyby = null;

    const sagaReady = !this.saga || this.saga.state === 'travel';
    if (this.phase === 'explore' && sagaReady && p.x >= cfg.arena.triggerX) {
      this.phase = 'arena';
      g.camera.setBounds(cfg.arena.start, cfg.arena.end);
      p.bounds = { min: cfg.arena.start + 50, max: cfg.arena.end - 50 };
      for (const dr of this.dragons) dr.startIntro();
      this.flyby = null;
      this.flybyDone = true;
      this.bossIntroTime = this.realTime;
      if (this.gateImg) this.gateT = 0;
      if (cfg.intro) this.say(cfg.intro);
      if (!this.saga) this.startStageMusic();
      if (g.audio && this.gateImg) g.audio.play('gate', { x: cfg.arena.start, delay: 0.4 });
    }

    this.cutscene = this.dragons.some(dr => dr.state === 'intro' || (dr.state === 'roar' && dr.introRoar) || dr.inCutscene);
    // Enter skips the current line, or the whole resurrection
    if (g.input.buffered('skip', 0.2)) {
      g.input.consume('skip');
      if (this.deathClip) { g.clips.stop('player_death'); this.deathClip = null; }
      else if (this.ending) this.ending.skip();
      else if (this.saga && this.saga.skipCard()) { /* the card closes */ }
      else if (d.inCutscene) { d.skipResurrection(); this.dialogue.cur = null; this.dialogue.queue.length = 0; }
      else if (this.dialogue.cur) this.dialogue.cur = null;
    }
    this.updateDialogue(realDt);
    if (this.banner && (this.banner.t += realDt) > (this.banner.dur || (this.banner.long ? 4 : 2.8))) this.banner = null;
    if (this.gateT >= 0) {
      const before = this.gateT;
      this.gateT += dt;
      if (before < 0.45 && this.gateT >= 0.45) {            // the portcullis slams down
        g.camera.shake(0.5);
        g.particles.dust(cfg.arena.start, this.level.floorY, 20);
      }
    }
    const sagaLock = this.saga && (['intro', 'defeat', 'ceremony', 'complete'].includes(this.saga.state) ||
                                    (this.saga.state === 'grant' && (this.saga.card || this.saga.cards.length)));
    p.controlsLocked = this.cutscene || this.phase === 'won' || !!sagaLock;
    p.update(dt, g.input, this.level);
    for (const dr of this.dragons) {
      dr.update(dt, p);
      this.handleEvents(dr);
    }
    for (const pk of this.pickups) pk.update(dt, g.input, this);
    for (const s of this.scorpions) s.update(dt, g.input, this);
    g.hazards.update(dt, g);
    g.combat.update(dt);
    this.ambient(dt);
    if (this.cfg.arena.barrier && this.phase !== 'explore') {        // wall of fire seals the way back
      for (let i = 0; i < 3; i++) {
        g.particles.fire(cfg.arena.start + Math.random() * 40, this.level.floorY - Math.random() * 30,
                         { x: 0, y: -1 }, 320, 1, { spread: 0.5, sizeMul: 1.1, collide: false });
      }
    }
    if (cfg.storm) {
      this.boltIn -= realDt;
      this.flashT = Math.max(0, this.flashT - realDt * 3);
      if (this.boltIn <= 0) {
        const [a, b] = cfg.storm.lightning;
        this.boltIn = a + Math.random() * (b - a);
        this.flashT = 1;
        g.camera.shake(0.12);
      }
    }
    g.particles.update(dt, this.level);
    this.snow.update(realDt, g.camera.x);
    // In a wide arena, lean the camera toward the dragon so both stay framed.
    let bias = 0;
    const cb = cfg.camera || { bias: 0.32, max: 480 };
    if (this.dragons.length > 1 && this.phase === 'arena') {
      // two dragons: frame the warrior and the middle of the pair
      const live = this.dragons.filter(dr => dr.alive);
      if (live.length) {
        const mx = live.reduce((s, dr) => s + dr.x, 0) / live.length;
        bias = Math.max(-cb.max, Math.min(cb.max, (mx - p.x) * cb.bias));
      }
    } else if (this.phase === 'arena' && ((d.alive && d.hittable) || (cfg.camera && (d.state === 'intro' || d.inCutscene)))) {
      bias = Math.max(-cb.max, Math.min(cb.max, (d.x - p.x) * cb.bias));
    }
    g.camera.update(dt, p, bias);
    const anyUp = this.dragons.some(dr => dr.active && (dr.alive || dr.inCutscene) && !dr.defeated);
    this.bossBar = damp(this.bossBar, anyUp ? 1 : 0, 4, realDt);
    this.updateHeat(realDt, d);
    this.updateAemond(dt, d);

    if (this.saga) {
      // a saga stage: the dragon's death animation, or Aegon's last breath, ends it
      const down = this.saga.last ? this.dragons.every(dr => !dr.alive) : this.dragons.every(dr => dr.defeated);
      if (this.phase === 'arena' && down && !this.stageDone && p.alive) {
        this.stageDone = true;
        this.saga.stageWon();
      }
    } else if (this.phase === 'arena' && this.dragons.every(dr => dr.defeated)) {
      this.phase = 'won';
      this.endTimer = 0;
      this.result = g.progression.completeLevel(cfg, { time: this.time, damageTaken: p.damageTaken,
                                                      lifeDamage: d.lifeDamage.slice(), lives: d.life });
      if (g.audio) { g.audio.play('reward'); g.audio.music('explore'); }
    }
    // the warrior falls: the player's death clip if there is one (a video takes the screen), else the bell
    if (!p.alive && !this.deathCued) {
      this.deathCued = true;
      const c = g.clips && g.clips.get('player_death');
      if (g.cue('player_death', { restart: true }) === 'clip' && c.type === 'video') this.deathClip = { c, t: 0 };
    }
    if (this.deathClip) {
      this.deathClip.t += realDt;
      if (this.deathClip.t >= this.deathClip.c.duration) this.deathClip = null;
    }
    if ((this.phase === 'explore' || this.phase === 'arena') && !p.alive && p.anim.finished) {
      this.phase = 'lost';
      this.endTimer = 0;
      g.progression.recordDeath(this.levelCfg.id, bossKey(this.cfg), this.saga ? this.saga.runTime : this.time);
      if (this.saga) this.saga.onDeath();
    }
    if (this.phase === 'won' || this.phase === 'lost') {
      this.endTimer += realDt;
      const delay = this.phase === 'won' ? (this.saga ? 0.2 : cfg.victoryDelay ?? 1.4) : 1.4;
      if (this.endTimer > delay && !this.reported && !this.deathClip) {
        this.reported = true;
        g.onLevelEnd(this.phase, this.result);
      }
    }
  }

  updateDialogue(dt) {
    const D = this.dialogue;
    if (!D.cur && D.queue.length) { D.cur = D.queue.shift(); D.t = 0; }
    if (D.cur) {
      D.t += dt;
      if (D.t > Math.max(2.4, D.cur.text.length * 0.06)) D.cur = null;
    }
  }

  // Vhagar's heat rises under the ice: the floor cracks glow with it.
  updateHeat(dt, d) {
    let target = 0.12;
    if (d.active && d.alive) {
      target = d.life === 2 ? 0.55 : 0.12 + 0.12 * d.phase;
      const k = d.attack && d.attack.kind;
      if ((d.state === 'telegraph' || d.state === 'active') && ['scorch', 'pulse', 'mines', 'lastember', 'breath'].includes(k)) {
        target += 0.35;
      }
      if (k === 'lastember' && d.state === 'telegraph') target = 1;
    }
    if (d.state === 'resurrect') target = Math.min(1, d.t / 2.5);
    if (d.state === 'firstdeath') target = 0;
    this.heat = damp(this.heat, target, 2.5, dt);
    const darkT = d.attack && d.attack.kind === 'lastember' && (d.state === 'telegraph' || d.state === 'active') ? 0.6 : 0;
    this.dark = damp(this.dark, darkT, 2, dt);
  }

  // Final death: Aemond is thrown from the saddle, lands and kneels.
  updateAemond(dt, d) {
    if (!this.aemond && d.state === 'death' && d.life === 2 && this.game.assets.manifest.aemond &&
        d.anim.frame >= 3) {
      const at = d.anim.def.per_frame[2].rider ? d.frameToWorld(d.anim.def.per_frame[2].rider) : { x: d.x, y: d.y - 400 };
      this.aemond = { x: at.x, y: at.y, vx: -d.facing * 260, vy: -700, frame: 0, t: 0, landed: false,
                      facing: d.facing > 0 ? -1 : 1 };
    }
    const A = this.aemond;
    if (!A) return;
    A.t += dt;
    if (!A.landed) {
      A.vy += 2600 * dt;
      A.x += A.vx * dt;
      A.y += A.vy * dt;
      if (A.y >= this.level.floorY) {
        A.y = this.level.floorY;
        A.landed = true;
        A.t = 0;
        A.frame = 1;
        this.game.camera.shake(0.3);
        this.game.particles.dust(A.x, A.y, 14);
        if (this.cfg.victory) this.say(this.cfg.victory);
      }
    } else {
      A.frame = A.t < 0.6 ? 1 : A.t < 3 ? 2 : 3;
    }
  }

  // Embers rising from the braziers baked into the battlement layer.
  ambient(dt) {
    const cam = this.game.camera;
    for (const dc of this.level.decor) {
      if (dc.fire && dc.cx > cam.x - 100 && dc.cx < cam.right + 100 && Math.random() < dt * 14) {
        this.game.particles.embers(dc.cx, this.level.floorY + 4 - dc.fire, 1, 26);
      }
    }
    const a = this.cfg.ambientEmbers;
    if (!a) return;
    for (let base = Math.floor(cam.x / a.period) * a.period; base < cam.right; base += a.period) {
      for (const x of a.xs) {
        const wx = base + x;
        if (wx > cam.x - 100 && wx < cam.right + 100 && Math.random() < dt * 12) {
          this.game.particles.embers(wx, a.y, 1, 26);
        }
      }
    }
  }

  drawFlyby(ctx) {
    const f = this.flyby;
    if (!f) return;
    const m = this.game.assets.manifest[this.dragon.def.sprite];
    const img = this.game.assets.image(m.sheet_pattern.replace('{anim}', 'flight'));
    const t = f.t / 7;
    const x = VIEW.width + 400 - t * (VIEW.width + 1100);
    const y = 300 + Math.sin(f.t * 1.3) * 30;
    const frame = Math.floor(f.t * 10) % m.animations.flight.frames;
    this.game.renderer.drawFrame(img, frame, m.frame_size[0], m.frame_size[1], x, y, m.pivot, 0.32 / (m.res || 1), false,
                                 { tint: 'rgba(40,52,74,0.62)', alpha: 0.9 });
  }

  draw(renderer) {
    const g = this.game, ctx = renderer.ctx, cam = g.camera;
    if (this.ending && this.ending.full) {
      this.ending.drawFull(ctx);
      return;
    }
    this.level.drawBackground(renderer, cam, () => {
      this.drawFlyby(ctx);
      if (this.ending) this.ending.drawFar(ctx);
    });
    ctx.save();
    ctx.translate(-Math.round(cam.x - cam.shakeX), Math.round(cam.shakeY));
    if (this.cracks) this.drawCracks(ctx);
    this.level.drawProps(ctx);
    for (const pk of this.pickups) pk.draw(ctx);
    for (const s of this.scorpions) s.draw(ctx, this.player);
    for (const dr of this.dragons) dr.drawWarnings(ctx, this.realTime);
    g.particles.draw(ctx, 'back');
    for (const dr of this.dragons) dr.draw(renderer, this.realTime);
    if (this.aemond) this.drawAemond(renderer);
    g.hazards.draw(ctx, g);
    this.player.draw(renderer);
    this.drawGate(ctx);
    g.particles.draw(ctx, 'front');
    g.combat.draw(ctx);
    for (const pk of this.pickups) pk.drawPrompt(ctx);
    if (DEBUG) this.drawDebug(ctx);
    ctx.restore();
    if (this.dark > 0.01) {
      ctx.fillStyle = `rgba(2,3,10,${this.dark})`;
      ctx.fillRect(0, 0, VIEW.width, VIEW.height);
      const T = this.dragon.behaviour;
      if (T && T.shelters) {
        ctx.save();
        ctx.translate(-Math.round(cam.x - cam.shakeX), Math.round(cam.shakeY));
        T.shelters(this.dragon, ctx, this.realTime);
        ctx.restore();
      }
    }
    this.drawLights(ctx);
    this.snow.draw(ctx);
    this.grade(ctx);
    if (this.flashT > 0) {
      ctx.fillStyle = `rgba(200,255,225,${0.42 * this.flashT})`;
      ctx.fillRect(0, 0, VIEW.width, VIEW.height);
    }
    if (this.storming > 0 || (this.cfg.stage && this.cfg.stage.id === 'balerion')) {
      ctx.fillStyle = 'rgba(4,4,10,0.22)';                    // Balerion's storm: darker
      ctx.fillRect(0, 0, VIEW.width, VIEW.height);
    }
    renderer.vignette(0.55);
    if (this.ending) { this.ending.drawOverlay(ctx); return; }
    g.hud.draw(ctx, this);
    if (this.deathClip) drawVideo(ctx, this.deathClip.c.el, this.deathClip.t, this.deathClip.c.duration);
  }

  // Warm light pools around fires and a low drifting mist, in screen space.
  drawLights(ctx) {
    const cam = this.game.camera;
    const sources = [];
    const a = this.cfg.ambientEmbers;
    if (a) {
      for (let base = Math.floor(cam.x / a.period) * a.period; base < cam.right; base += a.period) {
        for (const x of a.xs) sources.push([base + x, a.y, 300]);
      }
    }
    if (this.cfg.arena.barrier && this.phase !== 'explore') sources.push([this.cfg.arena.start, this.level.floorY - 80, 420]);
    if (this.player.ignited > 0) sources.push([this.player.x, this.player.y - 140, 340]);
    for (const dc of this.level.decor) if (dc.fire) sources.push([dc.cx, this.level.floorY + 4 - dc.fire + 30, 360]);
    for (const h of this.game.hazards.list) {
      if (h.light) sources.push([h.x, (h.kind === 'plate' ? h.y : this.level.floorY - 40), h.light]);
    }
    for (const d of this.dragons) {
      if (d.stream) {                  // dragon fire lights the ice and stone around it
        sources.push([d.stream.mouth.x, d.stream.mouth.y, 420]);
        if (d.stream.impact) sources.push([d.stream.impact.x, d.stream.impact.y - 30, 520]);
      }
      if (d.active && d.alive && d.anim.data && d.anim.data.chest && (d.life === 2 || d.state === 'telegraph')) {
        const c = d.frameToWorld(d.anim.data.chest);
        sources.push([c.x, c.y, d.state === 'telegraph' ? 520 : 360]);
      }
    }
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const [x, y, r] of sources) {
      const sx = x - cam.x + cam.shakeX, sy = y + cam.shakeY;
      if (sx < -r || sx > VIEW.width + r) continue;
      const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, r);
      g.addColorStop(0, 'rgba(255,150,60,0.22)');
      g.addColorStop(1, 'rgba(255,90,20,0)');
      ctx.fillStyle = g;
      ctx.fillRect(sx - r, sy - r, r * 2, r * 2);
    }
    ctx.restore();
    const t = this.realTime;
    for (let k = 0; k < 2; k++) {
      const y = 860 + k * 70 + Math.sin(t * 0.4 + k) * 10;
      const g = ctx.createLinearGradient(0, y - 60, 0, y + 60);
      g.addColorStop(0, 'rgba(220,235,245,0)');
      g.addColorStop(0.5, `rgba(220,235,245,${0.07 + 0.03 * k})`);
      g.addColorStop(1, 'rgba(220,235,245,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, y - 60, VIEW.width, 120);
    }
  }

  // Per-level colour grade: icy blues on the Wall, fire and night at the keep.
  grade(ctx) {
    const G = { night: ['rgba(30,56,140,0.42)', 'rgba(255,120,50,0.2)'],
                cold: ['rgba(90,140,200,0.30)', 'rgba(20,40,80,0.22)'],
                ice: ['rgba(130,190,250,0.36)', 'rgba(30,70,130,0.30)'],
                storm: ['rgba(40,120,90,0.34)', 'rgba(255,110,40,0.22)'],
                warm: ['rgba(40,30,90,0.30)', 'rgba(255,120,40,0.26)'] }[this.cfg.grade];
    if (!G) return;
    const g = ctx.createLinearGradient(0, 0, 0, VIEW.height);
    g.addColorStop(0, G[0]);
    g.addColorStop(1, G[1]);
    ctx.save();
    ctx.globalCompositeOperation = 'soft-light';
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
    ctx.restore();
  }

  // The portcullis drops behind the warrior as the fight begins.
  drawGate(ctx) {
    const img = this.gateImg;
    if (!img) return;
    const k = this.gateT < 0 ? 0 : Math.min(1, (this.gateT / 0.45) ** 2);
    const x = this.cfg.arena.start - img.width / 2 - 10;
    const y = this.level.floorY + 4 - img.height - (1 - k) * (img.height - 60);
    ctx.drawImage(img, Math.round(x), Math.round(y));
    if (this.saga && !this.saga.last) {
      const open = this.saga.state === 'victory' ? Math.min(1, this.saga.t / 1.2) : this.stageDone ? 1 : 0;
      const ex = this.cfg.arena.end - img.width / 2 + 10;
      const ey = this.level.floorY + 4 - img.height - open * (img.height - 60);
      ctx.drawImage(img, Math.round(ex), Math.round(ey));
    }
  }

  drawCracks(ctx) {
    const h = this.heat;
    if (h < 0.03) return;
    const d = this.dragon;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    for (const cr of this.cracks) {
      const near = d.active ? Math.max(0, 1 - Math.abs(cr.cx - d.x) / 1400) : 0;
      const k = Math.min(1, h * (0.55 + 0.45 * near) * (0.8 + 0.2 * Math.sin(this.realTime * 2 + cr.ph)));
      ctx.strokeStyle = `rgba(255,110,30,${0.35 * k})`;
      ctx.lineWidth = 9;
      ctx.beginPath();
      cr.pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.stroke();
      ctx.strokeStyle = `rgba(255,214,140,${0.85 * k})`;
      ctx.lineWidth = 2.4;
      ctx.stroke();
    }
    ctx.restore();
  }

  drawAemond(renderer) {
    const m = this.game.assets.manifest.aemond;
    const A = this.aemond;
    const img = this.game.assets.image(m.sheet);
    renderer.drawFrame(img, A.frame, m.frame_size[0], m.frame_size[1], A.x, A.y, m.pivot, 1.25, A.facing < 0,
                       { alpha: Math.min(1, A.t * 4 + (A.landed ? 1 : 0)) });
  }

  drawDebug(ctx) {
    const p = this.player;
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#7fd17f';
    const hb = p.hurtbox;
    ctx.strokeRect(hb.x, hb.y, hb.w, hb.h);
    if (p.lastSwingBox) {
      ctx.strokeStyle = '#ffd36b';
      const s = p.lastSwingBox;
      ctx.strokeRect(s.x, s.y, s.w, s.h);
    }
    ctx.strokeStyle = '#c38bff';
    for (const s of this.level.solids) ctx.strokeRect(s.x, s.y, s.w, s.h);
  }
}


// A player-supplied video, full screen and letterboxed, fading in and out.
function drawVideo(ctx, el, t, dur) {
  ctx.save();
  ctx.fillStyle = '#000';
  ctx.globalAlpha = Math.min(1, t / 0.3);
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  const w = el.videoWidth || 16, h = el.videoHeight || 9;
  const s = Math.min(VIEW.width / w, VIEW.height / h);
  ctx.globalAlpha = Math.max(0, Math.min(1, t / 0.3, (dur - t) / 0.3));
  try { ctx.drawImage(el, (VIEW.width - w * s) / 2, (VIEW.height - h * s) / 2, w * s, h * s); } catch (e) { /* no frame yet */ }
  ctx.restore();
}

// Glowing fissures across the frozen flagstones of an arena (deterministic).
function makeCracks(arena, floorY) {
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const out = [];
  for (let x = arena.start + 60; x < arena.end - 60; x += 140 + rnd() * 160) {
    const pts = [[x, floorY + 4 + rnd() * 6]];
    let cx = x, cy = pts[0][1];
    const n = 4 + Math.floor(rnd() * 5);
    for (let i = 0; i < n; i++) {
      cx += 22 + rnd() * 38;
      cy = Math.min(floorY + 30, Math.max(floorY + 2, cy + (rnd() - 0.5) * 16));
      pts.push([cx, cy]);
    }
    out.push({ pts, cx: (x + cx) / 2, ph: rnd() * 6 });
  }
  return out;
}
