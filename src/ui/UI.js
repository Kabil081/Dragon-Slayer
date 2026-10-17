import { ENEMIES } from '../data/enemies.js';
import { LEVELS } from '../data/levels.js';

// DOM menus layered over the canvas: title, campaign map, armory,
// controls, pause, victory and defeat, and the online screens (account,
// the live leaderboard). Buttons use data-action; forms use data-form.

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fmtTime = t => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
const num = n => Number(n || 0).toLocaleString('en-US');
const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

// "Vhagar", "Drogon and Viserion": the leaderboard's boss keys as names
const bossName = key => String(key).split('+').map(k => {
  const e = ENEMIES[k];
  return e ? e.name.split(',')[0] : k.charAt(0).toUpperCase() + k.slice(1).replace(/_/g, ' ');
}).join(' and ');

const ago = at => {
  const s = Math.max(0, Date.now() / 1000 - at);
  if (s < 45) return 'just now';
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  return new Date(at * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

const ICONS = {
  win: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.5 2.5h2v2L11 15l1.6 1.6-1.4 1.4-1.4-1.4-3.4 3.4a1.6 1.6 0 0 1-2.3-2.3l3.4-3.4-1.4-1.4 1.4-1.4L9 13z"/></svg>',
  fall: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c1 4.2 5.5 5.8 5.5 11a5.5 5.5 0 0 1-11 0c0-2.8 1.6-4.4 2.7-5.5.3 2.1 1.4 3.2 2.6 3.7C11.6 8.4 10.8 5.3 12 2z"/></svg>',
  clear: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 7.5l5 4.2L12 4l4.5 7.7 5-4.2L19.4 19H4.6z"/></svg>',
};

const BOARDS = {
  points: { tab: 'Points', note: 'Points are every gold coin and every point of experience won in battle.' },
  gold: { tab: 'Gold', note: 'Gold won in battle. Spending it in the armory never costs you a place.' },
  speed: { tab: 'Speed', note: 'The fastest clear of each level. All levels: the most levels cleared, then the lowest total of best times.' },
  wins: { tab: 'Win probability', note: 'How sure the board is that you win your next battle (the 95% lower bound of your win rate). '
          + 'It rises with every victory and needs many to reach the top: 1 win of 1 scores 21, 10 of 10 scores 72.' },
};

export class UI {
  constructor(game, root) {
    this.game = game;
    this.root = root;
    this.screen = null;
    this.back = 'title';
    root.addEventListener('click', e => {
      const b = e.target.closest('[data-action]');
      if (b && !b.disabled) this.act(b.dataset.action, b.dataset.id);
    });
    root.addEventListener('submit', e => {
      e.preventDefault();
      this.submit(e.target);
    });
    this.lb = { board: 'points', level: 0, prev: null, timer: null };
    window.addEventListener('keydown', e => {
      if (!this.screen || this.game.mode === 'playing') return;
      if (e.code === 'Enter' && e.target.closest && e.target.closest('form')) return;   // the form submits itself
      if (e.code === 'Enter') {
        const p = this.root.querySelector('[data-primary]');
        if (p) { e.preventDefault(); p.click(); }
      }
    });
  }

  render(name, html, cls = '') {
    this.screen = name;
    this.root.className = 'ui on ' + cls;
    this.root.innerHTML = `<div class="screen ${name}">${html}</div>`;
    const p = this.root.querySelector('[data-primary]');
    if (p) p.focus({ preventScroll: true });
    this.fillOnlineLine();
  }

  hideAll() {
    this.screen = null;
    this.root.className = 'ui';
    this.root.innerHTML = '';
  }

  toast(msg) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    this.root.appendChild(t);
    setTimeout(() => t.remove(), 1800);
  }

  // Escape in menus
  escape() {
    if (this.screen === 'confirm') return this.showTitle();
    if (this.screen === 'ironbank') return this.showArmory();
    if (this.screen === 'leaderboard' || this.screen === 'account') return this.act('back');
    if (['campaign', 'armory', 'controls'].includes(this.screen)) return this.act('back');
  }

  act(action, id) {
    const g = this.game;
    switch (action) {
      case 'campaign': return this.showCampaign();
      case 'armory': return this.showArmory();
      case 'controls': return this.showControls();
      case 'title': return this.showTitle();
      case 'back':
        if (this.back === 'pause') return this.showPause();
        return this.back === 'campaign' ? this.showCampaign() : this.showTitle();
      case 'newgame': return this.showConfirm();
      case 'confirm-new': g.progression.newGame(); return this.showCampaign();
      case 'play': return g.startLevel(Number(id));
      case 'replay-start': return g.replayFromStart(Number(id));
      case 'mute': return g.toggleMute();
      case 'resume': return g.resume();
      case 'restart': return g.restart();
      case 'quit': return g.quitToMenu();
      case 'pause-controls': this.back = 'pause'; return this.showControls(true);
      case 'buy-weapon': return this.result(g.shop.buyWeapon(id), 'Purchased');
      case 'equip': return this.result(g.shop.equip(id), 'Equipped');
      case 'buy-upgrade': return this.result(g.shop.buyUpgrade(id), 'Upgraded');
      case 'joke-pay': return this.showIronBank(id);
      case 'leaderboard': return this.showLeaderboard();
      case 'lb-board': this.lb.prev = null; return this.showLeaderboard(id, id === 'speed' ? this.lb.level : 0);
      case 'lb-level': this.lb.prev = null; return this.showLeaderboard('speed', Number(id));
      case 'account': return this.showAccount();
      case 'account-mode': return this.showAccount(id);
      case 'signout': return this.signOut();
      case 'delete-ask': return this.showAccount('delete');
      case 'joke-close': return this.showArmory();
    }
  }

  result(res, okMsg) {
    this.showArmory();
    this.toast(res.ok ? okMsg : res.reason);
  }

  // ------------------------------------------------------------ screens
  showLoading(p = 0, msg = null) {
    this.render('loading', `
      <div class="center">
        <h1 class="logo small">DRAGONSLAYER<span>Rise of the North</span></h1>
        <div class="progress"><i style="width:${Math.round(p * 100)}%"></i></div>
        <p class="muted">${msg ? esc(msg) : `Forging assets… ${Math.round(p * 100)}%`}</p>
      </div>`, 'dark');
  }

  showError(title, items) {
    this.render('error', `
      <div class="panel">
        <h2>${esc(title)}</h2>
        <p>The game will not start until these are present. Nothing has been substituted.</p>
        <ul class="missing">${items.map(i => `<li><code>${esc(i)}</code></li>`).join('')}</ul>
        <p class="muted">Regenerate the art with <code>python tools/generate_assets.py</code>.</p>
      </div>`, 'dark');
  }

  // A level's art did not all arrive (a network hiccup, most likely). Nothing is substituted.
  showLoadFailed(id, name, missing) {
    this.render('error', `
      <div class="panel">
        <h2>${esc(name)} could not be loaded</h2>
        <p>${missing.length} of its files did not arrive. Check the connection and try again; nothing has been substituted.</p>
        <ul class="missing">${missing.slice(0, 40).map(i => `<li><code>${esc(i)}</code></li>`).join('')}</ul>
        <div class="row"><button data-action="play" data-id="${id}" data-primary>Try again</button>
          <button data-action="campaign" class="ghost">Campaign</button></div>
      </div>`, 'dark');
  }

  showTitle() {
    const g = this.game, d = g.progression.data;
    const has = g.progression.hasProgress;
    this.back = 'title';
    this.render('title', `
      <div class="title-wrap">
        <img class="sigil" src="assets/${g.assets.manifest.ui.sigil}" alt="House Stark">
        <h1 class="logo">DRAGONSLAYER<span>Rise of the North</span></h1>
        <p class="tagline">A warrior of House Stark</p>
        <nav class="menu">
          <button data-action="campaign" data-primary>${has ? 'Continue' : 'Begin the campaign'}</button>
          <button data-action="armory">Armory</button>
          <button data-action="leaderboard">Leaderboard</button>
          <button data-action="controls">Controls</button>
          ${has ? '<button data-action="newgame" class="ghost">New game</button>' : ''}
        </nav>
        ${has ? `<p class="foot">Level ${d.level} · ${d.gold} gold · ${d.stats.dragonsSlain} dragons slain</p>` : ''}
      </div>
      ${this.chip()}`, 'keyart');
  }

  // ------------------------------------------------------------ online
  // The corner button: who is signed in, their points and place.
  chip() {
    const o = this.game.online;
    if (!o || !o.available) return '<div class="account-chip"></div>';
    const p = o.player;
    let inner;
    if (!p) inner = '<span class="dot"></span>Sign in <span class="muted">· join the leaderboard</span>';
    else if (p.expired) inner = `<b>${esc(p.name)}</b> <span class="warn">· sign in again</span>`;
    else {
      const st = p.standing || {}, rank = st.ranks && st.ranks.points;
      inner = `<span class="dot on"></span><b>${esc(p.name)}</b> · ${num(st.points)} pts${rank ? ` · #${rank}` : ''}`;
    }
    return `<div class="account-chip"><button class="ghost chip" data-action="account">${inner}</button></div>`;
  }

  refreshChip() {
    const el = this.root.querySelector('.account-chip');
    if (el) el.outerHTML = this.chip();
  }

  // Called once after boot: live news, and keeping the screens current.
  watchOnline() {
    const o = this.game.online;
    if (!o) return;
    o.on((kind, data) => {
      if (kind === 'account' || kind === 'standing') {
        this.refreshChip();
        this.fillOnlineLine();
        if (this.screen === 'account' && kind === 'standing') this.showAccount();
      }
      if (kind === 'presence') {
        const el = this.root.querySelector('[data-online-count]');
        if (el) el.textContent = `${data} online`;
      }
      if (kind === 'battle') {
        if (this.screen === 'leaderboard') this.liveBattle(data);
        else if (!data.mine && this.game.mode !== 'playing' && this.screen) this.liveNote(data);
        if (data.mine) o.refreshMe();
      }
    });
  }

  battleText(b) {
    const who = `<b>${esc(b.name)}</b>`, boss = `<em>${esc(bossName(b.boss))}</em>`;
    if (!b.won) return `${who} fell to ${boss}`;
    if (b.clear) return `${who} slew ${boss} and cleared Level ${b.level} in ${fmtTime(b.time)}`;
    return `${who} slew ${boss}`;
  }

  battleItem(b, fresh = false) {
    const kind = !b.won ? 'fall' : b.clear ? 'clear' : 'win';
    return `<li class="${kind}${fresh ? ' fresh' : ''}">${ICONS[kind]}<div><p>${this.battleText(b)}</p>
      <span>Level ${b.level}${b.won && b.gold ? ` · +${num(b.gold)} gold` : ''} · <time data-at="${b.at}">${ago(b.at)}</time></span></div></li>`;
  }

  // Another player's battle, seen from a menu: a small card in the corner.
  liveNote(b) {
    let box = this.root.querySelector('.live-notes');
    if (!box) {
      box = document.createElement('ol');
      box.className = 'live-notes feed';
      this.root.appendChild(box);
    }
    box.insertAdjacentHTML('afterbegin', this.battleItem(b, true));
    const li = box.firstElementChild;
    setTimeout(() => li.classList.add('gone'), 5200);
    setTimeout(() => li.remove(), 5800);
    while (box.children.length > 3) box.lastElementChild.remove();
  }

  showLeaderboard(board = this.lb.board, level = this.lb.level) {
    const o = this.game.online;
    if (this.screen !== 'leaderboard') {
      this.back = this.screen === 'title' || this.screen === null ? 'title' : 'campaign';
      this.lb.prev = null;
    }
    this.lb.board = BOARDS[board] ? board : 'points';
    this.lb.level = this.lb.board === 'speed' ? level : 0;
    const tabs = Object.entries(BOARDS).map(([id, b]) =>
      `<button class="tab ${id === this.lb.board ? 'on' : ''}" data-action="lb-board" data-id="${id}">${b.tab}</button>`).join('');
    const chips = this.lb.board !== 'speed' ? '' : `<div class="lvchips">${[0, ...LEVELS.map(L => L.id)].map(id =>
      `<button class="ghost lv ${id === this.lb.level ? 'on' : ''}" data-action="lb-level" data-id="${id}">${id ? ROMAN[id] || id : 'All'}</button>`).join('')}</div>`;
    const off = !o || !o.available;
    const sign = o && o.available && !o.player
      ? '<button data-action="account" class="wide">Sign in to put your name on the board</button>' : '';
    this.render('leaderboard', `
      <header class="bar"><button data-action="back" class="ghost">‹ Back</button><h2>Hall of Champions</h2>
        ${off ? '' : `<span class="live"><i></i>LIVE · <span data-online-count>${o.online || 1} online</span></span>`}
        ${this.chip()}
      </header>
      <div class="lb-grid">
        <section class="col lb-main">
          <nav class="tabs">${tabs}</nav>
          ${chips}
          <p class="muted small lb-note">${BOARDS[this.lb.board].note}</p>
          <div class="lb-table" data-lb-table>${off ? this.offlineNote() : '<p class="muted lb-wait">Unrolling the scrolls…</p>'}</div>
          ${sign}
        </section>
        <aside class="col lb-side">
          <h3>Battles as they happen</h3>
          <ol class="feed" data-feed>${off ? '' : '<li class="muted small">Listening for steel…</li>'}</ol>
        </aside>
      </div>`, 'keyart dim');
    if (off) return;
    this.loadBoard();
    o.feed(14).then(list => {
      const el = this.root.querySelector('[data-feed]');
      if (el && this.screen === 'leaderboard') {
        el.innerHTML = list.length ? list.map(b => this.battleItem(b)).join('')
          : '<li class="muted small">No battles yet. Be the first to draw steel.</li>';
      }
    }).catch(() => {});
  }

  offlineNote() {
    return `<div class="offline"><h3>The leaderboard lives on the game's server</h3>
      <p>Start the game with <code>play.bat</code> (or <code>python tools/serve.py</code>) and open it from
      <code>http://localhost:8642</code>. Hosted online, everyone who opens the game's address shares one live board.</p></div>`;
  }

  async loadBoard() {
    const o = this.game.online, { board, level } = this.lb;
    let r;
    try {
      r = await o.leaderboard(board, level);
    } catch (e) {
      const el = this.root.querySelector('[data-lb-table]');
      if (el && this.screen === 'leaderboard') el.innerHTML = `<p class="muted lb-wait">${esc(e.message)}</p>`;
      return;
    }
    if (this.screen !== 'leaderboard' || this.lb.board !== board || this.lb.level !== level) return;
    const el = this.root.querySelector('[data-lb-table]');
    if (!el) return;
    const prev = this.lb.prev;
    this.lb.prev = new Map(r.rows.map(x => [x.name, x.rank]));
    const cnt = this.root.querySelector('[data-online-count]');
    if (cnt) cnt.textContent = `${Math.max(1, r.online)} online`;
    if (!r.rows.length) {
      el.innerHTML = `<p class="muted lb-wait">${board === 'speed' ? 'No one has cleared this yet.' : 'No champions yet.'}
        ${o.player ? 'Win a battle and your name is first.' : 'Sign in and win a battle to be first.'}</p>`;
      return;
    }
    const best = x => (level ? x.best[level] : x.totalTime);
    const cols = {
      points: [['Points', x => num(x.points), 'big'], ['Gold', x => num(x.gold)], ['Wins · falls', x => `${x.wins} · ${x.losses}`]],
      gold: [['Gold won', x => num(x.gold), 'big'], ['Gold held', x => num(x.held)], ['Points', x => num(x.points)]],
      speed: level
        ? [['Best time', x => fmtTime(best(x)), 'big'], ['Points', x => num(x.points)]]
        : [['Levels', x => `${x.cleared} / ${LEVELS.length}`], ['Total of best times', x => fmtTime(best(x)), 'big']],
      wins: [['Win probability', x => `${x.winScore.toFixed(1)}%`, 'big'], ['Wins · falls', x => `${x.wins} · ${x.losses}`],
             ['Win rate', x => `${Math.round(x.winRate)}%`]],
    }[board];
    const row = x => {
      const moved = prev && (!prev.has(x.name) ? 'new' : prev.get(x.name) > x.rank ? 'up' : '');
      const medal = x.rank <= 3 ? `<span class="medal m${x.rank}">${x.rank}</span>` : `<span class="rank">${x.rank}</span>`;
      return `<tr class="${x.me ? 'me' : ''} ${moved || ''}">
        <td class="r">${medal}</td>
        <td class="who"><b>${esc(x.name)}</b>${x.me ? '<span class="you">you</span>' : ''}<small>Warrior level ${x.level}</small></td>
        ${cols.map(c => `<td class="${c[2] || ''}">${c[1](x)}</td>`).join('')}</tr>`;
    };
    const mine = r.me && !r.rows.some(x => x.me) ? `<tbody class="mine"><tr class="gap"><td colspan="${cols.length + 2}">⋯</td></tr>${row(r.me)}</tbody>` : '';
    el.innerHTML = `<table class="lb">
      <thead><tr><th>#</th><th>Champion</th>${cols.map(c => `<th class="${c[2] || ''}">${c[0]}</th>`).join('')}</tr></thead>
      <tbody>${r.rows.map(row).join('')}</tbody>${mine}</table>
      <p class="muted small lb-count">${num(r.total)} on this board · ${num(r.players)} champions in all</p>`;
  }

  // A battle somewhere, while the board is open: the feed and the table move at once.
  liveBattle(b) {
    const el = this.root.querySelector('[data-feed]');
    if (el) {
      const empty = el.querySelector('.muted');
      if (empty) empty.remove();
      el.insertAdjacentHTML('afterbegin', this.battleItem(b, true));
      while (el.children.length > 14) el.lastElementChild.remove();
      for (const t of el.querySelectorAll('time[data-at]')) t.textContent = ago(Number(t.dataset.at));
    }
    clearTimeout(this.lb.timer);
    this.lb.timer = setTimeout(() => { if (this.screen === 'leaderboard') this.loadBoard(); }, 300);
  }

  showAccount(mode = null) {
    const o = this.game.online, g = this.game;
    if (this.screen !== 'account') this.back = this.screen === 'leaderboard' ? this.back : this.screen === 'title' || this.screen === null ? 'title' : 'campaign';
    if (!o || !o.available) {
      this.render('account', `<div class="panel narrow account">${this.offlineNote()}
        <button data-action="back" data-primary class="wide">Back</button></div>`, 'keyart dim');
      return;
    }
    const p = o.player;
    if (p && !p.expired && mode !== 'signin' && mode !== 'signup') {
      const st = p.standing || {}, rk = st.ranks || {};
      const place = b => (rk[b] ? `#${rk[b]}` : '—');
      const del = mode === 'delete' ? `
        <form data-form="delete" class="form danger-zone">
          <p>Delete <b>${esc(p.name)}</b> for good: the account, its cloud save and every battle on the board.
            The progress in this browser stays as a guest save.</p>
          <label>Password<input name="password" type="password" autocomplete="current-password" required maxlength="200"></label>
          <p class="form-error" data-error></p>
          <div class="row"><button class="danger" type="submit">Delete forever</button>
            <button type="button" class="ghost" data-action="account">Keep it</button></div>
        </form>` : '';
      this.render('account', `
        <div class="panel narrow account profile">
          <p class="seal">CHAMPION OF THE NORTH</p>
          <h2>${esc(p.name)}</h2>
          <p class="muted">Warrior level ${g.progression.data.level} · ${num(g.progression.data.gold)} gold · your progress is saved online</p>
          <div class="standing">
            <div><b>${num(st.points)}</b><span>points · ${place('points')}</span></div>
            <div><b>${num(st.gold)}</b><span>gold won · ${place('gold')}</span></div>
            <div><b>${st.cleared || 0}</b><span>levels cleared · ${place('speed')}</span></div>
            <div><b>${(st.winScore || 0).toFixed(1)}%</b><span>win probability · ${place('wins')}</span></div>
          </div>
          <p class="muted small">${st.wins || 0} wins · ${st.losses || 0} falls${st.of ? ` · ${num(st.of)} champions on the board` : ''}</p>
          <nav class="menu">
            <button data-action="leaderboard" data-primary>Leaderboard</button>
            <button data-action="signout">Sign out</button>
            <button data-action="back" class="ghost">Back</button>
          </nav>
          ${del || '<button class="linkish" data-action="delete-ask">Delete this account</button>'}
        </div>`, 'keyart dim');
      return;
    }
    const up = mode === 'signup' && o.signupOpen;
    const d = g.guestSaves.exists() ? g.guestSaves.load() : null;
    const carry = up && d && !o.player
      ? `<p class="muted small">The progress in this browser (warrior level ${d.level}, ${num(d.gold)} gold) becomes this champion's.</p>` : '';
    const name = p ? esc(p.name) : '';
    this.render('account', `
      <div class="panel narrow account">
        <p class="seal">THE HALL OF CHAMPIONS</p>
        <h2>${up ? 'Create a champion' : p && p.expired ? 'Sign in again' : 'Sign in'}</h2>
        <nav class="tabs">
          <button class="tab ${up ? '' : 'on'}" data-action="account-mode" data-id="signin">Sign in</button>
          ${o.signupOpen ? `<button class="tab ${up ? 'on' : ''}" data-action="account-mode" data-id="signup">Create account</button>` : ''}
        </nav>
        <form data-form="${up ? 'signup' : 'signin'}" class="form" autocomplete="on">
          <label>Name<input name="name" autocomplete="username" required minlength="3" maxlength="16"
            spellcheck="false" value="${name}" placeholder="3 to 16 letters or numbers"></label>
          <label>Password<input name="password" type="password" autocomplete="${up ? 'new-password' : 'current-password'}"
            required minlength="${up ? 8 : 1}" maxlength="200" ${up ? 'placeholder="at least 8 characters"' : ''}></label>
          ${up ? '<label>Password again<input name="again" type="password" autocomplete="new-password" required maxlength="200"></label>' : ''}
          ${carry}
          <p class="form-error" data-error></p>
          <button type="submit" class="wide">${up ? 'Create my champion' : 'Sign in'}</button>
        </form>
        <p class="muted small">Your battles go to the online leaderboard and your progress is kept on the server,
          so it follows you to any browser. You can play without an account.</p>
        <button data-action="back" class="ghost wide">Back</button>
      </div>`, 'keyart dim');
    const first = this.root.querySelector(name ? 'input[name=password]' : 'input[name=name]');
    if (first) first.focus({ preventScroll: true });
  }

  async submit(form) {
    const o = this.game.online, kind = form.dataset.form;
    if (!o || !kind) return;
    const f = new FormData(form), err = form.querySelector('[data-error]'), btn = form.querySelector('[type=submit]');
    const say = m => { if (err) err.textContent = m; };
    if (kind === 'signup' && f.get('password') !== f.get('again')) return say('The two passwords differ.');
    say('');
    btn.disabled = true;
    const label = btn.textContent;
    btn.textContent = '…';
    try {
      if (kind === 'signup') await o.signup(f.get('name'), f.get('password'));
      else if (kind === 'signin') await o.login(f.get('name'), f.get('password'));
      else if (kind === 'delete') {
        await o.deleteAccount(f.get('password'));
        this.showTitle();
        return this.toast('The account is gone');
      }
      const back = this.back;
      if (back === 'campaign') this.showCampaign(); else this.showTitle();
      this.toast(kind === 'signup' ? `Welcome, ${o.player.name}` : `Welcome back, ${o.player.name}`);
    } catch (e) {
      if (!form.isConnected) return;
      say(e.message);
      btn.disabled = false;
      btn.textContent = label;
    }
  }

  async signOut() {
    const o = this.game.online;
    await o.logout();
    this.showTitle();
    this.toast('Signed out: playing as a guest');
  }

  // The results screens: where the battle just fought put the player.
  onlineLine() {
    const o = this.game.online;
    if (!o || !o.available) return '';
    return '<p class="online-line" data-online-line></p>';
  }

  fillOnlineLine() {
    const el = this.root.querySelector('[data-online-line]'), o = this.game.online;
    if (!el || !o) return;
    const p = o.player;
    if (!p) {
      el.innerHTML = 'Sign in and your battles count on the online leaderboard. <button class="linkish" data-action="account">Sign in</button>';
      return;
    }
    if (p.expired) {
      el.innerHTML = 'Your sign-in ran out; this battle waits until you sign in again. <button class="linkish" data-action="account">Sign in</button>';
      return;
    }
    const st = p.standing || {}, rank = st.ranks && st.ranks.points;
    el.innerHTML = `Leaderboard: <b>${num(st.points)}</b> points${rank ? ` · <b>#${rank}</b> of ${num(st.of)}` : ''}
      <button class="linkish" data-action="leaderboard">View the board ›</button>`;
  }

  showConfirm() {
    this.render('confirm', `
      <div class="panel narrow">
        <h2>Start a new game?</h2>
        <p>This erases your level, gold, weapons and cleared levels.</p>
        <div class="row">
          <button data-action="title" data-primary>Keep my progress</button>
          <button data-action="confirm-new" class="danger">Erase and start over</button>
        </div>
      </div>`, 'keyart dim');
  }

  showCampaign() {
    const g = this.game;
    this.back = 'title';
    const cards = LEVELS.map(L => {
      const rec = g.progression.levelRecord(L.id);
      const unlocked = g.progression.isLevelUnlocked(L.id);
      let status, cls = '';
      if (L.status !== 'playable') { status = 'Coming soon'; cls = 'planned'; }
      else if (!unlocked) { status = `Clear level ${L.id - 1}`; cls = 'locked'; }
      else if (rec && rec.cleared) { status = `Cleared · best ${fmtTime(rec.bestTime)}${rec.noHit ? ' · flawless' : ''}`; cls = 'cleared'; }
      else status = 'Ready';
      const saga = L.stages && unlocked ? g.progression.sagaRecord(L.id) : null;
      const midway = saga && saga.cleared.length > 0;
      if (midway) status = `In progress · ${saga.cleared.length} of ${L.stages.length} fallen`;
      let btn = unlocked
        ? `<button data-action="play" data-id="${L.id}" ${L.id === this.firstPlayable() ? 'data-primary' : ''}>${midway ? 'Continue' : rec && rec.cleared ? 'Replay' : 'Enter'}</button>`
        : '';
      if (midway) btn = `<button data-action="replay-start" data-id="${L.id}" class="ghost">Restart</button>` + btn;
      return `<article class="level ${cls}">
        <span class="num">${String(L.id).padStart(2, '0')}</span>
        <h3>${esc(L.name)}</h3>
        <p>${esc(L.subtitle)}</p>
        <footer><span>${status}</span>${btn}</footer>
      </article>`;
    }).join('');
    this.render('campaign', `
      <header class="bar"><button data-action="title" class="ghost">‹ Back</button><h2>The Campaign</h2>
        <button data-action="leaderboard" class="ghost">Leaderboard</button>
        <button data-action="armory" class="ghost">Armory ›</button></header>
      <div class="levels">${cards}</div>`, 'keyart dim');
  }

  firstPlayable() {
    const g = this.game;
    const open = LEVELS.filter(L => g.progression.isLevelUnlocked(L.id));
    const fresh = open.find(L => !g.progression.isLevelCleared(L.id));
    return (fresh || open[open.length - 1] || LEVELS[0]).id;
  }

  showArmory() {
    const g = this.game, s = g.shop, st = g.progression.getStats(), xp = g.progression.xpInfo();
    if (this.screen !== 'armory' && this.screen !== null) this.back = this.screen === 'title' ? 'title' : 'campaign';
    const weapons = s.weapons().map(w => {
      const icon = g.assets.manifest.weapons[w.id].file;
      let btn;
      if (w.equipped) btn = '<button disabled class="ghost">Equipped</button>';
      else if (w.owned) btn = `<button data-action="equip" data-id="${w.id}">Equip</button>`;
      else if (!w.unlocked) btn = `<button disabled class="ghost">${esc(w.lockReason)}</button>`;
      else btn = `<button data-action="buy-weapon" data-id="${w.id}" ${w.affordable ? '' : 'disabled'}>Buy · ${w.price}g</button>`;
      // just for fun: a "$1" button that takes no money (there is no payment of any kind)
      if (w.def.joke && !w.owned) btn = `<div class="buy-col">${btn}<button data-action="joke-pay" data-id="${w.id}" class="ghost dollar">Buy · $1</button></div>`;
      const d = w.def;
      const label = { equipped: 'Equipped', purchased: 'Purchased', available: 'Available', locked: 'Locked' }[w.status];
      return `<article class="weapon ${w.equipped ? 'equipped' : ''} ${w.unlocked ? '' : 'locked'}">
        <img src="assets/${icon}" alt="">
        <div class="info">
          <h3>${esc(d.name)} <span class="badge ${w.status}">${label}</span></h3>
          <p class="muted">${esc(d.description)}</p>
          <p class="stats">Damage ${d.damage} · Speed ${d.speed} · Reach ${d.reach ?? 1}× · ${d.type}</p>
          <p class="special"><b>K · ${esc(d.special.name)}</b> — ${esc(d.special.description)} (${d.special.cooldown}s)</p>
        </div>
        ${btn}
      </article>`;
    }).join('');
    const ups = s.upgrades().map(u => `
      <div class="upgrade">
        <div><b>${esc(u.def.name)}</b><span class="muted">${esc(u.def.description)}</span></div>
        <div class="pips">${Array.from({ length: u.maxTier }, (_, i) => `<i class="${i < u.tier ? 'on' : ''}"></i>`).join('')}</div>
        ${u.maxed ? '<button disabled class="ghost">Max</button>'
                  : `<button data-action="buy-upgrade" data-id="${u.id}" ${u.affordable ? '' : 'disabled'}>${u.price}g</button>`}
      </div>`).join('');
    this.render('armory', `
      <header class="bar"><button data-action="back" class="ghost">‹ Back</button><h2>The Armory</h2>
        <span class="gold">${g.progression.data.gold} gold</span></header>
      <div class="armory-grid">
        <section class="col">
          <h3>Warrior</h3>
          <div class="statline"><span>Level</span><b>${xp.level}</b></div>
          <div class="xp"><i style="width:${xp.max ? 100 : Math.round((xp.xp / xp.next) * 100)}%"></i></div>
          <p class="muted small">${xp.max ? 'Max level' : `${xp.xp} / ${xp.next} XP`}</p>
          <div class="statline"><span>Health</span><b>${st.maxHp}</b></div>
          <div class="statline"><span>Attack power</span><b>${st.attack}</b></div>
          <div class="statline"><span>Fire resistance</span><b>${Math.round(st.fireRes * 100)}%</b></div>
          <h3>Upgrades</h3>
          ${ups}
          <button data-action="campaign" data-primary class="wide">To the campaign</button>
        </section>
        <section class="col wide-col"><h3>Weapons</h3><div class="weapons">${weapons}</div></section>
      </div>`, 'keyart dim');
  }

  // The "$1" joke: the Iron Bank refuses real coin. Nothing is charged, ever.
  showIronBank(id) {
    const s = this.game.shop, w = s.weapons().find(x => x.id === id);
    if (!w) return this.showArmory();
    this.showArmory();
    const how = w.owned ? 'It is already yours.'
      : !w.unlocked ? `${esc(w.lockReason)} and it is yours for ${w.price} gold.`
      : w.affordable ? `You have the gold. Pay ${w.price} and it is yours.`
      : `Earn ${w.price - s.gold} more gold slaying dragons, then pay ${w.price}.`;
    const pay = w.unlocked && !w.owned
      ? `<button data-action="buy-weapon" data-id="${w.id}" ${w.affordable ? 'data-primary' : 'disabled'}>Pay ${w.price} gold</button>` : '';
    const box = document.createElement('div');
    box.className = 'modal';
    box.innerHTML = `
      <div class="panel narrow ironbank">
        <p class="seal">THE IRON BANK OF BRAAVOS</p>
        <h2>One dollar? For ${esc(w.def.name)}?</h2>
        <p>The Iron Bank does not deal in the coin of other worlds. It counts only gold dragons, won with steel.</p>
        <p class="muted small">Just for fun: no real money is ever asked for or taken in this game.</p>
        <p class="how">${how}</p>
        <div class="row">${pay}<button data-action="joke-close" class="ghost" ${pay && w.affordable ? '' : 'data-primary'}>Back to the armory</button></div>
      </div>`;
    this.root.querySelector('.screen').appendChild(box);
    const p = box.querySelector('[data-primary]');
    if (p) p.focus({ preventScroll: true });
    this.screen = 'ironbank';
  }

  showControls(fromPause = false) {
    const rows = [['Move', 'A / D or ← →'], ['Jump', 'Space'], ['Attack', 'J (press again to chain)'],
                  ['Dodge roll', 'Shift — invulnerable mid-roll'], ['Weapon special', 'K'],
                  ['Fire a scorpion / take a weapon', 'E (stand next to it)'],
                  ['Switch carried weapon', 'Q, or 1 – 6'], ['Brace against wind', 'Hold S'],
                  ['Frostbrand: ice ward / Glacial Wave', 'S / hold K (Level 7)'],
                  ['Frostpiercer: deploy, aim, charge, fire', 'F · W / S · hold J, release (Level 7)'],
                  ['Duel: block / perfect parry', 'Hold S / press S as the blow lands'],
                  ['Skip dialogue / cinematic', 'Enter'], ['Sound on / off', 'M'], ['Pause', 'Escape']];
    this.render('controls', `
      <div class="panel narrow">
        <h2>Controls</h2>
        <table>${rows.map(r => `<tr><td>${r[0]}</td><td><kbd>${r[1]}</kbd></td></tr>`).join('')}</table>
        <p class="muted">Watch the dragon: a glint before a bite, a glowing chest and a burning floor before fire.
          Roll through the flames or put stone between you and the breath.</p>
        <button data-action="back" data-primary>Back</button>
      </div>`, fromPause ? 'dim' : 'keyart dim');
  }

  showPause() {
    this.back = 'pause';
    this.render('pause', `
      <div class="panel narrow">
        <h2>Paused</h2>
        <nav class="menu">
          <button data-action="resume" data-primary>Resume</button>
          <button data-action="restart">${this.game.levels.saga ? 'Restart encounter' : 'Restart level'}</button>
          <button data-action="pause-controls">Controls</button>
          <button data-action="mute">${this.game.audio && this.game.audio.muted ? 'Sound: off' : 'Sound: on'}</button>
          <button data-action="quit" class="ghost">Quit to campaign</button>
        </nav>
      </div>`, 'dim');
  }

  showVictory(r) {
    const W = this.game.assets.manifest.weapons;
    const lines = [
      `<li><span>Experience</span><b>+${r.xp} XP</b></li>`,
      `<li><span>Gold</span><b>+${r.gold}</b></li>`,
      r.first ? '<li class="hi"><span>First clear</span><b>full reward</b></li>'
              : '<li><span>Repeat clear</span><b>reduced reward</b></li>',
      r.noHit ? `<li class="hi"><span>Flawless (no damage)</span><b>+${r.noHitGold} gold</b></li>` : '',
      r.achievement ? `<li class="hi banner"><span>${esc(r.achievement.name)}</span><b>${esc(r.achievement.text)}</b></li>` : '',
      r.lifeDamage && r.lives > 1
        ? `<li><span>Damage dealt: first life / second life</span><b>${r.lifeDamage[0]} / ${r.lifeDamage[1]}</b></li>` : '',
      `<li><span>Time</span><b>${fmtTime(r.time)}</b></li>`,
      ...r.levelsGained.map(l => `<li class="hi"><span>Level up!</span><b>Level ${l}</b></li>`),
      ...r.newWeapons.map(id => `<li class="hi"><span>Now in the armory</span><b>${esc(W[id].name)}</b></li>`),
    ].join('');
    // Continue goes straight to the next level when it exists, else to the map.
    const nextOpen = r.nextLevel && this.game.progression.isLevelUnlocked(r.nextLevel.id);
    const next = nextOpen
      ? `<button data-action="play" data-id="${r.nextLevel.id}" data-primary>Continue</button>`
      : '<button data-action="quit" data-primary>Continue</button>';
    const nextLine = r.nextLevel
      ? `<p class="muted">Next: ${esc(r.nextLevel.name)}${nextOpen ? '' : ' — coming soon'}</p>` : '';
    this.render('victory', `
      <div class="panel narrow result">
        <h2 class="big">${r.lives > 1 ? 'Vhagar Is Slain' : 'Dragon Slain'}</h2>
        <ul class="rewards">${lines}</ul>
        ${nextLine}
        ${this.onlineLine()}
        <nav class="menu">
          ${next}
          <button data-action="armory">Armory</button>
          <button data-action="restart">Replay</button>
          ${nextOpen ? '<button data-action="quit" class="ghost">Campaign</button>' : ''}
        </nav>
      </div>`, 'dim');
  }

  // Level 7 complete: shown over the title of the ending.
  showSagaComplete(r) {
    const W = this.game.assets.manifest.weapons;
    const names = { sunfyre: 'Sunfyre, the Golden Terror', vermithor: 'Vermithor, the Bronze Fury',
                    balerion: 'Balerion, the Black Dread', aegon: 'Aegon Targaryen, the Conqueror' };
    const weaponName = id => id === 'frostpiercer' ? 'Frostpiercer' : (W[id] ? W[id].name : id);
    const lines = [
      '<li class="hi"><span>Level 7</span><b>completed</b></li>',
      `<li><span>All four bosses defeated</span><b>${r.bosses.map(b => esc(names[b] || b)).join('<br>')}</b></li>`,
      `<li><span>Gold earned</span><b>+${r.runGold}</b></li>`,
      `<li><span>Experience earned</span><b>+${r.runXp} XP</b></li>`,
      `<li><span>Weapons used</span><b>${r.weapons.length ? r.weapons.map(w => esc(weaponName(w))).join(', ') : '—'}</b></li>`,
      `<li><span>Time taken</span><b>${fmtTime(r.runTime)}</b></li>`,
      `<li><span>Deaths</span><b>${r.deaths}</b></li>`,
      r.first ? '<li class="hi"><span>First clear</span><b>full reward</b></li>' : '<li><span>Repeat clear</span><b>reduced reward</b></li>',
      r.achievement ? `<li class="hi banner"><span>${esc(r.achievement.name)}</span><b>${esc(r.achievement.text)}</b></li>` : '',
      ...r.levelsGained.map(l => `<li class="hi"><span>Level up!</span><b>Level ${l}</b></li>`),
      ...r.newWeapons.map(id => `<li class="hi"><span>Now in the armory</span><b>${esc(W[id].name)}</b></li>`),
    ].join('');
    this.render('victory', `
      <div class="panel narrow result saga">
        <h2 class="big">The North Remembers</h2>
        <p class="muted">The King in the North</p>
        <ul class="rewards">${lines}</ul>
        ${this.onlineLine()}
        <nav class="menu">
          <button data-action="quit" data-primary>Continue the campaign</button>
          <button data-action="replay-start" data-id="${r.levelId || 7}">Replay Level 7</button>
          <button data-action="armory" class="ghost">Armory</button>
        </nav>
      </div>`, 'dim');
  }

  showDefeat(saga = null) {
    const where = saga ? `<p class="muted">You will rise again before ${esc(saga.stage.id === 'aegon' ? 'Aegon' :
      saga.stage.id.charAt(0).toUpperCase() + saga.stage.id.slice(1))}. The fallen stay fallen.</p>` : '';
    this.render('defeat', `
      <div class="panel narrow result">
        <h2 class="big red">You Have Fallen</h2>
        <p class="muted">The fire takes another. Rise again.</p>
        ${where}
        ${this.onlineLine()}
        <nav class="menu">
          <button data-action="restart" data-primary>Try again</button>
          <button data-action="armory">Armory</button>
          <button data-action="quit" class="ghost">Campaign</button>
        </nav>
      </div>`, 'dim');
  }
}
