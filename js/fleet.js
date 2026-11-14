/* ==========================================================
   The Club Customs: Fleet Mockup Studio
   Live SVG mockups of a business's van / truck / trailer.
   ========================================================== */
(function () {
  'use strict';
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const host = $('#studioSvg'); if (!host) return;

  const V = {
    van: {
      label: 'Cargo Van', type: 'Cargo / Sprinter Van', bottom: 380,
      body: 'M92,376 L86,300 Q86,262 118,250 L232,180 Q256,162 300,160 L902,160 Q936,160 938,192 L940,366 Q940,380 926,380 L100,380 Q92,380 92,376 Z',
      windows: ['M126,254 L236,190 Q250,182 268,182 L284,182 L284,254 Z', 'M298,184 L412,184 L412,254 L298,254 Z'],
      seams: ['M424,168 L424,374', 'M650,168 L650,374', 'M928,170 L928,372'],
      wheels: [[232, 378, 50], [792, 378, 50]],
      extras: '<path d="M86,286 L122,284 L122,306 L88,308 Z" fill="#f4f1d0"/><rect x="930" y="200" width="9" height="60" rx="3" fill="#d0141f"/><path d="M80,346 L160,346 L160,386 L88,386 Q80,386 80,378 Z" fill="#141416"/><rect x="900" y="352" width="44" height="32" rx="4" fill="#141416"/><rect x="300" y="268" width="26" height="7" rx="3" fill="rgba(0,0,0,.35)"/><rect x="664" y="268" width="26" height="7" rx="3" fill="rgba(0,0,0,.35)"/>',
      box: { x: 440, y: 180, w: 478, h: 160 }
    },
    truck: {
      label: 'Pickup', type: 'Pickup Truck', bottom: 380,
      body: 'M74,376 L68,306 Q68,284 90,278 L262,262 L326,188 Q336,176 352,176 L566,176 Q580,176 582,190 L584,262 L934,262 Q946,262 946,276 L946,368 Q946,380 932,380 L80,380 Q74,380 74,376 Z',
      windows: ['M338,192 L350,190 L452,190 L452,256 L292,256 Z', 'M464,190 L566,190 L568,256 L464,256 Z'],
      seams: ['M458,186 L458,376', 'M590,266 L590,376'],
      wheels: [[202, 378, 54], [802, 378, 54]],
      extras: '<rect x="584" y="258" width="362" height="9" rx="3" fill="#141416"/><path d="M66,292 L104,290 L104,310 L68,312 Z" fill="#f4f1d0"/><path d="M62,346 L150,346 L150,386 L70,386 Q62,386 62,378 Z" fill="#141416"/><rect x="938" y="282" width="8" height="40" rx="3" fill="#d0141f"/><rect x="474" y="270" width="24" height="7" rx="3" fill="rgba(0,0,0,.35)"/><rect x="346" y="270" width="24" height="7" rx="3" fill="rgba(0,0,0,.35)"/>',
      box: { x: 298, y: 268, w: 428, h: 100 }
    },
    box: {
      label: 'Box Truck', type: 'Box Truck', bottom: 380,
      body: 'M70,376 L64,302 Q64,282 86,276 L148,266 L188,192 Q196,180 212,180 L292,180 L292,380 L76,380 Q70,380 70,376 Z M300,96 L936,96 Q946,96 946,106 L946,370 Q946,380 936,380 L300,380 Z',
      windows: ['M200,194 L282,194 L282,258 L164,258 Z'],
      seams: ['M300,96 L300,380'],
      wheels: [[190, 378, 52], [800, 378, 52]],
      extras: '<path d="M62,290 L98,288 L98,308 L64,310 Z" fill="#f4f1d0"/><path d="M58,346 L140,346 L140,386 L66,386 Q58,386 58,378 Z" fill="#141416"/><rect x="292" y="300" width="8" height="80" fill="#141416"/>',
      box: { x: 322, y: 116, w: 600, h: 220 }
    },
    trailer: {
      label: 'Trailer', type: 'Trailer', bottom: 362,
      body: 'M150,350 L150,170 Q150,140 182,138 L916,138 Q946,138 946,168 L946,350 Q946,362 934,362 L162,362 Q150,362 150,350 Z',
      windows: [],
      seams: ['M212,142 L212,360', 'M940,150 L940,356'],
      wheels: [[652, 372, 42], [770, 372, 42]],
      extras: '<path d="M30,356 L152,330 L152,348 L50,368 Z" fill="#1a1a1d"/><rect x="96" y="336" width="10" height="56" fill="#1a1a1d"/><rect x="88" y="388" width="26" height="8" rx="3" fill="#1a1a1d"/><path d="M590,362 Q600,318 652,316 L770,316 Q822,318 832,362 Z" fill="#b9bec6"/><rect x="938" y="300" width="8" height="40" rx="3" fill="#d0141f"/>',
      box: { x: 236, y: 158, w: 680, h: 150 },
      fenderOver: true
    }
  };
  const STYLE_LABEL = { blades: 'Blades', stripe: 'Stripes', wave: 'Wave', split: 'Two-Tone', fade: 'Fade', clean: 'Clean' };

  const S = { v: 'van', style: 'blades', logo: null, logoRatio: 1 };
  const el = id => document.getElementById(id);
  const inputs = ['stName', 'stTag', 'stPhone', 'stWeb', 'stBody', 'stAccent', 'stText'].map(el);
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function shade(hex, amt) {
    const v = parseInt(hex.slice(1), 16);
    const f = c => Math.max(0, Math.min(255, Math.round(c + (amt > 0 ? (255 - c) : c) * amt)));
    return '#' + [v >> 16 & 255, v >> 8 & 255, v & 255].map(f).map(c => c.toString(16).padStart(2, '0')).join('');
  }

  function graphics(style, bot, body, accent, text) {
    const a2 = shade(accent, -0.35), a3 = shade(accent, 0.55);
    switch (style) {
      case 'blades': {
        let g = '';
        const cols = [accent, '#ffffff', a2, accent, text, a3];
        for (let k = 0; k < 6; k++) {
          const x = 470 + k * 92, w = 34 + (k % 3) * 18;
          g += `<polygon points="${x},40 ${x + w},40 ${x + w - 240},460 ${x - 240},460" fill="${cols[k]}" opacity="${k === 4 ? 0.85 : 1}"/>`;
        }
        g += `<polygon points="980,40 1000,40 1000,460 740,460" fill="${a2}"/>`;
        return g;
      }
      case 'stripe':
        return `<rect x="0" y="${bot - 86}" width="1000" height="26" fill="${accent}"/><rect x="0" y="${bot - 54}" width="1000" height="8" fill="${a2}"/><rect x="0" y="${bot - 40}" width="1000" height="40" fill="${shade(accent, -0.6)}"/>`;
      case 'wave':
        return `<path d="M0,${bot - 120} C220,${bot - 190} 520,${bot - 20} 1000,${bot - 160} L1000,460 L0,460 Z" fill="${a3}"/><path d="M0,${bot - 90} C260,${bot - 150} 520,${bot - 10} 1000,${bot - 120} L1000,460 L0,460 Z" fill="${accent}"/><path d="M0,${bot - 40} C300,${bot - 80} 600,${bot} 1000,${bot - 60} L1000,460 L0,460 Z" fill="${a2}"/>`;
      case 'split':
        return `<polygon points="560,40 1000,40 1000,460 400,460" fill="${accent}"/><polygon points="540,40 556,40 396,460 380,460" fill="${text}"/>`;
      case 'fade':
        return `<defs><linearGradient id="fadeG" x1="0" x2="1"><stop offset="0.3" stop-color="${body}"/><stop offset="1" stop-color="${accent}"/></linearGradient></defs><rect x="0" y="40" width="1000" height="420" fill="url(#fadeG)"/>`;
      default: return '';
    }
  }

  function wheel([cx, cy, r]) {
    let spokes = '';
    for (let k = 0; k < 6; k++) {
      const a = k * Math.PI / 3, x = cx + Math.cos(a) * r * 0.55, y = cy + Math.sin(a) * r * 0.55;
      spokes += `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="#2a2c31" stroke-width="${(r * 0.12).toFixed(1)}" stroke-linecap="round"/>`;
    }
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#0d0d0f"/><circle cx="${cx}" cy="${cy}" r="${r * 0.62}" fill="url(#rimG)"/>${spokes}<circle cx="${cx}" cy="${cy}" r="${r * 0.14}" fill="#5c6068"/>`;
  }

  function textBlock(box, name, tag, phone, web, color, outline) {
    const ol = sw => ` paint-order="stroke" stroke="${outline}" stroke-width="${sw.toFixed(1)}" stroke-linejoin="round"`;
    let { x, y, w, h } = box, out = '';
    if (S.logo) {
      const lw = Math.min(w * 0.36, h * 0.95 * S.logoRatio), lh = lw / S.logoRatio;
      out += `<image href="${S.logo}" x="${x}" y="${y + (h - lh) / 2}" width="${lw}" height="${lh}" preserveAspectRatio="xMidYMid meet"/>`;
      x += lw + w * 0.04; w -= lw + w * 0.04;
    }
    const cx = x + w / 2, small = h < 120;
    const nameSize = Math.min(h * (small ? 0.42 : 0.36), w / Math.max(4, name.length * 0.5));
    const fit = (txt, size, k) => { const est = txt.length * size * k; return est > w ? ` textLength="${w}" lengthAdjust="spacingAndGlyphs"` : ''; };
    let ty = y + (small ? h * 0.42 : h * 0.36);
    out += `<text x="${cx}" y="${ty}" text-anchor="middle" font-family="Anton, Impact, 'Arial Black', sans-serif" font-size="${nameSize.toFixed(1)}" fill="${color}" letter-spacing="1"${ol(nameSize * 0.14)}${fit(name, nameSize, 0.52)}>${esc(name.toUpperCase())}</text>`;
    const ts = Math.min(h * 0.12, 22);
    if (tag) { ty += ts * 1.6; out += `<text x="${cx}" y="${ty}" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-weight="700" font-style="italic" font-size="${ts.toFixed(1)}" fill="${color}"${ol(ts * 0.3)}${fit(tag, ts, 0.55)}>${esc(tag)}</text>`; }
    const ps = Math.min(h * (small ? 0.2 : 0.17), 34);
    if (phone) { ty += ps * 1.35; out += `<text x="${cx}" y="${ty}" text-anchor="middle" font-family="Anton, Impact, 'Arial Black', sans-serif" font-size="${ps.toFixed(1)}" fill="${color}" letter-spacing="1"${ol(ps * 0.2)}${fit(phone, ps, 0.5)}>${esc(phone)}</text>`; }
    if (web && !small) { ty += ts * 1.5; out += `<text x="${cx}" y="${ty}" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-weight="800" font-size="${ts.toFixed(1)}" fill="${color}" letter-spacing="1"${ol(ts * 0.3)}${fit(web, ts, 0.6)}>${esc(web.toUpperCase())}</text>`; }
    return out;
  }

  function build() {
    const t = V[S.v], [name, tag, phone, web, body, accent, text] = inputs.map(i => i.value);
    const bot = t.bottom;
    const wells = t.wheels.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r + 9}" fill="#0b0b0c"/>`).join('');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 70 1000 380" role="img" aria-label="${esc(name)} ${t.label} wrap mockup">
  <defs>
    <clipPath id="bodyClip"><path d="${t.body}"/></clipPath>
    <linearGradient id="glassG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a4250"/><stop offset=".45" stop-color="#11141a"/><stop offset=".55" stop-color="#2a303b"/><stop offset="1" stop-color="#0b0d11"/></linearGradient>
    <linearGradient id="sheenG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset=".35" stop-color="#fff" stop-opacity="0"/><stop offset=".8" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></linearGradient>
    <radialGradient id="rimG"><stop offset="0" stop-color="#e9ecf0"/><stop offset=".7" stop-color="#9aa0a8"/><stop offset="1" stop-color="#5d626b"/></radialGradient>
  </defs>
  <ellipse cx="510" cy="${bot + 44}" rx="470" ry="16" fill="#000" opacity=".55"/>
  <g clip-path="url(#bodyClip)">
    <rect x="0" y="0" width="1000" height="440" fill="${body}"/>
    ${graphics(S.style, bot, body, accent, text)}
    ${textBlock(t.box, name, tag, phone, web, text, body)}
    ${t.seams.map(d => `<path d="${d}" stroke="#000" stroke-opacity=".28" stroke-width="2.5" fill="none"/>`).join('')}
    ${wells}
    <rect x="0" y="0" width="1000" height="440" fill="url(#sheenG)"/>
  </g>
  <path d="${t.body}" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="2"/>
  ${t.windows.map(d => `<path d="${d}" fill="url(#glassG)" stroke="#000" stroke-width="2"/>`).join('')}
  ${t.extras}
  ${t.wheels.map(wheel).join('')}
</svg>`;
    host.innerHTML = svg;
    return svg;
  }

  // controls
  inputs.forEach(i => i.addEventListener('input', build));
  $('#studioVehicles').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    S.v = b.dataset.v; $$('#studioVehicles button').forEach(x => x.classList.toggle('is-active', x === b)); build();
  });
  $('#studioStyles').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    S.style = b.dataset.s; $$('#studioStyles button').forEach(x => x.classList.toggle('is-active', x === b)); build();
  });
  el('stLogo').addEventListener('change', e => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => { const img = new Image(); img.onload = () => { S.logoRatio = img.naturalWidth / img.naturalHeight || 1; S.logo = r.result; build(); }; img.src = r.result; };
    r.readAsDataURL(f);
  });

  function toImage(maxW) {
    return new Promise((resolve, reject) => {
      const svg = build(), img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas'); c.width = maxW; c.height = Math.round(maxW * 0.38);
        const x = c.getContext('2d');
        const g = x.createLinearGradient(0, 0, 0, c.height); g.addColorStop(0, '#1b1d23'); g.addColorStop(0.62, '#24262d'); g.addColorStop(0.62, '#15161a'); g.addColorStop(1, '#0e0f12');
        x.fillStyle = g; x.fillRect(0, 0, c.width, c.height);
        x.drawImage(img, 0, 0, c.width, c.height);
        x.fillStyle = 'rgba(255,255,255,.7)'; x.font = `800 ${c.width / 70}px Inter, Arial, sans-serif`;
        x.fillText('MOCKUP · THE CLUB CUSTOMS · RENO, NV', c.width * 0.02, c.height * 0.06);
        resolve(c.toDataURL('image/jpeg', 0.92));
      };
      img.onerror = reject;
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    });
  }
  el('stDownload').addEventListener('click', async () => {
    const a = document.createElement('a'); a.href = await toImage(2000);
    a.download = `fleet-mockup-${(el('stName').value || 'business').replace(/\W+/g, '-').toLowerCase()}.jpg`; a.click();
  });
  el('stToQuote').addEventListener('click', async () => {
    const url = await toImage(1400), t = V[S.v];
    window.ClubQuote && window.ClubQuote.attach(url, `${t.label} · ${STYLE_LABEL[S.style]} fleet mockup`, {
      service: 'Fleet Graphics', business: el('stName').value === 'YOUR BUSINESS' ? '' : el('stName').value,
      vehicleType: t.type, finish: 'Printed graphics', fileName: 'fleet-mockup.jpg',
      color: `Body ${el('stBody').value.toUpperCase()}, accent ${el('stAccent').value.toUpperCase()}, ${STYLE_LABEL[S.style]} style (from Fleet Studio)`
    });
  });

  build();
})();
