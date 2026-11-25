'use strict';
// バトルの手ごたえ: 技タイプごとの動き / 当たった感じ(暗転・光・数字・一瞬の止め) / 強敵のカットイン / 勝利の演出
const BPOS = { me: [158, 206], foe: [462, 110] };
const fh = (n) => { const v = Math.sin(n * 73.13 + 5.7) * 43758.5453; return v - Math.floor(v); };
function fxAdd(d, draw) { bt.fx.push({ draw, t0: clock, d: d / bspd }); }
const disc = (x, y, r, c) => { g.fillStyle = c; g.beginPath(); g.arc(x, y, Math.max(0.1, r), 0, 7); g.fill(); };
const ring = (x, y, r, w, c) => { g.strokeStyle = c; g.lineWidth = Math.max(0.1, w); g.beginPath(); g.arc(x, y, Math.max(0.1, r), 0, 7); g.stroke(); };
const leafShape = (x, y, a, s, c) => { g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = c; g.beginPath(); g.moveTo(-s, 0); g.quadraticCurveTo(0, -s * 0.62, s, 0); g.quadraticCurveTo(0, s * 0.62, -s, 0); g.fill(); g.strokeStyle = 'rgba(30,70,40,.55)'; g.lineWidth = 1; g.beginPath(); g.moveTo(-s * 0.8, 0); g.lineTo(s * 0.8, 0); g.stroke(); g.restore(); };
const slash = (x, y, a, len, k, c, w) => { const e = Math.min(1, k * 2.2), f = Math.max(0, 1 - Math.max(0, k - 0.45) * 1.8); if (f <= 0) return; const dx = Math.cos(a) * len, dy = Math.sin(a) * len; g.globalAlpha = f; g.fillStyle = c; g.beginPath(); g.moveTo(x - dx, y - dy); g.quadraticCurveTo(x - dy * w, y + dx * w, x - dx + dx * 2 * e, y - dy + dy * 2 * e); g.quadraticCurveTo(x + dy * w * 0.2, y - dx * w * 0.2, x - dx, y - dy); g.fill(); g.globalAlpha = 1; };
function zigzag(x0, y0, x1, y1, seed, spread) { g.beginPath(); g.moveTo(x0, y0); for (let i = 1; i < 8; i++) { const t = i / 8; g.lineTo(lerp(x0, x1, t) + (fh(seed + i) - 0.5) * spread, lerp(y0, y1, t) + (fh(seed + i * 3) - 0.5) * spread * 0.4); } g.lineTo(x1, y1); g.stroke(); }

