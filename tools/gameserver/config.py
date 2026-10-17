"""Server settings, read from the .env file in the project folder. A real
environment variable of the same name wins (that is how hosting services
pass settings). Every value has a safe default, so the game runs with no
.env at all. See .env.example for what each one does."""
import os

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))


def read_env_file(path):
    """KEY=value lines; # comments, blank lines, `export ` and quotes allowed."""
    values = {}
    if not path or not os.path.isfile(path):
        return values
    with open(path, encoding='utf-8-sig') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            if line.startswith('export '):
                line = line[7:].lstrip()
            key, sep, val = line.partition('=')
            if not sep:
                continue
            key, val = key.strip(), val.strip()
            if len(val) >= 2 and val[0] == val[-1] and val[0] in '"\'':
                val = val[1:-1]
            elif ' #' in val:
                val = val.split(' #', 1)[0].rstrip()
            values[key] = val
    return values


class Settings:
    def __init__(self, env_file=None, overrides=None):
        self.env_file = env_file if env_file is not None else os.path.join(ROOT, '.env')
        file = read_env_file(self.env_file)
        over = overrides or {}

        def get(key, default=''):
            if key in over:
                return str(over[key])
            if key in os.environ:              # set by the host, even if empty
                return os.environ[key]
            return file.get(key, default)

        def flag(key, default):
            return get(key, default).strip().lower() in ('1', 'true', 'yes', 'on')

        # on a hosting service (it sets PORT) the defaults suit it: listen on every address, behind its proxy
        hosted = bool(os.environ.get('PORT'))
        self.host = get('DS_HOST', '0.0.0.0' if hosted else '127.0.0.1')
        self.port = int(get('PORT', '') or get('DS_PORT', '8642'))    # hosting services set PORT
        self.database_url = get('DATABASE_URL', '').strip()
        db_path = get('DS_DB_PATH', 'data/dragonslayer.sqlite3')
        self.db_path = db_path if os.path.isabs(db_path) else os.path.join(ROOT, db_path)
        self.session_days = max(1.0, float(get('DS_SESSION_DAYS', '30')))
        self.cookie_secure = get('DS_COOKIE_SECURE', 'auto').strip().lower()   # auto | 1 | 0
        self.trust_proxy = flag('DS_TRUST_PROXY', '1' if hosted else '0')
        # the host always serves the site over https (Render does, and says so with RENDER=true)
        self.https = flag('DS_HTTPS', '1' if os.environ.get('RENDER') else '0')
        self.allow_signup = flag('DS_ALLOW_SIGNUP', '1')
        self.max_live = int(get('DS_MAX_LIVE', '200'))
        self.log = get('DS_LOG', 'quiet' if hosted else 'all').strip().lower()   # all | quiet (errors and API calls)

    @property
    def db_label(self):
        if self.database_url:
            # never print the password part of the URL
            tail = self.database_url.split('@', 1)[-1]
            return f'Postgres ({tail.split("?", 1)[0]})'
        try:
            shown = os.path.relpath(self.db_path, ROOT)
        except ValueError:                      # another drive
            shown = self.db_path
        return f'SQLite ({shown})'
