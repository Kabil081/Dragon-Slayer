"""Shared drawing helpers for the procedural asset generator.

All drawing happens on a supersampled canvas and is downsampled at the end,
which gives clean anti-aliased edges from Pillow's aliased primitives.
Coordinates passed to Canvas methods are in "units" (final-image pixels).
"""
import math
import random

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

OUTLINE = (18, 14, 14, 255)


# ---------------------------------------------------------------- colour --

def rgba(c, a=255):
    if len(c) == 4:
        return tuple(int(v) for v in c)
    return (int(c[0]), int(c[1]), int(c[2]), a)


def mix(c1, c2, t):
    c1, c2 = rgba(c1), rgba(c2)
    return tuple(int(round(c1[i] + (c2[i] - c1[i]) * t)) for i in range(4))


def shade(c, f):
    c = rgba(c)
    return (min(255, int(c[0] * f)), min(255, int(c[1] * f)), min(255, int(c[2] * f)), c[3])


# ---------------------------------------------------------------- vector --

def add(a, b):
    return (a[0] + b[0], a[1] + b[1])


def sub(a, b):
    return (a[0] - b[0], a[1] - b[1])


def mul(a, s):
    return (a[0] * s, a[1] * s)


def length(a):
    return math.hypot(a[0], a[1])


def norm(a):
    l = length(a) or 1e-9
    return (a[0] / l, a[1] / l)


def perp(a):
    """Rotate 90 degrees: for a rightward vector this points down (screen)."""
    return (-a[1], a[0])


def lerp(a, b, t):
    return a + (b - a) * t


def lerp2(a, b, t):
    return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)


def dirv(deg):
    """Angle convention used everywhere: 0 = down, 90 = forward (+x),
    180 = up, 270 = back (-x)."""
    r = math.radians(deg)
    return (math.sin(r), math.cos(r))


def ang_of(v):
    return math.degrees(math.atan2(v[0], v[1]))


def ease(t):
    return 0.5 - 0.5 * math.cos(math.pi * max(0.0, min(1.0, t)))


class Frame:
    """A rotated local frame: x = forward, y = up (both in units)."""

    def __init__(self, origin, lean):
        self.o = origin
        self.lean = lean
        self.f = (math.cos(math.radians(lean)), math.sin(math.radians(lean)))
        self.u = (math.sin(math.radians(lean)), -math.cos(math.radians(lean)))

    def __call__(self, x, y=None):
        if y is None:
            x, y = x
        return (self.o[0] + x * self.f[0] + y * self.u[0],
                self.o[1] + x * self.f[1] + y * self.u[1])

    def pts(self, pts):
        return [self(p) for p in pts]

    def sub(self, local_origin, extra_lean):
        return Frame(self(local_origin), self.lean + extra_lean)


def ik2(root, target, l1, l2, prefer):
    """Two-bone IK. Returns (joint, end). `prefer` is a direction the
    middle joint should bend toward."""
    d = sub(target, root)
    dist = length(d)
    dist = max(abs(l1 - l2) + 1e-3, min(l1 + l2 - 1e-3, dist))
    dn = norm(d)
    end = add(root, mul(dn, dist))
    cos_a = (l1 * l1 + dist * dist - l2 * l2) / (2 * l1 * dist)
    a = math.acos(max(-1.0, min(1.0, cos_a)))
    best = None
    for s in (1, -1):
        ca, sa = math.cos(a * s), math.sin(a * s)
        v = (dn[0] * ca - dn[1] * sa, dn[0] * sa + dn[1] * ca)
        j = add(root, mul(v, l1))
        score = (j[0] - root[0]) * prefer[0] + (j[1] - root[1]) * prefer[1]
        if best is None or score > best[0]:
            best = (score, j)
    return best[1], end


