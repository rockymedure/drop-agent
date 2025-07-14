import React from 'react';

export const ToolResults = ({ 
  toolResults = [], 
  className = "" 
}) => {
  if (!toolResults || toolResults.length === 0) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      {toolResults.map((tool, index) => {
        const isWebSearch = tool.tool === 'web_search';
        const bgColor = isWebSearch ? 'bg-green-50' : 'bg-blue-50';
        const borderColor = isWebSearch ? 'border-green-200' : 'border-blue-200';
        const textColor = isWebSearch ? 'text-green-700' : 'text-blue-700';
        const resultColor = isWebSearch ? 'text-green-600' : 'text-blue-600';
        const icon = isWebSearch ? '🌐' : '🔧';
        
        return (
          <div key={index} className={`max-w-2xl p-3 ${bgColor} rounded-lg border ${borderColor}`}>
            <div className={`text-sm font-medium ${textColor}`}>
              {icon} {isWebSearch ? 'Web Search' : `Used ${tool.tool}`}
            </div>
            <div className={`text-sm ${resultColor} mt-1`}>{tool.result}</div>
          </div>
        );
      })}
    </div>
  );
};

export default ToolResults;