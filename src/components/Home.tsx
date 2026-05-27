import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, ArrowRight, 
  Target, Loader2, Zap, Trash2,
  ArrowLeft, Flame, ClipboardList, 
  BookOpen, ChevronRight, Compass,
  LogOut
} from 'lucide-react';
import { User } from 'firebase/auth';
import { Roadmap, RoadmapRecord } from '../types';
import { getUserRoadmaps, deleteRoadmapFromCloud } from '../lib/firestore';
import { KnowledgeLevel } from '../lib/gemini';

interface HomeProps {
  user: User | null;
  roadmap: Roadmap | null;
  onSelectRoadmap: (roadmap: Roadmap) => void;
  onStartGoal: (goal: string, level: KnowledgeLevel) => void;
  onResetSystem: () => Promise<void>;
  onClearActiveRoadmap: () => void;
  onShowModal: (config: any) => void;
  isNeuralReady: boolean;
  onLogout: () => void;
  onSetView: (view: any) => void;
}

const levelsConfig = [
  {
    id: 'test' as const,
    label: 'Take a Test',
    tagline: 'Discover your level',
    description: 'Quick diagnostic to pinpoint where you stand.',
    comingSoon: true,
    icon: ClipboardList,
    accent: 'text-sky-400',
    border: 'border-sky-500/20'
  },
  {
    id: 'fresher' as const,
    label: 'Fresher',
    tagline: 'Just starting out',
    description: 'Absolute zero. Fundamentals, analogies, and patient guidance.',
    icon: Zap,
    accent: 'text-amber-400',
    border: 'border-amber-500/20'
  },
  {
    id: 'beginner' as const,
    label: 'Beginner',
    tagline: 'Know the basics',
    description: 'Core foundation. Balanced theory, depth, and practice.',
    icon: Target,
    accent: 'text-accent-glow',
    border: 'border-accent-glow/20'
  },
  {
    id: 'intermediate' as const,
    label: 'Intermediate',
    tagline: 'Building real things',
    description: 'System architect. Production patterns and scale.',
    icon: Flame,
    accent: 'text-rose-400',
    border: 'border-rose-500/20'
  }
];

