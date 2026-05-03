// === EVM Simulator Module ===
// Handles the polling booth simulator, EVM modal, VVPAT, and vote casting.

import { journeyState, setJSON } from './state.js';
import { showToast, triggerConfetti, focusManager } from './ui.js';
import { updateScore } from './journey.js';

// Booth Simulator Logic
export const boothInfo = {
    'officer1': { 
        t: "Station 1: Identity Verification", 
        d: "The first Polling Officer is the gatekeeper of democracy. They check your ID (EPIC/Aadhar/Voter Slip) against the electoral roll. \n\n💡 EXPERT TIP: Ensure your name and serial number are called out loudly for transparency—this is a legal requirement for public verification." 
    },
    'officer2': { 
        t: "Station 2: The Mark of a Voter", 
        d: "Officer 2 applies the iconic silver-nitrate indelible ink on your left index finger. This ink is specially formulated by Mysore Paints to last for weeks. \n\n💡 EXPERT TIP: Do not wipe the ink immediately; it needs a few seconds to react with your skin to become permanent." 
    },
    'officer3': { 
        t: "Station 3: EVM Authorization", 
        d: "The third officer controls the 'Control Unit' of the EVM. Once they verify your slip, they press the 'Ballot' button, which activates the voting machine inside the private compartment.\n\n💡 EXPERT TIP: You will see a 'Ready' green light on the Ballot Unit once this officer gives the authorization." 
    },
    'openEVM': { 
        t: "Station 4: The Privacy Compartment", 
        d: "This is where you cast your secret ballot. No one, not even the presiding officer, can see who you vote for. \n\n💡 EXPERT TIP: Listen for the long 'BEEP' sound—that is the final confirmation that your vote has been securely recorded." 
    },
    'vvpat': { 
        t: "Station 5: VVPAT Verification", 
        d: "The VVPAT (Voter Verifiable Paper Audit Trail) is your proof of voting. It prints a slip showing your candidate's symbol for exactly 7 seconds.\n\n💡 EXPERT TIP: Always check the VVPAT window after voting to ensure the symbol shown matches your choice on the EVM." 
    }
};

export function showBoothInfo(id) {
    const panel = document.getElementById('booth-info-panel');
    const title = document.getElementById('booth-info-title');
    const desc = document.getElementById('booth-info-desc');
    if (panel && title && desc) {
        title.textContent = boothInfo[id].t;
        desc.textContent = boothInfo[id].d;
        panel.style.display = 'block';
        panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

export function openEVM() {
    const modal = document.getElementById('evm-modal');
    const content = document.getElementById('evm-ballot-content');
    if (!modal || !content) return;

    const candidates = [
        { name: "Candidate 1", symbol: "🐅 Tiger" },
        { name: "Candidate 2", symbol: "✨🐘😊 Elephant" },
        { name: "Candidate 3", symbol: "🚲 Bicycle" },
        { name: "None of the Above (NOTA)", symbol: "❌ NOTA" }
    ];

    content.innerHTML = candidates.map((c, i) => `
        <div style="display: flex; align-items: center; background: white; margin-bottom: 4px; padding: 12px; border: 1px solid #94a3b8; border-radius: 4px;">
            <div style="width: 40px; font-weight: 800; border-right: 2px solid #94a3b8; font-size: 1.2rem;">${i + 1}</div>
            <div style="flex: 1; padding-left: 15px; font-weight: 700; font-size: 1.2rem; color: #1e293b;">${c.name}</div>
            <div style="width: 80px; text-align: center; font-size: 2rem; border-left: 2px solid #94a3b8;">${c.symbol.split(' ')[0]}</div>
            <div style="position: relative; margin-left: 15px;">
                <div id="led-${i}" style="position: absolute; top: -15px; left: 50%; transform: translateX(-50%); width: 12px; height: 12px; background: #444; border-radius: 50%; border: 1px solid #222;"></div>
                <button id="btn-${i}" data-action="cast-vote" data-idx="${i}" data-name="${c.name}" data-symbol="${c.symbol.split(' ')[0]}" style="width: 60px; height: 45px; background: #3b82f6; border: 4px solid #1e40af; border-radius: 6px; cursor: pointer; box-shadow: inset 0 0 15px rgba(0,0,0,0.4), 0 4px 0 #1e3a8a; transition: all 0.1s;"></button>
            </div>
        </div>
    `).join('');

    modal.style.display = 'flex';
    focusManager.trap(modal);
}

export function castVote(idx, name, symbol) {
    // 0. Visual Feedback (LED + Button Press)
    const btn = document.getElementById(`btn-${idx}`);
    const led = document.getElementById(`led-${idx}`);
    if (btn) btn.style.transform = "translateY(4px)";
    if (led) {
        led.style.background = "#ef4444";
        led.style.boxShadow = "0 0 15px #ef4444";
    }

    // 1. Play Sound (Synthesized EVM Beep)
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'square'; // Harsh beep sound
        osc.frequency.value = 950;
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.8); // 0.8 second beep
    } catch (e) { console.warn("Audio fail", e); }

    // 2. VVPAT Animation (Mandatory 7 Seconds)
    const vvpat = document.getElementById('vvpat-display');
    const vSymbol = document.getElementById('vvpat-symbol');
    const vName = document.getElementById('vvpat-name');
    
    if (vvpat && vSymbol && vName) {
        vSymbol.textContent = symbol;
        vName.textContent = name;
        vvpat.style.display = 'block';
        setTimeout(() => {
            vvpat.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            vvpat.style.transform = 'scale(1) rotate(0deg)';
        }, 100);

        // VVPAT Display Duration: 7 Seconds (ECI Standard)
        setTimeout(() => {
            vvpat.style.transform = 'scale(0) translateY(100px)';
            setTimeout(() => {
                vvpat.style.display = 'none';
                closeEVM();
                showToast(`✅ Mock Vote Successful! You voted for: ${name}. Verified via VVPAT.`);
                triggerConfetti();
                // Update journey progress
                journeyState['step4'] = true;
                setJSON('electuq_journey', journeyState);
                updateScore();
            }, 600);
        }, 7000); 
    } else {
        setTimeout(() => {
            closeEVM();
            showToast('✅ Mock Vote Successful! 🗳️');
            triggerConfetti();
        }, 1000);
    }
}

export function closeEVM() {
    const modal = document.getElementById('evm-modal');
    if (modal) {
        modal.style.display = 'none';
        focusManager.untrap(modal);
    }
}
