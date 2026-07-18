import { initAuth, signIn, signOut, getAccessToken, whenGoogleReady, wasSignedIn } from "./auth.js";
import { getOrCreateState } from "./drive.js";
import { initChat } from "./chat.js";
import { initLessons } from "./lessons.js";
import { initReading } from "./reading.js";
import { PROFILES, getProfile } from "./profile.js";
import { getRememberedProfileId, rememberProfileId } from "./profile-picker.js";
import { initParentView } from "./parent-view.js";
import { initPwa } from "./pwa.js";

let currentUser = null; // { email, name } — set after sign-in, used once a profile is picked
let currentSession = null; // { accessToken, userEmail, displayName, fileId, state, profile } — reused across lesson<->chat navigation

function el(id) {
  return document.getElementById(id);
}

function showScreen(name) {
  el("screen-login").hidden = name !== "login";
  el("screen-profile-picker").hidden = name !== "profile-picker";
  el("screen-chat").hidden = name !== "chat";
  el("screen-lesson").hidden = name !== "lesson";
  el("screen-reading").hidden = name !== "reading";
  el("screen-parent-view").hidden = name !== "parent-view";
  updateAppNav(name);
}

// The bottom tab bar is a single shared element (index.html) that we relocate
// into whichever app screen is showing, so it visually belongs to that screen
// (sticky at the bottom of the phone column). Which tabs appear depends on the
// active profile's features; login/profile-picker show no nav at all.
const NAV_TAB_BY_SCREEN = {
  chat: "nav-chat",
  lesson: "nav-home",
  reading: "nav-reading",
  "parent-view": "nav-parent",
};

function updateAppNav(screenName) {
  const nav = el("app-nav");
  const activeTab = NAV_TAB_BY_SCREEN[screenName];
  if (!currentSession || !activeTab) {
    nav.hidden = true;
    return;
  }

  const f = currentSession.profile.features;
  // Home = lessons/exercises (learners only). Chat = always. Reading = Expert.
  // Parent = the adult profile that can view children.
  el("nav-home").hidden = !(f.lessons || f.chatFirst);
  el("nav-chat").hidden = false;
  el("nav-reading").hidden = !f.reading;
  el("nav-parent").hidden = !f.canViewChildren;

  for (const id of ["nav-home", "nav-chat", "nav-reading", "nav-parent"]) {
    el(id).classList.toggle("app-nav-btn--active", id === activeTab);
  }

  el(`screen-${screenName}`).appendChild(nav); // relocate into the active screen
  nav.hidden = false;
}

function openChat(lessonWordList) {
  initChat({ ...currentSession, lessonWordList, onBackToLessons: openLessons });
  showScreen("chat");
}

function openLessons() {
  initLessons({ ...currentSession, onJustChat: openChat, onChatAboutIt: openChat });
  showScreen("lesson");
}

function openReading() {
  initReading({ ...currentSession, onBack: () => openChat(null) });
  showScreen("reading");
}

async function handleLogin() {
  el("login-error").hidden = true;
  el("login-btn").disabled = true;

  try {
    currentUser = await signIn();
    renderProfilePicker();
    showScreen("profile-picker");
  } catch (err) {
    el("login-error").textContent = `Sign-in failed: ${err.message}`;
    el("login-error").hidden = false;
  } finally {
    el("login-btn").disabled = false;
  }
}

function renderProfilePicker() {
  const list = el("profile-picker-list");
  list.innerHTML = "";
  const remembered = getRememberedProfileId();

  for (const profile of PROFILES) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = `profile-card profile-card--${profile.level}`;
    if (profile.id === remembered) card.classList.add("profile-card--remembered");

    const icon = document.createElement("span");
    icon.className = "profile-card-icon";
    icon.textContent = profile.emoji || "📘";

    const textCol = document.createElement("div");
    textCol.className = "profile-card-text";
    const title = document.createElement("strong");
    title.textContent = profile.displayName;
    const desc = document.createElement("span");
    desc.textContent = profile.description;
    textCol.appendChild(title);
    textCol.appendChild(desc);

    card.appendChild(icon);
    card.appendChild(textCol);
    card.addEventListener("click", () => handleProfilePicked(profile.id));
    list.appendChild(card);
  }
}

