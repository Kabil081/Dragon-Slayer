"""The database: SQLite in a local file by default, or an online Postgres
database when DATABASE_URL is set (Neon, Supabase, Render, Railway...).
SQL is written once with ? placeholders; one connection, used under a lock
(plenty for a fan game; the server is a single process)."""
import os
import sqlite3
import sys
import threading
import time
import urllib.parse

# Only what the boards need: each player's totals (one row, updated per battle)
# and their best clear time per level. No battle is stored on its own.
SCHEMA = """
CREATE TABLE IF NOT EXISTS players (
  id {pk},
  name TEXT NOT NULL,
  name_key TEXT NOT NULL UNIQUE,
  pass_hash TEXT NOT NULL,
  created {real} NOT NULL,
  last_seen {real} NOT NULL,
  warrior_level INTEGER NOT NULL DEFAULT 1,
  gold_held INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  player_id {fk} NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  created {real} NOT NULL,
  expires {real} NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_player ON sessions(player_id);
CREATE TABLE IF NOT EXISTS best_times (
  player_id {fk} NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  level INTEGER NOT NULL,
  time {real} NOT NULL,
  PRIMARY KEY (player_id, level)
);
CREATE INDEX IF NOT EXISTS best_times_level ON best_times(level, time)
"""

# columns added to players by schema 2 (the totals and the cloud save)
PLAYER_COLUMNS = [
    ('save_data', 'TEXT'), ('saved_at', '{real}'), ('battles', 'INTEGER NOT NULL DEFAULT 0'),
    ('wins', 'INTEGER NOT NULL DEFAULT 0'), ('gold_won', 'INTEGER NOT NULL DEFAULT 0'),
    ('xp_won', 'INTEGER NOT NULL DEFAULT 0'), ('points', 'INTEGER NOT NULL DEFAULT 0'),
    ('flawless', 'INTEGER NOT NULL DEFAULT 0'), ('win_score', '{real} NOT NULL DEFAULT 0'),
    ('cleared', 'INTEGER NOT NULL DEFAULT 0'), ('total_best', '{real} NOT NULL DEFAULT 0'),
    ('recent_ids', "TEXT NOT NULL DEFAULT ''"),
]
PLAYER_INDEXES = """
CREATE INDEX IF NOT EXISTS players_points ON players(points);
CREATE INDEX IF NOT EXISTS players_gold ON players(gold_won);
CREATE INDEX IF NOT EXISTS players_wins ON players(win_score);
CREATE INDEX IF NOT EXISTS players_speed ON players(cleared, total_best)
"""

DIALECTS = {
    'sqlite': {'pk': 'INTEGER PRIMARY KEY AUTOINCREMENT', 'fk': 'INTEGER', 'real': 'REAL'},
    'postgres': {'pk': 'BIGSERIAL PRIMARY KEY', 'fk': 'BIGINT', 'real': 'DOUBLE PRECISION'},
}


class DatabaseError(Exception):
    pass


