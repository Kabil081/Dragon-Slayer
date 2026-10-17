import { KEYS, VIEW } from '../data/config.js';
import { getLevel } from '../data/levels.js';
import { Audio, CUES } from './Audio.js';
import { Camera } from './Camera.js';
import { Clips } from './Clips.js';
import { Input } from './Input.js';
import { Online } from './Online.js';
import { Particles } from './Particles.js';
import { Renderer } from './Renderer.js';
import { SaveManager } from './SaveManager.js';
import { Combat } from '../game/Combat.js';
import { Hazards } from '../game/Hazards.js';
import { LevelManager, levelArt } from '../game/LevelManager.js';
import { ProgressionManager } from '../game/ProgressionManager.js';
import { Shop } from '../game/Shop.js';
import { HUD } from '../ui/HUD.js';
import { UI } from '../ui/UI.js';

// Owns every system and the requestAnimationFrame loop.
// Modes: menu | playing | paused | results.

export class Game {
  constructor(canvas, uiRoot, assets, opts = {}) {
    this.assets = assets;
    this.renderer = new Renderer(canvas, VIEW.width, VIEW.height);
    this.input = new Input(KEYS);
    this.camera = new Camera(VIEW.width, VIEW.height);
    this.particles = new Particles();
    this.hazards = new Hazards();
    this.combat = new Combat(this);
    this.guestSaves = this.saves = new SaveManager(opts.saveKey);
    this.progression = new ProgressionManager(this.saves);
    this.shop = new Shop(this.progression);
    // sound: synthesized live; muted with M (remembered in the save); silent if the browser has none
    this.audio = opts.silent ? null : new Audio();
    if (this.audio) {
      this.audio.setMuted(this.progression.data.settings && this.progression.data.settings.muted);
      this.audio.loadVoices('assets/audio/', { north_remembers: 'north_remembers.wav',
                                               king_in_the_north: 'king_in_the_north.wav',
                                               dracarys: 'dracarys.wav', dracarys_aemond: 'dracarys_aemond.wav' });
    }
    // film clips for the Level 7 ending, if the player has put them in assets/media/
    this.clips = opts.silent ? null : new Clips();
    if (this.clips) this.clips.load('assets/media/');
    // accounts, cloud saves and the live leaderboard (when served by tools/serve.py)
    this.online = new Online(this, { enabled: !opts.offline });
    this.progression.onBattle = b => this.online.reportBattle(b);
    this.levels = new LevelManager(this);
    this.hud = new HUD(this);
    this.ui = new UI(this, uiRoot);
    this.mode = 'menu';
    this.hitstop = 0;
    this.slowmo = 0;
    this.lastLevelId = 1;
    this.input.onPress(a => {
      if (a === 'pause') this.onPauseKey();
      if (a === 'mute') this.toggleMute();
    });
    window.addEventListener('blur', () => { if (this.mode === 'playing' && !this.halted) this.pause(); });
    this.halted = !!opts.manualLoop;   // tests drive step() themselves
    this.last = performance.now();
    requestAnimationFrame(t => this.frame(t));
  }

  startLevel(id) {
    if (this.clips) this.clips.stopAll();
    // the level's dragons and scenery arrive the first time it is played
    const cfg = getLevel(id);
    const need = cfg && this.assets.pending
      ? this.assets.pending(levelArt(cfg, this.assets.manifest, this.progression.data.equipped)) : [];
    if (need.length) { this.loadLevelArt(id, need); return; }
    try {
      this.levels.start(id);
    } catch (e) {
      console.error(e);
      this.ui.showError('This level could not be built', [e.message]);
      return;
    }
    this.lastLevelId = id;
    this.mode = 'playing';
    this.ui.hideAll();
    this.input.clear();
    this.prefetch(id + 1);
  }

  // A loading screen while a level's art arrives, then the level. Nothing is
  // substituted: a file that does not arrive is reported, with Try again.
  async loadLevelArt(id, groups) {
    if (this.loadingLevel === id) return;
    this.loadingLevel = id;
    const name = getLevel(id).name;
    this.mode = 'menu';
    this.levels.level = null;
    this.ui.showLoading(0, `Approaching ${name}…`);
    const missing = await this.assets.loadGroups(groups,
      p => { if (this.loadingLevel === id) this.ui.showLoading(p, `Approaching ${name}… ${Math.round(p * 100)}%`); });
    if (this.loadingLevel !== id) return;
    this.loadingLevel = null;
    if (missing.length) { this.ui.showLoadFailed(id, name, missing); return; }
    this.startLevel(id);
  }

