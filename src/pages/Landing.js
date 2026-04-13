import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const blocks = [
  {
    title: 'History & Precedent',
    count: 'Campaign timeline, city precedents, movement memory',
    path: '/history',
    position: 'top-left',
  },
  {
    title: 'Stakeholder & Power Map',
    count: 'Entity profiles, influence flows, decision sequence',
    path: '/stakeholders',
    position: 'top-right',
  },
  {
    title: 'Funding Pathways',
    count: 'Revenue sources, funding stacks, fiscal context',
    path: '/funding',
    position: 'mid-left',
  },
  {
    title: 'Objection & Rebuttal Bank',
    count: '7 core objections, audience-specific responses',
    path: '/objections',
    position: 'mid-right',
  },
  {
    title: 'Political Timing & Triggers',
    count: 'Condition tracker, trigger events, upcoming calendar',
    path: '/timing',
    position: 'bottom',
  },
];

export default function Landing() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  function handleSearch(e) {
    e.preventDefault();
    if (query.trim()) {
      navigate('/chat?q=' + encodeURIComponent(query));
    }
  }

  return (
    <main className="wiki-landing">
      {/* Wordmark */}
      <div className="wiki-wordmark">
        <h1 className="wiki-title">muniforpublic</h1>
        <p className="wiki-tagline">The Civic Intelligence Platform</p>
      </div>

      {/* Globe area: logo center, blocks around it */}
      <div className="wiki-globe-area">
        <div className="wiki-blocks-left">
          {blocks.filter(b => b.position.includes('left')).map((b) => (
            <Link to={b.path} key={b.path} className="wiki-block-link">
              <span className="wiki-block-title">{b.title}</span>
              <span className="wiki-block-count">{b.count}</span>
            </Link>
          ))}
        </div>

        <div className="wiki-logo-center">
          <img src="/muni-logo.svg" alt="Muni For Public" className="wiki-logo-img" />
        </div>

        <div className="wiki-blocks-right">
          {blocks.filter(b => b.position.includes('right')).map((b) => (
            <Link to={b.path} key={b.path} className="wiki-block-link">
              <span className="wiki-block-title">{b.title}</span>
              <span className="wiki-block-count">{b.count}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom block */}
      <div className="wiki-blocks-bottom">
        {blocks.filter(b => b.position === 'bottom').map((b) => (
          <Link to={b.path} key={b.path} className="wiki-block-link">
            <span className="wiki-block-title">{b.title}</span>
            <span className="wiki-block-count">{b.count}</span>
          </Link>
        ))}
      </div>

      {/* Search bar */}
      <form className="wiki-search" onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a policy question..."
          className="wiki-search-input"
        />
        <button type="submit" className="wiki-search-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        </button>
      </form>

      {/* Powered by line */}
      <div className="wiki-powered">
        <span className="wiki-powered-line" />
        <span className="wiki-powered-text">Powered by AI &middot; civic knowledge archive</span>
        <span className="wiki-powered-line" />
      </div>
    </main>
  );
}
