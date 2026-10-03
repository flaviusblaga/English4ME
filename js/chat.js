import { sendChatMessage, syncProgress } from "./worker-client.js";
import { saveState } from "./drive.js";
import { SCENARIOS } from "./scenarios-client.js";
import { PHRASEBANK } from "./phrasebank.data.js";
import { initDocumentsUi, refreshDocumentsSummary } from "./documents-ui.js";
import { BADGES, updateGamificationAfterTurn, badgeLabel } from "./gamification.js";
import { gamificationWithRewards } from "./rewards.js";
import { iconSvg } from "./icons.js";
import { t } from "./i18n.js";
import {
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  isTtsMuted,
  setTtsMuted,
  getVoiceGenderPreference,
  setVoiceGenderPreference,
  initVoiceInput,
  startListening,
  stopListening,
  speak,
  speakLines,
} from "./voice.js";

const ROLLING_WINDOW_SIZE = 10; // messages (not turns) sent to the Worker each request
const MAX_STORED_TURNS = 20; // messages kept in Drive before older ones are dropped

// The three Socatei. Exported so js/lessons.js draws the same faces without a
// second copy of the list drifting out of sync.
export const MASCOT_NAMES = ["Bobo", "Fizz", "Sushi"];

const MASCOT_AVATARS = {
  Bobo: { emoji: "🦫", img: "assets/socatei/bobo-face.png" },
  Fizz: { emoji: "🐿️", img: "assets/socatei/fizz-face.png" },
  Sushi: { emoji: "🐱", img: "assets/socatei/sushi-face.png" }, // the only cat among the two weasels
};

// Which Socatei the child wants to see/hear talk. A reply is always two lines,
// now drawn from three characters, so the preference is sent to the Worker too
// (it pins the chosen one into every reply) AND applied here as a render/speak
// filter — switching mid-conversation stays instant and loses no history.
const MASCOT_PREFERENCE_KEY = "engleza-familie-mascot-preference"; // a name, or "both" for all three

// Exported: js/lessons.js reuses the same preference so choosing a mascot in
// either screen (chat or lessons) stays consistent across both.
// "both" is kept as the all-of-them value rather than renamed to "all" so that
// preferences already saved in a child's browser keep working.
export function getMascotPreference() {
  return localStorage.getItem(MASCOT_PREFERENCE_KEY) || "both";
}

export function setMascotPreference(pref) {
  localStorage.setItem(MASCOT_PREFERENCE_KEY, pref);
}

// Kid-appropriate TTS tuning — a single playful voice via pitch/rate, not the
// adult gender dropdown (which frames a professional roleplay counterpart,
// not a cartoon mascot). Exported: js/lessons.js reuses the same tuning so
// the lesson screens sound consistent with free-chat.
export const KIDS_VOICE_OPTIONS = { pitch: 1.35, rate: 1.05 };

// Per-mascot voices, in the spirit of the hyperactive possum-brothers energy
// the characters are inspired by: Bobo is squeaky-high and fast (the
// impulsive one), Fizz is lower and a touch slower (the nervous one). The
// Web Speech API has no true character voices, so pitch/rate contrast on the
// same base voice is how the two stay audibly distinct. Exported for
// js/lessons.js so exercises use the same two voices.
// Bobo capped at 1.45 — pitches beyond ~1.5 make Windows' local SAPI voices
// stutter and sound broken (reported on the family laptop), and 1.45 vs 1.15
// keeps the two audibly distinct.
// Sushi sits between the two in pitch but is the fastest talker — she's the
// theatrical one, and rate is what keeps her distinct from Bobo without going
// near the 1.5 ceiling that breaks Windows' local SAPI voices.
export const MASCOT_VOICES = {
  Bobo: { pitch: 1.45, rate: 1.1 },
  Fizz: { pitch: 1.15, rate: 0.98 },
  Sushi: { pitch: 1.25, rate: 1.2 },
};

function parseMascotLines(text) {
  return text
    .split("\n")
    .map((line) => line.match(/^(Bobo|Fizz|Sushi):\s*(.*)$/))
    .filter(Boolean)
    .map((match) => ({ name: match[1], line: match[2] }));
}

// The two lines in a reply come from a cast of three, so filtering to one name
// can legitimately match nothing. Falling back to the whole reply means the
// child sees SOMETHING rather than an empty bubble — a silent reply would look
// like the app broke.
function visibleMascotLines(parsed) {
  const preference = getMascotPreference();
  if (preference === "both") return parsed;
  const picked = parsed.filter((p) => p.name === preference);
  return picked.length ? picked : parsed;
}

let session = null; // { accessToken, userEmail, displayName, fileId, state, profile, lessonWordList }
let currentScenarioId = null; // null = free conversation
let listenersInitialized = false; // guards one-time listener attachment across repeated initChat calls

// Adult "Writing" mode (Business English only). A stateless, one-shot editor:
// the learner pastes a draft email/message, we send ONE standalone request to
// the same Worker /chat endpoint (no scenario, no conversation history) framed
// as an editing task, and show the polished version plus a few notes. It is
// deliberately independent of role-play history — switching modes never mixes
// the two — so no Worker change is needed to ship it.
let writingMode = false;
let defaultChatPlaceholder = ""; // captured from the i18n'd input so toggling back restores it

