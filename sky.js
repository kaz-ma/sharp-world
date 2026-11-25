'use strict';
// 時間と 天気: あさ → ひる → ゆうがた → よる(歩いている 時間で すすむ)。天気は ときどき かわる
const DAY = 720; // ゲームの 1日(秒)
// [1日の中の 秒, 画面に かける色, 夜の こさ]
const SKY_KEY = [[0, [228, 234, 246], 0], [70, [247, 245, 240], 0], [140, [255, 255, 255], 0], [390, [255, 255, 255], 0], [445, [255, 221, 184], 0], [495, [230, 182, 184], 0.35], [545, [108, 118, 184], 1], [660, [108, 118, 184], 1], [695, [168, 166, 208], 0.45], [720, [228, 234, 246], 0]];
let skyDbg = null, wxDbg = null; // ?debug 用
const dayTime = () => (skyDbg != null ? skyDbg : ((S.time % DAY) + DAY) % DAY);
const dayNumber = () => Math.floor(S.time / DAY) + 1;
function skyNow() {
  const t = dayTime(); let i = 0; while (i < SKY_KEY.length - 2 && t >= SKY_KEY[i + 1][0]) i++;
  const A = SKY_KEY[i], B = SKY_KEY[i + 1], k = clamp((t - A[0]) / (B[0] - A[0]), 0, 1);
  return { t, rgb: A[1].map((v, j) => lerp(v, B[1][j], k)), night: lerp(A[2], B[2], k) };
}
const skyNight = () => skyNow().night;
const isNight = () => skyNight() > 0.5;
const phaseName = () => { const t = dayTime(); return t < 130 || t >= 700 ? 'あさ' : t < 400 ? 'ひる' : t < 520 ? 'ゆうがた' : 'よる'; };
// 天気: 200秒ごとに きまる(同じ 時間なら 同じ 天気)。さいしょは はれ
const WX_NAME = { clear: 'はれ', cloud: 'くもり', rain: 'あめ', mist: 'きり' };
function weather() {
  if (wxDbg) return wxDbg;
  const seg = Math.floor(S.time / 200); if (seg <= 1) return 'clear';
  const v = Math.sin(seg * 91.37 + 17.3) * 43758.5453, r = v - Math.floor(v);
  const w = r < 0.56 ? 'clear' : r < 0.75 ? 'cloud' : r < 0.91 ? 'rain' : 'mist';
  return w === 'rain' && typeof world !== 'undefined' && world.map.id === 'ridge' ? 'mist' : w; // 尾根は 雨の かわりに 霧
}
const isRaining = () => weather() === 'rain';
const weatherFog = () => (weather() === 'mist' ? 0.28 : 0);
const skyLabel = () => `${phaseName()} ・ ${isNight() && weather() === 'clear' ? 'ほしぞら' : WX_NAME[weather()]}`;
function skipToNight() { const t = dayTime(); if (t < 560 || t > 640) S.time = Math.floor(S.time / DAY) * DAY + (t > 640 ? DAY : 0) + 570; }
function skipToMorning() { S.time = (Math.floor(S.time / DAY) + 1) * DAY + 20; }
// 夜や 雨の日に あつまる子(草むら)
function skyGrass() {
  const out = [];
  if (isNight()) out.push(['hotaruusagi', 12]);
  if (isRaining()) out.push(['hinatagaeru', 10], ['shizukufin', 5]);
  return out;
}

