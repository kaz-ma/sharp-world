'use strict';
// 旅の 日記と アルバム。出来事は セーブの 中の しるし(flags など)から 見つけて 書きこむので、
// 前から 遊んでいる セーブでも、これまでの ことが「いつかの 日」として 残る。
const asset = (id) => (window.ART_SRC && window.ART_SRC[id]) || `assets/${id}.webp`;
const F_ = (k) => () => !!S.flags[k];
// [鍵, 条件, 題, 本文, 絵]  絵: { img } 一枚絵 / { sp } モンスター / { face } 人物
const DIARY = [
  ['start', () => S.party.length > 0, 'ひとりで、旅に', 'ひなた村を 出る 朝。\nおじいさんから、ミカニャを あずかった。\nしっぽの 葉っぱが、ずっと ゆれている。', { sp: 'mikanya' }],
  ['rod', F_('rod'), 'つりざお', 'おばあさんに、古い つりざおを もらった。\n水べで、ためしてみよう。', null],
  ['w_route', F_('been_route'), 'ひなた草原', '草むらが、思ったより ふかい。\nときどき、だれかの 目が こちらを 見ている。', null],
  ['beat_camper', F_('beat_camper'), 'キャンプの ユウジ', '眠そうな 子たちと しょうぶした。\n「状態異常に 気をつけろ」だって。', { face: 'camper' }],
  ['w_forest', F_('been_forest'), 'こもれびの森', '草原の 北に、森が あった。\n葉の すきまから、光が こぼれてくる。', null],
  ['side_forest', F_('look_lantern'), '森の 灯ろう', 'こけの はえた 灯ろうに、火が もどった。\nゲンさんが、しばらく なにも 言わなかった。', { img: 'side_forest' }],
  ['beat_rival', F_('beat_rival'), 'ミナト', 'ゲートの 前で、ミナトという 子と 勝負した。\n負けても、なんだか 楽しそうだった。', { face: 'rival' }],
  ['ch_town', F_('ch_town'), 'ひだまり町', 'はじめての 町。\n街灯は 立っているのに、ひとつも ともっていない。', { img: 'ch1_bg' }],
  ['lit_town', F_('lit_town'), 'ひとつめの あかり', 'レンに 勝って、町の 街灯を ともした。\nだれかが、窓を あける 音が した。', null],
  ['mem_town', F_('mem_town'), '小さな 灯りの 列', '町の 老人の 話。\n大停電の 夜、道に 小さな 灯りが ならんだという。', { img: 'mem1' }],
  ['w_route2', F_('been_route2'), 'でんせん街道', '電線の 下は、いつも かすかに 鳴っている。', null],
  ['w_lake', F_('been_lake'), 'かがみ池', '空が そのまま、水に うつる 池。\n絵を かいている 人が いた。', null],
  ['side_lake', F_('side_lake'), '水面の 月', '夜の 池で、仲間に 水面を てらして もらった。\nサキさんの 絵が、できあがった。', { img: 'side_lake' }],
  ['ch_town2', F_('ch_town2'), 'ミドリ団地', 'ビニールハウスと、ねむった ロボット。\n未来と 田舎が、まざった ような 町。', { img: 'ch2_bg' }],
  ['lit_town2', F_('lit_town2'), 'ふたつめの あかり', 'ナナと 勝負して、団地に 灯りが もどった。\nロボットが、手を ふっていた。', null],
  ['mem_town2', F_('mem_town2'), 'おろされた レバー', '停電は、事故じゃ なかった。\nだれかが、手で 止めたのだ。\nミナトは「ちがう」と 言った。', { img: 'mem2' }],
  ['w_route3', F_('been_route3'), 'しおかぜ街道', '風に、しおの においが まじってきた。', null],
  ['w_station', F_('been_station'), 'ひとつ星駅', 'つかわれて いない 駅。\n駅員さんは、まだ ホームに 立っていた。', null],
  ['side_station', F_('look_train'), '来なかった 終電', '切符を かざすと、列車に 灯りが もどった。\nあの 夜、灯りを たどって、みんな 帰れたんだ。', { img: 'side_station' }],
  ['ch_town3', F_('ch_town3'), 'ナギサ港', '霧の 港町。\n灯台は、長いあいだ 暗いままだそうだ。', { img: 'ch3_bg' }],
  ['lit_town3', F_('lit_town3'), 'みっつめの あかり', '灯台が まわりはじめた。\n沖の 船が、あかりで こたえた。', null],
  ['mem_town3', F_('mem_town3'), 'ダムの上の ふたり', '番人は、町を 守るために 送電を 止めた。\n番人は、ミナトの おじいさんだった。', { img: 'mem3' }],
  ['w_route4', F_('been_route4'), 'やまなみ道', '道は、ダムの ある 山へ のぼっていく。', null],
  ['w_ridge', F_('been_ridge'), '星見の尾根', '岩の あいだの 道を のぼった。\n空が、きゅうに ひろくなった。', null],
  ['side_ridge', F_('side_ridge'), '尾根から 見た あかり', 'てっぺんから、町の あかりを かぞえた。\nひとつ ともすたび、夜が すこし 近くなる。', { img: 'side_ridge' }],
  ['ch_town4', F_('ch_town4'), 'ヤマノハ', '山の 町に ついた。\n発電所の まどは、まっくらだ。', { img: 'ch4_bg' }],
  ['met_keeper', F_('met_keeper'), '番人と、ねむる 子', '番人は、白い 子の そばに 座っていた。\n耳の あかりは、消えたままだった。', { img: 'scene_sleep' }],
  ['cleared', F_('cleared'), '灯守りの 約束', '4つの 町に、いっせいに あかりが ともった。\nこの 旅を、わすれないと 思う。', { img: 'scene_wake' }],
  ['night', () => !!S.flags.seen_night, 'はじめての 夜道', '暗くなると、ほたるが 出てくる。\n火の 子が そばに いると、足もとが 明るい。', null],
  ['rain', () => !!S.flags.seen_rain, '雨の 日', '雨の 日は、水の 子が 元気だ。\nつりの うきも、よく しずむ。', null],
  ['steps', () => S.steps >= 3000, '3000歩', 'ずいぶん 歩いた。\n靴の かかとが、すこし へった。', null],
  ['dexall', () => SPECIES_ORDER.every((s) => S.caught[s]), 'ずかん かんせい', 'ぜんぶの 子と 出会えた。\nどの 子の 顔も、思い出せる。', null],
];
// 旅の とちゅうで ふえる ぶん(出会い・なかよし・お願いごと)
function diaryDynamic() {
  const out = [];
  for (const sp of SPECIES_ORDER) if (S.caught[sp] && sp !== 'mikanya') { const d = SPECIES[sp]; out.push(['met_' + sp, null, d.from ? `${d.n}に 進化` : `${d.n}と 出会った`, d.from ? `${SPECIES[d.from].n}が、${d.n}に なった。\nすこし 大きくなった 背中を、しばらく ながめた。` : `${d.n}が、仲間に くわわった。\n${d.dex.split('。')[0]}。`, { sp }]); }
  for (const m of [...S.party, ...S.box]) {
    if (bondLv(m) >= 4) out.push(['bond_' + m.sp, null, 'こころが かよった', `${nameOf(m)}と、ことばが なくても 通じる 気がする。`, { sp: m.sp, shiny: m.shiny }]);
    if (m.shiny) out.push(['shiny_' + m.sp, null, 'ひかりの 個体', `色の ちがう ${nameOf(m)}に 出会えた。\nめったに ないことらしい。`, { sp: m.sp, shiny: true }]);
  }
  for (const [k, q] of Object.entries(QUESTS)) if ((S.quests || {})[k] === 2) out.push(['quest_' + k, null, 'お願いごと', `「${q.title}」の お願いを かなえた。\nありがとう、と 言われた。`, { face: q.npc }]);
  return out;
}
const diaryAll = () => [...DIARY, ...diaryDynamic()];
// 新しい 出来事を 書きこむ。old=true は「前から 遊んでいた ぶん」
function syncDiary() {
  if (!S.party.length) return 0;
  const first = !S.diary, old = first && S.steps > 40; S.diary = S.diary || [];
  if (old) for (const [f, m] of [['beat_rival', 'route'], ['ch_town2', 'route2'], ['ch_town3', 'route3'], ['ch_town4', 'route4']]) if (S.flags[f]) S.flags['been_' + m] = true; // 前の セーブは 通った道を おぎなう
  const have = new Set(S.diary.map((e) => e.k)); let n = 0;
  for (const r of diaryAll()) { if (have.has(r[0]) || (r[1] && !r[1]())) continue; S.diary.push(old ? { k: r[0] } : { k: r[0], d: dayNumber(), p: phaseName(), at: world.map.name }); have.add(r[0]); n++; }
  return n;
}
let diaryAt = 0;
function diaryTick() {
  if (preview || busy || clock - diaryAt < 1.5) return;
  diaryAt = clock;
  if (isNight()) S.flags.seen_night = true; if (isRaining()) S.flags.seen_rain = true;
  const n = syncDiary();
  if (n && !S.flags.tip_diary && S.diary.length >= 3) { S.flags.tip_diary = true; bondEvents.push('旅の 出来事は、メニューの「にっき」で 読めるよ'); }
}

