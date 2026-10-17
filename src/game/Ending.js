import { PLAYER, VIEW } from '../data/config.js';
import { clamp, lerp } from '../core/math.js';

// The close of Level 7: THE NORTH REMEMBERS.
//
//   0 - 3 s    combat has stopped; the score falls quiet, snow drifts, the
//              letterbox closes; the warrior stands on the Wall with Frostbrand
//   3 - 11 s   the camera pulls back: the colossal frozen fortress built into
//              the Wall, the slain dragons dark shapes on the snow below
//   11 - 13 s  fade to black
//   13 s +     the title rises slowly in the snow; a deep impact, a swell,
//              and the anthem begins; the voice: "The North remembers."
//   20 s +     THE KING IN THE NORTH: the war horn, the drums, and the hall
//              takes up the cry
//   ~28 s      done: the completion screen opens over the title
//
// Enter skips the pull-back (straight to the title), and after the title
// has been shown for a while, ends it.

const BASE = { pull: 3, pullEnd: 11, black: 13, title: 13, impact: 14.4, voice: 15.6, king: 20.5, kingVoice: 21.3, done: 28 };

// The ending's timeline. A player-supplied video clip (src/core/Clips.js) is
// played in its own slot and pushes everything after it back: Lyanna's line
// after the fade to black, before the title; the hall's cry before THE KING
// IN THE NORTH. An audio clip simply replaces the synthesized voice line.
export function timeline(clips) {
  const t = { ...BASE, clip1: null, clip2: null, audio1: null, audio2: null };
  const c1 = clips && clips.get('north_remembers'), c2 = clips && clips.get('king_in_the_north');
  if (c1 && c1.type === 'video') {
    t.clip1 = { at: BASE.black + 0.4, dur: c1.duration, clip: c1 };
    const shift = c1.duration + 1.0;
    for (const k of ['title', 'impact', 'king', 'kingVoice', 'done']) t[k] += shift;
    t.voice = Infinity;                        // she says it: no second voice over the title
  } else if (c1) {
    t.audio1 = c1;
  }
  if (c2 && c2.type === 'video') {
    t.clip2 = { at: t.title + 5.5, dur: c2.duration, clip: c2 };
    const shift = t.clip2.at + c2.duration + 0.8 - t.king;
    for (const k of ['king', 'done']) t[k] += shift;
    t.kingVoice = Infinity;
  } else if (c2) {
    t.audio2 = c2;
  }
  return t;
}

export class Ending {
  constructor(lm) {
    this.lm = lm;
    this.game = lm.game;
    this.t = 0;
    this.done = false;
    this.fired = {};
    this.voiceMode = null;
    this.flakes = Array.from({ length: 220 }, () => ({
      x: Math.random() * VIEW.width, y: Math.random() * VIEW.height, r: 0.6 + Math.random() * 2.4,
      v: 30 + Math.random() * 70, w: Math.random() * 6.28 }));
    this.T = timeline(this.game.clips);
    const bg = this.game.assets.manifest.backgrounds[lm.cfg.background];
    this.pan = bg.ending_panorama;
    this.panImg = this.pan ? this.game.assets.image(this.pan.file) : null;
    if (this.game.audio) this.game.audio.music('ending');
    const p = lm.player, A = lm.cfg.arena;
    const fb = p.loadout.findIndex(w => w.id === 'frostbrand');
    if (fb >= 0) { p.slot = fb; p.weapon = p.loadout[fb]; }
    if (p.state === 'fp' || p.state === 'brace') p.setState('move');
    p.x = Math.max(A.start + 520, Math.min(A.end - 700, p.x));
    p.vx = 0;
    const king = lm.dragon;
    if (king && king.duelist) { king.x = Math.min(A.end - 300, p.x + 420); king.facing = -1; p.facing = 1; }
  }

  get full() { return this.t >= this.T.pull + 0.8; }        // the panorama has fully replaced the world view

  skip() {
    const T = this.T;
    if (this.t < T.black) { this.t = T.black; return; }
    for (const c of [T.clip1, T.clip2]) {                // a playing clip: on to what follows it
      if (c && this.t >= c.at && this.t < c.at + c.dur) { this.stopClip(c); this.t = c.at + c.dur; return; }
    }
    if (this.t < T.title) { this.t = T.title; return; }
    if (this.t > T.king + 1.5) this.done = true;
  }

