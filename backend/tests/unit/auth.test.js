/**
 * Unit Tests — Authentication Controller
 */

'use strict';

const request  = require('supertest');
const mongoose = require('mongoose');
const app      = require('../../server');
const User     = require('../../models/User.model');

// Hooks are managed globally by setup.js

// ── Register ─────────────────────────────────────────────────────────────────
describe('POST /api/v1/auth/register', () => {
  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Test User', email: 'test@example.com', password: 'Test@1234' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe('test@example.com');
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.password).toBeUndefined();
  });

  it('should return 409 for duplicate email', async () => {
    await User.create({ name: 'Existing', email: 'dupe@example.com', password: 'Test@1234' });
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Test', email: 'dupe@example.com', password: 'Test@1234' });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('should return 422 for invalid email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Test', email: 'not-an-email', password: 'Test@1234' });

    expect(res.status).toBe(422);
    expect(res.body.errors).toBeDefined();
  });

  it('should return 422 for weak password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Test', email: 'test@example.com', password: '1234' });

    expect(res.status).toBe(422);
  });
});

// ── Login ─────────────────────────────────────────────────────────────────────
describe('POST /api/v1/auth/login', () => {
  beforeEach(async () => {
    await User.create({ name: 'Test', email: 'login@example.com', password: 'Test@1234' });
  });

  it('should login successfully with correct credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'login@example.com', password: 'Test@1234' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.accessToken).toBeDefined();
  });

  it('should return 401 for wrong password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'login@example.com', password: 'WrongPass' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should return 401 for non-existent user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nobody@example.com', password: 'Test@1234' });

    expect(res.status).toBe(401);
  });
});

// ── Get Me ───────────────────────────────────────────────────────────────────
describe('GET /api/v1/auth/me', () => {
  let token;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Me User', email: 'me@example.com', password: 'Test@1234' });
    token = res.body.accessToken;
  });

  it('should return current user with valid token', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe('me@example.com');
  });

  it('should return 401 without token', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });

  it('should return 401 with invalid token', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer invalid.token.here');
    expect(res.status).toBe(401);
  });
});
