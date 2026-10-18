// Weekly-plan logic for the adult Business "Progress" view. Pure: it turns the
// set of practised scenario ids into three non-punitive suggestions (no
// invented numbers) and renders each as a list item. Extracted from chat.js —
// chat.js (renderProgressPro) owns the surrounding panel and wires the action
// buttons; this module holds only the derivation and the item markup.
import { SCENARIOS } from "./scenarios-client.js";
import { PHRASEBANK } from "./phrasebank.data.js";
import { iconSvg } from "./icons.js";

// Small local HTML escaper. chat.js and progress-doc.js each keep their own
// copy; this module stays self-contained the same way rather than reaching
// across module boundaries for a ten-line helper.
function escapeHtml(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Rotates the plan weekly without storing anything: a week index since the
// epoch, used to pick deterministically within a pool so the plan is stable
// across a week and changes on its own after seven days.
function currentWeekSeed() {
  return Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
}

// Build 3 non-punitive suggestions from REAL state (no invented numbers):
//   1. a scenario to try — one not yet practised, from the least-covered area,
//      so the plan broadens the member's range; if all are done, a revisit.
//   2. a Writing-mode task.
//   3. a phrase group to review, rotating weekly.
export function buildWeeklyPlan(practicedSet) {
  const seed = currentWeekSeed();
  const plan = [];

  const unpracticed = SCENARIOS.filter((s) => !practicedSet.has(s.id));
  if (unpracticed.length) {
    // Coverage ratio per category, to steer toward the least-covered area.
    const cov = new Map();
    for (const s of SCENARIOS) {
      const c = cov.get(s.category) || { done: 0, total: 0 };
      c.total += 1;
      if (practicedSet.has(s.id)) c.done += 1;
      cov.set(s.category, c);
    }
    const ratio = (cat) => {
      const c = cov.get(cat);
      return c && c.total ? c.done / c.total : 1;
    };
    const cats = [...new Set(unpracticed.map((s) => s.category))].sort((a, b) => ratio(a) - ratio(b));
    const pool = unpracticed.filter((s) => s.category === cats[0]);
    const s = pool[seed % pool.length];
    plan.push({ kind: "scenario", id: s.id, label: s.label, category: s.category, revisit: false });
  } else {
    const s = SCENARIOS[seed % SCENARIOS.length];
    plan.push({ kind: "scenario", id: s.id, label: s.label, category: s.category, revisit: true });
  }

  plan.push({ kind: "writing" });

  const group = PHRASEBANK.length ? PHRASEBANK[seed % PHRASEBANK.length] : null;
  plan.push({ kind: "phrases", group: group ? group.category : null });

  return plan;
}

export function weeklyPlanItemHtml(item) {
  let icon = "message-circle";
  let text = "";
  let action = "Start";
  if (item.kind === "scenario") {
    icon = "message-circle";
    text = item.revisit
      ? `Revisit <b>${escapeHtml(item.label)}</b> and sharpen it.`
      : `Try a <b>${escapeHtml(item.category)}</b> scenario: <b>${escapeHtml(item.label)}</b>.`;
    action = item.revisit ? "Start again" : "Start";
    return (
      `<li class="weekly-plan-item">${iconSvg(icon)}<span class="weekly-plan-text">${text}</span>` +
      `<button type="button" class="btn btn-small weekly-plan-action" data-kind="scenario" data-scenario="${escapeHtml(item.id)}">${action}</button></li>`
    );
  }
  if (item.kind === "writing") {
    icon = "pencil";
    text = `Polish a real email or message in <b>Writing mode</b>.`;
    return (
      `<li class="weekly-plan-item">${iconSvg(icon)}<span class="weekly-plan-text">${text}</span>` +
      `<button type="button" class="btn btn-small weekly-plan-action" data-kind="writing">Open</button></li>`
    );
  }
  // phrases
  icon = "folder";
  text = item.group
    ? `Review the <b>${escapeHtml(item.group)}</b> phrases.`
    : `Browse the phrasebank for lines you can reuse.`;
  return (
    `<li class="weekly-plan-item">${iconSvg(icon)}<span class="weekly-plan-text">${text}</span>` +
    `<button type="button" class="btn btn-small weekly-plan-action" data-kind="phrases">Open</button></li>`
  );
}
