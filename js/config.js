/**
 * ElectUQ Enterprise Configuration
 * Centralized constants for model racing, timeouts, and state keys.
 */
export const CONFIG = {
    AI: {
        MODELS: [
            "gemini-2.5-flash", 
            "gemini-2.0-flash", 
            "gemini-1.5-pro", 
            "gemini-1.5-flash"
        ],
        TIMEOUT_MS: 9000,
        MAX_HISTORY: 10,
        MAX_MESSAGE_LENGTH: 2000
    },
    STATE_KEYS: {
        JOURNEY: 'electuq_journey',
        WIZARD: 'electuq_wiz',
        THEME: 'electuq_dark',
        LANG: 'electuq_lang',
        VISITED: 'electuq_visited_v3',
        ACTIVE_TAB: 'electuq_active_tab'
    },
    APP: {
        VERSION: '1.2.0',
        ENV: 'production',
        ECI_QUALIFYING_DATE: '2026-01-01'
    }
};
