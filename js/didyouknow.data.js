// "Did you know?" content — fun facts about Romania across several domains,
// for the kids' section. This is CONTENT, not UI chrome, so (like the mascot's
// spoken lines and the lesson material) it lives here rather than in i18n.js.
//
// Each fact is presented in ENGLISH first — this is an English-learning app, so
// the fact doubles as reading practice — with a Romanian translation shown
// underneath / on tap. Keep the English simple and age-appropriate; keep the
// facts accurate.
//
// Shape:
//   DOMAINS   — ordered list of { id, emoji, label } (label is the RO chip text)
//   FACTS     — array of { id, domain, emoji, en, ro }
//
// `getFactsByDomain(domainId)` returns the facts for one domain ("all" = every
// fact). `randomFact(excludeId)` returns a random fact, avoiding an immediate
// repeat when possible.

export const DOMAINS = [
  { id: "history",    emoji: "🏛️", label: "Istorie & monumente" },
  { id: "science",    emoji: "🔬", label: "Știință & invenții" },
  { id: "nature",     emoji: "🌍", label: "Natură & geografie" },
  { id: "sport",      emoji: "⚽", label: "Sport" },
  { id: "culture",    emoji: "🎨", label: "Cultură & artă" },
  { id: "traditions", emoji: "🍲", label: "Tradiții & mâncare" },
];

