'use strict';
// バトル・つかまえる・レベルアップ・なかま/バッグ/ずかんの画面
const stat = (b, lv, hp) => (hp ? Math.floor(b * 2 * lv / 50) + lv + 10 : Math.floor(b * 2 * lv / 50) + 5);
function mkMon(sp, lv) {
  const b = SPECIES[sp].base, m = { sp, lv, exp: lv ** 3, max: stat(b[0], lv, 1), atk: stat(b[1], lv), def: stat(b[2], lv), spd: stat(b[3], lv) };
  m.hp = m.max; m.pp = movesOf(m).map((id) => MOVES[id].pp); return m;
}
function recalc(m) { const b = SPECIES[m.sp].base, old = m.max; m.max = stat(b[0], m.lv, 1); m.atk = stat(b[1], m.lv); m.def = stat(b[2], m.lv); m.spd = stat(b[3], m.lv); m.hp += m.max - old; }
function defaultMoves(sp, lv) { const out = []; for (const [l, id] of SPECIES[sp].learn || []) if (l <= lv && !out.includes(id)) out.push(id); return out.slice(-4); }
const movesOf = (m) => m.moves || (m.moves = defaultMoves(m.sp, m.lv));
const relearnable = (m) => { const have = movesOf(m); return [...new Set((SPECIES[m.sp].learn || []).filter(([l]) => l <= m.lv).map(([, id]) => id))].filter((id) => !have.includes(id)); };
// 技をおぼえる。4つ いっぱいなら、どれかを わすれさせる(おぼえない、も選べる)
async function learnMove(m, id) {
  const mv = movesOf(m); if (mv.includes(id)) return false; m.pp = m.pp || [];
  if (mv.length < 4) { mv.push(id); m.pp[mv.length - 1] = MOVES[id].pp; Aud.sfx('get'); await say(`${nameOf(m)}は ${MOVES[id].n}を おぼえた!`); return true; }
  await say(`${nameOf(m)}は ${MOVES[id].n}を おぼえたい!\nでも わざが 4つ いっぱいだ。どれかを わすれさせる?`);
  const items = mv.map((x) => ({ label: MOVES[x].n, sub: `${TYPES[MOVES[x].t].name}  いりょく${MOVES[x].p || '―'}` })).concat([{ label: `${MOVES[id].n}は あきらめる` }]);
  prompt(`${MOVES[id].n}: ${TYPES[MOVES[id].t].name}  いりょく${MOVES[id].p || '―'}`, 300);
  const k = await choose(items, { x: 300, bottom: 354, w: 328, cancel: mv.length });
  if (k < 0 || k >= mv.length) { ui.dialog = null; await say(`${nameOf(m)}は ${MOVES[id].n}を おぼえずに おわった。`); return false; }
  ui.dialog = null; const old = mv[k]; mv[k] = id; m.pp[k] = MOVES[id].pp; Aud.sfx('get');
  await say(`1、2の… ポカン!\n${nameOf(m)}は ${MOVES[old].n}を わすれて、${MOVES[id].n}を おぼえた!`); return true;
}
const nameOf = (m) => SPECIES[m.sp].n, typeOf = (m) => SPECIES[m.sp].t;
function ensurePP(m) { const mv = movesOf(m); m.pp = m.pp || []; mv.forEach((id, i) => { if (m.pp[i] == null) m.pp[i] = MOVES[id].pp; }); }
const healAll = () => { for (const m of S.party) { m.hp = m.max; m.st = null; m.pp = movesOf(m).map((id) => MOVES[id].pp); } };
const effOf = (mt, dt) => (CHART[mt] && CHART[mt][dt]) || 1;
// 戦闘中だけの状態: 状態異常(st)と能力の上げ下げ(stg)
const resetBT = (m) => { m.stg = { atk: 0, def: 0, spd: 0 }; m.st = null; m.sleepT = 0; m.endured = false; };
const clearBT = (m) => { m.st = null; m.sleepT = 0; delete m.stg; };
const sm = (s) => (s >= 0 ? (2 + s) / 2 : 2 / (2 - s));
const eAtk = (m) => m.atk * sm(m.stg ? m.stg.atk : 0) * (m.st === 'burn' ? 0.5 : 1);
const eDef = (m) => m.def * sm(m.stg ? m.stg.def : 0);
const abOf = (m) => SPECIES[m.sp].ab;
const eSpd = (m) => m.spd * sm(m.stg ? m.stg.spd : 0) * (m.st === 'para' ? 0.5 : 1) * (abOf(m) === 'rotor' ? 1.15 : 1);
function calcDmg(a, d, mv) {
  const base = Math.floor(((2 * a.lv / 5 + 2) * mv.p * eAtk(a) / eDef(d)) / 50) + 2;
  const stab = typeOf(a) === mv.t ? 1.5 : 1, eff = effOf(mv.t, typeOf(d)), crit = Math.random() < 0.0625 + (S.party.includes(a) && bondLv(a) >= 3 ? 0.08 : 0);
  const abA = abOf(a) === 'lantern' && mv.t === 'fire' && a.hp < a.max / 3 ? 1.3 : 1, abD = (abOf(d) === 'acornhat' ? 0.9 : 1) * (abOf(d) === 'insulate' && mv.t === 'volt' ? 0.5 : 1);
  const dm = S.party.includes(d) ? DIFF[diff].take : 1;
  return { dmg: Math.max(1, Math.floor(base * stab * eff * abA * abD * dm * (0.85 + Math.random() * 0.15) * (crit ? 1.5 : 1))), eff, crit };
}
const markSeen = (sp) => { S.seen[sp] = true; };

