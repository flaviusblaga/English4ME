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
    displayName: "Socatei — Beginner (Bobo & Fizz)",
    level: "beginner",
    contentTier: "beginner",
    emoji: "🌱",
    description: "Just starting out with English. Playful practice with two silly mascot friends, Bobo & Fizz.",
    features: { scenarios: false, documents: false, gamification: true, parentVisible: true, lessons: true, mascots: true, reading: true },
  },
  {
    id: "kids-intermediate",
    displayName: "Socatei — Intermediate (Bobo & Fizz)",
    level: "intermediate",
    contentTier: "intermediate",
    emoji: "🌿",
    description: "Already know the basics — time to build full sentences with Bobo & Fizz.",
    features: { scenarios: false, documents: false, gamification: true, parentVisible: true, lessons: true, mascots: true, lessonsIntermediate: true, reading: true },
  },
  {
    id: "kids-advanced",
    displayName: "Socatei — Advanced",
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
    displayName: "Socatei — Expert",
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
export const MEMBERS = [
  { id: "flavius", name: "Flavius", emoji: "💼", kind: "adult", role: "admin", profileId: "business-conversational" },
  { id: "andrea",  name: "Andrea",  emoji: "☕", kind: "adult", role: "admin", profileId: "business-conversational" },
  { id: "darius",  name: "Darius",  emoji: "🦫", kind: "kid", img: "assets/socatei/bobo-face.png" },
  { id: "rares",   name: "Rareș",   emoji: "🐿️", kind: "kid", img: "assets/socatei/fizz-face.png" },
];

export function getMember(memberId) {
  const member = MEMBERS.find((m) => m.id === memberId);
  if (!member) throw new Error(`Unknown memberId: ${memberId}`);
  return member;
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
