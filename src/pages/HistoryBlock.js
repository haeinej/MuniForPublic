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

  if (loading) return <div className="loading">Loading...</div>;

  // Interleave campaign memory into timeline by date proximity
  const allEvents = [
    ...timeline.map(e => ({ ...e, kind: 'event' })),
    ...memory.map(m => ({ ...m, kind: 'memory', date: null })),
  ];

  return (
    <div className="block-page">
      <div className="block-page-header">
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
              <h2>Timeline</h2>
              {timeline.length === 0 && memory.length === 0 ? (
                <p className="empty-state">No data yet.</p>
              ) : (
                <div className="entry-list">
                  {timeline.map((e) => (
                    <div key={e.id} className="entry">
                      <div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                          <span className="mono">{e.date}</span>
                          <span className="badge">{e.type}</span>
                          <span className={`dot dot-${e.impact_on_viability}`} />
                        </div>
                        <p className="entry-body">{e.description}</p>
                      </div>
                    </div>
                  ))}

                  {memory.length > 0 && (
                    <>
                      <div style={{ borderBottom: '1px solid var(--color-gray-light)', margin: '8px 0' }} />
                      {memory.map((m) => (
                        <div key={m.id} className="entry" style={{ borderLeft: '3px solid var(--color-red)', paddingLeft: '16px' }}>
                          <div>
                            <p className="entry-quote">"{m.moment}"</p>
                            <p className="entry-meta">
                              {m.who_involved}{m.strategic_lesson ? ` — ${m.strategic_lesson}` : ''}
                            </p>
                            <span className="badge">{m.source_type}</span>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </section>

            <section>
              <h2>City Precedents</h2>
              {precedents.length === 0 ? (
                <p className="empty-state">No data yet.</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>City</th>
                      <th>Year</th>
                      <th>Scope</th>
                      <th>Comparability</th>
                    </tr>
                  </thead>
                  <tbody>
                    {precedents.map((p) => (
                      <tr key={p.id}>
                        <td><strong>{p.city}</strong><br/><span className="subtle">{p.policy_name}</span></td>
                        <td>{p.year}</td>
                        <td>{p.scope}</td>
                        <td><span className={`dot dot-${p.sf_comparability === 'high' ? 'positive' : p.sf_comparability === 'low' ? 'negative' : 'neutral'}`} /> {p.sf_comparability}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