  // Quietly fetch a level's art ahead of time (the next level, the one the player will pick).
  prefetch(id) {
    const cfg = getLevel(id);
    if (!cfg || cfg.status !== 'playable' || !this.assets.pending || this.prefetching === id) return;
    const need = this.assets.pending(levelArt(cfg, this.assets.manifest, this.progression.data.equipped));
    if (!need.length) return;
    this.prefetching = id;
    this.assets.loadGroups(need, () => {}, { workers: 4 }).finally(() => { if (this.prefetching === id) this.prefetching = null; });
  }

  restart() { this.startLevel(this.lastLevelId); }

  // A moment with a sound of its own ("Dracarys!", the warrior's fall): the
  // player's clip from assets/media if they added one, else the game's own.
  // Returns 'clip', 'own' or null (nothing sounded).
  cue(id, o = {}) {
    if (this.clips && this.clips.get(id)) return this.clips.play(id, o) ? 'clip' : null;
    const own = CUES[id];
    return own && this.audio && own(this.audio, o) ? 'own' : null;
  }

  // Another save slot becomes the game's (signing in or out); only from the menus.
  useSaves(saves, data = null) {
    this.saves = saves;
    this.progression.useSaves(saves, data);
    if (data) this.progression.persist();
    const m = !!(this.progression.data.settings && this.progression.data.settings.muted);
    if (this.audio) this.audio.setMuted(m);
    if (this.clips) this.clips.setMuted(m);
  }

  // A saga level from its first encounter again (rewards already paid stay paid).
  replayFromStart(id) {
    this.progression.resetSaga(id);
    this.startLevel(id);
  }

  toggleMute() {
    if (!this.audio) return;
    const m = !this.audio.muted;
    this.audio.setMuted(m);
    if (this.clips) this.clips.setMuted(m);
    this.progression.data.settings = { ...(this.progression.data.settings || {}), muted: m };
    this.progression.persist();
    if (this.ui.screen === 'pause') this.ui.showPause();
    this.levels.muteNote = { t: 0, muted: m };
  }

  pause() {
    if (this.mode !== 'playing') return;
    this.mode = 'paused';
    this.ui.showPause();
  }

  resume() {
    this.mode = 'playing';
    this.ui.hideAll();
    this.input.clear();
  }

  quitToMenu() {
    if (this.clips) this.clips.stopAll();
    this.mode = 'menu';
    this.levels.level = null;
    if (this.audio) this.audio.music('explore');
    this.ui.showCampaign();
  }

  onPauseKey() {
    if (this.mode === 'playing') this.pause();
    else if (this.mode === 'paused' && this.ui.screen === 'pause') this.resume();
    else if (this.ui.screen) this.ui.escape();
  }

  onLevelEnd(outcome, result) {
    this.mode = 'results';
    this.online.syncNow();
    if (outcome === 'won' && result && result.saga) this.ui.showSagaComplete(result);
    else if (outcome === 'won') this.ui.showVictory(result);
    else this.ui.showDefeat(this.levels.saga);
  }

  // One simulation step. Hitstop and slow motion scale world time only.
  step(dt) {
    if (this.audio && this.levels.active && this.levels.player) this.audio.listenerX = this.camera.x + VIEW.width / 2;
    if ((this.mode === 'playing' || this.mode === 'results') && this.levels.active) {
      let w = dt;
      if (this.hitstop > 0) { this.hitstop = Math.max(0, this.hitstop - dt); w = dt * 0.08; }
      else if (this.slowmo > 0) { this.slowmo = Math.max(0, this.slowmo - dt); w = dt * 0.35; }
      this.levels.update(w, dt);
    }
    this.input.endFrame(dt);
  }

  render() {
    this.renderer.begin();
    if (this.levels.active && this.mode !== 'menu') this.levels.draw(this.renderer);
    this.renderer.end();
  }

  frame(now) {
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    if (!this.halted) {
      this.step(dt);
      this.render();
    }
    requestAnimationFrame(t => this.frame(t));
  }
}
