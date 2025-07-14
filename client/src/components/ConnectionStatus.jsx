import React from 'react';
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react';

const ConnectionStatus = ({ isConnected, error }) => {
  if (error) {
    return (
      <div className="flex items-center space-x-2 text-red-500">
        <AlertTriangle size={16} />
        <span className="text-sm">Connection Error</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${isConnected ? 'text-green-500' : 'text-gray-500'}`}>
      {isConnected ? (
        <Wifi size={16} />
      ) : (
        <WifiOff size={16} />
      )}
      <span className="text-sm">
        {isConnected ? 'Connected' : 'Connecting...'}
      </span>
    </div>
  );
};

export default ConnectionStatus;