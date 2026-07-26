// THE family registry — one file, used by both the browser and the Worker.
//
// It used to live twice: js/profile.js (what the picker draws) and
// worker/src/families.js (who is allowed in). Two copies of the same people
// meant every new family had to be typed twice, and a mismatch failed in a
// confusing way — tiles that lead nowhere, or an invisible family that the
// Worker happily serves. Now both import this.
//
// Splitting responsibility stays the same, and still matters:
//   • the BROWSER copy is not a security boundary. It ships to the client and
//     anyone with dev tools can edit it.
//   • worker/src/families.js re-derives every access decision from this data
//     against a Google-verified email, server-side, on every request.
// Same data, two very different levels of trust.
//
// ---------------------------------------------------------------------------
// ADDING A NEW FAMILY — the whole checklist
// ---------------------------------------------------------------------------
// 1. Copy the template at the bottom of FAMILIES and fill it in.
// 2. Add EVERY address as a Test user in Google Cloud Console
//    (OAuth consent screen → Audience → Test users). Without this they cannot
//    sign in at all, and the error Google shows does not explain why.
// 3. Send them PRIVACY-FAMILIES.md before switching anything on.
// 4. Rebuild the Worker bundle: node scripts/build-worker-bundle.mjs
// 5. Upload the frontend to GitHub, and paste the bundle into the Cloudflare
//    dashboard (Compute → english4me → Edit code → Deploy).
//
// Member ids must be unique across ALL families — they key the per-device
// placement and avatar memory. The original four keep their bare ids so
// existing installs do not lose their placement; new families use an
// "<family>-" prefix.

// What a family gets when it does not say otherwise. Parents can change their
// own family's numbers from inside the app (Worker-stored, see progress.js);
// this is only the starting point.
export const DEFAULT_REWARDS = {
  perLesson: { amount: 20, unit: "minute de tehnologie" },
  moduleBonus: { beginner: 50, intermediate: 100, advanced: 150, expert: 200, unit: "lei" },
};

export const FAMILIES = [
  {
    id: "blaga",
    name: "Familia Blaga",

    // Stores this family's practice transcripts in the app owner's Cloudflare
    // KV so their parents can read them in-app. Only ever true for a family
    // that has been told so in writing (PRIVACY-FAMILIES.md).
    progressMirror: true,

    // Publishes a progress report as a Google Doc in the CHILD's own Drive,
    // shared with this family's adults. Nothing reaches the app owner, which
    // is why this is the option to give families outside his household.
    driveReport: true,

    // Omitted → DEFAULT_REWARDS. Parents override this from the app.
    members: [
      { id: "flavius", name: "Flavius", emoji: "💼", kind: "adult", role: "admin",
        img: "assets/socatei/tata-sticker.png",
        profileId: "business-conversational", emails: ["flaviusblaga@gmail.com"] },
      { id: "andrea",  name: "Andrea",  emoji: "☕", kind: "adult", role: "admin",
        img: "assets/socatei/mama-sticker.png",
        profileId: "business-conversational", emails: ["andrea.bartha1@gmail.com"] },
      { id: "darius",  name: "Darius",  emoji: "🦫", kind: "kid",
        img: "assets/socatei/bobo-sticker.png",
        emails: ["blagadariusmarcus@gmail.com", "dariusmblaga@gmail.com"] },
      { id: "rares",   name: "Rareș",   emoji: "🐿️", kind: "kid",
        img: "assets/socatei/fizz-sticker.png",
        emails: ["blagararesoctavian@gmail.com", "raresoblaga@gmail.com"] },

      // Teen (14-18) demo tile so the section is testable now — a signed-in
      // adult can tap it to preview. Rename / set a real Google address (added
      // as a Test user) when an actual teen uses it, or delete it.
      { id: "teen-demo", name: "Teen", emoji: "🎓", kind: "teen",
        img: "assets/socatei/teen-boy-sticker.png",
        profileId: "teen", emails: ["REPLACE-with-teen@gmail.com"] },
    ],
  },

  // ---- TEMPLATE: copy this block, uncomment, fill in. -----------------------
  //
  // For a family outside the author's household the safe combination is
  // driveReport: true + progressMirror: false — their child's progress goes to
  // their own Google Drive and no transcript is ever stored by the app owner.
  //
  // `img` is only the STARTING picture. Everyone can change theirs from the
  // picker, so give the children different mascots just so the two tiles are
  // told apart on day one.
  //
  // `rewards` is optional — leave it out and the parents set their own from
  // inside the app. Fill it in only if they told you their scheme up front.
  //
  // {
  //   id: "popescu",
  //   name: "Familia Popescu",
  //   progressMirror: false,
  //   driveReport: true,
  //   rewards: {
  //     perLesson: { amount: 15, unit: "minute de joacă pe tabletă" },
  //     moduleBonus: { beginner: 30, intermediate: 60, advanced: 90, expert: 120, unit: "lei" },
  //   },
  //   members: [
  //     { id: "popescu-tata", name: "Tata", emoji: "💼", kind: "adult", role: "admin",
  //       img: "assets/socatei/tata-sticker.png",
  //       profileId: "business-conversational", emails: ["tata@gmail.com"] },
  //     { id: "popescu-mama", name: "Mama", emoji: "☕", kind: "adult", role: "admin",
  //       img: "assets/socatei/mama-sticker.png",
  //       profileId: "business-conversational", emails: ["mama@gmail.com"] },
  //     { id: "popescu-copil1", name: "Andrei", emoji: "🦫", kind: "kid",
  //       img: "assets/socatei/bobo-sticker.png", emails: ["copil1@gmail.com"] },
  //     { id: "popescu-copil2", name: "Maria", emoji: "🐱", kind: "kid",
  //       img: "assets/socatei/sushi-sticker.png", emails: ["copil2@gmail.com"] },
  //   ],
  // },
];

