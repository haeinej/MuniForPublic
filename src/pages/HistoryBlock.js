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
                        <td><span className={`dot dot-${p.sf_comparability}`} /> {p.sf_comparability}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>

            <section>
              <h2>Timeline</h2>
              {timeline.length === 0 ? (
                <p className="empty-state">No data yet.</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Event</th>
                      <th>Type</th>
                      <th>Impact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timeline.map((e) => (
                      <tr key={e.id}>
                        <td className="mono">{e.date}</td>
                        <td>{e.description}</td>
                        <td className="subtle">{e.type}</td>
                        <td><span className={`dot dot-${e.impact_on_viability}`} /> {e.impact_on_viability}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>

            <section>
              <h2>Campaign Memory</h2>
              {memory.length === 0 ? (
                <p className="empty-state">No data yet.</p>
              ) : (
                <div className="entry-list">
                  {memory.map((m) => (
                    <div key={m.id} className="entry">
                      <p className="entry-body">{m.moment}</p>
                      <p className="entry-meta">
                        {m.who_involved && <span>{m.who_involved}</span>}
                        {m.strategic_lesson && <span> — {m.strategic_lesson}</span>}
                      </p>
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
