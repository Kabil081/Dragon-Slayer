"""Six weapon designs. Each is drawn pointing up, in local units where the
origin (0, 0) is the point the warrior's fist closes around (the grip)."""
import math

from PIL import Image, ImageDraw, ImageFilter

from .common import Canvas, OUTLINE, mix, shade, seeded

OW = 0.75

WEAPONS = {
    #               blade tip y   half-width  grip bottom   display name
    'steel_sword':        dict(tip=-72,  hw=12, bottom=15, name='Steel Sword'),
    'northern_longsword': dict(tip=-88,  hw=15, bottom=23, name='Northern Longsword'),
    'greatsword':         dict(tip=-114, hw=19, bottom=30, name='Greatsword'),
    'frostblade':         dict(tip=-82,  hw=14, bottom=17, name='Frostblade'),
    'lightbreaker':       dict(tip=-92,  hw=15, bottom=20, name='Lightbreaker'),
    'dragonbane':         dict(tip=-95,  hw=17, bottom=19, name='Dragonbane'),
    # battlefield finds (Level 5)
    'war_hammer':         dict(tip=-102, hw=24, bottom=38, name='War Hammer'),
    'twin_daggers':       dict(tip=-44,  hw=8,  bottom=10, name='Twin Daggers', dual=True),
    'long_spear':         dict(tip=-120, hw=9,  bottom=54, name='Long Spear'),
    'hunters_crossbow':   dict(tip=-60,  hw=29, bottom=24, name="Hunter's Crossbow"),
    'frostbound_axe':     dict(tip=-76,  hw=21, bottom=16, name='Frostbound Axe'),
    # carried by Aemond in the Level 5 cinematics; not a warrior variant
    'gatechain_flail':    dict(tip=-114, hw=15, bottom=20, name='Gatechain Flail'),
    'aemond_blade':       dict(tip=-86,  hw=13, bottom=17, name='Valyrian Blade', npc=True),
    # Level 7
    'frostbrand':         dict(tip=-96,  hw=17, bottom=21, name='Frostbrand'),
    'blackfyre':          dict(tip=-100, hw=17, bottom=22, name='Blackfyre', npc=True),
}

STEEL_D = (112, 120, 134)
STEEL_L = (218, 225, 233)


def _grip(c, y0, y1, hw, col, wrap):
    c.poly([(-hw, y0), (hw, y0), (hw, y1), (-hw, y1)], col, ow=OW)
    y = y0 + 1.6
    while y < y1 - 0.6:
        c.line([(-hw + 0.2, y + 0.9), (hw - 0.2, y - 0.6)], wrap, 0.45)
        y += 2.2


def _blade(c, pts, dark, light, fuller=None, edge=True):
    xs = [p[0] for p in pts]
    c.grad_poly(pts, dark, light, (min(xs), 0), (max(xs), 0), ow=OW)
    if fuller:
        (y0, y1, w) = fuller
        c.poly([(-w / 2, y0), (w / 2, y0), (w / 2 * 0.6, y1), (-w / 2 * 0.6, y1)],
               shade(dark, 0.85), outline=None)
        c.line([(w / 2 + 0.15, y0), (w / 2 * 0.6 + 0.15, y1)], shade(light, 1.05), 0.35)
    if edge:
        right = [p for p in pts if p[0] >= 0]
        right.sort(key=lambda p: p[1])
        c.line(right, (250, 252, 255), 0.4)


def draw_steel_sword(c):
    _blade(c, [(-3.6, -7), (-2.9, -58), (0, -72), (2.9, -58), (3.6, -7)],
           STEEL_D, STEEL_L, fuller=(-10, -52, 1.6))
    _grip(c, -5.5, 9, 2.1, (92, 60, 40), (60, 38, 26))
    c.poly([(-11.5, -8.5), (11.5, -8.5), (12.3, -6.8), (11.5, -5), (-11.5, -5), (-12.3, -6.8)],
           (104, 104, 112), ow=OW)
    c.line([(-10.5, -7.6), (10.5, -7.6)], (170, 172, 180), 0.5)
    c.circle((0, 12), 3.3, (110, 110, 118), ow=OW)
    c.circle((-0.9, 11.1), 1.1, (190, 192, 200), outline=None)


