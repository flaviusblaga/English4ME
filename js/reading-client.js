// Reading-comprehension content for the Expert tier — static, curated once,
// zero API cost per use (same content philosophy as the lesson word banks
// and sentence banks). Each passage is 80-150 words with 4 multiple-choice
// comprehension questions; `correct` is the index into `options`.

// Beginner reading — very short, simple present-tense texts (30-45 words) with
// 3 easy comprehension questions each. Meant to be read AND listened to (the
// reading screen speaks the text aloud).
export const BEGINNER_READING = [
  {
    id: "b-my-dog",
    title: "My Dog",
    emoji: "🐶",
    text: "I have a dog. His name is Max. Max is brown and small. He likes to run and play. Every day, we play in the park. Max is my best friend.",
    questions: [
      { q: "What is the dog's name?", options: ["Max", "Tom", "Rex", "Sam"], correct: 0 },
      { q: "What color is Max?", options: ["Black", "White", "Brown", "Grey"], correct: 2 },
      { q: "Where do they play?", options: ["At school", "In the park", "At home", "In the car"], correct: 1 },
    ],
  },
  {
    id: "b-red-apple",
    title: "The Red Apple",
    emoji: "🍎",
    text: "Ana has a red apple. The apple is big and sweet. She eats it after lunch. Apples are good for you. Ana likes apples very much.",
    questions: [
      { q: "What color is the apple?", options: ["Green", "Red", "Yellow", "Blue"], correct: 1 },
      { q: "How does the apple taste?", options: ["Sour", "Salty", "Sweet", "Bitter"], correct: 2 },
      { q: "When does Ana eat the apple?", options: ["After lunch", "Before school", "At night", "In the car"], correct: 0 },
    ],
  },
  {
    id: "b-sunny-day",
    title: "A Sunny Day",
    emoji: "☀️",
    text: "Today the sun is out. The sky is blue. Tom and his sister go to the beach. They play in the sand and swim in the sea. It is a happy day.",
    questions: [
      { q: "How is the sky today?", options: ["Grey", "Blue", "Green", "Dark"], correct: 1 },
      { q: "Where do Tom and his sister go?", options: ["To school", "To the shop", "To the beach", "To the park"], correct: 2 },
      { q: "What do they do in the sea?", options: ["Sleep", "Swim", "Read", "Eat"], correct: 1 },
    ],
  },
  {
    id: "b-my-cat",
    title: "My Cat",
    emoji: "🐱",
    text: "Lily has a small cat. The cat is white and soft. It sleeps all day on the bed. At night, the cat plays with a ball. Lily loves her cat.",
    questions: [
      { q: "What color is the cat?", options: ["Black", "Brown", "White", "Orange"], correct: 2 },
      { q: "Where does the cat sleep?", options: ["On the bed", "On the chair", "In the box", "On the floor"], correct: 0 },
      { q: "When does the cat play?", options: ["In the morning", "At night", "After lunch", "At school"], correct: 1 },
    ],
  },
];

