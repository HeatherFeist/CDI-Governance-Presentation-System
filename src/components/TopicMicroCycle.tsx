import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, XCircle, PauseCircle } from "lucide-react";

const STEPS = [
  { label: "Now",       icon: "📍", accent: "text-blue-400",    border: "border-blue-400/40"    },
  { label: "Headed",    icon: "🎯", accent: "text-purple-400",  border: "border-purple-400/40"  },
  { label: "Brainstorm",icon: "🧠", accent: "text-amber-400",   border: "border-amber-400/40"   },
  { label: "Vote",      icon: "🗳️", accent: "text-green-400",   border: "border-green-400/40"   },
  { label: "Action",    icon: "✅", accent: "text-emerald-400", border: "border-emerald-400/40" },
];

interface Props {
  topic: {
    id: string;
    title: string;
    now_state?: string;
    headed_state?: string;
    brainstorm_notes?: string;
    vote_result?: string;
    action_plan?: string;
  };
  microStep: number;
  editMode: boolean;
  onUpdate: (field: string, value: string) => void;
  // Live per-person votes (optional — only present in live meeting mode)
  liveVotes?: { user_id: string; display_name: string; vote: "yes" | "no" | "abstain" }[];
  myVote?: "yes" | "no" | "abstain" | null;
  onCastVote?: (vote: "yes" | "no" | "abstain") => void;
  currentUserId?: string;
}