def draw_northern_longsword(c):
    _blade(c, [(-3.4, -8), (-2.6, -72), (0, -88), (2.6, -72), (3.4, -8)],
           (104, 116, 134), (220, 230, 242), fuller=(-11, -70, 1.5))
    _grip(c, -6, 16, 2.0, (48, 34, 28), (28, 20, 16))
    # quillons curve toward the blade
    c.poly([(-2.5, -9.5), (-9, -9.2), (-13.5, -11.8), (-15, -10.6), (-12.5, -7.2), (-3, -5),
            (3, -5), (12.5, -7.2), (15, -10.6), (13.5, -11.8), (9, -9.2), (2.5, -9.5)],
           (70, 70, 78), ow=OW)
    c.line([(-12, -9.8), (12, -9.8)], (130, 132, 142), 0.45)
    c.circle((0, 19.5), 4.2, (78, 78, 86), ow=OW)
    c.circle((0, 19.5), 2.1, (52, 52, 58), outline=None)
    c.circle((-1.2, 18.3), 0.9, (170, 172, 182), outline=None)


def draw_greatsword(c):
    _blade(c, [(-4.0, -9), (-4.0, -19), (-5.4, -21), (-4.6, -100), (0, -114), (4.6, -100),
               (5.4, -21), (4.0, -19), (4.0, -9)],
           STEEL_D, STEEL_L, fuller=(-24, -92, 2.2))
    # parrying lugs
    c.poly([(-4.4, -20), (-8.5, -23), (-8, -21), (-4.4, -18)], (120, 124, 134), ow=OW * 0.8)
    c.poly([(4.4, -20), (8.5, -23), (8, -21), (4.4, -18)], (120, 124, 134), ow=OW * 0.8)
    _grip(c, -6, 22, 2.4, (70, 46, 32), (44, 28, 20))
    c.poly([(-2.9, 7), (2.9, 7), (2.9, 9.5), (-2.9, 9.5)], (110, 110, 118), ow=OW * 0.8)
    c.poly([(-17, -10.5), (-19.5, -12.5), (-19.5, -6.5), (-17, -6.5), (17, -6.5), (19.5, -6.5),
            (19.5, -12.5), (17, -10.5)], (96, 96, 104), ow=OW)
    c.line([(-18, -9.6), (18, -9.6)], (165, 168, 176), 0.55)
    c.poly([(0, 21.5), (4.4, 24.5), (3.6, 28.5), (0, 30), (-3.6, 28.5), (-4.4, 24.5)],
           (100, 100, 108), ow=OW)
    c.circle((-1.3, 25.4), 1.1, (185, 188, 196), outline=None)


def draw_frostblade(c):
    rng = seeded(7)
    left = [(-4.2, -8), (-5.2, -20), (-3.8, -26), (-5.0, -38), (-3.4, -46), (-4.4, -58),
            (-2.6, -66), (-2.8, -72)]
    right = [(2.6, -72), (2.4, -66), (4.2, -58), (3.2, -50), (4.8, -40), (3.6, -30),
             (5.0, -22), (4.2, -8)]
    blade = left + [(0, -82)] + right
    # cold glow behind everything
    g = c.layer()
    g.poly(blade, (130, 215, 255, 200), outline=None)
    g.poly([(-14, -12), (14, -12), (14, -4), (-14, -4)], (130, 215, 255, 120), outline=None)
    c.glow(g.img, 3.2, 1.0)
    c.grad_poly(blade, (150, 205, 235, 235), (238, 250, 255, 240), (-5, 0), (5, 0), ow=OW)
    # inner facets
    facets = [[(-1, -10), (-3.6, -24), (0.4, -30)], [(0.6, -32), (-3.2, -44), (1.6, -50)],
              [(-0.4, -52), (-2.6, -64), (1.2, -70)], [(1, -12), (3.6, -26), (0.8, -28)],
              [(1.2, -36), (3.6, -46), (0.8, -48)]]
    for f in facets:
        c.poly(f, (205, 238, 252, 220), outline=None)
    c.line([(0.2, -9), (0.2, -76)], (255, 255, 255, 230), 0.5)
    # ice shard guard
    for (x, y, a, l) in [(-4, -7, -70, 10), (-3, -7, -40, 8), (4, -7, 70, 10), (3, -7, 40, 8),
                         (-2, -7, -15, 6), (2, -7, 15, 6)]:
        r = math.radians(a)
        tip = (x + math.sin(r) * l, y - math.cos(r) * l * 0.55)
        base_a = (x - 1.3, y + 0.8)
        base_b = (x + 1.3, y + 0.8)
        c.poly([base_a, tip, base_b], (170, 226, 250), ow=OW * 0.8)
    c.poly([(-6, -7.5), (6, -7.5), (6.5, -4.6), (-6.5, -4.6)], (190, 200, 214), ow=OW)
    _grip(c, -4.6, 10, 2.0, (196, 214, 230), (120, 150, 180))
    c.poly([(0, 10.5), (3.2, 13.6), (0, 17), (-3.2, 13.6)], (170, 226, 250), ow=OW)
    c.line([(-1.1, 12.6), (0, 11.6)], (255, 255, 255), 0.6)


