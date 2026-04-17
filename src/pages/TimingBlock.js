import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import BlockSidebar from '../components/layout/BlockSidebar';

export default function TimingBlock() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase.from('timeline_events').select('*').order('date', { ascending: true });
      setEvents(data || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  const now = new Date();
  const upcoming = events.filter((e) => e.date && new Date(e.date) >= now);
  const past = events.filter((e) => e.date && new Date(e.date) < now);
  const isPast = (dateStr) => dateStr && new Date(dateStr) < now;

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="block-page">
      <div className="block-page-header">
        <h1 className="block-page-title">Political Timing & Triggers</h1>
        <p className="block-page-subtitle">
          When does this become viable, and what should we be watching for?
        </p>
      </div>

      <div className="block-layout">
        <BlockSidebar />
        <div className="block-main">
          <div className="block-content">

            {events.length === 0 ? (
              <p className="empty-state">No data yet.</p>
            ) : (
              <>
                {/* Horizontal timeline overview */}
                <section>
                  <h2>Timeline Overview</h2>
                  <div className="timeline-h">
                    <div className="timeline-h-line" />
                    <div className="timeline-h-events">
                      {events.map((e) => (
                        <div key={e.id} className="timeline-h-event">
                          <div className="timeline-h-date">
                            {e.date ? new Date(e.date).getFullYear() : '—'}
                          </div>
                          <div className={`timeline-h-node ${isPast(e.date) ? `timeline-h-node-${e.impact_on_viability || 'neutral'}` : 'timeline-h-node-upcoming'}`} />
                          <div className="timeline-h-label">
                            {e.description.length > 60 ? e.description.substring(0, 57) + '...' : e.description}
                          </div>
                          <div style={{ marginTop: '4px' }}>
                            <span className="badge">{e.type}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="timeline-h-legend">
                    <div className="timeline-h-legend-item">
                      <div className="timeline-h-node timeline-h-node-positive" style={{ width: '10px', height: '10px', margin: 0 }} /> past/positive
                    </div>
                    <div className="timeline-h-legend-item">
                      <div className="timeline-h-node timeline-h-node-negative" style={{ width: '10px', height: '10px', margin: 0 }} /> past/negative
                    </div>
                    <div className="timeline-h-legend-item">
                      <div className="timeline-h-node timeline-h-node-upcoming" style={{ width: '10px', height: '10px', margin: 0 }} /> upcoming
                    </div>
                  </div>
                </section>

                {/* Detailed tables */}
                {upcoming.length > 0 && (
                  <section>
                    <h2>Upcoming</h2>
                    <div className="timeline-v">
                      {upcoming.map((e) => (
                        <div key={e.id} className="timeline-v-item">
                          <div className="timeline-v-node timeline-v-node-upcoming" />
                          <div className="timeline-v-date">{e.date}</div>
                          <div className="timeline-v-body">{e.description}</div>
                          <div className="timeline-v-badges">
                            <span className="badge">{e.type}</span>
                            <span className={`badge badge-${e.impact_on_viability}`}>{e.impact_on_viability}</span>
                          </div>
                          {e.action_enabled && (
                            <div className="subtle" style={{ marginTop: '4px' }}>
                              Action: {e.action_enabled}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {past.length > 0 && (
                  <section>
                    <h2>Past Events</h2>
                    <div className="timeline-v">
                      {past.map((e) => (
                        <div key={e.id} className="timeline-v-item">
                          <div className={`timeline-v-node timeline-v-node-${e.impact_on_viability || 'neutral'}`} />
                          <div className="timeline-v-date">{e.date}</div>
                          <div className="timeline-v-body">{e.description}</div>
                          <div className="timeline-v-badges">
                            <span className="badge">{e.type}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
