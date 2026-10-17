"""Level 5, The Wallbreaker: the shattered fortress gate beyond the Frozen
Wall. Deep-blue night, the Wall itself breached on the horizon, a gate
tower pair with a collapsed arch and giant broken chains, frozen flagstone
ground, and the arena props (breakable ice and pillars, boulders, ramparts,
the portcullis, weapon caches).

Same contract as backgrounds.py: full-width layers are W x H and tile
left-to-right; the walkable floor is at FLOOR.
"""
import math

import numpy as np
from PIL import Image

from .backgrounds import (FLOOR, H, STONE_OUT, W, col, crack, downsample, fbm, fire_pit, mountains_and_wall,
                          rubble_pile, smoothstep, snow_cap, to_img, vgrad, wrap_x)
from .common import Canvas, mix, seeded, shade

IRON = (38, 38, 44)
IRON_L = (96, 98, 110)
GRANITE = (74, 80, 94)


# ------------------------------------------------------------ materials --

def bevel_blocks(c, x0, y0, x1, y1, bh, seed, base, light=1.0):
    """Masonry with a lit top edge, a shadowed underside, chips and mortar."""
    rs = seeded(seed)
    c.poly([(x0, y0), (x1, y0), (x1, y1), (x0, y1)], shade(base, 0.42), outline=None)
    y, row = y0, 0
    while y < y1:
        h = min(bh * rs.uniform(0.85, 1.15), y1 - y)
        x = x0 - (rs.uniform(0.3, 1.1) * bh if row % 2 else 0)
        while x < x1:
            w = rs.uniform(bh * 1.3, bh * 2.6)
            a, b = max(x, x0) + 1.5, min(x + w, x1) - 1.5
            if b - a > 3:
                f = rs.uniform(0.8, 1.1) * light
                face = [(a, y + 1.5), (b, y + 1.5), (b, y + h - 1.5), (a, y + h - 1.5)]
                c.grad_poly(face, shade(base, f * 1.12), shade(base, f * 0.82), (0, y), (0, y + h), outline=None)
                c.line([(a, y + 2.2), (b, y + 2.2)], shade(base, f * 1.38), 1.2)          # lit top edge
                c.line([(a, y + h - 2), (b, y + h - 2)], shade(base, 0.5), 1.4)            # underside
                c.line([(b - 1, y + 2), (b - 1, y + h - 2)], shade(base, 0.62), 1.0)
                if rs.random() < 0.25:                                                   # chipped corner
                    cx = a if rs.random() < 0.5 else b
                    s = rs.uniform(4, 9)
                    c.poly([(cx, y + 1.5), (cx + (s if cx == a else -s), y + 1.5), (cx, y + 1.5 + s)],
                           shade(base, 0.45), outline=None)
            x += w
        y += h
        row += 1


