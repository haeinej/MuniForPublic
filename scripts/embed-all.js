/**
 * Generate embeddings for all rows missing them.
 * Run after each data import.
 *
 * Usage:
 *   node scripts/embed-all.js
 *
 * Env vars:
 *   REACT_APP_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   GEMINI_API_KEY
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('Missing GEMINI_API_KEY in .env');
  process.exit(1);
}

async function generateEmbedding(text) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'models/gemini-embedding-001',
        content: { parts: [{ text }] },
        outputDimensionality: 768,
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini error: ${err}`);
  }

  const data = await res.json();
  return data.embedding.values;
}

async function embedTable(table, textColumn) {
  console.log(`\n--- ${table} (${textColumn}) ---`);

  const { data: rows, error } = await supabase
    .from(table)
    .select(`id, ${textColumn}`)
    .is('embedding', null);

  if (error) {
    console.error(`  Error fetching ${table}:`, error.message);
    return;
  }

  if (!rows || rows.length === 0) {
    console.log('  No rows need embedding.');
    return;
  }

  console.log(`  ${rows.length} rows to embed...`);

  let success = 0;
  let errors = 0;

  for (const row of rows) {
    const text = row[textColumn];
    if (!text) {
      console.log(`  Row ${row.id}: skipped (empty text)`);
      continue;
    }

    try {
      const embedding = await generateEmbedding(text);
      const { error: updateError } = await supabase
        .from(table)
        .update({ embedding })
        .eq('id', row.id);

      if (updateError) {
        console.error(`  Row ${row.id} ERROR: ${updateError.message}`);
        errors++;
      } else {
        console.log(`  Row ${row.id} OK (${embedding.length} dims)`);
        success++;
      }

      // Gemini free tier: 15 requests/min. Wait between calls.
      await new Promise((r) => setTimeout(r, 4200));
    } catch (err) {
      console.error(`  Row ${row.id} ERROR: ${err.message}`);
      errors++;
    }
  }

  console.log(`  Done: ${success} embedded, ${errors} errors.`);
}

async function main() {
  console.log('Embedding all rows missing vectors...\n');

  await embedTable('claims', 'text');
  await embedTable('sources', 'summary');
  await embedTable('objections', 'objection_text');

  console.log('\nAll tables processed.');
}

main().catch(console.error);