// Intermediate reading — short stories (55-75 words) with a little more plot and
// 3 comprehension questions each.
export const INTERMEDIATE_READING = [
  {
    id: "i-lost-ball",
    title: "The Lost Ball",
    emoji: "⚽",
    text: "Sam and Dan were playing football in the garden. Sam kicked the ball too hard, and it flew over the fence into Mrs. Green's yard. The boys were afraid to ask for it. But Mrs. Green was kind. She smiled, gave the ball back, and even brought them cold lemonade. After that, the boys always said hello to her.",
    questions: [
      { q: "Where did the ball go?", options: ["Into the river", "Over the fence into Mrs. Green's yard", "Onto the roof", "Under the car"], correct: 1 },
      { q: "How did the boys feel at first?", options: ["Happy", "Angry", "Afraid to ask", "Bored"], correct: 2 },
      { q: "What did Mrs. Green do?", options: ["She kept the ball", "She was angry", "She gave the ball back and brought lemonade", "She called their parents"], correct: 2 },
    ],
  },
  {
    id: "i-new-girl",
    title: "The New Girl",
    emoji: "🏫",
    text: "On Monday, a new girl came to Maria's class. Her name was Elena, and she was very quiet. At lunch, she sat alone. Maria walked over and asked her to join them. Elena smiled for the first time that day. Soon they were laughing together, and Elena wasn't quiet anymore.",
    questions: [
      { q: "What was the new girl's name?", options: ["Maria", "Elena", "Ana", "Lily"], correct: 1 },
      { q: "Where did Elena sit at lunch?", options: ["With Maria", "Alone", "With the teacher", "Outside"], correct: 1 },
      { q: "What did Maria do?", options: ["She laughed at Elena", "She ignored her", "She asked Elena to join them", "She told the teacher"], correct: 2 },
    ],
  },
  {
    id: "i-rainy-trip",
    title: "The Rainy Trip",
    emoji: "🌧️",
    text: "The family planned a picnic in the mountains. But when they arrived, it started to rain. Instead of going home, Dad found a small cabin. They played games, told stories, and drank hot tea while the rain fell outside. Everyone agreed it was the best picnic ever, even without the sun.",
    questions: [
      { q: "What did the family plan?", options: ["A picnic in the mountains", "A day at the beach", "A trip to the city", "A visit to grandma"], correct: 0 },
      { q: "What happened when they arrived?", options: ["It got very hot", "It started to rain", "They got lost", "The car broke down"], correct: 1 },
      { q: "What did they do in the cabin?", options: ["They slept all day", "They went home", "They played games and told stories", "They watched TV"], correct: 2 },
    ],
  },
  {
    id: "i-brave-turtle",
    title: "The Brave Little Turtle",
    emoji: "🐢",
    text: "All the animals laughed at Tilly the turtle because she was so slow. One hot day, a small bird fell from its nest near the river. The fast animals ran away, scared of the water. But slow Tilly walked into the river, put the bird on her shell, and carried it safely to the shore. Nobody laughed after that.",
    questions: [
      { q: "Why did the animals laugh at Tilly?", options: ["She was slow", "She was loud", "She was small", "She was afraid"], correct: 0 },
      { q: "What fell near the river?", options: ["A leaf", "A small bird", "A nest of eggs", "A fish"], correct: 1 },
      { q: "How did Tilly save the bird?", options: ["She called for help", "She flew to it", "She carried it on her shell", "She pushed it with a stick"], correct: 2 },
    ],
  },
];