// Adult toolkit: exactly ONE panel is open at a time (phrases / progress /
// documents), never several stacked over the chat. On desktop it shows in the
// side rail (header buttons act as tabs); on phones it opens as an overlay with
// a close button. `null` = nothing open.
let activePanel = null;
const ADULT_PANELS = { phrases: "phrasebank-panel", progress: "progress-pro-panel", documents: "scenario-documents" };
const ADULT_TAB_BTNS = { phrases: "phrasebank-btn", progress: "progress-pro-btn", documents: "documents-btn" };

// Keep this as a single user message (the Worker takes no system override from
// the client). Explicit output shape so the reply is consistent and copyable.
const WRITING_EDITOR_PROMPT = (draft) =>
  `You are a professional Business English editor. Improve the text below for a work context: fix grammar and spelling, make the tone professional and natural, and keep it concise. Do not invent facts or add content the writer did not imply.\n\nReply in exactly this plain-text format, with no markdown symbols:\n\nPOLISHED VERSION\n<the improved text, ready to paste>\n\nNOTES\n- <one short note on a key change>\n- <another>\n- <another, only if useful>\n\nText to improve:\n"""\n${draft}\n"""`;

// Debrief: a coaching review of the learner's English across a finished
// role-play. Sent the same stateless way — the transcript is embedded in one
// message; the Worker needs no awareness of the feature.
const DEBRIEF_PROMPT = (transcript) =>
  `You are a supportive Business English coach. Below is a transcript of a role-play practice conversation between the learner ("You") and a practice partner ("Partner"). Assess ONLY the learner's English — the "You" lines — using the Partner lines just as context. This is a coaching scorecard, not a chat: be concise and specific.\n\nScore each 1-5 (5 = excellent) based only on this conversation. Reply in exactly this plain-text format, with no markdown symbols:\n\nSCORECARD\nFluency: X/5 — <4-6 word reason>\nProfessionalism: X/5 — <4-6 word reason>\nVocabulary: X/5 — <4-6 word reason>\n\nBETTER PHRASINGS\n- <something they said> -> <a more native, professional version>\n- <another> -> <better>\n- <another> -> <better>\n\nONE THING TO WORK ON\n- <a single, concrete focus for next time>\n\nTranscript:\n"""\n${transcript}\n"""`;

function el(id) {
  return document.getElementById(id);
}

// Null-safe visibility toggle. A stale cached index.html (old HTML + newer JS)
// must never crash the whole app by setting `.hidden` on a missing element —
// that was the "Cannot set properties of null" failure. Everything that shows/
// hides an optional adult control goes through this.
function elHidden(id, hidden) {
  const e = el(id);
  if (e) e.hidden = hidden;
}

// Open one adult tool panel (or close it). Guarantees a single panel at a time:
// opening one hides the others, tapping the active one again closes it. Keeps
// the header tab buttons and the mobile overlay/close button in sync.
function setActivePanel(name) {
  activePanel = activePanel === name ? null : name;

  if (activePanel === "progress") renderProgressPro(); // refresh live numbers on open

  for (const [key, panelId] of Object.entries(ADULT_PANELS)) {
    elHidden(panelId, key !== activePanel);
  }
  // The documents manager's own upload sub-panel: open it with the panel, so
  // "Documents" lands straight on the uploader rather than a bare summary.
  if (activePanel === "documents") {
    const dp = el("scenario-documents-panel");
    const manage = el("scenario-documents-manage-btn");
    if (dp && dp.hidden && manage) manage.click();
  }

  for (const [key, btnId] of Object.entries(ADULT_TAB_BTNS)) {
    const b = el(btnId);
    if (b) b.classList.toggle("tool-tab--active", key === activePanel);
  }

  const rail = el("adult-rail");
  if (rail) rail.classList.toggle("adult-rail--open", activePanel !== null);
  elHidden("rail-close", activePanel === null);

  // Always collapse the mobile Tools menu after a choice.
  elHidden("tools-menu", true);
  const tb = el("tools-btn");
  if (tb) tb.setAttribute("aria-expanded", "false");
}

