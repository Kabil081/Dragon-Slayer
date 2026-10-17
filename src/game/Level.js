// Runtime world built from a level config + the manifest: parallax layers,
// the walkable floor, cover props (solid, block fire, optionally
// breakable) and one-way platforms you can land on from above.

const boundsCache = new Map();

// Opaque bounds of an image (cached), used to fit collision to the art.
function alphaBounds(img) {
  if (boundsCache.has(img)) return boundsCache.get(img);
  const c = document.createElement('canvas');
  c.width = img.width;
  c.height = img.height;
  const x = c.getContext('2d');
  x.drawImage(img, 0, 0);
  const d = x.getImageData(0, 0, c.width, c.height).data;
  let x0 = c.width, y0 = c.height, x1 = 0, y1 = 0;
  for (let y = 0; y < c.height; y += 2) {
    for (let i = 0; i < c.width; i += 2) {
      if (d[(y * c.width + i) * 4 + 3] > 60) {
        if (i < x0) x0 = i;
        if (i > x1) x1 = i;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  const b = { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  boundsCache.set(img, b);
  return b;
}

export class Level {
  constructor(config, assets) {
    this.config = config;
    const bg = assets.manifest.backgrounds[config.background];
    if (!bg) throw new Error(`Level ${config.id}: background "${config.background}" is not in the manifest`);
    this.floorY = bg.floor_y;
    this.length = config.length;
    // The baked "cover" layer is replaced by per-level props so that each
    // level can place its own cover.
    this.layers = bg.layers
      .filter(l => l.id !== 'cover')
      .map(l => ({ ...l, img: assets.image(l.file) }));
    const propDef = id => {
      const def = bg.props[id];
      if (!def) throw new Error(`Level ${config.id}: prop "${id}" is not in the manifest`);
      return def;
    };
    this.props = (config.cover || []).map(c => {
      const def = propDef(c.prop);
      const img = assets.image(def.file);
      const x0 = c.x - img.width / 2;
      const y0 = this.floorY + 4 - def.ground_y;
      const b = alphaBounds(img);
      const insetX = b.w * 0.08;
      const solid = { x: x0 + b.x + insetX, y: y0 + b.y + 8, w: b.w - insetX * 2, h: this.floorY - (y0 + b.y + 8) };
      const prop = { id: c.prop, key: c.id || null, img, x: x0, y: y0, solid, hp: c.hp ?? null, maxHp: c.hp ?? null,
                     broken: false, playerHits: !!c.playerHits, walkThrough: !!c.walkThrough };
      if (c.hp) {
        if (!def.states || !def.states.cracked || !def.states.rubble) {
          throw new Error(`Level ${config.id}: breakable prop "${c.prop}" needs cracked and rubble states`);
        }
        prop.states = { cracked: assets.image(def.states.cracked), rubble: assets.image(def.states.rubble) };
      }
      solid.prop = prop;
      return prop;
    });
    this.platforms = (config.platforms || []).map(c => {
      const def = propDef(c.prop);
      if (!def.slab) throw new Error(`Level ${config.id}: platform "${c.prop}" has no slab in the manifest`);
      const img = assets.image(def.file);
      const x0 = c.x - img.width / 2;
      const y0 = this.floorY + 4 - def.ground_y;
      const [sx, sy, sw, sh] = def.slab;
      return { id: c.prop, img, x: x0, y: y0, slab: { x: x0 + sx, y: y0 + sy, w: sw, h: sh, platform: true } };
    });
    // decoration behind the actors (no collision); `fire` = flame height for live light and embers
    this.decor = (config.decor || []).map(c => {
      const def = propDef(c.prop);
      const img = assets.image(def.file);
      return { id: c.prop, img, x: c.x - img.width / 2, y: this.floorY + 4 - def.ground_y, cx: c.x,
               fire: c.fire ?? null };
    });
    this.refreshSolids();
  }

  prop(key) { return this.props.find(p => p.key === key) || null; }

  refreshSolids() {
    this.solids = this.props.filter(p => !p.broken).map(p => p.solid);
  }

  // Anything that stops fire: standing cover and platform slabs.
  blocksAt(x, y) {
    return !!this.solidAt(x, y);
  }

  solidAt(x, y, pad = 0) {
    for (const s of this.solids) {
      if (x >= s.x - pad && x <= s.x + s.w + pad && y >= s.y - pad && y <= s.y + s.h + pad) return s;
    }
    for (const p of this.platforms) {
      const s = p.slab;
      if (x >= s.x - pad && x <= s.x + s.w + pad && y >= s.y - pad && y <= s.y + s.h + pad) return s;
    }
    return null;
  }

  // Breakable cover takes damage; everything else is unaffected.
  damageSolid(solid, amount, game) {
    const prop = solid && solid.prop;
    if (!prop || !prop.maxHp || prop.broken) return;
    prop.hp -= amount;
    const s = prop.solid;
    const cx = s.x + s.w / 2;
    if (prop.hp <= 0) {
      prop.broken = true;
      prop.img = prop.states.rubble;
      this.refreshSolids();
      game.particles.debris(cx, s.y + s.h * 0.4, 26, s.w * 0.5);
      game.particles.dust(cx, this.floorY, 16);
      game.camera.shake(0.3);
    } else {
      prop.img = prop.states.cracked;
      game.particles.debris(cx, s.y + 20, 10, s.w * 0.4);
    }
  }

  layer(id) {
    return this.layers.find(l => l.id === id);
  }

  drawBackground(renderer, camera, extra) {
    // Everything with parallax < 1 sits behind the walkable layer.
    for (const l of this.layers) {
      if (l.parallax >= 1) continue;
      renderer.drawLayer(l.img, l.parallax, camera.x, camera.shakeX, camera.shakeY);
      if (l.id === 'far' && extra) extra();
    }
    for (const l of this.layers) {
      if (l.parallax < 1) continue;
      renderer.drawLayer(l.img, l.parallax, camera.x, camera.shakeX, camera.shakeY);
    }
  }

  drawProps(ctx) {
    for (const p of this.decor) ctx.drawImage(p.img, Math.round(p.x), Math.round(p.y));
    for (const p of this.platforms) ctx.drawImage(p.img, Math.round(p.x), Math.round(p.y));
    for (const p of this.props) ctx.drawImage(p.img, Math.round(p.x), Math.round(p.y));
  }
}
