import { motion } from "motion/react";
import { Brain, Vote, Play, CheckCircle2 } from "lucide-react";

interface SlideProps {
  type: 'intro' | 'mission' | 'snapshot' | 'vision' | 'topic' | 'mentor' | 'chapter' | 'closing';
  title: string;
  subtitle?: string;
  content?: string;
  data?: any;
}

export default function Slide({ type, title, subtitle, content, data }: SlideProps) {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.8, 
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-5xl w-full space-y-12"
    >
      <div className="space-y-4">
        <motion.h2 
          variants={itemVariants}
          className="text-sm font-semibold uppercase tracking-[0.4em] text-neutral-500"
        >
          {subtitle || type}
        </motion.h2>
        <motion.h1 
          variants={itemVariants}
          className="text-7xl md:text-9xl font-light tracking-tight leading-none"
        >
          {title}
        </motion.h1>
      </div>

      {content && (
        <motion.p 
          variants={itemVariants}
          className="text-2xl md:text-3xl font-serif italic text-neutral-400 max-w-3xl mx-auto leading-relaxed"
        >
          {content}
        </motion.p>
      )}

      {type === 'topic' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          <motion.div variants={itemVariants} className="bg-white/5 p-8 rounded-3xl border border-white/10 text-left space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500">Where We Are Now</h3>
            <p className="text-lg text-neutral-300">{data?.now || "Grounding data..."}</p>
          </motion.div>
          <motion.div variants={itemVariants} className="bg-white/5 p-8 rounded-3xl border border-white/10 text-left space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500">Where We're Headed</h3>
            <p className="text-lg text-neutral-300">{data?.headed || "Vision data..."}</p>
          </motion.div>
          <motion.button variants={itemVariants} className="flex items-center justify-between p-6 bg-white text-neutral-900 rounded-2xl font-medium hover:bg-neutral-200 transition-all">
            <div className="flex items-center gap-4">
              <Brain className="w-6 h-6" />
              <span>Interactive Brainstorming</span>
            </div>
            <Play className="w-4 h-4" />
          </motion.button>
          <motion.button variants={itemVariants} className="flex items-center justify-between p-6 bg-white/10 text-white rounded-2xl font-medium hover:bg-white/20 transition-all border border-white/10">
            <div className="flex items-center gap-4">
              <Vote className="w-6 h-6" />
              <span>Cast Your Vote</span>
            </div>
            <Play className="w-4 h-4" />
          </motion.button>
        </div>
      )}

      {type === 'closing' && (
        <div className="space-y-6 mt-12">
          <motion.div variants={itemVariants} className="flex items-center justify-center gap-4 text-green-400">
            <CheckCircle2 className="w-8 h-8" />
            <span className="text-2xl">All priorities confirmed.</span>
          </motion.div>
          <motion.p variants={itemVariants} className="text-neutral-500">
            Next month's meeting packet has been auto-generated.
          </motion.p>
        </div>
      )}
    </motion.div>
  );
}
