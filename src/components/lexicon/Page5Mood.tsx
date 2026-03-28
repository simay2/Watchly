import { motion } from "framer-motion";
import PageWrapper from "./PageWrapper";

interface Page5Props {
  value: string | null;
  onChange: (v: string) => void;
}

const moods = [
  { label: "Comfort watch", emoji: "💅", color: "bg-peach/20 border-peach" },
  { label: "Just vibes", emoji: "🍿", color: "bg-sunshine/20 border-sunshine" },
  { label: "I need drama", emoji: "🔥", color: "bg-coral/20 border-coral" },
  { label: "Make me cry", emoji: "😭", color: "bg-lavender/20 border-lavender" },
  { label: "Big brain mood", emoji: "🧠", color: "bg-mint/20 border-mint" },
  { label: "Main character energy", emoji: "✨", color: "bg-sky/20 border-sky" },
  { label: "Plot twist me", emoji: "👀", color: "bg-coral/20 border-coral" },
];

const Page5Mood = ({ value, onChange }: Page5Props) => {
  return (
    <PageWrapper>
      <h2 className="text-3xl sm:text-4xl font-handwritten text-center mb-2">
        How do you feel today? 🌈
      </h2>
      <p className="text-center text-muted-foreground mb-6 font-body">
        Pick your vibe!
      </p>
      <div className="flex flex-wrap gap-3 justify-center max-w-md mx-auto">
        {moods.map((m) => {
          const isSelected = value === m.label;
          return (
            <motion.button
              key={m.label}
              onClick={() => onChange(m.label)}
              whileTap={{ scale: 0.93 }}
              animate={isSelected ? { scale: 1.08 } : { scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className={`rounded-full border-2 px-5 py-3 font-body font-semibold text-sm flex items-center gap-2 transition-shadow ${m.color} ${
                isSelected
                  ? "ring-2 ring-primary/40 shadow-md"
                  : "hover:shadow-sm"
              }`}
            >
              <span className="text-lg">{m.emoji}</span>
              {m.label}
            </motion.button>
          );
        })}
      </div>
    </PageWrapper>
  );
};

export default Page5Mood;