async function handleProfilePicked(profileId) {
  const profile = getProfile(profileId);
  rememberProfileId(profileId);

  const accessToken = getAccessToken();
  const { fileId, data } = await getOrCreateState(accessToken, {
    profileId: profile.id,
    userEmail: currentUser.email,
    displayName: currentUser.name,
    level: profile.level,
    features: profile.features,
  });

  document.body.className = `profile-${profile.id}${profile.features.mascots ? " mascot-theme" : ""}`;

  el("current-user-name").textContent = currentUser.name;
  el("current-profile-name").textContent = profile.displayName;
  el("header-avatar").textContent = (currentUser.name[0] || "?").toUpperCase();
  el("view-child-progress-btn").hidden = !profile.features.canViewChildren;
  el("reading-btn").hidden = !profile.features.reading;

  currentSession = {
    accessToken,
    userEmail: currentUser.email,
    displayName: currentUser.name,
    fileId,
    state: data,
    profile,
  };

  // Mascot tiers land on the lesson menu; chat-first tiers (Advanced/Expert)
  // land in conversation, with exercises reachable from the chat header.
  if (profile.features.lessons && !profile.features.chatFirst) {
    openLessons();
  } else {
    openChat(null);
  }
}

function handleLogout() {
  signOut();
  currentUser = null;
  currentSession = null;
  document.body.className = "";
  showScreen("login");
}

// Back to the level-picker without signing out — picking a level reloads
// that profile's Drive state fresh, so nothing needs tearing down here.
function goToLevelPicker() {
  document.body.className = "";
  renderProfilePicker();
  showScreen("profile-picker");
}

// Same toggle pattern as the badges panel — the gear button shows/hides a
// small row of rarely-used controls (voice, debug, sign out).
function wireSettingsToggle(btnId, panelId) {
  el(btnId).addEventListener("click", () => {
    const panel = el(panelId);
    panel.hidden = !panel.hidden;
    el(btnId).setAttribute("aria-pressed", String(!panel.hidden));
  });
}

// Silently restore a previous session so a page refresh never forces a manual
// re-login. The access token lives only in memory and dies on reload; here we
// ask Google for a fresh one WITHOUT any popup (prompt:'' succeeds silently as
// long as the Google session is still active and consent was granted before).
// Only an explicit "Sign out" clears the flag, so refresh keeps you in.
async function restoreOrShowLogin() {
  if (!wasSignedIn()) {
    showScreen("login");
    return;
  }
  try {
    currentUser = await signIn(); // silent for a returning user (prompt:'')
    renderProfilePicker();
    showScreen("profile-picker");
  } catch {
    // Session expired or consent revoked — fall back to the normal login.
    showScreen("login");
  }
}

window.addEventListener("DOMContentLoaded", async () => {
  el("login-btn").addEventListener("click", handleLogin);
  el("logout-btn").addEventListener("click", handleLogout);
  el("lesson-logout-btn").addEventListener("click", handleLogout);
  el("view-child-progress-btn").addEventListener("click", () => {
    showScreen("parent-view");
  });
  el("reading-btn").addEventListener("click", openReading);
  el("home-btn").addEventListener("click", goToLevelPicker);
  el("lesson-home-btn").addEventListener("click", goToLevelPicker);

  // Bottom tab bar
  el("nav-home").addEventListener("click", openLessons);
  el("nav-chat").addEventListener("click", () => openChat(null));
  el("nav-reading").addEventListener("click", openReading);
  el("nav-parent").addEventListener("click", () => showScreen("parent-view"));
  wireSettingsToggle("settings-btn", "settings-panel");
  wireSettingsToggle("lesson-settings-btn", "lesson-settings-panel");
  el("parent-view-back-btn").addEventListener("click", () => {
    showScreen("chat");
  });
  initParentView();
  initPwa();

  // Auth needs the async-loaded Google script; wait for it, then init and try
  // a silent restore. Guard the button until the token client exists.
  el("login-btn").disabled = true;
  try {
    await whenGoogleReady();
    initAuth();
    el("login-btn").disabled = false;
    await restoreOrShowLogin();
  } catch (err) {
    console.error("Auth init failed:", err);
    el("login-btn").disabled = false;
    showScreen("login");
  }
});
