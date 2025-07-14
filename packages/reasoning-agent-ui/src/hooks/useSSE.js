import { useState, useCallback } from 'react';

export function useSSE(serverUrl = 'http://localhost:3001') {
  const [isConnected, setIsConnected] = useState(true);
  const [error, setError] = useState(null);

  const sendMessage = useCallback(async (message, options = {}, onEvent) => {
    setError(null);
    setIsConnected(true);

    try {
      const response = await fetch(`${serverUrl}/api/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, options }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        // Keep the last incomplete line in buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() === '') continue;
          
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              onEvent(data);
            } catch (e) {
              console.error('Failed to parse SSE data:', e, line);
            }
          }
        }
      }
    } catch (err) {
      setError(err.message);
      console.error('SSE Error:', err);
      onEvent({ error: err.message });
    } finally {
      setIsConnected(false);
    }
  }, [serverUrl]);

  return {
    isConnected,
    error,
    sendMessage
  };
}

export default useSSE;