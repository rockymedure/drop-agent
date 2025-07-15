import React from 'react';
import { TimelineItem } from './TimelineItem';

export const ToolTimelineItem = ({ 
  toolName, 
  toolInput, 
  toolResult, 
  timing = "1s", 
  isExpanded = false, 
  onToggle,
  resultCount = null,
  className = ""
}) => {
  const getToolIcon = (name) => {
    switch (name) {
      case 'calculate':
        return '🔧';
      case 'get_weather':
        return '🌤️';
      case 'web_search':
        return '🌐';
      default:
        return '🔧';
    }
  };

  const getToolTitle = (name, input, count) => {
    const baseTitle = name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    if (count) {
      return `${baseTitle} - ${count} results`;
    }
    
    if (input) {
      // Show a preview of the input
      const inputStr = typeof input === 'object' ? JSON.stringify(input) : String(input);
      const preview = inputStr.length > 50 ? inputStr.substring(0, 50) + '...' : inputStr;
      return `${baseTitle}: ${preview}`;
    }
    
    return baseTitle;
  };

  const getToolSubtitle = (result) => {
    if (!result) return null;
    
    const resultStr = typeof result === 'object' ? JSON.stringify(result) : String(result);
    return resultStr.length > 100 ? resultStr.substring(0, 100) + '...' : resultStr;
  };

  return (
    <TimelineItem
      type="tool"
      content={toolResult}
      isExpanded={isExpanded}
      onToggle={onToggle}
      timing={timing}
      icon={getToolIcon(toolName)}
      title={getToolTitle(toolName, toolInput, resultCount)}
      subtitle={!isExpanded ? getToolSubtitle(toolResult) : null}
      className={`tool-timeline-item ${className}`}
    >
      {isExpanded && toolInput && (
        <div className="mb-3">
          <div className="text-xs font-medium text-gray-600 mb-1">Input:</div>
          <div className="bg-blue-50 rounded-lg p-2 text-sm text-blue-800">
            {typeof toolInput === 'object' ? JSON.stringify(toolInput, null, 2) : toolInput}
          </div>
        </div>
      )}
      
      {isExpanded && toolResult && (
        <div>
          <div className="text-xs font-medium text-gray-600 mb-1">Result:</div>
          <div className="bg-green-50 rounded-lg p-2 text-sm text-green-800">
            {typeof toolResult === 'object' ? JSON.stringify(toolResult, null, 2) : toolResult}
          </div>
        </div>
      )}
    </TimelineItem>
  );
};

export default ToolTimelineItem;