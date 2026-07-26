// Exercises the Worker's access rules directly. These are the checks standing
// between one family and another family's children, so they get asserted
// rather than eyeballed. The access functions are async now (they consult KV),
// so this drives them with an in-memory KV and adds the extra households via
// the same admin path the real app uses.
//
// Run: node scripts/test-family-access.mjs

import {
  isKnownEmail,
  lookupEmail,
  canReadProgressOf,
  progressMirrorEnabledFor,
  isSuperAdmin,
  upsertFamily,
} from "../worker/src/families.js";
import { verifyCaller, AuthError } from "../worker/src/auth.js";

let passed = 0;
const failures = [];

function check(label, actual, expected) {
  if (actual === expected) passed++;
  else failures.push(`${label}\n    expected: ${expected}\n    actual:   ${actual}`);
}

// In-memory KV so the admin-added families are real.
const store = {};
const env = { USAGE_KV: { get: async (k) => store[k] || null, put: async (k, v) => { store[k] = v; } } };

// A second household (mirror on) and a third (mirror off) — added the same way
// the admin menu adds them, so cross-family rules are tested against KV data.
await upsertFamily(env, {
  name: "Familia Popescu", progressMirror: true,
  members: [{ kind: "adult", emails: ["tata@gmail.com"] }, { kind: "kid", emails: ["copil1@gmail.com"] }],
});
await upsertFamily(env, {
  name: "Familia Ionescu", progressMirror: false,
  members: [{ kind: "adult", emails: ["ionescu@gmail.com"] }, { kind: "kid", emails: ["ionescu-copil@gmail.com"] }],
});

// ---- enrolment (static + KV) ----
check("known adult is enrolled", await isKnownEmail(env, "flaviusblaga@gmail.com"), true);
check("known kid is enrolled", await isKnownEmail(env, "blagadariusmarcus@gmail.com"), true);
check("KV-added adult is enrolled", await isKnownEmail(env, "tata@gmail.com"), true);
check("stranger is NOT enrolled", await isKnownEmail(env, "random@gmail.com"), false);
check("empty email is NOT enrolled", await isKnownEmail(env, ""), false);
check("null email is NOT enrolled", await isKnownEmail(env, null), false);
check("lookup is case/space insensitive", !!(await lookupEmail(env, "  FlaviusBlaga@Gmail.com ")), true);

// ---- the core isolation guarantee ----
check("parent reads own child", await canReadProgressOf(env, "flaviusblaga@gmail.com", "blagadariusmarcus@gmail.com"), true);
check("other parent in same family reads child", await canReadProgressOf(env, "andrea.bartha1@gmail.com", "raresoblaga@gmail.com"), true);
check("OTHER family's parent CANNOT read Darius", await canReadProgressOf(env, "tata@gmail.com", "blagadariusmarcus@gmail.com"), false);
check("Flavius CANNOT read another family's child", await canReadProgressOf(env, "flaviusblaga@gmail.com", "copil1@gmail.com"), false);
check("KV parent reads own KV child (mirror on)", await canReadProgressOf(env, "tata@gmail.com", "copil1@gmail.com"), true);
check("stranger CANNOT read anything", await canReadProgressOf(env, "random@gmail.com", "blagadariusmarcus@gmail.com"), false);
check("CANNOT read a stranger's record either", await canReadProgressOf(env, "flaviusblaga@gmail.com", "random@gmail.com"), false);

// ---- kids are not admins of each other ----
check("kid CANNOT read sibling", await canReadProgressOf(env, "blagadariusmarcus@gmail.com", "raresoblaga@gmail.com"), false);
check("kid CAN read self", await canReadProgressOf(env, "blagadariusmarcus@gmail.com", "blagadariusmarcus@gmail.com"), true);
check("kid CANNOT read a parent", await canReadProgressOf(env, "blagadariusmarcus@gmail.com", "flaviusblaga@gmail.com"), false);

// ---- opting out of the mirror ----
check("mirror-off family: parent cannot read child", await canReadProgressOf(env, "ionescu@gmail.com", "ionescu-copil@gmail.com"), false);
check("mirror-off family: nothing is stored", await progressMirrorEnabledFor(env, "ionescu-copil@gmail.com"), false);
check("mirror-on family: storage allowed", await progressMirrorEnabledFor(env, "blagadariusmarcus@gmail.com"), true);
check("stranger: nothing is stored", await progressMirrorEnabledFor(env, "random@gmail.com"), false);

// ---- super-admin gate ----
check("Flavius is super-admin", isSuperAdmin("flaviusblaga@gmail.com"), true);
check("Andrea is super-admin", isSuperAdmin("andrea.bartha1@gmail.com"), true);
check("a KV parent is NOT super-admin", isSuperAdmin("tata@gmail.com"), false);
check("a stranger is NOT super-admin", isSuperAdmin("random@gmail.com"), false);

// ---- token handling ----
const noHeader = new Request("https://example.com/chat");
const badScheme = new Request("https://example.com/chat", { headers: { authorization: "Basic abc" } });

async function expectAuthError(label, request) {
  try {
    await verifyCaller(request);
    failures.push(`${label}\n    expected: AuthError\n    actual:   resolved`);
  } catch (err) {
    check(label, err instanceof AuthError, true);
  }
}

await expectAuthError("request with no Authorization header is rejected", noHeader);
await expectAuthError("non-Bearer Authorization is rejected", badScheme);

// ---- report ----
console.log(`\n${passed} passed, ${failures.length} failed\n`);
for (const failure of failures) console.log(`FAIL: ${failure}\n`);
process.exit(failures.length ? 1 : 0);