def draw_flamecleaver(c):
    blade = [(-4.2, -7), (-4.2, -58), (-2.2, -68), (3.0, -76), (8.2, -63), (9.2, -46),
             (7.4, -26), (4.6, -7)]
    g = c.layer()
    g.line([(4.6, -8), (7.4, -26), (9.2, -46), (8.2, -63), (3.0, -76)], (255, 120, 30, 230), 4.0)
    c.glow(g.img, 3.0, 1.1)
    c.grad_poly(blade, (46, 38, 36), (104, 90, 84), (-4, 0), (9, 0), ow=OW)
    # glowing edge
    edge = [(4.4, -8), (7.1, -26), (8.9, -46), (7.9, -62.5), (3.0, -75.5)]
    c.line(edge, (255, 120, 28), 1.6)
    c.line(edge, (255, 214, 120), 0.6)
    # ember cracks
    ember = c.layer()
    for crack in [[(-1, -12), (1.5, -18), (0, -23), (2.8, -29)],
                  [(-2, -34), (0.6, -40), (-0.8, -45), (2.2, -51), (1.4, -56)],
                  [(5.2, -30), (3.0, -35), (4.6, -40)],
                  [(-1.5, -60), (0.8, -64), (0.2, -68)]]:
        ember.line(crack, (255, 140, 40), 0.75)
        ember.line(crack, (255, 220, 140), 0.3)
    c.glow(ember.img, 0.9, 0.9)
    c.composite(ember.img, c.mask(blade))
    c.line([(-3.4, -9), (-3.4, -57)], (140, 128, 120), 0.45)
    # blackened guard with curls
    c.poly([(-10, -8.6), (-12.5, -11.5), (-11, -12.2), (-8, -9.8), (8, -9.8), (11, -12.2),
            (12.5, -11.5), (10, -8.6), (9, -5), (-9, -5)], (52, 46, 46), ow=OW)
    c.line([(-8.5, -7.5), (8.5, -7.5)], (255, 110, 30), 0.5)
    _grip(c, -5, 10, 2.2, (122, 30, 24), (70, 16, 14))
    c.poly([(0, 10), (3.4, 12.2), (2.6, 15.5), (0, 17), (-2.6, 15.5), (-3.4, 12.2)],
           (60, 54, 54), ow=OW)
    c.poly([(-3.0, 12.6), (-5.4, 14.4), (-2.8, 14.6)], (60, 54, 54), ow=OW * 0.7)
    c.poly([(3.0, 12.6), (5.4, 14.4), (2.8, 14.6)], (60, 54, 54), ow=OW * 0.7)


def draw_dragonbane(c):
    blade = [(-3.8, -9), (-3.0, -78), (0, -95), (3.0, -78), (3.8, -9)]
    c.grad_poly(blade, (46, 48, 56), (118, 122, 132), (-4, 0), (4, 0), ow=OW)
    # rippled smoke-steel pattern, clipped to the blade
    rip = c.layer()
    for i in range(-14, 46):
        y0 = -9 - i * 2.1
        pts = []
        for k in range(15):
            x = -4 + k * 8 / 14
            pts.append((x, y0 + math.sin(k * 0.9 + i * 0.7) * 1.4 + math.sin(k * 0.35 + i) * 0.9
                        - x * 0.45))
        col = (156, 160, 172, 150) if i % 2 == 0 else (28, 30, 36, 150)
        rip.line(pts, col, 0.55)
    c.composite(rip.img, c.mask(blade))
    c.line([(0, -12), (0, -82)], (30, 32, 38), 0.8)
    c.line([(0.7, -12), (0.6, -82)], (150, 154, 166), 0.3)
    c.line([(3.7, -10), (2.9, -78), (0.1, -94)], (235, 238, 245), 0.4)
    # gold dragon-wing crossguard
    gold, gold_d, gold_l = (212, 168, 66), (140, 96, 30), (250, 222, 140)
    for s in (-1, 1):
        wing = [(0, -9), (s * 6, -10.5), (s * 11, -13), (s * 15.5, -17.5), (s * 16.5, -14),
                (s * 14.2, -12.2), (s * 15.6, -10.2), (s * 12.4, -8.8), (s * 13.6, -6.6),
                (s * 9, -6.2), (0, -5)]
        c.poly(wing, gold, ow=OW)
        c.line([(s * 2, -8.6), (s * 8, -10.2), (s * 14.6, -15.6)], gold_l, 0.45)
        c.line([(s * 8, -7.2), (s * 13, -9.2)], gold_d, 0.45)
    c.circle((0, -7.5), 2.4, gold, ow=OW)
    c.circle((0, -7.5), 1.1, (200, 26, 38), outline=None)
    _grip(c, -5, 12, 2.0, (26, 24, 26), gold)
    # gold claw clutching a red gem
    c.circle((0, 15.5), 3.3, (190, 24, 36), ow=OW)
    c.circle((-1.1, 14.4), 1.0, (255, 150, 150), outline=None)
    for s in (-1, 0, 1):
        c.poly([(s * 1.6 - 0.8, 12), (s * 1.6 + 0.8, 12), (s * 3.4, 15.5 + abs(s) * 0.4),
                (s * 2.8, 16.2)], gold, ow=OW * 0.6)