export function initChat({ accessToken, userEmail, displayName, fileId, state, profile, lessonWordList, onBackToLessons }) {
  session = { accessToken, userEmail, displayName, fileId, state, profile, lessonWordList: lessonWordList || null };

  rerenderChatLog();
  renderBudgetIndicator();

  // Attached once per page lifetime — chat.js/lessons.js now navigate back
  // and forth (initChat can be called more than once per session), and
  // inline-arrow listeners would otherwise accumulate duplicate handlers on
  // every re-entry. All handlers read the live `session`/`profile` closure
  // variables, so re-attaching on later calls is unnecessary, not just safe.
  if (!listenersInitialized) {
    listenersInitialized = true;

    defaultChatPlaceholder = el("chat-input").placeholder;

    el("chat-send").addEventListener("click", handleSend);
    el("chat-input").addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    });
    el("chat-mode-roleplay").addEventListener("click", () => setWritingMode(false));
    el("chat-mode-writing").addEventListener("click", () => setWritingMode(true));
    el("debrief-btn").addEventListener("click", handleDebrief);
    renderPhrasebank();
    // Header tab buttons (desktop) and the mobile Tools items all open the SAME
    // single panel through setActivePanel — one open at a time, no overlap.
    el("phrasebank-btn").addEventListener("click", () => setActivePanel("phrases"));
    el("progress-pro-btn").addEventListener("click", () => setActivePanel("progress"));
    el("documents-btn").addEventListener("click", () => setActivePanel("documents"));
    el("tools-phrases").addEventListener("click", () => setActivePanel("phrases"));
    el("tools-progress").addEventListener("click", () => setActivePanel("progress"));
    el("tools-documents").addEventListener("click", () => setActivePanel("documents"));
    el("tools-debrief").addEventListener("click", () => {
      elHidden("tools-menu", true);
      handleDebrief();
    });
    // The overlay close button (mobile) closes whatever panel is open.
    el("rail-close").addEventListener("click", () => { if (activePanel) setActivePanel(activePanel); });

    // Mobile "Tools" drop-down toggle.
    el("tools-btn").addEventListener("click", () => {
      const m = el("tools-menu");
      m.hidden = !m.hidden;
      el("tools-btn").setAttribute("aria-expanded", String(!m.hidden));
    });
    el("debug-data-btn").addEventListener("click", () => {
      const output = el("debug-data-output");
      if (!output.hidden) {
        output.hidden = true;
        return;
      }
      output.textContent = JSON.stringify(session.state, null, 2);
      output.hidden = false;
    });
    el("gamification-badges-btn").addEventListener("click", () => {
      const panel = el("gamification-badges-panel");
      panel.hidden = !panel.hidden;
    });
    initVoiceUi();

    for (const pref of [...MASCOT_NAMES, "both"]) {
      el(`mascot-select-${pref.toLowerCase()}`).addEventListener("click", () => {
        setMascotPreference(pref);
        updateMascotSelectUi();
        rerenderChatLog();
      });
    }
  }

  el("back-to-lessons-btn").hidden = !profile.features.lessons;
  // Chat-first tiers frame the same button as the way INTO exercises rather
  // than the way back to a lesson menu they started from.
  el("back-to-lessons-btn").innerHTML = profile.features.chatFirst
    ? `${iconSvg("notebook-pen")} ${t("header.exercises")}`
    : `${iconSvg("notebook-pen")} ${t("header.lessons")}`;
  el("back-to-lessons-btn").onclick = () => {
    if (onBackToLessons) onBackToLessons();
  };

  // Profile-dependent UI that must be recomputed on every call (not just the
  // first) — a user can sign out and pick a different profile without a full
  // page reload, so this can't live behind the one-time listener guard above.
  el("mascot-select-bar").hidden = !profile.features.mascots;
  if (profile.features.mascots) updateMascotSelectUi();
  el("voice-gender-select").hidden = !isSpeechSynthesisSupported() || profile.features.mascots;
  // Kids don't need the technical debug button cluttering their header —
  // the parent still has it on their own (adult) profile.
  el("debug-data-btn").hidden = profile.features.mascots;

  if (profile.features.scenarios) {
    elHidden("chat-mode-toggle", false);
    elHidden("phrasebank-btn", false); // desktop tab; hidden on mobile via CSS
    elHidden("progress-pro-btn", false);
    elHidden("tools-btn", false); // mobile: collapses the tool buttons
    elHidden("scenario-select-wrap", false);
    initScenarioSelect();
    // Always start a (re)entered chat in role-play mode, never stuck in a
    // leftover writing session from a previous visit. (setWritingMode also
    // sets the Debrief button's visibility.)
    setWritingMode(false);
    renderProgressPro();
    // One panel at a time. On desktop the rail shows Phrases by default (so it
    // isn't empty); on phones nothing opens until the member taps a tool.
    activePanel = null;
    const wideLayout = window.matchMedia && window.matchMedia("(min-width: 900px)").matches;
    setActivePanel(wideLayout ? "phrases" : null);
  } else {
    elHidden("chat-mode-toggle", true);
    elHidden("scenario-select-wrap", true);
    elHidden("debrief-btn", true);
    elHidden("phrasebank-btn", true);
    elHidden("phrasebank-panel", true);
    elHidden("progress-pro-btn", true);
    elHidden("progress-pro-panel", true);
    elHidden("documents-btn", true);
    elHidden("tools-btn", true);
    elHidden("tools-menu", true);
    elHidden("rail-close", true);
    activePanel = null;
    currentScenarioId = null;
    writingMode = false;
  }

  if (profile.features.documents) {
    // The documents panel's visibility is owned by setActivePanel (one panel at
    // a time) — only the tab button is shown here.
    elHidden("documents-btn", false);
    initDocumentsUi({
      userEmail: session.userEmail,
      getScenarioId: () => currentScenarioId,
      getScenarioLabel: () =>
        currentScenarioId ? SCENARIOS.find((s) => s.id === currentScenarioId).label : "Free conversation",
      onSaved: (scenarioId, entry) => {
        session.state.documentContext = session.state.documentContext || {};
        session.state.documentContext[scenarioId] = entry;
        saveState(session.accessToken, session.fileId, session.state);
        refreshDocumentsSummary(entry);
        appendSystemNotice(`Documents saved for ${SCENARIOS.find((s) => s.id === scenarioId).label}: ${entry.files.map((f) => f.filename).join(", ")}`);
      },
    });
    refreshDocumentsSummary((session.state.documentContext || {})[currentScenarioId]);
  } else {
    elHidden("scenario-documents", true);
    elHidden("documents-btn", true);
  }

  // Adult (Business) menu tidy-up: the parent-only "View child's progress" is
  // already a bottom-nav tab ("Părinte"), and "Levels" is kid wording — relabel
  // the exit to "Profiles" so the adult header reads as a pro tool, not a
  // kid's. Scoped to the adult profile; kids/teen keep their own labels.
  if (profile.features.scenarios) {
    const hb = el("home-btn");
    if (hb) hb.innerHTML = `${iconSvg("home")} Profiles`;
  }

  if (profile.features.gamification) {
    el("gamification-bar").hidden = false;
    el("gamification-badges-btn").hidden = false;
    renderGamificationBar();
    renderBadgesPanel();
  } else {
    el("gamification-bar").hidden = true;
    el("gamification-badges-btn").hidden = true;
    el("gamification-badges-panel").hidden = true;
  }
}

