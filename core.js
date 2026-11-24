'use strict';
// 土台: 時計・入力・画面の部品(パネル/文字/会話/えらぶ)・フィールド(歩く、見える範囲の描画)
const W = 640, H = 360, TS = 32;
let VW = 640, OX = 0; // 画面の横の広さ(スマホが横長なら 640より広く)と、メニューなどを中央に置くための ずれ
const cv = document.getElementById('c'), g = cv.getContext('2d');
const FONT = '"Zen Kaku Gothic New","Hiragino Kaku Gothic ProN","Hiragino Sans","Yu Gothic UI","Meiryo",sans-serif';
const INK = '#37323f', MUTED = '#837d8c', PEACH = '#d9735b', MINT = '#6aa896', CREAM = '#f7f5f1', EDGE = '#8d849a';
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v), lerp = (a, b, t) => a + (b - a) * t, ease = (t) => t * t * (3 - 2 * t);
const rnd = (a, b) => a + Math.random() * (b - a), rint = (a, b) => Math.floor(rnd(a, b + 1));
const DV = { u: [0, -1], d: [0, 1], l: [-1, 0], r: [1, 0] }, OPP = { u: 'd', d: 'u', l: 'r', r: 'l' };

let clock = 0, mode = 'title', busy = false;
const sleepers = [], frameW = [];
const bf = () => (mode === 'battle' ? bspd : 1);
const sleep = (s) => new Promise((r) => sleepers.push({ t: clock + s / bf(), r }));
const nextFrame = () => new Promise((r) => frameW.push(r));
async function anim(dur, fn) { dur = dur / bf(); const t0 = clock; for (;;) { const k = Math.min(1, (clock - t0) / dur); fn(k); if (k >= 1) break; await nextFrame(); } }

// ---------- なかよし度(きずな): 0〜100。25ごとにレベルが上がる ----------
const bondOf = (m) => m.bond || 0, bondLv = (m) => Math.min(4, Math.floor(bondOf(m) / 25));
const BOND_TXT = ['', 'すこし なついた', 'なかよく なった', 'しんらい している', 'こころが かよった'];
const bondEvents = [];
function addBond(m, n) { if (!m) return; const lv0 = bondLv(m); m.bond = clamp(bondOf(m) + n, 0, 100); if (bondLv(m) > lv0 && S.party.includes(m)) bondEvents.push(`${nameOf(m)}は あなたに ${BOND_TXT[bondLv(m)]} ♥`); }
const leadMon = () => S.party.find((m) => m.hp > 0);
function heart(x, y, s, col) { g.fillStyle = col; g.beginPath(); g.moveTo(x, y + s * 0.9); g.bezierCurveTo(x - s * 1.4, y - s * 0.2, x - s * 0.5, y - s * 1.1, x, y - s * 0.35); g.bezierCurveTo(x + s * 0.5, y - s * 1.1, x + s * 1.4, y - s * 0.2, x, y + s * 0.9); g.fill(); }

// ---------- セーブデータ ----------
function newState() { return { party: [], box: [], money: 300, bag: { ball: 8, potion: 3, cure: 1 }, flags: {}, seen: {}, caught: {}, map: 'village', x: 6, y: 8, dir: 'd', time: 0, steps: 0 }; }
let S = newState();
const SAVE_KEY = 'mofu.save.v1';
function hasSave() { try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; } }
function save() { try { S.map = world.map.id; S.x = world.p.x; S.y = world.p.y; S.dir = world.p.dir; localStorage.setItem(SAVE_KEY, JSON.stringify(S)); return true; } catch (e) { return false; } }
function loadSave() { try { const d = JSON.parse(localStorage.getItem(SAVE_KEY)); if (d && d.party) { S = Object.assign(newState(), d); return true; } } catch (e) {} return false; }

// ---------- 入力 ----------
const dirStack = [];
let padDir = null, runHeld = false, runToggle = false;
const btnQ = []; let waiter = null;
const dirHeld = () => padDir || dirStack[dirStack.length - 1] || null;
function pushBtn(b) { if (waiter) { const w = waiter; waiter = null; w(b); } else { btnQ.push(b); if (btnQ.length > 4) btnQ.shift(); } }
function flushBtn() { btnQ.length = 0; }
function nextBtn() { if (btnQ.length) return Promise.resolve(btnQ.shift()); return new Promise((r) => { waiter = r; }); }
let tspd = 1; // 文字の速さ(ゆっくり0.7 / ふつう1 / はやい1.9)
let diff = 1; // むずかしさ(0 やさしい / 1 ふつう / 2 むずかしい)
const DIFF = [{ n: 'やさしい', take: 0.75, exp: 1.25, coin: 1.25 }, { n: 'ふつう', take: 1, exp: 1, coin: 1 }, { n: 'むずかしい', take: 1.25, exp: 0.9, coin: 1 }];
let bspd = 1; // バトルの速さ(ふつう1 / はやい1.7 / とてもはやい2.6)
try { const o = JSON.parse(localStorage.getItem('mofu.opts') || '{}'); if (o.tspd) tspd = o.tspd; if (o.bspd) bspd = o.bspd; if (o.diff != null) diff = o.diff; } catch (e) {}
const saveOpts = () => { try { localStorage.setItem('mofu.opts', JSON.stringify({ tspd, bspd, diff, gl: manualGrade ? gradeLevel : null })); } catch (e) {} };
const ui = { shake: 0, wipe: 0, speaker: null, spkOut: null, dialog: null, choice: null, overlay: null, hits: [], fade: 0, fadeC: '#000', flash: 0, banner: null };
const modalActive = () => !!(ui.dialog || ui.choice || ui.overlay);
const KD = { ArrowUp: 'u', KeyW: 'u', ArrowDown: 'd', KeyS: 'd', ArrowLeft: 'l', KeyA: 'l', ArrowRight: 'r', KeyD: 'r' };
const DB = { u: 'up', d: 'down', l: 'left', r: 'right' };
addEventListener('keydown', (e) => {
  if (e.target && (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT')) return;
  Aud.start();
  const d = KD[e.code];
  if (d) { e.preventDefault(); if (!dirStack.includes(d)) dirStack.push(d); if (modalActive() || mode !== 'field') pushBtn(DB[d]); return; }
  if (e.repeat) return;
  if (e.code === 'KeyZ' || e.code === 'Enter' || e.code === 'Space') { e.preventDefault(); pushBtn('a'); }
  else if (e.code === 'KeyX' || e.code === 'Escape' || e.code === 'Backspace') { e.preventDefault(); pushBtn('b'); runHeld = true; }
  else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') runHeld = true;
  else if (e.code === 'KeyM' || e.code === 'Tab' || e.code === 'KeyQ') { e.preventDefault(); pushBtn('menu'); }
});
addEventListener('keyup', (e) => {
  const d = KD[e.code]; if (d) { const i = dirStack.indexOf(d); if (i >= 0) dirStack.splice(i, 1); }
  if (e.code === 'KeyX' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') runHeld = false;
});
addEventListener('blur', () => { dirStack.length = 0; padDir = null; runHeld = false; });

const touch = document.getElementById('touch'), stickEl = document.getElementById('stick');
let stick = null, repT = 0;
function toLogical(e) { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * VW - OX, (e.clientY - r.top) / r.height * H]; }
function stickDir(dx, dy) { if (Math.hypot(dx, dy) < 16) return null; return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'r' : 'l') : (dy > 0 ? 'd' : 'u'); }
touch.addEventListener('pointerdown', (e) => {
  Aud.start(); e.preventDefault();
  const [lx, ly] = toLogical(e);
  const hit = ui.hits.find((h) => lx >= h.x && lx <= h.x + h.w && ly >= h.y && ly <= h.y + h.h);
  if (hit) { hit.act(); return; }
  if (modalActive() || mode !== 'field') { pushBtn('a'); return; }
  if (e.clientX < innerWidth * 0.55) {
    stick = { id: e.pointerId, x: e.clientX, y: e.clientY }; touch.setPointerCapture(e.pointerId);
    stickEl.classList.remove('hidden'); stickEl.style.left = e.clientX + 'px'; stickEl.style.top = e.clientY + 'px'; stickEl.firstElementChild.style.transform = '';
  } else pushBtn('a');
});
touch.addEventListener('pointermove', (e) => {
  if (!stick || e.pointerId !== stick.id) return;
  let dx = e.clientX - stick.x, dy = e.clientY - stick.y; const L = Math.hypot(dx, dy), m = 38;
  padDir = stickDir(dx, dy);
  if (L > m) { dx *= m / L; dy *= m / L; } stickEl.firstElementChild.style.transform = `translate(${dx}px,${dy}px)`;
});
const endStick = (e) => { if (stick && e.pointerId === stick.id) { stick = null; padDir = null; stickEl.classList.add('hidden'); } };
touch.addEventListener('pointerup', endStick); touch.addEventListener('pointercancel', endStick);
for (const [id, fn] of [['btnA', () => pushBtn('a')], ['btnB', () => { pushBtn('b'); runToggle = !runToggle; document.getElementById('btnB').classList.toggle('run', runToggle); }], ['btnM', () => pushBtn('menu')]]) {
  const el = document.getElementById(id);
  el.addEventListener('pointerdown', (e) => { Aud.start(); e.preventDefault(); e.stopPropagation(); el.classList.add('on'); fn(); });
  const up = () => { el.classList.remove('on'); };
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up); el.addEventListener('pointerleave', up);
}

