import { initAuth, signIn, signOut, getAccessToken } from "./auth.js";
import { getOrCreateState } from "./drive.js";
import { initChat } from "./chat.js";
import { initLessons } from "./lessons.js";
import { PROFILES, getProfile } from "./profile.js";
import { getRememberedProfileId, rememberProfileId } from "./profile-picker.js";
import { initParentView } from "./parent-view.js";

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
  el("screen-parent-view").hidden = name !== "parent-view";
}

function openChat(lessonWordList) {
  initChat({ ...currentSession, lessonWordList, onBackToLessons: openLessons });
  showScreen("chat");
}

function openLessons() {
  initLessons({ ...currentSession, onJustChat: openChat, onChatAboutIt: openChat });
  showScreen("lesson");
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
    card.className = "profile-card";
    if (profile.id === remembered) card.classList.add("profile-card--remembered");

    const title = document.createElement("strong");
    title.textContent = profile.displayName;
    const desc = document.createElement("span");
    desc.textContent = profile.description;

    card.appendChild(title);
    card.appendChild(desc);
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

  document.body.className = `profile-${profile.id}`;

  el("current-user-name").textContent = currentUser.name;
  el("current-profile-name").textContent = profile.displayName;
  el("view-child-progress-btn").hidden = !profile.features.canViewChildren;

  currentSession = {
    accessToken,
    userEmail: currentUser.email,
    displayName: currentUser.name,
    fileId,
    state: data,
    profile,
  };

  if (profile.features.lessons) {
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

window.addEventListener("DOMContentLoaded", () => {
  initAuth();
  el("login-btn").addEventListener("click", handleLogin);
  el("logout-btn").addEventListener("click", handleLogout);
  el("lesson-logout-btn").addEventListener("click", handleLogout);
  el("view-child-progress-btn").addEventListener("click", () => {
    showScreen("parent-view");
  });
  el("parent-view-back-btn").addEventListener("click", () => {
    showScreen("chat");
  });
  initParentView();
  showScreen("login");
});
