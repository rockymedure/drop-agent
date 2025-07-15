import Anthropic from '@anthropic-ai/sdk';

class ReasoningAgent {
  constructor(config = {}) {
    this.client = new Anthropic({
      apiKey: config.apiKey || process.env.ANTHROPIC_API_KEY
    });
    this.tools = new Map();
    this.mcpServers = [];
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

  addMCP(name, baseUrl, auth = null) {
    this.mcpServers.push({
      name,
      base_url: baseUrl,
      ...(auth && { auth })
    });
    console.log(`✅ MCP server added: ${name} (${baseUrl})`);
    return this;
  }

  removeMCP(name) {
    this.mcpServers = this.mcpServers.filter(server => server.name !== name);
    return this;
  }

  listMCPServers() {
    return this.mcpServers.map(server => server.name);
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
    
    // Initialize conversation flow logger
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const flowLog = {
      id: conversationId,
      startTime: new Date().toISOString(),
      events: [],
      phases: []
    };
    
    const logEvent = (type, data = {}) => {
      const event = {
        timestamp: new Date().toISOString(),
        timeOffset: Date.now() - new Date(flowLog.startTime).getTime(),
        type,
        phase: flowLog.phases.length > 0 ? flowLog.phases[flowLog.phases.length - 1].phase : 'initialization',
        ...data
      };
      flowLog.events.push(event);
      console.log(`[${conversationId}] ${event.timeOffset}ms: ${type}`, data);
    };
    
    logEvent('conversation_start', { 
      messageCount: messages.length,
      lastMessage: messages[messages.length - 1]?.content?.substring(0, 100) + '...'
    });
    
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

    logEvent('tools_configured', { toolCount: tools.length, toolNames: tools.map(t => t.name) });

    // PHASE 1: Initial request to get thinking + tool_use blocks
    flowLog.phases.push({ phase: 'phase_1_initial', startTime: new Date().toISOString() });
    logEvent('api_call_start', { 
      model: options.model || "claude-sonnet-4-20250514",
      maxTokens: options.maxTokens || 16000,
      thinkingBudget: options.thinkingBudget || 10000
    });
    
    let stream = this.client.beta.messages.stream({
      model: options.model || "claude-sonnet-4-20250514",
      max_tokens: options.maxTokens || 16000,
      messages,
      system: this.systemPrompt,
      tools: tools.length > 0 ? tools : undefined,
      ...(this.mcpServers.length > 0 && { mcp: { servers: this.mcpServers } }),
      thinking: {
        type: "enabled",
        budget_tokens: options.thinkingBudget || 10000
      },
      betas: ["interleaved-thinking-2025-05-14"]
    });

    let toolCalls = [];
    let currentToolCall = null;
    let thinkingStarted = false;
    let responseStarted = false;
    
    // Capture the complete assistant message content as Claude generates it
    let assistantContent = [];
    let currentThinkingBlock = null;
    let currentTextBlock = null;

    for await (const event of stream) {
      if (event.type === 'content_block_start') {
        logEvent('content_block_start', { blockType: event.content_block.type });
        
        yield {
          type: 'content_block_start',
          blockType: event.content_block.type
        };
        // Reset flags for each new block
        thinkingStarted = false;
        responseStarted = false;
        
        if (event.content_block.type === 'thinking') {
          logEvent('thinking_block_start');
          currentThinkingBlock = {
            type: 'thinking',
            thinking: '',
            signature: ''
          };
        } else if (event.content_block.type === 'text') {
          logEvent('text_block_start');
          currentTextBlock = {
            type: 'text',
            text: ''
          };
        } else if (event.content_block.type === 'tool_use') {
          logEvent('tool_use_block_start', { toolName: event.content_block.name, toolId: event.content_block.id });
          currentToolCall = {
            id: event.content_block.id,
            name: event.content_block.name,
            input: ''
          };
        } else if (event.content_block.type === 'server_tool_use') {
          // Handle web search tool use
          logEvent('web_search_block_start', { toolName: event.content_block.name, toolId: event.content_block.id });
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
          logEvent('web_search_result_block', { toolUseId: event.content_block.tool_use_id });
          yield {
            type: 'web_search_result',
            tool_use_id: event.content_block.tool_use_id,
            content: event.content_block.content
          };
        }
      } else if (event.type === 'content_block_delta') {
        if (event.delta.type === 'thinking_delta') {
          if (!thinkingStarted) {
            logEvent('thinking_start');
            yield {
              type: 'thinking_start'
            };
            thinkingStarted = true;
          }
          logEvent('thinking_delta', { contentLength: event.delta.thinking.length });
          yield {
            type: 'thinking_delta',
            content: event.delta.thinking
          };
          // Capture thinking content
          if (currentThinkingBlock) {
            currentThinkingBlock.thinking += event.delta.thinking;
          }
        } else if (event.delta.type === 'text_delta') {
          if (!responseStarted) {
            logEvent('response_start');
            yield {
              type: 'response_start'
            };
            responseStarted = true;
          }
          logEvent('text_delta', { contentLength: event.delta.text.length });
          yield {
            type: 'text_delta',
            content: event.delta.text
          };
          // Capture text content
          if (currentTextBlock) {
            currentTextBlock.text += event.delta.text;
          }
        } else if (event.delta.type === 'input_json_delta') {
          logEvent('tool_input_delta', { jsonLength: event.delta.partial_json.length });
          if (currentToolCall) {
            currentToolCall.input += event.delta.partial_json;
          }
        } else if (event.delta.type === 'signature_delta') {
          // Capture signature for thinking blocks
          if (currentThinkingBlock) {
            currentThinkingBlock.signature += event.delta.signature;
          }
        }
      } else if (event.type === 'content_block_stop') {
        if (currentThinkingBlock) {
          logEvent('thinking_block_complete', { contentLength: currentThinkingBlock.thinking.length });
          assistantContent.push(currentThinkingBlock);
          currentThinkingBlock = null;
        } else if (currentTextBlock) {
          logEvent('text_block_complete', { contentLength: currentTextBlock.text.length });
          assistantContent.push(currentTextBlock);
          currentTextBlock = null;
        } else if (currentToolCall) {
          try {
            currentToolCall.input = JSON.parse(currentToolCall.input);
            
            if (currentToolCall.isWebSearch) {
              logEvent('web_search_query_parsed', { query: currentToolCall.input.query || 'web content' });
              // Emit web search query update
              yield {
                type: 'web_search_query',
                query: currentToolCall.input.query || 'web content'
              };
            } else {
              logEvent('tool_call_parsed', { toolName: currentToolCall.name, input: currentToolCall.input });
              toolCalls.push(currentToolCall);
              // Add tool use to assistant content
              assistantContent.push({
                type: 'tool_use',
                id: currentToolCall.id,
                name: currentToolCall.name,
                input: currentToolCall.input
              });
            }
          } catch (e) {
            logEvent('tool_input_parse_error', { error: e.message });
            console.error('Failed to parse tool input:', e);
          }
          currentToolCall = null;
        }
        yield {
          type: 'content_block_stop'
        };
      }
    }

    // PHASE 2: If we have tool calls, execute them and continue conversation
    if (toolCalls.length > 0) {
      flowLog.phases.push({ phase: 'phase_2_tool_execution', startTime: new Date().toISOString() });
      logEvent('tool_execution_start', { toolCount: toolCalls.length });
      
      // Execute tools and collect results
      const toolResults = [];
      for (const toolCall of toolCalls) {
        const tool = this.tools.get(toolCall.name);
        if (tool) {
          try {
            logEvent('tool_execution_begin', { toolName: toolCall.name, input: toolCall.input });
            const result = await tool.handler(toolCall.input);
            logEvent('tool_execution_success', { toolName: toolCall.name, resultLength: result.length });
            toolResults.push({
              type: 'tool_result',
              tool_use_id: toolCall.id,
              content: result
            });
            yield {
              type: 'tool_result',
              tool: toolCall.name,
              input: toolCall.input,
              result
            };
          } catch (error) {
            logEvent('tool_execution_error', { toolName: toolCall.name, error: error.message });
            toolResults.push({
              type: 'tool_result',
              tool_use_id: toolCall.id,
              content: error.message,
              is_error: true
            });
            yield {
              type: 'tool_error',
              tool: toolCall.name,
              error: error.message
            };
          }
        }
      }

      // PHASE 3: Continue conversation with tool results
      flowLog.phases.push({ phase: 'phase_3_continuation', startTime: new Date().toISOString() });
      logEvent('continuation_start', { toolResultCount: toolResults.length });
      
      const updatedMessages = [
        ...messages,
        { role: 'assistant', content: assistantContent },
        { role: 'user', content: toolResults }
      ];

      logEvent('continuation_api_call', { messageCount: updatedMessages.length });
      
      // Start a new stream with the tool results
      const continuationStream = this.client.beta.messages.stream({
        model: options.model || "claude-sonnet-4-20250514",
        max_tokens: options.maxTokens || 16000,
        messages: updatedMessages,
        system: this.systemPrompt,
        tools: tools.length > 0 ? tools : undefined,
        ...(this.mcpServers.length > 0 && { mcp: { servers: this.mcpServers } }),
        thinking: {
          type: "enabled",
          budget_tokens: options.thinkingBudget || 10000
        },
        betas: ["interleaved-thinking-2025-05-14"]
      });

      // Stream the continuation response
      let continuationAssistantContent = [];
      let continuationCurrentThinkingBlock = null;
      let continuationCurrentTextBlock = null;
      let continuationToolCalls = [];
      let continuationCurrentToolCall = null;
      let continuationThinkingStarted = false;
      let continuationResponseStarted = false;
      
      for await (const event of continuationStream) {
        if (event.type === 'content_block_start') {
          logEvent('continuation_content_block_start', { blockType: event.content_block.type });
          yield {
            type: 'content_block_start',
            blockType: event.content_block.type
          };
          
          if (event.content_block.type === 'thinking') {
            logEvent('continuation_thinking_block_start');
            continuationCurrentThinkingBlock = {
              type: 'thinking',
              thinking: '',
              signature: ''
            };
            // Reset thinking flag for new block
            continuationThinkingStarted = false;
          } else if (event.content_block.type === 'text') {
            logEvent('continuation_text_block_start');
            continuationCurrentTextBlock = {
              type: 'text',
              text: ''
            };
            // Reset response flag for new block
            continuationResponseStarted = false;
          } else if (event.content_block.type === 'tool_use') {
            logEvent('continuation_tool_use_block_start', { toolName: event.content_block.name });
            continuationCurrentToolCall = {
              id: event.content_block.id,
              name: event.content_block.name,
              input: ''
            };
          }
        } else if (event.type === 'content_block_delta') {
          if (event.delta.type === 'thinking_delta') {
            if (!continuationThinkingStarted) {
              logEvent('continuation_thinking_start');
              yield {
                type: 'thinking_start'
              };
              continuationThinkingStarted = true;
            }
            logEvent('continuation_thinking_delta', { contentLength: event.delta.thinking.length });
            yield {
              type: 'thinking_delta',
              content: event.delta.thinking
            };
            if (continuationCurrentThinkingBlock) {
              continuationCurrentThinkingBlock.thinking += event.delta.thinking;
            }
          } else if (event.delta.type === 'text_delta') {
            if (!continuationResponseStarted) {
              logEvent('continuation_response_start');
              yield {
                type: 'response_start'
              };
              continuationResponseStarted = true;
            }
            logEvent('continuation_text_delta', { contentLength: event.delta.text.length });
            yield {
              type: 'text_delta',
              content: event.delta.text
            };
            if (continuationCurrentTextBlock) {
              continuationCurrentTextBlock.text += event.delta.text;
            }
          } else if (event.delta.type === 'input_json_delta') {
            logEvent('continuation_tool_input_delta', { jsonLength: event.delta.partial_json.length });
            if (continuationCurrentToolCall) {
              continuationCurrentToolCall.input += event.delta.partial_json;
            }
          } else if (event.delta.type === 'signature_delta') {
            if (continuationCurrentThinkingBlock) {
              continuationCurrentThinkingBlock.signature += event.delta.signature;
            }
          }
        } else if (event.type === 'content_block_stop') {
          if (continuationCurrentThinkingBlock) {
            logEvent('continuation_thinking_block_complete', { contentLength: continuationCurrentThinkingBlock.thinking.length });
            continuationAssistantContent.push(continuationCurrentThinkingBlock);
            continuationCurrentThinkingBlock = null;
          } else if (continuationCurrentTextBlock) {
            logEvent('continuation_text_block_complete', { contentLength: continuationCurrentTextBlock.text.length });
            continuationAssistantContent.push(continuationCurrentTextBlock);
            continuationCurrentTextBlock = null;
          } else if (continuationCurrentToolCall) {
            try {
              continuationCurrentToolCall.input = JSON.parse(continuationCurrentToolCall.input);
              logEvent('continuation_tool_call_parsed', { toolName: continuationCurrentToolCall.name });
              continuationToolCalls.push(continuationCurrentToolCall);
              continuationAssistantContent.push({
                type: 'tool_use',
                id: continuationCurrentToolCall.id,
                name: continuationCurrentToolCall.name,
                input: continuationCurrentToolCall.input
              });
            } catch (e) {
              logEvent('continuation_tool_input_parse_error', { error: e.message });
              console.error('Failed to parse continuation tool input:', e);
            }
            continuationCurrentToolCall = null;
          }
          
          yield {
            type: 'content_block_stop'
          };
        }
      }
      
      // If we have more tool calls from the continuation, we need to execute them too
      if (continuationToolCalls.length > 0) {
        // Execute continuation tools and collect results
        const continuationToolResults = [];
        for (const toolCall of continuationToolCalls) {
          const tool = this.tools.get(toolCall.name);
          if (tool) {
            try {
              const result = await tool.handler(toolCall.input);
              continuationToolResults.push({
                type: 'tool_result',
                tool_use_id: toolCall.id,
                content: result
              });
              yield {
                type: 'tool_result',
                tool: toolCall.name,
                input: toolCall.input,
                result
              };
            } catch (error) {
              continuationToolResults.push({
                type: 'tool_result',
                tool_use_id: toolCall.id,
                content: error.message,
                is_error: true
              });
              yield {
                type: 'tool_error',
                tool: toolCall.name,
                error: error.message
              };
            }
          }
        }
        
        // Continue with another round if we have more tool calls
        const nextUpdatedMessages = [
          ...updatedMessages,
          { role: 'assistant', content: continuationAssistantContent },
          { role: 'user', content: continuationToolResults }
        ];
        
        // Recursive call to handle more interleaved thinking cycles
        const nextStream = this.client.beta.messages.stream({
          model: options.model || "claude-sonnet-4-20250514",
          max_tokens: options.maxTokens || 16000,
          messages: nextUpdatedMessages,
          system: this.systemPrompt,
          tools: tools.length > 0 ? tools : undefined,
          ...(this.mcpServers.length > 0 && { mcp: { servers: this.mcpServers } }),
          thinking: {
            type: "enabled",
            budget_tokens: options.thinkingBudget || 10000
          },
          betas: ["interleaved-thinking-2025-05-14"]
        });
        
        // Stream the next continuation
        for await (const event of nextStream) {
          if (event.type === 'content_block_start') {
            yield {
              type: 'content_block_start',
              blockType: event.content_block.type
            };
          } else if (event.type === 'content_block_delta') {
            if (event.delta.type === 'thinking_delta') {
              yield {
                type: 'thinking_delta',
                content: event.delta.thinking
              };
            } else if (event.delta.type === 'text_delta') {
              yield {
                type: 'text_delta',
                content: event.delta.text
              };
            }
          } else if (event.type === 'content_block_stop') {
            yield {
              type: 'content_block_stop'
            };
          }
        }
      }
    }
    
    // Final logging
    logEvent('conversation_complete', { 
      totalEvents: flowLog.events.length,
      totalPhases: flowLog.phases.length,
      duration: Date.now() - new Date(flowLog.startTime).getTime()
    });
    
    // Log final summary
    console.log(`[${conversationId}] CONVERSATION COMPLETE - ${flowLog.events.length} events in ${flowLog.phases.length} phases`);
    console.log(`[${conversationId}] Flow summary:`, flowLog.events.map(e => `${e.timeOffset}ms: ${e.type}`).join(' → '));
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