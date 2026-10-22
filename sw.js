// Offline cache for Ironhorse Form Practice.
// The deploy workflow replaces __BUILD__ with the commit id, so every deploy installs a fresh cache.
const VERSION = 'ironhorse-__BUILD__';
const ASSETS = [
  './', 'index.html', 'styles.css', 'data.js', 'app.js', 'manifest.webmanifest',
  'fonts/inter-latin-var.woff2',
  'icons/logo.jpg', 'icons/favicon-32.png', 'icons/apple-touch-icon.png',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png'
];

self.addEventListener('install', e => {
  // cache: 'reload' skips the browser's HTTP cache, so a new version never stores stale files.
  e.waitUntil(
    caches.open(VERSION)
      .then(c => c.addAll(ASSETS.map(url => new Request(url, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  // Only remove this app's old caches; other sites on the same origin keep theirs.
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('ironhorse-') && k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.open(VERSION).then(cache =>
    cache.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request).then(res => {
      if (res.ok && new URL(e.request.url).origin === location.origin) cache.put(e.request, res.clone());
      return res;
    }).catch(() => e.request.mode === 'navigate' ? cache.match('index.html') : Response.error()))
  ));
});
