"""The northern warrior: a 2D puppet rig (IK legs and arms) posed per frame.

Rig units: 256 x 256, facing right, ground line at y = 236. The exported
frame is larger (W x H) with the rig offset by ORIGIN, so long weapons
(greatsword, spear) are never clipped at the frame edge.
"""
import math

from PIL import Image

from . import weapons
from .common import (Canvas, Frame, OUTLINE, add, ang_of, dirv, ease, ik2, mix, mul, norm,
                     paste_rotated, perp, rgba, ribbon_edges, rim_light, rotate_point, seeded, shade, sub)

RIG = 256
ORIGIN = (24, 16)
W, H = 336, 272
GROUND = 236
PIVOT = (128 + ORIGIN[0], GROUND + ORIGIN[1])
SS = 4

THIGH, SHIN = 40, 39
UPPER, FORE = 27, 25

# Northern brother look: black leathers, a heavy black fur cloak and mantle,
# dark curls tied back and a short beard.
C = dict(
    skin=(220, 180, 152), skin_d=(176, 132, 108),
    hair=(20, 16, 16), beard=(28, 22, 20),
    cloak_t=(30, 28, 30), cloak_b=(14, 13, 15), cloak_fur=(58, 56, 60), cloak_dark=(8, 8, 10),
    fur=(46, 44, 46), fur_l=(104, 100, 104), fur_d=(20, 19, 21),
    steel=(54, 50, 52), steel_l=(104, 98, 100), steel_d=(28, 26, 28),
    mail=(40, 40, 46), mail_d=(24, 24, 30),
    leather=(46, 36, 32), leather_d=(26, 20, 18), glove=(34, 28, 26),
    cloth=(28, 26, 28), boot=(32, 26, 24), brass=(132, 128, 120),
)

BASE = dict(hip=(124, 153), lean=4, head=0, ff=(142, 230), bf=(104, 230),
            fh=(150, 142), bh=(140, 146), wa=150, cloak=8, wave=0.0)


def P(**kw):
    p = dict(BASE)
    p.update(kw)
    return p


# ------------------------------------------------------------ body parts --

def draw_cloak(c, torso, pose):
    top = torso(-4, 47)
    f = pose['cloak']
    wave = pose.get('wave', 0.0)
    n, L = 12, 88
    pts, widths, dirs = [top], [20], []
    for k in range(n):
        s = k / (n - 1)
        a = -(f * (0.35 + 0.65 * s)) + math.sin(wave + s * 2.6) * 7 * (0.3 + s)
        d = dirv(a)
        dirs.append(d)
        pts.append(add(pts[-1], mul(d, L / n)))
        widths.append(20 + 26 * s)
    a_side, b_side, normals = ribbon_edges(pts, widths)
    d_end = dirs[-1]
    hem = []
    for j in range(1, 8):
        q = add(mul(a_side[-1], 1 - j / 8), mul(b_side[-1], j / 8))
        hem.append(add(q, mul(d_end, 4.5 if j % 2 else -1.5)))
    poly = a_side + hem + b_side[::-1]
    c.grad_poly(poly, C['cloak_t'], C['cloak_b'], top, pts[-1], ow=1.0)
    rng = seeded(11)
    for _ in range(80):
        u, v = rng.uniform(0.15, 0.85), rng.uniform(0.06, 0.93)
        i = min(len(pts) - 2, int(v * (len(pts) - 1)))
        t = v * (len(pts) - 1) - i
        base = add(mul(pts[i], 1 - t), mul(pts[i + 1], t))
        w = widths[i] * (1 - t) + widths[i + 1] * t
        q = add(base, mul(normals[i], (u - 0.5) * w))
        d = dirs[min(i, len(dirs) - 1)]
        col = C['cloak_fur'] if rng.random() < 0.6 else C['cloak_dark']
        c.line([q, add(q, mul(d, rng.uniform(3, 6)))], col, 0.7)


def foot_dir(knee, ankle, override):
    if override is not None:
        return override
    shin_a = ang_of(sub(ankle, knee))
    if ankle[1] > GROUND - 14 and abs(shin_a) < 50:
        return 90
    return shin_a + 90


def draw_leg(c, hip, target, dark, fdir=None):
    k = lambda col: shade(col, dark)
    knee, ankle = ik2(hip, target, THIGH, SHIN, prefer=(1, -0.15))
    d = norm(sub(ankle, knee))
    fwd = mul(perp(d), -1)
    # thigh
    c.capsule(hip, knee, 8.2, 6.2, k(C['cloth']))
    c.highlight(hip, knee, 8.2, 6.2, k(shade(C['cloth'], 1.35)))
    # boot shaft
    c.capsule(knee, ankle, 5.8, 4.8, k(C['boot']))
    # steel greave on the front of the shin
    g0 = add(add(knee, mul(d, 6)), mul(fwd, 2.0))
    g1 = add(add(ankle, mul(d, -5)), mul(fwd, 1.8))
    c.capsule(g0, g1, 3.4, 2.8, k(C['steel']), ow=0.7)
    c.highlight(g0, g1, 3.4, 2.8, k(C['steel_l']))
    # foot
    fd = dirv(foot_dir(knee, ankle, fdir))
    up = mul(perp(fd), -1)
    F = lambda x, y: add(add(ankle, mul(fd, x)), mul(up, y))
    foot = [F(-5, 4), F(-6, -2), F(-4.6, -6), F(12, -6), F(14.2, -4), F(13, -0.6), F(6, 2.6), F(2, 5)]
    c.poly(foot, k(C['boot']), ow=0.9)
    c.line([F(-4.4, -5.2), F(12.4, -5.2)], k(C['leather_d']), 1.2)
    # fur cuff + knee cop
    c0 = add(knee, mul(d, 5.5))
    c.capsule(c0, add(c0, mul(d, 3.5)), 6.8, 6.4, k(C['fur']), ow=0.8)
    c.circle(knee, 4.6, k(C['steel']), ow=0.8)
    c.circle(add(knee, (-1.2, -1.4)), 1.6, k(C['steel_l']), outline=None)
    return knee, ankle