def draw_lightbreaker(c):
    """Dark northern steel with a white-gold core that glows like a seam of
    dawn; an ember-inlaid iron guard and an amber pommel stone."""
    blade = [(-3.8, -9), (-3.0, -76), (0, -92), (3.0, -76), (3.8, -9)]
    g = c.layer()
    g.line([(0, -12), (0, -84)], (255, 210, 120, 230), 3.2)
    c.glow(g.img, 2.6, 1.0)
    c.grad_poly(blade, (40, 42, 50), (116, 120, 132), (-4, 0), (4, 0), ow=OW)
    c.line([(0, -12), (0, -84)], (255, 226, 150), 1.1)
    c.line([(0, -14), (0, -80)], (255, 252, 230), 0.4)
    for k in range(6):                       # runes along the fuller
        y = -20 - k * 10
        c.line([(-1.8, y), (-0.6, y - 3), (-1.6, y - 6)], (255, 190, 90), 0.45)
        c.line([(1.8, y - 4), (0.6, y - 7), (1.6, y - 10)], (255, 190, 90), 0.45)
    c.line([(3.7, -10), (2.9, -76), (0.1, -91)], (236, 240, 248), 0.4)
    c.poly([(-15, -8.4), (-17, -12.6), (-12, -10.6), (-4, -10), (4, -10), (12, -10.6), (17, -12.6), (15, -8.4),
            (4, -5), (-4, -5)], (46, 44, 48), ow=OW)
    c.line([(-13, -8.8), (13, -8.8)], (255, 140, 50), 0.7)
    _grip(c, -5, 14, 2.1, (36, 26, 22), (120, 90, 60))
    c.circle((0, 17.5), 3.6, (60, 54, 52), ow=OW)
    c.circle((0, 17.5), 2.2, (255, 170, 60), outline=None)
    c.circle((-0.8, 16.7), 0.7, (255, 240, 200), outline=None)


def _haft(c, y0, y1, w0, w1, wood=(92, 66, 44)):
    c.grad_poly([(-w0, y0), (w0, y0), (w1, y1), (-w1, y1)], shade(wood, 0.7), shade(wood, 1.25),
                (-w0, 0), (w0, 0), ow=OW)
    rs = seeded(int(abs(y0 * 7 + y1)))
    for _ in range(5):                       # wood grain
        x = rs.uniform(-w1 * 0.6, w1 * 0.6)
        c.line([(x, y0 - 2), (x * 0.9, y1 + 2)], shade(wood, 0.82), 0.3)


def draw_war_hammer(c):
    """Two-handed northern war hammer: an iron-shod ash haft and a squared
    head with a hooked back spike, bound in bronze."""
    _haft(c, 36, -80, 2.4, 2.1)
    c.poly([(-2.9, 33), (2.9, 33), (3.2, 38), (-3.2, 38)], (70, 72, 80), ow=OW)
    _grip(c, -10, 20, 2.8, (54, 38, 30), (30, 22, 16))
    c.grad_poly([(-2.9, -44), (2.9, -44), (2.7, -78), (-2.7, -78)], (60, 62, 70), (130, 132, 142),
                (-3, 0), (3, 0), ow=OW * 0.8)                                   # langets
    for y in (-50, -62, -74):
        c.circle((0, y), 0.8, (170, 172, 180), outline=None)
    # head: a beveled iron block, striking face forward, spike behind
    block = [(-13, -98), (11, -98), (14, -95), (14, -76), (11, -73), (-13, -73), (-15, -76), (-15, -95)]
    c.grad_poly(block, (54, 56, 64), (150, 152, 164), (-15, -86), (14, -86), ow=OW)
    c.poly([(14, -96), (24, -97), (24, -72), (14, -73)], (96, 98, 108), ow=OW)          # striking face
    for y in (-93, -86, -79):
        c.line([(15.5, y), (23, y)], (60, 62, 70), 0.4)                                # waffled face
    c.poly([(-15, -92), (-23, -87), (-15, -80)], (84, 86, 96), ow=OW)                     # back spike
    c.poly([(-4, -98), (0, -102), (4, -98)], (110, 112, 122), ow=OW * 0.8)               # top spike
    c.poly([(-13, -80), (11, -80), (11, -77), (-13, -77)], (150, 112, 60), ow=OW * 0.6)  # bronze band
    c.poly([(-13, -94), (11, -94), (11, -91), (-13, -91)], (150, 112, 60), ow=OW * 0.6)
    c.line([(-11, -86), (-5, -89), (1, -86), (7, -89)], (186, 150, 90), 0.45)          # knotwork
    c.line([(13, -96), (13, -75)], (220, 224, 232), 0.45)


