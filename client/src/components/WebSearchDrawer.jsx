import React, { useState, useEffect } from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';

export const WebSearchDrawer = ({ 
  isOpen, 
  onClose, 
  webSearchResults = [], 
  queries = [],
  isSearching = false,
  className = "" 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [expandedQueries, setExpandedQueries] = useState(new Set());
  const [animatingQueries, setAnimatingQueries] = useState(new Set());

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsVisible(false); // Start hidden
      // Small delay to trigger animation after render
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
    } else {
      setIsVisible(false);
      // Wait for animation to complete before unmounting
      setTimeout(() => setShouldRender(false), 300);
    }
  }, [isOpen]);

  const extractDomain = (url) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  // Group results by query
  const getResultsByQuery = () => {
    const resultsByQuery = [];
    
    webSearchResults.forEach((searchGroup, index) => {
      const query = queries[index] || `Search ${index + 1}`;
      const results = [];
      
      if (searchGroup.content && Array.isArray(searchGroup.content)) {
        searchGroup.content.forEach(item => {
          if (item.type === 'web_search_result') {
            results.push(item);
          }
        });
      }
      
      if (results.length > 0) {
        resultsByQuery.push({
          query,
          results,
          index
        });
      }
    });
    
    return resultsByQuery;
  };

  const resultsByQuery = getResultsByQuery();
  const totalResults = resultsByQuery.reduce((acc, group) => acc + group.results.length, 0);

  // Auto-expand all queries by default and new ones during search
  useEffect(() => {
    if (resultsByQuery.length > 0) {
      const newExpanded = new Set(expandedQueries);
      resultsByQuery.forEach(queryGroup => {
        // Expand all queries by default
        newExpanded.add(queryGroup.index);
      });
      setExpandedQueries(newExpanded);
    }
  }, [resultsByQuery.length]);

  if (!shouldRender) return null;

  const toggleQuery = (index) => {
    const newExpanded = new Set(expandedQueries);
    const newAnimating = new Set(animatingQueries);
    
    newAnimating.add(index);
    setAnimatingQueries(newAnimating);
    
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedQueries(newExpanded);
    
    // Remove from animating after animation completes
    setTimeout(() => {
      setAnimatingQueries(prev => {
        const updated = new Set(prev);
        updated.delete(index);
        return updated;
      });
    }, 300);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black z-40 transition-all duration-300 ${
          isVisible ? 'bg-opacity-50 backdrop-blur-sm' : 'bg-opacity-0 backdrop-blur-none'
        }`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
        isVisible ? 'translate-x-0' : 'translate-x-full'
      } ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-green-50">
          <div className="flex items-center space-x-2">
            <span className="text-lg">🌐</span>
            <div>
              <h2 className="text-lg font-semibold text-green-800">
                Web Search {isSearching ? 'Progress' : 'Results'}
              </h2>
              <p className="text-sm text-green-600">
                {totalResults} result{totalResults !== 1 ? 's' : ''} {isSearching ? 'so far' : 'found'} • {resultsByQuery.length} quer{resultsByQuery.length !== 1 ? 'ies' : 'y'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-green-100 rounded-full transition-colors"
          >
            <span className="text-xl text-green-700">✕</span>
          </button>
        </div>

        {/* Content */}
        <div className="h-full overflow-y-auto pb-20">
          {/* Search Results by Query */}
          <div className="space-y-2">
            {resultsByQuery.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <span className="text-4xl mb-2 block">🔍</span>
                No search results yet
              </div>
            ) : (
              resultsByQuery.map((queryGroup) => {
                const isExpanded = expandedQueries.has(queryGroup.index);
                
                return (
                  <div key={queryGroup.index} className="overflow-hidden">
                    {/* Query Header */}
                    <button
                      onClick={() => toggleQuery(queryGroup.index)}
                      className={`w-full p-5 text-left transition-all duration-200 flex items-center justify-between ${
                        isExpanded 
                          ? 'bg-green-50 border-b border-green-100' 
                          : 'hover:bg-gray-50 border-b border-gray-100'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold transition-colors ${
                            isExpanded 
                              ? 'bg-green-200 text-green-800' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {queryGroup.index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-base mb-1 truncate">
                              "{queryGroup.query}"
                            </h3>
                            <div className="flex items-center space-x-3">
                              <p className="text-sm text-gray-500">
                                {queryGroup.results.length} result{queryGroup.results.length !== 1 ? 's' : ''}
                              </p>
                              {isExpanded && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                  Expanded
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                          isExpanded ? 'bg-green-200' : 'bg-gray-100'
                        }`}>
                          <span className={`transform transition-transform duration-200 text-sm ${
                            isExpanded ? 'rotate-180 text-green-700' : 'text-gray-500'
                          }`}>
                            ▼
                          </span>
                        </div>
                      </div>
                    </button>
                    
                    {/* Query Results */}
                    <div 
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isExpanded 
                          ? 'max-h-96 opacity-100 transform translate-y-0' 
                          : 'max-h-0 opacity-0 transform -translate-y-2'
                      }`}
                      style={{
                        maxHeight: isExpanded ? `${queryGroup.results.length * 120 + 64}px` : '0px'
                      }}
                    >
                      <div className={`px-6 space-y-3 bg-gray-25 transition-all duration-300 ${
                        isExpanded ? 'pt-4 pb-6' : 'pt-0 pb-0'
                      }`}>
                        {queryGroup.results.map((result, resultIndex) => {
                          const domain = result.url ? extractDomain(result.url) : '';
                          
                          return (
                            <div 
                              key={resultIndex} 
                              className={`group bg-white rounded-xl p-4 border border-gray-100 hover:border-gray-200 hover:shadow-md cursor-pointer
                                transition-all duration-200
                                ${isExpanded 
                                  ? 'transform translate-y-0 opacity-100' 
                                  : 'transform translate-y-4 opacity-0'
                                }`}
                              style={{
                                transitionDelay: isExpanded ? `${resultIndex * 50}ms` : '0ms'
                              }}
                              onClick={() => result.url && window.open(result.url, '_blank')}
                            >
                              {/* Result Header */}
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                                    <span className="text-sm text-green-600 font-medium truncate">{domain}</span>
                                    {result.page_age && (
                                      <span className="text-xs text-gray-400 flex-shrink-0">• {result.page_age}</span>
                                    )}
                                  </div>
                                  <h4 className="font-semibold text-gray-900 leading-snug text-base mb-2 group-hover:text-green-700 transition-colors">
                                    {result.title || `Result ${resultIndex + 1}`}
                                  </h4>
                                  {/* Result Preview */}
                                  {result.content && (
                                    <p className="text-gray-600 leading-relaxed text-sm line-clamp-2">
                                      {typeof result.content === 'string' 
                                        ? result.content.slice(0, 200)
                                        : 'Content available'}
                                    </p>
                                  )}
                                </div>
                                
                                {/* Action Icons */}
                                <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                                  {result.content && (
                                    <details className="relative">
                                      <summary 
                                        className="flex items-center justify-center w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors list-none"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <span className="text-gray-500 text-sm">📄</span>
                                      </summary>
                                      <div className="absolute right-0 top-10 w-80 max-h-60 bg-white border border-gray-200 rounded-lg shadow-lg p-3 overflow-y-auto z-50">
                                        <div className="text-xs text-gray-700 whitespace-pre-wrap">
                                          {typeof result.content === 'string' 
                                            ? result.content 
                                            : JSON.stringify(result.content, null, 2)}
                                        </div>
                                      </div>
                                    </details>
                                  )}
                                  {result.url && (
                                    <div className="flex items-center justify-center w-8 h-8 bg-green-100 group-hover:bg-green-200 rounded-lg transition-colors">
                                      <span className="text-green-600 text-sm">↗</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default WebSearchDrawer;