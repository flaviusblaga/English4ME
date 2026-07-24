import { initAuth, signIn, signOut, getAccessToken, whenGoogleReady, restoreSession } from "./auth.js";
import { getOrCreateState } from "./drive.js";
import { initChat } from "./chat.js";
import { initLessons } from "./lessons.js";
import { initReading } from "./reading.js";
import {
  getProfile,
  MEMBERS,
  membersForEmail,
  getMember,
  getMemberPlacement,
  clearMemberPlacement,
  getMemberAvatar,
  setMemberAvatar,
  avatarOptionsFor,
} from "./profile.js";
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

  // Adults see their own family; a kid signed in with their own Google account
  // sees only their own tile — never the grown-ups' Business profile. An
  // address that belongs to no family sees no tiles at all.
  const visibleMembers = membersForEmail(currentUser ? currentUser.email : null);

  if (visibleMembers.length === 0) {
    // The Worker refuses this account too, so this is an explanation rather
    // than the thing keeping them out.
    const notice = document.createElement("p");
    notice.className = "profile-picker-empty";
    notice.textContent = currentUser
      ? `Contul ${currentUser.email} nu este înscris în nicio familie din aplicație. Cere-i lui Flavius să te adauge.`
      : "Conectează-te ca să vezi cine învață azi.";
    list.appendChild(notice);
    return;
  }

  for (const member of visibleMembers) {
    // The tile is a button, so the "change picture" control cannot live inside
    // it (a button inside a button is invalid and swallows the click). They are
    // siblings in a wrapper, which is also what positions the little badge.
    const wrap = document.createElement("div");
    wrap.className = "profile-card-wrap";

    const card = document.createElement("button");
    card.type = "button";
    card.className = `profile-card profile-card--${member.kind}`;
    if (member.id === remembered) card.classList.add("profile-card--remembered");

    const icon = document.createElement("span");
    icon.className = "profile-card-icon";
    const avatar = getMemberAvatar(member);
    if (avatar) {
      // A die-cut sticker rather than an emoji: one of the three Socatei for a
      // kid, a photo or a generic grown-up for an adult. Falls back to the
      // emoji badge if the image ever fails to load.
      const img = document.createElement("img");
      img.className = "profile-card-portrait";
      img.src = avatar;
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
    wrap.appendChild(card);

    if (avatarOptionsFor(member).length > 1) {
      const edit = document.createElement("button");
      edit.type = "button";
      edit.className = "profile-avatar-edit";
      edit.textContent = "🎭";
      edit.title = `Schimbă poza lui ${member.name}`;
      edit.setAttribute("aria-label", `Schimbă poza lui ${member.name}`);
      edit.addEventListener("click", (event) => {
        event.stopPropagation(); // never open the member as a side effect
        openAvatarPicker(member);
      });
      wrap.appendChild(edit);
    }

    list.appendChild(wrap);
  }
}

// Lets a child pick which Socatel represents them, and a grown-up pick a
// mum/dad tile. Cosmetic and per-device (same as the placement memory), so
// there is no Drive write and nothing to undo server-side.
function openAvatarPicker(member) {
  const overlay = el("avatar-picker");
  const grid = el("avatar-picker-grid");
  el("avatar-picker-title").textContent =
    member.kind === "kid" ? `Cine te reprezintă, ${member.name}?` : `Alege poza pentru ${member.name}`;
  grid.innerHTML = "";

  const current = getMemberAvatar(member);
  for (const option of avatarOptionsFor(member)) {
    const choice = document.createElement("button");
    choice.type = "button";
    choice.className = "avatar-choice";
    if (option.img === current) choice.classList.add("avatar-choice--active");

    const img = document.createElement("img");
    img.src = option.img;
    img.alt = option.name;
    const name = document.createElement("span");
    name.textContent = option.name;
    choice.append(img, name);

    choice.addEventListener("click", () => {
      setMemberAvatar(member.id, option.id);
      overlay.hidden = true;
      renderProfilePicker();
    });
    grid.appendChild(choice);
  }

  overlay.hidden = false;
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

  // The family's own reward scheme, fetched before any screen is drawn so the
  // child never sees the coded defaults flash and then change. Best-effort by
  // design — loadFamilyRewards swallows its own errors and keeps the defaults.
  await loadFamilyRewards();
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
  el("avatar-picker-close").addEventListener("click", () => {
    el("avatar-picker").hidden = true;
  });
  // Tapping the dimmed area closes it too — the panel itself must not, or
  // every tap inside the chooser would dismiss it.
  el("avatar-picker").addEventListener("click", (event) => {
    if (event.target === el("avatar-picker")) el("avatar-picker").hidden = true;
  });
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
