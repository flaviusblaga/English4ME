// Registry of all profiles. Each profile's `features` flags are the single
// branch point the rest of the app uses (e.g. `if (profile.features.scenarios)`)
// instead of scattering profileId string checks around the codebase.
export const PROFILES = [
  {
    id: "business-conversational",
    displayName: "Business English — Conversational",
    level: "conversational",
    emoji: "💼",
    description: "Adult workplace English: meetings, emails, small talk, role-play scenarios.",
    features: { scenarios: true, documents: true, gamification: false, canViewChildren: true },
  },
  {
    id: "kids-primar",
    displayName: "English4ME — Beginner (Bobo, Fizz & Sushi)",
    level: "beginner",
    contentTier: "beginner",
    emoji: "🌱",
    description: "Just starting out with English. Playful practice with three silly mascot friends: Bobo, Fizz & Sushi.",
    features: { scenarios: false, documents: false, gamification: true, parentVisible: true, lessons: true, mascots: true, reading: true },
  },
  {
    id: "kids-intermediate",
    displayName: "English4ME — Intermediate (Bobo, Fizz & Sushi)",
    level: "intermediate",
    contentTier: "intermediate",
    emoji: "🌿",
    description: "Already know the basics — time to build full sentences with the Socatei.",
    features: { scenarios: false, documents: false, gamification: true, parentVisible: true, lessons: true, mascots: true, lessonsIntermediate: true, reading: true },
  },
  {
    id: "kids-advanced",
    displayName: "English4ME — Advanced",
    level: "advanced",
    contentTier: "advanced",
    emoji: "🌳",
    description: "Real conversations plus grammar challenges — past tenses, phrasal verbs, conditionals and more.",
    // chatFirst: conversation is the primary mode; the lesson screen is
    // reachable via the exercises button in the chat header instead of
    // being the landing view like the mascot tiers.
    features: { scenarios: false, documents: false, gamification: true, parentVisible: true, lessons: true, chatFirst: true, mascots: false, lessonsAdvanced: true },
  },
  {
    id: "kids-expert",
    displayName: "English4ME — Expert",
    level: "expert",
    contentTier: "expert",
    emoji: "🏆",
    description: "Conversation, reading stories, idioms and tricky-usage challenges for a confident young English speaker.",
    features: { scenarios: false, documents: false, gamification: true, parentVisible: true, lessons: true, chatFirst: true, mascots: false, lessonsExpert: true, reading: true },
  },
];

export function getProfile(profileId) {
  const profile = PROFILES.find((p) => p.id === profileId);
  if (!profile) throw new Error(`Unknown profileId: ${profileId}`);
  return profile;
}

