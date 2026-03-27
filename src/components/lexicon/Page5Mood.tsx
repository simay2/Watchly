import PageWrapper from "./PageWrapper";
import StickerButton from "./StickerButton";

interface Page5Props {
  value: string | null;
  onChange: (v: string) => void;
}

const moods = [
  { label: "Funny", emoji: "😂", color: "sunshine" },
  { label: "Light", emoji: "☀️", color: "peach" },
  { label: "Intense", emoji: "🔥", color: "coral" },
  { label: "Emotional", emoji: "🥺", color: "lavender" },
  { label: "Thought-provoking", emoji: "🧠", color: "mint" },
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
      <div className="flex flex-wrap gap-4 justify-center">
        {moods.map((m) => (
          <StickerButton
            key={m.label}
            label={m.label}
            emoji={m.emoji}
            color={m.color}
            selected={value === m.label}
            onClick={() => onChange(m.label)}
            className="text-lg px-6 py-4"
          />
        ))}
      </div>
    </PageWrapper>
  );
};

export default Page5Mood;
