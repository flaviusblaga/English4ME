import { fetchChildProgress } from "./worker-client.js";
import { BADGES } from "./gamification.js";

const LAST_CHILD_EMAIL_KEY = "engleza-familie:lastChildEmail";

function el(id) {
  return document.getElementById(id);
}

export function initParentView() {
  const emailInput = el("parent-view-email-input");
  const remembered = localStorage.getItem(LAST_CHILD_EMAIL_KEY);
  if (remembered) emailInput.value = remembered;

  el("parent-view-load-btn").addEventListener("click", handleLoad);
}

async function handleLoad() {
  const email = el("parent-view-email-input").value.trim();
  const profileId = el("parent-view-profile-select").value;
  const status = el("parent-view-status");
  const results = el("parent-view-results");

  if (!email) {
    status.textContent = "Enter the child's email first.";
    status.hidden = false;
    results.hidden = true;
    return;
  }

  localStorage.setItem(LAST_CHILD_EMAIL_KEY, email);
  status.textContent = "Loading...";
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
      status.textContent = "No practice data found yet for this email — check the spelling, or the child hasn't practiced yet.";
    } else {
      status.textContent = `Couldn't load progress: ${err.message}`;
    }
    status.hidden = false;
  }
}

function renderRecord(record) {
  el("parent-view-name").textContent = `👀 Progresul lui ${record.displayName || record.userEmail}`;
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
    chip.textContent = `${badge.emoji} ${badge.label}`;
    badgesPanel.appendChild(chip);
  }

  const capsNote = el("parent-view-caps-note");
  if (record.droppedDays > 0) {
    capsNote.textContent = `Showing the most recent ${record.dailyLogs.length} days. ${record.droppedDays} earlier day(s) have aged out and are no longer stored.`;
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
  heading.textContent = "🏆 Recompense de onorat";
  card.appendChild(heading);

  const progressLine = document.createElement("p");
  progressLine.className = "rewards-row";
  progressLine.textContent = `📚 ${rewards.lessonsCompleted} / ${rewards.totalLessons} lecții terminate la nivelul ${rewards.tier}`;
  card.appendChild(progressLine);

  const screenTimeLine = document.createElement("p");
  screenTimeLine.className = "rewards-row";
  screenTimeLine.textContent = `⏱ Timp de tehnologie câștigat: ${rewards.screenTimeMin} min (20 min / lecție)`;
  card.appendChild(screenTimeLine);

  const bonusLine = document.createElement("p");
  bonusLine.className = "rewards-row rewards-row--bonus";
  if (rewards.bonusEarned) {
    bonusLine.classList.add("rewards-row--earned");
    bonusLine.textContent = `🎁 BONUS DE PLĂTIT: ${rewards.bonusLei} lei — modulul e terminat integral!`;
  } else {
    bonusLine.textContent = `🎁 Bonus la modul complet: ${rewards.bonusLei} lei (mai are ${rewards.totalLessons - rewards.lessonsCompleted} lecții)`;
  }
  card.appendChild(bonusLine);

  card.hidden = false;
}

function renderDay(day) {
  const details = document.createElement("details");
  details.className = "parent-view-day";

  const summary = document.createElement("summary");
  const droppedNote = day.turnsDroppedToday > 0 ? ` (${day.turnsDroppedToday} earliest messages that day were trimmed)` : "";
  summary.textContent = `${day.date} — ${day.turns.length} messages${droppedNote}`;
  details.appendChild(summary);

  const transcript = document.createElement("div");
  transcript.className = "parent-view-transcript";
  for (const turn of day.turns) {
    const line = document.createElement("p");
    line.className = `parent-view-line parent-view-line--${turn.role}`;
    const time = new Date(turn.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    line.textContent = `[${time}] ${turn.role === "user" ? "Child" : "Socatei"}: ${turn.text}`;
    transcript.appendChild(line);
  }
  details.appendChild(transcript);

  return details;
}
