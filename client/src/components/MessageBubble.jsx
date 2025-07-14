import React, { useState } from 'react';
import ThinkingDisplay from './ThinkingDisplay';
import ToolResult from './ToolResult';
import { User, Bot, ChevronDown, ChevronRight, Copy } from 'lucide-react';

const MessageBubble = ({ message, showThinking, isStreaming = false }) => {
  const [isThinkingExpanded, setIsThinkingExpanded] = useState(false);
  const [copiedText, setCopiedText] = useState('');

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (message.role === 'user') {
    return (
      <div className="message-bubble bg-user-bg">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <User size={16} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              You {message.timestamp && (
                <span className="ml-2">{formatTimestamp(message.timestamp)}</span>
              )}
            </div>
            <div className="response-text whitespace-pre-wrap">
              {message.content}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="message-bubble bg-assistant-bg">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 w-8 h-8 bg-claude-orange rounded-full flex items-center justify-center">
          <Bot size={16} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Assistant {message.timestamp && (
              <span className="ml-2">{formatTimestamp(message.timestamp)}</span>
            )}
          </div>
          
          {/* Thinking Section */}
          {showThinking && message.thinking && (
            <div className="mb-4">
              <button
                onClick={() => setIsThinkingExpanded(!isThinkingExpanded)}
                className="flex items-center space-x-2 text-sm text-thinking hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
              >
                {isThinkingExpanded ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
                <span className="font-medium">Thinking</span>
                {isStreaming && message.thinkingVisible && (
                  <span className="typing-indicator ml-2" />
                )}
              </button>
              
              {isThinkingExpanded && (
                <div className="mt-2 relative">
                  <ThinkingDisplay 
                    content={message.thinking}
                    isStreaming={isStreaming && message.thinkingVisible}
                  />
                  {message.thinking && (
                    <button
                      onClick={() => copyToClipboard(message.thinking)}
                      className="absolute top-2 right-2 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      title="Copy thinking"
                    >
                      <Copy size={14} className="text-gray-500" />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tool Results */}
          {message.toolResults && message.toolResults.length > 0 && (
            <div className="mb-4 space-y-2">
              {message.toolResults.map((tool, index) => (
                <ToolResult key={index} tool={tool} />
              ))}
            </div>
          )}

          {/* Response Content */}
          {message.content && (
            <div className="relative">
              <div className="response-text whitespace-pre-wrap">
                {message.content}
                {isStreaming && !message.thinkingVisible && (
                  <span className="typing-indicator ml-1" />
                )}
              </div>
              {message.content && (
                <button
                  onClick={() => copyToClipboard(message.content)}
                  className="absolute top-2 right-2 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors opacity-0 group-hover:opacity-100"
                  title="Copy response"
                >
                  <Copy size={14} className="text-gray-500" />
                </button>
              )}
            </div>
          )}

          {/* Copy confirmation */}
          {copiedText && (
            <div className="mt-2 text-xs text-green-600 dark:text-green-400">
              Copied to clipboard!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;