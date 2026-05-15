import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, ArrowRight, Sparkles, 
  Target, Loader2, Zap, History, Trash2
} from 'lucide-react';
import { User } from 'firebase/auth';
import { Roadmap, RoadmapRecord } from '../types';
import { getUserRoadmaps, deleteRoadmapFromCloud } from '../lib/firestore';
import StarBorder from './StarBorder';

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
  const [isFocused, setIsFocused] = useState(false);
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
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-bg-secondary border border-border-pill backdrop-blur-md shadow-sm"
        >
          <Zap className="w-3 h-3 text-accent-glow fill-accent-glow animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">The Guided Ascent</span>
        </motion.div>

        <div className="overflow-hidden">
          <motion.h1 
            initial={{ opacity: 0, y: 40 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl md:text-8xl font-serif italic leading-[1.1] tracking-tight text-text-primary"
          >
            Master anything with<br />
            <span className="text-accent-glow relative inline-block">
              Architected Learning
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 0.8, duration: 1 }}
                className="absolute -bottom-2 left-0 h-[3px] bg-accent-glow/30 rounded-full" 
              />
            </span>
          </motion.h1>
        </div>

        <motion.p 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-text-secondary text-lg md:text-xl max-w-2xl mx-auto font-serif leading-relaxed opacity-60 italic"
        >
          Personalized AI-driven roadmaps that transform your intellectual curiosity into structured mastery.
        </motion.p>
      </div>

      {/* Search & Launch Section */}
      <div className="w-full flex flex-col items-center gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative group w-full max-w-2xl"
        >
          <motion.form 
            onSubmit={(e) => { e.preventDefault(); goal.trim() && onStartGoal(goal); }}
            animate={{ 
              scale: isFocused ? 1.01 : 1,
              boxShadow: isFocused ? '0 0 60px rgba(124,111,250,0.2)' : '0 10px 40px rgba(0,0,0,0.1)'
            }}
            className={`relative flex items-center bg-white/[0.02] border rounded-2xl p-2 backdrop-blur-[32px] overflow-hidden transition-all duration-700 ${isFocused ? 'border-accent-glow/50 bg-white/[0.05] ring-1 ring-accent-glow/20' : 'border-white/[0.08]'}`}
          >
            <input 
              type="text" 
              value={goal} 
              onChange={(e) => setGoal(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="What do you want to learn today?" 
              className="flex-1 bg-transparent border-none px-8 py-6 text-[18px] text-text-primary outline-none placeholder:text-text-muted/40 font-serif italic tracking-wide"
            />
            <StarBorder
              as={motion.button}
              type="submit"
              disabled={!isNeuralReady || !goal.trim()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              speed="2s"
              thickness={2}
              color="#7c6ffa"
              className={`px-8 py-4 shadow-xl transition-all duration-500 rounded-xl ${
                isNeuralReady && goal.trim()
                  ? 'opacity-100 shadow-accent-glow/20' 
                  : 'opacity-40 cursor-not-allowed grayscale'
              }`}
            >
              <div className="flex items-center gap-3 font-black text-[11px] uppercase tracking-widest text-white">
                {isNeuralReady ? (
                  <>Start Journey <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                ) : (
                  <>Synchronizing <Loader2 className="w-4 h-4 animate-spin" /></>
                )}
              </div>
            </StarBorder>

            {/* Neural Sync Pulse */}
            <AnimatePresence>
              {isFocused && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  className="absolute inset-0 -z-10 rounded-2xl bg-accent-glow/5 animate-pulse-subtle"
                />
              )}
            </AnimatePresence>
          </motion.form>
        </motion.div>

        {/* Continue Active Journey Badge */}
        <AnimatePresence mode="wait">
          {roadmap && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex justify-center"
            >
              <button 
                onClick={() => onSelectRoadmap(roadmap)}
                className="group flex items-center gap-4 px-6 py-2.5 rounded-full bg-accent-glow/5 border border-accent-glow/20 hover:border-accent-glow/40 transition-all shadow-[0_0_20px_rgba(124,111,250,0.1)] backdrop-blur-md"
              >
                <div className="w-2 h-2 rounded-full bg-accent-glow animate-pulse shadow-[0_0_8px_rgba(124,111,250,0.8)]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-accent-glow/70">Continue Active Journey</span>
                <span className="text-[11px] font-serif italic text-text-primary group-hover:text-accent-glow transition-colors">{roadmap.goal}</span>
                <ArrowRight className="w-3 h-3 text-accent-glow group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Suggestion Tags */}
      <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
        <div className="w-full flex items-center gap-4 mb-4">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-border-primary" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Prompt Protocols</span>
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-border-primary" />
        </div>
        {suggestions.map((tag, i) => (
          <motion.button
            key={tag}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            onClick={() => { setGoal(tag); onStartGoal(tag); }}
            className="group relative px-6 py-3 rounded-xl bg-bg-secondary/60 border border-border-pill text-[10px] font-black uppercase tracking-[0.2em] text-text-muted hover:text-text-primary transition-all overflow-hidden"
          >
            <div className="absolute inset-0 bg-accent-glow/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center gap-3">
              <Sparkles className="w-3 h-3 text-accent-glow/40 group-hover:text-accent-glow transition-colors" />
              {tag}
            </div>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {archivedRoadmaps.slice(0, 6).map((record, i) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1, duration: 0.5 }}
                onClick={() => onSelectRoadmap(record as any)}
                className="group relative p-8 rounded-[2rem] bg-bg-secondary/30 border border-border-pill hover:border-accent-glow/40 transition-all cursor-pointer overflow-hidden text-left shadow-lg hover:shadow-accent-glow/10"
              >
                {/* Blueprint Grid Texture Overlay */}
                <div className="absolute inset-0 blueprint-grid opacity-[0.03] group-hover:opacity-[0.07] transition-opacity" />
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-10 h-10 rounded-xl bg-accent-glow/10 border border-accent-glow/20 flex items-center justify-center text-accent-glow">
                      <Target className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => handleDelete(e, record.id!)}
                        className="p-2.5 rounded-lg bg-rose-500/5 text-rose-500/20 hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-serif italic text-text-primary mb-4 line-clamp-2 group-hover:text-accent-glow transition-colors leading-tight">
                    {record.goal}
                  </h3>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black uppercase tracking-[0.2em] text-text-muted mb-1">Architected On</span>
                      <span className="text-[10px] font-mono text-text-secondary">
                        {(() => {
                          if (!record.createdAt) return 'PHASE_01';
                          const date = (record.createdAt as any).toDate ? (record.createdAt as any).toDate() : new Date(record.createdAt as any);
                          return isNaN(date.getTime()) ? 'PHASE_01' : date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase();
                        })()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest text-text-muted group-hover:text-accent-glow group-hover:border-accent-glow/20 transition-all">
                      Details <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>

                {/* Hover Glow Effect */}
                <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-accent-glow/10 blur-[60px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
