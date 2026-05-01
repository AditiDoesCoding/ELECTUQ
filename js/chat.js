import { electionData } from './data.js';
import {
    loadMemory, saveMemory, recordInteraction, recordEligibility,
    getPlanningContext, getMemoryContext, enforceResponse
} from './memory.js';

let chatHistory = [];
let agentMemory = loadMemory();

export function initChat() {
    chatHistory = [];
    const stream = document.getElementById('chat-stream');
    if (stream && stream.children.length <= 1) {
        renderBotMessage("Namaste! I am **Q Dost**, your AI companion for the 2026 Elections. 🇮🇳\n\nI can help you with registration, polling booth locations, or understanding EVMs. What's on your mind?");
        addSuggestionChips(['How to register?', 'Is EVM safe?', 'Who is eligible?', 'Am I ready to vote?']);
    }
}

function addSuggestionChips(questions) {
    const stream = document.getElementById('chat-stream');
    const chipContainer = document.createElement('div');
    chipContainer.className = 'chips';
    chipContainer.style.marginTop = '15px';
    chipContainer.innerHTML = questions.map(q => `
        <button class="chip" data-action="quick-ask" data-q="${q}">${q}</button>
    `).join('');
    stream.appendChild(chipContainer);
    stream.scrollTop = stream.scrollHeight;
}

/**
 * Builds a rich, context-aware system prompt that includes:
 * - User's selected state + state data
 * - Journey progress (steps completed, pending, badge level)
 * - Eligibility wizard answers
 * - Current language preference
 */
export function buildSystemPrompt() {
    // 1. State context
    const userState = document.getElementById('state-select')?.value || "";
    const stateInfo = electionData.stateRules[userState] || {};
    const stateContext = userState
        ? `User is from ${userState}. CM: ${stateInfo.cm || 'Unknown'}, Voting Date: ${stateInfo.votingDate || 'TBD'}, Capital: ${stateInfo.capital || 'TBD'}, Phase: ${stateInfo.phase || 'TBD'}, Seats: ${stateInfo.seats || 'TBD'}.`
        : "User has not selected a specific state yet.";

    // 2. Journey progress context
    let journeyContext = "User has not started their voter readiness journey.";
    try {
        const journeyState = JSON.parse(localStorage.getItem('electuq_journey')) || {};
        const stepLabels = {
            s1: 'Check Eligibility', s2: 'Enroll on Electoral Roll',
            s3: 'Get EPIC Card', s4: 'Find Your Booth',
            s5: 'Check Voter List', s6: 'Know Your Candidates',
            s7: 'Prepare Valid ID', s8: 'Vote & Result'
        };
        const completed = [];
        const pending = [];
        Object.keys(stepLabels).forEach(key => {
            if (journeyState[key]) completed.push(stepLabels[key]);
            else pending.push(stepLabels[key]);
        });
        const pct = Math.round((completed.length / 8) * 100);
        let badge = 'Curious Citizen';
        if (pct > 75) badge = pct === 100 ? 'Election Champion 🏆' : 'Almost Ready!';
        else if (pct > 50) badge = 'Prepared Voter';
        else if (pct > 25) badge = 'Aware Voter';

        journeyContext = `User's voter readiness: ${pct}% (${completed.length}/8 steps). Badge: "${badge}". ` +
            (completed.length > 0 ? `Completed: ${completed.join(', ')}. ` : '') +
            (pending.length > 0 ? `Pending: ${pending.join(', ')}. ` : '') +
            (pct === 100 ? 'User is FULLY READY to vote — congratulate them!' : '') +
            (pct < 50 ? 'Encourage the user to complete more steps.' : '');
    } catch (e) { /* ignore parse errors */ }

    // 3. Eligibility wizard context
    let eligibilityContext = "User has not completed the eligibility wizard.";
    try {
        const wizData = JSON.parse(localStorage.getItem('electuq_wiz')) || {};
        if (Object.keys(wizData).length > 0) {
            const parts = [];
            if (wizData[1]) parts.push(`Age: ${wizData[1] === 'over18' ? '18+' : 'Under 18'}`);
            if (wizData[2]) parts.push(`Citizen: ${wizData[2] === 'yes' ? 'Yes' : 'No/Unsure'}`);
            if (wizData[3]) parts.push(`Registered: ${wizData[3] === 'yes' ? 'Yes (has EPIC)' : 'No/Unsure'}`);
            eligibilityContext = `User's eligibility answers: ${parts.join(', ')}.`;
        }
    } catch (e) { /* ignore */ }

    // 4. Language context
    const lang = localStorage.getItem('electuq_lang') || 'en';
    const langContext = lang === 'hi'
        ? 'User prefers Hindi. Mix Hindi phrases naturally but keep technical terms in English.'
        : 'User is browsing in English.';

    // 5. Agent memory + planning context
    recordEligibility(agentMemory);
    const memoryBlock = getMemoryContext(agentMemory);
    const planningBlock = getPlanningContext();

    return `You are Q Dost, an intelligent voting guide that actively plans user progression on the ElectUQ platform (2026 Lok Sabha).

You are NOT a passive chatbot. You are an agent that:
- Tracks what the user has done and what they need to do next.
- Plans each response to move the user ONE step closer to being vote-ready.
- Never repeats information the user already knows.
- Always ends with exactly ONE actionable follow-up question.

CRITICAL DIRECTIVES:
1. PLAN THEN RESPOND: Read the PLANNING block. Your response must aim to move the user toward the stated goal.
2. MEMORY AWARE: Read the MEMORY CONTEXT. Do not re-explain topics the user has already discussed. Build on prior context.
3. CONTEXT AWARE: If they haven't selected a state, guide them to the Finder tab. If under 18, gracefully pivot to education (EVM simulator).
4. MANDATORY FOLLOW-UP: Every response MUST end with exactly ONE relevant follow-up question.

${planningBlock}

${memoryBlock}

USER CONTEXT:
- State: ${stateContext}
- Progress: ${journeyContext}
- Eligibility: ${eligibilityContext}
- Language: ${langContext}

CAPABILITIES:
- Return action="navigate" and target="journey"|"eligible"|"finder"|"timeline"|"myths"|"glossary"|"evm" in your JSON to navigate the user.

RULES:
- Be concise (max 100 words).
- Factually accurate regarding Election Commission of India (ECI) procedures.
- Strictly neutral (no political bias).
- Always end with a follow-up question.`;
}