def draw_twin_daggers(c):
    """One of a matched pair of scout's daggers (the warrior carries two)."""
    _blade(c, [(-2.7, -6), (-2.3, -32), (0, -44), (2.3, -32), (2.7, -6)], STEEL_D, STEEL_L,
           fuller=(-8, -30, 1.1))
    c.poly([(-7.5, -8), (7.5, -8), (8.2, -6.4), (7.5, -4.8), (-7.5, -4.8), (-8.2, -6.4)], (72, 64, 60), ow=OW)
    c.line([(-6.6, -7.2), (6.6, -7.2)], (150, 140, 130), 0.4)
    _grip(c, -4.8, 6.5, 1.8, (44, 32, 28), (24, 18, 14))
    c.circle((0, 8.4), 2.4, (88, 84, 84), ow=OW)
    c.circle((-0.7, 7.7), 0.8, (190, 190, 196), outline=None)


def draw_long_spear(c):
    """An ash-shafted boar spear: a long leaf blade, lugs, a white fur tuft."""
    _haft(c, 54, -90, 1.7, 1.5, wood=(118, 90, 60))
    c.poly([(-2.2, 48), (2.2, 48), (1.6, 54), (-1.6, 54)], (70, 72, 80), ow=OW)     # butt cap
    _grip(c, -8, 12, 2.1, (58, 40, 30), (32, 22, 16))
    c.poly([(-2.6, -82), (2.6, -82), (2.2, -92), (-2.2, -92)], (66, 66, 74), ow=OW)  # socket
    for y in (-84, -87, -90):
        c.line([(-2.4, y), (2.4, y)], (40, 40, 46), 0.4)
    c.poly([(-2.2, -86), (-7, -84), (-2.2, -82)], (80, 80, 90), ow=OW * 0.7)          # lugs
    c.poly([(2.2, -86), (7, -84), (2.2, -82)], (80, 80, 90), ow=OW * 0.7)
    head = [(0, -120), (4.8, -106), (5.6, -98), (2.4, -92), (-2.4, -92), (-5.6, -98), (-4.8, -106)]
    _blade(c, head, STEEL_D, STEEL_L)
    c.line([(0, -93), (0, -117)], (150, 158, 172), 0.5)                                # midrib
    rs = seeded(31)
    for _ in range(16):                      # fur tuft below the socket
        x = rs.uniform(-2, 2)
        c.line([(x, -80), (x * 2.6 + rs.uniform(-2, 2), -80 + rs.uniform(6, 13))], (222, 224, 226), 0.55)


def draw_hunters_crossbow(c):
    """A heavy hunting crossbow, shown loaded. Points the way it shoots."""
    stock = [(-3.4, 24), (3.4, 24), (3.8, 6), (2.8, -52), (-2.8, -52), (-3.8, 6)]
    c.grad_poly(stock, (52, 36, 26), (122, 88, 58), (-4, 0), (4, 0), ow=OW)
    c.poly([(-3.6, 20), (3.6, 20), (3.4, 24), (-3.4, 24)], (60, 60, 68), ow=OW * 0.8)   # butt plate
    c.line([(0, -50), (0, -8)], (40, 28, 20), 0.6)                                      # bolt groove
    c.poly([(3.8, -2), (7, 4), (6, 5.4), (3.6, 1.6)], (70, 72, 80), ow=OW * 0.7)       # trigger lever
    c.poly([(-2.2, -14), (2.2, -14), (2.2, -18), (-2.2, -18)], (90, 92, 102), ow=OW * 0.7)  # nut
    prod = [(-29, -36), (-19, -45), (0, -49), (19, -45), (29, -36), (28, -33.5), (18, -41.5),
            (0, -45.2), (-18, -41.5), (-28, -33.5)]
    c.grad_poly(prod, (58, 56, 60), (150, 146, 140), (0, -49), (0, -34), ow=OW)
    c.line([(-28, -35), (0, -16), (28, -35)], (214, 204, 182), 0.5)                    # string
    c.poly([(-3.2, -50), (3.2, -50), (3.2, -56), (-3.2, -56)], (60, 60, 68), ow=OW * 0.7)    # stirrup
    c.line([(0, -16), (0, -55)], (110, 82, 54), 1.1)                                    # loaded bolt
    c.poly([(-1.8, -55), (0, -60), (1.8, -55)], (200, 206, 216), ow=OW * 0.6)
    for s in (-1, 1):
        c.poly([(0, -18), (s * 2.4, -16), (s * 2.4, -21), (0, -22)], (220, 214, 200), ow=OW * 0.5)


