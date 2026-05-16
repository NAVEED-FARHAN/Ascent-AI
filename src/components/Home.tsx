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
                transition={{ delay: 0.6 + i * 0.1, duration: 0.8, ease: "easeOut" }}
                whileHover={{ 
                  y: -10,
                  transition: { duration: 0.4, ease: "easeOut" }
                }}
                onClick={() => onSelectRoadmap(record as any)}
                className="group relative p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/[0.08] hover:border-accent-glow/30 transition-all duration-500 cursor-pointer overflow-hidden text-left shadow-2xl hover:shadow-accent-glow/10"
              >
                {/* Blueprint Grid Texture Overlay */}
                <div className="absolute inset-0 blueprint-grid opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700" />
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-accent-glow/20 group-hover:border-accent-glow/40 transition-all duration-500 shadow-inner">
                      <Target className="w-6 h-6 text-text-muted group-hover:text-accent-glow transition-colors" />
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => handleDelete(e, record.id!)}
                        className="p-3 rounded-xl bg-rose-500/5 text-rose-500/30 hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100 backdrop-blur-md border border-transparent hover:border-rose-500/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-serif italic text-text-primary mb-6 line-clamp-2 group-hover:text-accent-glow transition-colors leading-tight tracking-tight">
                    {record.goal}
                  </h3>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20 mb-1">Architected On</span>
                      <span className="text-[10px] font-mono text-text-secondary tracking-tighter">
                        {(() => {
                          if (!record.createdAt) return 'PHASE_01';
                          const date = (record.createdAt as any).toDate ? (record.createdAt as any).toDate() : new Date(record.createdAt as any);
                          return isNaN(date.getTime()) ? 'PHASE_01' : date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase();
                        })()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-[0.25em] text-text-muted group-hover:text-accent-glow group-hover:border-accent-glow/30 group-hover:bg-accent-glow/5 transition-all shadow-sm">
                      Protocol <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>

                {/* Hover Glow Effect */}
                <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-accent-glow/10 blur-[60px] rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none" />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
