'use strict';
// 物語・会話・イベント・メニュー・タイトル・エンディング・起動
const TEXT = {
  sign_village: 'ここは ひなた村。のんびり やさしい 村です。\n→ 東: ひなた草原',
  sign_home: 'ここは あなたの いえ。',
  sign_route: 'ひなた草原。\nモンスターが とびだす 草むらに ちゅうい!',
  sign_route3: 'しおかぜ街道。\n霧が こい日は、足もとに ちゅうい。',
  sign_route2: 'でんせん街道。\n電線の うえの 鳥に ちゅうい!',
  sign_gate: 'この さきは 大きな 町へ つづく ゲート。\n(つづきは また こんど…)',
};
const TRAINERS = {
  rival: { name: 'ミナト', title: 'ひなた草原で しゅぎょう中の ぼうけんしゃ', cut: true, team: [['pukurisu', 5], ['hinatagaeru', 5]], reward: 300,
    intro: ['おっ、きみも ぼうけんしゃ だね?', 'ぼくは ミナト! ひなた草原で しゅぎょう中なんだ。', 'めが あったら しょうぶ! いくよ!'], talk: 'おっ、しょうぶ したいの? いいよ!',
    win: ['うわあ、まけたー! きみ、つよいね!', 'でも たのしかった! これ、あげるよ。'], gift: { ball: 3, potion: 2, text: 'あつめボールを 3こ、きずぐすりを 2こ もらった!' },
    outro: ['この さきの ゲートから、大きな 町へ いけるんだって。', 'また どこかで しょうぶしよう!'], after: 'また どこかで しょうぶしよう!\nこんどは まけないぞ!' },
  camper: { name: 'ユウジ', team: [['kinokokko', 3], ['shizukufin', 3]], reward: 150,
    intro: ['やあ! ここは ぼくの キャンプ地だよ。', 'ねむそうな 子たちだけど、あなどると ひどいめに あうぞ!'], talk: 'しょうぶ する?',
    win: ['まいったなあ…。\nきみ、いい コンビだね。'], outro: ['草むらの 子たちには、状態異常を あたえる わざを もつ 子も いるよ。', 'なんでもなおしを もっておくと あんしんだ。'], after: '状態異常には きを つけてね。\nなんでもなおしが あると あんしんだよ。' },
  farmhand: { name: 'ハルキ', team: [['birisuzume', 7], ['hikaritanishi', 7]], reward: 280,
    intro: ['おっ、この 道を とおるのか?', '電線の したは、ぼくの しごとばだよ。しょうぶだ!'], talk: 'しょうぶ する?',
    win: ['やるなあ…!\nでんきには でんきで かえすか、はっぱで うけとめるのが いいんだ。'], outro: ['はっぱタイプは、でんきの わざを うけとめられるよ。'], after: 'でんきタイプは、まひしないんだ。\nだから まひの わざは きかないよ。' },
  nana: { name: 'ナナ', title: 'ミドリ団地の あかり番', cut: true, boss: true, team: [['hanedoron', 9], ['birisuzume', 9], ['hikaritanishi', 9]], reward: 500, hook: 'lightTown',
    intro: ['ここの ロボットたちは、ずっと ねむったままなの。', 'あかりを ともしてくれる ひとを、まってたんだ。', '…ためさせて。あなたの 旅の ちからを!'], talk: 'もう いちど、やる?',
    win: ['…すごい。\nあなたの モンスターたちは、ちゃんと あなたを しんじてるんだね。'], outro: ['わたしたちも、そうなりたい。もういちど、あかりを ともすよ。'], after: 'ロボットたちが、また うごきだしたよ。\nありがとう。' },
  sailor: { name: 'ヒデ', team: [['sabikani', 11], ['kirikamome', 11]], reward: 360,
    intro: ['霧の日は、船が でないからな。', 'うで試しに つきあえよ!'], talk: 'もう いっちょ、やるか?',
    win: ['…こりゃ、やられた。\nきみの 仲間は、霧のなかでも 目が きくんだな。'], outro: ['こうてつタイプには、ほのおと みずが よく きく。', 'ほのおで とかすか、みずで さびさせるんだ。'], after: 'こうてつには ほのおか みず。\nおぼえておきな。' },
  goro: { name: 'ゴロウ', title: 'ナギサ港の 灯台守', cut: true, boss: true, hook: 'lightTown', team: [['sabikani', 13], ['funenko', 13], ['kirikamome', 13]], reward: 800,
    intro: ['この 港の 灯台は、もう なんねんも ともっていない。', 'あかりが 消えて、船も 人も 港から はなれていった。', 'それでも わしは、ここで まっていたんだ。…ためさせて もらうぞ。'], talk: 'もう いちど、やるか?',
    win: ['…きみには、あかりを とともす ちからが ある。', 'さあ、灯台の あかりを、ともしてくれ。'], outro: ['あかりを、もういちど ともそう。'], after: '灯台の あかりが、船の かえる みちしるべに なる。\nありがとうな。' },
  techie: { name: 'レン', title: 'ひだまり町の あかり番', cut: true, boss: true, team: [['hotaruusagi', 6], ['pukurisu', 6]], reward: 250,
    intro: ['この 町の 電線の したで、ずっと れんしゅう してたんだ。', 'しょうぶだ!'], talk: 'また しょうぶ する?',
    win: ['…ぼくの まけか。\nあたたかい しょうぶ だったよ。'], hook: 'lightTown', outro: ['ほたるうさぎの あかりは、よるでも まちを てらしてくれる。'], after: 'ほたるうさぎの あかりは、よるの 道を あたためてくれるんだ。' },
};
const sayAll = async (lines) => { for (const l of lines) await say(l); };
const dexCount = () => SPECIES_ORDER.filter((s) => S.caught[s]).length;

