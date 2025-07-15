import React, { useState, useRef, useEffect } from 'react';
import { useSSE } from '../hooks/useSSE';
import { MarkdownRenderer } from './MarkdownRenderer';
import { WebSearchResults } from './WebSearchResults';
import { WebSearchDrawer } from './WebSearchDrawer';
import DebugTimeline from './DebugTimeline';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [debugEvents, setDebugEvents] = useState([]);
  const [isDebugOpen, setIsDebugOpen] = useState(false);
  const [expandedThinking, setExpandedThinking] = useState(new Set());
  const messagesContainerRef = useRef(null);
  const processedEventIds = useRef(new Set());
  
  const { sendMessage } = useSSE();

  const openDrawer = () => {
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  // Helper functions for nav bar web search icon
  const hasWebSearchResults = () => {
    // Check current message
    if (currentMessage && currentMessage.webSearchQueries && currentMessage.webSearchQueries.length > 0) {
      return true;
    }
    // Check recent messages for web search results
    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      if (message.webSearchQueries && message.webSearchQueries.length > 0) {
        return true;
      }
    }
    return false;
  };

  const getLatestWebSearchResults = () => {
    if (currentMessage && currentMessage.webSearchResults) {
      return currentMessage.webSearchResults;
    }
    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      if (message.webSearchResults && message.webSearchResults.length > 0) {
        return message.webSearchResults;
      }
    }
    return [];
  };

  const getLatestWebSearchQueries = () => {
    if (currentMessage && currentMessage.webSearchQueries) {
      return currentMessage.webSearchQueries;
    }
    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      if (message.webSearchQueries && message.webSearchQueries.length > 0) {
        return message.webSearchQueries;
      }
    }
    return [];
  };

  const getWebSearchResultCount = () => {
    const results = getLatestWebSearchResults();
    return results.reduce((acc, result) => {
      return acc + (result.content ? result.content.filter(item => item.type === 'web_search_result').length : 0);
    }, 0);
  };

  // Debug timeline functions
  const addDebugEvent = (type, data = {}) => {
    const event = {
      type,
      timestamp: new Date().toLocaleTimeString(),
      ...data
    };
    setDebugEvents(prev => [...prev, event]);
  };

  const clearDebugEvents = () => {
    setDebugEvents([]);
  };

  const toggleDebugTimeline = () => {
    setIsDebugOpen(!isDebugOpen);
  };

  const toggleThinkingExpansion = (messageId) => {
    setExpandedThinking(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  // Auto-scroll to follow along with new content
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      requestAnimationFrame(() => {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        });
      });
    }
  }, [currentMessage?.content, currentMessage?.thinking, messages]);

  const handleSend = async () => {
    if (inputValue.trim() && !isProcessing) {
      const userMessage = {
        id: Date.now(),
        role: 'user',
        content: inputValue
      };
      
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setInputValue('');
      setIsProcessing(true);
      
      // Clear previous debug events for new conversation
      clearDebugEvents();
      
      // Clear processed event IDs for new conversation
      processedEventIds.current.clear();
      
      // Add debug event for user request
      addDebugEvent('request', { content: inputValue });
      
      // Initialize assistant message
      setCurrentMessage({
        id: Date.now() + 1,
        role: 'assistant',
        content: '',
        thinking: '',
        toolResults: [],
        webSearchResults: [],
        webSearchQueries: []
      });
      
      // Build conversation history for Claude
      const conversationHistory = updatedMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      try {
        await sendMessage(conversationHistory, {
          model: 'claude-sonnet-4-20250514',
          maxTokens: 16000,
          thinkingBudget: 10000
        }, (data) => {
          if (data.message === 'Complete') {
            addDebugEvent('complete');
            
            setCurrentMessage(prev => {
              if (prev) {
                // Only add messages that have actual content
                if (prev.content && prev.content.trim() !== '') {
                  const messageWithThinking = {
                    ...prev,
                    isCompleted: true
                  };
                  setMessages(prevMessages => [...prevMessages, messageWithThinking]);
                }
              }
              return null;
            });
            
            setIsProcessing(false);
          } else if (data.error) {
            console.error('Stream error:', data.error);
            const errorMessage = data.error?.message || 'Unknown error';
            
            if (errorMessage.includes('overloaded') || errorMessage.includes('Overloaded')) {
              setCurrentMessage(prev => prev ? {
                ...prev,
                content: '⚠️ **Service Temporarily Overloaded**\n\nThe AI service is experiencing high traffic. Please try again in a few seconds.\n\n*This is a temporary issue and should resolve shortly.*'
              } : null);
            } else {
              setCurrentMessage(prev => prev ? {
                ...prev,
                content: `❌ **Error**: ${errorMessage}\n\nPlease try again.`
              } : null);
            }
            setIsProcessing(false);
          } else {
            // Simple deduplication by content hash
            const contentHash = JSON.stringify(data).slice(0, 100);
            if (processedEventIds.current.has(contentHash)) {
              return;
            }
            processedEventIds.current.add(contentHash);
            
            // Handle streaming events
            if (data.type === 'thinking_start') {
              addDebugEvent('thinking_start');
              setCurrentMessage(prev => prev ? {
                ...prev,
                thinking: ''
              } : null);
            } else if (data.type === 'thinking_delta') {
              addDebugEvent('thinking_delta', { contentLength: data.content.length });
              setCurrentMessage(prev => prev ? {
                ...prev,
                thinking: prev.thinking + data.content
              } : null);
            } else if (data.type === 'text_delta') {
              addDebugEvent('text_delta', { contentLength: data.content.length });
              setCurrentMessage(prev => prev ? {
                ...prev,
                content: prev.content + data.content
              } : null);
            } else if (data.type === 'tool_result') {
              addDebugEvent('tool_result', { 
                tool: data.tool, 
                result: data.result,
                input: data.input 
              });
              setCurrentMessage(prev => prev ? {
                ...prev,
                toolResults: [...prev.toolResults, data]
              } : null);
            } else if (data.type === 'tool_error') {
              addDebugEvent('tool_error', { 
                tool: data.tool, 
                error: data.error 
              });
            } else if (data.type === 'web_search_result') {
              addDebugEvent('web_search_result');
              setCurrentMessage(prev => prev ? {
                ...prev,
                webSearchResults: [...prev.webSearchResults, data]
              } : null);
            } else if (data.type === 'web_search_query') {
              addDebugEvent('web_search_query', { query: data.query });
              setCurrentMessage(prev => prev ? {
                ...prev,
                webSearchQueries: [...prev.webSearchQueries, data.query]
              } : null);
            }
          }
        });
      } catch (error) {
        console.error('Failed to send message:', error);
        setIsProcessing(false);
        setCurrentMessage(null);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Drop Agent</h1>
        
        {/* Web Search Icon */}
        {(hasWebSearchResults()) && (
          <button
            onClick={openDrawer}
            className="flex items-center space-x-2 px-3 py-2 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors group"
          >
            <span className="text-green-600">🌐</span>
            <span className="text-sm text-green-700 font-medium">
              {getWebSearchResultCount()} results
            </span>
            {currentMessage && isProcessing && (
              <span className="animate-pulse text-green-400 text-xs">●</span>
            )}
          </button>
        )}
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !currentMessage && (
          <div className="text-center text-gray-500">
            Send a message to start exploring ideas with Drop Agent!
          </div>
        )}
        
        {messages.map((message) => (
          <div key={message.id} className="space-y-3">
            {/* User message */}
            {message.role === 'user' && (
              <div className="max-w-2xl p-4 rounded-lg bg-blue-500 text-white ml-auto">
                <div className="text-sm font-medium mb-2">You</div>
                <div className="whitespace-pre-wrap">{message.content}</div>
              </div>
            )}
            
            {/* Assistant message parts */}
            {message.role === 'assistant' && (
              <div className="space-y-3">
                {/* Thinking section - collapsible */}
                {message.thinking && (
                  <div className="max-w-2xl">
                    <button
                      onClick={() => toggleThinkingExpansion(message.id)}
                      className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 mb-2"
                    >
                      <span>{expandedThinking.has(message.id) ? '🔽' : '▶️'}</span>
                      <span>{expandedThinking.has(message.id) ? 'Hide' : 'Show'} reasoning</span>
                    </button>
                    
                    {expandedThinking.has(message.id) && (
                      <div className="p-4 rounded-lg bg-gray-50 text-gray-800 border-l-4 border-gray-400">
                        <div className="text-sm font-medium text-gray-600 mb-2">🧠 Thinking:</div>
                        <div className="text-sm text-gray-700 font-mono whitespace-pre-wrap">{message.thinking}</div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Tool results */}
                {message.toolResults && message.toolResults.length > 0 && (
                  <div className="space-y-2">
                    {message.toolResults.map((item, index) => {
                      const getToolIcon = (toolName) => {
                        if (toolName === 'calculate') return '🔢';
                        if (toolName === 'get_weather') return '🌤️';
                        if (toolName === 'web_search') return '🌐';
                        return '⚒️';
                      };
                      
                      const isWebSearch = item.tool === 'web_search';
                      const bgColor = isWebSearch ? 'bg-green-50' : 'bg-blue-50';
                      const borderColor = isWebSearch ? 'border-green-200' : 'border-blue-200';
                      const textColor = isWebSearch ? 'text-green-700' : 'text-blue-700';
                      const resultColor = isWebSearch ? 'text-green-600' : 'text-blue-600';
                      const icon = getToolIcon(item.tool);
                      
                      return (
                        <div key={index} className={`max-w-2xl p-3 ${bgColor} rounded-lg border ${borderColor}`}>
                          <div className={`text-sm font-medium ${textColor}`}>
                            {icon} {isWebSearch ? 'Web Search' : `Used ${item.tool}`}
                          </div>
                          <div className={`text-sm ${resultColor} mt-1`}>{item.result}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {/* Main response section */}
                {message.content && (
                  <div className="max-w-2xl p-4 rounded-lg bg-gray-100 text-gray-800">
                    <div className="text-sm font-medium mb-2">💬 Assistant</div>
                    <div className="markdown-content">
                      <MarkdownRenderer content={message.content} />
                    </div>
                  </div>
                )}
                
                {/* Web search results */}
                {message.webSearchQueries && message.webSearchQueries.length > 0 && (
                  <WebSearchResults 
                    webSearchResults={message.webSearchResults}
                    queries={message.webSearchQueries || []}
                    onOpenDrawer={openDrawer}
                    isSearching={false}
                  />
                )}
              </div>
            )}
          </div>
        ))}
        
        {/* Current streaming message */}
        {currentMessage && (
          <div className="space-y-3">
            {/* Current thinking */}
            {currentMessage.thinking && (
              <div className="max-w-2xl p-4 rounded-lg bg-gray-50 text-gray-800 border-l-4 border-gray-400">
                <div className="text-sm font-medium text-gray-600 mb-2">🧠 Thinking:</div>
                <div className="text-sm text-gray-700 font-mono whitespace-pre-wrap">{currentMessage.thinking}</div>
                {isProcessing && (
                  <div className="mt-2 text-xs text-gray-500 animate-pulse">● Processing...</div>
                )}
              </div>
            )}
            
            {/* Current tool results */}
            {currentMessage.toolResults && currentMessage.toolResults.map((item, index) => {
              const getToolIcon = (toolName) => {
                if (toolName === 'calculate') return '🔢';
                if (toolName === 'get_weather') return '🌤️';
                if (toolName === 'web_search') return '🌐';
                return '⚒️';
              };
              
              const isWebSearch = item.tool === 'web_search';
              const bgColor = isWebSearch ? 'bg-green-50' : 'bg-blue-50';
              const borderColor = isWebSearch ? 'border-green-200' : 'border-blue-200';
              const textColor = isWebSearch ? 'text-green-700' : 'text-blue-700';
              const resultColor = isWebSearch ? 'text-green-600' : 'text-blue-600';
              const icon = getToolIcon(item.tool);
              
              return (
                <div key={index} className={`max-w-2xl p-3 ${bgColor} rounded-lg border ${borderColor}`}>
                  <div className={`text-sm font-medium ${textColor}`}>
                    {icon} {isWebSearch ? 'Web Search' : `Used ${item.tool}`}
                  </div>
                  <div className={`text-sm ${resultColor} mt-1`}>{item.result}</div>
                </div>
              );
            })}
            
            {/* Current web search results */}
            {currentMessage && currentMessage.webSearchQueries && currentMessage.webSearchQueries.length > 0 && (
              <WebSearchResults 
                webSearchResults={currentMessage.webSearchResults}
                queries={currentMessage.webSearchQueries || []}
                onOpenDrawer={openDrawer}
                isSearching={isProcessing && currentMessage.webSearchQueries.length > 0}
              />
            )}
            
            {/* Current response */}
            {currentMessage && currentMessage.content && (
              <div className="max-w-2xl p-4 rounded-lg bg-gray-100 text-gray-800">
                <div className="text-sm font-medium mb-2">💬 Assistant</div>
                <div className="markdown-content">
                  <MarkdownRenderer content={currentMessage.content} />
                </div>
                {isProcessing && (
                  <div className="mt-2 text-xs text-gray-500 animate-pulse">● Streaming...</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSend}
            disabled={isProcessing}
            className={`px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isProcessing 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white`}
          >
            {isProcessing ? 'Processing...' : 'Send'}
          </button>
        </div>
      </div>

      {/* Web Search Drawer */}
      <WebSearchDrawer 
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        webSearchResults={getLatestWebSearchResults()}
        queries={getLatestWebSearchQueries()}
        isSearching={isProcessing && hasWebSearchResults()}
      />

      {/* Debug Timeline */}
      <DebugTimeline
        debugEvents={debugEvents}
        isOpen={isDebugOpen}
        onToggle={toggleDebugTimeline}
        onClear={clearDebugEvents}
      />
    </div>
  );
};

export default ChatInterface;