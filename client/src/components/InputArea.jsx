import React, { useState, useRef, useEffect } from 'react';
import { Send, Square } from 'lucide-react';

const InputArea = ({ onSendMessage, disabled, isProcessing }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-4">
        <form onSubmit={handleSubmit} className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={disabled ? 'Connecting...' : 'Type your message... (Enter to send, Shift+Enter for new line)'}
              disabled={disabled}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-claude-orange focus:border-transparent max-h-32 min-h-[44px]"
              rows="1"
            />
          </div>
          <button
            type="submit"
            disabled={disabled || !input.trim()}
            className="flex-shrink-0 p-3 bg-claude-orange hover:bg-orange-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <Square size={20} />
            ) : (
              <Send size={20} />
            )}
          </button>
        </form>
        
        {/* Status indicators */}
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {isProcessing && (
            <span className="flex items-center">
              <div className="w-2 h-2 bg-claude-orange rounded-full animate-pulse mr-2"></div>
              Processing...
            </span>
          )}
          {disabled && !isProcessing && (
            <span className="text-red-500">
              Connection lost. Attempting to reconnect...
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default InputArea;