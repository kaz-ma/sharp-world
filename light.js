'use strict';
// 町の あかりが ともる場面: 夜になる → 街灯が 順に ともる → 町の景色の 一枚絵 → 町の人の ひとこと
const LIGHT = {
  town: { title: 'ひだまり町に あかりが ともった', people: [['girl', 'わあ…! 町が、きらきら してる!']] },
  town2: { title: 'ミドリ団地に あかりが ともった', people: [['farmer', 'まあ…! ハウスの 中まで、あかるく なったよ。'], ['nboy', 'ロボットが 手を ふってる! ほら!']] },
  town3: { title: 'ナギサ港に あかりが ともった', people: [['fisher', '灯台が…まわってる。\nこの ひかりを、ずっと まってたんだ。'], ['dockgirl', 'みて! 沖の 船が、あかりで こたえてる!']] },
};
const litCount = () => Object.keys(LIGHT).filter((k) => S.flags['lit_' + k]).length;
const rnd01 = (n) => { const v = Math.sin(n * 127.1 + 11.7) * 43758.5453; return v - Math.floor(v); };
function glowDot(x, y, r, rgb, a) { const gr = g.createRadialGradient(x, y, 1, x, y, r); gr.addColorStop(0, `rgba(${rgb},${a})`); gr.addColorStop(1, `rgba(${rgb},0)`); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); }

// 夜の くらがり。ともった 街灯の まわりと、主人公の まわりだけ 見える
const nightC = document.createElement('canvas'), nightG = nightC.getContext('2d');
function drawNight(m, cx, cy, heroX, heroY) {
  const w = Math.ceil(VW / 2), h = H / 2; if (nightC.width !== w || nightC.height !== h) { nightC.width = w; nightC.height = h; }
  nightG.globalCompositeOperation = 'source-over'; nightG.clearRect(0, 0, w, h); nightG.fillStyle = `rgba(8,12,38,${world.night})`; nightG.fillRect(0, 0, w, h);
  nightG.globalCompositeOperation = 'destination-out';
  const hole = (x, y, r, a) => { const gr = nightG.createRadialGradient(x / 2, y / 2, 1, x / 2, y / 2, r / 2); gr.addColorStop(0, `rgba(0,0,0,${a})`); gr.addColorStop(0.55, `rgba(0,0,0,${a * 0.65})`); gr.addColorStop(1, 'rgba(0,0,0,0)'); nightG.fillStyle = gr; nightG.fillRect((x - r) / 2, (y - r) / 2, r, r); };
  hole(heroX, heroY - 16, 70, 0.55);
  (m.lamps || []).forEach((L, i) => { const k = world.lampK ? world.lampK[i] : 1; if (k > 0) hole(L.x - cx, L.y - cy + 40, 90 + 90 * k, Math.min(1, k)); });
  g.drawImage(nightC, 0, 0, VW, H);
}

