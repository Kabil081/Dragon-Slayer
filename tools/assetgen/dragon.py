"""The base fire dragon: spine-ribbon body, IK legs, bat-wing membranes.

Built facing right, then mirrored so the shipped sprites face LEFT (toward
the warrior). Frame: 768 x 512 units, ground line at y = 486.
"""
import math

from PIL import Image, ImageOps

from .common import (Canvas, Frame, OUTLINE, add, catmull, dirv, ease, ik2, length, lerp,
                     lerp2, mix, mul, norm, perp, resample, ribbon_edges, rgba, rim_light, scale_texture,
                     seeded, shade, sub)

W, H = 768, 512
GROUND = 486
SS = 2
OW = 1.5

C = dict(
    back=(84, 18, 16), side=(150, 38, 28), belly=(214, 136, 70), belly_d=(160, 92, 48),
    scale=(58, 12, 12), spike=(38, 26, 24), horn=(222, 206, 174), horn_d=(110, 92, 70),
    mem=(112, 30, 24), mem_l=(168, 60, 40), bone=(132, 34, 26), claw=(234, 222, 196),
    mouth=(70, 12, 12), eye=(255, 210, 60), fire=(255, 140, 40), fire_l=(255, 230, 140),
)

WING_FOLDED = dict(hum=200, fore=286, fingers=(300, 310, 318, 326), scale=0.55)
WING_HALF = dict(hum=138, fore=212, fingers=(232, 256, 280, 302), scale=0.95)
WING_UP = dict(hum=150, fore=198, fingers=(214, 236, 258, 280), scale=1.0)
WING_MID = dict(hum=212, fore=250, fingers=(258, 274, 290, 306), scale=0.95)
WING_DOWN = dict(hum=290, fore=338, fingers=(352, 326, 304, 286), scale=0.95)


def wing_mix(a, b, t):
    return dict(hum=lerp(a['hum'], b['hum'], t), fore=lerp(a['fore'], b['fore'], t),
                fingers=tuple(lerp(x, y, t) for x, y in zip(a['fingers'], b['fingers'])),
                scale=lerp(a['scale'], b['scale'], t))


BASE = dict(
    C=(470, 360), Hp=(320, 366),
    neck=(158, -13), head=72, jaw=4,
    tail=(276, 3.2, 9, 0.0),          # base angle, droop/segment, wave amp, phase
    wing=WING_HALF, wing_far=None,
    fl=(492, 484), fr=(456, 486), hl=(334, 486), hr=(300, 486),
    glow=0.0, eye_closed=False, hurt=0.0,
)


def P(**kw):
    p = dict(BASE)
    p.update(kw)
    return p


# ------------------------------------------------------------ skeleton --

def spine(pose):
    Cp, Hp = pose['C'], pose['Hp']
    n0, nc = pose['neck']
    neck = [add(Cp, (10, -8))]
    for i in range(4):
        neck.append(add(neck[-1], mul(dirv(n0 + nc * i), 30)))
    t0, droop, amp, ph = pose['tail']
    tail = [Hp]
    seg = [36, 34, 32, 30, 28, 26, 24, 22, 20]
    for i, L in enumerate(seg):
        a = t0 + droop * i + amp * math.sin(ph + i * 0.65) * (0.35 + i / len(seg))
        tail.append(add(tail[-1], mul(dirv(a), L)))
    mid = add(lerp2(Hp, Cp, 0.5), (0, 4))
    ctrl = tail[::-1] + [mid, Cp] + neck
    widths = ([4, 9, 14, 19, 24, 30, 36, 44, 52, 64] + [80, 74] + [58, 48, 42, 38, 34])
    bulk = OPTS.get('bulk', 1.0)
    if bulk != 1.0:
        widths = [w * (1 + (bulk - 1) * min(1, i / 9)) for i, w in enumerate(widths)]
    pts = catmull(ctrl, 5)
    # widths follow the control points; spread them across the spline samples
    ws = []
    for i in range(len(pts)):
        f = i / (len(pts) - 1) * (len(ctrl) - 1)
        j = min(len(ctrl) - 2, int(f))
        ws.append(lerp(widths[j], widths[j + 1], f - j))
    return pts, ws, neck, tail


HEAD_SCALE = 1.3


class _Scaled:
    def __init__(self, fr, s):
        self.fr, self.s = fr, s

    def __call__(self, x, y=None):
        if y is None:
            x, y = x
        return self.fr(x * self.s, y * self.s)


def head_frame(pose, neck):
    return _Scaled(Frame(neck[-1], 90 - pose['head']), OPTS.get('head_scale', HEAD_SCALE))


# ------------------------------------------------------------ drawing ----

def draw_wing(c, root, attach, wp, dark, ow=OW):
    k = lambda col: shade(col, dark)
    s = wp['scale']
    span = OPTS.get('wing', 1.0)
    elbow = add(root, mul(dirv(wp['hum']), 70 * (0.5 + 0.5 * span)))
    wrist = add(elbow, mul(dirv(wp['fore']), 92 * (0.6 + 0.4 * s) * span))
    lens = [L * span for L in (160, 176, 158, 128)]
    tips = [add(wrist, mul(dirv(a), L * s)) for a, L in zip(wp['fingers'], lens)]
    edge = []
    seq = tips + [attach]
    for i in range(len(seq) - 1):
        a, b = seq[i], seq[i + 1]
        m = lerp2(lerp2(a, b, 0.5), wrist, 0.3 if i < len(seq) - 2 else 0.14)
        for t in (0.0, 0.25, 0.5, 0.75):
            q1 = lerp2(a, m, t)
            q2 = lerp2(m, b, t)
            edge.append(lerp2(q1, q2, t))
    edge.append(attach)
    poly = [root, elbow, wrist] + edge
    c.grad_poly(poly, k(C['mem']), k(C['mem_l']), wrist, lerp2(tips[1], tips[2], 0.5), ow=ow)
    # veins
    for tip in tips:
        mid = lerp2(wrist, tip, 0.5)
        c.line([lerp2(wrist, tip, 0.15), add(mid, mul(perp(norm(sub(tip, wrist))), 3))],
               k(shade(C['mem'], 0.8)), 1.0)
    # bones
    for tip in tips:
        c.capsule(wrist, tip, 4.2, 1.4, k(C['bone']), ow=ow * 0.8)
    c.capsule(root, elbow, 10, 8, k(C['side']), ow=ow)
    c.capsule(elbow, wrist, 7.5, 5, k(C['side']), ow=ow)
    c.highlight(root, elbow, 10, 8, k(shade(C['side'], 1.35)))
    if OPTS.get('armor') and dark >= 1.0:
        d = norm(sub(elbow, root))
        n = perp(d)
        pl = [add(root, mul(n, -11)), add(lerp2(root, elbow, 0.8), mul(n, -9)), add(elbow, mul(d, 6)),
              add(lerp2(root, elbow, 0.8), mul(n, 9)), add(root, mul(n, 11))]
        c.grad_poly(pl, C['plate_l'], C['plate'], pl[0], pl[4], ow=ow * 0.8)
        c.poly([add(elbow, mul(n, -4)), add(add(elbow, mul(d, 8)), mul(n, -14)), add(elbow, mul(n, 4))],
               C['horn'], ow=ow * 0.7)
    # thumb claw
    th = add(wrist, mul(dirv(wp['fore'] - 120), 12))
    c.poly([add(wrist, (-3, 0)), th, add(wrist, (3, 0))], k(C['claw']), ow=ow * 0.8)
    return dict(elbow=elbow, wrist=wrist, tips=tips)


