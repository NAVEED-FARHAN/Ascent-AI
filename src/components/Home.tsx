import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, ArrowRight, Sparkles, 
  Target, Loader2, Zap, History, Trash2
} from 'lucide-react';
import { User } from 'firebase/auth';
import { Roadmap, RoadmapRecord } from '../types';
import { getUserRoadmaps, deleteRoadmapFromCloud } from '../lib/firestore';

interface HomeProps {
  user: User | null;
  roadmap: Roadmap | null;
  onSelectRoadmap: (roadmap: Roadmap) => void;
  onStartGoal: (goal: string) => void;
  onResetSystem: () => Promise<void>;
  onClearActiveRoadmap: () => void;
  onShowModal: (config: any) => void;
  isNeuralReady: boolean;
}

export default function Home({ 
  user, roadmap, onSelectRoadmap, onStartGoal, onClearActiveRoadmap, onShowModal, isNeuralReady 
}: HomeProps) {
  const [goal, setGoal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [archivedRoadmaps, setArchivedRoadmaps] = useState<RoadmapRecord[]>([]);

  const loadHistory = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const history = await getUserRoadmaps(user.uid);
      setArchivedRoadmaps(history as any);
    } catch (err) {
      console.error("History load failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [user]);

  const handleDelete = async (e: React.MouseEvent, roadmapId: string) => {
    e.stopPropagation();
    onShowModal({
      title: "Eliminate Path",
      message: "Permanently erase this architecture from your cloud profile?",
      type: 'danger', confirmText: "Erase Path",
      onConfirm: async () => {
        try {
          setArchivedRoadmaps(prev => prev.filter(r => r.id !== roadmapId));
          await deleteRoadmapFromCloud(user!.uid, roadmapId);
          if (roadmap?.id === roadmapId) onClearActiveRoadmap();
          setTimeout(() => loadHistory(), 800);
        } catch (err) { console.error("Deletion failed:", err); }
      }
    });
  };

  const suggestions = [
    "Master Sustainable Architecture",
    "Learn Quantum Computing Basics",
    "Design a High-Conversion Landing Page"
  ];

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center max-w-5xl mx-auto space-y-16 py-20">
      
      {/* Hero Section */}
      <div className="space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-bg-secondary border border-border-pill backdrop-blur-md"
        >
          <Zap className="w-3 h-3 text-accent-glow fill-accent-glow" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">The Guided Ascent</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-6xl md:text-8xl font-serif italic leading-[1.1] tracking-tight"
        >
          Master anything with<br />
          <span className="text-accent-glow underline decoration-accent-glow/20 underline-offset-8">Architected Learning</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-text-secondary text-lg md:text-xl max-w-2xl mx-auto font-serif leading-relaxed"
        >
          Personalized AI-driven roadmaps that transform your intellectual curiosity into structured mastery.
        </motion.p>
      </div>

      {/* Search & Launch Section */}
      <div className="w-full max-w-3xl space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative group"
        >
          <div className="absolute -inset-1 bg-accent-glow/10 blur-2xl group-focus-within:opacity-40 transition-opacity" />
          <div className="relative flex items-center bg-bg-secondary border border-border-primary rounded-[2.5rem] p-2 backdrop-blur-3xl shadow-2xl overflow-hidden group-focus-within:border-accent-glow/50 transition-all">
            <input 
              type="text" 
              value={goal} 
              onChange={(e) => setGoal(e.target.value)}
              placeholder="What do you want to learn today?" 
              className="flex-1 bg-transparent border-none px-8 py-6 text-xl text-text-primary outline-none placeholder:text-text-placeholder font-serif italic"
              onKeyDown={(e) => e.key === 'Enter' && goal.trim() && onStartGoal(goal)}
            />
            <button 
              disabled={!isNeuralReady || !goal.trim()}
              onClick={() => onStartGoal(goal)}
              className={`px-8 py-5 rounded-[2rem] font-black uppercase tracking-widest text-[11px] transition-all flex items-center gap-3 shadow-lg ${
                isNeuralReady && goal.trim()
                  ? 'bg-accent-glow text-white hover:bg-accent-glow/80 active:scale-[0.98]' 
                  : 'bg-bg-track text-text-muted border border-border-primary cursor-not-allowed'
              }`}
            >
              {isNeuralReady ? (
                <>Start Journey <ArrowRight className="w-4 h-4" /></>
              ) : (
                <>Synchronizing <Loader2 className="w-4 h-4 animate-spin" /></>
              )}
            </button>
          </div>
        </motion.div>

        {/* Continue Active Journey Badge */}
        <AnimatePresence>
          {roadmap && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex justify-center"
            >
              <button 
                onClick={() => onSelectRoadmap(roadmap)}
                className="group flex items-center gap-3 px-6 py-3 rounded-full bg-bg-secondary border border-border-pill hover:border-accent-glow/30 transition-all shadow-md"
              >
                <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Continue Active Journey:</span>
                <span className="text-[11px] font-serif italic text-text-primary group-hover:text-accent-glow transition-colors">{roadmap.goal}</span>
                <ArrowRight className="w-3 h-3 text-accent-glow" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Suggestion Tags */}
      <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted w-full mb-2">Try starting with:</span>
        {suggestions.map((tag, i) => (
          <motion.button
            key={tag}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + i * 0.1 }}
            onClick={() => { setGoal(tag); onStartGoal(tag); }}
            className="px-5 py-2.5 rounded-xl bg-bg-secondary border border-border-pill text-[10px] font-black uppercase tracking-[0.2em] text-text-muted hover:bg-accent-glow/10 hover:text-accent-glow hover:border-accent-glow/30 transition-all"
          >
            {tag}
          </motion.button>
        ))}
      </div>

      {/* Recent Architectures Section */}
      {!isLoading && archivedRoadmaps.length > 0 && (
        <div className="w-full max-w-5xl space-y-8 pt-10">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <History className="w-4 h-4 text-text-muted" />
              <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-text-muted">Recent Architectures</h2>
            </div>
            <div className="h-[1px] flex-1 bg-border-primary mx-8" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {archivedRoadmaps.slice(0, 6).map((record, i) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                onClick={() => onSelectRoadmap(record as any)}
                className="group relative p-6 rounded-[2rem] bg-bg-secondary/40 border border-border-pill hover:border-accent-glow/20 transition-all cursor-pointer overflow-hidden text-left shadow-sm"
              >
                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 transition-opacity">
                  <Sparkles className="w-12 h-12 text-accent-glow" />
                </div>
                
                <h3 className="text-sm font-serif italic text-text-primary mb-2 line-clamp-1 group-hover:text-accent-glow transition-colors">
                  {record.goal}
                </h3>
                
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">
                    {(() => {
                      if (!record.createdAt) return 'Phase 1';
                      const date = (record.createdAt as any).toDate ? (record.createdAt as any).toDate() : new Date(record.createdAt as any);
                      return isNaN(date.getTime()) ? 'Phase 1' : date.toLocaleDateString();
                    })()}
                  </span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => handleDelete(e, record.id!)}
                      className="p-2 rounded-lg bg-rose-500/10 text-rose-500/40 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-6 h-6 rounded-lg bg-accent-glow/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                      <ArrowRight className="w-3 h-3 text-accent-glow" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
