/**
 * AI Intent Detection
 */
export function detectTopic(text) {
    const l = text.toLowerCase();
    if (l.includes('register') || l.includes('form 6')) return 'registration';
    if (l.includes('evm') || l.includes('vvpat')) return 'polling';
    if (l.includes('eligible') || l.includes('age')) return 'eligibility';
    if (l.includes('ready') || l.includes('journey')) return 'readiness';
    return 'general';
}

/**
 * Basic Message Validation
 */
export function validateMessage(text) {
    if (!text || text.length < 2) return "Message too short (min 2 chars).";
    if (text.length > 1000) return "Message too long (max 1000 chars).";
    return null;
}

/**
 * Shared Sanitization Logic (Pattern)
 */
export const sanitizePattern = (text) => {
  if (typeof text !== 'string') return '';
  return text
    .replace(/\0/g, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 1000);
};
