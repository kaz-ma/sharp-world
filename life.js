'use strict';
// 人物と 仲間の 仕草: 息づかい・まばたき・ふりむき・その人らしい くせ・ふきだし
// NPC ごとの くせ: hop=はねる, nod=うなずく, sway=ゆれる, fish=さおを ふる, read=本を よむ, paint=ふでを うごかす, look=空を みあげる, wipe=手を うごかす
const HABIT = { child: 'hop', girl: 'sway', nboy: 'hop', yboy: 'hop', dockgirl: 'sway', granny: 'nod', ygranny: 'nod', elder: 'nod', oldman: 'nod', keeper: 'nod', fisher: 'fish', teacher: 'read', painter: 'paint', stargazer: 'look', stationman: 'look', clerk: 'wipe', farmer: 'wipe', nurse: 'sway', minato3: 'look', traveler: 'sway', woodsman: 'wipe' };
// 近づいた ときに 出る ふきだし(1回ずつ)
const GREET = { child: '♪', girl: '♪', nboy: '!', yboy: '!', dockgirl: '♪', granny: '…♪', ygranny: '…♪', elder: '…', oldman: '…', nurse: '♥', clerk: '♪', fisher: '…', teacher: '!', farmer: '♪', painter: '♪', stationman: '…', stargazer: '☆', keeper: '…', minato3: '!', traveler: '♪' };
const phaseOf = (id) => { let s = 0; for (let i = 0; i < id.length; i++) s += id.charCodeAt(i) * (i + 3); return (s % 97) / 10; };
const near = (n) => Math.abs(n.x - world.p.x) + Math.abs(n.y - world.p.y);
// いまの 仕草を 決める(描く 直前に 呼ぶ)
function gestureOf(n) {
  const t = clock + phaseOf(n.id), moving = n.ox || n.oy, G = { dir: n.dir, dy: 0, dx: 0, sy: 1, blink: (t % 3.7) < 0.13, prop: null, bubble: null };
  if (moving) { n.greetAt = null; return G; }
  const d = near(n);
  G.sy = 1 + Math.sin(t * 2.1) * 0.018; // 息づかい
  if (d <= 3 && !n.trainer) { // 近くに 来たら、こちらを 向いて ひとこと
    if (!n.guest) { const dx = world.p.x - n.x, dy = world.p.y - n.y; G.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'r' : 'l') : (dy > 0 ? 'd' : 'u'); }
    if (!n.greeted) { n.greeted = true; n.greetAt = clock; }
  } else if (d > 6) n.greeted = false;
  if (n.greetAt != null && clock - n.greetAt < 1.6 && GREET[n.id]) G.bubble = { text: GREET[n.id], k: (clock - n.greetAt) / 1.6 };
  if (ui.dialog && ui.speaker && ui.speaker.id === n.id) { G.dy = -Math.abs(Math.sin(clock * 7)) * 1.6; return G; } // 話している あいだ
  const h = HABIT[n.id] || (n.trainer ? 'ready' : null), c = t % 6.5;
  if (h === 'hop' && c < 0.9) G.dy = -Math.abs(Math.sin(c / 0.9 * Math.PI * 2)) * 5;
  else if (h === 'nod' && c < 1.1) G.dy = Math.abs(Math.sin(c / 1.1 * Math.PI * 2)) * 2;
  else if (h === 'sway' && c < 2.4) G.dx = Math.sin(c / 2.4 * Math.PI * 4) * 1.8;
  else if (h === 'ready' && c < 0.7) G.dy = -Math.abs(Math.sin(c / 0.7 * Math.PI * 2)) * 2.4;
  else if (h === 'look' && c < 2.2 && d > 3) { G.dir = 'u'; if (c > 0.5 && n.id === 'stargazer') G.bubble = G.bubble || { text: '☆', k: (c - 0.5) / 1.7 }; }
  else if (h === 'wipe' && c < 1.6) { G.dx = Math.sin(c * 14) * 1.2; G.prop = 'cloth'; }
  if (h === 'fish') G.prop = 'rod';
  if (h === 'read' && d > 3) G.prop = 'book';
  if (h === 'paint' && d > 3) G.prop = 'brush';
  return G;
}
function drawProp(kind, dir, x, y, t) {
  const s = dir === 'l' ? -1 : 1;
  g.save(); g.lineCap = 'round';
  if (kind === 'rod') { const a = Math.sin(t * 1.6) * 2.5; g.strokeStyle = '#7a5636'; g.lineWidth = 2; g.beginPath(); g.moveTo(x + s * 8, y - 14); g.lineTo(x + s * 30, y - 34 + a); g.stroke(); g.strokeStyle = 'rgba(240,244,248,.8)'; g.lineWidth = 0.9; g.beginPath(); g.moveTo(x + s * 30, y - 34 + a); g.quadraticCurveTo(x + s * 36, y - 20 + a, x + s * 34, y - 6 + a * 0.4); g.stroke(); g.fillStyle = '#e0574a'; g.beginPath(); g.arc(x + s * 34, y - 6 + a * 0.4, 2, 0, 7); g.fill(); }
  else if (kind === 'book') { g.fillStyle = '#8a4a52'; g.fillRect(x - 8, y - 17, 16, 10); g.fillStyle = '#f4efe2'; g.fillRect(x - 7, y - 16, 6.4, 8); g.fillRect(x + 0.6, y - 16, 6.4, 8); if (t % 4 < 0.3) { g.fillStyle = '#e8e0cc'; g.beginPath(); g.moveTo(x, y - 16); g.lineTo(x + 5, y - 20); g.lineTo(x + 1, y - 8); g.fill(); } }
  else if (kind === 'brush') { const a = Math.sin(t * 5) * 3; g.strokeStyle = '#7a5636'; g.lineWidth = 1.8; g.beginPath(); g.moveTo(x + s * 9, y - 13); g.lineTo(x + s * 17, y - 20 + a); g.stroke(); g.fillStyle = '#4a6a9a'; g.beginPath(); g.arc(x + s * 17.6, y - 20.6 + a, 2.2, 0, 7); g.fill(); }
  else if (kind === 'cloth') { g.fillStyle = '#eeeaf1'; g.beginPath(); g.ellipse(x + s * 12 + Math.sin(t * 14) * 3, y - 14, 4.5, 3.4, 0.4, 0, 7); g.fill(); }
  g.restore();
}
function drawBubble(text, x, y, k) {
  const pop = Math.min(1, k * 7), a = k > 0.82 ? (1 - k) / 0.18 : 1;
  g.save(); g.globalAlpha = clamp(a, 0, 1); g.translate(x, y - (1 - pop) * -4); g.scale(pop, pop);
  g.fillStyle = '#faf8f5'; g.strokeStyle = '#37323f'; g.lineWidth = 1.6;
  const w = text.length > 1 ? 30 : 22; g.beginPath(); g.roundRect(-w / 2, -20, w, 18, 8); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(-4, -3); g.lineTo(0, 3); g.lineTo(3, -3); g.closePath(); g.fill(); g.beginPath(); g.moveTo(-4, -2.4); g.lineTo(0, 3); g.lineTo(3, -2.4); g.stroke();
  txt(text, 0, -10.5, { size: 12, align: 'center', w: 900, color: text === '♥' ? '#e0607f' : '#37323f' });
  g.restore();
}

