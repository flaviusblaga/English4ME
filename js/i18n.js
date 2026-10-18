// Single source of truth for UI copy. Everything the interface says lives here,
// so wording changes happen in one place and nothing is hardcoded in the
// components. The whole interface is in English.
//
// DELIBERATELY NOT here (they are content, not UI chrome):
//   • the mascot's spoken lines (lessons-client.js / grammar-client.js) — the
//     teacher speaks English on purpose, and these are read aloud via TTS;
//   • the lesson/reading material itself (words, sentences, passages);
//   • the Romanian learning aids kept on purpose (e.g. the optional Romanian
//     translation of a "Did you know?" fact, or a phrase translation);
//   • the adult "Business English" learner surface (usage card, conversation
//     scenarios, documents) — that experience stays in English by design.
//
// Usage:
//   import { t, hydrateStrings } from "./i18n.js";
//   el.textContent = t("lesson.next");
//   el.textContent = t("placement.resultSub", { n: 7, total: 10 });
//   hydrateStrings();  // fills every [data-i18n] in the static markup
//
// Keys are dot-paths into STRINGS. `{name}` placeholders are replaced from the
// vars object passed to t().

const STRINGS = {
  login: {
    signInFailed: "Sign-in failed: {msg}",
  },

  picker: {
    adultRole: "Admin", // the adult tile's role chip (business surface stays EN)
    teenTag: "Teen · 14-18",
    kidLevelUnset: "Take the level test",
    kidLevelSet: "Level set",
    notEnrolled: "The account {email} isn't enrolled in any family in the app. Ask Flavius to add you.",
    signInToSee: "Sign in to see who's learning today.",
    levelTitle: "Choose your adventure, {name}!",
    recommended: "Recommended",
  },

  admin: {
    titleList: "Added families",
    loading: "Loading…",
    forbidden: "Only the admin can manage families.",
    error: "Error: {msg}",
    add: "Add a family",
    empty: "No families added yet. (Your main family lives in code and doesn't show here.)",
    counts: "{a} adults · {t} teens · {k} kids",
    edit: "Edit",
    deleteAria: "Delete {name}",
    famNew: "New family",
    famEdit: "Edit family",
    catAdult: "Adults / parents",
    catTeen: "Teens (14-18)",
    catKid: "Kids",
    save: "Save",
    saving: "Saving…",
    saveFail: "Couldn't save.",
    back: "Back",
    optDrive: "Progress report in the child's Google Drive",
    optMirror: "Save conversations on my server (requires the family's consent)",
  },

  placement: {
    lead: "Hi, {name}! Let's see where you're starting from. Pick the correct answer — it's fine if you don't know them all! 😊",
    resultTitle: "Your level: {label}!",
    resultSub: "You got {n} of {total} right. We've placed you at the right level — you can change it anytime by retaking the test.",
  },

  header: {
    badges: "Badges",
    exercises: "Exercises",
    lessons: "Lessons",
    reading: "Reading",
    viewChild: "View child's progress",
    levels: "Levels",
    chat: "Chat",
    stats: "My stats",
  },

  settings: {
    voiceFemale: "👩 Female voice",
    voiceMale: "👨 Male voice",
    voiceOn: "Sound on",
    voiceOff: "Sound off",
    showData: "Show saved data",
    signOut: "Sign out",
    themeLight: "Light mode",
    themeDark: "Dark mode",
  },

  mascotSel: {
    talkTo: "Talk to:",
    teacherToday: "My teacher today:",
    all: "All",
  },

  chat: {
    inputPlaceholder: "Type your message in English…",
    newBadge: "🎉 New badge: {label}!",
  },

  lesson: {
    justChatMascots: "Chat with the Socatei",
    justChatPlain: "Back to chat",
    exitAria: "Exit lesson",
    skip: "Skip",
    hearAgain: "Hear again",
    next: "Next",
    seeResults: "See results!",
    checkpointTitle: "Part {n} of {total} — done!",
    checkpointSub: "You've done {done} of {total} questions. Keep going or stop?",
    checkpointContinue: "Continue (10 more)",
    checkpointStop: "Stop here",
    checkpointStopHint: "Your progress is saved — next time you'll pick up where you left off.",
    chatAboutMascots: "Chat about it with the Socatei",
    chatAboutPlain: "Chat about what you practised",
    saveRecap: "Save the recap to Drive",
    saving: "Saving…",
    saved: "Saved to Drive!",
    saveRetry: "Try again",
    saveErr: " Couldn't save to Drive.",
    saveScopeHint: " Sign out and back in to approve the Drive permission.",
    backToLessons: "Back to lessons",
    sayReady: "Say the word out loud, then press the green button",
    sayPrompt: "Tap the mic and say it!",
    listening: "Listening… 🎧",
    heard: "I heard: “{text}”",
    heardNothing: "I didn't hear anything 😅",
    micFail: "The mic didn't work. You can skip. 🙂",
  },

  home: {
    todayTitle: "Today's practice",
    todayCountLabel: "to do today",
    todayItemsOne: "1 exercise to do today",
    todayItemsMany: "{n} to practise today",
    allDone: "You're done for today — come back tomorrow!",
    doneToday: "Today's practice is done! See you tomorrow.",
    start: "Start",
    categoryCount: "{d}/{t} lessons",
    greeting: "Hi, {name}! 👋",
    greetingSub: "Let's learn today!",
    progressHeading: "Your progress",
    tileWords: "words known",
    tileLessons: "lessons",
    tileStreak: "active days",
    seeStats: "My stats",
    streakPill: "{n} days in a row",
    streakPillOne: "1 day in a row",
    continueEyebrow: "Continue where you left off",
    continueBtn: "Continue",
    continueStartBtn: "Start",
    continuePct: "{n}% done",
    continueFresh: "New lesson",
    lessonsHeading: "Your lessons",
    achievementsHeading: "Recent achievements",
  },

  stats: {
    title: "My stats",
    back: "Back",
    wordsHeading: "Words",
    mastered: "known",
    learning: "learning",
    total: "total",
    lessonsHeading: "Lessons by module",
    streakHeading: "Practice days",
    streakCount: "{n} practice days!",
    streakCountOne: "1 practice day!",
    streakSub: "{w} of the last 7 days",
    activityHeading: "Practice activity",
    activitySub: "Active days per week, last 8 weeks",
    activityNow: "now",
    activityTip: "{n} of 7 days",
    activityAria: "Week of {range}: {n} of 7 days active",
    activityEmpty: "No practice logged yet — finish a lesson to start your activity chart.",
    rewardsHeading: "My rewards",
    badgesHeading: "Badges",
  },

  didYouKnow: {
    entry: "Did you know?",
    entrySub: "Fun facts about Romania",
    title: "Did you know?",
    intro: "Discover amazing things about Romania — and learn English at the same time!",
    back: "Back",
    another: "Another fact",
    allDomains: "All",
    listHeading: "Browse by topic",
    tapForRo: "🇷🇴 See in Romanian",
    hideRo: "Hide translation",
  },

  recap: {
    completeScore: "You got {s} of {t}! 🎉",
    newBadge: " New badge: {names}!",
    headingMascot: "Lesson recap · What you learned today",
    headingPlain: "Lesson recap",
    sub: "{c} of {t} exercises correct. Grouped by word below:",
    knewMascot: "You knew these!",
    knewPlain: "You got these right",
    practiceMascot: "Practise these words · {n} to review",
    practicePlain: "Words to review",
    cheerPerfect: "🎉 All correct — well done!",
    cheerSolid: "💪 Good job — practise the {n} above and you'll nail them next time!",
  },

  rewards: {
    heading: "My rewards",
    progress: "{a}/{b} lessons done",
    perLesson: " +{x} per lesson · Earned: {y}",
    bonusEarned: " BONUS: {x}! · Bonus unlocked — tell your parents!",
    bonusToward: " Finish all {n} → {x} bonus",
    completeTime1: " You earned +{x}! (total: {y})",
    completeTime2: " This lesson was already counted — you've earned {y} so far",
    completeBonus: " MODULE COMPLETE! Bonus: {x} · Tell your parents!",
    completeToward: " {a}/{b} lessons toward the {x} bonus",
  },

  daily: {
    title: "Today's practice",
    stats: " {m} known · {l} learning · of {t}",
  },

  reading: {
    intro: "Read a short story, then answer the questions. Take your time — you can reread anytime.",
    best: "Best: {s}/{t}",
    notRead: "Not read yet",
    correct: "Correct! Nicely spotted.",
    wrong: "Not quite — the highlighted answer is the correct one. Reread that part if you like.",
    seeResults: "See results",
    nextQuestion: "Next question",
    score: "You got {s} of {t}!",
    newBadge: " New badge: {names}!",
    practiceHeader: "Reading exercise",
    backToChat: "Back to chat",
    backToStories: "Back to stories",
  },

  parent: {
    header: "Parent dashboard",
    loading: "Loading…",
    selectChild: "Select a child from the list.",
    noChild: "(no child in the family)",
    notFound: "No data for this email yet — check the address, or the child hasn't practised yet.",
    loadErr: "Couldn't load progress: {msg}",
    capsNote: "Showing the last {n} days. {d} older day(s) have expired and are no longer kept.",
    saved: " Saved. Kids will see the new rewards next time they open the app.",
    saveForbidden: "Only a parent in the family can change the rewards.",
    saveErr: "Couldn't save: {msg}",
    progressTitle: " {name}'s progress",
    rewardsHeading: " Rewards to honour",
    rwProgress: " {a} / {b} lessons done — {module}",
    rwEarned: " Earned: {amount} {unit} ({per} / lesson)",
    rwBonusEarned: " BONUS TO HONOUR: {amount} {unit} — the module is fully complete!",
    rwBonusToward: " Full-module bonus: {amount} {unit} ({left} lessons to go)",
    statPoints: "Points",
    statStreak: "Active days",
    statTurns: "Messages",
    dayMessages: "{date} — {n} messages{note}",
    dayTrimmed: " ({n} messages from earlier that day were trimmed)",
    roleChild: "Child",
    roleMascot: "Socatei",
  },

  badges: {
    "first-chat": "First hello!",
    "chatty-10": "Chatterbox champ",
    "chatty-50": "Word wizard",
    "streak-3": "3-day streak",
    "streak-7": "One-week streak",
    "streak-30": "Monthly master",
    "points-100": "100-point club",
    "lesson-first": "First lesson done!",
    "lesson-all-starter": "Lesson explorer",
    "sentence-first": "First sentence lesson!",
    "sentence-all-starter": "Sentence explorer",
    "sentence-master": "Sentence master",
    "reading-first": "First story read!",
    "reading-all": "Bookworm",
    "grammar-first": "Grammar challenger",
    "grammar-all": "Grammar champion",
    "expert-first": "Expert in training",
    "expert-all": "Word master",
  },

  // Module display names — one place, referenced by the header profile tag, the
  // picker, the parent dropdown and anywhere a "level" used to read Beginner/…
  modules: {
    beginner: "Playroom",
    intermediate: "Adventure",
    advanced: "Storytime",
    expert: "Mastery Cup",
    teen: "Teen 14-18",
  },
};

