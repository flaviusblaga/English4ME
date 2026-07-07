// All lesson content lives here — words, translations, examples, emoji, and
// exercise generation. No secret content (unlike adult scenario prompts,
// which live server-side out of historical convention, not confidentiality),
// so there is no client/server split needed for lessons.

export const LESSONS = [
  {
    id: "animals",
    label: "Animals",
    words: [
      { en: "dog", ro: "câine", emoji: "🐶", example: "I have a dog. My dog is brown." },
      { en: "cat", ro: "pisică", emoji: "🐱", example: "The cat is sleeping on the chair." },
      { en: "bird", ro: "pasăre", emoji: "🐦", example: "A bird can fly in the sky." },
      { en: "fish", ro: "pește", emoji: "🐟", example: "The fish swims in the water." },
      { en: "rabbit", ro: "iepure", emoji: "🐰", example: "The rabbit has long ears." },
      { en: "horse", ro: "cal", emoji: "🐴", example: "The horse runs very fast." },
      { en: "duck", ro: "rață", emoji: "🦆", example: "The duck says quack, quack!" },
      { en: "frog", ro: "broască", emoji: "🐸", example: "The frog jumps into the pond." },
    ],
  },
  {
    id: "family",
    label: "Family",
    words: [
      { en: "mother", ro: "mamă", emoji: "👩", example: "My mother makes breakfast every day." },
      { en: "father", ro: "tată", emoji: "👨", example: "My father drives me to school." },
      { en: "sister", ro: "soră", emoji: "👧", example: "My sister is younger than me." },
      { en: "brother", ro: "frate", emoji: "👦", example: "My brother likes to play football." },
      { en: "grandmother", ro: "bunica", emoji: "👵", example: "My grandmother tells nice stories." },
      { en: "grandfather", ro: "bunicul", emoji: "👴", example: "My grandfather works in the garden." },
      { en: "baby", ro: "bebeluș", emoji: "👶", example: "The baby is sleeping in the crib." },
      { en: "family", ro: "familie", emoji: "👨‍👩‍👧‍👦", example: "I love my family very much." },
    ],
  },
  {
    id: "colors",
    label: "Colors",
    words: [
      { en: "red", ro: "roșu", emoji: "🟥", example: "The apple is red." },
      { en: "blue", ro: "albastru", emoji: "🟦", example: "The sky is blue today." },
      { en: "yellow", ro: "galben", emoji: "🟨", example: "The sun is yellow." },
      { en: "green", ro: "verde", emoji: "🟩", example: "The grass is green." },
      { en: "orange", ro: "portocaliu", emoji: "🟧", example: "I like to eat an orange orange!" },
      { en: "purple", ro: "mov", emoji: "🟪", example: "My favorite color is purple." },
      { en: "pink", ro: "roz", emoji: "🩷", example: "Her dress is pink." },
      { en: "black", ro: "negru", emoji: "⬛", example: "The cat is black and white." },
    ],
  },
  {
    id: "food",
    label: "Food",
    words: [
      { en: "apple", ro: "măr", emoji: "🍎", example: "I eat an apple every day." },
      { en: "banana", ro: "banană", emoji: "🍌", example: "The banana is yellow." },
      { en: "bread", ro: "pâine", emoji: "🍞", example: "We eat bread with breakfast." },
      { en: "milk", ro: "lapte", emoji: "🥛", example: "I drink milk every morning." },
      { en: "water", ro: "apă", emoji: "💧", example: "Please drink more water." },
      { en: "cheese", ro: "brânză", emoji: "🧀", example: "I like cheese on my sandwich." },
      { en: "egg", ro: "ou", emoji: "🥚", example: "My mother cooked an egg." },
      { en: "cookie", ro: "fursec", emoji: "🍪", example: "Can I have a cookie, please?" },
    ],
  },
  {
    id: "school",
    label: "School",
    words: [
      { en: "book", ro: "carte", emoji: "📖", example: "I am reading a book." },
      { en: "pencil", ro: "creion", emoji: "✏️", example: "I write with my pencil." },
      { en: "teacher", ro: "profesoară", emoji: "🍎", example: "My teacher is very kind." },
      { en: "desk", ro: "bancă", emoji: "🪑", example: "I sit at my desk." },
      { en: "backpack", ro: "ghiozdan", emoji: "🎒", example: "My backpack is heavy today." },
      { en: "classroom", ro: "clasă", emoji: "🏫", example: "Our classroom is very big." },
      { en: "friend", ro: "prieten", emoji: "🧑‍🤝‍🧑", example: "She is my best friend." },
      { en: "homework", ro: "temă", emoji: "📝", example: "I finished my homework." },
    ],
  },
  {
    id: "body",
    label: "Body",
    words: [
      { en: "head", ro: "cap", emoji: "🗣️", example: "Touch your head." },
      { en: "hand", ro: "mână", emoji: "✋", example: "Wash your hands, please." },
      { en: "foot", ro: "picior", emoji: "🦶", example: "My foot hurts a little." },
      { en: "eye", ro: "ochi", emoji: "👁️", example: "She has blue eyes." },
      { en: "ear", ro: "ureche", emoji: "👂", example: "My ear itches." },
      { en: "nose", ro: "nas", emoji: "👃", example: "The dog has a big nose." },
      { en: "mouth", ro: "gură", emoji: "👄", example: "Open your mouth, please." },
      { en: "hair", ro: "păr", emoji: "💇", example: "My hair is very long." },
    ],
  },
  {
    id: "weather",
    label: "Weather",
    words: [
      { en: "sun", ro: "soare", emoji: "☀️", example: "The sun is very bright today." },
      { en: "rain", ro: "ploaie", emoji: "🌧️", example: "I like to jump in the rain." },
      { en: "snow", ro: "zăpadă", emoji: "❄️", example: "We built a snowman in the snow." },
      { en: "wind", ro: "vânt", emoji: "💨", example: "The wind is blowing hard." },
      { en: "cloud", ro: "nor", emoji: "☁️", example: "That cloud looks like a dog!" },
      { en: "hot", ro: "cald", emoji: "🥵", example: "It is very hot today." },
      { en: "cold", ro: "rece", emoji: "🥶", example: "It is cold outside." },
      { en: "storm", ro: "furtună", emoji: "⛈️", example: "There is a big storm tonight." },
    ],
  },
  {
    id: "numbers",
    label: "Numbers",
    isNumbers: true, // picture-match uses keycap number emoji, not thematic emoji
    words: [
      { en: "one", ro: "unu", emoji: "1️⃣", example: "I have one dog." },
      { en: "two", ro: "doi", emoji: "2️⃣", example: "I have two hands." },
      { en: "three", ro: "trei", emoji: "3️⃣", example: "There are three books." },
      { en: "four", ro: "patru", emoji: "4️⃣", example: "The cat has four legs." },
      { en: "five", ro: "cinci", emoji: "5️⃣", example: "I have five fingers." },
      { en: "six", ro: "șase", emoji: "6️⃣", example: "There are six eggs." },
      { en: "seven", ro: "șapte", emoji: "7️⃣", example: "There are seven days in a week." },
      { en: "eight", ro: "opt", emoji: "8️⃣", example: "The spider has eight legs." },
    ],
  },
];

