import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Person 3: replace these with your full prompt architectures
const AUDIENCE_PROMPTS: Record<string, string> = {
  organizer: `You are a civic policy advisor speaking to a community organizer. Lead with framing and narrative. Use "you" language. Include objection handling scripts when relevant. Cite campaign memory as stories. End with what to do next. Only use the provided context. If information is missing, say so.`,

  staffer: `You are a civic policy advisor speaking to a legislative staffer. Lead with data, constraints, and legal parameters. Be precise about known vs estimated vs unknown. Include caveats on city comparisons. Use neutral analytical tone. Flag missing evidence. Only use the provided context.`,

  official: `You are a civic policy advisor speaking to an elected official. Keep it to one page maximum. Lead with what this means for constituents. Include a ready-to-use talking point. Preview likely opposition. End with political upside. Only use the provided context.`,
};

const CLASSIFICATION_PROMPT = `Classify this policy question. Return JSON with:
- question_type: one of "funding", "stakeholder", "objection", "timing", "precedent", "strategy"
- tables_to_query: array from ["claims", "sources", "objections", "funding_sources", "stakeholders", "precedents", "timeline_events"]

Only return valid JSON, no markdown.`;

async function callGemini(prompt: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  if (!res.ok) throw new Error(`Gemini error: ${await res.text()}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

async function generateEmbedding(text: string): Promise<number[]> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "models/text-embedding-004",
        content: { parts: [{ text }] },
      }),
    }
  );

  if (!res.ok) throw new Error(`Embedding error: ${await res.text()}`);
  const data = await res.json();
  return data.embedding.values;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { question, audience_mode = "organizer" } = await req.json();

    if (!question) {
      return new Response(
        JSON.stringify({ error: "question is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Step 1: Classify the query
    const classificationRaw = await callGemini(
      `${CLASSIFICATION_PROMPT}\n\nQuestion: ${question}`
    );

    let classification;
    try {
      const jsonStr = classificationRaw.replace(/```json\n?/g, "").replace(/```/g, "").trim();
      classification = JSON.parse(jsonStr);
    } catch {
      classification = {
        question_type: "strategy",
        tables_to_query: ["claims", "objections", "funding_sources"],
      };
    }

    // Step 2: Semantic search on embedding tables
    const embedding = await generateEmbedding(question);
    const semanticResults: Record<string, any[]> = {};

    const embeddingTables = ["claims", "sources", "objections"].filter((t) =>
      classification.tables_to_query.includes(t)
    );

    for (const table of embeddingTables) {
      const fnName =
        table === "claims" ? "match_claims" :
        table === "objections" ? "match_objections" :
        "match_sources";

      const { data } = await supabase.rpc(fnName, {
        query_embedding: embedding,
        match_threshold: 0.4,
        match_count: 5,
      });
      semanticResults[table] = data || [];
    }

    // Step 3: Structured queries for non-embedding tables
    const structuredResults: Record<string, any[]> = {};

    if (classification.tables_to_query.includes("funding_sources")) {
      const { data } = await supabase.from("funding_sources").select("*").limit(10);
      structuredResults.funding_sources = data || [];
    }

    if (classification.tables_to_query.includes("stakeholders")) {
      const { data } = await supabase.from("stakeholders").select("*").limit(10);
      structuredResults.stakeholders = data || [];
    }

    if (classification.tables_to_query.includes("precedents")) {
      const { data } = await supabase.from("precedents").select("*").limit(10);
      structuredResults.precedents = data || [];
    }

    if (classification.tables_to_query.includes("timeline_events")) {
      const { data } = await supabase.from("timeline_events").select("*").limit(10);
      structuredResults.timeline_events = data || [];
    }

    // Fetch audience-specific objection responses if relevant
    if (classification.question_type === "objection" && semanticResults.objections?.length) {
      const objIds = semanticResults.objections.map((o: any) => o.id);
      const { data } = await supabase
        .from("objection_audience_responses")
        .select("*")
        .in("objection_id", objIds)
        .eq("audience_type", audience_mode);
      structuredResults.audience_responses = data || [];
    }

    // Step 4: Build context block
    const contextParts: string[] = [];

    if (semanticResults.claims?.length) {
      contextParts.push(
        "CLAIMS:\n" +
          semanticResults.claims
            .map((c: any) => `- [${c.confidence}] ${c.text}`)
            .join("\n")
      );
    }

    if (semanticResults.objections?.length) {
      contextParts.push(
        "OBJECTIONS:\n" +
          semanticResults.objections
            .map((o: any) => `- "${o.objection_text}" (${o.who_makes_it})\n  Rebuttal: ${o.evidence_rebuttal}`)
            .join("\n")
      );
    }

    if (structuredResults.audience_responses?.length) {
      contextParts.push(
        `AUDIENCE RESPONSES (${audience_mode}):\n` +
          structuredResults.audience_responses
            .map((r: any) => `- ${r.response_text}`)
            .join("\n")
      );
    }

    if (structuredResults.funding_sources?.length) {
      contextParts.push(
        "FUNDING SOURCES:\n" +
          structuredResults.funding_sources
            .map(
              (f: any) =>
                `- ${f.name}: ${f.description || ""} (${f.operating_or_capital}, ${f.recurring_or_onetime}, feasibility: ${f.political_feasibility})`
            )
            .join("\n")
      );
    }

    if (structuredResults.stakeholders?.length) {
      contextParts.push(
        "STAKEHOLDERS:\n" +
          structuredResults.stakeholders
            .map(
              (s: any) =>
                `- ${s.name} (${s.type}): stance=${s.current_stance}, authority=${s.formal_authority}/5, veto=${s.veto_risk}/5`
            )
            .join("\n")
      );
    }

    if (structuredResults.precedents?.length) {
      contextParts.push(
        "PRECEDENTS:\n" +
          structuredResults.precedents
            .map(
              (p: any) => `- ${p.city} (${p.year}): ${p.scope}. ${p.key_lessons}`
            )
            .join("\n")
      );
    }

    if (semanticResults.sources?.length) {
      contextParts.push(
        "SOURCES:\n" +
          semanticResults.sources
            .map((s: any) => `- ${s.title} (${s.type}): ${s.summary}`)
            .join("\n")
      );
    }

    const contextBlock = contextParts.join("\n\n");

    // Step 5: Generate response
    const systemPrompt = AUDIENCE_PROMPTS[audience_mode] || AUDIENCE_PROMPTS.organizer;

    const answer = await callGemini(
      `${systemPrompt}\n\nCONTEXT:\n${contextBlock || "No relevant data found in the database."}\n\nQUESTION: ${question}`
    );

    // Collect cited sources
    const sourcesCited = [
      ...(semanticResults.sources || []).map((s: any) => ({
        title: s.title,
        type: s.type,
      })),
    ];

    const blocksUsed = Object.keys({ ...semanticResults, ...structuredResults }).filter(
      (k) => {
        const arr = semanticResults[k] || structuredResults[k];
        return arr && arr.length > 0;
      }
    );

    return new Response(
      JSON.stringify({
        answer,
        classification,
        sources_cited: sourcesCited,
        blocks_used: blocksUsed,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
