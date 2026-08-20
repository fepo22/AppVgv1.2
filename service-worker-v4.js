const CACHE_NAME = "vgv-cache-v1.2";
const APP_ROOT = new URL("./", self.registration.scope).pathname;

const urlsToCache = [
  "",
  "index.html",
  "style.css",
  "script_v2.js",
  "manifest.json",
  "icon-192.png",
  "icon-512.png"
].map(file => `${APP_ROOT}${file}`);

// ============================================================
// INSTALL — Cachea archivos
// ============================================================
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.allSettled(
        urlsToCache.map(url =>
          cache.add(url).catch(err =>
            console.warn("No se pudo cachear:", url, err)
          )
        )
      );
    })
  );
  self.skipWaiting();
});

// ============================================================
// ACTIVATE — Limpia cachés viejos
// ============================================================
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ============================================================
// FETCH — Cache-first
// ============================================================
self.addEventListener("fetch", event => {
  const req = event.request;

  // No interceptar POST
  if (req.method !== "GET") return;

  // No interceptar Apps Script
  if (req.url.includes("script.google.com/macros")) return;

  event.respondWith(
    caches.match(req).then(resp => resp || fetch(req))
  );
});
