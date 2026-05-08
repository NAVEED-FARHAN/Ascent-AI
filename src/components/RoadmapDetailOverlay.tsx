
import { RoadmapNode, UserProgress } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { X, Clock, CheckCircle2, Play, BookOpen, ArrowUpRight } from 'lucide-react';

interface RoadmapDetailOverlayProps {
  node: RoadmapNode;
  progress: UserProgress;
  onClose: () => void;
  onToggleSubTopic: (nodeId: string, subTopicId: string) => void;
}

export default function RoadmapDetailOverlay({
  node,
  progress,
  onClose,
  onToggleSubTopic
}: RoadmapDetailOverlayProps) {
  
  const isNodeCompleted = (n: RoadmapNode) => {
    return n.subTopics.length > 0 && n.subTopics.every(st => progress.completedSubTopicIds.includes(st.id));
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-bg-primary/80 backdrop-blur-md z-[1000]"
      />
      <motion.div
        initial={{ opacity: 0, x: '100%' }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: '100%' }}
        transition={{ type: "spring", damping: 32, stiffness: 280 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-bg-secondary/95 backdrop-blur-3xl border-l border-border-primary z-[1001] shadow-[-20px_0_100px_rgba(0,0,0,0.5)] p-16 overflow-y-auto scrollbar-hide"
      >
        <div className="space-y-16">
          <header className="space-y-10">
            <div className="flex justify-between items-center">
              <button 
                onClick={onClose} 
                className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-text-muted hover:text-text-primary transition-all"
              >
                <div className="w-8 h-8 rounded-full border border-border-pill flex items-center justify-center group-hover:border-accent-glow/50 transition-colors">
                  <X className="w-4 h-4" />
                </div>
                Dismiss Phase
              </button>
              <div className={`px-6 py-2 rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] border ${isNodeCompleted(node) ? 'bg-accent-success/5 text-accent-success border-accent-success/20' : 'bg-accent-glow/5 text-accent-glow border-accent-glow/20'}`}>
                {isNodeCompleted(node) ? 'Protocol Mastered' : 'Active Transmission'}
              </div>
            </div>
            
            <div className="space-y-4">
               <span className="text-[10px] font-black text-accent-glow uppercase tracking-[0.5em] opacity-60">Milestone Directive</span>
               <h2 className="text-6xl md:text-7xl font-serif italic text-text-primary tracking-tighter leading-[0.9]">
                 {node.title}
               </h2>
            </div>
          </header>

          <div className="space-y-10 pb-32">
            {node.subTopics.map((sub, idx) => {
              const isDone = progress.completedSubTopicIds.includes(sub.id);
              return (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`p-10 rounded-[2.5rem] border transition-all duration-500 ${isDone ? 'bg-accent-success/5 border-accent-success/20' : 'bg-bg-primary/40 border-border-pill hover:border-accent-glow/20'}`}
                >
                  <div className="flex justify-between items-start mb-8">
                    <div className="space-y-3">
                      <h4 className="text-3xl font-serif italic text-text-primary leading-tight">{sub.title}</h4>
                      <div className="flex items-center gap-4 text-[10px] font-black text-text-muted uppercase tracking-widest">
                        <span className="flex items-center gap-2 bg-bg-secondary px-3 py-1 rounded-lg border border-border-pill">
                          <Clock className="w-3 h-3 text-accent-glow" /> {sub.estimatedHours}h Duration
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => onToggleSubTopic(node.id, sub.id)}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-xl ${isDone ? 'bg-accent-success text-white scale-110' : 'bg-bg-secondary text-text-muted border border-border-pill hover:text-accent-glow hover:border-accent-glow/50'}`}
                    >
                      <CheckCircle2 className="w-7 h-7" />
                    </button>
                  </div>

                  <p className="text-lg text-text-secondary leading-relaxed font-medium mb-10 italic">
                    {sub.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {sub.resources.map((res, ridx) => (
                      <a
                        key={ridx}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-5 rounded-2xl bg-bg-primary/40 border border-border-pill hover:border-accent-glow/30 transition-all group/link relative overflow-hidden"
                      >
                        <div className="flex items-center gap-4 relative z-10">
                          <div className="w-8 h-8 rounded-lg bg-bg-secondary border border-border-pill flex items-center justify-center">
                            {res.type === 'video' ? <Play className="w-3 h-3 text-accent-glow" /> : <BookOpen className="w-3 h-3 text-accent-glow" />}
                          </div>
                          <span className="text-[10px] font-black text-text-primary uppercase tracking-widest truncate max-w-[120px]">{res.title}</span>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-text-muted group-hover/link:text-accent-glow group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-all relative z-10" />
                        <div className="absolute inset-0 bg-accent-glow/5 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                      </a>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </>
  );
}
