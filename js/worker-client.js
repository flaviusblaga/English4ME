import { CONFIG } from "./config.js";

export async function sendChatMessage({ userEmail, profileId, messages, conversationSummary, scenarioId }) {
  const response = await fetch(`${CONFIG.WORKER_URL}/chat`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ userEmail, profileId, messages, conversationSummary, scenarioId: scenarioId || null }),
  });
  if (!response.ok) {
    throw new Error(`Worker request failed: ${response.status}`);
  }
  return response.json();
}
