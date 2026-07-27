# APS Grid Operations Dashboard

> **Demo built with Bob AI Developer**

A single-screen operations dashboard for **Arizona Public Service (APS)** — Arizona's largest electric utility, serving nearly 1.2 million customers.

---

## What It Shows

| Section | Description |
|---|---|
| **KPI Cards** | Total customers, active outages, grid capacity %, renewable mix % |
| **Service Regions** | Phoenix Metro, East Valley, Flagstaff, Yuma — load bar + status |
| **Recent Alerts** | Live-style mock alert feed |

---

## Quick Start

```bash
npm install
cd frontend && npm install && cd ..
cp .env.example .env
./start-demo.sh
# Backend  → http://localhost:3001
# Frontend → http://localhost:5174
```

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3001` | Backend server port |
| `CLIENT_NAME` | `APS` | Display name — change to rebrand without code changes |
| `VITE_CLIENT_NAME` | `APS` | Build-time fallback |
| `VITE_API_URL` | `http://localhost:3001` | Backend base URL |

```bash
# Rebrand at runtime — no code changes
CLIENT_NAME="Arizona Public Service" node backend/server.js
```

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/config` | Returns `{ clientName }` from env |
| `GET` | `/api/aps/status` | Grid connection status |
| `GET` | `/api/aps/stats` | KPI summary |
| `GET` | `/api/aps/regions` | Service regions with load data |
| `GET` | `/api/aps/alerts` | Recent system alerts |
| `GET` | `/health` | Health check |

---

## Bob Integration

| File | Description |
|---|---|
| `.bob/poller.js` | Polls GitHub every 5 min for `bob`/`ai-task`/`enhancement`/`bug` issues |
| `.bob/auto-executor.js` | Checks out Bob's PRs, runs tests, optional auto-merge |
| `.bob/rules.xml` | APS governance rules Bob enforces automatically |
| `.github/workflows/ci.yml` | CI on Node 18 & 20 for every push/PR |
| `.github/workflows/bob-notifier.yml` | Auto-comments on Bob-labeled issues |

See `.bob/DEMO_GUIDE.md` for the full walkthrough.

---

## Tech Stack

- **Backend**: Node.js + Express.js
- **Frontend**: React 18 + Vite
- **Tests**: Jest — 19 unit tests, 100% coverage
- **Styling**: APS brand colors (#E87722 orange, #003087 blue)

---

*Made with Bob AI Developer*
