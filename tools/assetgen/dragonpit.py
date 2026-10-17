"""Level 6, The Dragonpit: the ruined dragon arena on its hill above King's
Landing. A hazy gold dusk, the city and the Red Keep below, the pit's ring
of arches and the broken ribs of its fallen dome, a floor of sand, ash and
old bones, giant iron collars still chained to the ground.

Same contract as backgrounds.py: full-width layers are W x H and tile
left-to-right; the walkable floor is at FLOOR.
"""
import math

import numpy as np
from PIL import Image

from .backgrounds import (FLOOR, H, STONE_OUT, W, col, crack, downsample, fbm, rubble_pile, smoothstep, to_img,
                          vgrad, wrap_x)
from .common import Canvas, seeded, shade
from .wallbreaker import (IRON, IRON_L, bevel_blocks, chain, prop_brazier_post, prop_fractured_pillar,
                          prop_portcullis, torch_glow, weather)

SAND = (150, 128, 104)
SAND_D = (104, 86, 70)
PIT = (126, 106, 88)


def warm(img, k=0.35, tone=(150, 90, 50)):
    arr = np.asarray(img).astype(np.float32)
    arr[..., :3] = arr[..., :3] * (1 - k) + col(tone) * k
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), 'RGBA')


# ------------------------------------------------------------ layers -----

def sky_pit():
    """A hazy gold dusk over the city, smoke drifting across a low sun."""
    base = vgrad([(0, (30, 20, 34)), (260, (78, 44, 46)), (560, (170, 96, 58)), (820, (232, 160, 90)),
                  (1080, (240, 186, 120))])
    rgb = np.repeat(base[:, None, :], W, axis=1)
    yy = np.arange(H, dtype=np.float32)[:, None]
    xx = np.arange(W, dtype=np.float32)[None, :]
    sx, sy = 2650, 690
    dx = np.minimum(np.abs(xx - sx), W - np.abs(xx - sx))
    d = np.sqrt(dx ** 2 + (yy - sy) ** 2)
    rgb += np.exp(-(d / 520) ** 2)[..., None] * col((120, 70, 20))
    rgb = rgb * (1 - smoothstep(70, 62, d)[..., None]) + col((255, 236, 190)) * smoothstep(70, 62, d)[..., None]
    n = fbm(W, H, 7, 3, 1201, 6)
    cloud = smoothstep(0.48, 0.7, n) * smoothstep(800, 120, yy)
    lit = np.clip((n - np.roll(n, 9, axis=0)) * 8, -1, 1)
    lit[:12] = 0
    ccol = col((70, 40, 44)) + col((200, 120, 60)) * np.clip(0.3 + 0.6 * lit, 0, 1)[..., None]
    rgb = rgb * (1 - cloud[..., None] * 0.75) + ccol * cloud[..., None] * 0.75
    smoke = fbm(W, H, 18, 4, 1203, 4) * smoothstep(1000, 500, yy)
    rgb = rgb * (1 - smoke[..., None] * 0.25) + col((90, 70, 70)) * smoke[..., None] * 0.25
    return to_img(rgb)


