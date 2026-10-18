// Practice-activity chart for the lesson Stats view: how many days the learner
// practised in each of the last 8 weeks. The one trend the Stats view wasn't
// showing — per-category progress and the streak count were already there, but
// not consistency over time.
//
// Built as inline SVG (the app has no build step and ships zero runtime
// dependencies, so no chart library). Single series, so the heading names it
// and no legend is needed; one hue (brand Signal Orange) on a recessive track,
// a per-bar hover/focus tooltip, and a per-bar aria-label as the non-visual
// readout. It charts ONLY recorded practice days — nothing is inferred or
// invented for weeks with no data (they read as an empty column).
import { t } from "./i18n.js";
import { iconSvg } from "./icons.js";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function dayKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function shortDate(key) {
  const [y, m, d] = key.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}`;
}

// Pure: bucket recorded practice-day keys into the last `weeks` 7-day windows
// ending today, oldest→newest. count is the number of DISTINCT recorded days
// in that window (0–7); nothing outside the window or unrecorded is counted.
export function activityByWeek(practiceDays, today = new Date(), weeks = 8) {
  const keys = new Set(Array.isArray(practiceDays) ? practiceDays : []);
  const buckets = [];
  for (let w = weeks - 1; w >= 0; w--) {
    const end = new Date(today);
    end.setHours(0, 0, 0, 0);
    end.setDate(end.getDate() - w * 7);
    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    let count = 0;
    const cur = new Date(start);
    while (cur <= end) {
      if (keys.has(dayKey(cur))) count++;
      cur.setDate(cur.getDate() + 1);
    }
    buckets.push({ start: dayKey(start), end: dayKey(end), count, isCurrent: w === 0 });
  }
  return buckets;
}

// Renders the chart into `container` (a .stats-card). Shows a friendly empty
// state when there is no recorded practice yet, so a brand-new learner never
// sees a bare set of zero columns.
export function renderActivityChart(container, practiceDays) {
  if (!container) return;
  const weeks = activityByWeek(practiceDays, new Date(), 8);
  const totalActive = weeks.reduce((s, w) => s + w.count, 0);

  const heading = `<p class="stats-card-heading">${iconSvg("chart-column")} ${t("stats.activityHeading")}</p>`;

  if (totalActive === 0) {
    container.innerHTML = heading + `<p class="activity-empty">${t("stats.activityEmpty")}</p>`;
    container.hidden = false;
    return;
  }

  // viewBox geometry (arbitrary user units; the SVG scales to its container).
  const W = 560, H = 210;
  const padL = 10, padR = 10, padTop = 14, padBottom = 34;
  const plotW = W - padL - padR;
  const plotH = H - padTop - padBottom;
  const baseY = padTop + plotH;
  const MAX = 7;                       // a week has at most 7 days
  const slot = plotW / weeks.length;
  const barW = Math.min(44, slot - 10); // leave a gap between columns

  const tickVals = [0, MAX];           // recessive y reference: floor and the 7-day ceiling
  const gridlines = tickVals
    .map((v) => {
      const y = baseY - (v / MAX) * plotH;
      return (
        `<line class="activity-grid" x1="${padL}" y1="${y.toFixed(1)}" x2="${W - padR}" y2="${y.toFixed(1)}"></line>` +
        `<text class="activity-ytick" x="${padL}" y="${(y - 3).toFixed(1)}">${v}</text>`
      );
    })
    .join("");

  const bars = weeks
    .map((wk, i) => {
      const cx = padL + slot * i + slot / 2;
      const x = cx - barW / 2;
      const h = (wk.count / MAX) * plotH;
      const y = baseY - h;
      const label = `${shortDate(wk.start)} – ${shortDate(wk.end)}`;
      const aria = t("stats.activityAria", { range: label, n: wk.count });
      // Full-height recessive track shows the "out of 7" scale; the orange fill
      // is the value. rx rounds both so a full week reads as a rounded column.
      return (
        `<g class="activity-col" tabindex="0" role="img" aria-label="${aria}" ` +
        `data-range="${label}" data-count="${wk.count}">` +
        `<rect class="activity-track" x="${x.toFixed(1)}" y="${padTop}" width="${barW.toFixed(1)}" height="${plotH}" rx="5"></rect>` +
        (wk.count > 0
          ? `<rect class="activity-bar${wk.isCurrent ? " activity-bar--now" : ""}" x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${h.toFixed(1)}" rx="5"></rect>`
          : "") +
        (wk.isCurrent
          ? `<text class="activity-nowlabel" x="${cx.toFixed(1)}" y="${baseY + 16}">${t("stats.activityNow")}</text>`
          : "") +
        `</g>`
      );
    })
    .join("");

  // x-axis anchors: the oldest week's start and "now" (selective labels, not one
  // per column). The "now" marker is drawn per-bar above.
  const startLabel = `<text class="activity-xtick" x="${padL}" y="${baseY + 16}">${shortDate(weeks[0].start)}</text>`;

  container.innerHTML =
    heading +
    `<p class="activity-sub">${t("stats.activitySub")}</p>` +
    `<div class="activity-chart">` +
      `<svg class="activity-svg" viewBox="0 0 ${W} ${H}" role="img" ` +
        `aria-label="${t("stats.activityHeading")} — ${t("stats.activitySub")}" preserveAspectRatio="xMidYMid meet">` +
        `<line class="activity-axis" x1="${padL}" y1="${baseY}" x2="${W - padR}" y2="${baseY}"></line>` +
        gridlines +
        bars +
        startLabel +
      `</svg>` +
      `<div class="activity-tip" role="status" aria-live="polite" hidden></div>` +
    `</div>`;

  wireTooltip(container);
  container.hidden = false;
}

// A lightweight pointer/focus tooltip (no library). Shows the week range and
// "N of 7 days" for the hovered/focused column, positioned over the chart.
function wireTooltip(container) {
  const chart = container.querySelector(".activity-chart");
  const tip = container.querySelector(".activity-tip");
  if (!chart || !tip) return;

  const show = (col) => {
    const count = Number(col.getAttribute("data-count"));
    tip.innerHTML =
      `<span class="activity-tip-range">${col.getAttribute("data-range")}</span>` +
      `<span class="activity-tip-count">${t("stats.activityTip", { n: count })}</span>`;
    tip.hidden = false;
    // Position the tip centred over the column, clamped to the chart box.
    const colBox = col.getBoundingClientRect();
    const box = chart.getBoundingClientRect();
    const left = colBox.left - box.left + colBox.width / 2;
    tip.style.left = `${Math.max(4, Math.min(box.width - 4, left))}px`;
  };
  const hide = () => { tip.hidden = true; };

  chart.querySelectorAll(".activity-col").forEach((col) => {
    col.addEventListener("pointerenter", () => show(col));
    col.addEventListener("pointerleave", hide);
    col.addEventListener("focus", () => show(col));
    col.addEventListener("blur", hide);
  });
}