// ---------- ついて歩く子の 仕草: とまっていると まわりを 見たり、ねむったり ----------
const folState = { at: 0, key: '' };
function followerPose(lead) {
  const f = world.fol, p = world.p, key = `${world.map.id},${p.x},${p.y},${p.dir},${f.x},${f.y}`;
  if (key !== folState.key || busy || f.ox || f.oy) { folState.key = key; folState.at = clock; }
  const idle = clock - folState.at, P = { dy: 0, sx: 1, sy: 1, flip: false, bubble: null, sleep: false };
  const drowsy = lead.st === 'sleep' || (idle > 22) || (idle > 10 && typeof isNight === 'function' && isNight());
  if (drowsy) { P.sleep = true; P.sy = 0.86 + Math.sin(clock * 1.8) * 0.03; P.sx = 1.08; return P; }
  if (idle > 3) {
    const c = (idle - 3) % 7;
    if (c < 1.2) P.flip = true; // あたりを 見まわす
    else if (c > 3 && c < 3.7) { P.dy = -Math.abs(Math.sin((c - 3) / 0.7 * Math.PI * 2)) * (bondLv(lead) >= 2 ? 7 : 4); if (bondLv(lead) >= 2) P.bubble = { text: '♪', k: (c - 3) / 0.7 }; }
    else if (c > 5.2 && c < 6.6) P.bubble = { text: typeof isRaining === 'function' && isRaining() ? (typeOf(lead) === 'water' ? '♪' : '…') : '・・', k: (c - 5.2) / 1.4 };
  }
  P.sy = 1 + Math.sin(clock * 2.4) * 0.025;
  return P;
}
function drawZzz(x, y) {
  for (let i = 0; i < 3; i++) { const k = (clock * 0.55 + i / 3) % 1; g.globalAlpha = (1 - k) * 0.95; txt('z', x + 8 + k * 14 + Math.sin(k * 6) * 2, y - 6 - k * 26, { size: 9 + k * 7, w: 900, color: '#f4f1ff', stroke: 'rgba(50,40,70,.75)', sw: 3 }); }
  g.globalAlpha = 1;
}
// 主人公も、しばらく 立ち止まると あたりを 見る
function heroIdleDir() {
  const p = world.p, idle = clock - folState.at;
  if (busy || p.ox || p.oy || idle < 9) return p.dir;
  const c = (idle - 9) % 8; return c < 0.9 ? 'l' : c < 1.8 ? 'r' : c < 2.7 ? 'd' : p.dir;
}
