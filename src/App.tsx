
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
  Loader2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Components
import Landing from './components/Landing';
import Home from './components/Home';
import RoadmapView from './components/RoadmapView';
import Planner from './components/Planner';
import Dashboard from './components/Dashboard';
import PracticeHub from './components/PracticeHub';
import Modal from './components/Modal';
import RoadmapDetailOverlay from './components/RoadmapDetailOverlay';
import { Dock, DockIcon, DockSeparator } from './components/Dock';
import LoadingScreen from './components/LoadingScreen';
import Balatro from './components/Balatro';

// Libs

import { generateRoadmap } from './lib/gemini';
import { getKeyForUser, setCloudKeys } from './lib/keys';
import { 
  saveProgressToCloud, 
  getProgressFromCloud, 
  syncUserProfile, 
  deleteAllUserRoadmaps,
  getAPIKeys,
  saveRoadmapToCloud
} from './lib/firestore';
import { Roadmap, UserProgress, ModalConfig } from './types';

import { AnimatedThemeToggler } from './components/AnimatedThemeToggler';

type View = 'landing' | 'home' | 'roadmap' | 'planner' | 'practice' | 'dashboard';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [view, setView] = useState<View>('landing');
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => 
    typeof document !== 'undefined' ? document.documentElement.classList.contains("dark") : true
  );
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

  // Sync theme state
  useEffect(() => {
    const updateTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setIsProfileMenuOpen(false);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

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

  const handleSelectRoadmap = (selected: Roadmap) => {
    setRoadmap(selected);
    setView('roadmap');
  };

  const handleStartGoal = async (goal: string) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const apiKey = getKeyForUser(user.uid);
      const newRoadmap = await generateRoadmap(goal, apiKey);
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
        {/* Native Balatro Neural Shader */}
        <div className="absolute inset-0 opacity-80">
          <Balatro
            isRotate={false}
            mouseInteraction={true}
            pixelFilter={2000}
            color1="#2c2e6c"
            color2={isDark ? "#000000" : "#ffffff"}
            color3={isDark ? "#000000" : "#9697e9"}
            isPaused={isLoading}
          />
        </div>

        {/* Global Noise Texture Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' /%3E%3C/svg%3E")` }}
        />

        {/* Global Frosty Glass Detail Overlay - Architectural Moderate */}
        <div className={`absolute inset-0 transition-all duration-500 ${isDark ? 'backdrop-blur-[5px] bg-[#04040d]/30' : 'backdrop-blur-[5px] bg-white/25'}`} />
      </div>

      {isAuthLoading ? (
        <div className="flex-1 flex items-center justify-center relative z-50">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-accent-glow/20 border-t-accent-glow rounded-full animate-spin" />
            <div className="absolute inset-0 bg-accent-glow/20 blur-xl animate-pulse" />
          </div>
        </div>
      ) : !user ? (
        <div className="flex-1 relative z-50 overflow-y-auto scrollbar-hide">
          <Landing 
            onGetStarted={() => showModal({
              title: "Authentication Required",
              message: "Please sign in with Google to architect your intellectual destiny.",
              type: 'info'
            })} 
            onGoogleSignIn={() => signInWithPopup(auth, googleProvider)} 
          />
        </div>
      ) : (
        <>
          <header className="relative z-50 px-8 py-6 flex items-center justify-between border-b border-border-primary backdrop-blur-md bg-bg-primary/40">
            <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setView('home')}>
              <div className="w-10 h-10 bg-accent-glow rounded-lg flex items-center justify-center text-white shadow-lg shadow-accent-glow/20 group-hover:scale-110 transition-transform">
                <Book className="w-6 h-6" />
              </div>
              <h1 className="text-xl font-black tracking-tighter uppercase italic">Ascent <span className="text-accent-glow">AI</span></h1>
            </div>

            <div className="flex items-center gap-6">
              {isLoading && (
                <div className="flex items-center gap-3 px-4 py-2 bg-accent-glow/10 rounded-full border border-border-pill animate-pulse">
                  <Loader2 className="w-4 h-4 text-accent-glow animate-spin" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-accent-glow">Architecting Knowledge...</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <AnimatedThemeToggler variant="circle" />
                
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="w-10 h-10 rounded-full border-2 border-accent-glow/30 overflow-hidden hover:border-accent-glow transition-all"
                  >
                    <img src={user.photoURL || ''} alt="User" className="w-full h-full object-cover" referrerPolicy="no-referrer" crossOrigin="anonymous" />
                  </button>

                  <AnimatePresence>
                    {isProfileMenuOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full right-0 mt-4 w-48 py-2 rounded-2xl bg-bg-secondary border border-border-pill shadow-2xl backdrop-blur-xl z-[100]"
                      >
                        <div className="px-4 py-3 border-b border-border-primary mb-2">
                          <p className="text-[9px] text-text-muted uppercase tracking-widest font-black">Authenticated</p>
                          <h3 className="text-xs font-bold truncate text-text-primary">{user.displayName}</h3>
                        </div>
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-text-muted hover:text-rose-500 hover:bg-rose-500/5 transition-all"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </header>

          <main ref={mainContentRef} className="flex-1 overflow-y-auto scrollbar-hide relative z-10 pb-40">
            <AnimatePresence mode="wait">
              <motion.div key={view} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}>
                {view === 'home' && <Home user={user} isNeuralReady={isNeuralReady} roadmap={roadmap} onSelectRoadmap={handleSelectRoadmap} onStartGoal={handleStartGoal} onResetSystem={handleResetSystem} onClearActiveRoadmap={() => setRoadmap(null)} onShowModal={showModal} />}
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
                    <p className="text-sm text-text-secondary/40 max-w-md uppercase tracking-widest leading-loose">The Laboratory requires an active Mastery Journey to generate practice protocols.</p>
                    <button onClick={() => setView('home')} className="mt-4 px-8 py-3 bg-accent-glow text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-accent-glow/20 transition-all hover:scale-105">Initialize Mission</button>
                  </div>
                ) : null}
              </motion.div>
            </AnimatePresence>
          </main>

          {/* Global Neural Detail Overlay (Stacking Fix) */}
          <AnimatePresence>
            {selectedNodeId && roadmap && (
              <RoadmapDetailOverlay 
                node={roadmap.nodes.find(n => n.id === selectedNodeId)!}
                progress={progress}
                onClose={() => setSelectedNodeId(null)}
                onToggleSubTopic={toggleSubTopic}
              />
            )}
          </AnimatePresence>

          {view !== 'home' && (
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200]">
              <Dock>
                {navItems.slice(0, 3).map((item) => (
                  <DockIcon 
                    key={item.id} 
                    onClick={() => setView(item.id as View)}
                    label={item.label}
                    active={view === item.id}
                    hasNotification={item.id === 'planner' && progress.completedSubTopicIds.length === 0} // Example: notification if no progress
                  >
                    <item.icon className="w-full h-full" />
                  </DockIcon>
                ))}
                <DockSeparator />
                {navItems.slice(3).map((item) => (
                  <DockIcon 
                    key={item.id} 
                    onClick={() => setView(item.id as View)}
                    label={item.label}
                    active={view === item.id}
                  >
                    <item.icon className="w-full h-full" />
                  </DockIcon>
                ))}
              </Dock>
            </div>
          )}

          <AnimatePresence>
            {isLoading && <LoadingScreen />}
          </AnimatePresence>

          <Modal {...modalConfig} onClose={closeModal} />
        </>
      )}
    </div>
  );
}
