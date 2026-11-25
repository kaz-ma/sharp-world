const CACHE = 'sharp-world-mwvjs89s';
const FILES = ["./","index.html","manifest.webmanifest","style.css?v=mwvjs89s","data.js?v=mwvjs89s","art.js?v=mwvjs89s","audio.js?v=mwvjs89s","core.js?v=mwvjs89s","battle.js?v=mwvjs89s","battlefx.js?v=mwvjs89s","light.js?v=mwvjs89s","game.js?v=mwvjs89s","assets/hinatagaeru.webp","assets/hotaruusagi.webp","assets/kinokokko.webp","assets/mikanya.webp","assets/op_1.webp","assets/op_2.webp","assets/op_3.webp","assets/op_4.webp","assets/op_5.webp","assets/op_logo.webp","assets/op_title.webp","assets/pukurisu.webp","assets/p_hero.webp","assets/p_hero_back.webp","assets/shizukufin.webp","icons/icon-192.png?v=mwvjs89s","icons/icon-512.png?v=mwvjs89s","icons/icon-maskable-512.png?v=mwvjs89s","icons/apple-touch-icon.png?v=mwvjs89s"];
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