// ---------- 町の景色の 一枚絵(コードで描く + いまある 人物と モンスターの絵) ----------
function drawVista(id, t, count) {
  const x0 = -OX, x1 = W + OX, base = 232, on = (delay, dur = 0.5) => clamp((t - delay) / dur, 0, 1);
  const sky = g.createLinearGradient(0, 0, 0, base); sky.addColorStop(0, '#161d45'); sky.addColorStop(0.55, '#4a4274'); sky.addColorStop(1, count >= 3 ? '#f0a778' : count === 2 ? '#d68b80' : '#b97c86');
  g.fillStyle = sky; g.fillRect(x0, 0, VW, H);
  for (let i = 0; i < 60; i++) { const a = (0.3 + 0.7 * Math.abs(Math.sin(clock * (0.6 + (i % 5) * 0.2) + i))) * (1 - i / 120); Art.star(g, x0 + rnd01(i) * VW, rnd01(i + 90) * 150, 0.8 + (i % 3) * 0.5, `rgba(255,244,214,${a})`); }
  glowDot(W / 2, base, 360, '255,190,120', 0.18 + 0.32 * on(0.6, 2.4));
  g.fillStyle = '#51456e'; g.beginPath(); g.moveTo(x0, 190); g.quadraticCurveTo(W * 0.2, 140, W * 0.45, 178); g.quadraticCurveTo(W * 0.75, 215, x1, 160); g.lineTo(x1, H); g.lineTo(x0, H); g.fill();
  const win = (x, y, w, h, i, col = '255,214,130') => { const k = on(0.5 + rnd01(i) * 2.2, 0.25); g.fillStyle = k > 0 ? `rgba(${col},${0.25 + 0.75 * k})` : 'rgba(20,18,40,.6)'; g.fillRect(x, y, w, h); if (k > 0) glowDot(x + w / 2, y + h / 2, 11, col, 0.35 * k); };
  const house = (x, w, h, i) => { g.fillStyle = i % 2 ? '#2c2750' : '#352d58'; g.fillRect(x, base - h, w, h + 8); g.beginPath(); g.moveTo(x - 5, base - h + 1); g.lineTo(x + w / 2, base - h - 20); g.lineTo(x + w + 5, base - h + 1); g.fill(); for (let c = 0; c < Math.floor((w - 8) / 18); c++) for (let r = 0; r < Math.floor((h - 6) / 22); r++) win(x + 8 + c * 18, base - h + 8 + r * 22, 8, 11, i * 17 + c * 5 + r); };
  const pole = (x, top, i) => { g.strokeStyle = '#17142e'; g.lineWidth = 3; g.beginPath(); g.moveTo(x, base + 8); g.lineTo(x, top); g.moveTo(x - 11, top + 7); g.lineTo(x + 11, top + 5); g.stroke(); const k = on(0.35 + i * 0.28, 0.3); if (k > 0) { g.fillStyle = `rgba(255,246,214,${k})`; g.beginPath(); g.arc(x, top + 20, 4.2, 0, 7); g.fill(); glowDot(x, top + 20, 46, '255,196,120', 0.75 * k); } };
  if (id === 'town2') { // ビニールハウスと ドローン
    for (let i = 0, x = x0 - 20; x < x1; i++, x += 118) {
      const r = 46 + (i % 3) * 9, k = on(0.5 + rnd01(i + 4) * 2, 0.6), cx = x + r;
      g.fillStyle = '#28324f'; g.beginPath(); g.arc(cx, base + 4, r, Math.PI, 0); g.fill();
      if (k > 0) { g.save(); g.beginPath(); g.arc(cx, base + 4, r - 3, Math.PI, 0); g.clip(); const gr = g.createRadialGradient(cx, base, 2, cx, base, r); gr.addColorStop(0, `rgba(190,255,190,${0.85 * k})`); gr.addColorStop(1, `rgba(120,210,200,${0.25 * k})`); g.fillStyle = gr; g.fillRect(cx - r, base - r, r * 2, r + 8); g.restore(); glowDot(cx, base - r / 2, r + 26, '150,240,200', 0.3 * k); }
      g.strokeStyle = 'rgba(225,215,255,.5)'; g.lineWidth = 1.2; for (const s of [1, 0.66, 0.32]) { g.beginPath(); g.ellipse(cx, base + 4, r * s, r, 0, Math.PI, 0); g.stroke(); }
    }
    for (let i = 0; i < 5; i++) { const k = on(1.2 + i * 0.3, 0.4), dx = x0 + ((rnd01(i + 33) * VW + clock * (14 + i * 6)) % VW), dy = 92 + i * 17 + Math.sin(clock * 2 + i) * 6; if (k <= 0) continue; g.strokeStyle = `rgba(20,18,40,${k})`; g.lineWidth = 2; g.beginPath(); g.moveTo(dx - 9, dy); g.lineTo(dx + 9, dy); g.stroke(); g.fillStyle = `rgba(20,18,40,${k})`; g.fillRect(dx - 4, dy - 2, 8, 6); glowDot(dx, dy + 4, 9, Math.sin(clock * 6 + i) > 0 ? '255,120,160' : '130,240,255', 0.9 * k); }
  } else if (id === 'town3') { // 海と 灯台
    for (let i = 0, x = x0 - 8; x < W * 0.52; i++, x += 62 + (i % 3) * 8) house(x, 40 + (i % 3) * 8, 26 + (i % 4) * 9, i + 3);
    const sea = g.createLinearGradient(0, base - 8, 0, base + 60); sea.addColorStop(0, '#3a4a76'); sea.addColorStop(1, '#161a3a'); g.fillStyle = sea; g.beginPath(); g.moveTo(W * 0.5, base - 6); g.lineTo(x1, base - 10); g.lineTo(x1, H); g.lineTo(W * 0.44, H); g.fill();
    const lx = W * 0.82, ly = 96, k = on(1.5, 0.7);
    g.fillStyle = '#231f45'; g.beginPath(); g.moveTo(lx - 19, base + 2); g.lineTo(lx - 10, ly + 12); g.lineTo(lx + 10, ly + 12); g.lineTo(lx + 19, base + 2); g.fill(); g.fillRect(lx - 13, ly - 8, 26, 20); g.beginPath(); g.moveTo(lx - 15, ly - 7); g.lineTo(lx, ly - 23); g.lineTo(lx + 15, ly - 7); g.fill();
    if (k > 0) { g.save(); g.globalCompositeOperation = 'screen'; const a = t * 0.9; for (const side of [0, Math.PI]) { const dir = Math.cos(a + side), len = 420 * Math.abs(dir) + 40, s = dir >= 0 ? 1 : -1; const gr = g.createLinearGradient(lx, ly, lx + s * len, ly); gr.addColorStop(0, `rgba(255,232,170,${0.55 * k})`); gr.addColorStop(1, 'rgba(255,220,150,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(lx, ly - 3); g.lineTo(lx + s * len, ly - 30 + Math.sin(a + side) * 18); g.lineTo(lx + s * len, ly + 34 + Math.sin(a + side) * 18); g.lineTo(lx, ly + 5); g.fill(); } g.restore(); glowDot(lx, ly + 1, 58, '255,224,160', 0.9 * k); g.fillStyle = `rgba(255,250,224,${k})`; g.fillRect(lx - 8, ly - 4, 16, 11); }
    for (let i = 0; i < 9; i++) { const rk = on(1.7 + i * 0.08, 0.5); g.fillStyle = `rgba(255,222,160,${rk * (0.25 + 0.25 * Math.abs(Math.sin(clock * 2 + i)))})`; g.fillRect(lx - 16 + Math.sin(clock * 1.7 + i) * 7, base + 4 + i * 5, 32 - i * 2.4, 2); }
    for (let i = 0; i < 3; i++) { const bx = W * 0.56 + i * 62, by = base + 2 + i * 7 + Math.sin(clock * 1.6 + i) * 1.5, bk = on(2.2 + i * 0.35, 0.3); g.fillStyle = '#12102a'; g.beginPath(); g.moveTo(bx - 20, by); g.lineTo(bx + 20, by); g.lineTo(bx + 13, by + 8); g.lineTo(bx - 14, by + 8); g.fill(); g.fillRect(bx - 1, by - 15, 2, 15); if (bk > 0) glowDot(bx, by - 15, 15, '255,200,130', bk); }
  } else { // 家なみと 電線
    for (let i = 0, x = x0 - 12; x < x1; i++, x += 74 + (i % 3) * 10) house(x, 50 + (i % 3) * 12, 34 + ((i * 7) % 5) * 11, i);
  }
  if (id !== 'town3') { const xs = [x0 + 40, W * 0.22, W * 0.52, W * 0.74, x1 - 44]; g.strokeStyle = 'rgba(20,16,40,.75)'; g.lineWidth = 1.2; for (let i = 0; i < xs.length - 1; i++) { g.beginPath(); g.moveTo(xs[i], 140 + (i % 2) * 8); g.quadraticCurveTo((xs[i] + xs[i + 1]) / 2, 170, xs[i + 1], 140 + ((i + 1) % 2) * 8); g.stroke(); } xs.forEach((x, i) => pole(x, 134 + (i % 2) * 8, i)); }
  else [x0 + 50, W * 0.2, W * 0.4].forEach((x, i) => pole(x, 158, i));
  // 手前の丘と、見あげる たびびと・なかま
  g.fillStyle = '#17132c'; g.beginPath(); g.moveTo(x0, 268); g.quadraticCurveTo(W * 0.3, 244, W * 0.6, 266); g.quadraticCurveTo(W * 0.85, 284, x1, 262); g.lineTo(x1, H); g.lineTo(x0, H); g.fill();
  const rise = (1 - ease(on(0.2, 1.1))) * 26;
  const hero = Art.portrait('hero_back'), hh = 158, hw = hero.width * hh / hero.height;
  g.save(); g.globalAlpha = on(0.2, 0.8); g.filter = 'brightness(.72) saturate(.9)'; g.drawImage(hero, 118 - hw / 2, 288 - hh + rise, hw, hh);
  S.party.slice(0, 6).forEach((mon, i) => { const px = 188 + i * 60, bob = Math.abs(Math.sin(clock * 2 + i)) * (t > 2.6 ? 5 : 1.5); g.drawImage(Art.look(mon), px - 33, 284 - 66 * 0.955 - bob + rise + (i % 2) * 5, 66, 66); });
  g.restore();
  // ひかりの つぶ
  for (let i = 0; i < 26; i++) { const k = on(1.4, 1.2); const px = x0 + rnd01(i + 7) * VW + Math.sin(clock * 0.8 + i) * 12, py = 270 - ((clock * (9 + (i % 5) * 4) + rnd01(i + 51) * 220) % 220); glowDot(px, py, 4 + (i % 3) * 2, '255,226,160', 0.75 * k * clamp(py / 120, 0, 1)); }
  // 題字と、ともした数
  const k = on(1.5, 0.6), e = 1 - Math.pow(1 - k, 3);
  if (k > 0) {
    g.save(); g.globalAlpha = e; const gr = g.createLinearGradient(x0, 0, x1, 0); gr.addColorStop(0, 'rgba(20,16,40,0)'); gr.addColorStop(0.2, 'rgba(20,16,40,.78)'); gr.addColorStop(0.8, 'rgba(20,16,40,.78)'); gr.addColorStop(1, 'rgba(20,16,40,0)'); g.fillStyle = gr; g.fillRect(x0, 24, VW, 48); g.fillStyle = '#c25a62'; g.fillRect(W / 2 - 40, 70, 80 * e, 3);
    g.font = `800 27px "Shippori Mincho B1", "Yu Mincho", serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#fbf0da'; g.fillText(LIGHT[id].title, W / 2 - (1 - e) * 60, 48);
    g.restore();
  }
  const n = Object.keys(LIGHT).length;
  for (let i = 0; i < n; i++) { const px = W / 2 - (n - 1) * 15 + i * 30, lit = i < count && (i < count - 1 || t > 2.3), pop = i === count - 1 ? Math.max(0, 1 - Math.abs(t - 2.5) * 3) : 0; g.globalAlpha = on(1.7, 0.4); g.strokeStyle = '#d9cbe4'; g.lineWidth = 1.6; g.fillStyle = lit ? '#ffe7ac' : 'rgba(20,16,40,.7)'; g.beginPath(); g.arc(px, 90, 6 + pop * 5, 0, 7); g.fill(); g.stroke(); if (lit) glowDot(px, 90, 22 + pop * 24, '255,206,130', 0.8); g.globalAlpha = 1; }
}

async function panCam(to, dur) { const from = { ...world.cam }; await anim(dur, (k) => { const e = ease(k); world.cam = { x: lerp(from.x, to.x, e), y: lerp(from.y, to.y, e) }; }); }
// おためし(?akari=town / town2 / town3): ボスに 勝たなくても この場面だけ 見られる
async function lightPreview(id) {
  preview = true; S = newState(); S.party = [mkMon('mikanya', 8), mkMon('hotaruusagi', 7), mkMon('pukurisu', 6)];
  const order = Object.keys(LIGHT); order.slice(0, order.indexOf(id)).forEach((k) => { S.flags['lit_' + k] = true; });
  await fade(1, 0.3);
  await event(async () => { // この あいだは 歩いたり 話しかけたり できないように
    mode = 'field'; enterMap(id, 26, 14, 'u', true); await fade(0, 0.6); flushBtn();
    await lightTown(); await say('(おためし おわり。タイトルに もどります)');
    await fade(1, 0.5);
  });
  location.href = location.pathname;
}
// あかり番に 勝ったあとに よぶ
async function lightTown() {
  const m = world.map, L = LIGHT[m.id], p = world.p; clearSpeaker();
  await say('そのとき、町の どこかで カチリと おとが した。');
  Aud.bgm(null); ui.overlay = () => {}; // 場面の あいだは ボタンを かくす
  const home = { x: p.x * TS + 16, y: p.y * TS + 16 };
  world.cam = { ...home }; world.lampK = m.lamps.map(() => 0); world.night = 0;
  await anim(1.0, (k) => { world.night = 0.86 * ease(k); });
  for (let i = 0; i < m.lamps.length; i++) {
    const lamp = m.lamps[i], last = i === m.lamps.length - 1;
    await panCam({ x: lamp.x, y: lamp.y + 55 }, i === 0 ? 1.0 : 0.62);
    Aud.sfx('lampOn', i);
    await anim(last ? 0.75 : 0.45, (k) => { world.lampK[i] = k < 0.18 ? 0.7 : k < 0.32 ? 0.08 : Math.min(1, (k - 0.32) / 0.45) * (last ? 1.5 : 1); }); // ぱち、ぱっ と ともる
    await sleep(last ? 0.35 : 0.12);
  }
  await panCam(home, 0.9);
  S.flags['lit_' + m.id] = true; Aud.sfx('lightBurst');
  await anim(0.9, (k) => { ui.flash = Math.sin(Math.min(1, k * 1.4) * Math.PI) * 0.6; world.night = 0.86 * (1 - ease(k) * 0.72); });
  await sleep(0.45); await fade(1, 0.5, '#0f1230');
  world.night = 0; world.cam = null; world.lampK = null; ui.flash = 0;
  const count = litCount(), t0 = clock; ui.overlay = () => drawVista(m.id, clock - t0, count);
  Aud.bgm('light'); await fade(0, 0.8); await sleep(2.8);
  for (const line of m.lightText) await say(line);
  await fade(1, 0.5, '#0f1230'); ui.overlay = null; Aud.bgm(m.bgm); await fade(0, 0.8);
  for (const [id, line] of L.people) { // 町の人が こちらを むいて ひとこと
    const n = world.npcs.find((x) => x.id === id); if (!n) continue;
    const dx = p.x - n.x, dy = p.y - n.y; n.dir = Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 'r' : 'l') : (dy > 0 ? 'd' : 'u');
    setSpeaker(id); await say(line); clearSpeaker();
  }
  await storyAfterLight(m.id); // 手がかりと 回想(story.js)
  const lead = leadMon();
  if (lead) { addBond(lead, 4); world.emote = { t0: clock }; Aud.sfx('heal'); await say(`${nameOf(lead)}は あかりを みあげて、うれしそうに している。`); }
  save();
  ui.banner = { text: count >= 3 ? 'ぜんぶの あかりが ともった!' : '町が すこし あたたかくなった', t0: clock };
}
