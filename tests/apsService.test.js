const { getStatus, getRegions, getAlerts, getStats } = require('../backend/services/apsService');

describe('apsService', () => {
  describe('getStatus()', () => {
    it('returns success with connected=true', async () => { const r = await getStatus(); expect(r.success).toBe(true); expect(r.data.connected).toBe(true); });
    it('includes required fields', async () => { const { data } = await getStatus(); expect(data).toHaveProperty('gridName'); expect(data).toHaveProperty('apiVersion'); expect(data).toHaveProperty('lastSync'); });
    it('lastSync is a valid ISO date', async () => { const { data } = await getStatus(); expect(() => new Date(data.lastSync).toISOString()).not.toThrow(); });
  });
  describe('getRegions()', () => {
    it('returns success with an array', async () => { const r = await getRegions(); expect(r.success).toBe(true); expect(Array.isArray(r.data)).toBe(true); });
    it('returns at least one region', async () => { const { data } = await getRegions(); expect(data.length).toBeGreaterThan(0); });
    it('count matches data length', async () => { const r = await getRegions(); expect(r.count).toBe(r.data.length); });
    it('each region has required fields', async () => { const { data } = await getRegions(); data.forEach(r => { expect(r).toHaveProperty('id'); expect(r).toHaveProperty('name'); expect(r).toHaveProperty('customers'); expect(r).toHaveProperty('loadPercent'); expect(r).toHaveProperty('status'); }); });
    it('loadPercent is between 0 and 100', async () => { const { data } = await getRegions(); data.forEach(r => { expect(r.loadPercent).toBeGreaterThanOrEqual(0); expect(r.loadPercent).toBeLessThanOrEqual(100); }); });
    it('status is a known value', async () => { const { data } = await getRegions(); data.forEach(r => { expect(['active','maintenance','offline']).toContain(r.status); }); });
  });
  describe('getAlerts()', () => {
    it('returns success with an array', async () => { const r = await getAlerts(); expect(r.success).toBe(true); expect(Array.isArray(r.data)).toBe(true); });
    it('each alert has required fields', async () => { const { data } = await getAlerts(); data.forEach(a => { expect(a).toHaveProperty('id'); expect(a).toHaveProperty('severity'); expect(a).toHaveProperty('message'); expect(a).toHaveProperty('timestamp'); }); });
    it('severity is warning or info', async () => { const { data } = await getAlerts(); data.forEach(a => { expect(['warning','info','critical']).toContain(a.severity); }); });
    it('timestamp is a valid ISO date', async () => { const { data } = await getAlerts(); data.forEach(a => { expect(() => new Date(a.timestamp).toISOString()).not.toThrow(); }); });
  });
  describe('getStats()', () => {
    it('returns success', async () => { const r = await getStats(); expect(r.success).toBe(true); });
    it('has all KPI fields', async () => { const { data } = await getStats(); ['totalCustomers','activeOutages','gridCapacityPercent','renewableMixPercent','totalRegions','totalSubstations'].forEach(f => expect(data).toHaveProperty(f)); });
    it('totalCustomers is a positive integer', async () => { const { data } = await getStats(); expect(data.totalCustomers).toBeGreaterThan(0); expect(Number.isInteger(data.totalCustomers)).toBe(true); });
    it('gridCapacityPercent is 0-100', async () => { const { data } = await getStats(); expect(data.gridCapacityPercent).toBeGreaterThanOrEqual(0); expect(data.gridCapacityPercent).toBeLessThanOrEqual(100); });
    it('renewableMixPercent is 0-100', async () => { const { data } = await getStats(); expect(data.renewableMixPercent).toBeGreaterThanOrEqual(0); expect(data.renewableMixPercent).toBeLessThanOrEqual(100); });
    it('activeOutages is a non-negative integer', async () => { const { data } = await getStats(); expect(data.activeOutages).toBeGreaterThanOrEqual(0); expect(Number.isInteger(data.activeOutages)).toBe(true); });
  });
});
// Made with Bob
