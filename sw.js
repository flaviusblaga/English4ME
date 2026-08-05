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
// v4: bypass the browser HTTP cache on fetch (see below) so a fresh upload
// takes effect on the next load instead of up to 10 minutes later. Bumping this
// also drops every stale entry from earlier versions on activate.
// v6: Lucide UI icons — new js/icons.js module + emoji→SVG swaps across the app.
// v7: i18n — new js/i18n.js (all UI copy in Romanian) + stats screen + home redesign.
// v8: fix daily "chat about it" crash + lock daily practice once done for the day.
// v9: gutter on .card-wide screens (profile + level picker) so text isn't flush-left.
// v10: fix grammar tiers (Storytime/Mastery Cup/Teen) — 3 of 4 exercise types
//      crashed on render because their stem-line map was missing those keys.
// v11: resume a half-finished lesson (stored queue + position, per lesson).
// v12: actually persist that resume point to Drive per answer + on every leave
//      (re-entering a level re-fetches state, so memory-only wasn't enough).
// v13: admin lesson-reset (per module / category / lesson), applied on the
//      child's device via a server-queued request. New js modules touched.
// v14: parent/reading body bottom padding was clobbered → content hid behind
//      the fixed bottom nav. Restore the nav clearance.
// v15: UI redesign phase 2/3 — new design-system tokens (teal/amber/slate,
//      Poppins, subtle shadows) matching the mockup. Visual only.
// v16: UI redesign phase 4 — login screen rebuilt to the mockup layout.
// v17: login wired for supplied assets (logo-e4me.svg, login-hero.png) with
//      graceful fallback to the wordmark + sticker row; subtle fade-in.
// v18: login illustrated backdrop (sky/hills/leaves SVG scene) + grass under
//      the current stickers, so it's not a bare white screen.
// v19: make the login scene clearly visible (blue sky, clouds, 3 green hills).
// v20: login subtitle lists all mascots on one row (Bobo…Otto), scaled to fit.
// v21: new E4ME logo/favicon (colourful book mark) + login logo above wordmark;
//      subtitle "Bobo, Fizz, Sushi & friends"; new friend stickers added.
// v22: cache-bust favicon links (?v=2) + Spike/Rex/Otto as selectable avatars.
// v23: dashboard — "your progress" stat tiles on the home screen (real data).
// v24: dashboard — personal greeting header on the home screen.
// v25: dashboard redesign — "continue where you left off" hero card (child's
//      chosen mascot + real resume point), recent-achievements row, "your
//      lessons" heading, and the login illustrated backdrop on the kid lesson
//      screen. New DOM ids: lesson-continue-card, lesson-achievements,
//      lesson-list-heading; session now carries the member's avatar.
// v26: same login backdrop on the rest of the kid-facing screens — profile
//      picker, level picker, chat, reading and parent view — so the whole app
//      shares one scene (veiled for readability on the text-heavy ones).
// v27: premium pass on the stats screen (unified white card chrome, bolder
//      headings, per-module progress bars, brighter earned badges) and the quiz
//      screen (gradient progress bar, card-style option buttons with hover, a
//      white speech card for the mascot's question).
const CACHE_VERSION = "socatei-v27";

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
        // `cache: "reload"` bypasses the BROWSER's HTTP cache, so we hit the
        // network for real. Without it, GitHub Pages' 10-minute max-age meant a
        // just-uploaded file kept serving its old version for up to 10 minutes
        // even though this worker is "network-first" — which broke the lesson
        // menus after a deploy (one stale module took the whole import chain
        // down). This is what actually delivers the "a fresh upload always
        // wins the moment the phone is online" promise above.
        const fresh = await fetch(request, { cache: "reload" });
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
