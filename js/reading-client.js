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
  {
    id: "b-big-tree", title: "The Big Tree", emoji: "🌳",
    text: "In our garden there is a big tree. It is very old and very tall. In summer, the tree has many green leaves. Birds make their nests in the tree. My brother and I like to sit under it when the sun is hot. It is our favorite place to play.",
    questions: [
      { q: "Where is the tree?", options: ["In the park", "In our garden", "At school", "In the forest"], correct: 1 },
      { q: "When does the tree have green leaves?", options: ["In winter", "In summer", "At night", "Never"], correct: 1 },
      { q: "What do the birds do in the tree?", options: ["Sleep on the grass", "Make their nests", "Eat the leaves", "Fly away"], correct: 1 },
    ],
  },
  {
    id: "b-school-bag", title: "My School Bag", emoji: "🎒",
    text: "This is my school bag. It is blue and green. Inside, I have my books, my pencils, and my lunch. My bag is a little heavy, but I like it. Every morning, I put it on my back and walk to school with my friend.",
    questions: [
      { q: "What colors is the bag?", options: ["Red and yellow", "Blue and green", "Black and white", "Pink"], correct: 1 },
      { q: "What is inside the bag?", options: ["Toys and games", "Books, pencils, and lunch", "A cat", "Shoes"], correct: 1 },
      { q: "How does the child go to school?", options: ["By car", "By bus", "Walks with a friend", "By train"], correct: 2 },
    ],
  },
  {
    id: "b-rainy-day", title: "The Rainy Day", emoji: "🌧️",
    text: "Today it is raining. The sky is grey and the streets are wet. I cannot play outside, so I stay at home. I read a book and drink warm tea. My cat sleeps next to me. I like rainy days because they are quiet and cozy.",
    questions: [
      { q: "How is the sky today?", options: ["Blue", "Grey", "Yellow", "Pink"], correct: 1 },
      { q: "Why does the child stay home?", options: ["It is too hot", "It is raining", "It is night", "School is closed"], correct: 1 },
      { q: "What does the child do at home?", options: ["Play football", "Read and drink tea", "Sleep all day", "Cook dinner"], correct: 1 },
    ],
  },
  {
    id: "b-my-family", title: "My Family", emoji: "👨‍👩‍👧‍👦",
    text: "I have a big family. My mother is a nurse and my father is a teacher. I have one sister and one brother. We also have a dog named Rex. On Sundays, we eat lunch together and play games. I love my family very much.",
    questions: [
      { q: "What is the mother's job?", options: ["Teacher", "Nurse", "Doctor", "Cook"], correct: 1 },
      { q: "How many brothers and sisters does the child have?", options: ["One sister and one brother", "Two sisters", "Only a brother", "None"], correct: 0 },
      { q: "What do they do on Sundays?", options: ["Go to school", "Eat lunch and play games", "Watch TV all day", "Go to work"], correct: 1 },
    ],
  },
  {
    id: "b-little-bird", title: "The Little Bird", emoji: "🐦",
    text: "A little bird lives in the tree near my window. Every morning, it sings a happy song. The bird is small and brown. I put some bread on the window for it. The bird is not afraid of me now. It is my little friend.",
    questions: [
      { q: "Where does the bird live?", options: ["On the roof", "In the tree near the window", "In a cage", "Under the bed"], correct: 1 },
      { q: "What does the bird do every morning?", options: ["Sleeps", "Sings a song", "Flies away", "Eats the tree"], correct: 1 },
      { q: "What does the child give the bird?", options: ["Water", "Some bread", "A toy", "Nothing"], correct: 1 },
    ],
  },
  {
    id: "b-at-the-farm", title: "At the Farm", emoji: "🐄",
    text: "My grandfather has a farm. There are cows, sheep, and chickens. Every morning, the rooster wakes everyone up. The cows give us fresh milk. I like to feed the chickens and collect the eggs. The farm is dirty but so much fun!",
    questions: [
      { q: "Who has a farm?", options: ["My uncle", "My grandfather", "My teacher", "My friend"], correct: 1 },
      { q: "What wakes everyone up?", options: ["A bell", "The rooster", "The dog", "An alarm"], correct: 1 },
      { q: "What does the child like to do?", options: ["Ride the cows", "Feed the chickens and collect eggs", "Sleep all day", "Milk the sheep"], correct: 1 },
    ],
  },
  {
    id: "b-my-birthday", title: "My Birthday", emoji: "🎂",
    text: "Today is my birthday. I am eight years old now. My mother made a big chocolate cake. My friends came to my house with presents. We played games, ate cake, and sang songs. It was the best day of the whole year!",
    questions: [
      { q: "How old is the child now?", options: ["Seven", "Eight", "Nine", "Ten"], correct: 1 },
      { q: "What kind of cake did the mother make?", options: ["Vanilla", "Chocolate", "Fruit", "Cheese"], correct: 1 },
      { q: "What did the friends bring?", options: ["Nothing", "Presents", "Only food", "Balloons"], correct: 1 },
    ],
  },
  {
    id: "b-snowman", title: "The Snowman", emoji: "⛄",
    text: "It snowed all night. In the morning, the garden was white. My sister and I made a big snowman. We gave him a hat, a carrot nose, and two black eyes. Then we went inside and drank hot chocolate. Winter is so much fun!",
    questions: [
      { q: "When did it snow?", options: ["All morning", "All night", "For one hour", "Last week"], correct: 1 },
      { q: "What did they use for the snowman's nose?", options: ["A stone", "A carrot", "A stick", "A button"], correct: 1 },
      { q: "What did they drink?", options: ["Cold water", "Hot chocolate", "Tea", "Milk"], correct: 1 },
    ],
  },
  {
    id: "b-best-friend", title: "My Best Friend", emoji: "🧑‍🤝‍🧑",
    text: "My best friend is Maria. She lives next to my house. We go to the same school and sit together in class. After school, we play in the park or draw pictures. Maria is funny and kind. I am happy she is my friend.",
    questions: [
      { q: "Where does Maria live?", options: ["Far away", "Next to my house", "In another city", "At school"], correct: 1 },
      { q: "Where do they sit at school?", options: ["Far apart", "Together", "With the teacher", "Alone"], correct: 1 },
      { q: "What do they do after school?", options: ["Sleep", "Play in the park or draw", "Nothing", "Watch TV"], correct: 1 },
    ],
  },
  {
    id: "b-picnic", title: "The Picnic", emoji: "🧺",
    text: "On Saturday, my family went to the park for a picnic. We took sandwiches, fruit, and juice. We sat on a big blanket under a tree. After lunch, we played ball and flew a kite. Then it started to rain, so we ran home laughing.",
    questions: [
      { q: "When did they go to the park?", options: ["On Sunday", "On Saturday", "On Monday", "At night"], correct: 1 },
      { q: "What did they sit on?", options: ["A bench", "A big blanket", "The wet grass", "A chair"], correct: 1 },
      { q: "Why did they run home?", options: ["They were tired", "It started to rain", "It was late", "They were hungry"], correct: 1 },
    ],
  },
  {
    id: "b-my-room", title: "My Room", emoji: "🛏️",
    text: "This is my room. It is small but I love it. My bed is next to the window. I have a desk for my homework and many books on the shelf. My toys are in a big box. At night, I can see the stars from my bed.",
    questions: [
      { q: "Where is the bed?", options: ["Next to the door", "Next to the window", "In the corner", "Under the desk"], correct: 1 },
      { q: "Where are the toys?", options: ["On the shelf", "In a big box", "Under the bed", "On the desk"], correct: 1 },
      { q: "What can the child see at night?", options: ["The moon", "The stars", "The garden", "Cars"], correct: 1 },
    ],
  },
  {
    id: "b-zoo-trip", title: "The Zoo Trip", emoji: "🦁",
    text: "Yesterday my class went to the zoo. We saw lions, monkeys, and a big elephant. The monkeys were very funny and made us laugh. My favorite animal was the tall giraffe. We ate our lunch near the birds. It was a wonderful day.",
    questions: [
      { q: "Where did the class go?", options: ["To the park", "To the zoo", "To the museum", "To the beach"], correct: 1 },
      { q: "Which animals were funny?", options: ["The lions", "The monkeys", "The birds", "The fish"], correct: 1 },
      { q: "What was the child's favorite animal?", options: ["The lion", "The giraffe", "The elephant", "The monkey"], correct: 1 },
    ],
  },
  {
    id: "b-ice-cream", title: "The Ice Cream", emoji: "🍦",
    text: "It was a very hot day. My father took me to the shop to buy ice cream. I chose strawberry and he chose chocolate. The ice cream was cold and sweet. We ate it in the park under a tree. I want ice cream again tomorrow!",
    questions: [
      { q: "How was the day?", options: ["Cold", "Very hot", "Rainy", "Windy"], correct: 1 },
      { q: "What flavor did the child choose?", options: ["Chocolate", "Strawberry", "Vanilla", "Lemon"], correct: 1 },
      { q: "Where did they eat the ice cream?", options: ["At home", "In the park", "In the shop", "In the car"], correct: 1 },
    ],
  },
  {
    id: "b-my-grandma", title: "My Grandma", emoji: "👵",
    text: "My grandma lives in a small village. Her house has a big garden with flowers and vegetables. She makes the best soup in the world. When I visit her, she tells me old stories. I love the summer holidays at grandma's house.",
    questions: [
      { q: "Where does grandma live?", options: ["In the city", "In a small village", "By the sea", "In the mountains"], correct: 1 },
      { q: "What is in her garden?", options: ["Only grass", "Flowers and vegetables", "A pool", "Toys"], correct: 1 },
      { q: "What does grandma do when the child visits?", options: ["Watches TV", "Tells old stories", "Sleeps", "Works"], correct: 1 },
    ],
  },
  {
    id: "b-football-game", title: "The Football Game", emoji: "⚽",
    text: "Every Sunday, I play football with my friends. We play in the field near the school. I am not the fastest, but I can kick the ball far. Last week, my team won the game. We were so happy that we jumped and cheered.",
    questions: [
      { q: "When do they play football?", options: ["Every Saturday", "Every Sunday", "Every day", "At night"], correct: 1 },
      { q: "Where do they play?", options: ["At home", "In the field near the school", "In the street", "At the beach"], correct: 1 },
      { q: "What happened last week?", options: ["They lost", "The team won", "It rained", "Nobody came"], correct: 1 },
    ],
  },
  {
    id: "b-the-garden", title: "The Garden", emoji: "🌻",
    text: "My mother loves her garden. In spring, she plants seeds. Every day, she gives the plants water. Soon, small green plants grow. In summer, we have red tomatoes and yellow sunflowers. I help my mother, and the garden makes us both happy.",
    questions: [
      { q: "When does the mother plant seeds?", options: ["In winter", "In spring", "In autumn", "At night"], correct: 1 },
      { q: "What does she give the plants every day?", options: ["Milk", "Water", "Sugar", "Nothing"], correct: 1 },
      { q: "What grows in summer?", options: ["Only grass", "Tomatoes and sunflowers", "Apples", "Roses"], correct: 1 },
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
  {
    id: "i-homework-mixup", title: "The Homework Mix-up", emoji: "📓",
    text: "Andrei was sure he had finished his math homework, but when the teacher asked for it, his notebook was full of drawings instead. He had taken his little sister's notebook by mistake! His face turned red. Luckily, the teacher smiled and let him bring the real homework the next day. That evening, Andrei wrote his name in big letters on every notebook so it would never happen again.",
    questions: [
      { q: "What did Andrei find in the notebook?", options: ["His math homework", "His sister's drawings", "A letter", "Nothing"], correct: 1 },
      { q: "How did the teacher react?", options: ["She was angry", "She smiled and gave him another day", "She called his parents", "She laughed at him"], correct: 1 },
      { q: "What did Andrei do that evening?", options: ["Nothing", "Wrote his name on every notebook", "Hid the notebooks", "Did more drawings"], correct: 1 },
    ],
  },
  {
    id: "i-talent-show", title: "The Talent Show", emoji: "🎤",
    text: "Elena wanted to sing at the school talent show, but she was terribly nervous. Her hands were shaking as she walked onto the stage. For a moment, she forgot the words. Then she saw her best friend smiling in the front row and giving her a thumbs up. Suddenly, Elena felt calm. She sang beautifully, and everyone clapped. After that day, she was not afraid of the stage anymore.",
    questions: [
      { q: "What did Elena want to do?", options: ["Dance", "Sing", "Play the guitar", "Tell jokes"], correct: 1 },
      { q: "What happened at first on stage?", options: ["She sang perfectly", "She forgot the words", "She fell down", "She ran away"], correct: 1 },
      { q: "What helped Elena feel calm?", options: ["A glass of water", "Her friend smiling and giving a thumbs up", "The teacher", "The music"], correct: 1 },
    ],
  },
  {
    id: "i-grandpas-watch", title: "Grandpa's Old Watch", emoji: "⌚",
    text: "Grandpa gave Marco an old silver watch for his tenth birthday. It did not work, and some of the numbers were hard to read. Marco's cousin laughed and said it was junk. But grandpa explained that the watch had belonged to Marco's great-grandfather, who wore it every day for fifty years. Suddenly the watch felt like treasure. Marco now keeps it in a special box and shows it to everyone who visits.",
    questions: [
      { q: "What did grandpa give Marco?", options: ["A new phone", "An old silver watch", "Money", "A book"], correct: 1 },
      { q: "Why did the cousin laugh?", options: ["The watch was too big", "He thought it was junk", "It was pink", "It was loud"], correct: 1 },
      { q: "Why is the watch special?", options: ["It is made of gold", "It belonged to his great-grandfather", "It is very expensive", "It plays music"], correct: 1 },
    ],
  },
  {
    id: "i-stray-dog", title: "The Stray Dog", emoji: "🐕",
    text: "On her way home from school, Ana found a thin, dirty dog shivering in the rain. It had no collar and looked very hungry. Ana shared her sandwich with it, and the dog followed her all the way home. Her parents were not sure at first, but the dog was so gentle that they agreed to keep it. They named him Lucky, because that rainy day changed his life.",
    questions: [
      { q: "Where did Ana find the dog?", options: ["At the park", "Shivering in the rain", "In a shop", "At school"], correct: 1 },
      { q: "What did Ana do first?", options: ["Called the police", "Shared her sandwich", "Ran away", "Ignored it"], correct: 1 },
      { q: "Why did they name the dog Lucky?", options: ["He won a prize", "The rainy day changed his life", "He was fast", "He was golden"], correct: 1 },
    ],
  },
  {
    id: "i-camping-trip", title: "The Camping Trip", emoji: "🏕️",
    text: "The Popescu family went camping in the forest for the weekend. They put up their tent near a small river. At night, they sat around a fire, roasted marshmallows, and told scary stories. Suddenly, they heard a noise in the bushes. Everyone froze. But it was only a curious little hedgehog looking for food. They laughed at how scared they had been, and slept well that night.",
    questions: [
      { q: "Where did the family camp?", options: ["By the sea", "In the forest near a river", "In the mountains", "In a field"], correct: 1 },
      { q: "What did they do at night?", options: ["Watched TV", "Sat around a fire and told stories", "Went home", "Went swimming"], correct: 1 },
      { q: "What made the noise in the bushes?", options: ["A bear", "A little hedgehog", "A wolf", "The wind"], correct: 1 },
    ],
  },
  {
    id: "i-broken-window", title: "The Broken Window", emoji: "🪟",
    text: "Tom and his friends were playing football in the street when Tom kicked the ball too hard. It smashed straight through Mr. Ilie's window. The other boys ran away, but Tom stayed. He knocked on the door and said sorry. Mr. Ilie was surprised by his honesty. Instead of shouting, he asked Tom to help fix the window on Saturday. Tom learned that telling the truth was the right choice.",
    questions: [
      { q: "What did Tom break?", options: ["A door", "A window", "A car", "A lamp"], correct: 1 },
      { q: "What did the other boys do?", options: ["Helped Tom", "Ran away", "Called for help", "Laughed"], correct: 1 },
      { q: "What did Mr. Ilie ask Tom to do?", options: ["Pay a lot of money", "Help fix the window", "Leave forever", "Buy a new ball"], correct: 1 },
    ],
  },
  {
    id: "i-school-play", title: "The School Play", emoji: "🎭",
    text: "Maria's class was putting on a play about a magic forest. Maria wanted the main part, but she was given the role of a small tree instead. At first she was disappointed. But she decided to be the best tree ever, moving her branches and making the audience laugh. After the show, many people said the funny tree was their favorite part. Maria realized that even a small role can shine.",
    questions: [
      { q: "What was the play about?", options: ["A castle", "A magic forest", "The sea", "A city"], correct: 1 },
      { q: "What role did Maria get?", options: ["The main part", "A small tree", "A witch", "A bird"], correct: 1 },
      { q: "What did Maria learn?", options: ["To give up", "Even a small role can shine", "Plays are boring", "To be sad"], correct: 1 },
    ],
  },
  {
    id: "i-lost-wallet", title: "The Lost Wallet", emoji: "👛",
    text: "While walking to the shop, David found a brown wallet on the pavement. Inside there was money and a photo of a smiling family. David could have kept it, but he knew that was wrong. He took it to the police station. Two days later, an old man came to David's house to thank him. He was so grateful that he gave David a small reward and a big smile.",
    questions: [
      { q: "What did David find?", options: ["A phone", "A brown wallet", "A key", "A bag"], correct: 1 },
      { q: "What did David do with it?", options: ["Kept the money", "Took it to the police station", "Threw it away", "Hid it"], correct: 1 },
      { q: "What happened two days later?", options: ["Nothing", "An old man came to thank him", "He lost it", "The police fined him"], correct: 1 },
    ],
  },
  {
    id: "i-new-bicycle", title: "The New Bicycle", emoji: "🚲",
    text: "For months, Radu saved every coin he received to buy a shiny red bicycle. Finally, he had enough. But on the day he went to the shop, he saw his neighbor crying because she could not afford medicine for her son. Radu thought hard, then gave her some of his money. He did not get the fanciest bicycle, but the smile on his neighbor's face felt better than any new toy.",
    questions: [
      { q: "What was Radu saving for?", options: ["A phone", "A red bicycle", "A game", "Shoes"], correct: 1 },
      { q: "Why was the neighbor crying?", options: ["She was hurt", "She could not afford medicine for her son", "She lost a pet", "She was lonely"], correct: 1 },
      { q: "What did Radu do?", options: ["Ignored her", "Gave her some of his money", "Bought the bicycle anyway", "Went home"], correct: 1 },
    ],
  },
  {
    id: "i-snow-day", title: "The Snow Day", emoji: "❄️",
    text: "When Ioana woke up, the whole town was covered in thick white snow. School was closed! She and her brother spent the morning building a snow fort and having a snowball fight. Their cheeks turned red from the cold. At lunchtime, their mother called them inside for hot soup. Ioana wished that every winter day could be a snow day like that one.",
    questions: [
      { q: "Why was school closed?", options: ["A holiday", "Thick snow covered the town", "A storm warning", "It was Sunday"], correct: 1 },
      { q: "What did they build?", options: ["A snowman", "A snow fort", "A house", "A wall"], correct: 1 },
      { q: "What did their mother make?", options: ["Hot chocolate", "Hot soup", "Sandwiches", "Cake"], correct: 1 },
    ],
  },
  {
    id: "i-science-project", title: "The Science Project", emoji: "🔬",
    text: "For the science fair, Paul decided to grow a bean plant. He put the seed in a cup of soil and placed it on the windowsill. Every day he watered it and wrote down what he saw. For a whole week, nothing happened, and he almost gave up. Then one morning, a tiny green shoot appeared. Paul was amazed that his patience had paid off, and his project won a prize.",
    questions: [
      { q: "What did Paul decide to grow?", options: ["A flower", "A bean plant", "A tree", "Grass"], correct: 1 },
      { q: "Where did he put the cup?", options: ["On the floor", "On the windowsill", "In the garden", "In a dark box"], correct: 1 },
      { q: "What happened after a week of nothing?", options: ["He threw it away", "A tiny green shoot appeared", "It died", "The cup broke"], correct: 1 },
    ],
  },
  {
    id: "i-kind-stranger", title: "The Kind Stranger", emoji: "🤝",
    text: "Sofia was at the train station with her grandmother when they realized they had lost their tickets. Grandmother started to worry. A woman standing nearby noticed and quietly bought them two new tickets. Before Sofia could even ask her name, the woman smiled and walked away. Sofia never forgot her kindness, and she promised herself that one day she would help a stranger too.",
    questions: [
      { q: "What did Sofia and her grandmother lose?", options: ["Their bags", "Their tickets", "Their money", "Their phone"], correct: 1 },
      { q: "What did the woman nearby do?", options: ["Ignored them", "Bought them two new tickets", "Called the police", "Laughed"], correct: 1 },
      { q: "What did Sofia promise herself?", options: ["To be rich", "To help a stranger one day", "Never to travel", "To find the woman"], correct: 1 },
    ],
  },
  {
    id: "i-birthday-surprise", title: "The Birthday Surprise", emoji: "🎉",
    text: "Luca thought everyone had forgotten his birthday. His parents said nothing at breakfast, and his friends did not mention it at school. He felt sad all day. But when he opened his front door in the afternoon, the lights turned on and everyone shouted 'Surprise!' His family and friends had planned a party in secret. It was the happiest surprise of his life, and he almost cried with joy.",
    questions: [
      { q: "Why did Luca feel sad?", options: ["He was sick", "He thought everyone forgot his birthday", "He lost a game", "It rained"], correct: 1 },
      { q: "What happened when he opened the door?", options: ["Nobody was there", "Everyone shouted 'Surprise!'", "The lights broke", "He fell"], correct: 1 },
      { q: "How did Luca feel in the end?", options: ["Angry", "Very happy", "Bored", "Tired"], correct: 1 },
    ],
  },
  {
    id: "i-big-match", title: "The Big Match", emoji: "🏆",
    text: "Cristi's team was losing the football match by one goal, and there were only two minutes left. He was tired and wanted to stop, but his coach told him to keep believing. In the last minute, Cristi got the ball, ran past two players, and scored a perfect goal. The match ended in a tie. His teammates lifted him up, and Cristi understood why you should never give up.",
    questions: [
      { q: "How was Cristi's team doing near the end?", options: ["Winning easily", "Losing by one goal", "Winning by two", "Not playing"], correct: 1 },
      { q: "What did the coach tell him?", options: ["To rest", "To keep believing", "To go home", "To stop"], correct: 1 },
      { q: "How did the match end?", options: ["His team lost", "In a tie", "It was cancelled", "His team was disqualified"], correct: 1 },
    ],
  },
  {
    id: "i-library-book", title: "The Library Book", emoji: "📚",
    text: "Ema borrowed a mystery book from the school library and could not stop reading it. One evening she read so late that she fell asleep with the book on her face. The next day she was tired but excited to finish it. When she returned the book, the librarian recommended two more just like it. Ema discovered that reading could be even more exciting than television.",
    questions: [
      { q: "What kind of book did Ema borrow?", options: ["A cookbook", "A mystery book", "A math book", "A comic"], correct: 1 },
      { q: "What happened one evening?", options: ["She lost the book", "She fell asleep reading it", "She tore a page", "She finished it"], correct: 1 },
      { q: "What did Ema discover?", options: ["That books are boring", "Reading can be more exciting than TV", "She hates mysteries", "Libraries are closed"], correct: 1 },
    ],
  },
  {
    id: "i-beach-day", title: "The Beach Day", emoji: "🏖️",
    text: "The whole family drove to the seaside for the day. The children built a huge sandcastle while their father swam in the waves. At noon, a cheeky seagull swooped down and stole a sandwich right out of Mia's hand! Everyone burst out laughing. They spent the afternoon collecting shells and watching the boats. On the way home, tired and sunburnt, they all agreed it had been a perfect day.",
    questions: [
      { q: "Where did the family go?", options: ["To the mountains", "To the seaside", "To a lake", "To the city"], correct: 1 },
      { q: "What did the seagull do?", options: ["Sang a song", "Stole a sandwich from Mia", "Landed on the castle", "Flew far away"], correct: 1 },
      { q: "How did they feel on the way home?", options: ["Angry", "Tired but happy", "Bored", "Cold"], correct: 1 },
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
