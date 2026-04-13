import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

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
    <main className="block-page">
      <h1>Objection & Rebuttal Bank</h1>
      <p className="block-subtitle">
        What will people say against this — and what's the best response for the room you're in?
      </p>

      <div className="audience-toggle">
        {['organizer', 'staffer', 'official'].map((mode) => (
          <button
            key={mode}
            className={activeAudience === mode ? 'active' : ''}
            onClick={() => setActiveAudience(mode)}
          >
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </button>
        ))}
      </div>

      {objections.length === 0 ? (
        <p className="empty-state">No objections added yet. Person 2: write the 7 core objection cards.</p>
      ) : (
        <div className="card-grid">
          {objections.map((obj) => {
            const resp = getResponse(obj.id);
            return (
              <div key={obj.id} className="card objection-card">
                <h3>"{obj.objection_text}"</h3>
                <p><strong>Who makes it:</strong> {obj.who_makes_it}</p>
                <p><strong>Value claimed:</strong> {obj.value_claimed}</p>

                <div className="rebuttal-section">
                  <h4>Evidence-based rebuttal</h4>
                  <p>{obj.evidence_rebuttal}</p>

                  <h4>Where this rebuttal is weak</h4>
                  <p className="weakness">{obj.rebuttal_weakness}</p>

                  {resp && (
                    <>
                      <h4>Response for {activeAudience}s</h4>
                      <p>{resp.response_text}</p>
                      {resp.key_evidence && (
                        <p><strong>Key evidence:</strong> {resp.key_evidence}</p>
                      )}
                      {resp.recommended_tone && (
                        <p><em>Tone: {resp.recommended_tone}</em></p>
                      )}
                    </>
                  )}
                </div>

                {obj.city_precedent && (
                  <p><strong>City precedent:</strong> {obj.city_precedent}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
