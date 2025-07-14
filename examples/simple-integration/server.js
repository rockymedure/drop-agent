import express from 'express';
import dotenv from 'dotenv';
import { ReasoningAgent, addCommonTools, setupSSERoutes } from '@reasoning-agent/core';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const port = process.env.PORT || 3001;

// Initialize the reasoning agent
const agent = new ReasoningAgent({
  apiKey: process.env.ANTHROPIC_API_KEY,
  // Optional: customize system prompt
  // systemPrompt: "You are a helpful assistant..."
});

// Add common tools (calculator, weather)
addCommonTools(agent);

// Setup SSE routes
setupSSERoutes(app, agent);

// Start server
app.listen(port, () => {
  console.log(`🚀 Reasoning Agent server running on port ${port}`);
  console.log(`📡 Chat API: http://localhost:${port}/api/chat/stream`);
  console.log(`🏥 Health check: http://localhost:${port}/api/health`);
});

export default app;