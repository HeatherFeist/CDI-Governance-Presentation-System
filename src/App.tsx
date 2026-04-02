import { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Presentation, Calendar, FolderTree, ArrowRight, Loader2, LogOut, CheckCircle2, FileText, Upload, Download, Trash2, X, FolderOpen, UserCheck, Video } from "lucide-react";
import { Toaster, toast } from "sonner";
import { supabase } from "./lib/supabase";
import Slide from "./components/Slide";
import TemplatesPanel from "./components/TemplatesPanel";
import { SLIDE_SCRIPTS } from "./lib/scripts";

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function App() {
  const [org, setOrg] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*, organization:organizations(*)")
          .eq("id", session.user.id)
          .maybeSingle();
        if (profile?.organization) setOrg(profile.organization);
      }
      setLoading(false);
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) setOrg(null);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <Router>
      <Toaster position="top-center" />
      <div className="min-h-screen text-white font-sans">
        <Routes>
          <Route path="/" element={<Landing onReady={(o) => setOrg(o)} />} />
          <Route path="/dashboard" element={<Dashboard org={org} />} />
          <Route path="/present/:meetingId" element={<PresentationEngine org={org} />} />
        </Routes>
      </div>
    </Router>
  );
}

// ─── Landing / Onboarding ───────────────────────────────────────────────────

