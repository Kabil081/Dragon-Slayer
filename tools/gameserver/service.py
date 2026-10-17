"""Accounts, cloud saves, battles and leaderboards. No HTTP here: serve.py
turns requests into these calls, and the tests call them directly.

Only totals are kept: per player the battles, wins, gold and XP won, flawless
wins, and the best clear time of each level; never a row per battle.

Scores come from the game in the player's browser, so a determined cheat
could send false ones; the checks below keep honest mistakes and casual
tampering out. It is a fan game, not a tournament."""
import base64
import collections
import hashlib
import hmac
import json
import math
import re
import secrets
import threading
import time

NAME_RE = re.compile(r'^[A-Za-z0-9][A-Za-z0-9 _.\-]{1,14}[A-Za-z0-9]$')
CLIENT_ID_RE = re.compile(r'^[A-Za-z0-9_\-]{8,64}$')
BOSS_RE = re.compile(r'^[a-z_+]{2,40}$')
COOKIE = 'ds_session'
MAX_SAVE = 200_000                  # bytes of save JSON
BOARDS = ('points', 'gold', 'speed', 'wins')
TOP = 50
Z = 1.96                            # 95% confidence for the win score

# scrypt: 16 MB of memory per hash, about 50 ms
SCRYPT = {'n': 2 ** 14, 'r': 8, 'p': 1}


class ApiError(Exception):
    def __init__(self, status, message):
        super().__init__(message)
        self.status = status
        self.message = message


# ---------------------------------------------------------------- passwords
def hash_password(password):
    salt = secrets.token_bytes(16)
    b64 = lambda b: base64.b64encode(b).decode()
    if hasattr(hashlib, 'scrypt'):
        h = hashlib.scrypt(password.encode(), salt=salt, dklen=32, **SCRYPT)
        return f"scrypt${SCRYPT['n']}${SCRYPT['r']}${SCRYPT['p']}${b64(salt)}${b64(h)}"
    h = hashlib.pbkdf2_hmac('sha256', password.encode(), salt, 600_000)
    return f'pbkdf2_sha256$600000${b64(salt)}${b64(h)}'


def check_password(password, stored):
    try:
        parts = stored.split('$')
        if parts[0] == 'scrypt':
            n, r, p = int(parts[1]), int(parts[2]), int(parts[3])
            salt, want = base64.b64decode(parts[4]), base64.b64decode(parts[5])
            got = hashlib.scrypt(password.encode(), salt=salt, n=n, r=r, p=p, dklen=len(want))
        elif parts[0] == 'pbkdf2_sha256':
            salt, want = base64.b64decode(parts[2]), base64.b64decode(parts[3])
            got = hashlib.pbkdf2_hmac('sha256', password.encode(), salt, int(parts[1]))
        else:
            return False
        return hmac.compare_digest(got, want)
    except (ValueError, IndexError):
        return False


def token_hash(token):
    return hashlib.sha256(token.encode()).hexdigest()


def wilson(wins, n):
    """The lower bound of the 95% interval for the chance of winning the next
    battle: 1 win of 1 scores 21, 10 of 10 scores 72, 90 of 100 scores 83."""
    if n <= 0:
        return 0.0
    p = wins / n
    d = 1 + Z * Z / n
    c = p + Z * Z / (2 * n)
    m = Z * math.sqrt(p * (1 - p) / n + Z * Z / (4 * n * n))
    return max(0.0, (c - m) / d)


class RateLimit:
    """At most `limit` events per key in `window` seconds."""

    def __init__(self, limit, window, clock):
        self.limit, self.window, self.clock = limit, window, clock
        self.hits = collections.defaultdict(collections.deque)
        self.lock = threading.Lock()

    def full(self, key):
        now = self.clock()
        with self.lock:
            q = self.hits.get(key)
            return bool(q) and sum(1 for t in q if t > now - self.window) >= self.limit

    def hit(self, key):
        now = self.clock()
        with self.lock:
            q = self.hits[key]
            while q and q[0] <= now - self.window:
                q.popleft()
            if len(q) >= self.limit:
                return False
            q.append(now)
            if len(self.hits) > 10_000:                 # forget idle keys
                for k in [k for k, v in self.hits.items() if not v]:
                    del self.hits[k]
            return True


