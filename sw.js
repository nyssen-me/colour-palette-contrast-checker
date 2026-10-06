/*
 * Service worker: makes the checker work offline and installable.
 * Bump CACHE_VERSION (and $cpc_version in index.php) whenever you change the files.
 */
var CACHE_VERSION = '1.0.10';
var CACHE_NAME = 'cpc-' + CACHE_VERSION;

var PRECACHE = [
    './',
    'assets/css/cpc.css?v=' + CACHE_VERSION,
    'assets/js/cpc.js?v=' + CACHE_VERSION,
    'assets/data/colour-names.json',
    'manifest.webmanifest',
    'assets/icons/icon.svg',
    'assets/icons/icon-32.png',
    'assets/icons/icon-192.png',
    'assets/icons/icon-512.png'
];

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function (cache) { return cache.addAll(PRECACHE); })
            .then(function () { return self.skipWaiting(); })
    );
});

self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (keys) {
            return Promise.all(keys.map(function (key) {
                if (key.indexOf('cpc-') === 0 && key !== CACHE_NAME) return caches.delete(key);
            }));
        }).then(function () { return self.clients.claim(); })
    );
});

self.addEventListener('fetch', function (event) {
    var request = event.request;
    if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

    // Pages: network first (so updates show up), cached page when offline.
    // The palette lives in the query string, so any ?c=... URL can use the cached page.
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request).then(function (response) {
                if (response.ok) {
                    var copy = response.clone();
                    caches.open(CACHE_NAME).then(function (cache) { cache.put('./', copy); });
                }
                return response;
            }).catch(function () {
                return caches.match('./');
            })
        );
        return;
    }

    // Everything else: cache first, then network (and keep a copy).
    event.respondWith(
        caches.match(request).then(function (cached) {
            return cached || fetch(request).then(function (response) {
                if (response.ok) {
                    var copy = response.clone();
                    caches.open(CACHE_NAME).then(function (cache) { cache.put(request, copy); });
                }
                return response;
            });
        })
    );
});
