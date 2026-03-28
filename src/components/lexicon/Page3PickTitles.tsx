import { motion } from "framer-motion";
import { Heart, Star, SkipForward } from "lucide-react";
import PageWrapper from "./PageWrapper";

interface Page3Props {
  reactions: Record<string, string>;
  onChange: (reactions: Record<string, string>) => void;
}

const titles = [
  { name: "Friends", emoji: "☕", year: "1994" },
  { name: "Stranger Things", emoji: "🔦", year: "2016" },
  { name: "Interstellar", emoji: "🌌", year: "2014" },
  { name: "Harry Potter", emoji: "⚡", year: "2001" },
  { name: "The Office", emoji: "📎", year: "2005" },
  { name: "Breaking Bad", emoji: "🧪", year: "2008" },
  { name: "The Lion King", emoji: "🦁", year: "1994" },
  { name: "Inception", emoji: "🌀", year: "2010" },
];

const Page3PickTitles = ({ reactions, onChange }: Page3Props) => {
  const setReaction = (title: string, reaction: string) => {
    const current = reactions[title];
    onChange({
      ...reactions,
      [title]: current === reaction ? "" : reaction,
    });
  };

  return (
    <PageWrapper>
      <h2 className="text-3xl sm:text-4xl font-handwritten text-center mb-2">
        Pick what you love 💖
      </h2>
      <p className="text-center text-muted-foreground mb-6 font-body">
        Heart, star, or skip!
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {titles.map((t) => (
          <motion.div
            key={t.name}
            whileHover={{ scale: 1.02 }}
            className="bg-muted/50 rounded-2xl p-4 flex items-center gap-3 border border-border"
          >
            <span className="text-2xl">{t.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold font-body text-foreground text-xs sm:text-sm leading-tight line-clamp-2">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.year}</p>
            </div>
            <div className="flex gap-1">
              <motion.button
                whileTap={{ scale: 0.8 }}
                onClick={() => setReaction(t.name, "heart")}
                className={`p-1.5 rounded-full transition-colors ${
                  reactions[t.name] === "heart" ? "bg-coral/30" : "hover:bg-muted"
                }`}
              >
                <Heart
                  size={18}
                  className={reactions[t.name] === "heart" ? "fill-coral text-coral" : "text-muted-foreground"}
                />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.8 }}
                onClick={() => setReaction(t.name, "star")}
                className={`p-1.5 rounded-full transition-colors ${
                  reactions[t.name] === "star" ? "bg-sunshine/30" : "hover:bg-muted"
                }`}
              >
                <Star
                  size={18}
                  className={reactions[t.name] === "star" ? "fill-sunshine text-sunshine" : "text-muted-foreground"}
                />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.8 }}
                onClick={() => setReaction(t.name, "skip")}
                className={`p-1.5 rounded-full transition-colors ${
                  reactions[t.name] === "skip" ? "bg-muted" : "hover:bg-muted"
                }`}
              >
                <SkipForward
                  size={18}
                  className={reactions[t.name] === "skip" ? "text-foreground" : "text-muted-foreground"}
                />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </PageWrapper>
  );
};

export default Page3PickTitles;
