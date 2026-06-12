// ============================================================================
// HYBRID AI-ASSISTED RECOMMENDATION — Content-Based Scoring Module
// ----------------------------------------------------------------------------
// This module implements a simple rule-enhanced content-based recommendation
// model. It is intentionally lightweight (no ML training, no embeddings) and
// is designed to PRE-FILTER candidates before they are passed to Gemini.
//
// Pipeline:
//   TMDB candidate pool
//     -> calculateRecommendationScore() per item
//     -> getTopRecommendationCandidates() picks top-N
//     -> Gemini refines + writes personalized explanations
// ============================================================================

// TMDB genre id -> name (movie + TV, merged; ids that overlap share names)
export const TMDB_GENRE_MAP: Record<number, string> = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
  99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
  27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance",
  878: "Science Fiction", 10770: "TV Movie", 53: "Thriller", 10752: "War",
  37: "Western",
  // TV-specific
  10759: "Action & Adventure", 10762: "Kids", 10763: "News", 10764: "Reality",
  10765: "Sci-Fi & Fantasy", 10766: "Soap", 10767: "Talk",
  10768: "War & Politics",
};

export interface TmdbCandidate {
  id: number;
  media_type: "movie" | "tv";
  title: string;
  year: string;
  genre_ids: number[];
  genres: string[];
  overview: string;
  vote_average: number;     // 0-10
  vote_count: number;
  popularity: number;
  poster_path: string | null;
}

export interface UserPreferences {
  genres?: string[];          // preferred genres (onboarding)
  dislikes?: string[];        // disliked genres / things
  viewerType?: string;
  mood?: string;
  companion?: string;
  time?: string;
}

export interface UserInteractions {
  likedTitles?: string[];
  dislikedTitles?: string[];
  preferredGenres?: string[];   // derived from swipes
  avoidGenres?: string[];       // derived from swipes
  favoriteGenres?: string[];    // genres from favorites table
  watchedRatings?: Record<string, { rating: number; genre: string }>;
}

export interface UserContext {
  sessionMood?: string | null;
  sessionCompanion?: string | null;
  time?: string | null;
}

/**
 * Calculate a content-based recommendation score for a single candidate.
 * Higher score = better match. Score is unbounded but typically in [-20, +40].
 *
 * Rules (simple, transparent — appropriate for a bachelor thesis):
 *  +3 per preferred-genre match (onboarding)
 *  +2 per swipe-derived preferred-genre match
 *  +4 per favorite-derived genre match
 *  -4 per disliked-genre match
 *  -3 per swipe-derived avoid-genre match
 *  + weighted boost from watched-item ratings sharing a genre
 *  + small boost from vote_average (quality) and popularity (zeitgeist)
 *  + context boost (mood / companion / time) when content fits the situation
 */
