'use strict';
// 物語「灯守りの約束」(1〜3章): 町の あかりが ともった あとの 手がかり・色あせた 回想・ミナト
// 真相(4章で 明かす): 大停電の嵐の夜、番人(ミナトの祖父)は ダムを守るため 送電を止め、相棒の ひもりうさぎは 耳の灯りで 人を逃がして 眠った
const TOWNS = ['town', 'town2', 'town3'];
const MEMORIES = {
  town: { title: 'きおく 一 「小さな 灯りの 列」', img: 'mem1', lines: ['まっくらな 嵐の 道に、小さな 灯りが ならんでいた。', 'ひとびとは、その 灯りを たどって にげた。', 'あれが なんだったのか、だれも しらない。'] },
  town2: { title: 'きおく 二 「おろされた レバー」', img: 'mem2', lines: ['『大停電の夜。発電所に、故障は なし』', '『午後 11時。手動にて、送電を 停止』', '――だれかが、じぶんの 手で、町の あかりを けしたのだ。'] },
  town3: { title: 'きおく 三 「ダムの上の ふたり」', img: 'mem3', lines: ['水は、もう ダムを こえようと していた。\n番人は、水門を ひらくために、送電を とめた。', 'くらくなった 町へは、番人の 相棒が おりて いったそうだ。', 'それから 番人は、山で なにかを まもりつづけている。'] },
};
const memImg = {};
function loadMemory(id) {
  const key = MEMORIES[id].img;
  if (memImg[key]) return Promise.resolve(memImg[key]);
  return new Promise((r) => { const im = new Image(); im.onload = () => { memImg[key] = im; r(im); }; im.onerror = () => r(null); im.src = (window.ART_SRC && window.ART_SRC[key]) || `assets/${key}.webp`; });
}
// 古い フィルムの ように: ゆっくり寄る・ちらつき・きず
function drawMemory(im, t, title) {
  const calm = calmMotion.matches, z = calm ? 1 : 1.02 + Math.min(0.1, t * 0.006), w = 864 * z, h = H * z;
  g.fillStyle = '#14110f'; g.fillRect(-OX, 0, VW, H);
  g.save(); g.globalAlpha = calm ? 1 : 0.94 + 0.06 * Math.sin(clock * 23) * Math.sin(clock * 7.3); g.drawImage(im, W / 2 - w / 2, (H - h) * 0.35, w, h); g.restore();
  if (!calm) {
    const f = Math.floor(clock * 12);
    for (let i = 0; i < 3; i++) { const r = rnd01(f * 7 + i * 13); if (r > 0.55) { g.fillStyle = `rgba(255,240,215,${0.12 + r * 0.16})`; g.fillRect(-OX + rnd01(f + i * 31) * VW, 0, 1, H); } }
    for (let i = 0; i < 14; i++) { g.fillStyle = `rgba(255,244,220,${rnd01(f + i) * 0.5})`; g.fillRect(-OX + rnd01(f * 3 + i * 11) * VW, rnd01(f * 5 + i * 17) * H, 1.5, 1.5); }
  }
  g.fillStyle = '#0c0a09'; g.fillRect(-OX, 0, VW, 14); g.fillRect(-OX, H - 6, VW, 6);
  g.save(); g.globalAlpha = clamp((t - 0.5) / 0.8, 0, 1); g.font = `800 19px "Shippori Mincho B1", serif`; g.textAlign = 'left'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.strokeStyle = 'rgba(12,10,9,.85)'; g.lineWidth = 6; g.strokeText(title, 18 - OX, 36); g.fillStyle = '#f2e3c6'; g.fillText(title, 18 - OX, 36); g.restore();
}
async function memoryScene(id) {
  const M = MEMORIES[id], im = await loadMemory(id); if (!im) return false;
  clearSpeaker(); ui.dialog = null; Aud.bgm(null); Aud.sfx('opStart');
  await fade(1, 0.7, '#efe2c8'); const t0 = clock; ui.overlay = () => drawMemory(im, clock - t0, M.title); Aud.bgm('memory'); await fade(0, 1.0);
  await sleep(1.2); for (const line of M.lines) await say(line);
  await fade(1, 0.7, '#efe2c8'); ui.overlay = null; Aud.bgm(world.map.bgm); await fade(0, 0.8);
  S.flags['mem_' + id] = true; return true;
}
const talk = async (id, ...lines) => { setSpeaker(id); for (const l of lines) await say(l); clearSpeaker(); };
// ミナトが 横から 歩いてくる(ついてくる子と 反対がわから)
async function minatoEnter() {
  const p = world.p, m = world.map, first = world.fol.x <= p.x ? 1 : -1;
  for (const side of [first, -first]) {
    let reach = 0; while (reach < 6 && walkable(m, p.x + side * (reach + 1), p.y) && !npcAt(p.x + side * (reach + 1), p.y)) reach++;
    if (reach < 2) continue;
    const n = { id: 'rival', x: p.x + side * reach, y: p.y, dir: side > 0 ? 'l' : 'r', pal: 'rival', ox: 0, oy: 0, step: 0, tt: 99, idle: false, guest: true };
    world.npcs = world.npcs.filter((x) => x.id !== 'rival'); world.npcs.push(n); world.bang = { x: n.x, y: n.y, t0: clock }; Aud.sfx('encounter'); await sleep(0.6);
    await walkActor(n, n.dir, reach - 1); p.dir = side > 0 ? 'r' : 'l'; return n;
  }
  return null;
}
async function minatoLeave(n) {
  if (!n) return; const back = n.dir === 'l' ? 'r' : 'l'; let steps = 0; while (steps < 5 && walkable(world.map, n.x + DV[back][0] * (steps + 1), n.y)) steps++;
  await walkActor(n, back, steps); world.npcs = world.npcs.filter((x) => x !== n);
}
// あかりの場面の あとに 続く 物語
async function storyAfterLight(id) {
  if (S.flags['mem_' + id]) return;
  if (id === 'town') {
    await talk('oldman', 'この あかりを 見ていると、思い出すよ。\nあの 大停電の、嵐の夜を。');
    await memoryScene(id);
    await talk('oldman', 'あんたの つれてる 子たちを 見ていると、\nなぜだか、あの 小さな 灯りを 思い出すんだ。');
    await talk('techie', 'うちの じいちゃんが 言ってた。\nむかし 山には「灯守り」が いたんだってさ。');
  } else if (id === 'town2') {
    await say('そのとき、ねむっていた ロボットが、ふるい きろくを うつしだした。');
    await memoryScene(id);
    await talk('farmer', '手で とめた…?\nそれじゃ、あの 停電は、発電所の 番人が…?');
    await talk('nboy', '番人って、山に こもってる おじいさん?\nみんな、わるい 人だって 言ってるよ。');
    const m = await minatoEnter(); await talk('rival', '……ちがう。', 'そんなはず、ないよ。\nきっと、なにか わけが あったんだ。'); await minatoLeave(m);
  } else if (id === 'town3') {
    await talk('goro', '…思い出すな。\n発電所の 番人は、わしの 友だちだ。', 'あの 嵐の夜、ダムは もう こわれそうだった。');
    await memoryScene(id);
    await talk('goro', 'この 港が 沈まなかったのは、あいつらの おかげだ。', 'だが あいつは、言いわけを ひとつも しなかった。');
    const m = await minatoEnter();
    await talk('rival', 'ゴロウさん。その話…ほんとう?');
    await talk('goro', 'ミナトか。…大きく なったな。');
    await talk('rival', '番人は、ぼくの じいちゃんなんだ。', '町を くらくした 悪い人だって、ずっと 言われてきた。\nだから ひとりで 強くなって、見かえしたかった。', 'ぼくは 山へ 行く。\n……きみにも、来てほしい。', 'そこで こんどは、本気で しょうぶだ。');
    await minatoLeave(m);
    S.flags.minato_mountain = true; bondEvents.push('ミナトは 山の町「ヤマノハ」へ むかった');
  }
  S.flags['mem_' + id] = true; save();
}
// 先に あかりを ともしていた セーブ向け: 町に 着いたとき、まだ 見ていない 物語を 順に 流す
async function storyCatchUp(id) {
  const at = TOWNS.indexOf(id); if (at < 0 || !S.flags['lit_' + id] || S.flags['mem_' + id]) return;
  await event(async () => {
    await sleep(0.5); await say('町の あかりを 見ていると、\nわすれていた 話が よみがえってくる…。');
    for (const prev of TOWNS.slice(0, at)) if (S.flags['lit_' + prev] && !S.flags['mem_' + prev]) await memoryScene(prev);
    await storyAfterLight(id);
  });
}
// おためし(?kioku=all か 1〜3): 回想と その前後だけ 見る。セーブは 書きかえない
async function storyPreview(which) {
  preview = true; await fade(1, 0.3);
  await event(async () => {
    for (const id of which === 'all' ? TOWNS : [TOWNS[+which - 1]]) {
      S = newState(); S.party = [mkMon('mikanya', 12), mkMon('hotaruusagi', 12)]; TOWNS.forEach((t) => { S.flags['lit_' + t] = true; });
      mode = 'field'; enterMap(id, 24, 13, 'u', true); await fade(0, 0.5); flushBtn(); await storyAfterLight(id); await fade(1, 0.5, '#000');
    }
  });
  location.href = location.pathname;
}
