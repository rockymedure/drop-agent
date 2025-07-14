import React from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';

export const WebSearchDrawer = ({ 
  isOpen, 
  onClose, 
  webSearchResults = [], 
  queries = [],
  className = "" 
}) => {
  if (!isOpen) return null;

  const extractDomain = (url) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  const formatContent = (content) => {
    if (Array.isArray(content)) {
      return content.map(item => {
        if (typeof item === 'string') return item;
        if (item.text) return item.text;
        if (item.url) return `[${item.title || item.url}](${item.url})`;
        return JSON.stringify(item);
      }).join('\n\n');
    }
    return typeof content === 'string' ? content : JSON.stringify(content);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 transform transition-transform duration-300 ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-green-50">
          <div className="flex items-center space-x-2">
            <span className="text-lg">🌐</span>
            <div>
              <h2 className="text-lg font-semibold text-green-800">Web Search Results</h2>
              <p className="text-sm text-green-600">
                {webSearchResults.length} sites found • {queries.length} queries
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
          {/* Search Queries */}
          {queries.length > 0 && (
            <div className="p-4 bg-green-25 border-b border-green-100">
              <h3 className="text-sm font-medium text-green-700 mb-2">Search Queries:</h3>
              <div className="space-y-1">
                {queries.map((query, index) => (
                  <div key={index} className="text-sm text-green-600">
                    {index + 1}. "{query}"
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          <div className="p-4 space-y-6">
            {webSearchResults.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <span className="text-4xl mb-2 block">🔍</span>
                No search results yet
              </div>
            ) : (
              webSearchResults.map((result, index) => {
                const content = formatContent(result.content);
                const lines = content.split('\n').filter(line => line.trim());
                const title = lines[0] || `Search Result ${index + 1}`;
                const url = lines.find(line => line.includes('http')) || '';
                const domain = url ? extractDomain(url) : '';
                const description = lines.slice(1, 4).join(' ') || content.slice(0, 200) + '...';

                return (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                    {/* Result Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            {index + 1}
                          </span>
                          <span className="text-sm text-green-600 font-medium">{domain}</span>
                        </div>
                        <h3 className="font-medium text-gray-900 leading-tight">{title}</h3>
                      </div>
                      {url && (
                        <a 
                          href={url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="ml-3 px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                        >
                          Open ↗
                        </a>
                      )}
                    </div>

                    {/* Result Content */}
                    <div className="text-sm text-gray-700 space-y-2">
                      <p className="text-gray-600 leading-relaxed">{description}</p>
                      
                      {/* Full Content (Expandable) */}
                      <details className="mt-3">
                        <summary className="cursor-pointer text-green-600 hover:text-green-700 text-sm font-medium">
                          View Full Content
                        </summary>
                        <div className="mt-3 p-3 bg-gray-50 rounded border max-h-60 overflow-y-auto">
                          <MarkdownRenderer content={content} />
                        </div>
                      </details>
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