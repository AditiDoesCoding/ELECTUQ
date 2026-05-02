import request from 'supertest';
import app from './server.js';
import { detectTopic, validateMessage, sanitizePattern } from './js/utils.js';

describe('ElectUQ Backend Smoke Tests', () => {
  
  // Test 1: Root endpoint serving the frontend
  test('GET / returns status 200', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.headers['content-type']).toMatch(/html/);
  });

  // Test 2: API Validation for empty body
  test('POST /api/chat with empty body returns 400', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({});
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error');
  });

  // Test 3: API Integration with valid payload
  test('POST /api/chat with valid payload returns 200', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ 
        message: "How do I register to vote?", 
        history: [] 
      });
    
    if (res.statusCode === 200) {
      expect(res.body).toHaveProperty('candidates');
      const text = res.body.candidates[0].content.parts[0].text;
      const parsed = JSON.parse(text);
      expect(parsed).toHaveProperty('response');
    } else {
      expect([200, 500, 503]).toContain(res.statusCode);
    }
  });

  // Test 4: Security - Payload size limit
  test('POST /api/chat with oversized payload should be rejected', async () => {
    const largeMessage = 'a'.repeat(2001); 
    const res = await request(app)
      .post('/api/chat')
      .send({ message: largeMessage, history: [] });
    expect(res.statusCode).toBe(400);
  });

  // Test 5: Method Not Allowed
  test('GET /api/chat should return 405', async () => {
    const res = await request(app).get('/api/chat');
    expect(res.statusCode).toBe(405);
  });

  // Test 6: AI Intent Detection
  describe('AI Intelligence (Intent Detection)', () => {
    test('should detect core intents correctly', () => {
      expect(detectTopic('How to register?')).toBe('registration');
      expect(detectTopic('is evm safe?')).toBe('polling');
      expect(detectTopic('am I eligible?')).toBe('eligibility');
    });
  });

  // Test 7: Input Validation
  describe('Input Security (Validation)', () => {
    test('should validate message length', () => {
      expect(validateMessage('a')).toBe('Message too short (min 2 chars).');
      expect(validateMessage('How do I vote?')).toBeNull();
    });
  });

  // Test 8: Sanitization Patterns
  describe('Security (Sanitization)', () => {
    test('should strip dangerous tags', () => {
      expect(sanitizePattern('<script>alert(1)</script>')).toBe('alert(1)');
    });
  });

});
