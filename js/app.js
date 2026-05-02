// === App Entry Point ===
// Thin orchestrator: boots the app, wires up event delegation,
// and coordinates modules. No business logic lives here.

import { appState, getJSON, setState, getState } from './state.js';
import { applyTheme, applyLang } from './theme.js';
import { fullGlossary, renderGlossary } from './glossary.js';
import { handleChatSend, initChat } from './chat.js';
import { renderTimeline, renderMyths, updateQDostStrip, focusManager } from './ui.js';
import { initJourney, updateScore } from './journey.js';
import { handleAction, showTab } from './actions.js';


// === Boot ===

function bootApp() {
    // console.log("ElectUQ: Booting application...");
    document.addEventListener('click', handleAction);
    document.addEventListener('keydown', (e) => {
        if ((e.key === 'Enter' || e.key === ' ') && e.target.getAttribute('role') === 'button') {
            e.preventDefault();
            handleAction(e);
        }
    });

    const hideLoader = () => {
        const loader = document.getElementById('app-loading');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
                document.body.classList.remove('antigravity-scroll-lock');
            }, 500);
        }
    };

    try {
        init();
        // console.log("ElectUQ: Initialization successful.");
    } catch (error) {
        console.error("ElectUQ: Initialization failed:", error);
    } finally {
        hideLoader();
    }
}


// === Initialization ===

function init() {
    // 1. Setup Theme & Language
    applyTheme(appState.dark);
    applyLang(appState.lang);

    // 2. Render UI Components
    renderTimeline();
    initJourney();
    renderMyths();

    const gContainer = document.getElementById('glossary-container');
    if (gContainer) renderGlossary(gContainer, fullGlossary);
    initFinder();

    // 3. Setup Persistent Tab State
    const savedTab = getState('electuq_active_tab');
    if (savedTab) {
        showTab(savedTab);
    } else {
        showTab('home'); // explicitly trigger showTab on load to initialize progress strip
    }

    // 4. Setup Chat
    initChat();

    document.getElementById('state-select')?.addEventListener('change', lookupState);
    document.getElementById('btn-lookup-pin')?.addEventListener('click', lookupPin);

    // Accessibility: add aria-label to chat send button
    const sendBtn = document.getElementById('btn-chat-send');
    if (sendBtn) {
        sendBtn.setAttribute('aria-label', 'Send message to Q Dost');
        sendBtn.addEventListener('click', handleChatSend);
    }

    document.getElementById('chat-preset-select')?.addEventListener('change', (e) => {
        const input = document.getElementById('chat-input');
        if (input && e.target.value) {
            input.value = e.target.value;
            input.focus();
        }
    });
    document.getElementById('chat-input')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleChatSend();
    });

    // 3. Modals & Guided Context
    checkOnboarding();
    updateGuideContext();
    if (typeof updateQDostStrip === 'function') updateQDostStrip();

    // 4. Default View
    showTab('home');

    // 5. Proactive AI Guide Delay
    setTimeout(() => {
        toggleGuide(true);
    }, 5000);

    // 6. Fact Rotation
    initFactRotation();
}


// === Header Fact Rotation ===

const facts = [
    "🎂 ECI established: January 25, 1950",
    "🇮🇳 First general election: 1951-52",
    "📮 EVMs first used in 1982 (Kerala)",
    "🤳 VVPAT first used in 2013 (Nagaland)",
    "🗳️ NOTA option introduced in 2013",
    "👥 Over 960 million registered voters",
    "🌍 Largest democratic election in the world"
];

function initFactRotation() {
    const el = document.getElementById('header-fact-display');
    if (!el) return;
    let index = 0;
    setInterval(() => {
        el.classList.add('fade-out');
        setTimeout(() => {
            index = (index + 1) % facts.length;
            el.textContent = facts[index];
            el.classList.remove('fade-out');
        }, 500); // Matches the CSS transition duration
    }, 6000); // Rotate every 6 seconds
}


// === Q Dost Proactive Guide Logic ===

export function toggleGuide(forceState) {
    const bubble = document.getElementById('guide-bubble');
    if (!bubble) return;
    const isShowing = bubble.classList.contains('active');
    const target = (forceState !== undefined) ? forceState : !isShowing;

    if (target) {
        bubble.classList.add('active');
        updateGuideContext();
    } else {
        bubble.classList.remove('active');
    }
}

