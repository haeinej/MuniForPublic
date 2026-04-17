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
                  {mode}
                </button>
              ))}
            </div>

            <section>
              <h2>Objections</h2>
              {objections.length === 0 ? (
                <p className="empty-state">No data yet.</p>
              ) : (
                <div>
                  {objections.map((obj) => {
                    const resp = getResponse(obj.id);
                    return (
                      <div key={obj.id} className="objection-card">
                        <p className="entry-quote">"{obj.objection_text}"</p>
                        <div className="objection-who">
                          {obj.who_makes_it && obj.who_makes_it.split(',').map((who, i) => (
                            <span key={i} className="badge">{who.trim()}</span>
                          ))}
                        </div>

                        {obj.evidence_rebuttal && (
                          <div className="objection-section objection-section-rebuttal">
                            <div className="objection-section-header">
                              <span className="objection-section-icon">&#9632;</span>
                              <span className="entry-section-label">Evidence Rebuttal</span>
                            </div>
                            <p className="entry-body" style={{ fontSize: '13px', color: 'var(--color-gray-dark)' }}>{obj.evidence_rebuttal}</p>
                          </div>
                        )}

                        {obj.rebuttal_weakness && (
                          <div className="objection-section objection-section-weakness">
                            <div className="objection-section-header">
                              <span className="objection-section-icon" style={{ color: 'var(--color-red)' }}>&#9650;</span>
                              <span className="entry-section-label entry-section-label-red">Weakness</span>
                            </div>
                            <p className="entry-body" style={{ fontSize: '13px', color: 'var(--color-gray-dark)' }}>{obj.rebuttal_weakness}</p>
                          </div>
                        )}

                        {obj.city_precedent && (
                          <div className="objection-section objection-section-audience">
                            <div className="objection-section-header">
                              <span className="objection-section-icon">&#9679;</span>
                              <span className="entry-section-label">City Precedent</span>
                            </div>
                            <p className="entry-body" style={{ fontSize: '13px', color: 'var(--color-gray-dark)' }}>{obj.city_precedent}</p>
                          </div>
                        )}

                        {resp && (
                          <div className="objection-section objection-section-audience" style={{ borderLeftColor: 'var(--color-black)' }}>
                            <div className="objection-section-header">
                              <span className="objection-section-icon">&#9654;</span>
                              <span className="entry-section-label">For {activeAudience}s</span>
                            </div>
                            <p className="entry-body" style={{ fontSize: '13px', color: 'var(--color-gray-dark)' }}>{resp.response_text}</p>
                            {resp.recommended_tone && (
                              <p className="subtle" style={{ marginTop: '4px' }}>Tone: {resp.recommended_tone}</p>
                            )}
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