def draw_claws(c, foot, fwd, dark, size=1.0):
    k = lambda col: shade(col, dark)
    up = mul(perp(fwd), -1)
    F = lambda x, y: add(add(foot, mul(fwd, x * size)), mul(up, y * size))
    c.poly([F(-12, 2), F(-10, 12), F(8, 12), F(18, 6), F(22, 0), F(-12, -1)], k(C['side']), ow=OW)
    for x in (6, 13, 20):
        c.poly([F(x - 3, 2), F(x + 6, 1), F(x + 4, -3)], k(C['claw']), ow=OW * 0.7)


def draw_front_leg(c, shoulder, target, dark, lift=False):
    k = lambda col: shade(col, dark)
    b = OPTS.get('bulk', 1.0)
    elbow, paw = ik2(shoulder, target, 56, 54, prefer=(-1, 0.2))
    c.capsule(shoulder, elbow, 17 * b, 11 * b, k(C['side']), ow=OW)
    c.highlight(shoulder, elbow, 17 * b, 11 * b, k(shade(C['side'], 1.3)))
    c.capsule(elbow, paw, 11 * b, 7.5 * b, k(C['side']), ow=OW)
    if OPTS.get('armor'):
        # overlapping plates down the upper arm and a heavy elbow boss
        d = norm(sub(elbow, shoulder))
        n = perp(d)
        for j in range(2):
            q = lerp2(shoulder, elbow, 0.25 + j * 0.42)
            L, T = 14 * b, 14 * b * (1 - j * 0.2)
            pl = [add(add(q, mul(d, -L * 0.8)), mul(n, -T)), add(add(q, mul(d, L * 0.6)), mul(n, -T * 0.8)),
                  add(q, mul(d, L * 1.1)), add(add(q, mul(d, L * 0.6)), mul(n, T * 0.8)),
                  add(add(q, mul(d, -L * 0.8)), mul(n, T))]
            c.grad_poly(pl, k(C['plate_l']), k(C['plate']), pl[0], pl[3], ow=OW * 0.8)
            c.line([pl[0], pl[1], pl[2]], k(shade(C['plate_l'], 1.25)), 0.9)
    fwd = norm(sub(paw, elbow)) if lift else (1, 0)
    if lift:
        fwd = norm(add(fwd, (1.2, 0)))
    draw_claws(c, add(paw, (0, -5)), fwd, dark, 1.35 * (b ** 1.5))
    return elbow, paw


def draw_hind_leg(c, hip, target, dark, tucked=False):
    k = lambda col: shade(col, dark)
    hock_t = add(target, (-12, -26))
    b = OPTS.get('bulk', 1.0)
    knee, hock = ik2(hip, hock_t, 54, 46, prefer=(1, 0.1))
    c.capsule(hip, knee, 24 * b, 13 * b, k(C['side']), ow=OW)
    c.highlight(hip, knee, 24 * b, 13 * b, k(shade(C['side'], 1.25)))
    c.capsule(knee, hock, 12 * b, 8 * b, k(C['side']), ow=OW)
    foot = add(hock, (12, 26)) if not tucked else add(hock, mul(norm(sub(hock, knee)), 22))
    c.capsule(hock, foot, 8 * b, 6 * b, k(C['side']), ow=OW)
    fwd = (1, 0) if not tucked else norm(sub(foot, hock))
    draw_claws(c, add(foot, (0, -5)), fwd, dark, 1.35 * (b ** 1.5))


def draw_body(c, pose, pts, ws):
    a_side, b_side, normals = ribbon_edges(pts, ws)
    poly = a_side + b_side[::-1]
    ys = [p[1] for p in poly]
    # dorsal spikes behind the outline
    n = len(pts)
    for i in range(3, n - 3, 2):
        if ws[i] < 7:
            continue
        base = a_side[i]
        tang = norm(sub(pts[i + 1], pts[i - 1]))
        hgt = 5 + ws[i] * 0.22
        tip = add(add(base, mul(normals[i], -hgt)), mul(tang, -hgt * 0.6))
        c.poly([add(base, mul(tang, -hgt * 0.5)), tip, add(base, mul(tang, hgt * 0.45))],
               C['spike'], ow=OW * 0.8)
    c.grad_poly(poly, C['back'], C['side'], (0, min(ys)), (0, max(ys) - 6), ow=OW)
    # scale marks on the dorsal half (stable per spine sample)
    rng = seeded(3)
    for i in range(2, n - 2):
        for _ in range(2):
            t = rng.uniform(-0.42, -0.05)
            q = add(pts[i], mul(normals[i], t * ws[i]))
            tang = norm(sub(pts[i + 1], pts[i - 1]))
            sz = 1.5 + ws[i] * 0.05
            c.line([add(q, mul(tang, -sz)), add(q, mul(normals[i], sz * 0.7)), add(q, mul(tang, sz))],
                   C['scale'], 1.0)
    # belly band
    i0 = 4
    inner = [add(pts[i], mul(normals[i], ws[i] * 0.16)) for i in range(i0, n)]
    outer = [b_side[i] for i in range(i0, n)]
    belly_poly = inner + outer[::-1]
    glow = pose.get('glow', 0.0)
    bc = mix(C['belly'], C['fire'], glow * 0.7)
    bd = mix(C['belly_d'], C['fire_l'], glow * 0.6)
    c.grad_poly(belly_poly, bc, bd, inner[0], inner[-1], ow=OW * 0.8)
    for i in range(i0 + 1, n - 1):
        c.line([inner[i - i0], outer[i - i0]], shade(bd, 0.75), 1.0)
    if glow > 0:
        g = c.layer()
        chest = [inner[i - i0] for i in range(n - 14, n)] + [outer[i - i0] for i in range(n - 1, n - 15, -1)]
        g.poly(chest, (255, 160, 50, int(200 * glow)), outline=None)
        c.glow(g.img, 10, 1.0)
    if OPTS.get('armor'):
        draw_heavy_armor(c, pts, ws, normals)
    elif OPTS.get('plates'):
        draw_plates(c, pts, ws, normals)


