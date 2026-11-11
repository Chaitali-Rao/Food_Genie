import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import aiRoutes from '../routes/aiRoutes.js';
import { connectDB } from '../config/db.js';
import { seedDatabase } from '../utils/seedData.js';
import Food from '../models/Food.js';

dotenv.config();

test('Food Genie AI Recommendation Chatbot Test Suite', async (t) => {
  let app;
  let server;
  let baseUrl;

  await t.test('Setup: Connect DB, seed catalog and start test server', async () => {
    await connectDB();
    await seedDatabase();

    app = express();
    app.use(express.json());
    app.use('/api/ai', aiRoutes);

    await new Promise((resolve) => {
      server = http.createServer(app);
      server.listen(0, '127.0.0.1', () => {
        const address = server.address();
        baseUrl = `http://127.0.0.1:${address.port}`;
        resolve();
      });
    });

    assert.ok(baseUrl.startsWith('http://127.0.0.1:'), 'Test server active on ephemeral port');
  });

  await t.test('GET /api/ai/suggestions returns inspiration prompts', async () => {
    const res = await fetch(`${baseUrl}/api/ai/suggestions`);
    assert.equal(res.status, 200);

    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.suggestions), 'Suggestions should be an array');
    assert.ok(body.suggestions.length >= 4, 'Should provide at least 4 prompt suggestions');
    assert.ok(body.suggestions[0].label, 'Suggestion has a label');
    assert.ok(body.suggestions[0].query, 'Suggestion has a query');
  });

  await t.test('POST /api/ai/chat rejects missing message with 400 Bad Request', async () => {
    const res = await fetch(`${baseUrl}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '' }),
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.ok(body.message.includes('query'));
  });

  await t.test('POST /api/ai/chat handles conversational greetings ("hi") intelligently', async () => {
    const res = await fetch(`${baseUrl}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'hi' }),
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.reply.includes('Hello there') || body.reply.includes('Greetings'), 'Greeting response returned');
    assert.ok(Array.isArray(body.recommendations), 'Returns varied showcase dishes');
    assert.ok(Array.isArray(body.suggestedActions), 'Returns quick prompt actions');
  });

  await t.test('POST /api/ai/chat returns pure veg dishes when pure veg is requested', async () => {
    const res = await fetch(`${baseUrl}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'I want a pure veg pizza or healthy salad',
      }),
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.reply.length > 0, 'Genie speech generated');
    assert.ok(Array.isArray(body.recommendations), 'Recommendations is array');
    assert.ok(body.recommendations.length > 0, 'Found matching dishes');

    // All recommended dishes should be veg
    body.recommendations.forEach((dish) => {
      assert.equal(dish.isVeg, true, `Expected veg dish, got ${dish.name}`);
    });
  });

  await t.test('POST /api/ai/chat returns non-veg dishes when chicken or meat is requested', async () => {
    const res = await fetch(`${baseUrl}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Looking for rich chicken biryani or crispy burger',
      }),
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.recommendations.length > 0, 'Found recommendations');

    // At least one recommended dish should be non-veg
    const hasNonVeg = body.recommendations.some((dish) => dish.isVeg === false);
    assert.ok(hasNonVeg, 'Should recommend non-veg options for chicken craving');
  });

  await t.test('POST /api/ai/chat respects budget ceiling constraints', async () => {
    const res = await fetch(`${baseUrl}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Show me something delicious under ₹350',
      }),
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.recommendations.length > 0, 'Found dishes within budget');

    body.recommendations.forEach((dish) => {
      assert.ok(dish.price <= 350, `Dish ${dish.name} price ₹${dish.price} should be <= 350`);
    });
  });

  await t.test('POST /api/ai/chat identifies spice level preferences', async () => {
    const res = await fetch(`${baseUrl}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'I want extra spicy fiery hot noodles',
      }),
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.recommendations.length > 0);
    assert.equal(body.contextParsed.spicyLevel, 3);
  });

  await t.test('POST /api/ai/pair returns complementary beverages or desserts for cart', async () => {
    // Find an existing pizza or burger in DB
    const mainDish = await Food.findOne({ isAvailable: true });

    const res = await fetch(`${baseUrl}/api/ai/pair`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cartItems: [
          {
            food: mainDish._id.toString(),
            name: mainDish.name,
            quantity: 1,
            price: mainDish.price,
          },
        ],
      }),
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.recommendations), 'Returns pairings array');
    assert.ok(body.recommendations.length > 0, 'Suggested pairing dishes');

    // Recommended pairings should NOT contain the dish already in cart
    const includesCartDish = body.recommendations.some(
      (d) => d._id === mainDish._id.toString()
    );
    assert.equal(includesCartDish, false, 'Pairings should be complementary new items');
  });

  await t.test('Teardown test server and cleanup', async () => {
    await new Promise((resolve) => server.close(resolve));
    await mongoose.connection.close();
    assert.equal(mongoose.connection.readyState, 0, 'DB disconnected cleanly');
  });
});

