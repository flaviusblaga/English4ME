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
  isSuperAdmin,
} from "./profile.js";
import { fetchMyFamily, adminListFamilies, adminSaveFamily, adminDeleteFamily } from "./worker-client.js";
import { getRememberedProfileId, rememberProfileId } from "./profile-picker.js";
import { loadFamilyRewards } from "./rewards.js";
import { initParentView, setParentChildren } from "./parent-view.js";
import { initPwa } from "./pwa.js";
import { initPlacement } from "./placement.js";

let currentUser = null; // { email, name } — set after sign-in, used once a profile is picked
let currentSession = null; // { accessToken, userEmail, displayName, fileId, state, profile } — reused across lesson<->chat navigation
let currentMember = null; // which family member is active — lets "Levels" return to this kid's level picker
let currentFamilyMembers = []; // members shown in the picker (static OR admin-added via KV)

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

// Fills the child dropdown from the signed-in adult's OWN family (derived from
// the registry, so it works for every family without hardcoding), then shows
// the parent view. A child has several emails; the first is their primary.
function openParentView() {
  // currentFamilyMembers already holds this adult's family (static or KV),
  // resolved by renderProfilePicker — so the child dropdown works for both.
  const kids = currentFamilyMembers
    .filter((m) => m.kind === "kid")
    .map((m) => ({ name: m.name, email: (m.emails || [])[0] }))
    .filter((c) => c.email);
  setParentChildren(kids);
  showScreen("parent-view");
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
    showScreen("profile-picker");
    await renderProfilePicker();
  } catch (err) {
    el("login-error").textContent = `Sign-in failed: ${err.message}`;
    el("login-error").hidden = false;
  } finally {
    el("login-btn").disabled = false;
  }
}

