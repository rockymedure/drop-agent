import express from 'express';
import dotenv from 'dotenv';
import { ReasoningAgent, setupSSERoutes, ToolRegistry } from 'drop-agent';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Initialize agent
const agent = new ReasoningAgent({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Create tool registry for easy management
const toolRegistry = new ToolRegistry();

// Add built-in tools
toolRegistry.addToAgent(agent, 'calculator');
toolRegistry.addToAgent(agent, 'weather');

// Add custom tools
agent.addTool(
  'file_info',
  'Get information about a file or directory',
  {
    path: { type: 'string', description: 'File or directory path' }
  },
  async ({ path }) => {
    try {
      const fs = await import('fs');
      const stats = fs.statSync(path);
      
      if (stats.isDirectory()) {
        const files = fs.readdirSync(path);
        return `Directory "${path}" contains ${files.length} items: ${files.slice(0, 5).join(', ')}${files.length > 5 ? '...' : ''}`;
      } else {
        return `File "${path}" is ${stats.size} bytes, modified ${stats.mtime.toLocaleDateString()}`;
      }
    } catch (error) {
      return `Error accessing "${path}": ${error.message}`;
    }
  }
);

agent.addTool(
  'timestamp',
  'Get current timestamp in various formats',
  {
    format: { 
      type: 'string', 
      description: 'Format: "iso", "unix", or "readable"' 
    }
  },
  async ({ format = 'readable' }) => {
    const now = new Date();
    switch (format.toLowerCase()) {
      case 'iso':
        return now.toISOString();
      case 'unix':
        return Math.floor(now.getTime() / 1000).toString();
      case 'readable':
      default:
        return now.toLocaleString();
    }
  }
);

// Setup SSE routes
setupSSERoutes(app, agent);

app.listen(port, () => {
  console.log(`🚀 Custom Tools Reasoning Agent on port ${port}`);
  console.log(`🔧 Available tools: ${agent.listTools().join(', ')}`);
});

export default app;