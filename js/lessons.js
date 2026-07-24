import { saveState, saveRecapToDrive } from "./drive.js";
import { publishProgressDoc } from "./progress-doc.js";
import { parentEmailsForEmail } from "./profile.js";
import {
  getCategories,
  getStructuredLesson,
  getStructuredLessons,
  buildFiftyWordQueue,
  buildFiftySentenceQueue,
  buildFiftyGrammarQueue,
  migrateCompletions,
  needsMigration,
  EXERCISES_PER_LESSON,
} from "./lesson-structure.js";
import { syncProgress } from "./worker-client.js";
import { updateGamificationAfterLesson, BADGES } from "./gamification.js";
import { computeRewards, gamificationWithRewards, SCREEN_TIME_PER_LESSON_MIN } from "./rewards.js";
import {
  recordTurnForParentSync,
  todayLocalDateString,
  KIDS_VOICE_OPTIONS,
  MASCOT_VOICES,
  MASCOT_NAMES,
  getMascotPreference,
  setMascotPreference,
} from "./chat.js";
import { speak, recognizeOnce, isSpeechInputAvailable } from "./voice.js";
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
  ALL_BEGINNER_WORDS,
  BEGINNER_EXERCISE_TYPES,
  buildWordQuestion,
  ALL_INTERMEDIATE_SENTENCES,
  INTERMEDIATE_EXERCISE_TYPES,
  buildSentenceQuestion,
} from "./lessons-client.js";
import {
  buildDailyItems,
  recordAnswer,
  getEntry,
  srsStats,
  exerciseTypeForLevel,
} from "./srs.js";
import {
  ADVANCED_LESSONS,
  EXPERT_LESSONS,
  getAdvancedLesson,
  getExpertLesson,
  buildGrammarExerciseQueue,
  GRAMMAR_QUESTION_STEM_LINES,
} from "./grammar-client.js";

const MASCOT_AVATARS = {
  Bobo: { emoji: "🦫", img: "assets/socatei/bobo-face.png" },
  Fizz: { emoji: "🐿️", img: "assets/socatei/fizz-face.png" },
  Sushi: { emoji: "🐱", img: "assets/socatei/sushi-face.png" },
};