def draw_frostbound_axe(c):
    """A bearded axe forged in ice: frost-steel blade, rime-covered haft,
    runes that hold a cold blue light."""
    _haft(c, 16, -72, 2.0, 1.8, wood=(64, 58, 60))
    rs = seeded(51)
    for _ in range(10):                      # rime on the haft
        y = rs.uniform(-70, 10)
        c.line([(-1.8, y), (1.8, y + rs.uniform(-1.5, 1.5))], (190, 222, 240), 0.35)
    _grip(c, -4, 12, 2.2, (40, 44, 54), (24, 28, 34))
    g = c.layer()
    blade = [(1.6, -72), (9, -74), (17, -79), (20.5, -68), (19.5, -54), (15, -42), (8, -38), (4, -45), (1.6, -50)]
    g.poly(blade, (120, 210, 255, 160), outline=None)
    c.glow(g.img, 2.4, 1.0)
    c.grad_poly(blade, (70, 110, 140), (226, 244, 255), (1.6, -60), (20, -60), ow=OW)
    c.line([(17, -79), (20.5, -68), (19.5, -54), (15, -42)], (248, 252, 255), 0.5)
    c.poly([(-1.8, -68), (-12, -63), (-1.8, -58)], (96, 128, 150), ow=OW)               # back spike
    c.poly([(-1.6, -72), (0, -77), (1.6, -72)], (150, 190, 214), ow=OW * 0.7)
    for k in range(3):                       # glowing runes
        y = -66 + k * 7
        c.line([(6, y), (8.5, y - 2.5), (11, y)], (150, 236, 255), 0.5)
    c.poly([(-2.4, -50), (2.4, -50), (2.4, -46), (-2.4, -46)], (110, 140, 160), ow=OW * 0.6)


def draw_aemond_blade(c):
    """A rippled, smoke-dark blade of old Valyrian make."""
    _blade(c, [(-3.4, -8), (-2.8, -72), (0, -86), (2.8, -72), (3.4, -8)], (34, 34, 40), (112, 112, 124),
           fuller=(-12, -70, 1.4))
    for k in range(9):                       # ripple pattern
        y = -14 - k * 7
        c.line([(-2.6, y), (-0.8, y - 2), (0.8, y), (2.6, y - 2)], (150, 150, 164), 0.3)
    c.poly([(-12, -9), (-13.5, -11.5), (-3, -10.5), (3, -10.5), (13.5, -11.5), (12, -9), (3, -5.5), (-3, -5.5)],
           (30, 28, 32), ow=OW)
    _grip(c, -5.5, 13, 2.0, (20, 18, 20), (60, 20, 24))
    c.circle((0, 15.5), 3.2, (40, 36, 40), ow=OW)
    c.circle((0, 15.5), 1.8, (180, 30, 36), outline=None)