def weather(img, seed, strength=0.34, cool=0.0):
    """Grain, grime and frost multiplied into a finished prop or layer."""
    arr = np.asarray(img).astype(np.float32)
    h, w = arr.shape[:2]
    n = fbm(w, h, max(4, w // 22), max(4, h // 22), seed, 5)
    fine = fbm(w, h, max(8, w // 5), max(8, h // 5), seed + 3, 2)
    lum = arr[..., :3].mean(-1) / 255
    keep = np.clip((0.86 - lum) / 0.25, 0, 1)        # snow and fire stay clean
    f = 1 + ((n - 0.5) * strength + (fine - 0.5) * strength * 0.6) * keep
    arr[..., :3] *= f[..., None]
    if cool:
        yy = np.linspace(0, 1, h, dtype=np.float32)[:, None]
        arr[..., :3] = arr[..., :3] * (1 - cool * (1 - yy)[..., None] * 0.3) + \
            col((120, 150, 190)) * cool * (1 - yy)[..., None] * 0.3
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), 'RGBA')


def chain(c, p0, p1, link=20, width=5.0, color=IRON, broken_end=False):
    """A heavy iron chain: links alternate face-on rings and edge-on bars."""
    dx, dy = p1[0] - p0[0], p1[1] - p0[1]
    L = math.hypot(dx, dy)
    n = max(2, int(L / link))
    ux, uy = dx / L, dy / L
    for i in range(n):
        a = (p0[0] + ux * link * i, p0[1] + uy * link * i)
        b = (a[0] + ux * link * 1.15, a[1] + uy * link * 1.15)
        if i % 2 == 0:
            m = ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2)
            c.ellipse(m, link * 0.62 if abs(ux) > 0.7 else link * 0.36, link * 0.36 if abs(ux) > 0.7 else link * 0.62,
                      color, outline=STONE_OUT, ow=1.2)
            c.ellipse(m, link * 0.36 if abs(ux) > 0.7 else link * 0.16, link * 0.16 if abs(ux) > 0.7 else link * 0.36,
                      (0, 0, 0, 0), outline=None)
        else:
            c.line([a, b], STONE_OUT, width + 2.4)
            c.line([a, b], color, width)
            c.line([(a[0] - uy * 1.2, a[1] + ux * 1.2), (b[0] - uy * 1.2, b[1] + ux * 1.2)], IRON_L, 1.2)
    if broken_end:
        e = (p0[0] + ux * link * n, p0[1] + uy * link * n)
        c.line([e, (e[0] + 8, e[1] + 10)], color, width * 0.8)


def icicles(c, x0, x1, y, seed, n=None, max_len=46):
    rs = seeded(seed)
    n = n or int((x1 - x0) / 14)
    for _ in range(n):
        x = rs.uniform(x0, x1)
        L = rs.uniform(10, max_len)
        c.poly([(x - 4, y), (x + 4, y), (x + rs.uniform(-1, 1), y + L)], (196, 228, 244),
               outline=(76, 112, 144, 255), ow=0.7)
        c.line([(x - 1.5, y + 2), (x, y + L * 0.7)], (246, 252, 255), 0.6)


def torch_glow(c, x, y, r=120, a=150):
    g = c.layer()
    g.circle((x, y), r, (255, 140, 50, a), outline=None)
    c.glow(g.img, r * 0.45, 1.0)


def wall_torch(c, x, y):
    """An iron bracket torch on a wall (like the gatehouse reference)."""
    torch_glow(c, x, y - 20, 140, 130)
    c.poly([(x - 4, y + 30), (x + 4, y + 30), (x + 6, y - 6), (x - 6, y - 6)], IRON, outline=STONE_OUT, ow=1.0)
    c.poly([(x - 12, y - 6), (x + 12, y - 6), (x + 8, y + 6), (x - 8, y + 6)], IRON, outline=STONE_OUT, ow=1.0)
    flame = [(x - 12, y - 6), (x - 9, y - 30), (x - 3, y - 20), (x + 1, y - 46), (x + 6, y - 22), (x + 11, y - 32),
             (x + 12, y - 6)]
    c.poly(flame, (255, 128, 30), outline=None)
    c.poly([(x - 6, y - 6), (x - 2, y - 26), (x + 3, y - 16), (x + 6, y - 6)], (255, 224, 140), outline=None)


def hanging_cage(c, x, y_top, L, seed):
    """An iron gibbet cage hanging on a chain, a lantern burning inside."""
    chain(c, (x, y_top), (x, y_top + L), link=10, width=2.4)
    cy = y_top + L
    torch_glow(c, x, cy + 40, 90, 120)
    c.ellipse((x, cy + 8), 26, 6, IRON, outline=STONE_OUT, ow=1.0)
    for k in range(7):
        bx = x - 24 + k * 8
        c.line([(bx, cy + 8), (bx + (k - 3) * 0.6, cy + 74)], IRON, 2.4)
    c.ellipse((x, cy + 76), 26, 7, IRON, outline=STONE_OUT, ow=1.0)
    c.ellipse((x, cy + 76), 18, 4, (255, 200, 120), outline=None)
    c.circle((x, cy + 46), 8, (255, 210, 130), outline=None)


# ------------------------------------------------------------ layers -----

def sky_wallbreaker():
    """Deep-blue storm night: a moon behind racing cloud, firelight below."""
    base = vgrad([(0, (3, 6, 16)), (300, (10, 20, 40)), (620, (26, 42, 70)), (860, (52, 70, 100)),
                  (1080, (66, 82, 108))])
    rgb = np.repeat(base[:, None, :], W, axis=1)
    yy = np.arange(H, dtype=np.float32)[:, None]
    xx = np.arange(W, dtype=np.float32)[None, :]
    mx, my = 2480, 210
    dxm = np.minimum(np.abs(xx - mx), W - np.abs(xx - mx))
    d = np.sqrt(dxm ** 2 + (yy - my) ** 2)
    halo = np.exp(-(d / 460) ** 2)
    rgb += halo[..., None] * col((70, 92, 140)) * 0.8
    moon = smoothstep(58, 52, d)
    n1 = fbm(W, H, 6, 3, 901, 6)
    heavy = smoothstep(0.44, 0.66, n1) * smoothstep(860, 40, yy)
    lit = np.clip((n1 - np.roll(n1, 10, axis=0)) * 9, -1, 1)
    lit[:12] = 0
    cloud = col((8, 12, 24)) + col((80, 104, 150)) * np.clip(0.2 + 0.6 * lit, 0, 1)[..., None] * \
        (0.35 + 1.2 * halo)[..., None]
    rgb = rgb * (1 - moon[..., None] * (1 - heavy[..., None])) + col((222, 230, 244)) * moon[..., None] * \
        (1 - heavy[..., None])
    rgb = rgb * (1 - heavy[..., None] * 0.9) + cloud * heavy[..., None] * 0.9
    fire = np.exp(-((yy - 930) / 170) ** 2) * (0.45 + 0.7 * fbm(W, H, 24, 2, 903, 3))
    rgb += fire[..., None] * col((120, 48, 14))
    rng = np.random.default_rng(905)
    for _ in range(420):
        x, y = int(rng.integers(0, W - 2)), int(rng.integers(0, 520))
        b = rng.uniform(0.2, 0.75) * (1 - heavy[y, x])
        rgb[y:y + 2, x:x + 2] = rgb[y:y + 2, x:x + 2] * (1 - b) + 230 * b
    return to_img(rgb)


def wall_far():
    """The Frozen Wall on the horizon with a great V-shaped breach."""
    img = mountains_and_wall(breaches=((1240, 760, 310), (3260, 260, 90)), seed_shift=7, cracks=34,
                             watch=(300, 2300, 2800))
    arr = np.asarray(img).astype(np.float32)
    arr[..., :3] = arr[..., :3] * 0.42 + col((26, 40, 74)) * 0.58       # night
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), 'RGBA')


