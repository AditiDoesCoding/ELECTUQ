// === DOM Rendering Helpers ===
// Pure UI functions with no business logic dependencies.

import { electionData, myths } from './data.js';
import { getJSON } from './state.js';

// Accessible toast — replaces all alert() calls throughout the app
export function showToast(message, type = 'success') {
    const existing = document.getElementById('a11y-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'a11y-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.setAttribute('aria-atomic', 'true');
    toast.style.cssText = `
        position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%) translateY(20px);
        background: ${ type === 'error' ? '#ef4444' : '#16a34a' }; color: white;
        padding: 14px 28px; border-radius: 12px; font-weight: 700; font-size: 1rem;
        box-shadow: 0 8px 30px rgba(0,0,0,0.2); z-index: 99999; max-width: 90vw;
        text-align: center; opacity: 0; transition: all 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
    });
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

export function triggerConfetti() {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:99999;';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const p = Array.from({ length: 50 }, () => ({
        x: Math.random() * canvas.width,
        y: -10,
        w: Math.random() * 10 + 5,
        c: ['#FF6B00', '#16a34a', '#0050A0'][Math.floor(Math.random() * 3)],
        v: Math.random() * 5 + 2
    }));
    function anim() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        p.forEach(q => { q.y += q.v; ctx.fillStyle = q.c; ctx.fillRect(q.x, q.y, q.w, q.w); });
        if (p.some(q => q.y < canvas.height)) requestAnimationFrame(anim);
        else canvas.remove();
    }
    anim();
}

// Render Timeline
export function renderTimeline() {
    const container = document.getElementById('tl-nodes-container');
    const phases = electionData.timelinePhases;
    if (!container) return;
    container.innerHTML = '';
    
    phases.forEach((p, idx) => {
        const node = document.createElement('div');
        node.className = `node-point ${idx === 0 ? 'active' : ''}`;
        node.innerHTML = `<span class="node-label">${p.title}</span>`;
        node.setAttribute('role', 'button');
        node.setAttribute('tabindex', '0');
        node.setAttribute('data-action', 'show-phase');
        node.setAttribute('data-idx', idx);
        container.appendChild(node);
    });
    
    // Initial phase setup
    showPhase(0);
}

export function showPhase(idx) {
    const phases = electionData.timelinePhases;
    const card = document.getElementById('current-phase-card');
    const nodes = document.querySelectorAll('.node-point');
    const line = document.getElementById('tl-progress-line');
    const traveler = document.getElementById('traveler');
    
    if (!card || !phases[idx]) return;
    
    // Update visuals
    nodes.forEach((n, i) => n.classList.toggle('active', i === idx));
    const pct = (idx / (phases.length - 1)) * 100;
    if (line) line.style.width = `${pct}%`;
    if (traveler) traveler.style.left = `${pct}%`;
    
    // Update content
    const p = phases[idx];
    card.innerHTML = `
        <h3 class="fraunces" style="color:var(--saffron); margin-bottom:10px;">Phase ${idx + 1}: ${p.title}</h3>
        <p style="font-size:1.2rem; margin-bottom:15px; font-weight:700;">${p.date}</p>
        <p style="color:var(--text); margin-bottom:20px;">${p.desc}</p>
        <ul style="list-style: none; padding: 0;">
            ${p.bullets.map(b => `<li style="margin-bottom:8px; display:flex; align-items:center; gap:10px;">
                <span style="color:var(--saffron);">✦</span> ${b}
            </li>`).join('')}
        </ul>
    `;
    card.classList.add('active');
}

// --- Myths ---
export function renderMyths() {
    const fullGrid = document.getElementById('myths-container');
    const homeGrid = document.getElementById('myths-home-teaser');

    // Create the flashcard HTML generator
    const createCardHTML = (item) => `
        <div class="myth-card" data-action="flip-myth" role="button" tabindex="0">
            <div class="myth-inner">
                <div class="myth-front">
                    <span class="myth-badge">MYTH</span>
                    <span class="myth-cat">${item.cat}</span>
                    <p class="myth-text">${item.m}</p>
                    <div class="myth-action">Tap to Flip 👆</div>
                </div>
                <div class="myth-back">
                    <span class="fact-badge">FACT</span>
                    <p class="fact-text">${item.f}</p>
                </div>
            </div>
        </div>
    `;

    // Render 20 myths on the tab
    if (fullGrid) {
        fullGrid.innerHTML = myths.map(item => createCardHTML(item)).join('');
    }

    // Render 4 myths on the home page
    if (homeGrid) {
        homeGrid.innerHTML = myths.slice(0, 4).map(item => createCardHTML(item)).join('');
    }
}

// Q Dost suggest strip on Home page
export function updateQDostStrip() {
    const strip = document.getElementById('qdost-suggest-strip');
    const textEl = document.getElementById('qdost-suggest-text');
    const actionBtn = document.getElementById('qdost-suggest-action');
    if (!strip || !textEl || !actionBtn) return;

    const js = getJSON('electuq_journey', {});
    const count = Object.values(js).filter(Boolean).length;
    const pct = Math.round((count / 8) * 100);

    if (pct === 0) {
        textEl.textContent = 'Q Dost: Ready to start your voter journey? Let me guide you!';
        actionBtn.textContent = 'Start Journey →';
        actionBtn.setAttribute('data-action', 'show-tab');
        actionBtn.setAttribute('data-tab', 'journey');
    } else if (pct < 100) {
        textEl.textContent = `Q Dost: You're ${pct}% ready — want to check your next step?`;
        actionBtn.textContent = 'Continue →';
        actionBtn.setAttribute('data-action', 'show-tab');
        actionBtn.setAttribute('data-tab', 'journey');
    } else {
        textEl.textContent = 'Q Dost: You\'re 100% Election Champion! 🏆 Grab your certificate!';
        actionBtn.textContent = 'Get Certificate →';
        actionBtn.setAttribute('data-action', 'show-tab');
        actionBtn.setAttribute('data-tab', 'journey');
    }
    strip.style.display = 'block';
}