// ---- Family members ----
// The picker now shows PEOPLE, not abstract levels. Each member maps onto one
// of the profiles above:
//   • adults (role "admin") → the Business English profile, and can view the
//     children's progress;
//   • kids → their level is NOT fixed here; it's decided by the placement test
//     the first time they enter, then remembered (see placement.js). So a kid
//     member has no profileId until the test assigns one.
// Several households now share one deployment, so members are grouped into
// families and nobody ever sees a family other than their own.
//
// IMPORTANT — this file decides only what the PICKER DRAWS. It is not a
// security boundary: it ships to the browser and anyone with dev tools can
// edit it. The real access control lives in worker/src/families.js, which is
// checked against a Google-verified email on every request. Keep the two in
// step: adding a family here without adding it there gets tiles that lead
// nowhere, and adding it there without here makes it invisible.
//
// Member ids must be unique across ALL families — they key the per-device
// placement memory below. (The original four keep their bare ids so existing
// installs don't lose their placement; new families use an "<family>-" prefix.)
export const FAMILIES = [
  {
    id: "blaga",
    name: "Familia Blaga",
    // Publishes a progress report as a Google Doc in the CHILD's own Drive,
    // shared with this family's adults. Nothing is stored by the app owner, so
    // this is the option to give families outside his household.
    driveReport: true,
    members: [
      { id: "flavius", name: "Flavius", emoji: "💼", kind: "adult", role: "admin",
        img: "assets/socatei/flavius-sticker.png",
        profileId: "business-conversational", emails: ["flaviusblaga@gmail.com"] },
      { id: "andrea",  name: "Andrea",  emoji: "☕", kind: "adult", role: "admin",
        img: "assets/socatei/andrea-sticker.png",
        profileId: "business-conversational", emails: ["andrea.bartha1@gmail.com"] },
      { id: "darius",  name: "Darius",  emoji: "🦫", kind: "kid", img: "assets/socatei/bobo-sticker.png",
        emails: ["blagadariusmarcus@gmail.com", "dariusmblaga@gmail.com"] },
      { id: "rares",   name: "Rareș",   emoji: "🐿️", kind: "kid", img: "assets/socatei/fizz-sticker.png",
        emails: ["blagararesoctavian@gmail.com", "raresoblaga@gmail.com"] },
    ],
  },

  // ---- Template for a new family: copy, fill in, mirror in worker/src/families.js.
  //
  // `img` is only the STARTING picture — everyone can change theirs from the
  // picker (see AVATARS below), so the values here just decide what a brand-new
  // tile looks like before anyone touches it. Give the two children different
  // mascots so their tiles are told apart at a glance on day one.
  //
  // driveReport: true is the setting to give families outside the author's
  // household — their child's progress goes to their own Drive and never to
  // the app owner. Pair it with progressMirror: false in worker/src/families.js.
  // {
  //   id: "popescu",
  //   name: "Familia Popescu",
  //   driveReport: true,
  //   members: [
  //     { id: "popescu-tata", name: "Tata", emoji: "💼", kind: "adult", role: "admin",
  //       img: "assets/socatei/tata-sticker.png",
  //       profileId: "business-conversational", emails: ["tata@gmail.com"] },
  //     { id: "popescu-mama", name: "Mama", emoji: "☕", kind: "adult", role: "admin",
  //       img: "assets/socatei/mama-sticker.png",
  //       profileId: "business-conversational", emails: ["mama@gmail.com"] },
  //     { id: "popescu-copil1", name: "Copil 1", emoji: "🦫", kind: "kid",
  //       img: "assets/socatei/bobo-sticker.png", emails: ["copil1@gmail.com"] },
  //     { id: "popescu-copil2", name: "Copil 2", emoji: "🎀", kind: "kid",
  //       img: "assets/socatei/sushi-sticker.png", emails: ["copil2@gmail.com"] },
  //   ],
  // },
];

// Flat view of everyone, for lookups that don't care about grouping.
export const MEMBERS = FAMILIES.flatMap((f) => f.members.map((m) => ({ ...m, familyId: f.id })));

function normEmail(e) {
  return (e || "").trim().toLowerCase();
}

function lookupEmail(email) {
  const needle = normEmail(email);
  if (!needle) return null;
  for (const family of FAMILIES) {
    for (const member of family.members) {
      if ((member.emails || []).some((e) => normEmail(e) === needle)) return { family, member };
    }
  }
  return null;
}

export function familyForEmail(email) {
  const found = lookupEmail(email);
  return found ? found.family : null;
}

// An adult of a family — administers their OWN household, nothing beyond it.
// (Control over who is enrolled at all belongs to whoever edits families.js
// and deploys, which is deliberately not something the app exposes.)
export function isAdminEmail(email) {
  const found = lookupEmail(email);
  return !!found && found.member.kind === "adult";
}

// Which member tiles the signed-in account should see:
//  - an adult sees everyone in THEIR family;
//  - a kid sees only their own tile, so a child's login can never reach the
//    grown-ups' Business profile;
//  - an unrecognised address sees NOTHING. This used to fall back to showing
//    the kids' tiles, which was harmless with one household and unacceptable
//    with several.
export function membersForEmail(email) {
  const found = lookupEmail(email);
  if (!found) return [];
  if (found.member.kind === "kid") return [found.member];
  return found.family.members;
}

