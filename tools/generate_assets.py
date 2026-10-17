"""Generate every DRAGONSLAYER: Rise of the North art asset.

    python tools/generate_assets.py            # everything
    python tools/generate_assets.py warrior    # one group: warrior | dragon | weapons | backgrounds | concept

Outputs go to ../assets and a manifest (assets/manifest.json + manifest.js)
describes frame sizes, pivots, fps and per-frame anchors for the engine.
"""
import datetime
import json
import math
import os
import random
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from assetgen import (backgrounds, dragon, dragonpit, frostpiercer, kingswall, scorpion, wallbreaker,  # noqa: E402
                      warrior, weapons)
from assetgen.common import sheet  # noqa: E402

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
ASSETS = os.path.join(ROOT, 'assets')
MANIFEST = os.path.join(ASSETS, 'manifest.json')


def out(*parts):
    p = os.path.join(ASSETS, *parts)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    return p


def rel(p):
    return os.path.relpath(p, ASSETS).replace('\\', '/')


def save(img, *parts):
    p = out(*parts)
    img.save(p, optimize=True)
    return rel(p)


def load_manifest():
    if os.path.exists(MANIFEST):
        with open(MANIFEST, encoding='utf-8') as f:
            return json.load(f)
    return {}


def write_manifest(m):
    m['game'] = 'DRAGONSLAYER: Rise of the North'
    m['generator'] = 'tools/generate_assets.py'
    m['generated'] = datetime.date.today().isoformat()
    with open(MANIFEST, 'w', encoding='utf-8') as f:
        json.dump(m, f, indent=2)
    with open(os.path.join(ASSETS, 'manifest.js'), 'w', encoding='utf-8') as f:
        f.write('// Same data as manifest.json, loadable from file:// pages.\n')
        f.write('window.ASSET_MANIFEST = ')
        json.dump(m, f, indent=1)
        f.write(';\n')


# ------------------------------------------------------------ groups -----

def gen_weapons(m):
    print('weapons ...')
    m['weapons'] = {}
    for wid in weapons.WEAPONS:
        img, meta = weapons.standalone(wid)
        meta['file'] = save(img, 'weapons', f'{wid}.png')
        m['weapons'][wid] = meta


