import ReasoningAgent from './agent.js';

const agent = new ReasoningAgent();

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

async function main() {
  console.log('🤖 Reasoning Agent Started');
  console.log('Available tools: calculate, get_weather');
  console.log('Type "exit" to quit\n');

  const readline = await import('readline/promises');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  while (true) {
    try {
      const input = await rl.question('You: ');
      
      if (input.toLowerCase() === 'exit') {
        break;
      }

      console.log('Agent: ');
      for await (const event of agent.streamResponse(input)) {
        if (event.type === 'content_block_start') {
          console.log(`\nStarting ${event.blockType} block...`);
        } else if (event.type === 'thinking_start') {
          process.stdout.write('\x1b[90mThinking: \x1b[0m');
        } else if (event.type === 'thinking_delta') {
          process.stdout.write(`\x1b[90m${event.content}\x1b[0m`);
        } else if (event.type === 'response_start') {
          process.stdout.write('\nResponse: ');
        } else if (event.type === 'text_delta') {
          process.stdout.write(event.content);
        } else if (event.type === 'content_block_stop') {
          console.log('\nBlock complete.');
        } else if (event.type === 'tool_result') {
          console.log(`🔧 Used ${event.tool}: ${event.result}`);
        } else if (event.type === 'tool_error') {
          console.log(`❌ Tool error (${event.tool}): ${event.error}`);
        }
      }
      console.log('\n');
    } catch (error) {
      console.error('Error:', error.message);
    }
  }

  rl.close();
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  main();
}