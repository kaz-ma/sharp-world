// 「シャープワールド」のデータ。モンスター、技、タイプ、マップ、人物。すべてオリジナル。
const TYPES = {
  normal: { name: 'ふつう', color: '#a59a94' },
  fire: { name: 'ほのお', color: '#d98a68' },
  water: { name: 'みず', color: '#6f9fcf' },
  leaf: { name: 'はっぱ', color: '#6fae85' },
  volt: { name: 'でんき', color: '#c9a63a' },
  metal: { name: 'こうてつ', color: '#8d97a6' },
};
// 攻撃タイプ → 受けるタイプ の倍率(書いていない組み合わせは1倍)
const CHART = {
  fire: { leaf: 2, water: 0.5, fire: 0.5, metal: 2 },
  water: { fire: 2, leaf: 0.5, water: 0.5, metal: 2 },
  leaf: { water: 2, fire: 0.5, leaf: 0.5, volt: 2, metal: 0.5 },
  volt: { water: 2, leaf: 0.5, volt: 0.5, metal: 0.5 },
  metal: { leaf: 2, fire: 0.5, water: 0.5, metal: 0.5 },
};

const MOVES = {
  tackle: { n: 'たいあたり', t: 'normal', p: 40, a: 100, pp: 25 },
  scratch: { n: 'ひっかく', t: 'normal', p: 40, a: 100, pp: 25 },
  bite: { n: 'かみつく', t: 'normal', p: 55, a: 90, pp: 15, fx: { stage: { def: -1 }, c: 0.25 } },
  press: { n: 'のしかかり', t: 'normal', p: 62, a: 85, pp: 10, fx: { status: 'para', c: 0.2 } },
  leafcut: { n: 'はっぱカッター', t: 'leaf', p: 45, a: 100, pp: 20 },
  vine: { n: 'つるのムチ', t: 'leaf', p: 58, a: 90, pp: 12 },
  spark: { n: 'ひのこ', t: 'fire', p: 45, a: 100, pp: 20, fx: { status: 'burn', c: 0.15 } },
  flame: { n: 'ほのおのいき', t: 'fire', p: 58, a: 90, pp: 12, fx: { status: 'burn', c: 0.3 } },
  splash: { n: 'みずでっぽう', t: 'water', p: 45, a: 100, pp: 20 },
  bubble: { n: 'あわビーム', t: 'water', p: 58, a: 90, pp: 12, fx: { stage: { spd: -1 }, c: 0.3 } },
  zap: { n: 'びりびり', t: 'volt', p: 45, a: 100, pp: 20, fx: { status: 'para', c: 0.15 } },
  bolt: { n: 'でんげき', t: 'volt', p: 60, a: 90, pp: 10, fx: { status: 'para', c: 0.25 } },
  // へんか技(ダメージなし)
  hum: { n: 'うなり', t: 'volt', p: 0, a: 100, pp: 15, cat: 's', tgt: 'foe', stage: { atk: -1 } },
  sleeppowder: { n: 'ねむりごな', t: 'leaf', p: 0, a: 75, pp: 12, cat: 's', tgt: 'foe', status: 'sleep' },
  stunspore: { n: 'しびれごな', t: 'leaf', p: 0, a: 80, pp: 12, cat: 's', tgt: 'foe', status: 'para' },
  sunbathe: { n: 'ひなたぼっこ', t: 'leaf', p: 0, a: 100, pp: 8, cat: 's', tgt: 'self', heal: 0.5 },
  glare: { n: 'にらみつける', t: 'normal', p: 0, a: 100, pp: 15, cat: 's', tgt: 'foe', stage: { def: -1 } },
  curl: { n: 'まるくなる', t: 'normal', p: 0, a: 100, pp: 15, cat: 's', tgt: 'self', stage: { def: 1 } },
  warmup: { n: 'ぬくもり', t: 'fire', p: 0, a: 100, pp: 12, cat: 's', tgt: 'self', stage: { atk: 1 } },
  chill: { n: 'ひやり', t: 'water', p: 0, a: 100, pp: 15, cat: 's', tgt: 'foe', stage: { spd: -1 } },
  sunbeam: { n: 'ひなたビーム', t: 'leaf', p: 78, a: 90, pp: 8 },
  acornbomb: { n: 'どんぐりばくだん', t: 'normal', p: 75, a: 90, pp: 8 },
  lanternflare: { n: 'あかりのほのお', t: 'fire', p: 80, a: 90, pp: 8, fx: { status: 'burn', c: 0.2 } },
  rainfall: { n: 'ひなたあめ', t: 'water', p: 78, a: 95, pp: 8 },
  clang: { n: 'がきん', t: 'metal', p: 46, a: 100, pp: 20 },
  rustcut: { n: 'さびきり', t: 'metal', p: 62, a: 90, pp: 10, fx: { stage: { def: -1 }, c: 0.3 } },
  harden: { n: 'かたくなる', t: 'metal', p: 0, a: 100, pp: 12, cat: 's', tgt: 'self', stage: { def: 2 } },
  struggle: { n: 'もがく', t: 'normal', p: 35, a: 100, pp: 1 },
};
for (const k in MOVES) MOVES[k].id = k;
const STATUS = { sleep: { n: 'ねむり', color: '#7f9fd0' }, burn: { n: 'やけど', color: '#d9735b' }, para: { n: 'まひ', color: '#c9a63a' } };
const STAT_N = { atk: 'こうげき', def: 'ぼうぎょ', spd: 'すばやさ' };

