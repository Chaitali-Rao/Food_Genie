import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import app from '../server.js';

test('Food Genie API - Health Check Endpoint Test', async (t) => {
  let server;
  let testPort;

  await t.test('Server starts on ephemeral test port', async () => {
    await new Promise((resolve, reject) => {
      server = app.listen(0, '127.0.0.1', () => {
        testPort = server.address().port;
        resolve();
      });
      server.on('error', reject);
    });
    assert.ok(testPort > 0, 'Server should listen on an assigned port');
  });

  await t.test('GET /api/health returns 200 with valid health payload', async () => {
    const response = await new Promise((resolve, reject) => {
      http.get(`http://127.0.0.1:${testPort}/api/health`, (res) => {
        let rawData = '';
        res.on('data', (chunk) => {
          rawData += chunk;
        });
        res.on('end', () => {
          try {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              body: JSON.parse(rawData),
            });
          } catch (err) {
            reject(new Error(`Failed to parse response: ${rawData} - ${err.message}`));
          }
        });
      }).on('error', reject);
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.success, true);
    assert.equal(response.body.service, 'Food Genie API');
    assert.equal(response.body.version, '1.0.0');
    assert.ok(['operational', 'degraded'].includes(response.body.status));
    assert.ok(response.body.database !== undefined);
    assert.ok(typeof response.body.database.readyState === 'number');
    assert.ok(response.body.uptimeSeconds >= 0);
  });

  await t.test('GET / returns 200 with API overview info', async () => {
    const response = await new Promise((resolve, reject) => {
      http.get(`http://127.0.0.1:${testPort}/`, (res) => {
        let rawData = '';
        res.on('data', (chunk) => {
          rawData += chunk;
        });
        res.on('end', () => {
          try {
            resolve({
              statusCode: res.statusCode,
              body: JSON.parse(rawData),
            });
          } catch (err) {
            reject(err);
          }
        });
      }).on('error', reject);
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.name, 'Food Genie Backend API');
  });

  await t.test('GET /api/nonexistent returns 404 error response', async () => {
    const response = await new Promise((resolve, reject) => {
      http.get(`http://127.0.0.1:${testPort}/api/nonexistent`, (res) => {
        let rawData = '';
        res.on('data', (chunk) => {
          rawData += chunk;
        });
        res.on('end', () => {
          try {
            resolve({
              statusCode: res.statusCode,
              body: JSON.parse(rawData),
            });
          } catch (err) {
            reject(err);
          }
        });
      }).on('error', reject);
    });

    assert.equal(response.statusCode, 404);
    assert.equal(response.body.success, false);
    assert.match(response.body.message, /Resource not found/);
  });

  // Cleanup
  await t.test('Teardown test server', async () => {
    await new Promise((resolve) => server.close(resolve));
  });
});
