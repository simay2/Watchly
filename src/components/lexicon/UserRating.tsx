import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";

interface UserRatingProps {
  rating: number | null;
  onRate: (rating: number) => void;
  disabled?: boolean;
  size?: number;
  compact?: boolean;
}

const UserRating = ({ rating, onRate, disabled = false, size = 18, compact = false }: UserRatingProps) => {
  const [hovered, setHovered] = useState(0);

  if (disabled) {
    return compact ? null : (
      <p className="text-[10px] text-muted-foreground/50 font-body italic">
        Mark as watched to rate ✨
      </p>
    );
  }

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={(e) => {
            e.stopPropagation();
            onRate(star);
          }}
          whileTap={{ scale: 0.7, rotate: -15 }}
          whileHover={{ scale: 1.2 }}
          className="focus:outline-none p-0.5"
        >
          <Star
            size={size}
            className={`transition-colors duration-150 ${
              star <= (hovered || rating || 0)
                ? "fill-sunshine text-sunshine"
                : "fill-transparent text-muted-foreground/30"
            }`}
          />
        </motion.button>
      ))}
      <AnimatePresence>
        {rating && !compact && (
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-[10px] font-body text-muted-foreground ml-1"
          >
            {rating}/5
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserRating;
