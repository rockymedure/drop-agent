import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import ReasoningAgent from '../packages/drop-agent/src/agent.js';
import { 
  summarizeContent, 
  extractConcepts, 
  analyzeCanvas, 
  suggestConnections, 
  organizeCards 
} from './canvas-intelligence.js';

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

agent.addTool(
  'fetch_url',
  'Fetch content from a URL to get better information',
  {
    url: { type: 'string', description: 'URL to fetch content from' }
  },
  async ({ url }) => {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Drop Agent/1.0)'
        },
        timeout: 10000
      });
      
      if (!response.ok) {
        return `Error fetching ${url}: ${response.status} ${response.statusText}`;
      }
      
      const html = await response.text();
      
      // Extract useful content from HTML
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : '';
      
      // Extract meta description
      const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i);
      const description = descMatch ? descMatch[1].trim() : '';
      
      // Extract some text content (remove HTML tags)
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      let textContent = '';
      if (bodyMatch) {
        textContent = bodyMatch[1]
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .substring(0, 500);
      }
      
      return JSON.stringify({
        title,
        description,
        content: textContent,
        url
      });
    } catch (error) {
      return `Error fetching ${url}: ${error.message}`;
    }
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

// Canvas Intelligence Endpoints
app.post('/api/summarize', async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }
    
    const result = await summarizeContent(content);
    res.json(result);
  } catch (error) {
    console.error('Error in summarize endpoint:', error);
    res.status(500).json({ error: 'Failed to summarize content' });
  }
});

app.post('/api/extract-concepts', async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }
    
    const result = await extractConcepts(content);
    res.json(result);
  } catch (error) {
    console.error('Error in extract-concepts endpoint:', error);
    res.status(500).json({ error: 'Failed to extract concepts' });
  }
});

app.post('/api/canvas-analysis', async (req, res) => {
  try {
    const { cards } = req.body;
    if (!cards || !Array.isArray(cards)) {
      return res.status(400).json({ error: 'Cards array is required' });
    }
    
    const result = await analyzeCanvas(cards);
    res.json(result);
  } catch (error) {
    console.error('Error in canvas-analysis endpoint:', error);
    res.status(500).json({ error: 'Failed to analyze canvas' });
  }
});

app.post('/api/suggest-connections', async (req, res) => {
  try {
    const { cards } = req.body;
    if (!cards || !Array.isArray(cards)) {
      return res.status(400).json({ error: 'Cards array is required' });
    }
    
    const result = await suggestConnections(cards);
    res.json(result);
  } catch (error) {
    console.error('Error in suggest-connections endpoint:', error);
    res.status(500).json({ error: 'Failed to suggest connections' });
  }
});

app.post('/api/organize-cards', async (req, res) => {
  try {
    const { cards } = req.body;
    if (!cards || !Array.isArray(cards)) {
      return res.status(400).json({ error: 'Cards array is required' });
    }
    
    const result = await organizeCards(cards);
    res.json(result);
  } catch (error) {
    console.error('Error in organize-cards endpoint:', error);
    res.status(500).json({ error: 'Failed to organize cards' });
  }
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