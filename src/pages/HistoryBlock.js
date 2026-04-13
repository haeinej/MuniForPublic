import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function HistoryBlock() {
  const [precedents, setPrecedents] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [memory, setMemory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [p, t, m] = await Promise.all([
        supabase.from('precedents').select('*').order('year', { ascending: false }),
        supabase.from('timeline_events').select('*').order('date', { ascending: false }),
        supabase.from('campaign_memory').select('*'),
      ]);
      setPrecedents(p.data || []);
      setTimeline(t.data || []);
      setMemory(m.data || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <main className="block-page">
      <h1>History & Precedent</h1>
      <p className="block-subtitle">
        What's been tried before — here and elsewhere — and what actually happened?
      </p>

      <section>
        <h2>City Precedents</h2>
        {precedents.length === 0 ? (
          <p className="empty-state">No precedents added yet. Person 2: add city precedent data.</p>
        ) : (
          <div className="card-grid">
            {precedents.map((p) => (
              <div key={p.id} className="card">
                <h3>{p.city} — {p.policy_name}</h3>
                <span className="badge">{p.year}</span>
                <span className={`badge badge-${p.sf_comparability}`}>{p.sf_comparability} comparability</span>
                <p><strong>Scope:</strong> {p.scope}</p>
                <p><strong>Funding:</strong> {p.funding_mechanism}</p>
                <p><strong>Outcomes:</strong> {p.outcomes}</p>
                <p><strong>Key Lessons:</strong> {p.key_lessons}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2>Campaign Timeline</h2>
        {timeline.length === 0 ? (
          <p className="empty-state">No timeline events yet. Person 2: add historical events.</p>
        ) : (
          <div className="timeline">
            {timeline.map((e) => (
              <div key={e.id} className={`timeline-event impact-${e.impact_on_viability}`}>
                <span className="timeline-date">{e.date}</span>
                <span className="badge">{e.type}</span>
                <p>{e.description}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2>Campaign Memory</h2>
        {memory.length === 0 ? (
          <p className="empty-state">No campaign memory yet. Person 2: capture movement knowledge.</p>
        ) : (
          <div className="card-grid">
            {memory.map((m) => (
              <div key={m.id} className="card">
                <p><strong>Moment:</strong> {m.moment}</p>
                <p><strong>Who:</strong> {m.who_involved}</p>
                <p><strong>What shifted:</strong> {m.what_shifted}</p>
                <p><strong>Lesson:</strong> {m.strategic_lesson}</p>
                <span className="badge">{m.source_type}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
