'use strict';
// ちず: 世界ぜんたいと、いま いる 場所。左(ひなた村)から 右(ヤマノハ)へ、旅の じゅんに ならぶ
const WM_NODE = {
  village: { x: 52, y: 222, town: true }, route: { x: 124, y: 214 }, town: { x: 198, y: 207, town: true }, route2: { x: 262, y: 213 }, town2: { x: 326, y: 220, town: true },
  route3: { x: 392, y: 228 }, town3: { x: 462, y: 238, town: true }, route4: { x: 524, y: 182 }, town4: { x: 584, y: 116, town: true },
  forest: { x: 130, y: 126, side: true }, lake: { x: 250, y: 272, side: true }, station: { x: 368, y: 132, side: true }, ridge: { x: 468, y: 88, side: true },
};
// 道の 折れ線(その 地図の 左はしから 右はしまで)。主人公の 位置は この 上を うごく
const WM_ROAD = {
  route: [[76, 222], [104, 212], [140, 218], [172, 208]],
  route2: [[224, 207], [250, 215], [278, 209], [300, 218]],
  route3: [[352, 221], [380, 231], [410, 224], [436, 236]],
  route4: [[488, 232], [532, 212], [506, 176], [548, 150], [568, 134]],
};
// 寄り道: [分かれる 道, 道の中の 位置(0〜1)]
const WM_SIDE = { forest: ['route', 0.57], lake: ['route2', 0.29], station: ['route3', 0.31], ridge: ['route4', 0.33] };
const WM_LINK = [['village', 'route'], ['route', 'town', 'beat_rival'], ['town', 'route2', 'lit_town'], ['route2', 'town2'], ['town2', 'route3', 'lit_town2'], ['route3', 'town3'], ['town3', 'route4', 'lit_town3'], ['route4', 'town4']];
const WM_FLAG = { route: [106, 198], town: [170, 194], town2: [297, 214], town3: [431, 232], town4: [551, 114] }; // 「つぎ」の 旗の 場所
const WM_ORDER = ['village', 'route', 'forest', 'town', 'route2', 'lake', 'town2', 'route3', 'station', 'town3', 'route4', 'ridge', 'town4'];
const WM_STORY = { forest: 'look_lantern', lake: 'side_lake', station: 'look_train', ridge: 'side_ridge' };
function alongRoad(pts, k) {
  const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1])), total = seg.reduce((a, b) => a + b, 0);
  let d = clamp(k, 0, 1) * total, i = 0; while (i < seg.length - 1 && d > seg[i]) d -= seg[i++];
  const u = seg[i] ? d / seg[i] : 0; return [lerp(pts[i][0], pts[i + 1][0], u), lerp(pts[i][1], pts[i + 1][1], u)];
}
// 地図の 中で 主人公が いる 点
function heroOnWorld() {
  const m = world.map, p = world.p, id = m.id, kx = (p.x + p.ox) / (m.w - 1), ky = (p.y + p.oy) / (m.h - 1);
  if (WM_ROAD[id]) return alongRoad(WM_ROAD[id], kx);
  const n = WM_NODE[id] || WM_NODE.village;
  return [n.x + (kx - 0.5) * (n.side ? 46 : 42), n.y + (ky - 0.55) * (n.side ? 30 : 18)];
}
// 行ったことが あるか(前から 遊んでいる セーブは、旅の すすみ具合から おぎなう)
function visitedMap(id) {
  const F = S.flags; if (id === 'village' || id === world.map.id || F['been_' + id] || F['ch_' + id]) return true;
  return !!{ route: F.beat_rival || F.ch_town, route2: F.ch_town2, route3: F.ch_town3, route4: F.ch_town4, town: F.lit_town, town2: F.lit_town2, town3: F.lit_town3 }[id];
}
const nextGoalMap = () => { const F = S.flags; return F.cleared ? null : !F.beat_rival ? 'route' : !F.lit_town ? 'town' : !F.lit_town2 ? 'town2' : !F.lit_town3 ? 'town3' : 'town4'; };

