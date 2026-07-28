/**
 * APS Security Demo — Unit Tests
 *
 * Covers the same service-layer pattern as the main aps-demo.
 * All tests pass even with the vulnerable semver pinned —
 * the CVE is in the dep, not in the test logic.
 */

const request = require('supertest');
const app     = require('../src/index');

describe('Health endpoint', () => {
  it('GET /health returns 200 and status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('includes a valid ISO timestamp', async () => {
    const res = await request(app).get('/health');
    expect(() => new Date(res.body.timestamp).toISOString()).not.toThrow();
  });
});

describe('Version-check endpoint', () => {
  it('returns 400 when version/range missing', async () => {
    const res = await request(app).get('/api/version-check');
    expect(res.status).toBe(400);
  });

  it('correctly resolves a satisfied range', async () => {
    const res = await request(app).get('/api/version-check?version=1.2.3&range=^1.0.0');
    expect(res.status).toBe(200);
    expect(res.body.satisfies).toBe(true);
  });

  it('correctly resolves an unsatisfied range', async () => {
    const res = await request(app).get('/api/version-check?version=2.0.0&range=^1.0.0');
    expect(res.status).toBe(200);
    expect(res.body.satisfies).toBe(false);
  });
});

describe('SCADA feed endpoint', () => {
  it('GET /api/scada/feed returns 200', async () => {
    const res = await request(app).get('/api/scada/feed');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns expected grid fields', async () => {
    const res = await request(app).get('/api/scada/feed');
    const { body } = res;
    expect(body).toHaveProperty('gridFrequency');
    expect(body).toHaveProperty('totalGenerationMW');
    expect(body).toHaveProperty('substationsOnline');
    expect(body).toHaveProperty('substationsTotal');
    expect(body).toHaveProperty('timestamp');
  });

  it('substationsOnline <= substationsTotal', async () => {
    const res = await request(app).get('/api/scada/feed');
    expect(res.body.substationsOnline).toBeLessThanOrEqual(res.body.substationsTotal);
  });

  it('gridFrequency is within nominal range (58–62 Hz)', async () => {
    const res = await request(app).get('/api/scada/feed');
    expect(res.body.gridFrequency).toBeGreaterThanOrEqual(58);
    expect(res.body.gridFrequency).toBeLessThanOrEqual(62);
  });
});
