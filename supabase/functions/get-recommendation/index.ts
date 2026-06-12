// ============================================================================
// HYBRID AI-ASSISTED RECOMMENDATION — Edge Function Entry Point
// ----------------------------------------------------------------------------
// Pipeline:
//   1. Build a candidate pool from TMDB (trending + discover-by-genre)
//   2. Score every candidate with a custom content-based scoring model
//      (see scoring.ts). Factors: preferred / disliked genres, liked /
//      disliked titles, favorites, watched-item ratings, vote average,
//      popularity, and session context (mood / companion / time).
//   3. Keep only the top-N candidates (default 15).
//   4. Send ONLY those top candidates to Gemini, which selects the best 6
//      and writes a short personalized explanation for each.
//   5. Return refined recommendations to the frontend.
//
// Gemini never sees the full TMDB database — only the pre-scored shortlist.
// This is a simple rule-enhanced content-based model, NOT a trained ML model.
// ============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  fetchTmdbCandidatePool,
  getTopRecommendationCandidates,
  TmdbCandidate,
} from "./scoring.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      viewerType, genres, mood, companion, companionContext, time, surprise,
      dislikes, titleReactions, ratings, excludeTitles, swipeContext,
      sessionCompanion, sessionMood, watchedRatings,
    } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const TMDB_API_KEY = Deno.env.get("TMDB_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");
    if (!TMDB_API_KEY) throw new Error("TMDB_API_KEY is not configured");

    // -- Derive interaction signals from incoming payload --
    const likedTitles = Object.entries(titleReactions || {})
      .filter(([_, r]) => ["love", "favorite", "heart", "star"].includes(r as string))
      .map(([t]) => t);
    const skippedTitles = Object.entries(titleReactions || {})
      .filter(([_, r]) => r === "skip")
      .map(([t]) => t);

    const userPreferences = {
      genres: genres || [],
      dislikes: dislikes || [],
      viewerType,
      mood,
      companion,
      time,
    };

    const userInteractions = {
      likedTitles: [...(swipeContext?.likedTitles || []), ...likedTitles],
      dislikedTitles: [...(swipeContext?.dislikedTitles || []), ...skippedTitles],
      preferredGenres: swipeContext?.preferredGenres || [],
      avoidGenres: swipeContext?.avoidGenres || [],
      favoriteGenres: Object.values(watchedRatings || {})
        .filter((w: any) => w.rating >= 4)
        .flatMap((w: any) =>
          (w.genre || "").split(/[\/,&·•]/).map((s: string) => s.trim()).filter(Boolean)
        ),
      watchedRatings: watchedRatings || {},
    };

    const userContext = {
      sessionMood: sessionMood || null,
      sessionCompanion: sessionCompanion || null,
      time: time || null,
    };

    const excludeList: string[] = excludeTitles || [];

    // === STEP 1+2: Build TMDB candidate pool ==============================
    const pool = await fetchTmdbCandidatePool(
      TMDB_API_KEY,
      genres || [],
      viewerType,
      excludeList
    );
    console.log(`[hybrid] TMDB pool size: ${pool.length}`);

    // === STEP 3: Score and pick top candidates ============================
    const topCandidates = getTopRecommendationCandidates(
      pool, userPreferences, userInteractions, 15, userContext
    );
    console.log(`[hybrid] Top candidates: ${topCandidates.length}`);

    // If TMDB returned nothing (network/keys), fall back to letting Gemini
    // propose freely so the user is never blocked.
    const useCandidates = topCandidates.length > 0;

    // === STEP 4: Ask Gemini to refine + explain ===========================
    const candidateBlock = useCandidates
      ? topCandidates.map((c, i) =>
          `${i + 1}. [${c.media_type === "tv" ? "TV" : "Movie"}] "${c.title}" (${c.year}) — ` +
          `genres: ${c.genres.join(", ") || "n/a"} | rating: ${c.vote_average.toFixed(1)} | ` +
          `score: ${c.score} | tmdb_id: ${c.id}\n   Overview: ${c.overview.slice(0, 220)}`
        ).join("\n")
      : "(no pre-scored candidates — propose 6 fresh picks yourself)";

    const systemPrompt = `You are a movie/TV recommendation expert.

IMPORTANT: The CANDIDATE list below was ALREADY pre-selected by a custom content-based scoring model that ranks titles by the user's preferred/disliked genres, liked/favorite content, ratings, popularity, and session context. Your job is to:
  (a) pick the best 6 from the candidate list (do not invent new titles unless the candidate list is empty),
  (b) write a SHORT personalized explanation (one sentence) for each, referencing the user's actual preferences/mood/companion when relevant,
  (c) order them best-match-first.

Return ONLY valid JSON, no markdown. The JSON must be an array of 6 objects with these fields:
- title (string, exact from candidate)
- type ("movie" or "tv")
- year (string)
- emoji (one emoji)
- genre (string like "Comedy / Drama")
- rating (number 1-5, one decimal — convert from TMDB 0-10 by dividing by 2)
- description (one-sentence personalized explanation)
- image (empty string "" — posters attached later)
- trailerUrl (empty string "")
- tmdbId (number — the tmdb_id from the candidate)
- score (number — the score from the candidate)
${excludeList.length ? `\nDo NOT include any of these already-seen titles: ${excludeList.slice(0, 40).join(", ")}` : ""}`;

    const userPrompt = `USER PREFERENCES
- Watches: ${viewerType || "movies and TV"}
- Favorite genres: ${(genres || []).join(", ") || "n/a"}
- Dislikes: ${(dislikes || []).join(", ") || "n/a"}
- Onboarding mood: ${mood || "n/a"}
- Onboarding companion: ${companion || "n/a"}${companionContext ? ` (${companionContext})` : ""}
- Time available: ${time || "n/a"}
- Surprise level: ${surprise || "n/a"}
- Titles liked: ${likedTitles.join(", ") || "none"}
- Titles skipped: ${skippedTitles.join(", ") || "none"}

CURRENT SESSION
- Watching with: ${sessionCompanion || "n/a"}
- Current mood: ${sessionMood || "n/a"}

WATCHED RATINGS (strongest signal)
${Object.entries(watchedRatings || {}).map(([t, i]: [string, any]) =>
  `- "${t}" (${i.genre}): ${i.rating}/5`).join("\n") || "none"}

PRE-SCORED CANDIDATES (from content-based model, best first):
${candidateBlock}

Pick the best 6 and write personalized one-sentence explanations.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("AI gateway error:", response.status, await response.text());
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    let recommendations: any[];
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error("No JSON array found");
      recommendations = JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse recommendations");
    }

    // === STEP 5: Enrich posters from the candidate pool (or TMDB lookup) ==
    const candidateById = new Map<number, TmdbCandidate & { score: number }>();
    topCandidates.forEach((c) => candidateById.set(c.id, c));

    recommendations = await Promise.all(
      recommendations.map(async (rec: any) => {
        // Prefer poster from the pre-scored candidate (no extra API call)
        const cand = rec.tmdbId ? candidateById.get(rec.tmdbId) : undefined;
        if (cand?.poster_path) {
          rec.image = `https://image.tmdb.org/t/p/w500${cand.poster_path}`;
          rec.type = cand.media_type;
          rec.genres = cand.genres;
        } else {
          // Fallback: search TMDB by title
          try {
            const url = `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(rec.title)}${rec.year ? `&year=${rec.year}` : ""}`;
            const r = await fetch(url);
            if (r.ok) {
              const j = await r.json();
              const hit = j.results?.[0];
              rec.image = hit?.poster_path ? `https://image.tmdb.org/t/p/w500${hit.poster_path}` : "";
              if (hit && !rec.tmdbId) rec.tmdbId = hit.id;
              if (hit && !rec.type) rec.type = hit.media_type;
            } else {
              rec.image = "";
            }
          } catch (e) {
            console.error(`TMDB lookup failed for ${rec.title}:`, e);
            rec.image = "";
          }
        }
        return rec;
      })
    );

    return new Response(JSON.stringify({ recommendations }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("get-recommendation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
