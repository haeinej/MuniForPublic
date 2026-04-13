import React from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="site-header">
      <Link to="/" className="site-logo">MuniForPublic</Link>
      <nav>
        <Link to="/chat" className="chat-link">Ask a Question</Link>
      </nav>
    </header>
  );
}