// Reads a dot-path out of STRINGS. Returns the key itself if missing (so a
// typo is visible in the UI rather than silently blank), and warns once.
function lookup(path) {
  const parts = path.split(".");
  let node = STRINGS;
  for (const p of parts) {
    if (node && Object.prototype.hasOwnProperty.call(node, p)) node = node[p];
    else {
      console.warn(`i18n: missing key "${path}"`);
      return path;
    }
  }
  return typeof node === "string" ? node : path;
}

// t("a.b", { name: "X" }) → string with {name} replaced. Unmatched {…} are left
// as-is (helps spot a missing var).
export function t(path, vars) {
  let s = lookup(path);
  if (vars) {
    s = s.replace(/\{(\w+)\}/g, (m, k) =>
      Object.prototype.hasOwnProperty.call(vars, k) ? String(vars[k]) : m
    );
  }
  return s;
}

// Module display name for a tier/level id (beginner…teen). Falls back to the id.
export function moduleName(tier) {
  return STRINGS.modules[tier] || tier;
}

// The label shown in the app header under the name. Kids/teens read the module
// name (Playroom…); the adult business learner keeps its English tag.
export function profileTagLabel(profile) {
  if (profile.id === "business-conversational") return profile.displayName;
  return moduleName(profile.contentTier);
}

// Fills every <element data-i18n="key"> in the static markup with t(key). For
// elements that also need an aria-label, use data-i18n-aria="key". Called once
// at startup; safe to call again (it just re-sets textContent).
export function hydrateStrings(root = document) {
  root.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  root.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    el.setAttribute("aria-label", t(el.dataset.i18nAria));
  });
  root.querySelectorAll("[data-i18n-ph]").forEach((el) => {
    el.setAttribute("placeholder", t(el.dataset.i18nPh));
  });
}

export { STRINGS };