def _gate_tower(c, x, w, top, ground, seed, torch=True):
    rs = seeded(seed)
    n = 6
    crest = []
    for i in range(n + 1):
        tx = x - w / 2 + w * i / n
        crest.append((tx, top + (rs.uniform(0, 70) if 0 < i < n else rs.uniform(0, 20))))
    body = [(x - w / 2, ground)] + crest + [(x + w / 2, ground)]
    c.poly(body, (58, 64, 78), outline=STONE_OUT, ow=1.6)
    lay = c.layer()
    bevel_blocks(lay, x - w / 2, top - 10, x + w / 2, ground, 30, seed, (62, 68, 84))
    lay.poly([(x + w * 0.2, top - 10), (x + w / 2, top - 10), (x + w / 2, ground), (x + w * 0.2, ground)],
             (0, 0, 0, 90), outline=None)
    for k in range(3):
        wy = top + 110 + k * 130
        if wy > ground - 60:
            continue
        wx = x + rs.uniform(-w * 0.18, w * 0.12)
        lay.poly([(wx - 9, wy + 34), (wx - 9, wy), (wx, wy - 12), (wx + 9, wy), (wx + 9, wy + 34)], (14, 16, 22),
                 outline=None)
    c.composite(lay.img, c.mask(body))
    snow_cap(c, crest, 14, seed + 1)
    icicles(c, x - w / 2 + 6, x + w / 2 - 6, top + 70, seed + 2, n=10, max_len=34)
    if torch:
        wall_torch(c, x - w * 0.32, top + 200)


def _arch(c, cx, half, spring, ground, thick, seed, broken=None):
    """A stone arch. `broken` = (from_angle, to_angle) in degrees that are gone."""
    rs = seeded(seed)
    segs = 18
    for k in range(segs):
        a0 = 180 - 180 * k / segs
        a1 = 180 - 180 * (k + 1) / segs
        mid = (a0 + a1) / 2
        if broken and broken[1] <= mid <= broken[0]:
            continue
        r0, r1 = half, half + thick
        pts = []
        for a, r in ((a0, r0), (a1, r0), (a1, r1), (a0, r1)):
            t = math.radians(a)
            pts.append((cx + math.cos(t) * r, spring - math.sin(t) * r))
        c.poly(pts, shade((70, 76, 90), rs.uniform(0.85, 1.1)), outline=STONE_OUT, ow=1.2)
        c.line([pts[2], pts[3]], (120, 126, 140), 1.0)
    for sx in (-1, 1):
        px = cx + sx * (half + thick / 2)
        c.poly([(px - thick / 2, ground), (px - thick / 2, spring), (px + thick / 2, spring), (px + thick / 2, ground)],
               (64, 70, 84), outline=STONE_OUT, ow=1.4)
        lay = c.layer()
        bevel_blocks(lay, px - thick / 2, spring, px + thick / 2, ground, 26, seed + int(sx + 3), (66, 72, 86))
        c.composite(lay.img, c.mask([(px - thick / 2, ground), (px - thick / 2, spring), (px + thick / 2, spring),
                                     (px + thick / 2, ground)]))


