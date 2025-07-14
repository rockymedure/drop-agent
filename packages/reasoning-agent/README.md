# drop-agent

A modular AI reasoning agent with extended thinking capabilities using Anthropic's Claude. Drop this agent into any Node.js project for instant AI reasoning with real-time streaming and tool calling.

## Quick Start

```bash
npm install drop-agent
```

```javascript
import express from 'express';
import { ReasoningAgent, addCommonTools, setupSSERoutes } from 'drop-agent';

const app = express();
const agent = new ReasoningAgent({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Add built-in tools (calculator, weather)
addCommonTools(agent);

// Setup streaming endpoints
setupSSERoutes(app, agent);

app.listen(3001, () => {
  console.log('🚀 Reasoning agent ready on port 3001');
});
```

## Features

- **🧠 Extended Thinking** - Real-time visibility into AI reasoning process
- **🔧 Tool Calling** - Built-in calculator, weather, and extensible tool system
- **⚡ SSE Streaming** - Real-time responses via Server-Sent Events
- **🎯 Drop-in Ready** - 3 lines of code to add to any Express app
- **🔌 Extensible** - Easy to add custom tools and functionality

## API Reference

### ReasoningAgent

```javascript
const agent = new ReasoningAgent({
  apiKey: 'your-anthropic-api-key',
  systemPrompt: 'Custom prompt...' // optional
});
```

### Built-in Tools

```javascript
import { addCommonTools } from 'drop-agent';
addCommonTools(agent); // Adds calculator + weather
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

### SSE Server Setup

```javascript
import { setupSSERoutes } from 'drop-agent';
setupSSERoutes(app, agent); // Adds /api/chat/stream endpoint
```

### Streaming Responses

```javascript
for await (const event of agent.streamResponse(message, options)) {
  console.log(event.type, event.content);
  // Events: thinking_delta, text_delta, tool_result, etc.
}
```

## Tool Registry

```javascript
import { ToolRegistry } from 'drop-agent';

const tools = new ToolRegistry();
tools.addToAgent(agent, 'calculator');
tools.addToAgent(agent, 'weather');
```

## Configuration Options

```javascript
const options = {
  model: 'claude-opus-4-20250514',
  maxTokens: 16000,
  thinkingBudget: 10000
};

agent.streamResponse(message, options);
```

## UI Components

For React chat interface, install the companion package:

```bash
npm install drop-agent-ui
```

```jsx
import { ChatInterface } from 'drop-agent-ui';
<ChatInterface serverUrl="http://localhost:3001" />
```

## Requirements

- Node.js 18+
- Anthropic API key
- Express.js (peer dependency)

## Full Documentation

- **GitHub**: https://github.com/rockymedure/drop-agent
- **Integration Guide**: Complete examples and advanced usage
- **Live Demo**: Working chat interface included

## License

MIT