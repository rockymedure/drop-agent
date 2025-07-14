import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import ReasoningAgent from './server/agent.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client/dist')));

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

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message, options = {} } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Set response headers for streaming
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    let fullResponse = '';
    let fullThinking = '';
    let toolResults = [];

    try {
      for await (const event of agent.streamResponse(message, options)) {
        if (event.type === 'thinking_delta') {
          fullThinking += event.content;
        } else if (event.type === 'text_delta') {
          fullResponse += event.content;
        } else if (event.type === 'tool_result') {
          toolResults.push(event);
        }
      }

      res.json({
        response: fullResponse,
        thinking: fullThinking,
        toolResults,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Agent error:', error);
      res.status(500).json({ error: error.message });
    }

  } catch (error) {
    console.error('Request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Simple Reasoning Agent Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`🌐 Frontend will be available at http://localhost:${PORT} after build`);
});