def gate_mid():
    """The shattered gate: twin towers, a collapsed arch, chains, battlements."""
    c = Canvas(W, H, 2)
    ground = 862
    rs = seeded(930)
    # broken curtain walls with crenellations
    for (x0, x1, h, sd) in ((-160, 640, 220, 1), (1820, 2560, 250, 2), (3000, 4000, 200, 3)):
        top = [(x0, ground - h * 0.8)]
        for i in range(1, 12):
            top.append((x0 + (x1 - x0) * i / 12, ground - h * rs.uniform(0.82, 1.0)))
        top.append((x1, ground - h * 0.55))
        body = [(x0, ground + 30)] + top + [(x1, ground + 30)]
        for dx in (0, -W, W):
            q = [(p[0] + dx, p[1]) for p in body]
            if max(p[0] for p in q) < 0 or min(p[0] for p in q) > W:
                continue
            c.poly(q, (56, 62, 76), outline=STONE_OUT, ow=1.6)
            lay = c.layer()
            bevel_blocks(lay, x0 + dx, ground - h - 20, x1 + dx, ground + 30, 24, 940 + sd, (60, 66, 80))
            c.composite(lay.img, c.mask(q))
            for i in range(1, 12, 2):
                mx = x0 + dx + (x1 - x0) * i / 12
                my = top[i][1]
                c.poly([(mx - 16, my + 2), (mx - 16, my - 22), (mx + 16, my - 22), (mx + 16, my + 2)], (60, 66, 80),
                       outline=STONE_OUT, ow=1.2)
                c.poly([(mx - 16, my - 22), (mx + 16, my - 22), (mx + 14, my - 30), (mx - 14, my - 30)],
                       (226, 234, 242), outline=None)
            snow_cap(c, [(p[0] + dx, p[1]) for p in top], 12, 950 + sd)
    # the gatehouse: two towers, the arch between them half collapsed
    for dx in (0,):
        _arch(c, 1240 + dx, 230, 520, ground, 70, 960, broken=(150, 60))
        _gate_tower(c, 900 + dx, 240, 250, ground, 961)
        _gate_tower(c, 1580 + dx, 240, 280, ground, 962)
        # giant broken chains that once held the gate
        chain(c, (960, 420), (1110, 640), link=26, width=7, broken_end=True)
        chain(c, (1520, 440), (1430, 700), link=26, width=7, broken_end=True)
        chain(c, (1500, 470), (1500, 560), link=26, width=7, broken_end=True)
        rubble_pile(c, 1240, ground + 6, 420, 963, base=(70, 76, 90))
        rubble_pile(c, 1330, ground + 6, 220, 964, base=(70, 76, 90))
    for (x, w, top, sd) in ((2900, 200, 330, 970), (3520, 230, 300, 971)):
        for xx in wrap_x(x, w):
            _gate_tower(c, xx, w, top, ground, sd, torch=sd == 970)
    for x in (2220, 3220):
        for xx in wrap_x(x, 40):
            c.poly([(xx - 6, ground), (xx - 6, 470), (xx + 6, 470), (xx + 6, ground)], (40, 34, 30),
                   outline=STONE_OUT, ow=1.0)
            c.line([(xx, 474), (xx + 70, 474)], (40, 34, 30), 6)
            hanging_cage(c, xx + 62, 476, 90, int(xx))
    for x in (380, 2440):
        for xx in wrap_x(x, 60):
            fire_pit(c, xx, ground + 4, 0.6)
    # snow drift and ice blocks at the foot of the walls
    drift = [(x, ground + 8 * math.sin(x / 140)) for x in range(0, W + 1, 20)] + [(W, H), (0, H)]
    c.grad_poly(drift, (196, 210, 226), (130, 150, 176), (0, ground - 10), (0, 1000), outline=(90, 110, 140, 255),
                ow=1.0)
    for x in (560, 2080, 3300):
        for xx in wrap_x(x, 80):
            c.poly([(xx - 60, ground + 4), (xx - 46, ground - 70), (xx + 20, ground - 84), (xx + 64, ground - 30),
                    (xx + 60, ground + 4)], (150, 196, 222), outline=(70, 110, 140, 255), ow=1.2)
            c.line([(xx - 40, ground - 60), (xx + 16, ground - 74)], (230, 246, 255), 1.6)
    img = downsample(c.img, (W, H))
    img = weather(img, 931, 0.3)
    arr = np.asarray(img).astype(np.float32)
    yy = np.arange(H, dtype=np.float32)[:, None]
    fog = smoothstep(700, 1000, yy)[..., None] * 0.5
    arr[..., :3] = arr[..., :3] * (1 - fog) + col((110, 130, 160)) * fog
    arr[..., :3] = arr[..., :3] * 0.62 + col((22, 34, 64)) * 0.38           # moonlit night
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), 'RGBA')


