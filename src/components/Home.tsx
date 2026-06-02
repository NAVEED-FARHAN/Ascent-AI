import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, ArrowRight, Sparkles, 
  Target, Loader2, Zap, History, Trash2,
  ArrowLeft, Flame, ClipboardList, ChevronLeft, ChevronRight
} from 'lucide-react';
import { User } from 'firebase/auth';
import { Roadmap, RoadmapRecord, GoalEvaluation } from '../types';
import { getUserRoadmaps, deleteRoadmapFromCloud } from '../lib/firestore';
import { KnowledgeLevel, evaluateGoal } from '../lib/gemini';
import { getKeyForUser } from '../lib/keys';
import StarBorder from './StarBorder';

// ── Topic icon mapping using Devicon CDN ──────────────────────────────────────
const TOPIC_ICON_MAP: Record<string, string> = {
  python: 'python/python-original',
  javascript: 'javascript/javascript-original',
  typescript: 'typescript/typescript-original',
  react: 'react/react-original',
  nextjs: 'nextjs/nextjs-original',
  'next.js': 'nextjs/nextjs-original',
  nodejs: 'nodejs/nodejs-original',
  'node.js': 'nodejs/nodejs-original',
  node: 'nodejs/nodejs-original',
  vue: 'vuejs/vuejs-original',
  angular: 'angularjs/angularjs-original',
  java: 'java/java-original',
  kotlin: 'kotlin/kotlin-original',
  swift: 'swift/swift-original',
  flutter: 'flutter/flutter-original',
  dart: 'dart/dart-original',
  rust: 'rust/rust-plain',
  go: 'go/go-original',
  golang: 'go/go-original',
  c: 'c/c-original',
  'c++': 'cplusplus/cplusplus-original',
  cpp: 'cplusplus/cplusplus-original',
  'c#': 'csharp/csharp-original',
  csharp: 'csharp/csharp-original',
  php: 'php/php-original',
  ruby: 'ruby/ruby-original',
  rails: 'rails/rails-original-wordmark',
  docker: 'docker/docker-original',
  kubernetes: 'kubernetes/kubernetes-plain',
  aws: 'amazonwebservices/amazonwebservices-original',
  firebase: 'firebase/firebase-plain',
  mongodb: 'mongodb/mongodb-original',
  postgresql: 'postgresql/postgresql-original',
  postgres: 'postgresql/postgresql-original',
  mysql: 'mysql/mysql-original',
  graphql: 'graphql/graphql-plain',
  tailwind: 'tailwindcss/tailwindcss-plain',
  css: 'css3/css3-original',
  html: 'html5/html5-original',
  figma: 'figma/figma-original',
  tensorflow: 'tensorflow/tensorflow-original',
  pytorch: 'pytorch/pytorch-original',
  linux: 'linux/linux-original',
  git: 'git/git-original',
  django: 'django/django-plain',
  fastapi: 'fastapi/fastapi-original',
  flask: 'flask/flask-original',
  spring: 'spring/spring-original',
  android: 'android/android-original',
  unity: 'unity/unity-original',
  blender: 'blender/blender-original',
};

const DEVICON_BASE = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons';

function getTopicIcon(goal: string): string | null {
  const lower = goal.toLowerCase();
  
  // Sort keywords by length descending so longer matches (like "c++" or "mysql") happen before "c"
  const keywords = Object.keys(TOPIC_ICON_MAP).sort((a, b) => b.length - a.length);

  for (const keyword of keywords) {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Match the keyword exactly at word boundaries or string edges
    const regex = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i');
    
    if (regex.test(lower)) {
      return `${DEVICON_BASE}/${TOPIC_ICON_MAP[keyword]}.svg`;
    }
  }
  return null;
}

function getCompletion(record: RoadmapRecord): number {
  const allSubs = (record.nodes || []).flatMap(n => n.subTopics || []);
  const total = allSubs.length;
  if (total === 0) return 0;
  const done = allSubs.filter(st => st.isCompleted).length;
  return Math.round((done / total) * 100);
}