// ---------- 画面の部品 ----------
function rr(x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }
function panel(x, y, w, h, o = {}) {
  g.save(); g.shadowColor = 'rgba(40,30,60,.3)'; g.shadowBlur = 8; g.shadowOffsetY = 3; g.fillStyle = o.fill || CREAM; rr(x, y, w, h, o.r ?? 12); g.fill(); g.restore();
  g.lineWidth = o.lw || 2.5; g.strokeStyle = o.stroke || EDGE; rr(x, y, w, h, o.r ?? 12); g.stroke();
}
function txt(s, x, y, o = {}) {
  g.font = `${o.w || 700} ${o.size || 15}px ${FONT}`; g.textAlign = o.align || 'left'; g.textBaseline = 'middle';
  if (o.stroke) { g.lineWidth = o.sw || 4; g.lineJoin = 'round'; g.strokeStyle = o.stroke; g.strokeText(s, x, y); }
  g.fillStyle = o.color || INK; g.fillText(s, x, y);
}
const NOHEAD = '、。,.!?!?」』)…ー〜ぁぃぅぇぉっゃゅょ';
function wrap(text, maxW, size = 17) {
  g.font = `700 ${size}px ${FONT}`; const out = [];
  for (const para of String(text).split('\n')) {
    let line = '';
    for (const ch of para) { if (line && g.measureText(line + ch).width > maxW && !NOHEAD.includes(ch)) { out.push(line); line = ch; } else line += ch; }
    out.push(line);
  }
  return out;
}
function bar(x, y, w, h, frac, c1, c2) {
  g.fillStyle = 'rgba(60,50,80,.2)'; rr(x, y, w, h, h / 2); g.fill();
  const f = clamp(frac, 0, 1); if (f > 0) { const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, c1); gr.addColorStop(1, c2); g.fillStyle = gr; rr(x, y, Math.max(h, w * f), h, h / 2); g.fill(); }
}
const hpColor = (f) => (f > 0.5 ? ['#a3d4a4', '#5aa571'] : f > 0.2 ? ['#ead67e', '#c9a63a'] : ['#e8908a', '#c0504a']);