// ---------- バトル画面 ----------
let bt = null;
const ss = () => ({ ox: 0, oy: 0, sx: 1, sy: 1, a: 1, flash: 0, vis: true, rot: 0 });
const tmpC = document.createElement('canvas'); tmpC.width = tmpC.height = 384; const tmp = tmpC.getContext('2d');
const WIDE_K = { kirikamome: 1.24, funenko: 1.12, sabikani: 1.1 }, FLOAT = { kirikamome: 20, hanedoron: 18, funenko: 9 }; // 飛ぶ・うかぶ 子の 高さ
function drawMon(sp, cx, bot, size, st, seed, isShiny) {
  const spr = isShiny ? (Art.shiny(sp) || Art.sprites[sp]) : Art.sprites[sp]; if (!spr || !st.vis || st.a <= 0) return;
  size *= SPECIES[sp].from ? 1.14 : WIDE_K[sp] || 1; // 進化した 子は ひとまわり、横に 広い 子は すこし 大きく
  const br = Math.sin(clock * 2.3 + seed), k = size / 192;
  g.save(); g.globalAlpha = clamp(st.a, 0, 1);
  g.fillStyle = 'rgba(40,80,30,.25)'; g.beginPath(); g.ellipse(cx + st.ox * 0.7, bot - 2, size * 0.37 * Math.max(0.2, st.sx), size * 0.065, 0, 0, 7); g.fill();
  g.translate(cx + st.ox, bot + st.oy - (FLOAT[sp] ? (FLOAT[sp] + Math.sin(clock * 2.1 + seed) * 3.5) * size / 150 : 0)); g.rotate(st.rot); g.scale((1 - 0.014 * br) * st.sx, (1 + 0.024 * br) * st.sy);
  if (st.flash > 0) {
    tmp.globalCompositeOperation = 'source-over'; tmp.clearRect(0, 0, 384, 384); tmp.drawImage(spr, 0, 0, 384, 384);
    tmp.globalCompositeOperation = 'source-atop'; tmp.fillStyle = `rgba(255,255,255,${st.flash})`; tmp.fillRect(0, 0, 384, 384); tmp.globalCompositeOperation = 'source-over';
    g.drawImage(tmpC, -96 * k, -183 * k, 192 * k, 192 * k);
  } else g.drawImage(spr, -96 * k, -183 * k, 192 * k, 192 * k);
  g.restore();
}
// 場所ごとのバトル背景: field(草原)、dusk(夕方の町)、neon(近未来の団地)
function platforms(rim, t0, t1, glow) {
  for (const [x, y, rx, ry] of [[462, 170, 100, 21], [158, 264, 124, 27]]) {
    if (glow) { g.save(); g.shadowColor = glow; g.shadowBlur = 16; }
    g.fillStyle = rim; g.beginPath(); g.ellipse(x, y + 6, rx, ry, 0, 0, 7); g.fill();
    if (glow) g.restore();
    const pg = g.createLinearGradient(0, y - ry, 0, y + ry); pg.addColorStop(0, t0); pg.addColorStop(1, t1); g.fillStyle = pg; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 7); g.fill();
  }
}
function groundShape(c0, c1) { const gr = g.createLinearGradient(0, 190, 0, H); gr.addColorStop(0, c0); gr.addColorStop(1, c1); g.fillStyle = gr; g.beginPath(); g.moveTo(0, 214); g.quadraticCurveTo(320, 176, W, 214); g.lineTo(W, H); g.lineTo(0, H); g.closePath(); g.fill(); }
function battleBG() {
  const th = bt && bt.theme;
  if (th === 'dusk') {
    const sky = g.createLinearGradient(0, 0, 0, 230); sky.addColorStop(0, '#8696ae'); sky.addColorStop(0.7, '#e6cdb6'); sky.addColorStop(1, '#f3d5b0'); g.fillStyle = sky; g.fillRect(0, 0, W, 230);
    const sun = g.createRadialGradient(110, 190, 6, 110, 190, 170); sun.addColorStop(0, 'rgba(255,196,130,.9)'); sun.addColorStop(1, 'rgba(255,196,130,0)'); g.fillStyle = sun; g.fillRect(0, 40, 340, 190);
    g.fillStyle = 'rgba(255,230,220,.5)'; for (let i = 0; i < 3; i++) { const x = ((i * 250 + clock * (6 + i * 2)) % 820) - 120, y = 36 + i * 30; g.beginPath(); g.ellipse(x, y, 60, 12, 0, 0, 7); g.ellipse(x + 30, y - 8, 36, 12, 0, 0, 7); g.fill(); }
    for (let i = 0; i < 22; i++) { const w = 34, h = 38 + ((i * 37) % 64), x = i * 30 - 6; g.fillStyle = i % 2 ? '#6f7690' : '#7a809a'; g.fillRect(x, 210 - h, w, h + 20); for (let k = 0; k < 4; k++) if ((i * 7 + k * 3) % 5 === 0) { g.fillStyle = '#ffd9a0'; g.fillRect(x + 6 + (k % 2) * 14, 214 - h + k * 14, 8, 6); } }
    g.strokeStyle = 'rgba(40,36,54,.7)'; g.lineWidth = 1.5; for (const [y0, sag] of [[60, 24], [74, 20]]) { g.beginPath(); g.moveTo(-10, y0); g.quadraticCurveTo(W / 2, y0 + sag, W + 10, y0); g.stroke(); }
    groundShape('#bdb7ac', '#8f8a81'); g.fillStyle = 'rgba(240,235,222,.55)'; for (let x = 10; x < W; x += 96) g.fillRect(x, 318, 52, 5);
    platforms('#7d776e', '#d8d2c5', '#b9b3a6'); return;
  }
  if (th === 'harbor') {
    const sky = g.createLinearGradient(0, 0, 0, 230); sky.addColorStop(0, '#9fb0bc'); sky.addColorStop(1, '#e4e8e6'); g.fillStyle = sky; g.fillRect(0, 0, W, 230);
    g.fillStyle = 'rgba(240,244,246,.55)'; for (let i = 0; i < 4; i++) { const x = ((i * 220 + clock * (5 + i * 2)) % 820) - 120, y = 40 + i * 34; g.beginPath(); g.ellipse(x, y, 90, 14, 0, 0, 7); g.fill(); }
    g.fillStyle = '#7f929e'; g.fillRect(0, 150, W, 70); g.strokeStyle = 'rgba(230,240,244,.5)'; g.lineWidth = 2; for (let i = 0; i < 10; i++) { const x = (i * 89) % W, y = 156 + (i * 23) % 56; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 14, y - 4, x + 28, y); g.stroke(); }
    g.fillStyle = '#e6e2d8'; g.beginPath(); g.moveTo(40, 200); g.lineTo(52, 80); g.lineTo(70, 80); g.lineTo(82, 200); g.closePath(); g.fill(); g.fillStyle = '#c4574c'; g.fillRect(50, 100, 22, 16); g.fillRect(48, 140, 26, 16); g.fillStyle = '#4b4f5c'; g.fillRect(48, 66, 26, 16);
    groundShape('#9d9384', '#766c5e'); g.strokeStyle = 'rgba(60,50,40,.3)'; g.lineWidth = 2; for (let x = 0; x < W; x += 52) { g.beginPath(); g.moveTo(x, 230); g.lineTo(x - 20, H); g.stroke(); }
    platforms('#5b5348', '#cdbfa6', '#a89a82'); return;
  }
  if (th === 'mountain') {
    const sky = g.createLinearGradient(0, 0, 0, 230); sky.addColorStop(0, '#2a3260'); sky.addColorStop(0.6, '#6f5f8a'); sky.addColorStop(1, '#d69c8c'); g.fillStyle = sky; g.fillRect(0, 0, W, 230);
    for (let i = 0; i < 36; i++) Art.star(g, (i * 107) % W, (i * 41) % 96, 1 + (i % 3) * 0.5, `rgba(255,244,214,${0.35 + 0.4 * Math.abs(Math.sin(clock + i))})`);
    g.fillStyle = '#48466e'; g.beginPath(); g.moveTo(0, 176); g.lineTo(110, 74); g.lineTo(230, 160); g.lineTo(370, 56); g.lineTo(520, 168); g.lineTo(600, 108); g.lineTo(W, 150); g.lineTo(W, 230); g.lineTo(0, 230); g.fill();
    g.fillStyle = '#7d7a92'; g.beginPath(); g.moveTo(250, 214); g.lineTo(268, 150); g.lineTo(470, 150); g.lineTo(488, 214); g.fill(); g.fillStyle = '#9b98ac'; g.fillRect(268, 146, 202, 6); g.fillStyle = '#585670'; for (let x = 290; x < 460; x += 40) g.fillRect(x, 156, 5, 56);
    g.fillStyle = '#26303a'; for (let i = 0; i < 22; i++) { const x = i * 31 - 6, h = 26 + ((i * 17) % 34); g.beginPath(); g.moveTo(x, 214 - h); g.lineTo(x + 14, 216); g.lineTo(x - 14, 216); g.fill(); }
    groundShape('#7c756e', '#58524e'); g.strokeStyle = 'rgba(40,36,40,.25)'; g.lineWidth = 2; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(0, 234 + i * 22); g.lineTo(W, 230 + i * 22); g.stroke(); }
    platforms('#4f4a52', '#c3bab0', '#948b82'); return;
  }
  if (th === 'neon') {
    const sky = g.createLinearGradient(0, 0, 0, 230); sky.addColorStop(0, '#4a4878'); sky.addColorStop(0.7, '#b58cb8'); sky.addColorStop(1, '#f0c4c0'); g.fillStyle = sky; g.fillRect(0, 0, W, 230);
    g.fillStyle = 'rgba(255,255,255,.5)'; for (let i = 0; i < 40; i++) g.fillRect((i * 97) % W, (i * 53) % 110, 2, 2);
    for (const x of [90, 250, 560]) { g.fillStyle = '#4b4770'; g.fillRect(x, 120, 5, 90); g.fillRect(x - 14, 128, 33, 4); g.fillStyle = '#ff7a9a'; g.fillRect(x - 1, 112, 7, 7); }
    for (const [x, w] of [[20, 150], [340, 130], [470, 170]]) { g.fillStyle = 'rgba(150,230,210,.45)'; g.beginPath(); g.moveTo(x, 214); g.lineTo(x, 190); g.lineTo(x + w / 2, 162); g.lineTo(x + w, 190); g.lineTo(x + w, 214); g.closePath(); g.fill(); g.strokeStyle = 'rgba(60,110,110,.6)'; g.lineWidth = 2; g.stroke(); }
    g.strokeStyle = 'rgba(124,240,255,.75)'; g.lineWidth = 1.6; for (const [y0, sag] of [[96, 26], [112, 22]]) { g.beginPath(); g.moveTo(-10, y0); g.quadraticCurveTo(W / 2, y0 + sag, W + 10, y0); g.stroke(); }
    for (const [x, y] of [[180, 130], [520, 90]]) { g.fillStyle = '#3d3a52'; g.fillRect(x - 10, y, 20, 7); g.fillRect(x - 18, y - 4, 12, 2); g.fillRect(x + 6, y - 4, 12, 2); g.fillStyle = '#ff7a9a'; g.fillRect(x - 2, y + 7, 4, 3); }
    groundShape('#8fa090', '#667a6c');
    g.strokeStyle = 'rgba(124,240,255,.55)'; g.lineWidth = 2; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(0, 232 + i * 20); g.lineTo(W, 232 + i * 20 - 6); g.stroke(); }
    platforms('#3f9a96', '#d2e6e0', '#a4c8c0', 'rgba(124,240,255,.8)'); return;
  }
  const sky = g.createLinearGradient(0, 0, 0, 200); sky.addColorStop(0, '#a3c4d8'); sky.addColorStop(1, '#e9f0f2'); g.fillStyle = sky; g.fillRect(0, 0, W, 230);
  const sun = g.createRadialGradient(560, 40, 4, 560, 40, 90); sun.addColorStop(0, 'rgba(255,250,200,.9)'); sun.addColorStop(1, 'rgba(255,250,200,0)'); g.fillStyle = sun; g.fillRect(430, 0, 210, 140);
  g.fillStyle = 'rgba(255,255,255,.85)';
  for (let i = 0; i < 4; i++) { const x = ((i * 190 + clock * (7 + i * 2)) % 820) - 110, y = 28 + (i * 37) % 70; g.beginPath(); g.ellipse(x, y, 52, 15, 0, 0, 7); g.ellipse(x + 26, y - 9, 34, 15, 0, 0, 7); g.ellipse(x - 26, y + 2, 28, 11, 0, 0, 7); g.fill(); }
  g.fillStyle = '#c3d8b0'; g.beginPath(); g.ellipse(120, 215, 280, 60, 0, 0, 7); g.ellipse(520, 222, 300, 62, 0, 0, 7); g.fill();
  g.fillStyle = '#8fb88a'; for (const [x, y, r] of [[60, 168, 17], [96, 160, 22], [136, 170, 16], [560, 164, 20], [598, 172, 15], [300, 176, 14]]) { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
  const gr = g.createLinearGradient(0, 190, 0, H); gr.addColorStop(0, '#aacb8c'); gr.addColorStop(1, '#78ab62'); g.fillStyle = gr; g.beginPath(); g.moveTo(0, 214); g.quadraticCurveTo(320, 176, W, 214); g.lineTo(W, H); g.lineTo(0, H); g.closePath(); g.fill();
  for (let i = 0; i < 18; i++) { const x = (i * 97) % 640, y = 230 + (i * 53) % 110; Art.star(g, x, y, 3.2, i % 3 ? 'rgba(255,255,255,.6)' : 'rgba(255,226,120,.8)'); }
  for (const [x, y, rx, ry] of [[462, 170, 100, 21], [158, 264, 124, 27]]) {
    g.fillStyle = '#6f9a5e'; g.beginPath(); g.ellipse(x, y + 6, rx, ry, 0, 0, 7); g.fill();
    const pg = g.createLinearGradient(0, y - ry, 0, y + ry); pg.addColorStop(0, '#d4e5bb'); pg.addColorStop(1, '#a6c986'); g.fillStyle = pg; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 7); g.fill();
  }
}
function infoBox(x, y, w, m, shown, me, expF) {
  const stg = m.stg ? Object.entries(m.stg).filter(([, v]) => v) : [], base = me ? 74 : 54, extra = stg.length ? 15 : 0;
  panel(x, y, w, base + extra, { fill: 'rgba(250,248,245,.96)' });
  txt((m.shiny ? '★' : '') + nameOf(m), x + 14, y + 17, { size: 16 });
  txt('Lv' + m.lv, x + w - 14, y + 17, { size: 14, align: 'right', color: MUTED });
  const t = TYPES[typeOf(m)], cx = x + 14 + Math.min(120, nameW((m.shiny ? '★' : '') + nameOf(m))) + 6; g.fillStyle = t.color; rr(cx, y + 10, 40, 15, 7); g.fill(); txt(t.name, cx + 20, y + 18, { size: 10, color: '#fff', align: 'center' });
  if (m.st) { const S2 = STATUS[m.st]; g.fillStyle = S2.color; rr(cx + 44, y + 10, 40, 15, 7); g.fill(); txt(S2.n, cx + 64, y + 18, { size: 10, color: '#fff', align: 'center' }); }
  const f = shown / m.max, c = hpColor(f);
  txt('HP', x + 14, y + 38, { size: 11, color: '#c0504a', w: 900 }); bar(x + 36, y + 32, w - 52, 11, f, c[0], c[1]);
  if (me) { txt(`${Math.ceil(shown)} / ${m.max}`, x + w - 14, y + 54, { size: 13, align: 'right' }); txt('けいけん', x + 14, y + 63, { size: 10, color: MUTED }); bar(x + 62, y + 59, w - 76, 6, expF, '#9fd6ff', '#5aa9ff'); }
  if (stg.length) txt(stg.map(([k, v]) => `${STAT_N[k].slice(0, 2)}${v > 0 ? '▲' : '▼'}${Math.abs(v)}`).join('  '), x + 14, y + base + 6, { size: 11, color: MUTED });
}
const nameW = (s) => { g.font = `700 16px ${FONT}`; return g.measureText(s).width; };
function drawFx() {
  for (const f of bt.fx) {
    const k = (clock - f.t0) / f.d; if (k < 0 || k > 1) continue;
    if (f.draw) { g.save(); f.draw(k); g.restore(); continue; }
    g.save(); g.globalAlpha = 1 - k * k;
    for (let i = 0; i < 9; i++) {
      const a = i / 9 * 6.283 + f.t0 * 3, r = 10 + k * 46;
      if (f.type === 'fire') { g.fillStyle = i % 2 ? '#ff8a3c' : '#ffd24a'; g.beginPath(); g.arc(f.x + Math.cos(a) * r * 0.7, f.y - k * 40 + Math.sin(a) * r * 0.4, 9 * (1 - k * 0.6), 0, 7); g.fill(); }
      else if (f.type === 'water') { g.fillStyle = i % 2 ? '#7cc8ff' : '#c4eaff'; g.beginPath(); g.ellipse(f.x + Math.cos(a) * r * 0.8, f.y + Math.sin(a) * r * 0.3 + k * k * 50, 6, 9, 0, 0, 7); g.fill(); }
      else if (f.type === 'leaf') { g.fillStyle = i % 2 ? '#6fd37a' : '#a6ee8e'; g.save(); g.translate(f.x + Math.cos(a + k * 4) * r, f.y + Math.sin(a + k * 4) * r * 0.6); g.rotate(a + k * 5); g.beginPath(); g.ellipse(0, 0, 11, 5, 0, 0, 7); g.fill(); g.restore(); }
      else Art.star(g, f.x + Math.cos(a) * r, f.y + Math.sin(a) * r * 0.8, 9 * (1 - k * 0.5), i % 2 ? '#fff6b0' : '#ffd24a');
    }
    g.restore();
  }
  bt.fx = bt.fx.filter((f) => clock - f.t0 < f.d);
}
function drawBattle() {
  const b = bt; if (!b) return;
  battleBG(); drawBattleSky();
  if (b.dim > 0.01) { g.fillStyle = `rgba(14,10,30,${b.dim})`; g.fillRect(0, 0, W, H); } // 技の あいだは 背景を 暗く
  if (b.foe) drawMon(b.foe.sp, 462, 168, 122, b.es, 1.3, b.foe.shiny);
  if (b.me) drawMon(b.me.sp, 158, 262, 156, b.ps, 0, b.me.shiny);
  drawMonMood(b.foe, b.es, 508, 56); drawMonMood(b.me, b.ps, 214, 110);
  if (b.ball && b.ball.vis) Art.ball(g, b.ball.x, b.ball.y, b.ball.r || 14, b.ball.rot);
  drawFx();
  if (b.flash) { const k = (clock - b.flash.t0) / 0.22; if (k < 1) { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(${b.flash.rgb},${b.flash.a * (1 - k)})`; g.fillRect(0, 0, W, H); g.restore(); } else b.flash = null; }
  if (b.foe && b.showInfo) infoBox(14, 14, 236, b.foe, b.hpE, false);
  if (b.me && b.showInfo) { b.expF += (b.expT - b.expF) * 0.14; infoBox(376, 192, 252, b.me, b.hpM, true, b.expF); }
}
const expFrac = (m) => (m.exp - m.lv ** 3) / ((m.lv + 1) ** 3 - m.lv ** 3);
const fname = () => (bt.trainer ? `${bt.trainer.name}の ${nameOf(bt.foe)}` : `やせいの ${nameOf(bt.foe)}`);
function addFx(type, x, y, d = 0.6) { bt.fx.push({ type, x, y, t0: clock, d: d / bspd }); }
async function tweenHP(side, to) {
  const b = bt, key = side === 'me' ? 'hpM' : 'hpE', from = b[key]; const dur = Math.min(0.9, 0.25 + Math.abs(to - from) / 40);
  await anim(dur, (k) => { b[key] = lerp(from, to, ease(k)); });
}
const firstAlive = () => S.party.find((m) => m.hp > 0);
async function popIn(st) { st.vis = true; Aud.sfx('warp'); if (bt && bt.me) setTimeout(() => bt && Aud.cry((st === bt.ps ? bt.me : bt.foe).sp), 220); await anim(0.45, (k) => { const e = k < 0.7 ? ease(k / 0.7) * 1.12 : 1.12 - (k - 0.7) / 0.3 * 0.12; st.sx = st.sy = e; st.a = Math.min(1, k * 2); st.flash = (1 - k) * 0.8; }); st.sx = st.sy = 1; st.a = 1; st.flash = 0; }
async function slideIn(st) { st.vis = true; st.a = 1; await anim(0.55, (k) => { st.ox = (1 - ease(k)) * 280; }); st.ox = 0; Aud.cry(bt.foe.sp); }

const keyOf = (m) => (m === bt.me ? 'hpM' : 'hpE');
const nm = (m) => (m === bt.me ? nameOf(m) : fname());
const statusText = { sleep: 'ねむってしまった!', para: 'からだが しびれて うごきにくくなった!', burn: 'やけどを おった!' };
async function applyStatus(T, s) {
  if (T.st) return false;
  if ((s === 'sleep' && abOf(T) === 'drowsy') || (s === 'para' && abOf(T) === 'ironhull')) { await msg(`${nm(T)}の とくせい「${ABIL[abOf(T)].n}」で ${STATUS[s].n}に ならない!`, 0.9); return false; }
  if (s === 'burn' && typeOf(T) === 'fire') return false;
  if (s === 'para' && typeOf(T) === 'volt') return false;
  T.st = s; if (s === 'sleep') T.sleepT = rint(1, 3);
  const ts = T === bt.me ? bt.ps : bt.es; addFx(s === 'burn' ? 'fire' : 'star', T === bt.me ? 158 : 462, T === bt.me ? 215 : 118, 0.6); Aud.sfx('weak');
  await msg(`${nm(T)}は ${statusText[s]}`, 0.8); return true;
}
async function changeStage(T, stat, d) {
  const cur = T.stg[stat];
  if ((d > 0 && cur >= 6) || (d < 0 && cur <= -6)) { await msg(`${nm(T)}の ${STAT_N[stat]}は もう ${d > 0 ? 'あがらない' : 'さがらない'}!`, 0.7); return; }
  T.stg[stat] = clamp(cur + d, -6, 6); Aud.sfx(d > 0 ? 'heal' : 'weak'); addFx('star', T === bt.me ? 158 : 462, T === bt.me ? 215 : 118, 0.5);
  await msg(`${nm(T)}の ${STAT_N[stat]}が ${Math.abs(d) > 1 ? 'ぐーんと ' : ''}${d > 0 ? 'あがった' : 'さがった'}!`, 0.8);
}
const accMult = (m) => (['clear', 'mist'].includes(abOf(m)) ? 0.9 : 1);
async function statusMove(side, A, D, mv, as) {
  const dir = side === 'me' ? 1 : -1;
  await anim(0.25, (k) => { as.oy = -16 * Math.sin(k * 3.14); });
  as.oy = 0; Aud.cry(A.sp);
  if (mv.tgt === 'foe' && Math.random() * 100 >= mv.a * accMult(D)) { Aud.sfx('miss'); await msg('しかし うまくいかなかった!', 0.7); return; }
  const T = mv.tgt === 'self' ? A : D;
  statusFx(mv, side); await sleep(0.5);
  if (mv.status) { if (!(await applyStatus(T, mv.status))) await msg('しかし うまくいかなかった!', 0.7); }
  if (mv.stage) for (const [k, v] of Object.entries(mv.stage)) await changeStage(T, k, v);
  if (mv.heal) {
    if (A.hp >= A.max) { await msg('しかし HPは まんたんだ!', 0.7); return; }
    A.hp = Math.min(A.max, A.hp + Math.floor(A.max * mv.heal)); Aud.sfx('heal'); addFx('star', side === 'me' ? 158 : 462, side === 'me' ? 215 : 118, 0.6);
    const key = keyOf(A), from = bt[key]; await anim(0.5, (k) => { bt[key] = lerp(from, A.hp, ease(k)); }); bt[key] = A.hp;
    await msg(`${nm(A)}は HPを かいふくした!`, 0.8);
  }
}
async function doMove(side, A, D, mv) {
  const b = bt, as = side === 'me' ? b.ps : b.es, ds = side === 'me' ? b.es : b.ps;
  const an = nm(A);
  if (A.st === 'sleep') {
    if (A.sleepT > 0) { A.sleepT--; Aud.sfx('miss'); await msg(`${an}は ぐうぐう ねむっている…`, 0.8); return; }
    A.st = null; await msg(`${an}は めを さました!`, 0.7);
  }
  if (A.st === 'para' && Math.random() < 0.25) { await msg(`${an}は からだが しびれて うごけない!`, 0.8); return; }
  await msg(`${an}の ${mv.n}!`, 0.2);
  if (mv.cat === 's') { await statusMove(side, A, D, mv, as); return; }
  const dir = side === 'me' ? 1 : -1;
  await dimBattle(mv.p >= 55 ? 0.5 : 0.3);
  await anim(0.16, (k) => { as.ox = dir * 38 * Math.sin(k * 1.57); as.oy = -dir * 12 * Math.sin(k * 1.57); });
  const dodged = D === b.me && bondLv(D) >= 2 && Math.random() < 0.08;
  const missed = dodged || Math.random() * 100 >= mv.a * accMult(D);
  await sleep(castFx(mv, side, missed));
  if (missed) {
    dimBattle(0);
    await anim(0.2, (k) => { as.ox = dir * 38 * (1 - k); as.oy = -dir * 12 * (1 - k); }); as.ox = as.oy = 0;
    Aud.sfx('miss'); if (dodged) { await anim(0.2, (k) => { ds.ox = -dir * 30 * Math.sin(k * 3.14); }); ds.ox = 0; await msg(`${nameOf(D)}は あなたの こえに こたえて、ひらりと よけた! ♥`, 0.8); } else await msg('しかし こうげきは はずれた!', 0.6); return;
  }
  const r = calcDmg(A, D, mv), tx = side === 'me' ? 462 : 158, ty = side === 'me' ? 118 : 218;
  S.effSeen = S.effSeen || {}; S.effSeen[mv.t + '>' + typeOf(D)] = r.eff; // いちど体験した相性は おぼえる
  if (D === b.me && bondLv(D) >= 4 && !D.endured && D.hp > 1 && D.hp - r.dmg <= 0) { r.dmg = D.hp - 1; D.endured = true; r.endure = true; }
  impactFx(mv, side, r);
  Aud.sfx(r.eff > 1 ? 'super' : r.eff < 1 ? 'weak' : 'hit'); if (r.eff > 1 || r.crit) ui.shake = 10; else if (r.eff === 1) ui.shake = 4;
  ds.flash = 0.95; await sleep(r.eff > 1 || r.crit ? 0.16 : 0.07); // 当たった しゅんかん、一瞬 止める
  dimBattle(0, 0.35);
  const key = side === 'me' ? 'hpE' : 'hpM'; D.hp = Math.max(0, D.hp - r.dmg);
  const hp0 = b[key], hp1 = D.hp;
  await anim(0.3, (k) => {
    as.ox = dir * 38 * (1 - k); as.oy = -dir * 12 * (1 - k);
    ds.ox = Math.sin(k * 40) * 7 * (1 - k); ds.flash = k < 0.8 ? (Math.floor(k * 10) % 2 ? 0.9 : 0.1) : 0;
    b[key] = lerp(hp0, hp1, ease(k));
  });
  as.ox = as.oy = 0; ds.ox = 0; ds.flash = 0; b[key] = hp1;
  if (r.endure) await msg(`${nameOf(D)}は あなたの ために こらえた! ♥`, 0.9);
  if (r.crit) await msg('きゅうしょに あたった!', 0.4);
  if (r.eff > 1) await msg('こうかは ばつぐんだ!', 0.6); else if (r.eff < 1) await msg('こうかは いまひとつのようだ…', 0.6);
  if (D.hp > 0 && A.hp > 0) {
    const ad = abOf(D);
    if (ad === 'fluff' && mv.t === 'normal' && Math.random() < 0.3) { await msg(`${nm(D)}の とくせい「${ABIL.fluff.n}」!`, 0.5); await changeStage(A, 'spd', -1); }
    else if (ad === 'static' && mv.t === 'normal' && Math.random() < 0.3 && typeOf(A) !== 'volt' && !A.st) { await msg(`${nm(D)}の とくせい「${ABIL.static.n}」!`, 0.5); await applyStatus(A, 'para'); }
    else if (ad === 'rustarmor' && Math.random() < 0.25) { await msg(`${nm(D)}の とくせい「${ABIL.rustarmor.n}」!`, 0.5); await changeStage(A, 'atk', -1); }
  }
  if (D.hp > 0 && mv.fx && Math.random() < mv.fx.c) {
    if (mv.fx.status) await applyStatus(D, mv.fx.status);
    else if (mv.fx.stage) for (const [k, v] of Object.entries(mv.fx.stage)) await changeStage(D, k, v);
  }
}
// ターンの終わり: やけどのダメージ。たおれたら結果を返す
async function residual() {
  const b = bt;
  for (const side of ['me', 'foe']) {
    const m = side === 'me' ? b.me : b.foe;
    if (m.hp > 0 && abOf(m) === 'sunlover' && m.hp < m.max) {
      m.hp = Math.min(m.max, m.hp + Math.max(1, Math.floor(m.max / 16))); Aud.sfx('heal');
      await tweenHP(side, m.hp); await msg(`${nm(m)}は とくせい「${ABIL.sunlover.n}」で すこし かいふくした!`, 0.6);
    }
    if (m.hp > 0 && m.st === 'burn') {
      const dmg = Math.max(1, Math.floor(m.max / 8)); m.hp = Math.max(0, m.hp - dmg);
      Aud.sfx('weak'); addFx('fire', side === 'me' ? 158 : 462, side === 'me' ? 225 : 130, 0.5);
      await msg(`${nm(m)}は やけどの ダメージを うけた!`, 0.3); await tweenHP(side, m.hp); await sleep(0.3);
      if (m.hp <= 0) return await afterFaint(side);
    }
  }
  return null;
}
async function faintAnim(side) {
  const st = side === 'me' ? bt.ps : bt.es; Aud.sfx('faint'); Aud.cry((side === 'me' ? bt.me : bt.foe).sp, true);
  await anim(0.7, (k) => { st.oy = 52 * ease(k); st.a = 1 - k; st.sy = 1 - 0.35 * k; });
  st.vis = false; st.oy = 0; st.a = 1; st.sy = 1;
}
function foeChoose() {
  const b = bt, A = b.foe, D = b.me, mvs = movesOf(A).map((id) => MOVES[id]);
  const w = mvs.map((m) => {
    if (m.cat !== 's') return m.p * effOf(m.t, typeOf(D)) * (typeOf(A) === m.t ? 1.3 : 1);
    if (m.status) return D.st || (m.status === 'burn' && typeOf(D) === 'fire') || (m.status === 'para' && typeOf(D) === 'volt') ? 0 : 38;
    if (m.heal) return A.hp < A.max * 0.5 ? 90 : 0;
    if (m.stage) { const [k, d] = Object.entries(m.stage)[0], T = m.tgt === 'self' ? A : D, cur = T.stg[k]; return (d > 0 && cur >= 2) || (d < 0 && cur <= -2) ? 0 : 28; }
    return 20;
  });
  const sum = w.reduce((s, x) => s + x, 0); if (sum <= 0) return mvs.find((m) => m.cat !== 's') || mvs[0];
  let r = Math.random() * sum; for (let i = 0; i < mvs.length; i++) { r -= w[i]; if (r <= 0) return mvs[i]; }
  return mvs[0];
}
async function levelUp(m, active) {
  const old = { max: m.max, atk: m.atk, def: m.def, spd: m.spd };
  m.lv++; m.evoSkip = false; recalc(m); Aud.sfx('levelup');
  if (active) { bt.hpM = m.hp; bt.expF = 0; bt.expT = expFrac(m); }
  await msg(`${nameOf(m)}は レベル${m.lv}に あがった!`, 0.9);
  await msg(`HP+${m.max - old.max}  こうげき+${m.atk - old.atk}  ぼうぎょ+${m.def - old.def}  すばやさ+${m.spd - old.spd}`, 1.2);
  for (const [l, id] of SPECIES[m.sp].learn || []) if (l === m.lv) { ui.dialog = null; await learnMove(m, id); }
}
async function giveExp(m, amt) {
  const b = bt; await msg(`${nameOf(m)}は ${amt}ポイントの けいけんちを もらった!`, 0.7);
  m.exp += amt;
  while (m.lv < GAME.maxLevel && m.exp >= (m.lv + 1) ** 3) { b.expT = 1; await sleep(0.55); await levelUp(m, m === b.me); }
  b.expT = expFrac(m);
  await sleep(0.45);
}
async function pickPartyForced() {
  for (;;) {
    const i = await partyScreen({ title: 'だれを だす?', cancel: false, validate: (i) => (S.party[i].hp <= 0 ? 'もう たたかえない!' : null) });
    if (i >= 0) return i;
  }
}
async function sendOut() {
  const b = bt; b.ps.vis = false; b.hpM = b.me.hp; b.expF = b.expT = expFrac(b.me);
  await msg(`ゆけっ! ${nameOf(b.me)}!`, 0.3); await popIn(b.ps);
}
async function afterFaint(dead) {
  const b = bt;
  if (dead === 'foe') {
    await faintAnim('foe'); await msg(`${fname()}は たおれた!`, 0.6);
    const amt = Math.floor(SPECIES[b.foe.sp].exp * b.foe.lv / 4 * (b.trainer ? GAME.expTrainerBonus : 1) * DIFF[diff].exp);
    await giveExp(b.me, amt); addBond(b.me, b.trainer ? 3 : 2);
    if (b.fi + 1 < b.foes.length) {
      b.fi++; b.foe = b.foes[b.fi]; resetBT(b.foe); markSeen(b.foe.sp); b.hpE = b.foe.hp; b.es = ss(); b.es.vis = false;
      await msg(`${b.trainer.name}は ${nameOf(b.foe)}を くりだした!`, 0.3); if (b.trainer.boss && b.fi === b.foes.length - 1) await eyeCutin(b.foe, `${b.trainer.name}の きりふだ`); await slideIn(b.es); return 'next';
    }
    return 'win';
  }
  await faintAnim('me'); await msg(`${nameOf(b.me)}は たおれた…`, 0.7); addBond(b.me, -3);
  if (!firstAlive()) return 'lose';
  const i = await pickPartyForced(); b.me = S.party[i]; await sendOut(); return 'next';
}
async function throwBall() {
  const b = bt, f = b.foe, sp = SPECIES[f.sp];
  S.bag.ball--; await msg('あつめボールを なげた!', 0.15);
  b.ball = { x: 190, y: 220, rot: 0, vis: true, r: 14 }; Aud.sfx('throw');
  await anim(0.6, (k) => { b.ball.x = lerp(190, 462, k); b.ball.y = lerp(220, 118, k) - Math.sin(k * 3.14) * 90; b.ball.rot = k * 12; });
  Aud.sfx('hit'); await anim(0.3, (k) => { b.es.sx = b.es.sy = 1 - k; b.es.a = 1 - k; b.es.flash = k; }); b.es.vis = false;
  await anim(0.45, (k) => { b.ball.y = lerp(118, 166, k) - Math.abs(Math.sin(k * 6)) * 24 * (1 - k); b.ball.rot = 0; });
  b.ball.y = 166;
  const p = clamp(((3 * f.max - 2 * f.hp) / (3 * f.max)) * sp.catch * 1.6 + 0.1, 0.05, 0.95), q = Math.pow(p, 1 / 3);
  let shakes = 0; while (shakes < 3 && Math.random() < q) shakes++;
  await sleep(0.4);
  for (let i = 0; i < shakes; i++) { Aud.sfx('shake'); await anim(0.5, (k) => { b.ball.rot = Math.sin(k * 12.5) * 0.45 * (1 - k * 0.3); }); b.ball.rot = 0; await sleep(0.35); }
  if (shakes >= 3) {
    Aud.sfx('caught'); for (let i = 0; i < 3; i++) addFx('star', 462, 150, 0.7);
    await anim(0.5, (k) => { b.ball.r = 14 + Math.sin(k * 3.14) * 3; });
    S.caught[f.sp] = true; markSeen(f.sp);
    await msg(`やった! ${nameOf(f)}を つかまえた!`, 1.0);
    if (S.party.length < 6) { S.party.push(f); await msg(`${nameOf(f)}は なかまに くわわった!`, 1.0); } else { S.box.push(f); await msg(`${nameOf(f)}は ボックスに おくられた!\n(メニューの「ボックス」で みられるよ)`, 1.4); }
    b.ball.vis = false;
    if (!S.dexShown) S.dexShown = {};
    if (!S.dexShown[f.sp]) { S.dexShown[f.sp] = true; ui.dialog = null; Aud.cry(f.sp); await cutin(Art.sprites[f.sp], nameOf(f), sp.dex); }
    return true;
  }
  Aud.sfx('escape'); b.ball.vis = false; await popIn(b.es);
  await msg(['ああっ! ぜんぜん だめだった!', 'ああっ! でてきてしまった!', 'おしい! もうすこしだったのに!', 'あとすこしで つかまえられそうだったのに!'][shakes], 0.9);
  return false;
}
async function useItem(id, target) {
  const b = bt; S.bag[id]--; Aud.sfx('heal'); addBond(target, 3);
  if (target === b.me) addFx('star', 158, 200, 0.6);
  if (id === 'potion') {
    target.hp = Math.min(target.max, target.hp + ITEMS.potion.heal);
    if (target === b.me) await tweenHP('me', target.hp);
    await msg(`${nameOf(target)}の HPが かいふくした!`, 0.8);
  } else { target.st = null; target.sleepT = 0; await msg(`${nameOf(target)}の じょうたいが なおった!`, 0.8); }
}
const itemTargetCheck = (id) => (i) => { const m = S.party[i]; if (m.hp <= 0) return 'ひんしの 子には つかえない!'; if (id === 'potion') return m.hp >= m.max ? 'HPは まんたんだよ!' : null; return m.st ? null : 'じょうたいいじょうじゃないよ!'; };
async function pickAction() {
  const b = bt;
  for (;;) {
    if (b.me.hp < b.me.max * 0.3 && !S.flags.tip_low) { S.flags.tip_low = true; await msg('ヒント: HPが ひくいときは、「バッグ」の きずぐすりで かいふくできるよ。', 2.0); }
    prompt(`${nameOf(b.me)}は どうする?`);
    const c = await choose(['たたかう', 'バッグ', 'なかま', 'にげる'], { x: 384, bottom: 354, w: 244, cols: 2, cancel: false });
    if (c === 0) {
      ensurePP(b.me); const mvs = movesOf(b.me);
      if (mvs.every((id, i) => b.me.pp[i] <= 0)) { await msg('どの わざも もう つかえない!', 0.6); return { k: 'move', mv: MOVES.struggle, i: -1 }; }
      prompt('どの わざを つかう?\n◎ばつぐん  △いまひとつ');
      const fType = typeOf(b.foe), known = S.effSeen || {};
      const i = await choose(mvs.map((id, k) => { const mv = MOVES[id], e = mv.p > 0 ? known[mv.t + '>' + fType] : null, mark = e > 1 ? '◎ ' : e < 1 && e != null ? '△ ' : ''; return { label: mv.n, sub: `${mark}${TYPES[mv.t].name}  ${b.me.pp[k]}/${mv.pp}`, subColor: e > 1 ? '#d9735b' : e < 1 && e != null ? '#6f9fcf' : null, off: b.me.pp[k] <= 0 }; }), { x: 316, bottom: 354, w: 312, cancel: -1 });
      if (i >= 0) return { k: 'move', mv: MOVES[mvs[i]], i };
    } else if (c === 1) {
      const r = await bagScreen({ battle: true });
      if (r === 'ball') { if (b.trainer) { await say('ひとの モンスターは とれないよ!', { w: 616 }); continue; } return { k: 'ball' }; }
      if (r === 'potion' || r === 'cure') {
        const t = await partyScreen({ title: 'だれに つかう?', validate: itemTargetCheck(r) });
        if (t >= 0) return { k: 'item', id: r, t: S.party[t] };
      }
    } else if (c === 2) {
      const i = await partyScreen({ title: 'だれと こうたいする?', validate: (i) => (S.party[i] === b.me ? 'もう たたかっているよ!' : S.party[i].hp <= 0 ? 'もう たたかえない!' : null) });
      if (i >= 0) return { k: 'switch', i };
    } else if (c === 3) return { k: 'run' };
  }
}
async function runBattle({ trainer = null, foes }) {
  mode = 'battle'; clearSpeaker(); ui.spkOut = null;
  for (const m of S.party) { resetBT(m); ensurePP(m); } for (const m of foes) resetBT(m);
  const b = bt = { theme: world.map.btheme || 'field', foes, fi: 0, trainer, foe: foes[0], me: firstAlive(), es: ss(), ps: ss(), hpE: 0, hpM: 0, expF: 0, expT: 0, fx: [], ball: null, showInfo: false };
  markSeen(b.foe.sp); b.hpE = b.foe.hp; b.hpM = b.me.hp; b.expF = b.expT = expFrac(b.me);
  b.es.vis = false; b.ps.vis = false; Aud.bgm(trainer && trainer.boss ? 'boss' : 'battle');
  await fade(0, 0.4);
  if (trainer && trainer.boss) await eyeCutin(b.foe, `あかり番の ${trainer.name}`); else if (b.foe.shiny) await eyeCutin(b.foe, '★ ひかりの 個体', true);
  b.showInfo = true;
  await slideIn(b.es);
  await msg(trainer ? `${trainer.boss ? 'あかり番の ' : ''}${trainer.name}が しょうぶを しかけてきた!` : `あっ! やせいの ${nameOf(b.foe)}が とびだしてきた!`, 0.7);
  if (trainer) { await msg(`${trainer.name}は ${nameOf(b.foe)}を くりだした!`, 0.4); }
  if (b.foe.shiny) { Aud.sfx('levelup'); for (let i = 0; i < 3; i++) addFx('star', 462, 120, 0.9); await msg('おや…? ようすが ちがう! ひかりの 個体だ!', 1.1); }
  await sendOut();
  if (!trainer && !S.flags.tip_catch) { S.flags.tip_catch = true; await msg('ヒント: 「バッグ」から あつめボールを なげると、野生の モンスターを つかまえられるよ。', 2.0); await msg('相手の HPを へらすほど、つかまえやすく なるよ!', 1.6); }
  if (trainer && !S.flags.tip_trainer) { S.flags.tip_trainer = true; await msg('ヒント: トレーナーの モンスターは、つかまえることも、にげることも できないよ。', 2.0); }
  let result = null;
  while (!result) {
    const act = await pickAction(); ui.choice = null;
    let order = [];
    if (act.k === 'run') {
      if (b.trainer) { await msg('しょうぶの さいちゅうに せなかは みせられない!', 0.8); order = ['foe']; }
      else if (eSpd(b.me) >= eSpd(b.foe) || Math.random() < 0.65) { Aud.sfx('run'); await msg('うまく にげきれた!', 0.7); result = 'ran'; break; }
      else { await msg('にげられなかった!', 0.7); order = ['foe']; }
    } else if (act.k === 'switch') {
      await msg(`もどれ! ${nameOf(b.me)}!`, 0.2); await anim(0.25, (k) => { b.ps.sx = b.ps.sy = 1 - k; b.ps.a = 1 - k; }); b.ps.vis = false; b.ps.sx = b.ps.sy = b.ps.a = 1;
      b.me.stg = { atk: 0, def: 0, spd: 0 };
      b.me = S.party[act.i]; await sendOut(); order = ['foe'];
    } else if (act.k === 'item') { await useItem(act.id, act.t); order = ['foe']; }
    else if (act.k === 'ball') {
      if (await throwBall()) { result = 'caught'; break; }
      order = ['foe'];
    } else {
      if (act.i >= 0) b.me.pp[act.i]--;
      const meFirst = eSpd(b.me) > eSpd(b.foe) || (eSpd(b.me) === eSpd(b.foe) && Math.random() < 0.5);
      order = meFirst ? ['me', 'foe'] : ['foe', 'me'];
    }
    for (const side of order) {
      if (b.me.hp <= 0 || b.foe.hp <= 0) break;
      const A = side === 'me' ? b.me : b.foe, D = side === 'me' ? b.foe : b.me;
      await doMove(side, A, D, side === 'me' ? act.mv : foeChoose());
      if (D.hp <= 0) { const r = await afterFaint(side === 'me' ? 'foe' : 'me'); if (r === 'win' || r === 'lose') result = r; order = []; break; }
    }
    if (!result && b.me.hp > 0 && b.foe.hp > 0) { const r = await residual(); if (r === 'win' || r === 'lose') result = r; }
  }
  ui.dialog = null; ui.choice = null;
  if (result === 'win') { await victoryScene(trainer); if (trainer) await msg(`${trainer.name}との しょうぶに かった!`, 0.9); }
  for (const m of S.party) clearBT(m);
  await fade(1, 0.35, '#000'); Aud.sfx('select');
  mode = 'field'; bt = null;
  return result;
}

// ---------- 進化 ----------
function drawWhiteMon(spr, cx, bot, size, a) {
  tmp.globalCompositeOperation = 'source-over'; tmp.clearRect(0, 0, 384, 384); tmp.drawImage(spr, 0, 0, 384, 384);
  tmp.globalCompositeOperation = 'source-atop'; tmp.fillStyle = `rgba(255,255,255,${a})`; tmp.fillRect(0, 0, 384, 384); tmp.globalCompositeOperation = 'source-over';
  g.drawImage(tmpC, cx - size / 2, bot - size * 0.955, size, size);
}
async function evolveScene(m) {
  const e = SPECIES[m.sp].evo, A = Art.sprites[m.sp], B = Art.sprites[e.to], oldName = nameOf(m), t0 = clock; let swapped = false;
  ui.dialog = null; Aud.bgm(null);
  ui.overlay = () => {
    const t = clock - t0;
    g.fillStyle = '#120e1c'; g.fillRect(0, 0, W, H);
    const rg = g.createRadialGradient(W / 2, 190, 10, W / 2, 190, 260); rg.addColorStop(0, `rgba(255,236,170,${0.15 + Math.min(1, t / 2.6) * 0.35})`); rg.addColorStop(1, 'rgba(255,236,170,0)'); g.fillStyle = rg; g.fillRect(0, 0, W, H);
    g.save(); g.translate(W / 2, 190); g.rotate(t * 0.4); g.fillStyle = 'rgba(255,240,190,.12)'; for (let i = 0; i < 12; i++) { g.rotate(Math.PI / 6); g.beginPath(); g.moveTo(0, 0); g.lineTo(300, -16); g.lineTo(300, 16); g.closePath(); g.fill(); } g.restore();
    const spr = swapped ? B : A, pulse = swapped ? 1 : 1 + Math.sin(t * (4 + t * 3)) * 0.03 * Math.min(1, t);
    drawWhiteMon(spr, W / 2, 290, 250 * pulse, swapped ? clamp(1 - (t - 2.6) * 1.6, 0, 1) : clamp(t / 2.5, 0, 1));
    for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283 + t, r = 60 + (t % 1.6) * 90; Art.star(g, W / 2 + Math.cos(a) * r, 190 + Math.sin(a) * r * 0.7, 6, 'rgba(255,240,170,.8)'); }
  };
  Aud.sfx('levelup'); await sleep(1.2); Aud.sfx('heal'); await sleep(1.4);
  ui.flash = 1; Aud.sfx('caught'); m.sp = e.to; addBond(m, 5); recalc(m); S.seen[e.to] = true; S.caught[e.to] = true; swapped = true;
  await anim(0.9, (k) => { ui.flash = 1 - k; }); ui.flash = 0; await sleep(1.0);
  ui.overlay = null; Aud.bgm(world.map.bgm);
  await say(`おめでとう! ${oldName}は ${nameOf(m)}に しんかした!`);
  if (!S.dexShown) S.dexShown = {};
  if (!S.dexShown[e.to]) { S.dexShown[e.to] = true; await cutin(Art.sprites[e.to], nameOf(m), SPECIES[e.to].dex); }
  if (e.move) await learnMove(m, e.move);
}
async function evolveCheck() {
  for (const m of S.party) {
    const e = SPECIES[m.sp].evo; if (!e || m.lv < e.lv || m.evoSkip) continue;
    await say(`おや…? ${nameOf(m)}の ようすが…!`);
    const c = await choose(['しんかさせる', 'まだ しない'], { x: 440, y: 150, w: 180, cancel: 1 });
    if (c === 0) await evolveScene(m); else { m.evoSkip = true; await say('しんかを やめた。まだ そのままの すがただ。'); }
  }
}

// ---------- 一覧の画面(なかま・バッグ・ずかん) ----------
async function listScreen(o) {
  let idx = o.idx || 0; flushBtn();
  const rowH = o.rowH || 46, top = 44, vis = Math.floor((344 - top) / rowH);
  let scroll = 0;
  ui.overlay = () => {
    g.fillStyle = 'rgba(30,25,40,.5)'; g.fillRect(0, 0, W, H);
    panel(8, 8, 302, 344); txt(o.title, 26, 27, { size: 17 }); g.fillStyle = ACCENT; g.fillRect(22, 39, 274, 1.5);
    if (idx < scroll) scroll = idx; if (idx >= scroll + vis) scroll = idx - vis + 1;
    for (let k = 0; k < vis && scroll + k < o.n; k++) {
      const i = scroll + k, x = 16, y = top + k * rowH, w = 286;
      if (i === idx) { g.fillStyle = 'rgba(214,150,110,.26)'; rr(x, y, w, rowH - 3, 6); g.fill(); g.strokeStyle = ACCENT; g.lineWidth = 1.8; g.stroke(); }
      o.rowFn(i, x, y, w, rowH - 3, i === idx);
      ui.hits.push({ x, y, w, h: rowH - 3, act: () => { if (idx === i) pushBtn('a'); else { idx = i; Aud.sfx('select'); } } });
    }
    if (o.n > vis) { txt(scroll > 0 ? '▲' : '', 290, 36, { size: 11, color: MUTED }); txt(scroll + vis < o.n ? '▼' : '', 290, 344, { size: 11, color: MUTED }); }
    panel(318, 8, 314, 344); o.detailFn(idx, 328, 18, 296, 324);
    if (o.hint) txt(o.hint, 24, 338, { size: 11, color: MUTED });
    g.fillStyle = '#2c2540'; rr(236, 328, 62, 18, 5); g.fill(); txt('もどる', 267, 337, { size: 12, align: 'center', color: '#fbf5ea' });
    if (o.extra) { const L = o.extra.label(idx); g.fillStyle = '#e6cdb8'; rr(146, 328, 84, 18, 5); g.fill(); txt(L, 188, 337, { size: 12, align: 'center' }); ui.hits.push({ x: 146, y: 326, w: 92, h: 26, act: () => o.extra.act(idx) }); }
    ui.hits.push({ x: 240, y: 328, w: 62, h: 22, act: () => pushBtn('b') });
  };
  for (;;) {
    const b = await nextBtn();
    if (b === 'up' && idx > 0) { idx--; Aud.sfx('select'); }
    else if (b === 'down' && idx < o.n - 1) { idx++; Aud.sfx('select'); }
    else if (b === 'a') { const r = await o.onA(idx); if (r !== undefined) { ui.overlay = null; return r; } }
    else if (b === 'b' && o.onB && o.onB()) { Aud.sfx('back'); }
    else if (b === 'b' && o.cancel !== false) { Aud.sfx('back'); ui.overlay = null; return -1; }
  }
}
function typeChip(x, y, t) { const T = TYPES[t]; g.fillStyle = T.color; rr(x, y, 44, 16, 4); g.fill(); g.strokeStyle = 'rgba(45,36,64,.55)'; g.lineWidth = 1; g.stroke(); txt(T.name, x + 22, y + 8.5, { size: 11, color: '#fff', align: 'center', stroke: 'rgba(45,36,64,.45)', sw: 2.4 }); }
function monDetail(m, x, y, w) {
  const sp = SPECIES[m.sp];
  g.drawImage(Art.sprites[m.sp], x + 4, y + 2, 96, 96);
  txt(nameOf(m), x + 108, y + 18, { size: 20 }); txt('Lv' + m.lv, x + w - 4, y + 18, { size: 15, align: 'right', color: MUTED }); typeChip(x + 108, y + 34, sp.t);
  txt('とくせい', x + 108, y + 98, { size: 11, color: MUTED }); txt(ABIL[sp.ab] ? ABIL[sp.ab].n : '―', x + 154, y + 98, { size: 13 });
  const f = m.hp / m.max, c = hpColor(f); txt('HP', x + 108, y + 66, { size: 11, color: '#c0504a', w: 900 }); bar(x + 130, y + 60, w - 134, 11, f, c[0], c[1]); txt(`${m.hp}/${m.max}`, x + w - 4, y + 82, { size: 12, align: 'right' });
  const rows = [['こうげき', m.atk], ['ぼうぎょ', m.def], ['すばやさ', m.spd]];
  rows.forEach(([n, v], i) => { txt(n, x + 8 + i * 94, y + 112, { size: 12, color: MUTED }); txt(String(v), x + 8 + i * 94 + 56, y + 112, { size: 15 }); });
  txt('つぎの レベルまで', x + 8, y + 138, { size: 12, color: MUTED }); bar(x + 112, y + 133, w - 120, 8, expFrac(m), '#9fd6ff', '#5aa9ff');
  txt('なかよし', x + 8, y + 158, { size: 12, color: MUTED }); const bl = bondLv(m), bf = bondOf(m) / 25 - bl;
  for (let i = 0; i < 4; i++) { const hx = x + 76 + i * 22; heart(hx, y + 157, 7, i < bl ? '#ff7f9f' : '#e0d9e4'); if (i === bl && bl < 4 && bf > 0.02) { g.save(); g.beginPath(); g.rect(hx - 9, y + 147, 18 * bf, 20); g.clip(); heart(hx, y + 157, 7, '#ffb3c7'); g.restore(); } }
  if (bl > 0) txt(BOND_TXT[bl], x + 170, y + 158, { size: 12, color: '#d9735b' });
  txt('おぼえている わざ', x + 8, y + 182, { size: 12, color: MUTED });
  movesOf(m).forEach((id, i) => { const mv = MOVES[id], yy = y + 192 + i * 32; g.fillStyle = '#ece1d0'; rr(x + 4, yy, w - 8, 28, 5); g.fill(); typeChip(x + 12, yy + 6, mv.t); txt(mv.n, x + 64, yy + 15, { size: 15 }); txt('いりょく ' + mv.p, x + w - 14, yy + 15, { size: 12, color: MUTED, align: 'right' }); });
}
async function partyScreen(o = {}) {
  const L = o.list || S.party, view = !o.list && (!o.title || o.title === 'なかま'); let sel = null; // いれかえで えらんだ なかま
  const swapAct = (i) => { if (sel == null) { sel = i; Aud.sfx('ok'); } else { if (sel !== i) { const t = S.party[sel]; S.party[sel] = S.party[i]; S.party[i] = t; Aud.sfx('get'); } sel = null; } };
  return listScreen({
    title: o.title || 'なかま', n: L.length, rowH: 46, cancel: o.cancel, hint: view ? (sel == null ? 'じゅんばん いれかえ' : 'あいてを えらんでね') : '',
    onB: () => { if (sel != null) { sel = null; return true; } return false; },
    extra: view ? { label: () => (sel == null ? 'いれかえ' : 'ここへ'), act: (i) => swapAct(i) } : null,
    rowFn: (i, x, y, w, h) => {
      const m = L[i]; g.save(); if (m.hp <= 0) g.globalAlpha = 0.55; g.drawImage(Art.sprites[m.sp], x + 4, y - 2, 46, 46); g.restore();
      if (view) { g.fillStyle = sel === i ? PEACH : i === 0 ? '#6aa896' : '#c9c2d4'; rr(x + 2, y + 2, 16, 14, 7); g.fill(); txt(String(i + 1), x + 10, y + 9.5, { size: 10, color: '#fff', align: 'center' }); }
      txt(nameOf(m), x + 56, y + 14, { size: 15 }); txt('Lv' + m.lv, x + 56 + nameW(nameOf(m)) + 8, y + 15, { size: 12, color: MUTED }); if (view && sel === i) txt('いれかえ中', x + w - 8, y + 14, { size: 11, color: PEACH, align: 'right' }); else if (view && i === 0) txt('せんとう', x + w - 8, y + 14, { size: 11, color: '#6aa896', align: 'right' });
      const f = m.hp / m.max, c = hpColor(f); bar(x + 56, y + 26, w - 124, 8, f, c[0], c[1]);
      txt(m.hp <= 0 ? 'ひんし' : `${m.hp}/${m.max}`, x + w - 8, y + 30, { size: 12, align: 'right', color: m.hp <= 0 ? '#c0504a' : INK });
    },
    detailFn: (i, x, y, w) => monDetail(L[i], x, y, w),
    onA: async (i) => {
      if (view) { swapAct(i); return undefined; }
      const err = o.validate ? o.validate(i) : null;
      if (err) { Aud.sfx('back'); await say(err); return undefined; }
      Aud.sfx('ok'); return i;
    },
  });
}
function itemIcon(id, cx, cy, s) {
  if (id === 'map') { // 折りたたんだ 紙の 地図
    const w = s * 0.92, h = s * 0.68, x = cx - w / 2, y = cy - h / 2, d = h * 0.14;
    for (let i = 0; i < 3; i++) { const a = x + (w / 3) * i, b = a + w / 3, t = i % 2 ? y : y + d, u = i % 2 ? y + d : y; g.fillStyle = i % 2 ? '#d9c9a0' : '#efe2c0'; g.beginPath(); g.moveTo(a, t); g.lineTo(b, u); g.lineTo(b, u + h - d); g.lineTo(a, t + h - d); g.closePath(); g.fill(); g.strokeStyle = '#6a5440'; g.lineWidth = Math.max(1, s * 0.025); g.stroke(); }
    g.strokeStyle = '#6f8f66'; g.lineWidth = Math.max(1.2, s * 0.05); g.beginPath(); g.moveTo(x + w * 0.12, cy + h * 0.18); g.quadraticCurveTo(cx - w * 0.1, cy - h * 0.3, cx + w * 0.08, cy + h * 0.06); g.quadraticCurveTo(cx + w * 0.22, cy + h * 0.24, x + w * 0.82, cy - h * 0.14); g.stroke();
    g.fillStyle = '#c25a62'; g.beginPath(); g.arc(x + w * 0.82, cy - h * 0.16, s * 0.08, 0, 7); g.fill(); return;
  }
  if (id === 'ball') { Art.ball(g, cx, cy, s * 0.5, id === 'ball' && s > 40 ? clock * 0.5 : 0); return; }
  const col = id === 'cure' ? ['#8fd6c8', '#4fb3a0'] : ['#e8a0b8', '#c96f8f'];
  g.fillStyle = col[0]; rr(cx - s * 0.32, cy - s * 0.2, s * 0.64, s * 0.7, s * 0.16); g.fill();
  g.fillStyle = '#f7f5f1'; rr(cx - s * 0.16, cy - s * 0.46, s * 0.32, s * 0.3, s * 0.08); g.fill();
  g.fillStyle = col[1]; g.fillRect(cx - s * 0.06, cy - s * 0.02, s * 0.12, s * 0.38); g.fillRect(cx - s * 0.2, cy + s * 0.11, s * 0.4, s * 0.12);
}
async function bagScreen(o = {}) {
  const ids = o.battle ? ['ball', 'potion', 'cure'] : ['map', 'ball', 'potion', 'cure']; // ちずは ずっと もっている 大事なもの
  return listScreen({
    title: 'バッグ', n: ids.length, rowH: 50,
    rowFn: (i, x, y, w) => { const id = ids[i]; itemIcon(id, x + 26, y + 22, 30); txt(ITEMS[id].n, x + 52, y + 21, { size: 15 }); txt(ITEMS[id].key ? 'だいじなもの' : '× ' + (S.bag[id] || 0), x + w - 12, y + 21, { size: ITEMS[id].key ? 11 : 15, align: 'right', color: ITEMS[id].key ? ACCENT : INK }); },
    detailFn: (i, x, y, w) => { const id = ids[i]; itemIcon(id, x + w / 2, y + 90, 92); txt(ITEMS[id].n, x + w / 2, y + 170, { size: 19, align: 'center' }); wrap(ITEMS[id].d, w - 20, 15).forEach((l, k) => txt(l, x + w / 2, y + 204 + k * 24, { size: 15, align: 'center', color: MUTED })); if (id === 'map') { panel(x + w / 2 - 70, y + 270, 140, 34, { r: 7, fill: '#2c2540', stroke: '#f0dcc0', plain: true }); txt('ちずを ひらく', x + w / 2, y + 287.5, { size: 15, align: 'center', color: '#fff6e6' }); ui.hits.push({ x: x + w / 2 - 74, y: y + 266, w: 148, h: 42, act: () => pushBtn('a') }); } },
    onA: async (i) => {
      const id = ids[i];
      if (id === 'map') { await mapScreen(); flushBtn(); return undefined; }
      if ((S.bag[id] || 0) <= 0) { Aud.sfx('back'); await say('もう のこっていないよ!'); return undefined; }
      if (id === 'ball' && !o.battle) { Aud.sfx('back'); await say('ここでは つかえないよ。草むらで モンスターに なげよう!'); return undefined; }
      if (id === 'cure' && !o.battle) { Aud.sfx('back'); await say('いまは つかう ひつようが ないよ。'); return undefined; }
      Aud.sfx('ok'); return id;
    },
  });
}
