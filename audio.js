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
    // オープニング: はじめの タップ / コマが 出る / 題字(中身は えらんだ 音の組 THEMES)
    opStart: () => theme().start(ctx.currentTime), opPanel: (i = 0) => theme().panel(ctx.currentTime, i % 5), opTitle: () => theme().title(ctx.currentTime),
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
  // ---------- オープニングと タイトル曲の「音の組」。どれも その場で合成した オリジナル ----------
  // 楽器の もと: o = { type, vol, a(立ち上がり), d(長さ), lp(こもり), f2(音程の すべり), echo }
  let echoIn = null;
  function echoBus() {
    if (!echoIn) { echoIn = ctx.createGain(); const dl = ctx.createDelay(1), fb = ctx.createGain(), wet = ctx.createGain(); dl.delayTime.value = 0.31; fb.gain.value = 0.38; wet.gain.value = 0.5; echoIn.connect(master); echoIn.connect(dl); dl.connect(fb); fb.connect(dl); dl.connect(wet); wet.connect(master); }
    return echoIn;
  }
  function voice(f, t, o = {}) {
    const osc = ctx.createOscillator(), amp = ctx.createGain(), d = o.d || 0.5, at = o.a || 0.008;
    osc.type = o.type || 'sine'; osc.frequency.setValueAtTime(f, t); if (o.f2) osc.frequency.exponentialRampToValueAtTime(o.f2, t + (o.ft || d));
    amp.gain.setValueAtTime(0.0001, t); amp.gain.exponentialRampToValueAtTime(o.vol || 0.1, t + at); amp.gain.exponentialRampToValueAtTime(0.0001, t + d);
    let out = osc;
    if (o.lp) { const fl = ctx.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.setValueAtTime(o.lp, t); if (o.lp2) fl.frequency.exponentialRampToValueAtTime(o.lp2, t + d); osc.connect(fl); out = fl; }
    if (o.vib) { const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = 5.2; lg.gain.setValueAtTime(0.01, t); lg.gain.linearRampToValueAtTime(f * 0.012, t + d * 0.6); l.connect(lg); lg.connect(osc.frequency); l.start(t); l.stop(t + d + 0.05); }
    out.connect(amp); amp.connect(o.echo ? echoBus() : master); osc.start(t); osc.stop(t + d + 0.05);
  }
  // ざわめき(ノイズ): hp=下を けずる, lp=上を けずる
  function wash(t, d, vol, hp = 200, lp = 4000, a = 0.01) {
    const s = ctx.createBufferSource(), h = ctx.createBiquadFilter(), l = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf; s.loop = true; h.type = 'highpass'; h.frequency.value = hp; l.type = 'lowpass'; l.frequency.value = lp;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    s.connect(h); h.connect(l); l.connect(g); g.connect(master); s.start(t); s.stop(t + d + 0.05);
  }
  const kick = (t, v = 0.3) => voice(130, t, { f2: 45, d: 0.24, vol: v });
  const musicbox = (n, t, v = 0.1) => { voice(mtof(n), t, { vol: v, d: 1.5, a: 0.004, echo: true }); voice(mtof(n) * 3.01, t, { vol: v * 0.22, d: 0.45, a: 0.003 }); };
  const piano = (n, t, v = 0.13, d = 2) => { voice(mtof(n), t, { type: 'triangle', vol: v, d, a: 0.006, lp: 2600, lp2: 500, echo: true }); voice(mtof(n) * 2, t, { vol: v * 0.25, d: d * 0.4 }); };
  const synth = (n, t, v, d, lp = 1800) => { voice(mtof(n), t, { type: 'sawtooth', vol: v, d, a: 0.012, lp, lp2: 500 }); voice(mtof(n) * 1.006, t, { type: 'sawtooth', vol: v * 0.7, d, a: 0.012, lp, lp2: 500 }); };
  const koto = (n, t, v = 0.13) => { voice(mtof(n), t, { type: 'sawtooth', vol: v, d: 1.1, a: 0.003, lp: 3800, lp2: 350, echo: true }); voice(mtof(n) * 2.003, t, { type: 'triangle', vol: v * 0.3, d: 0.4, a: 0.003 }); };
  const furin = (t, v = 0.05) => { [2637, 3560, 4435].forEach((f, k) => voice(f, t + k * 0.015, { vol: v / (k + 1), d: 2.2, a: 0.003, echo: true })); };
  const taiko = (t, v = 0.36) => { voice(110, t, { f2: 48, d: 0.5, vol: v }); wash(t, 0.12, v * 0.35, 60, 700, 0.004); };
  const THEMES = {
    now: { // いまの音: すずと 低い和音
      start: (t) => { tone(mtof(69), t, 0.7, 'triangle', 0.14); tone(mtof(76), t + 0.09, 0.9, 'sine', 0.12); },
      panel: (t, i) => { const n = [57, 60, 64, 67, 71][i]; noise(t, 0.34, 0.12, 3600); tone(120, t + 0.4, 0.22, 'sine', 0.32, 48); tone(mtof(n), t + 0.4, 0.9, 'triangle', 0.15); tone(mtof(n + 12), t + 0.4, 0.6, 'sine', 0.07); },
      title: (t) => { noise(t, 0.6, 0.07, 5000); [45, 57, 64, 69, 71, 76].forEach((n, k) => tone(mtof(n), t + k * 0.035, 2.8, k < 2 ? 'sine' : 'triangle', k < 2 ? 0.16 : 0.08)); [81, 83, 88, 93].forEach((n, k) => tone(mtof(n), t + 0.35 + k * 0.13, 0.9, 'sine', 0.06)); },
      song: { bpm: 66, mel: [76, 0, 0, 0, 72, 0, 74, 0, 71, 0, 0, 0, 0, 0, 0, 0, 72, 0, 0, 0, 69, 0, 71, 0, 67, 0, 0, 0, 0, 0, 0, 0], bass: [45, 0, 0, 0, 52, 0, 0, 0, 43, 0, 0, 0, 50, 0, 0, 0, 41, 0, 0, 0, 48, 0, 0, 0, 40, 0, 0, 0, 47, 0, 0, 0], mt: 'triangle', mv: 0.08, bt: 'sine', bv: 0.13 },
    },
    a: { // オルゴール
      start: (t) => { musicbox(81, t, 0.12); musicbox(88, t + 0.14, 0.1); },
      panel: (t, i) => { for (let k = 0; k < 3; k++) musicbox([69, 72, 74, 76, 79][i] + [0, 7, 12][k], t + 0.36 + k * 0.06, 0.09 - k * 0.015); wash(t + 0.36, 0.05, 0.08, 3000, 9000, 0.002); },
      title: (t) => { [57, 64, 69, 72, 76, 81, 84, 88].forEach((n, k) => musicbox(n, t + k * 0.1, 0.09)); },
      song: { bpm: 92, len: 24, play: (i, t) => { const m = [81, 0, 76, 0, 72, 0, 79, 0, 74, 0, 71, 0, 77, 0, 72, 0, 69, 0, 76, 0, 0, 74, 71, 0]; if (m[i]) musicbox(m[i], t, 0.09); const b = { 0: 57, 6: 55, 12: 53, 18: 52 }[i]; if (b) musicbox(b, t, 0.08); if (i % 6 === 2 || i % 6 === 4) musicbox((i < 12 ? (i < 6 ? 64 : 62) : (i < 18 ? 60 : 59)), t, 0.035); } },
    },
    b: { // 90年代アニメ: ドラムと シンセ
      start: (t) => { synth(69, t, 0.07, 0.5, 3000); synth(76, t + 0.1, 0.07, 0.6, 3000); wash(t, 0.4, 0.06, 5000, 11000); },
      panel: (t, i) => { wash(t, 0.36, 0.07, 800, 6000, 0.3); kick(t + 0.4, 0.4); wash(t + 0.4, 0.16, 0.14, 1200, 7000, 0.003); [0, 3, 7].forEach((x) => synth([57, 60, 62, 64, 67][i] + x, t + 0.4, 0.05, 0.32, 2600)); },
      title: (t) => { kick(t, 0.45); wash(t, 1.8, 0.16, 4000, 12000, 0.004); [45, 57, 60, 64, 67, 71].forEach((n) => synth(n, t, 0.055, 2.2, 3200)); [76, 79, 81, 88].forEach((n, k) => synth(n, t + 0.3 + k * 0.14, 0.05, k === 3 ? 1.4 : 0.2, 4000)); },
      song: { bpm: 94, len: 32, play: (i, t, dt) => { const bar = Math.floor(i / 8), root = [45, 41, 38, 40][bar], s = i % 8; if (s === 0 || s === 5) kick(t, 0.26); if (s === 2 || s === 6) wash(t, 0.14, 0.09, 1400, 6500, 0.003); wash(t, 0.04, s % 2 ? 0.035 : 0.018, 7000, 12000, 0.002); if ([0, 3, 4, 7].includes(s)) voice(mtof(root + (s === 3 ? 12 : s === 7 ? 7 : 0)), t, { type: 'sawtooth', vol: 0.11, d: dt * 0.9, lp: 650 }); if (s === 0) [[60, 64, 67], [57, 60, 64], [53, 57, 60], [56, 59, 62]][bar].forEach((n) => voice(mtof(n), t, { type: 'square', vol: 0.022, d: dt * 7.5, a: 0.08, lp: 1300 })); const m = [76, 0, 0, 74, 72, 0, 71, 0, 72, 0, 0, 0, 69, 0, 0, 0, 74, 0, 0, 72, 69, 0, 65, 0, 68, 0, 71, 0, 0, 0, 0, 0][i]; if (m) synth(m, t, 0.035, dt * 2.2, 2800); } },
    },
    c: { // 雨と ピアノ
      start: (t) => { piano(69, t, 0.15); piano(76, t + 0.18, 0.1); wash(t, 1.6, 0.04, 2500, 8000, 0.5); },
      panel: (t, i) => { if (i === 0) wash(t, 5.5, 0.05, 2200, 7500, 1.2); piano([57, 60, 64, 65, 71][i], t + 0.4, 0.17, 1.6); voice(700 + i * 90, t + 0.4, { f2: 1700 + i * 150, ft: 0.07, d: 0.12, vol: 0.05, echo: true }); },
      title: (t) => { [33, 45, 52, 60, 64, 71, 76].forEach((n, k) => piano(n, t + k * 0.075, 0.1, 3.2)); piano(83, t + 0.9, 0.05, 2.4); },
      song: { bpm: 66, len: 32, play: (i, t, dt) => { if (i % 8 === 0) wash(t, dt * 9, 0.032, 2200, 7000, dt * 2); const bar = Math.floor(i / 8), arp = [[45, 52, 57, 60], [41, 48, 53, 57], [38, 45, 50, 53], [40, 47, 52, 56]][bar]; if (i % 2 === 0) piano(arp[(i % 8) / 2], t, 0.055, 1.8); const m = [76, 0, 0, 72, 0, 0, 74, 0, 69, 0, 0, 0, 0, 0, 72, 0, 74, 0, 0, 77, 0, 0, 76, 0, 71, 0, 0, 0, 68, 0, 0, 0][i]; if (m) piano(m, t, 0.1, 2.2); if (i % 5 === 3) voice(1400 + (i * 137) % 900, t + dt * 0.4, { f2: 2800, ft: 0.05, d: 0.09, vol: 0.018, echo: true }); } },
    },
    d: { // 電子の灯り(近未来)
      start: (t) => { voice(440, t, { f2: 880, ft: 0.18, d: 0.7, vol: 0.12, echo: true }); voice(1318, t + 0.2, { d: 0.5, vol: 0.06, echo: true }); },
      panel: (t, i) => { const n = [57, 62, 64, 69, 71][i]; voice(mtof(n - 12), t, { type: 'sawtooth', f2: mtof(n), d: 0.45, a: 0.3, vol: 0.07, lp: 300, lp2: 3000 }); voice(mtof(n + 12), t + 0.4, { type: 'square', d: 0.2, vol: 0.07, lp: 3500, echo: true }); voice(mtof(n - 24), t + 0.4, { d: 0.5, vol: 0.25 }); },
      title: (t) => { [33, 45, 57, 64, 71].forEach((n) => voice(mtof(n), t, { type: n < 50 ? 'sine' : 'sawtooth', vol: n < 50 ? 0.15 : 0.05, d: 3.4, a: 0.5, lp: 250, lp2: 4200 })); [81, 88, 83, 90, 93].forEach((n, k) => voice(mtof(n), t + 0.25 + k * 0.15, { type: 'square', vol: 0.035, d: 0.18, lp: 4000, echo: true })); },
      song: { bpm: 84, len: 32, play: (i, t, dt) => { const bar = Math.floor(i / 8), ch = [[57, 64, 71, 72], [53, 60, 69, 76], [50, 57, 65, 72], [52, 59, 68, 71]][bar], s = i % 8; voice(mtof(ch[[0, 1, 2, 3, 2, 1, 3, 2][s]] + 12), t, { type: 'triangle', vol: 0.06, d: 0.22, echo: true }); if (s === 0) { [ch[0] - 12, ch[1], ch[2]].forEach((n) => voice(mtof(n), t, { type: 'sawtooth', vol: 0.028, d: dt * 8.4, a: dt * 3, lp: 400, lp2: 1400 })); voice(mtof(ch[0] - 24), t, { vol: 0.16, d: dt * 5 }); } if (s === 0 || s === 4) kick(t, 0.14); if (s === 6) wash(t, 0.07, 0.025, 6000, 11000, 0.002); } },
    },
    e: { // 和の夕暮れ: こと・ふうりん・たいこ
      start: (t) => { furin(t, 0.08); koto(69, t + 0.1, 0.1); },
      panel: (t, i) => { taiko(t + 0.4, 0.34); koto([57, 58, 62, 64, 65][i] + 12, t + 0.4, 0.13); wash(t, 0.4, 0.035, 900, 3000, 0.3); },
      title: (t) => { taiko(t, 0.45); [57, 58, 62, 64, 65, 69, 70, 74, 76].forEach((n, k) => koto(n, t + 0.05 + k * 0.065, 0.08)); [220, 331, 523, 711].forEach((f, k) => voice(f, t + 0.75, { vol: 0.09 / (k + 1), d: 3, a: 0.004, echo: true })); furin(t + 1.1, 0.07); },
      song: { bpm: 72, len: 32, play: (i, t, dt) => { const k = [69, 0, 70, 69, 65, 0, 64, 0, 0, 0, 62, 64, 65, 0, 0, 0, 69, 0, 74, 70, 69, 0, 65, 0, 64, 0, 62, 0, 57, 0, 0, 0][i]; if (k) koto(k, t, 0.085); if (i % 8 === 0) { koto([45, 45, 46, 45][i / 8], t, 0.07); } if (i === 8 || i === 24) voice(mtof(i === 8 ? 76 : 77), t, { type: 'sine', vol: 0.045, d: dt * 7, a: dt * 1.5, vib: true, echo: true }); if (i === 0 || i === 16) taiko(t, 0.13); if (i === 5 || i === 21) furin(t, 0.03); } },
    },
  };
  let themeKey = 'now';
  const theme = () => THEMES[themeKey];
  function setTheme(k) { if (!THEMES[k]) return; themeKey = k; SONGS.title = THEMES[k].song; if (cur === 'title') { step = 0; if (ctx) nextT = ctx.currentTime + 0.05; } }
  SONGS.title = THEMES.now.song;
  function sched() {
    if (!ctx || !cur || muted) return;
    const s = SONGS[cur], dt = 60 / s.bpm / 2;
    while (nextT < ctx.currentTime + 0.25) {
      if (s.play) { s.play(step % s.len, nextT, dt); nextT += dt; step++; continue; }
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
  return { sfx, bgm, start, stop, unlock, setTheme, get theme() { return themeKey; }, get state() { return ctx ? ctx.state : 'none'; }, setMute, setWarm: (w) => { warm = w; }, get muted() { return muted; }, ensure };
})();