// --- Facts Rotation ---
const headerFacts = [
    "🎂 ECI established: January 25, 1950",
    "🗳️ India has 96.8 Crore registered voters",
    "🌍 World's largest democratic exercise",
    "📱 First EVM use: 1982 in Kerala",
    "🖊️ Mysore Paints makes the indelible ink",
    "👤 543 Lok Sabha seats up for election"
];
let currentFactIndex = 0;
export function rotateHeaderFact() {
    const el = document.getElementById('header-fact-display');
    if (!el) return;
    el.classList.add('fade-out');
    setTimeout(() => {
        currentFactIndex = (currentFactIndex + 1) % headerFacts.length;
        el.textContent = headerFacts[currentFactIndex];
        el.classList.remove('fade-out');
    }, 500);
}

// --- Modal Focus Trap ---
export const focusManager = {
    previousFocus: null,
    trapListener: null,
    
    trap(modalEl) {
        if (typeof modalEl === 'string') modalEl = document.getElementById(modalEl);
        if (!modalEl) return;

        this.previousFocus = document.activeElement;
        
        const getVisibleFocusable = () => {
            const focusableElements = modalEl.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            return Array.from(focusableElements).filter(el => el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0);
        };

        const visibleFocusable = getVisibleFocusable();
        if (visibleFocusable.length > 0) visibleFocusable[0].focus();
        
        this.trapListener = function(e) {
            const isTabPressed = e.key === 'Tab' || e.keyCode === 9;
            if (!isTabPressed) return;
            
            const focusables = getVisibleFocusable();
            if (focusables.length === 0) return;

            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            
            if (e.shiftKey) {
                if (document.activeElement === first || !focusables.includes(document.activeElement)) {
                    last.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === last || !focusables.includes(document.activeElement)) {
                    first.focus();
                    e.preventDefault();
                }
            }
        };
        
        modalEl.addEventListener('keydown', this.trapListener);
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    },
    
    untrap(modalEl) {
        if (typeof modalEl === 'string') modalEl = document.getElementById(modalEl);
        if (modalEl && this.trapListener) {
            modalEl.removeEventListener('keydown', this.trapListener);
        }
        if (this.previousFocus && typeof this.previousFocus.focus === 'function') {
            this.previousFocus.focus();
        }
        document.body.style.overflow = '';
        this.trapListener = null;
        this.previousFocus = null;
    }
};
