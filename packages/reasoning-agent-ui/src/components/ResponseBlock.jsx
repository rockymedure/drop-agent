import React from 'react';

export const ResponseBlock = ({ 
  content, 
  isStreaming = false, 
  className = "",
  showTitle = true,
  title = "Assistant"
}) => {
  if (!content) return null;

  return (
    <div className={`max-w-2xl p-4 rounded-lg bg-gray-100 text-gray-800 ${className}`}>
      {showTitle && (
        <div className="text-sm font-medium mb-2">
          {title} {isStreaming && <span className="text-blue-500">(responding...)</span>}
        </div>
      )}
      <div className="whitespace-pre-wrap">
        {content}
        {isStreaming && <span className="animate-pulse">|</span>}
      </div>
    </div>
  );
};

export default ResponseBlock;