// One entry per contentTier — the only place that needs to grow when a new
// tier's lesson content ships.
const TIER_CONFIG = {
  beginner: {
    lessonSet: getStructuredLessons("beginner"),
    getLessonFn: (id) => getStructuredLesson("beginner", id),
    buildQueue: (lesson) => buildFiftyWordQueue(lesson, ALL_BEGINNER_WORDS),
    stemLines: QUESTION_STEM_LINES,
    stateKey: "lessons",
    masteryField: "wordsEverCorrect", // unchanged field name — matches existing saved Beginner data
    maxScore: () => EXERCISES_PER_LESSON,
    // Daily-practice (spaced repetition) support: the whole-tier item pool and
    // the exercise types a single item can be drilled with.
    pool: ALL_BEGINNER_WORDS,
    exerciseTypes: BEGINNER_EXERCISE_TYPES,
    itemLabel: (w) => w.en,
    buildQuestion: (item, pool, type) => buildWordQuestion(item, pool, type),
  },
  intermediate: {
    lessonSet: getStructuredLessons("intermediate"),
    getLessonFn: (id) => getStructuredLesson("intermediate", id),
    buildQueue: buildFiftySentenceQueue,
    stemLines: SENTENCE_QUESTION_STEM_LINES,
    stateKey: "lessonsIntermediate",
    masteryField: "itemsEverCorrect",
    maxScore: () => EXERCISES_PER_LESSON,
    pool: ALL_INTERMEDIATE_SENTENCES,
    exerciseTypes: INTERMEDIATE_EXERCISE_TYPES,
    itemLabel: (s) => s.en,
    buildQuestion: (item, pool, type) => buildSentenceQuestion(item, type),
  },
  advanced: {
    lessonSet: getStructuredLessons("advanced"),
    getLessonFn: (id) => getStructuredLesson("advanced", id),
    buildQueue: buildFiftyGrammarQueue,
    stemLines: GRAMMAR_QUESTION_STEM_LINES,
    stateKey: "lessonsAdvanced",
    masteryField: "itemsEverCorrect",
    maxScore: () => EXERCISES_PER_LESSON,
  },
  expert: {
    lessonSet: getStructuredLessons("expert"),
    getLessonFn: (id) => getStructuredLesson("expert", id),
    buildQueue: buildFiftyGrammarQueue,
    stemLines: GRAMMAR_QUESTION_STEM_LINES,
    stateKey: "lessonsExpert",
    masteryField: "itemsEverCorrect",
    maxScore: () => EXERCISES_PER_LESSON,
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
let isDailyPractice = false; // true while running a spaced-repetition session

function el(id) {
  return document.getElementById(id);
}

function currentTierConfig() {
  return TIER_CONFIG[session.profile.contentTier];
}

// Progress saved before the restructure is keyed by THEME id; the new lessons
// have their own ids. Without this, a child who had finished everything would
// open the app to an empty path and be asked to redo all of it.
//
// A new lesson is credited only when every theme inside it was already done, so
// nothing is granted that wasn't earned. The old record is kept under
// `legacyCompleted` — it is what the pre-restructure screen time was paid on,
// and throwing it away would make the history unauditable.
function applyStructureMigration() {
  const tierName = session.profile.contentTier;
  const config = TIER_CONFIG[tierName];
  if (!config) return; // adult profile — no lesson tier

  const bucket = session.state[config.stateKey];
  if (!bucket || !bucket.completed || !needsMigration(tierName, bucket.completed)) return;

  const { completed, migrated } = migrateCompletions(tierName, bucket.completed);
  const previousCount = Object.keys(bucket.completed).length;
  bucket.legacyCompleted = bucket.completed;
  bucket.legacyScreenTimeMin = previousCount * SCREEN_TIME_PER_LESSON_MIN;
  bucket.completed = completed;

  saveState(session.accessToken, session.fileId, session.state).catch((err) =>
    console.warn("Could not save the restructured progress:", err)
  );
  console.info(
    `[lessons] ${tierName}: ${previousCount} old lessons → ${migrated} new lessons of ${EXERCISES_PER_LESSON} exercises`
  );
}

function currentStateBucket() {
  return session.state[currentTierConfig().stateKey];
}

// A stable identifying label per exercise item (word, sentence, or grammar
// question), used for scoring/mastery tracking and parent-transcript lines —
// several question *types* can test the same item, so mastery is tracked per
// item, not per question instance.
function getItemLabel(question) {
  if (question.word) return question.word.en;
  if (question.sentence) return question.sentence.en;
  return question.mcq.q;
}

function getSpokenAnswer(question) {
  if (question.word) return question.word.en;
  if (question.sentence) return question.sentence.en;
  return question.options.find((o) => o.isCorrect).value;
}

// Romanian meaning of the tested item — the word/sentence banks already
// carry `ro` for every entry; grammar questions have none (returns null).
function getItemTranslation(question) {
  if (question.word) return question.word.ro;
  if (question.sentence) return question.sentence.ro;
  return null;
}

function questionTypeLabel(type) {
  switch (type) {
    case "picture": return "Picture match";
    case "listen": return "Listening";
    case "listen-sentence": return "Listening (sentence)";
    case "en-ro": return "English → Romanian";
    case "say": return "Pronunciation";
    case "say-sentence": return "Pronunciation (sentence)";
    case "spell": return "Spelling";
    case "translation": return "Translation match";
    case "fill-blank": return "Fill-in-the-blank";
    case "unscramble": return "Word order";
    case "picture-sentence": return "Picture-sentence match";
    case "grammar-mcq": return "Grammar challenge";
    default: return "Answered";
  }
}

function setMascotAvatar(imgEl, name) {
  const avatar = MASCOT_AVATARS[name];
  imgEl.src = avatar.img;
  imgEl.alt = name;
  // data-mascot drives the per-character face crop in CSS (Bobo's face is at
  // the top of his artwork, Fizz's is mid-image below his huge curled tail).
  imgEl.dataset.mascot = name;
  // Visible name caption under the portrait, when the avatar sits in a
  // .mascot-figure wrapper (all four lesson-screen avatars do).
  const caption = imgEl.parentElement && imgEl.parentElement.querySelector(".mascot-avatar-name");
  if (caption) caption.textContent = name;
  imgEl.onerror = function () {
    const fallback = document.createElement("span");
    fallback.className = "mascot-avatar mascot-avatar--emoji-fallback";
    fallback.textContent = avatar.emoji;
    this.replaceWith(fallback);
  };
}

// Speaks a line in a mascot's voice while animating that mascot's portrait —
// the avatar gets a "talking" wiggle for exactly as long as the TTS runs.
function speakAsMascot(text, voiceOpts, avatarEl) {
  speak(text, {
    ...voiceOpts,
    onstart: () => avatarEl && avatarEl.classList.add("mascot-talking"),
    onend: () => avatarEl && avatarEl.classList.remove("mascot-talking"),
  });
}

// Which mascot leads (asks the current question): a single-mascot preference
// always uses that one; "both" rotates through all three by question index so
// the child actually sees each of them take turns asking, rather than one
// dominating and the others only showing up to react.
function activeMascotForAsking(questionIndex) {
  const pref = getMascotPreference();
  if (MASCOT_NAMES.includes(pref)) return pref;
  return MASCOT_NAMES[questionIndex % MASCOT_NAMES.length];
}

// Which mascot reacts to an answer: with "both" (the default), Bobo
// celebrates correct answers and Fizz softens incorrect ones (their original
// personalities — Sushi leads questions instead, since her role is asking);
// picking a single mascot makes that one handle everything.
function activeMascotForReaction(wasCorrect) {
  const pref = getMascotPreference();
  if (MASCOT_NAMES.includes(pref)) return pref;
  return wasCorrect ? "Bobo" : "Fizz";
}

function activeMascotForComplete() {
  const pref = getMascotPreference();
  return MASCOT_NAMES.includes(pref) ? pref : "Fizz";
}

function updateLessonMascotSelectUi() {
  const preference = getMascotPreference();
  for (const pref of [...MASCOT_NAMES, "both"]) {
    el(`lesson-mascot-select-${pref.toLowerCase()}`).classList.toggle("mascot-select-btn--active", pref === preference);
  }
}

export function initLessons({ accessToken, userEmail, displayName, fileId, state, profile, onJustChat, onChatAboutIt }) {
  session = { accessToken, userEmail, displayName, fileId, state, profile };
  applyStructureMigration();
  onJustChatCallback = onJustChat;
  onChatAboutItCallback = onChatAboutIt;

  el("lesson-user-name").textContent = displayName;
  el("lesson-profile-tag").textContent = profile.displayName;
  el("lesson-header-avatar").textContent = (displayName[0] || "?").toUpperCase();
  el("lesson-just-chat-btn").textContent = profile.features.mascots
    ? "💬 Chat with the Socatei"
    : "💬 Back to chat";
  el("lesson-just-chat-btn").onclick = () => {
    if (onJustChatCallback) onJustChatCallback(null);
  };
  el("lesson-exit-btn").onclick = showMenu;
  el("lesson-back-to-menu-btn").onclick = showMenu;

  // Non-mascot tiers (Advanced/Expert) get a plain, grown-up presentation:
  // no mascot picker, no avatars anywhere on this screen.
  el("lesson-mascot-select-bar").hidden = !profile.features.mascots;

  if (!listenersInitialized) {
    listenersInitialized = true;
    for (const pref of [...MASCOT_NAMES, "both"]) {
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

// The bottom tab bar shows on the adventure-path home, but hides during an
// active exercise and the celebration screen so those stay focused (matches
// the redesign mockup). The nav is a shared element parented into this screen
// by app.js, so toggling its `hidden` here is enough.
function setNavVisible(visible) {
  const nav = document.getElementById("app-nav");
  if (nav) nav.hidden = !visible;
}

// Local YYYY-MM-DD for a Date (matches gamification's date keys exactly, so
// the week strip lines up with the recorded practice days).
function localDateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// The "days practised" zone on the home screen: current run of days-in-a-row,
// a strip of the last 7 days (lit for each day practised), and the running
// totals. Shown for any learner profile with gamification.
function renderStreakCard() {
  const card = el("lesson-streak-card");
  // Guard: an older/cached index.html may not have this element yet. Bail out
  // quietly instead of throwing, which would break the whole lesson menu.
  if (!card) return;
  const g = session.state.gamification;
  if (!g || !session.profile.features.gamification) {
    card.hidden = true;
    return;
  }

  const practiced = new Set(g.practiceDays || []);
  const initials = ["D", "L", "Ma", "Mi", "J", "V", "S"]; // getDay(): 0=Sun..6=Sat
  const today = new Date();

  let strip = "";
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const done = practiced.has(localDateKey(d));
    const cls = `streak-day${done ? " streak-day--done" : ""}${i === 0 ? " streak-day--today" : ""}`;
    strip += `<div class="${cls}"><span class="streak-dot"></span><span class="streak-day-label">${initials[d.getDay()]}</span></div>`;
  }

  const streak = g.currentStreak || 0;
  card.innerHTML =
    `<div class="streak-head">` +
    `<span class="streak-flame">🔥</span>` +
    `<div class="streak-headtext">` +
    `<div class="streak-count">${streak} ${streak === 1 ? "zi" : "zile"} la rând!</div>` +
    `<div class="streak-sub">📅 ${g.totalActiveDays || 0} zile în total · 🏆 record ${g.longestStreak || 0}</div>` +
    `</div></div>` +
    `<div class="streak-week">${strip}</div>`;
  card.hidden = false;
}

// The daily-practice entry point: how many words are due for review today plus
// how many brand-new ones are waiting, and a button to start. This is what
// brings a child back day after day once the themed lessons are all played.
function renderDailyCard() {
  const card = el("lesson-daily-card");
  if (!card) return;
  const tier = currentTierConfig();
  if (!tier.pool) {
    card.hidden = true;
    return;
  }

  const contentTier = session.profile.contentTier;
  const labels = tier.pool.map(tier.itemLabel);
  const stats = srsStats(session.state, contentTier, labels);
  const { due, fresh } = buildDailyItems(session.state, contentTier, labels, { maxDue: 14, maxNew: 6 });
  const sessionSize = due.length + fresh.length;

  card.innerHTML = "";

  const title = document.createElement("p");
  title.className = "daily-card-title";
  title.textContent = "🎯 Practica de azi";
  card.appendChild(title);

  const line = document.createElement("p");
  line.className = "daily-card-line";
  line.textContent = sessionSize
    ? `${due.length} de repetat · ${fresh.length} cuvinte noi`
    : "Ai terminat tot pentru azi — revino mâine! 🎉";
  card.appendChild(line);

  const progress = document.createElement("p");
  progress.className = "daily-card-progress";
  progress.textContent = `🌟 ${stats.mastered} știute · 📚 ${stats.learning} în lucru · din ${stats.total}`;
  card.appendChild(progress);

  if (sessionSize) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn-primary daily-card-btn";
    btn.textContent = `Începe (${sessionSize})`;
    btn.addEventListener("click", startDailyPractice);
    card.appendChild(btn);
  }

  card.hidden = false;
}

function showMenu() {
  el("lesson-menu-view").hidden = false;
  el("lesson-exercise-view").hidden = true;
  el("lesson-complete-view").hidden = true;
  setNavVisible(true);

  // .closest, not .parentElement — the avatar now sits inside a
  // .mascot-figure wrapper (for the name caption), so its parent is no
  // longer the intro row itself.
  const menuIntroRow = el("lesson-menu-avatar").closest(".lesson-mascot-intro");
  if (session.profile.features.mascots) {
    menuIntroRow.hidden = false;
    // Not tied to a question index here (there isn't one yet) — pick randomly
    // for "both" so repeat visits to the menu show some variety too.
    const asker = activeMascotForAsking(Math.random() < 0.5 ? 0 : 1);
    setMascotAvatar(el("lesson-menu-avatar"), asker);
    el("lesson-menu-intro-line").textContent = `${asker}: ${getRandomLine(LESSON_MENU_INTRO_LINES)}`;
  } else {
    menuIntroRow.hidden = true;
  }

  renderDailyCard();
  renderRewardsCard();
  renderStreakCard();

  const tier = currentTierConfig();
  const bucket = currentStateBucket();
  const grid = el("lesson-menu-grid");
  grid.className = "lesson-path";
  grid.innerHTML = "";

  // Adventure path: a vertical trail of circular lesson nodes. Completed ones
  // are coloured with their star count; the first not-yet-finished lesson is
  // marked "current" (pulsing). Every node stays tappable — no hard locking,
  // so kids keep the freedom to replay or jump ahead.
  // The path is now split into CATEGORIES, each introduced by a banner showing
  // how far the child is inside that group. Without the banners a 17-node trail
  // reads as one endless list; with them it reads as five short journeys.
  let currentMarked = false;
  let nodeIndex = 0;

  for (const category of getCategories(session.profile.contentTier)) {
    const doneInCategory = category.lessons.filter((l) => bucket.completed[l.id]).length;

    const banner = document.createElement("div");
    banner.className = "lesson-category";
    if (doneInCategory === category.lessons.length) banner.classList.add("lesson-category--done");

    const badge = document.createElement("span");
    badge.className = "lesson-category-emoji";
    badge.textContent = category.emoji;
    banner.appendChild(badge);

    const titles = document.createElement("span");
    titles.className = "lesson-category-text";
    const name = document.createElement("strong");
    name.textContent = category.label;
    const count = document.createElement("small");
    count.textContent = `${doneInCategory}/${category.lessons.length} lecții`;
    titles.append(name, count);
    banner.appendChild(titles);

    grid.appendChild(banner);

    for (const lesson of category.lessons) {
      const record = bucket.completed[lesson.id];
      const maxScore = tier.maxScore(lesson);

      const node = document.createElement("button");
      node.type = "button";
      node.className = "lesson-node";
      // zig-zag left/right, continuing across categories so the trail stays one line
      node.style.setProperty("--node-shift", nodeIndex % 2 === 0 ? "36px" : "-36px");
      nodeIndex++;
      if (record) {
        node.classList.add("lesson-node--done");
      } else if (!currentMarked) {
        node.classList.add("lesson-node--current");
        currentMarked = true;
      }

      const circle = document.createElement("span");
      circle.className = "lesson-node-circle";
      circle.textContent = lesson.emoji || "📘";
      node.appendChild(circle);

      const label = document.createElement("span");
      label.className = "lesson-node-label";
      label.textContent = lesson.label;
      node.appendChild(label);

      const stars = document.createElement("span");
      stars.className = "lesson-node-stars";
      stars.textContent = record ? ("⭐".repeat(starsForScore(record.bestScore, maxScore)) || "·") : "";
      node.appendChild(stars);

      node.addEventListener("click", () => startLesson(lesson.id));
      grid.appendChild(node);
    }
  }
}

// The reward ladder agreed with the parents, always visible above the lesson
// grid so the child sees exactly what finishing the module is worth: screen
// time per lesson, and the level's money bonus at 100%.
function renderRewardsCard() {
  const card = el("lesson-rewards-card");
  if (!card) return; // older/cached index.html without this element — skip, don't crash
  const rewards = computeRewards(session.state, session.profile.contentTier);
  if (!rewards) {
    card.hidden = true;
    return;
  }

  card.innerHTML = "";

  const heading = document.createElement("p");
  heading.className = "rewards-card-heading";
  heading.textContent = "🏆 My rewards · Recompensele mele";
  card.appendChild(heading);

  const track = document.createElement("div");
  track.className = "progress-track rewards-progress-track";
  const fill = document.createElement("div");
  fill.className = "progress-fill";
  fill.style.width = `${Math.min(100, (rewards.lessonsCompleted / rewards.totalLessons) * 100)}%`;
  track.appendChild(fill);
  card.appendChild(track);

  const progressLine = document.createElement("p");
  progressLine.className = "rewards-row";
  progressLine.textContent = `📚 ${rewards.lessonsCompleted} / ${rewards.totalLessons} lessons done · lecții terminate`;
  card.appendChild(progressLine);

  const screenTimeLine = document.createElement("p");
  screenTimeLine.className = "rewards-row";
  screenTimeLine.textContent = `⏱ +${SCREEN_TIME_PER_LESSON_MIN} min screen time per lesson · Timp câștigat: ${rewards.screenTimeMin} min`;
  card.appendChild(screenTimeLine);

  const bonusLine = document.createElement("p");
  bonusLine.className = "rewards-row rewards-row--bonus";
  if (rewards.bonusEarned) {
    bonusLine.classList.add("rewards-row--earned");
    bonusLine.textContent = `🎁 BONUS UNLOCKED: ${rewards.bonusLei} lei! · Bonus deblocat — spune-le părinților!`;
  } else {
    bonusLine.textContent = `🎁 Finish all ${rewards.totalLessons} → ${rewards.bonusLei} lei bonus · Termină tot modulul pentru bonus!`;
  }
  card.appendChild(bonusLine);

  card.hidden = false;
}

// Shared thresholds for the menu cards and the complete screen:
// 3 stars >= 90%, 2 >= 70%, 1 >= 50%, 0 below.
function starsForScore(score, max) {
  const ratio = score / max;
  if (ratio >= 0.9) return 3;
  if (ratio >= 0.7) return 2;
  if (ratio >= 0.5) return 1;
  return 0;
}

// Today's spaced-repetition session: everything due for review, topped up with
// a few brand-new words. Each item is drilled with an exercise type matched to
// how well it is already known (recognition first, production once it sticks),
// so the same vocabulary keeps producing fresh practice for months.
function startDailyPractice() {
  const tier = currentTierConfig();
  if (!tier.pool) return;
  const contentTier = session.profile.contentTier;

  const labels = tier.pool.map(tier.itemLabel);
  const { all } = buildDailyItems(session.state, contentTier, labels, { maxDue: 14, maxNew: 6 });
  if (all.length === 0) return;

  const byLabel = new Map(tier.pool.map((i) => [tier.itemLabel(i), i]));
  const questions = all.map((label) => {
    const item = byLabel.get(label);
    const entry = getEntry(session.state, contentTier, label);
    const type = exerciseTypeForLevel(entry ? entry.level : 0, tier.exerciseTypes);
    return tier.buildQuestion(item, tier.pool, type);
  });

  // Fisher-Yates so review and new items are interleaved, not grouped.
  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]];
  }

  isDailyPractice = true;
  currentLesson = { id: "__daily__", label: "Practica de azi" };
  currentQueue = questions;
  currentIndex = 0;
  currentScore = 0;

  el("lesson-menu-view").hidden = true;
  el("lesson-exercise-view").hidden = false;
  el("lesson-complete-view").hidden = true;
  setNavVisible(false);

  renderQuestion();
}

