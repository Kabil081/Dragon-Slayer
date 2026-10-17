import { KEY, SaveManager, defaultSave } from './SaveManager.js';

// The online side, when the game is served by tools/serve.py: accounts,
// a cloud copy of each player's save, every battle sent to the leaderboard,
// and live news of other players' battles. Without the server (or offline)
// none of this does anything and the game plays exactly as before.
//
// Each account keeps its own save slot in this browser; signing out returns
// to the guest save. Battles wait in a queue until the server has them, so a
// dropped connection loses nothing.
//
// Light on the server: nothing is fetched until a screen shows it (the board,
// the account), the live connection is open only while the leaderboard is,
// and the cloud save goes up only at the moments that matter (a level's end,
// the armory, signing out, leaving the page), never twice unchanged.

export class OnlineError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.status = status;
  }
}

const QUEUE = 'dragonslayer.online.queue.';

function randomId() {
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);           // works on plain-http network addresses too
  return Array.from(b, x => x.toString(16).padStart(2, '0')).join('');
}

function readJson(key, fallback) {
  try { const v = JSON.parse(localStorage.getItem(key)); return v ?? fallback; } catch (e) { return fallback; }
}

function writeJson(key, v) {
  try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) { /* storage blocked: kept in memory only */ }
}

export class Online {
  constructor(game, { enabled = true } = {}) {
    this.game = game;
    this.enabled = enabled;
    this.available = false;      // the server answered
    this.checked = false;        // init() has finished
    this.signupOpen = true;
    this.player = null;          // { id, name, level, gold, standing }
    this.online = 0;             // players watching live
    this.listeners = new Set();  // fn(kind, data): 'battle' | 'presence' | 'account' | 'standing'
    this.last = null;            // the server's answer to the latest battle sent
    this.pushTimer = null;
    this.dirty = false;
    this.memoryQueue = [];
    this.source = null;
  }

  on(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }

  emit(kind, data) {
    for (const fn of [...this.listeners]) {
      try { fn(kind, data); } catch (e) { console.warn('Online listener failed', e); }
    }
  }

  async request(method, path, body, { keepalive = false } = {}) {
    const opt = { method, credentials: 'same-origin', cache: 'no-store', headers: {}, keepalive };
    if (body !== undefined) {
      opt.headers['Content-Type'] = 'application/json';
      opt.body = JSON.stringify(body);
    }
    let r;
    try {
      r = await fetch(path, opt);
    } catch (e) {
      throw new OnlineError('The server cannot be reached.', 0);
    }
    let data = null;
    try { data = await r.json(); } catch (e) { /* not JSON: a server without the API */ }
    if (!r.ok || !data) throw new OnlineError((data && data.error) || `The server answered ${r.status}.`, r.status);
    return data;
  }

  // Ask the server who is signed in (the session cookie), then go live.
  async init() {
    if (!this.enabled) { this.checked = true; return; }
    try {
      const r = await this.request('GET', '/api/me');
      this.available = true;
      this.signupOpen = r.signup !== false;
      if (r.player) await this.enter(r.player, false);
      this.flush();
      setInterval(() => { this.flush(); if (this.dirty) this.pushSave().catch(() => {}); }, 120000);
      window.addEventListener('online', () => this.flush());
      // leaving or hiding the page: the last changes go up (a request that outlives the page)
      const away = () => { if (this.dirty) this.pushSave({ keepalive: true }).catch(() => {}); };
      window.addEventListener('pagehide', away);
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') away(); });
    } catch (e) {
      this.available = false;
      console.info('Online features are off:', e.message, '(start the game with play.bat or tools/serve.py)');
    }
    this.checked = true;
  }

  // ------------------------------------------------------------ accounts
  async signup(name, password) {
    const r = await this.request('POST', '/api/signup', { name, password });
    await this.enter(r.player, true);
    return r.player;
  }

  async login(name, password) {
    const r = await this.request('POST', '/api/login', { name, password });
    await this.enter(r.player, false);
    return r.player;
  }

  async logout() {
    try { await this.pushSave(); } catch (e) { /* kept in this browser's slot anyway */ }
    try { await this.request('POST', '/api/logout', {}); } catch (e) { /* the cookie dies with the session */ }
    this.leave();
  }

  async deleteAccount(password) {
    await this.request('DELETE', '/api/account', { password });
    const id = this.player && this.player.id;
    this.leave();
    try { if (id) { localStorage.removeItem(`${KEY}.player.${id}`); localStorage.removeItem(QUEUE + id); } } catch (e) { /* */ }
  }

  // Signed in: this account's save slot becomes the game's. A new account
  // (adopt) takes over the progress already made in this browser.
  async enter(player, adopt) {
    this.player = player;
    const slot = new SaveManager(`${KEY}.player.${player.id}`);
    let remote = null;
    try { remote = await this.request('GET', '/api/save'); } catch (e) { /* offline: the local slot */ }
    const local = slot.exists() ? slot.load() : null;
    let data;
    if (remote && remote.save && (!local || (remote.savedAt || 0) >= (local.savedAt || 0))) data = remote.save;
    else if (local) data = local;
    else if (adopt && this.game.guestSaves.exists()) data = this.game.guestSaves.load();
    else data = defaultSave();
    slot.onSave = () => this.schedulePush();
    this.game.useSaves(slot, data);
    this.pushSave().catch(() => { this.dirty = true; });
    this.emit('account', player);
    this.flush();
  }

