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
    // バトル: 技を はなつ音 / 当たる音(タイプごと)
    cast: (ty) => { const t = ctx.currentTime;
      if (ty === 'leaf') { for (let i = 0; i < 6; i++) wash(t + i * 0.05, 0.09, 0.09, 2500, 8000, 0.02); voice(500, t, { f2: 900, d: 0.3, vol: 0.04 }); }
      else if (ty === 'fire') { wash(t, 0.55, 0.2, 100, 1800, 0.2); voice(110, t, { type: 'sawtooth', f2: 240, d: 0.45, vol: 0.06, lp: 900 }); }
      else if (ty === 'water') { wash(t, 0.45, 0.14, 600, 3500, 0.08); for (let i = 0; i < 6; i++) voice(420 + i * 90, t + i * 0.055, { f2: 900 + i * 130, ft: 0.06, d: 0.09, vol: 0.06 }); }
      else if (ty === 'volt') { for (let i = 0; i < 9; i++) voice(900 + (i * 457) % 1400, t + i * 0.032, { type: 'square', d: 0.03, vol: 0.05 }); voice(200, t, { type: 'sawtooth', f2: 1400, d: 0.32, vol: 0.05 }); }
      else if (ty === 'metal') { [1180, 1760, 2330].forEach((f, k) => voice(f, t + k * 0.05, { type: 'triangle', d: 0.18, vol: 0.06 })); wash(t, 0.25, 0.07, 4000, 11000, 0.05); }
      else wash(t, 0.22, 0.14, 700, 5000, 0.09);
    },
    boom: (ty) => { const t = ctx.currentTime;
      if (ty === 'leaf') { wash(t, 0.14, 0.2, 3000, 10000, 0.003); wash(t + 0.09, 0.14, 0.16, 3500, 10000, 0.003); }
      else if (ty === 'fire') { wash(t, 0.6, 0.3, 40, 1200, 0.005); voice(90, t, { f2: 35, d: 0.45, vol: 0.3 }); }
      else if (ty === 'water') { wash(t, 0.45, 0.24, 500, 5000, 0.01); voice(300, t, { f2: 90, d: 0.2, vol: 0.14 }); }
      else if (ty === 'volt') { wash(t, 0.35, 0.28, 1500, 12000, 0.002); voice(70, t, { type: 'square', f2: 45, d: 0.4, vol: 0.12, lp: 500 }); for (let i = 0; i < 7; i++) voice(1600 - i * 160, t + i * 0.035, { type: 'square', d: 0.03, vol: 0.05 }); }
      else if (ty === 'metal') { [523, 784, 1245, 1865, 2637].forEach((f, k) => voice(f, t, { type: k % 2 ? 'sine' : 'triangle', d: 0.7 - k * 0.08, vol: 0.09, a: 0.002 })); wash(t, 0.08, 0.18, 3000, 12000, 0.002); }
      else { kick(t, 0.3); wash(t, 0.12, 0.16, 800, 4000, 0.002); }
    },
    cutin: () => { const t = ctx.currentTime; wash(t, 0.4, 0.18, 600, 9000, 0.28); kick(t + 0.28, 0.45); [45, 52, 57].forEach((n) => synth(n, t + 0.28, 0.07, 1.1, 2400)); voice(mtof(81), t + 0.28, { type: 'square', d: 0.5, vol: 0.04, echo: true }); },
    victory: () => { const t = ctx.currentTime; [[67, 0], [72, 0.11], [76, 0.22], [79, 0.33], [76, 0.5], [79, 0.62], [84, 0.74]].forEach(([n, at], i) => { synth(n, t + at, 0.055, i === 6 ? 1.2 : 0.16, 3400); musicbox(n + 12, t + at, 0.05); }); [48, 55, 60, 64].forEach((n) => synth(n, t + 0.74, 0.04, 1.2, 2200)); kick(t, 0.3); kick(t + 0.5, 0.3); kick(t + 0.74, 0.4); wash(t + 0.74, 1.0, 0.1, 4000, 12000, 0.005); },
    // あかりの場面: 街灯が ともる(i番目ほど 高い音) / ぜんぶ ともった しゅんかん
    lampOn: (i = 0) => { const t = ctx.currentTime, n = [64, 67, 69, 71, 76, 79][i % 6]; wash(t, 0.05, 0.12, 2500, 9000, 0.002); musicbox(n + 12, t + 0.14, 0.1); synth(n - 12, t + 0.14, 0.04, 0.7, 2200); voice(90, t + 0.14, { f2: 55, d: 0.3, vol: 0.2 }); },
    lightBurst: () => { const t = ctx.currentTime; kick(t, 0.4); wash(t, 2.2, 0.14, 3500, 12000, 0.01); [41, 53, 57, 60, 64, 67].forEach((n) => synth(n, t, 0.045, 2.6, 3200)); [72, 76, 79, 84, 88, 91].forEach((n, k) => musicbox(n, t + 0.1 + k * 0.1, 0.08)); },
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
  // オーナーが えらんだ組み合わせ: 最初の タップ音だけ オルゴール、コマ・題字・タイトル曲は 90年代アニメ
  THEMES.pick = { start: THEMES.a.start, panel: THEMES.b.panel, title: THEMES.b.title, song: THEMES.b.song };
  let themeKey = 'pick';
  const theme = () => THEMES[themeKey];
  function setTheme(k) { if (!THEMES[k]) return; themeKey = k; SONGS.title = THEMES[k].song; if (cur === 'title') { step = 0; if (ctx) nextT = ctx.currentTime + 0.05; } }
  SONGS.title = THEMES.pick.song;
  SONGS.memory = THEMES.a.song; // 回想は オルゴール(さいしょの タップ音と 同じ 音色)
  SONGS.light = { bpm: 92, len: 32, play: (i, t, dt) => { // あかりの一枚絵の 曲(90年代アニメふうの あたたかい版)
    const bar = Math.floor(i / 8), s = i % 8, ch = [[53, 57, 60, 64], [55, 59, 62, 67], [52, 55, 59, 64], [57, 60, 64, 69]][bar];
    if (s === 0) { ch.forEach((n) => voice(mtof(n), t, { type: 'sawtooth', vol: 0.02, d: dt * 8.2, a: dt * 1.5, lp: 1500 })); voice(mtof(ch[0] - 12), t, { type: 'triangle', vol: 0.14, d: dt * 6 }); kick(t, 0.2); }
    if (s === 4) { voice(mtof(ch[0] - 5), t, { type: 'triangle', vol: 0.11, d: dt * 3 }); wash(t, 0.16, 0.06, 1500, 6500, 0.003); }
    musicbox(ch[[0, 1, 2, 3, 2, 3, 1, 2][s]] + 12, t, 0.035);
    const m = [72, 0, 76, 0, 81, 0, 79, 0, 79, 0, 74, 0, 71, 0, 74, 0, 76, 0, 79, 0, 83, 0, 79, 0, 81, 0, 0, 0, 76, 0, 0, 0][i]; if (m) synth(m, t, 0.035, dt * 2.4, 2600);
  } };
  // ---------- 町と 寄り道の 曲(どれも オリジナル)。あかりが ともると、楽器が ふえて あたたかく なる ----------
  let litForce = null; // 聴き比べページ用
  const isLit = () => (litForce != null ? litForce : typeof world !== 'undefined' && (world.map.id === 'village' ? warm > 0.5 : !!S.flags['lit_' + world.map.id]));
  const hat = (t, v = 0.016) => wash(t, 0.04, v, 7000, 12000, 0.002);
  const snare = (t, v = 0.05) => wash(t, 0.12, v, 1500, 6000, 0.003);
  const pad = (notes, t, d, v = 0.018, lp = 1300) => notes.forEach((n) => voice(mtof(n), t, { type: 'sawtooth', vol: v, d, a: d * 0.3, lp }));
  const bass = (n, t, d, v = 0.13) => voice(mtof(n), t, { type: 'triangle', vol: v, d, a: 0.012 });
  const mallet = (n, t, v = 0.09) => { voice(mtof(n), t, { vol: v, d: 0.34, a: 0.003 }); voice(mtof(n) * 3.98, t, { vol: v * 0.16, d: 0.08, a: 0.002 }); };
  const bell = (n, t, v = 0.05) => { voice(mtof(n), t, { vol: v, d: 2.8, a: 0.004, echo: true }); voice(mtof(n) * 2.76, t, { vol: v * 0.2, d: 0.9, a: 0.003 }); };
  // ひなた村: オルゴールの 三拍子
  const V_MEL = [76, 0, 79, 0, 84, 0, 83, 0, 81, 0, 76, 0, 77, 0, 81, 0, 84, 0, 83, 0, 0, 0, 79, 0, 76, 0, 79, 0, 88, 0, 86, 0, 83, 0, 79, 0, 81, 0, 84, 0, 83, 0, 84, 0, 0, 0, 0, 0];
  const V_CH = [[48, 60, 64, 67], [45, 60, 64, 69], [41, 60, 65, 69], [43, 59, 62, 67], [48, 60, 64, 67], [52, 59, 64, 67], [41, 60, 65, 69], [48, 60, 64, 67]];
  SONGS.village = { bpm: 112, len: 48, play: (i, t, dt) => { const bar = Math.floor(i / 6), s = i % 6, c = V_CH[bar]; if (V_MEL[i]) musicbox(V_MEL[i], t, 0.075); if (s === 0) bass(c[0], t, dt * 4, 0.11); if (s === 2 || s === 4) [c[1], c[2]].forEach((n) => piano(n, t, 0.028, 0.9)); if (isLit() && s === 0) pad([c[1], c[3]], t, dt * 6.4, 0.012); } };
  // ひだまり町: 夕方の エレピと やわらかい 旋律
  const H_MEL = [71, 0, 74, 0, 79, 0, 78, 74, 76, 0, 0, 0, 71, 0, 74, 0, 76, 0, 79, 0, 83, 0, 81, 79, 81, 0, 0, 0, 78, 0, 0, 0, 74, 0, 78, 0, 83, 0, 81, 78, 79, 0, 0, 76, 0, 0, 71, 0, 72, 0, 76, 0, 81, 0, 79, 76, 78, 0, 0, 0, 0, 0, 74, 0];
  const H_CH = [[43, 59, 62, 66], [40, 59, 62, 67], [48, 59, 64, 67], [50, 57, 62, 66], [47, 57, 62, 66], [40, 59, 62, 67], [45, 57, 60, 64], [50, 57, 60, 66]];
  SONGS.town1 = { bpm: 88, len: 64, play: (i, t, dt) => { const bar = Math.floor(i / 8), s = i % 8, c = H_CH[bar], on = isLit(); if (H_MEL[i]) voice(mtof(H_MEL[i]), t, { type: 'triangle', vol: 0.085, d: dt * 2.6, a: 0.02, vib: true, echo: on }); if (s === 0) c.slice(1).forEach((n) => piano(n, t, 0.04, dt * 6)); if (s === 3) c.slice(2).forEach((n) => piano(n, t, 0.022, dt * 3)); if (s === 0) bass(c[0], t, dt * 3.6); if (s === 5) bass(c[0] + 7, t, dt * 2, 0.08); if (on) { if (s === 0 || s === 4) kick(t, 0.13); if (s === 2 || s === 6) snare(t, 0.035); hat(t, s % 2 ? 0.014 : 0.008); } } };
  // ミドリ団地: 電子の つぶと、遠い 呼び声
  const M_MEL = [0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 0, 72, 0, 0, 0, 0, 0, 0, 0, 69, 0, 0, 0, 0, 0, 0, 0, 68, 0, 0, 0, 76, 0, 0, 0, 79, 0, 76, 0, 72, 0, 0, 0, 76, 0, 77, 0, 74, 0, 0, 0, 77, 0, 81, 0, 80, 0, 0, 0, 76, 0, 0, 0];
  const M_CH = [[45, 57, 60, 64, 71], [41, 53, 57, 60, 64], [38, 50, 53, 57, 60], [40, 52, 56, 59, 62]];
  SONGS.town2 = { bpm: 96, len: 64, play: (i, t, dt) => { const c = M_CH[Math.floor(i / 8) % 4], s = i % 8, on = isLit(); voice(mtof(c[[1, 2, 3, 4, 3, 2, 4, 3][s]] + 12), t, { type: 'triangle', vol: on ? 0.05 : 0.034, d: 0.2, echo: true }); if (s === 0) { pad([c[1], c[3]], t, dt * 8.4, 0.016, on ? 1500 : 700); voice(mtof(c[0] - 12), t, { vol: 0.15, d: dt * 6 }); } if (M_MEL[i]) voice(mtof(M_MEL[i]), t, { type: 'square', vol: 0.03, d: dt * 3, a: 0.04, lp: 2600, vib: true, echo: true }); if (on) { if (s === 0 || s === 4) kick(t, 0.15); if (s % 2) hat(t, 0.018); if (s === 6) snare(t, 0.025); } } };
  // ナギサ港: ゆれる 波の ような ピアノ
  const N_MEL = [69, 0, 0, 74, 0, 0, 77, 0, 74, 0, 0, 0, 72, 0, 0, 77, 0, 0, 76, 0, 72, 0, 0, 0, 69, 0, 0, 74, 0, 77, 82, 0, 0, 81, 0, 0, 79, 0, 77, 74, 0, 0, 73, 0, 0, 0, 0, 0];
  const N_CH = [[50, 57, 62, 65], [46, 53, 58, 62], [41, 48, 53, 57], [48, 55, 60, 64], [50, 57, 62, 65], [46, 53, 58, 62], [43, 50, 55, 58], [45, 52, 57, 61]];
  SONGS.town3 = { bpm: 92, len: 48, play: (i, t, dt) => { const bar = Math.floor(i / 6), s = i % 6, c = N_CH[bar], on = isLit(); piano(c[[0, 1, 2, 3, 2, 1][s]], t, s === 0 ? 0.075 : 0.038, 1.5); if (N_MEL[i]) piano(N_MEL[i], t, 0.095, 2.2); if (!on && i === 24) voice(mtof(38), t, { type: 'sawtooth', vol: 0.035, d: dt * 9, a: dt * 3, lp: 420 }); if (on && s === 0) { pad([c[1] + 12, c[3]], t, dt * 6.4, 0.016); bass(c[0] - 12, t, dt * 5, 0.09); } if (on && i % 12 === 9) bell(c[2] + 24, t, 0.03); } };
  // ヤマノハ: こと・ふうりん・山の ひびき
  const Y_MEL = [74, 0, 0, 0, 77, 0, 79, 0, 81, 0, 0, 0, 79, 0, 77, 0, 74, 0, 0, 77, 0, 0, 72, 0, 74, 0, 0, 0, 0, 0, 0, 0, 81, 0, 0, 84, 0, 0, 81, 0, 79, 0, 77, 0, 79, 0, 0, 0, 77, 0, 0, 74, 0, 72, 0, 0, 74, 0, 0, 0, 0, 0, 0, 0];
  const Y_CH = [[38, 57, 62, 65], [36, 55, 60, 64], [34, 53, 58, 62], [33, 52, 57, 60]];
  SONGS.town4 = { bpm: 78, len: 64, play: (i, t, dt) => { const c = Y_CH[Math.floor(i / 16)], s = i % 16, on = isLit(); if (Y_MEL[i]) koto(Y_MEL[i], t, 0.085); if (s === 0) { koto(c[0] + 12, t, 0.075); pad([c[1] - 12, c[2] - 12], t, dt * 16.5, on ? 0.018 : 0.011, 800); } if (s === 6 || s === 10) koto(c[s === 6 ? 2 : 1], t, 0.032); if (i === 28 || i === 60) furin(t, 0.028); if (on) { if (s === 0 || s === 8) taiko(t, 0.11); if (s % 4 === 2) musicbox(c[(s >> 2) % 3 + 1] + 12, t, 0.03); } } };
  // こもれびの森: 木の 打楽器と 鳥の ような 笛
  const F_ARP = [65, 69, 72, 77, 72, 69, 74, 72, 62, 65, 69, 74, 69, 65, 70, 69, 58, 62, 65, 70, 65, 62, 69, 65, 60, 64, 67, 72, 67, 64, 70, 67];
  const F_MEL = [0, 0, 0, 0, 0, 0, 0, 0, 81, 0, 0, 79, 0, 0, 0, 0, 0, 0, 0, 0, 77, 0, 74, 0, 79, 0, 0, 0, 0, 0, 0, 0];
  SONGS.forest = { bpm: 100, len: 32, play: (i, t, dt) => { mallet(F_ARP[i], t, i % 2 ? 0.045 : 0.07); if (i % 8 === 0) bass([41, 38, 34, 36][i / 8], t, dt * 6, 0.11); if (F_MEL[i]) voice(mtof(F_MEL[i]), t, { vol: 0.055, d: dt * 3.4, a: 0.09, vib: true, echo: true }); if (i % 8 === 4) hat(t, 0.012); } };
  // かがみ池: まばらな オルゴールと 水の 粒
  const L_MEL = [83, 0, 0, 0, 0, 0, 79, 0, 0, 0, 74, 0, 0, 0, 0, 0, 81, 0, 0, 0, 0, 0, 78, 0, 0, 0, 71, 0, 0, 0, 0, 0];
  SONGS.lake = { bpm: 64, len: 32, play: (i, t, dt) => { if (L_MEL[i]) musicbox(L_MEL[i], t, 0.075); if (i % 16 === 0) pad(i ? [50, 57, 62, 66] : [52, 55, 62, 67], t, dt * 17, 0.016, 900); if (i % 8 === 0) bass([40, 47, 38, 45][i / 8], t, dt * 6, 0.07); if (i % 7 === 4) voice(1500 + (i * 233) % 900, t + dt * 0.5, { f2: 2900, ft: 0.05, d: 0.1, vol: 0.016, echo: true }); } };
  // ひとつ星駅: ひとりの ピアノと、遠い レールの 音
  const S_MEL = [69, 0, 0, 0, 72, 0, 71, 0, 0, 0, 64, 0, 0, 0, 0, 0, 67, 0, 0, 0, 71, 0, 69, 0, 0, 0, 62, 0, 0, 0, 0, 0, 65, 0, 0, 0, 69, 0, 67, 0, 0, 0, 60, 0, 0, 0, 0, 0, 64, 0, 0, 0, 68, 0, 71, 0, 76, 0, 0, 0, 0, 0, 0, 0];
  SONGS.station = { bpm: 68, len: 64, play: (i, t, dt) => { const bar = Math.floor(i / 16), s = i % 16; if (S_MEL[i]) piano(S_MEL[i], t, 0.1, 2.6); if (s === 0) { piano([45, 43, 41, 40][bar], t, 0.07, 3.4); piano([52, 50, 48, 47][bar], t + dt * 0.5, 0.04, 3); } if (s === 8) piano([57, 55, 53, 56][bar], t, 0.032, 2.4); if (s === 12 || s === 13) { wash(t, 0.05, 0.028, 1800, 4200, 0.002); wash(t + dt * 0.35, 0.05, 0.02, 1500, 3600, 0.002); } } };
  // 星見の尾根: ひろい 空と 鐘
  SONGS.ridge = { bpm: 60, len: 32, play: (i, t, dt) => { const bar = Math.floor(i / 8), ch = [[50, 57, 62, 66, 73], [47, 54, 59, 62, 69], [43, 50, 55, 59, 66], [45, 52, 57, 61, 64]][bar], s = i % 8; if (s === 0) { pad(ch.slice(0, 4), t, dt * 9.5, 0.017, 1100); voice(mtof(ch[0] - 12), t, { vol: 0.09, d: dt * 8, a: dt }); } if (s === 2) bell(ch[4] + 12, t, 0.04); if (s === 5 && bar % 2) bell(ch[3] + 12, t, 0.028); if (i % 11 === 6) voice(2600 + (i * 97) % 600, t, { vol: 0.012, d: 0.5, a: 0.01, echo: true }); } };
  // モンスターの 鳴き声(どれも その場で 合成)。進化後は 低く 長く。down: たおれる とき
  const CRY = {
    mikanya: (t, p, l) => { voice(620 * p, t, { type: 'triangle', f2: 920 * p, ft: 0.11 * l, d: 0.13 * l, vol: 0.12 }); voice(940 * p, t + 0.12 * l, { type: 'triangle', f2: 520 * p, d: 0.32 * l, vol: 0.13, vib: true }); },
    pukurisu: (t, p, l) => { [0, 0.07, 0.14, 0.24].forEach((a, i) => voice((1250 + i * 90) * p, t + a * l, { type: 'square', f2: (1700 + i * 60) * p, ft: 0.04, d: 0.06 * l, vol: 0.055, lp: 4000 })); },
    hinatagaeru: (t, p, l) => { [0, 0.2].forEach((a) => { for (let i = 0; i < 6; i++) voice((170 - i * 5) * p, t + (a + i * 0.022) * l, { type: 'sawtooth', d: 0.03 * l, vol: 0.13, lp: 1100 }); }); },
    hotaruusagi: (t, p, l) => { musicbox(88 + Math.round(12 * Math.log2(p)), t, 0.09); musicbox(93 + Math.round(12 * Math.log2(p)), t + 0.1 * l, 0.08); voice(700 * p, t, { f2: 1150 * p, d: 0.2 * l, vol: 0.07 }); },
    kinokokko: (t, p, l) => { voice(330 * p, t, { f2: 190 * p, d: 0.16 * l, vol: 0.2 }); voice(260 * p, t + 0.18 * l, { f2: 150 * p, d: 0.24 * l, vol: 0.18 }); },
    shizukufin: (t, p, l) => { [0, 0.09, 0.19].forEach((a, i) => voice((420 + i * 160) * p, t + a * l, { f2: (900 + i * 260) * p, ft: 0.07 * l, d: 0.11 * l, vol: 0.12, echo: true })); },
    birisuzume: (t, p, l) => { [0, 0.08, 0.16].forEach((a) => voice(2100 * p, t + a * l, { type: 'square', f2: 1500 * p, d: 0.05 * l, vol: 0.05 })); for (let i = 0; i < 5; i++) voice((900 + (i * 331) % 900) * p, t + (0.25 + i * 0.02) * l, { type: 'square', d: 0.02, vol: 0.04 }); },
    hanedoron: (t, p, l) => { for (let i = 0; i < 12; i++) voice((i % 2 ? 330 : 300) * p, t + i * 0.028 * l, { type: 'sawtooth', d: 0.035 * l, vol: 0.08, lp: 2200 }); voice(1400 * p, t + 0.34 * l, { type: 'square', d: 0.07 * l, vol: 0.05 }); },
    hikaritanishi: (t, p, l) => { voice(480 * p, t, { f2: 720 * p, d: 0.55 * l, vol: 0.1, a: 0.15, vib: true, echo: true }); voice(962 * p, t + 0.1 * l, { d: 0.35 * l, vol: 0.04, a: 0.1, echo: true }); },
    sabikani: (t, p, l) => { [0, 0.09, 0.15].forEach((a) => { voice(1500 * p, t + a * l, { type: 'triangle', d: 0.05, vol: 0.12, a: 0.001 }); wash(t + a * l, 0.04, 0.1, 3000, 9000, 0.001); }); voice(180 * p, t + 0.22 * l, { type: 'sawtooth', f2: 130 * p, d: 0.2 * l, vol: 0.09, lp: 800 }); },
    kirikamome: (t, p, l) => { [0, 0.24].forEach((a) => voice(1150 * p, t + a * l, { type: 'sawtooth', f2: 720 * p, d: 0.22 * l, vol: 0.07, lp: 2600, vib: true, echo: true })); },
    funenko: (t, p, l) => { voice(130 * p, t, { type: 'sawtooth', d: 0.6 * l, vol: 0.11, a: 0.08, lp: 700 }); voice(98 * p, t, { type: 'sawtooth', d: 0.6 * l, vol: 0.1, a: 0.08, lp: 600 }); },
  };
  function cry(id, down) {
    if (muted || !ensure() || typeof SPECIES === 'undefined' || !SPECIES[id]) return;
    const base = SPECIES[id].from, f = CRY[id] || CRY[base]; if (!f) return;
    try { f(ctx.currentTime + 0.01, (base ? 0.76 : 1) * (down ? 0.62 : 1), (base ? 1.3 : 1) * (down ? 1.5 : 1)); } catch (e) {}
  }
  // ---------- 環境音: 流れつづける 音(風・波・雨)と、ときどき 聞こえる 音(鳥・虫・かもめ など) ----------
  const R = (a, b) => a + Math.random() * (b - a);
  // bed: [下を けずる, 上を けずる, 大きさ, ゆれの 速さ, ゆれの 深さ]
  const BED = {
    breeze: [60, 520, 0.045, 0.11, 0.6], wind: [90, 760, 0.06, 0.08, 0.75], leaves: [1800, 6200, 0.014, 0.27, 0.7], waves: [40, 620, 0.12, 0.105, 0.9], lap: [160, 1100, 0.035, 0.34, 0.85], dam: [220, 1500, 0.022, 0.5, 0.15], rain: [900, 7000, 0.06, 0.21, 0.15], hum: [30, 140, 0.05, 0.9, 0.2],
  };
  const EV = {
    bird: (t) => { const f = R(2200, 3400), n = 2 + (Math.random() * 3 | 0); for (let i = 0; i < n; i++) voice(f * R(0.94, 1.08), t + i * 0.11, { f2: f * R(1.15, 1.45), ft: 0.05, d: 0.07, vol: 0.022 }); },
    warbler: (t) => { voice(1500, t, { d: 0.5, vol: 0.014, a: 0.2 }); [2100, 2700, 2350].forEach((f, i) => voice(f, t + 0.55 + i * 0.12, { f2: f * 1.1, d: 0.1, vol: 0.022, echo: true })); },
    peck: (t) => { for (let i = 0; i < 7; i++) wash(t + i * 0.055, 0.025, 0.045, 700, 2600, 0.002); },
    cricket: (t) => { const f = R(4100, 4700); for (let j = 0; j < 3; j++) for (let i = 0; i < 4; i++) voice(f, t + j * 0.26 + i * 0.035, { d: 0.028, vol: 0.011, a: 0.004 }); },
    bell_bug: (t) => { for (let i = 0; i < 14; i++) voice(3300 + (i % 2) * 40, t + i * 0.05, { d: 0.04, vol: 0.007, a: 0.006 }); },
    frog: (t) => { const f = R(150, 240); for (let j = 0; j < 2; j++) for (let i = 0; i < 6; i++) voice(f - i * 4, t + j * 0.3 + i * 0.024, { type: 'sawtooth', d: 0.03, vol: 0.036, lp: 1100 }); },
    owl: (t) => { [0, 0.45].forEach((a, i) => voice(i ? 330 : 370, t + a, { f2: i ? 300 : 345, d: i ? 0.7 : 0.28, vol: 0.04, a: 0.08, echo: true })); },
    gull: (t) => { for (let i = 0; i < 2 + (Math.random() * 2 | 0); i++) voice(R(1050, 1250), t + i * 0.34, { type: 'sawtooth', f2: R(680, 780), d: 0.26, vol: 0.016, lp: 2600, vib: true, echo: true }); },
    horn: (t) => { [98, 98.8, 147].forEach((f) => voice(f, t, { type: 'sawtooth', d: 2.6, a: 0.5, vol: 0.022, lp: 420, echo: true })); },
    drone: (t) => { for (let i = 0; i < 3; i++) voice(R(180, 230), t + i * 0.18, { type: 'sawtooth', f2: R(250, 330), d: 0.5, a: 0.2, vol: 0.012, lp: 1400 }); },
    spark: (t) => { for (let i = 0; i < 4; i++) wash(t + i * R(0.02, 0.06), 0.015, 0.03, 4000, 11000, 0.001); },
    drip: (t) => { const f = R(900, 1900); voice(f, t, { f2: f * 1.9, ft: 0.05, d: 0.08, vol: 0.02, echo: true }); },
    farbell: (t) => { [392, 784, 1176].forEach((f, i) => voice(f * R(0.998, 1.002), t, { vol: 0.016 / (i + 1), d: 3.2, a: 0.006, echo: true })); },
    crossing: (t) => { for (let i = 0; i < 6; i++) voice(i % 2 ? 700 : 750, t + i * 0.34, { type: 'triangle', d: 0.2, vol: 0.011, lp: 1600, echo: true }); },
    creak: (t) => { voice(R(240, 330), t, { type: 'sawtooth', f2: R(170, 220), d: 0.5, a: 0.15, vol: 0.011, lp: 900 }); },
    hawk: (t) => { voice(2300, t, { type: 'triangle', f2: 1500, d: 0.7, a: 0.06, vol: 0.016, echo: true }); },
    thunder: (t) => { wash(t, 2.6, 0.09, 30, 240, 0.5); wash(t + 0.7, 2.2, 0.06, 30, 180, 0.4); },
  };
  // 場所: [流れる音, 昼の音, 夜の音, 間かく(秒)]
  const AMB = {
    village: [['breeze'], ['bird', 'bird', 'warbler'], ['cricket', 'cricket', 'bell_bug'], [2.5, 7]],
    field: [['breeze', 'leaves'], ['bird', 'bird', 'cricket'], ['cricket', 'bell_bug'], [2, 6]],
    town1: [['breeze'], ['bird', 'farbell'], ['cricket', 'bell_bug'], [5, 12]],
    wires: [['breeze', 'hum'], ['bird', 'spark'], ['cricket', 'spark'], [3, 8]],
    town2: [['hum', 'breeze'], ['drone', 'spark', 'drone'], ['drone', 'cricket'], [4, 10]],
    coast: [['waves', 'breeze'], ['gull'], ['bell_bug', 'cricket'], [4, 10]],
    harbor: [['waves'], ['gull', 'gull', 'horn'], ['horn', 'drip'], [5, 12]],
    mountain: [['wind'], ['hawk', 'bird'], ['owl', 'bell_bug'], [5, 13]],
    dam: [['wind', 'dam'], ['hawk', 'farbell'], ['owl', 'farbell'], [6, 14]],
    forest: [['leaves', 'breeze'], ['bird', 'warbler', 'bird', 'peck'], ['owl', 'cricket'], [1.8, 5]],
    lake: [['lap', 'breeze'], ['bird', 'frog', 'drip'], ['frog', 'frog', 'cricket'], [2.5, 6]],
    station: [['breeze'], ['creak', 'bird', 'crossing'], ['crossing', 'cricket'], [5, 12]],
  };
  let ambKey = null, ambNodes = [], ambDef = null, ambNight = false, ambRain = false, ambAt = 0, ambTimer = null, longBuf = null;
  function startBed(name) {
    const [hp, lp, vol, rate, depth] = BED[name], t = ctx.currentTime;
    if (!longBuf) { longBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 4), ctx.sampleRate); const d = longBuf.getChannelData(0); let b = 0; for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; b = b * 0.6 + w * 0.4; d[i] = w * 0.5 + b * 0.8; } }
    const s = ctx.createBufferSource(), h = ctx.createBiquadFilter(), l = ctx.createBiquadFilter(), sw = ctx.createGain(), fadeG = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain();
    s.buffer = longBuf; s.loop = true; h.type = 'highpass'; h.frequency.value = hp; l.type = 'lowpass'; l.frequency.value = lp;
    sw.gain.value = 1 - depth * 0.5; lfo.frequency.value = rate * R(0.9, 1.1); lg.gain.value = depth * 0.5; lfo.connect(lg); lg.connect(sw.gain);
    fadeG.gain.setValueAtTime(0.0001, t); fadeG.gain.exponentialRampToValueAtTime(vol, t + 1.4);
    s.connect(h); h.connect(l); l.connect(sw); sw.connect(fadeG); fadeG.connect(master); s.start(t, Math.random() * 3); lfo.start(t);
    return { s, lfo, fadeG, vol };
  }
  function ambTick() {
    if (!ctx || !ambDef || muted || ctx.state !== 'running' || ctx.currentTime < ambAt) return;
    const list = ambRain ? ['drip', 'drip', 'drip', 'thunder'] : ambNight ? ambDef[2] : ambDef[1], name = list[Math.random() * list.length | 0];
    if (name !== 'thunder' || Math.random() < 0.3) { try { EV[name](ctx.currentTime + 0.05); } catch (e) {} }
    ambAt = ctx.currentTime + R(ambDef[3][0], ambDef[3][1]) * (ambRain ? 0.5 : 1);
  }
  // place: AMB の名前(null で 止める)
  function ambient(place, night = false, rain = false) {
    const key = place && AMB[place] ? `${place}|${night ? 1 : 0}|${rain ? 1 : 0}` : null;
    if (key === ambKey || (key && !ctx)) return;
    ambKey = key; if (!ctx) return;
    const t = ctx.currentTime;
    for (const n of ambNodes) { try { n.fadeG.gain.cancelScheduledValues(t); n.fadeG.gain.setValueAtTime(n.vol, t); n.fadeG.gain.exponentialRampToValueAtTime(0.0001, t + 0.7); n.s.stop(t + 0.8); n.lfo.stop(t + 0.8); } catch (e) {} }
    ambNodes = []; ambDef = key ? AMB[place] : null; ambNight = night; ambRain = rain;
    if (!ambDef) return;
    ambNodes = [...ambDef[0], ...(rain ? ['rain'] : [])].map(startBed); ambAt = t + R(0.8, 2.5);
    if (!ambTimer) ambTimer = setInterval(ambTick, 250);
  }
  function sched() {
    if (!ctx || !cur || muted) return;
    const s = SONGS[cur] || SONGS.field, dt = 60 / s.bpm / 2;
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
  return { sfx, cry, bgm, ambient, start, stop, unlock, setTheme, setLit: (v) => { litForce = v; }, get theme() { return themeKey; }, get state() { return ctx ? ctx.state : 'none'; }, setMute, setWarm: (w) => { warm = w; }, get muted() { return muted; }, ensure };
})();