def draw_heavy_armor(c, pts, ws, normals):
    """Vhagar: rows of overlapping bronze-and-charcoal scutes over the back,
    flank and chest; molten fissures glow in the seams; old scars."""
    plate, edge = C['plate'], C['plate_l']
    fis = OPTS.get('fissure', 0.0)
    n = len(pts)
    rs = seeded(91)
    cracks = []
    rows = ((-0.30, 0.46, 0.25, 2, 18, 0.0), (-0.07, 0.36, 0.20, 2, 26, 0.0), (0.15, 0.30, 0.16, 3, 30, 0.0),
            (0.30, 0.30, 0.15, 2, 40, 0.62))
    for off, Lk, Tk, step, wmin, from_t in rows:
        for i in range(5, n - 5, step):
            w = ws[i]
            if w < wmin or i < from_t * n:
                continue
            tang = norm(sub(pts[min(n - 1, i + 1)], pts[i - 1]))
            nv = normals[i]
            q = add(pts[i], mul(nv, off * w))
            L, T = Lk * w, Tk * w
            # a shield-shaped scute; its free edge points toward the tail
            pl = [add(add(q, mul(tang, L * 0.9)), mul(nv, -T)), add(add(q, mul(tang, L)), mul(nv, T * 0.6)),
                  add(add(q, mul(tang, -L * 0.6)), mul(nv, T)), add(q, mul(tang, -L * 1.05)),
                  add(add(q, mul(tang, -L * 0.6)), mul(nv, -T))]
            f = rs.uniform(0.86, 1.12)
            c.grad_poly(pl, shade(edge, f), shade(plate, f * 0.9), pl[0], pl[2], ow=OW * 0.8)
            c.line([pl[4], pl[0], pl[1]], shade(edge, 1.3), 1.1)          # lit rim
            if OPTS.get('scars') and rs.random() < 0.2:
                a = add(q, mul(tang, rs.uniform(-0.5, 0.5) * L))
                c.line([add(a, mul(nv, -T * 0.8)), add(add(a, mul(tang, -L * 0.3)), mul(nv, T * 0.7))],
                       shade(edge, 1.5), 0.7)
            if OPTS.get('cracked') and rs.random() < 0.4:
                a = add(q, mul(tang, rs.uniform(-0.4, 0.4) * L))
                cracks.append([add(a, mul(nv, -T * 0.9)), add(add(a, mul(tang, L * 0.2)), mul(nv, 0)),
                               add(add(a, mul(tang, -L * 0.1)), mul(nv, T * 0.8))])
    if fis > 0:
        g = c.layer()
        fc = C.get('fissure', (255, 120, 30))
        for off in (-0.19, 0.05, 0.24):
            line = [add(pts[i], mul(normals[i], off * ws[i])) for i in range(6, n - 6) if ws[i] >= 30]
            if len(line) > 2:
                g.line(line, fc + (int(210 * fis),), 2.6)
        for cr in cracks:
            g.line(cr, fc + (int(240 * fis),), 2.0)
        c.glow(g.img, 5, 1.2 * fis)
        c.composite(g.img, opacity=0.5 + 0.5 * fis)
        for cr in cracks:
            c.line(cr, (255, 220, 150), 0.6)


def draw_plates(c, pts, ws, normals):
    """Overlapping armor plates along the dorsal ridge (Meleys)."""
    plate, edge = C.get('plate', (60, 58, 64)), C.get('plate_l', (128, 124, 134))
    n = len(pts)
    for i in range(n - 6, 5, -2):
        w = ws[i]
        if w < 16:
            continue
        tang = norm(sub(pts[min(n - 1, i + 1)], pts[i - 1]))
        nv = normals[i]
        q = add(pts[i], mul(nv, -0.28 * w))
        L, T = 0.36 * w, 0.2 * w
        P4 = [add(add(q, mul(tang, -L)), mul(nv, T)), add(add(q, mul(tang, -L * 0.8)), mul(nv, -T)),
              add(add(q, mul(tang, L)), mul(nv, -T * 0.7)), add(add(q, mul(tang, L * 0.9)), mul(nv, T))]
        c.poly(P4, plate, ow=OW * 0.8)
        c.line([P4[1], P4[2]], edge, 1.6)


def draw_head(c, pose, Hf):
    jaw = pose.get('jaw', 0)
    hinge = (4, -6)
    r = math.radians(-jaw)

    def J(x, y):
        dx, dy = x - hinge[0], y - hinge[1]
        return Hf(hinge[0] + dx * math.cos(r) - dy * math.sin(r),
                  hinge[1] + dx * math.sin(r) + dy * math.cos(r))

    glow = pose.get('glow', 0.0)
    # far horn
    hs = OPTS.get('horn', 1.0)
    grow = lambda pts, bx, by: [Hf(bx + (x - bx) * hs, by + (y - by) * hs) for x, y in pts]
    horn2 = grow([(-4, 10), (-16, 17), (-28, 20), (-38, 17)], -4, 10)
    hw = hs ** (1.25 if OPTS.get('armor') else 0.8)
    c.poly(_horn(horn2, 7 * hw), shade(C['horn'], 0.6), ow=OW)
    # mouth interior
    if jaw > 2:
        inner = [Hf(*hinge), Hf(20, -6), Hf(40, -6), Hf(60, -5), J(58, -7), J(40, -6), J(20, -6)]
        c.poly(inner, mix(C['mouth'], C['fire'], glow * 0.85), ow=OW)
        if glow > 0:
            g = c.layer()
            g.poly(inner, (255, 200, 90, int(255 * glow)), outline=None)
            c.glow(g.img, 6, 1.2)
    # lower jaw
    lower = [J(-4, -8), J(6, -6), J(30, -6), J(52, -6), J(60, -7), J(58, -10), J(44, -13.5),
             J(24, -15.5), J(6, -16.5), J(-6, -13)]
    for x in range(14, 56, 7):
        c.poly([J(x - 2, -6.5), J(x, -1.5), J(x + 2, -6.5)], C['claw'], ow=OW * 0.6)
    c.poly(lower, C['side'], ow=OW)
    c.line([J(6, -11), J(50, -9)], shade(C['side'], 0.75), 1.2)
    for x in (0, -6):
        c.poly([J(x, -12), J(x - 10, -16), J(x - 3, -9)], C['spike'], ow=OW * 0.7)
    # upper teeth
    for x in range(12, 60, 7):
        c.poly([Hf(x - 2, -5), Hf(x, -10.5), Hf(x + 2, -5)], C['claw'], ow=OW * 0.6)
    upper = [Hf(-6, -12), Hf(-11, 2), Hf(-6, 14), Hf(6, 18), Hf(18, 16.5), Hf(27, 12.5),
             Hf(44, 8.5), Hf(58, 5.5), Hf(64, 2.5), Hf(66.5, -2), Hf(62, -5.5), Hf(40, -6.5),
             Hf(20, -6.5), Hf(6, -8)]
    c.grad_poly(upper, C['back'], C['side'], Hf(20, 16), Hf(20, -6), ow=OW)
    # nose spikes + brow
    for x, h in ((46, 6), (53, 4.5)):
        c.poly([Hf(x - 3, 7.6), Hf(x + 1, 7.6 + h), Hf(x + 2.4, 6.4)], C['horn'], ow=OW * 0.7)
    c.line([Hf(14, 15), Hf(24, 12.6), Hf(30, 9.6)], C['scale'], 2.0)
    c.ellipse(Hf(58, 2.6), 2.2, 1.3, (30, 6, 6), outline=None)
    # eye
    eye = Hf(22, 9)
    if pose.get('eye_closed'):
        c.line([Hf(18, 9.6), Hf(26, 8.6)], (30, 6, 6), 1.4)
    else:
        g = c.layer()
        g.circle(eye, 5, tuple(C['eye']) + (230,), outline=None)
        c.glow(g.img, 3, 0.9)
        c.ellipse(eye, 4.2, 2.8, C['eye'], ow=OW * 0.8)
        c.ellipse(eye, 0.9, 2.6, (20, 8, 4), outline=None)
    # near horn
    horn = grow([(2, 13), (-12, 22), (-28, 27), (-42, 24), (-50, 18)], 2, 13)
    c.poly(_horn(horn, 10 * hw), C['horn'], ow=OW)
    if OPTS.get('armor'):
        for k in range(5):           # growth ridges on the horn
            q = lerp2(horn[1], horn[3], k / 5)
            c.line([add(q, (0, -3 * hw)), add(q, (1.5, 3 * hw))], C['horn_d'], 0.7)
    if OPTS.get('armor'):
        # brow crest, cheek guard and nasal plates
        c.grad_poly([Hf(-2, 18), Hf(14, 21), Hf(30, 17), Hf(40, 11), Hf(26, 9), Hf(8, 11)],
                    C['plate_l'], C['plate'], Hf(10, 21), Hf(10, 9), ow=OW * 0.8)
        c.grad_poly([Hf(-4, 2), Hf(10, 6), Hf(16, -2), Hf(4, -6)], C['plate_l'], C['plate'], Hf(4, 6), Hf(4, -6),
                    ow=OW * 0.8)
        for x in (42, 50):
            c.poly([Hf(x - 4, 8), Hf(x + 4, 7), Hf(x + 2, 4), Hf(x - 4, 4.6)], C['plate'], ow=OW * 0.6)
        if OPTS.get('scars'):
            c.line([Hf(16, 16), Hf(26, 2), Hf(30, -2)], shade(C['plate_l'], 1.4), 0.8)
    elif OPTS.get('plates'):
        c.poly([Hf(6, 17), Hf(20, 18), Hf(34, 13), Hf(26, 10), Hf(10, 12)], C.get('plate', (60, 58, 64)), ow=OW * 0.8)
    c.line([Hf(-8, 19), Hf(-24, 24.5), Hf(-40, 22)], C['horn_d'], 1.0)
    # cheek frill
    c.poly([Hf(-6, 4), Hf(-20, 8), Hf(-9, -2), Hf(-18, -6), Hf(-6, -8)], C['spike'], ow=OW * 0.8)
    return J(56, -8)


