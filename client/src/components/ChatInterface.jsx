import React, { useState } from 'react';
import { useSSE } from '../hooks/useSSE';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(null);
  
  const { sendMessage } = useSSE();

  const handleSend = async () => {
    if (inputValue.trim() && !isProcessing) {
      const userMessage = {
        id: Date.now(),
        role: 'user',
        content: inputValue
      };
      
      setMessages(prev => [...prev, userMessage]);
      setInputValue('');
      setIsProcessing(true);
      
      // Initialize assistant message
      setCurrentMessage({
        id: Date.now() + 1,
        role: 'assistant',
        content: '',
        thinking: '',
        toolResults: []
      });
      
      try {
        await sendMessage(inputValue, {
          model: 'claude-opus-4-20250514',
          maxTokens: 16000,
          thinkingBudget: 10000
        }, (data) => {
          if (data.message === 'Complete') {
            setCurrentMessage(prev => {
              if (prev) {
                setMessages(prevMessages => [...prevMessages, prev]);
              }
              return null;
            });
            setIsProcessing(false);
          } else if (data.error) {
            console.error('Stream error:', data.error);
            setIsProcessing(false);
            setCurrentMessage(null);
          } else {
            // Handle streaming events
            if (data.type === 'thinking_delta') {
              setCurrentMessage(prev => prev ? {
                ...prev,
                thinking: prev.thinking + data.content
              } : null);
            } else if (data.type === 'text_delta') {
              setCurrentMessage(prev => prev ? {
                ...prev,
                content: prev.content + data.content
              } : null);
            } else if (data.type === 'tool_result') {
              setCurrentMessage(prev => prev ? {
                ...prev,
                toolResults: [...prev.toolResults, data]
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
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-semibold">Reasoning Agent - Basic Test</h1>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !currentMessage && (
          <div className="text-center text-gray-500">
            Send a message to test the reasoning agent with extended thinking!
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
                {/* Thinking section */}
                {message.thinking && (
                  <div className="max-w-2xl p-4 rounded-lg bg-gray-50 text-gray-800 border-l-4 border-gray-400">
                    <div className="text-sm font-medium text-gray-600 mb-2">Thinking:</div>
                    <div className="text-sm text-gray-700 font-mono whitespace-pre-wrap">{message.thinking}</div>
                  </div>
                )}
                
                {/* Tool results section */}
                {message.toolResults && message.toolResults.length > 0 && (
                  <div className="space-y-2">
                    {message.toolResults.map((tool, index) => (
                      <div key={index} className="max-w-2xl p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="text-sm font-medium text-blue-700">🔧 Used {tool.tool}</div>
                        <div className="text-sm text-blue-600 mt-1">{tool.result}</div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Main response section */}
                {message.content && (
                  <div className="max-w-2xl p-4 rounded-lg bg-gray-100 text-gray-800">
                    <div className="text-sm font-medium mb-2">Assistant</div>
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        
        {/* Current streaming message */}
        {currentMessage && (
          <div className="space-y-3">
            {/* Thinking section */}
            {currentMessage.thinking && (
              <div className="max-w-2xl p-4 rounded-lg bg-gray-50 text-gray-800 border-l-4 border-gray-400">
                <div className="text-sm font-medium text-gray-600 mb-2">Thinking:</div>
                <div className="text-sm text-gray-700 font-mono whitespace-pre-wrap">
                  {currentMessage.thinking}
                  {isProcessing && <span className="animate-pulse">|</span>}
                </div>
              </div>
            )}
            
            {/* Tool results section */}
            {currentMessage.toolResults && currentMessage.toolResults.length > 0 && (
              <div className="space-y-2">
                {currentMessage.toolResults.map((tool, index) => (
                  <div key={index} className="max-w-2xl p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-sm font-medium text-blue-700">🔧 Used {tool.tool}</div>
                    <div className="text-sm text-blue-600 mt-1">{tool.result}</div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Main response section */}
            {currentMessage.content && (
              <div className="max-w-2xl p-4 rounded-lg bg-gray-100 text-gray-800">
                <div className="text-sm font-medium mb-2">
                  Assistant {isProcessing && <span className="text-blue-500">(responding...)</span>}
                </div>
                <div className="whitespace-pre-wrap">
                  {currentMessage.content}
                  {isProcessing && <span className="animate-pulse">|</span>}
                </div>
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
    </div>
  );
};

export default ChatInterface;