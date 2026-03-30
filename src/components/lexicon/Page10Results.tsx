import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Play, Loader2, RefreshCw, X, ExternalLink, Heart } from "lucide-react";
import PageWrapper from "./PageWrapper";
import SwipeCard from "./SwipeCard";
import SavedList from "./SavedList";
import TasteProfile from "./TasteProfile";
import { useTasteProfile } from "@/hooks/useTasteProfile";
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
  const [saved, setSaved] = useState<Recommendation[]>([]);
  const [swipeFeedback, setSwipeFeedback] = useState<"like" | "skip" | null>(null);
  const shownTitlesRef = useRef<Set<string>>(new Set());
  const { profile, swipeContext, recordLike, recordDislike, reset: resetTaste } = useTasteProfile();

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
        body: { ...preferences, excludeTitles, swipeContext },
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

  const handleSwipeRight = () => {
    if (recommendations.length === 0) return;
    const liked = recommendations[0];
    setSaved((prev) =>
      prev.some((s) => s.title === liked.title) ? prev : [...prev, liked]
    );
    setSwipeFeedback("like");
    setTimeout(() => setSwipeFeedback(null), 600);
    advanceCard();
  };

  const handleSwipeLeft = () => {
    setSwipeFeedback("skip");
    setTimeout(() => setSwipeFeedback(null), 600);
    advanceCard();
  };

  const advanceCard = () => {
    setRecommendations((prev) => {
      const next = prev.slice(1);
      if (next.length === 0) {
        fetchRecommendations();
      }
      return next;
    });
  };

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

  if (noMorePicks && recommendations.length === 0) {
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
          <SavedList saved={saved} onOpenDetail={openModal} />
        </div>
      </PageWrapper>
    );
  }

  return (
    <>
      <PageWrapper>
        <h2 className="text-3xl sm:text-4xl font-handwritten text-center mb-1">
          Your recommendations! 🎉
        </h2>
        <p className="text-center text-muted-foreground mb-4 font-body text-sm">
          Swipe right to save, left to skip ✨
        </p>

        {/* Swipe feedback toast */}
        <AnimatePresence>
          {swipeFeedback && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full font-bold font-body text-sm shadow-soft ${
                swipeFeedback === "like"
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {swipeFeedback === "like" ? (
                <span className="flex items-center gap-1.5">
                  <Heart size={14} className="fill-current" /> Saved!
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <X size={14} /> Skipped
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Card stack */}
        <div className="relative w-full max-w-sm mx-auto" style={{ height: 440 }}>
          {/* Paper texture background */}
          <div className="absolute inset-0 -m-3 rounded-[2rem] bg-muted/40 border border-border/50" />

          <AnimatePresence>
            {recommendations
              .slice(0, 3)
              .reverse()
              .map((rec, reverseI) => {
                const actualIndex = recommendations.slice(0, 3).length - 1 - reverseI;
                return (
                  <SwipeCard
                    key={rec.title}
                    rec={rec}
                    index={actualIndex}
                    totalCards={Math.min(recommendations.length, 3)}
                    onSwipeLeft={handleSwipeLeft}
                    onSwipeRight={handleSwipeRight}
                    onClick={() => openModal(rec, actualIndex)}
                    isTop={actualIndex === 0}
                  />
                );
              })}
          </AnimatePresence>
        </div>

        {/* Action buttons */}
        <div className="flex justify-center gap-6 mt-5">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSwipeLeft}
            className="p-4 rounded-full bg-muted border-2 border-border shadow-card text-muted-foreground hover:text-destructive transition-colors"
          >
            <X size={22} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSwipeRight}
            className="p-4 rounded-full bg-primary/10 border-2 border-primary/30 shadow-card text-primary hover:bg-primary/20 transition-colors"
          >
            <Heart size={22} />
          </motion.button>
        </div>

        {/* Bottom controls */}
        <div className="mt-5 flex justify-center gap-3">
          <motion.button
            onClick={fetchRecommendations}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-muted text-foreground rounded-full px-5 py-2.5 font-bold font-body text-sm flex items-center gap-2"
          >
            <RefreshCw size={14} /> New picks
          </motion.button>
          <motion.button
            onClick={onRestart}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-primary text-primary-foreground rounded-full px-6 py-2.5 font-bold font-body text-sm shadow-soft"
          >
            Start over 📖
          </motion.button>
        </div>

        <SavedList saved={saved} onOpenDetail={openModal} />

        <div className="mt-3 text-center text-2xl animate-float">
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
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={closeModal}
                className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-background/80 backdrop-blur-sm text-foreground hover:bg-background"
              >
                <X size={18} />
              </motion.button>

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
                <div
                  className={`${selectedRec.image ? "hidden" : ""} w-full h-full bg-gradient-to-br ${placeholderColors[selectedIndex % placeholderColors.length]} flex flex-col items-center justify-center px-6 text-center gap-2`}
                >
                  <span className="text-2xl font-handwritten text-foreground/70 leading-tight">{selectedRec.title}</span>
                  <span className="text-sm font-body text-muted-foreground">{selectedRec.year}</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-card to-transparent" />
              </div>

              <div className="p-5 pt-2 -mt-4 relative z-10">
                <h3 className="text-2xl font-handwritten text-foreground mb-1">
                  {selectedRec.emoji} {selectedRec.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground font-body mb-3">
                  <span>{selectedRec.year}</span>
                  <span>•</span>
                  <span>{selectedRec.genre}</span>
                </div>

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

                <p className="text-sm text-muted-foreground font-body leading-relaxed mb-4">
                  {selectedRec.description}
                </p>

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
