"""The game's server: serves the game and the online API (accounts, cloud
saves, battles, the live leaderboard). Settings come from .env (see
.env.example) or, on a host, from its environment variables.

Browsers keep the game's files but ask on every visit whether they changed
(Last-Modified), so an update is seen at once and nothing is downloaded
twice. Code and data files are sent gzipped.

    python tools/serve.py [port]

Only the game's own files are served (index.html, src/, assets/, styles/);
never .env, the database, tools/ or anything else in the folder. Your own
film clips (assets/media/) are served to this PC only.
"""
import email.utils
import functools
import gzip
import http.cookies
import http.server
import json
import mimetypes
import os
import signal
import sys
import urllib.parse

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from gameserver.config import ROOT, Settings          # noqa: E402
from gameserver.db import Database, DatabaseError     # noqa: E402
from gameserver.live import LiveHub                   # noqa: E402
from gameserver.service import COOKIE, ApiError, Service   # noqa: E402

PUBLIC = {'', 'index.html', 'asset_preview.html', 'src', 'assets', 'styles', 'favicon.ico'}
MAX_BODY = 256 * 1024
LOCAL = ('127.0.0.1', '::1', '::ffff:127.0.0.1')
GZIP = ('.js', '.css', '.json', '.html', '.txt', '.svg', '.md')
GZIP_CACHE = {}                 # path -> (mtime_ns, size, gzipped bytes)
# what the page may load: its own files, Google Fonts; the import map and boot script are inline
CSP = ("default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
       "font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; media-src 'self' blob:; connect-src 'self'; "
       "object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'")
mimetypes.add_type('text/javascript', '.js')
mimetypes.add_type('application/json', '.json')


