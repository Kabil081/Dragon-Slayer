// Enemy definitions. Boxes are in sprite-frame pixels relative to the
// sprite's pivot (the dragon's feet), for a dragon facing its native
// direction (left). The engine mirrors and scales them.
//
// Each attack runs telegraph -> active -> recovery. `telegraph` and
// `recovery` are seconds; the animation frames listed are held or played
// across that time, so a slower telegraph means a fairer dodge window.
// `kind` picks the behaviour in game/DragonAttacks.js:
//   melee | breath | strafe | fireball | sweep | charge | slam | skyward | dive | grab | debris
//   scorch | gust | mines | tailsweep | pulse | platerain | shadowhunt | combo | lastember
// `type` is the damage type (physical | fire), matched against fire ward.

export const ENEMIES = {
  ember_wyrm: {
    name: 'Varkhul, the Ember Wyrm',
    sprite: 'dragon_fire',
    scale: 1.2,
    maxHp: 1150,
    poise: 260,            // poise damage needed to stagger
    poiseRegen: 40,        // per second
    staggerTime: 1.9,
    staggerDamageMul: 1.3, // extra damage taken while staggered
    resist: { physical: 1.0, fire: 0.35, frost: 1.5 },
    weakPoint: { mul: 1.25 },           // head hits
    moveSpeed: 170,
    turnDelay: 0.55,
    idleTime: [0.45, 0.9],
    // unpredictable but always telegraphed: random wind-up length, feints
    // into a different attack, follow-up combos, hops back, sudden turns
    tricks: { delay: [0, 0.3], feint: 0.12, chain: 0.2, hop: 0.15, quickTurn: 0.3 },
    hurtboxes: {
      body: { x: -200, y: -230, w: 440, h: 200 },
      head: { size: 120 },             // centred on the per-frame `head` anchor
    },
    attacks: {
      bite: {
        kind: 'melee', anim: 'attack', telegraphFrames: [0, 1], activeFrames: [2, 3], recoveryFrames: [4, 5],
        telegraph: 0.6, active: 0.22, recovery: 0.75,
        damage: 22, type: 'physical', knockback: 760,
        hitbox: { w: 230, h: 200 },    // centred on the per-frame `mouth` anchor
        range: [0, 560], cooldown: 1.4, weight: 3,
      },
      fire_breath: {
        kind: 'breath', anim: 'fire_breath', telegraphFrames: [0, 1, 2], activeFrames: [3, 6], recoveryFrames: [7, 7],
        telegraph: 1.1, active: 1.6, recovery: 0.9,
        tickDamage: 5, tickRate: 0.12, type: 'fire',
        streamLength: 1200, groundSpread: 520,
        range: [380, 1600], cooldown: 4.2, weight: 2,
      },
      flame_strafe: {
        kind: 'strafe', phase: 2, anim: 'flight',
        telegraph: 1.0, active: 0, recovery: 1.1,
        tickDamage: 9, tickRate: 0.1, type: 'fire',
        altitude: 430, passSpeed: 1000, bandWidth: 240,
        range: [0, 9999], cooldown: 13, weight: 2.5,
      },
    },
    phases: [
      { hpBelow: 1.0, speedMul: 1.0 },
      { hpBelow: 0.5, speedMul: 1.22, roar: true, roarAttack: 'flame_strafe' },
    ],
  },

  // Level 2. Faster and more mobile: it keeps distance with fireballs,
  // clears the floor with a flame sweep and closes gaps with a charge.
  // Every attack has a long, readable wind-up and a punishable recovery.
  emberwing: {
    name: 'Emberwing',
    sprite: 'dragon_emberwing',
    scale: 1.05,
    maxHp: 1050,
    poise: 340,            // harder to stagger-lock than Varkhul
    poiseRegen: 55,
    staggerTime: 1.5,
    staggerDamageMul: 1.3,
    resist: { physical: 1.0, fire: 0.3, frost: 1.4 },
    weakPoint: { mul: 1.25 },
    moveSpeed: 250,
    turnDelay: 0.4,
    idleTime: [0.35, 0.7],
    tricks: { delay: [0, 0.35], feint: 0.15, chain: 0.22, hop: 0.25, quickTurn: 0.4 },
    closeRange: 520,
    hurtboxes: {
      body: { x: -200, y: -230, w: 440, h: 200 },
      head: { size: 125 },
    },
    attacks: {
      bite: {
        kind: 'melee', anim: 'attack', telegraphFrames: [0, 1], activeFrames: [2, 3], recoveryFrames: [4, 5],
        telegraph: 0.55, active: 0.2, recovery: 0.8,
        damage: 18, type: 'physical', knockback: 720, lunge: 560,
        hitbox: { w: 220, h: 190 },
        range: [0, 500], cooldown: 1.3, weight: 2.5,
      },
      fireball: {
        kind: 'fireball', anim: 'fire_breath', telegraphFrames: [0, 1, 2], activeFrames: [3, 3], recoveryFrames: [7],
        telegraph: 0.95, lockAt: 0.72, active: 0, recovery: 0.85,
        damage: 20, splashDamage: 10, splashRadius: 130, type: 'fire', knockback: 620,
        projectileSpeed: 1150, gravity: 500, radius: 30,
        countByPhase: [1, 3], volleyGap: 0.6,
        range: [450, 2400], cooldown: 2.8, weight: 3,
      },
      flame_sweep: {
        kind: 'sweep', anim: 'flame_sweep', telegraphFrames: [0, 1], activeFrames: [2, 5], recoveryFrames: [6],
        telegraph: 0.9, active: 0, recovery: 1.15,
        damage: 20, type: 'fire', knockback: 520,
        waveSpeed: 950, waveLength: 260, waveHeight: 110, reach: 1300,
        range: [200, 1100], cooldown: 4.5, weight: 2,
      },
      charge: {
        kind: 'charge', anim: 'charge', telegraphFrames: [0], activeFrames: [1, 4], recoveryFrames: [5],
        telegraph: 0.8, active: 0, recovery: 0.95, crashRecovery: 2.0,
        damage: 26, type: 'physical', knockback: 950, speed: 1400, distance: 1100, hitHeight: 190,
        range: [380, 1500], cooldown: 5, weight: 2,
      },
    },
    phases: [
      { hpBelow: 1.0, speedMul: 1.0 },
      { hpBelow: 0.5, speedMul: 1.18, roar: true, roarAttack: 'fireball' },
    ],
  },

  // Level 3. Larger and armored, ridden into battle. Its armor cuts sword
  // damage hard; the ground slam cracks it open (vulnerable), and so does a
  // scorpion bolt. Hurt it too fast and it takes to the sky.
  meleys: {
    name: 'Meleys, the Red Queen',
    sprite: 'dragon_meleys',
    scale: 1.3,
    maxHp: 1500,
    poise: 420,
    poiseRegen: 60,
    staggerTime: 1.4,
    staggerDamageMul: 1.25,
    resist: { physical: 1.0, fire: 0.3, frost: 1.3 },
    weakPoint: { mul: 1.25 },
    moveSpeed: 210,
    turnDelay: 0.5,
    idleTime: [0.4, 0.8],
    closeRange: 480,
    tricks: { delay: [0, 0.35], feint: 0.12, chain: 0.25, hop: 0.12, quickTurn: 0.4 },
    armor: { taken: 0.3, duration: [5, 7], cooldown: [5, 8], windup: 0.8, startDelay: 3 },
    vulnerable: { taken: 1.6 },
    flyDefense: { burst: 0.11, window: 3.5, cooldown: 15, startDelay: 6, attack: 'sky_retreat' },
    hurtboxes: {
      body: { x: -200, y: -230, w: 440, h: 200 },
      head: { size: 135 },
    },
    attacks: {
      bite: {
        kind: 'melee', anim: 'attack', telegraphFrames: [0, 1], activeFrames: [2, 3], recoveryFrames: [4, 5],
        telegraph: 0.55, active: 0.2, recovery: 0.75,
        damage: 22, type: 'physical', knockback: 780, lunge: 380,
        hitbox: { w: 240, h: 210 },
        range: [0, 430], cooldown: 1.4, weight: 2.5,           // short range
      },
      slam: {
        kind: 'slam', anim: 'slam', telegraphFrames: [0, 1, 2], activeFrames: [3, 4], recoveryFrames: [4, 5],
        telegraph: 1.15, active: 0.25, recovery: 2.4,
        damage: 30, type: 'physical', impactRadius: 260, knockback: 900,
        waveSpeed: 1050, waveRange: 1100, waveHeight: 90, waveDamage: 18,
        vulnerableTime: 2.6,
        range: [0, 700], cooldown: 6, weight: 2.5,
      },
      charge: {
        kind: 'charge', anim: 'charge', telegraphFrames: [0], activeFrames: [1, 4], recoveryFrames: [5],
        telegraph: 0.85, active: 0, recovery: 1.0, crashRecovery: 2.0,
        damage: 30, type: 'physical', knockback: 1000, speed: 1350, distance: 1100, hitHeight: 200,
        range: [420, 1600], cooldown: 5, weight: 2,
      },
      sky_retreat: {
        kind: 'skyward', anim: 'flight', telegraph: 0, active: 0, recovery: 1.0,
        altitude: 470, duration: 8, fireEvery: 1.8, fireLead: 0.9, downedTime: 3.0,
        damage: 18, splashDamage: 10, splashRadius: 130, type: 'fire', knockback: 600,
        projectileSpeed: 1100, gravity: 400, radius: 30,
        range: [1e9, 1e9], cooldown: 0, weight: 0,             // only triggered by the flight defense
      },
    },
    phases: [
      { hpBelow: 1.0, speedMul: 1.0 },
      { hpBelow: 0.5, speedMul: 1.15, roar: true, roarAttack: 'slam' },
    ],
  },

  // Level 4. The hardest yet: fearless (never staggers, never left
  // vulnerable), fast, and merciless when enraged below 55%: it seizes and
  // hurls the player and rains burning wreckage. Every attack is still
  // telegraphed and always has a way out.
  rhagal: {
    name: 'Rhagal, the Ashen Terror',
    fireCue: 'dracarys',                 // assets/media/dracarys.* if the player has added it
    sprite: 'dragon_rhagal',
    scale: 1.1,
    maxHp: 1650,
    fearless: true,
    poise: 1e9,
    poiseRegen: 0,
    staggerTime: 0,
    staggerDamageMul: 1,
    resist: { physical: 1.0, fire: 0.2, frost: 1.2, light: 1.0 },
    weakPoint: { mul: 1.15 },
    moveSpeed: 270,
    turnDelay: 0.25,
    idleTime: [0.2, 0.5],
    closeRange: 420,
    tricks: { delay: [0, 0.3], feint: 0.2, chain: 0.4, hop: 0.2, quickTurn: 0.6 },
    punish: { hits: 3, window: 1.5, attack: 'lunge_bite', cooldown: 3 },
    hurtboxes: {
      body: { x: -200, y: -230, w: 440, h: 200 },
      head: { size: 125 },
    },
    attacks: {
      claw: {
        kind: 'melee', anim: 'attack', telegraphFrames: [0, 1], activeFrames: [2, 3], recoveryFrames: [4, 5],
        telegraph: 0.5, active: 0.2, recovery: 0.55,
        damage: 22, type: 'physical', knockback: 760, lunge: 320, hitbox: { w: 230, h: 200 },
        range: [0, 460], cooldown: 1.1, weight: 2,
      },
      lunge_bite: {                    // only via `punish`: answers button-mashing
        kind: 'melee', anim: 'attack', telegraphFrames: [1], activeFrames: [2, 3], recoveryFrames: [4, 5],
        telegraph: 0.42, active: 0.22, recovery: 0.6,
        damage: 30, type: 'physical', knockback: 950, lunge: 950, hitbox: { w: 260, h: 210 },
        range: [1e9, 1e9], cooldown: 0, weight: 0,
      },
      inferno: {                       // long horizontal breath along the bridge
        kind: 'breath', anim: 'breath_level', telegraphFrames: [0, 1, 2], activeFrames: [3, 6], recoveryFrames: [7],
        telegraph: 1.35, active: 2.0, recovery: 0.7, green: true,
        tickDamage: 6, tickRate: 0.12, type: 'fire', streamLength: 1500, groundSpread: 0, flameSpeed: 1900,
        range: [300, 1700], cooldown: 5, weight: 2.5,
      },
      dive: {
        kind: 'dive', anim: 'flight', telegraph: 0, active: 0, recovery: 0.7,
        altitude: 390, track: 0.9, lock: 0.7, diveTime: 0.26, impactRadius: 230,
        damage: 32, type: 'physical', knockback: 950,
        range: [0, 9999], cooldown: 6, weight: 2,
      },
      charge: {
        kind: 'charge', anim: 'charge', telegraphFrames: [0], activeFrames: [1, 4], recoveryFrames: [5],
        telegraph: 0.75, active: 0, recovery: 0.8, crashRecovery: 0.8,
        damage: 28, type: 'physical', knockback: 1000, speed: 1500, distance: 1100, hitHeight: 200,
        range: [380, 1500], cooldown: 5.5, weight: 1.5,
      },
      tail_flame: {
        kind: 'sweep', anim: 'flame_sweep', telegraphFrames: [0, 1], activeFrames: [2, 5], recoveryFrames: [6],
        telegraph: 0.8, active: 0, recovery: 0.8,
        damage: 22, type: 'fire', knockback: 560, waveSpeed: 1100, waveLength: 260, waveHeight: 110, reach: 1300,
        range: [200, 1200], cooldown: 5, weight: 1.5,
      },
      grab: {
        phase: 2, kind: 'grab', anim: 'attack', telegraphFrames: [0, 1], activeFrames: [2, 3],
        telegraph: 0.65, active: 0.3, recovery: 0.7,
        damage: 16, throwDamage: 14, hold: 0.7, throwSpeed: 1500, lunge: 700, hitbox: { w: 240, h: 210 },
        range: [0, 560], cooldown: 6, weight: 3,
      },
      ash_rain: {
        phase: 2, kind: 'debris', anim: 'stagger', telegraph: 0.8, active: 1.4, recovery: 0.4,
        count: 4, warn: 1.1, radius: 115, damage: 22,
        range: [0, 9999], cooldown: 9, weight: 2,
      },
    },
    phases: [
      { hpBelow: 1.0, speedMul: 1.05 },
      { hpBelow: 0.55, speedMul: 1.3, roar: true, roarAttack: 'ash_rain' },
    ],
  },

  // Level 5, the final-tier fight. Enormous, armored in segments (each plate
  // must be broken before the joint beneath takes real damage), ridden by
  // Aemond Targaryen, and it rises again after its first death with a new
  // health pool and new attacks. Every attack keeps a telegraph and an
  // escape; recoveries never drop below `minRecovery`.
  vhagar: {
    name: 'Vhagar, the Doom of the North',
    title: 'VHAGAR',
    subtitle: 'The Doom of the North  ·  ridden by Aemond Targaryen',
    fireCue: 'vhagar_fire',              // assets/media/vhagar_fire.* if the player has added it
    sprite: 'dragon_vhagar',
    scale: 1.5,
    maxHp: 2200,
    poise: 520,
    poiseRegen: 70,
    staggerTime: 1.6,
    staggerDamageMul: 1.2,
    resist: { physical: 1.0, fire: 0.1, frost: 1.1, light: 0.9 },
    weakPoint: { mul: 1.2 },
    moveSpeed: 165,
    turnDelay: 0.6,
    idleTime: [0.8, 1.2],
    closeRange: 540,
    minRecovery: 0.5,
    stomp: true,
    // defense mechanisms: mashing raises the Wing Guard; a burst of damage sends it into the sky
    // (Aemond attacks from there); heavy pressure from phase II makes the plates molten (hits burn you)
    punish: { hits: 3, window: 1.3, attack: 'wing_guard', cooldown: 6 },
    flyDefense: { burst: 0.07, window: 3.0, cooldown: 16, startDelay: 10, attack: 'sky_reign' },
    moltenHide: { burst: 0.045, window: 2.5, duration: 2.6, cooldown: 11, startDelay: 6, taken: 0.35, reflect: 9,
                  minPhase: 1 },
    tricks: { delay: [0, 0.25], feint: 0, chain: 0, hop: 0, quickTurn: 0.2 },
    armorSegments: {
      exposedTaken: 1.45,         // damage multiplier on a broken plate (times the weapon's exposedMul)
      braced: 0.6,                // intact plates during a wind-up: even less gets through
      breakStagger: 1.3,
      parts: {
        head: { hp: 150, label: 'Head' },
        chest: { hp: 240, label: 'Chest' },
        foreleg: { hp: 200, label: 'Forelegs' },
        wing: { hp: 160, label: 'Wing joints' },
        tail: { hp: 140, label: 'Tail base' },
      },
    },
    hurtboxes: {
      body: { x: -190, y: -250, w: 380, h: 210 },
      head: { size: 120 },
      chest: { w: 130, h: 120 }, foreleg: { w: 84, h: 130 }, wing: { w: 120, h: 92 }, tail: { w: 150, h: 84 },
    },
    attacks: {
      bite: {                          // a missed bite leaves the head and neck exposed
        kind: 'melee', anim: 'attack', telegraphFrames: [0, 1], activeFrames: [2, 3], recoveryFrames: [4, 5],
        telegraph: 0.8, active: 0.24, recovery: 0.8,
        damage: 30, type: 'physical', knockback: 1050, lunge: 420, hitbox: { w: 300, h: 260 },
        exposeOnMiss: { seg: 'head', time: 1.8, recovery: 1.5 },
        chainTo: ['scorched_breath', 'wingstorm'],
        range: [0, 640], cooldown: 1.8, weight: 2.5,
      },
      slam: {                          // cracks nearby stone and ice
        kind: 'slam', anim: 'slam', telegraphFrames: [0, 1, 2], activeFrames: [3, 4], recoveryFrames: [4, 5],
        telegraph: 1.2, active: 0.25, recovery: 1.4,
        damage: 34, type: 'physical', impactRadius: 280, knockback: 1000,
        waveSpeed: 1050, waveRange: 1300, waveHeight: 95, waveDamage: 20, breakRadius: 420,
        chainTo: ['wingstorm', 'tail_ruin'],
        range: [0, 780], cooldown: 6, weight: 2.2, riderSignal: true,
      },
      charge: {                        // pillars stop it; the far wall stuns it; a set spear impales it
        kind: 'charge', anim: 'charge', telegraphFrames: [0], activeFrames: [1, 4], recoveryFrames: [5],
        telegraph: 1.0, active: 0, recovery: 0.9, crashRecovery: 2.4, edgeRecovery: 1.6,
        damage: 32, type: 'physical', knockback: 1100, speed: 1250, distance: 1500, hitHeight: 260, hitLow: 140,
        range: [480, 2000], cooldown: 6, weight: 2,
      },
      scorched_breath: {               // aims while winding up, then sweeps a fixed path
        phase: 2, kind: 'scorch', anim: 'fire_breath', telegraphFrames: [0, 1, 2], activeFrames: [3, 6],
        recoveryFrames: [7], telegraph: 1.4, active: 1.5, recovery: 0.9, lockAt: 0.8,
        sweepFrom: 260, sweepPast: 560, tickDamage: 6, tickRate: 0.12, type: 'fire',
        burn: { width: 150, life: 2.6, tick: 3, rate: 0.4 },
        range: [300, 2200], cooldown: 6.5, weight: 2.4, riderSignal: true,
      },
      wingstorm: {                     // brace (S), hide behind stone or roll through each gust
        phase: 2, kind: 'gust', anim: 'wingspread', telegraphFrames: [0, 1], activeFrames: [2, 5], recoveryFrames: [6],
        telegraph: 1.1, active: 1.6, recovery: 0.8,
        force: 2600, maxPush: 820, debris: 3, debrisDamage: 14, type: 'physical',
        range: [0, 2600], cooldown: 8, weight: 1.8, riderSignal: true,
      },
      hunting_dive: {                  // leaves the screen; its shadow marks the impact
        phase: 2, kind: 'dive', anim: 'flight', telegraph: 0, active: 0, recovery: 0.7, landRecovery: 1.6,
        altitude: 1300, track: 1.1, lock: 0.8, diveTime: 0.34, impactRadius: 260, shadow: true,
        damage: 34, type: 'physical', knockback: 1000,
        shockwave: { waveSpeed: 1000, waveRange: 700, waveHeight: 80, waveDamage: 16, knockback: 700 },
        range: [0, 9999], cooldown: 9, weight: 1.6,
      },
      ember_minefield: {               // marked patches erupt in sequence; gaps are always left
        phase: 3, kind: 'mines', anim: 'fire_breath', telegraphFrames: [0, 1, 2], activeFrames: [3, 6],
        recoveryFrames: [7], telegraph: 1.0, active: 1.0, recovery: 0.8,
        count: 6, radius: 105, warn: 1.5, stagger: 0.18, damage: 26, type: 'fire',
        range: [0, 9999], cooldown: 9, weight: 2,
      },
      tail_ruin: {                     // low sweep = jump it, high lash = roll under it
        phase: 3, kind: 'tailsweep', anim: 'tail_low', telegraphFrames: [0, 1], activeFrames: [2, 4],
        recoveryFrames: [5], telegraph: 0.95, active: 0.4, recovery: 0.8, rear: true,
        reach: 660, near: 120, low: [-110, 0], high: [-330, -158], damage: 28, type: 'physical', knockback: 1000,
        range: [0, 760], cooldown: 5, weight: 2.2,
      },
      infernal_crossfire: {            // flies the length of the arena; cover and gaps in the trail save you
        phase: 4, kind: 'strafe', anim: 'flight', telegraph: 1.2, active: 0, recovery: 1.0,
        altitude: 560, passSpeed: 900, bandWidth: 190, tickDamage: 7, tickRate: 0.12, type: 'fire', shelter: true,
        heatTrail: { every: 300, width: 150, life: 2.0, tick: 3, rate: 0.4 },
        range: [0, 9999], cooldown: 11, weight: 1.6,
      },
      dragonfall: {                    // a roll timed under the impact opens the head
        phase: 4, kind: 'dive', anim: 'flight', telegraph: 0, active: 0, recovery: 0.7, landRecovery: 1.0,
        altitude: 1300, track: 0.8, lock: 0.6, diveTime: 0.22, impactRadius: 280, shadow: true, angled: true,
        damage: 38, type: 'physical', knockback: 1100,
        shockwave: { waveSpeed: 1250, waveRange: 1100, waveHeight: 90, waveDamage: 18, knockback: 800 },
        perfectDodge: { window: 1.6, expose: 'head' },
        range: [0, 9999], cooldown: 8, weight: 1.8,
      },
      sky_reign: {                     // takes to the sky: Aemond hurls spears, then a low swoop with his blade
        phase: 2, kind: 'skyreign', anim: 'flight', telegraph: 0, active: 0, recovery: 0.8, landRecovery: 1.3,
        altitude: 470, spears: 3, spearEvery: 1.3, spearLead: 0.8, spearLock: 0.4, spearRadius: 85,
        spearSpeed: 1700, hover: 1.0, swoopWarn: 0.9, swoopSpeed: 1250, swoopBand: [-310, -158], downedTime: 3.2,
        damage: 40, type: 'physical', knockback: 900,
        range: [0, 9999], cooldown: 15, weight: 1.3,
      },
      earthsplitter: {                 // a rift of stone spikes runs at the warrior: roll through it or get up high
        phase: 2, kind: 'rift', anim: 'slam', telegraphFrames: [0, 1, 2], activeFrames: [3, 4], recoveryFrames: [4, 5],
        telegraph: 1.0, active: 0.3, recovery: 1.0, riftSpeed: 950, riftRange: 1700, riftHeight: 280, riftWidth: 110,
        damage: 40, type: 'physical', knockback: 900,
        range: [300, 1900], cooldown: 8, weight: 1.6,
      },
      gate_hurl: {                     // tears loose a block of the gate and hurls it; the landing is marked
        phase: 2, kind: 'fireball', anim: 'attack', telegraphFrames: [0, 1], activeFrames: [2], recoveryFrames: [4, 5],
        telegraph: 1.1, active: 0.4, recovery: 0.9, rock: true, lockAt: 0.72, countByPhase: [1, 2, 2, 3], volleyGap: 0.8,
        damage: 34, splashDamage: 20, splashRadius: 150, radius: 46, type: 'physical', knockback: 800,
        projectileSpeed: 1250, gravity: 700,
        range: [500, 2200], cooldown: 8, weight: 1.6,
      },
      cinder_storm: {                  // roars at the sky; burning cinders fall in marked rings, a gap always left
        phase: 3, kind: 'debris', anim: 'stagger', telegraph: 1.0, active: 1.6, recovery: 0.6,
        count: 6, warn: 1.3, radius: 115, damage: 26,
        range: [0, 9999], cooldown: 11, weight: 1.6,
      },
      seize: {                         // jaws snap shut on the warrior and hurl him across the gate
        phase: 3, kind: 'grab', anim: 'attack', telegraphFrames: [0, 1], activeFrames: [2, 3],
        telegraph: 0.8, active: 0.32, recovery: 0.9,
        damage: 30, throwDamage: 12, hold: 0.8, throwSpeed: 1500, lunge: 620, hitbox: { w: 290, h: 240 },
        range: [0, 640], cooldown: 9, weight: 1.6,
      },
      wing_guard: {                    // answers button-mashing: the wing comes up and blocks, then buffets
        kind: 'guard', anim: 'wingspread', telegraph: 0.25, active: 1.5, recovery: 0.7, buffetAt: 1.05,
        buffetRange: 470, buffetHeight: 300, damage: 40, type: 'physical', knockback: 1000,
        range: [1e9, 1e9], cooldown: 0, weight: 0,
      },
    },
    phases: [
      { hpBelow: 1.0, speedMul: 0.9, name: 'The Ancient Beast' },
      { hpBelow: 0.75, speedMul: 0.96, roar: true, roarAttack: 'scorched_breath', name: 'The Burning Colossus',
        line: 'Breathe, Vhagar. Make him ash.' },
      { hpBelow: 0.5, speedMul: 1.02, roar: true, roarAttack: 'tail_ruin', name: 'The Armor Shatters',
        crack: ['head', 'chest', 'foreleg'], expose: ['wing', 'tail'], line: 'You scratch old iron, northman.',
        tricks: { delay: [0, 0.25], feint: 0, chain: 0.5, hop: 0, quickTurn: 0.35 } },
      { hpBelow: 0.25, speedMul: 1.12, roar: true, roarAttack: 'dragonfall', name: 'Rider and Dragon Unleashed',
        line: 'Enough. Together, girl. Now!',
        tricks: { delay: [0, 0.2], feint: 0.3, chain: 0.45, hop: 0, quickTurn: 0.4 } },
    ],
    // ---- the second life: a separate pool, new state, new attacks
    secondLife: {
      sprite: 'dragon_vhagar_awakened',
      maxHp: 1700,
      poise: 600,
      staggerTime: 1.5,
      moveSpeed: 180,
      idleTime: [0.7, 1.05],
      tricks: { delay: [0, 0.2], feint: 0.25, chain: 0.4, hop: 0, quickTurn: 0.4 },
      attacks: {
        bite: {
          kind: 'melee', anim: 'attack', telegraphFrames: [0, 1], activeFrames: [2, 3], recoveryFrames: [4, 5],
          telegraph: 0.66, active: 0.22, recovery: 0.75,
          damage: 30, type: 'physical', knockback: 1050, lunge: 460, hitbox: { w: 300, h: 260 },
          exposeOnMiss: { seg: 'head', time: 1.5, recovery: 1.3 }, chainTo: ['inferno_pulse', 'wingstorm'],
          range: [0, 640], cooldown: 1.8, weight: 2.2,
        },
        slam: {
          kind: 'slam', anim: 'slam', telegraphFrames: [0, 1, 2], activeFrames: [3, 4], recoveryFrames: [4, 5],
          telegraph: 1.0, active: 0.25, recovery: 1.2,
          damage: 34, type: 'physical', impactRadius: 280, knockback: 1000,
          waveSpeed: 1150, waveRange: 1400, waveHeight: 95, waveDamage: 20, breakRadius: 420,
          range: [0, 780], cooldown: 6, weight: 1.8, riderSignal: true,
        },
        charge: {
          kind: 'charge', anim: 'charge', telegraphFrames: [0], activeFrames: [1, 4], recoveryFrames: [5],
          telegraph: 0.85, active: 0, recovery: 0.85, crashRecovery: 2.2, edgeRecovery: 1.4,
          damage: 32, type: 'physical', knockback: 1100, speed: 1350, distance: 1500, hitHeight: 260, hitLow: 140,
          range: [480, 2000], cooldown: 6, weight: 1.6,
        },
        scorched_breath: {
          kind: 'scorch', anim: 'fire_breath', telegraphFrames: [0, 1, 2], activeFrames: [3, 6], recoveryFrames: [7],
          telegraph: 1.2, active: 1.5, recovery: 0.85, lockAt: 0.8, sweepFrom: 260, sweepPast: 620,
          tickDamage: 6, tickRate: 0.12, type: 'fire', burn: { width: 150, life: 2.8, tick: 3, rate: 0.4 },
          range: [300, 2200], cooldown: 7, weight: 1.8, riderSignal: true,
        },
        wingstorm: {
          kind: 'gust', anim: 'wingspread', telegraphFrames: [0, 1], activeFrames: [2, 5], recoveryFrames: [6],
          telegraph: 1.0, active: 1.6, recovery: 0.75, force: 2800, maxPush: 860, debris: 4, debrisDamage: 14,
          type: 'physical', range: [0, 2600], cooldown: 8, weight: 1.4, riderSignal: true,
        },
        tail_ruin: {
          kind: 'tailsweep', anim: 'tail_low', telegraphFrames: [0, 1], activeFrames: [2, 4], recoveryFrames: [5],
          telegraph: 0.9, active: 0.4, recovery: 0.75, rear: true,
          reach: 680, near: 120, low: [-110, 0], high: [-330, -158], damage: 28, type: 'physical', knockback: 1000,
          range: [0, 760], cooldown: 5, weight: 2,
        },
        inferno_pulse: {               // a ring of fire expands from the body: jump it or roll through
          kind: 'pulse', anim: 'stagger', telegraph: 1.2, active: 1.7, recovery: 0.9,
          speed: 950, maxRadius: 1500, ringWidth: 100, ringHeight: 170, damage: 28, type: 'fire', knockback: 700,
          burn: { radius: 300, width: 140, life: 2.2, tick: 3, rate: 0.4 },
          range: [0, 1500], cooldown: 7, weight: 2.2,
        },
        armor_rain: {                  // tears off its own plates and throws them; each landing is marked
          kind: 'platerain', anim: 'stagger', telegraph: 1.1, active: 1.6, recovery: 0.8,
          count: 5, radius: 95, flight: 1.0, damage: 24, type: 'fire', knockback: 600,
          pool: { width: 170, life: 2.6, tick: 3, rate: 0.4 },
          range: [0, 9999], cooldown: 10, weight: 1.6,
        },
        shadow_hunt: {                 // false shadows pass; only the one with burning eyes dives
          kind: 'shadowhunt', anim: 'flight', telegraph: 0, active: 0, recovery: 0.7, landRecovery: 1.4,
          falsePasses: [2, 3], passTime: 0.9, lock: 0.9, diveTime: 0.26, impactRadius: 250,
          damage: 36, type: 'physical', knockback: 1000,
          shockwave: { waveSpeed: 1100, waveRange: 800, waveHeight: 85, waveDamage: 16, knockback: 700 },
          range: [0, 9999], cooldown: 12, weight: 1.5,
        },
        triple_cataclysm: {            // bite, wingstorm, slam; a plate broken mid-sequence ends it
          kind: 'combo', sequence: ['tc_bite', 'tc_gust', 'tc_slam'], gap: 0.35, telegraph: 0, active: 0,
          recovery: 1.6, interruptStagger: 2.4,
          range: [0, 900], cooldown: 14, weight: 1.6,
        },
        tc_bite: {
          kind: 'melee', anim: 'attack', telegraphFrames: [0, 1], activeFrames: [2, 3], recoveryFrames: [4, 5],
          telegraph: 0.7, active: 0.22, recovery: 0.5,
          damage: 28, type: 'physical', knockback: 950, lunge: 380, hitbox: { w: 300, h: 260 },
          exposeOnMiss: { seg: 'head', time: 1.0, recovery: 0.5 },
          range: [1e9, 1e9], cooldown: 0, weight: 0,
        },
        tc_gust: {
          kind: 'gust', anim: 'wingspread', telegraphFrames: [0, 1], activeFrames: [2, 5], recoveryFrames: [6],
          telegraph: 0.8, active: 1.1, recovery: 0.5, force: 2600, maxPush: 820, debris: 2, debrisDamage: 12,
          type: 'physical', range: [1e9, 1e9], cooldown: 0, weight: 0,
        },
        tc_slam: {
          kind: 'slam', anim: 'slam', telegraphFrames: [0, 1, 2], activeFrames: [3, 4], recoveryFrames: [4, 5],
          telegraph: 0.95, active: 0.25, recovery: 0.6,
          damage: 32, type: 'physical', impactRadius: 280, knockback: 1000,
          waveSpeed: 1100, waveRange: 1300, waveHeight: 95, waveDamage: 18, breakRadius: 420,
          range: [1e9, 1e9], cooldown: 0, weight: 0,
        },
        sky_reign: {                     // takes to the sky: Aemond hurls spears, then a low swoop with his blade
          kind: 'skyreign', anim: 'flight', telegraph: 0, active: 0, recovery: 0.8, landRecovery: 1.3,
          altitude: 470, spears: 4, spearEvery: 1.1, spearLead: 0.8, spearLock: 0.4, spearRadius: 85,
          spearSpeed: 1700, hover: 1.0, swoopWarn: 0.9, swoopSpeed: 1250, swoopBand: [-310, -158], downedTime: 3.2,
          damage: 40, type: 'physical', knockback: 900,
          range: [0, 9999], cooldown: 15, weight: 1.3,
        },
        earthsplitter: {                 // a rift of stone spikes runs at the warrior: roll through it or get up high
          kind: 'rift', anim: 'slam', telegraphFrames: [0, 1, 2], activeFrames: [3, 4], recoveryFrames: [4, 5],
          telegraph: 0.9, active: 0.3, recovery: 1.0, riftSpeed: 1050, riftRange: 1700, riftHeight: 280, riftWidth: 110,
          damage: 40, type: 'physical', knockback: 900,
          range: [300, 1900], cooldown: 8, weight: 1.6,
        },
        gate_hurl: {                     // tears loose a block of the gate and hurls it; the landing is marked
          kind: 'fireball', anim: 'attack', telegraphFrames: [0, 1], activeFrames: [2], recoveryFrames: [4, 5],
          telegraph: 1.1, active: 0.4, recovery: 0.9, rock: true, lockAt: 0.72, countByPhase: [1, 2, 2, 3], volleyGap: 0.8,
          damage: 34, splashDamage: 20, splashRadius: 150, radius: 46, type: 'physical', knockback: 800,
          projectileSpeed: 1250, gravity: 700,
          range: [500, 2200], cooldown: 8, weight: 1.6,
        },
        cinder_storm: {                  // roars at the sky; burning cinders fall in marked rings, a gap always left
          kind: 'debris', anim: 'stagger', telegraph: 1.0, active: 1.6, recovery: 0.6,
          count: 6, warn: 1.3, radius: 115, damage: 26,
          range: [0, 9999], cooldown: 11, weight: 1.6,
        },
        seize: {                         // jaws snap shut on the warrior and hurl him across the gate
          kind: 'grab', anim: 'attack', telegraphFrames: [0, 1], activeFrames: [2, 3],
          telegraph: 0.8, active: 0.32, recovery: 0.9,
          damage: 30, throwDamage: 12, hold: 0.8, throwSpeed: 1500, lunge: 620, hitbox: { w: 290, h: 240 },
          range: [0, 640], cooldown: 9, weight: 1.6,
        },
        wing_guard: {                    // answers button-mashing: the wing comes up and blocks, then buffets
          kind: 'guard', anim: 'wingspread', telegraph: 0.25, active: 1.5, recovery: 0.7, buffetAt: 1.05,
          buffetRange: 470, buffetHeight: 300, damage: 40, type: 'physical', knockback: 1000,
          range: [1e9, 1e9], cooldown: 0, weight: 0,
        },
        last_ember: {                  // the long final wind-up: break the glowing chest, or hide behind stone
          kind: 'lastember', anim: 'fire_breath', telegraphFrames: [0, 1, 2], activeFrames: [3, 6], recoveryFrames: [7],
          telegraph: 4.5, active: 1.1, recovery: 1.2, interruptDamage: 140, interruptStagger: 5.0,
          damageFrac: 0.6, type: 'fire', range: [1e9, 1e9], cooldown: 0, weight: 0,
        },
      },
      phases: [
        { hpBelow: 1.0, speedMul: 1.05, name: 'The Dread Awakens' },
        { hpBelow: 0.6, speedMul: 1.1, roar: true, roarAttack: 'armor_rain', name: 'Molten Fury',
          line: 'She has outlived kings. She will outlive you.' },
        { hpBelow: 0.22, speedMul: 1.15, roar: true, roarAttack: 'last_ember', name: 'The Last Ember',
          line: 'Give him everything, Vhagar!' },
      ],
    },
  },

  // Level 6, the Dragonpit: two dragons at once. They hold the warrior
  // between them (one each side), only one strikes at a time on its own,
  // and the leader (Drogon) calls joint moves: a pincer charge, a twin bite
  // that one perfect roll beats, a dance of alternating dives, and fire and
  // ice together. When one falls, the other enrages.
  drogon: {
    name: 'Drogon, the Black Dread',
    title: 'DROGON',
    fireCue: 'dracarys',                 // assets/media/dracarys.* if the player has added it
    sprite: 'dragon_drogon',
    scale: 1.3,
    maxHp: 1800,
    poise: 420,
    poiseRegen: 60,
    staggerTime: 1.2,
    staggerDamageMul: 1.2,
    resist: { physical: 1.0, fire: 0.1, frost: 1.2, light: 1.0 },
    weakPoint: { mul: 1.25 },
    moveSpeed: 240,
    turnDelay: 0.35,
    idleTime: [0.45, 0.75],
    closeRange: 460,
    minRecovery: 0.45,
    flank: 640,
    leader: true,
    pairChance: 0.5,
    pairCooldown: 7,
    tricks: { delay: [0, 0.2], feint: 0.1, chain: 0.25, hop: 0, quickTurn: 0.45 },
    punish: { hits: 4, window: 1.4, attack: 'lunge_bite', cooldown: 4 },
    hurtboxes: {
      body: { x: -200, y: -230, w: 440, h: 200 },
      head: { size: 130 },
    },
    attacks: {
      bite: {
        kind: 'melee', anim: 'attack', telegraphFrames: [0, 1], activeFrames: [2, 3], recoveryFrames: [4, 5],
        telegraph: 0.6, active: 0.2, recovery: 0.6,
        damage: 26, type: 'physical', knockback: 820, lunge: 360, hitbox: { w: 240, h: 210 },
        range: [0, 470], cooldown: 1.3, weight: 2.2,
      },
      lunge_bite: {                    // only via `punish`: answers button-mashing
        kind: 'melee', anim: 'attack', telegraphFrames: [1], activeFrames: [2, 3], recoveryFrames: [4, 5],
        telegraph: 0.5, active: 0.22, recovery: 0.6,
        damage: 30, type: 'physical', knockback: 950, lunge: 900, hitbox: { w: 260, h: 210 },
        range: [1e9, 1e9], cooldown: 0, weight: 0,
      },
      inferno: {                       // a long black-red jet along the sand
        kind: 'breath', anim: 'breath_level', telegraphFrames: [0, 1, 2], activeFrames: [3, 6], recoveryFrames: [7],
        telegraph: 1.2, active: 1.6, recovery: 0.7,
        tickDamage: 6, tickRate: 0.12, type: 'fire', streamLength: 1300, groundSpread: 0, flameSpeed: 1800,
        range: [300, 1500], cooldown: 6, weight: 2,
      },
      tail_flame: {
        kind: 'sweep', anim: 'flame_sweep', telegraphFrames: [0, 1], activeFrames: [2, 5], recoveryFrames: [6],
        telegraph: 0.85, active: 0, recovery: 0.8,
        damage: 22, type: 'fire', knockback: 560, waveSpeed: 1100, waveLength: 260, waveHeight: 110, reach: 1300,
        range: [200, 1200], cooldown: 5, weight: 1.5,
      },
      charge: {
        kind: 'charge', anim: 'charge', telegraphFrames: [0], activeFrames: [1, 4], recoveryFrames: [5],
        telegraph: 0.85, active: 0, recovery: 0.9, crashRecovery: 1.6,
        damage: 28, type: 'physical', knockback: 1000, speed: 1450, distance: 1300, hitHeight: 230, hitLow: 135,
        range: [380, 1500], cooldown: 6, weight: 1.4,
      },
      dive: {
        kind: 'dive', anim: 'flight', telegraph: 0, active: 0, recovery: 0.8,
        altitude: 420, track: 0.9, lock: 0.7, diveTime: 0.28, impactRadius: 230,
        damage: 30, type: 'physical', knockback: 950,
        range: [0, 9999], cooldown: 8, weight: 1.2,
      },
      seize: {
        phase: 2, kind: 'grab', anim: 'attack', telegraphFrames: [0, 1], activeFrames: [2, 3],
        telegraph: 0.7, active: 0.3, recovery: 0.7,
        damage: 18, throwDamage: 14, hold: 0.7, throwSpeed: 1500, lunge: 700, hitbox: { w: 240, h: 210 },
        range: [0, 560], cooldown: 7, weight: 2,
      },
      // ---- joint moves (only started by `pairs`)
      pincer_charge: {
        kind: 'charge', anim: 'charge', telegraphFrames: [0], activeFrames: [1, 4], recoveryFrames: [5],
        telegraph: 1.0, active: 0, recovery: 0.9, crashRecovery: 1.6,
        damage: 28, type: 'physical', knockback: 1000, speed: 1400, distance: 1500, hitHeight: 230, hitLow: 135,
        range: [1e9, 1e9], cooldown: 0, weight: 0,
      },
      twin_bite: {
        kind: 'melee', anim: 'attack', telegraphFrames: [0, 1], activeFrames: [2, 3], recoveryFrames: [4, 5],
        telegraph: 0.8, active: 0.22, recovery: 0.7,
        damage: 26, type: 'physical', knockback: 850, lunge: 380, hitbox: { w: 240, h: 210 },
        range: [1e9, 1e9], cooldown: 0, weight: 0,
      },
      dance_dive: {
        kind: 'dive', anim: 'flight', telegraph: 0, active: 0, recovery: 0.8,
        altitude: 420, track: 0.8, lock: 0.65, diveTime: 0.26, impactRadius: 230,
        damage: 30, type: 'physical', knockback: 950,
        range: [1e9, 1e9], cooldown: 0, weight: 0,
      },
      fire_sweep: {
        kind: 'sweep', anim: 'flame_sweep', telegraphFrames: [0, 1], activeFrames: [2, 5], recoveryFrames: [6],
        telegraph: 1.0, active: 0, recovery: 0.8,
        damage: 22, type: 'fire', knockback: 560, waveSpeed: 1050, waveLength: 260, waveHeight: 110, reach: 1600,
        range: [1e9, 1e9], cooldown: 0, weight: 0,
      },
    },
    // lead attack (this dragon) + partner attack (Viserion), started together
    pairs: [
      { id: 'pincer', lead: 'pincer_charge', partner: 'pincer_charge', weight: 1.2, needs: 'far', beat: 0.75 },
      { id: 'twin_bite', lead: 'twin_bite', partner: 'twin_bite', weight: 1.4, needs: 'close' },
      { id: 'dance', lead: 'dance_dive', partner: 'dance_dive', partnerDelay: 1.5, weight: 1 },
      { id: 'fire_ice', lead: 'fire_sweep', partner: 'frost_breath', weight: 1.2 },
    ],
    phases: [
      { hpBelow: 1.0, speedMul: 1.0 },
      { hpBelow: 0.5, speedMul: 1.12, roar: true, roarAttack: 'inferno' },
    ],
  },

  viserion: {
    name: 'Viserion, the Frost-Gold',
    title: 'VISERION',
    palette: 'frost',
    vulnerable: { taken: 1.5 },                // shot down from his roost
    fireCue: 'dracarys',                 // assets/media/dracarys.* if the player has added it
    sprite: 'dragon_viserion',
    scale: 1.15,
    maxHp: 1500,
    poise: 380,
    poiseRegen: 60,
    staggerTime: 1.2,
    staggerDamageMul: 1.2,
    resist: { physical: 1.0, fire: 0.3, frost: 0.3, light: 1.0 },
    weakPoint: { mul: 1.25 },
    moveSpeed: 260,
    turnDelay: 0.35,
    idleTime: [0.45, 0.75],
    closeRange: 480,
    minRecovery: 0.45,
    flank: 640,
    // while Drogon is in a blow of his own, Viserion may lob a volley from range
    overlap: { attacks: ['fireballs'], chance: 0.35, minDist: 600 },
    tricks: { delay: [0, 0.2], feint: 0.12, chain: 0.25, hop: 0.1, quickTurn: 0.45 },
    punish: { hits: 4, window: 1.4, attack: 'lunge_bite', cooldown: 4 },
    flyDefense: { burst: 0.1, window: 3, cooldown: 16, startDelay: 8, attack: 'wing_roost' },
    hurtboxes: {
      body: { x: -190, y: -220, w: 420, h: 190 },
      head: { size: 120 },
    },
    attacks: {
      bite: {
        kind: 'melee', anim: 'attack', telegraphFrames: [0, 1], activeFrames: [2, 3], recoveryFrames: [4, 5],
        telegraph: 0.6, active: 0.2, recovery: 0.6,
        damage: 24, type: 'physical', knockback: 800, lunge: 380, hitbox: { w: 230, h: 200 },
        range: [0, 470], cooldown: 1.3, weight: 2,
      },
      lunge_bite: {
        kind: 'melee', anim: 'attack', telegraphFrames: [1], activeFrames: [2, 3], recoveryFrames: [4, 5],
        telegraph: 0.5, active: 0.22, recovery: 0.6,
        damage: 28, type: 'physical', knockback: 950, lunge: 900, hitbox: { w: 250, h: 200 },
        range: [1e9, 1e9], cooldown: 0, weight: 0,
      },
      frost_breath: {                  // pale-blue ice fire; it leaves frost that makes the sand slippery
        kind: 'breath', anim: 'fire_breath', telegraphFrames: [0, 1, 2], activeFrames: [3, 6], recoveryFrames: [7],
        telegraph: 1.0, active: 1.4, recovery: 0.7, blue: true,
        tickDamage: 5, tickRate: 0.12, type: 'frost', streamLength: 1100, groundSpread: 420, flameSpeed: 1500,
        frostPatch: { width: 170, life: 3.5 },
        range: [250, 1300], cooldown: 5.5, weight: 2,
      },
      fireballs: {                     // golden orbs: each ring locks before it bursts
        kind: 'fireball', anim: 'fire_breath', telegraphFrames: [0, 1, 2], activeFrames: [3], recoveryFrames: [7],
        telegraph: 0.95, active: 0.5, recovery: 0.8, lockAt: 0.75, countByPhase: [2, 3], volleyGap: 0.55,
        damage: 22, splashDamage: 12, splashRadius: 125, radius: 30, type: 'fire', knockback: 600,
        projectileSpeed: 1150, gravity: 450,
        range: [380, 1800], cooldown: 5, weight: 1.8,
      },
      wing_roost: {                    // up onto the wind above the pit, raining fire (a scorpion brings him down)
        kind: 'skyward', anim: 'flight', telegraph: 0, active: 0, recovery: 1.0,
        altitude: 470, duration: 6.5, fireEvery: 1.6, fireLead: 0.9, downedTime: 3.0,
        damage: 20, splashDamage: 10, splashRadius: 130, type: 'fire', knockback: 600,
        projectileSpeed: 1100, gravity: 400, radius: 30,
        range: [1e9, 1e9], cooldown: 0, weight: 0,
      },
      pincer_charge: {
        kind: 'charge', anim: 'charge', telegraphFrames: [0], activeFrames: [1, 4], recoveryFrames: [5],
        telegraph: 1.0, active: 0, recovery: 0.9, crashRecovery: 1.6,
        damage: 26, type: 'physical', knockback: 1000, speed: 1400, distance: 1500, hitHeight: 220, hitLow: 135,
        range: [1e9, 1e9], cooldown: 0, weight: 0,
      },
      twin_bite: {
        kind: 'melee', anim: 'attack', telegraphFrames: [0, 1], activeFrames: [2, 3], recoveryFrames: [4, 5],
        telegraph: 0.8, active: 0.22, recovery: 0.7,
        damage: 24, type: 'physical', knockback: 850, lunge: 380, hitbox: { w: 230, h: 200 },
        range: [1e9, 1e9], cooldown: 0, weight: 0,
      },
      dance_dive: {
        kind: 'dive', anim: 'flight', telegraph: 0, active: 0, recovery: 0.8,
        altitude: 420, track: 0.8, lock: 0.65, diveTime: 0.26, impactRadius: 220,
        damage: 28, type: 'physical', knockback: 950,
        range: [1e9, 1e9], cooldown: 0, weight: 0,
      },
    },
    phases: [
      { hpBelow: 1.0, speedMul: 1.0 },
      { hpBelow: 0.5, speedMul: 1.12, roar: true, roarAttack: 'frost_breath' },
    ],
  },

  // ================================================================ Level 7: the Three Calamities
  // One at a time atop the Wall. Frostbrand (the ice sword granted at the
  // start) is what turns their openings into kills: it breaks Sunfyre's
  // marked dive, freezes Vermithor's marked weak point, and cracks
  // Balerion's core. The Frostpiercer launcher punishes predictable flight
  // and interrupts the great charged attacks.
  sunfyre: {
    name: 'Sunfyre, the Golden Terror',
    title: 'SUNFYRE',
    subtitle: 'The Golden Terror',
    voice: { pitch: 1.35, size: 0.45 },
    sprite: 'dragon_sunfyre',
    scale: 1.2,
    maxHp: 1500,
    poise: 380,
    poiseRegen: 60,
    staggerTime: 1.2,
    staggerDamageMul: 1.2,
    resist: { physical: 1.0, fire: 0.1, frost: 1.25, light: 1.0 },
    weakPoint: { mul: 1.3 },
    vulnerable: { taken: 1.6 },
    moveSpeed: 240,
    turnDelay: 0.35,
    idleTime: [0.5, 0.8],
    closeRange: 460,
    minRecovery: 0.5,
    tricks: { delay: [0, 0.2], feint: 0.08, chain: 0.15, hop: 0.2, quickTurn: 0.4 },
    punish: { hits: 4, window: 1.4, attack: 'wing_bait', cooldown: 6 },
    hurtboxes: {
      body: { x: -190, y: -220, w: 420, h: 190 },
      head: { size: 120 },
    },
    attacks: {
      bite: {
        kind: 'melee', anim: 'attack', telegraphFrames: [0, 1], activeFrames: [2, 3], recoveryFrames: [4, 5],
        telegraph: 0.6, active: 0.2, recovery: 0.65,
        damage: 24, type: 'physical', knockback: 820, lunge: 340, hitbox: { w: 230, h: 200 },
        range: [0, 460], cooldown: 1.4, weight: 2,
      },
      golden_breath: {                 // molten-gold fire that spreads along the walkway
        kind: 'breath', anim: 'fire_breath', telegraphFrames: [0, 1, 2], activeFrames: [3, 6], recoveryFrames: [7],
        telegraph: 1.0, active: 1.2, recovery: 0.7, gold: true,
        tickDamage: 6, tickRate: 0.12, type: 'fire', streamLength: 1100, groundSpread: 360, flameSpeed: 1500,
        range: [250, 1300], cooldown: 5.5, weight: 1.6,
      },
      golden_arcs: {                   // curved arcs of golden flame; each ring locks before it lands
        kind: 'fireball', anim: 'fire_breath', telegraphFrames: [0, 1, 2], activeFrames: [3], recoveryFrames: [7],
        telegraph: 0.9, active: 0.5, recovery: 0.8, lockAt: 0.72, countByPhase: [2, 3], volleyGap: 0.5, gold: true,
        damage: 22, splashDamage: 12, splashRadius: 120, radius: 30, type: 'fire', knockback: 600,
        projectileSpeed: 950, gravity: 1100,
        range: [380, 1900], cooldown: 5, weight: 1.6,
      },
      sky_dance: {                     // circles the arena, feints, then a marked dive (Frostbrand breaks it)
        kind: 'circling', anim: 'flight', telegraph: 0, active: 0, recovery: 0.8,
        altitude: [250, 420], passes: 2, passSpeed: 0.55, shotEvery: 1.45, shotLead: 0.75, feints: [1, 2],
        damage: 30, type: 'physical', knockback: 950, impactRadius: 230, diveTime: 0.42, mark: 0.95,
        missVulnerable: 2.6, breakWindow: 0.45, breakFreeze: 2.6,
        arc: { damage: 20, splashDamage: 10, splashRadius: 120, radius: 28, type: 'fire', knockback: 600,
               projectileSpeed: 900, gravity: 900, gold: true },
        range: [0, 9999], cooldown: 13, weight: 2.4,
      },
      wing_bait: {                     // backs off, head low, looking open: come close and the wings lash out
        kind: 'bait', anim: 'stagger', telegraph: 0, active: 0, recovery: 0.9,
        retreat: 380, hold: 1.9, trigger: 380, counterTelegraph: 0.55, reach: 400, height: 260,
        damage: 26, type: 'physical', knockback: 900,
        range: [0, 900], cooldown: 9, weight: 1.1,
      },
      flame_sweep: {
        kind: 'sweep', anim: 'flame_sweep', telegraphFrames: [0, 1], activeFrames: [2, 5], recoveryFrames: [6],
        telegraph: 0.85, active: 0, recovery: 0.8, gold: true,
        damage: 22, type: 'fire', knockback: 560, waveSpeed: 1100, waveLength: 260, waveHeight: 110, reach: 1300,
        range: [200, 1200], cooldown: 6, weight: 1.3,
      },
      dive: {                          // a plain marked dive; a miss leaves it open
        kind: 'dive', anim: 'flight', telegraph: 0, active: 0, recovery: 0.8,
        altitude: 420, track: 0.8, lock: 0.7, diveTime: 0.28, impactRadius: 230, missVulnerable: 2.0,
        damage: 28, type: 'physical', knockback: 950,
        range: [0, 9999], cooldown: 8, weight: 1.0,
      },
    },
    phases: [
      { hpBelow: 1.0, speedMul: 1.0, name: 'The Golden Terror' },
      { hpBelow: 0.5, speedMul: 1.15, roar: true, roarAttack: 'sky_dance', name: 'Molten Gold',
        tricks: { delay: [0, 0.22], feint: 0.18, chain: 0.25, hop: 0.25, quickTurn: 0.5 } },
    ],
  },

  vermithor: {
    name: 'Vermithor, the Bronze Fury',
    title: 'VERMITHOR',
    subtitle: 'The Bronze Fury',
    voice: { pitch: 0.8, size: 0.85 },
    sprite: 'dragon_vermithor',
    scale: 1.3,
    maxHp: 2000,
    poise: 560,
    poiseRegen: 70,
    staggerTime: 1.5,
    staggerDamageMul: 1.25,
    resist: { physical: 0.95, fire: 0.1, frost: 1.2, light: 1.0 },
    weakPoint: { mul: 1.25 },
    vulnerable: { taken: 1.6 },
    moveSpeed: 175,
    turnDelay: 0.55,
    idleTime: [0.6, 1.0],
    closeRange: 520,
    minRecovery: 0.55,
    stomp: true,
    tricks: { delay: [0, 0.25], feint: 0.05, chain: 0.15, hop: 0, quickTurn: 0.25 },
    punish: { hits: 4, window: 1.4, attack: 'stomp', cooldown: 6 },
    hurtboxes: {
      body: { x: -230, y: -250, w: 500, h: 220 },
      head: { size: 140 },
    },
    attacks: {
      bite: {
        kind: 'melee', anim: 'attack', telegraphFrames: [0, 1], activeFrames: [2, 3], recoveryFrames: [4, 5],
        telegraph: 0.7, active: 0.22, recovery: 0.75,
        damage: 30, type: 'physical', knockback: 950, lunge: 320, hitbox: { w: 260, h: 220 },
        range: [0, 520], cooldown: 1.6, weight: 2,
      },
      stomp: {                         // shockwaves both ways; afterwards a foreleg is marked (Frostbrand freezes it)
        kind: 'slam', anim: 'slam', telegraphFrames: [0, 1, 2], activeFrames: [3, 4], recoveryFrames: [4, 5],
        telegraph: 1.1, active: 0.25, recovery: 1.3,
        damage: 32, type: 'physical', impactRadius: 280, knockback: 1000,
        waveSpeed: 1050, waveRange: 1300, waveHeight: 95, waveDamage: 20, breakRadius: 380,
        weakAfter: { seg: 'foreleg', time: 2.8 },
        range: [0, 760], cooldown: 5.5, weight: 2.4,
      },
      charge: {                        // smashes through timber cover; ice pillars stop it
        kind: 'charge', anim: 'charge', telegraphFrames: [0], activeFrames: [1, 4], recoveryFrames: [5],
        telegraph: 0.95, active: 0, recovery: 0.9, crashRecovery: 2.2, edgeRecovery: 1.5,
        damage: 32, type: 'physical', knockback: 1100, speed: 1300, distance: 1500, hitHeight: 250, hitLow: 140,
        range: [460, 2000], cooldown: 6, weight: 1.8,
      },
      fire_sweep: {                    // a wide, tall wave: jump it or roll through
        kind: 'sweep', anim: 'flame_sweep', telegraphFrames: [0, 1], activeFrames: [2, 5], recoveryFrames: [6],
        telegraph: 0.95, active: 0, recovery: 0.85,
        damage: 24, type: 'fire', knockback: 600, waveSpeed: 1000, waveLength: 320, waveHeight: 120, reach: 1700,
        range: [200, 1500], cooldown: 5.5, weight: 1.6,
      },
      bronze_breath: {
        kind: 'breath', anim: 'fire_breath', telegraphFrames: [0, 1, 2], activeFrames: [3, 6], recoveryFrames: [7],
        telegraph: 1.0, active: 1.3, recovery: 0.75,
        tickDamage: 6, tickRate: 0.12, type: 'fire', streamLength: 1150, groundSpread: 320, flameSpeed: 1500,
        range: [250, 1300], cooldown: 6, weight: 1.4,
      },
      bronze_inferno: {                // a long charged sweep; a full Frostpiercer shot in the wind-up breaks it
        kind: 'scorch', anim: 'fire_breath', telegraphFrames: [0, 1, 2], activeFrames: [3, 6], recoveryFrames: [7],
        telegraph: 1.9, active: 1.6, recovery: 1.0, lockAt: 0.75, label: 'BRONZE INFERNO', interruptible: true,
        sweepFrom: 240, sweepPast: 600, tickDamage: 7, tickRate: 0.12, type: 'fire', major: true,
        burn: { width: 150, life: 2.4, tick: 3, rate: 0.4 },
        range: [300, 2200], cooldown: 11, weight: 1.6,
      },
      ember_mines: {                   // rage: marked patches erupt one after another
        phase: 2, kind: 'mines', anim: 'fire_breath', telegraphFrames: [0, 1, 2], activeFrames: [3, 6],
        recoveryFrames: [7], telegraph: 0.9, active: 0.9, recovery: 0.6,
        count: 6, radius: 105, warn: 1.4, stagger: 0.2, damage: 24, type: 'fire',
        range: [0, 9999], cooldown: 8, weight: 1.6,
      },
      rage_combo: {                    // rage: delayed eruptions, then the stomp while they burst
        phase: 2, kind: 'combo', sequence: ['ember_mines', 'stomp'], gap: 0.4, telegraph: 0, active: 0, recovery: 1.0,
        label: 'BRONZE FURY', interruptStagger: 2.0,
        range: [0, 9999], cooldown: 12, weight: 1.4,
      },
    },
    phases: [
      { hpBelow: 1.0, speedMul: 1.0, name: 'The Bronze Fury' },
      { hpBelow: 0.5, speedMul: 1.15, roar: true, roarAttack: 'rage_combo', name: 'Rage',
        tricks: { delay: [0, 0.3], feint: 0.1, chain: 0.25, hop: 0, quickTurn: 0.4 } },
    ],
  },

  balerion: {
    name: 'Balerion, the Black Dread',
    title: 'BALERION',
    subtitle: 'The Black Dread',
    voice: { pitch: 0.62, size: 1.0 },
    sprite: 'dragon_balerion',
    scale: 1.55,
    maxHp: 2600,
    poise: 760,
    poiseRegen: 80,
    staggerTime: 1.6,
    staggerDamageMul: 1.2,
    resist: { physical: 0.9, fire: 0.05, frost: 1.15, light: 0.95 },
    weakPoint: { mul: 1.2 },
    vulnerable: { taken: 1.5 },
    moveSpeed: 150,
    turnDelay: 0.6,
    idleTime: [0.7, 1.05],
    closeRange: 600,
    minRecovery: 0.55,
    stomp: true,
    tricks: { delay: [0, 0.25], feint: 0.0, chain: 0.1, hop: 0, quickTurn: 0.3 },
    punish: { hits: 4, window: 1.3, attack: 'tail_ruin', cooldown: 6 },
    // the core: from Phase III a glowing window after his heaviest blows; a Frostbrand
    // strike in it bares the core, and only a blow to the bared core can end him
    core: { minPhase: 2, window: 1.6, exposed: 4.5, taken: 2.4, after: ['slam', 'shadow_dive', 'black_dread'],
            finishOnly: true, piercerMul: 3 },
    hurtboxes: {
      body: { x: -260, y: -280, w: 560, h: 240 },
      head: { size: 150 },
    },
    attacks: {
      bite: {
        kind: 'melee', anim: 'attack', telegraphFrames: [0, 1], activeFrames: [2, 3], recoveryFrames: [4, 5],
        telegraph: 0.75, active: 0.22, recovery: 0.8,
        damage: 34, type: 'physical', knockback: 1000, lunge: 340, hitbox: { w: 300, h: 240 },
        range: [0, 600], cooldown: 1.8, weight: 2,
      },
      slam: {
        kind: 'slam', anim: 'slam', telegraphFrames: [0, 1, 2], activeFrames: [3, 4], recoveryFrames: [4, 5],
        telegraph: 1.2, active: 0.25, recovery: 1.4,
        damage: 36, type: 'physical', impactRadius: 320, knockback: 1050,
        waveSpeed: 1100, waveRange: 1500, waveHeight: 100, waveDamage: 22, breakRadius: 420,
        range: [0, 860], cooldown: 6, weight: 2.2,
      },
      scorch: {                        // the sweeping fire breath; behind him or behind ice is safe
        kind: 'scorch', anim: 'fire_breath', telegraphFrames: [0, 1, 2], activeFrames: [3, 6], recoveryFrames: [7],
        telegraph: 1.35, active: 1.5, recovery: 0.9, lockAt: 0.8, major: true,
        sweepFrom: 280, sweepPast: 600, tickDamage: 7, tickRate: 0.12, type: 'fire',
        burn: { width: 150, life: 2.6, tick: 3, rate: 0.4 },
        range: [300, 2400], cooldown: 6.5, weight: 2.2,
      },
      shadow_dive: {                   // gone into the storm; his shadow marks the landing
        kind: 'dive', anim: 'flight', telegraph: 0, active: 0, recovery: 0.7, landRecovery: 1.5,
        altitude: 1300, track: 1.1, lock: 0.85, diveTime: 0.34, impactRadius: 290, shadow: true,
        damage: 36, type: 'physical', knockback: 1050,
        shockwave: { waveSpeed: 1000, waveRange: 800, waveHeight: 85, waveDamage: 18, knockback: 750 },
        range: [0, 9999], cooldown: 9, weight: 1.5,
      },
      firestorm: {                     // Phase II: zones of the walkway erupt; the safe ground moves
        phase: 2, kind: 'firestorm', anim: 'wingspread', telegraphFrames: [0, 1], activeFrames: [2, 5],
        recoveryFrames: [6], telegraph: 0.9, active: 0.8, recovery: 0.6,
        zones: 3, width: 300, warn: 1.1, burn: 3.6, tick: 8, rate: 0.3, label: 'FIRESTORM',
        range: [0, 9999], cooldown: 12, weight: 1.6,
      },
      delayed_dive: {                  // Phase II: hangs in the storm, falls late, then attacks again
        phase: 2, kind: 'dive', anim: 'flight', telegraph: 0, active: 0, recovery: 0.6, landRecovery: 0.7,
        altitude: 1100, track: 0.9, lock: 0.7, hang: 0.8, diveTime: 0.3, impactRadius: 280, shadow: true,
        damage: 34, type: 'physical', knockback: 1000, weight: 0, cooldown: 0, range: [1e9, 1e9],
      },
      dread_combo: {                   // Phase II: the late dive and a second blow straight after
        phase: 2, kind: 'combo', sequence: ['delayed_dive', 'tail_ruin'], gap: 0.45, telegraph: 0, active: 0,
        recovery: 0.9, label: 'THE DREAD DESCENDS', interruptStagger: 2.0,
        range: [0, 9999], cooldown: 11, weight: 1.6,
      },
      reversal: {                      // Phase II: sweeps one way, then whips round to punish a roll through
        phase: 2, kind: 'scorch', anim: 'fire_breath', telegraphFrames: [0, 1, 2], activeFrames: [3, 6],
        recoveryFrames: [7], telegraph: 1.25, active: 1.2, recovery: 0.9, lockAt: 0.8, reverse: 0.6, major: true,
        sweepFrom: 280, sweepPast: 520, tickDamage: 7, tickRate: 0.12, type: 'fire',
        burn: { width: 150, life: 2.2, tick: 3, rate: 0.4 },
        range: [300, 2000], cooldown: 9, weight: 1.6,
      },
      tail_ruin: {                     // low sweep = jump it, high lash = roll under it
        kind: 'tailsweep', anim: 'tail_low', telegraphFrames: [0, 1], activeFrames: [2, 4],
        recoveryFrames: [5], telegraph: 0.9, active: 0.4, recovery: 0.8, rear: true,
        reach: 700, near: 120, low: [-110, 0], high: [-330, -158], damage: 30, type: 'physical', knockback: 1000,
        range: [0, 800], cooldown: 5, weight: 1.8,
      },
      cataclysm: {                     // Phase III: dive into fire, faster
        phase: 3, kind: 'combo', sequence: ['shadow_dive', 'scorch'], gap: 0.35, telegraph: 0, active: 0,
        recovery: 0.9, label: 'CATACLYSM', interruptStagger: 2.2,
        range: [0, 9999], cooldown: 10, weight: 1.6,
      },
      black_dread: {                   // Phase III: the arena burns; ice ward, ice pillar, or a bared core
        phase: 3, kind: 'lastember', anim: 'fire_breath', telegraphFrames: [0, 1, 2], activeFrames: [3, 6],
        recoveryFrames: [7], telegraph: 3.0, active: 1.1, recovery: 1.3, interruptDamage: 320, interruptStagger: 3.5,
        damageFrac: 0.85, lethal: true, major: true, type: 'fire', label: 'THE BLACK DREAD',
        range: [0, 9999], cooldown: 16, weight: 1.4,
      },
    },
    phases: [
      { hpBelow: 1.0, speedMul: 1.0, name: 'The Black Dread' },
      { hpBelow: 0.65, speedMul: 1.1, roar: true, roarAttack: 'firestorm', name: 'Storm of Fire',
        tricks: { delay: [0, 0.3], feint: 0.12, chain: 0.25, hop: 0, quickTurn: 0.6 } },
      { hpBelow: 0.3, speedMul: 1.22, roar: true, roarAttack: 'black_dread', name: 'The Last Dread',
        tricks: { delay: [0, 0.3], feint: 0.15, chain: 0.35, hop: 0, quickTurn: 0.7 } },
    ],
  },

  // Aegon Targaryen, the Conqueror: a duel, not a dragon fight (src/game/Duelist.js).
  aegon: {
    duelist: true,
    name: 'Aegon Targaryen, the Conqueror',
    title: 'AEGON THE CONQUEROR',
    subtitle: 'First of His Name  ·  wielder of Blackfyre',
    sprite: 'aegon',
    scale: 1.78,
    maxHp: 1400,
    poise: 150,
    poiseRegen: 45,
    staggerTime: 0.9,
    staggerDamageMul: 1.3,
    resist: { physical: 1.0, fire: 0.6, frost: 0.85, light: 1.0 },
    weakPoint: { mul: 1.0 },
    moveSpeed: 300,
    keepAt: [230, 330],
    hurtbox: { w: 80, h: 250 },
    // Frostbrand against a man: no freezes; the ice wave only slows him a little
    frostbrand: { slow: 0.25, slowTime: 1.6 },
    parry: { perfect: 0.22, chip: 0.3, heavyChip: 0.6, stun: 0.95 },
    attacks: {
      combo: { anim: 'slash', telegraph: 0.55, hits: [2, 3], between: 0.4, strike: 0.16, damage: 18, reach: 270,
               recovery: 0.8, range: [0, 360], weight: 2.4 },
      heavy: { anim: 'heavy', telegraph: 0.95, hold: [0, 0.45], strike: 0.22, damage: 34, reach: 300, heavy: true,
               recovery: 1.05, range: [0, 380], weight: 1.4 },
      dash: { anim: 'thrust', telegraph: 0.55, speed: 1500, distance: 640, damage: 26, reach: 180, recovery: 0.9,
              range: [280, 900], weight: 1.4 },
      guard: { anim: 'guard', duration: 1.5, counter: { telegraph: 0.45, damage: 24, reach: 280 },
               range: [0, 420], weight: 1.0, cooldown: 4 },
    },
    punishWhiff: { range: [240, 640], chance: 0.75 },
    phases: [
      { hpBelow: 1.0, speedMul: 1.0, recoveryMul: 1.0, name: 'The Conqueror' },
      { hpBelow: 0.3, speedMul: 1.25, recoveryMul: 0.7, flaming: true, extraHit: 1, name: 'Blackfyre Burns',
        line: 'Then let it burn.' },
    ],
  },
};
