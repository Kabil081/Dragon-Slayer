// Plays animations described in the manifest (frames, fps, loop,
// per-frame anchors). States can also drive the frame directly.

export class Animator {
  constructor(defs) {
    this.defs = defs;
    this.name = null;
    this.def = null;
    this.time = 0;
    this.frame = 0;
    this.speed = 1;
    this.finished = false;
    this.manual = false;
  }

  play(name, { restart = false, speed = 1, startFrame = 0 } = {}) {
    if (!this.defs[name]) throw new Error('Unknown animation: ' + name);
    if (this.name === name && !restart) {
      this.speed = speed;
      this.manual = false;
      return;
    }
    this.name = name;
    this.def = this.defs[name];
    this.speed = speed;
    this.time = startFrame / this.def.fps;
    this.frame = startFrame;
    this.finished = false;
    this.manual = false;
  }

  // Hold an exact frame (used for telegraphs, jump arcs, scripted poses).
  set(name, frame) {
    if (this.name !== name) this.play(name);
    this.manual = true;
    this.frame = Math.max(0, Math.min(this.def.frames - 1, frame | 0));
  }

  update(dt) {
    if (!this.def || this.manual) return;
    this.time += dt * this.speed;
    const f = Math.floor(this.time * this.def.fps);
    if (this.def.loop) {
      this.frame = f % this.def.frames;
    } else if (f >= this.def.frames) {
      this.frame = this.def.frames - 1;
      this.finished = true;
    } else {
      this.frame = f;
    }
  }

  get data() { return this.def.per_frame[this.frame]; }

  get duration() { return this.def.frames / this.def.fps / this.speed; }
}