export function calculateRecommendationScore(
  movie: TmdbCandidate,
  userPreferences: UserPreferences,
  userInteractions: UserInteractions,
  userContext: UserContext = {}
): number {
  let score = 0;
  const genres = movie.genres.map((g) => g.toLowerCase());

  const has = (list: string[] | undefined, needle: string) =>
    (list || []).some((g) => g.toLowerCase() === needle);

  // --- 1. Onboarding preferred / disliked genres ---
  for (const g of genres) {
    if (has(userPreferences.genres, g)) score += 3;
    if (has(userPreferences.dislikes, g)) score -= 4;
  }

  // --- 2. Swipe-derived genre signals ---
  for (const g of genres) {
    if (has(userInteractions.preferredGenres, g)) score += 2;
    if (has(userInteractions.avoidGenres, g)) score -= 3;
    if (has(userInteractions.favoriteGenres, g)) score += 4;
  }

  // --- 3. Watched ratings — strongest similarity signal ---
  const wr = userInteractions.watchedRatings || {};
  for (const info of Object.values(wr)) {
    const ratedGenres = (info.genre || "")
      .split(/[\/,&·•]/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    const overlap = ratedGenres.some((g) => genres.includes(g));
    if (!overlap) continue;
    // rating 1..5 -> weight -4..+4
    const weight = (info.rating - 3) * 2;
    score += weight;
  }

  // --- 4. Quality + popularity (smaller weights) ---
  if (movie.vote_count >= 50) {
    score += (movie.vote_average - 6) * 0.5; // +2 for a 10/10, -3 for a 0/10
  }
  // Popularity is unbounded; log-scale and cap
  score += Math.min(Math.log10(Math.max(movie.popularity, 1)) * 0.6, 2);

  // --- 5. Context (mood / companion / time) ---
  const mood = (userContext.sessionMood || userPreferences.mood || "").toLowerCase();
  const companion = (userContext.sessionCompanion || userPreferences.companion || "").toLowerCase();
  const time = (userContext.time || userPreferences.time || "").toLowerCase();

  const hasGenre = (name: string) => genres.includes(name.toLowerCase());

  // Mood matching
  if (mood.includes("sad") || mood.includes("comfort")) {
    if (hasGenre("comedy") || hasGenre("family") || hasGenre("animation") || hasGenre("romance")) score += 2;
    if (hasGenre("horror") || hasGenre("war") || hasGenre("drama")) score -= 1;
  }
  if (mood.includes("happy") || mood.includes("excited") || mood.includes("fun")) {
    if (hasGenre("comedy") || hasGenre("adventure") || hasGenre("action") || hasGenre("family")) score += 2;
  }
  if (mood.includes("stressed") || mood.includes("light") || mood.includes("relax")) {
    if (hasGenre("comedy") || hasGenre("animation") || hasGenre("family")) score += 2;
    if (hasGenre("thriller") || hasGenre("horror") || hasGenre("war")) score -= 2;
  }
  if (mood.includes("intense") || mood.includes("thrill")) {
    if (hasGenre("thriller") || hasGenre("mystery") || hasGenre("crime") || hasGenre("science fiction")) score += 2;
  }
  if (mood.includes("romantic") || mood.includes("love")) {
    if (hasGenre("romance") || hasGenre("drama")) score += 2;
  }

  // Companion matching
  if (companion.includes("partner")) {
    if (hasGenre("romance") || hasGenre("drama") || hasGenre("comedy")) score += 1.5;
  }
  if (companion.includes("friend")) {
    if (hasGenre("comedy") || hasGenre("horror") || hasGenre("action") || hasGenre("adventure")) score += 1.5;
  }
  if (companion.includes("family")) {
    if (hasGenre("family") || hasGenre("animation") || hasGenre("adventure")) score += 2;
    if (hasGenre("horror") || hasGenre("war")) score -= 3;
  }
  if (companion.includes("alone")) {
    if (hasGenre("mystery") || hasGenre("documentary") || hasGenre("drama") || hasGenre("science fiction")) score += 1;
  }

  // Time matching — penalize TV series for short slots
  if (time.includes("short") || time.includes("30") || time.includes("1 hour")) {
    if (movie.media_type === "tv") score += 1; // single episode fits
  }
  if (time.includes("long") || time.includes("binge") || time.includes("evening")) {
    if (movie.media_type === "tv") score += 1.5;
    if (movie.media_type === "movie") score += 0.5;
  }

  return Math.round(score * 100) / 100;
}

/**
 * Score every candidate, sort descending, return the top N.
 * Also attaches the computed score onto each returned candidate.
 */
export function getTopRecommendationCandidates(
  movies: TmdbCandidate[],
  userPreferences: UserPreferences,
  userInteractions: UserInteractions,
  limit = 15,
  userContext: UserContext = {}
): (TmdbCandidate & { score: number })[] {
  const scored = movies.map((m) => ({
    ...m,
    score: calculateRecommendationScore(m, userPreferences, userInteractions, userContext),
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

// ---------------------------------------------------------------------------
// TMDB candidate fetching — pulls a working candidate pool by combining
// trending content with discover-by-preferred-genre queries.
// ---------------------------------------------------------------------------

const GENRE_NAME_TO_TMDB_MOVIE: Record<string, number> = {
  action: 28, adventure: 12, animation: 16, comedy: 35, crime: 80,
  documentary: 99, drama: 18, family: 10751, fantasy: 14, history: 36,
  horror: 27, music: 10402, mystery: 9648, romance: 10749,
  "science fiction": 878, "sci-fi": 878, scifi: 878,
  thriller: 53, war: 10752, western: 37,
};
const GENRE_NAME_TO_TMDB_TV: Record<string, number> = {
  "action & adventure": 10759, action: 10759, adventure: 10759,
  animation: 16, comedy: 35, crime: 80, documentary: 99, drama: 18,
  family: 10751, kids: 10762, mystery: 9648, news: 10763, reality: 10764,
  "sci-fi & fantasy": 10765, "science fiction": 10765, "sci-fi": 10765,
  fantasy: 10765, soap: 10766, talk: 10767, "war & politics": 10768,
  war: 10768, western: 37,
};

function mapTmdbItem(raw: any, mediaType: "movie" | "tv"): TmdbCandidate {
  const title = mediaType === "movie" ? raw.title : raw.name;
  const dateStr = mediaType === "movie" ? raw.release_date : raw.first_air_date;
  const year = dateStr ? String(dateStr).slice(0, 4) : "";
  const genre_ids: number[] = raw.genre_ids || [];
  return {
    id: raw.id,
    media_type: mediaType,
    title,
    year,
    genre_ids,
    genres: genre_ids.map((id) => TMDB_GENRE_MAP[id]).filter(Boolean),
    overview: raw.overview || "",
    vote_average: raw.vote_average || 0,
    vote_count: raw.vote_count || 0,
    popularity: raw.popularity || 0,
    poster_path: raw.poster_path || null,
  };
}

export async function fetchTmdbCandidatePool(
  tmdbApiKey: string,
  preferredGenres: string[],
  viewerType: string | undefined,
  excludeTitles: string[] = []
): Promise<TmdbCandidate[]> {
  const wantMovies = viewerType !== "TV series only";
  const wantTv = viewerType !== "Movies only";
  const excludeLc = new Set(excludeTitles.map((t) => t.toLowerCase()));
  const pool: TmdbCandidate[] = [];
  const seen = new Set<string>();

  const push = (items: any[], type: "movie" | "tv") => {
    for (const raw of items) {
      const item = mapTmdbItem(raw, type);
      const key = `${type}:${item.id}`;
      if (seen.has(key)) continue;
      if (excludeLc.has(item.title.toLowerCase())) continue;
      if (!item.title) continue;
      seen.add(key);
      pool.push(item);
    }
  };

  const requests: Promise<void>[] = [];
  const safeFetch = async (url: string, type: "movie" | "tv") => {
    try {
      const r = await fetch(url);
      if (!r.ok) return;
      const j = await r.json();
      push(j.results || [], type);
    } catch (e) {
      console.error("TMDB fetch failed:", url, e);
    }
  };

  // 1. Trending — broad baseline pool
  if (wantMovies) requests.push(safeFetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${tmdbApiKey}`, "movie"));
  if (wantTv) requests.push(safeFetch(`https://api.themoviedb.org/3/trending/tv/week?api_key=${tmdbApiKey}`, "tv"));

  // 2. Discover by each preferred genre
  for (const g of preferredGenres.slice(0, 5)) {
    const key = g.toLowerCase();
    if (wantMovies) {
      const id = GENRE_NAME_TO_TMDB_MOVIE[key];
      if (id) requests.push(safeFetch(
        `https://api.themoviedb.org/3/discover/movie?api_key=${tmdbApiKey}&with_genres=${id}&sort_by=popularity.desc&vote_count.gte=100`,
        "movie"
      ));
    }
    if (wantTv) {
      const id = GENRE_NAME_TO_TMDB_TV[key];
      if (id) requests.push(safeFetch(
        `https://api.themoviedb.org/3/discover/tv?api_key=${tmdbApiKey}&with_genres=${id}&sort_by=popularity.desc&vote_count.gte=50`,
        "tv"
      ));
    }
  }

  await Promise.all(requests);
  return pool;
}