export function updateGuideContext() {
    const textEl = document.getElementById('guide-text');
    const actionBtn = document.getElementById('guide-action');
    if (!textEl || !actionBtn) return;

    const js = getJSON('electuq_journey', {});
    const wiz = getJSON('electuq_wiz', {});
    const completedCount = Object.values(js).filter(Boolean).length;

    if (!wiz[1]) {
        textEl.textContent = "Welcome! Are you eligible to vote? Let's check in 30 seconds.";
        actionBtn.textContent = "Check Eligibility";
        actionBtn.onclick = () => { showTab('journey'); toggleGuide(false); };
    } else if (completedCount === 0) {
        textEl.textContent = "Great! Now, let's start your 8-step journey to becoming a champion.";
        actionBtn.textContent = "Start Journey";
        actionBtn.onclick = () => { showTab('journey'); toggleGuide(false); };
    } else if (completedCount < 8) {
        textEl.textContent = `You're doing great! Ready to tackle your next voter step?`;
        actionBtn.textContent = "Continue Journey";
        actionBtn.onclick = () => { showTab('journey'); toggleGuide(false); };
    } else {
        textEl.textContent = "You're 100% ready! Don't forget to download your certificate.";
        actionBtn.textContent = "Get Certificate";
        actionBtn.onclick = () => { showTab('journey'); toggleGuide(false); };
    }
}

// Expose for inline onclick in guide bubble HTML
window.updateGuideContext = updateGuideContext;


// === Onboarding ===

function checkOnboarding() {
    if (!localStorage.getItem('electuq_visited_v3')) {
        const template = document.getElementById('tpl-onboarding');
        if (!template) return;

        const overlay = template.content.firstElementChild.cloneNode(true);
        document.body.appendChild(overlay);
        focusManager.trap(overlay);

        overlay.querySelector('#onboard-close')?.addEventListener('click', function () {
            focusManager.untrap(overlay);
            this.closest('.info-modal-overlay').remove();
            setState('electuq_visited_v3', 'true');
        });
        overlay.querySelector('#onboard-yes').addEventListener('click', () => {
            focusManager.untrap(overlay);
            overlay.remove();
            setState('electuq_visited_v3', 'true');
            showTab('journey');
        });
        overlay.querySelector('#onboard-no').addEventListener('click', () => {
            focusManager.untrap(overlay);
            overlay.remove();
            setState('electuq_visited_v3', 'true');
            showTab('eligible');
        });
    }
}


// === Constituency Finder ===

import { electionData } from './data.js';
import { showToast } from './ui.js';

function initFinder() {
    const select = document.getElementById('state-select');
    if (!select) return;
    select.innerHTML = '<option value="">Select State</option>';
    Object.keys(electionData.stateRules).sort().forEach(s => select.add(new Option(s, s)));
}

function lookupState() {
    const val = document.getElementById('state-select').value;
    const res = document.getElementById('state-result');
    if (!val || !res) return;
    const data = electionData.stateRules[val];
    res.style.display = 'block';
    res.innerHTML = `
        <div style="font-weight:800; font-size:1.5rem; color:var(--navy);">${val} Details</div>
        <div class="result-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; margin-top:15px;">
            <div class="r-item"><div class="r-label">SEATS</div><div class="r-val">${data.seats}</div></div>
            <div class="r-item"><div class="r-label">PHASE</div><div class="r-val">${data.phase}</div></div>
            <div class="r-item"><div class="r-label">VOTING DATE</div><div class="r-val">${data.votingDate}</div></div>
            <div class="r-item"><div class="r-label">STATE</div><div class="r-val">${val}</div></div>
            <div class="r-item"><div class="r-label">CAPITAL</div><div class="r-val">${data.capital}</div></div>
            <div class="r-item"><div class="r-label">CM NAME</div><div class="r-val">${data.cm}</div></div>
        </div>
        <p style="margin-top:15px; font-weight:600;">${data.details}</p>
    `;
}

