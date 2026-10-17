// Engine-wide constants. Gameplay numbers for weapons, enemies and levels
// live in their own data files next to this one.

export const VIEW = { width: 1920, height: 1080 };

export const PHYSICS = {
  gravity: 3900,
  maxFall: 2300,
};

export const PLAYER = {
  scale: 1.6,               // sprite scale in world units (1080p)
  hurtbox: { w: 64, h: 236 },
  runSpeed: 540,
  groundAccel: 6200,
  groundDecel: 7200,
  airAccel: 3200,
  jumpVelocity: 1480,
  jumpCut: 0.5,             // velocity kept when jump is released early
  coyoteTime: 0.1,
  bufferTime: 0.14,
  dodge: { speed: 880, duration: 0.5, iframeStart: 0.03, iframeEnd: 0.38, cooldown: 0.28 },
  hurt: { stun: 0.4, iframes: 0.8, knockback: 560 },
  attackStep: 140,          // forward nudge during the strike frames
  attackChainWindow: [4, 6],// frames in which a buffered attack chains
  maxChain: 3,
  chainDamage: [1, 1.1, 1.25],
  stamina: { max: 100, dodgeCost: 34, regen: 30, delay: 0.6 },   // levels with rules.stamina only
  brace: { push: 0.15, hurtboxH: 150 },                          // hold S against a wingstorm
  switchTime: 0.25,
};

export const KEYS = {
  left: ['KeyA', 'ArrowLeft'],
  right: ['KeyD', 'ArrowRight'],
  jump: ['Space', 'KeyW', 'ArrowUp'],
  attack: ['KeyJ'],
  dodge: ['ShiftLeft', 'ShiftRight'],
  special: ['KeyK'],
  use: ['KeyE'],
  brace: ['KeyS', 'ArrowDown'],
  swap: ['KeyQ'],
  slot1: ['Digit1'], slot2: ['Digit2'], slot3: ['Digit3'], slot4: ['Digit4'], slot5: ['Digit5'], slot6: ['Digit6'],
  skip: ['Enter'],
  pause: ['Escape'],
  deploy: ['KeyF'],          // Level 7: the Frostpiercer
  mute: ['KeyM'],
};

export const DEBUG = new URLSearchParams(location.search).has('debug');
