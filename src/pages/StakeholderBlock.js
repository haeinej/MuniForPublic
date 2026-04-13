import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function StakeholderBlock() {
  const [stakeholders, setStakeholders] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [s, r, d] = await Promise.all([
        supabase.from('stakeholders').select('*').order('name'),
        supabase.from('stakeholder_relationships').select('*'),
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
    <main className="block-page">
      <h1>Stakeholder & Power Map</h1>
      <p className="block-subtitle">
        Who decides, who funds, who blocks, who champions — and in what order?
      </p>

      <section>
        <h2>Key Stakeholders</h2>
        {stakeholders.length === 0 ? (
          <p className="empty-state">No stakeholders added yet. Person 2: profile key decision-makers.</p>
        ) : (
          <div className="card-grid">
            {stakeholders.map((s) => (
              <div key={s.id} className="card">
                <h3>{s.name}</h3>
                <span className="badge">{s.type}</span>
                <span className={`badge badge-${s.current_stance}`}>{s.current_stance}</span>
                <p><strong>Role:</strong> {s.role}</p>
                <div className="power-scores">
                  <span>Authority: {s.formal_authority}/5</span>
                  <span>Budget: {s.budget_authority}/5</span>
                  <span>Agenda: {s.agenda_setting}/5</span>
                  <span>Veto: {s.veto_risk}/5</span>
                  <span>Coalition: {s.coalition_value}/5</span>
                  <span>Narrative: {s.narrative_influence}/5</span>
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
          <p className="empty-state">No decision pathway mapped yet. Person 2: map the approval sequence.</p>
        ) : (
          <ol className="decision-pathway">
            {steps.map((step) => (
              <li key={step.id}>
                <strong>Step {step.step_number}:</strong> {step.description}
                {step.stakeholders?.name && <span className="badge">{step.stakeholders.name}</span>}
                {step.typical_timeline && <span className="timeline-badge">{step.typical_timeline}</span>}
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}
