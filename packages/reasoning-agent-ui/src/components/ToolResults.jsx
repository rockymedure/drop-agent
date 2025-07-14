import React from 'react';

export const ToolResults = ({ 
  toolResults = [], 
  className = "" 
}) => {
  if (!toolResults || toolResults.length === 0) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      {toolResults.map((tool, index) => (
        <div key={index} className="max-w-2xl p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-sm font-medium text-blue-700">🔧 Used {tool.tool}</div>
          <div className="text-sm text-blue-600 mt-1">{tool.result}</div>
        </div>
      ))}
    </div>
  );
};

export default ToolResults;