  // A player-supplied clip: played through the page (its own sound), the score held low.
  playClip(c, line) {
    const A = this.game.audio, el = c.clip ? c.clip.el : c.el;
    el.muted = !!(A && A.muted);
    try { el.currentTime = 0; } catch (e) { /* not seekable yet */ }
    if (A && A.musicBus) A.musicBus.gain.setTargetAtTime(0.06, A.ctx.currentTime, 0.3);
    const pr = el.play();
    if (pr && pr.catch) {
      pr.catch(err => {
        // it could not play: fall back to the voice line, skip the clip's slot, and say so
        console.warn('Clips: could not play', el.src, err);
        if (A) A.report(`The clip "${line}" could not be played; the voice line is used instead.`);
        this.clipFailed = true;
        if (c.clip && this.t < c.at + c.dur) this.t = c.at + c.dur;
        this.speak((c.clip || c).id, line);
      });
    }
    this.voiceMode = 'clip';
  }

  stopClip(c) {
    const el = c.clip ? c.clip.el : c.el;
    try { el.pause(); } catch (e) { /* gone */ }
    const A = this.game.audio;
    if (A && A.musicBus) A.musicBus.gain.setTargetAtTime(A.musicLevel, A.ctx.currentTime, 0.6);
  }

  fire(key, at, fn) {
    if (!this.fired[key] && this.t >= at) { this.fired[key] = true; fn(); }
  }

  update(dt) {
    this.t += dt;
    const A = this.game.audio;
    this.fire('impact', this.T.impact, () => { if (A) { A.play('impact'); A.play('swell', { dur: 9 }); A.music('north'); } });
    this.fire('horn', this.T.king - 0.6, () => {
      if (A) { A.play('horn'); A.play('impact'); A.play('swell', { dur: 8, delay: 0.4 }); }
    });
    const T = this.T;
    this.fire('voice', T.voice, () => (T.audio1 ? this.playClip(T.audio1, 'The North remembers.')
      : this.speak('north_remembers', 'The North remembers.')));
    this.fire('king', T.kingVoice, () => (T.audio2 ? this.playClip(T.audio2, 'The King in the North!')
      : this.speak('king_in_the_north', 'The King in the North!')));
    for (const [key, c, line] of [['clip1', T.clip1, 'The North remembers.'], ['clip2', T.clip2, 'The King in the North!']]) {
      if (!c) continue;
      this.fire(key, c.at, () => this.playClip(c, line));
      this.fire(key + 'end', c.at + c.dur, () => this.stopClip(c));
    }
    if (this.t >= T.done) this.done = true;
    for (const f of this.flakes) {
      f.y += f.v * dt;
      f.x += Math.sin(this.t * 0.6 + f.w) * 14 * dt - 18 * dt;
      if (f.y > VIEW.height + 10) { f.y = -10; f.x = Math.random() * VIEW.width; }
      if (f.x < -10) f.x += VIEW.width + 20;
    }
  }

  async speak(id, text) {
    const A = this.game.audio;
    if (!A) { this.voiceMode = this.voiceMode === 'clip' ? 'clip' : 'subtitles'; return; }
    this.voiceMode = await A.voice(id, text);
  }

  // Before the pull-back, drawn at the far layer's depth: the dead dragons
  // lying out on the snow beyond the Wall.
  drawFar(ctx) {
    if (this.full) return;
    const a = clamp((this.t - 0.5) / 2, 0, 0.75);
    if (a <= 0) return;
    this.silhouettes(ctx, [[320, 640, 0.2], [1180, 660, 0.24], [1640, 650, 0.18]], a, 1);
  }

  // A slain dragon: the last frame of its death, darkened to a shape.
  silhouettes(ctx, spots, alpha, k) {
    const ids = ['dragon_sunfyre', 'dragon_vermithor', 'dragon_balerion'];
    const M = this.game.assets.manifest, R = this.game.renderer;
    ids.forEach((id, i) => {
      const m = M[id];
      if (!m || !spots[i]) return;
      const [x, y, s] = spots[i];
      const img = this.game.assets.image(m.sheet_pattern.replace('{anim}', 'death'));
      const n = m.animations.death.frames;
      R.drawFrame(img, n - 1, m.frame_size[0], m.frame_size[1], x, y, m.pivot, s * k / (m.res || 1), i % 2 === 0,
                  { tint: 'rgba(8,10,18,0.92)', alpha });
    });
  }

