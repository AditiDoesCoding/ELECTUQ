// === Journey Tracking Module ===
// Handles voter readiness journey, eligibility wizard, and score tracking.

import { appState, journeyState, setJSON, getJSON } from './state.js';
import { journeySteps } from './data.js';
import { showToast, triggerConfetti, updateQDostStrip, focusManager } from './ui.js';
import { qdostReactToStep, qdostAnnounceCertificate } from './chat.js';

// --- Journey Logic ---
export function initJourney() {
    const container = document.getElementById('checklist');
    if (!container) return;
    
    // STEP 0: MINI CARD
    const wizCard = `
        <div class="step-card" data-action="open-wiz" role="button" tabindex="0" style="border: 2px dashed var(--navy); background: rgba(0, 80, 160, 0.02);">
            <div style="position: absolute; top: 12px; right: 12px; background: var(--navy); color: white; padding: 2px 8px; border-radius: 10px; font-weight: 800; font-size: 0.6rem;">STEP 0</div>
            <div class="step-check" style="background: var(--navy);">?</div>
            <div class="step-content">
                <div class="step-title">Step 0: Eligibility Check</div>
                <div class="step-desc">Quickly verify if you are legally ready to vote.</div>
                <button class="btn btn-white" style="margin-top: 10px; padding: 6px 12px; font-size: 0.8rem; border: 1px solid var(--navy); color: var(--navy);">Start Pop-up Check →</button>
            </div>
        </div>
    `;

    container.innerHTML = wizCard + journeySteps.map(s => {
        const isChecked = !!journeyState[s.id];
        return `
            <div class="step-card" aria-checked="${isChecked}" data-action="toggle-step" data-step-id="${s.id}" role="button" tabindex="0">
                <div class="step-check">✓</div>
                <div class="step-content">
                    <div class="step-title">${s.title}</div>
                    <div class="step-desc">${s.desc}</div>
                    <div style="margin-top: 10px;">${s.interactive || ''}</div>
                </div>
            </div>`;
    }).join('');
    updateScore();
}

export function toggleStep(id, cardElement) {
    const current = cardElement.getAttribute('aria-checked') === 'true';
    cardElement.setAttribute('aria-checked', !current);
    journeyState[id] = !current;
    setJSON('electuq_journey', journeyState);
    updateScore();

    // Q Dost reacts to journey step change
    const step = journeySteps.find(s => s.id === id);
    const validKeys = journeySteps.map(s => s.id);
    const count = Object.keys(journeyState).filter(k => validKeys.includes(k) && journeyState[k]).length;
    const total = journeySteps.length;
    const pct = Math.round((count / total) * 100);
    let badge = 'Curious Citizen';
    if (pct > 75) badge = pct === 100 ? 'Election Champion 🏆' : 'Almost Ready!';
    else if (pct > 50) badge = 'Prepared Voter';
    else if (pct > 25) badge = 'Aware Voter';
    if (step) qdostReactToStep(step.title, !current, pct, badge);
}

export function updateScore() {
    const validKeys = journeySteps.map(s => s.id);
    const count = Object.keys(journeyState).filter(k => validKeys.includes(k) && journeyState[k]).length;
    const total = journeySteps.length;
    const pct = Math.round((count / total) * 100);
    const scoreEl = document.getElementById('score-display');
    const fillEl = document.getElementById('score-fill');
    const topBar = document.getElementById('top-progress-bar');
    
    if (scoreEl) scoreEl.textContent = pct + '%';
    if (fillEl) fillEl.style.width = pct + '%';
    if (topBar) topBar.style.width = pct + '%';
    
    const badge = document.getElementById('level-badge');
    if(badge) {
        if(pct <= 25) badge.textContent = 'Curious Citizen';
        else if(pct <= 50) badge.textContent = 'Aware Voter';
        else if(pct <= 75) badge.textContent = 'Prepared Voter';
        else if(pct < 100) badge.textContent = 'Almost Ready!';
        else badge.textContent = 'Election Champion 🏆';
    }
    
    // Reward milestones exactly once per session
    if (pct > appState.lastPct && (pct === 25 || pct === 50 || pct === 75 || pct === 100)) {
        triggerConfetti();
        if (pct === 100) {
            setTimeout(triggerConfetti, 1000);
            setTimeout(triggerConfetti, 2000);
            // Q Dost announces the certificate in chat
            qdostAnnounceCertificate();
        }
    }
    appState.lastPct = pct;

    // Update Q Dost strip on home
    updateQDostStrip();
}

