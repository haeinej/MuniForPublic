import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function FundingBlock() {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase.from('funding_sources').select('*').order('name');
      setSources(data || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <main className="block-page">
      <h1>Funding Pathways</h1>
      <p className="block-subtitle">
        Where could the money come from — and what's actually viable?
      </p>

      {sources.length === 0 ? (
        <p className="empty-state">No funding sources added yet. Person 2: research and profile revenue sources.</p>
      ) : (
        <div className="card-grid">
          {sources.map((s) => (
            <div key={s.id} className="card">
              <h3>{s.name}</h3>
              <div className="badge-row">
                <span className="badge">{s.category}</span>
                <span className="badge">{s.operating_or_capital}</span>
                <span className="badge">{s.recurring_or_onetime}</span>
                <span className={`badge badge-${s.political_feasibility}`}>
                  {s.political_feasibility} feasibility
                </span>
              </div>
              <p>{s.description}</p>
              <p><strong>Legal eligibility:</strong> {s.legal_eligibility}</p>
              <p><strong>Estimated amount:</strong> {s.estimated_amount}</p>
              <p><strong>Vote threshold:</strong> {s.vote_threshold}</p>
              {s.precedent && <p><strong>Precedent:</strong> {s.precedent}</p>}
              {s.dependencies && <p><strong>Dependencies:</strong> {s.dependencies}</p>}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