class Handler(http.server.SimpleHTTPRequestHandler):
    server_version = 'Dragonslayer'
    sys_version = ''
    service = None          # set by make_server
    settings = None
    cache = 'no-cache'      # the game's files: kept, but checked on every visit; the API: no-store

    # ------------------------------------------------------------ plumbing
    def end_headers(self):
        self.send_header('Cache-Control', self.cache)
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('Referrer-Policy', 'same-origin')
        self.send_header('X-Frame-Options', 'SAMEORIGIN')
        self.send_header('Content-Security-Policy', CSP)
        self.send_header('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()')
        if self.is_https():
            self.send_header('Strict-Transport-Security', 'max-age=31536000')
        super().end_headers()

    def log_message(self, fmt, *args):
        if self.path.startswith('/api/live'):
            return
        super().log_message(fmt, *args)

    def log_request(self, code='-', size='-'):
        # quiet: only failures and API calls (a level loads hundreds of images)
        if self.settings.log == 'quiet' and not self.path.startswith('/api/'):
            try:
                if int(code) < 400:
                    return
            except (TypeError, ValueError):
                pass
        super().log_request(code, size)

    def client_ip(self):
        if self.settings.trust_proxy:
            fwd = self.headers.get('X-Forwarded-For', '')
            if fwd:
                return fwd.split(',')[0].strip()
        return self.client_address[0]

    def from_this_pc(self):
        """A browser on this PC, not a visitor arriving through a proxy or tunnel on it."""
        forwarded = any(h in self.headers for h in ('X-Forwarded-For', 'Forwarded', 'Cf-Connecting-Ip', 'X-Real-Ip'))
        return self.client_address[0] in LOCAL and not forwarded

    def is_https(self):
        if not self.settings.trust_proxy:
            return False
        # one proxy or a chain of them (Cloudflare in front of Render): "https" or "https, https"
        proto = self.headers.get('X-Forwarded-Proto', '').lower().split(',')[0].strip()
        fwd = self.headers.get('Forwarded', '').lower()
        return proto == 'https' or 'proto=https' in fwd or '"scheme":"https"' in self.headers.get('Cf-Visitor', '').replace(' ', '')

    def route(self):
        return urllib.parse.urlsplit(self.path)

    # ------------------------------------------------------------ the game's files
    def allowed(self):
        path = urllib.parse.unquote(self.route().path)
        # lower case and without trailing dots or spaces: Windows treats "MEDIA." as "media"
        parts = [p.lower().rstrip('. ') for p in path.replace('\\', '/').split('/') if p]
        if any(p.startswith('.') or not p for p in parts):
            return False
        top = parts[0] if parts else ''
        if top not in PUBLIC:
            return False
        if parts[:2] == ['assets', 'media'] and not self.from_this_pc():
            return False           # the player's own clips never leave this PC
        return True

    def do_GET(self):
        if self.route().path.startswith('/api/'):
            return self.api('GET')
        if not self.allowed():
            return self.send_error(404)
        if self.send_gzipped():
            return
        return super().do_GET()

    def do_HEAD(self):
        if self.route().path.startswith('/api/') or not self.allowed():
            return self.send_error(404)
        if self.send_gzipped(head=True):
            return
        return super().do_HEAD()

    def send_gzipped(self, head=False):
        """Code and data files, gzipped for browsers that accept it (with the
        same Last-Modified check as every other file). False = not handled."""
        if 'gzip' not in self.headers.get('Accept-Encoding', ''):
            return False
        path = self.translate_path(self.path)
        if os.path.isdir(path):
            path = os.path.join(path, 'index.html')
        if not path.lower().endswith(GZIP) or not os.path.isfile(path):
            return False
        st = os.stat(path)
        if st.st_size > 8 * 1024 * 1024:
            return False
        since = self.headers.get('If-Modified-Since')
        if since and 'If-None-Match' not in self.headers:
            try:
                if int(st.st_mtime) <= email.utils.parsedate_to_datetime(since).timestamp():
                    self.send_response(304)
                    self.send_header('Last-Modified', self.date_time_string(st.st_mtime))
                    self.send_header('Vary', 'Accept-Encoding')
                    self.end_headers()
                    return True
            except (TypeError, ValueError, IndexError, OverflowError):
                pass
        hit = GZIP_CACHE.get(path)
        if not hit or hit[0] != st.st_mtime_ns or hit[1] != st.st_size:
            with open(path, 'rb') as f:
                hit = (st.st_mtime_ns, st.st_size, gzip.compress(f.read(), 6))
            GZIP_CACHE[path] = hit
        body = hit[2]
        self.send_response(200)
        self.send_header('Content-Type', self.guess_type(path))
        self.send_header('Content-Encoding', 'gzip')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Last-Modified', self.date_time_string(st.st_mtime))
        self.send_header('Vary', 'Accept-Encoding')
        self.end_headers()
        if not head:
            self.wfile.write(body)
        return True

    def list_directory(self, path):
        self.send_error(404)
        return None

    def do_POST(self):
        self.api('POST')

    def do_PUT(self):
        self.api('PUT')

    def do_DELETE(self):
        self.api('DELETE')

    # ------------------------------------------------------------ the API
    def send_json(self, status, data, cookie=None):
        body = json.dumps(data, separators=(',', ':')).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        if cookie is not None:
            self.send_header('Set-Cookie', cookie)
        self.end_headers()
        self.wfile.write(body)

    def session_cookie(self, token):
        secure = self.settings.cookie_secure == '1' or (self.settings.cookie_secure == 'auto' and self.is_https())
        age = int(self.settings.session_days * 86400) if token else 0
        c = f'{COOKIE}={token or ""}; Path=/; Max-Age={age}; HttpOnly; SameSite=Strict'
        return c + ('; Secure' if secure else '')

    def token(self):
        raw = self.headers.get('Cookie')
        if not raw:
            return None
        try:
            jar = http.cookies.SimpleCookie(raw)
        except http.cookies.CookieError:
            return None
        return jar[COOKIE].value if COOKIE in jar else None

    def body(self):
        try:
            n = int(self.headers.get('Content-Length') or 0)
        except ValueError:
            raise ApiError(400, 'Bad length.')
        if n > MAX_BODY:
            raise ApiError(413, 'Too large.')
        if not n:
            return {}
        try:
            data = json.loads(self.rfile.read(n).decode('utf-8'))
        except (ValueError, UnicodeDecodeError):
            raise ApiError(400, 'Bad JSON.')
        if not isinstance(data, dict):
            raise ApiError(400, 'Send a JSON object.')
        return data

    def same_origin(self):
        """Changes need a JSON body (a plain form on another site cannot send one)
        and, when the browser names the page that sent them, this site's own."""
        if not self.headers.get('Content-Type', '').lower().startswith('application/json'):
            return False
        origin = self.headers.get('Origin')
        if origin and origin != 'null':
            return urllib.parse.urlsplit(origin).netloc == self.headers.get('Host', '')
        return True

    def api(self, method):
        svc = self.service
        url = self.route()
        path, q = url.path.rstrip('/'), urllib.parse.parse_qs(url.query)
        arg = lambda k, d='': (q.get(k) or [d])[0]
        self.cache = 'no-store'
        try:
            if method != 'GET' and not self.same_origin():
                raise ApiError(403, 'Refused: not from this game.')
            if path == '/api/live' and method == 'GET':
                return self.live()
            token = self.token()
            pid = svc.pid_for(token)                    # from memory after the first look-up

            def need():
                if not pid:
                    raise ApiError(401, 'Sign in first.')
                return pid
            if path == '/api/health' and method == 'GET':
                return self.send_json(200, svc.health(deep=arg('deep') == '1'))
            if path == '/api/me' and method == 'GET':
                me = svc.player(pid, full=arg('full') == '1') if pid else None
                return self.send_json(200, {'player': me, 'signup': self.settings.allow_signup})
            if path == '/api/signup' and method == 'POST':
                b = self.body()
                player, tok = svc.signup(b.get('name'), b.get('password'), self.client_ip())
                return self.send_json(200, {'player': player}, self.session_cookie(tok))
            if path == '/api/login' and method == 'POST':
                b = self.body()
                player, tok = svc.login(b.get('name'), b.get('password'), self.client_ip())
                return self.send_json(200, {'player': player}, self.session_cookie(tok))
            if path == '/api/logout' and method == 'POST':
                svc.logout(token)
                return self.send_json(200, {'ok': True}, self.session_cookie(None))
            if path == '/api/account' and method == 'DELETE':
                svc.delete_account(need(), self.body().get('password'))
                svc.logout(token)
                return self.send_json(200, {'ok': True}, self.session_cookie(None))
            if path == '/api/save' and method == 'GET':
                return self.send_json(200, svc.get_save(need()) or {'save': None})
            if path == '/api/save' and method == 'PUT':
                b = self.body()
                return self.send_json(200, svc.put_save(need(), b.get('save'), b.get('savedAt')))
            if path == '/api/battle' and method == 'POST':
                return self.send_json(200, svc.record_battle(need(), self.body()))
            if path == '/api/leaderboard' and method == 'GET':
                return self.send_json(200, svc.leaderboard(arg('board', 'points'), arg('level', '0'), pid))
            if path == '/api/feed' and method == 'GET':
                return self.send_json(200, {'feed': svc.feed(arg('limit', '20'))})
            raise ApiError(404, 'No such call.')
        except ApiError as e:
            self.send_json(e.status, {'error': e.message})
        except (BrokenPipeError, ConnectionResetError):
            pass
        except Exception as e:                       # never leak details to the browser
            self.log_error('API error on %s: %r', path, e)
            try:
                self.send_json(500, {'error': 'The server stumbled. Try again.'})
            except OSError:
                pass

    def live(self):
        """Server-Sent Events: battles and the count of players online, as they happen."""
        hub = self.service.live
        if not hub.join():
            return self.send_json(503, {'error': 'Too many watchers; the board refreshes without live updates.'})
        try:
            self.send_response(200)
            self.send_header('Content-Type', 'text/event-stream')
            self.send_header('X-Accel-Buffering', 'no')
            self.end_headers()
            last = hub.seq
            try:
                last = min(last, int(self.headers.get('Last-Event-ID', last)))
            except ValueError:
                pass
            self.wfile.write(f'retry: 3000\nevent: hello\ndata: {json.dumps({"online": hub.clients})}\n\n'.encode())
            self.wfile.flush()
            while not hub.closed:
                events = hub.wait(last, 15)
                if not events:
                    self.wfile.write(b': ping\n\n')
                for seq, kind, data in events:
                    self.wfile.write(f'id: {seq}\nevent: {kind}\ndata: {data}\n\n'.encode())
                    last = seq
                self.wfile.flush()
        except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError, OSError):
            pass
        finally:
            hub.leave()
            self.close_connection = True


