# Drop Agent - Modular AI Reasoning Agent

## What is Drop Agent?

Drop Agent is a professional, production-ready AI reasoning agent that provides extended thinking capabilities, tool calling, and real-time streaming. Built with Anthropic's Claude Opus 4, it can be integrated into any project in minutes.

## 🚀 Published npm Packages

### **drop-agent@1.0.1** - Core Agent Package
```bash
npm install drop-agent
```
- **ReasoningAgent class** with Claude Opus 4 + extended thinking
- **Modular tool system** (calculator, weather, extensible)
- **SSE streaming utilities** for Express integration
- **3-line integration** into any Node.js project

### **drop-agent-ui@1.0.1** - React Components Package
```bash
npm install drop-agent-ui
```
- **Complete ChatInterface** component
- **Individual components** (ThinkingBlock, ResponseBlock, etc.)
- **useSSE hook** for streaming integration
- **2-line integration** into any React project

## Quick Start

### Server Setup (3 lines)
```javascript
import express from 'express';
import { ReasoningAgent, addCommonTools, setupSSERoutes } from 'drop-agent';

const app = express();
const agent = new ReasoningAgent({ apiKey: process.env.ANTHROPIC_API_KEY });
addCommonTools(agent);  // Adds calculator + weather
setupSSERoutes(app, agent);  // Adds /api/chat/stream endpoint

app.listen(3001, () => console.log('🚀 Drop Agent ready on port 3001'));
```

### React Integration (2 lines)
```jsx
import { ChatInterface } from 'drop-agent-ui';

<ChatInterface 
  serverUrl="http://localhost:3001"
  title="My AI Assistant"
/>
```

## Features

- **🧠 Extended Thinking** - Real-time visibility into AI reasoning process
- **🔧 Tool Calling** - Built-in calculator, weather, and extensible tool system
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
│ • SSE Consumer  │                     │ • Tools         │
│ • State Mgmt    │                     │ • API Bridge    │
└─────────────────┘                     └─────────────────┘
```

## Advanced Usage

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
```

### Individual UI Components
```jsx
import { 
  ThinkingBlock, 
  ResponseBlock, 
  ChatInput,
  useSSE 
} from 'drop-agent-ui';

function CustomChat() {
  const { sendMessage } = useSSE('http://localhost:3001');
  
  return (
    <div>
      <ThinkingBlock thinking={thinking} isStreaming={true} />
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

// Model options
const options = {
  model: 'claude-opus-4-20250514',
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

3. **Start development**:
   ```bash
   node server.js  # Your server with Drop Agent
   npm run dev     # Your React app
   ```

## Available Commands

```bash
# Install dependencies
npm install drop-agent drop-agent-ui

# Example integration
git clone https://github.com/rockymedure/drop-agent.git
cd drop-agent/examples/simple-integration
npm install
node server.js
```

## API Reference

### ReasoningAgent Methods
- `addTool(name, description, parameters, handler)` - Add a tool
- `removeTool(name)` - Remove a tool
- `listTools()` - Get tool names
- `streamResponse(message, options)` - Stream agent response
- `processMessage(message, options)` - Get complete response

### SSE Endpoints
- `POST /api/chat/stream` - Stream chat responses
- `GET /api/health` - Health check with tool list
- `GET /api/agent/info` - Agent information

### React Components
- `ChatInterface` - Complete chat UI
- `ThinkingBlock` - Display reasoning process
- `ResponseBlock` - Display responses
- `ToolResults` - Show tool usage
- `ChatInput` - Message input
- `useSSE` - SSE streaming hook

## Requirements

- **Node.js** 18+
- **React** 18+ (for UI components)
- **Anthropic API key**
- **Express.js** (peer dependency)

## Examples

The repository includes complete examples:
- **Simple Integration** - Basic 3-line setup
- **Custom Tools** - Adding your own tools
- **UI Customization** - Custom React components

## Support

- **GitHub**: https://github.com/rockymedure/drop-agent
- **npm packages**: https://www.npmjs.com/package/drop-agent
- **Issues**: https://github.com/rockymedure/drop-agent/issues

## License

MIT - Use in any project, commercial or personal.

---

**Drop Agent transforms AI reasoning agent development from weeks to minutes. Get started today!**