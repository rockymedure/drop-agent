import Anthropic from '@anthropic-ai/sdk';

class ReasoningAgent {
  constructor(config = {}) {
    this.client = new Anthropic({
      apiKey: config.apiKey || process.env.ANTHROPIC_API_KEY
    });
    this.tools = new Map();
    this.systemPrompt = config.systemPrompt || this.getDefaultSystemPrompt();
  }

  getDefaultSystemPrompt() {
    return `You are Drop Agent, an intellectual explorer and thinking partner designed to help users discover insights and explore ideas deeply. Your role is to be genuinely curious, ask thoughtful questions, and help users uncover connections they might not have seen.

## Your Approach:
- **Think out loud**: Use your extended thinking to show your reasoning process, making your exploration transparent
- **Dig deeper**: Don't just answer questions - help users explore the implications, connections, and broader context
- **Challenge gently**: Question assumptions and suggest alternative perspectives in a constructive way
- **Connect dots**: Look for patterns, relationships, and unexpected connections between ideas
- **Stay curious**: Approach every topic with genuine curiosity and encourage the same in users

## Your Style:
- Be conversational and engaging, not formal or robotic
- Show your reasoning process through extended thinking
- Ask follow-up questions that open new avenues of exploration
- Offer multiple perspectives and encourage users to consider different angles
- Use tools strategically to enhance understanding, not just provide answers

## Your Goals:
- Help users discover insights they wouldn't find on their own
- Turn simple questions into rich explorations
- Encourage deeper thinking about complex topics
- Make the reasoning process transparent and educational
- Foster intellectual curiosity and critical thinking

Remember: You're not just answering questions - you're helping users think better and discover new possibilities.`;
  }

  addTool(name, description, parameters, handler) {
    this.tools.set(name, {
      name,
      description,
      input_schema: {
        type: "object",
        properties: parameters,
        required: Object.keys(parameters)
      },
      handler
    });
  }

  addWebSearch(config = {}) {
    // Add web search as a native Anthropic tool
    this.webSearchConfig = {
      type: "web_search_20250305",
      name: "web_search",
      max_uses: config.maxUses || 5,
      ...(config.allowedDomains && { allowed_domains: config.allowedDomains }),
      ...(config.blockedDomains && { blocked_domains: config.blockedDomains }),
      ...(config.userLocation && { user_location: config.userLocation })
    };
    return this;
  }

  removeTool(name) {
    return this.tools.delete(name);
  }

  getTool(name) {
    return this.tools.get(name);
  }

  listTools() {
    return Array.from(this.tools.keys());
  }

  setSystemPrompt(prompt) {
    this.systemPrompt = prompt;
  }

  async *streamResponse(message, options = {}) {
    const messages = Array.isArray(message) ? message : [{ role: "user", content: message }];
    
    const toolDefinitions = Array.from(this.tools.values()).map(tool => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.input_schema
    }));

    // Add web search tool if configured
    const tools = [...toolDefinitions];
    if (this.webSearchConfig) {
      tools.push(this.webSearchConfig);
    }

    let stream = this.client.messages.stream({
      model: options.model || "claude-sonnet-4-20250514",
      max_tokens: options.maxTokens || 16000,
      messages,
      system: this.systemPrompt,
      tools: tools.length > 0 ? tools : undefined,
      thinking: {
        type: "enabled",
        budget_tokens: options.thinkingBudget || 10000
      }
    });

    let toolCalls = [];
    let currentToolCall = null;
    let thinkingStarted = false;
    let responseStarted = false;

    for await (const event of stream) {
      if (event.type === 'content_block_start') {
        yield {
          type: 'content_block_start',
          blockType: event.content_block.type
        };
        // Reset flags for each new block
        thinkingStarted = false;
        responseStarted = false;
        
        if (event.content_block.type === 'tool_use') {
          currentToolCall = {
            id: event.content_block.id,
            name: event.content_block.name,
            input: ''
          };
        } else if (event.content_block.type === 'server_tool_use') {
          // Handle web search tool use
          currentToolCall = {
            id: event.content_block.id,
            name: event.content_block.name,
            input: '',
            isWebSearch: true
          };
          yield {
            type: 'web_search_start',
            tool: event.content_block.name,
            id: event.content_block.id
          };
        } else if (event.content_block.type === 'web_search_tool_result') {
          // Handle web search results
          yield {
            type: 'web_search_result',
            tool_use_id: event.content_block.tool_use_id,
            content: event.content_block.content
          };
        }
      } else if (event.type === 'content_block_delta') {
        if (event.delta.type === 'thinking_delta') {
          if (!thinkingStarted) {
            yield {
              type: 'thinking_start'
            };
            thinkingStarted = true;
          }
          yield {
            type: 'thinking_delta',
            content: event.delta.thinking
          };
        } else if (event.delta.type === 'text_delta') {
          if (!responseStarted) {
            yield {
              type: 'response_start'
            };
            responseStarted = true;
          }
          yield {
            type: 'text_delta',
            content: event.delta.text
          };
        } else if (event.delta.type === 'input_json_delta') {
          if (currentToolCall) {
            currentToolCall.input += event.delta.partial_json;
          }
        }
      } else if (event.type === 'content_block_stop') {
        if (currentToolCall) {
          try {
            currentToolCall.input = JSON.parse(currentToolCall.input);
            
            if (currentToolCall.isWebSearch) {
              // Emit web search query update
              yield {
                type: 'web_search_query',
                query: currentToolCall.input.query || 'web content'
              };
            } else {
              toolCalls.push(currentToolCall);
            }
          } catch (e) {
            console.error('Failed to parse tool input:', e);
          }
          currentToolCall = null;
        }
        yield {
          type: 'content_block_stop'
        };
      }
    }

    if (toolCalls.length > 0) {
      for (const toolCall of toolCalls) {
        const tool = this.tools.get(toolCall.name);
        if (tool) {
          try {
            const result = await tool.handler(toolCall.input);
            yield {
              type: 'tool_result',
              tool: toolCall.name,
              input: toolCall.input,
              result
            };
          } catch (error) {
            yield {
              type: 'tool_error',
              tool: toolCall.name,
              error: error.message
            };
          }
        }
      }
    }
  }

  async processMessage(message, options = {}) {
    let response = '';
    let thinking = '';
    let toolResults = [];

    for await (const event of this.streamResponse(message, options)) {
      if (event.type === 'thinking_delta') {
        thinking += event.content;
      } else if (event.type === 'text_delta') {
        response += event.content;
      } else if (event.type === 'tool_result') {
        toolResults.push(event);
      }
    }

    return {
      response,
      thinking,
      toolResults
    };
  }
}

export default ReasoningAgent;