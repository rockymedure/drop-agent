import React, { useState } from 'react';
import { useSSE } from '../hooks/useSSE.js';
import { ThinkingBlock } from './ThinkingBlock.jsx';
import { ResponseBlock } from './ResponseBlock.jsx';
import { ToolResults } from './ToolResults.jsx';
import { UserMessage } from './UserMessage.jsx';
import { ChatInput } from './ChatInput.jsx';

export const ChatInterface = ({ 
  serverUrl = 'http://localhost:3001',
  title = "Reasoning Agent",
  className = "",
  modelOptions = {
    model: 'claude-opus-4-20250514',
    maxTokens: 16000,
    thinkingBudget: 10000
  }
}) => {
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { sendMessage } = useSSE(serverUrl);

  const handleSend = async (inputValue) => {
    if (inputValue.trim() && !isProcessing) {
      const userMessage = {
        id: Date.now(),
        role: 'user',
        content: inputValue
      };
      
      setMessages(prev => [...prev, userMessage]);
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
        await sendMessage(inputValue, modelOptions, (data) => {
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
    <div className={`flex flex-col h-full bg-white ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-semibold">{title}</h1>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !currentMessage && (
          <div className="text-center text-gray-500">
            Send a message to start chatting with the reasoning agent!
          </div>
        )}
        
        {messages.map((message) => (
          <div key={message.id} className="space-y-3">
            {/* User message */}
            {message.role === 'user' && (
              <UserMessage content={message.content} />
            )}
            
            {/* Assistant message parts */}
            {message.role === 'assistant' && (
              <div className="space-y-3">
                <ThinkingBlock thinking={message.thinking} />
                <ToolResults toolResults={message.toolResults} />
                <ResponseBlock content={message.content} />
              </div>
            )}
          </div>
        ))}
        
        {/* Current streaming message */}
        {currentMessage && (
          <div className="space-y-3">
            <ThinkingBlock 
              thinking={currentMessage.thinking} 
              isStreaming={isProcessing} 
            />
            <ToolResults toolResults={currentMessage.toolResults} />
            <ResponseBlock 
              content={currentMessage.content} 
              isStreaming={isProcessing} 
            />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <ChatInput 
          onSend={handleSend}
          disabled={isProcessing}
        />
      </div>
    </div>
  );
};

export default ChatInterface;