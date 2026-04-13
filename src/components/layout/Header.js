import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const blocks = [
  { path: '/history', label: 'History' },
  { path: '/stakeholders', label: 'Power' },
  { path: '/funding', label: 'Funding' },
  { path: '/objections', label: 'Objections' },
  { path: '/timing', label: 'Timing' },
];

export default function Header() {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  // Hide header on landing page (wiki-style, no chrome)
  if (isLanding) return null;

  return (
    <header className="site-header">
      <Link to="/" className="site-logo">
        muniforpublic<span className="tm">TM</span>
      </Link>
      <nav className="header-nav">
        {blocks.map((b) => (
          <Link
            key={b.path}
            to={b.path}
            className="header-link"
            style={location.pathname === b.path ? { color: '#FFFFFF' } : {}}
          >
            {b.label}
          </Link>
        ))}
        <Link
          to="/chat"
          className="header-link"
          style={location.pathname === '/chat' ? { color: '#FFFFFF' } : {}}
        >
          Ask
        </Link>
      </nav>
    </header>
  );
}
