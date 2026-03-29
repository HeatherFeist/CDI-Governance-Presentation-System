import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  LayoutDashboard, 
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

// Components (to be created)
// import Dashboard from "./pages/Dashboard";
// import PresentationEngine from "./pages/PresentationEngine";
// import Onboarding from "./pages/Onboarding";

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
      <div className="flex items-center justify-center min-h-screen bg-neutral-50">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <Router>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans">
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
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 text-center"
      >
        <div className="space-y-2">
          <h1 className="text-4xl font-light tracking-tight text-neutral-900">
            Constructive Designs Inc.
          </h1>
          <p className="text-neutral-500 italic font-serif">
            Governance & Organizational Memory System
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-100 space-y-6">
          <p className="text-sm text-neutral-600">
            Enter your organization’s Google Workspace domain to begin.
          </p>
          
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="e.g. constructive-designs.org"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all text-center"
            />
            
            <button 
              onClick={handleStart}
              disabled={isSettingUp}
              className="w-full bg-neutral-900 text-white py-3 rounded-xl font-medium hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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

        <p className="text-xs text-neutral-400 max-w-xs mx-auto">
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
          <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-400">
            {org?.domain || "Organization"}
          </h2>
          <h1 className="text-4xl font-light">Governance Dashboard</h1>
        </div>
        <div className="flex gap-4">
          <button className="p-2 rounded-full hover:bg-neutral-200 transition-all">
            <Settings className="w-5 h-5 text-neutral-600" />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-2 space-y-6">
          <h3 className="text-xl font-serif italic">12-Month Governance Cycle</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div 
                key={i}
                className="bg-white p-6 rounded-2xl border border-neutral-100 hover:border-neutral-300 transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-2xl font-serif text-neutral-300 group-hover:text-neutral-900 transition-all">
                    {(i + 1).toString().padStart(2, '0')}
                  </span>
                  {i === 0 && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                </div>
                <h4 className="font-medium text-sm">Month {i + 1} Packet</h4>
                <p className="text-xs text-neutral-400 mt-1">Ready for review</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-neutral-900 text-white p-8 rounded-3xl space-y-6">
            <h3 className="text-2xl font-light">Next Meeting</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-neutral-400">
                <Calendar className="w-4 h-4" />
                <span>April 15, 2026 @ 10:00 AM</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-neutral-400">
                <FolderTree className="w-4 h-4" />
                <span>Month 01 Packet</span>
              </div>
            </div>
            <button 
              onClick={() => navigate("/present/month-01")}
              className="w-full bg-white text-neutral-900 py-3 rounded-xl font-medium hover:bg-neutral-100 transition-all flex items-center justify-center gap-2"
            >
              <Presentation className="w-4 h-4" />
              Start Presentation
            </button>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-neutral-400">Quick Links</h3>
            <div className="space-y-2">
              {["Agenda Template", "Action Tracker", "Decision Log", "Mentor Feedback"].map((link) => (
                <a 
                  key={link}
                  href="#" 
                  className="flex items-center justify-between p-4 bg-white rounded-xl border border-neutral-100 hover:bg-neutral-50 transition-all text-sm"
                >
                  {link}
                  <ArrowRight className="w-4 h-4 text-neutral-300" />
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
    { type: 'intro', title: "Constructive Designs Inc.", subtitle: "Month 01 Governance Meeting", content: "Building the future, one decision at a time." },
    { type: 'mission', title: "Our Mission", subtitle: "Grounding", content: "To design and construct sustainable, innovative, and human-centric environments." },
    { type: 'snapshot', title: "Monthly Snapshot", subtitle: "Where We Are Now", content: "Chapter writing is 40% complete. Mentor feedback is positive. Action items from last month are 80% resolved." },
    { type: 'vision', title: "Monthly Vision", subtitle: "Where We're Headed", content: "Finalizing the chapter outline and onboarding 3 new board members." },
    { type: 'topic', title: "Chapter Writing", subtitle: "Topic 01", data: { now: "40% complete", headed: "Finalize outline" } },
    { type: 'mentor', title: "Mentor Feedback", subtitle: "Reflection", content: "Mentors suggest focusing more on the 'Community' section of the chapter." },
    { type: 'chapter', title: "Chapter Progress", subtitle: "Dashboard", content: "Current focus: Section 2 - Sustainable Materials." },
    { type: 'closing', title: "Meeting Summary", subtitle: "Next Steps", content: "Voted items have been moved to next month's vision for action planning." },
  ];

  return (
    <div className="h-screen bg-neutral-900 text-white flex flex-col overflow-hidden">
      <header className="p-6 flex justify-between items-center border-b border-white/10 z-10">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-neutral-900 font-bold text-xs">
            CDI
          </div>
          <span className="text-sm font-medium opacity-50">Month 01 Governance Meeting</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowScript(!showScript)}
            className={`px-4 py-1 rounded-full text-xs font-medium transition-all ${showScript ? 'bg-white text-neutral-900' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            Director's Script
          </button>
          <button 
            onClick={() => navigate("/dashboard")}
            className="text-sm opacity-50 hover:opacity-100 transition-all flex items-center gap-2"
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
              className="absolute top-0 right-0 h-full w-80 bg-white text-neutral-900 p-8 shadow-2xl z-20 overflow-y-auto"
            >
              <div className="space-y-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400">Director's Script</h3>
                <div className="space-y-4 text-sm leading-relaxed">
                  <p className="font-bold">Slide {step + 1}: {slides[step].title}</p>
                  <div className="text-neutral-600 italic space-y-2">
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
                  <p className="text-neutral-500">
                    {slides[step].type === 'topic' ? "Focus on guiding the group from vision to concrete action steps during the brainstorm." : "Focus on setting a welcoming tone."}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="p-6 flex justify-between items-center border-t border-white/10 z-10">
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <div 
              key={i}
              className={`h-1 w-8 rounded-full transition-all ${i === step ? 'bg-white' : 'bg-white/20'}`}
            />
          ))}
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="px-6 py-2 rounded-full border border-white/20 hover:bg-white/10 transition-all disabled:opacity-20"
          >
            Back
          </button>
          <button 
            onClick={() => setStep(Math.min(slides.length - 1, step + 1))}
            disabled={step === slides.length - 1}
            className="px-6 py-2 rounded-full bg-white text-neutral-900 font-medium hover:bg-neutral-200 transition-all disabled:opacity-20"
          >
            Next
          </button>
        </div>
      </footer>
    </div>
  );
}
