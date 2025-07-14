import React from 'react';
import { Tool, AlertTriangle } from 'lucide-react';

const ToolResult = ({ tool }) => {
  const isError = tool.type === 'tool_error';
  
  return (
    <div className={`tool-result ${isError ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : ''}`}>
      <div className="flex items-start space-x-3">
        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
          isError ? 'bg-red-500' : 'bg-blue-500'
        }`}>
          {isError ? (
            <AlertTriangle size={14} className="text-white" />
          ) : (
            <Tool size={14} className="text-white" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {isError ? 'Tool Error' : `Used ${tool.tool}`}
          </div>
          {tool.input && (
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Input: {typeof tool.input === 'object' ? JSON.stringify(tool.input) : tool.input}
            </div>
          )}
          <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">
            {isError ? tool.error : tool.result}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolResult;