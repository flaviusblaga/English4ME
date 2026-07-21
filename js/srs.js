// Spaced repetition — the engine that turns a finite word bank into months of
// daily practice. Instead of "finish a lesson once and it's done", every WORD
// (or sentence) carries a mastery level and a due date: answer it right and it
// comes back later, get it wrong and it comes back sooner. This mirrors the
// NEW / LEARNING / KNOWN cycle in the tutor prompt.
//
// Pure functions over state.srs — no DOM, no network.

// Days until an item is due again, per mastery level. Level 0 = brand new /
// just missed (same day), level 5 = long-term known.
const INTERVALS_DAYS = [0, 1, 3, 7, 21, 60];
export const MAX_LEVEL = INTERVALS_DAYS.length - 1;

// A level this high counts as "mastered" for progress reporting.
export const MASTERED_LEVEL = 4;

function todayKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function addDays(dateKey, days) {
  const d = new Date(dateKey + "T00:00:00");
  d.setDate(d.getDate() + days);
  return todayKey(d);
}

// state.srs is keyed by content tier so Beginner and Intermediate progress
// never mix: { beginner: { "dog": { level, due, seen, wrong } }, ... }
export function getSrsBucket(state, tier) {
  if (!state.srs) state.srs = {};
  if (!state.srs[tier]) state.srs[tier] = {};
  return state.srs[tier];
}

export function getEntry(state, tier, label) {
  return getSrsBucket(state, tier)[label] || null;
}

// True when the item is scheduled for today or earlier (or has never been seen).
export function isDue(entry, today = todayKey()) {
  if (!entry) return true; // never practised → always available as "new"
  return entry.due <= today;
}

// Records one answer and reschedules. Correct → next level (longer interval);
// wrong → drop a level and come back today/tomorrow.
export function recordAnswer(state, tier, label, wasCorrect) {
  const bucket = getSrsBucket(state, tier);
  const today = todayKey();
  const entry = bucket[label] || { level: 0, due: today, seen: 0, wrong: 0 };

  entry.seen += 1;
  if (wasCorrect) {
    entry.level = Math.min(MAX_LEVEL, entry.level + 1);
  } else {
    entry.wrong += 1;
    entry.level = Math.max(0, entry.level - 1);
  }
  entry.due = addDays(today, INTERVALS_DAYS[entry.level]);
  entry.lastSeen = today;

  bucket[label] = entry;
  return entry;
}

// Builds today's practice list: everything already due (oldest first), topped
// up with a few brand-new items. Capping new items per session is deliberate —
// the tutor methodology says never introduce more than ~7 at once.
export function buildDailyItems(state, tier, allLabels, { maxDue = 14, maxNew = 6 } = {}) {
  const bucket = getSrsBucket(state, tier);
  const today = todayKey();

  const due = allLabels
    .filter((l) => bucket[l] && bucket[l].due <= today)
    .sort((a, b) => (bucket[a].due < bucket[b].due ? -1 : 1))
    .slice(0, maxDue);

  const fresh = allLabels.filter((l) => !bucket[l]).slice(0, maxNew);

  return { due, fresh, all: [...due, ...fresh] };
}

// Progress numbers for the home screen: how much of the tier is known, and how
// much is waiting for review today.
export function srsStats(state, tier, allLabels) {
  const bucket = getSrsBucket(state, tier);
  const today = todayKey();
  let mastered = 0;
  let learning = 0;
  let dueNow = 0;
  for (const label of allLabels) {
    const e = bucket[label];
    if (!e) continue;
    if (e.level >= MASTERED_LEVEL) mastered += 1;
    else learning += 1;
    if (e.due <= today) dueNow += 1;
  }
  return {
    total: allLabels.length,
    mastered,
    learning,
    untouched: allLabels.length - mastered - learning,
    dueNow,
    // brand-new items are always available, so there is practice to do whenever
    // something is due OR there is still unseen vocabulary
    hasWorkToday: dueNow > 0 || allLabels.length - mastered - learning > 0,
  };
}

// Which exercise type to use for an item, based on how well it is known.
// Recognition first (see it, pick it), then production (recall it, say it,
// spell it) — output beats input, exactly as the tutor prompt prescribes.
export function exerciseTypeForLevel(level, availableTypes) {
  const recognition = availableTypes.filter((t) => t.tier === "recognition").map((t) => t.type);
  const production = availableTypes.filter((t) => t.tier === "production").map((t) => t.type);
  const pool = level <= 1 ? recognition : level <= 3 ? [...recognition, ...production] : production;
  const usable = pool.length ? pool : availableTypes.map((t) => t.type);
  return usable[Math.floor(Math.random() * usable.length)];
}

export { todayKey };