export function normEmail(email) {
  return String(email || "").trim().toLowerCase();
}

// Returns { family, member } for a known address, or null for anyone else.
// A null result must always mean "no access" — never a default membership.
export function lookupEmailIn(families, email) {
  const needle = normEmail(email);
  if (!needle) return null;
  for (const family of families) {
    for (const member of family.members) {
      if ((member.emails || []).some((e) => normEmail(e) === needle)) return { family, member };
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Admin: dynamically-added families (stored in the Worker's KV, managed from
// the in-app admin menu). The functions below are pure — they validate and
// shape a family, and the Worker is the ONLY place that persists/reads KV and
// enforces who may call them.
// ---------------------------------------------------------------------------

// The ONLY accounts that may open the admin menu and manage families. Checked
// server-side on every admin request against a Google-verified email.
export const SUPER_ADMIN_EMAILS = ["flaviusblaga@gmail.com", "andrea.bartha1@gmail.com"];

export function isSuperAdmin(email) {
  return SUPER_ADMIN_EMAILS.map((e) => e.toLowerCase()).includes(normEmail(email));
}

const KID_KINDS = ["adult", "teen", "kid"];
const PROFILE_BY_KIND = { adult: "business-conversational", teen: "teen" }; // kid → placement decides

function slugify(name) {
  return String(name || "")
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "") // strip diacritics
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32) || "familie";
}

function looksLikeEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || "").trim());
}

// Turns raw admin input into a clean family object, or returns an error. This
// is the security-critical gate: it rejects an email that already belongs to
// ANOTHER family, so a new family can never be used to reach an existing one's
// data. `existingFamilies` is the full registry EXCEPT the one being edited.
//
// input: { id?, name, progressMirror?, driveReport?, members: [{ kind, name?, emails: [] }] }
export function normalizeFamily(input, existingFamilies) {
  if (!input || typeof input !== "object") return { ok: false, error: "Date lipsă." };

  const name = String(input.name || "").trim().slice(0, 60);
  if (!name) return { ok: false, error: "Familia are nevoie de un nume." };

  // A stable id: keep the given one (edit), else derive a unique slug.
  const usedIds = new Set((existingFamilies || []).map((f) => f.id));
  let id = String(input.id || "").trim();
  if (!id) {
    const base = slugify(name);
    id = base;
    let n = 2;
    while (usedIds.has(id)) id = `${base}-${n++}`;
  }

  // Every email already claimed by another family — collision is forbidden.
  const taken = new Map(); // normEmail -> familyId
  for (const fam of existingFamilies || []) {
    for (const m of fam.members || []) {
      for (const e of m.emails || []) taken.set(normEmail(e), fam.id);
    }
  }

  const rawMembers = Array.isArray(input.members) ? input.members : [];
  const members = [];
  const seenInThisFamily = new Set();
  const counters = { adult: 0, teen: 0, kid: 0 };
  const defaultName = { adult: "Părinte", teen: "Adolescent", kid: "Copil" };

  for (const rm of rawMembers) {
    const kind = KID_KINDS.includes(rm && rm.kind) ? rm.kind : null;
    if (!kind) continue;

    const emails = [];
    for (const e of Array.isArray(rm.emails) ? rm.emails : []) {
      const ne = normEmail(e);
      if (!ne) continue;
      if (!looksLikeEmail(ne)) return { ok: false, error: `Adresă invalidă: ${e}` };
      if (taken.has(ne)) return { ok: false, error: `Adresa ${ne} e deja în familia „${taken.get(ne)}".` };
      if (seenInThisFamily.has(ne)) continue; // dedupe within the family
      seenInThisFamily.add(ne);
      emails.push(ne);
    }
    if (!emails.length) continue; // a member with no address is dropped

    counters[kind] += 1;
    const memberName = String(rm.name || "").trim().slice(0, 40) || `${defaultName[kind]} ${counters[kind]}`;
    const member = {
      id: `${id}-${kind}-${counters[kind]}`,
      name: memberName,
      kind,
      emails,
    };
    if (PROFILE_BY_KIND[kind]) member.profileId = PROFILE_BY_KIND[kind];
    if (kind === "adult") member.role = "admin";
    members.push(member);
  }

  if (!members.length) return { ok: false, error: "Adaugă cel puțin un membru cu o adresă de email." };

  return {
    ok: true,
    family: {
      id,
      name,
      progressMirror: input.progressMirror === true,
      driveReport: input.driveReport !== false, // default on for invited families
      members,
    },
  };
}

// A family's reward scheme, with every field defaulted so a partial override
// (a parent who set the per-lesson minutes but not the bonuses) can never
// produce `undefined` in the child's reward card.
export function rewardsFor(family, override) {
  const base = (family && family.rewards) || {};
  const src = override || {};
  const merged = {
    perLesson: { ...DEFAULT_REWARDS.perLesson, ...base.perLesson, ...src.perLesson },
    moduleBonus: { ...DEFAULT_REWARDS.moduleBonus, ...base.moduleBonus, ...src.moduleBonus },
  };
  // Amounts arrive from a form and from KV, so they are strings as often as
  // numbers; the reward card does arithmetic on them.
  merged.perLesson.amount = Number(merged.perLesson.amount) || 0;
  for (const tier of ["beginner", "intermediate", "advanced", "expert"]) {
    merged.moduleBonus[tier] = Number(merged.moduleBonus[tier]) || 0;
  }
  return merged;
}
