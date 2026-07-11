// Reading-comprehension content for the Expert tier — static, curated once,
// zero API cost per use (same content philosophy as the lesson word banks
// and sentence banks). Each passage is 80-150 words with 4 multiple-choice
// comprehension questions; `correct` is the index into `options`.

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

export function getPassage(passageId) {
  return READING_PASSAGES.find((p) => p.id === passageId) || null;
}
