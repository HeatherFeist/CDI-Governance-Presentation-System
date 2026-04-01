import { motion } from "motion/react";
import { Brain, Vote, Play, CheckCircle2 } from "lucide-react";

export interface SlideProps {
  type: 'intro' | 'mission' | 'snapshot' | 'vision' | 'topic' | 'mentor' | 'chapter' | 'closing';
  title: string;
  subtitle?: string;
  content?: string;
  data?: any;
  key?: any;
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
          className="text-sm font-semibold uppercase tracking-[0.4em]"
          style={{ color: 'var(--text-muted)' }}
        >
          {subtitle || type}
        </motion.h2>
        <motion.h1 
          variants={itemVariants}
          className="text-7xl md:text-9xl font-extrabold tracking-tight leading-none gradient-text"
        >
          {title}
        </motion.h1>
      </div>

      {content && (
        <motion.p 
          variants={itemVariants}
          className="text-2xl md:text-3xl max-w-3xl mx-auto leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
        >
          {content}
        </motion.p>
      )}

      {type === 'topic' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          <motion.div
            variants={itemVariants}
            className="glass p-8 text-left space-y-4"
          >
            <h3
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: 'var(--text-muted)' }}
            >
              1. Where We Are Now
            </h3>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>{data?.now || "Grounding data..."}</p>
          </motion.div>
          <motion.div
            variants={itemVariants}
            className="glass p-8 text-left space-y-4"
          >
            <h3
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: 'var(--text-muted)' }}
            >
              2. Where We're Headed
            </h3>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>{data?.headed || "Vision data..."}</p>
          </motion.div>
          <motion.button
            variants={itemVariants}
            className="btn-primary flex items-center justify-between p-6 rounded-2xl font-semibold w-full"
          >
            <div className="flex items-center gap-4">
              <Brain className="w-6 h-6" />
              <span>3. Brainstorming & Action Planning</span>
            </div>
            <Play className="w-4 h-4" />
          </motion.button>
          <motion.button
            variants={itemVariants}
            className="flex items-center justify-between p-6 rounded-2xl font-semibold w-full transition-all"
            style={{
              background: 'rgba(45,104,255,0.1)',
              color: 'var(--text-primary)',
              border: '1px solid rgba(45,104,255,0.3)',
            }}
          >
            <div className="flex items-center gap-4">
              <Vote className="w-6 h-6" style={{ color: 'var(--cyan)' }} />
              <span>4. Final Vote & Decision</span>
            </div>
            <Play className="w-4 h-4" />
          </motion.button>
        </div>
      )}

      {type === 'closing' && (
        <div className="space-y-6 mt-12">
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-center gap-4"
            style={{ color: 'var(--cyan)' }}
          >
            <CheckCircle2 className="w-8 h-8" />
            <span className="text-2xl font-semibold">Decisions Voted & Confirmed.</span>
          </motion.div>
          <motion.p variants={itemVariants} style={{ color: 'var(--text-muted)' }}>
            Voted items have been automatically added to next month's "Where We're Headed" vision.
          </motion.p>
        </div>
      )}
    </motion.div>
  );
}
