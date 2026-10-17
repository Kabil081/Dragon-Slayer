// Keyboard state with per-frame edges and short input buffering, so an
// attack or jump pressed slightly early still happens when allowed.

export class Input {
  constructor(bindings) {
    this.bindings = bindings;
    this.down = new Set();
    this.pressedAt = new Map();   // action -> time it was last pressed
    this.releasedThisFrame = new Set();
    this.time = 0;
    this.listeners = [];
    this.codeToAction = new Map();
    for (const [action, codes] of Object.entries(bindings)) {
      for (const c of codes) this.codeToAction.set(c, action);
    }
    window.addEventListener('keydown', e => this.onKey(e, true));
    window.addEventListener('keyup', e => this.onKey(e, false));
    window.addEventListener('blur', () => this.down.clear());
  }

  onKey(e, isDown) {
    const action = this.codeToAction.get(e.code);
    if (!action) return;
    // typing a name or password: the letters are text, not moves (M must not mute)
    if (e.target && e.target.closest && e.target.closest('input, textarea')) return;
    e.preventDefault();
    if (isDown) {
      if (!this.down.has(action)) {
        this.pressedAt.set(action, this.time);
        for (const fn of this.listeners) fn(action);
      }
      this.down.add(action);
    } else {
      this.down.delete(action);
      this.releasedThisFrame.add(action);
    }
  }

  onPress(fn) { this.listeners.push(fn); }

  isDown(action) { return this.down.has(action); }

  released(action) { return this.releasedThisFrame.has(action); }

  // True if the action was pressed within `window` seconds and not yet used.
  buffered(action, window) {
    const t = this.pressedAt.get(action);
    return t !== undefined && this.time - t <= window;
  }

  consume(action) { this.pressedAt.delete(action); }

  axis() {
    return (this.isDown('right') ? 1 : 0) - (this.isDown('left') ? 1 : 0);
  }

  endFrame(dt) {
    this.time += dt;
    this.releasedThisFrame.clear();
  }

  clear() {
    this.pressedAt.clear();
    this.down.clear();
  }
}