// 技を はなつ(とんでいく)ところ。かかる 秒数を 返す
function castFx(mv, side, miss) {
  const [x0, y0] = BPOS[side], to = BPOS[side === 'me' ? 'foe' : 'me'], x1 = to[0] + (miss ? (side === 'me' ? 80 : -80) : 0), y1 = to[1] - (miss ? 50 : 0), big = mv.p >= 55;
  Aud.sfx('cast', mv.t);
  if (mv.t === 'leaf') {
    if (mv === MOVES.vine) { fxAdd(0.55, (k) => { const e = ease(Math.min(1, k * 1.5)); g.lineCap = 'round'; for (const s of [-1, 1]) { g.strokeStyle = s > 0 ? '#4f9a52' : '#7cc46a'; g.lineWidth = 7 - k * 3; g.beginPath(); for (let i = 0; i <= 24; i++) { const t = i / 24 * e, w = Math.sin(t * 9 + k * 8) * 26 * s * Math.sin(t * 3.14); g[i ? 'lineTo' : 'moveTo'](lerp(x0, x1, t) + w * 0.5, lerp(y0, y1, t) + w); } g.stroke(); } }); return 0.38; }
    const n = big ? 20 : 13; fxAdd(0.62, (k) => { for (let i = 0; i < n; i++) { const t = clamp(k * 1.45 - i * 0.022, 0, 1); if (t <= 0 || t >= 1) continue; const e = t * t * (3 - 2 * t), sw = Math.sin(t * 7 + i) * 46 * Math.sin(t * 3.14); leafShape(lerp(x0, x1, e) + sw * 0.4, lerp(y0, y1, e) + sw, t * 14 + i, 11 + (i % 3) * 3, i % 2 ? '#6fc46a' : '#b4e684'); } }); return 0.46;
  }
  if (mv.t === 'fire') {
    if (big) { fxAdd(0.7, (k) => { g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 46; i++) { const t = clamp(k * 1.7 - i * 0.017, 0, 1); if (t <= 0 || t >= 1) continue; const sp = t * 34; glowDot(lerp(x0, x1, t) + (fh(i) - 0.5) * sp * 2, lerp(y0, y1, t) + (fh(i + 9) - 0.5) * sp * 1.6, 9 + t * 22, i % 3 ? '255,120,40' : '255,214,90', 0.75 * (1 - t * 0.5)); } }); return 0.46; }
    fxAdd(0.5, (k) => { g.globalCompositeOperation = 'lighter'; for (let b = 0; b < 3; b++) { for (let j = 0; j < 7; j++) { const t = clamp(k * 1.5 - b * 0.12 - j * 0.025, 0, 1); if (t <= 0 || t >= 1) continue; const x = lerp(x0, x1, t), y = lerp(y0, y1, t) - Math.sin(t * 3.14) * (70 - b * 28); glowDot(x, y, 22 - j * 2.4, j < 2 ? '255,230,130' : '255,120,40', 0.9 - j * 0.1); } } }); return 0.4;
  }
  if (mv.t === 'water') {
    if (mv === MOVES.bubble) { fxAdd(0.8, (k) => { for (let i = 0; i < 18; i++) { const t = clamp(k * 1.5 - i * 0.03, 0, 1); if (t <= 0) continue; const pop = t >= 1, x = lerp(x0, x1, t) + Math.sin(t * 9 + i * 2) * 24, y = lerp(y0, y1, t) + (fh(i) - 0.5) * 60 * t, r = 6 + fh(i + 3) * 10; if (pop) { if (k < 0.95) ring(x, y, r + 6, 1.5, 'rgba(220,245,255,.7)'); continue; } disc(x, y, r, 'rgba(150,215,255,.35)'); ring(x, y, r, 1.8, 'rgba(235,250,255,.95)'); disc(x - r * 0.3, y - r * 0.3, r * 0.22, '#fff'); } }); return 0.52; }
    fxAdd(0.6, (k) => { const head = ease(Math.min(1, k * 1.8)), tail = ease(clamp(k * 1.8 - 0.75, 0, 1)); g.lineCap = 'round'; for (const [w, c, o] of [[20, 'rgba(90,170,240,.55)', 0], [11, 'rgba(150,215,255,.9)', 1.5], [4, '#fff', 3]]) { g.strokeStyle = c; g.lineWidth = w * (big ? 1.35 : 1); g.beginPath(); for (let i = 0; i <= 20; i++) { const t = lerp(tail, head, i / 20), wv = Math.sin(t * 22 - k * 30 + o) * 6; g[i ? 'lineTo' : 'moveTo'](lerp(x0, x1, t), lerp(y0, y1, t) + wv - Math.sin(t * 3.14) * 24); } if (head > tail + 0.01) g.stroke(); } for (let i = 0; i < 12; i++) { const t = clamp(head - fh(i) * 0.5, 0, 1); disc(lerp(x0, x1, t) + (fh(i + 5) - 0.5) * 34, lerp(y0, y1, t) - Math.sin(t * 3.14) * 24 + (fh(i + 8) - 0.5) * 34, 2.5 + fh(i + 2) * 3, 'rgba(200,236,255,.9)'); } }); return 0.36;
  }
  if (mv.t === 'volt') { fxAdd(0.42, (k) => { g.lineCap = 'round'; const s = Math.floor(clock * 24); for (let i = 0; i < 9; i++) { const a = i / 9 * 6.283 + s, r = 54 * (1 - k * 0.6); g.strokeStyle = i % 2 ? '#fff8b0' : '#9fe8ff'; g.lineWidth = 2.5; zigzag(x0 + Math.cos(a) * r, y0 + Math.sin(a) * r * 0.8, x0 + Math.cos(a) * 12, y0 + Math.sin(a) * 10, s + i * 7, 22); } g.globalCompositeOperation = 'lighter'; glowDot(x0, y0, 30 + k * 40, '255,240,140', 0.6 * k); }); return 0.34; }
  if (mv.t === 'metal') { fxAdd(0.5, (k) => { for (let i = 0; i < (big ? 9 : 6); i++) { const t = clamp(k * 1.6 - i * 0.07, 0, 1); if (t <= 0 || t >= 1) continue; const x = lerp(x0, x1, t) + (fh(i) - 0.5) * 50 * (1 - t), y = lerp(y0, y1, t) + (fh(i + 4) - 0.5) * 70 * (1 - t); g.save(); g.translate(x, y); g.rotate(t * 20 + i); const gr = g.createLinearGradient(-14, -6, 14, 6); gr.addColorStop(0, '#6f7c8e'); gr.addColorStop(0.5, '#f2f6fa'); gr.addColorStop(1, '#8a98aa'); g.fillStyle = gr; g.beginPath(); g.moveTo(-16, 0); g.lineTo(0, -6); g.lineTo(18, 0); g.lineTo(0, 6); g.closePath(); g.fill(); g.restore(); } }); return 0.38; }
  fxAdd(0.3, (k) => { g.strokeStyle = `rgba(255,255,255,${0.85 * (1 - k)})`; g.lineCap = 'round'; for (let i = 0; i < 10; i++) { const o = (fh(i) - 0.5) * 90, t = clamp(k * 1.4 + fh(i + 2) * 0.25 - 0.2, 0, 1); g.lineWidth = 2 + fh(i + 1) * 3; g.beginPath(); g.moveTo(lerp(x0, x1, t * 0.8), lerp(y0, y1, t * 0.8) + o); g.lineTo(lerp(x0, x1, Math.min(1, t * 0.8 + 0.18)), lerp(y0, y1, Math.min(1, t * 0.8 + 0.18)) + o); g.stroke(); } }); return 0.17;
}

