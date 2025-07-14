# Reasoning Agent - Integration Guide

The reasoning agent is now modular and can be easily integrated into any project. Here's how to use it:

## Quick Start

### 1. Install Packages

```bash
# Core agent functionality
npm install drop-agent

# React UI components (optional)
npm install drop-agent-ui
```

### 2. Basic Server Setup

```javascript
import express from 'express';
import { ReasoningAgent, addCommonTools, setupSSERoutes } from 'drop-agent';

const app = express();
const agent = new ReasoningAgent({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Add built-in tools
addCommonTools(agent);

// Setup streaming endpoints
setupSSERoutes(app, agent);

app.listen(3001, () => {
  console.log('🚀 Reasoning Agent ready on port 3001');
});
```

### 3. React Integration

```jsx
import React from 'react';
import { ChatInterface } from 'drop-agent-ui';

function App() {
  return (
    <div className="h-screen">
      <ChatInterface 
        serverUrl="http://localhost:3001"
        title="My AI Assistant"
      />
    </div>
  );
}
```

## Package Structure

### drop-agent

**Main exports:**
- `ReasoningAgent` - Core agent class
- `addCommonTools()` - Adds calculator and weather tools
- `ToolRegistry` - Manage tools easily
- `setupSSERoutes()` - Express SSE endpoints
- `createSSEServer()` - Standalone server

### drop-agent-ui

**Main exports:**
- `ChatInterface` - Complete chat UI
- `ThinkingBlock` - Display reasoning process
- `ResponseBlock` - Display responses
- `useSSE` - React hook for SSE streaming

## Advanced Usage

### Custom Tools

```javascript
// Add your own tools
agent.addTool(
  'search_docs',
  'Search internal documentation',
  {
    query: { type: 'string', description: 'Search query' }
  },
  async ({ query }) => {
    // Your implementation
    return `Found 5 results for "${query}"`;
  }
);
```

### Tool Registry

```javascript
import { ToolRegistry } from 'drop-agent';

const tools = new ToolRegistry();

// Register custom tool factory
tools.register('my_tool', (config) => ({
  name: 'my_tool',
  description: 'Does something useful',
  parameters: { /* ... */ },
  handler: async (params) => { /* ... */ }
}));

// Add to agent
tools.addToAgent(agent, 'my_tool', { apiKey: 'xyz' });
```

### Custom System Prompt

```javascript
const agent = new ReasoningAgent({
  apiKey: process.env.ANTHROPIC_API_KEY,
  systemPrompt: `You are a specialized assistant for...`
});
```

### UI Customization

```jsx
import { ThinkingBlock, ResponseBlock, ChatInput } from 'drop-agent-ui';

function CustomChat() {
  return (
    <div>
      <ThinkingBlock 
        thinking={thinking} 
        className="my-custom-style"
        showTitle={false}
      />
      <ResponseBlock 
        content={response} 
        title="AI Assistant"
      />
      <ChatInput 
        onSend={handleSend}
        placeholder="Ask me anything..."
      />
    </div>
  );
}
```

## Configuration Options

### Agent Options

```javascript
const agent = new ReasoningAgent({
  apiKey: 'your-key',
  systemPrompt: 'Custom prompt...'
});
```

### Model Options

```javascript
// When sending messages
const options = {
  model: 'claude-opus-4-20250514',
  maxTokens: 16000,
  thinkingBudget: 10000
};

agent.streamResponse(message, options);
```

### SSE Server Options

```javascript
setupSSERoutes(app, agent, '/api'); // Custom base path

// Or create standalone server
createSSEServer(agent, {
  port: 3001,
  basePath: '/api'
});
```

## Examples

Check the `examples/` directory for:

- **simple-integration**: Basic setup with default tools
- **custom-tools**: Adding your own tools
- **ui-customization**: Custom React components

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

All components accept standard React props plus:

- `className` - Custom CSS classes
- `isStreaming` - Show streaming indicators
- `showTitle` - Display section titles

## TypeScript Support

TypeScript definitions are included. For better type safety:

```typescript
import { ReasoningAgent, ToolHandler } from 'drop-agent';

const handler: ToolHandler = async ({ query }) => {
  return `Result for ${query}`;
};
```

This modular structure lets you:
- ✅ Drop the agent into any Express app
- ✅ Use React components in any React project  
- ✅ Customize tools for your specific use case
- ✅ Scale from simple chatbot to complex agent system