export function getLesson(lessonId) {
  return LESSONS.find((l) => l.id === lessonId) || null;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildOptions(allWords, correctWord, field) {
  const distractors = shuffle(allWords.filter((w) => w.en !== correctWord.en)).slice(0, 3);
  return shuffle(
    [correctWord, ...distractors].map((w) => ({ value: w[field], isCorrect: w.en === correctWord.en }))
  );
}

// Builds the 16-question shuffled exercise queue for a lesson (8 words x 2 types).
export function buildExerciseQueue(lesson) {
  const questions = [];
  for (const word of lesson.words) {
    questions.push({ type: "picture", word, options: buildOptions(lesson.words, word, "emoji") });
    questions.push({ type: "translation", word, options: buildOptions(lesson.words, word, "en") });
  }
  return shuffle(questions);
}

export function getRandomLine(lines) {
  return lines[Math.floor(Math.random() * lines.length)];
}

// Deliberately NOT prefixed with "Bobo:"/"Fizz:" — whichever mascot the child
// has selected (see js/lessons.js's mascot preference) delivers these lines,
// so the pool has to work no matter who's speaking. Lines also avoid naming
// the *other* mascot, for the same reason.
export const QUESTION_STEM_LINES = {
  picture: [
    "Ooh, can you find the picture for this word?",
    "Quick, which picture matches?? Go go go!",
    "Let's see if you can spot it — ready?",
  ],
  translation: [
    "Do you know the English word for this one?",
    "Ooh, tricky! Which English word means this?",
    "I bet you know this one — can you?",
  ],
};

export const CORRECT_REACTION_LINES = [
  "YES! You got it! High paw!",
  "Whoa, you're SO fast! Nailed it!",
  "That's exactly right — you're basically an English expert now!",
  "Woohoo! Did you see that?!",
  "Yesss! Perfect! Let's keep going!",
  "Ha! Knew you had it! Great job!",
];

export const INCORRECT_REACTION_LINES = [
  "Ooh, close! It's actually this one — but hey, now you know it!",
  "Umm, not quite — it's this one! You'll get it next time for sure.",
  "That's okay! It's this one — one more word for your brain collection!",
  "Almost! The answer was this one — you're still doing great.",
  "No worries at all — it's this one. Even I mix these up sometimes!",
  "Eek, tricky one! It's this — but look how many you're getting right already!",
];

export const LESSON_MENU_INTRO_LINES = [
  "Pick any lesson you want — I'll be right here with you!",
  "Ooh, so many lessons! Which one sounds fun today?",
  "You choose! There's no wrong lesson to start with!",
];

export function getLessonCompleteLine(score, total) {
  const ratio = score / total;
  if (ratio >= 0.75) return "Wow, look at you go! That was amazing!";
  if (ratio >= 0.4375) return "Great practice! You're learning so many words!";
  return "Nice try! Want to play this lesson again? Practice makes it stick!";
}