function initScenarioSelect() {
  const select = el("scenario-select");
  select.innerHTML = '<option value="">Free conversation</option>';
  // Group scenarios under their category as <optgroup> headers, in first-seen
  // order, so the picker reads as a library of professional moments.
  const byCategory = new Map();
  for (const scenario of SCENARIOS) {
    const cat = scenario.category || "Other";
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat).push(scenario);
  }
  for (const [category, list] of byCategory) {
    const group = document.createElement("optgroup");
    group.label = category;
    for (const scenario of list) {
      const opt = document.createElement("option");
      opt.value = scenario.id;
      opt.textContent = scenario.label;
      group.appendChild(opt);
    }
    select.appendChild(group);
  }
  select.value = session.state.lastScenarioId || "";
  currentScenarioId = select.value || null;

  // Assign (not addEventListener) so re-entering the chat doesn't stack a new
  // handler each time — that fired handleScenarioChange several times per change.
  select.onchange = () => handleScenarioChange(select.value || null);
}

function handleScenarioChange(scenarioId) {
  currentScenarioId = scenarioId;

  // New role-play context — clear the visible log and the rolling-window
  // source so old turns don't bleed into the new scene's framing.
  el("chat-log").innerHTML = "";
  session.state.conversation.recentTurns = [];

  // Deliberately NOT touched: conversation.summary / progress — those track
  // the learner's overall recurring mistakes across all practice, not any
  // one scenario.
  session.state.lastScenarioId = scenarioId;
  saveState(session.accessToken, session.fileId, session.state);

  const label = scenarioId
    ? SCENARIOS.find((s) => s.id === scenarioId).label
    : "Free conversation";
  appendSystemNotice(`Starting: ${label}`);

  refreshDocumentsSummary((session.state.documentContext || {})[scenarioId]);
}

function initVoiceUi() {
  const micBtn = el("mic-btn");
  const ttsBtn = el("tts-mute-btn");

  if (isSpeechRecognitionSupported()) {
    micBtn.hidden = false;
    initVoiceInput({
      onInterim: (text) => {
        el("chat-input").value = text;
      },
      onFinal: (text) => {
        el("chat-input").value = text;
      },
      onEnd: () => {
        micBtn.classList.remove("mic-recording");
      },
    });
    micBtn.addEventListener("click", () => {
      if (micBtn.classList.contains("mic-recording")) {
        stopListening();
      } else {
        micBtn.classList.add("mic-recording");
        startListening();
      }
    });
  } else {
    micBtn.hidden = true;
  }

  const genderSelect = el("voice-gender-select");

  if (isSpeechSynthesisSupported()) {
    ttsBtn.hidden = false;
    updateTtsButtonLabel();
    ttsBtn.addEventListener("click", () => {
      setTtsMuted(!isTtsMuted());
      updateTtsButtonLabel();
    });

    genderSelect.hidden = false;
    genderSelect.value = getVoiceGenderPreference();
    genderSelect.addEventListener("change", () => {
      setVoiceGenderPreference(genderSelect.value);
    });
  } else {
    ttsBtn.hidden = true;
    genderSelect.hidden = true;
  }
}

function updateTtsButtonLabel() {
  const muted = isTtsMuted();
  el("tts-mute-btn").innerHTML = muted ? `${iconSvg("volume-x")} ${t("settings.voiceOff")}` : `${iconSvg("volume-2")} ${t("settings.voiceOn")}`;
  el("tts-mute-btn").setAttribute("aria-pressed", String(muted));
}

function updateMascotSelectUi() {
  const preference = getMascotPreference();
  for (const pref of [...MASCOT_NAMES, "both"]) {
    el(`mascot-select-${pref.toLowerCase()}`).classList.toggle("mascot-select-btn--active", pref === preference);
  }
}