def gen_warrior(m, only=None):
    """`only` = some sheet variants (e.g. frostbrand, unarmed) and/or 'aegon'
    to re-render just those into the existing manifest entry."""
    print('warrior ...')
    if only:
        if 'aegon' in only:
            gen_aegon(m)
        names = [v for v in only if v != 'aegon']
        if names:
            gen_warrior_variants(m, names)
        return
    variants = [w for w in weapons.WEAPONS if not weapons.WEAPONS[w].get('npc')] + ['unarmed']
    base, _ = warrior.render(warrior.anim_idle()[0], 'steel_sword', out=512)
    info = {
        'base': save(base, 'sprites', 'warrior', 'warrior_base.png'),
        'base_size': list(base.size),
        'frame_size': [warrior.W, warrior.H],
        'facing': 'right',
        'pivot': list(warrior.PIVOT),
        'pivot_note': 'feet on the ground line; place pivot at the floor y',
        'recommended_scale_1080p': 1.9,
        'variants': variants,
        'sheet_pattern': 'sprites/warrior/sheets/{variant}/warrior_{anim}.png',
        'frames_pattern': 'sprites/warrior/frames/{anim}/warrior_{anim}_{index:02d}.png',
        'frames_note': 'individual frames are exported for the steel_sword variant',
        'animations': {},
    }
    # shared animations for every variant, then the extras of each weapon style
    jobs = [(name, spec, variants) for name, spec in warrior.ANIMS.items()]
    for style, anims in warrior.STYLE_ANIMS.items():
        users = [v for v in variants if warrior.STYLE.get(v) == style]
        jobs += [(name, spec, users) for name, spec in anims.items()]
    jobs += [(name, spec, ['unarmed']) for name, spec in warrior.CARRY_ANIMS.items()]
    for name, (fn, fps, loop), users in jobs:
        poses = fn()
        per_frame = [dict(tips={}) for _ in poses]
        for v in users:
            wid = None if v == 'unarmed' else v
            frames = []
            for i, pose in enumerate(poses):
                img, meta = warrior.render(pose, wid)
                frames.append(img)
                if 'hand' not in per_frame[i]:
                    per_frame[i].update(hand=meta['hand'], weapon_angle=meta['weapon_angle'],
                                        shoulder=meta['shoulder'], bbox=list(img.getbbox() or (0, 0, 0, 0)))
                if v == 'steel_sword':
                    save(img, 'sprites', 'warrior', 'frames', name, f'warrior_{name}_{i:02d}.png')
                if 'weapon_tip' in meta:
                    per_frame[i]['tips'][v] = meta['weapon_tip']
                if 'weapon_tip2' in meta:
                    per_frame[i].setdefault('tips2', {})[v] = meta['weapon_tip2']
                    per_frame[i].setdefault('hands2', {})[v] = meta['hand2']
            save(sheet(frames), 'sprites', 'warrior', 'sheets', v, f'warrior_{name}.png')
        info['animations'][name] = {'frames': len(poses), 'fps': fps, 'loop': loop,
                                    'per_frame': per_frame, 'variants': users}
        print(f'  {name}: {len(poses)} frames x {len(users)} variants')
    info['styles'] = dict(warrior.STYLE)
    m['warrior'] = info
    # Aemond Targaryen, unhorsed (Level 5 finale)
    frames = [warrior.render(p, 'aemond_blade', palette=warrior.AEMOND)[0] for p in warrior.anim_aemond()]
    m['aemond'] = {'sheet': save(sheet(frames), 'sprites', 'aemond', 'aemond.png'),
                   'frame_size': [warrior.W, warrior.H], 'pivot': list(warrior.PIVOT), 'frames': len(frames),
                   'facing': 'right', 'note': '0 thrown, 1 landed, 2 kneeling (blade dropped), 3 head raised'}
    gen_aegon(m)


def gen_warrior_variants(m, names):
    """Re-render some sheet variants (new weapons, the launcher poses) into the existing entry."""
    info = m['warrior']
    jobs = [(name, spec, names) for name, spec in warrior.ANIMS.items()]
    for style, anims in warrior.STYLE_ANIMS.items():
        users = [v for v in names if warrior.STYLE.get(v) == style]
        if users:
            jobs += [(name, spec, users) for name, spec in anims.items()]
    if 'unarmed' in names:
        jobs += [(name, spec, ['unarmed']) for name, spec in warrior.CARRY_ANIMS.items()]
    for v in names:
        if v not in info['variants']:
            info['variants'].append(v)
    for name, (fn, fps, loop), users in jobs:
        poses = fn()
        a = info['animations'].get(name)
        if not a:
            a = info['animations'][name] = {'frames': len(poses), 'fps': fps, 'loop': loop,
                                            'per_frame': [dict(tips={}) for _ in poses], 'variants': []}
        for v in users:
            wid = None if v == 'unarmed' else v
            frames = []
            for i, pose in enumerate(poses):
                img, meta = warrior.render(pose, wid)
                frames.append(img)
                pf = a['per_frame'][i]
                pf.setdefault('hand', meta['hand'])
                pf.setdefault('weapon_angle', meta['weapon_angle'])
                pf['shoulder'] = meta['shoulder']
                pf.setdefault('bbox', list(img.getbbox() or (0, 0, 0, 0)))
                if 'weapon_tip' in meta:
                    pf.setdefault('tips', {})[v] = meta['weapon_tip']
            save(sheet(frames), 'sprites', 'warrior', 'sheets', v, f'warrior_{name}.png')
            if v not in a['variants']:
                a['variants'].append(v)
        print(f'  {name}: {len(poses)} frames x {users}')


