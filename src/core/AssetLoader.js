// Loads assets/manifest.json and the images it references, in groups (a
// sprite set, a background, the weapons...). At boot only the shared art is
// loaded; groups marked `defer` (each level's dragons and scenery) load when
// that level is first played (loadGroups), so a visitor never has to download
// all of the art at once. Nothing is ever substituted: any file that fails to
// load is listed (`missing` at boot, the result of loadGroups later) and the
// game refuses to start, or to open that level, with a clear report.

const ROOT = 'assets/';

export class AssetLoader {
  constructor() {
    this.manifest = null;
    this.images = new Map();
    this.missing = [];
    this.groups = new Map();       // group -> [paths]
    this.inflight = new Map();     // path -> promise
  }

  // defer(group, manifest) -> true for groups that load later (see loadGroups)
  async load(onProgress = () => {}, { defer = () => false } = {}) {
    const res = await fetch(ROOT + 'manifest.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error('assets/manifest.json could not be loaded (HTTP ' + res.status + ')');
    this.manifest = await res.json();
    this.groups = this.collectGroups(this.manifest);
    const now = [...this.groups].filter(([g]) => !defer(g, this.manifest)).flatMap(([, paths]) => paths);
    this.missing.push(...await this.loadPaths([...new Set(now)], onProgress));
    return this;
  }

  collectGroups(m) {
    const groups = new Map();
    const add = (group, path) => {
      if (!groups.has(group)) groups.set(group, []);
      if (!groups.get(group).includes(path)) groups.get(group).push(path);
    };
    const need = (group, label, value) => {
      if (!value) this.missing.push(`${label} (not listed in manifest)`);
      else add(group, value);
    };
    if (!m.warrior) this.missing.push('warrior section of manifest');
    // Every sprite group (warrior, each dragon) has a sheet per animation;
    // the warrior also has one set per weapon variant.
    for (const [key, g] of Object.entries(m)) {
      if (!g || typeof g !== 'object' || !g.sheet_pattern || !g.animations) continue;
      for (const v of g.variants || [null]) {
        for (const [anim, a] of Object.entries(g.animations)) {
          if (v && a.variants && !a.variants.includes(v)) continue;   // weapon-style animations
          let path = g.sheet_pattern.replace('{anim}', anim);
          if (v) path = path.replace('{variant}', v);
          need(key, `${key} ${v ? v + ' ' : ''}${anim}`, path);
        }
      }
    }
    for (const [id, wpn] of Object.entries(m.weapons || {})) need('weapons', `weapon ${id}`, wpn.file);
    for (const [bgId, bg] of Object.entries(m.backgrounds || {})) {
      const g = 'bg:' + bgId;
      for (const layer of bg.layers) need(g, `${bgId} layer ${layer.id}`, layer.file);
      for (const [pid, prop] of Object.entries(bg.props || {})) {
        need(g, `${bgId} prop ${pid}`, prop.file);
        for (const [st, file] of Object.entries(prop.states || {})) need(g, `${bgId} prop ${pid} ${st}`, file);
      }
      if (bg.ending_panorama) need(g, `${bgId} ending panorama`, bg.ending_panorama.file);
    }
    if (m.concept && m.concept.keyart) add('concept', m.concept.keyart);
    if (m.aemond) need('aemond', 'aemond sheet', m.aemond.sheet);
    for (const [oid, obj] of Object.entries(m.objects || {})) {
      for (const [k, v] of Object.entries(obj)) if (typeof v === 'string' && v.endsWith('.png')) need('objects', `${oid} ${k}`, v);
    }
    if (!m.ui || !m.ui.sigil) this.missing.push('ui.sigil (House Stark sigil)');
    else need('ui', 'ui sigil', m.ui.sigil);
    return groups;
  }

  // The groups of `list` that still have images to load.
  pending(list) {
    return list.filter(g => (this.groups.get(g) || []).some(p => !this.images.has(p)));
  }

  // Loads whole groups; resolves to the paths that could not be loaded (none = ready).
  // A prefetch uses fewer connections so it never crowds out a level being opened.
  async loadGroups(list, onProgress = () => {}, { workers = 16 } = {}) {
    const unknown = list.filter(g => !this.groups.has(g)).map(g => `${g} (not in the manifest)`);
    const paths = [...new Set(list.flatMap(g => this.groups.get(g) || []))].filter(p => !this.images.has(p));
    return [...unknown, ...await this.loadPaths(paths, onProgress, workers)];
  }

  async loadPaths(paths, onProgress = () => {}, workers = 16) {
    const failed = [];
    let done = 0, next = 0;
    if (!paths.length) onProgress(1);
    // a bounded pool: hundreds of parallel requests can drop some on a busy machine
    const worker = async () => {
      while (next < paths.length) {
        const p = paths[next++];
        if (!await this.loadImage(p)) failed.push(p);
        onProgress(++done / paths.length);
      }
    };
    await Promise.all(Array.from({ length: Math.min(workers, paths.length) }, worker));
    return failed;
  }

  // A file that fails is retried twice before it is reported. Resolves to true when loaded.
  loadImage(path) {
    if (this.images.has(path)) return Promise.resolve(true);
    if (this.inflight.has(path)) return this.inflight.get(path);
    const attempt = tries => new Promise(resolve => {
      const img = new Image();
      img.onload = () => { this.images.set(path, img); resolve(true); };
      img.onerror = () => {
        if (tries > 1) setTimeout(() => attempt(tries - 1).then(resolve), 300);
        else resolve(false);
      };
      img.src = ROOT + path + (tries < 3 ? `?retry=${tries}` : '');
    });
    const pr = attempt(3).finally(() => this.inflight.delete(path));
    this.inflight.set(path, pr);
    return pr;
  }

  image(path) {
    return this.images.get(path) || null;
  }
}