def ground_fg():
    """Frozen flagstones in front of the gate; the walkable floor is FLOOR."""
    c = Canvas(W, H, 2)
    rs = seeded(980)
    # front face: foundation masonry and frozen earth
    face = [(0, FLOOR + 30), (W, FLOOR + 30), (W, H), (0, H)]
    c.poly(face, (40, 44, 54), outline=STONE_OUT, ow=1.6)
    lay = c.layer()
    bevel_blocks(lay, -20, FLOOR + 30, W + 20, H, 38, 981, (54, 60, 72), light=0.9)
    c.composite(lay.img, c.mask(face))
    # the walking surface: big flagstones seen at a low angle
    top = [(0, FLOOR - 2), (W, FLOOR - 2), (W, FLOOR + 32), (0, FLOOR + 32)]
    c.grad_poly(top, (112, 120, 136), (70, 76, 90), (0, FLOOR), (0, FLOOR + 32), outline=STONE_OUT, ow=1.4)
    x = 0
    while x < W:
        w = rs.uniform(90, 200)
        c.line([(x, FLOOR), (x - 10, FLOOR + 32)], (40, 44, 54), 1.6)
        c.line([(x + 2, FLOOR + 1), (x + w - 6, FLOOR + 1)], (150, 160, 176), 1.0)
        if rs.random() < 0.3:
            crack(c, x + rs.uniform(10, w - 30), FLOOR + 4, rs.uniform(40, 90), int(x), color=(30, 32, 40),
                  width=1.4, down=False)
        x += w
    # ice sheets and snow on the surface
    for _ in range(40):
        x = rs.uniform(0, W)
        w = rs.uniform(40, 160)
        for xx in wrap_x(x, w):
            if rs.random() < 0.45:
                c.ellipse((xx, FLOOR + 14), w / 2, 6, (150, 196, 224), outline=None)
                c.line([(xx - w * 0.3, FLOOR + 11), (xx + w * 0.2, FLOOR + 11)], (232, 246, 255), 1.0)
            else:
                c.ellipse((xx, FLOOR + 1), w / 2, 5, (220, 228, 238), outline=None)
    # drifts and rubble along the front edge
    for i in range(16):
        x = rs.uniform(0, W)
        for xx in wrap_x(x, 120):
            rubble_pile(c, xx, FLOOR + 70, rs.uniform(80, 160), 990 + i, base=(64, 70, 84))
    icicles(c, 0, W, FLOOR + 32, 995, n=140, max_len=30)
    for x in (700, 2600):
        for xx in wrap_x(x, 200):
            chain(c, (xx - 160, FLOOR + 4), (xx + 120, FLOOR + 10), link=22, width=6)
    img = downsample(c.img, (W, H))
    return weather(img, 982, 0.36)


# ------------------------------------------------------------ props ------

def _ice_body(c, pts, seed):
    c.grad_poly(pts, (196, 232, 248), (92, 146, 188), (0, min(p[1] for p in pts)), (0, max(p[1] for p in pts)),
                outline=(54, 88, 122, 255), ow=1.6)
    rs = seeded(seed)
    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    for _ in range(7):                         # internal fractures
        x = rs.uniform(min(xs) + 20, max(xs) - 20)
        y = rs.uniform(min(ys) + 20, max(ys) - 20)
        c.line([(x, y), (x + rs.uniform(-30, 30), y + rs.uniform(10, 40)), (x + rs.uniform(-30, 30),
                y + rs.uniform(30, 60))], (236, 250, 255, 170), 1.2)
    c.line([(min(xs) + 14, min(ys) + 16), (min(xs) + 30, max(ys) - 20)], (250, 254, 255, 200), 2.4)


def prop_ice_block():
    """Breakable cover: a fallen block of the Wall's ice."""
    def make(state):
        c = Canvas(240, 220, 2)
        if state == 'rubble':
            for k in range(7):
                x = 30 + k * 30
                c.poly([(x - 20, 216), (x - 8, 180 + (k % 3) * 10), (x + 14, 186), (x + 22, 216)], (150, 200, 226),
                       outline=(54, 88, 122, 255), ow=1.2)
            return c.finish()
        body = [(14, 216), (20, 64), (60, 30), (150, 22), (214, 50), (226, 216)]
        _ice_body(c, body, 1001)
        snow_cap(c, [(20, 64), (60, 30), (150, 22), (214, 50)], 12, 1002)
        if state == 'cracked':
            for k, (x, y) in enumerate(((90, 60), (150, 90), (60, 120))):
                crack(c, x, y, 90, 1003 + k, color=(40, 70, 100), width=2.6)
            c.d.polygon([c.P(q) for q in ((150, 22), (214, 50), (226, 110), (190, 80), (160, 60))], fill=(0, 0, 0, 0))
        return c.finish()
    return make('intact'), 216, {'cracked': make('cracked'), 'rubble': make('rubble')}


def _pillar(c, cracked=False):
    body = [(30, 446), (36, 70), (24, 56), (20, 30), (52, 22), (66, 34), (96, 14), (130, 30), (126, 56), (116, 70),
            (122, 446)]
    c.poly(body, GRANITE, outline=STONE_OUT, ow=1.8)
    lay = c.layer()
    for k in range(8):                         # column drums
        y0 = 70 + k * 47
        lay.grad_poly([(30, y0), (122, y0), (122, y0 + 47), (30, y0 + 47)], shade(GRANITE, 1.18), shade(GRANITE, 0.62),
                      (30, 0), (122, 0), outline=None)
        lay.line([(30, y0 + 1), (122, y0 + 1)], shade(GRANITE, 1.4), 1.2)
        lay.line([(30, y0 + 45), (122, y0 + 45)], shade(GRANITE, 0.45), 1.6)
        for f in (48, 70, 92):
            lay.line([(f, y0 + 4), (f, y0 + 43)], shade(GRANITE, 0.72), 1.0)       # fluting
    c.composite(lay.img, c.mask(body))
    c.grad_poly([(20, 70), (132, 70), (138, 54), (14, 54)], shade(GRANITE, 1.2), shade(GRANITE, 0.7), (0, 54), (0, 70),
                outline=STONE_OUT, ow=1.4)
    snow_cap(c, [(20, 30), (52, 22), (66, 34), (96, 14), (130, 30)], 10, 1011)
    crack(c, 80, 120, 200, 1012, color=(26, 28, 34), width=2.4)
    if cracked:
        for k, (x, y) in enumerate(((50, 200), (100, 260), (70, 330))):
            crack(c, x, y, 120, 1013 + k, color=(20, 20, 26), width=3.2)
        c.d.polygon([c.P(q) for q in ((96, 14), (130, 30), (126, 120), (108, 90))], fill=(0, 0, 0, 0))