async function renderProfilePicker() {
  const list = el("profile-picker-list");
  list.innerHTML = "";
  const remembered = getRememberedProfileId(); // now stores the last MEMBER id

  const levelLabel = { "kids-primar": "Playroom", "kids-intermediate": "Adventure", "kids-advanced": "Storytime", "kids-expert": "Mastery Cup", "teen": "Teen 14-18" };

  // The static registry is the author's own household (works offline). A family
  // added from the admin menu lives only in KV, so if the static lookup finds
  // nothing, ask the Worker for the caller's own family.
  let visibleMembers = membersForEmail(currentUser ? currentUser.email : null);
  if (visibleMembers.length === 0 && currentUser) {
    try {
      const mine = await fetchMyFamily();
      visibleMembers = mine.members || [];
    } catch {
      /* Worker unreachable — fall through to the empty-state notice below */
    }
  }
  currentFamilyMembers = visibleMembers;

  // Only the super-admin gets the "manage families" entry point.
  renderAdminEntry();

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
  const teens = visibleMembers.filter((m) => m.kind === "teen");
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

  if (teens.length) {
    const sec = document.createElement("div");
    sec.className = "picker-section";
    sec.appendChild(sectionLabel("teens", "🎓", "Adolescenți"));
    const wrap = document.createElement("div");
    wrap.className = "teen-wrap";
    for (const member of teens) wrap.appendChild(renderTeenCard(member, remembered));
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
    // A mascot FACE is square and must be contained; the torso stickers fill.
    if (avatar.includes("-face")) av.classList.add("av--face");
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
  card.addEventListener("click", () => handleMemberPicked(member));
  return pickerWrap(card, member);
}

// Teens (14-18): a modern, mascot-free card — an initial in a gradient tile,
// name, and "Teen · 14-18". Uses the teen accent palette via .teen-card.
function renderTeenCard(member, remembered) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "teen-card" + (member.id === remembered ? " is-remembered" : "");

  const av = document.createElement("span");
  av.className = "teen-av";
  const avatar = getMemberAvatar(member);
  if (avatar) {
    av.classList.add("teen-av--img");
    if (avatar.includes("-face")) av.classList.add("teen-av--face");
    const img = document.createElement("img");
    img.src = avatar; img.alt = member.name;
    img.onerror = function () {
      this.parentElement.classList.remove("teen-av--img");
      this.replaceWith(document.createTextNode((member.name[0] || "🎓").toUpperCase()));
    };
    av.appendChild(img);
  } else {
    av.textContent = (member.name[0] || "🎓").toUpperCase();
  }

  const who = document.createElement("span");
  who.className = "who";
  who.innerHTML = `<strong></strong><span class="sub">Teen · 14-18</span>`;
  who.querySelector("strong").textContent = member.name;

  const go = document.createElement("span");
  go.className = "teen-go";
  go.innerHTML = PICKER_CHEVRON;

  card.append(av, who, go);
  card.addEventListener("click", () => handleMemberPicked(member));
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
  card.addEventListener("click", () => handleMemberPicked(member));
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

// ---- Super-admin family manager ----------------------------------------
// The entry point shows only for a super-admin; the Worker re-checks on every
// call, so this is convenience, not security.
function renderAdminEntry() {
  const btn = el("admin-entry-btn");
  if (!btn) return;
  btn.hidden = !(currentUser && isSuperAdmin(currentUser.email));
}

function closeAdminMenu() {
  el("admin-panel").hidden = true;
}

async function openAdminMenu() {
  el("admin-panel").hidden = false;
  await renderFamilyList();
}

async function renderFamilyList() {
  const body = el("admin-panel-body");
  el("admin-panel-title").textContent = "Familii adăugate";
  body.innerHTML = '<p class="hint">Se încarcă…</p>';

  let families;
  try {
    families = (await adminListFamilies()).families || [];
  } catch (err) {
    body.innerHTML = "";
    const p = document.createElement("p");
    p.className = "hint";
    p.textContent = err.code === "forbidden" ? "Doar administratorul poate gestiona familii." : `Eroare: ${err.message}`;
    body.appendChild(p);
    return;
  }

  body.innerHTML = "";
  const add = document.createElement("button");
  add.type = "button";
  add.className = "btn btn-primary admin-add-btn";
  add.textContent = "➕ Adaugă o familie";
  add.addEventListener("click", () => openFamilyForm(null));
  body.appendChild(add);

  if (!families.length) {
    const p = document.createElement("p");
    p.className = "hint";
    p.textContent = "Nicio familie adăugată încă. (Familia ta principală e în cod, nu apare aici.)";
    body.appendChild(p);
  }

  for (const fam of families) {
    const counts = { adult: 0, teen: 0, kid: 0 };
    for (const m of fam.members) counts[m.kind] = (counts[m.kind] || 0) + 1;

    const row = document.createElement("div");
    row.className = "admin-fam-row";
    const info = document.createElement("div");
    info.className = "admin-fam-info";
    const strong = document.createElement("strong");
    strong.textContent = fam.name;
    const small = document.createElement("small");
    small.textContent = `${counts.adult} adulți · ${counts.teen} adolescenți · ${counts.kid} copii`;
    info.append(strong, small);

    const edit = document.createElement("button");
    edit.type = "button"; edit.className = "btn btn-small";
    edit.textContent = "Editează";
    edit.addEventListener("click", () => openFamilyForm(fam));

    const del = document.createElement("button");
    del.type = "button"; del.className = "btn btn-small admin-del-btn";
    del.textContent = "🗑";
    del.setAttribute("aria-label", `Șterge ${fam.name}`);
    del.addEventListener("click", () => confirmDeleteFamily(fam));

    row.append(info, edit, del);
    body.appendChild(row);
  }
}

// A member line is "email" or "Nume, email" — the name is optional.
function membersToLines(members, kind) {
  return members
    .filter((m) => m.kind === kind)
    .map((m) => {
      const email = (m.emails || []).join(", ");
      const auto = new RegExp("^(Părinte|Adolescent|Copil) \\d+$").test(m.name || "");
      return m.name && !auto ? `${m.name}, ${email}` : email;
    })
    .join("\n");
}

function parseCategory(text, kind) {
  return String(text || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(",").map((s) => s.trim());
      if (parts.length >= 2 && parts[parts.length - 1].includes("@")) {
        return { kind, name: parts.slice(0, -1).join(", "), emails: [parts[parts.length - 1]] };
      }
      return { kind, emails: [parts[parts.length - 1]] };
    });
}

