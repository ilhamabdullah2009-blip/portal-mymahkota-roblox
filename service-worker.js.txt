
const CACHE_NAME = "mymahkota-portal-v1";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./style.css",
    "./logo.png",
    "./manifest.json"
];

// PASANG SERVICE WORKER
self.addEventListener("install", event => {

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(FILES_TO_CACHE))
    );

    self.skipWaiting();

});

// AKTIFKAN SERVICE WORKER
self.addEventListener("activate", event => {

    event.waitUntil(
        caches.keys().then(keys => {

            return Promise.all(
                keys.map(key => {

                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }

                })
            );

        })
    );

    self.clients.claim();

});

// SISTEM CACHE
self.addEventListener("fetch", event => {

    if (event.request.method !== "GET") {
        return;
    }

    event.respondWith(

        fetch(event.request)
            .then(response => {

                if (response && response.ok) {

                    const copy = response.clone();

                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, copy);
                    });

                }

                return response;

            })
            .catch(() => {

                return caches.match(event.request);

            })

    );

});