export async function handleChatSend() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    
    const sendBtn = document.getElementById('btn-chat-send');
    const preset = document.getElementById('chat-preset-select');
    
    // Fix 10: Input validation
    const errorMsg = validateMessage(text);
    if (errorMsg) {
        showChatError(errorMsg);
        return;
    }

    input.value = '';
    if (preset) preset.value = '';
    
    // Disable inputs while loading
    input.disabled = true;
    if (sendBtn) sendBtn.disabled = true;
    if (preset) preset.disabled = true;
    const stream = document.getElementById('chat-stream');
    stream.innerHTML += `<div class="msg msg-user">${escapeHtml(text)}</div>`;
    stream.scrollTop = stream.scrollHeight;

    // Fix 4: Show loading spinner
    const typing = document.createElement('div');
    typing.className = 'msg msg-bot typing-indicator';
    typing.innerHTML = '<div class="spinner-dot"></div><div class="spinner-dot"></div><div class="spinner-dot"></div>';
    stream.appendChild(typing);

    // Fix 8: Cap history at 10 messages
    chatHistory.push({ role: 'user', parts: [{ text: text }] });
    chatHistory = chatHistory.slice(-10);

    // Agent: record interaction in memory before building prompt
    const intent = detectTopic(text);
    agentMemory = recordInteraction(agentMemory, text, intent);

    // Build the full context-aware system prompt locally
    // Note: Due to prompt injection security fix, we NO LONGER send this to the backend.
    // However, we still call it to trigger internal memory/state side effects (like recordEligibility).
    buildSystemPrompt();

    try {
        // Bonus: Analytics Tracking
        trackAnalytics('chat_message', { length: text.length, topic: intent });

        // Fix 1: Call backend proxy
        let response;
        try {
            response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    history: chatHistory
                })
            });
        } catch (fetchErr) {
            // Network error or server unreachable
            throw new Error("NETWORK_ERROR");
        }

        if (!response.ok) {
            // Fix 4: Detailed error handling
            if (response.status === 503) {
                // EXPLICIT OFFLINE MODE - Try to use backend-controlled fallback first
                try {
                    const offlineData = await response.json();
                    if (offlineData.candidates?.[0]?.content?.parts?.[0]?.text) {
                        if (typing.parentNode) typing.remove();
                        showChatError("Service temporarily offline (Switched to Offline Mode)");
                        renderBotMessage(offlineData.candidates[0].content.parts[0].text);
                        return; // Successfully handled by backend fallback
                    }
                } catch (e) { /* ignore json parse error and use local fallback */ }
                throw new Error("OFFLINE_MODE");
            }
            
            if (typing.parentNode) typing.remove();
            if (response.status === 429) {
                showChatError("You're sending messages too fast. Please wait a moment.");
                return;
            }

            // Other API Errors (401, 403, 400, 500) - show inline error, NOT offline mode
            let apiErr = `API Error (${response.status})`;
            try {
                const errJson = await response.json();
                apiErr = errJson.error || apiErr;
            } catch(e) {}
            showChatError(apiErr);
            return;
        }

        let data;
        try {
            data = await response.json();
        } catch (jsonErr) {
            if (typing.parentNode) typing.remove();
            showChatError("API Error: Received malformed response from server.");
            return;
        }
        
        if (typing.parentNode) typing.remove();

        if (data.candidates && data.candidates.length > 0) {
            let replyText = data.candidates[0].content.parts[0].text;
            chatHistory.push({ role: 'model', parts: [{ text: replyText }] });
            chatHistory = chatHistory.slice(-10);
            
            let parsedReply = replyText;
            try {
                const parsed = JSON.parse(replyText);
                if (parsed && typeof parsed === 'object' && parsed.response) {
                    // Enforce follow-up on the response field and map to message for UI compatibility
                    parsed.message = enforceResponse(parsed.response, intent);
                    parsedReply = parsed;
                } else if (parsed && typeof parsed === 'object' && parsed.message) {
                    // Fallback for older cached responses
                    parsed.message = enforceResponse(parsed.message, intent);
                    parsedReply = parsed;
                } else {
                    console.warn("JSON schema invalid (missing response), treating as string fallback");
                    parsedReply = enforceResponse(replyText, intent);
                }
            } catch (e) {
                console.warn("Failed to parse Gemini JSON output. Falling back to plain text.");
                parsedReply = enforceResponse(replyText, intent);
            }
            renderBotMessage(parsedReply);
        }
    } catch (error) {
        if (typing && typing.parentNode) typing.remove();
        
        // Strict Offline Mode Activation
        const isNetworkError = error.message === "NETWORK_ERROR";
        const isOfflineSignal = error.message === "OFFLINE_MODE";

        if (isNetworkError || isOfflineSignal) {
            // Show a non-intrusive warning that we are in offline mode
            const reason = isOfflineSignal ? "Service temporarily offline" : "Connection issue";
            showChatError(`${reason} (Switched to Offline Mode)`);
            
            // Reliability: High-quality mock fallback if API fails
            let mockReply = getMockResponse(text);
            if (!mockReply) {
                mockReply = "I am currently running in offline mode. I can answer questions about **Registration (Form 6)**, **EVM/VVPAT Security**, **Eligibility criteria**, and general election queries. What would you like to know?";
            }
            // Enforce follow-up even on mock responses
            mockReply = enforceResponse(mockReply, intent);
            renderBotMessage(mockReply);
            console.warn("Chat Error (Fell back to mock):", error);
        } else {
            // Broad API errors or malformed JSON are already handled above.
            // Any other unexpected errors log to console.
            console.error("Unexpected Chat Component Error:", error);
        }
    } finally {
        // Always re-enable inputs safely
        input.disabled = false;
        if (sendBtn) sendBtn.disabled = false;
        if (preset) preset.disabled = false;
        input.focus();
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

export function detectTopic(text) {
    const l = text.toLowerCase();
    if (l.includes('register') || l.includes('form 6')) return 'registration';
    if (l.includes('evm') || l.includes('vvpat')) return 'polling';
    if (l.includes('eligible') || l.includes('age')) return 'eligibility';
    if (l.includes('ready') || l.includes('journey')) return 'readiness';
    return 'general';
}

function trackAnalytics(event, data) {
    console.log(`[Analytics] ${event}:`, data);
}

export function getMockResponse(text) {
    const l = text.toLowerCase();

    // NEW: Readiness check — the "winning moment" query
    if (l.includes('ready') || l.includes('am i ready') || l.includes('prepared')) {
        try {
            const journeyState = JSON.parse(localStorage.getItem('electuq_journey')) || {};
            const stepLabels = {
                s1: 'Check Eligibility', s2: 'Enroll on Electoral Roll',
                s3: 'Get EPIC Card', s4: 'Find Your Booth',
                s5: 'Check Voter List', s6: 'Know Your Candidates',
                s7: 'Prepare Valid ID', s8: 'Vote & Result'
            };
            const completed = [];
            const pending = [];
            Object.keys(stepLabels).forEach(key => {
                if (journeyState[key]) completed.push(stepLabels[key]);
                else pending.push(stepLabels[key]);
            });
            const pct = Math.round((completed.length / 8) * 100);

            if (pct === 100) {
                return "**You're 100% Vote Ready! 🎉🏆**\n\nYou've completed every step in your voter readiness journey. You are officially an **Election Champion**.\n\nMake sure to carry your valid ID on polling day and arrive early. Your voice matters!\n\nWant to generate your readiness certificate? Head to the Journey tab! [NAV:journey]";
            } else if (pct >= 50) {
                return `**You're ${pct}% ready — almost there!** 💪\n\n**Completed:** ${completed.join(', ')}\n\n**Still pending:** ${pending.join(', ')}\n\nLet me help you finish the remaining steps. [NAV:journey]`;
            } else {
                return `**You're ${pct}% ready — let's get started!** 🚀\n\n${completed.length > 0 ? `**Done so far:** ${completed.join(', ')}\n\n` : ''}**Pending steps:** ${pending.join(', ')}\n\nI'd suggest starting with "${pending[0]}" first. Want me to guide you? [NAV:journey]`;
            }
        } catch (e) {
            return "Let me check your readiness... Head to the **Journey** tab to track your progress! [NAV:journey]";
        }
    }

    if (l.includes('register') || l.includes('form 6') || l.includes('enroll')) {
        try {
            const wizData = JSON.parse(localStorage.getItem('electuq_wiz')) || {};
            if (wizData[1] === 'under18') return "Since you are under 18, you cannot register to vote just yet. But it's great you're preparing! Let me know if you want to know how the EVM works. [NAV:evm]";
            if (wizData[3] === 'yes') return "You've already indicated you are registered! 🎉 If you need to download your EPIC card or find your booth, head over to the Journey tab. [NAV:journey]";
        } catch(e) {}
        return "**Voter Registration (Form 6)**\n\nTo register as a new voter, you need **Form 6** on the ECI portal.\n\nAre you registering for the very first time, or do you need to update your address? I can guide you based on your needs. Or check your eligibility first! [NAV:eligible]";
    }
    if (l.includes('evm') || l.includes('machine') || l.includes('hack') || l.includes('safe')) {
        return "**EVM & VVPAT Security**\n\nThe EVM is a standalone calculator with no wireless chips, making it highly secure and tamper-proof. The VVPAT prints a paper slip for 7 seconds so you can verify your choice.\n\nWould you like to try casting a mock vote in our simulator? [NAV:evm]";
    }
    if (l.includes('eligible') || l.includes('age') || l.includes('vote')) {
        try {
            const wizData = JSON.parse(localStorage.getItem('electuq_wiz')) || {};
            if (wizData[1] === 'over18' && wizData[2] === 'yes') return "Based on your previous answers, you are over 18 and an Indian citizen, which means you are eligible! Have you registered yet? [NAV:journey]";
        } catch(e) {}
        return "**Voter Eligibility**\n\nYou are eligible if you are:\n✅ An Indian Citizen\n✅ 18+ years old\n✅ An ordinary resident of the polling area\n\nWhy not take our quick 30-second eligibility quiz to be absolutely sure? [NAV:eligible]";
    }
    if (l.includes('nota')) {
        return "**NOTA (None Of The Above)**\n\nNOTA allows you to officially register a vote of rejection. Note that even if NOTA gets the highest votes, the candidate with the next highest number of votes wins.\n\nAny other questions about the polling process?";
    }
    return null;
}

export function validateMessage(text) {
    if (!text || text.length < 2) return "Message too short (min 2 chars).";
    if (text.length > 1000) return "Message too long (max 1000 chars).";
    return null;
}

function showChatError(msg) {
    const stream = document.getElementById('chat-stream');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'msg msg-bot';
    errorDiv.style.background = '#fee2e2';
    errorDiv.style.color = '#dc2626';
    errorDiv.style.border = '1px solid #fecaca';
    errorDiv.textContent = "⚠️ " + msg;
    stream.appendChild(errorDiv);
    stream.scrollTop = stream.scrollHeight;
}

export function renderBotMessage(reply) {
    const stream = document.getElementById('chat-stream');
    const msg = document.createElement('div');
    msg.className = 'msg msg-bot';
    
    let messageText = "";
    let action = "none";
    let target = null;

    if (typeof reply === 'object' && reply !== null) {
        messageText = reply.message || "";
        action = reply.action || "none";
        target = reply.target || null;
    } else {
        messageText = String(reply);
        // Fallback for mock responses or legacy string format
        const navMatch = messageText.match(/\[NAV:(\w+)\]/);
        if (navMatch) {
            action = 'navigate';
            target = navMatch[1];
        }
    }

    // Simple markdown-like bolding and agentic tag parsing
    const clean = messageText.replace(/\[(NAV|HIGHLIGHT):\w+\]/g, '').trim();
    
    if (window.DOMPurify) {
        const formatted = clean.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
        msg.innerHTML = DOMPurify.sanitize(formatted);
    } else {
        console.warn('DOMPurify not found. Falling back to safe textContent rendering.');
        msg.textContent = clean;
    }
    
    // Agentic Navigation Validation
    const validTargets = ['journey', 'eligible', 'finder', 'timeline', 'myths', 'glossary', 'evm'];
    if (action === 'navigate' && validTargets.includes(target)) {
        const btn = document.createElement('button');
        btn.className = 'btn btn-white';
        btn.style.marginTop = '10px';
        btn.style.width = '100%';

        if (target === 'evm') {
            btn.textContent = 'Launch EVM Simulator →';
            btn.setAttribute('data-action', 'open-evm');
        } else {
            btn.textContent = `Go to ${target.charAt(0).toUpperCase() + target.slice(1)} →`;
            btn.setAttribute('data-action', 'show-tab');
            btn.setAttribute('data-tab', target);
        }
        msg.appendChild(btn);
    }

    stream.appendChild(msg);
    stream.scrollTop = stream.scrollHeight;
}

/**
 * Q Dost reacts to journey milestone — called from app.js when a step is toggled
 */
export function qdostReactToStep(stepTitle, isCompleted, pct, badge) {
    const stream = document.getElementById('chat-stream');
    if (!stream) return;

    let message;
    if (isCompleted) {
        if (pct === 100) {
            message = `🎉 **Incredible — you're 100% Vote Ready!** You've completed "${stepTitle}" and earned the **Election Champion** badge! 🏆\n\nYour readiness certificate is ready — go grab it! [NAV:journey]`;
        } else if (pct >= 75) {
            message = `🔥 Great job completing "${stepTitle}"! You're at **${pct}%** — almost an Election Champion! Just a few more steps to go.`;
        } else if (pct >= 50) {
            message = `👏 Nice! "${stepTitle}" is done. You're now a **${badge}** at ${pct}%. Keep going!`;
        } else {
            message = `✅ "${stepTitle}" checked off! You're at ${pct}% — great start! Keep exploring the journey steps.`;
        }
    } else {
        message = `📝 "${stepTitle}" unchecked. Your readiness is now ${pct}%. Need help with this step? Just ask me!`;
    }

    renderBotMessage(message);
}

/**
 * Q Dost announces the certificate when journey hits 100%
 */
export function qdostAnnounceCertificate() {
    const stream = document.getElementById('chat-stream');
    if (!stream) return;

    const msg = document.createElement('div');
    msg.className = 'msg msg-bot';
    msg.innerHTML = `<strong>🏆 You're 100% ready!</strong> Here's your official ElectUQ certificate — you've earned it!<br><br>`;

    const btn = document.createElement('button');
    btn.className = 'btn btn-primary';
    btn.style.width = '100%';
    btn.style.marginTop = '10px';
    btn.textContent = 'Download Certificate 📜';
    btn.setAttribute('data-action', 'generate-cert');
    msg.appendChild(btn);

    stream.appendChild(msg);
    stream.scrollTop = stream.scrollHeight;
}