// 会話(1ページ2行。Aで次へ)
async function say(text, o = {}) {
  const w = o.w || 616, lines = wrap(text, w - 48);
  for (let i = 0; i < lines.length; i += 2) {
    const page = lines.slice(i, i + 2).join('\n'); flushBtn();
    const d = { text: page, t0: clock, w, done: false }; ui.dialog = d;
    const total = page.length;
    while ((clock - d.t0) * 46 * tspd < total) { await nextFrame(); if (btnQ.length) { btnQ.length = 0; break; } }
    d.done = true; d.t0 = -999;
    for (;;) { const b = await nextBtn(); if (b === 'a' || b === 'b') break; }
    Aud.sfx('select');
  }
  if (!o.keep) ui.dialog = null;
}
// 戦闘用: 自動で進むメッセージ
async function msg(text, hold = 0.75) {
  const w = 616, lines = wrap(text, w - 48); flushBtn();
  const d = { text: lines.slice(0, 2).join('\n'), t0: clock, w, done: true, auto: true }; ui.dialog = d;
  const t0 = clock, dur = d.text.length / (55 * tspd * Math.sqrt(bf())) + hold / Math.sqrt(tspd) / bf();
  while (clock - t0 < dur) { await nextFrame(); if (btnQ.length) { btnQ.length = 0; if (clock - t0 > d.text.length / (55 * tspd)) break; } }
}
function prompt(text, w = 360) { ui.dialog = { text, t0: -999, w, done: true, noArrow: true }; }
// ---------- 立ち絵と名前札 ----------
function setSpeaker(id) { if (ui.speaker && ui.speaker.id === id) return; if (ui.speaker) ui.spkOut = { ...ui.speaker, t1: clock }; ui.speaker = { id, name: NPC_NAMES[id] || '', t0: clock }; }
function clearSpeaker() { if (ui.speaker) { ui.spkOut = { ...ui.speaker, t1: clock }; ui.speaker = null; } }
function drawSpeaker() {
  if (mode === 'battle') return;
  const one = (sp, k) => { if (k <= 0) return; const img = Art.portrait(sp.id), h = 232, w = img.width * h / img.height, x = 14 + (1 - ease(k)) * -34; g.save(); g.globalAlpha = clamp(k, 0, 1); g.drawImage(img, x, 296 - h, w, h); g.restore(); return x + w; };
  if (ui.spkOut) { const k = 1 - (clock - ui.spkOut.t1) / 0.2; if (k > 0) one(ui.spkOut, k); else ui.spkOut = null; }
  if (ui.speaker) { const k = (clock - ui.speaker.t0) / 0.25; one(ui.speaker, Math.min(1, k)); }
}
function drawNameTag() {
  const sp = ui.speaker; if (mode === 'battle' || !sp || !sp.name || !ui.dialog) return;
  g.font = `700 14px ${FONT}`; const w = g.measureText(sp.name).width + 28; panel(228, 268, w, 24, { r: 12, fill: '#37323f', stroke: '#37323f' }); txt(sp.name, 242, 280, { size: 14, color: '#f7f5f1' });
}
// 大きく見せる演出(はじめて つかまえた子、ライバルの登場など)。Aで閉じる
async function cutin(img, title, sub) {
  ui.dialog = null; flushBtn(); const t0 = clock;
  ui.overlay = () => {
    const k = ease(clamp((clock - t0) / 0.35, 0, 1));
    g.fillStyle = `rgba(20,16,30,${0.6 * k})`; g.fillRect(0, 0, W, H);
    g.save(); g.translate((1 - k) * -W, 0);
    const bg = g.createLinearGradient(0, 0, W, 0); bg.addColorStop(0, 'rgba(247,245,241,.96)'); bg.addColorStop(1, 'rgba(214,206,222,.96)'); g.fillStyle = bg;
    g.beginPath(); g.moveTo(0, 96); g.lineTo(W, 66); g.lineTo(W, 266); g.lineTo(0, 296); g.closePath(); g.fill();
    g.strokeStyle = '#37323f'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 96); g.lineTo(W, 66); g.moveTo(0, 296); g.lineTo(W, 266); g.stroke();
    g.restore();
    const hh = 300, ww = img.width * hh / img.height, sway = Math.sin(clock * 1.6) * 3;
    g.save(); g.globalAlpha = k; g.drawImage(img, W - ww - 28 + (1 - k) * 80, 330 - hh - sway, ww, hh); g.restore();
    g.globalAlpha = k; const lines = wrap(sub, Math.max(190, W - ww - 120), 15), top = 190 - Math.min(lines.length, 4) * 9;
    txt(title, 44, top - 30, { size: 32, w: 900 }); lines.slice(0, 4).forEach((l, i) => txt(l, 46, top + 6 + i * 22, { size: 15, color: MUTED }));
    txt('Aで つぎへ', 46, 266, { size: 12, color: MUTED }); g.globalAlpha = 1;
    ui.hits.push({ x: 0, y: 0, w: W, h: H, act: () => pushBtn('a') });
  };
  await sleep(0.35);
  for (;;) { const b = await nextBtn(); if (b === 'a' || b === 'b') break; }
  ui.overlay = null;
}
function drawDialog() {
  drawSpeaker();
  const d = ui.dialog; if (!d || (ui.overlay && d.noArrow)) return;
  const x = 12, y = 284, w = d.w, h = 68;
  panel(x, y, w, h, { fill: '#faf8f5' });
  const n = d.t0 < -900 ? 999 : Math.floor((clock - d.t0) * (d.auto ? 55 : 46) * tspd), s = d.text.slice(0, n).split('\n');
  s.forEach((ln, i) => txt(ln, x + 22, y + 22 + i * 27, { size: 17 }));
  if (d.done && !d.noArrow && !d.auto) { g.fillStyle = PEACH; const bx = x + w - 26, by = y + h - 18 + Math.sin(clock * 6) * 2; g.beginPath(); g.moveTo(bx - 6, by - 4); g.lineTo(bx + 6, by - 4); g.lineTo(bx, by + 5); g.closePath(); g.fill(); }
}

// えらぶ(リスト)。cancel: Bで返す値(falseならBで閉じない)
async function choose(items, o = {}) {
  const cols = o.cols || 1, c = { items, idx: o.idx || 0, cols, x: o.x ?? 440, y: o.y ?? 120, w: o.w || 180, rowH: o.rowH || 30, title: o.title, cancel: o.cancel };
  c.h = Math.ceil(items.length / cols) * c.rowH + 20 + (o.title ? 24 : 0);
  if (o.bottom != null) c.y = o.bottom - c.h;
  ui.choice = c; flushBtn();
  const isOff = (i) => items[i] && items[i].off;
  for (;;) {
    const b = await nextBtn();
    if (b === 'a') { if (isOff(c.idx)) { Aud.sfx('back'); continue; } Aud.sfx('ok'); ui.choice = null; return c.idx; }
    if (b === 'b') { if (o.cancel === false) continue; Aud.sfx('back'); ui.choice = null; return o.cancel ?? -1; }
    let i = c.idx;
    if (b === 'up') i -= cols; else if (b === 'down') i += cols; else if (b === 'left' && cols > 1) i -= 1; else if (b === 'right' && cols > 1) i += 1;
    if (i >= 0 && i < items.length && i !== c.idx) { c.idx = i; Aud.sfx('select'); }
  }
}
function drawChoice() {
  const c = ui.choice; if (!c) return;
  panel(c.x, c.y, c.w, c.h, { fill: '#faf8f5' });
  const top = c.y + 10 + (c.title ? 24 : 0), cw = (c.w - 16) / c.cols;
  if (c.title) txt(c.title, c.x + 16, c.y + 20, { size: 13, color: MUTED });
  if (c.cancel !== false) { const bx = c.x, by = Math.max(4, c.y - 30); panel(bx, by, 78, 24, { r: 12, fill: '#e8e2ee', lw: 2 }); txt('← もどる', bx + 39, by + 12.5, { size: 13, align: 'center' }); ui.hits.push({ x: bx - 6, y: by - 6, w: 90, h: 36, act: () => pushBtn('b') }); }
  c.items.forEach((it, i) => {
    const lab = typeof it === 'string' ? it : it.label, col = i % c.cols, row = Math.floor(i / c.cols);
    const x = c.x + 8 + col * cw, y = top + row * c.rowH;
    if (i === c.idx) { g.fillStyle = '#e8e2ee'; rr(x, y, cw, c.rowH - 2, 9); g.fill(); g.fillStyle = PEACH; g.beginPath(); g.moveTo(x + 8, y + c.rowH / 2 - 5); g.lineTo(x + 8, y + c.rowH / 2 + 3); g.lineTo(x + 15, y + c.rowH / 2 - 1); g.closePath(); g.fill(); }
    txt(lab, x + 22, y + c.rowH / 2 - 1, { size: 16, color: typeof it === 'object' && it.off ? '#b9aa9c' : INK });
    if (typeof it === 'object' && it.sub) txt(it.sub, x + cw - 8, y + c.rowH / 2 - 1, { size: 13, color: it.subColor || MUTED, align: 'right' });
    ui.hits.push({ x, y, w: cw, h: c.rowH - 2, act: () => { if (c.idx !== i) c.idx = i; pushBtn('a'); } });
  });
}
async function fade(to, dur = 0.35, color) { if (color) ui.fadeC = color; const f = ui.fade; await anim(dur, (k) => { ui.fade = lerp(f, to, k); }); }
async function wipe(dur = 0.5) {
  await anim(dur, (k) => { ui.wipe = k; }); ui.fade = 1; ui.fadeC = '#1b1722'; ui.wipe = 0;
}
async function flashFx(n = 3) { for (let i = 0; i < n; i++) { await anim(0.1, (k) => { ui.flash = 1 - k; }); } ui.flash = 0; }

