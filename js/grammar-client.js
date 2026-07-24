// Exercise banks for the Advanced and Expert tiers — grammar- and
// usage-focused multiple choice with a short explanation per question
// (these learners want to know WHY, not just right/wrong). Same content
// philosophy as every other bank: authored once, 100% client-side, zero
// API cost per use. Question shape: { q, options[4], correct: index, explain }.

export const ADVANCED_LESSONS = [
  {
    id: "past-tenses",
    label: "Past Tenses",
    emoji: "⏳",
    questions: [
      { q: "While I ____ TV, the phone rang.", options: ["watched", "was watching", "am watching", "watch"], correct: 1,
        explain: "An action in progress (was watching) is interrupted by a short action (rang)." },
      { q: "She ____ her keys yesterday, so she couldn't get in.", options: ["loses", "was losing", "lost", "has lost"], correct: 2,
        explain: "A finished action at a stated past time (yesterday) takes past simple." },
      { q: "They ____ football when it started to rain.", options: ["played", "play", "were playing", "have played"], correct: 2,
        explain: "The game was in progress when the rain interrupted it — past continuous." },
      { q: "I ____ to the cinema last weekend.", options: ["have gone", "went", "was going", "go"], correct: 1,
        explain: "\"Last weekend\" is a finished time — past simple, not present perfect." },
      { q: "What ____ when I called you at 8?", options: ["did you do", "have you done", "were you doing", "do you do"], correct: 2,
        explain: "Asking about an activity in progress at a specific past moment — past continuous." },
      { q: "He ____ his leg while he was skiing.", options: ["broke", "was breaking", "breaks", "has broken"], correct: 0,
        explain: "The short, sudden event (broke) happens inside the longer activity (was skiing)." },
      { q: "We ____ dinner at 7, so the kitchen was busy.", options: ["cooked", "were cooking", "cook", "had cook"], correct: 1,
        explain: "Describing what was in progress at that time — past continuous." },
      { q: "She ____ the book and gave it back to me.", options: ["was finishing", "finish", "finished", "has finished"], correct: 2,
        explain: "Two completed actions in sequence both take past simple." },
    ],
  },
  {
    id: "present-perfect",
    label: "Present Perfect",
    emoji: "✅",
    questions: [
      { q: "I have lived here ____ 2019.", options: ["for", "since", "from", "during"], correct: 1,
        explain: "\"Since\" marks the starting point; \"for\" would need a duration (for five years)." },
      { q: "She has studied English ____ three years.", options: ["since", "from", "for", "at"], correct: 2,
        explain: "\"For\" goes with a length of time; \"since\" would need a starting point." },
      { q: "Tom isn't here — he has ____ to the store.", options: ["been", "gone", "went", "go"], correct: 1,
        explain: "\"Has gone\" = he left and is still away; \"has been\" = he went and came back." },
      { q: "____ you ever eaten sushi?", options: ["Did", "Have", "Do", "Were"], correct: 1,
        explain: "Life experience up to now takes present perfect: Have you ever...?" },
      { q: "I ____ my homework, so I can play now.", options: ["finished", "have finished", "was finishing", "finish"], correct: 1,
        explain: "A past action with a result right now (I'm free) — present perfect." },
      { q: "We have ____ seen that movie twice.", options: ["yet", "never", "already", "since"], correct: 2,
        explain: "\"Already\" fits a completed action sooner than expected; \"yet\" belongs in negatives and questions." },
      { q: "He hasn't called me ____.", options: ["already", "yet", "never", "just"], correct: 1,
        explain: "\"Yet\" is used in negative sentences for something expected to happen." },
      { q: "I have ____ come back from school — give me a minute!", options: ["just", "yet", "ever", "for"], correct: 0,
        explain: "\"Just\" = a very short time ago, and it sits between have and the verb." },
    ],
  },
  {
    id: "comparatives",
    label: "Comparing Things",
    emoji: "⚖️",
    questions: [
      { q: "This book is ____ than the movie.", options: ["more better", "better", "more good", "gooder"], correct: 1,
        explain: "\"Better\" is already the comparative of good — never \"more better\"." },
      { q: "Today is ____ day of the year.", options: ["the hottest", "the most hot", "hotter", "the more hot"], correct: 0,
        explain: "Short adjectives take -est for superlatives: the hottest." },
      { q: "My bag is not as heavy ____ yours.", options: ["than", "as", "like", "that"], correct: 1,
        explain: "The pattern is \"as ... as\": not as heavy as yours." },
      { q: "This exercise is ____ than the last one.", options: ["difficulter", "more difficult", "most difficult", "difficultest"], correct: 1,
        explain: "Long adjectives use \"more\": more difficult." },
      { q: "She runs much ____ than her brother.", options: ["fast", "faster", "fastest", "more fast"], correct: 1,
        explain: "Comparative of a short adjective: faster; \"much\" makes it stronger." },
      { q: "This is ____ pizza I have ever eaten!", options: ["the goodest", "the best", "the better", "most good"], correct: 1,
        explain: "The superlative of good is irregular: the best." },
      { q: "The weather is getting ____ every day.", options: ["worse", "worst", "more bad", "badder"], correct: 0,
        explain: "The comparative of bad is irregular: worse." },
      { q: "My room is ____ as my sister's room.", options: ["as big", "bigger", "the biggest", "more big"], correct: 0,
        explain: "\"As ... as\" needs the plain adjective: as big as." },
    ],
  },
  {
    id: "future-forms",
    label: "Talking About the Future",
    emoji: "🔮",
    questions: [
      { q: "Look at those clouds! It ____ rain.", options: ["will", "is going to", "would", "does"], correct: 1,
        explain: "A prediction based on what you can see now takes \"going to\"." },
      { q: "The phone is ringing — I ____ answer it.", options: ["am going to", "will", "would", "am"], correct: 1,
        explain: "A decision made at the moment of speaking takes \"will\"." },
      { q: "We ____ my grandparents this weekend — it's all planned.", options: ["will visit", "visit", "are visiting", "would visit"], correct: 2,
        explain: "A fixed plan or arrangement takes present continuous: we are visiting." },
      { q: "I think our team ____ win the match.", options: ["is winning", "will", "is going", "wins"], correct: 1,
        explain: "An opinion or guess about the future (after \"I think\") takes \"will\"." },
      { q: "She ____ study medicine — she has already chosen the university.", options: ["will", "is going to", "would", "shall"], correct: 1,
        explain: "An intention already decided takes \"going to\"." },
      { q: "Don't worry, I ____ help you with your homework.", options: ["am helping", "going to", "will", "would"], correct: 2,
        explain: "A promise or offer takes \"will\"." },
      { q: "The train ____ at 9:15 tomorrow morning.", options: ["leaves", "will leaving", "is going to leaves", "leave"], correct: 0,
        explain: "Timetables and schedules use present simple, even for the future." },
      { q: "Watch out! You ____ drop the glass!", options: ["will", "are going to", "would", "may to"], correct: 1,
        explain: "Something about to happen right now, based on evidence — \"going to\"." },
    ],
  },
  {
    id: "phrasal-verbs",
    label: "Phrasal Verbs",
    emoji: "🧩",
    questions: [
      { q: "Please turn ____ the music — the baby is sleeping.", options: ["down", "up", "in", "over"], correct: 0,
        explain: "Turn down = make quieter; turn up = make louder." },
      { q: "I need to look ____ this word in the dictionary.", options: ["at", "for", "up", "out"], correct: 2,
        explain: "Look up = search for information; look for = try to find a thing." },
      { q: "Don't give ____! You're almost at the finish line.", options: ["out", "up", "in", "off"], correct: 1,
        explain: "Give up = stop trying." },
      { q: "Can you pick me ____ from school at 4?", options: ["out", "on", "up", "off"], correct: 2,
        explain: "Pick up = collect someone (by car, usually)." },
      { q: "I get ____ at 7 o'clock every morning.", options: ["out", "off", "over", "up"], correct: 3,
        explain: "Get up = leave your bed in the morning." },
      { q: "She takes ____ her mother — same eyes, same smile.", options: ["after", "off", "over", "along"], correct: 0,
        explain: "Take after = look or behave like an older family member." },
      { q: "We ran ____ of milk, so I went to buy more.", options: ["off", "away", "out", "into"], correct: 2,
        explain: "Run out of = have none left." },
      { q: "Put ____ your coat — it's cold outside.", options: ["on", "up", "in", "off"], correct: 0,
        explain: "Put on = dress yourself in something; take off is the opposite." },
    ],
  },
  {
    id: "conditionals",
    label: "If Sentences",
    emoji: "🔀",
    questions: [
      { q: "If it rains tomorrow, we ____ at home.", options: ["stay", "will stay", "stayed", "would stayed"], correct: 1,
        explain: "First conditional: if + present simple, will + verb." },
      { q: "If you heat ice, it ____.", options: ["will melted", "melted", "melts", "would melt"], correct: 2,
        explain: "Zero conditional (facts that are always true): if + present, present." },
      { q: "If she ____ hard, she will pass the exam.", options: ["will study", "studies", "studied", "study"], correct: 1,
        explain: "The \"if\" part of a first conditional uses present simple, not will." },
      { q: "I'll call you if I ____ any news.", options: ["will hear", "heard", "hear", "would hear"], correct: 2,
        explain: "Present simple after \"if\", will in the other half." },
      { q: "If you mix blue and yellow, you ____ green.", options: ["will got", "get", "would get", "getting"], correct: 1,
        explain: "A fact that is always true — zero conditional, present simple." },
      { q: "What will you do if the shop ____ closed?", options: ["will be", "is", "was", "would be"], correct: 1,
        explain: "Even in a question, the \"if\" part stays in present simple." },
      { q: "If we don't hurry, we ____ the bus.", options: ["miss", "will miss", "missed", "would missed"], correct: 1,
        explain: "A real future consequence — will miss." },
      { q: "Unless you practice, you ____ improve.", options: ["will", "won't", "don't", "wouldn't"], correct: 1,
        explain: "\"Unless\" = \"if ... not\", so the result is negative: you won't improve." },
    ],
  },
];

