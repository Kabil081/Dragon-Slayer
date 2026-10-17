"""Frostpiercer, the Dragonbreaker (Level 7): an ancient shoulder-mounted
spear launcher. A long rail of dark steel on folding mechanical arms, a
caged ice core at the breech that powers it, blue runes down the rail and
three claw prongs at the muzzle that open as it deploys. It throws a
spear of ice-forged steel. The rotating energy rings and the charge glow
are drawn live by the engine.

Every image is drawn facing right in units of one world pixel (engine
scale 1 = PX px per unit); the anchor is the shoulder grip.
"""
import math

from PIL import Image

from .common import Canvas, OUTLINE, rim_light, seeded, shade

PX = 2                      # output px per unit
SS = 4                      # supersampling
GW, GH = 330, 150           # launcher canvas (units)
GRIP = (106, 92)            # the shoulder grip, in canvas units
STEEL = (44, 48, 58)
STEEL_L = (120, 128, 146)
STEEL_D = (20, 22, 28)
ICE = (150, 220, 255)
ICE_L = (226, 246, 255)
BRASS = (150, 128, 84)


def _canvas(w, h, origin):
    return Canvas(w, h, SS * PX, origin=origin)


def _finish(c, w, h, light=True):
    img = c.finish((w * PX, h * PX))
    return rim_light(img, px=PX, top_k=0.45, bottom_k=0.25) if light else img


def _spear(c, x0, y, length=190, loaded=False):
    """The ice-forged spear lying along +x from x0 (its tail)."""
    tip = x0 + length
    c.poly([(x0, y - 2.6), (tip - 38, y - 2.8), (tip - 38, y + 2.8), (x0, y + 2.6)], STEEL, ow=0.8)
    c.line([(x0 + 4, y - 1.2), (tip - 40, y - 1.2)], STEEL_L, 0.5)
    for k in range(5):                                   # runes along the shaft
        x = x0 + 26 + k * 24
        c.line([(x, y - 1.8), (x + 4, y + 0.4), (x + 1, y + 1.8)], ICE, 0.7)
    # fletching fins at the tail
    c.poly([(x0 - 2, y), (x0 + 16, y - 9), (x0 + 22, y - 2)], (70, 90, 120), ow=0.7)
    c.poly([(x0 - 2, y), (x0 + 16, y + 9), (x0 + 22, y + 2)], (70, 90, 120), ow=0.7)
    # the head: a long crystalline blade of ice with a steel collar
    g = c.layer()
    head = [(tip - 42, y - 7), (tip - 22, y - 9), (tip, y), (tip - 22, y + 9), (tip - 42, y + 7)]
    g.poly(head, ICE + (220,), outline=None)
    c.glow(g.img, 4, 1.0 if loaded else 1.2)
    c.grad_poly(head, ICE, ICE_L, (tip - 42, y), (tip, y), ow=0.8)
    c.poly([(tip - 36, y - 3), (tip - 10, y - 1.2), (tip - 36, y + 1)], (236, 250, 255), outline=None)
    c.poly([(tip - 46, y - 5), (tip - 40, y - 7.6), (tip - 40, y + 7.6), (tip - 46, y + 5)], BRASS, ow=0.8)