def draw_arm_upper(c, shoulder, elbow, dark, pauldron):
    k = lambda col: shade(col, dark)
    c.capsule(shoulder, elbow, 5.6, 4.6, k(C['mail']))
    if pauldron:
        d = norm(sub(elbow, shoulder))
        n = perp(d)
        Q = lambda a, b: add(add(shoulder, mul(d, a)), mul(n, b))
        lame = [Q(3, -8.4), Q(10, -7.4), Q(13.4, 0), Q(10, 7.4), Q(3, 8.4)]
        c.poly(lame, k(C['steel_d']), ow=0.8)
        plate = [Q(-7, -8.5), Q(-8.5, 0), Q(-7, 8.5), Q(2, 10), Q(8.6, 8), Q(9.6, 0), Q(8.6, -8),
                 Q(2, -10)]
        c.grad_poly(plate, k(C['steel_l']), k(C['steel_d']), Q(-6, 0), Q(9, 0), ow=0.9)
        c.line([Q(-4, -6), Q(-5.5, 0), Q(-4, 6)], k((110, 104, 106)), 0.8)


def draw_forearm(c, elbow, hand, dark):
    k = lambda col: shade(col, dark)
    c.capsule(elbow, hand, 4.6, 3.9, k(C['steel']))
    c.highlight(elbow, hand, 4.6, 3.9, k(C['steel_l']))
    c.circle(elbow, 3.8, k(C['steel_d']), ow=0.7)


def draw_fist(c, hand, toward, dark):
    k = lambda col: shade(col, dark)
    c.circle(hand, 4.4, k(C['glove']), ow=0.9)
    d = norm(toward)
    c.line([add(hand, mul(perp(d), -2.6)), add(hand, mul(perp(d), 2.6))], k(C['leather_d']), 0.8)


def draw_torso(c, T):
    base = T.pts([(-11, -4), (10, -4), (12, 10), (14, 24), (15, 36), (12, 45), (4, 51), (-6, 51),
                  (-13, 44), (-14, 30), (-12, 14)])
    c.poly(base, C['mail'], ow=1.0)
    plate = T.pts([(-10, 12), (11, 12), (13.5, 24), (15, 35), (12, 44), (5, 49), (-6, 49),
                   (-12, 43), (-13, 30), (-11, 18)])
    c.grad_poly(plate, C['steel_l'], C['steel_d'], T(4, 46), T(-6, 12), ow=1.0)
    c.line(T.pts([(9, 15), (12, 26), (13, 35), (10.5, 42)]), (96, 92, 94), 1.0)
    for k in range(5):   # rivets on the leather jerkin
        c.circle(T(-6 + k * 4, 44 - k * 0.6), 0.9, (140, 134, 128), outline=None)
    c.line(T.pts([(-11, 40), (12, 18)]), C['leather_d'], 2.2)   # baldric
    for y in (16.5, 20.5):
        c.line(T.pts([(-11.6, y), (11.6, y + 0.5)]), C['steel_d'], 0.7)
    belt = T.pts([(-12.4, 3), (11, 3), (11.8, 10), (-12.9, 10)])
    c.poly(belt, C['leather_d'], ow=0.9)
    c.poly(T.pts([(7.4, 4.2), (11.6, 4.2), (12, 8.8), (7.6, 8.8)]), C['brass'], ow=0.6)


def draw_skirt(c, T):
    mail = T.pts([(-13, 4), (11, 4), (14, -18), (2, -20.5), (-14, -19)])
    c.poly(mail, C['mail'], ow=0.9)
    for row in range(4):
        y = 1 - row * 5
        for i in range(6):
            x = -11 + i * 4.4 + (row % 2) * 2.2
            c.line(T.pts([(x, y), (x + 1.6, y - 1.6)]), C['mail_d'], 0.6)
    for strip in ([(-13, 4), (-6.5, 4), (-7.4, -14.6), (-10.6, -15.8), (-14.6, -13.4)],
                  [(-6, 4), (0.6, 4), (0.4, -16.2), (-3, -17.4), (-6.8, -15.6)]):
        c.poly(T.pts(strip), shade(C['leather'], 0.82), ow=0.9)
    for strip in ([(1, 4), (6.6, 4), (8, -15.4), (4.6, -17), (1.6, -15.8)],
                  [(6.8, 4), (11.6, 4), (14.8, -13.2), (11.6, -15), (8.4, -14.6)]):
        c.poly(T.pts(strip), C['leather'], ow=0.9)
        c.line(T.pts([(strip[0][0] + 1.4, 2.4), (strip[2][0] - 0.6, -12.6)]), C['brass'], 0.5)