def _horn(pts, w0):
    pts = catmull(pts, 4)
    widths = [w0 * (1 - i / (len(pts) - 1)) + 0.6 for i in range(len(pts))]
    a, b, _ = ribbon_edges(pts, widths)
    return a + b[::-1]


# ------------------------------------------------------------ render -----

# Emberwing: reddish-black scales and bright orange wing membranes.
EMBERWING = dict(
    back=(26, 9, 11), side=(68, 16, 16), belly=(156, 64, 34), belly_d=(110, 40, 24),
    scale=(14, 4, 6), spike=(14, 8, 8), horn=(188, 168, 146), horn_d=(84, 64, 54),
    mem=(232, 108, 24), mem_l=(255, 184, 70), bone=(70, 18, 14), claw=(232, 216, 190),
    mouth=(64, 10, 8), eye=(255, 230, 96), fire=(255, 140, 40), fire_l=(255, 230, 140),
)


OPTS = {}


def render(pose, out=None, palette=None, opts=None):
    saved, saved_opts = dict(C), dict(OPTS)
    C.update(palette or {})
    OPTS.update(opts or {})
    try:
        return _render(pose, out)
    finally:
        C.clear()
        C.update(saved)
        OPTS.clear()
        OPTS.update(saved_opts)


def _render(pose, out=None):
    pad = OPTS.get('headroom', 0)             # extra sky above the rig so raised wings are never clipped
    out = out or (W, H + pad)
    ss = SS * out[0] / W
    c = Canvas(W, H + pad, ss, origin=(0, pad))
    pts, ws, neck, tail = spine(pose)
    Cp, Hp = pose['C'], pose['Hp']
    pitch = math.degrees(math.atan2(Cp[1] - Hp[1], Cp[0] - Hp[0]))
    B = Frame(Cp, pitch)
    root = B(-18, 30)
    attach = add(Hp, mul(norm(sub(Cp, Hp)), 10))
    attach = add(attach, (0, -22))
    flying = pose.get('flying', False)

    wf = pose.get('wing_far') or pose['wing']
    draw_wing(c, add(root, (14, -6)), add(attach, (10, -4)), wf, 0.55)
    draw_front_leg(c, B(-2, -20), pose['fr'], 0.58, lift=flying)
    draw_hind_leg(c, add(Hp, (4, 18)), pose['hr'], 0.58, tucked=flying)
    draw_body(c, pose, pts, ws)
    Hf = head_frame(pose, neck)
    mouth = draw_head(c, pose, Hf)
    draw_hind_leg(c, add(Hp, (-6, 20)), pose['hl'], 1.0, tucked=flying)
    shoulder = B(4, -22)
    elbow, _ = draw_front_leg(c, shoulder, pose['fl'], 1.0, lift=pose.get('claw', False) or flying)
    wing = draw_wing(c, root, attach, pose['wing'], 1.0)
    rider_at = None
    if OPTS.get('rider') == 'aemond':
        if not pose.get('rider_off'):
            rider_at = draw_rider_aemond(c, B, pose)
    elif OPTS.get('rider'):
        draw_rider(c, B, pose)

    img = c.finish(out)
    if OPTS.get('lighting'):
        k = out[0] / W
        img = scale_texture(img, cell=4.2 * k, strength=0.07, seed=5)
        img = rim_light(img, px=max(1, round(2 * k)), top_k=0.5, bottom_k=0.5, soft=1.6 * k)
    img = ImageOps.mirror(img)
    s = out[0] / W
    mx = lambda p: [round((W - p[0]) * s, 1), round((p[1] + pad) * s, 1)]
    fire_dir = (pose['head'] - pose.get('jaw', 0) * 0.4)
    meta = {'mouth': mx(mouth), 'fire_angle': round((-fire_dir) % 360, 1),
            'head': mx(Hf(30, 4)), 'chest': mx(Cp),
            'foreleg': mx(lerp2(shoulder, elbow, 0.55)), 'wing': mx(lerp2(root, wing['elbow'], 0.5)),
            'tail': mx(tail[2])}
    if rider_at:
        meta['rider'] = mx(rider_at)
    return img, meta


# ------------------------------------------------------------ animations --

def anim_idle():
    out = []
    for i in range(6):
        t = i / 6
        b = math.sin(2 * math.pi * t)
        w = wing_mix(WING_HALF, WING_UP, 0.15 + 0.12 * b)
        out.append(P(C=(470, 360 + 2.5 * b), Hp=(320, 366 + 1.2 * b), neck=(158 + 3 * b, -13),
                     head=72 - 3 * b, jaw=3 + 2 * max(0, b),
                     tail=(276, 3.2, 10, 2 * math.pi * t), wing=w,
                     wing_far=wing_mix(w, WING_UP, 0.2)))
    return out


def _walk_foot(p, x0, stride=34, lift=22):
    p %= 1.0
    if p < 0.62:
        s = p / 0.62
        return (x0 + stride / 2 - stride * s, GROUND)
    s = (p - 0.62) / 0.38
    return (x0 - stride / 2 + stride * ease(s), GROUND - lift * math.sin(math.pi * s))


def anim_walk():
    out = []
    for i in range(8):
        p = i / 8
        bob = math.cos(4 * math.pi * p)
        out.append(P(C=(472, 362 + 2.5 * bob), Hp=(320, 368 - 2 * bob),
                     neck=(152 + 3 * math.sin(2 * math.pi * p), -12), head=74,
                     tail=(274, 3.0, 12, 2 * math.pi * p), wing=WING_FOLDED,
                     wing_far=wing_mix(WING_FOLDED, WING_HALF, 0.15),
                     fl=_walk_foot(p, 492), fr=_walk_foot(p + 0.5, 462),
                     hl=_walk_foot(p + 0.5, 334), hr=_walk_foot(p, 304)))
    return out


