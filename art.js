// 絵(すべてコードで描く)。モンスターは192x192のスプライトに事前描画。ミカニャだけは取り込んだ絵を使う。
const Art = (() => {
  const S = 192, TS = 32;
  const ink = '#5b3d33';
  const sprites = {};
  const cache = {};
  const hash = (x, y) => (((x * 73856093) ^ (y * 19349663)) >>> 0);
  const cv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

  function ell(g, x, y, rx, ry, fill, rot = 0, stroke) {
    g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
    if (fill) { g.fillStyle = fill; g.fill(); }
    if (stroke) { g.lineWidth = 2.5; g.strokeStyle = stroke; g.stroke(); }
  }
  // やわらかい立体感のあるまるい塊
  function blob(g, x, y, rx, ry, c1, c2, rot = 0) {
    const gr = g.createRadialGradient(x - rx * 0.35, y - ry * 0.45, Math.min(rx, ry) * 0.1, x, y, Math.max(rx, ry) * 1.05);
    gr.addColorStop(0, c1); gr.addColorStop(1, c2);
    g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
    g.fillStyle = gr; g.fill();
    g.lineWidth = 2.5; g.strokeStyle = 'rgba(80,45,35,.42)'; g.stroke();
  }
  function eye(g, x, y, r) {
    ell(g, x, y, r * 0.86, r, '#3a2a2a');
    ell(g, x - r * 0.26, y - r * 0.36, r * 0.36, r * 0.36, '#fff');
    ell(g, x + r * 0.32, y + r * 0.3, r * 0.17, r * 0.17, '#fff');
  }
  function blush(g, x, y, r) { g.save(); g.globalAlpha = 0.6; ell(g, x, y, r, r * 0.68, '#ff9aa8'); g.restore(); }
  function smile(g, x, y, w) {
    g.beginPath(); g.moveTo(x - w, y); g.quadraticCurveTo(x - w / 2, y + w * 0.75, x, y); g.quadraticCurveTo(x + w / 2, y + w * 0.75, x + w, y);
    g.lineWidth = 3; g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = ink; g.stroke();
  }

  // ---------- モンスター(仮絵) ----------
  const DRAW = {
    pukurisu(g) {
      blob(g, 152, 112, 28, 48, '#ecc088', '#c98a52', 0.45);
      blob(g, 154, 108, 13, 30, '#f8dcae', '#ecc088', 0.45);
      blob(g, 66, 54, 14, 22, '#d9a066', '#b9763e', -0.3); blob(g, 66, 56, 7, 13, '#ffc4b4', '#f4a898', -0.3);
      blob(g, 126, 54, 14, 22, '#d9a066', '#b9763e', 0.3); blob(g, 126, 56, 7, 13, '#ffc4b4', '#f4a898', 0.3);
      blob(g, 70, 172, 17, 9, '#c98a52', '#8f5428'); blob(g, 122, 172, 17, 9, '#c98a52', '#8f5428');
      blob(g, 96, 134, 42, 40, '#e0aa70', '#b9763e');
      blob(g, 96, 142, 25, 27, '#fff4da', '#f1d8ab');
      blob(g, 58, 140, 10, 17, '#d9a066', '#a8703e', 0.3); blob(g, 134, 140, 10, 17, '#d9a066', '#a8703e', -0.3);
      blob(g, 96, 88, 47, 40, '#ecb87c', '#c98a52');
      blob(g, 96, 102, 23, 15, '#fff4da', '#f1d8ab');
      eye(g, 74, 90, 8.5); eye(g, 118, 90, 8.5);
      ell(g, 96, 95, 5, 3.6, ink); smile(g, 96, 104, 7);
      blush(g, 58, 102, 9); blush(g, 134, 102, 9);
      blob(g, 96, 56, 37, 21, '#b27a48', '#7c4b26');
      g.fillStyle = '#7c4b26'; g.beginPath(); g.roundRect(92, 28, 8, 16, 3); g.fill();
      g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 3; g.beginPath(); g.moveTo(74, 52); g.quadraticCurveTo(96, 44, 118, 52); g.stroke();
    },
    hinatagaeru(g) {
      blob(g, 48, 168, 21, 10, '#7fd6b8', '#43a98a'); blob(g, 144, 168, 21, 10, '#7fd6b8', '#43a98a');
      blob(g, 96, 126, 58, 46, '#a6ecd0', '#52b996');
      blob(g, 96, 140, 38, 29, '#f4fff8', '#cfeedd');
      blob(g, 44, 150, 12, 17, '#8fe0c2', '#52b996', 0.3); blob(g, 148, 150, 12, 17, '#8fe0c2', '#52b996', -0.3);
      blob(g, 62, 84, 23, 22, '#a6ecd0', '#52b996'); blob(g, 130, 84, 23, 22, '#a6ecd0', '#52b996');
      ell(g, 62, 84, 15, 15, '#fff'); ell(g, 130, 84, 15, 15, '#fff');
      eye(g, 64, 86, 10); eye(g, 128, 86, 10);
      smile(g, 96, 118, 22);
      blush(g, 50, 112, 10); blush(g, 142, 112, 10);
      g.strokeStyle = '#43a98a'; g.lineWidth = 4; g.lineCap = 'round';
      g.beginPath(); g.moveTo(96, 92); g.quadraticCurveTo(100, 68, 96, 46); g.stroke();
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; ell(g, 96 + Math.cos(a) * 17, 34 + Math.sin(a) * 15, 6.5, 4.6, i % 2 ? '#ffe36a' : '#ffd23c', a); }
      blob(g, 96, 34, 11, 10, '#fff0a0', '#ffc928');
      g.fillStyle = '#fff'; for (const [x, y] of [[118, 18], [124, 30], [70, 16]]) { g.beginPath(); g.arc(x, y, 2.4, 0, 7); g.fill(); }
    },
    hotaruusagi(g) {
      blob(g, 142, 154, 14, 13, '#ffffff', '#ffe2c4');
      for (const sx of [-1, 1]) {
        const ex = 96 + sx * 26; blob(g, ex, 54, 15, 40, '#fff0dc', '#ffcf9e', sx * 0.14); blob(g, ex, 58, 7, 28, '#ffc0c8', '#ff9fa8', sx * 0.14);
      }
      blob(g, 96, 142, 40, 35, '#fff6e8', '#ffd7b0');
      blob(g, 66, 172, 15, 8, '#fff0dc', '#e6b88c'); blob(g, 126, 172, 15, 8, '#fff0dc', '#e6b88c');
      blob(g, 96, 100, 45, 38, '#fff6e8', '#ffd7b0');
      for (const sx of [-1, 1]) {
        const tx = 96 + sx * 30, ty = 20;
        const gr = g.createRadialGradient(tx, ty, 2, tx, ty, 24); gr.addColorStop(0, 'rgba(255,230,120,.95)'); gr.addColorStop(1, 'rgba(255,150,60,0)');
        g.fillStyle = gr; g.beginPath(); g.arc(tx, ty, 24, 0, 7); g.fill();
        ell(g, tx, ty + 2, 9, 11, '#ffb347', sx * 0.1); ell(g, tx, ty + 3, 5.5, 7, '#fff4a8');
      }
      eye(g, 74, 100, 8.5); eye(g, 118, 100, 8.5);
      ell(g, 96, 107, 4.6, 3.2, '#e8788a'); smile(g, 96, 114, 6.5);
      blush(g, 58, 112, 9); blush(g, 134, 112, 9);
      blob(g, 56, 142, 9, 14, '#fff0dc', '#ffd7b0', 0.4); blob(g, 136, 142, 9, 14, '#fff0dc', '#ffd7b0', -0.4);
    },
    kinokokko(g) {
      blob(g, 72, 172, 14, 8, '#f6e2c4', '#d9b98e'); blob(g, 120, 172, 14, 8, '#f6e2c4', '#d9b98e');
      blob(g, 96, 138, 37, 40, '#fff7e6', '#ecd4aa');
      blob(g, 62, 148, 9, 15, '#fff0d4', '#e1c598', 0.3); blob(g, 130, 148, 9, 15, '#fff0d4', '#e1c598', -0.3);
      g.strokeStyle = ink; g.lineWidth = 3.4; g.lineCap = 'round';
      for (const x of [78, 114]) { g.beginPath(); g.arc(x, 130, 7, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke(); }
      ell(g, 96, 143, 3.6, 4.4, ink); blush(g, 66, 138, 8.5); blush(g, 126, 138, 8.5);
      const gr = g.createRadialGradient(72, 52, 6, 96, 90, 80); gr.addColorStop(0, '#ffc6d4'); gr.addColorStop(1, '#ec7a98');
      g.beginPath(); g.ellipse(96, 100, 74, 62, 0, Math.PI, Math.PI * 2); g.closePath(); g.fillStyle = gr; g.fill(); g.lineWidth = 2.5; g.strokeStyle = 'rgba(80,45,35,.42)'; g.stroke();
      blob(g, 96, 101, 74, 9, '#f6d6bc', '#e4b896');
      for (const [x, y, r] of [[62, 74, 10], [100, 56, 12], [132, 80, 9], [80, 92, 6], [118, 98, 5], [48, 92, 5]]) { ell(g, x, y, r, r * 0.92, '#fff6ea'); }
      g.strokeStyle = '#4fae6a'; g.lineWidth = 3.4; g.beginPath(); g.moveTo(96, 40); g.quadraticCurveTo(96, 30, 100, 24); g.stroke();
      blob(g, 108, 22, 12, 6, '#8fe39a', '#44a85e', -0.5); blob(g, 90, 24, 11, 5.5, '#8fe39a', '#44a85e', 0.5);
    },
    sabikani(g) { // 仮絵: 錆びたカニ
      g.strokeStyle = '#6d3e26'; g.lineWidth = 5; g.lineCap = 'round'; for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(96 + sx * 34, 140 + i * 6); g.lineTo(96 + sx * (58 + i * 4), 156 + i * 6); g.lineTo(96 + sx * (62 + i * 4), 176); g.stroke(); }
      blob(g, 96, 132, 56, 36, '#c98a5e', '#8a4e2e');
      for (const sx of [-1, 1]) { g.strokeStyle = '#8a4e2e'; g.lineWidth = 6; g.beginPath(); g.moveTo(96 + sx * 46, 120); g.lineTo(96 + sx * 62, 92); g.stroke(); blob(g, 96 + sx * 64, 84, 24, 20, '#d99a6a', '#8a4e2e', sx * 0.4); g.strokeStyle = '#5a3320'; g.lineWidth = 3; g.beginPath(); g.moveTo(96 + sx * 54, 78); g.lineTo(96 + sx * 76, 84); g.stroke(); }
      g.fillStyle = 'rgba(90,50,30,.35)'; for (const [x, y] of [[70, 126], [118, 140], [92, 148], [108, 120]]) { g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill(); }
      for (const sx of [-1, 1]) { g.strokeStyle = '#8a4e2e'; g.lineWidth = 3.5; g.beginPath(); g.moveTo(96 + sx * 14, 108); g.lineTo(96 + sx * 16, 92); g.stroke(); ell(g, 96 + sx * 16, 90, 7, 7, '#fff', 0, '#8a4e2e'); ell(g, 96 + sx * 16, 91, 3.4, 3.4, '#3a2a2a'); }
      smile(g, 96, 138, 8);
    },
    kirikamome(g) { // 仮絵: 霧のカモメ
      g.strokeStyle = '#d9a64a'; g.lineWidth = 4; g.lineCap = 'round'; for (const x of [86, 106]) { g.beginPath(); g.moveTo(x, 150); g.lineTo(x, 172); g.moveTo(x - 6, 173); g.lineTo(x + 8, 173); g.stroke(); }
      blob(g, 40, 112, 36, 18, '#c8d0d8', '#8f9aa6', -0.5); blob(g, 152, 112, 36, 18, '#c8d0d8', '#8f9aa6', 0.5);
      blob(g, 96, 124, 40, 34, '#eef1f3', '#bcc5cc'); blob(g, 96, 84, 30, 28, '#f6f8f9', '#c8d0d8');
      g.fillStyle = '#e0a840'; g.beginPath(); g.moveTo(84, 90); g.lineTo(122, 94); g.lineTo(84, 104); g.closePath(); g.fill();
      eye(g, 82, 78, 6); blush(g, 74, 92, 6);
      g.fillStyle = 'rgba(120,130,150,.5)'; g.beginPath(); g.ellipse(96, 62, 14, 6, 0, 0, 7); g.fill();
    },
    funenko(g) { // 仮絵: 小舟のモンスター
      ell(g, 96, 168, 62, 8, 'rgba(150,190,215,.7)');
      g.fillStyle = '#6a7a8c'; g.beginPath(); g.moveTo(34, 118); g.quadraticCurveTo(96, 150, 158, 118); g.lineTo(144, 160); g.quadraticCurveTo(96, 178, 48, 160); g.closePath(); g.fill(); g.lineWidth = 2.5; g.strokeStyle = 'rgba(40,40,60,.5)'; g.stroke();
      g.fillStyle = '#9aa8b8'; g.fillRect(40, 118, 112, 10);
      g.strokeStyle = '#4a4a5a'; g.lineWidth = 5; g.beginPath(); g.moveTo(96, 118); g.lineTo(96, 46); g.stroke(); g.fillStyle = '#d9735b'; g.beginPath(); g.moveTo(98, 48); g.lineTo(134, 60); g.lineTo(98, 72); g.closePath(); g.fill();
      ell(g, 96, 142, 22, 22, '#dfe8ee', 0, '#4a5a6a'); eye(g, 96, 142, 9);
      g.fillStyle = 'rgba(120,70,40,.35)'; for (const [x, y] of [[56, 140], [140, 148], [74, 156]]) { g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill(); }
    },
    birisuzume(g) { // 仮絵: 電線にとまる小鳥
      g.strokeStyle = '#8a7a5e'; g.lineWidth = 4.5; g.lineCap = 'round'; for (const x of [84, 108]) { g.beginPath(); g.moveTo(x, 156); g.lineTo(x, 176); g.moveTo(x - 7, 177); g.lineTo(x + 7, 177); g.stroke(); }
      blob(g, 58, 126, 18, 28, '#bfae8c', '#8a7a5e', 0.45); blob(g, 134, 126, 18, 28, '#bfae8c', '#8a7a5e', -0.45);
      blob(g, 96, 130, 42, 38, '#e2d6b6', '#b5a584');
      blob(g, 96, 92, 38, 33, '#ebe0c4', '#bfae8c');
      g.fillStyle = '#e8b84a'; g.beginPath(); g.moveTo(87, 99); g.lineTo(105, 99); g.lineTo(96, 114); g.closePath(); g.fill();
      eye(g, 78, 88, 6.5); eye(g, 114, 88, 6.5); blush(g, 64, 100, 7); blush(g, 128, 100, 7);
      g.strokeStyle = '#e8c93a'; g.lineWidth = 5; g.lineJoin = 'round'; g.beginPath(); g.moveTo(82, 128); g.lineTo(96, 120); g.lineTo(90, 140); g.lineTo(108, 130); g.stroke();
      g.strokeStyle = '#e8c93a'; g.lineWidth = 4; g.beginPath(); g.moveTo(92, 60); g.lineTo(88, 48); g.lineTo(98, 52); g.lineTo(94, 40); g.stroke();
    },
    hanedoron(g) { // 仮絵: ドローンのような虫
      g.strokeStyle = '#6c7886'; g.lineWidth = 5; g.lineCap = 'round';
      for (const [x, y] of [[44, 66], [148, 66]]) { g.beginPath(); g.moveTo(96, 104); g.lineTo(x, y + 6); g.stroke(); }
      for (const [x, y] of [[44, 66], [148, 66]]) { g.fillStyle = 'rgba(200,214,226,.75)'; g.beginPath(); g.ellipse(x, y, 30, 7, 0, 0, 7); g.fill(); g.strokeStyle = '#7f8a98'; g.lineWidth = 2; g.stroke(); }
      for (const x of [70, 122]) { g.strokeStyle = '#6c7886'; g.lineWidth = 4; g.beginPath(); g.moveTo(x, 138); g.lineTo(x, 164); g.moveTo(x - 8, 165); g.lineTo(x + 8, 165); g.stroke(); }
      blob(g, 96, 114, 46, 38, '#aab4c2', '#6c7886');
      blob(g, 96, 118, 22, 22, '#37323f', '#23202b'); ell(g, 96, 118, 11, 11, '#8fd6ff'); ell(g, 91, 113, 4, 4, '#fff');
      ell(g, 64, 100, 4, 4, '#ff7a5e'); ell(g, 128, 100, 4, 4, '#7aff9a');
      g.strokeStyle = 'rgba(80,45,35,.4)'; g.lineWidth = 2; g.beginPath(); g.moveTo(60, 128); g.lineTo(132, 128); g.stroke();
    },
    hikaritanishi(g) { // 仮絵: 光るカタツムリ
      blob(g, 92, 150, 60, 24, '#d6dde2', '#98a6b4');
      blob(g, 46, 130, 22, 24, '#d6dde2', '#98a6b4', -0.3);
      g.strokeStyle = '#98a6b4'; g.lineWidth = 3.5; g.lineCap = 'round'; g.beginPath(); g.moveTo(40, 112); g.lineTo(34, 92); g.moveTo(54, 110); g.lineTo(60, 90); g.stroke();
      ell(g, 34, 90, 5, 5, '#fff', 0, '#98a6b4'); ell(g, 60, 88, 5, 5, '#fff', 0, '#98a6b4');
      eye(g, 42, 132, 5.5); blush(g, 56, 140, 6);
      blob(g, 112, 96, 46, 46, '#a6d8e6', '#5f93b0');
      g.strokeStyle = '#fff3a0'; g.lineWidth = 3.4; g.beginPath(); for (let i = 0; i < 40; i++) { const r = 3 + i * 0.95, ang = i * 0.5; g.lineTo(112 + Math.cos(ang) * r, 96 + Math.sin(ang) * r); } g.stroke();
      const gl = g.createRadialGradient(112, 96, 4, 112, 96, 64); gl.addColorStop(0, 'rgba(255,243,160,.35)'); gl.addColorStop(1, 'rgba(255,243,160,0)'); g.fillStyle = gl; g.beginPath(); g.arc(112, 96, 64, 0, 7); g.fill();
    },
    shizukufin(g) {
      ell(g, 40, 130, 20, 10, 'rgba(120,200,250,.9)', 0.5, 'rgba(60,110,170,.45)'); ell(g, 152, 130, 20, 10, 'rgba(120,200,250,.9)', -0.5, 'rgba(60,110,170,.45)');
      blob(g, 96, 168, 30, 10, 'rgba(150,215,255,.95)', 'rgba(80,160,235,.95)');
      const gr = g.createLinearGradient(60, 20, 140, 170); gr.addColorStop(0, '#d4f1ff'); gr.addColorStop(1, '#5eb2f2');
      g.beginPath(); g.moveTo(96, 14); g.bezierCurveTo(100, 54, 152, 82, 152, 122); g.ellipse(96, 122, 56, 52, 0, 0, Math.PI); g.bezierCurveTo(40, 82, 92, 54, 96, 14); g.closePath();
      g.fillStyle = gr; g.fill(); g.lineWidth = 2.5; g.strokeStyle = 'rgba(50,100,170,.5)'; g.stroke();
      g.save(); g.globalAlpha = 0.65; ell(g, 66, 112, 7, 16, '#fff', 0.35); ell(g, 74, 144, 4, 4, '#fff'); g.restore();
      eye(g, 76, 116, 10.5); eye(g, 118, 116, 10.5);
      smile(g, 97, 134, 8); blush(g, 58, 132, 9); blush(g, 136, 132, 9);
      for (const [x, y, r] of [[154, 56, 7], [168, 78, 4], [34, 70, 5]]) { ell(g, x, y, r, r, 'rgba(210,240,255,.7)', 0, 'rgba(90,150,210,.7)'); }
    },
  };

  const imgs = {}, bgs = {};
  const CUT = { shizukufin: { tol: 24, erode: 0 }, hinatagaeru: { tol: 30, erode: 0 }, mikanya: { tol: 34, erode: 0 }, pukurisu: { tol: 34, erode: 0 }, hotaruusagi: { tol: 34, erode: 0, soft: 0 }, kinokokko: { tol: 34, erode: 0 } }; // 取り込み絵ごとの背景ぬき設定
  function removeBg(src, opt = {}) { // lab.jsと同じ方法: ふちから広がる背景色だけを透明にする
    const w = src.width, h = src.height, c = cv(w, h), g = c.getContext('2d', { willReadFrequently: true });
    g.drawImage(src, 0, 0);
    const im = g.getImageData(0, 0, w, h), d = im.data;
    let tr = 0; for (let i = 3; i < d.length; i += 4) if (d[i] < 250) tr++;
    const a = new Uint8Array(w * h).fill(255);
    if (tr > w * h * 0.01) { for (let i = 0; i < w * h; i++) a[i] = d[i * 4 + 3]; }
    else {
      let r = 0, gg = 0, b = 0, n = 0;
      const add = (x, y) => { const i = (y * w + x) * 4; r += d[i]; gg += d[i + 1]; b += d[i + 2]; n++; };
      for (let x = 0; x < w; x += 2) { add(x, 0); add(x, h - 1); }
      for (let y = 0; y < h; y += 2) { add(0, y); add(w - 1, y); }
      const bg = [r / n, gg / n, b / n], tol = opt.tol || 90, tol2 = tol * tol, seen = new Uint8Array(w * h), st = [];
      const near = (i) => { const dr = d[i * 4] - bg[0], dg = d[i * 4 + 1] - bg[1], db = d[i * 4 + 2] - bg[2]; return dr * dr + dg * dg + db * db <= tol2; };
      const push = (x, y) => { const i = y * w + x; if (!seen[i] && near(i)) { seen[i] = 1; st.push(i); } };
      for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1); }
      for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y); }
      while (st.length) { const i = st.pop(), x = i % w, y = (i - x) / w; if (x > 0) push(x - 1, y); if (x < w - 1) push(x + 1, y); if (y > 0) push(x, y - 1); if (y < h - 1) push(x, y + 1); }
      for (let i = 0; i < w * h; i++) if (seen[i]) a[i] = 0;
      for (let k = 0; k < (opt.erode ?? 1); k++) { const b2 = a.slice(); for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) { const i = y * w + x; if (a[i] && (!a[i - 1] || !a[i + 1] || !a[i - w] || !a[i + w])) b2[i] = 0; } a.set(b2); }
      for (let k = 0; k < (opt.soft ?? 1); k++) { const b2 = a.slice(); for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) { const i = y * w + x; if (a[i] === 0 && !(a[i - 1] || a[i + 1] || a[i - w] || a[i + w])) continue; const v = ((a[i] * 4 + a[i - 1] + a[i + 1] + a[i - w] + a[i + w] + a[i - w - 1] + a[i - w + 1] + a[i + w - 1] + a[i + w + 1]) / 12 * 1.25) | 0; b2[i] = v > 255 ? 255 : v; } a.set(b2); }
    }
    let x0 = w, y0 = h, x1 = -1, y1 = -1;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = y * w + x; d[i * 4 + 3] = a[i]; if (a[i] > 24) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } }
    g.putImageData(im, 0, 0);
    if (x1 < 0) return c;
    const o = cv(x1 - x0 + 1, y1 - y0 + 1); o.getContext('2d').drawImage(c, x0, y0, o.width, o.height, 0, 0, o.width, o.height);
    return o;
  }


  // 大きな絵を小さく描くとき、一度に縮めると細い線が点々になるので、半分ずつ縮める
  function drawFit(g, im, x, y, w, h) {
    let src = im, sw = im.width, sh = im.height;
    while (sw > w * 2 && sh > h * 2) {
      const c = cv(Math.max(1, Math.round(sw / 2)), Math.max(1, Math.round(sh / 2))), cg = c.getContext('2d');
      cg.imageSmoothingQuality = 'high'; cg.drawImage(src, 0, 0, c.width, c.height); src = c; sw = c.width; sh = c.height;
    }
    g.imageSmoothingQuality = 'high'; g.drawImage(src, x, y, w, h);
  }
  const R = 2; // スプライトは2倍の解像度で作る(立ち絵や大きな表示のため)
  function makeSprite(id) {
    const c = cv(S * R, S * R), g = c.getContext('2d'), im = imgs[id];
    if (im) {
      const k = Math.min(178 / im.width, 178 / im.height), w = im.width * k, h = im.height * k;
      drawFit(g, im, (S - w) / 2 * R, (184 - h) * R, w * R, h * R);
    } else if (DRAW[id]) { g.scale(R, R); DRAW[id](g); }
    else if (SPECIES[id] && SPECIES[id].from && sprites[SPECIES[id].from]) { // 進化後の仮絵: 元の絵を大きく、金色の光をまとわせる
      const p = sprites[SPECIES[id].from], k = 0.96, sz = S * R * k; g.shadowColor = 'rgba(255,214,90,.95)'; g.shadowBlur = 8 * R; g.drawImage(p, (S * R - sz) / 2, S * R - sz - 1 * R, sz, sz); // はみ出すと 光が 四角く 切れるので 内がわに
    }
    else if (id === 'mikanya') { // 絵が読めなかったときの代わり
      g.scale(R, R); blob(g, 96, 120, 52, 46, '#ffb066', '#e0762a'); blob(g, 96, 88, 46, 40, '#ffc27d', '#e8873a');
      eye(g, 76, 92, 8.5); eye(g, 116, 92, 8.5); smile(g, 96, 106, 8);
    }
    return c;
  }

  // srcs = { 種族id: 画像のURL }。読めなかった種族はコード描きの仮絵になる
  // 同じ「絵の入れ物(canvas)」に 描きなおす(持っている側は そのまま使える)
  const repaint = (old, fresh) => { old.width = fresh.width; old.height = fresh.height; old.getContext('2d').drawImage(fresh, 0, 0); };
  let SRCS = {};
  const load = (id) => new Promise((res) => {
    const im = new Image();
    im.onload = () => { try { if (id.startsWith('bg_')) bgs[id.slice(3)] = im; else { const c = removeBg(im, CUT[id] || { tol: 34, erode: 0 }); if (imgs[id]) repaint(imgs[id], c); else imgs[id] = c; } } catch (e) {} res(); };
    im.onerror = () => res();
    im.src = SRCS[id];
  });
  function init(srcs) {
    SRCS = srcs;
    return Promise.all(Object.keys(srcs).map(load)).then(() => {
      for (const id of SPECIES_ORDER) sprites[id] = makeSprite(id);
    });
  }
  // iPhoneは、裏に回ったアプリの canvas の中身を すてることがある。ぜんぶ 描きなおす
  async function rebuild() {
    await Promise.all(Object.keys(SRCS).filter((id) => !id.startsWith('bg_')).map(load));
    for (const k in cache) delete cache[k]; // 地面の部品・木・家などは、次に使うときに 作られる
    for (const id of SPECIES_ORDER) if (sprites[id]) repaint(sprites[id], makeSprite(id));
    for (const [store, make] of [[portraits, portrait], [dots, dot], [shinies, shiny], [bgMade, (k) => { bg(k); return bgMade[k]; }]]) {
      for (const k of Object.keys(store)) { const old = store[k]; delete store[k]; const fresh = make(k); if (old && fresh) { repaint(old, fresh); store[k] = old; } }
    }
  }

  // ---------- 人物(ちびキャラ) ----------
  function person(g, pal, kind, dir, step, cx, by, sc = 1, o = {}) {
    const P = PALETTES[pal] || PALETTES.hero;
    g.save(); g.translate(cx, by); g.scale(sc, sc);
    ell(g, 0, 0, 11, 4, 'rgba(40,60,30,.22)');
    g.translate(o.dx || 0, o.dy || 0); if (o.sy) g.scale(1, o.sy);
    const eyeAt = (x, y) => { if (o.face && o.face !== 'calm') { faceEye(g, o.face, x, y); return; } if (o.blink) { g.strokeStyle = '#3a2a2a'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x - 1.8, y); g.lineTo(x + 1.8, y); g.stroke(); } else ell(g, x, y, 1.5, 2, '#3a2a2a'); };
    const walk = step ? (step === 1 ? 1 : -1) : 0, bob = step ? -1 : 0;
    const legC = '#5b4a60';
    for (const sx of [-1, 1]) {
      const lift = walk * sx < 0 ? 2.4 : 0;
      g.fillStyle = legC; g.beginPath(); g.roundRect(sx * 4 - 3, -9 - lift, 6, 9, 2.5); g.fill();
      g.fillStyle = '#fff'; g.beginPath(); g.roundRect(sx * 4 - 3.5, -3 - lift, 7, 3.6, 2); g.fill();
    }
    if (kind === 'traveler' && dir === 'u') { g.fillStyle = '#b4743a'; g.beginPath(); g.roundRect(-9, -27, 18, 17, 5); g.fill(); }
    g.translate(0, bob);
    const bg = g.createLinearGradient(0, -24, 0, -8); bg.addColorStop(0, P.body); bg.addColorStop(1, P.body2);
    g.fillStyle = bg; g.beginPath(); g.roundRect(-8.5, -24, 17, 17, 6); g.fill();
    g.fillStyle = P.scarf; g.beginPath(); g.roundRect(-8, -25.5, 16, 5, 2.5); g.fill();
    if (dir !== 'u') { g.fillStyle = P.body2; for (const sx of [-1, 1]) { g.beginPath(); g.arc(sx * 9.5, -14 + walk * sx * 1.2, 3.2, 0, 7); g.fill(); } }
    // 頭
    const hy = -32;
    if (dir === 'u') {
      ell(g, 0, hy, 10.6, 10.4, P.hair);
    } else {
      ell(g, 0, hy, 10.4, 10, P.skin);
      if (dir === 'd') {
        g.fillStyle = P.hair; g.beginPath(); g.ellipse(0, hy - 3.5, 11.2, 8, 0, Math.PI, 0); g.lineTo(9, hy - 3); g.quadraticCurveTo(0, hy + 1, -9, hy - 3); g.closePath(); g.fill();
        eyeAt(-4, hy + 1.5); eyeAt(4, hy + 1.5);
        g.save(); g.globalAlpha = 0.55; ell(g, -7, hy + 4.5, 2.4, 1.6, '#ff9aa8'); ell(g, 7, hy + 4.5, 2.4, 1.6, '#ff9aa8'); g.restore();
      } else {
        const s = dir === 'l' ? -1 : 1;
        g.fillStyle = P.hair; g.beginPath(); g.ellipse(-s * 1.5, hy - 2, 10.6, 9, 0, Math.PI * 0.95, Math.PI * 2.05); g.lineTo(-s * 10, hy + 2); g.closePath(); g.fill();
        eyeAt(s * 4.6, hy + 1.5);
        g.save(); g.globalAlpha = 0.55; ell(g, s * 7, hy + 4.5, 2.4, 1.6, '#ff9aa8'); g.restore();
      }
    }
    // 帽子・かざり
    if (kind === 'hero') {
      g.fillStyle = P.hat; g.beginPath(); g.ellipse(0, hy - 6, 11, 5.5, 0, Math.PI, 0); g.fill();
      g.beginPath(); g.roundRect(-11.5, hy - 7, 23, 3, 1.5); g.fill();
      g.fillStyle = P.scarf; g.beginPath(); g.arc(dir === 'l' ? 5 : dir === 'r' ? -5 : 6, hy - 9, 2.6, 0, 7); g.fill();
    } else if (kind === 'nurse') {
      g.fillStyle = '#fff'; g.beginPath(); g.roundRect(-8, hy - 12, 16, 7, 3); g.fill();
      g.fillStyle = '#ff6f8f'; g.fillRect(-1, hy - 11, 2, 5); g.fillRect(-3, hy - 9, 6, 1.6);
    } else if (kind === 'granny') {
      ell(g, 0, hy - 11, 5.6, 5, P.hair); ell(g, 0, hy - 11, 2.2, 2, '#e0c8a0');
    } else if (kind === 'elder') {
      if (dir === 'd' || dir === 'l' || dir === 'r') { g.fillStyle = P.hair; g.beginPath(); g.ellipse(0, hy + 7, 7.5, 6, 0, 0, Math.PI); g.fill(); }
      g.fillStyle = P.hat; g.beginPath(); g.ellipse(0, hy - 7, 8, 4, 0, Math.PI, 0); g.fill();
    } else if (kind === 'rival') {
      g.fillStyle = P.hat; g.beginPath(); g.moveTo(-10.5, hy - 3); g.lineTo(10.5, hy - 3); g.lineTo(5, hy - 14); g.lineTo(-5, hy - 14); g.closePath(); g.fill();
      g.fillStyle = P.scarf; g.fillRect(-10.5, hy - 5, 21, 3);
    } else if (kind === 'traveler') {
      g.fillStyle = P.hat; g.beginPath(); g.ellipse(0, hy - 6, 14, 3.6, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(0, hy - 8, 8.5, 6.5, 0, Math.PI, 0); g.fill();
    } else if (kind === 'child') {
      g.fillStyle = P.hat; g.beginPath(); g.arc(0, hy - 10, 3.6, 0, 7); g.fill();
    }
    if (o.face && dir === 'd') faceMouth(g, o.face, hy);
    g.restore();
  }
  function faceEye(g, f, x, y) {
    const s = x < 0 ? -1 : 1, line = (a) => { g.strokeStyle = '#3a2a2a'; g.lineWidth = 0.9; g.lineCap = 'round'; g.beginPath(); a(); g.stroke(); };
    if (f === 'joy') line(() => { g.moveTo(x - 2, y + 0.8); g.quadraticCurveTo(x, y - 2.4, x + 2, y + 0.8); });
    else if (f === 'shy') line(() => { g.moveTo(x - 1.8, y - 0.2); g.quadraticCurveTo(x, y + 1.6, x + 1.8, y - 0.2); });
    else if (f === 'surprise') { ell(g, x, y, 2, 2.5, '#3a2a2a'); ell(g, x - 0.6, y - 0.8, 0.8, 0.8, '#fff'); line(() => { g.moveTo(x - 2, y - 4.4); g.quadraticCurveTo(x, y - 5.4, x + 2, y - 4.4); }); }
    else if (f === 'sad') { ell(g, x, y + 0.4, 1.3, 1.6, '#3a2a2a'); line(() => { g.moveTo(x - 2 * s, y - 3.8); g.lineTo(x + 2 * s, y - 2.4); }); }
    else if (f === 'angry' || f === 'fight') { ell(g, x, y + 0.2, 1.5, 1.7, '#3a2a2a'); line(() => { g.moveTo(x - 2.2 * s, y - 2.2); g.lineTo(x + 2.2 * s, y - (f === 'angry' ? 4.4 : 3.8)); }); }
    else if (f === 'think') ell(g, x + 0.9, y - 0.4, 1.4, 1.8, '#3a2a2a');
    else ell(g, x, y, 1.5, 2, '#3a2a2a');
  }
  function faceMouth(g, f, hy) {
    const y = hy + 5.6; g.strokeStyle = '#7a3f3a'; g.fillStyle = '#9a4a48'; g.lineWidth = 0.8; g.lineCap = 'round'; g.beginPath();
    if (f === 'joy') { g.moveTo(-2.6, y - 0.4); g.quadraticCurveTo(0, y + 3.6, 2.6, y - 0.4); g.closePath(); g.fill(); }
    else if (f === 'surprise') { g.ellipse(0, y + 0.8, 1.3, 1.7, 0, 0, 7); g.fill(); }
    else if (f === 'sad') { g.moveTo(-1.8, y + 1.4); g.quadraticCurveTo(0, y - 0.4, 1.8, y + 1.4); g.stroke(); }
    else if (f === 'angry') { g.moveTo(-2, y + 1.2); g.lineTo(-0.6, y + 0.2); g.lineTo(0.6, y + 1.2); g.lineTo(2, y + 0.2); g.stroke(); }
    else if (f === 'fight') { g.moveTo(-2, y + 0.6); g.quadraticCurveTo(0.4, y + 1.6, 2.4, y - 0.4); g.stroke(); }
    else if (f === 'think') { g.moveTo(0.2, y + 0.8); g.lineTo(2.2, y + 0.6); g.stroke(); }
    else { g.moveTo(-1.4, y + 0.4); g.quadraticCurveTo(0, y + 1.5, 1.4, y + 0.4); g.stroke(); }
    if (f === 'shy') for (const sx of [-1, 1]) { g.save(); g.globalAlpha = 0.5; ell(g, sx * 7, hy + 4.5, 3, 2, '#ff6f8f'); g.restore(); }
  }

  // ---------- 地面・ものの絵 ----------
  function pre(key, w, h, fn) { if (!cache[key]) { const c = cv(w, h); fn(c.getContext('2d'), c); cache[key] = c; } return cache[key]; }
  // 場所ごとの 色: g=地面4色, tuft=草の毛, path/edge=小道, tall/shade=高い草の土台, blade=草の葉2色, water=水
  const LAND = {
    field: { g: ['#9bd278', '#96ce73', '#a1d67f', '#94cb70'], tuft: 'rgba(70,160,70,.35)', path: '#eadbb6', dot: 'rgba(190,150,90,.35)', edge: '#d9bd80', tall: '#6fb862', shade: 'rgba(40,120,50,.25)', blade: ['#3fa044', '#4fb24f'], water: '#7ab8da' },
    forest: { g: ['#6f9c6c', '#6a9768', '#749f71', '#679365'], tuft: 'rgba(36,92,60,.42)', path: '#b8a881', dot: 'rgba(110,86,52,.35)', edge: '#998a66', tall: '#4d835a', shade: 'rgba(18,60,42,.32)', blade: ['#2d6844', '#3c7c50'], water: '#5c8ea0' },
    lake: { g: ['#98bc8c', '#93b788', '#9dc191', '#90b385'], tuft: 'rgba(70,120,86,.34)', path: '#d8cdb0', dot: 'rgba(150,130,96,.3)', edge: '#bcae8c', tall: '#74a276', shade: 'rgba(36,90,70,.24)', blade: ['#4c8a62', '#62a074'], water: '#688fb8' },
    station: { g: ['#b3b38c', '#aeae88', '#b8b890', '#aaaa84'], tuft: 'rgba(122,112,60,.38)', path: '#cdc1a6', dot: 'rgba(120,100,72,.32)', edge: '#ab9d82', tall: '#9a9a68', shade: 'rgba(92,82,36,.26)', blade: ['#7c7a42', '#948f50'], water: '#7fa6b6' },
    ridge: { g: ['#8b9b94', '#86968f', '#90a099', '#83928c'], tuft: 'rgba(52,74,74,.4)', path: '#bdb6ac', dot: 'rgba(90,82,76,.34)', edge: '#9c958c', tall: '#6f857a', shade: 'rgba(30,52,56,.3)', blade: ['#4a6660', '#5d7a70'], water: '#6a88a0' },
  };
  const land = (k) => LAND[k] || LAND.field;
  const groundColor = (k) => land(k).g[0];
  function grassTile(v, k) {
    return pre('gr' + (k || '') + v, TS, TS, (g) => {
      const L = land(k); g.fillStyle = L.g[v]; g.fillRect(0, 0, TS, TS);
      const r = hash(v, 7); g.fillStyle = L.tuft;
      for (let i = 0; i < 4; i++) { const x = (r >> (i * 3)) % 26 + 3, y = (r >> (i * 2 + 1)) % 24 + 4; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 2, y - 5); g.lineTo(x + 4, y); g.fill(); }
    });
  }
  const FLC = ['#ff8fa8', '#ffe27a', '#ffffff', '#b99cff'];
  function flowerOn(g, x, y, c) {
    g.fillStyle = c; for (let i = 0; i < 5; i++) { const a = i / 5 * 6.283; g.beginPath(); g.arc(x + Math.cos(a) * 2.6, y + Math.sin(a) * 2.6, 2, 0, 7); g.fill(); }
    g.fillStyle = '#ffd24a'; g.beginPath(); g.arc(x, y, 1.7, 0, 7); g.fill();
  }
  function tile(g, ch, tx, ty, px, py, t, map) {
    const h = hash(tx, ty), gv = h % 4;
    const at = (x, y) => (map.t[y] && map.t[y][x]) || 'T';
    const L = land(map.theme);
    switch (ch) {
      case ',': {
        g.fillStyle = L.path; g.fillRect(px, py, TS, TS);
        g.fillStyle = L.dot;
        for (let i = 0; i < 3; i++) { const x = (h >> (i * 4)) % 26 + 3, y = (h >> (i * 3 + 2)) % 26 + 3; g.beginPath(); g.ellipse(px + x, py + y, 2.4, 1.6, 0, 0, 7); g.fill(); }
        const edge = (dx, dy, rx, ry, rw, rh) => { if (at(tx + dx, ty + dy) !== ',') { g.fillStyle = L.edge; g.fillRect(px + rx, py + ry, rw, rh); } };
        edge(0, -1, 0, 0, TS, 3); edge(0, 1, 0, TS - 3, TS, 3); edge(-1, 0, 0, 0, 3, TS); edge(1, 0, TS - 3, 0, 3, TS);
        break;
      }
      case '~': {
        g.fillStyle = L.water; g.fillRect(px, py, TS, TS);
        g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 2; g.lineCap = 'round';
        for (let i = 0; i < 2; i++) { const o = (t * 14 + h % 20 + i * 16) % 32; g.beginPath(); g.moveTo(px + o - 6, py + 9 + i * 14); g.quadraticCurveTo(px + o, py + 5 + i * 14, px + o + 6, py + 9 + i * 14); g.stroke(); }
        const sh = (dx, dy, rx, ry, rw, rh) => { if (at(tx + dx, ty + dy) !== '~') { g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(px + rx, py + ry, rw, rh); } };
        sh(0, -1, 0, 0, TS, 3); sh(0, 1, 0, TS - 3, TS, 3); sh(-1, 0, 0, 0, 3, TS); sh(1, 0, TS - 3, 0, 3, TS);
        break;
      }
      case 'G0': { // 高い草の土台だけ(草のゆれは別に描く)
        g.fillStyle = L.tall; g.fillRect(px, py, TS, TS); g.fillStyle = L.shade; g.fillRect(px, py + 22, TS, 10);
        break;
      }
      case 'g': {
        g.fillStyle = L.tall; g.fillRect(px, py, TS, TS);
        g.fillStyle = L.shade; g.fillRect(px, py + 22, TS, 10);
        grassBlades(g, px, py, t, h, false, map.theme);
        break;
      }
      case 'r': { // 線路(よこ向き)
        g.drawImage(grassTile(gv, map.theme), px, py);
        const top = at(tx, ty - 1) !== 'r', bot = at(tx, ty + 1) !== 'r';
        g.fillStyle = '#8f857a'; g.fillRect(px, py + (top ? 6 : 0), TS, TS - (top ? 6 : 0) - (bot ? 6 : 0));
        g.fillStyle = 'rgba(60,52,46,.35)'; for (let i = 0; i < 5; i++) g.fillRect(px + (h >> (i * 3)) % 28, py + 7 + (h >> (i * 2)) % 18, 3, 2);
        if (!top && !bot) { g.fillStyle = '#6a5240'; g.fillRect(px + 3, py, 9, TS); g.fillRect(px + 19, py, 9, TS); for (const y of [7, 22]) { g.fillStyle = '#4a4650'; g.fillRect(px, py + y, TS, 4); g.fillStyle = '#c9c4cc'; g.fillRect(px, py + y, TS, 1.5); } }
        break;
      }
      case '=': { // ホーム・桟橋の 板
        const pier = map.theme === 'lake';
        g.fillStyle = pier ? '#a98a64' : '#bdb8ae'; g.fillRect(px, py, TS, TS);
        g.strokeStyle = pier ? 'rgba(70,48,30,.45)' : 'rgba(80,74,70,.28)'; g.lineWidth = 1.5; g.beginPath();
        if (pier) for (const y of [7, 15, 23, 31]) { g.moveTo(px, py + y); g.lineTo(px + TS, py + y); }
        else { g.moveTo(px + 31, py); g.lineTo(px + 31, py + TS); g.moveTo(px, py + 31); g.lineTo(px + TS, py + 31); }
        g.stroke();
        if (!pier && at(tx, ty - 1) !== '=') { g.fillStyle = '#e8d27a'; g.fillRect(px, py + 3, TS, 3); g.fillStyle = '#7d766e'; g.fillRect(px, py, TS, 2); }
        if (!pier && at(tx, ty + 1) !== '=') { g.fillStyle = '#7d766e'; g.fillRect(px, py + TS - 5, TS, 5); }
        break;
      }
      case 'R': { // 岩
        g.drawImage(grassTile(gv, map.theme), px, py);
        const ox = (h % 5) - 2, oy = ((h >> 4) % 5) - 2;
        ell(g, px + 16, py + 27, 15, 5, 'rgba(24,30,40,.28)');
        blob(g, px + 16 + ox, py + 17 + oy, 17, 14 + (h % 4), '#a9aab0', '#62646e');
        blob(g, px + 8 + (h >> 6) % 6, py + 23, 8, 7, '#9a9ba2', '#5a5c66');
        break;
      }
      case 'f':
        g.drawImage(grassTile(gv, map.theme), px, py);
        flowerOn(g, px + 9 + (h % 5), py + 11 + (h >> 3) % 6, FLC[h % 4]);
        if (h % 3 === 0) flowerOn(g, px + 22, py + 22, FLC[(h >> 2) % 4]);
        break;
      case 'F': {
        g.drawImage(grassTile(gv, map.theme), px, py);
        g.fillStyle = '#c99a62'; g.fillRect(px, py + 12, TS, 4); g.fillRect(px, py + 21, TS, 4);
        g.fillStyle = '#a97a44'; g.beginPath(); g.roundRect(px + 3, py + 8, 5, 20, 2); g.fill(); g.beginPath(); g.roundRect(px + 24, py + 8, 5, 20, 2); g.fill();
        break;
      }
      default:
        g.drawImage(grassTile(gv, map.theme), px, py);
    }
  }
  function grassBlades(g, px, py, t, h, front, k) {
    const L = land(k);
    for (let i = 0; i < 6; i++) {
      const bx = px + 3 + ((h >> (i * 2)) % 5) + i * 5, by = py + 30 - ((h >> i) % 5);
      const sw = Math.sin(t * 2.2 + i + (h % 7)) * 2.4, hh = 13 + ((h >> (i + 3)) % 5);
      g.fillStyle = L.blade[i % 2];
      g.beginPath(); g.moveTo(bx - 2.4, by); g.quadraticCurveTo(bx + sw * 0.5, by - hh * 0.6, bx + sw, by - hh); g.quadraticCurveTo(bx + sw * 0.6 + 1, by - hh * 0.5, bx + 2.4, by); g.closePath(); g.fill();
    }
  }
  // 高い草のゆれを、まとめて描く(1枚ずつ描くより速い)
  function grassBatch(g, list, t, k) {
    for (let col = 0; col < 2; col++) {
      g.fillStyle = land(k).blade[col]; g.beginPath();
      for (const it of list) for (let i = 0; i < 6; i++) {
        if (i % 2 !== col) continue;
        const h = it.h, bx = it.px + 3 + ((h >> (i * 2)) % 5) + i * 5, by = it.py + 30 - ((h >> i) % 5), sw = Math.sin(t * 2.2 + i + (h % 7)) * 2.4, hh = 13 + ((h >> (i + 3)) % 5);
        g.moveTo(bx - 2.4, by); g.quadraticCurveTo(bx + sw * 0.5, by - hh * 0.6, bx + sw, by - hh); g.quadraticCurveTo(bx + sw * 0.6 + 1, by - hh * 0.5, bx + 2.4, by); g.closePath();
      }
      g.fill();
    }
  }
  function tallFront(g, px, py, t, h, k) { // プレイヤーの足もとにかぶせる草
    g.save(); g.beginPath(); g.rect(px - 2, py + 14, TS + 4, TS); g.clip(); grassBlades(g, px, py, t, h, true, k); g.restore();
  }

  const PINE = { forest: ['#5d9a72', '#2b5c48', '#d9d09a'], ridge: ['#7b9a94', '#3d5a5c', '#e6ecf0'] };
  const LEAFY = { lake: ['#8cc49a', '#447a66', '#ffffff'], station: ['#d3a55e', '#8c6036', '#e8c478'] };
  function treeSprite(k) {
    if (PINE[k]) return pre('tree_' + k, 64, 84, (g) => { // 針葉樹
      const [c1, c2, dot] = PINE[k];
      ell(g, 32, 76, 19, 6, 'rgba(14,36,30,.34)'); g.fillStyle = '#6a4a34'; g.fillRect(28, 60, 8, 18);
      for (const [y, w2, hh] of [[70, 29, 30], [52, 24, 28], [35, 18, 28]]) { const gr = g.createLinearGradient(32 - w2, y - hh, 32 + w2, y); gr.addColorStop(0, c1); gr.addColorStop(1, c2); g.fillStyle = gr; g.beginPath(); g.moveTo(32, y - hh); g.quadraticCurveTo(32 + w2 * 0.45, y - hh * 0.35, 32 + w2, y); g.quadraticCurveTo(32, y - 7, 32 - w2, y); g.quadraticCurveTo(32 - w2 * 0.45, y - hh * 0.35, 32, y - hh); g.fill(); g.strokeStyle = 'rgba(16,34,32,.45)'; g.lineWidth = 2; g.stroke(); }
      g.fillStyle = dot; for (const [x, y] of [[26, 30], [40, 48], [20, 62]]) { g.beginPath(); g.arc(x, y, 1.6, 0, 7); g.fill(); }
    });
    if (LEAFY[k]) return pre('tree_' + k, 64, 84, (g) => {
      const [c1, c2, dot] = LEAFY[k];
      ell(g, 32, 76, 20, 6, 'rgba(30,60,40,.28)');
      g.fillStyle = '#8a6244'; g.beginPath(); g.roundRect(26, 50, 12, 28, 4); g.fill(); g.fillStyle = '#6d4a30'; g.fillRect(33, 52, 5, 26);
      blob(g, 32, 34, 28, 26, c1, c2); blob(g, 18, 42, 17, 14, c1, c2); blob(g, 47, 42, 17, 14, c1, c2);
      g.fillStyle = dot; g.globalAlpha = 0.7; for (const [x, y] of [[40, 30], [22, 46], [48, 44], [30, 18]]) { g.beginPath(); g.arc(x, y, 2, 0, 7); g.fill(); } g.globalAlpha = 1;
    });
    return pre('tree', 64, 84, (g) => {
      ell(g, 32, 76, 20, 6, 'rgba(30,70,30,.28)');
      g.fillStyle = '#9a6a40'; g.beginPath(); g.roundRect(26, 50, 12, 28, 4); g.fill(); g.fillStyle = '#7d5230'; g.fillRect(33, 52, 5, 26);
      blob(g, 32, 34, 28, 26, '#6fd36d', '#2f9a52'); blob(g, 18, 42, 17, 14, '#5cc563', '#2f9a52'); blob(g, 47, 42, 17, 14, '#5cc563', '#2f9a52');
      g.fillStyle = 'rgba(255,255,255,.2)'; g.beginPath(); g.ellipse(24, 22, 9, 5, -0.5, 0, 7); g.fill();
      g.fillStyle = '#ff9aa8'; for (const [x, y] of [[40, 30], [22, 46], [48, 44]]) { g.beginPath(); g.arc(x, y, 2.3, 0, 7); g.fill(); }
    });
  }
  function houseSprite(o) {
    const key = 'h' + o.w + o.color;
    return pre(key, o.w * TS + 16, o.h * TS + 20, (g) => {
      const W = o.w * TS, Hh = o.h * TS, ox = 8, oy = 20;
      ell(g, ox + W / 2, oy + Hh - 2, W / 2 + 6, 8, 'rgba(30,70,30,.25)');
      g.fillStyle = '#fff3dc'; g.beginPath(); g.roundRect(ox + 4, oy + 30, W - 8, Hh - 32, 4); g.fill();
      g.strokeStyle = 'rgba(120,80,50,.4)'; g.lineWidth = 2; g.stroke();
      const rg = g.createLinearGradient(0, oy - 8, 0, oy + 40); rg.addColorStop(0, o.color); rg.addColorStop(1, shade(o.color, -28));
      g.fillStyle = rg; g.beginPath(); g.moveTo(ox - 6, oy + 40); g.lineTo(ox + W * 0.2, oy - 6); g.lineTo(ox + W * 0.8, oy - 6); g.lineTo(ox + W + 6, oy + 40); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(80,45,35,.4)'; g.stroke();
      g.fillStyle = 'rgba(255,255,255,.25)'; for (let i = 0; i < o.w * 2; i++) { g.beginPath(); g.arc(ox + 6 + i * (W - 12) / (o.w * 2 - 1), oy + 38, 6, 0, Math.PI); g.fill(); }
      const dx = ox + Math.floor((o.w - 1) / 2) * TS + 4, dy = oy + Hh - 30;
      g.fillStyle = '#b97b4e'; g.beginPath(); g.roundRect(dx, dy, TS - 8, 30, [9, 9, 0, 0]); g.fill(); g.strokeStyle = 'rgba(80,45,35,.5)'; g.stroke();
      g.fillStyle = '#ffd36b'; g.beginPath(); g.arc(dx + TS - 15, dy + 17, 2, 0, 7); g.fill();
      const wx = ox + W - 30 - (o.w > 3 ? 0 : 0);
      for (const x of (o.w > 3 ? [ox + 14, ox + W - 30] : [ox + W - 28])) { g.fillStyle = '#aee4ff'; g.beginPath(); g.roundRect(x, oy + 50, 16, 16, 4); g.fill(); g.strokeStyle = '#a97a44'; g.lineWidth = 2.4; g.stroke(); g.beginPath(); g.moveTo(x + 8, oy + 50); g.lineTo(x + 8, oy + 66); g.moveTo(x, oy + 58); g.lineTo(x + 16, oy + 58); g.stroke(); }
    });
  }
  function shade(hex, d) {
    const n = parseInt(hex.slice(1), 16), c = (v) => Math.max(0, Math.min(255, v + d));
    return `rgb(${c(n >> 16)},${c((n >> 8) & 255)},${c(n & 255)})`;
  }
  function signSprite() {
    return pre('sign', 28, 34, (g) => {
      ell(g, 14, 30, 9, 3, 'rgba(30,70,30,.25)');
      g.fillStyle = '#a97a44'; g.fillRect(12, 16, 4, 14);
      g.fillStyle = '#e2b574'; g.beginPath(); g.roundRect(2, 3, 24, 15, 3); g.fill(); g.strokeStyle = 'rgba(80,45,35,.5)'; g.lineWidth = 2; g.stroke();
      g.strokeStyle = 'rgba(120,80,40,.6)'; g.beginPath(); g.moveTo(7, 8); g.lineTo(21, 8); g.moveTo(7, 13); g.lineTo(17, 13); g.stroke();
    });
  }
  function stoneSprite() { // ゲートの石柱
    return pre('stone', 40, 72, (g) => {
      ell(g, 20, 66, 17, 5, 'rgba(30,70,30,.25)');
      blob(g, 20, 44, 15, 24, '#e8e4dc', '#b8b2a6'); blob(g, 20, 18, 17, 10, '#f0ece4', '#bdb7aa');
      g.fillStyle = '#ffd36b'; g.beginPath(); g.roundRect(14, 6, 12, 14, 4); g.fill(); g.fillStyle = '#fff6c4'; g.beginPath(); g.roundRect(17, 9, 6, 8, 2); g.fill();
    });
  }
  // 寄り道の 小物(px,py は そのマスの 左上)。on: 調べて あかりが ともった など
  function prop(g, o, px, py, t, on) {
    if (o.type === 'lantern') {
      ell(g, px + 16, py + 29, 13, 4, 'rgba(20,30,30,.3)');
      g.fillStyle = '#8e8f94'; g.fillRect(px + 12, py + 6, 8, 22); g.fillStyle = '#a8a9ae'; g.beginPath(); g.roundRect(px + 7, py + 24, 18, 6, 2); g.fill();
      g.fillStyle = '#b9bac0'; g.beginPath(); g.roundRect(px + 6, py - 10, 20, 18, 3); g.fill();
      g.fillStyle = on ? '#ffe6a8' : '#3c3b46'; g.beginPath(); g.roundRect(px + 10, py - 6, 12, 10, 2); g.fill();
      g.fillStyle = '#74757c'; g.beginPath(); g.moveTo(px + 1, py - 9); g.lineTo(px + 16, py - 23); g.lineTo(px + 31, py - 9); g.closePath(); g.fill();
      g.fillStyle = '#74757c'; g.beginPath(); g.arc(px + 16, py - 24, 3, 0, 7); g.fill();
      if (on) { g.save(); g.globalCompositeOperation = 'screen'; const r = 58 + Math.sin(t * 2.4) * 4, gr = g.createRadialGradient(px + 16, py - 1, 1, px + 16, py - 1, r); gr.addColorStop(0, 'rgba(255,214,140,.85)'); gr.addColorStop(1, 'rgba(255,180,100,0)'); g.fillStyle = gr; g.fillRect(px + 16 - r, py - 1 - r, r * 2, r * 2); g.restore(); }
    } else if (o.type === 'easel') {
      ell(g, px + 16, py + 29, 13, 4, 'rgba(20,30,30,.25)');
      g.strokeStyle = '#7a5636'; g.lineWidth = 3; g.beginPath(); g.moveTo(px + 5, py + 30); g.lineTo(px + 16, py - 6); g.lineTo(px + 27, py + 30); g.moveTo(px + 16, py); g.lineTo(px + 16, py + 26); g.stroke();
      g.fillStyle = '#f4efe2'; g.fillRect(px + 4, py - 4, 24, 20); g.strokeStyle = '#5a4030'; g.lineWidth = 2; g.strokeRect(px + 4, py - 4, 24, 20);
      g.fillStyle = on ? '#31406a' : '#a9c4d4'; g.fillRect(px + 6, py - 2, 20, 9); g.fillStyle = on ? '#25304f' : '#7ea0b8'; g.fillRect(px + 6, py + 7, 20, 7);
      if (on) { g.fillStyle = '#ffe6a8'; g.beginPath(); g.arc(px + 20, py + 2, 2.4, 0, 7); g.fill(); g.fillRect(px + 18, py + 9, 5, 1.4); g.fillRect(px + 19, py + 12, 3, 1.2); }
    } else if (o.type === 'train') {
      const w = o.w * TS, hh = o.h * TS;
      ell(g, px + w / 2, py + hh - 2, w / 2 + 4, 7, 'rgba(30,26,30,.35)');
      g.fillStyle = '#4a4650'; for (const wx of [26, 62, w - 62, w - 26]) { g.beginPath(); g.arc(px + wx, py + hh - 8, 9, 0, 7); g.fill(); }
      const gr = g.createLinearGradient(0, py - 12, 0, py + hh - 10); gr.addColorStop(0, '#c9c2b0'); gr.addColorStop(0.55, '#a7a08e'); gr.addColorStop(0.56, '#8a4a48'); gr.addColorStop(1, '#6a3838');
      g.fillStyle = gr; g.beginPath(); g.roundRect(px + 4, py - 8, w - 8, hh - 6, [18, 18, 5, 5]); g.fill(); g.strokeStyle = 'rgba(40,30,34,.6)'; g.lineWidth = 2.5; g.stroke();
      for (let i = 0; i < 5; i++) { const x = px + 20 + i * ((w - 40) / 5); g.fillStyle = on ? '#ffdf9c' : '#394456'; g.beginPath(); g.roundRect(x, py + 3, (w - 40) / 5 - 10, 20, 4); g.fill(); g.strokeStyle = 'rgba(40,30,34,.55)'; g.lineWidth = 2; g.stroke(); if (!on) { g.strokeStyle = 'rgba(210,225,240,.35)'; g.beginPath(); g.moveTo(x + 5, py + 18); g.lineTo(x + 16, py + 7); g.stroke(); } }
      g.fillStyle = 'rgba(120,76,40,.4)'; for (let i = 0; i < 14; i++) { const h = hash(i, 9); g.beginPath(); g.ellipse(px + 14 + h % (w - 28), py + 28 + (h >> 5) % 18, 3 + (h % 5), 2, 0, 0, 7); g.fill(); }
    } else if (o.type === 'bench') {
      const w = o.w * TS; ell(g, px + w / 2, py + 28, w / 2 - 4, 4, 'rgba(30,26,30,.28)');
      g.fillStyle = '#7a5c44'; g.fillRect(px + 8, py + 16, 4, 12); g.fillRect(px + w - 12, py + 16, 4, 12);
      g.fillStyle = '#a07a56'; g.beginPath(); g.roundRect(px + 4, py + 14, w - 8, 7, 2); g.fill(); g.beginPath(); g.roundRect(px + 4, py + 1, w - 8, 6, 2); g.fill(); g.fillRect(px + 10, py + 5, 3, 10); g.fillRect(px + w - 13, py + 5, 3, 10);
    } else if (o.type === 'stationsign') {
      const w = o.w * TS; ell(g, px + w / 2, py + 29, w / 2 - 6, 4, 'rgba(30,26,30,.28)');
      g.fillStyle = '#4f4a52'; g.fillRect(px + 8, py + 8, 4, 22); g.fillRect(px + w - 12, py + 8, 4, 22);
      g.fillStyle = '#eee9da'; g.beginPath(); g.roundRect(px + 1, py - 16, w - 2, 28, 3); g.fill(); g.strokeStyle = '#3a3640'; g.lineWidth = 2; g.stroke(); g.fillStyle = '#c25a62'; g.fillRect(px + 3, py + 4, w - 6, 5);
      g.fillStyle = '#2f2b38'; g.font = '900 10px "Zen Kaku Gothic New",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('ひとつ星', px + w / 2, py - 6);
    } else if (o.type === 'cairn') {
      ell(g, px + 16, py + 29, 15, 5, 'rgba(24,30,40,.3)');
      blob(g, px + 16, py + 22, 14, 9, '#b4b5bc', '#6a6c76'); blob(g, px + 15, py + 11, 10, 7, '#bcbdc4', '#72747e'); blob(g, px + 17, py + 2, 7, 5, '#c6c7ce', '#7a7c86'); blob(g, px + 16, py - 6, 4, 3.5, '#d0d1d8', '#84868f');
      if (on) { g.save(); g.globalCompositeOperation = 'screen'; star(g, px + 16, py - 16 + Math.sin(t * 2) * 1.5, 5, '#fff0c0'); g.restore(); }
    }
  }
  function ball(g, x, y, r, rot = 0) {
    g.save(); g.translate(x, y); g.rotate(rot);
    const gr = g.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r); gr.addColorStop(0, '#ffd9a0'); gr.addColorStop(1, '#f0883a');
    g.beginPath(); g.arc(0, 0, r, 0, 7); g.fillStyle = gr; g.fill(); g.lineWidth = 2; g.strokeStyle = 'rgba(100,50,25,.6)'; g.stroke();
    g.strokeStyle = '#fff4d8'; g.lineWidth = r * 0.16; g.beginPath(); g.arc(0, 0, r * 0.62, 0, 7); g.stroke();
    g.fillStyle = '#fff4d8'; g.beginPath(); for (let i = 0; i < 10; i++) { const rr = i % 2 ? r * 0.16 : r * 0.34, a = -Math.PI / 2 + i * Math.PI / 5; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } g.closePath(); g.fill();
    g.restore();
  }
  function star(g, x, y, r, c) { g.fillStyle = c; g.beginPath(); for (let i = 0; i < 10; i++) { const rr = i % 2 ? r * 0.45 : r, a = -Math.PI / 2 + i * Math.PI / 5; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); g.fill(); }


  // ---------- 背景(町や道の1枚絵)。assets/bg_<名前>.webp があればそれを、なければ仮の絵をコードで描く ----------
  function townBg() {
    const W = 1280, H = 736, c = cv(W, H), g = c.getContext('2d');
    const sky = g.createLinearGradient(0, 0, 0, 260); sky.addColorStop(0, '#9fb4c6'); sky.addColorStop(1, '#e9e1d3'); g.fillStyle = sky; g.fillRect(0, 0, W, 260);
    g.fillStyle = '#c9ced2'; g.beginPath(); g.moveTo(0, 190); for (let x = 0; x <= W; x += 80) g.lineTo(x, 150 + ((x * 7) % 5) * 14); g.lineTo(W, 260); g.lineTo(0, 260); g.fill();
    g.fillStyle = '#a9b5bb'; g.beginPath(); g.moveTo(0, 220); for (let x = 0; x <= W; x += 64) g.lineTo(x, 200 + ((x * 3) % 7) * 6); g.lineTo(W, 260); g.lineTo(0, 260); g.fill();
    g.fillStyle = 'rgba(255,255,255,.55)'; for (const [x, y, r] of [[180, 60, 70], [520, 90, 54], [900, 50, 80], [1130, 110, 50]]) { g.beginPath(); g.ellipse(x, y, r * 1.8, r * 0.34, 0, 0, 7); g.ellipse(x + r * 0.7, y - r * 0.12, r, r * 0.3, 0, 0, 7); g.fill(); }
    const gr = g.createLinearGradient(0, 224, 0, H); gr.addColorStop(0, '#a9b98f'); gr.addColorStop(1, '#8aa475'); g.fillStyle = gr; g.fillRect(0, 224, W, H - 224);
    // 道(タイル行 11〜14)
    g.fillStyle = '#c4beb2'; g.fillRect(0, 352, W, 128); g.fillStyle = '#d6d0c2'; g.fillRect(0, 352, W, 8); g.fillStyle = '#a49e92'; g.fillRect(0, 472, W, 8);
    g.fillStyle = '#e7e2d3'; for (let x = 10; x < W; x += 96) g.fillRect(x, 414, 52, 5);
    g.fillStyle = 'rgba(0,0,0,.05)'; for (let i = 0; i < 160; i++) g.fillRect((i * 83) % W, 360 + (i * 37) % 112, 3, 2);
    // 下の草地
    g.fillStyle = 'rgba(70,110,70,.25)'; for (let i = 0; i < 60; i++) { g.beginPath(); g.ellipse((i * 197) % W, 500 + (i * 61) % 200, 30 + (i % 4) * 10, 8, 0, 0, 7); g.fill(); }
    // 建物 [左タイル, 幅タイル, 壁色, 屋根色, 種類]
    const bld = (tx, tw, wall, roof, kind) => {
      const x = tx * 32, w = tw * 32, y = 7 * 32, h = 4 * 32;
      g.fillStyle = 'rgba(40,40,60,.18)'; g.fillRect(x + 6, y + h - 4, w, 12);
      g.fillStyle = wall; g.fillRect(x, y + 24, w, h - 24);
      g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(x, y + 24, 8, h - 24);
      if (kind === 'tower') {
        g.fillStyle = roof; g.fillRect(x - 6, y - 74, w + 12, 100); g.fillStyle = wall; g.fillRect(x, y - 68, w, 92);
        for (let r = 0; r < 4; r++) for (let q = 0; q < 4; q++) { g.fillStyle = (r * 3 + q) % 3 ? '#38485c' : '#9fd0e0'; g.fillRect(x + 12 + q * 34, y - 56 + r * 22, 22, 14); }
        g.fillStyle = '#2f2f3a'; g.fillRect(x + w / 2 - 2, y - 120, 4, 52); g.fillStyle = '#d9735b'; g.fillRect(x + w / 2 - 6, y - 124, 12, 6);
        g.fillStyle = '#4d6b7c'; g.fillRect(x + 8, y + 20, w - 16, 14); g.fillStyle = '#bfe6f2'; for (let i = 0; i < 8; i++) g.fillRect(x + 14 + i * 18, y + 24, 10, 4);
      } else {
        g.fillStyle = roof; g.beginPath(); g.moveTo(x - 10, y + 30); g.lineTo(x + w * 0.2, y - 26); g.lineTo(x + w * 0.8, y - 26); g.lineTo(x + w + 10, y + 30); g.closePath(); g.fill();
        g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(x - 10, y + 24, w + 20, 6);
      }
      const dx = x + Math.floor((tw - 1) / 2) * 32 + 2, dy = y + h - 58;
      g.fillStyle = kind === 'shop' ? '#d6c9a8' : '#7d6a5a'; g.fillRect(dx, dy, 28, 58);
      g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(dx + 3, dy + 6, 22, 14);
      for (let i = 0; i < Math.max(1, Math.floor(tw / 2)); i++) { const wx = x + 14 + i * 56 + (i > 0 && tw < 7 ? 12 : 0); if (wx + 30 < dx - 4 || wx > dx + 36) { g.fillStyle = '#bfd8e6'; g.fillRect(wx, y + 54, 30, 28); g.strokeStyle = '#6a625a'; g.lineWidth = 3; g.strokeRect(wx, y + 54, 30, 28); g.beginPath(); g.moveTo(wx + 15, y + 54); g.lineTo(wx + 15, y + 82); g.stroke(); } }
      if (kind === 'shop') { g.fillStyle = '#c47a5a'; g.fillRect(x + 6, y + 36, w - 12, 14); g.fillStyle = '#e8dccb'; for (let i = 0; i < tw * 2; i++) g.fillRect(x + 12 + i * 15, y + 36, 8, 14); }
    };
    bld(4, 6, '#d9cdb8', '#8c6a5c', 'house'); bld(13, 7, '#cfd6c9', '#6f8a93', 'shop'); bld(24, 6, '#e3dccd', '#7a8b6a', 'clinic'); bld(33, 5, '#b8bec4', '#6d7a86', 'tower');
    // 電柱と電線
    const poles = [3, 12, 22, 32].map((t) => t * 32 + 16);
    g.strokeStyle = '#3d3a44'; g.lineWidth = 5; for (const x of poles) { g.beginPath(); g.moveTo(x, 110); g.lineTo(x, 372); g.stroke(); g.lineWidth = 4; g.beginPath(); g.moveTo(x - 22, 134); g.lineTo(x + 22, 134); g.moveTo(x - 16, 152); g.lineTo(x + 16, 152); g.stroke(); g.lineWidth = 5; }
    g.lineWidth = 1.6; g.strokeStyle = 'rgba(40,36,50,.85)';
    for (let i = -1; i < poles.length; i++) { const a = i < 0 ? -40 : poles[i], b = i + 1 >= poles.length ? W + 40 : poles[i + 1]; for (const [oy, sag] of [[134, 26], [152, 22], [134, 18]]) { g.beginPath(); g.moveTo(a + (oy === 152 ? 10 : -14), oy); g.quadraticCurveTo((a + b) / 2, oy + sag, b + (oy === 152 ? -10 : 14), oy); g.stroke(); } }
    // 街灯と道ばたの小物
    for (const x of [90, 330, 700, 980, 1190]) { g.fillStyle = '#4b4856'; g.fillRect(x, 300, 4, 56); g.fillStyle = '#f2e3b0'; g.beginPath(); g.ellipse(x + 2, 298, 9, 6, 0, 0, 7); g.fill(); }
    g.fillStyle = '#6a7d8a'; g.fillRect(588, 340, 44, 14); g.fillStyle = '#d9735b'; g.fillRect(592, 334, 14, 6);
    return c;
  }

  // ---------- 立ち絵(会話で大きく出る絵)。assets/p_<id>.webp があればそれを、なければ仮の絵(ちびキャラの拡大) ----------
  const PW = 240, PH = 270, portraits = {};
  const PAL_OF = { minato2: 'rival', minato3: 'rival', ygranny: 'granny', yboy: 'child', yshop: 'nurse', hiker: 'camper', oldman: 'elder', girl: 'child', clerk: 'nurse', farmer: 'granny', nboy: 'child', dockgirl: 'child' };
  function portrait(key) {
    const [id, emo] = String(key).split('@');
    if (emo && imgs['p_' + id]) return portrait(id); // 取りこみ絵は 1枚。しるしと 動きで 表情を つける
    if (portraits[key]) return portraits[key];
    const c = cv(PW * R, PH * R), g = c.getContext('2d'), im = imgs['p_' + id];
    if (im) {
      const k = Math.min(PW / im.width, PH / im.height), w = im.width * k, h = im.height * k;
      drawFit(g, im, (PW - w) / 2 * R, (PH - h) * R, w * R, h * R);
    } else {
      const pal = PAL_OF[id] || id;
      g.save(); g.scale(R, R); person(g, PALETTES[pal] ? pal : 'hero', PALETTES[pal] ? pal : 'hero', 'd', 0, PW / 2, PH + 78, 6, { face: emo || 'calm' }); g.restore();
    }
    return (portraits[key] = c);
  }
  // ミドリ団地(仮): 近未来に改変された田舎。夕暮れの紫、ガラスのビニールハウス、光ファイバー、ドローン
  function town2Bg() {
    const W = 1280, H = 736, c = cv(W, H), g = c.getContext('2d');
    const sky = g.createLinearGradient(0, 0, 0, 260); sky.addColorStop(0, '#6f6a9a'); sky.addColorStop(0.55, '#b39ab8'); sky.addColorStop(1, '#f0c9b0'); g.fillStyle = sky; g.fillRect(0, 0, W, 260);
    g.fillStyle = 'rgba(255,255,255,.35)'; for (let i = 0; i < 50; i++) g.fillRect((i * 97) % W, (i * 53) % 120, 2, 2);
    g.fillStyle = '#8a7fa8'; g.beginPath(); g.moveTo(0, 200); for (let x = 0; x <= W; x += 90) g.lineTo(x, 170 + ((x * 5) % 7) * 8); g.lineTo(W, 260); g.lineTo(0, 260); g.fill();
    for (const x of [140, 520, 860, 1130]) { g.fillStyle = '#5d5878'; g.fillRect(x, 120, 6, 120); g.fillRect(x - 18, 130, 42, 5); g.fillStyle = '#ff7a9a'; g.fillRect(x - 1, 112, 8, 8); }
    const gr = g.createLinearGradient(0, 224, 0, H); gr.addColorStop(0, '#8fa07f'); gr.addColorStop(1, '#6f8a6a'); g.fillStyle = gr; g.fillRect(0, 224, W, H - 224);
    g.fillStyle = '#b8b3b8'; g.fillRect(0, 352, W, 128); g.fillStyle = '#cfc9cf'; g.fillRect(0, 352, W, 8); g.fillStyle = '#9a959c'; g.fillRect(0, 472, W, 8);
    g.fillStyle = '#7ce0e8'; for (let x = 0; x < W; x += 64) g.fillRect(x + 8, 414, 36, 4);
    g.fillStyle = 'rgba(140,255,230,.35)'; g.fillRect(0, 484, W, 5);
    g.strokeStyle = 'rgba(100,230,210,.35)'; g.lineWidth = 3; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(0, 520 + i * 32); g.lineTo(W, 520 + i * 32); g.stroke(); }
    g.fillStyle = 'rgba(70,110,80,.3)'; for (let i = 0; i < 50; i++) { g.beginPath(); g.ellipse((i * 211) % W, 540 + (i * 47) % 160, 36, 8, 0, 0, 7); g.fill(); }
    const bld = (tx, tw, kind) => {
      const x = tx * 32, w = tw * 32, y = 7 * 32, h = 4 * 32;
      g.fillStyle = 'rgba(30,20,60,.22)'; g.fillRect(x + 6, y + h - 4, w, 12);
      if (kind === 'greenhouse') {
        g.fillStyle = 'rgba(150,230,200,.55)'; g.beginPath(); g.moveTo(x - 6, y + h); g.lineTo(x - 6, y + 36); g.lineTo(x + w * 0.5, y - 20); g.lineTo(x + w + 6, y + 36); g.lineTo(x + w + 6, y + h); g.closePath(); g.fill();
        g.strokeStyle = 'rgba(40,90,80,.75)'; g.lineWidth = 2.5; for (let i = 0; i <= tw; i++) { g.beginPath(); g.moveTo(x - 6 + i * ((w + 12) / tw), y + h); g.lineTo(x - 6 + i * ((w + 12) / tw), y + 40 - Math.min(i, tw - i) * 10); g.stroke(); }
        g.beginPath(); g.moveTo(x - 6, y + 36); g.lineTo(x + w * 0.5, y - 20); g.lineTo(x + w + 6, y + 36); g.stroke();
        for (let i = 0; i < tw - 1; i++) { g.fillStyle = '#4fae6a'; g.fillRect(x + 20 + i * 26, y + 84, 16, 28); g.fillStyle = '#9cffb4'; g.fillRect(x + 24 + i * 26, y + 78, 8, 6); }
        g.fillStyle = '#d96fb0'; g.fillRect(x + 10, y + 52, w - 20, 5);
      } else {
        g.fillStyle = kind === 'tower' ? '#6a6a86' : '#c8c4d0'; g.fillRect(x, y + (kind === 'tower' ? -60 : 20), w, h - (kind === 'tower' ? -60 : 20));
        g.fillStyle = 'rgba(0,0,0,.1)'; g.fillRect(x, y + 20, 8, h - 20);
        g.fillStyle = kind === 'tower' ? '#4a4a66' : '#8d86a8'; g.fillRect(x - 6, y + (kind === 'tower' ? -66 : 14), w + 12, 12);
        if (kind === 'tower') { for (let r = 0; r < 6; r++) for (let q = 0; q < tw * 2 - 1; q++) { g.fillStyle = (r + q) % 3 ? '#2f3a58' : '#7cf0ff'; g.fillRect(x + 10 + q * 18, y - 44 + r * 24, 11, 14); } g.fillStyle = '#ff4fa8'; g.fillRect(x + 8, y + 52, w - 16, 6); }
        else for (let i = 0; i < tw - 2; i++) { g.fillStyle = '#bfe0ee'; g.fillRect(x + 14 + i * 36, y + 50, 26, 26); g.strokeStyle = '#6f6a86'; g.lineWidth = 3; g.strokeRect(x + 14 + i * 36, y + 50, 26, 26); }
        if (kind === 'shop') { g.fillStyle = '#52e0c8'; g.fillRect(x + 10, y + 34, w - 20, 8); }
        if (kind === 'kiosk') { g.fillStyle = '#7cf0ff'; g.fillRect(x + 12, y + 34, w - 24, 10); }
      }
      const dx = x + Math.floor((tw - 1) / 2) * 32 + 2, dy = y + h - 58;
      g.fillStyle = kind === 'greenhouse' ? 'rgba(210,255,240,.8)' : '#4d4a66'; g.fillRect(dx, dy, 28, 58); g.fillStyle = 'rgba(124,240,255,.5)'; g.fillRect(dx + 4, dy + 6, 20, 14);
    };
    bld(3, 7, 'greenhouse'); bld(12, 5, 'kiosk'); bld(22, 7, 'shop'); bld(32, 6, 'tower');
    // ネオンの街灯(あかり)
    for (const x of [110, 400, 690, 940, 1190]) { g.fillStyle = '#403c58'; g.fillRect(x - 2, 300, 4, 56); g.fillStyle = '#9fa0c0'; g.beginPath(); g.ellipse(x, 298, 9, 6, 0, 0, 7); g.fill(); }
    // 光ファイバーの電線とドローン
    g.strokeStyle = 'rgba(124,240,255,.65)'; g.lineWidth = 1.8; for (const [y0, sag] of [[120, 30], [140, 24]]) { g.beginPath(); g.moveTo(-10, y0); g.quadraticCurveTo(W / 2, y0 + sag, W + 10, y0); g.stroke(); }
    for (const [x, y] of [[300, 160], [760, 120], [1060, 180]]) { g.fillStyle = '#3d3a52'; g.fillRect(x - 12, y, 24, 8); g.fillRect(x - 22, y - 4, 14, 2); g.fillRect(x + 8, y - 4, 14, 2); g.fillStyle = '#ff7a9a'; g.fillRect(x - 2, y + 8, 4, 3); }
    return c;
  }
  // ナギサ港(仮): 霧の港町
  function town3Bg() {
    const W = 1280, H = 736, c = cv(W, H), g = c.getContext('2d');
    const sky = g.createLinearGradient(0, 0, 0, 250); sky.addColorStop(0, '#a5b3be'); sky.addColorStop(1, '#e3e6e4'); g.fillStyle = sky; g.fillRect(0, 0, W, 250);
    g.fillStyle = '#9fb0ba'; g.fillRect(0, 196, W, 60); g.fillStyle = 'rgba(255,255,255,.35)'; for (let i = 0; i < 14; i++) g.fillRect((i * 97) % W, 200 + (i * 17) % 50, 80 + (i % 3) * 40, 2);
    g.fillStyle = '#8997a2'; g.beginPath(); g.moveTo(0, 210); for (let x = 0; x <= W; x += 120) g.lineTo(x, 180 + ((x * 3) % 5) * 8); g.lineTo(W, 230); g.lineTo(0, 230); g.fill();
    g.fillStyle = '#7d8a96'; g.fillRect(0, 232, W, 120);
    g.fillStyle = '#9a8f80'; g.fillRect(0, 352, W, 128); g.fillStyle = '#b3a896'; g.fillRect(0, 352, W, 8); g.fillStyle = '#7d7366'; g.fillRect(0, 472, W, 8);
    g.strokeStyle = 'rgba(70,60,50,.35)'; g.lineWidth = 2; for (let x = 0; x < W; x += 48) { g.beginPath(); g.moveTo(x, 360); g.lineTo(x, 472); g.stroke(); }
    const sea = g.createLinearGradient(0, 480, 0, H); sea.addColorStop(0, '#78929f'); sea.addColorStop(1, '#52707f'); g.fillStyle = sea; g.fillRect(0, 480, W, H - 480);
    g.strokeStyle = 'rgba(220,235,240,.5)'; g.lineWidth = 2; for (let i = 0; i < 22; i++) { const x = (i * 131) % W, y = 500 + (i * 43) % 220; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 20, y - 6, x + 40, y); g.stroke(); }
    for (const [x, y, s] of [[200, 560, 1], [640, 620, 1.2], [980, 540, 0.9]]) { g.fillStyle = '#4f5f6e'; g.beginPath(); g.moveTo(x - 60 * s, y); g.lineTo(x + 60 * s, y); g.lineTo(x + 44 * s, y + 24 * s); g.lineTo(x - 44 * s, y + 24 * s); g.closePath(); g.fill(); g.fillStyle = '#d9d4c8'; g.fillRect(x - 20 * s, y - 24 * s, 34 * s, 24 * s); g.strokeStyle = '#3d4856'; g.lineWidth = 3; g.beginPath(); g.moveTo(x + 24 * s, y); g.lineTo(x + 24 * s, y - 52 * s); g.stroke(); }
    for (const x of [60, 340, 880, 1180]) { g.fillStyle = '#5b5348'; g.fillRect(x, 470, 10, 34); g.fillStyle = '#8a7e6e'; g.fillRect(x - 2, 468, 14, 5); }
    const bld = (tx, tw, kind) => {
      const x = tx * 32, w = tw * 32, y = 7 * 32, h = 4 * 32;
      g.fillStyle = 'rgba(30,40,60,.2)'; g.fillRect(x + 6, y + h - 4, w, 12);
      if (kind === 'lighthouse') {
        g.fillStyle = '#e6e2d8'; g.beginPath(); g.moveTo(x + 14, y + h); g.lineTo(x + 34, y - 150); g.lineTo(x + w - 34, y - 150); g.lineTo(x + w - 14, y + h); g.closePath(); g.fill();
        g.fillStyle = '#c4574c'; for (const k of [0, 2]) { const yy = y - 150 + k * 70 + 10; g.fillRect(x + 26 - k * 3, yy, w - 52 + k * 6, 34); }
        g.fillStyle = '#4b4f5c'; g.fillRect(x + 28, y - 190, w - 56, 40); g.fillStyle = '#7d8590'; g.fillRect(x + 36, y - 182, w - 72, 24); g.fillStyle = '#4b4f5c'; g.beginPath(); g.moveTo(x + 22, y - 190); g.lineTo(x + w / 2, y - 220); g.lineTo(x + w - 22, y - 190); g.closePath(); g.fill();
      } else {
        const wall = kind === 'warehouse' ? '#9a7a62' : kind === 'clinic' ? '#e4e2da' : '#a9bcc6';
        g.fillStyle = wall; g.fillRect(x, y + 20, w, h - 20); g.fillStyle = 'rgba(0,0,0,.1)'; g.fillRect(x, y + 20, 8, h - 20);
        g.fillStyle = kind === 'warehouse' ? '#6d5a4c' : kind === 'clinic' ? '#8fa89a' : '#5d7e92'; g.beginPath(); g.moveTo(x - 8, y + 26); g.lineTo(x + 20, y - 8); g.lineTo(x + w - 20, y - 8); g.lineTo(x + w + 8, y + 26); g.closePath(); g.fill();
        if (kind === 'market') { g.fillStyle = '#d9735b'; for (let i = 0; i < tw * 2; i++) if (i % 2 === 0) g.fillRect(x + 6 + i * 15, y + 36, 15, 22); g.fillStyle = '#e8e2d2'; for (let i = 0; i < tw * 2; i++) if (i % 2) g.fillRect(x + 6 + i * 15, y + 36, 15, 22); }
        if (kind === 'warehouse') { g.strokeStyle = 'rgba(60,40,30,.4)'; g.lineWidth = 2; for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(x + 6 + i * 16, y + 24); g.lineTo(x + 6 + i * 16, y + h); g.stroke(); } }
        if (kind === 'clinic') { g.fillStyle = '#5fae8a'; g.fillRect(x + w / 2 - 16, y + 34, 32, 8); g.fillRect(x + w / 2 - 4, y + 22, 8, 32); }
        if (kind !== 'warehouse') for (let i = 0; i < Math.max(1, tw - 3); i++) { g.fillStyle = '#d3e4ea'; g.fillRect(x + 14 + i * 40, y + 68, 24, 24); g.strokeStyle = '#5a6a70'; g.lineWidth = 3; g.strokeRect(x + 14 + i * 40, y + 68, 24, 24); }
      }
      const dx = x + Math.floor((tw - 1) / 2) * 32 + 2, dy = y + h - 58;
      g.fillStyle = '#5a4a3c'; g.fillRect(dx, dy, 28, 58); g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(dx + 4, dy + 6, 20, 14);
    };
    bld(3, 7, 'market'); bld(12, 5, 'warehouse'); bld(22, 7, 'clinic'); bld(32, 5, 'lighthouse');
    for (const x of [122, 402, 700, 962]) { g.fillStyle = '#3f4650'; g.fillRect(x - 2, 300, 4, 56); g.fillStyle = '#8b939c'; g.beginPath(); g.ellipse(x, 298, 9, 6, 0, 0, 7); g.fill(); }
    return c;
  }
  // ---------- ドット絵風(歩くときの小さな姿): AIの絵を小さなマス目に縮め、色を減らし、輪郭をつける ----------
  const dots = {};
  function dot(id) {
    if (dots[id]) return dots[id];
    const spr = sprites[id]; if (!spr) return null;
    const sc = cv(spr.width, spr.height), sg = sc.getContext('2d', { willReadFrequently: true }); sg.drawImage(spr, 0, 0);
    const d = sg.getImageData(0, 0, sc.width, sc.height).data; let x0 = sc.width, y0 = sc.height, x1 = -1, y1 = -1;
    for (let y = 0; y < sc.height; y++) for (let x = 0; x < sc.width; x++) if (d[(y * sc.width + x) * 4 + 3] > 70) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    if (x1 < 0) return null;
    const bw = x1 - x0 + 1, bh = y1 - y0 + 1, TH = 18, tw = Math.min(24, Math.max(8, Math.round(bw * TH / bh)));
    const crop = cv(bw, bh); crop.getContext('2d').drawImage(sc, x0, y0, bw, bh, 0, 0, bw, bh);
    const small = cv(tw, TH), smg = small.getContext('2d', { willReadFrequently: true }); drawFit(smg, crop, 0, 0, tw, TH);
    const src = smg.getImageData(0, 0, tw, TH).data, ow = tw + 2, oh = TH + 2, out = cv(ow, oh), og = out.getContext('2d'), im = og.createImageData(ow, oh), p = im.data;
    const q = (v) => Math.min(255, Math.round(v / 42) * 42);
    for (let y = 0; y < TH; y++) for (let x = 0; x < tw; x++) {
      const i = (y * tw + x) * 4, o = ((y + 1) * ow + x + 1) * 4;
      if (src[i + 3] < 120) continue;
      const lum = (src[i] + src[i + 1] + src[i + 2]) / 3, boost = 1.12; // 少し鮮やかに
      for (let k = 0; k < 3; k++) p[o + k] = q(clamp((src[i + k] - lum) * boost + lum, 0, 255));
      p[o + 3] = 255;
    }
    const filled = (x, y) => x >= 0 && y >= 0 && x < ow && y < oh && p[(y * ow + x) * 4 + 3] === 255, edge = [];
    for (let y = 0; y < oh; y++) for (let x = 0; x < ow; x++) if (!filled(x, y) && (filled(x - 1, y) || filled(x + 1, y) || filled(x, y - 1) || filled(x, y + 1))) edge.push((y * ow + x) * 4);
    for (const o of edge) { p[o] = 58; p[o + 1] = 44; p[o + 2] = 50; p[o + 3] = 255; }
    og.putImageData(im, 0, 0);
    return (dots[id] = out);
  }
  // ひかりの個体(色違い): 色相をずらした絵を、必要なときに作る
  const shinies = {};
  function shiny(id) {
    if (shinies[id]) return shinies[id];
    const spr = sprites[id]; if (!spr) return null;
    const c = cv(spr.width, spr.height), cg = c.getContext('2d', { willReadFrequently: true }); cg.drawImage(spr, 0, 0);
    const im = cg.getImageData(0, 0, c.width, c.height), d = im.data;
    for (let i = 0; i < d.length; i += 4) {
      if (!d[i + 3]) continue;
      const r = d[i] / 255, g2 = d[i + 1] / 255, b = d[i + 2] / 255, mx = Math.max(r, g2, b), mn = Math.min(r, g2, b), l = (mx + mn) / 2, dl = mx - mn;
      let h = 0, s = 0; if (dl > 0) { s = l > 0.5 ? dl / (2 - mx - mn) : dl / (mx + mn); h = mx === r ? ((g2 - b) / dl + (g2 < b ? 6 : 0)) : mx === g2 ? (b - r) / dl + 2 : (r - g2) / dl + 4; h /= 6; }
      h = (h + 0.45) % 1; s = Math.min(1, s * 1.15 + 0.04);
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p2 = 2 * l - q, f = (t) => { t = (t + 1) % 1; return t < 1 / 6 ? p2 + (q - p2) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p2 + (q - p2) * (2 / 3 - t) * 6 : p2; };
      d[i] = f(h + 1 / 3) * 255; d[i + 1] = f(h) * 255; d[i + 2] = f(h - 1 / 3) * 255;
    }
    cg.putImageData(im, 0, 0); return (shinies[id] = c);
  }
  const bgMade = {};
  function bg(id) {
    if (bgs[id]) return bgs[id];
    if (!bgMade[id]) bgMade[id] = id === 'town1' ? townBg() : id === 'town2' ? town2Bg() : id === 'town3' ? town3Bg() : cv(1280, 736);
    return bgMade[id];
  }

  const raw = (id) => imgs[id] || null; // 背景を ぬいた、元の 大きさの絵(大きく 寄るとき用)
  return { prop, groundColor, rebuild, raw, S, TS, sprites, bg, portrait, dot, shiny, grassBatch, init, person, tile, tallFront, treeSprite, houseSprite, signSprite, stoneSprite, ball, star, ell, blob, hash, shade, cv };
})();
