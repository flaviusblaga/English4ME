// Placement test — a short, self-contained quiz that decides which level a new
// learner starts at (Beginner → Expert). 100% client-side, like the lessons:
// no Claude call, no Worker. Ten questions ordered easy → hard; the total
// correct maps to a level via levelForScore(). The chosen level is saved once
// (see placement.js) so the test only runs the first time a child enters.

export const PLACEMENT_QUESTIONS = [
  // ---- Beginner: basic vocabulary (answerable with almost no English) ----
  {
    tier: "beginner",
    emoji: "🍎",
    stem: "Which word means this?",
    options: [
      { text: "apple", correct: true },
      { text: "orange", correct: false },
      { text: "banana", correct: false },
      { text: "grape", correct: false },
    ],
  },
  {
    tier: "beginner",
    emoji: "🐱",
    stem: "Which word means this?",
    options: [
      { text: "cat", correct: true },
      { text: "dog", correct: false },
      { text: "cow", correct: false },
      { text: "pig", correct: false },
    ],
  },
  {
    tier: "beginner",
    emoji: "👋",
    stem: "Which one is a greeting?",
    options: [
      { text: "Hello", correct: true },
      { text: "Table", correct: false },
      { text: "Green", correct: false },
      { text: "Run", correct: false },
    ],
  },
  // ---- Intermediate: simple grammar in full sentences ----
  {
    tier: "intermediate",
    emoji: "🎒",
    stem: "She ___ to school every day.",
    options: [
      { text: "goes", correct: true },
      { text: "go", correct: false },
      { text: "going", correct: false },
      { text: "gone", correct: false },
    ],
  },
  {
    tier: "intermediate",
    emoji: "🍽️",
    stem: "There ___ two apples on the table.",
    options: [
      { text: "are", correct: true },
      { text: "is", correct: false },
      { text: "am", correct: false },
      { text: "be", correct: false },
    ],
  },
  {
    tier: "intermediate",
    emoji: "📚",
    stem: "I ___ my homework yesterday.",
    options: [
      { text: "did", correct: true },
      { text: "do", correct: false },
      { text: "done", correct: false },
      { text: "doing", correct: false },
    ],
  },
  // ---- Advanced: tenses & conditionals ----
  {
    tier: "advanced",
    emoji: "🌧️",
    stem: "If it rains tomorrow, we ___ stay home.",
    options: [
      { text: "will", correct: true },
      { text: "would have", correct: false },
      { text: "are", correct: false },
      { text: "have", correct: false },
    ],
  },
  {
    tier: "advanced",
    emoji: "🏙️",
    stem: "She has ___ in London since 2020.",
    options: [
      { text: "lived", correct: true },
      { text: "live", correct: false },
      { text: "living", correct: false },
      { text: "lives", correct: false },
    ],
  },
  // ---- Expert: idioms & nuance ----
  {
    tier: "expert",
    emoji: "🌧️",
    stem: '"It’s raining cats and dogs" means it is raining…',
    options: [
      { text: "very heavily", correct: true },
      { text: "a little", correct: false },
      { text: "with animals", correct: false },
      { text: "about to stop", correct: false },
    ],
  },
  {
    tier: "expert",
    emoji: "🧊",
    stem: 'To "break the ice" means to…',
    options: [
      { text: "start a conversation", correct: true },
      { text: "make someone angry", correct: false },
      { text: "leave a party", correct: false },
      { text: "tell a lie", correct: false },
    ],
  },
];

// Maps a raw score (0..10) to a starting level. The questions are ordered by
// difficulty, so a true beginner clears only the first few; each higher band
// means they held up through harder material. Mirrors the four kid profiles
// that already exist, so the result plugs straight into the lesson engine.
export function levelForScore(correct) {
  if (correct <= 3) return { profileId: "kids-primar", contentTier: "beginner", level: "beginner", label: "Beginner" };
  if (correct <= 6) return { profileId: "kids-intermediate", contentTier: "intermediate", level: "intermediate", label: "Intermediate" };
  if (correct <= 8) return { profileId: "kids-advanced", contentTier: "advanced", level: "advanced", label: "Advanced" };
  return { profileId: "kids-expert", contentTier: "expert", level: "expert", label: "Expert" };
}

export const PLACEMENT_TOTAL = PLACEMENT_QUESTIONS.length;