// ---------- 世界(マップ・歩く) ----------
const MAPS = { village: buildVillage(), route: buildRoute(), town: buildTown(), route2: buildRoute2(), town2: buildTown2(), route3: buildRoute3(), town3: buildTown3() };
function prepMap(m) {
  m.blocked = m.t.map((r) => r.map((c) => 'T~F#'.includes(c)));
  m.doors = {}; m.signs = {};
  for (const o of m.objects) {
    if (o.type === 'house') { for (let j = 0; j < o.h; j++) for (let i = 0; i < o.w; i++) m.blocked[o.y + j][o.x + i] = true; m.doors[(o.x + Math.floor((o.w - 1) / 2)) + ',' + (o.y + o.h - 1)] = o.door; }
    else if (o.type === 'door') m.doors[o.x + ',' + o.y] = o.door;
    else if (o.type === 'sign') { m.blocked[o.y][o.x] = true; m.signs[o.x + ',' + o.y] = o.text; }
    else if (o.type === 'gate') { for (let j = 0; j < o.h; j++) for (let i = 0; i < o.w; i++) if (![7, 8].includes(o.y + j)) m.blocked[o.y + j][o.x + i] = true; }
  }
}
for (const k in MAPS) prepMap(MAPS[k]);
// 光る場所(ひろえるアイテム)。item: potion/ball/cure/coin
const SPOTS = {
  village: [{ x: 2, y: 14, item: 'potion' }, { x: 27, y: 4, item: 'ball' }, { x: 19, y: 15, item: 'coin', n: 80 }],
  route: [{ x: 7, y: 5, item: 'potion' }, { x: 22, y: 12, item: 'cure' }, { x: 44, y: 4, item: 'ball', n: 2 }],
  town: [{ x: 5, y: 18, item: 'potion' }, { x: 34, y: 17, item: 'coin', n: 120 }, { x: 20, y: 19, item: 'ball' }],
  route2: [{ x: 6, y: 5, item: 'potion' }, { x: 20, y: 11, item: 'cure' }, { x: 46, y: 5, item: 'ball', n: 2 }],
  town2: [{ x: 8, y: 18, item: 'cure' }, { x: 30, y: 19, item: 'coin', n: 200 }],
  route3: [{ x: 8, y: 5, item: 'potion', n: 2 }, { x: 22, y: 11, item: 'cure' }, { x: 45, y: 13, item: 'ball', n: 2 }],
  town3: [{ x: 9, y: 15, item: 'coin', n: 150 }, { x: 36, y: 15, item: 'potion', n: 2 }],
};
for (const k in SPOTS) MAPS[k].spots = SPOTS[k];
// つり: 水の方を向いてAボタン。場所ごとに つれる子([種族, 重み])とレベル
const FISH = {
  village: { list: [['hinatagaeru', 60], ['shizukufin', 40]], lv: [3, 5] },
  route: { list: [['hinatagaeru', 55], ['shizukufin', 45]], lv: [3, 6] },
  route2: { list: [['hikaritanishi', 40], ['hinatagaeru', 30], ['shizukufin', 30]], lv: [7, 9] },
  route3: { list: [['funenko', 30], ['shizukufin', 40], ['hikaritanishi', 30]], lv: [11, 13] },
  town3: { list: [['funenko', 30], ['sabikani', 30], ['shizukufin', 20], ['hikaritanishi', 20]], lv: [11, 14], waterRows: 16 },
};
const isWater = (m, x, y) => !!FISH[m.id] && y >= 0 && x >= 0 && y < m.h && x < m.w && (m.t[y][x] === '~' || (FISH[m.id].waterRows != null && y >= FISH[m.id].waterRows));
const world = { map: MAPS.village, p: { x: 6, y: 8, dir: 'd', ox: 0, oy: 0, alt: false, turnT: 0, pending: false }, npcs: [], bang: null, emote: null, fol: { x: 6, y: 8, ox: 0, oy: 0, alt: false } };
const STEP = 0.2;

