#!/usr/bin/env node
/**
 * Bob Auto-Executor — APS Demo
 * Polls GitHub for Bob's open PRs, runs tests, optionally auto-merges.
 * Usage: node .bob/auto-executor.js  OR  npm run auto-executor
 */
const https    = require('https');
const { exec } = require('child_process');
const fs       = require('fs');
const path     = require('path');
const util     = require('util');
const execAsync = util.promisify(exec);

const config    = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));
const mcpConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'mcp.json'),    'utf8'));

const TOKEN      = mcpConfig.mcpServers.github.env.GITHUB_PERSONAL_ACCESS_TOKEN;
const REPO       = config.github.polling.repository;
const INTERVAL   = config.github.polling.interval;
const AUTO_MERGE = config.github.workflow.autoMerge  || false;
const RUN_TESTS  = config.github.workflow.runTests   !== false;
const LOG_FILE   = path.join(__dirname, 'auto-executor.log');

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line); fs.appendFileSync(LOG_FILE, line + '\n');
}

function ghReq(urlPath, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const req = https.request({ hostname: 'api.github.com', path: urlPath, method,
      headers: { 'User-Agent': 'Bob-APS-AutoExecutor', 'Authorization': `token ${TOKEN}`,
        'Accept': 'application/vnd.github.v3+json', 'Content-Type': 'application/json' }
    }, res => {
      let data = ''; res.on('data', c => data += c);
      res.on('end', () => res.statusCode >= 200 && res.statusCode < 300
        ? resolve(data ? JSON.parse(data) : {})
        : reject(new Error(`${res.statusCode}: ${data}`)));
    });
    req.on('error', reject); if (body) req.write(JSON.stringify(body)); req.end();
  });
}

async function run(cmd, label) {
  log(`   🔧 ${label}…`);
  try { const { stdout, stderr } = await execAsync(cmd); if (stdout.trim()) log(`      ✓ ${stdout.trim()}`); return { ok: true, stdout }; }
  catch (e) { log(`      ✗ ${e.message}`); return { ok: false, error: e.message }; }
}

async function processPR(pr) {
  log(`\n🔄 PR #${pr.number}: ${pr.title}`);
  await run('git fetch origin', 'Fetch');
  const co = await run(`git checkout ${pr.head.ref}`, `Checkout ${pr.head.ref}`);
  if (!co.ok) await run(`git checkout -b ${pr.head.ref} origin/${pr.head.ref}`, 'Create branch');
  await run(`git pull origin ${pr.head.ref}`, 'Pull'); await run('npm install', 'Install deps');
  let passed = true;
  if (RUN_TESTS) {
    const t = await run('npm test', 'npm test'); passed = t.ok;
    if (!passed) {
      await ghReq(`/repos/${REPO}/issues/${pr.number}/comments`, 'POST', { body: `❌ **Bob Auto-Executor**\nTests failed on \`${pr.head.ref}\`\n\`\`\`\n${t.error}\n\`\`\`` });
      return { ok: false };
    }
  }
  if (AUTO_MERGE && passed) {
    await ghReq(`/repos/${REPO}/pulls/${pr.number}/merge`, 'PUT', { commit_title: `Merge PR #${pr.number}`, merge_method: 'squash' });
    await run('git checkout main', 'Back to main'); await run('git pull origin main', 'Update main');
    await run(`git branch -D ${pr.head.ref}`, 'Cleanup'); return { ok: true, merged: true };
  }
  await ghReq(`/repos/${REPO}/issues/${pr.number}/comments`, 'POST',
    { body: `✅ **Bob Auto-Executor**\nBranch \`${pr.head.ref}\` — all tests pass.\n_Auto-merge is disabled. Please merge manually._` });
  return { ok: true, merged: false };
}

async function cycle() {
  log('\n🔍 Checking for Bob PRs…');
  try {
    const prs = await ghReq(`/repos/${REPO}/pulls?state=open&per_page=100`);
    const bobPRs = prs.filter(p => p.title.startsWith('[Bob]') || p.head.ref.startsWith('bob/'));
    log(`   ${prs.length} open PRs, ${bobPRs.length} from Bob`);
    if (bobPRs.length === 0) { log('   ✅ No Bob PRs to process'); }
    else { for (const pr of bobPRs) { const r = await processPR(pr); log(r.ok ? `   ✅ PR #${pr.number} — ${r.merged ? 'merged' : 'processed'}` : `   ❌ PR #${pr.number} failed`); } }
  } catch (e) { log(`❌ ${e.message}`); }
  log('─'.repeat(80));
}

async function start() {
  log('⚡ Bob APS Auto-Executor Started');
  log(`   Repo: ${REPO} | Auto-merge: ${AUTO_MERGE} | Tests: ${RUN_TESTS}`);
  log('═'.repeat(80));
  await cycle(); setInterval(cycle, INTERVAL);
  log('✅ Active. Ctrl+C to stop.\n');
}

process.on('SIGINT',  () => { log('\n🛑 Stopped'); process.exit(0); });
process.on('SIGTERM', () => { log('\n🛑 Stopped'); process.exit(0); });
start().catch(e => { log(`❌ Fatal: ${e.message}`); process.exit(1); });
// Made with Bob
