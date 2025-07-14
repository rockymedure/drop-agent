# drop-agent-basics

CLI tool to create Drop Agent projects with zero setup. Install globally and create AI reasoning agents in seconds.

## Installation

```bash
npm install -g drop-agent-basics
```

## Usage

```bash
# Create a new Drop Agent app
create-drop-agent my-ai-app

# Or use the alternative command
drop-agent-create my-ai-app

# Or run without a name (will prompt)
create-drop-agent
```

## What You Get

The CLI creates a complete Drop Agent project with:

- ✅ **Drop Agent server** with calculator, weather, and time tools
- ✅ **React chat interface** with extended thinking visualization
- ✅ **All dependencies** installed automatically
- ✅ **Zero manual setup** - ready to run immediately

## Example

```bash
$ create-drop-agent my-bot
🚀 Creating Drop Agent app...
📂 Creating project: my-bot
📦 Initializing npm project...
⬇️  Installing dependencies...
📁 Creating project structure...
⚙️  Creating configuration files...

🔑 API Key Setup
Enter your Anthropic API key: sk-ant-...

✅ Drop Agent app created successfully!

🎯 Ready to run:
   1. cd my-bot
   2. npm run dev
   3. Open http://localhost:3000

🚀 Zero manual coding required - just run and use!

$ cd my-bot
$ npm run dev
```

## Features Included

### **Backend**
- Express server with Drop Agent integration
- Calculator tool for math operations
- Weather tool (simulated data)
- Time tool for current date/time
- SSE streaming for real-time responses

### **Frontend**
- React app with ChatInterface component
- Real-time thinking process visualization
- Tool usage display with highlighting
- Professional chat UI
- Responsive design

### **Development**
- Vite for fast React development
- Concurrently to run both server and client
- Hot reloading for both frontend and backend
- Complete TypeScript support ready

## Commands Available

After creation, your project has these scripts:

```bash
npm run dev     # Start both server and client
npm run server  # Start only the server
npm run client  # Start only the React app
npm run build   # Build for production
```

## Test Messages

Try these with your new Drop Agent:

- "What's 25 × 17?"
- "What's the weather in Tokyo?"
- "What time is it?"
- "Help me think through whether I should learn Python or JavaScript"

## Requirements

- Node.js 18+
- npm 8+
- Anthropic API key

## What's Created

```
my-ai-app/
├── server.js           # Express + Drop Agent (ready to run)
├── src/
│   ├── App.jsx        # React + ChatInterface (ready to run)
│   └── main.jsx       # React entry point
├── package.json       # All dependencies included
├── vite.config.js     # React build configuration
├── index.html         # HTML template with styles
├── .env              # API key (if provided)
├── .gitignore        # Git ignore rules
└── README.md         # Usage instructions
```

## Zero Configuration

Unlike other tools that require manual setup:

- ❌ **Other tools**: Create boilerplate, then spend hours configuring
- ✅ **drop-agent-basics**: Creates complete, working AI agent in seconds

## From Zero to AI Agent

```bash
# 1. Install CLI globally
npm install -g drop-agent-basics

# 2. Create project
create-drop-agent my-agent

# 3. Run project
cd my-agent && npm run dev

# 4. Chat with AI at localhost:3000
```

**Total time: Under 2 minutes to working AI reasoning agent!**

## Support

- **GitHub**: https://github.com/rockymedure/drop-agent
- **Issues**: https://github.com/rockymedure/drop-agent/issues
- **Core Package**: https://www.npmjs.com/package/drop-agent

## License

MIT