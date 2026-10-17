// All game sound, synthesized live with the Web Audio API: dragon roars,
// fire, ice, steel, the Frostpiercer, impacts, and a procedural score with
// a theme per boss. Nothing is sampled except the game's own voice lines
// (assets/audio/*.wav, made by tools/voice_lines.py): the two of the Level 7
// ending, which fall back to the browser's speech synthesis, and failing that
// to subtitles, with the fallback reported on screen and in the console; and
// the "Dracarys!" commands heard before dragon fire.
//
// CUES are the game's own sound for each clip slot (core/Clips.js): a clip
// the player adds to assets/media replaces it (Game.cue).
//
// Every call is safe without audio: if the browser has no AudioContext,
// or it has not been unlocked by a key press yet, calls do nothing.

const NOTE = n => 440 * Math.pow(2, (n - 69) / 12);     // MIDI note -> Hz
const MUSIC_BUS = 0.4;                                    // the score's level under the sound effects

// The built-in sound of each clip slot. Each returns true if it sounded.
export const CUES = {
  dracarys: (A, o) => A.line('dracarys', o),                     // a rider's cry: Rhagal, Drogon, Viserion
  vhagar_fire: (A, o) => A.line('dracarys_aemond', o),           // Aemond to Vhagar
  player_death: A => { A.music(null); A.play('fallen'); return A.ready && !A.muted; },
};

// Procedural themes. `scale` is in semitones from `root` (a MIDI note).
// `motif` steps are [scale degree, beats], `null` degree = rest.
export const THEMES = {
  explore: { tempo: 56, root: 38, scale: [0, 2, 3, 5, 7, 8, 10], drone: [0, 7], pad: [0, 3, 7], drums: [],
             motif: [[0, 4], [2, 2], [3, 2], [4, 6], [null, 2], [3, 2], [2, 2], [0, 8]], lead: 'flute', level: 0.5 },
  battle: { tempo: 96, root: 38, scale: [0, 2, 3, 5, 7, 8, 10], drone: [0, 7], pad: [0, 3, 7], drums: [1, 0, 0.5, 0, 1, 0, 0.6, 0.4],
            motif: [[0, 1], [0, 1], [3, 1], [4, 1], [5, 2], [4, 2], [3, 1], [2, 1], [0, 2], [null, 4]], lead: 'brass', level: 0.7 },
  sunfyre: { tempo: 108, root: 40, scale: [0, 2, 3, 5, 7, 9, 10], drone: [0, 7], pad: [0, 4, 7], drums: [1, 0, 0.4, 0.5, 0.9, 0, 0.5, 0],
             motif: [[4, 1], [5, 1], [7, 2], [6, 1], [4, 1], [2, 2], [4, 1], [5, 1], [4, 1], [2, 1], [0, 4]], lead: 'brass', level: 0.7 },
  vermithor: { tempo: 84, root: 36, scale: [0, 1, 3, 5, 7, 8, 10], drone: [0, 7], pad: [0, 3, 7], drums: [1, 0, 0, 0.7, 1, 0, 0.4, 0],
               motif: [[0, 1], [1, 1], [0, 1], [-2, 1], [0, 2], [3, 2], [1, 1], [0, 1], [-2, 2], [null, 4]], lead: 'low', level: 0.75 },
  balerion: { tempo: 70, root: 35, scale: [0, 1, 3, 5, 6, 8, 10], drone: [0, 6, 12], pad: [0, 3, 6], drums: [1, 0, 0, 0, 0.8, 0, 0.6, 0.3],
              motif: [[0, 2], [1, 2], [0, 1], [-1, 1], [-2, 2], [4, 3], [3, 1], [1, 4], [null, 4]], lead: 'choir', level: 0.8 },
  aegon: { tempo: 126, root: 40, scale: [0, 2, 3, 5, 7, 8, 11], drone: [0, 7], pad: [0, 3, 7], drums: [1, 0.3, 0.6, 0.3, 1, 0.3, 0.6, 0.6],
           motif: [[0, 0.5], [2, 0.5], [3, 0.5], [4, 0.5], [6, 1], [4, 0.5], [3, 0.5], [2, 1], [0, 1], [4, 0.5], [3, 0.5], [2, 0.5], [1, 0.5], [0, 2]],
           lead: 'strings', level: 0.8, bus: 0.5 },
  ending: { tempo: 48, root: 38, scale: [0, 2, 3, 5, 7, 8, 10], drone: [0, 7], pad: [0, 3, 7, 10], drums: [],
            motif: [[0, 6], [null, 2], [3, 4], [2, 4], [0, 8]], lead: 'flute', level: 0.55 },
  // THE NORTH REMEMBERS / THE KING IN THE NORTH: the anthem under the titles (brass and choir, war drums)
  north: { tempo: 66, root: 38, scale: [0, 2, 3, 5, 7, 8, 10], drone: [0, 7, 12], pad: [0, 3, 7, 10],
           drums: [1, 0, 0, 0, 0.55, 0, 0.8, 0.45],
           motif: [[0, 2], [3, 1], [4, 1], [5, 2], [4, 1], [3, 1], [4, 3], [null, 1], [7, 2], [5, 1], [4, 1], [3, 2], [2, 1],
                   [0, 1], [-1, 2], [0, 4], [null, 2]],
           lead: 'anthem', level: 1.0, bus: 0.62 },
};

