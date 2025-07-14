# Reasoning Agent - Browser Chat Interface

A modern browser-based chat interface for an AI reasoning agent with extended thinking capabilities, inspired by Claude Desktop.

> **🚀 Want to use this agent in your own project?** See the [Integration Guide](README-integration.md) for drop-in instructions!

## Features

- **🧠 Extended Thinking**: Real-time visibility into AI reasoning process
- **🔧 Tool Integration**: Calculator, weather, and extensible tool system
- **⚡ Real-time Streaming**: Server-Sent Events (SSE) streaming for instant responses
- **🎨 Modern UI**: Clean, responsive design inspired by Claude Desktop
- **⚙️ Configurable**: Adjustable model settings, token limits, and thinking budget
- **💬 Chat History**: Persistent conversation history with timestamps
- **📱 Responsive**: Works on desktop and mobile devices

## Architecture

```
┌─────────────────┐     Server-Sent     ┌─────────────────┐
│   React Client  │     Events (SSE)    │  Express Server │
│   Port 3000     │ ◄─────────────────► │   Port 3001     │
│                 │                     │                 │
│ • Chat UI       │                     │ • Agent Logic   │
│ • SSE Consumer  │                     │ • Tools         │
│ • State Mgmt    │                     │ • API Bridge    │
└─────────────────┘                     └─────────────────┘
```

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment:**
   ```bash
   # Create server/.env with your Anthropic API key
   echo "ANTHROPIC_API_KEY=your-api-key-here" > server/.env
   ```

3. **Start development servers:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## Available Scripts

- `npm run dev` - Start both client and server in development mode
- `npm run server` - Start only the server
- `npm run client` - Start only the client
- `npm run cli` - Use the original CLI interface
- `npm run build` - Build the client for production

## Usage

### Chat Interface

1. **Send Messages**: Type in the input area and press Enter
2. **View Thinking**: Click the "Thinking" section to expand/collapse reasoning
3. **Tool Usage**: See real-time tool calls and results
4. **Settings**: Click the gear icon to configure model and parameters

### Configuration Options

- **Model**: Choose between Claude Opus 4 and Sonnet 4
- **Max Tokens**: Set the maximum response length (1,000 - 200,000)
- **Thinking Budget**: Control reasoning depth (1,000 - 50,000 tokens)
- **Show Thinking**: Toggle visibility of reasoning process

### Available Tools

- **Calculator**: Perform mathematical calculations
- **Weather**: Get weather information (simulated)
- **Extensible**: Easy to add more tools via the server API

## Development

### Adding New Tools

Add tools to the server in `server/sse-server.js`:

```javascript
agent.addTool(
  'tool_name',
  'Description of what the tool does',
  {
    param1: { type: 'string', description: 'Parameter description' }
  },
  async ({ param1 }) => {
    // Tool implementation
    return 'Tool result';
  }
);
```

### UI Customization

The interface uses Tailwind CSS with custom Claude Desktop-inspired styling:

- **Colors**: Defined in `client/tailwind.config.js`
- **Components**: Modular React components in `client/src/components/`
- **Animations**: Custom typing indicators and loading states

## Technical Details

### Server-Sent Events (SSE)

The real-time communication uses these SSE event types:

- `start` - Processing begins
- `chunk` - Contains streaming data with type and content
  - `content_block_start` - New content block begins
  - `thinking_delta` - Incremental thinking content
  - `text_delta` - Incremental response text
  - `tool_result` - Tool execution result
  - `content_block_stop` - Content block ends
- `end` - Message processing complete
- `error` - Error occurred during processing

### Extended Thinking Integration

The system fully implements Anthropic's extended thinking specification:

- **Streaming**: Real-time thinking and response streaming
- **Token Management**: Configurable thinking budget
- **Event Handling**: Proper content block lifecycle
- **Error Handling**: Graceful degradation and reconnection

## Security Notes

- API keys are stored server-side only
- Client-server communication over Server-Sent Events
- No sensitive data stored in browser
- CORS configured for development

## Browser Support

- Chrome 90+
- Firefox 90+
- Safari 14+
- Edge 90+

## Troubleshooting

### Connection Issues
- Check if server is running on port 3001
- Verify API key is set in `server/.env`
- Check browser console for SSE connection errors
- Ensure ports 3000 and 3001 are available

### Performance
- Reduce thinking budget for faster responses
- Lower max tokens for shorter responses
- Use Claude Sonnet 4 for faster processing

## CLI Mode

The original terminal interface is still available:

```bash
npm run cli
```

This provides the same functionality in a command-line format for development and testing.

## Using This Agent in Your Project

This reasoning agent is now modular and ready for integration into any project:

### **📦 Available Packages**
- **`packages/reasoning-agent/`** - Core agent functionality
- **`packages/reasoning-agent-ui/`** - React chat components
- **`examples/`** - Integration examples

### **🚀 Quick Integration**
```javascript
// 3-line server setup
const agent = new ReasoningAgent({ apiKey: process.env.ANTHROPIC_API_KEY });
addCommonTools(agent);
setupSSERoutes(app, agent);
```

```jsx
// 2-line React integration  
import { ChatInterface } from '@reasoning-agent/ui';
<ChatInterface serverUrl="http://localhost:3001" />
```

**→ Full instructions: [Integration Guide](README-integration.md)**

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details