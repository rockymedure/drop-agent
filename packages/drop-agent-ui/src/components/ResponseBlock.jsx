import React from 'react';
import { MarkdownRenderer } from './MarkdownRenderer.jsx';

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
      <div className="markdown-content">
        <MarkdownRenderer content={content} />
        {isStreaming && <span className="animate-pulse ml-1">|</span>}
      </div>
    </div>
  );
};

export default ResponseBlock;