def catmull(points, n=6):
    """Catmull-Rom spline through points."""
    if len(points) < 3:
        return list(points)
    pts = [points[0]] + list(points) + [points[-1]]
    out = []
    for i in range(1, len(pts) - 2):
        p0, p1, p2, p3 = pts[i - 1], pts[i], pts[i + 1], pts[i + 2]
        for k in range(n):
            t = k / n
            t2, t3 = t * t, t * t * t
            out.append(tuple(
                0.5 * ((2 * p1[j]) + (-p0[j] + p2[j]) * t +
                       (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 +
                       (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3)
                for j in range(2)))
    out.append(points[-1])
    return out


def ribbon_edges(points, widths):
    """Offset a polyline by +/- width/2. Returns (side_a, side_b, normals)
    where side_b is offset along perp(direction) (screen-down for a
    rightward line)."""
    n = len(points)
    a_side, b_side, normals = [], [], []
    for i in range(n):
        if i == 0:
            d = sub(points[1], points[0])
        elif i == n - 1:
            d = sub(points[-1], points[-2])
        else:
            d = add(norm(sub(points[i], points[i - 1])), norm(sub(points[i + 1], points[i])))
        nv = perp(norm(d))
        normals.append(nv)
        h = widths[i] / 2
        a_side.append(add(points[i], mul(nv, -h)))
        b_side.append(add(points[i], mul(nv, h)))
    return a_side, b_side, normals


def ribbon(points, widths):
    a, b, _ = ribbon_edges(points, widths)
    return a + b[::-1]


def resample(points, widths, n):
    """Resample polyline + widths to n evenly spaced samples."""
    seg = [length(sub(points[i + 1], points[i])) for i in range(len(points) - 1)]
    total = sum(seg) or 1e-9
    out_p, out_w = [], []
    for k in range(n):
        s = total * k / (n - 1)
        acc = 0
        for i, L in enumerate(seg):
            if acc + L >= s or i == len(seg) - 1:
                t = 0 if L == 0 else (s - acc) / L
                t = max(0, min(1, t))
                out_p.append(lerp2(points[i], points[i + 1], t))
                out_w.append(lerp(widths[i], widths[i + 1], t))
                break
            acc += L
    return out_p, out_w


# ---------------------------------------------------------------- canvas --

class Canvas:
    def __init__(self, w, h, ss=4, origin=(0, 0), img=None):
        self.w, self.h, self.ss = w, h, ss
        self.k = ss
        self.origin = origin
        self.img = img if img is not None else Image.new(
            'RGBA', (int(round(w * ss)), int(round(h * ss))), (0, 0, 0, 0))
        self.d = ImageDraw.Draw(self.img)

    def P(self, p):
        return ((p[0] + self.origin[0]) * self.k, (p[1] + self.origin[1]) * self.k)

    def layer(self):
        return Canvas(self.w, self.h, self.ss, self.origin)

    # primitives ---------------------------------------------------------
    def _outline_poly(self, sp, color, ow):
        wpx = max(1, int(round(2 * ow * self.k)))
        self.d.line(sp + [sp[0]], fill=color, width=wpx, joint='curve')
        r = ow * self.k
        for q in sp:
            self.d.ellipse([q[0] - r, q[1] - r, q[0] + r, q[1] + r], fill=color)
        self.d.polygon(sp, fill=color)

    def poly(self, pts, fill, outline=OUTLINE, ow=0.9):
        if len(pts) < 3:
            return
        sp = [self.P(p) for p in pts]
        if outline is not None and ow > 0:
            self._outline_poly(sp, outline, ow)
        if fill is not None:
            self.d.polygon(sp, fill=rgba(fill))

    def circle(self, c, r, fill, outline=OUTLINE, ow=0.9):
        q = self.P(c)
        if outline is not None and ow > 0:
            rr = (r + ow) * self.k
            self.d.ellipse([q[0] - rr, q[1] - rr, q[0] + rr, q[1] + rr], fill=outline)
        rr = r * self.k
        if fill is not None:
            self.d.ellipse([q[0] - rr, q[1] - rr, q[0] + rr, q[1] + rr], fill=rgba(fill))

    def ellipse(self, c, rx, ry, fill, outline=OUTLINE, ow=0.9):
        q = self.P(c)
        if outline is not None and ow > 0:
            self.d.ellipse([q[0] - (rx + ow) * self.k, q[1] - (ry + ow) * self.k,
                            q[0] + (rx + ow) * self.k, q[1] + (ry + ow) * self.k], fill=outline)
        self.d.ellipse([q[0] - rx * self.k, q[1] - ry * self.k,
                        q[0] + rx * self.k, q[1] + ry * self.k], fill=rgba(fill))

    def ring(self, c, r, color, width):
        q = self.P(c)
        rr = r * self.k
        self.d.ellipse([q[0] - rr, q[1] - rr, q[0] + rr, q[1] + rr], outline=rgba(color),
                       width=max(1, int(round(width * self.k))))

    def capsule(self, p1, p2, r1, r2, fill, outline=OUTLINE, ow=0.9):
        d = norm(sub(p2, p1))
        n = perp(d)

        def shape(e, col):
            pts = [add(p1, mul(n, r1 + e)), add(p2, mul(n, r2 + e)),
                   add(p2, mul(n, -(r2 + e))), add(p1, mul(n, -(r1 + e)))]
            self.d.polygon([self.P(p) for p in pts], fill=col)
            for c, r in ((p1, r1 + e), (p2, r2 + e)):
                q = self.P(c)
                rr = r * self.k
                self.d.ellipse([q[0] - rr, q[1] - rr, q[0] + rr, q[1] + rr], fill=col)

        if outline is not None and ow > 0:
            shape(ow, outline)
        shape(0, rgba(fill))

    def highlight(self, p1, p2, r1, r2, color, side=(-0.55, -0.85)):
        """Thin highlight stroke inside a capsule, offset toward the light."""
        d = norm(sub(p2, p1))
        n = perp(d)
        s = 1 if (n[0] * side[0] + n[1] * side[1]) > 0 else -1
        a = add(p1, mul(n, s * r1 * 0.45))
        b = add(p2, mul(n, s * r2 * 0.45))
        self.capsule(a, b, r1 * 0.22, r2 * 0.22, color, outline=None)

    def line(self, pts, color, width):
        sp = [self.P(p) for p in pts]
        self.d.line(sp, fill=rgba(color), width=max(1, int(round(width * self.k))), joint='curve')

    def mask(self, pts):
        m = Image.new('L', self.img.size, 0)
        ImageDraw.Draw(m).polygon([self.P(p) for p in pts], fill=255)
        return m

    def grad_poly(self, pts, c1, c2, p1, p2, outline=OUTLINE, ow=0.9):
        sp = [self.P(p) for p in pts]
        if outline is not None and ow > 0:
            self._outline_poly(sp, outline, ow)
        m = Image.new('L', self.img.size, 0)
        ImageDraw.Draw(m).polygon(sp, fill=255)
        box = m.getbbox()
        if not box:
            return
        x0, y0, x1, y1 = box
        a, b = self.P(p1), self.P(p2)
        gx, gy = b[0] - a[0], b[1] - a[1]
        gl = gx * gx + gy * gy or 1e-9
        ys, xs = np.mgrid[y0:y1, x0:x1].astype(np.float32)
        t = ((xs - a[0]) * gx + (ys - a[1]) * gy) / gl
        t = np.clip(t, 0, 1)[..., None]
        ca = np.array(rgba(c1), np.float32)
        cb = np.array(rgba(c2), np.float32)
        arr = (ca + (cb - ca) * t).astype(np.uint8)
        g = Image.fromarray(arr, 'RGBA')
        self.img.paste(g, (x0, y0), m.crop(box))

    def composite(self, layer_img, mask=None, opacity=1.0):
        im = layer_img
        if mask is not None or opacity < 1.0:
            im = layer_img.copy()
            a = np.asarray(im.getchannel('A'), np.float32)
            if mask is not None:
                a = a * (np.asarray(mask, np.float32) / 255.0)
            a = a * opacity
            im.putalpha(Image.fromarray(a.astype(np.uint8), 'L'))
        self.img.alpha_composite(im)

    def glow(self, layer_img, radius, strength=1.0):
        g = layer_img.filter(ImageFilter.GaussianBlur(radius * self.k))
        if strength != 1.0:
            a = np.asarray(g.getchannel('A'), np.float32) * strength
            g.putalpha(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), 'L'))
        self.img.alpha_composite(g)

    def finish(self, size=None):
        size = size or (int(round(self.w)), int(round(self.h)))
        return downsample(self.img, size)