async function collectSpot(s, key) {
  S.flags[key] = true; Aud.sfx('get'); let t;
  if (s.item === 'coin') { S.money = (S.money || 0) + s.n; t = `${s.n}コインが おちていた!`; }
  else { const n = s.n || 1; S.bag[s.item] = (S.bag[s.item] || 0) + n; t = `ひかる 場所に ${ITEMS[s.item].n}が ${n}こ おちていた!`; }
  await say(t); save();
}
async function healScene() {
  await fade(1, 0.4); Aud.sfx('heal'); await sleep(0.9); healAll(); for (const m of S.party) addBond(m, 1); await fade(0, 0.4);
}
async function whiteout() {
  await say('めのまえが まっくらに なった…'); await fade(1, 0.5);
  enterMap('village', 6, 8, 'd', true); healAll(); await sleep(0.4); await fade(0, 0.5);
  await say('ひなた村の いえで めを さました。\nみんな げんきに なったよ。');
}
async function afterBattle(r) {
  Aud.bgm(world.map.bgm);
  if (r === 'lose') { ui.fade = 0; await whiteout(); save(); return; }
  await fade(0, 0.4);
  await evolveCheck(); save();
}
async function wildEncounter() {
  const m = world.map; Aud.sfx('encounter'); Aud.bgm(null);
  await flashFx(2); await wipe(0.55);
  const table = [...m.grass, ...(m.grassLit || []).filter(([f]) => S.flags[f]).flatMap(([, l]) => l)];
  let r = Math.random() * table.reduce((s, x) => s + x[1], 0), sp = table[0][0];
  for (const [id, w] of table) { r -= w; if (r <= 0) { sp = id; break; } }
  const foe = mkMon(sp, rint(m.lv[0], m.lv[1])); if (Math.random() < 0.02) foe.shiny = true;
  const r2 = await runBattle({ foes: [foe] });
  await afterBattle(r2);
}
async function trainerSpot(n) {
  const p = world.p, T = TRAINERS[n.id];
  world.bang = { x: n.x, y: n.y, t0: clock }; Aud.sfx('encounter'); await sleep(0.8);
  const v = DV[n.dir], ahead = (p.x - n.x) * v[0] + (p.y - n.y) * v[1];
  await walkActor(n, n.dir, ahead - 1);
  const dx = p.x - n.x, dy = p.y - n.y;
  if (Math.abs(dx) + Math.abs(dy) > 1) { const sd = dx !== 0 && Math.abs(dx) === 1 && dy !== 0 ? (dy > 0 ? 'd' : 'u') : (dx > 0 ? 'r' : 'l'); if (!solidAt(n.x + DV[sd][0], n.y + DV[sd][1])) await walkActor(n, sd, 1); }
  const ddx = p.x - n.x, ddy = p.y - n.y;
  n.dir = Math.abs(ddx) >= Math.abs(ddy) ? (ddx > 0 ? 'r' : 'l') : (ddy > 0 ? 'd' : 'u'); p.dir = OPP[n.dir];
  if (T.cut) await cutin(Art.portrait(n.id), T.name, T.title || '');
  setSpeaker(n.id); await sayAll(T.intro);
  await trainerBattle(n);
}
// 町の あかりを ともす場面(lightTown)は light.js
async function trainerBattle(n) {
  const T = TRAINERS[n.id]; Aud.sfx('encounter'); Aud.bgm(null); await flashFx(2); await wipe(0.55);
  const r = await runBattle({ trainer: T, foes: T.team.map(([s, l]) => mkMon(s, l)) });
  await afterBattle(r);
  if (r === 'win' && !S.flags['beat_' + n.id]) {
    S.flags['beat_' + n.id] = true; Aud.sfx('win'); setSpeaker(n.id);
    await sayAll(T.win);
    if (T.gift) { Aud.sfx('get'); for (const k of ['ball', 'potion', 'cure']) if (T.gift[k]) S.bag[k] = (S.bag[k] || 0) + T.gift[k]; await say(T.gift.text); }
    const prize = Math.round(T.reward * DIFF[diff].coin); S.money = (S.money || 0) + prize; Aud.sfx('get'); await say(`${prize}コインを もらった!`);
    await sayAll(T.outro);
    if (T.hook === 'lightTown') await lightTown();
  }
}
async function shop() {
  const ids = ['ball', 'potion', 'cure'];
  for (;;) {
    const items = ids.map((id) => ({ label: ITEMS[id].n, sub: `${ITEMS[id].price}コイン` })).concat(['やめる']);
    const c = await choose(items, { x: 300, y: 50, w: 320, title: `もっている コイン: ${S.money || 0}`, cancel: -1 });
    if (c < 0 || c === ids.length) return;
    const id = ids[c];
    if ((S.money || 0) < ITEMS[id].price) { Aud.sfx('back'); await say('コインが たりないよ!'); continue; }
    S.money -= ITEMS[id].price; S.bag[id] = (S.bag[id] || 0) + 1; Aud.sfx('get');
    await say(`${ITEMS[id].n}を かった! (のこり ${S.money}コイン)`);
  }
}
async function doorScript(id) {
  if (id === 'shop') {
    if (!S.flags.beat_rival) { await say('「じゅんびちゅう」と かかれた ふだが かかっている。'); return; }
    setSpeaker('clerk'); await say('いらっしゃい! ちいさな おみせだけど、ゆっくり みていってね。'); await shop(); return;
  }
  if (id === 'clinic') { await say('ちいさな 診療所。\nなかで ひとやすみ していく?'); const c = await choose(['やすむ', 'やめておく'], { x: 440, y: 150, w: 170, cancel: 1 }); if (c === 0) { await healScene(); await say('あたたかい おちゃを のんで、みんな げんきに なった。'); } return; }
  if (id === 'market') { setSpeaker('fisher'); await say('いらっしゃい! 魚は ないけど、道具なら あるよ。'); await shop(); return; }
  if (id === 'warehouse') { await say('古い 倉庫の とびらは さびついている。\nなかから、ぎいぎい という おとが きこえる。'); return; }
  if (id === 'clinic3') { await say('ちいさな 診療所。\nなかで ひとやすみ していく?'); const c = await choose(['やすむ', 'やめておく'], { x: 440, y: 150, w: 170, cancel: 1 }); if (c === 0) { await healScene(); await say('しおかぜの おちゃを のんで、みんな げんきに なった。'); } return; }
  if (id === 'lighthouse') { await say(S.flags.lit_town3 ? '灯台の てっぺんで、あかりが ゆっくり まわっている。' : '灯台の とびらは、かたく とざされている。'); return; }
  if (id === 'greenhouse') { await say('ビニールハウスの なかで、ロボットたちが うごかずに ならんでいる。'); return; }
  if (id === 'kiosk') { await say('自動販売機が ちかちか ひかっている。\n「ざんねん、ざいこ ぎれ」と ひょうじされた。'); return; }
  if (id === 'datacenter') { await say('大きな とびらは、とじたままだ。\nなかから、かすかな うなりごえが きこえる。'); return; }
  if (id === 'clinic2') { await say('ちいさな 診療所。\nなかで ひとやすみ していく?'); const c = await choose(['やすむ', 'やめておく'], { x: 440, y: 150, w: 170, cancel: 1 }); if (c === 0) { await healScene(); await say('あたたかい スープを のんで、みんな げんきに なった。'); } return; }
  if (id === 'house') { await say('ドアは しまっている。\nひとの けはいは ない…。'); return; }
  if (id === 'tower') { await say('大きな ビルの ドアは、かたく とざされている。'); return; }
  if (id === 'home') {
    await say('おかあさん「おかえり! がんばってるわね。\nごはん できてるわよ。」'); await healScene();
    await say('おかあさんの ごはんで みんな げんきに なった!');
  } else if (id === 'rest') {
    await say('ふわふわ休憩所。\nふかふかの クッションで ひとやすみ していく?');
    const c = await choose(['やすむ', 'やめておく'], { x: 440, y: 150, w: 170, cancel: 1 });
    if (c === 0) { await healScene(); await say('ぐっすり ねむって、みんな げんきに なった!'); }
  }
}
async function doWarp(w) {
  const p = world.p;
  if (w.needs && !S.flags[w.needs]) { await say(w.needMsg || 'ゲートは まだ しまっている…。\nだれかに しょうぶを よばれるのを まっているようだ。'); await walkActor(p, OPP[p.dir], 1); return; }
  if (w.to === 'end') { await endingScene(); return; }
  Aud.sfx('warp'); await fade(1, 0.25); enterMap(w.to, w.tx, w.ty, w.dir); await chapterOnArrive(w.to); save(); await fade(0, 0.25);
  await storyCatchUp(w.to);
}
// ---------- お願いごと(サブクエスト) ----------
const QUESTS = {
  q_frog: { npc: 'child', title: 'ひなたガエルを みたい', ask: ['ねえ、おねがい! ひなたガエルを つかまえて、ぼくに みせてくれない?', 'あたまの たんぽぽが、ずっと きになってるんだ!'], remind: 'ひなたガエルを つかまえて きてね! ひなた草原の みずべに いるよ。', done: ['わあ! ほんものの ひなたガエルだ!', 'ありがとう! これ、おれいだよ!'], cond: () => S.caught.hinatagaeru, condText: 'ひなたガエルを つかまえる', reward: { money: 150, items: { potion: 1 } } },
  q_usagi: { npc: 'granny', title: 'ほたるうさぎに あいたい', ask: ['むかしは、よる、ほたるうさぎが 道を てらしてくれたもんじゃ。', 'もういちど、あの あかりが みたいねえ…。つかまえて、みせてくれんかね?'], remind: 'ほたるうさぎの みみの あかりが みたいのう…。', done: ['おお…あたたかい あかりじゃ…。', 'ありがとうよ。これを おもちなさい。'], cond: () => S.caught.hotaruusagi, condText: 'ほたるうさぎを つかまえる', reward: { items: { cure: 2 } } },
  q_bond: { npc: 'girl', title: 'なかよしの 仲間を みせて', ask: ['ねえ、おにいさん! ぼうけんしゃ なんでしょ?', 'なかよく なった 仲間と いっしょに あるいてる ところを、みせてほしいな!'], remind: '仲間と なかよく なると、ハートが ふえるんだよね? はやく みたいな!', done: ['わあ、その子、すごく なついてる!', 'ありがとう! これ、あげるね!'], cond: () => S.party.some((m) => bondLv(m) >= 2), condText: 'なかよし度2いじょうの 仲間を つれて いく', reward: { money: 200 } },
  q_drone: { npc: 'farmer', title: 'ハネドロンを みせて', ask: ['この ごろ、ハネドロンが ふえてねえ。', 'ビニールハウスの ロボットと なかよく してる みたいで、かわいいんだ。つかまえて みせとくれ。'], remind: 'ハネドロンを つかまえて きとくれ。', done: ['おお、ほんものだ! よく つかまえた!', 'ありがとよ。これを もっていきな。'], cond: () => S.caught.hanedoron, condText: 'ハネドロンを つかまえる', reward: { items: { ball: 3 } } },
  q_gull: { npc: 'dockgirl', title: 'キリカモメを みたい', ask: ['ねえ、キリカモメを つかまえて、みせて!', 'かもめの こえが すきなの。'], remind: 'キリカモメは、霧の なかを とんでるよ!', done: ['わあ、かわいい!', 'ありがとう! おれいに、これ あげる!'], cond: () => S.caught.kirikamome, condText: 'キリカモメを つかまえる', reward: { money: 250 } },
  q_crab: { npc: 'fisher', title: 'サビガニを みせてくれ', ask: ['この 港の 主みたいな カニが いるんだ。', 'サビガニっていう。つかまえて みせて くれんか?'], remind: 'サビガニは、波止場や 草むらに いるぞ。', done: ['おお、でっけえ はさみだ…!', 'ありがとな。こいつは おれいだ。'], cond: () => S.caught.sabikani, condText: 'サビガニを つかまえる', reward: { items: { potion: 3 } } },
};
const QUEST_OF = {}; for (const k in QUESTS) QUEST_OF[QUESTS[k].npc] = k;
async function questTalk(qid) {
  const q = QUESTS[qid]; S.quests = S.quests || {}; const st = S.quests[qid] || 0;
  if (st === 2) return false;
  if (st === 0) { await sayAll(q.ask); S.quests[qid] = 1; Aud.sfx('get'); bondEvents.push(`お願いごと: ${q.title}`); if (!q.cond()) return true; }
  if (q.cond()) {
    S.quests[qid] = 2; Aud.sfx('win'); await sayAll(q.done);
    const r = q.reward, parts = [];
    if (r.money) { S.money = (S.money || 0) + r.money; parts.push(`${r.money}コイン`); }
    for (const [k, v] of Object.entries(r.items || {})) { S.bag[k] = (S.bag[k] || 0) + v; parts.push(`${ITEMS[k].n} ${v}こ`); }
    Aud.sfx('get'); await say(`${parts.join('、')}を もらった!`); save(); return true;
  }
  await say(q.remind); return true;
}
async function grannyGift() {
  S.flags.granny = true; setSpeaker('granny');
  await say('おや、ぼうけんに いくのかい? これを もっておいき。'); Aud.sfx('get'); S.bag.potion += 2; await say('きずぐすりを 2こ もらった!');
  await say('それと、むかし つかっていた つりざおも あげよう。\nみずべで、水の ほうを むいて Aを おすと、つりが できるよ。');
  S.flags.rod = true; Aud.sfx('get'); await say('つりざおを もらった!'); save();
}
// ---------- つり ----------
async function fishTalk(tx, ty) {
  if (!S.flags.rod) { await say('みずが ひろがっている。\nつりざおが あれば、なにか つれそうだ…。'); return; }
  const c = await choose(['つりを する', 'やめておく'], { x: 440, y: 150, w: 180, cancel: 1 }); if (c !== 0) return;
  await goFishing(tx, ty);
}
async function goFishing(tx, ty) {
  const p = world.p, t = FISH[world.map.id]; world.fishing = { tx, ty, state: 'wait' }; Aud.sfx('throw'); flushBtn();
  const waitT = rnd(1.4, 4.4), t0 = clock; let early = false;
  while (clock - t0 < waitT) { await nextFrame(); if (btnQ.length) { btnQ.length = 0; early = true; break; } }
  if (early) { world.fishing = null; await say('はやく ひきすぎた…。\nさかなが にげてしまった。'); return; }
  world.fishing.state = 'bite'; Aud.sfx('shake'); flushBtn();
  const win = [0.95, 0.75, 0.55][diff], t1 = clock; let hit = false;
  while (clock - t1 < win) { await nextFrame(); if (btnQ.length) { btnQ.length = 0; hit = true; break; } }
  world.fishing = null;
  if (!hit) { await say('なにか かかったのに…\nにげられてしまった!'); return; }
  Aud.sfx('hit'); await sleep(0.2);
  const roll = Math.random();
  if (roll < 0.12) { await say('つりあげたのは、さびた かんだった…。'); return; }
  if (roll < 0.2) { const pick = [['potion', 1], ['ball', 1], ['cure', 1], ['coin', 60]][rint(0, 3)]; Aud.sfx('get'); if (pick[0] === 'coin') { S.money = (S.money || 0) + pick[1]; await say(`ふくろを つりあげた! ${pick[1]}コイン はいっていた!`); } else { S.bag[pick[0]] = (S.bag[pick[0]] || 0) + 1; await say(`${ITEMS[pick[0]].n}を つりあげた!`); } save(); return; }
  let r = Math.random() * t.list.reduce((s, x) => s + x[1], 0), sp = t.list[0][0]; for (const [id, w] of t.list) { r -= w; if (r <= 0) { sp = id; break; } }
  const foe = mkMon(sp, rint(t.lv[0], t.lv[1])); if (Math.random() < 0.02) foe.shiny = true;
  await say('ひいた! なにかが かかった!');
  Aud.sfx('encounter'); Aud.bgm(null); await flashFx(1); await wipe(0.5);
  const res = await runBattle({ foes: [foe] }); await afterBattle(res);
}
async function runScript(id, n) {
  if (n.id === 'granny' && !S.flags.granny) { await grannyGift(); return; }
  const qid = QUEST_OF[n.id]; if (qid && await questTalk(qid)) return;
  switch (id) {
    case 'elder': {
      if (S.flags.mem_town3) await sayAll(['ミナトくんに 会ったか。…そうか。', '発電所の 番人は、わしの 古い 友だちでな。\n山の ほうまで、たのんだよ。']);
      const c = dexCount();
      if (c >= SPECIES_ORDER.length) await sayAll(['おお! ずかんが ぜんぶ うまったぞ!', 'きみは りっぱな ぼうけんしゃじゃ。']);
      else await sayAll([`ずかんは ${c} / ${SPECIES_ORDER.length} じゃな。\n草むらで なかまを あつめて、ずかんを うめるのじゃ。`, 'ほのおは はっぱに、みずは ほのおに、はっぱは みずに つよいぞ。']);
      break;
    }
    case 'child':
      await say(S.flags.lit_town ? '町に あかりが ともってから、草原に 電線の 鳥が おりてくるように なったんだって!' : ['ねえねえ! 草むらの 中には、モンスターが かくれてるんだよ!', 'ボールは HPを へらしてから なげると、つかまりやすいんだって!'][rint(0, 1)]); break;
    case 'nurse': {
      await say('おつかれさま! ここで やすんでいく?');
      const c = await choose(['やすむ', 'やめておく'], { x: 440, y: 150, w: 170, cancel: 1 });
      if (c === 0) { await healScene(); await say('みんな げんきに なりました! いってらっしゃい!'); }
      break;
    }
    case 'granny':
      if (!S.flags.granny) { S.flags.granny = true; await sayAll(['おや、ぼうけんに いくのかい? これを もっておいき。']); Aud.sfx('get'); S.bag.potion += 2; await say('きずぐすりを 2こ もらった!'); }
      else if (S.flags.lit_town) await sayAll(['夜道を ほたるうさぎが てらすのは、\nむかしは「灯守り」の しごと だったそうな。', 'その 灯守りが どこへ 行ったのかは、わしも しらないねえ。']);
      else await say('むかしは この あたりにも、大きな モンスターが いたんじゃよ…。\nきを つけて いっておいで。');
      break;
    case 'traveler':
      await sayAll(['やあ! ぼくは たびの もの。', 'モンスターには「タイプ」が あるんだ。\nほのおは はっぱに つよく、みずは ほのおに つよい。\nはっぱは みずに つよいよ。', 'ふしぎと ぐるっと まわっているんだ。\nつよいタイプの 子を つれていこう!']);
      S.effSeen = S.effSeen || {}; for (const [a, b2, e] of [['fire', 'leaf', 2], ['leaf', 'fire', 0.5], ['water', 'fire', 2], ['fire', 'water', 0.5], ['leaf', 'water', 2], ['water', 'leaf', 0.5]]) S.effSeen[a + '>' + b2] = e;
      await say('(ほのお・みず・はっぱの そうせいが、わざメニューに ◎△で でるように なった!)');
      break;
    case 'oldman':
      if (S.flags.lit_town) { await sayAll(['街灯が ともるのは、なんねんぶりだろう…。', 'あの 夜の 小さな 灯りを、わしは わすれないよ。']); break; }
      await sayAll(['この 町も、むかしは もっと にぎやかだったんだ。', warmth() > 0.7 ? 'でも ちかごろは、ひとも モンスターも、すこしずつ もどってきた。\n町が あたたかく なった きがするよ。' : 'ちかごろは、草むらの 子たちが 道まで でてくる。\nだれも いない 町が、すこし さびしいのかもしれんな。']); break;
    case 'girl':
      if (S.flags.lit_town) { await sayAll(['ねえ、みて! 電線の ほたるうさぎが、こっちを むいて ゆれてるよ!', 'あかりが ともって、うれしいのかな。']); break; }
      await sayAll(['電線の うえで、ほたるうさぎが よく ひなたぼっこ してるの。', '話しかけても、なにも こたえてくれないけど…\nでも、こっちを ちゃんと みてるんだよ。']); break;
    case 'farmer':
      await sayAll(S.flags.lit_town2 ? ['ロボットが うごいてくれて、たすかるよ。', 'なんだか、団地が あたたかく なったねえ。'] : ['ビニールハウスの ロボットが、さいきん ぜんぜん うごかなくてね…。', 'この 団地も、ずいぶん しずかに なったもんだよ。']); break;
    case 'nboy':
      await sayAll(S.flags.lit_town2 ? ['ねえ、みて! ドローンが ぼくの まわりを とんでるよ!', 'ハネドロンって、ちょっと こわいけど、かわいいんだ。'] : ['ドローンが とんでると、ハネドロンも ついてくるんだ。', 'でも、さいきんは あんまり みないなあ。']); break;
    case 'teacher': {
      await sayAll(['わたしは わざの 先生。\nわすれてしまった わざを、50コインで おもいださせて あげるよ。', ]);
      const c0 = await choose(['おねがいする', 'やめておく'], { x: 440, y: 150, w: 190, cancel: 1 }); if (c0 !== 0) break;
      const i = await partyScreen({ title: 'だれの わざを おもいだす?', validate: (i) => (relearnable(S.party[i]).length ? null : 'いまは おもいだせる わざが ないみたい。') });
      if (i < 0) break;
      const m = S.party[i], list = relearnable(m);
      const k = await choose(list.map((id) => ({ label: MOVES[id].n, sub: `${TYPES[MOVES[id].t].name}  いりょく${MOVES[id].p || '―'}` })), { x: 300, y: 40, w: 328, title: `${nameOf(m)}が おもいだせる わざ`, cancel: -1 });
      if (k < 0) break;
      if ((S.money || 0) < 50) { await say('コインが たりないみたいね。'); break; }
      if (await learnMove(m, list[k])) { S.money -= 50; await say('これで ばっちり! また おいで。'); }
      break;
    }
    case 'fisher':
      await sayAll(S.flags.lit_town3 ? ['灯台が まわってるのを みたのは、ひさしぶりだ。', '海も、すこし あったかく なった きがするよ。'] : ['この港も、むかしは 漁師で にぎわったもんだ。', '霧の日に 灯台の あかりが 消えちまってから、船が へってな…。']); break;
    case 'dockgirl':
      await sayAll(S.flags.lit_town3 ? ['ねえ、みて! カモメが 灯台の まわりを とんでる!', 'キリカモメが、ちゃんと かえってきたんだよ。'] : ['キリカモメは、霧の なかを じっと とんでるの。', 'きっと、灯台の あかりを さがしてるんだ。']); break;
    case 'clerk':
      await say(S.flags.beat_rival ? 'おみせ、あけたよ! ドアから はいってね。' : 'ごめんね、おみせは まだ じゅんびちゅうなんだ。\nもうすこし まっててくれる?'); break;
    case 'rival': case 'camper': case 'techie': case 'farmhand': case 'nana': case 'sailor': case 'goro': {
      const T = TRAINERS[n.id];
      if (S.flags['beat_' + n.id]) await say(T.after);
      else { await say(T.talk || 'しょうぶだ!'); await trainerBattle(n); }
      break;
    }
  }
}
// ボックス: てもちが6ひきを こえたぶんは ここに はいる。ひきとる・あずける
async function boxMenu() {
  for (;;) {
    const c = await choose([{ label: 'ひきとる', sub: `${S.box.length}ひき` }, { label: 'あずける', sub: `てもち ${S.party.length}ひき` }, 'もどる'], { x: W - 236, y: 44, w: 224, title: 'ボックス', cancel: -1 });
    if (c === 0) {
      if (!S.box.length) { await say('ボックスは からっぽだよ。'); continue; }
      const i = await partyScreen({ title: 'だれを ひきとる?', list: S.box });
      if (i < 0) continue;
      const m = S.box[i];
      if (S.party.length < 6) { S.party.push(S.box.splice(i, 1)[0]); Aud.sfx('get'); await say(`${nameOf(m)}を てもちに くわえた!`); }
      else {
        await say('てもちが いっぱいだ。だれかと いれかえよう。');
        const j = await partyScreen({ title: 'だれと いれかえる?' });
        if (j < 0) continue;
        const t = S.party[j]; S.party[j] = m; S.box[i] = t; Aud.sfx('get'); await say(`${nameOf(m)}を てもちに くわえて、${nameOf(t)}を ボックスに あずけた!`);
      }
    } else if (c === 1) {
      if (S.party.length <= 1) { await say('てもちが 1ひきだけだよ。'); continue; }
      const j = await partyScreen({ title: 'だれを あずける?', validate: (i) => (S.party[i].hp > 0 && S.party.filter((x) => x.hp > 0).length <= 1 ? 'たたかえる 子が いなくなってしまうよ!' : null) });
      if (j < 0) continue;
      const m = S.party.splice(j, 1)[0]; S.box.push(m); Aud.sfx('ok'); await say(`${nameOf(m)}を ボックスに あずけた。`);
    } else return;
  }
}
// 先頭のモンスターに話しかける: なかよし度で反応が変わる
async function petFollower(m) {
  Aud.cry(m.sp);
  world.emote = { t0: clock }; Aud.sfx('heal');
  const n = nameOf(m), lv = bondLv(m);
  const L = [
    [`${n}は じっと こちらを みている。`, 'まだ、ようすを みているようだ…。'],
    [`${n}は 足もとに すこし だけ よってきた。`],
    [`${n}は うれしそうに、ゆらゆらと からだを ゆらした。`],
    [`${n}が、あなたの 手に ぴったり よりそってきた ♥`],
    [`${n}は あなたを まっすぐ みて、やさしく めを とじた ♥`, 'いっしょに いられて うれしい、と いっているようだ。'],
  ][lv];
  for (const l of L) await say(l);
  if (!m.petAt || S.time - m.petAt > 60) { m.petAt = S.time; addBond(m, 1); }
}
// めやす: いま どこへ むかえば いいか
function goalInfo() {
  const F = S.flags, maxLv = Math.max(...S.party.map((m) => m.lv), 1);
  let goal, rec;
  if (!F.beat_rival) { goal = '東の「ひなた草原」へ。草むらで 仲間を あつめながら、道の トレーナーに ちょうせんしよう。'; rec = 7; }
  else if (!F.lit_town) { goal = '草原の ゲートを ぬけて「ひだまり町」へ。あかり番の レンに かつと、町の 街灯が ともるよ。'; rec = 11; }
  else if (!F.lit_town2) { goal = '「ひだまり町」の 東の 出口から「でんせん街道」へ。さきの「ミドリ団地」で、あかり番の ナナに ちょうせんしよう。'; rec = 15; }
  else if (!F.lit_town3) { goal = '「ミドリ団地」の 東へ すすんで「しおかぜ街道」へ。「ナギサ港」の 灯台守 ゴロウに ちょうせんしよう。'; rec = 20; }
  else if (F.minato_mountain) { goal = 'ミナトを 追って、山の町「ヤマノハ」へ。番人が まっている。\n(第四章は じゅんびちゅう。ずかんを うめて まっていてね)'; rec = 99; }
  else { goal = '3つの あかりが ともった。ずかんを うめながら、旅を つづけよう。(つづく…)'; rec = 99; }
  const hurt = S.party.some((m) => m.hp <= 0), hints = [];
  if (hurt) hints.push('ひんしの 子が いるよ。診療所や 休憩所で やすませよう。');
  if ((S.bag.potion || 0) <= 0 && F.beat_rival) hints.push('きずぐすりが ない。町の おみせで かえるよ。');
  if (maxLv < rec) hints.push('レベルが ひくいと きびしいかも。草むらで たたかって きたえよう。');
  if (dexCount() < SPECIES_ORDER.length) hints.push(`ずかんは ${dexCount()} / ${SPECIES_ORDER.length}。あかりを ともすと、草むらに 新しい 子が あつまるよ。`);
  return { goal, hint: hints[0] || '' };
}
async function goalScreen() {
  const { goal, hint } = goalInfo(); await say(`【いまの めやす】\n${goal}`); if (hint) await say(`ヒント: ${hint}`);
  const act = Object.entries(QUESTS).filter(([k]) => (S.quests || {})[k] === 1);
  if (act.length) await say(`【お願いごと】\n${act.map(([, q]) => `・${q.title}(${q.condText}${q.cond() ? ' ✓' : ''})`).join('\n')}`);
}
// セーブデータを消して、さいしょから
// ---------- セーブの うつしかえ(コードを コピー・ペースト) ----------
function encodeSave() { return 'SW1:' + btoa(unescape(encodeURIComponent(JSON.stringify(S)))); }
function decodeSave(code) {
  // 改行・空白・全角の文字が まじっても、前後に ほかの文が あっても 読めるようにする
  const t = String(code || '').normalize('NFKC').replace(/[\s\u200B-\u200D\u2060\uFEFF]+/g, '');
  if (!t) throw new Error('なにも はりつけられていないよ。「はりつける」を おしてね。');
  const i = t.toUpperCase().indexOf('SW1:');
  if (i < 0) throw new Error(`セーブの コードでは ないみたい(はじめが「${t.slice(0, 14)}」)。コードは「SW1:」で はじまるよ。`);
  const body = t.slice(i + 4).match(/^[A-Za-z0-9+/]*={0,2}/)[0];
  let d; try { d = JSON.parse(decodeURIComponent(escape(atob(body)))); } catch (e) { throw new Error(`コードが とちゅうで きれているみたい(${body.length}もじ)。もういちど ぜんぶ コピーしてね。`); }
  if (!d || !Array.isArray(d.party) || !d.party.length) throw new Error('なかまが いない セーブデータだよ。ぼうけんを はじめてから かきだしてね。');
  return d;
}
function transferWindow(mode, code) {
  return new Promise((resolve) => {
    const box = document.getElementById('xfer'), ta = document.getElementById('xta'), msg = document.getElementById('xmsg'), cp = document.getElementById('xcopy'), ok = document.getElementById('xok'), cl = document.getElementById('xclose'), ps = document.getElementById('xpaste');
    document.getElementById('xtitle').textContent = mode === 'out' ? '下の コードを コピーして、メモなどに とっておいてね。ほかの 場所では「セーブを よみこむ」で つかえるよ。' : '「かきだし」で コピーした コードを、「はりつける」で 入れて、「よみこむ」を おしてね。';
    ta.value = code || ''; ta.readOnly = mode === 'out'; msg.textContent = ''; cp.style.display = mode === 'out' ? '' : 'none'; ok.style.display = ps.style.display = mode === 'in' ? '' : 'none';
    if (mode === 'out') msg.textContent = `ぜんぶで ${ta.value.length}もじ`;
    box.classList.remove('hidden'); setTimeout(() => { if (mode === 'out') { ta.focus(); ta.select(); } }, 50);
    const done = (v) => { box.classList.add('hidden'); cp.onclick = ok.onclick = cl.onclick = ps.onclick = null; resolve(v); };
    ps.onclick = async () => { // iPhoneでは 小さな「ペースト」が 出るので、それを おす
      try { const t = await navigator.clipboard.readText(); if (!t) throw new Error('empty'); ta.value = t; msg.textContent = `${t.trim().length}もじ はりつけたよ。「よみこむ」を おしてね。`; }
      catch (e) { ta.focus(); msg.textContent = 'はりつけられなかった。上の 欄を ながおしして「ペースト」を えらんでね。'; }
    };
    cp.onclick = async () => { try { await navigator.clipboard.writeText(ta.value); msg.textContent = `コピーしたよ!(${ta.value.length}もじ)`; } catch (e) { ta.focus(); ta.select(); msg.textContent = 'うまく コピーできない。コードを ながおしして コピーしてね。'; } };
    ok.onclick = () => { try { const d = decodeSave(ta.value); try { localStorage.setItem(SAVE_KEY, JSON.stringify(d)); } catch (e) { throw new Error('この ブラウザには ほぞんできない'); } msg.textContent = 'よみこんだよ! はじめから やりなおすよ…'; setTimeout(() => location.reload(), 700); } catch (e) { msg.textContent = e.message || 'よみこめなかった'; } };
    cl.onclick = () => done(false);
  });
}
async function transferMenu() {
  for (;;) {
    const c = await choose(['セーブを かきだす', 'セーブを よみこむ', 'もどる'], { x: W - 256, y: 60, w: 244, title: 'セーブの うつしかえ', cancel: -1 });
    if (c === 0) { save(); await transferWindow('out', encodeSave()); }
    else if (c === 1) { await say('よみこむと、いまの セーブは きえて、とりこんだ ものに おきかわるよ。'); await transferWindow('in', ''); }
    else return;
  }
}
async function resetGame() {
  await say('いまの セーブデータを けして、さいしょから やりなおす?\nけしたデータは もどせないよ。');
  const c = await choose(['やめておく', 'けして さいしょから'], { x: 400, y: 120, w: 220, cancel: 0 });
  if (c !== 1) return;
  const c2 = await choose(['やっぱり やめる', 'ほんとうに けす'], { x: 400, y: 120, w: 220, title: 'ほんとうに いい?', cancel: 0 });
  if (c2 !== 1) return;
  try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
  ui.dialog = null; location.reload();
}
async function openMenu() {
  Aud.sfx('ok');
  for (;;) {
    const items = ['めやす', 'ずかん', 'なかま', { label: 'ボックス', sub: S.box.length ? `${S.box.length}ひき` : '' }, 'バッグ', 'セーブ', 'せってい', 'とじる'];
    if (TOWNS.some((t) => S.flags['mem_' + t])) items.splice(2, 0, 'きおく');
    const c = await choose(items, { x: W - 196, y: 34, w: 184, rowH: items.length > 8 ? 28 : 30, title: `ずかん ${dexCount()}/${SPECIES_ORDER.length}  ${S.money || 0}コイン`, cancel: -1 });
    if (c < 0) return;
    const lab = typeof items[c] === 'string' ? items[c] : items[c].label;
    if (lab === 'めやす') await goalScreen();
    else if (lab === 'ずかん') await dexScreen();
    else if (lab === 'きおく') { const seen = TOWNS.filter((t) => S.flags['mem_' + t]); const k = await choose(seen.map((t) => MEMORIES[t].title).concat(['もどる']), { x: W - 336, y: 60, w: 324, title: 'あつめた きおく', cancel: -1 }); if (k >= 0 && k < seen.length) await memoryScene(seen[k]); }
    else if (lab === 'なかま') await partyScreen();
    else if (lab === 'ボックス') await boxMenu();
    else if (lab === 'バッグ') {
      const r = await bagScreen({});
      if (r === 'potion') {
        const t = await partyScreen({ title: 'だれに つかう?', validate: (i) => (S.party[i].hp <= 0 ? 'ひんしの 子には つかえない!' : S.party[i].hp >= S.party[i].max ? 'HPは まんたんだよ!' : null) });
        if (t >= 0) { const m = S.party[t]; m.hp = Math.min(m.max, m.hp + ITEMS.potion.heal); S.bag.potion--; Aud.sfx('heal'); addBond(m, 3); await say(`${nameOf(m)}の HPが かいふくした!`); }
      }
    } else if (lab === 'セーブ') { Aud.sfx(save() ? 'get' : 'back'); await say(hasSave() ? 'ここまでの ぼうけんを セーブしました!' : 'セーブできませんでした…'); }
    else if (lab === 'せってい') {
      for (;;) {
        const names = { 0.7: 'ゆっくり', 1: 'ふつう', 1.9: 'はやい' }, bn = { 1: 'ふつう', 1.7: 'はやい', 2.6: 'とてもはやい' };
        const k = await choose([{ label: 'おと', sub: Aud.muted ? 'なし' : 'あり' }, { label: 'もじの はやさ', sub: names[tspd] || 'ふつう' }, { label: 'バトルの はやさ', sub: bn[bspd] || 'ふつう' }, { label: 'むずかしさ', sub: DIFF[diff].n }, { label: 'えんしゅつ', sub: manualGrade ? ['なし', 'かるい', 'ふつう'][gradeLevel] : `じどう(${['なし', 'かるい', 'ふつう'][gradeLevel]})` }, { label: 'オートセーブ', sub: 'あり' }, { label: 'セーブの うつしかえ', sub: '' }, { label: 'クレジット', sub: '' }, { label: 'さいしょから やりなおす', sub: '' }, 'もどる'], { x: W - 256, y: 8, w: 244, title: 'せってい', cancel: -1, rowH: 28 });
        if (k === 0) Aud.setMute(!Aud.muted);
        else if (k === 1) { tspd = tspd === 1 ? 1.9 : tspd === 1.9 ? 0.7 : 1; saveOpts(); }
        else if (k === 2) { bspd = bspd === 1 ? 1.7 : bspd === 1.7 ? 2.6 : 1; saveOpts(); }
        else if (k === 3) { diff = (diff + 1) % 3; saveOpts(); }
        else if (k === 4) { manualGrade = true; gradeLevel = gradeLevel === 2 ? 1 : gradeLevel === 1 ? 0 : 2; saveOpts(); }
        else if (k === 5) await say('バトルの あと、町の あかりを ともしたあと、アイテムを ひろったあと、じどうで セーブされるよ。');
        else if (k === 6) await transferMenu();
        else if (k === 7) await sayAll(['シャープワールド(仮)', 'えは、AIで つくった えを もとに しています。\nおんがくと こうかおんは、ゲームの なかで ごうせい しています。', 'しょたいは「Zen Kaku Gothic New」(SIL Open Font License)です。'] );
        else if (k === 8) await resetGame();
        else break;
      }
    } else return;
  }
}

