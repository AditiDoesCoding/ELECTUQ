import axios from 'axios';

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
    .slice(0, 1000);                            // hard cap
};

export default async function handler(req, res) {
  // CORS headers
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

    if (Object.keys(unexpected).length > 0) {
      return res.status(400).json({ error: "Unexpected fields in request body." });
    }

    if (!API_KEY || API_KEY === 'your_api_key_here') {
      return res.status(500).json({ error: "Gemini API Key not configured." });
    }

    if (!message || typeof message !== 'string' || message.length > 2000) {
      return res.status(400).json({ error: "Invalid message." });
    }

    const internalSystemInstruction = `You are Q Dost, an intelligent voting guide for the ElectUQ platform (2026 Lok Sabha).
Every response MUST end with exactly ONE relevant follow-up question.
Be concise (max 100 words). Strictly neutral.`;

    const modelsToTry = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-pro"]; 
    
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
            target: { type: "STRING" }
          },
          required: ["response", "action"]
        }
      }
    };

    const requestConfig = {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000 
    };

    let successfulResponse = null;
    for (const model of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(API_KEY)}`;
        const result = await axios.post(url, requestPayload, requestConfig);
        if (result.data.candidates && result.data.candidates.length > 0) {
          successfulResponse = result.data;
          break;
        }
      } catch (err) {
        console.error(`Model ${model} failed:`, err.message);
      }
    }

    if (!successfulResponse) {
      return res.status(503).json({
        candidates: [{
          content: {
            parts: [{ text: JSON.stringify({ response: "I'm currently experiencing high traffic. Please try again or explore the tabs above!", action: "none" }) }]
          }
        }]
      });
    }

    return res.json(successfulResponse);

  } catch (err) {
    console.error("API Error:", err.message);
    res.status(500).json({ error: "Internal server error." });
  }
}
