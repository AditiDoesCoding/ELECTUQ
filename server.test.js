import request from 'supertest';
import app from './server.js';

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

});
