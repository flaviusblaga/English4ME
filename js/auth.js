import { CONFIG } from "./config.js";

// drive.file (added for the lesson-recap export) only grants access to files
// THIS app creates in the visible Drive — it cannot read the user's other
// files. Existing users are re-prompted for consent once at next sign-in.
const SCOPES = "https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.file openid email profile";

// The whole session — the access token, who it belongs to, and when it
// expires — is cached here so a page refresh REUSES it directly instead of
// forcing a new Google sign-in. Google access tokens are short-lived (~1 hour);
// within that window every refresh restores instantly and only an explicit
// "Sign out" ends the session. (True beyond-1-hour persistence would need a
// server-side refresh-token flow — a larger change.)
const SESSION_KEY = "engleza-familie:session";

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

function storeSession(token, expiresInSeconds, info) {
  const ttlMs = (Number(expiresInSeconds) > 0 ? Number(expiresInSeconds) : 3600) * 1000;
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      accessToken: token,
      // 60s safety margin so we never hand back a token that dies mid-request
      expiresAt: Date.now() + ttlMs - 60000,
      email: info.email,
      name: info.name,
    })
  );
}

function readStoredSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const s = JSON.parse(raw);
    if (!s.accessToken || !s.expiresAt || Date.now() >= s.expiresAt) return null;
    return s;
  } catch {
    return null;
  }
}

// Reuse a still-valid token cached from a previous load — NO Google interaction
// and no popup, so a refresh restores the session instantly and reliably.
// Returns userInfo ({ email, name }) or null if there's no usable token.
export function restoreSession() {
  const s = readStoredSession();
  if (!s) {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
  accessToken = s.accessToken;
  userInfo = { email: s.email, name: s.name };
  return userInfo;
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
        storeSession(accessToken, response.expires_in, userInfo); // survive refreshes
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
  localStorage.removeItem(SESSION_KEY); // an explicit sign-out ends the cached session
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
