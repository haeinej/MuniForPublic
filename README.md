# muniforpublic

A civic intelligence platform for the question: what would it take to make San Francisco's Muni transit system free?

Built for advocates, staffers, and elected officials who move policy.

**Live site:** https://muni-for-public.vercel.app

## Architecture

```
React app (Vercel)
    ↓
Supabase Edge Functions (API logic, chatbot pipeline)
    ↓
Supabase Postgres + pgvector (all data, semantic search)
    ↓
Google Gemini API (embeddings, query classification, response generation)
```

## Setup

```bash
git clone https://github.com/haeinej/MuniForPublic.git
cd MuniForPublic
npm install
```

Create a `.env` file:

```
REACT_APP_SUPABASE_URL=https://ocqsaapzkuunskosazza.supabase.co
REACT_APP_SUPABASE_ANON_KEY=<get from team>
SUPABASE_SERVICE_ROLE_KEY=<get from team, needed for imports only>
GEMINI_API_KEY=<get from aistudio.google.com, needed for embeddings>
```

Run locally:

```bash
npm start
```

## Importing data

Person 2 fills Google Sheets. Export each tab as CSV to `data/`, then import in order:

```bash
node scripts/import.js sources data/sources.csv
node scripts/import.js claims data/claims.csv
node scripts/import.js stakeholders data/stakeholders.csv
node scripts/import.js stakeholder_relationships data/stakeholder_relationships.csv
node scripts/import.js funding_sources data/funding_sources.csv
node scripts/import.js objections data/objections.csv
node scripts/import.js objection_audience_responses data/objection_audience_responses.csv
node scripts/import.js precedents data/precedents.csv
node scripts/import.js timeline_events data/timeline_events.csv
node scripts/import.js campaign_memory data/campaign_memory.csv
node scripts/import.js decision_pathway_steps data/decision_pathway_steps.csv
```

Order matters. Sources first, then claims and stakeholders, then everything else (they reference sources/stakeholders by name).

After importing, generate embeddings for semantic search:

```bash
node scripts/embed-all.js
```

This calls the Gemini API to generate 768-dim vectors for claims, sources, and objections. Rate-limited to stay within free tier (15 req/min).

## Project structure

```
src/
  pages/          — Landing, 5 block views, ChatPage
  components/     — Header, BlockSidebar
  lib/            — Supabase client
scripts/
  import.js       — CSV → Supabase with ID resolution
supabase/
  functions/      — Edge Functions (embed, search, chat)
data/             — CSV exports from Google Sheets
public/
  muni-logo.png   — Muni worm logo
```

## Roles

- **Person 1 (Scaffolding):** Repo, database, frontend, imports
- **Person 2 (Research):** Fills Google Sheets with structured policy data
- **Person 3 (Chatbot):** Builds the AI query classification + retrieval + generation pipeline

## Deploy

Frontend auto-deploys to Vercel on push to `main`. Edge Functions deploy via `supabase functions deploy`.
