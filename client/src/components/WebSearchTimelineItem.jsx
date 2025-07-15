import React from 'react';
import { TimelineItem } from './TimelineItem';

export const WebSearchTimelineItem = ({ 
  query, 
  results = [], 
  timing = "2s", 
  isExpanded = false, 
  onToggle,
  className = ""
}) => {
  const resultCount = results.length;
  
  const extractDomain = (url) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  const getTopDomains = (results) => {
    const domains = new Set();
    results.forEach(result => {
      if (result.url) {
        domains.add(extractDomain(result.url));
      }
    });
    return Array.from(domains).slice(0, 3);
  };

  const topDomains = getTopDomains(results);

  return (
    <TimelineItem
      type="web_search"
      isExpanded={isExpanded}
      onToggle={onToggle}
      timing={timing}
      icon="🌐"
      title={query}
      subtitle={`${resultCount} results`}
      className={`web-search-timeline-item ${className}`}
    >
      {isExpanded && (
        <div>
          {/* Top domains preview */}
          {topDomains.length > 0 && (
            <div className="mb-3">
              <div className="text-xs font-medium text-gray-600 mb-2">Top domains:</div>
              <div className="flex flex-wrap gap-2">
                {topDomains.map((domain, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700"
                  >
                    {domain}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Search results */}
          {results.length > 0 && (
            <div>
              <div className="text-xs font-medium text-gray-600 mb-2">Results:</div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {results.slice(0, 5).map((result, index) => (
                  <div 
                    key={index} 
                    className="bg-white border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                  >
                    {result.title && (
                      <div className="font-medium text-sm text-gray-900 mb-1">
                        {result.title}
                      </div>
                    )}
                    {result.url && (
                      <div className="text-xs text-green-600 mb-1">
                        {extractDomain(result.url)}
                      </div>
                    )}
                    {result.content && (
                      <div className="text-xs text-gray-600 line-clamp-2">
                        {typeof result.content === 'string' 
                          ? result.content.substring(0, 150) + (result.content.length > 150 ? '...' : '')
                          : 'Content available'
                        }
                      </div>
                    )}
                  </div>
                ))}
                {results.length > 5 && (
                  <div className="text-xs text-gray-500 text-center py-2">
                    +{results.length - 5} more results
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </TimelineItem>
  );
};

export default WebSearchTimelineItem;