// Lesson structure: CATEGORIES → LESSONS, every lesson exactly 50 exercises.
//
// WHY THIS EXISTS
// Rareș finished all 50 Beginner lessons in two days. Each was 8 words × 2
// exercises = 16, and each paid 20 minutes of screen time — so 800 exercises
// bought 1000 minutes (nearly 17 hours). The lessons were too small for what
// they paid.
//
// The fix is not to cut the reward but to make a "lesson" mean something:
// one lesson is now 50 exercises drawn from several themes at once, grouped
// under a category so the menu stays navigable. Same 20 minutes, roughly a
// third of the lessons, three times the work per lesson.
//
//   Beginner      50 → 17 lessons
//   Intermediate  20 → 10 lessons
//   Advanced       6 → 17 lessons
//   Expert         4 → 17 lessons
//
// Advanced and Expert started far smaller than Beginner, which meant an older
// child earned a quarter of the rewards for the same effort. Two things fixed
// that: four exercise types per grammar question instead of one (see
// js/grammar-client.js), and new question banks (grammar-extra.js and
// grammar-extra2.js) taking both tiers to 34 themes.
//
// The Beginner and Intermediate content is untouched — a lesson there is just a
// BUNDLE of existing themes, which is why no words or sentences were rewritten.

import {
  LESSONS,
  SENTENCE_LESSONS,
  buildWordQuestion,
  buildSentenceQuestion,
} from "./lessons-client.js";
import { ADVANCED_LESSONS, EXPERT_LESSONS, buildGrammarQuestion } from "./grammar-client.js";
import { ADVANCED_EXTRA, EXPERT_EXTRA } from "./grammar-extra.js";
import { ADVANCED_EXTRA2, EXPERT_EXTRA2 } from "./grammar-extra2.js";

export const EXERCISES_PER_LESSON = 50;

// Full banks per tier: the original themes plus the Advanced/Expert additions.
const BANKS = {
  beginner: LESSONS,
  intermediate: SENTENCE_LESSONS,
  advanced: [...ADVANCED_LESSONS, ...ADVANCED_EXTRA, ...ADVANCED_EXTRA2],
  expert: [...EXPERT_LESSONS, ...EXPERT_EXTRA, ...EXPERT_EXTRA2],
};

// Which field holds a theme's items, per tier.
const ITEMS_FIELD = {
  beginner: "words",
  intermediate: "sentences",
  advanced: "questions",
  expert: "questions",
};

// Exercise types in the order a lesson cycles through them. Each pass drills
// every item once, so a 24-word lesson uses the first two types fully and dips
// into the third — recognition first, production after, which is the order the
// spaced-repetition tiers already use.
const CYCLE_TYPES = {
  beginner: ["picture", "translation", "en-ro", "spell", "listen", "say"],
  intermediate: ["fill-blank", "unscramble", "picture-sentence", "listen-sentence", "say-sentence"],
  // Four ways to drill one question (see js/grammar-client.js). This is what
  // lets the grammar tiers hold as many lessons as the vocabulary ones without
  // asking the same question over and over.
  advanced: ["grammar-mcq", "grammar-fix", "grammar-why", "grammar-recall"],
  expert: ["grammar-mcq", "grammar-fix", "grammar-why", "grammar-recall"],
};

