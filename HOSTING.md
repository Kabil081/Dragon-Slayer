# Playing online: accounts and the live leaderboard

The game's own server (`tools/serve.py`) serves the game and the online
side: accounts, a cloud copy of each player's progress, every battle sent to
the leaderboard, and live news of other players' battles. Everyone who opens
the same server's address shares one leaderboard, and it changes as they play.

Without an account the game plays exactly as before (a guest save in the
browser). The leaderboard counts battles fought while signed in.

## The leaderboards

| Board | Ranks by |
|---|---|
| Points | every gold coin and point of experience won in battle |
| Gold | gold won in battle (spending it in the armory never costs a place) |
| Speed | the fastest clear of each level; "All" = most levels cleared, then the lowest total of best times |
| Win probability | how sure the board is that you win your next battle: the 95% lower bound of your win rate (1 win of 1 scores 21, 10 of 10 scores 72) |

Every boss fight counts: a win or a fall. In Level 7 each boss is a battle,
and finishing the level is a clear.

## 1. On this PC

Double-click `play.bat`. With no `.env` changes the database is a file,
`data/dragonslayer.sqlite3`, created on first start. Nothing to install and
no passwords to set.

## 2. With others on your home network

In `.env` set `DS_HOST=0.0.0.0`, restart `play.bat`, and let Windows allow
Python through the firewall when it asks. Others open
`http://YOUR-PC-IP:8642` (find the IP with `ipconfig`, "IPv4 Address").

## 3. On the internet (Render + your Neon database)

The repository is ready for Render (`render.yaml`, `Dockerfile`):

1. Put the project on GitHub: create an empty **private** repository on github.com, then in this folder:
   `git remote add origin https://github.com/YOU/dragonslayer.git` and `git push -u origin main`.
   (`.env` is never uploaded.)
2. On render.com: New → Blueprint → pick the repository. Render reads `render.yaml` and asks for one
   value, `DATABASE_URL`: paste the Neon connection string from your `.env`.
3. Wait for the build; the game is at `https://dragonslayer-XXXX.onrender.com`. Every push redeploys.

Or as a plain Python web service (New → Web Service): Root Directory empty, Build Command
`pip install -r requirements.txt`, Start Command `python tools/serve.py`, Health Check Path
`/api/health`, and the environment variable `DATABASE_URL`. On a host (it sets `PORT`) the server
listens publicly, trusts the host's proxy and logs quietly by itself.

The free plan sleeps after 15 idle minutes (the first visit then takes about a minute), and Neon's free
database sleeps too (the server retries while it wakes).

## 3b. Other hosts

Put the project on a host that runs Python (3.9 or newer). The start
command is `python tools/serve.py`; the host's `PORT` is used automatically.

Free hosts usually wipe their disk on every restart, so keep the accounts in
an online Postgres database (Neon, Supabase, Render, Railway all have free
plans):

1. Create the database and copy its connection string (it starts with
   `postgresql://`).
2. On the host, set these settings (environment variables):

   | Setting | Value |
   |---|---|
   | `DATABASE_URL` | the connection string |
   | `DS_HOST` | `0.0.0.0` |
   | `DS_TRUST_PROXY` | `1` |
   | `DS_COOKIE_SECURE` | `1` |

3. Build command: `pip install -r requirements.txt` (only the Postgres
   driver). Start command: `python tools/serve.py`.

The tables are created on first start. For example, on Render: New → Web
Service → your repository; Runtime Python; the build and start commands
above; the settings under Environment.

A host with a lasting disk (a small VPS, Railway or Fly with a volume) can
keep SQLite instead: leave `DATABASE_URL` empty and point `DS_DB_PATH` at
the volume.

Static-only hosting (GitHub Pages, Netlify) cannot run the server: the game
would load, but without accounts or a leaderboard.

## Keep private

- Never upload `.env` or the `data/` folder (both are in `.gitignore`).
  Hosting services take their settings from their own dashboard instead.
- Your own film clips in `assets/media/` are git-ignored and are only served
  to the PC the server runs on. They are HBO's: do not publish them.
- Passwords are stored as scrypt hashes, never as text. Sign-ins are
  HttpOnly cookies. The server serves only the game's files (`index.html`,
  `src/`, `assets/`, `styles/`).
- Scores come from the players' browsers. The server rejects impossible
  ones, but a determined cheat could still fake a score. That is fine for a
  game among friends.

## Testing the server

```bash
python tools/test_server.py
```

It uses a throwaway database. To run the same tests on a Postgres database
(emptied first!), set `DS_TEST_DATABASE_URL` to its connection string.