function CompletionRing({ pct }: { pct: number }) {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" className="flex-shrink-0">
      <circle cx="22" cy="22" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
      <circle
        cx="22" cy="22" r={r} fill="none"
        stroke={pct === 100 ? '#4ade80' : 'rgba(124,111,250,0.9)'}
        strokeWidth="3"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 22 22)"
        style={{ transition: 'stroke-dasharray 1s ease' }}
      />
      <text x="22" y="26" textAnchor="middle" fill="white" fontSize="9" fontWeight="800" fontFamily="monospace">
        {pct}%
      </text>
    </svg>
  );
}

interface HomeProps {
  user: User | null;
  roadmap: Roadmap | null;
  onSelectRoadmap: (roadmap: Roadmap) => void;
  onStartGoal: (goal: string, level: KnowledgeLevel, clarifyingAnswers?: Record<string, string>) => void;
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
  const [selectedLevel, setSelectedLevel] = useState<KnowledgeLevel>('beginner');
  const [showLevelPicker, setShowLevelPicker] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const [evaluation, setEvaluation] = useState<GoalEvaluation | null>(null);
  const [showQuestions, setShowQuestions] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const levelsConfig = [
    {
      id: 'test' as const,
      label: 'Take a Test',
      tagline: 'Discover your level',
      description: 'Discover your level of understanding with a quick diagnostic test (under development).',
      comingSoon: true,
      icon: ClipboardList,
      colorClass: 'text-sky-400 bg-sky-500/10 border-sky-500/20'
    },
    {
      id: 'fresher' as const,
      label: 'Fresher',
      tagline: 'Just starting out',
      description: 'Absolute zero knowledge. Curated fundamentals, intuitive analogies, and simple basics.',
      icon: Zap,
      colorClass: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    },
    {
      id: 'beginner' as const,
      label: 'Beginner',
      tagline: 'Know the basics',
      description: 'Core foundation. Balanced mix of key theory, conceptual details, and hands-on guidance.',
      icon: Target,
      colorClass: 'text-accent-glow bg-accent-glow/10 border-accent-glow/20'
    },
    {
      id: 'intermediate' as const,
      label: 'Intermediate',
      tagline: 'Building real things',
      description: 'System architect. Skip the basics. Focus directly on production patterns and scale.',
      icon: Flame,
      colorClass: 'text-rose-400 bg-rose-500/10 border-rose-500/20'
    }
  ];

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

  const handleSelectLevelAndStart = (level: KnowledgeLevel) => {
    setSelectedLevel(level);
    setShowLevelPicker(false);
    onStartGoal(goal, level, answers);
  };

