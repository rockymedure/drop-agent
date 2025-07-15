import React, { useState, useEffect, useRef } from 'react';

const DebugTimeline = ({ debugEvents = [], isOpen = false, onToggle, onClear }) => {
  const bottomRef = useRef(null);
  const [isAutoScroll, setIsAutoScroll] = useState(true);

  // Auto-scroll to bottom when new events arrive
  useEffect(() => {
    if (isAutoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [debugEvents, isAutoScroll]);

  const getEventIcon = (type) => {
    switch (type) {
      case 'request': return '👤';
      case 'thinking_start': return '🧠';
      case 'thinking_delta': return '🧠';
      case 'tool_result': return '🔧';
      case 'tool_error': return '❌';
      case 'text_delta': return '💬';
      case 'web_search_query': return '🌐';
      case 'web_search_result': return '🔍';
      case 'complete': return '✅';
      default: return '📡';
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'request': return 'text-blue-600 bg-blue-50';
      case 'thinking_start': 
      case 'thinking_delta': return 'text-purple-600 bg-purple-50';
      case 'tool_result': return 'text-green-600 bg-green-50';
      case 'tool_error': return 'text-red-600 bg-red-50';
      case 'text_delta': return 'text-gray-600 bg-gray-50';
      case 'web_search_query': 
      case 'web_search_result': return 'text-cyan-600 bg-cyan-50';
      case 'complete': return 'text-emerald-600 bg-emerald-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const formatEventData = (event) => {
    switch (event.type) {
      case 'request':
        return event.content?.substring(0, 50) + (event.content?.length > 50 ? '...' : '');
      case 'thinking_delta':
        return `${event.contentLength || 0} chars`;
      case 'tool_result':
        return `${event.tool}: ${event.result?.substring(0, 30)}${event.result?.length > 30 ? '...' : ''}`;
      case 'tool_error':
        return `${event.tool}: ${event.error}`;
      case 'text_delta':
        return `${event.contentLength || 0} chars`;
      case 'web_search_query':
        return event.query;
      case 'web_search_result':
        return 'Results received';
      default:
        return '';
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-4 right-4 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors z-50"
        title="Show Debug Timeline"
      >
        🐛
      </button>
    );
  }

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-200 shadow-lg z-40 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Debug Timeline</h3>
          <button
            onClick={onToggle}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm text-gray-600">
            {debugEvents.length} events
          </span>
          <label className="flex items-center text-sm text-gray-600">
            <input
              type="checkbox"
              checked={isAutoScroll}
              onChange={(e) => setIsAutoScroll(e.target.checked)}
              className="mr-2"
            />
            Auto-scroll
          </label>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto p-4">
        {debugEvents.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            No events yet. Send a message to see the flow!
          </div>
        ) : (
          <div className="space-y-2">
            {debugEvents.map((event, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${getEventColor(event.type)}`}
              >
                <div className="flex items-start space-x-2">
                  <span className="text-lg">{getEventIcon(event.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm capitalize">
                        {event.type.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-gray-500">
                        {event.timestamp}
                      </span>
                    </div>
                    {formatEventData(event) && (
                      <div className="text-xs text-gray-600 mt-1 break-words">
                        {formatEventData(event)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 bg-gray-50 space-y-2">
        <button
          onClick={() => {
            const timelineText = debugEvents.map(event => {
              const eventData = formatEventData(event);
              return `${event.timestamp} - ${getEventIcon(event.type)} ${event.type.replace('_', ' ')}: ${eventData}`;
            }).join('\n');
            
            navigator.clipboard.writeText(timelineText).then(() => {
              alert('Timeline copied to clipboard!');
            }).catch(() => {
              // Fallback for browsers that don't support clipboard API
              const textArea = document.createElement('textarea');
              textArea.value = timelineText;
              document.body.appendChild(textArea);
              textArea.select();
              document.execCommand('copy');
              document.body.removeChild(textArea);
              alert('Timeline copied to clipboard!');
            });
          }}
          className="w-full text-sm text-blue-600 hover:text-blue-800 py-2 bg-blue-50 hover:bg-blue-100 rounded"
        >
          📋 Copy Timeline
        </button>
        
        <button
          onClick={onClear}
          className="w-full text-sm text-gray-600 hover:text-gray-800 py-2"
        >
          Clear Timeline
        </button>
      </div>
    </div>
  );
};

export default DebugTimeline;