function lookupPin() {
    const pin = document.getElementById('pin-input').value.trim();
    const res = document.getElementById('pin-result');
    if (pin.length !== 6 || isNaN(pin)) {
        showToast('⚠️ Please enter a valid 6-digit PIN code.', 'error');
        if (res) res.style.display = 'none'; // Edge Case: hide stale result
        return;
    }

    const pinPrefix = parseInt(pin.substring(0, 2));
    let state = "Unknown State";
    let city = "Local City";

    if (pinPrefix === 11) { state = "Delhi"; city = "New Delhi"; }
    else if (pinPrefix >= 12 && pinPrefix <= 13) { state = "Haryana"; city = "Gurugram"; }
    else if (pinPrefix >= 14 && pinPrefix <= 16) { state = "Punjab"; city = "Chandigarh"; }
    else if (pinPrefix === 17) { state = "Himachal Pradesh"; city = "Shimla"; }
    else if (pinPrefix >= 18 && pinPrefix <= 19) { state = "Jammu & Kashmir"; city = "Srinagar"; }
    else if (pinPrefix >= 20 && pinPrefix <= 28) { state = "Uttar Pradesh"; city = "Lucknow"; }
    else if (pinPrefix >= 30 && pinPrefix <= 34) { state = "Rajasthan"; city = "Jaipur"; }
    else if (pinPrefix >= 36 && pinPrefix <= 39) { state = "Gujarat"; city = "Ahmedabad"; }
    else if (pinPrefix >= 40 && pinPrefix <= 44) { state = "Maharashtra"; city = (pinPrefix === 40) ? "Mumbai" : "Pune"; }
    else if (pinPrefix >= 45 && pinPrefix <= 48) { state = "Madhya Pradesh"; city = "Bhopal"; }
    else if (pinPrefix === 49) { state = "Chhattisgarh"; city = "Raipur"; }
    else if (pinPrefix >= 50 && pinPrefix <= 53) { state = "Telangana/AP"; city = (pinPrefix === 50) ? "Hyderabad" : "Visakhapatnam"; }
    else if (pinPrefix >= 56 && pinPrefix <= 59) { state = "Karnataka"; city = (pinPrefix === 56) ? "Bengaluru" : "Mysuru"; }
    else if (pinPrefix >= 60 && pinPrefix <= 64) { state = "Tamil Nadu"; city = (pinPrefix === 60) ? "Chennai" : "Coimbatore"; }
    else if (pinPrefix >= 67 && pinPrefix <= 69) { state = "Kerala"; city = "Kochi"; }
    else if (pinPrefix >= 70 && pinPrefix <= 74) { state = "West Bengal"; city = (pinPrefix === 70) ? "Kolkata" : "Darjeeling"; }
    else if (pinPrefix >= 75 && pinPrefix <= 77) { state = "Odisha"; city = "Bhubaneswar"; }
    else if (pinPrefix >= 78 && pinPrefix <= 79) { state = "Assam"; city = "Guwahati"; }
    else if (pinPrefix >= 80 && pinPrefix <= 85) { state = "Bihar/Jharkhand"; city = "Patna"; }
    else { state = "Indian Postal Region"; city = "District HQ"; }

    const prefixes = ['Central', 'North', 'South', 'East', 'West', 'Greater', 'Urban', 'Rural'];
    const places = ['Govt. Primary School', 'Municipal College', 'Community Hall', 'Public Library', 'District Panchayat Office', 'Zila Parishad School'];

    let hash = 0;
    for (let i = 0; i < pin.length; i++) {
        hash = pin.charCodeAt(i) + ((hash << 5) - hash);
    }
    hash = Math.abs(hash);

    const constName = prefixes[hash % prefixes.length] + ' ' + city + ' Constituency';
    const stationName = places[hash % places.length] + ', Ward No. ' + ((hash % 50) + 1) + ', ' + city;

    res.innerHTML = `
        <div class="r-item">
            <div class="r-label">Location</div>
            <div class="r-val">${city}, ${state}</div>
        </div>
        <div class="r-item" style="margin-top:10px;">
            <div class="r-label">Constituency for ${pin}</div>
            <div class="r-val" style="color: var(--saffron);">${constName}</div>
        </div>
        <div class="r-item" style="margin-top:10px;">
            <div class="r-label">Assigned Polling Station</div>
            <div class="r-val" style="color: var(--navy);">${stationName}</div>
        </div>
        <div style="margin-top:15px; font-size:0.8rem; color:var(--green); font-weight: bold;">
            ✓ Real-time mapping simulated for PIN ${pin}.
        </div>
    `;
    res.style.display = 'block';
}

// Expose showTab globally for inline onclick handlers in data.js journey steps
window.showTab = showTab;


// === Boot Trigger ===

// Global safety: If any script fails, try to hide the loader so the app isn't stuck
window.addEventListener('error', () => {
    const loader = document.getElementById('app-loading');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => { loader.style.display = 'none'; }, 500);
    }
});

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootApp);
} else {
    bootApp();
}