export class Audio {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.supported = !!(window.AudioContext || window.webkitAudioContext);
    this.theme = null;
    this.voiceBuffers = {};
    this.voiceStatus = {};           // id -> 'file' | 'speech' | 'subtitles'
    this.lineUntil = {};             // id -> time a short line may sound again
    this.musicLevel = MUSIC_BUS;
    this.listenerX = 960;
    this.onReport = null;            // (message) => void, for visible fallback notices
    if (!this.supported) console.warn('Audio: Web Audio is not available in this browser; the game runs silent.');
    const unlock = () => this.unlock();
    window.addEventListener('keydown', unlock);
    window.addEventListener('pointerdown', unlock);
  }

  // Browsers only allow sound after a user gesture.
  unlock() {
    if (!this.supported) return;
    try {
      if (!this.ctx) this.build();
      if (this.ctx.state === 'suspended') this.ctx.resume();
    } catch (e) {
      console.warn('Audio: could not start', e);
      this.supported = false;
    }
  }

  build() {
    const AC = window.AudioContext || window.webkitAudioContext;
    const ctx = this.ctx = new AC();
    this.master = ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.9;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16;
    comp.ratio.value = 4;
    this.master.connect(comp);
    comp.connect(ctx.destination);
    this.sfxBus = ctx.createGain();
    this.sfxBus.gain.value = 0.9;
    this.sfxBus.connect(this.master);
    this.musicBus = ctx.createGain();
    this.musicBus.gain.value = this.musicLevel;
    this.musicBus.connect(this.master);
    this.voiceBus = ctx.createGain();
    this.voiceBus.gain.value = 1.1;
    this.voiceBus.connect(this.master);
    // a hall reverb shared by the score and the big sounds
    this.verb = ctx.createConvolver();
    this.verb.buffer = this.impulse(3.2, 2.4);
    const verbOut = ctx.createGain();
    verbOut.gain.value = 0.35;
    this.verb.connect(verbOut);
    verbOut.connect(this.master);
    const len = ctx.sampleRate * 2;
    this.noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = this.noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    if (this.pendingTheme) { const t = this.pendingTheme; this.pendingTheme = null; this.music(t); }
    for (const id of Object.keys(this.voiceBuffers)) this.decode(id);
  }

  // Voice files are decoded as soon as there is an audio context (lines must start at once).
  async decode(id) {
    const raw = this.voiceBuffers[id];
    if (!this.ctx || !raw || raw instanceof AudioBuffer || raw.decoding) return;
    raw.decoding = true;
    try {
      this.voiceBuffers[id] = await this.ctx.decodeAudioData(raw.slice(0));
    } catch (e) {
      raw.decoding = false;
      console.warn(`Audio: voice ${id} could not be decoded`, e);
    }
  }

  impulse(sec, decay) {
    const ctx = this.ctx, n = Math.floor(ctx.sampleRate * sec);
    const buf = ctx.createBuffer(2, n, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, decay);
    }
    return buf;
  }

  setMuted(m) {
    this.muted = !!m;
    if (this.master) this.master.gain.setTargetAtTime(this.muted ? 0 : 0.9, this.ctx.currentTime, 0.05);
    if (this.muted && window.speechSynthesis) window.speechSynthesis.cancel();
  }

  get ready() { return !!(this.ctx && this.ctx.state === 'running'); }

  // ---------------------------------------------------------------- helpers
  now() { return this.ctx.currentTime; }

  // A gain envelope node: attack to `peak`, hold, exponential release.
  env(t, a, hold, r, peak = 1) {
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + Math.max(0.005, a));
    g.gain.setValueAtTime(Math.max(0.0002, peak), t + a + hold);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + hold + r);
    return g;
  }

  out(x, gain = 1, bus = this.sfxBus, wet = 0) {
    const ctx = this.ctx;
    const g = ctx.createGain();
    let pan = 0, att = 1;
    if (x !== undefined && x !== null) {
      const dx = x - this.listenerX;
      pan = Math.max(-0.8, Math.min(0.8, dx / 1100));
      att = 1 / (1 + Math.max(0, Math.abs(dx) - 900) / 1400);
    }
    g.gain.value = gain * att;
    if (ctx.createStereoPanner) {
      const p = ctx.createStereoPanner();
      p.pan.value = pan;
      g.connect(p);
      p.connect(bus);
      if (wet) { const w = ctx.createGain(); w.gain.value = wet; p.connect(w); w.connect(this.verb); }
    } else {
      g.connect(bus);
    }
    return g;
  }

  noise(t, dur) {
    const s = this.ctx.createBufferSource();
    s.buffer = this.noiseBuf;
    s.loop = true;
    s.start(t, Math.random() * 1.5);
    s.stop(t + dur + 0.05);
    return s;
  }

  osc(type, f, t, dur) {
    const o = this.ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    o.start(t);
    o.stop(t + dur + 0.05);
    return o;
  }

  filter(type, f, q = 1) {
    const b = this.ctx.createBiquadFilter();
    b.type = type;
    b.frequency.value = f;
    b.Q.value = q;
    return b;
  }

  drive(k = 20) {
    const ws = this.ctx.createWaveShaper();
    const n = 512, curve = new Float32Array(n);
    for (let i = 0; i < n; i++) { const x = (i / (n - 1)) * 2 - 1; curve[i] = Math.tanh(x * k) / Math.tanh(k); }
    ws.curve = curve;
    return ws;
  }

  // ---------------------------------------------------------------- sound effects
  // play('roar', { x, size, pitch }) ... `x` = world x for stereo placement.
  play(name, o = {}) {
    if (!this.ready || this.muted) return;
    const fn = SFX[name];
    if (!fn) return;
    try { fn(this, this.now() + (o.delay || 0), o); } catch (e) { /* a sound must never break the game */ }
  }

  // ---------------------------------------------------------------- music
  music(id) {
    if (!this.ctx) { this.pendingTheme = id; return; }
    if (this.theme && this.theme.id === id) return;
    const ctx = this.ctx, t = ctx.currentTime;
    // some themes ride higher over the effects (the duel, the ending's anthem)
    this.musicLevel = (THEMES[id] && THEMES[id].bus) || MUSIC_BUS;
    this.musicBus.gain.setTargetAtTime(this.musicLevel, t, 0.8);
    if (this.theme) {
      const old = this.theme;
      old.gain.gain.setTargetAtTime(0.0001, t, 0.8);
      clearInterval(old.timer);
      setTimeout(() => { try { old.gain.disconnect(); } catch (e) { /* gone */ } }, 4000);
      this.theme = null;
    }
    const spec = THEMES[id];
    if (!spec) return;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(spec.level, t + 2.5);
    gain.connect(this.musicBus);
    const wet = ctx.createGain();
    wet.gain.value = 0.6;
    gain.connect(wet);
    wet.connect(this.verb);
    const th = { id, spec, gain, beat: 60 / spec.tempo, next: t + 0.1, step: 0, motifI: 0, motifT: 0, bar: 0 };
    th.timer = setInterval(() => this.schedule(th), 100);
    this.theme = th;
    this.schedule(th);
  }

  // Look-ahead scheduler: queues the next 0.4 s of drums, drone, pad and melody.
  schedule(th) {
    if (!this.ctx || this.theme !== th) return;
    const ctx = this.ctx, sp = th.spec, ahead = ctx.currentTime + 0.4;
    while (th.next < ahead) {
      const t = th.next, step = th.step;
      const half = th.beat / 2;
      if (sp.drums.length) {
        const v = sp.drums[step % sp.drums.length];
        if (v) MUSIC.drum(this, th, t, v);
      }
      if (step % 16 === 0) {                                   // every two bars: drone and pad
        MUSIC.drone(this, th, t, th.beat * 8);
        MUSIC.pad(this, th, t, th.beat * 8, th.bar);
        th.bar++;
      }
      if (th.motifT <= 0) {
        const [deg, beats] = sp.motif[th.motifI % sp.motif.length];
        th.motifI++;
        th.motifT = beats * 2;
        if (deg !== null) MUSIC.lead(this, th, t, deg, beats * th.beat);
      }
      th.motifT--;
      th.step++;
      th.next += half;
    }
  }

  // ---------------------------------------------------------------- voice
  // Loads the game's voice lines (assets/audio); reports what is missing.
  async loadVoices(base, list) {
    for (const [id, file] of Object.entries(list)) {
      try {
        const r = await fetch(base + file);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        this.voiceBuffers[id] = await r.arrayBuffer();
        this.voiceStatus[id] = 'file';
        this.decode(id);
      } catch (e) {
        this.voiceStatus[id] = window.speechSynthesis ? 'speech' : 'subtitles';
        console.warn(`Audio: voice file ${file} could not be loaded (${e.message}); using ${this.voiceStatus[id]}.`);
      }
    }
  }

  // A short line in the fight ("Dracarys!"), placed at world x. It never talks
  // over itself and waits `gap` s after it ends. True if it started.
  line(id, { x = null, gap = 2.5, gain = 1 } = {}) {
    if (!this.ready || this.muted) return false;
    const buf = this.voiceBuffers[id];
    if (!(buf instanceof AudioBuffer)) { this.decode(id); return false; }
    const now = this.ctx.currentTime;
    if (now < (this.lineUntil[id] || 0)) return false;
    this.lineUntil[id] = now + buf.duration + gap;
    const s = this.ctx.createBufferSource();
    s.buffer = buf;
    s.connect(this.out(x, gain, this.voiceBus, 0.3));
    s.start(now);
    return true;
  }

  // Plays a voice line. Returns how it was delivered: 'file', 'speech', 'subtitles' or 'muted'.
  async voice(id, text) {
    if (this.muted) return 'muted';
    if (this.ctx && this.voiceBuffers[id]) {
      try {
        const raw = this.voiceBuffers[id];
        const buf = raw instanceof AudioBuffer ? raw : await this.ctx.decodeAudioData(raw.slice(0));
        this.voiceBuffers[id] = buf;
        const s = this.ctx.createBufferSource();
        s.buffer = buf;
        const g = this.ctx.createGain();
        g.gain.value = 1;
        s.connect(g);
        g.connect(this.voiceBus);
        const w = this.ctx.createGain();
        w.gain.value = 0.5;
        g.connect(w);
        w.connect(this.verb);
        s.start();
        return 'file';
      } catch (e) {
        console.warn('Audio: voice file could not be decoded; falling back to speech synthesis.', e);
      }
    }
    if (window.speechSynthesis && window.SpeechSynthesisUtterance) {
      const u = new SpeechSynthesisUtterance(text);
      u.pitch = 0.3;
      u.rate = 0.62;
      u.volume = 1;
      const voices = window.speechSynthesis.getVoices();
      const male = voices.find(v => /en/i.test(v.lang) && /male|david|george|daniel|james|guy/i.test(v.name));
      if (male) u.voice = male;
      window.speechSynthesis.speak(u);
      this.report(`Voice line "${text}" uses the browser's speech voice (recorded file unavailable).`);
      return 'speech';
    }
    this.report(`Voice line "${text}" is shown as a subtitle only (no voice available in this browser).`);
    return 'subtitles';
  }

  report(msg) {
    console.warn('Audio fallback:', msg);
    if (this.onReport) this.onReport(msg);
  }
}

