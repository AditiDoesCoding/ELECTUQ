import axios from 'axios';

// Sanitization: strip HTML, script patterns, null bytes, and normalize whitespace
const sanitizeInput = (text) => {
  if (typeof text !== 'string') return '';
  return text
    .replace(/\0/g, '')                         // null bytes
    .replace(/<[^>]*>/g, '')                    // HTML tags
    .replace(/javascript\s*:/gi, '')            // JS URI scheme
    .replace(/on\w+\s*=/gi, '')                 // inline event handlers
    .replace(/\s+/g, ' ')                       // collapse whitespace
    .trim()
    .slice(0, 1000);                            // hard cap
};

export default async function handler(req, res) {
  // CORS headers for Vercel
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, history, ...unexpected } = req.body;
    const rawKey = process.env.GEMINI_API_KEY;
    const API_KEY = rawKey ? rawKey.replace(/^["'](.+)["']$/, '$1') : null;

    // Diagnostics Log (Visible in Vercel Dashboard)
    console.log(`[API] Request received. Key Present: ${!!API_KEY} | Is Placeholder: ${API_KEY === 'your_api_key_here'}`);

    if (Object.keys(unexpected).length > 0) {
      return res.status(400).json({ error: "Unexpected fields in request body." });
    }

    if (!API_KEY || API_KEY === 'your_api_key_here') {
      console.error("[CRITICAL] Gemini API Key is missing or using placeholder in Vercel Environment.");
      return res.status(500).json({ error: "Gemini API Key not configured in Vercel settings." });
    }

    if (!message || typeof message !== 'string' || message.length > 2000) {
      return res.status(400).json({ error: "Invalid message format." });
    }

    const internalSystemInstruction = `You are Q Dost, an intelligent voting guide for the ElectUQ platform (2026 Lok Sabha).
Every response MUST end with exactly ONE relevant follow-up question.
Be concise (max 100 words). Strictly neutral. Return JSON only.`;

    // Updated models for 2026 - Including standard production fallbacks
    const modelsToTry = [
      "gemini-2.5-flash", 
      "gemini-2.0-flash", 
      "gemini-1.5-flash", 
      "gemini-1.5-pro",
      "gemini-flash-latest", 
      "gemini-pro-latest"
    ]; 
    
    const requestPayload = {
      system_instruction: { parts: [{ text: internalSystemInstruction }] },
      contents: history || [],
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
      timeout: 8500 // Vercel has a 10s limit; we race and finish within 8.5s
    };

    // Use Promise.any to race all models simultaneously for maximum reliability and speed
    try {
      const requests = modelsToTry.map(async (model) => {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(API_KEY)}`;
        try {
          const result = await axios.post(url, requestPayload, requestConfig);
          if (result.data.candidates && result.data.candidates.length > 0) return result.data;
          throw new Error(`Model ${model} empty`);
        } catch (err) {
          throw err;
        }
      });

      const successfulResponse = await Promise.any(requests);

      // Backend Validation: Ensure the AI output is safe and matches schema
      const rawText = successfulResponse.candidates[0].content.parts[0].text;
      const parsed = JSON.parse(rawText);
      parsed.response = sanitizeInput(parsed.response || "");
      successfulResponse.candidates[0].content.parts[0].text = JSON.stringify(parsed);

      return res.status(200).json(successfulResponse);

    } catch (raceErr) {
      console.error("[API] All models failed or timed out:", raceErr.message);
      return res.status(503).json({
        candidates: [{
          content: {
            parts: [{ text: JSON.stringify({ 
              response: "I'm currently experiencing high traffic and switched to Offline Mode. I can still help you with registration and voting rules!", 
              action: "none" 
            }) }]
          }
        }]
      });
    }

  } catch (err) {
    console.error("[API] Unexpected Error:", err.message);
    res.status(500).json({ error: "Internal server error." });
  }
}

