"""Make the game's voice lines: the two of the Level 7 ending and the
"Dracarys!" commands heard before dragon fire.

    python tools/voice_lines.py <folder with *_raw.wav>

The raw lines are rendered on Windows with the built-in speech engine
(System.Speech, voice "Microsoft David") - an original synthetic
performance, not a recording or an imitation of any actor:

    north_remembers_raw.wav     The North <break/> remembers.        (rate -35%, pitch -30%)
    king_in_the_north_raw.wav   The King <break/> in the North!
    dracarys_raw.wav            <phoneme alphabet="ipa" ph="drəˈkɛrɪs">Dracarys</phoneme>!
                                (SSML, emphasis strong; the same take serves both commands)

This script deepens them, thickens them and places them in a cold stone
hall. "The King in the North" becomes a chant of many voices. "Dracarys"
becomes a rider's war cry (dracarys.wav: Rhagal, Drogon, Viserion) and a
slower, colder command (dracarys_aemond.wav: Aemond to Vhagar). Output goes
to assets/audio/; a raw file that is missing is skipped.
"""
import os
import sys
import wave

import numpy as np
from scipy.signal import butter, fftconvolve, lfilter, resample_poly

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
OUT = os.path.join(ROOT, 'assets', 'audio')
SR = 44100


def read(path):
    with wave.open(path, 'rb') as w:
        sr, n, ch = w.getframerate(), w.getnframes(), w.getnchannels()
        x = np.frombuffer(w.readframes(n), np.int16).astype(np.float32) / 32768
    if ch > 1:
        x = x.reshape(-1, ch).mean(1)
    if sr != SR:
        x = resample_poly(x, SR, sr)
    return x


def write(path, x):
    x = x / (np.max(np.abs(x)) + 1e-9) * 0.89
    with wave.open(path, 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())


def trim(x, thr=0.01):
    idx = np.where(np.abs(x) > thr)[0]
    return x[max(0, idx[0] - 800): idx[-1] + 4000] if len(idx) else x


def deepen(x, factor):
    """Lower the pitch by `factor` (< 1); the line also slows, which suits it."""
    up, down = int(round(1000 / factor)), 1000
    return resample_poly(x, up, down)


def hall(x, sec=2.6, wet=0.28, seed=1):
    rng = np.random.default_rng(seed)
    n = int(SR * sec)
    t = np.arange(n) / n
    ir = rng.standard_normal(n) * (1 - t) ** 3.2
    b, a = butter(2, 3800 / (SR / 2))
    ir = lfilter(b, a, ir)
    ir /= np.sqrt(np.sum(ir ** 2)) + 1e-9
    tail = fftconvolve(x, ir)
    dry = np.concatenate([x, np.zeros(len(tail) - len(x))])
    return dry * (1 - wet) + tail * wet * 1.6


def warmth(x):
    b, a = butter(2, 260 / (SR / 2))               # body: boost the low end
    low = lfilter(b, a, x)
    b2, a2 = butter(2, 70 / (SR / 2), 'high')      # but no rumble
    y = lfilter(b2, a2, x + 0.9 * low)
    return np.tanh(y * 1.6) / np.tanh(1.6)


def fade(x, a=0.02, r=0.4):
    na, nr = int(SR * a), int(SR * r)
    x = x.copy()
    x[:na] *= np.linspace(0, 1, na)
    x[-nr:] *= np.linspace(1, 0, nr) ** 2
    return x


def layered(x, factors, offsets, gains):
    layers = [np.concatenate([np.zeros(int(SR * o)), deepen(x, f)]) * g for f, o, g in zip(factors, offsets, gains)]
    n = max(len(l) for l in layers)
    return sum(np.pad(l, (0, n - len(l))) for l in layers)


def cold(x):
    """Thin out the chest and keep the edge: a colder, crueller voice."""
    b, a = butter(2, 180 / (SR / 2), 'high')
    y = lfilter(b, a, x)
    b2, a2 = butter(2, 2400 / (SR / 2))
    edge = y - lfilter(b2, a2, y)
    return np.tanh((y + 0.35 * edge) * 1.3) / np.tanh(1.3)


def main(src):
    os.makedirs(OUT, exist_ok=True)
    raw = lambda name: os.path.join(src, name)
    if os.path.exists(raw('north_remembers_raw.wav')):
        king = trim(read(raw('north_remembers_raw.wav')))
        # a solemn, kingly voice: deeper, thickened by a slightly lower double
        v = layered(king, (0.80, 0.765), (0.0, 0.012), (1.0, 0.38))
        write(os.path.join(OUT, 'north_remembers.wav'), fade(hall(warmth(v), 2.8, 0.3, 7)))
    if os.path.exists(raw('king_in_the_north_raw.wav')):
        chant = trim(read(raw('king_in_the_north_raw.wav')))
        # a hall of voices taking up the cry
        rng = np.random.default_rng(3)
        f = (0.74, 0.79, 0.83, 0.87, 0.92, 0.97, 1.02)
        o = tuple(rng.uniform(0, 0.07, len(f)))
        g = (0.9, 1.0, 0.85, 0.8, 0.7, 0.55, 0.45)
        c = layered(chant, f, o, g)
        write(os.path.join(OUT, 'king_in_the_north.wav'), fade(hall(warmth(c), 3.2, 0.42, 9)))
    if os.path.exists(raw('dracarys_raw.wav')):
        dra = trim(read(raw('dracarys_raw.wav')))
        # a rider's war cry over the battlefield: deep, doubled, a short echo off the stone
        v = layered(dra, (0.78, 0.745, 0.815), (0.0, 0.009, 0.016), (1.0, 0.42, 0.28))
        write(os.path.join(OUT, 'dracarys.wav'), fade(hall(warmth(v), 1.5, 0.2, 11), 0.01, 0.25))
        # Aemond to Vhagar: slower and colder, almost quiet, a long cold tail
        a = layered(dra, (0.86, 0.835), (0.0, 0.011), (1.0, 0.3))
        write(os.path.join(OUT, 'dracarys_aemond.wav'), fade(hall(cold(a), 2.2, 0.26, 13), 0.01, 0.35))
    print('wrote', OUT)


if __name__ == '__main__':
    main(sys.argv[1])