def draw_frostbrand(c):
    """A legendary northern blade: a dark steel spine sheathed in living ice,
    blue runes burning down the fuller, a guard of frozen wolf jaws and a
    pommel of winter crystal."""
    left = [(-4.6, -9), (-5.6, -24), (-4.2, -30), (-5.4, -44), (-3.8, -52), (-4.8, -66), (-3.0, -76),
            (-3.2, -84)]
    right = [(3.0, -84), (2.8, -76), (4.6, -66), (3.6, -56), (5.2, -46), (4.0, -34), (5.4, -24), (4.6, -9)]
    blade = left + [(0, -96)] + right
    g = c.layer()                                  # the cold halo
    g.poly(blade, (120, 200, 255, 210), outline=None)
    g.poly([(-16, -13), (16, -13), (16, -4), (-16, -4)], (120, 200, 255, 130), outline=None)
    c.glow(g.img, 3.6, 1.1)
    c.grad_poly(blade, (126, 190, 232, 240), (236, 248, 255, 245), (-5, 0), (5, 0), ow=OW)
    # the dark steel spine inside the ice
    c.poly([(-1.5, -10), (-1.1, -84), (0, -90), (1.1, -84), (1.5, -10)], (52, 62, 80), outline=None)
    c.line([(0.6, -12), (0.4, -86)], (150, 170, 196), 0.35)
    # runes, glowing
    rl = c.layer()
    for k in range(7):
        y = -18 - k * 9.5
        rl.line([(-0.9, y), (0.9, y - 2.4), (-0.4, y - 4.6)], (170, 230, 255, 255), 0.55)
        rl.line([(0.8, y - 1.2), (0.0, y - 3.6)], (170, 230, 255, 255), 0.4)
    c.glow(rl.img, 1.4, 1.3)
    c.composite(rl.img)
    # ice facets on the edges
    for f in ([(-3, -12), (-5.2, -24), (-1.6, -28)], [(-2.6, -36), (-5.0, -46), (-1.4, -50)],
              [(-2.2, -60), (-4.4, -68), (-1.2, -72)], [(2.4, -16), (5.2, -26), (1.6, -30)],
              [(2.2, -40), (5.0, -48), (1.4, -52)], [(2.0, -64), (4.2, -70), (1.2, -76)]):
        c.poly(f, (210, 240, 255, 215), outline=None)
    c.line([(3.0, -84), (0, -96)], (255, 255, 255, 240), 0.5)
    # guard: frozen wolf jaws, fangs of ice
    c.poly([(-15, -10), (-16.5, -13.5), (-9, -12.4), (-3, -11.6), (3, -11.6), (9, -12.4), (16.5, -13.5), (15, -10),
            (8, -7.4), (3, -5.6), (-3, -5.6), (-8, -7.4)], (66, 76, 96), ow=OW)
    c.line([(-14, -11.6), (-4, -10.6), (4, -10.6), (14, -11.6)], (150, 170, 196), 0.45)
    for x in (-12, -8, -4.5, 4.5, 8, 12):
        s = 1 if x > 0 else -1
        c.poly([(x - 1.0 * s, -7.6), (x + 0.4 * s, -3.2), (x + 1.4 * s, -7.8)], (220, 244, 255), ow=OW * 0.7)
    c.circle((0, -8.5), 2.2, (140, 220, 255), ow=OW)
    c.circle((-0.5, -9.1), 0.8, (255, 255, 255), outline=None)
    _grip(c, -5.4, 12.5, 2.1, (40, 44, 58), (120, 150, 190))
    # pommel: a winter crystal in a steel claw
    c.poly([(-3.6, 12.6), (3.6, 12.6), (2.6, 14.6), (-2.6, 14.6)], (66, 76, 96), ow=OW)
    gl = c.layer()
    gl.poly([(0, 13.6), (3.6, 17), (0, 21), (-3.6, 17)], (150, 226, 255, 255), outline=None)
    c.glow(gl.img, 1.8, 1.0)
    c.poly([(0, 13.6), (3.6, 17), (0, 21), (-3.6, 17)], (170, 230, 255), ow=OW)
    c.line([(-1.3, 16.4), (0, 15.0)], (255, 255, 255), 0.6)


def draw_blackfyre(c):
    """Aegon's blade: rippled smoke-black Valyrian steel, a crossguard of
    spread dragon wings in dark gold, a ruby in the pommel."""
    _blade(c, [(-4.0, -9), (-3.4, -80), (0, -100), (3.4, -80), (4.0, -9)], (22, 20, 26), (96, 92, 108),
           fuller=(-13, -82, 1.6))
    for k in range(11):                         # Valyrian ripples
        y = -15 - k * 6.4
        c.line([(-3.0, y), (-1.2, y - 2.2), (0.6, y), (2.8, y - 2.2)], (138, 132, 150), 0.32)
    c.line([(3.4, -80), (0, -100)], (220, 214, 230), 0.4)
    wing = [(-3, -8.5), (-9, -14), (-15, -16), (-17.5, -12.5), (-13, -11.4), (-16, -9.6), (-11, -8.6),
            (-13.4, -6.6), (-6, -6.2)]
    c.poly(wing, (150, 108, 40), ow=OW)
    c.poly([(-x, y) for x, y in wing], (150, 108, 40), ow=OW)
    c.line([(-3, -8), (-14.6, -14.8)], (226, 186, 100), 0.45)
    c.line([(3, -8), (14.6, -14.8)], (226, 186, 100), 0.45)
    c.poly([(-3.6, -9.6), (3.6, -9.6), (3.0, -4.8), (-3.0, -4.8)], (40, 30, 30), ow=OW)
    c.circle((0, -7.2), 1.8, (200, 30, 36), ow=OW * 0.8)
    _grip(c, -4.8, 13.5, 2.0, (24, 16, 18), (110, 24, 30))
    c.circle((0, 16.6), 3.6, (130, 96, 40), ow=OW)
    c.circle((0, 16.6), 2.2, (210, 34, 40), outline=None)
    c.circle((-0.7, 15.9), 0.7, (255, 170, 170), outline=None)


