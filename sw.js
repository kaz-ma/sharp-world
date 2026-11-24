const CACHE = 'sharp-world-mwulw5fx';
const FILES = ["./","index.html","manifest.webmanifest","style.css?v=mwulw5fx","data.js?v=mwulw5fx","art.js?v=mwulw5fx","audio.js?v=mwulw5fx","core.js?v=mwulw5fx","battle.js?v=mwulw5fx","game.js?v=mwulw5fx","assets/hinatagaeru.webp","assets/hotaruusagi.webp","assets/kinokokko.webp","assets/mikanya.webp","assets/pukurisu.webp","assets/p_hero.webp","assets/p_hero_back.webp","assets/shizukufin.webp","icons/icon-192.png","icons/icon-512.png","icons/apple-touch-icon.png"];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (e.request.mode === 'navigate') { // ページ本体は まず ネットから(新しい版が すぐ届く)。つながらないときは とっておいたものを
    e.respondWith(fetch(e.request.url, { cache: 'no-cache' }).then((r) => { const c = r.clone(); caches.open(CACHE).then((x) => x.put('index.html', c)); return r; }).catch(() => caches.match('index.html')));
    return;
  }
  if (u.origin === location.origin) { e.respondWith(caches.match(e.request, { ignoreSearch: false }).then((r) => r || fetch(e.request))); return; }
  if (u.hostname.endsWith('googleapis.com') || u.hostname.endsWith('gstatic.com')) { // 書体: 取れたものを とっておく
    e.respondWith(caches.open(CACHE).then((c) => c.match(e.request).then((r) => r || fetch(e.request).then((n) => { c.put(e.request, n.clone()); return n; }).catch(() => r))));
  }
});
