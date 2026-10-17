// Optional film clips, supplied by the player: they are not part of the
// game and never generated or downloaded by it. Put the files in
// assets/media/ (see assets/media/README.txt). Each slot may be a video
// (.mp4, .webm) or an audio file (.m4a, .mp3, .ogg, .wav):
//
//   north_remembers     Level 7 ending: after the fade, before THE NORTH REMEMBERS
//   king_in_the_north   Level 7 ending: before THE KING IN THE NORTH
//   dracarys            heard as Rhagal, Drogon and Viserion begin to breathe fire
//   vhagar_fire         heard as Vhagar begins to breathe fire
//   player_death        when the warrior falls (a video plays full screen)
//   aegon_theme         the music of the duel with Aegon (loops)
//
// With no file a slot does nothing and the game sounds exactly as before.
// What was found is logged in the console.

export const CLIP_SLOTS = ['north_remembers', 'king_in_the_north', 'dracarys', 'vhagar_fire', 'player_death', 'aegon_theme'];

const KINDS = [['mp4', 'video'], ['webm', 'video'], ['m4a', 'audio'], ['mp3', 'audio'], ['ogg', 'audio'], ['wav', 'audio']];

export class Clips {
  constructor() {
    this.items = {};
    this.status = {};           // id -> 'video' | 'audio' | 'none' | 'unplayable'
    this.muted = false;
    this.plays = {};            // id -> times started (read by the tests)
  }

  get(id) { return this.items[id] || null; }

  async load(base, ids = CLIP_SLOTS) {
    for (const id of ids) {
      for (const [ext, type] of KINDS) {
        const url = `${base}${id}.${ext}`;
        if (!(await exists(url))) continue;
        const el = document.createElement(type);
        el.preload = 'auto';
        if (type === 'video') el.playsInline = true;
        el.src = url;
        const ok = await new Promise(res => {
          el.addEventListener('loadedmetadata', () => res(true), { once: true });
          el.addEventListener('error', () => res(false), { once: true });
          setTimeout(() => res(false), 10000);
        });
        if (!ok || !Number.isFinite(el.duration) || el.duration <= 0) {
          console.warn(`Clips: ${url} is there but this browser cannot play it; ignored.`);
          this.status[id] = 'unplayable';
          continue;
        }
        el.muted = this.muted;
        this.items[id] = { id, type, el, url, duration: el.duration };
        this.status[id] = type;
        console.info(`Clips: ${id} -> ${url} (${type}, ${el.duration.toFixed(1)} s)`);
        break;
      }
      if (!this.status[id]) this.status[id] = 'none';
    }
  }

  setMuted(m) {
    this.muted = !!m;
    for (const c of Object.values(this.items)) c.el.muted = this.muted;
  }

  playing(id) {
    const c = this.items[id];
    return !!(c && !c.el.paused && !c.el.ended);
  }

  // Play a slot from the start (a cue never interrupts itself: if it is
  // still sounding, the new one is skipped). Returns true if it started.
  play(id, { loop = false, restart = false } = {}) {
    const c = this.items[id];
    if (!c) return false;
    if (this.playing(id) && !restart) return false;
    const el = c.el;
    el.loop = loop;
    el.muted = this.muted;
    try { el.currentTime = 0; } catch (e) { /* not seekable yet */ }
    const pr = el.play();
    if (pr && pr.catch) pr.catch(err => console.warn(`Clips: ${id} could not play`, err));
    this.plays[id] = (this.plays[id] || 0) + 1;
    return true;
  }

  stop(id) {
    const c = this.items[id];
    if (!c) return;
    try { c.el.pause(); } catch (e) { /* gone */ }
  }

  stopAll() {
    for (const id of Object.keys(this.items)) this.stop(id);
  }
}

async function exists(url) {
  try {
    const r = await fetch(url, { method: 'HEAD', cache: 'no-store' });
    return r.ok;
  } catch (e) {
    return false;
  }
}
