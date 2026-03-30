import { useState, useCallback, useMemo } from "react";

export interface SwipedItem {
  title: string;
  genre: string;
  year: string;
  rating: number;
  description: string;
  emoji: string;
  image?: string;
  trailerUrl?: string;
}

interface ScoreMap {
  [key: string]: number;
}

export interface TasteProfileData {
  genreScores: ScoreMap;
  topGenres: string[];
  bottomGenres: string[];
  avgLikedRating: number;
  totalLiked: number;
  totalDisliked: number;
  summary: string;
}

const LIKE_WEIGHT = 2;
const DISLIKE_WEIGHT = -1.5;

function parseGenres(genre: string): string[] {
  return genre
    .split(/[\/,&·•]/)
    .map((g) => g.trim())
    .filter(Boolean);
}

function buildSummary(topGenres: string[], avgRating: number, totalLiked: number): string {
  if (totalLiked === 0) return "Swipe some cards to discover your taste!";
  if (totalLiked < 3) return `Starting to see a pattern... keep swiping! ✨`;

  const genreText = topGenres.slice(0, 3).join(", ");
  const ratingNote =
    avgRating >= 4 ? "critically acclaimed" : avgRating >= 3 ? "well-rated" : "hidden gem";

  return `You seem to enjoy ${genreText} — especially ${ratingNote} picks. 🎬`;
}

export function useTasteProfile() {
  const [liked, setLiked] = useState<SwipedItem[]>([]);
  const [disliked, setDisliked] = useState<SwipedItem[]>([]);

  const recordLike = useCallback((item: SwipedItem) => {
    setLiked((prev) =>
      prev.some((p) => p.title === item.title) ? prev : [...prev, item]
    );
  }, []);

  const recordDislike = useCallback((item: SwipedItem) => {
    setDisliked((prev) =>
      prev.some((p) => p.title === item.title) ? prev : [...prev, item]
    );
  }, []);

  const profile = useMemo<TasteProfileData>(() => {
    const genreScores: ScoreMap = {};

    liked.forEach((item) => {
      parseGenres(item.genre).forEach((g) => {
        genreScores[g] = (genreScores[g] || 0) + LIKE_WEIGHT;
      });
    });

    disliked.forEach((item) => {
      parseGenres(item.genre).forEach((g) => {
        genreScores[g] = (genreScores[g] || 0) + DISLIKE_WEIGHT;
      });
    });

    const sorted = Object.entries(genreScores).sort(([, a], [, b]) => b - a);
    const topGenres = sorted.filter(([, v]) => v > 0).map(([k]) => k).slice(0, 5);
    const bottomGenres = sorted.filter(([, v]) => v < 0).slice(-3).map(([k]) => k);

    const avgLikedRating =
      liked.length > 0
        ? Math.round((liked.reduce((s, i) => s + i.rating, 0) / liked.length) * 10) / 10
        : 0;

    return {
      genreScores,
      topGenres,
      bottomGenres,
      avgLikedRating,
      totalLiked: liked.length,
      totalDisliked: disliked.length,
      summary: buildSummary(topGenres, avgLikedRating, liked.length),
    };
  }, [liked, disliked]);

  const swipeContext = useMemo(() => {
    return {
      likedTitles: liked.map((l) => l.title),
      dislikedTitles: disliked.map((d) => d.title),
      preferredGenres: profile.topGenres,
      avoidGenres: profile.bottomGenres,
      avgPreferredRating: profile.avgLikedRating,
    };
  }, [liked, disliked, profile]);

  const reset = useCallback(() => {
    setLiked([]);
    setDisliked([]);
  }, []);

  return { liked, disliked, profile, swipeContext, recordLike, recordDislike, reset };
}
