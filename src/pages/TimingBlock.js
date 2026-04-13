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
                {upcoming.length > 0 && (
                  <section>
                    <h2>Upcoming</h2>
                    <table className="data-table">
                      <thead>
                        <tr><th>Date</th><th>Event</th><th>Type</th><th>Impact</th></tr>
                      </thead>
                      <tbody>
                        {upcoming.map((e) => (
                          <tr key={e.id}>
                            <td className="mono">{e.date}</td>
                            <td>{e.description}</td>
                            <td className="subtle">{e.type}</td>
                            <td><span className={`dot dot-${e.impact_on_viability}`} /> {e.impact_on_viability}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </section>
                )}

                {past.length > 0 && (
                  <section>
                    <h2>Past Events</h2>
                    <table className="data-table">
                      <thead>
                        <tr><th>Date</th><th>Event</th><th>Type</th></tr>
                      </thead>
                      <tbody>
                        {past.map((e) => (
                          <tr key={e.id}>
                            <td className="mono">{e.date}</td>
                            <td>{e.description}</td>
                            <td className="subtle">{e.type}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
