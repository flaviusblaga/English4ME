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
} from "./voice.js";

const ROLLING_WINDOW_SIZE = 10; // messages (not turns) sent to the Worker each request
const MAX_STORED_TURNS = 20; // messages kept in Drive before older ones are dropped

const MASCOT_AVATARS = {
  Bobo: { emoji: "🦫", img: "assets/socatei/bobo.png" },
  Fizz: { emoji: "🐿️", img: "assets/socatei/fizz.png" },
};

let session = null; // { accessToken, userEmail, displayName, fileId, state, profile }
let currentScenarioId = null; // null = free conversation

function el(id) {
  return document.getElementById(id);
}

export function initChat({ accessToken, userEmail, displayName, fileId, state, profile }) {
  session = { accessToken, userEmail, displayName, fileId, state, profile };

  el("chat-log").innerHTML = "";
  for (const turn of state.conversation.recentTurns) {
    appendMessageToLog(turn.role, turn.text, profile);
  }

  renderBudgetIndicator();

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

  if (profile.features.scenarios) {
    el("scenario-select-wrap").hidden = false;
    initScenarioSelect();
  } else {
    el("scenario-select-wrap").hidden = true;
    currentScenarioId = null;
  }

  initVoiceUi();

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
    renderGamificationBar();
    renderBadgesPanel();
    el("gamification-badges-btn").addEventListener("click", () => {
      const panel = el("gamification-badges-panel");
      panel.hidden = !panel.hidden;
    });
  } else {
    el("gamification-bar").hidden = true;
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

function appendMessageToLog(role, text, profile) {
  const log = el("chat-log");
  const bubble = document.createElement("div");
  bubble.className = `chat-bubble chat-bubble--${role}`;

  if (role === "assistant" && profile && profile.id === "kids-primar") {
    bubble.appendChild(renderMascotLines(text));
  } else {
    bubble.textContent = text;
  }

  log.appendChild(bubble);
  log.scrollTop = log.scrollHeight;
}

function renderMascotLines(text) {
  const wrap = document.createElement("div");
  const lines = text.split("\n").filter((l) => l.trim());
  let matchedAny = false;

  for (const line of lines) {
    const match = line.match(/^(Bobo|Fizz):\s*(.*)$/);
    if (match) {
      matchedAny = true;
      const name = match[1];
      const avatar = MASCOT_AVATARS[name];
      const p = document.createElement("p");
      p.className = "mascot-line";

      const nameSpan = document.createElement("span");
      nameSpan.className = "mascot-name";

      const img = document.createElement("img");
      img.src = avatar.img;
      img.alt = name;
      img.className = "mascot-avatar";
      img.onerror = function () {
        // Real PNG missing/broken — fall back to the emoji inline, never a
        // broken-image icon.
        this.replaceWith(document.createTextNode(avatar.emoji + " "));
      };

      nameSpan.appendChild(img);
      nameSpan.appendChild(document.createTextNode(` ${name}:`));
      p.appendChild(nameSpan);
      p.appendChild(document.createTextNode(` ${match[2]}`));
      wrap.appendChild(p);
    }
  }

  if (!matchedAny) {
    wrap.textContent = text; // graceful fallback if the format wasn't followed
  }
  return wrap;
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

function todayLocalDateString() {
  const now = new Date();
  if (window.__debugForceYesterday) {
    now.setDate(now.getDate() - 1); // manual test hook — see plan verification step C.3
  }
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

// Mirrors every turn into a same-day accumulator that is NOT trimmed by
// MAX_STORED_TURNS, so a busy day's early turns survive long enough to reach
// the parent-progress sync — resets only when the calendar day changes.
function recordTurnForParentSync(state, turn) {
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
    });

    if (result.budgetStatus === "soft_block") {
      showBanner(result.message);
    } else {
      appendMessageToLog("assistant", result.reply, session.profile);
      speak(result.reply);
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
