import { saveState } from "./drive.js";
import { syncProgress } from "./worker-client.js";
import { updateGamificationAfterLesson, BADGES } from "./gamification.js";
import { recordTurnForParentSync, todayLocalDateString, KIDS_VOICE_OPTIONS } from "./chat.js";
import { speak } from "./voice.js";
import {
  LESSONS,
  getLesson,
  buildExerciseQueue,
  getRandomLine,
  QUESTION_STEM_LINES,
  CORRECT_REACTION_LINES,
  INCORRECT_REACTION_LINES,
  LESSON_MENU_INTRO_LINES,
  getLessonCompleteLine,
} from "./lessons-client.js";

const MASCOT_AVATARS = {
  Bobo: { emoji: "🦫", img: "assets/socatei/bobo.png" },
  Fizz: { emoji: "🐿️", img: "assets/socatei/fizz.png" },
};

let session = null; // { accessToken, userEmail, displayName, fileId, state, profile }
let onJustChatCallback = null;
let onChatAboutItCallback = null;

let currentQueue = [];
let currentIndex = 0;
let currentScore = 0;
let currentLesson = null;

function el(id) {
  return document.getElementById(id);
}

function setMascotAvatar(imgEl, name) {
  const avatar = MASCOT_AVATARS[name];
  imgEl.src = avatar.img;
  imgEl.alt = name;
  imgEl.onerror = function () {
    const fallback = document.createElement("span");
    fallback.className = "mascot-avatar mascot-avatar--emoji-fallback";
    fallback.textContent = avatar.emoji;
    this.replaceWith(fallback);
  };
}

export function initLessons({ accessToken, userEmail, displayName, fileId, state, profile, onJustChat, onChatAboutIt }) {
  session = { accessToken, userEmail, displayName, fileId, state, profile };
  onJustChatCallback = onJustChat;
  onChatAboutItCallback = onChatAboutIt;

  el("lesson-user-name").textContent = displayName;
  el("lesson-just-chat-btn").onclick = () => {
    if (onJustChatCallback) onJustChatCallback(null);
  };
  el("lesson-exit-btn").onclick = showMenu;
  el("lesson-back-to-menu-btn").onclick = showMenu;

  renderGamificationBar();
  showMenu();
}

function renderGamificationBar() {
  const g = session.state.gamification;
  el("lesson-gamification-points").textContent = `⭐ ${g.points}`;
  el("lesson-gamification-streak").textContent = `🔥 ${g.currentStreak}`;
}

function showMenu() {
  el("lesson-menu-view").hidden = false;
  el("lesson-exercise-view").hidden = true;
  el("lesson-complete-view").hidden = true;

  setMascotAvatar(el("lesson-menu-avatar"), "Bobo");
  el("lesson-menu-intro-line").textContent = getRandomLine(LESSON_MENU_INTRO_LINES);

  const grid = el("lesson-menu-grid");
  grid.innerHTML = "";
  for (const lesson of LESSONS) {
    const record = session.state.lessons.completed[lesson.id];
    const card = document.createElement("button");
    card.type = "button";
    card.className = "lesson-card";
    const title = document.createElement("strong");
    title.textContent = lesson.label;
    const sub = document.createElement("span");
    sub.textContent = record ? `Best: ${record.bestScore}/16` : "Not started yet";
    card.appendChild(title);
    card.appendChild(sub);
    card.addEventListener("click", () => startLesson(lesson.id));
    grid.appendChild(card);
  }
}

function startLesson(lessonId) {
  currentLesson = getLesson(lessonId);
  currentQueue = buildExerciseQueue(currentLesson);
  currentIndex = 0;
  currentScore = 0;

  session.state.lessons.lastLessonId = lessonId;

  el("lesson-menu-view").hidden = true;
  el("lesson-exercise-view").hidden = false;
  el("lesson-complete-view").hidden = true;

  renderQuestion();
}

function renderQuestion() {
  const question = currentQueue[currentIndex];
  el("lesson-progress-label").textContent = `${currentLesson.label} — ${currentIndex + 1} / ${currentQueue.length}`;

  setMascotAvatar(el("lesson-prompt-avatar"), "Bobo");
  el("lesson-prompt-text").textContent = getRandomLine(QUESTION_STEM_LINES[question.type]);

  const stem = el("lesson-question-stem");
  stem.textContent = question.type === "picture" ? question.word.en : question.word.ro;
  stem.className = `lesson-question-stem lesson-question-stem--${question.type}`;

  // Only speak the word itself for "picture" questions — the English word is
  // already shown as the stem, so hearing it reinforces pronunciation without
  // giving away the answer (the answer is the picture). For "translation"
  // questions the stem is Romanian, which the app's TTS (hardcoded en-US)
  // would mispronounce, so it's read aloud after the answer instead (see
  // handleAnswer), never here.
  if (question.type === "picture") {
    speak(question.word.en, KIDS_VOICE_OPTIONS);
  }

  const optionsGrid = el("lesson-options-grid");
  optionsGrid.innerHTML = "";
  for (const option of question.options) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "lesson-option-btn";
    btn.textContent = option.value;
    btn.addEventListener("click", () => handleAnswer(option, btn));
    optionsGrid.appendChild(btn);
  }

  el("lesson-reaction-avatar").hidden = true;
  el("lesson-reaction-text").textContent = "";
  el("lesson-next-btn").hidden = true;
}

