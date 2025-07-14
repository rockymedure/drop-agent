# Drop Agent - AI Reasoning Agent with Extended Thinking

A production-ready AI reasoning agent with real-time extended thinking visualization, tool calling, and streaming responses. Built with Anthropic's Claude Opus 4.

## 🚀 **Quick Start (Recommended)**

**Clone and run locally in under 2 minutes:**

```bash
# 1. Clone the repository
git clone https://github.com/rockymedure/drop-agent.git
cd drop-agent

# 2. Install all dependencies
npm run install-all

# 3. Set up your API key
echo "ANTHROPIC_API_KEY=your-api-key-here" > server/.env

# 4. Start the application
npm run dev
```

**Open http://localhost:3000** - You'll have a fully working AI reasoning agent!

## ✨ **What You Get**

- **🧠 Extended Thinking** - Watch the AI reason through problems in real-time
- **🔧 Tool Calling** - Built-in calculator, weather, and extensible tool system  
- **⚡ Real-time Streaming** - Server-Sent Events for instant responses
- **🎨 Modern Interface** - Professional chat UI inspired by Claude Desktop
- **📱 Responsive Design** - Works perfectly on desktop and mobile
- **⚙️ Configurable** - Adjust model, tokens, thinking budget, and more

## 🎯 **Perfect For**

- **Developers** wanting to explore AI reasoning capabilities
- **Researchers** studying extended thinking and tool usage
- **Anyone** who wants to see how AI actually thinks through problems
- **Projects** needing a drop-in AI reasoning component

## 🏗️ **Architecture**

```
┌─────────────────┐     Server-Sent     ┌─────────────────┐
│   React Client  │     Events (SSE)    │  Express Server │
│   Port 3000     │ ◄─────────────────► │   Port 3001     │
│                 │                     │                 │
│ • Chat UI       │                     │ • Drop Agent    │
│ • SSE Consumer  │                     │ • Tools         │
│ • State Mgmt    │                     │ • API Bridge    │
└─────────────────┘                     └─────────────────┘
```

## 📋 **Available Commands**

```bash
npm run dev         # Start both client and server
npm run server      # Start only the server (port 3001)
npm run client      # Start only the client (port 3000)
npm run build       # Build for production
npm run install-all # Install all dependencies
```

## 🔧 **Built-in Tools**

- **Calculator** - Mathematical operations (`"What's 25 × 17?"`)
- **Weather** - Weather information (`"What's the weather in Tokyo?"`)
- **Web Search** - Real-time web search with citations (`"What's the latest news about AI?"`) *
- **Time** - Current date/time (`"What time is it?"`)
- **Extensible** - Easy to add more tools

*\* Web search requires organization admin to enable in [Anthropic Console](https://console.anthropic.com/settings/privacy)*

## 🎨 **Key Features**

### **Extended Thinking Visualization**
See exactly how the AI reasons through complex problems:
- Real-time thinking process display
- Separated thinking and response blocks
- Configurable thinking budget (1K-50K tokens)

### **Professional Chat Interface**
- Clean, modern design inspired by Claude Desktop
- Persistent conversation history
- Real-time typing indicators
- Tool usage highlighting
- Mobile-responsive layout

### **Advanced Configuration**
- **Models**: Claude Opus 4, Claude Sonnet 4
- **Max Tokens**: 1,000 - 200,000
- **Thinking Budget**: 1,000 - 50,000 tokens
- **Streaming Options**: Real-time or batch responses

## 🛠️ **Development**

### **Adding Custom Tools**

Add tools in `server/sse-server.js`:

```javascript
agent.addTool(
  'search_docs',
  'Search internal documentation',
  {
    query: { type: 'string', description: 'Search query' }
  },
  async ({ query }) => {
    // Your implementation
    return `Found results for: ${query}`;
  }
);
```

### **Customizing the UI**

Components are in `client/src/components/`:
- `ChatInterface.jsx` - Main chat component
- `ThinkingBlock.jsx` - Thinking visualization  
- `ResponseBlock.jsx` - Response display
- `ToolResults.jsx` - Tool usage display

## 🌐 **For LLMs and AI Assistants**

If you're an AI helping someone set up Drop Agent:

1. **Verify Node.js**: Make sure they have Node.js 18+ installed
2. **Get API Key**: They need an Anthropic API key from console.anthropic.com
3. **Clone & Install**: Use the Quick Start commands above
4. **Test Messages**: Suggest trying:
   - `"What's 142 × 67?"`
   - `"What's the weather in London?"`
   - `"What's the latest news about AI breakthroughs?"`
   - `"Help me think through buying a house"`

The setup is designed to work out-of-the-box with minimal configuration.

## 🔐 **Security**

- API keys stored server-side only
- No sensitive data in browser storage  
- CORS configured for development
- Client-server communication via SSE

## 📦 **Alternative: npm Packages**

For integration into existing projects, we also publish npm packages:

```bash
npm install drop-agent drop-agent-ui
```

But **cloning the repo is recommended** for the best experience.

## 🐛 **Troubleshooting**

**Connection Issues:**
- Ensure ports 3000 and 3001 are available
- Check if API key is set in `server/.env`
- Verify both client and server are running

**Performance:**
- Reduce thinking budget for faster responses
- Use Claude Sonnet 4 for speed over Claude Opus 4 for quality
- Lower max tokens for shorter responses

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Test your changes thoroughly
4. Submit a pull request

## 📄 **License**

MIT License - Use in any project, commercial or personal.

---

**Drop Agent brings AI reasoning to life. Clone it today and watch AI think! 🧠✨**