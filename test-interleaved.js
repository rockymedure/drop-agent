// Test interleaved thinking functionality
import ReasoningAgent from './packages/drop-agent/src/agent.js';

const agent = new ReasoningAgent();

// Add calculator tool
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

// Add weather tool
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

async function testInterleaved() {
  console.log('Testing interleaved thinking...');
  
  // Test with a query that should trigger multiple tool calls with thinking between them
  const query = "Calculate 150 * 50, then if the result is over 5000, tell me the weather in San Francisco";
  
  console.log(`\nUser: ${query}\n`);
  
  let thinkingBlocks = [];
  let toolCalls = [];
  let responses = [];
  
  for await (const event of agent.streamResponse(query)) {
    if (event.type === 'thinking_delta') {
      if (thinkingBlocks.length === 0 || thinkingBlocks[thinkingBlocks.length - 1].complete) {
        thinkingBlocks.push({ content: event.content, complete: false });
      } else {
        thinkingBlocks[thinkingBlocks.length - 1].content += event.content;
      }
    } else if (event.type === 'thinking_start') {
      console.log(`🧠 Thinking...`);
    } else if (event.type === 'content_block_stop') {
      if (thinkingBlocks.length > 0 && !thinkingBlocks[thinkingBlocks.length - 1].complete) {
        thinkingBlocks[thinkingBlocks.length - 1].complete = true;
        console.log(`🧠 Thinking complete: ${thinkingBlocks[thinkingBlocks.length - 1].content.substring(0, 100)}...`);
      }
    } else if (event.type === 'tool_result') {
      toolCalls.push(event);
      console.log(`🔧 Tool: ${event.tool} → ${event.result}`);
    } else if (event.type === 'text_delta') {
      if (responses.length === 0) {
        responses.push(event.content);
      } else {
        responses[0] += event.content;
      }
    }
  }
  
  console.log(`\n💬 Final response: ${responses[0] || 'No response'}`);
  console.log(`\nSummary:`);
  console.log(`- Thinking blocks: ${thinkingBlocks.length}`);
  console.log(`- Tool calls: ${toolCalls.length}`);
  console.log(`- Final response: ${responses.length > 0 ? 'Yes' : 'No'}`);
  
  // Check if we got interleaved thinking (thinking blocks after tool calls)
  if (thinkingBlocks.length > 1) {
    console.log('✅ Interleaved thinking detected!');
  } else {
    console.log('❌ No interleaved thinking detected');
  }
}

testInterleaved().catch(console.error);