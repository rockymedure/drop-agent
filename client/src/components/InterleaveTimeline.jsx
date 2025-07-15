import React, { useState, useEffect } from 'react';
import { ThinkingTimelineItem } from './ThinkingTimelineItem';
import { ToolTimelineItem } from './ToolTimelineItem';
import { WebSearchTimelineItem } from './WebSearchTimelineItem';
import { TimelineItem } from './TimelineItem';

export const InterleaveTimeline = ({ 
  timelineItems = [], 
  isStreaming = false,
  className = ""
}) => {
  const [expandedItems, setExpandedItems] = useState(new Set());

  // Auto-expand items during streaming
  useEffect(() => {
    if (isStreaming && timelineItems.length > 0) {
      const lastItem = timelineItems[timelineItems.length - 1];
      if (lastItem && lastItem.type === 'thinking') {
        setExpandedItems(prev => new Set([...prev, lastItem.id]));
      }
    }
  }, [timelineItems, isStreaming]);

  const toggleItem = (itemId) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const renderTimelineItem = (item, index) => {
    const isExpanded = expandedItems.has(item.id);
    const isLast = index === timelineItems.length - 1;
    const isActiveStreaming = isStreaming && isLast;

    const commonProps = {
      key: item.id,
      isExpanded,
      onToggle: () => toggleItem(item.id),
      timing: item.timing || "1s",
      className: isActiveStreaming ? "streaming-active" : ""
    };

    switch (item.type) {
      case 'thinking':
        return (
          <ThinkingTimelineItem
            {...commonProps}
            thinking={item.content}
            title={item.title}
          />
        );
      
      case 'tool':
        return (
          <ToolTimelineItem
            {...commonProps}
            toolName={item.toolName}
            toolInput={item.toolInput}
            toolResult={item.toolResult}
            resultCount={item.resultCount}
          />
        );
      
      case 'web_search':
        return (
          <WebSearchTimelineItem
            {...commonProps}
            query={item.query}
            results={item.results}
          />
        );
      
      case 'response':
        return (
          <TimelineItem
            {...commonProps}
            type="response"
            content={item.content}
            icon="💬"
            title="Response"
          />
        );
      
      default:
        return (
          <TimelineItem
            {...commonProps}
            type={item.type}
            content={item.content}
            icon="❓"
            title={item.title || "Unknown"}
          />
        );
    }
  };

  if (timelineItems.length === 0) {
    return (
      <div className={`timeline-container ${className}`}>
        <div className="text-center text-gray-500 py-8">
          <span className="text-2xl mb-2 block">🧠</span>
          Starting to think...
        </div>
      </div>
    );
  }

  return (
    <div className={`timeline-container ${className}`}>
      <div className="space-y-2">
        {timelineItems.map(renderTimelineItem)}
      </div>
      
      {isStreaming && (
        <div className="mt-4 flex items-center justify-center">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            <span>Processing...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterleaveTimeline;