# Drop Agent - Modular AI Reasoning Agent

## What is Drop Agent?

Drop Agent is a professional, production-ready AI reasoning agent that provides extended thinking capabilities, tool calling, conversation memory, and real-time streaming. Built with Anthropic's Claude Sonnet 4, it can be integrated into any project in minutes.

## ✨ Latest Features (2025)

- **🧠 Conversation Memory** - Remembers full conversation context across messages
- **📝 Custom Markdown Renderer** - Beautiful text formatting without external dependencies  
- **🌐 Native Web Search** - Real-time search with citations using Anthropic's web_search_20250305
- **⚡ Claude Sonnet 4** - Upgraded to claude-sonnet-4-20250514 for better reliability
- **🎨 Enhanced UI** - Streaming progress indicators and clean visual hierarchy

## 🚀 Published npm Packages

### **drop-agent@1.0.1** - Core Agent Package
```bash
npm install drop-agent
```
- **ReasoningAgent class** with Claude Sonnet 4 + extended thinking
- **Modular tool system** (calculator, weather, web search, extensible)
- **SSE streaming utilities** for Express integration
- **Conversation memory support** - maintains context across messages
- **3-line integration** into any Node.js project

### **drop-agent-ui@1.0.1** - React Components Package
```bash
npm install drop-agent-ui
```
- **Complete ChatInterface** component with memory and markdown
- **Individual components** (ThinkingBlock, ResponseBlock, MarkdownRenderer, etc.)
- **Web search components** (WebSearchProgress, WebSearchResults)
- **useSSE hook** for streaming integration
- **2-line integration** into any React project

## Quick Start

### Server Setup (4 lines)
```javascript
import express from 'express';
import { ReasoningAgent, addCommonTools, setupSSERoutes } from 'drop-agent';

const app = express();
const agent = new ReasoningAgent({ apiKey: process.env.ANTHROPIC_API_KEY });
addCommonTools(agent);  // Adds calculator + weather + web search
setupSSERoutes(app, agent);  // Adds /api/chat/stream endpoint

app.listen(3001, () => console.log('🚀 Drop Agent ready on port 3001'));
```

### React Integration (2 lines)
```jsx
import { ChatInterface } from 'drop-agent-ui';

<ChatInterface 
  serverUrl="http://localhost:3001"
  title="My AI Assistant"
  modelOptions={{
    model: 'claude-sonnet-4-20250514',
    maxTokens: 16000,
    thinkingBudget: 10000
  }}
/>
```

## Core Features

- **🧠 Extended Thinking** - Real-time visibility into AI reasoning process
- **💭 Conversation Memory** - Maintains full context across conversation
- **📝 Markdown Rendering** - Beautiful formatting for **bold**, *italic*, `code`, lists, headers
- **🌐 Web Search** - Real-time search with clickable citations and progress tracking
- **🔧 Tool Calling** - Built-in calculator, weather, web search, and extensible tool system
- **⚡ SSE Streaming** - Real-time responses without WebSocket complexity
- **🎨 Modern UI** - Professional chat interface with separated thinking blocks
- **🔌 Drop-in Ready** - Works in any Express + React project
- **📚 Fully Documented** - Comprehensive READMEs and integration guides

## Architecture

```
┌─────────────────┐     Server-Sent     ┌─────────────────┐
│   React Client  │     Events (SSE)    │  Express Server │
│   Port 3000     │ ◄─────────────────► │   Port 3001     │
│                 │                     │                 │
│ • Chat UI       │                     │ • Drop Agent    │
│ • Memory Mgmt   │                     │ • Tools         │
│ • Markdown      │                     │ • Web Search    │
│ • SSE Consumer  │                     │ • API Bridge    │
└─────────────────┘                     └─────────────────┘
```

## Advanced Usage

### Web Search Configuration
```javascript
// Enable web search with custom settings
agent.addWebSearch({
  maxUses: 5,
  allowedDomains: ['wikipedia.org', 'github.com'],
  blockedDomains: ['example.com'],
  userLocation: { city: 'San Francisco', region: 'California', country: 'US' }
});
```

### Custom Tools
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

### Tool Registry
```javascript
import { ToolRegistry } from 'drop-agent';

const tools = new ToolRegistry();
tools.addToAgent(agent, 'calculator');
tools.addToAgent(agent, 'weather');
tools.addToAgent(agent, 'websearch');
```

