// Checks the Drive progress report: who it gets shared with, and that the
// generated document actually reflects the child's state.
//
// Run: node scripts/test-progress-doc.mjs

import { buildReportHtml } from "../js/progress-doc.js";
import { FAMILIES, parentEmailsForEmail } from "../js/profile.js";

let passed = 0;
const failures = [];

function check(label, actual, expected) {
  if (actual === expected) passed++;
  else failures.push(`${label}\n    expected: ${expected}\n    actual:   ${actual}`);
}

// ---- sharing rules ----
const dariusParents = parentEmailsForEmail("blagadariusmarcus@gmail.com");
check("child's report goes to both parents", dariusParents.length, 2);
check("  includes Flavius", dariusParents.includes("flaviusblaga@gmail.com"), true);
check("  includes Andrea", dariusParents.includes("andrea.bartha1@gmail.com"), true);
check("child's second address works too", parentEmailsForEmail("dariusmblaga@gmail.com").length, 2);

check("an ADULT publishes nothing", parentEmailsForEmail("flaviusblaga@gmail.com").length, 0);
check("a stranger publishes nothing", parentEmailsForEmail("random@gmail.com").length, 0);
check("an empty email publishes nothing", parentEmailsForEmail("").length, 0);

// A family that hasn't opted in must produce no recipients at all.
FAMILIES.push({
  id: "ionescu",
  name: "Familia Ionescu",
  driveReport: false,
  members: [
    { id: "ionescu-tata", name: "Tata", kind: "adult", emails: ["ionescu@gmail.com"] },
    { id: "ionescu-copil", name: "Copil", kind: "kid", emails: ["ionescu-copil@gmail.com"] },
  ],
});
check("driveReport:false publishes nothing", parentEmailsForEmail("ionescu-copil@gmail.com").length, 0);

// Another family that DID opt in must not leak into the first one's list.
FAMILIES.push({
  id: "popescu",
  name: "Familia Popescu",
  driveReport: true,
  members: [
    { id: "popescu-tata", name: "Tata", kind: "adult", emails: ["tata@gmail.com"] },
    { id: "popescu-copil", name: "Copil", kind: "kid", emails: ["copil1@gmail.com"] },
  ],
});
const popescuParents = parentEmailsForEmail("copil1@gmail.com");
check("other family gets only ITS parent", popescuParents.join(","), "tata@gmail.com");
check("  and never the Blaga parents", popescuParents.includes("flaviusblaga@gmail.com"), false);

// ---- report content ----
const state = {
  gamification: {
    points: 340,
    currentStreak: 5,
    longestStreak: 12,
    totalActiveDays: 23,
    lastPracticeDate: "2026-07-21",
    practiceDays: ["2026-07-19", "2026-07-20", "2026-07-21"],
  },
  progress: {
    sessionsCompleted: 17,
    recurringCorrections: ["confuză he/she", "uită -s la persoana a III-a"],
  },
  srs: {
    beginner: {
      cat: { level: 5 }, dog: { level: 4 }, house: { level: 2 }, book: { level: 0 },
    },
  },
};

const html = buildReportHtml({ state, memberName: "Darius", profileId: "kids-primar" });

check("report names the child", html.includes("Progres — Darius"), true);
check("report shows the level in Romanian", html.includes("Începător"), true);
check("report shows current streak", html.includes("<td>5</td>"), true);
check("report shows points", html.includes("<td>340</td>"), true);
check("report shows lessons completed", html.includes("<td>17</td>"), true);
check("counts 4 words seen", html.includes("<td>4</td>"), true);
check("counts 2 words mastered (level >= 4)", html.includes("<td>2</td>"), true);
check("lists what to work on", html.includes("confuză he/she"), true);
check("shows practice days, newest first", html.indexOf("21.07.2026") < html.indexOf("19.07.2026"), true);
check("states data is not stored elsewhere", html.includes("Nu este stocat pe niciun alt server"), true);

// A child's own text must never be able to break the document structure.
const nasty = buildReportHtml({
  state: { progress: { recurringCorrections: ["<script>alert(1)</script>"] } },
  memberName: "<b>Rareș</b>",
  profileId: "kids-primar",
});
check("escapes HTML in the name", nasty.includes("&lt;b&gt;Rareș&lt;/b&gt;"), true);
check("escapes HTML in corrections", nasty.includes("&lt;script&gt;"), true);
check("  and injects no live script tag", nasty.includes("<script>"), false);

// Missing fields are normal for a brand-new account — must not throw.
try {
  const empty = buildReportHtml({ state: {}, memberName: "Nou", profileId: "kids-primar" });
  check("empty state still renders", empty.includes("Progres — Nou"), true);
  check("  and says nothing recorded yet", empty.includes("Încă nicio zi înregistrată"), true);
} catch (err) {
  failures.push(`empty state threw: ${err.message}`);
}

console.log(`\n${passed} passed, ${failures.length} failed\n`);
for (const failure of failures) console.log(`FAIL: ${failure}\n`);
process.exit(failures.length ? 1 : 0);