def draw_mantle(c, T):
    blobs = [(-13, 38, 7), (-11, 45, 8.6), (-5, 50, 9.2), (3, 50.5, 8), (9, 46, 6.4), (-8, 41, 7)]
    for (x, y, r) in blobs:
        c.circle(T(x, y), r + 0.4, OUTLINE, outline=None)
        for t in range(10):
            a = t * 36 + (x * 7 % 30)
            q = T(x + math.cos(math.radians(a)) * r, y + math.sin(math.radians(a)) * r)
            c.circle(q, 1.6, OUTLINE, outline=None)
    for (x, y, r) in blobs:
        c.circle(T(x, y), r - 0.5, C['fur'], outline=None)
        for t in range(10):
            a = t * 36 + (x * 7 % 30)
            q = T(x + math.cos(math.radians(a)) * (r - 0.9), y + math.sin(math.radians(a)) * (r - 0.9))
            c.circle(q, 1.2, C['fur'], outline=None)
    rng = seeded(5)
    for _ in range(40):
        bx, by, br = rng.choice(blobs)
        a = rng.uniform(0, 2 * math.pi)
        r0 = rng.uniform(0.2, 0.8) * br
        q0 = T(bx + math.cos(a) * r0, by + math.sin(a) * r0)
        q1 = T(bx + math.cos(a) * (r0 + 3), by + math.sin(a) * (r0 + 3))
        c.line([q0, q1], C['fur_l'] if rng.random() < 0.55 else C['fur_d'], 0.7)


def draw_head(c, Hf):
    if C.get('long_hair'):           # straight hair falling past the shoulders
        c.poly(Hf.pts([(-11, -26), (-15, -6), (-13.5, 8), (-11.5, 16), (-4, 22), (3, 23), (9, 20), (11, 14),
                       (6, 15), (-1, 13), (-3, 4), (-5, -24)]), C['hair'], ow=0.9)
        for k in range(5):
            c.line(Hf.pts([(-12 + k * 1.6, 14), (-13 + k * 1.8, -22)]), shade(C['hair'], 0.82), 0.5)
    else:
        c.poly(Hf.pts([(-11, -9), (-13.5, 4), (-11.5, 16), (-4, 22), (3, 23), (9, 20), (11, 14),
                       (6, 15), (-1, 13), (-3, 6), (-6, -10)]), C['hair'], ow=0.9)
        for (hx, hy) in ((-13, 0), (-13.5, 7), (-12, 13), (-8.5, 18), (-12, -6), (-9, -9.5), (-3, 21), (4, 22)):
            c.circle(Hf(hx, hy), 2.8, C['hair'], ow=0.6)          # curls
    c.circle(Hf(1, 10), 9.4, C['skin'], ow=0.9)
    c.poly(Hf.pts([(3, 18), (9, 15.6), (11, 12.6), (11.4, 10), (14.2, 6.8), (11.8, 5.4),
                   (11.4, 3.4), (9, 0), (2, -2), (-2, 3)]), C['skin'], ow=0.9)
    c.circle(Hf(1, 10), 9.4, C['skin'], outline=None)
    # fringe / top hair, covering the back of the skull
    c.poly(Hf.pts([(-10, 3), (-10.6, 12), (-8, 18), (-1.5, 21.6), (6, 20.8), (10.6, 16.8), (11.2, 13.6),
                   (7, 15.6), (2, 15.2), (-1.2, 13.2), (-2.6, 9), (-3.4, 3)]), C['hair'], ow=0.8)
    c.ellipse(Hf(-0.6, 8.4), 1.5, 2.3, C['skin_d'], ow=0.5)
    # beard + moustache
    if C.get('beard'):
        c.poly(Hf.pts([(-3, 7), (-1.2, 1), (2, -4), (7, -5.8), (11, -3.4), (12.6, 1), (12.4, 4.8),
                       (10.4, 5.6), (9.4, 4.2), (7, 4.8), (4.4, 6.8), (1.2, 6.4)]), C['beard'], ow=0.8)
        c.line(Hf.pts([(12.4, 5.2), (9, 5.0), (8, 3.6)]), C['beard'], 1.3)
        c.line(Hf.pts([(10.2, -1.8), (8.4, 2.4)]), shade(C['beard'], 1.4), 0.5)
    # eye and brow
    if C.get('eyepatch'):
        c.line(Hf.pts([(-9, 15), (2, 15.4), (11, 12.6)]), (14, 12, 14), 0.9)
        c.ellipse(Hf(8.6, 11), 2.4, 2.0, (16, 14, 18), ow=0.5)
    else:
        c.ellipse(Hf(8.6, 11), 1.1, 0.95, (20, 16, 16), outline=None)
    c.line(Hf.pts([(6.6, 13.2), (10.8, 12.6)]), C['hair'], 1.3)
    c.line(Hf.pts([(13.2, 7.4), (11.6, 7.2)]), C['skin_d'], 0.5)
    if C.get('crown'):
        band = [(-10.4, 15.4), (-9.6, 20.6), (0, 22.4), (9.6, 20.4), (11.2, 15.6), (0, 17.4)]
        c.poly(Hf.pts(band), C['crown'], ow=0.8)
        for (x, y) in ((-8.4, 20.4), (-4.2, 21.8), (0.4, 22.6), (4.8, 21.8), (9.0, 20.2)):
            c.poly(Hf.pts([(x - 1.6, y - 0.6), (x, y + 5.4), (x + 1.6, y - 0.6)]), C['crown'], ow=0.7)
        for x in (-5.4, 0.2, 5.8):
            c.circle(Hf(x, 18.8), 1.25, (196, 24, 32), ow=0.4)
        c.line(Hf.pts([(-9.6, 19.4), (0, 21.2), (9.4, 19.2)]), shade(C['crown'], 1.6), 0.4)


