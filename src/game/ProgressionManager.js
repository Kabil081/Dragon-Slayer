import { PROGRESSION, UPGRADES, xpToNext } from '../data/progression.js';
import { WEAPONS } from '../data/weapons.js';
import { LEVELS } from '../data/levels.js';
import { cleanSaga, defaultSave } from '../core/SaveManager.js';

// XP, player level, gold, unlocks and derived stats. Owns the save data
// object and persists through SaveManager after every change. Every battle
// fought (won or lost) goes to `onBattle` (the online leaderboard).

// The boss of a level or saga stage, as the leaderboard names it.
export function bossKey(cfg) {
  if (cfg.stage) return cfg.stage.id;
  if (cfg.boss) return cfg.boss.enemy;
  if (cfg.bosses) return cfg.bosses.map(b => b.enemy).join('+');
  return 'unknown';
}

export class ProgressionManager {
  constructor(saves) {
    this.onBattle = null;
    this.useSaves(saves);
  }

  // Switch to another save slot (a signed-in player's), optionally filled with `data`.
  useSaves(saves, data = null) {
    this.saves = saves;
    this.data = data ? saves.migrate(data) : saves.load();
    // weapons renamed or removed in an update are dropped from old saves
    this.data.ownedWeapons = this.data.ownedWeapons.filter(id => WEAPONS[id] && !WEAPONS[id].field);
    if (!this.data.ownedWeapons.length) this.data.ownedWeapons = ['steel_sword'];
    if (!WEAPONS[this.data.equipped]) this.data.equipped = this.data.ownedWeapons[0];
  }

  // ---------------------------------------------------------------- sagas (Level 7)
  sagaRecord(levelId) {
    const d = this.data;
    d.saga = d.saga || {};
    d.saga[levelId] = cleanSaga(d.saga[levelId]);
    return d.saga[levelId];
  }

  // Frostbrand is granted (never bought); the Frostpiercer is unlocked.
  grantFrostbrand(levelId) {
    const d = this.data, r = this.sagaRecord(levelId);
    if (!d.ownedWeapons.includes('frostbrand')) d.ownedWeapons.push('frostbrand');
    d.unlocks = d.unlocks || {};
    d.unlocks.frostpiercer = true;
    r.granted = true;
    this.persist();
  }

  battle(b) {
    if (!this.onBattle) return;
    try { this.onBattle(b); } catch (e) { console.warn('Battle report failed', e); }
  }

  // A boss of the saga has fallen: saved at once; its reward is paid only the first time ever.
  recordBoss(levelId, stage, weapons = [], time = 0) {
    const r = this.sagaRecord(levelId);
    if (!r.cleared.includes(stage.id)) r.cleared.push(stage.id);
    for (const w of weapons) if (!r.weapons.includes(w)) r.weapons.push(w);
    let paid = false, levelsGained = [];
    if (!r.rewarded.includes(stage.id)) {
      r.rewarded.push(stage.id);
      this.data.gold += stage.reward.gold;
      levelsGained = this.addXp(stage.reward.xp);
      r.gold += stage.reward.gold;
      r.xp += stage.reward.xp;
      this.data.stats.dragonsSlain++;
      paid = true;
    }
    this.persist();
    this.battle({ level: levelId, boss: stage.id, won: true, clear: false, time,
                  gold: paid ? stage.reward.gold : 0, xp: paid ? stage.reward.xp : 0, flawless: false });
    return { paid, levelsGained };
  }

  recordSagaDeath(levelId) {
    const r = this.sagaRecord(levelId);
    r.deaths++;
    this.persist();
  }

  addSagaTime(levelId, t) {
    const r = this.sagaRecord(levelId);
    r.time += Math.max(0, t);
    this.persist();
  }

  // Replay from the first encounter (rewards already paid stay paid).
  resetSaga(levelId) {
    const r = this.sagaRecord(levelId);
    Object.assign(r, { cleared: [], deaths: 0, time: 0, weapons: [], gold: 0, xp: 0 });
    this.persist();
  }

  // The whole saga is done: the level completes (first / repeat reward,
  // achievement once) and the run's record is cleared for the next replay.
  completeSaga(cfg, { time, damageTaken, weapons = [] }) {
    const r = this.sagaRecord(cfg.id);
    const last = cfg.stages[cfg.stages.length - 1];
    if (!r.cleared.includes(last.id)) r.cleared.push(last.id);
    let bossGold = 0, bossXp = 0;
    if (!r.rewarded.includes(last.id)) {               // the final duel's own reward, once
      r.rewarded.push(last.id);
      this.data.gold += last.reward.gold;
      this.addXp(last.reward.xp);
      r.gold += last.reward.gold;
      r.xp += last.reward.xp;
      bossGold = last.reward.gold;
      bossXp = last.reward.xp;
    }
    for (const w of weapons) if (!r.weapons.includes(w)) r.weapons.push(w);
    const run = { ...r };
    const res = this.completeLevel(cfg, { time: r.time || time, damageTaken, report: false });
    const out = { ...res, saga: true, bosses: cfg.stages.map(s => s.id), runGold: run.gold + res.gold,
                  runXp: run.xp + res.xp, bossGold, bossXp, weapons: run.weapons, deaths: run.deaths,
                  runTime: r.time || time };
    Object.assign(r, { cleared: [], deaths: 0, time: 0, weapons: [], gold: 0, xp: 0 });
    this.persist();
    this.battle({ level: cfg.id, boss: last.id, won: true, clear: true, time: out.runTime,
                  gold: bossGold + res.gold, xp: bossXp + res.xp, flawless: res.noHit });
    return out;
  }

