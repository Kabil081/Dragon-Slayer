// Weapon definitions. `id` matches the sprite variant and icon names in
// assets/manifest.json, so the warrior visibly carries what is equipped.
//
// damage      base hit damage (scaled by the player's attack power / 10)
// speed       attack animation speed multiplier
// type        physical | fire | frost (matched against enemy resistances)
// price       gold cost in the armory (0 = starting weapon)
// unlock      level that must be cleared before it can be bought
// unlockLevel player level needed before it can be bought
// reach       hitbox length relative to the drawn blade (1 = blade tip)
// style       which attack animation and timing it uses (see STYLES)
// armorBreak  damage dealt to an armor plate per hit (Vhagar's segments)
// armorPen    share of damage that passes an intact plate (default 0.35)
// exposedMul  damage multiplier against a broken plate / exposed joint
// bonus       { segment: damage multiplier }, breakBonus { segment: armorBreak multiplier }
// field       found on the battlefield (Level 5 caches), never sold; lasts one battle
// special     K-key ability; `type` selects the behaviour in Weapon.js

export const WEAPONS = {
  steel_sword: {
    name: 'Steel Sword',
    description: 'A plain northern blade. Reliable, quick, honest.',
    damage: 10, speed: 1.0, poise: 20, type: 'physical', reach: 1.0, armorBreak: 5,
    price: 0, unlock: 0,
    special: { type: 'rising_slash', name: 'Rising Slash', cooldown: 4, damageMul: 2.0, poise: 70,
               description: 'A leaping upward cut.' },
  },
  northern_longsword: {
    name: 'Northern Longsword',
    description: 'Longer reach. Forged for the men of the Wall.',
    damage: 19, speed: 0.95, poise: 30, type: 'physical', reach: 1.3, armorBreak: 6, armorPen: 0.35,
    price: 250, unlock: 0, unlockLevel: 3,
    special: { type: 'long_sweep', name: 'Northern Sweep', cooldown: 5, damageMul: 1.7, poise: 90, reach: 1.85,
               description: 'A long sweeping cut that reaches much farther.' },
  },
  greatsword: {
    name: 'Heavy Greatsword',
    description: 'Slow and brutal. Breaks a dragon\'s armor and its guard.',
    damage: 36, speed: 0.62, poise: 80, type: 'physical', reach: 1.0, style: 'heavy',
    armorBreak: 24, armorPen: 0.5, exposedMul: 1.2, missRecovery: 0.4,
    price: 600, unlock: 0, unlockLevel: 5,
    special: { type: 'smash', name: 'Armor-Breaking Smash', cooldown: 6, damageMul: 2.4, breakMul: 3, poise: 260,
               charge: 1.0, recovery: 0.6,
               description: 'Hold K to charge, release for an overhead smash that shatters armor. Long recovery.' },
  },
  frostblade: {
    name: 'Frostblade',
    description: 'Ice that never melts. Dragons of fire fear it.',
    damage: 13.5, speed: 1.05, poise: 26, type: 'frost', fireRes: 0.1, armorBreak: 6,
    price: 450, unlock: 3,
    special: { type: 'frost_nova', name: 'Frost Nova', cooldown: 9, damageMul: 1.6, poise: 120, radius: 430,
               slow: 0.45, slowTime: 3, description: 'A burst of ice that slows the foe.' },
  },
  lightbreaker: {
    name: 'Lightbreaker',
    description: 'Northern steel with a seam of dawn in it. Twice per battle it takes fire.',
    damage: 16, speed: 1.0, poise: 32, type: 'physical', reach: 1.2, armorBreak: 6, armorPen: 0.35,
    price: 350, unlock: 3,
    special: { type: 'ignite', name: 'Dawnfire', cooldown: 1.5, duration: 10, charges: 2, damageMul: 1.6,
               boltMul: 5.5, boltSpeed: 2300, burn: 5,
               description: 'Twice per battle: the blade takes fire (+60% damage) and hurls a crescent of dawnfire ' +
                            'that burns through armor, sets the dragon alight and brings a flying dragon down.' },
  },
  dragonbane: {
    name: 'Dragonbane',
    description: 'Smoke-dark steel made for one purpose.',
    damage: 23, speed: 1.0, poise: 36, type: 'physical', vsDragon: 1.2, armorBreak: 9, armorPen: 0.45,
    price: 900, unlock: 6,
    joke: true,                       // the armory shows a mock "$1" button (no real payment exists)
    special: { type: 'bane_strike', name: 'Bane Strike', cooldown: 10, damageMul: 3.0, poise: 160,
               lifesteal: 0.08, description: 'A dragon-slaying blow that heals.' },
  },

  // ---- Level 7: granted at the shrine on the Wall, never sold
  frostbrand: {
    name: 'Frostbrand', granted: 7,
    description: 'A legendary blade of living ice. Quick and cold; the only steel that breaks a calamity open.',
    damage: 15, speed: 1.2, poise: 30, type: 'frost', reach: 1.25, armorBreak: 8, armorPen: 0.4, fireRes: 0.05,
    price: 0, unlock: 0, frostbrand: true,
    special: { type: 'ice_wave', name: 'Glacial Wave', cooldown: 1.2, charge: 0.9, cost: 35, damageMul: 2.2,
               poise: 160, speed: 1500, range: 1500,
               description: 'Hold K to charge, release: a wave of ice races along the ground. Costs ice energy; ' +
                            'breaks marked attacks and freezes weak points.' },
    // ice energy: earned by precision dodges and strikes on exposed weak points
    energy: { max: 100, start: 50, dodge: 18, weak: 14, hit: 2 },
    // S raises the ice ward: it blocks one major fire attack, then must recover
    ward: { cost: 25, hold: 1.4, cooldown: 15, rest: 1.5 },
  },

  // ---- battlefield finds (Level 5). Picked up with E, switched with Q / 1-6.
  war_hammer: {
    name: 'War Hammer', field: true,
    description: 'Iron-headed and two-handed. Shatters plate, breaks legs.',
    hint: 'Huge armor break · best on the front legs · slow',
    damage: 29, speed: 0.58, poise: 120, type: 'physical', reach: 0.9, style: 'heavy',
    armorBreak: 36, armorPen: 0.5, breakBonus: { foreleg: 1.6 }, bonus: { foreleg: 1.3 }, missRecovery: 0.45,
    special: { type: 'ground_strike', name: 'Ground Strike', cooldown: 7, damageMul: 1.4, breakMul: 2.2, poise: 200,
               charge: 0.9, radius: 340, recovery: 0.55,
               description: 'Hold K, then slam the ground: cracks every armor plate within reach.' },
  },
  twin_daggers: {
    name: 'Twin Daggers', field: true,
    description: 'A dead scout\'s pair. Quick as a breath, useless against plate.',
    hint: 'Fast · cancel into a roll · deadly on exposed flesh',
    damage: 5.5, speed: 1.45, poise: 6, type: 'physical', reach: 0.8, style: 'daggers',
    armorBreak: 1, armorPen: 0.1, exposedMul: 1.6,
    special: { type: 'flurry', name: 'Flurry', cooldown: 5, hits: 6, damageMul: 0.8,
               description: 'Six lightning stabs. Deadly on exposed joints, useless on intact plate.' },
  },
  long_spear: {
    name: 'Long Spear', field: true,
    description: 'An ash boar-spear. Keeps the jaws at a distance.',
    hint: 'Long reach · bonus on chest and wing joints · K braces against a charge',
    damage: 15, speed: 0.95, poise: 34, type: 'physical', reach: 1.25, style: 'spear',
    armorBreak: 5, armorPen: 0.3, bonus: { chest: 1.8, wing: 1.8 },
    special: { type: 'brace', name: 'Set the Spear', cooldown: 5, duration: 0.9, damageMul: 4,
               description: 'Brace against a charge: a charging dragon impales itself and is stopped dead.' },
  },
  hunters_crossbow: {
    name: 'Hunter\'s Crossbow', field: true,
    description: 'Heavy bolts for a heavy beast. Every bolt counts.',
    hint: 'Ranged · bonus on wing joints and airborne targets · slow reload',
    damage: 20, speed: 1.0, poise: 24, type: 'physical', style: 'crossbow',
    armorBreak: 6, armorPen: 0.3, bonus: { wing: 2.0 }, airborneMul: 1.6,
    ammo: 6, reload: 1.15, boltSpeed: 2600,
    special: { type: 'pin_shot', name: 'Pinning Bolt', cooldown: 4, ammo: 2, damageMul: 2.2, breakMul: 4,
               description: 'Spend two bolts on one heavy shot that tears wing joints.' },
  },
  gatechain_flail: {
    name: 'Gatechain Flail', field: true,
    description: 'A length of the broken gate chain and its iron hook, on a haft.',
    hint: 'Long reach · K: hook a flying dragon and haul it down (3 throws)',
    damage: 16, speed: 0.8, poise: 50, type: 'physical', reach: 1.5, armorBreak: 14, armorPen: 0.4,
    bonus: { wing: 1.5 },
    special: { type: 'hook', name: 'Hook and Haul', cooldown: 3, uses: 3, range: 1300, speed: 1900, armorBreak: 70,
               damageMul: 1.5,
               description: 'Throw the hook: a flying dragon is hauled out of the sky; a grounded one has a plate torn loose.' },
  },
  frostbound_axe: {
    name: 'Frostbound Axe', field: true,
    description: 'Frozen into the ice for an age. Its cold bites into dragonflesh.',
    hint: 'Builds frost on exposed flesh · K: Frost Strike slows the dragon',
    damage: 19, speed: 0.9, poise: 40, type: 'frost', armorBreak: 11, armorPen: 0.4,
    frostGain: { exposed: 0.25, intact: 0.08 },
    special: { type: 'frost_strike', name: 'Frost Strike', cooldown: 1.5, damageMul: 2.2, poise: 160, slow: 0.4,
               slowTime: 3, delay: 0.6, resist: 12,
               description: 'With a full frost meter: a freezing blow that slows the dragon and delays its attack. It soon resists.' },
  },
};

