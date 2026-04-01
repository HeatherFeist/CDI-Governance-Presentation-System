import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Presentation, 
  Settings, 
  FolderTree, 
  Calendar, 
  CheckCircle2,
  ArrowRight,
  Loader2,
  LogOut
} from "lucide-react";
import { Toaster, toast } from "sonner";

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [org, setOrg] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate checking auth/org status
    const checkStatus = async () => {
      // In a real app, fetch from Firestore
      setLoading(false);
    };
    checkStatus();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--bg-main)' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--primary)' }} />
      </div>
    );
  }

  return (
    <Router>
      <Toaster position="top-center" theme="dark" />
      <div className="min-h-screen font-sans" style={{ background: 'var(--bg-main)', color: 'var(--text-primary)' }}>
        <Routes>
          <Route path="/" element={<Onboarding onComplete={(data: any) => setOrg(data)} />} />
          <Route path="/dashboard" element={<Dashboard org={org} />} />
          <Route path="/present/:meetingId" element={<PresentationEngine />} />
        </Routes>
      </div>
    </Router>
  );
}

function Onboarding({ onComplete }: { onComplete: (data: any) => void }) {
  const [domain, setDomain] = useState("");
  const [isSettingUp, setIsSettingUp] = useState(false);
  const navigate = useNavigate();

  const handleStart = async () => {
    if (!domain) {
      toast.error("Please enter your organization's domain");
      return;
    }
    setIsSettingUp(true);
    
    try {
      // 1. Trigger Google OAuth
      const response = await fetch("/api/auth/google/url");
      const { url } = await response.json();
      
      const authWindow = window.open(url, "google_auth", "width=600,height=700");
      
      const handleMessage = async (event: MessageEvent) => {
        if (event.data?.type === "GOOGLE_AUTH_SUCCESS") {
          const { tokens } = event.data;
          toast.success("Authenticated with Google");
          
          // 2. Start Auto-population
          toast.info("Generating your Governance System... This may take a minute.");
          
          try {
            const setupResponse = await fetch("/api/setup", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ domain, tokens }),
            });
            
            if (!setupResponse.ok) throw new Error("Setup failed");
            
            const result = await setupResponse.json();
            setIsSettingUp(false);
            onComplete({ domain, setupComplete: true, ...result });
            navigate("/dashboard");
          } catch (error) {
            console.error(error);
            toast.error("Failed to complete setup");
            setIsSettingUp(false);
          }
        }
      };
      
      window.addEventListener("message", handleMessage);
    } catch (error) {
      console.error(error);
      toast.error("Failed to start setup");
      setIsSettingUp(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 hero-glow" style={{ background: 'var(--bg-main)' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 text-center relative z-10"
      >
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight gradient-text">
            Constructive Designs Inc.
          </h1>
          <p className="text-sm uppercase tracking-widest font-medium" style={{ color: 'var(--text-secondary)' }}>
            Governance & Organizational Memory System
          </p>
        </div>

        <div className="glass p-8 space-y-6">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Enter your organization's Google Workspace domain to begin.
          </p>
          
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="e.g. constructive-designs.org"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border transition-all text-center focus:outline-none"
              style={{
                background: 'rgba(20, 24, 40, 0.8)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(45, 104, 255, 0.2)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            
            <button 
              onClick={handleStart}
              disabled={isSettingUp}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2"
            >
              {isSettingUp ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  Begin Onboarding
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        <p className="text-xs max-w-xs mx-auto" style={{ color: 'var(--text-muted)' }}>
          This will automatically create your Shared Drive structure, templates, and 12-month governance cycle.
        </p>
      </motion.div>
    </div>
  );
}

function Dashboard({ org }: { org: any }) {
  const navigate = useNavigate();
  
  return (
    <div className="max-w-7xl mx-auto p-8 space-y-12">
      <header className="flex justify-between items-end">
        <div className="space-y-1">
          <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            {org?.domain || "Organization"}
          </h2>
          <h1 className="text-4xl font-extrabold gradient-text">Governance Dashboard</h1>
        </div>
        <div className="flex gap-4">
          <button
            className="p-2 rounded-full transition-all"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-subtle)'; }}
          >
            <Settings className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-2 space-y-6">
          <h3 className="text-lg font-semibold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
            12-Month Governance Cycle
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div 
                key={i}
                className="cdi-card p-6 cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-2xl font-extrabold" style={{ color: i === 0 ? 'var(--primary)' : 'var(--border-subtle)' }}>
                    {(i + 1).toString().padStart(2, '0')}
                  </span>
                  {i === 0 && <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--cyan)' }} />}
                </div>
                <h4 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Month {i + 1} Packet</h4>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Ready for review</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div className="rounded-3xl p-8 space-y-6" style={{ background: 'var(--gradient-primary)' }}>
            <h3 className="text-2xl font-bold text-white">Next Meeting</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-white/80">
                <Calendar className="w-4 h-4" />
                <span>April 15, 2026 @ 10:00 AM</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-white/80">
                <FolderTree className="w-4 h-4" />
                <span>Month 01 Packet</span>
              </div>
            </div>
            <button 
              onClick={() => navigate("/present/month-01")}
              className="w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              style={{
                background: 'rgba(255,255,255,0.15)',
                color: 'white',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.3)',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.25)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.15)'; }}
            >
              <Presentation className="w-4 h-4" />
              Start Presentation
            </button>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Quick Links</h3>
            <div className="space-y-2">
              {["Agenda Template", "Action Tracker", "Decision Log", "Mentor Feedback"].map((link) => (
                <a 
                  key={link}
                  href="#" 
                  className="flex items-center justify-between p-4 rounded-xl transition-all text-sm cdi-card"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {link}
                  <ArrowRight className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import Slide from "./components/Slide";

function PresentationEngine() {
  const [step, setStep] = useState(0);
  const [showScript, setShowScript] = useState(false);
  const navigate = useNavigate();

  const slides: any[] = [
    { type: 'intro',    title: "Constructive Designs Inc.", subtitle: "Month 01 Governance Meeting", content: "Building the future, one decision at a time." },
    { type: 'mission',  title: "Our Mission",             subtitle: "Grounding",                    content: "To design and construct sustainable, innovative, and human-centric environments." },
    { type: 'snapshot', title: "Monthly Snapshot",        subtitle: "Where We Are Now",             content: "Chapter writing is 40% complete. Mentor feedback is positive. Action items from last month are 80% resolved." },
    { type: 'vision',   title: "Monthly Vision",          subtitle: "Where We're Headed",           content: "Finalizing the chapter outline and onboarding 3 new board members." },
    { type: 'topic',    title: "Chapter Writing",         subtitle: "Topic 01",                     data: { now: "40% complete", headed: "Finalize outline" } },
    { type: 'mentor',   title: "Mentor Feedback",         subtitle: "Reflection",                   content: "Mentors suggest focusing more on the 'Community' section of the chapter." },
    { type: 'chapter',  title: "Chapter Progress",        subtitle: "Dashboard",                    content: "Current focus: Section 2 - Sustainable Materials." },
    { type: 'closing',  title: "Meeting Summary",         subtitle: "Next Steps",                   content: "Voted items have been moved to next month's vision for action planning." },
  ];

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      <header className="p-6 flex justify-between items-center z-10 glass-heavy" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-4">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
            style={{ background: 'var(--gradient-primary)' }}
          >
            CDI
          </div>
          <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Month 01 Governance Meeting</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowScript(!showScript)}
            className="px-4 py-1 rounded-full text-xs font-semibold transition-all"
            style={showScript
              ? { background: 'var(--gradient-primary)', color: 'white' }
              : { background: 'rgba(45,104,255,0.15)', color: 'var(--cyan)', border: '1px solid rgba(45,104,255,0.3)' }}
          >
            Director's Script
          </button>
          <button 
            onClick={() => navigate("/dashboard")}
            className="text-sm transition-all flex items-center gap-2"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
          >
            <LogOut className="w-4 h-4" />
            Exit
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-12 relative">
        <AnimatePresence mode="wait">
          <Slide 
            key={step}
            type={slides[step].type}
            title={slides[step].title}
            subtitle={slides[step].subtitle}
            content={slides[step].content}
            data={slides[step].data}
          />
        </AnimatePresence>

        <AnimatePresence>
          {showScript && (
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 h-full w-80 p-8 shadow-2xl z-20 overflow-y-auto glass-heavy"
              style={{ color: 'var(--text-primary)', borderLeft: '1px solid var(--border-subtle)', borderRadius: 0 }}
            >
              <div className="space-y-6">
                <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Director's Script</h3>
                <div className="space-y-4 text-sm leading-relaxed">
                  <p className="font-bold gradient-text">Slide {step + 1}: {slides[step].title}</p>
                  <div className="space-y-2 italic" style={{ color: 'var(--text-secondary)' }}>
                    {slides[step].type === 'topic' ? (
                      <>
                        <p>"We are now looking at {slides[step].title}."</p>
                        <p>"1. Grounding: Here is where we are now."</p>
                        <p>"2. Vision: Here is where we are headed based on previous decisions."</p>
                        <p>"3. Brainstorming & Action Planning: Let's explore how to achieve this vision and create our concrete action plan for this month."</p>
                        <p>"4. Voting: Finally, we will vote to confirm our path forward."</p>
                      </>
                    ) : (
                      <p>"Welcome everyone. Today we are grounding ourselves in our mission and looking ahead to our next milestones."</p>
                    )}
                  </div>
                  <p style={{ color: 'var(--text-muted)' }}>
                    {slides[step].type === 'topic'
                      ? "Focus on guiding the group from vision to concrete action steps during the brainstorm."
                      : "Focus on setting a welcoming tone."}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer
        className="p-6 flex justify-between items-center z-10"
        style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-glass-heavy)', backdropFilter: 'blur(32px)' }}
      >
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <div 
              key={i}
              className="h-1 w-8 rounded-full transition-all"
              style={{ background: i === step ? 'var(--gradient-primary)' : 'var(--border-subtle)' }}
            />
          ))}
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="px-6 py-2 rounded-full transition-all disabled:opacity-20"
            style={{ border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', background: 'transparent' }}
            onMouseEnter={(e) => {
              if (step !== 0) {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary)';
                (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-subtle)';
              (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
            }}
          >
            Back
          </button>
          <button 
            onClick={() => setStep(Math.min(slides.length - 1, step + 1))}
            disabled={step === slides.length - 1}
            className="btn-primary px-6 py-2 disabled:opacity-20"
          >
            Next
          </button>
        </div>
      </footer>
    </div>
  );
}