class Service:
    """Kept light on the database: sign-ins are remembered in memory, the boards
    are read from indexed columns (top 50) and kept for a few seconds, a battle
    is one update of the player's totals, and the feed of recent battles lives
    in memory only."""

    def __init__(self, settings, db, live=None, clock=time.time):
        self.settings = settings
        self.db = db
        self.live = live
        self.clock = clock
        self.signups = RateLimit(20, 3600, clock)        # new accounts per address
        self.logins = RateLimit(20, 600, clock)          # attempts per address
        self.fails = RateLimit(8, 600, clock)            # wrong passwords per name
        self.battle_rate = RateLimit(60, 600, clock)     # battles per player
        self.version = 0                                 # bumps on every change the boards show
        self.boards = {}                                 # (board, level) -> (version, time, rows, total)
        self.sessions = {}                               # token hash -> (player id, expires)
        self.recent = collections.deque(maxlen=30)       # the feed: recent battles, never stored
        self.lock = threading.Lock()
        self.dummy_hash = hash_password(secrets.token_hex(8))

    # ------------------------------------------------------------ accounts
    def _check_name(self, name):
        name = ' '.join(str(name or '').split())
        if not NAME_RE.match(name):
            raise ApiError(400, 'A name is 3 to 16 letters or numbers (spaces, _ . - allowed inside).')
        return name

    def _check_password(self, password):
        password = str(password or '')
        if len(password) < 8:
            raise ApiError(400, 'The password needs at least 8 characters.')
        if len(password) > 200:
            raise ApiError(400, 'That password is too long.')
        return password

    def _new_session(self, pid):
        token = secrets.token_urlsafe(32)
        now = self.clock()
        exp = now + self.settings.session_days * 86400
        h = token_hash(token)
        self.db.execute('INSERT INTO sessions (token_hash, player_id, created, expires) VALUES (?, ?, ?, ?)',
                        (h, pid, now, exp))
        self._remember(h, pid, exp)
        return token

    def _remember(self, h, pid, exp):
        with self.lock:
            if len(self.sessions) > 20_000:
                self.sessions.clear()
            self.sessions[h] = (pid, exp)

    def signup(self, name, password, ip='?'):
        if not self.settings.allow_signup:
            raise ApiError(403, 'New accounts are closed on this server.')
        name = self._check_name(name)
        password = self._check_password(password)
        if name.lower() in password.lower():
            raise ApiError(400, 'The password must not contain the name.')
        if not self.signups.hit(ip):
            raise ApiError(429, 'Too many new accounts from here. Try again later.')
        now = self.clock()
        try:
            pid = self.db.insert('INSERT INTO players (name, name_key, pass_hash, created, last_seen) VALUES (?, ?, ?, ?, ?)',
                                 (name, name.lower(), hash_password(password), now, now))
        except Exception as e:
            if self.db.is_unique_error(e):
                raise ApiError(409, 'That name is taken. Choose another.')
            raise
        self._changed()
        return self.player(pid), self._new_session(pid)

    def login(self, name, password, ip='?'):
        if not self.logins.hit(ip):
            raise ApiError(429, 'Too many attempts. Wait a few minutes.')
        key = ' '.join(str(name or '').split()).lower()
        row = self.db.one('SELECT id, pass_hash FROM players WHERE name_key = ?', (key,)) if key else None
        if row is not None and self.fails.full('n:' + key):
            raise ApiError(429, 'Too many wrong passwords for this name. Wait ten minutes.')
        ok = check_password(str(password or ''), row['pass_hash'] if row else self.dummy_hash)
        if not row or not ok:
            if row is not None:
                self.fails.hit('n:' + key)
            raise ApiError(401, 'Wrong name or password.')
        now = self.clock()
        self.db.execute('DELETE FROM sessions WHERE expires < ?', (now,))
        self.db.execute('UPDATE players SET last_seen = ? WHERE id = ?', (now, row['id']))
        return self.player(row['id']), self._new_session(row['id'])

    def logout(self, token):
        if token:
            h = token_hash(token)
            with self.lock:
                self.sessions.pop(h, None)
            self.db.execute('DELETE FROM sessions WHERE token_hash = ?', (h,))

    def pid_for(self, token):
        """The signed-in player's id for a session cookie, or None. Usually from memory."""
        if not token or len(token) > 100:
            return None
        h = token_hash(token)
        hit = self.sessions.get(h)
        if hit is None:
            row = self.db.one('SELECT player_id, expires FROM sessions WHERE token_hash = ?', (h,))
            if not row:
                return None
            hit = (row['player_id'], row['expires'])
            self._remember(h, *hit)
        if hit[1] < self.clock():
            self.logout(token)
            return None
        return hit[0]

    def player_for(self, token):
        pid = self.pid_for(token)
        return self.player(pid) if pid else None

    def player(self, pid, full=False):
        """Name, warrior level, gold held, points and place; `full` adds every board's place."""
        row = self.db.one('SELECT id, name, warrior_level, gold_held, created, battles, wins, gold_won, xp_won, points, '
                          'win_score, cleared, total_best FROM players WHERE id = ?', (pid,))
        if not row:
            return None
        return {'id': row['id'], 'name': row['name'], 'level': row['warrior_level'], 'gold': row['gold_held'],
                'created': row['created'], 'standing': self._standing(row, full)}

    def delete_account(self, pid, password):
        row = self.db.one('SELECT pass_hash FROM players WHERE id = ?', (pid,))
        if not row or not check_password(str(password or ''), row['pass_hash']):
            raise ApiError(401, 'Wrong password.')
        with self.lock:
            for h in [h for h, v in self.sessions.items() if v[0] == pid]:
                del self.sessions[h]
        for t in ('sessions', 'best_times'):
            self.db.execute(f'DELETE FROM {t} WHERE player_id = ?', (pid,))
        self.db.execute('DELETE FROM players WHERE id = ?', (pid,))
        self._changed()

    # ------------------------------------------------------------ cloud save
    def get_save(self, pid):
        row = self.db.one('SELECT save_data, saved_at FROM players WHERE id = ?', (pid,))
        if not row or row['save_data'] is None:
            return None
        return {'save': json.loads(row['save_data']), 'savedAt': row['saved_at']}

    def put_save(self, pid, save, saved_at=None):
        if not isinstance(save, dict):
            raise ApiError(400, 'A save is an object.')
        text = json.dumps(save, separators=(',', ':'))
        if len(text) > MAX_SAVE:
            raise ApiError(413, 'That save is too large.')
        at = saved_at if isinstance(saved_at, (int, float)) and math.isfinite(saved_at) else self.clock() * 1000
        num = lambda v, lo, hi, d: int(v) if isinstance(v, (int, float)) and math.isfinite(v) and lo <= v <= hi else d
        level, gold = num(save.get('level'), 1, 999, 1), num(save.get('gold'), 0, 10 ** 9, 0)
        # one statement; a save from an older copy (another browser) never overwrites a newer one
        n = self.db.execute('UPDATE players SET save_data = ?, saved_at = ?, warrior_level = ?, gold_held = ?, last_seen = ? '
                            'WHERE id = ? AND (saved_at IS NULL OR saved_at <= ?)',
                            (text, at, level, gold, self.clock(), pid, at))
        if n:
            self._changed()
        return {'savedAt': at, 'stale': not n}

    # ------------------------------------------------------------ battles
    def record_battle(self, pid, b):
        """A battle's end changes the player's totals (and maybe a best time). Nothing else is kept."""
        if not isinstance(b, dict):
            raise ApiError(400, 'A battle is an object.')
        cid = str(b.get('id', ''))
        level, boss = b.get('level'), str(b.get('boss', ''))
        won, clear, flawless = b.get('won') is True, b.get('clear') is True, b.get('flawless') is True
        t, gold, xp = b.get('time'), b.get('gold', 0), b.get('xp', 0)
        if not CLIENT_ID_RE.match(cid):
            raise ApiError(400, 'Bad battle id.')
        if not isinstance(level, int) or isinstance(level, bool) or not 1 <= level <= 50:
            raise ApiError(400, 'Bad level.')
        if not BOSS_RE.match(boss):
            raise ApiError(400, 'Bad boss.')
        if not isinstance(t, (int, float)) or isinstance(t, bool) or not math.isfinite(t) or not 0 <= t <= 6 * 3600:
            raise ApiError(400, 'Bad time.')
        for v in (gold, xp):
            if not isinstance(v, int) or isinstance(v, bool) or not 0 <= v <= 3000:
                raise ApiError(400, 'Bad reward.')
        if clear and (not won or t < 10):
            raise ApiError(400, 'A clear is a win of at least 10 seconds.')
        if not won and (gold or xp):
            raise ApiError(400, 'A fall pays nothing.')
        if not self.battle_rate.hit(pid):
            raise ApiError(429, 'Too many battles reported. Slow down.')
        t = round(float(t), 1)
        with self.db.lock:
            row = self.db.one('SELECT name, battles, wins, gold_won, xp_won, points, flawless, win_score, cleared, total_best, '
                              'recent_ids, (SELECT time FROM best_times WHERE player_id = ? AND level = ?) AS best '
                              'FROM players WHERE id = ?', (pid, level, pid))
            if not row:
                raise ApiError(401, 'Sign in first.')
            seen = [x for x in (row['recent_ids'] or '').split(',') if x]
            if cid in seen:                                  # a retry of the same battle counts once
                return {'recorded': False, 'standing': self._standing(row)}
            n, w = row['battles'] + 1, row['wins'] + int(won)
            cleared, total = row['cleared'], float(row['total_best'])
            if clear and (row['best'] is None or t < row['best']):
                self.db.execute('INSERT INTO best_times (player_id, level, time) VALUES (?, ?, ?) '
                                'ON CONFLICT (player_id, level) DO UPDATE SET time = excluded.time', (pid, level, t))
                if row['best'] is None:
                    cleared, total = cleared + 1, total + t
                else:
                    total = total - float(row['best']) + t
            new = {'battles': n, 'wins': w, 'gold_won': row['gold_won'] + gold, 'xp_won': row['xp_won'] + xp,
                   'flawless': row['flawless'] + int(flawless), 'win_score': round(100 * wilson(w, n), 1),
                   'cleared': cleared, 'total_best': round(total, 1)}
            new['points'] = new['gold_won'] + new['xp_won']
            self.db.execute('UPDATE players SET battles = ?, wins = ?, gold_won = ?, xp_won = ?, points = ?, flawless = ?, '
                            'win_score = ?, cleared = ?, total_best = ?, recent_ids = ?, last_seen = ? WHERE id = ?',
                            (new['battles'], new['wins'], new['gold_won'], new['xp_won'], new['points'], new['flawless'],
                             new['win_score'], new['cleared'], new['total_best'], ','.join((seen + [cid])[-12:]),
                             self.clock(), pid))
        self._changed()
        event = {'name': row['name'], 'level': level, 'boss': boss, 'won': won, 'clear': clear, 'time': t,
                 'gold': gold, 'at': self.clock()}
        self.recent.appendleft(event)
        if self.live:
            self.live.publish('battle', {**event, 'version': self.version})
        return {'recorded': True, 'standing': self._standing(new)}

    def feed(self, limit=20):
        """The latest battles on this server (kept in memory only; a restart starts it afresh)."""
        try:
            limit = max(1, min(30, int(limit)))
        except (TypeError, ValueError):
            limit = 20
        return list(self.recent)[:limit]

    # ------------------------------------------------------------ leaderboards
    def _changed(self):
        with self.lock:
            self.version += 1

    COLS = ('id, name, warrior_level, gold_held, points, gold_won, xp_won, wins, battles, flawless, '
            'win_score, cleared, total_best')
    ORDER = {
        'points': ('1 = 1', 'points DESC, wins DESC, name_key', ('points',)),
        'gold': ('1 = 1', 'gold_won DESC, points DESC, name_key', ('gold_won',)),
        'wins': ('battles > 0', 'win_score DESC, wins DESC, name_key', ('win_score',)),
        'speed': ('cleared > 0', 'cleared DESC, total_best ASC, name_key', ('cleared', 'total_best')),
    }

    @staticmethod
    def _row(r, best=None):
        n, w = int(r['battles']), int(r['wins'])
        out = {'id': r['id'], 'name': r['name'], 'level': r['warrior_level'], 'held': r['gold_held'],
               'points': r['points'], 'gold': r['gold_won'], 'xp': r['xp_won'], 'wins': w, 'losses': n - w,
               'battles': n, 'flawless': r['flawless'], 'winRate': round(100 * w / n, 1) if n else 0.0,
               'winScore': float(r['win_score']), 'cleared': r['cleared'], 'totalTime': float(r['total_best'])}
        if best is not None:
            out['best'] = float(best)
        return out

    def _top(self, board, level):
        """The top 50 of a board and how many are on it: from memory when fresh (15 s, or until this
        server records a change), else two indexed queries."""
        key = (board, level)
        hit = self.boards.get(key)
        if hit and hit[0] == self.version and self.clock() - hit[1] < 15:
            return hit[2], hit[3]
        if board == 'speed' and level:
            rows = self.db.query(f'SELECT p.{self.COLS.replace(", ", ", p.")}, b.time AS best FROM best_times b '
                                 'JOIN players p ON p.id = b.player_id WHERE b.level = ? ORDER BY b.time, p.name_key LIMIT ?',
                                 (level, TOP))
            total = self.db.one('SELECT COUNT(*) AS n FROM best_times WHERE level = ?', (level,))['n']
            rows = [self._row(r, r['best']) for r in rows]
            tie = lambda r: r['best']
        else:
            where, order, keys = self.ORDER[board]
            rows = [self._row(r) for r in self.db.query(f'SELECT {self.COLS} FROM players WHERE {where} ORDER BY {order} LIMIT ?',
                                                        (TOP,))]
            total = self.db.one(f'SELECT COUNT(*) AS n FROM players WHERE {where}')['n']
            names = {'points': 'points', 'gold_won': 'gold', 'win_score': 'winScore', 'cleared': 'cleared',
                     'total_best': 'totalTime'}
            tie = lambda r: tuple(r[names[k]] for k in keys)
        last, rank = object(), 0
        for i, r in enumerate(rows):
            if tie(r) != last:
                rank, last = i + 1, tie(r)
            r['rank'] = rank
        self.boards[key] = (self.version, self.clock(), rows, int(total))
        return rows, int(total)

    def _rank(self, board, r, level=0, best=None):
        """A player's place on a board: how many are strictly ahead, plus one."""
        if board == 'points':
            sql, p = 'points > ?', (r['points'],)
        elif board == 'gold':
            sql, p = 'gold_won > ?', (r['gold_won'],)
        elif board == 'wins':
            if not r['battles']:
                return None
            sql, p = 'battles > 0 AND win_score > ?', (r['win_score'],)
        elif level:
            if best is None:
                return None
            return self.db.one('SELECT COUNT(*) AS n FROM best_times WHERE level = ? AND time < ?', (level, best))['n'] + 1
        else:
            if not r['cleared']:
                return None
            sql, p = 'cleared > ? OR (cleared = ? AND total_best < ?)', (r['cleared'], r['cleared'], r['total_best'])
        return self.db.one(f'SELECT COUNT(*) AS n FROM players WHERE {sql}', p)['n'] + 1

    def _standing(self, r, full=False):
        """Points and the place on the points board (one count); `full` adds the other boards."""
        ranks = {'points': self._rank('points', r)}
        if full:
            for board in ('gold', 'wins', 'speed'):
                ranks[board] = self._rank(board, r)
        n, w = int(r['battles']), int(r['wins'])
        return {'ranks': ranks, 'points': r['points'], 'gold': r['gold_won'], 'xp': r['xp_won'], 'wins': w,
                'losses': n - w, 'winRate': round(100 * w / n, 1) if n else 0.0, 'winScore': float(r['win_score']),
                'cleared': r['cleared'], 'totalTime': float(r['total_best'])}

    def leaderboard(self, board='points', level=0, me=None):
        if board not in BOARDS:
            raise ApiError(400, 'Unknown board.')
        level = int(level) if str(level).isdigit() and board == 'speed' else 0
        rows, total = self._top(board, level)
        pub = lambda r: {k: v for k, v in r.items() if k != 'id'} | {'me': r['id'] == me}
        mine = next((r for r in rows if r['id'] == me), None)
        if me and not mine:                                   # outside the top 50: one row, one count
            r = self.db.one(f'SELECT {self.COLS}, (SELECT time FROM best_times WHERE player_id = ? AND level = ?) AS best '
                            'FROM players WHERE id = ?', (me, level, me))
            if r:
                rank = self._rank(board, r, level, r['best'])
                if rank:
                    mine = {**self._row(r, r['best'] if level else None), 'rank': rank}
        return {'board': board, 'level': level, 'version': self.version, 'total': total,
                'rows': [pub(r) for r in rows], 'me': pub(mine) if mine else None,
                'online': self.live.clients if self.live else 0}

    def health(self, deep=False):
        """The host's health check. Only `deep` touches the database, so frequent
        checks never keep a sleeping online database awake."""
        out = {'ok': True, 'database': self.db.kind, 'signup': self.settings.allow_signup,
               'online': self.live.clients if self.live else 0}
        if deep:
            try:
                out['players'] = int(self.db.one('SELECT COUNT(*) AS n FROM players')['n'])
            except Exception:
                raise ApiError(503, 'The database cannot be reached.')
        return out
