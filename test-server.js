import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import ReasoningAgent from './packages/drop-agent/src/agent.js';
import { createCalculatorTool, createWeatherTool } from './packages/drop-agent/src/tools/index.js';
import { createSSEHandler } from './packages/drop-agent/src/sse.js';

dotenv.config();

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize the agent
const agent = new ReasoningAgent({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Add tools manually for testing
const calculator = createCalculatorTool();
agent.addTool(calculator.name, calculator.description, calculator.parameters, calculator.handler);

const weather = createWeatherTool();
agent.addTool(weather.name, weather.description, weather.parameters, weather.handler);

// SSE endpoint for streaming chat
app.post('/api/chat/stream', createSSEHandler(agent));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    tools: agent.listTools()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Test SSE Drop Agent Server running on port ${PORT}`);
  console.log(`📡 Streaming API available at http://localhost:${PORT}/api/chat/stream`);
  console.log(`🔧 Available tools: ${agent.listTools().join(', ')}`);
});

export default app;