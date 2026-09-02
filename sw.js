const CACHE = 'nse-chart-pdf-v1';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Cache-first for the app shell, network passthrough for everything else
// (stock data and CDN libraries always need a live network request).
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const isCoreAsset = CORE_ASSETS.some((a) => url.pathname.endsWith(a.replace('./', '/')));
  if (event.request.method === 'GET' && url.origin === self.location.origin && isCoreAsset) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
  }
});