// Fix 6: Shareable Voter Score Card (Canvas)
export function generateScoreCard() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 1200;
    canvas.height = 630;

    // Background Gradient
    const grad = ctx.createLinearGradient(0, 0, 1200, 630);
    grad.addColorStop(0, '#FF6B00');
    grad.addColorStop(0.5, '#FFFFFF');
    grad.addColorStop(1, '#16a34a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1200, 630);

    // Card Surface
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.roundRect(100, 100, 1000, 430, 40);
    ctx.fill();

    // Header
    ctx.fillStyle = '#0050A0';
    ctx.font = 'bold 80px "Fraunces"';
    ctx.textAlign = 'center';
    ctx.fillText('ElectUQ Readiness', 600, 220);

    // Score
    const count = Object.values(journeyState).filter(Boolean).length;
    const pct = Math.round((count / 8) * 100);
    ctx.fillStyle = '#FF6B00';
    ctx.font = 'bold 150px "Plus Jakarta Sans"';
    ctx.fillText(pct + '%', 600, 400);

    // Date
    ctx.fillStyle = '#64748b';
    ctx.font = '30px "Plus Jakarta Sans"';
    ctx.fillText('Certified on: ' + new Date().toLocaleDateString(), 600, 480);

    // Logo Placeholder
    ctx.fillStyle = '#FF6B00';
    ctx.beginPath();
    ctx.roundRect(120, 120, 60, 60, 12);
    ctx.fill();

    // Export and Share — accessible canvas download
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'ElectUQ-Readiness.png';
    link.href = dataUrl;
    link.setAttribute('aria-label', 'Download your ElectUQ Voter Readiness certificate as a PNG image');
    link.click();
    showToast('🏅 Certificate downloaded! Share your readiness.');
}

// --- Eligibility Wizard ---
export function openWizModal() {
    const modal = document.getElementById('wiz-modal');
    if (modal) {
        wizReset();
        modal.style.display = 'flex';
        focusManager.trap(modal);
    }
}

export function closeWizModal() {
    const modal = document.getElementById('wiz-modal');
    if (modal) {
        modal.style.display = 'none';
        focusManager.untrap(modal);
    }
}

let wizAnswers = getJSON('electuq_wiz', {});

export function wizAnswer(step, val) {
    wizAnswers[step] = val;
    setJSON('electuq_wiz', wizAnswers);
    const current = document.getElementById(`wiz-step-${step}`);
    if (current) {
        current.classList.remove('active');
        current.classList.add('anim-right');
    }
    
    // Logic mapping
    if(step===1 && val==='under18') showWizResult('red', 'Not yet eligible 🎂', 'You must be 18 to vote. See you in a few years!');
    else if(step===2 && val==='no') showWizResult('blue', 'Citizens only 🇮🇳', 'Only Indian citizens can vote. NRIs with Indian passport can register under Section 20A.');
    else if(step===3 && val==='no') showWizResult('saffron', 'Almost there! 📝', 'You need to register. Go to voters.eci.gov.in, fill Form 6, and you are done in 5 minutes.');
    else if(step===3 && val==='yes') {
        showWizResult('green', "You're all set! 🎉", 'You are an eligible registered voter. Find your polling booth and get ready to vote.');
        triggerConfetti();
    } else {
        // Next step
        setTimeout(()=>{
            if (current) {
                current.style.display = 'none';
                current.classList.remove('anim-right');
            }
            const next = document.getElementById(`wiz-step-${step+1}`);
            if (next) {
                next.style.display = 'flex';
                next.classList.add('active');
            }
        }, 300);
    }
}

export function showWizResult(colorClass, title, desc) {
    setTimeout(() => {
        document.querySelectorAll('.wizard-step').forEach(el=>el.style.display='none');
        const res = document.getElementById('wiz-result');
        if (res) {
            res.className = `wizard-step wiz-result res-${colorClass} active`;
            const titleEl = document.getElementById('res-title');
            const descEl = document.getElementById('res-desc');
            const iconEl = document.getElementById('res-icon');
            if (titleEl) titleEl.textContent = title;
            if (descEl) descEl.textContent = desc;
            
            const icons = {red:'🛑', blue:'🛂', saffron:'✍️', green:'✅'};
            if (iconEl) iconEl.textContent = icons[colorClass] || 'ℹ️';
            
            res.style.display = 'flex';
        }
    }, 300);
}

export function wizReset() {
    wizAnswers = {};
    document.querySelectorAll('.wizard-step').forEach(el => {
        el.style.display = 'none';
        el.classList.remove('active', 'anim-right', 'res-red', 'res-blue', 'res-saffron', 'res-green');
    });
    const s1 = document.getElementById('wiz-step-1');
    if (s1) {
        s1.style.display = 'flex';
        s1.classList.add('active');
    }
}
