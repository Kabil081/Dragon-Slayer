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
CREATE TABLE IF NOT EXISTS saves (
  player_id {fk} PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,
  data TEXT NOT NULL,
  saved_at {real} NOT NULL
);
CREATE TABLE IF NOT EXISTS battles (
  id {pk},
  player_id {fk} NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  client_id TEXT NOT NULL,
  level INTEGER NOT NULL,
  boss TEXT NOT NULL,
  won INTEGER NOT NULL,
  clear INTEGER NOT NULL,
  time {real} NOT NULL,
  gold INTEGER NOT NULL,
  xp INTEGER NOT NULL,
  flawless INTEGER NOT NULL,
  created {real} NOT NULL,
  UNIQUE (player_id, client_id)
);
CREATE INDEX IF NOT EXISTS battles_player ON battles(player_id);
CREATE INDEX IF NOT EXISTS battles_created ON battles(created);
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
            for stmt in SCHEMA.format(**DIALECTS[self.kind]).split(';'):
                if stmt.strip():
                    self._run(stmt, ())

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
