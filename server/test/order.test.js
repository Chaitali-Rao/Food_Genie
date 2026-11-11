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

test('Food Genie Orders & Status Tracking Test Suite', async (t) => {
  let server;
  let testPort;
  let customerToken;
  let customerUser;
  let otherCustomerToken;
  let adminToken;
  let sampleFood;
  let createdOrderId;

  await t.test('Setup: Connect DB, seed food and prepare test accounts', async () => {
    await connectDB();
    await seedDatabase(true);

    customerUser = await User.create({
      name: 'Order Test Customer',
      email: `ordertest_${Date.now()}@test-genie.com`,
      password: 'password123',
      role: 'customer',
      phone: '9876543210',
    });
    customerToken = generateToken(customerUser._id, 'customer');

    const otherUser = await User.create({
      name: 'Other Customer',
      email: `other_${Date.now()}@test-genie.com`,
      password: 'password123',
      role: 'customer',
    });
    otherCustomerToken = generateToken(otherUser._id, 'customer');

    const adminUser = await User.create({
      name: 'Order Admin',
      email: `adminorder_${Date.now()}@test-genie.com`,
      password: 'password123',
      role: 'admin',
    });
    adminToken = generateToken(adminUser._id, 'admin');

    sampleFood = await Food.findOne();
    assert.ok(sampleFood, 'Sample food item must exist');

    await new Promise((resolve, reject) => {
      server = app.listen(0, '127.0.0.1', () => {
        testPort = server.address().port;
        resolve();
      });
      server.on('error', reject);
    });
    assert.ok(testPort > 0);
  });

  await t.test('POST /api/orders rejects unauthenticated request (401 Unauthorized)', async () => {
    const res = await makeRequest({
      port: testPort,
      path: '/api/orders',
      method: 'POST',
      body: { orderItems: [] },
    });

    assert.equal(res.statusCode, 401);
    assert.equal(res.body.success, false);
  });

  await t.test('POST /api/orders rejects empty items array (400 Bad Request)', async () => {
    const res = await makeRequest({
      port: testPort,
      path: '/api/orders',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${customerToken}`,
      },
      body: {
        orderItems: [],
        shippingAddress: {
          street: '123 MG Road',
          city: 'Bangalore',
          state: 'Karnataka',
          zipCode: '560001',
        },
        phone: '9876543210',
      },
    });

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /cannot be placed without any food items/i);
  });

  await t.test('POST /api/orders creates order with price calculation and Placed status', async () => {
    const res = await makeRequest({
      port: testPort,
      path: '/api/orders',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${customerToken}`,
      },
      body: {
        orderItems: [
          {
            food: sampleFood._id,
            quantity: 2,
          },
        ],
        shippingAddress: {
          street: '42 Brigade Towers',
          city: 'Bangalore',
          state: 'Karnataka',
          zipCode: '560025',
        },
        phone: '9876543210',
        paymentMethod: 'COD',
      },
    });

    assert.equal(res.statusCode, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.order._id);
    assert.equal(res.body.order.orderStatus, 'Placed');
    assert.equal(res.body.order.itemsPrice, sampleFood.price * 2);
    assert.ok(res.body.order.totalPrice > 0);
    assert.equal(res.body.order.statusHistory.length, 1);
    assert.equal(res.body.order.statusHistory[0].status, 'Placed');

    createdOrderId = res.body.order._id;
  });

  await t.test('GET /api/orders/myorders retrieves placed orders for authenticated user', async () => {
    const res = await makeRequest({
      port: testPort,
      path: '/api/orders/myorders',
      headers: {
        Authorization: `Bearer ${customerToken}`,
      },
    });

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.orders));
    assert.ok(res.body.orders.length >= 1);
    assert.equal(res.body.orders[0]._id, createdOrderId);
  });

  await t.test('GET /api/orders/:id returns order details with statusHistory', async () => {
    const res = await makeRequest({
      port: testPort,
      path: `/api/orders/${createdOrderId}`,
      headers: {
        Authorization: `Bearer ${customerToken}`,
      },
    });

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.order._id, createdOrderId);
    assert.ok(res.body.order.user.name);
    assert.ok(res.body.order.statusHistory.length >= 1);
  });

  await t.test('GET /api/orders/:id blocks access to another customer (403 Forbidden)', async () => {
    const res = await makeRequest({
      port: testPort,
      path: `/api/orders/${createdOrderId}`,
      headers: {
        Authorization: `Bearer ${otherCustomerToken}`,
      },
    });

    assert.equal(res.statusCode, 403);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /do not have permission/i);
  });

  await t.test('PUT /api/orders/:id/simulate-step advances order status to Confirmed', async () => {
    const res = await makeRequest({
      port: testPort,
      path: `/api/orders/${createdOrderId}/simulate-step`,
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${customerToken}`,
      },
    });

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.order.orderStatus, 'Confirmed');
    assert.equal(res.body.order.statusHistory.length, 2);
    assert.equal(res.body.order.statusHistory[1].status, 'Confirmed');
  });

  await t.test('PUT /api/orders/:id/status allows Admin to set status to Delivered', async () => {
    const res = await makeRequest({
      port: testPort,
      path: `/api/orders/${createdOrderId}/status`,
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
      body: {
        status: 'Delivered',
        note: 'Delivered by Genie rider with photo confirmation',
      },
    });

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.order.orderStatus, 'Delivered');
    assert.equal(res.body.order.isPaid, true);
    assert.ok(res.body.order.deliveredAt);
  });

  await t.test('PUT /api/orders/:id/cancel rejects cancellation of already Delivered order (400 Bad Request)', async () => {
    const res = await makeRequest({
      port: testPort,
      path: `/api/orders/${createdOrderId}/cancel`,
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${customerToken}`,
      },
      body: {
        reason: 'Too late to cancel',
      },
    });

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /delivered orders cannot be cancelled/i);
  });

  let cancellableOrderId;

  await t.test('Setup cancellable order: Customer creates a new Placed order', async () => {
    const res = await makeRequest({
      port: testPort,
      path: '/api/orders',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${customerToken}`,
      },
      body: {
        orderItems: [{ food: sampleFood._id, quantity: 1 }],
        shippingAddress: {
          street: '456 Indiranagar',
          city: 'Bangalore',
          state: 'Karnataka',
          zipCode: '560038',
        },
        phone: '9876543210',
        paymentMethod: 'UPI',
      },
    });

    assert.equal(res.statusCode, 201);
    assert.equal(res.body.success, true);
    cancellableOrderId = res.body.order._id;
    assert.equal(res.body.order.orderStatus, 'Placed');
    assert.equal(res.body.order.isPaid, true);
  });

  await t.test('PUT /api/orders/:id/cancel rejects other customer from cancelling (403 Forbidden)', async () => {
    const res = await makeRequest({
      port: testPort,
      path: `/api/orders/${cancellableOrderId}/cancel`,
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${otherCustomerToken}`,
      },
      body: {
        reason: 'Unauthorized cancel attempt',
      },
    });

    assert.equal(res.statusCode, 403);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /access forbidden/i);
  });

  await t.test('PUT /api/orders/:id/cancel allows owner to cancel order with reason and refund note', async () => {
    const res = await makeRequest({
      port: testPort,
      path: `/api/orders/${cancellableOrderId}/cancel`,
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${customerToken}`,
      },
      body: {
        reason: 'Ordered by mistake',
      },
    });

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.order.orderStatus, 'Cancelled');
    assert.equal(res.body.order.cancellationReason, 'Ordered by mistake');
    assert.ok(res.body.order.cancelledAt);

    // Verify status history contains cancellation entry and refund note
    const lastHistory = res.body.order.statusHistory[res.body.order.statusHistory.length - 1];
    assert.equal(lastHistory.status, 'Cancelled');
    assert.match(lastHistory.note, /refund/i);
  });

  await t.test('PUT /api/orders/:id/cancel rejects cancelling an already cancelled order (400 Bad Request)', async () => {
    const res = await makeRequest({
      port: testPort,
      path: `/api/orders/${cancellableOrderId}/cancel`,
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${customerToken}`,
      },
      body: {
        reason: 'Trying to cancel again',
      },
    });

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /already cancelled/i);
  });

  await t.test('PUT /api/orders/:id/simulate-step rejects advancing a cancelled order (400 Bad Request)', async () => {
    const res = await makeRequest({
      port: testPort,
      path: `/api/orders/${cancellableOrderId}/simulate-step`,
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${customerToken}`,
      },
    });

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /cannot advance progress for a cancelled order/i);
  });

  await t.test('Cleanup: Delete test orders and accounts and teardown server', async () => {
    await Order.deleteMany({ user: { $in: [customerUser._id] } });
    await User.deleteMany({ email: /@test-genie\.com$/ });
    await new Promise((resolve) => server.close(resolve));
    await mongoose.connection.close();
  });
});

