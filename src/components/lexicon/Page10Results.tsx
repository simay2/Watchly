import { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Star, Play, Loader2, RefreshCw } from "lucide-react";
import PageWrapper from "./PageWrapper";
import { supabase } from "@/integrations/supabase/client";

interface Recommendation {
  title: string;
  year: string;
  emoji: string;
  genre: string;
  rating: number;
  description: string;
}

interface Page10Props {
  preferences: {
    viewerType: string | null;
    genres: string[];
    mood: string | null;
    companion: string | null;
    time: string | null;
    surprise: string | null;
    dislikes: string[];
    titleReactions: Record<string, string>;
    ratings: Record<string, number>;
  };
  onRestart: () => void;
}

const colorClasses = [
  "bg-lavender/20 border-lavender",
  "bg-coral/20 border-coral",
  "bg-mint/20 border-mint",
  "bg-sunshine/20 border-sunshine",
  "bg-sky/20 border-sky",
  "bg-peach/20 border-peach",
];

const Page10Results = ({ preferences, onRestart }: Page10Props) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noMorePicks, setNoMorePicks] = useState(false);
  const shownTitlesRef = useRef<Set<string>>(new Set());

  const addToShown = (recs: Recommendation[]) => {
    recs.forEach((r) => shownTitlesRef.current.add(r.title.toLowerCase()));
  };

  const filterDuplicates = (recs: Recommendation[]): Recommendation[] => {
    return recs.filter((r) => !shownTitlesRef.current.has(r.title.toLowerCase()));
  };

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNoMorePicks(false);
    try {
      const excludeTitles = Array.from(shownTitlesRef.current);

      const { data, error: fnError } = await supabase.functions.invoke("get-recommendation", {
        body: { ...preferences, excludeTitles },
      });

      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);

      const raw: Recommendation[] = data.recommendations || [];
      const fresh = filterDuplicates(raw);

      if (fresh.length === 0) {
        setNoMorePicks(true);
        return;
      }

      addToShown(fresh);
      setRecommendations(fresh);
    } catch (err) {
      console.error("Failed to fetch recommendations:", err);
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [preferences]);

  useEffect(() => {
    shownTitlesRef.current.clear();
    fetchRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-lg font-handwritten text-muted-foreground">
            Finding your perfect picks... 🎬✨
          </p>
        </div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <p className="text-lg font-handwritten text-destructive">Oops! {error}</p>
          <motion.button
            onClick={fetchRecommendations}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-6 py-3 font-bold font-body"
          >
            <RefreshCw size={16} /> Try again
          </motion.button>
        </div>
      </PageWrapper>
    );
  }

  if (noMorePicks) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
          <span className="text-5xl">🍿</span>
          <p className="text-xl font-handwritten text-foreground">
            No more fresh picks!
          </p>
          <p className="text-muted-foreground font-body">Try Start over to explore new tastes ✨</p>
          <motion.button
            onClick={onRestart}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-primary text-primary-foreground rounded-full px-8 py-3 font-bold font-body shadow-soft mt-2"
          >
            Start over 📖
          </motion.button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <h2 className="text-3xl sm:text-4xl font-handwritten text-center mb-2">
        Your recommendations! 🎉
      </h2>
      <p className="text-center text-muted-foreground mb-6 font-body">
        Based on your diary, here's what we found ✨
      </p>
      <div className="flex flex-col gap-3">
        {recommendations.map((rec, i) => (
          <motion.div
            key={rec.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
            className={`rounded-2xl p-4 border-2 ${colorClasses[i % colorClasses.length]} flex items-start gap-3`}
          >
            <span className="text-3xl mt-1">{rec.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="font-bold font-body text-foreground truncate">{rec.title}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{rec.year}</span>
                <span>•</span>
                <span>{rec.genre}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{rec.description}</p>
            </div>
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div className="flex items-center gap-1">
                <Star size={14} className="fill-sunshine text-sunshine" />
                <span className="text-sm font-bold text-foreground">{rec.rating}</span>
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="p-1.5 rounded-full bg-primary/10 hover:bg-primary/20"
              >
                <Play size={14} className="text-primary" />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="mt-6 flex justify-center gap-3">
        <motion.button
          onClick={fetchRecommendations}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-muted text-foreground rounded-full px-6 py-3 font-bold font-body flex items-center gap-2"
        >
          <RefreshCw size={16} /> New picks
        </motion.button>
        <motion.button
          onClick={onRestart}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-primary text-primary-foreground rounded-full px-8 py-3 font-bold font-body shadow-soft"
        >
          Start over 📖
        </motion.button>
      </div>
      <div className="mt-4 text-center text-2xl animate-float">
        🍿 🎬 ⭐ 💖
      </div>
    </PageWrapper>
  );
};

export default Page10Results;
