import React, { useState, useEffect } from 'react';

export const TimelineItem = ({ 
  type, 
  content, 
  isExpanded = false, 
  onToggle,
  timing = "1s",
  icon = "🧠",
  title = "Thinking...",
  subtitle = null,
  children,
  className = ""
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    if (onToggle) {
      setIsAnimating(true);
      onToggle();
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  return (
    <div className={`timeline-item ${className}`}>
      {/* Timeline Item Header */}
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors group"
      >
        <div className="flex items-center space-x-3">
          {/* Icon */}
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-lg">
            {icon}
          </div>
          
          {/* Content */}
          <div className="flex-1 text-left">
            <div className="font-medium text-gray-900 text-sm mb-1">
              {title}
            </div>
            {subtitle && (
              <div className="text-xs text-gray-500">
                {subtitle}
              </div>
            )}
          </div>
        </div>

        {/* Timing and Expand Arrow */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center text-xs text-gray-400">
            <span className="mr-1">⏱</span>
            {timing}
          </div>
          {onToggle && (
            <div className={`transform transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}>
              <span className="text-gray-400">▼</span>
            </div>
          )}
        </div>
      </button>

      {/* Expandable Content */}
      {content && (
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded 
            ? 'max-h-96 opacity-100' 
            : 'max-h-0 opacity-0'
        }`}>
          <div className="px-4 pb-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                {content}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Children */}
      {children && (
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded 
            ? 'max-h-screen opacity-100' 
            : 'max-h-0 opacity-0'
        }`}>
          <div className="px-4 pb-4">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelineItem;