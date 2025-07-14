#!/bin/bash

echo "🚀 Setting up Reasoning Agent Browser Interface..."

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install server dependencies
echo "🖥️  Installing server dependencies..."
cd server && npm install && cd ..

# Install client dependencies  
echo "🌐 Installing client dependencies..."
cd client && npm install && cd ..

echo "✅ Setup complete!"
echo ""
echo "To start the application:"
echo "  npm run dev"
echo ""
echo "Or start components separately:"
echo "  npm run server  # Start backend server"
echo "  npm run client  # Start frontend client"
echo ""
echo "Access the application at:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:3001"
echo ""
echo "For CLI mode:"
echo "  npm run cli"