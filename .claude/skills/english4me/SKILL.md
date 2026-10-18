---
name: english4me
description: >-
  Working on the english4Me app — the invite-only family English-learning PWA
  (kids / teen / adult "Business English" profiles; static vanilla-JS ES
  modules, NO build step, deployed on GitHub Pages, with a separate Cloudflare
  Worker as the security boundary). Use this whenever you touch this repo
  (English4ME / english4Me) in any way: shipping a change, adding or editing
  lessons/UI/brand, bumping the service-worker cache, editing sw.js or the
  Worker, running the tests, or verifying a visual change. It carries the ship
  ritual, the hard invariants (all-English UI, brand tokens, XSS discipline,
  mascots only on kids' surfaces) and the local screenshot-harness technique.
  Follow it so a change deploys cleanly and never regresses the cache, the
  brand, or the language policy — even for a one-line edit.
---

# Shipping work on english4Me

`CLAUDE.md` at the repo root is the full reference (shape, deploy, security,
brand, language, tests). This skill is the **actionable playbook** — the order
to do things in and the traps to avoid. Read `CLAUDE.md` for the "what"; this
is the "how, in what order, and what bites you".

## The shape in one breath

Static site, **no build step, zero runtime dependencies** — plain ES modules
loaded from `index.html`. Hosted on **GitHub Pages**, auto-deployed from `main`
(the "pages build and deployment" workflow, ~40s per merge). `package.json` /
`node_modules` exist **only** for dev/CI (Playwright); never ship a dependency
or introduce a bundler. The **Cloudflare Worker** is a SEPARATE, gitignored
project — not in this repo.

## The ship ritual — do these in order

Every change, however small, goes through this. The two things that silently
break users are a **stale cache** and **red CI**, and both are preventable
here.

1. **Make the change.** Prefer `textContent` for anything dynamic (see XSS
   below). Keep the code reading like its neighbours.
2. **Bump `CACHE_VERSION` in `sw.js`.** It's the string `english4me-vNN` —
   increment `NN` on *every* deploy. The SW is network-first with
   `cache: "reload"`, and this string also drives the in-app version indicator
   and the "update available" toast (`js/pwa.js`), and the version shown on the
   login screen. Skipping the bump is the #1 cause of "I don't see my change".
   A new *standalone* file that nothing in the app imports (e.g. a separate
   page) doesn't need a bump — it isn't in the app shell or the precache.
3. **Run the checks locally — never push red CI:**
   - `npm run check` → `node --check` on every JS file + `sw.js`.
   - `PW_CHROMIUM=/opt/pw-browsers/chromium-1194/chrome-linux/chrome npx playwright test`
     (the hermetic suite under `tests/`: external Google origins are stubbed; a
     seeded localStorage session restores the static-family picker).
4. **Commit.** Write the message to a file and `git commit -F <file>` — heredocs
   have bitten this repo (exit 144). End the message with the attribution lines
   the session requires.
5. **Push** to the designated feature branch (`git push -u origin <branch>`;
   retry with backoff only on network errors), then open the PR **only if
   asked**. After a PR merges, treat follow-up as a fresh change: restart the
   branch from the latest default branch
   (`git fetch origin main && git checkout -B <branch> origin/main`) and build
   on top — never stack new commits on already-merged history.

## Hard invariants — a change that violates one is a bug

- **The UI is English.** `js/i18n.js` is the single source; `index.html` has
  `lang="en"`. Watch for stray Romanian that has no diacritics and so slips a
  naive scan (real examples caught late: "Copii", "Panou de control",
  "Familii", "Facturare"). Romanian is kept ONLY as *learning aids*: the
  optional RO translation of each "Did you know?" fact
  (`js/didyouknow.data.js`), the RO of each taught word
  (`js/lessons-client.js`), and the false-friends grammar lesson
  (`js/grammar-extra.js`). Never translate those to English; never add Romanian
  to the chrome.
- **Brand tokens.** Colours/space/radius/type live as CSS custom properties on
  `:root` in `css/style.css` (semantic `--primary` = Signal Orange action,
  `--secondary` = Clear Cyan, Ink/Paper neutrals; plus raw `--e4m-*`). Dark
  mode under `:root[data-theme="dark"]`. Keep token **names** stable. Use the
  tokens; don't hardcode hex. Orange *text* on light uses `--primary-text`
  (Orange Deep, AA); primary buttons use **Ink text on Signal Orange** (AA) —
  white on Signal Orange fails AA. The wordmark is always **english4Me**
  (lowercase e, orange `4`, Ink `Me`), never "English4ME".
- **Mascots are for kids.** Bobo/Fizz/Sushi illustrations belong on the child
  lesson surfaces only. Lesson mascots are gated by
  `profile.features.mascots` (beginner/intermediate). The shared entry screens
  (login, profile picker, placement, level-picker) are a premium **dark**
  Business-English hero and carry no mascots; a child's own avatar on their
  picker tile is fine (that *is* a kid account).
- **XSS discipline.** Render any dynamic / user / cross-user text with
  `textContent`. Reserve `innerHTML` for static strings, `iconSvg(...)`, and
  values passed through `escapeHtml(...)`. The Worker — not the client — is the
  security boundary; `js/families.data.js` is convenience, not security.
- **Lazy-load big content.** A large content module that gates a rarely-used
  feature is pulled in with dynamic `import()`, not a static import, so the
  common path doesn't parse it at boot (see `didyouknow.data.js` lazy-loaded in
  `js/lessons.js`, and `grammar-extra*.js` behind `ensureGrammarExtras()` in
  `js/lesson-structure.js`). Guard it with a regression test asserting the
  module isn't fetched at boot (`tests/picker.spec.js`).

