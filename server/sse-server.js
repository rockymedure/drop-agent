import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import ReasoningAgent from '../packages/drop-agent/src/agent.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize the agent
const agent = new ReasoningAgent();

// Add default tools
agent.addTool(
  'calculate',
  'Perform mathematical calculations',
  {
    expression: { type: 'string', description: 'Mathematical expression to evaluate' }
  },
  async ({ expression }) => {
    try {
      const result = eval(expression);
      return `The result of ${expression} is ${result}`;
    } catch (error) {
      return `Error calculating ${expression}: ${error.message}`;
    }
  }
);

agent.addTool(
  'get_weather',
  'Get weather information for a location',
  {
    location: { type: 'string', description: 'City name or location' }
  },
  async ({ location }) => {
    return `Weather in ${location}: Sunny, 72°F (simulated response)`;
  }
);

// Add web search capability
agent.addWebSearch({
  maxUses: 5,
  // Optional: Add domain filtering or location
  // allowedDomains: ['wikipedia.org', 'github.com'],
  // userLocation: { type: 'approximate', city: 'San Francisco', region: 'California', country: 'US' }
});

// Add MCP fetch server for web browsing
// To use this, you need to run the MCP fetch server locally or deploy it
// GitHub: https://github.com/modelcontextprotocol/servers/tree/main/src/fetch
// agent.addMCP('fetch', 'http://localhost:8080');

// Example of how to add multiple MCP servers:
// agent.addMCP('filesystem', 'https://your-mcp-server.com/files');
// agent.addMCP('database', 'https://your-mcp-server.com/db');

// SSE endpoint for streaming chat
app.post('/api/chat/stream', async (req, res) => {
  const { message, options = {} } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const sendEvent = (event, data) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    sendEvent('start', { message: 'Processing...' });

    for await (const event of agent.streamResponse(message, options)) {
      sendEvent('chunk', event);
    }

    sendEvent('end', { message: 'Complete' });
  } catch (error) {
    console.error('Streaming error:', error);
    sendEvent('error', { error: error.message });
  }

  res.end();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    tools: agent.listTools(),
    mcpServers: agent.listMCPServers()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 SSE Reasoning Agent Server running on port ${PORT}`);
  console.log(`📡 Streaming API available at http://localhost:${PORT}/api/chat/stream`);
});