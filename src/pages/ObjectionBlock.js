import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import BlockSidebar from '../components/layout/BlockSidebar';

export default function ObjectionBlock() {
  const [objections, setObjections] = useState([]);
  const [responses, setResponses] = useState([]);
  const [activeAudience, setActiveAudience] = useState('organizer');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [o, r] = await Promise.all([
        supabase.from('objections').select('*'),
        supabase.from('objection_audience_responses').select('*'),
      ]);
      setObjections(o.data || []);
      setResponses(r.data || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  function getResponse(objectionId) {
    return responses.find(
      (r) => r.objection_id === objectionId && r.audience_type === activeAudience
    );
  }

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="block-page">
      <div className="block-page-header">
        <h1 className="block-page-title">Objection & Rebuttal Bank</h1>
        <p className="block-page-subtitle">
          What will people say against this, and what's the best response?
        </p>
      </div>

      <div className="block-layout">
        <BlockSidebar />
        <div className="block-main">
          <div className="block-content">

            <div className="audience-toggle">
              {['organizer', 'staffer', 'official'].map((mode) => (
                <button
                  key={mode}
                  className={activeAudience === mode ? 'active' : ''}
                  onClick={() => setActiveAudience(mode)}
                >
                  {mode === 'official' ? 'Official' : mode}
                </button>
              ))}
            </div>

            <section>
              <h2>Objections</h2>
              {objections.length === 0 ? (
                <p className="empty-state">No data yet.</p>
              ) : (
                <div className="entry-list">
                  {objections.map((obj) => {
                    const resp = getResponse(obj.id);
                    return (
                      <div key={obj.id} className="entry entry-expanded">
                        <p className="entry-quote">"{obj.objection_text}"</p>
                        <p className="entry-meta">{obj.who_makes_it}</p>

                        {obj.evidence_rebuttal && (
                          <div className="entry-section">
                            <span className="entry-section-label">Rebuttal</span>
                            <p>{obj.evidence_rebuttal}</p>
                          </div>
                        )}

                        {obj.rebuttal_weakness && (
                          <div className="entry-section">
                            <span className="entry-section-label entry-section-label-red">Weakness</span>
                            <p>{obj.rebuttal_weakness}</p>
                          </div>
                        )}

                        {resp && (
                          <div className="entry-section">
                            <span className="entry-section-label">For {activeAudience}s</span>
                            <p>{resp.response_text}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
