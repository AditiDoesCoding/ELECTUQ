// === Central State Module ===
// All localStorage interactions go through getState / setState.

const safeStorage = typeof localStorage !== 'undefined' ? localStorage : { getItem: () => null, setItem: () => null };

export let appState = {
    lang: safeStorage.getItem('electuq_lang') || 'en',
    dark: safeStorage.getItem('electuq_dark') === 'true',
    lastPct: 0
};

export let journeyState = JSON.parse(safeStorage.getItem('electuq_journey') || '{}');

export function getState(key) {
    return safeStorage.getItem(key);
}

/** Write a raw string value to localStorage */
export function setState(key, value) {
    safeStorage.setItem(key, value);
}

/** Read a JSON-parsed value from localStorage */
export function getJSON(key, fallback = null) {
    try {
        return JSON.parse(safeStorage.getItem(key)) || fallback;
    } catch {
        return fallback;
    }
}

/** Write a JSON-stringified value to localStorage */
export function setJSON(key, value) {
    safeStorage.setItem(key, JSON.stringify(value));
}