### Individual UI Components
```jsx
import { 
  ThinkingBlock, 
  ResponseBlock, 
  MarkdownRenderer,
  WebSearchProgress,
  WebSearchResults,
  ChatInput,
  useSSE 
} from 'drop-agent-ui';

function CustomChat() {
  const { sendMessage } = useSSE('http://localhost:3001');
  
  return (
    <div>
      <ThinkingBlock thinking={thinking} isStreaming={true} />
      <WebSearchProgress queries={queries} isActive={searching} />
      <WebSearchResults webSearchResults={results} />
      <ResponseBlock content={response} title="Drop Agent" />
      <ChatInput onSend={handleSend} placeholder="Ask me anything..." />
    </div>
  );
}
```

### Configuration Options
```javascript
// Agent configuration
const agent = new ReasoningAgent({
  apiKey: process.env.ANTHROPIC_API_KEY,
  systemPrompt: 'Custom prompt...' // optional
});

// Model options (Claude Sonnet 4 default)
const options = {
  model: 'claude-sonnet-4-20250514',
  maxTokens: 16000,
  thinkingBudget: 10000
};
```

## Environment Setup

1. **Install packages**:
   ```bash
   npm install drop-agent drop-agent-ui
   ```

2. **Set environment variable**:
   ```bash
   # .env
   ANTHROPIC_API_KEY=your-api-key-here
   ```

3. **Enable web search** (optional):
   - Web search requires organization admin to enable in [Anthropic Console](https://console.anthropic.com/settings/privacy)

4. **Start development**:
   ```bash
   npm run dev  # Starts both server and client
   ```

## Available Commands

```bash
# Development
npm run dev              # Start both server and client
npm run build           # Build for production

# Individual commands  
npm run server          # Start server only
npm run client          # Start client only

# Package management
npm install drop-agent drop-agent-ui
```

## API Reference

### ReasoningAgent Methods
- `addTool(name, description, parameters, handler)` - Add a custom tool
- `addWebSearch(config)` - Enable web search with configuration
- `removeTool(name)` - Remove a tool
- `listTools()` - Get tool names
- `streamResponse(messages, options)` - Stream agent response with conversation history
- `processMessage(messages, options)` - Get complete response with conversation history

### SSE Endpoints
- `POST /api/chat/stream` - Stream chat responses with conversation memory
- `GET /api/health` - Health check with tool list
- `GET /api/agent/info` - Agent information

### React Components
- `ChatInterface` - Complete chat UI with memory and markdown
- `ThinkingBlock` - Display reasoning process
- `ResponseBlock` - Display responses with markdown rendering
- `MarkdownRenderer` - Standalone markdown component
- `ToolResults` - Show tool usage
- `WebSearchProgress` - Show streaming search queries
- `WebSearchResults` - Display search results with citations
- `ChatInput` - Message input
- `useSSE` - SSE streaming hook

### Conversation Memory
Drop Agent automatically maintains conversation context:
```javascript
// Messages are sent as conversation history
const conversationHistory = [
  { role: 'user', content: 'My name is John' },
  { role: 'assistant', content: 'Nice to meet you, John!' },
  { role: 'user', content: 'What did I tell you my name was?' }
];

// Agent remembers: "You told me your name was John."
```

## Testing Examples

### Memory Test
```
User: "My favorite color is blue and I'm a software engineer"
User: "What's my favorite color?"
Assistant: "Your favorite color is blue."
```

### Web Search + Markdown
```
User: "What are the **latest AI developments** in 2025? Give me a numbered list."
# Triggers web search + beautiful markdown formatting
```

### Follow-up Context
```
User: "Search for quantum computing breakthroughs"
User: "Based on what you found, what should I learn first?"
# Uses previous search results in context
```

## Requirements

- **Node.js** 18+
- **React** 18+ (for UI components)
- **Anthropic API key**
- **Express.js** (peer dependency)
- **Web search enabled** (optional, requires organization admin)

## Examples

The repository includes complete examples:
- **Simple Integration** - Basic 3-line setup
- **Custom Tools** - Adding your own tools
- **UI Customization** - Custom React components
- **Memory Examples** - Conversation context demos
- **Web Search Integration** - Real-time search examples

## Recent Updates

### v1.0.1+ (2025)
- ✅ **Conversation Memory** - Full context retention
- ✅ **Custom Markdown Renderer** - Zero-dependency formatting
- ✅ **Native Web Search** - Anthropic web_search_20250305 integration
- ✅ **Claude Sonnet 4** - Upgraded default model
- ✅ **Enhanced UI** - Streaming indicators and visual improvements
- ✅ **Better Error Handling** - Overload detection and user-friendly messages

## Support

- **GitHub**: https://github.com/rockymedure/drop-agent
- **npm packages**: https://www.npmjs.com/package/drop-agent
- **Issues**: https://github.com/rockymedure/drop-agent/issues

## License

MIT - Use in any project, commercial or personal.

---

**Drop Agent transforms AI reasoning agent development from weeks to minutes. With conversation memory, web search, and beautiful markdown rendering - get started today!**