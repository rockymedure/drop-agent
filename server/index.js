import express from 'express';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import ReasoningAgent from './agent.js';
import { createServer } from 'http';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

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

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'chat_message') {
        const { message: userMessage, options = {} } = data;
        
        // Send acknowledgment
        ws.send(JSON.stringify({ type: 'message_start' }));
        
        try {
          // Stream the response
          for await (const event of agent.streamResponse(userMessage, options)) {
            ws.send(JSON.stringify(event));
          }
          
          // Send completion signal
          ws.send(JSON.stringify({ type: 'message_complete' }));
        } catch (error) {
          ws.send(JSON.stringify({ 
            type: 'error', 
            error: error.message 
          }));
        }
      } else if (data.type === 'get_tools') {
        // Send available tools
        const tools = Array.from(agent.tools.values()).map(tool => ({
          name: tool.name,
          description: tool.description,
          parameters: tool.input_schema.properties
        }));
        
        ws.send(JSON.stringify({ 
          type: 'tools_list', 
          tools 
        }));
      }
    } catch (error) {
      console.error('WebSocket error:', error);
      ws.send(JSON.stringify({ 
        type: 'error', 
        error: 'Invalid message format' 
      }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// REST API endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/tools', (req, res) => {
  const tools = Array.from(agent.tools.values()).map(tool => ({
    name: tool.name,
    description: tool.description,
    parameters: tool.input_schema.properties
  }));
  
  res.json({ tools });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Reasoning Agent Server running on port ${PORT}`);
  console.log(`🔗 WebSocket available at ws://localhost:${PORT}`);
  console.log(`📡 REST API available at http://localhost:${PORT}/api`);
});