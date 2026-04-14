import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import BlockSidebar from '../components/layout/BlockSidebar';

export default function FundingBlock() {
  const [sources, setSources] = useState([]);
  const [expanded, setExpanded] = useState(null);
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
    <div className="block-page">
      <div className="block-page-header">
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
                <p className="empty-state">No data yet.</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Source</th>
                      <th>Type</th>
                      <th>Recurring</th>
                      <th>Feasibility</th>
                      <th>Threshold</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sources.map((s) => (
                      <React.Fragment key={s.id}>
                        <tr
                          onClick={() => setExpanded(expanded === s.id ? null : s.id)}
                          style={{ cursor: 'pointer' }}
                        >
                          <td>
                            <strong>{s.name}</strong>
                            <br/><span className="subtle">{s.category}</span>
                          </td>
                          <td className="subtle">{s.operating_or_capital}</td>
                          <td className="subtle">{s.recurring_or_onetime}</td>
                          <td>
                            <span className={`dot dot-${s.political_feasibility === 'high' ? 'positive' : s.political_feasibility === 'low' ? 'negative' : 'neutral'}`} />
                            {s.political_feasibility}
                          </td>
                          <td className="subtle">{s.vote_threshold || '—'}</td>
                        </tr>
                        {expanded === s.id && (
                          <tr>
                            <td colSpan="5" className="expanded-cell">
                              {s.description && <p>{s.description}</p>}
                              {s.legal_eligibility && <p><strong>Legal eligibility:</strong> {s.legal_eligibility}</p>}
                              {s.estimated_amount && <p><strong>Estimated amount:</strong> {s.estimated_amount}</p>}
                              {s.precedent && <p><strong>Precedent:</strong> {s.precedent}</p>}
                              {s.dependencies && <p><strong>Dependencies:</strong> {s.dependencies}</p>}
                              {s.notes && <p className="notes">{s.notes}</p>}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
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