function startLesson(lessonId) {
  const tier = currentTierConfig();
  isDailyPractice = false;
  currentLesson = tier.getLessonFn(lessonId);
  currentQueue = tier.buildQueue(currentLesson);
  currentIndex = 0;
  currentScore = 0;

  currentStateBucket().lastLessonId = lessonId;

  el("lesson-menu-view").hidden = true;
  el("lesson-exercise-view").hidden = false;
  el("lesson-complete-view").hidden = true;
  setNavVisible(false);

  renderQuestion();
}

function renderQuestion() {
  const question = currentQueue[currentIndex];
  const tier = currentTierConfig();
  el("lesson-progress-label").textContent = `${currentIndex + 1} / ${currentQueue.length}`;
  el("lesson-progress-fill").style.width = `${((currentIndex + 1) / currentQueue.length) * 100}%`;

  const usesMascots = session.profile.features.mascots;
  const asker = usesMascots ? activeMascotForAsking(currentIndex) : null;
  const promptAvatar = el("lesson-prompt-avatar");
  if (usesMascots) {
    promptAvatar.hidden = false;
    setMascotAvatar(promptAvatar, asker);
    el("lesson-prompt-text").textContent = `${asker}: ${getRandomLine(tier.stemLines[question.type])}`;
  } else {
    promptAvatar.hidden = true;
    el("lesson-prompt-text").textContent = getRandomLine(tier.stemLines[question.type]);
  }

  // Reset per-question interactive state shared by every type.
  el("lesson-reaction-avatar").hidden = true;
  el("lesson-reaction-line").textContent = "";
  el("lesson-translation-line").hidden = true;
  el("lesson-replay-btn").hidden = true;
  el("lesson-next-btn").hidden = true;
  promptAvatar.style.cursor = "default";
  promptAvatar.onclick = null;

  const stem = el("lesson-question-stem");
  const optionsGrid = el("lesson-options-grid");
  const unscrambleArea = el("lesson-unscramble-area");
  const sayArea = el("lesson-say-area");
  if (sayArea) sayArea.hidden = true;

  if (question.type === "unscramble") {
    stem.hidden = true;
    optionsGrid.hidden = true;
    unscrambleArea.hidden = false;
    renderUnscramble(question, { target: question.sentence.en, joiner: " " });
    return;
  }

  // Spelling: build the English word letter by letter. The prompt shows the
  // picture and the Romanian meaning — never the English, that IS the answer.
  if (question.type === "spell") {
    stem.hidden = false;
    stem.textContent = `${question.word.emoji}  ${question.word.ro}`;
    stem.className = "lesson-question-stem lesson-question-stem--spell";
    stem.style.cursor = "default";
    stem.onclick = null;
    optionsGrid.hidden = true;
    unscrambleArea.hidden = false;
    renderUnscramble(question, { target: question.word.en, joiner: "" });
    return;
  }

  // Pronunciation: show the text, model it out loud, then let the child say it.
  if (question.type === "say" || question.type === "say-sentence") {
    const target = question.type === "say" ? question.word.en : question.sentence.en;
    stem.hidden = false;
    stem.textContent = target;
    stem.className = `lesson-question-stem lesson-question-stem--${question.type}`;
    optionsGrid.hidden = true;
    unscrambleArea.hidden = true;

    // Hear it first, then repeat it — model before production.
    const askerVoice = MASCOT_VOICES[asker] || KIDS_VOICE_OPTIONS;
    stem.style.cursor = "pointer";
    stem.onclick = () => speakAsMascot(target, askerVoice, promptAvatar);
    speakAsMascot(target, askerVoice, promptAvatar);

    renderSayExercise(question, target);
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
  } else if (question.type === "listen") {
    // Listening drill: the WORD is the audio, never shown as text.
    stem.textContent = "🔊";
    spokenTarget = question.word.en;
    canReplayNow = true;
  } else if (question.type === "en-ro") {
    // English shown, pick the Romanian meaning — hearing it helps, and the
    // answer (Romanian) isn't given away.
    stem.textContent = question.word.en;
    spokenTarget = question.word.en;
    canReplayNow = true;
  } else if (question.type === "listen-sentence") {
    stem.textContent = "🔊";
    spokenTarget = question.sentence.en;
    canReplayNow = true;
  } else if (question.type === "translation") {
    stem.textContent = question.word.ro;
  } else if (question.type === "fill-blank") {
    stem.textContent = question.sentence.blankSentence;
  } else if (question.type === "picture-sentence") {
    stem.textContent = question.sentence.emoji;
  } else if (question.type === "grammar-mcq") {
    stem.textContent = question.mcq.q;
  }
  stem.className = `lesson-question-stem lesson-question-stem--${question.type}`;

  // Only "picture" (Beginner) questions are replayable pre-answer — the
  // English word is already shown as the stem, so hearing it reinforces
  // pronunciation without giving away the answer (the answer is the
  // picture/sentence). Fill-blank/translation/picture-sentence would reveal
  // or mispronounce (Romanian, en-US TTS) the answer if spoken before
  // answering, so they stay silent until the reaction (see finalizeAnswer).
  if (canReplayNow) {
    // Spoken in the asking mascot's own voice, so who you see is who you hear.
    const askerVoice = MASCOT_VOICES[asker] || KIDS_VOICE_OPTIONS;
    promptAvatar.style.cursor = "pointer";
    promptAvatar.onclick = () => speakAsMascot(spokenTarget, askerVoice, promptAvatar);
    stem.style.cursor = "pointer";
    stem.onclick = () => speakAsMascot(spokenTarget, askerVoice, promptAvatar);
    speakAsMascot(spokenTarget, askerVoice, promptAvatar);
  } else {
    stem.style.cursor = "default";
    stem.onclick = null;
  }

  // Full-sentence options need a single column and smaller text to stay
  // readable; word/emoji options keep the bigger two-column layout.
  const hasLongOptions =
    question.type === "picture-sentence" ||
    (question.type === "grammar-mcq" && question.options.some((o) => o.value.length > 18));
  optionsGrid.classList.toggle("lesson-options-grid--sentences", hasLongOptions);
  // "picture" is the only type whose OPTIONS are emoji (pick the picture for the
  // word) — render those big so a child can actually tell them apart.
  optionsGrid.classList.toggle(
    "lesson-options-grid--emoji",
    question.type === "picture" || question.type === "listen"
  );

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
// Tap-to-build interaction, shared by two exercise types: "unscramble" joins
// WORD chips with spaces to rebuild a sentence, "spell" joins LETTER chips with
// nothing to rebuild a word. Only the target string and the joiner differ.
function renderUnscramble(question, { target, joiner = " " } = {}) {
  const bank = el("lesson-unscramble-bank");
  const build = el("lesson-unscramble-build");
  const checkBtn = el("lesson-unscramble-check-btn");
  const placedIndexes = [];
  const isLetters = joiner === "";

  function draw() {
    bank.innerHTML = "";
    question.tokens.forEach((token, idx) => {
      if (placedIndexes.includes(idx)) return;
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = isLetters ? "word-chip word-chip--letter" : "word-chip";
      chip.textContent = token === " " ? "␣" : token;
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
      chip.className = isLetters ? "word-chip word-chip--placed word-chip--letter" : "word-chip word-chip--placed";
      chip.textContent = question.tokens[idx] === " " ? "␣" : question.tokens[idx];
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
    const built = placedIndexes.map((idx) => question.tokens[idx]).join(joiner);
    const wasCorrect = built === target;
    if (!wasCorrect) {
      build.querySelectorAll(".word-chip").forEach((c) => c.classList.add("word-chip--wrong-order"));
    }
    [...bank.children, ...build.children].forEach((c) => {
      c.disabled = true;
    });
    finalizeAnswer(question, wasCorrect);
  };
}

// Deliberately forgiving: a child's accent plus browser speech recognition is
// never exact. A single word passes if any alternative contains it; a sentence
// passes when most of its words came through. Better to encourage than to fail
// a child who actually said it fine.
function matchesSpoken(heard, target) {
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
  const wanted = norm(target);
  if (!wanted) return false;
  const alternatives = String(heard || "").split("|").map(norm).filter(Boolean);
  if (!alternatives.length) return false;

  const wantedWords = wanted.split(" ");
  for (const alt of alternatives) {
    if (alt === wanted || alt.includes(wanted)) return true;
    if (wantedWords.length > 1) {
      const altWords = new Set(alt.split(" "));
      const hits = wantedWords.filter((w) => altWords.has(w)).length;
      if (hits / wantedWords.length >= 0.6) return true;
    }
  }
  return false;
}

function renderSayExercise(question, target) {
  const sayArea = el("lesson-say-area");
  const micBtn = el("lesson-mic-btn");
  const status = el("lesson-say-status");
  const skipBtn = el("lesson-say-skip-btn");
  if (!sayArea || !micBtn) return;

  sayArea.hidden = false;
  micBtn.disabled = false;
  micBtn.classList.remove("mic-btn--listening");
  skipBtn.hidden = false;

  const supported = isSpeechInputAvailable();

  if (!supported) {
    // No speech recognition on this browser: fall back to an honest self-check
    // rather than pretending to grade something we cannot hear.
    micBtn.textContent = "✅";
    status.textContent = "Spune cuvântul cu voce tare, apoi apasă ✅";
    micBtn.onclick = () => {
      sayArea.hidden = true;
      finalizeAnswer(question, true);
    };
  } else {
    micBtn.textContent = "🎤";
    status.textContent = "Apasă microfonul și spune-l! 🎤";
    micBtn.onclick = async () => {
      micBtn.disabled = true;
      micBtn.classList.add("mic-btn--listening");
      status.textContent = "Te ascult... 🎧";
      try {
        const heard = await recognizeOnce({ lang: "en-US" });
        const wasCorrect = matchesSpoken(heard, target);
        const first = String(heard || "").split("|")[0].trim();
        status.textContent = first ? `Am auzit: „${first}"` : "Nu am auzit nimic 😅";
        sayArea.hidden = true;
        finalizeAnswer(question, wasCorrect);
      } catch {
        // Mic blocked or unavailable — never trap the child on this question.
        micBtn.disabled = false;
        micBtn.classList.remove("mic-btn--listening");
        status.textContent = "Microfonul nu a mers. Poți sări peste. 🙂";
      }
    };
  }

  skipBtn.onclick = () => {
    sayArea.hidden = true;
    finalizeAnswer(question, false); // counts as missed, so it comes back sooner
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

  // Feed the spaced-repetition schedule from EVERY answer — a normal themed
  // lesson advances mastery just like the daily review does, so the two share
  // one memory of what this child actually knows.
  if (currentTierConfig().pool) {
    recordAnswer(session.state, session.profile.contentTier, getItemLabel(question), wasCorrect);
  }

  const usesMascots = session.profile.features.mascots;
  const reactionAvatar = el("lesson-reaction-avatar");
  const spokenAnswer = getSpokenAnswer(question);
  let replayVoice;

  if (usesMascots) {
    const reactor = activeMascotForReaction(wasCorrect);
    reactionAvatar.hidden = false;
    setMascotAvatar(reactionAvatar, reactor);
    // One-shot emotional reaction on the portrait: a happy jump for a correct
    // answer, a sympathetic head-wobble for a miss. Class removed + reflow so
    // the animation replays on every answer, not just the first.
    reactionAvatar.classList.remove("mascot-celebrate", "mascot-sad");
    void reactionAvatar.offsetWidth;
    reactionAvatar.classList.add(wasCorrect ? "mascot-celebrate" : "mascot-sad");
    const reactionLine = getRandomLine(wasCorrect ? CORRECT_REACTION_LINES : INCORRECT_REACTION_LINES);
    el("lesson-reaction-line").textContent = `${reactor}: ${reactionLine}`;

    // Bilingual reinforcement for the mascot tiers — every answer shows the
    // English item with its Romanian meaning, right in the speech bubble.
    const translation = getItemTranslation(question);
    if (translation) {
      el("lesson-translation-line").textContent = `🇬🇧 ${getItemLabel(question)}  =  🇷🇴 ${translation}`;
      el("lesson-translation-line").hidden = false;
    }

    // Always speak the actual correct answer out loud here (not just the
    // flavor line) — this is the one moment every question guarantees the
    // child hears it pronounced, whether they got it right or not. Spoken in
    // the reacting mascot's own voice (Bobo vs Fizz sound different).
    replayVoice = MASCOT_VOICES[reactor] || KIDS_VOICE_OPTIONS;
    speakAsMascot(`${reactionLine} ${spokenAnswer}.`, replayVoice, reactionAvatar);
  } else {
    // Grown-up tiers: no mascots, and the WHY matters more than cheering —
    // show the authored explanation when the question has one.
    reactionAvatar.hidden = true;
    const verdict = wasCorrect ? "Correct!" : "Not quite.";
    const explanation = question.mcq && question.mcq.explain ? ` ${question.mcq.explain}` : "";
    el("lesson-reaction-line").textContent = `${verdict}${explanation}`;
    replayVoice = {}; // default voice, normal pitch — no cartoon voice for teens
    speak(spokenAnswer, replayVoice);
  }

  // Interactive replay — tap to hear the answer again as many times as wanted.
  const replayBtn = el("lesson-replay-btn");
  replayBtn.hidden = false;
  replayBtn.onclick = () =>
    usesMascots ? speakAsMascot(spokenAnswer, replayVoice, reactionAvatar) : speak(spokenAnswer, replayVoice);

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

  // Snapshot before recording the completion, so a first-time completion of
  // the final lesson is detectable as "the bonus was JUST earned".
  const rewardsBefore = computeRewards(session.state, session.profile.contentTier);

  // The daily review isn't a themed lesson, so there is no lesson to mark as
  // completed — its progress lives entirely in the spaced-repetition schedule
  // (already updated per answer in finalizeAnswer).
  const existing = isDailyPractice ? null : bucket.completed[currentLesson.id];
  if (!isDailyPractice) {
    const masteredSet = new Set(existing ? existing[tier.masteryField] : []);
    // An item counts once it's been answered correctly at least once, in this
    // or any past attempt — a simple accumulating mastery set.
    for (const q of currentQueue) {
      if (q.wasCorrect) masteredSet.add(getItemLabel(q));
    }

    bucket.completed[currentLesson.id] = {
      bestScore: existing ? Math.max(existing.bestScore, score) : score,
      attempts: existing ? existing.attempts + 1 : 1,
      lastCompletedAt: new Date().toISOString(),
      [tier.masteryField]: [...masteredSet],
    };
  }

  const newlyUnlocked = updateGamificationAfterLesson(session.state);
  renderGamificationBar();

  const rewards = computeRewards(session.state, session.profile.contentTier);
  const isFirstCompletion = !existing;
  const bonusJustEarned = !!(rewards && rewards.bonusEarned && rewardsBefore && !rewardsBefore.bonusEarned);

  recordTurnForParentSync(session.state, {
    role: "assistant",
    text: `[Lesson: ${currentLesson.label}] Finished with ${score}/${total} correct. 🎉`,
    ts: new Date().toISOString(),
  });

  // The parent transcript is where rewards get "cashed in" — log them as
  // explicit lines the parent can act on.
  if (rewards && isFirstCompletion) {
    recordTurnForParentSync(session.state, {
      role: "assistant",
      text: `[Reward] First completion of "${currentLesson.label}" — earned +${SCREEN_TIME_PER_LESSON_MIN} min screen time (total earned: ${rewards.screenTimeMin} min).`,
      ts: new Date().toISOString(),
    });
  }
  if (bonusJustEarned) {
    recordTurnForParentSync(session.state, {
      role: "assistant",
      text: `[Reward] 🎁 MODULE COMPLETE — all ${rewards.totalLessons} lessons of the ${rewards.tier} level done. The agreed bonus is ${rewards.bonusLei} lei!`,
      ts: new Date().toISOString(),
    });
  }

  saveState(session.accessToken, session.fileId, session.state);

  // Publishes the parent-readable report into the child's own Drive. Throttled
  // to once a day inside publishProgressDoc, so calling it after every lesson
  // costs nothing. Deliberately fire-and-forget: the child moves straight on to
  // the completion screen regardless of what Drive does.
  const parentEmails = parentEmailsForEmail(session.userEmail);
  if (parentEmails.length) {
    publishProgressDoc({
      accessToken: session.accessToken,
      state: session.state,
      memberName: session.displayName,
      profileId: session.profile.id,
      parentEmails,
    })
      .then(({ changed }) => {
        // The doc's id and share list live in the state file, so a successful
        // publish has to be persisted or the next session makes a second doc.
        if (changed) saveState(session.accessToken, session.fileId, session.state);
      })
      .catch((err) => console.warn("Progress report failed (non-fatal):", err));
  }

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

  showComplete(score, total, newlyUnlocked, { rewards, isFirstCompletion, bonusJustEarned });
}

function showComplete(score, total, newlyUnlocked, rewardInfo = {}) {
  el("lesson-exercise-view").hidden = true;
  el("lesson-complete-view").hidden = false;
  setNavVisible(false);

  const completeAvatar = el("lesson-complete-avatar");
  if (session.profile.features.mascots) {
    completeAvatar.hidden = false;
    const closer = activeMascotForComplete();
    setMascotAvatar(completeAvatar, closer);
    // A different silly little "antic" (spin, jump, backflip...) every time, so
    // finishing a lesson always ends with Bobo or Fizz doing something fun.
    const antic = playMascotAntic(completeAvatar);
    el("lesson-complete-line").textContent = `${closer}: ${antic} ${getLessonCompleteLine(score, total)}`;
  } else {
    completeAvatar.hidden = true;
    el("lesson-complete-line").textContent = getLessonCompleteLine(score, total);
  }

  const starRow = el("lesson-complete-stars");
  starRow.hidden = false;
  const earned = starsForScore(score, total);
  [...starRow.children].forEach((star) => star.classList.remove("star--filled"));
  void starRow.offsetWidth; // force reflow so the pop animation replays on repeat completions
  [...starRow.children].forEach((star, idx) => {
    if (idx < earned) star.classList.add("star--filled");
  });

  el("lesson-complete-score").textContent = `You got ${score} out of ${total}! 🎉`;

  if (newlyUnlocked.length > 0) {
    const badgeNames = newlyUnlocked.map((b) => `${b.emoji} ${b.label}`).join(", ");
    el("lesson-complete-score").textContent += ` New badge: ${badgeNames}!`;
  }

  renderCompleteRewards(rewardInfo);
  renderLessonSummary();
  wireSaveRecapButton(score, total);

  if (session.profile.features.mascots) launchConfetti();

  el("lesson-chat-about-it-btn").textContent = session.profile.features.mascots
    ? "💬 Chat about it with the Socatei"
    : "💬 Chat about what you practiced";
  el("lesson-chat-about-it-btn").onclick = () => {
    if (onChatAboutItCallback) {
      // What "today's words" means per tier: the word bank, the sentence
      // bank, or (for grammar lessons) each question's correct answer.
      let words;
      if (currentLesson.words) words = currentLesson.words.map((w) => w.en);
      else if (currentLesson.sentences) words = currentLesson.sentences.map((s) => s.en);
      else words = currentLesson.questions.map((q) => q.options[q.correct]);
      onChatAboutItCallback({ label: currentLesson.label, words });
    }
  };
}

// Reward callout on the complete screen: the screen time just earned, the
// running totals, and — the big one — the module bonus the moment the last
// lesson of the tier is first completed.
function renderCompleteRewards({ rewards, isFirstCompletion, bonusJustEarned }) {
  const box = el("lesson-complete-rewards");
  if (!rewards) {
    box.hidden = true;
    return;
  }

  box.innerHTML = "";

  const timeLine = document.createElement("p");
  timeLine.className = "rewards-row";
  timeLine.textContent = isFirstCompletion
    ? `⏱ +${SCREEN_TIME_PER_LESSON_MIN} min screen time earned! · Ai câștigat +${SCREEN_TIME_PER_LESSON_MIN} min de tehnologie! (total: ${rewards.screenTimeMin} min)`
    : `⏱ Lesson already counted — screen time earned so far: ${rewards.screenTimeMin} min · Timp câștigat până acum: ${rewards.screenTimeMin} min`;
  box.appendChild(timeLine);

  if (bonusJustEarned) {
    const bonusLine = document.createElement("p");
    bonusLine.className = "rewards-row rewards-row--bonus rewards-row--earned";
    bonusLine.textContent = `🎁 MODULE COMPLETE! Bonus unlocked: ${rewards.bonusLei} lei! · Ai terminat tot modulul — spune-le părinților!`;
    box.appendChild(bonusLine);
  } else {
    const towardLine = document.createElement("p");
    towardLine.className = "rewards-row";
    towardLine.textContent = `📚 ${rewards.lessonsCompleted} / ${rewards.totalLessons} lessons toward the ${rewards.bonusLei} lei bonus · lecții spre bonus`;
    box.appendChild(towardLine);
  }

  box.hidden = false;
}

// A random playful "antic" the mascot performs on the completion screen — a
// spin, a jump, a wobbly backflip. The CSS class drives the motion; the
// returned text is the matching action shown in the speech bubble, so what the
// child SEES and READS agree. A fresh pick each time keeps it a little surprise.
const MASCOT_ANTICS = [
  { cls: "antic-spin", action: "*does a big happy spin*" },
  { cls: "antic-jump", action: "*bounces up and down*" },
  { cls: "antic-wiggle", action: "*wiggles like jelly*" },
  { cls: "antic-tada", action: "*strikes a superhero pose*" },
  { cls: "antic-flip", action: "*does a wobbly backflip*" },
];

function playMascotAntic(avatarEl) {
  for (const a of MASCOT_ANTICS) avatarEl.classList.remove(a.cls);
  void avatarEl.offsetWidth; // reflow so the animation replays on repeat completions
  const pick = MASCOT_ANTICS[Math.floor(Math.random() * MASCOT_ANTICS.length)];
  avatarEl.classList.add(pick.cls);
  return pick.action;
}

// Celebration confetti when a lesson finishes on the mascot tiers — pure
// DOM + CSS, no library. Skipped entirely for users who prefer reduced
// motion.
function launchConfetti() {
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const colors = ["#58cc02", "#1cb0f6", "#ffc800", "#ff4b4b", "#ce82ff", "#ff9600"];
  for (let i = 0; i < 40; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.background = colors[i % colors.length];
    piece.style.animationDuration = `${2 + Math.random() * 1.6}s`;
    piece.style.animationDelay = `${Math.random() * 0.5}s`;
    document.body.appendChild(piece);
    piece.addEventListener("animationend", () => piece.remove());
  }
}

// Aggregates the finished run per ITEM (a word/sentence appears in 2-3
// different question types): "knew" = every question about it answered
// correctly, "practice" = missed at least once. Shared by the on-screen
// recap and the Drive export.
function summarizeRun() {
  const byItem = new Map();
  for (const q of currentQueue) {
    const label = getItemLabel(q);
    let entry = byItem.get(label);
    if (!entry) {
      entry = {
        label,
        translation: getItemTranslation(q),
        answer: getSpokenAnswer(q),
        explain: q.mcq && q.mcq.explain ? q.mcq.explain : null,
        anyWrong: false,
      };
      byItem.set(label, entry);
    }
    if (!q.wasCorrect) entry.anyWrong = true;
  }
  return {
    knew: [...byItem.values()].filter((e) => !e.anyWrong),
    practice: [...byItem.values()].filter((e) => e.anyWrong),
  };
}

// Plain-text version of the recap, exported to the user's visible Google
// Drive as a Google Doc via the 💾 button on the complete screen.
function buildRecapText(score, total) {
  const { knew, practice } = summarizeRun();
  const lines = [];
  lines.push(`Lesson recap · Rezumatul lecției`);
  lines.push(`Student: ${session.displayName}`);
  lines.push(`Lesson · Lecția: ${currentLesson.label} (${session.profile.displayName})`);
  lines.push(`Date · Data: ${todayLocalDateString()}`);
  lines.push(`Score · Scor: ${score} / ${total} (${"⭐".repeat(starsForScore(score, total)) || "—"})`);
  lines.push("");
  if (knew.length) {
    lines.push(`✅ Knew these · Le-a știut:`);
    for (const e of knew) {
      lines.push(e.translation ? `  • ${e.label} — ${e.translation}` : `  • ${e.answer}`);
    }
    lines.push("");
  }
  if (practice.length) {
    lines.push(`🔁 Practice again · De mai exersat:`);
    for (const e of practice) {
      if (e.translation) lines.push(`  • ${e.label} — ${e.translation}`);
      else if (e.explain) lines.push(`  • ${e.answer} — ${e.explain}`);
      else lines.push(`  • ${e.answer}`);
    }
    lines.push("");
  }
  lines.push(
    practice.length === 0
      ? "🎉 Perfect run — every single one! · Totul corect!"
      : `💪 Finished the whole lesson — ${practice.length} item(s) to catch next time. · A terminat toată lecția!`
  );
  return lines.join("\n");
}

function wireSaveRecapButton(score, total) {
  const btn = el("lesson-save-recap-btn");
  btn.disabled = false;
  btn.textContent = "💾 Save recap to Drive · Salvează pe Drive";
  btn.onclick = async () => {
    btn.disabled = true;
    btn.textContent = "💾 Saving… · Se salvează…";
    const title = `Engleza Familie — ${session.displayName} — ${currentLesson.label} — ${todayLocalDateString()}`;
    try {
      await saveRecapToDrive(session.accessToken, title, buildRecapText(score, total));
      btn.textContent = "✅ Saved to Drive! · Salvat!";
    } catch (err) {
      btn.disabled = false;
      btn.textContent = "💾 Try again · Încearcă din nou";
      const scopeHint =
        err.status === 403
          ? " Sign out and sign in again to allow the new Drive permission. · Ieși din cont și loghează-te din nou ca să aprobi noua permisiune Drive."
          : "";
      el("lesson-complete-score").textContent += ` ⚠️ Couldn't save to Drive.${scopeHint}`;
    }
  };
}

// End-of-lesson recap on screen. Kids tiers show the Romanian meaning per
// item; grammar tiers show the correct answer, plus the explanation on
// missed ones.
function renderLessonSummary() {
  const usesMascots = session.profile.features.mascots;
  const { knew, practice } = summarizeRun();

  const summary = el("lesson-summary");
  summary.innerHTML = "";

  const heading = document.createElement("h3");
  heading.className = "lesson-summary-heading";
  heading.textContent = usesMascots ? "📋 Lesson recap · Ce ai învățat azi" : "📋 Lesson recap";
  summary.appendChild(heading);

  // Show the EXERCISE score here too, so it never seems to disagree with the
  // word groups below. A word appears in a few exercises, so "2 words to
  // practice" and, say, "13/16 exercises" are both true — spelling out the
  // exercise count removes the confusion.
  const exerciseTotal = currentQueue.length;
  const exerciseCorrect = currentQueue.filter((q) => q.wasCorrect).length;
  const sub = document.createElement("p");
  sub.className = "lesson-summary-sub";
  sub.textContent = usesMascots
    ? `Ai făcut bine ${exerciseCorrect} din ${exerciseTotal} exerciții! Mai jos, grupate pe cuvinte:`
    : `${exerciseCorrect} of ${exerciseTotal} exercises correct. Grouped by word below:`;
  summary.appendChild(sub);

  function addGroup(titleText, cssClass, entries, showExplain) {
    if (entries.length === 0) return;
    const group = document.createElement("div");
    group.className = `lesson-summary-group ${cssClass}`;
    const title = document.createElement("p");
    title.className = "lesson-summary-title";
    title.textContent = titleText;
    group.appendChild(title);
    for (const entry of entries) {
      const row = document.createElement("p");
      row.className = "lesson-summary-row";
      if (entry.translation) {
        row.textContent = `${entry.label}  —  ${entry.translation}`;
      } else if (showExplain && entry.explain) {
        row.textContent = `${entry.answer} — ${entry.explain}`;
      } else {
        row.textContent = entry.answer;
      }
      group.appendChild(row);
    }
    summary.appendChild(group);
  }

  addGroup(
    usesMascots ? "✅ You knew these! · Le-ai știut!" : "✅ You got these right",
    "lesson-summary-group--knew",
    knew,
    false
  );
  const practiceWord = practice.length === 1 ? "word" : "words";
  const practiceCuv = practice.length === 1 ? "cuvânt" : "cuvinte";
  addGroup(
    usesMascots ? `🔁 Practice these words · ${practice.length} ${practiceCuv} de reluat` : "🔁 Words worth another look",
    "lesson-summary-group--practice",
    practice,
    true
  );

  const cheer = document.createElement("p");
  cheer.className = "lesson-summary-cheer";
  if (practice.length === 0) {
    cheer.textContent = usesMascots
      ? "🎉 Perfect run — every single one! Amazing! · Totul corect — bravo!"
      : "🎉 Perfect run — every single one!";
  } else {
    cheer.textContent = usesMascots
      ? `💪 Ai terminat toată lecția — bravo! Mai exersează cele ${practice.length} ${practiceCuv} de mai sus și le prinzi data viitoare!`
      : `💪 Solid work — the ${practice.length} ${practiceWord} above will stick with a little more practice.`;
  }
  summary.appendChild(cheer);

  summary.hidden = false;
}
