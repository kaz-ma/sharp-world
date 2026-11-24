const CACHE = 'sharp-world-mwulu5zo';
const FILES = ["./","index.html","manifest.webmanifest","style.css?v=mwulu5zo","data.js?v=mwulu5zo","art.js?v=mwulu5zo","audio.js?v=mwulu5zo","core.js?v=mwulu5zo","battle.js?v=mwulu5zo","game.js?v=mwulu5zo","assets/hinatagaeru.webp","assets/hotaruusagi.webp","assets/kinokokko.webp","assets/mikanya.webp","assets/pukurisu.webp","assets/p_hero.webp","assets/p_hero_back.webp","assets/shizukufin.webp","icons/icon-192.png","icons/icon-512.png","icons/apple-touch-icon.png"];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (u.origin === location.origin) { e.respondWith(caches.match(e.request, { ignoreSearch: false }).then((r) => r || fetch(e.request))); return; }
  if (u.hostname.endsWith('googleapis.com') || u.hostname.endsWith('gstatic.com')) { // 書体: 取れたものを とっておく
    e.respondWith(caches.open(CACHE).then((c) => c.match(e.request).then((r) => r || fetch(e.request).then((n) => { c.put(e.request, n.clone()); return n; }).catch(() => r))));
  }
});
