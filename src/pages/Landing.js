import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const blocks = [
  { label: 'History', icon: '🕰', path: '/history', pos: 'tl' },
  { label: 'Power', icon: '⚡', path: '/stakeholders', pos: 'tr' },
  { label: 'Funding', icon: '◉', path: '/funding', pos: 'ml' },
  { label: 'Objections', icon: '⇄', path: '/objections', pos: 'mr' },
  { label: 'Timing', icon: '◷', path: '/timing', pos: 'b' },
];

export default function Landing() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  function handleSearch(e) {
    e.preventDefault();
    if (query.trim()) navigate('/chat?q=' + encodeURIComponent(query));
  }

  const left = blocks.filter(b => b.pos.endsWith('l'));
  const right = blocks.filter(b => b.pos.endsWith('r'));
  const bottom = blocks.filter(b => b.pos === 'b');

  return (
    <main className="wiki-landing">
      <div className="wiki-wordmark">muniforpublic</div>
      <div className="wiki-tagline">The Civic Intelligence Platform</div>

      <div className="wiki-center">
        <div className="wiki-col">
          {left.map(b => (
            <Link to={b.path} key={b.path} className="wiki-item">
              <span className="wiki-icon">{b.icon}</span>
              <span className="wiki-label">{b.label}</span>
            </Link>
          ))}
        </div>

        <div className="wiki-logo">
          <img src="/muni-logo.png" alt="Muni" />
        </div>

        <div className="wiki-col">
          {right.map(b => (
            <Link to={b.path} key={b.path} className="wiki-item">
              <span className="wiki-icon">{b.icon}</span>
              <span className="wiki-label">{b.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="wiki-bottom-row">
        {bottom.map(b => (
          <Link to={b.path} key={b.path} className="wiki-item">
            <span className="wiki-icon">{b.icon}</span>
            <span className="wiki-label">{b.label}</span>
          </Link>
        ))}
      </div>

      <form className="wiki-search" onSubmit={handleSearch}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Ask a policy question..."
          className="wiki-search-input"
        />
        <button type="submit" className="wiki-search-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>
        </button>
      </form>

      <div className="wiki-footer">
        <span className="wiki-footer-line" />
        <span className="wiki-footer-text">Powered by AI</span>
        <span className="wiki-footer-line" />
      </div>
    </main>
  );
}
