#!/bin/bash
# APS Grid Operations Demo - Startup Script
echo "🚀 Starting APS Grid Operations Demo..."
GREEN='\033[0;32m'; BLUE='\033[0;34m'; YELLOW='\033[1;33m'; NC='\033[0m'
cleanup() { echo "🛑 Stopping..."; kill $(jobs -p) 2>/dev/null; exit 0; }
trap cleanup SIGINT SIGTERM
[ ! -d "node_modules" ] && npm install
[ ! -d "frontend/node_modules" ] && cd frontend && npm install && cd ..
echo "${BLUE}🔧 Starting Backend (port 3001)...${NC}"
node backend/server.js > backend.log 2>&1 & BACKEND_PID=$!
sleep 2
echo "${BLUE}🎨 Starting Frontend (port 5174)...${NC}"
cd frontend && npm run dev > ../frontend.log 2>&1 & FRONTEND_PID=$!; cd ..
sleep 3
echo "${GREEN}✅ APS Demo running!${NC}"
echo "   Backend:  http://localhost:3001"
echo "   Frontend: http://localhost:5174"
echo "🌐 Open: ${BLUE}http://localhost:5174${NC}"
wait
