Optional clips you add yourself
===============================

Every slot already has the game's own sound, so nothing is silent without a
file here:

  dracarys            "Dracarys!" (a rider's war cry, the game's own synthetic
                      voice) as Rhagal (Level 4), Drogon and Viserion (Level 6)
                      begin to breathe fire, before the flames come
  vhagar_fire         Aemond's cold "Dracarys." as Vhagar (Level 5) begins to
                      breathe fire
  player_death        a funeral bell and low choir when the warrior falls
  aegon_theme         Aegon's own battle theme in the score (Level 7 duel)
  north_remembers     Level 7 ending: the voice line, over the anthem
  king_in_the_north   Level 7 ending: the war horn, the anthem and the hall's
                      chant "The King in the North!"

A clip you put here replaces the game's sound for that slot. The game never
downloads or ships clips. Each slot can be a video (.mp4 H.264+AAC, .webm)
or audio only (.m4a, .mp3, .ogg, .wav). The browser console lists what was
found. M mutes them. Your clips are only served to this PC and are left out
of git (see HOSTING.md).

The easy way, from a copy you already have (needs ffmpeg, installed on this
PC); give the start and end of the moment you want:

  python tools/add_clip.py dracarys "C:\path\to\your-copy.mp4" 0:05 0:07
  python tools/add_clip.py vhagar_fire "C:\path\to\your-copy.mp4" 0:03 0:06
  python tools/add_clip.py aegon_theme "C:\path\to\your-copy.mp4"
  python tools/add_clip.py player_death "C:\path\to\your-copy.mp4" 0:00 0:08
  python tools/add_clip.py north_remembers "C:\path\to\your-copy.mp4" 1:53 1:55
  python tools/add_clip.py king_in_the_north "C:\path\to\your-copy.mp4" 3:48 4:03

It names the file for the slot, keeps the picture for the video slots
(player_death and the two ending slots; add --audio for sound only), and
removes any older file of that slot. Reload the game afterwards.

For the in-fight cues (dracarys, vhagar_fire) keep the clip short (1-3 s).
A cue never interrupts itself: if it is still playing when the next fire
attack starts, that one is skipped.

Clips from the show are HBO's; keep them to your own personal copy of the
game (do not share or publish the game with them inside).
