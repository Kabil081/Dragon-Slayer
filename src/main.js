import { AssetLoader } from './core/AssetLoader.js';
import { Game } from './core/Game.js';
import { deferredArt } from './game/LevelManager.js';
import { UI } from './ui/UI.js';

const canvas = document.getElementById('game');
const uiRoot = document.getElementById('ui');

async function boot() {
  // A throwaway UI for loading/errors before the game exists.
  const shell = new UI({ mode: 'menu', progression: null }, uiRoot);
  shell.showLoading(0);
  const loader = new AssetLoader();
  const q = new URLSearchParams(location.search);
  // the shared art now; each level's dragons and scenery when it is first played.
  // The smoke test and the lab start levels instantly, so they load everything.
  let later = null;
  const defer = q.has('smoke') || q.has('lab') ? () => false : (g, m) => (later = later || new Set(deferredArt(m))).has(g);
  try {
    await loader.load(p => shell.showLoading(p), { defer });
  } catch (e) {
    shell.showError('Assets could not be loaded', [e.message]);
    return;
  }
  if (loader.missing.length) {
    console.error('Missing assets:', loader.missing);
    shell.showError(`${loader.missing.length} asset(s) are missing`, loader.missing);
    return;
  }
  shell.screen = null;
  uiRoot.replaceWith(uiRoot.cloneNode(false)); // drop the shell's listeners
  const smoke = q.has('smoke');
  // ?lab: a scratch save slot and a loop driven from the console (for checking scenes)
  const opts = smoke ? { saveKey: 'dragonslayer.smoke-test', manualLoop: true, silent: true, offline: true }
    : q.has('lab') ? { saveKey: 'dragonslayer.lab', manualLoop: true, offline: true } : {};
  const game = new Game(canvas, document.getElementById('ui'), loader, opts);
  window.DS = game; // handy for debugging from the console
  if (smoke) {
    const { runSmokeTests, showResults } = await import('./debug/SmokeTest.js');
    showResults(await runSmokeTests(game));
    game.render();
    return;
  }
  // who is signed in (a short wait at most), then the title
  game.ui.showLoading(1, 'Calling the banners…');
  await Promise.race([game.online.init(), new Promise(r => setTimeout(r, 2500))]);
  game.ui.showTitle();
  game.ui.watchOnline();
  game.prefetch(game.ui.firstPlayable());
}

boot();