  persist() { this.saves.save(this.data); }

  get hasProgress() { return this.saves.exists(); }

  newGame() {
    this.saves.reset();
    this.data = defaultSave();
    this.persist();
  }

  getStats() {
    const d = this.data;
    const b = PROGRESSION.base, g = PROGRESSION.perLevel;
    const lv = d.level - 1;
    const stats = { maxHp: b.maxHp + g.maxHp * lv, attack: b.attack + g.attack * lv, fireRes: b.fireRes + g.fireRes * lv };
    for (const [id, up] of Object.entries(UPGRADES)) stats[up.stat] += up.perTier * (d.upgrades[id] || 0);
    const w = WEAPONS[d.equipped];
    if (w && w.fireRes) stats.fireRes += w.fireRes;
    stats.fireRes = Math.min(PROGRESSION.fireResCap, stats.fireRes);
    stats.maxHp = Math.round(stats.maxHp);
    return stats;
  }

  xpInfo() {
    return { level: this.data.level, xp: this.data.xp, next: xpToNext(this.data.level),
             max: this.data.level >= PROGRESSION.maxLevel };
  }

  addXp(n) {
    const d = this.data;
    const gained = [];
    d.xp += n;
    while (d.level < PROGRESSION.maxLevel && d.xp >= xpToNext(d.level)) {
      d.xp -= xpToNext(d.level);
      d.level++;
      gained.push(d.level);
    }
    if (d.level >= PROGRESSION.maxLevel) d.xp = 0;
    return gained;
  }

  levelRecord(id) { return this.data.levels[id] || null; }

  isLevelCleared(id) { return !!(this.data.levels[id] && this.data.levels[id].cleared); }

  isLevelUnlocked(id) {
    const L = LEVELS.find(l => l.id === id);
    if (!L || L.status !== 'playable') return false;
    return id === 1 || this.isLevelCleared(id - 1);
  }

  isWeaponUnlocked(id) {
    const w = WEAPONS[id];
    if (w.granted) return this.data.ownedWeapons.includes(id);
    const stageOk = !w.unlock || this.isLevelCleared(w.unlock);
    const levelOk = !w.unlockLevel || this.data.level >= w.unlockLevel;
    return stageOk && levelOk;
  }

  lockReason(id) {
    const w = WEAPONS[id];
    if (w.granted && !this.data.ownedWeapons.includes(id)) return `Granted on the Wall (Level ${w.granted})`;
    if (w.unlockLevel && this.data.level < w.unlockLevel) return `Reach level ${w.unlockLevel}`;
    if (w.unlock && !this.isLevelCleared(w.unlock)) return `Clear Level ${w.unlock}`;
    return null;
  }

  completeLevel(cfg, { time, damageTaken, lifeDamage = null, lives = 1, report = true }) {
    const rec = this.data.levels[cfg.id] || { cleared: false, clears: 0, bestTime: null, noHit: false };
    const first = !rec.cleared;
    const pay = first ? cfg.rewards.firstClear : cfg.rewards.repeat;
    const xp = pay.xp;
    let gold = pay.gold;
    const noHit = damageTaken <= 0;
    const noHitGold = noHit ? cfg.rewards.noHitBonusGold || 0 : 0;
    gold += noHitGold;
    const before = Object.keys(WEAPONS).filter(id => this.isWeaponUnlocked(id));
    rec.cleared = true;
    rec.clears++;
    rec.bestTime = rec.bestTime === null ? time : Math.min(rec.bestTime, time);
    rec.noHit = rec.noHit || noHit;
    this.data.levels[cfg.id] = rec;
    this.data.gold += gold;
    this.data.stats.dragonsSlain++;
    const levelsGained = this.addXp(xp);
    const newWeapons = Object.keys(WEAPONS).filter(id => this.isWeaponUnlocked(id) && !before.includes(id) &&
                                                    !WEAPONS[id].field);
    // a boss-clear achievement is recorded once, on the first clear
    let achievement = null;
    const ach = cfg.rewards.achievement;
    if (ach && first) {
      this.data.achievements = this.data.achievements || [];
      if (!this.data.achievements.includes(ach.id)) { this.data.achievements.push(ach.id); achievement = ach; }
    }
    this.persist();
    if (report) this.battle({ level: cfg.id, boss: bossKey(cfg), won: true, clear: true, time, gold, xp, flawless: noHit });
    return {
      first, xp, gold, noHit, noHitGold, time, levelsGained, newWeapons, achievement, lifeDamage, lives,
      bestTime: rec.bestTime, playerLevel: this.data.level,
      nextLevel: LEVELS.find(l => l.id === cfg.id + 1) || null,
    };
  }

  recordDeath(levelId = 0, boss = 'unknown', time = 0) {
    this.data.stats.deaths++;
    this.persist();
    if (levelId) this.battle({ level: levelId, boss, won: false, clear: false, time, gold: 0, xp: 0, flawless: false });
  }
}
