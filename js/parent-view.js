import { fetchChildProgress, fetchFamilyRewards, saveFamilyRewards } from "./worker-client.js";
import { BADGES, badgeLabel } from "./gamification.js";
import { setActiveRewards } from "./rewards.js";
import { iconSvg } from "./icons.js";
import { t, moduleName } from "./i18n.js";

const LAST_CHILD_EMAIL_KEY = "engleza-familie:lastChildEmail";

function el(id) {
  return document.getElementById(id);
}

export function initParentView() {
  el("parent-view-load-btn").addEventListener("click", handleLoad);
  el("reward-settings-save").addEventListener("click", handleSaveRewards);
  fillRewardForm();
}

// Fills the child dropdown from the signed-in adult's own family. Called by
// app.js every time the parent view opens, so it works for any family in the
// registry — no more typing an email by hand. `children` is [{ name, email }].
export function setParentChildren(children) {
  const select = el("parent-view-child-select");
  if (!select) return;
  select.innerHTML = "";

  if (!children.length) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = t("parent.noChild");
    select.appendChild(opt);
    return;
  }

  for (const child of children) {
    const opt = document.createElement("option");
    opt.value = child.email;
    opt.textContent = child.name;
    select.appendChild(opt);
  }

  // Re-select whoever was viewed last, if they're still in the list.
  const last = localStorage.getItem(LAST_CHILD_EMAIL_KEY);
  if (last && children.some((c) => c.email === last)) select.value = last;
}

const BONUS_TIERS = ["beginner", "intermediate", "advanced", "expert"];

// Shows what is currently in force. Failing quietly is right here: a parent
// opening this panel while the Worker is unreachable should see the defaults,
// not an error blocking the rest of the screen.
async function fillRewardForm() {
  let scheme;
  try {
    scheme = (await fetchFamilyRewards()).rewards;
  } catch {
    return;
  }
  el("reward-per-lesson-amount").value = scheme.perLesson.amount;
  el("reward-per-lesson-unit").value = scheme.perLesson.unit;
  el("reward-bonus-unit").value = scheme.moduleBonus.unit;
  for (const tier of BONUS_TIERS) {
    el(`reward-bonus-${tier}`).value = scheme.moduleBonus[tier];
  }
}

async function handleSaveRewards() {
  const status = el("reward-settings-status");
  const button = el("reward-settings-save");

  const payload = {
    perLesson: {
      amount: el("reward-per-lesson-amount").value,
      unit: el("reward-per-lesson-unit").value,
    },
    moduleBonus: { unit: el("reward-bonus-unit").value },
  };
  for (const tier of BONUS_TIERS) {
    payload.moduleBonus[tier] = el(`reward-bonus-${tier}`).value;
  }

  button.disabled = true;
  status.hidden = false;
  status.textContent = t("admin.saving");

  try {
    const result = await saveFamilyRewards(payload);
    // Apply to this session too, so the parent sees the new wording without
    // signing out and back in.
    setActiveRewards(result.rewards);
    status.innerHTML = iconSvg("circle-check");
    status.append(t("parent.saved"));
  } catch (err) {
    status.textContent =
      err.code === "forbidden"
        ? t("parent.saveForbidden")
        : t("parent.saveErr", { msg: err.message });
  } finally {
    button.disabled = false;
  }
}

async function handleLoad() {
  const email = el("parent-view-child-select").value;
  const profileId = el("parent-view-profile-select").value;
  const status = el("parent-view-status");
  const results = el("parent-view-results");

  if (!email) {
    status.textContent = t("parent.selectChild");
    status.hidden = false;
    results.hidden = true;
    return;
  }

  localStorage.setItem(LAST_CHILD_EMAIL_KEY, email);
  status.textContent = t("parent.loading");
  status.hidden = false;
  results.hidden = true;

  try {
    const record = await fetchChildProgress({ userEmail: email, profileId });
    renderRecord(record);
    status.hidden = true;
    results.hidden = false;
  } catch (err) {
    results.hidden = true;
    if (err.code === "not_found") {
      status.textContent = t("parent.notFound");
    } else {
      status.textContent = t("parent.loadErr", { msg: err.message });
    }
    status.hidden = false;
  }
}