# ------------------------------------------------------------ rendering --

AEMOND = dict(
    skin=(232, 206, 190), skin_d=(186, 152, 138), hair=(226, 226, 232), beard=None,
    cloak_t=(26, 22, 26), cloak_b=(10, 9, 11), cloak_fur=(96, 18, 24), cloak_dark=(6, 6, 8),
    fur=(30, 28, 32), fur_l=(70, 66, 72), fur_d=(12, 12, 14),
    steel=(40, 40, 46), steel_l=(104, 106, 118), steel_d=(20, 20, 24),
    mail=(30, 30, 36), mail_d=(16, 16, 20), leather=(36, 26, 26), leather_d=(18, 14, 14), glove=(22, 20, 22),
    cloth=(24, 22, 26), boot=(20, 18, 18), brass=(150, 34, 34), long_hair=True, eyepatch=True,
)


def render(pose, weapon='steel_sword', out=None, palette=None, lighting=True):
    """Render one pose. `out` = output width in px (height follows W:H)."""
    saved = dict(C)
    if palette:
        C.update(palette)
    try:
        return _render(pose, weapon, out or W, lighting)
    finally:
        C.clear()
        C.update(saved)


def _render(pose, weapon, out, lighting):
    ss = SS * out / W
    c = Canvas(W, H, ss, origin=ORIGIN)
    hip = pose['hip']
    T = Frame(hip, pose['lean'])
    Hf = T.sub((3, 54), pose.get('head', 0))
    sh_f, sh_b = T(-1, 43), T(-3.5, 43.5)

    free = pose.get('weapon_free')
    if weapon and free:
        img, anchor = weapons.render(weapon, ss)
        paste_rotated(c.img, img, anchor, c.P(free[0]), free[1] - 180)

    draw_cloak(c, T, pose)

    # back arm + leg (far side, darker)
    be, bh = ik2(sh_b, pose['bh'], UPPER, FORE, prefer=pose.get('be_pref', (-0.4, 1)))
    draw_arm_upper(c, sh_b, be, 0.62, False)
    draw_forearm(c, be, bh, 0.62)
    dual = weapon and not free and weapons.WEAPONS[weapon].get('dual')
    wa2 = pose.get('wa2', pose['wa'])
    if dual:                                  # the second dagger, in the far hand
        img2, anchor2 = weapons.render(weapon, ss)
        r, g, b, a = img2.split()
        dark = Image.merge('RGBA', [ch.point(lambda v: int(v * 0.7)) for ch in (r, g, b)] + [a])
        paste_rotated(c.img, dark, anchor2, c.P(bh), wa2 - 180)
    draw_fist(c, bh, sub(bh, be), 0.62)
    draw_leg(c, T(-2, 0), pose['bf'], 0.62, pose.get('bfd'))

    draw_torso(c, T)
    draw_leg(c, T(2, 0), pose['ff'], 1.0, pose.get('ffd'))
    draw_skirt(c, T)
    c.capsule(T(2, 45), T(3, 55), 4.8, 4.4, C['skin_d'])
    draw_mantle(c, T)
    draw_head(c, Hf)

    fe, fh = ik2(sh_f, pose['fh'], UPPER, FORE, prefer=pose.get('fe_pref', (-0.4, 1)))
    draw_arm_upper(c, sh_f, fe, 1.0, True)
    draw_forearm(c, fe, fh, 1.0)
    if weapon and not free:
        img, anchor = weapons.render(weapon, ss)
        paste_rotated(c.img, img, anchor, c.P(fh), pose['wa'] - 180)
    draw_fist(c, fh, sub(fh, fe), 1.0)

    wa = pose['wa']
    rot = pose.get('rot')
    if rot:
        center = pose['rot_center']
        c.img = c.img.rotate(rot, resample=Image.BICUBIC, center=c.P(center))
        fh = rotate_point(fh, center, rot)
        bh = rotate_point(bh, center, rot)
        wa = wa + rot
        wa2 = wa2 + rot

    img = c.finish((out, round(out * H / W)))
    if lighting:
        img = rim_light(img, px=max(1, round(out / W * 2)), top_k=0.5, bottom_k=0.32)
    s = out / W
    o = lambda p: [round((p[0] + ORIGIN[0]) * s, 1), round((p[1] + ORIGIN[1]) * s, 1)]
    shoulder = rotate_point(sh_f, pose['rot_center'], rot) if rot else sh_f
    meta = {'hand': o(fh), 'weapon_angle': round(wa % 360, 1), 'shoulder': o(shoulder)}
    if weapon and not free:
        meta['weapon_tip'] = o(add(fh, mul(dirv(wa), weapons.tip_distance(weapon))))
        if dual:
            meta['hand2'] = o(bh)
            meta['weapon_tip2'] = o(add(bh, mul(dirv(wa2), weapons.tip_distance(weapon))))
    return img, meta


# ------------------------------------------------------------ animations --

def anim_idle():
    out = []
    for i in range(6):
        t = i / 6
        b = math.sin(2 * math.pi * t)
        out.append(P(hip=(124, 153 + 1.2 * b), lean=4 + 0.6 * b,
                     fh=(150, 142 + 1.6 * b), bh=(141, 146 + 1.6 * b), wa=150 + 2 * b,
                     cloak=8 + 3 * math.sin(2 * math.pi * t + 1), wave=2 * math.pi * t))
    return out


