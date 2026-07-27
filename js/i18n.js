// Single source of truth for UI copy. Everything the interface says lives here,
// so wording changes happen in one place and nothing is hardcoded in the
// components.
//
// DELIBERATELY NOT here (they are content, not UI chrome):
//   • the mascot's spoken lines (lessons-client.js / grammar-client.js) — the
//     teacher speaks English on purpose, and these are read aloud via TTS;
//   • the lesson/reading material itself (words, sentences, passages);
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
    signInFailed: "Autentificare eșuată: {msg}",
  },

  picker: {
    adultRole: "Admin", // the adult tile's role chip (business surface stays EN)
    teenTag: "Adolescent · 14-18",
    kidLevelUnset: "Dă testul de nivel",
    kidLevelSet: "Nivel setat",
    notEnrolled: "Contul {email} nu este înscris în nicio familie din aplicație. Cere-i lui Flavius să te adauge.",
    signInToSee: "Conectează-te ca să vezi cine învață azi.",
    levelTitle: "Alege aventura, {name}!",
    recommended: "Recomandat",
  },

  admin: {
    titleList: "Familii adăugate",
    loading: "Se încarcă…",
    forbidden: "Doar administratorul poate gestiona familii.",
    error: "Eroare: {msg}",
    add: "Adaugă o familie",
    empty: "Nicio familie adăugată încă. (Familia ta principală e în cod, nu apare aici.)",
    counts: "{a} adulți · {t} adolescenți · {k} copii",
    edit: "Editează",
    deleteAria: "Șterge {name}",
    famNew: "Familie nouă",
    famEdit: "Editează familia",
    catAdult: "Adulți / părinți",
    catTeen: "Adolescenți (14-18)",
    catKid: "Copii",
    save: "Salvează",
    saving: "Se salvează…",
    saveFail: "Nu s-a putut salva.",
    back: "Înapoi",
    optDrive: "Raport de progres în Google Drive-ul copilului",
    optMirror: "Salvează conversațiile pe serverul meu (necesită acordul familiei)",
  },

  placement: {
    lead: "Salut, {name}! Hai să vedem de unde pornim. Alege răspunsul corect — nu-i nimic dacă nu știi toate! 😊",
    resultTitle: "Nivelul tău: {label}!",
    resultSub: "Ai răspuns corect la {n} din {total}. Te-am pus la nivelul potrivit — poți schimba oricând reluând testul.",
  },

  header: {
    badges: "Insigne",
    exercises: "Exerciții",
    lessons: "Lecții",
    reading: "Lectură",
    viewChild: "Vezi progresul copilului",
    levels: "Niveluri",
    chat: "Chat",
    stats: "Statisticile mele",
  },

  settings: {
    voiceFemale: "👩 Voce feminină",
    voiceMale: "👨 Voce masculină",
    voiceOn: "Sunet pornit",
    voiceOff: "Sunet oprit",
    showData: "Arată datele salvate",
    signOut: "Deconectare",
  },

  mascotSel: {
    talkTo: "Vorbește cu:",
    teacherToday: "Profesorul meu azi:",
    all: "Toți",
  },

  chat: {
    inputPlaceholder: "Scrie mesajul tău în engleză…",
    newBadge: "🎉 Insignă nouă: {label}!",
  },

  lesson: {
    justChatMascots: "Vorbește cu Socăteii",
    justChatPlain: "Înapoi la conversație",
    exitAria: "Ieși din lecție",
    skip: "Sar peste",
    hearAgain: "Ascultă din nou",
    next: "Următorul",
    seeResults: "Vezi rezultatele!",
    chatAboutMascots: "Vorbește despre asta cu Socăteii",
    chatAboutPlain: "Vorbește despre ce ai exersat",
    saveRecap: "Salvează rezumatul pe Drive",
    saving: "Se salvează…",
    saved: "Salvat pe Drive!",
    saveRetry: "Încearcă din nou",
    saveErr: " Nu s-a putut salva pe Drive.",
    saveScopeHint: " Deconectează-te și reconectează-te ca să aprobi permisiunea Drive.",
    backToLessons: "Înapoi la lecții",
    sayReady: "Spune cuvântul cu voce tare, apoi apasă butonul verde",
    sayPrompt: "Apasă microfonul și spune-l!",
    listening: "Te ascult… 🎧",
    heard: "Am auzit: „{text}\"",
    heardNothing: "Nu am auzit nimic 😅",
    micFail: "Microfonul nu a mers. Poți sări peste. 🙂",
  },

  home: {
    todayTitle: "Practica de azi",
    todayCountLabel: "de făcut azi",
    todayItemsOne: "1 exercițiu de făcut azi",
    todayItemsMany: "{n} de exersat azi",
    allDone: "Ai terminat tot pentru azi — revino mâine!",
    doneToday: "Practica de azi e gata! Ne vedem mâine.",
    start: "Începe",
    categoryCount: "{d}/{t} lecții",
    seeStats: "Statisticile mele",
    streakPill: "{n} zile la rând",
    streakPillOne: "1 zi la rând",
  },

  stats: {
    title: "Statisticile mele",
    back: "Înapoi",
    wordsHeading: "Cuvinte",
    mastered: "știute",
    learning: "în lucru",
    total: "în total",
    lessonsHeading: "Lecții pe module",
    streakHeading: "Seria ta",
    streakCount: "{n} zile la rând!",
    streakCountOne: "1 zi la rând!",
    streakSub: "{d} zile în total · record {r}",
    rewardsHeading: "Recompensele mele",
    badgesHeading: "Insigne",
  },

  recap: {
    completeScore: "Ai reușit {s} din {t}! 🎉",
    newBadge: " Insignă nouă: {names}!",
    headingMascot: "Rezumatul lecției · Ce ai învățat azi",
    headingPlain: "Rezumatul lecției",
    sub: "{c} din {t} exerciții corecte. Grupate pe cuvânt mai jos:",
    knewMascot: "Le-ai știut!",
    knewPlain: "Astea le-ai nimerit",
    practiceMascot: "Exersează aceste cuvinte · {n} de reluat",
    practicePlain: "Cuvinte de reluat",
    cheerPerfect: "🎉 Totul corect — bravo!",
    cheerSolid: "💪 Bună treabă — mai exersează cele {n} de mai sus și le prinzi data viitoare!",
  },

  rewards: {
    heading: "Recompensele mele",
    progress: "{a}/{b} lecții terminate",
    perLesson: " +{x} pe lecție · Ai strâns: {y}",
    bonusEarned: " BONUS: {x}! · Bonus deblocat — spune-le părinților!",
    bonusToward: " Termină toate cele {n} → bonus de {x}",
    completeTime1: " Ai câștigat +{x}! (total: {y})",
    completeTime2: " Lecția era deja numărată — ai strâns până acum {y}",
    completeBonus: " MODUL COMPLET! Bonus: {x} · Spune-le părinților!",
    completeToward: " {a}/{b} lecții spre bonusul de {x}",
  },

  daily: {
    title: "Practica de azi",
    stats: " {m} știute · {l} în lucru · din {t}",
  },

  reading: {
    intro: "Citește o poveste scurtă, apoi răspunde la întrebări. Nu te grăbi — poți reciti oricând.",
    best: "Cel mai bun: {s}/{t}",
    notRead: "Necitită încă",
    correct: "Corect! Bine observat.",
    wrong: "Nu chiar — răspunsul evidențiat e cel corect. Recitește partea aceea dacă vrei.",
    seeResults: "Vezi rezultatele",
    nextQuestion: "Următoarea întrebare",
    score: "Ai reușit {s} din {t}!",
    newBadge: " Insignă nouă: {names}!",
    practiceHeader: "Exercițiu de lectură",
    backToChat: "Înapoi la conversație",
    backToStories: "Înapoi la povești",
  },

  parent: {
    header: "Panoul părintelui",
    loading: "Se încarcă…",
    selectChild: "Selectează un copil din listă.",
    noChild: "(niciun copil în familie)",
    notFound: "Încă nu există date pentru acest email — verifică adresa sau copilul n-a exersat încă.",
    loadErr: "Nu s-a putut încărca progresul: {msg}",
    capsNote: "Se afișează ultimele {n} zile. {d} zi(le) mai vechi au expirat și nu mai sunt păstrate.",
    saved: " Salvat. Copiii vor vedea noile recompense la următoarea deschidere.",
    saveForbidden: "Doar un părinte din familie poate schimba recompensele.",
    saveErr: "Nu s-a putut salva: {msg}",
    progressTitle: " Progresul lui {name}",
    rewardsHeading: " Recompense de onorat",
    rwProgress: " {a} / {b} lecții terminate — {module}",
    rwEarned: " Câștigat: {amount} {unit} ({per} / lecție)",
    rwBonusEarned: " BONUS DE ONORAT: {amount} {unit} — modulul e terminat integral!",
    rwBonusToward: " Bonus la modul complet: {amount} {unit} (mai are {left} lecții)",
    statPoints: "Puncte",
    statStreak: "Serie",
    statTurns: "Mesaje",
    dayMessages: "{date} — {n} mesaje{note}",
    dayTrimmed: " ({n} mesaje de la începutul zilei au fost tăiate)",
    roleChild: "Copil",
    roleMascot: "Socatei",
  },

  badges: {
    "first-chat": "Primul salut!",
    "chatty-10": "Campion la vorbă",
    "chatty-50": "Vrăjitor al cuvintelor",
    "streak-3": "Serie de 3 zile",
    "streak-7": "Serie de o săptămână",
    "streak-30": "Maestru lunar",
    "points-100": "Clubul celor 100 de puncte",
    "lesson-first": "Prima lecție terminată!",
    "lesson-all-starter": "Explorator de lecții",
    "sentence-first": "Prima lecție de propoziții!",
    "sentence-all-starter": "Explorator de propoziții",
    "sentence-master": "Maestru al propozițiilor",
    "reading-first": "Prima poveste citită!",
    "reading-all": "Șoarece de bibliotecă",
    "grammar-first": "Provocator de gramatică",
    "grammar-all": "Campion la gramatică",
    "expert-first": "Expert în formare",
    "expert-all": "Maestru al cuvintelor",
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

// The label shown in the app header under the name. Kids/teens read the RO
// module name (Playroom…); the adult business learner keeps its English tag.
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