def gen_aegon(m):
    """Aegon Targaryen, the Level 7 duellist: the warrior rig in his colours, with Blackfyre."""
    print('aegon ...')
    info = {'frame_size': [warrior.W, warrior.H], 'pivot': list(warrior.PIVOT), 'facing': 'right',
            'sheet_pattern': 'sprites/aegon/aegon_{anim}.png', 'weapon': 'blackfyre', 'animations': {}}
    for name, (fn, fps, loop) in warrior.aegon_anims().items():
        frames, per_frame = [], []
        for pose in fn():
            img, meta = warrior.render(pose, 'blackfyre', palette=warrior.AEGON)
            frames.append(img)
            per_frame.append({'hand': meta['hand'], 'tip': meta.get('weapon_tip'), 'shoulder': meta['shoulder'],
                              'weapon_angle': meta['weapon_angle'], 'bbox': list(img.getbbox() or (0, 0, 0, 0))})
        save(sheet(frames), 'sprites', 'aegon', f'aegon_{name}.png')
        info['animations'][name] = {'frames': len(frames), 'fps': fps, 'loop': loop, 'per_frame': per_frame}
        print(f'  {name}: {len(frames)} frames')
    m['aegon'] = info


# Each dragon is the same rig with its own palette; dragons with the sweep
# and charge attacks get the extra animations.
DRAGONS = {
    'dragon_fire': dict(palette=None, extra=False, scale=1.25),
    'dragon_emberwing': dict(palette=dragon.EMBERWING, extra=True, scale=1.05),
    'dragon_meleys': dict(palette=dragon.MELEYS, opts=dragon.MELEYS_OPTS, extra=True, slam=True, scale=1.3),
    'dragon_rhagal': dict(palette=dragon.RHAGAL, opts=dragon.RHAGAL_OPTS, extra=True, level=True, scale=1.1),
    # Vhagar renders at 1.25x resolution (`res`); its pivot and anchors are in pixels of the larger frame
    'dragon_vhagar': dict(palette=dragon.VHAGAR, opts=dragon.VHAGAR_OPTS, extra=True, slam=True, vhagar=True,
                          scale=1.5, res=1.25),
    'dragon_drogon': dict(palette=dragon.DROGON, opts=dragon.DROGON_OPTS, extra=True, level=True, scale=1.3),
    'dragon_viserion': dict(palette=dragon.VISERION, opts=dragon.VISERION_OPTS, extra=True, level=True, scale=1.15),
    # Level 7: the Three Calamities
    'dragon_sunfyre': dict(palette=dragon.SUNFYRE, opts=dragon.SUNFYRE_OPTS, extra=True, level=True, vhagar=True,
                           scale=1.2),
    'dragon_vermithor': dict(palette=dragon.VERMITHOR, opts=dragon.VERMITHOR_OPTS, extra=True, slam=True, level=True,
                             vhagar=True, scale=1.3, res=1.2),
    'dragon_balerion': dict(palette=dragon.BALERION, opts=dragon.BALERION_OPTS, extra=True, slam=True, level=True,
                            vhagar=True, scale=1.55, res=1.45),
    'dragon_vhagar_awakened': dict(palette=dragon.VHAGAR_AWAKE, opts=dragon.VHAGAR_AWAKE_OPTS, extra=True,
                                   slam=True, vhagar=True, awakened=True, scale=1.5, res=1.25),
}


