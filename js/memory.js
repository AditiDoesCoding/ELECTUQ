// === Agent Memory Layer ===
// Persistent memory for Q Dost: session + long-term.
// Injected into the system prompt as MEMORY CONTEXT.

import { getJSON, setJSON } from './state.js';

const MEMORY_KEY = 'electuq_agent_memory';

const STEP_LABELS = {
    s1: 'Check Eligibility',
    s2: 'Enroll on Electoral Roll',
    s3: 'Get EPIC Card',
    s4: 'Find Your Booth',
    s5: 'Check Voter List',
    s6: 'Know Your Candidates',
    s7: 'Prepare Valid ID',
    s8: 'Vote & Result'
};

const STEP_ORDER = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8'];

function defaultMemory() {
    return {
        sessionMemory: {
            lastIntent: null,
            lastQuery: null,
            turnCount: 0,
            topicsDiscussed: []
        },
        longTermMemory: {
            eligibilityResult: null,    // 'eligible' | 'underage' | 'not_citizen' | 'not_registered' | null
            lastStep: null,             // last journey step interacted with
            completedTopics: [],        // topics the user already asked about
            firstVisit: new Date().toISOString(),
            lastVisit: new Date().toISOString()
        }
    };
}

/** Load or initialize memory from localStorage */
export function loadMemory() {
    const stored = getJSON(MEMORY_KEY, null);
    if (stored && stored.sessionMemory && stored.longTermMemory) {
        // Reset session on fresh page load (turnCount=0 signals fresh)
        stored.sessionMemory.turnCount = stored.sessionMemory.turnCount || 0;
        stored.longTermMemory.lastVisit = new Date().toISOString();
        return stored;
    }
    return defaultMemory();
}

/** Persist memory to localStorage */
export function saveMemory(memory) {
    setJSON(MEMORY_KEY, memory);
}

/**
 * Record a user interaction — call before sending to Gemini.
 * Updates session + long-term memory with intent and query.
 */
export function recordInteraction(memory, query, intent) {
    // Session
    memory.sessionMemory.lastIntent = intent;
    memory.sessionMemory.lastQuery = query;
    memory.sessionMemory.turnCount += 1;

    // Track unique topics discussed
    if (intent !== 'general' && !memory.sessionMemory.topicsDiscussed.includes(intent)) {
        memory.sessionMemory.topicsDiscussed.push(intent);
    }

    // Long-term: persist topic coverage
    if (intent !== 'general' && !memory.longTermMemory.completedTopics.includes(intent)) {
        memory.longTermMemory.completedTopics.push(intent);
    }

    saveMemory(memory);
    return memory;
}

/**
 * Record eligibility result from wizard answers.
 * Called when wizard state changes.
 */
export function recordEligibility(memory) {
    const wiz = getJSON('electuq_wiz', {});
    if (wiz[1] === 'under18') {
        memory.longTermMemory.eligibilityResult = 'underage';
    } else if (wiz[2] === 'no') {
        memory.longTermMemory.eligibilityResult = 'not_citizen';
    } else if (wiz[3] === 'no') {
        memory.longTermMemory.eligibilityResult = 'not_registered';
    } else if (wiz[3] === 'yes') {
        memory.longTermMemory.eligibilityResult = 'eligible';
    }
    saveMemory(memory);
    return memory;
}


// === Step Planning System ===

/**
 * Determine currentStep and nextStep from journey state.
 * Returns a planning context string for the system prompt.
 */