def anim_attack():
    return [
        P(C=(458, 350), Hp=(318, 368), neck=(172, -10), head=96, jaw=2,
          tail=(272, 3, 10, 0.4), wing=wing_mix(WING_HALF, WING_UP, 0.4)),
        P(C=(448, 340), Hp=(316, 368), neck=(182, -8), head=110, jaw=8,
          tail=(270, 3, 12, 0.9), wing=WING_UP, fl=(482, 470), claw=True),
        P(C=(496, 368), Hp=(330, 368), neck=(118, -10), head=62, jaw=34,
          tail=(278, 3, 14, 1.5), wing=wing_mix(WING_HALF, WING_MID, 0.4),
          fl=(560, 452), claw=True),
        P(C=(504, 372), Hp=(334, 368), neck=(108, -9), head=58, jaw=2,
          tail=(280, 3, 14, 2.1), wing=wing_mix(WING_HALF, WING_MID, 0.6),
          fl=(548, 484)),
        P(C=(494, 368), Hp=(330, 368), neck=(124, -11), head=64, jaw=10,
          tail=(278, 3, 12, 2.7), wing=WING_HALF, fl=(530, 484)),
        P(C=(474, 362), Hp=(322, 367), neck=(150, -13), head=70, jaw=4,
          tail=(276, 3.2, 10, 3.3), wing=WING_HALF),
    ]


def anim_fire_breath():
    frames = [
        P(C=(462, 352), Hp=(318, 368), neck=(170, -9), head=100, jaw=4, glow=0.25,
          tail=(272, 3, 10, 0.3), wing=wing_mix(WING_HALF, WING_UP, 0.5)),
        P(C=(450, 340), Hp=(316, 368), neck=(184, -7), head=118, jaw=10, glow=0.6,
          tail=(270, 3, 12, 0.8), wing=WING_UP),
        P(C=(486, 360), Hp=(326, 368), neck=(140, -12), head=78, jaw=26, glow=0.9,
          tail=(276, 3, 12, 1.3), wing=wing_mix(WING_UP, WING_HALF, 0.5)),
    ]
    for k in range(4):
        j = math.sin(k * 1.9)
        frames.append(P(C=(494, 364 + j), Hp=(328, 368), neck=(128 + 2 * j, -12), head=74 + 2 * j,
                        jaw=32 + 2 * j, glow=1.0, tail=(278, 3, 12, 1.8 + k * 0.6),
                        wing=wing_mix(WING_HALF, WING_UP, 0.25 + 0.05 * j)))
    frames.append(P(C=(478, 362), Hp=(322, 367), neck=(150, -13), head=72, jaw=8, glow=0.3,
                    tail=(276, 3.2, 10, 4.4), wing=WING_HALF))
    return frames


def anim_stagger():
    return [
        P(C=(446, 344), Hp=(314, 368), neck=(196, -6), head=140, jaw=26, hurt=1.0,
          tail=(266, 3, 16, 0.5), wing=WING_UP, wing_far=WING_MID),
        P(C=(440, 350), Hp=(310, 368), neck=(188, -8), head=126, jaw=18, hurt=0.4,
          tail=(268, 3, 14, 1.2), wing=wing_mix(WING_UP, WING_HALF, 0.5), fl=(470, 484)),
        P(C=(452, 356), Hp=(314, 367), neck=(172, -11), head=96, jaw=8,
          tail=(272, 3, 12, 1.9), wing=WING_HALF, fl=(476, 484)),
        P(C=(466, 360), Hp=(318, 366), neck=(160, -13), head=76, jaw=4,
          tail=(276, 3.2, 10, 2.6), wing=WING_HALF),
    ]


def anim_flight():
    out = []
    tuck = dict(fl=(516, 362), fr=(494, 356), hl=(286, 384), hr=(266, 378))
    for i in range(8):
        p = i / 8
        ph = 2 * math.pi * p
        # 0 = top of the stroke, 0.5 = bottom
        t = 0.5 - 0.5 * math.cos(ph)
        if t < 0.5:
            w = wing_mix(WING_UP, WING_MID, t * 2)
        else:
            w = wing_mix(WING_MID, WING_DOWN, (t - 0.5) * 2)
        lag = 0.5 - 0.5 * math.cos(ph - 0.5)
        wf = wing_mix(WING_UP, WING_MID, lag * 2) if lag < 0.5 else wing_mix(WING_MID, WING_DOWN, (lag - 0.5) * 2)
        bob = -10 * math.cos(ph)
        out.append(P(C=(476, 286 + bob), Hp=(326, 300 + bob * 0.8), neck=(132, -6), head=86,
                     jaw=2, tail=(268, 1.4, 14, ph), wing=w, wing_far=wf, flying=True,
                     **{k: (v[0], v[1] + bob) for k, v in tuck.items()}))
    return out


def anim_death():
    return [
        P(C=(450, 344), Hp=(316, 368), neck=(194, -6), head=136, jaw=28, hurt=1.0,
          tail=(266, 3, 16, 0.5), wing=WING_UP, wing_far=WING_MID),
        P(C=(436, 318), Hp=(312, 366), neck=(200, -4), head=150, jaw=34,
          tail=(264, 3, 18, 1.1), wing=WING_UP, fl=(474, 452), claw=True),
        P(C=(444, 350), Hp=(314, 370), neck=(176, -6), head=120, jaw=24,
          tail=(270, 3, 16, 1.7), wing=wing_mix(WING_UP, WING_MID, 0.6), fl=(478, 476)),
        P(C=(460, 392), Hp=(318, 392), neck=(140, -10), head=90, jaw=16,
          tail=(278, 2.6, 12, 2.3), wing=WING_MID, wing_far=WING_HALF,
          fl=(500, 486), fr=(470, 486), hl=(344, 486), hr=(310, 486)),
        P(C=(468, 428), Hp=(318, 424), neck=(110, -12), head=80, jaw=10,
          tail=(282, 2.2, 8, 2.8), wing=wing_mix(WING_MID, WING_DOWN, 0.4), wing_far=WING_HALF,
          fl=(520, 486), fr=(490, 486), hl=(360, 486), hr=(330, 486)),
        P(C=(472, 448), Hp=(318, 446), neck=(96, -8), head=84, jaw=6,
          tail=(286, 1.4, 5, 3.2), wing=wing_mix(WING_MID, WING_DOWN, 0.7), wing_far=WING_MID,
          fl=(536, 486), fr=(500, 486), hl=(372, 486), hr=(340, 486)),
        P(C=(474, 452), Hp=(318, 450), neck=(88, -4), head=92, jaw=4, eye_closed=True,
          tail=(288, 1.0, 3, 3.4), wing=wing_mix(WING_MID, WING_DOWN, 0.85), wing_far=WING_MID,
          fl=(540, 486), fr=(504, 486), hl=(376, 486), hr=(344, 486)),
        P(C=(474, 454), Hp=(318, 452), neck=(86, -3), head=94, jaw=3, eye_closed=True,
          tail=(288, 0.8, 2, 3.5), wing=WING_DOWN, wing_far=WING_MID,
          fl=(540, 486), fr=(504, 486), hl=(376, 486), hr=(344, 486)),
    ]


def anim_flame_sweep():
    """Head drops to the floor and sweeps a wave of flame along the ground."""
    frames = [
        P(C=(462, 352), Hp=(318, 368), neck=(172, -9), head=104, jaw=6, glow=0.3,
          tail=(272, 3, 10, 0.3), wing=wing_mix(WING_HALF, WING_UP, 0.5)),
        P(C=(480, 368), Hp=(322, 368), neck=(104, -8), head=86, jaw=14, glow=0.6,
          tail=(276, 3, 12, 0.8), wing=WING_HALF, fl=(540, 484)),
    ]
    for k in range(4):
        j = math.sin(k * 1.7)
        frames.append(P(C=(498, 380), Hp=(326, 368), neck=(62 + 4 * j, -1), head=96 + 3 * j, jaw=30 + 2 * j,
                        glow=1.0, tail=(278, 3, 12, 1.4 + k * 0.6), wing=wing_mix(WING_HALF, WING_MID, 0.3),
                        fl=(556, 486), fr=(520, 486)))
    frames.append(P(C=(478, 364), Hp=(322, 367), neck=(140, -12), head=76, jaw=6, glow=0.2,
                    tail=(276, 3.2, 10, 4.0), wing=WING_HALF))
    return frames


