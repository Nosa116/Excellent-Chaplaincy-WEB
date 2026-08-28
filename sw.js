const CACHE_NAME = 'ecgm-v1';
const STATIC_ASSETS = [
  './',
  './index.html',
  './css/index.css',
  './js/index.js',
  './js/gallery-data.json',
  './assets/logo.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Cloudinary images/videos: CacheFirst with network fallback, 30d max
  if (url.hostname === 'res.cloudinary.com') {
    event.respondWith(
      caches.open('ecgm-cloudinary').then(async (cache) => {
        const cached = await cache.match(req);
        if (cached) return cached;
        try {
          const res = await fetch(req);
          if (res.ok) cache.put(req, res.clone());
          return res;
        } catch (e) {
          return cached || Response.error();
        }
      })
    );
    return;
  }

  // gallery-data.json: StaleWhileRevalidate
  if (url.pathname.endsWith('gallery-data.json')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(req);
        const fetchPromise = fetch(req).then((res) => {
          if (res.ok) cache.put(req, res.clone());
          return res;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // Other GET: CacheFirst for assets, NetworkFirst for HTML
  if (req.method === 'GET') {
    if (req.destination === 'document') {
      event.respondWith(fetch(req).catch(() => caches.match('./index.html')));
    } else {
      event.respondWith(caches.match(req).then((cached) => cached || fetch(req).then((res) => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, clone));
        }
        return res;
      })));
    }
  }
});