def downsample(img, size):
    return img.convert('RGBa').resize(size, Image.LANCZOS).convert('RGBA')


def paste_rotated(dst_img, src_img, anchor_src, anchor_dst, angle_ccw):
    """Rotate src around anchor_src (px) and composite so the anchor lands on
    anchor_dst (px) of dst."""
    w, h = src_img.size
    R = int(math.ceil(max(math.hypot(anchor_src[0] - x, anchor_src[1] - y)
                          for x in (0, w) for y in (0, h)))) + 2
    sq = Image.new('RGBA', (2 * R, 2 * R), (0, 0, 0, 0))
    sq.paste(src_img, (int(round(R - anchor_src[0])), int(round(R - anchor_src[1]))))
    rot = sq.rotate(angle_ccw, resample=Image.BICUBIC)
    ox, oy = int(round(anchor_dst[0] - R)), int(round(anchor_dst[1] - R))
    # alpha_composite needs a non-negative destination: crop as needed
    sx, sy = max(0, -ox), max(0, -oy)
    dx, dy = max(0, ox), max(0, oy)
    cw = min(2 * R - sx, dst_img.size[0] - dx)
    ch = min(2 * R - sy, dst_img.size[1] - dy)
    if cw > 0 and ch > 0:
        dst_img.alpha_composite(rot.crop((sx, sy, sx + cw, sy + ch)), (dx, dy))


