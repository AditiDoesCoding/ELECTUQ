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

ElectUQ is an AI-powered election assistant that helps Indian citizens understand *why and how to vote* through an interactive journey, EVM simulation, and a Gemini-powered agent that can guide users step-by-step.

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

India's 2026 elections will involve nearly **1 billion voters** — yet millions of first-time voters disengage before they ever cast a ballot. Three forces drive this:

**Information Overload**  
The election process is scattered across dozens of government portals, PDF forms, and YouTube explainers. A 19-year-old asking "How do I register?" shouldn't need to visit seven different websites to get a straight answer.

**Civic Disconnect**  
A pervasive belief that *"one vote doesn't matter"* — especially among urban youth — leads to mass apathy in the demographic that will determine India's next 30 years. Nobody is answering the *Kyu*.

**Misinformation**  
Myths surrounding EVM security, VVPAT reliability, and narratives of a "rigged system" erode trust in the democratic process itself, suppressing participation before it even begins.

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

## 🌩️ 5. Google Services — Deep Integration

### Built Using Google Antigravity
**ElectUQ was built entirely using Google Antigravity** — the AI-powered development environment that enabled rapid, intelligent iteration throughout every stage of this project from architecture to deployment.

### Google Gemini — Why and How

**`responseSchema` Structured Output**  
Gemini's native schema enforcement is the technical backbone of Q Dost's ability to *drive* the application — not just respond to it. The AI controls UI state. This is not a standard chatbot integration.

**Flash Model Latency**  
The Gemini Flash series maintains a conversational real-time feel even on mobile networks — critical for reaching first-time voters in Tier 2 and Tier 3 cities across India.

**Multi-Model Concurrency**  
Gemini's API architecture allows our `Promise.any` racing implementation, reducing average AI response time and eliminating single points of failure at the model layer.

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

---

## 🧪 9. Testing

Three critical smoke tests cover the backend's most important paths using Jest and Supertest:

**Test 1 — Frontend Delivery**  
`GET /` confirms the application is served correctly with status 200 and HTML content.

**Test 2 — Input Validation**  
`POST /api/chat` with an empty body confirms the validation layer correctly rejects malformed requests with a structured 400 error.

**Test 3 — AI Pipeline Integration**  
`POST /api/chat` with a valid payload confirms the full Gemini racing pipeline activates and returns a structured JSON response.

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
