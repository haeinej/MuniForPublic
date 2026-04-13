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

  if (loading) return <div className="loading">Loading data...</div>;

  return (
    <div className="block-page">
      <div className="block-page-header">
        <div className="block-page-number">02</div>
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
                <p className="empty-state">No stakeholders added yet. Waiting for research data.</p>
              ) : (
                <div className="card-grid">
                  {stakeholders.map((s) => (
                    <div key={s.id} className="card">
                      <h3>{s.name}</h3>
                      <div className="badge-row">
                        <span className="badge">{s.type}</span>
                        <span className={`badge badge-${s.current_stance}`}>{s.current_stance}</span>
                      </div>
                      <p><strong>Role:</strong> {s.role}</p>
                      <div className="power-scores">
                        <span>Authority {s.formal_authority}/5</span>
                        <span>Budget {s.budget_authority}/5</span>
                        <span>Agenda {s.agenda_setting}/5</span>
                        <span>Veto {s.veto_risk}/5</span>
                        <span>Coalition {s.coalition_value}/5</span>
                        <span>Narrative {s.narrative_influence}/5</span>
                      </div>
                      {s.notes && <p className="notes">{s.notes}</p>}
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2>Decision Pathway</h2>
              {steps.length === 0 ? (
                <p className="empty-state">No decision pathway mapped yet. Waiting for research data.</p>
              ) : (
                <ol className="decision-pathway">
                  {steps.map((step) => (
                    <li key={step.id}>
                      {step.description}
                      {step.stakeholders?.name && <span className="badge">{step.stakeholders.name}</span>}
                      {step.typical_timeline && <span className="timeline-badge">{step.typical_timeline}</span>}
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