function openFamilyForm(fam) {
  const body = el("admin-panel-body");
  el("admin-panel-title").textContent = fam ? "Editează familia" : "Familie nouă";
  body.innerHTML = "";

  const cats = [
    ["adult", "👥 Adulți / părinți", "un email pe linie (sau: Nume, email)"],
    ["teen", "🎓 Adolescenți (14-18)", "un email pe linie"],
    ["kid", "🧒 Copii", "un email pe linie"],
  ];

  const nameRow = fieldRow("Numele familiei", `<input id="af-name" type="text" maxlength="60" placeholder="ex: Familia Popescu" />`);
  body.appendChild(nameRow);
  el("af-name").value = fam ? fam.name : "";

  for (const [kind, label, hint] of cats) {
    const row = fieldRow(label, `<textarea id="af-${kind}" rows="3" placeholder="${hint}"></textarea>`);
    body.appendChild(row);
    if (fam) el(`af-${kind}`).value = membersToLines(fam.members, kind);
  }

  const opts = document.createElement("div");
  opts.className = "admin-toggles";
  opts.innerHTML = `
    <label><input type="checkbox" id="af-drive" /> Raport de progres în Google Drive-ul copilului</label>
    <label><input type="checkbox" id="af-mirror" /> Salvează conversațiile pe serverul meu (necesită acordul familiei)</label>`;
  body.appendChild(opts);
  el("af-drive").checked = fam ? fam.driveReport !== false : true;
  el("af-mirror").checked = fam ? fam.progressMirror === true : false;

  const status = document.createElement("p");
  status.id = "af-status"; status.className = "hint"; status.hidden = true;
  body.appendChild(status);

  const actions = document.createElement("div");
  actions.className = "admin-form-actions";
  const save = document.createElement("button");
  save.type = "button"; save.className = "btn btn-primary";
  save.textContent = "Salvează";
  save.addEventListener("click", () => saveFamilyForm(fam, save));
  const back = document.createElement("button");
  back.type = "button"; back.className = "btn btn-small";
  back.textContent = "← Înapoi";
  back.addEventListener("click", renderFamilyList);
  actions.append(back, save);
  body.appendChild(actions);
}

function fieldRow(labelText, innerHtml) {
  const row = document.createElement("div");
  row.className = "admin-field";
  const label = document.createElement("label");
  label.textContent = labelText;
  row.appendChild(label);
  const holder = document.createElement("div");
  holder.innerHTML = innerHtml;
  row.appendChild(holder.firstElementChild);
  return row;
}

async function saveFamilyForm(fam, button) {
  const status = el("af-status");
  const members = [
    ...parseCategory(el("af-adult").value, "adult"),
    ...parseCategory(el("af-teen").value, "teen"),
    ...parseCategory(el("af-kid").value, "kid"),
  ];
  const payload = {
    id: fam ? fam.id : undefined,
    name: el("af-name").value,
    driveReport: el("af-drive").checked,
    progressMirror: el("af-mirror").checked,
    members,
  };

  button.disabled = true;
  status.hidden = false;
  status.textContent = "Se salvează…";
  try {
    await adminSaveFamily(payload);
    await renderFamilyList();
  } catch (err) {
    status.textContent = err.message || "Nu s-a putut salva.";
    button.disabled = false;
  }
}