def anim_charge():
    """Brace, a four-frame gallop, then a skid to a stop."""
    frames = [P(C=(448, 388), Hp=(318, 362), neck=(116, -5), head=86, jaw=4, tail=(266, 2.4, 8, 0.2),
                wing=WING_FOLDED, wing_far=WING_FOLDED, fl=(478, 486), fr=(446, 486), hl=(338, 486),
                hr=(304, 486))]
    for k in range(4):
        ph = k / 4 * 2 * math.pi
        a, b = math.sin(ph), math.cos(ph)
        frames.append(P(C=(500, 370 + 6 * b), Hp=(340, 360 - 4 * b), neck=(106, -5), head=88, jaw=10,
                        tail=(268, 1.2, 10, ph), wing=wing_mix(WING_FOLDED, WING_MID, 0.25),
                        wing_far=WING_FOLDED,
                        fl=(520 + 44 * a, 486 - max(0, b) * 30), fr=(500 - 44 * a, 486 - max(0, -b) * 30),
                        hl=(350 - 40 * a, 486 - max(0, -b) * 26), hr=(330 + 40 * a, 486 - max(0, b) * 26)))
    frames.append(P(C=(472, 382), Hp=(316, 370), neck=(146, -11), head=78, jaw=8, tail=(274, 3, 12, 1.0),
                    wing=wing_mix(WING_FOLDED, WING_HALF, 0.5), fl=(566, 486), fr=(530, 486), hl=(352, 486),
                    hr=(320, 486)))
    return frames


ANIMS = {
    'idle': (anim_idle, 6, True),
    'walk': (anim_walk, 9, True),
    'attack': (anim_attack, 10, False),
    'fire_breath': (anim_fire_breath, 10, False),
    'stagger': (anim_stagger, 8, False),
    'flight': (anim_flight, 10, True),
    'death': (anim_death, 7, False),
}

# Extra animations used by dragons that have the sweep / charge attacks.
EXTRA_ANIMS = {
    'flame_sweep': (anim_flame_sweep, 10, False),
    'charge': (anim_charge, 12, True),
}


def draw_rider(c, B, pose):
    """An armored rider seated at the base of the neck, silver hair and a red
    cloak streaming back. Uses the body frame so it follows every pose."""
    wind = 6 * math.sin(pose.get('tail', (0, 0, 0, 0))[3] * 1.7)
    cloak = [B(-2, 74), B(-30, 72 + wind * 0.3), B(-66, 62 + wind), B(-80, 44 + wind), B(-50, 40), B(-14, 44)]
    c.poly(cloak, (150, 24, 30), ow=OW)
    c.line([B(-6, 70), B(-60, 56 + wind)], (110, 16, 22), 2)
    c.poly([B(-14, 40), B(10, 40), B(12, 34), B(-16, 34)], (70, 44, 30), ow=OW)           # saddle
    c.capsule(B(-2, 42), B(14, 26), 5.5, 4.5, (46, 46, 54), ow=OW)                      # thigh
    c.capsule(B(14, 26), B(10, 10), 4.5, 3.6, (36, 36, 42), ow=OW)                      # shin
    c.poly([B(4, 12), B(18, 12), B(18, 6), B(4, 6)], (30, 28, 30), ow=OW * 0.8)
    torso = [B(-10, 42), B(8, 42), B(14, 60), B(10, 76), B(-4, 76), B(-10, 60)]
    c.grad_poly(torso, (120, 124, 136), (52, 54, 64), B(10, 70), B(-8, 44), ow=OW)
    c.line([B(-8, 50), B(12, 66)], (170, 28, 34), 3)                                    # sash
    c.capsule(B(6, 72), B(22, 58), 4, 3.4, (96, 100, 112), ow=OW)                       # arm to the reins
    c.line([B(22, 58), B(40, 50)], (60, 40, 30), 1.4)
    c.circle(B(6, 86), 7.5, (226, 196, 176), ow=OW)                                     # head
    hair = [B(10, 94), B(-2, 95), B(-22, 88 + wind * 0.4), B(-30, 76 + wind * 0.6), B(-14, 80), B(-2, 84), B(0, 90)]
    c.poly(hair, (232, 232, 240), ow=OW * 0.8)
    c.circle(B(10, 88), 1.2, (30, 24, 24), outline=None)


# Meleys: charcoal armor plates over deep crimson scales, rose wings.
MELEYS = dict(
    back=(30, 28, 34), side=(86, 30, 34), belly=(172, 108, 94), belly_d=(124, 68, 60),
    scale=(14, 12, 16), spike=(22, 20, 24), horn=(156, 146, 132), horn_d=(62, 56, 52),
    mem=(146, 34, 48), mem_l=(214, 96, 100), bone=(42, 36, 42), claw=(226, 214, 198),
    mouth=(60, 10, 10), eye=(255, 204, 84), fire=(255, 140, 40), fire_l=(255, 230, 140),
    plate=(58, 58, 66), plate_l=(132, 130, 142),
)
MELEYS_OPTS = {'plates': True, 'horn': 1.55, 'rider': True}


def anim_slam():
    """Rear up high, then slam the forelegs into the ground."""
    return [
        P(C=(452, 330), Hp=(318, 370), neck=(176, -8), head=110, jaw=10, wing=WING_UP, fl=(480, 440), claw=True,
          tail=(272, 3, 10, 0.2)),
        P(C=(430, 292), Hp=(316, 372), neck=(190, -5), head=132, jaw=26, wing=WING_UP, wing_far=WING_MID,
          fl=(500, 400), fr=(470, 410), claw=True, tail=(270, 3, 12, 0.6)),
        P(C=(470, 350), Hp=(320, 370), neck=(150, -10), head=96, jaw=20, wing=wing_mix(WING_UP, WING_MID, 0.5),
          fl=(540, 470), claw=True, tail=(274, 3, 12, 1.0)),
        P(C=(500, 392), Hp=(326, 368), neck=(110, -8), head=80, jaw=30, wing=WING_MID, fl=(560, 486),
          fr=(530, 486), tail=(278, 3, 14, 1.4)),
        P(C=(496, 388), Hp=(326, 368), neck=(104, -6), head=82, jaw=12, wing=wing_mix(WING_MID, WING_HALF, 0.5),
          fl=(556, 486), fr=(526, 486), tail=(278, 3, 12, 1.8)),
        P(C=(476, 364), Hp=(322, 367), neck=(140, -12), head=76, jaw=6, wing=WING_HALF, tail=(276, 3, 10, 2.2)),
    ]


SLAM_ANIMS = {'slam': (anim_slam, 8, False)}


# Rhagal: near-black green scales, emerald eyes, wings that burn at the edges.
RHAGAL = dict(
    back=(14, 20, 16), side=(30, 46, 34), belly=(96, 104, 76), belly_d=(62, 70, 50),
    scale=(6, 10, 8), spike=(10, 12, 10), horn=(126, 124, 108), horn_d=(52, 50, 44),
    mem=(34, 26, 22), mem_l=(255, 128, 34), bone=(22, 26, 22), claw=(220, 214, 196),
    mouth=(40, 70, 40), eye=(130, 255, 150), fire=(120, 255, 140), fire_l=(220, 255, 220),
)
RHAGAL_OPTS = {'horn': 1.2}