// ---------- 絵の 読みこみ ----------
const diaryImg = {};
function pic(id) {
  if (diaryImg[id] === undefined) { diaryImg[id] = null; const im = new Image(); im.onload = () => { diaryImg[id] = im; }; im.src = asset(id); }
  return diaryImg[id];
}
// 枠いっぱいに 切りぬいて 描く
function drawCover(im, x, y, w, h) { const k = Math.max(w / im.width, h / im.height), sw = w / k, sh = h / k; g.drawImage(im, (im.width - sw) / 2, (im.height - sh) * 0.4, sw, sh, x, y, w, h); }
function drawEntryPic(p, x, y, s) {
  if (!p) { g.strokeStyle = 'rgba(150,118,92,.35)'; g.lineWidth = 1; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(x + 8, y + 18 + i * 10); g.lineTo(x + s - 8, y + 18 + i * 10); g.stroke(); } lampMark(x + s / 2, y + s - 9, 3.2); return; }
  g.save(); g.fillStyle = '#e4d8c4'; g.fillRect(x, y, s, s); g.beginPath(); g.rect(x, y, s, s); g.clip();
  if (p.img) { const im = pic(p.img); if (im) drawCover(im, x, y, s, s); }
  else if (p.sp) g.drawImage(Art.look(p), x - 2, y - 2, s + 4, s + 4);
  else if (p.face) { const im = Art.portrait(p.face), k = s * 1.25 / im.height; g.drawImage(im, x + (s - im.width * k) / 2, y + 1, im.width * k, im.height * k); }
  g.restore(); g.strokeStyle = '#3d3550'; g.lineWidth = 1.5; g.strokeRect(x, y, s, s);
  g.fillStyle = 'rgba(194,90,98,.55)'; g.save(); g.translate(x + 2, y + 2); g.rotate(-0.7); g.fillRect(-9, -3, 18, 6); g.restore(); // テープ
}

