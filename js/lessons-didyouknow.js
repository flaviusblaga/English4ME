// "Did you know?" — the fun-facts-about-Romania section offered to the mascot
// tiers (kids/teen) alongside their lessons. Extracted from lessons.js: this
// module owns the fact bank (lazy-loaded), its own view state, the featured-card
// shuffle, the domain-filter chips, and the per-card RO-translation toggle.
//
// lessons.js keeps the view show/hide orchestration (showDidYouKnow) and calls
// renderDidYouKnow() to fill the view — so this module never touches the lesson
// session or the exercise flow, only its own DOM subtree.
import { t } from "./i18n.js";
import { iconSvg } from "./icons.js";

const el = (id) => document.getElementById(id);

let dykDomain = "all";       // active domain filter ("all" = every fact)
let dykFeaturedId = null;    // id of the fact on the featured card (avoid repeats)

// The fact bank, loaded once on first open and cached. Keeping it out of the
// static import graph shaves ~840 lines off what every kid/teen session parses
// at boot, for a feature many sessions never open. A regression test
// (tests/picker.spec.js) guards that didyouknow.data.js isn't fetched at boot.
let DYK_DOMAINS = [];
let randomFact = null;
async function ensureDykData() {
  if (randomFact) return;
  const mod = await import("./didyouknow.data.js");
  DYK_DOMAINS = mod.DOMAINS;
  randomFact = mod.randomFact;
}

// Pull in the fact bank on demand, then render a fresh featured fact + the
// domain chips. The caller has already switched the view in and set the static
// headings, so the view's shell is visible while the bank loads.
export async function renderDidYouKnow() {
  await ensureDykData();
  // Start fresh each visit: a new random featured fact and the "all" filter.
  dykDomain = "all";
  dykFeaturedId = null;
  pickFeaturedFact();
  renderDykChips();
}

// The featured fact card's markup — English on top, Romanian revealed by a
// toggle. `featured` enlarges and tints it (kept as a flag for flexibility).
function dykFactCardHtml(fact, featured) {
  return (
    `<div class="dyk-card${featured ? " dyk-card--featured" : ""}">` +
      `<span class="dyk-card-emoji">${fact.emoji}</span>` +
      `<div class="dyk-card-body">` +
        `<p class="dyk-card-en">${fact.en}</p>` +
        `<p class="dyk-card-ro" hidden>${fact.ro}</p>` +
        `<button type="button" class="dyk-ro-toggle" data-ro-toggle>${t("didYouKnow.tapForRo")}</button>` +
      `</div>` +
    `</div>`
  );
}

// Wires the RO-translation toggle inside a rendered card container.
function wireDykRoToggles(container) {
  container.querySelectorAll("[data-ro-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const ro = btn.previousElementSibling; // the .dyk-card-ro <p>
      const showing = !ro.hidden;
      ro.hidden = showing;
      btn.textContent = showing ? t("didYouKnow.tapForRo") : t("didYouKnow.hideRo");
      btn.classList.toggle("is-open", !showing);
    });
  });
}

// Featured card: a random fact (from the active domain) plus the shuffle button.
function pickFeaturedFact() {
  const fact = randomFact(dykFeaturedId, dykDomain);
  if (!fact) return;
  dykFeaturedId = fact.id;
  const box = el("lesson-dyk-featured");
  box.innerHTML =
    dykFactCardHtml(fact, true) +
    `<button type="button" id="dyk-another-btn" class="btn btn-primary dyk-another-btn">` +
      `${iconSvg("rotate-cw")} ${t("didYouKnow.another")}` +
    `</button>`;
  wireDykRoToggles(box);
  el("dyk-another-btn").onclick = pickFeaturedFact;
}

// Domain filter chips ("All" + one per domain). The active chip is highlighted;
// tapping one picks a fresh featured fact from that domain, so "Another fact"
// then keeps drawing from the chosen domain. There is no browsable list — the
// child discovers facts one at a time via the shuffle button.
function renderDykChips() {
  const wrap = el("lesson-dyk-chips");
  wrap.innerHTML = "";
  const chips = [{ id: "all", emoji: "✨", label: t("didYouKnow.allDomains") }, ...DYK_DOMAINS];
  for (const c of chips) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "dyk-chip" + (c.id === dykDomain ? " is-active" : "");
    btn.innerHTML = `<span>${c.emoji}</span> ${c.label}`;
    btn.onclick = () => {
      dykDomain = c.id;
      dykFeaturedId = null;
      pickFeaturedFact();
      renderDykChips();
    };
    wrap.appendChild(btn);
  }
}
