// Exercises the Worker's access rules directly. These are the checks standing
// between one family and another family's children, so they get asserted
// rather than eyeballed.
//
// Run: node scripts/test-family-access.mjs

import { FAMILIES, lookupEmail, isKnownEmail, canReadProgressOf, progressMirrorEnabledFor }
  from "../worker/src/families.js";
import { verifyCaller, AuthError } from "../worker/src/auth.js";

let passed = 0;
const failures = [];

function check(label, actual, expected) {
  if (actual === expected) {
    passed++;
  } else {
    failures.push(`${label}\n    expected: ${expected}\n    actual:   ${actual}`);
  }
}

// A second household, so cross-family rules are tested against something real
// instead of only the single family that ships today.
FAMILIES.push({
  id: "popescu",
  name: "Familia Popescu",
  progressMirror: true,
  members: [
    { id: "popescu-tata", kind: "adult", emails: ["tata@gmail.com"] },
    { id: "popescu-copil1", kind: "kid", emails: ["copil1@gmail.com"] },
  ],
});
// A household that declined the progress mirror.
FAMILIES.push({
  id: "ionescu",
  name: "Familia Ionescu",
  progressMirror: false,
  members: [
    { id: "ionescu-tata", kind: "adult", emails: ["ionescu@gmail.com"] },
    { id: "ionescu-copil", kind: "kid", emails: ["ionescu-copil@gmail.com"] },
  ],
});

// ---- enrolment ----
check("known adult is enrolled", isKnownEmail("flaviusblaga@gmail.com"), true);
check("known kid is enrolled", isKnownEmail("blagadariusmarcus@gmail.com"), true);
check("stranger is NOT enrolled", isKnownEmail("random@gmail.com"), false);
check("empty email is NOT enrolled", isKnownEmail(""), false);
check("null email is NOT enrolled", isKnownEmail(null), false);
check("lookup is case/space insensitive", !!lookupEmail("  FlaviusBlaga@Gmail.com "), true);

// ---- the core isolation guarantee ----
check("parent reads own child", canReadProgressOf("flaviusblaga@gmail.com", "blagadariusmarcus@gmail.com"), true);
check("other parent in same family reads child", canReadProgressOf("andrea.bartha1@gmail.com", "raresoblaga@gmail.com"), true);
check("OTHER family's parent CANNOT read Darius", canReadProgressOf("tata@gmail.com", "blagadariusmarcus@gmail.com"), false);
check("Flavius CANNOT read another family's child", canReadProgressOf("flaviusblaga@gmail.com", "copil1@gmail.com"), false);
check("stranger CANNOT read anything", canReadProgressOf("random@gmail.com", "blagadariusmarcus@gmail.com"), false);
check("CANNOT read a stranger's record either", canReadProgressOf("flaviusblaga@gmail.com", "random@gmail.com"), false);

// ---- kids are not admins of each other ----
check("kid CANNOT read sibling", canReadProgressOf("blagadariusmarcus@gmail.com", "raresoblaga@gmail.com"), false);
check("kid CAN read self", canReadProgressOf("blagadariusmarcus@gmail.com", "blagadariusmarcus@gmail.com"), true);
check("kid CANNOT read a parent", canReadProgressOf("blagadariusmarcus@gmail.com", "flaviusblaga@gmail.com"), false);

// ---- opting out of the mirror ----
check("mirror-off family: parent cannot read child", canReadProgressOf("ionescu@gmail.com", "ionescu-copil@gmail.com"), false);
check("mirror-off family: nothing is stored", progressMirrorEnabledFor("ionescu-copil@gmail.com"), false);
check("mirror-on family: storage allowed", progressMirrorEnabledFor("blagadariusmarcus@gmail.com"), true);
check("stranger: nothing is stored", progressMirrorEnabledFor("random@gmail.com"), false);

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
