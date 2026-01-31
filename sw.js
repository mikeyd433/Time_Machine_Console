const CACHE_NAME = 'time-machine-v1';
const urlsToCache = [
  './',
  './index.html',
  './fingerprint.html',
  './voice.html',
  './retina.html',
  './styles.css',
  './script.js',
  './icon.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
