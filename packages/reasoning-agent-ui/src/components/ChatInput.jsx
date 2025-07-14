import React, { useState } from 'react';

export const ChatInput = ({ 
  onSend, 
  disabled = false, 
  placeholder = "Type your message...",
  className = ""
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    if (inputValue.trim() && !disabled) {
      onSend(inputValue);
      setInputValue('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`flex space-x-2 ${className}`}>
      <textarea
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        style={{
          minHeight: '42px',
          maxHeight: '120px'
        }}
      />
      <button
        onClick={handleSend}
        disabled={disabled || !inputValue.trim()}
        className={`px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          disabled || !inputValue.trim()
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-500 hover:bg-blue-600'
        } text-white`}
      >
        {disabled ? 'Processing...' : 'Send'}
      </button>
    </div>
  );
};

export default ChatInput;