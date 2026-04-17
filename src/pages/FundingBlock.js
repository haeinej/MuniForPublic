import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import BlockSidebar from '../components/layout/BlockSidebar';

function parseAmount(str) {
  if (!str) return 0;
  const match = str.match(/\$\s*([\d,.]+)\s*(million|M)/i);
  if (match) return parseFloat(match[1].replace(/,/g, ''));
  const matchB = str.match(/\$\s*([\d,.]+)\s*(billion|B)/i);
  if (matchB) return parseFloat(matchB[1].replace(/,/g, '')) * 1000;
  const matchPlain = str.match(/([\d,.]+)\s*(million|M)/i);
  if (matchPlain) return parseFloat(matchPlain[1].replace(/,/g, ''));
  return 0;
}

function FeasibilityDots({ level }) {
  const filled = level === 'high' ? 3 : level === 'medium' ? 2 : 1;
  const colorClass = level === 'high' ? 'filled' : level === 'medium' ? 'filled-medium' : 'filled-low';
  return (
    <div className="funding-feasibility">
      {[1, 2, 3].map((i) => (
        <div key={i} className={`feasibility-dot ${i <= filled ? colorClass : ''}`} />
      ))}
    </div>
  );
}

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

  const TARGET = 307;
  const recurring = sources.filter(s => s.recurring_or_onetime === 'recurring');
  const amounts = recurring.map(s => ({ name: s.name, amount: parseAmount(s.estimated_amount) })).filter(a => a.amount > 0);
  const total = amounts.reduce((sum, a) => sum + a.amount, 0);
  const maxAmount = Math.max(TARGET, total);

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

            {amounts.length > 0 && (
              <div className="funding-stack">
                <div className="funding-stack-title">Recurring Revenue vs. Deficit Target</div>
                <div className="funding-stack-target">
                  ${total}M <span className="subtle" style={{ fontSize: '14px' }}>/ ${TARGET}M target</span>
                </div>
                <div className="funding-stack-bar-bg">
                  <div
                    className={`funding-stack-bar-fill ${total >= TARGET ? '' : ''}`}
                    style={{ width: `${Math.min((total / maxAmount) * 100, 100)}%` }}
                  />
                </div>
                <div className="funding-stack-items">
                  {amounts.map((a, i) => (
                    <div key={i} className="funding-stack-item">
                      <span className="funding-stack-item-name">{a.name}</span>
                      <div className="funding-stack-item-bar">
                        <div className="funding-stack-item-fill" style={{ width: `${(a.amount / maxAmount) * 100}%` }} />
                      </div>
                      <span className="funding-stack-item-amount">${a.amount}M</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <section>
              <h2>All Funding Sources</h2>
              {sources.length === 0 ? (
                <p className="empty-state">No data yet.</p>
              ) : (
                <div>
                  {sources.map((s) => (
                    <div
                      key={s.id}
                      className="funding-card"
                      onClick={() => setExpanded(expanded === s.id ? null : s.id)}
                    >
                      <div className="funding-card-header">
                        <div>
                          <div className="funding-card-name">{s.name}</div>
                          <div className="funding-card-category">{s.category}</div>
                        </div>
                        {s.estimated_amount && (
                          <span className="mono">{s.estimated_amount}</span>
                        )}
                      </div>
                      <div className="funding-card-meta">
                        <span className="badge">{s.operating_or_capital}</span>
                        <span className="badge">{s.recurring_or_onetime}</span>
                        {s.political_feasibility && (
                          <>
                            <FeasibilityDots level={s.political_feasibility} />
                            <span className="subtle">{s.political_feasibility} feasibility</span>
                          </>
                        )}
                        {s.vote_threshold && (
                          <span className="subtle">{s.vote_threshold}</span>
                        )}
                      </div>
                      {expanded === s.id && (
                        <div className="expanded-cell" style={{ marginTop: '12px' }}>
                          {s.description && <p>{s.description}</p>}
                          {s.legal_eligibility && <p><strong>Legal eligibility:</strong> {s.legal_eligibility}</p>}
                          {s.precedent && <p><strong>Precedent:</strong> {s.precedent}</p>}
                          {s.dependencies && <p><strong>Dependencies:</strong> {s.dependencies}</p>}
                          {s.notes && <p className="notes">{s.notes}</p>}
                        </div>
                      )}
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