def _run_foot(p, hx):
    p %= 1.0
    if p < 0.5:
        s = p / 0.5
        return (hx + 24 - 46 * s, 230)
    s = (p - 0.5) / 0.5
    x = hx - 22 + 48 * ease(s)
    y = 230 - 30 * math.sin(math.pi * s) ** 0.8 - 8 * math.sin(math.pi * min(1, s * 1.8))
    return (x, y)


def anim_run():
    out = []
    for i in range(8):
        p = i / 8
        hx = 126
        sw = math.cos(2 * math.pi * p)
        out.append(P(hip=(hx, 150 + 3 * math.cos(4 * math.pi * p)), lean=15, head=-7,
                     ff=_run_foot(p, hx), bf=_run_foot(p + 0.5, hx),
                     fh=(134 - 13 * sw, 152 - 4 * abs(sw)), bh=(128 + 13 * sw, 148),
                     wa=222 + 10 * sw, cloak=58 + 6 * math.sin(4 * math.pi * p),
                     wave=2 * math.pi * p * 2))
    return out


def anim_jump():
    return [
        P(hip=(124, 170), lean=18, head=-8, ff=(146, 230), bf=(104, 230), fh=(152, 162),
          bh=(140, 166), wa=120, cloak=16),
        P(hip=(126, 146), lean=8, ff=(136, 222), bf=(112, 230), fh=(150, 116), bh=(138, 128),
          wa=166, cloak=-4, wave=1.0, ffd=40, bfd=30),
        P(hip=(126, 140), lean=4, ff=(148, 196), bf=(112, 206), fh=(154, 118), bh=(140, 124),
          wa=172, cloak=22, wave=2.0),
        P(hip=(126, 138), lean=6, head=-4, ff=(150, 184), bf=(116, 194), fh=(148, 110),
          bh=(138, 118), wa=192, cloak=56, wave=3.0),
        P(hip=(126, 142), lean=4, ff=(142, 212), bf=(110, 216), fh=(152, 128), bh=(140, 132),
          wa=160, cloak=118, wave=4.0),
        P(hip=(124, 168), lean=16, head=-8, ff=(146, 230), bf=(102, 230), fh=(152, 158),
          bh=(140, 162), wa=126, cloak=30, wave=5.0),
    ]


def anim_attack():
    return [
        P(hip=(122, 155), lean=-2, ff=(140, 230), bf=(102, 230), fh=(130, 102), bh=(124, 110),
          wa=205, cloak=10, fe_pref=(0.6, 0.3)),
        P(hip=(120, 156), lean=-6, head=-4, ff=(140, 230), bf=(100, 230), fh=(116, 94),
          bh=(114, 102), wa=246, cloak=14, wave=0.6, fe_pref=(0.8, -0.2), be_pref=(0.8, -0.2)),
        P(hip=(127, 157), lean=8, ff=(148, 230), bf=(102, 230), fh=(148, 98), bh=(138, 106),
          wa=168, cloak=26, wave=1.2, fe_pref=(0.2, 1)),
        P(hip=(134, 160), lean=22, head=-10, ff=(164, 230), bf=(100, 230), fh=(174, 132),
          bh=(158, 138), wa=100, cloak=42, wave=1.8),
        P(hip=(136, 162), lean=26, head=-12, ff=(166, 230), bf=(100, 230), fh=(166, 168),
          bh=(152, 168), wa=52, cloak=38, wave=2.4),
        P(hip=(130, 158), lean=14, head=-4, ff=(154, 230), bf=(102, 230), fh=(156, 150),
          bh=(144, 152), wa=112, cloak=24, wave=3.0),
        P(wave=3.6, cloak=12),
    ]


def anim_dodge():
    tuck = dict(hip=(130, 196), lean=66, head=-18, ff=(150, 198), bf=(142, 204), fh=(150, 184),
                bh=(146, 190), wa=70, cloak=36, rot_center=(132, 186))
    frames = [P(hip=(122, 172), lean=42, head=-22, ff=(148, 230), bf=(100, 230), fh=(156, 182),
                bh=(146, 186), wa=100, cloak=30)]
    for k, r in enumerate((-70, -150, -230, -310)):
        frames.append(P(rot=r, wave=k * 1.3, **tuck))
    frames += [
        P(hip=(130, 172), lean=36, head=-18, ff=(152, 230), bf=(108, 230), fh=(160, 176),
          bh=(148, 180), wa=106, cloak=42, wave=5.0),
        P(hip=(126, 160), lean=16, head=-6, ff=(146, 230), bf=(104, 230), fh=(152, 150),
          bh=(140, 154), wa=136, cloak=24, wave=6.0),
    ]
    return frames


def anim_hurt():
    return [
        P(hip=(116, 152), lean=-16, head=-16, ff=(138, 230), bf=(100, 230), fh=(140, 128),
          bh=(124, 140), wa=204, cloak=-18, wave=1.0),
        P(hip=(114, 155), lean=-10, head=-8, ff=(136, 230), bf=(94, 230), fh=(142, 136),
          bh=(128, 144), wa=178, cloak=-6, wave=2.0),
        P(hip=(120, 155), lean=-2, ff=(140, 230), bf=(100, 230), fh=(148, 140), bh=(136, 146),
          wa=160, cloak=4, wave=3.0),
        P(wave=4.0),
    ]


