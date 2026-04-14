/**
 * Import script: Google Sheets CSV → Supabase
 *
 * Resolves human-readable references to database IDs:
 *   - source_title → source_id
 *   - from_name / to_name → stakeholder IDs
 *   - objection_text → objection_id
 *
 * Usage:
 *   node scripts/import.js <table-name> <csv-file>
 *
 * Import order (dependencies matter):
 *   1. sources
 *   2. claims
 *   3. stakeholders
 *   4. claim_sources
 *   5. stakeholder_relationships
 *   6. decision_pathway_steps
 *   7. funding_sources
 *   8. objections
 *   9. objection_audience_responses
 *  10. precedents
 *  11. timeline_events
 *  12. campaign_memory
 *
 * Env vars (in .env):
 *   REACT_APP_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config();

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const VALID_TABLES = [
  'sources', 'claims', 'claim_sources', 'stakeholders',
  'stakeholder_relationships', 'decision_pathway_steps',
  'funding_sources', 'objections', 'objection_audience_responses',
  'precedents', 'timeline_events', 'campaign_memory',
];

const NUMERIC_FIELDS = [
  'formal_authority', 'budget_authority', 'agenda_setting',
  'veto_risk', 'coalition_value', 'narrative_influence',
  'step_number', 'year',
];

async function lookupSourceId(title) {
  if (!title) return null;
  const { data } = await supabase
    .from('sources')
    .select('id')
    .ilike('title', title.trim())
    .limit(1);
  if (data && data.length > 0) return data[0].id;
  console.warn(`  WARNING: source not found: "${title}"`);
  return null;
}

async function lookupStakeholderId(name) {
  if (!name) return null;
  const { data } = await supabase
    .from('stakeholders')
    .select('id')
    .ilike('name', name.trim())
    .limit(1);
  if (data && data.length > 0) return data[0].id;
  console.warn(`  WARNING: stakeholder not found: "${name}"`);
  return null;
}

async function lookupObjectionId(text) {
  if (!text) return null;
  const { data } = await supabase
    .from('objections')
    .select('id')
    .ilike('objection_text', text.trim().substring(0, 50) + '%')
    .limit(1);
  if (data && data.length > 0) return data[0].id;
  console.warn(`  WARNING: objection not found: "${text.substring(0, 60)}..."`);
  return null;
}

function cleanRow(row) {
  const out = {};
  for (const [key, val] of Object.entries(row)) {
    out[key] = val === '' ? null : val;
  }
  for (const field of NUMERIC_FIELDS) {
    if (out[field] !== null && out[field] !== undefined) {
      out[field] = parseInt(out[field], 10);
    }
  }
  if (!out.id) delete out.id;
  delete out.embedding;
  return out;
}

async function resolveReferences(tableName, row) {
  // Resolve source_title → source_id
  if (row.source_title !== undefined) {
    row.source_id = await lookupSourceId(row.source_title);
    delete row.source_title;
  }

  // Resolve from_name/to_name → stakeholder IDs
  if (tableName === 'stakeholder_relationships') {
    if (row.from_name !== undefined) {
      row.from_id = await lookupStakeholderId(row.from_name);
      delete row.from_name;
    }
    if (row.to_name !== undefined) {
      row.to_id = await lookupStakeholderId(row.to_name);
      delete row.to_name;
    }
  }

  // Resolve objection_text → objection_id for audience responses
  if (tableName === 'objection_audience_responses') {
    if (row.objection_text !== undefined) {
      row.objection_id = await lookupObjectionId(row.objection_text);
      delete row.objection_text;
    }
  }

  // Resolve controlling_entity name → ID for decision pathway
  if (tableName === 'decision_pathway_steps' && row.controlling_entity_name !== undefined) {
    row.controlling_entity_id = await lookupStakeholderId(row.controlling_entity_name);
    delete row.controlling_entity_name;
  }

  // Resolve claim/source by title for claim_sources
  if (tableName === 'claim_sources') {
    if (row.claim_text !== undefined) {
      const { data } = await supabase
        .from('claims')
        .select('id')
        .ilike('text', row.claim_text.trim().substring(0, 50) + '%')
        .limit(1);
      row.claim_id = data && data.length > 0 ? data[0].id : null;
      if (!row.claim_id) console.warn(`  WARNING: claim not found: "${row.claim_text.substring(0, 60)}..."`);
      delete row.claim_text;
    }
    if (row.source_title !== undefined) {
      row.source_id = await lookupSourceId(row.source_title);
      delete row.source_title;
    }
  }

  return row;
}

async function main() {
  const [, , tableName, csvPath] = process.argv;

  if (!tableName || !csvPath) {
    console.error('Usage: node scripts/import.js <table-name> <csv-file>');
    console.error(`\nValid tables: ${VALID_TABLES.join(', ')}`);
    console.error('\nImport order: sources → claims → stakeholders → then the rest');
    process.exit(1);
  }

  if (!VALID_TABLES.includes(tableName)) {
    console.error(`Invalid table: ${tableName}`);
    console.error(`Valid tables: ${VALID_TABLES.join(', ')}`);
    process.exit(1);
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing SUPABASE_SERVICE_ROLE_KEY in .env');
    process.exit(1);
  }

  const csv = fs.readFileSync(path.resolve(csvPath), 'utf-8');
  const records = parse(csv, { columns: true, skip_empty_lines: true, trim: true });

  console.log(`\nImporting ${records.length} rows into ${tableName}...`);

  let success = 0;
  let errors = 0;

  for (let i = 0; i < records.length; i++) {
    let row = cleanRow(records[i]);
    row = await resolveReferences(tableName, row);

    const { error } = await supabase.from(tableName).insert(row);

    if (error) {
      console.error(`  Row ${i + 1} ERROR: ${error.message}`);
      errors++;
    } else {
      console.log(`  Row ${i + 1} OK`);
      success++;
    }
  }

  console.log(`\nDone. ${success} imported, ${errors} errors.`);
}

main().catch(console.error);