const rnd1 = (n) => { const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
// フィールドの 上に、時間の 色と 天気を かさねる(あかりの場面の 夜は べつに 描くので 何もしない)
function drawSky(m, cx, cy) {
  if (world.night > 0) return;
  const s = skyNow(), w = weather(), heavy = gradeLevel >= 2, calm = calmMotion.matches;
  const dim = w === 'rain' ? [0.8, 0.85, 0.93] : w === 'cloud' ? [0.9, 0.915, 0.94] : [1, 1, 1];
  const col = s.rgb.map((v, i) => Math.round(v * dim[i]));
  g.save();
  if (col.some((v) => v < 250)) { g.globalCompositeOperation = 'multiply'; g.fillStyle = `rgb(${col[0]},${col[1]},${col[2]})`; g.fillRect(0, 0, VW, H); }
  const eve = clamp(1 - Math.abs(s.t - 455) / 75, 0, 1);
  if (eve > 0 && w === 'clear') { g.globalCompositeOperation = 'screen'; const gr = g.createLinearGradient(VW, 0, 0, H); gr.addColorStop(0, `rgba(255,150,90,${0.28 * eve})`); gr.addColorStop(0.7, 'rgba(255,150,90,0)'); g.fillStyle = gr; g.fillRect(0, 0, VW, H); }
  if (w === 'cloud' || w === 'rain') { // 雲の 大きな かげ
    g.globalCompositeOperation = 'multiply';
    for (let i = 0; i < 3; i++) { const x = ((i * 420 + clock * (11 + i * 4)) % (VW + 600)) - 300, y = 40 + i * 120, r = 190, gr = g.createRadialGradient(x, y, 20, x, y, r); gr.addColorStop(0, 'rgba(150,160,184,.3)'); gr.addColorStop(1, 'rgba(150,160,184,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); }
  }
  g.globalCompositeOperation = 'screen';
  if (s.night > 0.05) {
    if (m.bg && w === 'clear') for (let i = 0; i < 46; i++) { const wx = rnd1(i) * m.w * TS, wy = 6 + rnd1(i + 60) * 130, x = wx - cx, y = wy - cy; if (x < -4 || x > VW + 4 || y < -4 || y > H) continue; const a = s.night * (0.35 + 0.65 * Math.abs(Math.sin(clock * (0.6 + (i % 5) * 0.23) + i))); Art.star(g, x, y, 1.2 + (i % 3) * 0.6, `rgba(255,244,214,${a})`); }
    const p = world.p, glow = (x, y, r, rgb, a) => { const gr = g.createRadialGradient(x, y, 1, x, y, r); gr.addColorStop(0, `rgba(${rgb},${a})`); gr.addColorStop(1, `rgba(${rgb},0)`); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); };
    glow((p.x + p.ox) * TS + 16 - cx, (p.y + p.oy) * TS + 10 - cy, 66, '150,160,220', 0.16 * s.night);
    const lead = leadMon();
    if (lead && typeOf(lead) === 'fire') { const f = world.fol; glow((f.x + f.ox) * TS + 16 - cx, (f.y + f.oy) * TS + 14 - cy, 104 + Math.sin(clock * 3) * 5, '255,196,120', 0.46 * s.night); } // 火の 子は 夜道を てらす
  }
  const wild = m.grass || m.theme || m.id === 'village';
  if (wild && s.night > 0.4 && (w === 'clear' || w === 'mist')) { // ほたる
    const n = heavy ? 22 : 10, span = m.w * TS, spanY = m.h * TS;
    for (let i = 0; i < n * 3; i++) { const x = rnd1(i + 5) * span + Math.sin(clock * 0.5 + i) * 18 - cx, y = rnd1(i + 205) * spanY + Math.cos(clock * 0.7 + i * 2) * 12 - cy; if (x < -8 || x > VW + 8 || y < -8 || y > H + 8) continue; const a = s.night * Math.max(0, Math.sin(clock * (1.1 + (i % 4) * 0.35) + i * 1.7)); if (a <= 0.03) continue; const gr = g.createRadialGradient(x, y, 0.5, x, y, 7); gr.addColorStop(0, `rgba(220,255,160,${a})`); gr.addColorStop(1, 'rgba(180,255,120,0)'); g.fillStyle = gr; g.fillRect(x - 7, y - 7, 14, 14); }
  }
  g.globalCompositeOperation = 'source-over';
  if (!calm && w === 'clear' && s.night < 0.3 && (m.theme === 'forest' || m.theme === 'station') && heavy) { // 舞う 葉
    g.fillStyle = m.theme === 'station' ? 'rgba(214,150,80,.75)' : 'rgba(190,220,140,.7)';
    for (let i = 0; i < 10; i++) { const x = ((rnd1(i + 9) * (VW + 100) + clock * (14 + i * 3)) % (VW + 100)) - 50 + Math.sin(clock * 1.3 + i) * 14, y = (rnd1(i + 19) * H + clock * (22 + (i % 3) * 9)) % (H + 20) - 10; g.save(); g.translate(x, y); g.rotate(clock * 1.4 + i); g.beginPath(); g.ellipse(0, 0, 4.6, 2.2, 0, 0, 7); g.fill(); g.restore(); }
  }
  if (w === 'rain') {
    const n = heavy ? 120 : 55;
    g.strokeStyle = 'rgba(214,228,244,.5)'; g.lineWidth = 1.1; g.beginPath();
    for (let i = 0; i < n; i++) { const sp = 460 + (i % 5) * 70, y = ((rnd1(i) * (H + 60) + (calm ? 0 : clock * sp)) % (H + 60)) - 30, x = ((rnd1(i + 300) * (VW + 80) - y * 0.18) % (VW + 80) + VW + 80) % (VW + 80) - 40; g.moveTo(x, y); g.lineTo(x - 2.6, y + 13); }
    g.stroke();
    g.strokeStyle = 'rgba(226,238,250,.55)'; g.lineWidth = 1;
    for (let i = 0; i < (heavy ? 20 : 8); i++) { const ph = clock * 1.9 + rnd1(i + 40) * 7, k = ph % 1, c = Math.floor(ph), x = rnd1(i * 13 + c) * VW, y = 90 + rnd1(i * 29 + c + 3) * (H - 90); g.globalAlpha = 1 - k; g.beginPath(); g.ellipse(x, y, 2 + k * 8, (2 + k * 8) * 0.36, 0, 0, 7); g.stroke(); }
    g.globalAlpha = 1;
  }
  g.restore();
}
// 戦闘の 背景にも、うすく 時間と 雨を
function drawBattleSky() {
  const s = skyNow(), w = weather();
  if (s.night > 0.05) { g.save(); g.globalCompositeOperation = 'multiply'; const m = (v) => Math.round(lerp(255, v, s.night * 0.62)); g.fillStyle = `rgb(${m(112)},${m(122)},${m(190)})`; g.fillRect(0, 0, W, H); g.restore(); }
  if (w === 'rain') { g.save(); g.strokeStyle = 'rgba(214,228,244,.4)'; g.lineWidth = 1; g.beginPath(); for (let i = 0; i < 60; i++) { const y = ((rnd1(i) * 300 + (calmMotion.matches ? 0 : clock * (430 + (i % 4) * 60))) % 300) - 20, x = rnd1(i + 300) * (W + 40) - y * 0.18; g.moveTo(x, y); g.lineTo(x - 2.6, y + 13); } g.stroke(); g.restore(); }
}
// メニューを ひらいている あいだ、旅の 日にちと 空もようを 出す
function drawSkyChip() {
  if (!ui.skyChip || !ui.choice || ui.overlay || ui.dialog) return;
  const t = `旅の ${dayNumber()}日め ・ ${skyLabel()}`; g.font = `700 13px ${FONT}`; const w = g.measureText(t).width + 26;
  panel(10, 10, w, 26, { r: 13, fill: '#faf8f5' }); txt(t, 23, 23.5, { size: 13 });
}