export function getMember(memberId) {
  const member = MEMBERS.find((m) => m.id === memberId);
  if (!member) throw new Error(`Unknown memberId: ${memberId}`);
  return member;
}

// Addresses a child's progress report should be shared with — the adults of
// that child's own family, and nobody else.
//
// Empty (so the feature switches itself off) when the signed-in account isn't
// a child's, or when the family hasn't enabled reports. The kid check matters:
// a parent trying out a child's tile is signed in as themselves, and without it
// they'd publish a report about their own session to their spouse.
export function parentEmailsForEmail(email) {
  const found = lookupEmail(email);
  if (!found || found.member.kind !== "kid") return [];
  if (!found.family.driveReport) return [];
  return found.family.members
    .filter((m) => m.kind === "adult")
    .flatMap((m) => m.emails || []);
}

// ---- Avatars ----
// Who a member is DRAWN as on the picker. Families other than the author's
// have no photo stickers of their own, so everyone gets a catalogue to choose
// from: kids pick one of the three Socatei, grown-ups pick a generic mum/dad.
//
// This is only the picture on the tile. It is deliberately NOT the same thing
// as the "Talk to:" mascot preference in chat.js — a child can be drawn as
// Sushi while practising with all three, and conflating the two would take a
// choice away rather than add one.
export const AVATARS = {
  kid: [
    { id: "bobo", name: "Bobo", img: "assets/socatei/bobo-sticker.png" },
    { id: "fizz", name: "Fizz", img: "assets/socatei/fizz-sticker.png" },
    { id: "sushi", name: "Sushi", img: "assets/socatei/sushi-sticker.png" },
  ],
  adult: [
    { id: "mama", name: "Mama", img: "assets/socatei/mama-sticker.png" },
    { id: "tata", name: "Tata", img: "assets/socatei/tata-sticker.png" },
  ],
};

const AVATAR_KEY_PREFIX = "engleza-familie:avatar:";

// What this member may choose from. A member who ships with their own artwork
// (the author's household has photo stickers) keeps it as the first option, so
// choosing a generic one is never a one-way door.
export function avatarOptionsFor(member) {
  const catalogue = AVATARS[member.kind] || [];
  const ownArt = member.img && !catalogue.some((a) => a.img === member.img);
  return ownArt ? [{ id: "own", name: member.name, img: member.img }, ...catalogue] : catalogue;
}

// Falls back to the member's shipped artwork, then to nothing (the caller
// draws the emoji badge instead).
export function getMemberAvatar(member) {
  const chosen = localStorage.getItem(AVATAR_KEY_PREFIX + member.id);
  if (chosen) {
    const match = avatarOptionsFor(member).find((a) => a.id === chosen);
    if (match) return match.img;
    // A stored id that no longer exists (artwork renamed, or the member
    // changed kind) must not blank the tile — fall through to the default.
  }
  return member.img || null;
}

export function setMemberAvatar(memberId, avatarId) {
  localStorage.setItem(AVATAR_KEY_PREFIX + memberId, avatarId);
}

// A kid's placement result (which profile the test put them in) is remembered
// per device so the test only runs once. localStorage keeps it simple and
// avoids a Drive round-trip before we even know which level's file to open.
const PLACEMENT_KEY_PREFIX = "engleza-familie:placement:";

export function getMemberPlacement(memberId) {
  return localStorage.getItem(PLACEMENT_KEY_PREFIX + memberId) || null;
}

export function setMemberPlacement(memberId, profileId) {
  localStorage.setItem(PLACEMENT_KEY_PREFIX + memberId, profileId);
}

export function clearMemberPlacement(memberId) {
  localStorage.removeItem(PLACEMENT_KEY_PREFIX + memberId);
}
