import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import mongoose from 'mongoose';
import app from '../server.js';
import User from '../models/User.js';
import { connectDB } from '../config/db.js';

// Helper to make HTTP JSON requests
const makeRequest = ({ port, path, method = 'GET', headers = {}, body = null }) => {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    };
    if (payload) {
      reqHeaders['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path,
        method,
        headers: reqHeaders,
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => {
          rawData += chunk;
        });
        res.on('end', () => {
          try {
            resolve({
              statusCode: res.statusCode,
              body: rawData ? JSON.parse(rawData) : null,
            });
          } catch (e) {
            resolve({
              statusCode: res.statusCode,
              body: rawData,
            });
          }
        });
      }
    );

    req.on('error', reject);
    if (payload) {
      req.write(payload);
    }
    req.end();
  });
};

test('Food Genie Authentication & RBAC Test Suite', async (t) => {
  let server;
  let testPort;
  let customerToken = '';
  let customerId = '';
  let adminToken = '';

  const testCustomerEmail = `customer_${Date.now()}@test-genie.com`;
  const testAdminEmail = `admin_${Date.now()}@test-genie.com`;

  await t.test('Setup: Connect DB and start test server', async () => {
    await connectDB();
    await new Promise((resolve, reject) => {
      server = app.listen(0, '127.0.0.1', () => {
        testPort = server.address().port;
        resolve();
      });
      server.on('error', reject);
    });
    assert.ok(testPort > 0);
  });

  await t.test('POST /api/auth/register fails with missing fields', async () => {
    const res = await makeRequest({
      port: testPort,
      path: '/api/auth/register',
      method: 'POST',
      body: { email: 'bad@test.com' },
    });

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /provide name, email, and password/i);
  });

  await t.test('POST /api/auth/register succeeds with valid customer credentials', async () => {
    const res = await makeRequest({
      port: testPort,
      path: '/api/auth/register',
      method: 'POST',
      body: {
        name: 'John Foodie',
        email: testCustomerEmail,
        password: 'password123',
        phone: '9876543210',
      },
    });

    assert.equal(res.statusCode, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.token, 'Should return a JWT token');
    assert.equal(res.body.user.email, testCustomerEmail);
    assert.equal(res.body.user.role, 'customer');
    assert.equal(res.body.user.password, undefined, 'Password should never be leaked');

    customerToken = res.body.token;
    customerId = res.body.user._id;
  });

  await t.test('POST /api/auth/register rejects duplicate email with 409 Conflict', async () => {
    const res = await makeRequest({
      port: testPort,
      path: '/api/auth/register',
      method: 'POST',
      body: {
        name: 'Duplicate John',
        email: testCustomerEmail,
        password: 'password123',
      },
    });

    assert.equal(res.statusCode, 409);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /already exists/i);
  });

  await t.test('POST /api/auth/login succeeds with correct credentials', async () => {
    const res = await makeRequest({
      port: testPort,
      path: '/api/auth/login',
      method: 'POST',
      body: {
        email: testCustomerEmail,
        password: 'password123',
      },
    });

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.token);
    assert.equal(res.body.user.email, testCustomerEmail);
  });

  await t.test('POST /api/auth/login fails with invalid password', async () => {
    const res = await makeRequest({
      port: testPort,
      path: '/api/auth/login',
      method: 'POST',
      body: {
        email: testCustomerEmail,
        password: 'wrong_password_999',
      },
    });

    assert.equal(res.statusCode, 401);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /invalid email or password/i);
  });

  await t.test('GET /api/auth/profile rejects unauthenticated request (no token)', async () => {
    const res = await makeRequest({
      port: testPort,
      path: '/api/auth/profile',
      method: 'GET',
    });

    assert.equal(res.statusCode, 401);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /no authorization token/i);
  });

  await t.test('GET /api/auth/profile succeeds with valid Bearer token', async () => {
    const res = await makeRequest({
      port: testPort,
      path: '/api/auth/profile',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${customerToken}`,
      },
    });

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.user.email, testCustomerEmail);
    assert.equal(res.body.user.name, 'John Foodie');
  });

  await t.test('PUT /api/auth/profile updates user phone and address', async () => {
    const res = await makeRequest({
      port: testPort,
      path: '/api/auth/profile',
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${customerToken}`,
      },
      body: {
        name: 'John Updated Foodie',
        phone: '1122334455',
        address: {
          city: 'Bangalore',
          state: 'Karnataka',
        },
      },
    });

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.user.name, 'John Updated Foodie');
    assert.equal(res.body.user.phone, '1122334455');
    assert.equal(res.body.user.address.city, 'Bangalore');
  });

  await t.test('RBAC: Customer cannot access Admin-only /api/auth/users (403 Forbidden)', async () => {
    const res = await makeRequest({
      port: testPort,
      path: '/api/auth/users',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${customerToken}`,
      },
    });

    assert.equal(res.statusCode, 403);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /does not have permission/i);
  });

  await t.test('RBAC: Admin user registration and successful access to /api/auth/users', async () => {
    // Register admin user
    const regRes = await makeRequest({
      port: testPort,
      path: '/api/auth/register',
      method: 'POST',
      body: {
        name: 'Genie Admin',
        email: testAdminEmail,
        password: 'admin_password_123',
        role: 'admin',
      },
    });

    assert.equal(regRes.statusCode, 201);
    assert.equal(regRes.body.user.role, 'admin');
    adminToken = regRes.body.token;

    // Access admin route
    const adminRes = await makeRequest({
      port: testPort,
      path: '/api/auth/users',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    assert.equal(adminRes.statusCode, 200);
    assert.equal(adminRes.body.success, true);
    assert.ok(Array.isArray(adminRes.body.users));
    assert.ok(adminRes.body.count >= 2);
  });

  await t.test('Cleanup: Delete test users and teardown server', async () => {
    await User.deleteMany({
      email: { $in: [testCustomerEmail, testAdminEmail] },
    });
    await new Promise((resolve) => server.close(resolve));
    await mongoose.connection.close();
  });
});

