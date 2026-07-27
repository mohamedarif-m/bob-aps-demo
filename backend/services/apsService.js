/**
 * APS Service — Mock data and business logic
 * Arizona Public Service: ~1.2 million customers across Arizona
 */

const mockRegions = [
  { id: 'region-phx',  name: 'Phoenix Metro', customers: 680000, loadPercent: 87, status: 'active',      activeOutages: 1, substations: 42 },
  { id: 'region-ev',   name: 'East Valley',   customers: 210000, loadPercent: 72, status: 'active',      activeOutages: 0, substations: 14 },
  { id: 'region-flag', name: 'Flagstaff',     customers:  95000, loadPercent: 61, status: 'maintenance', activeOutages: 0, substations:  8 },
  { id: 'region-yuma', name: 'Yuma',          customers:  85000, loadPercent: 78, status: 'active',      activeOutages: 0, substations:  6 }
];

const mockAlerts = [
  { id: 'alert-001', severity: 'warning', message: 'High load detected in Phoenix Metro (87% capacity)',          region: 'Phoenix Metro', timestamp: new Date(Date.now() - 12 * 60000).toISOString() },
  { id: 'alert-002', severity: 'info',    message: 'Scheduled maintenance: Flagstaff Substation 2A (11 PM – 3 AM)', region: 'Flagstaff',     timestamp: new Date(Date.now() - 45 * 60000).toISOString() },
  { id: 'alert-003', severity: 'info',    message: 'Renewable generation at 34% — above daily target of 28%',       region: 'Statewide',     timestamp: new Date(Date.now() - 90 * 60000).toISOString() },
  { id: 'alert-004', severity: 'warning', message: 'Active outage: ~1,240 customers affected in East Mesa (ETA: 45 min)', region: 'Phoenix Metro', timestamp: new Date(Date.now() - 18 * 60000).toISOString() }
];

const getStatus  = async () => { await new Promise(r => setTimeout(r, 80));  return { success: true, data: { connected: true, gridName: 'APS Transmission Network', apiVersion: 'v2.1.0', lastSync: new Date().toISOString() } }; };
const getRegions = async () => { await new Promise(r => setTimeout(r, 150)); return { success: true, data: mockRegions, count: mockRegions.length }; };
const getAlerts  = async () => { await new Promise(r => setTimeout(r, 100)); return { success: true, data: mockAlerts,  count: mockAlerts.length  }; };
const getStats   = async () => {
  await new Promise(r => setTimeout(r, 120));
  const totalCustomers = mockRegions.reduce((s, r) => s + r.customers, 0);
  const activeOutages  = mockRegions.reduce((s, r) => s + r.activeOutages, 0);
  const avgLoad        = Math.round(mockRegions.reduce((s, r) => s + r.loadPercent, 0) / mockRegions.length);
  return { success: true, data: { totalCustomers, activeOutages, gridCapacityPercent: avgLoad, renewableMixPercent: 34, totalRegions: mockRegions.length, totalSubstations: mockRegions.reduce((s, r) => s + r.substations, 0) } };
};

module.exports = { getStatus, getRegions, getAlerts, getStats };
// Made with Bob
