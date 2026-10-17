"""Level 7, The Three Calamities: the top of the Frozen Wall in a storm.

The warrior fights on the Wall's icy walkway, seven hundred feet up. Beyond
the parapet the haunted forest and the frozen lakes lie far below under a
storm torn by a faint aurora; timber watchtowers, Stark banners and war
braziers line the parapet. Also the ending panorama: the colossal frozen
fortress built into the Wall, seen from far off.

Same contract as backgrounds.py: full-width layers are W x H and tile
left-to-right; the walkable floor is at FLOOR.
"""
import math

import numpy as np
from PIL import Image

from .backgrounds import (FLOOR, H, STONE_OUT, W, col, crack, downsample, fbm, pine, smoothstep, snow_cap,
                          stark_banner, to_img, vgrad, wrap_x)
from .common import Canvas, seeded, shade
from .wallbreaker import IRON, IRON_L, bevel_blocks, torch_glow, weather

ICE = (146, 178, 202)
ICE_D = (86, 122, 156)
ICE_OUT = (40, 66, 96, 255)
TIMBER = (78, 58, 44)
TIMBER_D = (44, 32, 26)


def _ice_blocks(c, x0, y0, x1, y1, bh, seed, base=ICE):
    bevel_blocks(c, x0, y0, x1, y1, bh, seed, base, light=1.1)


def _shade_rows(img, y0, y1, k0=1.0, k1=0.6):
    """Darken rows y0..y1 progressively (ice in shadow lower down)."""
    arr = np.asarray(img).astype(np.float32)
    yy = np.arange(arr.shape[0], dtype=np.float32)[:, None]
    t = np.clip((yy - y0) / max(1, y1 - y0), 0, 1)
    k = np.where(yy < y0, 1.0, k0 + (k1 - k0) * t)
    arr[..., :3] *= k[..., None]
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), 'RGBA')


def _ice_face(rgb, y0, y1, seed, top=(176, 210, 232), bottom=(52, 84, 120)):
    """Sheer face of the Wall: a cold gradient with long vertical streaks
    and faint layered bands (in place, rows y0..y1 of an rgb array)."""
    h, w = rgb.shape[:2]
    yy = np.arange(h, dtype=np.float32)[:, None]
    t = np.clip((yy - y0) / max(1, y1 - y0), 0, 1)
    face = col(top) * (1 - t[..., None]) + col(bottom) * t[..., None]
    streak = fbm(w, h, 60, 1, seed, 5)
    face = face * (0.86 + 0.24 * streak[..., None])
    bands = 0.5 + 0.5 * np.sin((yy - y0) / 37.0 + 2 * fbm(w, h, 8, 2, seed + 1, 3))
    face = face * (0.95 + 0.05 * bands[..., None])
    m = ((yy >= y0) & (yy < y1)).astype(np.float32)[..., None]
    rgb[:] = rgb * (1 - m) + face * m


# ------------------------------------------------------------ layers -----

def sky_kingswall():
    """A storm over the Wall: heavy cloud decks, lightning-lit pockets and a
    faint green aurora tearing through the gap."""
    base = vgrad([(0, (8, 12, 22)), (240, (20, 30, 48)), (520, (52, 68, 92)), (760, (96, 116, 140)),
                  (1080, (124, 144, 166))])
    rgb = np.repeat(base[:, None, :], W, axis=1)
    yy = np.arange(H, dtype=np.float32)[:, None]
    xx = np.arange(W, dtype=np.float32)[None, :]
    # aurora: two soft ribbons high in the sky
    for k, (yc, amp, colr) in enumerate(((180, 60, (60, 200, 150)), (250, 40, (80, 150, 220)))):
        ribbon = yc + amp * np.sin(xx / W * 2 * np.pi * (3 + k) + k) + 20 * np.sin(xx / W * 2 * np.pi * 11)
        band = np.exp(-((yy - ribbon) / (34 + 10 * k)) ** 2)
        streak = 0.6 + 0.4 * np.sin(xx * 0.05 + k * 3) ** 2
        rgb += (band * streak * 0.55)[..., None] * col(colr)
    n1 = fbm(W, H, 6, 3, 701, 6)
    n2 = fbm(W, H, 14, 5, 702, 5)
    heavy = smoothstep(0.44, 0.66, n1) * smoothstep(700, 60, yy)
    wisps = smoothstep(0.5, 0.72, n2) * smoothstep(760, 260, yy) * 0.7
    lit = np.clip((n1 - np.roll(n1, 10, axis=0)) * 9, -1, 1)
    pockets = np.zeros_like(n1)
    for (px, py, r) in ((620, 330, 260), (2140, 260, 300), (3300, 380, 240)):
        dx = np.minimum(np.abs(xx - px), W - np.abs(xx - px))
        pockets += np.exp(-((dx / r) ** 2 + ((yy - py) / (r * 0.6)) ** 2))
    dark_c, lite_c = col((14, 18, 30)), col((110, 124, 150))
    cloud = dark_c + (lite_c - dark_c) * (0.3 + 0.35 * lit[..., None]) + pockets[..., None] * col((70, 80, 110))
    rgb = rgb * (1 - heavy[..., None] * 0.9) + cloud * heavy[..., None] * 0.9
    rgb = rgb * (1 - wisps[..., None] * 0.4) + col((150, 166, 190)) * wisps[..., None] * 0.4
    return to_img(rgb)


