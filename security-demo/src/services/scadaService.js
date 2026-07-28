/**
 * scadaService.js — APS SCADA feed stub
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ⚠️  BOB GOVERNANCE VIOLATION — SEC-001
 * Rule     : No Hardcoded Credentials
 * Severity : CRITICAL
 * Action   : BLOCK
 *
 * The line below embeds a fake APS SCADA API key directly in source code.
 * Bob's rules.xml SEC-001 pattern fires on: api[_-]?key\s*=\s*["'][^"']+["']
 *
 * Fix: remove the hardcoded value and load from environment instead:
 *   const SCADA_API_KEY = process.env.SCADA_API_KEY;
 * ─────────────────────────────────────────────────────────────────────────────
 */

const SCADA_API_KEY = "APS-SCADA-k7mN3xQ9vR2pL8wT";   // ← SEC-001 fires here

/**
 * Returns a mock SCADA grid feed.
 * In a real system this would authenticate with SCADA_API_KEY against
 * the APS OT network — which is exactly why hardcoding it is critical severity.
 */
const getScadaFeed = async () => {
  // Simulate network latency
  await new Promise(r => setTimeout(r, 80));

  return {
    success: true,
    authenticated: true,           // would use SCADA_API_KEY in production
    gridFrequency: 59.98,          // Hz — nominal 60 Hz
    totalGenerationMW: 8420,
    transmissionLoss: 2.3,         // %
    substationsOnline: 68,
    substationsTotal: 70,
    timestamp: new Date().toISOString()
  };
};

module.exports = { getScadaFeed };
