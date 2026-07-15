const request = require('supertest');
const express = require('express');
const { requireAuth } = require('../src/middleware/auth.middleware');

const app = express();
app.use(express.json());

// Mock route
app.get('/protected', requireAuth, (req, res) => {
  res.json({ message: 'Success' });
});

describe('Auth Middleware', () => {
  it('should reject request without token', async () => {
    const res = await request(app).get('/protected');
    expect(res.status).toBe(401);
    expect(res.body.error).toContain('No token');
  });

  it('should reject request with invalid token', async () => {
    const res = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer invalid_token_xyz');
      
    expect(res.status).toBe(401);
    expect(res.body.error).toContain('Invalid token');
  });
});
