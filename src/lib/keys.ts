/**
 * Dynamic Neural Key Router
 * Deterministically assigns a Gemini API key from a cloud-managed pool.
 */

let cloudKeyPool: string[] = [];

/**
 * Injects the live key pool fetched from Firestore.
 */
export function setCloudKeys(keys: string[]) {
  cloudKeyPool = keys.filter(k => k && k.trim() !== '');
  console.log(`[Neural Router] Cloud Pool Synchronized. Active Keys: ${cloudKeyPool.length}`);
}

/**
 * Deterministically assigns an API key to a user from the cloud pool.
 */
export function getKeyForUser(uid: string): string {
  // Priority: Use Cloud Pool if available
  if (cloudKeyPool.length > 0) {
    let hash = 0;
    for (let i = 0; i < uid.length; i++) {
      hash = ((hash << 5) - hash) + uid.charCodeAt(i);
      hash |= 0;
    }
    const index = Math.abs(hash) % cloudKeyPool.length;
    console.log(`[Neural Router] Routing to Cloud Slot ${index + 1} of ${cloudKeyPool.length}`);
    return cloudKeyPool[index];
  }

  // Secondary: Fallback to static .env for development/testing
  const staticKeys = [
    import.meta.env.VITE_GEMINI_KEY_1,
    import.meta.env.VITE_GEMINI_API_KEY
  ].filter(k => k && k.trim() !== '' && !k.includes('your_shared_api_key'));

  if (staticKeys.length > 0) {
    console.log(`[Neural Router] Cloud Pool empty. Using Local/Static Fallback.`);
    return staticKeys[0];
  }

  console.error(`[Neural Router] CRITICAL: No API keys found in Cloud or .env`);
  return '';
}

export function hasAvailableKeys(): boolean {
  return cloudKeyPool.length > 0 || !!import.meta.env.VITE_GEMINI_KEY_1;
}