function enterMap(id, x, y, dir, quiet) {
  const m = MAPS[id]; world.map = m;
  for (const k in MAPS) if (MAPS[k] !== m) delete MAPS[k]._cache; // いまの地図だけ、地面の絵を持つ
  const p = world.p; p.x = x; p.y = y; p.dir = dir; p.ox = p.oy = 0; p.pending = false; p.turnT = 0;
  world.fol = { x, y, ox: 0, oy: 0, alt: false };
  world.npcs = m.npcs.map((n) => ({ ...n, ox: 0, oy: 0, step: 0, tt: rnd(2, 5), idle: n.idle ?? ['child', 'granny', 'traveler'].includes(n.id) }));
  Aud.bgm(m.bgm);
  for (const [flag] of m.grassLit || []) { const key = 'spawn_' + m.id + '_' + flag; if (S.flags[flag] && !S.flags[key]) { S.flags[key] = true; bondEvents.push('あかりに ひかれて、あたらしい 子が あつまってきた!'); break; } }
  if (!quiet) ui.banner = { text: m.name, t0: clock };
}
const npcAt = (x, y) => world.npcs.find((n) => n.x === x && n.y === y);
function solidAt(x, y) { const m = world.map; return y < 0 || x < 0 || y >= m.h || x >= m.w || m.blocked[y][x] || !!npcAt(x, y); }
async function event(fn) { busy = true; try { await fn(); } catch (e) { console.error(e); } finally { busy = false; clearSpeaker(); flushBtn(); } }
// 先頭のモンスターは、主人公がいた場所へ ついてくる
function followStep(px0, py0) { const f = world.fol; f.ox = f.x + f.ox - px0; f.oy = f.y + f.oy - py0; f.x = px0; f.y = py0; f.alt = !f.alt; if (Math.abs(f.ox) > 1.5 || Math.abs(f.oy) > 1.5) f.ox = f.oy = 0; }
function tryMove(d) {
  const p = world.p, v = DV[d], nx = p.x + v[0], ny = p.y + v[1], m = world.map;
  const door = m.doors[nx + ',' + ny];
  if (door) { event(() => doorScript(door)); return; }
  if (solidAt(nx, ny)) return;
  const px0 = p.x, py0 = p.y; p.x = nx; p.y = ny; p.ox = -v[0]; p.oy = -v[1]; p.alt = !p.alt; p.pending = true; followStep(px0, py0);
}
async function walkActor(a, d, n) {
  for (let i = 0; i < n; i++) { const v = DV[d]; a.dir = d; const px0 = a.x, py0 = a.y; a.x += v[0]; a.y += v[1]; if (a === world.p) followStep(px0, py0); a.ox = -v[0]; a.oy = -v[1]; a.alt = !a.alt; while (a.ox || a.oy) await nextFrame(); }
}
function interact() {
  const p = world.p, v = DV[p.dir], tx = p.x + v[0], ty = p.y + v[1], m = world.map;
  const n = npcAt(tx, ty), sg = m.signs[tx + ',' + ty], door = m.doors[tx + ',' + ty], lead = leadMon(), fo = world.fol;
  if (lead && !n && fo.x === tx && fo.y === ty) event(() => petFollower(lead));
  else if (n) event(async () => { n.dir = OPP[p.dir]; setSpeaker(n.id); await runScript(n.script, n); });
  else if (sg) event(() => say(TEXT[sg]));
  else if (door) event(() => doorScript(door));
  else if (isWater(m, tx, ty)) event(() => fishTalk(tx, ty));
  else if (lead && Math.abs(fo.x - p.x) + Math.abs(fo.y - p.y) <= 1) event(() => petFollower(lead)); // すぐそばの子に話しかける
}
function sees(n, p) {
  const v = DV[n.dir], dx = (p.x - n.x) * v[0] + (p.y - n.y) * v[1], side = Math.abs((p.x - n.x) * v[1]) + Math.abs((p.y - n.y) * v[0]);
  return dx >= 1 && dx <= n.sight && side <= 1;
}
function onArrive() {
  const m = world.map, p = world.p; S.steps++; if (S.steps % 25 === 0) addBond(leadMon(), 1);
  if (S.steps === 60 && !S.flags.tip_run) { S.flags.tip_run = true; bondEvents.push('ヒント: 「B」を おすと はしれるよ(もういちど おすと もどる)'); }
  if (m.grass && m.t[p.y][p.x] === 'g' && !S.flags.tip_grass) { S.flags.tip_grass = true; bondEvents.push('ヒント: 高い草むらでは、モンスターが とびだす ことが あるよ'); } Aud.sfx(m.t[p.y] && m.t[p.y][p.x] === 'g' ? 'rustle' : 'step');
  const w = m.warps.find((w) => w.x === p.x && w.y === p.y);
  if (w) { event(() => doWarp(w)); return; }
  for (const n of world.npcs) if (n.trainer && !S.flags['beat_' + n.id] && sees(n, p)) { event(() => trainerSpot(n)); return; }
  const spot = (m.spots || []).find((s) => s.x === p.x && s.y === p.y), spotKey = spot && `spot_${m.id}_${spot.x}_${spot.y}`;
  if (spot && !S.flags[spotKey]) { event(() => collectSpot(spot, spotKey)); return; }
  if (m.grass && m.t[p.y][p.x] === 'g' && Math.random() < GAME.encounterRate && S.party.some((x) => x.hp > 0)) event(() => wildEncounter());
}
function stepOffsets(dt) {
  const ap = (v, s) => (v > 0 ? Math.max(0, v - s) : Math.min(0, v + s)), p = world.p;
  const sp = dt / ((runHeld || runToggle) ? STEP * 0.6 : STEP);
  p.ox = ap(p.ox, sp); p.oy = ap(p.oy, sp); world.fol.ox = ap(world.fol.ox, sp); world.fol.oy = ap(world.fol.oy, sp);
  for (const n of world.npcs) { const s2 = dt / STEP; n.ox = ap(n.ox, s2); n.oy = ap(n.oy, s2); }
}
function updateField(dt) {
  const p = world.p;
  stepOffsets(dt);
  if (!busy && !ui.banner && bondEvents.length) { ui.banner = { text: bondEvents.shift(), t0: clock, w: 1 }; Aud.sfx('get'); }
  if (!busy) for (const n of world.npcs) if (n.idle && !ui.dialog) { n.tt -= dt; if (n.tt <= 0) { n.dir = 'udlr'[rint(0, 3)]; n.tt = rnd(2.5, 6); } }
  if (busy) return;
  if (p.pending && !p.ox && !p.oy) { p.pending = false; onArrive(); if (busy) return; }
  if (p.ox || p.oy) return;
  while (btnQ.length && !busy) { const b = btnQ.shift(); if (b === 'a') interact(); else if (b === 'menu') event(() => openMenu()); }
  if (busy) return;
  const d = dirHeld();
  if (!d) { p.turnT = 0; return; }
  if (d !== p.dir) { p.dir = d; p.turnT = 0.09; return; }
  if (p.turnT > 0) { p.turnT -= dt; return; }
  tryMove(d);
}