// ---------- タイトル・エンディング ----------
// オープニングと タイトルの絵(assets/op_*.webp。作り方は brand/ フォルダ)
const OP = {}, OP_IDS = ['op_1', 'op_2', 'op_3', 'op_4', 'op_5', 'op_logo', 'op_title'];
let opLoad = null;
function loadOp() {
  return opLoad || (opLoad = Promise.all(OP_IDS.map((id) => new Promise((r) => {
    const im = new Image(); im.onload = () => { OP[id] = im; r(); }; im.onerror = () => r();
    im.src = (window.ART_SRC && window.ART_SRC[id]) || `assets/${id}.webp`;
  }))));
}
// コマが 左から順に 上・下・右・上・下 から出てきて、そろったら 題字が すっと出る
const OP_CUT = [241, 457, 783, 1011].map((v) => v / 1200), OP_SLANT = 34, OP_IN = ['t', 'b', 'r', 't', 'b'];
const OP_T0 = 0.35, OP_STEP = 0.5, OP_DUR = 0.46, OP_TITLE = 3.15, OP_END = 5.9;
const easeOut = (k) => 1 - Math.pow(1 - k, 3);
const calmMotion = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
let opT = 0, opLanded = 0;
// いちばん最初の画面。ここで タップしてもらうと、音が 出せるようになる
let startAt = 0, startFlare = 0;
function drawStart() {
  const t = clock - startAt, cx = VW / 2, cy = 142, pulse = 0.5 + 0.5 * Math.sin(t * 1.8);
  g.fillStyle = '#0f1128'; g.fillRect(0, 0, VW, H);
  for (let i = 0; i < 34; i++) { const a = 0.25 + 0.55 * Math.abs(Math.sin(t * (0.5 + (i % 5) * 0.17) + i * 1.9)); const hs = (n) => { const v = Math.sin(n * 91.7 + 3.1) * 43758.5; return v - Math.floor(v); }; Art.star(g, hs(i) * VW, 10 + hs(i + 50) * 320, 0.9 + (i % 3) * 0.5, `rgba(255,244,214,${a * 0.7})`); }
  const r = 120 + pulse * 18 + startFlare * 420, gr = g.createRadialGradient(cx, cy, 2, cx, cy, r);
  gr.addColorStop(0, `rgba(255,224,164,${0.75 + startFlare * 0.25})`); gr.addColorStop(0.3, `rgba(255,170,100,${0.26 + pulse * 0.1 + startFlare * 0.4})`); gr.addColorStop(1, 'rgba(255,150,90,0)');
  g.fillStyle = gr; g.fillRect(0, 0, VW, H);
  g.fillStyle = '#fff6d6'; g.beginPath(); g.arc(cx, cy, 9 + pulse * 1.5 + startFlare * 10, 0, Math.PI * 2); g.fill();
  g.globalAlpha = clamp(t / 0.8, 0, 1) * (1 - startFlare);
  g.save(); g.globalAlpha *= 0.55 + 0.45 * pulse; txt('タップして はじめる', cx, 252, { size: 22, w: 900, align: 'center', color: '#fbf0da', stroke: '#141028', sw: 6 }); g.restore();
  txt(Aud.muted ? '(おとは 「せってい」で オフに なっています)' : '♪ おとが でます', cx, 284, { size: 12, align: 'center', color: '#c9bdd8' });
  g.globalAlpha = 1;
}
async function startScreen() {
  mode = 'start'; startAt = clock; startFlare = 0;
  await new Promise((resolve) => { // pointerdown では iPhoneが 音を 許さないので、指を はなした瞬間で すすむ
    const evs = ['pointerup', 'touchend', 'click', 'keydown'];
    const go = () => { evs.forEach((ev) => removeEventListener(ev, go, true)); Aud.unlock(); resolve(); };
    evs.forEach((ev) => addEventListener(ev, go, true));
  });
  Aud.sfx('opStart'); await anim(0.55, (k) => { startFlare = k * k; }); await fade(1, 0.25, '#191527');
  mode = 'opening'; opT = 1e9; ui.fade = 0;
}
function drawOpening() {
  const t = clock - opT;
  g.fillStyle = '#191527'; g.fillRect(0, 0, VW, H);
  if (t < 0) return;
  for (let i = 0; i < 5; i++) {
    const k = clamp((t - OP_T0 - i * OP_STEP) / OP_DUR, 0, 1); if (k <= 0) continue;
    const e = easeOut(k), calm = calmMotion.matches;
    const lt = i ? OP_CUT[i - 1] * VW : -6, rt = i < 4 ? OP_CUT[i] * VW : VW + 6, lb = i ? lt - OP_SLANT : -6, rb = i < 4 ? rt - OP_SLANT : VW + 6;
    if (k >= 1 && opLanded <= i) { opLanded = i + 1; if (!calm) ui.shake = 3; }
    let dx = 0, dy = 0;
    if (!calm) { if (OP_IN[i] === 't') dy = -(1 - e) * (H + 12); else if (OP_IN[i] === 'b') dy = (1 - e) * (H + 12); else dx = (1 - e) * (VW - lb); }
    g.save(); if (calm) g.globalAlpha = e; g.translate(dx, dy);
    const shape = () => { g.beginPath(); g.moveTo(lt, -6); g.lineTo(rt, -6); g.lineTo(rb, H + 6); g.lineTo(lb, H + 6); g.closePath(); };
    g.save(); shape(); g.clip(); g.drawImage(OP['op_' + (i + 1)], (lt + rt + lb + rb) / 4 - 155, -6, 310, H + 12); g.restore();
    shape(); g.lineWidth = 5; g.strokeStyle = '#f2e6d2'; g.stroke();
    g.restore();
  }
  const k = clamp((t - OP_TITLE) / 0.6, 0, 1);
  if (k > 0) {
    const e = easeOut(k), k2 = easeOut(clamp((t - OP_TITLE - 0.18) / 0.7, 0, 1));
    g.save(); g.translate(VW / 2, 294); g.rotate(-4 * Math.PI / 180); g.globalAlpha = e;
    const bx = -VW / 2 - 60 - (1 - e) * (calmMotion.matches ? 0 : VW);
    g.fillStyle = 'rgba(34,27,52,.94)'; g.fillRect(bx, -43, VW + 120, 87); g.fillStyle = '#c25a62'; g.fillRect(bx, 44, VW + 120, 6);
    g.globalAlpha = k2; g.drawImage(OP.op_logo, -275 - (calmMotion.matches ? 0 : (1 - k2) * 70), -47, 550, 95);
    g.restore();
  }
  if (t > 0.8) txt('タップで スキップ', VW - 14, 15, { size: 11, align: 'right', color: '#f7f5f1', stroke: 'rgba(25,21,39,.8)', sw: 4 });
}
async function openingScene() {
  mode = 'opening'; opT = clock + 1e9; opLanded = 0; Aud.bgm(null); // 絵が そろうまでは まっくら
  await Promise.race([loadOp(), sleep(5)]);
  if (!OP_IDS.every((id) => OP[id])) { mode = 'title'; return; } // 絵が 読めないときは とばす
  opT = clock; flushBtn(); let skipped = false, panels = 0, titled = false;
  while (clock - opT < OP_END) {
    await nextFrame(); if (btnQ.length) { btnQ.length = 0; skipped = true; break; }
    const t = clock - opT; // 絵の動きに あわせて 音を 鳴らす
    if (panels < 5 && t >= OP_T0 + panels * OP_STEP) Aud.sfx('opPanel', panels++);
    if (!titled && t >= OP_TITLE) { titled = true; Aud.sfx('opTitle'); }
  }
  await fade(1, skipped ? 0.25 : 0.7, '#000'); // 暗転
  mode = 'title'; await sleep(skipped ? 0.1 : 0.3); flushBtn(); fade(0, 0.8);
}
function drawTitle() {
  const x = (VW - 864) / 2;
  g.fillStyle = '#10142e'; g.fillRect(0, 0, VW, H);
  if (!OP.op_title) { txt('シャープワールド', VW / 2, 120, { size: 46, w: 900, align: 'center', color: '#fbf0da', stroke: '#141028', sw: 9 }); return; }
  g.drawImage(OP.op_title, x, 0, 864, H);
  // 街灯と 耳の あかりが ゆらぎ、星が またたく
  g.save(); g.globalCompositeOperation = 'screen';
  const light = (lx, ly, r, a) => { const gr = g.createRadialGradient(lx, ly, 1, lx, ly, r); gr.addColorStop(0, `rgba(255,205,140,${a})`); gr.addColorStop(1, 'rgba(255,180,110,0)'); g.fillStyle = gr; g.fillRect(lx - r, ly - r, r * 2, r * 2); };
  light(x + 432, 118, 74, 0.2 + 0.1 * Math.sin(clock * 1.7) + 0.04 * Math.sin(clock * 7.3));
  light(x + 583, 162, 27, 0.22 + 0.18 * Math.sin(clock * 2.3)); light(x + 613, 162, 27, 0.22 + 0.18 * Math.sin(clock * 2.3 + 0.9));
  g.restore();
  for (let i = 0; i < 16; i++) { const a = Math.max(0, Math.sin(clock * (0.9 + (i % 4) * 0.3) + i * 2.1)); Art.star(g, (i * 167 + 31) % VW, 14 + (i * 47) % 150, 1.2 + (i % 3) * 0.6, `rgba(255,244,214,${a * 0.8})`); }
}
let endT = 0;
async function endingScene() {
  Aud.sfx('win'); await fade(1, 0.8, '#10202a'); mode = 'ending'; endT = clock; ui.dialog = null; flushBtn(); await fade(0, 0.8);
  await sleep(4.5); await say('ミナトは、山へ むかった。\n番人と、まだ 見ぬ 灯守りが、きみを まっている――。', { w: 616 });
  await sleep(0.3); flushBtn(); await nextBtn();
  await fade(1, 0.6); mode = 'title'; Aud.bgm('title'); await fade(0, 0.5); await titleScreen();
}
function drawEnding() {
  const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#1d2f4d'); sky.addColorStop(0.6, '#5b5a8f'); sky.addColorStop(1, '#f2a67c'); g.fillStyle = sky; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 40; i++) { const tw = 0.4 + 0.6 * Math.abs(Math.sin(clock * 1.3 + i)); Art.star(g, (i * 97) % 640, (i * 53) % 190, 2 + (i % 3), `rgba(255,248,210,${tw})`); }
  g.fillStyle = '#3d6a56'; g.beginPath(); g.ellipse(160, 330, 360, 100, 0, 0, 7); g.ellipse(520, 338, 380, 106, 0, 0, 7); g.fill();
  const t = clock - endT, a = clamp(t / 1.5, 0, 1);
  const hb = Art.portrait('hero_back'), hh = 208, hw = hb.width * hh / hb.height; g.globalAlpha = a; g.drawImage(hb, 16, 300 - hh, hw, hh); g.globalAlpha = 1;
  S.party.slice(0, 6).forEach((m, i) => { const x = 230 + i * 70, bob = Math.abs(Math.sin(clock * 2 + i)) * 7; g.globalAlpha = a; g.drawImage(Art.sprites[m.sp], x - 34, 274 - 70 - bob, 68, 68); g.globalAlpha = 1; });
  g.globalAlpha = a; txt('シャープワールド', 320, 74, { size: 40, w: 900, align: 'center', color: '#fff6dc', stroke: 'rgba(40,30,60,.6)', sw: 8 });
  txt('つづく…', 320, 124, { size: 26, w: 900, align: 'center', color: '#ffd36b', stroke: 'rgba(40,30,60,.6)', sw: 6 });
  const min = Math.floor(S.time / 60);
  txt(`ずかん ${dexCount()} / ${SPECIES_ORDER.length}      あるいた ほすう ${S.steps}      プレイ ${min}ぷん`, 320, 176, { size: 15, align: 'center', color: '#fff', stroke: 'rgba(40,30,60,.55)', sw: 5 });
  g.globalAlpha = 1;
}
async function newGame() {
  S = newState(); await fade(1, 0.4); mode = 'field'; enterMap('village', 6, 8, 'd', true); await chapterOnArrive('village'); ui.banner = null; await fade(0, 0.5);
  await event(async () => {
    await sleep(0.4); await say('……ぴよぴよ。\nひなた村の、のんびりした あさ。');
    await cutin(Art.portrait('hero'), 'たびびと', 'ひなた村の あさ。\nひとりで、旅に でる。');
    const e = world.npcs.find((n) => n.id === 'elder'); e.dir = 'l'; world.p.dir = 'r';
    await sayAll(['おお、きたな! まっておったぞ。', 'この 草原には、もふもふの モンスターたちが のんびり くらしておる。', 'ぼうけんには、いっしょに あるく なかまが ひつようじゃ。さあ、この子を つれていきなさい。']);
    Aud.sfx('get'); { const mk = mkMon('mikanya', 5); mk.bond = 20; S.party.push(mk); } markSeen('mikanya'); S.caught.mikanya = true;
    placeFollower('l'); // 主人公の 左どなりに 出す(重ならないように)
    setTimeout(() => Aud.cry('mikanya'), 450);
    clearSpeaker(); Aud.sfx('caught'); await cutin(Art.sprites.mikanya, SPECIES.mikanya.n, SPECIES.mikanya.dex); // 大きく 紹介
    S.dexShown = { ...(S.dexShown || {}), mikanya: true };
    await say('ミカニャを なかまに した!');
    await sayAll(['しっぽの はっぱが じまんの、ひなたぼっこ だいすきな 子じゃ。なかよく してやっておくれ。', 'まずは 東の ひなた草原へ いってみなさい。\n草むらでは、とつぜん モンスターが とびだすぞ!', 'Aで はなす・けってい、Bで もどる・ダッシュ。\nメニューで ずかんや バッグを ひらけるぞ。']);
    await sayAll(['そうじゃ。旅の とちゅうで、町の あかりを 見かけたら、\n気に かけて やって おくれ。', 'いつか 山の ほうへ 行くことが あったら…\nいや、その 話は、また こんどに しよう。']);
    ui.banner = { text: world.map.name, t0: clock }; bondEvents.push('めやす: 東の「ひなた草原」へ(メニューの めやす でも みられるよ)');
  });
}
async function continueGame() {
  for (const x of [9, 36]) if (S.flags[`spot_town3_${x}_15`]) S.flags[`spot_town3_${x}_14`] = true; // 光る場所を 岸へ 移した
  if (S.flags.granny && !S.flags.rod) { S.flags.rod = true; bondEvents.push('おばあさんの つりざおが みつかった! みずべで Aを おそう'); }
  await fade(1, 0.4); mode = 'field'; enterMap(S.map, S.x, S.y, S.dir, true); ui.banner = { text: world.map.name, t0: clock }; await fade(0, 0.5); await storyCatchUp(S.map);
}
async function titleScreen() {
  mode = 'title'; busy = false; Aud.bgm('title');
  for (;;) {
    const c = await choose(['はじめから', { label: 'つづきから', off: !hasSave() }, 'セーブを よみこむ'], { x: 50, y: 293, w: 540, cols: 3, cancel: false }); // 下端は iPhoneの線の ぶん あける
    if (c === 0) { await newGame(); return; }
    if (c === 1 && loadSave()) { await continueGame(); return; }
    if (c === 2) await transferWindow('in', '');
  }
}

