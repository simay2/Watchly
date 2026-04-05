import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { viewerType, genres, mood, companion, companionContext, time, surprise, dislikes, titleReactions, ratings, excludeTitles, swipeContext, sessionCompanion, sessionMood } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const likedTitles = Object.entries(titleReactions || {})
      .filter(([_, reaction]) => reaction === "love" || reaction === "favorite" || reaction === "heart" || reaction === "star")
      .map(([title]) => title);

    const skippedTitles = Object.entries(titleReactions || {})
      .filter(([_, reaction]) => reaction === "skip")
      .map(([title]) => title);

    const ratedTitles = Object.entries(ratings || {})
      .map(([title, rating]) => `${title}: ${rating}/5`)
      .join(", ");

    const excludeList: string[] = excludeTitles || [];
    const excludeInstruction = excludeList.length > 0
      ? `\n\nIMPORTANT: Do NOT recommend any of these titles (already shown): ${excludeList.join(", ")}`
      : "";

    const swipeInstruction = swipeContext
      ? `\n\nSWIPE FEEDBACK FROM USER:
- Liked titles: ${(swipeContext.likedTitles || []).join(", ") || "none yet"}
- Disliked titles: ${(swipeContext.dislikedTitles || []).join(", ") || "none yet"}
- Preferred genres: ${(swipeContext.preferredGenres || []).join(", ") || "not enough data"}
- Genres to avoid: ${(swipeContext.avoidGenres || []).join(", ") || "none"}
- Average preferred rating: ${swipeContext.avgPreferredRating || "N/A"}
Use this feedback to heavily weight recommendations toward their preferred genres and away from disliked genres. Prioritize content similar to liked titles.`
      : "";

    const sessionInstruction = (sessionCompanion || sessionMood)
      ? `\n\nCURRENT SESSION CONTEXT (prioritize this over stored preferences for mood/companion):
- Right now watching with: ${sessionCompanion || "not specified"}
- Current mood: ${sessionMood || "not specified"}
Adjust recommendations based on this session context:
- If watching with Partner → prioritize romantic, cozy, chemistry-driven content
- If watching with Friends → prioritize fun, horror, comedy, crowd-pleasers
- If watching Alone → match the mood more precisely
- If watching with Family → keep it family-friendly and wholesome
- If mood is Sad → suggest uplifting or comfort content (avoid heavy depressing films)
- If mood is Happy/Excited → suggest fun, adventurous, feel-good content
- If mood is Stressed → suggest light, easy-watch, relaxing content
- If mood is "Want something light" → avoid heavy/intense content
- If mood is "Want something intense" → suggest thrillers, dramas, mind-bending content
- If mood is Romantic → prioritize romance and love stories`
      : "";

    const systemPrompt = `You are a movie and TV show recommendation expert. Based on the user's preferences from their "movie diary", suggest 6 personalized recommendations. Return ONLY valid JSON, no markdown. The JSON must be an array of objects with these fields: title (string), year (string), emoji (single emoji representing the movie/show), genre (string like "Comedy / Drama"), rating (number 1-5 with one decimal), description (one sentence why this matches their mood/preferences), image (a real, working poster image URL — use known TMDB poster paths like "https://image.tmdb.org/t/p/w500/<real_poster_filename>.jpg" where <real_poster_filename> is the actual TMDB poster path for that specific movie/show. Only provide a URL if you are confident it is the correct TMDB poster path for that exact title. If you are not sure of the exact poster path, use an empty string ""), trailerUrl (a YouTube URL to the official trailer - use the format "https://www.youtube.com/watch?v=" followed by the known YouTube video ID for the official trailer, OR if unsure use an empty string). Make recommendations diverse and tailored to their specific inputs.${excludeInstruction}${swipeInstruction}${sessionInstruction}`;

    const userPrompt = `Here are my movie diary preferences:
- I watch: ${viewerType || "movies and TV shows"}
- Favorite genres: ${(genres || []).join(", ") || "not specified"}
- Titles I liked: ${likedTitles.join(", ") || "none specified"}
- Titles I skipped: ${skippedTitles.join(", ") || "none"}
- Things I dislike: ${(dislikes || []).join(", ") || "nothing specific"}
- My current mood: ${mood || "not specified"}
- Watching with: ${companion || "not specified"}${companionContext ? ` (vibe: ${companionContext})` : ""}
- Time available: ${time || "not specified"}
- My ratings: ${ratedTitles || "none"}
- I want: ${surprise || "popular picks"}

Please recommend 6 ${viewerType === "TV series only" ? "TV shows" : viewerType === "Movies only" ? "movies" : "movies and TV shows"} that match my preferences.`;

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
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    let recommendations;
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        recommendations = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON array found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse recommendations");
    }

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
