// Real-world rewards ladder agreed with the parent: every completed lesson
// earns screen time, and finishing a whole module (every lesson of the tier)
// earns a money bonus that grows with the level. Everything here is DERIVED
// from the completion records already saved per tier — no new Drive schema,
// no double-counting (completed{} is keyed by lesson id, so repeating a
// lesson never earns twice).

import { LESSONS, SENTENCE_LESSONS } from "./lessons-client.js";
import { ADVANCED_LESSONS, EXPERT_LESSONS } from "./grammar-client.js";
import { READING_PASSAGES } from "./reading-client.js";

export const SCREEN_TIME_PER_LESSON_MIN = 20;

// Expert's module includes the reading passages — "finishing the module"
// means finishing everything the tier offers, and reading is half of Expert.
const TIER_REWARD_SPECS = {
  beginner: { bonusLei: 150, buckets: ["lessons"], total: LESSONS.length },
  intermediate: { bonusLei: 200, buckets: ["lessonsIntermediate"], total: SENTENCE_LESSONS.length },
  advanced: { bonusLei: 300, buckets: ["lessonsAdvanced"], total: ADVANCED_LESSONS.length },
  expert: {
    bonusLei: 400,
    buckets: ["lessonsExpert", "reading"],
    total: EXPERT_LESSONS.length + READING_PASSAGES.length,
  },
};

function countCompleted(state, bucketKey) {
  const bucket = state[bucketKey];
  return bucket && bucket.completed ? Object.keys(bucket.completed).length : 0;
}

// Returns null for profiles without a lesson tier (the adult profile).
export function computeRewards(state, contentTier) {
  const spec = TIER_REWARD_SPECS[contentTier];
  if (!spec) return null;
  const lessonsCompleted = spec.buckets.reduce((n, key) => n + countCompleted(state, key), 0);
  return {
    tier: contentTier,
    bonusLei: spec.bonusLei,
    lessonsCompleted,
    totalLessons: spec.total,
    screenTimeMin: lessonsCompleted * SCREEN_TIME_PER_LESSON_MIN,
    bonusEarned: lessonsCompleted >= spec.total,
  };
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