  const handleInitiateAscent = async (targetGoal: string) => {
    if (!targetGoal.trim() || !user) return;
    setIsAnalyzing(true);
    try {
      const apiKey = getKeyForUser(user.uid);
      const evalResult = await evaluateGoal(targetGoal, apiKey);
      if (evalResult.isSpecific || !evalResult.questions || evalResult.questions.length === 0) {
        setShowLevelPicker(true);
        setShowQuestions(false);
      } else {
        setEvaluation(evalResult);
        setAnswers({});
        setShowQuestions(true);
        setShowLevelPicker(false);
      }
    } catch (err) {
      console.error("Evaluation failed, falling back to direct picker:", err);
      setShowLevelPicker(true);
      setShowQuestions(false);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      }
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.04,
        staggerDirection: -1,
        when: "afterChildren"
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    show: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 14,
        mass: 1
      }
    },
    exit: {
      opacity: 0,
      y: 20,
      scale: 0.95,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center max-w-5xl mx-auto py-10 relative">
      <AnimatePresence mode="wait">
        {!showLevelPicker ? (
          <motion.div
            key="search-interface"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="w-full flex flex-col items-center space-y-16"
          >
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
                className="relative w-full max-w-3xl flex items-center gap-3"
              >
                <motion.form 
                  onSubmit={(e) => { e.preventDefault(); goal.trim() && handleInitiateAscent(goal); }}
                  animate={{ 
                    scale: isFocused ? 1.01 : 1,
                  }}
                  className={`relative flex items-center flex-1 bg-black/40 border border-white/10 rounded-[2.5rem] p-2 backdrop-blur-md shadow-[inset_0_4px_20px_rgba(0,0,0,0.8)] transition-all duration-500 ${isFocused ? 'ring-2 ring-accent-glow/30' : 'hover:bg-black/30'}`}
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
                    <Search className={`w-5 h-5 transition-colors duration-500 ${isFocused || goal.trim() ? 'text-accent-glow' : 'text-white/70'}`} />
                  </div>

                  <input 
                    type="text" 
                    value={goal} 
                    onChange={(e) => setGoal(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="What path shall we architect today?" 
                    className="flex-1 bg-transparent border-none px-4 py-5 text-xl text-text-primary outline-none placeholder:text-white/60 font-serif italic tracking-wide"
                  />

                  <motion.button
                    type="submit"
                    disabled={!isNeuralReady || !goal.trim()}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative h-[64px] px-10 rounded-[1.75rem] font-black text-[10px] uppercase tracking-[0.25em] flex items-center gap-4 transition-all duration-500 overflow-hidden ${
                      isNeuralReady && goal.trim() && !isAnalyzing
                        ? 'bg-accent-glow text-white shadow-[0_10px_30px_rgba(124,111,250,0.3)] opacity-100' 
                        : 'bg-white/5 text-white/50 border border-white/10 shadow-[0_4px_10px_rgba(0,0,0,0.4)] opacity-100'
                    }`}
                  >
                    {/* Blueprint Grid for Inactive Button */}
                    {!goal.trim() && (
                      <div className="absolute inset-0 blueprint-grid opacity-[0.1]" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    
                    {isAnalyzing ? (
                      <>
                        <span>Analyzing Goal</span>
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </>
                    ) : isNeuralReady ? (
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

            {/* Recent Blueprints — scrollable cards */}
            {archivedRoadmaps.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="w-full max-w-3xl mx-auto"
              >
                {/* Section header */}
                <div className="w-full flex items-center gap-5 mb-5">
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />
                  <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.35em] text-text-muted/40">
                    <History className="w-3 h-3" />
                    Recent Blueprints
                  </div>
                  <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-white/[0.07] to-transparent" />
                </div>

                {/* Cards row with scroll buttons */}
                <div className="relative group/scroll w-full">
                  {/* Left Scroll Button */}
                  <button 
                    onClick={() => handleScroll('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/80 border border-white/10 text-white opacity-0 group-hover/scroll:opacity-100 transition-opacity hover:bg-black hover:scale-110 shadow-xl"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {/* Right Scroll Button */}
                  <button 
                    onClick={() => handleScroll('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/80 border border-white/10 text-white opacity-0 group-hover/scroll:opacity-100 transition-opacity hover:bg-black hover:scale-110 shadow-xl"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  <div className="relative w-full overflow-hidden" 
                    style={{ 
                      maskImage: 'linear-gradient(to right, transparent, black 20px, black calc(100% - 20px), transparent)', 
                      WebkitMaskImage: 'linear-gradient(to right, transparent, black 20px, black calc(100% - 20px), transparent)' 
                    }}
                  >
                    <div 
                      ref={scrollRef}
                      className="flex gap-4 overflow-x-auto pb-4 pt-1 px-6 scroll-smooth"
                      style={{ scrollbarWidth: 'none' }}
                    >
                      {archivedRoadmaps.slice(0, 8).map((record, i) => {
                    const pct = getCompletion(record);
                    const iconUrl = getTopicIcon(record.goal);
                    const initials = record.goal.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
                    const dateLabel = (() => {
                      if (!record.createdAt) return '';
                      const d = (record.createdAt as any).toDate ? (record.createdAt as any).toDate() : new Date(record.createdAt as any);
                      return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
                    })();

                    return (
                      <motion.div
                        key={record.id}
                        initial={{ opacity: 0, y: 12, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: 0.75 + i * 0.06, type: 'spring', stiffness: 200, damping: 20 }}
                        whileHover={{ y: -4, scale: 1.02 }}
                        className="group relative flex-shrink-0 w-[160px] rounded-2xl border border-white/[0.07] overflow-hidden cursor-pointer"
                        style={{ background: 'rgba(255,255,255,0.03)' }}
                        onClick={() => onSelectRoadmap(record as any)}
                      >
                        {/* Hover glow */}
                        <div className="absolute inset-0 bg-accent-glow/0 group-hover:bg-accent-glow/[0.04] transition-all duration-400 pointer-events-none" />

                        {/* Icon / Logo area */}
                        <div className="relative h-[90px] flex items-center justify-center"
                          style={{ background: 'rgba(255,255,255,0.02)' }}
                        >
                          {iconUrl ? (
                            <img
                              src={iconUrl}
                              alt={record.goal}
                              className="w-12 h-12 object-contain drop-shadow-lg"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black text-white"
                              style={{
                                background: `hsl(${(i * 67 + 220) % 360}, 60%, 45%)`,
                                boxShadow: `0 4px 20px hsl(${(i * 67 + 220) % 360}, 60%, 45%, 0.4)`
                              }}
                            >
                              {initials}
                            </div>
                          )}

                          {/* Delete button */}
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(e, record.id!); }}
                            className="absolute top-2 right-2 p-1 rounded-lg bg-black/60 text-text-muted/40 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Content */}
                        <div className="p-3">
                          <p className="text-[11px] font-semibold text-text-secondary group-hover:text-text-primary transition-colors leading-snug line-clamp-2 mb-3">
                            {record.goal}
                          </p>

                          {/* Progress row */}
                          <div className="flex items-center justify-between">
                            <div className="flex-1 mr-2">
                              {dateLabel && <p className="text-[8px] text-text-muted/30 font-mono mb-1.5">{dateLabel}</p>}
                              <div className="w-full h-1 rounded-full bg-white/[0.06] overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  transition={{ delay: 1 + i * 0.06, duration: 0.8, ease: 'easeOut' }}
                                  className="h-full rounded-full"
                                  style={{ background: pct === 100 ? '#4ade80' : 'rgba(124,111,250,0.9)' }}
                                />
                              </div>
                            </div>
                            <CompletionRing pct={pct} />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                  {/* Spacer to allow scrolling past the right fade mask */}
                  <div className="w-12 flex-shrink-0" />
                </div>
                </div>
                </div>
              </motion.div>
            )}

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
                  onClick={() => { setGoal(tag); handleInitiateAscent(tag); }}
                  className="group relative px-6 py-3.5 rounded-xl bg-black/40 border border-t-white/10 border-b-black/80 border-x-white/5 hover:border-accent-glow/40 text-[10px] font-black uppercase tracking-[0.25em] text-text-muted hover:text-white transition-all duration-300 overflow-hidden backdrop-blur-md shadow-[inset_0_1px_10px_rgba(255,255,255,0.02),0_4px_20px_rgba(0,0,0,0.4)]"
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
          </motion.div>
        ) : showQuestions ? (
          <motion.div
            key="questions-interface"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="w-full flex flex-col items-center space-y-8 py-10 max-w-2xl mx-auto"
          >
            <div className="space-y-3">
              <h2 className="text-3xl md:text-4xl font-serif italic tracking-tighter text-[#f8fafc]">
                Refining Your Learning Path
              </h2>
              <p className="text-sm text-text-muted/80 max-w-md mx-auto">
                Help us customize your career roadmap by answering a few quick questions.
              </p>
              
              <div className="max-w-md mx-auto mt-4 px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-text-muted/40 block mb-1">TARGET GOAL</span>
                <p className="text-sm font-serif italic text-accent-glow/95">
                  "{goal}"
                </p>
              </div>
            </div>

            <div className="w-full space-y-6 text-left">
              {evaluation?.questions?.map((q, idx) => (
                <div key={q.id} className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md space-y-4 shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
                  <h3 className="text-sm font-serif italic text-text-primary">
                    <span className="text-accent-glow mr-2 font-mono font-bold">{idx + 1}.</span> {q.question}
                  </h3>
                  
                  {/* Option pills */}
                  <div className="flex flex-wrap gap-2.5">
                    {q.options.map((opt) => {
                      const isSelected = answers[q.id] === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 border ${
                            isSelected 
                              ? 'bg-accent-glow text-white border-accent-glow shadow-[0_0_15px_rgba(124,111,250,0.4)]'
                              : 'bg-black/30 text-text-muted hover:text-white border-white/5 hover:border-white/20'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom input option */}
                  <div className="pt-2">
                    <input
                      type="text"
                      placeholder="Or specify your own details..."
                      value={answers[q.id] && !q.options.includes(answers[q.id]) ? answers[q.id] : ''}
                      onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                      className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs text-text-primary outline-none focus:border-accent-glow/50 transition-colors placeholder:text-text-muted/40 font-sans"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-4 w-full max-w-sm pt-4">
              <button
                onClick={() => {
                  setShowLevelPicker(true);
                  setShowQuestions(false);
                }}
                className="group w-full py-4 rounded-2xl bg-accent-glow text-white font-black text-[10px] uppercase tracking-[0.25em] hover:bg-accent-glow/90 shadow-[0_10px_30px_rgba(124,111,250,0.2)] transition-all duration-300 flex items-center justify-center gap-2"
              >
                Continue to Level Selection
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => {
                  setAnswers({}); // clear answers to skip
                  setShowLevelPicker(true);
                  setShowQuestions(false);
                }}
                className="w-full py-3 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-white/20 text-[10px] font-black uppercase tracking-[0.25em] text-text-muted hover:text-white transition-all duration-300"
              >
                Skip Questions & Get General Path
              </button>

              <button
                onClick={() => {
                  setShowQuestions(false);
                  setGoal('');
                }}
                className="group flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-text-muted/65 hover:text-white transition-colors duration-200"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                Cancel Setup
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="level-picker-interface"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="w-full flex flex-col items-center space-y-12 py-10 animate-fade-in"
          >
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-serif italic tracking-tighter text-[#f8fafc]">
                Configure Your Ascent
              </h2>
              
              <div className="max-w-2xl mx-auto mt-4 px-6 py-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-md shadow-2xl">
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-text-muted/40 block mb-1">TARGET BLUEPRINT</span>
                <p className="text-lg font-serif italic text-text-primary text-accent-glow/95">
                  "{goal}"
                </p>
              </div>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-5xl px-4"
            >
              {levelsConfig.map((lvl) => {
                const Icon = lvl.icon;
                const isSoon = lvl.comingSoon;
                
                return (
                  <motion.button
                    key={lvl.id}
                    variants={cardVariants}
                    disabled={isSoon}
                    whileHover={!isSoon ? { 
                      scale: 1.04, 
                      y: -6,
                      boxShadow: "0 20px 40px rgba(124, 111, 250, 0.12)",
                    } : {}}
                    whileTap={!isSoon ? { scale: 0.98 } : {}}
                    onClick={() => !isSoon && handleSelectLevelAndStart(lvl.id as KnowledgeLevel)}
                    className={`group relative flex flex-col text-left p-6 rounded-3xl border backdrop-blur-md transition-all duration-300 overflow-hidden min-h-[220px] justify-between
                      ${isSoon 
                        ? 'bg-white/[0.01] border-white/[0.04] cursor-not-allowed opacity-50' 
                        : 'bg-white/[0.02] border-white/[0.06] hover:border-accent-glow/50 hover:bg-accent-glow/[0.02] cursor-pointer'
                      }`}
                  >
                    {!isSoon && (
                      <div className="absolute inset-0 bg-gradient-to-br from-accent-glow/0 via-accent-glow/0 to-accent-glow/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    )}

                    <div className="space-y-4 flex flex-col h-full justify-between w-full">
                      <div className="flex items-center justify-between w-full">
                        <div className={`p-3 rounded-2xl ${lvl.colorClass} border flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        
                        {isSoon ? (
                          <div className="px-2 py-0.5 rounded-full bg-accent-glow/10 border border-accent-glow/20">
                            <span className="text-[6px] font-black uppercase tracking-widest text-accent-glow/60">Soon</span>
                          </div>
                        ) : (
                          <ArrowRight className="w-4 h-4 text-text-muted/20 group-hover:text-accent-glow group-hover:translate-x-1 transition-all duration-300" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-lg font-serif italic text-text-primary group-hover:text-accent-glow transition-colors duration-300">
                          {lvl.label}
                        </h3>
                        <p className="text-[9px] font-black uppercase tracking-widest text-text-muted/60">
                          {lvl.tagline}
                        </p>
                      </div>

                      <p className="text-xs text-text-muted/40 leading-relaxed font-sans group-hover:text-text-muted/60 transition-colors duration-300">
                        {lvl.description}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              onClick={() => { setShowLevelPicker(false); setShowQuestions(false); }}
              className="group flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-white/20 text-[10px] font-black uppercase tracking-[0.25em] text-text-muted hover:text-white transition-all duration-300"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              Adjust Blueprint Target
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
