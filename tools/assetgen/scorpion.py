"""The scorpion: a giant ballista on a wheeled carriage. The engine rotates
the arm around its pivot and draws the bolt, so it is exported in parts.
All parts face right; the engine mirrors them when aiming left."""
import math

from .common import Canvas, OUTLINE

WOOD, WOOD_D, WOOD_L = (104, 72, 46), (62, 42, 28), (140, 104, 70)
IRON, IRON_L = (54, 56, 62), (130, 134, 144)


def base():
    c = Canvas(320, 240, 4)
    c.poly([(40, 196), (96, 92), (124, 92), (90, 196)], WOOD, ow=1.6)          # trestle legs
    c.poly([(280, 196), (224, 92), (196, 92), (230, 196)], WOOD, ow=1.6)
    c.poly([(70, 150), (250, 150), (250, 166), (70, 166)], WOOD_D, ow=1.4)
    c.poly([(110, 96), (210, 96), (196, 70), (124, 70)], IRON, ow=1.6)         # turntable mount
    c.circle((160, 68), 15, IRON_L, ow=1.6)
    c.circle((160, 68), 6, IRON, outline=None)
    for wx in (70, 250):                                                        # spoked wheels
        c.circle((wx, 196), 40, WOOD_D, ow=1.8)
        c.circle((wx, 196), 33, WOOD, outline=None)
        for k in range(8):
            a = k * math.pi / 4
            c.line([(wx, 196), (wx + math.cos(a) * 33, 196 + math.sin(a) * 33)], WOOD_D, 4)
        c.ring((wx, 196), 38, IRON, 5)
        c.circle((wx, 196), 9, IRON_L, ow=1.2)
    return c.finish(), (160, 68)


def arm(loaded):
    """Rail, steel recurve bow arms, crank and string. Pivot at (130, 60)."""
    c = Canvas(380, 120 + 200, 4)
    py = 160
    c.poly([(20, py - 12), (360, py - 9), (360, py + 9), (20, py + 12)], WOOD, ow=1.6)   # rail
    c.line([(24, py - 3), (356, py - 3)], WOOD_L, 2)
    for x in (70, 160, 250, 330):
        c.poly([(x - 6, py - 13), (x + 6, py - 13), (x + 6, py + 13), (x - 6, py + 13)], IRON, ow=1.0)
    c.circle((44, py + 22), 20, WOOD_D, ow=1.4)                                 # crank wheel
    for k in range(6):
        a = k * math.pi / 3
        c.line([(44, py + 22), (44 + math.cos(a) * 20, py + 22 + math.sin(a) * 20)], WOOD, 3)
    for side in (-1, 1):                                                        # bow arms
        pts = [(330, py), (318, py + side * 50), (296, py + side * 100), (276, py + side * 136), (284, py + side * 142),
               (306, py + side * 104), (330, py + side * 54), (342, py)]
        c.poly(pts, IRON, ow=1.6)
        c.line([(332, py + side * 6), (322, py + side * 52), (300, py + side * 102)], IRON_L, 1.6)
    tips = [(278, py - 140), (278, py + 140)]
    nock = (96, py) if loaded else (300, py)
    c.line([tips[0], nock, tips[1]], (214, 200, 170), 2.2)
    if loaded:
        draw_bolt(c, 96, py, 1.0)
    return c.finish(), (130, py)


def draw_bolt(c, x, y, s):
    L = 280 * s
    c.poly([(x, y - 3), (x + L, y - 3), (x + L, y + 3), (x, y + 3)], (120, 90, 60), ow=1.0)
    head = [(x + L - 4, y - 12), (x + L + 40 * s, y), (x + L - 4, y + 12), (x + L + 8, y)]
    c.poly(head, (70, 74, 84), ow=1.2)
    c.line([(x + L + 4, y - 6), (x + L + 30 * s, y)], (170, 176, 188), 1.2)
    for side in (-1, 1):
        c.poly([(x + 4, y), (x + 30, y + side * 3), (x + 14, y + side * 14), (x - 4, y + side * 12)], (180, 40, 40),
               ow=0.8)


def bolt():
    c = Canvas(340, 40, 4)
    draw_bolt(c, 10, 20, 1.0)
    return c.finish(), (10, 20)


def parts():
    b, mount = base()
    al, pivot = arm(True)
    ae, _ = arm(False)
    bl, nock = bolt()
    return {'base': b, 'arm_loaded': al, 'arm_empty': ae, 'bolt': bl}, {
        'mount': list(mount), 'pivot': list(pivot), 'muzzle': [340 - pivot[0], 0], 'bolt_nock': list(nock),
        'note': 'arm rotates about pivot, placed on the base mount; parts face right'}
