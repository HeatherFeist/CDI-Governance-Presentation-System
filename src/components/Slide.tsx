import { useState } from "react";
import { motion } from "motion/react";
import { ImagePlus, CheckCircle2, XCircle, Clock, UserCheck, Video } from "lucide-react";
import TopicMicroCycle from "./TopicMicroCycle";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SlideProps {
  type: "intro" | "mission" | "snapshot" | "vision" | "topic" | "mentor" | "chapter" | "closing" | "rollcall";
  title: string;
  subtitle?: string;
  content?: string;
  image_url?: string;
  /** topic: { topicObj } | snapshot: { prevTopics } | closing: { topics } | rollcall: { attendees, meetLink, onSignIn, currentUserId, quorum } */
  data?: any;
  editMode?: boolean;
  microStep?: number;    // 0-4 for topic slides
  onClose?: () => void;  // closing slide "close meeting" button
  onChange?: (field: string, value: string) => void;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function EditableText({
  value, field, tag: Tag = "p", className, placeholder, onChange,
}: {
  value: string; field: string; tag?: "p" | "h1" | "h2" | "h3";
  className: string; placeholder?: string;
  onChange: (f: string, v: string) => void;
}) {
  const [v, setV] = useState(value);
  return (
    <Tag
      contentEditable
      suppressContentEditableWarning
      onInput={(e) => setV((e.target as HTMLElement).innerText)}
      onBlur={() => onChange(field, v)}
      data-placeholder={placeholder}
      className={`${className} outline-none border-b border-dashed border-white/30 focus:border-white min-h-[1em] empty:before:content-[attr(data-placeholder)] empty:before:opacity-30`}
    >
      {value}
    </Tag>
  );
}

function ImageSlot({ url, editMode, onChange }: { url?: string; editMode?: boolean; onChange?: (f: string, v: string) => void }) {
  if (!editMode && !url) return null;
  return editMode ? (
    <div className="mt-6 space-y-2">
      <p className="text-xs text-white/40 uppercase tracking-widest">Image URL</p>
      <input
        type="url"
        defaultValue={url ?? ""}
        onBlur={(e) => onChange?.("image_url", e.target.value)}
        placeholder="https://..."
        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-sm text-neutral-200 focus:outline-none focus:border-white/50 placeholder-white/20"
      />
      {url && <img src={url} alt="slide" className="mt-2 rounded-2xl max-h-48 object-cover w-full" />}
    </div>
  ) : (
    url ? <img src={url} alt="slide" className="mt-6 rounded-3xl max-h-64 object-cover w-full" /> : null
  );
}

// ─── Main Slide ──────────────────────────────────────────────────────────────

export default function Slide({
  type, title, subtitle, content, image_url, data,
  editMode = false, microStep = 0, onClose, onChange,
}: SlideProps) {
  const edit = editMode && !!onChange;
  const E = ({ value, field, tag: Tag = "p", className, placeholder }: any) =>
    edit
      ? <EditableText value={value} field={field} tag={Tag} className={className} placeholder={placeholder} onChange={onChange!} />
      : <Tag className={className}>{value}</Tag>;

  // ── INTRO ────────────────────────────────────────────────────────────────
  if (type === "intro") return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center text-center space-y-8 max-w-4xl w-full px-4">
      <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-2xl">🏛️</div>
      <E value={title} field="title" tag="h1" className="text-6xl md:text-8xl font-thin tracking-tight" placeholder="Organization Name" />
      <E value={subtitle ?? ""} field="subtitle" tag="p" className="text-xl md:text-2xl text-neutral-400 font-light" placeholder="Meeting subtitle" />
      <E value={content ?? ""} field="content" tag="p" className="text-base text-neutral-500 max-w-lg" placeholder="Tagline or welcome message" />
      <ImageSlot url={image_url} editMode={editMode} onChange={onChange} />
    </motion.div>
  );

  // ── MISSION ──────────────────────────────────────────────────────────────
  if (type === "mission") return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.5 }}
      className="flex flex-col justify-center space-y-10 max-w-3xl w-full px-4">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">{subtitle ?? "Our Why"}</p>
        <E value={title} field="title" tag="h2" className="text-5xl md:text-7xl font-light" placeholder="Mission title" />
      </div>
      <E value={content ?? ""} field="content" tag="p" className="text-2xl md:text-3xl text-neutral-300 font-serif italic leading-relaxed" placeholder="Enter your mission statement…" />
      <ImageSlot url={image_url} editMode={editMode} onChange={onChange} />
    </motion.div>
  );

  // ── SNAPSHOT ─────────────────────────────────────────────────────────────
  if (type === "snapshot") {
    const prevTopics: any[] = data?.prevTopics ?? [];
    return (
      <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.5 }}
        className="flex flex-col justify-center space-y-8 max-w-4xl w-full px-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">{subtitle ?? "Where We Stand"}</p>
          <E value={title} field="title" tag="h2" className="text-5xl md:text-6xl font-light" placeholder="Snapshot title" />
        </div>
        {prevTopics.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-neutral-500 uppercase tracking-widest">Last Month's Decisions</p>
            <div className="grid gap-3">
              {prevTopics.map((t: any, i: number) => (
                <div key={i} className="flex items-start gap-3 bg-white/5 rounded-xl p-4">
                  <span className={`mt-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
                    t.vote_result === "passed" ? "bg-green-500/20 text-green-400" :
                    t.vote_result === "failed" ? "bg-red-500/20 text-red-400" :
                    t.vote_result === "tabled" ? "bg-yellow-500/20 text-yellow-400" :
                    "bg-white/10 text-neutral-400"
                  }`}>{t.vote_result ?? "—"}</span>
                  <div>
                    <p className="font-medium text-neutral-200">{t.title}</p>
                    {t.action_plan && <p className="text-sm text-neutral-400 mt-0.5">{t.action_plan}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <E value={content ?? ""} field="content" tag="p" className="text-xl text-neutral-400 leading-relaxed" placeholder="Review action items from last month and current progress." />
        )}
        <ImageSlot url={image_url} editMode={editMode} onChange={onChange} />
      </motion.div>
    );
  }

  // ── VISION ───────────────────────────────────────────────────────────────
  if (type === "vision") return (
    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.5 }}
      className="flex flex-col justify-center space-y-8 max-w-3xl w-full px-4">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">{subtitle ?? "Our Direction"}</p>
        <E value={title} field="title" tag="h2" className="text-5xl md:text-6xl font-light" placeholder="Vision title" />
      </div>
      <E value={content ?? ""} field="content" tag="p" className="text-2xl text-neutral-300 leading-relaxed" placeholder="Describe this month's declared direction…" />
      <ImageSlot url={image_url} editMode={editMode} onChange={onChange} />
    </motion.div>
  );

  // ── TOPIC — uses TopicMicroCycle ─────────────────────────────────────────
  if (type === "topic") {
    const topicObj = data?.topicObj ?? { id: "", title, now_state: data?.now ?? "", headed_state: data?.headed ?? "" };
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
        className="flex flex-col justify-center max-w-5xl w-full px-4 space-y-4">
        <div className="flex items-baseline gap-3 mb-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-neutral-500">{subtitle ?? "Topic"}</span>
          {edit && (
            <input
              type="text"
              defaultValue={title}
              onBlur={(e) => onChange!("title", e.target.value)}
              className="bg-transparent border-b border-dashed border-white/20 text-2xl font-light text-white focus:outline-none focus:border-white/60 w-full"
            />
          )}
          {!edit && <h2 className="text-2xl font-light">{title}</h2>}
        </div>
        <TopicMicroCycle
          topic={topicObj}
          microStep={microStep}
          editMode={editMode}
          onUpdate={(field, value) => onChange?.(field, value)}
          liveVotes={data?.liveVotes}
          myVote={data?.myVote}
          onCastVote={data?.onCastVote}
          currentUserId={data?.currentUserId}
        />
      </motion.div>
    );
  }

  // ── MENTOR ───────────────────────────────────────────────────────────────
  if (type === "mentor") return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}
      className="flex flex-col justify-center space-y-8 max-w-3xl w-full px-4">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">{subtitle ?? "External Perspective"}</p>
        <E value={title} field="title" tag="h2" className="text-5xl md:text-6xl font-light" placeholder="Mentor Feedback" />
      </div>
      <E value={content ?? ""} field="content" tag="p" className="text-xl text-neutral-400 leading-relaxed" placeholder="Mentor observations appear here." />
      <ImageSlot url={image_url} editMode={editMode} onChange={onChange} />
    </motion.div>
  );

  // ── CHAPTER ──────────────────────────────────────────────────────────────
  if (type === "chapter") return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.5 }}
      className="flex flex-col justify-center space-y-8 max-w-3xl w-full px-4">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">{subtitle ?? "Story Progress"}</p>
        <E value={title} field="title" tag="h2" className="text-5xl md:text-6xl font-light" placeholder="Chapter Progress" />
      </div>
      <E value={content ?? ""} field="content" tag="p" className="text-xl text-neutral-400 leading-relaxed" placeholder="Track writing milestones and onboarding progress here." />
      <ImageSlot url={image_url} editMode={editMode} onChange={onChange} />
    </motion.div>
  );

  // ── CLOSING ──────────────────────────────────────────────────────────────
  if (type === "closing") {
    const topics: any[] = data?.topics ?? [];
    const passed = topics.filter((t) => t.vote_result === "passed");
    const tabled = topics.filter((t) => t.vote_result === "tabled");
    const withVote = topics.filter((t) => t.vote_result);

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}
        className="flex flex-col justify-center space-y-8 max-w-4xl w-full px-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">{subtitle ?? "Decisions Made"}</p>
          <E value={title} field="title" tag="h2" className="text-5xl md:text-6xl font-light" placeholder="Meeting Summary" />
        </div>

        {withVote.length > 0 ? (
          <div className="space-y-3">
            {topics.map((t: any, i: number) => (
              <div key={i} className="flex items-center gap-3 bg-white/5 rounded-xl p-4">
                {t.vote_result === "passed" && <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />}
                {t.vote_result === "failed"  && <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />}
                {t.vote_result === "tabled"  && <Clock className="w-5 h-5 text-yellow-400 flex-shrink-0" />}
                {!t.vote_result              && <div className="w-5 h-5 rounded-full border border-white/20 flex-shrink-0" />}
                <div>
                  <p className="font-medium text-neutral-200">{t.title}</p>
                  {t.action_plan && <p className="text-sm text-neutral-400">{t.action_plan}</p>}
                </div>
                <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${
                  t.vote_result === "passed" ? "bg-green-500/20 text-green-400" :
                  t.vote_result === "failed" ? "bg-red-500/20 text-red-400" :
                  t.vote_result === "tabled" ? "bg-yellow-500/20 text-yellow-400" :
                  "bg-white/10 text-neutral-400"
                }`}>{t.vote_result ?? "no vote"}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xl text-neutral-400">
            No votes recorded yet. Complete the topic discussions to see decisions here.
          </p>
        )}

        {passed.length > 0 && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-sm text-green-300">
            {passed.length} decision{passed.length !== 1 ? "s" : ""} will carry forward to next month's agenda.
            {tabled.length > 0 && ` ${tabled.length} item${tabled.length !== 1 ? "s" : ""} tabled for review.`}
          </div>
        )}

        {onClose && (
          <button
            onClick={onClose}
            className="self-start px-8 py-4 rounded-2xl bg-white text-neutral-900 font-semibold hover:bg-neutral-100 transition-all text-lg"
          >
            Close Meeting & Carry Forward →
          </button>
        )}
      </motion.div>
    );
  }

  // ── ROLL CALL ─────────────────────────────────────────────────────────────
  if (type === "rollcall") {
    const attendees: any[] = data?.attendees ?? [];
    const meetLink: string = data?.meetLink ?? "";
    const onSignIn: (() => void) | undefined = data?.onSignIn;
    const currentUserId: string = data?.currentUserId ?? "";
    const quorum: number = data?.quorum ?? 0;
    const boardMembers: string[] = data?.boardMembers ?? [];
    const alreadySignedIn = attendees.some((a) => a.user_id === currentUserId);
    const quorumMet = quorum > 0 && attendees.length >= quorum;

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}
        className="flex flex-col justify-center space-y-8 max-w-4xl w-full px-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">Meeting Sign-In</p>
          <h2 className="text-5xl md:text-6xl font-light">Roll Call</h2>
        </div>

        {/* Quorum + sign-in row */}
        <div className="flex flex-wrap items-center gap-4">
          {quorum > 0 && (
            <div className={`px-4 py-2 rounded-full text-sm font-semibold border ${
              quorumMet ? "border-green-400/40 bg-green-400/10 text-green-300" : "border-yellow-400/40 bg-yellow-400/10 text-yellow-300"
            }`}>
              {quorumMet ? "✓ Quorum Met" : "⏳ Awaiting Quorum"} — {attendees.length} of {quorum} present
            </div>
          )}
          {quorum === 0 && attendees.length > 0 && (
            <div className="px-4 py-2 rounded-full text-sm font-semibold border border-white/20 bg-white/5 text-neutral-300">
              {attendees.length} member{attendees.length !== 1 ? "s" : ""} signed in
            </div>
          )}
          {onSignIn && !alreadySignedIn && (
            <button
              onClick={onSignIn}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-neutral-900 font-semibold hover:bg-neutral-100 transition-all text-sm"
            >
              <UserCheck className="w-4 h-4" />
              Sign In to This Meeting
            </button>
          )}
          {alreadySignedIn && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/15 border border-green-400/30 text-green-300 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" />
              You're signed in
            </div>
          )}
          {meetLink && (
            <a href={meetLink} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 hover:bg-blue-500/25 transition-all text-sm font-medium">
              <Video className="w-4 h-4" />
              Join Google Meet
            </a>
          )}
        </div>

        {/* Roster with live checkmarks (when set) or plain attendee grid (fallback) */}
        {boardMembers.length > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {boardMembers.map((name, i) => {
                const signed = attendees.find(a => a.display_name?.toLowerCase().trim() === name.toLowerCase().trim());
                return (
                  <div key={i} className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border transition-all ${
                    signed
                      ? "bg-green-500/10 border-green-400/30"
                      : "bg-white/4 border-white/8"
                  }`}>
                    {signed
                      ? <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-green-400" />
                      : <div className="w-4 h-4 rounded-full border border-white/20 flex-shrink-0" />
                    }
                    <div className="min-w-0">
                      <p className={`text-sm font-medium truncate ${
                        signed ? "text-green-300" : "text-neutral-400"
                      }`}>{name}</p>
                      {signed && (
                        <p className="text-xs text-neutral-500">
                          {new Date(signed.signed_in_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Anyone who signed in but isn't on the roster */}
            {attendees.filter(a =>
              !boardMembers.some(n => n.toLowerCase().trim() === a.display_name?.toLowerCase().trim())
            ).length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-widest text-neutral-600 mb-2">Also Present</p>
                <div className="flex flex-wrap gap-2">
                  {attendees
                    .filter(a => !boardMembers.some(n => n.toLowerCase().trim() === a.display_name?.toLowerCase().trim()))
                    .map((a: any) => (
                      <div key={a.id} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                        <span className="text-sm text-neutral-300">{a.display_name}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        ) : attendees.length === 0 ? (
          <div className="text-center py-12 bg-white/3 rounded-2xl border border-white/8">
            <p className="text-neutral-500 text-lg">No members signed in yet.</p>
            <p className="text-neutral-600 text-sm mt-1">Each board member clicks "Sign In" on their own device.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {attendees.map((a: any) => (
              <div key={a.id} className="flex flex-col items-center gap-2 bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg font-semibold">
                  {a.display_name?.charAt(0)?.toUpperCase() ?? "?"}
                </div>
                <p className="text-sm font-medium text-neutral-200 truncate w-full">{a.display_name}</p>
                <p className="text-xs text-neutral-500">
                  {new Date(a.signed_in_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                </p>
                {a.user_id === currentUserId && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">You</span>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    );
  }

  // ── FALLBACK ─────────────────────────────────────────────────────────────
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center">
      <p className="text-neutral-400">Unknown slide type: {type}</p>
    </motion.div>
  );
}