def prop_fractured_pillar():
    """Breakable: a fluted column of the old gate. Charges and the tail break it."""
    def make(state):
        c = Canvas(150, 450, 2)
        if state == 'rubble':
            rubble_pile(c, 76, 446, 150, 1015, base=GRANITE)
            c.poly([(10, 446), (20, 410), (130, 404), (140, 446)], GRANITE, outline=STONE_OUT, ow=1.4)
            return c.finish()
        _pillar(c, state == 'cracked')
        return c.finish()
    return (weather(make('intact'), 1016), 446,
            {'cracked': weather(make('cracked'), 1017), 'rubble': weather(make('rubble'), 1018)})


def prop_boulder():
    """Solid, unbreakable cover: a snow-capped granite boulder."""
    c = Canvas(260, 170, 2)
    body = [(10, 166), (18, 90), (50, 44), (110, 24), (186, 34), (236, 80), (250, 166)]
    c.grad_poly(body, (110, 116, 130), (48, 52, 62), (60, 30), (200, 160), outline=STONE_OUT, ow=1.8)
    rs = seeded(1021)
    for _ in range(9):
        x, y = rs.uniform(40, 220), rs.uniform(60, 150)
        c.line([(x, y), (x + rs.uniform(-30, 30), y + rs.uniform(-18, 18))], (40, 44, 54), 1.6)
    c.poly([(60, 140), (120, 90), (200, 110), (230, 166), (70, 166)], (0, 0, 0, 50), outline=None)
    snow_cap(c, [(18, 90), (50, 44), (110, 24), (186, 34), (236, 80)], 16, 1022)
    return weather(c.finish(), 1023), 166


def prop_ice_formation():
    """Breakable ice crystals with the Frostbound Axe frozen inside."""
    def make(state):
        c = Canvas(260, 280, 2)
        if state == 'rubble':
            for k in range(6):
                x = 40 + k * 36
                c.poly([(x - 22, 276), (x - 6, 236 + (k % 2) * 14), (x + 18, 244), (x + 24, 276)], (160, 210, 236),
                       outline=(54, 88, 122, 255), ow=1.2)
            return c.finish()
        crystals = [((40, 276), (60, 120), (86, 276)), ((70, 276), (110, 30), (150, 276)),
                    ((130, 276), (176, 80), (210, 276)), ((180, 276), (226, 150), (244, 276))]
        for k, (a, tip, b) in enumerate(crystals):
            pts = [a, (tip[0] - 18, tip[1] + 40), tip, (tip[0] + 18, tip[1] + 44), b]
            _ice_body(c, pts, 1030 + k)
        # the axe, a dark shape seen through the ice
        g = c.layer()
        g.line([(100, 250), (150, 110)], (40, 60, 80, 170), 5)
        g.poly([(142, 108), (170, 92), (182, 126), (160, 140)], (60, 100, 130, 180), outline=None)
        c.composite(g.img)
        glow = c.layer()
        glow.circle((150, 140), 40, (150, 230, 255, 120), outline=None)
        c.glow(glow.img, 18, 1.0)
        if state == 'cracked':
            for k, (x, y) in enumerate(((100, 80), (150, 150), (200, 190))):
                crack(c, x, y, 80, 1040 + k, color=(40, 70, 100), width=2.8)
        return c.finish()
    return make('intact'), 276, {'cracked': make('cracked'), 'rubble': make('rubble')}


def _scaffold_platform(width, top, height, seed):
    """A battlement slab on timber scaffolding; only the slab is solid."""
    c = Canvas(width, height, 2)
    thick = 40
    for x in (40, width - 40):
        c.poly([(x - 9, height - 4), (x - 9, top + 30), (x + 9, top + 30), (x + 9, height - 4)], (84, 62, 44),
               outline=STONE_OUT, ow=1.4)
        c.line([(x - 3, height - 8), (x - 3, top + 36)], (120, 92, 64), 2)
    for k in range(int((height - top - 60) / 120) + 1):
        y = top + 60 + k * 120
        if y > height - 30:
            break
        c.line([(46, y + 90), (width - 46, y)], (78, 58, 40), 7)
        c.line([(46, y + 90), (width - 46, y)], (110, 82, 58), 2.5)
        c.line([(36, y), (width - 36, y)], (90, 66, 46), 6)
    slab = [(6, top + 6), (40, top), (width * 0.4, top + 3), (width * 0.6, top - 2), (width - 40, top + 2),
            (width - 6, top + 10), (width - 10, top + thick), (width * 0.7, top + thick + 4), (width * 0.45, top + thick),
            (width * 0.2, top + thick + 6), (10, top + thick)]
    c.poly(slab, (104, 108, 122), outline=STONE_OUT, ow=1.8)
    lay = c.layer()
    bevel_blocks(lay, 0, top - 4, width, top + thick + 8, 22, seed, (104, 108, 122))
    c.composite(lay.img, c.mask(slab))
    snow_cap(c, slab[:6], 10, seed + 1)
    icicles(c, 14, width - 14, top + thick, seed + 2, n=12, max_len=30)
    return weather(c.finish(), seed + 3), height - 4, {'slab': [6, top - 2, width - 12, thick + 4]}


