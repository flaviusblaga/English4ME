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

// `userEmail` here is the CHILD being asked about, not the caller. The Worker
// checks that the signed-in adult is in the same family before answering.
export async function fetchChildProgress({ userEmail, profileId }) {
  const url = `${CONFIG.WORKER_URL}/progress?userEmail=${encodeURIComponent(userEmail)}&profileId=${encodeURIComponent(profileId)}`;
  const response = await fetch(url, { headers: authHeaders() });
  if (!response.ok) throw await failFrom(response);
  return response.json();
}
