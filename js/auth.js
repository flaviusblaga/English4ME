import { CONFIG } from "./config.js";

const SCOPES = "https://www.googleapis.com/auth/drive.appdata openid email profile";

let tokenClient = null;
let accessToken = null;
let userInfo = null; // { email, name }

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
