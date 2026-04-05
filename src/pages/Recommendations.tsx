import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Play, Loader2, RefreshCw, X, ExternalLink, Heart, Sparkles } from "lucide-react";
import PageWrapper from "@/components/lexicon/PageWrapper";
import SwipeCard from "@/components/lexicon/SwipeCard";
import SavedList from "@/components/lexicon/SavedList";
import TasteProfile from "@/components/lexicon/TasteProfile";
import { useTasteProfile } from "@/hooks/useTasteProfile";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSession } from "@/contexts/SessionContext";

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

const placeholderColors = [
  "from-lavender/40 to-secondary/30",
  "from-coral/40 to-peach/30",
  "from-mint/40 to-sky/30",
  "from-sunshine/40 to-coral/30",
  "from-sky/40 to-lavender/30",
  "from-peach/40 to-sunshine/30",
];

const Recommendations = () => {
  const { user } = useAuth();
  const { sessionCompanion, sessionMood, resetSession } = useSession();
  const [preferences, setPreferences] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [prefsLoading, setPrefsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noMorePicks, setNoMorePicks] = useState(false);
  const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [saved, setSaved] = useState<Recommendation[]>([]);
  const [swipeFeedback, setSwipeFeedback] = useState<"like" | "skip" | null>(null);
  const shownTitlesRef = useRef<Set<string>>(new Set());
  const { profile, swipeContext, recordLike, recordDislike } = useTasteProfile();

  // Load user preferences and existing favorites/history
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      // Load preferences
      const { data: prefs } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (prefs) {
        setPreferences({
          viewerType: prefs.viewer_type,
          genres: prefs.genres || [],
          dislikes: prefs.dislikes || [],
          mood: prefs.mood,
          companion: prefs.companion,
          companionContext: prefs.companion_context,
          time: prefs.time,
          surprise: prefs.surprise,
          titleReactions: prefs.title_reactions || {},
          ratings: prefs.ratings || {},
        });
      }

      // Load existing favorites
      const { data: favs } = await supabase
        .from("favorites")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (favs) {
        setSaved(favs.map((f: any) => ({
          title: f.title,
          year: f.year || "",
          emoji: f.emoji || "🎬",
          genre: f.genre || "",
          rating: Number(f.rating) || 0,
          description: f.description || "",
          image: f.image,
          trailerUrl: f.trailer_url,
        })));
      }

      // Load swipe history to exclude already seen
      const { data: history } = await supabase
        .from("swipe_history")
        .select("title")
        .eq("user_id", user.id);

      if (history) {
        history.forEach((h: any) => shownTitlesRef.current.add(h.title.toLowerCase()));
      }

      setPrefsLoading(false);
    };
    load();
  }, [user]);

  const addToShown = (recs: Recommendation[]) => {
    recs.forEach((r) => shownTitlesRef.current.add(r.title.toLowerCase()));
  };

  const filterDuplicates = (recs: Recommendation[]): Recommendation[] => {
    return recs.filter((r) => !shownTitlesRef.current.has(r.title.toLowerCase()));
  };

  const fetchRecommendations = useCallback(async () => {
    if (!preferences) return;
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
  }, [preferences, swipeContext]);

  useEffect(() => {
    if (!prefsLoading && preferences) {
      fetchRecommendations();
    }
  }, [prefsLoading, preferences]);

  const saveSwipeToDb = async (rec: Recommendation, action: "liked" | "skipped") => {
    if (!user) return;
    await supabase.from("swipe_history").insert({
      user_id: user.id,
      title: rec.title,
      genre: rec.genre,
      year: rec.year,
      rating: rec.rating,
      description: rec.description,
      emoji: rec.emoji,
      image: rec.image,
      trailer_url: rec.trailerUrl,
      action,
    });
  };

  const saveFavoriteToDb = async (rec: Recommendation) => {
    if (!user) return;
    await supabase.from("favorites").insert({
      user_id: user.id,
      title: rec.title,
      genre: rec.genre,
      year: rec.year,
      rating: rec.rating,
      description: rec.description,
      emoji: rec.emoji,
      image: rec.image,
      trailer_url: rec.trailerUrl,
    });
  };

  const handleSwipeRight = () => {
    if (recommendations.length === 0) return;
    const likedItem = recommendations[0];
    const isNew = !saved.some((s) => s.title === likedItem.title);
    if (isNew) {
      setSaved((prev) => [likedItem, ...prev]);
      saveFavoriteToDb(likedItem);
    }
    saveSwipeToDb(likedItem, "liked");
    recordLike(likedItem);
    setSwipeFeedback("like");
    setTimeout(() => setSwipeFeedback(null), 600);
    advanceCard();
  };

  const handleSwipeLeft = () => {
    if (recommendations.length > 0) {
      saveSwipeToDb(recommendations[0], "skipped");
      recordDislike(recommendations[0]);
    }
    setSwipeFeedback("skip");
    setTimeout(() => setSwipeFeedback(null), 600);
    advanceCard();
  };

  const advanceCard = () => {
    setRecommendations((prev) => {
      const next = prev.slice(1);
      if (next.length === 0) fetchRecommendations();
      return next;
    });
  };

  const openModal = (rec: Recommendation, index: number) => {
    setSelectedRec(rec);
    setSelectedIndex(index);
  };
  const closeModal = () => setSelectedRec(null);

  const openTrailer = (rec: Recommendation) => {
    const url = rec.trailerUrl || `https://www.youtube.com/results?search_query=${encodeURIComponent(rec.title + " " + rec.year + " official trailer")}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (prefsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-lg font-handwritten text-muted-foreground">Loading your diary... 📖</p>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <span className="text-5xl">📖</span>
        <p className="text-xl font-handwritten text-foreground">No preferences found!</p>
        <p className="text-muted-foreground font-body">Complete your onboarding quiz first.</p>
      </div>
    );
  }

  if (loading && recommendations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-lg font-handwritten text-muted-foreground">Finding your perfect picks... 🎬✨</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-lg font-handwritten text-destructive">Oops! {error}</p>
        <motion.button onClick={fetchRecommendations} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-6 py-3 font-bold font-body">
          <RefreshCw size={16} /> Try again
        </motion.button>
      </div>
    );
  }

  if (noMorePicks && recommendations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <span className="text-5xl">🍿</span>
        <p className="text-xl font-handwritten text-foreground">No more fresh picks!</p>
        <p className="text-muted-foreground font-body">Try "New picks" to explore more ✨</p>
        <motion.button onClick={() => { shownTitlesRef.current.clear(); fetchRecommendations(); }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-primary text-primary-foreground rounded-full px-8 py-3 font-bold font-body shadow-soft mt-2">
          Reset & discover 🔄
        </motion.button>
      </div>
    );
  }

  return (
    <>
      <div className="px-4 pt-2 pb-24">
        <h2 className="text-3xl sm:text-4xl font-handwritten text-center mb-1">Your recommendations! 🎉</h2>
        <p className="text-center text-muted-foreground mb-4 font-body text-sm">Swipe right to save, left to skip ✨</p>

        <AnimatePresence>
          {swipeFeedback && (
            <motion.div initial={{ opacity: 0, y: -10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10 }} className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full font-bold font-body text-sm shadow-soft ${swipeFeedback === "like" ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>
              {swipeFeedback === "like" ? <span className="flex items-center gap-1.5"><Heart size={14} className="fill-current" /> Saved!</span> : <span className="flex items-center gap-1.5"><X size={14} /> Skipped</span>}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative w-full max-w-sm mx-auto" style={{ height: 440 }}>
          <div className="absolute inset-0 -m-3 rounded-[2rem] bg-muted/40 border border-border/50" />
          <AnimatePresence>
            {recommendations.slice(0, 3).reverse().map((rec, reverseI) => {
              const actualIndex = recommendations.slice(0, 3).length - 1 - reverseI;
              return (
                <SwipeCard key={rec.title} rec={rec} index={actualIndex} totalCards={Math.min(recommendations.length, 3)} onSwipeLeft={handleSwipeLeft} onSwipeRight={handleSwipeRight} onClick={() => openModal(rec, actualIndex)} isTop={actualIndex === 0} />
              );
            })}
          </AnimatePresence>
        </div>

        <div className="flex justify-center gap-6 mt-5">
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleSwipeLeft} className="p-4 rounded-full bg-muted border-2 border-border shadow-card text-muted-foreground hover:text-destructive transition-colors"><X size={22} /></motion.button>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleSwipeRight} className="p-4 rounded-full bg-primary/10 border-2 border-primary/30 shadow-card text-primary hover:bg-primary/20 transition-colors"><Heart size={22} /></motion.button>
        </div>

        <div className="mt-5 flex justify-center">
          <motion.button onClick={fetchRecommendations} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-muted text-foreground rounded-full px-5 py-2.5 font-bold font-body text-sm flex items-center gap-2">
            <RefreshCw size={14} /> New picks
          </motion.button>
        </div>

        <TasteProfile profile={profile} />
        <SavedList saved={saved} onOpenDetail={openModal} />
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedRec && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm" onClick={closeModal}>
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="bg-card rounded-3xl shadow-lg max-w-sm w-full overflow-hidden relative" onClick={(e) => e.stopPropagation()}>
              <motion.button whileTap={{ scale: 0.9 }} onClick={closeModal} className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-background/80 backdrop-blur-sm text-foreground hover:bg-background"><X size={18} /></motion.button>
              <div className="relative w-full h-48 sm:h-56 overflow-hidden">
                {selectedRec.image ? <img src={selectedRec.image} alt={selectedRec.title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} /> : null}
                <div className={`${selectedRec.image ? "hidden" : ""} w-full h-full bg-gradient-to-br ${placeholderColors[selectedIndex % placeholderColors.length]} flex flex-col items-center justify-center px-6 text-center gap-2`}>
                  <span className="text-2xl font-handwritten text-foreground/70 leading-tight">{selectedRec.title}</span>
                  <span className="text-sm font-body text-muted-foreground">{selectedRec.year}</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-card to-transparent" />
              </div>
              <div className="p-5 pt-2 -mt-4 relative z-10">
                <h3 className="text-2xl font-handwritten text-foreground mb-1">{selectedRec.emoji} {selectedRec.title}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground font-body mb-3">
                  <span>{selectedRec.year}</span><span>•</span><span>{selectedRec.genre}</span>
                </div>
                <div className="flex items-center gap-1.5 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={16} className={i < Math.round(selectedRec.rating) ? "fill-sunshine text-sunshine" : "text-muted"} />)}
                  <span className="text-sm font-bold font-body text-foreground ml-1">{selectedRec.rating}</span>
                </div>
                <p className="text-sm text-muted-foreground font-body leading-relaxed mb-4">{selectedRec.description}</p>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => openTrailer(selectedRec)} className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-full py-3 font-bold font-body shadow-soft">
                  <Play size={16} className="fill-current" /> Watch Trailer <ExternalLink size={14} />
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Recommendations;
