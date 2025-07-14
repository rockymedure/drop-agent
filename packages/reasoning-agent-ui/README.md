# drop-agent-ui

React components for AI reasoning agent chat interfaces. Pre-built UI components that work seamlessly with `drop-agent` for instant chat experiences with extended thinking visualization.

## Quick Start

```bash
npm install drop-agent-ui
```

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

## Features

- **💬 Complete Chat Interface** - Full-featured chat UI out of the box
- **🧠 Thinking Visualization** - Shows AI reasoning process in real-time
- **🔧 Tool Results Display** - Highlights tool usage with clear formatting
- **⚡ Real-time Streaming** - SSE-powered live responses
- **🎨 Customizable** - Style with CSS classes and props
- **📱 Responsive** - Works on desktop and mobile

## Components

### ChatInterface (Complete Solution)

```jsx
import { ChatInterface } from 'drop-agent-ui';

<ChatInterface 
  serverUrl="http://localhost:3001"
  title="My Reasoning Agent"
  modelOptions={{
    model: 'claude-opus-4-20250514',
    maxTokens: 16000,
    thinkingBudget: 10000
  }}
  className="custom-chat"
/>
```

### Individual Components

```jsx
import { 
  ThinkingBlock,
  ResponseBlock,
  ToolResults,
  UserMessage,
  ChatInput,
  useSSE
} from 'drop-agent-ui';

function CustomChat() {
  const { sendMessage } = useSSE('http://localhost:3001');
  
  return (
    <div>
      <ThinkingBlock 
        thinking={thinking} 
        isStreaming={true}
        className="my-thinking-style"
      />
      
      <ToolResults toolResults={results} />
      
      <ResponseBlock 
        content={response}
        title="AI Assistant"
        isStreaming={true}
      />
      
      <ChatInput 
        onSend={handleSend}
        placeholder="Ask me anything..."
        disabled={processing}
      />
    </div>
  );
}
```

### useSSE Hook

```jsx
import { useSSE } from 'drop-agent-ui';

function MyComponent() {
  const { sendMessage, isConnected, error } = useSSE('http://localhost:3001');
  
  const handleChat = async (message) => {
    await sendMessage(message, options, (data) => {
      // Handle streaming events
      if (data.type === 'thinking_delta') {
        setThinking(prev => prev + data.content);
      } else if (data.type === 'text_delta') {
        setResponse(prev => prev + data.content);
      }
    });
  };
}
```

## Component Props

### ChatInterface
- `serverUrl` - Backend server URL (required)
- `title` - Chat header title
- `modelOptions` - Claude model configuration
- `className` - Custom CSS classes

### ThinkingBlock
- `thinking` - Thinking content string
- `isStreaming` - Show typing indicator
- `className` - Custom styling
- `showTitle` - Display "Thinking:" header

### ResponseBlock
- `content` - Response text
- `isStreaming` - Show typing indicator
- `title` - Custom title (default: "Assistant")
- `className` - Custom styling

### ChatInput
- `onSend` - Callback when message sent
- `disabled` - Disable input during processing
- `placeholder` - Input placeholder text

## Styling

All components accept `className` props for custom styling. The default styles use Tailwind-like classes but can be overridden:

```jsx
<ThinkingBlock 
  thinking={content}
  className="my-custom-thinking-style bg-blue-50 p-4"
/>
```

## Server Setup

This UI package requires a backend server running `drop-agent`:

```bash
npm install drop-agent
```

```javascript
import { ReasoningAgent, addCommonTools, setupSSERoutes } from 'drop-agent';

const agent = new ReasoningAgent({ apiKey: process.env.ANTHROPIC_API_KEY });
addCommonTools(agent);
setupSSERoutes(app, agent);
```

## Requirements

- React 18+
- Backend server with `drop-agent`

## Full Documentation

- **GitHub**: https://github.com/rockymedure/drop-agent
- **Core Package**: `drop-agent` for backend functionality
- **Integration Guide**: Complete setup examples

## License

MIT