def far_beyond():
    """Far below the parapet: the mountains of the far north, the haunted
    forest and frozen lakes, the drop lost in blowing snow."""
    c = Canvas(W, H, 2)
    rs = seeded(710)
    # distant ranges
    for k, (base, amp, tone) in enumerate(((430, 150, (92, 108, 134)), (480, 110, (70, 86, 110)))):
        pts = []
        for x in range(0, W + 1, 24):
            t = x / W * 2 * math.pi
            y = base - amp * (0.55 + 0.45 * math.sin(t * (5 + k) + k * 2)) * abs(math.sin(t * (13 + 4 * k) + k))
            y -= 30 * math.sin(t * 29 + k)
            pts.append((x, y))
        c.poly(pts + [(W, 640), (0, 640)], tone, outline=None)
        for i in range(1, len(pts) - 1):            # snow on the crests
            x, y = pts[i]
            if y < base - amp * 0.55:
                c.poly([(x - 30, y + 26), (x, y), (x + 30, y + 26), (x + 8, y + 18), (x - 6, y + 24)],
                       (210, 222, 236), outline=None)
    # the snowfield and the frozen lakes
    c.poly([(0, 560), (W, 560), (W, H), (0, H)], (150, 166, 186), outline=None)
    for _ in range(9):
        x, y = rs.uniform(0, W), rs.uniform(590, 660)
        w, h = rs.uniform(160, 420), rs.uniform(12, 26)
        for xx in wrap_x(x, w):
            c.ellipse((xx, y), w / 2, h, (184, 212, 232), outline=None)
            c.line([(xx - w * 0.3, y - h * 0.3), (xx + w * 0.2, y - h * 0.4)], (236, 246, 252), 1.4)
    # the haunted forest: rows of dark pines receding
    for row, (y0, s, tone) in enumerate(((600, 0.5, 0.55), (640, 0.7, 0.45), (690, 1.0, 0.35))):
        n = int(W / (26 * s))
        for i in range(n):
            x = i * 26 * s + rs.uniform(-8, 8)
            h = rs.uniform(40, 80) * s
            yb = y0 + rs.uniform(0, 30) * s
            if rs.random() < 0.18:
                continue
            for xx in wrap_x(x, 20 * s):
                c.poly([(xx - 12 * s, yb), (xx, yb - h), (xx + 12 * s, yb)], shade((28, 40, 46), tone * 2.2),
                       outline=None)
                c.poly([(xx - 5 * s, yb - h * 0.55), (xx, yb - h), (xx + 4 * s, yb - h * 0.6)], (200, 214, 228),
                       outline=None)
    img = downsample(c.img, (W, H))
    # mist rising from the drop
    arr = np.asarray(img).astype(np.float32)
    yy = np.arange(H, dtype=np.float32)[:, None]
    mist = smoothstep(560, 860, yy) * (0.55 + 0.25 * fbm(W, H, 10, 3, 711, 4))
    arr[..., :3] = arr[..., :3] * (1 - mist[..., None]) + col((176, 192, 210)) * mist[..., None]
    arr[..., 3] = np.where(yy < 420, arr[..., 3], np.maximum(arr[..., 3], 255 * smoothstep(560, 640, yy)))
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), 'RGBA')