// ---------- アルバム ----------
const ALBUM = [
  ['ch0_bg', 'ch_village', '序章 旅の はじまり'], ['ch1_bg', 'ch_town', '第一章 ひだまり町'], ['ch2_bg', 'ch_town2', '第二章 ミドリ団地'], ['ch3_bg', 'ch_town3', '第三章 ナギサ港'], ['ch4_bg', 'ch_town4', '第四章 ヤマノハ'],
  ['mem1', 'mem_town', 'きおく 一'], ['mem2', 'mem_town2', 'きおく 二'], ['mem3', 'mem_town3', 'きおく 三'],
  ['scene_sleep', 'met_keeper', 'ねむる 灯守り'], ['scene_wake', 'cleared', 'めざめ'],
  ['side_forest', 'look_lantern', '森の 灯ろう'], ['side_lake', 'side_lake', '水面の 月'], ['side_station', 'look_train', '来なかった 終電'], ['side_ridge', 'side_ridge', '尾根の あかり'], ['side_ridge4', 'side_ridge4', '4つの あかり'],
];
const albumHas = (a) => !!S.flags[a[1]] || (a[1] === 'ch_village' && S.party.length > 0);
async function albumView(a) {
  const mem = TOWNS.find((t) => 'mem_' + t === a[1]);
  if (mem) { await memoryScene(mem); return; }
  const t0 = clock, prev = ui.overlay; pic(a[0]);
  ui.overlay = () => {
    g.fillStyle = '#0d0b1c'; g.fillRect(-OX, 0, VW, H);
    const im = pic(a[0]); if (im) { g.save(); g.globalAlpha = clamp((clock - t0) / 0.5, 0, 1); const z = calmMotion.matches ? 1 : 1 + Math.min(0.07, (clock - t0) * 0.006), w = 864 * z, h = H * z; g.drawImage(im, W / 2 - w / 2, (H - h) * 0.4, w, h); g.restore(); }
    drawRibbon(W / 2, 318, 260, a[2]); ui.hits.push({ x: -OX, y: 0, w: VW, h: H, act: () => pushBtn('a') });
  };
  flushBtn(); await sleep(0.4); for (;;) { const b = await nextBtn(); if (b === 'a' || b === 'b') break; }
  ui.overlay = prev;
}

