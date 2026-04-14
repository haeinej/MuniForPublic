import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import BlockSidebar from '../components/layout/BlockSidebar';

export default function StakeholderBlock() {
  const [stakeholders, setStakeholders] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [s, r, d] = await Promise.all([
        supabase.from('stakeholders').select('*').order('name'),
        supabase.from('stakeholder_relationships').select('*, from:stakeholders!stakeholder_relationships_from_id_fkey(name), to:stakeholders!stakeholder_relationships_to_id_fkey(name)'),
        supabase.from('decision_pathway_steps').select('*, stakeholders(name)').order('step_number'),
      ]);
      setStakeholders(s.data || []);
      setRelationships(r.data || []);
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

            {/* Decision pathway at top */}
            {steps.length > 0 && (
              <section>
                <h2>Decision Pathway</h2>
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
              </section>
            )}

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
                      <th>Auth</th>
                      <th>Budget</th>
                      <th>Agenda</th>
                      <th>Veto</th>
                      <th>Coalition</th>
                      <th>Narrative</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stakeholders.map((s) => (
                      <tr key={s.id}>
                        <td>
                          <strong>{s.name}</strong>
                          <br/><span className="subtle">{s.role}</span>
                        </td>
                        <td className="subtle">{s.type}</td>
                        <td>
                          <span className={`dot dot-${s.current_stance === 'supportive' ? 'positive' : s.current_stance === 'opposed' ? 'negative' : 'neutral'}`} />
                          {s.current_stance}
                        </td>
                        <td className="mono">{s.formal_authority}</td>
                        <td className="mono">{s.budget_authority}</td>
                        <td className="mono">{s.agenda_setting}</td>
                        <td className="mono">{s.veto_risk}</td>
                        <td className="mono">{s.coalition_value}</td>
                        <td className="mono">{s.narrative_influence}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>

            {relationships.length > 0 && (
              <section>
                <h2>Relationships</h2>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>From</th>
                      <th>Relationship</th>
                      <th>To</th>
                      <th>Strength</th>
                    </tr>
                  </thead>
                  <tbody>
                    {relationships.map((r) => (
                      <tr key={r.id}>
                        <td>{r.from?.name || '—'}</td>
                        <td className="subtle">{r.relationship_type}</td>
                        <td>{r.to?.name || '—'}</td>
                        <td>
                          <span className={`dot dot-${r.strength === 'strong' ? 'positive' : r.strength === 'weak' ? 'negative' : 'neutral'}`} />
                          {r.strength}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
