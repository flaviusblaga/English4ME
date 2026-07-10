import { saveState } from "./drive.js";
import { syncProgress } from "./worker-client.js";
import { updateGamificationAfterLesson, BADGES } from "./gamification.js";
import {
  recordTurnForParentSync,
  todayLocalDateString,
  KIDS_VOICE_OPTIONS,
  getMascotPreference,
  setMascotPreference,
} from "./chat.js";
import { speak } from "./voice.js";
import {
  LESSONS,
  getLesson,
  buildExerciseQueue,
  QUESTION_STEM_LINES,
  SENTENCE_LESSONS,
  getSentenceLesson,
  buildSentenceExerciseQueue,
  SENTENCE_QUESTION_STEM_LINES,
  getRandomLine,
  CORRECT_REACTION_LINES,
  INCORRECT_REACTION_LINES,
  LESSON_MENU_INTRO_LINES,
  getLessonCompleteLine,
} from "./lessons-client.js";

const MASCOT_AVATARS = {
  Bobo: { emoji: "🦫", img: "assets/socatei/bobo.png" },
  Fizz: { emoji: "🐿️", img: "assets/socatei/fizz.png" },
};

// One entry per contentTier — the only place that needs to grow when a new
// tier's lesson content ships (Beginner/Intermediate today).
const TIER_CONFIG = {
  beginner: {
    lessonSet: LESSONS,
    getLessonFn: getLesson,
    buildQueue: buildExerciseQueue,
    stemLines: QUESTION_STEM_LINES,
    stateKey: "lessons",
    masteryField: "wordsEverCorrect", // unchanged field name — matches existing saved Beginner data
  },
  intermediate: {
    lessonSet: SENTENCE_LESSONS,
    getLessonFn: getSentenceLesson,
    buildQueue: buildSentenceExerciseQueue,
    stemLines: SENTENCE_QUESTION_STEM_LINES,
    stateKey: "lessonsIntermediate",
    masteryField: "itemsEverCorrect",
  },
};

let session = null; // { accessToken, userEmail, displayName, fileId, state, profile }
let onJustChatCallback = null;
let onChatAboutItCallback = null;
let listenersInitialized = false;

let currentQueue = [];
let currentIndex = 0;
let currentScore = 0;
let currentLesson = null;

function el(id) {
  return document.getElementById(id);
}

function currentTierConfig() {
  return TIER_CONFIG[session.profile.contentTier];
}

function currentStateBucket() {
  return session.state[currentTierConfig().stateKey];
}

// A stable identifying label per exercise item (word or sentence), used for
// scoring/mastery tracking and parent-transcript lines — three different
// question *types* can test the same sentence, so mastery is tracked per
// item, not per question instance.
function getItemLabel(question) {
  return question.word ? question.word.en : question.sentence.en;
}

function getSpokenAnswer(question) {
  return question.word ? question.word.en : question.sentence.en;
}