// ---------- 日記の 画面 ----------
async function diaryScreen() {
  syncDiary();
  const all = new Map(diaryAll().map((r) => [r[0], r]));
  const list = (S.diary || []).filter((e) => all.has(e.k));
  const PER = 4, pages = Math.max(1, Math.ceil(list.length / PER));
  let tab = 0, page = pages - 1, idx = 0, close = false;
  const setTab = (t) => { if (tab !== t) { tab = t; Aud.sfx('select'); } };
  const button = (x, y, w, label, on, act) => { panel(x, y, w, 26, { r: 6, fill: on ? '#c25a62' : '#2c2540', stroke: '#f0dcc0', plain: true }); txt(label, x + w / 2, y + 13.5, { size: 13, align: 'center', color: '#fff6e6' }); ui.hits.push({ x: x - 3, y: y - 4, w: w + 6, h: 34, act }); };
  const draw = () => {
    g.fillStyle = 'rgba(24,18,38,.82)'; g.fillRect(-OX, 0, VW, H);
    button(14, 6, 84, 'にっき', tab === 0, () => setTab(0)); button(104, 6, 96, 'アルバム', tab === 1, () => setTab(1));
    button(548, 6, 78, 'とじる', false, () => pushBtn('b'));
    if (tab === 0) {
      txt(`旅の ${dayNumber()}日め`, 320, 19, { size: 13, align: 'center', color: '#f0e2cc' });
      for (const px of [12, 322]) { panel(px, 38, 306, 290, { plain: true, r: 5 }); g.strokeStyle = 'rgba(150,118,92,.18)'; g.lineWidth = 1; for (let y = 74; y < 320; y += 19) { g.beginPath(); g.moveTo(px + 10, y); g.lineTo(px + 296, y); g.stroke(); } }
      g.fillStyle = 'rgba(90,66,52,.35)'; g.fillRect(318, 40, 4, 286);
      list.slice(page * PER, page * PER + PER).forEach((e, i) => {
        const r = all.get(e.k), x = i < 2 ? 22 : 332, y = 46 + (i % 2) * 142;
        txt(e.d ? `${e.d}日め・${e.p}　${e.at || ''}` : 'いつかの 日', x, y + 9, { size: 11, color: ACCENT });
        txt(r[2], x, y + 29, { size: 15, w: 900 });
        drawEntryPic(r[4], x + 224, y + 4, 58);
        wrap(r[3].split('\n').join(''), 282, 12).slice(0, 4).forEach((l, k) => txt(l, x, y + 70 + k * 18, { size: 12, color: '#4a4458' }));
      });
      if (!list.length) txt('まだ、なにも 書かれていない。', 165, 180, { size: 14, align: 'center', color: MUTED });
      if (page > 0) button(14, 332, 96, '◀ まえ', false, () => pushBtn('left'));
      if (page < pages - 1) button(530, 332, 96, 'つぎ ▶', false, () => pushBtn('right'));
      txt(`${page + 1} / ${pages}`, 320, 345, { size: 12, align: 'center', color: '#f0e2cc' });
    } else {
      const got = ALBUM.filter(albumHas).length;
      txt(`あつめた 絵 ${got} / ${ALBUM.length}`, 320, 19, { size: 13, align: 'center', color: '#f0e2cc' });
      ALBUM.forEach((a, i) => {
        const x = 14 + (i % 5) * 124, y = 44 + Math.floor(i / 5) * 100, has = albumHas(a);
        panel(x, y, 116, 90, { plain: true, r: 5, fill: has ? undefined : '#4a4262' });
        if (has) { const im = pic(a[0]); if (im) { g.save(); g.beginPath(); g.rect(x + 5, y + 5, 106, 62); g.clip(); drawCover(im, x + 5, y + 5, 106, 62); g.restore(); } txt(a[2], x + 58, y + 78, { size: 10, align: 'center' }); }
        else txt('？', x + 58, y + 46, { size: 24, align: 'center', color: '#a89cc0' });
        if (i === idx) { g.strokeStyle = '#ffc47a'; g.lineWidth = 3; rr(x - 2, y - 2, 120, 94, 7); g.stroke(); }
        ui.hits.push({ x, y, w: 116, h: 90, act: () => { idx = i; pushBtn('a'); } });
      });
    }
  };
  ui.overlay = draw; flushBtn();
  while (!close) {
    const b = await nextBtn();
    if (b === 'b' || b === 'menu') { Aud.sfx('back'); close = true; }
    else if (tab === 0) { if (b === 'left' && page > 0) { page--; Aud.sfx('select'); } else if ((b === 'right' || b === 'a') && page < pages - 1) { page++; Aud.sfx('select'); } else if (b === 'down' || b === 'up') setTab(1); }
    else {
      const n = ALBUM.length;
      if (b === 'a') { if (albumHas(ALBUM[idx])) { Aud.sfx('ok'); await albumView(ALBUM[idx]); ui.overlay = draw; flushBtn(); } else Aud.sfx('back'); }
      else if (b === 'left') idx = (idx + n - 1) % n; else if (b === 'right') idx = (idx + 1) % n; else if (b === 'down') idx = Math.min(n - 1, idx + 5); else if (b === 'up') { if (idx < 5) setTab(0); else idx -= 5; }
    }
  }
  ui.overlay = null;
}
