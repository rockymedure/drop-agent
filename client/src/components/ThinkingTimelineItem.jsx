import React from 'react';
import { TimelineItem } from './TimelineItem';

export const ThinkingTimelineItem = ({ 
  thinking, 
  timing = "1s", 
  isExpanded = false, 
  onToggle,
  title = "Thinking about current developments in an unspecified context",
  className = ""
}) => {
  const getThinkingPreview = (content) => {
    if (!content) return "Processing...";
    
    // Extract first meaningful line for preview
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    const firstLine = lines[0] || "";
    
    // Truncate if too long
    if (firstLine.length > 80) {
      return firstLine.substring(0, 80) + "...";
    }
    
    return firstLine;
  };

  return (
    <TimelineItem
      type="thinking"
      content={thinking}
      isExpanded={isExpanded}
      onToggle={onToggle}
      timing={timing}
      icon="🧠"
      title={isExpanded ? "Thought process" : getThinkingPreview(thinking)}
      className={`thinking-timeline-item ${className}`}
    />
  );
};

export default ThinkingTimelineItem;