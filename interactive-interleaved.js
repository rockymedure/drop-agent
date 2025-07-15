#!/usr/bin/env node

// Interactive Interleaved Thinking CLI
import readline from 'readline';
import fs from 'fs';
import ReasoningAgent from './packages/drop-agent/src/agent.js';

// Load .env file manually
try {
  const envContent = fs.readFileSync('server/.env', 'utf8');
  const lines = envContent.split('\n');
  lines.forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, value] = line.split('=');
      if (key && value) {
        process.env[key.trim()] = value.trim();
      }
    }
  });
} catch (error) {
  console.log('Could not load .env file:', error.message);
}

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'You: '
});

// Initialize agent with explicit API key
console.log('API key available:', process.env.ANTHROPIC_API_KEY ? 'Yes' : 'No');
console.log('API key length:', process.env.ANTHROPIC_API_KEY?.length || 0);

const agent = new ReasoningAgent({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Add tools
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

// Add web search
agent.addWebSearch({
  maxUses: 3,
  allowedDomains: ['wikipedia.org', 'github.com', 'stackoverflow.com'],
});

console.log('🤖 Drop Agent Interactive CLI with Interleaved Thinking');
console.log('Type your questions and watch Claude think step by step!');
console.log('Type "exit" or "quit" to stop.\n');

let isProcessing = false;

const processQuery = async (query) => {
  if (isProcessing) {
    console.log('⚠️  Already processing a query...');
    return;
  }

  if (query.toLowerCase() === 'exit' || query.toLowerCase() === 'quit') {
    console.log('👋 Goodbye!');
    process.exit(0);
  }

  isProcessing = true;
  
  // Clear visual separation
  console.log('\n' + '═'.repeat(80));
  console.log(`👤 REQUEST: "${query}"`);
  console.log('═'.repeat(80));

  let thinkingBlocks = 0;
  let toolCalls = 0;
  let currentThinking = '';
  let inResponse = false;

  try {
    for await (const event of agent.streamResponse(query)) {
      switch (event.type) {
        case 'thinking_start':
          thinkingBlocks++;
          currentThinking = '';
          console.log(`\n🧠 THINKING ${thinkingBlocks}:`);
          console.log('┌' + '─'.repeat(78) + '┐');
          process.stdout.write('│ ');
          break;

        case 'thinking_delta':
          currentThinking += event.content;
          // Show first 200 chars live
          if (currentThinking.length <= 200) {
            process.stdout.write(event.content);
          } else if (currentThinking.length === 201) {
            process.stdout.write('...');
          }
          break;

        case 'content_block_stop':
          if (currentThinking) {
            if (currentThinking.length > 200) {
              console.log(`\n│ [${currentThinking.length - 200} more characters...]`);
            }
            console.log('\n└' + '─'.repeat(78) + '┘');
            currentThinking = '';
          }
          break;

        case 'tool_result':
          toolCalls++;
          const toolIcon = event.tool === 'calculate' ? '🔢' : 
                          event.tool === 'get_weather' ? '🌤️' : 
                          event.tool === 'web_search' ? '🌐' : '⚒️';
          
          console.log(`\n${toolIcon} TOOL ${toolCalls}: ${event.tool.toUpperCase()}`);
          console.log('┌' + '─'.repeat(78) + '┐');
          console.log(`│ INPUT:  ${JSON.stringify(event.input)}`);
          console.log(`│ OUTPUT: ${event.result}`);
          console.log('└' + '─'.repeat(78) + '┘');
          break;

        case 'tool_error':
          console.log(`\n❌ TOOL ERROR: ${event.tool.toUpperCase()}`);
          console.log(`│ ERROR: ${event.error}`);
          break;

        case 'text_delta':
          if (!inResponse) {
            console.log(`\n💬 RESPONSE:`);
            console.log('┌' + '─'.repeat(78) + '┐');
            process.stdout.write('│ ');
            inResponse = true;
          }
          process.stdout.write(event.content);
          break;

        case 'web_search_query':
          console.log(`\n🌐 WEB SEARCH: "${event.query}"`);
          break;

        case 'web_search_result':
          console.log(`└─ Found ${event.content?.length || 0} results`);
          break;
      }
    }

    if (inResponse) {
      console.log('\n└' + '─'.repeat(78) + '┘');
    }

    // Summary
    console.log('\n' + '═'.repeat(80));
    console.log(`📊 SUMMARY: ${thinkingBlocks} thinking blocks, ${toolCalls} tool calls`);
    
    if (thinkingBlocks > 1) {
      console.log('✅ INTERLEAVED THINKING DETECTED!');
    } else {
      console.log('ℹ️  SINGLE THINKING BLOCK');
    }
    console.log('═'.repeat(80));

  } catch (error) {
    console.error(`\n❌ ERROR: ${error.message}`);
  }

  isProcessing = false;
  rl.prompt();
};

// Handle user input
rl.on('line', (input) => {
  const query = input.trim();
  if (query) {
    processQuery(query);
  } else {
    rl.prompt();
  }
});

rl.on('close', () => {
  console.log('\n👋 Goodbye!');
  process.exit(0);
});

// Start the CLI
rl.prompt();