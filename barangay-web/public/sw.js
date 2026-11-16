// Minimal service worker para sa PWA (offline cache ng app shell)
const CACHE = 'bsj-v2';
const SHELL = ['/', '/index.html', '/manifest.json', '/seal.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL).catch(() => {})));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  // Network-first para sa API (laging fresh ang data)
  if (req.url.includes('/api/')) {
    e.respondWith(
      fetch(req).catch(() => caches.match(req))
    );
    return;
  }
  // Network-first para sa navigation (index.html) — para makita agad ang bagong version
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      }).catch(() => caches.match('/index.html'))
    );
    return;
  }
  // Cache-first para sa assets
  e.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match('/index.html')))
  );
});