def anim_death():
    sword_on_ground = ((168, 225), 92)
    return [
        P(hip=(118, 152), lean=-20, head=-18, ff=(138, 230), bf=(100, 230), fh=(142, 124),
          bh=(122, 136), wa=212, cloak=-20, wave=1.0),
        P(hip=(114, 158), lean=-8, head=6, ff=(132, 230), bf=(92, 230), fh=(138, 162),
          bh=(122, 162), wa=40, cloak=-4, wave=2.0),
        P(hip=(118, 178), lean=14, head=20, ff=(146, 230), bf=(100, 230), fh=(142, 188),
          bh=(128, 186), wa=16, cloak=6, wave=3.0),
        P(hip=(120, 192), lean=22, head=28, ff=(150, 230), bf=(86, 232), fh=(148, 214),
          bh=(132, 210), wa=8, cloak=10, wave=4.0),
        P(hip=(122, 200), lean=52, head=20, ff=(148, 230), bf=(82, 232), fh=(158, 208),
          bh=(140, 208), cloak=30, wave=5.0, weapon_free=sword_on_ground),
        P(hip=(118, 214), lean=74, head=12, ff=(68, 230), bf=(62, 232), fh=(180, 226),
          bh=(162, 228), cloak=60, wave=6.0, weapon_free=sword_on_ground),
        P(hip=(110, 222), lean=90, head=4, ff=(46, 231), bf=(40, 233), fh=(192, 231),
          bh=(172, 233), cloak=84, wave=7.0, weapon_free=sword_on_ground),
        P(hip=(110, 222), lean=90, head=8, ff=(46, 231), bf=(40, 233), fh=(192, 231),
          bh=(172, 233), cloak=92, wave=7.6, weapon_free=sword_on_ground),
    ]


ANIMS = {
    'idle': (anim_idle, 8, True),
    'run': (anim_run, 12, True),
    'jump': (anim_jump, 10, False),
    'attack': (anim_attack, 14, False),
    'dodge': (anim_dodge, 14, False),
    'hurt': (anim_hurt, 10, False),
    'death': (anim_death, 8, False),
}


# ------------------------------------------------------------ weapon styles
# Extra attack animations, rendered only for the weapons that use them.

def two_hand(fh, wa, gap=10):
    """Back-hand position lower on the same grip (two-handed weapons)."""
    return add(fh, mul(dirv(wa + 180), gap))


def anim_heavy():
    """Two-handed overhead smash: lift, apex, a slow fall and a long recovery."""
    keys = [
        dict(hip=(122, 156), lean=2, fh=(140, 122), wa=170, cloak=10),
        dict(hip=(120, 158), lean=-6, head=-6, fh=(128, 96), wa=206, cloak=14, wave=0.5,
             fe_pref=(0.8, -0.2), be_pref=(0.8, -0.2)),
        dict(hip=(118, 160), lean=-12, head=-10, fh=(120, 86), wa=232, cloak=18, wave=1.0,
             fe_pref=(0.8, -0.2), be_pref=(0.8, -0.2)),
        dict(hip=(128, 160), lean=10, head=-4, ff=(150, 230), fh=(152, 98), wa=150, cloak=26, wave=1.5),
        dict(hip=(138, 166), lean=30, head=-14, ff=(170, 230), bf=(100, 230), fh=(178, 150), wa=80, cloak=40,
             wave=2.0),
        dict(hip=(140, 170), lean=36, head=-16, ff=(172, 230), bf=(100, 230), fh=(174, 192), wa=52, cloak=44,
             wave=2.5),
        dict(hip=(134, 166), lean=24, head=-8, ff=(162, 230), fh=(162, 168), wa=66, cloak=30, wave=3.0),
        dict(hip=(126, 158), lean=8, fh=(146, 132), wa=140, cloak=16, wave=3.5),
    ]
    return [P(bh=two_hand(k['fh'], k['wa']), **k) for k in keys]


def anim_thrust():
    """Spear: guard, draw back, a full-length thrust, hold, retract."""
    keys = [
        dict(hip=(122, 156), lean=4, fh=(146, 140), wa=96, cloak=10),
        dict(hip=(116, 157), lean=-6, head=-2, fh=(130, 136), wa=94, cloak=6, wave=0.6),
        dict(hip=(136, 160), lean=22, head=-8, ff=(170, 230), fh=(178, 130), wa=90, cloak=34, wave=1.2),
        dict(hip=(140, 161), lean=26, head=-10, ff=(172, 230), fh=(186, 128), wa=90, cloak=40, wave=1.8),
        dict(hip=(130, 158), lean=12, head=-4, ff=(156, 230), fh=(160, 134), wa=93, cloak=24, wave=2.4),
        dict(hip=(124, 156), lean=6, fh=(148, 140), wa=96, cloak=12, wave=3.0),
    ]
    return [P(bh=two_hand(k['fh'], k['wa'], 20), **k) for k in keys]


def anim_daggers():
    """Twin daggers: front-hand stab, then the off-hand stab, fast."""
    return [
        P(hip=(122, 158), lean=10, fh=(146, 140), bh=(136, 146), wa=110, wa2=120, cloak=12),
        P(hip=(130, 160), lean=22, head=-8, ff=(160, 230), fh=(180, 136), bh=(134, 152), wa=92, wa2=136, cloak=30,
          wave=0.6),
        P(hip=(128, 159), lean=14, head=-4, fh=(156, 144), bh=(150, 140), wa=112, wa2=112, cloak=22, wave=1.2),
        P(hip=(132, 160), lean=24, head=-10, ff=(162, 230), fh=(148, 152), bh=(178, 132), wa=134, wa2=90, cloak=34,
          wave=1.8),
        P(hip=(128, 158), lean=14, head=-4, fh=(160, 128), bh=(152, 146), wa=140, wa2=118, cloak=22, wave=2.4),
        P(hip=(123, 157), lean=8, fh=(148, 140), bh=(138, 146), wa=112, wa2=122, cloak=12, wave=3.0),
    ]


