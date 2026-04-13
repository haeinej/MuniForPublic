import React, { useState } from 'react';

// Person 3: This is your main workspace.
// Build the chatbot pipeline here:
// 1. Query classification (which blocks to search)
// 2. Retrieval (semantic search via match_claims/match_objections + structured filters)
// 3. Response generation (Gemini API with audience-aware prompts)

export default function ChatPage() {
  const [query, setQuery] = useState('');
  const [audience, setAudience] = useState('organizer');
  const [messages, setMessages] = useState([]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!query.trim()) return;

    setMessages((prev) => [...prev, { role: 'user', content: query }]);

    // TODO (Person 3): Replace this placeholder with the real pipeline
    // 1. Classify the query type
    // 2. Generate embedding via Gemini API
    // 3. Call match_claims / match_objections RPC
    // 4. Fetch structured data from relevant tables
    // 5. Send context + question + audience to Gemini for response generation
    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content:
          'Chatbot pipeline not yet connected. Person 3: implement the retrieval + generation pipeline in this file.',
      },
    ]);

    setQuery('');
  }

  return (
    <main className="chat-page">
      <h1>Ask a Question</h1>

      <div className="audience-toggle">
        {['organizer', 'staffer', 'official'].map((mode) => (
          <button
            key={mode}
            className={audience === mode ? 'active' : ''}
            onClick={() => setAudience(mode)}
          >
            {mode === 'official'
              ? 'Elected Official'
              : mode.charAt(0).toUpperCase() + mode.slice(1)}
          </button>
        ))}
      </div>

      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-message ${msg.role}`}>
            <p>{msg.content}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="chat-input">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., What funding sources could support a senior fare-free pilot?"
        />
        <button type="submit">Send</button>
      </form>
    </main>
  );
}
