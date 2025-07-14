#!/bin/bash

echo "🔍 Debugging Reasoning Agent..."
echo ""

echo "📋 Checking processes:"
echo "Server processes:"
ps aux | grep "node.*index.js" | grep -v grep || echo "   No server running"
echo "Client processes:"  
ps aux | grep "vite" | grep -v grep || echo "   No client running"
echo ""

echo "📋 Checking ports:"
echo "Port 3000:" 
lsof -i :3000 || echo "   Nothing on port 3000"
echo "Port 3001:"
lsof -i :3001 || echo "   Nothing on port 3001"
echo ""

echo "📋 Checking API key:"
if [ -f server/.env ]; then
    echo "   .env file exists"
    if grep -q "ANTHROPIC_API_KEY" server/.env; then
        echo "   API key is set"
    else
        echo "   ⚠️  API key not found in .env"
    fi
else
    echo "   ⚠️  .env file missing"
fi
echo ""

echo "📋 Quick server test:"
if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "   ✅ Server responding"
else
    echo "   ❌ Server not responding"
fi

echo "📋 Recent logs:"
if [ -f server.log ]; then
    echo "Server log (last 5 lines):"
    tail -5 server.log
else
    echo "   No server.log found"
fi

if [ -f client.log ]; then
    echo "Client log (last 5 lines):"
    tail -5 client.log  
else
    echo "   No client.log found"
fi