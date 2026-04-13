import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import BlockSidebar from '../components/layout/BlockSidebar';

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

  if (loading) return <div className="loading">Loading data...</div>;

  return (
    <div className="block-page">
      <div className="block-page-header">
        <div className="block-page-number">03</div>
        <h1 className="block-page-title">Funding Pathways</h1>
        <p className="block-page-subtitle">
          Where could the money come from, and what's actually viable?
        </p>
      </div>

      <div className="block-layout">
        <BlockSidebar />
        <div className="block-main">
          <div className="block-content">
            <section>
              <h2>Funding Sources</h2>
              {sources.length === 0 ? (
                <p className="empty-state">No funding sources added yet. Waiting for research data.</p>
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
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