// base=[HP, こうげき, ぼうぎょ, すばやさ]。catch=つかまえやすさ(0〜1)、exp=たおしたときの経験値のもと
const SPECIES = {
  mikanya: { n: 'ミカニャ', t: 'leaf', base: [52, 54, 48, 58], moves: ['scratch', 'leafcut', 'sleeppowder', 'vine'], catch: 0.4, exp: 64, dex: 'しっぽの葉っぱは、おひさまが大すき。ごきげんだと、くるくる回る。' },
  pukurisu: { n: 'ぷくリス', t: 'normal', base: [50, 48, 44, 50], moves: ['tackle', 'curl', 'bite', 'press'], catch: 0.55, exp: 52, dex: 'どんぐりの帽子は、宝物。ほっぺに木の実をためている。' },
  hinatagaeru: { n: 'ひなたガエル', t: 'water', base: [56, 44, 50, 42], moves: ['tackle', 'splash', 'chill', 'bubble'], catch: 0.5, exp: 55, dex: 'あたまのたんぽぽは、天気を教えてくれる。晴れの日は、ふわふわ。' },
  hotaruusagi: { n: 'ほたるうさぎ', t: 'fire', base: [46, 50, 42, 62], moves: ['tackle', 'spark', 'warmup', 'flame'], catch: 0.4, exp: 60, dex: '耳の先が、ランタンのようにともる。夜道を、そっと照らしてくれる。' },
  kinokokko: { n: 'きのこっこ', t: 'leaf', base: [54, 42, 56, 36], moves: ['tackle', 'leafcut', 'stunspore', 'sunbathe'], catch: 0.55, exp: 52, dex: 'いつも、うとうとしている。帽子の水玉は、ねむけの数。' },
  shizukufin: { n: 'しずくフィン', t: 'water', base: [48, 46, 46, 56], moves: ['scratch', 'splash', 'chill', 'bubble'], catch: 0.45, exp: 58, dex: 'すきとおった体は、水そのもの。大きなひれで、ふわりと泳ぐ。' },
  birisuzume: { n: 'びりすずめ', t: 'volt', base: [40, 50, 38, 66], moves: ['tackle', 'zap', 'hum', 'bolt'], catch: 0.5, exp: 56, dex: '電線の上で、じっと町を見ている。ふれると、ぴりっとする。' },
  hanedoron: { n: 'ハネドロン', t: 'volt', base: [46, 52, 48, 54], moves: ['tackle', 'zap', 'glare', 'bolt'], catch: 0.4, exp: 62, dex: '光ファイバーをたどって飛ぶ。小さな羽音は、ちょっと機械のよう。' },
  hikaritanishi: { n: 'ひかりタニシ', t: 'water', base: [58, 40, 56, 34], moves: ['tackle', 'splash', 'curl', 'bubble'], catch: 0.5, exp: 56, dex: '殻の中を、細い光が走る。田んぼの水を、ゆっくり照らしている。' },
};
// 進化した姿(絵はまだ仮: 元の絵に金色の光)。AIの絵は assets/<id>.webp を置くと差し替わる
Object.assign(SPECIES, {
  yuuhineko: { n: 'ゆうひネコ', t: 'leaf', from: 'mikanya', base: [72, 76, 66, 82], catch: 0.1, exp: 110, dex: 'しっぽの葉っぱは、夕日の色に染まった。のんびりした顔の奥に、静かな強さがある。' },
  fukufukurisu: { n: 'ふくふくリス', t: 'normal', from: 'pukurisu', base: [70, 66, 62, 68], catch: 0.1, exp: 105, dex: 'どんぐりの帽子は、いまや宝箱。ためこんだ木の実の数だけ、頼もしくなる。' },
  himoriusagi: { n: 'ひもりうさぎ', t: 'fire', from: 'hotaruusagi', base: [62, 72, 58, 88], catch: 0.1, exp: 112, dex: '耳のあかりが、強くまぶしい。むかしは、町の灯りを運ぶ役目だったという。' },
  hinatagama: { n: 'ひなたガマ', t: 'water', from: 'hinatagaeru', base: [78, 62, 70, 58], catch: 0.1, exp: 108, dex: '頭のたんぽぽが、大きな花になった。晴れの日は、ゆったりと昼寝をしている。' },
});
SPECIES.mikanya.evo = { lv: 16, to: 'yuuhineko', move: 'sunbeam' };
SPECIES.pukurisu.evo = { lv: 16, to: 'fukufukurisu', move: 'acornbomb' };
SPECIES.hotaruusagi.evo = { lv: 18, to: 'himoriusagi', move: 'lanternflare' };
SPECIES.hinatagaeru.evo = { lv: 16, to: 'hinatagama', move: 'rainfall' };
// 覚える技: [レベル, 技]。4つまで持てる。おぼえたいのに いっぱいなら、どれかを わすれる
const LEARN = {
  mikanya: [[1, 'scratch'], [1, 'leafcut'], [6, 'sleeppowder'], [11, 'vine'], [14, 'sunbathe'], [18, 'press']],
  pukurisu: [[1, 'tackle'], [1, 'curl'], [6, 'bite'], [11, 'press'], [15, 'glare']],
  hinatagaeru: [[1, 'tackle'], [1, 'splash'], [6, 'chill'], [11, 'bubble'], [15, 'curl']],
  hotaruusagi: [[1, 'tackle'], [1, 'spark'], [6, 'warmup'], [11, 'flame'], [15, 'scratch']],
  kinokokko: [[1, 'tackle'], [1, 'leafcut'], [6, 'stunspore'], [11, 'sunbathe'], [15, 'vine']],
  shizukufin: [[1, 'scratch'], [1, 'splash'], [6, 'chill'], [11, 'bubble'], [15, 'tackle']],
  birisuzume: [[1, 'tackle'], [1, 'zap'], [6, 'hum'], [11, 'bolt'], [15, 'glare']],
  hanedoron: [[1, 'tackle'], [1, 'zap'], [6, 'glare'], [11, 'bolt'], [15, 'hum']],
  hikaritanishi: [[1, 'tackle'], [1, 'splash'], [6, 'curl'], [11, 'bubble'], [15, 'zap']],
};
for (const k in LEARN) SPECIES[k].learn = LEARN[k];
for (const k of ['yuuhineko', 'fukufukurisu', 'himoriusagi', 'hinatagama']) SPECIES[k].learn = SPECIES[SPECIES[k].from].learn;
// とくせい: 1匹に1つ。バトルで自動的に はたらく
const ABIL = {
  sunlover: { n: 'ひなたぼっこ', d: 'ターンの おわりに、HPが すこし かいふくする。' },
  acornhat: { n: 'どんぐりぼうし', d: 'うける ダメージが すこし へる。' },
  fluff: { n: 'わたげ', d: 'ふつうの わざを うけると、ときどき あいてを おそくする。' },
  lantern: { n: 'あかりもち', d: 'HPが へると、ほのおの わざが つよくなる。' },
  drowsy: { n: 'うとうと', d: 'ねむりに ならない。' },
  clear: { n: 'すきとおり', d: 'あいての わざが あたりにくい。' },
  static: { n: 'せいでんき', d: 'ふつうの わざを うけると、ときどき あいてを まひさせる。' },
  rotor: { n: 'かるいはね', d: 'すばやさが すこし あがる。' },
  insulate: { n: 'ぜつえん', d: 'でんきの わざを うけにくい。' },
  rustarmor: { n: 'さびのよろい', d: 'こうげきを うけると、ときどき あいての こうげきが さがる。' },
  mist: { n: 'きりがくれ', d: 'あいての わざが あたりにくい。' },
  ironhull: { n: 'ぎしぎし', d: 'まひに ならない。' },
};

