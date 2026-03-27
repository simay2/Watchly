import { motion } from "framer-motion";
import PageWrapper from "./PageWrapper";
import StickerButton from "./StickerButton";

interface Page2Props {
  selected: string[];
  onChange: (genres: string[]) => void;
}

const genres = [
  { label: "Comedy", emoji: "😂", color: "sunshine" },
  { label: "Romance", emoji: "💕", color: "coral" },
  { label: "Horror", emoji: "👻", color: "lavender" },
  { label: "Sci-Fi", emoji: "🚀", color: "sky" },
  { label: "Thriller", emoji: "🔪", color: "blush" },
  { label: "Fantasy", emoji: "🧙", color: "mint" },
  { label: "Crime", emoji: "🕵️", color: "peach" },
  { label: "Drama", emoji: "🎭", color: "lavender" },
  { label: "Animation", emoji: "🎨", color: "sunshine" },
];

const Page2Genres = ({ selected, onChange }: Page2Props) => {
  const toggle = (genre: string) => {
    if (selected.includes(genre)) {
      onChange(selected.filter((g) => g !== genre));
    } else if (selected.length < 5) {
      onChange([...selected, genre]);
    }
  };

  return (
    <PageWrapper>
      <h2 className="text-3xl sm:text-4xl font-handwritten text-center mb-2">
        Choose your favorite genres 🎭
      </h2>
      <p className="text-center text-muted-foreground mb-6 font-body">
        Pick up to 5!{" "}
        <motion.span
          key={selected.length}
          initial={{ scale: 1.5 }}
          animate={{ scale: 1 }}
          className="font-bold text-primary"
        >
          {selected.length}/5
        </motion.span>
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        {genres.map((g) => (
          <StickerButton
            key={g.label}
            label={g.label}
            emoji={g.emoji}
            color={g.color}
            selected={selected.includes(g.label)}
            onClick={() => toggle(g.label)}
          />
        ))}
      </div>
    </PageWrapper>
  );
};

export default Page2Genres;
