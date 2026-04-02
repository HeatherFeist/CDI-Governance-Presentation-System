export interface SlideScript {
  cue: string;
  lines: string[];
  tip?: string;
}

export const SLIDE_SCRIPTS: Record<string, SlideScript> = {
  intro: {
    cue: "Opening slide appears — make eye contact with the room before speaking",
    lines: [
      '"Welcome, everyone. I\'m glad we\'re all here."',
      '"This meeting follows our structured governance rhythm."',
      '"Each topic will move through our full 5-step decision cycle — Now, Headed, Brainstorm, Vote, Action."',
      '"By the time we close today, we will have clear decisions, clear actions, and a clear path forward."',
      '"Let\'s begin the way we always begin."',
    ],
    tip: "Speak slowly. Let the room settle. The opening pacing sets the tone for the entire meeting.",
  },
  mission: {
    cue: "Invite everyone to read the mission statement aloud — together",
    lines: [
      '"Let\'s ground ourselves in why we\'re here before we look at the work."',
      '"Please read our mission with me."',
      '"[All read aloud together]"',
      '"Everything on today\'s agenda flows from that statement."',
      '"When we lose our way, this brings us back."',
    ],
    tip: "Reading together creates unity. Don't skip this even if time is tight — it takes 60 seconds and earns the meeting.",
  },
  snapshot: {
    cue: "Review last month's key decisions and current state — this is auto-populated",
    lines: [
      '"This is where our organization stands right now."',
      '"These data points come directly from last month\'s decisions and the actions that followed."',
      '"Take a moment to read through this."',
      '"Are there any questions about where we stand before we look ahead?"',
    ],
    tip: "Affirm continuity: 'We are building on progress — not starting over.' This is the spirit of the snapshot.",
  },
  vision: {
    cue: "Read the month's declared direction — these are last month's passed votes",
    lines: [
      '"This is where we are headed — based on the decisions our board made last month."',
      '"These are not wishes. These are commitments we voted to pursue."',
      '"Today\'s topic discussions will confirm, refine, or build on each of these directions."',
    ],
    tip: "Keep this brief. The depth happens in the topic discussions. Don't linger — advance with confidence.",
  },
  topic: {
    cue: "Use the exact same 5-step arc for every topic — the board will feel the rhythm",
    lines: [
      '"We are now looking at [Topic Title]."',
      '"Step 1 — This is where we are right now." [Read now_state aloud]',
      '"Step 2 — This is where we\'ve committed to going." [Read headed_state aloud]',
      '"Step 3 — Let\'s brainstorm. What ideas does the board have to close this gap?" [Open floor — capture all ideas]',
      '"Step 4 — I\'d like to call for a vote. Based on our discussion, all in favor of [state direction clearly]?" [Record result]',
      '"Step 5 — Let\'s capture our action plan. Who owns this? What specifically? By when?" [Record detail]',
    ],
    tip: "Resist the urge to skip steps when time is short. A partial cycle is weaker than a fast full cycle. Speed up the discussion, not the structure.",
  },
  mentor: {
    cue: "Frame mentor time as a gift — not a report, not a review",
    lines: [
      '"I\'d like to invite our mentor, [Name], to share their observations from this month."',
      '"[Allow 5–7 minutes for mentor to speak without interruption]"',
      '"Thank you. Board members — what is one thing from this feedback we can implement before next month?"',
      '"[Capture one concrete response]"',
    ],
    tip: "Coach the board ahead of time: mentor feedback is observation, not correction. Receive it with openness.",
  },
  chapter: {
    cue: "Brief check-in — keep energy up and celebrate any progress",
    lines: [
      '"Let\'s take a moment to check in on our chapter-writing journey."',
      '"Writing our story is part of building our legacy."',
      '"[Review milestones — note what\'s been completed and what comes next]"',
      '"Every word we write is evidence of our growth."',
    ],
    tip: "Celebrate any progress, no matter how small. Momentum in chapter writing is built meeting by meeting.",
  },
  budget: {
    cue: "Present financial data clearly — ground decisions in numbers before discussion",
    lines: [
      '"Let\'s take a moment to review our financial position."',
      '"This shows our budget allocation versus actual spend — for both this month and this quarter."',
      '"[Review the variance — positive means under budget, negative means over]"',
      '"Does the board have any questions about these numbers before we move on?"',
      '"Are there any line items we should flag for next month\'s planning?"',
    ],
    tip: "Keep this factual and brief. If there\'s a significant variance, acknowledge it and flag it for the action plan in the relevant topic discussion.",
  },
  closing: {
    cue: "Slow down. This is the most important 5 minutes of the meeting",
    lines: [
      '"Let\'s review every decision we made in today\'s meeting."',
      '"[Read each voted item aloud — one by one]"',
      '"Each passed vote will automatically carry forward to become next month\'s \'Where We\'re Headed\' for that topic."',
      '"Before we close — does anyone have a final comment, question, or clarification?"',
      '"[Pause. Allow space. Don\'t rush this.]"',
      '"Thank you all. This work matters far beyond this room."',
      '"[Click \'Close Meeting & Carry Forward\' to finalize]"',
      '"Meeting adjourned."',
    ],
    tip: "End every meeting with the same closing. Ritual and repetition create safety, trust, and momentum across the 12-month cycle.",
  },
};