export const FACTS = [
  // ── Istorie & monumente ──────────────────────────────────────────────
  {
    id: "hist-parliament",
    domain: "history",
    emoji: "🏛️",
    en: "The Palace of the Parliament in Bucharest is the heaviest building in the whole world!",
    ro: "Palatul Parlamentului din București este cea mai grea clădire din întreaga lume!",
  },
  {
    id: "hist-peles",
    domain: "history",
    emoji: "🏰",
    en: "Peleș Castle in Sinaia was one of the first castles in Europe to have electric lights.",
    ro: "Castelul Peleș din Sinaia a fost unul dintre primele castele din Europa cu lumină electrică.",
  },
  {
    id: "hist-bran",
    domain: "history",
    emoji: "🦇",
    en: "Bran Castle in Transylvania is often called “Dracula’s Castle.”",
    ro: "Castelul Bran din Transilvania este numit adesea „Castelul lui Dracula”.",
  },
  {
    id: "hist-sarmizegetusa",
    domain: "history",
    emoji: "🗿",
    en: "Sarmizegetusa was the capital of the Dacians, who lived here long before Romania was born.",
    ro: "Sarmizegetusa a fost capitala dacilor, care au trăit aici cu mult înainte să existe România.",
  },
  {
    id: "hist-voronet",
    domain: "history",
    emoji: "🎨",
    en: "The Voroneț Monastery is famous for a special shade of blue called “Voroneț blue.”",
    ro: "Mănăstirea Voroneț este renumită pentru o nuanță specială de albastru numită „albastru de Voroneț”.",
  },
  {
    id: "hist-timisoara-light",
    domain: "history",
    emoji: "💡",
    en: "Timișoara was the first city in Europe to have electric street lights, back in 1884.",
    ro: "Timișoara a fost primul oraș din Europa cu iluminat stradal electric, în anul 1884.",
  },

  // ── Știință & invenții ───────────────────────────────────────────────
  {
    id: "sci-coanda",
    domain: "science",
    emoji: "✈️",
    en: "Henri Coandă discovered the “Coandă effect,” an idea that helps airplanes fly.",
    ro: "Henri Coandă a descoperit „efectul Coandă”, o idee care ajută avioanele să zboare.",
  },
  {
    id: "sci-poenaru",
    domain: "science",
    emoji: "🖊️",
    en: "Petrache Poenaru invented the fountain pen, so people no longer had to dip their pens in ink.",
    ro: "Petrache Poenaru a inventat stiloul, așa că oamenii nu mai trebuiau să înmoaie penița în cerneală.",
  },
  {
    id: "sci-vuia",
    domain: "science",
    emoji: "🛩️",
    en: "Traian Vuia built and flew one of the very first airplanes that could take off on its own.",
    ro: "Traian Vuia a construit și a zburat cu unul dintre primele avioane care puteau decola singure.",
  },
  {
    id: "sci-paulescu",
    domain: "science",
    emoji: "💉",
    en: "Nicolae Paulescu discovered insulin, a medicine that helps millions of people with diabetes.",
    ro: "Nicolae Paulescu a descoperit insulina, un medicament care ajută milioane de oameni cu diabet.",
  },
  {
    id: "sci-aslan",
    domain: "science",
    emoji: "🧪",
    en: "Ana Aslan was a Romanian doctor famous around the world for her research on staying young.",
    ro: "Ana Aslan a fost o doctoriță româncă renumită în toată lumea pentru cercetările despre tinerețe.",
  },
  {
    id: "sci-oberth",
    domain: "science",
    emoji: "🚀",
    en: "Hermann Oberth, born in Sibiu, was one of the founding fathers of rockets and space travel.",
    ro: "Hermann Oberth, născut la Sibiu, a fost unul dintre părinții rachetelor și ai călătoriilor în spațiu.",
  },

  // ── Natură & geografie ───────────────────────────────────────────────
  {
    id: "nat-delta",
    domain: "nature",
    emoji: "🦢",
    en: "The Danube Delta is one of the largest and best-kept wetlands in all of Europe.",
    ro: "Delta Dunării este una dintre cele mai mari și mai bine păstrate zone umede din toată Europa.",
  },
  {
    id: "nat-forests",
    domain: "nature",
    emoji: "🌲",
    en: "Romania has some of the last wild, untouched forests left in Europe.",
    ro: "România are unele dintre ultimele păduri sălbatice și neatinse rămase în Europa.",
  },
  {
    id: "nat-bears",
    domain: "nature",
    emoji: "🐻",
    en: "More than half of Europe’s brown bears live in Romania’s Carpathian Mountains.",
    ro: "Mai mult de jumătate dintre urșii bruni din Europa trăiesc în Munții Carpați din România.",
  },
  {
    id: "nat-scarisoara",
    domain: "nature",
    emoji: "🧊",
    en: "The Scărișoara Cave hides a giant underground glacier that is thousands of years old.",
    ro: "Peștera Scărișoara ascunde un ghețar uriaș subteran, vechi de mii de ani.",
  },
  {
    id: "nat-sphinx",
    domain: "nature",
    emoji: "⛰️",
    en: "In the Bucegi Mountains, wind and rain carved rocks that look like a Sphinx and a group of old ladies.",
    ro: "În Munții Bucegi, vântul și ploaia au sculptat stânci care seamănă cu un Sfinx și cu Babele.",
  },
  {
    id: "nat-danube-sea",
    domain: "nature",
    emoji: "🌊",
    en: "The Danube, Europe’s second-longest river, ends its journey in Romania as it meets the Black Sea.",
    ro: "Dunărea, al doilea cel mai lung fluviu din Europa, își termină călătoria în România, la Marea Neagră.",
  },

  // ── Sport ────────────────────────────────────────────────────────────
  {
    id: "sport-nadia",
    domain: "sport",
    emoji: "🤸",
    en: "Nadia Comăneci was the first gymnast ever to score a perfect 10 at the Olympic Games.",
    ro: "Nadia Comăneci a fost prima gimnastă din istorie care a primit nota 10 la Jocurile Olimpice.",
  },
  {
    id: "sport-hagi",
    domain: "sport",
    emoji: "⚽",
    en: "Gheorghe Hagi was such a great footballer that people called him “the Maradona of the Carpathians.”",
    ro: "Gheorghe Hagi a fost un fotbalist atât de bun încât a fost numit „Maradona din Carpați”.",
  },
  {
    id: "sport-halep",
    domain: "sport",
    emoji: "🎾",
    en: "Simona Halep climbed all the way to number one in the world in tennis.",
    ro: "Simona Halep a urcat până pe locul întâi în lume la tenis.",
  },
  {
    id: "sport-nastase",
    domain: "sport",
    emoji: "🏆",
    en: "Ilie Năstase was the very first tennis player in the world to be ranked number one.",
    ro: "Ilie Năstase a fost primul jucător de tenis din lume clasat pe locul întâi.",
  },
  {
    id: "sport-patzaichin",
    domain: "sport",
    emoji: "🛶",
    en: "Ivan Patzaichin was a canoe champion who won four Olympic gold medals for Romania.",
    ro: "Ivan Patzaichin a fost un campion la canoe care a câștigat patru medalii de aur olimpice pentru România.",
  },
  {
    id: "sport-gymnastics",
    domain: "sport",
    emoji: "🥇",
    en: "Romania’s gymnasts have won dozens of Olympic medals, making the country famous for gymnastics.",
    ro: "Gimnastele României au câștigat zeci de medalii olimpice, făcând țara renumită pentru gimnastică.",
  },

  // ── Cultură & artă ───────────────────────────────────────────────────
  {
    id: "cult-brancusi",
    domain: "culture",
    emoji: "🗿",
    en: "Constantin Brâncuși is one of the most famous sculptors in the whole world.",
    ro: "Constantin Brâncuși este unul dintre cei mai renumiți sculptori din întreaga lume.",
  },
  {
    id: "cult-column",
    domain: "culture",
    emoji: "🔝",
    en: "Brâncuși’s “Endless Column” in Târgu Jiu reaches almost 30 meters up into the sky.",
    ro: "„Coloana Infinitului” a lui Brâncuși, din Târgu Jiu, se înalță aproape 30 de metri spre cer.",
  },
  {
    id: "cult-enescu",
    domain: "culture",
    emoji: "🎻",
    en: "George Enescu was a brilliant composer, and one of the world’s biggest music festivals carries his name.",
    ro: "George Enescu a fost un compozitor genial, iar unul dintre cele mai mari festivaluri de muzică din lume îi poartă numele.",
  },
  {
    id: "cult-sapanta",
    domain: "culture",
    emoji: "🪦",
    en: "The Merry Cemetery in Săpânța is full of colorful, funny tombstones — the only one of its kind.",
    ro: "Cimitirul Vesel din Săpânța este plin de cruci colorate și hazlii — singurul de acest fel din lume.",
  },
  {
    id: "cult-doina",
    domain: "culture",
    emoji: "🎶",
    en: "The “doina” is a very old Romanian song, protected by UNESCO as a world treasure.",
    ro: "„Doina” este un cântec românesc foarte vechi, protejat de UNESCO ca tezaur al lumii.",
  },
  {
    id: "cult-grigorescu",
    domain: "culture",
    emoji: "🖼️",
    en: "Nicolae Grigorescu is one of Romania’s most loved painters, known for his sunny country scenes.",
    ro: "Nicolae Grigorescu este unul dintre cei mai iubiți pictori ai României, cunoscut pentru peisajele lui însorite.",
  },

  // ── Tradiții & mâncare ───────────────────────────────────────────────
  {
    id: "trad-sarmale",
    domain: "traditions",
    emoji: "🥬",
    en: "Sarmale — tasty cabbage rolls — are a favorite dish at Romanian holidays and parties.",
    ro: "Sarmalele — delicioase rulouri de varză — sunt un preparat preferat la sărbătorile și petrecerile românești.",
  },
  {
    id: "trad-martisor",
    domain: "traditions",
    emoji: "🌷",
    en: "On March 1st, Romanians give a “mărțișor,” a little red-and-white charm, to welcome spring.",
    ro: "Pe 1 martie, românii oferă un „mărțișor”, o mică podoabă roșu cu alb, ca să întâmpine primăvara.",
  },
  {
    id: "trad-eggs",
    domain: "traditions",
    emoji: "🥚",
    en: "For Easter, Romanians paint eggs with beautiful, colorful patterns.",
    ro: "De Paște, românii încondeiază ouă cu modele frumoase și colorate.",
  },
  {
    id: "trad-ie",
    domain: "traditions",
    emoji: "👚",
    en: "The “ie” is the traditional Romanian blouse, celebrated every year on June 24th.",
    ro: "„Ia” este bluza tradițională românească, sărbătorită în fiecare an pe 24 iunie.",
  },
  {
    id: "trad-mamaliga",
    domain: "traditions",
    emoji: "🌽",
    en: "Mămăligă, made from cornmeal, is a warm traditional food that Romanians have eaten for centuries.",
    ro: "Mămăliga, făcută din mălai, este o mâncare tradițională caldă pe care românii o mănâncă de secole.",
  },
  {
    id: "trad-colinde",
    domain: "traditions",
    emoji: "🎄",
    en: "At Christmas, children go from house to house singing traditional carols called “colinde.”",
    ro: "De Crăciun, copiii merg din casă în casă cântând colinde tradiționale.",
  },
];

// All facts for a domain. "all" (or a falsy value) returns every fact.
export function getFactsByDomain(domainId) {
  if (!domainId || domainId === "all") return FACTS.slice();
  return FACTS.filter((f) => f.domain === domainId);
}

// A random fact, avoiding an immediate repeat of `excludeId` when there is more
// than one to choose from. `domainId` optionally limits the pool.
export function randomFact(excludeId, domainId) {
  let pool = getFactsByDomain(domainId);
  if (excludeId && pool.length > 1) pool = pool.filter((f) => f.id !== excludeId);
  return pool[Math.floor(Math.random() * pool.length)];
}

// Look up a domain's metadata (emoji/label) by id.
export function getDomain(domainId) {
  return DOMAINS.find((d) => d.id === domainId) || null;
}
