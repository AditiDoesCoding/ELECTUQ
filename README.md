# 🗳️ ElectUQ — Elect You Why?
### *"Samajho. Jano. Vote Karo."*
### India's AI-Powered Civic Intelligence Platform for the 2026 Lok Sabha Elections

**Built using Google Antigravity** • Powered by Google Gemini AI

[![Deployment](https://img.shields.io/badge/Deployed-Vercel-black?style=for-the-badge&logo=vercel)](https://electuq.vercel.app)
[![AI](https://img.shields.io/badge/AI-Google_Gemini-blue?style=for-the-badge&logo=google-gemini)](https://ai.google.dev/)
[![Built_With](https://img.shields.io/badge/Built_With-Google_Antigravity-orange?style=for-the-badge)](https://antigravity.dev/)
[![Hackathon](https://img.shields.io/badge/Hackathon-Prompt_Wars_Hack2Skill-blue?style=for-the-badge)](https://hack2skill.com/)
[![Challenge](https://img.shields.io/badge/Challenge-Election_Process_Education-green?style=for-the-badge)]()
[![Status](https://img.shields.io/badge/Deployment-Live_on_Vercel-brightgreen?style=for-the-badge)]()

---

## ⚡ TL;DR

> **968 million voters. Millions of them unprepared. ElectUQ changes that in 5 minutes.**

ElectUQ is an **AI-powered civic intelligence platform** for India's 2026 Lok Sabha Elections. It combines a **Gemini-powered agentic AI guide**, a **gamified 8-step voter readiness journey**, a **high-fidelity EVM simulator**, and real-time **constituency intelligence** — all in a single, zero-install web app that works on any phone.

**Production-grade from day one:** Multi-model AI racing via `Promise.any`, structured JSON output via Gemini `responseSchema`, server-side prompt injection protection, rate limiting, DOMPurify sanitization, Helmet.js security headers, and a full automated test suite.

---
> ⚠️ **Disclaimer:** ElectUQ is an independent hackathon prototype built for educational purposes and is not affiliated with or endorsed by the Election Commission of India.
---
## 🎯 1. Why "ElectUQ"? — The Kyu Story

Most people know *how* to vote.  
Almost nobody understands *why* their vote actually changes anything.

**ElectUQ** was built to close that gap.

The name carries a deliberate double meaning:

> **Elect U Q** → Phonetically: *"Elect You Why?"*  
> **Kyu (क्यों)** → The Hindi word for *Why*

In every election, the most powerful question a citizen can ask is *"Kyu?"* — *Why* should I vote? *Why* does my vote matter? *Why* should I trust the EVM? **ElectUQ** was built to answer every single one.

We shouldn't vote just because everyone else does.  
We shouldn't vote just because it's election season.  
We should vote because **it is the single most direct tool every citizen has to shape the country they live in.**

That belief is the foundation every line of this project is built on.

---

## 🚩 2. The Problem ElectUQ Solves

> **In 2024, over 10 Lok Sabha seats were decided by fewer than 1,000 votes. Every single vote counted. Most people never knew.**

India's 2026 elections will involve nearly **968 million registered voters** — yet millions of first-time voters disengage before casting a single ballot. Three forces drive this crisis:

### 🌀 Information Overload
The registration process spans **7+ government portals**, endless PDF forms, and contradictory YouTube explainers. A 19-year-old asking "How do I register?" shouldn't need to become a researcher to get a straight answer. **ElectUQ answers it in one sentence.**

### 💔 Civic Disconnect
Urban youth suffer from a mass delusion: *"My one vote doesn't matter."* This apathy is most concentrated in the **18–25 demographic** — the same demographic that will decide India's next three decades. Nobody was answering the *Kyu* (Why). **ElectUQ was built to answer nothing else.**

### 🕸️ Misinformation
EVM conspiracy theories, VVPAT myths, and "rigged system" narratives suppress voter turnout before a single ballot is cast. **ElectUQ's 20-card Myth Buster module destroys every major election myth with ECI-verified facts** — in an interactive, shareable format.

---

## ✨ 3. The Solution — An 8-Step Journey to Election Champion

ElectUQ transforms the overwhelming election process into a **gamified, AI-powered, 8-step journey** from *Curious Citizen* to *Certified Election Champion*:

| # | Feature | Purpose |
|---|---------|---------|
| 1 | 📝 **Eligibility Wizard** | 30-second check to verify voting rights before anything else |
| 2 | 🗺️ **Constituency Finder** | PIN-code based mapping for local polling station intelligence |
| 3 | 🗳️ **EVM/VVPAT Simulator** | High-fidelity practice booth with real audio feedback — because the #1 reason people hesitate at polling booths is they've never seen one before |
| 4 | 🧠 **Myth Buster** | Interactive flashcard grid built to destroy electoral misinformation with ECI-verified facts |
| 5 | 📊 **Democratic Pulse** | High-level insights into how Lok Sabha vs Assembly cycles actually work |
| 6 | 🕒 **Election Timeline** | Visual phase-progression map for the 2026 Lok Sabha elections |
| 7 | 🏆 **Readiness Roadmap** | Progress tracker with a shareable "Election Champion" certificate |
| 8 | 🤖 **Q Dost AI Assistant** | A context-aware Gemini-powered agent that knows exactly where you are in the journey and tells you your *next* step — not a generic FAQ answer |

---

## ⚙️ 4. Technical Architecture — How It Actually Works

The intelligence behind ElectUQ is a multi-layer pipeline engineered for reliability, speed, and zero broken user experiences.

### 4.1 Context Aggregation
Before every single AI interaction, the system builds a rich context map by pulling together the user's selected state, their 8-step journey progress from `localStorage`, their eligibility wizard answers, and their language preference. **Q Dost never responds to a question in isolation** — it always knows exactly where the user is in their journey before generating a single word.

### 4.2 Intent Detection
User queries are classified into intent categories — Registration, Polling Process, EVM Security, Eligibility — before they reach the model. This enables Q Dost to respond with the user's *next logical step* instead of a wall of generic text.

### 4.3 High-Performance Model Racing via `Promise.any`
To eliminate AI latency, the backend fires **concurrent requests to multiple Gemini model variants simultaneously**. The first successful response wins and is served immediately. This is not a fallback chain — it's a true race.

```javascript
// Multiple models race. Fastest response serves the user.
const response = await Promise.any([
  callGeminiModel('gemini-2.5-flash', payload),
  callGeminiModel('gemini-2.0-flash', payload),
  callGeminiModel('gemini-1.5-pro', payload)
]);
```

This architecture guarantees responses within Vercel's 10-second serverless timeout — a ruthless, production-grade engineering decision.

### 4.4 Structured JSON Output via Gemini `responseSchema`
This is the architectural decision that separates ElectUQ from every other election chatbot.

Instead of parsing free-text AI responses with brittle regex, we use **Gemini's native `responseSchema`** with `responseMimeType: "application/json"` to enforce a strict JSON contract:

```json
{ "response": "string", "action": "string", "target": "string" }
```

This means **Q Dost doesn't just talk — it acts.** The AI can programmatically trigger UI navigation, open the EVM simulator, jump to specific journey steps, and render interactive buttons — with **100% reliability**. No regex. No hoping the model formats correctly. Deterministic UI control from AI output.

### 4.5 9-Second Timeout + Deterministic Offline Fallback
The backend enforces a hard `9000ms` timeout. If all racing models fail, a **context-aware offline fallback** activates — using the user's local `journeyState` and an internal keyword-matching engine to provide ECI-verified guidance without any live API call. The user never sees a broken screen. Ever.

### 4.6 Prompt Injection Protection
All system instructions are hardcoded on the backend. The frontend never sends raw prompts to Gemini — preventing users from jailbreaking the AI into producing inappropriate content.

---

## 🌩️ 5. Google Services — Deep, Intentional Integration

> This is not a project that *uses* Google AI. It's a project that is *architected around* Google AI.

### 🔨 Built Using Google Antigravity
**ElectUQ was designed, architected, debugged, and deployed entirely using Google Antigravity** — every single line of code in this repository was written with AI assistance. This isn't a toy integration — Antigravity enabled a **production-grade, multi-layer engineering system** to be built in hackathon timeframes.

### 🧠 Google Gemini — 4 Distinct Integration Points

**1. `responseSchema` Structured Output — The Core Innovation**
Instead of parsing brittle free-text responses, ElectUQ uses **Gemini's native `responseSchema`** to enforce a strict typed JSON contract on every single AI call. This means Q Dost doesn't just answer — it **controls the UI**. The AI can trigger navigation, open modals, and render interactive buttons. Deterministic. Reliable. Never broken.

**2. Multi-Model Racing via `Promise.any` — Zero Latency Architecture**
The backend fires **simultaneous requests to 6 Gemini model variants** — Flash 2.5, Flash 2.0, Flash 1.5, Pro 1.5, and more. The first success wins. This guarantees sub-second responses and eliminates every single point of AI failure without a fallback chain.

**3. System Instructions + Context Injection**
Every AI call includes a dynamically constructed system instruction with the user's journey progress, state, eligibility answers, and language preference. Q Dost is **contextually aware of every user** on every message.

**4. Gemini Flash for Mobile-First India**
The Flash series' speed and efficiency is not incidental — it's **critical for Tier 2 and Tier 3 city voters** on 4G networks who are the primary target demographic for ElectUQ.

---

## 🛠️ 6. Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **AI Engine** | Google Gemini (Flash + Pro) | `responseSchema`, low latency, concurrent racing |
| **Dev Environment** | Google Antigravity | AI-powered development throughout |
| **Backend** | Node.js (ES Modules), Express.js | Clean async architecture, serverless-ready |
| **Frontend** | Vanilla JS (ES6+), HTML5, CSS3 | Zero frameworks = maximum performance |
| **Design System** | Glassmorphism + CSS custom properties | Premium UI, full dark mode |
| **Security** | Helmet.js, DOMPurify, express-rate-limit | Multi-layer defense |
| **Testing** | Jest, Supertest | Smoke test coverage on critical paths |
| **Deployment** | Vercel (Edge Functions) | Edge-optimized global delivery |

---

## 🛡️ 7. Security — Multi-Layer Defense

**HTTP Security Headers via Helmet.js**  
Active protection against clickjacking (`X-Frame-Options`), MIME-sniffing (`X-Content-Type-Options`), and protocol downgrade attacks (`Strict-Transport-Security`).

**AI Output Sanitization via DOMPurify**  
Every AI-generated response is scrubbed through DOMPurify before rendering — preventing XSS attacks even if the model is manipulated into generating malicious markup.

**Prompt Injection Protection**  
System instructions are hardcoded server-side. The frontend never exposes raw prompts — making jailbreaking architecturally impossible.

**Rate Limiting via express-rate-limit**  
Per-IP rate limiting on all API endpoints protects the Gemini API key from abuse and prevents denial-of-service attacks.

**Payload Controls**  
Backend middleware enforces a strict 100kb request body limit, blocking oversized injection attempts before they reach any application logic.

**Structured Output Validation**  
The `responseSchema` contract means the frontend only ever receives validated, typed JSON — never arbitrary executable content from the AI.

---

## ♿ 8. Accessibility — Built for All of India

**Bilingual Support (English + Hindi)**  
Full language toggle ensures ElectUQ reaches voters across linguistic demographics — not just English-literate urban users.

**High-Contrast Dark Mode**  
CSS custom properties power a full dark mode with proper contrast ratios for users with visual impairments.

**Focus Management**  
Custom `focusManager` traps keyboard focus inside modals (EVM Simulator, Eligibility Wizard) — a critical WCAG requirement ensuring screen-reader users are never stranded outside the modal.

**ARIA Live Regions**  
`aria-live` on the Q Dost chat stream ensures every AI response is announced to screen readers in real time.

**Skip to Content Link**  
A hidden skip navigation link at the top of `<body>` lets keyboard-only users bypass the header and jump directly to main content.

**Keyboard Navigation**  
Every interactive element is accessible via `Tab`, `Enter`, and `Space` — no mouse required.

## 🧪 9. Testing

The platform is backed by a comprehensive test suite covering both backend API integrity and frontend business logic:

**1. Frontend Logic & Intelligence (`js/logic.test.js`)**  
Validates AI intent detection, input sanitization patterns, and async state management.

**2. Backend API Integrity (`server.test.js`)**  
Covers frontend delivery, input validation, payload size limits, and full Gemini pipeline integration.

Manual QA was performed across all 8 journey steps for localStorage persistence, correct state progression, language toggle behaviour, and offline fallback activation under simulated network failure.

```bash
npm test
```

---

## 🚀 10. Setup & Installation

### Prerequisites
- Node.js v16+
- Google Gemini API Key from [Google AI Studio](https://aistudio.google.com)

```bash
# 1. Clone the repository
git clone https://github.com/AditiDoesCoding/ELECTUQ.git
cd ELECTUQ

# 2. Install dependencies
npm install

# 3. Configure environment
echo "GEMINI_API_KEY=your_key_here" > .env
echo "PORT=3000" >> .env

# 4. Start the server
npm start

# Development mode (hot reload)
npm run dev

# Run tests
npm test
```

🌐 **Live Demo:** https://electuq.vercel.app

---

## 📝 11. Assumptions

- Journey state is persisted via `localStorage` through an async abstraction layer (`js/storage.js`) — zero database configuration required. The Promise-based architecture is a direct drop-in integration point for Firebase or Supabase without any UI refactoring.
- Election phase data and constituency information is based on 2026 ECI projections, simulated for the hackathon context.
- The backend is stateless — all user memory is stored locally in the browser for privacy.
- Users have basic internet for AI features. The offline fallback ensures full graceful degradation under any network condition.
- The UI relies on modern browser APIs: AudioContext for EVM audio feedback, ES6 Modules, CSS custom properties.

---

## 🔮 12. Future Improvements

**Live Polling Data** — ECI API integration for real-time queue times and exact booth mapping via Google Maps Platform.

**WhatsApp Integration** — Bringing Q Dost to India's most used messaging platform for grassroots reach.

**Voice-to-Vote** — Web Speech API so Q Dost can be spoken to in regional dialects — making the platform accessible to elderly voters and users with limited literacy.

**Candidate OCR** — Upload a candidate pamphlet, let AI extract their declared assets, criminal record, and manifesto commitments for side-by-side comparison.

**OTP Authentication** — Voter ID linked login with cross-device sync via Firebase.

**Regional Language Expansion** — Tamil, Telugu, Bengali, Marathi text-to-speech. Because democracy should speak every language India does.

---

## 🏗️ 13. Persistence Architecture

**Current:** `localStorage` via async abstraction — zero-configuration, works offline, persists across sessions.

**Designed for scale:** Every storage call returns a Promise. Firebase Firestore or Supabase is a configuration swap, not a rewrite.

**Cross-device ready:** Authenticated cross-device sync is an integration point already built into the architecture — waiting for a backend, not waiting for a refactor.

---

<div align="center">

---

*"Before I built ElectUQ, I couldn't tell you the difference between a Lok Sabha and a Vidhan Sabha seat.*  
*I finished it actually understanding why elections matter.*  
*That's what this platform is for."*  
— **Aditi Lokhande, Builder**

---

## 🇮🇳 ElectUQ

**Because democracy isn't just about the ballot box.**  
**It's about the *Kyu* (क्यों) behind the vote.**

*Built with Google Antigravity • Powered by Google Gemini AI*

**Samajho. Jano. Vote Karo.**

</div>
