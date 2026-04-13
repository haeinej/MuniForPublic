import React from 'react';
import { Link } from 'react-router-dom';

const blocks = [
  {
    id: 'history',
    title: 'History & Precedent',
    description: "What's been tried before — here and elsewhere — and what actually happened?",
    path: '/history',
    emoji: '📜',
  },
  {
    id: 'stakeholders',
    title: 'Stakeholder & Power Map',
    description: 'Who decides, who funds, who blocks, who champions — and in what order?',
    path: '/stakeholders',
    emoji: '🗺️',
  },
  {
    id: 'funding',
    title: 'Funding Pathways',
    description: "Where could the money come from — and what's actually viable?",
    path: '/funding',
    emoji: '💰',
  },
  {
    id: 'objections',
    title: 'Objection & Rebuttal Bank',
    description: "What will people say against this — and what's the best response?",
    path: '/objections',
    emoji: '⚖️',
  },
  {
    id: 'timing',
    title: 'Political Timing & Triggers',
    description: 'When does this become viable — and what should we be watching for?',
    path: '/timing',
    emoji: '⏱️',
  },
];

export default function Landing() {
  return (
    <main className="landing">
      <section className="hero">
        <h1>What would it take to make Muni free?</h1>
        <p>
          A civic intelligence platform for advocates, staffers, and elected
          officials navigating fare-free transit policy in San Francisco.
        </p>
        <Link to="/chat" className="cta-button">
          Ask a Question
        </Link>
      </section>

      <section className="blocks-grid">
        {blocks.map((block) => (
          <Link to={block.path} key={block.id} className="block-card">
            <span className="block-emoji">{block.emoji}</span>
            <h2>{block.title}</h2>
            <p>{block.description}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
