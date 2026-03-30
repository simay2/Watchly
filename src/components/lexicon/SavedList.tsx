import { motion, AnimatePresence } from "framer-motion";
import { Heart, Star, Play, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

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

interface SavedListProps {
  saved: Recommendation[];
  onOpenDetail: (rec: Recommendation, index: number) => void;
}

const SavedList = ({ saved, onOpenDetail }: SavedListProps) => {
  const [expanded, setExpanded] = useState(false);

  if (saved.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-sm mx-auto mt-4"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-card rounded-2xl border-2 border-primary/20 shadow-card font-body text-foreground"
      >
        <span className="flex items-center gap-2 font-bold text-sm">
          <Heart size={16} className="text-primary fill-primary" />
          Saved ({saved.length})
        </span>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-2 pt-2">
              {saved.map((rec, i) => (
                <motion.div
                  key={rec.title}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => onOpenDetail(rec, i)}
                  className="flex items-center gap-3 p-3 bg-card/80 rounded-xl border border-border cursor-pointer hover:shadow-card transition-shadow"
                >
                  <span className="text-xl shrink-0">{rec.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold font-body text-foreground text-sm truncate">{rec.title}</p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span>{rec.year}</span>
                      <span>•</span>
                      <Star size={10} className="fill-sunshine text-sunshine" />
                      <span>{rec.rating}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const url = rec.trailerUrl || `https://www.youtube.com/results?search_query=${encodeURIComponent(rec.title + " " + rec.year + " official trailer")}`;
                      window.open(url, "_blank", "noopener,noreferrer");
                    }}
                    className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 shrink-0"
                  >
                    <Play size={12} className="text-primary" />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SavedList;
