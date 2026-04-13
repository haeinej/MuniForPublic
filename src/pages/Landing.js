import React from 'react';
import { Link } from 'react-router-dom';

const blocks = [
  {
    number: '01',
    title: 'History & Precedent',
    description: "What's been tried before, here and elsewhere, and what actually happened?",
    path: '/history',
  },
  {
    number: '02',
    title: 'Stakeholder & Power Map',
    description: 'Who decides, who funds, who blocks, who champions, and in what order?',
    path: '/stakeholders',
  },
  {
    number: '03',
    title: 'Funding Pathways',
    description: "Where could the money come from, and what's actually viable?",
    path: '/funding',
  },
  {
    number: '04',
    title: 'Objection & Rebuttal Bank',
    description: "What will people say against this, and what's the best response for the room you're in?",
    path: '/objections',
  },
  {
    number: '05',
    title: 'Political Timing & Triggers',
    description: "When does this become viable, and what should we be watching for?",
    path: '/timing',
  },
];

export default function Landing() {
  return (
    <main className="landing">
      <section className="hero">
        <h1 className="hero-wordmark">
          muniforpublic<span className="tm">TM</span>
        </h1>
        <p className="hero-subtitle">
          A civic intelligence platform for the question: what would it take to
          make San Francisco's Muni transit system free? Built for advocates,
          staffers, and elected officials who move policy.
        </p>
      </section>

      <section className="blocks-section">
        <div className="blocks-section-label">5 Knowledge Blocks</div>
        <div className="blocks-grid">
          {blocks.map((block) => (
            <Link to={block.path} key={block.number} className="block-link">
              <span className="block-link-number">{block.number}</span>
              <div className="block-link-content">
                <div className="block-link-title">{block.title}</div>
                <div className="block-link-desc">{block.description}</div>
              </div>
              <span className="block-link-arrow">&rarr;</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="ask-section">
        <Link to="/chat" className="ask-link">
          Ask a question &rarr;
        </Link>
        <span className="ask-desc">
          Pulls from all 5 blocks. Adjusts for your audience.
        </span>
      </section>

      <footer className="landing-footer">
        muniforpublic™ — civic intelligence for fare-free transit
      </footer>
    </main>
  );
}
