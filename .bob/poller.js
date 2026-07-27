#!/usr/bin/env node
/**
 * Bob GitHub Issue Poller — APS Demo
 * Polls every 5 min for issues labeled bob, ai-task, enhancement, bug.
 * Usage: node .bob/poller.js  OR  npm run poll
 */
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config    = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));
const mcpConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'mcp.json'),    'utf8'));

const TOKEN         = mcpConfig.mcpServers.github.env.GITHUB_PERSONAL_ACCESS_TOKEN;
const REPO          = config.github.polling.repository;
const INTERVAL      = config.github.polling.interval;
const TARGET_LABELS = config.github.polling.labels;
const IGNORE_LABELS = config.github.polling.ignoreLabels;
const LOG_FILE      = path.join(__dirname, 'polling.log');

if (!TOKEN || TOKEN.startsWith('ghp_your')) { console.error('❌ Set GITHUB_PERSONAL_ACCESS_TOKEN in .bob/mcp.json'); process.exit(1); }

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + '\n');
}

function ghGet(urlPath) {
  return new Promise((resolve, reject) => {
    const req = https.request({ hostname: 'api.github.com', path: urlPath, method: 'GET',
      headers: { 'User-Agent': 'Bob-APS-Poller', 'Authorization': `token ${TOKEN}`, 'Accept': 'application/vnd.github.v3+json' }
    }, res => {
      let body = ''; res.on('data', c => body += c);
      res.on('end', () => res.statusCode === 200 ? resolve(JSON.parse(body)) : reject(new Error(`${res.statusCode}: ${body}`)));
    });
    req.on('error', reject); req.end();
  });
}

async function poll() {
  try {
    log(`🔍 Polling ${REPO} | Labels: ${TARGET_LABELS.join(', ')}`);
    const issues = await ghGet(`/repos/${REPO}/issues?state=open&per_page=100`);
    const forBob = issues.filter(i => {
      const l = i.labels.map(x => x.name);
      return !IGNORE_LABELS.some(x => l.includes(x)) && TARGET_LABELS.some(x => l.includes(x));
    });
    log(`   ${issues.length} open issues, ${forBob.length} for Bob`);
    if (forBob.length === 0) { log('✅ Nothing pending'); }
    else {
      forBob.forEach(i => log(`   🎯 #${i.number}: ${i.title}  → ${i.html_url}`));
      log('💡 Tell Bob: "Work on GitHub issue #N"');
    }
    const rl = await ghGet('/rate_limit');
    log(`📊 Rate limit: ${rl.rate.remaining} remaining`);
    log('─'.repeat(80));
  } catch (e) { log(`❌ ${e.message}`); log('─'.repeat(80)); }
}

async function start() {
  log('⚡ Bob APS Poller Started');
  log(`   Repo: ${REPO} | Interval: ${INTERVAL / 60000} min`);
  log('═'.repeat(80));
  await poll();
  setInterval(poll, INTERVAL);
  log('✅ Polling active. Ctrl+C to stop.\n');
}

process.on('SIGINT',  () => { log('\n🛑 Stopped'); process.exit(0); });
process.on('SIGTERM', () => { log('\n🛑 Stopped'); process.exit(0); });
start().catch(e => { log(`❌ Fatal: ${e.message}`); process.exit(1); });
// Made with Bob