// 当たった ところ。s は 手ごたえの 大きさ
function impactFx(mv, side, r) {
  const [x, y] = BPOS[side === 'me' ? 'foe' : 'me'], s = (r.eff > 1 || r.crit) ? 1.4 : r.eff < 1 ? 0.75 : 1, t = mv.t;
  const RGB = { normal: '255,244,214', leaf: '170,236,120', fire: '255,140,50', water: '130,205,255', volt: '255,238,120', metal: '214,230,245' }[t] || '255,244,214';
  fxAdd(0.34, (k) => { g.globalCompositeOperation = 'lighter'; glowDot(x, y, (40 + k * 70) * s, RGB, 0.85 * (1 - k)); g.globalCompositeOperation = 'source-over'; ring(x, y, (14 + k * 74) * s, 7 * (1 - k) * s, `rgba(255,255,255,${0.9 * (1 - k)})`); });
  Aud.sfx('boom', t);
  if (t === 'normal') {
    if (mv === MOVES.bite) fxAdd(0.45, (k) => { const c = Math.min(1, k * 2.4), a = 1 - Math.max(0, k - 0.6) * 2.5; g.globalAlpha = Math.max(0, a); for (const d of [-1, 1]) { const yy = y + d * (52 - 44 * ease(c)); g.fillStyle = '#fff'; g.strokeStyle = '#3a2c40'; g.lineWidth = 2; g.beginPath(); g.moveTo(x - 46 * s, yy + d * 12); for (let i = 0; i <= 6; i++) { g.lineTo(x - 46 * s + i * 15.3 * s, yy + (i % 2 ? -d * 17 : d * 2)); } g.lineTo(x + 46 * s, yy + d * 12); g.closePath(); g.fill(); g.stroke(); } });
    else if (mv === MOVES.press || mv === MOVES.acornbomb) fxAdd(0.55, (k) => { for (let i = 0; i < 14; i++) { const a = Math.PI + i / 13 * Math.PI; disc(x + Math.cos(a) * (20 + k * 90 * s), y + 40 - Math.abs(Math.sin(a)) * k * 18, (12 - k * 9) * s, `rgba(226,212,186,${0.85 * (1 - k)})`); } });
    else fxAdd(0.5, (k) => { for (let i = 0; i < 3; i++) slash(x + (i - 1) * 17 * s, y + (i - 1) * 3, 1.05 + (side === 'me' ? 0 : 1.04), 46 * s, k - i * 0.06, '#fff', 0.13); });
  } else if (t === 'leaf') fxAdd(0.6, (k) => { slash(x, y, 0.62, 66 * s, k, '#eaffc8', 0.11); slash(x, y, 2.52, 66 * s, k - 0.1, '#a6ee8e', 0.11); for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283, d = k * 80 * s; leafShape(x + Math.cos(a) * d, y + Math.sin(a) * d * 0.7 + k * k * 40, a + k * 9, 8 * (1 - k * 0.5), `rgba(130,205,100,${1 - k})`); } });
  else if (t === 'fire') fxAdd(0.7, (k) => { g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 22; i++) { const a = fh(i) * 6.283, d = Math.sqrt(k) * (20 + fh(i + 7) * 62) * s; glowDot(x + Math.cos(a) * d, y + Math.sin(a) * d * 0.55 - k * k * (40 + fh(i + 3) * 60), (6 + fh(i + 1) * 18) * (1 - k) * s + 2, i % 3 ? '255,110,35' : '255,220,100', 0.95 * (1 - k)); } });
  else if (t === 'water') fxAdd(0.65, (k) => { for (let i = 0; i < 24; i++) { const vx = (fh(i) - 0.5) * 190 * s, vy = -(60 + fh(i + 5) * 130) * s, px = x + vx * k, py = y + 12 + vy * k + 230 * k * k; g.fillStyle = `rgba(${i % 3 ? '150,215,255' : '240,250,255'},${1 - k * k})`; g.beginPath(); g.ellipse(px, py, 3.2 * s, (3.2 + Math.abs(vy + 460 * k) * 0.03) * s, Math.atan2(vy + 460 * k, vx) + Math.PI / 2, 0, 7); g.fill(); } ring(x, y + 36, 20 + k * 70 * s, 3 * (1 - k), `rgba(200,236,255,${1 - k})`); });
  else if (t === 'volt') fxAdd(0.48, (k) => { const sd = Math.floor(clock * 26); g.globalAlpha = k < 0.7 ? 1 : (1 - k) / 0.3; g.lineCap = 'round'; g.lineJoin = 'round'; for (const [w, c] of [[15 * s, 'rgba(255,230,90,.55)'], [6 * s, '#fff7a8'], [2.4, '#fff']]) { g.strokeStyle = c; g.lineWidth = w; zigzag(x + 26, -12, x, y + 6, sd, 70); } g.strokeStyle = '#aeeaff'; g.lineWidth = 2; for (let i = 0; i < 7; i++) { const a = i / 7 * 6.283 + sd; zigzag(x, y, x + Math.cos(a) * (40 + k * 50) * s, y + Math.sin(a) * (28 + k * 30) * s, sd + i * 11, 20); } g.globalAlpha = 1; });
  else if (t === 'metal') fxAdd(0.55, (k) => { const a = 1 - k; slash(x, y, 0, 76 * s, k, '#fff', 0.05); slash(x, y, 1.571, 60 * s, k, '#e6f0fa', 0.05); ring(x, y, 24 + k * 60 * s, 2.5 * a, `rgba(190,215,240,${a})`); for (let i = 0; i < 14; i++) { const an = fh(i) * 6.283, d = k * (50 + fh(i + 6) * 60) * s; g.strokeStyle = `rgba(255,226,150,${a})`; g.lineWidth = 2.2; g.beginPath(); g.moveTo(x + Math.cos(an) * d, y + Math.sin(an) * d * 0.8); g.lineTo(x + Math.cos(an) * (d + 10 * a), y + Math.sin(an) * (d + 10 * a) * 0.8); g.stroke(); } });
  bt.flash = { rgb: RGB, a: (r.eff > 1 || r.crit) ? 0.28 : r.eff < 1 ? 0.06 : 0.13, t0: clock };
  // ダメージの 数字と ひとこと
  const label = r.crit ? 'きゅうしょ!' : r.eff > 1 ? 'ばつぐん!' : r.eff < 1 ? 'いまひとつ' : '';
  fxAdd(1.25, (k) => { const pop = k < 0.14 ? 0.5 + k / 0.14 * 0.85 : k < 0.24 ? 1.35 - (k - 0.14) * 3.5 : 1, yy = y - 28 - ease(Math.min(1, k * 1.6)) * 24; g.globalAlpha = k < 0.75 ? 1 : (1 - k) / 0.25; txt(String(r.dmg), x + (side === 'me' ? -50 : 50), yy, { size: Math.round(27 * s * pop), w: 900, align: 'center', color: r.crit ? '#ffd34a' : r.eff > 1 ? '#ff9a6a' : '#fff', stroke: '#241c33', sw: 7 }); if (label) txt(label, x + (side === 'me' ? -50 : 50), yy + 26 * s, { size: Math.round(15 * s), w: 900, align: 'center', color: r.eff < 1 && !r.crit ? '#cfd8e4' : '#fff1b8', stroke: '#241c33', sw: 5 }); g.globalAlpha = 1; });
}
// へんか技: ふりかかる こな / 上がる・下がる しるし / かいふく
function statusFx(mv, side) {
  const tg = mv.tgt === 'self' ? side : side === 'me' ? 'foe' : 'me', [x, y] = BPOS[tg]; Aud.sfx('cast', mv.t);
  if (mv.status) { const c = mv.status === 'sleep' ? '196,160,240' : '250,226,100'; fxAdd(0.9, (k) => { for (let i = 0; i < 38; i++) { const t = clamp(k * 1.5 - fh(i) * 0.5, 0, 1); if (t <= 0 || t >= 1) continue; glowDot(x + (fh(i + 3) - 0.5) * 120 + Math.sin(t * 8 + i) * 8, y - 78 + t * 115, 3 + fh(i + 8) * 5, c, 0.95 * (1 - t * 0.6)); } }); return; }
  const up = mv.heal || (mv.stage && Object.values(mv.stage)[0] > 0), col = mv.heal ? '#a6f0a0' : up ? '#ffb45a' : '#8fc0ff';
  fxAdd(0.85, (k) => { for (let i = 0; i < 11; i++) { const t = clamp(k * 1.5 - i * 0.045, 0, 1); if (t <= 0 || t >= 1) continue; const px = x + (fh(i) - 0.5) * 110, py = y + (up ? 44 - t * 96 : -56 + t * 96); g.globalAlpha = Math.sin(t * 3.14); g.strokeStyle = '#241c33'; g.fillStyle = col; g.lineWidth = 2; g.beginPath(); if (mv.heal) { for (const [dx, dy] of [[-3, -10], [3, -10], [3, -3], [10, -3], [10, 3], [3, 3], [3, 10], [-3, 10], [-3, 3], [-10, 3], [-10, -3], [-3, -3]]) g.lineTo(px + dx * 0.9, py + dy * 0.9); } else { const d = up ? 1 : -1; g.moveTo(px, py - 11 * d); g.lineTo(px + 9, py); g.lineTo(px + 3.5, py); g.lineTo(px + 3.5, py + 10 * d); g.lineTo(px - 3.5, py + 10 * d); g.lineTo(px - 3.5, py); g.lineTo(px - 9, py); } g.closePath(); g.stroke(); g.fill(); g.globalAlpha = 1; } ring(x, y + 40 * (up ? 1 : -1) * (1 - k * 2), 46, 2.5 * (1 - k), col); });
}
async function dimBattle(to, dur = 0.18) { const from = bt.dim || 0; await anim(dur, (k) => { if (bt) bt.dim = lerp(from, to, k); }); }

