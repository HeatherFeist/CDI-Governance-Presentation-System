export interface WorkspaceTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "doc" | "sheet" | "form";
  createUrl: string;
  starterContent: string;
}

export const WORKSPACE_TEMPLATES: WorkspaceTemplate[] = [
  {
    id: "agenda",
    name: "Meeting Agenda",
    description: "Monthly board meeting agenda with time blocks and presenter notes",
    icon: "📋",
    category: "doc",
    createUrl: "https://docs.google.com/document/create",
    starterContent: "BOARD MEETING AGENDA\nOrganization: [Name]\nDate: [Date]  |  Time: [Time]  |  Location: [Location]\n──────────────────────────────────────\n\n1. CALL TO ORDER                              (2 min)\n   Director opens the meeting.\n\n2. MISSION REMINDER                           (3 min)\n   Board reads mission statement together.\n\n3. MONTHLY SNAPSHOT — Where We Are Now        (5 min)\n   Review of last month's decisions and actions.\n\n4. MONTHLY VISION — Where We're Headed        (5 min)\n   Review of this month's declared direction.\n\n5. TOPIC DISCUSSIONS                          (15 min each)\n   A. [Topic 1] — Now → Headed → Brainstorm → Vote → Action\n   B. [Topic 2] — Now → Headed → Brainstorm → Vote → Action\n   C. [Topic 3] — Now → Headed → Brainstorm → Vote → Action\n\n6. MENTOR FEEDBACK                            (10 min)\n   Mentor shares monthly observations.\n\n7. CHAPTER PROGRESS                           (5 min)\n   Update on chapter writing milestones.\n\n8. CLOSING & NEXT STEPS                       (5 min)\n   Review decisions. Confirm action items. Set next meeting.\n\n9. ADJOURNMENT\n──────────────────────────────────────\nTotal estimated time: 75–90 minutes",
  },
  {
    id: "minutes",
    name: "Meeting Minutes",
    description: "Official record of attendance, discussions, motions, and votes",
    icon: "📝",
    category: "doc",
    createUrl: "https://docs.google.com/document/create",
    starterContent: "MEETING MINUTES\nOrganization: [Name]\nDate: [Date]  |  Time: [Time]  |  Location: [Location]\nMinutes Recorded By: [Name]\n\nATTENDANCE\nPresent:\nAbsent:\nGuests:\n──────────────────────────────────────\n\nCALL TO ORDER\nMeeting called to order at [time] by [Director Name].\n\nMISSION REMINDER\nBoard read mission statement aloud together.\n\nMONTHLY SNAPSHOT\n[Summary of last month's decisions reviewed]\n\nTOPIC DISCUSSIONS\n\n  TOPIC 1: [Title]\n    Now: [Current state]\n    Headed: [Direction]\n    Brainstorm Ideas:\n    MOTION: [Text of motion]\n    Moved by: [Name]  |  Seconded by: [Name]\n    Vote: __ Passed  __ Failed  __ Tabled\n    Action Plan: [What, Who, By When]\n\n  TOPIC 2: [Title]\n    [Repeat structure above]\n\nMENTOR FEEDBACK\n[Summary of mentor observations]\n\nCHAPTER PROGRESS\n[Update on writing milestones]\n\nACTION ITEMS\n| Item | Owner | Due Date | Status |\n|------|-------|----------|--------|\n|      |       |          |        |\n\nNEXT MEETING\nDate: [Date]  |  Time: [Time]  |  Location: [Location]\n\nADJOURNMENT\nMeeting adjourned at [time].",
  },
  {
    id: "action_tracker",
    name: "Action Item Tracker",
    description: "Spreadsheet tracking all action items, owners, due dates, and status",
    icon: "✅",
    category: "sheet",
    createUrl: "https://sheets.google.com/create",
    starterContent: "Create a Google Sheet with these column headers in Row 1:\n\nA: Action Item\nB: Owner / Assigned To\nC: Due Date\nD: Status  (Open / In Progress / Complete / Blocked)\nE: Priority  (High / Medium / Low)\nF: Meeting Date Assigned\nG: Topic\nH: Notes / Updates\n\nFORMATTING TIPS:\n• Red rows = Overdue\n• Yellow rows = In Progress\n• Green rows = Complete\n• Freeze Row 1 as headers\n• Add a filter to each column for easy sorting\n\nBONUS: Add a second tab \"Summary\" with:\n• Count of Open items\n• Count of In Progress items\n• Count of Completed items\n• Items due this week (use TODAY() formula)",
  },
  {
    id: "voting_form",
    name: "Voting Form",
    description: "Google Form for recording board votes on each agenda topic",
    icon: "🗳️",
    category: "form",
    createUrl: "https://forms.google.com/create",
    starterContent: "Create a Google Form titled: \"[Month] Board Meeting — Vote Record\"\n\nFIELDS:\n1. Your Name  (Short answer, required)\n2. Meeting Date  (Date field, required)\n3. Topic Being Voted On  (Short answer or Dropdown)\n4. Your Vote  (Multiple choice)\n   • Passed\n   • Failed\n   • Abstain\n5. Brief Reason or Comment  (Paragraph, optional)\n6. Any follow-up action you're committing to?  (Paragraph, optional)\n\nSETTINGS:\n• Collect email addresses: ON\n• Limit to 1 response per person: OFF\n• Show summary charts after submission: ON\n\nAfter creating: Link the response spreadsheet to your Action Tracker tab.",
  },
  {
    id: "brainstorm_form",
    name: "Pre-Meeting Brainstorm Form",
    description: "Collect board member ideas on topics before the meeting begins",
    icon: "🧠",
    category: "form",
    createUrl: "https://forms.google.com/create",
    starterContent: "Create a Google Form titled: \"[Month] Board Meeting — Brainstorm Submissions\"\n\nFIELDS:\n1. Your Name  (Short answer, required)\n2. Topic This Idea Relates To  (Dropdown — list your meeting topics)\n3. Your Idea  (Paragraph, required)\n   Label: \"What do you suggest we do?\"\n4. How Does This Move Us Forward?  (Paragraph)\n   Label: \"How does this get us from Now to Headed?\"\n5. Resources or Help Needed  (Short answer, optional)\n6. Who Could Champion This Idea?  (Short answer, optional)\n7. Urgency  (Multiple choice)\n   • Immediate — This Month\n   • This Quarter\n   • Long-Term Planning\n\nSEND THIS FORM: 3–5 days before the meeting.\nDuring the meeting, display responses on the Brainstorm step for each topic.",
  },
  {
    id: "mentor_feedback",
    name: "Mentor Feedback Form",
    description: "Structured monthly check-in form for mentors to share observations",
    icon: "🎓",
    category: "form",
    createUrl: "https://forms.google.com/create",
    starterContent: "Create a Google Form titled: \"Monthly Mentor Feedback — [Organization Name]\"\n\nFIELDS:\n1. Mentor Name  (Short answer)\n2. Month / Meeting Date  (Date or Dropdown)\n3. Overall Observation  (Paragraph)\n4. Strength Noted  (Short answer) — \"One specific strength this board demonstrated\"\n5. Growth Area  (Short answer) — \"One area to focus on next month\"\n6. Specific Recommendation  (Paragraph)\n7. Chapter Writing Observation  (Paragraph, optional)\n8. Your Availability for Next Month  (Multiple choice: Available / Limited / Unavailable)\n9. Additional Notes  (Paragraph, optional)\n\nSHARE THIS FORM: Within 48 hours after each meeting.\nMentor responses directly shape the following month's direction.",
  },
  {
    id: "chapter_writing",
    name: "Chapter Writing Outline",
    description: "Document structure for chapter development and story-building progress",
    icon: "📖",
    category: "doc",
    createUrl: "https://docs.google.com/document/create",
    starterContent: "CHAPTER WRITING OUTLINE\nOrganization: [Name]\nLead Author(s): [Names]\nTarget Completion: [Date]\nStatus: In Progress / Review / Complete\n──────────────────────────────────────\n\nSECTION 1: WHO WE ARE\n  1.1 Our Origin Story\n  1.2 Our Founding Vision\n  1.3 Our Core Values\n\nSECTION 2: WHAT WE DO\n  2.1 Our Programs\n  2.2 Our Governance Structure\n  2.3 Our Role in the Community\n\nSECTION 3: OUR IMPACT\n  3.1 Stories of Change\n  3.2 Measurable Outcomes\n  3.3 Testimonials\n\nSECTION 4: OUR JOURNEY\n  4.1 Year 1 Milestones\n  4.2 Challenges We Overcame\n  4.3 Decisions That Shaped Us\n\nSECTION 5: OUR FUTURE\n  5.1 Where We're Headed\n  5.2 Our 12-Month Vision\n  5.3 How Others Can Help\n\nWRITING GUIDELINES:\n• Write in first-person plural (\"We decided...\" not \"The board decided...\")\n• Keep each section to 300–500 words\n• Include at least one specific story per section\n• Review and update one section at each monthly meeting",
  },
  {
    id: "mentor_onboarding",
    name: "Mentor Onboarding Packet",
    description: "Welcome guide and role expectations document for new mentors",
    icon: "🤝",
    category: "doc",
    createUrl: "https://docs.google.com/document/create",
    starterContent: "MENTOR WELCOME PACKET\nOrganization: [Name]\n\nWELCOME\nWe are honored to have you as a mentor. Your experience and insight help us grow in ways we cannot achieve alone.\n\nYOUR ROLE\n• OBSERVE — Be present at monthly meetings as a calm, experienced witness\n• REFLECT — Share honest, constructive feedback after each meeting\n• GUIDE — Offer perspective rooted in experience, not authority\n• ENCOURAGE — Recognize growth and effort, not just outcomes\n\nWHAT TO EXPECT\n• Monthly board meetings (approximately 75–90 minutes)\n• Monthly Mentor Feedback Form (5–10 minutes to complete)\n• Occasional one-on-one check-ins with the Director\n\nHOW OUR MEETINGS WORK\n1. Opening & Mission Reminder\n2. Monthly Snapshot (Where We Are Now)\n3. Monthly Vision (Where We're Headed)\n4. Topic Discussions (5-step decision cycle)\n5. YOUR FEEDBACK — This is your time\n6. Chapter Progress Update\n7. Closing & Decisions Review\n\nYOUR FEEDBACK MATTERS\nPlease complete the Mentor Feedback Form within 48 hours after each meeting.\n\nCONTACT\nDirector: [Name]  |  Email: [Email]  |  Phone: [Phone]",
  },
  {
    id: "board_onboarding",
    name: "Board Member Onboarding",
    description: "Orientation packet with governance expectations for new board members",
    icon: "🏛️",
    category: "doc",
    createUrl: "https://docs.google.com/document/create",
    starterContent: "BOARD MEMBER ORIENTATION PACKET\nOrganization: [Name]\n\nWELCOME TO THE BOARD\nYou have been selected because we believe in your commitment, your character, and your capacity to help this organization grow.\n\nOUR MISSION\n[Insert mission statement here]\n\nYOUR ROLE\n• SHOW UP — Attend monthly meetings consistently\n• ENGAGE — Ask questions, share ideas, vote thoughtfully\n• OWN IT — Accept action items and follow through\n• REPRESENT — Carry our mission into your daily life\n\nHOW OUR MEETINGS WORK\n1. Mission Reminder\n2. Monthly Snapshot — Where We Are Now\n3. Monthly Vision — Where We're Headed\n4. Topic Discussions — 5-step decision cycle\n5. Mentor Feedback\n6. Chapter Progress\n7. Closing\n\nTHE 5-STEP DECISION CYCLE\n→ Step 1: Where We Are Now\n→ Step 2: Where We're Headed\n→ Step 3: Brainstorm\n→ Step 4: Vote\n→ Step 5: Action Plan\n\nYOUR FIRST 90 DAYS\n• Month 1: Learn the rhythm. Ask questions.\n• Month 2: Own one action item.\n• Month 3: Lead discussion on one topic.\n\nCONTACT\nDirector: [Name]  |  Email: [Email]  |  Phone: [Phone]",
  },
  {
    id: "director_script",
    name: "Director's First Meeting Script",
    description: "Complete word-for-word script for running the very first board meeting",
    icon: "🎤",
    category: "doc",
    createUrl: "https://docs.google.com/document/create",
    starterContent: "DIRECTOR'S FIRST MEETING SCRIPT\nOrganization: [Name]  |  Date: [Date]\nNote: [Text in brackets] = your action cue\nNote: \"Quoted text\" = speak aloud\n──────────────────────────────────────\n\nOPENING SLIDE\n\"Welcome, everyone. I am so glad you are here.\"\n\"This meeting marks the beginning of our structured governance journey.\"\n\"Every meeting will follow the same rhythm — no chaos. Just clear, consistent progress.\"\n\nMISSION SLIDE\n[Invite everyone to read the mission together]\n\"Please read this with me.\"\n[All read aloud]\n\"That is why we are here. Everything tonight flows from that.\"\n\nFOR EACH TOPIC:\n\"We are now looking at [Topic Name].\"\n\"Step 1 — This is where we are right now:\" [Read aloud]\n\"Step 2 — This is where we're headed:\" [Read aloud]\n\"Step 3 — Let's brainstorm. What ideas do we have?\" [Capture all]\n\"Step 4 — I'd like to call for a vote.\" [Record result]\n\"Step 5 — Let's capture our action plan. Who? What? By when?\" [Record]\n\nMENTOR FEEDBACK\n\"I'd like to invite our mentor, [Name], to share their observations.\"\n[Allow 5–7 minutes]\n\"What is one thing from this feedback we can implement before next month?\"\n\nCLOSING\n\"Let's review every decision made tonight.\"\n[Read each voted item]\n\"These will automatically carry to next month's agenda.\"\n\"Thank you all. What we do here matters.\"\n[Click 'Close Meeting & Carry Forward']\n\"Meeting adjourned.\"",
  },
];

export const CATEGORY_LABEL: Record<WorkspaceTemplate["category"], string> = {
  doc: "Google Doc",
  sheet: "Google Sheet",
  form: "Google Form",
};

export const CATEGORY_COLOR: Record<WorkspaceTemplate["category"], string> = {
  doc: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  sheet: "bg-green-500/20 text-green-300 border-green-500/30",
  form: "bg-purple-500/20 text-purple-300 border-purple-500/30",
};