def gen_dragon(m, only=None):
    for key, spec in DRAGONS.items():
        if only and key not in only:
            continue
        print(f'{key} ...')
        anims = dict(dragon.ANIMS)
        if spec['extra']:
            anims.update(dragon.EXTRA_ANIMS)
        if spec.get('slam'):
            anims.update(dragon.SLAM_ANIMS)
        if spec.get('level'):
            anims.update(dragon.BREATH_LEVEL_ANIMS)
        if spec.get('vhagar'):
            anims.update(dragon.VHAGAR_ANIMS)
        if spec.get('awakened'):
            anims['rise'] = (dragon.anim_rise, 6, False)
            anims['death'] = (dragon.anim_death_unseated, 7, False)
        res = spec.get('res', 1)
        pad = (spec.get('opts') or {}).get('headroom', 0)
        size = (round(dragon.W * res), round((dragon.H + pad) * res))
        kw = dict(palette=spec['palette'], opts=spec.get('opts'), out=size if res != 1 or pad else None)
        base, _ = dragon.render(dragon.anim_idle()[0], **kw)
        info = {
            'base': save(base, 'sprites', key, f'{key}_base.png'),
            'frame_size': list(size),
            'res': res,
            'facing': 'left',
            'pivot': [size[0] / 2, (dragon.GROUND + pad) * res],
            'recommended_scale_1080p': spec['scale'],
            'sheet_pattern': f'sprites/{key}/sheets/{key}_{{anim}}.png',
            'frames_pattern': f'sprites/{key}/frames/{{anim}}/{key}_{{anim}}_{{index:02d}}.png',
            'anchors_note': 'mouth = where to spawn fire; fire_angle uses 0=down, 90=right, 180=up, 270=left',
            'animations': {},
        }
        for name, (fn, fps, loop) in anims.items():
            frames, per_frame = [], []
            for i, pose in enumerate(fn()):
                img, meta = dragon.render(pose, **kw)
                frames.append(img)
                meta['bbox'] = list(img.getbbox() or (0, 0, 0, 0))
                meta['breathing_fire'] = pose.get('glow', 0) >= 1.0
                per_frame.append(meta)
                save(img, 'sprites', key, 'frames', name, f'{key}_{name}_{i:02d}.png')
            save(sheet(frames), 'sprites', key, 'sheets', f'{key}_{name}.png')
            info['animations'][name] = {'frames': len(frames), 'fps': fps, 'loop': loop,
                                        'per_frame': per_frame}
            print(f'  {name}: {len(frames)} frames')
        m[key] = info


BACKGROUND_SETS = {
    'frozen_wall': dict(
        sky=lambda: backgrounds.sky(),
        far=lambda: backgrounds.mountains_and_wall(),
        mid=backgrounds.mid_ruins, fg=backgrounds.fg_battlements,
        props=backgrounds.PROPS, layout=backgrounds.FROZEN_COVER),
    'burning_keep': dict(
        sky=backgrounds.sky_night, far=backgrounds.keep_far,
        mid=backgrounds.courtyard_mid, fg=backgrounds.courtyard_fg,
        props=backgrounds.PROPS_BROKEN, layout=backgrounds.KEEP_COVER),
    'ice_gate': dict(
        sky=backgrounds.sky_cold, far=backgrounds.gate_far,
        mid=backgrounds.gate_mid, fg=backgrounds.gate_fg,
        props=backgrounds.PROPS_GATE, layout=backgrounds.GATE_COVER),
    'ashen_bridge': dict(
        sky=backgrounds.sky_storm, far=backgrounds.chasm_far,
        mid=backgrounds.spires_mid, fg=backgrounds.bridge_fg,
        props=backgrounds.PROPS_BRIDGE, layout=backgrounds.BRIDGE_COVER),
    'wallbreaker': dict(
        sky=wallbreaker.sky_wallbreaker, far=wallbreaker.wall_far,
        mid=wallbreaker.gate_mid, fg=wallbreaker.ground_fg,
        props=wallbreaker.PROPS_WALLBREAKER, layout=wallbreaker.WALLBREAKER_COVER),
    'dragonpit': dict(
        sky=dragonpit.sky_pit, far=dragonpit.city_far,
        mid=dragonpit.pit_mid, fg=dragonpit.pit_fg,
        props=dragonpit.PROPS_DRAGONPIT, layout=dragonpit.DRAGONPIT_COVER),
    'kingswall': dict(
        sky=kingswall.sky_kingswall, far=kingswall.far_beyond,
        mid=kingswall.mid_parapet, fg=kingswall.fg_walkway,
        props=kingswall.PROPS_KINGSWALL, layout=kingswall.KINGSWALL_COVER,
        extra=lambda d: {'ending_panorama': {
            'file': save(kingswall.ending_panorama().convert('RGB'), *d, 'kingswall_ending.png'),
            'size': list(kingswall.PANORAMA), 'spot': list(kingswall.PANORAMA_SPOT),
            'note': 'the warrior stands at spot (feet) for the closing pull-back'}}),
}


