// All lesson content lives here — words, translations, examples, emoji, and
// exercise generation. No secret content (unlike adult scenario prompts,
// which live server-side out of historical convention, not confidentiality),
// so there is no client/server split needed for lessons.

export const LESSONS = [
  {
    id: "animals",
    label: "Animals",
    emoji: "🐶",
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
    emoji: "👨‍👩‍👧",
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
    emoji: "🎨",
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
    emoji: "🍎",
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
    emoji: "🎒",
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
    emoji: "🖐️",
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
    emoji: "☀️",
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
    emoji: "🔢",
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

// Intermediate tier — simple-sentence-level content, not single words. Each
// sentence is authored once (en, ro, emoji, blankWord, blankSentence,
// distractorWords) and all 3 exercise types (fill-blank, unscramble,
// picture-sentence) derive their options from that one record — see
// buildSentenceExerciseQueue below.
export const SENTENCE_LESSONS = [
  {
    id: "animals",
    label: "Animals",
    emoji: "🦁",
    sentences: [
      { en: "The dog runs in the park.", ro: "Câinele aleargă în parc.", emoji: "🐕",
        blankWord: "runs", blankSentence: "The dog ____ in the park.",
        distractorWords: ["sleeps", "swims", "sits"] },
      { en: "The cat sleeps on the sofa.", ro: "Pisica doarme pe canapea.", emoji: "🐱",
        blankWord: "sleeps", blankSentence: "The cat ____ on the sofa.",
        distractorWords: ["jumps", "eats", "plays"] },
      { en: "Birds fly in the sky.", ro: "Păsările zboară pe cer.", emoji: "🐦",
        blankWord: "fly", blankSentence: "Birds ____ in the sky.",
        distractorWords: ["walk", "swim", "sing"] },
      { en: "Fish swim in the water.", ro: "Peștii înoată în apă.", emoji: "🐟",
        blankWord: "swim", blankSentence: "Fish ____ in the water.",
        distractorWords: ["fly", "run", "jump"] },
      { en: "The rabbit eats a carrot.", ro: "Iepurele mănâncă un morcov.", emoji: "🐰",
        blankWord: "eats", blankSentence: "The rabbit ____ a carrot.",
        distractorWords: ["drinks", "throws", "finds"] },
      { en: "The horse jumps over the fence.", ro: "Calul sare peste gard.", emoji: "🐴",
        blankWord: "jumps", blankSentence: "The horse ____ over the fence.",
        distractorWords: ["walks", "looks", "stops"] },
      { en: "The duck swims in the pond.", ro: "Rața înoată în iaz.", emoji: "🦆",
        blankWord: "swims", blankSentence: "The duck ____ in the pond.",
        distractorWords: ["flies", "runs", "sleeps"] },
      { en: "The frog jumps into the water.", ro: "Broasca sare în apă.", emoji: "🐸",
        blankWord: "jumps", blankSentence: "The frog ____ into the water.",
        distractorWords: ["walks", "swims", "sits"] },
    ],
  },
  {
    id: "family",
    label: "Family",
    emoji: "🏡",
    sentences: [
      { en: "My mother cooks dinner every day.", ro: "Mama mea gătește cina în fiecare zi.", emoji: "👩",
        blankWord: "cooks", blankSentence: "My mother ____ dinner every day.",
        distractorWords: ["buys", "eats", "cleans"] },
      { en: "My father drives to work.", ro: "Tatăl meu conduce la muncă.", emoji: "👨",
        blankWord: "drives", blankSentence: "My father ____ to work.",
        distractorWords: ["walks", "runs", "flies"] },
      { en: "My sister reads books every night.", ro: "Sora mea citește cărți în fiecare seară.", emoji: "👧",
        blankWord: "reads", blankSentence: "My sister ____ books every night.",
        distractorWords: ["writes", "buys", "draws"] },
      { en: "My brother plays football on weekends.", ro: "Fratele meu joacă fotbal în weekend.", emoji: "👦",
        blankWord: "plays", blankSentence: "My brother ____ football on weekends.",
        distractorWords: ["watches", "buys", "draws"] },
      { en: "My grandmother tells nice stories.", ro: "Bunica mea spune povești frumoase.", emoji: "👵",
        blankWord: "tells", blankSentence: "My grandmother ____ nice stories.",
        distractorWords: ["writes", "reads", "sings"] },
      { en: "My grandfather works in the garden.", ro: "Bunicul meu lucrează în grădină.", emoji: "👴",
        blankWord: "works", blankSentence: "My grandfather ____ in the garden.",
        distractorWords: ["sleeps", "sits", "walks"] },
      { en: "The baby sleeps in the crib.", ro: "Bebelușul doarme în pătuț.", emoji: "👶",
        blankWord: "sleeps", blankSentence: "The baby ____ in the crib.",
        distractorWords: ["plays", "cries", "eats"] },
      { en: "Our family eats dinner together.", ro: "Familia noastră mănâncă cina împreună.", emoji: "👨‍👩‍👧‍👦",
        blankWord: "eats", blankSentence: "Our family ____ dinner together.",
        distractorWords: ["cooks", "buys", "makes"] },
    ],
  },
  {
    id: "daily-routines",
    label: "Daily Routines",
    emoji: "⏰",
    sentences: [
      { en: "I wake up at seven.", ro: "Mă trezesc la șapte.", emoji: "⏰",
        blankWord: "wake", blankSentence: "I ____ up at seven.",
        distractorWords: ["stay", "sit", "look"] },
      { en: "She brushes her teeth.", ro: "Ea se spală pe dinți.", emoji: "🪥",
        blankWord: "brushes", blankSentence: "She ____ her teeth.",
        distractorWords: ["washes", "brings", "opens"] },
      { en: "We eat breakfast together.", ro: "Mâncăm micul dejun împreună.", emoji: "🍳",
        blankWord: "eat", blankSentence: "We ____ breakfast together.",
        distractorWords: ["make", "buy", "want"] },
      { en: "He goes to school by bus.", ro: "El merge la școală cu autobuzul.", emoji: "🚌",
        blankWord: "goes", blankSentence: "He ____ to school by bus.",
        distractorWords: ["runs", "walks", "rides"] },
      { en: "I do my homework after school.", ro: "Îmi fac tema după școală.", emoji: "📚",
        blankWord: "do", blankSentence: "I ____ my homework after school.",
        distractorWords: ["make", "have", "take"] },
      { en: "They play outside in the evening.", ro: "Ei se joacă afară seara.", emoji: "🌆",
        blankWord: "play", blankSentence: "They ____ outside in the evening.",
        distractorWords: ["stay", "walk", "run"] },
      { en: "She takes a bath before bed.", ro: "Ea face baie înainte de culcare.", emoji: "🛁",
        blankWord: "takes", blankSentence: "She ____ a bath before bed.",
        distractorWords: ["makes", "does", "gets"] },
      { en: "I go to sleep at nine.", ro: "Mă duc la culcare la nouă.", emoji: "🌙",
        blankWord: "go", blankSentence: "I ____ to sleep at nine.",
        distractorWords: ["fall", "am", "get"] },
    ],
  },
  {
    id: "school",
    label: "School",
    emoji: "✏️",
    sentences: [
      { en: "I read a book in class.", ro: "Citesc o carte în clasă.", emoji: "📖",
        blankWord: "read", blankSentence: "I ____ a book in class.",
        distractorWords: ["write", "draw", "buy"] },
      { en: "She writes her name on the paper.", ro: "Ea își scrie numele pe hârtie.", emoji: "✏️",
        blankWord: "writes", blankSentence: "She ____ her name on the paper.",
        distractorWords: ["reads", "draws", "erases"] },
      { en: "The teacher explains the lesson.", ro: "Profesoara explică lecția.", emoji: "🍎",
        blankWord: "explains", blankSentence: "The teacher ____ the lesson.",
        distractorWords: ["reads", "writes", "forgets"] },
      { en: "We sit at our desks.", ro: "Ne așezăm la bănci.", emoji: "🪑",
        blankWord: "sit", blankSentence: "We ____ at our desks.",
        distractorWords: ["stand", "jump", "run"] },
      { en: "I carry my backpack to school.", ro: "Îmi car ghiozdanul la școală.", emoji: "🎒",
        blankWord: "carry", blankSentence: "I ____ my backpack to school.",
        distractorWords: ["forget", "lose", "open"] },
      { en: "Our classroom has big windows.", ro: "Clasa noastră are ferestre mari.", emoji: "🏫",
        blankWord: "has", blankSentence: "Our classroom ____ big windows.",
        distractorWords: ["needs", "sees", "makes"] },
      { en: "My friend helps me with math.", ro: "Prietenul meu mă ajută la matematică.", emoji: "🧑‍🤝‍🧑",
        blankWord: "helps", blankSentence: "My friend ____ me with math.",
        distractorWords: ["watches", "asks", "tells"] },
      { en: "I finish my homework at home.", ro: "Îmi termin tema acasă.", emoji: "📝",
        blankWord: "finish", blankSentence: "I ____ my homework at home.",
        distractorWords: ["start", "forget", "lose"] },
    ],
  },
  {
    id: "food",
    label: "Food",
    emoji: "🍕",
    sentences: [
      { en: "I eat an apple every morning.", ro: "Mănânc un măr în fiecare dimineață.", emoji: "🍎",
        blankWord: "eat", blankSentence: "I ____ an apple every morning.",
        distractorWords: ["drink", "buy", "cook"] },
      { en: "She likes bananas a lot.", ro: "Ei îi plac foarte mult bananele.", emoji: "🍌",
        blankWord: "likes", blankSentence: "She ____ bananas a lot.",
        distractorWords: ["hates", "buys", "cooks"] },
      { en: "We drink milk at breakfast.", ro: "Bem lapte la micul dejun.", emoji: "🥛",
        blankWord: "drink", blankSentence: "We ____ milk at breakfast.",
        distractorWords: ["eat", "buy", "pour"] },
      { en: "My mother bakes bread on Sundays.", ro: "Mama mea coace pâine duminica.", emoji: "🍞",
        blankWord: "bakes", blankSentence: "My mother ____ bread on Sundays.",
        distractorWords: ["buys", "eats", "cuts"] },
      { en: "I want a cookie, please.", ro: "Vreau un fursec, te rog.", emoji: "🍪",
        blankWord: "want", blankSentence: "I ____ a cookie, please.",
        distractorWords: ["make", "hide", "throw"] },
      { en: "He cooks eggs for dinner.", ro: "El gătește ouă la cină.", emoji: "🥚",
        blankWord: "cooks", blankSentence: "He ____ eggs for dinner.",
        distractorWords: ["buys", "washes", "breaks"] },
      { en: "We share cheese on the sandwich.", ro: "Împărțim brânză pe sandviș.", emoji: "🧀",
        blankWord: "share", blankSentence: "We ____ cheese on the sandwich.",
        distractorWords: ["buy", "cut", "find"] },
      { en: "I drink water when I'm thirsty.", ro: "Beau apă când mi-e sete.", emoji: "💧",
        blankWord: "drink", blankSentence: "I ____ water when I'm thirsty.",
        distractorWords: ["eat", "pour", "buy"] },
    ],
  },
  {
    id: "weather",
    label: "Weather",
    emoji: "🌈",
    sentences: [
      { en: "The sun shines in the summer.", ro: "Soarele strălucește vara.", emoji: "☀️",
        blankWord: "shines", blankSentence: "The sun ____ in the summer.",
        distractorWords: ["falls", "runs", "hides"] },
      { en: "It rains a lot in April.", ro: "Plouă mult în aprilie.", emoji: "🌧️",
        blankWord: "rains", blankSentence: "It ____ a lot in April.",
        distractorWords: ["snows", "shines", "blows"] },
      { en: "Snow falls in winter.", ro: "Zăpada cade iarna.", emoji: "❄️",
        blankWord: "falls", blankSentence: "Snow ____ in winter.",
        distractorWords: ["melts", "shines", "blows"] },
      { en: "The wind blows through the trees.", ro: "Vântul suflă printre copaci.", emoji: "💨",
        blankWord: "blows", blankSentence: "The wind ____ through the trees.",
        distractorWords: ["falls", "shines", "stops"] },
      { en: "Clouds cover the sky today.", ro: "Norii acoperă cerul azi.", emoji: "☁️",
        blankWord: "cover", blankSentence: "Clouds ____ the sky today.",
        distractorWords: ["open", "clean", "paint"] },
      { en: "I feel hot in the summer.", ro: "Simt cald vara.", emoji: "🥵",
        blankWord: "feel", blankSentence: "I ____ hot in the summer.",
        distractorWords: ["look", "find", "make"] },
      { en: "We feel cold in winter.", ro: "Simțim frig iarna.", emoji: "🥶",
        blankWord: "feel", blankSentence: "We ____ cold in winter.",
        distractorWords: ["look", "find", "make"] },
      { en: "A storm comes at night.", ro: "O furtună vine noaptea.", emoji: "⛈️",
        blankWord: "comes", blankSentence: "A storm ____ at night.",
        distractorWords: ["goes", "stops", "waits"] },
    ],
  },
  {
    id: "prepositions",
    label: "Prepositions",
    emoji: "📦",
    sentences: [
      { en: "The cat is under the table.", ro: "Pisica este sub masă.", emoji: "🐱",
        blankWord: "under", blankSentence: "The cat is ____ the table.",
        distractorWords: ["on", "behind", "next to"] },
      { en: "The book is on the desk.", ro: "Cartea este pe bancă.", emoji: "📖",
        blankWord: "on", blankSentence: "The book is ____ the desk.",
        distractorWords: ["under", "behind", "in"] },
      { en: "The dog is next to the door.", ro: "Câinele este lângă ușă.", emoji: "🐕",
        blankWord: "next to", blankSentence: "The dog is ____ the door.",
        distractorWords: ["under", "in", "behind"] },
      { en: "The ball is behind the sofa.", ro: "Mingea este în spatele canapelei.", emoji: "⚽",
        blankWord: "behind", blankSentence: "The ball is ____ the sofa.",
        distractorWords: ["on", "under", "next to"] },
      { en: "The toy is in the box.", ro: "Jucăria este în cutie.", emoji: "🧸",
        blankWord: "in", blankSentence: "The toy is ____ the box.",
        distractorWords: ["on", "under", "behind"] },
      { en: "The bird is on the roof.", ro: "Pasărea este pe acoperiș.", emoji: "🐦",
        blankWord: "on", blankSentence: "The bird is ____ the roof.",
        distractorWords: ["under", "in", "next to"] },
      { en: "The shoes are under the bed.", ro: "Pantofii sunt sub pat.", emoji: "👟",
        blankWord: "under", blankSentence: "The shoes are ____ the bed.",
        distractorWords: ["on", "behind", "in"] },
      { en: "The car is next to the house.", ro: "Mașina este lângă casă.", emoji: "🚗",
        blankWord: "next to", blankSentence: "The car is ____ the house.",
        distractorWords: ["under", "on", "in"] },
    ],
  },
  {
    id: "questions",
    label: "Questions",
    emoji: "❓",
    sentences: [
      { en: "Where is the dog?", ro: "Unde este câinele?", emoji: "🐕",
        blankWord: "Where", blankSentence: "____ is the dog?",
        distractorWords: ["What", "Who", "When"] },
      { en: "What is she eating?", ro: "Ce mănâncă ea?", emoji: "🍎",
        blankWord: "What", blankSentence: "____ is she eating?",
        distractorWords: ["Where", "Who", "Why"] },
      { en: "Who is your best friend?", ro: "Cine e cel mai bun prieten al tău?", emoji: "🧑‍🤝‍🧑",
        blankWord: "Who", blankSentence: "____ is your best friend?",
        distractorWords: ["What", "Where", "When"] },
      { en: "When is your birthday?", ro: "Când e ziua ta de naștere?", emoji: "🎂",
        blankWord: "When", blankSentence: "____ is your birthday?",
        distractorWords: ["Where", "What", "Who"] },
      { en: "How are you today?", ro: "Ce mai faci azi?", emoji: "😊",
        blankWord: "How", blankSentence: "____ are you today?",
        distractorWords: ["What", "Where", "Who"] },
      { en: "Why is she happy?", ro: "De ce este ea fericită?", emoji: "😃",
        blankWord: "Why", blankSentence: "____ is she happy?",
        distractorWords: ["Where", "When", "Who"] },
      { en: "How many apples do you have?", ro: "Câte mere ai?", emoji: "🍎",
        blankWord: "How many", blankSentence: "____ apples do you have?",
        distractorWords: ["What", "Where", "Who"] },
      { en: "Whose bag is this?", ro: "A cui geantă este asta?", emoji: "🎒",
        blankWord: "Whose", blankSentence: "____ bag is this?",
        distractorWords: ["What", "Where", "Who"] },
    ],
  },
];

export function getSentenceLesson(lessonId) {
  return SENTENCE_LESSONS.find((l) => l.id === lessonId) || null;
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

function buildBlankOptions(sentence) {
  const options = [
    { value: sentence.blankWord, isCorrect: true },
    ...sentence.distractorWords.map((w) => ({ value: w, isCorrect: false })),
  ];
  return shuffle(options);
}

function buildPictureSentenceOptions(sentence) {
  const options = [
    { value: sentence.en, isCorrect: true },
    ...sentence.distractorWords.map((w) => ({
      value: sentence.blankSentence.replace("____", w),
      isCorrect: false,
    })),
  ];
  return shuffle(options);
}

// Builds the 24-question shuffled exercise queue for an Intermediate lesson
// (8 sentences x 3 types: fill-blank, unscramble, picture-sentence). Every
// exercise type derives its options from the same authored sentence record —
// no separate distractor content needed per type (see SENTENCE_LESSONS
// comment above buildBlankOptions' call sites for the reasoning).
export function buildSentenceExerciseQueue(lesson) {
  const questions = [];
  for (const sentence of lesson.sentences) {
    questions.push({ type: "fill-blank", sentence, options: buildBlankOptions(sentence) });
    questions.push({ type: "unscramble", sentence, tokens: shuffle(sentence.en.split(" ")) });
    questions.push({ type: "picture-sentence", sentence, options: buildPictureSentenceOptions(sentence) });
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

export const SENTENCE_QUESTION_STEM_LINES = {
  "fill-blank": [
    "Can you find the missing word?",
    "Ooh, what word goes here?",
    "Let's fill in the blank — ready?",
  ],
  unscramble: [
    "Can you put these words in the right order?",
    "Ooh, these words got all mixed up! Can you fix them?",
    "Let's build the sentence together — tap the words in order!",
  ],
  "picture-sentence": [
    "Which sentence matches this picture?",
    "Can you pick the sentence that's really true?",
    "Ooh, look closely — which one is right?",
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
