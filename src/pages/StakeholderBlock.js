import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import BlockSidebar from '../components/layout/BlockSidebar';

export default function StakeholderBlock() {
  const [stakeholders, setStakeholders] = useState([]);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [s, d] = await Promise.all([
        supabase.from('stakeholders').select('*').order('name'),
        supabase.from('decision_pathway_steps').select('*, stakeholders(name)').order('step_number'),
      ]);
      setStakeholders(s.data || []);
      setSteps(d.data || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="block-page">
      <div className="block-page-header">
        <h1 className="block-page-title">Stakeholder & Power Map</h1>
        <p className="block-page-subtitle">
          Who decides, who funds, who blocks, who champions, and in what order?
        </p>
      </div>

      <div className="block-layout">
        <BlockSidebar />
        <div className="block-main">
          <div className="block-content">

            <section>
              <h2>Key Stakeholders</h2>
              {stakeholders.length === 0 ? (
                <p className="empty-state">No data yet.</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Stance</th>
                      <th>Authority</th>
                      <th>Veto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stakeholders.map((s) => (
                      <tr key={s.id}>
                        <td><strong>{s.name}</strong><br/><span className="subtle">{s.role}</span></td>
                        <td className="subtle">{s.type}</td>
                        <td><span className={`dot dot-${s.current_stance === 'supportive' ? 'positive' : s.current_stance === 'opposed' ? 'negative' : 'neutral'}`} /> {s.current_stance}</td>
                        <td className="mono">{s.formal_authority}/5</td>
                        <td className="mono">{s.veto_risk}/5</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>

            <section>
              <h2>Decision Pathway</h2>
              {steps.length === 0 ? (
                <p className="empty-state">No data yet.</p>
              ) : (
                <div className="entry-list">
                  {steps.map((step) => (
                    <div key={step.id} className="entry">
                      <span className="entry-number">{step.step_number}</span>
                      <div>
                        <p className="entry-body">{step.description}</p>
                        <p className="entry-meta">
                          {step.stakeholders?.name && <span>{step.stakeholders.name}</span>}
                          {step.typical_timeline && <span> — {step.typical_timeline}</span>}
                        </p>
                      </div>
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
