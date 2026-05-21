# Release Notes: Ascent AI v0.2.0 🧠🌌

> **Codename**: *Neural Synthesis II*
> Ascent AI has transitioned into a highly synchronized, cloud-backed intelligence platform. This release introduces Firebase Auth, real-time database synchronization, Google search grounding, and major performance optimizations.

---

## 🔐 Google Auth & Cloud Synchronization
* **Firebase-backed Google Sign-In**: Integrated standard Google Authentication (`signInWithPopup`, `GoogleAuthProvider`) allowing users to seamlessly log in with their Google accounts.
* **Real-time Profile Sync**: Implemented automatic syncing of user details (`uid`, `email`, `displayName`, `photoURL`) upon login to establish secure, personalized session profiles.
* **Persistent Roadmap & Progress Tracking**:
  * Save generated mindmaps directly to the cloud.
  * Synchronize user checklist progress in real-time, allowing users to pause and pick up their learning trajectory on any device.

## ⚡ Performance & Efficiency Optimizations
* **Non-Blocking Immediate UI Activation**: The application now immediately unlocks the main interface (`setIsNeuralReady(true)`) upon state detection and performs database syncing and key retrievals asynchronously in the background.
* **Centralized API Key Pool ("Neural Probe")**: Bypasses environment variable restrictions by dynamically probing and caching Firestore key collections to resolve API fallback pools on-the-fly.
* **Batched Cloud Cleanups**: Implemented Firestore `writeBatch` execution to delete user roadmap collections in bulk, reducing multiple network roundtrips to a single transaction.
* **DuckDuckGo Redirect Protocol**: Pre-empts layout lag and broken URLs by resolving resources directly through DuckDuckGo's "!ducky" redirects, ensuring instant resource load times.

## 🌌 UI Polish & Web Grounding
* **Pulsing Neural Background**: Swapped out the old liquid shader background for an interactive node-connection network.
* **Cormorant Branding**: Integrated a premium serif-based brand header using Cormorant Garamond with fine-tuned tracking.
* **Context-Aware Navigation Dock**: Replaced static route headers with a dynamic, bottom-aligned routes menu.
* **Clean Loading States**: Centered the roadmap loader and removed unnecessary visual components to focus attention on the generation metrics.
