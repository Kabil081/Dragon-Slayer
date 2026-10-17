import { VIEW } from '../data/config.js';
import { FROSTPIERCER, WEAPONS } from '../data/weapons.js';
import { clamp } from '../core/math.js';

// In-game overlay drawn on the canvas: health, special cooldown, level and
// gold, the boss bar, the level title card and the opening control hints.

const FONT = 'Cinzel, Georgia, serif';

export class HUD {
  constructor(game) {
    this.game = game;
    this.trail = null;
    this.bossTrail = null;
    this.lastT = 0;
  }

  draw(ctx, lm) {
    const p = lm.player, d = lm.dragon;
    const dt = Math.max(0, lm.realTime - this.lastT);
    this.lastT = lm.realTime;
    if (this.trail === null || lm.realTime < 0.1) { this.trail = p.hp; this.bossTrail = d.hp; }
    this.trail = p.hp < this.trail ? Math.max(p.hp, this.trail - dt * Math.max(30, (this.trail - p.hp) * 3)) : p.hp;
    this.bossTrail = d.hp < this.bossTrail ? Math.max(d.hp, this.bossTrail - dt * Math.max(80, (this.bossTrail - d.hp) * 2.5)) : d.hp;

    ctx.save();
    // ---- low health: a red heartbeat at the screen edges
    const frac = p.hp / p.maxHp;
    if (p.alive && frac < 0.3) {
      const beat = 0.5 + 0.5 * Math.sin(lm.realTime * 7);
      const g = ctx.createRadialGradient(VIEW.width / 2, VIEW.height / 2, VIEW.height * 0.45,
                                         VIEW.width / 2, VIEW.height / 2, VIEW.height * 0.95);
      g.addColorStop(0, 'rgba(120,0,0,0)');
      g.addColorStop(1, `rgba(150,10,10,${(0.25 + 0.25 * beat) * (1 - frac / 0.3 * 0.5)})`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, VIEW.width, VIEW.height);
    }

    // ---- player panel: House Stark sigil, white life bar
    const x = 44, y = 40;
    const pg = ctx.createLinearGradient(x, 0, x + 640, 0);
    pg.addColorStop(0, 'rgba(10,14,22,0.82)');
    pg.addColorStop(1, 'rgba(10,14,22,0)');
    ctx.fillStyle = pg;
    roundRect(ctx, x - 20, y - 18, 660, p.ice ? 158 : 136, 14);
    ctx.fill();
    const sigil = this.game.assets.image(this.game.assets.manifest.ui.sigil);
    ctx.save();
    ctx.shadowColor = 'rgba(200,220,255,0.55)';
    ctx.shadowBlur = 18;
    if (sigil) ctx.drawImage(sigil, x - 6, y - 6, 100, 100);
    ctx.restore();
    ctx.textAlign = 'left';
    ctx.font = `700 22px ${FONT}`;
    ctx.fillStyle = '#f4f6fa';
    ctx.fillText('THE WARRIOR', x + 110, y + 12);
    ctx.font = `600 15px ${FONT}`;
    ctx.fillStyle = '#9fb0c4';
    const info = this.game.progression.xpInfo();
    ctx.fillText(`HOUSE STARK  ·  LV ${info.level}`, x + 290, y + 12);
    this.lifeBar(ctx, x + 110, y + 26, 420, 26, frac, this.trail / p.maxHp, lm.realTime);
    ctx.font = `700 15px ${FONT}`;
    ctx.fillStyle = '#1a2230';
    ctx.fillText(`${Math.ceil(p.hp)} / ${p.maxHp}`, x + 122, y + 45);
    ctx.fillStyle = '#e2c27a';
    ctx.font = `700 18px ${FONT}`;
    ctx.fillText(`${this.game.progression.data.gold} gold`, x + 110, y + 84);
    if (p.fireRes > 0) {
      ctx.fillStyle = '#ff9a5a';
      ctx.fillText(`Fire ward ${Math.round(p.fireRes * 100)}%`, x + 250, y + 84);
    }
    if (p.rules.stamina) this.staminaBar(ctx, x + 110, y + 100, 420, 9, p);
    if (p.ice) this.iceBar(ctx, x + 110, y + 116, 420, 10, p, lm.realTime);
    this.special(ctx, x + 580, y + 44, p);
    const charges = p.weapon.def.special.charges;
    if (charges) {                                   // Lightbreaker flames left this battle
      for (let i = 0; i < charges; i++) {
        const fx = x + 640 + i * 30, fy = y + 30, on = i < p.fireCharges;
        ctx.fillStyle = on ? '#ff9a3a' : 'rgba(120,110,100,0.45)';
        ctx.beginPath();
        ctx.moveTo(fx, fy - 16);
        ctx.quadraticCurveTo(fx + 12, fy, fx, fy + 12);
        ctx.quadraticCurveTo(fx - 12, fy, fx, fy - 16);
        ctx.fill();
      }
      if (p.ignited > 0) {
        ctx.strokeStyle = '#ffb347';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(x + 580, y + 44, 46, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (p.ignited / p.weapon.def.special.duration));
        ctx.stroke();
      }
    }

    if (p.loadout.length > 1 || p.rules.weaponSwitch) this.loadout(ctx, p, lm.realTime);
    if (p.fp) this.frostpiercer(ctx, p, lm.realTime);
    if (lm.saga) this.sagaTrack(ctx, lm);

    // ---- boss bar (two dragons: a bar each)
    if (lm.bossBar > 0.01 && lm.dragons.length > 1) {
      this.twinBars(ctx, lm, dt);
    } else if (lm.bossBar > 0.01 && (d.segments || d.def.secondLife || d.life === 2)) {
      this.bossBarLives(ctx, lm, d);
    } else if (lm.bossBar > 0.01) {
      ctx.globalAlpha = lm.bossBar;
      const bw = 980, bx = (VIEW.width - bw) / 2, by = VIEW.height - 92;
      ctx.fillStyle = 'rgba(8,10,16,0.6)';
      roundRect(ctx, bx - 20, by - 52, bw + 40, 96, 10);
      ctx.fill();
      ctx.font = `700 26px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#efe3c6';
      ctx.fillText(d.def.name.toUpperCase(), VIEW.width / 2, by - 16);
      this.bar(ctx, bx, by, bw, 20, d.hp / d.maxHp, this.bossTrail / d.maxHp, '#7a1410', '#e0482c');
      ctx.fillStyle = '#d6b062';
      for (const ex of [bx - 12, bx + bw + 12]) {
        ctx.beginPath();
        ctx.moveTo(ex, by - 4); ctx.lineTo(ex + 9, by + 10); ctx.lineTo(ex, by + 24); ctx.lineTo(ex - 9, by + 10);
        ctx.closePath();
        ctx.fill();
      }
      for (const ph of d.def.phases.slice(1)) {
        ctx.fillStyle = 'rgba(255,230,180,0.85)';
        ctx.fillRect(bx + bw * ph.hpBelow - 1, by - 3, 3, 26);
      }
      ctx.fillStyle = 'rgba(255,210,120,0.75)';
      ctx.fillRect(bx, by + 26, bw * clamp(d.poiseDmg / d.def.poise, 0, 1), 5);
      if (d.def.core && d.hp <= 1 && d.alive) {
        ctx.font = `700 18px ${FONT}`;
        ctx.fillStyle = `rgba(255,214,120,${0.6 + 0.4 * Math.sin(lm.realTime * 6)})`;
        ctx.fillText('ONLY A BLOW TO THE BARED CORE CAN END HIM', VIEW.width / 2, by + 56);
      } else if (d.coreOpen) {
        ctx.font = `700 18px ${FONT}`;
        ctx.fillStyle = '#ffd36b';
        ctx.fillText('THE CORE IS BARED', VIEW.width / 2, by + 56);
      }
      ctx.globalAlpha = 1;
    }

    // ---- phase banner, dialogue, Level 7 cards and rewards
    if (lm.rewardPop) this.drawReward(ctx, lm.rewardPop);
    else if (lm.banner) this.drawBanner(ctx, lm.banner);
    if (lm.saga && lm.saga.card) this.drawCard(ctx, lm.saga.card);
    this.notes(ctx, lm);
    if (lm.dialogue && lm.dialogue.cur) this.drawLine(ctx, lm.dialogue.cur, lm.dialogue.t, lm.cutscene);
    else if (d.inCutscene) {
      ctx.globalAlpha = 0.8;
      ctx.font = `600 18px ${FONT}`;
      ctx.textAlign = 'right';
      ctx.fillStyle = '#e6dcc4';
      ctx.fillText('Enter  ·  skip', VIEW.width - 48, VIEW.height - 150);
      ctx.globalAlpha = 1;
    }

    // ---- off-screen dragon marker (the Level 2 arena is wider than the view)
    if (lm.phase === 'arena') {
      for (const dr of lm.dragons) if (dr.active && dr.alive) this.offscreenMarker(ctx, lm, dr);
    }

    // ---- title card
    const tc = lm.realTime;
    if (tc < 5 && !(lm.saga && lm.saga.index > 0)) {        // not again on a checkpoint restart
      const a = clamp(Math.min(tc / 0.8, (5 - tc) / 1.2), 0, 1);
      ctx.globalAlpha = a;
      ctx.textAlign = 'center';
      ctx.font = `700 26px ${FONT}`;
      ctx.fillStyle = '#c9a45a';
      ctx.fillText(`LEVEL ${lm.cfg.id}`, VIEW.width / 2, 300);
      ctx.font = `700 78px ${FONT}`;
      ctx.fillStyle = '#f2ead8';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 18;
      ctx.fillText(lm.cfg.name.toUpperCase(), VIEW.width / 2, 384);
      ctx.font = `italic 28px Georgia, serif`;
      ctx.fillStyle = '#cfc6b2';
      ctx.fillText(lm.cfg.subtitle, VIEW.width / 2, 432);
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }
    // ---- boss reveal
    if (lm.bossIntroTime >= 0) {
      const t = lm.realTime - lm.bossIntroTime - 1.6;
      if (t > 0 && t < 3) {
        const a = clamp(Math.min(t / 0.4, (3 - t) / 0.8), 0, 1);
        ctx.globalAlpha = a;
        ctx.textAlign = 'center';
        ctx.font = `700 64px ${FONT}`;
        ctx.fillStyle = '#ffcf8a';
        ctx.shadowColor = 'rgba(80,10,0,0.9)';
        ctx.shadowBlur = 24;
        const title = lm.dragons.map(dr => dr.def.title || dr.def.name).join('  &  ');
        const sub = lm.cfg.revealSub || (lm.dragons.length === 1 && d.def.subtitle);
        ctx.fillText(title.toUpperCase(), VIEW.width / 2, 250);
        if (sub) {
          ctx.font = `italic 28px Georgia, serif`;
          ctx.fillStyle = '#e6d2b0';
          ctx.fillText(sub, VIEW.width / 2, 296);
        }
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }
    }
    if (tc < 14 && lm.cfg.rules && lm.cfg.rules.weaponSwitch) {
      ctx.globalAlpha = clamp((14 - tc) / 2, 0, 1) * 0.9;
      ctx.textAlign = 'left';
      ctx.font = `600 19px ${FONT}`;
      ctx.fillStyle = '#e6dcc4';
      const lines = lm.cfg.rules.frostpiercer
        ? ['F  Frostpiercer  ·  W / S aim  ·  hold J, release', 'S  ice ward (Frostbrand)', 'Hold K  Glacial Wave',
           'Q / 1-2  switch swords', 'Rolls cost stamina here', 'M  sound on / off']
        : ['E  take a weapon from a cache', 'Q / 1-6  switch carried weapons', 'Hold S  brace against wind',
           'Rolls cost stamina here', 'Hold K  charge a heavy special'];
      lines.forEach((l, i) => ctx.fillText(l, 48, 230 + i * 28));
      ctx.globalAlpha = 1;
    }
    // ---- control hints for the first seconds
    if (tc < 12 && lm.cfg.id === 1) {
      ctx.globalAlpha = clamp((12 - tc) / 2, 0, 1) * 0.9;
      ctx.textAlign = 'left';
      ctx.font = `600 19px ${FONT}`;
      ctx.fillStyle = '#e6dcc4';
      const lines = ['A / D  move', 'Space  jump', 'J  attack (chain x3)', 'Shift  dodge roll', 'K  weapon special',
                     'Esc  pause'];
      lines.forEach((l, i) => ctx.fillText(l, 48, VIEW.height - 210 + i * 28));
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  staminaBar(ctx, x, y, w, h, p) {
    const f = p.stamina / p.maxStamina;
    ctx.fillStyle = 'rgba(6,8,14,0.9)';
    ctx.fillRect(x - 2, y - 2, w + 4, h + 4);
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, p.exhausted > 0 ? '#ff7a5a' : '#f0e2a0');
    g.addColorStop(1, p.exhausted > 0 ? '#a0281a' : '#9c8a3c');
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w * clamp(f, 0, 1), h);
    ctx.fillStyle = 'rgba(10,10,14,0.6)';                  // one notch per roll
    const cost = 34 / p.maxStamina;
    for (let k = cost; k < 1; k += cost) ctx.fillRect(x + w * k, y, 2, h);
    ctx.font = `700 12px ${FONT}`;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#d8ccaa';
    ctx.fillText('STAMINA', x + w + 10, y + h);
  }

  // Carried weapons: icon slots, the active one framed in gold, bolts and frost shown.
  loadout(ctx, p, time) {
    const n = p.loadout.length;
    const size = 64, gap = 10;
    const x0 = 44, y0 = VIEW.height - 214;
    ctx.save();
    ctx.fillStyle = 'rgba(8,10,16,0.66)';
    roundRect(ctx, x0 - 12, y0 - 34, n * (size + gap) + 14, size + 70, 10);
    ctx.fill();
    ctx.font = `700 15px ${FONT}`;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#c9b48a';
    ctx.fillText(p.weapon.def.name.toUpperCase(), x0, y0 - 12);
    p.loadout.forEach((w, i) => {
      const x = x0 + i * (size + gap), y = y0;
      const on = i === p.slot;
      ctx.fillStyle = on ? 'rgba(60,48,26,0.95)' : 'rgba(22,24,32,0.9)';
      ctx.fillRect(x, y, size, size);
      const icon = this.game.assets.image(this.game.assets.manifest.weapons[w.id].file);
      if (icon) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, size, size);
        ctx.clip();
        ctx.translate(x + size / 2, y + size / 2);
        ctx.rotate(Math.PI / 4);
        const s = (size * 1.25) / Math.max(icon.width, icon.height);
        ctx.drawImage(icon, -icon.width * s / 2, -icon.height * s / 2, icon.width * s, icon.height * s);
        ctx.restore();
      }
      ctx.strokeStyle = on ? '#e8c46a' : 'rgba(160,150,130,0.5)';
      ctx.lineWidth = on ? 3 : 1.5;
      ctx.strokeRect(x, y, size, size);
      ctx.fillStyle = '#f2ead8';
      ctx.font = `700 14px ${FONT}`;
      ctx.fillText(String(i + 1), x + 4, y + 16);
      if (w.def.ammo) {                          // bolts left (loaded one included)
        ctx.textAlign = 'right';
        ctx.fillStyle = w.bolts ? '#f2ead8' : '#ff6b5a';
        ctx.fillText(`${w.bolts}`, x + size - 4, y + size - 6);
        ctx.textAlign = 'left';
        for (let k = 0; k < Math.min(12, w.bolts); k++) ctx.fillRect(x + 2 + k * 5, y + size + 6, 3, 10);
        if (!w.loaded && w.ammo > 0 && on) {
          ctx.fillStyle = '#ffb347';
          ctx.fillText('RELOAD', x, y + size + 30);
        }
      }
      if (w.def.special.type === 'hook') {      // hook throws left
        ctx.textAlign = 'right';
        ctx.fillStyle = w.hooks ? '#f2ead8' : '#ff6b5a';
        ctx.fillText(`${w.hooks}`, x + size - 4, y + size - 6);
        ctx.textAlign = 'left';
      }
      if (w.def.frostGain) {                     // frost meter
        ctx.fillStyle = 'rgba(20,30,40,0.9)';
        ctx.fillRect(x, y + size + 6, size, 7);
        ctx.fillStyle = w.frost >= 1 ? `rgba(180,240,255,${0.7 + 0.3 * Math.sin(time * 10)})` : '#7fc8f0';
        ctx.fillRect(x, y + size + 6, size * w.frost, 7);
      }
    });
    ctx.restore();
  }

  // Large boss bar for a dragon with armor segments and/or two lives.
  bossBarLives(ctx, lm, d) {
    ctx.save();
    ctx.globalAlpha = lm.bossBar;
    const bw = 1100, bx = (VIEW.width - bw) / 2, by = VIEW.height - 84;
    ctx.fillStyle = 'rgba(8,10,16,0.66)';
    roundRect(ctx, bx - 24, by - 74, bw + 48, 128, 10);
    ctx.fill();
    ctx.textAlign = 'center';
    ctx.font = `900 40px ${FONT}`;
    ctx.fillStyle = d.life === 2 ? '#ffb070' : '#efe3c6';
    ctx.shadowColor = d.life === 2 ? 'rgba(255,90,20,0.8)' : 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 16;
    ctx.fillText((d.def.title || d.def.name).toUpperCase(), VIEW.width / 2, by - 30);
    ctx.shadowBlur = 0;
    const ph = d.def.phases[Math.min(d.phase, d.def.phases.length - 1)];
    const first = d.def.firstLife ? d.def.firstLife.phases.length : 0;
    const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
    ctx.font = `600 16px ${FONT}`;
    ctx.fillStyle = '#c9b48a';
    const life = d.life === 2 ? 'SECOND LIFE' : d.def.secondLife ? 'FIRST LIFE' : '';
    ctx.fillText(`${life}${life ? '  ·  ' : ''}PHASE ${roman[(d.life === 2 ? first : 0) + d.phase]}  ·  ${(ph.name || '').toUpperCase()}`,
                 VIEW.width / 2, by - 8);
    const hp = d.inCutscene ? (d.state === 'resurrect' ? Math.min(1, d.t / 3.6) : 0) : d.hp / d.maxHp;
    const dark = d.life === 2 ? '#8a3a08' : '#7a1410', light = d.life === 2 ? '#ffb347' : '#e0482c';
    this.bar(ctx, bx, by + 2, bw, 22, hp, d.inCutscene ? hp : this.bossTrail / d.maxHp, dark, light);
    ctx.fillStyle = 'rgba(255,230,180,0.85)';
    for (const q of d.def.phases.slice(1)) ctx.fillRect(bx + bw * q.hpBelow - 1, by - 1, 3, 28);
    // lives: one diamond per health pool
    const lives = d.def.secondLife ? 2 : d.life === 2 ? 2 : 1;
    for (let i = 0; i < lives; i++) {
      const lx = bx - 4 + i * 0 - 30 - i * 26, ly = by + 13;
      const alive = d.life === 2 ? i === 0 : true;
      ctx.fillStyle = alive ? (d.life === 2 ? '#ffb347' : '#e8c46a') : 'rgba(120,110,100,0.5)';
      ctx.beginPath();
      ctx.moveTo(lx, ly - 12); ctx.lineTo(lx + 10, ly); ctx.lineTo(lx, ly + 12); ctx.lineTo(lx - 10, ly);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(255,210,120,0.75)';
    ctx.fillRect(bx, by + 28, bw * clamp(d.poiseDmg / d.def.poise, 0, 1), 4);
    // armor segments
    if (d.segments) {
      const segs = Object.values(d.segments);
      const sw = 150, sx0 = VIEW.width / 2 - (segs.length * sw) / 2;
      ctx.font = `700 13px ${FONT}`;
      segs.forEach((sg, i) => {
        const x = sx0 + i * sw + 10, y = by + 38;
        const exposed = sg.broken || sg.exposedT > 0;
        ctx.textAlign = 'left';
        ctx.fillStyle = sg.broken ? '#ffb347' : sg.exposedT > 0 ? '#ffd36b' : sg.hp < sg.max * 0.5 ? '#e0b070' : '#a8b4c4';
        ctx.fillText(sg.label.toUpperCase() + (sg.broken ? '  ✦' : ''), x, y + 12);
        ctx.fillStyle = 'rgba(10,12,18,0.9)';
        ctx.fillRect(x, y + 16, sw - 24, 5);
        ctx.fillStyle = exposed ? '#ff8a3a' : '#9fb0c4';
        ctx.fillRect(x, y + 16, (sw - 24) * (sg.broken ? 1 : sg.hp / sg.max), 5);
      });
    }
    ctx.restore();
  }

  drawBanner(ctx, b) {
    const a = clamp(Math.min(b.t / 0.35, ((b.long ? 4 : 2.8) - b.t) / 0.6), 0, 1);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.textAlign = 'center';
    const g = ctx.createLinearGradient(VIEW.width / 2 - 600, 0, VIEW.width / 2 + 600, 0);
    g.addColorStop(0, 'rgba(10,8,8,0)');
    g.addColorStop(0.5, 'rgba(10,8,8,0.7)');
    g.addColorStop(1, 'rgba(10,8,8,0)');
    ctx.fillStyle = g;
    ctx.fillRect(VIEW.width / 2 - 600, 150, 1200, 120);
    ctx.font = `900 56px ${FONT}`;
    ctx.fillStyle = '#ffcf8a';
    ctx.shadowColor = 'rgba(120,30,0,0.9)';
    ctx.shadowBlur = 20;
    ctx.fillText(b.title, VIEW.width / 2, 216);
    ctx.shadowBlur = 0;
    ctx.font = `italic 26px Georgia, serif`;
    ctx.fillStyle = '#e6d2b0';
    ctx.fillText(b.sub, VIEW.width / 2, 254);
    ctx.restore();
  }

  drawLine(ctx, line, t, skippable) {
    const a = clamp(t / 0.25, 0, 1);
    ctx.save();
    ctx.globalAlpha = a;
    const y = 420;
    ctx.font = `italic 30px Georgia, serif`;
    const w = ctx.measureText(line.text).width + 80;
    ctx.fillStyle = 'rgba(6,8,12,0.72)';
    roundRect(ctx, VIEW.width / 2 - w / 2, y - 44, w, 74, 8);
    ctx.fill();
    ctx.textAlign = 'center';
    ctx.font = `700 16px ${FONT}`;
    ctx.fillStyle = '#d6b062';
    ctx.fillText(line.who.toUpperCase(), VIEW.width / 2, y - 18);
    ctx.font = `italic 28px Georgia, serif`;
    ctx.fillStyle = '#f2ead8';
    ctx.fillText(line.text, VIEW.width / 2, y + 16);
    ctx.font = `600 14px ${FONT}`;
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(230,220,196,0.7)';
    ctx.fillText(skippable ? 'Enter · skip' : 'Enter', VIEW.width / 2 + w / 2 - 12, y + 26);
    ctx.restore();
  }

  // ---------------------------------------------------------------- Level 7
  // Frostbrand's ice energy, and the ward: ready, raised, or recovering.
  iceBar(ctx, x, y, w, h, p, time) {
    const I = p.ice, E = WEAPONS.frostbrand, Wd = E.ward;
    ctx.fillStyle = 'rgba(6,10,18,0.9)';
    ctx.fillRect(x - 2, y - 2, w + 4, h + 4);
    const f = I.energy / E.energy.max;
    const g = ctx.createLinearGradient(x, 0, x + w, 0);
    g.addColorStop(0, '#3f8fd0');
    g.addColorStop(1, '#bfeaff');
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w * f, h);
    for (const c of [Wd.cost, E.special.cost]) {          // what the ward and the wave cost
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fillRect(x + w * c / E.energy.max - 1, y - 2, 2, h + 4);
    }
    ctx.font = `700 12px ${FONT}`;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#9fe0ff';
    ctx.fillText('ICE', x - 34, y + 10);
    // the ward
    const cx = x + w + 30, cy = y + 4, r = 13;
    const ready = I.wardCd <= 0 && I.energy >= Wd.cost && p.hasFrostbrand;
    ctx.save();
    ctx.strokeStyle = I.wardT > 0 ? `rgba(200,240,255,${0.7 + 0.3 * Math.sin(time * 20)})` : ready ? '#9fe0ff' : 'rgba(120,130,150,0.6)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, cy - r); ctx.lineTo(cx + r, cy - r * 0.4); ctx.lineTo(cx + r * 0.7, cy + r * 0.7);
    ctx.lineTo(cx, cy + r); ctx.lineTo(cx - r * 0.7, cy + r * 0.7); ctx.lineTo(cx - r, cy - r * 0.4);
    ctx.closePath();
    ctx.stroke();
    if (I.wardCd > 0) {
      const k = I.wardCd / (I.wardUsed ? Wd.cooldown : Wd.cooldown);
      ctx.strokeStyle = 'rgba(160,200,230,0.8)';
      ctx.beginPath();
      ctx.arc(cx, cy, r + 6, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * clamp(1 - k, 0, 1));
      ctx.stroke();
    }
    ctx.font = `700 12px ${FONT}`;
    ctx.fillStyle = ready ? '#bfe4ff' : 'rgba(150,160,176,0.8)';
    ctx.fillText('S WARD', cx + 22, cy + 5);
    ctx.restore();
  }

  frostpiercer(ctx, p, time) {
    const fp = p.fp, M = this.game.assets.manifest.objects.frostpiercer;
    const n = p.loadout.length;
    const x0 = 44 + (p.loadout.length > 1 || p.rules.weaponSwitch ? n * 74 + 30 : 0), y0 = VIEW.height - 248;
    const w = 330, h = 118;
    ctx.save();
    ctx.fillStyle = 'rgba(8,12,20,0.7)';
    roundRect(ctx, x0, y0, w, h, 10);
    ctx.fill();
    ctx.strokeStyle = fp.aimWeak && fp.out ? `rgba(255,214,110,${0.6 + 0.4 * Math.sin(time * 12)})` : 'rgba(140,190,230,0.35)';
    ctx.lineWidth = 2;
    ctx.stroke();
    const icon = this.game.assets.image(M.icon);
    if (icon) {
      const s = 150 / icon.width;
      ctx.globalAlpha = fp.disabled ? 0.35 : 1;
      ctx.drawImage(icon, x0 + 12, y0 + 26, icon.width * s, icon.height * s);
      ctx.globalAlpha = 1;
    }
    ctx.textAlign = 'left';
    ctx.font = `700 15px ${FONT}`;
    ctx.fillStyle = '#bfe4ff';
    ctx.fillText('FROSTPIERCER', x0 + 14, y0 + 20);
    ctx.font = `700 13px ${FONT}`;
    ctx.fillStyle = '#9fb0c4';
    ctx.fillText('F', x0 + w - 24, y0 + 20);
    // spears left (the loaded one drawn brighter)
    for (let i = 0; i < FROSTPIERCER.ammo; i++) {
      const sx = x0 + 176 + i * 34, sy = y0 + 36;
      const have = i < fp.ammo, rail = have && i === 0 && fp.loaded;
      ctx.fillStyle = have ? (rail ? '#e8f8ff' : '#7fbfe8') : 'rgba(90,100,120,0.5)';
      ctx.beginPath();
      ctx.moveTo(sx, sy); ctx.lineTo(sx + 7, sy + 10); ctx.lineTo(sx + 3, sy + 10); ctx.lineTo(sx + 3, sy + 34);
      ctx.lineTo(sx - 3, sy + 34); ctx.lineTo(sx - 3, sy + 10); ctx.lineTo(sx - 7, sy + 10);
      ctx.closePath();
      ctx.fill();
    }
    let line = 'F · DEPLOY', col = '#c9d6e4', bar = null;
    if (fp.disabled) { line = 'NOT IN A DUEL'; col = '#8a93a2'; }
    else if (fp.ammo <= 0 && !fp.loaded) { line = 'NO SPEARS LEFT'; col = '#ff8a7a'; }
    else if (fp.out) {
      if (fp.sub === 'reload') { line = 'RELOADING'; col = '#ffb347'; bar = clamp(fp.t / FROSTPIERCER.reload, 0, 1); }
      else if (fp.sub === 'deploy') line = 'DEPLOYING';
      else if (fp.charge > 0) { line = fp.charge >= 1 ? 'FULL CHARGE' : 'CHARGING'; col = '#e8f8ff'; bar = fp.charge; }
      else line = 'W / S AIM · HOLD J';
    }
    ctx.font = `700 14px ${FONT}`;
    ctx.fillStyle = col;
    ctx.fillText(line, x0 + 176, y0 + 92);
    if (bar !== null) {
      ctx.fillStyle = 'rgba(20,30,44,0.9)';
      ctx.fillRect(x0 + 176, y0 + 100, 138, 7);
      ctx.fillStyle = bar >= 1 ? `rgba(220,248,255,${0.7 + 0.3 * Math.sin(time * 16)})` : '#7fc8f0';
      ctx.fillRect(x0 + 176, y0 + 100, 138 * bar, 7);
    }
    if (fp.out && fp.loaded && fp.sub === 'aim' && fp.aimHit) {
      ctx.font = `900 15px ${FONT}`;
      ctx.fillStyle = fp.aimWeak ? `rgba(255,214,110,${0.7 + 0.3 * Math.sin(time * 12)})` : '#9fb0c4';
      ctx.fillText(fp.aimWeak ? 'WEAK POINT' : 'ARMOR', x0 + 14, y0 + 110);
    }
    ctx.restore();
  }

  // The four of Level 7: who has fallen, who is next.
  sagaTrack(ctx, lm) {
    const S = lm.saga, stages = S.cfg.stages, rec = S.rec;
    const names = { sunfyre: 'SUNFYRE', vermithor: 'VERMITHOR', balerion: 'BALERION', aegon: 'AEGON' };
    const x1 = VIEW.width - 44, y = 52;
    ctx.save();
    ctx.textAlign = 'right';
    stages.forEach((st, i) => {
      const done = rec.cleared.includes(st.id) || i < S.index;
      const cur = i === S.index;
      const x = x1 - (stages.length - 1 - i) * 150;
      ctx.fillStyle = done ? 'rgba(232,196,106,0.95)' : cur ? '#f2ead8' : 'rgba(150,150,160,0.55)';
      ctx.font = `${cur ? 900 : 700} 15px ${FONT}`;
      ctx.fillText((done ? '✓ ' : '') + names[st.id], x, y);
      if (cur) ctx.fillRect(x - ctx.measureText(names[st.id]).width, y + 8, ctx.measureText(names[st.id]).width, 2);
    });
    ctx.restore();
  }

  drawCard(ctx, c) {
    const a = clamp(Math.min(c.t / 0.4, ((c.dur || 5.5) - c.t) / 0.5), 0, 1);
    const w = 1100, h = 300, x = (VIEW.width - w) / 2, y = 300;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(6,10,18,0.88)';
    roundRect(ctx, x, y, w, h, 14);
    ctx.fill();
    ctx.strokeStyle = 'rgba(150,210,255,0.55)';
    ctx.lineWidth = 2;
    ctx.stroke();
    const M = this.game.assets.manifest;
    const iconFile = c.icon === 'frostpiercer' ? M.objects.frostpiercer.icon : M.weapons[c.icon] && M.weapons[c.icon].file;
    const icon = iconFile ? this.game.assets.image(iconFile) : null;
    if (icon) {
      ctx.save();
      ctx.translate(x + 140, y + h / 2);
      if (c.icon !== 'frostpiercer') ctx.rotate(Math.PI / 4);
      const s = c.icon === 'frostpiercer' ? 220 / icon.width : 220 / icon.height;
      ctx.drawImage(icon, -icon.width * s / 2, -icon.height * s / 2, icon.width * s, icon.height * s);
      ctx.restore();
    }
    ctx.textAlign = 'left';
    ctx.font = `900 46px ${FONT}`;
    ctx.fillStyle = '#e8f6ff';
    ctx.shadowColor = 'rgba(120,200,255,0.8)';
    ctx.shadowBlur = 18;
    ctx.fillText(c.title, x + 290, y + 70);
    ctx.shadowBlur = 0;
    ctx.font = 'italic 22px Georgia, serif';
    ctx.fillStyle = '#9fc4e0';
    ctx.fillText(c.sub, x + 292, y + 104);
    ctx.font = '21px Georgia, serif';
    ctx.fillStyle = '#e6e2d6';
    c.lines.forEach((l, i) => ctx.fillText(l, x + 292, y + 148 + i * 34));
    ctx.font = `600 14px ${FONT}`;
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(230,220,196,0.7)';
    ctx.fillText('Enter · continue', x + w - 18, y + h - 16);
    ctx.restore();
  }

  drawReward(ctx, r) {
    const a = clamp(Math.min(r.t / 0.35, (4.5 - r.t) / 0.6), 0, 1);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.textAlign = 'center';
    const g = ctx.createLinearGradient(VIEW.width / 2 - 640, 0, VIEW.width / 2 + 640, 0);
    g.addColorStop(0, 'rgba(10,8,8,0)');
    g.addColorStop(0.5, 'rgba(10,8,8,0.78)');
    g.addColorStop(1, 'rgba(10,8,8,0)');
    ctx.fillStyle = g;
    ctx.fillRect(VIEW.width / 2 - 640, 140, 1280, 150);
    ctx.font = `900 60px ${FONT}`;
    ctx.fillStyle = '#ffcf8a';
    ctx.shadowColor = 'rgba(120,30,0,0.9)';
    ctx.shadowBlur = 20;
    ctx.fillText(r.title, VIEW.width / 2, 214);
    ctx.shadowBlur = 0;
    ctx.font = `700 28px ${FONT}`;
    ctx.fillStyle = r.first ? '#e8c46a' : '#a8a29a';
    ctx.fillText(r.first ? `+${r.gold} gold   ·   +${r.xp} XP` : 'reward already claimed', VIEW.width / 2, 262);
    ctx.restore();
  }

  notes(ctx, lm) {
    ctx.save();
    ctx.textAlign = 'right';
    ctx.font = `600 15px ${FONT}`;
    if (lm.muteNote && (lm.muteNote.t += 1 / 60) < 2) {
      ctx.fillStyle = 'rgba(230,220,196,0.85)';
      ctx.fillText(lm.muteNote.muted ? 'SOUND OFF  ·  M' : 'SOUND ON  ·  M', VIEW.width - 44, VIEW.height - 40);
    }
    if (lm.audioNotice) {
      ctx.fillStyle = 'rgba(180,186,196,0.8)';
      ctx.fillText(lm.audioNotice.msg, VIEW.width - 44, VIEW.height - 64);
    }
    ctx.restore();
  }

  // Two dragons: a bar each, side by side, with its phase tick and poise.
  twinBars(ctx, lm, dt) {
    const n = lm.dragons.length, gap = 60, bw = 640;
    const total = n * bw + (n - 1) * gap, by = VIEW.height - 84;
    ctx.globalAlpha = lm.bossBar;
    ctx.fillStyle = 'rgba(8,10,16,0.6)';
    roundRect(ctx, (VIEW.width - total) / 2 - 24, by - 54, total + 48, 98, 10);
    ctx.fill();
    (lm.barOrder || lm.dragons).forEach((d, i) => {
      const bx = (VIEW.width - total) / 2 + i * (bw + gap);
      if (d.hudTrail === undefined || lm.realTime < 0.1) d.hudTrail = d.hp;
      d.hudTrail = d.hp < d.hudTrail ? Math.max(d.hp, d.hudTrail - dt * Math.max(80, (d.hudTrail - d.hp) * 2.5)) : d.hp;
      const down = d.defeated || !d.alive;
      ctx.font = `700 24px ${FONT}`;
      ctx.textAlign = i === 0 ? 'left' : 'right';
      const tx = i === 0 ? bx : bx + bw;
      ctx.fillStyle = down ? 'rgba(170,160,150,0.7)' : d.enraged ? '#ffb070' : '#efe3c6';
      ctx.shadowColor = d.enraged ? 'rgba(255,90,20,0.8)' : 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 8;
      const tag = down ? '  ·  SLAIN' : d.enraged ? '  ·  ENRAGED' : d.phase > 0 ? '  ·  PHASE II' : '';
      ctx.fillText((d.def.title || d.def.name).toUpperCase() + tag, tx, by - 18);
      ctx.shadowBlur = 0;
      const dark = d.def.palette === 'frost' ? '#1e4a7a' : '#7a1410';
      const light = d.def.palette === 'frost' ? '#8cd0ff' : '#e0482c';
      this.bar(ctx, bx, by, bw, 20, d.hp / d.maxHp, d.hudTrail / d.maxHp, dark, light);
      const ph = d.def.phases[1];
      if (ph) {
        ctx.fillStyle = 'rgba(255,230,180,0.85)';
        ctx.fillRect(bx + bw * ph.hpBelow - 1, by - 3, 3, 26);
      }
      if (!down) {
        ctx.fillStyle = 'rgba(255,210,120,0.75)';
        ctx.fillRect(bx, by + 26, bw * clamp(d.poiseDmg / d.def.poise, 0, 1), 5);
      }
    });
    ctx.globalAlpha = 1;
  }

  offscreenMarker(ctx, lm, d) {
    const cam = this.game.camera;
    const head = d.frameToWorld(d.anim.data.head);
    const body = d.hurtboxes()[1].rect;
    const left = Math.min(head.x, body.x) - cam.x;
    const right = Math.max(head.x, body.x + body.w) - cam.x;
    if (right > 0 && left < VIEW.width) return;
    const side = right <= 0 ? -1 : 1;
    const x = side < 0 ? 54 : VIEW.width - 54;
    const y = clamp(Math.min(head.y, d.floorY - 200), 240, 800);
    const warn = d.telegraphing;
    const pulse = warn ? 0.55 + 0.45 * Math.sin(lm.realTime * 18) : 1;
    ctx.save();
    ctx.globalAlpha = 0.9 * pulse;
    ctx.fillStyle = warn ? '#ff5a3a' : '#e8c46a';
    ctx.strokeStyle = 'rgba(10,8,8,0.85)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x + side * 30, y);
    ctx.lineTo(x - side * 14, y - 28);
    ctx.lineTo(x - side * 14, y + 28);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
    ctx.font = `700 18px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f2ead8';
    const dist = Math.round(Math.abs(d.x - lm.player.x) / 100);
    ctx.fillText(warn ? '!' : `${dist}m`, x - side * 4, y + 56);
    ctx.restore();
  }

  // The warrior's life: a frost-white bar with a red trail for fresh damage.
  lifeBar(ctx, x, y, w, h, frac, trail, time) {
    ctx.fillStyle = 'rgba(6,8,14,0.9)';
    ctx.fillRect(x - 3, y - 3, w + 6, h + 6);
    ctx.fillStyle = '#c8402c';
    ctx.fillRect(x, y, w * clamp(trail, 0, 1), h);
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.55, '#e8eef6');
    g.addColorStop(1, '#b8c6d8');
    ctx.save();
    ctx.shadowColor = 'rgba(220,235,255,0.9)';
    ctx.shadowBlur = frac < 0.3 ? 8 + 8 * Math.sin(time * 7) : 12;
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w * clamp(frac, 0, 1), h);
    ctx.restore();
    ctx.fillStyle = 'rgba(20,28,40,0.35)';
    for (let k = 1; k < 10; k++) ctx.fillRect(x + (w * k) / 10, y, 1.5, h);
    ctx.strokeStyle = 'rgba(220,230,245,0.7)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x - 3, y - 3, w + 6, h + 6);
  }

  bar(ctx, x, y, w, h, frac, trail, dark, light) {
    ctx.fillStyle = 'rgba(20,16,16,0.85)';
    ctx.fillRect(x - 3, y - 3, w + 6, h + 6);
    ctx.fillStyle = 'rgba(255,240,220,0.55)';
    ctx.fillRect(x, y, w * clamp(trail, 0, 1), h);
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, light);
    g.addColorStop(1, dark);
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w * clamp(frac, 0, 1), h);
    ctx.strokeStyle = 'rgba(214,190,140,0.5)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x - 3, y - 3, w + 6, h + 6);
  }

  special(ctx, cx, cy, p) {
    const r = 40;
    const wm = this.game.assets.manifest.weapons[p.weapon.id];
    const icon = this.game.assets.image(wm.file);
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(20,22,30,0.95)';
    ctx.fill();
    ctx.clip();
    if (icon) {
      ctx.translate(cx, cy);
      ctx.rotate(Math.PI / 4);
      const s = (r * 2.3) / icon.height;
      ctx.drawImage(icon, -icon.width * s / 2, -icon.height * s / 2, icon.width * s, icon.height * s);
    }
    ctx.restore();
    const cd = p.specialCd / p.weapon.def.special.cooldown;
    if (cd > 0) {
      ctx.fillStyle = 'rgba(0,0,0,0.62)';
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * cd);
      ctx.closePath();
      ctx.fill();
    }
    ctx.strokeStyle = cd > 0 ? 'rgba(160,150,130,0.6)' : '#e8c46a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.font = `700 16px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f2ead8';
    ctx.fillText('K', cx, cy + r + 20);
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
