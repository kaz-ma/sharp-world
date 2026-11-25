'use strict';
// 章の扉絵: 旅の はじまり(序章)と、町に はじめて 着いたとき。絵は assets/ch<番号>_bg/fg/tx.webp(作り方は brand/)
const CHAPTERS = { village: 0, town: 1, town2: 2, town3: 3, town4: 4 };
const chapterArt = {};
function loadChapter(i) {
  if (!chapterArt[i]) {
    const c = (chapterArt[i] = {});
    c.ready = Promise.all(['bg', 'fg', 'tx'].map((k) => new Promise((r) => {
      const im = new Image(), id = `ch${i}_${k}`; im.onload = () => { c[k] = im; r(); }; im.onerror = () => { delete chapterArt[i]; r(); };
      im.src = (window.ART_SRC && window.ART_SRC[id]) || `assets/${id}.webp`;
    })));
  }
  return chapterArt[i];
}
// 背景は ゆっくり寄り、人物は 右から、題字は 左から。上下に 映画のような 帯
function drawChapter(c, t) {
  const e = (d, dur) => 1 - Math.pow(1 - clamp((t - d) / dur, 0, 1), 3), calm = calmMotion.matches;
  g.fillStyle = '#121026'; g.fillRect(-OX, 0, VW, H);
  const z = calm ? 1 : 1.08 - 0.07 * clamp(t / 5, 0, 1), w = 864 * z, h = H * z;
  g.save(); g.globalAlpha = e(0, 0.7); g.drawImage(c.bg, W / 2 - w / 2, H / 2 - h / 2, w, h);
  g.globalAlpha = e(0.3, 0.5); g.drawImage(c.fg, W / 2 - 432 + (calm ? 0 : (1 - e(0.3, 0.9)) * 190 - t * 3), 0, 864, H);
  g.globalAlpha = e(1.05, 0.6); g.drawImage(c.tx, Math.max(8 - OX, W / 2 - 300) - (calm ? 0 : (1 - e(1.05, 0.75)) * 110), 96, 450, 165);
  g.restore();
  const bar = 30 * e(0, 0.5); g.fillStyle = '#0d0b1c'; g.fillRect(-OX, 0, VW, bar); g.fillRect(-OX, H - bar, VW, bar);
  g.fillStyle = '#c25a62'; g.fillRect(-OX, bar, VW * e(0.15, 0.8), 2); g.fillRect(-OX + VW * (1 - e(0.15, 0.8)), H - bar - 2, VW * e(0.15, 0.8), 2);
  if (t > 1.8) txt('タップで すすむ', W + OX - 14, H - 14, { size: 11, align: 'right', color: '#d9cde4' });
}
// 暗いままの 画面から 始まり、暗いまま 終わる(呼んだ側で あける)
async function showChapter(i) {
  const c = loadChapter(i); await Promise.race([c.ready, sleep(4)]);
  if (!c.bg || !c.fg || !c.tx) return false; // 絵が 読めないときは とばす
  const wasBusy = busy; busy = true; Aud.bgm(null); clearSpeaker(); ui.spkOut = null; ui.banner = null; ui.dialog = null;
  const t0 = clock; ui.overlay = () => drawChapter(c, clock - t0); flushBtn(); fade(0, 0.5);
  let s1 = false, s2 = false;
  while (clock - t0 < 5.0) {
    await nextFrame(); const t = clock - t0;
    if (!s1 && t > 0.3) { s1 = true; Aud.sfx('opPanel', 2); }
    if (!s2 && t > 1.1) { s2 = true; Aud.sfx('opTitle'); }
    if (btnQ.length) { btnQ.length = 0; if (t > 0.9) break; }
  }
  await fade(1, 0.5, '#0d0b1c'); ui.overlay = null; busy = wasBusy; flushBtn(); return true;
}
// まだ 見ていない 町なら、扉絵を出す
async function chapterOnArrive(id) {
  if (CHAPTERS[id] == null || S.flags['ch_' + id]) return;
  if (await showChapter(CHAPTERS[id])) { S.flags['ch_' + id] = true; Aud.bgm(world.map.bgm); ui.banner = { text: world.map.name, t0: clock + 0.3 }; }
}
// おためし(?chapter=all か 0〜3): 扉絵だけ 見る。セーブは 書きかえない
async function chapterPreview(which) {
  preview = true; await fade(1, 0.3, '#0d0b1c'); mode = 'field';
  for (const i of which === 'all' ? [0, 1, 2, 3, 4] : [+which]) await showChapter(i);
  location.href = location.pathname;
}
