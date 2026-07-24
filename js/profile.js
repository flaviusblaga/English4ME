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
// The picker shows PEOPLE, not abstract levels. Each member maps onto one of
// the profiles above:
//   • adults (role "admin") → the Business English profile, and can view the
//     children's progress;
//   • kids → their level is NOT fixed here; it's decided by the placement test
//     the first time they enter, then remembered (see placement.js). So a kid
//     member has no profileId until the test assigns one.
//
// The registry itself lives in js/families.data.js, which the Worker imports
// too — one file to edit when a family joins. What THIS file adds is the
// browser-side reading of that data; every access decision is re-made
// server-side against a Google-verified email.
export { FAMILIES, DEFAULT_REWARDS, rewardsFor } from "./families.data.js";
import { FAMILIES, lookupEmailIn } from "./families.data.js";

// Flat view of everyone, for lookups that don't care about grouping.
export const MEMBERS = FAMILIES.flatMap((f) => f.members.map((m) => ({ ...m, familyId: f.id })));

function lookupEmail(email) {
  return lookupEmailIn(FAMILIES, email);
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
