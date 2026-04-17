import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import BlockSidebar from '../components/layout/BlockSidebar';

function PowerBar({ score }) {
  return (
    <div className="power-bar">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className={`power-block ${i <= score ? 'power-block-filled' : 'power-block-empty'}`} />
      ))}
    </div>
  );
}

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

  const stanceColor = (stance) => {
    if (stance === 'supportive') return 'positive';
    if (stance === 'opposed') return 'negative';
    return 'neutral';
  };

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

            {steps.length > 0 && (
              <section>
                <h2>Decision Pathway</h2>
                <div className="flowchart">
                  {steps.map((step, i) => (
                    <div key={step.id} className="flowchart-step">
                      <div className="flowchart-box">
                        <div className="flowchart-number">Step {step.step_number}</div>
                        <div className="flowchart-label">{step.description}</div>
                        {step.stakeholders?.name && (
                          <div className="flowchart-meta">{step.stakeholders.name}</div>
                        )}
                      </div>
                      {i < steps.length - 1 && <div className="flowchart-arrow" />}
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
                <div>
                  {stakeholders.map((s) => (
                    <div key={s.id} className="stakeholder-card">
                      <div className="stakeholder-header">
                        <span className="stakeholder-name">{s.name}</span>
                        <span className="stakeholder-role">{s.role}</span>
                      </div>
                      <div className="stakeholder-tags">
                        <span className="badge">{s.type}</span>
                        <span className={`badge badge-${stanceColor(s.current_stance)}`}>
                          <span className={`dot dot-${stanceColor(s.current_stance)}`} />
                          {s.current_stance}
                        </span>
                      </div>
                      <div className="power-grid">
                        <div className="power-row">
                          <span className="power-label">Auth</span>
                          <PowerBar score={s.formal_authority} />
                        </div>
                        <div className="power-row">
                          <span className="power-label">Budget</span>
                          <PowerBar score={s.budget_authority} />
                        </div>
                        <div className="power-row">
                          <span className="power-label">Agenda</span>
                          <PowerBar score={s.agenda_setting} />
                        </div>
                        <div className="power-row">
                          <span className="power-label">Veto</span>
                          <PowerBar score={s.veto_risk} />
                        </div>
                        <div className="power-row">
                          <span className="power-label">Coaltn</span>
                          <PowerBar score={s.coalition_value} />
                        </div>
                        <div className="power-row">
                          <span className="power-label">Narr</span>
                          <PowerBar score={s.narrative_influence} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {relationships.length > 0 && (
              <section>
                <h2>Relationships</h2>
                <div>
                  {relationships.map((r) => (
                    <div key={r.id} className="rel-row">
                      <span className="rel-from">{r.from?.name || '—'}</span>
                      <span className="rel-arrow">
                        <span className="rel-arrow-line" />
                        <span>{r.relationship_type}</span>
                        <span className="rel-arrow-line" />
                        <span className="rel-arrow-head">&#9654;</span>
                      </span>
                      <span className="rel-to">{r.to?.name || '—'}</span>
                      <span className={`dot dot-${r.strength === 'strong' ? 'positive' : r.strength === 'weak' ? 'negative' : 'neutral'}`} />
                      <span className="subtle">{r.strength}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
