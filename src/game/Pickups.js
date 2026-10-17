import { WEAPONS } from '../data/weapons.js';
import { Weapon } from './Weapon.js';

// Battlefield weapon caches (Level 5): a weapon or a quiver lying in the
// arena. Walk up to it and press E. A cache hidden inside breakable cover
// (the Frostbound Axe in its ice) appears when that cover is broken.
// Taken weapons join the carried loadout for this battle only.

export class Pickup {
  constructor(game, cfg, level) {
    this.game = game;
    this.cfg = cfg;
    this.x = cfg.x;
    this.weapon = cfg.weapon || null;
    this.ammo = cfg.ammo || null;
    const id = this.weapon || this.ammo;
    if (!WEAPONS[id]) throw new Error(`Pickup: unknown weapon "${id}"`);
    if (cfg.platform !== undefined && !level.platforms[cfg.platform]) {
      throw new Error(`Pickup ${id}: platform ${cfg.platform} does not exist`);
    }
    this.y = cfg.platform !== undefined ? level.platforms[cfg.platform].slab.y : level.floorY;
    this.hiddenBy = cfg.hiddenBy ? level.prop(cfg.hiddenBy) : null;
    if (cfg.hiddenBy && !this.hiddenBy) throw new Error(`Pickup ${id}: no cover with id "${cfg.hiddenBy}"`);
    this.def = WEAPONS[id];
    this.icon = game.assets.image(game.assets.manifest.weapons[id].file);
    this.taken = false;
    this.prompt = false;
    this.t = Math.random() * 6;
  }

  get visible() { return !this.taken && (!this.hiddenBy || this.hiddenBy.broken); }

  near(p) { return Math.abs(p.x - this.x) < 110 && Math.abs(p.y - this.y) < 70; }

  update(dt, input, lm) {
    this.t += dt;
    this.prompt = false;
    if (!this.visible) return;
    const p = lm.player;
    this.prompt = p.alive && !lm.cutscene && this.near(p);
    if (this.prompt && input.buffered('use', 0.14)) {
      input.consume('use');
      this.take(p);
    }
  }

  take(p) {
    const c = this.game.combat;
    if (this.weapon) {
      if (p.loadout.some(w => w.id === this.weapon)) { c.text(p.x, p.y - 300, 'ALREADY CARRIED', '#a8a29a', 30); return false; }
      p.addWeapon(new Weapon(this.weapon));
      c.text(p.x, p.y - 300, `${this.def.name.toUpperCase()} TAKEN`, '#e8c46a', 36);
    } else {
      const bow = p.loadout.find(w => w.id === this.ammo);
      if (!bow) { c.text(p.x, p.y - 300, 'BOLTS: FIND THE CROSSBOW FIRST', '#a8a29a', 28); return false; }
      bow.ammo += this.cfg.count;
      c.text(p.x, p.y - 300, `+${this.cfg.count} BOLTS`, '#e8c46a', 36);
    }
    this.taken = true;
    this.game.particles.sparks(this.x, this.y - 30, 24, 'gold', 0.8);
    return true;
  }

  draw(ctx) {
    if (!this.visible || !this.icon) return;
    const k = 0.5 + 0.5 * Math.sin(this.t * 3);
    const y = this.y - 20;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(this.x, y, 4, this.x, y, 120);
    g.addColorStop(0, `rgba(255,224,150,${0.28 + 0.18 * k})`);
    g.addColorStop(1, 'rgba(255,180,80,0)');
    ctx.fillStyle = g;
    ctx.fillRect(this.x - 120, y - 120, 240, 240);
    const beam = ctx.createLinearGradient(0, y - 360, 0, y);
    beam.addColorStop(0, 'rgba(255,230,170,0)');
    beam.addColorStop(1, `rgba(255,230,170,${0.12 + 0.08 * k})`);
    ctx.fillStyle = beam;
    ctx.fillRect(this.x - 18, y - 360, 36, 360);
    ctx.restore();
    // the weapon itself, lying on its side
    const img = this.icon;
    const len = Math.max(img.width, img.height);
    const s = Math.min(1.6, 150 / len);
    ctx.save();
    ctx.translate(this.x, y - 6 * k);
    ctx.rotate(Math.PI / 2 + 0.12);
    ctx.drawImage(img, -img.width * s / 2, -img.height * s / 2, img.width * s, img.height * s);
    ctx.restore();
  }

  drawPrompt(ctx) {
    if (!this.prompt) return;
    const d = this.def;
    const title = this.weapon ? `E  ·  Take the ${d.name}` : `E  ·  Take ${this.cfg.count} bolts`;
    const line = this.weapon ? `${d.damage} damage  ·  ${d.hint || d.special.name}` : 'For the Hunter\'s Crossbow';
    const x = this.x, y = this.y - 300;
    ctx.save();
    ctx.font = '700 24px Cinzel, Georgia, serif';
    const w = Math.max(ctx.measureText(title).width, 420) + 48;
    ctx.fillStyle = 'rgba(8,10,16,0.82)';
    ctx.fillRect(x - w / 2, y - 40, w, 82);
    ctx.strokeStyle = 'rgba(232,196,106,0.8)';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - w / 2, y - 40, w, 82);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f2ead8';
    ctx.fillText(title, x, y - 8);
    ctx.font = '600 17px Cinzel, Georgia, serif';
    ctx.fillStyle = '#c9b48a';
    ctx.fillText(line, x, y + 24);
    ctx.restore();
  }
}