def prop_rampart_step():
    return _scaffold_platform(320, 44, 250, 1050)


def prop_rampart_high():
    return _scaffold_platform(340, 50, 446, 1060)


def prop_portcullis():
    """The iron portcullis that drops behind the warrior (animated by the engine)."""
    c = Canvas(300, 640, 2)
    c.poly([(0, 0), (40, 0), (40, 640), (0, 640)], (52, 58, 70), outline=STONE_OUT, ow=1.6)
    c.poly([(260, 0), (300, 0), (300, 640), (260, 640)], (52, 58, 70), outline=STONE_OUT, ow=1.6)
    for x in range(56, 260, 34):
        c.line([(x, 0), (x, 610)], STONE_OUT, 9)
        c.line([(x, 0), (x, 610)], IRON, 6)
        c.line([(x - 1.5, 0), (x - 1.5, 606)], IRON_L, 1.4)
        c.poly([(x - 6, 606), (x + 6, 606), (x, 636)], IRON, outline=STONE_OUT, ow=1.0)
    for y in range(40, 600, 90):
        c.line([(40, y), (260, y)], STONE_OUT, 9)
        c.line([(40, y), (260, y)], IRON, 6)
        c.line([(40, y - 1.5), (260, y - 1.5)], IRON_L, 1.2)
    return weather(c.finish(), 1070, 0.25), 636


def prop_fortress_gate():
    """The sealed far gate: massive masonry, a barred door and torches."""
    c = Canvas(560, 940, 2)
    body = [(20, 936), (20, 120), (60, 80), (120, 100), (180, 40), (300, 60), (380, 20), (470, 70), (540, 110),
            (540, 936)]
    c.poly(body, (56, 62, 76), outline=STONE_OUT, ow=2)
    lay = c.layer()
    bevel_blocks(lay, 0, 10, 560, 940, 34, 1080, (62, 68, 84))
    c.composite(lay.img, c.mask(body))
    door = [(150, 936), (150, 560)] + [(280 + 130 * math.cos(math.radians(180 - a)), 560 - 130 * math.sin(
        math.radians(180 - a))) for a in range(0, 181, 15)] + [(410, 936)]
    c.poly(door, (20, 18, 20), outline=STONE_OUT, ow=2)
    for x in range(170, 400, 30):
        c.line([(x, 470), (x, 936)], IRON, 6)
    for y in range(560, 930, 70):
        c.line([(150, y), (410, y)], IRON, 5)
    for k in range(14):
        a = 180 - k * 180 / 13
        t = math.radians(a)
        p0 = (280 + 130 * math.cos(t), 560 - 130 * math.sin(t))
        p1 = (280 + 172 * math.cos(t), 560 - 172 * math.sin(t))
        c.line([p0, p1], (90, 96, 110), 3)
    wall_torch(c, 110, 560)
    wall_torch(c, 450, 560)
    chain(c, (200, 300), (150, 470), link=22, width=6, broken_end=True)
    chain(c, (360, 300), (400, 480), link=22, width=6, broken_end=True)
    snow_cap(c, body[1:9], 16, 1081)
    icicles(c, 40, 520, 300, 1082, n=24, max_len=40)
    return weather(c.finish(), 1083), 936


def prop_fallen_scout():
    """Decor: a scout of the Watch lying in the snow (his daggers lie nearby)."""
    c = Canvas(260, 90, 2)
    c.poly([(20, 86), (40, 60), (120, 52), (200, 58), (244, 80), (240, 88)], (26, 24, 28), outline=STONE_OUT, ow=1.4)
    c.poly([(70, 62), (150, 50), (190, 64), (110, 74)], (40, 36, 34), outline=STONE_OUT, ow=1.0)
    c.circle((212, 64), 12, (210, 176, 150), ow=1.2)
    c.poly([(200, 56), (226, 52), (230, 62), (214, 60)], (24, 18, 18), outline=None)
    c.poly([(30, 88), (60, 70), (110, 80), (160, 76), (230, 88)], (226, 232, 240), outline=None)   # drifted snow
    return weather(c.finish(), 1090, 0.2), 88


