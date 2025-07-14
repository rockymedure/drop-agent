import React from 'react';

export const WebSearchProgress = ({ 
  queries = [], 
  isActive = false,
  className = "" 
}) => {
  if (!queries || queries.length === 0) return null;

  return (
    <div className={`max-w-2xl p-3 bg-green-50 rounded-lg border border-green-200 ${className}`}>
      <div className="text-sm font-medium text-green-700 mb-2">
        🌐 Web Search {isActive && <span className="text-green-500">(searching...)</span>}
      </div>
      <div className="space-y-1">
        {queries.map((query, index) => (
          <div key={index} className="text-sm text-green-600">
            {index + 1}. Searching for: <span className="font-medium">{query}</span>
            {isActive && index === queries.length - 1 && (
              <span className="animate-pulse ml-1">●</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WebSearchProgress;