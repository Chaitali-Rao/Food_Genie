import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import mongoose from 'mongoose';
import app from '../server.js';
import { connectDB } from '../config/db.js';
import { seedDatabase } from '../utils/seedData.js';
import User from '../models/User.js';
import Food from '../models/Food.js';
import Category from '../models/Category.js';
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

test('Food Genie Catalog, Search & Filter Test Suite', async (t) => {
  let server;
  let testPort;
  let sampleFoodId;
  let sampleCategoryId;
  let adminToken;
  let customerToken;

  await t.test('Setup: Connect DB, seed catalog and start server', async () => {
    await connectDB();
    await seedDatabase(true);

    const testAdmin = await User.create({
      name: 'Chef Admin',
      email: `chef_${Date.now()}@test-genie.com`,
      password: 'password123',
      role: 'admin',
    });
    adminToken = generateToken(testAdmin._id, 'admin');

    const testCustomer = await User.create({
      name: 'Hungry Customer',
      email: `customer_${Date.now()}@test-genie.com`,
      password: 'password123',
      role: 'customer',
    });
    customerToken = generateToken(testCustomer._id, 'customer');

    await new Promise((resolve, reject) => {
      server = app.listen(0, '127.0.0.1', () => {
        testPort = server.address().port;
        resolve();
      });
      server.on('error', reject);
    });
    assert.ok(testPort > 0);
  });

  await t.test('GET /api/foods/categories returns active categories with itemCount', async () => {
    const res = await makeRequest({
      port: testPort,
      path: '/api/foods/categories',
    });

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.categories));
    assert.ok(res.body.categories.length >= 5);
    assert.ok(typeof res.body.categories[0].itemCount === 'number');

    sampleCategoryId = res.body.categories[0]._id;
  });

  await t.test('GET /api/foods returns paginated catalog', async () => {
    const res = await makeRequest({
      port: testPort,
      path: '/api/foods?page=1&limit=6',
    });

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.foods.length, 6);
    assert.ok(res.body.totalCount > 6);
    assert.ok(res.body.totalPages >= 2);

    sampleFoodId = res.body.foods[0]._id;
  });

  await t.test('GET /api/foods with search query matches keyword', async () => {
    const res = await makeRequest({
      port: testPort,
      path: '/api/foods?search=biryani',
    });

    assert.equal(res.statusCode, 200);
    assert.ok(res.body.foods.length > 0);
    res.body.foods.forEach((f) => {
      const match =
        f.name.toLowerCase().includes('biryani') ||
        f.description.toLowerCase().includes('biryani');
      assert.ok(match, `Dish ${f.name} should contain 'biryani' in name or description`);
    });
  });

  await t.test('GET /api/foods with dietary filter isVeg=true', async () => {
    const res = await makeRequest({
      port: testPort,
      path: '/api/foods?isVeg=true',
    });

    assert.equal(res.statusCode, 200);
    assert.ok(res.body.foods.length > 0);
    res.body.foods.forEach((f) => {
      assert.equal(f.isVeg, true, 'All returned items must be vegetarian');
    });
  });

  await t.test('GET /api/foods with dietary filter isVeg=false', async () => {
    const res = await makeRequest({
      port: testPort,
      path: '/api/foods?isVeg=false',
    });

    assert.equal(res.statusCode, 200);
    assert.ok(res.body.foods.length > 0);
    res.body.foods.forEach((f) => {
      assert.equal(f.isVeg, false, 'All returned items must be non-vegetarian');
    });
  });

  await t.test('GET /api/foods with sort=price-asc sorts prices ascending', async () => {
    const res = await makeRequest({
      port: testPort,
      path: '/api/foods?sort=price-asc',
    });

    assert.equal(res.statusCode, 200);
    for (let i = 1; i < res.body.foods.length; i++) {
      assert.ok(
        res.body.foods[i].price >= res.body.foods[i - 1].price,
        'Prices must be sorted in ascending order'
      );
    }
  });

  await t.test('GET /api/foods/:id returns item with populated category details', async () => {
    const res = await makeRequest({
      port: testPort,
      path: `/api/foods/${sampleFoodId}`,
    });

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.food._id, sampleFoodId);
    assert.ok(res.body.food.category.name, 'Category should be populated');
  });

  await t.test('GET /api/foods/invalid-id returns 400 Bad Request', async () => {
    const res = await makeRequest({
      port: testPort,
      path: '/api/foods/not-a-valid-id-123',
    });

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /invalid food item/i);
  });

  await t.test('POST /api/foods rejects customer creation with 403 Forbidden', async () => {
    const res = await makeRequest({
      port: testPort,
      path: '/api/foods',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${customerToken}`,
      },
      body: {
        name: 'Unauthorized Burger',
        description: 'Should not be allowed',
        price: 199,
        category: sampleCategoryId,
        image: 'https://example.com/burger.jpg',
      },
    });

    assert.equal(res.statusCode, 403);
    assert.equal(res.body.success, false);
  });

  await t.test('POST /api/foods allows admin creation with 201 Created', async () => {
    const res = await makeRequest({
      port: testPort,
      path: '/api/foods',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
      body: {
        name: 'Royal Kashmiri Rogan Josh',
        description: 'Slow braised lamb shank in Kashmiri red chili and fennel gravy.',
        price: 499,
        category: sampleCategoryId,
        image: 'https://images.unsplash.com/photo-1545247181-516773cae754?w=800',
        isVeg: false,
        spicyLevel: 2,
        prepTimeMinutes: 30,
      },
    });

    assert.equal(res.statusCode, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.food.name, 'Royal Kashmiri Rogan Josh');
  });

  await t.test('Teardown test server and cleanup', async () => {
    await User.deleteMany({ email: /@test-genie\.com$/ });
    await new Promise((resolve) => server.close(resolve));
    await mongoose.connection.close();
  });
});

