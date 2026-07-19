import { initAuth, signIn, signOut, getAccessToken, whenGoogleReady, restoreSession } from "./auth.js";
import { getOrCreateState } from "./drive.js";
import { initChat } from "./chat.js";
import { initLessons } from "./lessons.js";
import { initReading } from "./reading.js";
import { getProfile, MEMBERS, membersForEmail, getMember, getMemberPlacement, clearMemberPlacement } from "./profile.js";
import { getRememberedProfileId, rememberProfileId } from "./profile-picker.js";
import { initParentView } from "./parent-view.js";
import { initPwa } from "./pwa.js";
import { initPlacement } from "./placement.js";

let currentUser = null; // { email, name } — set after sign-in, used once a profile is picked
let currentSession = null; // { accessToken, userEmail, displayName, fileId, state, profile } — reused across lesson<->chat navigation
let currentMember = null; // which family member is active — lets "Levels" return to this kid's level picker

function el(id) {
  return document.getElementById(id);
}

function showScreen(name) {
  el("screen-login").hidden = name !== "login";
  el("screen-profile-picker").hidden = name !== "profile-picker";
  el("screen-level-picker").hidden = name !== "level-picker";
  el("screen-placement").hidden = name !== "placement";
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
  const remembered = getRememberedProfileId(); // now stores the last MEMBER id

  const levelLabel = { "kids-primar": "Beginner", "kids-intermediate": "Intermediate", "kids-advanced": "Advanced", "kids-expert": "Expert" };

  // Admins (parents) see every member; a kid signed in with their own Google
  // account only sees the kids' tiles — never the grown-ups' Business profile.
  const visibleMembers = membersForEmail(currentUser ? currentUser.email : null);

  for (const member of visibleMembers) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = `profile-card profile-card--${member.kind}`;
    if (member.id === remembered) card.classList.add("profile-card--remembered");

    const icon = document.createElement("span");
    icon.className = "profile-card-icon";
    if (member.img) {
      // Kids get a round portrait of their mascot (Bobo / Fizz) instead of an
      // emoji. Fall back to the emoji badge if the image ever fails to load.
      const img = document.createElement("img");
      img.className = "profile-card-portrait";
      img.src = member.img;
      img.alt = member.name;
      img.onerror = function () {
        this.replaceWith(document.createTextNode(member.emoji));
      };
      icon.appendChild(img);
    } else {
      icon.textContent = member.emoji;
    }

    const textCol = document.createElement("div");
    textCol.className = "profile-card-text";
    const title = document.createElement("strong");
    title.textContent = member.name;
    const desc = document.createElement("span");
    if (member.kind === "adult") {
      desc.textContent = "Business English · Admin";
    } else {
      const placed = getMemberPlacement(member.id);
      desc.textContent = placed ? `Copil · ${levelLabel[placed] || "nivel setat"}` : "Copil · dă testul de nivel";
    }
    textCol.appendChild(title);
    textCol.appendChild(desc);

    card.appendChild(icon);
    card.appendChild(textCol);
    card.addEventListener("click", () => handleMemberPicked(member.id));
    list.appendChild(card);
  }
}

// A member tap: adults go straight to their Business profile; a kid takes the
// placement test the first time (which only RECOMMENDS a level), then always
// lands on the level picker where EVERY level is open — the recommendation is
// just highlighted, never a lock.
function handleMemberPicked(memberId) {
  const member = getMember(memberId);
  currentMember = member;
  rememberProfileId(memberId);

  if (member.kind === "adult") {
    loadSession(getProfile(member.profileId), member.name);
    return;
  }

  const placedProfileId = getMemberPlacement(member.id);
  if (placedProfileId) {
    showLevelPicker(member, placedProfileId);
  } else {
    initPlacement({
      member,
      onDone: (recommendedProfileId) => showLevelPicker(member, recommendedProfileId),
    });
    showScreen("placement");
  }
}

// Clears the current kid's saved placement and runs the test again from the
// start (reached via the "Reia testul" button on the level picker).
function retakePlacement() {
  if (!currentMember || currentMember.kind !== "kid") return;
  clearMemberPlacement(currentMember.id);
  initPlacement({
    member: currentMember,
    onDone: (recommendedProfileId) => showLevelPicker(currentMember, recommendedProfileId),
  });
  showScreen("placement");
}

// The four kid levels, always all selectable. The test result only decides
// which one wears the "Recomandat" badge.
const KID_LEVELS = ["kids-primar", "kids-intermediate", "kids-advanced", "kids-expert"];
const LEVEL_LABEL = { "kids-primar": "Beginner", "kids-intermediate": "Intermediate", "kids-advanced": "Advanced", "kids-expert": "Expert" };

