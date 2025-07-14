import React from 'react';

export const WebSearchResults = ({ 
  webSearchResults = [], 
  queries = [],
  onOpenDrawer,
  className = "" 
}) => {
  if (!webSearchResults || webSearchResults.length === 0) return null;

  const extractDomain = (url) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  // Extract domains from search results for preview
  const getResultDomains = () => {
    const domains = new Set();
    webSearchResults.forEach(result => {
      if (result.content && Array.isArray(result.content)) {
        result.content.forEach(item => {
          if (item.type === 'web_search_result' && item.url) {
            domains.add(extractDomain(item.url));
          }
        });
      }
    });
    return Array.from(domains);
  };

  const resultDomains = getResultDomains();
  const totalResults = webSearchResults.reduce((acc, result) => {
    return acc + (result.content ? result.content.filter(item => item.type === 'web_search_result').length : 0);
  }, 0);

  return (
    <div className={`max-w-2xl ${className}`}>
      <div 
        onClick={onOpenDrawer}
        className="p-3 bg-green-50 rounded-lg border border-green-200 cursor-pointer hover:bg-green-100 transition-colors group"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm font-medium text-green-700">🌐 Web Search Complete</span>
              <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                {totalResults} results
              </span>
            </div>
            
            {/* Quick preview of found domains */}
            <div className="text-xs text-green-600 space-y-1">
              {resultDomains.slice(0, 3).map((domain, index) => (
                <div key={index} className="flex items-center">
                  <span className="w-4 text-green-500 font-medium">{index + 1}.</span>
                  <span className="truncate">{domain}</span>
                </div>
              ))}
              {resultDomains.length > 3 && (
                <div className="text-green-500 italic">
                  +{resultDomains.length - 3} more sites...
                </div>
              )}
            </div>
          </div>
          
          <div className="ml-3 flex items-center text-green-600 group-hover:text-green-700">
            <span className="text-sm font-medium">View All Results</span>
            <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebSearchResults;