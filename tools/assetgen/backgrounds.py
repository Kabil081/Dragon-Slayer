"""Frozen Wall level: stormy sky, distant mountains, the great ice wall,
midground ruins, foreground battlements and cover props.

Every full-width layer is 3840 x 1080 and tiles seamlessly left-to-right,
so it can loop in a parallax scroller. The walkable floor of the
foreground battlements is at y = FLOOR.
"""
import math

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

from .common import Canvas, downsample, mix, rgba, seeded, shade

W, H = 3840, 1080
FLOOR = 900
STONE_OUT = (16, 18, 24, 255)


# ------------------------------------------------------------ noise ------

def tile_noise(w, h, cx, cy, seed):
    rng = np.random.default_rng(seed)
    g = rng.random((cy + 4, cx)).astype(np.float32)
    g = np.concatenate([g[:, -2:], g, g[:, :3]], axis=1)
    sx, sy = w / cx, h / cy
    big = Image.fromarray(g, 'F').resize(
        (int(round(g.shape[1] * sx)), int(round(g.shape[0] * sy))), Image.BICUBIC)
    a = np.asarray(big)
    x0, y0 = int(round(2 * sx)), int(round(sy))
    return a[y0:y0 + h, x0:x0 + w]


def fbm(w, h, cx, cy, seed, octaves=5, gain=0.5):
    out, amp, tot = np.zeros((h, w), np.float32), 1.0, 0.0
    for o in range(octaves):
        out += amp * tile_noise(w, h, cx * 2 ** o, cy * 2 ** o, seed + o * 17)
        tot += amp
        amp *= gain
    return out / tot


def ridge_line(w, seed, base, amp, kmax=160, beta=1.05, sharp=0.6):
    """Periodic mountain crest line. `sharp` blends in a ridged term so
    peaks come to points instead of rolling hills."""
    rng = np.random.default_rng(seed)
    x = np.arange(w) / w * 2 * np.pi
    smooth = np.zeros(w)
    ridged = np.zeros(w)
    for k in range(1, kmax):
        a = rng.normal() * k ** -beta
        ph = rng.uniform(0, 2 * np.pi)
        smooth += a * np.sin(k * x + ph)
        if 3 <= k < 40:
            ridged += rng.normal() * k ** -1.0 * np.sin(k * x + rng.uniform(0, 2 * np.pi))
    smooth /= np.abs(smooth).max()
    ridged /= np.abs(ridged).max()
    peaks = (1 - np.abs(ridged)) ** 2 * 2 - 1
    y = smooth * (1 - sharp) + peaks * sharp
    return base - amp * y


def smoothstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def col(c):
    return np.array(c[:3], np.float32)


def vgrad(stops, h=H):
    """Vertical gradient from [(y, colour), ...]."""
    ys = np.arange(h, dtype=np.float32)
    out = np.zeros((h, 3), np.float32)
    for i in range(len(stops) - 1):
        (y0, c0), (y1, c1) = stops[i], stops[i + 1]
        t = np.clip((ys - y0) / (y1 - y0), 0, 1)[:, None]
        m = (ys >= y0) & (ys <= y1) if i < len(stops) - 2 else ys >= y0
        out[m] = (col(c0) + (col(c1) - col(c0)) * t)[m]
    out[ys < stops[0][0]] = col(stops[0][1])
    return out


def to_img(rgb, alpha=None):
    rgb = np.clip(rgb, 0, 255).astype(np.uint8)
    if alpha is None:
        return Image.fromarray(rgb, 'RGB').convert('RGBA')
    a = np.clip(alpha * 255, 0, 255).astype(np.uint8)
    return Image.fromarray(np.dstack([rgb, a]), 'RGBA')


# ------------------------------------------------------------ sky --------

def sky(ember=False):
    base = vgrad([(0, (16, 22, 32)), (260, (40, 52, 68)), (520, (96, 112, 132)),
                  (760, (150, 166, 184)), (1080, (170, 186, 202))])
    rgb = np.repeat(base[:, None, :], W, axis=1)
    yy = np.arange(H, dtype=np.float32)[:, None]
    xx = np.arange(W, dtype=np.float32)[None, :]
    # pale sun glow behind the storm
    glow = np.exp(-(((xx - 1240) / 520) ** 2 + ((yy - 330) / 260) ** 2))
    rgb += glow[..., None] * col((90, 92, 88))
    # storm clouds: two stretched fbm decks
    n1 = fbm(W, H, 6, 3, 101, 6)
    n2 = fbm(W, H, 12, 6, 202, 5)
    heavy = smoothstep(0.46, 0.66, n1) * smoothstep(640, 80, yy)
    wisps = smoothstep(0.52, 0.7, n2) * smoothstep(720, 260, yy) * 0.7
    lit = np.clip((n1 - np.roll(n1, 10, axis=0)) * 9, -1, 1)
    dark_c = col((22, 26, 36))
    lite_c = col((132, 142, 156))
    cloud = dark_c + (lite_c - dark_c) * (0.35 + 0.35 * lit[..., None]) + glow[..., None] * 60
    rgb = rgb * (1 - heavy[..., None] * 0.92) + cloud * heavy[..., None] * 0.92
    wc = col((170, 180, 192)) + glow[..., None] * 40
    rgb = rgb * (1 - wisps[..., None] * 0.45) + wc * wisps[..., None] * 0.45
    if ember:
        rgb = ember_sky(rgb, xx, yy)
    return to_img(rgb)


def ember_sky(rgb, xx, yy):
    """Burning horizon and smoke columns for the breached sections of the wall."""
    warm = np.exp(-(((yy - 780) / 260) ** 2)) * (0.55 + 0.45 * np.cos((xx / W) * 2 * np.pi * 2 + 1.0))
    rgb = rgb + warm[..., None] * col((120, 52, 18))
    noise = fbm(W, H, 24, 6, 909, 4)
    for px, wdt in ((620, 70), (1500, 90), (2380, 60), (3260, 80)):
        dx = np.minimum(np.abs(xx - px), W - np.abs(xx - px))
        drift = (760 - yy) * 0.35
        spread = wdt + np.clip(760 - yy, 0, 760) * 0.35
        plume = np.exp(-((dx - np.clip(drift, 0, None) * 0.4) / spread) ** 2) * smoothstep(780, 600, yy)
        plume = plume * smoothstep(40, 380, yy) * (0.55 + 0.6 * noise)
        a = np.clip(plume * 0.75, 0, 0.8)[..., None]
        rgb = rgb * (1 - a) + col((34, 28, 30)) * a
    return rgb


# ------------------------------------------------------------ far --------

def vector_mountains(seed_shift=0):
    """Flat-shaded mountain ranges (lit face, shadow face, jagged snow cap)."""
    c = Canvas(W, H, 2)
    ranges = (
        dict(seed=31 + seed_shift, base=340, amp=190, spacing=(120, 300), lit=(104, 118, 142), sh=(80, 94, 118),
             snow=(212, 220, 232), snow_sh=(170, 184, 204), bottom=720),
        dict(seed=47 + seed_shift, base=440, amp=150, spacing=(170, 360), lit=(70, 80, 100), sh=(46, 54, 72),
             snow=(226, 232, 242), snow_sh=(168, 184, 206), bottom=760),
    )
    for R in ranges:
        rs = seeded(R['seed'])
        peaks = []
        x = rs.uniform(0, 100)
        while x < W:
            hw = rs.uniform(1.1, 1.7) * sum(R['spacing']) / 2
            peaks.append((x, R['base'] - R['amp'] * rs.uniform(0.15, 1.0) ** 0.8, hw, rs.random()))
            x += rs.uniform(*R['spacing'])
        peaks.sort(key=lambda p: p[1])
        for (px, py, hw, r0) in peaks:
            rj = seeded(int(px * 13) + R['seed'])
            bot = R['bottom']
            hl, hr = hw * (0.8 + 0.4 * r0), hw * (1.2 - 0.4 * r0)

            def slope(sign, half):
                pts = []
                for t in (0.0, 0.2, 0.38, 0.55, 0.7, 0.82, 0.92):
                    xx = px + sign * half * (1 - t) ** 1.15
                    yy = bot + (py - bot) * t
                    j = (t > 0) * (1 - t * 0.6)
                    pts.append((xx + rj.uniform(-22, 22) * j, yy + rj.uniform(-26, 14) * j))
                return pts

            left = slope(-1, hl)
            right = slope(1, hr)
            body = left + [(px, py)] + right[::-1]
            ridge = [(px, py), (px + hr * 0.08, py + (bot - py) * 0.3), (px + hr * 0.02, py + (bot - py) * 0.6),
                     (px + hr * 0.14, bot)]
            shadow = ridge[::-1] + right + [(px, py)]
            f = rj.uniform(0.1, 0.2)
            yl = py + (bot - py) * f
            sl = (px - hl * f * 1.0, yl)
            sr = (px + hr * f * 1.0, yl)
            n = 7
            zig = []
            for i in range(n + 1):
                t = i / n
                zx = sr[0] + (sl[0] - sr[0]) * t
                zy = yl + (rj.uniform(12, 40) if i % 2 else rj.uniform(-10, 4))
                zig.append((zx, zy))
            snow = [(px, py), sr] + zig[1:-1] + [sl]
            snow_sh = ([(px, py), sr] + [z for z in zig[1:-1] if z[0] > px + hr * 0.06]
                       + [(px + hr * 0.07, yl + 14)])
            for dx in (-W, 0, W):
                if px + hr + dx < 0 or px - hl + dx > W:
                    continue
                sh = lambda pts: [(q[0] + dx, q[1]) for q in pts]
                c.poly(sh(body), R['lit'], outline=None)
                c.poly(sh(shadow), R['sh'], outline=None)
                for k in range(3):
                    sx = px - hl * f * rj.uniform(0.2, 0.9)
                    c.line(sh([(sx, yl + 20), (sx - 10 - k * 6, yl + 70 + k * 30)]), shade(R['lit'], 0.84), 2)
                c.poly(sh(snow), R['snow'], outline=None)
                c.poly(sh(snow_sh), R['snow_sh'], outline=None)
    return downsample(c.img, (W, H))


