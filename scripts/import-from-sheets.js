/**
 * Import script: Google Sheets CSV → Supabase
 *
 * Person 2 exports each Google Sheet tab as CSV.
 * This script reads the CSVs and upserts into Supabase.
 *
 * Usage:
 *   node scripts/import-from-sheets.js <table-name> <csv-file>
 *
 * Examples:
 *   node scripts/import-from-sheets.js claims data/claims.csv
 *   node scripts/import-from-sheets.js stakeholders data/stakeholders.csv
 *   node scripts/import-from-sheets.js objections data/objections.csv
 *
 * Requirements:
 *   npm install dotenv csv-parse @supabase/supabase-js
 *
 * Env vars (in .env):
 *   REACT_APP_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY  (not the anon key — needs write access)
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
  'claims',
  'sources',
  'claim_sources',
  'stakeholders',
  'stakeholder_relationships',
  'decision_pathway_steps',
  'funding_sources',
  'objections',
  'objection_audience_responses',
  'precedents',
  'timeline_events',
  'campaign_memory',
];

async function main() {
  const [, , tableName, csvPath] = process.argv;

  if (!tableName || !csvPath) {
    console.error('Usage: node scripts/import-from-sheets.js <table-name> <csv-file>');
    process.exit(1);
  }

  if (!VALID_TABLES.includes(tableName)) {
    console.error(`Invalid table: ${tableName}`);
    console.error(`Valid tables: ${VALID_TABLES.join(', ')}`);
    process.exit(1);
  }

  const csv = fs.readFileSync(path.resolve(csvPath), 'utf-8');
  const records = parse(csv, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  console.log(`Importing ${records.length} rows into ${tableName}...`);

  // Clean up empty strings to null
  const cleaned = records.map((row) => {
    const out = {};
    for (const [key, val] of Object.entries(row)) {
      out[key] = val === '' ? null : val;
    }
    // Convert numeric fields
    const numericFields = [
      'formal_authority', 'budget_authority', 'agenda_setting',
      'veto_risk', 'coalition_value', 'narrative_influence',
      'step_number', 'year',
    ];
    for (const field of numericFields) {
      if (out[field] !== null && out[field] !== undefined) {
        out[field] = parseInt(out[field], 10);
      }
    }
    // Remove 'id' if empty (let Supabase generate it)
    if (!out.id) delete out.id;
    // Remove 'embedding' column (generated server-side)
    delete out.embedding;
    return out;
  });

  const { data, error } = await supabase.from(tableName).upsert(cleaned, {
    onConflict: 'id',
    ignoreDuplicates: false,
  });

  if (error) {
    console.error('Import error:', error.message);
    process.exit(1);
  }

  console.log(`Successfully imported ${records.length} rows into ${tableName}.`);
}

main().catch(console.error);
