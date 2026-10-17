"""Live updates for everyone watching the leaderboard (Server-Sent Events):
each recorded battle is pushed to every open game at once, and the count of
players online goes with it."""
import collections
import json
import threading


class LiveHub:
    def __init__(self, max_clients=200, keep=200):
        self.cond = threading.Condition()
        self.events = collections.deque(maxlen=keep)     # (seq, kind, json text)
        self.seq = 0
        self.clients = 0
        self.max_clients = max_clients
        self.closed = False

    def publish(self, kind, data):
        with self.cond:
            self.seq += 1
            self.events.append((self.seq, kind, json.dumps(data, separators=(',', ':'))))
            self.cond.notify_all()
            return self.seq

    def join(self):
        """A watcher arrives; False when the server is full."""
        with self.cond:
            if self.clients >= self.max_clients:
                return False
            self.clients += 1
        self.publish('presence', {'online': self.clients})
        return True

    def leave(self):
        with self.cond:
            self.clients = max(0, self.clients - 1)
        self.publish('presence', {'online': self.clients})

    def wait(self, after, timeout):
        """Events newer than `after` (waits up to `timeout` s for one)."""
        with self.cond:
            if self.seq <= after and not self.closed:
                self.cond.wait(timeout)
            return [e for e in self.events if e[0] > after]

    def close(self):
        with self.cond:
            self.closed = True
            self.cond.notify_all()
