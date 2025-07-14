/**
 * Server-Sent Events utilities for streaming reasoning agent responses
 */

export const createSSEHandler = (agent) => {
  return async (req, res) => {
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
  };
};

export const setupSSERoutes = (app, agent, basePath = '/api') => {
  // Enable CORS for all routes
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // JSON parsing middleware - assume express is available in the app context
  app.use((req, res, next) => {
    if (req.headers['content-type'] === 'application/json') {
      let data = '';
      req.on('data', chunk => data += chunk);
      req.on('end', () => {
        try {
          req.body = JSON.parse(data);
        } catch (e) {
          req.body = {};
        }
        next();
      });
    } else {
      next();
    }
  });

  // Chat streaming endpoint
  app.post(`${basePath}/chat/stream`, createSSEHandler(agent));

  // Health check endpoint
  app.get(`${basePath}/health`, (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      tools: agent.listTools()
    });
  });

  // Agent info endpoint
  app.get(`${basePath}/agent/info`, (req, res) => {
    res.json({
      tools: agent.listTools(),
      systemPrompt: agent.systemPrompt.substring(0, 200) + '...'
    });
  });

  return app;
};

// Standalone SSE server creator - requires express to be passed in
export const createSSEServer = async (agent, config = {}) => {
  // Dynamic import for ESM compatibility
  const express = (await import('express')).default;
  const cors = (await import('cors')).default;
  
  const app = express();
  const port = config.port || 3001;
  const basePath = config.basePath || '/api';

  // Basic middleware
  app.use(cors());
  app.use(express.json());
  
  // Setup SSE routes
  setupSSERoutes(app, agent, basePath);

  const server = app.listen(port, () => {
    console.log(`🚀 Reasoning Agent SSE Server running on port ${port}`);
    console.log(`📡 Streaming API available at http://localhost:${port}${basePath}/chat/stream`);
  });

  return { app, server };
};

export default { createSSEHandler, setupSSERoutes, createSSEServer };