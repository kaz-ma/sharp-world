// 音(すべてその場で合成。効果音とBGM2曲、どれもオリジナル)
const Aud = (() => {
  let warm = 0, ctx = null, master = null, noiseBuf = null, muted = false, timer = null, cur = null, step = 0, nextT = 0;
  try { muted = localStorage.getItem('mofu.mute') === '1'; } catch (e) {}
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

  function ensure() {
    if (!ctx) {
      try {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        master = ctx.createGain(); master.gain.value = muted ? 0 : 0.5; master.connect(ctx.destination);
        noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
        const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      } catch (e) { ctx = null; }
    }
    if (ctx && ctx.state !== 'running') { const p = ctx.resume(); if (p && p.catch) p.catch(() => {}); } // iPhoneは 別のアプリから もどると とまる
    return ctx;
  }
  function tone(f, t0, dur, type = 'sine', vol = 0.18, f2 = null, dest = null) {
    if (!ctx) return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t0); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(dest || master); o.start(t0); o.stop(t0 + dur + 0.05);
  }
  function noise(t0, dur, vol = 0.2, fc = 1800) {
    if (!ctx) return;
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf; f.type = 'lowpass'; f.frequency.setValueAtTime(fc, t0); f.frequency.exponentialRampToValueAtTime(200, t0 + dur);
    g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    s.connect(f); f.connect(g); g.connect(master); s.start(t0); s.stop(t0 + dur + 0.05);
  }
  const arp = (notes, gap, type = 'triangle', vol = 0.16, len = 0.18) => { const t = ctx.currentTime; notes.forEach((n, i) => tone(mtof(n), t + i * gap, len, type, vol)); };
  const SFX = {
    step: () => noise(ctx.currentTime, 0.05, 0.035, 900),
    rustle: () => noise(ctx.currentTime, 0.1, 0.07, 3000),
    select: () => tone(880, ctx.currentTime, 0.06, 'square', 0.06),
    ok: () => { const t = ctx.currentTime; tone(660, t, 0.07, 'square', 0.07); tone(990, t + 0.06, 0.1, 'square', 0.07); },
    back: () => tone(520, ctx.currentTime, 0.09, 'square', 0.06, 330),
    text: () => tone(1400 + Math.random() * 200, ctx.currentTime, 0.025, 'square', 0.025),
    hit: () => { const t = ctx.currentTime; noise(t, 0.16, 0.3, 2400); tone(160, t, 0.14, 'sine', 0.3, 60); },
    super: () => { const t = ctx.currentTime; noise(t, 0.2, 0.35, 3200); tone(200, t, 0.2, 'sine', 0.35, 60); tone(1200, t + 0.05, 0.18, 'triangle', 0.1, 1800); },
    weak: () => { const t = ctx.currentTime; noise(t, 0.1, 0.15, 900); tone(140, t, 0.1, 'sine', 0.18, 90); },
    miss: () => tone(700, ctx.currentTime, 0.2, 'sine', 0.08, 300),
    faint: () => tone(520, ctx.currentTime, 0.7, 'triangle', 0.2, 80),
    throw: () => { const t = ctx.currentTime; noise(t, 0.3, 0.1, 3000); tone(400, t, 0.35, 'sine', 0.1, 900); },
    shake: () => { const t = ctx.currentTime; tone(300, t, 0.05, 'square', 0.1); tone(220, t + 0.04, 0.08, 'square', 0.08); },
    caught: () => arp([72, 76, 79, 84, 79, 84, 88], 0.11, 'triangle', 0.2, 0.3),
    escape: () => tone(500, ctx.currentTime, 0.25, 'sawtooth', 0.08, 120),
    levelup: () => arp([67, 72, 76, 79, 84], 0.09, 'triangle', 0.2, 0.25),
    heal: () => arp([72, 76, 79, 84, 88, 91], 0.07, 'sine', 0.15, 0.35),
    encounter: () => { const t = ctx.currentTime; tone(300, t, 0.5, 'sawtooth', 0.1, 1400); tone(600, t + 0.1, 0.4, 'square', 0.05, 2000); },
    warp: () => tone(500, ctx.currentTime, 0.25, 'sine', 0.1, 800),
    get: () => arp([72, 79, 84], 0.09, 'triangle', 0.2, 0.3),
    run: () => { const t = ctx.currentTime; noise(t, 0.3, 0.12, 2800); tone(500, t, 0.3, 'sine', 0.07, 200); },
    win: () => arp([72, 72, 72, 76, 74, 79, 84], 0.13, 'triangle', 0.2, 0.3),
    // オープニング: はじめの タップ / コマが 出る(i番目ほど 高い鈴の音) / 題字
    opStart: () => { const t = ctx.currentTime; tone(mtof(69), t, 0.7, 'triangle', 0.14); tone(mtof(76), t + 0.09, 0.9, 'sine', 0.12); },
    opPanel: (i = 0) => { const t = ctx.currentTime, n = [57, 60, 64, 67, 71][i % 5]; noise(t, 0.34, 0.12, 3600); tone(120, t + 0.4, 0.22, 'sine', 0.32, 48); tone(mtof(n), t + 0.4, 0.9, 'triangle', 0.15); tone(mtof(n + 12), t + 0.4, 0.6, 'sine', 0.07); },
    opTitle: () => { const t = ctx.currentTime; noise(t, 0.6, 0.07, 5000); [45, 57, 64, 69, 71, 76].forEach((n, i) => tone(mtof(n), t + i * 0.035, 2.8, i < 2 ? 'sine' : 'triangle', i < 2 ? 0.16 : 0.08)); [81, 83, 88, 93].forEach((n, i) => tone(mtof(n), t + 0.35 + i * 0.13, 0.9, 'sine', 0.06)); },
  };
  function sfx(name, arg) { if (muted || !ensure() || !SFX[name]) return; try { SFX[name](arg); } catch (e) {} }

  // ---- BGM: 8分音符のステップ列。melody/bassはMIDI番号、0は休み ----
  const SONGS = {
    boss: {
      bpm: 138,
      mel: [74, 0, 77, 74, 81, 0, 77, 0, 79, 0, 77, 74, 70, 0, 0, 0, 74, 0, 77, 81, 84, 0, 81, 0, 82, 0, 81, 77, 74, 0, 0, 0],
      bass: [38, 38, 45, 38, 38, 38, 45, 38, 34, 34, 41, 34, 34, 34, 41, 34, 36, 36, 43, 36, 36, 36, 43, 36, 33, 33, 40, 33, 33, 33, 40, 33],
      mt: 'square', mv: 0.055, bt: 'triangle', bv: 0.17,
    },
    town: {
      bpm: 84,
      mel: [69, 0, 0, 67, 65, 0, 62, 0, 67, 0, 0, 65, 62, 0, 0, 0, 72, 0, 0, 69, 67, 0, 65, 0, 69, 0, 67, 0, 62, 0, 0, 0],
      bass: [50, 0, 0, 0, 0, 0, 0, 0, 46, 0, 0, 0, 0, 0, 0, 0, 48, 0, 0, 0, 0, 0, 0, 0, 43, 0, 0, 0, 0, 0, 0, 0],
      mt: 'triangle', mv: 0.09, bt: 'sine', bv: 0.14,
    },
    title: { // タイトル画面: 静かで すこし さびしい
      bpm: 66,
      mel: [76, 0, 0, 0, 72, 0, 74, 0, 71, 0, 0, 0, 0, 0, 0, 0, 72, 0, 0, 0, 69, 0, 71, 0, 67, 0, 0, 0, 0, 0, 0, 0],
      bass: [45, 0, 0, 0, 52, 0, 0, 0, 43, 0, 0, 0, 50, 0, 0, 0, 41, 0, 0, 0, 48, 0, 0, 0, 40, 0, 0, 0, 47, 0, 0, 0],
      mt: 'triangle', mv: 0.08, bt: 'sine', bv: 0.13,
    },
    field: {
      bpm: 104,
      mel: [76, 79, 76, 72, 74, 76, 79, 0, 81, 79, 76, 79, 76, 74, 72, 0, 77, 76, 72, 76, 74, 72, 69, 0, 74, 76, 79, 76, 74, 72, 74, 0],
      bass: [48, 0, 55, 0, 48, 0, 55, 0, 45, 0, 52, 0, 45, 0, 52, 0, 41, 0, 48, 0, 41, 0, 48, 0, 43, 0, 50, 0, 43, 0, 50, 0],
      mt: 'triangle', mv: 0.1, bt: 'sine', bv: 0.16,
    },
    battle: {
      bpm: 146,
      mel: [69, 0, 72, 69, 76, 0, 72, 0, 77, 0, 76, 72, 69, 0, 0, 0, 72, 0, 76, 72, 79, 0, 76, 0, 74, 0, 72, 71, 67, 0, 0, 0],
      bass: [45, 45, 52, 45, 45, 45, 52, 45, 41, 41, 48, 41, 41, 41, 48, 41, 48, 48, 55, 48, 48, 48, 55, 48, 43, 43, 50, 43, 43, 43, 50, 43],
      mt: 'square', mv: 0.05, bt: 'triangle', bv: 0.17,
    },
  };
  function sched() {
    if (!ctx || !cur || muted) return;
    const s = SONGS[cur], dt = 60 / s.bpm / 2;
    while (nextT < ctx.currentTime + 0.25) {
      const i = step % s.mel.length;
      // 世界がさむい(warm 低)ときは、音を間引いてしずかに。あたたかくなると、音が増えて豊かになる
      const sparse = (cur === 'field' || cur === 'town') && warm < 0.35, rich = (cur === 'field' || cur === 'town') && warm > 0.7;
      if (s.mel[i] && !(sparse && i % 4 !== 0 && i % 4 !== 2)) tone(mtof(s.mel[i]), nextT, dt * (sparse ? 2.4 : 1.7), s.mt, s.mv * (sparse ? 0.8 : 1));
      if (rich && s.mel[i] && i % 4 === 0) tone(mtof(s.mel[i] - 12), nextT, dt * 1.7, 'sine', 0.06);
      if (s.bass[i] && !(sparse && i % 8 !== 0)) tone(mtof(s.bass[i]), nextT, dt * 1.6, s.bt, s.bv);
      nextT += dt; step++;
    }
  }
  function bgm(name) {
    if (cur === name) return;
    cur = name; step = 0;
    if (!ctx) return; // ensure() 後に呼ばれたとき始まる
    nextT = ctx.currentTime + 0.05;
    if (!timer) timer = setInterval(sched, 60);
  }
  function start() { // 最初の操作で呼ぶ
    ensure(); if (ctx && cur && !timer) { nextT = ctx.currentTime + 0.05; timer = setInterval(sched, 60); }
  }
  function stop() { cur = null; }
  function unlock() { // 画面に ふれた瞬間に 呼ぶ(iPhoneは、これをしないと 音が出ない)
    start(); if (!ctx) return;
    try { const s = ctx.createBufferSource(); s.buffer = ctx.createBuffer(1, 1, ctx.sampleRate); s.connect(ctx.destination); s.start(0); } catch (e) {}
  }
  function setMute(m) { muted = m; try { localStorage.setItem('mofu.mute', m ? '1' : '0'); } catch (e) {} if (master) master.gain.value = m ? 0 : 0.5; if (!m) { ensure(); if (ctx) nextT = ctx.currentTime + 0.05; } }
  return { sfx, bgm, start, stop, unlock, get state() { return ctx ? ctx.state : 'none'; }, setMute, setWarm: (w) => { warm = w; }, get muted() { return muted; }, ensure };
})();
