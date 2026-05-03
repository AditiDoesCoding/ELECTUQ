import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Safe Debug Log
const keyExists = !!process.env.GEMINI_API_KEY;
const isPlaceholder = process.env.GEMINI_API_KEY === 'your_api_key_here';
// console.log(`[BOOT] Environment: ${keyExists ? 'Key Found' : 'KEY MISSING'} | Status: ${isPlaceholder ? 'PLACEHOLDER DETECTED' : 'READY'}`);

const app = express();
app.set('trust proxy', 1);
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: ['https://electuq.vercel.app', 
           'http://localhost:3000'],
  methods: ['GET', 'POST']
}));
app.use(express.json({ limit: '100kb' })); // Security: Limit payload size

// Root route - serve index.html first
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Static assets
app.use(express.static(path.join(__dirname)));
app.use('/styles', express.static(path.join(__dirname, 'styles')));
app.use('/js', express.static(path.join(__dirname, 'js')));

// Rate limiting: 100 requests per IP per minute
const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests. Please wait - you're sending messages too fast." }
});

// Sanitization: strip HTML, script patterns, null bytes, and normalize whitespace
const sanitizeInput = (text) => {
  if (typeof text !== 'string') return '';
  return text
    .replace(/\0/g, '')                         // null bytes
    .replace(/<[^>]*>/g, '')                    // HTML tags
    .replace(/javascript\s*:/gi, '')            // JS URI scheme
    .replace(/on\w+\s*=/gi, '')                 // inline event handlers (onclick=, onerror=, etc.)
    .replace(/\s+/g, ' ')                       // collapse whitespace
    .trim()
    .slice(0, 1000);                            // hard cap (defense-in-depth with backend 100kb limit)
};

