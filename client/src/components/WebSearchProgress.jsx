import React from 'react';

export const WebSearchProgress = ({ 
  queries = [], 
  isActive = false,
  sitesFound = [],
  className = "" 
}) => {
  if (!queries || queries.length === 0) return null;

  const extractDomain = (url) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  return (
    <div className={`max-w-2xl p-3 bg-green-50 rounded-lg border border-green-200 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium text-green-700">
          🌐 Web Search {isActive && <span className="text-green-500">(searching...)</span>}
        </div>
        {sitesFound.length > 0 && (
          <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
            {sitesFound.length} sites found
          </span>
        )}
      </div>
      
      {/* Compact site discovery list */}
      {sitesFound.length > 0 && (
        <div className="space-y-1">
          {sitesFound.slice(0, 5).map((site, index) => (
            <div key={index} className="text-xs text-green-600 flex items-center">
              <span className="w-4 text-green-500 font-medium">{index + 1}.</span>
              <span className="truncate">{extractDomain(site)}</span>
              {isActive && index === sitesFound.length - 1 && (
                <span className="animate-pulse ml-2 text-green-400">●</span>
              )}
            </div>
          ))}
          {sitesFound.length > 5 && (
            <div className="text-xs text-green-500 italic">
              +{sitesFound.length - 5} more sites...
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WebSearchProgress;