export default function Home({ 
  user, roadmap, onSelectRoadmap, onStartGoal, onClearActiveRoadmap, onShowModal, isNeuralReady, onLogout, onSetView 
}: HomeProps) {
  const [goal, setGoal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [archivedRoadmaps, setArchivedRoadmaps] = useState<RoadmapRecord[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<KnowledgeLevel>('beginner');
  const [showLevelPicker, setShowLevelPicker] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Close profile menu on outside click
  useEffect(() => {
    const handleClick = () => setIsProfileOpen(false);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

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
    { icon: BookOpen, text: "Master Sustainable Architecture" },
    { icon: Compass, text: "Learn Quantum Computing Basics" },
    { icon: Target, text: "Design a High-Conversion Landing Page" }
  ];

  const handleSelectLevelAndStart = (level: KnowledgeLevel) => {
    setSelectedLevel(level);
    setShowLevelPicker(false);
    onStartGoal(goal, level);
  };

  const formatDate = (dateVal: any) => {
    if (!dateVal) return '';
    const date = dateVal.toDate ? dateVal.toDate() : new Date(dateVal);
    return isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
  };

  const getCompletionPercent = (record: RoadmapRecord) => {
    if (!record.nodes?.length) return 0;
    const completed = record.nodes.filter(n => n.isCompleted).length;
    return Math.round((completed / record.nodes.length) * 100);
  };

  const stagger = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.08 } },
    exit: { opacity: 0, transition: { staggerChildren: 0.03, staggerDirection: -1, when: "afterChildren" } }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
  };

  return (
    <div className="min-h-screen flex flex-col items-center relative">
      {/* ═══ FULL-BLEED BACKGROUND ═══ */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <img 
          src="/home-bg.jpg" 
          alt=""
          className="w-full h-full object-cover"
          style={{ filter: 'saturate(1.1) brightness(0.35)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-bg-primary/70 via-bg-primary/40 to-bg-primary/80" />
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-accent-glow/[0.06] to-transparent" />

      </div>

      {/* ═══ TOP BAR: Logo + Profile ═══ */}
      <div className="fixed top-0 left-0 right-0 z-[200] flex items-center justify-between px-6 sm:px-8 py-4">
        {/* Left: Logo */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex items-center gap-3 group cursor-pointer"
          onClick={() => onSetView('landing')}
        >
          <div className="relative flex items-center justify-center">
            <img src="/logo.ico" alt="Ascent AI" className="w-8 h-8 group-hover:scale-110 transition-transform duration-300 object-contain" />
            <div className="absolute inset-0 bg-accent-glow/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="hidden sm:inline text-sm font-serif italic font-medium text-text-primary tracking-tight">
            Ascent <span className="text-accent-glow">AI</span>
          </span>
        </motion.div>

        {/* Right: Profile */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2.5 p-1 pr-3 rounded-full bg-white/[0.04] border border-white/10 hover:border-accent-glow/25 transition-all group"
            >
              <div className="w-8 h-8 rounded-full border border-accent-glow/25 overflow-hidden">
                <img src={user.photoURL || ''} alt="" className="w-full h-full object-cover" />
              </div>
              <span className="text-xs font-medium text-text-primary/70 group-hover:text-text-primary transition-colors max-w-[60px] truncate hidden sm:inline">
                {user.displayName?.split(' ')[0]}
              </span>
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full right-0 mt-3 w-56 py-2 rounded-2xl bg-bg-surface/95 border border-white/10 shadow-2xl backdrop-blur-2xl z-[200] overflow-hidden"
                >
                  <div className="px-5 py-3 border-b border-white/5">
                    <p className="text-[9px] font-medium text-text-muted/40 uppercase tracking-wider mb-1">Account</p>
                    <h3 className="text-sm font-semibold truncate text-text-primary">{user.displayName}</h3>
                    <p className="text-[11px] text-accent-glow/70 font-medium truncate mt-0.5">{user.email}</p>
                  </div>
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-5 py-2.5 text-xs font-medium text-text-muted/50 hover:text-red-400 hover:bg-red-500/5 transition-all"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <div className="w-full max-w-[90rem] px-6 sm:px-8 pt-20 sm:pt-24 pb-8 sm:pb-12 flex flex-col items-center gap-8">
        <AnimatePresence mode="wait">
          {!showLevelPicker ? (
            <motion.div
              key="home-main"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              {/* ═══ CENTERED GLASS CARD ═══ */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="w-full rounded-xl border border-accent-glow/[0.12] backdrop-blur-md overflow-hidden"
                style={{ backgroundColor: 'rgba(124, 111, 250, 0.06)' }}
              >
                {/* ─── Two-Column Main Content ─── */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 sm:gap-16 px-10 sm:px-14 py-14 sm:py-16">
                  {/* Left Column — Decorative Image */}
                  <div className="lg:col-span-2 hidden lg:block">
                    <div className="relative h-full min-h-[480px] rounded-xl overflow-hidden">
                      <img
                        src="/home-hero.jpg"
                        alt=""
                        className="w-full h-full object-cover rounded-xl"
                      />
                      {/* Decorative corner accents */}
                      <div className="absolute top-3 left-3 w-5 h-5 border-t border-l border-white/10 rounded-sm" />
                      <div className="absolute top-3 right-3 w-5 h-5 border-t border-r border-white/10 rounded-sm" />
                      <div className="absolute bottom-3 left-3 w-5 h-5 border-b border-l border-white/10 rounded-sm" />
                      <div className="absolute bottom-3 right-3 w-5 h-5 border-b border-r border-white/10 rounded-sm" />
                    </div>
                  </div>

                  {/* Right Column — Content */}
                  <div className="lg:col-span-3 flex flex-col justify-center space-y-8 sm:space-y-10">
                    {/* Heading */}
                    <div className="space-y-1">
                      <motion.h1 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                        className="text-3xl sm:text-4xl lg:text-5xl 2xl:text-6xl font-serif italic text-text-primary leading-tight"
                      >
                        What would you like to
                        <br />
                        <span className="text-accent-glow">master today?</span>
                      </motion.h1>

                      {/* Section title + divider */}
                      <div className="pt-3 pb-1 space-y-1.5">
                        <h3 className="text-sm font-medium text-accent-glow/70 tracking-wide">
                          Your Quest
                        </h3>
                        <div className="h-px bg-gradient-to-r from-accent-glow/30 via-accent-glow/10 to-transparent" />
                      </div>
                    </div>

                    {/* Subtitle */}
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                      className="text-sm sm:text-base text-text-muted/60 font-light leading-relaxed max-w-lg"
                    >
                      AI-powered roadmaps — personalized to your level and goals. Tell us what you want to build and we'll architect your path.
                    </motion.p>

                    {/* ═══ SEARCH BAR ═══ */}
                    <motion.form 
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25, duration: 0.5 }}
                      onSubmit={(e) => { e.preventDefault(); goal.trim() && setShowLevelPicker(true); }}
                      className="relative group"
                    >
                      <div className="
                        relative flex items-center gap-2 p-2 rounded-2xl border backdrop-blur-2xl
                        transition-all duration-400
                        bg-white/[0.08] border-white/20
                        shadow-lg shadow-black/20
                        hover:bg-accent-glow/[0.06] hover:border-accent-glow/25 hover:shadow-accent-glow/8
                      ">
                        {/* Search icon */}
                        <div className="flex items-center justify-center pl-5 pr-2">
                          <Search className="w-5 h-5 text-text-secondary/50 group-hover:text-accent-glow transition-colors duration-400" />
                        </div>

                        <input 
                          type="text" 
                          value={goal} 
                          onChange={(e) => setGoal(e.target.value)}
                          placeholder="e.g. Master React, Learn Piano, Build a SaaS..." 
                          className="flex-1 bg-transparent border-none py-[18px] text-base sm:text-lg text-text-primary outline-none placeholder:text-text-muted/20 font-light tracking-wide"
                        />

                        <motion.button
                          type="submit"
                          disabled={!isNeuralReady || !goal.trim()}
                          whileHover={isNeuralReady && goal.trim() ? { scale: 1.02 } : {}}
                          whileTap={isNeuralReady && goal.trim() ? { scale: 0.97 } : {}}
                          className={`
                            mr-1.5 px-5 py-[13px] rounded-xl text-sm font-medium flex items-center gap-2
                            transition-all duration-300
                            ${isNeuralReady && goal.trim()
                              ? 'bg-accent-glow text-white shadow-md shadow-accent-glow/20 hover:bg-white hover:text-accent-glow hover:shadow-lg hover:shadow-accent-glow/25' 
                              : 'bg-white/[0.06] text-text-muted/35 border border-white/10'
                            }
                          `}
                        >
                          {isNeuralReady ? (
                            <>
                              <span>Build</span>
                              <ArrowRight className="w-4 h-4" />
                            </>
                          ) : (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Syncing</span>
                            </>
                          )}
                        </motion.button>
                      </div>
                    </motion.form>

                    {/* Active Journey (inside card) */}
                    <AnimatePresence>
                      {roadmap && (
                        <motion.div
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.4 }}
                        >
                          <button
                            onClick={() => onSelectRoadmap(roadmap)}
                            className="group relative w-full overflow-hidden rounded-xl border border-accent-glow/15 bg-white/[0.03] backdrop-blur-xl p-4 text-left transition-all duration-400 hover:border-accent-glow/30 hover:bg-white/[0.05]"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-accent-glow shadow-[0_0_10px_rgba(124,111,250,0.5)] animate-pulse shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-[9px] font-medium uppercase tracking-wider text-accent-glow/50 mb-0.5">
                                  Active Journey
                                </p>
                                <p className="text-sm font-serif italic text-text-primary truncate group-hover:text-accent-glow transition-colors duration-200">
                                  {roadmap.goal}
                                </p>
                              </div>
                              <ChevronRight className="w-4 h-4 text-text-muted/30 group-hover:text-accent-glow group-hover:translate-x-1 transition-all duration-200 shrink-0" />
                            </div>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* ═══ SUGGESTION CHIPS ═══ */}
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                    >
                      <div className="flex flex-wrap gap-2.5">
                        {suggestions.map((s, i) => (
                          <motion.button
                            key={s.text}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.35 + i * 0.06, duration: 0.4 }}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => { setGoal(s.text); setShowLevelPicker(true); }}
                            className="group flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-300
                              bg-accent-glow/12 border-accent-glow/25
                              hover:bg-white/[0.12] hover:border-white/30
                              text-xs text-accent-glow/80 hover:text-white"
                          >
                            <s.icon className="w-3.5 h-3.5 text-accent-glow/50 group-hover:text-white/70 transition-colors duration-300" />
                            <span>{s.text}</span>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </div>

              </motion.div>

              {/* ═══ PROJECTS GALLERY (glass cards below main card) ═══ */}
              <motion.div 
                id="projects-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="w-full pt-12 pb-8"
              >
                {/* Section Header */}
                <div className="relative mb-6">
                  <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-accent-glow/15 to-transparent" />
                    <span className="text-[10px] font-medium uppercase tracking-widest text-text-muted/30 whitespace-nowrap">
                      {archivedRoadmaps.length > 0 ? 'Recent Projects' : 'Your Projects'}
                    </span>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent via-accent-glow/15 to-transparent" />
                  </div>
                </div>

                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-5 h-5 text-accent-glow/40 animate-spin" />
                  </div>
                ) : archivedRoadmaps.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full rounded-xl border border-accent-glow/[0.08] backdrop-blur-xl p-10 text-center"
                    style={{ backgroundColor: 'rgba(124, 111, 250, 0.04)' }}
                  >
                    <div className="w-14 h-14 mx-auto rounded-2xl border border-accent-glow/[0.12] bg-accent-glow/[0.04] flex items-center justify-center mb-4 backdrop-blur-md">
                      <BookOpen className="w-6 h-6 text-accent-glow/30" />
                    </div>
                    <p className="text-sm text-text-muted/30 font-light">
                      Your projects will appear here
                    </p>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {archivedRoadmaps.map((record, i) => {
                      const dateLabel = formatDate(record.createdAt);
                      const completion = getCompletionPercent(record);
                      return (
                        <motion.div
                          key={record.id}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
                          whileHover={{ y: -3, scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => onSelectRoadmap(record as any)}
                          className="group relative cursor-pointer rounded-xl border border-accent-glow/[0.10] backdrop-blur-2xl p-5 transition-all duration-400 hover:border-accent-glow/25 hover:shadow-lg hover:shadow-accent-glow/10"
                          style={{ backgroundColor: 'rgba(124, 111, 250, 0.05)' }}
                        >
                          {/* Top accent line */}
                          <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-accent-glow/0 via-accent-glow/30 to-accent-glow/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                          {/* Top row: title + delete */}
                          <div className="flex items-start justify-between gap-3 mb-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-serif italic text-text-primary group-hover:text-accent-glow transition-colors duration-200 line-clamp-1">
                                {record.goal}
                              </h3>
                              <p className="text-[10px] text-text-muted/30 font-mono mt-0.5">
                                {dateLabel}
                              </p>
                            </div>
                            <button
                              onClick={(e) => handleDelete(e, record.id!)}
                              className="p-1.5 rounded-lg text-rose-400/20 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200 opacity-0 group-hover:opacity-100 shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Completion status */}
                          <div className="flex items-center gap-3 mb-5">
                            <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                              <div 
                                className="h-full rounded-full bg-accent-glow/60 transition-all duration-700"
                                style={{ width: `${Math.max(completion, 2)}%` }}
                              />
                            </div>
                            <span className="text-[11px] font-mono text-accent-glow/60 font-medium">
                              {completion}%
                            </span>
                          </div>

                          {/* Bottom row: spacer + arrow button */}
                          <div className="flex items-center justify-end pt-2">
                            <div className="w-8 h-8 rounded-lg bg-accent-glow/[0.08] border border-accent-glow/15 flex items-center justify-center group-hover:bg-accent-glow/15 group-hover:border-accent-glow/30 group-hover:scale-105 transition-all duration-300">
                              <ChevronRight className="w-4 h-4 text-accent-glow/50 group-hover:text-accent-glow group-hover:translate-x-0.5 transition-all duration-300" />
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </motion.div>
          ) : (
            /* ═══ LEVEL PICKER (inside glass card aesthetic) ═══ */
            <motion.div
              key="level-picker"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
              className="w-full"
            >
              {/* Glass card wrapper for level picker */}
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full rounded-xl border border-accent-glow/[0.12] backdrop-blur-2xl p-6 sm:p-8 lg:p-10"
                style={{ backgroundColor: 'rgba(124, 111, 250, 0.06)' }}
              >
                {/* Header */}
                <div className="text-left space-y-5 max-w-lg mb-8">
                  {/* Back button */}<motion.button
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    onClick={() => setShowLevelPicker(false)}
                    className="flex items-center gap-1.5 text-xs text-text-muted/40 hover:text-text-primary transition-colors group"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                    Change goal
                  </motion.button>

                  <h2 className="text-3xl sm:text-4xl font-serif italic text-text-primary leading-tight">
                    Choose your<span className="text-accent-glow"> starting point</span>
                  </h2>
                  
                  <div className="px-5 py-3 rounded-xl bg-white/[0.02] border border-accent-glow/15 backdrop-blur-md inline-block">
                    <p className="text-[10px] text-text-muted/40 uppercase tracking-wider mb-1">Blueprint</p>
                    <p className="text-base sm:text-lg font-serif italic text-accent-glow">&quot;{goal}&quot;</p>
                  </div>
                </div>

                {/* Cards */}
                <motion.div
                  variants={stagger}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full"
                >
                  {levelsConfig.map((lvl) => {
                    const Icon = lvl.icon;
                    const isSoon = lvl.comingSoon;
                    
                    return (
                      <motion.button
                        key={lvl.id}
                        variants={fadeUp}
                        disabled={isSoon}
                        whileHover={!isSoon ? { y: -3, scale: 1.01 } : {}}
                        whileTap={!isSoon ? { scale: 0.97 } : {}}
                        onClick={() => !isSoon && handleSelectLevelAndStart(lvl.id as KnowledgeLevel)}
                        className={`group relative flex flex-col text-left p-5 sm:p-6 rounded-2xl border backdrop-blur-md transition-all duration-300 min-h-[200px] justify-between ${
                          isSoon 
                            ? 'bg-white/[0.01] border-white/[0.04] cursor-not-allowed opacity-40' 
                            : 'bg-white/[0.02] border-white/[0.06] hover:border-accent-glow/25 hover:bg-white/[0.04] hover:shadow-sm'
                        }`}
                      >
                        <div className="space-y-5">
                          <div className="flex items-start justify-between">
                            <div className={`p-3 rounded-xl bg-white/[0.03] border ${lvl.border} flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}>
                              <Icon className={`w-5 h-5 ${lvl.accent}`} />
                            </div>
                            {isSoon ? (
                              <span className="text-[8px] font-medium uppercase tracking-wider text-accent-glow/40 bg-accent-glow/10 px-2 py-0.5 rounded-full">Soon</span>
                            ) : (
                              <ArrowRight className="w-4 h-4 text-text-muted/15 group-hover:text-accent-glow group-hover:translate-x-0.5 transition-all duration-300" />
                            )}
                          </div>

                          <div>
                            <h3 className={`text-lg font-serif italic mb-0.5 transition-colors duration-300 ${
                              isSoon ? 'text-text-muted/50' : 'text-text-primary group-hover:text-accent-glow'
                            }`}>
                              {lvl.label}
                            </h3>
                            <p className={`text-[10px] font-medium uppercase tracking-wider ${
                              isSoon ? 'text-text-muted/20' : 'text-text-muted/40'
                            }`}>
                              {lvl.tagline}
                            </p>
                          </div>
                        </div>

                        <p className={`text-xs leading-relaxed mt-5 transition-colors duration-300 ${
                          isSoon ? 'text-text-muted/20' : 'text-text-muted/40 group-hover:text-text-muted/60'
                        }`}>
                          {lvl.description}
                        </p>
                      </motion.button>
                    );
                  })}
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
