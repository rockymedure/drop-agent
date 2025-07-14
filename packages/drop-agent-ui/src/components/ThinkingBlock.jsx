import React from 'react';

export const ThinkingBlock = ({ 
  thinking, 
  isStreaming = false, 
  className = "",
  showTitle = true 
}) => {
  if (!thinking) return null;

  return (
    <div className={`max-w-2xl p-4 rounded-lg bg-gray-50 text-gray-800 border-l-4 border-gray-400 ${className}`}>
      {showTitle && (
        <div className="text-sm font-medium text-gray-600 mb-2">Thinking:</div>
      )}
      <div className="text-sm text-gray-700 font-mono whitespace-pre-wrap">
        {thinking}
        {isStreaming && <span className="animate-pulse">|</span>}
      </div>
    </div>
  );
};

export default ThinkingBlock;