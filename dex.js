'use strict';
// ずかん: ようす(絵・鳴き声・ひとこと)と くわしく(住んでいる所・時間・進化・わざ・観察メモ)
// [大きさ, 重さ, 観察メモ(つかまえると 読める), なかよくなると 読める メモ]
const DEX_MORE = {
  mikanya: ['0.4m', '3.8kg', '日が かげると、しっぽの 葉を おなかに しまって まるくなる。', 'ねむる まえに、かならず いちど こちらを 見る。見ているか たしかめているらしい。'],
  pukurisu: ['0.3m', '2.1kg', 'どんぐりを うめた 場所の、半分は わすれる。そこから 木が 生える。', 'いちばん 大きな どんぐりを、だまって 足もとに おいていくことが ある。'],
  hinatagaeru: ['0.3m', '2.6kg', 'たんぽぽが とじると、半日ほどで 雨に なる。', '雨の 日は、頭を こちらに かたむけて、かさの かわりを しようとする。'],
  hotaruusagi: ['0.5m', '3.0kg', '耳の あかりは 熱くない。手を かざすと、ほんのり あたたかい。', '夜道では、かならず 半歩 まえを 歩く。足もとを てらすためらしい。'],
  kinokokko: ['0.4m', '4.4kg', '雨の あとは、帽子が ひとまわり 大きくなる。', '起きているときは、じっと こちらの 話を きいている。返事は ない。'],
  shizukufin: ['0.5m', '1.2kg', '水の ない 所では、霧を まとって うかんでいる。', 'こちらが しずんでいると、ひれで そっと 空気を ゆらしてくる。'],
  birisuzume: ['0.2m', '0.4kg', '停電の 日は、電線に 一羽も とまらない。', '肩に とまるときは、ちゃんと 静電気を ぬいてから くる。'],
  hanedoron: ['0.6m', '5.2kg', '夜は 街灯の 上で 羽を やすめ、あかりから 力を もらう。', '迷いそうな 道では、先まで 飛んで 見てきてくれる。'],
  hikaritanishi: ['0.2m', '1.8kg', '殻の 光は、田んぼの 水が きれいなほど つよい。', 'ねむるときだけ、光が ゆっくり 呼吸の ように ゆれる。'],
  sabikani: ['0.6m', '18.0kg', '甲羅の さびは、まもりの 厚みに なっている。みがくと いやがる。', 'はさみで そっと 服の すそを つまむ。はぐれないように、らしい。'],
  kirikamome: ['0.7m', '1.6kg', '霧の 日にだけ、決まった 灯台の まわりを 回る。', '先に 帰り道を 見つけて、高い 声で 二度 鳴く。'],
  funenko: ['1.1m', '24.0kg', '中に 古い 網が 入っている。大事なものらしく、出そうと しない。', '雨の 日は、屋根の かわりに なろうと 寄ってくる。'],
  yuuhineko: ['0.9m', '12.5kg', '夕方に なると、毛の 色が 空と 見分けが つかなくなる。', '大きくなっても、ねむる まえに こちらを 見る くせは かわらない。'],
  fukufukurisu: ['0.8m', '14.0kg', 'ほっぺの 木の実は、冬を こすための ぶん。仲間にも わける。', 'いちばん いい 実は、いまでも こちらの ために とっておく。'],
  himoriusagi: ['1.0m', '9.0kg', '町ひとつ ぶんの 夜道を、てらせるほど あかるい。', '役目の 話を すると、耳の あかりが すこし ゆれる。'],
  hinatagama: ['0.9m', '32.0kg', '頭の 花には、晴れの 日だけ 小さな 虫が 集まる。', '動かないようで、こちらが 疲れると 先に すわりこんでくれる。'],
};
const DEX_RANK = [[0, 'はじめての ずかん'], [4, '草むら あるき'], [8, '町の ものしり'], [12, '旅の 学者'], [16, '灯りの 図鑑守り']];
// どこで 会えるか(行った ことの ある 場所だけ 名前が 出る)
function habitats(sp) {
  const out = [], name = (m) => (S.flags['been_' + m.id] || m.id === world.map.id ? m.name : '？？？');
  for (const k in MAPS) { const m = MAPS[k]; if ((m.grass || []).some(([x]) => x === sp)) out.push(name(m)); else if ((m.grassLit || []).some(([, l]) => l.some(([x]) => x === sp))) out.push(name(m) === '？？？' ? '？？？' : m.name + '(あかりの後)'); }
  const fish = Object.keys(FISH).filter((k) => FISH[k].list.some(([x]) => x === sp)).map((k) => name(MAPS[k]));
  if (fish.length) out.push('つり: ' + [...new Set(fish)].join('・'));
  if (sp === 'mikanya') out.unshift('おじいさんから');
  const from = SPECIES[sp].from; if (from) out.unshift(`${S.seen[from] ? SPECIES[from].n : '？？？'}が Lv${SPECIES[from].evo.lv}で 進化`);
  const q = [...new Set(out)];
  const hidden = q.filter((x) => x === '？？？').length;
  return q.filter((x) => x !== '？？？').concat(hidden ? [`まだ 知らない 場所(${hidden})`] : []);
}
const skyLove = (sp) => { const t = SPECIES[sp].t; return sp === 'hotaruusagi' || sp === 'himoriusagi' ? '夜に よく あらわれる' : t === 'water' ? '雨の 日に 元気になる' : null; };
let dexPage = 0, dexCryAt = -9;
async function dexScreen() {
  const got = SPECIES_ORDER.filter((s) => S.caught[s]).length, rank = DEX_RANK.filter(([n]) => got >= n).pop()[1];
  dexPage = 0; dexCryAt = -9;
  const cry = (i) => { const sp = SPECIES_ORDER[i]; if (!S.seen[sp]) return; Aud.cry(sp); dexCryAt = clock; };
  return listScreen({
    title: `ずかん ${got}/${SPECIES_ORDER.length}　${rank}`, n: SPECIES_ORDER.length, rowH: 46,
    onA: (i) => { cry(i); return undefined; },
    extra: { label: () => (dexPage ? 'ようすを みる' : 'くわしく'), act: () => { dexPage = 1 - dexPage; Aud.sfx('select'); } },
    rowFn: (i, x, y, w) => {
      const sp = SPECIES_ORDER[i], seen = S.seen[sp], have = S.caught[sp];
      txt('No.' + String(i + 1).padStart(2, '0'), x + 10, y + 20, { size: 12, color: MUTED });
      if (seen) { g.drawImage(Art.sprites[sp], x + 50, y - 2, 44, 44); txt(SPECIES[sp].n, x + 102, y + 20, { size: 15 }); if (have) Art.ball(g, x + w - 20, y + 21, 8, 0); }
      else { g.save(); g.filter = 'brightness(0)'; g.globalAlpha = 0.25; g.drawImage(Art.sprites[sp], x + 50, y - 2, 44, 44); g.restore(); txt('？？？？', x + 102, y + 20, { size: 15, color: MUTED }); }
    },
    detailFn: (i, x, y, w) => {
      const sp = SPECIES_ORDER[i], seen = S.seen[sp], have = S.caught[sp], d = SPECIES[sp], more = DEX_MORE[sp];
      if (!seen) {
        g.save(); g.filter = 'brightness(0)'; g.globalAlpha = 0.18; g.drawImage(Art.sprites[sp], x + w / 2 - 70, y + 20, 140, 140); g.restore();
        txt('まだ であっていない…', x + w / 2, y + 190, { size: 17, color: MUTED, align: 'center' });
        if (dexPage) { txt('すんでいる ところ', x + 14, y + 220, { size: 12, color: ACCENT }); wrap(habitats(sp).join('、'), w - 28, 13).slice(0, 4).forEach((l, k) => txt(l, x + 14, y + 242 + k * 19, { size: 13 })); }
        return;
      }
      const bond = Math.max(0, ...[...S.party, ...S.box].filter((m) => m.sp === sp).map(bondLv));
      if (!dexPage) { // ようす
        const k = clock - dexCryAt, hop = k < 0.5 ? Math.abs(Math.sin(k / 0.5 * Math.PI * 2)) * 14 : 0, br = 1 + Math.sin(clock * 2.2) * 0.012;
        g.fillStyle = 'rgba(150,118,92,.2)'; g.beginPath(); g.ellipse(x + w / 2, y + 166, 66 - hop, 10, 0, 0, 7); g.fill();
        g.drawImage(Art.sprites[sp], x + w / 2 - 82, y + 170 - 164 * br * 0.96 - hop, 164, 164 * br);
        ui.hits.push({ x: x + 50, y, w: w - 100, h: 172, act: () => cry(i) });
        txt('♪ タップで なきごえ', x + w - 4, y + 10, { size: 11, color: MUTED, align: 'right' });
        txt(d.n, x + w / 2, y + 190, { size: 22, w: 900, align: 'center' }); typeChip(x + w / 2 - 22, y + 207, d.t);
        if (have) {
          txt(`大きさ ${more[0]}　　重さ ${more[1]}`, x + w / 2, y + 240, { size: 12, color: MUTED, align: 'center' });
          g.fillStyle = ACCENT; g.fillRect(x + w / 2 - 40, y + 252, 80, 1.5);
          wrap(d.dex, w - 28, 13).slice(0, 3).forEach((l, n) => txt(l, x + 14, y + 272 + n * 19, { size: 13 }));
        } else txt('つかまえると くわしく わかるよ', x + w / 2, y + 262, { size: 14, color: MUTED, align: 'center' });
        return;
      }
      // くわしく
      g.drawImage(Art.sprites[sp], x + 6, y + 2, 56, 56); txt(d.n, x + 70, y + 22, { size: 18, w: 900 }); typeChip(x + 70, y + 36, d.t);
      let yy = y + 72;
      const sec = (title, text, max = 2, color) => { if (!text) return; txt(title, x + 12, yy, { size: 11, color: ACCENT, w: 900 }); yy += 16; wrap(text, w - 28, 12).slice(0, max).forEach((l) => { txt(l, x + 14, yy, { size: 12, color: color || INK }); yy += 16; }); yy += 5; };
      sec('すんでいる ところ', habitats(sp).join('、') || '？', 3);
      if (have) {
        const evo = d.evo ? `Lv${d.evo.lv}で ${S.seen[d.evo.to] ? SPECIES[d.evo.to].n : '？？？'}に 進化する` : d.from ? `${SPECIES[d.from].n}の 進化した 姿` : '';
        sec('進化と 空もよう', [evo, skyLove(sp)].filter(Boolean).join('。') || 'いまの 姿の まま 育つ', 2);
        sec(`とくせい「${ABIL[d.ab] ? ABIL[d.ab].n : '―'}」`, ABIL[d.ab] ? ABIL[d.ab].d : '', 1);
        sec('観察メモ', more[2], 2);
        sec('なかよしメモ', bond >= 2 ? more[3] : 'なかよし度が 2いじょうに なると 書ける。', 2, bond >= 2 ? INK : MUTED);
      } else sec('つかまえると', 'とくせいや 観察メモが 読めるように なる。', 2, MUTED);
    },
  });
}
