import { Weapon } from './Weapon.js';

// Runs a level made of several encounters fought one after another (Level 7,
// The Three Calamities), as explicit states:
//
//   intro      the chapter opens: the title, a line from the warrior
//   grant      Frostbrand is granted at the shrine; the Frostpiercer is explained
//   travel     walking the Wall to the next arena (the boss is waiting, dormant)
//   fight      a dragon encounter (LevelManager's 'arena' phase)
//   victory    a boss has fallen: reward paid once and saved, the gate rises
//   duelIntro  Aegon steps out to meet the warrior
//   duel       the final duel (LevelManager's 'arena' phase with Aegon)
//   defeat     Aegon has fallen: his kneel completes
//   ceremony   "The North Remembers" (src/game/Ending.js)
//   complete   the level is completed and the completion screen is shown
//
// Only one boss exists at a time: each stage's boss is built when its stage
// begins and the previous one is discarded. A death restarts the current
// encounter: cleared stages are saved and never pay their reward again.

export class Saga {
  constructor(lm, cfg) {
    this.lm = lm;
    this.game = lm.game;
    this.cfg = cfg;
    this.rec = this.game.progression.sagaRecord(cfg.id);
    const ids = cfg.stages.map(s => s.id);
    this.index = ids.findIndex(id => !this.rec.cleared.includes(id));
    if (this.index < 0) this.index = 0;                  // a finished run starts over (completion resets it)
    this.state = this.index === 0 ? 'intro' : 'travel';
    this.t = 0;
    this.card = null;
    this.cards = [];
    this.runTime = 0;
  }

  get stage() { return this.cfg.stages[this.index]; }
  get last() { return this.index === this.cfg.stages.length - 1; }
  get isDuel() { return !!this.stage.duel; }

  // The level config as LevelManager sees it during the current stage.
  stageConfig(i = this.index) {
    const st = this.cfg.stages[i];
    const boss = st.boss || { enemy: st.duel, spawnX: st.spawnX, damageMul: st.damageMul ?? 1 };
    return { ...this.cfg, arena: st.arena, boss, bosses: undefined, camera: st.camera, intro: st.intro,
             victory: st.victory, stage: st, flyby: undefined };
  }

  spawnX() {
    return this.index === 0 ? this.cfg.spawnX : this.cfg.stages[this.index].arena.start - 520;
  }

  // The weapons the warrior carries in this level: Frostbrand first once granted.
  loadout(player) {
    if (!this.rec.granted) return;
    this.giveFrostbrand(player);
  }

  giveFrostbrand(player) {
    if (player.loadout.some(w => w.id === 'frostbrand')) return;
    const fb = new Weapon('frostbrand');
    player.loadout.unshift(fb);
    player.slot = 0;
    player.weapon = fb;
  }

  showCards(cards) {
    this.cards = cards.slice();
    this.card = null;
  }

