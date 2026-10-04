// Mini-lessons — a short, structured brief shown when a member picks a scenario,
// BEFORE the role-play starts. Each one teaches the moment, not just the words:
//   • goal    — what you're learning to do, in one line
//   • phrases — 4 ready-to-use lines, each with its tone (register)
//   • tip     — the one thing that makes this situation work (a do / don't)
//   • warmup  — a tiny task to prime the member before they dive in
//
// Audience: a mid-level manager (the Peers crowd). Content is static and
// client-side on purpose — it works offline, costs no API call, and is easy to
// edit here. Keyed by the scenario ids in js/scenarios-client.js; every id there
// should have an entry. A missing entry just falls back to the plain "Starting…"
// notice, so adding scenarios never breaks.
//
// register: "formal" | "neutral" | "direct" (same vocabulary as the Phrasebank).
export const SCENARIO_LESSONS = {
  // ---- Networking & intros ----
  "networking-smalltalk": {
    goal: "Start a natural conversation with someone new and keep it flowing.",
    phrases: [
      { text: "What's keeping you busy at the moment?", register: "neutral" },
      { text: "How did you get into this space?", register: "neutral" },
      { text: "I'd love to compare notes sometime.", register: "neutral" },
      { text: "Let's stay in touch — I'll follow up afterwards.", register: "neutral" },
    ],
    tip: "Ask open questions and actually listen — small talk builds rapport, it isn't a performance. Swap yes/no questions for “how” and “what”.",
    warmup: "Write one open question you could ask a stranger at an event.",
  },
  "self-intro": {
    goal: "Introduce yourself in 20 seconds so people remember what you do and why it matters.",
    phrases: [
      { text: "I help [who] do [what] so they can [outcome].", register: "neutral" },
      { text: "I'm with [company], where I lead [area].", register: "formal" },
      { text: "Lately I've been focused on [current priority].", register: "neutral" },
      { text: "The short version is —", register: "direct" },
    ],
    tip: "Lead with the value you create, not your job title. One sentence on who you help beats a list of responsibilities.",
    warmup: "Write your one-sentence intro: “I help ___ do ___.”",
  },
  "warm-intro": {
    goal: "Connect two people clearly so both see why the intro is worth their time.",
    phrases: [
      { text: "I thought you two should know each other because —", register: "neutral" },
      { text: "You're both working on [shared theme].", register: "neutral" },
      { text: "I'll let you take it from here.", register: "direct" },
      { text: "No obligation — just thought it could be useful.", register: "neutral" },
    ],
    tip: "Say WHY you're connecting them in one line. A warm intro without a reason is just extra email.",
    warmup: "Write the one-line reason you'd connect two people you know.",
  },
  "followup-call": {
    goal: "Reconnect after a first meeting and move things one concrete step forward.",
    phrases: [
      { text: "Thanks again for the time last week.", register: "neutral" },
      { text: "I wanted to pick up where we left off.", register: "neutral" },
      { text: "What would be a useful next step from here?", register: "neutral" },
      { text: "Shall I put something on the calendar?", register: "direct" },
    ],
    tip: "Open with a specific callback to your last conversation, then propose ONE next step. Don't leave it open-ended.",
    warmup: "Write a one-line opener referencing a detail from a real past meeting.",
  },

  // ---- Meetings & leadership ----
  "status-meeting": {
    goal: "Give a clear, confident update and surface risks without rambling.",
    phrases: [
      { text: "Headline: we're on track, with one risk to flag.", register: "formal" },
      { text: "Here's where we are, what's next, and what I need.", register: "formal" },
      { text: "We're green on delivery, amber on budget.", register: "formal" },
      { text: "No action needed — just keeping you in the loop.", register: "neutral" },
    ],
    tip: "Lead with the headline, then the detail. Say what you need from the room before you run out of time.",
    warmup: "Write the one-line headline of your current project status.",
  },
  "lead-meeting": {
    goal: "Run a meeting that starts with a goal and ends with decisions and owners.",
    phrases: [
      { text: "I want us to leave with a clear decision on this.", register: "formal" },
      { text: "Let's timebox this so we stay on track.", register: "neutral" },
      { text: "Let's park that and pick it up offline.", register: "neutral" },
      { text: "Can we agree owners and dates before we close?", register: "formal" },
    ],
    tip: "State the goal in the first minute and lock owners + dates in the last. The middle takes care of itself.",
    warmup: "Write the one-sentence goal you'd open your next meeting with.",
  },
  "update-leadership": {
    goal: "Brief a busy executive: the ask, the risk, your recommendation — fast.",
    phrases: [
      { text: "The one decision I need from you today is —", register: "direct" },
      { text: "The risk is X; my recommendation is Y.", register: "formal" },
      { text: "Here's where we are, what's next, and what I need from you.", register: "formal" },
      { text: "Happy to go deeper on any of this.", register: "neutral" },
    ],
    tip: "Executives want the recommendation, not the analysis. Pair every problem with a proposed answer.",
    warmup: "Write the single decision you'd ask a leader for, in one sentence.",
  },
  "diplomatic-disagreement": {
    goal: "Disagree in a meeting without creating friction or backing down.",
    phrases: [
      { text: "I see it differently, and here's why.", register: "neutral" },
      { text: "Help me understand the thinking behind that.", register: "neutral" },
      { text: "I'd frame it slightly differently —", register: "neutral" },
      { text: "Let's pressure-test that assumption.", register: "neutral" },
    ],
    tip: "Acknowledge the other view first, then state yours. Challenge the idea, never the person.",
    warmup: "Write a polite opener for disagreeing with your manager.",
  },

  // ---- Negotiation ----
  "client-negotiation": {
    goal: "Protect value while keeping the client relationship warm.",
    phrases: [
      { text: "Help me understand what's driving that number.", register: "neutral" },
      { text: "If I can move on this, can you move on that?", register: "neutral" },
      { text: "That's outside what we can commit to — but here's what we can do.", register: "formal" },
      { text: "Let's find a landing zone that works for both sides.", register: "neutral" },
    ],
    tip: "Never give a concession without getting one. Trade, don't donate.",
    warmup: "Write one thing you'd be willing to trade, and one you wouldn't.",
  },
  "supplier-negotiation": {
    goal: "Get better terms from a supplier without burning the partnership.",
    phrases: [
      { text: "What flexibility do you have on price or timing?", register: "neutral" },
      { text: "If we commit to volume, what can you do on rate?", register: "neutral" },
      { text: "I need this to work on both sides to sign off.", register: "direct" },
      { text: "Let me take this back and come back with options.", register: "neutral" },
    ],
    tip: "Anchor on the whole relationship, not a single line item. Volume and commitment are your levers.",
    warmup: "Write the one concession you'd ask a supplier for first.",
  },
  "salary-negotiation": {
    goal: "Make the case for your number calmly and back it with value.",
    phrases: [
      { text: "Based on the scope and my impact, I'm looking for —", register: "direct" },
      { text: "Help me understand how the range was set.", register: "neutral" },
      { text: "I'd like us to find a number that reflects the value I bring.", register: "neutral" },
      { text: "Can we revisit this at the next review with clear targets?", register: "neutral" },
    ],
    tip: "State your number, then stop talking. The silence after the ask is your strongest tool.",
    warmup: "Write your ask in one sentence, with the reason attached.",
  },

  // ---- Pitch & presentation ----
  "pitch-leadership": {
    goal: "Win a yes from decision-makers with a tight, outcome-led pitch.",
    phrases: [
      { text: "The opportunity is X; the ask is Y.", register: "formal" },
      { text: "If we do nothing, here's the cost.", register: "direct" },
      { text: "What would need to be true for you to say yes?", register: "neutral" },
      { text: "I can keep this to three minutes.", register: "neutral" },
    ],
    tip: "Open with the outcome, not the background. Lead with why it matters to them, not how it works.",
    warmup: "Write your pitch's first sentence — the outcome, not the setup.",
  },
  "pitch-project": {
    goal: "Sell a project idea: the problem, your solution, and why now.",
    phrases: [
      { text: "The problem we're solving is —", register: "neutral" },
      { text: "Here's what we'd do, and what it unlocks.", register: "neutral" },
      { text: "The reason to do this now is —", register: "direct" },
      { text: "What's the one concern I should address?", register: "neutral" },
    ],
    tip: "Problem first, solution second. If the problem doesn't land, the solution won't either.",
    warmup: "Write the problem your project solves in one plain sentence.",
  },
  "demo-qa": {
    goal: "Show your work clearly and handle tough questions with composure.",
    phrases: [
      { text: "Let me show you the part that matters most.", register: "neutral" },
      { text: "Great question — the short answer is —", register: "neutral" },
      { text: "I don't have that to hand; I'll follow up today.", register: "direct" },
      { text: "Let me play that back to make sure I've got it.", register: "neutral" },
    ],
    tip: "Narrate the “why” as you click, not just the “what”. For a question you can't answer, commit to a follow-up — don't bluff.",
    warmup: "Write how you'd handle “I don't know” gracefully in a demo.",
  },

  // ---- Hiring & interviews ----
  "job-interview": {
    goal: "Tell your story with evidence and show you fit the role.",
    phrases: [
      { text: "A good example of that is —", register: "neutral" },
      { text: "What I'd bring to this role is —", register: "neutral" },
      { text: "The result was —", register: "direct" },
      { text: "What does success look like in the first 90 days?", register: "neutral" },
    ],
    tip: "Answer with stories, not adjectives. Use situation → action → result, and always land the result.",
    warmup: "Write a one-line result from a project you're proud of.",
  },
  "interview-interviewer": {
    goal: "Assess a candidate fairly with questions that reveal how they think.",
    phrases: [
      { text: "Walk me through how you approached that.", register: "neutral" },
      { text: "What would you do differently next time?", register: "neutral" },
      { text: "Tell me about a time it didn't go to plan.", register: "neutral" },
      { text: "What questions do you have for us?", register: "neutral" },
    ],
    tip: "Ask for specifics, then probe the reasoning. Past behaviour predicts more than hypotheticals.",
    warmup: "Write one behavioural question you'd open an interview with.",
  },

  // ---- Difficult conversations ----
  "give-feedback": {
    goal: "Deliver honest feedback that lands and leads to change.",
    phrases: [
      { text: "Can I share some feedback on that?", register: "neutral" },
      { text: "Here's what I observed, and the impact it had.", register: "neutral" },
      { text: "One thing I'd do differently next time —", register: "neutral" },
      { text: "What support would help you get there?", register: "neutral" },
    ],
    tip: "Describe the behaviour and its impact, not the person's character. Specific beats vague every time.",
    warmup: "Write a feedback opener using “what I observed was…”.",
  },
  "saying-no": {
    goal: "Decline a request clearly without damaging the relationship.",
    phrases: [
      { text: "I can't take this on without dropping something else — which matters more?", register: "direct" },
      { text: "That's not something I can commit to right now.", register: "direct" },
      { text: "I can't do X, but I can do Y.", register: "neutral" },
      { text: "I want to be straight with you rather than overpromise.", register: "neutral" },
    ],
    tip: "Say no to the task, yes to the person. Offer an alternative or a trade-off, not just a refusal.",
    warmup: "Write a “no” that offers an alternative in the same sentence.",
  },
  "escalation": {
    goal: "Raise a problem up the chain calmly, with a clear ask.",
    phrases: [
      { text: "I want to flag this before it becomes a bigger problem.", register: "direct" },
      { text: "Here's the issue, the impact, and what I need to resolve it.", register: "formal" },
      { text: "I've tried X and Y; this is where I'm stuck.", register: "neutral" },
      { text: "The decision I need from you is —", register: "direct" },
    ],
    tip: "Escalate facts and a specific ask, not frustration. Show what you've already tried.",
    warmup: "Write the one-line ask you'd lead an escalation with.",
  },
};

export function getScenarioLesson(scenarioId) {
  return SCENARIO_LESSONS[scenarioId] || null;
}