def anim_shoot():
    """Crossbow: raise to the shoulder, aim level, loose (recoil), lower."""
    return [
        P(hip=(122, 154), lean=2, fh=(150, 126), bh=(146, 132), wa=120, cloak=8),
        P(hip=(120, 155), lean=-2, head=2, fh=(150, 110), bh=(168, 114), wa=90, cloak=8, wave=0.5),
        P(hip=(118, 155), lean=-7, head=4, fh=(145, 108), bh=(163, 112), wa=97, cloak=4, wave=1.0),
        P(hip=(121, 155), lean=0, fh=(150, 120), bh=(156, 126), wa=112, cloak=8, wave=1.5),
    ]


def anim_reload():
    """Crossbow pointed at the ground, the string hauled back by hand."""
    out = []
    for k in range(6):
        t = k / 5
        pull = math.sin(math.pi * min(1, t * 1.25))
        out.append(P(hip=(124, 160), lean=20, head=-14, ff=(150, 230), fh=(152, 150), wa=24,
                     bh=(160 - 18 * pull, 190 - 52 * pull), cloak=14 + 6 * t, wave=t * 4))
    return out


STYLE_ANIMS = {
    'heavy': {'heavy': (anim_heavy, 11, False)},
    'spear': {'thrust': (anim_thrust, 13, False)},
    'daggers': {'daggers': (anim_daggers, 17, False)},
    'crossbow': {'shoot': (anim_shoot, 10, False), 'reload': (anim_reload, 6, False)},
}

# Which style each weapon fights with ('sword' = the shared attack animation).
STYLE = {'greatsword': 'heavy', 'war_hammer': 'heavy', 'long_spear': 'spear', 'twin_daggers': 'daggers',
         'hunters_crossbow': 'crossbow'}


# ------------------------------------------------------------ Frostpiercer -
# Level 7: the warrior swings the launcher from his back onto his shoulder,
# aims it (the engine rotates the launcher), takes the recoil and reloads
# a spear from the quiver on his back. Rendered for the 'unarmed' sheet
# (the sword is sheathed while the launcher is out).

SHOULDER_GRIP = dict(fh=(156, 128), bh=(146, 140), wa=90)


def anim_deploy():
    keys = [
        dict(hip=(124, 154), lean=4, fh=(150, 142), bh=(141, 146), cloak=8),
        dict(hip=(122, 155), lean=-4, head=4, fh=(126, 96), bh=(136, 140), cloak=10, wave=0.6,
             fe_pref=(0.8, -0.2)),
        dict(hip=(120, 156), lean=-8, head=6, fh=(110, 100), bh=(118, 104), cloak=12, wave=1.2,
             fe_pref=(0.8, -0.2), be_pref=(0.8, -0.2)),
        dict(hip=(122, 157), lean=-2, head=2, fh=(140, 112), bh=(128, 118), cloak=10, wave=1.8),
        dict(hip=(124, 158), lean=2, fh=(156, 128), bh=(146, 140), cloak=8, wave=2.4),
    ]
    return [P(wa=90, ff=(150, 230), bf=(100, 230), **k) for k in keys]


def anim_aim():
    out = []
    for i in range(4):
        b = math.sin(2 * math.pi * i / 4)
        out.append(P(hip=(124, 158 + 0.8 * b), lean=2, ff=(152, 230), bf=(98, 230),
                     fh=(156, 128 + 0.8 * b), bh=(146, 140 + 0.8 * b), wa=90, cloak=8 + 2 * b, wave=i * 1.5))
    return out


def anim_pfire():
    return [
        P(hip=(118, 160), lean=-10, head=6, ff=(150, 230), bf=(92, 230), fh=(148, 130), bh=(138, 142), wa=90,
          cloak=-6, wave=0.5),
        P(hip=(116, 160), lean=-12, head=8, ff=(150, 230), bf=(90, 230), fh=(146, 132), bh=(136, 144), wa=90,
          cloak=-10, wave=1.0),
        P(hip=(121, 159), lean=-4, head=2, ff=(152, 230), bf=(96, 230), fh=(153, 129), bh=(143, 141), wa=90,
          cloak=2, wave=1.5),
    ]


def anim_preload():
    keys = [
        dict(hip=(124, 158), lean=2, fh=(156, 128), bh=(146, 140), cloak=8),
        dict(hip=(123, 158), lean=-2, head=4, fh=(156, 128), bh=(124, 112), cloak=10, wave=0.5, be_pref=(0.8, -0.2)),
        dict(hip=(122, 158), lean=-6, head=8, fh=(156, 128), bh=(106, 100), cloak=12, wave=1.0, be_pref=(0.8, -0.2)),
        dict(hip=(122, 158), lean=-4, head=6, fh=(156, 128), bh=(120, 108), cloak=10, wave=1.5, be_pref=(0.8, -0.2)),
        dict(hip=(123, 158), lean=-1, head=2, fh=(156, 128), bh=(140, 122), cloak=9, wave=2.0),
        dict(hip=(124, 158), lean=2, fh=(156, 128), bh=(146, 140), cloak=8, wave=2.5),
    ]
    return [P(wa=90, ff=(152, 230), bf=(98, 230), **k) for k in keys]