// Re-renders the whole log from stored history so a mascot-preference change
// applies immediately to past turns too, not just future replies.
function rerenderChatLog() {
  el("chat-log").innerHTML = "";
  for (const turn of session.state.conversation.recentTurns) {
    appendMessageToLog(turn.role, turn.text, session.profile);
  }
}

function appendMessageToLog(role, text, profile) {
  const log = el("chat-log");
  const bubble = document.createElement("div");
  bubble.className = `chat-bubble chat-bubble--${role}`;

  if (role === "assistant" && profile && profile.features.mascots) {
    bubble.appendChild(renderMascotLines(text));
  } else {
    bubble.textContent = text;
  }

  log.appendChild(bubble);
  log.scrollTop = log.scrollHeight;
}

function renderMascotLines(text) {
  const wrap = document.createElement("div");
  const parsed = parseMascotLines(text);
  const visible = visibleMascotLines(parsed);

  for (const { name, line } of visible) {
    const avatar = MASCOT_AVATARS[name];
    const row = document.createElement("div");
    row.className = "mascot-line";

    const img = document.createElement("img");
    img.src = avatar.img;
    img.alt = name;
    img.className = "mascot-avatar";
    img.onerror = function () {
      // Real PNG missing/broken — fall back to a big emoji, never a
      // broken-image icon.
      const fallback = document.createElement("span");
      fallback.className = "mascot-avatar mascot-avatar--emoji-fallback";
      fallback.textContent = avatar.emoji;
      this.replaceWith(fallback);
    };

    const bubble = document.createElement("div");
    bubble.className = "mascot-text";
    const nameSpan = document.createElement("span");
    nameSpan.className = "mascot-name";
    nameSpan.textContent = `${name}:`;
    bubble.appendChild(nameSpan);
    bubble.appendChild(document.createTextNode(` ${line}`));

    row.appendChild(img);
    row.appendChild(bubble);
    wrap.appendChild(row);
  }

  if (parsed.length === 0) {
    wrap.textContent = text; // graceful fallback if the format wasn't followed
  }
  return wrap;
}

// TTS segments for a mascot reply — only the selected mascot's line(s),
// without the "Name:" prefix, each line spoken in that mascot's own voice
// (Bobo squeaky-fast, Fizz lower-calmer) so the two are audibly different.
function buildSpokenSegments(text) {
  const parsed = parseMascotLines(text);
  if (parsed.length === 0) return [{ text, ...KIDS_VOICE_OPTIONS }];
  return visibleMascotLines(parsed).map((p) => ({ text: p.line, ...MASCOT_VOICES[p.name] }));
}

function appendSystemNotice(text) {
  const log = el("chat-log");
  const notice = document.createElement("div");
  notice.className = "chat-notice";
  notice.textContent = text;
  log.appendChild(notice);
  log.scrollTop = log.scrollHeight;
}

function renderBudgetIndicator() {
  const { estimatedCostUsd, budgetUsd } = session.state.usageSnapshot;
  el("budget-indicator").textContent = `Usage this month: $${estimatedCostUsd.toFixed(2)} / $${budgetUsd.toFixed(2)}`;

  // The adult dashboard's usage card (same numbers, richer presentation). The
  // card is CSS-hidden for kids, so populating it is harmless there.
  const card = el("usage-card");
  if (card) {
    const pct = budgetUsd > 0 ? Math.min(100, Math.round((estimatedCostUsd / budgetUsd) * 100)) : 0;
    el("usage-spent").textContent = `$${estimatedCostUsd.toFixed(2)}`;
    el("usage-limit").textContent = `/ $${budgetUsd.toFixed(2)}`;
    el("usage-pct").textContent = `${pct}%`;
    el("usage-fill").style.width = `${pct}%`;
    el("usage-ring").style.setProperty("--pct", pct);
  }
}

function renderGamificationBar() {
  const g = session.state.gamification;
  el("gamification-points").innerHTML = `${iconSvg("star")} ${g.points}`;
  // Cumulative days practised (never resets) — gentle, not a breakable streak.
  el("gamification-streak").innerHTML = `${iconSvg("flame")} ${g.totalActiveDays || 0}`;
}

function renderBadgesPanel() {
  const panel = el("gamification-badges-panel");
  panel.innerHTML = "";
  const unlocked = new Set(session.state.gamification.badges);
  for (const badge of BADGES) {
    const chip = document.createElement("span");
    chip.className = `gamification-badge-chip${unlocked.has(badge.id) ? "" : " gamification-badge-chip--locked"}`;
    chip.textContent = `${badge.emoji} ${badgeLabel(badge.id)}`;
    panel.appendChild(chip);
  }
}

