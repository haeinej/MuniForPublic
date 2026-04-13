import React, { useState } from 'react';

export default function ChatPage() {
  const [query, setQuery] = useState('');
  const [audience, setAudience] = useState('organizer');
  const [messages, setMessages] = useState([]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!query.trim()) return;

    setMessages((prev) => [...prev, { role: 'user', content: query }]);

    // TODO (Person 3): Replace with real pipeline
    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content:
          'Chatbot pipeline not yet connected. Person 3: implement the retrieval + generation pipeline.',
      },
    ]);

    setQuery('');
  }

  return (
    <div className="chat-page">
      <div className="chat-page-header">
        <h1>Ask a Question</h1>
      </div>

      <div className="chat-container">
        <div className="audience-toggle">
          {['organizer', 'staffer', 'official'].map((mode) => (
            <button
              key={mode}
              className={audience === mode ? 'active' : ''}
              onClick={() => setAudience(mode)}
            >
              {mode === 'official' ? 'Elected Official' : mode}
            </button>
          ))}
        </div>

        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="chat-message assistant">
              <p>
                Ask any question about fare-free Muni policy. This system pulls
                from 5 knowledge blocks: history, stakeholders, funding,
                objections, and timing. Responses adjust based on your selected
                audience mode.
              </p>
            </div>
          )}
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
            placeholder="What funding sources could support a senior fare-free pilot?"
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
}