app.route('/api/chat').post(chatLimiter, async (req, res) => {
  try {
    const { message, history, ...unexpected } = req.body;
    const rawKey = process.env.GEMINI_API_KEY;
    const API_KEY = rawKey ? rawKey.replace(/^["'](.+)["']$/, '$1') : null;

    // Security & Validation
    if (Object.keys(unexpected).length > 0) {
      return res.status(400).json({ error: "Unexpected fields in request body. Only message and history are allowed." });
    }

    if (!API_KEY || API_KEY === 'your_api_key_here') {
      console.error("Missing or invalid GEMINI_API_KEY in environment.");
      return res.status(500).json({ error: "Gemini API Key not configured on server." });
    }

    if (!message || typeof message !== 'string' || message.length > 2000) {
      return res.status(400).json({ error: "Invalid message format or length." });
    }

    if (!Array.isArray(history) || history.length > 20) {
      return res.status(400).json({ error: "Invalid history format or too long." });
    }

    const sanitizedMessage = sanitizeInput(message);
    
    const internalSystemInstruction = `You are Q Dost — India's most trusted AI voting companion for the 2026 Lok Sabha Elections, built into the ElectUQ platform.

You are NOT a passive FAQ bot. You are a proactive civic agent whose mission is to turn every user into a confident, informed voter.

YOUR PERSONALITY:
- Warm, encouraging, and celebratory — like a knowledgeable elder sibling who genuinely cares.
- When a user completes a step or shows progress, CELEBRATE it. ("That's amazing! You're already ahead of 80% of first-time voters!")
- When a user is confused or worried (e.g., about EVM security), be reassuring and factual.
- Never lecture. Guide, one step at a time.

CRITICAL DIRECTIVES:
1. MANDATORY FOLLOW-UP: Every response MUST end with exactly ONE specific, actionable follow-up question.
2. CONTEXT AWARE: Always guide users to the most relevant next action. Reference tabs by name: Finder, Journey, Timeline, Myth Buster, AI Chat.
3. YOUTH FIRST: If a user seems disengaged ("my vote doesn't matter"), re-engage with impact ("In 2019, over 10 seats were decided by fewer than 1000 votes — yours is one of them.").
4. UNDER-18 PIVOT: If user is under 18, pivot gracefully to education: EVM simulator, how elections work, and how to prepare for when they ARE eligible.

CAPABILITIES:
- Return action="navigate" and target="journey"|"eligible"|"finder"|"timeline"|"myths"|"glossary"|"evm" in your JSON to navigate the user to the right section instantly.

RULES:
- Be concise (max 100 words in the response field).
- Factually accurate regarding Election Commission of India (ECI) procedures only.
- Strictly neutral — zero political bias, zero party endorsements, ever.
- Always end with exactly one follow-up question.`;

    const modelsToTry = [
      "gemini-2.5-flash", 
      "gemini-2.0-flash", 
      "gemini-1.5-flash", 
      "gemini-1.5-pro",
      "gemini-flash-latest", 
      "gemini-pro-latest"
    ]; 
    let lastError = null;

    const requestPayload = {
      system_instruction: { parts: [{ text: internalSystemInstruction }] },
      contents: history,
      generationConfig: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            response: { type: "STRING" },
            action: { type: "STRING", enum: ["navigate", "none"] },
            target: { type: "STRING", description: "Target tab/view to navigate to" }
          },
          required: ["response", "action"]
        }
      }
    };

    const requestConfig = {
      headers: { 'Content-Type': 'application/json' },
      timeout: 9000 // Guarantee total execution < 10s
    };

    try {
      const requests = modelsToTry.map(async (model) => {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(API_KEY)}`;
        try {
          const res = await axios.post(url, requestPayload, requestConfig);
          if (res.data.candidates && res.data.candidates.length > 0) return res.data;
          throw new Error(`Model ${model} returned empty candidates`);
        } catch (err) {
          const detail = err.response ? JSON.stringify(err.response.data) : err.message;
          console.error(`[AI Model Error] ${model}:`, detail);
          throw err;
        }
      });

      // Race the models concurrently
      const successfulResponse = await Promise.any(requests);

      if (!successfulResponse.candidates || successfulResponse.candidates.length === 0) {
        throw new Error("Gemini returned no candidates.");
      }

      const candidate = successfulResponse.candidates[0];
      if (candidate.finishReason && candidate.finishReason !== 'STOP' && candidate.finishReason !== 'MAX_TOKENS') {
        throw new Error(`Gemini blocked response: ${candidate.finishReason}`);
      }

      // Backend Guardrails & Validation
      try {
        const rawText = successfulResponse.candidates[0].content.parts[0].text;
        const parsed = JSON.parse(rawText);
        
        if (!parsed.response || typeof parsed.response !== 'string') {
          throw new Error("Malformed schema: missing or invalid 'response' field");
        }
        if (!['navigate', 'none'].includes(parsed.action)) {
          parsed.action = 'none';
        }
        
        // Ensure no malicious HTML makes it out from the AI
        parsed.response = sanitizeInput(parsed.response);
        
        // Overwrite the raw text with the validated JSON
        successfulResponse.candidates[0].content.parts[0].text = JSON.stringify(parsed);
      } catch (validationErr) {
        console.error("AI Output Validation Failed:", validationErr);
        throw new Error("AI produced unsafe or malformed output."); // Triggers fallback
      }

      // console.log(`[AI] Response generated successfully via Gemini.`);
      return res.json(successfulResponse);
    } catch (aggregateError) {
      const error = aggregateError.errors ? aggregateError.errors[0] : aggregateError;
      const errorDetail = error.response ? JSON.stringify(error.response.data) : error.message;
      console.error("AI Model Failure Detail:", errorDetail);
      lastError = errorDetail;
    }

    // Graceful Fallback if all models fail
    console.error("Fallback Triggered. Last Error:", lastError);
    return res.status(503).json({
      candidates: [{
        content: {
          parts: [{ text: "I'm currently experiencing high traffic and running in offline mode. I can still help you! Check out the [NAV:journey] tab or ask me basic questions about registration and EVMs." }]
        }
      }]
    });

  } catch (err) {
    console.error("Unexpected Server Error:", err.message);
    res.status(500).json({ error: "Internal server error occurred." });
  }
}).all((req, res) => res.status(405).json({ error: "Method not allowed" }));

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

export default app;
