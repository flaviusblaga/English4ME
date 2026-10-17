// Turns the site into an installable app on phones: registers the service
// worker and drives the "Install on my phone" button. No app state, no
// auth — purely install plumbing, so it can run at boot before sign-in.

let deferredInstallPrompt = null;

function el(id) {
  return document.getElementById(id);
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari uses a non-standard flag instead of display-mode.
    window.navigator.standalone === true
  );
}

function isIos() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

// A small, dismissible banner telling the user a newer version is cached and
// ready — one tap reloads into it. This is what ends the "did my change ship?"
// / hard-reload-twice confusion: when a new service worker has installed, the
// user gets an explicit, obvious way to pick it up.
function showUpdateToast() {
  if (document.getElementById("update-toast")) return; // already showing
  const toast = document.createElement("div");
  toast.id = "update-toast";
  toast.className = "update-toast";
  toast.setAttribute("role", "status");

  const msg = document.createElement("span");
  msg.className = "update-toast-msg";
  msg.textContent = "A new version is available.";

  const refresh = document.createElement("button");
  refresh.type = "button";
  refresh.className = "update-toast-btn";
  refresh.textContent = "Refresh";
  refresh.addEventListener("click", () => window.location.reload());

  const dismiss = document.createElement("button");
  dismiss.type = "button";
  dismiss.className = "update-toast-dismiss";
  dismiss.setAttribute("aria-label", "Dismiss");
  dismiss.textContent = "✕";
  dismiss.addEventListener("click", () => toast.remove());

  toast.append(msg, refresh, dismiss);
  document.body.appendChild(toast);
}

// Watch a registration for a newer worker finishing install. We only prompt
// when there is already an active controller (i.e. this is an UPDATE, not the
// first-ever install), so a brand-new visitor is never nagged.
function watchForUpdates(reg) {
  if (!reg) return;
  if (reg.waiting && navigator.serviceWorker.controller) showUpdateToast();
  reg.addEventListener("updatefound", () => {
    const nw = reg.installing;
    if (!nw) return;
    nw.addEventListener("statechange", () => {
      if (nw.state === "installed" && navigator.serviceWorker.controller) showUpdateToast();
    });
  });
  // A long-open PWA won't navigate, so nudge the browser to re-check sw.js
  // whenever the app comes back to the foreground.
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) reg.update().catch(() => {});
  });
}

// Show the ACTUAL cached version (the sw.js CACHE_VERSION) wherever the page
// has an #app-version slot — single source of truth, nothing to keep in sync.
async function showAppVersion() {
  if (!("caches" in window)) return;
  let version = "";
  try {
    const keys = await caches.keys();
    const k = keys.find((x) => x.startsWith("english4me-"));
    if (k) version = k.replace("english4me-", "");
  } catch { /* caches unavailable (private mode) — just leave it blank */ }
  if (!version) return;
  document.querySelectorAll("#app-version, .app-version").forEach((elv) => {
    elv.textContent = version;
  });
}

export function initPwa() {
  // Register the service worker (required for Android's install prompt).
  // Relative URL so it works under the GitHub Pages project subpath.
  if ("serviceWorker" in navigator) {
    const register = () =>
      navigator.serviceWorker
        .register("sw.js")
        .then((reg) => {
          watchForUpdates(reg);
          showAppVersion();
        })
        .catch((err) => {
          console.warn("Service worker registration failed (non-fatal):", err);
        });
    // If the page has already finished loading (common when it's served fast
    // or from cache), the "load" event has fired and a listener added now
    // would never run — register straight away in that case.
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register);
  }

  const installBtn = el("install-app-btn");
  const iosHint = el("ios-install-hint");
  if (!installBtn) return;

  // Already installed / launched from the home screen — nothing to offer.
  if (isStandalone()) return;

  // Chrome/Android: capture the native prompt and reveal our own button.
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault(); // stop Chrome's mini-infobar; we drive it ourselves
    deferredInstallPrompt = event;
    installBtn.hidden = false;
  });

  installBtn.addEventListener("click", async () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      const { outcome } = await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      if (outcome === "accepted") installBtn.hidden = true;
    } else if (isIos() && iosHint) {
      // iOS Safari never fires beforeinstallprompt — the only way in is the
      // manual Share → Add to Home Screen flow, so show how.
      iosHint.hidden = !iosHint.hidden;
    }
  });

  // iOS: no native prompt exists, so show the button up front (tapping it
  // toggles the instructions). Android without a prompt (already installed,
  // or unsupported) simply leaves the button hidden.
  if (isIos()) installBtn.hidden = false;

  // Once installed, hide the button and thank the user.
  window.addEventListener("appinstalled", () => {
    installBtn.hidden = true;
    if (iosHint) iosHint.hidden = true;
  });
}