CARRY_ANIMS = {
    'deploy': (anim_deploy, 12, False),
    'aim': (anim_aim, 4, True),
    'pfire': (anim_pfire, 10, False),
    'preload': (anim_preload, 6, False),
}


# ------------------------------------------------------------ Aegon -------
# Aegon Targaryen, the Conqueror: dark royal armor, a red-black cloak, a
# crown of Valyrian steel and rubies, and Blackfyre. Same rig, his colours.

AEGON = dict(
    skin=(230, 204, 186), skin_d=(184, 150, 134), hair=(222, 210, 172), beard=(198, 184, 146), long_hair=True,
    cloak_t=(118, 16, 22), cloak_b=(22, 6, 8), cloak_fur=(26, 8, 10), cloak_dark=(70, 10, 14),
    fur=(28, 22, 24), fur_l=(120, 30, 34), fur_d=(10, 8, 9),
    steel=(32, 30, 36), steel_l=(150, 126, 84), steel_d=(14, 13, 16),
    mail=(26, 24, 30), mail_d=(12, 12, 15), leather=(40, 20, 22), leather_d=(20, 10, 12), glove=(22, 18, 20),
    cloth=(28, 12, 16), boot=(18, 14, 16), brass=(196, 154, 64), crown=(70, 64, 72),
)


def anim_guard():
    """Blackfyre held level across the body: the parry stance."""
    return [
        P(hip=(122, 160), lean=6, head=-4, ff=(150, 230), bf=(96, 230), fh=(150, 132), bh=(140, 138), wa=120,
          cloak=10),
        P(hip=(120, 164), lean=10, head=-6, ff=(152, 230), bf=(94, 230), fh=(154, 120), bh=(144, 128), wa=104,
          cloak=14, wave=0.8),
        P(hip=(118, 162), lean=-4, head=4, ff=(150, 230), bf=(92, 230), fh=(146, 112), bh=(136, 120), wa=128,
          cloak=4, wave=1.6),
    ]


def anim_salute():
    """Entrance: the blade lowered at his side, then raised and levelled at the warrior."""
    return [
        P(hip=(124, 153), lean=2, ff=(144, 230), bf=(104, 230), fh=(148, 176), bh=(126, 170), wa=20, cloak=6),
        P(hip=(124, 153), lean=0, head=-4, ff=(144, 230), bf=(104, 230), fh=(150, 150), bh=(126, 166), wa=60,
          cloak=8, wave=0.8),
        P(hip=(123, 152), lean=-4, head=-8, ff=(144, 230), bf=(104, 230), fh=(146, 104), bh=(126, 162), wa=180,
          cloak=10, wave=1.6, fe_pref=(0.6, 0.3)),
        P(hip=(126, 154), lean=6, head=-2, ff=(150, 230), bf=(100, 230), fh=(166, 122), bh=(128, 160), wa=96,
          cloak=12, wave=2.4),
    ]


def anim_kneel():
    """Defeat: he sinks to one knee, Blackfyre planted, then the blade falls."""
    planted = ((172, 228), 96)
    return [
        P(hip=(120, 160), lean=-12, head=-14, ff=(140, 230), bf=(98, 230), fh=(146, 140), bh=(130, 146), wa=150,
          cloak=-10, wave=1.0),
        P(hip=(118, 196), lean=14, head=-26, ff=(150, 230), bf=(86, 232), fh=(158, 196), bh=(140, 200), wa=96,
          cloak=24, wave=2.0),
        P(hip=(116, 194), lean=10, head=-34, ff=(148, 230), bf=(84, 232), fh=(150, 222), bh=(132, 222),
          cloak=30, wave=3.0, weapon_free=planted),
        P(hip=(116, 192), lean=4, head=-10, ff=(148, 230), bf=(84, 232), fh=(146, 222), bh=(130, 220),
          cloak=24, wave=4.0, weapon_free=planted),
    ]


def aegon_anims():
    return {
        'idle': (anim_idle, 8, True), 'walk': (anim_run, 10, True), 'slash': (anim_attack, 14, False),
        'heavy': (anim_heavy, 11, False), 'thrust': (anim_thrust, 13, False), 'guard': (anim_guard, 10, False),
        'hurt': (anim_hurt, 10, False), 'death': (anim_death, 8, False), 'salute': (anim_salute, 6, False),
        'kneel': (anim_kneel, 5, False), 'dodge': (anim_dodge, 14, False),
    }


# ------------------------------------------------------------ Aemond -------
# Aemond Targaryen, unhorsed at the end of Level 5 (same rig, his colours).

def anim_aemond():
    return [
        P(hip=(124, 150), lean=-30, head=-20, ff=(150, 212), bf=(98, 206), fh=(150, 120), bh=(110, 118), wa=200,
          cloak=-30, wave=1.0),
        P(hip=(118, 196), lean=14, head=-26, ff=(150, 230), bf=(86, 232), fh=(150, 214), bh=(132, 212), wa=40,
          cloak=26, wave=2.0),
        P(hip=(116, 194), lean=10, head=-34, ff=(148, 230), bf=(84, 232), fh=(144, 226), bh=(128, 224),
          cloak=30, wave=3.0, weapon_free=((172, 228), 96)),
        P(hip=(116, 192), lean=4, head=-6, ff=(148, 230), bf=(84, 232), fh=(146, 222), bh=(130, 220),
          cloak=24, wave=4.0, weapon_free=((172, 228), 96)),
    ]