def prop_weapon_rack():
    """Decor: a collapsed weapon cache — a timber rack and a broken chest."""
    c = Canvas(220, 170, 2)
    for x in (30, 190):
        c.poly([(x - 6, 166), (x - 6, 40), (x + 6, 40), (x + 6, 166)], (80, 58, 40), outline=STONE_OUT, ow=1.2)
    c.line([(24, 60), (196, 64)], (96, 70, 48), 7)
    c.line([(24, 110), (196, 104)], (96, 70, 48), 7)
    c.poly([(60, 166), (66, 128), (160, 124), (170, 166)], (70, 50, 34), outline=STONE_OUT, ow=1.4)
    c.line([(66, 136), (162, 132)], (150, 120, 70), 3)
    c.poly([(60, 128), (164, 120), (150, 104), (70, 112)], (84, 60, 40), outline=STONE_OUT, ow=1.2)
    snow_cap(c, [(24, 58), (110, 60), (196, 62)], 8, 1091)
    return weather(c.finish(), 1092, 0.25), 166


def prop_gate_winch():
    """Decor: the broken gate mechanism — a chain drum and a cracked gear."""
    c = Canvas(280, 240, 2)
    for x in (40, 240):
        c.poly([(x - 14, 236), (x - 10, 70), (x + 10, 70), (x + 14, 236)], (60, 66, 80), outline=STONE_OUT, ow=1.4)
    c.ellipse((140, 110), 96, 40, (78, 58, 40), outline=STONE_OUT, ow=1.6)
    for k in range(6):
        c.line([(50 + k * 36, 80), (50 + k * 36, 140)], (50, 36, 26), 3)
    chain(c, (140, 150), (190, 236), link=18, width=5)
    c.circle((236, 168), 46, IRON, ow=1.4)
    for k in range(10):
        a = math.radians(k * 36)
        c.poly([(236 + math.cos(a) * 44, 168 + math.sin(a) * 44), (236 + math.cos(a + 0.2) * 56, 168 + math.sin(a + 0.2) * 56),
                (236 + math.cos(a + 0.4) * 44, 168 + math.sin(a + 0.4) * 44)], IRON, outline=STONE_OUT, ow=1.0)
    c.circle((236, 168), 14, IRON_L, ow=1.0)
    crack(c, 216, 130, 60, 1093, color=(10, 10, 12), width=3)
    snow_cap(c, [(26, 70), (140, 72), (254, 70)], 8, 1094)
    return weather(c.finish(), 1095, 0.25), 236


def prop_collapsed_pillar():
    """Decor: the drums of a fallen column (the War Hammer lies here)."""
    c = Canvas(300, 130, 2)
    for k, (x, y, r) in enumerate(((70, 96, 34), (140, 100, 32), (212, 92, 36))):
        c.ellipse((x, y), r * 0.9, r, shade(GRANITE, 0.9 + 0.05 * k), outline=STONE_OUT, ow=1.4)
        c.ellipse((x - r * 0.3, y), r * 0.5, r * 0.8, shade(GRANITE, 1.15), outline=None)
    rubble_pile(c, 150, 128, 280, 1096, base=GRANITE)
    return weather(c.finish(), 1097), 128


def prop_brazier_post():
    """Decor: a standing iron fire basket (the engine adds live flame)."""
    c = Canvas(120, 260, 2)
    c.poly([(54, 256), (56, 90), (64, 90), (66, 256)], IRON, outline=STONE_OUT, ow=1.2)
    for s in (-1, 1):
        c.line([(60, 256), (60 + s * 40, 256)], IRON, 5)
    torch_glow(c, 60, 50, 40, 110)              # kept inside the canvas; the engine adds the live light
    c.poly([(26, 90), (94, 90), (82, 64), (38, 64)], IRON, outline=STONE_OUT, ow=1.2)
    c.poly([(30, 66), (40, 30), (52, 50), (60, 6), (70, 46), (82, 26), (90, 66)], (255, 128, 30), outline=None)
    c.poly([(44, 66), (54, 40), (62, 54), (70, 36), (78, 66)], (255, 226, 140), outline=None)
    return c.finish(), 256


PROPS_WALLBREAKER = {
    'ice_block': prop_ice_block,
    'fractured_pillar': prop_fractured_pillar,
    'boulder': prop_boulder,
    'ice_formation': prop_ice_formation,
    'rampart_step': prop_rampart_step,
    'rampart_high': prop_rampart_high,
    'portcullis': prop_portcullis,
    'fortress_gate': prop_fortress_gate,
    'fallen_scout': prop_fallen_scout,
    'weapon_rack': prop_weapon_rack,
    'gate_winch': prop_gate_winch,
    'collapsed_pillar': prop_collapsed_pillar,
    'brazier_post': prop_brazier_post,
}
WALLBREAKER_COVER = (('boulder', 700), ('ice_block', 1500), ('fractured_pillar', 2300), ('boulder', 3100))
