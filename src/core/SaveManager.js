// Persistent progress in localStorage. Every access is guarded: private
// windows or blocked storage fall back to an in-memory save.

export const KEY = 'dragonslayer.rise-of-the-north.save';
const VERSION = 1;

export function defaultSave() {
  return {
    version: VERSION,
    created: Date.now(),
    level: 1,
    xp: 0,
    gold: 0,
    ownedWeapons: ['steel_sword'],
    equipped: 'steel_sword',
    upgrades: { vitality: 0, strength: 0, fireward: 0 },
    levels: {},          // id -> { cleared, clears, bestTime, noHit }
    stats: { dragonsSlain: 0, deaths: 0 },
    saga: {},            // levels of several encounters (Level 7): id -> run progress + rewards paid
    unlocks: {},         // e.g. frostpiercer: true
    settings: { muted: false },
  };
}

// A saga record (Level 7), made safe whatever was stored.
export function cleanSaga(r) {
  const list = v => (Array.isArray(v) ? v.filter(x => typeof x === 'string').slice(0, 16) : []);
  const num = v => (Number.isFinite(v) && v >= 0 ? v : 0);
  r = r && typeof r === 'object' ? r : {};
  return { cleared: [...new Set(list(r.cleared))], rewarded: [...new Set(list(r.rewarded))], granted: r.granted === true,
           deaths: Math.floor(num(r.deaths)), time: num(r.time), weapons: [...new Set(list(r.weapons))],
           gold: Math.floor(num(r.gold)), xp: Math.floor(num(r.xp)) };
}

export class SaveManager {
  constructor(key = KEY) {
    this.key = key;
    this.memory = null;
    this.onSave = null;          // the signed-in player's cloud copy (core/Online.js)
  }

  exists() {
    try { return localStorage.getItem(this.key) !== null; } catch (e) { return this.memory !== null; }
  }

  load() {
    let raw = null;
    try { raw = localStorage.getItem(this.key); } catch (e) { raw = this.memory; }
    if (!raw) return defaultSave();
    try {
      const data = JSON.parse(raw);
      if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('not a save object');
      return this.migrate(data);
    } catch (e) {
      console.warn('Save data was unreadable; starting fresh.', e);
      return defaultSave();
    }
  }

  migrate(data) {
    const base = defaultSave();
    const merged = { ...base, ...data };
    merged.upgrades = { ...base.upgrades, ...(data.upgrades || {}) };
    merged.stats = { ...base.stats, ...(data.stats || {}) };
    merged.levels = data.levels && typeof data.levels === 'object' ? data.levels : {};
    merged.saga = {};
    if (data.saga && typeof data.saga === 'object') {
      for (const [id, r] of Object.entries(data.saga)) merged.saga[id] = cleanSaga(r);
    }
    merged.unlocks = data.unlocks && typeof data.unlocks === 'object' ? { ...data.unlocks } : {};
    merged.settings = { ...base.settings, ...(data.settings && typeof data.settings === 'object' ? data.settings : {}) };
    merged.settings.muted = merged.settings.muted === true;
    if (!Number.isFinite(merged.gold) || merged.gold < 0) merged.gold = 0;
    if (!Number.isFinite(merged.level) || merged.level < 1) merged.level = 1;
    if (!Number.isFinite(merged.xp) || merged.xp < 0) merged.xp = 0;
    merged.achievements = Array.isArray(data.achievements) ? data.achievements.filter(a => typeof a === 'string') : [];
    if (!Array.isArray(merged.ownedWeapons) || !merged.ownedWeapons.length) merged.ownedWeapons = base.ownedWeapons;
    if (!merged.ownedWeapons.includes(merged.equipped)) merged.equipped = merged.ownedWeapons[0];
    merged.savedAt = Number.isFinite(data.savedAt) ? data.savedAt : 0;
    merged.version = VERSION;
    return merged;
  }

  save(data) {
    data.savedAt = Date.now();
    const raw = JSON.stringify(data);
    try { localStorage.setItem(this.key, raw); } catch (e) { this.memory = raw; }
    if (this.onSave) this.onSave(data);
  }

  reset() {
    try { localStorage.removeItem(this.key); } catch (e) { /* storage unavailable */ }
    this.memory = null;
  }
}
