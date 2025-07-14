#!/bin/bash

echo "🚀 Starting Reasoning Agent with SSE..."

# Kill any existing processes
pkill -f "sse-server.js" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
sleep 1

# Start the SSE server in background
echo "🖥️  Starting SSE server..."
cd server && node sse-server.js &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Start the client
echo "🌐 Starting client..."
cd ../client && npm run dev &
CLIENT_PID=$!

# Wait for client to start
sleep 2

echo ""
echo "✅ Both servers started!"
echo "📋 Server PID: $SERVER_PID"
echo "📋 Client PID: $CLIENT_PID"
echo ""
echo "🌐 Open: http://localhost:3000"
echo ""
echo "🛑 To stop: kill $SERVER_PID $CLIENT_PID"

# Save PIDs
echo "$SERVER_PID" > server.pid
echo "$CLIENT_PID" > client.pid

# Wait for user input to stop
echo "Press any key to stop..."
read -n 1

# Stop servers
kill $SERVER_PID $CLIENT_PID 2>/dev/null
echo "✅ Servers stopped!"