function Landing({ onReady }: { onReady: (org: any) => void }) {
  const [domain, setDomain] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  // Handle OAuth return (Google sign-in callback)
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;
      await ensureOrgAndRedirect(session, domain, onReady, navigate);
    });

    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        await ensureOrgAndRedirect(session, "", onReady, navigate);
      }
    });
  }, []);

  const handleStart = async () => {
    if (!domain.trim()) { toast.error("Please enter your Google Workspace domain"); return; }
    setBusy(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
        queryParams: { hd: domain.trim() }, // restrict to their Workspace domain
      },
    });
    if (error) { toast.error(error.message); setBusy(false); }
    // Browser redirects — no further code runs here
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 text-center"
      >
        <div className="space-y-2">
          <h1 className="text-4xl font-light tracking-tight text-white">
            CDI Governance System
          </h1>
          <p className="text-indigo-300 italic font-serif">
            Run your board meetings in minutes — not hours.
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 space-y-6">
          <p className="text-sm text-neutral-300">
            Enter your Google Workspace domain to get started.
          </p>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="e.g. constructivedesignsinc.org"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleStart()}
              className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all text-center text-sm placeholder-white/30"
            />
            <button
              onClick={handleStart}
              disabled={busy}
              className="w-full bg-cyan-500 text-black py-3 rounded-xl font-medium hover:bg-cyan-400 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {busy ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Connecting...</>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Sign in with Google &amp; Start Setup
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { icon: "📋", label: "12-month cycle auto-created" },
            { icon: "🎯", label: "Guided meeting presentations" },
            { icon: "🔄", label: "Decisions carry forward" },
          ].map((f) => (
            <div key={f.label} className="space-y-1">
              <div className="text-2xl">{f.icon}</div>
              <p className="text-xs text-indigo-300/70">{f.label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

async function ensureOrgAndRedirect(
  session: any,
  hintDomain: string,
  onReady: (org: any) => void,
  navigate: (path: string) => void
) {
  const email: string = session.user.email || "";
  const domain = hintDomain.trim() || email.split("@")[1] || "";

  if (!domain) {
    toast.error("Could not determine your organization domain.");
    return;
  }

  try {
    toast.info("Setting up your Governance System...");

    // Single RPC call — security definer bypasses RLS entirely
    const { data: orgData, error } = await supabase.rpc("get_or_create_org", {
      p_domain: domain,
      p_email: email,
      p_display_name: session.user.user_metadata?.full_name || email.split("@")[0],
    });

    if (error) throw error;

    toast.success("Your governance system is ready!");
    onReady(orgData);
    navigate("/dashboard");
  } catch (err: any) {
    toast.error(err.message || "Setup failed");
  }
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

function Dashboard({ org }: { org: any }) {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [tab, setTab] = useState<"meetings" | "documents" | "templates">("meetings");
  const navigate = useNavigate();

  useEffect(() => {
    if (!org?.id) return;
    supabase
      .from("meetings")
      .select("*")
      .eq("organization_id", org.id)
      .order("month")
      .then(({ data }) => { if (data) setMeetings(data); });
  }, [org?.id]);

  const nextMeeting = meetings.find((m) => m.status === "upcoming") || meetings[0];
  const currentMonth = new Date().getMonth(); // 0-indexed

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-12">
      <header className="flex justify-between items-end">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-indigo-400">
            {org?.domain || "Organization"}
          </h2>
          <h1 className="text-4xl font-light text-white">Governance Dashboard</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setTab("meetings")}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-all border ${tab === "meetings" ? "bg-cyan-500/20 border-cyan-400/40 text-cyan-300" : "bg-white/5 border-white/10 text-neutral-300 hover:border-white/30"}`}
          >
            Meetings
          </button>
          <button
            onClick={() => setTab("documents")}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 border ${tab === "documents" ? "bg-cyan-500/20 border-cyan-400/40 text-cyan-300" : "bg-white/5 border-white/10 text-neutral-300 hover:border-white/30"}`}
          >
            <FolderOpen className="w-4 h-4" /> Documents
          </button>
          <button
            onClick={() => setTab("templates")}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 border ${tab === "templates" ? "bg-cyan-500/20 border-cyan-400/40 text-cyan-300" : "bg-white/5 border-white/10 text-neutral-300 hover:border-white/30"}`}
          >
            📋 Templates
          </button>
        </div>
      </header>

      {tab === "documents" && <DocumentsPanel org={org} />}
      {tab === "templates" && <TemplatesPanel org={org} />}

      {tab === "meetings" && <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-2 space-y-6">
          <h3 className="text-xl font-serif italic text-white">12-Month Governance Cycle</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {(meetings.length > 0
              ? meetings
              : Array.from({ length: 12 }, (_, i) => ({ id: i, month: i + 1, status: "draft", date: null }))
            ).map((meeting) => (
              <div
                key={meeting.id}
                onClick={() => navigate(`/present/${meeting.id}`)}
                className={`bg-white/5 backdrop-blur p-6 rounded-2xl border transition-all cursor-pointer group ${
                  meeting.month === currentMonth + 1
                    ? "border-cyan-400/60 ring-1 ring-cyan-400/30"
                    : "border-white/8 hover:border-cyan-400/30"
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-2xl font-serif text-indigo-400/50 group-hover:text-cyan-400 transition-all">
                    {meeting.month.toString().padStart(2, "0")}
                  </span>
                  {meeting.status === "completed" && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                </div>
                <h4 className="font-medium text-sm">{MONTH_NAMES[meeting.month - 1]}</h4>
                <p className="text-xs text-neutral-400 mt-1 capitalize">{meeting.status}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white/8 backdrop-blur-xl border border-white/10 text-white p-8 rounded-3xl space-y-6">
            <h3 className="text-2xl font-light">Next Meeting</h3>
            {nextMeeting ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-neutral-400">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {nextMeeting.date
                      ? new Date(nextMeeting.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                      : "Date TBD"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-neutral-400">
                  <FolderTree className="w-4 h-4" />
                  <span>{nextMeeting.title}</span>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs text-neutral-500 uppercase tracking-widest flex items-center gap-1.5"><Video className="w-3 h-3" /> Google Meet Link</p>
                  <input
                    type="url"
                    defaultValue={nextMeeting.meet_link ?? ""}
                    onBlur={async (e) => {
                      const val = e.target.value.trim();
                      await supabase.from("meetings").update({ meet_link: val || null }).eq("id", nextMeeting.id);
                      toast.success(val ? "Meet link saved" : "Meet link cleared");
                    }}
                    placeholder="https://meet.google.com/..."
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-xs text-neutral-300 focus:outline-none focus:border-white/50 placeholder-white/20"
                  />
                </div>
              </div>
            ) : (
              <p className="text-sm text-neutral-500">No meetings scheduled yet.</p>
            )}
            <button
              onClick={() => nextMeeting && navigate(`/present/${nextMeeting.id}`)}
              disabled={!nextMeeting}
              className="w-full bg-cyan-500 text-black py-3 rounded-xl font-medium hover:bg-cyan-400 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
            >
              <Presentation className="w-4 h-4" />
              Start Presentation
            </button>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-indigo-400">Quick Links</h3>
            <div className="space-y-2">
              {["Agenda Template", "Action Tracker", "Decision Log", "Mentor Feedback"].map((link) => (
                <a
                  key={link}
                  href="#"
                  className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all text-sm text-neutral-200"
                >
                  {link}
                  <ArrowRight className="w-4 h-4 text-indigo-400" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>}
    </div>
  );
}

// ─── Documents Panel ─────────────────────────────────────────────────────────

function DocumentsPanel({ org }: { org: any }) {
  const [docs, setDocs] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const loadDocs = async () => {
    if (!org?.id) return;
    const { data } = await supabase
      .from("documents")
      .select("*")
      .eq("organization_id", org.id)
      .order("created_at", { ascending: false });
    if (data) setDocs(data);
  };

  useEffect(() => { loadDocs(); }, [org?.id]);

  // ── Google Drive Picker ──────────────────────────────────────────────────
  const openDrivePicker = () => {
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!apiKey || apiKey === "your_google_api_key_here" || !clientId || clientId === "your_google_oauth_client_id_here") {
      toast.error("Add VITE_GOOGLE_API_KEY and VITE_GOOGLE_CLIENT_ID to your .env.local file to enable Drive picker.");
      return;
    }
    const g = (window as any).google;
    const gapi = (window as any).gapi;
    if (!gapi || !g) {
      toast.error("Google APIs not loaded. Check your internet connection and refresh.");
      return;
    }

    const showPicker = (token: string) => {
      const picker = new g.picker.PickerBuilder()
        .addView(
          new g.picker.DocsView()
            .setIncludeFolders(false)
            .setSelectFolderEnabled(false)
        )
        .setOAuthToken(token)
        .setDeveloperKey(apiKey)
        .setCallback(async (data: any) => {
          if (data.action === g.picker.Action.PICKED) {
            await saveGoogleDriveFile(data.docs[0]);
          }
        })
        .setTitle("Select a file from Google Drive")
        .build();
      picker.setVisible(true);
    };

    gapi.load("picker", () => {
      const tokenClient = g.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: "https://www.googleapis.com/auth/drive.readonly",
        callback: (resp: any) => {
          if (resp.error) { toast.error("Drive authorization failed: " + resp.error); return; }
          showPicker(resp.access_token);
        },
      });
      tokenClient.requestAccessToken({ prompt: "" });
    });
  };

  const saveGoogleDriveFile = async (driveFile: any) => {
    if (!org?.id) return;
    setUploading(true);
    try {
      const { error } = await supabase.from("documents").insert({
        organization_id: org.id,
        name: driveFile.name.replace(/\.[^/.]+$/, "") || driveFile.name,
        file_path: `gdrive:${driveFile.id}`,
        file_name: driveFile.name,
        file_size: driveFile.sizeBytes ? parseInt(driveFile.sizeBytes) : null,
        mime_type: driveFile.mimeType,
        uploaded_by: (await supabase.auth.getUser()).data.user?.id,
      });
      if (error) throw error;
      toast.success(`"${driveFile.name}" linked from Google Drive`);
      await loadDocs();
    } catch (err: any) {
      toast.error(err.message || "Failed to link Drive file");
    } finally {
      setUploading(false);
    }
  };

  // ── Local file upload (drag-and-drop fallback) ───────────────────────────
  const uploadFile = async (file: File) => {
    if (!org?.id) return;
    setUploading(true);
    try {
      const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const path = `${org.id}/${safeName}`;
      const { error: storageErr } = await supabase.storage
        .from("org-documents")
        .upload(path, file, { contentType: file.type });
      if (storageErr) throw storageErr;
      const { error: dbErr } = await supabase.from("documents").insert({
        organization_id: org.id,
        name: file.name.replace(/\.[^/.]+$/, ""),
        file_path: path,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        uploaded_by: (await supabase.auth.getUser()).data.user?.id,
      });
      if (dbErr) throw dbErr;
      toast.success(`"${file.name}" uploaded`);
      await loadDocs();
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(uploadFile);
  };

  const handleDownload = async (doc: any) => {
    if (doc.file_path?.startsWith("gdrive:")) {
      const fileId = doc.file_path.replace("gdrive:", "");
      window.open(`https://drive.google.com/file/d/${fileId}/view`, "_blank");
      return;
    }
    const { data, error } = await supabase.storage
      .from("org-documents")
      .createSignedUrl(doc.file_path, 60);
    if (error) { toast.error("Could not generate download link"); return; }
    window.open(data.signedUrl, "_blank");
  };

  const handleDelete = async (doc: any) => {
    if (!confirm(`Remove "${doc.name}"?`)) return;
    if (!doc.file_path?.startsWith("gdrive:")) {
      await supabase.storage.from("org-documents").remove([doc.file_path]);
    }
    await supabase.from("documents").delete().eq("id", doc.id);
    toast.success("Document removed");
    await loadDocs();
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const iconForMime = (mime?: string) => {
    if (!mime) return "📄";
    if (mime.includes("google-apps.spreadsheet")) return "📗";
    if (mime.includes("google-apps.document")) return "📘";
    if (mime.includes("google-apps.presentation")) return "📙";
    if (mime.includes("google-apps.form")) return "📋";
    if (mime.includes("google-apps")) return "🔗";
    if (mime.includes("pdf")) return "📕";
    if (mime.includes("word") || mime.includes("document")) return "📘";
    if (mime.includes("sheet") || mime.includes("excel")) return "📗";
    if (mime.includes("image")) return "🖼️";
    return "📄";
  };

  return (
    <div className="space-y-8">
      {/* Drive picker / upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        onClick={openDrivePicker}
        className={`border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all ${dragOver ? "border-cyan-400 bg-cyan-500/10" : "border-white/20 hover:border-cyan-400/50 bg-white/3"}`}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
            <p className="text-sm text-neutral-500">Linking file…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <span className="text-4xl">🗂️</span>
            <p className="text-sm font-medium text-neutral-200">Click to browse Google Drive</p>
            <p className="text-xs text-neutral-400">Or drag and drop local files here</p>
          </div>
        )}
      </div>

      {/* Document list */}
      {docs.length === 0 ? (
        <div className="text-center py-16 text-neutral-400">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No documents linked yet.</p>
          <p className="text-xs mt-1">Link Google Drive files or drag in local documents.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">{docs.length} Document{docs.length !== 1 ? "s" : ""}</p>
          {docs.map((doc) => (
            <div key={doc.id} className="flex items-center gap-4 bg-white/5 p-5 rounded-2xl border border-white/8 hover:border-white/20 transition-all group">
              <span className="text-2xl">{iconForMime(doc.mime_type)}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{doc.name}</p>
                <p className="text-xs text-neutral-400 truncate">
                  {doc.file_path?.startsWith("gdrive:") ? "Google Drive" : doc.file_name}
                  {doc.file_size ? ` · ${formatSize(doc.file_size)}` : ""}
                  {doc.description ? ` · ${doc.description}` : ""}
                </p>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button
                  onClick={() => handleDownload(doc)}
                  title={doc.file_path?.startsWith("gdrive:") ? "Open in Google Drive" : "Download / View"}
                  className="p-2 rounded-lg hover:bg-white/10 transition-all"
                >
                  <Download className="w-4 h-4 text-neutral-400" />
                </button>
                <button
                  onClick={() => handleDelete(doc)}
                  title="Remove"
                  className="p-2 rounded-lg hover:bg-red-50 transition-all"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
              <span className="text-xs text-neutral-300 whitespace-nowrap">
                {new Date(doc.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Presentation Engine ─────────────────────────────────────────────────────

function PresentationEngine({ org }: { org: any }) {
  const { meetingId } = useParams<{ meetingId: string }>();
  const [meeting, setMeeting] = useState<any>(null);
  const [topics, setTopics] = useState<any[]>([]);
  const [prevTopics, setPrevTopics] = useState<any[]>([]);
  const [step, setStep] = useState(0);
  const [topicSubStep, setTopicSubStep] = useState(0);
  const [showScript, setShowScript] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [slideOverrides, setSlideOverrides] = useState<Record<string, any>>({});
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [savedIndicator, setSavedIndicator] = useState(false);
  const navigate = useNavigate();
  // Attendance & live voting
  const [attendees, setAttendees] = useState<any[]>([]);
  const [liveVotes, setLiveVotes] = useState<Record<string, any[]>>({}); // topicId -> votes[]
  const [myVotes, setMyVotes] = useState<Record<string, string>>({}); // topicId -> "yes"|"no"|"abstain"
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [newBoardMember, setNewBoardMember] = useState("");

  // Load meeting + topics
  useEffect(() => {
    if (!meetingId) return;
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setCurrentUserId(data.user.id);
    });
    supabase.from("meetings").select("*").eq("id", meetingId).single()
      .then(({ data }) => {
        if (data) {
          setMeeting(data);
          setSlideOverrides(data.slide_content || {});
        }
      });
    supabase.from("attendees").select("*").eq("meeting_id", meetingId)
      .then(({ data }) => { if (data) setAttendees(data); });
    supabase.from("topics").select("*").eq("meeting_id", meetingId).order("sort_order")
      .then(({ data }) => { if (data) setTopics(data); });
  }, [meetingId]);

  // Fetch previous month topics for snapshot auto-population
  useEffect(() => {
    if (!meeting || !org?.id) return;
    const prevMonth = meeting.month === 1 ? 12 : meeting.month - 1;
    const prevYear  = meeting.month === 1 ? (meeting.year ?? new Date().getFullYear()) - 1 : (meeting.year ?? new Date().getFullYear());
    supabase.from("meetings")
      .select("id")
      .eq("organization_id", org.id)
      .eq("month", prevMonth)
      .maybeSingle()
      .then(({ data: prev }) => {
        if (!prev?.id) return;
        supabase.from("topics")
          .select("title, vote_result, action_plan")
          .eq("meeting_id", prev.id)
          .then(({ data }) => { if (data) setPrevTopics(data); });
      });
  }, [meeting, org?.id]);

  // Reset topic sub-step when main slide changes
  useEffect(() => { setTopicSubStep(0); }, [step]);

  // Realtime — attendance
  useEffect(() => {
    if (!meetingId) return;
    const channel = supabase
      .channel(`attendance-${meetingId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "attendees", filter: `meeting_id=eq.${meetingId}` },
        () => { supabase.from("attendees").select("*").eq("meeting_id", meetingId).then(({ data }) => { if (data) setAttendees(data); }); }
      ).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [meetingId]);

  // Realtime — votes
  useEffect(() => {
    if (!meetingId) return;
    const channel = supabase
      .channel(`votes-${meetingId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "topic_votes", filter: `meeting_id=eq.${meetingId}` },
        () => {
          supabase.from("topic_votes").select("*").eq("meeting_id", meetingId)
            .then(({ data }) => {
              if (!data) return;
              const byTopic: Record<string, any[]> = {};
              data.forEach((v) => {
                if (!byTopic[v.topic_id]) byTopic[v.topic_id] = [];
                byTopic[v.topic_id].push(v);
              });
              setLiveVotes(byTopic);
              const mine: Record<string, string> = {};
              data.filter(v => v.user_id === currentUserId).forEach(v => { mine[v.topic_id] = v.vote; });
              setMyVotes(mine);
            });
        }
      ).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [meetingId, currentUserId]);

  // Fetch initial votes
  useEffect(() => {
    if (!meetingId || !currentUserId) return;
    supabase.from("topic_votes").select("*").eq("meeting_id", meetingId).then(({ data }) => {
      if (!data) return;
      const byTopic: Record<string, any[]> = {};
      data.forEach((v) => {
        if (!byTopic[v.topic_id]) byTopic[v.topic_id] = [];
        byTopic[v.topic_id].push(v);
      });
      setLiveVotes(byTopic);
      const mine: Record<string, string> = {};
      data.filter(v => v.user_id === currentUserId).forEach(v => { mine[v.topic_id] = v.vote; });
      setMyVotes(mine);
    });
  }, [meetingId, currentUserId]);

  const orgName    = org?.name || org?.domain || "CDI";
  const monthLabel = meeting ? `${MONTH_NAMES[meeting.month - 1]} Board Meeting` : "Board Meeting";
  const TOPIC_STEPS = 5;

  // Smart navigation — topic slides have 5 sub-steps before advancing
  const isTopicSlide = (slides: any[]) => slides[step]?.type === "topic";

  const handleNext = (slides: any[]) => {
    if (isTopicSlide(slides) && topicSubStep < TOPIC_STEPS - 1) {
      setTopicSubStep(s => s + 1);
    } else {
      setTopicSubStep(0);
      setStep(s => Math.min(slides.length - 1, s + 1));
    }
  };

  const handleBack = (slides: any[]) => {
    if (isTopicSlide(slides) && topicSubStep > 0) {
      setTopicSubStep(s => s - 1);
    } else {
      setStep(s => Math.max(0, s - 1));
    }
  };

  // Board member roster — stored in slide_content.rollcall.board_members
  const boardMembers: string[] = slideOverrides?.rollcall?.board_members ?? [];
  const handleBoardMembersChange = (names: string[]) => {
    setSlideOverrides(prev => {
      const next = { ...prev, rollcall: { ...(prev.rollcall || {}), board_members: names } };
      scheduleSlideContentSave(next);
      return next;
    });
  };

  // Build slides
  const baseSlides: any[] = [
    { key: "rollcall", type: "rollcall", title: "Roll Call", subtitle: "Meeting Sign-In", data: {
      attendees,
      meetLink: meeting?.meet_link ?? "",
      onSignIn: handleSignIn,
      currentUserId,
      quorum: org?.quorum ?? 0,
      boardMembers,
    }},
    { key: "0",       type: "intro",    title: orgName, subtitle: monthLabel, content: "Building the future, one decision at a time." },
    { key: "1",       type: "mission",  title: "Our Mission", subtitle: "Grounding", content: "To design and construct sustainable, innovative, and human-centric environments." },
    { key: "2",       type: "snapshot", title: "Monthly Snapshot", subtitle: "Where We Are Now", data: { prevTopics } },
    { key: "3",       type: "vision",   title: "Monthly Vision", subtitle: "Where We're Headed", content: "Decisions voted last month guide us forward." },
    ...topics.map((t, i) => ({
      key:      `topic_${t.id}`,
      type:     "topic",
      title:    t.title,
      subtitle: `Topic ${String(i + 1).padStart(2, "0")}`,
      topicId:  t.id,
      data:     { topicObj: t, liveVotes: liveVotes[t.id] ?? [], myVote: myVotes[t.id] ?? null, onCastVote: (v: any) => handleCastVote(t.id, v), currentUserId },
    })),
    { key: "mentor",  type: "mentor",  title: "Mentor Feedback",  subtitle: "Reflection", content: "Review mentor insights and incorporate into planning." },
    { key: "chapter", type: "chapter", title: "Chapter Progress", subtitle: "Dashboard",   content: "Track writing milestones and onboarding progress." },
    { key: "closing", type: "closing", title: "Meeting Summary",  subtitle: "Decisions Made", data: { topics } },
  ];

  const slides = baseSlides.map((s) => ({ ...s, ...(slideOverrides[s.key] || {}) }));
  const current = slides[step] || slides[0];

  // Save slide content (debounced)
  const scheduleSlideContentSave = (next: Record<string, any>) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      await supabase.from("meetings").update({ slide_content: next }).eq("id", meetingId!);
      setSavedIndicator(true);
      setTimeout(() => setSavedIndicator(false), 2000);
    }, 800);
  };

  const handleSlideChange = (field: string, value: string) => {
    const topicId = current.topicId;
    // Topic fields — saved directly to topics row and reflected in local state
    if (topicId && ["now_state", "headed_state", "title", "brainstorm_notes", "vote_result", "action_plan"].includes(field)) {
      supabase.from("topics").update({ [field]: value }).eq("id", topicId);
      setTopics(prev => prev.map(t => t.id === topicId ? { ...t, [field]: value } : t));
      return;
    }
    // Non-topic fields — stored in slide_content JSONB
    setSlideOverrides(prev => {
      const next = { ...prev, [current.key]: { ...(prev[current.key] || {}), [field]: value } };
      scheduleSlideContentSave(next);
      return next;
    });
  };

  // Roll call sign-in
  async function handleSignIn() {
    if (!meetingId || !currentUserId) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const displayName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Board Member";
    const { error } = await supabase.from("attendees").upsert({
      meeting_id: meetingId,
      user_id: user.id,
      display_name: displayName,
      email: user.email,
    }, { onConflict: "meeting_id,user_id" });
    if (!error) toast.success(`Signed in as ${displayName}`);
    else toast.error("Sign-in failed: " + error.message);
  };

  // Per-person vote
  async function handleCastVote(topicId: string, vote: "yes" | "no" | "abstain") {
    if (!meetingId || !currentUserId) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const displayName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Board Member";
    await supabase.from("topic_votes").upsert({
      topic_id: topicId,
      meeting_id: meetingId,
      user_id: user.id,
      display_name: displayName,
      vote,
    }, { onConflict: "topic_id,user_id" });
    setMyVotes(prev => ({ ...prev, [topicId]: vote }));
  };

  // Close meeting
  const handleCloseMeeting = async () => {
    if (!meetingId) return;
    const { data, error } = await supabase.rpc("close_meeting", { p_meeting_id: meetingId });
    if (error) { toast.error(error.message); return; }
    const carried = data?.carried_topics ?? 0;
    toast.success(`Meeting closed! ${carried} decision${carried !== 1 ? "s" : ""} carried forward to next month.`);
    navigate("/dashboard");
  };

  // Script for current slide
  const script = SLIDE_SCRIPTS[current.type];

  return (
    <div className="h-screen bg-[#070714] text-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="p-6 flex justify-between items-center border-b border-white/10 z-10">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-black font-bold text-xs">CDI</div>
          <span className="text-sm font-medium opacity-50">{monthLabel}</span>
        </div>
        <div className="flex items-center gap-4">
          {savedIndicator && (
            <span className="text-xs text-green-400 font-medium transition-opacity">✓ Saved</span>
          )}
          <button
            onClick={() => setEditMode(!editMode)}
            className={`px-4 py-1 rounded-full text-xs font-medium transition-all ${editMode ? "bg-amber-400 text-neutral-900" : "bg-white/10 text-white hover:bg-white/20"}`}
          >
            {editMode ? "✏️ Editing" : "Edit Slides"}
          </button>
          <button
            onClick={() => setShowScript(!showScript)}
            className={`px-4 py-1 rounded-full text-xs font-medium transition-all ${showScript ? "bg-cyan-400 text-black" : "bg-white/10 text-white hover:bg-white/20"}`}
          >
            Director's Script
          </button>
          {meeting?.meet_link && (
            <a href={meeting.meet_link} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium bg-blue-500/20 border border-blue-400/30 text-blue-300 hover:bg-blue-500/30 transition-all">
              <Video className="w-3.5 h-3.5" /> Join Google Meet
            </a>
          )}
          <button onClick={() => navigate("/dashboard")} className="text-sm opacity-50 hover:opacity-100 transition-all flex items-center gap-2">
            <LogOut className="w-4 h-4" /> Exit
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-12 relative overflow-y-auto">
        {editMode && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs px-4 py-1.5 rounded-full z-10">
            Edit mode — changes save automatically
          </div>
        )}
        <AnimatePresence mode="wait">
          <Slide
            key={`${step}-${topicSubStep}-${editMode}`}
            type={current.type}
            title={current.title}
            subtitle={current.subtitle}
            content={current.content}
            image_url={current.image_url}
            data={current.type === "snapshot" ? { prevTopics } : current.type === "closing" ? { topics } : current.data}
            editMode={editMode}
            microStep={current.type === "topic" ? topicSubStep : 0}
            onClose={current.type === "closing" ? handleCloseMeeting : undefined}
            onChange={handleSlideChange}
          />
        </AnimatePresence>

        {/* Director's Script panel */}
        <AnimatePresence>
          {showScript && (
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 h-full w-80 bg-slate-900/95 backdrop-blur-xl border-l border-white/10 text-white p-8 shadow-2xl z-20 overflow-y-auto"
            >
              <div className="space-y-5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-400">Director's Script</h3>
                <p className="font-semibold text-sm text-white">Slide {step + 1}: {current.title}</p>
                {script ? (
                  <div className="space-y-4 text-sm">
                    <p className="text-neutral-400 italic border-l-2 border-indigo-400/50 pl-3">{script.cue}</p>
                    <div className="space-y-2">
                      {script.lines.map((line, i) => (
                        <p key={i} className="text-neutral-300 leading-relaxed">{line}</p>
                      ))}
                    </div>
                    {script.tip && (
                      <div className="bg-amber-400/10 border border-amber-400/30 rounded-xl p-3">
                        <p className="text-xs font-semibold text-amber-300 mb-1">Coaching Tip</p>
                        <p className="text-xs text-amber-400">{script.tip}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-neutral-400 text-sm italic">No script for this slide type.</p>
                )}
                {current.type === "topic" && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-1">
                    <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">Current Sub-Step</p>
                    {["Now", "Headed", "Brainstorm", "Vote", "Action Plan"].map((s, i) => (
                      <p key={i} className={`text-xs ${i === topicSubStep ? "font-bold text-white" : "text-neutral-500"}`}>
                        {i === topicSubStep ? "▶ " : "  "}{i + 1}. {s}
                      </p>
                    ))}
                  </div>
                )}
                {current.type === "rollcall" && (
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-indigo-400">Board Member Roster</p>
                      <p className="text-xs text-neutral-500 mt-1">Names are checked off as members sign in.</p>
                    </div>
                    <div className="space-y-1.5">
                      {boardMembers.length === 0 && (
                        <p className="text-xs text-neutral-400 italic">No members added yet.</p>
                      )}
                      {boardMembers.map((name, i) => {
                        const isPresent = attendees.some(a => a.display_name?.toLowerCase().trim() === name.toLowerCase().trim());
                        return (
                          <div key={i} className="flex items-center gap-2 group">
                            <span className={`flex-1 text-sm ${isPresent ? "text-green-700 font-semibold" : "text-neutral-700"}`}>
                              {isPresent ? "✓ " : "○ "}{name}
                            </span>
                            <button
                              onClick={() => handleBoardMembersChange(boardMembers.filter((_, j) => j !== i))}
                              className="opacity-0 group-hover:opacity-100 text-neutral-300 hover:text-red-400 transition-all text-sm leading-none"
                              title="Remove"
                            >×</button>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newBoardMember}
                        onChange={e => setNewBoardMember(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter" && newBoardMember.trim()) {
                            handleBoardMembersChange([...boardMembers, newBoardMember.trim()]);
                            setNewBoardMember("");
                          }
                        }}
                        placeholder="Add member name…"
                        className="flex-1 text-sm border border-neutral-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                      />
                      <button
                        onClick={() => {
                          if (newBoardMember.trim()) {
                            handleBoardMembersChange([...boardMembers, newBoardMember.trim()]);
                            setNewBoardMember("");
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-neutral-900 text-white text-sm hover:bg-neutral-700 transition-all"
                      >+</button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer nav */}
      <footer className="p-6 flex justify-between items-center border-t border-white/10 z-10">
        <div className="flex gap-2 items-center">
          {slides.map((s, i) => (
            <button
              key={i}
              onClick={() => { setStep(i); setTopicSubStep(0); }}
              className={`h-2 rounded-full transition-all ${i === step ? "bg-white w-6" : "bg-white/30 hover:bg-white/60 w-2"}`}
            />
          ))}
          {current.type === "topic" && (
            <div className="ml-4 flex gap-1 items-center">
              <span className="text-white/30 text-xs mr-1">step</span>
              {[0,1,2,3,4].map(i => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === topicSubStep ? "bg-white" : i < topicSubStep ? "bg-white/40" : "bg-white/15"}`} />
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => handleBack(slides)}
            disabled={step === 0 && topicSubStep === 0}
            className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-sm font-medium disabled:opacity-30"
          >
            Back
          </button>
          <button
            onClick={() => handleNext(slides)}
            disabled={current.type !== "topic" && step === slides.length - 1}
            className="px-6 py-2 rounded-xl bg-white hover:bg-neutral-200 text-neutral-900 transition-all text-sm font-medium disabled:opacity-30"
          >
            {current.type === "topic" && topicSubStep < 4 ? "Next Step →" : "Next →"}
          </button>
        </div>
      </footer>
    </div>
  );
}