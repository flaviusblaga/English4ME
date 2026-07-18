import { CONFIG } from "./config.js";

// drive.file (added for the lesson-recap export) only grants access to files
// THIS app creates in the visible Drive — it cannot read the user's other
// files. Existing users are re-prompted for consent once at next sign-in.
const SCOPES = "https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.file openid email profile";

// Remembers that the user completed a real sign-in at least once on this
// device. The Google access token itself lives only in memory (below) and is
// lost on every page refresh — this flag is the cue to quietly ask Google for
// a fresh token on the next load instead of forcing a manual re-login.
const SIGNED_IN_KEY = "engleza-familie:signed-in";

let tokenClient = null;
let accessToken = null;
let userInfo = null; // { email, name }

// Resolves once the Google Identity Services script (loaded async in the page)
// is ready, so initAuth()/signIn() never run against an undefined `google`
// global on a cold, fast page load.
export function whenGoogleReady(timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    const ready = () => window.google && window.google.accounts && window.google.accounts.oauth2;
    if (ready()) {
      resolve();
      return;
    }
    const start = Date.now();
    const timer = setInterval(() => {
      if (ready()) {
        clearInterval(timer);
        resolve();
      } else if (Date.now() - start > timeoutMs) {
        clearInterval(timer);
        reject(new Error("Google Identity Services failed to load"));
      }
    }, 50);
  });
}

// True if the user has signed in before — the cue to attempt a silent restore.
export function wasSignedIn() {
  return localStorage.getItem(SIGNED_IN_KEY) === "true";
}

// Called once, after the Google Identity Services script (gsi/client) has loaded.
export function initAuth() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CONFIG.GOOGLE_CLIENT_ID,
    scope: SCOPES,
    callback: "", // set per-call in signIn(), so we can await the result
  });
}

export function signIn() {
  return new Promise((resolve, reject) => {
    tokenClient.callback = async (response) => {
      if (response.error) {
        reject(new Error(response.error));
        return;
      }
      accessToken = response.access_token;
      try {
        userInfo = await fetchUserInfo(accessToken);
        localStorage.setItem(SIGNED_IN_KEY, "true"); // enable silent restore on future loads
        resolve(userInfo);
      } catch (err) {
        reject(err);
      }
    };
    // prompt: '' lets Google skip the consent screen for a returning user
    // with an active session; falls back to full consent if needed.
    tokenClient.requestAccessToken({ prompt: "" });
  });
}

export function signOut() {
  if (accessToken) {
    google.accounts.oauth2.revoke(accessToken, () => {});
  }
  accessToken = null;
  userInfo = null;
  localStorage.removeItem(SIGNED_IN_KEY); // an explicit sign-out must NOT silently restore
}

export function getAccessToken() {
  return accessToken;
}

export function getUserInfo() {
  return userInfo;
}

async function fetchUserInfo(token) {
  const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch user info: ${response.status}`);
  }
  const data = await response.json();
  return { email: data.email, name: data.name || data.email };
}
