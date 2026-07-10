// Registry of all profiles. Each profile's `features` flags are the single
// branch point the rest of the app uses (e.g. `if (profile.features.scenarios)`)
// instead of scattering profileId string checks around the codebase.
export const PROFILES = [
  {
    id: "business-conversational",
    displayName: "Business English — Conversational",
    level: "conversational",
    description: "Adult workplace English: meetings, emails, small talk, role-play scenarios.",
    features: { scenarios: true, documents: true, gamification: false, canViewChildren: true },
  },
  {
    id: "kids-primar",
    displayName: "Socatei — Beginner (Bobo & Fizz)",
    level: "beginner",
    contentTier: "beginner",
    description: "Just starting out with English. Playful practice with two silly mascot friends, Bobo & Fizz.",
    features: { scenarios: false, documents: false, gamification: true, parentVisible: true, lessons: true, mascots: true },
  },
  {
    id: "kids-intermediate",
    displayName: "Socatei — Intermediate (Bobo & Fizz)",
    level: "intermediate",
    contentTier: "intermediate",
    description: "Already know the basics — time to build full sentences with Bobo & Fizz.",
    features: { scenarios: false, documents: false, gamification: true, parentVisible: true, lessons: true, mascots: true, lessonsIntermediate: true },
  },
];

export function getProfile(profileId) {
  const profile = PROFILES.find((p) => p.id === profileId);
  if (!profile) throw new Error(`Unknown profileId: ${profileId}`);
  return profile;
}