def city_far():
    """King's Landing below the hill: roofs, towers, the Red Keep, the sept dome."""
    c = Canvas(W, H, 2)
    rs = seeded(1210)
    # the hills the city climbs
    hill = [(x, 760 + 40 * math.sin(x / W * 2 * math.pi * 2 + 0.6) + 20 * math.sin(x / W * 2 * math.pi * 7))
            for x in range(0, W + 1, 20)] + [(W, H), (0, H)]
    c.poly(hill, (96, 70, 66), outline=None)
    # houses
    for _ in range(420):
        x = rs.uniform(0, W)
        base = 770 + 40 * math.sin(x / W * 2 * math.pi * 2 + 0.6) + rs.uniform(0, 160)
        w, h = rs.uniform(18, 46), rs.uniform(16, 40)
        tone = rs.uniform(0.8, 1.15)
        for xx in wrap_x(x, w):
            c.poly([(xx, base), (xx, base - h), (xx + w, base - h), (xx + w, base)], shade((120, 92, 84), tone),
                   outline=None)
            c.poly([(xx - 3, base - h), (xx + w / 2, base - h - w * 0.5), (xx + w + 3, base - h)],
                   shade((140, 70, 56), tone), outline=None)
            if rs.random() < 0.18:
                c.poly([(xx + w * 0.4, base - h * 0.6), (xx + w * 0.6, base - h * 0.6), (xx + w * 0.6, base - h * 0.35),
                        (xx + w * 0.4, base - h * 0.35)], (255, 200, 120), outline=None)
    # the Red Keep on its hill
    for xx in wrap_x(1250, 520):
        c.poly([(xx - 300, 760), (xx - 200, 640), (xx + 220, 630), (xx + 320, 760)], (110, 70, 64), outline=None)
        for k, (tx, tw, th) in enumerate(((-180, 70, 230), (-60, 90, 300), (70, 80, 260), (190, 60, 200), (0, 140, 160))):
            x0 = xx + tx - tw / 2
            c.poly([(x0, 650), (x0, 650 - th), (x0 + tw, 650 - th), (x0 + tw, 650)], (150, 70, 58), outline=None)
            for m in range(int(tw / 14)):
                c.poly([(x0 + m * 14, 650 - th), (x0 + m * 14 + 8, 650 - th), (x0 + m * 14 + 8, 650 - th - 10),
                        (x0 + m * 14, 650 - th - 10)], (150, 70, 58), outline=None)
            c.poly([(x0 + tw / 2 - 4, 650 - th + 30), (x0 + tw / 2 + 4, 650 - th + 30), (x0 + tw / 2 + 4, 650 - th + 50),
                    (x0 + tw / 2 - 4, 650 - th + 50)], (255, 196, 110), outline=None)
    # the great sept: seven towers around a dome
    for xx in wrap_x(2950, 300):
        c.poly([(xx - 150, 760), (xx - 150, 640), (xx + 150, 640), (xx + 150, 760)], (170, 150, 140), outline=None)
        c.d.pieslice([c.P((xx - 120, 520)), c.P((xx + 120, 760))], 180, 360, fill=(190, 172, 160))
        for k in range(-3, 4):
            c.poly([(xx + k * 40 - 6, 640), (xx + k * 40 - 6, 560), (xx + k * 40, 530), (xx + k * 40 + 6, 560),
                    (xx + k * 40 + 6, 640)], (176, 158, 148), outline=None)
    c.poly([(0, 940), (W, 940), (W, H), (0, H)], (210, 150, 96), outline=None)       # the bay catching the sun
    img = downsample(c.img, (W, H))
    arr = np.asarray(img).astype(np.float32)
    yy = np.arange(H, dtype=np.float32)[:, None]
    haze = np.clip(0.55 + 0.25 * smoothstep(1000, 500, yy), 0, 1)[..., None]
    arr[..., :3] = arr[..., :3] * (1 - haze * 0.6) + col((220, 150, 100)) * haze * 0.6
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), 'RGBA')


def _arch_row(c, y_top, y_bot, step, w, seed, tone=1.0):
    """A wall pierced by a row of round arches (the pit's ring)."""
    rs = seeded(seed)
    base = shade(PIT, tone)
    body = [(-40, y_bot), (-40, y_top), (W + 40, y_top), (W + 40, y_bot)]
    c.poly(body, base, outline=STONE_OUT, ow=1.6)
    lay = c.layer()
    bevel_blocks(lay, -40, y_top, W + 40, y_bot, 26, seed, base)
    c.composite(lay.img, c.mask(body))
    x = step / 2
    while x < W + step:
        top = y_top + 40
        bot = y_bot - 10
        arch = [(x - w / 2, bot), (x - w / 2, top + w / 2)]
        for k in range(13):
            a = math.pi - math.pi * k / 12
            arch.append((x + math.cos(a) * w / 2, top + w / 2 - math.sin(a) * w / 2))
        arch += [(x + w / 2, top + w / 2), (x + w / 2, bot)]
        c.poly(arch, (40, 26, 26), outline=STONE_OUT, ow=1.4)
        # light through the far side of the pit, seen through each arch
        c.poly(arch[3:-3] + [(x + w / 2 - 6, bot), (x - w / 2 + 6, bot)], (200, 140, 90, 120), outline=None)
        if rs.random() < 0.3:      # a broken arch
            c.poly([(x - w / 2 - 6, top + 10), (x - w / 6, top - 14), (x, top + 20)], base, outline=STONE_OUT, ow=1.0)
        x += step


