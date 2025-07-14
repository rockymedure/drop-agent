import { useState, useEffect, useRef, useCallback } from 'react';

export function useWebSocket(url) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        setSocket(null);

        // Attempt to reconnect
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          const timeout = Math.pow(2, reconnectAttemptsRef.current) * 1000; // Exponential backoff
          
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Attempting to reconnect... (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
            connect();
          }, timeout);
        } else {
          setError('Failed to connect after multiple attempts');
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('WebSocket connection error');
      };

      setSocket(ws);
    } catch (err) {
      setError('Failed to create WebSocket connection');
      console.error('WebSocket connection error:', err);
    }
  }, [url]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socket) {
        socket.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback((message) => {
    if (socket && isConnected) {
      socket.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, [socket, isConnected]);

  const addMessageListener = useCallback((callback) => {
    if (socket) {
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          callback(data);
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };
    }
  }, [socket]);

  return {
    socket,
    isConnected,
    error,
    sendMessage,
    addMessageListener,
    reconnect: connect
  };
}