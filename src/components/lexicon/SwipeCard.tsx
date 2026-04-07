import { useState } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Star, Heart, X } from "lucide-react";
import MovieImage from "@/components/lexicon/MovieImage";

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

interface SwipeCardProps {
  rec: Recommendation;
  index: number;
  totalCards: number;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onClick: () => void;
  isTop: boolean;
}

const placeholderGradients = [
  "from-lavender/40 to-secondary/30",
  "from-coral/40 to-peach/30",
  "from-mint/40 to-sky/30",
  "from-sunshine/40 to-coral/30",
  "from-sky/40 to-lavender/30",
  "from-peach/40 to-sunshine/30",
];

const SWIPE_THRESHOLD = 100;

const SwipeCard = ({
  rec,
  index,
  totalCards,
  onSwipeLeft,
  onSwipeRight,
  onClick,
  isTop,
}: SwipeCardProps) => {
  const [exiting, setExiting] = useState<"left" | "right" | null>(null);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-12, 12]);
  const likeOpacity = useTransform(x, [0, 80], [0, 1]);
  const skipOpacity = useTransform(x, [-80, 0], [1, 0]);

  const stackOffset = Math.min(index, 2);
  const scale = 1 - stackOffset * 0.05;
  const yOffset = stackOffset * 8;

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > SWIPE_THRESHOLD) {
      setExiting("right");
      setTimeout(onSwipeRight, 300);
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      setExiting("left");
      setTimeout(onSwipeLeft, 300);
    }
  };

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{
        zIndex: totalCards - index,
        scale,
        y: yOffset,
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={
        exiting === "right"
          ? { x: 400, rotate: 20, opacity: 0 }
          : exiting === "left"
          ? { x: -400, rotate: -20, opacity: 0 }
          : { opacity: 1, scale, y: yOffset }
      }
      transition={
        exiting
          ? { duration: 0.3, ease: "easeOut" }
          : { type: "spring", stiffness: 300, damping: 25, delay: index * 0.05 }
      }
    >
      <motion.div
        drag={isTop ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.8}
        onDragEnd={isTop ? handleDragEnd : undefined}
        style={{ x: isTop ? x : 0, rotate: isTop ? rotate : 0 }}
        onClick={isTop ? onClick : undefined}
        className="w-full h-full"
      >
        <div className="relative w-full h-full bg-card rounded-3xl shadow-soft border-2 border-border overflow-hidden flex flex-col">
          {/* Swipe feedback overlays */}
          {isTop && (
            <>
              <motion.div
                style={{ opacity: likeOpacity }}
                className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none rounded-3xl bg-accent/10 backdrop-blur-[1px]"
              >
                <div className="bg-accent rounded-full p-4 shadow-soft">
                  <Heart size={40} className="text-accent-foreground fill-current" />
                </div>
              </motion.div>
              <motion.div
                style={{ opacity: skipOpacity }}
                className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none rounded-3xl bg-destructive/10 backdrop-blur-[1px]"
              >
                <div className="bg-destructive/20 rounded-full p-4">
                  <X size={40} className="text-destructive" />
                </div>
              </motion.div>
            </>
          )}

          {/* Poster */}
          <div className="relative w-full h-52 sm:h-64 overflow-hidden shrink-0">
            <MovieImage
              src={rec.image}
              alt={rec.title}
              emoji={rec.emoji}
              fallbackGradient={placeholderGradients[index % placeholderGradients.length]}
            />
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card to-transparent" />
          </div>

          {/* Info */}
          <div className="p-4 sm:p-5 flex-1 flex flex-col gap-2 min-h-0">
            <h3 className="text-xl sm:text-2xl font-handwritten text-foreground leading-tight truncate">
              {rec.emoji} {rec.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-body">
              <span>{rec.year}</span>
              <span>•</span>
              <span>{rec.genre}</span>
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={
                    i < Math.round(rec.rating)
                      ? "fill-sunshine text-sunshine"
                      : "text-muted"
                  }
                />
              ))}
              <span className="text-sm font-bold font-body text-foreground ml-1">{rec.rating}</span>
            </div>
            <p className="text-sm text-muted-foreground font-body leading-relaxed line-clamp-3 flex-1">
              {rec.description}
            </p>
            {isTop && (
              <p className="text-xs text-muted-foreground/60 font-body text-center mt-auto pt-1">
                ← skip · tap for details · save →
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SwipeCard;
