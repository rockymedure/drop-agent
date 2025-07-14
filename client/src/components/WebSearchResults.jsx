import React from 'react';

export const WebSearchResults = ({ 
  webSearchResults = [], 
  className = "" 
}) => {
  if (!webSearchResults || webSearchResults.length === 0) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      {webSearchResults.map((search, index) => (
        <div key={index} className="max-w-2xl p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="text-sm font-medium text-green-700 mb-2">
            🌐 Web Search Results
          </div>
          {search.content && search.content.map((result, resultIndex) => (
            <div key={resultIndex} className="mb-2 last:mb-0">
              {result.type === 'web_search_result' && (
                <div className="text-sm">
                  <div className="font-medium text-green-800">
                    <a 
                      href={result.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {result.title}
                    </a>
                  </div>
                  <div className="text-green-600 text-xs mt-1">
                    {result.url}
                    {result.page_age && (
                      <span className="ml-2">• Updated: {result.page_age}</span>
                    )}
                  </div>
                </div>
              )}
              {result.type === 'web_search_tool_result_error' && (
                <div className="text-sm text-red-600">
                  ❌ Search error: {result.error_code}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default WebSearchResults;