// Phrasebank — static, curated Business English phrases grouped by situation.
// Built once (content never changes at runtime); each group is a collapsible
// header and each phrase a copy-to-clipboard row.
function renderPhrasebank() {
  const panel = el("phrasebank-panel");
  panel.innerHTML = "";
  for (const group of PHRASEBANK) {
    const section = document.createElement("div");
    section.className = "phrasebank-group";

    const head = document.createElement("button");
    head.type = "button";
    head.className = "phrasebank-group-head";
    head.innerHTML = `<span>${group.category}</span> ${iconSvg("chevron-down")}`;

    const list = document.createElement("div");
    list.className = "phrasebank-list";
    list.hidden = true;

    head.addEventListener("click", () => {
      list.hidden = !list.hidden;
      section.classList.toggle("phrasebank-group--open", !list.hidden);
    });

    for (const phrase of group.phrases) {
      const row = document.createElement("button");
      row.type = "button";
      row.className = "phrasebank-phrase";
      row.textContent = phrase;
      row.addEventListener("click", () => copyPhrase(phrase, row));
      list.appendChild(row);
    }

    section.appendChild(head);
    section.appendChild(list);
    panel.appendChild(section);
  }
}

// CEFR is the Common European Framework self-rating (A1–C2). The app can't
// objectively assess a CEFR band, so it's an explicit SELF-assessment the member
// picks — labelled as such, never presented as a measured score.
const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

// "Progress" — a professional progress panel for the adult (Business) profile.
// Real counters only (nothing estimated), plus a self-declared CEFR level. No
// streak/minutes figures because the app doesn't track session time.
function renderProgressPro() {
  const panel = el("progress-pro-panel");
  const p = session.state.progress || {};
  const turns = p.totalTurns || 0;
  const practiced = new Set(p.scenariosPracticed || []);
  const scenariosTotal = SCENARIOS.length;
  const activeDays = p.activeDays || [];
  const snap = session.state.usageSnapshot || {};
  const spent = snap.estimatedCostUsd || 0;
  const budget = snap.budgetUsd || 10;
  const cefr = p.cefrLevel || "";
  const since = session.state.createdAt
    ? new Date(session.state.createdAt).toLocaleDateString(undefined, { month: "short", year: "numeric" })
    : "—";

  // Sessions this week = distinct active days within the last 7 calendar days.
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 6);
  const weekKey = weekAgo.toISOString().slice(0, 10);
  const weekSessions = activeDays.filter((d) => d >= weekKey).length;

  const tile = (value, label) =>
    `<div class="progress-pro-tile"><span class="progress-pro-value">${value}</span><span class="progress-pro-label">${label}</span></div>`;

  // Competency snapshot — scenario coverage grouped by professional area, so it
  // reads as which competencies the member has actually practised.
  const byCategory = new Map();
  for (const s of SCENARIOS) {
    const c = byCategory.get(s.category) || { done: 0, total: 0 };
    c.total += 1;
    if (practiced.has(s.id)) c.done += 1;
    byCategory.set(s.category, c);
  }
  const competency = [...byCategory.entries()]
    .map(([cat, c]) => {
      const pct = c.total ? Math.round((c.done / c.total) * 100) : 0;
      return (
        `<li class="progress-pro-comp"><span class="progress-pro-comp-name">${cat}</span>` +
        `<span class="progress-pro-comp-count">${c.done}/${c.total}</span>` +
        `<span class="progress-pro-comp-bar"><i style="width:${pct}%"></i></span></li>`
      );
    })
    .join("");

  const cefrOptions = [`<option value="">—</option>`]
    .concat(CEFR_LEVELS.map((l) => `<option value="${l}"${l === cefr ? " selected" : ""}>${l}</option>`))
    .join("");

  panel.innerHTML = `
    <div class="progress-pro-cefr">
      <label for="progress-cefr-select">Your level</label>
      <select id="progress-cefr-select">${cefrOptions}</select>
      <span class="progress-pro-cefr-note">CEFR · self-assessed</span>
    </div>
    <div class="progress-pro-grid">
      ${tile(turns, "Practice turns")}
      ${tile(`${practiced.size}/${scenariosTotal}`, "Scenarios practised")}
      ${tile(weekSessions, weekSessions === 1 ? "Session this week" : "Sessions this week")}
      ${tile(`$${spent.toFixed(2)}`, `used of $${budget.toFixed(0)} this month`)}
    </div>
    <p class="progress-pro-since">Practising since ${since} · ${activeDays.length} ${activeDays.length === 1 ? "day" : "days"} total</p>
    <h4 class="progress-pro-head">Competency snapshot</h4>
    <ul class="progress-pro-competency">${competency}</ul>`;

  // Persist the self-assessed CEFR level when the member sets it.
  const cefrSelect = el("progress-cefr-select");
  if (cefrSelect) {
    cefrSelect.addEventListener("change", () => {
      session.state.progress = session.state.progress || {};
      session.state.progress.cefrLevel = cefrSelect.value || null;
      saveState(session.accessToken, session.fileId, session.state);
    });
  }
}

function copyPhrase(text, rowEl) {
  const flash = () => {
    const prev = rowEl.textContent;
    rowEl.classList.add("phrasebank-phrase--copied");
    rowEl.textContent = "Copied ✓";
    setTimeout(() => {
      rowEl.textContent = prev;
      rowEl.classList.remove("phrasebank-phrase--copied");
    }, 900);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(flash).catch(() => fallbackCopy(text, flash));
  } else {
    fallbackCopy(text, flash);
  }
}