def _watchtower(c, x, ground, h, seed):
    rs = seeded(seed)
    w = 150
    # legs and cross-bracing
    for s in (-1, 1):
        c.line([(x + s * w * 0.42, ground), (x + s * w * 0.34, ground - h)], TIMBER_D, 12)
        c.line([(x + s * w * 0.42, ground), (x + s * w * 0.34, ground - h)], TIMBER, 8)
    for k in range(3):
        y0, y1 = ground - k * h / 3, ground - (k + 1) * h / 3
        c.line([(x - w * 0.4, y0), (x + w * 0.36, y1)], TIMBER_D, 6)
        c.line([(x + w * 0.4, y0), (x - w * 0.36, y1)], TIMBER_D, 6)
    # the cabin
    top = ground - h
    c.poly([(x - w * 0.5, top), (x + w * 0.5, top), (x + w * 0.5, top - 90), (x - w * 0.5, top - 90)], TIMBER,
           outline=STONE_OUT, ow=1.4)
    for k in range(6):
        yy = top - 8 - k * 14
        c.line([(x - w * 0.5, yy), (x + w * 0.5, yy)], TIMBER_D, 1.4)
    c.poly([(x - 22, top - 30), (x + 22, top - 30), (x + 22, top - 62), (x - 22, top - 62)], (255, 196, 110),
           outline=STONE_OUT, ow=1.0)
    torch_glow(c, x, top - 46, 90, 90)
    c.poly([(x - w * 0.62, top - 88), (x, top - 150), (x + w * 0.62, top - 88)], (58, 44, 36), outline=STONE_OUT,
           ow=1.4)
    snow_cap(c, [(x - w * 0.6, top - 90), (x - 30, top - 125), (x, top - 150), (x + 30, top - 125),
                 (x + w * 0.6, top - 90)], 14, seed + 1)
    if rs.random() < 2:
        c.line([(x + w * 0.5, top - 150), (x + w * 0.5, top - 230)], TIMBER_D, 4)
        stark_banner(c, x + w * 0.5 + 34, top - 226, 60, 90, seed)


