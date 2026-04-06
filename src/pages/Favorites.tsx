import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Play, Loader2, Trash2, X, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

interface FavoriteItem {
  id: string;
  title: string;
  genre: string;
  year: string;
  rating: number;
  description: string;
  emoji: string;
  image?: string;
  trailer_url?: string;
  companion_context?: string | null;
  session_mood?: string | null;
}

const contextEmojis: Record<string, string> = {
  alone: "🧘",
  partner: "💕",
  friends: "🎉",
  family: "🏠",
};

const filters = [
  { label: "All", value: "all" },
  { label: "🧘 Alone", value: "alone" },
  { label: "💕 Partner", value: "partner" },
  { label: "🎉 Friends", value: "friends" },
  { label: "🏠 Family", value: "family" },
];

const Favorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<FavoriteItem | null>(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("favorites")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setFavorites(data || []);
      setLoading(false);
    };
    load();
  }, [user]);

  const removeFavorite = async (id: string) => {
    await supabase.from("favorites").delete().eq("id", id);
    setFavorites((prev) => prev.filter((f) => f.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const filtered = filter === "all" ? favorites : favorites.filter((f) => f.companion_context === filter);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-lg font-handwritten text-muted-foreground">Loading favorites... 💖</p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-2 pb-24">
      <h2 className="text-3xl font-handwritten text-center mb-1">My Favorites 💖</h2>
      <p className="text-center text-muted-foreground font-body text-sm mb-4">
        {favorites.length} {favorites.length === 1 ? "movie" : "movies"} saved
      </p>

      {/* Filter bar */}
      <div className="flex gap-2 justify-center flex-wrap mb-6">
        {filters.map((f) => (
          <motion.button
            key={f.value}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-body font-semibold border-2 transition-all ${
              filter === f.value
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary/40"
            }`}
          >
            {f.label}
          </motion.button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-center">
          <span className="text-5xl">💔</span>
          <p className="text-xl font-handwritten text-foreground">
            {filter === "all" ? "No favorites yet" : "No favorites for this vibe"}
          </p>
          <p className="text-muted-foreground font-body text-sm">
            {filter === "all"
              ? "Swipe right on movies you love to save them here!"
              : "Try a different filter or save more movies!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
          {filtered.map((fav, i) => (
            <motion.div
              key={fav.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelected(fav)}
              className="flex items-center gap-3 p-3 bg-card rounded-2xl border border-border cursor-pointer hover:shadow-card transition-shadow"
            >
              {fav.image ? (
                <img src={fav.image} alt={fav.title} className="w-14 h-20 rounded-xl object-cover shrink-0" />
              ) : (
                <div className="w-14 h-20 rounded-xl bg-gradient-to-br from-lavender/40 to-secondary/30 flex items-center justify-center shrink-0">
                  <span className="text-2xl">{fav.emoji}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold font-body text-foreground text-sm truncate">{fav.title}</p>
                <p className="text-xs text-muted-foreground font-body">{fav.year} • {fav.genre}</p>
                <div className="flex items-center gap-1 mt-1">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <Star key={si} size={10} className={si < Math.round(fav.rating) ? "fill-sunshine text-sunshine" : "text-muted"} />
                  ))}
                </div>
                <div className="flex gap-1 mt-1.5 flex-wrap">
                  {fav.companion_context && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                      {contextEmojis[fav.companion_context] || ""} {fav.companion_context}
                    </Badge>
                  )}
                  {fav.session_mood && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                      {fav.session_mood}
                    </Badge>
                  )}
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.stopPropagation(); removeFavorite(fav.id); }}
                className="p-2 rounded-full text-muted-foreground hover:text-destructive transition-colors shrink-0"
              >
                <Trash2 size={14} />
              </motion.button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Detail modal */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm" onClick={() => setSelected(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-card rounded-3xl shadow-lg max-w-sm w-full overflow-hidden relative" onClick={(e) => e.stopPropagation()}>
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setSelected(null)} className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-background/80 text-foreground"><X size={18} /></motion.button>
              <div className="p-6">
                <h3 className="text-2xl font-handwritten text-foreground mb-2">{selected.emoji} {selected.title}</h3>
                <p className="text-sm text-muted-foreground font-body mb-2">{selected.year} • {selected.genre}</p>
                <div className="flex items-center gap-1.5 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={16} className={i < Math.round(selected.rating) ? "fill-sunshine text-sunshine" : "text-muted"} />)}
                </div>
                <div className="flex gap-1.5 mb-3 flex-wrap">
                  {selected.companion_context && (
                    <Badge variant="secondary" className="text-xs">
                      {contextEmojis[selected.companion_context] || ""} {selected.companion_context}
                    </Badge>
                  )}
                  {selected.session_mood && (
                    <Badge variant="outline" className="text-xs">
                      {selected.session_mood}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground font-body leading-relaxed mb-4">{selected.description}</p>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => {
                  const url = selected.trailer_url || `https://www.youtube.com/results?search_query=${encodeURIComponent(selected.title + " " + selected.year + " official trailer")}`;
                  window.open(url, "_blank", "noopener,noreferrer");
                }} className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-full py-3 font-bold font-body shadow-soft">
                  <Play size={16} className="fill-current" /> Watch Trailer <ExternalLink size={14} />
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Favorites;
