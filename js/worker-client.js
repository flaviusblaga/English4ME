import { CONFIG } from "./config.js";

export async function sendChatMessage({ userEmail, profileId, messages, conversationSummary, scenarioId, documentContext }) {
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