def pit_mid():
    """The ring of the pit: two tiers of arches, the seating below, and the
    broken ribs of the fallen dome arching overhead."""
    c = Canvas(W, H, 2)
    _arch_row(c, 330, 560, 190, 110, 1220, 0.95)
    _arch_row(c, 560, 800, 240, 150, 1221, 1.05)
    # stepped seating tiers
    for k in range(5):
        y = 800 + k * 22
        c.poly([(-20, y), (W + 20, y), (W + 20, y + 22), (-20, y + 22)], shade(PIT, 0.85 + 0.06 * k),
               outline=STONE_OUT, ow=1.0)
        c.line([(-20, y + 2), (W + 20, y + 2)], shade(PIT, 1.3), 1.2)
    # the dome's ribs: great stone arcs, most of them broken off
    rs = seeded(1225)
    for i in range(7):
        x0 = i * W / 7 + rs.uniform(-60, 60)
        span = rs.uniform(700, 1000)
        broken = rs.uniform(0.35, 0.8)
        pts = []
        for k in range(30):
            t = k / 29 * broken
            a = math.pi - math.pi * t
            pts.append((x0 + span / 2 + math.cos(a) * span / 2, 340 - math.sin(a) * 300))
        for dx in (0, -W, W):
            q = [(p[0] + dx, p[1]) for p in pts]
            c.line(q, STONE_OUT, 26)
            c.line(q, shade(PIT, 0.9), 20)
            c.line([(p[0], p[1] - 6) for p in q], shade(PIT, 1.3), 4)
            e = q[-1]
            rubble_pile(c, e[0], e[1] + 18, 60, 1226 + i, base=PIT, snow=False)
    # light shafts through the broken dome
    g = c.layer()
    for k in range(5):
        x = 300 + k * 760
        g.poly([(x - 40, 0), (x + 90, 0), (x + 320, 900), (x + 120, 900)], (255, 210, 150, 34), outline=None)
    c.composite(g.img)
    img = downsample(c.img, (W, H))
    img = weather(img, 1227, 0.32)
    arr = np.asarray(img).astype(np.float32)
    yy = np.arange(H, dtype=np.float32)[:, None]
    haze = smoothstep(650, 960, yy)[..., None] * 0.35
    arr[..., :3] = arr[..., :3] * (1 - haze) + col((200, 150, 110)) * haze
    arr[..., :3] = arr[..., :3] * 0.85 + col((150, 80, 40)) * 0.15
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), 'RGBA')


def pit_fg():
    """Sand, ash and scorch marks over old flagstones; the front edge of the floor."""
    c = Canvas(W, H, 2)
    rs = seeded(1240)
    face = [(0, FLOOR + 30), (W, FLOOR + 30), (W, H), (0, H)]
    c.poly(face, SAND_D, outline=STONE_OUT, ow=1.6)
    lay = c.layer()
    bevel_blocks(lay, -20, FLOOR + 30, W + 20, H, 40, 1241, (112, 92, 76), light=0.9)
    c.composite(lay.img, c.mask(face))
    top = [(0, FLOOR - 2), (W, FLOOR - 2), (W, FLOOR + 32), (0, FLOOR + 32)]
    c.grad_poly(top, (186, 160, 128), (130, 108, 88), (0, FLOOR), (0, FLOOR + 32), outline=STONE_OUT, ow=1.4)
    for _ in range(60):                       # scorch marks and ash
        x = rs.uniform(0, W)
        w = rs.uniform(40, 180)
        for xx in wrap_x(x, w):
            c.ellipse((xx, FLOOR + 14), w / 2, 7, (70, 56, 48) if rs.random() < 0.5 else (110, 92, 78), outline=None)
    for _ in range(30):
        crack(c, rs.uniform(0, W - 120), FLOOR + 6, rs.uniform(40, 110), int(rs.random() * 1e6), color=(70, 56, 46),
              width=1.4, down=False)
    for _ in range(26):                       # small bones in the sand
        x = rs.uniform(0, W)
        for xx in wrap_x(x, 30):
            c.line([(xx - 14, FLOOR + 10 + rs.uniform(0, 14)), (xx + 14, FLOOR + 6 + rs.uniform(0, 14))],
                   (226, 214, 190), 2.4)
    img = downsample(c.img, (W, H))
    return weather(img, 1242, 0.34)


# ------------------------------------------------------------ props ------

def prop_pit_tier():
    """A collapsed section of seating held up on two stone legs; you land on
    its top slab from above (the space beneath is open)."""
    w, top, thick, height = 330, 52, 42, 262
    c = Canvas(w, height, 2)
    for x in (54, w - 54):
        leg = [(x - 16, height - 4), (x - 12, top + 34), (x + 12, top + 34), (x + 16, height - 4)]
        c.poly(leg, PIT, outline=STONE_OUT, ow=1.4)
        lay = c.layer()
        bevel_blocks(lay, x - 18, top + 30, x + 18, height, 24, 1250 + x, PIT)
        c.composite(lay.img, c.mask(leg))
    slab = [(6, top + 6), (40, top), (w * 0.4, top + 4), (w * 0.62, top - 2), (w - 34, top + 2), (w - 6, top + 10),
            (w - 10, top + thick), (w * 0.6, top + thick + 4), (w * 0.3, top + thick), (10, top + thick)]
    c.poly(slab, shade(PIT, 1.1), outline=STONE_OUT, ow=1.8)
    lay = c.layer()
    bevel_blocks(lay, 0, top - 4, w, top + thick + 8, 21, 1252, shade(PIT, 1.1))
    c.composite(lay.img, c.mask(slab))
    c.line([(12, top + 4), (w - 12, top + 4)], (200, 176, 146), 2)
    return weather(c.finish(), 1253), height - 4, {'slab': [6, top - 2, w - 12, thick + 4]}