class Database:
    def __init__(self, settings):
        self.lock = threading.RLock()
        self.url = settings.database_url
        self.path = settings.db_path
        self.kind = 'postgres' if self.url else 'sqlite'
        self.conn = None
        self._connect()
        with self.lock:
            self.migrate()

    # ------------------------------------------------------------ schema
    def statements(self, text):
        return [st for st in text.format(**DIALECTS[self.kind]).split(';') if st.strip()]

    def has_table(self, name):
        if self.kind == 'sqlite':
            sql = "SELECT 1 AS x FROM sqlite_master WHERE type = 'table' AND name = ?"
        else:
            sql = 'SELECT 1 AS x FROM information_schema.tables WHERE table_schema = current_schema() AND table_name = ?'
        return bool(self._run(sql, (name,))[0])

    def columns(self, table):
        if self.kind == 'sqlite':
            return {r['name'] for r in self._run(f'PRAGMA table_info({table})', ())[0]}
        return {r['column_name'] for r in self._run('SELECT column_name FROM information_schema.columns '
                                                   'WHERE table_schema = current_schema() AND table_name = ?', (table,))[0]}

    def migrate(self):
        """Create the tables, add schema 2's columns, and fold any old per-battle
        rows and saves (schema 1) into the players' totals, once, in one transaction."""
        for st in self.statements(SCHEMA):
            self._run(st, ())
        have = self.columns('players')
        for name, kind in PLAYER_COLUMNS:
            if name not in have:
                self._run(f'ALTER TABLE players ADD COLUMN {name} {kind.format(**DIALECTS[self.kind])}', ())
        for st in self.statements(PLAYER_INDEXES):
            self._run(st, ())
        if not (self.has_table('battles') or self.has_table('saves')):
            return
        self._run('BEGIN', ())
        try:
            if self.kind == 'postgres':
                self._run('SELECT pg_advisory_xact_lock(4242)', ())      # one server migrates; the others wait
            if self.has_table('saves'):
                for r in self._run('SELECT player_id, data, saved_at FROM saves', ())[0]:
                    self._run('UPDATE players SET save_data = ?, saved_at = ? WHERE id = ?',
                              (r['data'], r['saved_at'], r['player_id']))
                self._run('DROP TABLE saves', ())
            if self.has_table('battles'):
                from .service import wilson
                totals = self._run('SELECT player_id, COUNT(*) AS n, SUM(won) AS w, SUM(gold) AS g, SUM(xp) AS x, '
                                   'SUM(flawless) AS f FROM battles GROUP BY player_id', ())[0]
                best = self._run('SELECT player_id, level, MIN(time) AS t FROM battles WHERE clear = 1 '
                                 'GROUP BY player_id, level', ())[0]
                per = {}
                for b in best:
                    self._run('INSERT INTO best_times (player_id, level, time) VALUES (?, ?, ?) '
                              'ON CONFLICT (player_id, level) DO UPDATE SET time = excluded.time '
                              'WHERE excluded.time < best_times.time', (b['player_id'], b['level'], float(b['t'])))
                    per.setdefault(b['player_id'], []).append(float(b['t']))
                for t in totals:
                    n, w = int(t['n']), int(t['w'] or 0)
                    g, x, f = int(t['g'] or 0), int(t['x'] or 0), int(t['f'] or 0)
                    times = per.get(t['player_id'], [])
                    self._run('UPDATE players SET battles = battles + ?, wins = wins + ?, gold_won = gold_won + ?, '
                              'xp_won = xp_won + ?, points = points + ?, flawless = flawless + ? WHERE id = ?',
                              (n, w, g, x, g + x, f, t['player_id']))
                    row = self._run('SELECT battles, wins FROM players WHERE id = ?', (t['player_id'],))[0][0]
                    agg = self._run('SELECT COUNT(*) AS c, COALESCE(SUM(time), 0) AS s FROM best_times '
                                    'WHERE player_id = ?', (t['player_id'],))[0][0]
                    self._run('UPDATE players SET win_score = ?, cleared = ?, total_best = ? WHERE id = ?',
                              (round(100 * wilson(int(row['wins']), int(row['battles'])), 1), int(agg['c']),
                               round(float(agg['s']), 1), t['player_id']))
                self._run('DROP TABLE battles', ())
            self._run('COMMIT', ())
        except Exception:
            self._run('ROLLBACK', ())
            raise

    # ------------------------------------------------------------ connection
    def _connect(self):
        if self.kind == 'sqlite':
            folder = os.path.dirname(self.path)
            if folder:
                os.makedirs(folder, exist_ok=True)
            self.conn = sqlite3.connect(self.path, check_same_thread=False, isolation_level=None, timeout=10)
            self.conn.execute('PRAGMA journal_mode=WAL')
            self.conn.execute('PRAGMA foreign_keys=ON')
            return
        try:
            import psycopg
        except ImportError:
            raise DatabaseError('DATABASE_URL is set, so the Postgres driver is needed: '
                                'pip install "psycopg[binary]"  (or clear DATABASE_URL to use SQLite)')
        self._pg = psycopg
        secret = urllib.parse.urlsplit(self.url).password or '\0'
        for attempt in range(4):
            try:
                # no server-side prepared statements: they do not survive a connection pooler (Neon's "-pooler" host)
                self.conn = psycopg.connect(self.url, autocommit=True, connect_timeout=15, prepare_threshold=None)
                return
            except psycopg.Error as e:
                # a sleeping online database (Neon's free plan pauses when idle) can refuse the first try
                why = ' '.join(str(e).replace(secret, '***').split())[:240]
                if attempt == 3:
                    raise DatabaseError(f'Could not reach the Postgres database ({e.__class__.__name__}: {why}). '
                                        'Check DATABASE_URL in .env.') from None
                print(f'Database: not ready yet ({why}); trying again', file=sys.stderr, flush=True)
                time.sleep(2 * (attempt + 1))

    def _sql(self, sql):
        return sql.replace('?', '%s') if self.kind == 'postgres' else sql

    def _run(self, sql, params):
        """Execute and return (rows as dicts or None, cursor)."""
        try:
            if self.kind == 'postgres' and self.conn.closed:
                self._connect()
            cur = self.conn.cursor()
            cur.execute(self._sql(sql), params)
        except Exception as e:
            # hosted databases drop idle connections (Neon sleeps after a few idle minutes): reconnect once and retry
            if self.kind == 'postgres' and isinstance(e, (self._pg.OperationalError, self._pg.InterfaceError)):
                self._connect()
                cur = self.conn.cursor()
                cur.execute(self._sql(sql), params)
            else:
                raise
        if cur.description is None:
            return None, cur
        cols = [d[0] for d in cur.description]
        return [dict(zip(cols, r)) for r in cur.fetchall()], cur

    # ------------------------------------------------------------ queries
    def query(self, sql, params=()):
        with self.lock:
            return self._run(sql, params)[0] or []

    def one(self, sql, params=()):
        rows = self.query(sql, params)
        return rows[0] if rows else None

    def execute(self, sql, params=()):
        """Returns the number of rows changed."""
        with self.lock:
            return self._run(sql, params)[1].rowcount

    def insert(self, sql, params=()):
        """An INSERT into a table with an id column; returns the new id."""
        with self.lock:
            if self.kind == 'postgres':
                rows, _ = self._run(sql + ' RETURNING id', params)
                return rows[0]['id']
            return self._run(sql, params)[1].lastrowid

    def is_unique_error(self, e):
        if self.kind == 'sqlite':
            return isinstance(e, sqlite3.IntegrityError)
        return isinstance(e, self._pg.errors.UniqueViolation)

    def close(self):
        with self.lock:
            if self.conn is not None:
                self.conn.close()
                self.conn = None
