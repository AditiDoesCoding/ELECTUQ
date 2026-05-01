// === Future-Ready Persistence Layer ===
// Abstraction layer for user state persistence.
// Currently backed by localStorage for zero-config deployment.
// Future: Firebase / Supabase integration point for cross-device sync.

import { getJSON, setJSON } from './state.js';

/**
 * Load user state from persistence layer.
 * 
 * Future implementation:
 * const doc = await getDoc(doc(db, "users", userId));
 * return doc.data();
 */
export async function loadUserState(userId = 'local_user') {
    return new Promise((resolve) => {
        // Simulate network latency for future-proofing async flow
        setTimeout(() => {
            const data = {
                journey: getJSON('electuq_journey', {}),
                wiz: getJSON('electuq_wiz', {}),
                agentMemory: getJSON('electuq_agent_memory', null),
                settings: {
                    lang: localStorage.getItem('electuq_lang') || 'en',
                    dark: localStorage.getItem('electuq_dark') === 'true'
                }
            };
            resolve(data);
        }, 50);
    });
}

/**
 * Save user state to persistence layer.
 * 
 * Future implementation:
 * await setDoc(doc(db, "users", userId), data, { merge: true });
 */
export async function saveUserState(userId = 'local_user', data) {
    return new Promise((resolve) => {
        // Synchronous write to local storage (acts as local cache/current DB)
        if (data.journey) setJSON('electuq_journey', data.journey);
        if (data.wiz) setJSON('electuq_wiz', data.wiz);
        if (data.agentMemory) setJSON('electuq_agent_memory', data.agentMemory);
        
        if (data.settings) {
            if (data.settings.lang) localStorage.setItem('electuq_lang', data.settings.lang);
            if (data.settings.dark !== undefined) localStorage.setItem('electuq_dark', data.settings.dark);
        }
        
        // Simulate network latency
        setTimeout(() => {
            resolve({ success: true, timestamp: new Date().toISOString() });
        }, 50);
    });
}
