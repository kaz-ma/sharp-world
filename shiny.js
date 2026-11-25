// 色違い(ひかりの個体)の 塗り分け。ここに ない 種族は、art.js が 色相を ずらして 作る(ほたるうさぎ・ひもりうさぎ・サビガニ)
// ramp は 明るさ(0〜1)→ 色。rules は 後ろほど 上に 重なる。場所の 指定は 絵の 中の 割合 box [左, 上, 右, 下] / ell [x, y, 横, 縦] / poly
const SHINY = (() => {
// 型紙の ふちを ぼかす(たて・よこの 平均を 3回)
function blur(a, W, H, r) {
  const b = new Float32Array(a.length), n = 2 * r + 1;
  for (let k = 0; k < 3; k++) {
    for (let y = 0; y < H; y++) { let sum = 0; const o = y * W; for (let x = -r; x <= r; x++) sum += a[o + Math.max(0, Math.min(W - 1, x))]; for (let x = 0; x < W; x++) { b[o + x] = sum / n; sum += a[o + Math.min(W - 1, x + r + 1)] - a[o + Math.max(0, x - r)]; } }
    for (let x = 0; x < W; x++) { let sum = 0; for (let y = -r; y <= r; y++) sum += b[Math.max(0, Math.min(H - 1, y)) * W + x]; for (let y = 0; y < H; y++) { a[y * W + x] = sum / n; sum += b[Math.min(H - 1, y + r + 1) * W + x] - b[Math.max(0, y - r) * W + x]; } }
  }
  return a;
}
const GOLD_EYE = ['#150a00', 0.3, '#8a4e00', 0.5, '#ffb800', 0.68, '#ffe25a', 0.85, '#fff4c0', 1, '#ffffff'];
const BLUE_FIRE = ['#04102a', 0.35, '#0b3aa8', 0.55, '#1793ff', 0.72, '#62e4ff', 0.88, '#d4fbff', 1, '#ffffff'];
const CAT = ['#05030a', 0.3, '#120d1a', 0.48, '#241b30', 0.62, '#3a2e4a', 0.72, '#5a4e70', 0.8, '#a29cc0', 0.89, '#dcdcf0', 1, '#ffffff'];
const SQUIRREL = ['#04050f', 0.25, '#0c1030', 0.42, '#1d2660', 0.55, '#33408c', 0.66, '#6672b4', 0.76, '#bcc6e8', 0.88, '#e6ecff', 1, '#ffffff'];
const HAT = ['#160a00', 0.3, '#6a420a', 0.45, '#b87e1a', 0.6, '#eab53c', 0.75, '#ffdd80', 1, '#fff8e0'];
const LAPIS = ['#03061a', 0.2, '#07124a', 0.32, '#0f2a86', 0.43, '#1c4cc4', 0.55, '#3d7cea', 0.7, '#7fb2ff', 1, '#e4f2ff'];
const BELLY = ['#241000', 0.3, '#74460a', 0.5, '#c0860e', 0.64, '#f2b624', 0.74, '#ffd65a', 0.86, '#ffeeb0', 1, '#fffcee'];
const CAPE = ['#14020a', 0.2, '#3a0412', 0.34, '#6e081e', 0.46, '#a4122a', 0.58, '#cc2a34', 0.72, '#e65a46', 1, '#ffd8c0'];
const RED = ['#1c0208', 0.35, '#760a22', 0.52, '#cc1836', 0.66, '#ff4452', 0.8, '#ff9a8a', 1, '#fff0ea'];

const recipes = {
  mikanya: { base: CAT, rules: [{ box: [0.68, 0.33, 0.85, 0.43], h: [0.1, 0.45], ramp: BLUE_FIRE }, { box: [0.29, 0.305, 0.57, 0.375], s: [0, 0.35], l: [0.2, 0.72], ramp: GOLD_EYE }] },
  yuuhineko: { base: CAT, rules: [{ box: [0.66, 0.0, 0.95, 0.375], blur: 12, ramp: BLUE_FIRE }, { box: [0.19, 0.245, 0.39, 0.305], s: [0, 0.35], l: [0.2, 0.74], ramp: GOLD_EYE }] },
  pukurisu: { base: SQUIRREL, rules: [{ poly: [[0.223, 0.276], [0.238, 0.260], [0.293, 0.257], [0.299, 0.270], [0.264, 0.290], [0.259, 0.316], [0.306, 0.325], [0.358, 0.344], [0.400, 0.374], [0.431, 0.414], [0.455, 0.448], [0.464, 0.472], [0.467, 0.501], [0.457, 0.521], [0.442, 0.529], [0.430, 0.517], [0.420, 0.498], [0.391, 0.482], [0.342, 0.474], [0.287, 0.473], [0.238, 0.479], [0.183, 0.490], [0.142, 0.502], [0.112, 0.515], [0.103, 0.529], [0.099, 0.561], [0.090, 0.575], [0.066, 0.568], [0.044, 0.548], [0.035, 0.518], [0.040, 0.497], [0.060, 0.469], [0.072, 0.442], [0.115, 0.382], [0.153, 0.350], [0.183, 0.332], [0.225, 0.317], [0.224, 0.292]], ramp: HAT }] },
  fukufukurisu: { base: SQUIRREL, rules: [{ poly: [[0.303, 0.100], [0.307, 0.068], [0.333, 0.051], [0.372, 0.029], [0.385, 0.040], [0.381, 0.052], [0.348, 0.075], [0.343, 0.097], [0.368, 0.095], [0.395, 0.092], [0.425, 0.105], [0.449, 0.125], [0.472, 0.143], [0.485, 0.175], [0.488, 0.199], [0.475, 0.204], [0.452, 0.193], [0.425, 0.191], [0.387, 0.195], [0.347, 0.204], [0.308, 0.221], [0.268, 0.251], [0.235, 0.281], [0.208, 0.321], [0.197, 0.348], [0.187, 0.371], [0.163, 0.369], [0.148, 0.347], [0.141, 0.319], [0.148, 0.285], [0.164, 0.252], [0.171, 0.219], [0.185, 0.184], [0.212, 0.151], [0.240, 0.131], [0.267, 0.109]], ramp: HAT }, { poly: [[0.275, 0.432], [0.312, 0.456], [0.333, 0.464], [0.355, 0.444], [0.381, 0.412], [0.420, 0.397], [0.470, 0.395], [0.509, 0.415], [0.521, 0.445], [0.541, 0.475], [0.526, 0.495], [0.550, 0.521], [0.510, 0.521], [0.496, 0.550], [0.480, 0.576], [0.460, 0.591], [0.445, 0.570], [0.415, 0.575], [0.399, 0.560], [0.389, 0.540], [0.370, 0.515], [0.350, 0.525], [0.332, 0.539], [0.320, 0.515], [0.301, 0.535], [0.291, 0.560], [0.261, 0.576], [0.250, 0.600], [0.237, 0.590], [0.224, 0.611], [0.214, 0.600], [0.199, 0.624], [0.192, 0.609], [0.199, 0.575], [0.215, 0.560], [0.199, 0.549], [0.225, 0.514], [0.245, 0.496], [0.245, 0.484], [0.265, 0.459]], ramp: CAPE }] },
  hinatagaeru: { base: LAPIS, rules: [{ h: [0.07, 0.19], ramp: BELLY }, { box: [0.3, 0, 0.7, 0.2], ramp: RED }] },
  hinatagama: { base: LAPIS, rules: [{ h: [0.07, 0.19], ramp: BELLY }, { ell: [0.5, 0.74, 0.17, 0.17], h: [0.07, 0.31], ramp: BELLY }, { box: [0.25, 0, 0.75, 0.185], ramp: RED }] },
  kinokokko: { base: ['#0a0614', 0.4, '#3a3258', 0.65, '#8a82ac', 0.8, '#c8c4e2', 0.9, '#e8e8fa', 1, '#ffffff'], rules: [
    { poly: [[0.125, 0.464], [0.129, 0.355], [0.203, 0.284], [0.269, 0.237], [0.321, 0.194], [0.363, 0.180], [0.411, 0.171], [0.477, 0.152], [0.533, 0.147], [0.595, 0.157], [0.656, 0.190], [0.713, 0.246], [0.752, 0.306], [0.809, 0.355], [0.859, 0.407], [0.879, 0.464], [0.871, 0.506], [0.836, 0.536], [0.760, 0.560], [0.666, 0.571], [0.609, 0.575], [0.588, 0.568], [0.641, 0.542], [0.664, 0.502], [0.690, 0.459], [0.590, 0.451], [0.505, 0.461], [0.420, 0.438], [0.347, 0.427], [0.354, 0.468], [0.361, 0.517], [0.380, 0.555], [0.407, 0.574], [0.363, 0.568], [0.264, 0.551], [0.193, 0.527], [0.142, 0.495]], ramp: ['#08030f', 0.4, '#1c0c3c', 0.58, '#35187a', 0.7, '#5628a8', 0.76, '#7a44c4', 0.82, '#4fe8e0', 0.9, '#b4fff4', 1, '#ffffff'] },
    { box: [0.35, 0, 0.62, 0.15], ramp: BLUE_FIRE }] },
  shizukufin: { base: ['#020515', 0.4, '#061243', 0.58, '#0a2c78', 0.68, '#10529e', 0.75, '#1680b8', 0.82, '#22b4c4', 0.88, '#5ce6d6', 0.94, '#bafff0', 1, '#ffffff'], rules: [{ ell: [0.381, 0.564, 0.027, 0.022], l: [0.15, 0.62], ramp: GOLD_EYE }, { ell: [0.617, 0.564, 0.027, 0.022], l: [0.15, 0.62], ramp: GOLD_EYE }] },
  birisuzume: { base: ['#040407', 0.28, '#0e0f18', 0.42, '#1a1d2c', 0.55, '#2c3248', 0.66, '#525c7c', 0.76, '#a4b0cc', 0.88, '#e0e8fa', 1, '#ffffff'], rules: [{ h: [0.07, 0.17], s: [0.55, 1], l: [0.5, 1], ramp: ['#012a30', 0.35, '#047a8c', 0.55, '#10d0e8', 0.68, '#4cf6ff', 0.85, '#d0ffff', 1, '#ffffff'] }] },
  hanedoron: { base: ['#020203', 0.28, '#0f0d12', 0.45, '#1f1b24', 0.58, '#38303a', 0.66, '#7c5a1e', 0.74, '#d09a2c', 0.84, '#f8cc58', 0.93, '#fff0b8', 1, '#fffdf0'], rules: [{ ell: [0.512, 0.59, 0.088, 0.088], h: [0.45, 0.72], s: [0.25, 1], ramp: RED }, { box: [0.3, 0.47, 0.68, 0.53], s: [0.4, 1], keep: true }] },
  hikaritanishi: { base: ['#0a0612', 0.35, '#2e2048', 0.52, '#594682', 0.65, '#8a74b4', 0.76, '#b8a4da', 0.9, '#ece0fc', 1, '#ffffff'], rules: [{ box: [0.38, 0.3, 0.98, 0.86], h: [0.18, 0.53], ramp: ['#030206', 0.24, '#100c1c', 0.36, '#1e1632', 0.46, '#33244c', 0.54, '#8a601c', 0.64, '#e8aa28', 0.76, '#ffd860', 0.88, '#fff0b0', 1, '#fffcf0'] }] },
  kirikamome: { base: ['#030203', 0.28, '#0c0a10', 0.42, '#19141e', 0.52, '#2c2230', 0.6, '#6e4a16', 0.68, '#c88c22', 0.76, '#f6c044', 0.86, '#ffe48c', 1, '#fffbe8'], rules: [{ box: [0.35, 0.63, 0.46, 0.75], h: [0.07, 0.17], s: [0.3, 1], ramp: RED }] }, // 黒と金
  funenko: { base: ['#030204', 0.22, '#0f0c12', 0.36, '#1d1822', 0.5, '#332a36', 0.62, '#54444c', 0.76, '#a8948a', 0.88, '#e0d0b8', 1, '#fff6e4'], rules: [
    { h: [0.99, 0.065], s: [0.28, 1], ramp: ['#120800', 0.25, '#4a2c06', 0.4, '#8e600e', 0.55, '#d09a24', 0.72, '#ffd058', 1, '#fff4cc'] },
    { poly: [[0.715, 0.19], [0.97, 0.265], [0.95, 0.31], [0.9, 0.45], [0.83, 0.42], [0.75, 0.46], [0.72, 0.36], [0.74, 0.26]], l: [0.28, 1], ramp: RED },
    { box: [0.585, 0.325, 0.655, 0.41], l: [0.42, 1], ramp: BLUE_FIRE },
    { ell: [0.3, 0.606, 0.068, 0.034], l: [0.35, 1], ramp: BLUE_FIRE }] },
};
// 絵(canvas)を 塗り分けた 新しい canvas を 返す
function paint(spr, rec) {
  const W = spr.width, H = spr.height, c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(spr, 0, 0);
  const im = g.getImageData(0, 0, W, H), d = im.data;
  const lut = (r) => { // ['#色', 位置, '#色', …, 1, '#色'] を 256段の 表に
    const st = [[0, r[0]]]; for (let i = 1; i < r.length; i += 2) st.push([r[i], r[i + 1]]);
    const t = new Uint8Array(768); let k = 0;
    for (let v = 0; v < 256; v++) { const x = v / 255; while (k < st.length - 2 && x > st[k + 1][0]) k++; const [a, ca] = st[k], [b, cb] = st[k + 1], f = Math.max(0, Math.min(1, (x - a) / (b - a || 1)));
      for (let j = 0; j < 3; j++) { const p = parseInt(ca.slice(1 + j * 2, 3 + j * 2), 16), q = parseInt(cb.slice(1 + j * 2, 3 + j * 2), 16); t[v * 3 + j] = Math.round(p + (q - p) * f); } }
    return t;
  };
  const soft = (v, lo, hi, e) => Math.max(0, Math.min(1, (v - lo) / e + 0.5)) * Math.max(0, Math.min(1, (hi - v) / e + 0.5));
  // 場所の 指定は 先に 型紙に して、ふちを ぼかす
  const mask = (r) => {
    if (!r.box && !r.ell && !r.poly) return null;
    const m = document.createElement('canvas'); m.width = W; m.height = H; const mg = m.getContext('2d', { willReadFrequently: true });
    mg.fillStyle = '#fff'; mg.beginPath();
    if (r.box) mg.rect(r.box[0] * W, r.box[1] * H, (r.box[2] - r.box[0]) * W, (r.box[3] - r.box[1]) * H);
    else if (r.ell) mg.ellipse(r.ell[0] * W, r.ell[1] * H, r.ell[2] * W, r.ell[3] * H, 0, 0, 7);
    else r.poly.forEach(([x, y], i) => mg[i ? 'lineTo' : 'moveTo'](x * W, y * H));
    mg.fill();
    const px = mg.getImageData(0, 0, W, H).data, a = new Float32Array(W * H);
    for (let i = 0; i < a.length; i++) a[i] = px[i * 4 + 3];
    return blur(a, W, H, Math.max(1, Math.round((r.blur || W / 260) * 0.9)));
  };
  const base = lut(rec.base), rules = (rec.rules || []).map((r) => ({ ...r, t: r.ramp && lut(r.ramp), m: mask(r) }));
  for (let i = 0; i < d.length; i += 4) {
    if (!d[i + 3]) continue;
    const r0 = d[i], g0 = d[i + 1], b0 = d[i + 2], r = r0 / 255, gg = g0 / 255, b = b0 / 255, mx = Math.max(r, gg, b), mn = Math.min(r, gg, b), l = (mx + mn) / 2, dl = mx - mn;
    let h = 0, s = 0; if (dl > 0) { s = l > 0.5 ? dl / (2 - mx - mn) : dl / (mx + mn); h = (mx === r ? (gg - b) / dl + (gg < b ? 6 : 0) : mx === gg ? (b - r) / dl + 2 : (r - gg) / dl + 4) / 6; }
    const v = Math.round(l * 255) * 3; let R = base[v], G = base[v + 1], B = base[v + 2];
    for (const q of rules) {
      let w = q.m ? q.m[i >> 2] / 255 : 1; if (w <= 0.001) continue;
      if (q.h) { const [a, z] = q.h, mid = a <= z ? (a + z) / 2 : ((a + z + 1) / 2) % 1, half = (a <= z ? z - a : z + 1 - a) / 2; let dist = Math.abs(h - mid); if (dist > 0.5) dist = 1 - dist; w *= Math.max(0, Math.min(1, (half - dist) / 0.03 + 0.5)) * Math.min(1, s / 0.08); }
      if (q.s) w *= soft(s, q.s[0] || -1, q.s[1] >= 1 ? 2 : q.s[1], 0.1);
      if (q.l) w *= soft(l, q.l[0] || -1, q.l[1] >= 1 ? 2 : q.l[1], 0.08);
      if (w <= 0) continue;
      const nr = q.keep ? r0 : q.t[v], ng = q.keep ? g0 : q.t[v + 1], nb = q.keep ? b0 : q.t[v + 2];
      R += (nr - R) * w; G += (ng - G) * w; B += (nb - B) * w;
    }
    d[i] = R; d[i + 1] = G; d[i + 2] = B;
  }
  g.putImageData(im, 0, 0); return c;
}
// 場所の 指定(小さな 絵の 中の 割合)を、べつの 置き方の 絵の 割合に 直す。(x0, y0, w, h)= 小さな 絵の中で その絵が ある 場所
function fit(rec, x0, y0, w, h, scale) {
  const U = (u) => (u - x0) / w, V = (v) => (v - y0) / h;
  return { base: rec.base, rules: rec.rules.map((r) => ({ ...r,
    blur: r.blur && r.blur * scale,
    box: r.box && [U(r.box[0]), V(r.box[1]), U(r.box[2]), V(r.box[3])],
    ell: r.ell && [U(r.ell[0]), V(r.ell[1]), r.ell[2] / w, r.ell[3] / h],
    poly: r.poly && r.poly.map(([x, y]) => [U(x), V(y)]) })) };
}
return { recipes, paint, fit };
})();