## Verifying a visual change (no auth, no live render needed)

Most screens sit behind Google auth, so to *see* a change, drive the static
site with the pre-installed Chromium instead of guessing:

1. Serve the repo: `python3 -m http.server 4173` (same server the tests use).
2. Screenshot with Playwright, pointing at the local Chromium via
   `executablePath: process.env.PW_CHROMIUM`.
3. For a screen behind the picker, seed a static-"blaga"-family session in
   `localStorage` under `engleza-familie:session` (copy the shape from
   `tests/picker.spec.js`) and block `accounts.google.com` so boot stays put.
4. **Dark mode is driven by `data-theme`, not the OS `colorScheme`** — set
   `document.documentElement.setAttribute('data-theme','dark')` in the page to
   capture dark; a Playwright `colorScheme: 'dark'` alone won't flip it.
5. Put throwaway harness files in the scratchpad, or if they must sit at the
   repo root to resolve `./css` / `./js`, delete them before committing. Open
   the PNG and actually look at it before calling a visual change done.

## Deploy specifics

- **App:** merge to `main` → Pages redeploys in ~40s. Then a reload picks up
  the new `CACHE_VERSION`. If a user "still sees the old version", they're on a
  stale cache or Pages hasn't finished — not a code bug.
- **Worker (separate repo, NOT `wrangler deploy`):**
  `node scripts/build-worker-bundle.mjs`, then paste
  `worker/dist/worker.bundle.js` into the Cloudflare dashboard
  (Compute → english4me → Edit code → Deploy).

## Conventions worth remembering

- No invented / illustrative numbers on public-facing or data content — chart
  and show only real recorded state.
- Ask (diagnose → propose → wait) before a visual or working-code change the
  user hasn't clearly asked for; when they have asked, still verify with a
  screenshot.
- `elHidden(id, hidden)` in `js/chat.js` is the null-safe show/hide helper —
  guards against a stale-cache HTML/JS mismatch setting `.hidden` on `null`.
- Adult toolkit: exactly one tool panel open at a time (`setActivePanel`); on
  phones a panel is its own full view, not a pop-up over the chat.
- Keep `sw.js`'s `PRECACHE` list to the curated critical assets (it does not
  enumerate every module); new modules are runtime-cached like their siblings.
