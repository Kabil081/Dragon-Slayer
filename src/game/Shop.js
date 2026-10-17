import { WEAPONS } from '../data/weapons.js';
import { UPGRADES } from '../data/progression.js';

// The armory: buy and equip weapons, buy stat upgrades with gold.

export class Shop {
  constructor(progression) {
    this.prog = progression;
  }

  get gold() { return this.prog.data.gold; }

  weapons() {
    const d = this.prog.data;
    // battlefield finds (Level 5 caches) are never sold
    return Object.entries(WEAPONS).filter(([, def]) => !def.field).map(([id, def]) => {
      const owned = d.ownedWeapons.includes(id);
      const unlocked = this.prog.isWeaponUnlocked(id);
      return {
        id, def, owned, unlocked,
        equipped: d.equipped === id,
        price: def.price,
        affordable: d.gold >= def.price,
        lockReason: unlocked ? null : this.prog.lockReason(id),
        status: d.equipped === id ? 'equipped' : owned ? 'purchased' : unlocked ? 'available' : 'locked',
      };
    });
  }

  buyWeapon(id) {
    const d = this.prog.data;
    const def = WEAPONS[id];
    if (!def || def.field) return { ok: false, reason: 'Unknown weapon' };
    if (def.granted) return { ok: false, reason: 'It cannot be bought; it is granted' };
    if (d.ownedWeapons.includes(id)) return { ok: false, reason: 'Already owned' };
    if (!this.prog.isWeaponUnlocked(id)) return { ok: false, reason: `${this.prog.lockReason(id)} first` };
    if (d.gold < def.price) return { ok: false, reason: 'Not enough gold' };
    d.gold -= def.price;
    d.ownedWeapons.push(id);
    this.prog.persist();
    return { ok: true };
  }

  equip(id) {
    const d = this.prog.data;
    if (!d.ownedWeapons.includes(id)) return { ok: false, reason: 'Not owned' };
    d.equipped = id;
    this.prog.persist();
    return { ok: true };
  }

  upgrades() {
    const d = this.prog.data;
    return Object.entries(UPGRADES).map(([id, def]) => {
      const tier = d.upgrades[id] || 0;
      const maxed = tier >= def.prices.length;
      const price = maxed ? null : def.prices[tier];
      return { id, def, tier, maxTier: def.prices.length, maxed, price, affordable: !maxed && d.gold >= price };
    });
  }

  buyUpgrade(id) {
    const d = this.prog.data;
    const def = UPGRADES[id];
    if (!def) return { ok: false, reason: 'Unknown upgrade' };
    const tier = d.upgrades[id] || 0;
    if (tier >= def.prices.length) return { ok: false, reason: 'Fully upgraded' };
    const price = def.prices[tier];
    if (d.gold < price) return { ok: false, reason: 'Not enough gold' };
    d.gold -= price;
    d.upgrades[id] = tier + 1;
    this.prog.persist();
    return { ok: true };
  }
}
