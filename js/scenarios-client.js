// Client-side mirror of worker/src/prompts/scenarios.js IDs and display names
// only — no prompt text lives here, that's server-side. Keep this list's ids
// in sync with the worker's SCENARIOS map by hand (small, rarely-changing list).
//
// `category` groups the scenarios in the Practice picker (optgroups) around the
// real professional moments a Peers member needs English for. Adding a NEW
// scenario needs a matching prompt in the Cloudflare Worker + redeploy; adding a
// category here only regroups the existing ones.
export const SCENARIOS = [
  { id: "networking-smalltalk", label: "Networking small talk", category: "Networking & intros" },
  { id: "followup-call", label: "Follow-up call", category: "Networking & intros" },
  { id: "status-meeting", label: "Status meeting", category: "Meetings & leadership" },
  { id: "client-negotiation", label: "Client negotiation", category: "Negotiation" },
  { id: "job-interview", label: "Job interview", category: "Hiring & interviews" },
];
