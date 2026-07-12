// Service worker — its ONLY jobs are (a) to make the app installable on
// phones (Chrome/Android require a registered SW with a fetch handler) and
// (b) to let the installed app still open its shell when the phone is
// briefly offline.
//
// Deliberately NETWORK-FIRST for our own files. This app always runs online
// (Google sign-in, the Cloudflare Worker, Google Drive all need the network),
// and — more importantly — the whole update workflow is "drag-and-drop the
// new files onto GitHub". A cache-first worker would keep serving yesterday's
// HTML/JS after an upload, which is exactly the kind of stale-cache pain this
// project has hit before. Network-first means a fresh upload always wins the
// moment the phone is online; the cache is only a last-resort offline shell.
//
// Bump CACHE_VERSION whenever you want installed apps to drop their old
// offline copy on next launch.
const CACHE_VERSION = "socatei-v1";

self.addEventListener("install", (event) => {
  // Activate this new worker immediately instead of waiting for every old
  // tab to close — so an updated worker (e.g. a new CACHE_VERSION) takes
  // over as soon as the app is reopened.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Only ever touch our own GET requests. Google auth, the Worker API, and
  // Drive uploads (cross-origin, POST/PATCH) must pass straight through
  // untouched — never cache or interfere with them.
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) {
    return; // default browser handling
  }

  event.respondWith(
    (async () => {
      try {
        const fresh = await fetch(request);
        // Keep a copy of same-origin GETs for offline fallback only.
        if (fresh && fresh.ok) {
          const cache = await caches.open(CACHE_VERSION);
          cache.put(request, fresh.clone());
        }
        return fresh;
      } catch (err) {
        // Offline: serve the cached copy if we have one, otherwise fall back
        // to the cached app shell for navigations.
        const cached = await caches.match(request);
        if (cached) return cached;
        if (request.mode === "navigate") {
          const shell = await caches.match("index.html");
          if (shell) return shell;
        }
        throw err;
      }
    })()
  );
});
