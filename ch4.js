'use strict';
// 第四章 ヤマノハ と 結末: 発電所で 番人と 相棒に 会う → ミナトと 本気の 勝負 → 灯りを 受けつぐ → 一斉点灯 → おわり
const sceneImgs = {};
function loadScene(key) {
  if (sceneImgs[key]) return Promise.resolve(sceneImgs[key]);
  return new Promise((r) => { const im = new Image(), id = 'scene_' + key; im.onload = () => { sceneImgs[key] = im; r(im); }; im.onerror = () => r(null); im.src = (window.ART_SRC && window.ART_SRC[id]) || `assets/${id}.webp`; });
}
async function sceneShow(key) {
  const im = await loadScene(key), t0 = clock;
  ui.overlay = () => {
    const t = clock - t0, z = calmMotion.matches ? 1 : 1.02 + Math.min(0.08, t * 0.004), w = 864 * z, h = H * z;
    g.fillStyle = '#0d0c18'; g.fillRect(-OX, 0, VW, H); if (im) g.drawImage(im, W / 2 - w / 2, (H - h) * 0.3, w, h);
    g.fillStyle = '#08070f'; g.fillRect(-OX, 0, VW, 14); g.fillRect(-OX, H - 6, VW, 6);
  };
}
const line = (name, ...texts) => sayAll(texts.map((t) => `${name}「${t}」`));

// 発電所の とびら
async function plantDoor() {
  if (S.flags.cleared) { await say('発電所は、しずかに うなりを あげている。\n町じゅうへ、あかりを 送りつづけている。'); return; }
  if (S.flags.beat_minato2) { await finale(); return; }
  if (!S.flags.met_keeper) await plantMeet();
  else {
    await line('ミナト', 'きたね。…もういちど、本気で いくよ。');
    const c = await choose(['しょうぶする', 'じゅんびする'], { x: 440, y: 150, w: 180, cancel: 1 }); if (c !== 0) return;
  }
  await trainerBattle({ id: 'minato2' });
  if (S.flags.beat_minato2) await finale();
}
async function plantMeet() {
  clearSpeaker(); Aud.bgm(null); await fade(1, 0.6, '#0d0c18'); await sceneShow('sleep'); Aud.bgm('memory'); await fade(0, 1.0); await sleep(0.8);
  await say('おくの 台の 上で、大きな 白い うさぎが ねむっている。\n耳の あかりは、きえたままだ。');
  await line('番人', '…客人とは、めずらしい。');
  if (S.party.some((m) => m.sp === 'mikanya' || m.sp === 'yuuhineko')) await line('番人', 'その ミカニャは…そうか。\nあいつが、おまえさんを よこしたんだな。');
  await line('番人', 'この子は、わしの 相棒の ひもりうさぎだ。', 'あの 嵐の夜、わしは 町の あかりを けした。\nこの子は 一晩じゅう、町の 道を てらした。', 'そして 朝には、目を あけなくなった。', 'わけを 話せば、よかったのかもしれん。\nだが、あの夜の こわさを、町の者に 思い出させたくは なかった。');
  await line('ミナト', 'じいちゃん。');
  await line('番人', 'ミナト…! おまえ、どうして ここに。');
  await line('ミナト', 'ぜんぶ 聞いた。…どうして 言ってくれなかったの。', 'いいよ、もう。\n灯りは ぼくが ともす。じいちゃんの ぶんも、ひとりで。', 'きみには まかせられない。\n――本気で、しょうぶだ!');
  S.flags.met_keeper = true; save();
  await fade(1, 0.5, '#0d0c18'); ui.overlay = null; Aud.bgm(world.map.bgm); await fade(0, 0.5);
}

// 灯りを 受けつぐ子を さがす(いなければ、ついてきていた子が おりてくる)
async function heirRabbit() {
  const isHeir = (m) => m.sp === 'himoriusagi' || m.sp === 'hotaruusagi';
  let m = S.party.find((x) => x.sp === 'himoriusagi') || S.party.find(isHeir);
  if (m) return m;
  const i = S.box.findIndex(isHeir);
  if (i >= 0) {
    m = S.box.splice(i, 1)[0]; if (S.party.length >= 6) S.box.push(S.party.pop()); S.party.push(m);
    await say(`あずけていた ${nameOf(m)}が、よばれたように かけつけた。`); return m;
  }
  m = mkMon('hotaruusagi', Math.max(18, ...S.party.map((x) => x.lv))); m.bond = 40;
  if (S.party.length >= 6) S.box.push(S.party.pop()); S.party.push(m); markSeen(m.sp); S.caught[m.sp] = true;
  await say('電線を つたって ついてきていた ほたるうさぎが、\nきみの 前に おりてきた。'); return m;
}

