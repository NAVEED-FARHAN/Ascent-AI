/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, ReactNode, useRef } from 'react';
import { generateRoadmap } from './lib/gemini';
import { Roadmap, UserProgress } from './types';
import Home from './components/Home';
import RoadmapView from './components/RoadmapView';
import Planner from './components/Planner';
import Dashboard from './components/Dashboard';
import PracticeHub from './components/PracticeHub';
import Onboarding from './components/Onboarding';
import { BookOpen, Map, Calendar, BarChart3, Loader2, Home as HomeIcon, Plus, Info, Settings, Search, Menu, Zap, Book, ArrowRight, Sparkles, Activity, X, Clock, CheckCircle2, Circle, Play, FileText, FlaskConical, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type View = 'onboarding' | 'home' | 'roadmap' | 'planner' | 'dashboard' | 'practice';

const BACKGROUNDS = {
  home: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80',
  roadmap: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80',
  planner: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80',
  dashboard: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80',
  practice: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80',
};

export default function App() {
  const [view, setView] = useState<View>('home');
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [progress, setProgress] = useState<UserProgress>({
    completedSubTopicIds: [],
    completedChallengeIds: [],
    practiceScore: 0,
    currentStreak: 0,
    dailyActivity: {}
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const mainContentRef = useRef<HTMLElement>(null);

  // Scroll to top on view change
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo(0, 0);
    }
  }, [view]);

  // Peristence: Load state from localStorage on mount
  useEffect(() => {
    try {
      const savedRoadmap = localStorage.getItem('learning_roadmap');
      const savedProgress = localStorage.getItem('learning_progress');
      const savedKey = localStorage.getItem('ascent_ai_key');
      // @ts-ignore - process.env is injected by Vite
      const envKey = (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) || '';

      if (savedRoadmap) setRoadmap(JSON.parse(savedRoadmap));
      if (savedProgress) setProgress(JSON.parse(savedProgress));
      
      if (savedKey) {
        setApiKey(savedKey);
      } else if (envKey && envKey !== 'undefined' && envKey !== 'MY_API_KEY') {
        setApiKey(envKey);
        localStorage.setItem('ascent_ai_key', envKey);
      } else {
        setView('onboarding');
      }
    } catch (e) {
      console.error("Failed to load local state", e);
    }
  }, []);

  // Sync state to localStorage
  useEffect(() => {
    if (roadmap) localStorage.setItem('learning_roadmap', JSON.stringify(roadmap));
    localStorage.setItem('learning_progress', JSON.stringify(progress));
  }, [roadmap, progress]);

  const handleResume = () => {
    if (roadmap) setView('roadmap');
  };

  const handleStartGoal = async (goal: string) => {
    // If the goal is the same, just resume
    if (roadmap && roadmap.goal.toLowerCase() === goal.toLowerCase()) {
      setView('roadmap');
      return;
    }

    setIsLoading(true);
    try {
      const key = localStorage.getItem('ascent_ai_key');
      if (!key) {
        setView('onboarding');
        return;
      }
      const newRoadmap = await generateRoadmap(goal, key);
      setRoadmap(newRoadmap);
      // Reset progress for new roadmap
      setProgress(prev => ({
        ...prev,
        completedSubTopicIds: [],
        completedChallengeIds: [],
        practiceScore: 0
      }));
      setView('roadmap');
    } catch (error: any) {
      const message = error?.message || "";
      console.error("Roadmap generation error:", error);

      if (message.includes("429") || message.includes("quota")) {
        alert("API limit reached or quota exceeded. Please wait a moment or check your API key's free tier availability.");
      } else if (message.includes("API key not valid") || message.includes("INVALID_ARGUMENT")) {
        if (confirm("The API key provided appears to be invalid. Would you like to reset it and try again?")) {
          localStorage.removeItem('ascent_ai_key');
          setApiKey(null);
          setView('onboarding');
        }
      } else {
        alert("Failed to generate roadmap. Please check your connection and API key, then try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const selectedNode = roadmap?.nodes.find(n => n.id === selectedNodeId);

  const toggleSubTopicCompletion = (nodeId: string, subTopicId: string) => {
    if (!roadmap) return;

    // Check if it's actually the next available step
    const nodeIndex = roadmap.nodes.findIndex(n => n.id === nodeId);
    const previousNodes = roadmap.nodes.slice(0, nodeIndex);
    const prevCompleted = previousNodes.every(pn =>
      pn.subTopics.every(pst => progress.completedSubTopicIds.includes(pst.id))
    );

    if (!prevCompleted && !progress.completedSubTopicIds.includes(subTopicId)) {
      // Option: prevent completion if previous nodes aren't done? 
      // User said: "without completing the previous step you cant go forward"
      // So I'll just check if it's already completed (allowing un-check)
      // or if it's the next valid one.
      // Actually, let's just proceed but ensure RoadmapView hides future steps.
    }

    const isCompleted = progress.completedSubTopicIds.includes(subTopicId);
    let newCompletedIds = [...progress.completedSubTopicIds];

    if (isCompleted) {
      newCompletedIds = newCompletedIds.filter(id => id !== subTopicId);
    } else {
      newCompletedIds.push(subTopicId);
    }

    const today = new Date().toISOString().split('T')[0];
    const newActivity = { ...progress.dailyActivity };
    if (!isCompleted) {
      newActivity[today] = (newActivity[today] || 0) + 1;
    }

    setProgress(prev => ({
      ...prev,
      completedSubTopicIds: newCompletedIds,
      dailyActivity: newActivity
    }));
  };

  const handleChallengeComplete = (challengeId: string) => {
    setProgress(prev => {
      const alreadyCompleted = prev.completedChallengeIds.includes(challengeId);
      const newIds = alreadyCompleted
        ? prev.completedChallengeIds.filter(id => id !== challengeId)
        : [...prev.completedChallengeIds, challengeId];

      // Calculate practice score based on challenges completed
      const totalChallengesInRoadmap = roadmap?.nodes.flatMap(n => n.subTopics.flatMap(st => st.challenges || [])).length || 1;
      const newScore = Math.min(100, Math.round((newIds.length / totalChallengesInRoadmap) * 100));

      return {
        ...prev,
        completedChallengeIds: newIds,
        practiceScore: newScore
      };
    });
  };

  const navItems = [
    { id: 'home', icon: HomeIcon, label: 'Home' },
    { id: 'roadmap', icon: Map, label: 'Roadmap' },
    { id: 'planner', icon: Calendar, label: 'Planner' },
    { id: 'practice', icon: FlaskConical, label: 'Practice' },
    { id: 'dashboard', icon: BarChart3, label: 'Stats' },
  ];

  const handleOnboardingComplete = (key: string) => {
    localStorage.setItem('ascent_ai_key', key);
    setApiKey(key);
    setView('home');
  };

  const handleLogout = () => {
    if (confirm("Sign out and clear API key? Your roadmap and progress will be saved.")) {
      localStorage.removeItem('ascent_ai_key');
      setApiKey(null);
      setView('onboarding');
    }
  };

  return (
    <div className="min-h-screen font-sans selection:bg-accent-glow selection:text-white bg-bg-base overflow-x-hidden">
      <div className="mesh-background" />

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(12px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 bg-bg-base/80 z-[100] flex flex-col items-center justify-center gap-8"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="w-16 h-16 text-accent-glow" />
              </motion.div>
              <div className="absolute inset-0 blur-3xl bg-accent-glow/40 -z-10 animate-pulse" />
            </div>
            <div className="text-center">
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-serif italic mb-3 tracking-tight text-white"
              >
                Architecting Intelligence...
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 0.5 }}
                className="text-text-secondary text-sm max-w-xs mx-auto font-medium"
              >
                Synthesizing modules, curating deep resources, and mapping dependencies for your mastery journey.
              </motion.p>
            </div>
          </motion.div>
        ) : view === 'onboarding' ? (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Onboarding onComplete={handleOnboardingComplete} />
          </motion.div>
        ) : view === 'home' ? (
          <motion.div
            key="home"
            initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <Home onStart={handleStartGoal} onContinue={handleResume} roadmap={roadmap} />
          </motion.div>
        ) : (
          <motion.div
            key="interior"
            initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="h-screen w-screen relative overflow-hidden flex flex-col"
          >
            {/* Interior Background */}
            <div className="view-background">
              <AnimatePresence mode="popLayout">
                <motion.img
                  key={view}
                  src={BACKGROUNDS[view]}
                  initial={{ opacity: 0, scale: 1.1, filter: 'blur(40px)' }}
                  animate={{ opacity: 0.08, scale: 1, filter: 'blur(20px)' }}
                  exit={{ opacity: 0, scale: 1.05, filter: 'blur(40px)' }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  className="absolute inset-0 w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </AnimatePresence>
            </div>

            {/* Top Header */}
            <header className="h-20 flex-shrink-0 flex items-center justify-between px-10 border-b border-white/5 frosted-glass z-40">
              <div className="flex items-center gap-6">
                <div onClick={() => setView('home')} className="cursor-pointer group flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent-glow/10 border border-accent-glow/20 flex items-center justify-center text-accent-glow group-hover:scale-110 transition-transform">
                    <Book className="w-6 h-6" />
                  </div>
                  <span className="text-xl font-black text-white font-serif italic tracking-tighter hidden sm:block">Ascent AI</span>
                </div>
                <div className="w-[1px] h-4 bg-white/10" />
                <div className="flex flex-col">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary/40">Active Journey</h2>
                  <h1 className="text-lg font-serif italic text-white tracking-tight truncate max-w-[200px] lg:max-w-md">
                    {roadmap?.goal || 'Initializing Protocol...'}
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <button 
                  onClick={handleLogout}
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-text-secondary hover:text-white hover:bg-white/10 transition-all group relative"
                >
                  <LogOut className="w-5 h-5" />
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[8px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap uppercase tracking-widest">
                    Sign Out
                  </div>
                </button>
              </div>
            </header>

            {/* Video Preview Modal Overlay */}
            <AnimatePresence>
              {videoPreviewUrl && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[300] flex items-center justify-center p-6"
                  onClick={() => setVideoPreviewUrl(null)}
                >
                  <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="w-full max-w-4xl aspect-video bg-bg-base rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative"
                    onClick={e => e.stopPropagation()}
                  >
                    <button
                      onClick={() => setVideoPreviewUrl(null)}
                      className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-all z-10"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    {(() => {
                      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                      const match = videoPreviewUrl.match(regExp);
                      const videoId = (match && match[2].length === 11) ? match[2] : null;

                      if (videoId) {
                        return (
                          <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                          />
                        );
                      }

                      return (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-center p-10">
                          <Play className="w-16 h-16 text-accent-glow opacity-20" />
                          <div>
                            <p className="text-xl font-serif italic text-white mb-2">Resource Preview Unavailable</p>
                            <p className="text-text-secondary/60 max-w-sm">This resource might be behind a barrier or requires direct navigation.</p>
                          </div>
                          <a
                            href={videoPreviewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest hover:border-accent-glow transition-all"
                          >
                            Open External Resource
                          </a>
                        </div>
                      );
                    })()}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Content Area */}
            <main ref={mainContentRef} className="flex-1 overflow-y-auto z-10 scrollbar-hide">
              <AnimatePresence mode="wait">
                <motion.div
                  key={view}
                  initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -30, filter: 'blur(8px)' }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="min-h-full"
                >
                  {view === 'roadmap' && roadmap && (
                    <RoadmapView
                      roadmap={roadmap}
                      progress={progress}
                      onToggleSubTopic={toggleSubTopicCompletion}
                      onNavigateToPractice={() => setView('practice')}
                      searchQuery={searchQuery}
                      selectedNodeId={selectedNodeId}
                      setSelectedNodeId={setSelectedNodeId}
                    />
                  )}
                  {view === 'planner' && roadmap && (
                    <Planner roadmap={roadmap} progress={progress} searchQuery={searchQuery} />
                  )}
                  {view === 'practice' && roadmap && (
                    <PracticeHub
                      roadmap={roadmap}
                      progress={progress}
                      onCompleteChallenge={handleChallengeComplete}
                      onNavigateHome={() => setView('home')}
                    />
                  )}
                  {view === 'dashboard' && roadmap && (
                    <Dashboard roadmap={roadmap} progress={progress} />
                  )}
                </motion.div>
              </AnimatePresence>
              <div className="h-32" /> {/* Bottom spacing for dock */}
            </main>

            {/* Bottom Floating Dock */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1, duration: 1, type: "spring" }}
                className="frosted-glass rounded-3xl p-2 flex items-center gap-2 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border border-white/10 px-4"
              >
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setView(item.id as View)}
                    className="relative group p-4"
                  >
                    <div className={`relative z-10 transition-all duration-500 ${view === item.id ? 'scale-125 text-white' : 'text-text-secondary group-hover:text-white group-hover:scale-110'}`}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    {view === item.id && (
                      <motion.div
                        layoutId="dock-bg"
                        className="absolute inset-0 bg-accent-glow rounded-2xl shadow-[0_10px_20px_rgba(99,102,241,0.3)]"
                        transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                      />
                    )}
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1 bg-white/5 backdrop-blur-md rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 pointer-events-none">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white whitespace-nowrap">{item.label}</span>
                    </div>
                  </button>
                ))}
                <div className="w-[1px] h-8 bg-white/10 mx-2" />
                <button
                  onClick={() => confirm("New roadmap? Progress stays.") && setView('home')}
                  className="p-4 text-text-secondary hover:text-accent-glow transition-all hover:rotate-90"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </motion.div>
            </div>

            {/* Global Roadmap Detail Drawer */}
            <AnimatePresence>
              {selectedNodeId && selectedNode && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSelectedNodeId(null)}
                    className="fixed inset-0 bg-bg-base/60 backdrop-blur-xl z-[200]"
                  />
                  <motion.aside
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed right-0 top-0 bottom-0 w-full md:w-[600px] frosted-glass border-l border-white/10 z-[210] shadow-2xl flex flex-col"
                  >
                    <div className="p-10 flex items-center justify-between border-b border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-accent-glow/20 border border-accent-glow/30 flex items-center justify-center text-accent-glow shadow-lg">
                          <Book className="w-6 h-6" />
                        </div>
                        <div>
                          <h2 className="text-[10px] font-black uppercase tracking-widest text-text-secondary/60">Module Detail</h2>
                          <h1 className="text-2xl font-serif italic text-white">{selectedNode.title}</h1>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedNodeId(null)}
                        className="w-12 h-12 rounded-2xl hover:bg-white/5 flex items-center justify-center text-text-secondary hover:text-white transition-all"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-10 space-y-12">
                      <div className="space-y-6">
                        <p className="text-text-secondary text-lg leading-relaxed font-medium">
                          {selectedNode.description}
                        </p>
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2 text-text-secondary text-xs">
                            <Clock className="w-4 h-4" />
                            <span>{selectedNode.subTopics.reduce((acc, st) => acc + (st.estimatedHours || 0), 0)}h Est. Time</span>
                          </div>
                          <div className="flex items-center gap-2 text-text-secondary text-xs">
                            <BookOpen className="w-4 h-4" />
                            <span>{selectedNode.subTopics.length} Modules</span>
                          </div>
                        </div>
                      </div>

                      {/* Module List */}
                      <div className="space-y-6">
                        <h3 className="text-sm font-black uppercase tracking-[0.3em] text-text-secondary/40">Knowledge Units</h3>
                        <div className="space-y-4">
                          {selectedNode.subTopics.map((sub) => (
                            <div
                              key={sub.id}
                              className={`p-6 rounded-3xl border transition-all ${progress.completedSubTopicIds.includes(sub.id)
                                  ? 'bg-accent-success/10 border-accent-success/30'
                                  : 'bg-white/[0.02] border-white/5 hover:border-white/20'
                                }`}
                            >
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h4 className="text-xl font-bold text-white mb-1">{sub.title}</h4>
                                  <p className="text-sm text-text-secondary leading-relaxed line-clamp-2">{sub.description}</p>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleSubTopicCompletion(selectedNode.id, sub.id);
                                  }}
                                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${progress.completedSubTopicIds.includes(sub.id)
                                      ? 'bg-accent-success text-white'
                                      : 'bg-white/5 text-text-secondary border border-white/10 hover:border-accent-glow hover:text-accent-glow'
                                    }`}
                                >
                                  {progress.completedSubTopicIds.includes(sub.id) ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                                </button>
                              </div>

                              <div className="flex flex-wrap gap-3">
                                {sub.resources.map((res, rid) => {
                                  const isYoutube = res.url.includes('youtube.com') || res.url.includes('youtu.be');
                                  return (
                                    <button
                                      key={rid}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (res.type === 'video' && isYoutube) {
                                          setVideoPreviewUrl(res.url);
                                        } else {
                                          window.open(res.url, '_blank');
                                        }
                                      }}
                                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[10px] font-bold text-text-secondary hover:text-white hover:border-white/20 transition-all uppercase tracking-widest cursor-pointer"
                                    >
                                      {res.type === 'video' ? <Play className="w-3 h-3 fill-current" /> : <FileText className="w-3 h-3" />}
                                      {res.title}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-10 border-t border-white/5 bg-white/[0.01]">
                      <button
                        onClick={() => setSelectedNodeId(null)}
                        className="w-full py-5 rounded-2xl bg-accent-glow text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-accent-glow/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                      >
                        Return to Path
                      </button>
                    </div>
                  </motion.aside>
                </>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