export const EXPERT_LESSONS = [
  {
    id: "idioms",
    label: "Idioms",
    emoji: "🎭",
    questions: [
      { q: "The math test was a piece of cake. What does this mean?", options: ["It was very easy", "It was about fractions", "It was very long", "It was a reward"], correct: 0,
        explain: "A piece of cake = something very easy to do." },
      { q: "\"Break a leg!\" is something you say to...", options: ["warn someone of danger", "wish someone good luck", "tell someone to slow down", "end an argument"], correct: 1,
        explain: "Especially before a performance — it means good luck, not an injury!" },
      { q: "It's raining cats and dogs means...", options: ["animals are outside", "it's raining very heavily", "it just stopped raining", "the weather is strange"], correct: 1,
        explain: "A classic idiom for very heavy rain." },
      { q: "If something happens once in a blue moon, it happens...", options: ["every night", "very rarely", "only in autumn", "twice a month"], correct: 1,
        explain: "Once in a blue moon = almost never, very rarely." },
      { q: "\"I'm feeling under the weather\" means...", options: ["I love this weather", "I'm slightly ill", "I'm standing in the rain", "I'm very energetic"], correct: 1,
        explain: "Under the weather = feeling a bit sick." },
      { q: "To hit the books means to...", options: ["damage some books", "study hard", "return library books", "write a book"], correct: 1,
        explain: "Hit the books = start studying seriously." },
      { q: "Spilling the beans means...", options: ["making a mess in the kitchen", "revealing a secret", "wasting food", "starting an argument"], correct: 1,
        explain: "Spill the beans = accidentally (or deliberately) tell a secret." },
      { q: "When something costs an arm and a leg, it is...", options: ["dangerous", "very expensive", "sold in a hospital", "very cheap"], correct: 1,
        explain: "Costs an arm and a leg = extremely expensive." },
    ],
  },
  {
    id: "confusables",
    label: "Tricky Word Pairs",
    emoji: "🤔",
    questions: [
      { q: "Can you ____ me your bike until tomorrow?", options: ["borrow", "lend", "loan me", "rent me"], correct: 1,
        explain: "You lend TO someone; you borrow FROM someone." },
      { q: "She ____ me a funny story about her cat.", options: ["said", "told", "spoke", "talked"], correct: 1,
        explain: "You tell someone something; you say something (without a person after it)." },
      { q: "I still need to ____ my homework tonight.", options: ["make", "do", "create", "take"], correct: 1,
        explain: "You DO homework, work, and chores; you MAKE a cake, a plan, a mistake." },
      { q: "Don't forget to ____ your umbrella when you leave.", options: ["bring", "take", "carry on", "fetch up"], correct: 1,
        explain: "Take = away from here; bring = toward here." },
      { q: "He ____ a big mistake on the last question.", options: ["did", "made", "took", "created"], correct: 1,
        explain: "You MAKE a mistake — one of the classic make/do pairs." },
      { q: "Could you ____ louder? I can't hear you.", options: ["say", "tell", "speak", "told"], correct: 2,
        explain: "Speak describes the act of talking itself (speak louder, speak English)." },
      { q: "I ____ some money from my brother for the cinema.", options: ["lent", "borrowed", "loaned", "gave"], correct: 1,
        explain: "The person who receives the money borrows it." },
      { q: "We ____ a lot of photos on the school trip.", options: ["made", "did", "took", "shot up"], correct: 2,
        explain: "You TAKE photos in English (not make, like in Romanian \"a face poze\")." },
    ],
  },
  {
    id: "phrasal-verbs-advanced",
    label: "Advanced Phrasal Verbs",
    emoji: "🚀",
    questions: [
      { q: "The meeting was put ____ until next week.", options: ["away", "off", "down", "out"], correct: 1,
        explain: "Put off = postpone, delay to a later time." },
      { q: "She came ____ a brilliant idea for the project.", options: ["up with", "over to", "out of", "down with"], correct: 0,
        explain: "Come up with = think of, invent (an idea, a plan)." },
      { q: "I can't figure ____ how this puzzle works.", options: ["up", "in", "out", "over"], correct: 2,
        explain: "Figure out = understand or solve after thinking." },
      { q: "The concert was called ____ because of the storm.", options: ["off", "out", "away", "down"], correct: 0,
        explain: "Call off = cancel." },
      { q: "He ended ____ winning the whole competition!", options: ["off", "up", "over", "away"], correct: 1,
        explain: "End up = finally be in a situation you didn't plan at first." },
      { q: "I really look ____ to the summer holidays.", options: ["forward", "ahead", "up", "onward"], correct: 0,
        explain: "Look forward to = feel excited about something in the future." },
      { q: "Can you turn ____ the offer, or do you have to accept?", options: ["off", "over", "down", "away"], correct: 2,
        explain: "Turn down = refuse or reject an offer." },
      { q: "It took her weeks to get ____ the flu.", options: ["over", "off", "through with", "along"], correct: 0,
        explain: "Get over = recover from an illness or a bad experience." },
    ],
  },
  {
    id: "paraphrase",
    label: "Say It Another Way",
    emoji: "🔁",
    questions: [
      { q: "\"I've never seen such a good film.\" means the same as...", options: ["I don't like films.", "It's the best film I've ever seen.", "I never watch good films.", "I saw a good film once."], correct: 1,
        explain: "\"Never seen such a good X\" = \"the best X I've ever seen\"." },
      { q: "\"The box is too heavy for me to carry.\" means...", options: ["I can carry the box easily.", "The box is very light.", "I can't carry the box.", "I don't want the box."], correct: 2,
        explain: "\"Too + adjective + to\" always means it is NOT possible." },
      { q: "\"Unless you hurry, you'll be late.\" means...", options: ["If you don't hurry, you'll be late.", "You are always late.", "If you hurry, you'll be late.", "Hurrying makes you late."], correct: 0,
        explain: "Unless = if ... not." },
      { q: "\"She is not old enough to drive.\" means...", options: ["She is too young to drive.", "She drives very well.", "She is too old to drive.", "She doesn't like driving."], correct: 0,
        explain: "\"Not old enough\" and \"too young\" say the same thing from two directions." },
      { q: "\"I'd rather stay home tonight.\" means...", options: ["I have to stay home.", "I prefer to stay home.", "I stayed home yesterday.", "I can't leave home."], correct: 1,
        explain: "Would rather = prefer." },
      { q: "\"It's no use arguing with him.\" means...", options: ["He never argues.", "Arguing with him is pointless.", "You should argue more.", "He uses arguments well."], correct: 1,
        explain: "It's no use + -ing = there is no point in doing it." },
      { q: "\"Hardly anyone came to the meeting.\" means...", options: ["The meeting was difficult.", "Almost nobody came.", "Everyone came.", "The meeting was canceled."], correct: 1,
        explain: "Hardly anyone = almost no one." },
      { q: "\"You'd better take a jacket.\" means...", options: ["Your jacket looks good.", "I advise you to take a jacket.", "You took the better jacket.", "You must buy a jacket."], correct: 1,
        explain: "Had better = strong advice, a good idea to do it." },
    ],
  },
];

