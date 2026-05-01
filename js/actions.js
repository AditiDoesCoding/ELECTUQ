// === Action Map Module ===
// Replaces the if-chain event delegation with a declarative action map.

import { appState, setState } from './state.js';
import { applyTheme, applyLang } from './theme.js';
import { fullGlossary, renderGlossary } from './glossary.js';
import { handleChatSend } from './chat.js';
import { showPhase, updateQDostStrip } from './ui.js';
import { showBoothInfo, openEVM, closeEVM, castVote } from './evm.js';
import {
    toggleStep, openWizModal, closeWizModal,
    wizAnswer, wizReset, generateScoreCard, updateScore
} from './journey.js';


// --- Tab & Navigation ---

// Global tab progress tracker
let visitedTabs = new Set(['home']);

export function showTab(tabName) {
    setState('electuq_active_tab', tabName);
    document.querySelectorAll('.tab-panel').forEach(tab => {
        tab.style.display = 'none';
        tab.classList.remove('active');
    });

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.setAttribute('aria-selected', 'false');
    });

    const selected = document.getElementById('panel-' + tabName);
    if (selected) {
        selected.style.display = 'block';
        selected.classList.add('active');
    }

    const btn = document.querySelector(`[data-tab="${tabName}"]`);
    if (btn) btn.setAttribute('aria-selected', 'true');

    if (tabName === 'journey') updateScore();
    if (tabName === 'home') updateQDostStrip();
    if (tabName === 'glossary') {
        const gContainer = document.getElementById('glossary-container');
        if (gContainer) renderGlossary(gContainer, fullGlossary);
    }

    // Refresh guide if it's open
    if (document.getElementById('guide-bubble')?.classList.contains('active')) {
        window.updateGuideContext();
    }

    // Tab Progress Indicator with label
    visitedTabs.add(tabName);
    const totalTabs = 7;
    const progressEl = document.getElementById('top-progress-bar');
    const labelEl = document.getElementById('progress-bar-label');
    const stripEl = document.getElementById('progress-label-strip');
    if (progressEl) {
        const pct = (visitedTabs.size / totalTabs) * 100;
        progressEl.style.width = pct + '%';
    }
    if (labelEl && stripEl) {
        labelEl.textContent = `✦ ${visitedTabs.size}/${totalTabs} sections explored`;
        stripEl.style.display = 'block';
    }
}

export function toggleMoreTabs() {
    const drawer = document.getElementById('more-tabs-drawer');
    const btn = document.getElementById('more-tabs-btn');
    if (drawer && btn) {
        const isHidden = drawer.style.display === 'none';
        drawer.style.display = isHidden ? 'flex' : 'none';
        btn.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
    }
}

// Mobile Responsiveness: Close drawer on outside click
document.addEventListener('click', (e) => {
    const drawer = document.getElementById('more-tabs-drawer');
    const btn = document.getElementById('more-tabs-btn');
    if (drawer && btn && drawer.style.display === 'flex') {
        if (!drawer.contains(e.target) && !btn.contains(e.target)) {
            drawer.style.display = 'none';
            btn.setAttribute('aria-expanded', 'false');
        }
    }
});

export function toggleDarkMode() {
    appState.dark = !appState.dark;
    setState('electuq_dark', appState.dark);
    applyTheme(appState.dark);
}

export function toggleLang() {
    appState.lang = appState.lang === 'en' ? 'hi' : 'en';
    setState('electuq_lang', appState.lang);
    applyLang(appState.lang);
}


// --- Action Map ---

const actionMap = {
    'toggle-dark':      () => toggleDarkMode(),
    'toggle-lang':      () => toggleLang(),
    'show-tab':         (el) => showTab(el.getAttribute('data-tab')),
    'show-tab-more':    (el) => { showTab(el.getAttribute('data-tab')); toggleMoreTabs(); },
    'toggle-more-tabs': () => toggleMoreTabs(),
    'scroll-to':        (el) => {
        const t = document.getElementById(el.getAttribute('data-target'));
        if (t) t.scrollIntoView({ behavior: 'smooth' });
    },
    'show-booth-info':  (el) => showBoothInfo(el.getAttribute('data-booth')),
    'open-evm':         () => openEVM(),
    'close-evm':        () => closeEVM(),
    'generate-cert':    () => generateScoreCard(),
    'close-wiz':        () => closeWizModal(),
    'wiz-answer':       (el) => wizAnswer(parseInt(el.getAttribute('data-step')), el.getAttribute('data-val')),
    'wiz-reset':        () => wizReset(),
    'close-booth-info': () => {
        const p = document.getElementById('booth-info-panel');
        if (p) p.style.display = 'none';
    },
    'toggle-step':      (el) => toggleStep(el.getAttribute('data-step-id'), el),
    'show-phase':       (el) => showPhase(parseInt(el.getAttribute('data-idx'))),
    'flip-myth':        (el) => el.classList.toggle('flipped'),
    'open-wiz':         () => openWizModal(),
    'cast-vote':        (el) => castVote(parseInt(el.getAttribute('data-idx')), el.getAttribute('data-name'), el.getAttribute('data-symbol')),
    'quick-ask':        (el) => {
        document.getElementById('chat-input').value = el.getAttribute('data-q');
        handleChatSend();
    }
};

export function handleAction(e) {
    const actionEl = e.target.closest('[data-action]');
    if (!actionEl) return;
    const action = actionEl.getAttribute('data-action');

    const handler = actionMap[action];
    if (handler) handler(actionEl);
}
