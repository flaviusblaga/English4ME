// Pure functions over state.gamification — no network calls. Called once per
// completed exchange (a full user message + assistant reply round-trip) for
// any profile with features.gamification === true.

const POINTS_PER_EXCHANGE = 10;

export const BADGES = [
  { id: "first-chat", label: "First Hello!", emoji: "👋", check: (s) => s.progress.totalTurns >= 1 },
  { id: "chatty-10", label: "Chatty Champion", emoji: "💬", check: (s) => s.progress.totalTurns >= 10 },
  { id: "chatty-50", label: "Word Wizard", emoji: "🧙", check: (s) => s.progress.totalTurns >= 50 },
  { id: "streak-3", label: "3-Day Streak", emoji: "🔥", check: (s) => s.gamification.longestStreak >= 3 },
  { id: "streak-7", label: "1-Week Streak", emoji: "⭐", check: (s) => s.gamification.longestStreak >= 7 },
  { id: "streak-30", label: "Monthly Master", emoji: "🏆", check: (s) => s.gamification.longestStreak >= 30 },
  { id: "points-100", label: "100 Points Club", emoji: "💯", check: (s) => s.gamification.points >= 100 },
];

function todayLocalDateString() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function daysBetween(dateStrA, dateStrB) {
  const a = new Date(dateStrA + "T00:00:00");
  const b = new Date(dateStrB + "T00:00:00");
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

function updateStreak(gamification) {
  const today = todayLocalDateString();
  if (gamification.lastPracticeDate === today) {
    return; // already practiced today, streak unchanged
  }
  if (gamification.lastPracticeDate === null) {
    gamification.currentStreak = 1;
  } else {
    const gap = daysBetween(gamification.lastPracticeDate, today);
    gamification.currentStreak = gap === 1 ? gamification.currentStreak + 1 : 1;
  }
  gamification.lastPracticeDate = today;
  gamification.longestStreak = Math.max(gamification.longestStreak, gamification.currentStreak);
}

// Mutates state.gamification (and reads state.progress for badge checks).
// Returns the array of newly unlocked badges (empty if none).
export function updateGamificationAfterTurn(state) {
  state.gamification.points += POINTS_PER_EXCHANGE;
  updateStreak(state.gamification);

  const alreadyUnlocked = new Set(state.gamification.badges);
  const newlyUnlocked = [];
  for (const badge of BADGES) {
    if (!alreadyUnlocked.has(badge.id) && badge.check(state)) {
      state.gamification.badges.push(badge.id);
      newlyUnlocked.push(badge);
    }
  }
  return newlyUnlocked;
}