def gen_backgrounds(m, only=None):
    if only:
        m.setdefault('backgrounds', {})
    else:
        m['backgrounds'] = {}
    for set_id, spec in BACKGROUND_SETS.items():
        if only and set_id not in only:
            continue
        print(f'background {set_id} ... (about 25 s)')
        d = ('backgrounds', set_id)
        sky = spec['sky']()
        far = spec['far']()
        mid = spec['mid']()
        fg = spec['fg']()
        props = {k: f() for k, f in spec['props'].items()}
        cover, placements = backgrounds.cover_layer(props, spec['layout'])
        bg = sky.copy()
        bg.alpha_composite(far)
        layers = [
            {'id': 'sky', 'file': save(sky.convert('RGB'), *d, f'{set_id}_sky.png'), 'parallax': 0.05},
            {'id': 'far', 'file': save(far, *d, f'{set_id}_far.png'), 'parallax': 0.15,
             'note': 'mountains + ice wall, transparent sky'},
            {'id': 'mid', 'file': save(mid, *d, f'{set_id}_mid_ruins.png'), 'parallax': 0.45},
            {'id': 'fg', 'file': save(fg, *d, f'{set_id}_fg_battlements.png'), 'parallax': 1.0,
             'note': 'walkable floor at floor_y'},
            {'id': 'cover', 'file': save(cover, *d, f'{set_id}_cover.png'), 'parallax': 1.0,
             'optional': True},
        ]
        prop_meta = {}
        for name, made in props.items():
            img, base_y = made[0], made[1]
            meta = {'file': save(img, *d, 'props', f'{name}.png'), 'size': list(img.size), 'ground_y': base_y}
            for key, value in (made[2] if len(made) > 2 else {}).items():
                if hasattr(value, 'save'):
                    meta.setdefault('states', {})[key] = save(value, *d, 'props', f'{name}_{key}.png')
                else:
                    meta[key] = value
            prop_meta[name] = meta
        extra = spec['extra'](d) if spec.get('extra') else {}
        m['backgrounds'][set_id] = {
            **extra,
            'combined': save(bg.convert('RGB'), *d, f'{set_id}_bg.png'),
            'size': [backgrounds.W, backgrounds.H],
            'tileable_x': True,
            'floor_y': backgrounds.FLOOR,
            'layers': layers,
            'props': prop_meta,
            'cover_placements': placements,
        }


# ------------------------------------------------------------ concept ----

def _font(size):
    for name in ('georgiab.ttf', 'georgia.ttf', 'timesbd.ttf', 'arial.ttf'):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()


def _fire_cone(size, start, angle_deg, length, spread, seed=3):
    """Procedural flame stream: particles accumulate into a heat map that is
    colour-ramped (additive, like the engine's live effect)."""
    w, h = size
    heat = np.zeros((h, w), np.float32)
    rng = random.Random(seed)
    a = math.radians(angle_deg)
    dx, dy = math.sin(a), math.cos(a)
    for _ in range(1100):
        t = rng.random() ** 0.7
        dist = t * length
        off = rng.gauss(0, 1) * spread * (0.12 + t * 0.9)
        x = start[0] + dx * dist - dy * off
        y = start[1] + dy * dist + dx * off - t * t * 30
        r = 5 + 30 * t * rng.uniform(0.6, 1.2)
        amp = (1.0 - 0.7 * t) * rng.uniform(0.08, 0.2)
        x0, x1 = int(max(0, x - 2 * r)), int(min(w, x + 2 * r))
        y0, y1 = int(max(0, y - 2 * r)), int(min(h, y + 2 * r))
        if x1 <= x0 or y1 <= y0:
            continue
        yy, xx = np.mgrid[y0:y1, x0:x1]
        heat[y0:y1, x0:x1] += amp * np.exp(-((xx - x) ** 2 + (yy - y) ** 2) / (2 * (r * 0.6) ** 2))
    stops = np.array([0.0, 0.25, 0.55, 0.95, 1.5])
    cols = np.array([(120, 18, 0), (214, 56, 10), (255, 132, 28), (255, 214, 110), (255, 250, 228)], np.float32)
    hv = np.clip(heat, 0, 1.5)
    rgb = np.stack([np.interp(hv, stops, cols[:, k]) for k in range(3)], -1)
    alpha = np.clip(heat * 2.4, 0, 1)
    flame = Image.fromarray(np.dstack([rgb, alpha * 255]).astype(np.uint8), 'RGBA')
    glow = flame.filter(ImageFilter.GaussianBlur(30))
    out = Image.new('RGBA', size, (0, 0, 0, 0))
    out.alpha_composite(glow)
    out.alpha_composite(flame)
    return out


