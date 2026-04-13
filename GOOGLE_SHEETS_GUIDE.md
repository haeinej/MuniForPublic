# Google Sheets Guide for Person 2

Create a Google Sheet with one tab per table below. Column headers must match exactly.

## Tab: claims
| text | confidence | category |
|------|-----------|----------|
| Free transit increases ridership by 20-30% | high | ridership |

**confidence:** high, medium, low, contested
**category:** access, equity, fiscal, ridership, operations

## Tab: sources
| title | type | author | date | url | summary |
|-------|------|--------|------|-----|---------|

**type:** interview, report, budget_doc, news, academic, government

## Tab: claim_sources
| claim_id | source_id | relationship |
|----------|-----------|-------------|

**relationship:** supports, contradicts, contextualizes
(Use IDs from Supabase after initial import, or leave blank for manual linking)

## Tab: stakeholders
| name | type | role | formal_authority | budget_authority | agenda_setting | veto_risk | coalition_value | narrative_influence | timing_sensitivity | current_stance | notes |
|------|------|------|-----------------|-----------------|---------------|-----------|----------------|--------------------|--------------------|----------------|-------|

**type:** individual, agency, elected, coalition, business, media
**authority scores:** 1-5
**current_stance:** supportive, opposed, neutral, unknown

## Tab: stakeholder_relationships
| from_id | to_id | relationship_type | strength | notes |
|---------|-------|------------------|----------|-------|

**relationship_type:** funds, advises, appoints, pressures, defers_to, opposes, allies_with
**strength:** strong, moderate, weak

## Tab: funding_sources
| name | category | description | legal_eligibility | operating_or_capital | recurring_or_onetime | estimated_amount | vote_threshold | political_feasibility | precedent | dependencies | notes |
|------|----------|-------------|------------------|---------------------|---------------------|-----------------|---------------|---------------------|-----------|-------------|-------|

**category:** tax, grant, philanthropy, partnership
**operating_or_capital:** operating, capital, both
**recurring_or_onetime:** recurring, one-time, pilot
**political_feasibility:** high, medium, low

## Tab: objections
| objection_text | who_makes_it | value_claimed | evidence_rebuttal | rebuttal_weakness | city_precedent |
|---------------|-------------|--------------|-------------------|-------------------|---------------|

## Tab: objection_audience_responses
| objection_id | audience_type | response_text | key_evidence | recommended_tone |
|-------------|--------------|---------------|-------------|-----------------|

**audience_type:** organizer, staffer, official

## Tab: precedents
| city | policy_name | year | scope | funding_mechanism | outcomes | sf_comparability | key_lessons |
|------|------------|------|-------|------------------|----------|-----------------|-------------|

**sf_comparability:** high, medium, low

## Tab: timeline_events
| date | description | type | impact_on_viability | stakeholders_affected | action_enabled | time_sensitivity |
|------|------------|------|--------------------|--------------------|---------------|-----------------|

**type:** fiscal, electoral, sentiment, institutional, policy, external
**impact_on_viability:** positive, negative, neutral

## Tab: campaign_memory
| moment | who_involved | what_shifted | strategic_lesson | source_type |
|--------|-------------|-------------|-----------------|-------------|

**source_type:** interview, personal_account, document

## Tab: decision_pathway_steps
| step_number | description | requirements | typical_timeline |
|------------|------------|-------------|-----------------|

---

## How to import

1. Export each tab as CSV (File > Download > CSV)
2. Save to `data/` folder
3. Run: `node scripts/import-from-sheets.js <table-name> data/<filename>.csv`