def prop_fallen_column():
    img, gy, states = prop_fractured_pillar()
    return warm(img, 0.5), gy, {k: warm(v, 0.5) for k, v in states.items()}


def prop_rubble_heap():
    """Low cover: a heap of fallen dome stone (jump it, hide behind it)."""
    c = Canvas(260, 140, 2)
    rubble_pile(c, 130, 136, 250, 1260, base=PIT, snow=False)
    rubble_pile(c, 110, 136, 160, 1261, base=shade(PIT, 1.15), snow=False)
    c.poly([(30, 136), (60, 80), (140, 56), (210, 82), (236, 136)], shade(PIT, 0.9), outline=STONE_OUT, ow=1.6)
    lay = c.layer()
    bevel_blocks(lay, 20, 50, 240, 140, 22, 1262, PIT)
    c.composite(lay.img, c.mask([(30, 136), (60, 80), (140, 56), (210, 82), (236, 136)]))
    return weather(c.finish(), 1263), 136


def prop_iron_collar():
    """Decor: a giant iron collar, its chain staked into the floor of the pit."""
    c = Canvas(320, 150, 2)
    c.poly([(150, 146), (156, 96), (168, 96), (174, 146)], IRON, outline=STONE_OUT, ow=1.2)    # the stake
    chain(c, (162, 100), (60, 120), link=20, width=6)
    c.ellipse((240, 104), 64, 40, IRON, outline=STONE_OUT, ow=1.6)
    c.ellipse((240, 104), 46, 26, (0, 0, 0, 0), outline=None)
    c.d.ellipse([c.P((194, 78)), c.P((286, 130))], fill=(0, 0, 0, 0))
    c.line([(188, 92), (292, 92)], IRON_L, 2)
    for k in range(6):
        a = math.pi + k * math.pi / 5
        c.circle((240 + math.cos(a) * 56, 104 + math.sin(a) * 34), 4, IRON_L, ow=0.8)
    return weather(c.finish(), 1270, 0.25), 146


def prop_bone_pile():
    """Decor: old bones and a great horned dragon skull half buried in sand."""
    c = Canvas(380, 170, 2)
    rs = seeded(1280)
    for _ in range(14):
        x = rs.uniform(30, 350)
        y = rs.uniform(130, 166)
        a = rs.uniform(-0.6, 0.6)
        L = rs.uniform(30, 70)
        c.line([(x, y), (x + math.cos(a) * L, y + math.sin(a) * L * 0.4)], (220, 206, 178), 5)
        c.circle((x, y), 5, (226, 212, 186), ow=0.8)
    skull = [(120, 166), (130, 110), (180, 80), (260, 76), (330, 100), (350, 130), (300, 150), (230, 166)]
    c.grad_poly(skull, (234, 222, 196), (170, 150, 120), (200, 80), (200, 166), outline=STONE_OUT, ow=1.6)
    c.ellipse((230, 114), 22, 14, (40, 30, 28), outline=None)                  # eye socket
    c.poly([(300, 150), (350, 130), (360, 150), (330, 160)], (60, 48, 40), outline=STONE_OUT, ow=1.0)   # jaw gap
    for k in range(5):
        c.poly([(296 + k * 10, 150), (300 + k * 10, 164), (304 + k * 10, 150)], (240, 232, 210), ow=0.6)
    c.poly([(180, 82), (120, 30), (110, 40), (160, 96)], (226, 212, 186), outline=STONE_OUT, ow=1.2)   # horn
    c.poly([(30, 168), (120, 150), (240, 162), (370, 168)], (176, 152, 120), outline=None)          # drifted sand
    return weather(c.finish(), 1281, 0.25), 168


def prop_brazier_tall():
    img, gy = prop_brazier_post()
    return img, gy


def prop_pit_gate():
    return prop_portcullis()


PROPS_DRAGONPIT = {
    'pit_tier': prop_pit_tier,
    'fallen_column': prop_fallen_column,
    'rubble_heap': prop_rubble_heap,
    'iron_collar': prop_iron_collar,
    'bone_pile': prop_bone_pile,
    'brazier_tall': prop_brazier_tall,
    'pit_gate': prop_pit_gate,
}
DRAGONPIT_COVER = (('rubble_heap', 900), ('bone_pile', 2000), ('rubble_heap', 3100))
