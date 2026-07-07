const CACHE_NAME = 'mamago-regi-v1';
const CORE_ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './favicon.ico',
    './favicon-32x32.png',
    './favicon-16x16.png',
    './apple-touch-icon.png'
];

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(CORE_ASSETS);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(keys) {
            return Promise.all(
                keys.filter(function(key) { return key !== CACHE_NAME; })
                    .map(function(key) { return caches.delete(key); })
            );
        })
    );
    self.clients.claim();
});

// ネットワーク優先：オンライン時は常に最新版を取得してキャッシュを更新し、
// 電波が無い時だけキャッシュから開けるようにする（更新の反映遅延を防ぐため）
self.addEventListener('fetch', function(event) {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        fetch(event.request).then(function(response) {
            var copy = response.clone();
            caches.open(CACHE_NAME).then(function(cache) {
                cache.put(event.request, copy);
            });
            return response;
        }).catch(function() {
            return caches.match(event.request).then(function(cached) {
                return cached || caches.match('./index.html');
            });
        })
    );
});