export default function TopicMicroCycle({ topic, microStep, editMode, onUpdate, liveVotes, myVote, onCastVote, currentUserId }: Props) {
  const step = STEPS[microStep] ?? STEPS[0];

  return (
    <div className="max-w-4xl w-full space-y-10">

      {/* Progress row */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
              i === microStep
                ? "bg-white text-neutral-900 shadow-lg scale-105"
                : i < microStep
                ? "bg-white/20 text-white/60"
                : "bg-white/6 text-white/25"
            }`}>
              <span>{s.icon}</span>
              <span className="hidden sm:inline">{s.label}</span>
            </div>
            {i < 4 && (
              <div className={`w-4 h-px transition-all duration-300 ${i < microStep ? "bg-white/40" : "bg-white/12"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">

        {/* ── STEP 0: WHERE WE ARE NOW ─────────────────────────────── */}
        {microStep === 0 && (
          <motion.div key="now"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.35 }} className="space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-1">Our Starting Point</p>
              <h2 className="text-5xl md:text-7xl font-light leading-none">Where We Are Now</h2>
            </div>
            {editMode ? (
              <textarea
                defaultValue={topic.now_state ?? ""}
                onBlur={(e) => onUpdate("now_state", e.target.value)}
                rows={5}
                placeholder="Describe the current state of this topic — what's actually true right now?"
                className="w-full bg-white/8 border border-blue-400/30 rounded-2xl p-5 text-xl text-neutral-200 resize-none focus:outline-none focus:border-blue-400/70 placeholder-white/20"
              />
            ) : (
              <p className="text-2xl font-serif italic text-neutral-300 leading-relaxed">
                {topic.now_state || "No current state recorded. Enable Edit mode to add context."}
              </p>
            )}
          </motion.div>
        )}

        {/* ── STEP 1: WHERE WE'RE HEADED ───────────────────────────── */}
        {microStep === 1 && (
          <motion.div key="headed"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.35 }} className="space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-purple-400 mb-1">Our Declared Direction</p>
              <h2 className="text-5xl md:text-7xl font-light leading-none">Where We're Headed</h2>
            </div>
            {editMode ? (
              <textarea
                defaultValue={topic.headed_state ?? ""}
                onBlur={(e) => onUpdate("headed_state", e.target.value)}
                rows={5}
                placeholder="What direction did we commit to? (Auto-populated from last month's vote)"
                className="w-full bg-white/8 border border-purple-400/30 rounded-2xl p-5 text-xl text-neutral-200 resize-none focus:outline-none focus:border-purple-400/70 placeholder-white/20"
              />
            ) : (
              <p className="text-2xl font-serif italic text-neutral-300 leading-relaxed">
                {topic.headed_state || "Direction not yet defined. Last month's passed vote will populate this automatically."}
              </p>
            )}
          </motion.div>
        )}

        {/* ── STEP 2: BRAINSTORM ───────────────────────────────────── */}
        {microStep === 2 && (
          <motion.div key="brainstorm"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.35 }} className="space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-1">Open the Floor</p>
              <h2 className="text-5xl md:text-7xl font-light leading-none">Brainstorm</h2>
              <p className="text-neutral-400 mt-3 text-lg">What ideas does the board have to move from now toward headed?</p>
            </div>
            <textarea
              defaultValue={topic.brainstorm_notes ?? ""}
              onBlur={(e) => onUpdate("brainstorm_notes", e.target.value)}
              rows={8}
              placeholder={"• [Idea 1]\n• [Idea 2]\n• [Idea 3]\n\nCapture every idea — filter nothing."}
              className="w-full bg-white/6 border border-amber-400/30 rounded-2xl p-5 text-lg text-neutral-200 resize-none focus:outline-none focus:border-amber-400/60 placeholder-white/18 font-mono leading-relaxed"
            />
          </motion.div>
        )}

        {/* ── STEP 3: VOTE ─────────────────────────────────────────── */}
        {microStep === 3 && (
          <motion.div key="vote"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.35 }} className="space-y-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-green-400 mb-1">Decision Point</p>
              <h2 className="text-5xl md:text-7xl font-light leading-none">Vote</h2>
              <p className="text-neutral-400 mt-3 text-lg">Each board member casts their vote below.</p>
            </div>
            {topic.headed_state && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <p className="text-xs text-neutral-500 uppercase tracking-widest mb-2">Proposed Direction</p>
                <p className="text-xl text-neutral-200 italic">"{topic.headed_state}"</p>
              </div>
            )}

            {/* Personal vote buttons — shown to board members */}
            {onCastVote && (
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">Your Vote</p>
                <div className="grid grid-cols-3 gap-3">
                  {([
                    { v: "yes",     label: "Yes",     Icon: CheckCircle2, active: "bg-green-500 ring-2 ring-white/50 scale-105",                      idle: "bg-white/8 hover:bg-green-500/25" },
                    { v: "no",      label: "No",      Icon: XCircle,      active: "bg-red-500 ring-2 ring-white/50 scale-105",                        idle: "bg-white/8 hover:bg-red-500/25" },
                    { v: "abstain", label: "Abstain", Icon: PauseCircle,  active: "bg-yellow-400 ring-2 ring-white/50 scale-105 text-neutral-900",    idle: "bg-white/8 hover:bg-yellow-400/25" },
                  ] as const).map(({ v, label, Icon, active, idle }) => (
                    <button key={v} onClick={() => onCastVote(v)}
                      className={`flex flex-col items-center gap-2 p-5 rounded-2xl font-semibold text-white transition-all duration-200 ${myVote === v ? active : idle}`}>
                      <Icon className="w-7 h-7" />
                      <span className="text-base">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Live vote tally */}
            {liveVotes && liveVotes.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">Live Results</p>
                  <div className="flex gap-3 text-xs">
                    <span className="text-green-400 font-semibold">{liveVotes.filter(v => v.vote === "yes").length} Yes</span>
                    <span className="text-red-400 font-semibold">{liveVotes.filter(v => v.vote === "no").length} No</span>
                    <span className="text-yellow-400 font-semibold">{liveVotes.filter(v => v.vote === "abstain").length} Abstain</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {liveVotes.map((v) => (
                    <div key={v.user_id} className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm ${
                      v.vote === "yes"     ? "bg-green-500/10 border-green-400/30 text-green-300" :
                      v.vote === "no"      ? "bg-red-500/10 border-red-400/30 text-red-300" :
                                             "bg-yellow-400/10 border-yellow-400/30 text-yellow-300"
                    }`}>
                      <span className="font-semibold">{v.vote === "yes" ? "✓" : v.vote === "no" ? "✗" : "—"}</span>
                      <span className="truncate">{v.display_name}</span>
                      {v.user_id === currentUserId && <span className="text-xs opacity-60 ml-auto">you</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Director's official vote record (admin only) */}
            {!onCastVote && (
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">Official Record</p>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: "passed", label: "Passed", Icon: CheckCircle2, active: "bg-green-500 ring-2 ring-white/50 scale-105", idle: "bg-white/8 hover:bg-green-500/25" },
                    { value: "failed", label: "Failed", Icon: XCircle,      active: "bg-red-500 ring-2 ring-white/50 scale-105",   idle: "bg-white/8 hover:bg-red-500/25" },
                    { value: "tabled", label: "Tabled", Icon: PauseCircle,  active: "bg-yellow-400 ring-2 ring-white/50 scale-105 text-neutral-900", idle: "bg-white/8 hover:bg-yellow-400/25" },
                  ].map(({ value, label, Icon, active, idle }) => (
                    <button key={value} onClick={() => onUpdate("vote_result", value)}
                      className={`flex flex-col items-center gap-3 p-7 rounded-2xl font-semibold text-white transition-all duration-200 ${topic.vote_result === value ? active : idle}`}>
                      <Icon className="w-9 h-9" />
                      <span className="text-lg">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {topic.vote_result && (
              <p className="text-center text-neutral-400 text-sm">
                Official result: <span className="font-semibold text-white capitalize">{topic.vote_result}</span>
                {topic.vote_result === "passed" && " — carries forward to next month automatically."}
              </p>
            )}
          </motion.div>
        )}

        {/* ── STEP 4: ACTION PLAN ──────────────────────────────────── */}
        {microStep === 4 && (
          <motion.div key="action"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.35 }} className="space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-1">Execution</p>
              <h2 className="text-5xl md:text-7xl font-light leading-none">Action Plan</h2>
              {topic.vote_result === "passed" && (
                <p className="text-emerald-400 text-sm mt-2">
                  ✓ Vote passed — this topic auto-populates next month's agenda
                </p>
              )}
            </div>
            <textarea
              defaultValue={topic.action_plan ?? ""}
              onBlur={(e) => onUpdate("action_plan", e.target.value)}
              rows={6}
              placeholder={"WHO is responsible:\nWHAT specifically:\nBY WHEN:\n\nAdditional notes:"}
              className="w-full bg-white/6 border border-emerald-400/30 rounded-2xl p-5 text-lg text-neutral-200 resize-none focus:outline-none focus:border-emerald-400/60 placeholder-white/18"
            />
            {topic.vote_result === "passed" && (
              <div className="bg-emerald-500/8 border border-emerald-500/20 rounded-xl p-4">
                <p className="text-sm text-emerald-300">
                  This action plan becomes next month's "Where We Are Now" automatically when you close the meeting.
                </p>
              </div>
            )}
          </motion.div>
        )}

      </AnimatePresence>

      {/* Mini step label */}
      <p className="text-xs text-neutral-600 uppercase tracking-widest">
        Step {microStep + 1} of 5 — {step.label}
      </p>
    </div>
  );
}
