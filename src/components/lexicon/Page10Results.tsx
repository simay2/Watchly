import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Play, Loader2, RefreshCw, X, ExternalLink } from "lucide-react";
import PageWrapper from "./PageWrapper";
import { supabase } from "@/integrations/supabase/client";

interface Recommendation {
  title: string;
  year: string;
  emoji: string;
  genre: string;
  rating: number;
  description: string;
  image?: string;
  trailerUrl?: string;
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

const placeholderColors = [
  "from-lavender/40 to-secondary/30",
  "from-coral/40 to-peach/30",
  "from-mint/40 to-sky/30",
  "from-sunshine/40 to-coral/30",
  "from-sky/40 to-lavender/30",
  "from-peach/40 to-sunshine/30",
];

const Page10Results = ({ preferences, onRestart }: Page10Props) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noMorePicks, setNoMorePicks] = useState(false);
  const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
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

  const openModal = (rec: Recommendation, index: number) => {
    setSelectedRec(rec);
    setSelectedIndex(index);
  };

  const closeModal = () => setSelectedRec(null);

  const openTrailer = (rec: Recommendation) => {
    const url = rec.trailerUrl
      ? rec.trailerUrl
      : `https://www.youtube.com/results?search_query=${encodeURIComponent(rec.title + " " + rec.year + " official trailer")}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

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
          <p className="text-xl font-handwritten text-foreground">No more fresh picks!</p>
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
    <>
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
              className={`rounded-2xl p-4 border-2 ${colorClasses[i % colorClasses.length]} flex items-start gap-3 cursor-pointer hover:shadow-md transition-shadow`}
              onClick={() => openModal(rec, i)}
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
                  onClick={(e) => {
                    e.stopPropagation();
                    openModal(rec, i);
                  }}
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

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedRec && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm"
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-card rounded-3xl shadow-lg max-w-sm w-full overflow-hidden relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={closeModal}
                className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-background/80 backdrop-blur-sm text-foreground hover:bg-background"
              >
                <X size={18} />
              </motion.button>

              {/* Poster area */}
              <div className="relative w-full h-48 sm:h-56 overflow-hidden">
                {selectedRec.image ? (
                  <img
                    src={selectedRec.image}
                    alt={selectedRec.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                      (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
                    }}
                  />
                ) : null}
                {/* Fallback gradient poster */}
                <div
                  className={`${selectedRec.image ? "hidden" : ""} w-full h-full bg-gradient-to-br ${placeholderColors[selectedIndex % placeholderColors.length]} flex items-center justify-center`}
                >
                  <span className="text-7xl">{selectedRec.emoji}</span>
                </div>
                {/* Gradient overlay at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-card to-transparent" />
              </div>

              {/* Content */}
              <div className="p-5 pt-2 -mt-4 relative z-10">
                <h3 className="text-2xl font-handwritten text-foreground mb-1">
                  {selectedRec.emoji} {selectedRec.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground font-body mb-3">
                  <span>{selectedRec.year}</span>
                  <span>•</span>
                  <span>{selectedRec.genre}</span>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1.5 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={
                        i < Math.round(selectedRec.rating)
                          ? "fill-sunshine text-sunshine"
                          : "text-muted"
                      }
                    />
                  ))}
                  <span className="text-sm font-bold font-body text-foreground ml-1">
                    {selectedRec.rating}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground font-body leading-relaxed mb-4">
                  {selectedRec.description}
                </p>

                {/* Watch trailer button */}
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => openTrailer(selectedRec)}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-full py-3 font-bold font-body shadow-soft"
                >
                  <Play size={16} className="fill-current" />
                  Watch Trailer
                  <ExternalLink size={14} />
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Page10Results;
