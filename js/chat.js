import { sendChatMessage } from "./worker-client.js";
import { saveState } from "./drive.js";
import { ACTIVE_PROFILE } from "./profile.js";
import { SCENARIOS } from "./scenarios-client.js";
import {
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  isTtsMuted,
  setTtsMuted,
  initVoiceInput,
  startListening,
  stopListening,
  speak,
} from "./voice.js";

const ROLLING_WINDOW_SIZE = 10; // messages (not turns) sent to the Worker each request
const MAX_STORED_TURNS = 20; // messages kept in Drive before older ones are dropped

let session = null; // { accessToken, userEmail, displayName, fileId, state }
let currentScenarioId = null; // null = free conversation

function el(id) {
  return document.getElementById(id);
}

export function initChat({ accessToken, userEmail, displayName, fileId, state }) {
  session = { accessToken, userEmail, displayName, fileId, state };

  el("chat-log").innerHTML = "";
  for (const turn of state.conversation.recentTurns) {
    appendMessageToLog(turn.role, turn.text);
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
    el("debug-data-output").textContent = JSON.stringify(session.state, null, 2);
    el("debug-data-output").hidden = false;
  });

  initScenarioSelect();
  initVoiceUi();
}

function initScenarioSelect() {
  const select = el("scenario-select");
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

  if (isSpeechSynthesisSupported()) {
    ttsBtn.hidden = false;
    updateTtsButtonLabel();
    ttsBtn.addEventListener("click", () => {
      setTtsMuted(!isTtsMuted());
      updateTtsButtonLabel();
    });
  } else {
    ttsBtn.hidden = true;
  }
}

function updateTtsButtonLabel() {
  const muted = isTtsMuted();
  el("tts-mute-btn").textContent = muted ? "🔇 Voice off" : "🔊 Voice on";
  el("tts-mute-btn").setAttribute("aria-pressed", String(muted));
}

function appendMessageToLog(role, text) {
  const log = el("chat-log");
  const bubble = document.createElement("div");
  bubble.className = `chat-bubble chat-bubble--${role}`;
  bubble.textContent = text;
  log.appendChild(bubble);
  log.scrollTop = log.scrollHeight;
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

function showBanner(message) {
  const banner = el("budget-warning");
  banner.textContent = message;
  banner.hidden = false;
}

function hideBanner() {
  el("budget-warning").hidden = true;
}

async function handleSend() {
  const input = el("chat-input");
  const text = input.value.trim();
  if (!text) return;

  input.value = "";
  el("chat-send").disabled = true;

  appendMessageToLog("user", text);
  session.state.conversation.recentTurns.push({
    role: "user",
    text,
    ts: new Date().toISOString(),
  });

  const rollingWindow = session.state.conversation.recentTurns
    .slice(-ROLLING_WINDOW_SIZE)
    .map((turn) => ({ role: turn.role, content: turn.text }));

  try {
    const result = await sendChatMessage({
      userEmail: session.userEmail,
      profileId: ACTIVE_PROFILE.id,
      messages: rollingWindow,
      conversationSummary: session.state.conversation.summary,
      scenarioId: currentScenarioId,
    });

    if (result.budgetStatus === "soft_block") {
      showBanner(result.message);
    } else {
      appendMessageToLog("assistant", result.reply);
      speak(result.reply);
      session.state.conversation.recentTurns.push({
        role: "assistant",
        text: result.reply,
        ts: new Date().toISOString(),
      });
      session.state.progress.totalTurns += 1;

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
  } catch (err) {
    showBanner(`Something went wrong: ${err.message}`);
  } finally {
    el("chat-send").disabled = false;
  }
}