def _snow(size, n, seed):
    layer = Image.new('RGBA', size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    rng = random.Random(seed)
    for _ in range(n):
        x, y = rng.uniform(0, size[0]), rng.uniform(0, size[1])
        r = rng.uniform(1, 3.4)
        d.line([(x, y), (x - r * 2.5, y - r * 1.2)], fill=(240, 246, 252, int(rng.uniform(120, 230))),
               width=max(1, int(r)))
    return layer.filter(ImageFilter.GaussianBlur(0.6))


def _vignette(img):
    w, h = img.size
    v = Image.new('L', (w, h), 0)
    ImageDraw.Draw(v).ellipse([-w * 0.25, -h * 0.35, w * 1.25, h * 1.35], fill=255)
    v = v.filter(ImageFilter.GaussianBlur(160))
    dark = Image.new('RGBA', (w, h), (6, 8, 14, 255))
    dark.putalpha(v.point(lambda p: int((255 - p) * 0.75)))
    img.alpha_composite(dark)


def gen_concept(m):
    print('concept art ...')
    fw = m['backgrounds']['frozen_wall']
    L = {l['id']: Image.open(os.path.join(ASSETS, l['file'])).convert('RGBA') for l in fw['layers']}
    W, H = 1920, 1080

    def crop(img, x):
        return img.crop((x, 0, x + W, H))

    key = crop(L['sky'], 700)
    key.alpha_composite(crop(L['far'], 760))
    key.alpha_composite(crop(L['mid'], 900))
    key.alpha_composite(crop(L['fg'], 1000))
    floor = fw['floor_y']

    # dragon breathing fire at the warrior
    dpose = dragon.anim_fire_breath()[4]
    s_d = 1.25
    dimg, dmeta = dragon.render(dpose, out=(int(dragon.W * s_d), int(dragon.H * s_d)))
    dx, dy = 880, floor - int(dragon.GROUND * s_d) + 6
    mouth = (dx + dmeta['mouth'][0], dy + dmeta['mouth'][1])
    # warrior mid-swing with Dragonbane
    s_w = 1.9
    wpose = warrior.anim_attack()[2]
    wimg, _ = warrior.render(wpose, 'dragonbane', out=int(warrior.W * s_w))
    wx, wy = 300 - int(warrior.ORIGIN[0] * s_w), floor - int(warrior.PIVOT[1] * s_w) + 4

    key.alpha_composite(dimg, (dx, dy))
    target = (wx + 128 * s_w + 40, wy + 150 * s_w)
    aim = math.degrees(math.atan2(target[0] - mouth[0], target[1] - mouth[1]))
    fire = _fire_cone((W, H), mouth, aim, math.dist(mouth, target) - 150, 26)
    key.alpha_composite(wimg, (wx, wy))
    key.alpha_composite(fire)
    # warm light spill from the fire onto the scene
    spill = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(spill).ellipse([mouth[0] - 700, mouth[1] - 300, mouth[0] + 200, mouth[1] + 420],
                                  fill=(255, 120, 40, 60))
    key.alpha_composite(spill.filter(ImageFilter.GaussianBlur(120)))
    key.alpha_composite(_snow((W, H), 900, 4))
    _vignette(key)
    concept = {'keyart': save(key.convert('RGB'), 'concept', 'keyart_frozen_wall.png')}

    # full layered composite of the level panorama
    pano = L['sky'].copy()
    for k in ('far', 'mid', 'fg', 'cover'):
        pano.alpha_composite(L[k])
    concept['panorama'] = save(pano.convert('RGB'), 'concept', 'frozen_wall_layers_composite.png')

    # weapon lineup: the warrior holding each blade
    cell, top = 360, 40
    ids = [w for w in weapons.WEAPONS if not weapons.WEAPONS[w].get('npc')]
    lineup = Image.new('RGBA', (cell * len(ids), 760), (24, 28, 38, 255))
    g = ImageDraw.Draw(lineup)
    for y in range(760):
        t = y / 760
        g.line([(0, y), (cell * len(ids), y)], fill=(int(30 - 12 * t), int(36 - 14 * t), int(50 - 18 * t), 255))
    font = _font(30)
    for i, wid in enumerate(ids):
        img, _ = warrior.render(warrior.anim_idle()[0], wid, out=640)
        lineup.alpha_composite(img.crop((140, 0, 140 + cell, 512)), (i * cell, top))
        icon = Image.open(os.path.join(ASSETS, m['weapons'][wid]['file'])).rotate(-90, expand=True)
        icon.thumbnail((cell - 40, 110))
        lineup.alpha_composite(icon, (i * cell + (cell - icon.width) // 2, 600 + (110 - icon.height) // 2))
        name = weapons.WEAPONS[wid]['name']
        tw = g.textlength(name, font=font)
        g.text((i * cell + (cell - tw) / 2, 548), name, font=font, fill=(226, 214, 186, 255))
    concept['weapon_lineup'] = save(lineup.convert('RGB'), 'concept', 'weapon_lineup.png')

    # scale reference: warrior vs dragon at recommended in-game sizes
    ref = Image.new('RGBA', (1500, 760), (36, 42, 56, 255))
    g = ImageDraw.Draw(ref)
    g.line([(0, 700), (1500, 700)], fill=(120, 132, 150, 255), width=3)
    w_img, _ = warrior.render(warrior.anim_idle()[0], 'steel_sword', out=int(warrior.W * s_w))
    ref.alpha_composite(w_img, (60, 700 - int(warrior.PIVOT[1] * s_w)))
    d_img, _ = dragon.render(dragon.anim_idle()[0], out=(int(dragon.W * s_d), int(dragon.H * s_d)))
    ref.alpha_composite(d_img, (500, 700 - int(dragon.GROUND * s_d)))
    concept['scale_reference'] = save(ref.convert('RGB'), 'concept', 'scale_reference.png')
    m['concept'] = concept


def gen_frostpiercer(m):
    """Level 7's launcher: deploy frames, the empty rail, the spear, an icon."""
    print('frostpiercer ...')
    files = {k: save(v, 'objects', 'frostpiercer', f'frostpiercer_{k}.png') for k, v in frostpiercer.frames().items()}
    files['icon'] = save(frostpiercer.icon(), 'objects', 'frostpiercer', 'frostpiercer_icon.png')
    m.setdefault('objects', {})['frostpiercer'] = {**files, **frostpiercer.meta(), 'deploy_frames': 5}


def gen_ui(m):
    m['ui'] = {'sigil': save(backgrounds.sigil_image(), 'ui', 'stark_sigil.png')}
    imgs, meta = scorpion.parts()
    files = {k: save(v, 'objects', 'scorpion', f'scorpion_{k}.png') for k, v in imgs.items()}
    m.setdefault('objects', {})['scorpion'] = {**files, **meta}


GROUPS = {
    'weapons': gen_weapons,
    'warrior': gen_warrior,
    'dragon': gen_dragon,
    'backgrounds': gen_backgrounds,
    'ui': gen_ui,
    'frostpiercer': gen_frostpiercer,
    'concept': gen_concept,
}


def main(argv):
    """A group may be narrowed to some entries, e.g.
    `dragon:dragon_vhagar,dragon_vhagar_awakened` or `backgrounds:wallbreaker`."""
    wanted = {}
    for a in argv or list(GROUPS):
        g, _, keys = a.partition(':')
        wanted[g] = set(keys.split(',')) if keys else None
    m = load_manifest()
    for g in GROUPS:
        if g in wanted:
            if wanted[g] and g in ('dragon', 'backgrounds', 'warrior'):
                GROUPS[g](m, only=wanted[g])
            else:
                GROUPS[g](m)
            write_manifest(m)
    print('done ->', ASSETS)


if __name__ == '__main__':
    main(sys.argv[1:])