function handleAnswer(chosenOption, chosenBtn) {
  const question = currentQueue[currentIndex];
  const optionButtons = [...el("lesson-options-grid").children];

  for (const btn of optionButtons) {
    btn.disabled = true;
  }

  const wasCorrect = chosenOption.isCorrect;
  question.wasCorrect = wasCorrect; // recorded for the lesson-completion mastery summary
  if (wasCorrect) {
    currentScore += 1;
    chosenBtn.classList.add("lesson-option-btn--correct");
  } else {
    chosenBtn.classList.add("lesson-option-btn--incorrect");
    const correctIndex = question.options.findIndex((o) => o.isCorrect);
    optionButtons[correctIndex].classList.add("lesson-option-btn--correct");
  }

  const reactionAvatar = el("lesson-reaction-avatar");
  reactionAvatar.hidden = false;
  setMascotAvatar(reactionAvatar, wasCorrect ? "Bobo" : "Fizz");
  const reactionLine = getRandomLine(wasCorrect ? CORRECT_REACTION_LINES : INCORRECT_REACTION_LINES);
  el("lesson-reaction-text").textContent = reactionLine;

  // Always speak the actual English word out loud here (not just the
  // flavor line) — this is the one moment every question guarantees the
  // child hears the correct word pronounced, whether they got it right or
  // not, and whether the question was picture- or translation-based.
  const spokenReaction = reactionLine.replace(/^(Bobo|Fizz):\s*/, "");
  speak(`${spokenReaction} ${question.word.en}.`, KIDS_VOICE_OPTIONS);

  const isLast = currentIndex === currentQueue.length - 1;
  const nextBtn = el("lesson-next-btn");
  nextBtn.textContent = isLast ? "See my results! →" : "Next →";
  nextBtn.hidden = false;
  nextBtn.onclick = isLast ? finishLesson : advanceToNextQuestion;

  recordTurnForParentSync(session.state, {
    role: "user",
    text: `[Lesson: ${currentLesson.label}] Answered "${question.word.en}" — ${wasCorrect ? "correct!" : `incorrect (correct: "${question.word.en}")`}`,
    ts: new Date().toISOString(),
  });
}

function advanceToNextQuestion() {
  currentIndex += 1;
  renderQuestion();
}

function finishLesson() {
  const total = currentQueue.length;
  const score = currentScore;

  const existing = session.state.lessons.completed[currentLesson.id];
  const wordsEverCorrect = new Set(existing ? existing.wordsEverCorrect : []);
  // A word counts once it's been answered correctly at least once, in this or
  // any past attempt — a simple accumulating mastery set, not a full
  // per-attempt history (see plan's fast-follow for spaced repetition).
  for (const q of currentQueue) {
    if (q.wasCorrect) wordsEverCorrect.add(q.word.en);
  }

  session.state.lessons.completed[currentLesson.id] = {
    bestScore: existing ? Math.max(existing.bestScore, score) : score,
    attempts: existing ? existing.attempts + 1 : 1,
    lastCompletedAt: new Date().toISOString(),
    wordsEverCorrect: [...wordsEverCorrect],
  };

  const newlyUnlocked = updateGamificationAfterLesson(session.state);
  renderGamificationBar();

  recordTurnForParentSync(session.state, {
    role: "assistant",
    text: `[Lesson: ${currentLesson.label}] Finished with ${score}/${total} correct. 🎉`,
    ts: new Date().toISOString(),
  });

  saveState(session.accessToken, session.fileId, session.state);

  if (session.profile.features.parentVisible) {
    syncProgress({
      userEmail: session.userEmail,
      profileId: session.profile.id,
      displayName: session.displayName,
      gamification: session.state.gamification || null,
      progress: session.state.progress,
      date: session.state.parentSync.todayDate || todayLocalDateString(),
      turns: session.state.parentSync.todayTurns,
    }).catch((err) => console.warn("Parent-progress sync failed (non-fatal):", err));
  }

  showComplete(score, total, newlyUnlocked);
}

function showComplete(score, total, newlyUnlocked) {
  el("lesson-exercise-view").hidden = true;
  el("lesson-complete-view").hidden = false;

  setMascotAvatar(el("lesson-complete-avatar"), "Fizz");
  el("lesson-complete-line").textContent = getLessonCompleteLine(score, total);
  el("lesson-complete-score").textContent = `You got ${score} out of ${total}! 🎉`;

  if (newlyUnlocked.length > 0) {
    const badgeNames = newlyUnlocked.map((b) => `${b.emoji} ${b.label}`).join(", ");
    el("lesson-complete-score").textContent += ` New badge: ${badgeNames}!`;
  }

  el("lesson-chat-about-it-btn").onclick = () => {
    if (onChatAboutItCallback) {
      onChatAboutItCallback({ label: currentLesson.label, words: currentLesson.words.map((w) => w.en) });
    }
  };
}