function showLevelPicker(member, recommendedProfileId) {
  currentMember = member;
  el("level-picker-title").textContent = `Alege nivelul, ${member.name}! 🎯`;

  const list = el("level-picker-list");
  list.innerHTML = "";
  for (const levelId of KID_LEVELS) {
    const profile = getProfile(levelId);
    const card = document.createElement("button");
    card.type = "button";
    card.className = `profile-card profile-card--${profile.level}`;
    if (levelId === recommendedProfileId) card.classList.add("profile-card--remembered");

    const icon = document.createElement("span");
    icon.className = "profile-card-icon";
    icon.textContent = profile.emoji || "📘";

    const textCol = document.createElement("div");
    textCol.className = "profile-card-text";
    const title = document.createElement("strong");
    title.textContent = LEVEL_LABEL[levelId];
    if (levelId === recommendedProfileId) {
      const badge = document.createElement("span");
      badge.className = "level-recommended-badge";
      badge.textContent = " ⭐ Recomandat";
      title.appendChild(badge);
    }
    const desc = document.createElement("span");
    desc.textContent = profile.description;
    textCol.appendChild(title);
    textCol.appendChild(desc);

    card.appendChild(icon);
    card.appendChild(textCol);
    card.addEventListener("click", () => loadSession(profile, member.name));
    list.appendChild(card);
  }

  showScreen("level-picker");
}

// Opens a profile for the current Google account, showing `displayName` (the
// member's name) in the UI. Drive state + parent-progress stay keyed by the
// account email + profileId, so each level keeps its own saved progress.
async function loadSession(profile, displayName) {
  const accessToken = getAccessToken();
  const { fileId, data } = await getOrCreateState(accessToken, {
    profileId: profile.id,
    userEmail: currentUser.email,
    displayName,
    level: profile.level,
    features: profile.features,
  });

  document.body.className = `profile-${profile.id}${profile.features.mascots ? " mascot-theme" : ""}`;

  el("current-user-name").textContent = displayName;
  el("current-profile-name").textContent = profile.displayName;
  el("header-avatar").textContent = (displayName[0] || "?").toUpperCase();
  el("view-child-progress-btn").hidden = !profile.features.canViewChildren;
  el("reading-btn").hidden = !profile.features.reading;

  currentSession = {
    accessToken,
    userEmail: currentUser.email,
    displayName,
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
  currentMember = null;
  document.body.className = "";
  showScreen("login");
}

// "Alt membru" — back to the family picker (switch who's practicing).
function goToMemberPicker() {
  document.body.className = "";
  currentMember = null;
  renderProfilePicker();
  showScreen("profile-picker");
}

// The header "Levels"/home button. For a kid it returns to their level picker
// so they can freely switch level; for an adult (no levels) it goes back to the
// family picker.
function goHome() {
  document.body.className = "";
  if (currentMember && currentMember.kind === "kid") {
    showLevelPicker(currentMember, getMemberPlacement(currentMember.id));
  } else {
    goToMemberPicker();
  }
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

// Restore a previous session so a refresh never forces a manual re-login. The
// cached access token is reused directly — no Google call, no popup — so this
// is instant and reliable. Only an explicit "Sign out", or the token expiring
// (~1h), ends it. Returns true if a session was restored.
function restoreOrShowLogin() {
  const restored = restoreSession();
  if (restored) {
    currentUser = restored;
    renderProfilePicker();
    showScreen("profile-picker");
    return true;
  }
  showScreen("login");
  return false;
}

window.addEventListener("DOMContentLoaded", async () => {
  el("login-btn").addEventListener("click", handleLogin);
  el("logout-btn").addEventListener("click", handleLogout);
  el("lesson-logout-btn").addEventListener("click", handleLogout);
  el("view-child-progress-btn").addEventListener("click", () => {
    showScreen("parent-view");
  });
  el("reading-btn").addEventListener("click", openReading);
  el("home-btn").addEventListener("click", goHome);
  el("lesson-home-btn").addEventListener("click", goHome);
  el("level-picker-back-btn").addEventListener("click", goToMemberPicker);
  el("level-picker-retake-btn").addEventListener("click", retakePlacement);

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

  // Restore instantly from the cached token — no Google needed, so a refresh
  // never bounces you to the login screen while the token is still valid.
  restoreOrShowLogin();

  // Google's script is only needed for a fresh sign-in (first time, or after the
  // token expires). Load it in the background and keep the button disabled until
  // the token client exists, so a first-time click can't fire too early.
  el("login-btn").disabled = true;
  whenGoogleReady()
    .then(() => {
      initAuth();
      el("login-btn").disabled = false;
    })
    .catch((err) => {
      console.error("Auth init failed:", err);
      el("login-btn").disabled = false;
    });
});
