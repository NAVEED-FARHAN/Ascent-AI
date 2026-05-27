import { useState, useEffect, useRef } from 'react';
import { auth, googleProvider, db } from './lib/firestore';
import { signInWithPopup, onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { 
  Book, 
  LogOut, 
  Home as HomeIcon, 
  Map, 
  Calendar, 
  FlaskConical, 
  BarChart3,
  X,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

// Components
import Landing from './components/Landing';
import Home from './components/Home';
import RoadmapView from './components/RoadmapView';
import Planner from './components/Planner';
import Dashboard from './components/Dashboard';
import PracticeHub from './components/PracticeHub';
import Modal from './components/Modal';
import RoadmapDetailOverlay from './components/RoadmapDetailOverlay';
import { Dock, DockIcon } from './components/Dock';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./components/ui/tooltip";
import { buttonVariants } from "./components/ui/button";
import { Separator } from "./components/ui/separator";
import LoadingScreen from './components/LoadingScreen';
import { LightRays } from './components/LightRays';

// Libs

import { generateRoadmap, KnowledgeLevel } from './lib/gemini';
import { getKeyForUser, setCloudKeys } from './lib/keys';
import { 
  saveProgressToCloud, 
  getProgressFromCloud, 
  syncUserProfile, 
  deleteAllUserRoadmaps,
  getAPIKeys,
  saveRoadmapToCloud,
  updateRoadmapInCloud
} from './lib/firestore';
import { Roadmap, UserProgress, ModalConfig, Resource } from './types';



type View = 'landing' | 'home' | 'roadmap' | 'planner' | 'practice' | 'dashboard';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [view, setView] = useState<View>('landing');
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);

  const [progress, setProgress] = useState<UserProgress>({
    completedSubTopicIds: [],
    completedChallengeIds: [],
    currentStreak: 0,
    totalPoints: 0,
    lastActive: new Date().toISOString(),
    practiceScore: 0
  });
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isNeuralReady, setIsNeuralReady] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const navItems = [
    { id: 'home', icon: HomeIcon, label: 'Home' },
    { id: 'roadmap', icon: Map, label: 'Roadmap' },
    { id: 'planner', icon: Calendar, label: 'Planner' },
    { id: 'practice', icon: FlaskConical, label: 'Laboratory' },
    { id: 'dashboard', icon: BarChart3, label: 'Stats' },
  ];

  const [modalConfig, setModalConfig] = useState<ModalConfig>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  const mainContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Safety net: never stuck on spinner more than 8 seconds
    const timeout = setTimeout(() => setIsAuthLoading(false), 8000);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      clearTimeout(timeout);
      try {
        if (firebaseUser) {
          setUser(firebaseUser);
          setIsNeuralReady(true); // Enable UI immediately
          
          // Background sync
          try {
            await syncUserProfile(firebaseUser);
            // No savedProgress here yet because we don't know the roadmapId
            
            const keys = await getAPIKeys();
            if (keys && keys.length > 0) {
              setCloudKeys(keys);
            }
          } catch (err) {
            console.warn("Background Sync Warning:", err);
          }
          
          setView('home');
        } else {
          setUser(null);
          setRoadmap(null);
          setIsNeuralReady(false);
          setView('landing');
        }
      } catch (err) {
        console.error('[Auth] Initialization error:', err);
      } finally {
        setIsAuthLoading(false);
      }
    });
    return () => { unsubscribe(); clearTimeout(timeout); };
  }, []);


  const showModal = (config: Omit<ModalConfig, 'isOpen'>) => setModalConfig({ ...config, isOpen: true });
  const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

  const toggleSubTopic = async (nodeId: string, subTopicId: string) => {
    if (!user || !roadmap) return;
    const isCompleted = progress.completedSubTopicIds.includes(subTopicId);
    const newSubTopicIds = isCompleted
      ? progress.completedSubTopicIds.filter(id => id !== subTopicId)
      : [...progress.completedSubTopicIds, subTopicId];
    
    const newProgress = { ...progress, completedSubTopicIds: newSubTopicIds, lastActive: new Date().toISOString() };
    setProgress(newProgress);
    await saveProgressToCloud(user.uid, roadmap.id!, newProgress);

    // Calculate new completion percentage
    const allSubtopicIds = roadmap.nodes.flatMap(n => n.subTopics.map(st => st.id));
    const total = allSubtopicIds.length;
    const completed = newSubTopicIds.filter(id => allSubtopicIds.includes(id)).length;
    const completion = Math.round((completed / (total || 1)) * 100);
    await updateRoadmapInCloud(user.uid, roadmap.id!, { completion });
  };

  const toggleChallenge = async (challengeId: string) => {
    if (!user || !roadmap) return;
    const isCompleted = progress.completedChallengeIds.includes(challengeId);
    const newChallengeIds = isCompleted
      ? progress.completedChallengeIds.filter(id => id !== challengeId)
      : [...progress.completedChallengeIds, challengeId];
    
    const newProgress = { ...progress, completedChallengeIds: newChallengeIds, lastActive: new Date().toISOString() };
    setProgress(newProgress);
    await saveProgressToCloud(user.uid, roadmap.id!, newProgress);
  };

  const handleUpdateSubTopicResources = async (nodeId: string, subTopicId: string, newResources: Resource[]) => {
    if (!user || !roadmap) return;
    
    const updatedRoadmap = {
      ...roadmap,
      nodes: roadmap.nodes.map(n => 
        n.id === nodeId 
          ? {
              ...n,
              subTopics: n.subTopics.map(st => 
                st.id === subTopicId 
                  ? { ...st, resources: newResources }
                  : st
              )
            }
          : n
      )
    };

    setRoadmap(updatedRoadmap);
    if (updatedRoadmap.id) {
      await updateRoadmapInCloud(user.uid, updatedRoadmap.id, updatedRoadmap);
    }
  };

  const handleSelectRoadmap = async (selected: Roadmap) => {
    setRoadmap(selected);
    setView('roadmap');
    if (user && selected.id) {
      try {
        const savedProgress = await getProgressFromCloud(user.uid, selected.id);
        if (savedProgress) {
          setProgress({
            completedSubTopicIds: savedProgress.completedSubTopicIds || [],
            completedChallengeIds: savedProgress.completedChallengeIds || [],
            currentStreak: savedProgress.currentStreak || 0,
            totalPoints: savedProgress.totalPoints || 0,
            dailyActivity: savedProgress.dailyActivity || {},
            practiceScore: savedProgress.practiceScore || 0,
            lastStudyDate: savedProgress.lastStudyDate || savedProgress.lastActive
          } as any);
        } else {
          setProgress({
            completedSubTopicIds: [],
            completedChallengeIds: [],
            currentStreak: 0,
            totalPoints: 0,
            dailyActivity: {},
            practiceScore: 0
          } as any);
        }
      } catch (err) {
        console.error("Failed to load progress from cloud:", err);
      }
    }
  };

  const handleStartGoal = async (goal: string, level: KnowledgeLevel = 'beginner') => {
    if (!user) return;
    setIsLoading(true);
    try {
      const apiKey = getKeyForUser(user.uid);
      const newRoadmap = await generateRoadmap(goal, apiKey, level);
      const roadmapId = await saveRoadmapToCloud(user.uid, newRoadmap, 0);
      
      const roadmapWithId = { ...newRoadmap, id: roadmapId };
      setRoadmap(roadmapWithId);
      
      // Reset progress for new roadmap
      const freshProgress = {
        completedSubTopicIds: [],
        completedChallengeIds: [],
        currentStreak: 0,
        totalPoints: 0,
        lastActive: new Date().toISOString(),
        practiceScore: 0
      };
      setProgress(freshProgress);
      await saveProgressToCloud(user.uid, roadmapId, freshProgress);
      
      setView('roadmap');
    } catch (err: any) {
      let elegantMessage = err.message || "Failed to generate your architecture. Please retry.";
      
      // Secondary safety check for JSON strings
      if (elegantMessage.startsWith('{')) {
        try {
          const parsed = JSON.parse(elegantMessage);
          elegantMessage = parsed.error?.message || parsed.message || elegantMessage;
        } catch (e) {}
      }

      showModal({
        title: "Architectural Protocol Error",
        message: elegantMessage,
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSystem = async () => {
    if (!user) return;
    await deleteAllUserRoadmaps(user.uid);
    setRoadmap(null);
    setProgress({
      completedSubTopicIds: [],
      completedChallengeIds: [],
      currentStreak: 0,
      totalPoints: 0,
      lastActive: new Date().toISOString(),
      practiceScore: 0
    });
    setView('home');
  };

  const handleLogout = () => {
    signOut(auth).then(() => setView('landing'));
  };

  return (
    <div className="h-screen bg-bg-primary text-text-primary flex flex-col overflow-hidden relative">
      {/* Neural Continuum (Theme-Aware) */}
      <div className="fixed inset-0 bg-bg-primary -z-50" />
      
      <div 
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
        style={{ viewTransitionName: 'none' } as any}
      >
        {/* Light Rays Background */}
        <LightRays
          count={8}
          color="rgba(124, 111, 250, 0.25)"
          blur={40}
          speed={16}
          length="100vh"
        />
      </div>

      {isAuthLoading ? (
        <div className="flex-1 flex items-center justify-center relative z-50">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-accent-glow/20 border-t-accent-glow rounded-full animate-spin" />
            <div className="absolute inset-0 bg-accent-glow/20 blur-xl animate-pulse" />
          </div>
        </div>
      ) : (!user || view === 'landing') ? (
        <div className="flex-1 relative z-50 overflow-y-auto scrollbar-hide">
          <Landing
            onGoogleSignIn={() => signInWithPopup(auth, googleProvider)}
            isLoggedIn={!!user}
            onNavigateHome={() => setView('home')}
          />
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">


          <main ref={mainContentRef} className="flex-1 overflow-y-auto scrollbar-hide relative z-10 pb-40">
            <AnimatePresence mode="wait" onExitComplete={() => mainContentRef.current?.scrollTo(0, 0)}>
              <motion.div key={view} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}>
                {view === 'home' && <Home user={user} isNeuralReady={isNeuralReady} roadmap={roadmap} onSelectRoadmap={handleSelectRoadmap} onStartGoal={(goal, level) => handleStartGoal(goal, level)} onResetSystem={handleResetSystem} onClearActiveRoadmap={() => setRoadmap(null)} onShowModal={showModal} onLogout={handleLogout} onSetView={setView} />}
                {view === 'roadmap' && roadmap && <RoadmapView roadmap={roadmap} progress={progress} onToggleSubTopic={toggleSubTopic} onNavigateToPractice={() => setView('practice')} selectedNodeId={selectedNodeId} setSelectedNodeId={setSelectedNodeId} />}
                {view === 'planner' && roadmap && <Planner roadmap={roadmap} progress={progress} />}
                {view === 'dashboard' && <Dashboard roadmap={roadmap} progress={progress} />}
                {view === 'practice' && roadmap ? (
                  <PracticeHub 
                    roadmap={roadmap} 
                    progress={progress} 
                    onCompleteChallenge={toggleChallenge}
                    onNavigateHome={() => setView('home')}
                  />
                ) : view === 'practice' ? (
                  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-10">
                    <FlaskConical className="w-16 h-16 text-accent-glow/20" />
                    <h3 className="text-2xl font-serif italic text-text-secondary/60">No Active Mission Found</h3>
                    <p className="text-sm text-text-secondary/40 max-w-md">The Laboratory requires an active Mastery Journey to generate practice protocols.</p>
                    <button onClick={() => setView('home')} className="mt-4 px-8 py-3 bg-accent-glow text-white rounded-xl font-medium text-sm tracking-wide shadow-lg shadow-accent-glow/20 transition-all hover:scale-105">
                      Initialize Mission
                    </button>
                  </div>
                ) : null}
              </motion.div>
            </AnimatePresence>
          </main>

          {view !== 'home' && (
            <div className="fixed bottom-10 left-0 right-0 z-[500] flex flex-col items-center">
              <TooltipProvider>
                <Dock direction="middle" className="bg-bg-surface/50 border-white/10 text-white">
                  {navItems.map((item) => (
                    <DockIcon key={item.id} className={cn(view === item.id && "bg-accent-glow/15 border border-accent-glow/30")}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => setView(item.id as View)}
                            aria-label={item.label}
                            className={cn(
                              buttonVariants({ variant: "ghost", size: "icon" }),
                              "size-12 rounded-full transition-all",
                              view === item.id ? "text-white" : "text-text-muted/50 hover:text-white"
                            )}
                          >
                            <item.icon className="size-5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs font-medium">{item.label}</p>
                        </TooltipContent>
                      </Tooltip>
                    </DockIcon>
                  ))}
                  
                  <Separator orientation="vertical" className="h-8 mx-1 bg-white/10" />

                  {/* System Action Icons */}
                  <DockIcon>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={handleLogout}
                          className={cn(
                            buttonVariants({ variant: "ghost", size: "icon" }),
                            "size-12 rounded-full text-text-muted/50 hover:text-accent-danger hover:bg-accent-danger/5 transition-all"
                          )}
                        >
                          <LogOut className="size-5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs font-medium text-accent-danger">Terminate Session</p>
                      </TooltipContent>
                    </Tooltip>
                  </DockIcon>
                </Dock>
              </TooltipProvider>
            </div>
          )}

          {/* Global Neural Detail Overlay (Stacking Fix) */}
          <AnimatePresence>
            {selectedNodeId && roadmap && (
              <RoadmapDetailOverlay 
                node={roadmap.nodes.find(n => n.id === selectedNodeId)!}
                progress={progress}
                onClose={() => setSelectedNodeId(null)}
                onToggleSubTopic={toggleSubTopic}
                onUpdateSubTopicResources={handleUpdateSubTopicResources}
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isLoading && <LoadingScreen />}
          </AnimatePresence>

          <Modal {...modalConfig} onClose={closeModal} />
        </div>
      )}
    </div>
  );
}
