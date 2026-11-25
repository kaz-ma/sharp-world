const CACHE = 'sharp-world-mwvm7cp2';
const FILES = ["./","index.html","manifest.webmanifest","style.css?v=mwvm7cp2","data.js?v=mwvm7cp2","art.js?v=mwvm7cp2","audio.js?v=mwvm7cp2","core.js?v=mwvm7cp2","battle.js?v=mwvm7cp2","battlefx.js?v=mwvm7cp2","light.js?v=mwvm7cp2","chapter.js?v=mwvm7cp2","story.js?v=mwvm7cp2","ch4.js?v=mwvm7cp2","game.js?v=mwvm7cp2","assets/bg_town4.webp","assets/ch0_bg.webp","assets/ch0_fg.webp","assets/ch0_tx.webp","assets/ch1_bg.webp","assets/ch1_fg.webp","assets/ch1_tx.webp","assets/ch2_bg.webp","assets/ch2_fg.webp","assets/ch2_tx.webp","assets/ch3_bg.webp","assets/ch3_fg.webp","assets/ch3_tx.webp","assets/ch4_bg.webp","assets/ch4_fg.webp","assets/ch4_tx.webp","assets/hinatagaeru.webp","assets/hotaruusagi.webp","assets/kinokokko.webp","assets/mem1.webp","assets/mem2.webp","assets/mem3.webp","assets/mikanya.webp","assets/op_1.webp","assets/op_2.webp","assets/op_3.webp","assets/op_4.webp","assets/op_5.webp","assets/op_logo.webp","assets/op_title.webp","assets/pukurisu.webp","assets/p_hero.webp","assets/p_hero_back.webp","assets/scene_sleep.webp","assets/scene_wake.webp","assets/shizukufin.webp","icons/icon-192.png?v=mwvm7cp2","icons/icon-512.png?v=mwvm7cp2","icons/icon-maskable-512.png?v=mwvm7cp2","icons/apple-touch-icon.png?v=mwvm7cp2"];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (e.request.mode === 'navigate') { // ページ本体は まず ネットから(新しい版が すぐ届く)。つながらないときは とっておいたものを
    const page = u.pathname.endsWith('oto.html') ? 'oto.html' : 'index.html';
    e.respondWith(fetch(e.request.url, { cache: 'no-cache' }).then((r) => { if (r.ok) { const c = r.clone(); caches.open(CACHE).then((x) => x.put(page, c)); } return r; }).catch(() => caches.match(page).then((m) => m || caches.match('index.html'))));
    return;
  }
  if (u.origin === location.origin) { e.respondWith(caches.match(e.request, { ignoreSearch: false }).then((r) => r || fetch(e.request))); return; }
  if (u.hostname.endsWith('googleapis.com') || u.hostname.endsWith('gstatic.com')) { // 書体: 取れたものを とっておく
    e.respondWith(caches.open(CACHE).then((c) => c.match(e.request).then((r) => r || fetch(e.request).then((n) => { c.put(e.request, n.clone()); return n; }).catch(() => r))));
  }
});
