'use strict';
// 寄り道の 小さな 話: こもれびの森の 灯ろう / かがみ池の 絵かき / ひとつ星駅の 終電 / 星見の尾根
// 一枚絵は assets/side_<名前>.webp(なければ 絵なしで 話だけ 進む)
const SIDE_ART = {
  forest: '寄り道 「森の 灯ろう」', lake: '寄り道 「水面の 月」', station: '寄り道 「来なかった 終電」', ridge: '寄り道 「4つの あかり」',
};
const sideImg = {};
function loadSide(k) {
  if (sideImg[k]) return Promise.resolve(sideImg[k]);
  return new Promise((r) => { const im = new Image(); im.onload = () => { sideImg[k] = im; r(im); }; im.onerror = () => r(null); im.src = (window.ART_SRC && window.ART_SRC['side_' + k]) || `assets/side_${k}.webp`; });
}
function drawSide(im, t, title) {
  const calm = calmMotion.matches, z = calm ? 1 : 1.01 + Math.min(0.09, t * 0.005), w = 864 * z, h = H * z;
  g.fillStyle = '#0e0c18'; g.fillRect(-OX, 0, VW, H);
  g.drawImage(im, W / 2 - w / 2, (H - h) * 0.35, w, h);
  g.fillStyle = '#0d0b1c'; g.fillRect(-OX, 0, VW, 14); g.fillRect(-OX, H - 6, VW, 6);
  g.save(); g.globalAlpha = clamp((t - 0.4) / 0.8, 0, 1); g.font = `800 19px "Shippori Mincho B1", serif`; g.textAlign = 'left'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.strokeStyle = 'rgba(12,10,20,.85)'; g.lineWidth = 6; g.strokeText(title, 18 - OX, 36); g.fillStyle = '#f6e8cf'; g.fillText(title, 18 - OX, 36); g.restore();
}
// 一枚絵を 出して、ことばを 流す
async function sideScene(k, lines) {
  const im = await loadSide(k);
  clearSpeaker(); ui.dialog = null; Aud.bgm(null); Aud.sfx('opStart');
  await fade(1, 0.6, '#0d0b1c');
  if (im) { const t0 = clock; ui.overlay = () => drawSide(im, clock - t0, SIDE_ART[k]); }
  Aud.bgm('memory'); await fade(0, 0.9); await sleep(0.8);
  for (const l of lines) await say(l);
  await fade(1, 0.6, '#0d0b1c'); ui.overlay = null; Aud.bgm(world.map.bgm); await fade(0, 0.6);
}
function giveReward(money, items) {
  const parts = [];
  if (money) { S.money = (S.money || 0) + money; parts.push(`${money}コイン`); }
  for (const [k, v] of Object.entries(items || {})) { S.bag[k] = (S.bag[k] || 0) + v; parts.push(`${ITEMS[k].n} ${v}こ`); }
  Aud.sfx('get'); return say(`${parts.join('、')}を もらった!`);
}
const fireMon = () => S.party.find((m) => m.hp > 0 && typeOf(m) === 'fire');

