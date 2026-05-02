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

app.use(cors());
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

app.post('/api/chat', chatLimiter, async (req, res) => {
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
    
    const internalSystemInstruction = `You are Q Dost, an intelligent voting guide for the ElectUQ platform (2026 Lok Sabha).
You are an agent that helps users become vote-ready.
- Never repeat information the user already knows.
- Always end with exactly ONE actionable follow-up question.

CRITICAL DIRECTIVES:
1. MANDATORY FOLLOW-UP: Every response MUST end with exactly ONE relevant follow-up question.
2. CONTEXT AWARE: Guide users to relevant tabs (Finder, Journey, Timeline). If under 18, pivot to education.

CAPABILITIES:
- Return action="navigate" and target="journey"|"eligible"|"finder"|"timeline"|"myths"|"glossary"|"evm" in your JSON to navigate the user.

RULES:
- Be concise (max 100 words).
- Factually accurate regarding Election Commission of India (ECI) procedures.
- Strictly neutral (no political bias).`;

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
});

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  app.listen(PORT, () => {
    // console.log(`Server running at http://localhost:${PORT}`);
  });
}

export default app;
