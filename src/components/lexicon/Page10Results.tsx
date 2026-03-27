import { motion } from "framer-motion";
import { Heart, Star, Clock, Play } from "lucide-react";
import PageWrapper from "./PageWrapper";

interface Page10Props {
  preferences: {
    viewerType: string | null;
    genres: string[];
    mood: string | null;
    companion: string | null;
    time: string | null;
    surprise: string | null;
  };
  onRestart: () => void;
}

const recommendations = [
  {
    title: "Everything Everywhere All at Once",
    year: "2022",
    emoji: "🥟",
    genre: "Sci-Fi / Comedy",
    rating: 4.8,
    color: "bg-lavender/20 border-lavender",
  },
  {
    title: "The Grand Budapest Hotel",
    year: "2014",
    emoji: "🏨",
    genre: "Comedy / Drama",
    rating: 4.5,
    color: "bg-coral/20 border-coral",
  },
  {
    title: "Spirited Away",
    year: "2001",
    emoji: "🐉",
    genre: "Animation / Fantasy",
    rating: 4.9,
    color: "bg-mint/20 border-mint",
  },
  {
    title: "Parasite",
    year: "2019",
    emoji: "🪜",
    genre: "Thriller / Drama",
    rating: 4.7,
    color: "bg-sunshine/20 border-sunshine",
  },
  {
    title: "La La Land",
    year: "2016",
    emoji: "🌃",
    genre: "Romance / Musical",
    rating: 4.4,
    color: "bg-sky/20 border-sky",
  },
  {
    title: "Knives Out",
    year: "2019",
    emoji: "🔪",
    genre: "Mystery / Comedy",
    rating: 4.3,
    color: "bg-peach/20 border-peach",
  },
];

const Page10Results = ({ onRestart }: Page10Props) => {
  return (
    <PageWrapper>
      <h2 className="text-3xl sm:text-4xl font-handwritten text-center mb-2">
        Your recommendations! 🎉
      </h2>
      <p className="text-center text-muted-foreground mb-6 font-body">
        Based on your diary, here's what we found ✨
      </p>
      <div className="flex flex-col gap-3">
        {recommendations.map((rec, i) => (
          <motion.div
            key={rec.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
            className={`rounded-2xl p-4 border-2 ${rec.color} flex items-center gap-3`}
          >
            <span className="text-3xl">{rec.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="font-bold font-body text-foreground truncate">{rec.title}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{rec.year}</span>
                <span>•</span>
                <span>{rec.genre}</span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1">
                <Star size={14} className="fill-sunshine text-sunshine" />
                <span className="text-sm font-bold text-foreground">{rec.rating}</span>
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="p-1.5 rounded-full bg-primary/10 hover:bg-primary/20"
              >
                <Play size={14} className="text-primary" />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="mt-6 flex justify-center gap-3">
        <motion.button
          onClick={onRestart}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-primary text-primary-foreground rounded-full px-8 py-3 font-bold font-body shadow-soft"
        >
          Start over 📖
        </motion.button>
      </div>
      <div className="mt-4 text-center text-2xl animate-float">
        🍿 🎬 ⭐ 💖
      </div>
    </PageWrapper>
  );
};

export default Page10Results;