// ---------- 調べる(寄り道の 小物) ----------
async function lookScript(id) {
  if (id === 'lantern') {
    if (S.flags.look_lantern) { await say('灯ろうの あかりが、しずかに ゆれている。\nあたりの 草が、あたたかい 色に そまっている。'); return; }
    await say('こけの はえた 古い 石の 灯ろう。\nなかは、からっぽで 冷たい。');
    const m = fireMon();
    if (!m) { await say('火を もつ 子が いれば、ともせる かもしれない。\n(ほのおタイプの 仲間を つれて こよう)'); return; }
    await say(`${nameOf(m)}が、灯ろうを じっと 見あげている。`);
    const c = await choose(['ともして もらう', 'やめておく'], { x: 420, y: 150, w: 200, cancel: 1 }); if (c !== 0) return;
    Aud.cry(m.sp); await sleep(0.5); Aud.sfx('lampOn', 2); S.flags.look_lantern = true; await sleep(0.9);
    await sideScene('forest', ['小さな 火が、灯ろうの なかで ふくらんだ。', 'こけの うえに、木の かげが のびていく。\nあちこちから、森の 子たちが 顔を だした。', 'だれかを まっていた あかりが、\nもういちど、森の 道しるべに なった。']);
    addBond(m, 5);
    setSpeaker('woodsman'); await say('おお…ともった。ほんとうに ともった。\nこいつは、うちの ばあさんが 毎晩 つけてた 灯りでな。'); clearSpeaker();
    await giveReward(300, { ball: 3 }); save(); return;
  }
  if (id === 'easel') { await say(S.flags.side_lake ? 'できあがった 絵。\nくらい 水面に、まるい 月が ひとつ うかんでいる。' : 'かきかけの 絵。\n水面の ところだけが、まっしろな ままだ。'); return; }
  if (id === 'bench') { await say(S.flags.look_train ? 'ベンチに、小さな 足あとが ついている。\nだれかが ここで、ひと晩 まっていたらしい。' : '色の はげた 木の ベンチ。\nはしに、古い 切符が はさまっている。'); return; }
  if (id === 'stationsign') { await say('「ひとつ星」\n← しおかぜ　　　　ヤマノハ →'); return; }
  if (id === 'stationlamp') { await say(S.flags.look_train ? 'ホームの 灯りが、やわらかく ともっている。' : 'ホームの 灯り。\nガラスは われていないのに、ともらない。'); return; }
  if (id === 'train') {
    if (S.flags.look_train) { await say('列車の まどに、あたたかい 色が のこっている。'); return; }
    if (!S.flags.side_ticket) { await say('錆びた 列車が、線路の うえで 止まっている。\nまどの なかは、まっくらだ。'); return; }
    await say('あずかった 切符を、とびらに かざした。'); Aud.sfx('lampOn', 3); S.flags.look_train = true; S.flags.look_stationlamp = true; await sleep(0.8);
    await sideScene('station', ['とびらが ひらき、まどに 灯りが もどった。\n――あの 夜の、車内の 色だ。', '「停電です。足もとに 気をつけて」\n線路の うえに、小さな 灯りが ならんでいく。', '乗っていた 人は、ひとりも けがを しなかった。\n灯りを たどって、町まで 歩いて 帰れたから。', 'ただ、あの 灯りに お礼を 言えた 人は、\nだれも いなかった。']);
    setSpeaker('stationman'); await say('……ようやく、最後の 列車を 見送れたよ。\nありがとう。これは、わしからの お礼だ。'); clearSpeaker();
    await giveReward(500, { potion: 3, cure: 2 }); save(); return;
  }
  if (id === 'cairn') {
    const night = typeof isNight !== 'function' || isNight();
    if (!night) { await say('石を つみあげた 目じるし。\nここから、とおくの 町が かすんで 見える。');
      const c = await choose(['夜まで まつ', 'また くる'], { x: 440, y: 150, w: 180, cancel: 1 }); if (c !== 0) return;
      await fade(1, 0.8, '#0d0b1c'); if (typeof skipToNight === 'function') skipToNight(); await sleep(0.5); await fade(0, 0.8); }
    S.flags.look_cairn = true;
    const n = ['lit_town', 'lit_town2', 'lit_town3', 'lit_town4'].filter((f) => S.flags[f]).length;
    const first = !S.flags.side_ridge; S.flags.side_ridge = true;
    await sideScene('ridge', n >= 4
      ? ['夜の 底に、4つの あかりが ならんでいる。', 'ひなたの 灯り、団地の 灯り、港の 灯り、山の 灯り。\nどれも、旅の とちゅうで 出会った 色だ。', '……ひとりで はじめた 道が、\nいまは こんなに あかるい。']
      : [`夜の 底に、${n}つの あかりが 見える。`, 'まだ くらい 町の ほうで、\n小さな 光が ひとつ、またたいた 気がした。']);
    if (first) { await giveReward(400, { ball: 5 }); }
    save(); return;
  }
}

// ---------- 寄り道の 人たち ----------
async function painterTalk() {
  if (S.flags.side_lake) { await say('あの 夜の 月、いい 絵に なったでしょう。\nまた、みずべで 会いましょうね。'); return; }
  if (!S.flags.met_painter) { S.flags.met_painter = true; await sayAll(['こんにちは。わたしは この 池を かいているの。', 'でも、いちばん かきたいのは 夜の 水面。\n月と、水の 子の ひかりが かさなる ところ。']); }
  const m = S.party.find((x) => x.hp > 0 && typeOf(x) === 'water');
  if (!m) { await say('みずタイプの 子を つれて きてくれない?\n水面を 光らせて ほしいの。'); return; }
  await say(`あ、${nameOf(m)}! その 子なら きっと ぴったり。`);
  const night = typeof isNight !== 'function' || isNight();
  const c = await choose([night ? '水面へ' : '夜まで まつ', 'また こんど'], { x: 440, y: 150, w: 190, cancel: 1 }); if (c !== 0) return;
  await fade(1, 0.8, '#0d0b1c'); if (typeof skipToNight === 'function') skipToNight(); await sleep(0.5); await fade(0, 0.8);
  Aud.cry(m.sp); await sleep(0.6); S.flags.side_lake = true; S.flags.look_easel = true;
  await sideScene('lake', [`${nameOf(m)}が、そっと 水に はいった。`, '波紋の まんなかで、月が ゆれる。\nまわりに、小さな 光が あつまってくる。', '「うごかないで。……そう、そのまま」\nふでの おとだけが、しばらく 続いた。']);
  addBond(m, 5);
  setSpeaker('painter'); await say('かけた……! ほんとうに ありがとう。\nこれは、絵の具代の のこり。うけとって。'); clearSpeaker();
  await giveReward(400, { potion: 2, cure: 2 }); save();
}
async function stationTalk() {
  if (S.flags.look_train) { await sayAll(['駅は しずかに なったが、もう さびしくは ないよ。', '気が むいたら、ベンチで やすんで いきな。']); return; }
  if (!S.flags.side_ticket) {
    await sayAll(['……列車なら、もう 来ないよ。', '大停電の 夜、最後の 列車が ここで 止まった。\nわしは、お客を おろして やることしか できなかった。', 'くらい 線路を、みんな どうやって 帰ったのか。\nそれが ずっと、気に なっていてな。', 'この 切符を あずける。\nあの 列車の とびらに、かざして みてくれんか。']);
    S.flags.side_ticket = true; Aud.sfx('get'); await say('「古い 切符」を あずかった!'); save(); return;
  }
  await say('列車は、ホームの 西の ほうに 止まっているよ。');
}
