// XP curve, stat growth and armory upgrades.

export const PROGRESSION = {
  base: { maxHp: 100, attack: 10, fireRes: 0 },
  perLevel: { maxHp: 8, attack: 1, fireRes: 0 },
  maxLevel: 30,
  fireResCap: 0.65,
};

export function xpToNext(level) {
  return Math.round(100 * Math.pow(level, 1.25));
}

export const UPGRADES = {
  vitality: { name: 'Vitality', description: '+15 maximum health', stat: 'maxHp', perTier: 15,
              prices: [60, 120, 200, 300, 420] },
  strength: { name: 'Strength', description: '+2 attack power', stat: 'attack', perTier: 2,
              prices: [80, 150, 240, 350, 480] },
  fireward: { name: 'Fire Ward', description: '+8% fire resistance', stat: 'fireRes', perTier: 0.08,
              prices: [70, 130, 210, 320, 450] },
};