export const READING_PASSAGES = [
  {
    id: "the-lighthouse-keeper",
    title: "The Lighthouse Keeper's Cat",
    emoji: "🐱",
    text: "For forty years, Mr. Halloran kept the lighthouse on Storm Point, and for thirty-nine of them, he did it alone. Then, one October morning, a thin grey cat appeared at his door, soaked from the night's rain. He named her Compass, because she always sat facing north. Visitors found it strange that such a solitary man talked constantly to a cat, but Mr. Halloran didn't mind. On foggy nights, when the great lamp turned slowly above them, Compass would climb to the gallery and watch the beam sweep across the water. The fishermen in the village below joked that Storm Point now had two keepers, and honestly, they weren't entirely wrong.",
    questions: [
      { q: "How long did Mr. Halloran work at the lighthouse completely alone?",
        options: ["Forty years", "Thirty-nine years", "One year", "Thirty years"], correct: 1 },
      { q: "Why did he name the cat Compass?",
        options: ["She was found near a compass", "She liked to travel", "She always sat facing north", "She had a compass-shaped mark"], correct: 2 },
      { q: "What did Compass do on foggy nights?",
        options: ["She hid inside the lighthouse", "She watched the beam from the gallery", "She went fishing with the villagers", "She slept next to the lamp"], correct: 1 },
      { q: "What did the fishermen joke about?",
        options: ["That the lighthouse was haunted", "That Mr. Halloran talked too much", "That the cat was afraid of water", "That Storm Point had two keepers"], correct: 3 },
    ],
  },
  {
    id: "the-science-fair",
    title: "The Science Fair Surprise",
    emoji: "🔬",
    text: "Maya had worked on her volcano model for three weeks, but the night before the science fair, disaster struck: her little brother knocked it off the table, and the whole thing cracked in half. Instead of panicking, Maya stared at the broken model and had an idea. She spent the evening turning the crack into a feature, painting glowing lava inside the split and adding a label that read 'Cross-section of an active volcano.' The next day, the judges spent longer at her table than at anyone else's. 'Most models only show the outside,' one judge said, impressed. Maya won second place, and she never told anyone except her brother how the cross-section was really invented.",
    questions: [
      { q: "How long had Maya worked on her project?",
        options: ["Three days", "Three weeks", "Three months", "One week"], correct: 1 },
      { q: "What happened the night before the fair?",
        options: ["Maya forgot her project at school", "The paint dried in the wrong color", "Her brother accidentally broke the model", "The judges canceled the fair"], correct: 2 },
      { q: "How did Maya solve the problem?",
        options: ["She built a completely new model", "She turned the crack into a cross-section", "She borrowed a friend's project", "She glued the model back together"], correct: 1 },
      { q: "What did the judge find impressive?",
        options: ["The model showed the inside, not just the outside", "The model was the biggest at the fair", "The lava actually erupted", "Maya explained it in three languages"], correct: 0 },
    ],
  },
  {
    id: "the-midnight-train",
    title: "The Midnight Train",
    emoji: "🚂",
    text: "The station at Greyfield was supposed to be closed at midnight, which is exactly why Tom and his grandfather were there. Every year, on the last night of August, they came to watch the freight train pass through — a tradition that started before Tom could walk. His grandfather claimed the train carried everything from pianos to circus equipment, and Tom had long suspected he was inventing half of it. But last year, through a gap in one wagon's door, Tom had glimpsed something that looked remarkably like a carousel horse. Tonight, as the distant rumble grew louder, his grandfather smiled and said, 'Wonder what impossible thing rides through tonight.' Tom didn't answer. He was already watching the tracks.",
    questions: [
      { q: "When did Tom and his grandfather visit the station?",
        options: ["Every midnight", "On the last night of August each year", "Only when trains carried circus equipment", "Every weekend"], correct: 1 },
      { q: "How long had this tradition existed?",
        options: ["Since last year", "Since Tom was ten", "Since before Tom could walk", "Since the station closed"], correct: 2 },
      { q: "What did Tom see through the wagon door last year?",
        options: ["A piano", "Something like a carousel horse", "Circus performers", "His grandfather's old luggage"], correct: 1 },
      { q: "What does Tom's silence at the end suggest?",
        options: ["He was angry with his grandfather", "He was bored by the tradition", "He was too focused and excited to talk", "He had fallen asleep"], correct: 2 },
    ],
  },
  {
    id: "the-recipe-book",
    title: "Grandma's Recipe Book",
    emoji: "🍰",
    text: "When the family finally sorted through Grandma Elena's kitchen, everyone wanted the famous recipe book — the one with the plum dumplings recipe that no restaurant had ever matched. But when Ana opened the worn notebook, she started laughing. The measurements made no sense: 'flour — enough,' 'sugar — until it tastes right,' 'butter — more than you think.' There were no times, no temperatures, only notes like 'knead until your arms complain.' Her uncle wanted to throw it away, but Ana kept it. It took her two years of failed batches to understand what Grandma meant, and the day her dumplings finally tasted right, she added her own note to the margin: 'patience — all of it.'",
    questions: [
      { q: "Why did everyone want the recipe book?",
        options: ["It was worth a lot of money", "It contained a famous plum dumplings recipe", "It was the only photo of Grandma", "A restaurant wanted to buy it"], correct: 1 },
      { q: "Why did Ana laugh when she opened it?",
        options: ["The measurements were vague and unusual", "It was full of jokes", "It was written in another language", "The pages were blank"], correct: 0 },
      { q: "What did Ana's uncle want to do with the book?",
        options: ["Sell it", "Frame it", "Throw it away", "Give it to a restaurant"], correct: 2 },
      { q: "What did Ana add to the book at the end?",
        options: ["Exact measurements for every recipe", "A note that said patience was the key ingredient", "Her own dumpling recipe", "A photo of her grandmother"], correct: 1 },
    ],
  },
  {
    id: "the-robot-gardener",
    title: "The Robot Gardener",
    emoji: "🤖",
    text: "The city of Brightwater installed its first robot gardener in Central Park last spring, and the results surprised everyone — including its programmers. The robot, nicknamed Sprout by local children, was designed simply to water plants and remove weeds. But its learning software began noticing patterns nobody had programmed: it learned that the roses near the fountain needed less water on windy days, and that a certain oak attracted birds that helpfully ate harmful insects. By autumn, Sprout was leaving certain 'weeds' alone entirely — wildflowers that fed the park's bees. Some gardeners were skeptical at first, worried a machine would make the park feel artificial. Instead, Central Park had its greenest year in decades.",
    questions: [
      { q: "What was Sprout originally designed to do?",
        options: ["Plant new trees", "Water plants and remove weeds", "Count the park's visitors", "Feed the birds"], correct: 1 },
      { q: "What did Sprout learn about the roses near the fountain?",
        options: ["They needed less water on windy days", "They attracted harmful insects", "They needed to be moved", "They bloomed only in autumn"], correct: 0 },
      { q: "Why did Sprout stop removing certain weeds?",
        options: ["Its software broke down", "They were too difficult to reach", "They were wildflowers that fed the bees", "The children asked it to stop"], correct: 2 },
      { q: "How did the skeptical gardeners' worry turn out?",
        options: ["They were right — the park looked artificial", "The opposite happened — the park had its greenest year", "The robot was removed in autumn", "The park lost all its birds"], correct: 1 },
    ],
  },
  {
    id: "the-forgotten-language",
    title: "The Forgotten Language",
    emoji: "📜",
    text: "Professor Ionescu spent her career studying languages that no one speaks anymore, but her favorite discovery happened by accident. While recording an elderly shepherd in the mountains for a project about folk songs, she noticed he counted his sheep using words she had never heard — not Romanian, not Hungarian, not anything in her books. The shepherd shrugged: 'My grandfather counted this way, and his grandfather before him. It's just how sheep are counted.' It turned out to be a counting system centuries old, surviving in exactly one valley, used by exactly eleven families, and only ever for sheep. The professor published her findings, but her favorite part wasn't the fame. It was that the shepherd, after all the interviews, still refused to count anything else that way.",
    questions: [
      { q: "What was Professor Ionescu recording when she made her discovery?",
        options: ["A history lecture", "An elderly shepherd for a folk song project", "A counting competition", "Her grandfather's stories"], correct: 1 },
      { q: "What was unusual about the shepherd's counting words?",
        options: ["They were very modern", "They matched no language she knew", "They were only numbers above one hundred", "They were borrowed from English"], correct: 1 },
      { q: "How widespread was the counting system?",
        options: ["Used across the whole country", "Used in one valley by eleven families", "Used by all shepherds in the mountains", "Used in schools nearby"], correct: 1 },
      { q: "What was the professor's favorite part of the discovery?",
        options: ["The fame from publishing it", "The money from the project", "That the shepherd only used it for sheep, as always", "That the system spread to other villages"], correct: 2 },
    ],
  },
];

// Which passage set each content tier reads. Beginner and Intermediate get
// their own gentle sets; Advanced falls back to the Intermediate stories;
// Expert keeps the original hard passages.
export const READING_SETS = {
  beginner: BEGINNER_READING,
  intermediate: INTERMEDIATE_READING,
  advanced: INTERMEDIATE_READING,
  expert: READING_PASSAGES,
};

export function getReadingSet(contentTier) {
  return READING_SETS[contentTier] || READING_PASSAGES;
}

const ALL_PASSAGES = [...BEGINNER_READING, ...INTERMEDIATE_READING, ...READING_PASSAGES];

export function getPassage(passageId) {
  return ALL_PASSAGES.find((p) => p.id === passageId) || null;
}
