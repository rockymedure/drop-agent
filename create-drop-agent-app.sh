#!/bin/bash

# create-drop-agent-app.sh
# Sets up a new Drop Agent project with all boilerplate

set -e  # Exit on any error

PROJECT_NAME=${1:-"my-drop-agent-app"}

echo "🚀 Creating Drop Agent app: $PROJECT_NAME"

# Create project directory
mkdir -p "$PROJECT_NAME"
cd "$PROJECT_NAME"

echo "📦 Initializing npm project..."
npm init -y > /dev/null

echo "⬇️  Installing dependencies..."
npm install --silent drop-agent drop-agent-ui express cors dotenv react react-dom
npm install --silent -D vite @vitejs/plugin-react concurrently

echo "📁 Creating project structure..."
mkdir -p src

echo "⚙️  Creating configuration files..."

# package.json updates
cat > package.json << 'EOF'
{
  "name": "drop-agent-app",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "concurrently \"node server.js\" \"vite\"",
    "server": "node server.js",
    "client": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "drop-agent": "^1.0.1",
    "drop-agent-ui": "^1.0.1",
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "concurrently": "^8.2.2"
  }
}
EOF

# Vite config
cat > vite.config.js << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 3000 }
})
EOF

# HTML template
cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Drop Agent</title>
    <style>
        body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        .max-w-2xl { max-width: 42rem; }
        .p-4 { padding: 1rem; }
        .rounded-lg { border-radius: 0.5rem; }
        .bg-gray-50 { background-color: #f9fafb; }
        .bg-gray-100 { background-color: #f3f4f6; }
        .bg-blue-500 { background-color: #3b82f6; }
        .bg-blue-50 { background-color: #eff6ff; }
        .text-gray-800 { color: #1f2937; }
        .text-gray-500 { color: #6b7280; }
        .text-gray-600 { color: #4b5563; }
        .text-gray-700 { color: #374151; }
        .text-blue-500 { color: #3b82f6; }
        .text-blue-600 { color: #2563eb; }
        .text-blue-700 { color: #1d4ed8; }
        .text-white { color: white; }
        .border-l-4 { border-left-width: 4px; }
        .border-gray-400 { border-color: #9ca3af; }
        .border-blue-200 { border-color: #bfdbfe; }
        .border-t, .border-b { border-width: 1px 0; }
        .border-gray-200 { border-color: #e5e7eb; }
        .border-gray-300 { border-color: #d1d5db; }
        .flex { display: flex; }
        .flex-col { flex-direction: column; }
        .flex-1 { flex: 1 1 0%; }
        .space-x-2 > * + * { margin-left: 0.5rem; }
        .space-y-3 > * + * { margin-top: 0.75rem; }
        .space-y-4 > * + * { margin-top: 1rem; }
        .h-screen { height: 100vh; }
        .overflow-y-auto { overflow-y: auto; }
        .text-center { text-align: center; }
        .text-xl { font-size: 1.25rem; }
        .text-sm { font-size: 0.875rem; }
        .font-semibold { font-weight: 600; }
        .font-medium { font-weight: 500; }
        .font-mono { font-family: ui-monospace, monospace; }
        .whitespace-pre-wrap { white-space: pre-wrap; }
        .ml-auto { margin-left: auto; }
        .mb-2 { margin-bottom: 0.5rem; }
        .mt-1 { margin-top: 0.25rem; }
        .px-4 { padding-left: 1rem; padding-right: 1rem; }
        .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
        .p-3 { padding: 0.75rem; }
        .p-2 { padding: 0.5rem; }
        .focus\:outline-none:focus { outline: none; }
        .focus\:ring-2:focus { box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5); }
        .hover\:bg-blue-600:hover { background-color: #2563eb; }
        .cursor-not-allowed { cursor: not-allowed; }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
        .bg-gray-400 { background-color: #9ca3af; }
    </style>
</head>
<body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
</body>
</html>
EOF

# React main entry
cat > src/main.jsx << 'EOF'
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
EOF

# Create complete Drop Agent server (ready to run!)
cat > server.js << 'EOF'
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ReasoningAgent, addCommonTools, setupSSERoutes } from 'drop-agent';

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Drop Agent setup (3 lines)
const agent = new ReasoningAgent({ apiKey: process.env.ANTHROPIC_API_KEY });
addCommonTools(agent);
setupSSERoutes(app, agent);

// Add a custom tool for demo
agent.addTool(
  'get_time',
  'Get the current time',
  {},
  async () => {
    return `Current time: ${new Date().toLocaleString()}`;
  }
);

app.listen(PORT, () => {
  console.log(`🚀 Drop Agent server running on port ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api/chat/stream`);
  console.log(`🔧 Tools: ${agent.listTools().join(', ')}`);
});
EOF

# Create complete Drop Agent React app (ready to run!)
cat > src/App.jsx << 'EOF'
import React from 'react';
import { ChatInterface } from 'drop-agent-ui';

function App() {
  return (
    <div style={{ height: '100vh' }}>
      <ChatInterface 
        serverUrl="http://localhost:3001"
        title="My Drop Agent"
        modelOptions={{
          model: 'claude-opus-4-20250514',
          maxTokens: 16000,
          thinkingBudget: 10000
        }}
      />
    </div>
  );
}

export default App;
EOF

# Prompt for API key
echo ""
echo "🔑 API Key Setup"
echo "Please enter your Anthropic API key (or press Enter to skip):"
read -p "ANTHROPIC_API_KEY: " API_KEY

# Create .env file
if [ -n "$API_KEY" ]; then
  echo "ANTHROPIC_API_KEY=$API_KEY" > .env
  echo "✅ API key saved to .env"
else
  cat > .env << 'EOF'
# Add your Anthropic API key here
ANTHROPIC_API_KEY=your-api-key-here
EOF
  echo "⚠️  API key skipped - please add to .env manually"
fi

# Create .gitignore
cat > .gitignore << 'EOF'
node_modules/
.env
dist/
build/
*.log
.DS_Store
EOF

# Create README
cat > README.md << 'EOF'
# Drop Agent App

Created with `create-drop-agent-app.sh` - **Ready to run!** 🚀

## ✅ What's Already Set Up

- ✅ Drop Agent server with calculator, weather, and time tools
- ✅ React app with ChatInterface component  
- ✅ All dependencies installed
- ✅ API key configured (if you provided it)

## 🚀 Run the App

```bash
npm run dev
```

Then open http://localhost:3000

## 🧪 Test Messages

- "What's 25 × 17?"
- "What's the weather in Tokyo?"
- "What time is it?"
- "Help me think through a decision"

## 🔧 Tools Included

- **Calculator** - Mathematical operations
- **Weather** - Weather information (simulated)
- **Time** - Current date and time
- **Extended Thinking** - Real-time AI reasoning

## 🎯 What You Get

Complete AI reasoning agent with:
- Real-time extended thinking visualization
- Tool calling with results display  
- Professional chat interface
- SSE streaming responses

**Zero manual setup required!** 🎉
EOF

echo ""
echo "✅ Drop Agent app created successfully!"
echo ""
echo "📂 Created: $PROJECT_NAME/"
echo "📦 Dependencies: Installed"
echo "⚙️  Configuration: Complete"
echo "🤖 Drop Agent: Fully integrated"
echo ""
if [ -n "$API_KEY" ]; then
  echo "🎯 Ready to run:"
  echo "   1. cd $PROJECT_NAME"
  echo "   2. npm run dev"
  echo "   3. Open http://localhost:3000"
else
  echo "🎯 Almost ready:"
  echo "   1. cd $PROJECT_NAME"
  echo "   2. Add API key to .env"
  echo "   3. npm run dev"
  echo "   4. Open http://localhost:3000"
fi
echo ""
echo "🚀 Zero manual coding required - just run and use!"
echo ""