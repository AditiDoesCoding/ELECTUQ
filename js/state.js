// === Central State Module ===
// All localStorage interactions go through getState / setState.

export let appState = {
    lang: localStorage.getItem('electuq_lang') || 'en',
    dark: localStorage.getItem('electuq_dark') === 'true',
    lastPct: 0
};

export let journeyState = JSON.parse(localStorage.getItem('electuq_journey')) || {};

/** Read a raw string value from localStorage */
export function getState(key) {
    return localStorage.getItem(key);
}

/** Write a raw string value to localStorage */
export function setState(key, value) {
    localStorage.setItem(key, value);
}

/** Read a JSON-parsed value from localStorage */
export function getJSON(key, fallback = null) {
    try {
        return JSON.parse(localStorage.getItem(key)) || fallback;
    } catch {
        return fallback;
    }
}

/** Write a JSON-stringified value to localStorage */
export function setJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}
