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

export function initPwa() {
  // Register the service worker (required for Android's install prompt).
  // Relative URL so it works under the GitHub Pages project subpath.
  if ("serviceWorker" in navigator) {
    const register = () =>
      navigator.serviceWorker.register("sw.js").catch((err) => {
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