def anim_breath_level():
    """A long horizontal breath: rear back, then the head level with the bridge."""
    frames = [
        P(C=(462, 352), Hp=(318, 368), neck=(170, -9), head=104, jaw=4, glow=0.3,
          tail=(272, 3, 10, 0.3), wing=wing_mix(WING_HALF, WING_UP, 0.5)),
        P(C=(452, 344), Hp=(316, 368), neck=(182, -8), head=116, jaw=10, glow=0.65,
          tail=(270, 3, 12, 0.8), wing=WING_UP),
        P(C=(484, 362), Hp=(324, 368), neck=(124, -6), head=92, jaw=24, glow=0.9,
          tail=(276, 3, 12, 1.3), wing=wing_mix(WING_UP, WING_HALF, 0.5)),
    ]
    for k in range(4):
        j = math.sin(k * 1.9)
        frames.append(P(C=(492, 366 + j), Hp=(328, 368), neck=(116 + 2 * j, -4), head=92 + j, jaw=30 + 2 * j,
                        glow=1.0, tail=(278, 3, 12, 1.8 + k * 0.6), wing=wing_mix(WING_HALF, WING_UP, 0.3)))
    frames.append(P(C=(476, 362), Hp=(322, 367), neck=(150, -13), head=74, jaw=8, glow=0.3,
                    tail=(276, 3.2, 10, 4.4), wing=WING_HALF))
    return frames


BREATH_LEVEL_ANIMS = {'breath_level': (anim_breath_level, 10, False)}


# ------------------------------------------------------------ Vhagar ------
# The oldest and largest: heavy dark-bronze and charcoal scutes, scars,
# vast horns, molten fissures in the seams. Ridden by Aemond Targaryen.

VHAGAR = dict(
    back=(24, 23, 22), side=(54, 46, 38), belly=(104, 86, 66), belly_d=(66, 54, 42),
    scale=(12, 10, 10), spike=(22, 20, 18), horn=(150, 134, 106), horn_d=(66, 54, 40),
    mem=(40, 34, 32), mem_l=(92, 70, 52), bone=(34, 28, 26), claw=(212, 198, 168),
    mouth=(62, 16, 10), eye=(255, 172, 60), fire=(255, 130, 30), fire_l=(255, 222, 130),
    plate=(36, 32, 30), plate_l=(132, 100, 60), fissure=(255, 118, 28),
)
VHAGAR_OPTS = {'armor': True, 'horn': 1.8, 'rider': 'aemond', 'bulk': 1.24, 'fissure': 0.45,
               'scars': True, 'lighting': True, 'head_scale': 1.48}

# Second life: the fissures blaze, the eyes burn white-gold, plates are cracked.
VHAGAR_AWAKE = dict(VHAGAR, eye=(255, 240, 170), side=(70, 48, 36), mem_l=(140, 70, 36), plate_l=(150, 100, 56),
                    fissure=(255, 150, 40), belly=(140, 88, 54))
VHAGAR_AWAKE_OPTS = dict(VHAGAR_OPTS, fissure=1.0, cracked=True)


def draw_rider_aemond(c, B, pose):
    """Aemond, small against the dragon's bulk: black armour, a dark cloak
    lined in red, long silver hair, an eyepatch. Raises his blade to signal."""
    s, lift = 0.8, 14 * OPTS.get('bulk', 1.0) - 6

    def R(x, y):
        return B(x * s, 38 + (y - 38) * s + lift)

    wind = 6 * math.sin(pose.get('tail', (0, 0, 0, 0))[3] * 1.7)
    cloak = [R(-2, 74), R(-30, 72 + wind * 0.3), R(-70, 60 + wind), R(-86, 42 + wind), R(-52, 38), R(-14, 44)]
    c.poly(cloak, (22, 20, 24), ow=OW)
    c.line([R(-8, 70), R(-62, 54 + wind)], (110, 20, 26), 2)
    c.poly([R(-14, 40), R(10, 40), R(12, 34), R(-16, 34)], (52, 36, 26), ow=OW)            # saddle
    c.capsule(R(-2, 42), R(14, 26), 5.5 * s, 4.5 * s, (34, 34, 40), ow=OW)
    c.capsule(R(14, 26), R(10, 10), 4.5 * s, 3.6 * s, (26, 26, 30), ow=OW)
    c.poly([R(4, 12), R(18, 12), R(18, 6), R(4, 6)], (20, 18, 20), ow=OW * 0.8)
    torso = [R(-10, 42), R(8, 42), R(14, 60), R(10, 76), R(-4, 76), R(-10, 60)]
    c.grad_poly(torso, (92, 94, 106), (30, 30, 36), R(10, 70), R(-8, 44), ow=OW)
    c.line([R(-8, 50), R(12, 66)], (140, 26, 32), 2.4)
    sig = pose.get('rider_signal', 0)
    if sig:
        hand = R(26, 104)
        c.capsule(R(6, 72), hand, 4 * s, 3.4 * s, (70, 72, 82), ow=OW)
        tip = R(44, 142)
        c.capsule(hand, tip, 1.6, 0.6, (150, 150, 166), ow=OW * 0.6)                   # raised blade
        g = c.layer()
        g.circle(tip, 5, (255, 220, 160, 200), outline=None)
        c.glow(g.img, 4, 1.0)
    else:
        hand = R(22, 58)
        c.capsule(R(6, 72), hand, 4 * s, 3.4 * s, (70, 72, 82), ow=OW)
        c.line([hand, R(44, 50)], (50, 34, 26), 1.2)                                   # reins
    head = R(6, 86)
    c.circle(head, 7.5 * s, (232, 206, 190), ow=OW)
    hair = [R(10, 95), R(-2, 96), R(-26, 86 + wind * 0.4), R(-38, 70 + wind * 0.7), R(-16, 78), R(-2, 84), R(0, 90)]
    c.poly(hair, (230, 230, 236), ow=OW * 0.8)
    c.line([R(-4, 90), R(12, 86)], (14, 12, 14), 1.0)                                  # eyepatch strap
    c.circle(R(10, 87), 1.8 * s, (14, 12, 14), outline=None)
    return head


def anim_wingspread():
    """Rear up, wings thrown wide, then heavy forward beats (the gust)."""
    frames = [
        P(C=(456, 344), Hp=(318, 370), neck=(176, -8), head=104, jaw=8, wing=WING_UP, wing_far=WING_UP,
          tail=(272, 3, 10, 0.2), rider_signal=1),
        P(C=(444, 330), Hp=(316, 372), neck=(190, -6), head=124, jaw=16, wing=dict(WING_UP, scale=1.05),
          wing_far=WING_UP, tail=(270, 3, 12, 0.6), rider_signal=1),
    ]
    for k in range(4):
        w = WING_DOWN if k % 2 == 0 else WING_MID
        frames.append(P(C=(470, 350 + 3 * (k % 2)), Hp=(320, 370), neck=(150, -10), head=92, jaw=22, wing=w,
                        wing_far=wing_mix(w, WING_UP, 0.35), tail=(274, 3, 12, 1.0 + k * 0.6)))
    frames.append(P(C=(472, 360), Hp=(322, 367), neck=(150, -13), head=74, jaw=6, wing=WING_HALF,
                    tail=(276, 3.2, 10, 3.4)))
    return frames


