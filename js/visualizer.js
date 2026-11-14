/* ==========================================================
   The Club Customs: Wrap Visualizer
   Upload a car photo -> tap paint (magic wand) -> recolor with
   a chosen wrap color + finish, keeping the photo's shading.
   Everything runs in the browser; nothing is uploaded.
   ========================================================== */
(function (root) {
  'use strict';

  /* ------------------------------------------------------------
     Core image math (no DOM): exported for testing too
     ------------------------------------------------------------ */
  const Core = {};

  // YCbCr with light smoothing + an edge map, used by the wand
  Core.prepare = function (data, W, H) {
    const n = W * H, Y = new Float32Array(n), Cb = new Float32Array(n), Cr = new Float32Array(n);
    for (let i = 0, p = 0; i < n; i++, p += 4) {
      const r = data[p], g = data[p + 1], b = data[p + 2];
      Y[i] = 0.299 * r + 0.587 * g + 0.114 * b;
      Cb[i] = -0.1687 * r - 0.3313 * g + 0.5 * b;
      Cr[i] = 0.5 * r - 0.4187 * g - 0.0813 * b;
    }
    const P = { Y: boxBlur(Y, W, H, 1), Cb: boxBlur(Cb, W, H, 1), Cr: boxBlur(Cr, W, H, 1), W, H };
    const G = new Float32Array(n);
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      const i = y * W + x;
      const gy = Math.abs(P.Y[i + W] - P.Y[i - W]) + Math.abs(P.Cb[i + W] - P.Cb[i - W]) + Math.abs(P.Cr[i + W] - P.Cr[i - W]);
      const gx = Math.abs(P.Y[i + 1] - P.Y[i - 1]) + Math.abs(P.Cb[i + 1] - P.Cb[i - 1]) + Math.abs(P.Cr[i + 1] - P.Cr[i - 1]);
      G[i] = Math.max(gx, gy);
    }
    P.G = G;
    return P;
  };

  function boxBlur(src, W, H, r) {
    const tmp = new Float32Array(src.length), out = new Float32Array(src.length), d = 2 * r + 1;
    for (let y = 0; y < H; y++) {
      let acc = 0; const row = y * W;
      for (let x = -r; x <= r; x++) acc += src[row + Math.min(W - 1, Math.max(0, x))];
      for (let x = 0; x < W; x++) {
        tmp[row + x] = acc / d;
        acc += src[row + Math.min(W - 1, x + r + 1)] - src[row + Math.max(0, x - r)];
      }
    }
    for (let x = 0; x < W; x++) {
      let acc = 0;
      for (let y = -r; y <= r; y++) acc += tmp[Math.min(H - 1, Math.max(0, y)) * W + x];
      for (let y = 0; y < H; y++) {
        out[y * W + x] = acc / d;
        acc += tmp[Math.min(H - 1, y + r + 1) * W + x] - tmp[Math.max(0, y - r) * W + x];
      }
    }
    return out;
  }

  // Magic-wand flood fill. Grows over pixels close to the tapped paint color and
  // stops at strong edges (panel gaps, trim, the car's outline). Returns Uint8Array.
  Core.wand = function (P, sx, sy, tol, opt) {
    opt = opt || {};
    const { W, H } = P, n = W * H, LW = opt.lumaWeight != null ? opt.lumaWeight : 0.5;
    let sY = 0, sB = 0, sR = 0, c = 0;
    for (let y = Math.max(0, sy - 2); y <= Math.min(H - 1, sy + 2); y++)
      for (let x = Math.max(0, sx - 2); x <= Math.min(W - 1, sx + 2); x++) { const i = y * W + x; sY += P.Y[i]; sB += P.Cb[i]; sR += P.Cr[i]; c++; }
    sY /= c; sB /= c; sR /= c;
    const edge = opt.edge != null ? opt.edge : 26 + tol * 0.9, t2 = tol * tol;
    const region = new Uint8Array(n), stack = new Int32Array(n), seed = sy * W + sx;
    let sp = 0; stack[sp++] = seed; region[seed] = 1;
    while (sp) {
      const i = stack[--sp], x = i % W;
      const nb0 = x > 0 ? i - 1 : -1, nb1 = x < W - 1 ? i + 1 : -1, nb2 = i - W, nb3 = i + W;
      for (const j of [nb0, nb1, nb2, nb3]) {
        if (j < 0 || j >= n || region[j]) continue;
        const dy = (P.Y[j] - sY) * LW, db = P.Cb[j] - sB, dr = P.Cr[j] - sR;
        if (dy * dy + db * db + dr * dr < t2 && P.G[j] < edge) { region[j] = 1; stack[sp++] = j; }
      }
    }
    return Core.close(region, W, H, 3);
  };

  // Morphological close (dilate then erode) fills tiny holes like emblems & specks
  Core.close = function (m, W, H, r) {
    return morph(morph(m, W, H, r, true), W, H, r, false);
  };
  function morph(m, W, H, r, dilate) {
    const tmp = new Uint8Array(m.length), out = new Uint8Array(m.length);
    const pass = (src, dst, horiz) => {
      const L = horiz ? W : H, M = horiz ? H : W;
      for (let a = 0; a < M; a++) {
        let cnt = 0; const idx = b => horiz ? a * W + b : b * W + a;
        for (let b = 0; b < Math.min(r, L); b++) cnt += src[idx(b)];
        for (let b = 0; b < L; b++) {
          if (b + r < L) cnt += src[idx(b + r)];
          if (b - r - 1 >= 0) cnt -= src[idx(b - r - 1)];
          const win = Math.min(L - 1, b + r) - Math.max(0, b - r) + 1;
          dst[idx(b)] = dilate ? (cnt > 0 ? 1 : 0) : (cnt === win ? 1 : 0);
        }
      }
    };
    pass(m, tmp, true); pass(tmp, out, false);
    return out;
  }

  Core.stats = function (data, mask) {
    let s = 0, s2 = 0, c = 0;
    for (let i = 0, p = 0; i < mask.length; i++, p += 4) {
      if (!mask[i]) continue;
      const L = (0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2]) / 255;
      s += L; s2 += L * L; c++;
    }
    if (!c) return { mean: 0.5, std: 0.1, count: 0 };
    const mean = s / c;
    return { mean, std: Math.sqrt(Math.max(0, s2 / c - mean * mean)), count: c };
  };

  const FINISH = {
    gloss:    { c: 1.0,  spec: 0.9,  sat: 1.0,  note: 'Deep, wet-look shine with crisp reflections.' },
    satin:    { c: 0.72, spec: 0.28, sat: 0.95, note: 'Low sheen. Smooth, modern and easy to live with.' },
    matte:    { c: 0.48, spec: 0.0,  sat: 0.86, note: 'Flat, no-reflection finish that turns heads.' },
    metallic: { c: 1.1,  spec: 0.75, sat: 1.0,  flake: 0.07, note: 'Fine metal flake that sparkles in the sun.' },
    chrome:   { c: 2.4,  spec: 1.0,  sat: 0.9,  note: 'Mirror-like reflections. Maximum attention.' },
    shift:    { c: 1.0,  spec: 0.7,  sat: 1.0,  shift: true, note: 'Color changes with the angle and light.' },
    carbon:   { c: 0.6,  spec: 0.5,  sat: 0.35, carbon: true, note: 'Woven carbon fiber texture, tinted to your color.' }
  };
  Core.FINISH = FINISH;

  function rgb2hsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
    let h = 0, s = 0;
    if (mx !== mn) {
      const d = mx - mn;
      s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
      h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
      h *= 60;
    }
    return [h, s, l];
  }
  function hue2(p, q, t) { if (t < 0) t += 1; if (t > 1) t -= 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; }
  function hsl2rgb(h, s, l, out, o) {
    h = ((h % 360) + 360) % 360 / 360;
    if (s === 0) { out[o] = out[o + 1] = out[o + 2] = l * 255; return; }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    out[o] = hue2(p, q, h + 1 / 3) * 255; out[o + 1] = hue2(p, q, h) * 255; out[o + 2] = hue2(p, q, h - 1 / 3) * 255;
  }
  Core.hex2rgb = hex => { const v = parseInt(hex.slice(1), 16); return [v >> 16 & 255, v >> 8 & 255, v & 255]; };

  // Recolor every pixel where alpha[i] > 0, writing RGBA into out
  Core.recolor = function (data, W, H, alpha, st, hex, finishKey, out) {
    const f = FINISH[finishKey] || FINISH.gloss;
    const [r0, g0, b0] = Core.hex2rgb(hex), [th, ts, tl0] = rgb2hsl(r0, g0, b0);
    const spread = Math.max(st.std, 0.035);
    for (let i = 0, p = 0; i < alpha.length; i++, p += 4) {
      const a = alpha[i];
      if (!a) { out[p + 3] = 0; continue; }
      const x = i % W, y = (i / W) | 0;
      const L = (0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2]) / 255;
      let dn = (L - st.mean) / spread * 0.16;
      dn = dn < -0.7 ? -0.7 : dn > 0.7 ? 0.7 : dn;
      let h = th, s = ts * f.sat, tl = tl0;
      if (f.carbon) {
        const u = x + y, v = x - y, cell = 7;
        const weave = ((Math.floor(u / cell) + Math.floor(v / cell)) & 1) ? Math.abs(((u % cell) / cell) - 0.5) : Math.abs(((v % cell + cell) % cell) / cell - 0.5);
        tl = Math.min(tl0, 0.22) * 0.6 + 0.05 + weave * 0.12;
      }
      let nl;
      if (finishKey === 'chrome') {
        nl = 0.55 + dn * f.c;
        nl = 0.5 + 0.5 * Math.sin((nl - 0.5) * 2.4); // banded mirror reflections
        nl = nl * 0.7 + tl * 0.3;
      } else {
        nl = dn > 0 ? tl + dn * f.c * (1 - tl) * 1.6 : tl + dn * f.c * Math.max(tl, 0.12) * 1.6;
      }
      if (f.spec && dn > 0.12) { const t = Math.min(1, (dn - 0.12) / 0.32); nl += (1 - nl) * t * t * f.spec; }
      if (f.flake) { const hsh = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453; nl += ((hsh - Math.floor(hsh)) - 0.5) * f.flake; }
      if (f.shift) { h = th + dn * 260 + (x / W - 0.5) * 90; }
      if (finishKey === 'matte') nl = nl * 0.94 + 0.03;
      nl = nl < 0 ? 0 : nl > 1 ? 1 : nl;
      hsl2rgb(h, s, nl, out, p);
      out[p + 3] = a;
    }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = Core;
  if (typeof document === 'undefined') return;

  /* ------------------------------------------------------------
     UI
     ------------------------------------------------------------ */
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const canvas = $('#vizCanvas'); if (!canvas) return;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  const COLORS = [
    ['Racing Red', '#d0141f'], ['Tiffany Teal', '#13d1c3'], ['Nardo Grey', '#8a8d8f'], ['Jet Black', '#101012'],
    ['Arctic White', '#f2f3f5'], ['Peach Fuzz', '#f3a283'], ['Miami Blue', '#1aa3e8'], ['Midnight Purple', '#40205f'],
    ['Military Green', '#5d6b4a'], ['Lime Rush', '#9be22d'], ['Sunset Orange', '#ff6a13'], ['Hot Pink', '#ff3aa0'],
    ['Liquid Gold', '#c9a227'], ['Rose Gold', '#d9a3a0'], ['Royal Blue', '#1f3fbf'], ['Battleship', '#4a4f57']
  ];
  const FINISH_LABEL = { gloss: 'Gloss', satin: 'Satin', matte: 'Matte', metallic: 'Metallic', chrome: 'Chrome', shift: 'Color Shift', carbon: 'Carbon Fiber' };
  const SAMPLES = {
    wrx:   { src: 'assets/img/wrx-teal.jpg',         tol: 24, seeds: [[0.66, 0.46], [0.2, 0.58], [0.5, 0.5], [0.78, 0.43], [0.70, 0.55], [0.18, 0.64], [0.67, 0.405]] },
    camry: { src: 'assets/img/camry-green.jpg',      tol: 20, seeds: [[0.38, 0.50], [0.27, 0.48], [0.21, 0.47], [0.57, 0.50], [0.62, 0.44], [0.70, 0.55], [0.40, 0.56]] },
    bmw:   { src: 'assets/img/bmw-peach-garage.jpg', tol: 24, seeds: [[0.70, 0.57], [0.85, 0.48], [0.30, 0.52], [0.50, 0.58], [0.15, 0.72], [0.25, 0.72], [0.65, 0.39]] }
  };

  const MAX = 1400;

  const S = {
    W: 0, H: 0, src: null, P: null, mask: null, undo: [],
    mode: 'wand', color: '#d0141f', colorName: 'Racing Red', finish: 'gloss',
    tol: 20, brush: 26, showMask: true, compare: false, split: 0.5, ready: false, sample: null
  };
  const off = { mask: document.createElement('canvas'), blur: document.createElement('canvas'), layer: document.createElement('canvas') };

  /* ---------- color + finish UI ---------- */
  const sw = $('#vizSwatches');
  sw.innerHTML = COLORS.map(([n, h]) => `<button class="swatch" style="background:${h}" data-hex="${h}" data-name="${n}" title="${n}" aria-label="${n}"></button>`).join('');
  function setColor(hex, name) {
    S.color = hex.toLowerCase(); S.colorName = name || 'Custom Color';
    $('#vizColor').value = S.color; $('#vizHex').value = S.color.toUpperCase(); $('#vizColorName').textContent = S.colorName;
    $$('.swatch').forEach(b => b.classList.toggle('is-active', b.dataset.hex === S.color));
    render();
  }
  sw.addEventListener('click', e => { const b = e.target.closest('.swatch'); if (b) setColor(b.dataset.hex, b.dataset.name); });
  $('#vizColor').addEventListener('input', e => setColor(e.target.value, nameFor(e.target.value)));
  $('#vizHex').addEventListener('change', e => { let v = e.target.value.trim(); if (!v.startsWith('#')) v = '#' + v; if (/^#[0-9a-f]{6}$/i.test(v)) setColor(v, nameFor(v)); else e.target.value = S.color.toUpperCase(); });
  function nameFor(hex) { const m = COLORS.find(c => c[1] === hex.toLowerCase()); return m ? m[0] : 'Custom Color'; }

  $('#vizFinishes').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    S.finish = b.dataset.finish;
    $$('#vizFinishes button').forEach(x => x.classList.toggle('is-active', x === b));
    $('#vizFinishNote').textContent = FINISH[S.finish].note;
    render();
  });

  /* ---------- tools ---------- */
  $$('.seg__btn').forEach(b => b.addEventListener('click', () => {
    S.mode = b.dataset.mode; $$('.seg__btn').forEach(x => x.classList.toggle('is-active', x === b));
    hint(S.mode === 'wand' ? 'Tap a painted panel to add it' : S.mode === 'brush' ? 'Paint over areas the wand missed' : 'Paint over areas that shouldn\'t be wrapped');
  }));
  const tol = $('#vizTol'), brush = $('#vizBrush');
  tol.addEventListener('input', () => { S.tol = +tol.value; $('#vizTolOut').textContent = tol.value; });
  brush.addEventListener('input', () => { S.brush = +brush.value; $('#vizBrushOut').textContent = brush.value; });
  $('#vizShowMask').addEventListener('change', e => { S.showMask = e.target.checked; render(); });
  $('#vizCompareToggle').addEventListener('change', e => { S.compare = e.target.checked; $('#vizCompare').hidden = !S.compare; render(); });
  $('#vizUndo').addEventListener('click', () => { if (S.undo.length) { S.mask = S.undo.pop(); refreshMask(); } });
  $('#vizClear').addEventListener('click', () => { if (!S.mask) return; pushUndo(); S.mask = new Uint8Array(S.W * S.H); refreshMask(); hint('Tap the car\'s paint to select it'); });

  let hintTimer;
  function hint(t, keep) {
    const h = $('#vizHint'); h.textContent = t; h.classList.remove('is-hidden');
    clearTimeout(hintTimer); if (!keep) hintTimer = setTimeout(() => h.classList.add('is-hidden'), 3500);
  }

  /* ---------- loading images ---------- */
  function loadImage(src, seeds, seedTol) {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, MAX / Math.max(img.naturalWidth, img.naturalHeight));
      S.W = Math.round(img.naturalWidth * k); S.H = Math.round(img.naturalHeight * k);
      canvas.width = S.W; canvas.height = S.H;
      [off.mask, off.blur, off.layer].forEach(c => { c.width = S.W; c.height = S.H; });
      ctx.drawImage(img, 0, 0, S.W, S.H);
      S.src = ctx.getImageData(0, 0, S.W, S.H);
      S.P = Core.prepare(S.src.data, S.W, S.H);
      S.mask = new Uint8Array(S.W * S.H); S.undo = []; S.ready = true;
      if (seeds) {
        seeds.forEach(([fx, fy]) => addRegion(Core.wand(S.P, Math.round(fx * S.W), Math.round(fy * S.H), seedTol || S.tol)));
        hint('Pick a color and finish →');
      } else { S.tol = 15; tol.value = 15; $('#vizTolOut').textContent = 15; hint('Tap the car\'s paint to select it', true); }
      refreshMask();
    };
    img.src = src;
  }
  function addRegion(r) { for (let i = 0; i < r.length; i++) if (r[i]) S.mask[i] = 1; }

  $('#vizSamples').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    $$('#vizSamples button').forEach(x => x.classList.toggle('is-active', x === b));
    const s = SAMPLES[b.dataset.sample]; S.sample = b.dataset.sample;
    loadImage(s.src, s.seeds, s.tol);
  });
  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    $$('#vizSamples button').forEach(x => x.classList.remove('is-active'));
    S.sample = null; loadImage(url, null);
  }
  $('#vizUpload').addEventListener('change', e => handleFile(e.target.files[0]));
  const wrap = $('#vizWrap'), drop = $('#vizDrop');
  ['dragenter', 'dragover'].forEach(t => wrap.addEventListener(t, e => { e.preventDefault(); drop.classList.add('is-over'); }));
  ['dragleave', 'drop'].forEach(t => wrap.addEventListener(t, e => { e.preventDefault(); drop.classList.remove('is-over'); }));
  wrap.addEventListener('drop', e => handleFile(e.dataTransfer.files[0]));

  /* ---------- pointer interaction ---------- */
  const pos = e => { const r = canvas.getBoundingClientRect(); return [(e.clientX - r.left) * S.W / r.width, (e.clientY - r.top) * S.H / r.height]; };
  let drawing = false, last = null, draggingSplit = false;
  canvas.addEventListener('pointerdown', e => {
    if (!S.ready) return;
    canvas.setPointerCapture(e.pointerId);
    const [x, y] = pos(e);
    if (S.compare) { draggingSplit = true; S.split = x / S.W; render(); return; }
    if (S.mode === 'wand') {
      pushUndo();
      const px = Math.max(0, Math.min(S.W - 1, x | 0)), py = Math.max(0, Math.min(S.H - 1, y | 0));
      // If a tap floods into the background (> 35% of the photo), tighten automatically
      let t = S.tol, r = Core.wand(S.P, px, py, t), tightened = false;
      const frac = a => { let c = 0; for (let i = 0; i < a.length; i++) c += a[i]; return c / a.length; };
      while (frac(r) > 0.35 && t > 6) { t = Math.max(6, Math.round(t * 0.72)); r = Core.wand(S.P, px, py, t); tightened = true; }
      addRegion(r);
      if (tightened) { S.tol = t; tol.value = t; $('#vizTolOut').textContent = t; }
      refreshMask(); hint(tightened ? 'Sensitivity auto-adjusted. Tap more panels if needed' : 'Tap more panels, or pick a color →');
    } else { pushUndo(); drawing = true; last = [x, y]; stamp(x, y); refreshMask(); }
  });
  canvas.addEventListener('pointermove', e => {
    if (draggingSplit) { S.split = Math.max(0, Math.min(1, pos(e)[0] / S.W)); render(); return; }
    if (!drawing) return;
    const [x, y] = pos(e), d = Math.hypot(x - last[0], y - last[1]), steps = Math.max(1, d / (S.brush * 0.3));
    for (let k = 1; k <= steps; k++) stamp(last[0] + (x - last[0]) * k / steps, last[1] + (y - last[1]) * k / steps);
    last = [x, y]; refreshMask();
  });
  const end = () => { drawing = false; draggingSplit = false; };
  canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);

  function stamp(cx, cy) {
    const r = S.brush * S.W / canvas.getBoundingClientRect().width / 2 + 1, v = S.mode === 'brush' ? 1 : 0;
    const x0 = Math.max(0, cx - r | 0), x1 = Math.min(S.W - 1, cx + r | 0), y0 = Math.max(0, cy - r | 0), y1 = Math.min(S.H - 1, cy + r | 0);
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) S.mask[y * S.W + x] = v;
  }
  function pushUndo() { S.undo.push(S.mask.slice()); if (S.undo.length > 20) S.undo.shift(); }

  /* ---------- rendering ---------- */
  let feather = null, stats = null, edges = null;
  function refreshMask() {
    // soft edge alpha from mask
    const mctx = off.mask.getContext('2d'), md = mctx.createImageData(S.W, S.H);
    for (let i = 0, p = 3; i < S.mask.length; i++, p += 4) md.data[p] = S.mask[i] ? 255 : 0;
    mctx.putImageData(md, 0, 0);
    const bctx = off.blur.getContext('2d', { willReadFrequently: true });
    bctx.clearRect(0, 0, S.W, S.H);
    if ('filter' in bctx) bctx.filter = 'blur(1.2px)';
    bctx.drawImage(off.mask, 0, 0); bctx.filter = 'none';
    const bd = bctx.getImageData(0, 0, S.W, S.H).data;
    feather = new Uint8ClampedArray(S.mask.length);
    for (let i = 0, p = 3; i < feather.length; i++, p += 4) feather[i] = bd[p];
    stats = Core.stats(S.src.data, S.mask);
    // selection outline
    edges = [];
    const W = S.W, m = S.mask;
    for (let y = 1; y < S.H - 1; y++) for (let x = 1; x < W - 1; x++) {
      const i = y * W + x; if (m[i] && (!m[i - 1] || !m[i + 1] || !m[i - W] || !m[i + W])) edges.push(i);
    }
    render();
  }

  let raf = 0;
  function render() { if (!S.ready || raf) return; raf = requestAnimationFrame(() => { raf = 0; draw(); }); }
  function draw() {
    ctx.putImageData(S.src, 0, 0);
    if (!stats || !stats.count) return;
    const lctx = off.layer.getContext('2d'), layer = lctx.createImageData(S.W, S.H);
    Core.recolor(S.src.data, S.W, S.H, feather, stats, S.color, S.finish, layer.data);
    if (S.showMask && !S.compare) for (const i of edges) { const p = i * 4; layer.data[p] = 255; layer.data[p + 1] = 40; layer.data[p + 2] = 60; layer.data[p + 3] = 255; }
    lctx.putImageData(layer, 0, 0);
    if (S.compare) {
      const sx = Math.round(S.split * S.W);
      ctx.save(); ctx.beginPath(); ctx.rect(sx, 0, S.W - sx, S.H); ctx.clip(); ctx.drawImage(off.layer, 0, 0); ctx.restore();
      const cmp = $('#vizCompare'); cmp.style.left = (S.split * 100) + '%';
    } else ctx.drawImage(off.layer, 0, 0);
  }

  /* ---------- export ---------- */
  function exportImage(maxW, type) {
    const c = document.createElement('canvas'), k = Math.min(1, maxW / S.W);
    c.width = Math.round(S.W * k); c.height = Math.round(S.H * k);
    const x = c.getContext('2d');
    x.putImageData(S.src, 0, 0); // will be redrawn scaled below
    const tmp = document.createElement('canvas'); tmp.width = S.W; tmp.height = S.H;
    const t = tmp.getContext('2d'); t.putImageData(S.src, 0, 0); t.drawImage(off.layerClean || cleanLayer(), 0, 0);
    x.clearRect(0, 0, c.width, c.height); x.drawImage(tmp, 0, 0, c.width, c.height);
    const label = `${S.colorName} · ${FINISH_LABEL[S.finish]}`, fs = Math.max(14, c.width / 50);
    x.font = `700 ${fs}px Inter, Arial, sans-serif`;
    const tw = x.measureText(label).width, bw = tw + fs * 7.2, bh = fs * 2.4;
    x.fillStyle = 'rgba(0,0,0,.72)'; x.fillRect(c.width - bw - fs, c.height - bh - fs, bw, bh);
    x.fillStyle = S.color; x.fillRect(c.width - bw - fs + fs * 0.6, c.height - bh - fs + fs * 0.6, fs * 1.2, fs * 1.2);
    x.fillStyle = '#fff'; x.textBaseline = 'middle';
    x.fillText(label, c.width - bw - fs + fs * 2.3, c.height - fs - bh / 2);
    x.fillStyle = '#ff2433'; x.font = `800 ${fs * 0.75}px Inter, Arial, sans-serif`;
    x.fillText('THE CLUB CUSTOMS', c.width - fs - fs * 0.6 - x.measureText('THE CLUB CUSTOMS').width, c.height - fs - bh / 2);
    return c.toDataURL(type || 'image/jpeg', 0.9);
  }
  function cleanLayer() {
    const c = document.createElement('canvas'); c.width = S.W; c.height = S.H;
    const l = c.getContext('2d'), d = l.createImageData(S.W, S.H);
    if (stats && stats.count) Core.recolor(S.src.data, S.W, S.H, feather, stats, S.color, S.finish, d.data);
    l.putImageData(d, 0, 0); return c;
  }
  $('#vizDownload').addEventListener('click', () => {
    if (!S.ready) return;
    const a = document.createElement('a');
    a.href = exportImage(2000); a.download = `club-customs-wrap-${S.colorName.replace(/\s+/g, '-').toLowerCase()}-${S.finish}.jpg`; a.click();
  });
  $('#vizToQuote').addEventListener('click', () => {
    if (!S.ready || !stats || !stats.count) { hint('Select the car\'s paint first'); return; }
    window.ClubQuote && window.ClubQuote.attach(exportImage(1200), `${S.colorName} (${S.color.toUpperCase()}) · ${FINISH_LABEL[S.finish]} wrap`, {
      service: 'Vinyl Wrap / Color Change', finish: FINISH_LABEL[S.finish],
      color: `${S.colorName} ${S.color.toUpperCase()}, ${FINISH_LABEL[S.finish]} finish (from Wrap Visualizer)`, fileName: 'wrap-visualizer-preview.jpg'
    });
  });

  /* ---------- start with a demo car ---------- */
  setColor('#d0141f', 'Racing Red');
  const first = $('#vizSamples button[data-sample="wrx"]'); first.classList.add('is-active');
  // load when the section is near view, so the hero loads fast
  const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); if (!S.ready) loadImage(SAMPLES.wrx.src, SAMPLES.wrx.seeds, SAMPLES.wrx.tol); } }, { rootMargin: '400px' });
  io.observe(canvas);
})(typeof window !== 'undefined' ? window : globalThis);
