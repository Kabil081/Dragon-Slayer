"""Tests for the game server: accounts, saves, battles, leaderboards, live
updates and which files it serves. Uses a throwaway database.

    python tools/test_server.py
"""
import http.client
import json
import os
import shutil
import sys
import tempfile
import threading
import time
import unittest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from gameserver.config import Settings, read_env_file   # noqa: E402
from gameserver.service import wilson                    # noqa: E402
import serve                                              # noqa: E402


serve.Handler.log_message = lambda *a: None       # quiet


class Client:
    """A browser stand-in: keeps its own session cookie."""

    def __init__(self, port):
        self.port = port
        self.cookie = None

    def call(self, method, path, body=None, headers=None, raw=None):
        c = http.client.HTTPConnection('127.0.0.1', self.port, timeout=10)
        h = {'Host': f'127.0.0.1:{self.port}'}
        if body is not None or raw is not None:
            h['Content-Type'] = 'application/json'
        if self.cookie:
            h['Cookie'] = self.cookie
        h.update(headers or {})
        data = raw if raw is not None else (json.dumps(body).encode() if body is not None else None)
        c.request(method, path, body=data, headers=h)
        r = c.getresponse()
        text = r.read()
        set_cookie = r.getheader('Set-Cookie')
        if set_cookie:
            self.cookie = set_cookie.split(';', 1)[0]
            self.last_cookie = set_cookie
        c.close()
        try:
            payload = json.loads(text) if text else None
        except ValueError:
            payload = text
        return r.status, payload


def pw(name):
    return 'winter-' + name[::-1]          # never contains the name itself


def battle(n, level=1, boss='ember_wyrm', won=True, clear=None, t=95.0, gold=100, xp=80, flawless=False):
    clear = won if clear is None else clear
    return {'id': f'battle-{n:06d}-test', 'level': level, 'boss': boss, 'won': won, 'clear': clear,
            'time': t, 'gold': gold if won else 0, 'xp': xp if won else 0, 'flawless': flawless}


class ServerTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.mkdtemp(prefix='ds-test-')
        # DS_TEST_DATABASE_URL: run the same tests on a throwaway Postgres database (emptied first)
        url = os.environ.get('DS_TEST_DATABASE_URL', '')
        cls.settings = Settings(env_file='', overrides={'DS_DB_PATH': os.path.join(cls.tmp, 'test.sqlite3'),
                                                        'DS_HOST': '127.0.0.1', 'DATABASE_URL': url})
        if url:
            import psycopg
            with psycopg.connect(url, autocommit=True) as conn:
                conn.execute('DROP TABLE IF EXISTS battles, saves, sessions, best_times, players CASCADE')
        cls.server = serve.make_server(cls.settings, 0)
        cls.port = cls.server.server_address[1]
        assert cls.port != cls.settings.port, "the tests must never share the game's own port"
        threading.Thread(target=cls.server.serve_forever, daemon=True).start()

    @classmethod
    def tearDownClass(cls):
        cls.server.service.live.close()
        cls.server.shutdown()
        cls.server.server_close()
        cls.server.service.db.close()
        shutil.rmtree(cls.tmp, ignore_errors=True)

    def setUp(self):
        svc = self.server.service                      # each test starts with fresh rate limits
        for lim in (svc.signups, svc.logins, svc.fails, svc.battle_rate):
            lim.hits.clear()

    def client(self):
        return Client(self.port)

    def new_player(self, name):
        c = self.client()
        s, r = c.call('POST', '/api/signup', {'name': name, 'password': pw(name)})
        self.assertEqual(s, 200, r)
        return c

    # ------------------------------------------------------------ files
    def test_files(self):
        c = self.client()
        self.assertEqual(c.call('GET', '/')[0], 200)
        self.assertEqual(c.call('GET', '/src/main.js?v=1')[0], 200)
        for bad in ('/.env', '/.env.example', '/data/dragonslayer.sqlite3', '/tools/serve.py', '/CLAUDE.md',
                    '/src/', '/assets/../.env', '/assets/x%5C..%5C..%5C.env', '/%2Eenv', '/DATA/x', '/.gitignore'):
            self.assertEqual(c.call('GET', bad)[0], 404, bad)
        self.assertEqual(c.call('HEAD', '/assets/media/README.txt')[0], 200)   # this PC may see its clips
        self.assertEqual(c.call('HEAD', '/assets/media/README.txt', headers={'X-Forwarded-For': '203.0.113.9'})[0], 404)

    def test_caching_and_headers(self):
        c = http.client.HTTPConnection('127.0.0.1', self.port, timeout=10)
        c.request('GET', '/src/main.js', headers={'Accept-Encoding': 'gzip'})
        r = c.getresponse()
        body = r.read()
        import gzip as gz
        self.assertEqual(r.getheader('Content-Encoding'), 'gzip')
        self.assertIn(b'boot', gz.decompress(body))
        self.assertEqual(r.getheader('Cache-Control'), 'no-cache')        # kept, checked on every visit
        self.assertIn("default-src 'self'", r.getheader('Content-Security-Policy'))
        self.assertEqual(r.getheader('X-Content-Type-Options'), 'nosniff')
        last = r.getheader('Last-Modified')
        c.request('GET', '/src/main.js', headers={'Accept-Encoding': 'gzip', 'If-Modified-Since': last})
        r = c.getresponse()
        r.read()
        self.assertEqual(r.status, 304)
        c.request('GET', '/assets/manifest.json')                         # no gzip asked: sent plain
        r = c.getresponse()
        self.assertIsNone(r.getheader('Content-Encoding'))
        self.assertEqual(json.loads(r.read())['game'][:12], 'DRAGONSLAYER')
        c.request('GET', '/api/health')
        r = c.getresponse()
        h = json.loads(r.read())
        self.assertEqual(r.getheader('Cache-Control'), 'no-store')
        self.assertNotIn('players', h)                                    # the host's check never wakes the database
        c.request('GET', '/api/health?deep=1')
        r = c.getresponse()
        self.assertIn('players', json.loads(r.read()))
        self.assertIsNone(r.getheader('Strict-Transport-Security'))       # plain http here
        c.close()
        svc = self.server.service
        svc.settings.trust_proxy = True                                    # behind a host's proxy chain
        try:
            for h in ({'X-Forwarded-Proto': 'https, https'}, {'Cf-Visitor': '{"scheme":"https"}'}):
                c = http.client.HTTPConnection('127.0.0.1', self.port, timeout=10)
                c.request('GET', '/api/health', headers=h)
                r = c.getresponse()
                r.read()
                self.assertEqual(r.getheader('Strict-Transport-Security'), 'max-age=31536000', h)
                c.close()
        finally:
            svc.settings.trust_proxy = False

    def test_env_file(self):
        p = os.path.join(self.tmp, 'sample.env')
        with open(p, 'w', encoding='utf-8') as f:
            f.write('# c\nexport DS_PORT=9000\nDS_HOST="0.0.0.0"\nDATABASE_URL=\nDS_SESSION_DAYS=7 # a week\nnoequals\n')
        v = read_env_file(p)
        self.assertEqual(v, {'DS_PORT': '9000', 'DS_HOST': '0.0.0.0', 'DATABASE_URL': '', 'DS_SESSION_DAYS': '7'})
        s = Settings(env_file=p)
        self.assertEqual((s.host, s.session_days), ('0.0.0.0', 7.0))
        self.assertNotIn('PASSWORD', Settings(env_file='', overrides={'DATABASE_URL': 'postgresql://u:PASSWORD@db.host/x'}).db_label)

    # ------------------------------------------------------------ accounts
    def test_accounts(self):
        c = self.client()
        self.assertEqual(c.call('POST', '/api/signup', {'name': 'x', 'password': 'longenough1'})[0], 400)
        self.assertEqual(c.call('POST', '/api/signup', {'name': 'Ghost', 'password': 'short'})[0], 400)
        self.assertEqual(c.call('POST', '/api/signup', {'name': 'Ghost', 'password': 'ghost-password'})[0], 400)
        s, r = c.call('POST', '/api/signup', {'name': 'Arya Stark', 'password': 'needle-and-water'})
        self.assertEqual(s, 200)
        self.assertEqual(r['player']['name'], 'Arya Stark')
        self.assertNotIn('pass_hash', json.dumps(r))
        self.assertIn('HttpOnly', c.last_cookie)
        self.assertIn('SameSite=Strict', c.last_cookie)
        self.assertEqual(c.call('GET', '/api/me')[1]['player']['name'], 'Arya Stark')
        self.assertEqual(self.client().call('POST', '/api/signup', {'name': 'arya stark', 'password': 'another-pass'})[0], 409)
        self.assertIsNone(self.client().call('GET', '/api/me')[1]['player'])
        self.assertEqual(c.call('POST', '/api/logout', {})[0], 200)
        self.assertIsNone(c.call('GET', '/api/me')[1]['player'])
        d = self.client()
        self.assertEqual(d.call('POST', '/api/login', {'name': 'ARYA STARK', 'password': 'wrong-pass'})[0], 401)
        self.assertEqual(d.call('POST', '/api/login', {'name': 'nobody here', 'password': 'wrong-pass'})[0], 401)
        s, r = d.call('POST', '/api/login', {'name': 'arya  stark', 'password': 'needle-and-water'})
        self.assertEqual((s, r['player']['name']), (200, 'Arya Stark'))

    def test_lockout(self):
        self.new_player('Theon')
        c = self.client()
        for _ in range(8):
            self.assertEqual(c.call('POST', '/api/login', {'name': 'Theon', 'password': 'not-it-at-all'})[0], 401)
        # nine wrong guesses lock the name for ten minutes, even with the right password
        self.assertEqual(c.call('POST', '/api/login', {'name': 'Theon', 'password': pw('Theon')})[0], 429)

    def test_cross_site(self):
        c = self.new_player('Bran')
        s, _ = c.call('POST', '/api/battle', raw=json.dumps(battle(1)).encode(),
                      headers={'Content-Type': 'text/plain'})
        self.assertEqual(s, 403)
        s, _ = c.call('POST', '/api/battle', battle(2), headers={'Origin': 'https://evil.example'})
        self.assertEqual(s, 403)
        s, _ = c.call('POST', '/api/battle', battle(3), headers={'Origin': f'http://127.0.0.1:{self.port}'})
        self.assertEqual(s, 200)
        self.assertEqual(self.client().call('POST', '/api/battle', battle(4))[0], 401)

    def test_delete_account(self):
        c = self.new_player('Ramsay')
        c.call('POST', '/api/battle', battle(1))
        self.assertEqual(c.call('DELETE', '/api/account', {'password': 'nope-nope-nope'})[0], 401)
        self.assertEqual(c.call('DELETE', '/api/account', {'password': pw('Ramsay')})[0], 200)
        self.assertIsNone(c.call('GET', '/api/me')[1]['player'])
        names = [r['name'] for r in self.client().call('GET', '/api/leaderboard')[1]['rows']]
        self.assertNotIn('Ramsay', names)

    # ------------------------------------------------------------ saves
    def test_save(self):
        c = self.new_player('Sansa')
        self.assertIsNone(c.call('GET', '/api/save')[1]['save'])
        save = {'version': 1, 'level': 6, 'gold': 1234, 'levels': {'1': {'cleared': True}}}
        self.assertEqual(c.call('PUT', '/api/save', {'save': save, 'savedAt': 1000})[0], 200)
        s, r = c.call('GET', '/api/save')
        self.assertEqual((r['save'], r['savedAt']), (save, 1000))
        me = c.call('GET', '/api/me')[1]['player']
        self.assertEqual((me['level'], me['gold']), (6, 1234))
        self.assertEqual(c.call('PUT', '/api/save', {'save': [1, 2]})[0], 400)
        self.assertEqual(c.call('PUT', '/api/save', {'save': {'x': 'y' * 220_000}})[0], 413)
        self.assertEqual(self.client().call('GET', '/api/save')[0], 401)

    # ------------------------------------------------------------ battles and boards
    def test_battle_checks(self):
        c = self.new_player('Hodor')
        for bad in ({**battle(1), 'level': 0}, {**battle(2), 'gold': -5}, {**battle(3), 'gold': 99999},
                    {**battle(4), 'time': 5}, {**battle(5, won=False), 'gold': 50}, {**battle(6), 'id': 'x'},
                    {**battle(7), 'boss': 'DROP TABLE'}, {**battle(8), 'time': float('inf')}, {**battle(9), 'won': 1}):
            s = c.call('POST', '/api/battle', raw=json.dumps(bad).encode())[0]
            self.assertEqual(s, 400, bad)
        self.assertTrue(c.call('POST', '/api/battle', battle(10))[1]['recorded'])
        self.assertFalse(c.call('POST', '/api/battle', battle(10))[1]['recorded'])      # a retry counts once

    def test_boards(self):
        jon, dany, tyrion = self.new_player('Jon'), self.new_player('Daenerys'), self.new_player('Tyrion')
        n = 100
        for i in range(3):                                                    # Jon: 3 wins, 1 fall
            jon.call('POST', '/api/battle', battle(n + i, level=i + 1, t=200 - i * 10, gold=150, xp=100))
        jon.call('POST', '/api/battle', battle(n + 3, level=4, won=False))
        for i in range(8):                                                    # Daenerys: 8 wins, fast Level 1
            dany.call('POST', '/api/battle', battle(n + 10 + i, level=1, t=60 + i, gold=40, xp=20))
        tyrion.call('POST', '/api/battle', battle(n + 30, level=1, won=False))  # Tyrion: 1 fall
        lb = lambda board, level=0, who=jon: who.call('GET', f'/api/leaderboard?board={board}&level={level}')[1]
        pts = lb('points')
        order = [r['name'] for r in pts['rows'] if r['name'] in ('Jon', 'Daenerys', 'Tyrion')]
        self.assertEqual(order, ['Jon', 'Daenerys', 'Tyrion'])              # 750 > 480 > 0
        jrow = next(r for r in pts['rows'] if r['name'] == 'Jon')
        self.assertTrue(jrow['me'])
        self.assertEqual((jrow['points'], jrow['gold'], jrow['wins'], jrow['losses']), (750, 450, 3, 1))
        self.assertEqual(pts['me']['name'], 'Jon')
        self.assertNotIn('id', jrow)
        gold = [r['name'] for r in lb('gold')['rows'] if r['name'] in ('Jon', 'Daenerys')]
        self.assertEqual(gold, ['Jon', 'Daenerys'])
        wins = lb('wins')['rows']
        self.assertEqual(wins[0]['name'], 'Daenerys')                        # 8-0 beats 3-1
        self.assertNotIn('Sansa', [r['name'] for r in wins])                # no battles, not ranked
        self.assertEqual(next(r for r in wins if r['name'] == 'Daenerys')['winScore'], round(100 * wilson(8, 8), 1))
        sp1 = [r['name'] for r in lb('speed', 1)['rows']]
        self.assertLess(sp1.index('Daenerys'), sp1.index('Jon'))            # 60 s beats 200 s on Level 1
        sp = lb('speed')['rows']
        self.assertEqual(sp[0]['name'], 'Jon')                              # three levels cleared beats one
        self.assertEqual(sp[0]['cleared'], 3)
        self.assertEqual(self.client().call('GET', '/api/leaderboard?board=nope')[0], 400)
        feed = self.client().call('GET', '/api/feed?limit=3')[1]['feed']
        self.assertEqual((len(feed), feed[0]['name'], feed[0]['won']), (3, 'Tyrion', False))
        st = jon.call('GET', '/api/me?full=1')[1]['player']['standing']
        self.assertEqual((st['points'], st['wins'], st['ranks']['points'], st['ranks']['wins'] > 1), (750, 3, 1, True))

    def test_migration_from_battle_rows(self):
        import sqlite3
        from gameserver.db import Database
        path = os.path.join(self.tmp, 'old.sqlite3')
        c = sqlite3.connect(path)
        c.executescript('''
          CREATE TABLE players (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, name_key TEXT NOT NULL UNIQUE,
            pass_hash TEXT NOT NULL, created REAL NOT NULL, last_seen REAL NOT NULL,
            warrior_level INTEGER NOT NULL DEFAULT 1, gold_held INTEGER NOT NULL DEFAULT 0);
          CREATE TABLE saves (player_id INTEGER PRIMARY KEY, data TEXT NOT NULL, saved_at REAL NOT NULL);
          CREATE TABLE battles (id INTEGER PRIMARY KEY AUTOINCREMENT, player_id INTEGER NOT NULL, client_id TEXT NOT NULL,
            level INTEGER NOT NULL, boss TEXT NOT NULL, won INTEGER NOT NULL, clear INTEGER NOT NULL, time REAL NOT NULL,
            gold INTEGER NOT NULL, xp INTEGER NOT NULL, flawless INTEGER NOT NULL, created REAL NOT NULL);
          INSERT INTO players (name, name_key, pass_hash, created, last_seen) VALUES ('Old Bear', 'old bear', 'x', 1, 1);
          INSERT INTO saves VALUES (1, '{"level": 3}', 5);
          INSERT INTO battles (player_id, client_id, level, boss, won, clear, time, gold, xp, flawless, created) VALUES
            (1, 'a', 1, 'ember_wyrm', 1, 1, 120, 100, 90, 0, 1), (1, 'b', 1, 'ember_wyrm', 1, 1, 95, 40, 30, 1, 2),
            (1, 'c', 2, 'emberwing', 0, 0, 30, 0, 0, 0, 3);''')
        c.commit()
        c.close()
        db = Database(Settings(env_file='', overrides={'DS_DB_PATH': path, 'DATABASE_URL': ''}))
        p = db.one('SELECT * FROM players WHERE id = 1')
        self.assertEqual((p['battles'], p['wins'], p['gold_won'], p['xp_won'], p['points'], p['flawless'], p['cleared'],
                          p['total_best'], p['save_data'], p['saved_at']), (3, 2, 140, 120, 260, 1, 1, 95.0, '{"level": 3}', 5))
        self.assertFalse(db.has_table('battles') or db.has_table('saves'))       # the per-battle rows are gone
        self.assertEqual(db.one('SELECT time FROM best_times WHERE player_id = 1 AND level = 1')['time'], 95.0)
        db.close()
        Database(Settings(env_file='', overrides={'DS_DB_PATH': path, 'DATABASE_URL': ''})).close()   # twice is harmless

    def test_wilson(self):
        self.assertEqual(wilson(0, 0), 0)
        self.assertAlmostEqual(wilson(1, 1), 0.2065, places=3)
        self.assertAlmostEqual(wilson(10, 10), 0.7225, places=3)
        self.assertLess(wilson(9, 10), wilson(90, 100))

    # ------------------------------------------------------------ live
    def test_live(self):
        watcher = http.client.HTTPConnection('127.0.0.1', self.port, timeout=10)
        watcher.request('GET', '/api/live')
        r = watcher.getresponse()
        self.assertEqual(r.getheader('Content-Type'), 'text/event-stream')
        got = []

        def read():
            buf = b''
            while b'event: battle' not in buf:
                line = r.fp.readline()
                if not line:
                    break
                buf += line
            buf += r.fp.readline() + r.fp.readline()
            got.append(buf.decode())

        t = threading.Thread(target=read, daemon=True)
        t.start()
        time.sleep(0.3)
        self.assertGreaterEqual(self.client().call('GET', '/api/health')[1]['online'], 1)
        sam = self.new_player('Samwell')
        sam.call('POST', '/api/battle', battle(500, level=5, boss='vhagar', t=600, gold=400, xp=350))
        t.join(5)
        watcher.close()
        self.assertTrue(got, 'no live event arrived')
        data = json.loads(got[0].split('event: battle', 1)[1].split('data: ', 1)[1].split('\n', 1)[0])
        self.assertEqual((data['name'], data['boss'], data['won']), ('Samwell', 'vhagar', True))


if __name__ == '__main__':
    unittest.main(verbosity=2)
