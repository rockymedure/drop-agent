#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import readline from 'readline';

const execAsync = promisify(exec);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

async function createDropAgentApp() {
  console.log('🚀 Creating Drop Agent app...\n');

  // Get project name
  const projectName = process.argv[2] || await question('📁 Project name (my-drop-agent-app): ') || 'my-drop-agent-app';
  
  console.log(`\n📂 Creating project: ${projectName}`);
  
  try {
    // Create project directory
    if (fs.existsSync(projectName)) {
      console.log(`❌ Directory ${projectName} already exists!`);
      process.exit(1);
    }
    
    fs.mkdirSync(projectName);
    process.chdir(projectName);
    
    console.log('📦 Initializing npm project...');
    
    // Create package.json
    const packageJson = {
      "name": projectName,
      "version": "1.0.0",
      "type": "module",
      "scripts": {
        "dev": "concurrently \"node server.js\" \"vite\"",
        "server": "node server.js",
        "client": "vite",
        "build": "vite build"
      },
      "dependencies": {
        "drop-agent": "^1.0.2",
        "drop-agent-ui": "^1.0.4",
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
    };
    
    fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
    
    console.log('⬇️  Installing dependencies...');
    await execAsync('npm install --silent');
    
    console.log('📁 Creating project structure...');
    fs.mkdirSync('src');
    
    console.log('⚙️  Creating configuration files...');
    
    // Vite config
    const viteConfig = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 3000 }
})`;
    fs.writeFileSync('vite.config.js', viteConfig);
    
    // HTML template
    const htmlTemplate = `<!DOCTYPE html>
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
        .focus\\:outline-none:focus { outline: none; }
        .focus\\:ring-2:focus { box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5); }
        .hover\\:bg-blue-600:hover { background-color: #2563eb; }
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
</html>`;
    fs.writeFileSync('index.html', htmlTemplate);
    
    // React main entry
    const mainJsx = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;
    fs.writeFileSync('src/main.jsx', mainJsx);
    
    // Complete Drop Agent server
    const serverJs = `import express from 'express';
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
    return \`Current time: \${new Date().toLocaleString()}\`;
  }
);

app.listen(PORT, () => {
  console.log(\`🚀 Drop Agent server running on port \${PORT}\`);
  console.log(\`📡 API: http://localhost:\${PORT}/api/chat/stream\`);
  console.log(\`🔧 Tools: \${agent.listTools().join(', ')}\`);
});`;
    fs.writeFileSync('server.js', serverJs);
    
    // Complete Drop Agent React app
    const appJsx = `import React from 'react';
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

export default App;`;
    fs.writeFileSync('src/App.jsx', appJsx);
    
    // Prompt for API key
    console.log('\n🔑 API Key Setup');
    const apiKey = await question('Enter your Anthropic API key (or press Enter to skip): ');
    
    // Create .env file
    if (apiKey.trim()) {
      fs.writeFileSync('.env', `ANTHROPIC_API_KEY=${apiKey.trim()}`);
      console.log('✅ API key saved to .env');
    } else {
      fs.writeFileSync('.env', '# Add your Anthropic API key here\\nANTHROPIC_API_KEY=your-api-key-here');
      console.log('⚠️  API key skipped - please add to .env manually');
    }
    
    // Create .gitignore
    const gitignore = `node_modules/
.env
dist/
build/
*.log
.DS_Store`;
    fs.writeFileSync('.gitignore', gitignore);
    
    // Create README
    const readme = `# Drop Agent App

Created with \`drop-agent-basics\` - **Ready to run!** 🚀

## ✅ What's Already Set Up

- ✅ Drop Agent server with calculator, weather, and time tools
- ✅ React app with ChatInterface component  
- ✅ All dependencies installed
- ✅ API key configured (if you provided it)

## 🚀 Run the App

\`\`\`bash
npm run dev
\`\`\`

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

**Zero manual setup required!** 🎉`;
    fs.writeFileSync('README.md', readme);
    
    console.log('\\n✅ Drop Agent app created successfully!\\n');
    console.log(`📂 Created: ${projectName}/`);
    console.log('📦 Dependencies: Installed');
    console.log('⚙️  Configuration: Complete');
    console.log('🤖 Drop Agent: Fully integrated\\n');
    
    if (apiKey.trim()) {
      console.log('🎯 Ready to run:');
      console.log(`   1. cd ${projectName}`);
      console.log('   2. npm run dev');
      console.log('   3. Open http://localhost:3000');
    } else {
      console.log('🎯 Almost ready:');
      console.log(`   1. cd ${projectName}`);
      console.log('   2. Add API key to .env');
      console.log('   3. npm run dev');
      console.log('   4. Open http://localhost:3000');
    }
    
    console.log('\\n🚀 Zero manual coding required - just run and use!\\n');
    
  } catch (error) {
    console.error('❌ Error creating Drop Agent app:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

createDropAgentApp();