// ---------- 強敵の カットイン(目もと) ----------
const boxes = {};
function spriteBox(sp, s) { // 絵の 中で、キャラが ある 範囲
  if (boxes[sp]) return boxes[sp];
  const c = Art.cv(s.width, s.height), cg = c.getContext('2d', { willReadFrequently: true }); cg.drawImage(s, 0, 0);
  const d = cg.getImageData(0, 0, c.width, c.height).data; let x0 = c.width, y0 = c.height, x1 = 0, y1 = 0;
  for (let y = 0; y < c.height; y += 3) for (let x = 0; x < c.width; x += 3) if (d[(y * c.width + x) * 4 + 3] > 80) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  return (boxes[sp] = x1 > x0 ? { x: x0, y: y0, w: x1 - x0, h: y1 - y0 } : { x: 0, y: 0, w: s.width, h: s.height });
}
// 目の 位置(絵の 範囲の中の 割合)と、寄る 大きさ
const EYES = { mikanya: [0.40, 0.34, 600], hotaruusagi: [0.50, 0.49, 560], pukurisu: [0.23, 0.645, 900], kinokokko: [0.50, 0.52, 640], hinatagaeru: [0.50, 0.56, 620], shizukufin: [0.50, 0.58, 620], himoriusagi: [0.49, 0.357, 600], yuuhineko: [0.235, 0.269, 950], birisuzume: [0.496, 0.421, 440] };
async function eyeCutin(mon, small, shiny) {
  const sp = mon.sp, base = SPECIES[sp].from || sp, [ex, ey, wide] = EYES[sp] || EYES[base] || [0.5, 0.42, 560], img = (shiny ? Art.shiny(sp) : Art.raw(sp)) || Art.sprites[sp], box = spriteBox(sp + (shiny ? '*' : ''), img);
  const col = TYPES[SPECIES[sp].t].color, t0 = clock; flushBtn(); ui.dialog = null;
  ui.overlay = () => {
    const t = (clock - t0) * Math.sqrt(bspd), inK = ease(clamp(t / 0.28, 0, 1)), out = ease(clamp((t - 1.5) / 0.22, 0, 1)), x0 = -OX, x1 = W + OX;
    g.fillStyle = `rgba(12,8,26,${0.55 * inK * (1 - out)})`; g.fillRect(x0, 0, VW, H);
    g.save(); g.translate((1 - inK) * -VW + out * VW, 0);
    const band = () => { g.beginPath(); g.moveTo(x0 - 4, 118); g.lineTo(x1 + 4, 76); g.lineTo(x1 + 4, 238); g.lineTo(x0 - 4, 280); g.closePath(); };
    band(); g.save(); g.clip(); g.fillStyle = '#1d1630'; g.fillRect(x0, 0, VW, H); g.globalAlpha = 0.55; g.fillStyle = col; g.fillRect(x0, 0, VW, H); g.globalAlpha = 1;
    for (let i = 0; i < 26; i++) { const y = 70 + fh(i) * 220, len = 70 + fh(i + 4) * 190, px = x1 - ((clock * (700 + fh(i + 2) * 900) + fh(i + 6) * 900) % (VW + len + 100)); g.fillStyle = `rgba(255,255,255,${0.18 + fh(i + 8) * 0.35})`; g.fillRect(px, y, len, 1 + fh(i + 1) * 3); }
    const k = wide / box.w * (1 + t * 0.045), fx = (box.x + box.w * ex) * k, fy = (box.y + box.h * ey) * k, drift = (1 - ease(clamp(t / 0.6, 0, 1))) * 140 - t * 12;
    g.drawImage(img, 430 + drift - fx, 178 - fy, img.width * k, img.height * k);
    const sh = g.createLinearGradient(x0, 0, x0 + VW * 0.6, 0); sh.addColorStop(0, 'rgba(20,14,36,.92)'); sh.addColorStop(1, 'rgba(20,14,36,0)'); g.fillStyle = sh; g.fillRect(x0, 0, VW, H); g.restore();
    g.strokeStyle = '#f6ead4'; g.lineWidth = 4; g.beginPath(); g.moveTo(x0 - 4, 118); g.lineTo(x1 + 4, 76); g.moveTo(x0 - 4, 280); g.lineTo(x1 + 4, 238); g.stroke();
    const tk = ease(clamp((t - 0.22) / 0.3, 0, 1)); g.globalAlpha = tk;
    txt(small, 36 - (1 - tk) * 60, 190, { size: 15, color: '#ffe7b0', stroke: '#140e24', sw: 5 });
    g.font = `800 38px "Shippori Mincho B1", serif`; g.textAlign = 'left'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.strokeStyle = '#140e24'; g.lineWidth = 8; const name = SPECIES[sp].n, nx = 34 - (1 - tk) * 90; g.strokeText(name, nx, 226); g.fillStyle = '#fbf0da'; g.fillText(name, nx, 226);
    g.globalAlpha = 1; g.restore();
  };
  Aud.sfx('cutin'); await sleep(0.3); Aud.cry(sp);
  const end = clock + 1.45 / Math.sqrt(bspd);
  while (clock < end) { await nextFrame(); if (btnQ.length) { btnQ.length = 0; if (clock - t0 > 0.5) break; } }
  ui.overlay = null; flushBtn();
}

