import { 
  getFirestore, collection, addDoc, query, where, getDocs, 
  orderBy, doc, setDoc, getDoc, deleteDoc, writeBatch, serverTimestamp
} from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const syncUserProfile = async (user: any) => {
  const userRef = doc(db, 'users', user.uid);
  await setDoc(userRef, {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    lastSeen: serverTimestamp()
  }, { merge: true });
};

export const saveRoadmapToCloud = async (userId: string, roadmap: any, completion: number) => {
  const docRef = await addDoc(collection(db, 'users', userId, 'roadmaps'), {
    ...roadmap, userId, completion,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
};

export const getUserRoadmaps = async (userId: string) => {
  const q = query(collection(db, 'users', userId, 'roadmaps'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const deleteRoadmapFromCloud = async (userId: string, roadmapId: string) => {
  await deleteDoc(doc(db, 'users', userId, 'roadmaps', roadmapId));
};

export const deleteAllUserRoadmaps = async (userId: string) => {
  const q = query(collection(db, 'users', userId, 'roadmaps'));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return;
  const batch = writeBatch(db);
  snapshot.docs.forEach(d => batch.delete(d.ref));
  await batch.commit();
};

export const saveProgressToCloud = async (userId: string, roadmapId: string, progress: any) => {
  const progressRef = doc(db, 'users', userId, 'progress', roadmapId);
  await setDoc(progressRef, { ...progress, updatedAt: serverTimestamp() });
};

export const getProgressFromCloud = async (userId: string, roadmapId: string) => {
  const progressRef = doc(db, 'users', userId, 'progress', roadmapId);
  const snapshot = await getDoc(progressRef);
  return snapshot.exists() ? snapshot.data() : null;
};

// --- Config Layer (Centralized Keys) ---
export const getAPIKeys = async () => {
  const paths = [
    { coll: 'progress', docId: 'keys' },
    { coll: 'config', docId: 'keys' }
  ];

  for (const path of paths) {
    try {
      console.log(`[Neural Probe] Checking ${path.coll}/${path.docId}...`);
      const configRef = doc(db, path.coll, path.docId);
      const snapshot = await getDoc(configRef);
      
      if (snapshot.exists()) {
        const data = snapshot.data();
        console.log(`[Neural Probe] Document found at ${path.coll}/${path.docId}`, data);
        if (data.pool && Array.isArray(data.pool)) return data.pool;
        if (data.keys && Array.isArray(data.keys)) return data.keys;
      }
    } catch (err: any) {
      console.warn(`[Neural Probe] Path ${path.coll}/${path.docId} failed:`, err.message);
      if (err.message.includes("permission-denied")) {
        throw new Error("FIREBASE_PERMISSION_DENIED: Check your Firestore Security Rules.");
      }
    }
  }
  return [];
};