// ---------- 起動 ----------
let lastT = 0;
let ema = 0.016, slowN = 0;
function loop(t) {
  const raw = (t - lastT) / 1000, dt = Math.min(0.05, raw); lastT = t;
  // 重い端末では、画面の演出を自動でかるくする(手動で選んだときは そのまま)
  if (!manualGrade && (mode === 'field' || mode === 'battle')) { ema = ema * 0.96 + Math.min(raw, 0.2) * 0.04; if (ema > 0.036 && gradeLevel > 0) { if (++slowN > 90) { gradeLevel--; slowN = 0; ema = 0.025; } } else slowN = 0; }
  tick(dt); requestAnimationFrame(loop);
}
(async () => {
  resize(); loadOp();
  try { await Promise.race([document.fonts.load('700 16px "Zen Kaku Gothic New"'), new Promise((r) => setTimeout(r, 1500))]); } catch (e) {}
  try { const o = JSON.parse(localStorage.getItem('mofu.opts') || '{}'); if (o.gl != null) { gradeLevel = o.gl; manualGrade = true; } } catch (e) {}
  await Art.init(window.ART_SRC || { mikanya: 'assets/mikanya.webp', pukurisu: 'assets/pukurisu.webp', hotaruusagi: 'assets/hotaruusagi.webp', kinokokko: 'assets/kinokokko.webp', hinatagaeru: 'assets/hinatagaeru.webp', shizukufin: 'assets/shizukufin.webp', p_hero: 'assets/p_hero.webp', p_hero_back: 'assets/p_hero_back.webp' });
  { const m = /[?&]oto=(now|[a-e])(?:&|$)/.exec(location.search); if (m) Aud.setTheme(m[1]); } // 音の候補の ためしぎき
  mode = 'start'; startAt = 0; lastT = performance.now(); requestAnimationFrame(loop);
  await startScreen();
  if (/[?&]battle=1(?:&|$)/.test(location.search)) { await battlePreview(); return; }
  const kioku = /[?&]kioku=(all|[1-3])(?:&|$)/.exec(location.search);
  if (kioku) { await storyPreview(kioku[1]); return; }
  const chap = /[?&]chapter=(all|[0-3])(?:&|$)/.exec(location.search);
  if (chap) { await chapterPreview(chap[1]); return; }
  const akari = /[?&]akari=(town[23]?)(?:&|$)/.exec(location.search);
  if (akari) { await lightPreview(akari[1]); return; }
  await openingScene(); await titleScreen();
})();