async function confirmDeleteFamily(fam) {
  if (!confirm(`Ștergi familia „${fam.name}"? Membrii ei nu vor mai putea intra în aplicație.`)) return;
  try {
    await adminDeleteFamily(fam.id);
    await renderFamilyList();
  } catch (err) {
    alert(`Nu s-a putut șterge: ${err.message}`);
  }
}

// A member tap: adults go straight to their Business profile; a kid takes the
// placement test the first time (which only RECOMMENDS a level), then always
// lands on the level picker where EVERY level is open — the recommendation is
// just highlighted, never a lock.
function handleMemberPicked(member) {
  // `member` is the object the card closed over (works for static AND
  // admin-added KV members, which getMember could not resolve).
  currentMember = member;
  rememberProfileId(member.id);

  // Adults and teens map to one fixed profile — straight in, no level picker.
  if (member.kind === "adult" || member.kind === "teen") {
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
const LEVEL_LABEL = { "kids-primar": "Playroom", "kids-intermediate": "Adventure", "kids-advanced": "Storytime", "kids-expert": "Mastery Cup", "teen": "Teen 14-18" };

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
  // Drives the whole visual theme, scoped in CSS to [data-usertype="…"]:
  //   adult → premium dark dashboard · teen → modern purple/teal · child → playful.
  const isAdult = profile.id === "business-conversational";
  document.body.dataset.usertype = isAdult ? "adult" : profile.contentTier === "teen" ? "teen" : "child";

  el("current-user-name").textContent = displayName;
  el("current-profile-name").textContent = profile.displayName;
  // Adults get their cartoon avatar in the header; kids keep the plain initial.
  const headerAv = el("header-avatar");
  const headerAvatar = currentMember ? getMemberAvatar(currentMember) : null;
  if (isAdult && headerAvatar) {
    headerAv.textContent = "";
    const img = document.createElement("img");
    img.src = headerAvatar; img.alt = displayName;
    img.onerror = function () { this.parentElement.textContent = (displayName[0] || "?").toUpperCase(); };
    headerAv.appendChild(img);
  } else {
    headerAv.textContent = (displayName[0] || "?").toUpperCase();
  }
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
  document.body.dataset.usertype = "child";
  showScreen("login");
}

// "Alt membru" — back to the family picker (switch who's practicing).
function goToMemberPicker() {
  document.body.className = "";
  document.body.dataset.usertype = "child";
  currentMember = null;
  renderProfilePicker();
  showScreen("profile-picker");
}

// The header "Levels"/home button. For a kid it returns to their level picker
// so they can freely switch level; for an adult (no levels) it goes back to the
// family picker.
function goHome() {
  document.body.className = "";
  document.body.dataset.usertype = "child";
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
  el("admin-entry-btn").addEventListener("click", openAdminMenu);
  el("admin-panel-close").addEventListener("click", closeAdminMenu);
  el("admin-panel").addEventListener("click", (event) => {
    if (event.target === el("admin-panel")) closeAdminMenu();
  });
  // Tapping the dimmed area closes it too — the panel itself must not, or
  // every tap inside the chooser would dismiss it.
  el("avatar-picker").addEventListener("click", (event) => {
    if (event.target === el("avatar-picker")) el("avatar-picker").hidden = true;
  });
  el("lesson-logout-btn").addEventListener("click", handleLogout);
  el("view-child-progress-btn").addEventListener("click", openParentView);
  el("reading-btn").addEventListener("click", openReading);
  el("home-btn").addEventListener("click", goHome);
  el("lesson-home-btn").addEventListener("click", goHome);
  el("level-picker-back-btn").addEventListener("click", goToMemberPicker);
  el("level-picker-retake-btn").addEventListener("click", retakePlacement);

  // Bottom tab bar
  el("nav-home").addEventListener("click", openLessons);
  el("nav-chat").addEventListener("click", () => openChat(null));
  el("nav-reading").addEventListener("click", openReading);
  el("nav-parent").addEventListener("click", openParentView);
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