// ---------- 勝利の 演出 ----------
async function victoryScene(trainer) {
  const t0 = clock; Aud.bgm(null); Aud.sfx('victory'); ui.dialog = null; flushBtn();
  ui.overlay = () => {
    const t = (clock - t0) * Math.sqrt(bspd), inK = ease(clamp(t / 0.3, 0, 1)), x0 = -OX, x1 = W + OX, big = !!trainer;
    g.save(); g.globalAlpha = inK;
    for (let i = 0; i < (big ? 34 : 18); i++) { const px = x0 + fh(i) * VW + Math.sin(t * 2 + i) * 14, py = -20 + ((t * (60 + fh(i + 2) * 90) + fh(i + 5) * 380) % 380); if (i % 3 === 0) Art.star(g, px, py, 3 + fh(i + 1) * 4, '#ffe9a0'); else leafShape(px, py, t * 3 + i, 6 + fh(i + 9) * 4, i % 2 ? '#f0b4a8' : '#a8d890'); }
    g.translate(W / 2, 62); g.rotate(-0.07); const e = inK; g.fillStyle = 'rgba(29,22,48,.9)'; g.fillRect(x0 - W / 2 - 60 - (1 - e) * VW, -29, VW + 120, 58); g.fillStyle = '#c25a62'; g.fillRect(x0 - W / 2 - 60 + (1 - e) * VW, 30, VW + 120, 5);
    const pop = t < 0.25 ? 1.7 - t * 2.8 : 1; g.scale(pop, pop); g.font = `800 36px "Shippori Mincho B1", serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#fbf0da'; g.fillText(big ? 'しょうり!' : 'やった!', 0, 1);
    g.restore();
  };
  const dur = trainer ? 1.7 : 1.0; let hops = 0;
  await anim(dur, (k) => { const h = k * (trainer ? 4 : 2.4); bt.ps.oy = -Math.abs(Math.sin(h * Math.PI)) * 26 * (1 - k * 0.5); if (Math.floor(h) >= hops && hops === 0 && k > 0.12) { hops = 1; Aud.cry(bt.me.sp); } });
  bt.ps.oy = 0; ui.overlay = null;
}

// ---------- おためし(?battle=1): いろいろな タイプと 演出を 見られる。セーブは 書きかえない ----------
async function battlePreview() {
  preview = true; S = newState(); S.bag = { ball: 5, potion: 5, cure: 2 };
  S.party = [mkMon('mikanya', 22), mkMon('hotaruusagi', 22), mkMon('shizukufin', 22), mkMon('pukurisu', 22), mkMon('hanedoron', 22), mkMon('sabikani', 22)];
  S.flags = { tip_catch: true, tip_trainer: true, tip_low: true };
  await fade(1, 0.3);
  await event(async () => {
    mode = 'field'; enterMap('town', 26, 14, 'u', true); await fade(0, 0.4);
    await say('バトルの おためし。「たたかう」で わざを えらんでね。\n「なかま」で こうたいすると、ほかの タイプの わざも 見られるよ。'); flushBtn();
    Aud.sfx('encounter'); await flashFx(2); await wipe(0.5);
    await runBattle({ trainer: { name: 'レン', boss: true, title: 'ひだまり町の あかり番', team: [], reward: 0 }, foes: [mkMon('kinokokko', 19), mkMon('hinatagaeru', 20)] });
    await fade(0, 0.4); await say('(おためし おわり。タイトルに もどります)'); await fade(1, 0.5);
  });
  location.href = location.pathname;
}
