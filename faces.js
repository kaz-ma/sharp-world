'use strict';
// 表情の差分: 会話の ことばに あわせて、立ち絵の 顔・動き・しるしが かわる。
// ことばの はじめに [joy] のように 書くと、その表情に なる(joy surprise fight angry sad think shy)
function guessEmo(t) {
  if (/ありがと|うれし|やった|かわいい|わあ|♪|♥|たのし/.test(t)) return 'joy';
  if (/えっ|なんと|おお[!、]|ほら!|!\?|！？|ほんとうに ともった/.test(t)) return 'surprise';
  if (/ちがう|そんなはず|まかせられない|わるい 人/.test(t)) return 'angry';
  if (/しょうぶ|いくよ|本気|ためさせ/.test(t)) return 'fight';
  if (/^[^\n]{0,2}……|さびし|まけた|まいった|すまな|こわ/.test(t)) return 'sad';
  if (/^…|かな[。?\n]|かのう|かしら/.test(t)) return 'think';
  return null;
}
// 立ち絵の 動き: { dx, dy, s }
function emoMotion(emo, t) {
  const m = { dx: 0, dy: 0, s: 1 }; if (!emo || calmMotion.matches) return m;
  if (emo === 'surprise' && t < 0.4) m.dy = -Math.sin(t / 0.4 * Math.PI) * 16;
  else if (emo === 'joy' && t < 0.7) m.dy = -Math.abs(Math.sin(t / 0.7 * Math.PI * 2)) * 9;
  else if (emo === 'angry' && t < 0.45) m.dx = Math.sin(t * 60) * 5 * (1 - t / 0.45);
  else if (emo === 'sad') m.dy = Math.min(1, t / 0.5) * 9;
  else if (emo === 'fight') m.s = 1 + Math.min(1, t / 0.18) * 0.045;
  else if (emo === 'shy') m.dx = Math.sin(t * 3) * 2;
  return m;
}
// 気持ちの しるし(まんが ふう)。x,y は しるしの まんなか
function drawEmoMark(emo, x, y, t, s = 1) {
  const pop = Math.min(1, t / 0.18), sc = s * (0.4 + 0.6 * pop + Math.sin(Math.min(t, 0.36) / 0.36 * Math.PI) * 0.22);
  g.save(); g.translate(x, y); g.scale(sc, sc); g.lineCap = 'round'; g.lineJoin = 'round';
  const ink = '#2c2540';
  const stroked = (path, color, w = 3.4) => { g.strokeStyle = '#fff6e8'; g.lineWidth = w + 3; g.beginPath(); path(); g.stroke(); g.strokeStyle = color; g.lineWidth = w; g.beginPath(); path(); g.stroke(); };
  if (emo === 'joy') { const b = Math.sin(t * 5) * 3; g.translate(0, b); stroked(() => { g.moveTo(-2, 8); g.lineTo(-2, -10); g.lineTo(9, -7); }, '#d9735b'); g.fillStyle = '#d9735b'; g.beginPath(); g.ellipse(-6, 9, 5.5, 4, -0.4, 0, 7); g.fill(); }
  else if (emo === 'surprise') { stroked(() => { g.moveTo(-6, -13); g.lineTo(-4, 3); g.moveTo(8, -12); g.lineTo(5, 3); }, '#c9404a', 4.6); g.fillStyle = '#c9404a'; g.beginPath(); g.arc(-3.6, 11, 3, 0, 7); g.arc(4.4, 11, 3, 0, 7); g.fill(); }
  else if (emo === 'angry') { const k = 1 + Math.sin(t * 9) * 0.08; g.scale(k, k); stroked(() => { for (const [a, b] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) { g.moveTo(a * 3, b * 12); g.quadraticCurveTo(a * 3.4, b * 3.4, a * 12, b * 3); } }, '#c9404a'); }
  else if (emo === 'sad') { g.translate(0, (t * 9) % 12 - 4); g.fillStyle = '#8fc4ee'; g.strokeStyle = ink; g.lineWidth = 1.6; g.beginPath(); g.moveTo(0, -13); g.bezierCurveTo(9, -1, 9, 10, 0, 10); g.bezierCurveTo(-9, 10, -9, -1, 0, -13); g.fill(); g.stroke(); g.fillStyle = '#fff'; g.beginPath(); g.ellipse(-3, 3, 1.8, 3, 0.3, 0, 7); g.fill(); }
  else if (emo === 'think') { g.fillStyle = '#fbf6ec'; g.strokeStyle = ink; g.lineWidth = 1.8; g.beginPath(); g.roundRect(-17, -10, 34, 20, 10); g.fill(); g.stroke(); g.fillStyle = ink; for (let i = 0; i < 3; i++) { g.globalAlpha = (t * 2.4) % 3.6 > i * 0.9 ? 1 : 0.22; g.beginPath(); g.arc(-8 + i * 8, 0, 2.3, 0, 7); g.fill(); } }
  else if (emo === 'fight') { for (let i = 0; i < 3; i++) { const a = -2.2 + i * 0.62, r = 8 + Math.sin(t * 10 + i) * 2; stroked(() => { g.moveTo(Math.cos(a) * r, Math.sin(a) * r); g.lineTo(Math.cos(a) * (r + 10), Math.sin(a) * (r + 10)); }, '#e08a2e', 3.6); } }
  else if (emo === 'shy') { stroked(() => { for (let i = 0; i < 3; i++) { g.moveTo(-9 + i * 8, 6); g.lineTo(-4 + i * 8, -6); } }, '#e0607f', 2.6); }
  g.restore();
}
// 立ち絵(core.js の drawSpeaker から)
function drawSpeakerPortrait(sp, k) {
  if (k <= 0) return;
  const emo = sp.emo || null, t = clock - (sp.emoAt || 0), m = emoMotion(emo, t), img = Art.portrait(emo ? sp.id + '@' + emo : sp.id);
  const h = 232 * m.s, w = img.width * h / img.height, x = 14 + (1 - ease(k)) * -34 + m.dx;
  g.save(); g.globalAlpha = clamp(k, 0, 1); g.drawImage(img, x - (w - w / m.s) / 2, 296 - h + m.dy, w, h);
  if (emo && ui.dialog) drawEmoMark(emo, x + w / m.s * 0.8, 296 - 232 * 0.8 + m.dy, t, 1.15);
  g.restore();
}
// 戦闘中の モンスターの 気分(ねむり・まひ・ぐったり)
function drawMonMood(m, st, x, y) {
  if (!m || !st || !st.vis || st.a < 0.9 || m.hp <= 0) return;
  if (m.st === 'sleep') drawZzz(x, y + 16);
  else if (m.st === 'para') { if ((clock * 2.2) % 1 < 0.55) { g.save(); g.strokeStyle = '#ffe36a'; g.lineWidth = 2.6; g.lineJoin = 'round'; for (let i = 0; i < 2; i++) { const px = x - 6 + i * 22, py = y + i * 14 + Math.sin(clock * 40) * 1.5; g.beginPath(); g.moveTo(px, py); g.lineTo(px + 7, py + 8); g.lineTo(px + 1, py + 9); g.lineTo(px + 8, py + 18); g.stroke(); } g.restore(); } }
  else if (m.st === 'burn') { g.save(); for (let i = 0; i < 3; i++) { const k = (clock * 0.9 + i / 3) % 1; g.globalAlpha = 1 - k; g.fillStyle = i % 2 ? '#ff8a3c' : '#ffc24a'; g.beginPath(); g.ellipse(x - 12 + i * 14, y + 24 - k * 26, 3.4 * (1 - k * 0.5), 6 * (1 - k * 0.5), 0, 0, 7); g.fill(); } g.restore(); }
  else if (m.hp / m.max <= 0.25) drawEmoMark('sad', x, y + 10, (clock % 100) + 1, 0.8);
}