// ---------- フィールドの描画 ----------
const CLOUDS = Array.from({ length: 7 }, (_, i) => ({ x: i * 310 + 40, y: (i * 137) % 700, r: 38 + (i % 3) * 16, v: 6 + (i % 4) * 2 }));
function mapCache(m) {
  if (m._cache) return m._cache;
  const K = 1.5, c = document.createElement('canvas'); c.width = Math.ceil(m.w * TS * K); c.height = Math.ceil(m.h * TS * K);
  const cg = c.getContext('2d'); cg.scale(K, K);
  for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) { const ch = m.t[y][x]; Art.tile(cg, ch === 'T' || ch === '~' ? '.' : ch === 'g' ? 'G0' : ch, x, y, x * TS, y * TS, 0, m); }
  m._cache = c; m._cacheK = K; return c;
}
let showGrid = false;
function drawGrid(m, cx, cy, x0, x1, y0, y1) { // ?debug 用: 歩けない所(赤)、草むら(緑)、ドア(青)、出入口(黄)を重ねて見る
  g.save(); g.font = '9px sans-serif'; g.textAlign = 'left'; g.textBaseline = 'top';
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
    const px = tx * TS - cx, py = ty * TS - cy, k = tx + ',' + ty;
    let col = null;
    if (m.doors[k]) col = 'rgba(60,120,255,.55)'; else if (m.warps.some((w) => w.x === tx && w.y === ty)) col = 'rgba(255,220,0,.55)'; else if (m.blocked[ty][tx]) col = 'rgba(255,40,40,.32)'; else if (m.t[ty][tx] === 'g') col = 'rgba(40,220,60,.32)';
    if (col) { g.fillStyle = col; g.fillRect(px, py, TS, TS); }
    g.strokeStyle = 'rgba(255,255,255,.25)'; g.strokeRect(px + .5, py + .5, TS, TS);
    if (tx % 5 === 0 && ty % 5 === 0) { g.fillStyle = '#fff'; g.fillText(tx + ',' + ty, px + 2, py + 2); }
  }
  g.restore();
}
function drawField() {
  const m = world.map, p = world.p, T = clock;
  const pxw = (p.x + p.ox) * TS + 16, pyw = (p.y + p.oy) * TS + 16;
  const camx = clamp(pxw - VW / 2, 0, Math.max(0, m.w * TS - VW)), camy = clamp(pyw - H / 2, 0, Math.max(0, m.h * TS - H));
  const cx = Math.round(camx), cy = Math.round(camy);
  const x0 = Math.max(0, Math.floor(cx / TS) - 1), x1 = Math.min(m.w - 1, Math.floor((cx + VW) / TS) + 1);
  const y0 = Math.max(0, Math.floor(cy / TS) - 1), y1 = Math.min(m.h - 1, Math.floor((cy + H) / TS) + 3);
  const bg = m.bg ? Art.bg(m.bg) : null;
  g.fillStyle = '#9bd278'; g.fillRect(0, 0, VW, H);
  if (bg) g.drawImage(bg, 0, 0, bg.width, bg.height, -cx, -cy, m.w * TS, m.h * TS);
  else { // 地面は一度だけ描いて使い回す。ゆれる草と水だけ、毎回描く
    const cc = mapCache(m), K = m._cacheK, gl = [];
    g.drawImage(cc, cx * K, cy * K, Math.min(VW * K, cc.width - cx * K), Math.min(H * K, cc.height - cy * K), 0, 0, Math.min(VW, cc.width / K - cx), Math.min(H, cc.height / K - cy));
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) { const c = m.t[ty][tx]; if (c === 'g') gl.push({ px: tx * TS - cx, py: ty * TS - cy, h: Art.hash(tx, ty) }); else if (c === '~') Art.tile(g, '~', tx, ty, tx * TS - cx, ty * TS - cy, T, m); }
    Art.grassBatch(g, gl, T);
  }
  const items = [];
  if (!bg) for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) if (m.t[ty][tx] === 'T') items.push({ y: (ty + 1) * TS, k: 0, a: tx, b: ty });
  if (!bg) for (const o of m.objects) {
    if (o.type === 'gate') { items.push({ y: (o.y + 2) * TS, k: 1, o, part: 0 }); items.push({ y: (o.y + 6) * TS, k: 1, o, part: 1 }); }
    else items.push({ y: (o.type === 'house' ? o.y + o.h : o.y + 1) * TS, k: 1, o });
  }
  for (const n of world.npcs) items.push({ y: (n.y + n.oy) * TS + TS - 2, k: 2, n });
  items.push({ y: (p.y + p.oy) * TS + TS - 1, k: 3 });
  if (leadMon()) items.push({ y: (world.fol.y + world.fol.oy) * TS + TS - 2, k: 4 });
  items.sort((a, b) => a.y - b.y);
  const tree = Art.treeSprite();
  for (const it of items) {
    if (it.k === 0) g.drawImage(tree, it.a * TS - 16 - cx, (it.b + 1) * TS + 4 - 84 - cy);
    else if (it.k === 1) {
      const o = it.o;
      if (o.type === 'house') g.drawImage(Art.houseSprite(o), o.x * TS - 8 - cx, o.y * TS - 20 - cy);
      else if (o.type === 'sign') g.drawImage(Art.signSprite(), o.x * TS + 2 - cx, (o.y + 1) * TS - 32 - cy);
      else if (o.type === 'gate') g.drawImage(Art.stoneSprite(), (o.x + 1) * TS - 20 - cx, (o.y + 2 + it.part * 4) * TS + 4 - 72 - cy);
    } else if (it.k === 2) {
      const n = it.n, bob = (n.ox || n.oy) ? (n.alt ? 1 : 2) : 0;
      Art.person(g, n.pal, n.pal, n.dir, bob, (n.x + n.ox) * TS + 16 - cx, (n.y + n.oy) * TS + TS - 3 - cy, n.pal === 'child' ? 0.88 : 1);
    } else if (it.k === 4) {
      const f = world.fol, lead = leadMon(), mvg = f.ox || f.oy, sz = 42, bob = mvg ? Math.abs(Math.sin(clock * 14)) * 3 : Math.sin(clock * 2.4) * 0.8;
      const fx = (f.x + f.ox) * TS + 16 - cx, fy = (f.y + f.oy) * TS + TS - 2 - cy;
      g.fillStyle = 'rgba(30,50,30,.22)'; g.beginPath(); g.ellipse(fx, fy, 12, 4, 0, 0, 7); g.fill();
      const ds = Art.dot(lead.sp); g.imageSmoothingEnabled = false;
      if (ds) g.drawImage(ds, Math.round(fx - ds.width), Math.round(fy - ds.height * 2 + 2 - bob), ds.width * 2, ds.height * 2); else g.drawImage(Art.sprites[lead.sp], fx - sz / 2, fy - sz * 0.955 - bob, sz, sz);
      g.imageSmoothingEnabled = true;
    } else {
      const bob = (p.ox || p.oy) ? (p.alt ? 1 : 2) : 0, bx = (p.x + p.ox) * TS + 16 - cx, by = (p.y + p.oy) * TS + TS - 3 - cy;
      Art.person(g, 'hero', 'hero', p.dir, bob, bx, by);
      const tx = Math.round(p.x + p.ox + 0.01), ty = Math.round(p.y + p.oy + 0.01);
      if (!bg && m.t[ty] && m.t[ty][tx] === 'g') Art.tallFront(g, tx * TS - cx, ty * TS - cy, T, Art.hash(tx, ty));
    }
  }
  if (bg && m.lamps) { // 街灯のあかり
    const n = S.flags['lit_' + m.id] ? m.lamps.length : (m.litN || 0);
    g.save(); g.globalCompositeOperation = 'screen';
    for (let i = 0; i < n; i++) { const L = m.lamps[i], lx = L.x - cx, ly = L.y - cy, fl = 1 + Math.sin(clock * 3 + i * 2) * 0.04; const rg = g.createRadialGradient(lx, ly, 2, lx, ly, 120 * fl); rg.addColorStop(0, 'rgba(255,240,190,1)'); rg.addColorStop(0.2, 'rgba(255,214,140,.7)'); rg.addColorStop(0.55, 'rgba(255,184,110,.28)'); rg.addColorStop(1, 'rgba(255,170,90,0)'); g.fillStyle = rg; g.fillRect(lx - 124, ly - 124, 248, 248); }
    g.restore();
  }
  if (m.spots) for (const s of m.spots) { // 光る場所
    if (S.flags[`spot_${m.id}_${s.x}_${s.y}`] || s.x < x0 || s.x > x1 || s.y < y0 || s.y > y1) continue;
    const sx = s.x * TS + 16 - cx, sy = s.y * TS + 18 - cy, tw = 0.5 + 0.5 * Math.sin(clock * 3.2 + s.x), r = 3.5 + tw * 3.5;
    g.save(); g.globalAlpha = 0.55 + tw * 0.45; Art.star(g, sx, sy - tw * 2, r, '#fff6c0'); g.strokeStyle = 'rgba(255,246,190,.9)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(sx - r * 1.6, sy - tw * 2); g.lineTo(sx + r * 1.6, sy - tw * 2); g.moveTo(sx, sy - tw * 2 - r * 1.6); g.lineTo(sx, sy - tw * 2 + r * 1.6); g.stroke(); g.restore();
  }
  if (m.fog && gradeLevel >= 1) { // 霧: 灯がともるとうすくなる
    const fa = m.fog * (S.flags['lit_' + m.id] ? 0.3 : 1);
    g.save(); for (let i = 0; i < (gradeLevel >= 2 ? 6 : 2); i++) { const fx = ((i * 330 + clock * (9 + i * 3)) % (VW + 500)) - 250, fy = 60 + (i * 61) % 300, rr2 = 190 + (i % 3) * 40; const fg = g.createRadialGradient(fx, fy, 10, fx, fy, rr2); fg.addColorStop(0, `rgba(232,238,242,${fa * 0.55})`); fg.addColorStop(1, 'rgba(232,238,242,0)'); g.fillStyle = fg; g.fillRect(fx - rr2, fy - rr2, rr2 * 2, rr2 * 2); }
    g.fillStyle = `rgba(226,233,238,${fa * 0.18})`; g.fillRect(0, 0, VW, H); g.restore();
  }
  if (world.fishing) { // つり: 糸とうき
    const f = world.fishing, hx = (p.x + p.ox) * TS + 16 - cx + (p.dir === 'l' ? -8 : p.dir === 'r' ? 8 : 0), hy = (p.y + p.oy) * TS + TS - 26 - cy, tx = f.tx * TS + 16 - cx, ty = f.ty * TS + 18 - cy;
    const bite = f.state === 'bite', bob = bite ? 5 + Math.sin(clock * 30) * 2 : Math.sin(clock * 2.4) * 1.5, ex = tx, ey = ty + bob;
    g.save(); g.strokeStyle = 'rgba(40,36,50,.75)'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(hx, hy); g.quadraticCurveTo((hx + ex) / 2, Math.min(hy, ey) - 22, ex, ey); g.stroke();
    for (let i = 0; i < (bite ? 3 : 1); i++) { const k = ((clock * (bite ? 2.4 : 0.8) + i * 0.33) % 1); g.strokeStyle = `rgba(235,245,250,${(1 - k) * 0.8})`; g.lineWidth = 2; g.beginPath(); g.ellipse(tx, ty + 4, 6 + k * 18, (6 + k * 18) * 0.38, 0, 0, 7); g.stroke(); }
    g.fillStyle = '#fff'; g.beginPath(); g.arc(ex, ey, 4.4, 0, 7); g.fill(); g.fillStyle = '#e0574a'; g.beginPath(); g.arc(ex, ey - 1.6, 4.4, Math.PI, 0); g.fill(); g.strokeStyle = 'rgba(40,36,50,.7)'; g.lineWidth = 1.2; g.beginPath(); g.arc(ex, ey, 4.4, 0, 7); g.stroke();
    if (bite) { g.fillStyle = '#fff'; g.beginPath(); g.arc(hx, hy - 30, 11, 0, 7); g.fill(); g.strokeStyle = '#ff7a5e'; g.lineWidth = 2.5; g.stroke(); txt('!', hx, hy - 29, { align: 'center', size: 17, color: '#ff5a3e', w: 900 }); }
    else txt('うきを みつめて…(Aで ひく)', VW / 2, 330, { align: 'center', size: 13, color: '#fff', stroke: 'rgba(40,36,50,.7)', sw: 4 });
    g.restore();
  }
  if (showGrid) drawGrid(m, cx, cy, x0, x1, y0, y1);
  // 雲のかげ・やわらかい光
  g.fillStyle = 'rgba(20,70,40,.07)';
  const span = m.w * TS + 500;
  if (!bg) for (const c of CLOUDS) { const x = ((c.x + T * c.v) % span) - 200 - cx * 0.9, y = (c.y % (m.h * TS)) - cy * 0.9; g.beginPath(); g.ellipse(x, y, c.r * 1.7, c.r, 0, 0, 7); g.ellipse(x + c.r, y + 8, c.r * 1.3, c.r * 0.8, 0, 0, 7); g.fill(); }
  const vg = g.createRadialGradient(VW / 2, H / 2, H * 0.55, VW / 2, H / 2, H * 1.05); vg.addColorStop(0, 'rgba(0,30,10,0)'); vg.addColorStop(1, 'rgba(0,30,10,.22)'); g.fillStyle = vg; g.fillRect(0, 0, VW, H);
  if (world.bang && clock - world.bang.t0 < 0.9) { const b = world.bang, k = Math.min(1, (clock - b.t0) * 8), x = b.x * TS + 16 - cx, y = b.y * TS - 26 - cy - Math.sin(k * 3.14) * 6; g.fillStyle = '#fff'; g.beginPath(); g.arc(x, y, 11, 0, 7); g.fill(); g.strokeStyle = '#ff7a5e'; g.lineWidth = 2.5; g.stroke(); txt('!', x, y + 1, { align: 'center', size: 17, color: '#ff5a3e', w: 900 }); }
  if (world.emote && clock - world.emote.t0 < 1.5) {
    const k = (clock - world.emote.t0) / 1.5, f = world.fol, ex = (f.x + f.ox) * TS + 16 - cx, ey = (f.y + f.oy) * TS - 22 - cy;
    for (let i = 0; i < 3; i++) { const kk = clamp(k * 1.4 - i * 0.18, 0, 1); if (kk <= 0 || kk >= 1) continue; g.globalAlpha = 1 - kk * kk; heart(ex + (i - 1) * 10 + Math.sin(kk * 6 + i) * 3, ey - kk * 26, 5 + (i === 1 ? 2 : 0), i === 1 ? '#ff7f9f' : '#ffa9bf'); g.globalAlpha = 1; }
  }
  if (ui.banner) { const k = clock - ui.banner.t0; if (k < 2.6) { const y = k < 0.4 ? lerp(-40, 10, ease(k / 0.4)) : k > 2.2 ? lerp(10, -40, ease((k - 2.2) / 0.4)) : 10; const bt2 = ui.banner.text || m.name; g.font = `700 16px ${FONT}`; const bw = Math.max(200, g.measureText(bt2).width + 44); panel(VW / 2 - bw / 2, y, bw, 32, { r: 16, fill: 'rgba(255,250,240,.94)' }); txt(bt2, VW / 2, y + 17, { align: 'center', size: 16 }); } else ui.banner = null; }
}

