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
        <h1 className="text-6xl md:text-8xl font-serif italic tracking-tighter text-[#f8fafc] leading-[0.9] mb-8">
          Master anything with <br />
          <span className="text-accent-glow relative inline-block">
            Architected Learning
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ delay: 0.5, duration: 1 }}
              className="absolute -bottom-2 left-0 h-1 bg-accent-glow/30" 
            />
          </span>
        </h1>

        <p className="max-w-xl mx-auto text-[#94a3b8] text-lg font-normal leading-relaxed mb-12 font-sans">
          Personalized AI-driven roadmaps that transform your intellectual curiosity into structured mastery.
        </p>
      </div>

      {/* Search & Launch Section */}
      <div className="w-full flex flex-col items-center gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative w-full max-w-3xl"
        >
          <motion.form 
            onSubmit={(e) => { e.preventDefault(); goal.trim() && onStartGoal(goal); }}
            animate={{ 
              scale: isFocused ? 1.01 : 1,
            }}
            className={`relative flex items-center bg-white/[0.03] border rounded-[2.5rem] p-2 backdrop-blur-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-500 ${isFocused ? 'border-accent-glow/50 ring-4 ring-accent-glow/5' : 'border-white/5 hover:border-white/10'}`}
          >
            {/* Ambient Border Glow (Inactive Only) */}
            {!isFocused && !goal.trim() && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.1, 0.3, 0.1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -inset-[1px] rounded-[2.5rem] border border-accent-glow/30 pointer-events-none"
              />
            )}

            {/* Left Icon Decor */}
            <div className="pl-6 pr-4 flex items-center justify-center">
              <Search className={`w-5 h-5 transition-colors duration-500 ${isFocused || goal.trim() ? 'text-accent-glow' : 'text-text-muted/20'}`} />
            </div>

            <input 
              type="text" 
              value={goal} 
              onChange={(e) => setGoal(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="What path shall we architect today?" 
              className="flex-1 bg-transparent border-none px-4 py-5 text-xl text-text-primary outline-none placeholder:text-text-muted/20 font-serif italic tracking-wide"
            />

            <motion.button
              type="submit"
              disabled={!isNeuralReady || !goal.trim()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative h-[64px] px-10 rounded-[1.75rem] font-black text-[10px] uppercase tracking-[0.25em] flex items-center gap-4 transition-all duration-500 overflow-hidden ${
                isNeuralReady && goal.trim()
                  ? 'bg-accent-glow text-white shadow-[0_10px_30px_rgba(124,111,250,0.3)] opacity-100' 
                  : 'bg-white/[0.02] text-white/10 border border-white/5 opacity-60'
              }`}
            >
              {/* Blueprint Grid for Inactive Button */}
              {!goal.trim() && (
                <div className="absolute inset-0 blueprint-grid opacity-[0.1]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              
              {isNeuralReady ? (
                <>
                  <span className="relative z-10">Initiate Ascent</span>
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </>
              ) : (
                <>
                  <span>Syncing</span>
                  <Loader2 className="w-4 h-4 animate-spin" />
                </>
              )}
            </motion.button>

            {/* Neural Pulse Overlay */}
            <AnimatePresence>
              {isFocused && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 -z-10 rounded-[2rem] bg-accent-glow/[0.02] animate-pulse"
                />
              )}
            </AnimatePresence>
          </motion.form>
          
          {/* Subtle Tip */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: isFocused ? 1 : 0 }}
            className="absolute -bottom-8 left-10 text-[9px] font-black uppercase tracking-[0.2em] text-accent-glow/40 pointer-events-none"
          >
            Press Enter to Architect
          </motion.div>
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
      <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
        <div className="w-full flex items-center gap-6 mb-6">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-accent-glow/20 to-transparent" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-accent-glow/40">Neural Prompt Protocols</span>
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-accent-glow/20 to-transparent" />
        </div>
        {suggestions.map((tag, i) => (
          <motion.button
            key={tag}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
            whileHover={{ 
              scale: 1.05,
              y: -2,
              backgroundColor: "rgba(124,111,250,0.08)"
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { setGoal(tag); onStartGoal(tag); }}
            className="group relative px-6 py-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-accent-glow/40 text-[10px] font-black uppercase tracking-[0.25em] text-text-muted hover:text-white transition-all duration-300 overflow-hidden backdrop-blur-md shadow-lg"
          >
            <div className="absolute inset-0 bg-accent-glow/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-center gap-4">
              <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-accent-glow/20 group-hover:border-accent-glow/40 transition-all duration-500">
                <Sparkles className="w-3.5 h-3.5 text-accent-glow/40 group-hover:text-accent-glow transition-colors" />
              </div>
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

          <div className="space-y-2 border-t border-white/[0.05]">
            {archivedRoadmaps.slice(0, 6).map((record, i) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.08, duration: 0.5 }}
                onClick={() => onSelectRoadmap(record as any)}
                className="group flex flex-col sm:flex-row sm:items-center justify-between py-4 px-4 rounded-xl hover:bg-white/[0.02] border-b border-white/[0.04] transition-all duration-300 cursor-pointer text-left gap-4"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-accent-glow/15 group-hover:border-accent-glow/30 transition-all shrink-0">
                    <Target className="w-4 h-4 text-text-muted group-hover:text-accent-glow transition-colors" />
                  </div>
                  <h3 className="text-base font-serif italic text-text-primary group-hover:text-accent-glow transition-colors truncate">
                    {record.goal}
                  </h3>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0">
                  <div className="text-right">
                    <p className="text-[7px] font-black uppercase tracking-widest text-white/20 mb-0.5">Architected On</p>
                    <p className="text-[9px] font-mono text-text-secondary tracking-tighter">
                      {(() => {
                        if (!record.createdAt) return 'PHASE_01';
                        const date = (record.createdAt as any).toDate ? (record.createdAt as any).toDate() : new Date(record.createdAt as any);
                        return isNaN(date.getTime()) ? 'PHASE_01' : date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase();
                      })()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => handleDelete(e, record.id!)}
                      className="p-2 rounded-lg bg-rose-500/5 text-rose-500/30 hover:text-rose-500 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[8px] font-black uppercase tracking-[0.2em] text-text-muted group-hover:text-accent-glow group-hover:border-accent-glow/20 group-hover:bg-accent-glow/5 transition-all">
                      Protocol <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
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