// execCommand fallback for insecure contexts / older WebViews where the async
// Clipboard API is unavailable or blocked.
function fallbackCopy(text, onDone) {
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    onDone();
  } catch { /* clipboard blocked; fail silently rather than disrupt the chat */ }
}

function showBanner(message) {
  const banner = el("budget-warning");
  banner.textContent = message;
  banner.hidden = false;
}

function hideBanner() {
  el("budget-warning").hidden = true;
}

export function todayLocalDateString() {
  const now = new Date();
  if (window.__debugForceYesterday) {
    now.setDate(now.getDate() - 1); // manual test hook — see plan verification step C.3
  }
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

// Mirrors every turn into a same-day accumulator that is NOT trimmed by
// MAX_STORED_TURNS, so a busy day's early turns survive long enough to reach
// the parent-progress sync — resets only when the calendar day changes.
// Exported: js/lessons.js also calls this to log lesson activity into the
// same daily-turns mechanism the parent dashboard reads.
export function recordTurnForParentSync(state, turn) {
  if (!state.parentSync) return;
  const today = todayLocalDateString();
  if (state.parentSync.todayDate !== today) {
    state.parentSync.todayDate = today;
    state.parentSync.todayTurns = [];
  }
  state.parentSync.todayTurns.push(turn);
}

// Toggle between role-play (the default conversation) and the stateless
// writing editor. Switching to writing clears the visible log for a clean
// editor surface; switching back re-renders the preserved role-play history.
function setWritingMode(on) {
  writingMode = on;
  el("chat-mode-roleplay").classList.toggle("chat-mode-btn--active", !on);
  el("chat-mode-writing").classList.toggle("chat-mode-btn--active", on);
  el("chat-mode-roleplay").setAttribute("aria-pressed", String(!on));
  el("chat-mode-writing").setAttribute("aria-pressed", String(on));

  // The scenario picker and Debrief are role-play concepts — hide them in
  // writing mode (and only ever for a scenario-capable profile). Panel
  // visibility stays owned by setActivePanel.
  const scenarioCapable = !!(session && session.profile.features.scenarios);
  elHidden("scenario-select-wrap", on || !scenarioCapable);
  elHidden("debrief-btn", on || !scenarioCapable);
  elHidden("tools-debrief", on); // Debrief reviews a role-play, not writing

  el("chat-input").placeholder = on
    ? "Paste an email, message or paragraph and I'll polish it…"
    : defaultChatPlaceholder;

  if (on) {
    el("chat-log").innerHTML = "";
    appendSystemNotice(
      "Writing mode — paste any text and I'll return a polished version plus a few notes. This is separate from your role-play and isn't saved to history."
    );
  } else if (session) {
    rerenderChatLog();
  }
}

async function handleSend() {
  const input = el("chat-input");
  const text = input.value.trim();
  if (!text) return;

  if (writingMode) {
    await handleWritingSend(text);
    return;
  }

  input.value = "";
  el("chat-send").disabled = true;

  appendMessageToLog("user", text);
  const userTurn = { role: "user", text, ts: new Date().toISOString() };
  session.state.conversation.recentTurns.push(userTurn);
  recordTurnForParentSync(session.state, userTurn);

  const rollingWindow = session.state.conversation.recentTurns
    .slice(-ROLLING_WINDOW_SIZE)
    .map((turn) => ({ role: turn.role, content: turn.text }));

  try {
    const documentEntry = (session.state.documentContext || {})[currentScenarioId];
    const result = await sendChatMessage({
      userEmail: session.userEmail,
      profileId: session.profile.id,
      messages: rollingWindow,
      conversationSummary: session.state.conversation.summary,
      scenarioId: currentScenarioId,
      documentContext: documentEntry ? documentEntry.text : null,
      lessonWordList: session.lessonWordList,
      mascotPreference: getMascotPreference(),
    });

    if (result.budgetStatus === "soft_block") {
      showBanner(result.message);
    } else {
      appendMessageToLog("assistant", result.reply, session.profile);
      if (session.profile.features.mascots) {
        speakLines(buildSpokenSegments(result.reply));
      } else {
        speak(result.reply);
      }
      const assistantTurn = { role: "assistant", text: result.reply, ts: new Date().toISOString() };
      session.state.conversation.recentTurns.push(assistantTurn);
      recordTurnForParentSync(session.state, assistantTurn);
      session.state.progress.totalTurns += 1;

      // Adult "Progress" metrics — real counters only (no fabricated numbers):
      // which scenarios have actually been practiced, and which calendar days
      // the member was active. Both tolerate older saved states without them.
      if (session.profile.features.scenarios) {
        const p = session.state.progress;
        p.scenariosPracticed = p.scenariosPracticed || [];
        if (currentScenarioId && !p.scenariosPracticed.includes(currentScenarioId)) {
          p.scenariosPracticed.push(currentScenarioId);
        }
        p.activeDays = p.activeDays || [];
        const today = todayLocalDateString();
        if (!p.activeDays.includes(today)) p.activeDays.push(today);
        // Keep the (always-visible on desktop) Progress panel in sync.
        renderProgressPro();
      }

      if (session.profile.features.gamification) {
        const newlyUnlocked = updateGamificationAfterTurn(session.state);
        renderGamificationBar();
        renderBadgesPanel();
        for (const badge of newlyUnlocked) {
          appendSystemNotice(t("chat.newBadge", { label: badgeLabel(badge.id) }));
        }
      }

      session.state.usageSnapshot = {
        ...session.state.usageSnapshot,
        monthKey: new Date().toISOString().slice(0, 7),
        estimatedCostUsd: result.costUsd.monthToDateForUser,
        lastSyncedAt: new Date().toISOString(),
      };
      renderBudgetIndicator();

      if (result.budgetStatus === "warn") {
        showBanner("Heads up — you're close to your $10 practice budget for this month.");
      } else {
        hideBanner();
      }
    }

    if (session.state.conversation.recentTurns.length > MAX_STORED_TURNS) {
      session.state.conversation.recentTurns = session.state.conversation.recentTurns.slice(-MAX_STORED_TURNS);
    }

    await saveState(session.accessToken, session.fileId, session.state);

    if (session.profile.features.parentVisible) {
      // Fire-and-forget: the parent dashboard is a bonus mirror, never a
      // dependency for the child's own chat experience — a sync failure must
      // never surface as an error to the child or block sending.
      syncProgress({
        userEmail: session.userEmail,
        profileId: session.profile.id,
        displayName: session.displayName,
        gamification: gamificationWithRewards(session.state, session.profile),
        progress: session.state.progress,
        date: session.state.parentSync.todayDate,
        turns: session.state.parentSync.todayTurns,
      }).catch((err) => console.warn("Parent-progress sync failed (non-fatal):", err));
    }
  } catch (err) {
    showBanner(`Something went wrong: ${err.message}`);
  } finally {
    el("chat-send").disabled = false;
  }
}

// Writing mode: one stateless round-trip through the same Worker /chat. We send
// the draft wrapped in an editor instruction as a SINGLE message — no scenario,
// no rolling window, nothing persisted to recentTurns — so the editor can't be
// derailed by, or leak into, the learner's role-play history. The usage/budget
// snapshot is still updated (the call costs the same as any chat turn).
async function handleWritingSend(draft) {
  const input = el("chat-input");
  input.value = "";
  el("chat-send").disabled = true;

  appendMessageToLog("user", draft, session.profile);

  try {
    const result = await sendChatMessage({
      userEmail: session.userEmail,
      profileId: session.profile.id,
      messages: [{ role: "user", content: WRITING_EDITOR_PROMPT(draft) }],
      conversationSummary: null,
      scenarioId: null,
      documentContext: null,
      lessonWordList: null,
      mascotPreference: getMascotPreference(),
    });

    if (result.budgetStatus === "soft_block") {
      showBanner(result.message);
      return;
    }

    appendMessageToLog("assistant", result.reply, session.profile);
    applyUsageSnapshot(result);
  } catch (err) {
    showBanner(`Something went wrong: ${err.message}`);
  } finally {
    el("chat-send").disabled = false;
  }
}

// Shared usage/budget update for the stateless adult tools (writing, debrief):
// roll the month-to-date cost from the Worker into the snapshot, refresh the
// indicator, and surface the budget-warning banner.
function applyUsageSnapshot(result) {
  session.state.usageSnapshot = {
    ...session.state.usageSnapshot,
    monthKey: new Date().toISOString().slice(0, 7),
    estimatedCostUsd: result.costUsd.monthToDateForUser,
    lastSyncedAt: new Date().toISOString(),
  };
  renderBudgetIndicator();
  if (result.budgetStatus === "warn") {
    showBanner("Heads up — you're close to your $10 practice budget for this month.");
  } else {
    hideBanner();
  }
}

// Debrief the current role-play: send the transcript to the coach in one
// stateless request and show the review. Nothing is written to history.
async function handleDebrief() {
  const turns = (session.state.conversation.recentTurns || []).filter(
    (turn) => turn.role === "user" || turn.role === "assistant"
  );
  const learnerTurns = turns.filter((turn) => turn.role === "user");
  if (learnerTurns.length < 2) {
    appendSystemNotice(
      "Have a short conversation first — a few of your own messages — then tap Debrief and I'll review your English."
    );
    return;
  }

  const transcript = turns
    .map((turn) => `${turn.role === "user" ? "You" : "Partner"}: ${turn.text}`)
    .join("\n");

  el("debrief-btn").disabled = true;
  el("chat-send").disabled = true;
  appendSystemNotice("Reviewing your conversation…");

  try {
    const result = await sendChatMessage({
      userEmail: session.userEmail,
      profileId: session.profile.id,
      messages: [{ role: "user", content: DEBRIEF_PROMPT(transcript) }],
      conversationSummary: null,
      scenarioId: null,
      documentContext: null,
      lessonWordList: null,
      mascotPreference: getMascotPreference(),
    });

    if (result.budgetStatus === "soft_block") {
      showBanner(result.message);
      return;
    }

    appendMessageToLog("assistant", result.reply, session.profile);
    applyUsageSnapshot(result);
  } catch (err) {
    showBanner(`Something went wrong: ${err.message}`);
  } finally {
    el("debrief-btn").disabled = false;
    el("chat-send").disabled = false;
  }
}
