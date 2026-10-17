// Campaign levels. A level is pure data: the engine reads this table and
// never needs code changes to add one, as long as the referenced
// background, props and enemy exist in assets/manifest.json and
// data/enemies.js.
//
// status 'playable' = fully configured; 'planned' = shown on the map as
// coming soon (no assets exist for it yet, so it references none).

export const LEVELS = [
  {
    id: 1,
    status: 'playable',
    name: 'The Frozen Wall',
    subtitle: 'Fire comes to the edge of the world',
    background: 'frozen_wall',          // manifest.backgrounds key
    length: 5760,                        // world width in px (1080p units)
    spawnX: 260,
    weather: { snow: 260, wind: -140 },
    ambientEmbers: { xs: [480, 1760, 3040], period: 3840, y: 770 },   // braziers in the battlement art
    cover: [                             // manifest prop ids, x = centre
      { prop: 'cover_crates', x: 1150 },
      { prop: 'cover_barricade', x: 1980 },
      { prop: 'cover_stone_block', x: 2760 },
      { prop: 'cover_stone_block', x: 4420 },
      { prop: 'cover_ice_boulder', x: 5260 },
    ],
    flyby: { triggerX: 700 },            // the boss passes overhead in the sky
    arena: { start: 3840, end: 5760, triggerX: 4060 },
    boss: { enemy: 'ember_wyrm', spawnX: 5180, hpMul: 1.0, damageMul: 1.2 },
    grade: 'cold',
    rewards: {                           // kept below Level 2 so the campaign pays more as it goes
      firstClear: { xp: 120, gold: 100 },  // 120 XP = exactly one level-up
      repeat: { xp: 40, gold: 40 },      // every later clear
      noHitBonusGold: 15,
    },
  },
  {
    id: 2,
    status: 'playable',
    name: 'The Broken Battlements',
    subtitle: 'The keep of House Stark burns',
    background: 'burning_keep',
    length: 7680,
    spawnX: 260,
    weather: { snow: 420, wind: -460 },  // blowing snow
    ambientEmbers: { xs: [720, 1680, 2640, 3600], period: 3840, y: 715 },  // courtyard torches
    cover: [                             // hp = fireball hits before it crumbles
      { prop: 'cover_broken_wall', x: 1500, hp: 2 },
      { prop: 'cover_broken_wall', x: 3100, hp: 2 },
      { prop: 'cover_broken_wall', x: 5480, hp: 2 },
      { prop: 'cover_broken_wall', x: 7200, hp: 2 },
    ],
    platforms: [                         // one-way: land on them from above
      { prop: 'platform_cracked', x: 2300 },
      { prop: 'platform_cracked', x: 3850 },
      { prop: 'platform_cracked', x: 6280 },
    ],
    flyby: { triggerX: 900 },
    arena: { start: 4800, end: 7680, triggerX: 5000 },  // 2880 wide: the camera scrolls inside it
    boss: { enemy: 'emberwing', spawnX: 6800, hpMul: 1.0, damageMul: 1.15 },
    grade: 'warm',
    rewards: {
      firstClear: { xp: 130, gold: 150 },
      repeat: { xp: 50, gold: 60 },
      noHitBonusGold: 0,
    },
  },
  {
    id: 3,
    status: 'playable',
    name: 'The Ice Gate',
    subtitle: 'The oldest door in the north',
    background: 'ice_gate',
    length: 7680,
    spawnX: 260,
    weather: { snow: 320, wind: -240 },
    ambientEmbers: { xs: [600, 3240], period: 3840, y: 770 },
    cover: [
      { prop: 'cover_ice_spike', x: 1400 },
      { prop: 'cover_broken_wall', x: 2600, hp: 2 },
      { prop: 'cover_ice_spike', x: 5650 },
      { prop: 'cover_broken_wall', x: 6950, hp: 2 },
    ],
    platforms: [
      { prop: 'platform_cracked', x: 3600 },
      { prop: 'platform_cracked', x: 6300 },
    ],
    scorpions: [                         // stand next to one and press E
      { x: 5150, facing: 1 },
      { x: 7440, facing: -1 },
    ],
    flyby: { triggerX: 900 },
    arena: { start: 4800, end: 7680, triggerX: 5000 },
    boss: { enemy: 'meleys', spawnX: 6600, hpMul: 1.0, damageMul: 1.2 },
    grade: 'ice',
    rewards: {
      firstClear: { xp: 170, gold: 200 },
      repeat: { xp: 60, gold: 75 },
      noHitBonusGold: 0,
    },
  },
  {
    id: 4,
    status: 'playable',
    name: 'The Ashen Bridge',
    subtitle: 'A thread of stone above the abyss',
    background: 'ashen_bridge',
    length: 6400,
    spawnX: 260,
    weather: { snow: 520, wind: -640 },
    ambientEmbers: { xs: [420, 1380, 2300, 3260], period: 3840, y: 860 },   // burning debris on the deck
    storm: { lightning: [5, 10] },
    cover: [
      { prop: 'bridge_tower', x: 6330 },                    // walls off the far end of the arena
    ],
    platforms: [
      { prop: 'platform_cracked', x: 1700 },
      { prop: 'platform_cracked', x: 3100 },
    ],
    flyby: { triggerX: 900 },
    // 1600 wide: narrower than the screen, so the camera holds both fighters in view
    arena: { start: 4600, end: 6200, triggerX: 4760, barrier: true },
    boss: { enemy: 'rhagal', spawnX: 5800, hpMul: 1.0, damageMul: 1.25 },
    grade: 'storm',
    rewards: {
      firstClear: { xp: 200, gold: 250 },
      repeat: { xp: 70, gold: 90 },
      noHitBonusGold: 0,
    },
  },
  {
    id: 5,
    status: 'playable',
    name: 'The Wallbreaker',
    subtitle: 'Beyond the Wall, the gate lies shattered',
    difficulty: 'Nightmare',
    background: 'wallbreaker',
    length: 7600,
    spawnX: 260,
    weather: { snow: 600, wind: -520 },
    storm: { lightning: [6, 12] },
    // dodges cost stamina; Q / 1-6 switch carried weapons
    rules: { stamina: true, weaponSwitch: true },
    cover: [
      { prop: 'boulder', x: 1500 },
      { prop: 'ice_block', x: 2600, hp: 3, playerHits: true },
      { prop: 'boulder', x: 4150 },                                       // unbreakable: always a place to hide
      { prop: 'fractured_pillar', x: 4850, hp: 2, walkThrough: true },    // stops a charge and fire; the warrior passes in front
      { prop: 'ice_block', x: 6000, hp: 3, playerHits: true },
      { prop: 'boulder', x: 6380 },
      { prop: 'ice_formation', x: 6680, hp: 2, playerHits: true, id: 'axe_ice' },
    ],
    platforms: [
      { prop: 'rampart_step', x: 5250 },                                  // 200 px up
      { prop: 'rampart_high', x: 5590 },                                  // 390 px up, reached from the step
    ],
    decor: [                                                              // drawn behind the actors, no collision
      { prop: 'brazier_post', x: 1000, fire: 206 }, { prop: 'brazier_post', x: 2200, fire: 206 },
      { prop: 'fallen_scout', x: 3420 },
      { prop: 'brazier_post', x: 3900, fire: 206 },
      { prop: 'weapon_rack', x: 4390 }, { prop: 'collapsed_pillar', x: 4540 },
      { prop: 'gate_winch', x: 5850 },
      { prop: 'brazier_post', x: 6200, fire: 206 },
      { prop: 'fortress_gate', x: 7060 },
    ],
    pickups: [                                                            // battlefield weapons (E to take)
      { weapon: 'twin_daggers', x: 3460 },                                // on the fallen scout, at the entrance
      { weapon: 'war_hammer', x: 4560 },                                  // by the collapsed pillar
      { ammo: 'hunters_crossbow', count: 6, x: 5200, platform: 0 },       // a quiver on the low rampart
      { weapon: 'hunters_crossbow', x: 5620, platform: 1 },               // on the high battlement
      { weapon: 'long_spear', x: 5800 },                                  // beside the broken gate winch
      { weapon: 'frostbound_axe', x: 6650, hiddenBy: 'axe_ice' },         // frozen inside the ice
      { weapon: 'gatechain_flail', x: 6210 },                             // the broken gate chain and its hook
    ],
    scorpions: [                                                          // E to loose a bolt; brings Vhagar down
      { x: 3940, facing: 1 },
      { x: 5560, facing: -1 },
    ],
    flyby: { triggerX: 900 },
    arena: { start: 3600, end: 6800, triggerX: 3780, gate: 'portcullis' },
    // hitFrac: every blow from Vhagar or Aemond takes 70% of the warrior's health (two blows kill)
    boss: { enemy: 'vhagar', spawnX: 4950, hpMul: 1.0, damageMul: 1.0, hitFrac: 0.7 },
    camera: { bias: 0.45, max: 720 },                                     // lean hard toward so large a dragon
    grade: 'night',
    heatCracks: true,                                                     // floor cracks glow with Vhagar's heat
    intro: [
      { who: 'Aemond', text: 'The Wall could not keep us out. Neither will you.' },
      { who: 'Aemond', text: 'Vhagar. Burn him.' },
    ],
    victory: [
      { who: 'Aemond', text: 'She... she was older than the Wall.' },
      { who: 'Aemond', text: 'Then finish it, northman. I will not beg.' },
    ],
    victoryDelay: 6,
    rewards: {
      firstClear: { xp: 350, gold: 400 },
      repeat: { xp: 120, gold: 140 },
      noHitBonusGold: 0,
      achievement: { id: 'wallbreaker', name: 'The Wallbreaker Falls', text: 'Vhagar slain twice, Aemond unhorsed.' },
    },
  },
  {
    id: 6,
    status: 'playable',
    name: 'The Dragonpit',
    subtitle: 'Two dragons in the pit, and no way out',
    difficulty: 'Brutal',
    background: 'dragonpit',
    length: 6200,
    spawnX: 260,
    weather: { snow: 0, wind: -120 },
    ambientEmbers: { xs: [700, 1900, 3100], period: 3840, y: 760 },
    rules: { stamina: true },
    cover: [
      { prop: 'fallen_column', x: 4500, hp: 3, walkThrough: true },        // stops charges and fire; you pass in front
      { prop: 'rubble_heap', x: 3820, walkThrough: true },                 // low: blocks ground fire, never pins you
      { prop: 'rubble_heap', x: 5180, walkThrough: true },
    ],
    platforms: [
      { prop: 'pit_tier', x: 3560 },                                       // the old seating, 210 px up
      { prop: 'pit_tier', x: 5440 },
    ],
    decor: [
      { prop: 'iron_collar', x: 1400 }, { prop: 'brazier_tall', x: 2400, fire: 236 },
      { prop: 'bone_pile', x: 3000 }, { prop: 'iron_collar', x: 4100 }, { prop: 'iron_collar', x: 4900 },
      { prop: 'bone_pile', x: 5000 }, { prop: 'brazier_tall', x: 5800, fire: 236 },
    ],
    scorpions: [
      { x: 3700, facing: 1 },
      { x: 5300, facing: -1 },
    ],
    flyby: { triggerX: 900 },                                              // Drogon circles the dome
    arena: { start: 3300, end: 5700, triggerX: 4300, gate: 'pit_gate' },
    revealSub: 'Fire from one side, ice from the other',
    // two bosses: they land on either side of the warrior
    bosses: [
      { enemy: 'drogon', spawnX: 5050, hpMul: 1.0, damageMul: 1.35 },
      { enemy: 'viserion', spawnX: 3720, hpMul: 1.0, damageMul: 1.35 },
    ],
    camera: { bias: 0.25, max: 360 },
    grade: 'warm',
    victoryDelay: 2,
    rewards: {
      firstClear: { xp: 450, gold: 500 },
      repeat: { xp: 150, gold: 170 },
      noHitBonusGold: 0,
      achievement: { id: 'dragonpit', name: 'Lord of the Dragonpit', text: 'Drogon and Viserion, both brought low.' },
    },
  },
  {
    id: 7,
    status: 'playable',
    name: 'The Three Calamities',
    subtitle: 'Three dragons and a king, atop the Wall',
    difficulty: 'Legendary',
    background: 'kingswall',
    length: 15400,
    spawnX: 260,
    weather: { snow: 560, wind: -420 },
    storm: { lightning: [7, 13] },
    // dodges cost stamina; Frostbrand is granted; the Frostpiercer (F) is carried
    rules: { stamina: true, weaponSwitch: true, frostbrand: true, frostpiercer: true },
    // all cover here is walk-through: the warrior passes in front of it, but it
    // still stops fire and charges, and shelters him from the Black Dread
    cover: [
      { prop: 'ice_pillar', x: 3500, hp: 3, walkThrough: true },             // Sunfyre's arena
      { prop: 'ice_pillar', x: 4700, hp: 3, walkThrough: true },
      { prop: 'timber_barricade', x: 6800, hp: 1, walkThrough: true },        // Vermithor's: his charge smashes these
      { prop: 'ice_pillar', x: 7500, hp: 3, walkThrough: true },
      { prop: 'timber_barricade', x: 8250, hp: 1, walkThrough: true },
      { prop: 'ice_pillar', x: 10200, hp: 4, walkThrough: true },             // Balerion's: shelter from the Black Dread
      { prop: 'ice_pillar', x: 11250, hp: 4, walkThrough: true },
      { prop: 'ice_pillar', x: 12250, hp: 4, walkThrough: true },
    ],
    decor: [
      { prop: 'frost_shrine', x: 720 },
      { prop: 'launcher_cradle', x: 1500 },
      { prop: 'war_brazier', x: 2200, fire: 140 }, { prop: 'stark_standard', x: 2600 },
      { prop: 'war_brazier', x: 5800, fire: 140 }, { prop: 'stark_standard', x: 6050 },
      { prop: 'war_brazier', x: 9200, fire: 140 }, { prop: 'stark_standard', x: 9450 },
      { prop: 'war_brazier', x: 13000, fire: 140 }, { prop: 'stark_standard', x: 14900 },
    ],
    grade: 'ice',
    music: { explore: 'explore' },
    // the four encounters, one at a time (src/game/Saga.js runs the sequence)
    stages: [
      { id: 'sunfyre', boss: { enemy: 'sunfyre', spawnX: 4300, damageMul: 1.3 },
        arena: { start: 2900, end: 5500, triggerX: 3150, gate: 'ice_gate' }, music: 'sunfyre',
        camera: { bias: 0.3, max: 420 }, reward: { gold: 250, xp: 220 },
        intro: [{ who: 'The Warrior', text: 'Gold in the storm. Sunfyre.' }],
        victory: [{ who: 'The Warrior', text: 'One.' }] },
      { id: 'vermithor', boss: { enemy: 'vermithor', spawnX: 7700, damageMul: 1.3 },
        arena: { start: 6300, end: 8900, triggerX: 6550, gate: 'ice_gate' }, music: 'vermithor',
        camera: { bias: 0.34, max: 480 }, reward: { gold: 300, xp: 260 },
        intro: [{ who: 'The Warrior', text: 'The Bronze Fury. The ice will hold.' }],
        victory: [{ who: 'The Warrior', text: 'Two. And the storm grows darker.' }] },
      { id: 'balerion', boss: { enemy: 'balerion', spawnX: 11600, damageMul: 1.35 },
        arena: { start: 9700, end: 12900, triggerX: 9950, gate: 'ice_gate' }, music: 'balerion',
        camera: { bias: 0.42, max: 700 }, reward: { gold: 450, xp: 400 },
        intro: [{ who: 'The Warrior', text: 'The Black Dread himself.' },
                { who: 'The Warrior', text: 'Only a blow to the core will end him.' }],
        victory: [{ who: 'The Warrior', text: 'The last of them.' }] },
      { id: 'aegon', duel: 'aegon', spawnX: 14600,
        arena: { start: 13500, end: 15300, triggerX: 13750, gate: 'ice_gate' }, music: 'aegon',
        camera: { bias: 0.3, max: 300 }, reward: { gold: 500, xp: 450 }, noFrostpiercer: true, damageMul: 1.2,
        intro: [{ who: 'Aegon', text: 'You slew my dragons. Now you will face their king.' },
                { who: 'Aegon', text: 'No beasts. No fire from the sky. Steel.' }],
        victory: [{ who: 'Aegon', text: 'The North... remembers.' }] },
    ],
    rewards: {
      firstClear: { xp: 300, gold: 300 },
      repeat: { xp: 120, gold: 150 },
      noHitBonusGold: 0,
      achievement: { id: 'north_remembers', name: 'The King in the North',
                     text: 'Sunfyre, Vermithor, Balerion and Aegon the Conqueror, all fallen.' },
    },
  },
];

export function getLevel(id) {
  return LEVELS.find(l => l.id === id) || null;
}