// ---------------------------------------------------------------------------
// The structure. `themes` are ids from the tier's bank; a lesson's items are
// all of those themes' items concatenated.
// ---------------------------------------------------------------------------
export const TIER_CATEGORIES = {
  beginner: [
    {
      id: "beg-me", label: "Eu și familia mea", emoji: "🏡",
      lessons: [
        { id: "beg-me-1", label: "Familia și corpul", emoji: "👨‍👩‍👧", themes: ["family", "body", "more-body"] },
        { id: "beg-me-2", label: "Cum mă simt", emoji: "😊", themes: ["feelings", "more-feelings", "actions"] },
        { id: "beg-me-3", label: "Acasă", emoji: "🛋️", themes: ["house", "bathroom", "kitchen-items"] },
        { id: "beg-me-4", label: "Haine și sănătate", emoji: "👕", themes: ["clothes", "accessories", "medical"] },
      ],
    },
    {
      id: "beg-nature", label: "Animale și natură", emoji: "🐾",
      lessons: [
        { id: "beg-nat-1", label: "Animale de acasă și de la fermă", emoji: "🐶", themes: ["animals", "farm-animals", "birds"] },
        { id: "beg-nat-2", label: "Animale sălbatice și marine", emoji: "🦁", themes: ["wild-animals", "sea-animals", "insects"] },
        { id: "beg-nat-3", label: "Natura din jur", emoji: "🌳", themes: ["nature", "garden", "weather"] },
        { id: "beg-nat-4", label: "Anotimpuri și spațiu", emoji: "🌍", themes: ["seasons", "space"] },
      ],
    },
    {
      id: "beg-food", label: "Mâncare", emoji: "🍎",
      lessons: [
        { id: "beg-food-1", label: "Mâncarea de zi cu zi", emoji: "🥗", themes: ["food", "fruits", "vegetables", "breakfast"] },
        { id: "beg-food-2", label: "Dulciuri și restaurant", emoji: "🍰", themes: ["desserts", "fast-food", "world-food"] },
      ],
    },
    {
      id: "beg-play", label: "Școală și joacă", emoji: "🎒",
      lessons: [
        { id: "beg-play-1", label: "La școală", emoji: "✏️", themes: ["school", "stationery", "toys"] },
        { id: "beg-play-2", label: "Sport și muzică", emoji: "⚽", themes: ["sports", "active-sports", "music"] },
        { id: "beg-play-3", label: "Petreceri și povești", emoji: "🎉", themes: ["party", "fantasy"] },
      ],
    },
    {
      id: "beg-world", label: "Orașul și lucrurile", emoji: "🏙️",
      lessons: [
        { id: "beg-world-1", label: "Culori, cifre și forme", emoji: "🎨", themes: ["colors", "numbers", "shapes"] },
        { id: "beg-world-2", label: "Transport", emoji: "🚗", themes: ["transport", "more-vehicles", "time"] },
        { id: "beg-world-3", label: "Locuri și meserii", emoji: "🏢", themes: ["places", "jobs", "money"] },
        { id: "beg-world-4", label: "Unelte și aventuri", emoji: "🔧", themes: ["tools", "electronics", "camping"] },
      ],
    },
  ],

  intermediate: [
    {
      id: "int-daily", label: "Viața de zi cu zi", emoji: "💬",
      lessons: [
        { id: "int-daily-1", label: "Rutina și familia", emoji: "🕗", themes: ["daily-routines", "family"] },
        { id: "int-daily-2", label: "Școală și mâncare", emoji: "🍽️", themes: ["school", "food"] },
        { id: "int-daily-3", label: "Weekend și viață zilnică", emoji: "🌤️", themes: ["weekend", "daily-life-long"] },
      ],
    },
    {
      id: "int-form", label: "Cum formulezi", emoji: "🗣️",
      lessons: [
        { id: "int-form-1", label: "Întrebări și prepoziții", emoji: "❓", themes: ["questions", "prepositions"] },
        { id: "int-form-2", label: "Descrieri și legături", emoji: "🔗", themes: ["describing", "connectors"] },
      ],
    },
    {
      id: "int-world", label: "Lumea mea", emoji: "🌍",
      lessons: [
        { id: "int-world-1", label: "Animale și vreme", emoji: "🐾", themes: ["animals", "weather"] },
        { id: "int-world-2", label: "Pasiuni și orașul meu", emoji: "🎸", themes: ["hobbies", "my-town"] },
        { id: "int-world-3", label: "Sănătate și cumpărături", emoji: "🛒", themes: ["health", "shopping"] },
      ],
    },
    {
      id: "int-story", label: "Povestiri și planuri", emoji: "📖",
      lessons: [
        { id: "int-story-1", label: "Fraze lungi și întâmplări", emoji: "📚", themes: ["longer-sentences", "past-stories"] },
        { id: "int-story-2", label: "Planuri și păreri", emoji: "💭", themes: ["future-plans", "opinions"] },
      ],
    },
  ],

  advanced: [
    {
      id: "adv-tenses", label: "Timpuri verbale", emoji: "⏳",
      lessons: [
        { id: "adv-tenses-1", label: "Trecut si prezent perfect", emoji: "🕰️", themes: ["past-tenses", "present-perfect"] },
        { id: "adv-tenses-2", label: "Viitor si viitor perfect", emoji: "🔮", themes: ["future-forms", "future-perfect"] },
        { id: "adv-tenses-3", label: "Obiceiuri trecute si timp", emoji: "⏮️", themes: ["used-to-would", "time-clauses"] },
        { id: "adv-tenses-4", label: "Vorbire si intrebari indirecte", emoji: "💬", themes: ["reported-speech", "indirect-questions"] },
      ],
    },
    {
      id: "adv-structures", label: "Structuri de fraza", emoji: "🏗️",
      lessons: [
        { id: "adv-struct-1", label: "Pasiv si cauzativ", emoji: "🔄", themes: ["passive-voice", "causative"] },
        { id: "adv-struct-2", label: "Relative si participiale", emoji: "🔗", themes: ["relative-clauses", "participle-clauses"] },
        { id: "adv-struct-3", label: "Conditionale", emoji: "🔀", themes: ["conditionals", "mixed-conditionals"] },
        { id: "adv-struct-4", label: "Gerunziu si tipare verbale", emoji: "🎯", themes: ["gerunds-infinitives", "verb-patterns"] },
      ],
    },
    {
      id: "adv-precision", label: "Precizie", emoji: "⚖️",
      lessons: [
        { id: "adv-prec-1", label: "Articole si nenumarabile", emoji: "📌", themes: ["articles", "countable-uncountable"] },
        { id: "adv-prec-2", label: "Cantitati si determinanti", emoji: "🔢", themes: ["quantifiers", "determiners"] },
        { id: "adv-prec-3", label: "Comparatii", emoji: "📈", themes: ["comparatives", "double-comparatives"] },
        { id: "adv-prec-4", label: "Ordinea si acordul", emoji: "🔤", themes: ["adverb-order", "agreement"] },
      ],
    },
    {
      id: "adv-nuance", label: "Nuanta si legaturi", emoji: "🧭",
      lessons: [
        { id: "adv-nuance-1", label: "Modale: deductie si obligatie", emoji: "🕵️", themes: ["modals-deduction", "obligation-permission"] },
        { id: "adv-nuance-2", label: "Contrast si scop", emoji: "🪢", themes: ["linking-contrast", "purpose-result"] },
        { id: "adv-nuance-3", label: "Intensitate si intrebari scurte", emoji: "📏", themes: ["so-such-enough", "question-tags"] },
      ],
    },
    {
      id: "adv-words", label: "Cuvinte si forma", emoji: "🔌",
      lessons: [
        { id: "adv-words-1", label: "Verbe cu particula si prepozitie", emoji: "🧲", themes: ["phrasal-verbs", "prepositional-verbs"] },
        { id: "adv-words-2", label: "Prepozitii dificile si ortografie", emoji: "✒️", themes: ["prepositions-advanced", "spelling-rules"] },
      ],
    },
  ],

  expert: [
    {
      id: "exp-idioms", label: "Expresii", emoji: "🎭",
      lessons: [
        { id: "exp-idioms-1", label: "Idiomuri generale si de birou", emoji: "💼", themes: ["idioms", "idioms-work"] },
        { id: "exp-idioms-2", label: "Natura si corp", emoji: "🌦️", themes: ["idioms-nature", "idioms-body"] },
        { id: "exp-idioms-3", label: "Bani si timp", emoji: "💰", themes: ["idioms-money", "idioms-time"] },
        { id: "exp-idioms-4", label: "Proverbe si perechi fixe", emoji: "📜", themes: ["proverbs", "binomials"] },
      ],
    },
    {
      id: "exp-traps", label: "Capcane", emoji: "⚠️",
      lessons: [
        { id: "exp-traps-1", label: "Confuzii si prieteni falsi", emoji: "🪞", themes: ["confusables", "false-friends-ro"] },
        { id: "exp-traps-2", label: "Greseli frecvente si omofone", emoji: "🔊", themes: ["commonly-misused", "sound-alikes"] },
        { id: "exp-traps-3", label: "Verbe cu particula: pozitia", emoji: "🔀", themes: ["phrasal-verbs-advanced", "phrasal-separable"] },
        { id: "exp-traps-4", label: "Nuante de cantitate si timp", emoji: "🥄", themes: ["quantifier-nuance", "tense-nuance"] },
      ],
    },
    {
      id: "exp-style", label: "Stil avansat", emoji: "✍️",
      lessons: [
        { id: "exp-style-1", label: "Inversiune si scindare", emoji: "🔦", themes: ["inversion", "cleft-sentences"] },
        { id: "exp-style-2", label: "Ireal si modale fine", emoji: "🌙", themes: ["unreal-past", "nuance-modals"] },
        { id: "exp-style-3", label: "Elipsa si emfaza", emoji: "➖", themes: ["ellipsis", "emphasis-adverbs"] },
        { id: "exp-style-4", label: "Reformulare si substantivizare", emoji: "🏛️", themes: ["paraphrase", "nominalisation"] },
      ],
    },
    {
      id: "exp-register", label: "Registru", emoji: "🎩",
      lessons: [
        { id: "exp-reg-1", label: "Formal si informal", emoji: "✉️", themes: ["register", "formal-writing"] },
        { id: "exp-reg-2", label: "Prudenta si verbe academice", emoji: "🎓", themes: ["hedging", "academic-verbs"] },
        { id: "exp-reg-3", label: "Conotatie si marcatori", emoji: "🎨", themes: ["connotation", "discourse-markers"] },
      ],
    },
    {
      id: "exp-words", label: "Cuvinte", emoji: "🧲",
      lessons: [
        { id: "exp-words-1", label: "Colocatii si verbe golite", emoji: "🧲", themes: ["collocations", "delexical-verbs"] },
        { id: "exp-words-2", label: "Formarea cuvintelor si conectori", emoji: "🧩", themes: ["word-formation", "advanced-connectors"] },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lookups
// ---------------------------------------------------------------------------

export function getCategories(tier) {
  return TIER_CATEGORIES[tier] || [];
}

// Flat list of every lesson in a tier, in menu order.
export function getStructuredLessons(tier) {
  return getCategories(tier).flatMap((c) => c.lessons.map((l) => ({ ...l, categoryId: c.id })));
}

function themeItems(tier, themeId) {
  const theme = BANKS[tier].find((t) => t.id === themeId);
  if (!theme) throw new Error(`Unknown ${tier} theme: ${themeId}`);
  return theme[ITEMS_FIELD[tier]];
}

// Returns a lesson in the SAME shape the tier's renderers already expect
// (words / sentences / questions), so nothing downstream needed changing.
export function getStructuredLesson(tier, lessonId) {
  const lesson = getStructuredLessons(tier).find((l) => l.id === lessonId);
  if (!lesson) throw new Error(`Unknown ${tier} lesson: ${lessonId}`);
  const items = lesson.themes.flatMap((t) => themeItems(tier, t));
  return { id: lesson.id, label: lesson.label, emoji: lesson.emoji, [ITEMS_FIELD[tier]]: items };
}

export function lessonItems(tier, lesson) {
  return lesson[ITEMS_FIELD[tier]] || [];
}

// ---------------------------------------------------------------------------
// Queue building — always exactly EXERCISES_PER_LESSON
// ---------------------------------------------------------------------------

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Cycles types over items: pass 0 drills every item with the first type, pass 1
// with the second, and so on until the target is reached. With 24 words that is
// 24 + 24 + 2 = 50, so a word is practised two or three different ways — the
// point of a longer lesson, rather than the same drill repeated.
//
// When a bank is smaller than the target and its tier has only one exercise
// type (the grammar tiers), items necessarily repeat; that is the intended
// fallback, not an oversight.
function buildCyclingQueue(items, types, makeQuestion, target = EXERCISES_PER_LESSON) {
  const queue = [];
  const pool = shuffle(items);
  for (let pass = 0; queue.length < target; pass++) {
    const type = types[pass % types.length];
    for (const item of pool) {
      if (queue.length >= target) break;
      queue.push(makeQuestion(item, type));
    }
  }
  return shuffle(queue);
}

export function buildFiftyWordQueue(lesson, allWords) {
  return buildCyclingQueue(lesson.words, CYCLE_TYPES.beginner, (word, type) =>
    buildWordQuestion(word, allWords, type)
  );
}

export function buildFiftySentenceQueue(lesson) {
  return buildCyclingQueue(lesson.sentences, CYCLE_TYPES.intermediate, (sentence, type) =>
    buildSentenceQuestion(sentence, type)
  );
}

export function buildFiftyGrammarQueue(lesson) {
  // The whole lesson's questions are the distractor pool for "why" exercises,
  // so the wrong explanations are always about related grammar.
  const pool = lesson.questions;
  return buildCyclingQueue(pool, CYCLE_TYPES.advanced, (mcq, type) =>
    buildGrammarQuestion(mcq, type, pool)
  );
}

// ---------------------------------------------------------------------------
// Migration from the old one-theme-per-lesson structure
// ---------------------------------------------------------------------------

// Old saved progress is keyed by THEME id ("animals", "family", …); the new
// lessons have their own ids, so without this a child who finished everything
// would open the app to an empty progress bar and have to redo it all.
//
// A new lesson counts as done when every theme inside it was done before —
// nothing is credited that wasn't actually completed.
export function migrateCompletions(tier, oldCompleted) {
  if (!oldCompleted) return { completed: {}, migrated: 0 };
  const completed = {};
  let migrated = 0;
  for (const lesson of getStructuredLessons(tier)) {
    if (lesson.themes.every((t) => oldCompleted[t])) {
      completed[lesson.id] = oldCompleted[lesson.themes[0]];
      migrated++;
    }
  }
  return { completed, migrated };
}

// True when a bucket still holds pre-restructure keys (theme ids rather than
// lesson ids), which is what triggers the one-time migration.
export function needsMigration(tier, completed) {
  if (!completed) return false;
  const lessonIds = new Set(getStructuredLessons(tier).map((l) => l.id));
  return Object.keys(completed).some((key) => !lessonIds.has(key));
}

export function totalLessons(tier) {
  return getStructuredLessons(tier).length;
}