// ---------- 絵 ----------
function wmPine(x, y, s, c) { g.fillStyle = c; g.beginPath(); g.moveTo(x, y - 14 * s); g.lineTo(x + 6 * s, y - 5 * s); g.lineTo(x + 3 * s, y - 5 * s); g.lineTo(x + 8 * s, y + 2 * s); g.lineTo(x - 8 * s, y + 2 * s); g.lineTo(x - 3 * s, y - 5 * s); g.lineTo(x - 6 * s, y - 5 * s); g.closePath(); g.fill(); }
function wmHouse(x, y, s, roof) { g.fillStyle = '#f6ecd8'; g.fillRect(x - 6 * s, y - 7 * s, 12 * s, 9 * s); g.fillStyle = roof; g.beginPath(); g.moveTo(x - 9 * s, y - 6 * s); g.lineTo(x, y - 15 * s); g.lineTo(x + 9 * s, y - 6 * s); g.closePath(); g.fill(); g.strokeStyle = 'rgba(61,53,80,.7)'; g.lineWidth = 1; g.strokeRect(x - 6 * s, y - 6 * s, 12 * s, 8 * s); g.fillStyle = '#6a5470'; g.fillRect(x - 1.6 * s, y - 3 * s, 3.2 * s, 5 * s); }
function wmMount(x, y, w, h, c) { g.fillStyle = c; g.beginPath(); g.moveTo(x - w, y); g.lineTo(x, y - h); g.lineTo(x + w, y); g.closePath(); g.fill(); g.strokeStyle = 'rgba(61,53,80,.45)'; g.lineWidth = 1.2; g.stroke(); g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.moveTo(x, y - h); g.lineTo(x + w * 0.26, y - h * 0.72); g.lineTo(x + w * 0.04, y - h * 0.78); g.lineTo(x - w * 0.22, y - h * 0.74); g.closePath(); g.fill(); }
function wmLand() {
  const gr = g.createLinearGradient(0, 36, 0, 300); gr.addColorStop(0, '#e9ddbf'); gr.addColorStop(1, '#dccfa8'); g.fillStyle = gr; g.fillRect(10, 36, 620, 264);
  g.fillStyle = 'rgba(122,158,104,.34)'; for (const [x, y, rx, ry] of [[90, 218, 110, 52], [240, 236, 120, 50], [150, 128, 92, 46], [370, 190, 100, 60]]) { g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 7); g.fill(); }
  g.fillStyle = 'rgba(128,112,132,.2)'; g.beginPath(); g.ellipse(540, 118, 100, 74, 0, 0, 7); g.fill();
  // 海(港の 下と 右)
  g.fillStyle = '#9dbcc4'; g.beginPath(); g.moveTo(338, 300); g.bezierCurveTo(380, 268, 428, 266, 468, 258); g.bezierCurveTo(520, 248, 556, 262, 592, 232); g.bezierCurveTo(606, 214, 618, 206, 630, 204); g.lineTo(630, 300); g.closePath(); g.fill(); g.strokeStyle = '#5f7f92'; g.lineWidth = 1.6; g.stroke();
  g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = 1.4; for (let i = 0; i < 15; i++) { const x = 400 + (i * 61) % 214, y = 272 + (i * 17) % 22, o = Math.sin(clock * 1.4 + i) * 2; g.beginPath(); g.moveTo(x + o, y); g.quadraticCurveTo(x + 5 + o, y - 3, x + 10 + o, y); g.stroke(); }
  // 山と ダム
  for (const [x, y, w, h] of [[430, 110, 30, 44], [520, 96, 34, 50], [556, 82, 28, 40], [612, 104, 26, 46], [606, 170, 24, 34], [412, 164, 18, 24]]) wmMount(x, y, w, h, '#a99da4');
  g.fillStyle = '#b8b2bc'; g.beginPath(); g.moveTo(560, 128); g.lineTo(616, 128); g.lineTo(608, 150); g.lineTo(568, 150); g.closePath(); g.fill(); g.strokeStyle = '#6a6074'; g.lineWidth = 1.2; g.stroke(); for (let x = 576; x < 608; x += 10) { g.beginPath(); g.moveTo(x, 130); g.lineTo(x, 149); g.stroke(); }
  // 木や 草
  for (let i = 0; i < 34; i++) { const x = 98 + (i * 47) % 70, y = 100 + (i * 29) % 52; if (Math.abs(x - 130) < 17 && Math.abs(y - 126) < 16) continue; wmPine(x, y, 0.85, i % 3 ? '#5c8064' : '#47705a'); }
  for (const [x, y] of [[28, 190], [44, 182], [90, 250], [108, 258], [160, 244], [210, 252], [300, 180], [288, 192], [34, 262], [330, 262]]) wmPine(x, y, 0.75, '#6f8f66');
  g.strokeStyle = 'rgba(104,132,84,.8)'; g.lineWidth = 1.2; for (let i = 0; i < 26; i++) { const x = 70 + (i * 37) % 120, y = 188 + (i * 19) % 62; g.beginPath(); g.moveTo(x - 3, y - 4); g.lineTo(x, y); g.lineTo(x + 3, y - 4); g.stroke(); }
  // かがみ池
  g.fillStyle = '#8fb0c8'; g.beginPath(); g.ellipse(254, 272, 40, 17, 0, 0, 7); g.fill(); g.strokeStyle = '#5f7f9a'; g.lineWidth = 1.6; g.stroke(); g.strokeStyle = 'rgba(255,255,255,.8)'; g.beginPath(); g.moveTo(236, 268); g.lineTo(252, 268); g.moveTo(258, 278); g.lineTo(272, 278); g.stroke();
  // 駅の 線路と 列車
  g.strokeStyle = '#6a5a52'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(320, 146); g.lineTo(422, 128); g.moveTo(321, 151); g.lineTo(423, 133); g.stroke(); for (let i = 0; i < 12; i++) { const x = 324 + i * 8.4, y = 145 - i * 1.5; g.beginPath(); g.moveTo(x, y - 2); g.lineTo(x + 1.4, y + 8); g.stroke(); }
  g.fillStyle = '#8a4a48'; g.beginPath(); g.roundRect(330, 130, 24, 12, 3); g.fill(); g.fillStyle = '#e8dcc0'; for (let i = 0; i < 3; i++) g.fillRect(333 + i * 7, 133, 4, 4);
  // 電線と ビニールハウス
  g.strokeStyle = '#5a4e66'; g.lineWidth = 1.2; for (const x of [236, 262, 288]) { g.beginPath(); g.moveTo(x, 205); g.lineTo(x, 188); g.moveTo(x - 5, 191); g.lineTo(x + 5, 191); g.stroke(); } g.beginPath(); g.moveTo(236, 191); g.quadraticCurveTo(249, 197, 262, 191); g.quadraticCurveTo(275, 197, 288, 191); g.stroke();
  for (const [x, y, r] of [[310, 244, 11], [334, 247, 14], [358, 243, 9]]) { g.fillStyle = 'rgba(150,214,190,.85)'; g.beginPath(); g.arc(x, y, r, Math.PI, 0); g.fill(); g.strokeStyle = '#4a8478'; g.lineWidth = 1.2; g.stroke(); }
  // 灯台
  g.fillStyle = '#f2ecdc'; g.beginPath(); g.moveTo(492, 248); g.lineTo(496, 214); g.lineTo(504, 214); g.lineTo(508, 248); g.closePath(); g.fill(); g.strokeStyle = '#4a4458'; g.lineWidth = 1.2; g.stroke(); g.fillStyle = '#b25a55'; g.fillRect(494.5, 226, 11, 6); g.fillStyle = S.flags.lit_town3 ? '#ffe39a' : '#4a4458'; g.fillRect(495, 207, 10, 8);
  // 尾根の 石づみ
  for (const [x, y, rx] of [[468, 82, 8], [468, 74, 5.5], [468, 68, 3.5]]) { g.fillStyle = '#8c8a94'; g.beginPath(); g.ellipse(x, y, rx, rx * 0.66, 0, 0, 7); g.fill(); g.strokeStyle = '#55525e'; g.lineWidth = 1; g.stroke(); }
}
function wmRoad(pts, known, side) {
  const path = () => { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) g.lineTo(p[0], p[1]); };
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round'; if (!known) g.setLineDash([3, 6]);
  g.strokeStyle = 'rgba(92,68,50,.85)'; g.lineWidth = side ? 6 : 8; path(); g.stroke(); g.strokeStyle = known ? '#f4e2b4' : '#e4d6b4'; g.lineWidth = side ? 3 : 4.6; path(); g.stroke(); g.restore();
}
function wmLamp(x, y, lit) {
  if (lit) { const r = 22 + Math.sin(clock * 3 + x) * 2, gr = g.createRadialGradient(x, y, 1, x, y, r); gr.addColorStop(0, 'rgba(255,206,110,.95)'); gr.addColorStop(1, 'rgba(255,180,90,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); }
  g.strokeStyle = '#3d3550'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y + 14); g.lineTo(x, y); g.stroke(); g.fillStyle = lit ? '#fff0b8' : '#6a6478'; g.beginPath(); g.arc(x, y - 1, 4, 0, 7); g.fill(); g.lineWidth = 1.2; g.stroke();
}
function drawWorldMap(sel, t) {
  g.fillStyle = 'rgba(24,18,38,.92)'; g.fillRect(-OX, 0, VW, H);
  panel(6, 32, 628, 272, { r: 7 });
  g.save(); g.beginPath(); g.rect(10, 36, 620, 264); g.clip();
  wmLand();
  for (const [a, b, need] of WM_LINK) { // 町と 道の つなぎ目
    const A = WM_ROAD[a] ? WM_ROAD[a][WM_ROAD[a].length - 1] : [WM_NODE[a].x, WM_NODE[a].y], B = WM_ROAD[b] ? WM_ROAD[b][0] : [WM_NODE[b].x, WM_NODE[b].y];
    wmRoad([A, B], visitedMap(a) && visitedMap(b), false);
    if (need && !S.flags[need]) { const x = (A[0] + B[0]) / 2, y = (A[1] + B[1]) / 2; g.fillStyle = '#c25a62'; g.beginPath(); g.arc(x, y, 6.5, 0, 7); g.fill(); g.strokeStyle = '#fff4e4'; g.lineWidth = 1.5; g.stroke(); g.fillStyle = '#fff4e4'; g.fillRect(x - 4, y - 1.2, 8, 2.4); } // まだ 通れない
  }
  for (const k in WM_ROAD) wmRoad(WM_ROAD[k], visitedMap(k), false);
  for (const k in WM_SIDE) { const [road, at] = WM_SIDE[k], A = alongRoad(WM_ROAD[road], at), n = WM_NODE[k]; wmRoad([A, [(A[0] + n.x) / 2 + 5, (A[1] + n.y) / 2], [n.x, n.y + (k === 'lake' ? -12 : 10)]], visitedMap(k), true); }
  // 町
  const roofs = { village: '#d9735b', town: '#a86a7a', town2: '#5a8a86', town3: '#5f7f9f', town4: '#7a6a9a' };
  for (const k in roofs) { const n = WM_NODE[k]; wmHouse(n.x - 13, n.y + 1, 0.95, roofs[k]); wmHouse(n.x + 13, n.y + 3, 0.85, roofs[k]); wmHouse(n.x, n.y - 5, 1.15, roofs[k]); if (k !== 'village') wmLamp(n.x + 25, n.y - 14, !!S.flags['lit_' + k]); }
  // 名前
  const goal = nextGoalMap();
  for (const k of WM_ORDER) {
    const n = WM_NODE[k], m = MAPS[k], seen = visitedMap(k);
    const ly = { village: n.y + 19, route: n.y + 24, town: n.y + 19, route2: n.y - 36, town2: n.y - 30, route3: n.y + 24, town3: n.y - 32, route4: n.y + 4, town4: n.y - 30, forest: n.y - 24, lake: n.y + 20, station: n.y - 22, ridge: n.y - 26 }[k];
    const lx = n.x + ({ route4: 46, lake: 66, town3: -6 }[k] || 0);
    g.font = `900 ${n.town ? 12.5 : 10.5}px ${FONT}`; const w = g.measureText(m.name).width + 12, h = n.town ? 17 : 15;
    g.globalAlpha = seen ? 1 : 0.62; g.fillStyle = k === sel ? '#c25a62' : n.town ? 'rgba(44,37,64,.92)' : 'rgba(250,244,230,.9)'; rr(lx - w / 2, ly - h / 2, w, h, 4); g.fill(); if (!n.town && k !== sel) { g.strokeStyle = 'rgba(61,53,80,.55)'; g.lineWidth = 1; g.stroke(); }
    txt(m.name, lx, ly + 0.5, { size: n.town ? 12.5 : 10.5, w: 900, align: 'center', color: k === sel || n.town ? '#fff6e6' : '#37323f' }); g.globalAlpha = 1;
    if (WM_STORY[k] && S.flags[WM_STORY[k]]) Art.star(g, lx + w / 2 + 6, ly, 5, '#e0a02e');
    ui.hits.push({ x: Math.min(lx - w / 2, n.x - 24), y: Math.min(ly - 10, n.y - 18), w: Math.max(w, 48), h: Math.abs(ly - n.y) + 30, act: () => { world.mapSel = k; Aud.sfx('select'); } });
    if (k === goal) { const [fx, f0] = WM_FLAG[k], fy = f0 + Math.sin(clock * 3) * 2; g.strokeStyle = '#3d3550'; g.lineWidth = 2; g.beginPath(); g.moveTo(fx, fy + 15); g.lineTo(fx, fy - 8); g.stroke(); g.fillStyle = '#e0574a'; g.beginPath(); g.moveTo(fx, fy - 9); g.lineTo(fx - 17, fy - 4); g.lineTo(fx, fy + 2); g.closePath(); g.fill(); txt('つぎ', fx - 10, fy - 17, { size: 10, w: 900, align: 'center', color: '#a8303a', stroke: '#fff4e4', sw: 3 }); }
  }
  // 方角
  g.fillStyle = '#3d3550'; g.beginPath(); g.moveTo(36, 54); g.lineTo(42, 76); g.lineTo(36, 71); g.lineTo(30, 76); g.closePath(); g.fill(); txt('北', 36, 46, { size: 11, w: 900, align: 'center' });
  // いま いる 場所
  const [hx, hy] = heroOnWorld(), pulse = (clock * 0.9) % 1;
  g.strokeStyle = `rgba(224,87,74,${1 - pulse})`; g.lineWidth = 2.6; g.beginPath(); g.ellipse(hx, hy + 2, 7 + pulse * 17, (7 + pulse * 17) * 0.55, 0, 0, 7); g.stroke();
  const by = hy - 6 - Math.abs(Math.sin(clock * 3.2)) * 3;
  g.fillStyle = '#e0574a'; g.strokeStyle = '#fff4e4'; g.lineWidth = 2; g.beginPath(); g.moveTo(hx, hy + 2); g.bezierCurveTo(hx - 3, by - 6, hx - 15, by - 12, hx - 14, by - 24); g.arc(hx, by - 24, 14, Math.PI, 0); g.bezierCurveTo(hx + 15, by - 12, hx + 3, by - 6, hx, hy + 2); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = '#fdf6e6'; g.beginPath(); g.arc(hx, by - 24, 11, 0, 7); g.fill();
  g.save(); g.beginPath(); g.arc(hx, by - 24, 11, 0, 7); g.clip(); Art.person(g, 'hero', 'hero', 'd', 0, hx, by + 1, 0.78); g.restore();
  g.restore();
  // 見出し
  drawRibbon(W / 2, 2, 168, 'せかいの ちず');
  txt(`いま: ${world.map.name}`, 16, 18, { size: 14, w: 900, color: '#ffe0a8' });
  panel(552, 4, 76, 24, { r: 6, fill: '#2c2540', stroke: '#f0dcc0', plain: true }); txt('とじる', 590, 16.5, { size: 13, align: 'center', color: '#fff6e6' }); ui.hits.push({ x: 546, y: 0, w: 90, h: 32, act: () => pushBtn('b') });
  // 下の せつめい
  const m = MAPS[sel], seen = visitedMap(sel), here = sel === world.map.id;
  panel(6, 308, 628, 48, { r: 7, plain: true });
  txt(m.name + (here ? '(いま ここ)' : ''), 20, 323, { size: 15, w: 900, color: here ? ACCENT : INK });
  const bits = [seen ? '行った ことが ある' : 'まだ 行っていない'];
  if (m.lv) bits.push(`野生 Lv${m.lv[0]}〜${m.lv[1]}`);
  if (LIT_NAME[sel]) bits.push(S.flags['lit_' + sel] ? `${LIT_NAME[sel]}: ともった` : `${LIT_NAME[sel]}: まだ`);
  if (WM_STORY[sel]) bits.push(S.flags[WM_STORY[sel]] ? '寄り道の 話: ★ 見た' : '寄り道の 話: まだ');
  if (sel === nextGoalMap()) bits.push('つぎの めやす');
  txt(bits.join('　・　'), 20, 343, { size: 12, color: '#5c5470' });
  const mons = [...new Set((m.grass || []).map(([x]) => x))];
  mons.slice(0, 8).forEach((sp, i) => { const x = 626 - (Math.min(mons.length, 8) - i) * 31; if (S.seen[sp]) g.drawImage(Art.sprites[sp], x, 309, 31, 31); else txt('？', x + 15, 326, { size: 15, align: 'center', color: MUTED }); });
}
const LIT_NAME = { town: '町の あかり', town2: '団地の あかり', town3: '港の あかり', town4: '山の あかり' };
// 地図を ひらく。矢印で 場所を えらび、B か「とじる」で もどる
async function mapScreen() {
  const prev = ui.overlay, dialog = ui.dialog; ui.dialog = null;
  world.mapSel = world.map.id; const t0 = clock; Aud.sfx('ok');
  ui.overlay = () => drawWorldMap(world.mapSel, clock - t0); flushBtn();
  for (;;) {
    const b = await nextBtn();
    if (b === 'b' || b === 'menu' || b === 'map') break;
    const i = WM_ORDER.indexOf(world.mapSel), n = WM_ORDER.length, j = b === 'left' || b === 'up' ? (i + n - 1) % n : b === 'right' || b === 'down' ? (i + 1) % n : i;
    if (j !== i) { world.mapSel = WM_ORDER[j]; Aud.sfx('select'); }
  }
  Aud.sfx('back'); ui.overlay = prev; ui.dialog = dialog;
}
