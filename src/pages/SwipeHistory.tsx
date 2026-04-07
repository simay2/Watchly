import { useEffect, useState } from "react";
import { Loader2, Heart, X, Star } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import MovieImage from "@/components/lexicon/MovieImage";

interface HistoryItem {
  id: string;
  title: string;
  genre: string;
  year: string;
  rating: number;
  emoji: string;
  image?: string;
  action: string;
  created_at: string;
}

const SwipeHistory = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "liked" | "skipped">("all");

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("swipe_history")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setHistory(data || []);
      setLoading(false);
    };
    load();
  }, [user]);

  const filtered = filter === "all" ? history : history.filter((h) => h.action === filter);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-lg font-handwritten text-muted-foreground">Loading history... 📜</p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-2 pb-24">
      <h2 className="text-3xl font-handwritten text-center mb-1">Swipe History 📜</h2>
      <p className="text-center text-muted-foreground font-body text-sm mb-4">{history.length} total swipes</p>

      {/* Filter tabs */}
      <div className="flex justify-center gap-2 mb-6">
        {(["all", "liked", "skipped"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full font-body text-sm font-semibold transition-colors ${
              filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {f === "all" ? "All" : f === "liked" ? "❤️ Liked" : "⏭️ Skipped"}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[30vh] gap-3 text-center">
          <span className="text-5xl">🕰️</span>
          <p className="text-xl font-handwritten text-foreground">No swipes yet</p>
          <p className="text-muted-foreground font-body text-sm">Start swiping to build your history!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 max-w-lg mx-auto">
          {filtered.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border"
            >
              <div className={`p-2 rounded-full shrink-0 ${item.action === "liked" ? "bg-accent/20 text-accent-foreground" : "bg-muted text-muted-foreground"}`}>
                {item.action === "liked" ? <Heart size={14} className="fill-current" /> : <X size={14} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold font-body text-foreground text-sm truncate">{item.emoji} {item.title}</p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-body">
                  <span>{item.year}</span>
                  <span>•</span>
                  <span>{item.genre}</span>
                  {item.rating > 0 && (
                    <>
                      <span>•</span>
                      <Star size={10} className="fill-sunshine text-sunshine" />
                      <span>{item.rating}</span>
                    </>
                  )}
                </div>
              </div>
              <span className="text-xs text-muted-foreground font-body shrink-0">
                {new Date(item.created_at).toLocaleDateString()}
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SwipeHistory;
