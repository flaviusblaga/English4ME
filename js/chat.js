import { sendChatMessage, syncProgress } from "./worker-client.js";
import { saveState } from "./drive.js";
import { SCENARIOS } from "./scenarios-client.js";
import { initDocumentsUi, refreshDocumentsSummary } from "./documents-ui.js";
import { BADGES, updateGamificationAfterTurn } from "./gamification.js";
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

const MASCOT_AVATARS = {
  Bobo: { emoji: "🦫", img: "assets/socatei/bobo.png" },
  Fizz: { emoji: "🐿️", img: "assets/socatei/fizz.png" },
};

// Which mascot(s) the child wants to see/hear talk. Claude still always
// replies with both lines (no prompt/Worker change needed) — this is a
// purely presentational filter applied at render/speak time, so switching
// preference mid-conversation is instant and never loses conversation data.
const MASCOT_PREFERENCE_KEY = "engleza-familie-mascot-preference"; // "Bobo" | "Fizz" | "both"

// Exported: js/lessons.js reuses the same preference so choosing a mascot in
// either screen (chat or lessons) stays consistent across both.
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
export const MASCOT_VOICES = {
  Bobo: { pitch: 1.65, rate: 1.18 },
  Fizz: { pitch: 1.15, rate: 0.98 },
};

function parseMascotLines(text) {
  return text
    .split("\n")
    .map((line) => line.match(/^(Bobo|Fizz):\s*(.*)$/))
    .filter(Boolean)
    .map((match) => ({ name: match[1], line: match[2] }));
}

let session = null; // { accessToken, userEmail, displayName, fileId, state, profile, lessonWordList }
let currentScenarioId = null; // null = free conversation
let listenersInitialized = false; // guards one-time listener attachment across repeated initChat calls

function el(id) {
  return document.getElementById(id);
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

    el("chat-send").addEventListener("click", handleSend);
    el("chat-input").addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
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

    for (const pref of ["Bobo", "Fizz", "both"]) {
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
  el("back-to-lessons-btn").textContent = profile.features.chatFirst ? "🎓 Exercises" : "📚 Lessons";
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
    el("scenario-select-wrap").hidden = false;
    initScenarioSelect();
  } else {
    el("scenario-select-wrap").hidden = true;
    currentScenarioId = null;
  }

  if (profile.features.documents) {
    el("scenario-documents").hidden = false;
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
    el("scenario-documents").hidden = true;
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
  for (const scenario of SCENARIOS) {
    const opt = document.createElement("option");
    opt.value = scenario.id;
    opt.textContent = scenario.label;
    select.appendChild(opt);
  }
  select.value = session.state.lastScenarioId || "";
  currentScenarioId = select.value || null;

  select.addEventListener("change", () => {
    handleScenarioChange(select.value || null);
  });
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
  el("tts-mute-btn").textContent = muted ? "🔇 Voice off" : "🔊 Voice on";
  el("tts-mute-btn").setAttribute("aria-pressed", String(muted));
}

function updateMascotSelectUi() {
  const preference = getMascotPreference();
  for (const pref of ["Bobo", "Fizz", "both"]) {
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
  const preference = getMascotPreference();
  const visible = preference === "both" ? parsed : parsed.filter((p) => p.name === preference);

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
  const preference = getMascotPreference();
  const visible = preference === "both" ? parsed : parsed.filter((p) => p.name === preference);
  return visible.map((p) => ({ text: p.line, ...MASCOT_VOICES[p.name] }));
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
}

function renderGamificationBar() {
  const g = session.state.gamification;
  el("gamification-points").textContent = `⭐ ${g.points}`;
  el("gamification-streak").textContent = `🔥 ${g.currentStreak}`;
}

function renderBadgesPanel() {
  const panel = el("gamification-badges-panel");
  panel.innerHTML = "";
  const unlocked = new Set(session.state.gamification.badges);
  for (const badge of BADGES) {
    const chip = document.createElement("span");
    chip.className = `gamification-badge-chip${unlocked.has(badge.id) ? "" : " gamification-badge-chip--locked"}`;
    chip.textContent = `${badge.emoji} ${badge.label}`;
    panel.appendChild(chip);
  }
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

async function handleSend() {
  const input = el("chat-input");
  const text = input.value.trim();
  if (!text) return;

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

      if (session.profile.features.gamification) {
        const newlyUnlocked = updateGamificationAfterTurn(session.state);
        renderGamificationBar();
        renderBadgesPanel();
        for (const badge of newlyUnlocked) {
          appendSystemNotice(`🎉 New badge: ${badge.label}!`);
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
        gamification: session.state.gamification || null,
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
