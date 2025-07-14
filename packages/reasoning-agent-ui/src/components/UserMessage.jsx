import React from 'react';

export const UserMessage = ({ 
  content, 
  className = "",
  showTitle = true,
  title = "You"
}) => {
  return (
    <div className={`max-w-2xl p-4 rounded-lg bg-blue-500 text-white ml-auto ${className}`}>
      {showTitle && (
        <div className="text-sm font-medium mb-2">{title}</div>
      )}
      <div className="whitespace-pre-wrap">{content}</div>
    </div>
  );
};

export default UserMessage;