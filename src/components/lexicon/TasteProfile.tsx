import { motion } from "framer-motion";
import { Sparkles, Heart, ThumbsDown, TrendingUp } from "lucide-react";
import type { TasteProfileData } from "@/hooks/useTasteProfile";

interface TasteProfileProps {
  profile: TasteProfileData;
}

const TasteProfile = ({ profile }: TasteProfileProps) => {
  const { totalLiked, totalDisliked, topGenres, summary, avgLikedRating } = profile;

  if (totalLiked + totalDisliked < 2) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="w-full max-w-sm mx-auto mt-4"
    >
      <div className="bg-card/90 backdrop-blur-sm rounded-2xl border-2 border-lavender/30 p-4 shadow-card">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-primary" />
          <h4 className="text-base font-handwritten text-foreground">Your taste profile</h4>
        </div>

        {/* Summary text */}
        <p className="text-sm font-body text-muted-foreground leading-relaxed mb-3">
          {summary}
        </p>

        {/* Stats row */}
        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-1.5 text-xs font-body text-accent-foreground">
            <Heart size={12} className="text-primary fill-primary" />
            <span className="font-bold">{totalLiked}</span>
            <span className="text-muted-foreground">liked</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-body text-muted-foreground">
            <ThumbsDown size={12} />
            <span className="font-bold">{totalDisliked}</span>
            <span>skipped</span>
          </div>
          {avgLikedRating > 0 && (
            <div className="flex items-center gap-1.5 text-xs font-body text-muted-foreground">
              <TrendingUp size={12} className="text-sunshine" />
              <span className="font-bold">{avgLikedRating}</span>
              <span>avg rating</span>
            </div>
          )}
        </div>

        {/* Top genres */}
        {topGenres.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {topGenres.map((genre) => (
              <motion.span
                key={genre}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="px-2.5 py-1 rounded-full text-xs font-body font-semibold bg-primary/10 text-primary border border-primary/20"
              >
                {genre}
              </motion.span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TasteProfile;