if (/[?&]debug/.test(location.search) && /^(localhost|127\.|\[::1\])/.test(location.hostname)) { // 開発用(自分のパソコンでだけ)
  window.__m = {
    get S() { return S; }, world, get bt() { return bt; }, get mode() { return mode; }, get busy() { return busy; }, ui, tick, press: pushBtn, mkMon,
    async advance(sec) { const n = Math.round(sec * 60); for (let i = 0; i < n; i++) { tick(1 / 60); for (let j = 0; j < 12; j++) await null; } },
    grade(v) { gradeOn = v; }, warm(v) { warmDbg = v; },
    grid(v) { showGrid = v; },
    openingScene, Aud, cutin, setSpeaker, say, event, lightTown, boxMenu, addBond, bondLv, petFollower, goalInfo, questTalk, goFishing, learnMove, evolveCheck, movesOf, relearnable,
    hold(d) { dirStack.length = 0; if (d) dirStack.push(d); },
    warp(id, x, y, dir) { enterMap(id, x, y, dir || 'r', true); },
    encounter(sp, lv, sh) { event(async () => { await flashFx(1); await fade(1, 0.2, '#000'); const foe = mkMon(sp, lv); if (sh) foe.shiny = true; const r = await runBattle({ foes: [foe] }); await afterBattle(r); }); },
    rival() { event(() => trainerBattle(world.npcs.find((n) => n.id === 'rival'))); },
  };
}
