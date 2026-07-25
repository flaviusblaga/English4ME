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
import { loadFamilyRewards } from "./rewards.js";
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

  // Grouped like a Netflix profile switcher: grown-ups in a sober row up top,
  // kids in a big colourful grid below. A kid signed in with their own account
  // only ever has their own tile, so a section renders only when it has members.
  const adults = visibleMembers.filter((m) => m.kind === "adult");
  const kids = visibleMembers.filter((m) => m.kind === "kid");

  if (adults.length) {
    const sec = document.createElement("div");
    sec.className = "picker-section";
    sec.appendChild(sectionLabel("adults", "👥", "Adulți"));
    const wrap = document.createElement("div");
    wrap.className = "adult-wrap";
    for (const member of adults) wrap.appendChild(renderAdultCard(member, remembered));
    sec.appendChild(wrap);
    list.appendChild(sec);
  }

  if (kids.length) {
    const sec = document.createElement("div");
    sec.className = "picker-section";
    sec.appendChild(sectionLabel("kids", "🧒", "Copii"));
    const grid = document.createElement("div");
    grid.className = "kids-grid";
    for (const member of kids) grid.appendChild(renderKidCard(member, remembered, levelLabel));
    sec.appendChild(grid);
    list.appendChild(sec);
  }
}

const PICKER_CHEVRON =
  '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m9 18 6-6-6-6"/></svg>';
const PICKER_PLAY = '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';

// Which of the three Socatei a sticker path shows, for the little name badge.
function mascotFromAvatar(src) {
  const m = src && src.match(/(bobo|fizz|sushi)/);
  return m ? m[1] : null;
}

function sectionLabel(kind, emoji, text) {
  const span = document.createElement("span");
  span.className = `grp-label grp-label--${kind}`;
  span.innerHTML = `<span class="grp-emoji">${emoji}</span> ${text}`;
  return span;
}

// The tile is a <button>, so the "change picture" badge can't live inside it
// (button-in-button is invalid). They sit as siblings in this wrapper.
function pickerWrap(card, member) {
  const wrap = document.createElement("div");
  wrap.className = "picker-cardwrap";
  wrap.appendChild(card);
  if (avatarOptionsFor(member).length > 1) {
    const edit = document.createElement("button");
    edit.type = "button";
    edit.className = "profile-avatar-edit";
    edit.textContent = "🎭";
    edit.title = `Schimbă poza lui ${member.name}`;
    edit.setAttribute("aria-label", `Schimbă poza lui ${member.name}`);
    edit.addEventListener("click", (event) => {
      event.stopPropagation();
      openAvatarPicker(member);
    });
    wrap.appendChild(edit);
  }
  return wrap;
}

function renderAdultCard(member, remembered) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "adult-card" + (member.id === remembered ? " is-remembered" : "");
  const avatar = getMemberAvatar(member);
  const av = document.createElement("span");
  av.className = "av";
  if (avatar) {
    const img = document.createElement("img");
    img.src = avatar; img.alt = member.name;
    img.onerror = function () { this.replaceWith(document.createTextNode(member.emoji)); };
    av.appendChild(img);
  } else av.textContent = member.emoji;
  const who = document.createElement("span");
  who.className = "who";
  who.innerHTML = `<strong></strong><span class="sub">Business English</span><span class="role">Admin</span>`;
  who.querySelector("strong").textContent = member.name;
  const go = document.createElement("span");
  go.className = "go"; go.innerHTML = PICKER_CHEVRON;
  card.append(av, who, go);
  card.addEventListener("click", () => handleMemberPicked(member.id));
  return pickerWrap(card, member);
}

function renderKidCard(member, remembered, levelLabel) {
  const card = document.createElement("button");
  card.type = "button";
  const avatar = getMemberAvatar(member);
  const mascot = mascotFromAvatar(avatar);
  card.className = "kid-card" + (mascot ? ` kid-card--${mascot}` : "") + (member.id === remembered ? " is-remembered" : "");

  const stick = document.createElement("span");
  stick.className = "stick";
  if (avatar) {
    const img = document.createElement("img");
    img.src = avatar; img.alt = member.name;
    img.onerror = function () { this.replaceWith(document.createTextNode(member.emoji)); };
    stick.appendChild(img);
  } else stick.textContent = member.emoji;

  const name = document.createElement("span");
  name.className = "kname"; name.textContent = member.name;

  const placed = getMemberPlacement(member.id);
  const lvl = document.createElement("span");
  lvl.className = "klvl";
  lvl.textContent = placed ? (levelLabel[placed] || "Nivel setat") : "Dă testul de nivel";

  const go = document.createElement("span");
  go.className = "kgo"; go.innerHTML = PICKER_PLAY;

  card.append(stick, name);
  if (mascot) {
    const badge = document.createElement("span");
    badge.className = "kid-badge"; badge.textContent = mascot.toUpperCase();
    card.appendChild(badge);
  }
  card.append(lvl, go);
  card.addEventListener("click", () => handleMemberPicked(member.id));
  return pickerWrap(card, member);
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

// The four levels, re-skinned as adventure "modules". Each maps 1:1 onto a
// profile id — same content underneath, playful framing on top. `mascot` is a
// sticker filename, or "cup" for the trophy (Expert has no mascot).
const MODULES = {
  "kids-primar":       { m: "playroom", label: "Playroom with Bobo",   sub: "Joacă-te, învață și vorbește cu Bobo!",        mascot: "bobo" },
  "kids-intermediate": { m: "adventure", label: "Adventure with Fizz",  sub: "Explorează, descoperă și devino curios!",       mascot: "fizz" },
  "kids-advanced":     { m: "storytime", label: "Storytime with Sushi", sub: "Citește, ascultă și imaginează-ți poveștile!",  mascot: "sushi" },
  "kids-expert":       { m: "mastery",   label: "Mastery Cup",          sub: "Provocări avansate pentru a deveni campion!",   mascot: "cup" },
};

function showLevelPicker(member, recommendedProfileId) {
  currentMember = member;
  el("level-picker-title").textContent = `Alege aventura, ${member.name}!`;

  const list = el("level-picker-list");
  list.innerHTML = "";
  list.className = "module-list"; // switch the container off the old card grid

  for (const levelId of KID_LEVELS) {
    const profile = getProfile(levelId);
    const mod = MODULES[levelId];

    const card = document.createElement("button");
    card.type = "button";
    card.className = `mod-card mod-card--${mod.m}`;
    if (levelId === recommendedProfileId) card.classList.add("mod-card--recommended");

    const art = document.createElement("span");
    art.className = "mod-art";
    if (mod.mascot === "cup") {
      art.textContent = "🏆";
      art.classList.add("mod-art--cup");
    } else {
      const img = document.createElement("img");
      img.src = `assets/socatei/${mod.mascot}-sticker.png`;
      img.alt = mod.label;
      img.onerror = function () { this.replaceWith(document.createTextNode("🐾")); };
      art.appendChild(img);
    }

    const txt = document.createElement("span");
    txt.className = "mod-txt";
    const h = document.createElement("strong");
    h.textContent = mod.label;
    if (levelId === recommendedProfileId) {
      const badge = document.createElement("span");
      badge.className = "mod-reco";
      badge.textContent = "⭐ Recomandat";
      h.appendChild(badge);
    }
    const p = document.createElement("span");
    p.className = "mod-sub";
    p.textContent = mod.sub;
    txt.append(h, p);

    const chev = document.createElement("span");
    chev.className = "mod-chev";
    chev.innerHTML = PICKER_CHEVRON;

    card.append(art, txt, chev);
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
