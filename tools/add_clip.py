"""Put a moment from a video or sound file you already have into the game.

    python tools/add_clip.py SLOT FILE [START [END]] [--audio]

    python tools/add_clip.py dracarys "C:\\Videos\\my-copy.mp4" 0:05 0:07
    python tools/add_clip.py king_in_the_north "C:\\Videos\\my-copy.mp4" 3:48 4:03

SLOT is one of the clip slots (see assets/media/README.txt):

    dracarys            sound before Rhagal's, Drogon's and Viserion's fire
    vhagar_fire         sound before Vhagar's fire
    aegon_theme         the music of the duel with Aegon (loops)
    player_death        when the warrior falls (video: full screen)
    north_remembers     Level 7 ending, before THE NORTH REMEMBERS (video)
    king_in_the_north   Level 7 ending, before THE KING IN THE NORTH (video)

START and END are times like 1:53, 0:01:53.5 or 113. The first three slots
are saved as sound only (.m4a); the others keep the picture (.mp4) unless
--audio is given. Any older file of the same slot is removed, so the new one
is used. The game never downloads anything: this only cuts your own file
with ffmpeg. Without a clip the game plays its own sound for each slot.
"""
import os
import re
import shutil
import subprocess
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
MEDIA = os.path.join(ROOT, 'assets', 'media')
SLOTS = {'dracarys': 'audio', 'vhagar_fire': 'audio', 'aegon_theme': 'audio',
         'player_death': 'video', 'north_remembers': 'video', 'king_in_the_north': 'video'}
EXTS = ('mp4', 'webm', 'm4a', 'mp3', 'ogg', 'wav')


def seconds(text):
    if not re.fullmatch(r'\d+(:\d{1,2}){0,2}(\.\d+)?', text):
        sys.exit(f'Not a time: {text} (use 1:53, 0:01:53.5 or 113)')
    s = 0.0
    for part in text.split(':'):
        s = s * 60 + float(part)
    return s


def main(argv):
    flags = [a for a in argv if a.startswith('--')]
    args = [a for a in argv if not a.startswith('--')]
    if len(args) < 2 or args[0] not in SLOTS:
        sys.exit(__doc__)
    slot, src = args[0], args[1]
    if not os.path.isfile(src):
        sys.exit(f'No such file: {src}')
    ffmpeg = shutil.which('ffmpeg')
    if not ffmpeg:
        sys.exit('ffmpeg is needed: winget install ffmpeg (then open a new terminal)')
    start = seconds(args[2]) if len(args) > 2 else None
    end = seconds(args[3]) if len(args) > 3 else None
    if start is not None and end is not None and end <= start:
        sys.exit('END must come after START')
    audio = SLOTS[slot] == 'audio' or '--audio' in flags
    out = os.path.join(MEDIA, f'{slot}.{"m4a" if audio else "mp4"}')
    cmd = [ffmpeg, '-hide_banner', '-loglevel', 'error', '-y']
    if start is not None:
        cmd += ['-ss', str(start)]
    if end is not None:
        cmd += ['-to', str(end)]
    cmd += ['-i', src]
    cmd += ['-vn', '-c:a', 'aac', '-b:a', '192k'] if audio else \
           ['-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p',
            '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart']
    os.makedirs(MEDIA, exist_ok=True)
    tmp = out + '.part' + os.path.splitext(out)[1]
    if subprocess.run(cmd + [tmp]).returncode != 0 or not os.path.isfile(tmp):
        sys.exit('ffmpeg could not cut that file')
    for ext in EXTS:                      # the new clip is the only one for its slot
        old = os.path.join(MEDIA, f'{slot}.{ext}')
        if os.path.exists(old):
            os.remove(old)
    os.replace(tmp, out)
    print(f'{slot}: {os.path.relpath(out, ROOT)} ({os.path.getsize(out) // 1024} KB). Reload the game to hear it.')


if __name__ == '__main__':
    main(sys.argv[1:])
