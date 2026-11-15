
const CACHE_NAME = "mymahkota-v1";

const FILES_TO_CACHE = [
    "./index.html",
    "./style.css",
    "./logo.png",
    "./manifest.json",
    "./icon-192.png",
    "./icon-512.png"
];

self.addEventListener("install", function(event) {

    event.waitUntil(
        caches.open(CACHE_NAME).then(
            async function(cache) {

                await Promise.allSettled(
                    FILES_TO_CACHE.map(
                        function(file) {
                            return cache.add(file);
                        }
                    )
                );

                await self.skipWaiting();
            }
        )
    );

});

self.addEventListener("activate", function(event) {

    event.waitUntil(
        caches.keys().then(
            async function(keys) {

                await Promise.all(
                    keys
                        .filter(function(key) {
                            return key !== CACHE_NAME;
                        })
                        .map(function(key) {
                            return caches.delete(key);
                        })
                );

                await self.clients.claim();
            }
        )
    );

});

self.addEventListener("fetch", function(event) {

    if (event.request.method !== "GET") {
        return;
    }

    const url = new URL(event.request.url);

    if (url.origin !== self.location.origin) {
        return;
    }

    const allowedFiles = [
        "index.html",
        "style.css",
        "logo.png",
        "manifest.json",
        "icon-192.png",
        "icon-512.png"
    ];

    const fileName =
        url.pathname.split("/").pop() ||
        "index.html";

    if (!allowedFiles.includes(fileName)) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then(function(response) {

                if (response.ok) {

                    const copy = response.clone();

                    caches.open(CACHE_NAME).then(
                        function(cache) {
                            cache.put(
                                event.request,
                                copy
                            );
                        }
                    );
                }

                return response;
            })
            .catch(function() {

                return caches.match(event.request);

            })
    );

});
