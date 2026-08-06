import { CONFIG } from "./config.js";
import { getAccessToken } from "./auth.js";

// The Worker derives WHO you are from this token and ignores any email in the
// request itself, so every call must carry it. `userEmail` is still accepted by
// the callers below for the one case the Worker cannot infer — asking about a
// specific child — but it is no longer what proves identity.
function authHeaders(extra) {
  const token = getAccessToken();
  if (!token) {
    const err = new Error("Sesiunea a expirat. Conectează-te din nou.");
    err.code = "no_session";
    throw err;
  }
  return { authorization: `Bearer ${token}`, ...(extra || {}) };
}

// Turns a non-OK response into an Error carrying the Worker's own error code,
// so callers can distinguish "signed out" from "not allowed" from a real fault.
async function failFrom(response) {
  let data = {};
  try {
    data = await response.json();
  } catch {
    /* non-JSON error body — fall back to the status code below */
  }
  const err = new Error(data.message || `Worker request failed: ${response.status}`);
  err.code = data.error || `http_${response.status}`;
  err.status = response.status;
  return err;
}

export async function sendChatMessage({ profileId, messages, conversationSummary, scenarioId, documentContext, lessonWordList, mascotPreference }) {
  const response = await fetch(`${CONFIG.WORKER_URL}/chat`, {
    method: "POST",
    headers: authHeaders({ "content-type": "application/json" }),
    body: JSON.stringify({
      profileId,
      messages,
      conversationSummary,
      scenarioId: scenarioId || null,
      documentContext: documentContext || null,
      lessonWordList: lessonWordList || null,
      // Which Socatei the child picked, so the Worker can guarantee that one
      // speaks — the reply is filtered by name in the browser.
      mascotPreference: mascotPreference || null,
    }),
  });
  if (!response.ok) throw await failFrom(response);
  return response.json();
}

export async function extractDocuments({ scenarioId, files }) {
  const response = await fetch(`${CONFIG.WORKER_URL}/chat`, {
    method: "POST",
    headers: authHeaders({ "content-type": "application/json" }),
    body: JSON.stringify({ mode: "extract_documents", scenarioId, files }),
  });
  if (!response.ok) throw await failFrom(response);
  return response.json();
}

export async function syncProgress({ profileId, displayName, gamification, progress, date, turns }) {
  const response = await fetch(`${CONFIG.WORKER_URL}/progress/sync`, {
    method: "POST",
    headers: authHeaders({ "content-type": "application/json" }),
    body: JSON.stringify({ profileId, displayName, gamification, progress, date, turns }),
  });
  if (!response.ok) throw await failFrom(response);
  return response.json();
}

// Full learning state stored on the Worker (KV) instead of Google Drive — used
// only for the owner's family, whose children sign in with Google Family Link
// accounts that Google blocks from granting the Drive scope. See drive.js
// usesServerState. The Worker also enforces the same family gate.
export async function fetchServerState(profileId) {
  const response = await fetch(
    `${CONFIG.WORKER_URL}/state?profileId=${encodeURIComponent(profileId)}`,
    { headers: authHeaders() }
  );
  if (!response.ok) throw await failFrom(response);
  return response.json(); // { found, state }
}

export async function saveServerState(profileId, state) {
  const response = await fetch(`${CONFIG.WORKER_URL}/state`, {
    method: "POST",
    headers: authHeaders({ "content-type": "application/json" }),
    body: JSON.stringify({ profileId, state }),
  });
  if (!response.ok) throw await failFrom(response);
  return response.json();
}

// The reward scheme this family agreed on. Readable by everyone in the family
// (the children's screens are built from it); only an adult may change it —
// enforced by the Worker, not here.
export async function fetchFamilyRewards() {
  const response = await fetch(`${CONFIG.WORKER_URL}/family/rewards`, { headers: authHeaders() });
  if (!response.ok) throw await failFrom(response);
  return response.json();
}

export async function saveFamilyRewards(rewards) {
  const response = await fetch(`${CONFIG.WORKER_URL}/family/rewards`, {
    method: "POST",
    headers: authHeaders({ "content-type": "application/json" }),
    body: JSON.stringify({ rewards }),
  });
  if (!response.ok) throw await failFrom(response);
  return response.json();
}

// The signed-in account's OWN family, from the combined registry (static +
// admin-added). Used to render the picker for families that live only in KV.
export async function fetchMyFamily() {
  const response = await fetch(`${CONFIG.WORKER_URL}/me/family`, { headers: authHeaders() });
  if (!response.ok) throw await failFrom(response);
  return response.json();
}

// --- Super-admin family management (Worker enforces the super-admin gate) ---
export async function adminListFamilies() {
  const response = await fetch(`${CONFIG.WORKER_URL}/admin/families`, { headers: authHeaders() });
  if (!response.ok) throw await failFrom(response);
  return response.json();
}

export async function adminSaveFamily(family) {
  const response = await fetch(`${CONFIG.WORKER_URL}/admin/families`, {
    method: "POST",
    headers: authHeaders({ "content-type": "application/json" }),
    body: JSON.stringify({ family }),
  });
  if (!response.ok) throw await failFrom(response);
  return response.json();
}

export async function adminDeleteFamily(id) {
  const response = await fetch(`${CONFIG.WORKER_URL}/admin/families?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!response.ok) throw await failFrom(response);
  return response.json();
}

// Lesson resets a parent has queued for the signed-in learner. The child's app
// calls this on load and applies each op once (see applyPendingResets).
export async function fetchPendingResets() {
  const response = await fetch(`${CONFIG.WORKER_URL}/me/resets`, { headers: authHeaders() });
  if (!response.ok) throw await failFrom(response);
  return response.json();
}

// A parent queues a reset for a child in their family. `all` wipes the whole
// module; otherwise `lessonIds` are the specific lessons to clear. The Worker
// verifies the caller is an adult in the child's family.
export async function adminResetLessons({ childEmail, profileId, all, lessonIds }) {
  const response = await fetch(`${CONFIG.WORKER_URL}/admin/reset`, {
    method: "POST",
    headers: authHeaders({ "content-type": "application/json" }),
    body: JSON.stringify({ childEmail, profileId, all: !!all, lessonIds: lessonIds || [] }),
  });
  if (!response.ok) throw await failFrom(response);
  return response.json();
}

// `userEmail` here is the CHILD being asked about, not the caller. The Worker
// checks that the signed-in adult is in the same family before answering.
export async function fetchChildProgress({ userEmail, profileId }) {
  const url = `${CONFIG.WORKER_URL}/progress?userEmail=${encodeURIComponent(userEmail)}&profileId=${encodeURIComponent(profileId)}`;
  const response = await fetch(url, { headers: authHeaders() });
  if (!response.ok) throw await failFrom(response);
  return response.json();
}