def anim_tail_low():
    """The tail coils high, then scythes along the ground behind the body."""
    return [
        P(C=(468, 372), Hp=(318, 362), neck=(150, -12), head=74, tail=(250, 2.4, 14, 0.2), wing=WING_HALF),
        P(C=(472, 378), Hp=(316, 358), neck=(146, -12), head=72, tail=(236, 3.4, 16, 0.6), wing=WING_HALF),
        P(C=(474, 380), Hp=(318, 370), neck=(150, -12), head=72, tail=(272, 1.6, 18, 1.2), wing=WING_MID),
        P(C=(476, 382), Hp=(322, 374), neck=(150, -12), head=72, tail=(286, 0.4, 6, 1.8), wing=WING_MID),
        P(C=(476, 380), Hp=(322, 374), neck=(150, -12), head=72, tail=(288, 0.2, 8, 2.4), wing=WING_HALF),
        P(C=(472, 364), Hp=(320, 368), neck=(150, -13), head=74, tail=(276, 3.0, 10, 3.0), wing=WING_HALF),
    ]


def anim_tail_high():
    """The tail drops low, then lashes up and across at chest height."""
    return [
        P(C=(468, 366), Hp=(318, 370), neck=(150, -12), head=74, tail=(292, 2.0, 10, 0.2), wing=WING_HALF),
        P(C=(470, 370), Hp=(316, 372), neck=(146, -12), head=72, tail=(300, 2.4, 12, 0.6), wing=WING_HALF),
        P(C=(474, 368), Hp=(320, 362), neck=(150, -12), head=72, tail=(262, -0.6, 14, 1.2), wing=WING_MID),
        P(C=(476, 366), Hp=(322, 358), neck=(150, -12), head=72, tail=(258, -0.2, 8, 1.8), wing=WING_MID),
        P(C=(476, 366), Hp=(322, 358), neck=(150, -12), head=72, tail=(254, 0.2, 8, 2.4), wing=WING_HALF),
        P(C=(472, 364), Hp=(320, 368), neck=(150, -13), head=74, tail=(276, 3.0, 10, 3.0), wing=WING_HALF),
    ]


def anim_rise():
    """Second life: the collapse played backwards, Aemond's blade raised."""
    frames = anim_death()[::-1]
    for i, f in enumerate(frames):
        f['rider_signal'] = 1
        f['eye_closed'] = i < 2
        f['glow'] = 0.3 + 0.5 * i / (len(frames) - 1)
    return frames


def anim_death_unseated():
    """Final death: Aemond is thrown from the saddle as the dragon falls."""
    frames = anim_death()
    for i, f in enumerate(frames):
        if i >= 3:
            f['rider_off'] = True
    return frames


# Drogon: near-black scales with a deep red sheen, red-black wings, ember eyes.
DROGON = dict(
    back=(16, 12, 14), side=(44, 20, 20), belly=(112, 46, 32), belly_d=(74, 28, 20),
    scale=(8, 4, 4), spike=(14, 8, 8), horn=(66, 44, 38), horn_d=(30, 20, 18),
    mem=(64, 16, 14), mem_l=(150, 38, 22), bone=(24, 12, 12), claw=(206, 194, 172),
    mouth=(60, 10, 8), eye=(255, 120, 40), fire=(255, 110, 30), fire_l=(255, 210, 120),
)
DROGON_OPTS = {'horn': 1.35, 'bulk': 1.12, 'lighting': True}

# Viserion: cream and gold scales, gold wings, eyes gone ice-blue; his fire burns pale.
VISERION = dict(
    back=(186, 160, 112), side=(222, 198, 150), belly=(238, 224, 192), belly_d=(198, 176, 136),
    scale=(140, 110, 70), spike=(160, 128, 80), horn=(240, 232, 206), horn_d=(150, 128, 96),
    mem=(196, 146, 66), mem_l=(242, 204, 122), bone=(164, 124, 66), claw=(250, 242, 224),
    mouth=(70, 40, 40), eye=(140, 220, 255), fire=(140, 200, 255), fire_l=(226, 244, 255),
)
VISERION_OPTS = {'horn': 1.1, 'lighting': True}


# ------------------------------------------------------------ Level 7 ------
# Sunfyre the Golden: gleaming gold scales, long elegant wings, amber eyes,
# fire like molten gold.
SUNFYRE = dict(
    back=(150, 104, 30), side=(214, 160, 52), belly=(250, 222, 150), belly_d=(206, 168, 92),
    scale=(120, 78, 20), spike=(176, 120, 36), horn=(250, 236, 196), horn_d=(170, 130, 70),
    mem=(214, 140, 40), mem_l=(255, 214, 110), bone=(160, 104, 30), claw=(255, 246, 220),
    mouth=(90, 40, 16), eye=(255, 176, 40), fire=(255, 190, 60), fire_l=(255, 244, 170),
)
SUNFYRE_OPTS = {'headroom': 140, 'horn': 1.15, 'wing': 1.16, 'lighting': True}

# Vermithor the Bronze Fury: massive bronze scutes, heavy swept horns,
# muscular limbs, a broad powerful silhouette.
VERMITHOR = dict(
    back=(70, 44, 22), side=(126, 82, 40), belly=(180, 136, 84), belly_d=(132, 96, 56),
    scale=(44, 26, 12), spike=(64, 40, 20), horn=(206, 182, 140), horn_d=(104, 80, 50),
    mem=(96, 58, 28), mem_l=(170, 112, 52), bone=(76, 46, 22), claw=(236, 222, 190),
    mouth=(70, 20, 10), eye=(255, 150, 40), fire=(255, 140, 40), fire_l=(255, 226, 140),
    plate=(92, 58, 28), plate_l=(196, 140, 70), fissure=(255, 140, 40),
)
VERMITHOR_OPTS = {'headroom': 140, 'armor': True, 'horn': 1.7, 'bulk': 1.26, 'fissure': 0.0, 'scars': True, 'lighting': True,
                  'head_scale': 1.38}

# Balerion the Black Dread: enormous black wings, ancient scars, molten
# orange cracks through the plates, burning eyes. Dwarfs everything.
BALERION = dict(
    back=(10, 9, 10), side=(30, 26, 26), belly=(62, 46, 40), belly_d=(38, 28, 26),
    scale=(4, 4, 5), spike=(14, 12, 12), horn=(70, 62, 58), horn_d=(26, 22, 22),
    mem=(20, 16, 18), mem_l=(64, 32, 26), bone=(16, 14, 14), claw=(190, 176, 160),
    mouth=(90, 20, 8), eye=(255, 120, 30), fire=(255, 110, 30), fire_l=(255, 214, 120),
    plate=(16, 14, 14), plate_l=(84, 56, 40), fissure=(255, 104, 24),
)
BALERION_OPTS = {'headroom': 140, 'armor': True, 'horn': 1.9, 'bulk': 1.32, 'fissure': 0.85, 'cracked': True, 'scars': True,
                 'lighting': True, 'head_scale': 1.5, 'wing': 1.12}


def anim_flight_strike():
    """Flight with Aemond's blade raised: the spear throws and the low swoop."""
    frames = anim_flight()
    for f in frames:
        f['rider_signal'] = 1
    return frames


VHAGAR_ANIMS = {'flight_strike': (anim_flight_strike, 10, True),
                'wingspread': (anim_wingspread, 9, False), 'tail_low': (anim_tail_low, 10, False),
                'tail_high': (anim_tail_high, 10, False)}
