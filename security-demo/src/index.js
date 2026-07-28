/**
 * APS Security Demo — Express API
 *
 * This is a minimal Express server used as the backdrop for the
 * CVE analysis + shift-left security demo.
 *
 * It deliberately pins semver@7.3.4 (CVE-2022-25883 — ReDoS, HIGH)
 * so that `npm audit` surfaces a real vulnerability to fix live.
 */

require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const semver  = require('semver');

const app  = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Version checker — uses semver (the vulnerable dep) so the CVE is "real"
app.get('/api/version-check', (req, res) => {
  const { version, range } = req.query;
  if (!version || !range) {
    return res.status(400).json({ error: 'Pass ?version=x.y.z&range=^x.y.z' });
  }
  // semver.satisfies() uses the vulnerable regex path in 7.3.4
  const satisfies = semver.satisfies(version, range);
  res.json({ version, range, satisfies, semverVersion: semver.SEMVER_SPEC_VERSION });
});

// SCADA feed stub — intentionally has a hardcoded credential (SEC-001 violation)
// Bob governance rule fires when this file is read: see src/services/scadaService.js
app.get('/api/scada/feed', async (req, res) => {
  try {
    const { getScadaFeed } = require('./services/scadaService');
    res.json(await getScadaFeed());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`⚡ APS Security Demo API on port ${PORT}`);
  });
}

module.exports = app;
