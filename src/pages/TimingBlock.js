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

  const upcoming = events.filter((e) => e.date && new Date(e.date) >= new Date());
  const past = events.filter((e) => e.date && new Date(e.date) < new Date());

  if (loading) return <div className="loading">Loading data...</div>;

  return (
    <div className="block-page">
      <div className="block-page-header">
        <div className="block-page-number">05</div>
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
              <p className="empty-state">No timing events added yet. Waiting for research data.</p>
            ) : (
              <>
                <section>
                  <h2>Upcoming Windows</h2>
                  <div className="timeline">
                    {upcoming.map((e) => (
                      <div key={e.id} className={`timeline-event impact-${e.impact_on_viability}`}>
                        <span className="timeline-date">{e.date}</span>
                        <span className="badge">{e.type}</span>
                        <span className={`badge badge-${e.impact_on_viability}`}>{e.impact_on_viability}</span>
                        <p>{e.description}</p>
                        {e.action_enabled && <p><strong>Action enabled:</strong> {e.action_enabled}</p>}
                        {e.time_sensitivity && <p className="notes">{e.time_sensitivity}</p>}
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h2>Past Events</h2>
                  <div className="timeline">
                    {past.map((e) => (
                      <div key={e.id} className={`timeline-event impact-${e.impact_on_viability}`}>
                        <span className="timeline-date">{e.date}</span>
                        <span className="badge">{e.type}</span>
                        <p>{e.description}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
