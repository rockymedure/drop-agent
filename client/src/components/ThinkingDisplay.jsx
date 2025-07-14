import React from 'react';

const ThinkingDisplay = ({ content, isStreaming }) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="thinking-text">
        {content}
        {isStreaming && content && (
          <span className="typing-indicator ml-1" />
        )}
      </div>
      {!content && isStreaming && (
        <div className="thinking-text">
          <span className="typing-indicator" />
        </div>
      )}
    </div>
  );
};

export default ThinkingDisplay;