export function getAdvancedLesson(lessonId) {
  return ADVANCED_LESSONS.find((l) => l.id === lessonId) || null;
}

export function getExpertLesson(lessonId) {
  return EXPERT_LESSONS.find((l) => l.id === lessonId) || null;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Builds the shuffled queue for a grammar/usage lesson — one "grammar-mcq"
// question per authored item. Option order is shuffled per run; `correct`
// moves with its option via the isCorrect flag (same option shape the
// lesson engine already consumes).
export function buildGrammarExerciseQueue(lesson) {
  const questions = lesson.questions.map((mcq) => ({
    type: "grammar-mcq",
    mcq,
    options: shuffle(mcq.options.map((value, idx) => ({ value, isCorrect: idx === mcq.correct }))),
  }));
  return shuffle(questions);
}

export const GRAMMAR_QUESTION_STEM_LINES = {
  "grammar-mcq": [
    "Pick the option that fits best.",
    "Which one is correct here?",
    "Choose the best answer.",
  ],
};

// ---------------------------------------------------------------------------
// Four ways to drill one grammar question
// ---------------------------------------------------------------------------
// The Advanced and Expert tiers had a single exercise type, which is why they
// produced so few lessons: one authored question meant exactly one exercise,
// while a Beginner word yields six. These three extra types are DERIVED from
// the same authored record — no new content needed — and they test genuinely
// different things: recognition, error-spotting, reasoning, and production.
//
//   grammar-mcq    the sentence with a gap → pick the right form
//   grammar-fix    the sentence filled in WRONG → pick what it should be
//   grammar-why    the correct sentence → pick the reason it is correct
//   grammar-recall no options at all → build the answer from word/letter tiles

export const GRAMMAR_EXERCISE_TYPES = [
  { type: "grammar-mcq", tier: "recognition" },
  { type: "grammar-fix", tier: "recognition" },
  { type: "grammar-why", tier: "production" },
  { type: "grammar-recall", tier: "production" },
];

function correctValue(mcq) {
  return mcq.options[mcq.correct];
}

// A plausible wrong answer, chosen by position so the same question always
// produces the same "fix" exercise — a child who meets it twice sees the same
// error to spot, instead of a different one each time.
function firstWrongValue(mcq) {
  const wrong = mcq.options.filter((_, i) => i !== mcq.correct);
  return wrong[0];
}

function fillGap(question, value) {
  return question.includes("____") ? question.replace("____", value) : `${question} → ${value}`;
}

// Distractor explanations come from OTHER questions in the same pool, so the
// child has to recognise the RIGHT reason rather than pick the only sentence
// that sounds like an explanation.
function buildWhyOptions(mcq, pool) {
  const others = pool
    .filter((q) => q !== mcq && q.explain && q.explain !== mcq.explain)
    .map((q) => q.explain);

  const picked = [];
  // Deterministic spread through the pool rather than random sampling: it
  // guarantees three DIFFERENT distractors even when the pool is small.
  const step = Math.max(1, Math.floor(others.length / 3));
  for (let i = 0; picked.length < 3 && i < others.length; i += step) {
    if (!picked.includes(others[i])) picked.push(others[i]);
  }
  for (const other of others) {
    if (picked.length >= 3) break;
    if (!picked.includes(other)) picked.push(other);
  }

  return shuffle([
    { value: mcq.explain, isCorrect: true },
    ...picked.map((value) => ({ value, isCorrect: false })),
  ]);
}

export function buildGrammarQuestion(mcq, type, pool) {
  const answer = correctValue(mcq);

  switch (type) {
    case "grammar-fix":
      return {
        type,
        mcq,
        wrongSentence: fillGap(mcq.q, firstWrongValue(mcq)),
        options: shuffle(mcq.options.map((value) => ({ value, isCorrect: value === answer }))),
      };

    case "grammar-why":
      return {
        type,
        mcq,
        correctSentence: fillGap(mcq.q, answer),
        options: buildWhyOptions(mcq, pool || []),
      };

    case "grammar-recall":
      return {
        type,
        mcq,
        options: [],
        // Multi-word answers are rebuilt word by word; a single word letter by
        // letter. Spelling out "was watching" one letter at a time is tedious
        // and tests typing, not grammar.
        joiner: answer.includes(" ") ? " " : "",
        tokens: shuffle(answer.includes(" ") ? answer.split(" ") : answer.split("")),
      };

    case "grammar-mcq":
    default:
      return {
        type: "grammar-mcq",
        mcq,
        options: shuffle(mcq.options.map((value) => ({ value, isCorrect: value === answer }))),
      };
  }
}

export const GRAMMAR_STEM_LINES = {
  "grammar-mcq": GRAMMAR_QUESTION_STEM_LINES["grammar-mcq"],
  "grammar-fix": [
    "This one is wrong — what should it be?",
    "Spot the mistake and fix it.",
    "Something's off here. Pick the correction.",
  ],
  "grammar-why": [
    "This is correct — but why?",
    "Pick the reason this works.",
    "Which rule explains this?",
  ],
  "grammar-recall": [
    "Build the missing part yourself.",
    "No options this time — put it together.",
    "Your turn: assemble the answer.",
  ],
};