// 3章(霧の港町)のモンスター。絵はまだ仮
Object.assign(SPECIES, {
  sabikani: { n: 'サビガニ', t: 'metal', base: [52, 58, 66, 34], catch: 0.4, exp: 70, dex: '錆びた甲羅は、港の歴史そのもの。大きなはさみで、ゆっくり波止場を歩く。' },
  kirikamome: { n: 'キリカモメ', t: 'water', base: [46, 50, 44, 64], catch: 0.45, exp: 66, dex: '霧の中を、音もなく飛ぶ。鳴き声が聞こえると、船が帰ってくる。' },
  funenko: { n: 'フネンコ', t: 'metal', base: [56, 50, 62, 40], catch: 0.45, exp: 68, dex: '使われなくなった小舟が、いつのまにか動きだした。港のはしを、ひとりで漂う。' },
});
Object.assign(LEARN, {
  sabikani: [[1, 'tackle'], [1, 'clang'], [6, 'harden'], [11, 'rustcut'], [15, 'bubble']],
  kirikamome: [[1, 'tackle'], [1, 'splash'], [6, 'chill'], [11, 'bubble'], [15, 'glare']],
  funenko: [[1, 'tackle'], [1, 'clang'], [6, 'curl'], [11, 'rustcut'], [15, 'harden']],
});
for (const k of ['sabikani', 'kirikamome', 'funenko']) SPECIES[k].learn = LEARN[k];
const AB_OF = { mikanya: 'sunlover', yuuhineko: 'sunlover', pukurisu: 'acornhat', fukufukurisu: 'acornhat', hinatagaeru: 'fluff', hinatagama: 'fluff', hotaruusagi: 'lantern', himoriusagi: 'lantern', kinokokko: 'drowsy', shizukufin: 'clear', birisuzume: 'static', hanedoron: 'rotor', hikaritanishi: 'insulate', sabikani: 'rustarmor', kirikamome: 'mist', funenko: 'ironhull' };
for (const k in AB_OF) SPECIES[k].ab = AB_OF[k];
const SPECIES_ORDER = ['mikanya', 'pukurisu', 'hinatagaeru', 'hotaruusagi', 'kinokokko', 'shizukufin', 'birisuzume', 'hanedoron', 'hikaritanishi', 'sabikani', 'kirikamome', 'funenko', 'yuuhineko', 'fukufukurisu', 'himoriusagi', 'hinatagama'];

const ITEMS = {
  ball: { n: 'あつめボール', d: 'やせいの モンスターを つかまえる。', price: 120 },
  potion: { n: 'きずぐすり', d: 'HPを 30 かいふくする。', heal: 30, price: 100 },
  cure: { n: 'なんでもなおし', d: 'ねむり・やけど・まひを なおす。', price: 80 },
};

const GAME = {
  title: 'シャープワールド',
  encounterRate: 0.14,
  maxLevel: 20,
  expTrainerBonus: 1.5,
};

