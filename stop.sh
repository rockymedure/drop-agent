#!/bin/bash

echo "🛑 Stopping Reasoning Agent..."

# Kill by PID if files exist
if [ -f server.pid ]; then
    SERVER_PID=$(cat server.pid)
    kill $SERVER_PID 2>/dev/null && echo "   Stopped server (PID: $SERVER_PID)"
    rm server.pid
fi

if [ -f client.pid ]; then
    CLIENT_PID=$(cat client.pid)
    kill $CLIENT_PID 2>/dev/null && echo "   Stopped client (PID: $CLIENT_PID)"
    rm client.pid
fi

# Fallback: kill by process name
pkill -f "node.*index.js" 2>/dev/null && echo "   Stopped any remaining server processes"
pkill -f "vite" 2>/dev/null && echo "   Stopped any remaining client processes"

echo "✅ All processes stopped!"