function renderRecord(record) {
  const nameEl = el("parent-view-name");
  nameEl.innerHTML = iconSvg("eye");
  nameEl.append(t("parent.progressTitle", { name: record.displayName || record.userEmail }));
  el("parent-view-points").textContent = record.gamification ? record.gamification.points : 0;
  el("parent-view-streak").textContent = record.gamification ? record.gamification.currentStreak : 0;
  el("parent-view-turns").textContent = record.progress ? record.progress.totalTurns : 0;

  renderRewards(record.gamification && record.gamification.rewards);

  const badgesPanel = el("parent-view-badges");
  badgesPanel.innerHTML = "";
  const unlocked = new Set(record.gamification ? record.gamification.badges : []);
  for (const badge of BADGES) {
    const chip = document.createElement("span");
    chip.className = `gamification-badge-chip${unlocked.has(badge.id) ? "" : " gamification-badge-chip--locked"}`;
    chip.textContent = `${badge.emoji} ${badgeLabel(badge.id)}`;
    badgesPanel.appendChild(chip);
  }

  const capsNote = el("parent-view-caps-note");
  if (record.droppedDays > 0) {
    capsNote.textContent = t("parent.capsNote", { n: record.dailyLogs.length, d: record.droppedDays });
    capsNote.hidden = false;
  } else {
    capsNote.hidden = true;
  }

  const daysWrap = el("parent-view-days");
  daysWrap.innerHTML = "";
  const sortedDays = [...record.dailyLogs].sort((a, b) => (a.date < b.date ? 1 : -1)); // newest first
  for (const day of sortedDays) {
    daysWrap.appendChild(renderDay(day));
  }
}

// The child's real-world reward status (agreed ladder: screen time per
// completed lesson + a per-level money bonus for finishing the module) —
// synced from the child's device inside the gamification payload, so this
// shows without any Worker change. Older synced records predate the field
// and simply hide the card.
function renderRewards(rewards) {
  const card = el("parent-view-rewards");
  if (!rewards) {
    card.hidden = true;
    return;
  }

  card.innerHTML = "";

  const heading = document.createElement("p");
  heading.className = "rewards-card-heading";
  heading.innerHTML = iconSvg("trophy");
  heading.append(t("parent.rewardsHeading"));
  card.appendChild(heading);

  const progressLine = document.createElement("p");
  progressLine.className = "rewards-row";
  progressLine.innerHTML = iconSvg("book-open");
  progressLine.append(t("parent.rwProgress", { a: rewards.lessonsCompleted, b: rewards.totalLessons, module: moduleName(rewards.tier) }));
  card.appendChild(progressLine);

  const screenTimeLine = document.createElement("p");
  screenTimeLine.className = "rewards-row";
  screenTimeLine.innerHTML = iconSvg("timer");
  screenTimeLine.append(t("parent.rwEarned", { amount: rewards.earnedAmount, unit: rewards.perLessonUnit, per: rewards.perLessonAmount }));
  card.appendChild(screenTimeLine);

  const bonusLine = document.createElement("p");
  bonusLine.className = "rewards-row rewards-row--bonus";
  if (rewards.bonusEarned) {
    bonusLine.classList.add("rewards-row--earned");
    bonusLine.innerHTML = iconSvg("gift");
    bonusLine.append(t("parent.rwBonusEarned", { amount: rewards.bonusAmount, unit: rewards.bonusUnit }));
  } else {
    bonusLine.innerHTML = iconSvg("gift");
    bonusLine.append(` Bonus la modul complet: ${rewards.bonusAmount} ${rewards.bonusUnit} (mai are ${rewards.totalLessons - rewards.lessonsCompleted} lecții)`);
  }
  card.appendChild(bonusLine);

  card.hidden = false;
}

function renderDay(day) {
  const details = document.createElement("details");
  details.className = "parent-view-day";

  const summary = document.createElement("summary");
  const droppedNote = day.turnsDroppedToday > 0 ? t("parent.dayTrimmed", { n: day.turnsDroppedToday }) : "";
  summary.textContent = t("parent.dayMessages", { date: day.date, n: day.turns.length, note: droppedNote });
  details.appendChild(summary);

  const transcript = document.createElement("div");
  transcript.className = "parent-view-transcript";
  for (const turn of day.turns) {
    const line = document.createElement("p");
    line.className = `parent-view-line parent-view-line--${turn.role}`;
    const time = new Date(turn.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    line.textContent = `[${time}] ${turn.role === "user" ? t("parent.roleChild") : t("parent.roleMascot")}: ${turn.text}`;
    transcript.appendChild(line);
  }
  details.appendChild(transcript);

  return details;
}