def rotate_point(p, center, angle_ccw):
    """Rotate a screen point by angle (counter-clockwise on screen)."""
    r = math.radians(angle_ccw)
    x, y = p[0] - center[0], p[1] - center[1]
    return (center[0] + x * math.cos(r) + y * math.sin(r),
            center[1] - x * math.sin(r) + y * math.cos(r))


def sheet(frames, cols=None):
    """Pack equal-size frames into a grid sprite sheet."""
    n = len(frames)
    cols = cols or n
    rows = (n + cols - 1) // cols
    w, h = frames[0].size
    out = Image.new('RGBA', (w * cols, h * rows), (0, 0, 0, 0))
    for i, f in enumerate(frames):
        out.paste(f, ((i % cols) * w, (i // cols) * h))
    return out


def seeded(seed):
    return random.Random(seed)


def _shift(a, dx, dy):
    out = np.zeros_like(a)
    h, w = a.shape
    ys, yd = (slice(0, h - dy), slice(dy, h)) if dy >= 0 else (slice(-dy, h), slice(0, h + dy))
    xs, xd = (slice(0, w - dx), slice(dx, w)) if dx >= 0 else (slice(-dx, w), slice(0, w + dx))
    out[yd, xd] = a[ys, xs]
    return out


def rim_light(img, top=(150, 186, 236), top_k=0.55, bottom=(255, 136, 56), bottom_k=0.4, px=2, soft=1.2):
    """Cheap studio lighting on a finished sprite: a cool moonlit rim along
    upward-facing edges and a warm fire bounce along the undersides."""
    arr = np.asarray(img).astype(np.float32)
    a = arr[..., 3] / 255.0
    above = _shift(a, 0, px)          # value of the pixel `px` above
    below = _shift(a, 0, -px)
    t = np.clip(a - above, 0, 1)
    b = np.clip(a - below, 0, 1)
    if soft:
        t = np.asarray(Image.fromarray((t * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(soft)),
                       np.float32) / 255 * a
        b = np.asarray(Image.fromarray((b * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(soft)),
                       np.float32) / 255 * a
    rgb = arr[..., :3]
    rgb += t[..., None] * np.array(top, np.float32) * top_k
    rgb += b[..., None] * np.array(bottom, np.float32) * bottom_k
    arr[..., :3] = np.clip(rgb, 0, 255)
    return Image.fromarray(arr.astype(np.uint8), 'RGBA')


def scale_texture(img, cell=6.0, strength=0.16, seed=0):
    """Overlapping-scale relief multiplied into a sprite (bright glow and
    fire pixels are left alone)."""
    arr = np.asarray(img).astype(np.float32)
    h, w = arr.shape[:2]
    ys, xs = np.mgrid[0:h, 0:w].astype(np.float32)
    row = np.floor(ys / (cell * 0.75))
    shift = (row % 2) * cell / 2
    cx = np.floor((xs + shift) / cell) * cell + cell / 2 - shift
    cy = row * cell * 0.75
    d = np.sqrt((xs - cx) ** 2 + ((ys - cy) * 1.25) ** 2) / cell
    relief = np.clip((d - 0.28) / 0.5, 0, 1) ** 1.6           # dark crescent at each scale's lower edge
    rng = np.random.default_rng(seed)
    jitter = rng.uniform(0.92, 1.06, size=(int(h / (cell * 0.75)) + 2, int(w / cell) + 3)).astype(np.float32)
    jr = jitter[row.astype(int) % jitter.shape[0], (np.floor((xs + shift) / cell).astype(int)) % jitter.shape[1]]
    lum = arr[..., :3].max(-1) / 255
    keep = np.clip((0.78 - lum) / 0.3, 0, 1)                   # spare glowing pixels
    f = (1 - strength * relief) * (1 + (jr - 1) * keep)
    f = 1 + (f - 1) * keep
    arr[..., :3] *= f[..., None]
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), 'RGBA')
