// Phrasebank — a coaching resource, not a copy-list. Each phrase carries the
// SITUATION it fits ("context") and its tone ("register": formal / neutral /
// direct), so a member learns WHEN and HOW to use it — not just the words.
// The adult chat renders these as cards with Hear (TTS), Copy and Use-in-chat.
//
// Audience: a mid-level manager (the Peers crowd). Keep each phrase natural and
// genuinely reusable; keep each context to a short "when you…" line.
export const PHRASEBANK = [
  {
    category: "Email — openings",
    icon: "📧",
    phrases: [
      { text: "Flagging this early so it doesn't catch us off guard later.", context: "Raising a risk before it grows", register: "neutral" },
      { text: "Quick heads-up before this goes wider.", context: "A private early warning", register: "neutral" },
      { text: "Circling back on the point we left open last week.", context: "Reopening an unresolved item", register: "neutral" },
      { text: "Following up on the actions from Tuesday's call.", context: "Chasing agreed next steps", register: "neutral" },
      { text: "For visibility — looping in the wider team here.", context: "Adding people so they're informed", register: "formal" },
      { text: "Ahead of the review, here's where we landed.", context: "Prepping someone before a meeting", register: "formal" },
      { text: "Keeping this short — one decision and one ask.", context: "Respecting a busy reader's time", register: "direct" },
    ],
  },
  {
    category: "Email — closings",
    icon: "✉️",
    phrases: [
      { text: "Happy to walk through the detail live if that's easier.", context: "Offering a call over a long thread", register: "neutral" },
      { text: "Let me know if you'd like me to take this forward.", context: "Offering to own the next step", register: "neutral" },
      { text: "I'll assume we're aligned unless I hear otherwise by Friday.", context: "A soft deadline to unblock yourself", register: "direct" },
      { text: "Shout if anything here needs adjusting.", context: "Inviting quick feedback, casually", register: "direct" },
      { text: "Appreciate you turning this around quickly.", context: "Thanking someone for fast help", register: "neutral" },
      { text: "Let's keep the momentum on this.", context: "Encouraging continued pace", register: "neutral" },
    ],
  },
  {
    category: "Leading meetings",
    icon: "🗓️",
    phrases: [
      { text: "Let's timebox this so we stay on track.", context: "Keeping a discussion from overrunning", register: "neutral" },
      { text: "I want us to leave with a clear decision on this.", context: "Setting the meeting's goal upfront", register: "formal" },
      { text: "Let's park that and pick it up offline.", context: "Deferring an off-topic point", register: "neutral" },
      { text: "Can we agree owners and dates before we close?", context: "Locking accountability at the end", register: "formal" },
      { text: "Let me play that back to make sure we're aligned.", context: "Confirming shared understanding", register: "neutral" },
      { text: "In the interest of time, let's take the detail offline.", context: "Cutting a deep-dive short, politely", register: "formal" },
      { text: "What would need to be true for us to say yes to this?", context: "Unblocking a stalled decision", register: "neutral" },
    ],
  },
  {
    category: "Influencing & alignment",
    icon: "🧭",
    phrases: [
      { text: "Help me understand the thinking behind that.", context: "Probing a view without challenging it", register: "neutral" },
      { text: "Where I'm coming from is this —", context: "Framing your own perspective", register: "neutral" },
      { text: "If we zoom out, the bigger question is —", context: "Reframing to the strategic level", register: "formal" },
      { text: "What's the one thing that would move the needle here?", context: "Focusing on the highest impact", register: "neutral" },
      { text: "I'd frame it slightly differently —", context: "Offering a softer reframe", register: "neutral" },
      { text: "Let's pressure-test that assumption.", context: "Challenging an idea constructively", register: "neutral" },
      { text: "What's the trade-off if we go this way?", context: "Surfacing the cost of a choice", register: "neutral" },
    ],
  },
  {
    category: "Disagreeing & pushing back",
    icon: "✋",
    phrases: [
      { text: "I see it differently, and here's why.", context: "Disagreeing while staying collaborative", register: "neutral" },
      { text: "I'd push back on that — the risk is —", context: "Flagging a concern directly", register: "direct" },
      { text: "I'm not comfortable committing to that timeline yet.", context: "Declining an unrealistic deadline", register: "direct" },
      { text: "Before we lock this in, I'd want to stress-test —", context: "Slowing a rushed decision", register: "neutral" },
      { text: "That's a fair ask, but it comes at the cost of —", context: "Agreeing in part, naming the cost", register: "neutral" },
      { text: "Let's not over-index on a single data point.", context: "Cautioning against a hasty read", register: "neutral" },
      { text: "I hear you, but I don't think that's the right call here.", context: "Disagreeing firmly but respectfully", register: "direct" },
    ],
  },
  {
    category: "Negotiating",
    icon: "🤝",
    phrases: [
      { text: "Help me understand what's driving that number.", context: "Unpacking the other side's position", register: "neutral" },
      { text: "If I can move on this, can you move on that?", context: "Trading a concession", register: "neutral" },
      { text: "That's outside what we can commit to — but here's what we can do.", context: "Declining, then offering an alternative", register: "formal" },
      { text: "Let's find a landing zone that works for both sides.", context: "Steering toward a win-win", register: "neutral" },
      { text: "I can be flexible on timing, less so on scope.", context: "Signalling where you'll bend", register: "direct" },
      { text: "What would make this a clear yes for you?", context: "Finding the path to agreement", register: "neutral" },
      { text: "Let me take this back and come back with options.", context: "Buying time without saying no", register: "neutral" },
    ],
  },
  {
    category: "Clarifying & summarizing",
    icon: "🔍",
    phrases: [
      { text: "Just to make sure I've understood the ask —", context: "Confirming a request before acting", register: "neutral" },
      { text: "What does 'done' look like here?", context: "Pinning down the expected outcome", register: "direct" },
      { text: "So the decision is X, owned by Y, by Z — is that right?", context: "Closing the loop on a decision", register: "formal" },
      { text: "Can you give me the one-line version?", context: "Asking for the headline", register: "direct" },
      { text: "If we can't do all three, what's the priority?", context: "Forcing a prioritisation", register: "neutral" },
      { text: "Let me summarize where we landed.", context: "Wrapping up a discussion", register: "neutral" },
    ],
  },
  {
    category: "Managing up (updates to leadership)",
    icon: "📈",
    phrases: [
      { text: "Headline: we're on track, with one risk to flag.", context: "Opening an update to a busy exec", register: "formal" },
      { text: "Here's where we are, what's next, and what I need from you.", context: "Structuring a crisp status", register: "formal" },
      { text: "The one decision I need from you today is —", context: "Making a clear ask of a leader", register: "direct" },
      { text: "No action needed — just keeping you in the loop.", context: "Informing without adding work", register: "neutral" },
      { text: "The risk is X; my recommendation is Y.", context: "Pairing a problem with a solution", register: "formal" },
      { text: "We're green on delivery, amber on budget.", context: "A quick red-amber-green status", register: "formal" },
    ],
  },
  {
    category: "Delegating & feedback",
    icon: "👥",
    phrases: [
      { text: "I'd like you to own this end to end.", context: "Handing over full responsibility", register: "direct" },
      { text: "What support do you need from me to get there?", context: "Offering help when delegating", register: "neutral" },
      { text: "Here's the outcome I'm after — the how is yours.", context: "Delegating the outcome, not the method", register: "neutral" },
      { text: "One thing I'd do differently next time —", context: "Giving gentle corrective feedback", register: "neutral" },
      { text: "You handled that well; here's where to push further.", context: "Praising, then stretching", register: "neutral" },
      { text: "Let's make this a development goal for the quarter.", context: "Turning feedback into a plan", register: "formal" },
    ],
  },
  {
    category: "Follow-ups & commitments",
    icon: "✅",
    phrases: [
      { text: "To recap what we agreed —", context: "Confirming commitments in writing", register: "neutral" },
      { text: "I'll own this and come back to you by Thursday.", context: "Making a dated commitment", register: "neutral" },
      { text: "Who's the single owner on this?", context: "Assigning clear accountability", register: "direct" },
      { text: "Let's put a date on it so it doesn't slip.", context: "Stopping a task from drifting", register: "neutral" },
      { text: "I'll send a short summary and the next steps.", context: "Closing a meeting with actions", register: "neutral" },
      { text: "Let's set a checkpoint for mid-week.", context: "Scheduling a progress check", register: "neutral" },
    ],
  },
  {
    category: "Networking & intros",
    icon: "🙌",
    phrases: [
      { text: "What's keeping you busy at the moment?", context: "Opening friendly small talk", register: "neutral" },
      { text: "How did you get into this space?", context: "Starting a genuine conversation", register: "neutral" },
      { text: "I'd love to compare notes sometime.", context: "Suggesting a future chat", register: "neutral" },
      { text: "Can I make an introduction that might be useful?", context: "Offering a helpful connection", register: "neutral" },
      { text: "Let's stay in touch — I'll follow up afterwards.", context: "Closing a networking chat", register: "neutral" },
      { text: "Who's a good person for me to know in this area?", context: "Asking for a referral", register: "neutral" },
    ],
  },
];
