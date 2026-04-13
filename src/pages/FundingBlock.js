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
                      <th>Category</th>
                      <th>Type</th>
                      <th>Feasibility</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sources.map((s) => (
                      <tr key={s.id}>
                        <td><strong>{s.name}</strong><br/><span className="subtle">{s.description}</span></td>
                        <td className="subtle">{s.category}</td>
                        <td className="subtle">{s.recurring_or_onetime}</td>
                        <td><span className={`dot dot-${s.political_feasibility === 'high' ? 'positive' : s.political_feasibility === 'low' ? 'negative' : 'neutral'}`} /> {s.political_feasibility}</td>
                        <td className="mono">{s.estimated_amount || '—'}</td>
                      </tr>
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