def draw_gatechain_flail(c):
    """A length of the broken gate chain on an iron-bound haft, ending in
    the hook that once held the portcullis."""
    _haft(c, 20, -28, 2.6, 2.3, wood=(70, 52, 38))
    _grip(c, -6, 16, 2.8, (46, 34, 28), (26, 20, 16))
    for y in (-24, -28):
        c.poly([(-3.2, y), (3.2, y), (3.2, y - 2.4), (-3.2, y - 2.4)], (82, 84, 94), ow=0.75 * 0.7)
    c.circle((0, -32), 3.4, (60, 62, 70), ow=0.75)
    c.circle((0, -32), 1.6, (20, 18, 20), outline=None)
    for k in range(5):                       # chain links, alternating face-on and edge-on
        y = -40 - k * 12
        if k % 2 == 0:
            c.ellipse((0, y), 3.6, 6.6, (64, 66, 76), ow=0.75)
            c.ellipse((0, y), 1.6, 4.2, (14, 12, 14), outline=None)
            c.line([(-2.6, y - 3), (-2.6, y + 3)], (150, 152, 164), 0.5)
        else:
            c.poly([(-1.4, y - 7), (1.4, y - 7), (1.4, y + 7), (-1.4, y + 7)], (74, 76, 86), ow=0.75)
            c.line([(0.6, y - 6), (0.6, y + 6)], (160, 162, 172), 0.4)
    # the hook: a heavy barbed iron crescent
    hook = [(-1.8, -96), (2.2, -96), (6, -100), (11, -106), (12, -112), (8, -114), (6, -108), (2, -104), (-2, -103),
            (-7, -106), (-10, -112), (-13, -110), (-11, -103), (-6, -98)]
    c.grad_poly(hook, (44, 46, 54), (150, 152, 166), (-12, -110), (12, -100), ow=0.75)
    c.poly([(11, -106), (15, -104), (12, -112)], (110, 112, 124), ow=0.6)
    c.poly([(-10, -112), (-14, -113), (-13, -108)], (110, 112, 124), ow=0.6)
    c.circle((0, -94), 3.0, (70, 72, 82), ow=0.75)


DRAW = {
    'gatechain_flail': draw_gatechain_flail,
    'war_hammer': draw_war_hammer,
    'twin_daggers': draw_twin_daggers,
    'long_spear': draw_long_spear,
    'hunters_crossbow': draw_hunters_crossbow,
    'frostbound_axe': draw_frostbound_axe,
    'aemond_blade': draw_aemond_blade,
    'frostbrand': draw_frostbrand,
    'blackfyre': draw_blackfyre,
    'steel_sword': draw_steel_sword,
    'northern_longsword': draw_northern_longsword,
    'greatsword': draw_greatsword,
    'frostblade': draw_frostblade,
    'lightbreaker': draw_lightbreaker,
    'dragonbane': draw_dragonbane,
}

_cache = {}


def render(wid, ss):
    """Return (image, anchor_px) for a weapon drawn at `ss` px per unit."""
    key = (wid, ss)
    if key in _cache:
        return _cache[key]
    spec = WEAPONS[wid]
    pad = 6
    w = 2 * (spec['hw'] + pad)
    top = -spec['tip'] + pad
    h = top + spec['bottom'] + pad
    c = Canvas(w, h, ss, origin=(spec['hw'] + pad, top))
    DRAW[wid](c)
    anchor = ((spec['hw'] + pad) * ss, top * ss)
    _cache[key] = (c.img, anchor)
    return _cache[key]


def tip_distance(wid):
    return -WEAPONS[wid]['tip']


def standalone(wid, px_per_unit=4):
    """Isolated transparent weapon sprite, cropped, with metadata."""
    ss = px_per_unit * 4
    img, anchor = render(wid, ss)
    w, h = img.size
    out = img.convert('RGBa').resize((w // 4, h // 4), Image.LANCZOS).convert('RGBA')
    box = out.getbbox()
    out = out.crop(box)
    ax, ay = anchor[0] / 4 - box[0], anchor[1] / 4 - box[1]
    meta = {
        'name': WEAPONS[wid]['name'],
        'size': list(out.size),
        'grip': [round(ax, 1), round(ay, 1)],
        'tip': [round(ax, 1), round(ay - tip_distance(wid) * px_per_unit, 1)],
        'orientation': 'blade points up; grip is where the hand closes',
    }
    return out, meta