async function finale() {
  clearSpeaker(); healAll(); Aud.bgm(null); await fade(1, 0.7, '#0d0c18'); await sceneShow('sleep'); Aud.bgm('memory'); await fade(0, 1.0); await sleep(0.6);
  await line('ミナト', 'じいちゃん。ぼく、ひとりじゃ とどかなかった。');
  await line('番人', 'ひとりで ともせる 灯りなど、ないよ。\nわしにも、この子が いた。');
  await say('そのとき、ねむっていた ひもりうさぎが、\nゆっくりと 目を あけた。');
  Aud.sfx('lightBurst'); ui.flash = 1; await sceneShow('wake'); await anim(1.0, (k) => { ui.flash = 1 - k; }); ui.flash = 0;
  await say('耳の さきに のこった さいごの 灯りが、\nきみの そばの 子へ、うつっていく。');
  const heir = await heirRabbit(); addBond(heir, 20);
  if (heir.sp === 'hotaruusagi') { ui.overlay = null; await evolveScene(heir); } else { Aud.sfx('levelup'); await say(`${nameOf(heir)}の 灯りが、ひときわ 強くなった。`); }
  await sceneShow('wake'); Aud.bgm('memory');
  await line('番人', '…そうか。\nあとを たのめる子が、できたんだな。');
  await line('ミナト', 'じいちゃん、レバーは いっしょに あげよう。\nきみも、手を かして。');
  await say('三人の 手が、古い レバーを おしあげた。');
  Aud.sfx('boom', 'metal'); ui.shake = 9; await sleep(0.8); await fade(1, 0.8, '#0d0c18');

  // 一斉点灯
  finaleLit = []; const t0 = clock; ui.overlay = () => drawFinale(clock - t0); Aud.bgm(null); await fade(0, 1.0); await sleep(0.8);
  const light = async (i, text) => { finaleLit[i] = clock; Aud.sfx('lampOn', i); await sleep(0.7); await say(text); };
  Aud.bgm('light');
  await light(0, 'ひなた村の まどに、あかりが ともった。');
  await light(1, 'ひだまり町の 街灯が、ひとつずつ ともっていく。');
  await light(2, 'ミドリ団地の 畑が、緑に ひかりはじめた。');
  await light(3, 'ナギサ港の 灯台が、おおきく まわりだした。');
  Aud.sfx('lightBurst'); await light(4, '道ばたには、あの夜のように、ほたるうさぎが ならんでいた。\nこんどは、だれもが それに 気づいた。');
  await line('町の老人', '…あの 灯りだ。\nそうか、おまえたちだったのか。');
  await line('ゴロウ', 'ほれ見ろ。\nわしの 友は、まちがった ことを せん 男だ。');
  await line('町の人たち', 'ありがとう。…ほんとうに、ありがとう。');
  await line('番人', '礼を 言われるのは、こんなに あたたかい ものだったか。');
  await line('おじいさん', '迎えに いってくれて、ありがとう。\nあの がんこ者は、わしが いくら 呼んでも おりて こなんだ。');
  await line('ミナト', 'ぼくは ここで、じいちゃんの あとを つぐよ。\n灯守りに なる。…もう、ひとりじゃ ないから。');
  S.flags.cleared = S.flags.lit_town4 = true; save();
  await fade(1, 0.9, '#0d0c18'); ui.overlay = null;
  await endingScene();
}