function questionTypeLabel(type) {
  switch (type) {
    case "picture": return "Picture match";
    case "translation": return "Translation match";
    case "fill-blank": return "Fill-in-the-blank";
    case "unscramble": return "Word order";
    case "picture-sentence": return "Picture-sentence match";
    default: return "Answered";
  }
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

// Which mascot leads (asks the current question): a single-mascot preference
// always uses that one; "both" alternates by question index so the child
// actually sees both mascots take turns asking, not just Bobo dominating
// with Fizz only ever showing up to react to a wrong answer.
function activeMascotForAsking(questionIndex) {
  const pref = getMascotPreference();
  if (pref === "Bobo" || pref === "Fizz") return pref;
  return questionIndex % 2 === 0 ? "Bobo" : "Fizz";
}

// Which mascot reacts to an answer: with "both" (the default), Bobo
// celebrates correct answers and Fizz softens incorrect ones (their original
// personalities); picking a single mascot makes that one handle everything.
function activeMascotForReaction(wasCorrect) {
  const pref = getMascotPreference();
  if (pref === "Bobo" || pref === "Fizz") return pref;
  return wasCorrect ? "Bobo" : "Fizz";
}

function activeMascotForComplete() {
  return getMascotPreference() === "Bobo" ? "Bobo" : "Fizz";
}

function updateLessonMascotSelectUi() {
  const preference = getMascotPreference();
  for (const pref of ["Bobo", "Fizz", "both"]) {
    el(`lesson-mascot-select-${pref.toLowerCase()}`).classList.toggle("mascot-select-btn--active", pref === preference);
  }
}

export function initLessons({ accessToken, userEmail, displayName, fileId, state, profile, onJustChat, onChatAboutIt }) {
  session = { accessToken, userEmail, displayName, fileId, state, profile };
  onJustChatCallback = onJustChat;
  onChatAboutItCallback = onChatAboutIt;

  el("lesson-user-name").textContent = displayName;
  el("lesson-profile-tag").textContent = profile.displayName;
  el("lesson-just-chat-btn").onclick = () => {
    if (onJustChatCallback) onJustChatCallback(null);
  };
  el("lesson-exit-btn").onclick = showMenu;
  el("lesson-back-to-menu-btn").onclick = showMenu;

  if (!listenersInitialized) {
    listenersInitialized = true;
    for (const pref of ["Bobo", "Fizz", "both"]) {
      el(`lesson-mascot-select-${pref.toLowerCase()}`).addEventListener("click", () => {
        setMascotPreference(pref);
        updateLessonMascotSelectUi();
        // If the menu is the visible view, refresh its intro line/avatar
        // immediately; mid-exercise, the next question already picks up the
        // new preference on its own (see renderQuestion), so no refresh
        // needed there.
        if (!el("lesson-menu-view").hidden) showMenu();
      });
    }
  }
  updateLessonMascotSelectUi();

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

  // Not tied to a question index here (there isn't one yet) — pick randomly
  // for "both" so repeat visits to the menu show some variety too.
  const asker = activeMascotForAsking(Math.random() < 0.5 ? 0 : 1);
  setMascotAvatar(el("lesson-menu-avatar"), asker);
  el("lesson-menu-intro-line").textContent = `${asker}: ${getRandomLine(LESSON_MENU_INTRO_LINES)}`;

  const tier = currentTierConfig();
  const bucket = currentStateBucket();
  const grid = el("lesson-menu-grid");
  grid.innerHTML = "";
  for (const lesson of tier.lessonSet) {
    const record = bucket.completed[lesson.id];
    const maxScore = lesson.words ? lesson.words.length * 2 : lesson.sentences.length * 3;
    const card = document.createElement("button");
    card.type = "button";
    card.className = "lesson-card";
    const title = document.createElement("strong");
    title.textContent = lesson.label;
    const sub = document.createElement("span");
    sub.textContent = record ? `Best: ${record.bestScore}/${maxScore}` : "Not started yet";
    card.appendChild(title);
    card.appendChild(sub);
    card.addEventListener("click", () => startLesson(lesson.id));
    grid.appendChild(card);
  }
}

function startLesson(lessonId) {
  const tier = currentTierConfig();
  currentLesson = tier.getLessonFn(lessonId);
  currentQueue = tier.buildQueue(currentLesson);
  currentIndex = 0;
  currentScore = 0;

  currentStateBucket().lastLessonId = lessonId;

  el("lesson-menu-view").hidden = true;
  el("lesson-exercise-view").hidden = false;
  el("lesson-complete-view").hidden = true;

  renderQuestion();
}

function renderQuestion() {
  const question = currentQueue[currentIndex];
  const tier = currentTierConfig();
  el("lesson-progress-label").textContent = `${currentLesson.label} — ${currentIndex + 1} / ${currentQueue.length}`;

  const asker = activeMascotForAsking(currentIndex);
  const promptAvatar = el("lesson-prompt-avatar");
  setMascotAvatar(promptAvatar, asker);
  el("lesson-prompt-text").textContent = `${asker}: ${getRandomLine(tier.stemLines[question.type])}`;

  // Reset per-question interactive state shared by every type.
  el("lesson-reaction-avatar").hidden = true;
  el("lesson-reaction-text").textContent = "";
  el("lesson-replay-btn").hidden = true;
  el("lesson-next-btn").hidden = true;
  promptAvatar.style.cursor = "default";
  promptAvatar.onclick = null;

  const stem = el("lesson-question-stem");
  const optionsGrid = el("lesson-options-grid");
  const unscrambleArea = el("lesson-unscramble-area");

  if (question.type === "unscramble") {
    stem.hidden = true;
    optionsGrid.hidden = true;
    unscrambleArea.hidden = false;
    renderUnscramble(question);
    return;
  }

  stem.hidden = false;
  optionsGrid.hidden = false;
  unscrambleArea.hidden = true;

  let spokenTarget = null;
  let canReplayNow = false;

  if (question.type === "picture") {
    stem.textContent = question.word.en;
    spokenTarget = question.word.en;
    canReplayNow = true;
  } else if (question.type === "translation") {
    stem.textContent = question.word.ro;
  } else if (question.type === "fill-blank") {
    stem.textContent = question.sentence.blankSentence;
  } else if (question.type === "picture-sentence") {
    stem.textContent = question.sentence.emoji;
  }
  stem.className = `lesson-question-stem lesson-question-stem--${question.type}`;

  // Only "picture" (Beginner) questions are replayable pre-answer — the
  // English word is already shown as the stem, so hearing it reinforces
  // pronunciation without giving away the answer (the answer is the
  // picture/sentence). Fill-blank/translation/picture-sentence would reveal
  // or mispronounce (Romanian, en-US TTS) the answer if spoken before
  // answering, so they stay silent until the reaction (see finalizeAnswer).
  if (canReplayNow) {
    promptAvatar.style.cursor = "pointer";
    promptAvatar.onclick = () => speak(spokenTarget, KIDS_VOICE_OPTIONS);
    stem.style.cursor = "pointer";
    stem.onclick = () => speak(spokenTarget, KIDS_VOICE_OPTIONS);
    speak(spokenTarget, KIDS_VOICE_OPTIONS);
  } else {
    stem.style.cursor = "default";
    stem.onclick = null;
  }

  // Full-sentence options need a single column and smaller text to stay
  // readable; word/emoji options keep the bigger two-column layout.
  optionsGrid.classList.toggle("lesson-options-grid--sentences", question.type === "picture-sentence");

  optionsGrid.innerHTML = "";
  for (const option of question.options) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "lesson-option-btn";
    btn.textContent = option.value;
    btn.addEventListener("click", () => handleOptionAnswer(option, btn));
    optionsGrid.appendChild(btn);
  }
}