export function getPlanningContext() {
    const journey = getJSON('electuq_journey', {});
    const wiz = getJSON('electuq_wiz', {});

    // Find current position in the journey
    let currentStep = null;
    let nextStep = null;
    let completedCount = 0;

    for (const key of STEP_ORDER) {
        if (journey[key]) {
            currentStep = key;
            completedCount++;
        }
    }

    // Find the first incomplete step
    for (const key of STEP_ORDER) {
        if (!journey[key]) {
            nextStep = key;
            break;
        }
    }

    // Build planning string
    const lines = [];

    if (completedCount === 0 && !wiz[1]) {
        lines.push('User has NOT started. Goal: get them to take the eligibility check (Step 0).');
        lines.push('Suggested action: navigate to "eligible" tab.');
    } else if (completedCount === 0) {
        lines.push('User completed eligibility check but has 0/8 journey steps.');
        lines.push(`Goal: move them to "${STEP_LABELS[nextStep]}" (${nextStep}).`);
        lines.push('Suggested action: navigate to "journey" tab.');
    } else if (completedCount === 8) {
        lines.push('User has completed ALL 8 steps — they are an Election Champion.');
        lines.push('Goal: celebrate and prompt them to download their certificate.');
        lines.push('Suggested action: navigate to "journey" tab for certificate.');
    } else {
        lines.push(`User is at step "${STEP_LABELS[currentStep]}" (${currentStep}), ${completedCount}/8 done.`);
        lines.push(`Goal: move them to "${STEP_LABELS[nextStep]}" (${nextStep}).`);

        // Contextual guidance for the next step
        const nudges = {
            s1: 'Suggest they verify their name on the electoral roll.',
            s2: 'Guide them through Form 6 submission on voters.eci.gov.in.',
            s3: 'Help them download their e-EPIC card.',
            s4: 'Point them to the booth finder with their PIN code.',
            s5: 'Remind them to cross-check the voter list before polling day.',
            s6: 'Suggest using myneta.info to research candidates.',
            s7: 'Ask which valid ID they plan to carry on polling day.',
            s8: 'Encourage them — the finish line is near!'
        };
        if (nudges[nextStep]) lines.push(`Tip: ${nudges[nextStep]}`);
    }

    return `PLANNING:\n${lines.join('\n')}`;
}


// === Memory Context for Prompt ===

/**
 * Returns a formatted MEMORY CONTEXT block for the system prompt.
 */
export function getMemoryContext(memory) {
    const sm = memory.sessionMemory;
    const lm = memory.longTermMemory;

    const parts = [];

    // Session awareness
    parts.push(`Turn: ${sm.turnCount} in this session.`);
    if (sm.lastIntent) parts.push(`Last intent: "${sm.lastIntent}".`);
    if (sm.topicsDiscussed.length > 0) {
        parts.push(`Topics covered this session: ${sm.topicsDiscussed.join(', ')}.`);
    }

    // Long-term awareness
    if (lm.eligibilityResult) {
        const labels = {
            'eligible': 'Eligible and registered ✅',
            'underage': 'Under 18 — not yet eligible',
            'not_citizen': 'Not an Indian citizen',
            'not_registered': 'Eligible but NOT registered yet'
        };
        parts.push(`Eligibility: ${labels[lm.eligibilityResult] || lm.eligibilityResult}.`);
    }

    if (lm.completedTopics.length > 0) {
        parts.push(`Previously discussed topics: ${lm.completedTopics.join(', ')}.`);
        parts.push('Avoid repeating information the user already knows. Build on prior context.');
    }

    return `MEMORY CONTEXT:\n${parts.join('\n')}`;
}


// === Response Enforcement ===

const FALLBACK_QUESTIONS = {
    'registration': 'Would you like me to walk you through the Form 6 process step by step?',
    'polling': 'Want to try casting a mock vote in our EVM simulator?',
    'eligibility': 'Shall we run the 30-second eligibility check together?',
    'readiness': 'Which pending step would you like to tackle next?',
    'general': 'What aspect of the 2026 elections are you most curious about?'
};

/**
 * Validate and enforce response quality.
 * Ensures every response contains a follow-up question.
 * If not, appends a contextual one based on the current intent.
 */
export function enforceResponse(responseText, intent) {
    if (!responseText || typeof responseText !== 'string') return responseText;

    const hasQuestion = responseText.includes('?');
    const hasAction = /\[NAV:\w+\]/.test(responseText) ||
                      (typeof responseText === 'object' && responseText.action);

    if (hasQuestion) return responseText;

    // Append a contextual follow-up question
    const fallback = FALLBACK_QUESTIONS[intent] || FALLBACK_QUESTIONS['general'];
    return responseText.trim() + '\n\n' + fallback;
}