// ---------- マップ(文字で描く) ----------
// . 草  , 道  g 高い草  T 木  ~ 水  F 柵  f 花  # 岩
function blank(w, h, ch) { return Array.from({ length: h }, () => Array(w).fill(ch)); }
function rect(t, x, y, w, h, ch) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (t[j] && t[j][i] !== undefined) t[j][i] = ch; }
function frame(t, w, h) { rect(t, 0, 0, w, 2, 'T'); rect(t, 0, h - 2, w, 2, 'T'); rect(t, 0, 0, 1, h, 'T'); rect(t, w - 1, 0, 1, h, 'T'); }
function rng(seed) { let a = seed; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

function buildVillage() {
  const w = 30, h = 18, t = blank(w, h, '.'), r = rng(11);
  frame(t, w, h);
  rect(t, 1, 9, w - 1, 1, ','); rect(t, 6, 7, 1, 3, ','); rect(t, 22, 7, 1, 3, ','); rect(t, 14, 5, 1, 5, ',');
  rect(t, 10, 12, 4, 3, '~'); rect(t, 3, 11, 7, 1, 'F'); rect(t, 17, 12, 5, 1, 'F');
  rect(t, w - 1, 8, 1, 2, ',');
  for (let i = 0; i < 40; i++) { const x = 2 + Math.floor(r() * (w - 4)), y = 3 + Math.floor(r() * (h - 6)); if (t[y][x] === '.') t[y][x] = 'f'; }
  rect(t, 24, 12, 4, 3, 'f');
  return {
    id: 'village', name: 'ひなた村', w, h, t, bgm: 'field', grass: null,
    objects: [
      { type: 'house', x: 5, y: 4, w: 3, h: 3, color: '#ff9a7a', name: '自分の家', door: 'home' },
      { type: 'house', x: 21, y: 4, w: 4, h: 3, color: '#7ac7c4', name: 'ふわふわ休憩所', door: 'rest' },
      { type: 'sign', x: 13, y: 8, text: 'sign_village' },
      { type: 'sign', x: 8, y: 7, text: 'sign_home' },
    ],
    npcs: [
      { id: 'elder', x: 8, y: 9, dir: 'l', pal: 'elder', script: 'elder' },
      { id: 'child', x: 16, y: 11, dir: 'u', pal: 'child', script: 'child' },
      { id: 'nurse', x: 20, y: 8, dir: 'd', pal: 'nurse', script: 'nurse' },
      { id: 'granny', x: 11, y: 6, dir: 'd', pal: 'granny', script: 'granny' },
    ],
    warps: [{ x: w - 1, y: 8, to: 'route', tx: 1, ty: 8, dir: 'r' }, { x: w - 1, y: 9, to: 'route', tx: 1, ty: 8, dir: 'r' }],
  };
}

function buildRoute() {
  const w = 50, h = 16, t = blank(w, h, '.'), r = rng(23);
  frame(t, w, h);
  rect(t, 49, 5, 1, 6, '.');
  rect(t, 0, 7, w, 2, ',');
  for (const [x, y, ww, hh] of [[5, 3, 10, 4], [5, 9, 10, 4], [19, 3, 8, 4], [19, 10, 8, 3], [31, 3, 9, 4], [31, 10, 9, 3]]) rect(t, x, y, ww, hh, 'g');
  rect(t, 42, 10, 5, 3, '~'); rect(t, 17, 5, 1, 1, 'T'); rect(t, 29, 11, 1, 1, 'T');
  for (let i = 0; i < 60; i++) { const x = 2 + Math.floor(r() * (w - 4)), y = 3 + Math.floor(r() * (h - 6)); if (t[y][x] === '.') t[y][x] = 'f'; }
  rect(t, 47, 7, 2, 2, ',');
  return {
    id: 'route', name: 'ひなた草原', w, h, t, bgm: 'field',
    grass: [['pukurisu', 30], ['hinatagaeru', 20], ['hotaruusagi', 14], ['kinokokko', 20], ['shizukufin', 16]], lv: [3, 5], grassLit: [['lit_town', [['birisuzume', 10]]], ['lit_town2', [['hanedoron', 8]]]],
    objects: [
      { type: 'sign', x: 3, y: 6, text: 'sign_route' },
      { type: 'gate', x: 48, y: 5, w: 2, h: 6 },
      { type: 'sign', x: 45, y: 6, text: 'sign_gate' },
    ],
    npcs: [
      { id: 'traveler', x: 17, y: 7, dir: 'd', pal: 'traveler', script: 'traveler' },
      { id: 'camper', x: 23, y: 8, dir: 'l', pal: 'camper', script: 'camper', trainer: true, sight: 4 },
      { id: 'rival', x: 36, y: 8, dir: 'l', pal: 'rival', script: 'rival', trainer: true, sight: 4 },
    ],
    warps: [{ x: 0, y: 7, to: 'village', tx: 28, ty: 8, dir: 'l' }, { x: 0, y: 8, to: 'village', tx: 28, ty: 9, dir: 'l' }, { x: 49, y: 7, to: 'town', tx: 1, ty: 12, dir: 'r', needs: 'beat_rival' }, { x: 49, y: 8, to: 'town', tx: 1, ty: 13, dir: 'r', needs: 'beat_rival' }],
  };
}

// 町の 当たり判定は 絵に そろえる(列 = 絵の 横位置 ÷ 32)
const LAMP_X = { town: [90, 330, 700, 980, 1190], town2: [110, 400, 690, 940, 1190], town3: [122, 402, 700, 962] };
function blockLamps(t, id) { for (const x of LAMP_X[id]) { const c = Math.floor((x + 1) / 32); t[9][c] = '#'; t[10][c] = '#'; } } // 街灯の 柱が 立つ マス
function openRoad(t, w) { rect(t, 0, 11, 1, 4, '.'); rect(t, w - 1, 11, 1, 4, '.'); } // 道の はば(11〜14行)の まま、町の 外へ 出られる

// ひだまり町(仮): 背景は1枚の絵、歩ける場所は文字の図(# 歩けない / . 歩ける)で決める。絵が1280x736なら 40x23 タイル。
function buildTown() {
  const w = 40, h = 23, t = blank(w, h, '.');
  rect(t, 0, 0, w, 7, '#'); rect(t, 0, 21, w, 2, '#'); rect(t, 0, 0, 1, h, '#'); rect(t, w - 1, 0, 1, h, '#');
  for (const [x, ww] of [[4, 6], [13, 7], [24, 6], [33, 5]]) rect(t, x, 7, ww, 4, '#');
  for (const x of [3, 12, 22, 32]) rect(t, x, 7, 1, 5, '#'); // 電柱(上から 下まで)
  blockLamps(t, 'town'); openRoad(t, w);
  return {
    id: 'town', name: 'ひだまり町', w, h, t, bg: 'town1', bgm: 'town', btheme: 'dusk', grass: null,
    lamps: [90, 330, 700, 980, 1190].map((x) => ({ x: x + 2, y: 298 })),
    objects: [
      { type: 'door', x: 6, y: 10, door: 'house' }, { type: 'door', x: 16, y: 10, door: 'shop' },
      { type: 'door', x: 26, y: 10, door: 'clinic' }, { type: 'door', x: 35, y: 10, door: 'tower' },
    ],
    npcs: [
      { id: 'oldman', x: 9, y: 12, dir: 'r', pal: 'elder', script: 'oldman', idle: true },
      { id: 'girl', x: 21, y: 13, dir: 'u', pal: 'child', script: 'girl', idle: true },
      { id: 'clerk', x: 17, y: 11, dir: 'd', pal: 'nurse', script: 'clerk' },
      { id: 'teacher', x: 28, y: 13, dir: 'l', pal: 'teacher', script: 'teacher', idle: true },
      { id: 'techie', x: 31, y: 13, dir: 'l', pal: 'techie', script: 'techie', trainer: true, sight: 4 },
    ],
    warps: [{ x: 0, y: 11, to: 'route', tx: 48, ty: 7, dir: 'l' }, { x: 0, y: 12, to: 'route', tx: 48, ty: 7, dir: 'l' }, { x: 0, y: 13, to: 'route', tx: 48, ty: 8, dir: 'l' }, { x: 0, y: 14, to: 'route', tx: 48, ty: 8, dir: 'l' }, { x: w - 1, y: 11, to: 'route2', tx: 1, ty: 7, dir: 'r', needs: 'lit_town', needMsg: 'この さきへ いく まえに、この 町の あかりを ともしたい。\nあかり番の レンと しょうぶを してみよう。' }, { x: w - 1, y: 12, to: 'route2', tx: 1, ty: 7, dir: 'r', needs: 'lit_town', needMsg: 'この さきへ いく まえに、この 町の あかりを ともしたい。\nあかり番の レンと しょうぶを してみよう。' }, { x: w - 1, y: 13, to: 'route2', tx: 1, ty: 8, dir: 'r', needs: 'lit_town', needMsg: 'この さきへ いく まえに、この 町の あかりを ともしたい。\nあかり番の レンと しょうぶを してみよう。' }, { x: w - 1, y: 14, to: 'route2', tx: 1, ty: 8, dir: 'r', needs: 'lit_town', needMsg: 'この さきへ いく まえに、この 町の あかりを ともしたい。\nあかり番の レンと しょうぶを してみよう。' }],
    lightText: ['ひだまり町の 街灯に、ひさしぶりに あかりが ともった。', 'どこかで、だれかが わらった ような きがした。'],
  };
}

// 2章の道: でんせん街道(仮)。草むらは1章より少し強い、でんきタイプの子たちがいる
function buildRoute2() {
  const w = 50, h = 16, t = blank(w, h, '.'), r = rng(37);
  frame(t, w, h); rect(t, 49, 5, 1, 6, '.'); rect(t, 0, 7, w, 2, ',');
  for (const [x, y, ww, hh] of [[4, 3, 9, 4], [4, 9, 9, 4], [18, 3, 8, 4], [18, 10, 9, 3], [32, 3, 10, 4], [32, 10, 10, 3]]) rect(t, x, y, ww, hh, 'g');
  rect(t, 40, 11, 6, 3, '~'); rect(t, 15, 4, 1, 1, 'T'); rect(t, 30, 12, 1, 1, 'T');
  for (let i = 0; i < 50; i++) { const x = 2 + Math.floor(r() * (w - 4)), y = 3 + Math.floor(r() * (h - 6)); if (t[y][x] === '.') t[y][x] = 'f'; }
  return {
    id: 'route2', name: 'でんせん街道', w, h, t, bgm: 'field',
    grass: [['birisuzume', 30], ['hanedoron', 22], ['hikaritanishi', 18], ['hinatagaeru', 15], ['kinokokko', 15]], lv: [7, 9], grassLit: [['lit_town2', [['hotaruusagi', 8]]], ['lit_town3', [['kirikamome', 10]]]],
    objects: [{ type: 'sign', x: 3, y: 6, text: 'sign_route2' }],
    npcs: [{ id: 'farmhand', x: 27, y: 8, dir: 'l', pal: 'farmhand', script: 'farmhand', trainer: true, sight: 4 }],
    warps: [{ x: 0, y: 7, to: 'town', tx: 38, ty: 12, dir: 'l' }, { x: 0, y: 8, to: 'town', tx: 38, ty: 13, dir: 'l' }, { x: 49, y: 7, to: 'town2', tx: 1, ty: 12, dir: 'r' }, { x: 49, y: 8, to: 'town2', tx: 1, ty: 13, dir: 'r' }],
  };
}
// ミドリ団地(仮): 近未来に改変された田舎の町。ビニールハウスが電脳化し、ドローンが飛ぶ
function buildTown2() {
  const w = 40, h = 23, t = blank(w, h, '.');
  rect(t, 0, 0, w, 7, '#'); rect(t, 0, 21, w, 2, '#'); rect(t, 0, 0, 1, h, '#'); rect(t, w - 1, 0, 1, h, '#');
  for (const [x, ww] of [[3, 7], [12, 5], [22, 7], [32, 6]]) rect(t, x, 7, ww, 4, '#');
  blockLamps(t, 'town2'); openRoad(t, w);
  const NEED2 = "この 町の あかりを ともさずに、さきへ すすむのは はやい きがする。\nあかり番の ナナと しょうぶを しよう。";
  return {
    id: 'town2', name: 'ミドリ団地', w, h, t, bg: 'town2', bgm: 'town', btheme: 'neon', grass: null,
    lamps: [110, 400, 690, 940, 1190].map((x) => ({ x, y: 298 })),
    objects: [
      { type: 'door', x: 6, y: 10, door: 'greenhouse' }, { type: 'door', x: 14, y: 10, door: 'kiosk' },
      { type: 'door', x: 25, y: 10, door: 'clinic2' }, { type: 'door', x: 34, y: 10, door: 'datacenter' },
    ],
    npcs: [
      { id: 'farmer', x: 8, y: 12, dir: 'd', pal: 'granny', script: 'farmer', idle: true },
      { id: 'nboy', x: 17, y: 14, dir: 'l', pal: 'child', script: 'nboy', idle: true },
      { id: 'nana', x: 30, y: 13, dir: 'l', pal: 'nana', script: 'nana', trainer: true, sight: 4 },
    ],
    warps: [{ x: 0, y: 11, to: 'route2', tx: 48, ty: 7, dir: 'l' }, { x: 0, y: 12, to: 'route2', tx: 48, ty: 7, dir: 'l' }, { x: 0, y: 13, to: 'route2', tx: 48, ty: 8, dir: 'l' }, { x: 0, y: 14, to: 'route2', tx: 48, ty: 8, dir: 'l' }, { x: w - 1, y: 11, to: 'route3', tx: 1, ty: 7, dir: 'r', needs: 'lit_town2', needMsg: NEED2 }, { x: w - 1, y: 12, to: 'route3', tx: 1, ty: 7, dir: 'r', needs: 'lit_town2', needMsg: NEED2 }, { x: w - 1, y: 13, to: 'route3', tx: 1, ty: 8, dir: 'r', needs: 'lit_town2', needMsg: NEED2 }, { x: w - 1, y: 14, to: 'route3', tx: 1, ty: 8, dir: 'r', needs: 'lit_town2', needMsg: NEED2 }],
    lightText: ['ビニールハウスの 天井が、ぱっと ひかった。', 'ロボットたちが、ゆっくり うごきだす。'],
  };
}

// 3章の道: しおかぜ街道(仮)
function buildRoute3() {
  const w = 50, h = 16, t = blank(w, h, '.'), r = rng(53);
  frame(t, w, h); rect(t, 49, 5, 1, 6, '.'); rect(t, 0, 7, w, 2, ',');
  for (const [x, y, ww, hh] of [[5, 3, 8, 4], [5, 9, 8, 4], [19, 3, 9, 4], [19, 10, 9, 3], [33, 3, 8, 4], [33, 10, 9, 3]]) rect(t, x, y, ww, hh, 'g');
  rect(t, 14, 11, 4, 3, '~'); rect(t, 44, 2, 4, 3, '~');
  for (let i = 0; i < 40; i++) { const x = 2 + Math.floor(r() * (w - 4)), y = 3 + Math.floor(r() * (h - 6)); if (t[y][x] === '.') t[y][x] = 'f'; }
  return {
    id: 'route3', name: 'しおかぜ街道', w, h, t, bgm: 'field', fog: 0.22,
    grass: [['sabikani', 26], ['kirikamome', 24], ['funenko', 20], ['hikaritanishi', 15], ['hinatagaeru', 15]], lv: [11, 13], grassLit: [['lit_town3', [['birisuzume', 8], ['hanedoron', 8]]]],
    objects: [{ type: 'sign', x: 3, y: 6, text: 'sign_route3' }],
    npcs: [{ id: 'sailor', x: 27, y: 8, dir: 'l', pal: 'sailor', script: 'sailor', trainer: true, sight: 4 }],
    warps: [{ x: 0, y: 7, to: 'town2', tx: 38, ty: 12, dir: 'l' }, { x: 0, y: 8, to: 'town2', tx: 38, ty: 13, dir: 'l' }, { x: 49, y: 7, to: 'town3', tx: 1, ty: 12, dir: 'r' }, { x: 49, y: 8, to: 'town3', tx: 1, ty: 13, dir: 'r' }],
  };
}
// ナギサ港(仮): 霧の港町。灯台のあかりが消えている
function buildTown3() {
  const w = 40, h = 23, t = blank(w, h, '.');
  rect(t, 0, 0, w, 11, '#'); rect(t, 0, 15, w, 8, '#'); rect(t, 0, 0, 1, h, '#'); rect(t, w - 1, 0, 1, h, '#'); // 歩けるのは 岸壁(11〜14行)。建物の うしろと 下は 海
  openRoad(t, w);
  const NEED3 = 'この 港の あかりを ともさずに、さきへ すすむのは はやい きがする。\n灯台守の ゴロウと しょうぶを しよう。';
  return {
    id: 'town3', name: 'ナギサ港', w, h, t, bg: 'town3', bgm: 'town', btheme: 'harbor', grass: null, fog: 0.45,
    lamps: [{ x: 122, y: 298 }, { x: 402, y: 298 }, { x: 700, y: 298 }, { x: 962, y: 298 }, { x: 1104, y: 54 }], // 最後は 灯台の てっぺん
    objects: [
      { type: 'door', x: 6, y: 10, door: 'market' }, { type: 'door', x: 14, y: 10, door: 'warehouse' },
      { type: 'door', x: 25, y: 10, door: 'clinic3' }, { type: 'door', x: 34, y: 10, door: 'lighthouse' },
    ],
    npcs: [
      { id: 'fisher', x: 9, y: 12, dir: 'd', pal: 'fisher', script: 'fisher', idle: true },
      { id: 'dockgirl', x: 19, y: 14, dir: 'l', pal: 'child', script: 'dockgirl', idle: true },
      { id: 'goro', x: 30, y: 13, dir: 'l', pal: 'goro', script: 'goro', trainer: true, sight: 4 },
    ],
    warps: [{ x: 0, y: 11, to: 'route3', tx: 48, ty: 7, dir: 'l' }, { x: 0, y: 12, to: 'route3', tx: 48, ty: 7, dir: 'l' }, { x: 0, y: 13, to: 'route3', tx: 48, ty: 8, dir: 'l' }, { x: 0, y: 14, to: 'route3', tx: 48, ty: 8, dir: 'l' }, { x: w - 1, y: 11, to: 'route4', tx: 1, ty: 7, dir: 'r', needs: 'lit_town3', needMsg: NEED3 }, { x: w - 1, y: 12, to: 'route4', tx: 1, ty: 7, dir: 'r', needs: 'lit_town3', needMsg: NEED3 }, { x: w - 1, y: 13, to: 'route4', tx: 1, ty: 8, dir: 'r', needs: 'lit_town3', needMsg: NEED3 }, { x: w - 1, y: 14, to: 'route4', tx: 1, ty: 8, dir: 'r', needs: 'lit_town3', needMsg: NEED3 }],
    lightText: ['灯台の てっぺんで、おおきな あかりが ゆっくり まわりはじめた。', '霧の むこうから、船の ひびきが ちかづいてくる。'],
  };
}

// 4章の道: やまなみ道
function buildRoute4() {
  const w = 50, h = 16, t = blank(w, h, '.'), r = rng(71);
  frame(t, w, h); rect(t, 49, 5, 1, 6, '.'); rect(t, 0, 7, w, 2, ',');
  for (const [x, y, ww, hh] of [[5, 3, 7, 4], [5, 9, 9, 4], [18, 3, 9, 4], [19, 9, 7, 4], [31, 3, 10, 4], [32, 10, 9, 3]]) rect(t, x, y, ww, hh, 'g');
  for (const [x, y] of [[13, 3], [13, 4], [14, 3], [15, 11], [16, 12], [28, 11], [28, 12], [29, 3], [29, 4], [43, 4], [44, 11], [45, 3]]) t[y][x] = 'T';
  for (let i = 0; i < 24; i++) { const x = 2 + Math.floor(r() * (w - 4)), y = 3 + Math.floor(r() * (h - 6)); if (t[y][x] === '.') t[y][x] = 'f'; }
  return {
    id: 'route4', name: 'やまなみ道', w, h, t, bgm: 'field', btheme: 'mountain', fog: 0.12,
    grass: [['sabikani', 18], ['hanedoron', 18], ['birisuzume', 18], ['kinokokko', 16], ['hotaruusagi', 18], ['pukurisu', 14]], lv: [14, 16],
    objects: [{ type: 'sign', x: 3, y: 6, text: 'sign_route4' }],
    npcs: [{ id: 'hiker', x: 24, y: 8, dir: 'l', pal: 'camper', script: 'hiker', trainer: true, sight: 4 }],
    warps: [{ x: 0, y: 7, to: 'town3', tx: 38, ty: 12, dir: 'l' }, { x: 0, y: 8, to: 'town3', tx: 38, ty: 13, dir: 'l' }, { x: 49, y: 7, to: 'town4', tx: 1, ty: 12, dir: 'r' }, { x: 49, y: 8, to: 'town4', tx: 1, ty: 13, dir: 'r' }],
  };
}
// ヤマノハ: 山の 発電所の町。歩けるのは 石だたみ(11〜16行)。建物・柱は それより上、下は がけ
function buildTown4() {
  const w = 40, h = 23, t = blank(w, h, '.');
  rect(t, 0, 0, w, 11, '#'); rect(t, 0, 17, w, 6, '#'); rect(t, w - 1, 0, 1, h, '#'); rect(t, 0, 0, 1, h, '#'); rect(t, 0, 11, 1, 6, '.');
  const back = (y) => (y <= 12 ? 7 : 8);
  return {
    id: 'town4', name: 'ヤマノハ', w, h, t, bg: 'town4', bgm: 'town', btheme: 'mountain', grass: null,
    lamps: [330, 620, 780, 1240].map((x) => ({ x, y: 298 })),
    objects: [{ type: 'door', x: 5, y: 10, door: 'clinic4' }, { type: 'door', x: 14, y: 10, door: 'shop4' }, { type: 'door', x: 30, y: 10, door: 'plant' }],
    npcs: [
      { id: 'ygranny', x: 9, y: 13, dir: 'd', pal: 'granny', script: 'ygranny', idle: true },
      { id: 'yboy', x: 19, y: 15, dir: 'r', pal: 'child', script: 'yboy', idle: true },
      { id: 'keeper', x: 33, y: 12, dir: 'd', pal: 'keeper', script: 'keeper', need: 'cleared' },
      { id: 'minato3', x: 27, y: 12, dir: 'd', pal: 'rival', script: 'minato3', need: 'cleared' },
    ],
    warps: [11, 12, 13, 14, 15, 16].map((y) => ({ x: 0, y, to: 'route4', tx: 48, ty: back(y), dir: 'l' })),
  };
}

// 会話のときに出る名前(立ち絵の名前札)。立ち絵のファイルは assets/p_<id>.webp
const NPC_NAMES = { hiker: 'タケ', ygranny: 'ヤマノハの おばあさん', yboy: 'ヤマノハの 少年', yshop: '店の人', keeper: '番人', minato2: 'ミナト', minato3: 'ミナト', elder: 'おじいさん', child: 'こども', nurse: '看護師', granny: 'おばあさん', traveler: '旅人', teacher: 'わざの先生', goro: 'ゴロウ', sailor: 'ヒデ', fisher: '漁師のおじさん', dockgirl: '港の少女', rival: 'ミナト', camper: 'ユウジ', techie: 'レン', farmhand: 'ハルキ', nana: 'ナナ', farmer: '農家のおばさん', nboy: '少年', oldman: '町の老人', girl: '少女', clerk: '店員' };

const PALETTES = {
  hero: { body: '#7ed9b8', body2: '#4fb596', hat: '#ffd36b', hair: '#6b4535', skin: '#ffe0c4', scarf: '#ff8f7a' },
  elder: { body: '#b79de0', body2: '#9179c4', hat: '#e8e8f0', hair: '#e8e8f0', skin: '#f6d9bf', scarf: '#f3c96b' },
  child: { body: '#ffb86b', body2: '#ee9a4a', hat: '#6bb5ff', hair: '#5a4030', skin: '#ffe0c4', scarf: '#6bb5ff' },
  nurse: { body: '#ffd0e0', body2: '#f4a8c4', hat: '#ffffff', hair: '#8a5a44', skin: '#ffe0c4', scarf: '#ff8fa8' },
  granny: { body: '#9ed5a0', body2: '#78b87c', hat: '#f4f4f4', hair: '#f4f4f4', skin: '#f6d9bf', scarf: '#e8b86b' },
  traveler: { body: '#e8c98a', body2: '#c9a666', hat: '#9a6a3a', hair: '#4a3626', skin: '#f0cfae', scarf: '#c0504a' },
  camper: { body: '#8fb88a', body2: '#6f9a6a', hat: '#d9a35b', hair: '#4a3626', skin: '#f0cfae', scarf: '#d9735b' },
  techie: { body: '#9fb4c6', body2: '#7f94a6', hat: '#37323f', hair: '#2a2438', skin: '#ffe0c4', scarf: '#6fd0e0' },
  farmhand: { body: '#c8b27a', body2: '#a8925a', hat: '#e8dcb0', hair: '#4a3626', skin: '#f0cfae', scarf: '#6fae85' },
  nana: { body: '#8a7fd0', body2: '#6a5fb0', hat: '#6fd0e0', hair: '#37323f', skin: '#ffe0c4', scarf: '#d96fb0' },
  sailor: { body: '#7f94a6', body2: '#5f7486', hat: '#f4f1e8', hair: '#4a3626', skin: '#f0cfae', scarf: '#d9735b' },
  goro: { body: '#8d7a62', body2: '#6d5a44', hat: '#37323f', hair: '#e8e8f0', skin: '#e8c9a8', scarf: '#d9c27a' },
  fisher: { body: '#6f8f8a', body2: '#4f6f6a', hat: '#c9b27a', hair: '#8a8a94', skin: '#e8c9a8', scarf: '#c9b27a' },
  teacher: { body: '#b79d8a', body2: '#977d6a', hat: '#d9c9a8', hair: '#e8e8f0', skin: '#f6d9bf', scarf: '#8a6fd0' },
  keeper: { body: '#5f7068', body2: '#45544e', hat: '#34323a', hair: '#e8e6e4', skin: '#e8c9a8', scarf: '#8a7a5a' },
  rival: { body: '#a38cff', body2: '#7f68e0', hat: '#ff6b8a', hair: '#2a2438', skin: '#ffe0c4', scarf: '#ffd36b' },
};