// Word-chip tap-to-build interaction for the "unscramble" exercise type —
// tap a bank chip to move it into the build strip (in tap order), tap a
// build-strip chip to send it back, then "Check" validates exact order.
function renderUnscramble(question) {
  const bank = el("lesson-unscramble-bank");
  const build = el("lesson-unscramble-build");
  const checkBtn = el("lesson-unscramble-check-btn");
  const placedIndexes = [];

  function draw() {
    bank.innerHTML = "";
    question.tokens.forEach((token, idx) => {
      if (placedIndexes.includes(idx)) return;
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "word-chip";
      chip.textContent = token;
      chip.addEventListener("click", () => {
        placedIndexes.push(idx);
        draw();
      });
      bank.appendChild(chip);
    });

    build.innerHTML = "";
    placedIndexes.forEach((idx, pos) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "word-chip word-chip--placed";
      chip.textContent = question.tokens[idx];
      chip.addEventListener("click", () => {
        placedIndexes.splice(pos, 1);
        draw();
      });
      build.appendChild(chip);
    });
  }

  draw();
  checkBtn.disabled = false;

  checkBtn.onclick = () => {
    checkBtn.disabled = true;
    const builtSentence = placedIndexes.map((idx) => question.tokens[idx]).join(" ");
    const wasCorrect = builtSentence === question.sentence.en;
    if (!wasCorrect) {
      build.querySelectorAll(".word-chip").forEach((c) => c.classList.add("word-chip--wrong-order"));
    }
    [...bank.children, ...build.children].forEach((c) => {
      c.disabled = true;
    });
    finalizeAnswer(question, wasCorrect);
  };
}

