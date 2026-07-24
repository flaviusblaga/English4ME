// Real-world rewards ladder: every completed lesson earns something, and
// finishing a whole module earns a bigger bonus that grows with the level.
// Everything here is DERIVED from the completion records already saved per
// tier — no new Drive schema, no double-counting (completed{} is keyed by
// lesson id, so repeating a lesson never earns twice).
//
// WHAT the reward IS belongs to each household, not to this file. One family
// pays screen time and lei; another counts points toward a bike. Parents set
// their own scheme in the app, it is stored per family by the Worker, and this
// module simply renders whatever they chose. `DEFAULT_REWARDS` in
// js/families.data.js is only the starting point.

import { READING_PASSAGES } from "./reading-client.js";
import { totalLessons } from "./lesson-structure.js";
import { DEFAULT_REWARDS, rewardsFor } from "./families.data.js";
import { fetchFamilyRewards } from "./worker-client.js";

// Expert's module includes the reading passages — "finishing the module"
// means finishing everything the tier offers, and reading is half of Expert.
const TIER_SPECS = {
  beginner: { buckets: ["lessons"], total: () => totalLessons("beginner") },
  intermediate: { buckets: ["lessonsIntermediate"], total: () => totalLessons("intermediate") },
  advanced: { buckets: ["lessonsAdvanced"], total: () => totalLessons("advanced") },
  expert: {
    buckets: ["lessonsExpert", "reading"],
    total: () => totalLessons("expert") + READING_PASSAGES.length,
  },
};

// The scheme in force for this session. Starts as the coded default so the
// very first render (before the Worker answers) shows sane numbers rather than
// blanks, then is replaced by the family's own once loaded.
let activeRewards = rewardsFor(null, null);

export function getActiveRewards() {
  return activeRewards;
}

export function setActiveRewards(rewards) {
  activeRewards = rewardsFor(null, rewards);
}

// Best-effort: a family that has never customised anything, or a Worker hiccup,
// simply keeps the defaults. A child must never be blocked from practising
// because a settings lookup failed.
export async function loadFamilyRewards() {
  try {
    const result = await fetchFamilyRewards();
    if (result && result.rewards) activeRewards = rewardsFor(null, result.rewards);
  } catch (err) {
    console.warn("Could not load the family's reward settings; using defaults:", err.message);
  }
  return activeRewards;
}

function countCompleted(state, bucketKey) {
  const bucket = state[bucketKey];
  return bucket && bucket.completed ? Object.keys(bucket.completed).length : 0;
}

// Returns null for profiles without a lesson tier (the adult profile).
export function computeRewards(state, contentTier) {
  const spec = TIER_SPECS[contentTier];
  if (!spec) return null;

  const scheme = activeRewards;
  const lessonsCompleted = spec.buckets.reduce((n, key) => n + countCompleted(state, key), 0);
  const total = spec.total();

  return {
    tier: contentTier,
    lessonsCompleted,
    totalLessons: total,
    bonusEarned: lessonsCompleted >= total,

    // Per-lesson earnings, in whatever unit this family chose.
    perLessonAmount: scheme.perLesson.amount,
    perLessonUnit: scheme.perLesson.unit,
    earnedAmount: lessonsCompleted * scheme.perLesson.amount,

    // The module bonus for THIS tier.
    bonusAmount: scheme.moduleBonus[contentTier] || 0,
    bonusUnit: scheme.moduleBonus.unit,
  };
}

// Ready-made phrases, so the same wording is used on the child's card, the
// completion screen and the parent view without three near-copies drifting.
export function perLessonPhrase(rewards) {
  return `${rewards.perLessonAmount} ${rewards.perLessonUnit}`;
}

export function earnedPhrase(rewards) {
  return `${rewards.earnedAmount} ${rewards.perLessonUnit}`;
}

export function bonusPhrase(rewards) {
  return `${rewards.bonusAmount} ${rewards.bonusUnit}`;
}

// The Worker stores the synced `gamification` object verbatim, so embedding
// rewards inside it reaches the parent dashboard without any Worker change.
// Every syncProgress call site should use this so a later sync (e.g. from
// free chat) never overwrites the stored record with a rewards-less copy.
export function gamificationWithRewards(state, profile) {
  if (!state.gamification) return null;
  const rewards = computeRewards(state, profile.contentTier);
  return rewards ? { ...state.gamification, rewards } : state.gamification;
}

export { DEFAULT_REWARDS };