  // The letterbox and the falling snow over the world view (first seconds).
  drawOverlay(ctx) {
    const k = clamp(this.t / 1.5, 0, 1);
    const h = 110 * k;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, VIEW.width, h);
    ctx.fillRect(0, VIEW.height - h, VIEW.width, h);
    this.snow(ctx, 0.8);
    if (this.t > this.T.pull) {                         // crossfade into the pull-back
      ctx.globalAlpha = clamp((this.t - this.T.pull) / 0.8, 0, 1);
      this.drawPanorama(ctx);
      ctx.globalAlpha = 1;
    }
  }

  snow(ctx, alpha) {
    ctx.save();
    ctx.fillStyle = `rgba(236,244,252,${alpha})`;
    for (const f of this.flakes) {
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // The camera pulls back from the warrior to the whole frozen fortress.
  drawPanorama(ctx) {
    if (!this.panImg) {                          // the panorama art is missing: say so plainly
      ctx.fillStyle = '#05070c';
      ctx.fillRect(0, 0, VIEW.width, VIEW.height);
      return;
    }
    const P = this.pan;
    const p = clamp((this.t - this.T.pull) / (this.T.pullEnd - this.T.pull), 0, 1);
    const e = p * p * (3 - 2 * p);
    const base = VIEW.width / P.size[0];                     // whole panorama on screen at the end
    const z = lerp(3.4, 1.0, e);
    const scale = base * z;
    const end = { x: P.spot[0] * base, y: P.spot[1] * base };
    const sx = lerp(VIEW.width / 2, end.x, e), sy = lerp(VIEW.height * 0.62, end.y, e);
    ctx.save();
    ctx.fillStyle = '#05070c';
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
    ctx.translate(sx, sy);
    ctx.scale(scale, scale);
    ctx.translate(-P.spot[0], -P.spot[1]);
    ctx.drawImage(this.panImg, 0, 0);
    ctx.restore();
    // the slain, dark on the snow beneath the Wall (panorama coordinates)
    const at = (x, y) => ({ x: sx + (x - P.spot[0]) * scale, y: sy + (y - P.spot[1]) * scale });
    const spots = [[820, 1770, 0.42], [2960, 1800, 0.5], [1760, 1860, 0.6]].map(([x, y, s]) => {
      const q = at(x, y);
      return [q.x, q.y, s];
    });
    this.silhouettes(ctx, spots, 0.9, scale / base * base * 2);
    // the warrior on the parapet of the gate tower, Frostbrand in hand
    const pl = this.lm.player, m = pl.sprite;
    const variant = pl.loadout.some(w => w.id === 'frostbrand') ? 'frostbrand' : pl.weapon.id;
    const img = this.game.assets.image(m.sheet_pattern.replace('{variant}', variant).replace('{anim}', 'idle'));
    const figure = 64 / 236 * PLAYER.scale * scale;           // about 64 panorama px tall
    this.game.renderer.drawFrame(img, Math.floor(this.t * 6) % m.animations.idle.frames, m.frame_size[0],
                                 m.frame_size[1], sx, sy, m.pivot, figure, false, {});
    // a faint icy glow around him
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(sx, sy - 40 * scale, 2, sx, sy - 40 * scale, 120 * scale);
    g.addColorStop(0, 'rgba(160,220,255,0.25)');
    g.addColorStop(1, 'rgba(120,200,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(sx - 120 * scale, sy - 160 * scale, 240 * scale, 240 * scale);
    ctx.restore();
  }

  drawFull(ctx) {
    const t = this.t;
    if (t < this.T.black) {
      this.drawPanorama(ctx);
      this.snow(ctx, 0.85);
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, VIEW.width, 110);
      ctx.fillRect(0, VIEW.height - 110, VIEW.width, 110);
      const fade = clamp((t - this.T.pullEnd) / (this.T.black - this.T.pullEnd), 0, 1);
      if (fade > 0) {
        ctx.fillStyle = `rgba(0,0,0,${fade})`;
        ctx.fillRect(0, 0, VIEW.width, VIEW.height);
      }
      return;
    }
    // a player-supplied clip has the whole screen while it plays
    for (const c of [this.T.clip1, this.T.clip2]) {
      if (c && t >= c.at && t < c.at + c.dur) {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, VIEW.width, VIEW.height);
        const el = c.clip.el;
        const w = el.videoWidth || el.width || 16, h = el.videoHeight || el.height || 9;
        const s = Math.min(VIEW.width / w, VIEW.height / h);
        const fade = clamp(Math.min((t - c.at) / 0.4, (c.at + c.dur - t) / 0.4), 0, 1);
        ctx.globalAlpha = fade;
        try { ctx.drawImage(el, (VIEW.width - w * s) / 2, (VIEW.height - h * s) / 2, w * s, h * s); } catch (e) { /* no frame yet */ }
        ctx.globalAlpha = 1;
        return;
      }
    }
    // black, snow, and the words
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
    this.snow(ctx, 0.55);
    const a = clamp((t - this.T.title) / 3.2, 0, 1);
    const cx = VIEW.width / 2;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // the title: wide letter-spacing that slowly closes, an icy glow
    const spacing = lerp(38, 18, a);
    this.spaced(ctx, 'THE NORTH REMEMBERS', cx, 470, `900 96px Cinzel, Georgia, serif`, spacing,
                `rgba(236,246,255,${a})`, `rgba(130,200,255,${0.85 * a})`, 34);
    const k = clamp((t - this.T.king) / 2.6, 0, 1);
    if (k > 0) {
      ctx.fillStyle = `rgba(200,170,110,${0.8 * k})`;
      ctx.fillRect(cx - 260 * k, 560, 520 * k, 2);
      this.spaced(ctx, 'THE KING IN THE NORTH', cx, 640, `700 54px Cinzel, Georgia, serif`, 14,
                  `rgba(232,200,130,${k})`, `rgba(255,190,90,${0.5 * k})`, 20);
    }
    // the spoken line, as a subtitle (and a plain report if no voice could play)
    const said = t >= this.T.voice ? clamp((t - this.T.voice) / 1, 0, 1) * clamp((this.T.voice + 4.5 - t) / 1, 0, 1) : 0;
    if (said > 0) {
      ctx.font = 'italic 30px Georgia, serif';
      ctx.fillStyle = `rgba(200,210,224,${said * 0.85})`;
      ctx.fillText('"The North remembers."', cx, 760);
    }
    if (this.voiceMode && !['file', 'muted', 'clip'].includes(this.voiceMode)) {
      ctx.font = '600 18px Cinzel, Georgia, serif';
      ctx.fillStyle = 'rgba(150,160,176,0.75)';
      ctx.fillText(this.voiceMode === 'speech' ? 'voice: the browser\'s speech voice (the recorded line could not be played)'
        : 'voice unavailable in this browser: shown as text', cx, VIEW.height - 60);
    }
    if (t > this.T.king + 1.5 && !this.done) {
      ctx.font = '600 18px Cinzel, Georgia, serif';
      ctx.fillStyle = `rgba(160,170,186,${0.5 + 0.3 * Math.sin(t * 3)})`;
      ctx.fillText('Enter', cx, VIEW.height - 110);
    }
    ctx.restore();
  }

  // Text drawn letter by letter with custom spacing, with a glow.
  spaced(ctx, str, cx, y, font, spacing, fill, glow, blur) {
    ctx.font = font;
    const widths = [...str].map(ch => ctx.measureText(ch).width);
    const total = widths.reduce((s, w) => s + w, 0) + spacing * (str.length - 1);
    let x = cx - total / 2;
    ctx.shadowColor = glow;
    ctx.shadowBlur = blur;
    ctx.fillStyle = fill;
    ctx.textAlign = 'left';
    [...str].forEach((ch, i) => {
      ctx.fillText(ch, x, y);
      x += widths[i] + spacing;
    });
    ctx.shadowBlur = 0;
    ctx.textAlign = 'center';
  }
}