function handleOptionAnswer(chosenOption, chosenBtn) {
  const question = currentQueue[currentIndex];
  const optionButtons = [...el("lesson-options-grid").children];
  for (const btn of optionButtons) {
    btn.disabled = true;
  }

  const wasCorrect = chosenOption.isCorrect;
  if (wasCorrect) {
    chosenBtn.classList.add("lesson-option-btn--correct");
  } else {
    chosenBtn.classList.add("lesson-option-btn--incorrect");
    const correctIndex = question.options.findIndex((o) => o.isCorrect);
    optionButtons[correctIndex].classList.add("lesson-option-btn--correct");
  }

  finalizeAnswer(question, wasCorrect);
}

// Shared by every exercise type once an answer is locked in: scoring,
// mascot reaction, TTS, the replay button, advancing, and parent-sync
// logging.
function finalizeAnswer(question, wasCorrect) {
  question.wasCorrect = wasCorrect; // recorded for the lesson-completion mastery summary
  if (wasCorrect) currentScore += 1;

  const reactor = activeMascotForReaction(wasCorrect);
  const reactionAvatar = el("lesson-reaction-avatar");
  reactionAvatar.hidden = false;
  setMascotAvatar(reactionAvatar, reactor);
  const reactionLine = getRandomLine(wasCorrect ? CORRECT_REACTION_LINES : INCORRECT_REACTION_LINES);
  el("lesson-reaction-text").textContent = `${reactor}: ${reactionLine}`;

  // Always speak the actual correct answer out loud here (not just the
  // flavor line) — this is the one moment every question guarantees the
  // child hears it pronounced, whether they got it right or not.
  const spokenAnswer = getSpokenAnswer(question);
  speak(`${reactionLine} ${spokenAnswer}.`, KIDS_VOICE_OPTIONS);

  // Interactive replay — tap to hear the answer again as many times as wanted.
  const replayBtn = el("lesson-replay-btn");
  replayBtn.hidden = false;
  replayBtn.onclick = () => speak(spokenAnswer, KIDS_VOICE_OPTIONS);

  const isLast = currentIndex === currentQueue.length - 1;
  const nextBtn = el("lesson-next-btn");
  nextBtn.textContent = isLast ? "See my results! →" : "Next →";
  nextBtn.hidden = false;
  nextBtn.onclick = isLast ? finishLesson : advanceToNextQuestion;

  recordTurnForParentSync(session.state, {
    role: "user",
    text: `[Lesson: ${currentLesson.label}] ${questionTypeLabel(question.type)} "${getItemLabel(question)}" — ${wasCorrect ? "correct!" : "incorrect"}`,
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
  const tier = currentTierConfig();
  const bucket = currentStateBucket();

  const existing = bucket.completed[currentLesson.id];
  const masteredSet = new Set(existing ? existing[tier.masteryField] : []);
  // An item counts once it's been answered correctly at least once, in this
  // or any past attempt — a simple accumulating mastery set, not a full
  // per-attempt history (see plan's fast-follow for spaced repetition).
  for (const q of currentQueue) {
    if (q.wasCorrect) masteredSet.add(getItemLabel(q));
  }

  bucket.completed[currentLesson.id] = {
    bestScore: existing ? Math.max(existing.bestScore, score) : score,
    attempts: existing ? existing.attempts + 1 : 1,
    lastCompletedAt: new Date().toISOString(),
    [tier.masteryField]: [...masteredSet],
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

  const closer = activeMascotForComplete();
  setMascotAvatar(el("lesson-complete-avatar"), closer);
  el("lesson-complete-line").textContent = `${closer}: ${getLessonCompleteLine(score, total)}`;
  el("lesson-complete-score").textContent = `You got ${score} out of ${total}! 🎉`;

  if (newlyUnlocked.length > 0) {
    const badgeNames = newlyUnlocked.map((b) => `${b.emoji} ${b.label}`).join(", ");
    el("lesson-complete-score").textContent += ` New badge: ${badgeNames}!`;
  }

  el("lesson-chat-about-it-btn").onclick = () => {
    if (onChatAboutItCallback) {
      const items = currentLesson.words || currentLesson.sentences;
      onChatAboutItCallback({ label: currentLesson.label, words: items.map((w) => w.en) });
    }
  };
}
