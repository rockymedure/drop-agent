import React from 'react';
import { ChatInterface } from 'drop-agent-ui';

function App() {
  return (
    <div className="h-screen">
      <ChatInterface 
        serverUrl="http://localhost:3001"
        title="My Reasoning Agent"
        modelOptions={{
          model: 'claude-opus-4-20250514',
          maxTokens: 16000,
          thinkingBudget: 10000
        }}
      />
    </div>
  );
}

export default App;