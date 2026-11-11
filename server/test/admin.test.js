import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import mongoose from 'mongoose';
import app from '../server.js';
import { connectDB } from '../config/db.js';
import { seedDatabase } from '../utils/seedData.js';
import User from '../models/User.js';
import Food from '../models/Food.js';
import Order from '../models/Order.js';
import generateToken from '../utils/generateToken.js';

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

test('Food Genie Admin Dashboard & Management Test Suite', async (t) => {
  let server;
  let testPort;
  let adminToken;
  let customerToken;
  let sampleOrder;
  let sampleFood;

  await t.test('Setup: Connect DB, seed data and create test admin/customer', async () => {
    await connectDB();
    await seedDatabase(true);

    const admin = await User.create({
      name: 'Super Admin',
      email: `superadmin_${Date.now()}@test-genie.com`,
      password: 'password123',
      role: 'admin',
    });
    adminToken = generateToken(admin._id, 'admin');

    const customer = await User.create({
      name: 'Regular Customer',
      email: `regcustomer_${Date.now()}@test-genie.com`,
      password: 'password123',
      role: 'customer',
    });
    customerToken = generateToken(customer._id, 'customer');

    sampleFood = await Food.findOne();
    assert.ok(sampleFood);

    sampleOrder = await Order.create({
      user: customer._id,
      orderItems: [
        {
          food: sampleFood._id,
          name: sampleFood.name,
          image: sampleFood.image,
          price: sampleFood.price,
          quantity: 2,
          isVeg: sampleFood.isVeg,
        },
      ],
      shippingAddress: {
        street: '100 Admin Way',
        city: 'Bangalore',
        state: 'Karnataka',
        zipCode: '560001',
      },
      phone: '9988776655',
      paymentMethod: 'COD',
      itemsPrice: sampleFood.price * 2,
      deliveryPrice: 0,
      taxPrice: Math.round(sampleFood.price * 2 * 0.05),
      totalPrice: sampleFood.price * 2 + Math.round(sampleFood.price * 2 * 0.05),
      orderStatus: 'Placed',
    });

    await new Promise((resolve, reject) => {
      server = app.listen(0, '127.0.0.1', () => {
        testPort = server.address().port;
        resolve();
      });
      server.on('error', reject);
    });
    assert.ok(testPort > 0);
  });

  await t.test('GET /api/admin/stats rejects unauthenticated request (401)', async () => {
    const res = await makeRequest({
      port: testPort,
      path: '/api/admin/stats',
    });

    assert.equal(res.statusCode, 401);
    assert.equal(res.body.success, false);
  });

  await t.test('GET /api/admin/stats rejects customer token with 403 Forbidden', async () => {
    const res = await makeRequest({
      port: testPort,
      path: '/api/admin/stats',
      headers: {
        Authorization: `Bearer ${customerToken}`,
      },
    });

    assert.equal(res.statusCode, 403);
    assert.equal(res.body.success, false);
  });

  await t.test('GET /api/admin/stats returns real aggregated business metrics', async () => {
    const res = await makeRequest({
      port: testPort,
      path: '/api/admin/stats',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.stats);
    assert.ok(typeof res.body.stats.totalRevenue === 'number');
    assert.ok(res.body.stats.totalOrders >= 1);
    assert.ok(res.body.stats.activeFoods > 0);
    assert.ok(res.body.stats.statusBreakdown.Placed >= 1);
    assert.ok(Array.isArray(res.body.stats.recentOrders));
  });

  await t.test('GET /api/admin/orders returns paginated list of all orders', async () => {
    const res = await makeRequest({
      port: testPort,
      path: '/api/admin/orders',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.orders));
    assert.ok(res.body.totalOrders >= 1);
    assert.equal(res.body.orders[0]._id, sampleOrder._id.toString());
  });

  await t.test('PUT /api/admin/orders/:id/status transitions order to Confirmed with admin note', async () => {
    const res = await makeRequest({
      port: testPort,
      path: `/api/admin/orders/${sampleOrder._id}/status`,
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
      body: {
        status: 'Confirmed',
        note: 'Kitchen accepted order for immediate prep',
      },
    });

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.order.orderStatus, 'Confirmed');
  });

  await t.test('GET /api/admin/foods lists all dishes for management', async () => {
    const res = await makeRequest({
      port: testPort,
      path: '/api/admin/foods',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.foods));
    assert.ok(res.body.foods.length >= 12);
  });

  await t.test('PUT /api/admin/foods/:id/toggle-stock toggles stock availability', async () => {
    const initialStatus = sampleFood.isAvailable;

    const res = await makeRequest({
      port: testPort,
      path: `/api/admin/foods/${sampleFood._id}/toggle-stock`,
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.isAvailable, !initialStatus);
  });

  await t.test('Cleanup: Delete test records and teardown server', async () => {
    await Order.deleteMany({ _id: sampleOrder._id });
    await User.deleteMany({ email: /@test-genie\.com$/ });
    await new Promise((resolve) => server.close(resolve));
    await mongoose.connection.close();
  });
});