  leave() {
    this.player = null;
    clearTimeout(this.pushTimer);
    this.dirty = false;
    this.game.useSaves(this.game.guestSaves, null);
    this.emit('account', null);
  }

  // `full`: the place on every board (asked for only when the account screen opens)
  async refreshMe(full = false) {
    if (!this.available || !this.player) return null;
    try {
      const r = await this.request('GET', `/api/me${full ? '?full=1' : ''}`);
      if (r.player) { this.player = r.player; this.emit('standing', r.player.standing); }
      else this.expire();
    } catch (e) { /* keep what we have */ }
    return this.player;
  }

  // ------------------------------------------------------------ the cloud copy of the save
  // Every local save marks the cloud copy out of date; it goes up a while
  // later (or at once at the moments that matter: syncNow).
  schedulePush() {
    if (!this.player) return;
    this.dirty = true;
    clearTimeout(this.pushTimer);
    this.pushTimer = setTimeout(() => this.pushSave().catch(() => {}), 45000);
  }

  syncNow() {
    if (this.dirty) this.pushSave().catch(() => {});
  }

  async pushSave({ keepalive = false } = {}) {
    if (!this.player || this.player.expired || !this.available) return;
    clearTimeout(this.pushTimer);
    const d = this.game.progression.data;
    const { savedAt, ...rest } = d;
    const text = JSON.stringify(rest);
    this.dirty = false;
    if (text === this.lastPushed) return;          // nothing new since the last one
    try {
      await this.request('PUT', '/api/save', { save: d, savedAt: savedAt || Date.now() }, { keepalive });
      this.lastPushed = text;
    } catch (e) {
      this.dirty = true;
      if (e.status === 401) this.expire();
      throw e;
    }
  }

  // The sign-in ran out (or was ended elsewhere). The game keeps this
  // player's save and queued battles until they sign in again; it never
  // swaps saves in the middle of a fight.
  expire() {
    if (!this.player || this.player.expired) return;
    this.player = { ...this.player, expired: true };
    this.emit('account', this.player);
  }

  // ------------------------------------------------------------ battles
  queueKey() { return this.player ? QUEUE + this.player.id : null; }

  queue() { return this.player ? readJson(this.queueKey(), this.memoryQueue) : []; }

  // A battle just ended (won or lost). Guests' battles are not sent.
  reportBattle(b) {
    if (!this.enabled || !this.player) return;
    const rec = { id: randomId(), level: b.level, boss: String(b.boss), won: !!b.won, clear: !!b.clear,
                  time: Math.max(0, Math.round((b.time || 0) * 10) / 10),
                  gold: Math.max(0, Math.round(b.gold || 0)), xp: Math.max(0, Math.round(b.xp || 0)), flawless: !!b.flawless };
    const q = this.queue();
    q.push(rec);
    this.memoryQueue = q.slice(-100);
    writeJson(this.queueKey(), this.memoryQueue);
    this.flush();
  }

  async flush() {
    if (!this.available || !this.player || this.player.expired || this.flushing) return;
    this.flushing = true;
    try {
      let q = this.queue();
      while (q.length) {
        const rec = q[0];
        let res = null;
        try {
          res = await this.request('POST', '/api/battle', rec);
        } catch (e) {
          if (e.status === 0 || e.status === 429 || e.status >= 500) break;     // try again later
          if (e.status === 401) { this.expire(); break; }
          console.warn('The leaderboard refused a battle:', e.message, rec);   // a bad record: dropped
        }
        q = this.queue().filter(x => x.id !== rec.id);
        this.memoryQueue = q;
        writeJson(this.queueKey(), q);
        if (res) {
          this.last = { battle: rec, standing: res.standing };
          if (this.player) this.player.standing = res.standing;
          this.emit('standing', res.standing);
        }
      }
    } finally {
      this.flushing = false;
    }
  }

  // ------------------------------------------------------------ the boards
  leaderboard(board, level = 0) {
    return this.request('GET', `/api/leaderboard?board=${encodeURIComponent(board)}&level=${level}`);
  }

  feed(limit = 20) { return this.request('GET', `/api/feed?limit=${limit}`).then(r => r.feed); }

  // The live connection: open only while someone is looking at the board.
  live(on) {
    if (!on) {
      if (this.source) { this.source.close(); this.source = null; }
      return;
    }
    if (this.source || !this.available || typeof EventSource === 'undefined') return;
    const src = this.source = new EventSource('/api/live');
    const count = e => { try { this.online = JSON.parse(e.data).online; this.emit('presence', this.online); } catch (x) { /* */ } };
    src.addEventListener('hello', count);
    src.addEventListener('presence', count);
    src.addEventListener('battle', e => {
      let b = null;
      try { b = JSON.parse(e.data); } catch (x) { return; }
      b.mine = !!(this.player && b.name === this.player.name);
      this.emit('battle', b);
    });
  }
}
