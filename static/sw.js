const CACHE_NAME = "mau-ghi-chu-v2.7.0";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/styles.css?v=2.7.0",
  "/app.js?v=2.7.0",
  "/favicon.png?v=2.7.0",
  "/manifest.webmanifest",
  "/assets/fonts/nunito-latin-wght-normal.woff2",
  "/assets/fonts/nunito-vietnamese-wght-normal.woff2",
  "/assets/fonts/mali-latin-400-normal.woff2",
  "/assets/fonts/mali-vietnamese-400-normal.woff2",
  "/assets/fonts/mali-latin-600-normal.woff2",
  "/assets/fonts/mali-vietnamese-600-normal.woff2",
  "/assets/fonts/mali-latin-700-normal.woff2",
  "/assets/fonts/mali-vietnamese-700-normal.woff2",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        }),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Network-first for API requests
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(
          JSON.stringify({ offline: true, error: "Đang mất kết nối mạng. Dữ liệu đang xem ở chế độ ngoại tuyến." }),
          { headers: { "Content-Type": "application/json" }, status: 503 },
        );
      }),
    );
    return;
  }

  // Cache-first / Stale-while-revalidate for static assets
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => {});
        return cached;
      }
      return fetch(event.request);
    }),
  );
});