def mid_parapet():
    """The north parapet of the Wall top: ice merlons, timber hoardings,
    watchtowers, Stark banners and war braziers."""
    c = Canvas(W, H, 2)
    rs = seeded(720)
    wall_top = 690
    for i, x in enumerate((360, 1640, 2920)):           # towers behind the parapet
        for xx in wrap_x(x, 120):
            _watchtower(c, xx, wall_top + 10, 230 + 30 * (i % 2), 730 + i)
    # the parapet: a thick wall of ice blocks with merlons (period 192 tiles 3840)
    para = [(0, FLOOR), (0, wall_top + 30)]
    for i in range(W // 192):
        x0 = i * 192 + 34
        para += [(x0, wall_top + 30), (x0, wall_top - 56), (x0 + 124, wall_top - 56), (x0 + 124, wall_top + 30)]
    para += [(W, wall_top + 30), (W, FLOOR)]
    c.poly(para, ICE, outline=ICE_OUT, ow=1.8)
    lay = c.layer()
    _ice_blocks(lay, -40, wall_top - 60, W + 40, FLOOR, 34, 721)
    lay.poly([(0, FLOOR - 60), (W, FLOOR - 60), (W, FLOOR), (0, FLOOR)], (10, 20, 40, 70), outline=None)
    c.composite(lay.img, c.mask(para))
    for i in range(W // 192):
        x0 = i * 192 + 34
        snow_cap(c, [(x0 - 3, wall_top - 56), (x0 + 40, wall_top - 58), (x0 + 90, wall_top - 56),
                     (x0 + 127, wall_top - 56)], 14, 740 + i)
        snow_cap(c, [(x0 + 124, wall_top + 30), (x0 + 160, wall_top + 30), (x0 + 192 + 1, wall_top + 30)], 10,
                 780 + i)
        if rs.random() < 0.5:
            crack(c, x0 + rs.uniform(20, 100), wall_top + 40, 80, 800 + i, color=(60, 96, 130), width=2.0)
    # timber hoardings on the walkway side, with icicles
    for i in range(W // 640):
        x0 = i * 640 + 220
        for xx in wrap_x(x0, 240):
            c.poly([(xx, wall_top + 80), (xx + 220, wall_top + 80), (xx + 220, wall_top + 104), (xx, wall_top + 104)],
                   TIMBER, outline=STONE_OUT, ow=1.2)
            for k in range(4):
                c.line([(xx + 20 + k * 60, wall_top + 104), (xx + 20 + k * 60, FLOOR - 4)], TIMBER_D, 8)
            for k in range(11):
                ix = xx + 8 + k * 20
                c.poly([(ix - 4, wall_top + 104), (ix + 4, wall_top + 104), (ix, wall_top + 104 + rs.uniform(16, 44))],
                       (210, 236, 252), outline=ICE_OUT, ow=0.6)
    # banners on the merlons and war braziers
    for i, x in enumerate((1000, 2280, 3560)):
        for xx in wrap_x(x, 60):
            stark_banner(c, xx, wall_top - 40, 70, 120, 750 + i)
    img = downsample(c.img, (W, H))
    img = _shade_rows(img, wall_top - 40, FLOOR, 1.0, 0.62)
    return weather(img, 722, 0.18, cool=0.3)


def fg_walkway():
    """The walkway: packed snow over old ice and planking; the Wall's sheer
    face drops away below its outer edge."""
    c = Canvas(W, H, 2)
    rs = seeded(730)
    c.poly([(0, FLOOR), (W, FLOOR), (W, FLOOR + 26), (0, FLOOR + 26)], (196, 214, 230), outline=ICE_OUT, ow=1.6)
    for i in range(W // 120):                               # planks showing through
        x = i * 120 + rs.uniform(0, 30)
        w = rs.uniform(50, 100)
        for xx in wrap_x(x, w):
            c.poly([(xx, FLOOR + 6), (xx + w, FLOOR + 6), (xx + w - 4, FLOOR + 18), (xx + 4, FLOOR + 18)],
                   (98, 80, 66), outline=None)
    for _ in range(80):                                     # drifted snow
        x = rs.uniform(0, W)
        w = rs.uniform(40, 160)
        for xx in wrap_x(x, w):
            c.poly([(xx - w / 2, FLOOR + 1), (xx - w / 3, FLOOR - 5), (xx + w / 3, FLOOR - 6), (xx + w / 2, FLOOR + 1),
                    (xx + w / 3, FLOOR + 8), (xx - w / 3, FLOOR + 8)], (236, 242, 250), outline=None)
    face = [(0, FLOOR + 26), (W, FLOOR + 26), (W, H), (0, H)]
    c.poly(face, (96, 136, 172), outline=ICE_OUT, ow=1.6)
    lay = c.layer()
    _ice_blocks(lay, -40, FLOOR + 26, W + 40, H, 46, 731, base=(96, 136, 172))
    lay.poly([(0, FLOOR + 26), (W, FLOOR + 26), (W, FLOOR + 50), (0, FLOOR + 50)], (0, 10, 30, 90), outline=None)
    c.composite(lay.img, c.mask(face))
    for _ in range(160):                                    # icicles off the edge
        x = rs.uniform(0, W)
        L = rs.uniform(14, 80)
        w = rs.uniform(4, 11)
        for xx in wrap_x(x, w):
            c.poly([(xx - w, FLOOR + 25), (xx + w, FLOOR + 25), (xx + rs.uniform(-2, 2), FLOOR + 25 + L)],
                   (214, 238, 252), outline=ICE_OUT, ow=0.8)
    return _shade_rows(downsample(c.img, (W, H)), FLOOR + 30, H, 0.9, 0.5)


# ------------------------------------------------------------ props ------

def _ice_body(c, body, seed, base=ICE):
    c.grad_poly(body, shade(base, 1.18), ICE_D, body[1], body[-1], outline=ICE_OUT, ow=1.8)
    rs = seeded(seed)
    for _ in range(8):
        x = rs.uniform(min(p[0] for p in body) + 20, max(p[0] for p in body) - 20)
        y = rs.uniform(min(p[1] for p in body) + 20, max(p[1] for p in body) - 20)
        c.poly([(x - 10, y), (x, y - 26), (x + 8, y + 4)], (226, 244, 255, 140), outline=None)


def prop_ice_pillar():
    """Breakable cover: a tall pillar of the Wall's ice (fire stops on it)."""
    def make(state):
        c = Canvas(170, 430, 2)
        if state == 'rubble':
            for k in range(6):
                x = 20 + k * 26
                c.poly([(x - 18, 426), (x - 6, 390 + (k % 3) * 10), (x + 12, 396), (x + 20, 426)], ICE, outline=ICE_OUT,
                       ow=1.2)
            return c.finish()
        body = [(16, 426), (24, 120), (40, 40), (86, 14), (132, 36), (150, 110), (156, 426)]
        _ice_body(c, body, 761)
        snow_cap(c, [(30, 70), (60, 30), (100, 18), (140, 50)], 12, 762)
        if state == 'cracked':
            for k, (x, y) in enumerate(((60, 120), (110, 200), (70, 300))):
                crack(c, x, y, 110, 763 + k, color=(40, 70, 110), width=2.6)
        return c.finish()
    return make('intact'), 426, {'cracked': make('cracked'), 'rubble': make('rubble')}


def prop_timber_barricade():
    """Temporary cover: a barricade of timber and ice. A charge smashes it."""
    def make(state):
        c = Canvas(260, 200, 2)
        if state == 'rubble':
            for k in range(7):
                x = 24 + k * 32
                c.line([(x - 18, 196), (x + 22, 180 - (k % 3) * 8)], TIMBER_D, 9)
                c.line([(x - 18, 196), (x + 22, 180 - (k % 3) * 8)], TIMBER, 6)
            return c.finish()
        for (x0, y0, x1, y1) in ((20, 196, 210, 46), (50, 46, 240, 196), (10, 130, 250, 126), (16, 80, 244, 86)):
            c.line([(x0, y0), (x1, y1)], TIMBER_D, 16)
            c.line([(x0, y0), (x1, y1)], TIMBER, 11)
            c.line([(x0, y0 - 3), (x1, y1 - 3)], shade(TIMBER, 1.4), 2)
        for x in (40, 130, 220):
            c.poly([(x - 8, 196), (x - 6, 30), (x, 14), (x + 6, 30), (x + 8, 196)], TIMBER, outline=STONE_OUT, ow=1.2)
        snow_cap(c, [(30, 40), (130, 20), (230, 40)], 10, 771)
        if state == 'cracked':
            crack(c, 120, 60, 120, 772, color=(30, 20, 16), width=3)
        return c.finish()
    return make('intact'), 196, {'cracked': make('cracked'), 'rubble': make('rubble')}


def prop_frost_shrine():
    """Decor: the old shrine where Frostbrand rests, a weirwood face carved in
    the ice and an altar of black stone."""
    c = Canvas(300, 360, 2)
    c.grad_poly([(30, 356), (40, 120), (90, 40), (150, 14), (210, 40), (260, 120), (270, 356)], (210, 234, 248),
                ICE_D, (150, 20), (150, 356), outline=ICE_OUT, ow=1.8)
    # weirwood face: pale bark, red sap tears
    c.ellipse((150, 140), 44, 58, (232, 226, 214), outline=STONE_OUT, ow=1.4)
    for (x, y) in ((132, 128), (168, 128)):
        c.ellipse((x, y), 9, 6, (60, 20, 20), outline=None)
        c.line([(x, y + 6), (x - 2, y + 40)], (170, 30, 30), 3)
    c.line([(134, 170), (150, 176), (166, 170)], (90, 40, 34), 3)
    # altar
    c.poly([(70, 356), (80, 270), (220, 270), (230, 356)], (40, 42, 52), outline=STONE_OUT, ow=1.6)
    c.poly([(60, 270), (240, 270), (232, 252), (68, 252)], (66, 70, 84), outline=STONE_OUT, ow=1.4)
    g = c.layer()
    g.circle((150, 240), 60, (130, 210, 255, 150), outline=None)
    c.glow(g.img, 30, 1.0)
    snow_cap(c, [(60, 40), (150, 14), (240, 40)], 12, 781)
    return weather(c.finish(), 782, 0.2, cool=0.3), 356


def prop_launcher_cradle():
    """Decor: the iron cradle in which Frostpiercer lay frozen for an age."""
    c = Canvas(340, 170, 2)
    c.poly([(20, 166), (40, 120), (300, 120), (320, 166)], (52, 56, 66), outline=STONE_OUT, ow=1.6)
    for x in (60, 170, 280):
        c.poly([(x - 14, 122), (x - 20, 70), (x - 8, 62), (x + 8, 62), (x + 20, 70), (x + 14, 122)], IRON,
               outline=STONE_OUT, ow=1.2)
        c.line([(x - 12, 70), (x + 12, 70)], IRON_L, 1.4)
    _ice_body(c, [(30, 122), (60, 88), (160, 76), (300, 86), (316, 122)], 791, base=(190, 222, 240))
    snow_cap(c, [(40, 100), (160, 76), (300, 88)], 10, 792)
    return weather(c.finish(), 793, 0.2, cool=0.3), 166


def prop_war_brazier():
    c = Canvas(160, 230, 2)
    for s in (-1, 1):
        c.line([(80 + s * 10, 226), (80 + s * 38, 120)], STONE_OUT, 9)
        c.line([(80 + s * 10, 226), (80 + s * 38, 120)], IRON, 6)
    c.poly([(30, 120), (130, 120), (116, 92), (44, 92)], IRON, outline=STONE_OUT, ow=1.4)
    c.line([(32, 118), (128, 118)], IRON_L, 1.6)
    return weather(c.finish(), 801, 0.2), 226


def prop_stark_standard():
    c = Canvas(160, 420, 2)
    c.line([(40, 416), (40, 20)], STONE_OUT, 10)
    c.line([(40, 416), (40, 20)], TIMBER, 7)
    stark_banner(c, 92, 34, 96, 180, 811)
    c.poly([(30, 416), (52, 416), (48, 380), (34, 380)], (220, 232, 244), outline=ICE_OUT, ow=1.0)
    return weather(c.finish(), 812, 0.15), 416


def prop_ice_gate():
    """The arena gate: an iron portcullis rimed with ice (animated by the engine)."""
    c = Canvas(300, 640, 2)
    for x0 in (0, 260):
        c.poly([(x0, 0), (x0 + 40, 0), (x0 + 40, 640), (x0, 640)], ICE_D, outline=ICE_OUT, ow=1.6)
    for x in range(56, 260, 34):
        c.line([(x, 0), (x, 610)], STONE_OUT, 9)
        c.line([(x, 0), (x, 610)], IRON, 6)
        c.line([(x - 1.5, 0), (x - 1.5, 606)], (200, 228, 246), 1.6)
        c.poly([(x - 6, 606), (x + 6, 606), (x, 636)], (210, 236, 252), outline=ICE_OUT, ow=1.0)
    for y in range(40, 600, 90):
        c.line([(40, y), (260, y)], STONE_OUT, 9)
        c.line([(40, y), (260, y)], IRON, 6)
        c.line([(40, y - 1.5), (260, y - 1.5)], (200, 228, 246), 1.4)
        for x in range(50, 260, 22):
            c.poly([(x - 3, y + 4), (x + 3, y + 4), (x, y + 18)], (220, 240, 252), outline=None)
    return weather(c.finish(), 821, 0.2, cool=0.3), 636


PROPS_KINGSWALL = {
    'ice_pillar': prop_ice_pillar,
    'timber_barricade': prop_timber_barricade,
    'frost_shrine': prop_frost_shrine,
    'launcher_cradle': prop_launcher_cradle,
    'war_brazier': prop_war_brazier,
    'stark_standard': prop_stark_standard,
    'ice_gate': prop_ice_gate,
}
KINGSWALL_COVER = (('ice_pillar', 900), ('timber_barricade', 2100), ('ice_pillar', 3200))


# ------------------------------------------------------------ ending -----

PANORAMA = (3840, 2160)
# where the warrior stands on the panorama (on the gate tower's parapet), in panorama px
PANORAMA_SPOT = (1920, 838)


def ending_panorama():
    """The colossal frozen fortress built into the Wall, seen from far off
    under the clearing storm; a snowfield below where the slain lie."""
    w, h = PANORAMA
    base = vgrad([(0, (6, 10, 20)), (500, (18, 28, 48)), (1000, (54, 72, 100)), (1400, (110, 130, 156)),
                  (2160, (170, 186, 204))], h=h)
    rgb = np.repeat(base[:, None, :], w, axis=1)
    yy = np.arange(h, dtype=np.float32)[:, None]
    xx = np.arange(w, dtype=np.float32)[None, :]
    for k, (yc, amp, colr) in enumerate(((300, 90, (60, 210, 160)), (420, 60, (90, 160, 230)))):
        ribbon = yc + amp * np.sin(xx / w * 2 * np.pi * (2 + k) + 1 + k) + 30 * np.sin(xx / w * 2 * np.pi * 9)
        band = np.exp(-((yy - ribbon) / (60 + 20 * k)) ** 2)
        rgb += (band * 0.6)[..., None] * col(colr)
    n = fbm(w, h, 7, 4, 901, 6)
    cloud = smoothstep(0.5, 0.7, n) * smoothstep(1100, 200, yy)
    rgb = rgb * (1 - cloud[..., None] * 0.8) + col((24, 30, 44)) * cloud[..., None] * 0.8
    wall_top = 1060
    _ice_face(rgb, wall_top, 1720, 902)
    sky = to_img(rgb).convert('RGBA')
    c = Canvas(w, h, 1)
    c.line([(0, wall_top + 2), (w, wall_top + 2)], (230, 244, 252), 6)        # snow along the Wall's crest
    rs = seeded(903)
    for _ in range(40):
        crack(c, rs.uniform(0, w), rs.uniform(wall_top + 40, 1500), 200, int(rs.uniform(0, 1e6)),
              color=(70, 110, 150), width=3)
    # the fortress: a great keep of ice and black stone rising from the Wall
    cx = PANORAMA_SPOT[0]
    # the great keep behind the gate: a vast tower of black stone and ice with a needle roof
    kx0, kx1, ktop = cx - 300, cx + 300, wall_top - 640
    c.poly([(kx0, wall_top), (kx0, ktop), (kx1, ktop), (kx1, wall_top)], (70, 92, 120), outline=ICE_OUT, ow=2.2)
    kl = c.layer()
    _ice_blocks(kl, kx0, ktop, kx1, wall_top, 46, 905, base=(76, 100, 130))
    c.composite(kl.img, c.mask([(kx0, wall_top), (kx0, ktop), (kx1, ktop), (kx1, wall_top)]))
    for k in range(int((kx1 - kx0) // 50)):
        mx = kx0 + k * 50 + 8
        c.poly([(mx, ktop), (mx, ktop - 34), (mx + 30, ktop - 34), (mx + 30, ktop)], (90, 116, 146), outline=ICE_OUT,
               ow=1.6)
    c.poly([(kx0 + 60, ktop - 34), (cx, ktop - 380), (kx1 - 60, ktop - 34)], (40, 50, 68), outline=ICE_OUT, ow=2.4)
    snow_cap(c, [(kx0 + 70, ktop - 40), (cx, ktop - 374), (kx1 - 70, ktop - 40)], 22, 906)
    for (wx, wy) in ((cx - 150, ktop + 140), (cx, ktop + 100), (cx + 150, ktop + 140), (cx - 150, ktop + 330),
                     (cx + 150, ktop + 330), (cx, ktop + 290)):
        c.poly([(wx - 16, wy), (wx + 16, wy), (wx + 16, wy + 64), (wx - 16, wy + 64)], (255, 196, 120),
               outline=ICE_OUT, ow=1.0)
        torch_glow(c, wx, wy + 32, 90, 80)
    for (dx, tw, th, roof) in ((-1080, 160, 520, True), (-760, 220, 700, True), (-470, 180, 600, False),
                               (470, 180, 600, False), (760, 220, 700, True), (1080, 160, 520, True)):
        x0 = cx + dx - tw / 2
        top = wall_top - th
        c.poly([(x0, wall_top + 10), (x0, top), (x0 + tw, top), (x0 + tw, wall_top + 10)], (120, 164, 200),
               outline=ICE_OUT, ow=2.0)
        tl = c.layer()
        _ice_blocks(tl, x0, top, x0 + tw, wall_top + 10, 40, int(abs(dx)) + 910, base=(120, 164, 200))
        c.composite(tl.img, c.mask([(x0, wall_top + 10), (x0, top), (x0 + tw, top), (x0 + tw, wall_top + 10)]))
        for k in range(int(tw // 40)):
            mx = x0 + k * 40 + 6
            c.poly([(mx, top), (mx, top - 26), (mx + 24, top - 26), (mx + 24, top)], (140, 182, 214),
                   outline=ICE_OUT, ow=1.4)
        if roof:
            c.poly([(x0 - 14, top - 26), (x0 + tw / 2, top - 200), (x0 + tw + 14, top - 26)], (60, 74, 96),
                   outline=ICE_OUT, ow=2.0)
            snow_cap(c, [(x0 - 10, top - 30), (x0 + tw / 2, top - 196), (x0 + tw + 10, top - 30)], 18,
                     int(abs(dx)) + 920)
        for k in range(3):
            wy = top + 80 + k * 110
            if wy < wall_top - 40:
                c.poly([(x0 + tw / 2 - 12, wy), (x0 + tw / 2 + 12, wy), (x0 + tw / 2 + 12, wy + 46),
                        (x0 + tw / 2 - 12, wy + 46)], (255, 196, 120), outline=ICE_OUT, ow=1.0)
                torch_glow(c, x0 + tw / 2, wy + 23, 70, 70)
    # curtain walls between the towers and the great gate tower in the middle
    curtain = [(cx - 1180, wall_top + 10), (cx - 1180, wall_top - 220), (cx + 1180, wall_top - 220),
               (cx + 1180, wall_top + 10)]
    c.poly(curtain, (110, 150, 184), outline=ICE_OUT, ow=2.0)
    cl = c.layer()
    _ice_blocks(cl, cx - 1180, wall_top - 220, cx + 1180, wall_top + 10, 36, 907, base=(110, 150, 184))
    c.composite(cl.img, c.mask(curtain))
    for k in range(int(2360 // 48)):
        mx = cx - 1180 + k * 48 + 6
        if abs(mx + 14 - cx) < 240:
            continue
        c.poly([(mx, wall_top - 220), (mx, wall_top - 248), (mx + 28, wall_top - 248), (mx + 28, wall_top - 220)],
               (126, 166, 200), outline=ICE_OUT, ow=1.4)
    snow_cap(c, [(cx - 1180, wall_top - 222), (cx - 240, wall_top - 222)], 10, 908)
    snow_cap(c, [(cx + 240, wall_top - 222), (cx + 1180, wall_top - 222)], 10, 909)
    gate_top = PANORAMA_SPOT[1] + 6 - 0
    c.poly([(cx - 220, wall_top + 10), (cx - 220, gate_top), (cx + 220, gate_top), (cx + 220, wall_top + 10)],
           (98, 140, 178), outline=ICE_OUT, ow=2.0)
    gl = c.layer()
    _ice_blocks(gl, cx - 220, gate_top, cx + 220, wall_top + 10, 40, 930, base=(98, 140, 178))
    c.composite(gl.img, c.mask([(cx - 220, wall_top + 10), (cx - 220, gate_top), (cx + 220, gate_top),
                               (cx + 220, wall_top + 10)]))
    for k in range(11):
        mx = cx - 220 + k * 40 + 4
        c.poly([(mx, gate_top), (mx, gate_top - 24), (mx + 22, gate_top - 24), (mx + 22, gate_top)], (130, 172, 206),
               outline=ICE_OUT, ow=1.4)
    c.poly([(cx - 90, wall_top + 10), (cx - 90, wall_top - 120), (cx, wall_top - 190), (cx + 90, wall_top - 120),
            (cx + 90, wall_top + 10)], (20, 22, 30), outline=ICE_OUT, ow=2.0)              # the great gate
    for x in range(int(cx - 80), int(cx + 81), 26):
        c.line([(x, wall_top - 150 + abs(x - cx) * 0.5), (x, wall_top + 6)], IRON, 5)
    for s in (-1, 1):
        stark_banner(c, cx + s * 140, gate_top + 20, 90, 170, 940 + s)
    # snowfield below the Wall
    c.poly([(0, 1700), (w, 1680), (w, h), (0, h)], (196, 210, 226), outline=None)
    for _ in range(60):
        x, y = rs.uniform(0, w), rs.uniform(1720, 2140)
        c.ellipse((x, y), rs.uniform(60, 240), rs.uniform(6, 16), (220, 230, 242), outline=None)
    img = c.finish()
    sky.alpha_composite(img)
    arr = np.asarray(sky).astype(np.float32)
    mist = np.exp(-((yy - 1700) / 90) ** 2) * (0.6 + 0.3 * fbm(w, h, 12, 2, 960, 3))
    arr[..., :3] = arr[..., :3] * (1 - mist[..., None]) + col((210, 222, 236)) * mist[..., None]
    sky = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), 'RGBA')
    return weather(sky, 950, 0.12, cool=0.35)