def mountains_and_wall(breaches=(), seed_shift=0, cracks=26, watch=(700, 1900, 3100)):
    """`breaches` = [(x, width, depth)] V-shaped gaps blasted into the wall top."""
    yy = np.arange(H, dtype=np.float32)[:, None]
    xx = np.arange(W, dtype=np.float32)[None, :]
    rgb = np.zeros((H, W, 3), np.float32)
    alpha = np.zeros((H, W), np.float32)
    glow_x = np.exp(-((xx - 1240) / 900) ** 2)

    mimg = vector_mountains(seed_shift)
    m = np.asarray(mimg).astype(np.float32)
    rgb = m[..., :3] + glow_x[..., None] * 16 * (m[..., 3:] / 255)
    alpha = m[..., 3] / 255

    # ---- the great ice wall
    top = 468 + 5 * np.sin(np.arange(W) / W * 2 * np.pi * 3) + 3 * np.sin(np.arange(W) / W * 2 * np.pi * 11)
    dip = np.zeros(W, np.float32)
    jag = fbm(W, 1, 96, 1, 811, 3)[0] - 0.5
    xs = np.arange(W, dtype=np.float32)
    for bx, bw, bd in breaches:
        d = np.minimum(np.abs(xs - bx), W - np.abs(xs - bx))
        dip = np.maximum(dip, bd * np.clip(1 - d / (bw / 2), 0, 1) ** 0.7 * (1 + jag * 0.6))
    top = top + dip
    top = top[None, :]
    cover = np.clip(yy - top + 0.5, 0, 1)
    rng = np.random.default_rng(77)
    slab = np.zeros(W, np.float32)
    x = 0
    while x < W:
        wdt = int(rng.integers(30, 170))
        slab[x:x + wdt] = rng.uniform(-1, 1)
        x += wdt
    slab = np.convolve(np.concatenate([slab[-6:], slab, slab[:6]]), np.ones(13) / 13, 'valid')[None, :]
    streak = fbm(W, H, 120, 2, 303, 4)
    big = fbm(W, H, 8, 2, 404, 3)
    depth = yy - top
    ice = vgrad([(460, (214, 232, 242)), (560, (176, 204, 222)), (760, (132, 166, 192)),
                 (1080, (112, 146, 176))])[:, None, :]
    ice = ice * (1 + slab[..., None] * 0.07 + (streak[..., None] - 0.5) * 0.24
                 + (big[..., None] - 0.5) * 0.18)
    ice += glow_x[..., None] * 26
    # snow cap and ledges
    cap = np.clip(1 - depth / (16 + 14 * fbm(W, H, 64, 4, 505, 3)), 0, 1)
    ice = ice * (1 - cap[..., None]) + col((236, 244, 250)) * cap[..., None]
    for ly, seed in ((585, 1), (690, 2), (820, 3)):
        off = 8 * (fbm(W, 1, 32, 1, 600 + seed, 3)[0] - 0.5)[None, :]
        d = yy - (ly + off * 4)
        shadow = np.exp(-(d / 3.0) ** 2) * 0.24
        snowl = np.exp(-((d + 4) / 2.5) ** 2) * 0.55
        ice = ice * (1 - shadow[..., None])
        ice = ice * (1 - snowl[..., None] * 0.6) + col((236, 244, 250)) * snowl[..., None] * 0.6
    if breaches:
        # soot streaks and a warm glow running down from each breach
        soot_n = fbm(W, H, 120, 3, 712, 3)
        for bx, bw, bd in breaches:
            d = np.minimum(np.abs(xx - bx), W - np.abs(xx - bx))
            band = np.exp(-(d / (bw * 0.42)) ** 2) * smoothstep(1000, 520, yy) * (0.5 + 0.8 * soot_n)
            ice = ice * (1 - np.clip(band, 0, 0.75)[..., None] * 0.62)
            heat = np.exp(-(d / (bw * 0.3)) ** 2) * np.exp(-((yy - (468 + bd)) / 70) ** 2)
            ice = ice + heat[..., None] * col((150, 60, 20))
    fog = smoothstep(660, 1040, yy)
    fn = fbm(W, H, 16, 4, 707, 4)
    fog = np.clip(fog * (0.7 + 0.6 * fn), 0, 1)
    ice = ice * (1 - fog[..., None] * 0.6) + col((196, 210, 224)) * fog[..., None] * 0.6
    rgb = rgb * (1 - cover[..., None]) + ice * cover[..., None]
    alpha = np.maximum(alpha, cover)

    img = to_img(rgb, alpha)
    # crenellations, cracks and watch-posts on top of the wall (vector pass)
    c = Canvas(W, H, 2, img=img.resize((W * 2, H * 2), Image.BICUBIC))
    for i in range(W // 24):
        x0 = i * 24
        if dip[min(W - 1, x0 + 7)] > 6:
            continue          # crenellations are gone where the wall is broken
        t = float(top[0, min(W - 1, x0 + 7)])
        c.poly([(x0 + 2, t + 2), (x0 + 2, t - 9), (x0 + 15, t - 9), (x0 + 15, t + 2)],
               (226, 238, 246), outline=(120, 146, 170, 255), ow=0.6)
    rs = seeded(9 + seed_shift)
    for _ in range(cracks):
        x = rs.uniform(0, W)
        y = rs.uniform(500, 700)
        pts = [(x, y)]
        for _ in range(rs.randint(4, 9)):
            x += rs.uniform(-10, 10)
            y += rs.uniform(14, 40)
            pts.append((x, y))
        for dx in (-W, 0, W):
            c.line([(p[0] + dx, p[1]) for p in pts], (98, 128, 160, 200), 1.6)
            c.line([(p[0] + dx + 1.5, p[1]) for p in pts], (236, 246, 252, 150), 0.8)
    for wx in watch:
        if dip[wx] > 6:
            continue
        t = float(top[0, wx])
        for dx in (0,):
            x = wx + dx
            c.poly([(x - 34, t - 6), (x - 34, t - 46), (x + 34, t - 46), (x + 34, t - 6)],
                   (58, 52, 50), outline=STONE_OUT, ow=1.0)
            c.poly([(x - 42, t - 46), (x, t - 74), (x + 42, t - 46)], (44, 40, 40), outline=STONE_OUT, ow=1.0)
            c.poly([(x - 42, t - 46), (x, t - 74), (x + 42, t - 46), (x + 30, t - 50), (x, t - 66),
                    (x - 30, t - 50)], (230, 238, 246), outline=None)
            lamp = c.layer()
            lamp.circle((x + 8, t - 26), 9, (255, 170, 70, 220), outline=None)
            c.glow(lamp.img, 7, 1.4)
            c.poly([(x + 4, t - 32), (x + 12, t - 32), (x + 12, t - 20), (x + 4, t - 20)],
                   (255, 196, 110), outline=None)
    return downsample(c.img, (W, H))


# ------------------------------------------------------------ helpers ----

def wrap_x(x, w):
    """x positions at which to draw an object of width w so it tiles."""
    xs = [x]
    if x - w < 0:
        xs.append(x + W)
    if x + w > W:
        xs.append(x - W)
    return xs


def stone_blocks(c, x0, y0, x1, y1, bh, seed, base, lit_left=True):
    rs = seeded(seed)
    c.poly([(x0, y0), (x1, y0), (x1, y1), (x0, y1)], shade(base, 0.62), outline=None)
    y = y0
    row = 0
    while y < y1:
        h = min(bh, y1 - y)
        x = x0 - (rs.uniform(0, bh * 1.2) if row % 2 else 0)
        while x < x1:
            w = rs.uniform(bh * 1.2, bh * 2.4)
            a, b = max(x, x0), min(x + w, x1)
            if b - a > 2:
                f = rs.uniform(0.86, 1.08)
                if lit_left:
                    f *= 1.08 - 0.16 * ((a - x0) / max(1, x1 - x0))
                c.poly([(a + 1, y + 1), (b - 1, y + 1), (b - 1, y + h - 1), (a + 1, y + h - 1)],
                       shade(base, f), outline=None)
            x += w
        y += bh
        row += 1


def snow_cap(c, pts_top, thickness, seed):
    """Lumpy snow following a polyline (left to right)."""
    rs = seeded(seed)
    upper = []
    lower = []
    for (x, y) in pts_top:
        upper.append((x, y - rs.uniform(2, thickness * 0.6)))
        lower.append((x, y + rs.uniform(thickness * 0.4, thickness)))
    poly = upper + lower[::-1]
    c.poly(poly, (226, 234, 242), outline=(120, 140, 160, 255), ow=1.0)
    c.line([(p[0], p[1] + 2) for p in upper], (250, 252, 255), 1.4)


def ruined_tower(c, x, wdt, hgt, ground, seed, base=(78, 84, 96), drop=0.22, edge_drop=0.1):
    rs = seeded(seed)
    top_y = ground - hgt
    # jagged broken top
    n = 7
    top = []
    for i in range(n + 1):
        tx = x - wdt / 2 + wdt * i / n
        dy = rs.uniform(0, hgt * drop) if 0 < i < n else rs.uniform(0, hgt * edge_drop)
        top.append((tx, top_y + dy))
    body = [(x - wdt / 2, ground)] + top + [(x + wdt / 2, ground)]
    c.poly(body, base, outline=STONE_OUT, ow=1.6)
    # block texture clipped to the tower
    lay = c.layer()
    stone_blocks(lay, x - wdt / 2, top_y - 10, x + wdt / 2, ground, 26, seed + 1, base)
    for i in range(3):
        wy = ground - hgt * (0.3 + 0.22 * i)
        if wy < top_y + 30:
            continue
        wx = x + rs.uniform(-wdt * 0.2, wdt * 0.2)
        lay.poly([(wx - 7, wy + 24), (wx - 7, wy), (wx, wy - 9), (wx + 7, wy), (wx + 7, wy + 24)],
                 (20, 22, 30), outline=None)
    # shadow side
    lay.poly([(x + wdt * 0.22, top_y - 10), (x + wdt / 2, top_y - 10), (x + wdt / 2, ground),
              (x + wdt * 0.22, ground)], (0, 0, 0, 70), outline=None)
    c.composite(lay.img, c.mask(body))
    snow_cap(c, top, 14, seed + 2)


def pine(c, x, ground, hgt, seed, charred=False):
    rs = seeded(seed)
    c.poly([(x - 4, ground), (x - 3, ground - hgt * 0.3), (x + 3, ground - hgt * 0.3), (x + 4, ground)],
           (40, 32, 30), outline=STONE_OUT, ow=1.0)
    if charred:
        return charred_pine(c, x, ground, hgt, rs)
    tiers = 5
    for i in range(tiers):
        t = i / tiers
        yb = ground - hgt * (0.18 + 0.78 * t)
        wb = hgt * 0.34 * (1 - t * 0.75)
        yt = yb - hgt * 0.3
        pts = [(x - wb, yb), (x - wb * 0.5, yb - 6), (x, yt), (x + wb * 0.5, yb - 6), (x + wb, yb)]
        c.poly(pts, (38, 52, 58), outline=STONE_OUT, ow=1.0)
        c.poly([(x - wb * 0.86, yb - 3), (x - wb * 0.4, yb - 10), (x, yt + 6), (x + wb * 0.3, yb - 12),
                (x + wb * 0.1, yb - 5)], (222, 232, 240), outline=None)


# ------------------------------------------------------------ midground --

def mid_ruins():
    c = Canvas(W, H, 2)
    rs = seeded(42)
    ground = lambda x: 846 + 18 * math.sin(x / W * 2 * math.pi * 4 + 1) + 9 * math.sin(x / W * 2 * math.pi * 13)
    # ruined curtain wall with broken arches
    for (x0, x1, h) in ((520, 1180, 150), (2050, 2800, 180), (3350, 3840 + 220, 130)):
        for dx in (0, -W) if x1 > W else (0,):
            a, b = x0 + dx, x1 + dx
            g = 850
            top = [(a, g - h * 0.7)]
            for i in range(1, 10):
                top.append((a + (b - a) * i / 10, g - h * rs.uniform(0.75, 1.0)))
            top.append((b, g - h * 0.5))
            body = [(a, g + 40)] + top + [(b, g + 40)]
            c.poly(body, (70, 76, 88), outline=STONE_OUT, ow=1.6)
            lay = c.layer()
            stone_blocks(lay, a, g - h - 10, b, g + 40, 24, int(x0), (70, 76, 88))
            c.composite(lay.img, c.mask(body))
            n_arch = int((b - a) // 220)
            for i in range(n_arch):
                ax = a + (b - a) * (i + 0.5) / n_arch
                arch = [(ax - 44, g + 40), (ax - 44, g - h * 0.38)]
                for k in range(9):
                    ang = math.pi - math.pi * k / 8
                    arch.append((ax + 44 * math.cos(ang), g - h * 0.38 - 44 * math.sin(ang)))
                arch += [(ax + 44, g - h * 0.38), (ax + 44, g + 40)]
                c.poly(arch, (0, 0, 0, 0), outline=STONE_OUT, ow=1.6)
                c.d.polygon([c.P(p) for p in arch], fill=(0, 0, 0, 0))
            snow_cap(c, top, 12, int(x0) + 3)
    for (x, wdt, hgt, seed) in ((330, 190, 430, 1), (1420, 230, 520, 2), (2420, 170, 360, 3),
                                (3220, 210, 470, 4)):
        for xx in wrap_x(x, wdt):
            ruined_tower(c, xx, wdt, hgt, 860, seed)
    for i in range(22):
        x = rs.uniform(0, W)
        hgt = rs.uniform(150, 280)
        for xx in wrap_x(x, hgt * 0.4):
            pine(c, xx, ground(x) + 10, hgt, 100 + i)
    # snow drifts along the bottom
    pts = [(x, ground(x)) for x in range(0, W + 1, 20)]
    drift = pts + [(W, H), (0, H)]
    c.grad_poly(drift, (224, 232, 240), (176, 192, 210), (0, 830), (0, 1000), outline=(120, 140, 160, 255), ow=1.0)
    img = downsample(c.img, (W, H))
    # atmospheric haze toward the wall
    arr = np.asarray(img).astype(np.float32)
    arr[..., :3] = arr[..., :3] * 0.74 + col((150, 168, 190)) * 0.26
    return Image.fromarray(arr.astype(np.uint8), 'RGBA')


# ------------------------------------------------------------ foreground -

def brazier(c, x, base_y):
    for s in (-1, 1):
        c.line([(x + s * 6, base_y), (x + s * 26, base_y - 64)], (40, 36, 36), 4)
    c.line([(x - 22, base_y - 30), (x + 22, base_y - 30)], (40, 36, 36), 3)
    bowl = [(x - 40, base_y - 72), (x + 40, base_y - 72), (x + 30, base_y - 52), (x - 30, base_y - 52)]
    g = c.layer()
    g.circle((x, base_y - 100), 70, (255, 150, 60, 150), outline=None)
    c.glow(g.img, 40, 1.0)
    flame = [(x - 34, base_y - 72), (x - 26, base_y - 104), (x - 14, base_y - 92), (x - 8, base_y - 132),
             (x + 4, base_y - 100), (x + 14, base_y - 124), (x + 20, base_y - 94), (x + 30, base_y - 108),
             (x + 34, base_y - 72)]
    c.poly(flame, (255, 132, 36), outline=None)
    c.poly([(x - 22, base_y - 72), (x - 12, base_y - 92), (x - 4, base_y - 110), (x + 6, base_y - 90),
            (x + 14, base_y - 100), (x + 22, base_y - 72)], (255, 214, 120), outline=None)
    c.poly(bowl, (50, 44, 44), outline=STONE_OUT, ow=1.4)
    c.line([(x - 38, base_y - 70), (x + 38, base_y - 70)], (255, 150, 60), 2)


def fg_battlements():
    c = Canvas(W, H, 2)
    stone = (96, 100, 112)
    # back parapet with merlons (period 160 tiles 3840 exactly)
    para = [(0, FLOOR), (0, 846)]
    for i in range(W // 160):
        x0 = i * 160 + 28
        para += [(x0, 846), (x0, 772), (x0 + 104, 772), (x0 + 104, 846)]
    para += [(W, 846), (W, FLOOR)]
    c.poly(para, stone, outline=STONE_OUT, ow=1.8)
    lay = c.layer()
    stone_blocks(lay, -40, 760, W + 40, FLOOR, 26, 5, stone)
    lay.poly([(0, 886), (W, 886), (W, FLOOR), (0, FLOOR)], (0, 0, 0, 60), outline=None)
    c.composite(lay.img, c.mask(para))
    for i in range(W // 160):
        x0 = i * 160 + 28
        snow_cap(c, [(x0 - 3, 772), (x0 + 30, 771), (x0 + 70, 772), (x0 + 107, 772)], 12, 50 + i)
        snow_cap(c, [(x0 + 104, 846), (x0 + 130, 846), (x0 + 160 + 1, 846)], 9, 90 + i)
    for i, x in enumerate((1120, 2400, 3680)):
        for xx in wrap_x(x, 60):
            banner(c, xx, 776, i + 1)
    # walkway surface and outer wall face
    c.poly([(0, FLOOR), (W, FLOOR), (W, 922), (0, 922)], (128, 132, 144), outline=STONE_OUT, ow=1.6)
    rs = seeded(8)
    for _ in range(70):
        x = rs.uniform(0, W)
        w = rs.uniform(30, 140)
        for xx in wrap_x(x, w):
            c.poly([(xx - w / 2, FLOOR + 1), (xx - w / 3, FLOOR - 4), (xx + w / 3, FLOOR - 5), (xx + w / 2, FLOOR + 1),
                    (xx + w / 3, FLOOR + 6), (xx - w / 3, FLOOR + 6)], (230, 236, 244), outline=None)
    face = [(0, 922), (W, 922), (W, H), (0, H)]
    c.poly(face, (66, 70, 82), outline=STONE_OUT, ow=1.6)
    lay = c.layer()
    stone_blocks(lay, -40, 922, W + 40, H, 40, 6, (66, 70, 82))
    lay.poly([(0, 922), (W, 922), (W, 940), (0, 940)], (0, 0, 0, 90), outline=None)
    c.composite(lay.img, c.mask(face))
    for _ in range(140):
        x = rs.uniform(0, W)
        L = rs.uniform(10, 70)
        w = rs.uniform(4, 10)
        for xx in wrap_x(x, w):
            c.poly([(xx - w, 921), (xx + w, 921), (xx + rs.uniform(-2, 2), 921 + L)], (196, 222, 240),
                   outline=(90, 120, 150, 255), ow=0.8)
    for x in (480, 1760, 3040):
        for xx in wrap_x(x, 70):
            brazier(c, xx, FLOOR)
    return downsample(c.img, (W, H))


# ------------------------------------------------------------ cover ------

def prop_barricade():
    c = Canvas(300, 190, 2)
    for (x0, y0, x1, y1) in ((20, 180, 250, 40), (50, 40, 280, 180), (10, 120, 290, 120)):
        c.capsule((x0, y0), (x1, y1), 9, 9, (96, 70, 48), ow=1.6)
        c.line([(x0, y0 - 3), (x1, y1 - 3)], (130, 98, 70), 2)
    for i, x in enumerate((40, 90, 140, 190, 240)):
        top = 22 + (i % 2) * 14
        c.poly([(x - 11, 186), (x - 11, top + 18), (x, top), (x + 11, top + 18), (x + 11, 186)], (110, 80, 54),
               outline=STONE_OUT, ow=1.6)
        c.line([(x - 4, 180), (x - 4, top + 22)], (140, 106, 76), 2)
        c.poly([(x - 9, top + 22), (x, top + 6), (x + 9, top + 22), (x, top + 18)], (230, 236, 244), outline=None)
    c.line([(26, 150), (276, 150)], (60, 52, 46), 3)
    return c.finish(), 186


def prop_crates():
    c = Canvas(240, 220, 2)

    def crate(x, y, s):
        box = [(x, y), (x + s, y), (x + s, y + s), (x, y + s)]
        c.poly(box, (120, 88, 56), outline=STONE_OUT, ow=1.8)
        for k in range(1, 4):
            c.line([(x + 4, y + s * k / 4), (x + s - 4, y + s * k / 4)], (84, 60, 38), 2)
        c.line([(x + 6, y + 6), (x + s - 6, y + s - 6)], (96, 70, 44), 7)
        c.poly([(x, y), (x + s, y), (x + s, y + 7), (x, y + 7)], (90, 66, 42), outline=None)
        c.poly([(x - 2, y + 2), (x + s * 0.3, y - 6), (x + s * 0.7, y - 5), (x + s + 2, y + 2), (x + s, y + 7), (x, y + 7)],
               (230, 236, 244), outline=(120, 140, 160, 255), ow=1.0)
    crate(14, 112, 100)
    crate(122, 120, 92)
    crate(60, 26, 88)
    return c.finish(), 212


def prop_stone_block():
    c = Canvas(230, 150, 2)
    blk = [(10, 142), (16, 40), (60, 26), (190, 30), (220, 52), (214, 142)]
    c.grad_poly(blk, (128, 132, 144), (76, 80, 92), (10, 0), (220, 0), outline=STONE_OUT, ow=1.8)
    c.line([(18, 84), (214, 90)], (70, 74, 86), 2)
    c.line([(110, 30), (106, 84)], (70, 74, 86), 2)
    c.line([(150, 90), (154, 142)], (70, 74, 86), 2)
    snow_cap(c, [(14, 42), (60, 28), (130, 28), (190, 32), (220, 54)], 14, 12)
    return c.finish(), 142


def prop_ice_boulder():
    c = Canvas(240, 180, 2)
    rock = [(12, 172), (20, 110), (54, 54), (110, 22), (170, 36), (216, 88), (230, 172)]
    c.grad_poly(rock, (206, 234, 248), (112, 158, 196), (40, 30), (220, 170), outline=(40, 70, 100, 255), ow=1.8)
    for f in ([(54, 56), (110, 24), (100, 100)], [(110, 24), (170, 38), (130, 96)],
              [(20, 112), (54, 56), (70, 140)], [(170, 38), (216, 90), (160, 120)]):
        c.poly(f, (232, 246, 252, 150), outline=None)
    c.line([(100, 100), (130, 96), (160, 120)], (90, 140, 180), 1.4)
    c.poly([(12, 172), (40, 158), (120, 162), (200, 156), (230, 172)], (226, 234, 242), outline=None)
    return c.finish(), 172


PROPS = {
    'cover_barricade': prop_barricade,
    'cover_crates': prop_crates,
    'cover_stone_block': prop_stone_block,
    'cover_ice_boulder': prop_ice_boulder,
}


FROZEN_COVER = (('cover_crates', 700), ('cover_barricade', 1450), ('cover_stone_block', 2150),
                ('cover_ice_boulder', 2850), ('cover_barricade', 3450))
BROKEN_COVER = (('cover_broken_wall', 900), ('platform_cracked', 1700), ('cover_broken_wall', 2500),
                ('platform_cracked', 3300))


def cover_layer(props, layout=FROZEN_COVER):
    layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    placements = []
    for name, x in layout:
        img, base = props[name][:2]
        y = FLOOR + 4 - base
        layer.alpha_composite(img, (int(x - img.width / 2), int(y)))
        placements.append({'prop': name, 'x': x, 'y': int(y), 'w': img.width, 'h': img.height})
    return layer, placements


# ============================================================ Level 2 ===
# The Broken Battlements: a breached, burning stretch of the same wall.

BROKEN_BRAZIERS = (360, 1320, 2240, 3200)
BROKEN_FIRES = (560, 1440, 2440, 3180)       # fire pits in the midground ruins


def charred_pine(c, x, ground, hgt, rs):
    """A burnt pine: bare black branches, no snow."""
    trunk = [(x - 5, ground), (x - 2, ground - hgt), (x + 2, ground - hgt), (x + 5, ground)]
    c.poly(trunk, (28, 22, 22), outline=STONE_OUT, ow=1.0)
    for i in range(7):
        y = ground - hgt * (0.3 + 0.1 * i)
        L = hgt * 0.2 * (1 - i / 9)
        for sgn in (-1, 1):
            c.line([(x, y), (x + sgn * L, y - L * 0.4 + rs.uniform(-6, 6))], (24, 18, 18), 2.6)


def fire_pit(c, x, ground, size=1.0):
    """Static flames burning in the rubble (embers are added live by the engine)."""
    g = c.layer()
    g.circle((x, ground - 50 * size), 110 * size, (255, 130, 40, 140), outline=None)
    c.glow(g.img, 46, 1.0)
    s = size
    flame = [(x - 46 * s, ground), (x - 36 * s, ground - 48 * s), (x - 20 * s, ground - 34 * s),
             (x - 12 * s, ground - 96 * s), (x + 2 * s, ground - 52 * s), (x + 14 * s, ground - 84 * s),
             (x + 24 * s, ground - 40 * s), (x + 38 * s, ground - 62 * s), (x + 46 * s, ground)]
    c.poly(flame, (255, 128, 34), outline=None)
    c.poly([(x - 30 * s, ground), (x - 16 * s, ground - 34 * s), (x - 6 * s, ground - 64 * s),
            (x + 8 * s, ground - 36 * s), (x + 18 * s, ground - 50 * s), (x + 30 * s, ground)],
           (255, 214, 118), outline=None)


def rubble_pile(c, x, ground, wdt, seed, base=(88, 92, 104), snow=True):
    rs = seeded(seed)
    for i in range(int(wdt / 22)):
        cx = x + rs.uniform(-wdt / 2, wdt / 2)
        r = rs.uniform(10, 26) * (1 - abs(cx - x) / wdt)
        if r < 6:
            continue
        cy = ground - r * rs.uniform(0.3, 0.9)
        angles = [k * math.pi / 3 + rs.uniform(-0.3, 0.3) for k in range(6)]
        pts = [(cx + math.cos(a) * r * rs.uniform(0.7, 1.2), cy + math.sin(a) * r * rs.uniform(0.6, 1.0))
               for a in angles]
        c.poly(pts, shade(base, rs.uniform(0.75, 1.1)), outline=STONE_OUT, ow=1.2)
        if snow:
            c.poly([pts[3], pts[4], pts[5], (cx + r * 0.5, cy - r * 0.35), (cx - r * 0.5, cy - r * 0.35)],
                   (226, 234, 242), outline=None)


def crack(c, x, y, length, seed, color=(30, 30, 38), width=2.2, down=True):
    rs = seeded(seed)
    pts = [(x, y)]
    for _ in range(int(length / 14)):
        if down:
            x += rs.uniform(-12, 12)
            y += rs.uniform(8, 16)
        else:
            x += 14 + rs.uniform(-4, 6)
            y += rs.uniform(-4, 4)
        pts.append((x, y))
    c.line(pts, color, width)


def mid_ruins_broken():
    c = Canvas(W, H, 2)
    rs = seeded(142)

    def ground(x):
        return 848 + 16 * math.sin(x / W * 2 * math.pi * 5 + 2) + 8 * math.sin(x / W * 2 * math.pi * 17)

    for (x0, x1, h) in ((260, 860, 120), (1640, 2260, 150), (2860, 3480, 104)):
        g = 852
        top = [(x0, g - h * 0.5)]
        for i in range(1, 12):
            top.append((x0 + (x1 - x0) * i / 12, g - h * rs.uniform(0.35, 1.0)))
        top.append((x1, g - h * 0.3))
        body = [(x0, g + 40)] + top + [(x1, g + 40)]
        c.poly(body, (66, 70, 82), outline=STONE_OUT, ow=1.6)
        lay = c.layer()
        stone_blocks(lay, x0, g - h - 10, x1, g + 40, 24, int(x0) + 7, (66, 70, 82))
        c.composite(lay.img, c.mask(body))
        snow_cap(c, top, 10, int(x0) + 9)
    for (x, wdt, hgt, seed) in ((140, 170, 300, 21), (1180, 210, 420, 22), (2030, 150, 250, 23),
                                (2620, 190, 380, 24), (3560, 160, 280, 25)):
        for xx in wrap_x(x, wdt):
            ruined_tower(c, xx, wdt, hgt, 862, seed, base=(70, 74, 86), drop=0.45, edge_drop=0.2)
    for i in range(16):
        x = rs.uniform(0, W)
        hgt = rs.uniform(150, 260)
        for xx in wrap_x(x, hgt * 0.4):
            pine(c, xx, ground(x) + 10, hgt, 300 + i, charred=i % 2 == 0)
    for x, sz in zip(BROKEN_FIRES, (1.0, 0.8, 1.1, 0.9)):
        for xx in wrap_x(x, 120):
            fire_pit(c, xx, ground(x) + 4, sz)
    for i, x in enumerate((420, 1000, 1900, 2750, 3350)):
        for xx in wrap_x(x, 140):
            rubble_pile(c, xx, ground(x) + 8, 180, 400 + i)
    pts = [(x, ground(x)) for x in range(0, W + 1, 20)]
    drift = pts + [(W, H), (0, H)]
    c.grad_poly(drift, (214, 222, 232), (168, 182, 200), (0, 830), (0, 1000),
                outline=(120, 140, 160, 255), ow=1.0)
    img = downsample(c.img, (W, H))
    arr = np.asarray(img).astype(np.float32)
    arr[..., :3] = arr[..., :3] * 0.74 + col((152, 150, 164)) * 0.26
    return Image.fromarray(arr.astype(np.uint8), 'RGBA')


def fg_broken():
    c = Canvas(W, H, 2)
    stone = (92, 94, 104)
    rs = seeded(77)
    polys = [[(0, FLOOR), (0, 846), (W, 846), (W, FLOOR)]]
    tops = []
    kinds = ['intact', 'broken', 'intact', 'stub', 'broken', 'intact']
    for i in range(W // 160):
        x0 = i * 160 + 28
        kind = kinds[i % len(kinds)]
        if kind == 'intact':
            top = [(x0, 772), (x0 + 52, 771), (x0 + 104, 772)]
        elif kind == 'broken':
            top = [(x0, 790 + rs.uniform(0, 12))]
            for k in range(1, 5):
                top.append((x0 + 104 * k / 5, 784 + rs.uniform(-6, 40)))
            top.append((x0 + 104, 808 + rs.uniform(0, 26)))
        else:
            top = [(x0, 826), (x0 + 30, 818), (x0 + 60, 832), (x0 + 104, 828)]
        polys.append([(x0, 846)] + top + [(x0 + 104, 846)])
        tops.append((kind, top, x0))
    for pg in polys:
        c.poly(pg, stone, outline=STONE_OUT, ow=1.8)
    mask = Image.new('L', c.img.size, 0)
    md = ImageDraw.Draw(mask)
    for pg in polys:
        md.polygon([c.P(q) for q in pg], fill=255)
    lay = c.layer()
    stone_blocks(lay, -40, 760, W + 40, FLOOR, 26, 15, stone)
    lay.poly([(0, 886), (W, 886), (W, FLOOR), (0, FLOOR)], (0, 0, 0, 60), outline=None)
    for x in (300, 1300, 2300, 3300):          # scorch marks from dragonfire
        g = lay.layer()
        g.ellipse((x, 840), 150, 60, (10, 6, 6, 150), outline=None)
        lay.glow(g.img, 30, 1.0)
    c.composite(lay.img, mask)
    for kind, top, x0 in tops:
        if kind != 'stub':
            snow_cap(c, [(top[0][0] - 3, top[0][1])] + top[1:-1] + [(top[-1][0] + 3, top[-1][1])], 11, 150 + x0)
        if kind != 'intact':
            crack(c, x0 + 40, top[1][1] + 6, 70, x0)
            for xx in wrap_x(x0 + 52, 90):
                rubble_pile(c, xx, FLOOR - 2, 90, x0 + 3, base=stone)
    for i in range(W // 160):
        x0 = i * 160 + 28
        snow_cap(c, [(x0 + 104, 846), (x0 + 130, 846), (x0 + 160 + 1, 846)], 9, 190 + i)
    for i, x in enumerate((840, 2720)):
        for xx in wrap_x(x, 60):
            banner(c, xx, 776, i + 7, torn=True)
    c.poly([(0, FLOOR), (W, FLOOR), (W, 922), (0, 922)], (122, 124, 136), outline=STONE_OUT, ow=1.6)
    for _ in range(60):
        x = rs.uniform(0, W)
        w = rs.uniform(30, 130)
        for xx in wrap_x(x, w):
            c.poly([(xx - w / 2, FLOOR + 1), (xx - w / 3, FLOOR - 4), (xx + w / 3, FLOOR - 5),
                    (xx + w / 2, FLOOR + 1), (xx + w / 3, FLOOR + 6), (xx - w / 3, FLOOR + 6)],
                   (226, 232, 240), outline=None)
    for k in range(18):
        crack(c, rs.uniform(40, W - 200), FLOOR + 10, 160, 500 + k, down=False, width=1.8)
    face = [(0, 922), (W, 922), (W, H), (0, H)]
    c.poly(face, (62, 64, 76), outline=STONE_OUT, ow=1.6)
    lay = c.layer()
    stone_blocks(lay, -40, 922, W + 40, H, 40, 16, (62, 64, 76))
    lay.poly([(0, 922), (W, 922), (W, 940), (0, 940)], (0, 0, 0, 90), outline=None)
    for _ in range(14):                         # knocked-out blocks
        x = rs.uniform(40, W - 120)
        y = rs.uniform(950, 1040)
        lay.poly([(x, y), (x + rs.uniform(50, 90), y + rs.uniform(-6, 6)), (x + 80, y + 38), (x + 6, y + 40)],
                 (14, 14, 20), outline=None)
    c.composite(lay.img, c.mask(face))
    for k in range(12):
        crack(c, rs.uniform(40, W - 40), 930, 120, 700 + k, width=2.0)
    for _ in range(110):
        x = rs.uniform(0, W)
        L = rs.uniform(10, 60)
        w = rs.uniform(4, 10)
        for xx in wrap_x(x, w):
            c.poly([(xx - w, 921), (xx + w, 921), (xx + rs.uniform(-2, 2), 921 + L)], (196, 222, 240),
                   outline=(90, 120, 150, 255), ow=0.8)
    for x in BROKEN_BRAZIERS:
        for xx in wrap_x(x, 70):
            brazier(c, xx, FLOOR)
    return downsample(c.img, (W, H))


def _broken_wall_base(c):
    body = [(14, 204), (20, 70), (42, 44), (70, 58), (98, 24), (130, 38), (160, 20), (196, 46), (222, 66),
            (226, 204)]
    c.poly(body, (96, 98, 110), outline=STONE_OUT, ow=1.8)
    lay = c.layer()
    stone_blocks(lay, 0, 10, 240, 210, 30, 33, (96, 98, 110))
    lay.poly([(150, 20), (240, 20), (240, 210), (150, 210)], (0, 0, 0, 60), outline=None)
    c.composite(lay.img, c.mask(body))
    snow_cap(c, [(18, 72), (42, 46), (70, 60), (98, 26), (130, 40), (160, 22), (196, 48), (224, 68)], 12, 34)


def prop_broken_wall():
    """Breakable cover. Intact, cracked and rubble states share one canvas so
    they line up when the engine swaps them."""
    def make(state):
        c = Canvas(240, 210, 2)
        if state == 'rubble':
            rubble_pile(c, 120, 206, 230, 61)
            rubble_pile(c, 90, 206, 120, 62)
            return c.finish()
        _broken_wall_base(c)
        if state == 'cracked':
            c.d.polygon([c.P(q) for q in [(150, 0), (240, 0), (240, 120), (204, 96), (176, 70), (150, 40)]],
                        fill=(0, 0, 0, 0))
            for k, (x, y) in enumerate(((120, 40), (70, 64), (180, 80), (40, 110))):
                crack(c, x, y, 110, 70 + k, color=(24, 22, 28), width=3)
            c.line([(150, 40), (176, 70), (204, 96), (226, 116)], STONE_OUT, 2.2)
            rubble_pile(c, 200, 206, 70, 63)
        return c.finish()
    return make('intact'), 204, {'cracked': make('cracked'), 'rubble': make('rubble')}


def prop_platform():
    """A cracked battlement slab on a wooden scaffold. Only the slab is solid
    (players land on it from above); the scaffold is decoration."""
    c = Canvas(340, 270, 2)
    top, thick = 60, 40
    for x in (60, 280):
        c.poly([(x - 8, 266), (x - 8, top + 30), (x + 8, top + 30), (x + 8, 266)], (88, 64, 44),
               outline=STONE_OUT, ow=1.4)
        c.line([(x - 3, 262), (x - 3, top + 36)], (122, 92, 64), 2)
    c.line([(68, 254), (272, top + 44)], (80, 58, 40), 7)
    c.line([(68, 254), (272, top + 44)], (110, 82, 58), 2.5)
    for x in (60, 280):
        c.line([(x - 10, top + 52), (x + 10, top + 46)], (160, 140, 100), 3)
    slab = [(8, top + 6), (40, top), (120, top + 3), (190, top - 2), (300, top + 2), (334, top + 10),
            (330, top + thick), (250, top + thick + 4), (160, top + thick), (60, top + thick + 6), (12, top + thick)]
    c.poly(slab, (112, 114, 126), outline=STONE_OUT, ow=1.8)
    lay = c.layer()
    stone_blocks(lay, 0, top - 4, 340, top + thick + 8, 22, 44, (112, 114, 126))
    c.composite(lay.img, c.mask(slab))
    crack(c, 120, top + 4, 36, 45, color=(28, 26, 32), width=2.4)
    crack(c, 236, top + 2, 40, 46, color=(28, 26, 32), width=2.4)
    snow_cap(c, [(10, top + 6), (40, top), (120, top + 3), (190, top - 2), (300, top + 2), (332, top + 10)], 10, 47)
    rs = seeded(48)
    for _ in range(9):
        x = rs.uniform(30, 310)
        L = rs.uniform(10, 34)
        c.poly([(x - 5, top + thick), (x + 5, top + thick), (x, top + thick + L)], (196, 222, 240),
               outline=(90, 120, 150, 255), ow=0.8)
    return c.finish(), 266, {'slab': [8, top - 2, 326, thick + 4]}


PROPS_BROKEN = {
    'cover_broken_wall': prop_broken_wall,
    'platform_cracked': prop_platform,
}


# ============================================================ House Stark ===
# Grey direwolf head on a white field (fan tribute requested for this project).

WOLF = [(0.55, 0.95), (0.78, 0.45), (0.72, 0.02), (0.62, -0.5), (0.48, -1.0), (0.3, -0.52), (0.18, -0.62),
        (0.08, -1.0), (-0.06, -0.46), (-0.24, -0.36), (-0.62, -0.22), (-0.92, -0.12), (-0.9, 0.0), (-0.62, 0.06),
        (-0.3, 0.1), (-0.56, 0.2), (-0.34, 0.34), (-0.08, 0.42), (0.1, 0.62), (-0.02, 0.74), (0.22, 0.78),
        (0.14, 0.95)]


def direwolf(c, cx, cy, s, color=(104, 110, 122), outline=(40, 42, 50, 255)):
    pts = [(cx + x * s, cy + y * s) for x, y in WOLF]
    c.poly(pts, color, outline=outline, ow=max(0.8, s * 0.05))
    c.poly([(cx - 0.2 * s, cy - 0.24 * s), (cx - 0.02 * s, cy - 0.3 * s), (cx - 0.06 * s, cy - 0.2 * s)],
           (230, 234, 240), outline=None)
    c.line([(cx + 0.05 * s, cy + 0.1 * s), (cx + 0.45 * s, cy + 0.55 * s)], shade(color, 0.75), max(1, s * 0.04))
    c.line([(cx + 0.25 * s, cy - 0.1 * s), (cx + 0.6 * s, cy + 0.3 * s)], shade(color, 0.75), max(1, s * 0.04))


def stark_banner(c, x, top_y, w, L, seed, torn=False):
    c.line([(x - w * 0.62, top_y), (x + w * 0.62, top_y)], (60, 44, 32), 6)
    left = [(x - w / 2 + math.sin(i * 1.1 + seed) * 2.5, top_y + i * L / 4) for i in range(5)]
    right = [(x + w / 2 + math.sin(i * 1.1 + seed + 0.7) * 2.5, top_y + i * L / 4) for i in range(4, -1, -1)]
    if torn:
        hem = [(x - w * 0.34, top_y + L + 16), (x - w * 0.18, top_y + L - 4), (x, top_y + L + 22),
               (x + w * 0.16, top_y + L), (x + w * 0.32, top_y + L + 12)]
    else:
        hem = [(x - w * 0.25, top_y + L + 16), (x, top_y + L + 2), (x + w * 0.25, top_y + L + 16)]
    cloth = left + hem + right
    c.grad_poly(cloth, (236, 238, 242), (182, 188, 198), (x - w / 2, 0), (x + w / 2, 0), outline=STONE_OUT, ow=1.4)
    inner = [(q[0] * 0.86 + x * 0.14, q[1] * 0.92 + (top_y + 6) * 0.08) for q in cloth]
    c.line(inner + [inner[0]], (120, 124, 132), 1.6)
    direwolf(c, x, top_y + L * 0.46, w * 0.36)


def banner(c, x, top_y, seed, torn=False):
    stark_banner(c, x, top_y, 64, 96, seed, torn)


def sigil_image(size=256):
    c = Canvas(size, size, 4)
    c.circle((size / 2, size / 2), size * 0.47, (226, 230, 236), outline=(40, 42, 50, 255), ow=size * 0.025)
    c.circle((size / 2, size / 2), size * 0.41, None, outline=(120, 126, 136, 255), ow=size * 0.012)
    c.circle((size / 2, size / 2), size * 0.40, (226, 230, 236), outline=None)
    direwolf(c, size / 2 + size * 0.02, size / 2, size * 0.3)
    return c.finish()


# ============================================================ Level 2 v2 ===
# The burning keep of House Stark: a castle courtyard at night, aurora in
# the sky, timber halls on fire. Nothing like the ice wall of Level 1.

KEEP_TORCHES = (720, 1680, 2640, 3600)


def sky_night():
    base = vgrad([(0, (5, 8, 20)), (380, (14, 22, 46)), (700, (40, 34, 56)), (900, (96, 52, 40)),
                  (1080, (124, 62, 36))])
    rgb = np.repeat(base[:, None, :], W, axis=1)
    yy = np.arange(H, dtype=np.float32)[:, None]
    xx = np.arange(W, dtype=np.float32)[None, :]
    band = 250 + 70 * np.sin(xx / W * 2 * np.pi * 2 + 0.6) + 30 * np.sin(xx / W * 2 * np.pi * 5)
    streak = fbm(W, H, 192, 2, 515, 3)
    au = np.exp(-((yy - band) / 80) ** 2) * (0.3 + 0.7 * streak) * smoothstep(640, 300, yy)
    au2 = np.exp(-((yy - band + 70) / 60) ** 2) * streak * smoothstep(640, 200, yy)
    rgb += au[..., None] * col((50, 170, 120)) + au2[..., None] * col((70, 80, 170)) * 0.6
    rng = np.random.default_rng(31)
    for _ in range(1100):
        x, y = int(rng.integers(0, W - 2)), int(rng.integers(0, 620))
        b = rng.uniform(0.3, 1.0) * (1 - y / 700)
        rgb[y:y + 2, x:x + 2] = rgb[y:y + 2, x:x + 2] * (1 - b) + 240 * b
    d2 = ((xx - 2900) / 1.0) ** 2 + ((yy - 170) / 1.0) ** 2
    rgb += np.exp(-d2 / (2 * 160 ** 2))[..., None] * col((70, 80, 100))
    moon = np.clip(46 - np.sqrt(d2), 0, 1)
    rgb = rgb * (1 - moon[..., None]) + col((236, 238, 228)) * moon[..., None]
    n1 = fbm(W, H, 6, 3, 108, 5)
    heavy = smoothstep(0.52, 0.72, n1) * smoothstep(820, 360, yy) * 0.75
    rgb = rgb * (1 - heavy[..., None]) + col((12, 12, 22)) * heavy[..., None]
    return to_img(ember_sky(rgb, xx, yy))


def _castle_tower(c, x, w, top, base_y, seed, roof=True, burning=False):
    body = [(x - w / 2, base_y), (x - w / 2, top), (x + w / 2, top), (x + w / 2, base_y)]
    c.poly(body, (46, 50, 64), outline=STONE_OUT, ow=1.6)
    lay = c.layer()
    stone_blocks(lay, x - w / 2, top, x + w / 2, base_y, 26, seed, (50, 54, 68))
    lay.poly([(x + w * 0.18, top), (x + w / 2, top), (x + w / 2, base_y), (x + w * 0.18, base_y)], (0, 0, 0, 80),
             outline=None)
    c.composite(lay.img, c.mask(body))
    rs = seeded(seed)
    for k in range(int((base_y - top) / 90)):
        wy = top + 50 + k * 90
        wx = x + rs.uniform(-w * 0.25, w * 0.25)
        lit = rs.random() < 0.6
        if lit:
            g = c.layer()
            g.circle((wx, wy + 12), 26, (255, 170, 70, 150), outline=None)
            c.glow(g.img, 10, 1.0)
        c.poly([(wx - 8, wy + 26), (wx - 8, wy), (wx, wy - 9), (wx + 8, wy), (wx + 8, wy + 26)],
               (255, 196, 110) if lit else (16, 16, 24), outline=None)
    if roof:
        c.poly([(x - w / 2 - 14, top + 2), (x, top - w * 0.9), (x + w / 2 + 14, top + 2)], (30, 32, 42),
               outline=STONE_OUT, ow=1.6)
        snow_cap(c, [(x - w / 2 - 12, top), (x - w * 0.25, top - w * 0.45), (x, top - w * 0.88)], 9, seed + 1)
    else:
        for k in range(5):
            mx = x - w / 2 + k * w / 4.5
            c.poly([(mx, top), (mx, top - 22), (mx + w / 9, top - 22), (mx + w / 9, top)], (46, 50, 64),
                   outline=STONE_OUT, ow=1.2)
    if burning:
        fire_pit(c, x, top + 4, w / 190)


def keep_far():
    c = Canvas(W, H, 2)
    pts = [(x, 640 + 40 * math.sin(x / W * 2 * math.pi * 3 + 1) + 22 * math.sin(x / W * 2 * math.pi * 7))
           for x in range(0, W + 1, 40)]
    c.poly(pts + [(W, H), (0, H)], (18, 22, 36), outline=None)
    c.line(pts, (70, 80, 104), 3)
    wall = [(0, 900), (0, 560)]
    for i in range(W // 60):
        x0 = i * 60
        wall += [(x0, 560), (x0, 538), (x0 + 30, 538), (x0 + 30, 560)]
    wall += [(W, 560), (W, 900)]
    c.poly(wall, (44, 48, 62), outline=STONE_OUT, ow=1.6)
    lay = c.layer()
    stone_blocks(lay, -20, 530, W + 20, 900, 28, 91, (48, 52, 66))
    c.composite(lay.img, c.mask(wall))
    for (x, w, top, roof, burning, seed) in ((300, 150, 380, True, False, 1), (980, 210, 300, False, True, 2),
                                            (1720, 170, 360, True, False, 3), (2520, 270, 250, False, True, 4),
                                            (3320, 160, 390, True, False, 5)):
        for xx in wrap_x(x, w):
            _castle_tower(c, xx, w, top, 900, 60 + seed, roof, burning)
    rs = seeded(92)
    for i in range(18):
        x = rs.uniform(0, W)
        for xx in wrap_x(x, 60):
            pine(c, xx, 900, rs.uniform(160, 240), 700 + i, charred=True)
    img = downsample(c.img, (W, H))
    arr = np.asarray(img).astype(np.float32)
    yy = np.arange(H, dtype=np.float32)[:, None]
    warm = smoothstep(560, 900, yy)[..., None]
    arr[..., :3] = arr[..., :3] * (1 - warm * 0.35) + col((150, 70, 34)) * warm * 0.35
    arr[..., :3] = arr[..., :3] * 0.8 + col((30, 36, 60)) * 0.2
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), 'RGBA')


def _hall(c, x, w, h, ground, seed, burning=False):
    rs = seeded(seed)
    body = [(x - w / 2, ground), (x - w / 2, ground - h), (x + w / 2, ground - h), (x + w / 2, ground)]
    c.poly(body, (92, 80, 68), outline=STONE_OUT, ow=1.6)
    beam = (42, 30, 24)
    for k in range(5):
        bx = x - w / 2 + k * w / 4
        c.line([(bx, ground), (bx, ground - h)], beam, 7)
    c.line([(x - w / 2, ground - h * 0.5), (x + w / 2, ground - h * 0.5)], beam, 7)
    for k in range(4):
        bx = x - w / 2 + k * w / 4
        c.line([(bx, ground - h * 0.5), (bx + w / 4, ground - h)], beam, 5)
    for k in range(2):
        wx = x - w * 0.25 + k * w * 0.5
        g = c.layer()
        g.circle((wx, ground - h * 0.25), 30, (255, 170, 70, 160), outline=None)
        c.glow(g.img, 12, 1.0)
        c.poly([(wx - 14, ground - h * 0.12), (wx - 14, ground - h * 0.36), (wx + 14, ground - h * 0.36),
                (wx + 14, ground - h * 0.12)], (255, 196, 110), outline=STONE_OUT, ow=1.0)
    roof = [(x - w / 2 - 26, ground - h + 4), (x, ground - h - h * 0.85), (x + w / 2 + 26, ground - h + 4)]
    c.poly(roof, (40, 34, 34), outline=STONE_OUT, ow=1.6)
    if burning:
        fire_pit(c, x + rs.uniform(-w * 0.2, w * 0.2), ground - h - h * 0.3, w / 140)
    else:
        snow_cap(c, [roof[0], (x - w * 0.25, ground - h - h * 0.43), roof[1]], 12, seed + 3)
        snow_cap(c, [roof[1], (x + w * 0.25, ground - h - h * 0.43), roof[2]], 12, seed + 4)


def _white_tree(c, x, ground, h):
    rs = seeded(77)
    trunk = [(x - 40, ground), (x - 26, ground - h * 0.4), (x - 34, ground - h * 0.7), (x - 10, ground - h * 0.78),
             (x + 12, ground - h * 0.74), (x + 30, ground - h * 0.5), (x + 22, ground - h * 0.3), (x + 44, ground)]
    for (bx, by, ex, ey) in ((x - 20, ground - h * 0.7, x - 150, ground - h * 0.95),
                             (x + 10, ground - h * 0.72, x + 160, ground - h * 0.98),
                             (x, ground - h * 0.76, x + 10, ground - h * 1.1)):
        c.line([(bx, by), (ex, ey)], (214, 208, 198), 14)
    c.poly(trunk, (222, 216, 206), outline=STONE_OUT, ow=1.6)
    for k in range(5):
        c.line([(x - 20 + k * 9, ground - 20), (x - 14 + k * 9, ground - h * 0.6)], (176, 168, 158), 1.8)
    for _ in range(320):
        lx = x + rs.gauss(0, 135)
        ly = ground - h * 0.95 + rs.gauss(0, 52)
        r = rs.uniform(5, 11)
        c.poly([(lx - r, ly), (lx, ly - r * 0.7), (lx + r, ly), (lx, ly + r * 0.7)],
               (110 + rs.randint(0, 70), 14 + rs.randint(0, 14), 18), outline=None)
    c.ellipse((x + 2, ground - h * 0.5), 12, 8, (120, 20, 20), outline=None)


def courtyard_mid():
    c = Canvas(W, H, 2)
    ground = 860
    for (x, w, h, burning, seed) in ((260, 300, 170, False, 1), (820, 260, 150, True, 2), (1500, 340, 190, False, 3),
                                     (2700, 300, 170, True, 4), (3360, 280, 160, False, 5)):
        for xx in wrap_x(x, w):
            _hall(c, xx, w, h, ground, 800 + seed, burning)
    for xx in wrap_x(2100, 200):
        _white_tree(c, xx, ground, 330)
    rs = seeded(93)
    for k in range(40):
        x = k * 96 + rs.uniform(-10, 10)
        hgt = rs.uniform(90, 120)
        c.poly([(x - 10, ground + 10), (x - 10, ground - hgt), (x, ground - hgt - 18), (x + 10, ground - hgt),
                (x + 10, ground + 10)], (58, 42, 32), outline=STONE_OUT, ow=1.2)
    pts = [(x, ground + 6 * math.sin(x / 70)) for x in range(0, W + 1, 20)]
    c.grad_poly(pts + [(W, H), (0, H)], (206, 210, 220), (150, 150, 164), (0, 840), (0, 1000),
                outline=(110, 110, 130, 255), ow=1.0)
    img = downsample(c.img, (W, H))
    arr = np.asarray(img).astype(np.float32)
    arr[..., :3] = arr[..., :3] * 0.78 + col((120, 80, 70)) * 0.22
    return Image.fromarray(arr.astype(np.uint8), 'RGBA')


def _torch(c, x, base_y):
    c.poly([(x - 6, base_y), (x - 6, base_y - 150), (x + 6, base_y - 150), (x + 6, base_y)], (58, 40, 30),
           outline=STONE_OUT, ow=1.2)
    g = c.layer()
    g.circle((x, base_y - 170), 80, (255, 150, 60, 150), outline=None)
    c.glow(g.img, 34, 1.0)
    c.poly([(x - 14, base_y - 150), (x - 10, base_y - 178), (x - 2, base_y - 166), (x + 2, base_y - 196),
            (x + 8, base_y - 170), (x + 14, base_y - 150)], (255, 132, 36), outline=None)
    c.poly([(x - 7, base_y - 150), (x - 2, base_y - 172), (x + 4, base_y - 160), (x + 7, base_y - 150)],
           (255, 220, 130), outline=None)


def courtyard_fg():
    c = Canvas(W, H, 2)
    wall = [(0, FLOOR), (0, 828), (W, 828), (W, FLOOR)]
    c.poly(wall, (74, 70, 74), outline=STONE_OUT, ow=1.6)
    lay = c.layer()
    stone_blocks(lay, -20, 820, W + 20, FLOOR, 24, 95, (74, 70, 74))
    c.composite(lay.img, c.mask(wall))
    snow_cap(c, [(x, 828) for x in range(0, W + 1, 120)], 10, 96)
    for i, x in enumerate((240, 1200, 2160, 3120)):
        for xx in wrap_x(x, 90):
            c.poly([(xx - 5, FLOOR), (xx - 5, 650), (xx + 5, 650), (xx + 5, FLOOR)], (52, 38, 28), outline=STONE_OUT,
                   ow=1.2)
            stark_banner(c, xx, 664, 96, 138, i + 20)
    for x in KEEP_TORCHES:
        for xx in wrap_x(x, 40):
            _torch(c, xx, FLOOR)
    rs = seeded(97)
    for x in (480, 1440, 2400, 3360):          # barrels
        for xx in wrap_x(x, 60):
            for k, dx in enumerate((-30, 30)):
                c.poly([(xx + dx - 26, FLOOR), (xx + dx - 30, FLOOR - 40), (xx + dx - 26, FLOOR - 78),
                        (xx + dx + 26, FLOOR - 78), (xx + dx + 30, FLOOR - 40), (xx + dx + 26, FLOOR)],
                       (96, 66, 42), outline=STONE_OUT, ow=1.4)
                for hy in (FLOOR - 16, FLOOR - 62):
                    c.line([(xx + dx - 28, hy), (xx + dx + 28, hy)], (60, 60, 66), 3)
    c.poly([(0, FLOOR), (W, FLOOR), (W, 932), (0, 932)], (206, 210, 218), outline=STONE_OUT, ow=1.4)
    for _ in range(80):
        x = rs.uniform(0, W)
        w = rs.uniform(40, 160)
        for xx in wrap_x(x, w):
            c.ellipse((xx, FLOOR + 14), w / 2, 8, (92, 74, 62), outline=None)
    ground = [(0, 932), (W, 932), (W, H), (0, H)]
    c.poly(ground, (64, 58, 58), outline=STONE_OUT, ow=1.4)
    lay = c.layer()
    stone_blocks(lay, -20, 932, W + 20, H, 22, 98, (70, 64, 64))
    lay.poly([(0, 932), (W, 932), (W, 950), (0, 950)], (0, 0, 0, 90), outline=None)
    c.composite(lay.img, c.mask(ground))
    return downsample(c.img, (W, H))


KEEP_COVER = (('cover_broken_wall', 900), ('platform_cracked', 1700), ('cover_broken_wall', 2500),
              ('platform_cracked', 3300))


# ============================================================ Level 3 ===
# The Ice Gate: a colossal gate carved into the Wall, cold dawn light.

GATE_X = 1920
GATE_BRAZIERS = (600, 3240)


def sky_cold():
    base = vgrad([(0, (6, 12, 26)), (300, (16, 34, 58)), (620, (54, 98, 128)), (900, (140, 186, 206)),
                  (1080, (170, 206, 222))])
    rgb = np.repeat(base[:, None, :], W, axis=1)
    yy = np.arange(H, dtype=np.float32)[:, None]
    xx = np.arange(W, dtype=np.float32)[None, :]
    n1 = fbm(W, H, 6, 3, 131, 6)
    heavy = smoothstep(0.48, 0.68, n1) * smoothstep(700, 60, yy)
    lit = np.clip((n1 - np.roll(n1, 10, axis=0)) * 9, -1, 1)
    cloud = col((18, 30, 48)) + col((110, 150, 180)) * (0.3 + 0.3 * lit[..., None])
    rgb = rgb * (1 - heavy[..., None] * 0.9) + cloud * heavy[..., None] * 0.9
    # cold light pouring over the wall behind the gate, with god rays
    dx, dy = xx - GATE_X, yy - 140
    dist = np.sqrt(dx * dx + dy * dy)
    ang = np.arctan2(dy, dx)
    rays = (0.5 + 0.5 * np.sin(ang * 26 + 1.3)) * (0.5 + 0.5 * np.sin(ang * 61 + 0.4))
    rays = rays * np.exp(-dist / 900) * smoothstep(80, 260, yy)
    glow = np.exp(-(dist / 520) ** 2)
    rgb += glow[..., None] * col((120, 170, 200)) + rays[..., None] * col((90, 150, 190)) * 0.9
    return to_img(rgb)


def _ice_cluster(c, x, ground, size, seed):
    rs = seeded(seed)
    for k in range(rs.randint(4, 7)):
        h = size * rs.uniform(0.5, 1.0)
        w = size * rs.uniform(0.14, 0.24)
        bx = x + rs.uniform(-size * 0.45, size * 0.45)
        lean = rs.uniform(-0.35, 0.35) * h
        tip = (bx + lean, ground - h)
        pts = [(bx - w, ground), (bx - w * 0.6, ground - h * 0.55), tip, (bx + w * 0.7, ground - h * 0.6),
               (bx + w, ground)]
        c.grad_poly(pts, (214, 244, 255, 235), (80, 150, 200, 225), tip, (bx, ground), outline=(30, 70, 110, 255),
                    ow=1.3)
        c.poly([(bx - w * 0.3, ground - 4), (bx - w * 0.2, ground - h * 0.5), tip, (bx, ground - h * 0.45)],
               (240, 252, 255, 120), outline=None)


def gate_far():
    yy = np.arange(H, dtype=np.float32)[:, None]
    xx = np.arange(W, dtype=np.float32)[None, :]
    top = 150 + 6 * np.sin(xx / W * 2 * np.pi * 3)
    cover = np.clip(yy - top + 0.5, 0, 1)
    streak = fbm(W, H, 120, 2, 333, 4)
    big = fbm(W, H, 8, 2, 434, 3)
    ice = vgrad([(140, (200, 228, 242)), (400, (150, 196, 222)), (760, (100, 150, 186)), (1080, (80, 126, 168))])
    ice = ice[:, None, :] * (1 + (streak[..., None] - 0.5) * 0.26 + (big[..., None] - 0.5) * 0.2)
    light = np.exp(-(((xx - GATE_X) / 900) ** 2))
    ice += light[..., None] * col((40, 60, 70))
    cap = np.clip(1 - (yy - top) / 24, 0, 1)
    ice = ice * (1 - cap[..., None]) + col((236, 246, 252)) * cap[..., None]
    img = to_img(ice, cover)
    c = Canvas(W, H, 2, img=img.resize((W * 2, H * 2), Image.BICUBIC))
    for i in range(W // 26):
        x0 = i * 26
        c.poly([(x0 + 3, 152), (x0 + 3, 140), (x0 + 17, 140), (x0 + 17, 152)], (226, 240, 248),
               outline=(110, 140, 170, 255), ow=0.6)
    gx, ow_, oh_top, r = GATE_X, 320, 330, 320
    stone, stone_d = (70, 82, 100), (44, 52, 66)
    # carved frame: pillars and a ring of voussoirs
    for side in (-1, 1):
        px = gx + side * (ow_ + 70)
        pil = [(px - 70, 900), (px - 70, 360), (px - 86, 340), (px + 86, 340), (px + 70, 360), (px + 70, 900)]
        c.grad_poly(pil, stone, stone_d, (px - 70 * side, 0), (px + 70 * side, 0), outline=STONE_OUT, ow=2)
        lay = c.layer()
        stone_blocks(lay, px - 70, 340, px + 70, 900, 46, 140 + side, stone)
        c.composite(lay.img, c.mask(pil), opacity=0.55)
        g = c.layer()
        rs = seeded(150 + side)
        for k in range(9):          # glowing rune stack
            yk = 410 + k * 52
            x0 = px - 22
            pts = [(x0 + rs.uniform(0, 44), yk + rs.uniform(-14, 14)) for _ in range(4)]
            g.line(pts, (120, 220, 255, 255), 3)
        c.glow(g.img, 6, 1.4)
        c.composite(g.img)
        snow_cap(c, [(px - 88, 340), (px, 336), (px + 88, 340)], 14, 160 + side)
    cy = oh_top + r
    ring = []
    for k in range(17):
        a0 = math.pi + math.pi * k / 16
        ring.append((gx + math.cos(a0) * (r + 120), cy + math.sin(a0) * (r + 120)))
    arch = ring + [(gx + r + 120, cy), (gx + r, cy)]
    for k in range(17):
        a0 = math.pi * k / 16
        arch.append((gx + math.cos(a0) * r, cy - math.sin(a0) * r))
    arch += [(gx - r, cy)]
    c.grad_poly(arch, (86, 100, 120), stone_d, (gx, cy - r - 120), (gx, cy), outline=STONE_OUT, ow=2)
    for k in range(1, 16):
        a0 = math.pi + math.pi * k / 16
        c.line([(gx + math.cos(a0) * r, cy + math.sin(a0) * r),
                (gx + math.cos(a0) * (r + 120), cy + math.sin(a0) * (r + 120))], STONE_OUT, 2.2)
    key = [(gx - 46, cy - r - 130), (gx + 46, cy - r - 130), (gx + 30, cy - r + 8), (gx - 30, cy - r + 8)]
    c.poly(key, (100, 116, 138), outline=STONE_OUT, ow=2)
    direwolf(c, gx, cy - r - 62, 40, color=(70, 82, 100), outline=(30, 36, 46, 255))
    snow_cap(c, ring, 16, 170)
    # the doors: heavy stone leaves banded with iron, cold light in the seam
    opening = [(gx - r, 900), (gx - r, cy)] + [(gx - math.cos(math.pi * k / 16) * r, cy - math.sin(math.pi * k / 16) * r)
                                              for k in range(17)] + [(gx + r, cy), (gx + r, 900)]
    c.poly(opening, (40, 48, 62), outline=STONE_OUT, ow=1.6)
    lay = c.layer()
    for k in range(-6, 7):
        x = gx + k * 52
        lay.poly([(x - 24, 330), (x + 24, 330), (x + 24, 900), (x - 24, 900)], shade((58, 66, 80), 0.9 + 0.08 * (k % 2)),
                 outline=None)
    for y in (440, 600, 760, 870):
        lay.poly([(gx - r, y), (gx + r, y), (gx + r, y + 22), (gx - r, y + 22)], (28, 30, 36), outline=None)
        for k in range(-11, 12):
            lay.circle((gx + k * 28, y + 11), 4, (110, 116, 126), outline=None)
    c.composite(lay.img, c.mask(opening))
    g = c.layer()
    g.poly([(gx - 10, 900), (gx - 10, cy - r + 40), (gx + 10, cy - r + 40), (gx + 10, 900)], (170, 230, 255, 255),
           outline=None)
    c.glow(g.img, 26, 1.8)
    c.composite(g.img)
    c.line([(gx, cy - r + 30), (gx, 900)], (16, 18, 24), 4)
    for side in (-1, 1):                         # ring handles
        c.ring((gx + side * 70, 640), 26, (26, 28, 34), 7)
    for k in range(14):                          # icicles from the arch
        a0 = math.pi + math.pi * (k + 0.5) / 14
        x = gx + math.cos(a0) * r
        y = cy + math.sin(a0) * r
        L = 30 + 50 * seeded(180 + k).random()
        c.poly([(x - 9, y), (x + 9, y), (x, y + L)], (210, 240, 255), outline=(80, 130, 170, 255), ow=0.8)
    for x, sz, sd in ((gx - 520, 300, 190), (gx + 520, 280, 191), (gx - 360, 160, 192), (gx + 380, 170, 193),
                      (380, 220, 194), (3460, 240, 195)):
        for xx in wrap_x(x, sz):
            _ice_cluster(c, xx, 900, sz, sd)
    fog = c.layer()
    fog.poly([(0, 780), (W, 780), (W, 900), (0, 900)], (200, 226, 240, 70), outline=None)
    c.glow(fog.img, 40, 1.0)
    return downsample(c.img, (W, H))


def gate_mid():
    c = Canvas(W, H, 2)
    rs = seeded(201)
    ground = lambda x: 862 + 14 * math.sin(x / W * 2 * math.pi * 4 + 2)
    for (x, h, sd) in ((300, 300, 1), (1250, 380, 2), (2650, 330, 3), (3500, 280, 4)):
        for xx in wrap_x(x, 120):        # broken carved pillars
            pil = [(xx - 50, 880), (xx - 50, 880 - h), (xx - 20, 880 - h - 30), (xx + 14, 880 - h + 10),
                   (xx + 50, 880 - h - 18), (xx + 50, 880)]
            c.poly(pil, (74, 86, 104), outline=STONE_OUT, ow=1.6)
            lay = c.layer()
            stone_blocks(lay, xx - 50, 880 - h - 40, xx + 50, 880, 32, 210 + sd, (74, 86, 104))
            c.composite(lay.img, c.mask(pil))
            snow_cap(c, pil[1:5], 12, 220 + sd)
    for i in range(14):
        x = rs.uniform(0, W)
        hgt = rs.uniform(170, 280)
        for xx in wrap_x(x, hgt * 0.4):
            pine(c, xx, ground(x) + 10, hgt, 230 + i)
    for i, (x, sz) in enumerate(((700, 260), (1700, 200), (2300, 300), (3100, 220))):
        for xx in wrap_x(x, sz):
            _ice_cluster(c, xx, ground(x) + 12, sz, 240 + i)
    for x in (900, 2000, 3000):          # shafts of cold light
        g = c.layer()
        g.poly([(x - 60, 0), (x + 40, 0), (x + 180, 900), (x + 20, 900)], (200, 236, 255, 46), outline=None)
        c.glow(g.img, 30, 1.0)
    pts = [(x, ground(x)) for x in range(0, W + 1, 20)]
    c.grad_poly(pts + [(W, H), (0, H)], (232, 242, 250), (180, 204, 224), (0, 840), (0, 1000),
                outline=(120, 150, 180, 255), ow=1.0)
    img = downsample(c.img, (W, H))
    arr = np.asarray(img).astype(np.float32)
    arr[..., :3] = arr[..., :3] * 0.76 + col((150, 182, 210)) * 0.24
    return Image.fromarray(arr.astype(np.uint8), 'RGBA')


def gate_fg():
    c = Canvas(W, H, 2)
    rs = seeded(301)
    surf = [(x, FLOOR - 4 * math.sin(x / 90) - 3 * math.sin(x / 37)) for x in range(0, W + 1, 16)]
    c.grad_poly(surf + [(W, H), (0, H)], (240, 246, 252), (150, 178, 206), (0, FLOOR), (0, H),
                outline=(120, 150, 180, 255), ow=1.4)
    for _ in range(60):                  # drifts, frozen stones and ice shards in the snow
        x = rs.uniform(0, W)
        for xx in wrap_x(x, 60):
            k = rs.random()
            if k < 0.45:
                c.ellipse((xx, FLOOR + rs.uniform(20, 150)), rs.uniform(30, 90), rs.uniform(5, 12), (196, 214, 232),
                          outline=None)
            elif k < 0.75:
                r = rs.uniform(10, 24)
                y = FLOOR + rs.uniform(30, 160)
                c.poly([(xx - r, y), (xx - r * 0.5, y - r * 0.8), (xx + r * 0.6, y - r * 0.7), (xx + r, y)],
                       (90, 104, 124), outline=STONE_OUT, ow=1.0)
                c.poly([(xx - r * 0.6, y - r * 0.6), (xx + r * 0.5, y - r * 0.6), (xx, y - r * 0.9)],
                       (236, 244, 250), outline=None)
            else:
                h = rs.uniform(16, 40)
                c.poly([(xx - 6, FLOOR + 8), (xx + rs.uniform(-6, 6), FLOOR + 8 - h), (xx + 6, FLOOR + 8)],
                       (190, 230, 250), outline=(60, 110, 150, 255), ow=0.8)
    for i, x in enumerate((1200, 2900)):
        for xx in wrap_x(x, 90):
            c.poly([(xx - 5, FLOOR + 6), (xx - 5, 660), (xx + 5, 660), (xx + 5, FLOOR + 6)], (52, 38, 28),
                   outline=STONE_OUT, ow=1.2)
            stark_banner(c, xx, 674, 90, 130, i + 40)
    for x in GATE_BRAZIERS:
        for xx in wrap_x(x, 70):
            brazier(c, xx, FLOOR + 4)
    return downsample(c.img, (W, H))


def prop_ice_spike():
    """Indestructible cover: a cluster of thick ice crystals."""
    c = Canvas(240, 230, 2)
    _ice_cluster(c, 120, 226, 210, 260)
    return c.finish(), 224


PROPS_GATE = {
    'cover_broken_wall': prop_broken_wall,
    'cover_ice_spike': prop_ice_spike,
    'platform_cracked': prop_platform,
}
GATE_COVER = (('cover_ice_spike', 900), ('cover_broken_wall', 1800), ('platform_cracked', 2700),
              ('cover_ice_spike', 3400))


# ============================================================ Level 4 ===
# The Ashen Bridge: a thread of stone along the outside of the Wall, high
# above a sea of cloud, under an emerald storm. Burning debris lights it.

BRIDGE_FIRES = (420, 1380, 2300, 3260)


def sky_storm():
    base = vgrad([(0, (3, 7, 14)), (280, (8, 20, 30)), (600, (18, 40, 50)), (860, (34, 62, 66)),
                  (1080, (50, 78, 80))])
    rgb = np.repeat(base[:, None, :], W, axis=1)
    yy = np.arange(H, dtype=np.float32)[:, None]
    xx = np.arange(W, dtype=np.float32)[None, :]
    streak = fbm(W, H, 192, 2, 717, 3)
    for k, (yb, amp, col_) in enumerate(((210, 60, (60, 230, 140)), (330, 40, (40, 160, 120)))):
        band = yb + amp * np.sin(xx / W * 2 * np.pi * (2 + k) + k * 1.7) + 24 * np.sin(xx / W * 2 * np.pi * 7 + k)
        au = np.exp(-((yy - band) / (70 - k * 15)) ** 2) * (0.25 + 0.75 * streak) * smoothstep(720, 260, yy)
        rgb += au[..., None] * col(col_) * (1.0 - 0.35 * k)
    n1 = fbm(W, H, 6, 3, 777, 6)
    heavy = smoothstep(0.47, 0.67, n1) * smoothstep(760, 40, yy)
    lit = np.clip((n1 - np.roll(n1, 12, axis=0)) * 10, -1, 1)
    cloud = col((8, 14, 18)) + col((40, 120, 90)) * np.clip(0.2 + 0.5 * lit[..., None], 0, 1)
    rgb = rgb * (1 - heavy[..., None] * 0.88) + cloud * heavy[..., None] * 0.88
    rng = np.random.default_rng(71)
    for _ in range(500):
        x, y = int(rng.integers(0, W - 2)), int(rng.integers(0, 500))
        b = rng.uniform(0.2, 0.7) * (1 - heavy[y, x])
        rgb[y:y + 2, x:x + 2] = rgb[y:y + 2, x:x + 2] * (1 - b) + 230 * b
    return to_img(rgb)


def chasm_far():
    """Mountains far below the bridge and a sea of cloud filling the drop."""
    c = Canvas(W, H, 2)
    rs = seeded(410)
    for layer, (base, amp, color, snow) in enumerate(((700, 150, (40, 58, 70), (150, 176, 186)),
                                                      (780, 120, (26, 40, 50), (120, 150, 160)))):
        x = rs.uniform(0, 80)
        while x < W + 200:
            hw = rs.uniform(140, 260)
            py = base - amp * rs.uniform(0.3, 1.0)
            pts = [(x - hw, 1000), (x - hw * 0.5, py + (1000 - py) * 0.45 + rs.uniform(-20, 20)), (x, py),
                   (x + hw * 0.55, py + (1000 - py) * 0.4 + rs.uniform(-20, 20)), (x + hw, 1000)]
            for dx in (-W, 0, W):
                q = [(p[0] + dx, p[1]) for p in pts]
                c.poly(q, color, outline=None)
                c.poly([(q[2][0] + hw * 0.02, q[2][1]), q[3], (q[3][0] - hw * 0.3, q[3][1] + 40)],
                       shade(color, 0.7), outline=None)
                c.poly([q[2], (q[2][0] + hw * 0.16, q[2][1] + 44), (q[2][0], q[2][1] + 30),
                        (q[2][0] - hw * 0.15, q[2][1] + 46)], snow, outline=None)
            x += rs.uniform(150, 300)
    img = downsample(c.img, (W, H))
    arr = np.asarray(img).astype(np.float32)
    yy = np.arange(H, dtype=np.float32)[:, None]
    fog_n = fbm(W, H, 24, 6, 433, 4)
    fog = np.clip(smoothstep(640, 900, yy) * (0.55 + 0.6 * fog_n), 0, 1)
    fogc = col((150, 186, 190))
    a = arr[..., 3:] / 255
    rgb = arr[..., :3] * (1 - fog[..., None]) + fogc * fog[..., None]
    alpha = np.maximum(a[..., 0], fog * 0.95)
    rgb = rgb * 0.82 + col((40, 80, 80)) * 0.18
    return to_img(rgb, alpha)


def _spire(c, x, w, top, seed, fire=False):
    rs = seeded(seed)
    body = [(x - w / 2, H + 10), (x - w * 0.42, top + 40), (x - w * 0.2, top + 8), (x - w * 0.05, top - 26),
            (x + w * 0.12, top + 12), (x + w * 0.4, top + 30), (x + w / 2, H + 10)]
    c.poly(body, (34, 42, 52), outline=STONE_OUT, ow=1.6)
    lay = c.layer()
    stone_blocks(lay, x - w / 2, top - 30, x + w / 2, H + 10, 30, seed, (38, 46, 58))
    lay.poly([(x + w * 0.1, top - 30), (x + w / 2, top - 30), (x + w / 2, H + 10), (x + w * 0.1, H + 10)],
             (0, 0, 0, 90), outline=None)
    for k in range(4):
        wy = top + 90 + k * 120
        wx = x + rs.uniform(-w * 0.2, w * 0.2)
        lay.poly([(wx - 8, wy + 28), (wx - 8, wy), (wx, wy - 10), (wx + 8, wy), (wx + 8, wy + 28)],
                 (12, 14, 18), outline=None)
    c.composite(lay.img, c.mask(body))
    snow_cap(c, body[1:6], 12, seed + 1)
    for k in range(5):
        ix = x - w * 0.4 + k * w * 0.2
        c.poly([(ix - 5, top + 46), (ix + 5, top + 46), (ix, top + 46 + rs.uniform(20, 46))], (190, 228, 240),
               outline=(70, 110, 140, 255), ow=0.8)
    if fire:
        fire_pit(c, x - w * 0.05, top - 10, 0.7)


def spires_mid():
    """Ruined towers rising out of the drop, broken arches strung between."""
    c = Canvas(W, H, 2)
    spires = ((240, 150, 470, 1, False), (760, 120, 560, 2, True), (1320, 170, 420, 3, False),
              (1980, 130, 520, 4, True), (2620, 160, 450, 5, False), (3260, 140, 540, 6, True))
    for i in range(len(spires) - 1):
        (x0, w0, t0, *_), (x1, w1, t1, *_) = spires[i], spires[i + 1]
        if i % 2:
            continue
        y = max(t0, t1) + 140
        span = [(x0, y), (x1, y), (x1, y + 50), ((x0 + x1) / 2 + 40, y + 50), ((x0 + x1) / 2 + 20, y + 22),
                ((x0 + x1) / 2 - 30, y + 64), (x0, y + 50)]
        c.poly(span, (34, 42, 52), outline=STONE_OUT, ow=1.4)
        snow_cap(c, [(x0, y), ((x0 + x1) / 2, y - 2), (x1, y)], 9, 470 + i)
    for (x, w, top, sd, fire) in spires:
        for xx in wrap_x(x, w):
            _spire(c, xx, w, top, 460 + sd, fire)
    img = downsample(c.img, (W, H))
    arr = np.asarray(img).astype(np.float32)
    yy = np.arange(H, dtype=np.float32)[:, None]
    fog = smoothstep(760, 1000, yy)[..., None] * 0.6
    arr[..., :3] = arr[..., :3] * (1 - fog) + col((140, 176, 182)) * fog
    arr[..., :3] = arr[..., :3] * 0.8 + col((30, 70, 66)) * 0.2
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), 'RGBA')


def _burning_debris(c, x, y):
    rubble_pile(c, x, y, 130, int(x) + 3, base=(62, 58, 60), snow=False)
    c.poly([(x - 40, y - 8), (x + 30, y - 30), (x + 36, y - 22), (x - 34, y)], (70, 50, 34), outline=STONE_OUT, ow=1.2)
    fire_pit(c, x, y - 6, 0.75)


def bridge_fg():
    c = Canvas(W, H, 2)
    deck_b = 948
    # underside: thick arches over the void, openings left transparent
    under = [(0, deck_b - 20), (W, deck_b - 20), (W, H), (0, H)]
    c.poly(under, (48, 52, 62), outline=STONE_OUT, ow=1.6)
    lay = c.layer()
    stone_blocks(lay, -20, deck_b - 20, W + 20, H, 34, 480, (52, 56, 66))
    c.composite(lay.img, c.mask(under))
    for i in range(W // 480):
        ax = i * 480 + 240
        arch = [(ax - 150, H + 4)] + [(ax - math.cos(math.pi * k / 16) * 150, deck_b + 70 - math.sin(math.pi * k / 16) * 60)
                                      for k in range(17)] + [(ax + 150, H + 4)]
        c.poly(arch, (0, 0, 0, 0), outline=STONE_OUT, ow=1.8)
        c.d.polygon([c.P(q) for q in arch], fill=(0, 0, 0, 0))
        for k in range(14):
            ix = ax - 130 + k * 20
            iy = deck_b + 70 - 60 * math.sqrt(max(0.0, 1 - ((ix - ax) / 150) ** 2))
            c.poly([(ix - 4, iy), (ix + 4, iy), (ix, iy + 18 + (k % 3) * 10)], (190, 226, 240),
                   outline=(70, 110, 140, 255), ow=0.6)
    # deck
    deck = [(0, FLOOR), (W, FLOOR), (W, deck_b), (0, deck_b)]
    c.grad_poly(deck, (112, 112, 122), (60, 62, 72), (0, FLOOR), (0, deck_b), outline=STONE_OUT, ow=1.6)
    rs = seeded(481)
    for _ in range(26):
        crack(c, rs.uniform(20, W - 160), FLOOR + 8, 120, 482 + _, down=False, width=1.6)
    for _ in range(50):
        x = rs.uniform(0, W)
        w = rs.uniform(30, 130)
        for xx in wrap_x(x, w):
            c.ellipse((xx, FLOOR + 2), w / 2, 5, (220, 228, 236), outline=None)
    # broken parapet on the near edge (low, behind the player)
    k = 0
    x = 0
    while x < W:
        w = rs.uniform(70, 150)
        if rs.random() < 0.7:
            h = rs.uniform(40, 70)
            top = [(x, FLOOR - h + rs.uniform(-6, 6)), (x + w * 0.5, FLOOR - h + rs.uniform(-10, 4)),
                   (x + w, FLOOR - h + rs.uniform(-6, 18))]
            pc = [(x, FLOOR)] + top + [(x + w, FLOOR)]
            c.poly(pc, (80, 82, 92), outline=STONE_OUT, ow=1.4)
            lay = c.layer()
            stone_blocks(lay, x, FLOOR - 80, x + w, FLOOR, 20, 490 + k, (80, 82, 92))
            c.composite(lay.img, c.mask(pc))
            snow_cap(c, top, 8, 500 + k)
        else:
            rubble_pile(c, x + w / 2, FLOOR, w, 510 + k, base=(80, 82, 92))
        x += w + rs.uniform(20, 60)
        k += 1
    for x in BRIDGE_FIRES:
        for xx in wrap_x(x, 90):
            _burning_debris(c, xx, FLOOR + 2)
    for i, x in enumerate((900, 2780)):
        for xx in wrap_x(x, 90):
            c.poly([(xx - 5, FLOOR + 4), (xx - 5, 650), (xx + 5, 650), (xx + 5, FLOOR + 4)], (40, 30, 24),
                   outline=STONE_OUT, ow=1.2)
            stark_banner(c, xx, 664, 86, 124, i + 60, torn=True)
    return downsample(c.img, (W, H))


def prop_bridge_tower():
    """A shattered gate tower that walls off the end of the arena."""
    c = Canvas(300, 700, 2)
    body = [(30, 696), (36, 120), (70, 80), (96, 110), (130, 40), (176, 96), (214, 60), (262, 118), (268, 696)]
    c.poly(body, (62, 66, 78), outline=STONE_OUT, ow=2)
    lay = c.layer()
    stone_blocks(lay, 0, 30, 300, 700, 34, 520, (62, 66, 78))
    lay.poly([(190, 30), (300, 30), (300, 700), (190, 700)], (0, 0, 0, 80), outline=None)
    for wy in (220, 400):
        lay.poly([(132, wy + 60), (132, wy), (150, wy - 18), (168, wy), (168, wy + 60)], (12, 14, 18), outline=None)
    c.composite(lay.img, c.mask(body))
    snow_cap(c, body[1:8], 14, 521)
    for k in range(9):
        ix = 50 + k * 24
        c.poly([(ix - 5, 700 - 560), (ix + 5, 700 - 560), (ix, 700 - 520 + (k % 3) * 12)], (190, 226, 240),
               outline=(70, 110, 140, 255), ow=0.6)
    return c.finish(), 696


PROPS_BRIDGE = {
    'bridge_tower': prop_bridge_tower,
    'platform_cracked': prop_platform,
}
BRIDGE_COVER = (('bridge_tower', 300), ('platform_cracked', 1900), ('bridge_tower', 3500))
