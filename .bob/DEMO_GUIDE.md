# Bob Integration Demo Guide — APS

## What's Wired Up

| File | Description |
|---|---|
| `.bob/poller.js` | Polls GitHub every 5 min for `bob`/`ai-task`/`enhancement`/`bug` issues |
| `.bob/auto-executor.js` | Checks out Bob's PRs, runs tests, optional auto-merge |
| `.bob/rules.xml` | APS governance rules Bob enforces automatically |
| `.github/workflows/ci.yml` | CI on Node 18 & 20 for every push/PR |
| `.github/workflows/bob-notifier.yml` | Auto-comments on Bob-labeled issues |

## Demo Steps

1. `./start-demo.sh` → http://localhost:5174
2. Show `.bob/rules.xml` — try: *"Add a hardcoded password"* (Bob blocks it)
3. `npm run poll` → live GitHub polling
4. Create issue with label `bob` → show auto-detection
5. Tell Bob: *"Work on GitHub issue #N"* → branch + PR
6. Show CI firing on the PR

## Key Commands
```bash
./start-demo.sh
npm run poll
npm test
CLIENT_NAME="Arizona Public Service" node backend/server.js
```

## Setup
- [ ] Copy `.bob/mcp.json.example` → `.bob/mcp.json`, add token
- [ ] Confirm repo = `mohamedarif-m/bob-aps-demo` in `.bob/config.json`
- [ ] `npm test` — 19/19 green

*Made with Bob AI Developer*