// ---------------------------------------------------------------- recipes
// Each takes (audio, start time, options).
const SFX = {
  // A dragon's roar: a throaty sawtooth glide through a growl filter, a
  // breath of noise and a sub-bass rumble. `size` 0..1 deepens and
  // lengthens it, `pitch` shifts it (Sunfyre high, Balerion very low).
  roar(A, t, o) {
    const ctx = A.ctx, size = o.size ?? 0.6, p = o.pitch ?? 1;
    const dur = 1.1 + size * 1.3;
    const out = A.out(o.x, 0.55 * (o.gain ?? 1), A.sfxBus, 0.5);
    const e = A.env(t, 0.12, dur * 0.45, dur * 0.55, 1);
    e.connect(out);
    const f0 = (150 - size * 80) * p;
    const saw = A.osc('sawtooth', f0 * 1.25, t, dur);
    saw.frequency.exponentialRampToValueAtTime(f0, t + dur * 0.4);
    saw.frequency.exponentialRampToValueAtTime(f0 * 0.7, t + dur);
    const saw2 = A.osc('sawtooth', f0 * 1.27, t, dur);
    saw2.frequency.exponentialRampToValueAtTime(f0 * 1.01, t + dur * 0.4);
    saw2.frequency.exponentialRampToValueAtTime(f0 * 0.69, t + dur);
    const growl = ctx.createGain();
    growl.gain.value = 0.7;
    const lfo = A.osc('sine', 22 + 10 * (1 - size), t, dur);
    const lg = ctx.createGain();
    lg.gain.value = 0.35;
    lfo.connect(lg);
    lg.connect(growl.gain);
    const lp = A.filter('lowpass', 900 * p + 300, 2);
    lp.frequency.setValueAtTime(500 * p, t);
    lp.frequency.linearRampToValueAtTime(1500 * p, t + dur * 0.3);
    lp.frequency.linearRampToValueAtTime(400 * p, t + dur);
    const dr = A.drive(6);
    saw.connect(growl); saw2.connect(growl);
    growl.connect(dr); dr.connect(lp); lp.connect(e);
    const n = A.noise(t, dur);
    const bp = A.filter('bandpass', 700 * p, 1.2);
    bp.frequency.setValueAtTime(400 * p, t);
    bp.frequency.linearRampToValueAtTime(1100 * p, t + dur * 0.35);
    bp.frequency.linearRampToValueAtTime(300 * p, t + dur);
    const ng = ctx.createGain();
    ng.gain.value = 0.5;
    n.connect(bp); bp.connect(ng); ng.connect(e);
    const sub = A.osc('sine', 52 * p, t, dur);
    sub.frequency.exponentialRampToValueAtTime(38 * p, t + dur);
    const sg = ctx.createGain();
    sg.gain.value = 0.6 * size;
    sub.connect(sg); sg.connect(e);
  },
  // Sunfyre's high, ringing scream before a dive.
  screech(A, t, o) {
    const p = o.pitch ?? 1, dur = 0.9;
    const out = A.out(o.x, 0.32, A.sfxBus, 0.5);
    const e = A.env(t, 0.05, 0.3, 0.55, 1);
    e.connect(out);
    for (const det of [1, 1.012, 0.497]) {
      const s = A.osc('sawtooth', 520 * p * det, t, dur);
      s.frequency.exponentialRampToValueAtTime(820 * p * det, t + 0.25);
      s.frequency.exponentialRampToValueAtTime(380 * p * det, t + dur);
      const bp = A.filter('bandpass', 1400 * p, 3);
      s.connect(bp); bp.connect(e);
    }
  },
  bite(A, t, o) {
    const out = A.out(o.x, 0.5);
    const e = A.env(t, 0.003, 0.02, 0.12, 1);
    e.connect(out);
    const n = A.noise(t, 0.2);
    const hp = A.filter('highpass', 1800, 0.7);
    n.connect(hp); hp.connect(e);
    SFX.thump(A, t + 0.01, { x: o.x, f: 110, gain: 0.5 });
  },
  thump(A, t, o) {
    const out = A.out(o.x, o.gain ?? 0.6);
    const e = A.env(t, 0.004, 0.02, o.len ?? 0.25, 1);
    e.connect(out);
    const s = A.osc('sine', (o.f ?? 120) * 1.6, t, 0.4);
    s.frequency.exponentialRampToValueAtTime(o.f ?? 120, t + 0.06);
    s.frequency.exponentialRampToValueAtTime((o.f ?? 120) * 0.45, t + 0.3);
    s.connect(e);
  },
  wing(A, t, o) {
    const out = A.out(o.x, 0.28 * (o.gain ?? 1));
    const e = A.env(t, 0.08, 0.05, 0.3, 1);
    e.connect(out);
    const n = A.noise(t, 0.5);
    const bp = A.filter('bandpass', 380, 0.9);
    bp.frequency.setValueAtTime(260, t);
    bp.frequency.linearRampToValueAtTime(620, t + 0.12);
    bp.frequency.linearRampToValueAtTime(220, t + 0.42);
    n.connect(bp); bp.connect(e);
  },
  // Dragon fire: a roaring wash of filtered noise with crackle, `dur` long.
  fire(A, t, o) {
    const ctx = A.ctx, dur = o.dur ?? 1.2;
    const out = A.out(o.x, 0.42 * (o.gain ?? 1), A.sfxBus, 0.3);
    const e = A.env(t, 0.1, Math.max(0, dur - 0.3), 0.45, 1);
    e.connect(out);
    const n = A.noise(t, dur + 0.5);
    const lp = A.filter('lowpass', o.ice ? 2600 : 1100, 0.6);
    const hp = A.filter('highpass', o.ice ? 600 : 120, 0.5);
    n.connect(hp); hp.connect(lp); lp.connect(e);
    const rumble = A.noise(t, dur + 0.5);
    const rl = A.filter('lowpass', 180, 0.8);
    const rg = ctx.createGain();
    rg.gain.value = 0.8;
    rumble.connect(rl); rl.connect(rg); rg.connect(e);
    for (let k = 0; k < dur * 14; k++) {                    // crackle
      const tk = t + Math.random() * dur;
      const ce = A.env(tk, 0.001, 0.004, 0.03, 0.4 + Math.random() * 0.5);
      ce.connect(out);
      const cn = A.noise(tk, 0.05);
      const chp = A.filter('highpass', o.ice ? 5000 : 2500, 1);
      cn.connect(chp); chp.connect(ce);
    }
  },
  fireball(A, t, o) {
    const out = A.out(o.x, 0.3);
    const e = A.env(t, 0.05, 0.15, 0.35, 1);
    e.connect(out);
    const n = A.noise(t, 0.6);
    const bp = A.filter('bandpass', 500, 1);
    bp.frequency.setValueAtTime(300, t);
    bp.frequency.exponentialRampToValueAtTime(1400, t + 0.5);
    n.connect(bp); bp.connect(e);
  },
  // A heavy impact: a falling sub thud and a burst of low noise.
  boom(A, t, o) {
    const size = o.size ?? 0.6;
    const out = A.out(o.x, 0.6 * (o.gain ?? 1), A.sfxBus, 0.4);
    const e = A.env(t, 0.004, 0.05, 0.5 + size * 0.9, 1);
    e.connect(out);
    const s = A.osc('sine', 130, t, 1.6);
    s.frequency.exponentialRampToValueAtTime(34, t + 0.5 + size * 0.5);
    s.connect(e);
    const n = A.noise(t, 1.4);
    const lp = A.filter('lowpass', 500 + 400 * (1 - size), 0.7);
    lp.frequency.exponentialRampToValueAtTime(90, t + 1.0);
    n.connect(lp); lp.connect(e);
  },
  shock(A, t, o) {
    const out = A.out(o.x, 0.4);
    const e = A.env(t, 0.05, 0.4, 0.6, 1);
    e.connect(out);
    const n = A.noise(t, 1.2);
    const lp = A.filter('lowpass', 220, 1.2);
    n.connect(lp); lp.connect(e);
    const s = A.osc('sawtooth', 48, t, 1.2);
    const sl = A.filter('lowpass', 140, 1);
    s.connect(sl); sl.connect(e);
  },
  swing(A, t, o) {
    const out = A.out(o.x, 0.22 * (o.gain ?? 1));
    const e = A.env(t, 0.03, 0.03, 0.12, 1);
    e.connect(out);
    const n = A.noise(t, 0.25);
    const bp = A.filter('bandpass', 900, 1.6);
    bp.frequency.setValueAtTime(o.heavy ? 380 : 700, t);
    bp.frequency.exponentialRampToValueAtTime(o.heavy ? 1300 : 2800, t + 0.14);
    n.connect(bp); bp.connect(e);
  },
  hit(A, t, o) {
    const out = A.out(o.x, 0.42 * (o.gain ?? 1));
    const e = A.env(t, 0.002, 0.02, 0.14, 1);
    e.connect(out);
    const n = A.noise(t, 0.2);
    const bp = A.filter('bandpass', 1200, 0.8);
    n.connect(bp); bp.connect(e);
    SFX.thump(A, t, { x: o.x, f: 150, gain: 0.45, len: 0.18 });
  },
  // Steel on steel / plate / a parry: inharmonic ringing partials.
  clang(A, t, o) {
    const out = A.out(o.x, 0.26 * (o.gain ?? 1), A.sfxBus, 0.4);
    const base = o.f ?? 520;
    for (const [m, g, d] of [[1, 1, 0.9], [2.43, 0.6, 0.6], [4.44, 0.4, 0.45], [6.1, 0.25, 0.3]]) {
      const e = A.env(t, 0.001, 0.005, d, g);
      e.connect(out);
      A.osc('sine', base * m, t, d + 0.1).connect(e);
    }
    const ne = A.env(t, 0.001, 0.003, 0.04, 0.7);
    ne.connect(out);
    const n = A.noise(t, 0.08);
    const hp = A.filter('highpass', 3000, 0.7);
    n.connect(hp); hp.connect(ne);
  },
  // Ice: a crisp crack and a glassy ring.
  ice(A, t, o) {
    const out = A.out(o.x, 0.3 * (o.gain ?? 1), A.sfxBus, 0.5);
    const ne = A.env(t, 0.001, 0.01, 0.12, 1);
    ne.connect(out);
    const n = A.noise(t, 0.2);
    const hp = A.filter('highpass', 2600, 0.8);
    n.connect(hp); hp.connect(ne);
    for (const f of [1760, 2349, 3136, 4186]) {
      const e = A.env(t + 0.01, 0.002, 0.01, 0.5 + Math.random() * 0.4, 0.35);
      e.connect(out);
      A.osc('sine', f * (0.98 + Math.random() * 0.04), t, 1.2).connect(e);
    }
  },
  shatter(A, t, o) {
    for (let k = 0; k < 9; k++) SFX.ice(A, t + k * 0.025 + Math.random() * 0.02, { x: o.x, gain: 0.6 });
    SFX.boom(A, t, { x: o.x, size: 0.2, gain: 0.5 });
  },
  // Frostbrand's ice ward: a shimmering chord.
  ward(A, t, o) {
    const out = A.out(o.x, 0.18, A.sfxBus, 0.7);
    for (const f of [880, 1318.5, 1760, 2637]) {
      const e = A.env(t, 0.06, 0.25, 0.8, 0.5);
      e.connect(out);
      const s = A.osc('sine', f, t, 1.3);
      s.frequency.linearRampToValueAtTime(f * 1.004, t + 1.2);
      s.connect(e);
    }
  },
  // Frostpiercer
  deploy(A, t, o) {
    const out = A.out(o.x, 0.25);
    const e = A.env(t, 0.03, 0.25, 0.1, 1);
    e.connect(out);
    const s = A.osc('sawtooth', 240, t, 0.45);
    s.frequency.exponentialRampToValueAtTime(520, t + 0.35);
    const lp = A.filter('lowpass', 900, 3);
    s.connect(lp); lp.connect(e);
    SFX.clang(A, t + 0.38, { x: o.x, f: 300, gain: 0.8 });
  },
  launch(A, t, o) {
    SFX.thump(A, t, { x: o.x, f: 70, gain: 0.8, len: 0.35 });
    SFX.clang(A, t, { x: o.x, f: 240, gain: 0.7 });
    const out = A.out(o.x, 0.35, A.sfxBus, 0.3);
    const e = A.env(t, 0.01, 0.05, 0.4, 1);
    e.connect(out);
    const n = A.noise(t, 0.5);
    const bp = A.filter('bandpass', 1600, 1.4);
    bp.frequency.exponentialRampToValueAtTime(400, t + 0.45);
    n.connect(bp); bp.connect(e);
    SFX.ice(A, t + 0.02, { x: o.x, gain: 0.7 });
  },
  reload(A, t, o) {
    const len = o.dur ?? 2.2;
    SFX.clang(A, t + 0.15, { x: o.x, f: 330, gain: 0.5 });
    for (let k = 0; k < 6; k++) SFX.clang(A, t + len * 0.35 + k * 0.07, { x: o.x, f: 900, gain: 0.25 });
    SFX.clang(A, t + len * 0.92, { x: o.x, f: 260, gain: 0.8 });
    SFX.ice(A, t + len * 0.94, { x: o.x, gain: 0.5 });
  },
  // Frostpiercer charging: a rising hum (call with a short dur, repeatedly)
  charge(A, t, o) {
    const out = A.out(o.x, 0.08 + 0.1 * (o.k ?? 0));
    const e = A.env(t, 0.02, 0.08, 0.08, 1);
    e.connect(out);
    const f = 180 + 700 * (o.k ?? 0);
    const s = A.osc('sawtooth', f, t, 0.2);
    const s2 = A.osc('sine', f * 2.01, t, 0.2);
    const bp = A.filter('bandpass', f * 2, 4);
    s.connect(bp); s2.connect(bp); bp.connect(e);
  },
  roll(A, t, o) {
    const out = A.out(o.x, 0.16);
    const e = A.env(t, 0.03, 0.12, 0.15, 1);
    e.connect(out);
    const n = A.noise(t, 0.35);
    const lp = A.filter('lowpass', 700, 0.7);
    n.connect(lp); lp.connect(e);
  },
  hurt(A, t, o) {
    SFX.thump(A, t, { x: o.x, f: 90, gain: 0.5, len: 0.3 });
    const out = A.out(o.x, 0.18);
    const e = A.env(t, 0.01, 0.06, 0.18, 1);
    e.connect(out);
    const s = A.osc('sawtooth', 160, t, 0.3);
    s.frequency.exponentialRampToValueAtTime(90, t + 0.25);
    const bp = A.filter('bandpass', 500, 2);
    s.connect(bp); bp.connect(e);
  },
  gate(A, t, o) {
    SFX.boom(A, t, { x: o.x, size: 0.5 });
    SFX.clang(A, t, { x: o.x, f: 180, gain: 1 });
  },
  thunder(A, t, o) {
    const out = A.out(null, 0.5, A.sfxBus, 0.6);
    const e = A.env(t + 0.1, 0.05, 0.6, 2.4, 1);
    e.connect(out);
    const n = A.noise(t, 3.5);
    const lp = A.filter('lowpass', 420, 0.6);
    lp.frequency.exponentialRampToValueAtTime(90, t + 3);
    n.connect(lp); lp.connect(e);
  },
  reward(A, t, o) {
    const out = A.out(null, 0.16, A.sfxBus, 0.6);
    [72, 76, 79, 84].forEach((n, i) => {
      const e = A.env(t + i * 0.11, 0.01, 0.12, 0.9, 0.8);
      e.connect(out);
      A.osc('triangle', NOTE(n), t + i * 0.11, 1.2).connect(e);
    });
  },
  ui(A, t) {
    const out = A.out(null, 0.08);
    const e = A.env(t, 0.002, 0.01, 0.08, 1);
    e.connect(out);
    A.osc('triangle', 880, t, 0.12).connect(e);
  },
  // The North's war horn: a long low call, a rising fifth, over the anthem.
  horn(A, t, o) {
    const out = A.out(null, o.gain ?? 0.34, A.sfxBus, 0.8);
    for (const [n, at, dur] of [[38, 0, 1.6], [45, 1.4, 2.6]]) {
      const e = A.env(t + at, 0.18, dur - 0.6, 0.9, 1);
      e.connect(out);
      const lp = A.filter('lowpass', 520, 1.4);
      lp.frequency.setValueAtTime(380, t + at);
      lp.frequency.linearRampToValueAtTime(900, t + at + 0.5);
      lp.connect(e);
      for (const det of [-7, 0, 7]) {
        const s = A.osc('sawtooth', NOTE(n), t + at, dur);
        s.detune.setValueAtTime(det - 40, t + at);
        s.detune.linearRampToValueAtTime(det, t + at + 0.16);    // the lip bends up into the note
        s.connect(lp);
      }
    }
  },
  // The warrior has fallen: a funeral bell tolls twice over a low choir.
  fallen(A, t) {
    const out = A.out(null, 0.42, A.sfxBus, 0.9);
    for (const [at, v] of [[0, 1], [2.3, 0.7]]) {
      for (const [ratio, g, dec] of [[1, 1, 4.2], [2.01, 0.5, 3], [2.76, 0.35, 2.4], [4.07, 0.22, 1.6], [5.43, 0.12, 1.1]]) {
        const e = A.env(t + at, 0.004, 0.02, dec, g * v * 0.5);
        e.connect(out);
        A.osc('sine', 98 * ratio, t + at, dec + 0.2).connect(e);
      }
    }
    const ch = A.env(t + 0.2, 1.4, 2.2, 2.6, 0.5);              // D minor, low voices
    ch.connect(out);
    const lp = A.filter('lowpass', 900, 0.7);
    lp.connect(ch);
    for (const n of [50, 53, 57]) {
      for (const det of [-8, 8]) {
        const s = A.osc('sawtooth', NOTE(n), t + 0.2, 6.4);
        s.detune.value = det;
        const vg = A.ctx.createGain();
        vg.gain.value = 0.16;
        s.connect(vg); vg.connect(lp);
      }
    }
    for (const f of [500, 820]) {
      const n = A.noise(t + 0.2, 6.2);
      const bp = A.filter('bandpass', f, 10);
      n.connect(bp); bp.connect(lp);
    }
  },
  // The ending: a deep low-frequency impact and a restrained orchestral swell.
  impact(A, t) {
    const out = A.out(null, 0.9, A.sfxBus, 0.8);
    const e = A.env(t, 0.005, 0.2, 3.5, 1);
    e.connect(out);
    const s = A.osc('sine', 62, t, 4);
    s.frequency.exponentialRampToValueAtTime(30, t + 2.5);
    s.connect(e);
    const n = A.noise(t, 2);
    const lp = A.filter('lowpass', 300, 0.7);
    lp.frequency.exponentialRampToValueAtTime(60, t + 1.6);
    n.connect(lp); lp.connect(e);
  },
  swell(A, t, o) {
    const dur = o.dur ?? 7;
    const out = A.out(null, 0.2, A.musicBus, 0.9);
    const g = A.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(1, t + dur * 0.55);
    g.gain.setValueAtTime(1, t + dur * 0.7);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    g.connect(out);
    const lp = A.filter('lowpass', 300, 0.8);
    lp.frequency.setValueAtTime(260, t);
    lp.frequency.exponentialRampToValueAtTime(2600, t + dur * 0.6);
    lp.frequency.exponentialRampToValueAtTime(700, t + dur);
    lp.connect(g);
    for (const n of [26, 38, 45, 50, 53, 57, 62]) {           // D minor across five octaves
      for (const det of [-6, 6]) {
        const s = A.osc('sawtooth', NOTE(n), t, dur);
        s.detune.value = det;
        const vg = A.ctx.createGain();
        vg.gain.value = n < 40 ? 0.22 : 0.12;
        s.connect(vg); vg.connect(lp);
      }
    }
    // a wordless choir: noise through vowel formants
    for (const f of [650, 1080]) {
      const n = A.noise(t, dur);
      const bp = A.filter('bandpass', f, 9);
      const vg = A.ctx.createGain();
      vg.gain.value = 0.5;
      n.connect(bp); bp.connect(vg); vg.connect(lp);
    }
  },
};

