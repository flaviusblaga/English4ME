import { CONFIG } from "./config.js";

export async function sendChatMessage({ userEmail, profileId, messages, conversationSummary, scenarioId, documentContext, lessonWordList }) {
  const response = await fetch(`${CONFIG.WORKER_URL}/chat`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      userEmail,
      profileId,
      messages,
      conversationSummary,
      scenarioId: scenarioId || null,
      documentContext: documentContext || null,
      lessonWordList: lessonWordList || null,
    }),
  });
  if (!response.ok) {
    throw new Error(`Worker request failed: ${response.status}`);
  }
  return response.json();
}

export async function extractDocuments({ userEmail, scenarioId, files }) {
  const response = await fetch(`${CONFIG.WORKER_URL}/chat`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ mode: "extract_documents", userEmail, scenarioId, files }),
  });
  const data = await response.json();
  if (!response.ok) {
    const err = new Error(data.message || `Worker request failed: ${response.status}`);
    err.code = data.error;
    throw err;
  }
  return data;
}

export async function syncProgress({ userEmail, profileId, displayName, gamification, progress, date, turns }) {
  const response = await fetch(`${CONFIG.WORKER_URL}/progress/sync`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ userEmail, profileId, displayName, gamification, progress, date, turns }),
  });
  if (!response.ok) {
    throw new Error(`Progress sync failed: ${response.status}`);
  }
  return response.json();
}

export async function fetchChildProgress({ userEmail, profileId }) {
  const url = `${CONFIG.WORKER_URL}/progress?userEmail=${encodeURIComponent(userEmail)}&profileId=${encodeURIComponent(profileId)}`;
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok) {
    const err = new Error(data.message || `Progress fetch failed: ${response.status}`);
    err.code = data.error;
    throw err;
  }
  return data;
}
