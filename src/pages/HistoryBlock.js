import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import BlockSidebar from '../components/layout/BlockSidebar';

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

  if (loading) return <div className="loading">Loading data...</div>;

  return (
    <div className="block-page">
      <div className="block-page-header">
        <div className="block-page-number">01</div>
        <h1 className="block-page-title">History & Precedent</h1>
        <p className="block-page-subtitle">
          What's been tried before, here and elsewhere, and what actually happened?
        </p>
      </div>

      <div className="block-layout">
        <BlockSidebar />
        <div className="block-main">
          <div className="block-content">
            <section>
              <h2>City Precedents</h2>
              {precedents.length === 0 ? (
                <p className="empty-state">No precedents added yet. Waiting for research data.</p>
              ) : (
                <div className="card-grid">
                  {precedents.map((p) => (
                    <div key={p.id} className="card">
                      <h3>{p.city} / {p.policy_name}</h3>
                      <div className="badge-row">
                        <span className="badge">{p.year}</span>
                        <span className={`badge badge-${p.sf_comparability}`}>
                          {p.sf_comparability} comparability
                        </span>
                      </div>
                      <p><strong>Scope:</strong> {p.scope}</p>
                      <p><strong>Funding:</strong> {p.funding_mechanism}</p>
                      <p><strong>Outcomes:</strong> {p.outcomes}</p>
                      <p><strong>Key lessons:</strong> {p.key_lessons}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2>Campaign Timeline</h2>
              {timeline.length === 0 ? (
                <p className="empty-state">No timeline events yet. Waiting for research data.</p>
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
                <p className="empty-state">No campaign memory yet. Waiting for interview data.</p>
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
          </div>
        </div>
      </div>
    </div>
  );
}
