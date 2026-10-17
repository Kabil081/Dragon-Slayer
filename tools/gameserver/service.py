"""Accounts, cloud saves, battles and leaderboards. No HTTP here: serve.py
turns requests into these calls, and the tests call them directly.

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
        self.cache = None
        self.cache_lock = threading.Lock()
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
        self.db.execute('INSERT INTO sessions (token_hash, player_id, created, expires) VALUES (?, ?, ?, ?)',
                        (token_hash(token), pid, now, now + self.settings.session_days * 86400))
        return token

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
            self.db.execute('DELETE FROM sessions WHERE token_hash = ?', (token_hash(token),))

    def player_for(self, token):
        """The signed-in player for a session cookie, or None."""
        if not token or len(token) > 100:
            return None
        row = self.db.one('SELECT player_id, expires FROM sessions WHERE token_hash = ?', (token_hash(token),))
        if not row:
            return None
        if row['expires'] < self.clock():
            self.logout(token)
            return None
        return self.player(row['player_id'])

    def player(self, pid):
        row = self.db.one('SELECT id, name, warrior_level, gold_held, created FROM players WHERE id = ?', (pid,))
        if not row:
            return None
        return {'id': row['id'], 'name': row['name'], 'level': row['warrior_level'], 'gold': row['gold_held'],
                'created': row['created'], 'standing': self.standing(row['id'])}

    def delete_account(self, pid, password):
        row = self.db.one('SELECT pass_hash FROM players WHERE id = ?', (pid,))
        if not row or not check_password(str(password or ''), row['pass_hash']):
            raise ApiError(401, 'Wrong password.')
        for t in ('sessions', 'saves', 'battles'):
            self.db.execute(f'DELETE FROM {t} WHERE player_id = ?', (pid,))
        self.db.execute('DELETE FROM players WHERE id = ?', (pid,))
        self._changed()

    # ------------------------------------------------------------ cloud save
    def get_save(self, pid):
        row = self.db.one('SELECT data, saved_at FROM saves WHERE player_id = ?', (pid,))
        if not row:
            return None
        return {'save': json.loads(row['data']), 'savedAt': row['saved_at']}

    def put_save(self, pid, save, saved_at=None):
        if not isinstance(save, dict):
            raise ApiError(400, 'A save is an object.')
        text = json.dumps(save, separators=(',', ':'))
        if len(text) > MAX_SAVE:
            raise ApiError(413, 'That save is too large.')
        at = saved_at if isinstance(saved_at, (int, float)) and math.isfinite(saved_at) else self.clock() * 1000
        num = lambda v, lo, hi, d: int(v) if isinstance(v, (int, float)) and math.isfinite(v) and lo <= v <= hi else d
        level, gold = num(save.get('level'), 1, 999, 1), num(save.get('gold'), 0, 10 ** 9, 0)
        n = self.db.execute('INSERT INTO saves (player_id, data, saved_at) VALUES (?, ?, ?) '
                            'ON CONFLICT (player_id) DO UPDATE SET data = excluded.data, saved_at = excluded.saved_at '
                            'WHERE saves.saved_at <= excluded.saved_at', (pid, text, at))
        if not n:                       # the server already has a newer save (another browser)
            return {'savedAt': at, 'stale': True}
        old = self.db.one('SELECT warrior_level, gold_held FROM players WHERE id = ?', (pid,))
        if old and (old['warrior_level'] != level or old['gold_held'] != gold):
            self.db.execute('UPDATE players SET warrior_level = ?, gold_held = ?, last_seen = ? WHERE id = ?',
                            (level, gold, self.clock(), pid))
            self._changed()
        return {'savedAt': at, 'stale': False}

    # ------------------------------------------------------------ battles
    def record_battle(self, pid, b):
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
        now = self.clock()
        n = self.db.execute('INSERT INTO battles (player_id, client_id, level, boss, won, clear, time, gold, xp, flawless, created) '
                            'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT (player_id, client_id) DO NOTHING',
                            (pid, cid, level, boss, int(won), int(clear), float(t), gold, xp, int(flawless), now))
        self.db.execute('UPDATE players SET last_seen = ? WHERE id = ?', (now, pid))
        if n:                                           # a retry of the same battle counts once
            self._changed()
            if self.live:
                name = self.db.one('SELECT name FROM players WHERE id = ?', (pid,))['name']
                self.live.publish('battle', {'name': name, 'level': level, 'boss': boss, 'won': won, 'clear': clear,
                                             'time': round(float(t), 1), 'gold': gold, 'at': now,
                                             'version': self.version})
        return {'recorded': bool(n), 'standing': self.standing(pid)}

    def feed(self, limit=20):
        try:
            limit = int(limit)
        except (TypeError, ValueError):
            limit = 20
        rows = self.db.query('SELECT p.name, b.level, b.boss, b.won, b.clear, b.time, b.gold, b.created '
                             'FROM battles b JOIN players p ON p.id = b.player_id ORDER BY b.id DESC LIMIT ?',
                             (max(1, min(50, int(limit))),))
        return [{'name': r['name'], 'level': r['level'], 'boss': r['boss'], 'won': bool(r['won']),
                 'clear': bool(r['clear']), 'time': round(r['time'], 1), 'gold': r['gold'], 'at': r['created']}
                for r in rows]

    # ------------------------------------------------------------ leaderboards
    def _changed(self):
        with self.cache_lock:
            self.version += 1
            self.cache = None

    def _table(self):
        """Every player's totals, rebuilt after a change (or every 5 s, for
        changes made by another server sharing the same online database)."""
        with self.cache_lock:
            if self.cache and self.cache[0] == self.version and self.clock() - self.cache[1] < 5:
                return self.cache[2]
        players = self.db.query('SELECT id, name, warrior_level, gold_held FROM players')
        agg = {r['player_id']: r for r in self.db.query(
            'SELECT player_id, COUNT(*) AS n, SUM(won) AS w, SUM(gold) AS g, SUM(xp) AS x, SUM(flawless) AS f '
            'FROM battles GROUP BY player_id')}
        best = collections.defaultdict(dict)
        for r in self.db.query('SELECT player_id, level, MIN(time) AS t FROM battles WHERE clear = 1 '
                               'GROUP BY player_id, level'):
            best[r['player_id']][int(r['level'])] = round(float(r['t']), 1)
        table = []
        for p in players:
            a = agg.get(p['id'], {})
            n, w = int(a.get('n') or 0), int(a.get('w') or 0)
            gold, xp = int(a.get('g') or 0), int(a.get('x') or 0)
            b = best.get(p['id'], {})
            table.append({'id': p['id'], 'name': p['name'], 'level': p['warrior_level'], 'held': p['gold_held'],
                          'points': gold + xp, 'gold': gold, 'xp': xp, 'wins': w, 'losses': n - w,
                          'battles': n, 'flawless': int(a.get('f') or 0),
                          'winRate': round(100 * w / n, 1) if n else 0.0,
                          'winScore': round(100 * wilson(w, n), 1),
                          'cleared': len(b), 'totalTime': round(sum(b.values()), 1), 'best': b})
        with self.cache_lock:
            self.cache = (self.version, self.clock(), table)
        return table

    @staticmethod
    def _order(board, level):
        """(filter, sort key, the value that decides a tie) for a board."""
        if board == 'gold':
            return (lambda r: True), (lambda r: (-r['gold'], -r['points'], r['name'].lower())), (lambda r: r['gold'])
        if board == 'wins':
            return ((lambda r: r['battles'] > 0), (lambda r: (-r['winScore'], -r['wins'], r['name'].lower())),
                    (lambda r: r['winScore']))
        if board == 'speed' and level:
            return ((lambda r: level in r['best']), (lambda r: (r['best'][level], r['name'].lower())),
                    (lambda r: r['best'][level]))
        if board == 'speed':
            return ((lambda r: r['cleared'] > 0), (lambda r: (-r['cleared'], r['totalTime'], r['name'].lower())),
                    (lambda r: (r['cleared'], r['totalTime'])))
        return (lambda r: True), (lambda r: (-r['points'], -r['wins'], r['name'].lower())), (lambda r: r['points'])

    def ranked(self, board='points', level=0):
        keep, key, tie = self._order(board, level)
        rows = sorted((r for r in self._table() if keep(r)), key=key)
        out, last, rank = [], object(), 0
        for i, r in enumerate(rows):
            v = tie(r)
            if v != last:
                rank, last = i + 1, v
            out.append({**r, 'rank': rank})
        return out

    def leaderboard(self, board='points', level=0, me=None):
        if board not in BOARDS:
            raise ApiError(400, 'Unknown board.')
        level = int(level) if str(level).isdigit() else 0
        rows = self.ranked(board, level)
        pub = lambda r: {k: v for k, v in r.items() if k != 'id'} | {'me': r['id'] == me,
                                                                    'best': {str(k): t for k, t in r['best'].items()}}
        mine = next((r for r in rows if r['id'] == me), None)
        return {'board': board, 'level': level, 'version': self.version, 'total': len(rows),
                'players': len(self._table()), 'rows': [pub(r) for r in rows[:TOP]],
                'me': pub(mine) if mine else None,
                'online': self.live.clients if self.live else 0}

    def standing(self, pid):
        """A player's points and place on each board."""
        out = {'ranks': {}}
        for board in BOARDS:
            rows = self.ranked(board)
            mine = next((r for r in rows if r['id'] == pid), None)
            out['ranks'][board] = mine['rank'] if mine else None
            if board == 'points':
                out['of'] = len(rows)
                if mine:
                    out.update({k: mine[k] for k in ('points', 'gold', 'xp', 'wins', 'losses', 'winRate',
                                                     'winScore', 'cleared', 'totalTime')})
        return out

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
