import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const blocks = [
  { number: '01', label: 'History & Precedent', path: '/history' },
  { number: '02', label: 'Stakeholders & Power', path: '/stakeholders' },
  { number: '03', label: 'Funding Pathways', path: '/funding' },
  { number: '04', label: 'Objections & Rebuttals', path: '/objections' },
  { number: '05', label: 'Timing & Triggers', path: '/timing' },
];

export default function BlockSidebar() {
  const location = useLocation();

  return (
    <aside className="block-sidebar">
      <div className="block-sidebar-label">Blocks</div>
      {blocks.map((b) => (
        <Link
          key={b.path}
          to={b.path}
          className={`block-sidebar-link${location.pathname === b.path ? ' active' : ''}`}
        >
          <span className="block-sidebar-number">{b.number}</span>
          {b.label}
        </Link>
      ))}
      <div style={{ marginTop: 'var(--space-md)' }}>
        <div className="block-sidebar-label">Tools</div>
        <Link to="/chat" className="block-sidebar-link">
          Ask a question
        </Link>
      </div>
    </aside>
  );
}
