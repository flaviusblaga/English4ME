// Reading-comprehension practice for the Expert tier — architectural sibling
// of js/lessons.js: 100% client-side scoring against static passages from
// js/reading-client.js, no Claude calls. No mascots — Expert uses the
// grown-up presentation.

import { saveState } from "./drive.js";
import { syncProgress } from "./worker-client.js";
import { updateGamificationAfterLesson } from "./gamification.js";
import { recordTurnForParentSync, todayLocalDateString } from "./chat.js";
import { getReadingSet, getPassage } from "./reading-client.js";
import { gamificationWithRewards } from "./rewards.js";
import { speak } from "./voice.js";

let session = null; // { accessToken, userEmail, displayName, fileId, state, profile }
let onBackCallback = null;

let currentPassage = null;
let currentQuestionIndex = 0;
let currentScore = 0;

function el(id) {
  return document.getElementById(id);
}

export function initReading({ accessToken, userEmail, displayName, fileId, state, profile, onBack }) {
  session = { accessToken, userEmail, displayName, fileId, state, profile };
  onBackCallback = onBack;

  el("reading-back-btn").onclick = () => {
    if (onBackCallback) onBackCallback();
  };
  el("reading-exit-btn").onclick = showMenu;
  el("reading-back-to-menu-btn").onclick = showMenu;

  showMenu();
}

function showMenu() {
  el("reading-menu-view").hidden = false;
  el("reading-passage-view").hidden = true;
  el("reading-complete-view").hidden = true;

  const grid = el("reading-menu-grid");
  grid.innerHTML = "";
  for (const passage of getReadingSet(session.profile.contentTier)) {
    const record = session.state.reading.completed[passage.id];
    const card = document.createElement("button");
    card.type = "button";
    card.className = "lesson-card";
    if (record) card.classList.add("lesson-card--done");
    const icon = document.createElement("span");
    icon.className = "lesson-card-icon";
    icon.textContent = passage.emoji || "📖";
    const title = document.createElement("strong");
    title.textContent = passage.title;
    const sub = document.createElement("span");
    sub.textContent = record ? `Best: ${record.bestScore}/${passage.questions.length}` : "Not read yet";
    card.appendChild(icon);
    card.appendChild(title);
    card.appendChild(sub);
    card.addEventListener("click", () => startPassage(passage.id));
    grid.appendChild(card);
  }
}

function startPassage(passageId) {
  currentPassage = getPassage(passageId);
  currentQuestionIndex = 0;
  currentScore = 0;

  session.state.reading.lastPassageId = passageId;

  el("reading-menu-view").hidden = true;
  el("reading-passage-view").hidden = false;
  el("reading-complete-view").hidden = true;

  el("reading-passage-title").textContent = currentPassage.title;
  el("reading-passage-text").textContent = currentPassage.text;

  // Active listening: tap to hear the whole passage read aloud, as often as
  // wanted. Read at a slightly slower rate so learners can follow along.
  el("reading-listen-btn").onclick = () => speak(currentPassage.text, { rate: 0.9 });

  renderQuestion();
}

function renderQuestion() {
  const question = currentPassage.questions[currentQuestionIndex];
  el("reading-progress-label").textContent = `${currentQuestionIndex + 1} / ${currentPassage.questions.length}`;
  el("reading-progress-fill").style.width = `${((currentQuestionIndex + 1) / currentPassage.questions.length) * 100}%`;
  el("reading-question-text").textContent = question.q;

  const optionsGrid = el("reading-options-grid");
  optionsGrid.innerHTML = "";
  question.options.forEach((option, idx) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "lesson-option-btn";
    btn.textContent = option;
    btn.addEventListener("click", () => handleAnswer(idx, btn));
    optionsGrid.appendChild(btn);
  });

  el("reading-feedback").textContent = "";
  el("reading-next-btn").hidden = true;
}

function handleAnswer(chosenIdx, chosenBtn) {
  const question = currentPassage.questions[currentQuestionIndex];
  const optionButtons = [...el("reading-options-grid").children];
  for (const btn of optionButtons) {
    btn.disabled = true;
  }

  const wasCorrect = chosenIdx === question.correct;
  if (wasCorrect) {
    currentScore += 1;
    chosenBtn.classList.add("lesson-option-btn--correct");
    el("reading-feedback").textContent = "Correct! Well spotted.";
  } else {
    chosenBtn.classList.add("lesson-option-btn--incorrect");
    optionButtons[question.correct].classList.add("lesson-option-btn--correct");
    el("reading-feedback").textContent = "Not quite — the highlighted answer is the right one. Re-read that part of the passage if you like.";
  }

  const isLast = currentQuestionIndex === currentPassage.questions.length - 1;
  const nextBtn = el("reading-next-btn");
  nextBtn.textContent = isLast ? "See my results →" : "Next question →";
  nextBtn.hidden = false;
  nextBtn.onclick = isLast ? finishPassage : advanceToNextQuestion;

  recordTurnForParentSync(session.state, {
    role: "user",
    text: `[Reading: ${currentPassage.title}] Question ${currentQuestionIndex + 1} — ${wasCorrect ? "correct!" : "incorrect"}`,
    ts: new Date().toISOString(),
  });
}

function advanceToNextQuestion() {
  currentQuestionIndex += 1;
  renderQuestion();
}

function finishPassage() {
  const total = currentPassage.questions.length;
  const score = currentScore;

  const existing = session.state.reading.completed[currentPassage.id];
  session.state.reading.completed[currentPassage.id] = {
    bestScore: existing ? Math.max(existing.bestScore, score) : score,
    attempts: existing ? existing.attempts + 1 : 1,
    lastCompletedAt: new Date().toISOString(),
  };

  const newlyUnlocked = updateGamificationAfterLesson(session.state);

  recordTurnForParentSync(session.state, {
    role: "assistant",
    text: `[Reading: ${currentPassage.title}] Finished with ${score}/${total} correct.`,
    ts: new Date().toISOString(),
  });

  saveState(session.accessToken, session.fileId, session.state);

  if (session.profile.features.parentVisible) {
    syncProgress({
      userEmail: session.userEmail,
      profileId: session.profile.id,
      displayName: session.displayName,
      gamification: gamificationWithRewards(session.state, session.profile),
      progress: session.state.progress,
      date: session.state.parentSync.todayDate || todayLocalDateString(),
      turns: session.state.parentSync.todayTurns,
    }).catch((err) => console.warn("Parent-progress sync failed (non-fatal):", err));
  }

  el("reading-passage-view").hidden = true;
  el("reading-complete-view").hidden = false;
  el("reading-complete-score").textContent = `You got ${score} out of ${total}!`;

  if (newlyUnlocked.length > 0) {
    const badgeNames = newlyUnlocked.map((b) => `${b.emoji} ${b.label}`).join(", ");
    el("reading-complete-score").textContent += ` New badge: ${badgeNames}!`;
  }
}