def launcher(k=1.0, loaded=True):
    """k = deploy progress: 0 folded on the back, 1 open on the shoulder."""
    c = _canvas(GW, GH, (0, 0))
    gx, gy = GRIP
    rail_y = gy - 14 - 10 * k                 # the rail lifts as the arms open
    x_rear, x_muz = gx - 62, gx + 150 - 30 * (1 - k)
    # folding arms from the shoulder cradle to the rail
    for (ax, ay), (bx, by) in (((gx - 10, gy + 4), (gx - 34, rail_y + 6)), ((gx + 10, gy + 4), (gx + 30, rail_y + 6))):
        mx, my = (ax + bx) / 2 + 8 * (1 - k), (ay + by) / 2 + 6 * k
        c.capsule((ax, ay), (mx, my), 3.4, 3.0, STEEL, ow=0.8)
        c.capsule((mx, my), (bx, by), 3.0, 2.6, STEEL, ow=0.8)
        c.circle((mx, my), 3.2, BRASS, ow=0.7)
        c.circle((bx, by), 2.4, STEEL_L, ow=0.6)
    # shoulder cradle
    c.poly([(gx - 20, gy + 2), (gx + 20, gy + 2), (gx + 14, gy + 12), (gx - 14, gy + 12)], STEEL_D, ow=0.9)
    c.line([(gx - 16, gy + 5), (gx + 16, gy + 5)], STEEL_L, 0.5)
    # the rail: upper housing and lower guide with a slit for the spear
    top = [(x_rear, rail_y - 14), (x_muz - 14, rail_y - 12), (x_muz, rail_y - 6), (x_muz, rail_y + 6),
           (x_muz - 14, rail_y + 12), (x_rear, rail_y + 15)]
    c.grad_poly(top, STEEL_L, STEEL_D, (0, rail_y - 14), (0, rail_y + 15), ow=1.1)
    # armored side plates with engraved edges, and three ring mounts
    for i, (a0, a1) in enumerate(((0.10, 0.34), (0.38, 0.62), (0.66, 0.86))):
        x0, x1 = x_rear + (x_muz - x_rear) * a0, x_rear + (x_muz - x_rear) * a1
        c.grad_poly([(x0, rail_y + 4), (x1, rail_y + 4), (x1 - 4, rail_y + 14), (x0 + 4, rail_y + 14)],
                    shade(STEEL, 1.2), STEEL_D, (0, rail_y + 4), (0, rail_y + 14), ow=0.7)
        c.line([(x0 + 3, rail_y + 6), (x1 - 3, rail_y + 6)], STEEL_L, 0.5)
    for a in (0.24, 0.52, 0.80):
        x = x_rear + (x_muz - x_rear) * a
        c.poly([(x - 4, rail_y - 17), (x + 4, rail_y - 17), (x + 5, rail_y + 17), (x - 5, rail_y + 17)],
               STEEL_D, ow=0.8)
        c.line([(x - 2.4, rail_y - 15), (x - 2.4, rail_y + 15)], BRASS, 0.7)
    c.poly([(x_rear + 8, rail_y - 2.2), (x_muz - 6, rail_y - 2.2), (x_muz - 6, rail_y + 2.2), (x_rear + 8, rail_y + 2.2)],
           (10, 12, 18), outline=None)
    rs = seeded(707)
    for x in range(int(x_rear) + 12, int(x_muz) - 10, 16):             # plates and rivets
        c.line([(x, rail_y - 8.4), (x, rail_y - 3)], STEEL_D, 0.6)
        c.circle((x + 4, rail_y + 6.4), 1.0, STEEL_L, outline=None)
    if loaded:
        _spear(c, x_rear + 30, rail_y, length=(x_muz + 26) - (x_rear + 30), loaded=True)
    # glowing runes on the housing
    rl = c.layer()
    for i in range(7):
        x = x_rear + 22 + i * ((x_muz - x_rear - 40) / 6)
        a = rs.uniform(-1, 1)
        rl.line([(x - 2, rail_y - 6.6), (x + 1 + a, rail_y - 4.8), (x - 1, rail_y - 3.6)], ICE + (255,), 0.8)
    c.glow(rl.img, 2.0, 1.0 + 0.4 * k)
    c.composite(rl.img)
    # muzzle: three claw prongs that open with k
    for s in (-1, 0, 1):
        a = math.radians(s * (8 + 22 * k))
        L = 16 + 6 * k
        bx, by = x_muz - 2, rail_y + s * 5
        tx, ty = bx + math.cos(a) * L, by + math.sin(a) * L
        c.poly([(bx, by - 3), (tx, ty), (bx, by + 3)], STEEL_L if s == 0 else STEEL, ow=0.8)
    c.circle((x_muz - 4, rail_y), 4.4, STEEL_D, ow=0.8)
    # the ice core in its cage at the breech
    cx, cy = x_rear - 4, rail_y + 1
    c.poly([(cx - 4, cy - 22), (cx + 18, cy - 20), (cx + 18, cy + 22), (cx - 4, cy + 24), (cx - 16, cy + 1)],
           STEEL_D, ow=1.0)                                     # the breech block that holds it
    g = c.layer()
    g.circle((cx, cy), 19, ICE + (210,), outline=None)
    c.glow(g.img, 8, 1.0 + 0.5 * k)
    c.composite(g.img, opacity=0.55)
    core = [(cx, cy - 17), (cx + 12, cy - 8), (cx + 12, cy + 8), (cx, cy + 17), (cx - 12, cy + 8), (cx - 12, cy - 8)]
    c.grad_poly(core, ICE, ICE_L, (cx - 9, cy), (cx + 9, cy), ow=0.9)
    c.poly([(cx - 2, cy - 9), (cx + 4, cy - 4), (cx - 1, cy + 2)], (255, 255, 255), outline=None)
    for a in (0, 60, 120):                                   # cage bars
        r = math.radians(a)
        c.line([(cx + math.cos(r) * 17, cy + math.sin(r) * 17), (cx - math.cos(r) * 17, cy - math.sin(r) * 17)],
               STEEL_D, 1.3)
    c.capsule((cx + 12, cy - 12), (x_rear + 30, rail_y - 13), 2.4, 2.0, BRASS, ow=0.6)
    c.capsule((cx + 12, cy + 12), (x_rear + 30, rail_y + 13), 2.4, 2.0, BRASS, ow=0.6)
    return _finish(c, GW, GH)


def spear_projectile():
    c = _canvas(240, 40, (0, 0))
    _spear(c, 14, 20, length=212)
    return _finish(c, 240, 40, light=False)


def frames():
    """Deploy sequence (folded -> open, loaded), plus the open launcher empty."""
    out = {f'deploy_{i}': launcher(i / 4, True) for i in range(5)}
    out['empty'] = launcher(1.0, False)
    out['spear'] = spear_projectile()
    return out


def meta():
    gx, gy = GRIP
    rail_y = gy - 24
    return {'px_per_unit': PX, 'grip': [gx * PX, gy * PX],
            'muzzle': [(gx + 150 + 20) * PX, rail_y * PX], 'core': [(gx - 66) * PX, (rail_y + 1) * PX],
            'rings': [[(gx - 62 + 212 * a) * PX, rail_y * PX] for a in (0.24, 0.52, 0.80)],
            'rail': [rail_y * PX], 'spear_tip': [226 * PX, 20 * PX]}


def icon():
    img = launcher(1.0, True)
    box = img.getbbox()
    img = img.crop(box)
    w, h = img.size
    return img.resize((w // 2, h // 2), Image.LANCZOS)
