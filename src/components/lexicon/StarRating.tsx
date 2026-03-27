import { useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  onRate: (rating: number) => void;
  size?: number;
}

const StarRating = ({ rating, onRate, size = 32 }: StarRatingProps) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onRate(star)}
          whileTap={{ scale: 0.8, rotate: -20 }}
          whileHover={{ scale: 1.2 }}
          className="focus:outline-none"
        >
          <Star
            size={size}
            className={`transition-colors duration-200 ${
              star <= (hovered || rating)
                ? "fill-sunshine text-sunshine"
                : "fill-transparent text-muted-foreground/30"
            }`}
          />
        </motion.button>
      ))}
    </div>
  );
};

export default StarRating;
