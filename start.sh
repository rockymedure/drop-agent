#!/bin/bash

echo "🚀 Starting Reasoning Agent..."

# Kill any existing processes
pkill -f "node.*index.js" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

# Wait a moment for processes to die
sleep 2

# Start server in background
echo "🖥️  Starting server on port 3001..."
cd server && npm run dev > ../server.log 2>&1 &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Start client in background  
echo "🌐 Starting client on port 3000..."
cd ../client && npm run dev > ../client.log 2>&1 &
CLIENT_PID=$!

# Wait for client to start
sleep 3

echo ""
echo "✅ Both servers started!"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🖥️  Backend:  http://localhost:3001"
echo ""
echo "📋 Server PID: $SERVER_PID"
echo "📋 Client PID: $CLIENT_PID"
echo ""
echo "📝 Logs:"
echo "   Server: tail -f server.log"
echo "   Client: tail -f client.log"
echo ""
echo "🛑 To stop:"
echo "   ./stop.sh"
echo "   or kill $SERVER_PID $CLIENT_PID"

# Save PIDs for easy stopping
echo "$SERVER_PID" > server.pid
echo "$CLIENT_PID" > client.pid