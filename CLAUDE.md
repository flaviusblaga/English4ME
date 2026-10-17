# english4Me — project guide for Claude

A family English-learning **PWA** for the NetWorth ecosystem. Kids / teen /
adult profiles; the adult surface is "Business English" (role-play, writing,
phrasebank, scenarios). Invite-only.

## Shape of the app
- **Static site, no build step, zero runtime dependencies.** Plain ES modules
  loaded from `index.html`. Do not introduce a bundler or framework.
- Hosted on **GitHub Pages**, deployed automatically from `main` (the
  "pages build and deployment" workflow runs on every merge, ~40s).
- `package.json` / `node_modules` exist **only for dev/CI** (Playwright); they
  are never shipped. Keep the app itself dependency-free.

## Deploy (read before shipping)
- **Bump `CACHE_VERSION` in `sw.js` on every deploy** — the string is
  `english4me-vNN` (increment NN). The service worker is network-first with
  `cache: "reload"`, so a reload gets fresh content once Pages has deployed;
  the version also drives the in-app version indicator + "update available"
  toast (`js/pwa.js`). The login screen shows the live version (`.app-version`).
- The **Cloudflare Worker** is a SEPARATE project, NOT in this repo (gitignored
  elsewhere). Deploy it with `node scripts/build-worker-bundle.mjs` then paste
  `worker/dist/worker.bundle.js` into the Cloudflare dashboard
  (Compute → english4me → Edit code → Deploy). **Not** `wrangler deploy`.

## Security model
- Auth is Google OAuth (GIS implicit flow, `js/auth.js`); the access token is
  cached in localStorage and sent as a Bearer to the Worker.
- The **Worker is the security boundary**: it derives identity from the token
  and re-checks the family allowlist + super-admin on every request. The
  client registry (`js/families.data.js`) is convenience, not security.
- User data lives in each user's **Google Drive** (appDataFolder), except the
  owner's "blaga" family, whose state lives in the Worker's KV (their kids use
  Family Link accounts that can't grant the Drive scope).
- **XSS discipline:** render any dynamic/user/cross-user text with
  `textContent`; reserve `innerHTML` for static strings, `iconSvg(...)`, and
  values passed through `escapeHtml(...)`. Chat messages, member names and
  child data already use `textContent` — keep it that way.

## Brand (brand book v1)
- Colours: **Signal Orange `#FF6B1A`** = action/primary; **Clear Cyan
  `#14B8D4`** = progress/accent; **Ink `#111111`**, **Paper `#FFFFFF`**, Warm
  Paper `#FAF8F5`, Line `#E3E0DB`. Orange TEXT on light uses Orange Deep
  `#C24A08` (AA); primary buttons use **Ink text on Signal Orange** (AA).
- Tokens live on `:root` in `css/style.css` (semantic `--primary` etc., plus
  raw `--e4m-*`). Dark mode under `:root[data-theme="dark"]`. Keep token NAMES
  stable. Profile scoping via `body[data-usertype="adult"|"teen"|"child"]`.
- Fonts: **Plus Jakarta Sans** (display/wordmark/buttons), **Inter** (body),
  JetBrains Mono (small mono labels).
- Logo assets in `assets/brand/` (mark, logo, logo-white, app-icon, favicon,
  PWA PNG icons). Wordmark is always **english4Me** (lowercase e, bold `4` in
  orange, bold `Me` in Ink) — never "English4ME".
- Mascots (Bobo/Fizz/Sushi) are kept as illustrations for kids/teen.

## Language
- The whole **UI is English** (`js/i18n.js` is the single source; `lang="en"`).
- Romanian is kept ONLY as learning aids: the optional RO translation of each
  "Did you know?" fact (`js/didyouknow.data.js`), the RO translation of each
  taught word (`js/lessons-client.js`), and the false-friends grammar lesson
  (`js/grammar-extra.js`). Don't translate those to English.

## Tests / CI
- `npm run check` → `node --check` every JS file + `sw.js`.
- `npx playwright test` runs `tests/` (hermetic: external Google origins are
  stubbed; a seeded localStorage session restores the static-family picker).
  Locally set `PW_CHROMIUM=/opt/pw-browsers/chromium-1194/chrome-linux/chrome`.
- GitHub Actions (`.github/workflows/ci.yml`) runs both on every PR + push to
  main. **Run the smoke test and `node --check` before pushing** — never push
  red CI.

## Conventions
- No invented/illustrative numbers on public-facing content.
- Ask (diagnose → propose → wait) before visual or working-code changes the
  user hasn't clearly asked for.
- `elHidden(id, hidden)` is the null-safe show/hide helper in `js/chat.js`
  (guards against stale-cache HTML/JS mismatches).
- Adult toolkit: exactly one tool panel open at a time (`setActivePanel`); on
  phones a panel is its own full view, not a pop-up over the chat.
- Big content modules are lazy-loaded where they gate a rarely-used feature
  (see the `import()` of `didyouknow.data.js` in `js/lessons.js`). A regression
  test guards that the fact bank isn't fetched at boot.