  // ---------------------------------------------------------------- update
  update(dt, realDt) {
    const lm = this.lm, p = lm.player;
    this.t += realDt;
    if (!['ceremony', 'complete', 'victory'].includes(this.state)) this.runTime += dt;
    // tutorial cards: one at a time; Enter moves on
    if (!this.card && this.cards.length) this.card = { ...this.cards.shift(), t: 0 };
    if (this.card) {
      this.card.t += realDt;
      if (this.card.t > (this.card.dur || 5.5)) this.card = null;
    }
    switch (this.state) {
      case 'intro':
        if (this.t > 1.2 && !this.introSaid) {
          this.introSaid = true;
          lm.say([{ who: 'The Warrior', text: 'Three of them, they said. Three dragons, and a king.' },
                  { who: 'The Warrior', text: 'Then the Wall will need more than steel.' }]);
        }
        if (this.t > 5.6 && !this.lm.dialogue.cur && !this.lm.dialogue.queue.length) {
          this.enter(this.rec.granted ? 'travel' : 'grant');
        }
        break;
      case 'grant':
        if (!this.granted) {
          this.granted = true;
          this.giveFrostbrand(p);
          this.game.progression.grantFrostbrand(this.cfg.id);
          this.game.particles.ice(p.x + 120, p.y - 200, 80, 1.6);
          if (this.game.audio) this.game.audio.play('ward', { x: p.x });
          this.showCards([
            { title: 'FROSTBRAND', sub: 'granted by the old shrine of the Wall', icon: 'frostbrand',
              lines: ['A legendary blade of living ice. Fast cuts, cold to the bone.',
                      'Only Frostbrand can break a marked dive, freeze a marked weak point, or crack a core.',
                      'K (hold): Glacial Wave.   S: the ice ward - it stops one great fire attack.',
                      'Precision dodges and blows on weak points restore its ice energy.'] },
            { title: 'FROSTPIERCER', sub: 'the Dragonbreaker, carried on your back', icon: 'frostpiercer',
              lines: ['F: deploy or stow.   W / S: aim.   Hold J to charge the ice core, release to fire.',
                      'A full charge on a weak point freezes the dragon and opens it to the blade;',
                      'in a great wind-up it breaks the attack. Spears are few, and the reload is long.',
                      'A roll puts it away at once.'] },
          ]);
        }
        if (!this.card && !this.cards.length && this.t > 1) this.enter('travel');
        break;
      case 'travel':
        if (lm.phase === 'arena') this.enter(this.isDuel ? 'duelIntro' : 'fight');
        break;
      case 'duelIntro':
        if (this.t > 0.2 && !this.duelSaid) {
          this.duelSaid = true;
          if (this.game.audio) this.game.audio.play('clang', { f: 260, gain: 1.2 });
        }
        if (!lm.cutscene && this.t > 2.6) this.enter('duel');
        break;
      case 'victory':
        if (this.t > 3.6) this.nextStage();
        break;
      case 'defeat':
        if (lm.dragons.every(d => d.defeated)) this.enter('ceremony');
        break;
      case 'ceremony':
        if (lm.ending && lm.ending.done) this.finish();
        break;
    }
  }

  enter(state) {
    this.state = state;
    this.t = 0;
    if (state === 'fight' || state === 'duelIntro') this.lm.startStageMusic();
    if (state === 'ceremony') this.lm.startEnding();
  }

  skipCard() {
    if (this.card) { this.card = null; return true; }
    return false;
  }

  // The boss of this stage is down (LevelManager calls this once).
  stageWon() {
    const lm = this.lm, p = lm.player, st = this.stage;
    const stageTime = this.runTime;
    this.addTime();
    if (this.last) {
      this.enter('defeat');
      return;
    }
    const pay = this.game.progression.recordBoss(this.cfg.id, st, [...p.weaponsUsed], stageTime);
    lm.rewardPop = { title: `${lm.dragon.def.title} FALLS`, gold: pay.paid ? st.reward.gold : 0,
                     xp: pay.paid ? st.reward.xp : 0, first: pay.paid, t: 0 };
    if (this.game.audio) { this.game.audio.play('reward'); this.game.audio.music('explore'); }
    if (st.victory) lm.say(st.victory);
    this.enter('victory');
  }

  // The gate rises; the warrior heals, refills, walks on. The next boss waits.
  nextStage() {
    const lm = this.lm, p = lm.player;
    this.index++;
    lm.beginStage(this.stageConfig());
    p.heal(p.maxHp);
    if (p.fp) p.fp.refill();
    if (p.ice) p.ice.energy = Math.max(p.ice.energy, 50);
    if (this.stage.id === 'balerion') {
      // the storm darkens: something vast passes over the Wall
      lm.flyby = { t: 0 };
      lm.flashT = 1;
      lm.storming = 1;
      if (this.game.audio) { this.game.audio.play('roar', { size: 1, pitch: 0.55, gain: 0.5 }); this.game.audio.play('thunder'); }
      lm.say([{ who: 'The Warrior', text: 'The storm is moving against the wind...' },
              { who: 'The Warrior', text: 'No. Something is moving inside it.' }]);
    } else if (this.isDuel) {
      lm.say([{ who: 'The Warrior', text: 'The dragons are dead. Only their master is left.' }]);
    }
    this.enter('travel');
  }

  addTime() {
    this.game.progression.addSagaTime(this.cfg.id, this.runTime);
    this.runTime = 0;
  }

  onDeath() {
    this.addTime();
    this.game.progression.recordSagaDeath(this.cfg.id);
  }

  // After the ceremony: the level is complete (and only now).
  finish() {
    if (this.state === 'complete') return;
    this.state = 'complete';
    this.lm.completeSaga();
  }
}