// The score's instruments.
const MUSIC = {
  freq(th, deg, oct = 0) {
    const sc = th.spec.scale, n = sc.length;
    const o = Math.floor(deg / n);
    const idx = ((deg % n) + n) % n;
    return NOTE(th.spec.root + 12 * (o + oct) + sc[idx]);
  },
  drum(A, th, t, v) {
    const e = A.env(t, 0.003, 0.02, 0.5, v);
    e.connect(th.gain);
    const s = A.osc('sine', 110, t, 0.6);
    s.frequency.exponentialRampToValueAtTime(42, t + 0.25);
    s.connect(e);
    const ne = A.env(t, 0.002, 0.01, 0.12, v * 0.35);
    ne.connect(th.gain);
    const n = A.noise(t, 0.2);
    const lp = A.filter('lowpass', 900, 0.8);
    n.connect(lp); lp.connect(ne);
  },
  drone(A, th, t, dur) {
    for (const d of th.spec.drone) {
      const e = A.env(t, 1.2, dur - 2.2, 1.6, 0.18);
      e.connect(th.gain);
      const f = MUSIC.freq(th, 0, -1) * Math.pow(2, d / 12);
      for (const det of [-5, 5]) {
        const s = A.osc('sawtooth', f, t, dur + 0.5);
        s.detune.value = det;
        const lp = A.filter('lowpass', 380, 0.7);
        s.connect(lp); lp.connect(e);
      }
    }
  },
  pad(A, th, t, dur, bar) {
    const shift = bar % 2 ? th.spec.scale[3] - th.spec.scale[0] : 0;     // alternate i and iv
    for (const d of th.spec.pad) {
      const e = A.env(t, 1.6, dur - 3, 2, 0.07);
      e.connect(th.gain);
      const f = NOTE(th.spec.root + 12 + d + (shift && d === th.spec.pad[0] ? 0 : 0)) * Math.pow(2, shift / 12);
      const s = A.osc('triangle', f, t, dur + 0.5);
      const s2 = A.osc('sawtooth', f * 1.002, t, dur + 0.5);
      const lp = A.filter('lowpass', 1200, 0.5);
      s.connect(lp); s2.connect(lp); lp.connect(e);
    }
  },
  lead(A, th, t, deg, dur) {
    if (th.spec.lead === 'anthem') {                     // brass and a choir an octave apart
      MUSIC.voice(A, th, t, deg, dur, 'brass');
      MUSIC.voice(A, th, t, deg - th.spec.scale.length, dur, 'choir');
      return;
    }
    MUSIC.voice(A, th, t, deg, dur, th.spec.lead);
  },
  voice(A, th, t, deg, dur, kind) {
    const f = MUSIC.freq(th, deg, kind === 'low' ? 0 : 1);
    const peak = kind === 'flute' ? 0.12 : kind === 'choir' ? 0.16 : 0.13;
    const e = A.env(t, kind === 'strings' ? 0.03 : 0.08, Math.max(0.02, dur * 0.6), dur * 0.6, peak);
    e.connect(th.gain);
    if (kind === 'choir') {
      const n = A.noise(t, dur + 1);
      for (const fm of [f * 2, 700, 1150]) {
        const bp = A.filter('bandpass', fm, 14);
        n.connect(bp); bp.connect(e);
      }
      A.osc('sine', f, t, dur + 1).connect(e);
      return;
    }
    const type = kind === 'flute' ? 'sine' : 'sawtooth';
    const s = A.osc(type, f, t, dur + 1);
    const vib = A.osc('sine', 5.2, t, dur + 1);
    const vg = A.ctx.createGain();
    vg.gain.value = f * 0.006;
    vib.connect(vg); vg.connect(s.frequency);
    const lp = A.filter('lowpass', kind === 'brass' ? 1500 : kind === 'low' ? 700 : 2400, 1);
    s.connect(lp); lp.connect(e);
  },
};