class Server(http.server.ThreadingHTTPServer):
    daemon_threads = True
    # on Windows "reuse" lets a second server share a port that is in use: refuse instead
    allow_reuse_address = os.name != 'nt'


def make_server(settings, port=None):
    """port None = the settings' port; 0 = any free port (the tests)."""
    db = Database(settings)
    live = LiveHub(settings.max_live)
    service = Service(settings, db, live)
    handler = type('GameHandler', (Handler,), {'service': service, 'settings': settings})
    try:
        server = Server((settings.host, settings.port if port is None else port),
                        functools.partial(handler, directory=ROOT))
    except OSError:
        db.close()
        raise
    server.service = service
    return server


def stop(*_):
    raise KeyboardInterrupt          # the host's SIGTERM: close cleanly, like Ctrl+C


if __name__ == '__main__':
    signal.signal(signal.SIGTERM, stop)
    settings = Settings()
    port = int(sys.argv[1]) if len(sys.argv) > 1 else settings.port
    try:
        server = make_server(settings, port)
    except DatabaseError as e:
        sys.exit(f'Database: {e}')
    except OSError as e:
        sys.exit(f'Could not open port {port} (is the game already running?): {e}')
    shown = 'localhost' if settings.host in ('127.0.0.1', 'localhost', '') else settings.host
    print(f'Dragonslayer running at http://{shown}:{port}/  (Ctrl+C to stop)', flush=True)
    print(f'  database: {settings.db_label}, accounts: {"open" if settings.allow_signup else "sign-in only"}', flush=True)
    if settings.host in ('127.0.0.1', 'localhost'):
        print('  only this PC can join; set DS_HOST=0.0.0.0 in .env to let others on your network play', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.service.live.close()
        server.server_close()
        server.service.db.close()
