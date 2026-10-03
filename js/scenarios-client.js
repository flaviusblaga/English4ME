// Client-side mirror of the Worker's scenario IDs + display names only — no
// prompt text lives here, that's server-side (worker/src/prompts/scenarios.js).
//
// `category` groups the scenarios in the Practice picker (optgroups) around the
// real professional moments a Peers member needs English for: networking,
// meetings & leadership, negotiation, pitching, hiring, and difficult
// conversations.
//
// IMPORTANT — adding a NEW scenario here only adds it to the picker. For it to
// actually role-play, the Cloudflare Worker needs a matching prompt under the
// SAME id, then a redeploy. The ready-to-paste prompts for every id below live
// in docs/worker-scenarios-pack.md. Ids marked "live" already have a Worker
// prompt; the rest need the pack applied before they behave in character.
export const SCENARIOS = [
  // ---- Networking & intros ----
  { id: "networking-smalltalk", label: "Networking small talk", category: "Networking & intros" }, // live
  { id: "self-intro", label: "Self-introduction (“about me”)", category: "Networking & intros" },
  { id: "warm-intro", label: "Warm introduction", category: "Networking & intros" },
  { id: "followup-call", label: "Follow-up call", category: "Networking & intros" }, // live

  // ---- Meetings & leadership ----
  { id: "status-meeting", label: "Status meeting", category: "Meetings & leadership" }, // live
  { id: "lead-meeting", label: "Lead a meeting", category: "Meetings & leadership" },
  { id: "update-leadership", label: "Update to leadership", category: "Meetings & leadership" },
  { id: "diplomatic-disagreement", label: "Diplomatic disagreement", category: "Meetings & leadership" },

  // ---- Negotiation ----
  { id: "client-negotiation", label: "Client negotiation", category: "Negotiation" }, // live
  { id: "supplier-negotiation", label: "Supplier negotiation", category: "Negotiation" },
  { id: "salary-negotiation", label: "Salary / rate negotiation", category: "Negotiation" },

  // ---- Pitch & presentation ----
  { id: "pitch-leadership", label: "Pitch to leadership", category: "Pitch & presentation" },
  { id: "pitch-project", label: "Project pitch", category: "Pitch & presentation" },
  { id: "demo-qa", label: "Demo + Q&A", category: "Pitch & presentation" },

  // ---- Hiring & interviews (both sides) ----
  { id: "job-interview", label: "Job interview — you're the candidate", category: "Hiring & interviews" }, // live
  { id: "interview-interviewer", label: "Job interview — you're the interviewer", category: "Hiring & interviews" },

  // ---- Difficult conversations ----
  { id: "give-feedback", label: "Giving feedback", category: "Difficult conversations" },
  { id: "saying-no", label: "Saying no", category: "Difficult conversations" },
  { id: "escalation", label: "Escalating an issue", category: "Difficult conversations" },
];
