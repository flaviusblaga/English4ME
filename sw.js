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
// v28: premium pass on the last screens — lesson-complete (stars + score on one
//      white celebration card, unified summary/reward chrome), chat (softer
//      assistant bubble) and reading (the story now on a proper premium page).
// v29: lessons menu is now a collapsible accordion — each category is a card
//      header (emoji, name, progress) that opens to a tidy list of its lessons
//      (stars if done, a play chip if not); the current category starts open.
//      New icons: chevron-down, play. Replaces the zig-zag trail.
// v30: one premium teal look for everyone — the level-placement test now sits on
//      the illustrated backdrop with a white question card; the teen theme drops
//      its purple palette for the shared teal (scene included); the adult zone
//      turns from a dark dashboard into the same light teal premium (header +
//      usage card). Kids unchanged.
// v31: separate the parent's LEARNING zone from the admin CONTROL PANEL. New
//      #screen-control-panel (super-admin only) gathers billing/usage, family
//      management and children's progress; the usage card moved here off the
//      learning header, so the parent's own learning stays clutter-free. The
//      super-admin picker entry ("Panou de control") opens it; the family modal
//      is now a top-level overlay.
// v32: Control Panel → "Progres copii" is now cross-family for the super-admin —
//      the child dropdowns list EVERY family's children (static + KV, grouped by
//      family). Needs the Worker redeploy: canReadProgressOf / adultManagingChild
//      now allow a super-admin to read/reset any family's child.
// v33: a 50-question lesson is now delivered in five parts of 10 — a checkpoint
//      screen after every 10 questions lets the child push on or stop and resume
//      exactly there. One lesson / one reward still (economy unchanged); daily
//      practice is exempt. New #lesson-checkpoint-view.
// v34: opening a level no longer fails silently — loadSession is wrapped so a
//      Drive/network error shows a clear message (with a "grant Drive & sign in
//      again" hint) instead of a dead tap. Diagnoses the "lessons won't open"
//      report.
// v35: the owner's OWN family stores progress on the Worker (KV) instead of
//      Google Drive, so its children on Google Family Link accounts (which
//      Google blocks from the Drive scope) can finally use the app. Every other
//      family keeps their data in their own Drive, unchanged. Needs the Worker
//      redeploy (new /state routes). New worker/src/state-store.js.
// v36: the mascot picker chips are now vertical (face on top, name underneath)
//      and share one row instead of wrapping on narrow phones; the stats screen's
//      "lessons per module" rows became emoji-tile mini-cards with a visible
//      progress bar. Visual only.
// v37: the illustrated backdrop was too heavily veiled to notice — lightened the
//      veil on the kid/teen lesson, stats, parent, chat and reading screens so
//      the sky and hills actually show behind the white cards.
// v38: stats "lessons per module" redesigned from a flat divider list into a
//      stack of premium mini-cards (teal emoji tile, name, count, rounded
//      progress bar) — same visual language as the lesson accordion.
const CACHE_VERSION = "socatei-v38";

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
