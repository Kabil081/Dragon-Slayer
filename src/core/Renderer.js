// Canvas setup and drawing helpers. The game is authored at a fixed
// 1920x1080 logical resolution and letterboxed to fit any window.

export class Renderer {
  constructor(canvas, viewW, viewH) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.viewW = viewW;
    this.viewH = viewH;
    this.scale = 1;
    this.offX = 0;
    this.offY = 0;
    this.tint = document.createElement('canvas');
    this.tctx = this.tint.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth, h = window.innerHeight;
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
    this.scale = Math.min(this.canvas.width / this.viewW, this.canvas.height / this.viewH);
    this.offX = (this.canvas.width - this.viewW * this.scale) / 2;
    this.offY = (this.canvas.height - this.viewH * this.scale) / 2;
  }

  begin() {
    const ctx = this.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#05070b';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.setTransform(this.scale, 0, 0, this.scale, this.offX, this.offY);
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, this.viewW, this.viewH);
    ctx.clip();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
  }

  end() {
    this.ctx.restore();
  }

  // Tiled horizontal parallax layer in screen space.
  drawLayer(img, parallax, camX, shakeX = 0, shakeY = 0) {
    if (!img) return;
    const w = img.width;
    let off = -((camX * parallax) % w);
    if (off > 0) off -= w;
    const sx = shakeX * Math.min(1, parallax * 1.5);
    const sy = shakeY * Math.min(1, parallax * 1.5);
    for (let x = off; x < this.viewW; x += w) {
      this.ctx.drawImage(img, Math.round(x + sx), Math.round(sy));
    }
  }

  // Draw one frame from a single-row sprite sheet so that `pivot` lands on
  // (x, y). `flip` mirrors around the pivot.
  drawFrame(img, index, fw, fh, x, y, pivot, scale, flip, opts = {}) {
    if (!img) return;
    const ctx = this.ctx;
    ctx.save();
    if (opts.alpha !== undefined) ctx.globalAlpha = opts.alpha;
    ctx.translate(x, y);
    ctx.scale(flip ? -scale : scale, scale);
    if (opts.aura && opts.auraAlpha > 0) {
      // the silhouette in a solid colour, smeared outward = a glowing rim
      const t = this.tint;
      if (t.width !== fw || t.height !== fh) { t.width = fw; t.height = fh; }
      const c = this.tctx;
      c.globalCompositeOperation = 'source-over';
      c.clearRect(0, 0, fw, fh);
      c.drawImage(img, index * fw, 0, fw, fh, 0, 0, fw, fh);
      c.globalCompositeOperation = 'source-in';
      c.fillStyle = opts.aura;
      c.fillRect(0, 0, fw, fh);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = opts.auraAlpha;
      for (const [ox, oy] of [[-7, 0], [7, 0], [0, -7], [0, 7]]) ctx.drawImage(t, -pivot[0] + ox, -pivot[1] + oy);
      ctx.restore();
    }
    if (opts.flash > 0 || opts.tint) {
      const t = this.tint;
      if (t.width !== fw || t.height !== fh) { t.width = fw; t.height = fh; }
      const c = this.tctx;
      c.globalCompositeOperation = 'source-over';
      c.clearRect(0, 0, fw, fh);
      c.drawImage(img, index * fw, 0, fw, fh, 0, 0, fw, fh);
      c.globalCompositeOperation = 'source-atop';
      if (opts.tint) { c.fillStyle = opts.tint; c.fillRect(0, 0, fw, fh); }
      if (opts.flash > 0) { c.fillStyle = `rgba(255,255,255,${opts.flash})`; c.fillRect(0, 0, fw, fh); }
      ctx.drawImage(t, -pivot[0], -pivot[1]);
    } else {
      ctx.drawImage(img, index * fw, 0, fw, fh, -pivot[0], -pivot[1], fw, fh);
    }
    ctx.restore();
  }

  vignette(strength = 0.55) {
    const ctx = this.ctx;
    const g = ctx.createRadialGradient(this.viewW / 2, this.viewH * 0.48, this.viewH * 0.35,
                                       this.viewW / 2, this.viewH * 0.5, this.viewH * 1.05);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, `rgba(2,4,10,${strength})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, this.viewW, this.viewH);
  }
}