// 谷を 見おろす 一枚絵。finaleLit[i] に 時刻が 入ると、その町が ともる(4 は 道の ほたるうさぎ)
let finaleLit = [];
const FINALE_TOWNS = [['ひなた村', 78, 180], ['ひだまり町', 232, 146], ['ミドリ団地', 408, 178], ['ナギサ港', 566, 138]];
function drawFinale(t) {
  const x0 = -OX, x1 = W + OX, on = (i, d = 1.2) => (finaleLit[i] == null ? 0 : clamp((clock - finaleLit[i]) / d, 0, 1)), warm = (on(0) + on(1) + on(2) + on(3)) / 4;
  const sky = g.createLinearGradient(0, 0, 0, 140); sky.addColorStop(0, '#0e1434'); sky.addColorStop(0.65, mixc('#222a55', '#6a4f7c', warm)); sky.addColorStop(1, mixc('#33385e', '#e79d78', warm));
  g.fillStyle = sky; g.fillRect(x0, 0, VW, H);
  for (let i = 0; i < 80; i++) { const a = (0.35 + 0.65 * Math.abs(Math.sin(clock * (0.5 + (i % 5) * 0.21) + i))) * (1 - i / 160); Art.star(g, x0 + rnd01(i) * VW, rnd01(i + 90) * 120, 0.8 + (i % 3) * 0.5, `rgba(255,244,214,${a})`); }
  g.fillStyle = '#2a2b52'; g.beginPath(); g.moveTo(x0, 108); g.lineTo(80, 54); g.lineTo(190, 100); g.lineTo(330, 42); g.lineTo(450, 96); g.lineTo(560, 58); g.lineTo(x1, 98); g.lineTo(x1, H); g.lineTo(x0, H); g.fill();
  g.fillStyle = '#181a36'; g.beginPath(); g.moveTo(x0, 128); g.quadraticCurveTo(200, 96, 340, 132); g.quadraticCurveTo(500, 162, x1, 106); g.lineTo(x1, H); g.lineTo(x0, H); g.fill();
  // 町をむすぶ 道
  const road = [[x0, 216], [78, 192], [155, 178], [232, 160], [320, 180], [408, 190], [490, 170], [566, 152], [x1, 134]];
  g.strokeStyle = 'rgba(160,150,190,.28)'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); road.forEach(([x, y], i) => g[i ? 'lineTo' : 'moveTo'](x, y)); g.stroke();
  FINALE_TOWNS.forEach(([name, x, y], i) => {
    const k = on(i);
    if (i === 2) { for (let j = -2; j <= 2; j++) { const cx = x + j * 24, r = 13 - Math.abs(j) * 2; g.fillStyle = '#24304a'; g.beginPath(); g.arc(cx, y, r, Math.PI, 0); g.fill(); if (k > 0) { g.fillStyle = `rgba(170,255,200,${0.75 * clamp(k * 2 - Math.abs(j) * 0.3, 0, 1)})`; g.beginPath(); g.arc(cx, y, r - 2, Math.PI, 0); g.fill(); glowDot(cx, y - 5, 24, '150,240,200', 0.4 * k); } } }
    else { for (let j = 0; j < 6; j++) { const hx = x - 42 + j * 15 + (i === 3 ? -14 : 0), hh = 10 + ((j * 7 + i * 3) % 4) * 4; g.fillStyle = '#0f1024'; g.fillRect(hx, y - hh, 12, hh); g.beginPath(); g.moveTo(hx - 2, y - hh); g.lineTo(hx + 6, y - hh - 7); g.lineTo(hx + 14, y - hh); g.fill(); const lk = clamp(k * 2.2 - j * 0.22, 0, 1); if (lk > 0) { g.fillStyle = `rgba(255,214,130,${lk})`; g.fillRect(hx + 3, y - hh + 3, 5, 5); glowDot(hx + 6, y - hh + 5, 13, '255,196,120', 0.55 * lk); } } }
    if (i === 3) { const lx = x + 38, ly = y - 46; g.fillStyle = '#0f1024'; g.beginPath(); g.moveTo(lx - 8, y); g.lineTo(lx - 4, ly + 4); g.lineTo(lx + 4, ly + 4); g.lineTo(lx + 8, y); g.fill(); g.fillRect(lx - 6, ly - 5, 12, 9); if (k > 0) { g.save(); g.globalCompositeOperation = 'screen'; const a = clock * 0.9; for (const sd of [0, Math.PI]) { const d = Math.cos(a + sd), len = (d >= 0 ? 1 : -1) * (30 + 190 * Math.abs(d)), gr = g.createLinearGradient(lx, ly, lx + len, ly); gr.addColorStop(0, `rgba(255,230,170,${0.55 * k})`); gr.addColorStop(1, 'rgba(255,220,150,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(lx, ly - 2); g.lineTo(lx + len, ly - 16); g.lineTo(lx + len, ly + 16); g.lineTo(lx, ly + 3); g.fill(); } g.restore(); glowDot(lx, ly, 30, '255,224,160', 0.9 * k); } }
    if (k > 0) txt(name, x, y + 12, { size: 11, align: 'center', color: `rgba(255,240,214,${k})`, stroke: `rgba(14,12,30,${k})`, sw: 4 });
  });
  // 道に ならぶ ほたるうさぎ
  const rk = on(4, 3.2);
  if (rk > 0) for (let s = 0; s < road.length - 1; s++) for (let j = 0; j < 3; j++) {
    const f = (j + 0.5) / 3, ax = lerp(road[s][0], road[s + 1][0], f), ay = lerp(road[s][1], road[s + 1][1], f) + (j % 2 ? 7 : -5), k = clamp(rk * 26 - (s * 3 + j), 0, 1); if (k <= 0) continue;
    g.globalAlpha = k; g.drawImage(Art.sprites.hotaruusagi, ax - 9, ay - 17, 18, 18); g.globalAlpha = 1; glowDot(ax, ay - 15, 11 + Math.sin(clock * 3 + s + j) * 2, '255,206,130', 0.85 * k);
  }
  // 手前: ダムの上の 4人
  g.fillStyle = '#100f22'; g.fillRect(x0, 276, VW, H - 276); g.fillStyle = '#2c2a46'; g.fillRect(x0, 270, VW, 8); for (let x = x0; x < x1; x += 28) { g.fillStyle = '#242238'; g.fillRect(x, 258, 3, 14); } g.fillRect(x0, 257, VW, 3);
  const hero = Art.portrait('hero_back'), hh = 84, hw = hero.width * hh / hero.height;
  g.save(); g.filter = 'brightness(.6)'; g.drawImage(hero, 318 - hw / 2, 286 - hh, hw, hh);
  const heir = S.party.find((m) => m.sp === 'himoriusagi') || S.party[0]; if (heir) g.drawImage(Art.look(heir), 348, 238, 48, 48);
  const cat = S.party.find((m) => m.sp === 'yuuhineko') || S.party.find((m) => m.sp === 'mikanya'); if (cat) g.drawImage(Art.look(cat), 248, 248, 38, 38);
  Art.person(g, 'rival', 'rival', 'u', 0, 214, 282, 1.15); Art.person(g, 'keeper', 'keeper', 'u', 0, 180, 282, 1.25);
  g.restore();
  if (heir && heir.sp === 'himoriusagi') glowDot(372, 244, 32, '255,214,140', 0.6 + 0.15 * Math.sin(clock * 3));
  for (let i = 0; i < 30; i++) { const k = on(4, 2); if (k <= 0) break; const px = x0 + rnd01(i + 7) * VW + Math.sin(clock * 0.8 + i) * 12, py = 230 - ((clock * (9 + (i % 5) * 4) + rnd01(i + 51) * 200) % 200); glowDot(px, py, 4 + (i % 3) * 2, '255,226,160', 0.7 * k * clamp(py / 120, 0, 1)); }
}

// おためし(?yama=1: 第四章を 最初から / ?yama=end: 勝負の あとの 結末)。セーブは 書きかえない
async function yamaPreview(which) {
  preview = true; S = newState(); S.party = [mkMon('mikanya', 30), mkMon('hotaruusagi', 30), mkMon('shizukufin', 30), mkMon('pukurisu', 30)]; S.bag = { ball: 5, potion: 8, cure: 3 };
  S.flags = { tip_catch: true, tip_trainer: true, tip_low: true, beat_rival: true, lit_town: true, lit_town2: true, lit_town3: true, mem_town: true, mem_town2: true, mem_town3: true };
  if (which === 'end') Object.assign(S.flags, { met_keeper: true, beat_minato2: true });
  await fade(1, 0.3); mode = 'field'; enterMap('town4', 30, 11, 'u', true); if (which !== 'end') await chapterOnArrive('town4'); ui.banner = null; await fade(0, 0.5);
  await event(plantDoor);
  await event(() => say('(おためし おわり。タイトルに もどります)')); location.href = location.pathname;
}
