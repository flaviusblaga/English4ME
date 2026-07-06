// Client-side mirror of worker/src/prompts/scenarios.js IDs and display names
// only — no prompt text lives here, that's server-side. Keep this list's ids
// in sync with the worker's SCENARIOS map by hand (small, rarely-changing list).
export const SCENARIOS = [
  { id: "client-negotiation", label: "Client negotiation" },
  { id: "job-interview", label: "Job interview" },
  { id: "status-meeting", label: "Status meeting" },
  { id: "networking-smalltalk", label: "Networking small talk" },
  { id: "followup-call", label: "Follow-up call" },
];