export const STARTING_WEAPON = 'steel_sword';

// Frostpiercer, the Dragonbreaker (Level 7): the shoulder-mounted spear
// launcher carried on the warrior's back. F deploys and stows it; W / S
// aim; hold J to charge, release to fire; it reloads itself (slowly).
export const FROSTPIERCER = {
  ammo: 4,                 // spears per encounter
  deploy: 0.5, stow: 0.3, recoil: 0.35, reload: 2.4,
  aim: { min: -62, max: 16, start: -10, speed: 70 },     // degrees from level, up is negative
  charge: 1.2, minCharge: 0.22,
  damage: 31, weakMul: 2.0, fullMul: 1.2,
  speed: [2300, 3200], gravity: [1100, 380],             // at no charge -> full charge
  freeze: 1.2, fullFreeze: 2.0, vulnerable: 2.6,
};

// Attack timing per weapon style. `windows` are the animation frames in
// which each hit is live (`offhand` hits use the second dagger); `chain` is
// how many presses can follow on; `dodgeFrom` the first frame a roll can
// cancel the swing; `ranged` styles fire instead of swinging.
export const STYLES = {
  sword: { anim: 'attack', windows: [{ frames: [2, 4] }], chain: 3, dodgeFrom: 5 },
  heavy: { anim: 'heavy', windows: [{ frames: [3, 5] }], chain: 2, dodgeFrom: 6, chainWindow: [5, 7], heavy: true },
  spear: { anim: 'thrust', windows: [{ frames: [2, 3] }], chain: 3, dodgeFrom: 4, chainWindow: [3, 5] },
  daggers: { anim: 'daggers', windows: [{ frames: [1, 1] }, { frames: [3, 3], offhand: true }], chain: 2,
             dodgeFrom: 1, chainWindow: [3, 5] },
  crossbow: { anim: 'shoot', ranged: true, fireFrame: 2 },
};