// ---------- メインループ ----------
function resize() {
  const vw = window.innerWidth, vh = window.innerHeight, a = vw / vh; let w = vw, h = vh;
  if (a < 16 / 9) h = Math.round(vw * 9 / 16); else if (a > 2.4) w = Math.round(vh * 2.4);
  const st = document.getElementById('stage'); if (st._w !== w || st._h !== h) { st.style.width = w + 'px'; st.style.height = h + 'px'; st._w = w; st._h = h; }
  VW = clamp(Math.round(H * w / h), 640, 864); OX = (VW - W) / 2;
  const dpr = Math.min(window.devicePixelRatio || 1, 3), cw = Math.max(320, Math.round(w * dpr)), ch = Math.max(180, Math.round(h * dpr));
  if (cv.width !== cw || cv.height !== ch) { cv.width = cw; cv.height = ch; }
}
addEventListener('resize', resize); addEventListener('orientationchange', () => setTimeout(resize, 120));
function tick(dt) {
  clock += dt;
  if (mode === 'field') { S.time += dt; updateField(dt); const wt = warmth(); warmNow = warmNow == null ? wt : warmNow + (wt - warmNow) * Math.min(1, dt * 0.7); if (Math.floor(clock) !== Math.floor(clock - dt)) Aud.setWarm(warmNow); }
  for (let i = sleepers.length - 1; i >= 0; i--) if (sleepers[i].t <= clock) { const s = sleepers.splice(i, 1)[0]; s.r(); }
  const fw = frameW.splice(0); for (const r of fw) r();
  document.body.classList.toggle('modal', mode !== 'field' || modalActive());
  render();
}
// ---------- 画面全体の色の調子(90年代セルアニメ風): 青灰色の空気+夕方のあたたかい光+フィルムの粒子 ----------
const GRAIN = (() => { const c = document.createElement('canvas'); c.width = 1056; c.height = 552; const x = c.getContext('2d'), d = x.createImageData(1056, 552); for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } x.putImageData(d, 0, 0); return c; })();
let gradeLevel = 2, manualGrade = false; // 2 ふつう / 1 かるい(色合いだけ) / 0 なし
let gradeOn = true, gOx = 0, gOy = 0, gT = 0, warmDbg = null;
// 旅が進むほど世界があたたかくなる: 0(青灰色のしずかな空気)→1(金色のやわらかい光)。いまはずかんとライバル戦の進み具合から決める
const warmth = () => (warmDbg != null ? warmDbg : clamp(dexCount() / SPECIES_ORDER.length * 0.12 + (S.flags.beat_camper ? 0.02 : 0) + (S.flags.beat_rival ? 0.05 : 0) + (S.flags.beat_farmhand ? 0.02 : 0) + (S.flags.lit_town ? 0.22 : 0) + (S.flags.lit_town2 ? 0.22 : 0) + (S.flags.lit_town3 ? 0.25 : 0), 0, 1));
let warmNow = null; // 画面に出している暖かさ(目標へゆっくり近づく)
const hx = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mixc = (a, b, t) => { const A = hx(a), B = hx(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], t))).join(',')})`; };
function grade() {
  if (gradeLevel <= 0) return;
  const w = warmNow ?? 0;
  g.save();
  g.globalCompositeOperation = 'multiply';
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, mixc('#d3dfe6', '#f8ead2', w)); gr.addColorStop(0.55, mixc('#f0ebe4', '#fcf2de', w)); gr.addColorStop(1, mixc('#f6e2c8', '#ffe2b4', w)); g.fillStyle = gr; g.fillRect(0, 0, VW, H);
  if (gradeLevel < 2) { g.restore(); return; }
  g.globalCompositeOperation = 'screen';
  const rg = g.createRadialGradient(VW * 0.86, -30, 10, VW * 0.86, -30, H * 1.15); rg.addColorStop(0, `rgba(255,178,120,${lerp(0.3, 0.5, w)})`); rg.addColorStop(1, 'rgba(255,178,120,0)'); g.fillStyle = rg; g.fillRect(0, 0, VW, H);
  g.globalCompositeOperation = 'overlay'; g.globalAlpha = lerp(0.09, 0.06, w);
  if (clock - gT > 0.07) { gT = clock; gOx = -Math.floor(Math.random() * 190); gOy = -Math.floor(Math.random() * 190); }
  g.drawImage(GRAIN, gOx, gOy);
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  const vg = g.createRadialGradient(VW / 2, H / 2, H * 0.5, VW / 2, H / 2, H * 1.0); vg.addColorStop(0, 'rgba(30,20,50,0)'); vg.addColorStop(1, `rgba(30,20,50,${lerp(0.2, 0.12, w)})`); g.fillStyle = vg; g.fillRect(0, 0, VW, H);
  g.restore();
}
// 戦闘・タイトルなどは 640幅の絵を中央に置き、左右は端の1列を のばして うめる
const smearC = document.createElement('canvas'), smearG = smearC.getContext('2d');
function smearEdges() {
  if (OX <= 0) return; const px = Math.round(OX * cv.width / VW), w = cv.width, h = cv.height, k = Math.max(4, Math.round(px * 0.25));
  if (smearC.height !== h) { smearC.width = 1; smearC.height = h; }
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  smearG.imageSmoothingQuality = 'high'; // 端から少し内がわの帯を、1列にならして のばす(小さな星などが筋にならない)
  smearG.clearRect(0, 0, 1, h); smearG.drawImage(cv, px + 2, 0, k, h, 0, 0, 1, h); g.drawImage(smearC, 0, 0, 1, h, 0, 0, px, h);
  smearG.clearRect(0, 0, 1, h); smearG.drawImage(cv, w - px - 2 - k, 0, k, h, 0, 0, 1, h); g.drawImage(smearC, 0, 0, 1, h, w - px, 0, px, h);
  g.restore();
}
function render() {
  resize(); g.setTransform(cv.width / VW, 0, 0, cv.height / H, 0, 0); g.imageSmoothingQuality = 'high'; ui.hits.length = 0;
  g.save(); if (ui.shake > 0.3) { g.translate(rnd(-ui.shake, ui.shake), rnd(-ui.shake, ui.shake)); ui.shake *= 0.84; } else ui.shake = 0;
  if (mode === 'field') drawField();
  else { g.save(); g.translate(OX, 0); if (mode === 'title') drawTitle(); else if (mode === 'battle') drawBattle(); else if (mode === 'ending') drawEnding(); g.restore(); g.restore(); smearEdges(); g.save(); }
  g.restore();
  if (gradeOn && mode !== 'ending') grade();
  g.save(); g.translate(OX, 0);
  if (ui.overlay) ui.overlay();
  drawDialog(); drawNameTag(); drawChoice();
  g.restore();
  if (ui.flash > 0) { g.fillStyle = `rgba(255,255,255,${ui.flash})`; g.fillRect(0, 0, VW, H); }
  if (ui.wipe > 0) { g.fillStyle = '#1b1722'; const n = 12, bh = H / n; for (let i = 0; i < n; i++) { const w = Math.min(1, ui.wipe * 1.6 - (i % 6) * 0.1) * VW; if (w > 0) g.fillRect(i % 2 ? VW - w : 0, i * bh, w, bh + 1); } }
  if (ui.fade > 0) { g.globalAlpha = ui.fade; g.fillStyle = ui.fadeC; g.fillRect(0, 0, VW, H); g.globalAlpha = 1; }
}
