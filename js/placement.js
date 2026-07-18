// Placement-test screen controller. Runs the fixed quiz from
// placement-client.js one question at a time, scores it, maps the score to a
// starting level, remembers it for this member, and hands the chosen profileId
// back to app.js so the child drops straight into the right lessons.

import { PLACEMENT_QUESTIONS, PLACEMENT_TOTAL, levelForScore } from "./placement-client.js";
import { setMemberPlacement, clearMemberPlacement } from "./profile.js";

let member = null;
let onDoneCallback = null;
let index = 0;
let score = 0;

function el(id) {
  return document.getElementById(id);
}

// Fresh copy each run so a retake re-randomises option order without mutating
// the source bank.
function shuffled(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function initPlacement({ member: m, onDone }) {
  member = m;
  onDoneCallback = onDone;
  index = 0;
  score = 0;

  el("placement-quiz-view").hidden = false;
  el("placement-result-view").hidden = true;
  el("placement-lead").textContent = `Salut, ${member.name}! Hai să vedem de unde pornim. Alege răspunsul corect — nu-i nimic dacă nu știi toate! 😊`;

  el("placement-retake-btn").onclick = () => {
    clearMemberPlacement(member.id);
    initPlacement({ member, onDone: onDoneCallback });
  };

  renderQuestion();
}

function renderQuestion() {
  const q = PLACEMENT_QUESTIONS[index];
  el("placement-progress-label").textContent = `${index + 1} / ${PLACEMENT_TOTAL}`;
  el("placement-progress-fill").style.width = `${((index + 1) / PLACEMENT_TOTAL) * 100}%`;

  el("placement-stem").textContent = q.emoji ? `${q.emoji}  ${q.stem}` : q.stem;

  const grid = el("placement-options");
  grid.innerHTML = "";
  for (const option of shuffled(q.options)) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "lesson-option-btn";
    btn.textContent = option.text;
    btn.addEventListener("click", () => handleAnswer(option, btn, grid));
    grid.appendChild(btn);
  }
}

function handleAnswer(option, btn, grid) {
  // Lock the row so a child can't double-tap or change the answer.
  for (const b of grid.children) b.disabled = true;
  if (option.correct) {
    score += 1;
    btn.classList.add("lesson-option-btn--correct");
  } else {
    btn.classList.add("lesson-option-btn--incorrect");
  }

  // Brief pause so the colour feedback registers, then advance. No "right
  // answer" is revealed — this is an assessment, not a lesson.
  setTimeout(() => {
    index += 1;
    if (index < PLACEMENT_TOTAL) {
      renderQuestion();
    } else {
      showResult();
    }
  }, 550);
}

function showResult() {
  const result = levelForScore(score);
  setMemberPlacement(member.id, result.profileId);

  el("placement-quiz-view").hidden = true;
  el("placement-result-view").hidden = false;

  const emojiByLevel = { beginner: "🌱", intermediate: "🌿", advanced: "🌳", expert: "🏆" };
  el("placement-result-emoji").textContent = emojiByLevel[result.contentTier] || "🎉";
  el("placement-result-title").textContent = `Nivelul tău: ${result.label}!`;
  el("placement-result-sub").textContent =
    `Ai răspuns corect la ${score} din ${PLACEMENT_TOTAL}. Te-am pus la nivelul potrivit — poți schimba oricând reluând testul.`;

  el("placement-start-btn").onclick = () => {
    if (onDoneCallback) onDoneCallback(result.profileId);
  };
}
